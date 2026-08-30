import { describe, it, expect } from 'vitest'
import crypto from 'crypto'
import { verificaAssinaturaStripe, paraForm, expiraCom, precoId, type JsonObj } from '../lib/stripe'

// Assinatura do Stripe: `t=<unix>,v1=<hmac-sha256 hex de "t.corpo">`.
function assina(corpo: string, segredo: string, t = Math.floor(Date.now() / 1000)) {
  const v1 = crypto.createHmac('sha256', segredo).update(`${t}.${corpo}`).digest('hex')
  return `t=${t},v1=${v1}`
}

describe('verificaAssinaturaStripe', () => {
  const corpo = JSON.stringify({ type: 'invoice.payment_succeeded', data: { object: { amount_paid: 2990 } } })
  const segredo = 'whsec_teste_123'

  it('aceita uma assinatura válida', () => {
    expect(verificaAssinaturaStripe(corpo, assina(corpo, segredo), segredo)).toBe(true)
  })

  it('recusa quando o segredo é outro — é o que separa um pagamento real de um forjado', () => {
    expect(verificaAssinaturaStripe(corpo, assina(corpo, 'whsec_outro'), segredo)).toBe(false)
  })

  it('recusa quando o corpo foi alterado depois de assinado', () => {
    const cab = assina(corpo, segredo)
    expect(verificaAssinaturaStripe(corpo.replace('2990', '1'), cab, segredo)).toBe(false)
  })

  it('recusa replay: assinatura com mais de 5 minutos', () => {
    const velho = Math.floor(Date.now() / 1000) - 400
    expect(verificaAssinaturaStripe(corpo, assina(corpo, segredo, velho), segredo)).toBe(false)
  })

  it('aceita durante a rotação do segredo, quando vêm dois v1 e um deles confere', () => {
    const t = Math.floor(Date.now() / 1000)
    const bom = crypto.createHmac('sha256', segredo).update(`${t}.${corpo}`).digest('hex')
    expect(verificaAssinaturaStripe(corpo, `t=${t},v1=deadbeef,v1=${bom}`, segredo)).toBe(true)
  })

  it('recusa cabeçalho ausente, vazio ou sem v1', () => {
    expect(verificaAssinaturaStripe(corpo, null, segredo)).toBe(false)
    expect(verificaAssinaturaStripe(corpo, '', segredo)).toBe(false)
    expect(verificaAssinaturaStripe(corpo, 't=123', segredo)).toBe(false)
  })

  it('recusa quando não existe segredo configurado, em vez de deixar passar', () => {
    expect(verificaAssinaturaStripe(corpo, assina(corpo, ''), '')).toBe(false)
  })
})

describe('paraForm', () => {
  it('achata objeto aninhado no formato do Stripe', () => {
    const r = paraForm({ subscription_data: { trial_period_days: 3, metadata: { user_id: 'abc' } } })
    expect(r).toContain('subscription_data%5Btrial_period_days%5D=3')
    expect(r).toContain('subscription_data%5Bmetadata%5D%5Buser_id%5D=abc')
  })

  it('indexa arrays como line_items[0][price]', () => {
    const r = paraForm({ line_items: [{ price: 'price_1', quantity: 1 }] } as JsonObj)
    expect(r).toContain('line_items%5B0%5D%5Bprice%5D=price_1')
    expect(r).toContain('line_items%5B0%5D%5Bquantity%5D=1')
  })

  it('ignora null e undefined em vez de mandar a string "null" para o Stripe', () => {
    expect(paraForm({ a: null, b: undefined, c: 'ok' })).toEqual(['c=ok'])
  })

  it('escapa valores com caracteres especiais', () => {
    expect(paraForm({ email: 'a+b@teste.com' })).toEqual(['email=a%2Bb%40teste.com'])
  })
})

describe('expiraCom', () => {
  it('usa o fim do ciclo mais 3 dias de folga para o webhook de renovação chegar', () => {
    const fim = Math.floor(Date.now() / 1000) + 30 * 86400
    const r = new Date(expiraCom(fim)).getTime()
    expect(Math.round((r - fim * 1000) / 86400000)).toBe(3)
  })

  it('sem data do Stripe, assume ~34 dias no mensal e ~366 no anual', () => {
    const dias = (iso: string) => Math.round((new Date(iso).getTime() - Date.now()) / 86400000)
    expect(dias(expiraCom(null, false))).toBe(34)
    expect(dias(expiraCom(null, true))).toBe(366)
  })
})

describe('precoId', () => {
  it('só aceita id que começa com price_, para env mal preenchida não virar checkout quebrado', () => {
    process.env.STRIPE_PRICE_MENSAL = 'prod_errado'
    expect(precoId('mensal')).toBeNull()
    process.env.STRIPE_PRICE_MENSAL = 'price_certo'
    expect(precoId('mensal')).toBe('price_certo')
    delete process.env.STRIPE_PRICE_MENSAL
    expect(precoId('mensal')).toBeNull()
  })
})
