# 📱 Publicar o SpeakUp na Google Play e na App Store

O SpeakUp é um **PWA** (app web instalável). A forma mais rápida de colocá-lo nas lojas é
"empacotar" esse PWA num app nativo usando o **PWABuilder** (grátis, oficial, Microsoft).
Você **não reescreve nada** — o pacote aponta pro seu app que já está no ar.

> Pré-requisito único: o app precisa estar publicado com HTTPS. Já está: **https://speakup-dusky.vercel.app** ✅

---

## ✅ O que já está pronto (feito por mim)
- `manifest.json` completo (nome, descrição, categoria educação, idioma pt-BR, `id`, `scope`).
- Ícones: `icon-192.png`, `icon-512.png` e `icon-maskable-512.png` (com borda segura p/ Android).
- Service worker (`sw.js`) — funciona offline e recebe notificações.
- Páginas legais (`/termos`, `/privacidade`) — **as lojas exigem**.

## 💳 O que só você pode fazer (contas e envio)
| Item | Google Play | App Store (Apple) |
|---|---|---|
| Conta de desenvolvedor | US$ 25 (paga 1x) | US$ 99 por ano |
| Precisa de Mac? | Não | **Sim** (Xcode) — ou um serviço/amigo com Mac |
| Tempo de análise | algumas horas a 2 dias | 1 a 3 dias (Apple é mais rígida) |

---

# 🤖 PARTE 1 — Google Play (mais fácil, comece por aqui)

### 1. Crie a conta
Acesse https://play.google.com/console → pague os US$ 25 (uma vez só).

### 2. Gere o pacote Android no PWABuilder
1. Vá em **https://www.pwabuilder.com**
2. Cole `https://speakup-dusky.vercel.app` e clique **Start**.
3. Ele analisa o app e dá uma nota. Se pedir ajustes de manifest/ícone, já cobrimos os principais.
4. Clique em **Package for stores → Android → Google Play**.
5. Baixe o `.zip`. Dentro vêm:
   - `speakup.aab` → é o arquivo que você envia pra Play.
   - `assetlinks.json` → **guarde, é o passo 3**.
   - `signing.keystore` + as senhas num `.txt` → **GUARDE COM MUITO CUIDADO** (backup!).
     Sem esse keystore você não consegue atualizar o app depois.

### 3. Verifique o domínio (tira a barra de navegador do app)
1. Pegue o `assetlinks.json` do zip.
2. Coloque-o no projeto em: `public/.well-known/assetlinks.json`
3. `git add`, `commit`, `push` → a Vercel publica. Deve abrir em
   `https://speakup-dusky.vercel.app/.well-known/assetlinks.json`.
   (Me mande o conteúdo do arquivo que eu coloco no lugar certo pra você.)

### 4. Envie na Play Console
1. **Criar app** → nome "SpeakUp", idioma pt-BR, app, gratuito.
2. Suba o `speakup.aab` em **Produção → Criar versão**.
3. Preencha a ficha da loja:
   - Descrição curta e completa (uso o texto pronto abaixo).
   - **Screenshots** (telas do app no celular) — tire umas 4–6 no seu telefone.
   - Ícone 512×512 (use `icon-512.png`).
   - Imagem de destaque 1024×500 (posso gerar pra você).
   - **Política de Privacidade**: `https://speakup-dusky.vercel.app/privacidade`
4. Preencha o questionário de classificação e de "Segurança de dados".
5. Enviar para revisão. Sai do ar geralmente em horas.

---

# 🍎 PARTE 2 — App Store (Apple)

⚠️ Exige um **Mac com Xcode**. Se você não tem, opções: pedir a alguém, alugar um Mac na
nuvem (ex.: MacinCloud), ou usar um serviço de build.

⚠️ A Apple às vezes recusa app que é "só um site". O nosso tem cara de app de verdade
(offline, notificações, instalável), o que ajuda — mas capriche nas telas e descrição.

### 1. Conta
https://developer.apple.com/programs → US$ 99/ano.

### 2. Gere o pacote iOS no PWABuilder
1. No PWABuilder (mesmo passo da Parte 1), clique **Package for stores → iOS**.
2. Baixe o `.zip` — é um projeto Xcode.

### 3. No Mac
1. Abra o projeto no **Xcode**.
2. Entre com sua conta Apple Developer, defina o **Bundle ID** (ex.: `com.speakup.app`).
3. **Product → Archive** → **Distribute App → App Store Connect → Upload**.

### 4. No App Store Connect
1. https://appstoreconnect.apple.com → **Meus Apps → +**.
2. Preencha nome, descrição (texto pronto abaixo), categoria **Educação**.
3. Screenshots do iPhone (tamanhos que a Apple pede — o Xcode/simulador ajuda a tirar).
4. URL de privacidade: `https://speakup-dusky.vercel.app/privacidade`
5. Preencha o "App Privacy" (quais dados coleta: e-mail, progresso).
6. Enviar para revisão.

---

## 📝 Textos prontos para as fichas das lojas

**Nome:** SpeakUp — Inglês com IA

**Descrição curta:** Aprenda inglês todo dia com um professor de inteligência artificial.

**Descrição completa:**
> Aprenda inglês de um jeito que funciona — direto no seu ritmo, com um professor de IA
> que lembra do seu progresso.
>
> • Trilha completa do básico (A1) ao avançado (C2)
> • Lições diárias curtas com correção na hora
> • Converse em inglês com a IA em situações reais
> • Vocabulário com repetição espaçada (você fixa de verdade)
> • Exercícios de listening e dicionário com imagens
> • Acompanhe seu XP, sequência e conquistas todo dia
>
> Feito para brasileiros. Comece grátis.

---

## 🎯 Recomendação
Comece **só pela Google Play**: é mais barata, mais rápida e não precisa de Mac.
Valide o app com usuários reais, e depois parta pra Apple.

Quando você gerar os pacotes no PWABuilder e tiver o `assetlinks.json`, me chame que
eu coloco no lugar certo e te ajudo a preencher cada tela.
