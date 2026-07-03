import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Recebe o feedback do aluno e grava na tabela `feedback` usando a service role
// (ignora o RLS, que bloqueia inserts do cliente anônimo/autenticado).
// Para ler as mensagens: painel do Supabase → Table Editor → feedback.

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
  return NextResponse.json({ ok: true })
}
