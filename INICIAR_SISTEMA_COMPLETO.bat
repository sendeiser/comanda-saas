@echo off
chcp 65001 > nul
title Comanda Gastronomica - Sistema POS & Bot de WhatsApp White-Label
color 0A
cls

echo =====================================================================
echo    [COMANDA GASTRONOMICA] - SISTEMA POS, SALON Y BOT MULTI-COMERCIO
echo =====================================================================
echo.
echo Iniciando entorno operativo del comercio:
echo   1. Servidor WhatsApp Bot Local (Puerto 3002)
echo   2. Servidor POS / Salon de Mesas / Auditoria (Vite)
echo   3. Apertura automatica en el Portal del Local
echo.
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/3] Lanzando Servidor WhatsApp Bot en ventana separada...
start "Comanda - WhatsApp Bot Microservice" cmd /c "INICIAR_BOT_WHATSAPP.bat"

timeout /t 2 /nobreak >nul

echo [2/3] Abriendo navegador en el Portal Gastronomico...
start http://localhost:5173/#dueno

echo [3/3] Iniciando Servidor Web (Vite)...
echo.
echo (Para detener el sistema, simplemente cerra estas consolas)
echo =====================================================================
echo.

call npm run dev
