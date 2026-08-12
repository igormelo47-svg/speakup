// Prêmio de indicação (12/08/2026): quando o aluno indicado vira assinante, quem indicou
// ganha +30 dias de Premium. A trava anti-duplo-prêmio vive no banco (RPC premia_indicacao,
// atômica em progresso.indicacao_premiada_em) — renovações chamam de novo sem premiar 2x.
// Fail-safe: se o SQL (indicacao_premio.sql) ainda não foi aplicado, loga e segue — o
// webhook de pagamento NUNCA pode falhar por causa do prêmio.

export const DIAS_PREMIO_INDICADOR = 30

type AdminClient = {
  rpc: (fn: string, args: Record<string, unknown>) => PromiseLike<{ data: unknown; error: { message: string } | null }>
}

export async function premiarIndicador(admin: AdminClient, indicadoId: string): Promise<{ ok: boolean; indicador?: string; motivo?: string }> {
  try {
    const { data, error } = await admin.rpc('premia_indicacao', {
      p_indicado: indicadoId,
      p_dias: DIAS_PREMIO_INDICADOR,
    })
    if (error) {
      console.error('[indicacao-premio] RPC falhou (indicacao_premio.sql aplicado?)', error.message)
      return { ok: false, motivo: 'rpc_erro' }
    }
    if (!data) return { ok: false, motivo: 'sem_indicador_ou_ja_premiado' }
    console.log('[indicacao-premio] indicador premiado', { indicado: indicadoId, indicador: data })
    return { ok: true, indicador: String(data) }
  } catch (e) {
    console.error('[indicacao-premio] exceção', e)
    return { ok: false, motivo: 'excecao' }
  }
}
