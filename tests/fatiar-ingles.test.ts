import { describe, it, expect } from 'vitest'
import { fatiarIngles, trechosIngles, semMarcacao } from '../lib/fatiar-ingles'

// Detector fake: nesta suíte, "é inglês" = não tem acento nem palavra-alvo do português.
const ehIngles = (s: string) => !/[ãõçáéíóúâêô]/i.test(s) && !/\b(que|voce|nao|obrigado)\b/i.test(s)

describe('fatiarIngles', () => {
  it('separa o inglês marcado do português ao redor', () => {
    const r = fatiarIngles('Diga <en>I am hungry</en> quando tiver fome.', true, ehIngles)
    expect(r).toEqual([
      { txt: 'Diga ', en: false },
      { txt: 'I am hungry', en: true },
      { txt: ' quando tiver fome.', en: false },
    ])
  })

  it('aceita mais de um trecho em inglês na mesma resposta', () => {
    const r = fatiarIngles('Use <en>I have</en> e não <en>I has</en>.', true, ehIngles)
    expect(r.filter(p => p.en).map(p => p.txt)).toEqual(['I have', 'I has'])
  })

  it('nunca deixa a tag aparecer crua quando ela vem quebrada', () => {
    const r = fatiarIngles('Fala assim: <en>hello there', true, ehIngles)
    expect(r.map(p => p.txt).join('')).not.toContain('<en')
    expect(r.map(p => p.txt).join('')).toBe('Fala assim: hello there')
  })

  it('cai para as aspas quando o modelo esquece de marcar', () => {
    const r = fatiarIngles('Você fala "good morning" de manhã.', true, ehIngles)
    expect(r.filter(p => p.en).map(p => p.txt)).toEqual(['good morning'])
  })

  it('não pinta de inglês uma citação em português', () => {
    const r = fatiarIngles('Ele disse "não entendi nada" ontem.', true, ehIngles)
    expect(r.some(p => p.en)).toBe(false)
  })

  it('ignora o fallback quando ele não foi pedido (tela do simulador)', () => {
    const r = fatiarIngles('She said "good morning" to me.', false, ehIngles)
    expect(r.some(p => p.en)).toBe(false)
  })

  it('a marcação explícita ganha do fallback de aspas', () => {
    const r = fatiarIngles('Diga <en>good night</en> e não "boa noite".', true, ehIngles)
    expect(r.filter(p => p.en).map(p => p.txt)).toEqual(['good night'])
  })

  it('texto sem inglês nenhum volta inteiro em uma fatia', () => {
    const r = fatiarIngles('Bom dia, tudo bem com você?', true, ehIngles)
    expect(r).toEqual([{ txt: 'Bom dia, tudo bem com você?', en: false }])
  })

  it('não devolve fatias vazias', () => {
    const r = fatiarIngles('<en>Hello</en>', true, ehIngles)
    expect(r).toEqual([{ txt: 'Hello', en: true }])
  })
})

describe('trechosIngles', () => {
  it('devolve só o que a IA marcou, para a voz ler em inglês', () => {
    expect(trechosIngles('Use <en>I am</en> e <en>you are</en> assim.')).toEqual(['I am', 'you are'])
  })

  it('devolve vazio quando não há marcação — aí a voz volta a adivinhar', () => {
    expect(trechosIngles('Bom dia! Tudo certo?')).toEqual([])
  })
})

describe('semMarcacao', () => {
  it('tira as tags para o texto sair limpo do app', () => {
    expect(semMarcacao('Diga <en>hi</en> agora')).toBe('Diga hi agora')
  })
})
