'use client'
import { useEffect, useState, CSSProperties } from 'react'

// Botão "Instalar o app" (PWA). No Android/Chrome instala com 1 toque via
// beforeinstallprompt. No iPhone (que não tem esse evento) mostra a instrução
// do Safari. Some sozinho se o app já estiver instalado.
export default function InstallButton({ dark = false }: { dark?: boolean }) {
  const [deferred, setDeferred] = useState<any>(null)
  const [installed, setInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    try {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true
      if (standalone) { setInstalled(true); return }
      setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent))
    } catch (e) {}
    if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(() => {}) }
    const onPrompt = (e: any) => { e.preventDefault(); setDeferred(e) }
    const onInstalled = () => { setInstalled(true); setDeferred(null) }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed) return null

  async function clicar() {
    if (deferred) {
      deferred.prompt()
      try { await deferred.userChoice } catch (e) {}
      setDeferred(null)
      return
    }
    setShowHelp(v => !v)
  }

  const btnStyle: CSSProperties = dark
    ? { background: '#fff', color: '#103D77' }
    : { background: '#185FA5', color: '#fff' }

  return (
    <div style={{ marginTop: 14 }}>
      <button onClick={clicar} style={{ width: '100%', padding: '13px 18px', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', ...btnStyle }}>
        <span style={{ fontSize: 18 }}>📲</span> Instalar o app
      </button>
      {showHelp && (
        <div style={{ marginTop: 8, fontSize: 12.5, lineHeight: 1.55, color: dark ? '#EAF2FC' : '#5B6B82', background: dark ? 'rgba(255,255,255,0.12)' : '#F2F5F8', borderRadius: 10, padding: '10px 12px' }}>
          {isIOS
            ? <>No iPhone/iPad: abra este site no <b>Safari</b>, toque em <b>Compartilhar</b> (o quadrado com a setinha ↑) e escolha <b>“Adicionar à Tela de Início”</b>.</>
            : <>Abra este site no <b>Chrome</b> e toque no menu <b>⋮</b> (canto superior direito) → <b>“Instalar app”</b>.</>}
        </div>
      )}
    </div>
  )
}
