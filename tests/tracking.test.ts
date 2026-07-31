import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import crypto from 'crypto'
import { enviarPurchaseMeta } from '../lib/meta-capi'
import { enviarPurchaseGA4 } from '../lib/ga4'

// Protege a medição de conversão (o que o Google/Meta usam pra otimizar a mídia paga):
// fail-closed sem credencial, formato do event_id de deduplicação e hashes exigidos pelo Meta.

describe('enviarPurchaseMeta', () => {
  beforeEach(() => { delete process.env.META_CAPI_TOKEN; delete process.env.META_CAPI_TEST_CODE })
  afterEach(() => vi.restoreAllMocks())

  it('fail-closed: sem META_CAPI_TOKEN não envia nada e não quebra o webhook', async () => {
    const r = await enviarPurchaseMeta({ userId: 'u1', transactionId: 't1', value: 29.9 })
    expect(r.sent).toBe(false)
    expect(r.reason).toMatch(/META_CAPI_TOKEN/)
  })

  it('monta o Purchase com o event_id de dedup igual ao do pixel (vonai-purchase-<tid>)', async () => {
    process.env.META_CAPI_TOKEN = 'tok'
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ events_received: 1 }), { status: 200 }) as any
    )
    const r = await enviarPurchaseMeta({
      userId: 'u1', email: '  Aluno@Email.COM ', transactionId: 'kiwify_u1', value: 29.9,
      fbp: 'fb.1.123.456', fbclid: 'abc', ts: '2026-07-30T12:00:00.000Z',
    })
    expect(r.sent).toBe(true)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('/1582799540142116/events')
    expect(String(url)).toContain('access_token=tok')
    const body = JSON.parse(String(init?.body))
    const ev = body.data[0]
    expect(ev.event_name).toBe('Purchase')
    expect(ev.event_id).toBe('vonai-purchase-kiwify_u1')
    expect(ev.action_source).toBe('website')
    expect(ev.custom_data).toEqual({ value: 29.9, currency: 'BRL' })
    // Meta exige SHA-256 do e-mail normalizado (trim + minúsculas)
    const esperado = crypto.createHash('sha256').update('aluno@email.com').digest('hex')
    expect(ev.user_data.em).toEqual([esperado])
    expect(ev.user_data.fbp).toBe('fb.1.123.456')
    expect(ev.user_data.fbc).toBe(`fb.1.${new Date('2026-07-30T12:00:00.000Z').getTime()}.abc`)
    expect(body.test_event_code).toBeUndefined()
  })

  it('inclui test_event_code só quando META_CAPI_TEST_CODE está setado (validação sem compra real)', async () => {
    process.env.META_CAPI_TOKEN = 'tok'
    process.env.META_CAPI_TEST_CODE = 'TEST123'
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ events_received: 1 }), { status: 200 }) as any
    )
    await enviarPurchaseMeta({ userId: 'u1', transactionId: 't1', value: 29.9 })
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).test_event_code).toBe('TEST123')
  })

  it('erro de rede não derruba o webhook (retorna sent:false)', async () => {
    process.env.META_CAPI_TOKEN = 'tok'
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('rede caiu'))
    const r = await enviarPurchaseMeta({ userId: 'u1', transactionId: 't1', value: 29.9 })
    expect(r.sent).toBe(false)
  })
})

describe('enviarPurchaseGA4', () => {
  beforeEach(() => { delete process.env.GA4_MP_API_SECRET })
  afterEach(() => vi.restoreAllMocks())

  it('fail-closed: sem GA4_MP_API_SECRET não envia e não quebra', async () => {
    const r = await enviarPurchaseGA4({ userId: 'u1', transactionId: 't1', value: 29.9 })
    expect(r.sent).toBe(false)
  })

  it('usa o cid real do navegador quando existe; senão pseudo-cid estável no formato aceito', async () => {
    process.env.GA4_MP_API_SECRET = 's'
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('', { status: 200 }) as any)
    await enviarPurchaseGA4({ userId: 'u1', clientId: '111.222', transactionId: 't1', value: 29.9 })
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body)).client_id).toBe('111.222')

    await enviarPurchaseGA4({ userId: 'u1', transactionId: 't1', value: 29.9 })
    const semCid = JSON.parse(String(fetchMock.mock.calls[1][1]?.body))
    expect(semCid.client_id).toMatch(/^\d+\.\d+$/) // formato "número.número" que o GA4 aceita
    // determinístico: mesmo usuário → mesmo cid (senão o GA4 cria um usuário novo por evento)
    await enviarPurchaseGA4({ userId: 'u1', transactionId: 't2', value: 29.9 })
    expect(JSON.parse(String(fetchMock.mock.calls[2][1]?.body)).client_id).toBe(semCid.client_id)
  })
})
