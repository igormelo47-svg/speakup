'use client'

// Selos das lojas COM medição. Viraram componente de cliente por um motivo só: quando o
// download passou a ser a ação principal do site (10/08), quem baixa pela loja some da
// medição do Google Ads — o gclid não atravessa a Play Store. O evento `clique_loja` no
// dataLayer é o que devolve visibilidade: o gestor cria a tag no GTM e passa a contar
// quantos cliques pagos viram intenção de download, mesmo sem enxergar a instalação.
export const PLAY_URL = 'https://play.google.com/store/apps/details?id=app.vercel.speakup_dusky.twa'
export const APP_STORE_URL = 'https://apps.apple.com/br/app/vonai/id6788121941'

function medir(loja: 'play' | 'appstore') {
  try {
    const w = window as unknown as { dataLayer?: unknown[] }
    w.dataLayer = w.dataLayer || []
    w.dataLayer.push({ event: 'clique_loja', loja, pagina: window.location.pathname })
  } catch { /* medição nunca pode impedir o clique */ }
}

// target="_blank" é obrigatório: o navegador interno do Instagram/Facebook engole a
// navegação para domínio externo na mesma janela — o toque parece "morto" sem isso.
// `grande` = versão de hero (decisão de 10/08: induzir o download logo de cara).
function LojaBadge({ href, icone, acima, nome, loja, grande = false }: {
  href: string; icone: React.ReactNode; acima: string; nome: string; loja: 'play' | 'appstore'; grande?: boolean
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" onClick={() => medir(loja)}
      style={{ display: 'inline-flex', alignItems: 'center', gap: grande ? 12 : 10, background: '#000', color: '#fff', borderRadius: grande ? 14 : 12, padding: grande ? '13px 26px' : '10px 18px', textDecoration: 'none', border: grande ? '1px solid rgba(255,255,255,0.35)' : 'none' }}>
      <span style={{ transform: grande ? 'scale(1.25)' : 'none', display: 'inline-flex' }}>{icone}</span>
      <span style={{ textAlign: 'left', lineHeight: 1.15 }}>
        <span style={{ display: 'block', fontSize: grande ? 12 : 10.5, opacity: 0.85 }}>{acima}</span>
        <span style={{ display: 'block', fontSize: grande ? 20 : 16, fontWeight: 700 }}>{nome}</span>
      </span>
    </a>
  )
}

// Logo da Apple em SVG (path do Font Awesome Free/brands, CC BY 4.0) — emoji de maçã
// destoava e o  (U+F8FF) só renderiza em aparelhos Apple.
function AppleSvg() {
  return (
    <svg width="22" height="26" viewBox="0 0 384 512" aria-hidden="true">
      <path fill="#fff" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  )
}
function PlaySvg() {
  return (
    <svg width="22" height="24" viewBox="0 0 512 512" aria-hidden="true">
      <path fill="#34A853" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z" />
      <path fill="#4285F4" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z" />
      <path fill="#FBBC04" d="M472.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z" />
      <path fill="#EA4335" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
    </svg>
  )
}

export function PlayBadge({ grande = false }: { grande?: boolean } = {}) {
  return <LojaBadge href={PLAY_URL} icone={<PlaySvg />} acima="Disponível no" nome="Google Play" loja="play" grande={grande} />
}
export function AppStoreBadge({ grande = false }: { grande?: boolean } = {}) {
  return <LojaBadge href={APP_STORE_URL} icone={<AppleSvg />} acima="Baixar na" nome="App Store" loja="appstore" grande={grande} />
}
