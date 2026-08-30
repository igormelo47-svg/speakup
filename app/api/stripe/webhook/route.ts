import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { stripeApi, verificaAssinaturaStripe, expiraCom, VALOR_PLANO, type JsonObj } from '../../../../lib/stripe'
import { enviarPurchaseGA4, enviarEventoGA4 } from '../../../../lib/ga4'
import { enviarPurchaseMeta } from '../../../../lib/meta-capi'
import { avisarVenda } from '../../../../lib/avisar-venda'
import { premiarIndicador } from '../../../../lib/indicacao-premio'
import { avisarWebhookRecusado } from '../../../../lib/avisar-webhook-recusado'

// ============================================================================
// Webhook do Stripe — é ele que liga e desliga o Premium.
//
// URL para cadastrar no Stripe: https://vonai.com.br/api/stripe/webhook
// Eventos: checkout.session.completed, customer.subscription.created/updated/deleted,
//          invoice.payment_succeeded, charge.refunded, charge.dispute.created
//
// Regras (as mesmas do kiwify-webhook, para os dois caminhos se comportarem igual):
// - teste iniciado com cartão / pagamento aprovado → is_premium true + premium_expira
// - reembolso / chargeback                          → revoga NA HORA
// - cancelamento                                    → NÃO revoga: grava a data e o acesso
//   cai sozinho quando o ciclo pago termina
// ============================================================================

export const runtime = 'nodejs'

// Só os campos que este arquivo realmente usa. Tipar o payload inteiro do Stripe seria
// manutenção sem retorno; tipar o que se toca pega erro de digitação em tempo de build.
type Metadados = { user_id?: string; plano?: string }
type StripeSessao = {
  id?: string; customer?: string; subscription?: string; client_reference_id?: string
  customer_email?: string; customer_details?: { email?: string }; metadata?: Metadados
}
type StripeAssinatura = {
  id?: string; customer?: string; status?: string; current_period_end?: number; trial_end?: number
  items?: { data?: Array<{ current_period_end?: number; price?: unknown }> }
  plan?: unknown; metadata?: Metadados
}
type StripeFatura = {
  id?: string; customer?: string; customer_email?: string; amount_paid?: number
  subscription?: string; parent?: { subscription_details?: { subscription?: string } }
}
type StripeCobranca = { customer?: string; receipt_email?: string; billing_details?: { email?: string } }

type Novo = Record<string, string | number | boolean | null>

// Diário de bordo: uma chamada recusada precisa deixar rastro. Foi a falta disso que
// escondeu, por dias, a venda de 17/08 paga e sem Premium no caminho da Kiwify.
async function registraBatida(dados: Record<string, string | number | boolean | null>) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !service) return
    const admin = createClient(url, service)
    await admin.from('webhook_recebidos').insert(dados)
  } catch {}
}

function periodoFim(sub: StripeAssinatura | null): number | null {
  if (!sub) return null
  const v = sub.current_period_end ?? sub.items?.data?.[0]?.current_period_end ?? sub.trial_end
  return typeof v === 'number' ? v : null
}

function ehAnualSub(sub: StripeAssinatura | null): boolean {
  if (!sub) return false
  const pista = JSON.stringify(sub.items?.data?.[0]?.price || sub.plan || {}).toLowerCase()
  return /"interval":"year"|anual|yearly/.test(pista) || sub.metadata?.plano === 'anual'
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Acha a conta do aluno. Ordem: metadata.user_id (o mais confiável — vai no checkout e na
// assinatura), depois o customer já gravado, depois o e-mail.
async function acharAluno(
  admin: SupabaseClient,
  { userId, customerId, email }: { userId?: string | null; customerId?: string | null; email?: string | null },
): Promise<string | null> {
  if (userId && UUID_RE.test(userId)) {
    const { data } = await admin.from('profiles').select('id').eq('id', userId).maybeSingle()
    if (data?.id) return data.id
  }
  if (customerId) {
    const { data } = await admin.from('progresso').select('user_id').eq('stripe_customer_id', customerId).maybeSingle()
    if (data?.user_id) return data.user_id
  }
  if (email) {
    const esc = String(email).replace(/[\\%_]/g, m => '\\' + m)
    const { data: p1 } = await admin.from('progresso').select('user_id').ilike('email', esc).limit(1)
    if (p1?.[0]?.user_id) return p1[0].user_id
    const { data: p2 } = await admin.from('profiles').select('id').ilike('email', esc).limit(1)
    if (p2?.[0]?.id) return p2[0].id
  }
  return null
}

async function gravar(admin: SupabaseClient, userId: string, novo: Novo, email?: string | null) {
  const { error } = await admin
    .from('progresso')
    .upsert({ user_id: userId, ...(email ? { email } : {}), ...novo, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
  if (error) console.error('[stripe] falha ao gravar progresso', error.message)
  return !error
}

export async function POST(req: NextRequest) {
  const segredo = process.env.STRIPE_WEBHOOK_SECRET || ''
  const raw = await req.text()
  const assinatura = req.headers.get('stripe-signature')
  const ok = verificaAssinaturaStripe(raw, assinatura, segredo)

  let tipo = ''
  try { tipo = String((JSON.parse(raw) as { type?: string })?.type || '') } catch {}

  await registraBatida({
    origem: 'stripe', autorizado: ok, tem_segredo: !!segredo, tem_token: false,
    tem_assinatura: !!assinatura, tipo: tipo || null, bytes: raw.length,
  })

  if (!ok) {
    // Avisa o dono na hora: aqui, uma recusa significa aluno com cartão cobrado e sem acesso.
    await avisarWebhookRecusado({
      origem: 'stripe', tem_segredo: !!segredo, tem_token: false,
      tem_assinatura: !!assinatura, tipo: tipo || null,
    })
    return new NextResponse('assinatura inválida', { status: 400 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return NextResponse.json({ error: 'missing env' }, { status: 500 })
  const admin = createClient(url, service)

  const evento = JSON.parse(raw) as { data?: { object?: JsonObj } }
  const obj: JsonObj = evento?.data?.object || {}
  let resultado: Record<string, unknown> = { tipo, tratado: false }

  try {
    // ---------------------------------------------------------------- teste começou
    // O aluno pôs o cartão. Libera na hora — ele acabou de escolher o Vonai e não pode
    // bater numa tela trancada enquanto o Stripe processa.
    if (tipo === 'checkout.session.completed') {
      const s = obj as StripeSessao
      const emailSessao = s.customer_details?.email || s.customer_email || null
      const userId = await acharAluno(admin, {
        userId: s.metadata?.user_id || s.client_reference_id,
        customerId: s.customer, email: emailSessao,
      })
      if (!userId) throw new Error('sessão sem conta correspondente')

      let sub: StripeAssinatura | null = null
      if (s.subscription) {
        try { sub = (await stripeApi(`/subscriptions/${s.subscription}`, { method: 'GET' })) as StripeAssinatura } catch {}
      }
      const anual = sub ? ehAnualSub(sub) : s.metadata?.plano === 'anual'

      await gravar(admin, userId, {
        is_premium: true,
        premium_expira: expiraCom(periodoFim(sub), anual),
        stripe_customer_id: s.customer ?? null,
        stripe_subscription_id: s.subscription ?? null,
        stripe_status: sub?.status ?? 'trialing',
      }, emailSessao)

      // Início de teste COM cartão — muito mais valioso para o Meta otimizar do que o
      // antigo início de teste sem cartão, que qualquer curioso disparava.
      try {
        await enviarEventoGA4({
          nome: 'inicio_teste_com_cartao', userId,
          params: { plano: anual ? 'anual' : 'mensal', value: anual ? VALOR_PLANO.anual : VALOR_PLANO.mensal, currency: 'BRL' },
        })
      } catch {}

      resultado = { tipo, tratado: true, userId, acao: 'trial_com_cartao' }
    }

    // ------------------------------------------------- assinatura criada/atualizada
    else if (tipo === 'customer.subscription.created' || tipo === 'customer.subscription.updated') {
      const sub = obj as StripeAssinatura
      const userId = await acharAluno(admin, { userId: sub.metadata?.user_id, customerId: sub.customer })
      if (!userId) throw new Error('assinatura sem conta correspondente')
      const status = String(sub.status || '')
      // trialing e active valem acesso. past_due NÃO revoga (o aluno pagou o ciclo e o
      // Stripe ainda vai tentar de novo). canceled/unpaid deixam a data cair sozinha.
      const vale = status === 'active' || status === 'trialing' || status === 'past_due'
      await gravar(admin, userId, {
        is_premium: vale,
        premium_expira: expiraCom(periodoFim(sub), ehAnualSub(sub)),
        stripe_customer_id: sub.customer ?? null,
        stripe_subscription_id: sub.id ?? null,
        stripe_status: status,
      })
      resultado = { tipo, tratado: true, userId, status }
    }

    // ------------------------------------------------------------ dinheiro de verdade
    // A 1ª cobrança acontece no fim do teste. É AQUI que existe receita — é este o
    // evento de compra para o GA4 e o Meta, não o início do teste.
    else if (tipo === 'invoice.payment_succeeded' || tipo === 'invoice.paid') {
      const inv = obj as StripeFatura
      const pago = Number(inv.amount_paid || 0)
      if (pago <= 0) {
        resultado = { tipo, tratado: true, acao: 'fatura_zero_ignorada' }
      } else {
        const subId = inv.subscription || inv.parent?.subscription_details?.subscription
        let sub: StripeAssinatura | null = null
        if (subId) {
          try { sub = (await stripeApi(`/subscriptions/${subId}`, { method: 'GET' })) as StripeAssinatura } catch {}
        }
        const userId = await acharAluno(admin, {
          userId: sub?.metadata?.user_id, customerId: inv.customer, email: inv.customer_email,
        })
        if (!userId) throw new Error('fatura sem conta correspondente')

        const valor = pago / 100
        await gravar(admin, userId, {
          is_premium: true,
          premium_expira: expiraCom(periodoFim(sub), ehAnualSub(sub)),
          stripe_customer_id: inv.customer ?? null,
          stripe_subscription_id: subId ?? null,
          stripe_status: sub?.status ?? 'active',
        }, inv.customer_email)

        // Dedup com o client-side pelo MESMO transaction_id.
        const transactionId = 'stripe_' + String(inv.id || userId)
        const { data: prog } = await admin.from('progresso').select('attrib').eq('user_id', userId).maybeSingle()
        const atb = (prog?.attrib || null) as { ga_cid?: string; gclid?: string; fbp?: string; fbclid?: string; ts?: string } | null

        const ga4 = await enviarPurchaseGA4({
          userId, clientId: atb?.ga_cid || null, gclid: atb?.gclid || null, transactionId, value: valor,
        })
        if (!ga4?.sent) console.error('[stripe] GA4 MP não enviado', ga4)

        const meta = await enviarPurchaseMeta({
          userId, email: String(inv.customer_email || ''), transactionId, value: valor,
          fbp: atb?.fbp || null, fbclid: atb?.fbclid || null, ts: atb?.ts || null,
        })
        if (!meta?.sent) console.error('[stripe] Meta CAPI não enviado', meta)

        try { await avisarVenda({ email: String(inv.customer_email || userId), origem: 'Stripe', tipo, valor }) } catch {}
        // Trava atômica no banco: chamar de novo numa renovação não premia duas vezes.
        await premiarIndicador(admin, userId)

        resultado = { tipo, tratado: true, userId, valor }
      }
    }

    // -------------------------------------------------------------------- cancelou
    // Não revoga agora: o aluno pagou o ciclo. A data faz o acesso cair sozinho.
    else if (tipo === 'customer.subscription.deleted') {
      const sub = obj as StripeAssinatura
      const userId = await acharAluno(admin, { userId: sub.metadata?.user_id, customerId: sub.customer })
      if (!userId) throw new Error('cancelamento sem conta correspondente')
      await gravar(admin, userId, {
        premium_expira: expiraCom(periodoFim(sub), ehAnualSub(sub)),
        stripe_status: 'canceled',
      })
      resultado = { tipo, tratado: true, userId, acao: 'expira_no_fim_do_ciclo' }
    }

    // ------------------------------------------------- reembolso / contestação
    else if (tipo === 'charge.refunded' || tipo === 'charge.dispute.created') {
      const c = obj as StripeCobranca
      const userId = await acharAluno(admin, {
        customerId: c.customer, email: c.billing_details?.email || c.receipt_email,
      })
      if (!userId) throw new Error('reembolso sem conta correspondente')
      await gravar(admin, userId, { is_premium: false, premium_expira: null, stripe_status: 'reembolsado' })
      resultado = { tipo, tratado: true, userId, acao: 'revogado' }
    }
  } catch (e) {
    // Nunca some com o evento: registra para reconciliação manual no /admin.
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[stripe] evento não conciliado', tipo, msg)
    try {
      const s = obj as StripeSessao & StripeFatura
      await admin.from('pagamentos_pendentes').insert({
        email: s.customer_email || s.customer_details?.email || null,
        tipo: `stripe:${tipo}`, payload: evento,
      })
    } catch {}
    // 200 de propósito: o Stripe só precisa saber que chegou. Reenviar não conserta conta
    // que não existe, e a pendência já ficou gravada.
    return NextResponse.json({ ok: true, tipo, conciliado: false, erro: msg })
  }

  return NextResponse.json({ ok: true, ...resultado })
}

export async function GET() {
  return NextResponse.json({ ok: true, info: 'Webhook do Stripe ativo. Use POST.' })
}
