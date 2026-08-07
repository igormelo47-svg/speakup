'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PERGUNTAS, classificar } from '../../lib/teste-nivel'

// Teste de nivelamento público, sem cadastro. A decisão de deixar responder ANTES de
// pedir e-mail é deliberada: o anúncio promete "teste de nível grátis em 2 minutos" e
// exigir conta no meio do caminho é o jeito mais rápido de queimar o clique pago.
// O cadastro é oferecido no resultado, quando a pessoa já investiu 2 minutos e quer
// saber o que fazer com o nível que acabou de descobrir.
//
// As perguntas e as faixas de classificação vivem em lib/teste-nivel.ts, com testes.

const AZUL = '#1E63C7'
const ESCURO = '#103D77'
const LARANJA = '#F5A623'

export default function Teste() {
  const [i, setI] = useState(0)
  const [respostas, setRespostas] = useState<number[]>([])
  const [escolha, setEscolha] = useState<number | null>(null)
  const [comecou, setComecou] = useState(false)

  const total = PERGUNTAS.length
  const acabou = respostas.length === total
  const acertos = respostas.filter((r, k) => r === PERGUNTAS[k].certa).length

  function evento(nome: string, extra?: Record<string, unknown>) {
    try {
      const w = window as unknown as { dataLayer?: unknown[] }
      w.dataLayer = w.dataLayer || []
      w.dataLayer.push({ event: nome, ...extra })
    } catch { /* dataLayer é opcional: bloqueador de anúncio derruba o GTM e o teste tem que funcionar assim mesmo */ }
  }

  function iniciar() {
    setComecou(true)
    evento('teste_nivel_iniciado')
  }

  // Concluir o teste é o evento pelo qual a campanha do Meta OTIMIZA. Ele sai por dois
  // caminhos com o MESMO id: o pixel (via GTM) e o nosso servidor. O pixel some quando a
  // pessoa usa bloqueador; o id igual faz o Meta contar UMA vez quando os dois chegam.
  function idEvento() {
    const c = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}${Math.random().toString(16).slice(2)}`
    return `vonai-lead-${c}`
  }

  function responder() {
    if (escolha === null) return
    const novas = [...respostas, escolha]
    setRespostas(novas)
    setEscolha(null)
    if (novas.length === total) {
      const acertos = novas.filter((r, k) => r === PERGUNTAS[k].certa).length
      const n = classificar(acertos).nivel
      const eventId = idEvento()
      evento('teste_nivel_concluido', { nivel: n, acertos, event_id: eventId })
      // Best-effort e sem await: medição nunca pode segurar a tela do resultado.
      try {
        fetch('/api/lead-meta', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event_id: eventId, nivel: n }), keepalive: true,
        }).catch(() => {})
      } catch { /* medição é opcional; o teste tem que funcionar de qualquer jeito */ }
    } else {
      setI(novas.length)
    }
  }

  function refazer() {
    setI(0); setRespostas([]); setEscolha(null)
  }

  const caixa: React.CSSProperties = { background: '#fff', border: '1px solid #E8ECF2', borderRadius: 20, padding: '26px 22px', boxShadow: '0 8px 26px rgba(16,42,76,0.06)' }
  const botao: React.CSSProperties = { display: 'inline-block', background: LARANJA, color: '#fff', fontWeight: 700, fontSize: 16, padding: '14px 30px', borderRadius: 30, textDecoration: 'none', border: 'none', cursor: 'pointer', boxShadow: '0 6px 18px rgba(245,166,35,0.4)' }

  if (!comecou) {
    return (
      <div style={caixa}>
        <div style={{ fontSize: 15, fontWeight: 700, color: AZUL, marginBottom: 8 }}>12 perguntas · cerca de 2 minutos</div>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 10px' }}>Descubra seu nível de inglês agora</h2>
        <p style={{ color: '#5B6B82', fontSize: 15.5, lineHeight: 1.65, margin: '0 0 8px' }}>
          As perguntas ficam mais difíceis conforme você avança. Responda o que achar certo — se não souber, chute; errar aqui não custa nada e ajuda a posicionar você melhor.
        </p>
        <p style={{ color: '#7C8AA0', fontSize: 14, lineHeight: 1.6, margin: '0 0 22px' }}>
          Sem cadastro e sem e-mail. O resultado aparece na tela no fim.
        </p>
        <button onClick={iniciar} style={botao}>Começar o teste →</button>
      </div>
    )
  }

  if (acabou) {
    const r = classificar(acertos)
    return (
      <div style={caixa}>
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#7C8AA0', letterSpacing: 0.5 }}>SEU NÍVEL</div>
          <div style={{ fontSize: 56, fontWeight: 800, color: AZUL, lineHeight: 1.1 }}>{r.nivel}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#102A4C' }}>{r.titulo}</div>
          <div style={{ fontSize: 14, color: '#7C8AA0', marginTop: 6 }}>{acertos} de {total} corretas</div>
        </div>
        <p style={{ color: '#5B6B82', fontSize: 15.5, lineHeight: 1.7, margin: '0 0 16px' }}>{r.texto}</p>
        <div style={{ background: '#F6F8FB', borderRadius: 14, padding: '16px 18px', marginBottom: 22 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#102A4C', marginBottom: 5 }}>Por onde continuar</div>
          <div style={{ fontSize: 14.5, color: '#5B6B82', lineHeight: 1.6 }}>{r.proximo}</div>
        </div>

        <div style={{ background: `linear-gradient(160deg, #2E72D6, ${ESCURO})`, borderRadius: 16, padding: '22px 20px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Quer a trilha montada a partir do {r.nivel}?</div>
          <div style={{ fontSize: 14.5, color: '#D6E6FA', lineHeight: 1.6, marginBottom: 18 }}>
            No app, o professor de IA começa exatamente daqui, conversa com você e corrige sua pronúncia na hora. 2 dias grátis, sem cartão.
          </div>
          {/* O nível vai na URL para o cadastro guardar e o app começar a trilha dali.
              Sem isso a promessa "comece do seu nível" morre no formulário. */}
          <Link href={`/cadastro?nivel=${r.nivel}`} style={{ ...botao, display: 'inline-block' }} onClick={() => evento('teste_nivel_cta', { nivel: r.nivel })}>Começar do {r.nivel} grátis →</Link>
        </div>

        {/* Gabarito depois do CTA: quem quer estudar o erro rola mais, quem quer o app já clicou */}
        <details style={{ marginTop: 22, cursor: 'pointer' }}>
          <summary style={{ fontSize: 15, fontWeight: 700, color: AZUL }}>Ver o gabarito e o porquê de cada resposta</summary>
          <div style={{ marginTop: 14 }}>
            {PERGUNTAS.map((q, k) => {
              const ok = respostas[k] === q.certa
              return (
                <div key={k} style={{ borderBottom: '1px solid #EEF1F6', padding: '12px 0' }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: '#102A4C' }}>
                    {ok ? '✅' : '❌'} {q.frase.replace('___', `«${q.opcoes[q.certa]}»`)}
                  </div>
                  {!ok && <div style={{ fontSize: 13.5, color: '#B54A3A', marginTop: 3 }}>Você marcou: {q.opcoes[respostas[k]]}</div>}
                  <div style={{ fontSize: 13.5, color: '#5B6B82', marginTop: 4, lineHeight: 1.55 }}>{q.porque}</div>
                </div>
              )
            })}
            <button onClick={refazer} style={{ marginTop: 16, background: 'none', border: `1px solid ${AZUL}`, color: AZUL, fontWeight: 600, fontSize: 14.5, padding: '10px 22px', borderRadius: 24, cursor: 'pointer' }}>Refazer o teste</button>
          </div>
        </details>
      </div>
    )
  }

  const q = PERGUNTAS[i]
  const pct = Math.round((i / total) * 100)
  return (
    <div style={caixa}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13.5, color: '#7C8AA0', marginBottom: 8 }}>
        <span>Pergunta {i + 1} de {total}</span>
        <span style={{ background: '#F6F8FB', padding: '3px 10px', borderRadius: 12, fontWeight: 700, color: AZUL }}>{q.nivel}</span>
      </div>
      <div style={{ height: 6, background: '#EEF1F6', borderRadius: 4, marginBottom: 22 }}>
        <div style={{ height: 6, width: `${pct}%`, background: AZUL, borderRadius: 4, transition: 'width .25s' }} />
      </div>

      <div style={{ fontSize: 22, fontWeight: 700, color: '#102A4C', lineHeight: 1.4, marginBottom: 20 }}>{q.frase}</div>

      <div style={{ display: 'grid', gap: 10 }}>
        {q.opcoes.map((o, k) => {
          const sel = escolha === k
          return (
            <button
              key={k}
              onClick={() => setEscolha(k)}
              style={{
                textAlign: 'left', fontSize: 16, padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                border: sel ? `2px solid ${AZUL}` : '1px solid #E8ECF2',
                background: sel ? '#F2F7FF' : '#fff',
                color: '#102A4C', fontWeight: sel ? 700 : 500,
              }}
            >
              {o}
            </button>
          )
        })}
      </div>

      <button onClick={responder} disabled={escolha === null} style={{ ...botao, marginTop: 22, width: '100%', opacity: escolha === null ? 0.45 : 1, cursor: escolha === null ? 'default' : 'pointer' }}>
        {i + 1 === total ? 'Ver meu nível →' : 'Próxima →'}
      </button>
    </div>
  )
}
