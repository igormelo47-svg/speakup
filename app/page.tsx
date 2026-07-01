import Link from 'next/link'

export const metadata = {
  title: 'Vonai — Aprenda inglês conversando com IA',
  description: 'Um professor de inglês com IA que lembra de você, monta seu plano diário e te leva à fluência. Comece grátis.',
}

const AZUL = '#1E63C7'
const ESCURO = '#103D77'

function Beneficio({ e, t, d }: { e: string; t: string; d: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 30, marginBottom: 10 }}>{e}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#102A4C', marginBottom: 5 }}>{t}</div>
      <div style={{ fontSize: 14, color: '#5B6B82', lineHeight: 1.55 }}>{d}</div>
    </div>
  )
}

export default function Home() {
  const container: React.CSSProperties = { maxWidth: 1040, margin: '0 auto', padding: '0 20px' }
  const cta: React.CSSProperties = { display: 'inline-block', background: '#F5A623', color: '#fff', fontWeight: 700, fontSize: 16, padding: '14px 30px', borderRadius: 30, textDecoration: 'none', boxShadow: '0 6px 18px rgba(245,166,35,0.4)' }
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#102A4C', background: '#fff' }}>
      {/* Nav */}
      <div style={{ borderBottom: '1px solid #EEF1F6' }}>
        <div style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Von<span style={{ color: AZUL }}>ai</span></div>
          <Link href="/login" style={{ color: AZUL, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>Entrar</Link>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(160deg, #2E72D6, ${ESCURO})`, color: '#fff' }}>
        <div style={{ ...container, display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', padding: '56px 20px 64px' }}>
          <div style={{ flex: '1 1 340px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 18 }}>🤖 Inglês com Inteligência Artificial</div>
            <h1 style={{ fontSize: 40, lineHeight: 1.1, fontWeight: 800, margin: '0 0 16px' }}>Aprenda inglês conversando com uma IA que <span style={{ color: '#FFD98A' }}>lembra de você</span>.</h1>
            <p style={{ fontSize: 18, color: '#D6E6FA', lineHeight: 1.6, margin: '0 0 28px', maxWidth: 520 }}>Um professor particular 24h que monta seu plano de estudo todo dia, corrige sua pronúncia e te acompanha rumo à fluência — do zero ao avançado.</p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/login" style={cta}>Começar grátis →</Link>
              <span style={{ fontSize: 14, color: '#B5D4F4' }}>Sem cartão de crédito</span>
            </div>
          </div>
          {/* Mockup */}
          <div style={{ flex: '0 0 auto', margin: '0 auto' }}>
            <div style={{ width: 240, background: '#0C2E56', borderRadius: 30, padding: 12, boxShadow: '0 20px 50px rgba(0,0,0,0.35)' }}>
              <div style={{ background: '#F6F8FB', borderRadius: 22, padding: 14, minHeight: 380 }}>
                <div style={{ fontSize: 12, color: '#7C8AA0' }}>Boa tarde,</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 12 }}>Igor 🔥 5</div>
                <div style={{ background: ESCURO, borderRadius: 14, padding: 12, color: '#fff', marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: '#BCD6F2', fontWeight: 700, marginBottom: 8 }}>🎯 Seu plano de hoje</div>
                  {['📖 Faça sua lição', '🧠 Revisar vocabulário', '🎭 Conversar 5 min'].map((t, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 9, padding: '8px 10px', fontSize: 11.5, marginBottom: 6 }}>{t}</div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ flex: 1, background: '#EEE9FB', borderRadius: 10, padding: 10, fontSize: 11, fontWeight: 600, color: '#5B43C9' }}>🎭 Simulador</div>
                  <div style={{ flex: 1, background: '#E8F4FB', borderRadius: 10, padding: 10, fontSize: 11, fontWeight: 600, color: '#0F6FA8' }}>🎧 Listening</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Números / prova social */}
      <div style={{ background: '#F6F8FB' }}>
        <div style={{ ...container, display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-around', padding: '28px 20px', textAlign: 'center' }}>
          {[['+300', 'lições do A1 ao C2'], ['+320', 'palavras com revisão'], ['24h', 'professor de IA'], ['∞', 'conversas para praticar']].map(([n, l], i) => (
            <div key={i}><div style={{ fontSize: 28, fontWeight: 800, color: AZUL }}>{n}</div><div style={{ fontSize: 13, color: '#5B6B82' }}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* Benefícios */}
      <div style={{ ...container, padding: '56px 20px 20px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 8px' }}>Por que o Vonai é diferente</h2>
        <p style={{ textAlign: 'center', color: '#5B6B82', fontSize: 16, margin: '0 0 36px' }}>Não é uma lista de exercícios. É um professor que te acompanha.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
          <Beneficio e="🧠" t="IA com memória" d="Ela lembra dos seus erros e acertos e adapta cada aula ao seu histórico." />
          <Beneficio e="🎯" t="Plano diário automático" d="Você nunca precisa pensar no que estudar. O app decide por você, todo dia." />
          <Beneficio e="🎙️" t="Fale e seja corrigido" d="Treine pronúncia e converse em cenários reais com feedback instantâneo." />
          <Beneficio e="🗺️" t="Trilha do zero ao avançado" d="Uma jornada clara do A1 ao C2, com progresso visível a cada passo." />
          <Beneficio e="🔁" t="Revisão inteligente" d="As palavras voltam na hora certa, pouco antes de você esquecer." />
          <Beneficio e="🏆" t="Gamificação que motiva" d="Sequência, XP, conquistas e desafios que fazem você voltar todo dia." />
        </div>
      </div>

      {/* Como funciona */}
      <div style={{ background: '#F6F8FB', marginTop: 48 }}>
        <div style={{ ...container, padding: '48px 20px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 36px' }}>Como funciona</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[['1', 'Descubra seu nível', 'Um teste rápido posiciona você no ponto certo da trilha.'], ['2', 'Siga seu plano diário', 'Lições, conversas e revisões escolhidas pela IA todos os dias.'], ['3', 'Chegue à fluência', 'Evolua com um professor que lembra de tudo e te leva ao objetivo.']].map(([n, t, d]) => (
              <div key={n} style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: AZUL, color: '#fff', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>{n}</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{t}</div>
                <div style={{ fontSize: 14, color: '#5B6B82', lineHeight: 1.55, maxWidth: 300, margin: '0 auto' }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA final */}
      <div style={{ ...container, padding: '60px 20px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 12px' }}>Comece sua jornada hoje</h2>
        <p style={{ fontSize: 17, color: '#5B6B82', margin: '0 0 28px' }}>Crie sua conta grátis e faça sua primeira lição em minutos.</p>
        <Link href="/login" style={cta}>Começar grátis →</Link>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #EEF1F6', background: '#F6F8FB' }}>
        <div style={{ ...container, padding: '24px 20px', display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#7C8AA0' }}>
          <div>© {new Date().getFullYear()} Vonai</div>
          <div style={{ display: 'flex', gap: 18 }}>
            <Link href="/termos" style={{ color: '#7C8AA0' }}>Termos</Link>
            <Link href="/privacidade" style={{ color: '#7C8AA0' }}>Privacidade</Link>
            <Link href="/login" style={{ color: AZUL, fontWeight: 600 }}>Entrar</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
