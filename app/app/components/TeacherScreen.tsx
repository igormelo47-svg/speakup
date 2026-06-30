'use client'

import { useRef, useState, type ReactElement } from 'react'

type Msg = { role: 'ai' | 'user'; text: string }

type IcProps = { e?: string; s?: number | string; c?: string }

export default function TeacherScreen({ Ic }: { Ic: (props: IcProps) => ReactElement }) {
  const blue = '#185FA5'
  const blueDark = '#0C447C'
  const blueLight = '#E6F1FB'

  const [chatMsgs, setChatMsgs] = useState<Msg[]>([{ role: 'ai', text: 'Olá! Sou seu professor de inglês com IA. Pode me perguntar sobre gramática, vocabulário ou praticar conversação. Como posso ajudar?' }])
  const [chatInput, setChatInput] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const [listening, setListening] = useState(false)
  const [speakingId, setSpeakingId] = useState(-1)
  const recognitionRef = useRef<any>(null)

  function speakEN(text: string, id: number) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    if (speakingId === id) { setSpeakingId(-1); return }
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'en-US'; u.rate = 0.95
    const vs = window.speechSynthesis.getVoices()
    const enV = vs.find(v => /en[-_]US/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang))
    if (enV) u.voice = enV
    u.onend = () => setSpeakingId(-1)
    setSpeakingId(id)
    window.speechSynthesis.speak(u)
  }

  function falarIngles(text: string, id: number) {
    let t = text.replace(/\*\*/g, '').replace(/\*/g, '')
    const quoted = (t.match(/["“”]([^"“”]+)["“”]/g) || []).map(s => s.replace(/["“”]/g, '').trim()).filter(Boolean)
    if (quoted.length) { speakEN(quoted.join('. '), id); return }
    const ptChars = /[ãõçáéíóúâêôàü]/i
    const ptWords = /\b(voce|que|para|obrigad|desculp|portugu|ola|estou|muito|como|pode|sobre|isso|aqui|agora|frase|exemplo|significa|quando|porque|tambem|vai|nao|sim|mais|fazer|certo|usou|seu|sua|sua|você)\b/i
    const chunks = t.split(/[.!?\n]|\s-\s/).map(s => s.trim()).filter(Boolean)
    const eng = chunks.filter(s => /[a-z]/i.test(s) && !ptChars.test(s) && !ptWords.test(s))
    speakEN(eng.length ? eng.join('. ') : t, id)
  }

  function micChat() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { alert('Seu navegador não suporta voz. Tente o Chrome no Android ou no computador. 🎤'); return }
    if (listening) { recognitionRef.current?.stop(); return }
    const base = chatInput ? chatInput + ' ' : ''
    let finalText = ''
    const rec = new SR()
    rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = true; rec.maxAlternatives = 1
    rec.onresult = (e: any) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += t + ' '; else interim += t
      }
      setChatInput((base + finalText + interim).trim())
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recognitionRef.current = rec
    setListening(true)
    rec.start()
  }

  async function sendChat() {
    if (!chatInput.trim() || loadingChat) return
    const msg = chatInput; setChatInput('')
    setChatMsgs(m => [...m, { role: 'user', text: msg }]); setLoadingChat(true)
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ system: 'Você é um professor de inglês simpático e paciente para brasileiros. Responda sempre em português com exemplos em inglês traduzidos. Máximo 4 linhas por resposta.', messages: [{ role: 'user', content: msg }] }) })
      const data = await res.json()
      setChatMsgs(m => [...m, { role: 'ai', text: data.content?.[0]?.text || 'Erro.' }])
    } catch {
      setChatMsgs(m => [...m, { role: 'ai', text: 'Erro de conexão. Tente novamente.' }])
    }
    setLoadingChat(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-background-secondary)' }}>
      <div style={{ background: `linear-gradient(135deg, #2074C0, ${blueDark})`, padding: '16px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic e="👨‍🏫" s={24} c={blue} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#fff' }}>Professor de IA</div>
          <div style={{ fontSize: 12, color: '#B5D4F4', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />Online · responde na hora</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto' }}>
        {chatMsgs.length <= 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 4 }}>
            {['Como me apresentar?', 'Since vs for', 'Present Perfect', 'Phrasal verbs'].map(t => (
              <button key={t} onClick={() => setChatInput(t)} style={{ padding: '8px 14px', border: 'none', borderRadius: 20, background: blueLight, color: blueDark, fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>{t}</button>
            ))}
          </div>
        )}
        {chatMsgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
            {m.role === 'ai' && <div style={{ width: 30, height: 30, borderRadius: '50%', background: blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic e="👨‍🏫" s={18} c={blue} /></div>}
            <div style={{ minWidth: 0 }}>
              <div style={{ padding: '11px 15px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', fontSize: 14, lineHeight: 1.6, background: m.role === 'user' ? `linear-gradient(135deg, #2074C0, #185FA5)` : 'var(--color-background-primary)', color: m.role === 'user' ? '#fff' : 'var(--color-text-primary)', border: m.role === 'ai' ? '0.5px solid var(--color-border-tertiary)' : 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>{m.text}</div>
              {m.role === 'ai' && <button onClick={() => falarIngles(m.text, 1000 + i)} style={{ marginTop: 6, marginLeft: 2, background: speakingId === 1000 + i ? blue : 'var(--color-background-primary)', color: speakingId === 1000 + i ? '#fff' : blue, border: speakingId === 1000 + i ? 'none' : `1px solid ${blueLight}`, borderRadius: 20, padding: '5px 13px', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>{speakingId === 1000 + i ? <><Ic e="⏸️" /> Parar</> : <><Ic e="🔊" /> Ouvir em inglês</>}</button>}
            </div>
          </div>
        ))}
        {loadingChat && (
          <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-start', alignItems: 'flex-end' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: blueLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic e="👨‍🏫" s={18} c={blue} /></div>
            <div style={{ padding: '14px 16px', borderRadius: '18px 18px 18px 4px', background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', display: 'flex', gap: 5, alignItems: 'center' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CB4CC', display: 'inline-block', animation: 'su_dot 1.2s infinite' }} />
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CB4CC', display: 'inline-block', animation: 'su_dot 1.2s infinite 0.2s' }} />
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#9CB4CC', display: 'inline-block', animation: 'su_dot 1.2s infinite 0.4s' }} />
            </div>
          </div>
        )}
      </div>
      <div style={{ padding: '10px 12px', borderTop: '0.5px solid var(--color-border-tertiary)', background: 'var(--color-background-primary)', display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <button onClick={micChat} style={{ width: 44, height: 44, background: listening ? '#E24B4A' : blueLight, color: listening ? '#fff' : blue, border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', animation: listening ? 'su_pulse 1.2s infinite' : 'none' }}><Ic e={listening ? '⏹️' : '🎤'} /></button>
        <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChat()} placeholder={listening ? '🎙️ Gravando... toque ⏹️ para parar' : 'Digite ou fale...'} style={{ flex: 1, padding: '11px 14px', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 22, fontSize: 14, background: 'var(--color-background-secondary)', color: 'var(--color-text-primary)', fontFamily: 'inherit' }} />
        <button onClick={sendChat} disabled={loadingChat} style={{ width: 44, height: 44, background: blue, color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: 18, fontWeight: 500, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loadingChat ? 0.5 : 1 }}><Ic e="→" /></button>
      </div>
    </div>
  )
}