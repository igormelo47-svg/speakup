'use client'
import { useEffect } from 'react'
import { funil, EV } from '../lib/funil'

// Captura de atribuição de PRIMEIRO TOQUE. Em TWA/WebView o identificador de clique do
// anúncio (gclid/fbclid) se perde entre o clique e a conversão — que acontece dias depois,
// quando o trial vira assinatura. Guardamos gclid/fbclid/UTMs no primeiro acesso (o primeiro
// toque vence: não sobrescreve) para reenviar junto do evento de conversão e não creditar a
// venda como "tráfego direto". Pedido do gestor de tráfego. Chave: speakup_attrib.
const CAMPOS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']

export default function Attribution() {
  // Primeiro degrau do funil: a VISITA. Fica aqui porque este componente já está no layout
  // raiz, ou seja, em toda página pública — e porque ele já é o lugar onde a origem do
  // clique é resolvida. Uma vez por pessoa (anon_id), não uma por página: o degrau é
  // "chegou ao Vonai", e contar pageview aqui inflaria o topo e faria toda taxa de
  // conversão abaixo parecer pior do que é.
  useEffect(() => {
    try {
      funil(EV.VISITA, { pagina: (window.location.pathname || '/').slice(0, 120) }, { umaVez: true })
    } catch (e) {}
  }, [])

  useEffect(() => {
    try {
      if (localStorage.getItem('speakup_attrib')) return // primeiro toque já registrado
      const p = new URLSearchParams(window.location.search)
      const dados: Record<string, string> = {}
      for (const c of CAMPOS) { const v = p.get(c); if (v) dados[c] = v.slice(0, 512) }
      // Só grava se veio de um clique rastreável (tem algum parâmetro) — evita marcar
      // visita orgânica/direta como se fosse de campanha.
      if (Object.keys(dados).length === 0) return
      dados.landing = (window.location.pathname || '/').slice(0, 200)
      dados.referrer = (document.referrer || '').slice(0, 200)
      dados.ts = new Date().toISOString()
      localStorage.setItem('speakup_attrib', JSON.stringify(dados))
    } catch (e) {}
  }, [])
  return null
}
