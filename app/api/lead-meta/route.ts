import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { enviarLeadMeta } from '../../../lib/meta-capi'

// Lead (teste de nível concluído) pelo SERVIDOR, para o Meta receber o evento mesmo quando
// o navegador não consegue mandar — bloqueador de anúncio, iPhone com rastreamento restrito,
// aba fechada rápido demais. A campanha do Meta otimiza por este evento, então cada um
// perdido é verba andando no escuro.
//
// Esta rota é PÚBLICA de propósito: a página do teste não tem login. Isso significa que
// qualquer um pode chamá-la, e um evento falso aqui vira sinal errado para o algoritmo de
// lances — dinheiro de verdade. Daí as travas abaixo.

// Trava até o gestor confirmar que a tag do GTM lê o MESMO event_id que mandamos. Se os
// dois lados usarem ids diferentes, o Meta conta o evento DUAS vezes e estraga justamente
// o sinal que esta rota existe para proteger. Ligar só depois da confirmação.
const LIGADO = process.env.META_LEAD_CAPI === '1'

// Uma pessoa faz o teste algumas vezes, não trinta. Contador próprio (prefixo "lead:")
// para não dividir a cota com o chat do professor, que usa o mesmo RPC.
const LIMITE_IP = 30

// Formato exato que o navegador gera (app/teste-de-nivel-de-ingles/Teste.tsx). Validar o
// id impede que alguém injete lixo no identificador de deduplicação do Meta.
const ID_VALIDO = /^vonai-lead-[a-zA-Z0-9-]{8,64}$/

export async function POST(req: NextRequest) {
  // Responde 200 sempre: isto é medição, e falha de medição nunca pode virar erro na tela
  // de quem está fazendo o teste. O que interessa é o campo "sent".
  const ok = (extra: Record<string, unknown> = {}) => NextResponse.json({ ok: true, ...extra })
  if (!LIGADO) return ok({ sent: false, reason: 'META_LEAD_CAPI desligado' })

  let body: any = {}
  try { body = await req.json() } catch { return ok({ sent: false, reason: 'json inválido' }) }

  const eventId = String(body?.event_id || '')
  if (!ID_VALIDO.test(eventId)) return ok({ sent: false, reason: 'event_id inválido' })
  const nivel = /^[A-C][12]$/.test(String(body?.nivel || '')) ? String(body.nivel) : null

  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim()
  const userAgent = req.headers.get('user-agent')

  // Teto por IP, FAIL-CLOSED: sem conseguir verificar, não manda evento. Sinal errado para
  // o algoritmo custa mais caro que sinal faltando.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return ok({ sent: false, reason: 'sem credenciais' })
  try {
    const admin = createClient(url, service)
    const { data: dentroDoLimite, error } = await admin.rpc('incrementa_ip', {
      p_ip: `lead:${ip || 'sem-ip'}`, p_limite: LIMITE_IP,
    })
    if (error) throw new Error('rpc_falhou')
    if (dentroDoLimite === false) return ok({ sent: false, reason: 'limite por ip' })
  } catch {
    return ok({ sent: false, reason: 'limite não verificado' })
  }

  // _fbp e _fbc são cookies de PRIMEIRA parte no nosso domínio: lidos do request, nunca do
  // corpo — o corpo o cliente forja, o cookie não (para outra pessoa).
  const fbp = req.cookies.get('_fbp')?.value || null
  const fbc = req.cookies.get('_fbc')?.value || null

  const r = await enviarLeadMeta({
    eventId, fbp, fbc, ip: ip || null, userAgent,
    url: 'https://vonai.com.br/teste-de-nivel-de-ingles', nivel,
  })
  return ok(r)
}
