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
