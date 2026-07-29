import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { Nunito } from 'next/font/google'
import './globals.css'

// Fonte própria do app: arredondada e simpática (mesma família visual do Duolingo).
const nunito = Nunito({ subsets: ['latin'], weight: ['400', '600', '700', '800'], variable: '--font-nunito', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL('https://vonai.com.br'),
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
    url: 'https://vonai.com.br',
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
  verification: {
    google: '889dl3fbY28e5dqm4MdDBvIvll22ardXNlYJCag3zuU',
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
    <html lang="pt-BR" className={nunito.variable}>
      <head>
        {/* Google Tag Manager — o gestor de tráfego opera tags/GA4 por aqui */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-N5794SWR');`,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Vonai" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N5794SWR"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
        <Analytics />
      </body>
    </html>
  )
}