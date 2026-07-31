import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from '../app/api/revenuecat-webhook/route'

// Protege a porta do dinheiro do iOS: autenticação, sandbox e eventos que não mexem em acesso.
// Nenhum destes caminhos toca o Supabase — rodam sem rede.

function req(body: any, auth?: string) {
  return new NextRequest(new Request('http://x/api/revenuecat-webhook', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: auth ? { authorization: auth } : {},
  }))
}

describe('POST /api/revenuecat-webhook', () => {
  beforeEach(() => {
    process.env.REVENUECAT_AUTH = 'segredo-rc'
    // Dummies: os caminhos testados retornam antes de qualquer chamada ao Supabase.
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://dummy.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'dummy'
  })

  it('recusa sem Authorization', async () => {
    expect((await POST(req({ event: { type: 'INITIAL_PURCHASE' } }))).status).toBe(401)
  })
  it('recusa Authorization errada', async () => {
    expect((await POST(req({ event: { type: 'INITIAL_PURCHASE' } }, 'errada'))).status).toBe(401)
  })
  it('recusa se REVENUECAT_AUTH não está configurado (fail-closed)', async () => {
    process.env.REVENUECAT_AUTH = ''
    expect((await POST(req({ event: { type: 'INITIAL_PURCHASE' } }, ''))).status).toBe(401)
  })
  it('ignora evento TEST (botão de teste do painel do RC)', async () => {
    const r = await POST(req({ event: { type: 'TEST' } }, 'segredo-rc'))
    expect((await r.json()).ignored).toBe('TEST')
  })
  it('ignora SANDBOX — compra de TestFlight NUNCA libera Premium em produção', async () => {
    const r = await POST(req({ event: { type: 'INITIAL_PURCHASE', environment: 'SANDBOX' } }, 'segredo-rc'))
    expect((await r.json()).ignored).toBe('sandbox')
  })
  it('CANCELLATION não revoga (aluno pagou o ciclo; EXPIRATION revoga depois)', async () => {
    const r = await POST(req({ event: { type: 'CANCELLATION', environment: 'PRODUCTION' } }, 'segredo-rc'))
    expect((await r.json()).ignored).toBe('CANCELLATION')
  })
  it('BILLING_ISSUE não revoga na hora', async () => {
    const r = await POST(req({ event: { type: 'BILLING_ISSUE', environment: 'PRODUCTION' } }, 'segredo-rc'))
    expect((await r.json()).ignored).toBe('BILLING_ISSUE')
  })
  it('corpo inválido responde 400, não crash', async () => {
    const r = await POST(new NextRequest(new Request('http://x/api/revenuecat-webhook', {
      method: 'POST', body: 'não é json', headers: { authorization: 'segredo-rc' },
    })))
    expect(r.status).toBe(400)
  })
})
