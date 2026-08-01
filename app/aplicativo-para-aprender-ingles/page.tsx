import Link from 'next/link'

// Landing de tráfego pago para a busca "aplicativo para aprender inglês" (e variações).
// Existe para duas coisas: (1) índice de qualidade do Google Ads — o texto conversa com
// a busca exata, por isso o slug, o h1 e as seções repetem a linguagem do usuário;
// (2) conversão — estrutura dor → demonstração → projeção → risco zero → ação.
// Gatilhos usados são honestos: nota 5,0 real da App Store, teste grátis real, números
// reais do app. NUNCA inventar depoimento/contador falso. Sincronia visual com a home.

export const metadata = {
  title: 'Aplicativo para Aprender Inglês Falando — Vonai | 2 dias grátis',
  description:
    'Procurando um aplicativo para aprender inglês de verdade? No Vonai você aprende falando: professor de IA 24h que corrige sua pronúncia, +300 lições do zero ao avançado e conversas de situações reais. Nota 5,0 na App Store. Teste grátis, sem cartão.',
  alternates: { canonical: '/aplicativo-para-aprender-ingles' },
}

const AZUL = '#1E63C7'
const ESCURO = '#103D77'
const LARANJA = '#F5A623'
const PLAY_URL = 'https://play.google.com/store/apps/details?id=app.vercel.speakup_dusky.twa'
const APP_STORE_URL = 'https://apps.apple.com/br/app/vonai/id6788121941'

const FAQ = [
  { q: 'Qual o melhor aplicativo para aprender inglês sozinho?', a: 'O melhor aplicativo é o que faz você FALAR — é falando que a fluência aparece. O Vonai foi construído em volta disso: um professor de IA disponível 24h conversa com você, corrige sua pronúncia na hora e explica os erros em português. Apps de memorização ensinam palavras; o Vonai ensina você a usá-las numa conversa.' },
  { q: 'O aplicativo é grátis?', a: 'Você começa com 2 dias de Premium grátis, sem cadastrar cartão de crédito. Depois pode continuar no plano gratuito (com limites diários) ou assinar o Premium por R$29,90/mês. Sem multa e sem fidelidade: cancela quando quiser.' },
  { q: 'Funciona para quem está começando do zero?', a: 'Sim. Um teste rápido descobre seu nível e a trilha começa exatamente do seu ponto — do A1 (primeiras palavras) ao C2 (quase nativo). Todas as explicações são em português.' },
  { q: 'Como o aplicativo corrige minha pronúncia?', a: 'Você fala com o app e ele analisa palavra por palavra, com dicas específicas para os sons que não existem em português — o "th" de three, o "-ed" de worked, o H aspirado. É treino de pronúncia feito para a boca do brasileiro.' },
  { q: 'Funciona no celular Android e no iPhone?', a: 'Sim. O Vonai está na Google Play (Android) e na App Store (iPhone/iPad) — e também funciona direto pelo navegador em vonai.com.br. Mesma conta, mesmo progresso em todos os aparelhos.' },
  { q: 'Quanto tempo por dia preciso estudar?', a: 'A partir de 5 minutos. O app monta um plano diário realista e a sequência de dias (🔥) ajuda a manter a constância — estudar um pouco todo dia vale mais do que uma hora uma vez por semana.' },
]

function Card({ e, t, d }: { e: string; t: string; d: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 30, marginBottom: 10 }}>{e}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#102A4C', marginBottom: 5 }}>{t}</div>
      <div style={{ fontSize: 14, color: '#5B6B82', lineHeight: 1.55 }}>{d}</div>
    </div>
  )
}

// target="_blank" é obrigatório: o navegador interno do Instagram/Facebook engole a
// navegação para domínio externo na mesma janela — o toque parece "morto" sem isso.
function LojaBadge({ href, icone, acima, nome }: { href: string; icone: React.ReactNode; acima: string; nome: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#000', color: '#fff', borderRadius: 12, padding: '10px 18px', textDecoration: 'none' }}>
      {icone}
      <span style={{ textAlign: 'left', lineHeight: 1.15 }}>
        <span style={{ display: 'block', fontSize: 10.5, opacity: 0.85 }}>{acima}</span>
        <span style={{ display: 'block', fontSize: 16, fontWeight: 700 }}>{nome}</span>
      </span>
    </a>
  )
}
// Logo da Apple em SVG (path do Font Awesome Free/brands, CC BY 4.0) — emoji de maçã
// destoava e o  (U+F8FF) só renderiza em aparelhos Apple.
function AppleSvg() {
  return (
    <svg width="22" height="26" viewBox="0 0 384 512" aria-hidden="true">
      <path fill="#fff" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  )
}
function PlaySvg() {
  return (
    <svg width="22" height="24" viewBox="0 0 512 512" aria-hidden="true">
      <path fill="#34A853" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1z" />
      <path fill="#4285F4" d="M47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0z" />
      <path fill="#FBBC04" d="M472.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z" />
      <path fill="#EA4335" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
    </svg>
  )
}
function PlayBadge() {
  return <LojaBadge href={PLAY_URL} icone={<PlaySvg />} acima="Disponível no" nome="Google Play" />
}
function AppStoreBadge() {
  return <LojaBadge href={APP_STORE_URL} icone={<AppleSvg />} acima="Baixar na" nome="App Store" />
}

export default function AplicativoParaAprenderIngles() {
  const container: React.CSSProperties = { maxWidth: 1040, margin: '0 auto', padding: '0 20px' }
  const cta: React.CSSProperties = { display: 'inline-block', background: LARANJA, color: '#fff', fontWeight: 700, fontSize: 16, padding: '14px 30px', borderRadius: 30, textDecoration: 'none', boxShadow: '0 6px 18px rgba(245,166,35,0.4)' }
  return (
    <div style={{ fontFamily: 'inherit', color: '#102A4C', background: '#fff' }}>
      {/* Barra fixa de CTA no celular — a maioria do tráfego pago é mobile e o botão
          precisa estar SEMPRE a um toque, em qualquer ponto da rolagem. */}
      <style dangerouslySetInnerHTML={{ __html: `
        .vn-sticky-cta { display: none; }
        @media (max-width: 720px) {
          .vn-sticky-cta { display: flex; position: fixed; left: 0; right: 0; bottom: 0; z-index: 50;
            background: #fff; border-top: 1px solid #E8ECF2; padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
            gap: 10px; align-items: center; justify-content: space-between; box-shadow: 0 -6px 18px rgba(16,42,76,0.08); }
          .vn-body-pad { padding-bottom: 76px; }
        }
      `}} />

      {/* Nav */}
      <div style={{ borderBottom: '1px solid #EEF1F6' }}>
        <div style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>
          <Link href="/" style={{ fontSize: 20, fontWeight: 800, color: '#102A4C', textDecoration: 'none' }}>Von<span style={{ color: AZUL }}>ai</span></Link>
          <Link href="/login" style={{ color: AZUL, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>Entrar</Link>
        </div>
      </div>

      <div className="vn-body-pad">
        {/* Hero — fala a língua da busca + prova social real */}
        <div style={{ background: `linear-gradient(160deg, #2E72D6, ${ESCURO})`, color: '#fff' }}>
          <div style={{ ...container, padding: '52px 20px 56px', maxWidth: 860, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 18 }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>🇧🇷 Feito para brasileiros</span>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>⭐ Nota 5,0 na App Store</span>
            </div>
            <h1 style={{ fontSize: 38, lineHeight: 1.15, fontWeight: 800, margin: '0 0 16px' }}>O aplicativo para aprender inglês <span style={{ color: '#FFD98A' }}>falando</span> — não decorando.</h1>
            <p style={{ fontSize: 18, color: '#D6E6FA', lineHeight: 1.6, margin: '0 auto 26px', maxWidth: 640 }}>Um professor de IA disponível 24h conversa com você, corrige sua pronúncia na hora e monta seu plano de estudo todo dia. Do zero ao avançado, no seu ritmo.</p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
              <Link href="/cadastro" style={cta}>Testar grátis agora →</Link>
              <PlayBadge />
              <AppStoreBadge />
            </div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', marginTop: 20, fontSize: 13.5, color: '#B5D4F4' }}>
              <span>✓ 2 dias de Premium grátis</span>
              <span>✓ Sem cartão de crédito</span>
              <span>✓ Começar leva 2 min — cancelar, 1 toque</span>
            </div>
          </div>
        </div>

        {/* Demonstração — ver o produto vale mais que qualquer promessa */}
        <div style={{ ...container, padding: '52px 20px 8px', maxWidth: 860 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 8px' }}>Veja como é uma aula de verdade</h2>
          <p style={{ textAlign: 'center', color: '#5B6B82', fontSize: 16, margin: '0 0 30px' }}>Você fala. A IA entende, corrige e explica — em português, sem julgamento.</p>
          <div style={{ maxWidth: 480, margin: '0 auto', background: '#F6F8FB', borderRadius: 22, padding: '22px 18px', border: '1px solid #E8ECF2' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <div style={{ background: AZUL, color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', fontSize: 14.5, maxWidth: '80%' }}>🎙️ &quot;I have 34 years and I work with sales.&quot;</div>
            </div>
            <div style={{ display: 'flex', marginBottom: 10 }}>
              <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: '16px 16px 16px 4px', padding: '12px 14px', fontSize: 14.5, maxWidth: '85%', lineHeight: 1.55 }}>
                Quase perfeito! 👏 Só um detalhe clássico de brasileiro: em inglês a gente não <em>tem</em> anos, a gente <em>é</em> — <strong>&quot;I&apos;m 34 years old&quot;</strong>. Tenta de novo?
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
              <div style={{ background: AZUL, color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', fontSize: 14.5, maxWidth: '80%' }}>🎙️ &quot;I&apos;m 34 years old and I work with sales.&quot;</div>
            </div>
            <div style={{ display: 'flex' }}>
              <div style={{ background: '#EAF7EE', border: '1px solid #CDEBD6', borderRadius: '16px 16px 16px 4px', padding: '12px 14px', fontSize: 14.5, maxWidth: '85%', lineHeight: 1.55 }}>
                ✅ <strong>Perfeito!</strong> Pronúncia: 9/10 — o &quot;years&quot; saiu redondo. Bora usar isso numa simulação de entrevista?
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 26 }}>
            <Link href="/cadastro" style={cta}>Quero uma aula assim →</Link>
          </div>
        </div>

        {/* Dor → empatia */}
        <div style={{ ...container, padding: '52px 20px 8px', maxWidth: 820, textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px' }}>Você entende inglês… mas trava na hora de falar?</h2>
          <p style={{ color: '#5B6B82', fontSize: 16.5, lineHeight: 1.65, margin: '0 0 34px' }}>É o problema nº 1 de quem estuda inglês no Brasil: anos de curso, e a voz some na frente de um gringo. Não é falta de capacidade — é falta de <strong>prática de conversa sem medo de errar</strong>. E é exatamente isso que um aplicativo com IA resolve.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, textAlign: 'left' }}>
            <Card e="😳" t="Vergonha de errar?" d="Com a IA, não existe plateia. Erre à vontade, seja corrigido na hora e tente de novo — é assim que se destrava." />
            <Card e="⏰" t="Sem tempo pra curso?" d="5 minutos por dia, no celular, na fila ou no ônibus. O app monta o plano do dia por você." />
            <Card e="💸" t="Curso caro demais?" d="Uma aula particular custa R$60–100. O Vonai é um professor 24h por menos de R$1 por dia." />
          </div>
        </div>

        {/* Aplicativo × curso — conteúdo que conversa com a intenção da busca */}
        <div style={{ background: '#F6F8FB', marginTop: 48 }}>
          <div style={{ ...container, padding: '48px 20px', maxWidth: 820 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 10px' }}>Aplicativo ou curso de inglês?</h2>
            <p style={{ color: '#5B6B82', fontSize: 16, lineHeight: 1.65, textAlign: 'center', margin: '0 0 30px' }}>Um curso tem horário, mensalidade alta e uma turma inteira dividindo o professor. Um aplicativo para aprender inglês vai no seu bolso, custa uma fração e está disponível na hora que você está — de manhã, no almoço ou às 2h da madrugada. O que a maioria dos apps não tinha, até agora, era o principal do curso: <strong>alguém que conversa com você e corrige</strong>. O Vonai tem.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
              <Card e="🎙️" t="Fale desde o 1º dia" d="Conversas reais com o professor de IA: entrevista de emprego, viagem, restaurante e +20 situações." />
              <Card e="🗣️" t="Pronúncia corrigida na hora" d='Análise palavra por palavra, com dicas para os sons que o brasileiro erra: o "th", o "-ed", o H aspirado.' />
              <Card e="🗺️" t="+300 lições, do A1 ao C2" d="Trilha completa do zero ao avançado, com teste de nivelamento para começar do seu ponto." />
              <Card e="🧠" t="IA que lembra de você" d="Seus erros e seu objetivo alimentam as próximas aulas. Cada dia o treino é seu, não genérico." />
              <Card e="🔁" t="Revisão na hora certa" d="As palavras voltam pouco antes de você esquecer — memorização de verdade, sem decoreba." />
              <Card e="🏆" t="Constância que vira hábito" d="Sequência de dias, XP e missões: 5 minutos por dia que você não vai querer perder." />
            </div>
          </div>
        </div>

        {/* Projeção de resultado — o cliente compra o futuro, não o app */}
        <div style={{ ...container, padding: '52px 20px 8px', maxWidth: 820, textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px' }}>Imagine você daqui a 90 dias</h2>
          <p style={{ color: '#5B6B82', fontSize: 16, margin: '0 0 30px' }}>Com 5 minutos por dia, em 3 meses são +90 conversas praticadas. É assim que estas cenas deixam de ser sonho:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16, textAlign: 'left' }}>
            <Card e="💼" t="A entrevista em inglês" d='"Tell me about yourself" — e você responde sem travar, porque já treinou essa exata conversa dezenas de vezes.' />
            <Card e="✈️" t="A viagem sem apuros" d="Imigração, hotel, restaurante, Uber: você já viveu cada cena no simulador antes de viver de verdade." />
            <Card e="🎬" t="A série sem legenda" d="O ouvido acostumado com o listening diário começa a pescar as frases — e vira orgulho, não frustração." />
          </div>
          <p style={{ color: '#102A4C', fontSize: 16.5, fontWeight: 600, margin: '30px 0 4px' }}>A única diferença entre esse futuro e o de sempre é começar hoje.</p>
          <p style={{ color: '#7C8AA0', fontSize: 14, margin: '0 0 22px' }}>Daqui a 90 dias você vai ter 90 dias a mais — com ou sem inglês. Você escolhe.</p>
          <Link href="/cadastro" style={cta}>Começar meus 90 dias →</Link>
        </div>

        {/* Como funciona — 3 passos, sem fricção */}
        <div style={{ background: '#F6F8FB', marginTop: 48 }}>
          <div style={{ ...container, padding: '48px 20px' }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 32px' }}>Comece em 3 passos (leva 2 minutos)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
              {[['1', 'Crie sua conta grátis', 'Sem cartão de crédito. Você ganha 2 dias de Premium completo.'], ['2', 'Descubra seu nível', 'Um teste rápido posiciona você na trilha — do A1 ao C2.'], ['3', 'Faça sua primeira conversa', 'Fale com o professor de IA ainda hoje e sinta a diferença.']].map(([n, t, d]) => (
                <div key={n} style={{ textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: AZUL, color: '#fff', fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>{n}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{t}</div>
                  <div style={{ fontSize: 14, color: '#5B6B82', lineHeight: 1.55, maxWidth: 300, margin: '0 auto' }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Por que funciona — autoridade sem jargão */}
        <div style={{ ...container, padding: '48px 20px 8px', maxWidth: 820 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 10px' }}>Por que aprender inglês falando funciona</h2>
          <p style={{ color: '#5B6B82', fontSize: 16, lineHeight: 1.7, margin: '0 0 14px' }}>A ciência da aquisição de idiomas é clara em dois pontos: você aprende quando <strong>entende mensagens um degrau acima do seu nível</strong> — e consolida quando <strong>produz a língua falando</strong>. Aula que é só leitura e múltipla escolha treina você para... leitura e múltipla escolha.</p>
          <p style={{ color: '#5B6B82', fontSize: 16, lineHeight: 1.7, margin: 0 }}>Por isso o Vonai combina os dois: a trilha de lições te dá o insumo no nível certo, e o professor de IA te faz usar tudo numa conversa — com correção imediata, que é quando o cérebro de fato grava. E como a IA não julga ninguém, o maior bloqueio do brasileiro (a vergonha) sai da equação.</p>
        </div>

        {/* Preço transparente — remove a objeção antes do cadastro */}
        <div style={{ ...container, padding: '48px 20px 8px', maxWidth: 640, textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px' }}>Quanto custa?</h2>
          <p style={{ color: '#5B6B82', fontSize: 16.5, lineHeight: 1.65, margin: '0 0 18px' }}>Depois dos 2 dias grátis, o Premium custa <strong style={{ color: '#102A4C' }}>R$29,90/mês</strong> (ou R$289,80/ano, que sai por R$24,15/mês) — menos de R$1 por dia por um professor disponível 24h. Pix, cartão ou boleto. <strong>Cancele quando quiser, sem multa.</strong></p>
          <p style={{ color: '#7C8AA0', fontSize: 14, margin: 0 }}>Prefere não assinar? Existe um plano gratuito com limites diários. Você decide depois de testar.</p>
        </div>

        {/* FAQ */}
        <div style={{ ...container, padding: '48px 20px 8px', maxWidth: 760 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 28px' }}>Perguntas de quem chegou até aqui</h2>
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

        {/* CTA final — a última chance de dizer sim */}
        <div style={{ background: `linear-gradient(160deg, #2E72D6, ${ESCURO})`, marginTop: 48 }}>
          <div style={{ ...container, padding: '56px 20px', textAlign: 'center', color: '#fff' }}>
            <h2 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 10px' }}>Sua primeira conversa em inglês pode ser hoje.</h2>
            <p style={{ fontSize: 17, color: '#D6E6FA', margin: '0 0 26px' }}>2 dias de Premium grátis. Sem cartão. Se não for pra você, é só não continuar.</p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
              <Link href="/cadastro" style={cta}>Começar grátis →</Link>
              <PlayBadge />
              <AppStoreBadge />
            </div>
          </div>
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

      {/* Barra fixa mobile: nota real + botão sempre visível */}
      <div className="vn-sticky-cta">
        <div style={{ fontSize: 12.5, color: '#5B6B82', lineHeight: 1.3 }}>
          <div style={{ fontWeight: 700, color: '#102A4C' }}>⭐ 5,0 na App Store</div>
          2 dias grátis · sem cartão
        </div>
        <Link href="/cadastro" style={{ ...cta, fontSize: 14.5, padding: '11px 20px', whiteSpace: 'nowrap' }}>Testar grátis →</Link>
      </div>
    </div>
  )
}
