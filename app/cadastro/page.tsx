import AuthForm from '../login/AuthForm'
import { PRECO } from '../_marketing/ui'

export const metadata = {
  title: 'Crie sua conta grátis — Vonai',
  description: `Comece com ${PRECO.diasGratis} dias de Premium grátis, sem cartão. Aprenda inglês com um professor de IA que lembra de você.`,
  alternates: { canonical: '/cadastro' },
}

export default function Cadastro() {
  return <AuthForm modoInicial="cadastro" />
}
