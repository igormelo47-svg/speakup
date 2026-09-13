import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { autenticarDono } from '../../../lib/admin-auth'
import { stripeConfigurado, precoId, DIAS_TRIAL } from '../../../lib/stripe'

// ============================================================================
// /api/diagnostico — "o caminho do dinheiro está de pé?" numa tela só.
//
// Isto existe por causa de um erro concreto e caro: entre 30/08 e 13/09/2026 o código do
// cartão-na-entrada estava no repositório, o site prometia o cartão no cadastro, e o
// Stripe NUNCA foi configurado na Vercel. Todo checkout web caía silenciosamente na Kiwify
// (teste sem cartão, sem cobrança automática) e ninguém percebeu por duas semanas, porque
// a falha é um `catch` que funciona exatamente como foi escrito.
//
// Regra que este arquivo tenta impor: nenhuma peça do caminho do pagamento pode estar
// desligada sem aparecer. Cada item devolve `ok` e uma frase dizendo o que fazer.
//
// Não devolve NENHUM valor de env — só se existe ou não. Ainda assim exige login do dono,
// porque o mapa de o-que-está-desligado é informação de ataque.
// ============================================================================

export const runtime = 'nodejs'

type Item = { id: string; ok: boolean; critico: boolean; titulo: string; detalhe: string }

function env(nome: string): boolean {
  const v = process.env[nome]
  return typeof v === 'string' && v.trim().length > 0
}

export async function GET(req: NextRequest) {
  const auth = await autenticarDono(req.headers.get('authorization'))
  if (!auth.ok) return new NextResponse(auth.status === 401 ? 'unauthorized' : 'forbidden', { status: auth.status })

  const itens: Item[] = []

  // ---- Pagamento: é aqui que uma assinatura deixa de acontecer -------------
  const temStripe = stripeConfigurado()
  const temMensal = !!precoId('mensal')
  const temAnual = !!precoId('anual')
  itens.push({
    id: 'stripe',
    ok: temStripe && temMensal && temAnual,
    critico: true,
    titulo: 'Stripe (checkout web com cartão na entrada)',
    detalhe: !temStripe
      ? 'STRIPE_SECRET_KEY ausente na Vercel — TODO checkout web está caindo na Kiwify (teste sem cartão, sem cobrança automática). Ver STRIPE.md.'
      : !temMensal || !temAnual
        ? `Falta ${!temMensal ? 'STRIPE_PRICE_MENSAL' : ''}${!temMensal && !temAnual ? ' e ' : ''}${!temAnual ? 'STRIPE_PRICE_ANUAL' : ''} (precisa começar com "price_").`
        : `Configurado. Teste grátis de ${DIAS_TRIAL} dias com cartão na entrada.`,
  })
  itens.push({
    id: 'stripe_webhook',
    ok: env('STRIPE_WEBHOOK_SECRET'),
    critico: true,
    titulo: 'Webhook do Stripe',
    detalhe: env('STRIPE_WEBHOOK_SECRET')
      ? 'Segredo presente — as assinaturas liberam o Premium sozinhas.'
      : 'STRIPE_WEBHOOK_SECRET ausente: o aluno paga e o Premium NÃO liga. Cadastre o endpoint /api/stripe/webhook no Stripe e copie o segredo.',
  })
  itens.push({
    id: 'cartao_na_entrada',
    // "ok" aqui é COERÊNCIA, não "ligado": site e mecanismo dizendo a mesma coisa.
    // Prometer cartão sem Stripe é reclamação na loja; ter Stripe e dizer "sem cartão" é
    // jogar fora a cobrança automática que acabou de ser paga.
    ok: (process.env.NEXT_PUBLIC_CARTAO_NA_ENTRADA === '1') === temStripe,
    critico: false,
    titulo: 'Textos do site no modo "cartão na entrada"',
    detalhe: process.env.NEXT_PUBLIC_CARTAO_NA_ENTRADA === '1'
      ? (temStripe ? 'Site promete cartão na entrada e o Stripe está de pé. Coerente.' : 'PERIGO: o site promete cartão na entrada mas o Stripe NÃO está configurado. Desligue a env ou configure o Stripe.')
      : 'Site diz "sem cartão" (comportamento atual). Ligue NEXT_PUBLIC_CARTAO_NA_ENTRADA=1 no mesmo deploy em que o Stripe entrar.',
  })
  itens.push({
    id: 'kiwify',
    ok: env('KIWIFY_TOKEN'),
    critico: true,
    titulo: 'Webhook da Kiwify (caminho reserva)',
    detalhe: env('KIWIFY_TOKEN')
      ? 'Token presente. Confira em /admin → "Webhooks recusados" se há 401 recente.'
      : 'KIWIFY_TOKEN ausente: toda venda pela Kiwify volta 401 e o aluno paga sem receber o Premium. Já aconteceu uma vez (17/08).',
  })
  itens.push({
    id: 'service_role',
    ok: env('SUPABASE_SERVICE_ROLE_KEY'),
    critico: true,
    titulo: 'Chave de serviço do Supabase',
    detalhe: env('SUPABASE_SERVICE_ROLE_KEY')
      ? 'Presente. Webhooks e painel conseguem escrever.'
      : 'Ausente: nenhum webhook consegue ligar o Premium e o /admin não abre.',
  })

  // ---- Medição: sem isto o funil é opinião ---------------------------------
  itens.push({
    id: 'ga4',
    ok: env('GA4_MP_API_SECRET'),
    critico: false,
    titulo: 'GA4 pelo servidor (Measurement Protocol)',
    detalhe: env('GA4_MP_API_SECRET')
      ? 'Presente — eventos chegam ao GA4 mesmo sem tag no GTM.'
      : 'GA4_MP_API_SECRET ausente: só chega ao GA4 o que o gestor de tráfego tiver criado como tag no GTM.',
  })

  // ---- Canais de retorno: o produto sem eles não tem segundo dia ----------
  itens.push({
    id: 'resend',
    ok: env('RESEND_API_KEY'),
    critico: false,
    titulo: 'E-mail (Resend)',
    detalhe: env('RESEND_API_KEY')
      ? 'Chave presente. Confirme também que o domínio envio.vonai.com.br está verificado — sem isso o envio volta 403.'
      : 'RESEND_API_KEY ausente: nenhum e-mail do ciclo de vida sai (aviso de fim de teste, retorno, winback).',
  })
  itens.push({
    id: 'push',
    ok: env('VAPID_PRIVATE_KEY'),
    critico: false,
    titulo: 'Push do navegador',
    detalhe: env('VAPID_PRIVATE_KEY') ? 'Configurado.' : 'VAPID_PRIVATE_KEY ausente: nenhum lembrete é entregue.',
  })
  itens.push({
    id: 'cron',
    ok: env('CRON_SECRET'),
    critico: false,
    titulo: 'Segredo do cron (lembretes 2x/dia)',
    detalhe: env('CRON_SECRET') ? 'Configurado.' : 'CRON_SECRET ausente: /api/send-reminders recusa a chamada da Vercel e nada é enviado.',
  })

  // ---- Banco: a tabela do funil novo já existe? ---------------------------
  let tabelaFunil = false
  let eventosFunil = 0
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (url && service) {
    try {
      const admin = createClient(url, service)
      const { count, error } = await admin.from('eventos_funil').select('*', { count: 'exact', head: true })
      tabelaFunil = !error
      eventosFunil = count ?? 0
    } catch {}
  }
  itens.push({
    id: 'tabela_funil',
    ok: tabelaFunil,
    critico: false,
    titulo: 'Tabela eventos_funil',
    detalhe: tabelaFunil
      ? `Existe — ${eventosFunil} eventos registrados.`
      : 'Não existe: rode migracao_2026-09-13_funil.sql no Supabase. Sem ela o funil do /admin fica zerado.',
  })

  const criticosQuebrados = itens.filter(i => i.critico && !i.ok)
  return NextResponse.json({
    ok: criticosQuebrados.length === 0,
    resumo: criticosQuebrados.length === 0
      ? 'Caminho do pagamento de pé.'
      : `${criticosQuebrados.length} peça(s) crítica(s) desligada(s): ${criticosQuebrados.map(i => i.titulo).join(', ')}.`,
    itens,
    verificadoEm: new Date().toISOString(),
  })
}
