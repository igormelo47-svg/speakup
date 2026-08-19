import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Voz neural para o app (Professor IA, Simulador, lições, dicionário).
// Usa a OpenAI (gpt-4o-mini-tts) quando OPENAI_API_KEY estiver configurada na Vercel.
// Sem a chave, responde 501 e o app usa a voz do navegador — nada quebra.
// Custo controlado: exige login, frases curtas (≤290 chars) e o cliente cacheia
// cada frase localmente (Cache API), então cada texto só é gerado uma vez por aparelho.

// Tetos diários por usuário (o cache do cliente faz cada frase custar uma vez só, então
// o teto só conta FRASES NOVAS — reouvir o que já tocou hoje não gasta cota).
// Rede de segurança, não limite de produto. Ver a conta de margem em chat/route.ts.
// Sem trial/assinatura não tem TTS (402 abaixo; o app cai na voz do navegador, nada quebra).
const TTS_PREMIUM = 350
const LIMIT_IP = 2000
// Estimativa de custo por chamada do gpt-4o-mini-tts (frase curta ≈ US$0,0015).
const CUSTO_TTS = 0.0015

export async function POST(req: NextRequest) {
  // trim(): valor com quebra de linha (colado no painel/CLI) invalidaria o header Authorization.
  const key = (process.env.OPENAI_API_KEY || '').trim()
  if (!key) return NextResponse.json({ error: 'tts_nao_configurado' }, { status: 501 })

  // Só usuários logados podem gastar a API (mesmo esquema da rota de chat).
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

  let text = ''
  let lang = 'en'
  try {
    const body = await req.json()
    text = String(body?.text || '').trim()
    // 'pt' = voz do Vô (mascote) em português. Antes o Vô usava o sintetizador do aparelho
    // (robótico/lento no Android e no Windows) — a queixa "voz feia e artificial" no onboarding.
    if (body?.lang === 'pt') lang = 'pt'
  } catch {}
  if (!text || text.length > 290) return NextResponse.json({ error: 'texto inválido' }, { status: 400 })

  // Limite diário ATÔMICO + teto por IP. Fail-closed: sem verificação, sem gasto
  // (o app cai na voz do navegador e nada quebra para o aluno).
  const admin = createClient(url, service)
  try {
    const ip = (req.headers.get('x-forwarded-for') || 'sem-ip').split(',')[0].trim()
    const [{ data: prog }, { data: perfil }] = await Promise.all([
      admin.from('progresso').select('is_premium, premium_expira').eq('user_id', userId).maybeSingle(),
      admin.from('profiles').select('trial_expira').eq('id', userId).maybeSingle(),
    ])
    const emTrial = !!perfil?.trial_expira && new Date(perfil.trial_expira) > new Date()
    const pagoAtivo = !!prog?.is_premium && (!prog?.premium_expira || new Date(prog.premium_expira) > new Date())
    // Paywall duro no servidor: sem trial/assinatura não há TTS (o app cai na voz do navegador, nada quebra).
    if (!pagoAtivo && !emTrial) return NextResponse.json({ error: 'premium_necessario' }, { status: 402 })
    const limite = TTS_PREMIUM
    const [{ data: okUser, error: e1 }, { data: okIp, error: e2 }] = await Promise.all([
      admin.rpc('incrementa_uso', { p_user: userId, p_tipo: 'tts', p_limite: limite }),
      admin.rpc('incrementa_ip', { p_ip: ip, p_limite: LIMIT_IP }),
    ])
    if (e1 || e2) throw new Error('rpc_falhou')
    if (okUser === false || okIp === false) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  } catch {
    return NextResponse.json({ error: 'tts_indisponivel' }, { status: 503 })
  }

  let r: Response
  try {
    r = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(
        lang === 'pt'
          // Vô em português: voz quente e natural, ritmo de conversa (não de locutor).
          ? { model: 'gpt-4o-mini-tts', voice: 'nova', input: text, response_format: 'mp3', speed: 1.0, instructions: 'Fale em português do Brasil, com sotaque brasileiro natural. Tom caloroso, simpático e encorajador, como um professor particular conversando. Ritmo normal de fala, sem pausas longas.' }
          : { model: 'gpt-4o-mini-tts', voice: 'nova', input: text, response_format: 'mp3', speed: 0.95 }
      ),
    })
  } catch {
    return NextResponse.json({ error: 'tts_falhou' }, { status: 502 })
  }
  if (!r.ok || !r.body) return NextResponse.json({ error: 'tts_falhou' }, { status: 502 })

  // Registro de custo (estimativa) — best-effort.
  try { admin.rpc('registra_custo', { p_user: userId, p_custo: CUSTO_TTS }).then(() => {}) } catch {}

  return new NextResponse(r.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      // Imutável: o mesmo texto sempre gera o mesmo áudio — o navegador/CDN pode guardar 1 ano.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
