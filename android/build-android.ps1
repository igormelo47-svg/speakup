# =============================================================================
#  Vonai — build do app Android (TWA) com targetSdkVersion 36
#
#  POR QUE ESTE ARQUIVO EXISTE
#  O pacote publicado hoje tem targetSdkVersion 35. O Google Play passou a exigir
#  36 (Android 16) e, sem isso, nao da mais para publicar atualizacao. A prorrogacao
#  aprovada vale ate 1o de novembro de 2026.
#
#  O PWABuilder NAO resolve: o template dele ainda gera 35 (issue #6159, aberta).
#  O Bubblewrap 1.25.0 ja gera 36 por padrao — e e por isso que o build passou a
#  ser feito por aqui.
#
#  De quebra, este build liga o Google Play Billing (a biblioteca
#  androidbrowserhelper:billing), que era outra pendencia.
#
#  COMO RODAR
#  Clique com o botao direito neste arquivo -> "Executar com o PowerShell".
#  Ou, num PowerShell aberto nesta pasta:
#      powershell -ExecutionPolicy Bypass -File .\build-android.ps1
# =============================================================================

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $raiz

function Titulo($t) { Write-Host ""; Write-Host "=== $t ===" -ForegroundColor Cyan }
function Ok($t)     { Write-Host "  OK  $t" -ForegroundColor Green }
function Aviso($t)  { Write-Host "  !!  $t" -ForegroundColor Yellow }
function Erro($t)   { Write-Host "  XX  $t" -ForegroundColor Red }

Titulo "1. Conferindo o Node"
try {
  $nodeV = (node -v) 2>$null
  Ok "Node $nodeV"
} catch {
  Erro "Node nao encontrado. Instale em https://nodejs.org e rode este script de novo."
  Read-Host "Enter para sair"; exit 1
}

Titulo "2. Instalando o Bubblewrap 1.25.0"
# Versao fixa de proposito: e a que gera targetSdkVersion 36. Deixar solto
# ("latest") faria o build mudar sozinho um dia sem ninguem perceber.
npm install -g @bubblewrap/cli@1.25.0
if ($LASTEXITCODE -ne 0) { Erro "Falha ao instalar o Bubblewrap."; Read-Host "Enter para sair"; exit 1 }
Ok "Bubblewrap instalado"

Titulo "3. Versao deste lancamento"
# Conferido no Play Console em 30/08/2026: o maior codigo enviado e 10 (producao,
# 27/ago, versao 1.0.0.0). Logo, o proximo e 11. Se voce publicar outra versao antes
# de rodar isto, atualize o numero na pergunta abaixo.
Write-Host "  Ultimo codigo enviado ao Play: 10 (producao, 27/ago/2026)"
Write-Host "  Confira em: Testar e lancar -> Lancamentos e pacotes mais recentes."
Write-Host ""
$atual = Read-Host "  Maior codigo ja enviado [Enter = 10]"
if ([string]::IsNullOrWhiteSpace($atual)) { $atual = "10" }
if (-not ($atual -match '^\d+$')) { Erro "Precisa ser um numero inteiro."; Read-Host "Enter para sair"; exit 1 }
$novoCodigo = [int]$atual + 1
# 1.1.0 NAO serve: ja foi usado pelo codigo 3, em 14/ago. Nome repetido nao quebra o
# upload, mas atrapalha na hora de saber qual versao e qual.
$novoNome   = Read-Host "  Nome da versao [Enter = 1.2.0]"
if ([string]::IsNullOrWhiteSpace($novoNome)) { $novoNome = "1.2.0" }

Titulo "4. Conferindo a chave de assinatura"
# A chave TEM que ser a mesma do app publicado. Chave diferente = o Play recusa
# o upload, e nao existe conserto simples.
$texto = Get-Content "twa-manifest.json" -Raw
$m = [regex]::Match($texto, '"path"\s*:\s*"((?:[^"\\]|\\.)*)"')
$chave = $m.Groups[1].Value -replace '\\\\', '\'
if (-not (Test-Path $chave)) {
  Aviso "Nao achei a chave em: $chave"
  $chave = Read-Host "  Caminho completo do arquivo signing.keystore"
  if (-not (Test-Path $chave)) { Erro "Arquivo nao encontrado."; Read-Host "Enter para sair"; exit 1 }
}
Ok "Chave: $chave"

Titulo "5. Atualizando o twa-manifest.json"
# Substituicao de texto, campo a campo, em vez de reserializar o JSON inteiro:
# o ConvertTo-Json do PowerShell 5.1 transforma array vazio em null, o que
# quebraria o "shortcuts": [] e derrubaria o Bubblewrap.
$chaveJson = $chave -replace '\\', '\\'
$texto = [regex]::Replace($texto, '"appVersionCode"\s*:\s*\d+', '"appVersionCode": ' + $novoCodigo)
$texto = [regex]::Replace($texto, '"appVersionName"\s*:\s*"[^"]*"', '"appVersionName": "' + $novoNome + '"')
$texto = [regex]::Replace($texto, '"path"\s*:\s*"(?:[^"\\]|\\.)*"', '"path": "' + $chaveJson + '"')
Set-Content "twa-manifest.json" -Value $texto -Encoding UTF8 -NoNewline
Ok "versionCode $novoCodigo, versionName $novoNome"

Titulo "6. Gerando o projeto Android"
# --skipVersionUpgrade: o numero da versao ja foi definido acima. Sem essa flag o
# Bubblewrap incrementa de novo por conta propria e o codigo sai diferente do combinado.
# Na primeira execucao ele baixa o JDK e o Android SDK (alguns minutos) e pede
# para aceitar as licencas do Google. E normal.
bubblewrap update --skipVersionUpgrade
if ($LASTEXITCODE -ne 0) { Erro "Falha ao gerar o projeto."; Read-Host "Enter para sair"; exit 1 }
Ok "Projeto gerado"

Titulo "7. Conferindo o targetSdkVersion"
$gradle = Join-Path $raiz "app\build.gradle"
if (Test-Path $gradle) {
  $linha = Select-String -Path $gradle -Pattern "targetSdkVersion" | Select-Object -First 1
  Write-Host "  $($linha.Line.Trim())"
  if ($linha.Line -match "36") { Ok "targetSdkVersion 36 — e o que o Play exige" }
  else { Erro "Nao ficou 36. NAO envie ao Play; me avise antes."; Read-Host "Enter para sair"; exit 1 }
} else {
  Aviso "app\build.gradle nao encontrado — confira o passo anterior."
}

Titulo "8. Compilando e assinando"
Write-Host "  Ele vai pedir DUAS senhas: a do keystore e a da chave."
Write-Host "  Estao no arquivo signing-key-info.txt, na mesma pasta da chave."
Write-Host "  As senhas nao ficam gravadas em lugar nenhum." -ForegroundColor DarkGray
bubblewrap build --skipPwaValidation
if ($LASTEXITCODE -ne 0) { Erro "Falha no build."; Read-Host "Enter para sair"; exit 1 }

Titulo "Pronto"
$aab = Join-Path $raiz "app-release-bundle.aab"
if (Test-Path $aab) {
  $mb = [math]::Round((Get-Item $aab).Length / 1MB, 2)
  Ok "Arquivo para enviar: $aab  ($mb MB)"
  Write-Host ""
  Write-Host "  Agora, no Play Console:" -ForegroundColor Cyan
  Write-Host "  Testar e lancar -> Producao -> Criar nova versao -> enviar o .aab acima."
  Write-Host "  Depois de aprovado, o aviso de nivel da API some sozinho."
} else {
  Aviso "Nao achei o app-release-bundle.aab. Veja as mensagens do build acima."
}
Write-Host ""
Read-Host "Enter para fechar"
