import AuthForm from './AuthForm'

export const metadata = {
  title: 'Entrar — Vonai',
  description: 'Entre na sua conta do Vonai e continue aprendendo inglês com seu professor de IA.',
  alternates: { canonical: '/login' },
}

export default function Login() {
  return <AuthForm />
}
