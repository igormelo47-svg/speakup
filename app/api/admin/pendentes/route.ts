import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autenticarDono } from '../../../../lib/admin-auth'
import { acharExpiracao, extrairS1 } from '../../kiwify-webhook/route'

// Painel do dono — pagamentos que a Kiwify mandou e não casaram com nenhuma conta
// (aluno pagou com outro e-mail, sem s1). Ficam em `pagamentos_pendentes` esperando
// alguém casar na mão. Aqui o dono vê a lista e libera o Premium com um clique,
// sem precisar abrir o SQL Editor do Supabase (foi assim que a 1ª venda no Android,
// 17/08, ficou paga e sem acesso por dias).
//
// GET  → últimos 50 pendentes + últimas 20 batidas RECUSADAS do webhook (status != 200),
//        para enxergar um 401 (token errado/ausente na Kiwify) sem depender de log da Vercel.
// POST { id_pendente, email_ou_user_id } → faz o que o webhook faria numa compra aprovada:
//        is_premium=true, premium_expira conforme o plano do payload guardado, marca resolvido.
// Mesma autenticação do painel: allowlist de e-mails do dono.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function GET(req: NextRequest) {
  const auth = await autenticarDono(req.headers.get('authorization'))
  if (!auth.ok) return new NextResponse(auth.status === 401 ? 'unauthorized' : auth.status === 403 ? 'forbidden' : 'missing env', { status: auth.status })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return NextResponse.json({ error: 'missing env' }, { status: 500 })
  const admin = createClient(url, service)

  // Pendentes: a tabela pode não existir ainda (migracao_2026-08-18_freemium.sql cria) —
  // devolve lista vazia em vez de derrubar o painel.
  const { data: pend, error: pErr } = await admin.from('pagamentos_pendentes')
    .select('id, email, tipo, payload, resolvido, created_at')
    .order('created_at', { ascending: false }).limit(50)
  const pendentes = (pend || []).map(p => ({
    id: p.id,
    email: p.email,
    tipo: p.tipo,
    resolvido: !!p.resolvido,
    criado_em: p.created_at,
    // Só o que ajuda a casar: s1 (se veio), produto e nome do comprador. O payload inteiro
    // não vai para o cliente (tem CPF/telefone do aluno).
    s1: extrairS1(p.payload),
    produto: String(p.payload?.Product?.product_name || p.payload?.product?.name || p.payload?.Product?.name || '') || null,
    nome: String(p.payload?.Customer?.full_name || p.payload?.Customer?.name || p.payload?.customer?.name || '') || null,
  }))

  // Batidas recusadas do webhook: autorizado=false é exatamente o 401 do dia 17/08.
  const { data: rec } = await admin.from('webhook_recebidos')
    .select('id, criado_em, origem, autorizado, tem_segredo, tem_token, tem_assinatura, tipo, bytes')
    .eq('autorizado', false)
    .order('criado_em', { ascending: false }).limit(20)

  return NextResponse.json({
    geradoEm: new Date().toISOString(),
    pendentes,
    pendentes_erro: pErr?.message || null,
    recusados: rec || [],
  })
}

export async function POST(req: NextRequest) {
  const auth = await autenticarDono(req.headers.get('authorization'))
  if (!auth.ok) return new NextResponse(auth.status === 401 ? 'unauthorized' : auth.status === 403 ? 'forbidden' : 'missing env', { status: auth.status })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return NextResponse.json({ error: 'missing env' }, { status: 500 })

  let body: any = {}
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }) }
  const idPendente = Number(body?.id_pendente)
  const alvo = String(body?.email_ou_user_id || '').trim().toLowerCase()
  if (!idPendente || !alvo) return NextResponse.json({ error: 'id_pendente e email_ou_user_id são obrigatórios' }, { status: 400 })

  const admin = createClient(url, service)
  const { data: pend, error: pErr } = await admin.from('pagamentos_pendentes')
    .select('id, email, tipo, payload, resolvido').eq('id', idPendente).maybeSingle()
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })
  if (!pend) return NextResponse.json({ error: 'pendente não encontrado' }, { status: 404 })
  if (pend.resolvido) return NextResponse.json({ error: 'este pendente já foi resolvido' }, { status: 409 })

  // Acha a conta: por user_id (UUID) ou por e-mail em profiles (que sempre tem o e-mail do cadastro).
  let userId: string | null = null
  let emailConta: string | null = null
  if (UUID_RE.test(alvo)) {
    const { data: prof } = await admin.from('profiles').select('id, email').eq('id', alvo).maybeSingle()
    if (prof?.id) { userId = prof.id; emailConta = prof.email || null }
  } else {
    const emailEsc = alvo.replace(/[\\%_]/g, m => '\\' + m)
    const { data: prof } = await admin.from('profiles').select('id, email').ilike('email', emailEsc).limit(1)
    if (prof?.[0]?.id) { userId = prof[0].id; emailConta = prof[0].email || null }
  }
  if (!userId) return NextResponse.json({ error: 'nenhuma conta com esse e-mail/id — confira o cadastro do aluno' }, { status: 404 })

  // Mesmo efeito do webhook numa compra aprovada: Premium ligado até o fim do ciclo pago
  // (+folga), lendo plano/next_payment do payload que ficou guardado no pendente.
  const premiumExpira = acharExpiracao(pend.payload || {})
  const novo = { is_premium: true, premium_expira: premiumExpira, updated_at: new Date().toISOString() }
  const { error: upErr } = await admin.from('progresso')
    .upsert({ user_id: userId, ...(emailConta ? { email: emailConta } : {}), ...novo }, { onConflict: 'user_id' })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  // Marca o pendente como resolvido. `resolvido_em` é coluna nova (migração 2026-08-18):
  // se ainda não existir, marca só o boolean, que já basta para sumir da lista.
  const { error: r1 } = await admin.from('pagamentos_pendentes')
    .update({ resolvido: true, resolvido_em: new Date().toISOString() }).eq('id', idPendente)
  if (r1) await admin.from('pagamentos_pendentes').update({ resolvido: true }).eq('id', idPendente)

  return NextResponse.json({ ok: true, user_id: userId, email: emailConta, premium_expira: premiumExpira, liberado_por: auth.email })
}
