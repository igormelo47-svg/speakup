import crypto from 'crypto'

// Google Play Billing — lado do servidor.
//
// O app da Play Store é um TWA (site embalado). Lá dentro, a compra acontece pela Digital
// Goods API + Payment Request (page.tsx, comprarPlay). O navegador devolve um
// `purchaseToken`; QUEM DECIDE se a compra vale é este módulo, consultando a Google Play
// Developer API com uma conta de serviço — nunca o cliente.
//
// Env (Vercel):
//   GOOGLE_PLAY_PACKAGE   app.vercel.speakup_dusky.twa
//   GOOGLE_PLAY_SA_EMAIL  e-mail da conta de serviço (xxx@yyy.iam.gserviceaccount.com)
//   GOOGLE_PLAY_SA_KEY    chave privada PEM da conta de serviço (o campo private_key do JSON;
//                         pode colar com \n literais — tratado abaixo)
//   PLAY_WEBHOOK_TOKEN    segredo da URL do push do Pub/Sub (/api/play-webhook?token=...)
//
// Sem as três primeiras, tudo aqui responde { ok:false, motivo } e nada é liberado.

export const PRODUTOS_PLAY: Record<'mensal' | 'anual', string> = {
  mensal: 'vonai_premium_mensal',
  anual: 'vonai_premium_anual',
}

const SCOPE = 'https://www.googleapis.com/auth/androidpublisher'

function b64url(input: Buffer | string) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function playConfigurado(): boolean {
  return !!(process.env.GOOGLE_PLAY_PACKAGE && process.env.GOOGLE_PLAY_SA_EMAIL && process.env.GOOGLE_PLAY_SA_KEY)
}

let tokenCache: { token: string; exp: number } | null = null

// Troca o JWT da conta de serviço por um access token (RS256, sem SDK — menos dependência).
export async function tokenAcesso(): Promise<string> {
  if (tokenCache && tokenCache.exp > Date.now() + 60000) return tokenCache.token
  const email = process.env.GOOGLE_PLAY_SA_EMAIL || ''
  const key = (process.env.GOOGLE_PLAY_SA_KEY || '').replace(/\\n/g, '\n')
  if (!email || !key) throw new Error('play_nao_configurado')
  const agora = Math.floor(Date.now() / 1000)
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claims = b64url(JSON.stringify({ iss: email, scope: SCOPE, aud: 'https://oauth2.googleapis.com/token', iat: agora, exp: agora + 3600 }))
  const assinatura = crypto.createSign('RSA-SHA256').update(`${header}.${claims}`).sign(key)
  const jwt = `${header}.${claims}.${b64url(assinatura)}`
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  })
  if (!r.ok) throw new Error(`oauth_${r.status}: ${(await r.text()).slice(0, 200)}`)
  const j = await r.json()
  tokenCache = { token: j.access_token, exp: Date.now() + (Number(j.expires_in || 3600) - 30) * 1000 }
  return tokenCache.token
}

export type AssinaturaPlay = {
  ativa: boolean
  estado: string
  expiraEm: string | null
  produto: string | null
  basePlan: string | null
  emTrial: boolean
  reconhecida: boolean
  obfuscatedAccountId: string | null
  linkedToken: string | null
  bruto: any
}

// purchases.subscriptionsv2.get — estado real da assinatura a partir do purchaseToken.
export async function consultarAssinatura(purchaseToken: string): Promise<AssinaturaPlay> {
  const pkg = process.env.GOOGLE_PLAY_PACKAGE || ''
  const tk = await tokenAcesso()
  const r = await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(pkg)}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`, {
    headers: { Authorization: `Bearer ${tk}` },
  })
  if (!r.ok) throw new Error(`play_get_${r.status}: ${(await r.text()).slice(0, 200)}`)
  const j = await r.json()
  const item = Array.isArray(j?.lineItems) && j.lineItems.length ? j.lineItems[0] : null
  const estado = String(j?.subscriptionState || '')
  // Estados que dão acesso: ACTIVE (inclui trial) e IN_GRACE_PERIOD. CANCELED mantém acesso
  // até expiryTime — tratamos pela data. PAUSED/ON_HOLD/EXPIRED não dão.
  const expira = item?.expiryTime ? new Date(item.expiryTime) : null
  const porEstado = estado === 'SUBSCRIPTION_STATE_ACTIVE' || estado === 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD' || estado === 'SUBSCRIPTION_STATE_CANCELED'
  const ativa = porEstado && !!expira && expira.getTime() > Date.now()
  return {
    ativa,
    estado,
    expiraEm: expira ? expira.toISOString() : null,
    produto: item?.productId || null,
    basePlan: item?.offerDetails?.basePlanId || null,
    emTrial: !!item?.offerDetails?.offerId,
    reconhecida: String(j?.acknowledgementState || '') === 'ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED',
    obfuscatedAccountId: j?.externalAccountIdentifiers?.obfuscatedExternalAccountId || null,
    linkedToken: j?.linkedPurchaseToken || null,
    bruto: j,
  }
}

// purchases.subscriptions.acknowledge — obrigatório em até 3 dias, senão o Google estorna.
export async function reconhecerAssinatura(produto: string, purchaseToken: string): Promise<boolean> {
  const pkg = process.env.GOOGLE_PLAY_PACKAGE || ''
  const tk = await tokenAcesso()
  const r = await fetch(`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(pkg)}/purchases/subscriptions/${encodeURIComponent(produto)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`, {
    method: 'POST', headers: { Authorization: `Bearer ${tk}`, 'Content-Type': 'application/json' }, body: '{}',
  })
  return r.ok
}
