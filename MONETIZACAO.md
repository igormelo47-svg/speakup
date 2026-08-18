# 💰 Monetização — estado atual (18/08/2026)

A cobrança está **LIGADA** (`BETA_GRATIS = false` em `app/app/page.tsx` e em `app/api/chat/route.ts`).
O modelo é **freemium com trial**:

| | Grátis | Premium |
|---|---|---|
| Trial | 7 dias de Premium ao criar a conta, sem cartão | — |
| Professor IA | 10 msgs/dia (teto técnico 30/dia no servidor) | sem limite (uso justo: 80/dia no servidor) |
| Simulador | 3 simulações/dia | sem limite |
| Lições da trilha | 3 lições/dia | sem limite |
| Voz neural (TTS) / transcrição (STT) | cota pequena (20/dia cada) | 350 / 150 por dia (rede de segurança) |
| Preço | R$0 | R$29,90/mês ou **R$289,80/ano (anual em destaque, "Melhor valor")** |

**Depois dos 7 dias ninguém é trancado**: o app abre no plano grátis, sem cobrança. O servidor
não devolve mais 402 em `chat`/`tts`/`stt` — só aplica a cota do grátis. Preços não mudam.

## Como o Premium é liberado

- **Web/Android (Kiwify)** — links reais em `app/app/page.tsx`:
  `KIWIFY_MENSAL = https://pay.kiwify.com.br/bm5YfNd`, `KIWIFY_ANUAL = https://pay.kiwify.com.br/1c7zem8`
  (conta Kiwify "Sj Fidem", login igorckl@ — a única com cadastro de vendedor concluído).
  O app abre o checkout com `?email=<e-mail do aluno>&s1=<user_id>`.
- **iOS** — RevenueCat (`/api/revenuecat-webhook`), pagamento nativo da Apple.
- O webhook da Kiwify (`/api/kiwify-webhook`) recebe os eventos e grava em `progresso`:
  - pago/renovado → `is_premium = true`, `premium_expira` = fim do ciclo (+3 dias de folga)
  - reembolso/chargeback → revoga na hora
  - cancelamento/atraso → não revoga; o acesso cai sozinho quando `premium_expira` passa
- **Como o webhook acha a conta** (nesta ordem):
  1. `s1` do payload (parâmetro de tracking do link do checkout) = `user_id` — só aceita UUID válido
     e só se existir em `profiles`; faz upsert em `progresso` pelo id.
  2. e-mail do checkout em `progresso.email`, depois em `profiles.email`.
  3. Nada casou → linha em `pagamentos_pendentes` (e-mail, tipo, payload) para o dono resolver.
- Toda batida no webhook (autorizada ou não) fica em `webhook_recebidos` (inclui `s1`).

## Painel do dono — /admin

Além dos números de funil, o painel tem:
- **Pagamentos sem conta casada** — lista `pagamentos_pendentes` (últimos 50). Campo e-mail
  (ou id do aluno) + botão **Liberar**: faz o mesmo que o webhook numa compra aprovada
  (`is_premium = true`, `premium_expira` pelo plano do payload) e marca o pendente como resolvido.
- **Webhooks recusados (últimos 20)** — as chamadas que levaram 401 (foi assim que a 1ª venda no
  Android, 17/08, ficou paga e sem Premium). Se aparecer linha aí: o `?token=` cadastrado na
  Kiwify não bate com a env `KIWIFY_TOKEN` da Vercel.
- Rota: `app/api/admin/pendentes/route.ts` (GET lista, POST libera). Mesma allowlist de
  e-mails do dono de `app/api/admin/painel/route.ts` (`lib/admin-auth.ts`).

## Segurança do webhook

A URL cadastrada na Kiwify é:
```
https://vonai.com.br/api/kiwify-webhook?token=<valor da env KIWIFY_TOKEN>
```
O valor do token vem **APENAS** da variável de ambiente `KIWIFY_TOKEN` na Vercel — **nunca** fica em
código, README ou neste arquivo (o repositório é público). O webhook também aceita a assinatura
HMAC-SHA1 do corpo em `?signature=` (o Kiwify manda) — é a forma forte.

> **⚠️ ROTACIONAR O TOKEN.** Uma versão anterior deste arquivo tinha o valor literal do token
> gravado, num repositório público — considere-o **vazado**. Gere um valor novo (ex.:
> `openssl rand -hex 24`), troque na **Kiwify** (URL do webhook) e na **Vercel** (env
> `KIWIFY_TOKEN`, todos os ambientes) e faça redeploy. Enquanto os dois não baterem, o webhook
> responde 401 e a venda cai em "Webhooks recusados" no /admin.

## E-mails do ciclo de vida (Resend, `lib/email.ts` + `/api/send-reminders`)

Cron 2x/dia (`vercel.json`). Cada e-mail é enviado 1x por pessoa, com registro em
`progresso.emails_enviados` (JSON `{ chave: 'YYYY-MM-DD' }`):
- `trial_t24` — trial acaba em ≤24h: "Seu teste Premium acaba amanhã" (o que muda no grátis + link).
- `pos_trial_1` (T+1) e `pos_trial_2` (T+4) — "Você continua no Vonai grátis — e o Premium com
  R$0,79/dia". Máximo 2.
- `winback` — "sua trilha continua", só para quem não tem push, no máximo a cada 3 dias e nunca
  depois de 30 dias sem uso.
- Lead do teste de nível público (`/api/lead-email`) recebe na hora o nível + 3 dicas + link
  `/cadastro?nivel=<nivel>` com "7 dias de Premium grátis".
Todos respeitam `progresso.email_lembretes = false` (descadastro em 1 clique).

## Checklist de configuração externa

- [ ] **Kiwify** (conta nova "Sj Fidem"): Configurações → Webhooks → URL
      `https://vonai.com.br/api/kiwify-webhook?token=<KIWIFY_TOKEN novo>`; marcar **TODOS** os
      eventos (compra aprovada, reembolso, chargeback, assinatura cancelada/atrasada/renovada).
      Testar com "enviar evento de teste" e conferir em /admin que não aparece em "recusados".
- [ ] **Kiwify**: conferir que os links dos produtos são os de `app/app/page.tsx` e que o checkout
      repassa os parâmetros de tracking (s1) no webhook.
- [ ] **Vercel** env: `KIWIFY_TOKEN` (novo, rotacionado), `RESEND_API_KEY`, `CRON_SECRET`,
      `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`.
- [ ] **Resend**: domínio `envio.vonai.com.br` verificado (SPF/DKIM) — remetente `ola@envio.vonai.com.br`.
- [ ] **Supabase** → Authentication → Providers → **Google**: habilitar com Client ID/Secret do
      Google Cloud (OAuth consent screen + credencial Web; redirect
      `https://<projeto>.supabase.co/auth/v1/callback`). Em URL Configuration, adicionar
      `https://vonai.com.br/app` às Redirect URLs. Sem isso o botão "Continuar com Google" mostra
      "ainda não está disponível — use e-mail e senha".
- [ ] **Supabase** → SQL Editor: rodar `migracao_2026-08-18_freemium.sql` (trial 7 dias nos dois
      triggers, `pagamentos_pendentes.resolvido_em`, `webhook_recebidos.s1`,
      `progresso.emails_enviados`). Avaliar os blocos opcionais (reativação dos ~50 alunos antigos
      com e-mail avisando; `revoke select on ranking_semanal from anon`).
- [ ] Depois do deploy: fazer uma compra-teste (ou evento de teste) e ver o Premium ligar em
      /admin → Assinantes.
