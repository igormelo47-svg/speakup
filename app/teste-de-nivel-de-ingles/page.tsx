import Link from 'next/link'
import Teste from './Teste'
import { AZUL, PRECO, container, cta, Nav, Footer, Card, Faq, StickyCta, CtaFinal, type Pergunta } from '../_marketing/ui'

// "Teste de nível de inglês" é busca de volume alto e intenção clara: a pessoa quer
// fazer o teste, não ler sobre teste. Por isso o teste é a primeira coisa da página e
// roda sem cadastro — o conteúdo explicativo vem depois, para o Google e para quem
// quer entender o que significa o resultado.
//
// O teste em si está em Teste.tsx ('use client'); esta página é server para manter o
// texto no HTML da primeira resposta, que é o que a busca indexa.

export const metadata = {
  title: 'Teste de Nível de Inglês Grátis Online — 2 minutos | Vonai',
  description: 'Faça o teste de nível de inglês grátis, sem cadastro: 12 perguntas em 2 minutos e você descobre se está no A1, A2, B1, B2, C1 ou C2 — com gabarito comentado em português.',
  alternates: { canonical: '/teste-de-nivel-de-ingles' },
}

const NIVEIS = [
  { n: 'A1', t: 'Iniciante', d: 'Entende e usa expressões básicas: se apresentar, dizer onde mora, pedir algo simples. Frases curtas e faladas devagar.' },
  { n: 'A2', t: 'Básico', d: 'Dá conta de situações rotineiras: compras, transporte, trabalho. Fala do passado e de planos, com frases simples.' },
  { n: 'B1', t: 'Intermediário', d: 'Se vira sozinho numa viagem, entende o assunto de textos e conversas do dia a dia e explica opinião de forma simples.' },
  { n: 'B2', t: 'Intermediário avançado', d: 'Conversa com fluidez com falante nativo sem esforço dos dois lados. É o nível que a maioria das vagas chama de "inglês avançado".' },
  { n: 'C1', t: 'Avançado', d: 'Usa a língua com flexibilidade em contexto social, acadêmico e profissional. Entende texto longo e implícito.' },
  { n: 'C2', t: 'Proficiente', d: 'Entende praticamente tudo que lê e ouve, e se expressa com precisão e naturalidade, inclusive em situação complexa.' },
]

const FAQ: Pergunta[] = [
  { q: 'O teste de nível é realmente grátis?', a: 'É. São 12 perguntas, sem cadastro e sem cartão. O resultado aparece na própria tela assim que você termina, junto com o gabarito comentado. No fim, se quiser, você pode deixar o e-mail para receber o plano dos primeiros dias — é opcional e não muda nada no que você já viu.' },
  { q: 'Quanto tempo leva?', a: 'Cerca de 2 minutos. As perguntas são de múltipla escolha com três opções e ficam mais difíceis conforme você avança.' },
  { q: 'O que significam A1, A2, B1, B2, C1 e C2?', a: 'São os seis níveis do Quadro Europeu Comum de Referência (CEFR), o padrão usado no mundo todo para medir domínio de idioma. A1 e A2 são o básico, B1 e B2 o intermediário, C1 e C2 o avançado. É a mesma escala que aparece em vaga de emprego e em prova de proficiência.' },
  { q: 'Esse teste vale como certificado?', a: 'Não. Nenhum teste rápido e gratuito vale como certificação — para isso existem exames pagos e presenciais como TOEFL, IELTS e Cambridge. O que este teste faz é posicionar você na escala para saber por onde começar a estudar, que é uma pergunta diferente.' },
  { q: 'O teste avalia minha pronúncia e minha fala?', a: 'Este teste online avalia estrutura e uso da língua, que é o que dá para medir por escrito em 2 minutos. Fala e pronúncia são avaliadas dentro do app, quando você conversa com o professor de IA e ele analisa palavra por palavra.' },
  { q: 'Deu um nível mais baixo do que eu esperava. E agora?', a: 'É comum, e não é motivo para desanimar: a maioria dos brasileiros entende bem mais do que produz, então se sente mais avançado do que o teste mostra. O ganho vem justamente de treinar produção — falar, errar e ser corrigido. Comece do nível que apareceu e você sobe rápido.' },
  { q: 'Posso refazer o teste?', a: 'Pode, quantas vezes quiser. No fim do resultado tem o botão "Refazer o teste". Só lembre que refazer logo em seguida mede sua memória das respostas, não seu nível.' },
]

export default function TesteDeNivel() {
  return (
    <div style={{ fontFamily: 'inherit', color: '#102A4C', background: '#fff' }}>
      <Nav />
      <div className="vn-body-pad">
        {/* Hero enxuto de propósito: quem chega aqui quer clicar em "começar", não ler */}
        <div style={{ background: 'linear-gradient(160deg, #2E72D6, #103D77)', color: '#fff' }}>
          <div style={{ ...container, padding: '46px 20px 40px', maxWidth: 760, textAlign: 'center' }}>
            <h1 style={{ fontSize: 36, lineHeight: 1.15, fontWeight: 800, margin: '0 0 14px' }}>Teste de nível de inglês <span style={{ color: '#FFD98A' }}>grátis</span></h1>
            <p style={{ fontSize: 17.5, color: '#D6E6FA', lineHeight: 1.6, margin: '0 auto', maxWidth: 600 }}>
              12 perguntas, cerca de 2 minutos. Descubra se você está no A1, A2, B1, B2, C1 ou C2 — e o que fazer a partir daí. Sem cadastro.
            </p>
          </div>
        </div>

        {/* O teste sobe por cima do hero: é o conteúdo principal da página */}
        <div style={{ ...container, maxWidth: 620, marginTop: -22, position: 'relative', zIndex: 2 }}>
          <Teste />
        </div>

        {/* A partir daqui é conteúdo para a busca e para quem quer entender o resultado */}
        <div style={{ ...container, padding: '52px 20px 8px', maxWidth: 820 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 10px' }}>O que significa cada nível de inglês</h2>
          <p style={{ color: '#5B6B82', fontSize: 16, lineHeight: 1.65, textAlign: 'center', margin: '0 0 30px' }}>
            A escala vem do Quadro Europeu Comum de Referência (CEFR), o padrão usado por escolas, empresas e exames no mundo todo. São seis degraus, do A1 ao C2.
          </p>
          <div style={{ display: 'grid', gap: 12 }}>
            {NIVEIS.map(n => (
              <div key={n.n} style={{ display: 'flex', gap: 16, alignItems: 'flex-start', background: '#F6F8FB', borderRadius: 16, padding: '18px 20px' }}>
                <div style={{ minWidth: 52, height: 52, borderRadius: 14, background: AZUL, color: '#fff', fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n.n}</div>
                <div>
                  <div style={{ fontSize: 16.5, fontWeight: 700, marginBottom: 3 }}>{n.t}</div>
                  <div style={{ fontSize: 14.5, color: '#5B6B82', lineHeight: 1.6 }}>{n.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...container, padding: '48px 20px 8px', maxWidth: 820 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 10px' }}>Por que quase todo brasileiro se subestima no teste</h2>
          <p style={{ color: '#5B6B82', fontSize: 16, lineHeight: 1.75, margin: '0 0 14px' }}>
            Existe uma diferença grande entre <strong>compreender</strong> e <strong>produzir</strong>. Você assiste série, entende letra de música e lê o e-mail do trabalho — compreensão. Aí chega a hora de responder em voz alta e a frase não sai. Isso não é falta de conhecimento: é falta de prática de produção.
          </p>
          <p style={{ color: '#5B6B82', fontSize: 16, lineHeight: 1.75, margin: '0 0 14px' }}>
            O ensino que a maioria de nós teve reforça exatamente o lado que já é forte: ler, marcar alternativa, traduzir. Quase ninguém teve aula em que passasse a maior parte do tempo <em>falando</em>. O resultado é uma geração que sabe gramática e trava na primeira conversa real.
          </p>
          <p style={{ color: '#5B6B82', fontSize: 16, lineHeight: 1.75, margin: 0 }}>
            A saída é chata de tão simples: falar todo dia, errar, ser corrigido na hora e tentar de novo. Cinco minutos por dia batem uma hora por semana, porque a língua se consolida na repetição espaçada, não no esforço concentrado.
          </p>
        </div>

        <div style={{ background: '#F6F8FB', marginTop: 48 }}>
          <div style={{ ...container, padding: '48px 20px', maxWidth: 860 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 10px' }}>Descobriu o nível. E depois?</h2>
            <p style={{ color: '#5B6B82', fontSize: 16, textAlign: 'center', margin: '0 0 30px' }}>Saber o nível só serve se virar plano. É isso que o app faz a partir do resultado:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
              <Card e="🗺️" t="Trilha do seu ponto" d="A sequência de lições começa no seu nível e sobe um degrau de cada vez — não do zero, e não num ponto que você ainda não alcança." />
              <Card e="🎙️" t="Conversa desde o 1º dia" d="O professor de IA puxa assunto no seu nível, corrige a frase na hora e explica o erro em português." />
              <Card e="🗣️" t="Pronúncia palavra a palavra" d='Análise dos sons que travam o brasileiro: o "th", o "-ed" do passado, o H aspirado.' />
              <Card e="🔁" t="Revisão na hora certa" d="O que você errou volta pouco antes de você esquecer. É assim que sai da memória curta." />
            </div>
            <div style={{ textAlign: 'center', marginTop: 30 }}>
              <Link href="/cadastro" style={cta}>Estudar a partir do meu nível →</Link>
              <div style={{ fontSize: 13.5, color: '#7C8AA0', marginTop: 12 }}>{PRECO.diasGratis} dias de Premium grátis · sem cartão de crédito</div>
            </div>
          </div>
        </div>

        <Faq itens={FAQ} titulo="Perguntas sobre o teste" />

        <CtaFinal
          titulo="Seu nível já está na tela. Falta o próximo passo."
          sub={`${PRECO.diasGratis} dias de Premium grátis, sem cartão. Comece exatamente de onde o teste parou.`}
          botao="Criar conta grátis →"
        />
        <Footer />
      </div>
      <StickyCta texto="Criar conta grátis →" />
    </div>
  )
}
