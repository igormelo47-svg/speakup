import Link from 'next/link'
import BaixarApp from './BaixarApp'

// Peças comuns das páginas públicas de marketing (nav, footer, badges de loja, cards,
// FAQ com JSON-LD, barra fixa de CTA no celular). Extraído da landing de tráfego pago
// quando ela deixou de ser a única página: quatro cópias do mesmo footer é quatro
// lugares para esquecer de atualizar. A pasta começa com "_" porque no App Router
// isso a torna privada — não vira rota.
//
// Regras que valem para toda página que usar isto:
// - Nunca inventar depoimento, contador de alunos ou avaliação. A nota 5,0 da App
//   Store é real; se um dia deixar de ser, sai daqui.
// - Preço só em um lugar (PRECO abaixo). Página de preço errado é reclamação na loja.

export const AZUL = '#1E63C7'
export const ESCURO = '#103D77'
export const LARANJA = '#F5A623'
export const PLAY_URL = 'https://play.google.com/store/apps/details?id=app.vercel.speakup_dusky.twa'
export const APP_STORE_URL = 'https://apps.apple.com/br/app/vonai/id6788121941'

// Fonte única de verdade do preço nas páginas públicas. Os valores da App Store são
// diferentes por causa das faixas de preço da Apple — quem chega pela web vê o web.
export const PRECO = {
  mensal: 'R$29,90',
  anual: 'R$289,80',
  anualPorMes: 'R$24,15',
  diasGratis: 2,
  // Limites do plano gratuito, espelhados de app/app/page.tsx (FREE_LIMIT, PROF_LIMIT).
  freeConversas: 3,
  freeMensagens: 10,
}

export const container: React.CSSProperties = { maxWidth: 1040, margin: '0 auto', padding: '0 20px' }
export const cta: React.CSSProperties = { display: 'inline-block', background: LARANJA, color: '#fff', fontWeight: 700, fontSize: 16, padding: '14px 30px', borderRadius: 30, textDecoration: 'none', boxShadow: '0 6px 18px rgba(245,166,35,0.4)' }
export const ctaClaro: React.CSSProperties = { display: 'inline-block', background: '#fff', color: ESCURO, fontWeight: 700, fontSize: 16, padding: '13px 28px', borderRadius: 30, textDecoration: 'none', border: '1px solid #DCE4EE' }

export function Card({ e, t, d }: { e: string; t: string; d: string }) {
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
// `grande` existe porque no topo das páginas o dono quer as lojas como chamada principal
// (decisão de 10/08: induzir o download logo de cara), e o tamanho padrão sumia no hero.
function LojaBadge({ href, icone, acima, nome, grande = false }: { href: string; icone: React.ReactNode; acima: string; nome: string; grande?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: grande ? 12 : 10, background: '#000', color: '#fff', borderRadius: grande ? 14 : 12, padding: grande ? '13px 26px' : '10px 18px', textDecoration: 'none', border: grande ? '1px solid rgba(255,255,255,0.35)' : 'none' }}>
      <span style={{ transform: grande ? 'scale(1.25)' : 'none', display: 'inline-flex' }}>{icone}</span>
      <span style={{ textAlign: 'left', lineHeight: 1.15 }}>
        <span style={{ display: 'block', fontSize: grande ? 12 : 10.5, opacity: 0.85 }}>{acima}</span>
        <span style={{ display: 'block', fontSize: grande ? 20 : 16, fontWeight: 700 }}>{nome}</span>
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
export function PlayBadge({ grande = false }: { grande?: boolean } = {}) {
  return <LojaBadge href={PLAY_URL} icone={<PlaySvg />} acima="Disponível no" nome="Google Play" grande={grande} />
}
export function AppStoreBadge({ grande = false }: { grande?: boolean } = {}) {
  return <LojaBadge href={APP_STORE_URL} icone={<AppleSvg />} acima="Baixar na" nome="App Store" grande={grande} />
}

export function Nav() {
  return (
    <div style={{ borderBottom: '1px solid #EEF1F6' }}>
      <div style={{ ...container, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62 }}>
        <Link href="/" style={{ fontSize: 20, fontWeight: 800, color: '#102A4C', textDecoration: 'none' }}>Von<span style={{ color: AZUL }}>ai</span></Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <BaixarApp />
          <Link href="/login" style={{ color: AZUL, fontWeight: 600, fontSize: 15, textDecoration: 'none' }}>Entrar</Link>
        </div>
      </div>
    </div>
  )
}

// Os links entre as páginas de conteúdo ficam aqui de propósito: é o que faz o Google
// achar as páginas novas sem depender só do sitemap, e é o que o visitante usa para
// pular de uma para a outra sem voltar para a busca.
export function Footer() {
  const item: React.CSSProperties = { color: '#7C8AA0', textDecoration: 'none', fontSize: 13 }
  return (
    <div style={{ borderTop: '1px solid #EEF1F6', background: '#F6F8FB' }}>
      <div style={{ ...container, padding: '28px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 22px', marginBottom: 18 }}>
          <Link href="/teste-de-nivel-de-ingles" style={item}>Teste de nível</Link>
          <Link href="/planos" style={item}>Planos e preços</Link>
          <Link href="/professor-de-ingles-com-ia" style={item}>Professor de IA</Link>
          <Link href="/erros-de-ingles-do-brasileiro" style={item}>Erros do brasileiro</Link>
          <Link href="/aplicativo-para-aprender-ingles" style={item}>Aplicativo de inglês</Link>
        </div>
        {/* As lojas ficam no rodapé, e não perto do botão principal, de propósito: mandar
            o clique pago para a loja fura a medição de inicio_teste (a conversão que o
            Google Ads otimiza). Aqui pega quem já rolou a página inteira e prefere app a
            site — que hoje não tinha caminho nenhum e sumia. */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 18 }}>
          <span style={{ fontSize: 13, color: '#7C8AA0', marginRight: 4 }}>Prefere o app no celular?</span>
          <PlayBadge />
          <AppStoreBadge />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#7C8AA0' }}>
          <div>© {new Date().getFullYear()} Vonai</div>
          <div style={{ display: 'flex', gap: 18 }}>
            <Link href="/termos" style={item}>Termos</Link>
            <Link href="/privacidade" style={item}>Privacidade</Link>
            <Link href="/suporte" style={item}>Suporte</Link>
            <Link href="/login" style={{ ...item, color: AZUL, fontWeight: 600 }}>Entrar</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Barra fixa de CTA no celular — a maioria do tráfego é mobile e o botão precisa estar
// SEMPRE a um toque. O CSS vive aqui junto do componente para não haver página com a
// classe e sem o estilo; .vn-body-pad reserva o espaço para a barra não tapar o rodapé.
export function StickyCta({ texto = 'Testar grátis →', href = '/cadastro' }: { texto?: string; href?: string }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .vn-sticky-cta { display: none; }
        @media (max-width: 720px) {
          .vn-sticky-cta { display: flex; position: fixed; left: 0; right: 0; bottom: 0; z-index: 50;
            background: #fff; border-top: 1px solid #E8ECF2; padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
            gap: 10px; align-items: center; justify-content: space-between; box-shadow: 0 -6px 18px rgba(16,42,76,0.08); }
          .vn-body-pad { padding-bottom: 76px; }
        }
      `}} />
      <div className="vn-sticky-cta">
        <div style={{ fontSize: 12.5, color: '#5B6B82', lineHeight: 1.3 }}>
          <div style={{ fontWeight: 700, color: '#102A4C' }}>⭐ 5,0 na App Store</div>
          {PRECO.diasGratis} dias grátis · sem cartão
        </div>
        <Link href={href} style={{ ...cta, fontSize: 14.5, padding: '11px 20px', whiteSpace: 'nowrap' }}>{texto}</Link>
      </div>
    </>
  )
}

export type Pergunta = { q: string; a: string }

// FAQ + JSON-LD no mesmo componente porque um sem o outro é o erro clássico: ou o
// Google vê marcação sem texto visível (penaliza), ou o texto existe e não vira rich
// result. Aqui os dois saem sempre da mesma lista.
export function Faq({ itens, titulo = 'Perguntas frequentes' }: { itens: Pergunta[]; titulo?: string }) {
  return (
    <div style={{ ...container, padding: '48px 20px 8px', maxWidth: 760 }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 28px' }}>{titulo}</h2>
      {itens.map((f, i) => (
        <details key={i} style={{ background: '#F6F8FB', borderRadius: 14, padding: '16px 20px', marginBottom: 10, cursor: 'pointer' }}>
          <summary style={{ fontSize: 15.5, fontWeight: 700, color: '#102A4C' }}>{f.q}</summary>
          <p style={{ fontSize: 14.5, color: '#5B6B82', lineHeight: 1.6, margin: '10px 0 0' }}>{f.a}</p>
        </details>
      ))}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'FAQPage',
        mainEntity: itens.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
      }) }} />
    </div>
  )
}

export function Hero({ titulo, sub, badge, children }: { titulo: React.ReactNode; sub: React.ReactNode; badge?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div style={{ background: `linear-gradient(160deg, #2E72D6, ${ESCURO})`, color: '#fff' }}>
      <div style={{ ...container, padding: '52px 20px 56px', maxWidth: 860, textAlign: 'center' }}>
        {badge && <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 18 }}>{badge}</div>}
        <h1 style={{ fontSize: 38, lineHeight: 1.15, fontWeight: 800, margin: '0 0 16px' }}>{titulo}</h1>
        <p style={{ fontSize: 18, color: '#D6E6FA', lineHeight: 1.6, margin: '0 auto 26px', maxWidth: 640 }}>{sub}</p>
        {children}
      </div>
    </div>
  )
}

export function Selo({ children }: { children: React.ReactNode }) {
  return <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{children}</span>
}

// CTA de fechamento, igual em todas as páginas: última chance de dizer sim.
export function CtaFinal({ titulo, sub, botao = 'Começar grátis →', lojas = true }: { titulo: string; sub: string; botao?: string; lojas?: boolean }) {
  return (
    <div style={{ background: `linear-gradient(160deg, #2E72D6, ${ESCURO})`, marginTop: 48 }}>
      <div style={{ ...container, padding: '56px 20px', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 10px' }}>{titulo}</h2>
        <p style={{ fontSize: 17, color: '#D6E6FA', margin: '0 0 26px' }}>{sub}</p>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
          <Link href="/cadastro" style={cta}>{botao}</Link>
          {lojas && <PlayBadge />}
          {lojas && <AppStoreBadge />}
        </div>
      </div>
    </div>
  )
}
