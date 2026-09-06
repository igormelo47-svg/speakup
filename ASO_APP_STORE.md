# App Store Connect — o que corrigir (02/09/2026)

A ficha já está localizada em **Português (Brasil)** — verificado dentro do App
Store Connect em 02/09. O que aparece como "IDIOMA: EN Inglês" na página
pública é outra coisa: são os idiomas do próprio app (as localizações do
binário), não a ficha da loja. Vale corrigir um dia, porque num app vendido
como "feito para brasileiros" fica estranho, mas **não afeta a busca**.

O que realmente precisa mudar é o texto: o título usa 5 dos 30 caracteres
disponíveis, o subtítulo não diz "inglês" nem "IA", e a descrição ainda
promete 2 dias de teste.

## Estado dos campos na versão 1.0 (verificado em 02/09)

A versão 1.0 está como "Pronto para distribuição", e nesse estado **Descrição
e Palavras-chave aparecem bloqueadas** — só liberam numa versão nova. Os
únicos campos com "Editar" ativo são **Texto promocional** e **Copyright**.

Ou seja: nome, subtítulo, palavras-chave e descrição entram junto com a
próxima atualização do app. Vale deixar tudo escrito agora para colar de uma
vez quando a versão nova for criada.

## Campos que exigem uma nova versão

### Nome (30 caracteres)
```
Vonai: Inglês com IA
```
20 de 30. Alinha com o Play ("Vonai: Aprender Inglês com IA") e coloca as
duas palavras que as pessoas realmente buscam dentro do campo de maior peso.

### Subtítulo (30 caracteres)
```
Conversação e pronúncia 24h
```
27 de 30. Nenhuma palavra repetida do título — a Apple indexa título,
subtítulo e palavras-chave juntos, então repetir é desperdiçar caractere.
O subtítulo atual ("Professor particular 24h") não diz nem "inglês" nem "IA".

### Palavras-chave (100 caracteres, separadas por vírgula, sem espaços)
```
aprender,curso,fluencia,falar,idioma,professor,licoes,estudar,vocabulario,gramatica,listening,toefl
```
99 de 100. Sem acento (a Apple normaliza), sem repetir nada que já está no
nome ou no subtítulo, sem plural desnecessário (o algoritmo combina termos).

### Descrição — dois erros a corrigir
- "**2 dias** de acesso completo, sem cartão" → **3 dias** (é o que o site,
  o app e o `PRECO.diasGratis` dizem).
- "Premium Anual: R$ 289,**90** por ano" → o site diz R$ 289,**80**. Deixe o
  texto igual ao preço real da faixa da Apple e ajuste o site se for o caso —
  preço divergente entre loja e site vira reclamação.

## Campo que dá para trocar agora

O **Texto promocional** (170 caracteres) é editável sem submeter versão, e ele
aparece ACIMA da descrição na página do app — então é ele que conserta, hoje, a
promessa errada de "2 dias" que está travada na descrição. Texto atual:

> Aprenda inglês conversando com uma IA que lembra de você. Feito para
> brasileiros: correção em português, pronúncia avaliada e trilha do zero ao
> avançado.

Trocar por:
```
Fale inglês desde a primeira aula: um professor de IA que corrige sua
pronúncia na hora e explica em português. 3 dias de Premium grátis, sem cartão.
```

## Enquanto estiver lá
- Nome do desenvolvedor aparece como "igor melo", em minúsculas. Se a conta
  permitir, ajuste para "Vonai" ou "Igor Melo".
- Últimas avaliações são de 3 de agosto. Ligue o pedido de avaliação
  (`SKStoreReviewController`) depois da 3ª lição concluída, não na abertura.
