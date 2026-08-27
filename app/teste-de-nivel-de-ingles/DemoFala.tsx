'use client'
import { useEffect, useRef, useState } from 'react'
import { track } from '@vercel/analytics'

// A pessoa acabou de descobrir o nível dela. Antes de pedir qualquer cadastro, ela FALA
// uma frase e vê o que o professor entendeu. É a única tela do funil em que a promessa do
// anúncio ("destrave o inglês falado") e o que acontece de fato são a mesma coisa.
//
// Regra que rege este componente: nada aqui pode impedir a pessoa de chegar ao cadastro.
// Microfone negado, navegador velho, rota desligada, internet ruim — em todos os casos o
// componente some ou vira um aviso curto, e o botão de criar conta continua logo abaixo.

const AZUL = '#1E63C7'
const ESCURO = '#103D77'
const VERDE = '#16A34A'
const VERMELHO = '#B54A3A'

type Resultado = {
  frase: string; dica: string; ouvido: string; nota: number
  palavras: { p: string; ok: boolean }[]; faltaram: string[]
}

export default function DemoFala({ nivel, onUsou }: { nivel: string; onUsou?: () => void }) {
  const [frase, setFrase] = useState<{ texto: string; dica: string } | null>(null)
  const [disponivel, setDisponivel] = useState<boolean | null>(null)
  const [gravando, setGravando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [erro, setErro] = useState('')
  const [segundos, setSegundos] = useState(0)
  const recRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const pararRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Pergunta a frase ao servidor no GET (não gasta Whisper) e já descobre se a rota está
  // ligada. Se não estiver, o bloco inteiro some — melhor não existir do que existir quebrado.
  useEffect(() => {
    let vivo = true
    ;(async () => {
      try {
        const r = await fetch(`/api/demo-fala?nivel=${encodeURIComponent(nivel)}`)
        const j = await r.json()
        if (!vivo) return
        const temMic = typeof navigator !== 'undefined'
          && !!navigator.mediaDevices?.getUserMedia
          && typeof window !== 'undefined' && 'MediaRecorder' in window
        setDisponivel(!!j?.ligado && temMic)
        if (j?.frase) setFrase({ texto: j.frase, dica: j.dica })
      } catch { if (vivo) setDisponivel(false) }
    })()
    return () => { vivo = false }
  }, [nivel])

  useEffect(() => () => {
    if (pararRef.current) clearTimeout(pararRef.current)
    if (tickRef.current) clearInterval(tickRef.current)
    try { recRef.current?.stream?.getTracks().forEach(t => t.stop()) } catch {}
  }, [])

  function pararTudo() {
    if (pararRef.current) { clearTimeout(pararRef.current); pararRef.current = null }
    if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
    setSegundos(0)
    try { if (recRef.current?.state === 'recording') recRef.current.stop() } catch {}
  }

  async function gravar() {
    if (gravando) { pararTudo(); return }
    setErro(''); setResultado(null)
    try { track('demo_fala_iniciou', { nivel }) } catch {}
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      // Permissão negada não é erro do produto: a pessoa segue para o cadastro normalmente.
      setErro('Precisamos do microfone para ouvir você. Você pode continuar sem isso.')
      return
    }
    // O tipo suportado varia (Safari só grava mp4/aac). Deixar o navegador escolher e
    // MANDAR o tipo real no header evita o Whisper recusar o arquivo.
    const tipos = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']
    const tipo = tipos.find(t => { try { return MediaRecorder.isTypeSupported(t) } catch { return false } })
    let rec: MediaRecorder
    try {
      rec = new MediaRecorder(stream, tipo ? { mimeType: tipo } : undefined)
    } catch {
      stream.getTracks().forEach(t => t.stop())
      setErro('Seu navegador não deixou gravar. Você pode continuar sem isso.')
      return
    }
    chunksRef.current = []
    recRef.current = rec
    rec.ondataavailable = e => { if (e.data?.size) chunksRef.current.push(e.data) }
    rec.onstop = async () => {
      stream.getTracks().forEach(t => t.stop())
      setGravando(false)
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' })
      if (blob.size < 1000) { setErro('Não consegui ouvir. Fale mais perto do microfone.'); return }
      setEnviando(true)
      try {
        const r = await fetch('/api/demo-fala', {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream', 'x-audio-type': rec.mimeType || 'audio/webm', 'x-nivel': nivel },
          body: await blob.arrayBuffer(),
        })
        const j = await r.json().catch(() => ({}))
        if (!r.ok || !j?.ok) {
          setErro(
            r.status === 429 ? 'Você já testou algumas vezes por aqui. Crie a conta para falar sem limite.'
            : j?.error === 'nao_ouvi' ? 'Não consegui entender o áudio. Tente de novo num lugar mais silencioso.'
            : 'Não deu para analisar agora. Você pode continuar sem isso.'
          )
          return
        }
        setResultado(j as Resultado)
        try { track('demo_fala_resultado', { nivel, nota: j.nota }) } catch {}
        onUsou?.()
      } catch {
        setErro('Sem conexão para analisar agora. Você pode continuar sem isso.')
      } finally { setEnviando(false) }
    }
    rec.start()
    setGravando(true); setSegundos(0)
    tickRef.current = setInterval(() => setSegundos(s => s + 1), 1000)
    // Teto de 6s: frase curta, arquivo pequeno, custo previsível — e ninguém deixa gravando.
    pararRef.current = setTimeout(() => pararTudo(), 6000)
  }

  if (disponivel === false) return null
  if (disponivel === null || !frase) {
    return <div style={{ height: 8 }} />
  }

  const botao: React.CSSProperties = {
    width: '100%', padding: '15px 20px', borderRadius: 14, border: 'none', cursor: 'pointer',
    fontSize: 16, fontWeight: 800, fontFamily: 'inherit', display: 'flex',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  }

  return (
    <div style={{ border: `1.5px solid ${AZUL}`, borderRadius: 18, padding: '20px 18px', marginBottom: 20, background: '#F7FAFF' }}>
      <div style={{ fontSize: 12.5, fontWeight: 800, color: AZUL, letterSpacing: 0.6, marginBottom: 6 }}>
        AGORA A PARTE QUE IMPORTA
      </div>
      <div style={{ fontSize: 19, fontWeight: 800, color: '#102A4C', lineHeight: 1.3, marginBottom: 6 }}>
        Você acertou a gramática. Mas e na hora de falar?
      </div>
      <div style={{ fontSize: 14.5, color: '#5B6B82', lineHeight: 1.6, marginBottom: 16 }}>
        Leia esta frase em voz alta. Em 5 segundos você vê exatamente o que um falante de inglês entenderia.
        Sem cadastro, sem cartão.
      </div>

      <div style={{ background: '#fff', border: '1px solid #DCE6F3', borderRadius: 14, padding: '16px 18px', marginBottom: 14 }}>
        <div style={{ fontSize: 21, fontWeight: 700, color: '#102A4C', lineHeight: 1.4 }}>“{frase.texto}”</div>
      </div>

      {!resultado && (
        <button
          onClick={gravar}
          disabled={enviando}
          style={{
            ...botao,
            background: gravando ? VERMELHO : `linear-gradient(135deg, #2E72D6, ${ESCURO})`,
            color: '#fff', opacity: enviando ? 0.7 : 1,
          }}
        >
          {enviando ? 'Ouvindo você…'
            : gravando ? `● Gravando… ${segundos}s — toque para parar`
            : '🎤 Falar agora'}
        </button>
      )}

      {erro && (
        <div style={{ fontSize: 13.5, color: VERMELHO, marginTop: 12, lineHeight: 1.55 }}>{erro}</div>
      )}

      {resultado && (
        <div style={{ marginTop: 4 }}>
          <div style={{ background: '#fff', border: '1px solid #DCE6F3', borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#7C8AA0', letterSpacing: 0.5, marginBottom: 8 }}>
              O QUE O PROFESSOR OUVIU
            </div>
            <div style={{ fontSize: 18, lineHeight: 1.7, marginBottom: 12, overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
              {resultado.palavras.map((w, k) => (
                <span key={k} style={{
                  color: w.ok ? '#16212C' : VERMELHO,
                  fontWeight: w.ok ? 500 : 800,
                  textDecoration: w.ok ? 'none' : 'underline wavy',
                  textUnderlineOffset: 4,
                  marginRight: 7,
                  display: 'inline-block',
                }}>{w.p}</span>
              ))}
            </div>
            <div style={{ fontSize: 13.5, color: '#5B6B82', lineHeight: 1.6, overflowWrap: 'anywhere' }}>
              Transcrição do seu áudio: <b style={{ color: '#102A4C' }}>“{resultado.ouvido}”</b>
            </div>
          </div>

          <div style={{
            background: resultado.nota >= 85 ? '#E9F7EF' : '#FFF6E5',
            border: `1px solid ${resultado.nota >= 85 ? '#BFE5CE' : '#F3DFB0'}`,
            borderRadius: 14, padding: '14px 16px', marginBottom: 14,
          }}>
            <div style={{ fontSize: 15.5, fontWeight: 800, color: resultado.nota >= 85 ? VERDE : '#8A6100', marginBottom: 4 }}>
              {resultado.nota >= 85
                ? `${resultado.nota}% — entenderam você.`
                : resultado.nota === 0
                  ? 'Nada da frase chegou.'
                  : `${resultado.nota}% — parte da frase se perdeu.`}
            </div>
            <div style={{ fontSize: 14, color: '#5B6B82', lineHeight: 1.6 }}>
              {resultado.faltaram.length > 0
                ? <>Não chegou: <b style={{ color: VERMELHO }}>{resultado.faltaram.join(', ')}</b>. {resultado.dica}</>
                : <>{resultado.dica} É exatamente esse tipo de detalhe que o professor corrige em cada frase sua.</>}
            </div>
          </div>

          <button onClick={() => { setResultado(null); setErro('') }}
            style={{ ...botao, background: '#fff', color: AZUL, border: `1px solid ${AZUL}`, fontSize: 14.5, padding: '11px 18px' }}>
            🎤 Tentar de novo
          </button>
        </div>
      )}
    </div>
  )
}
