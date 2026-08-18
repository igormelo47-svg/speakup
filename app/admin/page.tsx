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
type DiasDeUso = { umDia: number; doisATres: number; quatroASeis: number; seteOuMais: number }
type Funil = {
  profundidade: { criaramConta: number; abriramOApp: number; fizeramUmaLicao: number; fizeramTresLicoes: number }
  email?: { criaramConta: number; confirmaram: number; naoConfirmaram: number; naoConfirmaramENaoUsaram: number }
  permanencia: { abriramOApp: number; voltaramOutroDia: number; vivosNoFimDoTrial: number; voltaramDepoisDoTrial: number; assinaram: number; novasDemaisParaContar?: number }
  diasDeUso?: DiasDeUso
}
type Origem = 'anuncio' | 'organico' | 'todos'
type Canais = { contas: number; push: number; email: number; algumCanal: number; nenhumCanal: number; soPorEmail: number }
type Pendente = { id: number; email: string | null; tipo: string | null; resolvido: boolean; criado_em: string; s1: string | null; produto: string | null; nome: string | null }
type Recusado = { id: number; criado_em: string; origem: string; autorizado: boolean; tem_segredo: boolean | null; tem_token: boolean | null; tem_assinatura: boolean | null; tipo: string | null; bytes: number | null }
type Pendentes = { pendentes: Pendente[]; pendentes_erro: string | null; recusados: Recusado[] }
type Dados = {
  geradoEm: string
  totais: { contas: number; contas7d: number; viaAnuncio: number; assinantesReais: number; assinantesInternos: number; receitaMensalEstimada: number }
  ativacao?: { geral: Fatia; anuncio: Fatia; organico: Fatia }
  funil?: Funil
  funilPorOrigem?: Record<Origem, Funil>
  canais?: Canais
  diasDeUso?: DiasDeUso
  porDia: Dia[]
  assinantes: Assinante[]
}

// Um funil aninhado: cada degrau é subconjunto do anterior, a porcentagem é sempre
// sobre o primeiro degrau, e a maior queda entre dois degraus seguidos sai em vermelho
// -- é o único lugar onde mexer muda o resultado final.
function Funil({ titulo, degraus }: { titulo: string; degraus: [string, number, string][] }) {
  const base = Math.max(1, degraus[0][1])
  let piorI = 1, piorQueda = -1
  for (let i = 1; i < degraus.length; i++) {
    const antes = degraus[i - 1][1]
    const queda = antes > 0 ? (antes - degraus[i][1]) / antes : 0
    if (queda > piorQueda) { piorQueda = queda; piorI = i }
  }
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#102A4C', marginBottom: 10 }}>{titulo}</div>
      {degraus.map(([rotulo, valor, ajuda], i) => {
        const pct = Math.round((valor / base) * 100)
        const eOBuraco = i === piorI
        return (
          <div key={rotulo} style={{ marginBottom: 9 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 130, fontSize: 12.5, color: eOBuraco ? '#B91C1C' : '#5B6B82', fontWeight: eOBuraco ? 700 : 400 }}>{rotulo}</div>
              <div style={{ flex: 1, background: '#EEF1F6', borderRadius: 8, height: 22, overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(pct, valor > 0 ? 2 : 0)}%`, height: '100%', background: eOBuraco ? '#DC2626' : AZUL, borderRadius: 8 }} />
              </div>
              <div style={{ width: 74, fontSize: 12.5, fontWeight: 700, textAlign: 'right' }}>{valor} · {pct}%</div>
            </div>
            <div style={{ fontSize: 11, color: '#9AA7B8', marginLeft: 140, marginTop: 1 }}>{ajuda}</div>
          </div>
        )
      })}
      <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 4, marginLeft: 140 }}>
        Maior queda: {degraus[piorI - 1][0]} → {degraus[piorI][0]} ({Math.round(piorQueda * 100)}% somem aí)
      </div>
    </div>
  )
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
  // Começa em "anúncio" de propósito: boa parte do orgânico é gente que foi convidada
  // a olhar o app, não aluno. Misturar as duas dá um retrato mais feio do que a verdade.
  const [origem, setOrigem] = useState<Origem>('anuncio')
  // Pagamentos sem conta casada + batidas recusadas do webhook. Carrega separado do painel
  // principal: se a tabela ainda não existir, o resto do painel continua abrindo.
  const [pend, setPend] = useState<Pendentes | null>(null)
  const [alvo, setAlvo] = useState<Record<number, string>>({})
  const [liberando, setLiberando] = useState<number | null>(null)
  const [msgPend, setMsgPend] = useState<string>('')

  async function carregarPendentes(token: string) {
    try {
      const r = await fetch('/api/admin/pendentes', { headers: { Authorization: `Bearer ${token}` } })
      if (r.ok) setPend(await r.json())
    } catch {}
  }

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      if (!token) { setEstado('sem-login'); return }
      const r = await fetch('/api/admin/painel', { headers: { Authorization: `Bearer ${token}` } })
      if (r.status === 403) { setEstado('negado'); return }
      if (!r.ok) { setEstado('erro'); return }
      setDados(await r.json()); setEstado('ok')
      carregarPendentes(token)
    })().catch(() => setEstado('erro'))
  }, [])

  // Libera o Premium de um pendente: mesmo efeito do webhook numa compra aprovada.
  async function liberar(p: Pendente) {
    const quem = (alvo[p.id] || p.s1 || p.email || '').trim()
    if (!quem) { setMsgPend('Informe o e-mail do cadastro (ou o id do aluno).'); return }
    if (!confirm(`Liberar Premium para "${quem}"?`)) return
    setLiberando(p.id); setMsgPend('')
    try {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token || ''
      const r = await fetch('/api/admin/pendentes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_pendente: p.id, email_ou_user_id: quem }),
      })
      const j = await r.json().catch(() => ({}))
      if (!r.ok) { setMsgPend(`Não deu: ${j?.error || r.status}`); return }
      setMsgPend(`✅ Premium liberado para ${j.email || j.user_id} até ${dataBr(j.premium_expira)}.`)
      carregarPendentes(token)
    } catch { setMsgPend('Erro de rede ao liberar.') }
    finally { setLiberando(null) }
  }

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

        {/* Canais de retorno. Existe porque "ninguém volta no 2º dia" só é veredicto
            sobre o produto se a pessoa tiver sido chamada de volta. Se ninguém foi
            convidado, o número não diz nada sobre o app. */}
        {d.canais && (() => {
          const c = d.canais
          const pct = (n: number) => Math.round((n / Math.max(1, c.contas)) * 100)
          const critico = c.nenhumCanal > c.algumCanal
          return (
            <div style={{ ...card, marginBottom: 16 }}>
              <div style={{ fontWeight: 800, marginBottom: 4 }}>Canais de retorno — por onde dá para chamar de volta</div>
              <div style={{ fontSize: 12, color: '#5B6B82', marginBottom: 12 }}>
                Push só funciona para quem aceitou a permissão, e no iPhone da App Store não existe. E-mail cobre o resto.
              </div>
              {([
                ['🔔 Aceitaram push', c.push, '#1E63C7'],
                ['✉️ Alcançáveis por e-mail', c.email, '#16A34A'],
                ['📭 Só por e-mail (sem push)', c.soPorEmail, '#65A30D'],
                ['🚫 Nenhum canal', c.nenhumCanal, '#DC2626'],
              ] as [string, number, string][]).map(([rotulo, valor, cor]) => (
                <div key={rotulo} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 168, fontSize: 12.5, color: '#5B6B82' }}>{rotulo}</div>
                  <div style={{ flex: 1, background: '#EEF1F6', borderRadius: 8, height: 22, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(pct(valor), valor > 0 ? 2 : 0)}%`, height: '100%', background: cor, borderRadius: 8 }} />
                  </div>
                  <div style={{ width: 70, fontSize: 12.5, fontWeight: 700, textAlign: 'right' }}>{valor} · {pct(valor)}%</div>
                </div>
              ))}
              <div style={{ fontSize: 12.5, color: critico ? '#B91C1C' : '#7C8AA0', marginTop: 10, lineHeight: 1.6, borderTop: '1px solid #EEF1F6', paddingTop: 10 }}>
                {critico
                  ? <>A maior parte da base <strong>não tem por onde ser chamada de volta</strong>. Enquanto for assim, &quot;ninguém voltou no 2º dia&quot; não diz nada sobre o app — diz que ninguém foi convidado.</>
                  : <>{c.algumCanal} de {c.contas} contas têm pelo menos um canal. As {c.nenhumCanal} sem canal nenhum só voltam se lembrarem sozinhas.</>}
              </div>
            </div>
          )
        })()}

        {/* Funil — onde as pessoas somem. A maior queda entre dois degraus é o lugar
            para trabalhar; enquanto o buraco estiver antes do último, mexer em preço
            é resolver o problema errado. */}
        {(d.funilPorOrigem || d.funil) && (() => {
          const f: Funil = d.funilPorOrigem ? d.funilPorOrigem[origem] : d.funil!
          const poucoDado = f.profundidade.criaramConta < 20
          return (
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 4 }}>Onde as pessoas somem</div>
            <div style={{ fontSize: 12, color: '#5B6B82', marginBottom: 12 }}>
              Dois funis separados de propósito: um mede <strong>até onde a pessoa foi</strong>, outro mede <strong>se ela voltou</strong>.
              Misturar os dois numa lista só apontaria o degrau errado. A barra vermelha é a maior queda de cada um.
            </div>

            {/* Quem decide o negócio é a coluna do anúncio. O orgânico está cheio de gente
                convidada a olhar o app, que entra, vê e sai -- não é aluno. */}
            {d.funilPorOrigem && (
              <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                {([['anuncio', '🎯 Só anúncio'], ['organico', '🤝 Só orgânico'], ['todos', 'Todos']] as [Origem, string][]).map(([k, rotulo]) => (
                  <button key={k} onClick={() => setOrigem(k)} style={{
                    fontSize: 12.5, fontWeight: 700, padding: '7px 13px', borderRadius: 20, cursor: 'pointer',
                    border: origem === k ? `1px solid ${AZUL}` : '1px solid #E2E8F0',
                    background: origem === k ? AZUL : '#fff', color: origem === k ? '#fff' : '#5B6B82',
                  }}>{rotulo} · {d.funilPorOrigem![k].profundidade.criaramConta}</button>
                ))}
              </div>
            )}
            {origem === 'organico' && (
              <div style={{ fontSize: 12, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '9px 12px', marginBottom: 12, lineHeight: 1.55 }}>
                Boa parte destas contas é gente convidada a baixar e avaliar. Elas entram, olham e saem — isso não é churn de aluno. Não tire conclusão de produto daqui.
              </div>
            )}
            {poucoDado && (
              <div style={{ fontSize: 12, color: '#92400E', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '9px 12px', marginBottom: 12, lineHeight: 1.55 }}>
                São só {f.profundidade.criaramConta} contas neste recorte. Serve para ver a direção, não para concluir: uma pessoa a mais ou a menos mexe muito na porcentagem.
              </div>
            )}

            <Funil
              titulo="Profundidade — até onde chegou na primeira vez"
              degraus={[
                ['Criaram conta', f.profundidade.criaramConta, 'chegaram até o cadastro'],
                ['Abriram o app', f.profundidade.abriramOApp, 'fizeram nivelamento, lição ou conversa'],
                ['1ª lição', f.profundidade.fizeramUmaLicao, 'concluíram pelo menos uma lição'],
                ['3 lições', f.profundidade.fizeramTresLicoes, 'já pegaram o ritmo'],
              ]}
            />
            <div style={{ height: 18 }} />
            {!!f.permanencia.novasDemaisParaContar && (
              <div style={{ fontSize: 12, color: '#5B6B82', background: '#F6F8FB', borderRadius: 10, padding: '9px 12px', marginBottom: 10, lineHeight: 1.55 }}>
                {f.permanencia.novasDemaisParaContar} {f.permanencia.novasDemaisParaContar === 1 ? 'conta ficou de fora' : 'contas ficaram de fora'} do funil abaixo por {f.permanencia.novasDemaisParaContar === 1 ? 'ser nova' : 'serem novas'} demais — quem se cadastrou ontem ainda não teve chance de voltar, e contar como perda seria fabricar churn.
              </div>
            )}
            <Funil
              titulo="Permanência — quem continuou existindo"
              degraus={[
                ['Abriram o app', f.permanencia.abriramOApp, 'ponto de partida (só quem já teve tempo de voltar)'],
                ['Voltaram outro dia', f.permanencia.voltaramOutroDia, 'usaram em 2 dias diferentes ou mais'],
                ['Vivos no fim do trial', f.permanencia.vivosNoFimDoTrial, 'ainda usavam quando os dias grátis acabaram (2 dias até 18/08, 7 depois)'],
                ['Voltaram depois do trial', f.permanencia.voltaramDepoisDoTrial, 'usaram o app já sem Premium'],
                ['Assinaram', f.permanencia.assinaram, 'viraram pagantes'],
              ]}
            />
            {/* A barreira do e-mail explica ou descarta a primeira queda de uma vez: quem
                nunca confirmou não conseguia entrar, e some sem nunca ter visto o app. */}
            {f.email && (() => {
              const e = f.email!
              const culpado = e.naoConfirmaram > 0 && e.naoConfirmaramENaoUsaram >= Math.max(1, Math.round((f.profundidade.criaramConta - f.profundidade.abriramOApp) * 0.5))
              return (
                <div style={{ marginTop: 18, background: culpado ? '#FEF2F2' : '#F0FDF4', border: `1px solid ${culpado ? '#FECACA' : '#BBF7D0'}`, borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: culpado ? '#B91C1C' : '#15803D', marginBottom: 6 }}>
                    {culpado ? '⚠️ A confirmação de e-mail está engolindo o funil' : '✅ A confirmação de e-mail não é o problema'}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#5B6B82', lineHeight: 1.65 }}>
                    <strong>{e.naoConfirmaram}</strong> de {e.criaramConta} contas nunca confirmaram o e-mail —
                    e <strong>{e.naoConfirmaramENaoUsaram}</strong> delas também nunca abriram o app.
                    {culpado
                      ? ' Isso é a maior perda do produto, e não é o app: quem não clica no link do e-mail não consegue entrar. Desligar "Confirm email" no Supabase (Authentication → Providers → Email) devolve essa gente ao funil no mesmo dia.'
                      : ' A perda entre cadastro e primeiro uso está no app, não no e-mail.'}
                  </div>
                </div>
              )
            })()}
            {/* Quantos dias cada pessoa usou. "1 dia" é a coluna que dói: entrou, olhou
                e nunca mais voltou. Segue o mesmo recorte de origem escolhido acima. */}
            {(f.diasDeUso || d.diasDeUso) && (() => {
              const du = f.diasDeUso || d.diasDeUso!
              const total = Math.max(1, du.umDia + du.doisATres + du.quatroASeis + du.seteOuMais)
              return (
                <div style={{ marginTop: 18, borderTop: '1px solid #EEF1F6', paddingTop: 14 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#102A4C', marginBottom: 10 }}>Quantos dias cada pessoa usou <span style={{ fontWeight: 400, color: '#9AA7B8' }}>— só quem abriu o app</span></div>
                  {([['Só 1 dia', du.umDia, '#DC2626'], ['2 a 3 dias', du.doisATres, '#F59E0B'], ['4 a 6 dias', du.quatroASeis, '#65A30D'], ['7 dias ou mais', du.seteOuMais, '#16A34A']] as [string, number, string][]).map(([rotulo, valor, cor]) => (
                    <div key={rotulo} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 108, fontSize: 12.5, color: '#5B6B82' }}>{rotulo}</div>
                      <div style={{ flex: 1, background: '#EEF1F6', borderRadius: 8, height: 22, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.round((valor / total) * 100)}%`, height: '100%', background: cor, borderRadius: 8 }} />
                      </div>
                      <div style={{ width: 68, fontSize: 12.5, fontWeight: 700, textAlign: 'right' }}>{valor} · {Math.round((valor / total) * 100)}%</div>
                    </div>
                  ))}
                </div>
              )
            })()}

            <div style={{ fontSize: 12.5, color: '#7C8AA0', marginTop: 14, lineHeight: 1.6, borderTop: '1px solid #EEF1F6', paddingTop: 10 }}>
              Enquanto o buraco estiver antes de &quot;Vivos no fim do trial&quot;, o problema <strong>não é preço</strong>:
              a pessoa desiste antes de ter motivo para pagar, e baixar o valor não muda nada.
            </div>
          </div>
          )
        })()}

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

        {/* Pagamentos sem conta casada. A Kiwify chamou o webhook, mas o e-mail do checkout
            não bate com nenhum cadastro (e não veio s1). O dono casa na mão aqui. */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>Pagamentos sem conta casada</div>
          <div style={{ fontSize: 12, color: '#5B6B82', marginBottom: 12 }}>
            A Kiwify avisou o pagamento, mas o e-mail do checkout não é o do cadastro. Digite o e-mail (ou o id) da conta do aluno e clique em Liberar — faz o mesmo que o webhook faria.
          </div>
          {!pend && <div style={{ fontSize: 13, color: '#5B6B82' }}>Carregando…</div>}
          {pend?.pendentes_erro && <div style={{ fontSize: 12.5, color: '#B91C1C' }}>Tabela pagamentos_pendentes indisponível: {pend.pendentes_erro} (aplicar migracao_2026-08-18_freemium.sql)</div>}
          {pend && !pend.pendentes_erro && pend.pendentes.filter(p => !p.resolvido).length === 0 && (
            <div style={{ fontSize: 13.5, color: '#15803D' }}>✅ Nenhum pagamento pendente.</div>
          )}
          {pend?.pendentes.filter(p => !p.resolvido).map((p, i) => (
            <div key={p.id} style={{ borderTop: i ? '1px solid #EEF1F6' : 'none', padding: '10px 0', fontSize: 13.5 }}>
              <div style={{ fontWeight: 700 }}>{p.email || '(sem e-mail)'} {p.nome && <span style={{ fontWeight: 400, color: '#5B6B82' }}>· {p.nome}</span>}</div>
              <div style={{ color: '#5B6B82', marginTop: 2, fontSize: 12.5 }}>{dataBr(p.criado_em)} · {p.tipo || '?'} · {p.produto || 'produto ?'}{p.s1 && <> · s1: <code>{p.s1}</code></>}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                <input
                  value={alvo[p.id] ?? (p.s1 || p.email || '')}
                  onChange={e => setAlvo(a => ({ ...a, [p.id]: e.target.value }))}
                  placeholder="e-mail do cadastro ou id do aluno"
                  style={{ flex: 1, minWidth: 200, padding: '8px 10px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }}
                />
                <button onClick={() => liberar(p)} disabled={liberando === p.id} style={{ padding: '8px 14px', borderRadius: 8, border: 'none', background: AZUL, color: '#fff', fontWeight: 700, cursor: 'pointer', opacity: liberando === p.id ? 0.6 : 1 }}>
                  {liberando === p.id ? 'Liberando…' : 'Liberar'}
                </button>
              </div>
            </div>
          ))}
          {msgPend && <div style={{ fontSize: 13, marginTop: 10, color: msgPend.startsWith('✅') ? '#15803D' : '#B91C1C' }}>{msgPend}</div>}
          {!!pend?.pendentes.filter(p => p.resolvido).length && (
            <div style={{ fontSize: 12, color: '#9AA7B8', marginTop: 10 }}>{pend.pendentes.filter(p => p.resolvido).length} já resolvido(s) nos últimos 50.</div>
          )}
        </div>

        {/* Batidas recusadas do webhook (401). Foi o que escondeu a 1ª venda do Android em 17/08:
            se aparecer linha aqui com tem_token=não ou tem_segredo=não, o token na Kiwify/Vercel
            está errado ou ausente — arrumar lá, não no código. */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>Webhooks recusados (últimos 20)</div>
          <div style={{ fontSize: 12, color: '#5B6B82', marginBottom: 12 }}>
            Chamadas que bateram no webhook e levaram 401. Se houver linha recente: conferir o <code>?token=</code> na Kiwify e a env <code>KIWIFY_TOKEN</code> na Vercel.
          </div>
          {pend && pend.recusados.length === 0 && <div style={{ fontSize: 13.5, color: '#15803D' }}>✅ Nenhuma chamada recusada registrada.</div>}
          {pend?.recusados.map((r, i) => (
            <div key={r.id} style={{ borderTop: i ? '1px solid #EEF1F6' : 'none', padding: '8px 0', fontSize: 12.5, color: '#5B6B82' }}>
              <strong style={{ color: '#B91C1C' }}>{new Date(r.criado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</strong>
              {' '}· {r.origem} · tipo: {r.tipo || '?'} · segredo no servidor: {r.tem_segredo ? 'sim' : 'NÃO'} · veio token: {r.tem_token ? 'sim' : 'não'} · veio assinatura: {r.tem_assinatura ? 'sim' : 'não'} · {r.bytes ?? 0} bytes
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
