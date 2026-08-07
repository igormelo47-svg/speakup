import { describe, it, expect } from 'vitest'
import { historicoParaIA } from '../lib/historico-chat'

describe('historicoParaIA', () => {
  it('manda a conversa inteira, não só a última mensagem', () => {
    const r = historicoParaIA([
      { role: 'user', text: 'Como falo minha idade?' },
      { role: 'ai', text: 'Diga <en>I am 34 years old</en>.' },
    ], 'E no passado?')
    expect(r).toEqual([
      { role: 'user', content: 'Como falo minha idade?' },
      { role: 'assistant', content: 'Diga <en>I am 34 years old</en>.' },
      { role: 'user', content: 'E no passado?' },
    ])
  })

  it('descarta o que o próprio app escreveu (saudação, erro, aviso de limite)', () => {
    const r = historicoParaIA([
      { role: 'ai', text: 'Olá! Sou seu professor.', local: true },
      { role: 'user', text: 'oi' },
      { role: 'ai', text: 'Erro de conexão.', local: true },
    ], 'tudo bem?')
    expect(r).toEqual([
      { role: 'user', content: 'oi' },
      { role: 'user', content: 'tudo bem?' },
    ])
  })

  it('corta pelos turnos mais antigos quando a conversa fica longa', () => {
    const msgs = Array.from({ length: 30 }, (_, i) => ({ role: i % 2 ? 'ai' : 'user', text: `m${i}` }))
    const r = historicoParaIA(msgs, 'nova', 6)
    // Pode sobrar 5 e não 6: se o corte cair numa fala do Vô, ela é removida.
    expect(r.length).toBeLessThanOrEqual(6)
    expect(r.length).toBeGreaterThanOrEqual(5)
    expect(r[0].role).toBe('user')
    expect(r[r.length - 1]).toEqual({ role: 'user', content: 'nova' })
  })

  it('NUNCA começa com o Vô falando — a API da Anthropic recusa', () => {
    // Corte por turnos par deixaria um 'assistant' na frente.
    const msgs = [
      { role: 'user', text: 'a' }, { role: 'ai', text: 'b' },
      { role: 'user', text: 'c' }, { role: 'ai', text: 'd' },
    ]
    const r = historicoParaIA(msgs, 'e', 3)
    expect(r[0].role).toBe('user')
  })

  it('corta por tamanho e ainda assim mantém a mensagem nova', () => {
    const grande = 'x'.repeat(5000)
    const msgs = [
      { role: 'user', text: grande }, { role: 'ai', text: grande },
      { role: 'user', text: grande }, { role: 'ai', text: grande },
    ]
    const r = historicoParaIA(msgs, 'pergunta nova', 12, 6000)
    expect(r[r.length - 1]).toEqual({ role: 'user', content: 'pergunta nova' })
    expect(r.reduce((a, m) => a + m.content.length, 0)).toBeLessThanOrEqual(6000)
    expect(r[0].role).toBe('user')
  })

  it('conversa nova manda só a pergunta', () => {
    expect(historicoParaIA([], 'primeira')).toEqual([{ role: 'user', content: 'primeira' }])
  })

  it('ignora mensagens vazias ou só com espaço', () => {
    const r = historicoParaIA([{ role: 'user', text: '   ' }, { role: 'ai', text: '' }], 'oi')
    expect(r).toEqual([{ role: 'user', content: 'oi' }])
  })

  it('aguenta lista indefinida sem quebrar', () => {
    expect(historicoParaIA(undefined as never, 'oi')).toEqual([{ role: 'user', content: 'oi' }])
  })
})
