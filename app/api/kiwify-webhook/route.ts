import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { enviarPurchaseGA4 } from '../../../lib/ga4'
import { enviarPurchaseMeta } from '../../../lib/meta-capi'
import { avisarVenda } from '../../../lib/avisar-venda'
import { premiarIndicador } from '../../../lib/indicacao-premio'
import { avisarWebhookRecusado } from '../../../lib/avisar-webhook-recusado'

// Webhook da Kiwify: libera/revoga o Premium conforme os eventos de pagamento.
// Configure na Kiwify a URL: https://vonai.com.br/api/kiwify-webhook?token=SEU_TOKEN
// e assine TODOS os eventos (aprovada, reembolso, chargeback, cancelamento, atraso, renovação).
//
// Regras (espelham o revenuecat-webhook):
// - pago/renovado  → is_premium true + premium_expira = fim do ciclo pago (+folga)
// - reembolso/chargeback → revoga NA HORA
// - cancelamento/atraso  → NÃO revoga: o aluno pagou o ciclo; só grava premium_expira e o
//   acesso termina sozinho quando a data passa (a Kiwify não manda evento de expiração —
//   a data faz o papel do EXPIRATION do RevenueCat).

// Ordem importa: reembolso antes de cancelamento antes de pago — eventos de assinatura
// carregam order_status 'paid' do pedido original, então um refund também "parece" pago.
export function classificarEvento(tipo: string): 'reembolso' | 'cancelamento' | 'pago' | null {
  if (/(refund|reembols|charge_?back)/.test(tipo)) return 'reembolso'
  if (/(cancel|expired|expirad|late|atras)/.test(tipo)) return 'cancelamento'
  if (/(approved|aprovad|paid|complet|renew|active|ativa)/.test(tipo)) return 'pago'
  return null
}

export function acharEmail(b: any): string | null {
  if (!b || typeof b !== 'object') return null
  return (
    b?.Customer?.email || b?.customer?.email || b?.buyer?.email ||
    b?.Customer?.Email || b?.email || b?.buyer_email || b?.customer_email || null
  )
}

// PEGADINHA: eventos de assinatura podem chegar com order_status 'paid' do pedido original.
// O TIPO do evento decide; order_status é só o último recurso (pedido avulso sem tipo).
export function acharTipo(b: any): string {
  return String(
    b?.webhook_event_type || b?.event || b?.Subscription?.status || b?.order_status || b?.status || ''
  ).toLowerCase()
}

// s1 = id do aluno, que o app manda no link do checkout (?s1=<user_id>) e a Kiwify devolve
// no webhook junto com os parâmetros de tracking (s1..s5). O formato exato do campo varia
// entre versões do payload, então varremos os caminhos conhecidos e só aceitamos UUID —
// qualquer outra coisa (utm colada errada, vazio) é ignorada e cai no casamento por e-mail.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
export function extrairS1(b: any): string | null {
  if (!b || typeof b !== 'object') return null
  const candidatos = [
    b?.TrackingParameters?.s1, b?.trackingParameters?.s1, b?.tracking_parameters?.s1,
    b?.tracking?.s1, b?.Tracking?.s1,
    b?.Subscription?.tracking?.s1, b?.Subscription?.TrackingParameters?.s1,
    b?.subscription?.tracking?.s1,
    b?.Order?.TrackingParameters?.s1, b?.order?.tracking?.s1,
    b?.s1, b?.S1, b?.src, b?.sck,
  ]
  for (const c of candidatos) {
    const v = String(c ?? '').trim()
    if (v && UUID_RE.test(v)) return v.toLowerCase()
  }
  return null
}

// O plano é anual? (pela descrição do produto/frequência no payload)
export function ehAnual(b: any): boolean {
  const pista = (JSON.stringify(b?.Product || b?.product || {}) + ' ' + String(b?.Subscription?.plan?.frequency || '')).toLowerCase()
  return /(anual|year|yearly)/.test(pista)
}

// Fim do ciclo já pago: next_payment da assinatura quando vier; senão assume mensal.
// +3 dias de folga para o webhook de renovação chegar antes de o acesso cair.
export function acharExpiracao(b: any): string {
  const next = b?.Subscription?.next_payment || b?.subscription?.next_payment
  const d = next ? new Date(next) : null
  if (d && !isNaN(d.getTime()) && d.getTime() > Date.now()) {
    return new Date(d.getTime() + 3 * 86400000).toISOString()
  }
  return new Date(Date.now() + (ehAnual(b) ? 366 : 34) * 86400000).toISOString()
}

// Diário de bordo do webhook. Sem isto, uma chamada RECUSADA (401) some sem deixar
// rastro nenhum: foi assim que a 1ª venda no Android (17/08) ficou paga e sem Premium —
// pagamentos_pendentes só registra o que já passou pela autenticação, então ficou vazia
// e não deu para saber se a Kiwify tinha chamado. Grava ANTES do 401.
// NUNCA guarda o segredo — só se ele existe e se a chamada trouxe token/assinatura.
async function registraBatida(dados: Record<string, any>) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !service) return
    const admin = createClient(url, service)
    const { error } = await admin.from('webhook_recebidos').insert(dados)
    // Tolerante a coluna ausente (s1 é nova): se falhou e tinha s1, regrava sem ele —
    // o diário de bordo é mais importante que o campo extra.
    if (error && 's1' in dados) {
      const { s1: _s1, ...semS1 } = dados
      await admin.from('webhook_recebidos').insert(semS1)
    }
  } catch {}
}

export async function POST(req: NextRequest) {
  const segredo = process.env.KIWIFY_TOKEN || ''
  const raw = await req.text()
  // Autenticação dupla: o token estático na URL (config atual) OU a assinatura HMAC-SHA1
  // que a Kiwify envia em ?signature= (hash do corpo com o token). A assinatura é a forma
  // forte — só vale para aquele corpo exato, então um log de URL vazado não dá acesso.
  const token = req.nextUrl.searchParams.get('token')
  const assinatura = req.nextUrl.searchParams.get('signature') || ''
  const okToken = !!segredo && token === segredo
  let okSig = false
  try {
    const esperada = crypto.createHmac('sha1', segredo).update(raw).digest('hex')
    okSig = !!segredo && !!assinatura && crypto.timingSafeEqual(Buffer.from(esperada), Buffer.from(assinatura))
  } catch {}
  let tipoBruto = ''
  let s1Bruto: string | null = null
  try { const b0 = JSON.parse(raw); tipoBruto = acharTipo(b0); s1Bruto = extrairS1(b0) } catch {}
  await registraBatida({
    origem: 'kiwify',
    autorizado: okToken || okSig,
    tem_segredo: !!segredo,
    tem_token: !!token,
    tem_assinatura: !!assinatura,
    tipo: tipoBruto || null,
    bytes: raw.length,
    // s1 = user_id do checkout (coluna nova em migracao_2026-08-18_freemium.sql). Se a coluna
    // ainda não existir o insert falha inteiro, então só manda quando tem valor e, em caso de
    // erro, tenta de novo sem ele (ver registraBatida).
    ...(s1Bruto ? { s1: s1Bruto } : {}),
  })
  if (!okToken && !okSig) {
    // Avisa o dono NA HORA. Um pagamento recusado aqui significa aluno cobrado sem receber
    // o acesso — descobrir isso dias depois já custou uma venda.
    await avisarWebhookRecusado({
      origem: 'kiwify',
      tem_segredo: !!segredo,
      tem_token: !!token,
      tem_assinatura: !!assinatura,
      tipo: tipoBruto || null,
    })
    return new NextResponse('unauthorized', { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return NextResponse.json({ error: 'missing env' }, { status: 500 })

  let body: any = {}
  try { body = JSON.parse(raw) } catch { try { body = Object.fromEntries(new URLSearchParams(raw)) } catch {} }

  const email = acharEmail(body)
  const tipo = acharTipo(body)
  const s1 = extrairS1(body)
  if (!email && !s1) return NextResponse.json({ ok: true, ignored: 'sem email' })

  const classe = classificarEvento(tipo)
  const reembolso = classe === 'reembolso'
  const cancelamento = classe === 'cancelamento'
  const pago = classe === 'pago'

  let novo: Record<string, any> | null = null
  if (reembolso) novo = { is_premium: false, premium_expira: null, updated_at: new Date().toISOString() }
  else if (cancelamento) novo = { premium_expira: acharExpiracao(body), updated_at: new Date().toISOString() }
  else if (pago) novo = { is_premium: true, premium_expira: acharExpiracao(body), updated_at: new Date().toISOString() }
  if (!novo) return NextResponse.json({ ok: true, ignored: tipo })

  const admin = createClient(url, service)
  // ilike sem curingas do usuário: escapa %/_ para "joao_silva@" não casar "joaoxsilva@".
  const emailEsc = String(email || '').replace(/[\\%_]/g, m => '\\' + m)

  let casou = 0
  let alvoId: string | null = null
  let alvoAttrib: any = null
  let error: { message: string } | null = null

  // 1º) Pelo id do aluno (s1 do link do checkout): é o casamento mais confiável — não depende
  // de o aluno pagar com o mesmo e-mail do cadastro. Confere que o id existe em profiles
  // (um UUID inventado na URL não pode criar linha órfã) e faz upsert em progresso.
  if (s1) {
    const { data: prof } = await admin.from('profiles').select('id, email').eq('id', s1).maybeSingle()
    if (prof?.id) {
      const { data: l1, count: c1, error: e1 } = await admin.from('progresso')
        .upsert({ user_id: prof.id, ...(email || prof.email ? { email: email || prof.email } : {}), ...novo }, { onConflict: 'user_id', count: 'exact' })
        .select('user_id, attrib')
      if (e1) error = e1
      casou = c1 || 0
      alvoId = casou > 0 ? prof.id : null
      alvoAttrib = l1?.[0]?.attrib || null
    }
  }

  // 2º) Pelo e-mail do checkout (caminho antigo).
  if (!error && casou === 0 && email) {
    const { data: linhas, count, error: e0 } = await admin.from('progresso')
      .update(novo, { count: 'exact' }).ilike('email', emailEsc).select('user_id, attrib')
    error = e0
    casou = count || 0
    alvoId = linhas?.[0]?.user_id || null
    alvoAttrib = linhas?.[0]?.attrib || null
  }

  // progresso.email pode estar vazio (conta antiga): tenta pelo profiles, que sempre tem o e-mail
  // do cadastro, e cria/atualiza a linha de progresso pelo user_id.
  if (!error && casou === 0 && email) {
    const { data: prof } = await admin.from('profiles').select('id').ilike('email', emailEsc).limit(1)
    if (prof?.[0]?.id) {
      const { count: c2 } = await admin.from('progresso')
        .upsert({ user_id: prof[0].id, email, ...novo }, { onConflict: 'user_id', count: 'exact' }).select('user_id')
      casou = c2 || 0
      alvoId = prof[0].id
    }
  }

  // Nenhuma conta casou: registra para reconciliação em vez de sumir com o pagamento.
  if (error || casou === 0) {
    console.error('[Kiwify] evento sem conta correspondente', { email, s1, tipo, error: error?.message })
    const { error: pendErr } = await admin.from('pagamentos_pendentes').insert({ email, tipo, payload: body })
    if (pendErr) console.error('[Kiwify] falha ao registrar pendência', pendErr.message)
  }

  // Conversão server-side (GA4 Measurement Protocol): a compra web/Android acontece no gateway,
  // muitas vezes sem o app aberto — o webhook é a fonte de verdade do purchase. Dedup com o
  // evento client-side pelo MESMO transaction_id ('kiwify_<user_id>').
  let ga4: any = null
  if (pago && casou > 0 && alvoId) {
    ga4 = await enviarPurchaseGA4({
      userId: alvoId,
      clientId: alvoAttrib?.ga_cid || null,
      gclid: alvoAttrib?.gclid || null,
      transactionId: 'kiwify_' + alvoId,
      value: ehAnual(body) ? 289.8 : 29.9,
    })
    if (!ga4?.sent) console.error('[Kiwify] GA4 MP não enviado', ga4)
    // Meta CAPI: mesmo evento, mesmo id de dedup do pixel (vonai-purchase-<transaction_id>).
    const meta = await enviarPurchaseMeta({
      userId: alvoId,
      email: String(email || ''),
      transactionId: 'kiwify_' + alvoId,
      value: ehAnual(body) ? 289.8 : 29.9,
      fbp: alvoAttrib?.fbp || null,
      fbclid: alvoAttrib?.fbclid || null,
      ts: alvoAttrib?.ts || null,
    })
    if (!meta?.sent) console.error('[Kiwify] Meta CAPI não enviado', meta)
    // Aviso por e-mail: enquanto o volume é pequeno, saber da venda na hora vale mais que relatório.
    try { await avisarVenda({ email: String(email || alvoId), origem: 'Kiwify', tipo: tipo, valor: ehAnual(body) ? 289.8 : 29.9 }) } catch (e) {}
    // Prêmio de indicação: se este assinante foi indicado, o indicador ganha +30 dias de
    // Premium (1x por indicado — trava atômica no banco; renovações não premiam de novo).
    await premiarIndicador(admin, alvoId)
  }

  return NextResponse.json({ ok: true, email, s1, tipo, reembolso, cancelamento, pago, contas_atualizadas: casou, ga4 })
}

export async function GET() {
  return NextResponse.json({ ok: true, info: 'Kiwify webhook ativo. Use POST.' })
}
