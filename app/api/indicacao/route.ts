import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Indicação (convide um amigo): o novo aluno entra por um link ?ref=<user_id do indicador>.
// Recompensas: novo aluno ganha +2 dias de trial Premium; quem indicou ganha +100 moedas.
// Proteções: só conta 1 vez por conta (perfil_ia.indicado_por), só para contas recém-criadas
// (progresso.criado_em até 7 dias) e ninguém pode indicar a si mesmo.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon || !service) return NextResponse.json({ error: 'missing env' }, { status: 500 })

  // 1) Autentica o NOVO aluno (quem foi indicado).
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  let novoId = ''
  try {
    const sb = createClient(url, anon)
    const { data, error } = await sb.auth.getUser(token)
    if (error || !data?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    novoId = data.user.id
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  // 2) Valida o código de indicação.
  let ref = ''
  try { ref = String((await req.json())?.ref || '').trim().toLowerCase() } catch {}
  if (!UUID_RE.test(ref)) return NextResponse.json({ ok: false, motivo: 'codigo_invalido' })
  if (ref === novoId.toLowerCase()) return NextResponse.json({ ok: false, motivo: 'auto_indicacao' })

  const admin = createClient(url, service)

  // 3) Regras do novo aluno: conta recente e ainda sem indicação registrada.
  // criado_em NULO conta como conta antiga (fail-closed): sem data não dá pra provar que é nova.
  const { data: novoRows } = await admin.from('progresso').select('perfil_ia, criado_em').eq('user_id', novoId).limit(1)
  const novo = novoRows?.[0]
  if (!novo) return NextResponse.json({ ok: false, motivo: 'sem_progresso' })
  if (novo.perfil_ia?.indicado_por) return NextResponse.json({ ok: false, motivo: 'ja_usado' }) // contas de antes da coluna
  if (!novo.criado_em || Date.now() - new Date(novo.criado_em).getTime() > 7 * 86400000) {
    return NextResponse.json({ ok: false, motivo: 'conta_antiga' })
  }

  // 4) Confere que o indicador existe.
  const { data: refRows } = await admin.from('progresso').select('user_id, perfil_ia').eq('user_id', ref).limit(1)
  const indicador = refRows?.[0]
  if (!indicador) return NextResponse.json({ ok: false, motivo: 'indicador_nao_encontrado' })

  // 5) TRAVA ATÔMICA antes de qualquer recompensa: a coluna progresso.indicado_por é
  // protegida por trigger (o cliente não escreve nela) e o RPC só casa quando ainda é NULL —
  // N requisições em paralelo: exatamente UMA passa. Mata a race e o re-resgate que
  // existiam quando a trava vivia em perfil_ia (gravável pelo próprio aluno).
  const { data: conseguiu, error: claimErr } = await admin.rpc('marca_indicacao', { p_user: novoId, p_ref: ref })
  if (claimErr || conseguiu !== true) return NextResponse.json({ ok: false, motivo: 'ja_usado' })

  // 6) Recompensa o NOVO aluno: +2 dias de trial Premium (a partir de agora ou do fim do trial atual).
  const { data: profRows } = await admin.from('profiles').select('trial_expira').eq('id', novoId).limit(1)
  const atual = profRows?.[0]?.trial_expira ? new Date(profRows[0].trial_expira).getTime() : 0
  const base = Math.max(atual, Date.now())
  await admin.from('profiles').update({ trial_expira: new Date(base + 2 * 86400000).toISOString() }).eq('id', novoId)
  // Espelho em perfil_ia só para exibição no app (a trava de verdade é a coluna).
  await admin.from('progresso').update({
    perfil_ia: { ...(novo.perfil_ia || {}), indicado_por: ref },
    updated_at: new Date().toISOString(),
  }).eq('user_id', novoId)

  // 7) Recompensa o INDICADOR: +100 moedas (incremento atômico no banco — o
  // read-modify-write antigo perdia moedas em chamadas concorrentes).
  await admin.rpc('soma_moedas', { p_user: ref, p_qtd: 100 })
  const perfilInd = indicador.perfil_ia || {}
  await admin.from('progresso').update({
    perfil_ia: { ...perfilInd, indicacoes: (perfilInd.indicacoes || 0) + 1 },
    updated_at: new Date().toISOString(),
  }).eq('user_id', ref)

  return NextResponse.json({ ok: true, bonus_dias: 2 })
}
