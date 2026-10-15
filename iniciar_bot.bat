@echo off
setlocal
title ComandaFast - Servidor WhatsApp Bot

cls
echo =========================================================================
echo    COMANDA FAST - CONECTOR WHATSAPP OFICIAL (BAILEYS Y PYTHON)
echo    Base de Datos: https://vmnhystuwcbdbukoxdtz.supabase.co
echo =========================================================================
echo.

:: Atajos por parametros directos
if "%1"=="--reset" goto BAILEYS_RESET
if "%1"=="--qr" goto BAILEYS_RESET
if "%1"=="--new-qr" goto BAILEYS_RESET
if "%1"=="--python" goto PYTHON_BOT
if "%1"=="--list" goto LIST_STORES

:: Si se paso un slug directo como primer parametro
if not "%1"=="" (
    if not "%1"=="1" if not "%1"=="2" if not "%1"=="3" if not "%1"=="4" (
        echo [INFO] Iniciando Baileys para el comercio: %1
        node server/whatsappBotServer.js --store "%1"
        goto END
    )
)

:: Menu interactivo
echo  Selecciona el modo que deseas ejecutar:
echo.
echo   [1] Conectar WhatsApp con BAILEYS (Codigo QR y Web Movil)
echo   [2] Generar NUEVO Codigo QR (Desvincular previo y vincular nuevo telefono)
echo   [3] Iniciar Bot en PYTHON (Simulador en Consola y Web Movil para Celular)
echo   [4] Abrir Simulador Web en el navegador (PC y Celular)
echo   [5] Ver lista de comercios en Supabase
echo   [6] Salir
echo.
set /p OPCION="Escribe una opcion [1-6] y presiona ENTER (por defecto 1): "

if "%OPCION%"=="2" goto BAILEYS_RESET
if "%OPCION%"=="3" goto PYTHON_BOT
if "%OPCION%"=="4" goto OPEN_SIMULATOR
if "%OPCION%"=="5" goto LIST_STORES
if "%OPCION%"=="6" goto END
goto BAILEYS_START

:BAILEYS_START
echo.
echo -------------------------------------------------------------------------
echo Iniciando Servidor Baileys (Puerto 3002)...
echo Si es la primera vez, el Codigo QR aparecera en esta ventana y en el
echo panel web: http://localhost:5173/#dueno (Pestana "Conexion QR")
echo -------------------------------------------------------------------------
echo.
node server/whatsappBotServer.js
goto END

:BAILEYS_RESET
echo.
echo -------------------------------------------------------------------------
echo Limpiando sesion previa de WhatsApp y generando NUEVO Codigo QR...
echo -------------------------------------------------------------------------
echo.
node server/whatsappBotServer.js --reset
goto END

:PYTHON_BOT
echo.
echo -------------------------------------------------------------------------
echo Iniciando Bot en Python con IA Groq y Servidor Web Movil...
echo Podras interactuar aqui en la terminal Y TAMBIEN desde tu celular en:
echo   http://192.168.18.2:3002/simulador
echo -------------------------------------------------------------------------
echo.
python server/whatsapp_bot.py -i
goto END

:OPEN_SIMULATOR
echo.
echo -------------------------------------------------------------------------
echo Abriendo Simulador Web en el navegador predeterminado...
echo -------------------------------------------------------------------------
start http://localhost:3002/simulador
goto END

:LIST_STORES
echo.
echo -------------------------------------------------------------------------
echo Consultando comercios activos en Supabase...
echo -------------------------------------------------------------------------
echo.
python server/whatsapp_bot.py --list
echo.
pause
goto END

:END
echo.
endlocal
