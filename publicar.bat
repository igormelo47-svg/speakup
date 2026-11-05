@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo  Vonai - publicar as alteracoes (git push)
echo ============================================
echo.
echo.
git fetch origin
git reset --soft origin/master
git add -A
set "MSG="
set /p MSG=Descreva o que mudou (Enter = "Atualizacao do app"): 
if "%MSG%"=="" set "MSG=Atualizacao do app"
git commit -m "%MSG%"
git push origin HEAD:master
echo.
echo ============================================
echo  Se apareceu "HEAD -^> master" ou "master -^> master" acima, a Vercel ja esta publicando.
echo  Pode fechar esta janela.
echo ============================================
pause
