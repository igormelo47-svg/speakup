// ============================================================================
// O QUE ACONTECE QUANDO O TESTE GRÁTIS ACABA — um interruptor só, lido pelo app
// (app/app/page.tsx) e pelos e-mails/lembretes (lib/email.ts, /api/send-reminders).
//
// PAYWALL_DURO = true  → o app TRANCA na tela de assinatura (regra de 19/08 a 13/11/2026).
// PAYWALL_DURO = false → a tela de assinatura aparece 1x por dia, com um botão
//                        "Continuar no plano grátis". Quem não assina segue estudando com
//                        os limites do grátis, que já existiam no app desde 18/08.
//
// Por que mudou em 13/11/2026: com a trava, 149 contas geraram zero assinantes e ninguém
// do tráfego pago voltou no 2º dia. Três dias não criam hábito, e quem é trancado antes
// do hábito não volta para pagar — vai embora. Grátis limitado mantém a pessoa abrindo o
// app todo dia, e é para quem abre todo dia que a oferta diária faz sentido.
//
// Para voltar à trava total: troque para `true`, publique. Nada mais precisa mudar.
// ============================================================================
export const PAYWALL_DURO = false

// Limites do plano grátis, em texto, para e-mail e push dizerem o mesmo que o app faz.
// Os números de verdade moram em app/app/page.tsx (LIMITE_DIA_LICOES, PROF_LIMIT,
// FREE_LIMIT) — se mudar lá, mude aqui.
export const GRATIS = {
  licoesDia: 3,
  mensagensProfessorDia: 10,
  conversasDia: 3,
  resumo: '3 lições, 10 mensagens com o professor e 3 conversas por dia',
}
