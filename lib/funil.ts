// ============================================================================
// FUNIL — um nome por etapa, três destinos, uma chamada.
//
// Por que este arquivo existe. Até 13/09/2026 a medição do Vonai estava partida em dois
// sistemas que não se falam:
//   1. `dataLayer.push` (GTM) — só vira número no GA4 se existir uma TAG correspondente no
//      contêiner, que é conta do gestor de tráfego. Evento sem tag não existe.
//   2. `track()` do Vercel Analytics — bom para uso de feature, inútil para funil (não dá
//      para cruzar com origem do anúncio nem para montar coorte).
// O resultado prático: ninguém conseguia responder "de 100 que instalam, quantos chegam à
// tela de assinatura?" — e sem essa resposta toda mudança de produto vira chute.
//
// `funil()` resolve mandando o MESMO evento para os três lugares de uma vez:
//   • dataLayer  → o gestor de tráfego continua podendo criar tags/conversões como sempre;
//   • Vercel     → continua aparecendo no painel de uso;
//   • /api/funil → grava na NOSSA tabela `eventos_funil` e espelha no GA4 pelo Measurement
//                  Protocol (sem depender de tag nenhuma). É esta a fonte do /admin.
//
// Regras que valem para quem for mexer aqui:
//   • medição NUNCA derruba a tela do aluno: tudo em try/catch, tudo sem await;
//   • nome de evento é constante deste arquivo, não string solta no meio do componente —
//     um typo em produção é um degrau que some do funil sem ninguém perceber;
//   • evento de etapa (passou por aqui uma vez na vida) usa `umaVez`, evento de ação
//     (clicou, tentou, viu de novo) não usa.
// ============================================================================

// ---------------------------------------------------------------------------
// Os degraus do funil. A ordem aqui é a ordem do funil no /admin — mexer na ordem
// muda o relatório, então mude junto com FUNIL_ETAPAS lá embaixo.
// ---------------------------------------------------------------------------
export const EV = {
  // Topo — antes da conta existir (disparado com anon_id, sem user_id)
  VISITA: 'vn_visita',                       // abriu qualquer página pública
  TESTE_NIVEL_INICIADO: 'vn_teste_iniciado',
  TESTE_NIVEL_CONCLUIDO: 'vn_teste_concluido',
  CADASTRO_ABERTO: 'vn_cadastro_aberto',
  CADASTRO_ENVIADO: 'vn_cadastro_enviado',
  CADASTRO_ERRO: 'vn_cadastro_erro',

  // Conta criada — daqui em diante sempre com user_id
  APP_ABERTO: 'vn_app_aberto',
  ONBOARDING_INICIADO: 'vn_onb_iniciado',
  ONBOARDING_PASSO: 'vn_onb_passo',          // props.passo = 0..7
  ONBOARDING_PULADO: 'vn_onb_pulado',
  ONBOARDING_CONCLUIDO: 'vn_onb_concluido',
  NIVEL_DEFINIDO: 'vn_nivel_definido',
  META_DEFINIDA: 'vn_meta_definida',

  // Primeiro valor
  PRIMEIRA_LICAO_INICIADA: 'vn_licao1_iniciada',
  PRIMEIRA_LICAO_CONCLUIDA: 'vn_licao1_concluida',
  RESULTADO_VISTO: 'vn_resultado_visto',     // tela "Seu plano está pronto"
  LICAO_CONCLUIDA: 'vn_licao_concluida',     // qualquer lição (props.total)
  PRIMEIRA_CONVERSA: 'vn_conversa1',

  // Oferta
  PAYWALL_VISTO: 'vn_paywall_visto',         // props.gatilho diz QUAL momento
  PAYWALL_FECHADO: 'vn_paywall_fechado',
  PLANO_SELECIONADO: 'vn_plano_selecionado', // props.plano = mensal | anual
  CHECKOUT_INICIADO: 'vn_checkout_iniciado', // props.gateway = stripe | kiwify | play | apple
  CHECKOUT_FALHOU: 'vn_checkout_falhou',     // props.motivo — é aqui que um gateway quebrado aparece
  ASSINATURA_CONCLUIDA: 'vn_assinatura',
  ASSINATURA_CANCELADA: 'vn_assinatura_cancelada',

  // Reengajamento por e-mail/push — fecha o laço do ciclo de vida. Sem estes dois, a
  // sequência de retorno (dia 2, dia 3, fim de teste, pós-teste) existe no código e é
  // invisível no resultado: não dá para saber se ela traz alguém de volta ou só gasta
  // reputação de domínio.
  EMAIL_ENVIADO: 'vn_email_enviado',   // props.chave = d2 | d3 | trial_t24 | pos_trial_1 | ...
  EMAIL_CLIQUE: 'vn_email_clique',     // o aluno abriu o app pelo link do e-mail

  // Retenção
  RETORNO: 'vn_retorno',                     // props.dia = D1, D2, D3, D7...
  TRIAL_ULTIMO_DIA: 'vn_trial_ultimo_dia',
  TRIAL_EXPIROU: 'vn_trial_expirou',
} as const

export type NomeEvento = (typeof EV)[keyof typeof EV]

// Os degraus que o /admin desenha como funil, em ordem. Só etapas "uma vez por pessoa"
// entram aqui — evento de ação repetida distorceria a taxa de conversão.
export const FUNIL_ETAPAS: { evento: string; rotulo: string }[] = [
  { evento: EV.VISITA, rotulo: 'Visita' },
  { evento: EV.TESTE_NIVEL_CONCLUIDO, rotulo: 'Teste de nível concluído' },
  { evento: EV.CADASTRO_ENVIADO, rotulo: 'Conta criada' },
  { evento: EV.ONBOARDING_CONCLUIDO, rotulo: 'Onboarding concluído' },
  { evento: EV.PRIMEIRA_LICAO_CONCLUIDA, rotulo: '1ª lição concluída' },
  { evento: EV.RESULTADO_VISTO, rotulo: 'Viu o resultado' },
  { evento: EV.PAYWALL_VISTO, rotulo: 'Viu a oferta' },
  { evento: EV.CHECKOUT_INICIADO, rotulo: 'Checkout iniciado' },
  { evento: EV.ASSINATURA_CONCLUIDA, rotulo: 'Assinou' },
]

// ---------------------------------------------------------------------------
// Identidade do visitante antes do login. Sem isto o topo do funil (visita → teste →
// cadastro) não tem como ser ligado ao resto: o Meta diz 603 testes, o banco diz 149
// contas, e ninguém consegue provar que são as mesmas pessoas.
// ---------------------------------------------------------------------------
const CHAVE_ANON = 'vonai_anon_id'
const CHAVE_SESSAO = 'vonai_sessao_id'

export function anonId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let v = localStorage.getItem(CHAVE_ANON)
    if (!v) {
      v = 'a_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
      localStorage.setItem(CHAVE_ANON, v)
    }
    return v
  } catch {
    return ''
  }
}

// Sessão = uma visita. Vive no sessionStorage, então fechar a aba encerra.
export function sessaoId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let v = sessionStorage.getItem(CHAVE_SESSAO)
    if (!v) {
      v = 's_' + Math.random().toString(36).slice(2, 10)
      sessionStorage.setItem(CHAVE_SESSAO, v)
    }
    return v
  } catch {
    return ''
  }
}

type Props = Record<string, string | number | boolean | null | undefined>

type Opcoes = {
  /** Dispara no máximo uma vez por pessoa (idempotência local + no banco). Use em DEGRAU. */
  umaVez?: boolean
  /** Token do Supabase, quando houver. Sem ele o evento entra como anônimo. */
  token?: string | null
  /** user_id, quando já conhecido. */
  userId?: string | null
}

function jaDisparou(chave: string): boolean {
  try {
    if (localStorage.getItem(chave)) return true
    localStorage.setItem(chave, String(Date.now()))
    return false
  } catch {
    return false // storage bloqueado: melhor medir duas vezes que nenhuma
  }
}

/**
 * Registra um degrau/ação do funil. Nunca lança, nunca espera, nunca bloqueia a tela.
 */
export function funil(evento: NomeEvento | string, props: Props = {}, opts: Opcoes = {}): void {
  if (typeof window === 'undefined') return
  try {
    if (opts.umaVez && jaDisparou(`vn_ev_${evento}`)) return

    const base = {
      ...props,
      anon_id: anonId(),
      sessao: sessaoId(),
      ...(opts.userId ? { user_id: opts.userId } : {}),
    }

    // 1) GTM — o gestor de tráfego cria tag/conversão em cima disto.
    try {
      ;(window as unknown as { dataLayer?: unknown[] }).dataLayer?.push({ event: evento, ...base })
    } catch {}

    // 2) Servidor — a fonte de verdade do /admin. `keepalive` para o evento sobreviver
    //    à navegação que acontece logo depois do clique (é justamente o caso do checkout).
    try {
      const corpo = JSON.stringify({ evento, props: base, umaVez: !!opts.umaVez })
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (opts.token) headers.Authorization = `Bearer ${opts.token}`
      void fetch('/api/funil', { method: 'POST', headers, body: corpo, keepalive: true }).catch(() => {})
    } catch {}
  } catch {}
}

// ---------------------------------------------------------------------------
// Gravação a partir do SERVIDOR (cron de lembretes, webhooks). O caminho normal é o
// navegador chamando /api/funil; aqui não há navegador — o cron roda sozinho, 2x por dia.
//
// Recebe o client admin já criado por quem chamou, em vez de criar o seu: a rota já tem um,
// e abrir um segundo por evento desperdiça conexão no plano free.
// Nunca lança: perder a medição de um e-mail não pode impedir o e-mail de sair.
// ---------------------------------------------------------------------------
type ClienteAdmin = {
  from: (tabela: string) => { insert: (linha: Record<string, unknown>) => Promise<{ error: unknown }> }
}

export async function gravarEventoServidor(
  admin: ClienteAdmin,
  opts: { evento: NomeEvento | string; userId: string; props?: Record<string, string | number | boolean>; etapa?: boolean },
): Promise<boolean> {
  try {
    const { error } = await admin.from('eventos_funil').insert({
      evento: opts.evento,
      user_id: opts.userId,
      identidade: opts.userId,
      etapa: !!opts.etapa,
      props: opts.props || {},
      criado_em: new Date().toISOString(),
    })
    return !error
  } catch {
    return false
  }
}
