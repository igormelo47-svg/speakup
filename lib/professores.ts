// Professores (avatares) que o aluno escolhe no onboarding — inspirado na Lucida, adaptado:
// o Vô continua sendo a identidade da marca e o padrão; os outros três são vozes diferentes
// do mesmo TTS (OpenAI gpt-4o-mini-tts), para a pessoa OUVIR antes de pagar e escolher com
// quem quer estudar. O id vai em perfil_ia.professor; a voz sai daqui nos dois lados
// (cliente manda `voz`, /api/tts valida contra esta lista — nunca confia no texto livre).
export type ProfessorId = 'vo' | 'sofia' | 'rafael' | 'helena'
export type Velocidade = 'lento' | 'normal' | 'rapido'

export const PROFESSORES: { id: ProfessorId; nome: string; tag: string; voz: string; cor: string; pele: string; cabelo: string; desc: string; tratamento: string }[] = [
  { id: 'vo', nome: 'Vô', tag: 'acolhedor', voz: 'nova', cor: '#2e72d6', pele: '#f1c9a5', cabelo: '#d9d9d9', desc: 'Paciente, explica em português, ri dos seus erros com você.', tratamento: 'o Vô' },
  { id: 'sofia', nome: 'Sofia', tag: 'animada', voz: 'shimmer', cor: '#e0457b', pele: '#d9a47c', cabelo: '#2b1a12', desc: 'Energia alta, ritmo de conversa de verdade, te puxa pra falar mais.', tratamento: 'a Sofia' },
  { id: 'rafael', nome: 'Rafael', tag: 'direto', voz: 'onyx', cor: '#0f7a37', pele: '#8d5a3c', cabelo: '#1a1a1a', desc: 'Objetivo, foco em trabalho e entrevista, corrige sem rodeio.', tratamento: 'o Rafael' },
  { id: 'helena', nome: 'Helena', tag: 'calma', voz: 'sage', cor: '#7c3aed', pele: '#f5d7c0', cabelo: '#c9822b', desc: 'Fala devagar e clara, ideal pra quem trava ou está começando.', tratamento: 'a Helena' },
]

export const VOZES_PERMITIDAS = new Set(PROFESSORES.map(p => p.voz))

export const VELOCIDADES: Record<Velocidade, { fator: number; rotulo: string; desc: string }> = {
  lento: { fator: 0.85, rotulo: 'Lento', desc: '0,85× · claro e fácil de seguir' },
  normal: { fator: 1.0, rotulo: 'Normal', desc: '1,0× · ritmo natural do dia a dia' },
  rapido: { fator: 1.15, rotulo: 'Rápido', desc: '1,15× · como um falante nativo' },
}

export function professorDe(id: any) {
  return PROFESSORES.find(p => p.id === id) || PROFESSORES[0]
}

export function fatorVelocidade(v: any): number {
  return (VELOCIDADES as any)[v]?.fator ?? 1.0
}
