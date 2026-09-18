# Ignore as duas versões anteriores deste arquivo

18/09/2026. Eu reescrevi este documento três vezes e errei nas duas primeiras.
Esta versão é curta porque é só o que sobrou de verdade.

## Apague, se ainda não apagou

```
app/app/components/Vo.tsx
app/app/components/vo-keyframes.css
```

Eu escrevi um componente `Vo` e um `VoFala` que **já existiam** no `page.tsx`
(linhas 1828 e 1863). Duplicata pura.

## Minhas recomendações de código: todas erradas

| O que eu afirmei | Realidade |
|---|---|
| Esconder a barra de abas na lição | Já feito, linha 8714 (`{!treinoAtivo && (`) |
| O balão do Vô bloqueia o clique | Já resolvido no QA de 15/08 com `pointerEvents: 'none'` |
| Criar a coruja em SVG com humores | Já existe: `Mascote`, 5 humores, é uma **arara-azul** |
| Tirar as Missões da home | Você já decidiu manter (comentário na linha 5789) |
| `humor="triste"` nunca é usado | Usado em 4 lugares, via ternário `? 'comemora' : 'triste'` |

O último erro é o mais instrutivo: procurei a string literal `humor="triste"` e
não achei nada, e concluí que a arara não reagia ao erro. Ela reage — o código
escreve `humor={acertou ? 'comemora' : 'triste'}`. Conclusão tirada de um grep
mal feito sobre um arquivo de 8.739 linhas.

**Não aplique nada da minha lista de código.** O app está em melhor estado do que
o meu diagnóstico dizia.

## O que sobra, e é só o que eu vi com os próprios olhos

Isto vem dos prints da sua home, não de leitura de código:

- **21 números na tela inicial.** Contei um por um.
- **Dois cards de Evolução na mesma tela**: "Evolução · Métricas e conquistas" e
  "Sua evolução".
- **"Excluir minha conta" na home**, ao lado de "enviar feedback".
- **Quatro cores de botão** para ações equivalentes: Jogar verde, Ler
  azul-escuro, Enviar dourado, Ativar azul.
- **A tela abre com três zeros**: "+0 hoje", "0/50 XP", "0/3 missões".

Isso é diagnóstico de tela, e continua de pé. O que eu não devia ter feito é
transformar cada item em instrução de código sem ler o código primeiro.

## O que fazer

Uma coisa só, e quem decide o "como" é quem lê o arquivo — não eu:

> Abra o Claude Code na pasta do projeto e peça: *"A home do app tem 21 números
> visíveis e dois cards de Evolução duplicados. Leia o page.tsx, me diga quais
> números dá pra remover sem perder informação útil, e proponha a mudança antes
> de aplicar."*

Ele lê o arquivo inteiro, tem contexto do projeto e roda o build. Eu trabalhei
com prints e grep, e o resultado está na tabela acima.
