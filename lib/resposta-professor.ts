// Formato de resposta do Vô (modo "professor").
//
// O modelo devolve texto puro com três marcações, e o app transforma cada uma numa peça
// de interface. É o mesmo truque do <en>: custa ZERO chamada extra de API, que importa
// porque cada mensagem do professor já é uma chamada paga.
//
//   <en>…</en>                       inglês, pintado de azul e tocável para treinar pronúncia
//   <corr>errado ~ certo ~ porquê</corr>   cartão de correção quando o aluno erra
//   <sug>a | b | c</sug>             o que o aluno pode dizer em seguida, em botões
//
// O <sug> existe por causa do "problema do campo vazio": uma caixa de texto em branco
// esconde o que a ferramenta sabe fazer, e o aluno que não sabe o que perguntar
// simplesmente fecha o app. Dar três continuações prontas é o que mantém a conversa viva.
//
// Tolerante de propósito: se o modelo esquecer uma marcação, a resposta continua
// funcionando sem aquela peça. O que NUNCA pode acontecer é tag crua aparecer na tela.

export type Correcao = { errado: string; certo: string; porque: string }
export type RespostaProfessor = { texto: string; correcao: Correcao | null; sugestoes: string[] }

// Global de propósito: com dois erros na mesma frase o modelo emite DOIS <corr>, e um
// match só deixava o segundo vazar cru na tela ("errado ~ certo ~ motivo" com tis à vista).
// Mostramos o primeiro cartão, mas removemos todos.
const CORR = /<corr>([\s\S]*?)<\/corr>/gi
const SUG = /<sug>([\s\S]*?)<\/sug>/gi
// Restos de marcação (inclusive tag aberta e nunca fechada) que não podem vazar para a tela.
const SOBRAS = /<\/?(corr|sug)>/gi

export const MAX_SUGESTOES = 3

export function lerResposta(bruto: string): RespostaProfessor {
  let texto = bruto || ''

  let correcao: Correcao | null = null
  for (const m of texto.matchAll(new RegExp(CORR))) {
    const partes = m[1].split('~').map(s => s.trim()).filter(Boolean)
    // Sem "errado" e "certo" o cartão não diz nada — melhor não mostrar cartão nenhum.
    if (!correcao && partes.length >= 2) correcao = { errado: partes[0], certo: partes[1], porque: partes[2] || '' }
  }
  texto = texto.replace(new RegExp(CORR), '')

  let sugestoes: string[] = []
  for (const m of texto.matchAll(new RegExp(SUG))) {
    if (!sugestoes.length) sugestoes = m[1].split('|').map(s => s.trim()).filter(Boolean).slice(0, MAX_SUGESTOES)
  }
  texto = texto.replace(new RegExp(SUG), '')

  texto = texto.replace(SOBRAS, '').replace(/\n{3,}/g, '\n\n').trim()
  return { texto, correcao, sugestoes }
}
