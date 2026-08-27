import { createClient } from '@supabase/supabase-js'

// Aviso de venda por e-mail. Enquanto o volume é pequeno, saber na hora que alguém pagou
// vale mais do que qualquer relatório — dá para conferir se o acesso liberou de verdade e
// falar com o aluno no dia. Silencioso por natureza: se o Resend falhar, o webhook segue.

// Contas internas (testes, revisão das lojas, do dono) não contam como cliente de verdade.
const INTERNAS = [
  'igormelo47@gmail.com',
  'igorckl@hotmail.com',
  'google.review@vonai.com.br',
  'apple.review.2026@vonai-teste.com',
]

export async function avisarVenda(dados: {
  email: string
  origem: 'Kiwify' | 'Apple' | 'Google Play'
  tipo: string
  valor: number
}) {
  const key = process.env.RESEND_API_KEY
  if (!key) return { sent: false, reason: 'sem RESEND_API_KEY' }

  const destino = process.env.AVISO_VENDA_EMAIL || 'moafidem@hotmail.com'
  const from = process.env.RESEND_FROM || 'Vonai <onboarding@resend.dev>'
  const quando = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  // Quantos assinantes reais existem depois desta venda (ignora as contas internas).
  let totalReais: number | null = null
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const service = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (url && service) {
      const admin = createClient(url, service)
      const { count } = await admin.from('progresso')
        .select('user_id', { count: 'exact', head: true })
        .eq('is_premium', true)
        .not('email', 'in', `(${INTERNAS.join(',')})`)
      totalReais = count ?? null
    }
  } catch (e) {}

  const primeira = totalReais === 1
  const assunto = primeira
    ? '🎉 PRIMEIRA VENDA do Vonai!'
    : `💰 Nova assinatura no Vonai${totalReais ? ` (${totalReais} assinantes)` : ''}`

  const esc = (s: string) => String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] as string))
  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#16212c;line-height:1.6">
      <h2 style="margin:0 0 14px">${primeira ? '🎉 A primeira venda saiu!' : '💰 Nova assinatura'}</h2>
      <div style="background:#f2f5f8;border-radius:10px;padding:14px">
        <b>Aluno:</b> ${esc(dados.email)}<br/>
        <b>Valor:</b> R$ ${dados.valor.toFixed(2).replace('.', ',')}<br/>
        <b>Origem:</b> ${esc(dados.origem)} (${esc(dados.tipo)})<br/>
        <b>Quando:</b> ${quando}
        ${totalReais !== null ? `<br/><b>Assinantes ativos:</b> ${totalReais}` : ''}
      </div>
      <p style="color:#5c6b7a;font-size:13px;margin-top:14px">
        O acesso Premium já foi liberado automaticamente pelo webhook. Este aviso é só para você saber na hora.
      </p>
    </div>`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [destino], subject: assunto, html }),
    })
    return { sent: r.ok, status: r.status, primeira, totalReais }
  } catch (e: any) {
    return { sent: false, reason: String(e?.message || e) }
  }
}
