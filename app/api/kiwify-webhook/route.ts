import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { enviarPurchaseGA4 } from '../../../lib/ga4'
import { enviarPurchaseMeta } from '../../../lib/meta-capi'
import { avisarVenda } from '../../../lib/avisar-venda'

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

function acharEmail(b: any): string | null {
  if (!b || typeof b !== 'object') return null
  return (
    b?.Customer?.email || b?.customer?.email || b?.buyer?.email ||
    b?.Customer?.Email || b?.email || b?.buyer_email || b?.customer_email || null
  )
}

// PEGADINHA: eventos de assinatura podem chegar com order_status 'paid' do pedido original.
// O TIPO do evento decide; order_status é só o último recurso (pedido avulso sem tipo).
function acharTipo(b: any): string {
  return String(
    b?.webhook_event_type || b?.event || b?.Subscription?.status || b?.order_status || b?.status || ''
  ).toLowerCase()
}

// O plano é anual? (pela descrição do produto/frequência no payload)
function ehAnual(b: any): boolean {
  const pista = (JSON.stringify(b?.Product || b?.product || {}) + ' ' + String(b?.Subscription?.plan?.frequency || '')).toLowerCase()
  return /(anual|year|yearly)/.test(pista)
}

// Fim do ciclo já pago: next_payment da assinatura quando vier; senão assume mensal.
// +3 dias de folga para o webhook de renovação chegar antes de o acesso cair.
function acharExpiracao(b: any): string {
  const next = b?.Subscription?.next_payment || b?.subscription?.next_payment
  const d = next ? new Date(next) : null
  if (d && !isNaN(d.getTime()) && d.getTime() > Date.now()) {
    return new Date(d.getTime() + 3 * 86400000).toISOString()
  }
  return new Date(Date.now() + (ehAnual(b) ? 366 : 34) * 86400000).toISOString()
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
  if (!okToken && !okSig) return new NextResponse('unauthorized', { status: 401 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return NextResponse.json({ error: 'missing env' }, { status: 500 })

  let body: any = {}
  try { body = JSON.parse(raw) } catch { try { body = Object.fromEntries(new URLSearchParams(raw)) } catch {} }

  const email = acharEmail(body)
  const tipo = acharTipo(body)
  if (!email) return NextResponse.json({ ok: true, ignored: 'sem email' })

  // Ordem importa: reembolso antes de cancelamento antes de pago.
  const reembolso = /(refund|reembols|charge_?back)/.test(tipo)
  const cancelamento = /(cancel|expired|expirad|late|atras)/.test(tipo)
  const pago = /(approved|aprovad|paid|complet|renew|active|ativa)/.test(tipo)

  let novo: Record<string, any> | null = null
  if (reembolso) novo = { is_premium: false, premium_expira: null, updated_at: new Date().toISOString() }
  else if (cancelamento) novo = { premium_expira: acharExpiracao(body), updated_at: new Date().toISOString() }
  else if (pago) novo = { is_premium: true, premium_expira: acharExpiracao(body), updated_at: new Date().toISOString() }
  if (!novo) return NextResponse.json({ ok: true, ignored: tipo })

  const admin = createClient(url, service)
  // ilike sem curingas do usuário: escapa %/_ para "joao_silva@" não casar "joaoxsilva@".
  const emailEsc = String(email).replace(/[\\%_]/g, m => '\\' + m)

  const { data: linhas, count, error } = await admin.from('progresso')
    .update(novo, { count: 'exact' }).ilike('email', emailEsc).select('user_id, attrib')
  let casou = count || 0
  let alvoId: string | null = linhas?.[0]?.user_id || null
  let alvoAttrib: any = linhas?.[0]?.attrib || null

  // progresso.email pode estar vazio (conta antiga): tenta pelo profiles, que sempre tem o e-mail
  // do cadastro, e cria/atualiza a linha de progresso pelo user_id.
  if (!error && casou === 0) {
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
    console.error('[Kiwify] evento sem conta correspondente', { email, tipo, error: error?.message })
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
      email: String(email),
      transactionId: 'kiwify_' + alvoId,
      value: ehAnual(body) ? 289.8 : 29.9,
      fbp: alvoAttrib?.fbp || null,
      fbclid: alvoAttrib?.fbclid || null,
      ts: alvoAttrib?.ts || null,
    })
    if (!meta?.sent) console.error('[Kiwify] Meta CAPI não enviado', meta)
    // Aviso por e-mail: enquanto o volume é pequeno, saber da venda na hora vale mais que relatório.
    try { await avisarVenda({ email: String(email), origem: 'Kiwify', tipo: tipo, valor: ehAnual(body) ? 289.8 : 29.9 }) } catch (e) {}
  }

  return NextResponse.json({ ok: true, email, tipo, reembolso, cancelamento, pago, contas_atualizadas: casou, ga4 })
}

export async function GET() {
  return NextResponse.json({ ok: true, info: 'Kiwify webhook ativo. Use POST.' })
}
