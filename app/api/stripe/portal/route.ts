import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripeApi, stripeConfigurado } from '../../../../lib/stripe'

// ============================================================================
// Portal do assinante — onde a pessoa cancela, troca o cartão e vê as faturas.
//
// Não é enfeite: com cobrança automática, quem não acha o botão de cancelar contesta no
// banco. Um chargeback custa a venda, a taxa e a reputação da conta no Stripe. O portal
// é a saída barata para o aluno e para o Vonai.
// ============================================================================

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  if (!stripeConfigurado()) return NextResponse.json({ erro: 'sem_stripe' }, { status: 503 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon || !service) return NextResponse.json({ erro: 'env' }, { status: 500 })

  const auth = req.headers.get('authorization') || ''
  const token = auth.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : ''
  if (!token) return NextResponse.json({ erro: 'sem_login' }, { status: 401 })

  const cliente = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } })
  const { data: userData } = await cliente.auth.getUser()
  const user = userData?.user
  if (!user?.id) return NextResponse.json({ erro: 'sem_login' }, { status: 401 })

  const admin = createClient(url, service)
  const { data: prog } = await admin
    .from('progresso')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!prog?.stripe_customer_id) return NextResponse.json({ erro: 'sem_assinatura' }, { status: 404 })

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://vonai.com.br'
  try {
    const s = await stripeApi('/billing_portal/sessions', {
      body: { customer: prog.stripe_customer_id, return_url: `${site}/app` },
    })
    return NextResponse.json({ url: s?.url })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'falha'
    console.error('[stripe/portal] erro', msg)
    return NextResponse.json({ erro: 'falha', motivo: msg }, { status: 502 })
  }
}
