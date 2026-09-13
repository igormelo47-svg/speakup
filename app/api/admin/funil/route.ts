import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autenticarDono } from '../../../../lib/admin-auth'
import { FUNIL_ETAPAS, EV } from '../../../../lib/funil'
import { EXPERIMENTOS } from '../../../../lib/experimento'

// ============================================================================
// /api/admin/funil — o funil inteiro num JSON, lido de `eventos_funil`.
//
// Responde as perguntas que hoje não têm dono: de 100 que chegam, quantos terminam o
// teste de nível? quantos criam conta? quantos fazem a 1ª lição? quantos veem a oferta?
// quantos abrem o checkout? quantos assinam? — e, em cada degrau, quantos por canal e por
// variante de A/B.
//
// Duas decisões que valem explicação:
//
// 1. Conta PESSOAS, não eventos. A unidade é `identidade` (user_id quando existe, anon_id
//    antes do cadastro). Contar linhas faria quem abre o app cinco vezes valer cinco, e a
//    taxa de conversão do degrau seguinte despencaria sem nada ter acontecido.
//
// 2. Não tenta declarar vencedor de A/B. Devolve os números das variantes lado a lado e
//    para por aí. Com o volume atual do Vonai (dezenas de assinaturas, não milhares),
//    qualquer "A ganhou" calculado aqui seria ruído com cara de conclusão.
// ============================================================================

export const runtime = 'nodejs'

type Linha = {
  evento: string
  identidade: string
  canal: string | null
  variante: string | null
  props: Record<string, unknown> | null
  criado_em: string
}

export async function GET(req: NextRequest) {
  const auth = await autenticarDono(req.headers.get('authorization'))
  if (!auth.ok) return new NextResponse(auth.status === 401 ? 'unauthorized' : 'forbidden', { status: auth.status })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return NextResponse.json({ error: 'missing env' }, { status: 500 })

  const dias = Math.min(90, Math.max(1, Number(req.nextUrl.searchParams.get('dias') || 30)))
  const desde = new Date(Date.now() - dias * 86400000).toISOString()

  const admin = createClient(url, service)

  // Paginação explícita: o PostgREST devolve 1000 linhas por vez e, sem isto, um mês
  // movimentado apareceria truncado — com o topo do funil certo e o fundo faltando, que é
  // a forma mais convincente de um relatório estar errado.
  const linhas: Linha[] = []
  const PAGINA = 1000
  for (let p = 0; p < 60; p++) {
    const { data, error } = await admin
      .from('eventos_funil')
      .select('evento, identidade, canal, variante, props, criado_em')
      .gte('criado_em', desde)
      .order('criado_em', { ascending: true })
      .range(p * PAGINA, p * PAGINA + PAGINA - 1)
    if (error) {
      return NextResponse.json({
        error: error.message,
        dica: /relation|does not exist/i.test(error.message)
          ? 'A tabela eventos_funil ainda não existe: rode migracao_2026-09-13_funil.sql no Supabase.'
          : undefined,
      }, { status: 500 })
    }
    if (!data || data.length === 0) break
    linhas.push(...(data as Linha[]))
    if (data.length < PAGINA) break
  }

  // ---- Funil principal: pessoas distintas por degrau --------------------------
  const pessoasPorEvento = new Map<string, Set<string>>()
  const pessoasPorEventoCanal = new Map<string, Map<string, Set<string>>>()
  for (const l of linhas) {
    if (!pessoasPorEvento.has(l.evento)) pessoasPorEvento.set(l.evento, new Set())
    pessoasPorEvento.get(l.evento)!.add(l.identidade)
    const canal = l.canal || 'desconhecido'
    if (!pessoasPorEventoCanal.has(l.evento)) pessoasPorEventoCanal.set(l.evento, new Map())
    const m = pessoasPorEventoCanal.get(l.evento)!
    if (!m.has(canal)) m.set(canal, new Set())
    m.get(canal)!.add(l.identidade)
  }
  const conta = (e: string) => pessoasPorEvento.get(e)?.size || 0

  const topo = conta(FUNIL_ETAPAS[0].evento)
  const etapas = FUNIL_ETAPAS.map((et, i) => {
    const n = conta(et.evento)
    const anterior = i === 0 ? n : conta(FUNIL_ETAPAS[i - 1].evento)
    return {
      evento: et.evento,
      rotulo: et.rotulo,
      pessoas: n,
      // Duas taxas de propósito: a do degrau anterior mostra ONDE vaza; a do topo mostra
      // QUANTO sobra. Só a segunda é a taxa de conversão do produto.
      doAnterior: anterior > 0 ? Math.round((n / anterior) * 1000) / 10 : null,
      doTopo: topo > 0 ? Math.round((n / topo) * 1000) / 10 : null,
      porCanal: Object.fromEntries(
        [...(pessoasPorEventoCanal.get(et.evento) || new Map())].map(([c, s]) => [c, s.size]),
      ),
    }
  })

  // Maior queda absoluta entre degraus consecutivos — o lugar onde mexer primeiro.
  let maiorQueda: { de: string; para: string; perdidos: number; taxa: number } | null = null
  for (let i = 1; i < etapas.length; i++) {
    const perdidos = etapas[i - 1].pessoas - etapas[i].pessoas
    if (perdidos > 0 && (!maiorQueda || perdidos > maiorQueda.perdidos)) {
      maiorQueda = {
        de: etapas[i - 1].rotulo,
        para: etapas[i].rotulo,
        perdidos,
        taxa: etapas[i].doAnterior ?? 0,
      }
    }
  }

  // ---- Qual MOMENTO da oferta leva mais gente ao checkout ---------------------
  // O gatilho viaja em props.gatilho tanto no paywall visto quanto no checkout iniciado —
  // é o que permite comparar "fim da lição" com "chip do topo" sem inventar atribuição.
  const porGatilho = new Map<string, { viram: Set<string>; checkout: Set<string>; assinaram: Set<string> }>()
  const garante = (g: string) => {
    if (!porGatilho.has(g)) porGatilho.set(g, { viram: new Set(), checkout: new Set(), assinaram: new Set() })
    return porGatilho.get(g)!
  }
  // Último gatilho visto por pessoa, para creditar a assinatura a algum momento.
  const ultimoGatilho = new Map<string, string>()
  for (const l of linhas) {
    const g = String((l.props || {}).gatilho || 'desconhecido')
    if (l.evento === EV.PAYWALL_VISTO) { garante(g).viram.add(l.identidade); ultimoGatilho.set(l.identidade, g) }
    if (l.evento === EV.CHECKOUT_INICIADO) garante(g).checkout.add(l.identidade)
    if (l.evento === EV.ASSINATURA_CONCLUIDA) {
      const gg = ultimoGatilho.get(l.identidade) || 'desconhecido'
      garante(gg).assinaram.add(l.identidade)
    }
  }
  const gatilhos = [...porGatilho.entries()]
    .map(([gatilho, v]) => ({
      gatilho,
      viram: v.viram.size,
      checkout: v.checkout.size,
      assinaram: v.assinaram.size,
      taxa: v.viram.size > 0 ? Math.round((v.assinaram.size / v.viram.size) * 1000) / 10 : null,
    }))
    .sort((a, b) => b.viram - a.viram)

  // ---- Planos e gateways ------------------------------------------------------
  const planoSel = new Map<string, Set<string>>()
  const planoAss = new Map<string, Set<string>>()
  const gatewayCheckout = new Map<string, Set<string>>()
  const falhas: { motivo: string; gateway: string; quando: string }[] = []
  for (const l of linhas) {
    const props = l.props || {}
    if (l.evento === EV.PLANO_SELECIONADO) {
      const p = String(props.plano || '?')
      if (!planoSel.has(p)) planoSel.set(p, new Set())
      planoSel.get(p)!.add(l.identidade)
    }
    if (l.evento === EV.ASSINATURA_CONCLUIDA) {
      const p = String(props.plano || '?')
      if (!planoAss.has(p)) planoAss.set(p, new Set())
      planoAss.get(p)!.add(l.identidade)
    }
    if (l.evento === EV.CHECKOUT_INICIADO) {
      const g = String(props.gateway || '?')
      if (!gatewayCheckout.has(g)) gatewayCheckout.set(g, new Set())
      gatewayCheckout.get(g)!.add(l.identidade)
    }
    // Falha de checkout é o alarme mais importante desta tela: é o número que teria
    // gritado em 30/08 que o Stripe estava sem env e todo mundo caía na Kiwify.
    if (l.evento === EV.CHECKOUT_FALHOU) {
      falhas.push({ motivo: String(props.motivo || '?'), gateway: String(props.gateway || '?'), quando: l.criado_em })
    }
  }
  const planos = [...new Set([...planoSel.keys(), ...planoAss.keys()])].map(p => ({
    plano: p,
    escolheram: planoSel.get(p)?.size || 0,
    assinaram: planoAss.get(p)?.size || 0,
    taxa: (planoSel.get(p)?.size || 0) > 0
      ? Math.round(((planoAss.get(p)?.size || 0) / (planoSel.get(p)!.size)) * 1000) / 10
      : null,
  }))

  // ---- Ciclo de vida por e-mail: mandou → clicou → assinou -------------------
  // A sequência de retorno (dia 2, dia 3, fim de teste, pós-teste) já existia no código há
  // semanas e nunca produziu um número. Aqui ela finalmente é avaliável por chave: se o
  // dia 3 manda 40 e traz 0 cliques, ele não está "ajudando um pouco" — está gastando
  // reputação de domínio, e é melhor desligar.
  const porEmail = new Map<string, { enviados: Set<string>; cliques: Set<string>; assinaram: Set<string> }>()
  const garanteEmail = (k: string) => {
    if (!porEmail.has(k)) porEmail.set(k, { enviados: new Set(), cliques: new Set(), assinaram: new Set() })
    return porEmail.get(k)!
  }
  const clicouEm = new Map<string, string>()
  for (const l of linhas) {
    const k = String((l.props || {}).chave || '?')
    if (l.evento === EV.EMAIL_ENVIADO) garanteEmail(k).enviados.add(l.identidade)
    if (l.evento === EV.EMAIL_CLIQUE) { garanteEmail(k).cliques.add(l.identidade); clicouEm.set(l.identidade, k) }
    if (l.evento === EV.ASSINATURA_CONCLUIDA) {
      const origem = clicouEm.get(l.identidade)
      if (origem) garanteEmail(origem).assinaram.add(l.identidade)
    }
  }
  const emails = [...porEmail.entries()]
    .map(([chave, v]) => ({
      chave,
      enviados: v.enviados.size,
      cliques: v.cliques.size,
      assinaram: v.assinaram.size,
      taxaClique: v.enviados.size > 0 ? Math.round((v.cliques.size / v.enviados.size) * 1000) / 10 : null,
    }))
    .sort((a, b) => b.enviados - a.enviados)

  // ---- Retenção por dia de vida (de vn_app_aberto, props.dia) -----------------
  const retencao = new Map<number, Set<string>>()
  for (const l of linhas) {
    if (l.evento !== EV.APP_ABERTO) continue
    const d = Number((l.props || {}).dia)
    if (!Number.isFinite(d) || d < 0 || d > 30) continue
    if (!retencao.has(d)) retencao.set(d, new Set())
    retencao.get(d)!.add(l.identidade)
  }
  const d0 = retencao.get(0)?.size || 0
  const curvaRetencao = [0, 1, 2, 3, 7, 14, 30].map(d => ({
    dia: d,
    pessoas: retencao.get(d)?.size || 0,
    pctDoD0: d0 > 0 ? Math.round(((retencao.get(d)?.size || 0) / d0) * 1000) / 10 : null,
  }))

  // ---- A/B: números lado a lado, sem veredicto -------------------------------
  const experimentos = Object.entries(EXPERIMENTOS)
    .filter(([, def]) => def.ativo)
    .map(([nome, def]) => {
      const porVariante = def.variantes.map(v => {
        const viram = new Set<string>()
        const assinaram = new Set<string>()
        for (const l of linhas) {
          if (!l.variante) continue
          // Comparação por par exato, não por `includes`: com variantes de nome parecido
          // ("plano" e "plano_b") o includes casaria as duas e o teste devolveria números
          // que parecem certos e não são.
          const pares = l.variante.split(';')
          if (!pares.includes(`${nome}=${v}`)) continue
          if (l.evento === EV.PAYWALL_VISTO) viram.add(l.identidade)
          if (l.evento === EV.ASSINATURA_CONCLUIDA) assinaram.add(l.identidade)
        }
        return {
          variante: v,
          viramOferta: viram.size,
          assinaram: assinaram.size,
          taxa: viram.size > 0 ? Math.round((assinaram.size / viram.size) * 1000) / 10 : null,
        }
      })
      const amostra = porVariante.reduce((a, b) => a + b.viramOferta, 0)
      return {
        nome,
        pergunta: def.pergunta,
        variantes: porVariante,
        // Aviso honesto em vez de vencedor: abaixo de algumas centenas por variante a
        // diferença observada é indistinguível de sorte.
        conclusivo: false,
        aviso: amostra < 200
          ? `Amostra pequena (${amostra} pessoas viram a oferta). Ainda não dá para comparar — deixe rodar.`
          : 'Amostra razoável, mas a diferença ainda precisa ser avaliada com cuidado antes de escolher um lado.',
      }
    })

  return NextResponse.json({
    dias,
    desde,
    totalEventos: linhas.length,
    etapas,
    maiorQueda,
    gatilhos,
    planos,
    gateways: Object.fromEntries([...gatewayCheckout].map(([g, s]) => [g, s.size])),
    falhasCheckout: { total: falhas.length, ultimas: falhas.slice(-10).reverse() },
    curvaRetencao,
    emails,
    experimentos,
  })
}
