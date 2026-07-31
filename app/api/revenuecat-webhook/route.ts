import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { enviarPurchaseGA4 } from '../../../lib/ga4'
import { enviarPurchaseMeta } from '../../../lib/meta-capi'
import { avisarVenda } from '../../../lib/avisar-venda'

// Webhook do RevenueCat (assinaturas via App Store / Google Play).
// Quando a Apple confirma o pagamento, o RevenueCat chama esta rota e a gente libera o Premium.
// Espelha o kiwify-webhook — só muda a fonte do evento.
//
// Configuração no painel do RevenueCat (Project > Integrations > Webhooks):
//   URL:            https://vonai.com.br/api/revenuecat-webhook
//   Authorization:  o mesmo valor de REVENUECAT_AUTH (defina nas env da Vercel)
//
// IMPORTANTE (o app iOS precisa fazer): chamar Purchases.logIn(<supabase user.id>)
// para que o `app_user_id` do evento seja o id da conta Vonai. Assim casamos a compra
// à conta certa. Se isso faltar, caímos no e-mail ($email nos subscriber_attributes).

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Eventos que DÃO acesso Premium.
const CONCEDE = new Set([
  'INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION', 'NON_RENEWING_PURCHASE',
  'PRODUCT_CHANGE', 'SUBSCRIPTION_EXTENDED', 'TRANSFER',
])
// Eventos que TIRAM o acesso. (CANCELLATION não entra: o aluno mantém o Premium até
// expirar de fato — o RevenueCat manda um EXPIRATION quando termina.)
const REVOGA = new Set(['EXPIRATION'])

export async function POST(req: NextRequest) {
  // Autenticação: header Authorization igual ao segredo configurado no RevenueCat.
  const auth = req.headers.get('authorization') || ''
  if (!process.env.REVENUECAT_AUTH || auth !== process.env.REVENUECAT_AUTH) {
    return new NextResponse('unauthorized', { status: 401 })
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return NextResponse.json({ error: 'missing env' }, { status: 500 })

  let body: any = {}
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }) }

  const ev = body?.event || {}
  const tipo = String(ev?.type || '').toUpperCase()
  if (!tipo || tipo === 'TEST') return NextResponse.json({ ok: true, ignored: tipo || 'sem tipo' })
  // Compra de sandbox (TestFlight) não é dinheiro real — não pode liberar Premium em produção.
  if (String(ev?.environment || '').toUpperCase() === 'SANDBOX') {
    return NextResponse.json({ ok: true, ignored: 'sandbox' })
  }

  const concede = CONCEDE.has(tipo)
  const revoga = REVOGA.has(tipo)
  if (!concede && !revoga) return NextResponse.json({ ok: true, ignored: tipo }) // CANCELLATION, BILLING_ISSUE, etc.

  // Candidatos a id da conta Vonai (só os que são UUID de verdade; ignora o id anônimo do RC).
  const ids: string[] = [ev?.app_user_id, ev?.original_app_user_id, ...(Array.isArray(ev?.aliases) ? ev.aliases : [])]
    .filter((x: any) => typeof x === 'string' && UUID.test(x))
  const uniq = Array.from(new Set(ids))
  const email: string | null = ev?.subscriber_attributes?.['$email']?.value || null

  const admin = createClient(url, service)
  // premium_expira: null — a expiração do iOS é gerenciada pelo evento EXPIRATION do RC;
  // limpar a data também cobre quem cancelou na Kiwify e depois assinou pela Apple.
  const novo = { is_premium: concede, premium_expira: null, updated_at: new Date().toISOString() }
  let casou = 0

  // 1) Casa pela conta (user_id) — caminho preferido.
  for (const id of uniq) {
    const { count } = await admin.from('progresso').update(novo, { count: 'exact' }).eq('user_id', id).select('user_id')
    casou += count || 0
  }
  // 2) Se não achou por conta, tenta pelo e-mail (case-insensitive).
  if (casou === 0 && email) {
    const { count } = await admin.from('progresso').update(novo, { count: 'exact' }).ilike('email', email).select('user_id')
    casou += count || 0
  }

  // Conversão server-side (GA4 MP) nas compras de dinheiro novo do iOS. Dedup com o evento
  // client-side (page.tsx dispara com o transactionIdentifier da Apple — mesmo id aqui).
  let ga4: any = null
  if (casou > 0 && (tipo === 'INITIAL_PURCHASE' || tipo === 'RENEWAL' || tipo === 'NON_RENEWING_PURCHASE')) {
    const alvoId = uniq[0] || null
    if (alvoId) {
      const { data: pr } = await admin.from('progresso').select('attrib').eq('user_id', alvoId).maybeSingle()
      const anual = /(anual|year|yearly)/.test(String(ev?.product_id || '').toLowerCase())
      ga4 = await enviarPurchaseGA4({
        userId: alvoId,
        clientId: pr?.attrib?.ga_cid || null,
        gclid: pr?.attrib?.gclid || null,
        transactionId: String(ev?.transaction_id || ev?.id || `rc_${alvoId}`),
        value: anual ? 289.9 : 29.9,
      })
      if (!ga4?.sent) console.error('[RevenueCat] GA4 MP não enviado', ga4)
      // Meta CAPI: mesmo evento, mesmo id de dedup do pixel (vonai-purchase-<transaction_id>).
      let emailAluno: string | null = email
      try {
        const { data: pf } = await admin.from('profiles').select('email').eq('id', alvoId).maybeSingle()
        if (pf?.email) emailAluno = pf.email
      } catch (e) {}
      const meta = await enviarPurchaseMeta({
        userId: alvoId,
        email: emailAluno,
        transactionId: String(ev?.transaction_id || ev?.id || `rc_${alvoId}`),
        value: anual ? 289.9 : 29.9,
        fbp: pr?.attrib?.fbp || null,
        fbclid: pr?.attrib?.fbclid || null,
        ts: pr?.attrib?.ts || null,
      })
      if (!meta?.sent) console.error('[RevenueCat] Meta CAPI não enviado', meta)
      try {
        await avisarVenda({ email: emailAluno || alvoId, origem: 'Apple', tipo: tipo, valor: anual ? 289.9 : 29.9 })
      } catch (e) {}
    }
  }

  return NextResponse.json({ ok: true, tipo, concede, revoga, contas_atualizadas: casou, ga4 })
}

export async function GET() {
  return NextResponse.json({ ok: true, info: 'RevenueCat webhook ativo. Use POST.' })
}
