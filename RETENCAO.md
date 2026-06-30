# 🔔 Lembretes diários (Web Push) — ativação

O código já está pronto: o aluno vê o botão **"Ativar lembretes diários"** na Home; e todo dia,
às 9h (BRT), quem **não estudou** recebe uma notificação no celular. Faltam 3 passos de configuração.

> No iPhone, a notificação só funciona se o aluno **"Adicionar à Tela de Início"** (instalar o PWA).
> No Android/Chrome funciona direto.

## Passo 1 — Criar a tabela no Supabase
Supabase → SQL Editor → cole o conteúdo de **`push_subscriptions.sql`** → RUN.

## Passo 2 — Variáveis de ambiente na Vercel
Em **Vercel → Settings → Environment Variables**, adicione:

| Key | Value |
|---|---|
| `VAPID_PRIVATE_KEY` | `5dDdBRIQMCyVAibAFiZLEyPDHJ_fVPzseKPfyz4WFX4` |
| `VAPID_SUBJECT` | `mailto:igormelo47@gmail.com` |
| `SUPABASE_SERVICE_ROLE_KEY` | *(Supabase → Settings → API → **service_role** secret)* |
| `CRON_SECRET` | *(invente uma senha aleatória longa, ex.: `sk_cron_8x9...`)* |

> A chave **pública** do push já está embutida no código (pode ser pública). A **privada** fica só aqui.
> A `SUPABASE_SERVICE_ROLE_KEY` é **secreta** (acesso total ao banco) — nunca exponha em público.

## Passo 3 — Redeploy
Depois de salvar as variáveis, faça um **Redeploy** na Vercel (ou um novo `git push`).
O agendamento diário (`vercel.json` → cron `0 12 * * *` = 9h BRT) é ativado automaticamente.

## Como testar
1. Abra o app no celular (Android/Chrome, ou iPhone com o app instalado na tela inicial).
2. Na Home, toque em **"Ativar lembretes diários"** e permita as notificações.
3. Para testar o envio na hora (sem esperar as 9h), na Vercel vá em **Settings → Cron Jobs → Run** (dispara manualmente), ou aguarde o horário.

## Ajustar o horário
No `vercel.json`, `"0 12 * * *"` = 12:00 UTC (9h de Brasília). Ex.: para 8h BRT use `0 11 * * *`.

> Plano Hobby da Vercel permite cron **1x por dia** — suficiente para o lembrete diário.
