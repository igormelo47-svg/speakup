// GA4 Measurement Protocol — o SERVIDOR escreve o purchase direto na propriedade,
// sem depender do navegador (a compra é confirmada pelo gateway dias depois do clique,
// muitas vezes com o app fechado). Chave em env (GA4_MP_API_SECRET), nunca no código.
// Dedup com o evento client-side: mesmo transaction_id nas duas pontas.

// Envia um evento qualquer pelo Measurement Protocol. Existe porque o disparo pelo
// dataLayer só chega ao GA4 se houver uma tag correspondente no GTM — que é conta do
// gestor de tráfego, não nossa. Pelo servidor o evento chega mesmo sem tag nenhuma.
export async function enviarEventoGA4(opts: {
  nome: string
  userId: string
  clientId?: string | null
  params?: Record<string, any>
}) {
  const secret = process.env.GA4_MP_API_SECRET
  const mid = process.env.GA4_MEASUREMENT_ID || 'G-S3Q5Q2NQY0'
  if (!secret) return { sent: false, reason: 'sem GA4_MP_API_SECRET na Vercel' }
  const body = {
    client_id: opts.clientId || pseudoCid(opts.userId),
    user_id: opts.userId,
    events: [{ name: opts.nome, params: { origem: 'servidor', ...(opts.params || {}) } }],
  }
  try {
    const r = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${mid}&api_secret=${encodeURIComponent(secret)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return { sent: r.status >= 200 && r.status < 300, status: r.status }
  } catch (e: any) {
    return { sent: false, reason: String(e?.message || e) }
  }
}

export async function enviarPurchaseGA4(opts: {
  userId: string
  clientId?: string | null
  transactionId: string
  value: number
  gclid?: string | null
}) {
  const secret = process.env.GA4_MP_API_SECRET
  const mid = process.env.GA4_MEASUREMENT_ID || 'G-S3Q5Q2NQY0'
  if (!secret) return { sent: false, reason: 'sem GA4_MP_API_SECRET na Vercel' }
  // client_id é obrigatório no MP. O ideal é o cid real do navegador (cookie _ga, gravado
  // em progresso.attrib.ga_cid no cadastro); sem ele, um pseudo-id estável derivado do
  // user_id — o user_id é quem liga o evento à pessoa no GA4.
  const cid = opts.clientId || pseudoCid(opts.userId)
  const body = {
    client_id: cid,
    user_id: opts.userId,
    events: [{
      name: 'purchase',
      params: {
        transaction_id: opts.transactionId,
        value: opts.value,
        currency: 'BRL',
        origem: 'webhook_servidor',
        ...(opts.gclid ? { gclid: opts.gclid } : {}),
      },
    }],
  }
  try {
    const r = await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${mid}&api_secret=${encodeURIComponent(secret)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    return { sent: r.status >= 200 && r.status < 300, status: r.status }
  } catch (e: any) {
    return { sent: false, reason: String(e?.message || e) }
  }
}

// Pseudo client_id determinístico no formato "número.número" que o GA4 aceita.
function pseudoCid(userId: string): string {
  let h1 = 7, h2 = 13
  for (let i = 0; i < userId.length; i++) h1 = (h1 * 31 + userId.charCodeAt(i)) >>> 0
  for (let i = userId.length - 1; i >= 0; i--) h2 = (h2 * 33 + userId.charCodeAt(i)) >>> 0
  return `${h1}.${h2}`
}
