// Perguntas e classificação do teste de nível público (/teste-de-nivel-de-ingles).
// Fora do componente porque é a parte que dá para testar sem navegador: se um índice
// de resposta certa sair do lugar numa edição de texto, o teste diz o nível errado
// para todo mundo e ninguém percebe olhando a tela.

export type Pergunta = {
  nivel: string
  frase: string
  opcoes: string[]
  certa: number
  porque: string
}

// Ordem crescente de dificuldade, duas por nível. Cada uma isola UMA estrutura — se
// a pessoa erra, dá para dizer o que ela não domina, não só que "errou".
export const PERGUNTAS: Pergunta[] = [
  { nivel: 'A1', frase: '___ is my sister.', opcoes: ['She', 'Her', 'Hers'], certa: 0, porque: 'Quem faz a ação é "she". "Her" e "hers" são posse ou objeto.' },
  { nivel: 'A1', frase: 'I ___ coffee every morning.', opcoes: ['drinks', 'drink', 'am drink'], certa: 1, porque: 'Com "I" o verbo não leva -s. O -s é só para he, she e it.' },
  { nivel: 'A2', frase: 'Yesterday she ___ to the market.', opcoes: ['goes', 'go', 'went'], certa: 2, porque: '"Yesterday" pede passado, e o passado de "go" é irregular: went.' },
  { nivel: 'A2', frase: "There aren't ___ eggs left.", opcoes: ['some', 'any', 'a'], certa: 1, porque: 'Em frase negativa usa-se "any". "Some" fica nas afirmativas.' },
  { nivel: 'B1', frase: 'If it rains tomorrow, we ___ at home.', opcoes: ['will stay', 'stayed', 'would stay'], certa: 0, porque: 'Condicional real: "if" no presente e o resultado com "will".' },
  { nivel: 'B1', frase: "I've worked here ___ 2019.", opcoes: ['for', 'during', 'since'], certa: 2, porque: '"Since" marca o ponto de início; "for" marca a duração (for 5 years).' },
  { nivel: 'B2', frase: "She's used to ___ up early.", opcoes: ['wake', 'waking', 'woke'], certa: 1, porque: 'Depois de "used to" no sentido de estar acostumado, o verbo vai no -ing.' },
  { nivel: 'B2', frase: 'By the time I arrived, the meeting ___.', opcoes: ['already started', 'had already started', 'has already started'], certa: 1, porque: 'Passado antes de outro passado pede o past perfect: had + particípio.' },
  { nivel: 'C1', frase: 'Had I known, I ___ differently.', opcoes: ['would act', 'had acted', 'would have acted'], certa: 2, porque: 'Condicional irreal no passado: would have + particípio.' },
  { nivel: 'C1', frase: "I'd rather you ___ anything to her about it.", opcoes: ["don't say", "didn't say", 'not say'], certa: 1, porque: 'Depois de "I\'d rather you" o verbo vai no passado, mesmo falando do presente.' },
  { nivel: 'C2', frase: 'No sooner ___ down than the phone rang.', opcoes: ['he had sat', 'had he sat', 'he sat'], certa: 1, porque: 'Frase começando com "No sooner" inverte sujeito e auxiliar.' },
  { nivel: 'C2', frase: 'Little ___ that the meeting had been cancelled.', opcoes: ['he knew', 'knew he', 'did he know'], certa: 2, porque: 'Mesma inversão: advérbio negativo no começo puxa o auxiliar para a frente.' },
]

export type Resultado = { nivel: string; titulo: string; texto: string; proximo: string }

// Faixas em cima de 12 questões. O corte é generoso na base de propósito: dizer "você
// é A1" para quem acertou 5 empurra a pessoa para fora em vez de trazer para dentro.
export function classificar(acertos: number): Resultado {
  if (acertos <= 2) return { nivel: 'A1', titulo: 'Iniciante (A1)', texto: 'Você reconhece palavras soltas e frases muito simples. É o ponto de partida de quem nunca estudou ou estudou há muito tempo — e é o nível que mais evolui rápido, porque cada aula acrescenta algo que você usa no mesmo dia.', proximo: 'Comece pelo presente simples e pelas primeiras 500 palavras, falando em voz alta desde a primeira lição.' }
  if (acertos <= 4) return { nivel: 'A2', titulo: 'Básico (A2)', texto: 'Você já monta frases do dia a dia e entende assunto conhecido. Trava quando a conversa sai do roteiro — pedir informação, contar o que fez no fim de semana, responder uma pergunta inesperada.', proximo: 'Foque em passado e futuro, e treine conversas de situação real: restaurante, hotel, apresentar-se.' }
  if (acertos <= 6) return { nivel: 'B1', titulo: 'Intermediário (B1)', texto: 'Você se vira. Entende o assunto, se faz entender e sobrevive a uma viagem. O gargalo aqui quase nunca é gramática — é velocidade e vergonha de errar na frente do outro.', proximo: 'Sua prioridade é volume de fala. Conversar todo dia, mesmo que 5 minutos, é o que tira o B1 do lugar.' }
  if (acertos <= 8) return { nivel: 'B2', titulo: 'Intermediário avançado (B2)', texto: 'Você sustenta uma conversa longa e argumenta. É o nível que a maioria das empresas pede como "inglês avançado". O que ainda entrega é a naturalidade: tradução literal do português e pronúncia de sons que não existem aqui.', proximo: 'Trabalhe collocations, phrasal verbs e pronúncia fina. Simulação de entrevista de emprego rende muito nesse nível.' }
  if (acertos <= 10) return { nivel: 'C1', titulo: 'Avançado (C1)', texto: 'Você usa o inglês com fluidez em contexto profissional e entende nuance. Falha só em registro — saber quando uma frase soa formal demais, informal demais ou traduzida.', proximo: 'Treine registro e idiomatismo com conversas longas sobre temas que você não domina em português.' }
  return { nivel: 'C2', titulo: 'Proficiente (C2)', texto: 'Você domina estrutura, inversão e registro. Nesse ponto o ganho não vem de gramática nova, vem de manutenção: sem uso frequente, a fluência oxida rápido.', proximo: 'Mantenha o hábito com conversa diária sobre temas variados, e use o app para não perder o ritmo.' }
}

// Gabarito em texto, do jeito que a página mostra. Existe para o teste automatizado
// conferir que o índice `certa` aponta para a alternativa que realmente é a certa.
export function respostaCerta(p: Pergunta): string {
  return p.opcoes[p.certa]
}
