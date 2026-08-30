import AuthForm from './AuthForm'

export const metadata = {
  title: 'Entrar — Vonai',
  description: 'Entre na sua conta do Vonai e continue aprendendo inglês com seu professor de IA.',
  alternates: { canonical: '/login' },
  // openGraph próprio: sem isto o Next mantém o do layout, e TODA página
  // compartilhada no WhatsApp mostrava o mesmo título genérico.
  openGraph: {
    title: 'Entrar — Vonai',
    description: 'Entre na sua conta do Vonai e continue aprendendo inglês com seu professor de IA.',
    url: '/login',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Entrar — Vonai',
    description: 'Entre na sua conta do Vonai e continue aprendendo inglês com seu professor de IA.',
  },
}

export default function Login() {
  return <AuthForm />
}
