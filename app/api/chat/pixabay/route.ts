import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get('q')
  const key = process.env.PIXABAY_API_KEY
  if (!word || !key) return NextResponse.json({ url: null })
  try {
    const res = await fetch(`https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(word)}&image_type=photo&per_page=3&safesearch=true&lang=en`)
    if (!res.ok) return NextResponse.json({ url: null })
    const data = await res.json()
    return NextResponse.json({ url: data.hits?.[0]?.webformatURL || null })
  } catch {
    return NextResponse.json({ url: null })
  }
}
