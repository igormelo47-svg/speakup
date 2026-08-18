import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'
import { enviarEmailLembrete, emailTrialAcabando, emailPosTrial } from '../../../lib/email'
import { missaoPara } from '../../../lib/missao'

// Teto do winback: depois de 30 dias sem uso a pessoa não é "aluno sumido", é alguém que
// desistiu — continuar chamando a cada 3 dias para sempre é o caminho da marcação de spam.
const WINBACK_MAX_DIAS = 30
// Espaçamento mínimo entre e-mails de winback (o push é mais barato e descartável).
const WINBACK_INTERVALO_DIAS = 3

const VAPID_PUBLIC = 'BGvDV8RzI74VwBSU6MSVcAgDJS3WF_zTGrpDW9cY26dyf85JAbJP0aRhJpU8BECmc3Z6yvHRHctbxxE0Bk-5cLo'

export async function GET(req: NextRequest) {
  // Dois disparos por dia (vercel.json): de manhã o apelo é começar o dia, de noite
  // é não perder a sequência antes da meia-noite. Quem já estudou hoje não recebe
  // nenhum dos dois -- isso a checagem de estudouHoje mais abaixo já garante.
  const turno = req.nextUrl.searchParams.get('turno') === 'manha' ? 'manha' : 'noite'
  // Protegido: o Vercel Cron envia "Authorization: Bearer <CRON_SECRET>".
  const auth = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('unauthorized', { status: 401 })
  }
  const priv = process.env.VAPID_PRIVATE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!priv || !url || !service) return NextResponse.json({ error: 'missing env vars' }, { status: 500 })

  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:igormelo47@gmail.com', VAPID_PUBLIC, priv)
  const admin = createClient(url, service)

  // Dia no fuso do Brasil, igual ao que o app grava em ultima_atividade.
  const hoje = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' })
  const agora = Date.now()
  // Colunas opcionais do canal de e-mail: email_lembretes (email_lembretes_column.sql) e
  // emails_enviados (migracao_2026-08-18_freemium.sql — diário do que já foi mandado, para
  // o cron de 2x/dia não repetir). O PostgREST recusa o SELECT inteiro quando uma coluna
  // não existe, então tenta com tudo e, se falhar, repete sem as opcionais: ausente vira
  // "pode receber" / "nunca mandou nada", e os e-mails com trava ficam só no turno da noite.
  const BASE_COLS = 'user_id, ultima_atividade, streak, dias_ativos, nome, is_premium, premium_expira, perfil_ia, email'
  let temColunaEmails = true
  const [{ data: subs }, progRes, { data: perfis }] = await Promise.all([
    admin.from('push_subscriptions').select('user_id, subscription'),
    admin.from('progresso').select(`${BASE_COLS}, email_lembretes, emails_enviados`),
    admin.from('profiles').select('id, trial_expira'),
  ])
  let prog: any[] | null = progRes.data
  if (progRes.error) {
    console.warn('[Lembretes] coluna opcional ausente, repetindo sem ela:', progRes.error.message)
    temColunaEmails = false
    const r2 = await admin.from('progresso').select(`${BASE_COLS}, email_lembretes`)
    prog = r2.error ? (await admin.from('progresso').select(BASE_COLS)).data : r2.data
  }
  // Usou hoje = marcador do dia em dias_ativos (gravado a cada abertura) OU a data de
  // ultima_atividade. Ela é timestamptz — comparar a string inteira com 'YYYY-MM-DD'
  // nunca casava, e o lembrete ia até para quem já tinha estudado.
  const estudouHoje = new Set((prog || []).filter((p: any) =>
    (Array.isArray(p.dias_ativos) && p.dias_ativos.includes(hoje)) ||
    String(p.ultima_atividade || '').slice(0, 10) === hoje
  ).map((p: any) => p.user_id))
  const progDe = new Map((prog || []).map((p: any) => [p.user_id, p]))
  const trialDe = new Map((perfis || []).map((p: any) => [p.id, p.trial_expira]))

  // Monta a mensagem certa para cada aluno. Prioridades:
  // 1) fim de trial (últimas 24h, mesmo que tenha estudado hoje — é a decisão de assinar);
  // 2) winback pelos dias de ausência (a mensagem de streak só vale para quem sumiu ONTEM —
  //    para quem sumiu há dias a sequência já morreu, e cobrá-la soa falso);
  // 3) lembrete de streak/meta padrão.
  const mensagemPara = (userId: string): { title: string; body: string } | null => {
    const p: any = progDe.get(userId) || {}
    const nome = String(p.nome || '').split(' ')[0]
    const oi = nome ? `${nome}, ` : ''
    const fracos = p?.perfil_ia?.topicos_fracos
    const fraco = Array.isArray(fracos) && fracos.length ? String(fracos[fracos.length - 1]) : ''

    // 1) Trial acabando: o push de conversão vence tudo (1x, porque a janela de 24h só cruza um cron diário).
    const pagoAtivo = !!p.is_premium && (!p.premium_expira || new Date(p.premium_expira).getTime() > agora)
    const texp = trialDe.get(userId) ? new Date(trialDe.get(userId)).getTime() : 0
    if (!pagoAtivo && texp > agora && texp - agora <= 24 * 3600000) {
      return { title: 'Seu acesso Premium grátis acaba hoje ⏰', body: `${oi}continue de onde parou por R$29,90/mês — seu progresso fica guardado.` }
    }

    if (estudouHoje.has(userId)) return null

    const last = String(p.ultima_atividade || '').slice(0, 10)
    const diasFora = last ? Math.max(0, Math.round((new Date(hoje).getTime() - new Date(last).getTime()) / 86400000)) : -1
    const st = p.streak || 0

    // 2) Winback: sumiu de verdade. Teto de 30 dias — depois disso, silêncio.
    if (diasFora > WINBACK_MAX_DIAS) return null
    if (diasFora >= 5) {
      if (diasFora % 3 !== 0) return null // espaça pra não virar spam e perder a permissão
      return { title: `${nome || 'Ei'}, seu inglês sente sua falta 💙`, body: fraco ? `O Vô guardou um treino de "${fraco}" pra você. 5 minutos e você retoma o ritmo.` : 'O Vô guardou sua próxima lição. 5 minutos e você retoma o ritmo.' }
    }
    if (diasFora >= 2) {
      return { title: `${nome || 'Ei'}, o Vô guardou sua lição 📖`, body: fraco ? `Volte de onde parou — tem um treino de "${fraco}" te esperando.` : 'Volte de onde parou — sua trilha continua do mesmo ponto.' }
    }

    // 3) Sumiu só hoje: a sequência ainda está viva. A mensagem cobra a MISSÃO DO DIA —
    //    a mesma que o card do app prometeu ontem ("destrava amanhã"). Se há erro
    //    registrado, a missão é personalizada nos DOIS lados (mesma fonte: topicos_fracos).
    const missao = missaoPara(fracos, hoje)
    if (turno === 'manha') {
      if (st >= 7) return { title: `Bom dia! 🔥 ${st} dias de sequência`, body: `${oi}sua missão de hoje já destravou: ${missao.titulo.toLowerCase()}. 5 minutos e o dia começa ganho.` }
      return { title: `Sua missão de hoje destravou ${missao.emoji}`, body: `${oi}${missao.titulo}. ${missao.chamada}` }
    }
    if (st >= 30) return { title: `🔥 ${st} dias! Não perca hoje`, body: `${oi}sua sequência de ${st} dias acaba à meia-noite. Bastam 5 minutos para mantê-la.` }
    if (st >= 7) return { title: `🔥 Sua sequência de ${st} dias está em risco`, body: `${oi}faça uma lição rápida agora e mantenha o ritmo!` }
    if (st >= 1) return { title: `🔥 Sua sequência e sua missão esperam por você`, body: `${oi}sua missão de hoje ainda está aberta: ${missao.titulo.toLowerCase()}. 5 minutos e a sequência de ${st} ${st === 1 ? 'dia' : 'dias'} continua viva.` }
    return { title: `Sua missão de hoje te espera ${missao.emoji}`, body: fraco ? `${oi}${missao.titulo} — e o Vô guardou um treino de "${fraco}" pra depois.` : `${oi}${missao.titulo}. ${missao.chamada}` }
  }

  let enviados = 0, removidos = 0
  const comPush = new Set<string>()
  for (const s of subs || []) {
    comPush.add(s.user_id)
    const msg = mensagemPara(s.user_id)
    if (!msg) continue
    const payload = JSON.stringify({ title: msg.title, body: msg.body, url: '/app' })
    try {
      await webpush.sendNotification(s.subscription as any, payload)
      enviados++
    } catch (e: any) {
      // Inscrição expirada ou inválida → remove para não tentar de novo
      if (e?.statusCode === 404 || e?.statusCode === 410 || e?.statusCode === 400 || String(e?.message || '').includes('p256dh')) {
        await admin.from('push_subscriptions').delete().eq('user_id', s.user_id)
        removidos++
        comPush.delete(s.user_id)
      }
    }
  }

  // ---------------------------------------------------------------------------------
  // E-MAILS DO CICLO DE VIDA (trial → grátis). Vão para TODO MUNDO com e-mail (mesmo quem
  // tem push): é a decisão de assinar, e um push some em segundos. Cada e-mail é enviado
  // UMA vez por pessoa, com a chave gravada em progresso.emails_enviados (JSON
  // { chave: 'YYYY-MM-DD' }). O cron roda 2x/dia — sem essa trava, o T-24h iria duas
  // vezes. Se a coluna ainda não existir, esses e-mails só saem no turno da noite (1x/dia)
  // e o pós-trial fica restrito a janelas de 1 dia para não repetir.
  //   trial_t24    → trial acaba em ≤24h e não pagou
  //   pos_trial_1  → 1 a 3 dias depois do fim do trial, sem pagar
  //   pos_trial_2  → 4 a 9 dias depois do fim do trial, sem pagar (último; máximo 2)
  //   winback      → data do último e-mail "sua trilha continua" (espaça em 3 dias)
  const DIA = 86400000
  let emails = 0, emailsFalha = 0, emailsPulados = 0
  const contagem: Record<string, number> = { trial_t24: 0, pos_trial_1: 0, pos_trial_2: 0, winback: 0 }
  const podeReceber = (p: any) => {
    const para = String(p.email || '')
    if (!para.includes('@')) return false
    // Coluna pode não existir ainda (email_lembretes_column.sql). undefined = pode
    // receber; só FALSE explícito bloqueia -- quem clicou em "não quero mais".
    if (p.email_lembretes === false) return false
    return true
  }
  const jaMandou = (p: any, chave: string) => !!(p.emails_enviados && typeof p.emails_enviados === 'object' && p.emails_enviados[chave])
  const marcar = async (p: any, chave: string) => {
    if (!temColunaEmails) return
    const novo = { ...(p.emails_enviados && typeof p.emails_enviados === 'object' ? p.emails_enviados : {}), [chave]: hoje }
    p.emails_enviados = novo
    await admin.from('progresso').update({ emails_enviados: novo }).eq('user_id', p.user_id)
  }
  const mandar = async (p: any, chave: string, t: { titulo: string; corpo: string; cta: string; href: string }) => {
    const r = await enviarEmailLembrete({ para: String(p.email), userId: p.user_id, titulo: t.titulo, corpo: t.corpo, cta: t.cta, href: t.href })
    if (r.ok) { emails++; contagem[chave]++; await marcar(p, chave) }
    else { emailsFalha++; console.error(`[E-mail ${chave}] falhou`, r.motivo) }
    return r.ok
  }

  for (const p of prog || []) {
    if (!podeReceber(p)) continue
    const pagoAtivo = !!p.is_premium && (!p.premium_expira || new Date(p.premium_expira).getTime() > agora)
    if (pagoAtivo) continue
    const texp = trialDe.get(p.user_id) ? new Date(trialDe.get(p.user_id)).getTime() : 0
    if (!texp) continue
    const nome = String(p.nome || '').split(' ')[0]

    // (a) T-24h: trial ainda vale e acaba dentro de 24h.
    if (texp > agora && texp - agora <= DIA) {
      if (jaMandou(p, 'trial_t24')) continue
      if (!temColunaEmails && turno !== 'noite') continue
      await mandar(p, 'trial_t24', emailTrialAcabando(nome))
      continue
    }
    // (b) Pós-trial: T+1 e T+4, no máximo 2. Janelas fechadas para conta antiga não receber
    // e-mail atrasado — quem passou dos 10 dias sem assinar entra no winback normal.
    if (texp <= agora) {
      const diasDesde = (agora - texp) / DIA
      if (diasDesde >= 1 && diasDesde < 4 && !jaMandou(p, 'pos_trial_1')) {
        if (!temColunaEmails && (turno !== 'noite' || diasDesde >= 2)) continue
        await mandar(p, 'pos_trial_1', emailPosTrial(nome, 1))
        continue
      }
      if (diasDesde >= 4 && diasDesde < 10 && !jaMandou(p, 'pos_trial_2')) {
        if (!temColunaEmails && (turno !== 'noite' || diasDesde >= 5)) continue
        await mandar(p, 'pos_trial_2', emailPosTrial(nome, 2))
        continue
      }
    }
  }

  // WINBACK POR E-MAIL, só para quem NÃO tem push. É o único canal que alcança quem baixou
  // pela App Store (iPhone não tem web push) e quem recusou a permissão no Android/web.
  //
  // Uma vez por dia, no turno da NOITE, e no máximo a cada 3 dias por pessoa (chave
  // 'winback' em emails_enviados). O push vai 2x porque é barato e descartável;
  // e-mail 2x/dia gera reclamação de spam, e reclamação queima o domínio inteiro --
  // inclusive os e-mails de recuperação de senha, que não podem parar de chegar.
  // Teto de 30 dias sem uso já está em mensagemPara (vale para push e e-mail).
  if (turno === 'noite') {
    for (const p of prog || []) {
      const uid = (p as any).user_id as string
      if (comPush.has(uid)) { emailsPulados++; continue }      // já recebeu push, não duplica
      if (!podeReceber(p)) { emailsPulados++; continue }
      // Quem recebeu um e-mail do ciclo de vida hoje não recebe winback por cima.
      const ev = (p as any).emails_enviados
      if (ev && typeof ev === 'object' && Object.values(ev).includes(hoje)) { emailsPulados++; continue }
      const ultimoWinback = ev && typeof ev === 'object' && ev.winback ? new Date(String(ev.winback)).getTime() : 0
      if (ultimoWinback && agora - ultimoWinback < WINBACK_INTERVALO_DIAS * DIA) { emailsPulados++; continue }
      const msg = mensagemPara(uid)
      if (!msg) { emailsPulados++; continue }
      const r = await enviarEmailLembrete({ para: String((p as any).email), userId: uid, titulo: msg.title, corpo: msg.body })
      if (r.ok) { emails++; contagem.winback++; await marcar(p, 'winback') }
      else { emailsFalha++; console.error('[Lembrete e-mail] falhou', r.motivo) }
    }
  }

  return NextResponse.json({ turno, enviados, removidos, total: (subs || []).length, emails, emailsFalha, emailsPulados, porTipo: contagem, temColunaEmails })
}
