import Link from 'next/link'

export const metadata = { title: 'Termos de Uso — Vonai' }

export default function Termos() {
  const box: React.CSSProperties = { maxWidth: 760, margin: '0 auto', padding: '32px 20px 64px', fontFamily: 'system-ui, sans-serif', color: '#1f2937', lineHeight: 1.7 }
  const h2: React.CSSProperties = { fontSize: 17, fontWeight: 600, marginTop: 28, marginBottom: 6, color: '#103D77' }
  return (
    <div style={box}>
      <Link href="/login" style={{ color: '#1E63C7', fontSize: 14, textDecoration: 'none' }}>← Voltar</Link>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 16, color: '#103D77' }}>Termos de Uso</h1>
      <p style={{ color: '#6b7280', fontSize: 13 }}>Última atualização: 30/06/2026</p>

      <h2 style={h2}>1. Sobre o Vonai</h2>
      <p>O Vonai é uma plataforma online de ensino de inglês que oferece lições, vocabulário, exercícios de áudio, simulador de conversação e um professor com inteligência artificial. Ao criar uma conta e usar o aplicativo, você concorda com estes Termos.</p>

      <h2 style={h2}>2. Cadastro e conta</h2>
      <p>Para usar o Vonai é necessário criar uma conta com e-mail e senha. Você é responsável por manter seus dados de acesso em sigilo e por todas as atividades realizadas na sua conta. Os dados informados devem ser verdadeiros.</p>

      <h2 style={h2}>3. Planos e pagamento</h2>
      <p>O Vonai pode oferecer recursos gratuitos e recursos pagos (Premium). Os pagamentos são processados por plataformas parceiras (ex.: Kiwify). Valores, formas de cobrança e renovação são informados no momento da contratação. Cancelamentos e reembolsos seguem a legislação aplicável e as regras da plataforma de pagamento.</p>

      <h2 style={h2}>4. Uso permitido</h2>
      <p>Você se compromete a usar o app apenas para fins pessoais e de aprendizado, sem copiar, revender ou redistribuir o conteúdo, e sem tentar burlar, sobrecarregar ou prejudicar o funcionamento da plataforma.</p>

      <h2 style={h2}>5. Conteúdo gerado por IA</h2>
      <p>O professor e o simulador usam inteligência artificial. As respostas podem conter imprecisões e têm finalidade educacional, não substituindo orientação profissional. Não envie dados sensíveis nas conversas com a IA.</p>

      <h2 style={h2}>6. Propriedade intelectual</h2>
      <p>Todo o conteúdo, marca, lições e design do Vonai pertencem aos seus criadores e são protegidos por lei. O uso do app não transfere nenhum desses direitos a você.</p>

      <h2 style={h2}>7. Encerramento</h2>
      <p>Podemos suspender ou encerrar contas que violem estes Termos. Você pode encerrar sua conta a qualquer momento entrando em contato pelo e-mail de suporte.</p>

      <h2 style={h2}>8. Alterações</h2>
      <p>Estes Termos podem ser atualizados. Mudanças relevantes serão comunicadas no app. O uso contínuo após as alterações representa concordância com a nova versão.</p>

      <h2 style={h2}>9. Contato</h2>
      <p>Dúvidas sobre estes Termos: <a href="mailto:igormelo47@gmail.com" style={{ color: '#1E63C7' }}>igormelo47@gmail.com</a>.</p>

      <p style={{ marginTop: 32 }}><Link href="/privacidade" style={{ color: '#1E63C7' }}>Ver Política de Privacidade →</Link></p>
    </div>
  )
}
