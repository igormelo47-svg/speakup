import Link from 'next/link'

// Landing de tráfego pago para a busca "aplicativo para aprender inglês" (e variações).
// Existe para duas coisas: (1) índice de qualidade do Google Ads — o texto conversa com
// a busca exata, por isso o slug, o h1 e as seções repetem a linguagem do usuário;
// (2) conversão — estrutura dor → solução → prova → risco zero → ação, sem paredes de
// texto. Gatilhos usados são honestos: teste grátis real, números reais do app, sem
// depoimentos inventados. Mantida em sincronia visual com a home (app/page.tsx).

export const metadata = {
  title: 'Aplicativo para Aprender Inglês Falando — Vonai | 2 dias grátis',
  description:
    'Procurando um aplicativo para aprender inglês de verdade? No Vonai você aprende falando: professor de IA 24h que corrige sua pronúncia, +300 lições do zero ao avançado e conversas de situações reais. Teste grátis, sem cartão.',
  alternates: { canonical: '/aplicativo-para-aprender-ingles' },
}

const AZUL = '#1E63C7'
const ESCURO = '#103D77'
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

function LojaBadge({ href, icone, acima, nome }: { href: string; icone: string; acima: string; nome: string }) {
  return (
    <a href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#000', color: '#fff', borderRadius: 12, padding: '10px 18px', textDecoration: 'none' }}>
      <span style={{ fontSize: 24 }}>{icone}</span>
      <span style={{ textAlign: 'left', lineHeight: 1.15 }}>
        <span style={{ display: 'block', fontSize: 10.5, opacity: 0.85 }}>{acima}</span>
        <span style={{ display: 'block', fontSize: 16, fontWeight: 700 }}>{nome}</span>
      </span>
    </a>
  )
}
function PlayBadge() {
  return <LojaBadge href={PLAY_URL} icone="▶" acima="Disponível no" nome="Google Play" />
}
function AppStoreBadge() {
  // Emoji no lugar do logo da Apple: o caractere  (U+F8FF) vira quadrado fora de
  // dispositivos Apple — e quem mais vê esta página está no Android/Windows.
  return <LojaBadge href={APP_STORE_URL} icone="🍎" acima="Baixar na" nome="App Store" />
}

export default function AplicativoParaAprenderIngles() {
  const container: React.CSSProperties = { maxWidth: 1040, margin: '0 auto', padding: '0 20px' }
  const cta: React.CSSProperties = { display: 'inline-block', background: '#F5A623', color: '#fff', fontWeight: 700, fontSize: 16, padding: '14px 30px', borderRadius: 30, textDecoration: 'none', boxShadow: '0 6px 18px rgba(245,166,35,0.4)' }
  return (
    <div style={{ fontFamily: 'inherit', color: '#102A4C', background: '#fff' }}>
      {/* Nav */}
      <div style={{ borderBottom: '1px solid #EEF1F6' }}>
        <div style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>
          <Link href="/" style={{ fontSize: 20, fontWeight: 800, color: '#102A4C', textDecoration: 'none' }}>Von<span style={{ color: AZUL }}>ai</span></Link>
          <Link href="/login" style={{ color: AZUL, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>Entrar</Link>
        </div>
      </div>

      {/* Hero — fala a língua da busca */}
      <div style={{ background: `linear-gradient(160deg, #2E72D6, ${ESCURO})`, color: '#fff' }}>
        <div style={{ ...container, padding: '56px 20px 56px', maxWidth: 860, textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 18 }}>🇧🇷 Feito para brasileiros</div>
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
            <span>✓ Leva 2 minutos para começar</span>
          </div>
        </div>
      </div>

      {/* Dor → empatia. O motivo real de procurar um app: travar na hora de falar. */}
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

      {/* Como funciona — 3 passos, sem fricção */}
      <div style={{ ...container, padding: '48px 20px 8px' }}>
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
        <div style={{ textAlign: 'center', marginTop: 34 }}>
          <Link href="/cadastro" style={cta}>Criar minha conta grátis →</Link>
        </div>
      </div>

      {/* Por que funciona — autoridade sem jargão */}
      <div style={{ background: '#F6F8FB', marginTop: 48 }}>
        <div style={{ ...container, padding: '48px 20px', maxWidth: 820 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 10px' }}>Por que aprender inglês falando funciona</h2>
          <p style={{ color: '#5B6B82', fontSize: 16, lineHeight: 1.7, margin: '0 0 14px' }}>A ciência da aquisição de idiomas é clara em dois pontos: você aprende quando <strong>entende mensagens um degrau acima do seu nível</strong> — e consolida quando <strong>produz a língua falando</strong>. Aula que é só leitura e múltipla escolha treina você para... leitura e múltipla escolha.</p>
          <p style={{ color: '#5B6B82', fontSize: 16, lineHeight: 1.7, margin: 0 }}>Por isso o Vonai combina os dois: a trilha de lições te dá o insumo no nível certo, e o professor de IA te faz usar tudo numa conversa — com correção imediata, que é quando o cérebro de fato grava. E como a IA não julga ninguém, o maior bloqueio do brasileiro (a vergonha) sai da equação.</p>
        </div>
      </div>

      {/* Preço transparente — qualifica o clique e remove a objeção */}
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
  )
}
