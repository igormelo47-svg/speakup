import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Transcrição de fala (STT) para o treino de pronúncia. Usa o Whisper da OpenAI quando
// OPENAI_API_KEY estiver configurada na Vercel — reconhecimento muito melhor que o do
// navegador, principalmente para sotaque brasileiro. Sem a chave, responde 501 e o app
// continua usando o reconhecimento do navegador (Web Speech).
// Corpo da requisição: o áudio cru (webm/mp4), até ~1,5 MB (frases curtas).

// Tetos diários por usuário e por IP + estimativa de custo do Whisper (clipes ≤15s).
// Rede de segurança, não limite de produto: 150 tentativas de fala/dia são ~25 lições
// falando cada frase, muito acima do uso real. Ver a mesma conta de margem em chat/route.ts.
const STT_FREE = 40
const STT_PREMIUM = 150
const LIMIT_IP = 1500
const CUSTO_STT = 0.0012

export async function POST(req: NextRequest) {
  // trim(): valor com quebra de linha (colado no painel/CLI) invalidaria o header Authorization.
  const key = (process.env.OPENAI_API_KEY || '').trim()
  if (!key) return NextResponse.json({ error: 'stt_nao_configurado' }, { status: 501 })

  // Só usuários logados (mesmo esquema das rotas de chat/tts).
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  if (!token || !url || !anon || !service) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  let userId = ''
  try {
    const sb = createClient(url, anon)
    const { data, error } = await sb.auth.getUser(token)
    if (error || !data?.user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    userId = data.user.id
  } catch {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const buf = await req.arrayBuffer()
  // Vazio/minúsculo = sonda do cliente testando se a rota está configurada → 400 (configurada, áudio inválido).
  // A sonda responde ANTES da checagem de limite para não queimar cota do aluno.
  if (!buf || buf.byteLength < 1000) return NextResponse.json({ error: 'audio_pequeno' }, { status: 400 })
  if (buf.byteLength > 1_500_000) return NextResponse.json({ error: 'audio_grande' }, { status: 413 })

  // Limite diário ATÔMICO + teto por IP. Fail-closed: sem verificação, sem gasto
  // (o app cai no reconhecimento do navegador e o treino continua).
  const admin = createClient(url, service)
  try {
    const ip = (req.headers.get('x-forwarded-for') || 'sem-ip').split(',')[0].trim()
    const [{ data: prog }, { data: perfil }] = await Promise.all([
      admin.from('progresso').select('is_premium, premium_expira').eq('user_id', userId).maybeSingle(),
      admin.from('profiles').select('trial_expira').eq('id', userId).maybeSingle(),
    ])
    const emTrial = !!perfil?.trial_expira && new Date(perfil.trial_expira) > new Date()
    const pagoAtivo = !!prog?.is_premium && (!prog?.premium_expira || new Date(prog.premium_expira) > new Date())
    // Paywall duro no servidor: free não tem STT (o app cai no reconhecimento do navegador).
    if (!pagoAtivo && !emTrial) return NextResponse.json({ error: 'premium_necessario' }, { status: 402 })
    const limite = STT_PREMIUM
    const [{ data: okUser, error: e1 }, { data: okIp, error: e2 }] = await Promise.all([
      admin.rpc('incrementa_uso', { p_user: userId, p_tipo: 'stt', p_limite: limite }),
      admin.rpc('incrementa_ip', { p_ip: ip, p_limite: LIMIT_IP }),
    ])
    if (e1 || e2) throw new Error('rpc_falhou')
    if (okUser === false || okIp === false) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  } catch {
    return NextResponse.json({ error: 'stt_indisponivel' }, { status: 503 })
  }

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
  // Registro de custo (estimativa) — best-effort.
  try { admin.rpc('registra_custo', { p_user: userId, p_custo: CUSTO_STT }).then(() => {}) } catch {}
  const data = await r.json()
  return NextResponse.json({ text: String(data.text || '').trim() })
}
