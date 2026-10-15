# 🍔 ComandaBot Portable (.exe) — Manual de Uso

## ¿Qué es?
`ComandaBot.exe` es el bot de WhatsApp y simulador interactivo de Comanda SaaS empaquetado en un único archivo ejecutable autónomo.

- **100% Portable**: No requiere tener instalado Python, Node.js ni librerías adicionales en la computadora donde se use.
- **Multi-Negocio por SLUG**: El cliente o dueño del comercio simplemente introduce el **SLUG** de su local (por ejemplo `fastburga-centro` o `demo`) y el bot se sincroniza en tiempo real con Supabase Cloud.
- **Memoria de Negocio**: Recuerda el último comercio configurado en el archivo `comanda_bot_config.json`, de modo que al abrirlo al día siguiente solo hace falta presionar `ENTER` para continuar.
- **Simulador Web y Consola en Vivo**: Abre automáticamente el navegador en `http://localhost:3002/simulador` y muestra la IP local para probar el bot desde cualquier teléfono conectado a la red Wi-Fi del local.

---

## Cómo usarlo

1. **Copiar el archivo**: Lleva `ComandaBot.exe` a cualquier PC con Windows (mostrador, caja, laptop personal o pendrive).
2. **Ejecutar**: Haz doble clic en `ComandaBot.exe`.
3. **Ingresar el SLUG**:
   - La primera vez te pedirá:
     ```
     ✍️ Por favor, escribí el SLUG de tu negocio (ej: fastburga-centro):
     SLUG de tu negocio > mi-hamburgueseria
     ```
   - Si no recuerdas el slug exacto, puedes escribir `?` o `lista` para ver todos los comercios registrados en el sistema y elegir el número.
4. **¡Listo!**: El bot se conectará a tu comercio, cargará tu menú con precios y abrirá el simulador en tu pantalla.

---

## Opciones avanzadas por consola (opcional)

Si deseas crear accesos directos o integrarlo en el inicio de Windows:

- Conectar directamente a un local:
  ```powershell
  ComandaBot.exe --slug fastburga-centro
  ```
- Cambiar puerto del servidor:
  ```powershell
  ComandaBot.exe --port 5005
  ```
- Listar comercios de la nube:
  ```powershell
  ComandaBot.exe --list
  ```
- Probar respuesta directa de un mensaje:
  ```powershell
  ComandaBot.exe -s fastburga-centro -m "hola quiero una burger clásica"
  ```

---

## Cómo volver a compilar

Si modificas el código de `server/whatsapp_bot.py`:
1. Haz doble clic en `COMPILAR_BOT_EXE.bat`.
2. PyInstaller volverá a generar el archivo `ComandaBot.exe` actualizado en segundos.
