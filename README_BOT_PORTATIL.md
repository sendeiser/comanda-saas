# 🍔 ComandaBot Portable (.exe) — Manual de Uso Oficial

## ¿Qué es?
`ComandaBot.exe` es el bot de WhatsApp Multi-Device oficial y autónomo de Comanda SaaS para Windows.

- **Conexión Real con WhatsApp Web Oficial (Baileys Multi-Device)**: Cero costos por mensaje o APIs de terceros. Atiende clientes las 24 horas directamente desde el WhatsApp de tu negocio.
- **Vinculación por Código QR**: Genera y muestra el Código QR en la consola y abre automáticamente el navegador en `http://localhost:3002/qr` para escanear con la cámara del celular.
- **Persistencia de Sesión**: La autenticación se guarda en `data/baileys_auth`. Solo necesitas escanear el QR la primera vez; en los siguientes inicios se conecta automáticamente en 2 segundos.
- **Multi-Negocio por SLUG**: El dueño introduce el **SLUG** de su local (ej: `fastburga-centro` o `demo`) y el bot descarga su menú, precios, horarios, datos bancarios e inyecta pedidos en Supabase Cloud y el sistema POS.
- **Simulador Web y Móvil**: Permite probar flujos y menús en `http://localhost:3002/simulador` desde la PC o desde cualquier celular en la red Wi-Fi local.

---

## Cómo usarlo y vincular tu celular

### Paso 1: Iniciar el Bot
Haz doble clic en `ComandaBot.exe` (o ejecuta `INICIAR_BOT_EXE.bat`).

### Paso 2: Seleccionar tu Comercio
- La primera vez te pedirá:
  ```text
  ✍️ Por favor, escribí el SLUG de tu negocio (ej: fastburga-centro):
  SLUG de tu negocio > fastburga-centro
  ```
- Si no recuerdas el slug exacto, escribe `?` o `lista` para ver todos los comercios activos en Supabase y seleccionar por número.
- En los siguientes inicios, el sistema recordará tu local guardado; solo presiona `ENTER` para continuar.

### Paso 3: Vincular tu Celular con el Código QR
- El menú te ofrecerá:
  ```text
  [1] Conectar Bot normalmente (usa la sesión guardada si ya vinculaste)
  [2] Vincular NUEVO celular (Muestra CÓDIGO QR en pantalla y navegador)
  ```
- Si es la primera vez o eliges la opción `[2]`:
  1. Aparecerá el código QR en la consola de comandos.
  2. Se abrirá automáticamente tu navegador en `http://localhost:3002/qr` con el código QR en alta resolución.
  3. En tu celular, abre **WhatsApp** > toca **Menú (tres puntos)** en Android o **Ajustes** en iPhone.
  4. Selecciona **Dispositivos vinculados** y toca **Vincular un dispositivo**.
  5. Apunta la cámara de tu celular al código QR en pantalla.
  6. ¡Listo! La pantalla y la consola confirmarán:
     `✅ [WHATSAPP BOT CONECTADO EXITOSAMENTE]`
     `👤 Dispositivo vinculado: Tu Negocio (+54 9 11 ...)`

---

## Opciones avanzadas por consola

Para atajos o inicio automático en Windows:

- Conectar directamente a un local:
  ```powershell
  ComandaBot.exe --slug fastburga-centro
  ```
- Vincular un nuevo teléfono (forzar nuevo QR):
  ```powershell
  ComandaBot.exe --slug fastburga-centro --reset
  ```

---

## Cómo volver a compilar

Si realizas mejoras en el código:
1. Haz doble clic en `COMPILAR_BOT_EXE.bat`.
2. PyInstaller generará el archivo `ComandaBot.exe` listo para distribuir.
