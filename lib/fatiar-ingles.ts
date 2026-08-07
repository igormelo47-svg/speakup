// Separa o que é inglês do que é português dentro de uma resposta da IA.
//
// O prompt do professor (app/api/chat/prompts.ts) manda marcar TODO inglês com
// <en>…</en>. O app usa essa marcação para duas coisas que antes eram adivinhação:
// pintar o inglês de outra cor (o aluno precisa saber qual pedaço ele deve FALAR) e
// ler em voz inglesa só o que é inglês de verdade.
//
// `ehIngles` é injetado para a função continuar pura e testável — em produção é o
// detector heurístico que já existe no app.

export type Fatia = { txt: string; en: boolean }

const TAG = /<en>([\s\S]*?)<\/en>/gi
const ASPAS = /["“]([^"“”]{2,})["”]/g

export function fatiarIngles(t: string, comFallback: boolean, ehIngles: (s: string) => boolean): Fatia[] {
  const out: Fatia[] = []
  const push = (txt: string, en: boolean) => { if (txt) out.push({ txt, en }) }
  const re = new RegExp(TAG.source, 'gi')
  let fim = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(t))) { push(t.slice(fim, m.index), false); push(m[1].trim(), true); fim = m.index + m[0].length }
  push(t.slice(fim), false)
  // Tag órfã (<en> sem fechar, ou </en> solto) não pode aparecer crua na tela.
  const limpos = out.map(p => (p.en ? p : { ...p, txt: p.txt.replace(/<\/?en>/gi, '') })).filter(p => p.txt)

  // A IA marcou: confia nela. Sem fallback pedido: entrega como está.
  if (out.some(p => p.en) || !comFallback) return limpos

  // Fallback para quando o modelo esquece a marcação: texto entre aspas que passa no
  // teste de inglês. Conservador de propósito — pintar português de azul confunde mais
  // do que não pintar nada.
  const porAspas: Fatia[] = []
  const reAspas = new RegExp(ASPAS.source, 'g')
  fim = 0
  while ((m = reAspas.exec(t))) {
    if (!ehIngles(m[1])) continue
    if (m.index > fim) porAspas.push({ txt: t.slice(fim, m.index), en: false })
    porAspas.push({ txt: m[1], en: true })
    fim = m.index + m[0].length
  }
  if (!porAspas.length) return limpos
  if (fim < t.length) porAspas.push({ txt: t.slice(fim), en: false })
  return porAspas.filter(p => p.txt)
}

// Só os trechos marcados como inglês, para a voz ler com sotaque certo.
export function trechosIngles(t: string): string[] {
  const re = new RegExp(TAG.source, 'gi')
  const out: string[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(t))) { const s = m[1].trim(); if (s) out.push(s) }
  return out
}

// Remove a marcação, para quando o texto vai para fora da tela (voz em português,
// histórico enviado de volta ao modelo, resumo).
export function semMarcacao(t: string): string {
  return t.replace(/<\/?en>/gi, '')
}
