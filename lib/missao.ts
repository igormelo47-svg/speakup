// Missão do dia: UMA atividade concreta por data, determinística — o app mostra a de
// amanhã ("volte pra destravar") e o e-mail de lembrete cobra a de hoje. Os dois lados
// calculam da mesma data e chegam na MESMA missão; se divergissem, o e-mail prometeria
// uma coisa e o app entregaria outra, e a confiança morre na segunda vez.
//
// Por que existe: o funil mostrou que o aluno termina o 1º dia e não volta (~4 voltaram
// de 51). O fim da sessão terminava em nada; a missão é o gancho de amanhã.

export type Missao = {
  emoji: string
  titulo: string
  // O que dizer no convite (app e e-mail usam o mesmo texto).
  chamada: string
  // Aba do app que cumpre a missão — o botão do card leva direto pra ela.
  aba: 'professor' | 'simular' | 'trilha' | 'listening'
}

// Pool fixo. A ordem importa: dias consecutivos caem em missões consecutivas, então
// vizinhos no array devem variar de tipo — dois dias seguidos de simulador cansam.
const MISSOES: Missao[] = [
  { emoji: '💬', titulo: 'Conversa de 5 min: sua rotina', chamada: 'Conte pro Vô como foi seu dia — em inglês. Ele corrige na hora.', aba: 'professor' },
  { emoji: '🍔', titulo: 'Simulador: pedir comida', chamada: 'Peça o jantar em inglês sem travar. O garçom é IA, errar é grátis.', aba: 'simular' },
  { emoji: '📖', titulo: 'Uma lição da sua trilha', chamada: 'A próxima lição destrava seu progresso de hoje. Leva menos de 5 minutos.', aba: 'trilha' },
  { emoji: '🎧', titulo: 'Listening do dia', chamada: 'Um áudio novo, no seu nível. Entenda inglês falado de verdade.', aba: 'listening' },
  { emoji: '✈️', titulo: 'Simulador: no aeroporto', chamada: 'Check-in, portão, imigração — resolva tudo em inglês antes da viagem real.', aba: 'simular' },
  { emoji: '💬', titulo: 'Conversa de 5 min: seus planos', chamada: 'Conte pro Vô o que você quer fazer no fim de semana — futuro em inglês, na prática.', aba: 'professor' },
  { emoji: '📖', titulo: 'Uma lição da sua trilha', chamada: 'Cinco minutos de lição e a sequência continua viva.', aba: 'trilha' },
  { emoji: '💼', titulo: 'Simulador: entrevista de emprego', chamada: 'Treine a pergunta "tell me about yourself" antes que ela apareça de verdade.', aba: 'simular' },
  { emoji: '💬', titulo: 'Conversa de 5 min: filmes e séries', chamada: 'Fale do último filme que você viu. O Vô lembra do que você errar.', aba: 'professor' },
  // Fecha o ciclo com listening: o pool dá a volta para o índice 0 (conversa), e dois
  // dias seguidos do mesmo tipo na virada cansam — foi exatamente o bug do 1º rascunho.
  { emoji: '🎧', titulo: 'Listening do dia', chamada: 'Ouça, responda e confira — áudio novo todos os dias.', aba: 'listening' },
]

// Data → índice estável. Dias consecutivos andam 1 casa no pool (variedade garantida);
// o módulo primo com o tamanho evita ciclos curtos se o pool crescer.
export function missaoDoDia(dataISO: string): Missao {
  const [ano, mes, dia] = dataISO.slice(0, 10).split('-').map(Number)
  const serial = ano * 372 + (mes - 1) * 31 + (dia - 1) // monotônico por dia, sem Date/fuso
  return MISSOES[serial % MISSOES.length]
}

// "Amanhã" a partir de um YYYY-MM-DD sem depender de fuso do aparelho.
export function diaSeguinte(dataISO: string): string {
  const d = new Date(dataISO.slice(0, 10) + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

// Recompensa do desafio de 3 dias (streak 3): pagamento único, em moedas.
export const DESAFIO_3_DIAS_MOEDAS = 50
