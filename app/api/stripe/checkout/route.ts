import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripeApi, stripeConfigurado, precoId, DIAS_TRIAL } from '../../../../lib/stripe'

// ============================================================================
// Cria a sessão de checkout do Stripe — CARTÃO NA ENTRADA, cobrança automática.
//
// É esta a mudança que faz o Vonai ser assinado. Antes: o aluno usava 3 dias, o app
// trancava e ele precisava, sozinho, voltar dias depois e digitar o cartão. Ninguém faz
// isso. Agora o cartão entra no momento de maior intenção e a 1ª cobrança acontece
// sozinha no fim do teste, com aviso por e-mail 24h antes (o Stripe envia, e o
// /api/send-reminders também).
//
// Contrato: POST { plano: 'mensal' | 'anual' } com o usuário logado (Bearer do Supabase).
// Devolve { url } para redirecionar, ou { erro: 'sem_stripe' } para quem chamou cair no
// caminho antigo (Kiwify) em vez de deixar o aluno sem saída no paywall.
// ============================================================================

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!stripeConfigurado()) {
    return NextResponse.json({ erro: 'sem_stripe', motivo: 'STRIPE_SECRET_KEY ausente' }, { status: 503 })
  }

  let body: { plano?: string } = {}
  try { body = await req.json() } catch {}
  const plano: 'mensal' | 'anual' = body?.plano === 'anual' ? 'anual' : 'mensal'

  const price = precoId(plano)
  if (!price) {
    return NextResponse.json({ erro: 'sem_stripe', motivo: `STRIPE_PRICE_${plano.toUpperCase()} ausente ou inválido` }, { status: 503 })
  }

  // Identidade vem do token do Supabase, NUNCA do corpo: senão qualquer um assinaria
  // premium na conta de outra pessoa mandando um user_id qualquer.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon || !service) return NextResponse.json({ erro: 'env' }, { status: 500 })

  const auth = req.headers.get('authorization') || ''
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : ''
  if (!token) return NextResponse.json({ erro: 'sem_login' }, { status: 401 })

  const cliente = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } })
  const { data: userData, error: userErr } = await cliente.auth.getUser()
  const user = userData?.user
  if (userErr || !user?.id) return NextResponse.json({ erro: 'sem_login' }, { status: 401 })

  const admin = createClient(url, service)

  // Reaproveita o customer do Stripe se o aluno já passou por aqui: sem isso ele vira
  // dois clientes e a segunda assinatura não casa com a primeira no portal.
  const { data: prog } = await admin
    .from('progresso')
    .select('stripe_customer_id, email')
    .eq('user_id', user.id)
    .maybeSingle()

  const email = user.email || prog?.email || undefined
  let customer: string | undefined = prog?.stripe_customer_id || undefined

  if (!customer) {
    try {
      const c = await stripeApi('/customers', {
        body: { email, metadata: { user_id: user.id } },
        idempotencia: `cust_${user.id}`,
      })
      customer = typeof c?.id === 'string' ? c.id : undefined
      if (customer) {
        await admin.from('progresso').upsert(
          { user_id: user.id, ...(email ? { email } : {}), stripe_customer_id: customer },
          { onConflict: 'user_id' },
        )
      }
    } catch (e) {
      console.error('[stripe/checkout] falha ao criar customer', e instanceof Error ? e.message : e)
    }
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://vonai.com.br'

  try {
    const sessao = await stripeApi('/checkout/sessions', {
      body: {
        mode: 'subscription',
        line_items: [{ price, quantity: 1 }],
        // O ponto inteiro desta mudança: exige o cartão mesmo tendo teste grátis.
        payment_method_collection: 'always',
        subscription_data: {
          trial_period_days: DIAS_TRIAL,
          // Se o cartão sumir até o fim do teste, cancela em vez de deixar assinatura
          // fantasma sem pagamento.
          trial_settings: { end_behavior: { missing_payment_method: 'cancel' } },
          metadata: { user_id: user.id, plano },
        },
        ...(customer ? { customer } : { customer_email: email }),
        client_reference_id: user.id,
        metadata: { user_id: user.id, plano },
        locale: 'pt-BR',
        allow_promotion_codes: true,
        success_url: `${site}/app?pago=1&sessao={CHECKOUT_SESSION_ID}`,
        cancel_url: `${site}/app?pago=0`,
      },
    })

    if (typeof sessao?.url !== 'string') return NextResponse.json({ erro: 'sem_url' }, { status: 502 })
    return NextResponse.json({ url: sessao.url, plano, dias: DIAS_TRIAL })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'falha'
    console.error('[stripe/checkout] erro', msg)
    // Devolve sem_stripe para o app cair no Kiwify: melhor um checkout antigo que
    // um paywall sem botão que funcione.
    return NextResponse.json({ erro: 'sem_stripe', motivo: msg }, { status: 503 })
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    configurado: stripeConfigurado(),
    mensal: !!precoId('mensal'),
    anual: !!precoId('anual'),
    dias_trial: DIAS_TRIAL,
    info: 'Checkout do Stripe. Use POST com { plano } e o Bearer do Supabase.',
  })
}
