import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Voz neural para o app (Professor IA, Simulador, lições, dicionário).
// Usa a OpenAI (gpt-4o-mini-tts) quando OPENAI_API_KEY estiver configurada na Vercel.
// Sem a chave, responde 501 e o app usa a voz do navegador — nada quebra.
// Custo controlado: exige login, frases curtas (≤290 chars) e o cliente cacheia
// cada frase localmente (Cache API), então cada texto só é gerado uma vez por aparelho.

export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY
  if (!key) return NextResponse.json({ error: 'tts_nao_configurado' }, { status: 501 })

  // Só usuários logados podem gastar a API (mesmo esquema da rota de chat).
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

  let text = ''
  try { text = String((await req.json())?.text || '').trim() } catch {}
  if (!text || text.length > 290) return NextResponse.json({ error: 'texto inválido' }, { status: 400 })

  const r = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-4o-mini-tts', voice: 'nova', input: text, response_format: 'mp3', speed: 0.95 }),
  })
  if (!r.ok || !r.body) return NextResponse.json({ error: 'tts_falhou' }, { status: 502 })

  return new NextResponse(r.body, {
    headers: {
      'Content-Type': 'audio/mpeg',
      // Imutável: o mesmo texto sempre gera o mesmo áudio — o navegador/CDN pode guardar 1 ano.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
