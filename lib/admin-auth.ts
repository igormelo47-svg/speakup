import { createClient } from '@supabase/supabase-js'

// Autenticação do painel do dono (/admin). Mesma allowlist do app/api/admin/painel/route.ts:
// só as contas do Emmanuel passam; qualquer outro login recebe 403.
// Fica num arquivo separado para as rotas novas do admin (pendentes) reaproveitarem
// sem duplicar a lista — se um dia mudar o e-mail do dono, muda num lugar só.
export const DONOS = ['igorckl@hotmail.com', 'igormelo47@gmail.com']

export async function autenticarDono(authHeader: string | null): Promise<{ ok: true; email: string } | { ok: false; status: 401 | 403 | 500 }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return { ok: false, status: 500 }
  const token = (authHeader || '').replace(/^Bearer\s+/i, '')
  if (!token) return { ok: false, status: 401 }
  try {
    const auth = createClient(url, anon)
    const { data, error } = await auth.auth.getUser(token)
    const email = data?.user?.email?.toLowerCase()
    if (error || !email || !DONOS.includes(email)) return { ok: false, status: 403 }
    return { ok: true, email }
  } catch {
    return { ok: false, status: 403 }
  }
}
