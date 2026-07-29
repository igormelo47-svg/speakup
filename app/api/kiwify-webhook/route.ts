import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

// Fim do ciclo já pago: next_payment da assinatura quando vier; senão assume mensal.
// +3 dias de folga para o webhook de renovação chegar antes de o acesso cair.
function acharExpiracao(b: any): string {
  const next = b?.Subscription?.next_payment || b?.subscription?.next_payment
  const d = next ? new Date(next) : null
  if (d && !isNaN(d.getTime()) && d.getTime() > Date.now()) {
    return new Date(d.getTime() + 3 * 86400000).toISOString()
  }
  const pista = (JSON.stringify(b?.Product || b?.product || {}) + ' ' + String(b?.Subscription?.plan?.frequency || '')).toLowerCase()
  const anual = /(anual|year|yearly)/.test(pista)
  return new Date(Date.now() + (anual ? 366 : 34) * 86400000).toISOString()
}

export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!process.env.KIWIFY_TOKEN || token !== process.env.KIWIFY_TOKEN) {
    return new NextResponse('unauthorized', { status: 401 })
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return NextResponse.json({ error: 'missing env' }, { status: 500 })

  let body: any = {}
  try { body = await req.json() } catch { try { const t = await req.text(); body = Object.fromEntries(new URLSearchParams(t)) } catch {} }

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

  const { count, error } = await admin.from('progresso')
    .update(novo, { count: 'exact' }).ilike('email', emailEsc).select('user_id')
  let casou = count || 0

  // progresso.email pode estar vazio (conta antiga): tenta pelo profiles, que sempre tem o e-mail
  // do cadastro, e cria/atualiza a linha de progresso pelo user_id.
  if (!error && casou === 0) {
    const { data: prof } = await admin.from('profiles').select('id').ilike('email', emailEsc).limit(1)
    if (prof?.[0]?.id) {
      const { count: c2 } = await admin.from('progresso')
        .upsert({ user_id: prof[0].id, email, ...novo }, { onConflict: 'user_id', count: 'exact' }).select('user_id')
      casou = c2 || 0
    }
  }

  // Nenhuma conta casou: registra para reconciliação em vez de sumir com o pagamento.
  if (error || casou === 0) {
    console.error('[Kiwify] evento sem conta correspondente', { email, tipo, error: error?.message })
    const { error: pendErr } = await admin.from('pagamentos_pendentes').insert({ email, tipo, payload: body })
    if (pendErr) console.error('[Kiwify] falha ao registrar pendência', pendErr.message)
  }

  return NextResponse.json({ ok: true, email, tipo, reembolso, cancelamento, pago, contas_atualizadas: casou })
}

export async function GET() {
  return NextResponse.json({ ok: true, info: 'Kiwify webhook ativo. Use POST.' })
}
