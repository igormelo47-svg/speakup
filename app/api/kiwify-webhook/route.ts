import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Webhook da Kiwify: quando um pagamento é aprovado, marca o aluno como Premium.
// Configure na Kiwify a URL: https://SEU-APP.vercel.app/api/kiwify-webhook?token=SEU_TOKEN
// e defina KIWIFY_TOKEN nas variáveis de ambiente da Vercel.

function acharEmail(b: any): string | null {
  if (!b || typeof b !== 'object') return null
  return (
    b?.Customer?.email || b?.customer?.email || b?.buyer?.email ||
    b?.Customer?.Email || b?.email || b?.buyer_email || b?.customer_email || null
  )
}
function acharStatus(b: any): string {
  return String(b?.order_status || b?.status || b?.webhook_event_type || b?.event || '').toLowerCase()
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
  const status = acharStatus(body)
  if (!email) return NextResponse.json({ ok: true, ignored: 'sem email' })

  const pago = /(paid|approved|aprovad|complet|active|ativa)/.test(status)
  const cancelado = /(refund|reembols|charge_?back|cancel|expired|expirad)/.test(status)

  const admin = createClient(url, service)
  if (pago) {
    await admin.from('progresso').update({ is_premium: true, updated_at: new Date().toISOString() }).eq('email', email)
  } else if (cancelado) {
    await admin.from('progresso').update({ is_premium: false, updated_at: new Date().toISOString() }).eq('email', email)
  }
  return NextResponse.json({ ok: true, email, status, pago, cancelado })
}

export async function GET() {
  return NextResponse.json({ ok: true, info: 'Kiwify webhook ativo. Use POST.' })
}
