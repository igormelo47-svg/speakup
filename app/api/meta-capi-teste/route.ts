import { NextRequest, NextResponse } from 'next/server'
import { enviarPurchaseMeta } from '../../../lib/meta-capi'

// Rota de VALIDAÇÃO da API de Conversões com o gestor de tráfego, sem compra real.
// O test_event_code vem por ?codigo=TESTxxxxx (ou da env META_CAPI_TEST_CODE) e é
// SEMPRE incluído no payload — o evento cai só na aba "Eventos de teste" do
// Gerenciador de Eventos, fora da medição de produção. Sem banco, sem efeito no app.
// Remover a rota depois que a validação com o gestor fechar.
export async function GET(req: NextRequest) {
  const codigo = req.nextUrl.searchParams.get('codigo') || process.env.META_CAPI_TEST_CODE || ''
  if (!/^TEST\d{3,10}$/.test(codigo)) {
    return NextResponse.json({ ok: false, info: 'informe ?codigo=TESTxxxxx (aba Testar eventos do Gerenciador de Eventos)' }, { status: 400 })
  }
  const tid = 'teste_' + (req.nextUrl.searchParams.get('tid') || Date.now().toString(36))
  const r = await enviarPurchaseMeta({
    userId: 'teste-validacao-capi',
    email: 'teste@vonai.com.br',
    transactionId: tid,
    value: 29.9,
    testEventCode: codigo,
  })
  return NextResponse.json({ ok: r.sent, event_id: `vonai-purchase-${tid}`, resposta: r })
}
