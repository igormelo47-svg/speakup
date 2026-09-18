# A home do Vonai — análise feita no código

18/09/2026. Lido direto no `app/app/page.tsx` (8.739 linhas), no bloco da home
que você realmente vê: linha **5972**, o branch `tab === 'home' && !homeGuiada`.

Esta é a primeira análise minha deste projeto que não vem de print nem de grep.

---

## Descoberta estrutural: a home existe duas vezes

```
linha 5971:  {tab === 'home' && homeGuiada && renderHomeGuiada()}
linha 5972:  {tab === 'home' && !homeGuiada && ( ...a home inline... )}
```

São **duas implementações completas** da tela inicial, com blocos quase
idênticos repetidos: o cabeçalho de progresso aparece em 5611 e em 6011, as
Missões da semana em 5798 e em 6149.

Consequência prática: **toda mudança na home tem que ser feita em dois lugares.**
É quase certamente por isso que as coisas divergem com o tempo — alguém altera
uma cópia e esquece a outra.

Isso vem antes de qualquer discussão de design. Enquanto for duplicado, arrumar
a home custa o dobro e desarruma sozinho.

---

## O problema de compreensão não são os números

Contei os blocos que a home renderiza, em ordem:

| | Bloco |
|---|---|
| 1 | Cabeçalho: logo, moedas, tema, Sair, saudação, nome, PRO |
| 2 | Progresso do nível: anel A1, XP, hoje, lições |
| 3 | Sequência + recorde |
| 4 | Nível N + faltam X XP |
| 5 | Meta de hoje 0/50 XP |
| 6 | **VÔ · SEU PROFESSOR** com 3 botões: Fazer lição · Conversar agora · Tirar dúvida |
| 7 | Liga da semana (ranking) |
| 8 | Histórias |
| 9 | Caça-Erros do Brasileiro |
| 10 | Revisão Inteligente |
| 11 | **Seu plano de hoje**: Lição de hoje · Revisar nível · Falar com a IA · Desafio do dia |
| 12 | Missões da semana (3 missões) |
| 13 | Seja Premium · R$ 29,90/mês |
| 14 | Banner "Seu teste está acabando" |
| 15 | **Explorar**: 8 cards — Lições, Simulador, Professor IA, Vocabulário, Pronúncia, Prova Semanal, Teste de nível, Evolução |
| 16 | Ativar lembretes diários |
| 17 | Convide um amigo |
| 18 | Conquistas |
| 19 | Vonai · enviar feedback · Excluir minha conta |

**Dezenove blocos numa tela que rola.** E o número não é o problema — o problema
é qual pergunta cada um responde.

## O achado: três blocos respondem a mesma pergunta

Os blocos 6, 11 e 15 todos respondem *"o que eu faço agora?"*, com as mesmas
quatro opções:

| | Bloco 6 (VÔ) | Bloco 11 (Plano de hoje) | Bloco 15 (Explorar) |
|---|---|---|---|
| Fazer lição | ✓ | ✓ | ✓ |
| Conversar com IA | ✓ | ✓ | ✓ |
| Tirar dúvida | ✓ | — | ✓ |
| Revisar / desafio | — | ✓ | ✓ |

O aluno abre o app e recebe a mesma decisão três vezes, com nomes diferentes,
em estilos visuais diferentes. **Isso é o que produz "não sei o que esse app
quer de mim"** — não a quantidade de dígitos.

Essa é a explicação mais provável do "design simplista" dos testadores. Não é
falta de conteúdo. É a mesma escolha oferecida três vezes, o que faz nenhuma
parecer a principal.

---

## O que eu faria, em ordem

### 1. Escolher UM bloco de "o que fazer agora"

Minha sugestão: manter o **bloco 6, o do Vô**, e cortar 11 e 15 da home.

Por quê o do Vô: ele é o único que tem voz — chega falando com o aluno, em vez
de listar botões. E é o ativo que nenhum concorrente copia. "Seu plano de hoje"
e "Explorar" são menus, e menu é o que a barra de abas já faz.

O bloco 11 vira o conteúdo da aba Trilha. O bloco 15 (8 cards) já está quase
todo coberto pelas abas — o que sobrar entra em Trilha também.

### 2. Desduplicar a home

Extrair o bloco 5972 para uma função, do mesmo jeito que `renderHomeGuiada()`
já é, e fazer as duas compartilharem os subcomponentes. Enquanto houver duas
cópias, qualquer arrumação volta a divergir.

### 3. Cortar da home o que não é "agora"

- **Bloco 19**: "Excluir minha conta" ao lado de "enviar feedback" — vai para
  Configurações. Ação destrutiva não fica na tela inicial.
- **Blocos 7, 17, 18** (Liga, Convide um amigo, Conquistas): são engajamento
  social, não estudo. Uma aba ou a tela de Conquistas resolve os três.
- **Blocos 13 e 14**: monetização aparece duas vezes ("Seja Premium" e "teste
  acabando"). Um só, e condicional.

Isso tira nove dos dezenove blocos sem remover uma única funcionalidade do
produto — tudo continua existindo, só não na primeira tela.

### 4. Só então mexer em número e cor

Os blocos 2, 3, 4 e 5 somam quatro medidas de progresso diferentes (anel do
nível CEFR, sequência, nível numérico, meta diária em XP). Dá pra unificar, mas
isso é refinamento — não é o que está confundindo o aluno.

---

## O que eu NÃO vou afirmar

Não rodei build nem teste. Não sei se `homeGuiada` é experimento ativo, resquício
de A/B ou o onboarding dos primeiros dias — isso muda se a desduplicação é
simples ou se uma das cópias pode simplesmente ser apagada. **É a primeira coisa
que eu perguntaria a quem escreveu.**

E o corte do bloco 11 e 15 é opinião de design, não fato do código. Se você
discorda, o essencial continua valendo: **escolha um, não três.**
