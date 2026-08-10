import { NextRequest, NextResponse } from 'next/server'

// Link inteligente de download: vonai.com.br/baixar manda cada aparelho para a sua
// loja. Existe para ter UM endereço só em QR code, bio do Instagram, vídeo e boca a
// boca — "entra em vonai.com.br/baixar" funciona em qualquer celular sem a pessoa
// precisar saber qual loja é a dela.
const PLAY = 'https://play.google.com/store/apps/details?id=app.vercel.speakup_dusky.twa'
const APP_STORE = 'https://apps.apple.com/br/app/vonai/id6788121941'

export function GET(req: NextRequest) {
  const ua = req.headers.get('user-agent') || ''
  const ios = /iPhone|iPad|iPod/i.test(ua)
  return NextResponse.redirect(ios ? APP_STORE : PLAY, 302)
}
