import Link from 'next/link'
import NativeEntry from './NativeEntry'
import { Footer, PlayBadge, AppStoreBadge, StickyCta } from './_marketing/ui'
import BaixarApp from './_marketing/BaixarApp'

export const metadata = {
  title: 'Vonai — Aprenda inglês conversando com IA',
  description: 'Um professor de inglês com IA que lembra de você, monta seu plano diário e te leva à fluência. Comece grátis.',
  alternates: { canonical: '/' },
}

const AZUL = '#1E63C7'
const ESCURO = '#103D77'

const FAQ = [
  { q: 'Onde eu baixo o aplicativo?', a: 'O Vonai está na Google Play (Android) e na App Store (iPhone/iPad) — busque "Vonai" ou acesse vonai.com.br/baixar, que leva direto à loja do seu celular. Baixar é grátis e você começa com 2 dias de Premium de brinde. Se preferir, também funciona direto no navegador.' },
  { q: 'O Vonai é grátis?', a: 'Você começa com 2 dias de Premium grátis, sem cartão de crédito. Depois, pode continuar no plano gratuito (com limites diários) ou assinar o Premium por R$29,90/mês ou R$289,80/ano para usar o Professor IA e o Simulador sem limites.' },
  { q: 'Funciona para quem está começando do zero?', a: 'Sim. A trilha vai do A1 (primeiras palavras) ao C2 (nível quase nativo), e um teste rápido de nivelamento posiciona você no ponto certo. As explicações são todas em português.' },
  { q: 'Como a IA corrige minha pronúncia?', a: 'Você lê frases em voz alta e o app compara o que você falou com o esperado, mostrando palavra por palavra o que ficou bom — com dicas específicas para os sons difíceis para brasileiros, como o "th" e o "-ed".' },
  { q: 'Em que o Vonai é diferente de Duolingo ou Babbel?', a: 'O Vonai é um professor de IA que lembra de você: seus erros, seu objetivo e sua pronúncia alimentam as próximas aulas. E é feito para brasileiros — as armadilhas do português (falsos cognatos, "I have 25 years") são parte do treino diário.' },
  { q: 'Funciona sem internet?', a: 'As lições da trilha funcionam offline depois do primeiro acesso. O Professor IA e o Simulador precisam de internet, pois conversam com a IA em tempo real.' },
  { q: 'Quanto tempo por dia eu preciso?', a: 'A partir de 5 minutos por dia. O app monta um plano diário realista para a sua meta, e a sequência (🔥) e as missões semanais ajudam a manter a constância — que é o que de fato leva à fluência.' },
]

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
    <div className="vn-body-pad" style={{ fontFamily: 'inherit', color: '#102A4C', background: '#fff' }}>
      {/* QR só faz sentido em tela grande: no celular a pessoa já ESTÁ no aparelho que
          baixa, então o QR some e ficam os selos das lojas. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .vn-qr, .vn-qr-dica { display: none; }
        @media (min-width: 900px) { .vn-qr { display: block; } .vn-qr-dica { display: inline; } }
      `}} />
      <NativeEntry />
      {/* Nav */}
      <div style={{ borderBottom: '1px solid #EEF1F6' }}>
        <div style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Von<span style={{ color: AZUL }}>ai</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <BaixarApp />
            <Link href="/login" style={{ color: AZUL, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>Entrar</Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: `linear-gradient(160deg, #2E72D6, ${ESCURO})`, color: '#fff' }}>
        <div style={{ ...container, display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', padding: '56px 20px 64px' }}>
          <div style={{ flex: '1 1 340px' }}>
            <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>🇧🇷 Feito para brasileiros</span>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>⭐ Nota 5,0 na App Store</span>
            </div>
            <h1 style={{ fontSize: 40, lineHeight: 1.1, fontWeight: 800, margin: '0 0 16px' }}>O aplicativo de inglês que <span style={{ color: '#FFD98A' }}>conversa com você</span> — e lembra de tudo.</h1>
            <p style={{ fontSize: 18, color: '#D6E6FA', lineHeight: 1.6, margin: '0 0 28px', maxWidth: 520 }}>Um professor particular de IA, 24h no seu bolso: monta seu plano de estudo todo dia, corrige sua pronúncia na hora e te leva do zero ao avançado.</p>
            {/* Download primeiro (decisão do dono 10/08): as lojas são a chamada principal.
                O QR só aparece em tela grande — quem está no computador aponta a câmera e
                cai direto na loja certa via /baixar. No celular ele seria inútil. */}
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <PlayBadge grande />
                <AppStoreBadge grande />
              </div>
              <div className="vn-qr" style={{ background: '#fff', borderRadius: 12, padding: 6, lineHeight: 0 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/qr-baixar.png" alt="QR code para baixar o app Vonai" width={104} height={104} />
              </div>
            </div>
            <div style={{ fontSize: 14, color: '#B5D4F4', marginBottom: 22 }}>Baixar é grátis — e os 2 primeiros dias são Premium, sem cartão. <span className="vn-qr-dica">Aponte a câmera do celular pro código ✨</span></div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
              <Link href="/cadastro" style={cta}>Ou comece pelo navegador →</Link>
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

      {/* Números / prova social — só número real; a nota 5,0 da App Store é verdadeira */}
      <div style={{ background: '#F6F8FB' }}>
        <div style={{ ...container, display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'space-around', padding: '28px 20px', textAlign: 'center' }}>
          {[['⭐ 5,0', 'nota na App Store'], ['+300', 'lições do A1 ao C2'], ['24h', 'professor de IA'], ['∞', 'conversas para praticar']].map(([n, l], i) => (
            <div key={i}><div style={{ fontSize: 28, fontWeight: 800, color: AZUL }}>{n}</div><div style={{ fontSize: 13, color: '#5B6B82' }}>{l}</div></div>
          ))}
        </div>
      </div>

      {/* O app por dentro — os MESMOS prints da ficha da Play (public/ads/play-*.png).
          Quem vê a tela de verdade confia mais do que em promessa; e o convite pra
          baixar vem logo embaixo, quando a curiosidade está no alto. */}
      <div style={{ ...container, padding: '52px 20px 8px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 8px' }}>Veja o app por dentro</h2>
        <p style={{ textAlign: 'center', color: '#5B6B82', fontSize: 16, margin: '0 0 26px' }}>É isso que você encontra assim que baixar:</p>
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', padding: '4px 4px 16px', WebkitOverflowScrolling: 'touch' }}>
          {/* Versão -mini.webp: os PNG originais da ficha somam 2 MB — em 4G isso derruba
              a "experiência da página de destino" do Google Ads. Os webp somam 116 KB. */}
          {[1, 2, 3, 4, 5].map(n => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={n} src={`/ads/play-${n}-mini.webp`} alt={`Tela ${n} do app Vonai`} loading="lazy" width={230} height={409}
              style={{ borderRadius: 16, border: '1px solid #E8ECF2', flex: '0 0 auto', boxShadow: '0 6px 18px rgba(16,42,76,0.10)' }} />
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 18, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <PlayBadge />
          <AppStoreBadge />
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
            {[['1', 'Baixe o app grátis', 'Google Play ou App Store — leva menos de um minuto. Prefere o navegador? Também funciona.'], ['2', 'Descubra seu nível', 'Um teste rápido de 2 minutos posiciona você no ponto certo da trilha, do A1 ao C2.'], ['3', 'Fale desde o 1º dia', 'Lições, conversas e correção de pronúncia todo dia — com um professor que lembra de tudo.']].map(([n, t, d]) => (
              <div key={n} style={{ textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: AZUL, color: '#fff', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>{n}</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{t}</div>
                <div style={{ fontSize: 14, color: '#5B6B82', lineHeight: 1.55, maxWidth: 300, margin: '0 auto' }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feito para brasileiros */}
      <div style={{ ...container, padding: '48px 20px 8px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 8px' }}>Feito para o brasileiro 🇧🇷</h2>
        <p style={{ textAlign: 'center', color: '#5B6B82', fontSize: 16, margin: '0 0 36px' }}>Apps gringos não sabem onde o português te derruba. O Vonai sabe.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
          <Beneficio e="🪤" t="Caça-Erros do Brasileiro" d='Treino diário das armadilhas clássicas: "I have 25 years", push ≠ puxe, pretend ≠ pretender.' />
          <Beneficio e="🗣️" t="Pronúncia para a nossa boca" d='Dicas específicas para os sons que não existem em português: th, -ed, h aspirado, "is-cul".' />
          <Beneficio e="💬" t="Feedback em português" d="A IA explica seus erros na sua língua — você entende o porquê, não só o quê." />
        </div>
        <p style={{ textAlign: 'center', fontSize: 14.5, marginTop: 24 }}>
          <Link href="/erros-de-ingles-do-brasileiro" style={{ color: AZUL, fontWeight: 600 }}>Ver os erros que todo brasileiro comete →</Link>
          <span style={{ color: '#C7D0DC', margin: '0 10px' }}>·</span>
          <Link href="/teste-de-nivel-de-ingles" style={{ color: AZUL, fontWeight: 600 }}>Descobrir meu nível em 2 min →</Link>
        </p>
      </div>

      {/* Planos e preços — transparência antes do cadastro qualifica o clique pago */}
      <div style={{ background: '#F6F8FB', marginTop: 48 }}>
        <div style={{ ...container, padding: '48px 20px 56px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 8px' }}>Planos simples, sem pegadinha</h2>
          <p style={{ textAlign: 'center', color: '#5B6B82', fontSize: 16, margin: '0 0 36px' }}>Todo mundo começa com 2 dias de Premium grátis — sem cartão de crédito.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, maxWidth: 720, margin: '0 auto' }}>
            {/* Grátis */}
            <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 20, padding: 26 }}>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Grátis</div>
              <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 2 }}>R$0</div>
              <div style={{ fontSize: 13, color: '#7C8AA0', marginBottom: 18 }}>para sempre</div>
              {['Lições da trilha (com limite diário)', 'Revisão inteligente de vocabulário', 'Caça-Erros do Brasileiro', 'Sequência, XP e missões'].map((t, i) => (
                <div key={i} style={{ fontSize: 14, color: '#5B6B82', marginBottom: 10, display: 'flex', gap: 8 }}><span style={{ color: '#16A34A' }}>✓</span>{t}</div>
              ))}
            </div>
            {/* Premium */}
            <div style={{ background: '#fff', border: `2px solid ${AZUL}`, borderRadius: 20, padding: 26, position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, right: 20, background: AZUL, color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>2 dias grátis</div>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Premium</div>
              <div style={{ fontSize: 30, fontWeight: 800, marginBottom: 2, color: AZUL }}>R$29,90<span style={{ fontSize: 15, fontWeight: 600, color: '#7C8AA0' }}>/mês</span></div>
              <div style={{ fontSize: 13, color: '#7C8AA0', marginBottom: 18 }}>ou R$289,80/ano (sai por R$24,15/mês)</div>
              {['Tudo do plano Grátis, sem limites', 'Professor IA ilimitado, 24h', 'Simulador de conversas ilimitado', 'Todas as +300 lições, do A1 ao C2', 'Relatório de evolução e trilha personalizada'].map((t, i) => (
                <div key={i} style={{ fontSize: 14, color: '#102A4C', fontWeight: 500, marginBottom: 10, display: 'flex', gap: 8 }}><span style={{ color: '#16A34A' }}>✓</span>{t}</div>
              ))}
              <Link href="/cadastro" style={{ ...cta, display: 'block', textAlign: 'center', marginTop: 18, fontSize: 15, padding: '13px 20px' }}>Testar grátis por 2 dias →</Link>
            </div>
          </div>
          <p style={{ textAlign: 'center', fontSize: 12.5, color: '#7C8AA0', marginTop: 22 }}>Renovação automática · Pix, cartão ou boleto · Cancele quando quiser, sem multa</p>
          <p style={{ textAlign: 'center', fontSize: 14, marginTop: 14 }}><Link href="/planos" style={{ color: AZUL, fontWeight: 600 }}>Ver a comparação completa dos planos →</Link></p>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ ...container, padding: '48px 20px 8px', maxWidth: 760 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 28px' }}>Perguntas frequentes</h2>
        {FAQ.map((f, i) => (
          <details key={i} style={{ background: '#F6F8FB', borderRadius: 14, padding: '16px 20px', marginBottom: 10, cursor: 'pointer' }}>
            <summary style={{ fontSize: 15.5, fontWeight: 700, color: '#102A4C' }}>{f.q}</summary>
            <p style={{ fontSize: 14.5, color: '#5B6B82', lineHeight: 1.6, margin: '10px 0 0' }}>{f.a}</p>
          </details>
        ))}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: FAQ.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }) }} />

      {/* CTA final — fechamento no download, com o navegador como alternativa */}
      <div style={{ background: `linear-gradient(160deg, #2E72D6, ${ESCURO})` }}>
        <div style={{ ...container, padding: '56px 20px', textAlign: 'center', color: '#fff' }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 10px' }}>Baixe o Vonai e fale inglês ainda hoje</h2>
          <p style={{ fontSize: 17, color: '#D6E6FA', margin: '0 0 26px' }}>Grátis na loja, 2 dias de Premium de brinde — e a primeira conversa leva 5 minutos.</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <PlayBadge grande />
            <AppStoreBadge grande />
          </div>
          <Link href="/cadastro" style={{ color: '#D6E6FA', fontSize: 15, fontWeight: 600 }}>Ou comece pelo navegador →</Link>
        </div>
      </div>

      {/* Barra fixa no celular: o download a um toque em qualquer ponto da página */}
      <StickyCta texto="📲 Baixar o app grátis" href="/baixar" />

      <Footer />
    </div>
  )
}
