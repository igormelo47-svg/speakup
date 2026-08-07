import { describe, it, expect } from 'vitest'
import { alvoDeRolagem, FOLGA } from '../lib/rolagem-chat'

// Quadro de 500px de altura visível, com 1200px de conteúdo, atualmente rolado em 300px.
const quadro = { scrollTop: 300, clientHeight: 500, scrollHeight: 1200 }

describe('alvoDeRolagem', () => {
  it('desce até o fim quando a resposta cabe na tela', () => {
    expect(alvoDeRolagem(quadro, { topoRelativo: 380, altura: 90 }, false)).toBe(1200)
  })

  it('para no começo da resposta quando ela é mais alta que a tela', () => {
    // topo da mensagem a 380px do topo do quadro → 300 + 380 - 12
    expect(alvoDeRolagem(quadro, { topoRelativo: 380, altura: 700 }, false)).toBe(300 + 380 - FOLGA)
  })

  it('desce até o fim enquanto o Vô está pensando, mesmo com resposta alta atrás', () => {
    // O último elemento na tela é o balão de reticências: o aluno precisa ver que ele responde.
    expect(alvoDeRolagem(quadro, { topoRelativo: 380, altura: 700 }, true)).toBe(1200)
  })

  it('desce até o fim quando ainda não há mensagem nenhuma', () => {
    expect(alvoDeRolagem(quadro, null, false)).toBe(1200)
  })

  it('nunca devolve alvo negativo', () => {
    // Mensagem alta que já começa acima da área visível.
    expect(alvoDeRolagem({ scrollTop: 0, clientHeight: 500, scrollHeight: 1200 }, { topoRelativo: 5, altura: 700 }, false)).toBe(0)
  })

  it('trata a resposta exatamente no limite como cabendo (desce até o fim)', () => {
    // 0.8 de 500 = 400
    expect(alvoDeRolagem(quadro, { topoRelativo: 380, altura: 400 }, false)).toBe(1200)
    expect(alvoDeRolagem(quadro, { topoRelativo: 380, altura: 401 }, false)).toBe(300 + 380 - FOLGA)
  })
})
