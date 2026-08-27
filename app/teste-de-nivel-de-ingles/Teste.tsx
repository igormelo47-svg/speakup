'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PERGUNTAS, classificar } from '../../lib/teste-nivel'
import { PRECO } from '../_marketing/ui'
import DemoFala from './DemoFala'

// Teste de nivelamento público, sem cadastro. A decisão de deixar responder ANTES de
// pedir e-mail é deliberada: o anúncio promete "teste de nível grátis em 2 minutos" e
// exigir conta no meio do caminho é o jeito mais rápido de queimar o clique pago.
// O cadastro é oferecido no resultado, quando a pessoa já investiu 2 minutos e quer
// saber o que fazer com o nível que acabou de descobrir.
//
// As perguntas e as faixas de classificação vivem em lib/teste-nivel.ts, com testes.
//
// 27/08/2026 — REESCRITA DO RESULTADO. Medição de 18–27/08: 95 pessoas terminaram o teste
// vindas do Meta e 11 criaram conta (11,6%). A tela de resultado tinha QUATRO saídas
// competindo — criar conta, baixar na loja, "prefere não criar conta agora?" e o gabarito —
// e três delas levavam para longe do cadastro. Além disso a pessoa nunca experimentava o
// produto: o anúncio promete falar inglês, o teste mede gramática e o resultado entrega um
// rótulo. Agora a ordem é: nível → FALAR uma frase e ouvir a correção (DemoFala, sem conta)
// → criar conta. Os selos de loja saíram daqui (mandavam o clique pago para fora da web) e
// o formulário de e-mail desceu para depois do gabarito, como rede e não como alternativa.

const AZUL = '#1E63C7'
const ESCURO = '#103D77'
const LARANJA = '#F5A623'

export default function Teste() {
  const [i, setI] = useState(0)
  const [respostas, setRespostas] = useState<number[]>([])
  const [escolha, setEscolha] = useState<number | null>(null)
  const [comecou, setComecou] = useState(false)
  // O Lead (concluir o teste) só pode ser medido UMA vez por visita: o gabarito convida a
  // refazer, e cada refeita gerava outro Lead com id novo — o Meta aprendia a comprar
  // gente que refaz teste, não gente nova.
  const [mediuConclusao, setMediuConclusao] = useState(false)
  const [email, setEmail] = useState('')
  const [envioEmail, setEnvioEmail] = useState<'parado' | 'enviando' | 'pronto' | 'erro'>('parado')

  const total = PERGUNTAS.length
  const acabou = respostas.length === total
  const acertos = respostas.filter((r, k) => r === PERGUNTAS[k].certa).length

  function evento(nome: string, extra?: Record<string, unknown>) {
    try {
      const w = window as unknown as { dataLayer?: unknown[] }
      w.dataLayer = w.dataLayer || []
      // Limpa as chaves voláteis antes: sem isso o event_id do Lead "gruda" no modelo de
      // dados do GTM e vaza para o evento seguinte (ex.: lead_email herdava o id e uma
      // tag que lesse o campo deduplicaria contra o Lead).
      w.dataLayer.push({ event_id: undefined, nivel: undefined, acertos: undefined })
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
      if (!mediuConclusao) {
        setMediuConclusao(true)
        const eventId = idEvento()
        evento('teste_nivel_concluido', { nivel: n, acertos, event_id: eventId })
        // Best-effort e sem await: medição nunca pode segurar a tela do resultado.
        try {
          fetch('/api/lead-meta', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ event_id: eventId, nivel: n }), keepalive: true,
          }).catch(() => {})
        } catch { /* medição é opcional; o teste tem que funcionar de qualquer jeito */ }
      }
    } else {
      setI(novas.length)
    }
  }

  function refazer() {
    setI(0); setRespostas([]); setEscolha(null)
  }

  // Guardar o e-mail é o ÚNICO jeito de falar de novo com quem faz o teste e não cria conta
  // na hora. Sem isso a pessoa some e o clique pago vai junto. É opcional de propósito: o
  // teste inteiro roda sem pedir nada, e recusar aqui não esconde resultado nem gabarito.
  async function guardarEmail(nivel: string) {
    if (envioEmail === 'enviando' || envioEmail === 'pronto') return
    setEnvioEmail('enviando')
    let attrib: unknown = null
    try { attrib = JSON.parse(localStorage.getItem('speakup_attrib') || 'null') } catch { /* sem atribuição não impede o contato */ }
    try {
      const r = await fetch('/api/lead-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nivel, acertos, attrib }),
      })
      // A rota responde 200 mesmo quando não grava (falta de credencial, teto por IP), para
      // não estourar erro na tela por causa de infraestrutura. Quem diz a verdade é o campo
      // "salvo" — sem ele daríamos "pronto" para um contato que se perdeu no caminho.
      const corpo = await r.json().catch(() => null)
      if (!r.ok || !corpo?.salvo) { setEnvioEmail('erro'); return }
      setEnvioEmail('pronto')
      evento('lead_email', { nivel })
    } catch {
      setEnvioEmail('erro')
    }
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
          Sem cadastro para responder. O resultado aparece na tela no fim.
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

        {/* A FALA VEM ANTES DO PEDIDO. Este é o único ponto do funil em que a pessoa
            experimenta o que o anúncio prometeu, e ela chega nele já tendo investido dois
            minutos. Não bloqueia nada: se o microfone for negado ou a rota estiver
            desligada, o componente some e o botão abaixo continua no lugar. */}
        <DemoFala nivel={r.nivel} onUsou={() => evento('demo_fala_usou', { nivel: r.nivel })} />

        <div style={{ background: `linear-gradient(160deg, #2E72D6, ${ESCURO})`, borderRadius: 16, padding: '22px 20px', color: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>Quer corrigir isso todo dia, a partir do {r.nivel}?</div>
          <div style={{ fontSize: 14.5, color: '#D6E6FA', lineHeight: 1.6, marginBottom: 18 }}>
            O professor de IA começa exatamente daqui, conversa com você e corrige sua pronúncia frase por frase — como agora, mas sem limite. {PRECO.diasGratis} dias grátis, sem cartão.
          </div>
          {/* O nível vai na URL para o cadastro guardar e o app começar a trilha dali.
              Sem isso a promessa "comece do seu nível" morre no formulário. */}
          <Link href={`/cadastro?nivel=${r.nivel}`} style={{ ...botao, display: 'inline-block' }} onClick={() => evento('teste_nivel_cta', { nivel: r.nivel })}>Continuar falando — {PRECO.diasGratis} dias grátis →</Link>
          <div style={{ fontSize: 12.5, color: '#BCD6F2', marginTop: 12 }}>Leva 20 segundos. Sem cartão.</div>
          {/* Os selos das lojas SAÍRAM daqui em 27/08. O tráfego desta página é pago e
              100% celular: mandar esse clique para a loja tira a pessoa da web (onde a
              conta nasce), joga o Android num app com 12 instalações e o iPhone numa
              folha de pagamento que pede cartão — o oposto do "sem cartão" prometido
              logo acima. Quem prefere a loja acha os selos no rodapé do site. */}
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
        {/* ÚLTIMO bloco da página, depois até do gabarito (mudou em 27/08). Antes ele
            ficava logo abaixo do botão de criar conta, com o título "Prefere não criar
            conta agora?" — ou seja, oferecia a saída no mesmo instante em que pedia a
            entrada, e com o mesmo peso visual. Continua existindo como rede para quem
            rolou a página inteira e mesmo assim não vai se cadastrar, mas agora só
            encontra quem já recusou tudo o que veio antes. */}
        <div style={{ border: '1px solid #E8ECF2', borderRadius: 16, padding: '18px 18px 16px', marginTop: 18, background: '#F9FBFE' }}>
          {envioEmail === 'pronto' ? (
            <div style={{ fontSize: 15, color: '#1B7A4B', fontWeight: 700 }}>
              Pronto ✅ Guardamos seu nível {r.nivel}. Você recebe o plano dos 7 primeiros dias no e-mail.
            </div>
          ) : (
            <>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: '#102A4C', marginBottom: 4 }}>Quer receber seu plano por e-mail também?</div>
              <div style={{ fontSize: 14, color: '#5B6B82', lineHeight: 1.6, marginBottom: 12 }}>
                Mandamos o plano dos 7 primeiros dias a partir do {r.nivel}. Você sai da lista quando quiser.
              </div>
              <form
                onSubmit={(e) => { e.preventDefault(); guardarEmail(r.nivel) }}
                style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
              >
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com" autoComplete="email"
                  style={{ flex: '1 1 200px', minWidth: 0, fontSize: 16, padding: '12px 14px', borderRadius: 12, border: '1px solid #D8E0EC', color: '#102A4C' }}
                />
                <button type="submit" disabled={envioEmail === 'enviando'} style={{ background: AZUL, color: '#fff', fontWeight: 700, fontSize: 15, padding: '12px 22px', borderRadius: 12, border: 'none', cursor: envioEmail === 'enviando' ? 'default' : 'pointer', opacity: envioEmail === 'enviando' ? 0.6 : 1 }}>
                  {envioEmail === 'enviando' ? 'Enviando…' : 'Receber por e-mail'}
                </button>
              </form>
              {envioEmail === 'erro' && (
                <div style={{ fontSize: 13.5, color: '#B54A3A', marginTop: 8 }}>Não deu para guardar agora. Confira o e-mail e tente de novo.</div>
              )}
            </>
          )}
        </div>

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
