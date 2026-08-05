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
    .select('user_id, email, attrib, is_premium, premium_expira, xp, streak, updated_at, ativado_em, licoes_concluidas, dias_ativos, ultima_atividade')
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
  const contas: { email: string; criadoEm: string; interno: boolean; anuncio: boolean; ativado: boolean; diasUsados: number; licoes: number; sobreviveuAoTrial: boolean; voltouDepoisDoTrial: boolean }[] = []
  for (const u of lista?.users || []) {
    const em = (u.email || '').toLowerCase()
    const interno = INTERNOS.has(em)
    const prog = porUser.get(u.id) as any
    const attrib = prog?.attrib as any
    const anuncio = !!attrib?.gclid
    // Ativado = usou o app de fato. Contas antigas (anteriores à coluna) caem no XP como
    // aproximação, senão a taxa histórica apareceria zerada e assustaria à toa.
    const ativado = !!prog?.ativado_em || (prog?.xp || 0) > 0

    // Sobrevivência ao trial. A pergunta que isto responde é a que decide onde mexer:
    // se quase ninguém CHEGA ao fim dos 2 dias ainda usando, o problema não é preço --
    // a pessoa desistiu antes de ter motivo para pagar, e baixar o valor não muda nada.
    const dias: string[] = Array.isArray(prog?.dias_ativos) ? prog.dias_ativos : []
    const licoes = Array.isArray(prog?.licoes_concluidas) ? prog.licoes_concluidas.length : 0
    const nasceu = new Date(u.created_at).getTime()
    const fimDoTrial = nasceu + 2 * MS_DIA
    const ultima = prog?.ultima_atividade ? new Date(prog.ultima_atividade + 'T12:00:00Z').getTime()
      : (prog?.updated_at ? new Date(prog.updated_at).getTime() : 0)
    const sobreviveuAoTrial = ativado && ultima >= fimDoTrial - MS_DIA  // ainda vivo no 2º dia
    const voltouDepoisDoTrial = ativado && ultima > fimDoTrial

    contas.push({ email: em, criadoEm: u.created_at, interno, anuncio, ativado, diasUsados: dias.length, licoes, sobreviveuAoTrial, voltouDepoisDoTrial })
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

  // Ativação por origem — a resposta para "o gargalo é o tráfego ou o produto?".
  // Taxas parecidas nas duas colunas = o problema está depois do cadastro (produto).
  // Anúncio bem pior que orgânico = a segmentação está trazendo gente errada.
  const fatia = (cs: typeof reais) => ({
    contas: cs.length,
    ativados: cs.filter(c => c.ativado).length,
    taxa: cs.length ? Math.round((cs.filter(c => c.ativado).length / cs.length) * 1000) / 10 : 0,
  })

  // Funil de retenção: onde as pessoas somem. Cada degrau é subconjunto do anterior,
  // então a maior queda entre dois degraus é o lugar exato para trabalhar. Enquanto o
  // buraco estiver antes do último degrau, mexer em preço é resolver o problema errado.
  const ativados = reais.filter(c => c.ativado)
  const funil = {
    criaramConta: reais.length,
    abriramOApp: ativados.length,
    fizeramUmaLicao: ativados.filter(c => c.licoes >= 1).length,
    fizeramTresLicoes: ativados.filter(c => c.licoes >= 3).length,
    usaramDoisDiasOuMais: ativados.filter(c => c.diasUsados >= 2).length,
    aindaAtivosNoFimDoTrial: ativados.filter(c => c.sobreviveuAoTrial).length,
    voltaramDepoisDoTrial: ativados.filter(c => c.voltouDepoisDoTrial).length,
    assinaram: assinantes.filter(a => !a.interno).length,
  }
  // Quantos dias cada pessoa usou, em faixas. "1 dia" é a coluna que dói: entrou,
  // olhou e nunca mais voltou -- essa pessoa nunca chegou perto de decidir pagar.
  const faixa = (min: number, max: number) => ativados.filter(c => c.diasUsados >= min && c.diasUsados <= max).length
  const diasDeUso = {
    umDia: faixa(0, 1),
    doisATres: faixa(2, 3),
    quatroASeis: faixa(4, 6),
    seteOuMais: ativados.filter(c => c.diasUsados >= 7).length,
  }

  return NextResponse.json({
    geradoEm: new Date().toISOString(),
    funil,
    diasDeUso,
    totais: {
      contas: reais.length,
      contas7d: reais.filter(c => new Date(c.criadoEm).getTime() > seteDias).length,
      viaAnuncio: reais.filter(c => c.anuncio).length,
      assinantesReais: assinantes.filter(a => !a.interno).length,
      assinantesInternos: assinantes.filter(a => a.interno).length,
      receitaMensalEstimada: assinantes.filter(a => !a.interno).length * 29.9,
    },
    ativacao: {
      geral: fatia(reais),
      anuncio: fatia(reais.filter(c => c.anuncio)),
      organico: fatia(reais.filter(c => !c.anuncio)),
    },
    porDia: Object.entries(porDia).map(([dia, v]) => ({ dia, ...v })),
    assinantes,
  })
}
