'use client'

import { useState, useEffect, useMemo, type Dispatch, type SetStateAction, type CSSProperties, type ReactElement } from 'react'

interface ListeningExample { en: string; pt: string; id: string }
interface ListeningQuestion { answer: ListeningExample; options: string[]; correctOption: string }
interface Lesson { title: string; sub: string; icon: string; done: boolean; explanation: string; tip: string; examples: { en: string; pt: string }[]; q: { q: string; ctx: string; opts: string[]; ans: number; exp: string }[] }

type TocarSom = (tipo: 'acerto' | 'erro') => void

type SpeakEN = (text: string, id: number) => void

type IcProps = { e?: string; s?: number | string; c?: string; sw?: number; style?: CSSProperties }

type IcBadgeProps = { e?: string; color: string; onDark?: boolean; size?: number; box?: number; radius?: number; style?: CSSProperties }

export default function ListeningScreen({
  onBack,
  lessons,
  dbLessonsLoading,
  speakEN,
  tocarSom,
  setXp,
  Ic,
  IcBadge,
}: {
  onBack: () => void
  lessons: Record<string, Lesson[]>
  dbLessonsLoading: boolean
  speakEN: SpeakEN
  tocarSom: TocarSom
  setXp: Dispatch<SetStateAction<number>>
  Ic: (props: IcProps) => ReactElement
  IcBadge: (props: IcBadgeProps) => ReactElement
}) {
  const [listeningSupported, setListeningSupported] = useState(false)
  const [listeningQuestion, setListeningQuestion] = useState<ListeningQuestion | null>(null)
  const [listeningSelected, setListeningSelected] = useState<number | null>(null)
  const [listeningCorrect, setListeningCorrect] = useState<boolean | null>(null)
  const [listeningRound, setListeningRound] = useState(0)
  const [listeningError, setListeningError] = useState<string | null>(null)

  const listeningPool = useMemo(() => {
    const pool: ListeningExample[] = []
    ;(['A1', 'A2'] as const).forEach(nivel => {
      lessons[nivel]?.forEach(lesson => {
        const examples = Array.isArray(lesson.examples) ? lesson.examples : []
        examples.forEach(ex => {
          if (ex && typeof ex === 'object' && typeof ex.en === 'string' && typeof ex.pt === 'string') {
            pool.push({ en: ex.en, pt: ex.pt, id: `${nivel}|${ex.en}` })
          }
        })
      })
    })
    return pool.filter((item, index, self) => self.findIndex(x => x.en === item.en && x.pt === item.pt) === index)
  }, [lessons])

  function shuffle<T>(arr: T[]) {
    return [...arr].sort(() => Math.random() - 0.5)
  }

  function buildListeningQuestion() {
    try {
      if (listeningPool.length < 4) return null
      const pool = [...listeningPool]
      const answerIndex = Math.floor(Math.random() * pool.length)
      const answer = pool.splice(answerIndex, 1)[0]
      if (!answer) return null
      const wrong: ListeningExample[] = []
      while (wrong.length < 3 && pool.length > 0) {
        const idx = Math.floor(Math.random() * pool.length)
        const candidate = pool.splice(idx, 1)[0]
        if (candidate && !wrong.find(w => w.pt === candidate.pt)) wrong.push(candidate)
      }
      if (wrong.length < 3) return null
      const options = shuffle([answer.pt, ...wrong.map(w => w.pt)])
      return { answer, options, correctOption: answer.pt }
    } catch (e) {
      console.error('Erro ao montar exercício Listening:', e)
      setListeningError('Conteúdo de listening indisponível no momento')
      return null
    }
  }

  function playListening() {
    if (!listeningSupported || !listeningQuestion) return
    speakEN(listeningQuestion.answer.en, 123456)
  }

  function selectListeningOption(idx: number) {
    if (!listeningQuestion || listeningSelected !== null) return
    setListeningSelected(idx)
    const picked = listeningQuestion.options[idx]
    const correct = picked === listeningQuestion.correctOption
    setListeningCorrect(correct)
    if (correct) {
      tocarSom('acerto')
      setXp(x => x + 5)
    } else {
      tocarSom('erro')
    }
  }

  function nextListening() {
    const next = buildListeningQuestion()
    setListeningQuestion(next)
    setListeningSelected(null)
    setListeningCorrect(null)
    setListeningRound(r => r + 1)
  }

  useEffect(() => {
    setListeningError(null)
    if (dbLessonsLoading) return
    if (!listeningQuestion) {
      const next = buildListeningQuestion()
      setListeningQuestion(next)
      if (!next && listeningPool.length < 4) {
        setListeningError('Conteúdo de listening indisponível no momento')
      }
    }
  }, [listeningQuestion, listeningPool, dbLessonsLoading])

  useEffect(() => {
    const supported = typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.speechSynthesis.speak === 'function'
    setListeningSupported(supported)
  }, [])

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #0F4A85, #185FA5)', padding: '20px 16px 24px' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}><Ic e="←" /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><IcBadge e="🎧" color="#0F4A85" onDark box={36} /><div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Listening</div></div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>Treine compreensão auditiva com frases reais de A1 e A2.</div>
      </div>
      <div style={{ padding: 16 }}>
        {!listeningSupported ? (
          <div style={{ padding: 18, borderRadius: 16, background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>Seu navegador não suporta speech synthesis. Use Chrome ou Edge.</div>
        ) : dbLessonsLoading ? (
          <div style={{ padding: 18, borderRadius: 16, background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>Carregando frases...</div>
        ) : listeningError ? (
          <div style={{ padding: 18, borderRadius: 16, background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>{listeningError}</div>
        ) : listeningPool.length < 4 ? (
          <div style={{ padding: 18, borderRadius: 16, background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>Ainda não há exemplos suficientes em A1/A2 para montar o exercício. Volte mais tarde.</div>
        ) : !listeningQuestion ? (
          <div style={{ padding: 18, borderRadius: 16, background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>Preparando o exercício...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Frase {listeningRound + 1}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 4 }}>Ouça a frase e escolha a tradução correta</div>
              </div>
              <button onClick={playListening} style={{ border: 'none', borderRadius: 12, background: '#fff', color: '#0F4A85', padding: '12px 14px', fontSize: 14, cursor: 'pointer', boxShadow: '0 3px 10px rgba(0,0,0,0.08)' }}><Ic e="🔊" style={{ verticalAlign: 'middle' }} /> Ouvir</button>
            </div>
            <div style={{ background: 'var(--color-background-secondary)', borderRadius: 16, padding: 18, color: 'var(--color-text-secondary)', fontSize: 14, lineHeight: 1.6 }}>A frase é tocada em inglês; depois escolha a opção que melhor corresponde ao significado em português.</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {listeningQuestion.options.map((option, idx) => {
                const selected = listeningSelected === idx
                const correct = selected && listeningCorrect === true
                const wrong = selected && listeningCorrect === false
                return (
                  <button key={idx} onClick={() => selectListeningOption(idx)} style={{ width: '100%', textAlign: 'left', padding: 14, borderRadius: 12, border: selected ? (correct ? '2px solid #3B6D11' : '2px solid #C0392B') : '1px solid var(--color-border-tertiary)', background: selected ? (correct ? '#EAF3DE' : '#FBEAE8') : 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 15, cursor: listeningSelected !== null ? 'default' : 'pointer', fontWeight: selected ? 700 : 500 }}>{option}</button>
                )
              })}
            </div>
            {listeningSelected !== null && (
              <div style={{ padding: 14, borderRadius: 14, background: listeningCorrect ? '#EAF3DE' : '#FBEAE8', color: listeningCorrect ? '#3B6D11' : '#C0392B', fontWeight: 600, textAlign: 'center' }}>
                {listeningCorrect ? 'Correto! Parabéns.' : `Errado! A resposta certa é “${listeningQuestion.correctOption}”.`}
              </div>
            )}
            <button onClick={nextListening} style={{ width: '100%', padding: 14, borderRadius: 12, border: 'none', background: '#0F4A85', color: '#fff', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Próxima frase</button>
          </div>
        )}
      </div>
    </div>
  )
}
