import { describe, it, expect } from 'vitest'
import { VALOR, MOEDA } from '../lib/valor-eventos'

// A escada de valor é a coisa mais fácil de quebrar sem ninguém perceber: basta alguém
// achar que "cadastro vale mais" e mexer num número. O erro não aparece na tela, aparece
// três semanas depois numa conta de anúncio comprando o público errado. Por isso a ORDEM
// dos degraus é teste, e não convenção.

describe('escada de valor das conversões', () => {
  const escada = [
    ['cadastro', VALOR.cadastro],
    ['inicioTeste', VALOR.inicioTeste],
    ['ativacao', VALOR.ativacao],
    ['retencaoD2', VALOR.retencaoD2],
    ['retencaoD7', VALOR.retencaoD7],
    ['assinaturaMensal', VALOR.assinaturaMensal],
  ] as const

  it('cada degrau vale mais que o anterior', () => {
    for (let i = 1; i < escada.length; i++) {
      const [nomeAnterior, anterior] = escada[i - 1]
      const [nomeAtual, atual] = escada[i]
      expect(atual, `${nomeAtual} tem que valer mais que ${nomeAnterior}`).toBeGreaterThan(anterior)
    }
  })

  it('nenhum degrau intermediário chega ao preço de uma assinatura', () => {
    // Era exatamente esse o bug de origem: inicio_teste ia com 29,90, igual a uma venda.
    for (const [nome, valor] of escada.slice(0, 5)) {
      expect(valor, `${nome} não pode valer uma mensalidade`).toBeLessThan(VALOR.assinaturaMensal)
    }
  })

  it('o anual vale mais que o mensal nos dois canais', () => {
    expect(VALOR.assinaturaAnual).toBeGreaterThan(VALOR.assinaturaMensal)
    expect(VALOR.assinaturaAnualIOS).toBeGreaterThan(VALOR.assinaturaMensal)
  })

  it('os preços de assinatura batem com o que o app cobra', () => {
    // Se mudar o preço no app, muda aqui — senão o Google passa a receber receita errada.
    expect(VALOR.assinaturaMensal).toBe(29.9)
    expect(VALOR.assinaturaAnual).toBe(289.8)
    expect(VALOR.assinaturaAnualIOS).toBe(289.9)
  })

  it('todo valor é positivo e a moeda é BRL', () => {
    for (const v of Object.values(VALOR)) expect(v).toBeGreaterThan(0)
    expect(MOEDA).toBe('BRL')
  })

  it('voltar no 2º dia vale bem mais que só criar conta', () => {
    // A proporção é o que o algoritmo lê. Se ficarem perto demais, o sinal some.
    expect(VALOR.retencaoD2 / VALOR.inicioTeste).toBeGreaterThanOrEqual(3)
  })
})
