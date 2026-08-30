import AuthForm from '../login/AuthForm'
import { PRECO } from '../_marketing/ui'

export const metadata = {
  title: 'Crie sua conta grátis — Vonai',
  description: `Comece com ${PRECO.diasGratis} dias de Premium grátis, sem cartão. Aprenda inglês com um professor de IA que lembra de você.`,
  alternates: { canonical: '/cadastro' },
  // openGraph próprio: sem isto o Next mantém o do layout, e TODA página
  // compartilhada no WhatsApp mostrava o mesmo título genérico.
  openGraph: {
    title: 'Crie sua conta grátis — Vonai',
    description: `Comece com ${PRECO.diasGratis} dias de Premium grátis, sem cartão. Aprenda inglês com um professor de IA que lembra de você.`,
    url: '/cadastro',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Crie sua conta grátis — Vonai',
    description: `Comece com ${PRECO.diasGratis} dias de Premium grátis, sem cartão. Aprenda inglês com um professor de IA que lembra de você.`,
  },
}

export default function Cadastro() {
  return <AuthForm modoInicial="cadastro" />
}
