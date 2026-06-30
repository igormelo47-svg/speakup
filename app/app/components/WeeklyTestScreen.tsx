'use client'

import { useState, useEffect, type Dispatch, type SetStateAction, type CSSProperties, type ReactElement } from 'react'

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

type WeeklyTestScreenProps = {
  level: string
  setLevel: Dispatch<SetStateAction<string>>
  lessons: Record<string, Lesson[]>
  setTab: Dispatch<SetStateAction<'home' | 'historico' | 'prova' | 'pronuncia' | 'desafio' | 'nivelamento' | 'plans' | 'speak' | 'lessons' | 'skills' | 'dict' | 'vocab' | 'ai' | 'listening'>>
  setXp: Dispatch<SetStateAction<number>>
  setProvaScoreSemana: Dispatch<SetStateAction<number | null>>
  Ic: (props: IcProps) => ReactElement
  IcBadge: (props: IcBadgeProps) => ReactElement
}

export default function WeeklyTestScreen({
  level,
  setLevel,
  lessons,
  setTab,
  setXp,
  setProvaScoreSemana,
  Ic,
  IcBadge,
}: WeeklyTestScreenProps) {
  const [provaQ, setProvaQ] = useState(0)
  const [provaSel, setProvaSel] = useState(-1)
  const [provaAns, setProvaAns] = useState(false)
  const [provaAcertos, setProvaAcertos] = useState(0)
  const [provaResult, setProvaResult] = useState(false)
  const [provaNivelEscolhido, setProvaNivelEscolhido] = useState(false)

  const blue = '#185FA5'
  const semanaProva = Math.floor(Date.now() / (7 * 86400000))
  const provaPool = (lessons[level] || []).flatMap(l => l.q || [])
  const provaQuestoes: Question[] = (() => {
    if (provaPool.length < 1) return []
    const n = Math.min(20, provaPool.length)
    const idxs: number[] = []
    let k = (semanaProva * 31 + 7) % provaPool.length
    while (idxs.length < n) { if (!idxs.includes(k)) idxs.push(k); k = (k + 53) % provaPool.length }
    return idxs.map(i => provaPool[i])
  })()

  function finalizarProva() {
    setProvaResult(true)
    const novoXp = provaAcertos * 2
    setXp(xp => xp + novoXp)
    setProvaScoreSemana(provaAcertos)
    try { localStorage.setItem('speakup_prova', semanaProva + ':' + provaAcertos) } catch (e) {}
  }

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #C0392B, #9B2D2D)', padding: '20px 16px 24px' }}>
        <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}><Ic e="←" /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><IcBadge e="📝" color="#C0392B" onDark box={36} /><div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Prova Semanal · {level}</div></div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>20 questões do seu nível · muda toda semana</div>
      </div>
      <div style={{ padding: 16 }}>
        {!provaNivelEscolhido ? (
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 6 }}>Qual nível você quer testar?</div>
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 18, lineHeight: 1.5 }}>Escolha o nível da sua prova desta semana. Você pode testar qualquer um.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {([['A1', 'A1 · Iniciante'], ['A2', 'A2 · Básico'], ['B1', 'B1 · Intermediário'], ['B2', 'B2 · Intermediário+'], ['C1', 'C1 · Avançado'], ['C2', 'C2 · Domínio']] as const).map(([lv, nome]) => (
                <button key={lv} onClick={() => { setLevel(lv); setProvaNivelEscolhido(true); setProvaQ(0); setProvaSel(-1); setProvaAns(false); setProvaAcertos(0); setProvaResult(false) }} style={{ width: '100%', textAlign: 'left', padding: 16, borderRadius: 14, border: level === lv ? '2px solid #C0392B' : '1px solid var(--color-border-tertiary)', background: level === lv ? '#FDECEC' : 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{nome}<span style={{ color: '#C0392B', fontSize: 18 }}><Ic e="→" /></span></button>
              ))}
            </div>
          </div>
        ) : provaQuestoes.length < 1 ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--color-text-secondary)' }}>Sem questões suficientes neste nível ainda.</div>
        ) : !provaResult ? (
          <div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Questão {provaQ + 1} de {provaQuestoes.length}</div>
            <div style={{ background: 'var(--color-background-secondary)', borderRadius: 6, height: 6, marginBottom: 18, overflow: 'hidden' }}><div style={{ background: '#C0392B', height: '100%', width: `${provaQ / provaQuestoes.length * 100}%`, borderRadius: 6, transition: 'width 0.3s' }} /></div>
            {provaQuestoes[provaQ].ctx ? (<div style={{ background: 'var(--color-background-secondary)', borderLeft: '3px solid #C0392B', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 13, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{provaQuestoes[provaQ].ctx}</div>) : null}
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 18, lineHeight: 1.4 }}>{provaQuestoes[provaQ].q}</div>
            {provaQuestoes[provaQ].opts.map((opt: string, i: number) => {
              const correta = provaAns && i === provaQuestoes[provaQ].ans
              const errada = provaAns && i === provaSel && i !== provaQuestoes[provaQ].ans
              return (
                <button key={i} onClick={() => { if (provaAns) return; setProvaSel(i); setProvaAns(true); if (i === provaQuestoes[provaQ].ans) setProvaAcertos(a => a + 1) }} style={{ width: '100%', textAlign: 'left', padding: 14, marginBottom: 10, borderRadius: 12, border: correta ? '2px solid #3B6D11' : errada ? '2px solid #C0392B' : (provaSel === i ? '2px solid #C0392B' : '1px solid var(--color-border-tertiary)'), background: correta ? '#EAF3DE' : errada ? '#FBEAE8' : 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 15, cursor: provaAns ? 'default' : 'pointer', fontWeight: (correta || errada) ? 600 : 400 }}>{opt}{correta ? <> <Ic e="✓" /></> : errada ? <> <Ic e="✗" /></> : ''}</button>
              )
            })}
            {provaAns && provaQuestoes[provaQ].exp && (<div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12, padding: '0 4px', lineHeight: 1.5 }}><Ic e="💡" /> {provaQuestoes[provaQ].exp}</div>)}
            <button disabled={!provaAns} onClick={() => { if (provaQ < provaQuestoes.length - 1) { setProvaQ(provaQ + 1); setProvaSel(-1); setProvaAns(false) } else { finalizarProva() } }} style={{ width: '100%', padding: 15, marginTop: 4, background: !provaAns ? 'var(--color-background-secondary)' : '#C0392B', color: !provaAns ? 'var(--color-text-secondary)' : '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: !provaAns ? 'default' : 'pointer' }}>{provaQ < provaQuestoes.length - 1 ? <>Próxima <Ic e="→" /></> : <>Finalizar prova <Ic e="🎯" /></>}</button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', paddingTop: 12 }}>
            <div style={{ fontSize: 56 }}><Ic e={provaAcertos >= 16 ? '🏆' : provaAcertos >= 12 ? '🎉' : provaAcertos >= 8 ? '💪' : '📚'} /></div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text-primary)', marginTop: 8 }}>{provaAcertos}/{provaQuestoes.length}</div>
            <div style={{ fontSize: 16, color: '#C0392B', fontWeight: 700, marginTop: 4 }}>{Math.round(provaAcertos / provaQuestoes.length * 100)}% de acerto</div>
            <div style={{ fontSize: 15, color: '#E07B00', fontWeight: 600, marginTop: 8 }}>+{provaAcertos * 2} XP</div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 14, lineHeight: 1.5, maxWidth: 320, margin: '14px auto 0' }}>{provaAcertos >= 16 ? 'Excelente! Você domina este nível. Que tal subir um nível?' : provaAcertos >= 10 ? 'Bom resultado! Continue praticando para fixar.' : 'Continue estudando as lições deste nível e tente na próxima semana.'}</div>
            <button onClick={() => setTab('home')} style={{ width: '100%', padding: 15, marginTop: 24, background: blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Voltar ao início</button>
          </div>
        )}
      </div>
    </div>
  )
}
