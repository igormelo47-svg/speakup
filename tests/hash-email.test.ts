import { describe, it, expect } from 'vitest'
import { normalizarEmail, sha256Hex, dadosUsuarioParaAds } from '../lib/hash-email'

// A normalização é o que faz a correspondência funcionar: se o resumo sair diferente do
// que o Google calcula do lado dele, a conversão otimizada simplesmente não casa — e o
// erro é silencioso, ninguém avisa que está errado.

describe('normalizarEmail', () => {
  it('põe em minúsculas e tira espaços das pontas', () => {
    expect(normalizarEmail('  Igor@Exemplo.COM  ')).toBe('igor@exemplo.com')
  })

  it('remove os pontos do Gmail (o provedor ignora)', () => {
    expect(normalizarEmail('i.g.o.r@gmail.com')).toBe('igor@gmail.com')
  })

  it('trata googlemail.com como gmail.com', () => {
    expect(normalizarEmail('igor@googlemail.com')).toBe('igor@gmail.com')
  })

  it('NÃO remove pontos de outros provedores', () => {
    // Em domínios que não são do Google, o ponto faz parte do endereço.
    expect(normalizarEmail('igor.melo@hotmail.com')).toBe('igor.melo@hotmail.com')
  })

  it('devolve vazio para entrada inválida', () => {
    expect(normalizarEmail('sem-arroba')).toBe('')
    expect(normalizarEmail('')).toBe('')
    expect(normalizarEmail('@dominio.com')).toBe('')
    expect(normalizarEmail('local@')).toBe('')
  })
})

describe('sha256Hex', () => {
  it('gera o resumo conhecido de uma string de teste', async () => {
    // Valor público do SHA-256 de "abc" — se a implementação mudar, isso quebra.
    expect(await sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    )
  })

  it('produz 64 caracteres hexadecimais', async () => {
    const h = await sha256Hex('igor@exemplo.com')
    expect(h).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe('dadosUsuarioParaAds', () => {
  it('devolve o e-mail já normalizado e criptografado', async () => {
    const a = await dadosUsuarioParaAds('  I.G.O.R@Gmail.com ')
    const esperado = await sha256Hex('igor@gmail.com')
    expect(a).toEqual({ sha256_email_address: esperado })
  })

  it('devolve null quando o e-mail não presta', async () => {
    expect(await dadosUsuarioParaAds('qualquer coisa')).toBeNull()
    expect(await dadosUsuarioParaAds('')).toBeNull()
  })

  it('nunca devolve o e-mail em texto puro', async () => {
    const a = await dadosUsuarioParaAds('igor@exemplo.com')
    expect(JSON.stringify(a)).not.toContain('igor@exemplo.com')
    expect(JSON.stringify(a)).not.toContain('@')
  })
})
