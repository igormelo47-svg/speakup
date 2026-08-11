import { describe, it, expect } from 'vitest'
import { missaoDoDia, missaoPara, diaSeguinte, DESAFIO_3_DIAS_MOEDAS } from '../lib/missao'

// A missão é a MESMA promessa em dois lugares: o card do app ("volte amanhã pra X") e o
// e-mail do dia seguinte ("sua missão de hoje é X"). Estes testes travam o contrato que
// faz os dois baterem: determinismo por data e variedade entre dias vizinhos.

describe('missão do dia', () => {
  it('é determinística: mesma data, mesma missão', () => {
    expect(missaoDoDia('2026-08-11')).toEqual(missaoDoDia('2026-08-11'))
    expect(missaoDoDia('2026-08-11T23:59:00Z')).toEqual(missaoDoDia('2026-08-11'))
  })

  it('dias consecutivos têm missões diferentes — e de TIPO diferente', () => {
    // Varre um ciclo inteiro do pool (inclusive a virada, onde o 1º rascunho repetia
    // duas conversas seguidas): dois dias seguidos nunca caem na mesma aba.
    let dia = '2026-08-01'
    for (let i = 0; i < 14; i++) {
      const prox = diaSeguinte(dia)
      expect(missaoDoDia(prox).titulo, `${dia} -> ${prox}`).not.toBe(missaoDoDia(dia).titulo)
      expect(missaoDoDia(prox).aba, `${dia} -> ${prox} repetiu o tipo`).not.toBe(missaoDoDia(dia).aba)
      dia = prox
    }
  })

  it('toda missão tem os campos que o card e o e-mail usam', () => {
    let dia = '2026-01-01'
    for (let i = 0; i < 30; i++) {
      const m = missaoDoDia(dia)
      expect(m.titulo.length).toBeGreaterThan(5)
      expect(m.chamada.length).toBeGreaterThan(10)
      expect(['professor', 'simular', 'trilha', 'listening']).toContain(m.aba)
      dia = diaSeguinte(dia)
    }
  })

  it('diaSeguinte cruza mês e ano sem depender de fuso', () => {
    expect(diaSeguinte('2026-08-31')).toBe('2026-09-01')
    expect(diaSeguinte('2026-12-31')).toBe('2027-01-01')
    expect(diaSeguinte('2028-02-28')).toBe('2028-02-29') // bissexto
  })

  it('o desafio paga um valor que existe e é positivo', () => {
    expect(DESAFIO_3_DIAS_MOEDAS).toBeGreaterThan(0)
  })
})

describe('missão personalizada pelos erros', () => {
  it('com erro registrado, a missão treina o erro MAIS RECENTE e se declara personalizada', () => {
    const m = missaoPara(['present perfect', 'since vs for'], '2026-08-11')
    expect(m.personalizada).toBe(true)
    expect(m.titulo).toContain('since vs for')
    expect(m.chamada).toContain('since vs for')
    expect(m.aba).toBe('professor')
  })

  it('sem erro registrado, cai no pool genérico do dia — nunca quebra', () => {
    expect(missaoPara([], '2026-08-11')).toEqual(missaoDoDia('2026-08-11'))
    expect(missaoPara(undefined, '2026-08-11')).toEqual(missaoDoDia('2026-08-11'))
    // jsonb do banco pode vir com qualquer lixo: número, objeto, lista mista
    expect(missaoPara('nao-e-lista', '2026-08-11')).toEqual(missaoDoDia('2026-08-11'))
    expect(missaoPara([42, {}, '  '], '2026-08-11')).toEqual(missaoDoDia('2026-08-11'))
  })

  it('erro gigante é cortado para caber em card e assunto de e-mail', () => {
    const m = missaoPara(['x'.repeat(300)], '2026-08-11')
    expect(m.titulo.length).toBeLessThan(80)
  })
})
