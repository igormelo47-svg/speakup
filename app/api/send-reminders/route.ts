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
  const { data: prog } = await admin.from('progresso').select('user_id, ultima_atividade')
  const estudouHoje = new Set((prog || []).filter((p: any) => p.ultima_atividade === hoje).map((p: any) => p.user_id))

  const payload = JSON.stringify({ title: 'Vonai 🔥', body: 'Mantenha sua sequência! Faça sua lição de hoje.', url: '/app' })
  let enviados = 0, removidos = 0
  for (const s of subs || []) {
    if (estudouHoje.has(s.user_id)) continue
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
