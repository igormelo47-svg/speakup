import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Recebe o feedback do aluno, grava na tabela `feedback` (service role, ignora o RLS)
// e envia um e-mail de aviso via Resend.
// Protegida: exige login (a identidade vem do token, não do body — antes dava pra forjar
// feedback em nome de outro aluno) e tem teto diário (antes qualquer bot podia inundar
// a tabela e a cota do Resend).
// Para ler no painel: Supabase → Table Editor → feedback.

const DESTINO = 'moafidem@hotmail.com'
const FEEDBACKS_POR_DIA = 5

// Tudo que entra no HTML do e-mail passa por aqui (mensagem, e-mail e id vinham crus —
// dava pra injetar HTML/links de phishing no e-mail que o dono abre).
const esc = (s: string) => String(s).replace(/[&<>]/g, c => (({ '&': '&amp;', '<': '&lt;', '>': '&gt;' } as Record<string, string>)[c]))

async function avisarPorEmail(mensagem: string, email: string | null, user_id: string | null) {
  const key = process.env.RESEND_API_KEY
  if (!key) return { sent: false, reason: 'sem RESEND_API_KEY na Vercel' }
  // Remetente: usa domínio verificado (RESEND_FROM) se houver; senão o de teste do Resend,
  // que entrega para o e-mail dono da conta Resend.
  const from = process.env.RESEND_FROM || 'Vonai Feedback <onboarding@resend.dev>'
  const quando = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#16212c;line-height:1.6">
      <h2 style="margin:0 0 12px">💬 Novo feedback no Vonai</h2>
      <div style="background:#f2f5f8;border-radius:10px;padding:14px;white-space:pre-wrap">${esc(mensagem)}</div>
      <p style="color:#5c6b7a;font-size:13px;margin-top:14px">
        Aluno: ${email ? esc(email) : 'não informado'}<br/>
        ID: ${user_id ? esc(user_id) : '—'}<br/>
        Quando: ${quando}
      </p>
    </div>`
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [DESTINO], reply_to: email || undefined, subject: '💬 Novo feedback no Vonai', html }),
    })
    const txt = await r.text()
    return { sent: r.ok, status: r.status, from, resposta: txt.slice(0, 300) }
  } catch (e: any) {
    return { sent: false, reason: 'fetch falhou', erro: String(e?.message || e) }
  }
}

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon || !service) return NextResponse.json({ error: 'missing env' }, { status: 500 })

  // 1) Só aluno logado envia; user_id e e-mail saem do token.
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  let user_id = '', email: string | null = null
  try {
    const sb = createClient(url, anon)
    const { data, error } = await sb.auth.getUser(token)
    if (error || !data?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    user_id = data.user.id
    email = data.user.email || null
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  let body: any = {}
  try { body = await req.json() } catch {}
  const mensagem = String(body?.mensagem || '').trim().slice(0, 4000)
  if (mensagem.length < 3) return NextResponse.json({ error: 'mensagem curta' }, { status: 400 })

  const admin = createClient(url, service)

  // 2) Teto diário por aluno (contador atômico, o mesmo das rotas de IA).
  const { data: pode, error: rlErr } = await admin.rpc('incrementa_uso', { p_user: user_id, p_tipo: 'feedback', p_limite: FEEDBACKS_POR_DIA })
  if (rlErr || pode === false) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  const { error } = await admin.from('feedback').insert({ user_id, email, mensagem })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await avisarPorEmail(mensagem, email, user_id)
  return NextResponse.json({ ok: true })
}
