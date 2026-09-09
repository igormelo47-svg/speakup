// Professores (avatares) que o aluno escolhe no onboarding. O Vô continua sendo a
// identidade da marca e o padrão; os outros são vozes diferentes do mesmo TTS (OpenAI
// gpt-4o-mini-tts), para a pessoa OUVIR antes de pagar e escolher com quem quer estudar.
// O id vai em perfil_ia.professor; a voz sai daqui nos dois lados (o cliente manda `voz`,
// /api/tts valida contra esta lista — nunca confia em texto livre).
//
// 09/09/2026 — passou de 4 para 6, e os campos de aparência deixaram de ser só
// `pele`/`cabelo`: os quatro primeiros avatares eram literalmente o MESMO rosto com as
// cores trocadas e duas formas de cabelo (uma "feminina", uma "masculina"), então ninguém
// distinguia um do outro numa grade de 72px. Agora cada professor tem silhueta própria
// (`estilo`) e um traço opcional (óculos, barba) — que é o que de fato lê nesse tamanho.
export type ProfessorId = 'vo' | 'sofia' | 'rafael' | 'helena' | 'bruno' | 'camila'
export type Velocidade = 'lento' | 'normal' | 'rapido'
export type EstiloCabelo = 'longo' | 'curto' | 'bob' | 'cacheado' | 'coque'

export type Professor = {
  id: ProfessorId
  nome: string
  tag: string
  voz: string
  cor: string
  pele: string
  cabelo: string
  estilo: EstiloCabelo
  oculos?: boolean
  barba?: boolean
  desc: string
  tratamento: string
}

export const PROFESSORES: Professor[] = [
  { id: 'vo', nome: 'Vô', tag: 'acolhedor', voz: 'nova', cor: '#2e72d6', pele: '#f1c9a5', cabelo: '#d9d9d9', estilo: 'curto',
    desc: 'Paciente, explica em português, ri dos seus erros com você.', tratamento: 'o Vô' },
  { id: 'sofia', nome: 'Sofia', tag: 'animada', voz: 'shimmer', cor: '#e0457b', pele: '#d9a47c', cabelo: '#2b1a12', estilo: 'longo',
    desc: 'Energia alta, ritmo de conversa de verdade, te puxa pra falar mais.', tratamento: 'a Sofia' },
  { id: 'rafael', nome: 'Rafael', tag: 'direto', voz: 'onyx', cor: '#0f7a37', pele: '#8d5a3c', cabelo: '#1a1a1a', estilo: 'curto', barba: true,
    desc: 'Objetivo, foco em trabalho e reunião, corrige sem rodeio.', tratamento: 'o Rafael' },
  { id: 'helena', nome: 'Helena', tag: 'calma', voz: 'sage', cor: '#7c3aed', pele: '#f5d7c0', cabelo: '#c9822b', estilo: 'bob', oculos: true,
    desc: 'Fala devagar e clara, ideal pra quem trava ou está começando.', tratamento: 'a Helena' },
  { id: 'bruno', nome: 'Bruno', tag: 'descontraído', voz: 'ash', cor: '#0e7490', pele: '#7a4a2b', cabelo: '#14100e', estilo: 'cacheado',
    desc: 'Papo de viagem e do dia a dia, sem formalidade nenhuma.', tratamento: 'o Bruno' },
  { id: 'camila', nome: 'Camila', tag: 'exigente', voz: 'coral', cor: '#b45309', pele: '#e8b98f', cabelo: '#3a2418', estilo: 'coque', oculos: true,
    desc: 'Foco em prova: ENEM, IELTS e TOEFL. Cobra e explica o porquê.', tratamento: 'a Camila' },
]

export const VOZES_PERMITIDAS = new Set(PROFESSORES.map(p => p.voz))

export const VELOCIDADES: Record<Velocidade, { fator: number; rotulo: string; desc: string }> = {
  lento: { fator: 0.85, rotulo: 'Lento', desc: '0,85× · claro e fácil de seguir' },
  normal: { fator: 1.0, rotulo: 'Normal', desc: '1,0× · ritmo natural do dia a dia' },
  rapido: { fator: 1.15, rotulo: 'Rápido', desc: '1,15× · como um falante nativo' },
}

export function professorDe(id: any): Professor {
  return PROFESSORES.find(p => p.id === id) || PROFESSORES[0]
}

export function fatorVelocidade(v: any): number {
  return (VELOCIDADES as any)[v]?.fator ?? 1.0
}
