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

// Lead = teste de nível concluído. É o evento pelo qual a campanha do Meta OTIMIZA desde
// 07/08 (ver a conversa com o gestor): raso e frequente o bastante para o conjunto sair da
// fase de aprendizado com R$50/dia, coisa que o StartTrial nunca conseguiria.
//
// Por que pelo servidor além do pixel: bloqueador de anúncio, iPhone com rastreamento
// restrito e aba fechada rápido demais comem uma fatia dos eventos do navegador. Como a
// campanha inteira aprende com ESTE evento, cada um perdido é verba andando no escuro.
//
// A página do teste é PÚBLICA: não há login, e-mail nem user_id. O casamento com a pessoa
// fica por conta do cookie _fbp, do fbc (do fbclid do anúncio), do IP e do user agent —
// por isso os três últimos vêm do request, e não do corpo, que o cliente poderia forjar.
//
// ⚠️ event_id TEM que ser o MESMO que o pixel enviou, senão o Meta conta o evento DUAS
// vezes e estraga justamente o sinal que estamos protegendo. Por isso o id nasce no
// navegador e viaja pelos dois caminhos.
export async function enviarLeadMeta(opts: {
  eventId: string
  fbp?: string | null
  fbc?: string | null
  ip?: string | null
  userAgent?: string | null
  url?: string | null
  nivel?: string | null
  testEventCode?: string
}) {
  const token = process.env.META_CAPI_TOKEN
  if (!token) return { sent: false, reason: 'sem META_CAPI_TOKEN na Vercel' }

  const user_data: Record<string, any> = {}
  if (opts.fbp) user_data.fbp = opts.fbp
  if (opts.fbc) user_data.fbc = opts.fbc
  if (opts.ip) user_data.client_ip_address = opts.ip
  if (opts.userAgent) user_data.client_user_agent = opts.userAgent
  // Sem NENHUM sinal de identidade o Meta descarta o evento — não gasta chamada à toa.
  if (!Object.keys(user_data).length) return { sent: false, reason: 'sem dados de casamento' }

  const testCode = opts.testEventCode || process.env.META_CAPI_TEST_CODE
  const body = {
    ...(testCode ? { test_event_code: testCode } : {}),
    data: [{
      event_name: 'Lead',
      event_time: Math.floor(Date.now() / 1000),
      event_id: opts.eventId,
      action_source: 'website',
      event_source_url: opts.url || 'https://vonai.com.br/teste-de-nivel-de-ingles',
      user_data,
      ...(opts.nivel ? { custom_data: { content_name: `nivel_${opts.nivel}` } } : {}),
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

export async function enviarPurchaseMeta(opts: {
  userId: string
  email?: string | null
  transactionId: string
  value: number
  fbp?: string | null      // cookie _fbp gravado no cadastro (attrib.fbp)
  fbclid?: string | null   // 1º toque (attrib.fbclid) — vira fbc se não houver cookie _fbc
  ts?: string | null       // attrib.ts — momento do 1º toque, usado no fbc derivado
  testEventCode?: string   // força a aba "Eventos de teste" (validação); sobrepõe a env
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
  const testCode = opts.testEventCode || process.env.META_CAPI_TEST_CODE
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
