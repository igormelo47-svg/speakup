import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SpeakUp — Aprenda inglês com IA',
  description: 'Aprenda inglês com lições, vocabulário e professor de IA disponível 24h',
  manifest: '/manifest.json',
  themeColor: '#185FA5',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SpeakUp',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
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
        <meta name="apple-mobile-web-app-title" content="SpeakUp" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="theme-color" content="#185FA5" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#f5f5f5' }}>
        {children}
      </body>
    </html>
  )
}