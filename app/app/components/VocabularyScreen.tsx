'use client'

import { useState, useMemo, type CSSProperties, type ReactElement } from 'react'

interface VocabularyItem { en: string; pt: string; ex: string; cat: string }

type IcProps = { e?: string; s?: number | string; c?: string; sw?: number; style?: CSSProperties }

type IcBadgeProps = { e?: string; color: string; onDark?: boolean; size?: number; box?: number; radius?: number; style?: CSSProperties }

export default function VocabularyScreen({
  vocab,
  speakingId,
  speakEN,
  Ic,
  IcBadge,
  IcLabel,
}: {
  vocab: VocabularyItem[]
  speakingId: number
  speakEN: (text: string, id: number) => void
  Ic: (props: IcProps) => ReactElement
  IcBadge: (props: IcBadgeProps) => ReactElement
  IcLabel: (props: { label: string }) => ReactElement
}) {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})
  const [vocabCat, setVocabCat] = useState('all')

  const catEmoji: { [key: string]: string } = { basic: '👋', travel: '✈️', work: '💼', food: '🍽️', home: '🏠', verbs: '⚡', feelings: '😊', daily: '📅' }
  const catNome: { [key: string]: string } = { basic: 'Essencial', travel: 'Viagem', work: 'Trabalho', food: 'Comida', home: 'Casa', verbs: 'Verbo', feelings: 'Sentimento', daily: 'Dia a dia' }

  const semanaVocab = Math.floor(Date.now() / (7 * 86400000))
  const embaralharSemana = (arr: VocabularyItem[]) => {
    const a = [...arr]
    let s = semanaVocab + 1
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 9301 + 49297) % 233280
      const j = Math.floor((s / 233280) * (i + 1))
      const t = a[i]
      a[i] = a[j]
      a[j] = t
    }
    return a
  }

  const filteredVocab = useMemo(
    () => embaralharSemana(vocabCat === 'all' ? vocab : vocab.filter(v => v.cat === vocabCat)),
    [vocabCat, vocab]
  )

  return (
    <div style={{ background: 'var(--color-background-secondary)', minHeight: '100vh' }}>
      <div style={{ background: `linear-gradient(135deg, #2074C0, #0C447C)`, padding: '20px 16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><IcBadge e="📚" color="#185FA5" onDark box={36} /><div style={{ fontSize: 21, fontWeight: 700, color: '#fff' }}>Vocabulário</div></div>
        <div style={{ fontSize: 13, color: '#B5D4F4', marginTop: 3 }}>Toque no card para revelar a tradução</div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'rgba(255,255,255,0.18)', padding: '6px 13px', borderRadius: 20 }}>
          <span style={{ fontSize: 14 }}><Ic e="🔄" /></span>
          <span style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}>Novas palavras toda semana</span>
        </div>
      </div>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
          {[['all', '🗂️ Todos'], ['basic', '👋 Essenciais'], ['travel', '✈️ Viagem'], ['work', '💼 Trabalho'], ['food', '🍽️ Comida'], ['home', '🏠 Casa'], ['verbs', '⚡ Verbos'], ['feelings', '😊 Sentimentos'], ['daily', '📅 Dia a dia']].map(([cat, label]) => (
            <button key={cat} onClick={() => setVocabCat(cat)} style={{ padding: '7px 14px', border: vocabCat === cat ? 'none' : '0.5px solid var(--color-border-tertiary)', borderRadius: 20, background: vocabCat === cat ? '#185FA5' : 'var(--color-background-primary)', color: vocabCat === cat ? '#fff' : 'var(--color-text-secondary)', fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, fontWeight: vocabCat === cat ? 600 : 400 }}><IcLabel label={label} /></button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ fontWeight: 600, color: '#185FA5' }}>{filteredVocab.length}</span> palavras · embaralhadas esta semana</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'start' }}>
          {filteredVocab.map((v, i) => (
            <div key={i} onClick={() => setFlipped(f => ({ ...f, [i]: !f[i] }))} style={{ background: flipped[i] ? '#E6F1FB' : 'var(--color-background-primary)', border: flipped[i] ? '1px solid #85B7EB' : '0.5px solid var(--color-border-tertiary)', borderRadius: 16, padding: 13, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'background 0.2s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
                <span style={{ fontSize: 10.5, background: flipped[i] ? 'rgba(255,255,255,0.7)' : 'var(--color-background-secondary)', padding: '3px 8px', borderRadius: 12, color: 'var(--color-text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}><Ic e={catEmoji[v.cat]} /> {catNome[v.cat]}</span>
                <button onClick={e => { e.stopPropagation(); speakEN(v.en, 5000 + i) }} style={{ background: speakingId === 5000 + i ? '#185FA5' : 'var(--color-background-primary)', color: speakingId === 5000 + i ? '#fff' : '#185FA5', border: '1px solid #E6F1FB', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic e="🔊" /></button>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: flipped[i] ? '#0C447C' : 'var(--color-text-primary)', lineHeight: 1.2 }}>{v.en}</div>
              {flipped[i] ? (
                <>
                  <div style={{ color: '#185FA5', marginTop: 6, fontSize: 14, fontWeight: 600 }}>{v.pt}</div>
                  <div style={{ fontSize: 11, color: '#0C447C', marginTop: 8, fontStyle: 'italic', lineHeight: 1.45, background: 'rgba(255,255,255,0.6)', padding: '7px 9px', borderRadius: 9 }}>&quot;{v.ex}&quot;</div>
                </>
              ) : (
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 6 }}>Toque para ver <Ic e="→" /></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
