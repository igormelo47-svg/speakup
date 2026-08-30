import { createClient } from '@supabase/supabase-js'

// Client do navegador (chave anônima, protegido por RLS no banco).
//
// Os valores caem num placeholder quando as variáveis não existem. Motivo: `createClient`
// lança "supabaseUrl is required" já na avaliação do módulo, e como /admin e /app são
// pré-renderizados no build, um ambiente sem as env (branch de preview, clone novo, CI)
// derrubava o `next build` inteiro em vez de falhar só naquela tela. Com o placeholder o
// build passa e a falta de configuração aparece no console, que é onde ela deve aparecer.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[supabase] NEXT_PUBLIC_SUPABASE_URL e/ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausentes. ' +
    'O app sobe, mas nenhuma chamada ao banco vai funcionar. Configure na Vercel.',
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://sem-configuracao.supabase.co',
  supabaseKey || 'sem-configuracao',
)
