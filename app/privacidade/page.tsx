import Link from 'next/link'

export const metadata = { title: 'Política de Privacidade — Vonai', alternates: { canonical: '/privacidade' } }

export default function Privacidade() {
  const box: React.CSSProperties = { maxWidth: 760, margin: '0 auto', padding: '32px 20px 64px', fontFamily: 'inherit', color: '#1f2937', lineHeight: 1.7 }
  const h2: React.CSSProperties = { fontSize: 17, fontWeight: 600, marginTop: 28, marginBottom: 6, color: '#103D77' }
  return (
    <div style={box}>
      <Link href="/login" style={{ color: '#1E63C7', fontSize: 14, textDecoration: 'none' }}>← Voltar</Link>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginTop: 16, color: '#103D77' }}>Política de Privacidade</h1>
      <p style={{ color: '#6b7280', fontSize: 13 }}>Última atualização: 05/08/2026 · Em conformidade com a LGPD (Lei nº 13.709/2018)</p>

      <h2 style={h2}>1. Dados que coletamos</h2>
      <p>Coletamos os dados que você fornece ao se cadastrar e usar o app: nome, e-mail e, opcionalmente, número de WhatsApp. Também guardamos seu progresso de estudo (XP, sequência, lições concluídas) e as conversas feitas com o professor de IA.</p>
      <p>Quando você chega ao Vonai por um anúncio, guardamos também o identificador daquele clique (por exemplo, os parâmetros que o Google e o Meta acrescentam ao link) e dados básicos de uso do app, para saber quais anúncios realmente trazem alunos.</p>

      <h2 style={h2}>2. Como usamos seus dados</h2>
      <p>Usamos seus dados para: criar e manter sua conta; salvar e exibir seu progresso; personalizar o aprendizado; processar pagamentos (no caso do Premium); enviar lembretes e comunicações sobre o app, quando você autorizar; medir a eficácia da nossa divulgação, como explicado no item 4; e mostrar anúncios nossos a quem já nos visitou, como explicado no item 5.</p>

      <h2 style={h2}>3. Compartilhamento</h2>
      <p>Não vendemos seus dados. Compartilhamos informações apenas com serviços necessários para o funcionamento do app: Supabase (banco de dados e autenticação), Anthropic (professor de IA) e a plataforma de pagamento (ex.: Kiwify). Esses parceiros tratam os dados conforme suas próprias políticas.</p>

      <h2 style={h2}>4. Medição de publicidade (Google e Meta)</h2>
      <p>O Vonai é divulgado por anúncios, e precisamos saber quais deles funcionam para não desperdiçar o investimento. Para isso usamos ferramentas de medição do <strong>Google</strong> (Google Analytics, Gerenciador de Tags e Google Ads) e da <strong>Meta</strong> (Facebook/Instagram).</p>
      <p>O que enviamos a essas empresas: eventos de uso (por exemplo, criação de conta e assinatura), o identificador do clique no anúncio e um <strong>código criptografado gerado a partir do seu e-mail</strong>. Esse código é gerado por uma função de mão única (SHA-256): serve para reconhecer que a mesma pessoa clicou no anúncio e criou a conta, e <strong>não permite recuperar seu e-mail</strong> a partir dele.</p>
      <p>Nunca enviamos a essas empresas o seu e-mail em texto legível, sua senha, o conteúdo das suas conversas com o professor de IA ou seu número de WhatsApp.</p>
      <p>A base legal é o legítimo interesse em medir e melhorar nossa divulgação (art. 7º, IX, da LGPD). Você pode se opor a esse uso a qualquer momento pelo e-mail do item 11, e isso não afeta seu acesso ao app. Bloqueadores de anúncios e as configurações de privacidade do seu navegador ou celular também impedem essa medição.</p>

      {/* Os quatro itens abaixo são exigência do Google para rodar remarketing (uso, sites
          de terceiros, cookies e link de descadastro). Sem eles a campanha não pode existir
          — ver support.google.com/adwords/answer/2549063. Se um dia o remarketing for
          desligado, esta seção pode sair; enquanto houver campanha, ela é obrigatória. */}
      <h2 style={h2}>5. Anúncios para quem já visitou (remarketing)</h2>
      <p>Se você visita o Vonai e vai embora sem criar conta — ou cria a conta e não volta —, podemos <strong>mostrar anúncios nossos para você em outros sites e aplicativos</strong> depois disso, para lembrar você de continuar. Isso se chama remarketing.</p>
      <p>Esses anúncios são exibidos por meio do <strong>Google</strong> e da <strong>Meta</strong> em <strong>sites e apps de terceiros</strong>, incluindo os próprios serviços do Google (como YouTube e Gmail) e sites parceiros. Para saber a quem mostrar, essas empresas e nós usamos <strong>cookies e identificadores parecidos</strong> gravados no seu navegador ou aparelho, que registram que você esteve aqui.</p>
      <p>Não sabemos quem é você nessa lista: vemos apenas o tamanho do público. Nenhum dado sensível é usado para montá-la, e não fazemos anúncio direcionado a menores de idade.</p>
      <p><strong>Como sair disso:</strong> você pode desativar a personalização de anúncios do Google em <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" style={{ color: '#1E63C7' }}>google.com/settings/ads</a>, a da Meta nas preferências de anúncios da sua conta do Facebook ou Instagram, e usar as configurações do seu navegador para bloquear cookies. Sair da lista não afeta em nada o seu acesso ao app.</p>
      {/* Link para a política do Google: exigência formal deles para rodar remarketing,
          além dos outros quatro itens. Apontado pelo gestor de tráfego em 05/08. */}
      <p>Para entender como o Google trata os dados que recebe, veja a política de privacidade deles em <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#1E63C7' }}>policies.google.com/privacy</a>, e a da Meta em <a href="https://www.facebook.com/privacy/policy" target="_blank" rel="noopener noreferrer" style={{ color: '#1E63C7' }}>facebook.com/privacy/policy</a>.</p>

      <h2 style={h2}>6. Conversas com a IA</h2>
      <p>As mensagens enviadas ao professor de IA são processadas por um provedor externo para gerar as respostas. Evite compartilhar informações pessoais sensíveis nessas conversas.</p>

      <h2 style={h2}>7. Seus direitos (LGPD)</h2>
      <p>Você pode solicitar a qualquer momento o acesso, a correção ou a exclusão dos seus dados, além de revogar consentimentos. Para isso, entre em contato pelo e-mail abaixo.</p>

      <h2 style={h2}>8. Segurança</h2>
      <p>Adotamos medidas técnicas para proteger seus dados, como autenticação segura e controle de acesso por usuário. Nenhum sistema é 100% imune, mas trabalhamos para reduzir riscos.</p>

      <h2 style={h2}>9. Crianças e adolescentes</h2>
      <p>Menores de idade devem usar o app com consentimento e supervisão dos responsáveis.</p>

      <h2 style={h2}>10. Alterações</h2>
      <p>Esta Política pode ser atualizada. Avisaremos sobre mudanças relevantes no app.</p>

      <h2 style={h2}>11. Contato do responsável pelos dados</h2>
      <p>Para exercer seus direitos ou tirar dúvidas: <a href="mailto:igormelo47@gmail.com" style={{ color: '#1E63C7' }}>igormelo47@gmail.com</a>.</p>

      <p style={{ marginTop: 32 }}><Link href="/termos" style={{ color: '#1E63C7' }}>Ver Termos de Uso →</Link></p>
    </div>
  )
}
