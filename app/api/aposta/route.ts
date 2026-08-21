import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// APOSTA DE 7 DIAS — prêmio no servidor.
//
// O aluno apostou (perfil_ia.aposta_inicio) e a sequência chegou a 7. O cliente já deu o
// protetor e as moedas; o que SÓ o servidor consegue dar é Premium: o trigger
// protege_profiles (protecao-custos.sql) ignora qualquer trial_expira que não venha da
// service role — por desenho, para ninguém se dar Premium pelo console do navegador.
//
// Regras (todas verificadas AQUI, não no cliente):
//   - streak >= 7 em progresso (fonte de verdade, não o estado da tela);
//   - aposta_inicio existe e aposta_ganha ainda não está gravada como data;
//   - quem já paga não ganha dias (não faz sentido estender trial de assinante);
//   - concede UMA vez: grava aposta_ganha no perfil_ia antes de responder.
// Extensão: +7 dias a partir de max(agora, trial_expira atual).
const DIAS_PREMIO = 7

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

  const admin = createClient(url, service)
  const [{ data: prog }, { data: perfil }] = await Promise.all([
    admin.from('progresso').select('streak, perfil_ia, is_premium, premium_expira').eq('user_id', uid).maybeSingle(),
    admin.from('profiles').select('trial_expira').eq('id', uid).maybeSingle(),
  ])
  if (!prog) return NextResponse.json({ ok: false, motivo: 'sem_progresso' }, { status: 404 })

  const pia: any = prog.perfil_ia && typeof prog.perfil_ia === 'object' ? prog.perfil_ia : {}
  const streak = Number(prog.streak || 0)
  if (!pia.aposta_inicio) return NextResponse.json({ ok: false, motivo: 'sem_aposta' })
  if (typeof pia.aposta_ganha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(pia.aposta_ganha) && pia.aposta_premio_servidor) {
    return NextResponse.json({ ok: true, jaPremiado: true, trialExpira: perfil?.trial_expira || null })
  }
  if (streak < 7) return NextResponse.json({ ok: false, motivo: 'streak_insuficiente', streak })

  const agora = Date.now()
  const hoje = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  const pagoAtivo = !!prog.is_premium && (!prog.premium_expira || new Date(prog.premium_expira).getTime() > agora)

  let trialExpira: string | null = perfil?.trial_expira || null
  if (!pagoAtivo) {
    const base = Math.max(agora, trialExpira ? new Date(trialExpira).getTime() : 0)
    trialExpira = new Date(base + DIAS_PREMIO * 86400000).toISOString()
    const { error } = await admin.from('profiles').update({ trial_expira: trialExpira }).eq('id', uid)
    if (error) return NextResponse.json({ ok: false, motivo: 'falha_trial', detalhe: error.message }, { status: 500 })
  }

  // Marca como premiada no servidor (idempotência por usuário, não por aparelho).
  const novoPerfil = { ...pia, aposta_ganha: typeof pia.aposta_ganha === 'string' && pia.aposta_ganha !== 'recusou' ? pia.aposta_ganha : hoje, aposta_premio_servidor: hoje }
  await admin.from('progresso').update({ perfil_ia: novoPerfil }).eq('user_id', uid)

  return NextResponse.json({ ok: true, trialExpira, pagoAtivo, diasPremio: pagoAtivo ? 0 : DIAS_PREMIO })
}
