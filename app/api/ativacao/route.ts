import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { enviarEventoGA4 } from '../../../lib/ga4'

// ATIVAÇÃO — o aluno saiu do cadastro e realmente USOU o app (nivelamento, 1ª lição ou
// 1ª conversa, o que vier primeiro). É o evento que separa "criou conta" de "virou aluno".
//
// Por que passar pelo servidor em vez de só empurrar no dataLayer:
// 1. o dataLayer só chega ao GA4 se existir tag no GTM — que é conta do gestor de tráfego;
// 2. `progresso.ativado_em` fica no NOSSO banco, então dá pra cruzar ativação com origem
//    (attrib.gclid) sem depender de ninguém — é o que responde se o gargalo é tráfego ou produto;
// 3. a idempotência vira do usuário, não do aparelho: o localStorage do cliente perde a
//    memória quando ele troca de celular ou limpa o cache, e o evento dispararia de novo.

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon || !service) return NextResponse.json({ error: 'missing env' }, { status: 500 })

  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return new NextResponse('unauthorized', { status: 401 })
  const auth = createClient(url, anon)
  const { data: userData, error: userErr } = await auth.auth.getUser(token)
  const uid = userData?.user?.id
  if (userErr || !uid) return new NextResponse('unauthorized', { status: 401 })

  let gatilho = 'desconhecido'
  try { const b = await req.json(); if (typeof b?.gatilho === 'string') gatilho = b.gatilho.slice(0, 40) } catch (e) {}

  const admin = createClient(url, service)
  const { data: prog } = await admin
    .from('progresso')
    .select('ativado_em, attrib')
    .eq('user_id', uid)
    .maybeSingle()

  // Já ativado: não regrava nem reenvia. O primeiro momento é o que importa.
  if (prog?.ativado_em) return NextResponse.json({ ok: true, jaAtivado: true })

  const agora = new Date().toISOString()
  const { error: upErr } = await admin
    .from('progresso')
    .update({ ativado_em: agora, ativado_por: gatilho })
    .eq('user_id', uid)
  // Coluna ainda não aplicada no banco (ativacao_columns.sql): o evento vai pro GA4 do
  // mesmo jeito — o gestor não fica sem medição esperando o SQL. A idempotência, nesse
  // meio-tempo, é só a do localStorage do cliente. Nunca derruba a tela do aluno.

  const attrib = prog?.attrib as any
  await enviarEventoGA4({
    nome: 'ativacao',
    userId: uid,
    clientId: attrib?.ga_cid || null,
    params: {
      gatilho,
      ...(attrib?.gclid ? { gclid: attrib.gclid } : {}),
    },
  })

  return NextResponse.json({ ok: true, ativadoEm: agora, gravado: !upErr })
}
