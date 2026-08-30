# Cartão na entrada com Stripe — o que falta você fazer

**Por que isto existe.** 149 contas, zero assinantes. O motivo não é preço nem produto: o
app trancava no 3º dia e esperava que a pessoa voltasse sozinha, dias depois, para digitar
o cartão numa marca que ela mal conhecia. Ninguém faz isso. Agora o cartão entra no
cadastro, no momento de maior intenção, e a 1ª cobrança acontece sozinha no 4º dia.

O código já está no repositório e não quebra nada: enquanto as variáveis abaixo não
existirem na Vercel, o checkout continua caindo na Kiwify exatamente como hoje. **Nada sai
do ar em nenhum momento desta lista.**

---

## O que foi para o repositório

| Arquivo | O que faz |
|---|---|
| `lib/stripe.ts` | Fala com a API do Stripe e confere a assinatura do webhook. Sem pacote novo do npm de propósito — assim não existe `npm install` esquecido derrubando o build. |
| `app/api/stripe/checkout/route.ts` | Cria a sessão de pagamento com `trial_period_days: 3` e **cartão obrigatório**. |
| `app/api/stripe/webhook/route.ts` | Liga e desliga o Premium: teste iniciado, cobrança aprovada, cancelamento, reembolso. |
| `app/api/stripe/portal/route.ts` | Portal onde o aluno cancela e troca o cartão sozinho. |
| `migracao_2026-08-30_stripe.sql` | Colunas `stripe_customer_id`, `stripe_subscription_id`, `stripe_status`. |
| `app/app/page.tsx` | O botão de assinar chama o Stripe; se ele não responder, cai na Kiwify. |
| `app/page.tsx`, `app/planos/page.tsx`, `app/_marketing/ui.tsx` | Textos corrigidos: sai "sem cartão", entra "nada é cobrado nos 3 dias · cancele em 1 toque". |

---

## Passo 1 — Conta no Stripe (o único que depende de terceiro)

`dashboard.stripe.com` → criar conta → **ativar a conta** com CNPJ ou CPF, endereço e dados
bancários. A verificação costuma sair no mesmo dia, mas pode levar até 2 dias úteis.

**Enquanto a conta não é aprovada, faça o resto no modo de teste** (a chavinha "Modo de
teste" no topo do painel). Tudo abaixo funciona igual, com cartões falsos. Quando a conta
for aprovada, você repete só o Passo 2 e o Passo 4 no modo ao vivo e troca as chaves.

## Passo 2 — Criar os dois preços

Produtos → **Adicionar produto**:

1. Nome **Vonai Premium** → preço **R$ 29,90** → *Recorrente* → **Mensal** → Salvar.
2. No mesmo produto, **Adicionar outro preço** → **R$ 289,80** → *Recorrente* → **Anual** → Salvar.

Copie os dois IDs (começam com `price_`). **Não** configure o teste grátis aqui — quem
define os 3 dias é o código, para a duração ficar num lugar só.

## Passo 3 — Ativar o portal do assinante

Configurações → **Faturamento** → **Portal do cliente** → Ativar. Marque *cancelar
assinatura* e *atualizar forma de pagamento*.

Não pule: com cobrança automática, quem não acha onde cancelar contesta no banco. Um
chargeback custa a venda, a taxa e mancha a conta.

## Passo 4 — Criar o webhook

Desenvolvedores → **Webhooks** → **Adicionar endpoint**:

- URL: `https://vonai.com.br/api/stripe/webhook`
- Eventos:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `charge.refunded`
  - `charge.dispute.created`

Copie o **signing secret** (começa com `whsec_`).

## Passo 5 — Cinco variáveis na Vercel

Projeto → Settings → Environment Variables (todos os ambientes):

```
STRIPE_SECRET_KEY       sk_live_...   (ou sk_test_... enquanto testa)
STRIPE_PRICE_MENSAL     price_...
STRIPE_PRICE_ANUAL      price_...
STRIPE_WEBHOOK_SECRET   whsec_...
NEXT_PUBLIC_SITE_URL    https://vonai.com.br
```

Opcional: `STRIPE_TRIAL_DIAS` (padrão 3). Se mudar, mude junto `PRECO.diasGratis` em
`app/_marketing/ui.tsx` e o trigger no banco — senão o site promete uma coisa e cobra outra.

## Passo 6 — Banco

Supabase → SQL Editor → colar `migracao_2026-08-30_stripe.sql` → **RUN**.

Aproveite e rode `migracao_2026-08-21_trial_3_dias.sql`, se ainda não rodou: hoje o site
promete 3 dias e o banco pode estar dando 2.

## Passo 7 — Publicar

Duplo clique em `publicar.bat`. Espere `master -> master`.

---

## Teste antes de mandar tráfego (5 minutos, não pule)

1. Abra `vonai.com.br/api/stripe/checkout` no navegador. Deve responder
   `{"ok":true,"configurado":true,"mensal":true,"anual":true,"dias_trial":3}`.
   Se algum vier `false`, falta a variável correspondente na Vercel.
2. Crie uma conta nova → chegue ao paywall → **Começar 3 dias grátis**.
3. Deve abrir o Stripe pedindo cartão. Em modo de teste use `4242 4242 4242 4242`,
   validade qualquer no futuro, CVC qualquer.
4. Confirme. Você volta para o app **já liberado**.
5. No Stripe → Clientes: a assinatura aparece como *trialing*, com a data da 1ª cobrança.
6. No `/admin` do Vonai: o aluno aparece como Premium.
7. No app → planos → **cancelar assinatura**: deve abrir o portal do Stripe.

Se o passo 4 liberar mas o 6 não, o webhook não chegou: confira o signing secret e veja
"Webhooks recusados" no `/admin`.

---

## O que muda na medição

O evento de compra passa a disparar quando o dinheiro entra de verdade (4º dia), não quando
o teste começa. E nasce um evento novo, `inicio_teste_com_cartao` — muito melhor para o Meta
otimizar do que o antigo início de teste, que qualquer curioso disparava.

**Peça ao Lucas para trocar a otimização da campanha para esse evento** assim que houver
umas 15 ocorrências por semana.

## O que esperar dos números

Menos gente começa o teste — cartão filtra curioso. Isso é o objetivo, não um efeito
colateral. A conta que importa:

|  | Hoje | Com cartão na entrada |
|---|---|---|
| Testes iniciados / mês | 149 | 40 a 50 |
| Viram assinante | **0** | 25 % a 45 % |
| Assinantes / mês | **0** | **10 a 20** |

E, pela primeira vez, o mês seguinte te dá a taxa de renovação — que é a resposta honesta
sobre se o produto segura gente.

---

## Ainda pendente, fora do Stripe

Estes continuam abertos e valem mais que qualquer criativo novo:

- [ ] **Rotacionar o `KIWIFY_TOKEN`** — vazou no repositório público; enquanto Vercel e
      Kiwify não baterem, o webhook responde 401 e a venda fica paga sem Premium.
- [ ] **Verificar o domínio `envio.vonai.com.br` no Resend** — sem isso nenhum e-mail de
      ciclo de vida sai, inclusive o aviso de 24h antes da 1ª cobrança.
- [ ] **Habilitar o Google no Supabase** e criar `NEXT_PUBLIC_GOOGLE_LOGIN=1`.
- [ ] **App Store Connect**: Introductory Offer → Free trial → 3 days nos dois produtos.
- [ ] **Play Console**: produtos com `trial3` e novo `.aab` com Play Billing.
