import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const word = req.nextUrl.searchParams.get('q')
  if (!word) return NextResponse.json({ url: null })
  const key = process.env.PIXABAY_API_KEY
  const res = await fetch(`https://pixabay.com/api/?key=${key}&q=${encodeURIComponent(word)}&image_type=photo&per_page=3&safesearch=true&lang=en`)
  const data = await res.json()
  const url = data.hits?.[0]?.webformatURL || null
  return NextResponse.json({ url })
}
