'use client'

import { useState, useMemo, type Dispatch, type SetStateAction, type CSSProperties, type ReactElement } from 'react'

type IcProps = { e?: string; s?: number | string; c?: string; sw?: number; style?: CSSProperties }
type IcBadgeProps = { e?: string; color: string; onDark?: boolean; size?: number; box?: number; radius?: number; style?: CSSProperties }

interface Question {
  q: string
  ctx: string
  opts: string[]
  ans: number
  exp: string
}

interface Lesson {
  title: string
  sub: string
  icon: string
  done: boolean
  explanation: string
  tip: string
  examples: { en: string; pt: string }[]
  q: Question[]
}

type DailyChallengeScreenProps = {
  lessons: Record<string, Lesson[]>
  xp: number
  streak: number
  setXp: Dispatch<SetStateAction<number>>
  setStreak: Dispatch<SetStateAction<number>>
  desafioFeito: boolean
  setDesafioFeito: Dispatch<SetStateAction<boolean>>
  setTab: Dispatch<SetStateAction<'home' | 'historico' | 'prova' | 'pronuncia' | 'desafio' | 'nivelamento' | 'plans' | 'speak' | 'lessons' | 'skills' | 'dict' | 'vocab' | 'ai' | 'listening'>>
  Ic: (props: IcProps) => ReactElement
  IcBadge: (props: IcBadgeProps) => ReactElement
}

export default function DailyChallengeScreen({
  lessons,
  xp,
  streak,
  setXp,
  setStreak,
  desafioFeito,
  setDesafioFeito,
  setTab,
  Ic,
  IcBadge,
}: DailyChallengeScreenProps) {
  const [desQ, setDesQ] = useState(0)
  const [desSel, setDesSel] = useState(-1)
  const [desAns, setDesAns] = useState(false)
  const [desAcertos, setDesAcertos] = useState(0)
  const [desResult, setDesResult] = useState(false)

  const desafioPool = useMemo(() => Object.values(lessons).flat().flatMap(l => l.q || []), [lessons])
  const daySeed = new Date().toISOString().split('T')[0].split('-').reduce((a, b) => a + parseInt(b), 0)
  const desafioQuestions: Question[] = useMemo(() => {
    if (desafioPool.length < 5) return []
    const idxs: number[] = []
    let k = daySeed % desafioPool.length
    while (idxs.length < 5) {
      if (!idxs.includes(k)) idxs.push(k)
      k = (k + 137) % desafioPool.length
    }
    return idxs.map(i => desafioPool[i])
  }, [desafioPool, daySeed])

  function finalizarDesafio() {
    const hoje = new Date().toISOString().split('T')[0]
    const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    let last: string | null = null
    try { last = localStorage.getItem('speakup_desafio') } catch (e) {}
    const novoStreak = last === hoje ? streak : (last === ontem ? streak + 1 : 1)
    const novoXp = xp + desAcertos * 5
    setStreak(novoStreak)
    setXp(novoXp)
    setDesafioFeito(true)
    setDesResult(true)
    try { localStorage.setItem('speakup_desafio', hoje) } catch (e) {}
  }

  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, #EF9F27, #E07B00)`, padding: '20px 16px 24px' }}>
        <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}><Ic e="←" /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><IcBadge e="🔥" color="#E07B00" onDark box={36} /><div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Desafio do Dia</div></div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>Acerte tudo e mantenha seu streak vivo</div>
      </div>
      <div style={{ padding: 16 }}>
        {desafioQuestions.length < 5 ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--color-text-secondary)' }}>Carregando o desafio de hoje...</div>
        ) : !desResult ? (
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Pergunta {desQ + 1} de 5</div>
            <div style={{ background: 'var(--color-background-secondary)', borderRadius: 6, height: 6, marginBottom: 18, overflow: 'hidden' }}><div style={{ background: '#EF9F27', height: '100%', width: `${desQ / 5 * 100}%`, borderRadius: 6, transition: 'width 0.3s' }} /></div>
            {desafioQuestions[desQ].ctx ? (<div style={{ background: 'var(--color-background-secondary)', borderLeft: '3px solid #EF9F27', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{desafioQuestions[desQ].ctx}</div>) : null}
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 18, lineHeight: 1.4 }}>{desafioQuestions[desQ].q}</div>
            {desafioQuestions[desQ].opts.map((opt: string, i: number) => {
              const correta = desAns && i === desafioQuestions[desQ].ans
              const errada = desAns && i === desSel && i !== desafioQuestions[desQ].ans
              return (
                <button key={i} onClick={() => { if (desAns) return; setDesSel(i); setDesAns(true); if (i === desafioQuestions[desQ].ans) setDesAcertos(a => a + 1) }} style={{ width: '100%', textAlign: 'left', padding: 14, marginBottom: 10, borderRadius: 12, border: correta ? '2px solid #3B6D11' : errada ? '2px solid #C0392B' : (desSel === i ? '2px solid #EF9F27' : '1px solid var(--color-border-tertiary)'), background: correta ? '#EAF3DE' : errada ? '#FBEAE8' : 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 15, cursor: desAns ? 'default' : 'pointer', fontWeight: (correta || errada) ? 600 : 400 }}>{opt}{correta ? <> <Ic e="✓" /></> : errada ? <> <Ic e="✗" /></> : ''}</button>
              )
            })}
            {desAns && desafioQuestions[desQ].exp && (<div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12, padding: '0 4px', lineHeight: 1.5 }}><Ic e="💡" /> {desafioQuestions[desQ].exp}</div>)}
            <button disabled={!desAns} onClick={() => { if (desQ < 4) { setDesQ(desQ + 1); setDesSel(-1); setDesAns(false) } else { finalizarDesafio() } }} style={{ width: '100%', padding: 15, marginTop: 4, background: !desAns ? 'var(--color-background-secondary)' : '#EF9F27', color: !desAns ? 'var(--color-text-secondary)' : '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: !desAns ? 'default' : 'pointer' }}>{desQ < 4 ? <>Próxima <Ic e="→" /></> : <>Ver resultado <Ic e="🎯" /></>}</button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 12 }}>
            <div style={{ fontSize: 56 }}><Ic e={desAcertos === 5 ? '🏆' : desAcertos >= 3 ? '🎉' : '💪'} /></div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', marginTop: 8 }}>Você acertou {desAcertos}/5</div>
            <div style={{ fontSize: 15, color: '#E07B00', fontWeight: 600, marginTop: 8 }}>+{desAcertos * 5} XP</div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 14, lineHeight: 1.5, maxWidth: 320, margin: '14px auto 0' }}>{desAcertos === 5 ? 'Excelente! Você domina o desafio de hoje. Volte amanhã para manter seu streak.' : desAcertos >= 3 ? 'Bom resultado! Continue praticando para manter seu ritmo.' : 'Continue estudando as lições e tente novamente amanhã.'}</div>
            <button onClick={() => setTab('home')} style={{ width: '100%', padding: 15, marginTop: 24, background: '#EF9F27', color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Voltar ao início</button>
          </div>
        )}
      </div>
    </div>
  )
}
