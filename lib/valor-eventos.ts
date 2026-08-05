// Escada de valor das conversões enviadas ao Google Ads e ao Meta.
//
// POR QUE ISTO EXISTE: até 05/08/2026 o evento `inicio_teste` (criar conta) ia com
// value 29,90 -- exatamente o preço de uma assinatura mensal. Para o algoritmo de
// lances, cadastro e venda valiam a mesma coisa, então ele passou a comprar quem se
// cadastra, que é o mais barato de achar. E foi muito bem nisso: 12 cadastros a
// R$11,83 e ZERO assinantes. O algoritmo não errou o trabalho -- nós erramos o alvo.
//
// A correção é a escada abaixo: cada degrau do funil vale mais que o anterior, e só a
// assinatura vale dinheiro de verdade. Isso ensina o lance a preferir quem vai longe,
// mesmo antes de existir a primeira venda para aprender sozinho.
//
// OS NÚMEROS INTERMEDIÁRIOS SÃO ARBITRÁRIOS DE PROPÓSITO. O que o algoritmo lê é a
// PROPORÇÃO entre eles, não o valor absoluto -- por isso não adianta discutir se
// ativação "vale" R$6. O que importa é que ativar valha o dobro de cadastrar e um
// quinto de voltar no segundo dia.
//
// COMO RECALIBRAR quando existirem vendas: pegar, para cada degrau, a proporção de
// quem chegou nele e acabou pagando, e multiplicar pelo preço. Ex.: se 20% de quem
// volta no 2º dia assina, retencaoD2 = 0,20 × 29,90 ≈ 6. Enquanto não houver pagante
// nenhum, não há o que medir, e a escada abaixo é um chute informado.
//
// ⚠️ O relatório de "valor de conversão" no Google Ads deixa de ser receita real --
// vira pontuação. Receita real só sai de assinaturaMensal/assinaturaAnual, do painel
// em /admin e da Kiwify. Combinar isso com o gestor antes de olhar qualquer ROAS.

export const VALOR = {
  // Enviou o formulário. Vale pouco: metade some antes de abrir o app.
  cadastro: 1,
  // Criou a conta e carregou o app.
  inicioTeste: 3,
  // Usou de verdade: fez o nivelamento, uma lição ou uma conversa.
  ativacao: 6,
  // Voltou em um segundo dia. É o degrau mais preditivo que temos: ninguém que
  // largou no primeiro dia chegou perto de assinar.
  retencaoD2: 15,
  // Dinheiro de verdade. Os únicos valores que batem com o extrato.
  assinaturaMensal: 29.9,
  assinaturaAnual: 289.8,
  // A App Store cobra numa faixa própria; o valor real do anual no iOS é outro.
  assinaturaAnualIOS: 289.9,
} as const

export const MOEDA = 'BRL'
