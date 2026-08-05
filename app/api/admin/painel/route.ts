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
  const contas: { email: string; criadoEm: string; interno: boolean; anuncio: boolean; ativado: boolean; diasUsados: number; licoes: number; sobreviveuAoTrial: boolean; voltouDepoisDoTrial: boolean; confirmouEmail: boolean; teveChanceDeVoltar: boolean; teveChanceDePassarDoTrial: boolean }[] = []
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
    // ultima_atividade grava 'YYYY-MM-DD' no app do aluno, mas nem toda linha antiga
    // esta assim -- concatenar 'T12:00:00Z' as cegas gerava Invalid Date, e NaN em
    // comparacao e sempre falso: os dois degraus finais davam zero mesmo com gente viva.
    const quando = (v: any): number => {
      if (!v) return 0
      const s = String(v)
      const t = new Date(s.length === 10 ? `${s}T12:00:00Z` : s).getTime()
      return Number.isFinite(t) ? t : 0
    }
    // O ultimo sinal de vida e o mais recente entre os tres, e nao so um deles: a
    // ultima_atividade so e escrita em alguns fluxos, e dias_ativos guarda o dia real.
    const ultima = Math.max(
      quando(prog?.ultima_atividade),
      quando(dias.length ? dias[dias.length - 1] : null),
      quando(prog?.updated_at),
    )
    const sobreviveuAoTrial = ativado && ultima >= fimDoTrial - MS_DIA  // ainda vivo no 2º dia
    const voltouDepoisDoTrial = ativado && ultima > fimDoTrial
    // Quem se cadastrou ontem ainda NAO TEVE CHANCE de voltar no dia seguinte nem de
    // ver o trial acabar. Contar essa pessoa como "nao voltou" e fabricar churn: ela
    // aparece como perda sem ter tido oportunidade de ficar. Só entra na conta de
    // retencao quem ja viveu tempo suficiente para o desfecho existir.
    const teveChanceDeVoltar = Date.now() - nasceu >= 2 * MS_DIA
    const teveChanceDePassarDoTrial = Date.now() - nasceu >= 3 * MS_DIA

    // Quem nunca clicou no link do e-mail nao consegue entrar -- e some do funil sem
    // nunca ter visto o app. Se esse numero for grande, a maior perda do produto e uma
    // configuracao do Supabase, nao a primeira licao.
    const confirmouEmail = !!(u as any).email_confirmed_at || !!(u as any).confirmed_at

    contas.push({ email: em, criadoEm: u.created_at, interno, anuncio, ativado, diasUsados: dias.length, licoes, sobreviveuAoTrial, voltouDepoisDoTrial, confirmouEmail, teveChanceDeVoltar, teveChanceDePassarDoTrial })
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

  // Onde as pessoas somem. São DUAS perguntas diferentes e juntá-las numa lista só
  // mente: "fez 3 lições" e "voltou outro dia" medem coisas independentes (profundidade
  // e recorrência), então numa lista única a segunda podia aparecer maior que a primeira
  // e a "maior queda" apontava para o degrau errado. Cada funil abaixo é de verdade
  // aninhado -- cada degrau é subconjunto do anterior.
  // Segmentar por origem não é detalhe: boa parte das contas orgânicas é gente que o
  // Emmanuel pediu pessoalmente para baixar e avaliar. Essa pessoa entra, olha e sai --
  // ela nunca teve intenção de aprender inglês, e misturá-la com quem clicou num anúncio
  // faz o funil parecer pior do que é. Quem decide o negócio é a coluna do anúncio.
  const premiumPorId = new Set(
    (progressos || [])
      .filter(p => p.is_premium && (!p.premium_expira || new Date(p.premium_expira).getTime() > agora))
      .map(p => p.user_id)
  )
  const idPorEmail = new Map((lista?.users || []).map(u => [(u.email || '').toLowerCase(), u.id]))

  function montarFunil(cs: typeof reais) {
    const ativs = cs.filter(c => c.ativado)
    const faixa = (min: number, max: number) => ativs.filter(c => c.teveChanceDeVoltar && c.diasUsados >= min && c.diasUsados <= max).length
    return {
      // Profundidade: até onde a pessoa foi na primeira vez que usou.
      profundidade: {
        criaramConta: cs.length,
        abriramOApp: ativs.length,
        fizeramUmaLicao: ativs.filter(c => c.licoes >= 1).length,
        fizeramTresLicoes: ativs.filter(c => c.licoes >= 3).length,
      },
      // Barreira do e-mail: mede se a maior perda do funil é uma configuração, e não o app.
      email: {
        criaramConta: cs.length,
        confirmaram: cs.filter(c => c.confirmouEmail).length,
        naoConfirmaram: cs.filter(c => !c.confirmouEmail).length,
        naoConfirmaramENaoUsaram: cs.filter(c => !c.confirmouEmail && !c.ativado).length,
      },
      // Permanência: quem continuou existindo depois do primeiro dia. Só entra quem já
      // teve TEMPO de voltar -- quem se cadastrou ontem não é churn, é conta nova.
      permanencia: (() => {
        const podiaVoltar = ativs.filter(c => c.teveChanceDeVoltar)
        const podiaPassarDoTrial = ativs.filter(c => c.teveChanceDePassarDoTrial)
        return {
          abriramOApp: podiaVoltar.length,
          voltaramOutroDia: podiaVoltar.filter(c => c.diasUsados >= 2).length,
          vivosNoFimDoTrial: podiaPassarDoTrial.filter(c => c.sobreviveuAoTrial).length,
          voltaramDepoisDoTrial: podiaPassarDoTrial.filter(c => c.voltouDepoisDoTrial).length,
          assinaram: cs.filter(c => { const id = idPorEmail.get(c.email); return id ? premiumPorId.has(id) : false }).length,
          // Quantas ficaram de fora por serem novas demais -- o painel precisa dizer
          // isso, senão a amostra encolhe em silêncio e ninguém percebe.
          novasDemaisParaContar: ativs.length - podiaVoltar.length,
        }
      })(),
      // Quantos dias cada pessoa usou. "1 dia" é a coluna que dói: entrou, olhou e
      // nunca mais voltou -- essa nunca chegou perto de decidir pagar. Mesmo recorte
      // de quem teve chance, pelo mesmo motivo.
      diasDeUso: {
        umDia: faixa(0, 1),
        doisATres: faixa(2, 3),
        quatroASeis: faixa(4, 6),
        seteOuMais: ativs.filter(c => c.teveChanceDeVoltar && c.diasUsados >= 7).length,
      },
    }
  }

  const funilPorOrigem = {
    anuncio: montarFunil(reais.filter(c => c.anuncio)),
    organico: montarFunil(reais.filter(c => !c.anuncio)),
    todos: montarFunil(reais),
  }
  const funil = funilPorOrigem.todos              // compatibilidade com a versão anterior
  const diasDeUso = funilPorOrigem.todos.diasDeUso

  return NextResponse.json({
    geradoEm: new Date().toISOString(),
    funil,
    funilPorOrigem,
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
