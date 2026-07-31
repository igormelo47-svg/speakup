import crypto from 'crypto'

// Meta API de Conversões — o SERVIDOR envia o Purchase direto pro conjunto de dados
// "Vonai — Site", sem depender do navegador (mesma lógica do GA4 MP em lib/ga4.ts).
// Token em env (META_CAPI_TOKEN), nunca no código. Dedup com o pixel do navegador:
// MESMO event_id nas duas pontas, no formato que o gestor de tráfego configurou no GTM:
// "vonai-purchase-<transaction_id>".

const DATASET_ID = process.env.META_DATASET_ID || '1582799540142116'

// O Meta exige dados de usuário com hash SHA-256 (e-mail minúsculo/sem espaços).
function sha256(v: string): string {
  return crypto.createHash('sha256').update(v.trim().toLowerCase()).digest('hex')
}

export async function enviarPurchaseMeta(opts: {
  userId: string
  email?: string | null
  transactionId: string
  value: number
  fbp?: string | null      // cookie _fbp gravado no cadastro (attrib.fbp)
  fbclid?: string | null   // 1º toque (attrib.fbclid) — vira fbc se não houver cookie _fbc
  ts?: string | null       // attrib.ts — momento do 1º toque, usado no fbc derivado
}) {
  const token = process.env.META_CAPI_TOKEN
  if (!token) return { sent: false, reason: 'sem META_CAPI_TOKEN na Vercel' }

  const user_data: Record<string, any> = { external_id: [sha256(opts.userId)] }
  if (opts.email) user_data.em = [sha256(opts.email)]
  if (opts.fbp) user_data.fbp = opts.fbp
  // fbc no formato fb.1.<timestamp ms>.<fbclid> — o Meta aceita o derivado do fbclid.
  if (opts.fbclid) {
    const t = opts.ts ? new Date(opts.ts).getTime() : Date.now()
    user_data.fbc = `fb.1.${isNaN(t) ? Date.now() : t}.${opts.fbclid}`
  }

  // Código de teste do Gerenciador de Eventos (validação sem compra real): quando a env
  // META_CAPI_TEST_CODE existe, o evento cai na aba "Eventos de teste" em vez de produção.
  // Setar só durante a validação com o gestor de tráfego e remover depois.
  const testCode = process.env.META_CAPI_TEST_CODE
  const body = {
    ...(testCode ? { test_event_code: testCode } : {}),
    data: [{
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: `vonai-purchase-${opts.transactionId}`,
      action_source: 'website',
      event_source_url: 'https://vonai.com.br',
      user_data,
      custom_data: { value: opts.value, currency: 'BRL' },
    }],
  }
  try {
    const r = await fetch(`https://graph.facebook.com/v21.0/${DATASET_ID}/events?access_token=${encodeURIComponent(token)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const resp = await r.json().catch(() => null)
    return { sent: r.ok, status: r.status, events_received: resp?.events_received ?? null, error: resp?.error?.message ?? null }
  } catch (e: any) {
    return { sent: false, reason: String(e?.message || e) }
  }
}
