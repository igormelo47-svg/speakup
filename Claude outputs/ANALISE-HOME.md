# Correção: minha análise anterior era de código morto

18/09/2026.

## O erro

Minha análise da home (os "19 blocos", os "três blocos que respondem a mesma
pergunta", os oito pastéis do Explorar) foi feita no branch da linha 6022:

```
{tab === 'home' && !homeGuiada && ( ... )}
```

`homeGuiada` é `useState(true)` e só vira `false` com `?home=antiga` na URL.
**Aquele bloco inteiro — umas 450 linhas — nunca aparece para nenhum aluno.**
O seu próprio código já diz isso, na linha 5919:

> `homeGuiada nunca vira false — aquele bloco inteiro é inalcançável.`

Eu li o arquivo, mas li o pedaço errado dele. A home de verdade é
`renderHomeGuiada()`, linha 5602.

## E ela já estava resolvida

Quase tudo que eu ia "consertar" você já tinha consertado na home real:

| O que eu ia propor | Situação na home real |
|---|---|
| Unificar os cards de banner coloridos | Já feito: `bannerRow`, linha 5557 |
| Unificar os 8 pastéis do Explorar | Já feito: `cardExplorar`, linha 5546 |
| Escolher UM "o que fazer agora" | Já feito: o herói tem UMA ação, com prévia de 3 passos |
| Rotular as seções | "Explorar" já era rotulado |

O comentário que você escreveu no `bannerRow` diz exatamente o que eu ia dizer:
*"Os degradês multicoloridos davam cara de banner de promoção; a família
unificada dá cara de produto."*

## O que sobrou de verdade, e foi aplicado

1. **Dois cards sósias do professor, colados.** O herói e o card "Fale com o Vô"
   tinham o mesmo degradê azul, o mesmo círculo branco de 52px e a mesma arara de
   42px, um embaixo do outro. O segundo agora é a única superfície clara com tarja
   dourada da home — continua em destaque, mas para de parecer repetição.
2. **A arara estava parada.** Agora pisca (um olho 0,35s depois do outro), mexe as
   asas e balança a borla — e o humor sai do estado real do aluno, não fixo em
   "feliz": acena para quem chega, comemora quem treinou, fica atento para quem
   ainda não abriu o treino.
3. **O Vô falava e ninguém sabia.** O `falarPt` no toque existia desde sempre sem
   nada na tela indicando. Ganhou a pílula "🔊 ouvir".
4. **"0/50 XP" na abertura.** Enquanto o dia está zerado, virou "50 XP hoje ·
   vamos lá". As missões mostram "+150 🪙 a ganhar" em vez de "0/3".
5. **"Sua evolução" quebrava no modo escuro** — os três quadros usavam pastel fixo
   e continuavam claros. Agora vêm do tema.
6. **"Excluir minha conta"** tinha o mesmo peso de "enviar feedback". Continua
   alcançável (5.1.1(v) exige), mas depois do fio, em texto terciário.
7. **Rótulos "Seu dia" e "Treine agora"**, no mesmo estilo do "Explorar".

## Verificado (o que faltava nas outras sete tentativas)

Clonei o repo, rodei `npm install` e conferi antes de mandar:

```
tsc --noEmit    → 0 erros
next build      → OK (44 rotas)
vitest run      → 143 testes, 15 arquivos, todos passando
eslint          → 417 problemas, exatamente os mesmos de antes
```

## Duas coisas para você decidir

- **Apague** `app/app/components/Vo.tsx` e `app/app/components/vo-keyframes.css`.
  Sou eu que escrevi, duplicam o que já existe no `page.tsx`, e nada importa eles.
  Não consigo apagar daqui.
- **O branch morto** (~450 linhas, linha 6022) e o parâmetro `bg` do
  `cardExplorar`, que ninguém usa mais. Dá para apagar, mas é decisão sua — não
  toquei.
