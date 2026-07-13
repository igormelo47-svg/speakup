import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// TEMPORÁRIO (remover após o diagnóstico): reproduz o fluxo de recuperação de
// senha de ponta a ponta no servidor (onde a service key existe) e devolve o
// resultado de cada etapa, para acharmos o erro exato que o aluno vê.

const SEGREDO = 'vonai-diag-7k2m9x4p'
const EMAIL_TESTE = 'reset.teste@vonai-teste.com'

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('s') !== SEGREDO) return new NextResponse('nope', { status: 404 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const admin = createClient(url, service)
  const diag: Record<string, unknown> = {}

  // 1) conta descartável
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email: EMAIL_TESTE, password: 'SenhaAntiga123!', email_confirm: true,
  })
  diag.criaUser = createErr ? createErr.message : `ok ${created?.user?.id}`

  // 2) gera o MESMO link que iria no e-mail
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: 'recovery', email: EMAIL_TESTE,
    options: { redirectTo: 'https://speakup-dusky.vercel.app/reset' },
  })
  if (linkErr) { diag.geraLink = linkErr.message; return NextResponse.json(diag) }
  const actionLink = linkData.properties?.action_link
  diag.geraLink = 'ok'
  diag.actionLink = actionLink

  // 3) "clica" no link (segue o verify do Supabase sem seguir o redirect final)
  const resp = await fetch(actionLink!, { redirect: 'manual' })
  const location = resp.headers.get('location') || ''
  diag.verifyStatus = resp.status
  diag.redirectPara = location

  // 4) extrai o token da URL de destino (fragmento #access_token=...)
  const frag = location.split('#')[1] || ''
  const params = new URLSearchParams(frag)
  const accessToken = params.get('access_token')
  diag.temAccessToken = !!accessToken
  diag.erroNoFragmento = params.get('error_description') || params.get('error') || null

  // 5) tenta trocar a senha COM esse token (o que o /reset faz via updateUser)
  if (accessToken) {
    const r = await fetch(`${url}/auth/v1/user`, {
      method: 'PUT',
      headers: { apikey: anon, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'NovaSenha456!' }),
    })
    diag.updateStatus = r.status
    diag.updateBody = await r.text()
  }

  return NextResponse.json(diag)
}
