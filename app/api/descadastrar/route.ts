import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { tokenConfere } from '../../../lib/email'

// Descadastro dos lembretes por e-mail, em um clique, sem login.
//
// Sem login de propósito: exigir senha para parar de receber e-mail é o caminho mais
// rápido para a pessoa clicar em "isso é spam" -- e reclamação de spam queima o
// domínio inteiro, inclusive os e-mails de recuperação de senha. O token HMAC no link
// garante que só o dono daquele user_id consegue se descadastrar.
//
// Responde GET (clique no link) e POST (List-Unsubscribe-Post, que o Gmail dispara
// sozinho quando a pessoa usa o botão nativo de cancelar inscrição).

async function descadastrar(req: NextRequest) {
  const u = req.nextUrl.searchParams.get('u') || ''
  const t = req.nextUrl.searchParams.get('t') || ''

  if (!u || !tokenConfere(u, t)) {
    return new NextResponse(pagina('Link inválido', 'Este link de descadastro não é válido ou expirou. Se você quiser parar de receber os e-mails, responda a qualquer um deles que a gente resolve na mão.'), {
      status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return new NextResponse('config ausente', { status: 500 })

  const admin = createClient(url, service)
  const { error } = await admin.from('progresso').update({ email_lembretes: false }).eq('user_id', u)
  if (error) {
    console.error('[Descadastro] falhou', error)
    // Não conta mentira para o usuário: se não gravou, ele precisa saber, senão
    // continua recebendo depois de ter "cancelado" e aí sim marca como spam.
    return new NextResponse(pagina('Não conseguimos concluir', 'Deu um problema do nosso lado. Responda a qualquer e-mail nosso e a gente tira você da lista na mão, no mesmo dia.'), {
      status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  return new NextResponse(pagina('Pronto, não mandamos mais', 'Você não vai mais receber lembretes por e-mail do Vonai. Sua conta continua ativa e seu progresso está guardado — é só entrar quando quiser.'), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}

export async function GET(req: NextRequest) { return descadastrar(req) }
export async function POST(req: NextRequest) { return descadastrar(req) }

function pagina(titulo: string, texto: string): string {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>${titulo} — Vonai</title></head>
<body style="margin:0;background:#F6F8FB;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
<div style="max-width:520px;margin:0 auto;padding:64px 20px;">
  <div style="background:#fff;border-radius:18px;padding:32px 26px;">
    <div style="font-size:20px;font-weight:800;color:#103D77;margin-bottom:14px;">${titulo}</div>
    <div style="font-size:15.5px;color:#5B6B82;line-height:1.7;">${texto}</div>
    <a href="https://vonai.com.br/app" style="display:inline-block;margin-top:24px;color:#1E63C7;font-weight:700;text-decoration:none;font-size:15px;">Abrir o Vonai →</a>
  </div>
</div></body></html>`
}
