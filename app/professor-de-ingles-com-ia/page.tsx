import Link from 'next/link'
import { AZUL, ESCURO, PRECO, container, cta, Nav, Footer, Card, Faq, StickyCta, CtaFinal, type Pergunta } from '../_marketing/ui'

// Página do "Vô", o professor de IA — o recurso que diferencia o Vonai de app de
// flashcard. Quem busca "professor de inglês online" ou "aprender inglês com IA" está
// comparando alternativas, então a página compara de frente e admite o que a IA NÃO
// faz melhor que gente. Página de produto que só elogia o próprio produto não é lida
// como argumento, é lida como anúncio — e a pessoa volta para a busca.

export const metadata = {
  title: 'Professor de Inglês com IA 24h — Converse e seja corrigido na hora | Vonai',
  description: 'Um professor de inglês com IA que conversa com você a qualquer hora, corrige sua pronúncia na hora e explica o erro em português. Sem hora marcada, sem plateia, sem vergonha de errar. Teste grátis.',
  alternates: { canonical: '/professor-de-ingles-com-ia' },
  // openGraph próprio: sem isto o Next mantém o do layout, e TODA página
  // compartilhada no WhatsApp mostrava o mesmo título genérico.
  openGraph: {
    title: 'Professor de Inglês com IA 24h — Converse e seja corrigido na hora | Vonai',
    description: 'Um professor de inglês com IA que conversa com você a qualquer hora, corrige sua pronúncia na hora e explica o erro em português. Sem hora marcada, sem plateia, sem vergonha de errar. Teste grátis.',
    url: '/professor-de-ingles-com-ia',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professor de Inglês com IA 24h — Converse e seja corrigido na hora | Vonai',
    description: 'Um professor de inglês com IA que conversa com você a qualquer hora, corrige sua pronúncia na hora e explica o erro em português. Sem hora marcada, sem plateia, sem vergonha de errar. Teste grátis.',
  },
}

const FAQ: Pergunta[] = [
  { q: 'O professor de IA substitui um professor de verdade?', a: 'Em uma coisa ele ganha e em outra perde. Ele ganha em disponibilidade e volume: está lá às 6h e às 2h, aguenta você repetir a mesma frase vinte vezes e nunca demonstra impaciência — e é falando muito que a fluência aparece. Ele perde em julgamento humano: um bom professor entende seu contexto de vida, seu objetivo real e ajusta a rota de um jeito que nenhuma IA faz igual. O uso mais inteligente é combinar: a IA para o volume diário, e um professor humano quando você quiser orientação de percurso.' },
  { q: 'Ele corrige pronúncia mesmo, ou só o texto?', a: 'Corrige a fala. Você fala pelo microfone e ele analisa palavra por palavra, apontando os sons específicos que travam o brasileiro — o "th" de think, o "-ed" do passado, o H aspirado de house, o R final. As explicações vêm em português.' },
  { q: 'Preciso saber inglês para começar a conversar com ele?', a: 'Não. Ele se ajusta ao seu nível: no A1 usa frases curtas e devagar, e explica tudo em português. Você pode inclusive responder em português no começo — ele mostra como seria em inglês e pede para você repetir.' },
  { q: 'E se eu errar muito? Fico com vergonha.', a: 'É exatamente para isso que ele existe. Não tem plateia, não tem turma rindo e não tem nota. Errar na frente da IA custa zero, e essa é a diferença que destrava quem entende inglês mas trava na hora de falar.' },
  { q: 'Posso conversar sobre qualquer assunto?', a: 'Pode puxar assunto livre ou escolher uma situação pronta: entrevista de emprego, imigração no aeroporto, hotel, restaurante, reunião de trabalho, médico, e mais de vinte cenas. O simulador é onde a maioria dos alunos passa mais tempo, porque é o mais parecido com a vida real.' },
  { q: 'Ele erra?', a: 'Como toda IA, pode errar em casos raros e ambíguos — uma gíria muito regional, uma construção rara. Na correção do dia a dia (concordância, tempo verbal, preposição, pronúncia, ordem da frase) o acerto é alto e consistente. Se algo parecer estranho, pergunte "why?" que ele explica o raciocínio, e aí você julga.' },
  { q: 'Quanto custa conversar com ele?', a: `Novos alunos começam com ${PRECO.diasGratis} dias de Premium grátis, sem cartão — conversa sem limite com o professor e todas as simulações. Depois, o Premium custa ${PRECO.mensal} por mês (ou ${PRECO.anual}/ano), sem fidelidade.` },
]

function Bolha({ eu, children }: { eu?: boolean; children: React.ReactNode }) {
  if (eu) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
        <div style={{ background: AZUL, color: '#fff', borderRadius: '16px 16px 4px 16px', padding: '10px 14px', fontSize: 14.5, maxWidth: '82%' }}>{children}</div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', marginBottom: 10 }}>
      <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: '16px 16px 16px 4px', padding: '12px 14px', fontSize: 14.5, maxWidth: '88%', lineHeight: 1.55 }}>{children}</div>
    </div>
  )
}

export default function ProfessorDeInglesComIA() {
  return (
    <div style={{ fontFamily: 'inherit', color: '#102A4C', background: '#fff' }}>
      <Nav />
      <div className="vn-body-pad">
        <div style={{ background: `linear-gradient(160deg, #2E72D6, ${ESCURO})`, color: '#fff' }}>
          <div style={{ ...container, padding: '52px 20px 56px', maxWidth: 860, textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 18 }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>🕐 Disponível 24h</span>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>🇧🇷 Explica em português</span>
            </div>
            <h1 style={{ fontSize: 38, lineHeight: 1.15, fontWeight: 800, margin: '0 0 16px' }}>Um professor de inglês com IA que <span style={{ color: '#FFD98A' }}>conversa</span> com você</h1>
            <p style={{ fontSize: 18, color: '#D6E6FA', lineHeight: 1.6, margin: '0 auto 26px', maxWidth: 640 }}>
              Sem hora marcada, sem turma e sem plateia. Você fala, ele entende, corrige na hora e explica o erro em português — quantas vezes você precisar.
            </p>
            <Link href="/cadastro" style={cta}>Conversar com ele agora →</Link>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center', marginTop: 20, fontSize: 13.5, color: '#B5D4F4' }}>
              <span>✓ {PRECO.diasGratis} dias grátis</span>
              <span>✓ Sem cartão de crédito</span>
              <span>✓ Funciona no celular e no computador</span>
            </div>
          </div>
        </div>

        {/* Demonstração — mostrar vale mais que descrever */}
        <div style={{ ...container, padding: '52px 20px 8px', maxWidth: 860 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 8px' }}>Como é uma conversa com ele</h2>
          <p style={{ textAlign: 'center', color: '#5B6B82', fontSize: 16, margin: '0 0 30px' }}>Você fala pelo microfone. Ele responde, aponta o erro e pede para tentar de novo.</p>
          <div style={{ maxWidth: 500, margin: '0 auto', background: '#F6F8FB', borderRadius: 22, padding: '22px 18px', border: '1px solid #E8ECF2' }}>
            <Bolha eu>🎙️ &quot;I go to the doctor yesterday because I was feeling bad.&quot;</Bolha>
            <Bolha>
              Boa frase! 👏 Dois ajustes: <strong>&quot;I went&quot;</strong> — &quot;yesterday&quot; pede passado. E cuidado com <strong>&quot;feeling bad&quot;</strong>: em inglês isso soa como culpa. Para saúde, use <strong>&quot;feeling sick&quot;</strong> ou <strong>&quot;unwell&quot;</strong>. Tenta de novo?
            </Bolha>
            <Bolha eu>🎙️ &quot;I went to the doctor yesterday because I was feeling sick.&quot;</Bolha>
            <Bolha>
              ✅ <strong>Perfeito.</strong> Pronúncia: 8/10 — o <strong>&quot;went&quot;</strong> saiu certinho. Só o <strong>&quot;because&quot;</strong> saiu como <em>bi-cause</em>; o certo é <em>bi-cóz</em>, com o peso na segunda sílaba. Agora me conta: what did the doctor say?
            </Bolha>
          </div>
          <p style={{ textAlign: 'center', color: '#7C8AA0', fontSize: 13.5, marginTop: 16, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
            Exemplo ilustrativo do formato da correção. As frases variam conforme o que você fala e o seu nível.
          </p>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link href="/cadastro" style={cta}>Quero conversar assim →</Link>
          </div>
        </div>

        {/* O que ele faz, concreto */}
        <div style={{ background: '#F6F8FB', marginTop: 48 }}>
          <div style={{ ...container, padding: '48px 20px', maxWidth: 860 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 30px' }}>O que ele corrige de verdade</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
              <Card e="🗣️" t="Pronúncia, som por som" d='Aponta a sílaba tônica errada e os sons que não existem em português: "th", "-ed", H aspirado, R final.' />
              <Card e="🧩" t="Estrutura da frase" d='Ordem das palavras, tempo verbal, preposição — os erros que vêm de traduzir do português na cabeça.' />
              <Card e="🎭" t="Naturalidade" d='Quando a frase está certa mas soa estranha, ele mostra como um nativo diria. É o que separa o B2 do C1.' />
              <Card e="📚" t="Vocabulário no contexto" d="Sugere a palavra que cabe naquela situação, e não o sinônimo genérico do dicionário." />
              <Card e="❓" t="Sua dúvida, na hora" d='Pode perguntar "por que não pode ser assim?" em português. Ele explica o raciocínio, não só a regra.' />
              <Card e="🎬" t="+20 situações reais" d="Entrevista de emprego, aeroporto, hotel, restaurante, reunião, médico. Você vive a cena antes de viver de verdade." />
            </div>
          </div>
        </div>

        {/* Comparação honesta — inclusive onde a IA perde */}
        <div style={{ ...container, padding: '48px 20px 8px', maxWidth: 820 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 10px' }}>IA ou professor humano?</h2>
          <p style={{ color: '#5B6B82', fontSize: 16, lineHeight: 1.65, textAlign: 'center', margin: '0 0 28px' }}>
            A resposta honesta é que depende do que você precisa naquele momento. Onde cada um ganha:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: 18 }}>
            <div style={{ background: '#fff', border: `2px solid ${AZUL}`, borderRadius: 18, padding: 22 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: AZUL, marginBottom: 12 }}>Onde a IA ganha</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#5B6B82', fontSize: 14.5, lineHeight: 1.85 }}>
                <li>Está disponível às 6h e às 2h da madrugada</li>
                <li>Aguenta a mesma frase repetida vinte vezes</li>
                <li>Nunca demonstra pressa nem impaciência</li>
                <li>Custa menos de R$1 por dia</li>
                <li>Não tem plateia — errar não custa nada</li>
              </ul>
            </div>
            <div style={{ background: '#fff', border: '1px solid #E8ECF2', borderRadius: 18, padding: 22 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#102A4C', marginBottom: 12 }}>Onde o humano ganha</div>
              <ul style={{ margin: 0, paddingLeft: 18, color: '#5B6B82', fontSize: 14.5, lineHeight: 1.85 }}>
                <li>Entende seu contexto de vida e seu objetivo real</li>
                <li>Puxa você quando a motivação cai</li>
                <li>Percebe o que você não disse</li>
                <li>Ajusta a rota do curso com julgamento próprio</li>
                <li>Prepara para exame específico e presencial</li>
              </ul>
            </div>
          </div>
          <p style={{ color: '#5B6B82', fontSize: 16, lineHeight: 1.7, marginTop: 24, textAlign: 'center' }}>
            Na prática, o que trava a maioria das pessoas não é falta de orientação — é <strong>falta de horas falando</strong>. Uma aula por semana dá 4 horas por mês, e boa parte disso é a turma falando. Cinco minutos por dia com a IA dão mais tempo de boca aberta do que qualquer agenda semanal aguenta.
          </p>
        </div>

        {/* Quem usa e para quê */}
        <div style={{ background: '#F6F8FB', marginTop: 48 }}>
          <div style={{ ...container, padding: '48px 20px', maxWidth: 860 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', margin: '0 0 30px' }}>Para que as pessoas mais usam</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
              <Card e="💼" t="Ensaiar a entrevista" d='Treinar "Tell me about yourself" e as perguntas difíceis até a resposta sair sem travar.' />
              <Card e="✈️" t="Preparar a viagem" d="Imigração, check-in, pedir no restaurante, resolver problema no hotel — antes de estar lá." />
              <Card e="🏢" t="Aguentar a reunião" d="Praticar apresentação, pedir para repetir sem constrangimento, discordar com educação." />
              <Card e="🎯" t="Destravar de vez" d="Para quem entende tudo e não fala nada: falar todo dia, sem plateia, até a voz voltar." />
            </div>
          </div>
        </div>

        <Faq itens={FAQ} titulo="Perguntas sobre o professor de IA" />

        <CtaFinal
          titulo="Sua primeira conversa pode ser em 2 minutos."
          sub={`${PRECO.diasGratis} dias de Premium grátis, sem cartão. Fale, erre e seja corrigido — sem ninguém olhando.`}
          botao="Conversar grátis agora →"
        />
        <Footer />
      </div>
      <StickyCta texto="Conversar grátis →" />
    </div>
  )
}
