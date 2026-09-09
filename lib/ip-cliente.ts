// IP do cliente para rate limiting.
//
// Por que este arquivo existe: as rotas liam `x-forwarded-for` e pegavam o PRIMEIRO
// item da lista. Esse item e exatamente o que o proprio cliente pode enviar. Um
// `curl -H 'x-forwarded-for: 9.9.9.<aleatorio>'` a cada chamada zerava o limite por IP
// — e em /api/demo-fala, que e publica e chama o Whisper (pago por minuto), esse era o
// UNICO freio. Na pratica: transcricao anonima e ilimitada no cartao do dono.
//
// `x-vercel-forwarded-for` e escrito pela propria Vercel e o cliente nao consegue
// sobrescrever. `x-real-ip` fica como segundo. So depois, e como ultimo recurso, cai no
// ULTIMO item de `x-forwarded-for` (o mais proximo do proxy, nao o que o cliente mandou).
export function ipCliente(req: { headers: { get(nome: string): string | null } }): string {
  const vercel = req.headers.get('x-vercel-forwarded-for')
  if (vercel) return vercel.split(',')[0].trim()

  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()

  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const partes = xff.split(',').map(p => p.trim()).filter(Boolean)
    if (partes.length) return partes[partes.length - 1]
  }
  return 'sem-ip'
}
