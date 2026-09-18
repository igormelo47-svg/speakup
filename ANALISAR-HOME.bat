@echo off
REM Duplo-clique aqui. Nao precisa digitar nada.
REM Abre o Claude Code na pasta do Vonai com o pedido ja dentro.
cd /d "%~dp0"
title Claude Code - Analise da home do Vonai
echo.
echo   Analisando a home do Vonai. Pode levar um minuto.
echo   NENHUM arquivo vai ser alterado - so a proposta na tela.
echo.
claude "Leia o arquivo app/app/page.tsx e analise a tela inicial (home) do app. Ela mostra 21 numeros ao mesmo tempo: moedas, nivel A1, porcentagem, XP total, XP de hoje, licoes, dias de sequencia, recorde, nivel numerico, XP que falta, meta do dia, palavras dominadas, licoes na memoria, dias de estudo, missoes e os progressos de cada missao. Ela tambem tem dois cards de Evolucao ao mesmo tempo: o card Evolucao - Metricas e conquistas, e o card Sua evolucao. E abre mostrando tres zeros: mais 0 hoje, 0 de 50 XP e 0 de 3 missoes. Me diga quais desses numeros dao pra tirar da home sem perder informacao util e para onde cada um deveria ir. Considere que as Missoes da semana foram mantidas a pedido do dono, entao nao proponha remove-las. IMPORTANTE: nao altere nenhum arquivo, nao edite nada, apenas me mostre a analise e a proposta na tela para eu aprovar depois."
echo.
echo   Fim da analise. Pode fechar esta janela ou continuar conversando acima.
pause
