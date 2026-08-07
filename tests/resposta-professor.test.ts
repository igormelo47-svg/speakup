import { describe, it, expect } from 'vitest'
import { lerResposta } from '../lib/resposta-professor'

describe('lerResposta', () => {
  it('separa texto, correção e sugestões de uma resposta completa', () => {
    const r = lerResposta('<corr>I have 34 years ~ I am 34 years old ~ idade usa o verbo to be</corr>Boa tentativa! Diga <en>I am 34 years old</en>.<sug>Me dá um exemplo | E no passado? | Quero um exercício</sug>')
    expect(r.correcao).toEqual({ errado: 'I have 34 years', certo: 'I am 34 years old', porque: 'idade usa o verbo to be' })
    expect(r.sugestoes).toEqual(['Me dá um exemplo', 'E no passado?', 'Quero um exercício'])
    expect(r.texto).toBe('Boa tentativa! Diga <en>I am 34 years old</en>.')
  })

  it('preserva as marcações de inglês, que são lidas depois', () => {
    const r = lerResposta('Use <en>I have</en> e não <en>I has</en>.<sug>ok</sug>')
    expect(r.texto).toContain('<en>I have</en>')
  })

  it('funciona sem correção — a maioria das respostas não tem', () => {
    const r = lerResposta('Present perfect liga passado e presente.<sug>Me dá um exemplo</sug>')
    expect(r.correcao).toBeNull()
    expect(r.sugestoes).toEqual(['Me dá um exemplo'])
    expect(r.texto).toBe('Present perfect liga passado e presente.')
  })

  it('funciona sem sugestão nenhuma — o modelo às vezes esquece', () => {
    const r = lerResposta('Só um texto simples.')
    expect(r.sugestoes).toEqual([])
    expect(r.correcao).toBeNull()
    expect(r.texto).toBe('Só um texto simples.')
  })

  it('aceita correção sem o motivo', () => {
    const r = lerResposta('<corr>I has ~ I have</corr>Corrigido.')
    expect(r.correcao).toEqual({ errado: 'I has', certo: 'I have', porque: '' })
  })

  it('descarta correção quebrada em vez de mostrar cartão pela metade', () => {
    const r = lerResposta('<corr>só uma parte</corr>Texto.')
    expect(r.correcao).toBeNull()
    expect(r.texto).toBe('Texto.')
  })

  it('nunca deixa tag crua na tela, mesmo sem fechar', () => {
    const r = lerResposta('Texto solto <sug>a | b')
    expect(r.texto).not.toContain('<sug')
    expect(r.texto).toBe('Texto solto a | b')
  })

  it('corta em três sugestões mesmo se o modelo mandar mais', () => {
    const r = lerResposta('Oi<sug>a | b | c | d | e</sug>')
    expect(r.sugestoes).toEqual(['a', 'b', 'c'])
  })

  it('ignora sugestões vazias entre as barras', () => {
    expect(lerResposta('Oi<sug>a |  | b</sug>').sugestoes).toEqual(['a', 'b'])
  })

  it('aguenta resposta vazia sem quebrar', () => {
    expect(lerResposta('')).toEqual({ texto: '', correcao: null, sugestoes: [] })
  })

  it('com dois erros o modelo manda dois <corr>: mostra o primeiro e NÃO vaza o segundo', () => {
    // Aconteceu de verdade contra a API: "I have 25 years and I go to the beach yesterday".
    const r = lerResposta('<corr>I have 25 years ~ I am 25 years old ~ idade usa to be</corr><corr>I go ~ I went ~ passado precisa de went</corr>Então fica: <en>I am 25 years old</en>.<sug>a | b</sug>')
    expect(r.correcao).toEqual({ errado: 'I have 25 years', certo: 'I am 25 years old', porque: 'idade usa to be' })
    expect(r.texto).toBe('Então fica: <en>I am 25 years old</en>.')
    expect(r.texto).not.toContain('~')
  })

  it('idem para dois blocos de sugestão', () => {
    const r = lerResposta('Oi<sug>a | b</sug><sug>c | d</sug>')
    expect(r.sugestoes).toEqual(['a', 'b'])
    expect(r.texto).toBe('Oi')
  })

  it('não deixa buraco de linhas em branco onde as tags estavam', () => {
    const r = lerResposta('<corr>a ~ b ~ c</corr>\n\n\n\nTexto.\n\n\n<sug>x</sug>')
    expect(r.texto).toBe('Texto.')
  })
})
