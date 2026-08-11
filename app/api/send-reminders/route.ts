import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'
import { enviarEmailLembrete } from '../../../lib/email'
import { missaoPara } from '../../../lib/missao'

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
  const [{ data: subs }, { data: prog }, { data: perfis }] = await Promise.all([
    admin.from('push_subscriptions').select('user_id, subscription'),
    // email e email_lembretes entram aqui para o canal de e-mail. A coluna
    // email_lembretes pode ainda não existir no banco; o select tolera isso mais
    // abaixo, tratando ausente como "pode receber".
    admin.from('progresso').select('user_id, ultima_atividade, streak, dias_ativos, nome, is_premium, premium_expira, perfil_ia, email, email_lembretes'),
    admin.from('profiles').select('id, trial_expira'),
  ])
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

    // 2) Winback: sumiu de verdade.
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

  // E-MAIL, só para quem NÃO tem push. É o único canal que alcança quem baixou pela
  // App Store (iPhone não tem web push) e quem recusou a permissão no Android/web.
  //
  // Uma vez por dia, no turno da NOITE. O push vai 2x porque é barato e descartável;
  // e-mail 2x/dia gera reclamação de spam, e reclamação queima o domínio inteiro --
  // inclusive os e-mails de recuperação de senha, que não podem parar de chegar.
  let emails = 0, emailsFalha = 0, emailsPulados = 0
  if (turno === 'noite') {
    for (const p of prog || []) {
      const uid = (p as any).user_id as string
      if (comPush.has(uid)) { emailsPulados++; continue }      // já recebeu push, não duplica
      const para = String((p as any).email || '')
      if (!para.includes('@')) { emailsPulados++; continue }
      // Coluna pode não existir ainda (email_lembretes_column.sql). undefined = pode
      // receber; só FALSE explícito bloqueia -- quem clicou em "não quero mais".
      if ((p as any).email_lembretes === false) { emailsPulados++; continue }
      const msg = mensagemPara(uid)
      if (!msg) { emailsPulados++; continue }
      const r = await enviarEmailLembrete({ para, userId: uid, titulo: msg.title, corpo: msg.body })
      if (r.ok) emails++
      else { emailsFalha++; console.error('[Lembrete e-mail] falhou', r.motivo) }
    }
  }

  return NextResponse.json({ turno, enviados, removidos, total: (subs || []).length, emails, emailsFalha, emailsPulados })
}
