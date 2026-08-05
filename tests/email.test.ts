import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { tokenDescadastro, tokenConfere, linkDescadastro, enviarEmailLembrete } from '../lib/email'

// O token de descadastro é a peça que não pode falhar: se ele rejeitar um link
// legítimo, a pessoa não consegue sair da lista e marca como spam -- e reclamação de
// spam queima o domínio, inclusive a recuperação de senha. Se ele aceitar um link
// forjado, qualquer um descadastra qualquer pessoa.

const SEGREDO = 'segredo-de-teste'

beforeEach(() => { process.env.CRON_SECRET = SEGREDO })
afterEach(() => { vi.restoreAllMocks() })

describe('token de descadastro', () => {
  it('aceita o token que ele mesmo gerou', () => {
    const t = tokenDescadastro('user-1')
    expect(tokenConfere('user-1', t)).toBe(true)
  })

  it('recusa o token de outro usuário', () => {
    const t = tokenDescadastro('user-1')
    expect(tokenConfere('user-2', t)).toBe(false)
  })

  it('recusa token vazio, torto ou de tamanho diferente', () => {
    expect(tokenConfere('user-1', '')).toBe(false)
    expect(tokenConfere('user-1', 'abc')).toBe(false)
    expect(tokenConfere('user-1', tokenDescadastro('user-1') + 'x')).toBe(false)
  })

  it('sem CRON_SECRET não valida nada — fail-closed', () => {
    delete process.env.CRON_SECRET
    expect(tokenDescadastro('user-1')).toBe('')
    expect(tokenConfere('user-1', 'qualquer')).toBe(false)
  })

  it('o link tem o usuário e o token, e aponta para a rota certa', () => {
    const l = linkDescadastro('user-1')
    expect(l).toContain('/api/descadastrar')
    expect(l).toContain('u=user-1')
    expect(l).toContain(`t=${tokenDescadastro('user-1')}`)
  })

  it('escapa user_id com caractere especial na URL', () => {
    expect(linkDescadastro('a b&c=d')).toContain('u=a%20b%26c%3Dd')
  })
})

describe('envio de e-mail', () => {
  it('sem RESEND_API_KEY não tenta enviar', async () => {
    delete process.env.RESEND_API_KEY
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const r = await enviarEmailLembrete({ para: 'a@b.com', userId: 'u1', titulo: 'Oi', corpo: 'Corpo' })
    expect(r.ok).toBe(false)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('recusa e-mail inválido antes de gastar chamada', async () => {
    process.env.RESEND_API_KEY = 're_teste'
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const r = await enviarEmailLembrete({ para: 'sem-arroba', userId: 'u1', titulo: 'Oi', corpo: 'Corpo' })
    expect(r.ok).toBe(false)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('manda html, texto puro e os cabeçalhos de descadastro', async () => {
    process.env.RESEND_API_KEY = 're_teste'
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'abc' }), { status: 200 }) as any
    )
    const r = await enviarEmailLembrete({ para: 'aluno@teste.com', userId: 'u1', titulo: 'Volte', corpo: 'Sua lição espera' })
    expect(r.ok).toBe(true)

    const body = JSON.parse((fetchSpy.mock.calls[0][1] as any).body)
    expect(body.to).toEqual(['aluno@teste.com'])
    expect(body.subject).toBe('Volte')
    expect(body.html).toContain('Volte')
    // Texto puro não é opcional: e-mail só-HTML pontua pior em filtro de spam.
    expect(body.text).toContain('Sua lição espera')
    // O link de saída tem que estar no corpo E no cabeçalho — o botão nativo do
    // Gmail usa o cabeçalho, e é ele que evita o clique em "isso é spam".
    expect(body.html).toContain('/api/descadastrar')
    expect(body.headers['List-Unsubscribe']).toContain('/api/descadastrar')
    expect(body.headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click')
  })

  it('erro do Resend não vira exceção, vira motivo', async () => {
    process.env.RESEND_API_KEY = 're_teste'
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('dominio nao verificado', { status: 403 }) as any)
    const r = await enviarEmailLembrete({ para: 'a@b.com', userId: 'u1', titulo: 'Oi', corpo: 'Corpo' })
    expect(r.ok).toBe(false)
    expect(r.motivo).toContain('403')
  })

  it('queda de rede não derruba o cron', async () => {
    process.env.RESEND_API_KEY = 're_teste'
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('sem rede'))
    const r = await enviarEmailLembrete({ para: 'a@b.com', userId: 'u1', titulo: 'Oi', corpo: 'Corpo' })
    expect(r.ok).toBe(false)
    expect(r.motivo).toContain('sem rede')
  })
})
