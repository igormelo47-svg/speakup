import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Exclusão de conta INICIADA DENTRO DO APP (exigência da App Store, guideline 5.1.1(v)):
// o aluno autenticado pede a exclusão, validamos o token dele e apagamos TUDO —
// dados nas tabelas + a própria conta no Auth. Permanente, sem intervenção manual.

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon || !service) return NextResponse.json({ error: 'missing env' }, { status: 500 })

  // Quem está pedindo? O token do próprio aluno prova a identidade (ninguém apaga conta alheia).
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return new NextResponse('unauthorized', { status: 401 })
  const auth = createClient(url, anon)
  const { data: userData, error: userErr } = await auth.auth.getUser(token)
  const uid = userData?.user?.id
  if (userErr || !uid) return new NextResponse('unauthorized', { status: 401 })

  const admin = createClient(url, service)
  // Apaga os dados do aluno em todas as tabelas (filhas primeiro, profiles por último).
  for (const tabela of ['push_subscriptions', 'conversas', 'feedback', 'progresso', 'perfil', 'profiles']) {
    const coluna = tabela === 'profiles' ? 'id' : 'user_id'
    const { error } = await admin.from(tabela).delete().eq(coluna, uid)
    if (error && !/does not exist/i.test(error.message || '')) {
      return NextResponse.json({ error: `falha ao apagar ${tabela}: ${error.message}` }, { status: 500 })
    }
  }
  // Apaga a conta no Auth (e-mail deixa de existir; exclusão permanente).
  const { error: delErr } = await admin.auth.admin.deleteUser(uid)
  if (delErr) return NextResponse.json({ error: `falha ao apagar conta: ${delErr.message}` }, { status: 500 })

  return NextResponse.json({ ok: true })
}
