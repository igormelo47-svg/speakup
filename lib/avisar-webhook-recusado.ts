// Aviso de webhook RECUSADO.
//
// Em 17/08/2026 a primeira venda no Android foi paga e o aluno não recebeu o Premium: a
// Kiwify chamou, o servidor recusou por senha e ninguém ficou sabendo. Só descobrimos
// porque o dono foi conferir na mão. Um pagamento recusado na porta é a falha mais cara
// que existe aqui — o dinheiro entra e o produto não entrega —, então ela nunca mais pode
// acontecer em silêncio.
//
// Silencioso por natureza: se o Resend falhar, o webhook segue seu curso normal.

export async function avisarWebhookRecusado(dados: {
  origem: string
  tem_segredo: boolean
  tem_token: boolean
  tem_assinatura: boolean
  tipo: string | null
}) {
  const key = process.env.RESEND_API_KEY
  if (!key) return { sent: false, reason: 'sem RESEND_API_KEY' }

  const destino = process.env.AVISO_VENDA_EMAIL || 'moafidem@hotmail.com'
  const from = process.env.RESEND_FROM || 'Vonai <onboarding@resend.dev>'
  const quando = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })

  // Diagnóstico pronto: quem lê o aviso já sabe o que fazer, sem precisar investigar.
  const causa = !dados.tem_segredo
    ? 'O servidor está SEM a senha configurada (a variável de ambiente sumiu ou está vazia).'
    : !dados.tem_token && !dados.tem_assinatura
      ? 'A chamada chegou sem token e sem assinatura — pode não ser a Kiwify de verdade.'
      : 'A senha do webhook não confere com a do servidor. Confira o token na URL do webhook.'

  const sim = (b: boolean) => (b ? 'sim' : 'não')
  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#16212c;line-height:1.6">
      <h2 style="margin:0 0 14px">⚠️ Um aviso de pagamento foi RECUSADO</h2>
      <p style="margin:0 0 12px">
        Se isso veio de uma venda de verdade, <b>o aluno pagou e não recebeu o acesso</b>. Confira agora.
      </p>
      <div style="background:#fff4f4;border:1px solid #f3c9c9;border-radius:10px;padding:14px">
        <b>O que provavelmente é:</b> ${causa}
      </div>
      <div style="background:#f2f5f8;border-radius:10px;padding:14px;margin-top:12px">
        <b>Origem:</b> ${dados.origem}<br/>
        <b>Evento:</b> ${dados.tipo || 'não identificado'}<br/>
        <b>Servidor tem senha:</b> ${sim(dados.tem_segredo)}<br/>
        <b>Veio com token na URL:</b> ${sim(dados.tem_token)}<br/>
        <b>Veio com assinatura:</b> ${sim(dados.tem_assinatura)}<br/>
        <b>Quando:</b> ${quando}
      </div>
      <p style="color:#5c6b7a;font-size:13px;margin-top:14px">
        O registro completo está na tabela <b>webhook_recebidos</b>, no Supabase.
      </p>
    </div>`

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [destino], subject: '⚠️ Pagamento recusado na porta do Vonai', html }),
    })
    return { sent: r.ok, status: r.status }
  } catch (e: any) {
    return { sent: false, reason: String(e?.message || e) }
  }
}
