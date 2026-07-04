import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Transcrição de fala (STT) para o treino de pronúncia. Usa o Whisper da OpenAI quando
// OPENAI_API_KEY estiver configurada na Vercel — reconhecimento muito melhor que o do
// navegador, principalmente para sotaque brasileiro. Sem a chave, responde 501 e o app
// continua usando o reconhecimento do navegador (Web Speech).
// Corpo da requisição: o áudio cru (webm/mp4), até ~1,5 MB (frases curtas).

export async function POST(req: NextRequest) {
  // trim(): valor com quebra de linha (colado no painel/CLI) invalidaria o header Authorization.
  const key = (process.env.OPENAI_API_KEY || '').trim()
  if (!key) return NextResponse.json({ error: 'stt_nao_configurado' }, { status: 501 })

  // Só usuários logados (mesmo esquema das rotas de chat/tts).
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token || !url || !anon) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const sb = createClient(url, anon)
    const { data, error } = await sb.auth.getUser(token)
    if (error || !data?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const buf = await req.arrayBuffer()
  // Vazio/minúsculo = sonda do cliente testando se a rota está configurada → 400 (configurada, áudio inválido).
  if (!buf || buf.byteLength < 1000) return NextResponse.json({ error: 'audio_pequeno' }, { status: 400 })
  if (buf.byteLength > 1_500_000) return NextResponse.json({ error: 'audio_grande' }, { status: 413 })

  const mime = req.headers.get('x-audio-type') || 'audio/webm'
  const nome = mime.includes('mp4') ? 'audio.mp4' : mime.includes('ogg') ? 'audio.ogg' : 'audio.webm'
  const fd = new FormData()
  fd.append('file', new Blob([buf], { type: mime }), nome)
  fd.append('model', 'whisper-1')
  fd.append('language', 'en')

  let r: Response
  try {
    r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: fd,
    })
  } catch {
    return NextResponse.json({ error: 'stt_falhou' }, { status: 502 })
  }
  if (!r.ok) return NextResponse.json({ error: 'stt_falhou' }, { status: 502 })
  const data = await r.json()
  return NextResponse.json({ text: String(data.text || '').trim() })
}
