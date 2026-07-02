import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  metadataBase: new URL('https://speakup-dusky.vercel.app'),
  title: 'Vonai — Aprenda inglês com IA',
  description: 'Aprenda inglês de verdade, todo dia, com um professor de IA: trilha do A1 ao C2, conversação, vocabulário e pronúncia. Comece grátis.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Vonai',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Vonai',
    url: 'https://speakup-dusky.vercel.app',
    title: 'Vonai — Aprenda inglês com IA',
    description: 'Um professor de IA que lembra de você e monta seu plano diário. Do A1 ao C2. Comece grátis.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Vonai — aprenda inglês com IA' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vonai — Aprenda inglês com IA',
    description: 'Um professor de IA que lembra de você e monta seu plano diário. Do A1 ao C2. Comece grátis.',
    images: ['/og.png'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#185FA5',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Vonai" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#f5f5f5' }}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}