# Especificación de Diseño: Plataforma Web SaaS & CRM Gastronómico Dual

**Fecha:** 2026-10-14  
**Autor:** Antigravity AI & Human Partner  
**Estado:** Propuesta Aprobada  
**Alcance:** `d:/Proyecto ZEN/ComandaFastBurga`

---

## 1. Visión y Objetivos

Transformar el sistema gastronómico en una plataforma web integral operable 100% desde el navegador, con dos niveles de CRM y arquitectura multi-comercio:

1. **SaaS Super-Admin CRM (Tu Negocio)**:
   - Panel de control para el administrador/vendedor del software.
   - Directorio de comercios clientes (hamburgueserías, pizzerías, etc.).
   - Control de suscripciones/abonos mensuales con estado (`al_dia`, `por_vencer`, `vencido`, `suspendido`).
   - Bloqueo/suspensión remota por falta de pago y reactivación inmediata al registrar cobranza.
   - Registro de cobros de abonos y cálculo de ingresos recurrentes mensuales (MRR).

2. **CRM Gastronómico Interno (Para cada Restaurante)**:
   - Directorio de clientes frecuentes y comensales.
   - Control ágil de libreta de fiados / cuentas corrientes (`saldo_deudor`).
   - 5to método de pago en el POS: **"A Cuenta / Fiado"** para comensales de confianza.
   - Registro de cobranzas de fiados (Pago total, 50% o personalizado) con comprobante.
   - Generador de recordatorio de saldo por WhatsApp en 1 clic (`wa.me`).

3. **Arquitectura Web y Despliegue**:
   - Acceso web unificado por URL y parámetros (`?store=slug` y `/carta/:slug`).
   - Sincronización en la nube con Supabase (RLS con `store_id`).
   - Conector híbrido para bot de WhatsApp: web en la nube y microservicio local para conectar Baileys en la máquina del local.

---

## 2. Arquitectura de Datos y Servicios

### 2.1. SaaS CRM Service (`src/services/saasCrmService.js`)
* **Entidad `StoreSubscription`**:
  ```typescript
  interface StoreSubscription {
    storeId: string;
    storeName: string;
    ownerName: string;
    ownerPhone: string;
    ownerEmail?: string;
    plan: 'basico' | 'pro' | 'full';
    monthlyFee: number;
    billingDay: number; // Día de cobro del mes (1-28)
    status: 'al_dia' | 'por_vencer' | 'vencido' | 'suspendido';
    lastPaymentDate: string;
    nextDueDate: string;
    createdAt: string;
  }
  ```
* **Funciones Principales**:
  - `getSubscriptions()`: Obtiene todos los clientes suscritos.
  - `updateSubscriptionStatus(storeId, status)`: Cambia el estado de la suscripción.
  - `recordSubscriptionPayment(storeId, amount, paymentMethod)`: Registra el pago del mes y extiende la fecha de vencimiento 30 días.
  - `isStoreBlocked(storeId)`: Retorna si el comercio está suspendido por mora.
  - `getSaasMetrics()`: Calcula MRR, total de clientes activos, clientes por vencer y morosos.

### 2.2. CRM de Clientes y Fiados (`src/services/customerCrmService.js`)
* **Entidad `Customer`**:
  ```typescript
  interface Customer {
    id: string;
    storeId: string;
    name: string;
    phone: string;
    address: string;
    notes?: string;
    currentBalance: number; // Saldo deudor acumulado
    lastOrderAt: string;
    totalOrdersCount: number;
    createdAt: string;
  }
  ```
* **Funciones Principales**:
  - `getCustomers(storeId)`: Listado de comensales del local.
  - `saveCustomer(storeId, customer)`: Alta o edición de cliente.
  - `addCustomerCharge(storeId, customerId, amount, orderId, concept)`: Imputa un pedido en fiado a la cuenta corriente del cliente.
  - `recordCustomerPayment(storeId, customerId, amount, paymentMethod)`: Registra un cobro de fiado y descuenta el saldo.
  - `generateWhatsAppDebtReminder(customer, storeConfig)`: Genera el texto cordial y link directo a `wa.me` para avisar el saldo pendiente.

---

## 3. Interfaces de Usuario (UI/UX)

### 3.1. Super-Admin SaaS Portal (`src/components/admin/SaasAdminPortal.jsx`)
* Acceso restringido por PIN/Clave maestra en `#saas` o `#superadmin`.
* **StatCards**:
  - 💵 **MRR (Ingresos Recurrentes Mensuales)**.
  - 🏪 **Clientes Gastronómicos Activos**.
  - ⚠️ **Abonos por Cobrar / Vencidos**.
* **Tabla de Comercios**:
  - Nombre, Dueño, Teléfono WhatsApp, Plan, Saldo/Estado (`Al Día` en verde, `Vencido` en rojo).
  - Acciones rápidas:
    - 💰 **Registrar Cobro de Abono**.
    - 🔒 **Suspender / Reactivar Local**.
    - 💬 **WhatsApp al Dueño** (Recordatorio de pago de suscripción).
    - 🔗 **Ver Carta Web** / ⚙️ **Configuración de Marca**.
* Botón **`+ Nuevo Comercio`** que lanza el `StoreOnboardingWizard`.

### 3.2. Módulo de Clientes & Fiados para el Restaurante (`src/components/pos/CustomerCrmModal.jsx`)
* Acceso directo desde la barra superior del POS (`👥 Clientes & Fiados`).
* **Tarjetas de Resumen**:
  - Clientes Registrados.
  - Total Fiados en la Calle ($).
  - Clientes con Deuda Activa.
* **Buscador ágil** por nombre o teléfono.
* **Fila de Cliente**:
  - Nombre, teléfono, saldo deudor en color ámbar/rojo.
  - Botón **"Cobrar Deuda"** (Pago Total, 50% o Monto Libre).
  - Botón **"Recordar por WhatsApp"** (abre chat con mensaje cordial preformateado).
  - Historial de movimientos (Cargos de pedidos y Pagos realizados).

### 3.3. Integración en `FastOrderPad.jsx` y `PaymentModal.jsx`
* En `PaymentModal.jsx`: nuevo botón de método de pago **"A Cuenta / Fiado"**.
* Si se elige "A Cuenta", permite seleccionar un cliente del CRM o ingresar uno nuevo al vuelo.
* Al confirmar el pedido, el monto se suma automáticamente a la cuenta corriente del cliente.

---

## 4. Estrategia de Pruebas Automatizadas
* `tests/saasCrmService.test.js`:
  - Cálculo de estados de vencimiento y cálculo de MRR.
  - Registro de pagos de suscripción y corrimiento de fecha de vencimiento.
  - Suspensión y reactivación de comercios.
* `tests/customerCrmService.test.js`:
  - Imputación de cargos de pedidos fiados.
  - Descuento de saldo tras cobros parciales y totales.
  - Generación de textos y enlaces de WhatsApp para aviso de cobro.
