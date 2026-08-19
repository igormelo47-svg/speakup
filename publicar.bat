@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ============================================
echo  Vonai - publicar as alteracoes (git push)
echo ============================================
echo.
git fetch origin
git reset --soft origin/master
git add -A
git commit -m "Trial 2 dias + bloqueio total, voz neural do Vo, webhook por user_id, admin pendentes"
git push origin HEAD:master
echo.
echo ============================================
echo  Se apareceu "HEAD -^> master" ou "master -^> master" acima, a Vercel ja esta publicando.
echo  Pode fechar esta janela.
echo ============================================
pause
