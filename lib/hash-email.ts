// Conversões otimizadas (Enhanced Conversions) do Google Ads.
//
// Quando o cookie não existe — navegador bloqueando, app aberto de outro jeito, aluno
// que voltou dias depois — a conversão se perde e o Google fica sem saber que aquele
// clique virou cadastro. Mandando o e-mail criptografado junto, ele consegue casar.
//
// O e-mail NUNCA sai daqui em texto puro: só o resumo SHA-256, que é o que o Google
// documenta e o mesmo que já mandamos para o Meta no CAPI desde 31/07.

// Regras de normalização do Google: minúsculas, sem espaços nas pontas. Para o Gmail,
// os pontos antes do @ são ignorados pelo provedor (j.o.ao = joao), então saem também —
// senão o mesmo e-mail geraria dois resumos diferentes e a correspondência falharia.
export function normalizarEmail(email: string): string {
  const limpo = String(email || '').trim().toLowerCase()
  if (!limpo.includes('@')) return ''
  const [local, dominio] = limpo.split('@')
  if (!local || !dominio) return ''
  if (dominio === 'gmail.com' || dominio === 'googlemail.com') {
    return `${local.replace(/\./g, '')}@gmail.com`
  }
  return `${local}@${dominio}`
}

// SHA-256 em hexadecimal usando a API do próprio navegador. Exige HTTPS (crypto.subtle
// não existe em http://), o que em produção sempre temos.
export async function sha256Hex(texto: string): Promise<string> {
  if (typeof crypto === 'undefined' || !crypto.subtle) return ''
  const bytes = new TextEncoder().encode(texto)
  const buffer = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

// Formato que o GTM espera ler para alimentar as conversões otimizadas.
export async function dadosUsuarioParaAds(email: string): Promise<{ sha256_email_address: string } | null> {
  const normalizado = normalizarEmail(email)
  if (!normalizado) return null
  const hash = await sha256Hex(normalizado)
  return hash ? { sha256_email_address: hash } : null
}
