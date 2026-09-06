# Login com Google — estado em 02/09/2026, 23h

O código já estava pronto (`app/login/AuthForm.tsx`: botão, `signInWithOAuth`,
evento de dataLayer e tratamento de erro), escondido atrás de
`NEXT_PUBLIC_GOOGLE_LOGIN`. O que faltava era painel. Metade já foi feita.

## FEITO

**Google Cloud**
- Projeto criado: **Vonai** — ID `vonai-507501`, número `909312229085`
- Tela de permissão OAuth configurada: nome do app "Vonai", e-mail de suporte
  e contato `igormelo47@gmail.com`, tipo de usuário **Externo**
- Cliente OAuth criado: tipo **Aplicativo da Web**, nome "Vonai Web (Supabase)"
  - Origem JavaScript autorizada: `https://vonai.com.br`
  - URI de redirecionamento autorizado:
    `https://obzromxsrtzyopavkijm.supabase.co/auth/v1/callback`
  - ID do cliente:
    `909312229085-nlijeccocj9mthi3f3e4gbvliidoompa.apps.googleusercontent.com`

O projeto Supabase foi confirmado lendo o bundle de `vonai.com.br`: é o
`obzromxsrtzyopavkijm` (org "speakup"), não o outro.

## FALTA

### 1. Publicar o app OAuth (senão só você entra)
Google Cloud → **Google Auth Platform → Público-alvo → Publicar app**.
Enquanto estiver em "Teste", só e-mails cadastrados como usuários de teste
conseguem fazer login — todo mundo mais leva erro. Com apenas os escopos
`email`, `profile` e `openid` não é preciso passar por verificação.

### 2. Colar as credenciais no Supabase
Supabase → projeto **speakup** → **Authentication → Sign In / Providers →
Google**:
- Ligar o provider
- **Client ID**: o de cima
- **Client Secret**: o que apareceu na caixa "Cliente OAuth criado". Se você
  fechou aquela caixa, gere outro em Google Auth Platform → Clientes → "Vonai
  Web (Supabase)" → Adicionar secret.
- Salvar

### 3. Corrigir o Site URL do Supabase  ⚠️ achado novo
Supabase → **Authentication → URL Configuration → Site URL** está como
`https://speakup-dusky.vercel.app`. Deveria ser `https://vonai.com.br` — é o
endereço que entra nos e-mails de link mágico e de recuperação de senha, ou
seja, hoje o seu usuário recebe um link com o domínio antigo.

Na mesma página, em **Redirect URLs**, adicione:
```
https://vonai.com.br/**
```

### 4. Ligar a env na Vercel
Projeto na Vercel → Settings → Environment Variables:
- `NEXT_PUBLIC_GOOGLE_LOGIN` = `1` (Production)

Como é `NEXT_PUBLIC_`, é lida no build: **precisa de um novo deploy**. Rode o
`publicar.bat` ou dê Redeploy na Vercel.

### 5. Conferir
Abra `vonai.com.br/cadastro` numa aba anônima. O botão "Continuar com Google"
tem que aparecer acima do campo de e-mail. Crie uma conta de teste e veja no
Supabase se o `profile` nasceu com o trial (o trigger `handle_new_user` cuida
disso).

Se der "Login com Google ainda não está disponível", o passo 2 não foi salvo.
Se der erro de acesso bloqueado, faltou o passo 1.
