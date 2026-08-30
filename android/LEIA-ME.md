# Build do app Android (TWA) — targetSdkVersion 36

## O problema

O pacote publicado hoje tem **`targetSdkVersion 35`**. Confirmei isso lendo o
`AndroidManifest` de dentro do `Vonai.aab` que está no seu Downloads:

```
package            app.vercel.speakup_dusky.twa
versionName        1.0.0.1
compileSdkVersion  36
targetSdkVersion   35   <-- o problema
minSdkVersion      23
```

O Google Play passa a exigir **36 (Android 16)**. A prorrogação já foi aprovada e o
prazo agora é **1º de novembro de 2026**.

## Por que não dá para só regerar no PWABuilder

O template do PWABuilder ainda gera `targetSdkVersion 35` — a issue #6159 no
repositório deles continua aberta. Você regeraria, subiria, e continuaria fora da regra.

O **Bubblewrap 1.25.0** (publicado em 31/07/2026) já traz `compileSdkVersion 36` e
`targetSdkVersion 36` no template. Conferi baixando o pacote e lendo o `build.gradle`
dele. É por isso que o build passou para cá.

## Como rodar

Botão direito no `build-android.ps1` → **Executar com o PowerShell**.

Ele faz, nesta ordem: instala o Bubblewrap 1.25.0 → pergunta o código da versão →
localiza sua chave de assinatura → gera o projeto Android → **confere que saiu 36 e
para se não sair** → compila e assina.

Na primeira execução o Bubblewrap baixa o JDK e o Android SDK (alguns minutos) e pede
para aceitar as licenças do Google. É normal.

No fim sai o `app-release-bundle.aab`, que é o arquivo que você envia em
**Testar e lançar → Produção → Criar nova versão**.

## Duas coisas que não podem dar errado

**A chave de assinatura.** Tem que ser a mesma do app publicado —
`Downloads\Vonai - Google Play package\signing.keystore`, alias `MY-KEY-A`. Chave
diferente = o Play recusa o upload, e não tem conserto simples. O script já aponta
para ela.

**O código da versão.** Precisa ser maior que o último enviado. O script pergunta qual
é o maior e soma 1 — você vê esse número no Play Console em *Testar e lançar →
Lançamentos e pacotes mais recentes*, coluna "Código da versão".

## O que mais entra neste build

O **Google Play Billing** vem junto (`androidbrowserhelper:billing:1.2.0`, mais a
`PaymentActivity` e o `DigitalGoodsRequestHandler`). Era a pendência do
`RETENCAO_2026-08-21.md`, e fazer nos dois numa tacada evita uma segunda revisão do Play.

Isso não quebra nada enquanto os produtos não existirem na Play Console: o
`comprarPlay` do `page.tsx` já devolve `'indisponivel'` e cai no checkout web.

Para desligar, troque no `twa-manifest.json`:

```json
"features": { "playBilling": { "enabled": false } }
```

## Um detalhe para conferir depois do build

O app abre `speakup-dusky.vercel.app`, mas o `NEXT_PUBLIC_SITE_URL` do Stripe é
`vonai.com.br`. Quando o checkout devolver o aluno para `vonai.com.br/app`, isso vai
abrir **fora** do app, numa aba do navegador — porque `vonai.com.br` não está na lista
de origens confiáveis do TWA.

Não mexi nisso porque acertar exige publicar o `assetlinks.json` também em
`vonai.com.br`, e eu não quis mudar o comportamento no escuro. Se for incomodar,
me fala que a gente resolve — é `additionalTrustedOrigins` no manifesto mais o
arquivo no domínio.

## Nunca comitar

O `.gitignore` desta pasta bloqueia `*.keystore` e `signing-key-info.txt`. O
repositório `speakup` é **público** — se a chave vazar, qualquer um publica um app se
passando pelo Vonai, e não dá para revogar sem perder o app.

---

## O que já foi verificado antes de te entregar isto

Não dá para eu rodar o build (explico abaixo), então testei o que dava:

- **A lógica do script.** Simulei as três substituições que ele faz no
  `twa-manifest.json`. O JSON continua válido e o `"shortcuts": []` continua array —
  esse era o risco real: o `ConvertTo-Json` do PowerShell 5.1 transforma array vazio em
  `null` e o Bubblewrap quebra. Por isso o script edita por texto, não reserializa.
- **Os ícones existem.** `icon-512.png` e `icon-maskable-512.png` respondem. O
  `bubblewrap update` valida os dois e aborta se algum faltar.
- **A combinação Play Billing + notificações.** O Bubblewrap recusa `playBilling.enabled`
  sem `enableNotifications: true`. Os dois estão como precisam estar.
- **O template do Bubblewrap 1.25.0.** Baixei o pacote e li: `compileSdkVersion 36`,
  `targetSdkVersion 36`.

## Por que o build não roda do meu lado

Duas paredes independentes:

1. Não tenho terminal na sua máquina nesta sessão — só consigo ler e gravar arquivos.
2. No meu ambiente, `dl.google.com`, `maven.google.com` e `services.gradle.org` são
   bloqueados (403 no CONNECT do proxy). Sem eles não existe Android SDK nem Gradle,
   e sem isso não existe build de app Android.

Autorização não muda nenhuma das duas. O `build-android.ps1` existe justamente para
que o único passo manual seja rodar um arquivo.
