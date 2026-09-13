// ============================================================================
// A/B — sorteio determinístico, sem servidor e sem biblioteca.
//
// Como funciona: a variante sai de um hash do (id da pessoa + nome do experimento). Mesma
// pessoa, mesma variante, sempre — inclusive se ela trocar de aparelho, porque o id usado é
// o user_id do Supabase quando existe. Dois experimentos diferentes NÃO se correlacionam,
// porque o nome do experimento entra no hash.
//
// O que este arquivo NÃO faz de propósito: decidir vencedor. A variante escolhida viaja
// dentro de TODO evento de funil (campo `variante` em /api/funil), e a comparação é feita
// no /admin, com os números reais. Declarar vencedor com 40 assinaturas é como não testar.
//
// Como ligar/desligar um experimento: mexa em `EXPERIMENTOS` abaixo.
//   • `ativo: false`  → todo mundo cai na variante `padrao` (o comportamento de hoje).
//   • `peso`          → fatia de cada variante, em partes do total. [1, 1] é meio a meio.
// Nada além deste objeto precisa mudar para rodar ou parar um teste.
// ============================================================================

export type DefExperimento = {
  ativo: boolean
  variantes: string[]
  peso: number[]
  /** Uma linha dizendo o que este teste quer descobrir. Aparece no /admin. */
  pergunta: string
}

export const EXPERIMENTOS: Record<string, DefExperimento> = {
  // Qual promessa faz mais gente começar. A é a de hoje.
  cta_inicio: {
    ativo: false,
    variantes: ['padrao', 'destravar'],
    peso: [1, 1],
    pergunta: 'CTA "Começar meu plano" vs "Destravar meu inglês" — qual leva mais gente à 1ª lição?',
  },
  // Em que momento a oferta aparece pela primeira vez no dia 0.
  momento_oferta: {
    ativo: true,
    variantes: ['pos_licao1', 'pos_licao2'],
    peso: [1, 1],
    pergunta: 'Oferta logo após a 1ª lição ou só depois da 2ª? Antes demais irrita, tarde demais perde a pessoa.',
  },
  // Qual plano abre a tela. Anual primeiro ancora alto; mensal primeiro reduz o susto.
  ordem_planos: {
    ativo: false,
    variantes: ['anual_primeiro', 'mensal_primeiro'],
    peso: [1, 1],
    pergunta: 'Anual em destaque no topo ou mensal primeiro? Mede ticket médio, não só taxa.',
  },
  // O que a oferta contextual promete: continuidade do plano ou o acervo completo.
  texto_oferta: {
    ativo: false,
    variantes: ['plano', 'acervo'],
    peso: [1, 1],
    pergunta: '"Continuar seu plano personalizado" vs "Desbloquear todas as lições" — qual converte?',
  },
}

// Hash estável (FNV-1a de 32 bits). Não precisa ser criptográfico: precisa ser o mesmo
// em qualquer aparelho e bem distribuído entre as fatias.
function hash(s: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h >>> 0
}

/**
 * Variante desta pessoa neste experimento. `id` deve ser o user_id quando houver
 * (segue a pessoa entre aparelhos) e o anon_id antes do cadastro.
 * Experimento desligado, id vazio ou nome desconhecido → a primeira variante (a de hoje).
 */
export function variante(experimento: string, id: string | null | undefined): string {
  const def = EXPERIMENTOS[experimento]
  if (!def) return 'padrao'
  if (!def.ativo || !id) return def.variantes[0]

  const total = def.peso.reduce((a, b) => a + b, 0)
  if (total <= 0) return def.variantes[0]

  let ponto = hash(`${experimento}:${id}`) % total
  for (let i = 0; i < def.variantes.length; i++) {
    ponto -= def.peso[i] ?? 0
    if (ponto < 0) return def.variantes[i]
  }
  return def.variantes[0]
}

/** Todas as variantes ativas desta pessoa, para carimbar no evento de funil. */
export function variantesAtivas(id: string | null | undefined): Record<string, string> {
  const saida: Record<string, string> = {}
  for (const [nome, def] of Object.entries(EXPERIMENTOS)) {
    if (def.ativo) saida[nome] = variante(nome, id)
  }
  return saida
}

/** Forma curta para gravar numa coluna só: "momento_oferta=pos_licao1;texto_oferta=plano". */
export function assinaturaVariantes(id: string | null | undefined): string {
  const v = variantesAtivas(id)
  return Object.entries(v)
    .map(([k, val]) => `${k}=${val}`)
    .join(';')
}
