// Fila de progresso que não conseguiu ser gravado (aluno sem internet, erro do banco).
// Fica aqui, fora do componente, porque é a regra que decide se o aluno PERDE ou não o
// que conquistou — e isso merece teste.

export type Patch = Record<string, any>

// Junta o que já estava pendente com o que acabou de falhar. O valor mais novo de cada
// campo vence; campos que não vieram agora continuam valendo (uma gravação só de moedas
// não pode apagar o XP que estava esperando).
export function mesclarPendente(atual: Patch | null | undefined, novo: Patch): Patch {
  return { ...(atual || {}), ...novo }
}

// O que deve SOBRAR na fila depois de um reenvio bem-sucedido.
//
// Existe por causa do intervalo assíncrono: entre ler a fila e a resposta do servidor
// chegar, o aluno pode ter concluído outra lição que também falhou e entrou na fila.
// Apagar a fila inteira nesse momento jogaria fora um progresso que nunca foi enviado.
// Por isso só some o que continua idêntico ao que acabou de ser gravado.
export function sobrasAposEnvio(filaAgora: Patch | null | undefined, enviado: Patch): Patch {
  const fila = filaAgora || {}
  const sobrou: Patch = {}
  for (const chave of Object.keys(fila)) {
    if (JSON.stringify(fila[chave]) !== JSON.stringify(enviado[chave])) sobrou[chave] = fila[chave]
  }
  return sobrou
}
