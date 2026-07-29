import AuthForm from '../login/AuthForm'

export const metadata = {
  title: 'Crie sua conta grátis — Vonai',
  description: 'Comece com 2 dias de Premium grátis, sem cartão. Aprenda inglês com um professor de IA que lembra de você.',
  alternates: { canonical: '/cadastro' },
}

export default function Cadastro() {
  return <AuthForm modoInicial="cadastro" />
}
