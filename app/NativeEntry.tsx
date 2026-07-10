'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

// Dentro do app nativo (Capacitor), a landing de marketing é redundante — quem baixou
// já decidiu. Então: app + logado → vai pro /app (home); app + deslogado → vai pro
// cadastro (/login?novo=1). No navegador este componente não faz nada (a landing aparece).
export default function NativeEntry() {
  const [redirecionando, setRedirecionando] = useState(false)

  useEffect(() => {
    const isNative = !!(window as any).Capacitor?.isNativePlatform?.()
    if (!isNative) return
    setRedirecionando(true)
    supabase.auth.getSession().then(({ data }) => {
      window.location.replace(data.session ? '/app' : '/login?novo=1')
    }).catch(() => window.location.replace('/login?novo=1'))
  }, [])

  if (!redirecionando) return null
  // Splash na cor da marca cobre a landing enquanto o app decide pra onde ir.
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'linear-gradient(160deg, #2E72D6, #103D77)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 30, fontWeight: 800, color: '#fff' }}>
        Von<span style={{ background: '#FFD98A', color: '#7A5A12', padding: '1px 9px', borderRadius: 9 }}>ai</span>
      </span>
    </div>
  )
}
