# 🍽️ ComandaGastronómica — Suite Gastronómica White-Label Multi-Comercio con SaaS & CRM Dual

Sistema integral de **Punto de Venta (POS)**, **Control de Salón & Mesas**, **Pantalla de Cocina (KDS)**, **Catálogo Digital por Slug (`/carta/:slug`)**, **Portal Web Super-Admin SaaS con Control de Abonos**, **CRM de Clientes & Fiados** y **Microservicio de Bot de WhatsApp Autónomo**, diseñado bajo una arquitectura **White-Label Multi-Tenant** para comercialización a negocios gastronómicos (hamburgueserías, pizzerías, rotiserías, cafeterías y restaurantes).

Desarrollado bajo una arquitectura **Offline-First**, permitiendo operar al 100% de manera local y sincronizar automáticamente con **Supabase** (PostgreSQL con Row Level Security por comercio `store_id`).

---

## 🚀 Arquitectura SaaS & CRM Dual

### 1. 🏢 Centro de Control SaaS para el Dueño del Software (`#saas` / `#superadmin`)
- **Panel central de facturación y cobranzas**: Administra todos los locales gastronómicos que te compran el sistema desde la web.
- **Métricas de negocio en tiempo real**: Cálculo automático de **MRR (Ingresos Recurrentes Mensuales)**, comercios activos, abonos por vencer y en mora.
- **Gestión de Suscripciones**: Registro de cobro de abonos mensuales (+30 días automáticos), planes Básico ($18.000/m), Pro ($28.000/m) y Full ($38.000/m).
- **Corte y Reactivación de Servicio**: Bloqueo/suspensión remota en 1 clic de clientes morosos y reactivación instantánea al registrar el pago.
- **Generador de Aviso por WhatsApp**: Mensajes cordiales de cobranza con enlace directo a `wa.me` para enviar al dueño del local.

### 2. 👥 CRM Interno para cada Restaurante (Clientes & Libreta de Fiados)
- **Directorio de Comensales**: Gestión de clientes frecuentes, direcciones de delivery y teléfonos.
- **Control de Cuentas Corrientes y Fiados**: Saldo acumulado en la calle (`currentBalance`), clientes con deuda activa y total fiado.
- **5to Método de Pago en POS ("A Cuenta / Fiado")**: Imputación de pedidos directamente a la libreta del cliente desde el mostrador.
- **Cobro Ágil de Deuda**: Modal de cobranza con accesos rápidos (Total, 50% o personalizado) en efectivo, transferencia o tarjeta.
- **Recordatorios de Deuda por WhatsApp**: Envío en 1 clic del estado de cuenta al cliente con saludo cordial y monto pendiente.

### 3. 🎨 Motor de Marca y Tematización Dinámica (`themeService`)
- Variables CSS `:root` dinámicas (colores de acento, fondos, superficies y tipografías).
- Cálculo automático de contraste accesible para botones y textos.

### 4. 🏪 Catálogo Digital Público Multi-Tenant (`/carta/:storeSlug`)
- Acceso web para comensales en `https://tudominio.com/carta/nombre-del-local`.
- Detección reactiva de la tienda vía slug en tiempo real con carga de menú y colores de la marca.
- Checkout con generación de mensaje preformateado para WhatsApp.

### 5. 🪄 Asistente de Onboarding Rápido (`StoreOnboardingWizard`)
- Registro de un nuevo comercio en menos de 2 minutos con 4 pasos guiados y plantillas de menú:
  - 🍔 **Hamburguesería Artesanal**
  - 🍕 **Pizzería & Empanadas**
  - 🍗 **Rotisería & Minutas**
  - 🍷 **Restaurante & Salón**

### 6. 🪑 Módulo de Salón & Mapa Interactivo de Mesas (`tableService`)
- Grilla de mesas con código cromático (Verde: Libre, Amarillo: Ocupada con total acumulado, Morado: Cuenta Pedida).
- Vinculación directa con comandas del mostrador.

### 7. 🤖 Bot de WhatsApp Local Desacoplado (`botStoreConfig`)
- Microservicio Node.js con Baileys que corre en la PC del comercio (sin costos por mensaje ni baneos en la nube).
- Sustitución automática de variables: `{nombre_local}`, `{direccion}`, `{horarios}`, `{link_carta}`, `{alias_banco}`.
- Inyección de órdenes con etiqueta `store_id` hacia Supabase.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 18 + Vite
- **Estilos**: Vanilla CSS Moderno con Tokens Dinámicos (`:root` variables)
- **Base de Datos & Sincronización**: Supabase (PostgreSQL + RLS + Realtime)
- **Microservicio Bot**: Node.js + @whiskeysockets/baileys (WhatsApp Web Multi-Device)
- **Impresión Térmica**: ESC/POS para tickets de 58mm y 80mm vía Bluetooth, USB Serial y navegador.
- **Suite de Pruebas**: Node.js Native Test Runner (`node --test`)

---

## 📦 Verificación Automatizada

Para ejecutar todas las pruebas unitarias y validaciones de arquitectura:
```bash
# Ejecutar suite de pruebas unitarias (20 tests)
npm test

# Ejecutar auditoría integral de arquitectura SaaS & White-Label
node scripts/verify_white_label.mjs
```

---

## 🌐 Pasos para Desplegar y Vender en la Web

### Paso 1: Configurar Base de Datos en Supabase
1. Ingresá en [supabase.com](https://supabase.com) y creá un proyecto gratuito.
2. En el **SQL Editor**, ejecutá la migración multi-tenant:
   ```text
   supabase/migrations/001_multi_tenant_stores.sql
   ```
3. Copiá tu URL de proyecto y tu clave `anon_key`.

### Paso 2: Desplegar la Web en Netlify o Vercel
1. Subí este repositorio a GitHub (ej: `tu-usuario/comanda-gastronomica`).
2. Conectá el repositorio en **Netlify** o **Vercel**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Agregá las variables de entorno en la configuración del sitio:
   - `VITE_SUPABASE_URL`: tu URL de Supabase.
   - `VITE_SUPABASE_ANON_KEY`: tu anon key de Supabase.
4. Tu sitio web quedará disponible públicamente en `https://tu-app.netlify.app`.

### Paso 3: Dar de Alta Comercios desde el Panel Web
1. Abrí en tu navegador:
   ```text
   https://tu-app.netlify.app/#saas
   ```
2. Hacé clic en **`+ Nuevo Comercio Gastronómico`**.
3. Completá los datos del comercio (nombre, logo, colores, plantilla de rubro).
4. El local quedará inmediatamente disponible en:
   - Carta Digital: `https://tu-app.netlify.app/carta/slug-del-local`
   - Panel de Ventas del Local: `https://tu-app.netlify.app/?store=slug-del-local`

### Paso 4: (Opcional) Conectar el Bot de WhatsApp en el Local
1. En la computadora del local, dejá la carpeta `server/` con Node.js instalado.
2. En el archivo `.env` o en la consola configurá:
   ```text
   STORE_SLUG=slug-del-local
   ```
3. Ejecutá:
   ```bash
   node server/whatsappBotServer.js
   ```
4. El dueño escanea el código QR con el WhatsApp de su negocio y el bot comienza a responder automáticamente y derivar pedidos al sistema web.
