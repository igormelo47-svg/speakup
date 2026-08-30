import Link from 'next/link'
import { AZUL, ESCURO, PRECO, container, cta, Nav, Footer, Faq, StickyCta, CtaFinal, type Pergunta } from '../_marketing/ui'

// Conteúdo de cauda longa: cada erro desta lista é uma busca que alguém faz ("actually
// significa atualmente?", "por que não pode dizer I have 30 years"). É a página que
// traz visita orgânica sem custo de mídia, e é útil mesmo para quem nunca virar aluno.
//
// Regra: o valor tem que estar NA página. Lista com meia explicação e "baixe o app para
// ver o resto" é o padrão que faz a pessoa voltar para a busca — e o Google mede isso.

type Erro = { errado: string; certo: string; porque: string }

const FALSOS: Erro[] = [
  { errado: 'Actually, I work at a bank. (querendo dizer "atualmente")', certo: 'Currently, I work at a bank.', porque: '"Actually" quer dizer "na verdade", não "atualmente". Quem quer falar de agora usa currently ou nowadays. É provavelmente o falso cognato que mais gera mal-entendido, porque a frase continua fazendo sentido — só que outro.' },
  { errado: 'I pretend to travel next year.', certo: 'I intend to travel next year.', porque: '"Pretend" é fingir. Dito assim, você disse que vai fingir que viaja. Para intenção use intend, plan ou "I\'m going to".' },
  { errado: 'I need to realize this project.', certo: 'I need to carry out this project.', porque: '"Realize" em inglês é dar-se conta, perceber. Realizar no sentido de executar é carry out, accomplish ou simplesmente do.' },
  { errado: 'Yesterday I assisted a movie.', certo: 'Yesterday I watched a movie.', porque: '"Assist" é ajudar, prestar assistência. Assistir a algo é watch (filme, série) ou attend (aula, reunião, evento).' },
  { errado: 'She wears a beautiful costume.', certo: 'She\'s wearing a beautiful outfit.', porque: '"Costume" é fantasia, roupa de personagem. Traje comum é outfit ou clothes; costume no sentido de hábito é custom ou habit.' },
  { errado: 'My father works in a fabric.', certo: 'My father works in a factory.', porque: '"Fabric" é tecido. Fábrica é factory ou plant. O erro coloca seu pai dentro de um pedaço de pano.' },
]

const ESTRUTURA: Erro[] = [
  { errado: 'I have 34 years.', certo: "I'm 34 years old.", porque: 'Em inglês idade é com o verbo to be, não com have. É tradução direta do português e talvez o erro mais frequente de todos.' },
  { errado: "I'm agree with you.", certo: 'I agree with you.', porque: '"Agree" já é o verbo — concordar. Colocar "am" na frente é o mesmo que dizer "eu estou concordo".' },
  { errado: 'Can you explain me this?', certo: 'Can you explain this to me?', porque: 'Explain não aceita a pessoa logo depois. Ou você diz "explain this to me", ou troca por tell: "can you tell me?".' },
  { errado: 'People is very kind here.', certo: 'People are very kind here.', porque: '"People" já é plural (o singular é person). Por isso pede are, e não is.' },
  { errado: "I didn't went to the party.", certo: "I didn't go to the party.", porque: 'O "did" já marcou o passado. Depois dele o verbo volta à forma básica: didn\'t go, didn\'t say, didn\'t have.' },
  { errado: 'I work here since 5 years.', certo: "I've worked here for 5 years.", porque: '"Since" marca o ponto de início (since 2019); "for" marca a duração (for 5 years). E o tempo certo aqui é o present perfect, porque começou no passado e continua.' },
  { errado: 'I have a doubt about the exercise.', certo: 'I have a question about the exercise.', porque: '"Doubt" é desconfiança, dúvida sobre a veracidade de algo. Dúvida no sentido de pergunta é question. "I have a doubt" soa como "eu duvido disso".' },
  { errado: 'We need to take a decision.', certo: 'We need to make a decision.', porque: 'Colocação fixa: decisão se "faz" em inglês. Do mesmo tipo: make a mistake, take a shower, do homework — não há lógica, é uso.' },
  { errado: 'Say me what happened.', certo: 'Tell me what happened.', porque: '"Say" não leva a pessoa direto; "tell" leva. Diga algo = say something; diga a alguém = tell someone.' },
]

const PRONUNCIA: Erro[] = [
  { errado: 'think dito como "fink" ou "tink"', certo: 'th com a língua entre os dentes', porque: 'O som do "th" não existe em português, então o brasileiro troca pelo f ou pelo t. Encoste a ponta da língua nos dentes de cima e solte o ar: think, three, thanks. Em this, that e the o mesmo gesto sai com voz.' },
  { errado: 'worked dito como "work-ed" (duas sílabas)', certo: 'worked = uma sílaba só, terminando em "t"', porque: 'O "-ed" do passado quase nunca vira sílaba. Depois de som surdo sai como /t/ (worked, stopped), depois de sonoro sai como /d/ (played, lived). Só vira sílaba depois de t ou d: wanted, needed.' },
  { errado: 'house dito como "áus" (sem o H)', certo: 'house com o H soprado', porque: 'Em português o H é mudo, então some. Em inglês ele é um sopro de verdade — e sem ele, "hear" vira "ear" e "hi" vira "eye".' },
  { errado: 'Facebook dito como "Feicebúki"', certo: 'Facebook terminando na consoante', porque: 'O português não gosta de palavra terminada em consoante, então a gente inventa um "i" ou "e" no fim. Em inglês a palavra acaba ali mesmo: book, hot dog, laptop, Instagram.' },
  { errado: 'ship e sheep ditos igual', certo: 'ship curto, sheep longo', porque: 'São dois sons diferentes de "i", e a diferença muda a palavra: ship/sheep, live/leave, bit/beat, fit/feet. O curto é relaxado e rápido; o longo é esticado e com sorriso.' },
  { errado: 'red dito como "hédi"', certo: 'red com R de língua enrolada', porque: 'O R inicial do português puxa para o som de H, e aí "red" vira "head". Em inglês a língua sobe e recua sem encostar: red, rain, right.' },
]

// O número no título sai da contagem das listas, e não de um "18" digitado à mão que
// já dessincronizou uma vez. Título prometendo mais itens do que a página entrega é
// exatamente o tipo de coisa que o Google trata como isca.
const TOTAL = FALSOS.length + ESTRUTURA.length + PRONUNCIA.length

export const metadata = {
  title: `${TOTAL} Erros de Inglês que Todo Brasileiro Comete (e como corrigir) | Vonai`,
  description: `Os ${TOTAL} erros de inglês mais comuns entre brasileiros: falsos cognatos como actually e pretend, estruturas traduzidas do português e os sons que entregam o sotaque. Com a forma certa e a explicação de cada um.`,
  alternates: { canonical: '/erros-de-ingles-do-brasileiro' },
  // openGraph próprio: sem isto o Next mantém o do layout, e TODA página
  // compartilhada no WhatsApp mostrava o mesmo título genérico.
  openGraph: {
    title: `${TOTAL} Erros de Inglês que Todo Brasileiro Comete (e como corrigir) | Vonai`,
    description: `Os ${TOTAL} erros de inglês mais comuns entre brasileiros: falsos cognatos como actually e pretend, estruturas traduzidas do português e os sons que entregam o sotaque. Com a forma certa e a explicação de cada um.`,
    url: '/erros-de-ingles-do-brasileiro',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${TOTAL} Erros de Inglês que Todo Brasileiro Comete (e como corrigir) | Vonai`,
    description: `Os ${TOTAL} erros de inglês mais comuns entre brasileiros: falsos cognatos como actually e pretend, estruturas traduzidas do português e os sons que entregam o sotaque. Com a forma certa e a explicação de cada um.`,
  },
}

const FAQ: Pergunta[] = [
  { q: 'Errar em inglês é grave?', a: 'Não. A comunicação sobrevive à maioria dos erros desta lista — a pessoa entende. O motivo de corrigir não é medo de vexame, é que erro repetido vira automatismo: quanto mais tempo você fala "I have 30 years", mais difícil fica desfazer. Corrigir cedo custa menos.' },
  { q: 'Por que a gente comete justamente esses erros?', a: 'Porque quase todos vêm de tradução direta do português. Nossa cabeça monta a frase em português e troca palavra por palavra — e onde a estrutura das duas línguas não coincide, o erro aparece. Falsos cognatos são o mesmo fenômeno: a palavra parece a nossa, então confiamos nela.' },
  { q: 'Como paro de traduzir do português na cabeça?', a: 'Com volume de fala, não com estudo de regra. Quando você fala pouco, sobra tempo para traduzir; quando fala todo dia, o cérebro passa a puxar a frase pronta em inglês porque não dá tempo de traduzir. É por isso que conversar com correção imediata funciona melhor que lista de exercício.' },
  { q: 'Preciso perder o sotaque?', a: 'Não. Sotaque não atrapalha ninguém — nativo de qualquer país tem o dele. O que atrapalha é o som que troca a palavra: o "th" virando f, o H que some, o i curto no lugar do longo. Trabalhe esses; o resto do sotaque pode ficar.' },
  { q: 'Como treinar isso na prática?', a: `No Vonai você fala com o professor de IA e ele aponta exatamente esses pontos na hora, com a explicação em português. Novos alunos têm ${PRECO.diasGratis} dias de Premium grátis, sem cartão.` },
]

function ListaErros({ titulo, intro, itens, n0 }: { titulo: string; intro: string; itens: Erro[]; n0: number }) {
  return (
    <div style={{ ...container, padding: '44px 20px 8px', maxWidth: 800 }}>
      <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px' }}>{titulo}</h2>
      <p style={{ color: '#5B6B82', fontSize: 16, lineHeight: 1.65, margin: '0 0 26px' }}>{intro}</p>
      {itens.map((e, i) => (
        <div key={e.errado} style={{ border: '1px solid #E8ECF2', borderRadius: 16, padding: '18px 20px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#7C8AA0', marginBottom: 10 }}>#{n0 + i}</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
            <span style={{ fontSize: 15 }}>❌</span>
            <span style={{ fontSize: 15.5, color: '#B54A3A', textDecoration: 'line-through', textDecorationColor: 'rgba(181,74,58,0.35)' }}>{e.errado}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
            <span style={{ fontSize: 15 }}>✅</span>
            <span style={{ fontSize: 15.5, color: '#1F7A46', fontWeight: 700 }}>{e.certo}</span>
          </div>
          <div style={{ fontSize: 14.5, color: '#5B6B82', lineHeight: 1.65, borderTop: '1px solid #F1F4F8', paddingTop: 10 }}>{e.porque}</div>
        </div>
      ))}
    </div>
  )
}

export default function ErrosDeInglesDoBrasileiro() {
  return (
    <div style={{ fontFamily: 'inherit', color: '#102A4C', background: '#fff' }}>
      <Nav />
      <div className="vn-body-pad">
        <div style={{ background: `linear-gradient(160deg, #2E72D6, ${ESCURO})`, color: '#fff' }}>
          <div style={{ ...container, padding: '50px 20px 52px', maxWidth: 800, textAlign: 'center' }}>
            <h1 style={{ fontSize: 36, lineHeight: 1.18, fontWeight: 800, margin: '0 0 16px' }}>{TOTAL} erros de inglês que <span style={{ color: '#FFD98A' }}>todo brasileiro</span> comete</h1>
            <p style={{ fontSize: 17.5, color: '#D6E6FA', lineHeight: 1.6, margin: '0 auto', maxWidth: 620 }}>
              Não é falta de estudo — é o português vazando. Aqui estão os {TOTAL} mais comuns, com a forma certa e o motivo de cada um. Leitura de 7 minutos, e você já sai corrigindo.
            </p>
          </div>
        </div>

        <div style={{ ...container, padding: '40px 20px 0', maxWidth: 800 }}>
          <p style={{ color: '#5B6B82', fontSize: 16.5, lineHeight: 1.75, margin: 0 }}>
            Quase todo erro desta lista tem a mesma origem: a frase nasce em português na sua cabeça e é traduzida palavra por palavra. Onde as duas línguas coincidem, dá certo. Onde não coincidem, sai <em>&quot;I have 34 years&quot;</em>. A boa notícia é que são erros de <strong>padrão</strong>, não de vocabulário — corrigido o padrão, ele para de aparecer em todas as frases daquele tipo de uma vez.
          </p>
        </div>

        <ListaErros
          n0={1}
          titulo="Falsos cognatos: as palavras que traem"
          intro="Parecem com o português, então a gente confia. O problema é que a frase continua fazendo sentido em inglês — só que outro sentido, e ninguém te corrige."
          itens={FALSOS}
        />

        <div style={{ background: '#F6F8FB', marginTop: 40, paddingBottom: 30 }}>
          <ListaErros
            n0={FALSOS.length + 1}
            titulo="Estrutura: quando a frase é português com palavras em inglês"
            intro="Aqui o vocabulário está certo e o arranjo está errado. São os erros que mais entregam o brasileiro — e os mais fáceis de corrigir, porque cada um é uma regra só."
            itens={ESTRUTURA}
          />
        </div>

        <ListaErros
          n0={FALSOS.length + ESTRUTURA.length + 1}
          titulo="Pronúncia: os sons que a nossa boca não aprendeu"
          intro="Nenhum destes existe em português, então a boca substitui pelo som mais parecido. Sotaque não é problema; o problema é quando o som troca a palavra."
          itens={PRONUNCIA}
        />

        {/* Como treinar — a ponte para o produto, depois de entregar o valor todo */}
        <div style={{ background: '#F6F8FB', marginTop: 48 }}>
          <div style={{ ...container, padding: '48px 20px', maxWidth: 760, textAlign: 'center' }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 12px' }}>Ler a lista não conserta. Falar, sim.</h2>
            <p style={{ color: '#5B6B82', fontSize: 16.5, lineHeight: 1.75, margin: '0 0 14px' }}>
              Você acabou de reconhecer vários erros que comete. Isso é útil, mas reconhecer não desfaz o automatismo — o automatismo só cede quando você fala, erra e é corrigido <strong>no momento em que erra</strong>. É a correção imediata que reescreve o padrão.
            </p>
            <p style={{ color: '#5B6B82', fontSize: 16.5, lineHeight: 1.75, margin: '0 0 26px' }}>
              É exatamente isso que o professor de IA do Vonai faz: você fala, ele aponta o erro na hora e explica em português — quantas vezes for preciso, sem ninguém olhando.
            </p>
            <Link href="/cadastro" style={cta}>Treinar isso agora, grátis →</Link>
            <div style={{ fontSize: 13.5, color: '#7C8AA0', marginTop: 12 }}>{PRECO.diasGratis} dias de Premium grátis · sem cartão de crédito</div>
            <div style={{ marginTop: 22, fontSize: 14.5 }}>
              <Link href="/teste-de-nivel-de-ingles" style={{ color: AZUL, fontWeight: 600 }}>Antes disso, descubra seu nível em 2 minutos →</Link>
            </div>
          </div>
        </div>

        <Faq itens={FAQ} titulo="Perguntas sobre os erros" />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: `${TOTAL} erros de inglês que todo brasileiro comete (e como corrigir)`,
          description: 'Falsos cognatos, estruturas traduzidas do português e os sons que entregam o sotaque brasileiro — com a forma certa e a explicação de cada erro.',
          inLanguage: 'pt-BR',
          author: { '@type': 'Organization', name: 'Vonai' },
          publisher: { '@type': 'Organization', name: 'Vonai' },
          mainEntityOfPage: 'https://vonai.com.br/erros-de-ingles-do-brasileiro',
        }) }} />

        <CtaFinal
          titulo="O próximo erro seu, corrigido na hora."
          sub={`${PRECO.diasGratis} dias de Premium grátis, sem cartão. Fale com o professor de IA e veja quantos desses você ainda comete.`}
          botao="Começar grátis →"
        />
        <Footer />
      </div>
      <StickyCta texto="Testar grátis →" />
    </div>
  )
}
