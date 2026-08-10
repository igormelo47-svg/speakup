'use client'
import { useEffect, useState } from 'react'

// Link "Baixar o app" da navegação. Existe porque o dono conferiu o site e não achou
// como baixar: os selos ficavam só no rodapé, e ninguém rola até lá. Fica na nav, sempre
// visível, sem roubar o CTA principal (que segue sendo /cadastro — é ele que dispara a
// conversão que o Google Ads otimiza).
//
// A loja certa é decidida no cliente: iPhone/iPad vai pra App Store, o resto pro Google
// Play. No servidor renderiza o Play (maioria absoluta do tráfego brasileiro) para o
// link nunca aparecer vazio.
const PLAY = 'https://play.google.com/store/apps/details?id=app.vercel.speakup_dusky.twa'
const APP_STORE = 'https://apps.apple.com/br/app/vonai/id6788121941'

export default function BaixarApp({ escuro = false }: { escuro?: boolean }) {
  const [href, setHref] = useState(PLAY)
  useEffect(() => {
    try {
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) setHref(APP_STORE)
    } catch { /* sem userAgent, fica o Play */ }
  }, [])
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        color: escuro ? '#fff' : '#1E63C7', fontWeight: 600, fontSize: 15, textDecoration: 'none',
        border: `1px solid ${escuro ? 'rgba(255,255,255,0.4)' : '#C9D7EC'}`,
        borderRadius: 20, padding: '6px 14px', whiteSpace: 'nowrap',
      }}
    >
      📲 Baixar o app
    </a>
  )
}
