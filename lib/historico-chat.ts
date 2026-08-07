// Monta o histórico que vai para a IA no chat do professor.
//
// Antes disto o app mandava SÓ a última mensagem: o Vô não via nada do que tinha acabado
// de ensinar, então "e no passado?" ou "explica o resto" chegavam sem contexto e ele
// respondia do zero. A conversa nunca andava, e o convite "quer que eu explique o resto?"
// era uma promessa que ele não conseguia cumprir.
//
// Três cuidados, todos por motivo concreto:
//  - A API da Anthropic EXIGE que a lista comece com role "user". Se o corte por tamanho
//    deixar uma resposta do Vô na frente, a chamada falha inteira.
//  - Mensagens que o próprio app escreve (erro de conexão, aviso de limite) não são fala
//    do professor e só poluem o contexto.
//  - Cada caractere aqui é token pago em toda mensagem seguinte, daí o teto duplo.

export type MsgHist = { role: string; text: string; local?: boolean }
export type MsgIA = { role: 'user' | 'assistant'; content: string }

// 12 turnos ≈ 6 idas e voltas: cobre o assunto atual sem carregar a conversa inteira.
export const MAX_TURNOS = 12
// Folga grande sobre o teto de 20.000 do servidor (app/api/chat/route.ts).
export const MAX_CHARS = 12000

export function historicoParaIA(msgs: MsgHist[], nova: string, maxTurnos = MAX_TURNOS, maxChars = MAX_CHARS): MsgIA[] {
  const anteriores: MsgIA[] = (msgs || [])
    .filter(m => !m.local && m.text && m.text.trim())
    .map(m => ({ role: m.role === 'ai' ? 'assistant' as const : 'user' as const, content: m.text }))

  let lista: MsgIA[] = [...anteriores, { role: 'user', content: nova }]
  if (lista.length > maxTurnos) lista = lista.slice(-maxTurnos)

  // Corta pelo começo enquanto passar do teto — a mensagem nova nunca sai.
  const tamanho = (l: MsgIA[]) => l.reduce((a, m) => a + m.content.length, 0)
  while (lista.length > 1 && tamanho(lista) > maxChars) lista = lista.slice(1)

  // Depois de cortar, a lista pode começar com o Vô falando. A API recusa isso.
  while (lista.length > 1 && lista[0].role === 'assistant') lista = lista.slice(1)

  return lista
}
