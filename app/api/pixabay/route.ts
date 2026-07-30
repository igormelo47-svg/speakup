import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Proxy de imagens da Pixabay (a chave fica no servidor). Sem login — mas com teto por IP,
// senão qualquer site usa o vonai.com.br como proxy grátis e estoura o rate limit da chave
// (100 req/min no plano grátis da Pixabay), quebrando as imagens para alunos reais.
export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get('q')
  const key = process.env.PIXABAY_API_KEY
  if (!word || !key) return NextResponse.json({ url: null })

  const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (sbUrl && service) {
    try {
      const admin = createClient(sbUrl, service)
      const ip = (req.headers.get('x-forwarded-for') || 'sem-ip').split(',')[0].trim()
      const { data: ok, error } = await admin.rpc('incrementa_ip', { p_ip: ip, p_limite: 300 })
      if (error || ok === false) return NextResponse.json({ url: null })
    } catch {
      return NextResponse.json({ url: null }) // fail-closed: sem verificação, sem gasto da chave
    }
  }

  try {
    const res = await fetch(`https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(word)}&image_type=photo&per_page=3&safesearch=true&lang=en`)
    if (!res.ok) return NextResponse.json({ url: null })
    const data = await res.json()
    return NextResponse.json({ url: data.hits?.[0]?.webformatURL || null })
  } catch {
    return NextResponse.json({ url: null })
  }
}
