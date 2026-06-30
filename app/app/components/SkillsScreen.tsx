'use client'

import { type CSSProperties, type ReactElement } from 'react'

interface IcProps { e?: string; s?: number | string; c?: string; sw?: number; style?: CSSProperties }

type IcBadgeProps = { e?: string; color: string; onDark?: boolean; size?: number; box?: number; radius?: number; style?: CSSProperties }

interface Habilidade {
  id: string
  nome: string
  icon: string
  cor?: string
  descricao: string
  link?: string
  ordem?: number
  ativo?: boolean
}

type TabName = 'home' | 'historico' | 'prova' | 'pronuncia' | 'desafio' | 'nivelamento' | 'plans' | 'speak' | 'lessons' | 'skills' | 'dict' | 'vocab' | 'ai' | 'listening'

export default function SkillsScreen({
  habilidades,
  carregandoSkills,
  setTab,
  Ic,
  IcBadge,
}: {
  habilidades: Habilidade[]
  carregandoSkills: boolean
  setTab: React.Dispatch<React.SetStateAction<TabName>>
  Ic: (props: IcProps) => ReactElement
  IcBadge: (props: IcBadgeProps) => ReactElement
}) {
  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #3B6D11, #0F4A85)', padding: '20px 16px 24px' }}>
        <button onClick={() => setTab('home')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: 20, padding: 0, marginBottom: 12 }}><Ic e="←" /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><IcBadge e="📊" color="#fff" onDark box={36} /><div><div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>Habilidades</div><div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>Veja as competências carregadas do banco de dados.</div></div></div>
      </div>
      <div style={{ padding: 16 }}>
        {carregandoSkills ? (
          <div style={{ padding: 18, borderRadius: 16, background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>Carregando habilidades...</div>
        ) : habilidades.length === 0 ? (
          <div style={{ padding: 18, borderRadius: 16, background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>Nenhuma habilidade disponível no momento.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {habilidades.map(h => {
              const nome = h.nome.toLowerCase()
              const resourceTab: TabName | undefined = nome.includes('grammar') || nome.includes('gramática') ? 'lessons'
                : nome.includes('vocabulary') || nome.includes('vocabulário') ? 'vocab'
                : nome.includes('speaking') || nome.includes('fala') ? 'speak'
                : nome.includes('pronunciation') || nome.includes('pronúncia') ? 'pronuncia'
                : nome.includes('listening') || nome.includes('escuta') ? 'listening'
                : undefined

              return (
                <div key={h.id} style={{ display: 'block', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 16, padding: 16, color: 'var(--color-text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: h.cor ? h.cor + '22' : '#E6F1FB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}><Ic e={h.icon} c={h.cor || '#0F4A85'} /></div>
                    <div><div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text-primary)' }}>{h.nome}</div><div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{h.descricao}</div></div>
                  </div>
                  {resourceTab ? (
                    <button onClick={() => setTab(resourceTab)} style={{ background: 'none', border: 'none', padding: 0, fontSize: 12, fontWeight: 600, color: '#0F4A85', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      Abrir recurso <Ic e="→" style={{ verticalAlign: 'middle' }} />
                    </button>
                  ) : h.link ? (
                    <a href={h.link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#0F4A85', fontWeight: 600, textDecoration: 'none' }}>
                      Abrir recurso <Ic e="→" style={{ verticalAlign: 'middle' }} />
                    </a>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
