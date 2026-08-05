import { describe, it, expect } from 'vitest'
import { PERGUNTAS, classificar, respostaCerta } from '../lib/teste-nivel'

// O gabarito escrito à mão. Se alguém editar as alternativas de uma pergunta e
// esquecer de mexer no índice `certa`, é aqui que quebra — e não na cara do aluno,
// que receberia um nível errado sem ter como desconfiar.
const GABARITO = [
  'She', 'drink', 'went', 'any', 'will stay', 'since',
  'waking', 'had already started', 'would have acted', "didn't say",
  'had he sat', 'did he know',
]

describe('perguntas do teste de nível', () => {
  it('tem 12 perguntas', () => {
    expect(PERGUNTAS).toHaveLength(12)
  })

  it('a alternativa marcada como certa é a do gabarito', () => {
    expect(PERGUNTAS.map(respostaCerta)).toEqual(GABARITO)
  })

  it('toda pergunta tem 3 alternativas e o índice certo aponta para dentro delas', () => {
    for (const p of PERGUNTAS) {
      expect(p.opcoes).toHaveLength(3)
      expect(p.certa).toBeGreaterThanOrEqual(0)
      expect(p.certa).toBeLessThan(p.opcoes.length)
    }
  })

  it('não repete alternativa dentro da mesma pergunta', () => {
    for (const p of PERGUNTAS) {
      expect(new Set(p.opcoes).size).toBe(p.opcoes.length)
    }
  })

  it('toda pergunta tem a lacuna para preencher e uma explicação', () => {
    for (const p of PERGUNTAS) {
      expect(p.frase).toContain('___')
      expect(p.porque.length).toBeGreaterThan(20)
    }
  })

  it('a dificuldade só sobe, nunca desce', () => {
    const ordem = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    const posicoes = PERGUNTAS.map(p => ordem.indexOf(p.nivel))
    expect(posicoes.every(i => i >= 0)).toBe(true)
    for (let i = 1; i < posicoes.length; i++) {
      expect(posicoes[i]).toBeGreaterThanOrEqual(posicoes[i - 1])
    }
  })
})

describe('classificar', () => {
  it('mapeia cada faixa de acertos para o nível esperado', () => {
    const esperado: Array<[number, string]> = [
      [0, 'A1'], [1, 'A1'], [2, 'A1'],
      [3, 'A2'], [4, 'A2'],
      [5, 'B1'], [6, 'B1'],
      [7, 'B2'], [8, 'B2'],
      [9, 'C1'], [10, 'C1'],
      [11, 'C2'], [12, 'C2'],
    ]
    for (const [acertos, nivel] of esperado) {
      expect(classificar(acertos).nivel).toBe(nivel)
    }
  })

  it('cobre todas as pontuações possíveis com texto preenchido', () => {
    for (let a = 0; a <= PERGUNTAS.length; a++) {
      const r = classificar(a)
      expect(r.nivel).toMatch(/^[ABC][12]$/)
      expect(r.titulo).not.toBe('')
      expect(r.texto.length).toBeGreaterThan(50)
      expect(r.proximo.length).toBeGreaterThan(20)
    }
  })

  it('nunca desce de nível quando o aluno acerta mais', () => {
    const ordem = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    let anterior = -1
    for (let a = 0; a <= PERGUNTAS.length; a++) {
      const atual = ordem.indexOf(classificar(a).nivel)
      expect(atual).toBeGreaterThanOrEqual(anterior)
      anterior = atual
    }
  })
})
