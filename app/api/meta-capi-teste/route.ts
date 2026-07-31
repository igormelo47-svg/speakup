import { NextRequest, NextResponse } from 'next/server'
import { enviarPurchaseMeta } from '../../../lib/meta-capi'

// Rota de VALIDAÇÃO da API de Conversões com o gestor de tráfego, sem compra real.
// Só funciona enquanto a env META_CAPI_TEST_CODE existir (o evento sai marcado com o
// test_event_code e cai na aba "Eventos de teste" do Gerenciador de Eventos, fora da
// medição de produção). Remover a env encerra a rota. GET pra facilitar o disparo.
export async function GET(req: NextRequest) {
  if (!process.env.META_CAPI_TEST_CODE) {
    return NextResponse.json({ ok: false, info: 'rota inativa (sem META_CAPI_TEST_CODE)' }, { status: 404 })
  }
  const tid = 'teste_' + (req.nextUrl.searchParams.get('tid') || Date.now().toString(36))
  const r = await enviarPurchaseMeta({
    userId: 'teste-validacao-capi',
    email: 'teste@vonai.com.br',
    transactionId: tid,
    value: 29.9,
  })
  return NextResponse.json({ ok: r.sent, event_id: `vonai-purchase-${tid}`, resposta: r })
}
