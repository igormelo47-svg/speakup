import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { consultarAssinatura, reconhecerAssinatura, playConfigurado } from '../../../../lib/play-billing'
import { enviarPurchaseGA4 } from '../../../../lib/ga4'
import { enviarPurchaseMeta } from '../../../../lib/meta-capi'
import { avisarVenda } from '../../../../lib/avisar-venda'
import { premiarIndicador } from '../../../../lib/indicacao-premio'

// Compra pelo Google Play (TWA/Android). O app chama aqui logo depois do PaymentRequest
// devolver o purchaseToken. O servidor: confirma na Google Play Developer API, grava o
// token na conta (compras_play), libera o Premium até expiryTime e FAZ O ACKNOWLEDGE —
// sem ele o Google estorna em 3 dias. Idempotente: chamar de novo só reconfirma.
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !anon || !service) return NextResponse.json({ error: 'missing env' }, { status: 500 })
  if (!playConfigurado()) return NextResponse.json({ ok: false, motivo: 'play_nao_configurado' }, { status: 503 })

  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '')
  if (!token) return new NextResponse('unauthorized', { status: 401 })
  const auth = createClient(url, anon)
  const { data: userData, error: userErr } = await auth.auth.getUser(token)
  const uid = userData?.user?.id
  if (userErr || !uid) return new NextResponse('unauthorized', { status: 401 })

  let purchaseToken = ''
  let plano = ''
  try { const b = await req.json(); purchaseToken = String(b?.purchaseToken || ''); plano = String(b?.plano || '') } catch (e) {}
  if (!purchaseToken || purchaseToken.length < 20) return NextResponse.json({ ok: false, motivo: 'token_invalido' }, { status: 400 })

  let ass
  try { ass = await consultarAssinatura(purchaseToken) } catch (e: any) {
    console.error('[Play] consulta falhou', e?.message)
    return NextResponse.json({ ok: false, motivo: 'consulta_falhou', detalhe: String(e?.message || '').slice(0, 160) }, { status: 502 })
  }

  const admin = createClient(url, service)
  // Guarda o token por conta (tabela compras_play — migracao_2026-08-21_play_billing.sql).
  // É por ele que o webhook de renovação/cancelamento acha a conta depois.
  try {
    await admin.from('compras_play').upsert({ purchase_token: purchaseToken, user_id: uid, produto: ass.produto, estado: ass.estado, expira_em: ass.expiraEm, atualizado_em: new Date().toISOString() }, { onConflict: 'purchase_token' })
  } catch (e) { console.warn('[Play] compras_play indisponível (rodar a migração)', e) }

  if (!ass.ativa) return NextResponse.json({ ok: false, motivo: 'assinatura_inativa', estado: ass.estado })

  // +3 dias de folga, igual ao Kiwify: renovação atrasada não derruba o aluno na hora.
  const folga = new Date(new Date(ass.expiraEm!).getTime() + 3 * 86400000).toISOString()
  const { error: upErr } = await admin.from('progresso').update({ is_premium: true, premium_expira: folga, updated_at: new Date().toISOString() }).eq('user_id', uid)
  if (upErr) return NextResponse.json({ ok: false, motivo: 'falha_gravar' }, { status: 500 })

  let reconhecida = ass.reconhecida
  if (!reconhecida && ass.produto) {
    reconhecida = await reconhecerAssinatura(ass.produto, purchaseToken)
    if (!reconhecida) console.error('[Play] acknowledge falhou', purchaseToken.slice(0, 12))
  }

  // Medição (só na 1ª confirmação desta compra: antes do acknowledge). Trial não é receita —
  // value 0 no GA4/Meta evita inflar o ROAS com quem ainda pode cancelar.
  if (!ass.reconhecida) {
    const anual = /anual/.test(String(ass.produto || plano))
    const valor = ass.emTrial ? 0 : (anual ? 289.9 : 29.9)
    try {
      const { data: pr } = await admin.from('progresso').select('attrib, email').eq('user_id', uid).maybeSingle()
      const tid = `play_${purchaseToken.slice(-24)}`
      await enviarPurchaseGA4({ userId: uid, clientId: pr?.attrib?.ga_cid || null, gclid: pr?.attrib?.gclid || null, transactionId: tid, value: valor })
      await enviarPurchaseMeta({ userId: uid, email: pr?.email || null, transactionId: tid, value: valor, fbp: pr?.attrib?.fbp || null, fbclid: pr?.attrib?.fbclid || null, ts: pr?.attrib?.ts || null })
      await avisarVenda({ email: pr?.email || uid, origem: 'Google Play', tipo: ass.emTrial ? 'TRIAL_INICIADO' : 'INITIAL_PURCHASE', valor })
      if (!ass.emTrial) await premiarIndicador(admin, uid)
    } catch (e) {}
  }

  return NextResponse.json({ ok: true, premiumAte: folga, emTrial: ass.emTrial, reconhecida, estado: ass.estado })
}
