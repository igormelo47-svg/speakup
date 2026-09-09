import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { enviarEmailHtml, linkDescadastro } from '../../../lib/email'

// PESQUISA DE UMA PERGUNTA (08/09/2026).
//
// Por que ela existe: o painel de 07/09 fechou 60 contas vindas de anúncio com 42
// abrindo o app, 1 voltando num segundo dia e 0 assinando. Ou seja, 41 de 42 pessoas
// usaram o Vonai em UM único dia. Nenhuma mudança de preço, trial ou paywall resolve
// isso, e ninguém nunca perguntou a essas pessoas o que faltou. Este arquivo faz a
// pergunta.
//
// A resposta é UM TOQUE, não um texto: e-mail pedindo resposta escrita rende 1-3%;
// cinco links clicáveis rendem 10-25%. Cada opção é uma hipótese que leva a uma decisão
// diferente, então a contagem sozinha já diz onde mexer.
//
// Verbos:
//   GET  ?u=&t=&r=1..5   registra a resposta e leva para /pesquisa (link do e-mail)
//   PUT  {u,t,texto}     grava o texto livre de quem quis escrever depois de clicar
//   POST (dono logado)   dispara a pesquisa ({acao:'ver'|'enviar'|'ler'})
//
// As respostas caem na tabela `feedback` que já existe (user_id, email, mensagem) —
// de propósito: uma tabela nova exigiria rodar SQL no Supabase antes de qualquer
// resposta chegar, e é justamente esse tipo de passo manual que costuma ficar pendente.

const DONOS = ['igorckl@hotmail.com', 'igormelo47@gmail.com']
const INTERNOS = new Set([...DONOS, 'igorccb@hotmail.com', 'apple.review.2026@vonai-teste.com', 'google.review@vonai.com.br'])
const ehInterno = (em: string) => INTERNOS.has(em) || em.endsWith('@vonai-teste.com') || em.endsWith('@not.com')

const BASE = 'https://vonai.com.br'
const CHAVE_ENVIO = 'pesquisa_2026_09'

// Duas perguntas diferentes para dois grupos diferentes. Quem NUNCA usou o app não pode
// responder "achei parecido com outros apps" — ele não viu nada. Misturar os dois grupos
// numa pergunta só produz resposta média, que não decide nada.
export const OPCOES: Record<'usou' | 'naousou', string[]> = {
  // Abriu o app pelo menos uma vez e não voltou.
  usou: [
    'Não era o que o anúncio prometia — eu esperava conversar de verdade',
    'Achei parecido com outros apps que já tentei',
    'Gostei, mas faltou tempo / acabei esquecendo',
    'Deu problema: travou, o microfone não funcionou ou não carregou',
    'Foi outro motivo (eu escrevo pra você)',
  ],
  // Criou a conta e nunca chegou a usar.
  naousou: [
    'Criei a conta e acabei nem usando',
    'Entrei, mas não entendi o que era pra fazer',
    'Não abriu, travou ou deu erro',
    'Vi que ia ter que pagar',
    'Foi outro motivo (eu escrevo pra você)',
  ],
}

function token(userId: string): string {
  const segredo = process.env.CRON_SECRET || ''
  if (!segredo) return ''
  return crypto.createHmac('sha256', segredo).update(`pesq:${userId}`).digest('hex').slice(0, 32)
}
function tokenOk(userId: string, t: string): boolean {
  const esperado = token(userId)
  if (!esperado || !t || esperado.length !== t.length) return false
  return crypto.timingSafeEqual(Buffer.from(esperado), Buffer.from(t))
}

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return null
  return createClient(url, service)
}

// ---------------------------------------------------------------------------------
// GET — o clique no e-mail. Redireciona SEMPRE, mesmo em erro: a pessoa clicou para
// ajudar e não pode receber um JSON de erro na cara.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams
  const u = q.get('u') || ''
  const t = q.get('t') || ''
  const r = parseInt(q.get('r') || '', 10)
  const grupo = q.get('g') === 'n' ? 'naousou' : 'usou'
  const destino = new URL('/pesquisa', BASE)

  if (!u || !tokenOk(u, t) || !(r >= 1 && r <= 5)) {
    destino.searchParams.set('e', '1')
    return NextResponse.redirect(destino, 302)
  }
  destino.searchParams.set('r', String(r))
  destino.searchParams.set('u', u)
  destino.searchParams.set('t', t)

  const sb = admin()
  if (sb) {
    const rotulo = OPCOES[grupo][r - 1] || `opção ${r}`
    const { data: prog } = await sb.from('progresso').select('email').eq('user_id', u).maybeSingle()
    // upsert manual: se a pessoa clicar duas vezes, a segunda substitui a primeira em vez
    // de virar duas linhas que inflam a contagem.
    await sb.from('feedback').delete().eq('user_id', u).like('mensagem', '[PESQUISA]%')
    await sb.from('feedback').insert({
      user_id: u,
      email: prog?.email || null,
      mensagem: `[PESQUISA] ${r} — ${rotulo}`,
    })
  }
  return NextResponse.redirect(destino, 302)
}

// ---------------------------------------------------------------------------------
// PUT — texto livre escrito na página de agradecimento. Vai como linha separada para
// não apagar a opção clicada (é o que a contagem usa).
export async function PUT(req: NextRequest) {
  let body: any = {}
  try { body = await req.json() } catch {}
  const u = String(body?.u || '')
  const t = String(body?.t || '')
  const texto = String(body?.texto || '').trim().slice(0, 2000)
  if (!u || !tokenOk(u, t)) return NextResponse.json({ error: 'token' }, { status: 403 })
  if (texto.length < 2) return NextResponse.json({ error: 'curto' }, { status: 400 })
  const sb = admin()
  if (!sb) return NextResponse.json({ error: 'env' }, { status: 500 })
  const { data: prog } = await sb.from('progresso').select('email').eq('user_id', u).maybeSingle()
  await sb.from('feedback').insert({ user_id: u, email: prog?.email || null, mensagem: `[PESQUISA-TEXTO] ${texto}` })
  return NextResponse.json({ ok: true })
}

// ---------------------------------------------------------------------------------
// POST — só o dono. acao: 'ver' (lista sem enviar), 'enviar', 'ler' (contagem).
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const sb = admin()
  if (!url || !anon || !sb) return NextResponse.json({ error: 'missing env' }, { status: 500 })
  if (!process.env.CRON_SECRET) return NextResponse.json({ error: 'sem CRON_SECRET na Vercel — sem ele os links do e-mail não podem ser assinados' }, { status: 500 })

  const bearer = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!bearer) return new NextResponse('unauthorized', { status: 401 })
  const { data: userData } = await createClient(url, anon).auth.getUser(bearer)
  const quem = userData?.user?.email?.toLowerCase()
  if (!quem || !DONOS.includes(quem)) return new NextResponse('forbidden', { status: 403 })

  let body: any = {}
  try { body = await req.json() } catch {}
  const acao = String(body?.acao || 'ver')

  // ---- contagem das respostas
  if (acao === 'ler') {
    const { data } = await sb.from('feedback').select('mensagem, email, criado_em').like('mensagem', '[PESQUISA%').order('criado_em', { ascending: false }).limit(400)
    const contagem: Record<string, number> = {}
    const textos: { email: string | null; texto: string; quando: string }[] = []
    for (const f of data || []) {
      const m = String(f.mensagem || '')
      if (m.startsWith('[PESQUISA-TEXTO]')) { textos.push({ email: f.email, texto: m.replace('[PESQUISA-TEXTO] ', ''), quando: (f as any).criado_em }); continue }
      const rot = m.replace(/^\[PESQUISA\] \d+ — /, '')
      contagem[rot] = (contagem[rot] || 0) + 1
    }
    const total = Object.values(contagem).reduce((a, b) => a + b, 0)
    return NextResponse.json({ total, contagem, textos })
  }

  // ---- monta a lista de destinatários
  const { data: lista, error: luErr } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (luErr) return NextResponse.json({ error: luErr.message }, { status: 500 })
  const { data: progressos } = await sb.from('progresso')
    .select('user_id, email, xp, ativado_em, is_premium, premium_expira, dias_ativos, email_lembretes, emails_enviados, attrib')
  const porUser = new Map((progressos || []).map(p => [p.user_id, p as any]))
  const agora = Date.now()

  // "Veio de anúncio" = qualquer clique pago: gclid/gbraid/wbraid (Google) ou fbclid (Meta).
  // Mesma regra do painel (/api/admin/painel), para os dois números baterem.
  const veioDeAnuncio = (attrib: any) => !!(attrib?.gclid || attrib?.gbraid || attrib?.wbraid || attrib?.fbclid)
  type Alvo = { id: string; email: string; grupo: 'usou' | 'naousou'; ja: boolean; anuncio: boolean }
  const alvos: Alvo[] = []
  let pulados = 0
  for (const u of lista?.users || []) {
    const em = (u.email || '').toLowerCase()
    if (!em.includes('@') || ehInterno(em)) { pulados++; continue }
    const p = porUser.get(u.id)
    // Quem paga não recebe: a pergunta é "por que você foi embora".
    if (p?.is_premium && (!p.premium_expira || new Date(p.premium_expira).getTime() > agora)) { pulados++; continue }
    if (p?.email_lembretes === false) { pulados++; continue }
    // Quem ainda está usando (2+ dias) também não: ele não foi embora.
    const dias = Array.isArray(p?.dias_ativos) ? p.dias_ativos.length : 0
    if (dias >= 2) { pulados++; continue }
    const ativado = !!p?.ativado_em || (p?.xp || 0) > 0
    const ja = !!(p?.emails_enviados && typeof p.emails_enviados === 'object' && p.emails_enviados[CHAVE_ENVIO])
    alvos.push({ id: u.id, email: p?.email || em, grupo: ativado ? 'usou' : 'naousou', ja, anuncio: veioDeAnuncio(p?.attrib) })
  }

  // Só quem veio de anúncio, por padrão. É a coorte que o dinheiro comprou e a única cuja
  // resposta decide o que fazer com o tráfego pago. O orgânico tem muita gente que o Igor
  // pediu pessoalmente para olhar o app — essa pessoa nunca teve intenção de aprender
  // inglês, e a resposta dela contamina a leitura. Passe somenteAnuncio:false para incluir.
  const somenteAnuncio = body?.somenteAnuncio !== false
  const elegiveis = somenteAnuncio ? alvos.filter(a => a.anuncio) : alvos

  // Lote: mandar tudo de uma vez estoura o tempo da função na Vercel. Cada clique manda um
  // lote; quem já recebeu fica marcado em emails_enviados e não repete.
  const limite = Math.min(Math.max(Number(body?.limite) || 40, 1), 200)
  const pendentes = elegiveis.filter(a => !a.ja)
  if (acao === 'ver') {
    return NextResponse.json({
      somenteAnuncio,
      total: elegiveis.length,
      jaReceberam: elegiveis.length - pendentes.length,
      vaoReceber: pendentes.length,
      porLote: 40,
      usaramUmaVez: pendentes.filter(a => a.grupo === 'usou').length,
      nuncaUsaram: pendentes.filter(a => a.grupo === 'naousou').length,
      // Para o painel poder dizer o que está ficando de fora sem precisar de outra chamada.
      pendentesAnuncio: alvos.filter(a => !a.ja && a.anuncio).length,
      pendentesOrganico: alvos.filter(a => !a.ja && !a.anuncio).length,
      pulados,
      amostra: pendentes.slice(0, 5).map(a => `${a.email} (${a.grupo})`),
    })
  }
  if (acao !== 'enviar') return NextResponse.json({ error: 'acao' }, { status: 400 })

  // ---- envio
  let enviados = 0, falhas = 0
  const erros: string[] = []
  const lote = pendentes.slice(0, limite)
  for (const a of lote) {
    const t = token(a.id)
    const g = a.grupo === 'naousou' ? 'n' : 'u'
    const opcoes = OPCOES[a.grupo]
    const link = (i: number) => `${BASE}/api/pesquisa?u=${encodeURIComponent(a.id)}&t=${t}&g=${g}&r=${i + 1}`

    const botoes = opcoes.map((o, i) => `
      <tr><td style="padding:0 0 10px;">
        <a href="${link(i)}" style="display:block;border:1px solid #D8E1EC;border-radius:12px;padding:13px 16px;color:#102A4C;font-size:15px;line-height:1.4;text-decoration:none;background:#F7FAFD;">${o}</a>
      </td></tr>`).join('')

    const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;padding:0;background:#F6F8FB;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F6F8FB;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
<tr><td style="padding:26px 24px 6px;color:#102A4C;font-size:19px;font-weight:700;line-height:1.35;">Posso te fazer uma pergunta só?</td></tr>
<tr><td style="padding:0 24px 18px;color:#5B6B82;font-size:15px;line-height:1.65;">
  <p style="margin:0 0 12px;">Aqui é o Igor — sou eu que faço o Vonai. Isto não é propaganda e não tem nada para comprar.</p>
  <p style="margin:0 0 12px;">Você criou uma conta e não voltou. Eu preciso saber por quê, porque é isso que decide o que eu conserto primeiro — e ninguém melhor que você para dizer.</p>
  <p style="margin:0 0 4px;"><strong>É um toque, leva 3 segundos:</strong></p>
</td></tr>
<tr><td style="padding:0 24px 4px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${botoes}</table></td></tr>
<tr><td style="padding:8px 24px 26px;color:#7C8AA0;font-size:13.5;line-height:1.6;">
  Se preferir, é só responder este e-mail com uma linha. Eu leio todas, uma por uma.<br>— Igor
</td></tr>
<tr><td style="padding:14px 24px;border-top:1px solid #EEF1F6;color:#9AA7B8;font-size:12px;line-height:1.6;">
  <a href="${linkDescadastro(a.id)}" style="color:#7C8AA0;">Não quero mais receber e-mails do Vonai</a>
</td></tr>
</table></td></tr></table></body></html>`

    const texto = `Posso te fazer uma pergunta só?

Aqui é o Igor, eu que faço o Vonai. Isto nao e propaganda e nao tem nada para comprar.

Voce criou uma conta e nao voltou. Eu preciso saber por que, porque e isso que decide o que eu conserto primeiro.

Clique no que mais se parece com o seu caso:

${opcoes.map((o, i) => `${i + 1}) ${o}\n   ${link(i)}`).join('\n\n')}

Se preferir, responda este e-mail com uma linha. Eu leio todas.
— Igor

---
Para nao receber mais: ${linkDescadastro(a.id)}`

    const res = await enviarEmailHtml({ para: a.email, userId: a.id, titulo: 'Posso te fazer uma pergunta só?', html, texto })
    if (res.ok) {
      enviados++
      const p = porUser.get(a.id)
      const antes = p?.emails_enviados && typeof p.emails_enviados === 'object' ? p.emails_enviados : {}
      await sb.from('progresso').update({ emails_enviados: { ...antes, [CHAVE_ENVIO]: new Date().toISOString().slice(0, 10) } }).eq('user_id', a.id)
    } else {
      falhas++
      if (erros.length < 5) erros.push(`${a.email}: ${res.motivo}`)
    }
    // O Resend limita 2 req/s no plano gratuito; sem pausa metade vira 429.
    await new Promise(r => setTimeout(r, 350))
  }

  return NextResponse.json({ ok: true, enviados, falhas, erros, faltam: pendentes.length - lote.length })
}
