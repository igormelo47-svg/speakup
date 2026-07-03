import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Recebe o feedback do aluno, grava na tabela `feedback` (service role, ignora o RLS)
// e envia um e-mail de aviso via Resend.
// Para ler no painel: Supabase → Table Editor → feedback.

const DESTINO = 'moafidem@hotmail.com'

async function avisarPorEmail(mensagem: string, email: string | null, user_id: string | null) {
  const key = process.env.RESEND_API_KEY
  if (!key) return // sem chave configurada: só grava no banco, não quebra o envio
  // Remetente: usa domínio verificado (RESEND_FROM) se houver; senão o de teste do Resend,
  // que entrega para o e-mail dono da conta Resend.
  const from = process.env.RESEND_FROM || 'Vonai Feedback <onboarding@resend.dev>'
  const quando = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#16212c;line-height:1.6">
      <h2 style="margin:0 0 12px">💬 Novo feedback no Vonai</h2>
      <div style="background:#f2f5f8;border-radius:10px;padding:14px;white-space:pre-wrap">${mensagem.replace(/</g, '&lt;')}</div>
      <p style="color:#5c6b7a;font-size:13px;margin-top:14px">
        Aluno: ${email || 'não informado'}<br/>
        ID: ${user_id || '—'}<br/>
        Quando: ${quando}
      </p>
    </div>`
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [DESTINO],
        reply_to: email || undefined,
        subject: '💬 Novo feedback no Vonai',
        html,
      }),
    })
  } catch {}
}

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return NextResponse.json({ error: 'missing env' }, { status: 500 })

  let body: any = {}
  try { body = await req.json() } catch {}
  const mensagem = String(body?.mensagem || '').trim().slice(0, 4000)
  const email = body?.email ? String(body.email).slice(0, 200) : null
  const user_id = body?.user_id ? String(body.user_id) : null
  if (mensagem.length < 3) return NextResponse.json({ error: 'mensagem curta' }, { status: 400 })

  const admin = createClient(url, service)
  const { error } = await admin.from('feedback').insert({ user_id, email, mensagem })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await avisarPorEmail(mensagem, email, user_id)
  return NextResponse.json({ ok: true })
}
