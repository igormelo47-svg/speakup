# 🚀 Como publicar o SpeakUp (deploy)

O SpeakUp é um **web app / PWA** (Next.js). O aluno não baixa pela loja: ele abre um
**link** no navegador e instala com **"Adicionar à tela inicial"** (vira um ícone de app).
Para isso, o app precisa estar **publicado** numa URL pública. Recomendado: **Vercel** (grátis).

---

## Passo 1 — Subir o código para o GitHub
1. Crie uma conta em https://github.com (se não tiver).
2. Crie um repositório novo (ex.: `speakup`), **privado**.
3. No computador, dentro da pasta do projeto, rode:
   ```
   git init
   git add .
   git commit -m "SpeakUp"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/speakup.git
   git push -u origin main
   ```
   > ⚠️ O arquivo `.env.local` NÃO vai para o GitHub (está no `.gitignore`). As chaves
   > são configuradas direto na Vercel (passo 3). Isso é o correto e seguro.

## Passo 2 — Importar na Vercel
1. Entre em https://vercel.com e faça login com o GitHub.
2. Clique em **Add New → Project** e selecione o repositório `speakup`.
3. A Vercel detecta Next.js automaticamente — não mude as configurações de build.

## Passo 3 — Configurar as variáveis de ambiente (IMPORTANTE)
Em **Settings → Environment Variables**, adicione as 3 chaves (os mesmos valores do seu `.env.local`):

| Nome | Onde usar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `ANTHROPIC_API_KEY` | Production, Preview, Development |

> A `ANTHROPIC_API_KEY` é usada no servidor (rota `/api/chat`) — mantenha-a secreta.

## Passo 4 — Deploy
Clique em **Deploy**. Em ~1 minuto você recebe uma URL tipo:
```
https://speakup.vercel.app
```
Pronto — esse é o link para divulgar aos alunos. (Dá para ligar um domínio próprio
depois em **Settings → Domains**, ex.: `app.speakup.com.br`.)

## Passo 5 — Instalar como app no celular
- **Android (Chrome):** abrir o link → menu ⋮ → **"Instalar app" / "Adicionar à tela inicial"**.
- **iPhone (Safari):** abrir o link → botão Compartilhar → **"Adicionar à Tela de Início"**.
O ícone do SpeakUp aparece como um app normal, em tela cheia.

---

## ✅ Antes de divulgar — checklist do banco (Supabase)
Rode estes SQLs no **Supabase → SQL Editor** (se ainda não rodou):
1. `supabase_fix_progresso.sql` — corrige o salvamento de XP/progresso (FK + RLS de `profiles`). **Obrigatório.**
2. `lote_c2_licoes.sql` — adiciona 12 lições C2 inéditas. (Opcional, mas recomendado.)

E apague os usuários de teste `*@speakup-test.com` em **Authentication → Users**.

---

## 📲 Quer nas lojas de apps (opcional, mais tarde)
- **Google Play (Android):** empacotar a PWA como **TWA** (ferramenta: PWABuilder.com → gera o APK/AAB). Precisa de conta Google Play (US$25, pagamento único).
- **App Store (iPhone):** envelopar com **Capacitor** + conta Apple Developer (US$99/ano).

O ícone 512×512 (`public/icon-512.png`) já está pronto para esses empacotamentos.
