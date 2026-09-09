import crypto from 'crypto'

// Comparação de segredo em TEMPO CONSTANTE.
//
// `a === b` sai no primeiro caractere diferente, e o tempo de resposta vaza o tamanho do
// prefixo correto. Com chamadas repetidas dá para adivinhar o segredo caractere a
// caractere. Os webhooks de pagamento usavam `===`; o Stripe (lib/stripe.ts) e o link de
// descadastro (lib/email.ts) já faziam certo — isto uniformiza o resto.
//
// Compara o HASH dos dois lados: assim o timingSafeEqual nunca recebe buffers de tamanhos
// diferentes (ele lança nesse caso, e o próprio lançamento já vazaria o tamanho).
export function segredoConfere(recebido: string | null | undefined, esperado: string | null | undefined): boolean {
  if (!esperado || !recebido) return false
  const a = crypto.createHash('sha256').update(String(recebido)).digest()
  const b = crypto.createHash('sha256').update(String(esperado)).digest()
  return crypto.timingSafeEqual(a, b)
}
