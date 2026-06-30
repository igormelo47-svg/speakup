'use client'

import { type Dispatch, type SetStateAction, type CSSProperties, type ReactElement } from 'react'

type AppTab = 'home' | 'historico' | 'prova' | 'pronuncia' | 'desafio' | 'nivelamento' | 'plans' | 'speak' | 'lessons' | 'skills' | 'dict' | 'vocab' | 'ai' | 'listening'

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

type HomeScreenProps = {
  saudacao: string
  userName: string
  isPremium: boolean
  logout: () => void
  isNovo: boolean
  setTab: Dispatch<SetStateAction<AppTab>>
  streak: number
  xp: number
  doneLessons: number
  totalLessons: number
  level: string
  xpHoje: number
  lessons: Record<string, Lesson[]>
  vocabCount: number
  conversasCount: number
  simulacoesHoje: number
  scenariosCount: number
  desafioFeito: boolean
  setNivIdx: Dispatch<SetStateAction<number>>
  setNivScore: Dispatch<SetStateAction<number[]>>
  setNivSel: Dispatch<SetStateAction<number>>
  setNivResult: Dispatch<SetStateAction<string | null>>
  provaScoreSemana: number | null
  setPronCat: Dispatch<SetStateAction<string | null>>
  setPronIdx: Dispatch<SetStateAction<number>>
  setPronHeard: Dispatch<SetStateAction<string>>
  setPronScore: Dispatch<SetStateAction<number | null>>
  setPronTip: Dispatch<SetStateAction<string>>
  Ic: (props: IcProps) => ReactElement
  IcBadge: (props: IcBadgeProps) => ReactElement
}

export default function HomeScreen({
  saudacao,
  userName,
  isPremium,
  logout,
  isNovo,
  setTab,
  streak,
  xp,
  doneLessons,
  totalLessons,
  level,
  xpHoje,
  lessons,
  vocabCount,
  conversasCount,
  simulacoesHoje,
  scenariosCount,
  desafioFeito,
  setNivIdx,
  setNivScore,
  setNivSel,
  setNivResult,
  provaScoreSemana,
  setPronCat,
  setPronIdx,
  setPronHeard,
  setPronScore,
  setPronTip,
  Ic,
  IcBadge,
}: HomeScreenProps) {
  const blue = '#185FA5'
  const blueDark = '#0C447C'
  const blueLight = '#E6F1FB'
  const green = '#3B6D11'
  const greenLight = '#EAF3DE'
  const purple = '#534AB7'
  const purpleLight = '#EEEDFE'
  const gold = '#B8860B'
  const FREE_LIMIT = 3

  const proxLicao = lessons[level].find(l => !l.done)
  let passo
  if (streak === 0) {
    passo = { icon: '🔥', titulo: 'Comece hoje', sub: 'Desafio do Dia', cor: '#EF9F27', acao: () => { setTab('desafio') } }
  } else if (xpHoje < 50 && !desafioFeito) {
    passo = { icon: '🎯', titulo: 'Meta de hoje', sub: `${50 - xpHoje} XP`, cor: '#EF9F27', acao: () => { setTab('desafio') } }
  } else if (proxLicao) {
    passo = { icon: proxLicao.icon, titulo: 'Próxima lição', sub: `Nível ${level}`, cor: blue, acao: () => setTab('lessons') }
  } else {
    passo = { icon: '🎭', titulo: 'Fale com a IA', sub: 'Pratique conversação', cor: purple, acao: () => setTab('speak') }
  }

  return (
    <div>
      <div style={{ background: `linear-gradient(160deg, #2074C0, ${blueDark})`, padding: '20px 16px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div><div style={{ fontSize: 13, color: '#B5D4F4' }}>{saudacao},</div><div style={{ fontSize: 18, fontWeight: 500, color: '#fff' }}>{userName} {isPremium && <span style={{ fontSize: 11, background: gold, color: '#fff', padding: '2px 7px', borderRadius: 20, marginLeft: 6 }}>PRO <Ic e="⭐" /></span>}</div></div>
          <button onClick={logout} style={{ background: blueDark, border: 'none', borderRadius: 8, padding: '6px 12px', color: '#85B7EB', fontSize: 12, cursor: 'pointer' }}>Sair</button>
        </div>
        {isNovo ? (
          <div style={{ background: blueDark, borderRadius: 14, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Bem-vindo ao SpeakUp! <Ic e="🎉" /></div>
            <div style={{ fontSize: 13, color: '#B5D4F4', lineHeight: 1.5, marginBottom: 16 }}>Comece sua primeira lição e ganhe seus primeiros 10 XP. Sua jornada até o inglês fluente começa agora.</div>
            <button onClick={() => setTab('lessons')} style={{ background: '#EF9F27', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Começar agora <Ic e="→" /></button>
          </div>
        ) : (
          <div style={{ background: blueDark, borderRadius: 14, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, background: 'rgba(239,159,39,0.15)', borderRadius: 12, padding: '10px 14px' }}>
              <div style={{ fontSize: 30 }}><Ic e="🔥" c="#EF9F27" /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{streak} {streak === 1 ? 'dia' : 'dias'} de sequência</div><div style={{ fontSize: 12, color: '#EF9F27', fontWeight: 600, marginTop: 3 }}>{streak === 0 ? 'Comece hoje a sua sequência!' : 'Continue assim, não quebre a corrente!'}</div></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 14 }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}><Ic e="⭐" /> {xp}</div><div style={{ fontSize: 11, color: '#85B7EB' }}>XP total</div></div>
              <div style={{ width: 1, background: blue }} />
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}><Ic e="📚" /> {doneLessons}</div><div style={{ fontSize: 11, color: '#85B7EB' }}>Lições feitas</div></div>
              <div style={{ width: 1, background: blue }} />
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}><Ic e="🎯" /> {level}</div><div style={{ fontSize: 11, color: '#85B7EB' }}>Seu nível</div></div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}><Ic e="📚" /> Curso concluído: {doneLessons}/{totalLessons} lições</div>
                <div style={{ fontSize: 11, color: '#85B7EB', fontWeight: 600 }}>{totalLessons ? Math.round(doneLessons / totalLessons * 100) : 0}%</div>
              </div>
              <div style={{ background: blue, borderRadius: 6, height: 8, overflow: 'hidden' }}><div style={{ background: '#4ADE80', height: '100%', width: `${totalLessons ? Math.round(doneLessons / totalLessons * 100) : 0}%`, borderRadius: 6, transition: 'width 0.4s' }} /></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: 12, color: '#fff', fontWeight: 600 }}><Ic e="🎯" /> Meta de hoje: {xpHoje}/50 XP</div>
              <div style={{ fontSize: 11, color: xpHoje >= 50 ? '#4ADE80' : '#85B7EB', fontWeight: 600 }}>{xpHoje >= 50 ? <>Concluída! <Ic e="✓" /></> : `Faltam ${50 - xpHoje}`}</div>
            </div>
            <div style={{ background: blue, borderRadius: 6, height: 8, overflow: 'hidden' }}><div style={{ background: xpHoje >= 50 ? '#4ADE80' : '#EF9F27', height: '100%', width: `${Math.min(100, Math.round(xpHoje / 50 * 100))}%`, borderRadius: 6, transition: 'width 0.4s' }} /></div>
          </div>
        )}
      </div>
      <div style={{ padding: '16px', marginTop: 8 }}>
        {!isPremium && (
          <div onClick={() => setTab('plans')} style={{ background: 'linear-gradient(135deg, #B8860B, #DAA520)', borderRadius: 14, padding: 14, marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
            <IcBadge e="⭐" color={gold} onDark box={44} size={24} />
            <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Seja Premium <Ic e="✨" /></div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>IA ilimitada · Conversação por voz · Plano personalizado</div></div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 20 }}>R$19,90/mês <Ic e="→" /></div>
          </div>
        )}
        <div onClick={() => { if (!desafioFeito) { setTab('desafio') } }} style={{ background: desafioFeito ? 'linear-gradient(135deg, #2EBD6B, #1B9E54)' : 'linear-gradient(135deg, #EF9F27, #E07B00)', borderRadius: 14, padding: 14, marginBottom: 12, cursor: desafioFeito ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 12, border: 'none' }}>
          {desafioFeito ? (<div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: 22, color: '#fff', fontWeight: 700, lineHeight: 1 }}><Ic e="✓" c="#fff" /></span></div>) : (<IcBadge e="🔥" color="#E07B00" onDark box={44} size={24} />)}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{desafioFeito ? 'Desafio concluído!' : 'Desafio do Dia'}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2 }}>{desafioFeito ? <>Volte amanhã para manter seu streak <Ic e="🔥" /></> : '5 perguntas rápidas · ganhe até 25 XP'}</div>
          </div>
          {!desafioFeito && <div style={{ fontSize: 20, color: '#fff' }}><Ic e="→" c="#fff" /></div>}
        </div>
        <div onClick={() => { setNivIdx(0); setNivScore([0,0,0,0,0,0]); setNivSel(-1); setNivResult(null); setTab('nivelamento') }} style={{ background: 'linear-gradient(135deg, #2074C0, #185FA5)', borderRadius: 14, padding: 14, marginBottom: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
          <IcBadge e="📊" color={blue} onDark box={44} size={24} />
          <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Descubra seu nível</div><div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Faça o teste e comece no ponto certo</div></div>
          <div style={{ fontSize: 20, color: '#fff' }}><Ic e="→" c="#fff" /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div onClick={() => setTab('speak')} style={{ background: purpleLight, borderRadius: 12, padding: 14, cursor: 'pointer' }}>
            <IcBadge e="🎭" color={purple} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 500, color: '#3C3489' }}>Simulador</div>
            <div style={{ fontSize: 11, color: purple }}>{isPremium ? `${scenariosCount} cenários` : `${simulacoesHoje}/${FREE_LIMIT} hoje`}</div>
          </div>
          <div onClick={() => setTab('ai')} style={{ background: '#FAEEDA', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
            <IcBadge e="🤖" color="#B45309" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 500, color: '#633806' }}>Professor IA</div>
            <div style={{ fontSize: 11, color: '#854F0B' }}>Disponível 24h</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
          <div onClick={() => setTab('vocab')} style={{ background: greenLight, borderRadius: 12, padding: 14, cursor: 'pointer' }}>
            <IcBadge e="📚" color={green} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 500, color: '#27500A' }}>Vocabulário</div>
            <div style={{ fontSize: 11, color: green }}>{vocabCount} palavras</div>
          </div>
          <div onClick={() => setTab('listening')} style={{ background: '#E0F2FF', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
            <IcBadge e="🎧" color="#0F4A85" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 500, color: '#0F4A85' }}>Listening</div>
            <div style={{ fontSize: 11, color: '#0F4A85' }}>Compreensão auditiva</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          <div onClick={() => setTab('lessons')} style={{ background: blueLight, borderRadius: 12, padding: 14, cursor: 'pointer' }}>
            <IcBadge e="📖" color={blue} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 500, color: blueDark }}>Lições</div>
            <div style={{ fontSize: 11, color: blue }}>Seu progresso</div>
          </div>
          <div onClick={() => setTab('historico')} style={{ background: '#F0ECFF', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
            <div style={{ width: 38, height: 38, background: '#534AB726', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}><Ic e="💬" s={20} c="#534AB7" /></div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>Minhas conversas</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{conversasCount} {conversasCount === 1 ? 'conversa' : 'conversas'}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          <div onClick={passo.acao} style={{ background: '#FFF6D8', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
            <div style={{ width: 38, height: 38, background: '#EF9F2726', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}><Ic e={passo.icon} s={20} c="#EF9F27" /></div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>{passo.titulo}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{passo.sub}</div>
          </div>
          <div onClick={() => setTab('prova')} style={{ background: '#FDECEC', borderRadius: 12, padding: 14, cursor: 'pointer' }}>
            <IcBadge e="📝" color="#C0392B" style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 500, color: '#9B2D2D' }}>Prova Semanal</div>
            <div style={{ fontSize: 11, color: '#C0392B' }}>{provaScoreSemana !== null ? `Nota: ${provaScoreSemana}/20` : '20 questões'}</div>
          </div>
        </div>
        <div onClick={() => { setPronCat(null); setPronIdx(0); setPronHeard(''); setPronScore(null); setPronTip(''); setTab('pronuncia') }} style={{ marginTop: 10, background: 'linear-gradient(135deg, #6A5ACD, #4B3FBF)', borderRadius: 12, padding: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}>
          <IcBadge e="🎤" color={purple} onDark box={44} size={24} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>Treino de Pronúncia</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>Fale e receba dicas da IA pra soar nativo <Ic e="🗣️" /></div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '3px 9px', borderRadius: 20 }}>NOVO</div>
        </div>
      </div>
    </div>
  )
}
