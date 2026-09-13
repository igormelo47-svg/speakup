import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { enviarEventoGA4 } from '../../../lib/ga4'
import { ipCliente } from '../../../lib/ip-cliente'

// ============================================================================
// /api/funil — o único lugar onde um degrau do funil vira dado nosso.
//
// Recebe o que `funil()` (lib/funil.ts) manda do navegador e faz três coisas:
//   1. grava em `eventos_funil` — a tabela que o /admin lê para desenhar
//      visita → teste → conta → onboarding → 1ª lição → oferta → checkout → assinatura;
//   2. espelha no GA4 pelo Measurement Protocol quando o aluno está logado, para o evento
//      existir no GA4 mesmo sem tag no GTM (o contêiner é do gestor de tráfego, não nosso);
//   3. carimba de onde a pessoa veio (attrib) e qual variante de A/B ela pegou, para a
//      comparação entre variantes e entre canais ser feita depois, com número real.
//
// Aceita evento ANÔNIMO de propósito. A maior perda medida do Vonai acontece ANTES da conta
// existir (603 testes de nível → 149 contas). Sem anon_id esse degrau não tem como ser
// contado, e o funil começa tarde demais para servir de diagnóstico.
//
// Contrato de robustez: esta rota NUNCA devolve erro que faça o cliente repetir e NUNCA
// bloqueia nada. Se o banco estiver fora, ela responde ok:true com gravado:false. Perder
// uma medição é aceitável; atrapalhar o aluno não é.
// ============================================================================

export const runtime = 'nodejs'

// Teto por IP e por minuto. Evento de funil é escrito pelo próprio navegador, então a
// rota é pública por definição — o limite existe para um script não inflar a tabela.
const LIMITE_MIN = 120
const janelas = new Map<string, { n: number; ate: number }>()

function passouDoLimite(ip: string): boolean {
  const agora = Date.now()
  const j = janelas.get(ip)
  if (!j || agora > j.ate) {
    janelas.set(ip, { n: 1, ate: agora + 60_000 })
    // Limpeza preguiçosa: sem isto o Map cresce para sempre numa instância quente.
    if (janelas.size > 5000) for (const [k, v] of janelas) if (agora > v.ate) janelas.delete(k)
    return false
  }
  j.n++
  return j.n > LIMITE_MIN
}

const NOME_OK = /^[a-z0-9_]{3,40}$/

export async function POST(req: NextRequest) {
  if (passouDoLimite(ipCliente(req))) return NextResponse.json({ ok: true, gravado: false, motivo: 'limite' })

  let body: { evento?: string; props?: Record<string, unknown>; umaVez?: boolean } = {}
  try { body = await req.json() } catch { return NextResponse.json({ ok: true, gravado: false, motivo: 'corpo' }) }

  const evento = String(body?.evento || '')
  if (!NOME_OK.test(evento)) return NextResponse.json({ ok: true, gravado: false, motivo: 'nome' })

  // Só escalares, no máximo 20 chaves: props é jsonb e um objeto aninhado grande vindo do
  // cliente é porta de entrada para inchar a tabela.
  const props: Record<string, string | number | boolean> = {}
  const entradas = Object.entries(body?.props || {}).slice(0, 20)
  for (const [k, v] of entradas) {
    if (!/^[a-z0-9_]{1,32}$/.test(k)) continue
    if (typeof v === 'string') props[k] = v.slice(0, 200)
    else if (typeof v === 'number' && Number.isFinite(v)) props[k] = v
    else if (typeof v === 'boolean') props[k] = v
  }

  const anonIdent = typeof props.anon_id === 'string' ? props.anon_id : ''
  const sessao = typeof props.sessao === 'string' ? props.sessao : null

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anonKey || !service) return NextResponse.json({ ok: true, gravado: false, motivo: 'env' })

  // Identidade: o token do Supabase manda. `user_id` vindo no corpo é só dica para o
  // dataLayer — aqui ele nunca é aceito como verdade, senão qualquer um escreveria evento
  // no nome de outra pessoa e o funil viraria ficção.
  let userId: string | null = null
  const auth = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (auth) {
    try {
      const cliente = createClient(url, anonKey)
      const { data } = await cliente.auth.getUser(auth)
      userId = data?.user?.id || null
    } catch {}
  }

  const identidade = userId || anonIdent
  if (!identidade) return NextResponse.json({ ok: true, gravado: false, motivo: 'sem_identidade' })

  const admin = createClient(url, service)

  // Origem do aluno (anúncio x orgânico) e variantes de A/B. Ficam em colunas próprias
  // para o /admin conseguir agrupar sem abrir o jsonb linha a linha.
  let canal: string | null = null
  let variante: string | null = null
  if (typeof props.variante === 'string') variante = props.variante
  if (userId) {
    try {
      const { data: prog } = await admin.from('progresso').select('attrib').eq('user_id', userId).maybeSingle()
      const attrib = (prog?.attrib || {}) as Record<string, unknown>
      canal = attrib.gclid || attrib.gbraid || attrib.wbraid ? 'google'
        : attrib.fbclid ? 'meta'
        : 'organico'
    } catch {}
  }

  const linha = {
    evento,
    user_id: userId,
    anon_id: anonIdent || null,
    identidade,
    sessao,
    canal,
    variante,
    etapa: !!body?.umaVez,
    props,
    criado_em: new Date().toISOString(),
  }

  let gravado = false
  let motivoFalha: string | null = null
  try {
    // Degrau (`umaVez`) só pode existir uma vez por pessoa. A idempotência de verdade tem
    // que ser do BANCO, não do localStorage: quem troca de celular ou limpa o cache
    // dispararia "1ª lição concluída" de novo e o funil passaria a mostrar mais gente no
    // degrau 5 do que no degrau 4. A coluna `identidade` é justamente o que permite isso
    // (user_id quando existe, anon_id antes do cadastro).
    if (body?.umaVez) {
      const { data: ja } = await admin
        .from('eventos_funil')
        .select('id')
        .eq('identidade', identidade)
        .eq('evento', evento)
        .limit(1)
        .maybeSingle()
      if (ja) return NextResponse.json({ ok: true, gravado: false, motivo: 'ja_registrado' })
    }
    const { error } = await admin.from('eventos_funil').insert(linha)
    gravado = !error
    // Corrida entre duas abas cai no índice único de migracao_2026-09-13_funil.sql e é
    // esperada — não é erro que mereça log.
    if (error && !/duplicate|conflict|unique/i.test(error.message || '')) {
      console.warn('[funil] não gravou', evento, error.message)
      // O motivo volta na resposta de propósito. Sem isto, "não gravou" é indistinguível
      // de "gravou" do lado de fora, e a tabela ausente vira um silêncio de duas semanas —
      // exatamente o erro que esta rota existe para não deixar acontecer de novo.
      motivoFalha = String(error.message || '').slice(0, 160)
    }
  } catch (e) {
    console.warn('[funil] exceção ao gravar', e instanceof Error ? e.message : e)
    motivoFalha = e instanceof Error ? e.message.slice(0, 160) : 'excecao'
  }

  // Espelho no GA4 sem passar pelo GTM. Só para logado: o Measurement Protocol exige
  // user_id/client_id estável, e um anônimo geraria usuário novo a cada evento.
  if (userId) {
    try {
      await enviarEventoGA4({ nome: evento, userId, params: { ...props, canal: canal || 'desconhecido' } })
    } catch {}
  }

  return NextResponse.json({ ok: true, gravado, ...(motivoFalha ? { motivo: motivoFalha } : {}) })
}

// Diagnóstico rápido: se isto responder `tabela:false`, o SQL de migração não foi aplicado
// e o funil do /admin vai aparecer zerado — o que parece produto quebrado e é só migração.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return NextResponse.json({ ok: true, tabela: false, motivo: 'env ausente' })
  try {
    const admin = createClient(url, service)
    // `select('*', { head: true })` NÃO erra quando a tabela não existe — devolve count
    // null e error null, e o diagnóstico dizia "tabela: true" com a migração sem rodar
    // (visto ao vivo em 13/09/2026). Uma leitura de verdade é o que realmente erra.
    const { error } = await admin.from('eventos_funil').select('id').limit(1)
    if (error) return NextResponse.json({ ok: true, tabela: false, motivo: error.message })
    const { count } = await admin.from('eventos_funil').select('*', { count: 'exact', head: true })
    return NextResponse.json({ ok: true, tabela: true, eventos: count ?? 0 })
  } catch (e) {
    return NextResponse.json({ ok: true, tabela: false, motivo: e instanceof Error ? e.message : 'falha' })
  }
}
