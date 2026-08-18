import crypto from 'crypto'

// Envio de e-mail transacional pelo Resend. Existe porque o push não cobre todo mundo:
// no iPhone via App Store não há web push NENHUM, e no Android/web só recebe quem
// aceitou a permissão. Resultado até 05/08/2026: 51 contas, ninguém voltou no 2º dia,
// e nenhum canal chamando de volta.
//
// Fail-closed: sem RESEND_API_KEY a função não tenta nada e devolve motivo. Nunca
// derruba o cron por causa de e-mail.

const DE = 'Vonai <ola@envio.vonai.com.br>'
const BASE = 'https://vonai.com.br'

export type ResultadoEmail = { ok: boolean; motivo?: string; id?: string }

// O link de descadastro precisa provar que quem clicou é o dono daquele user_id --
// senão qualquer um descadastra qualquer pessoa trocando o id na URL. HMAC com o
// segredo do cron, com prefixo de contexto para o token não valer para outra coisa.
export function tokenDescadastro(userId: string): string {
  const segredo = process.env.CRON_SECRET || ''
  if (!segredo) return ''
  return crypto.createHmac('sha256', segredo).update(`unsub:${userId}`).digest('hex').slice(0, 32)
}

export function linkDescadastro(userId: string): string {
  return `${BASE}/api/descadastrar?u=${encodeURIComponent(userId)}&t=${tokenDescadastro(userId)}`
}

export function tokenConfere(userId: string, token: string): boolean {
  const esperado = tokenDescadastro(userId)
  if (!esperado || !token || esperado.length !== token.length) return false
  // Comparação em tempo constante: comparar string com === vaza o tamanho do prefixo
  // correto por tempo de resposta, e isso é um oráculo para adivinhar o token.
  return crypto.timingSafeEqual(Buffer.from(esperado), Buffer.from(token))
}

function montarHtml(titulo: string, corpo: string, cta: string, href: string, userId: string): string {
  // HTML de e-mail é conservador de propósito: tabela, estilo inline, sem imagem
  // externa. Cliente de e-mail ignora CSS moderno e imagem quebrada vira caixa cinza.
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;padding:0;background:#F6F8FB;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F8FB;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
<tr><td style="background:#1E63C7;padding:18px 24px;color:#ffffff;font-size:19px;font-weight:700;">Vonai</td></tr>
<tr><td style="padding:26px 24px 8px;color:#102A4C;font-size:20px;font-weight:700;line-height:1.35;">${titulo}</td></tr>
<tr><td style="padding:0 24px 22px;color:#5B6B82;font-size:15px;line-height:1.65;">${corpo}</td></tr>
<tr><td style="padding:0 24px 28px;">
  <a href="${href}" style="display:inline-block;background:#F5A623;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:13px 28px;border-radius:28px;">${cta}</a>
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #EEF1F6;color:#9AA7B8;font-size:12px;line-height:1.6;">
  Você recebe este aviso porque tem uma conta no Vonai.<br>
  <a href="${linkDescadastro(userId)}" style="color:#7C8AA0;">Não quero mais receber lembretes por e-mail</a>
</td></tr>
</table></td></tr></table></body></html>`
}

function montarTexto(titulo: string, corpo: string, href: string, userId: string): string {
  // Versão em texto puro não é opcional: e-mail só-HTML pontua pior em filtro de spam,
  // e tem cliente que não renderiza HTML nenhum.
  const limpo = corpo.replace(/<[^>]+>/g, '')
  return `${titulo}\n\n${limpo}\n\n${href}\n\n---\nVocê recebe este aviso porque tem uma conta no Vonai.\nPara não receber mais: ${linkDescadastro(userId)}`
}

export async function enviarEmailLembrete(params: {
  para: string
  userId: string
  titulo: string
  corpo: string
  cta?: string
  href?: string
}): Promise<ResultadoEmail> {
  const chave = process.env.RESEND_API_KEY
  if (!chave) return { ok: false, motivo: 'sem RESEND_API_KEY' }
  if (!params.para || !params.para.includes('@')) return { ok: false, motivo: 'e-mail invalido' }

  const cta = params.cta || 'Continuar meu inglês'
  const href = params.href || `${BASE}/app`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${chave}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: DE,
        to: [params.para],
        subject: params.titulo,
        html: montarHtml(params.titulo, params.corpo, cta, href, params.userId),
        text: montarTexto(params.titulo, params.corpo, href, params.userId),
        // Cabeçalho padrão de descadastro em um clique. Gmail e Outlook mostram o
        // botão "cancelar inscrição" no topo, e quem tem esse botão reclama de spam
        // muito menos -- reclamação é o que queima domínio.
        headers: { 'List-Unsubscribe': `<${linkDescadastro(params.userId)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      }),
    })
    if (!r.ok) return { ok: false, motivo: `resend ${r.status}: ${(await r.text()).slice(0, 160)}` }
    const j = await r.json().catch(() => ({}))
    return { ok: true, id: j?.id }
  } catch (e: any) {
    return { ok: false, motivo: String(e?.message || e).slice(0, 160) }
  }
}

// ---------------------------------------------------------------------------------
// TEMPLATES do ciclo de vida (freemium, 18/08/2026). Todos passam pelo mesmo
// enviarEmailLembrete acima: mesmo remetente, mesmo rodapé de descadastro, mesma
// tolerância a falha. Aqui só se decide TEXTO — quem decide QUANDO é a rota
// /api/send-reminders (com a trava de idempotência em progresso.emails_enviados).
//
// Preço por dia do anual: R$289,80 / 365 ≈ R$0,79. É o número que cabe na cabeça
// ("menos que um pão") — o mensal é o que aparece grande no app.
const PLANOS = `${BASE}/planos`
const CHAT_MSGS_GRATIS = 10
const LICOES_GRATIS = 3
const SIMULACOES_GRATIS = 3

const p = (t: string) => `<p style="margin:0 0 12px;">${t}</p>`
const li = (t: string) => `<li style="margin:0 0 6px;">${t}</li>`
const ul = (itens: string[]) => `<ul style="margin:0 0 14px;padding-left:20px;">${itens.join('')}</ul>`

// (a) Trial acabando em ≤24h: diz o que muda no grátis, sem ameaça — o aluno continua
// tendo app amanhã. O que vende é a diferença, não o medo de perder tudo.
export function emailTrialAcabando(nome: string): { titulo: string; corpo: string; cta: string; href: string } {
  const oi = nome ? `${nome}, ` : ''
  return {
    titulo: 'Seu teste Premium acaba amanhã',
    corpo:
      p(`${oi}seus 7 dias de Premium grátis terminam amanhã. <strong>Você não perde nada</strong>: o app continua no plano gratuito, com seu progresso, sua sequência e sua trilha guardados.`) +
      p('O que muda no grátis:') +
      ul([
        li(`Professor IA: até <strong>${CHAT_MSGS_GRATIS} mensagens por dia</strong> (no Premium, sem limite)`),
        li(`Lições da trilha: até <strong>${LICOES_GRATIS} por dia</strong> (no Premium, sem limite)`),
        li(`Simulações de conversa: até <strong>${SIMULACOES_GRATIS} por dia</strong>`),
      ]) +
      p('Se você quiser continuar no ritmo de agora, o Premium anual sai por <strong>R$289,80/ano — menos de R$0,79 por dia</strong>. Ou R$29,90 no mensal, cancele quando quiser.'),
    cta: 'Continuar no Premium',
    href: PLANOS,
  }
}

// (b) Trial acabou e a pessoa não assinou. Dois e-mails no máximo: T+1 e T+4.
// O primeiro reforça que ela continua tendo o app (muita gente acha que "acabou" =
// "fechou"); o segundo é o último empurrão com o preço por dia — e para por aí.
export function emailPosTrial(nome: string, numero: 1 | 2): { titulo: string; corpo: string; cta: string; href: string } {
  const oi = nome ? `${nome}, ` : ''
  if (numero === 1) {
    return {
      titulo: 'Você continua no Vonai grátis — e o Premium sai por R$0,79/dia',
      corpo:
        p(`${oi}seu período de teste terminou, mas <strong>sua conta continua ativa</strong> no plano gratuito: ${CHAT_MSGS_GRATIS} mensagens por dia com o professor, ${LICOES_GRATIS} lições e ${SIMULACOES_GRATIS} simulações por dia. Sua trilha está exatamente onde você parou.`) +
        p('Se sentiu falta de conversar sem limite, o Premium anual custa <strong>menos de R$0,79 por dia</strong> (R$289,80/ano). Sem fidelidade — cancele quando quiser.'),
      cta: 'Ver o Premium',
      href: PLANOS,
    }
  }
  return {
    titulo: 'Última lembrança: Premium por menos de R$0,79/dia',
    corpo:
      p(`${oi}este é o último e-mail sobre isso, prometido. Você segue no plano gratuito do Vonai quando quiser voltar — sem prazo, sem cobrança.`) +
      p(`Se quiser destravar o professor sem limite de mensagens, lições sem limite e voz neural o dia todo, o Premium anual sai por <strong>R$289,80 (≈ R$0,79/dia)</strong> ou R$29,90/mês.`),
    cta: 'Assinar o Premium',
    href: PLANOS,
  }
}

// Lead do teste de nível público (/teste-de-nivel-de-ingles): a pessoa deixou o e-mail
// no resultado e ainda não tem conta. Vai na hora, com o nível e 3 dicas curtas — a
// promessa da tela era "plano dos 7 primeiros dias", então o e-mail tem que chegar
// enquanto a motivação ainda existe. O rodapé de descadastro usa 'lead:<email>' como id
// (não há user_id): o link só não vai funcionar em /api/descadastrar, que espera user_id —
// mas o e-mail é único (1 por lead), então não há lista para sair.
const DICAS_POR_NIVEL: Record<string, string[]> = {
  A1: ['Aprenda frases inteiras, não palavras soltas: "Can I have…?" resolve metade de um restaurante.', 'Fale em voz alta todo dia, mesmo sozinho — 5 minutos valem mais que 1 hora lendo.', 'Não traduza na cabeça: associe a palavra à imagem ("apple" → 🍎, não → "maçã").'],
  A2: ['Domine o passado simples (did/was/were): é o que você mais usa para contar o seu dia.', 'Assista a algo curto em inglês com legenda em INGLÊS, não em português.', 'Treine perguntas: quem sabe perguntar mantém qualquer conversa viva.'],
  B1: ['Pare de estudar gramática isolada: use present perfect e condicionais em frases suas.', 'Grave-se falando 1 minuto sobre o seu dia e reescute — o ouvido corrige o que a cabeça não vê.', 'Aprenda conectores (however, although, so that): é o que faz a fala parecer fluente.'],
  B2: ['Foque em phrasal verbs e collocations — vocabulário "natural" é o que separa B2 de C1.', 'Consuma conteúdo sem legenda: podcasts curtos e vídeos de 5 minutos.', 'Escreva parágrafos opinativos e peça correção — a escrita organiza a fala.'],
  C1: ['Trabalhe nuance: registro formal x informal, ironia, ênfase.', 'Leia opinião e ensaio (não só notícia) e discuta o texto em voz alta.', 'Ataque os erros fósseis: os 3 deslizes que você comete há anos são o seu próximo salto.'],
  C2: ['Refine ritmo e entonação — o que falta não é vocabulário, é música.', 'Explique um assunto técnico do seu trabalho em inglês, como se ensinasse.', 'Leia e ouça sotaques variados (Reino Unido, Austrália, Índia).'],
}
export function emailLeadTeste(nivel: string | null): { titulo: string; corpo: string; cta: string; href: string } {
  const n = nivel && DICAS_POR_NIVEL[nivel] ? nivel : null
  const dicas = DICAS_POR_NIVEL[n || 'A1']
  const href = `${BASE}/cadastro?nivel=${n || 'A1'}`
  return {
    titulo: n ? `Seu nível é ${n} — e o plano dos primeiros 7 dias` : 'Seu resultado no teste de inglês — e o plano dos primeiros 7 dias',
    corpo:
      p(n ? `Seu inglês está no nível <strong>${n}</strong>. Boa notícia: dá para sentir diferença em 7 dias se você treinar do jeito certo.` : 'Obrigado por fazer o teste! Dá para sentir diferença em 7 dias se você treinar do jeito certo.') +
      p(`3 dicas para o seu nível${n ? ` (${n})` : ''}:`) +
      ul(dicas.map(li)) +
      p(`No Vonai, um professor de IA conversa com você e corrige na hora, com uma trilha que começa exatamente do ${n || 'seu nível'}. São <strong>7 dias de Premium grátis, sem cartão</strong> — depois você continua no plano gratuito se quiser.`),
    cta: `Começar do ${n || 'meu nível'} grátis`,
    href,
  }
}
