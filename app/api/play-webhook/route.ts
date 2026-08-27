import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { consultarAssinatura, reconhecerAssinatura, playConfigurado } from '../../../lib/play-billing'
import { premiarIndicador } from '../../../lib/indicacao-premio'
import { avisarVenda } from '../../../lib/avisar-venda'

// Notificações em tempo real do Google Play (RTDN) via Pub/Sub push.
//
// Configuração (uma vez):
//   1. Google Cloud → Pub/Sub → criar tópico (ex.: vonai-play) e uma subscription do tipo
//      PUSH com endpoint https://vonai.com.br/api/play-webhook?token=<PLAY_WEBHOOK_TOKEN>
//   2. Dar ao publisher do Google Play (google-play-developer-notifications@system.gserviceaccount.com)
//      o papel Pub/Sub Publisher no tópico.
//   3. Play Console → app → Monetização → Configuração de monetização → Notificações em tempo
//      real → nome do tópico.
//
// O push traz só o purchaseToken; o estado de verdade vem da API (consultarAssinatura).
// A conta é achada em compras_play (gravada no /api/play/verificar na primeira compra).
export async function POST(req: NextRequest) {
  const esperado = process.env.PLAY_WEBHOOK_TOKEN || ''
  const token = req.nextUrl.searchParams.get('token') || ''
  if (!esperado || token !== esperado) return new NextResponse('unauthorized', { status: 401 })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return NextResponse.json({ error: 'missing env' }, { status: 500 })
  if (!playConfigurado()) return NextResponse.json({ ok: false, motivo: 'play_nao_configurado' })

  let body: any = {}
  try { body = await req.json() } catch { return NextResponse.json({ error: 'bad request' }, { status: 400 }) }
  let msg: any = {}
  try { msg = JSON.parse(Buffer.from(String(body?.message?.data || ''), 'base64').toString('utf8')) } catch (e) {}
  const sub = msg?.subscriptionNotification
  if (!sub?.purchaseToken) return NextResponse.json({ ok: true, ignored: msg?.testNotification ? 'test' : 'sem_token' })
  const purchaseToken = String(sub.purchaseToken)
  const tipoNum = Number(sub.notificationType || 0)

  const admin = createClient(url, service)
  let ass
  try { ass = await consultarAssinatura(purchaseToken) } catch (e: any) {
    console.error('[Play RTDN] consulta falhou', e?.message)
    // 200 para o Pub/Sub não reenviar em loop; o próximo evento da assinatura corrige.
    return NextResponse.json({ ok: false, motivo: 'consulta_falhou' })
  }

  // Acha a conta: pelo token desta compra, pelo token anterior (upgrade/downgrade gera token novo)
  // ou pelo obfuscatedAccountId (= user_id, que o app manda na compra).
  let uid: string | null = null
  for (const t of [purchaseToken, ass.linkedToken].filter(Boolean) as string[]) {
    const { data } = await admin.from('compras_play').select('user_id').eq('purchase_token', t).maybeSingle()
    if (data?.user_id) { uid = data.user_id; break }
  }
  if (!uid && ass.obfuscatedAccountId && /^[0-9a-f-]{36}$/i.test(ass.obfuscatedAccountId)) uid = ass.obfuscatedAccountId
  if (!uid) {
    console.error('[Play RTDN] conta não encontrada para o token', purchaseToken.slice(0, 12), 'tipo', tipoNum)
    return NextResponse.json({ ok: false, motivo: 'conta_nao_encontrada', tipo: tipoNum })
  }

  await admin.from('compras_play').upsert({ purchase_token: purchaseToken, user_id: uid, produto: ass.produto, estado: ass.estado, expira_em: ass.expiraEm, atualizado_em: new Date().toISOString() }, { onConflict: 'purchase_token' })

  if (ass.ativa) {
    const folga = new Date(new Date(ass.expiraEm!).getTime() + 3 * 86400000).toISOString()
    await admin.from('progresso').update({ is_premium: true, premium_expira: folga, updated_at: new Date().toISOString() }).eq('user_id', uid)
    if (!ass.reconhecida && ass.produto) await reconhecerAssinatura(ass.produto, purchaseToken)
    // 2 = RENEWED (primeira cobrança depois do trial ou renovação normal) → receita real.
    if (tipoNum === 2) {
      const anual = /anual/.test(String(ass.produto || ''))
      try { await avisarVenda({ email: uid, origem: 'Google Play', tipo: 'RENEWAL', valor: anual ? 289.9 : 29.9 }) } catch (e) {}
      await premiarIndicador(admin, uid)
    }
  } else {
    // 13 = EXPIRED, 12 = REVOKED (estorno): cai na hora. Cancelamento (3) mantém até expirar.
    if (tipoNum === 12 || tipoNum === 13 || ass.estado === 'SUBSCRIPTION_STATE_EXPIRED') {
      await admin.from('progresso').update({ is_premium: false, premium_expira: null, updated_at: new Date().toISOString() }).eq('user_id', uid)
    }
  }
  return NextResponse.json({ ok: true, tipo: tipoNum, estado: ass.estado, ativa: ass.ativa })
}

export async function GET() {
  return NextResponse.json({ ok: true, info: 'Webhook do Google Play (RTDN) ativo. Use POST.' })
}
