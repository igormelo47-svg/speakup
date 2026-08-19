import { describe, it, expect, beforeEach } from 'vitest'
import crypto from 'crypto'
import { NextRequest } from 'next/server'
import { POST, classificarEvento, acharEmail, acharTipo, ehAnual, acharExpiracao, extrairS1 } from '../app/api/kiwify-webhook/route'

// Estes testes protegem o caminho do DINHEIRO: se algo aqui quebrar, aluno paga e não
// recebe Premium (ou recebe sem pagar). Rodam sem rede: só a lógica pura + autenticação.

const DIA = 86400000

describe('classificarEvento — ordem reembolso > cancelamento > pago', () => {
  it('reembolso vence mesmo quando o payload também parece pago', () => {
    // Pegadinha real da Kiwify: evento de refund chega com order_status 'paid' do pedido original.
    expect(classificarEvento('refund paid')).toBe('reembolso')
    expect(classificarEvento('chargeback approved')).toBe('reembolso')
    expect(classificarEvento('charge_back')).toBe('reembolso')
  })
  it('cancelamento vence sobre pago', () => {
    expect(classificarEvento('subscription_canceled paid')).toBe('cancelamento')
    expect(classificarEvento('subscription_late active')).toBe('cancelamento')
  })
  it('pago só quando é pago mesmo', () => {
    expect(classificarEvento('order_approved')).toBe('pago')
    expect(classificarEvento('subscription_renewed')).toBe('pago')
    expect(classificarEvento('boleto_gerado')).toBe(null)
  })
})

describe('acharEmail — formatos de payload da Kiwify', () => {
  it('acha o e-mail nas variações conhecidas', () => {
    expect(acharEmail({ Customer: { email: 'a@b.com' } })).toBe('a@b.com')
    expect(acharEmail({ customer: { email: 'a@b.com' } })).toBe('a@b.com')
    expect(acharEmail({ buyer_email: 'a@b.com' })).toBe('a@b.com')
    expect(acharEmail({ email: 'a@b.com' })).toBe('a@b.com')
  })
  it('null quando não há e-mail (evento vira ignored, nunca crash)', () => {
    expect(acharEmail({})).toBe(null)
    expect(acharEmail(null)).toBe(null)
  })
})

describe('extrairS1 — user_id que o app manda no link do checkout (?s1=)', () => {
  const ID = '3f2b1c4e-8a9d-4b7c-9e1f-0a2b3c4d5e6f'
  it('acha o s1 nas variações de payload da Kiwify e normaliza para minúsculas', () => {
    expect(extrairS1({ TrackingParameters: { s1: ID } })).toBe(ID)
    expect(extrairS1({ tracking: { s1: ID.toUpperCase() } })).toBe(ID)
    expect(extrairS1({ Subscription: { tracking: { s1: ID } } })).toBe(ID)
    expect(extrairS1({ s1: ID })).toBe(ID)
  })
  it('recusa o que não é UUID (utm colada errada, vazio) — cai no casamento por e-mail', () => {
    expect(extrairS1({ TrackingParameters: { s1: 'google_ads' } })).toBe(null)
    expect(extrairS1({ TrackingParameters: { s1: '' } })).toBe(null)
    expect(extrairS1({ TrackingParameters: { s1: "' or 1=1 --" } })).toBe(null)
    expect(extrairS1({})).toBe(null)
    expect(extrairS1(null)).toBe(null)
  })
})

describe('acharTipo — o TIPO do evento decide, não o order_status', () => {
  it('prioriza webhook_event_type sobre order_status', () => {
    expect(acharTipo({ webhook_event_type: 'subscription_canceled', order_status: 'paid' })).toBe('subscription_canceled')
  })
  it('cai pro order_status só como último recurso', () => {
    expect(acharTipo({ order_status: 'paid' })).toBe('paid')
  })
})

describe('ehAnual / acharExpiracao — quanto tempo de acesso o aluno ganha', () => {
  it('detecta plano anual pela descrição do produto', () => {
    expect(ehAnual({ Product: { product_name: 'Vonai Premium Anual' } })).toBe(true)
    expect(ehAnual({ Product: { product_name: 'Vonai Premium Mensal' } })).toBe(false)
  })
  it('usa next_payment + 3 dias de folga quando disponível', () => {
    const next = new Date(Date.now() + 30 * DIA)
    const exp = new Date(acharExpiracao({ Subscription: { next_payment: next.toISOString() } }))
    expect(exp.getTime()).toBeCloseTo(next.getTime() + 3 * DIA, -4)
  })
  it('assume mensal (34 dias) sem next_payment; anual dá ~366', () => {
    const mensal = new Date(acharExpiracao({}))
    expect(mensal.getTime()).toBeCloseTo(Date.now() + 34 * DIA, -4)
    const anual = new Date(acharExpiracao({ Product: { product_name: 'plano yearly' } }))
    expect(anual.getTime()).toBeCloseTo(Date.now() + 366 * DIA, -4)
  })
  it('next_payment no passado é ignorado (não dá acesso retroativo negativo)', () => {
    const exp = new Date(acharExpiracao({ Subscription: { next_payment: new Date(Date.now() - 10 * DIA).toISOString() } }))
    expect(exp.getTime()).toBeGreaterThan(Date.now())
  })
})

describe('POST — autenticação (a porta do dinheiro)', () => {
  beforeEach(() => {
    process.env.KIWIFY_TOKEN = 'segredo-teste'
    // Dummies: os caminhos testados retornam antes de qualquer chamada real ao Supabase.
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://dummy.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'dummy'
  })

  function req(url: string, body: string) {
    return new NextRequest(new Request(url, { method: 'POST', body }))
  }

  it('recusa sem token e sem assinatura', async () => {
    const r = await POST(req('http://x/api/kiwify-webhook', '{}'))
    expect(r.status).toBe(401)
  })
  it('recusa token errado', async () => {
    const r = await POST(req('http://x/api/kiwify-webhook?token=errado', '{}'))
    expect(r.status).toBe(401)
  })
  it('recusa se KIWIFY_TOKEN não está configurado (fail-closed, nunca fail-open)', async () => {
    process.env.KIWIFY_TOKEN = ''
    const r = await POST(req('http://x/api/kiwify-webhook?token=', '{}'))
    expect(r.status).toBe(401)
  })
  it('aceita assinatura HMAC-SHA1 válida do corpo', async () => {
    const body = JSON.stringify({ webhook_event_type: 'order_approved' }) // sem email → ignored
    const sig = crypto.createHmac('sha1', 'segredo-teste').update(body).digest('hex')
    const r = await POST(req(`http://x/api/kiwify-webhook?signature=${sig}`, body))
    expect(r.status).toBe(200)
    const json = await r.json()
    expect(json.ignored).toBe('sem email') // passou da auth e parou na validação seguinte
  })
  it('recusa assinatura de OUTRO corpo (replay com corpo trocado)', async () => {
    const sig = crypto.createHmac('sha1', 'segredo-teste').update('{"a":1}').digest('hex')
    const r = await POST(req(`http://x/api/kiwify-webhook?signature=${sig}`, '{"a":2}'))
    expect(r.status).toBe(401)
  })
})
