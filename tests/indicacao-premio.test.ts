import { describe, it, expect, vi } from 'vitest'
import { premiarIndicador, DIAS_PREMIO_INDICADOR } from '../lib/indicacao-premio'

const adminCom = (resposta: { data: unknown; error: { message: string } | null }) => ({
  rpc: vi.fn(async () => resposta),
})

describe('premiarIndicador', () => {
  it('premia quando o RPC devolve o id do indicador', async () => {
    const admin = adminCom({ data: 'abc-123', error: null })
    const r = await premiarIndicador(admin, 'indicado-1')
    expect(r.ok).toBe(true)
    expect(r.indicador).toBe('abc-123')
    expect(admin.rpc).toHaveBeenCalledWith('premia_indicacao', {
      p_indicado: 'indicado-1',
      p_dias: DIAS_PREMIO_INDICADOR,
    })
  })

  it('não premia quando não há indicador ou já foi premiado (data null)', async () => {
    const r = await premiarIndicador(adminCom({ data: null, error: null }), 'indicado-2')
    expect(r.ok).toBe(false)
    expect(r.motivo).toBe('sem_indicador_ou_ja_premiado')
  })

  it('falha FECHADO e sem exceção se o SQL ainda não foi aplicado (erro do RPC)', async () => {
    const r = await premiarIndicador(adminCom({ data: null, error: { message: 'function premia_indicacao does not exist' } }), 'indicado-3')
    expect(r.ok).toBe(false)
    expect(r.motivo).toBe('rpc_erro')
  })

  it('nunca deixa exceção vazar pro webhook de pagamento', async () => {
    const admin = { rpc: vi.fn(async () => { throw new Error('rede caiu') }) }
    const r = await premiarIndicador(admin as any, 'indicado-4')
    expect(r.ok).toBe(false)
    expect(r.motivo).toBe('excecao')
  })
})
