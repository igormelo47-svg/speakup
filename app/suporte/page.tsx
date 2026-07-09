import Link from 'next/link'

export const metadata = { title: 'Suporte — Vonai' }

// Página de suporte exigida pela App Store (guideline 1.5.0 — Developer Information):
// a "Support URL" dos metadados deve levar a uma página com forma real de contato.
export default function Suporte() {
  const box: React.CSSProperties = { maxWidth: 760, margin: '0 auto', padding: '32px 20px 64px', fontFamily: 'inherit', color: '#1f2937', lineHeight: 1.7 }
  const h2: React.CSSProperties = { fontSize: 17, fontWeight: 600, marginTop: 28, marginBottom: 6, color: '#103D77' }
  return (
    <div style={box}>
      <Link href="/" style={{ color: '#1E63C7', fontSize: 14, textDecoration: 'none' }}>← Voltar</Link>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 16, color: '#103D77' }}>Suporte Vonai</h1>
      <p style={{ color: '#6b7280', fontSize: 13 }}>Estamos aqui para ajudar você a aprender inglês sem obstáculos.</p>

      <h2 style={h2}>Fale com a gente</h2>
      <p>Dúvidas, problemas com a conta, pagamento ou sugestões: escreva para{' '}
        <a href="mailto:igormelo47@gmail.com" style={{ color: '#1E63C7' }}>igormelo47@gmail.com</a>.
        Respondemos em até 2 dias úteis.</p>
      <p>Você também pode enviar mensagens direto pelo app, no menu <b>Perfil → Enviar feedback</b>.</p>

      <h2 style={h2}>Assinatura e pagamentos</h2>
      <p>Assinou pelo iPhone (App Store): gerencie ou cancele em <b>Ajustes → seu nome → Assinaturas</b>.
        Assinou pelo site ou Android (Kiwify): cancele pelo link no e-mail de compra ou fale com a gente pelo e-mail acima.</p>

      <h2 style={h2}>Conta e dados</h2>
      <p>Para excluir sua conta e todos os seus dados, acesse <Link href="/excluir-conta" style={{ color: '#1E63C7' }}>vonai.com.br/excluir-conta</Link>.</p>

      <h2 style={h2}>Documentos</h2>
      <p><Link href="/termos" style={{ color: '#1E63C7' }}>Termos de Uso</Link> · <Link href="/privacidade" style={{ color: '#1E63C7' }}>Política de Privacidade</Link></p>
    </div>
  )
}
