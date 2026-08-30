// ============================================================================
// Stripe pela API REST — de propósito SEM o pacote `stripe` do npm.
//
// Motivo: uma dependência nova exige `npm install` antes do próximo deploy. Se isso for
// esquecido, o build quebra e o site inteiro sai do ar. Assim o código funciona já no
// primeiro deploy, sem passo extra. A API do Stripe é form-encoded e estável há anos, e
// este arquivo cobre só o que o Vonai usa: criar checkout, ler assinatura, abrir o portal
// e conferir a assinatura do webhook.
// ============================================================================
import crypto from 'crypto'

// Corpo/resposta do Stripe: JSON arbitrário, mas tipado o suficiente para o lint e para
// quem lê depois. `unknown` obrigaria a checar tudo no ponto de uso, sem ganho real aqui.
export type JsonValor = string | number | boolean | null | undefined | JsonValor[] | { [k: string]: JsonValor }
export type JsonObj = { [k: string]: JsonValor }

const API = 'https://api.stripe.com/v1'

export function stripeConfigurado(): boolean {
  return !!process.env.STRIPE_SECRET_KEY
}

// Converte objeto aninhado para o formato do Stripe: subscription_data[metadata][user_id]=abc
export function paraForm(obj: JsonObj, prefixo = ''): string[] {
  const saida: string[] = []
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    const chave = prefixo ? `${prefixo}[${k}]` : k
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item && typeof item === 'object' && !Array.isArray(item)) saida.push(...paraForm(item as JsonObj, `${chave}[${i}]`))
        else saida.push(`${encodeURIComponent(`${chave}[${i}]`)}=${encodeURIComponent(String(item))}`)
      })
    } else if (typeof v === 'object') {
      saida.push(...paraForm(v as JsonObj, chave))
    } else {
      saida.push(`${encodeURIComponent(chave)}=${encodeURIComponent(String(v))}`)
    }
  }
  return saida
}

type Opcoes = { method?: 'GET' | 'POST'; body?: JsonObj; idempotencia?: string }

export async function stripeApi(caminho: string, opts: Opcoes = {}): Promise<JsonObj> {
  const chave = process.env.STRIPE_SECRET_KEY
  if (!chave) throw new Error('STRIPE_SECRET_KEY ausente na Vercel')
  const method = opts.method || 'POST'
  const headers: Record<string, string> = {
    Authorization: `Bearer ${chave}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  }
  // Evita cobrar/criar duas vezes se a Vercel repetir a chamada (retry de deploy, timeout).
  if (opts.idempotencia) headers['Idempotency-Key'] = opts.idempotencia

  const corpo = opts.body ? paraForm(opts.body).join('&') : undefined
  const r = await fetch(`${API}${caminho}`, { method, headers, body: method === 'POST' ? corpo : undefined })
  const json = (await r.json().catch(() => ({}))) as JsonObj & { error?: { message?: string } }
  if (!r.ok) {
    const msg = json?.error?.message || `HTTP ${r.status}`
    throw new Error(`Stripe ${caminho}: ${msg}`)
  }
  return json
}

// Confere a assinatura do webhook (esquema oficial do Stripe).
// Header: `t=<unix>,v1=<hmac sha256 hex>` — pode vir mais de um v1 durante rotação do segredo.
// Assinado: `${t}.${corpo bruto}`. Tolerância de 5 min contra replay.
export function verificaAssinaturaStripe(raw: string, header: string | null, segredo: string): boolean {
  if (!header || !segredo) return false
  let t = ''
  const v1: string[] = []
  for (const parte of header.split(',')) {
    const i = parte.indexOf('=')
    if (i < 0) continue
    const k = parte.slice(0, i).trim()
    const v = parte.slice(i + 1).trim()
    if (k === 't') t = v
    else if (k === 'v1') v1.push(v)
  }
  if (!t || v1.length === 0) return false

  const idade = Math.abs(Date.now() / 1000 - Number(t))
  if (!isFinite(idade) || idade > 300) return false

  const esperada = crypto.createHmac('sha256', segredo).update(`${t}.${raw}`).digest('hex')
  const bufEsperada = Buffer.from(esperada)
  for (const cand of v1) {
    try {
      const bufCand = Buffer.from(cand)
      if (bufCand.length === bufEsperada.length && crypto.timingSafeEqual(bufEsperada, bufCand)) return true
    } catch {}
  }
  return false
}

// ---------------------------------------------------------------------------
// Preços. Os IDs vêm da Vercel para o mesmo código servir teste e produção.
// ---------------------------------------------------------------------------
export function precoId(plano: 'mensal' | 'anual'): string | null {
  const id = plano === 'anual' ? process.env.STRIPE_PRICE_ANUAL : process.env.STRIPE_PRICE_MENSAL
  return id && id.startsWith('price_') ? id : null
}

export const VALOR_PLANO = { mensal: 29.9, anual: 289.8 } as const

// Quantos dias de teste grátis antes da 1ª cobrança. Precisa bater com PRECO.diasGratis
// em app/_marketing/ui.tsx e com os triggers do banco.
export const DIAS_TRIAL = Number(process.env.STRIPE_TRIAL_DIAS || 3)

// Fim do ciclo pago + 3 dias de folga, para o acesso não cair antes do webhook de renovação
// chegar. Mesma regra do webhook da Kiwify, para os dois caminhos se comportarem igual.
export function expiraCom(periodEndSegundos: number | null | undefined, anual = false): string {
  if (periodEndSegundos && Number.isFinite(periodEndSegundos)) {
    return new Date(periodEndSegundos * 1000 + 3 * 86400000).toISOString()
  }
  return new Date(Date.now() + (anual ? 366 : 34) * 86400000).toISOString()
}
