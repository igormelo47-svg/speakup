'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

// Painel do dono: cadastros por dia + assinantes. A página é pública, mas os DADOS
// só vêm da API para os logins do Emmanuel (allowlist no servidor) — pra qualquer
// outra pessoa aparece "acesso restrito". Feito pra abrir bem no celular.

const AZUL = '#1E63C7'
const ESCURO = '#103D77'

type Dia = { dia: string; total: number; anuncio: number; organico: number; internos: number }
type Assinante = { email: string; interno: boolean; canal: string; validoAte: string | null; xp: number; streak: number; ultimaAtividade: string }
type Fatia = { contas: number; ativados: number; taxa: number }
type Dados = {
  geradoEm: string
  totais: { contas: number; contas7d: number; viaAnuncio: number; assinantesReais: number; assinantesInternos: number; receitaMensalEstimada: number }
  ativacao?: { geral: Fatia; anuncio: Fatia; organico: Fatia }
  porDia: Dia[]
  assinantes: Assinante[]
}

function dataBr(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function Admin() {
  const [estado, setEstado] = useState<'carregando' | 'sem-login' | 'negado' | 'erro' | 'ok'>('carregando')
  const [dados, setDados] = useState<Dados | null>(null)
  const [mostrarInternos, setMostrarInternos] = useState(false)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) { setEstado('sem-login'); return }
      const r = await fetch('/api/admin/painel', { headers: { Authorization: `Bearer ${token}` } })
      if (r.status === 403) { setEstado('negado'); return }
      if (!r.ok) { setEstado('erro'); return }
      setDados(await r.json()); setEstado('ok')
    })().catch(() => setEstado('erro'))
  }, [])

  const cx: React.CSSProperties = { maxWidth: 760, margin: '0 auto', padding: '0 16px' }
  const card: React.CSSProperties = { background: '#fff', border: '1px solid #E8ECF2', borderRadius: 16, padding: 16 }

  if (estado !== 'ok') {
    return (
      <div style={{ minHeight: '100vh', background: '#F6F8FB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center', color: '#102A4C' }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Painel Von<span style={{ color: AZUL }}>ai</span></div>
          {estado === 'carregando' && <div style={{ color: '#5B6B82' }}>Carregando…</div>}
          {estado === 'sem-login' && <div style={{ color: '#5B6B82' }}>Entre com a conta do dono para ver o painel.<br /><Link href="/login" style={{ color: AZUL, fontWeight: 700 }}>Fazer login →</Link></div>}
          {estado === 'negado' && <div style={{ color: '#5B6B82' }}>🔒 Acesso restrito ao dono do app.</div>}
          {estado === 'erro' && <div style={{ color: '#B91C1C' }}>Erro ao carregar. Tente recarregar a página.</div>}
        </div>
      </div>
    )
  }

  const d = dados!
  const dias14 = d.porDia.slice(-14)
  const maxDia = Math.max(1, ...dias14.map(x => x.total))
  const assinantes = d.assinantes.filter(a => mostrarInternos || !a.interno)

  return (
    <div style={{ minHeight: '100vh', background: '#F6F8FB', color: '#102A4C', paddingBottom: 40 }}>
      <div style={{ background: `linear-gradient(160deg, #2E72D6, ${ESCURO})`, color: '#fff', padding: '20px 0 24px', marginBottom: 16 }}>
        <div style={cx}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Painel Von<span style={{ color: '#FFD98A' }}>ai</span> 📊</div>
          <div style={{ fontSize: 12.5, color: '#B5D4F4', marginTop: 2 }}>Atualizado {new Date(d.geradoEm).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} · contas de teste fora dos números</div>
        </div>
      </div>

      <div style={cx}>
        {/* Cartões de totais */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
          {[
            ['👥', String(d.totais.contas), 'contas reais'],
            ['🗓️', String(d.totais.contas7d), 'novas em 7 dias'],
            ['🎯', String(d.totais.viaAnuncio), 'vieram de anúncio'],
            ['⭐', String(d.totais.assinantesReais), 'assinantes pagantes'],
            ['💰', `R$ ${d.totais.receitaMensalEstimada.toFixed(2).replace('.', ',')}`, 'receita mensal est.'],
          ].map(([e, n, l], i) => (
            <div key={i} style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontSize: 20 }}>{e}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: AZUL }}>{n}</div>
              <div style={{ fontSize: 12, color: '#5B6B82' }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Ativação — quantos dos que se cadastraram realmente usaram o app.
            Comparar anúncio x orgânico é o que separa problema de TRÁFEGO de problema de PRODUTO. */}
        {d.ativacao && (
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 4 }}>Ativação — quem usou o app de verdade</div>
            <div style={{ fontSize: 12, color: '#5B6B82', marginBottom: 12 }}>
              Criou conta e chegou a fazer o nivelamento, uma lição ou uma conversa.
            </div>
            {([['Geral', d.ativacao.geral], ['Veio de anúncio', d.ativacao.anuncio], ['Orgânico/direto', d.ativacao.organico]] as [string, Fatia][]).map(([rotulo, f]) => (
              <div key={rotulo} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 116, fontSize: 12.5, color: '#5B6B82' }}>{rotulo}</div>
                <div style={{ flex: 1, background: '#EEF1F6', borderRadius: 8, height: 22, overflow: 'hidden' }}>
                  <div style={{ width: `${f.taxa}%`, height: '100%', background: f.taxa >= 40 ? '#16A34A' : f.taxa >= 20 ? '#F59E0B' : '#DC2626', borderRadius: 8 }} />
                </div>
                <div style={{ width: 92, fontSize: 12.5, fontWeight: 700, textAlign: 'right' }}>
                  {f.ativados}/{f.contas} · {f.taxa}%
                </div>
              </div>
            ))}
            <div style={{ fontSize: 12, color: '#7C8AA0', marginTop: 10, lineHeight: 1.6 }}>
              Se anúncio e orgânico tiverem taxas parecidas, o gargalo está <strong>depois do cadastro</strong> (produto) —
              trocar campanha não resolve. Se o anúncio for bem pior, a segmentação está trazendo gente errada.
            </div>
          </div>
        )}

        {/* Cadastros por dia */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>Cadastros por dia (14 dias)</div>
          <div style={{ fontSize: 12, color: '#5B6B82', marginBottom: 12 }}>🟦 anúncio · ⬜ orgânico/direto</div>
          {dias14.map(x => (
            <div key={x.dia} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 44, fontSize: 12, color: '#5B6B82' }}>{x.dia.slice(8, 10)}/{x.dia.slice(5, 7)}</div>
              <div style={{ flex: 1, background: '#EEF1F6', borderRadius: 8, height: 22, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(x.anuncio / maxDia) * 100}%`, background: AZUL, borderRadius: 8 }} />
                <div style={{ position: 'absolute', left: `${(x.anuncio / maxDia) * 100}%`, top: 0, bottom: 0, width: `${(x.organico / maxDia) * 100}%`, background: '#B9CFEA' }} />
              </div>
              <div style={{ width: 20, fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{x.total}</div>
            </div>
          ))}
        </div>

        {/* Assinantes */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ fontWeight: 800 }}>Assinantes com acesso ativo</div>
            <label style={{ fontSize: 12, color: '#5B6B82', display: 'flex', gap: 6, alignItems: 'center', cursor: 'pointer' }}>
              <input type="checkbox" checked={mostrarInternos} onChange={e => setMostrarInternos(e.target.checked)} />
              mostrar contas internas
            </label>
          </div>
          {assinantes.length === 0 && (
            <div style={{ fontSize: 14, color: '#5B6B82' }}>Nenhum assinante pagante ainda — quando a primeira venda cair, aparece aqui na hora. 🤞</div>
          )}
          {assinantes.map((a, i) => (
            <div key={i} style={{ borderTop: i ? '1px solid #EEF1F6' : 'none', padding: '10px 0', fontSize: 13.5 }}>
              <div style={{ fontWeight: 700 }}>{a.email} {a.interno && <span style={{ fontSize: 11, background: '#FFF3D6', color: '#7C4A00', borderRadius: 8, padding: '2px 8px', marginLeft: 6 }}>interna</span>}</div>
              <div style={{ color: '#5B6B82', marginTop: 2 }}>{a.canal} · válido até {dataBr(a.validoAte) === '—' ? 'renovação automática' : dataBr(a.validoAte)} · {a.xp} XP · 🔥 {a.streak}</div>
            </div>
          ))}
        </div>

        <div style={{ fontSize: 12.5, color: '#7C8AA0', lineHeight: 1.6 }}>
          ℹ️ Este painel mostra <strong>contas criadas</strong> (o funil que vira receita). Instalações da loja sem cadastro ficam no Play Console / App Store Connect.
        </div>
      </div>
    </div>
  )
}
