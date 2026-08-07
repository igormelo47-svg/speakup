// Para onde a conversa com o Vô deve rolar quando chega mensagem nova.
//
// Descer sempre até o fim parece óbvio, mas erra quando a resposta é mais alta que a tela:
// o aluno cai no MEIO do texto e tem que rolar para cima para achar o começo — o mesmo
// problema que estamos consertando, só que pelo outro lado. Então: resposta que cabe, desce
// até o fim; resposta que não cabe, para no topo dela.

export type Quadro = { scrollTop: number; clientHeight: number; scrollHeight: number }
export type Ultima = { topoRelativo: number; altura: number }

// Folga acima da mensagem para ela não encostar na borda do quadro.
export const FOLGA = 12

// Acima disto a mensagem é considerada "não cabe" — 0.8 e não 1.0 porque uma resposta que
// ocupa quase a tela toda já deixa o começo fora de vista depois da folga.
const LIMITE = 0.8

export function alvoDeRolagem(quadro: Quadro, ultima: Ultima | null, pensando: boolean): number {
  // Enquanto o Vô "pensa", o último elemento é o balão de reticências, não uma resposta:
  // aí o certo é sempre o fim, para o aluno ver que ele está respondendo.
  if (pensando || !ultima) return quadro.scrollHeight
  if (ultima.altura <= quadro.clientHeight * LIMITE) return quadro.scrollHeight
  const alvo = quadro.scrollTop + ultima.topoRelativo - FOLGA
  return alvo < 0 ? 0 : alvo
}
