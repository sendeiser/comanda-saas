@echo off
title ComandaFast - Conexión WhatsApp Bot (Baileys QR ^& Multi-Negocio)
chcp 65001 > nul
cls

echo =========================================================================
echo    🍔 COMANDA FAST — CONECTOR DE WHATSAPP OFICIAL (BAILEYS ^& QR)
echo    Base de Datos: https://vmnhystuwcbdbukoxdtz.supabase.co
echo =========================================================================
echo.

:: 1. Atajos por parámetros directos
if "%1"=="--reset" goto :BAILEYS_RESET
if "%1"=="--qr" goto :BAILEYS_RESET
if "%1"=="--new-qr" goto :BAILEYS_RESET
if "%1"=="--python" goto :PYTHON_BOT
if "%1"=="--list" goto :LIST_STORES

:: 2. Si se pasó un slug directo como primer parámetro (ej: iniciar_bot.bat fastburga-centro)
if not "%1"=="" (
    if not "%1"=="1" if not "%1"=="2" if not "%1"=="3" if not "%1"=="4" (
        echo [INFO] Iniciando Baileys para el comercio: %1
        node server/whatsappBotServer.js --store "%1"
        goto :END
    )
)

:: 3. Menú interactivo
echo  Seleccioná el modo que querés ejecutar:
echo.
echo   [1] Conectar WhatsApp con BAILEYS (Código QR en pantalla y Panel Web)
echo   [2] Generar NUEVO Código QR (Desvincular previo y vincular nuevo teléfono)
echo   [3] Iniciar Bot en PYTHON (Simulador en consola y Webhook Multi-Negocio)
echo   [4] Ver lista de comercios en Supabase
echo   [5] Salir
echo.
set /p OPCION="Escribí una opción [1-5] y presioná ENTER (por defecto 1): "

if "%OPCION%"=="2" goto :BAILEYS_RESET
if "%OPCION%"=="3" goto :PYTHON_BOT
if "%OPCION%"=="4" goto :LIST_STORES
if "%OPCION%"=="5" goto :END
goto :BAILEYS_START

:BAILEYS_START
echo.
echo -------------------------------------------------------------------------
echo 🚀 Iniciando Servidor Baileys (Puerto 3002)...
echo 📲 Si es la primera vez, el Código QR aparecerá en esta ventana y en el
echo    panel web: http://localhost:5173/#dueno (Pestaña "Conexión QR")
echo -------------------------------------------------------------------------
echo.
node server/whatsappBotServer.js
goto :END

:BAILEYS_RESET
echo.
echo -------------------------------------------------------------------------
echo 🧹 Limpiando sesión previa de WhatsApp y generando NUEVO Código QR...
echo -------------------------------------------------------------------------
echo.
node server/whatsappBotServer.js --reset
goto :END

:PYTHON_BOT
echo.
echo -------------------------------------------------------------------------
echo 🐍 Iniciando Bot Multi-Negocio en Python (Modo Interactivo)...
echo -------------------------------------------------------------------------
echo.
python server/whatsapp_bot.py -i
goto :END

:LIST_STORES
echo.
echo -------------------------------------------------------------------------
echo 📋 Consultando comercios activos en Supabase...
echo -------------------------------------------------------------------------
echo.
python server/whatsapp_bot.py --list
echo.
pause
goto :END

:END
echo.
echo Presioná cualquier tecla para salir...
pause > nul
