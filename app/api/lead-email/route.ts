import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Guarda o e-mail que a pessoa deixa no RESULTADO do teste de nível. É o único canal de
// retorno que temos para quem faz o teste e não cria conta na hora — hoje essa pessoa some
// e o clique pago vai junto.
//
// Rota PÚBLICA, igual à /api/lead-meta: a página do teste não tem login. Mesmas travas.

const LIMITE_IP = 10 // e-mail é ação rara; 10 por IP já cobre família/escritório

// Validação proposital simples: e-mail "certo" de verdade só se prova mandando mensagem.
// O que importa aqui é barrar lixo e coisa que não é e-mail.
const EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/

// Só os campos de atribuição que o Attribution.tsx grava. Recorta qualquer outra coisa que
// venha no corpo — o cliente é quem envia, então nada entra no banco sem passar por aqui.
const CAMPOS_ATRIB = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'landing', 'referrer', 'ts']

export async function POST(req: NextRequest) {
  const resposta = (extra: Record<string, unknown> = {}) => NextResponse.json({ ok: true, ...extra })

  let body: any = {}
  try { body = await req.json() } catch { return resposta({ salvo: false, motivo: 'json inválido' }) }

  // Minúsculas aqui: é o que garante um contato só por pessoa, já que o índice único do
  // banco é na coluna crua.
  const email = String(body?.email || '').trim().toLowerCase().slice(0, 200)
  if (!EMAIL.test(email)) return NextResponse.json({ ok: false, motivo: 'email inválido' }, { status: 400 })

  const nivel = /^[A-C][12]$/.test(String(body?.nivel || '')) ? String(body.nivel) : null
  const acertosBruto = Number(body?.acertos)
  const acertos = Number.isInteger(acertosBruto) && acertosBruto >= 0 && acertosBruto <= 50 ? acertosBruto : null

  const attrib: Record<string, string> = {}
  if (body?.attrib && typeof body.attrib === 'object') {
    for (const c of CAMPOS_ATRIB) {
      const v = body.attrib[c]
      if (typeof v === 'string' && v) attrib[c] = v.slice(0, 512)
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return resposta({ salvo: false, motivo: 'sem credenciais' })

  const admin = createClient(url, service)

  // Teto por IP, FAIL-CLOSED: sem conseguir verificar o limite, não grava. Contador próprio
  // ("email:") para não dividir a cota com o chat do professor nem com o lead do Meta.
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
  try {
    const { data: dentroDoLimite, error } = await admin.rpc('incrementa_ip', {
      p_ip: `email:${ip || 'sem-ip'}`, p_limite: LIMITE_IP,
    })
    if (error) throw new Error('rpc_falhou')
    if (dentroDoLimite === false) return resposta({ salvo: false, motivo: 'limite por ip' })
  } catch {
    return resposta({ salvo: false, motivo: 'limite não verificado' })
  }

  // Refazer o teste não pode dar erro na tela: o índice único por e-mail transforma a
  // segunda vez em atualização do nível, não em falha.
  const { error } = await admin
    .from('leads_teste')
    .upsert({
      email,
      nivel,
      acertos,
      attrib: Object.keys(attrib).length ? attrib : null,
      origem: 'teste-nivel',
    }, { onConflict: 'email' })

  if (error) return resposta({ salvo: false, motivo: 'banco' })
  return resposta({ salvo: true })
}
