@echo off
chcp 65001 > nul
title ComandaFast - Bot WhatsApp Portable
cls

cd /d "%~dp0"

if exist "ComandaBot.exe" (
    ComandaBot.exe %*
    exit /b 0
)

if exist "dist\ComandaBot.exe" (
    dist\ComandaBot.exe %*
    exit /b 0
)

echo [INFO] No se encontro ComandaBot.exe compilado.
echo Iniciando directamente con Python...
python server\whatsapp_bot.py %*