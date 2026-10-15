@echo off
chcp 65001 > nul
title ComandaFast - Compilador de Bot Portable (.exe)
color 0B
cls

cd /d "%~dp0"

echo =====================================================================
echo    COMANDA FAST - GENERADOR DE BOT PORTABLE WINDOWS (.EXE)
echo =====================================================================
echo.
echo Compilando server\whatsapp_bot.py en ejecutable unico (ComandaBot.exe)...
echo.

python -m PyInstaller --noconfirm --clean --onefile --console --name "ComandaBot" server/whatsapp_bot.py

if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERROR] Fallo la compilacion con PyInstaller.
    echo Asegurate de tener Python instalado y ejecutar: pip install pyinstaller
    pause
    exit /b 1
)

copy /Y "dist\ComandaBot.exe" "ComandaBot.exe" > nul
if exist "ComandaFast-Bot-Portatil" (
    copy /Y "dist\ComandaBot.exe" "ComandaFast-Bot-Portatil\ComandaBot.exe" > nul
)

color 0A
echo.
echo =====================================================================
echo    EJECUTABLE PORTABLE GENERADO CON EXITO!
echo    Archivo: ComandaBot.exe (en la raiz del proyecto y paquete portable)
echo =====================================================================
echo Podes ejecutar ComandaBot.exe directamente en cualquier computadora.
echo Incluye generador de Codigo QR de WhatsApp y sincronizacion Supabase.
echo.
pause