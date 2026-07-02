import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@supabase/supabase-js'

const VAPID_PUBLIC = 'BGvDV8RzI74VwBSU6MSVcAgDJS3WF_zTGrpDW9cY26dyf85JAbJP0aRhJpU8BECmc3Z6yvHRHctbxxE0Bk-5cLo'

export async function GET(req: NextRequest) {
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

  const hoje = new Date().toISOString().split('T')[0]
  const { data: subs } = await admin.from('push_subscriptions').select('user_id, subscription')
  const { data: prog } = await admin.from('progresso').select('user_id, ultima_atividade, streak')
  const estudouHoje = new Set((prog || []).filter((p: any) => p.ultima_atividade === hoje).map((p: any) => p.user_id))
  const streakDe = new Map((prog || []).map((p: any) => [p.user_id, p.streak || 0]))

  // Mensagem personalizada: quanto maior a sequência em risco, mais forte o apelo.
  const msgParaStreak = (st: number) => {
    if (st >= 30) return { title: `🔥 ${st} dias! Não perca hoje`, body: `Sua sequência de ${st} dias acaba à meia-noite. Bastam 5 minutos para mantê-la.` }
    if (st >= 7) return { title: `🔥 Sua sequência de ${st} dias está em risco`, body: 'Faça uma lição rápida agora e mantenha o ritmo!' }
    if (st >= 1) return { title: 'Vonai 🔥', body: `Você está com ${st} ${st === 1 ? 'dia' : 'dias'} de sequência. Continue hoje!` }
    return { title: 'Vonai 🎯', body: 'Que tal 5 minutos de inglês agora? Sua meta de hoje espera por você.' }
  }
  let enviados = 0, removidos = 0
  for (const s of subs || []) {
    if (estudouHoje.has(s.user_id)) continue
    const { title, body } = msgParaStreak(streakDe.get(s.user_id) || 0)
    const payload = JSON.stringify({ title, body, url: '/app' })
    try {
      await webpush.sendNotification(s.subscription as any, payload)
      enviados++
    } catch (e: any) {
      // Inscrição expirada ou inválida → remove para não tentar de novo
      if (e?.statusCode === 404 || e?.statusCode === 410 || e?.statusCode === 400 || String(e?.message || '').includes('p256dh')) {
        await admin.from('push_subscriptions').delete().eq('user_id', s.user_id)
        removidos++
      }
    }
  }
  return NextResponse.json({ enviados, removidos, total: (subs || []).length })
}
