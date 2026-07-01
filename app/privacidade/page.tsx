import Link from 'next/link'

export const metadata = { title: 'Política de Privacidade — Vonai' }

export default function Privacidade() {
  const box: React.CSSProperties = { maxWidth: 760, margin: '0 auto', padding: '32px 20px 64px', fontFamily: 'system-ui, sans-serif', color: '#1f2937', lineHeight: 1.7 }
  const h2: React.CSSProperties = { fontSize: 17, fontWeight: 600, marginTop: 28, marginBottom: 6, color: '#103D77' }
  return (
    <div style={box}>
      <Link href="/login" style={{ color: '#1E63C7', fontSize: 14, textDecoration: 'none' }}>← Voltar</Link>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 16, color: '#103D77' }}>Política de Privacidade</h1>
      <p style={{ color: '#6b7280', fontSize: 13 }}>Última atualização: 30/06/2026 · Em conformidade com a LGPD (Lei nº 13.709/2018)</p>

      <h2 style={h2}>1. Dados que coletamos</h2>
      <p>Coletamos os dados que você fornece ao se cadastrar e usar o app: nome, e-mail e, opcionalmente, número de WhatsApp. Também guardamos seu progresso de estudo (XP, sequência, lições concluídas) e as conversas feitas com o professor de IA.</p>

      <h2 style={h2}>2. Como usamos seus dados</h2>
      <p>Usamos seus dados para: criar e manter sua conta; salvar e exibir seu progresso; personalizar o aprendizado; processar pagamentos (no caso do Premium); e enviar lembretes e comunicações sobre o app, quando você autorizar.</p>

      <h2 style={h2}>3. Compartilhamento</h2>
      <p>Não vendemos seus dados. Compartilhamos informações apenas com serviços necessários para o funcionamento do app: Supabase (banco de dados e autenticação), Anthropic (professor de IA) e a plataforma de pagamento (ex.: Kiwify). Esses parceiros tratam os dados conforme suas próprias políticas.</p>

      <h2 style={h2}>4. Conversas com a IA</h2>
      <p>As mensagens enviadas ao professor de IA são processadas por um provedor externo para gerar as respostas. Evite compartilhar informações pessoais sensíveis nessas conversas.</p>

      <h2 style={h2}>5. Seus direitos (LGPD)</h2>
      <p>Você pode solicitar a qualquer momento o acesso, a correção ou a exclusão dos seus dados, além de revogar consentimentos. Para isso, entre em contato pelo e-mail abaixo.</p>

      <h2 style={h2}>6. Segurança</h2>
      <p>Adotamos medidas técnicas para proteger seus dados, como autenticação segura e controle de acesso por usuário. Nenhum sistema é 100% imune, mas trabalhamos para reduzir riscos.</p>

      <h2 style={h2}>7. Crianças e adolescentes</h2>
      <p>Menores de idade devem usar o app com consentimento e supervisão dos responsáveis.</p>

      <h2 style={h2}>8. Alterações</h2>
      <p>Esta Política pode ser atualizada. Avisaremos sobre mudanças relevantes no app.</p>

      <h2 style={h2}>9. Contato do responsável pelos dados</h2>
      <p>Para exercer seus direitos ou tirar dúvidas: <a href="mailto:igormelo47@gmail.com" style={{ color: '#1E63C7' }}>igormelo47@gmail.com</a>.</p>

      <p style={{ marginTop: 32 }}><Link href="/termos" style={{ color: '#1E63C7' }}>Ver Termos de Uso →</Link></p>
    </div>
  )
}
