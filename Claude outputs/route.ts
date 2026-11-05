import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autenticarDono } from '../../../../lib/admin-auth'

// "Chamar no WhatsApp hoje" (22/09/2026).
//
// Por que existe: 98% das contas usam o app num único dia. Push chega a 1% e os e-mails do
// ciclo de vida tiveram 0 cliques. O app já pedia o WhatsApp ("amanhã te chamo no
// WhatsApp"), mas nada enviava — WHATSAPP_API_URL nunca foi configurada. Enquanto não houver
// provedor, quem manda é o dono, do próprio celular: esta rota monta a fila do dia com a
// mensagem pronta e o link wa.me. Um toque abre o WhatsApp com o texto preenchido.
//
// GET  → fila do dia (quem deixou o número, não é pagante, não usou hoje e não foi chamado
//        nos últimos 2 dias; no máximo 3 chamadas por pessoa).
// POST { user_id } → marca "chamado hoje" em perfil_ia.whats_contatos.

const INTERNOS = new Set(['igorckl@hotmail.com', 'igormelo47@gmail.com', 'igorccb@hotmail.com', 'apple.review.2026@vonai-teste.com', 'google.review@vonai.com.br'])
const ehInterno = (em: string) => INTERNOS.has(em) || em.endsWith('@vonai-teste.com') || em.endsWith('@not.com')
const MS_DIA = 86400000
const diaLocal = (ms: number) => new Date(ms - 3 * 3600000).toISOString().slice(0, 10)

function mensagem(nome: string, licoes: number, diasSemUsar: number): string {
  const oi = nome ? `Oi, ${nome}!` : 'Oi!'
  if (licoes === 0) {
    return `${oi} Aqui é o Igor, do Vonai 👋 Vi que você criou sua conta mas ainda não fez a primeira lição. Leva 5 minutinhos e você já sai falando uma frase nova: https://vonai.com.br/app\n\nSe travou em alguma coisa, me responde aqui que eu te ajudo.`
  }
  if (diasSemUsar <= 2) {
    return `${oi} Igor do Vonai aqui 👋 Sua próxima lição já está pronta — 5 minutos hoje e o inglês não esfria: https://vonai.com.br/app\n\nPosso te fazer uma pergunta rápida? O que faltou pra você voltar ontem?`
  }
  return `${oi} Aqui é o Igor, do Vonai. Faz uns dias que você não aparece e seu progresso continua guardado. Quer retomar de onde parou? https://vonai.com.br/app\n\nSe o app não foi o que você esperava, me conta em uma linha — eu leio tudo.`
}

async function cliente() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !service) return null
  return createClient(url, service)
}

export async function GET(req: NextRequest) {
  const auth = await autenticarDono(req.headers.get('authorization'))
  if (!auth.ok) return new NextResponse(auth.status === 401 ? 'unauthorized' : 'forbidden', { status: auth.status })
  const admin = await cliente()
  if (!admin) return NextResponse.json({ error: 'missing env' }, { status: 500 })

  const { data: progs, error } = await admin.from('progresso')
    .select('user_id, email, whatsapp, perfil_ia, is_premium, premium_expira, licoes_concluidas, dias_ativos, ultima_atividade')
    .not('whatsapp', 'is', null)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: lista } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const nomes = new Map((lista?.users || []).map(u => [u.id, String(u.user_metadata?.nome || '').split(' ')[0]]))
  const criados = new Map((lista?.users || []).map(u => [u.id, new Date(u.created_at).getTime()]))

  const agora = Date.now()
  const hoje = diaLocal(agora)
  const fila: { user_id: string; nome: string; email: string; numero: string; licoes: number; diasSemUsar: number; chamadas: number; link: string; texto: string }[] = []
  let semNumeroValido = 0
  for (const p of progs || []) {
    const em = String(p.email || '').toLowerCase()
    if (!em || ehInterno(em)) continue
    const numero = String(p.whatsapp || '').replace(/\D/g, '')
    if (numero.length < 10) { semNumeroValido++; continue }
    const comDdi = numero.length <= 11 ? `55${numero}` : numero
    const pagante = !!p.is_premium && (!p.premium_expira || new Date(p.premium_expira).getTime() > agora)
    if (pagante) continue
    const perfil = (p.perfil_ia || {}) as { whats_contatos?: string[] }
    const contatos: string[] = Array.isArray(perfil.whats_contatos) ? perfil.whats_contatos : []
    if (contatos.length >= 3) continue
    const ultimoContato = contatos[contatos.length - 1]
    if (ultimoContato && (agora - new Date(ultimoContato + 'T12:00:00Z').getTime()) < 2 * MS_DIA) continue
    const dias: string[] = Array.isArray(p.dias_ativos) ? p.dias_ativos : []
    const ultimoDia = dias.length ? dias.slice().sort().pop()! : String(p.ultima_atividade || '').slice(0, 10)
    if (ultimoDia === hoje) continue
    // Conta criada hoje ainda não teve chance de voltar.
    const criado = criados.get(p.user_id) || 0
    if (criado && diaLocal(criado) === hoje) continue
    const diasSemUsar = ultimoDia ? Math.max(1, Math.round((new Date(hoje).getTime() - new Date(ultimoDia).getTime()) / MS_DIA)) : 1
    if (diasSemUsar > 30) continue
    const licoes = Array.isArray(p.licoes_concluidas) ? p.licoes_concluidas.length : 0
    const nome = nomes.get(p.user_id) || ''
    const texto = mensagem(nome, licoes, diasSemUsar)
    fila.push({ user_id: p.user_id, nome, email: em, numero: comDdi, licoes, diasSemUsar, chamadas: contatos.length, texto, link: `https://wa.me/${comDdi}?text=${encodeURIComponent(texto)}` })
  }
  // Primeiro quem sumiu há menos tempo: é quem ainda tem mais chance de voltar.
  fila.sort((a, b) => a.diasSemUsar - b.diasSemUsar || b.licoes - a.licoes)
  return NextResponse.json({ ok: true, total: fila.length, comNumero: (progs || []).length, semNumeroValido, fila })
}

export async function POST(req: NextRequest) {
  const auth = await autenticarDono(req.headers.get('authorization'))
  if (!auth.ok) return new NextResponse(auth.status === 401 ? 'unauthorized' : 'forbidden', { status: auth.status })
  const admin = await cliente()
  if (!admin) return NextResponse.json({ error: 'missing env' }, { status: 500 })
  const body = await req.json().catch(() => ({}))
  const userId = String(body?.user_id || '')
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return NextResponse.json({ error: 'user_id inválido' }, { status: 400 })
  const { data: p, error } = await admin.from('progresso').select('perfil_ia').eq('user_id', userId).maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const perfil = (p?.perfil_ia || {}) as { whats_contatos?: string[] }
  const contatos: string[] = Array.isArray(perfil.whats_contatos) ? perfil.whats_contatos : []
  const hoje = diaLocal(Date.now())
  if (!contatos.includes(hoje)) contatos.push(hoje)
  const { error: upErr } = await admin.from('progresso').update({ perfil_ia: { ...perfil, whats_contatos: contatos } }).eq('user_id', userId)
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })
  return NextResponse.json({ ok: true, chamadas: contatos.length })
}
