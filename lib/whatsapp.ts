// Envio de WhatsApp pelo cron de lembretes (/api/send-reminders).
//
// Por que existe: push tem 3% de aceite e não existe no app da App Store; e-mail é
// aberto por poucos. No Brasil o canal que a pessoa realmente abre é o WhatsApp.
//
// Fail-closed, igual ao e-mail: sem WHATSAPP_API_URL + WHATSAPP_API_TOKEN na Vercel a
// função não tenta nada e o cron segue com push/e-mail. Provedor-agnóstico: qualquer API
// que aceite POST JSON { phone, message } com token no header — Z-API, Evolution API,
// UltraMsg, ou um webhook próprio. Ajuste WHATSAPP_API_HEADER se o provedor usar outro
// nome de header (Z-API: "Client-Token"; padrão: "Authorization: Bearer <token>").
//
// Uso oficial (Meta Cloud API / Twilio) exige template aprovado e opt-in explícito — o
// opt-in o app já coleta (WhatsappOptin em app/app/page.tsx). Para a Cloud API, aponte
// WHATSAPP_API_URL para um pequeno adaptador seu que converta { phone, message } no
// formato de template da Meta.

export type ResultadoWhats = { ok: boolean; motivo?: string }

export function whatsappConfigurado(): boolean {
  return !!(process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN)
}

export async function enviarWhatsapp(phone: string, message: string): Promise<ResultadoWhats> {
  const url = process.env.WHATSAPP_API_URL
  const token = process.env.WHATSAPP_API_TOKEN
  if (!url || !token) return { ok: false, motivo: 'whatsapp_nao_configurado' }
  const so = String(phone || '').replace(/\D/g, '')
  if (so.length < 12) return { ok: false, motivo: 'numero_invalido' }
  const headerNome = process.env.WHATSAPP_API_HEADER || 'Authorization'
  const headerValor = headerNome.toLowerCase() === 'authorization' ? `Bearer ${token}` : token
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 8000)
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [headerNome]: headerValor },
      body: JSON.stringify({ phone: so, message }),
      signal: ctrl.signal,
    })
    clearTimeout(t)
    if (!r.ok) return { ok: false, motivo: `http_${r.status}` }
    return { ok: true }
  } catch (e: any) {
    return { ok: false, motivo: String(e?.message || e) }
  }
}
