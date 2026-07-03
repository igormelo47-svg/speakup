export const metadata = {
  title: 'Excluir conta e dados — Vonai',
  description: 'Como solicitar a exclusão da sua conta do Vonai e de todos os dados associados.',
}

export default function ExcluirConta() {
  const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, marginTop: 28, marginBottom: 6, color: '#102A4C' }
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '48px 22px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#243447', lineHeight: 1.65 }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#102A4C' }}>
        Excluir sua conta e seus dados — Von<span style={{ color: '#185FA5' }}>ai</span>
      </h1>
      <p style={{ marginTop: 10 }}>
        Você pode solicitar a exclusão da sua conta do <b>Vonai</b> e de todos os dados
        associados a ela a qualquer momento, sem custo.
      </p>

      <h2 style={h2}>Como solicitar</h2>
      <p>
        Envie um e-mail para <b>igormelo47@gmail.com</b> com o assunto{' '}
        <b>“Excluir minha conta”</b>, informando o <b>e-mail cadastrado</b> no app.
        Processamos sua solicitação em até <b>7 dias</b> e confirmamos a exclusão por e-mail.
      </p>

      <h2 style={h2}>O que é excluído</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li>Sua conta e o e-mail cadastrado</li>
        <li>Seu nome</li>
        <li>Todo o seu progresso: XP, lições concluídas, sequência, moedas e histórico de estudo</li>
      </ul>

      <h2 style={h2}>O que é mantido</h2>
      <p>
        Nada é mantido após a exclusão, exceto informações que a lei exigir que sejam
        conservadas. A exclusão é <b>permanente</b> e não pode ser desfeita.
      </p>

      <p style={{ marginTop: 40, fontSize: 13, color: '#8896a6' }}>
        Vonai — Aprenda inglês com IA · <a href="/privacidade" style={{ color: '#185FA5' }}>Política de Privacidade</a>
      </p>
    </div>
  )
}
