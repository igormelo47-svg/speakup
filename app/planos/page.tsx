import Link from 'next/link'
import { AZUL, ESCURO, LARANJA, PRECO, container, cta, Nav, Footer, Faq, Hero, Selo, StickyCta, CtaFinal, PlayBadge, AppStoreBadge, type Pergunta } from '../_marketing/ui'

// Página de preço. Existe por dois motivos:
// (1) Sitelink — o Google Ads exige páginas do mesmo domínio com conteúdo diferente do
//     destino do anúncio, e "Planos e preços" é o sitelink de maior CTR em app de
//     assinatura, porque é a dúvida nº 1 de quem viu o anúncio.
// (2) Objeção — quem procura o preço já está decidindo. Esconder valor não segura
//     ninguém, só empurra a pessoa para procurar no Reclame Aqui.
//
// Regra desta página: preço, limite do plano grátis e regra de cancelamento têm que
// bater exatamente com o app (app/app/page.tsx) e com a loja. Divergência aqui vira
// contestação de cobrança e nota 1.

export const metadata = {
  title: `Planos e Preços do Vonai — ${PRECO.mensal}/mês | ${PRECO.diasGratis} dias grátis`,
  description: `Quanto custa o Vonai: plano gratuito com limites diários e Premium por ${PRECO.mensal}/mês (ou ${PRECO.anual}/ano, ${PRECO.anualPorMes}/mês). ${PRECO.diasGratis} dias de Premium grátis, sem cartão de crédito. Cancele quando quiser, sem multa.`,
  alternates: { canonical: '/planos' },
}

const FAQ: Pergunta[] = [
  { q: 'Preciso cadastrar cartão para testar?', a: `Não. Você cria a conta e ganha ${PRECO.diasGratis} dias de Premium completo sem informar nenhum dado de pagamento. Se não quiser continuar, não precisa fazer nada — nada é cobrado.` },
  { q: 'O que acontece quando acabam os dias grátis?', a: 'Sua conta continua existindo e seu progresso fica guardado. Você passa para o plano gratuito, que mantém as lições e limita as conversas com o professor de IA. Para voltar a usar sem limite, é só assinar o Premium.' },
  { q: 'Como cancelo?', a: 'Se você assinou pelo site ou pelo Android, o cancelamento é feito no e-mail de confirmação da compra ou pelo nosso suporte — sem multa e sem fidelidade. Se assinou pelo iPhone, o cancelamento é nos Ajustes do seu ID Apple, em Assinaturas, como em qualquer app da App Store. Você continua com o Premium até o fim do período já pago.' },
  { q: 'Quais formas de pagamento vocês aceitam?', a: 'Pelo site e pelo Android: Pix, cartão de crédito e boleto. Pelo iPhone, a cobrança é feita pela própria Apple, com a forma de pagamento cadastrada no seu ID Apple.' },
  { q: 'O plano anual vale a pena?', a: `O anual sai por ${PRECO.anual}, o equivalente a ${PRECO.anualPorMes} por mês — cerca de 19% mais barato que o mensal. Faz sentido se você já testou e sabe que vai usar. Se ainda está decidindo, comece no mensal ou nos dias grátis.` },
  { q: 'Existe desconto para estudante ou plano família?', a: 'Ainda não. Hoje existem apenas o plano gratuito, o mensal e o anual. Quando houver outra opção, ela aparece nesta página.' },
  { q: 'Se eu assinar, o preço pode aumentar?', a: 'Enquanto sua assinatura estiver ativa, você mantém o valor que contratou. Se um dia o preço mudar para novas assinaturas, quem já é assinante não é afetado no ciclo em andamento.' },
]

type Linha = { recurso: string; gratis: string; premium: string }
const TABELA: Linha[] = [
  { recurso: 'Trilha de lições (A1 ao C2)', gratis: 'Completa, +300 lições', premium: 'Completa, +300 lições' },
  { recurso: 'Teste de nivelamento', gratis: 'Sim', premium: 'Sim' },
  { recurso: 'Conversas com o Professor de IA', gratis: `${PRECO.freeMensagens} mensagens por dia`, premium: 'Sem limite' },
  { recurso: 'Simulador de situações reais', gratis: `${PRECO.freeConversas} por dia`, premium: 'Sem limite' },
  { recurso: 'Correção de pronúncia', gratis: 'Sim, dentro dos limites do dia', premium: 'Sim, sem limite' },
  { recurso: 'Plano de estudo diário', gratis: 'Sim', premium: 'Sim' },
  { recurso: 'Sequência de dias, XP e missões', gratis: 'Sim', premium: 'Sim' },
  { recurso: 'Progresso salvo em todos os aparelhos', gratis: 'Sim', premium: 'Sim' },
]

function Check() {
  return <span style={{ color: '#2E9E5B', fontWeight: 700 }}>✓</span>
}

export default function Planos() {
  const celula: React.CSSProperties = { padding: '13px 14px', fontSize: 14.5, borderBottom: '1px solid #EEF1F6', verticalAlign: 'top' }
  return (
    <div style={{ fontFamily: 'inherit', color: '#102A4C', background: '#fff' }}>
      <Nav />
      <div className="vn-body-pad">
        <Hero
          badge={<><Selo>💳 Sem cartão para testar</Selo><Selo>🚫 Sem fidelidade</Selo></>}
          titulo={<>Planos e preços do <span style={{ color: '#FFD98A' }}>Vonai</span></>}
          sub={<>Comece com {PRECO.diasGratis} dias de Premium grátis. Depois escolha: continuar no plano gratuito, com limites diários, ou assinar por {PRECO.mensal} por mês. Cancele quando quiser.</>}
        >
          <Link href="/cadastro" style={cta}>Começar meus {PRECO.diasGratis} dias grátis →</Link>
        </Hero>

        {/* Os dois cartões — decisão binária, sem letra miúda escondida */}
        <div style={{ ...container, padding: '52px 20px 8px', maxWidth: 880 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 20, padding: 26 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#5B6B82', marginBottom: 6 }}>Gratuito</div>
              <div style={{ fontSize: 34, fontWeight: 800, color: '#102A4C', lineHeight: 1 }}>R$0</div>
              <div style={{ fontSize: 13.5, color: '#7C8AA0', marginTop: 6, marginBottom: 20 }}>para sempre, sem cartão</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14.5, color: '#5B6B82', lineHeight: 1.9 }}>
                <li><Check /> Todas as +300 lições, do A1 ao C2</li>
                <li><Check /> Teste de nivelamento e plano diário</li>
                <li><Check /> {PRECO.freeMensagens} mensagens por dia com o Professor de IA</li>
                <li><Check /> {PRECO.freeConversas} simulações de conversa por dia</li>
                <li><Check /> Progresso salvo na sua conta</li>
              </ul>
              <Link href="/cadastro" style={{ display: 'block', textAlign: 'center', marginTop: 24, border: `1px solid ${AZUL}`, color: AZUL, fontWeight: 700, fontSize: 15, padding: '12px 20px', borderRadius: 26, textDecoration: 'none' }}>Criar conta grátis</Link>
            </div>

            <div style={{ background: `linear-gradient(160deg, #2E72D6, ${ESCURO})`, borderRadius: 20, padding: 26, color: '#fff', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -12, right: 22, background: LARANJA, color: '#fff', fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20 }}>Mais escolhido</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#B5D4F4', marginBottom: 6 }}>Premium</div>
              <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1 }}>{PRECO.mensal}<span style={{ fontSize: 16, fontWeight: 600, color: '#B5D4F4' }}>/mês</span></div>
              <div style={{ fontSize: 13.5, color: '#B5D4F4', marginTop: 6, marginBottom: 20 }}>ou {PRECO.anual}/ano — sai por {PRECO.anualPorMes}/mês</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14.5, color: '#E4EFFB', lineHeight: 1.9 }}>
                <li>⭐ Tudo do plano gratuito</li>
                <li>⭐ Conversa <strong>sem limite</strong> com o Professor de IA</li>
                <li>⭐ Simulador de entrevista, viagem e +20 situações, sem limite</li>
                <li>⭐ Correção de pronúncia quantas vezes quiser</li>
                <li>⭐ {PRECO.diasGratis} dias grátis antes de qualquer cobrança</li>
              </ul>
              <Link href="/cadastro" style={{ ...cta, display: 'block', textAlign: 'center', marginTop: 24 }}>Testar Premium grátis →</Link>
              <div style={{ fontSize: 12.5, color: '#B5D4F4', textAlign: 'center', marginTop: 12 }}>Sem cartão agora · cancele em 1 toque</div>
            </div>
          </div>
        </div>

        {/* Comparação linha a linha — quem chega aqui quer saber o que muda de verdade */}
        <div style={{ ...container, padding: '48px 20px 8px', maxWidth: 880 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 8px' }}>O que muda entre o grátis e o Premium</h2>
          <p style={{ textAlign: 'center', color: '#5B6B82', fontSize: 16, margin: '0 0 28px' }}>O conteúdo é o mesmo nos dois. O que o Premium tira é o limite de quanto você pode falar por dia.</p>
          <div style={{ overflowX: 'auto', border: '1px solid #E8ECF2', borderRadius: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
              <thead>
                <tr style={{ background: '#F6F8FB' }}>
                  <th style={{ ...celula, textAlign: 'left', fontWeight: 700, fontSize: 14 }}>Recurso</th>
                  <th style={{ ...celula, textAlign: 'left', fontWeight: 700, fontSize: 14, color: '#5B6B82' }}>Gratuito</th>
                  <th style={{ ...celula, textAlign: 'left', fontWeight: 700, fontSize: 14, color: AZUL }}>Premium</th>
                </tr>
              </thead>
              <tbody>
                {TABELA.map(l => (
                  <tr key={l.recurso}>
                    <td style={{ ...celula, fontWeight: 600 }}>{l.recurso}</td>
                    <td style={{ ...celula, color: '#5B6B82' }}>{l.gratis}</td>
                    <td style={{ ...celula, color: '#102A4C', fontWeight: 600 }}>{l.premium}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ fontSize: 13, color: '#7C8AA0', marginTop: 14, lineHeight: 1.6 }}>
            &quot;Sem limite&quot; significa uso pessoal normal. Existe uma proteção contra uso automatizado que nenhum aluno de verdade alcança — ela existe para o serviço não sair do ar por abuso, não para te frear.
          </p>
        </div>

        {/* Comparação de custo — âncora honesta, sem inventar concorrente */}
        <div style={{ background: '#F6F8FB', marginTop: 48 }}>
          <div style={{ ...container, padding: '48px 20px', maxWidth: 760, textAlign: 'center' }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 12px' }}>{PRECO.mensal} por mês é caro?</h2>
            <p style={{ color: '#5B6B82', fontSize: 16.5, lineHeight: 1.7, margin: '0 0 22px' }}>
              Uma aula particular de inglês custa entre R$60 e R$100 — uma hora, uma vez por semana, com hora marcada. O Premium do Vonai dá menos de <strong style={{ color: '#102A4C' }}>R$1 por dia</strong> por alguém que conversa com você às 6h da manhã ou às 2h da madrugada, quantas vezes você quiser, e que corrige cada frase na hora.
            </p>
            <p style={{ color: '#7C8AA0', fontSize: 15, lineHeight: 1.7, margin: 0 }}>
              E se depois de testar você achar que não é para você, não assine. Os {PRECO.diasGratis} dias grátis existem exatamente para essa resposta vir antes de qualquer cobrança.
            </p>
          </div>
        </div>

        {/* Segurança da compra — a última objeção antes do cartão */}
        <div style={{ ...container, padding: '48px 20px 8px', maxWidth: 820 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 28px' }}>Sem pegadinha</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
            {[
              ['🔓', 'Cancele quando quiser', 'Sem multa, sem fidelidade, sem ligar para ninguém. Você continua Premium até o fim do período já pago.'],
              ['💳', 'Nada é cobrado no teste', `Os ${PRECO.diasGratis} dias grátis não pedem cartão. Não existe cobrança automática ao fim do teste.`],
              ['💾', 'Seu progresso é seu', 'Se você parar de pagar, a conta e todo o progresso continuam lá. Você volta de onde parou.'],
              ['📄', 'Preço na cara', 'O valor está nesta página, nos Termos e na tela de compra do app. Se mudar aqui, mudou em todo lugar.'],
            ].map(([e, t, d]) => (
              <div key={t} style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 16, padding: 20 }}>
                <div style={{ fontSize: 26, marginBottom: 8 }}>{e}</div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 5 }}>{t}</div>
                <div style={{ fontSize: 14, color: '#5B6B82', lineHeight: 1.55 }}>{d}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 30, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
            <PlayBadge />
            <AppStoreBadge />
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#7C8AA0', marginTop: 14 }}>
            No iPhone os valores são cobrados pela Apple e podem variar alguns centavos por causa das faixas de preço da App Store.
          </p>
        </div>

        <Faq itens={FAQ} titulo="Dúvidas sobre cobrança" />

        {/* Product + Offer: é o que faz o preço aparecer no resultado do Google. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: 'Vonai Premium',
          description: 'Assinatura do Vonai: professor de inglês com IA sem limite de conversas, correção de pronúncia e simulador de situações reais.',
          brand: { '@type': 'Brand', name: 'Vonai' },
          offers: [
            { '@type': 'Offer', name: 'Premium mensal', price: '29.90', priceCurrency: 'BRL', url: 'https://vonai.com.br/planos', availability: 'https://schema.org/InStock' },
            { '@type': 'Offer', name: 'Premium anual', price: '289.80', priceCurrency: 'BRL', url: 'https://vonai.com.br/planos', availability: 'https://schema.org/InStock' },
          ],
        }) }} />

        <CtaFinal
          titulo={`Teste ${PRECO.diasGratis} dias sem pagar nada.`}
          sub="Sem cartão de crédito. Se não for pra você, é só não continuar."
          botao="Criar minha conta grátis →"
        />
        <Footer />
      </div>
      <StickyCta texto="Testar grátis →" />
    </div>
  )
}
