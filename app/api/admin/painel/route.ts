import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Painel do dono (vonai.com.br/admin): cadastros por dia + assinantes.
// Só responde para as contas do Emmanuel — qualquer outro login recebe 403.
// Dados saem com o service role no servidor; nada disso fica exposto no cliente.

const DONOS = ['igorckl@hotmail.com', 'igormelo47@gmail.com']
const INTERNOS = new Set([...DONOS, 'apple.review.2026@vonai-teste.com', 'google.review@vonai.com.br'])

export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon || !service) return NextResponse.json({ error: 'missing env' }, { status: 500 })

  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return new NextResponse('unauthorized', { status: 401 })
  const auth = createClient(url, anon)
  const { data: userData, error: userErr } = await auth.auth.getUser(token)
  const email = userData?.user?.email?.toLowerCase()
  if (userErr || !email || !DONOS.includes(email)) return new NextResponse('forbidden', { status: 403 })

  const admin = createClient(url, service)
  const { data: lista, error: luErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (luErr) return NextResponse.json({ error: luErr.message }, { status: 500 })
  const { data: progressos, error: pErr } = await admin
    .from('progresso')
    .select('user_id, email, attrib, is_premium, premium_expira, xp, streak, updated_at')
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 })
  const porUser = new Map((progressos || []).map(p => [p.user_id, p]))

  // Cadastros por dia (fuso de Maceió = UTC-3), últimos 30 dias, com origem.
  const MS_DIA = 86400000
  const diaLocal = (iso: string) => new Date(new Date(iso).getTime() - 3 * 3600000).toISOString().slice(0, 10)
  const hoje = diaLocal(new Date().toISOString())
  const porDia: Record<string, { total: number; anuncio: number; organico: number; internos: number }> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date(new Date(hoje + 'T12:00:00Z').getTime() - i * MS_DIA).toISOString().slice(0, 10)
    porDia[d] = { total: 0, anuncio: 0, organico: 0, internos: 0 }
  }
  const contas: { email: string; criadoEm: string; interno: boolean; anuncio: boolean }[] = []
  for (const u of lista?.users || []) {
    const em = (u.email || '').toLowerCase()
    const interno = INTERNOS.has(em)
    const attrib = porUser.get(u.id)?.attrib as any
    const anuncio = !!attrib?.gclid
    contas.push({ email: em, criadoEm: u.created_at, interno, anuncio })
    const d = diaLocal(u.created_at)
    if (porDia[d]) {
      if (interno) porDia[d].internos++
      else { porDia[d].total++; anuncio ? porDia[d].anuncio++ : porDia[d].organico++ }
    }
  }

  // Assinantes com acesso pago valendo agora.
  const agora = Date.now()
  const emailPorId = new Map((lista?.users || []).map(u => [u.id, (u.email || '').toLowerCase()]))
  const assinantes = (progressos || [])
    .filter(p => p.is_premium && (!p.premium_expira || new Date(p.premium_expira).getTime() > agora))
    .map(p => {
      const em = (p.email || emailPorId.get(p.user_id) || '').toLowerCase()
      return {
        email: em,
        interno: INTERNOS.has(em),
        canal: p.premium_expira ? 'Kiwify (web/Android)' : 'Apple (iOS) ou manual',
        validoAte: p.premium_expira,
        xp: p.xp || 0,
        streak: p.streak || 0,
        ultimaAtividade: p.updated_at,
      }
    })
    .sort((a, b) => Number(a.interno) - Number(b.interno))

  const reais = contas.filter(c => !c.interno)
  const seteDias = agora - 7 * MS_DIA
  return NextResponse.json({
    geradoEm: new Date().toISOString(),
    totais: {
      contas: reais.length,
      contas7d: reais.filter(c => new Date(c.criadoEm).getTime() > seteDias).length,
      viaAnuncio: reais.filter(c => c.anuncio).length,
      assinantesReais: assinantes.filter(a => !a.interno).length,
      assinantesInternos: assinantes.filter(a => a.interno).length,
      receitaMensalEstimada: assinantes.filter(a => !a.interno).length * 29.9,
    },
    porDia: Object.entries(porDia).map(([dia, v]) => ({ dia, ...v })),
    assinantes,
  })
}
