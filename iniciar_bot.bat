@echo off
title ComandaFast - Bot WhatsApp Multi-Negocio
chcp 65001 > nul
cls
echo =========================================================================
echo    COMANDA FAST - ASISTENTE DE WHATSAPP GASTRONOMICO EN PYTHON
echo    Base de Datos: https://vmnhystuwcbdbukoxdtz.supabase.co
echo =========================================================================
echo.

if "%1"=="" (
    python server/whatsapp_bot.py
) else (
    python server/whatsapp_bot.py --store "%1" %2 %3
)

pause
