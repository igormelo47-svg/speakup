# 💰 Monetização — como ligar a cobrança

Hoje o app está em **beta grátis** (todos Premium, sem paywall). Toda a estrutura já está pronta.
Quando quiser começar a cobrar, siga os passos.

## Como funciona
- Arquivo `app/app/page.tsx`, no topo, tem: `const BETA_GRATIS = true`.
  - `true`  → beta grátis (estado atual): todos Premium, sem limites, sem paywall.
  - `false` → cobrança ligada: quem não é Premium passa a ter limites e vê a tela de planos; quem paga na Kiwify vira Premium automaticamente.
- Quem paga é marcado como Premium pelo **webhook da Kiwify** (rota `/api/kiwify-webhook`), que atualiza `progresso.is_premium = true`.

## Passos para ativar a cobrança

### 1. Kiwify — criar os produtos e pegar os links
Crie 2 produtos (ex.: **Mensal R$29,90** e **Anual R$197**) e copie os links de checkout.
Cole-os em `app/app/page.tsx`:
```
const KIWIFY_MENSAL = 'https://pay.kiwify.com.br/SEU_LINK_MENSAL'
const KIWIFY_ANUAL  = 'https://pay.kiwify.com.br/SEU_LINK_ANUAL'
```
> Os links atuais são placeholders — troque pelos seus.

### 2. Kiwify — configurar o webhook
Na Kiwify: **Configurações → Webhooks** (ou "Notificações") → adicionar URL:
```
https://speakup-dusky.vercel.app/api/kiwify-webhook?token=kwf_bc1c257b666a13b915db633a52ac3b824ad592b1
```
Marque os eventos de **compra aprovada** (e, se quiser, reembolso/cancelamento).

### 3. Vercel — variável do webhook
Em **Environment Variables**, adicione:
| Key | Value |
|---|---|
| `KIWIFY_TOKEN` | `kwf_bc1c257b666a13b915db633a52ac3b824ad592b1` |

(A `SUPABASE_SERVICE_ROLE_KEY` já está configurada — o webhook usa ela.)

### 4. Virar a chave
Quando estiver tudo pronto e o beta validado:
1. Em `app/app/page.tsx`, troque `const BETA_GRATIS = true` para `false`.
2. `git commit` + `git push` (a Vercel redeploya e a cobrança fica ativa).

## ⚠️ Importante
- O aluno deve **comprar com o mesmo e-mail** que usou pra criar a conta no app (é assim que o webhook casa o pagamento com a conta). Deixe isso claro no checkout.
- Hoje o limite do plano grátis cobre o **Simulador (3/dia)**. Quando você decidir cobrar, me chame para eu **reforçar os limites do free** (lições/dia, professor IA) conforme o modelo que você escolher — assim o Premium vale mais a pena.
- Confirme que a tabela `progresso` tem a coluna `is_premium` (já tem, é usada desde o início).
