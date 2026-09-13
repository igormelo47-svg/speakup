# Funil de conversão — como o Vonai passa a medir (13/09/2026)

Este arquivo é o manual de uma coisa só: **descobrir onde as pessoas somem entre instalar e
assinar, com número, sem depender de ninguém.**

---

## O problema que isto resolve

Até hoje o funil do Vonai vivia em três lugares que não se falam:

| Onde | O que sabe | O que não sabe |
|---|---|---|
| Pixel do Meta | visitas, testes de nível | se a pessoa criou conta, se voltou, se pagou |
| GTM / GA4 | o que o gestor de tráfego tiver criado como tag | qualquer evento sem tag — que some sem aviso |
| `/admin` (Supabase) | tudo depois de "criou conta" | tudo antes de "criou conta" |

O resultado prático: o número mais importante do negócio — *"3.500 visitas → 603 testes →
149 contas → 0 assinantes"* — precisou ser remontado à mão, e mesmo assim ninguém conseguia
provar que as 603 e as 149 eram as mesmas pessoas.

E a consequência cara: entre 30/08 e 13/09 o Stripe ficou sem variável de ambiente em
produção. Todo checkout web caiu na Kiwify em silêncio, o código se comportou exatamente
como foi escrito, e **nenhum número em lugar nenhum acusou**.

---

## As peças

| Arquivo | Papel |
|---|---|
| `lib/funil.ts` | `funil(evento, props, opts)` — um ponto de chamada, três destinos (GTM, GA4 pelo servidor, nosso banco). Lista de eventos como constantes: `EV.*`. |
| `app/api/funil/route.ts` | Recebe, valida, resolve a identidade pelo token, grava em `eventos_funil` e espelha no GA4. Nunca falha de um jeito que atrapalhe o aluno. |
| `migracao_2026-09-13_funil.sql` | A tabela. **Rode no Supabase antes de esperar número.** |
| `lib/experimento.ts` | A/B determinístico. A variante viaja dentro de cada evento. |
| `app/api/admin/funil/route.ts` | Monta o funil, os gatilhos, os planos, a retenção e o A/B. |
| `app/api/diagnostico/route.ts` | "O caminho do dinheiro está de pé?" — lê as integrações e diz o que está desligado. |
| `/admin` | Desenha tudo isso. Bloco **Integrações** no topo, **Funil completo** logo abaixo. |

---

## Os eventos

Nome no código em `lib/funil.ts` (`EV.*`). Os marcados **degrau** contam uma vez por pessoa
— é o que permite calcular taxa de conversão sem que quem abre o app cinco vezes valha cinco.

### Antes da conta existir (identidade = `anon_id`)

| Evento | Quando | Degrau |
|---|---|---|
| `vn_visita` | chegou a qualquer página pública | sim |
| `vn_teste_iniciado` | começou o teste de nível | sim |
| `vn_teste_concluido` | terminou o teste (com `nivel` e `acertos`) | sim |
| `vn_cadastro_aberto` | abriu a tela de cadastro | sim |
| `vn_cadastro_enviado` | criou a conta | sim |
| `vn_cadastro_erro` | o cadastro **foi recusado** (com o motivo) | não |

`vn_cadastro_erro` é o que separa "ninguém quis criar conta" de "o formulário estava
recusando gente que queria".

### Depois da conta (identidade = `user_id`)

| Evento | Quando | Degrau |
|---|---|---|
| `vn_app_aberto` | abriu o app (com `dia` = dias de vida da conta) | não |
| `vn_onb_iniciado` | viu a 1ª tela do onboarding | sim |
| `vn_onb_passo` | avançou uma tela (com `passo`) | não |
| `vn_onb_pulado` | tocou em "pular" (com `passo`) | não |
| `vn_onb_concluido` | terminou o onboarding | sim |
| `vn_nivel_definido` / `vn_meta_definida` | escolheu nível e minutos/dia | sim |
| `vn_licao1_iniciada` / `vn_licao1_concluida` | primeira lição | sim |
| `vn_resultado_visto` | viu a tela "Seu plano está pronto" | sim |
| `vn_licao_concluida` | qualquer lição (com `total`) | não |
| `vn_conversa1` | primeira conversa | sim |

### Oferta e dinheiro

| Evento | Quando | Degrau |
|---|---|---|
| `vn_paywall_visto` | viu a oferta — **com `gatilho`** | não |
| `vn_plano_selecionado` | escolheu mensal/anual | não |
| `vn_checkout_iniciado` | o checkout abriu — **com `gateway`** | não |
| `vn_checkout_falhou` | o gateway recusou ou caiu — **com `motivo`** | não |
| `vn_assinatura` | virou assinante | sim |
| `vn_trial_expirou` | bateu no paywall de fim de teste | sim |

**`vn_checkout_falhou` é o alarme.** É o evento que teria gritado em 30/08. Qualquer número
diferente de zero aí é urgente, não "para olhar depois".

**`gatilho`** é o campo que responde a pergunta que mais importa para a conversão: *qual
momento da oferta funciona*. Valores: `resultado` (fim da 1ª lição), `progresso` (tela de
evolução), `fim_licao`, `card_home`, `chip`, `topo`, `limite_professor`,
`limite_simulador`, `limite_licoes`, `fim_trial`.

---

## Como ler o funil (`/admin`)

Duas taxas por degrau, de propósito:

- **do anterior** — onde vaza. É por ela que se escolhe onde mexer.
- **do topo** — quanto sobra. É a taxa de conversão do produto.

A linha vermelha é a maior queda absoluta. **Enquanto o buraco estiver antes do último
degrau, mexer em preço é resolver o problema errado.**

Abaixo do funil:

- **Qual momento da oferta converte** — viram / checkout / assinaram, por gatilho.
- **Por plano e por gateway** — a distância entre "escolheu um plano" e "abriu o checkout" é
  onde um gateway quebrado aparece.
- **Retenção por dia de vida** — D0, D1, D2, D3, D7, D14, D30.
- **Testes A/B rodando** — números lado a lado, sem vencedor declarado.

---

## A/B: como ligar, desligar e ler

Tudo em `lib/experimento.ts`, no objeto `EXPERIMENTOS`. `ativo: false` faz todo mundo cair
na primeira variante (o comportamento de hoje). Nada além desse objeto precisa mudar.

Rodando agora:

| Experimento | Pergunta | Estado |
|---|---|---|
| `momento_oferta` | oferta depois da 1ª lição ou só a partir da 2ª? | **ativo** |
| `texto_oferta` | "continuar seu plano" vs "desbloquear todas as lições" | desligado |
| `ordem_planos` | anual primeiro vs mensal primeiro | desligado |
| `cta_inicio` | "começar meu plano" vs "destravar meu inglês" | desligado |

**Um de cada vez.** Com dois experimentos ativos e o volume atual, cada variante vira um
quarto da amostra e nenhum dos dois conclui nada.

**Não declare vencedor cedo.** O `/admin` avisa quando a amostra é pequena e não escolhe
lado sozinho — de propósito. Com dezenas de assinaturas, "A ganhou" é ruído com cara de
conclusão. Regra prática: menos de ~200 pessoas por variante no degrau que você está
medindo, não olhe o resultado.

---

## Checklist para os números começarem a existir

1. Supabase → SQL Editor → `migracao_2026-09-13_funil.sql` → RUN.
2. Publicar (`publicar.bat`).
3. Abrir `/api/funil` no navegador: deve responder `{"ok":true,"tabela":true,...}`.
4. Entrar no `/admin` com a conta de dono e conferir o bloco **Integrações** — todo item
   crítico verde.
5. Esperar um dia de tráfego antes de tirar qualquer conclusão.

Se o funil aparecer zerado depois disso, o problema é o passo 1 ou a
`SUPABASE_SERVICE_ROLE_KEY` — não o produto.

---

## Regras para quem for mexer

- **Nome de evento é constante de `lib/funil.ts`**, nunca string solta no componente. Um
  typo em produção é um degrau que desaparece do funil sem ninguém perceber.
- **Degrau usa `umaVez`; ação repetível não.** Trocar isso inverte a leitura do funil.
- **Medição nunca espera e nunca lança.** Toda chamada é `try/catch` e sem `await` no
  caminho da tela. Medição que atrasa o aluno é medição que alguém remove depois.
- **Evento novo entra também em `FUNIL_ETAPAS`** se for degrau — senão ele existe no banco
  e não aparece no desenho.
