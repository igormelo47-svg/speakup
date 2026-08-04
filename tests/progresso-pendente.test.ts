import { describe, it, expect } from 'vitest'
import { mesclarPendente, sobrasAposEnvio } from '../lib/progresso-pendente'

// Estes testes protegem o PROGRESSO DO ALUNO. Se algo aqui quebrar, ele conclui a lição,
// vê o XP subir na tela e perde tudo quando volta no dia seguinte — e não volta de novo.

describe('mesclarPendente', () => {
  it('mantém o valor mais novo de cada campo', () => {
    expect(mesclarPendente({ xp: 100 }, { xp: 150 })).toEqual({ xp: 150 })
  })

  it('não apaga campo antigo que não veio na gravação nova', () => {
    // Gravação só de moedas não pode fazer o XP pendente sumir.
    expect(mesclarPendente({ xp: 100, streak: 3 }, { moedas: 20 }))
      .toEqual({ xp: 100, streak: 3, moedas: 20 })
  })

  it('funciona quando ainda não havia nada pendente', () => {
    expect(mesclarPendente(null, { xp: 10 })).toEqual({ xp: 10 })
  })

  it('preserva a lista de lições concluídas', () => {
    const antes = { licoes_concluidas: ['Verbo to be'] }
    const depois = { licoes_concluidas: ['Verbo to be', 'Present Simple'] }
    expect(mesclarPendente(antes, depois).licoes_concluidas).toHaveLength(2)
  })
})

describe('sobrasAposEnvio', () => {
  it('esvazia a fila quando nada mudou durante o envio', () => {
    expect(sobrasAposEnvio({ xp: 100 }, { xp: 100 })).toEqual({})
  })

  it('NÃO descarta progresso que entrou na fila durante o envio', () => {
    // O caso que motivou tudo: enviamos xp 100; enquanto a resposta vinha, o aluno
    // concluiu outra lição (xp 150) que também falhou. Apagar a fila perderia esse 150.
    expect(sobrasAposEnvio({ xp: 150 }, { xp: 100 })).toEqual({ xp: 150 })
  })

  it('mantém campo novo que não fazia parte do envio', () => {
    expect(sobrasAposEnvio({ xp: 100, moedas: 30 }, { xp: 100 })).toEqual({ moedas: 30 })
  })

  it('compara por valor, não por referência (arrays e objetos)', () => {
    const enviado = { licoes_concluidas: ['A', 'B'] }
    const fila = { licoes_concluidas: ['A', 'B'] } // mesma lista, outro array
    expect(sobrasAposEnvio(fila, enviado)).toEqual({})
  })

  it('mantém a lista quando ela cresceu durante o envio', () => {
    const enviado = { licoes_concluidas: ['A'] }
    const fila = { licoes_concluidas: ['A', 'B'] }
    expect(sobrasAposEnvio(fila, enviado)).toEqual({ licoes_concluidas: ['A', 'B'] })
  })

  it('lida com fila vazia sem quebrar', () => {
    expect(sobrasAposEnvio(null, { xp: 100 })).toEqual({})
  })
})
