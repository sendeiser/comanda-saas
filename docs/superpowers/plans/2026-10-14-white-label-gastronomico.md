# Plan de Implementación: Plataforma Gastronómica White-Label Multi-Tenant

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar ComandaFast en una plataforma gastronómica White-Label multi-tenant lista para comercializar, con catálogo por slug de comercio, motor de marca dinámica, mapa de mesas y bot de WhatsApp local por comercio.

**Architecture:** Capa frontend basada en React 18 con motor de temas CSS en tiempo de ejecución, enrutamiento dinámico por slug (`/carta/:slug`) y persistencia multi-tenant en Supabase (RLS por `store_id`). El Punto de Venta y el microservicio de WhatsApp (Baileys) se ejecutan localmente en la PC del local comunicándose en tiempo real con la nube.

**Tech Stack:** React 18, Vite, Supabase (PostgreSQL + RLS), Baileys WhatsApp Web API, CSS Variables, Node.js (test runner nativo `node --test`).

**Spec:** [docs/superpowers/specs/2026-10-14-white-label-gastronomico-design.md](file:///d:/Proyecto%20ZEN/ComandaFastBurga/docs/superpowers/specs/2026-10-14-white-label-gastronomico-design.md)

## Global Constraints

- Cero strings o marcas fijas hardcodeadas en componentes visuales.
- Node.js >= 18 compatible con el runner nativo de tests (`node --test`).
- Persistencia offline-first tolerante a cortes de red en el local.
- Respetar el estándar de nombres y claves de tablas en snake_case para PostgreSQL/Supabase.

## Review Focus

1. **Local no encontrado por slug**: Si el cliente entra a `/carta/slug-inexistente`, debe mostrar una pantalla amigable de "Comercio no encontrado" sin colapsar la app.
2. **Caída de internet durante comanda**: Si se interrumpe la conexión, el POS y KDS deben guardar la orden en almacenamiento local (`IndexedDB`/`localStorage`) y sincronizar al reconectar sin duplicar pedidos.
3. **Colores de marca de bajo contraste**: Si el dueño elige un color primario muy claro u oscuro, el motor de temas debe asegurar legibilidad de texto (contraste mínimo).
4. **Desconexión del Bot de WhatsApp**: Si el teléfono del local pierde batería o señal, el servidor local del bot debe reintentar reconexión y reflejar el estado "Desconectado" en la interfaz sin bloquear el POS.
5. **Colisión de número de mesa**: Dos mozos o cajeros abriendo la misma mesa simultáneamente deben fusionar o advertir que la mesa ya posee una comanda activa.

---

### Task 1: Motor de Identidad Visual y Temas Dinámicos (`themeService`)

**Files:**
- Create: `src/services/themeService.js`
- Create: `tests/themeService.test.js`
- Modify: `src/styles/index.css`

**Interfaces:**
- Produces: `applyStoreTheme(themeConfig: StoreTheme): void`
- Produces: `getContrastingTextColor(hexColor: string): '#ffffff' | '#000000'`
- Produces: `DEFAULT_THEME: StoreTheme`

- [ ] **Step 1: Write the failing unit tests for theme service**

```javascript
// tests/themeService.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { getContrastingTextColor, normalizeTheme } from '../src/services/themeService.js';

test('getContrastingTextColor returns white for dark backgrounds and black for light backgrounds', () => {
  assert.equal(getContrastingTextColor('#000000'), '#ffffff');
  assert.equal(getContrastingTextColor('#ffffff'), '#000000');
  assert.equal(getContrastingTextColor('#0b0f19'), '#ffffff');
  assert.equal(getContrastingTextColor('#fef08a'), '#000000');
});

test('normalizeTheme fills default fallbacks when properties are missing', () => {
  const normalized = normalizeTheme({});
  assert.ok(normalized.primaryColor);
  assert.ok(normalized.accentColor);
  assert.ok(normalized.bgDark);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/themeService.test.js`
Expected: FAIL (Cannot find module `../src/services/themeService.js`)

- [ ] **Step 3: Implement `themeService.js`**

Implementar funciones `getContrastingTextColor`, `normalizeTheme`, y `applyStoreTheme(themeConfig)` que inyecte las CSS variables en `document.documentElement.style`:
`--brand-primary`, `--brand-primary-text`, `--brand-accent`, `--brand-bg`, `--brand-surface`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/themeService.test.js`
Expected: PASS

- [ ] **Step 5: Connect CSS variables in `src/styles/index.css`**

Reemplazar los colores duros `#f59e0b` y `#0b0f19` por `var(--brand-primary, #f59e0b)` y `var(--brand-bg, #0b0f19)`.

- [ ] **Step 6: Commit**

```bash
git add src/services/themeService.js tests/themeService.test.js src/styles/index.css
git commit -m "feat(theme): implement dynamic white-label theme engine"
```

---

### Task 2: Modelo de Datos Multi-Tenant y Servicio de Tienda (`storeService`)

**Files:**
- Create: `supabase/migrations/001_multi_tenant_stores.sql`
- Create: `src/services/storeService.js`
- Create: `tests/storeService.test.js`

**Interfaces:**
- Produces: `getStoreBySlug(slug: string): Promise<StoreConfig | null>`
- Produces: `saveStoreConfig(storeData: StoreConfig): Promise<StoreConfig>`
- Produces: `getActiveStore(): StoreConfig | null`
- Produces: `setActiveStore(store: StoreConfig): void`

- [ ] **Step 1: Write the failing unit tests for store service**

```javascript
// tests/storeService.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeSlug, validateStoreConfig } from '../src/services/storeService.js';

test('sanitizeSlug converts company names into valid web slugs', () => {
  assert.equal(sanitizeSlug('Pizzería & Empanadas Don Tito!'), 'pizzeria-empanadas-don-tito');
  assert.equal(sanitizeSlug('La Farola 24hs'), 'la-farola-24hs');
});

test('validateStoreConfig ensures required fields are present', () => {
  const valid = validateStoreConfig({ name: 'Don Tito', slug: 'don-tito' });
  assert.equal(valid.isValid, true);

  const invalid = validateStoreConfig({ name: '' });
  assert.equal(invalid.isValid, false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/storeService.test.js`
Expected: FAIL (Cannot find module `../src/services/storeService.js`)

- [ ] **Step 3: Implement `storeService.js` y migración SQL de Supabase**

Crear `supabase/migrations/001_multi_tenant_stores.sql` con tabla `stores` y clave `store_id` en tablas dependientes con políticas RLS.
Implementar `storeService.js` con cache local en `localStorage` y soporte de sincronización con Supabase.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/storeService.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/001_multi_tenant_stores.sql src/services/storeService.js tests/storeService.test.js
git commit -m "feat(store): add multi-tenant store schema and storeService"
```

---

### Task 3: Enrutamiento Dinámico y Catálogo Público por Slug

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/pages/CatalogPage.jsx`
- Create: `tests/catalogRouting.test.js`

**Interfaces:**
- Consumes: `storeService.getStoreBySlug`, `themeService.applyStoreTheme`
- Produces: URL accesible `/carta/:storeSlug` que renderiza el catálogo con la identidad del comercio.

- [ ] **Step 1: Write unit tests for slug resolution and 404 fallback**

```javascript
// tests/catalogRouting.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveStoreFromUrl } from '../src/services/storeService.js';

test('resolveStoreFromUrl parses slug from pathname correctly', () => {
  assert.equal(resolveStoreFromUrl('/carta/pizzeria-roma'), 'pizzeria-roma');
  assert.equal(resolveStoreFromUrl('/carta/don-tito/'), 'don-tito');
  assert.equal(resolveStoreFromUrl('/pos'), null);
});
```

- [ ] **Step 2: Run test to verify it passes/fails**

Run: `node --test tests/catalogRouting.test.js`
Expected: PASS/FAIL depending on helper existence.

- [ ] **Step 3: Update `src/App.jsx` and `src/pages/CatalogPage.jsx`**

Actualizar `App.jsx` para soportar la ruta `/carta/:storeSlug`.
Modificar `CatalogPage.jsx` para que:
1. Extraiga el `storeSlug` de la URL.
2. Cargue la configuración del comercio correspondiente (`getStoreBySlug`).
3. Aplique el tema dinámico con `applyStoreTheme`.
4. Muestre el logo, nombre y banner del local.
5. Muestre estado amigable si el comercio no existe.

- [ ] **Step 4: Smoke test with development server**

Run: `npm run build`
Expected: Build exitoso sin errores de JSX o sintaxis.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/pages/CatalogPage.jsx tests/catalogRouting.test.js
git commit -m "feat(catalog): enable dynamic slug routing and branded catalog view"
```

---

### Task 4: Asistente de Onboarding para Nuevos Comercios (`StoreOnboardingWizard`)

**Files:**
- Create: `src/components/admin/onboarding/StoreOnboardingWizard.jsx`
- Create: `src/data/storeTemplates.js`
- Modify: `src/components/admin/OwnerAuditPortal.jsx`

**Interfaces:**
- Consumes: `storeService.saveStoreConfig`
- Produces: Asistente visual de 4 pasos (Marca, Operaciones, Cobros/Delivery, Menú inicial).

- [ ] **Step 1: Create `src/data/storeTemplates.js` con plantillas predefinidas**

Plantillas predeterminadas de rubro gastronómico:
- Hamburguesería (categorías: Hamburguesas, Agregados, Bebidas, Promos).
- Pizzería / Empanadas (categorías: Pizzas Tradicionales, Pizzas Especiales, Empanadas, Bebidas).
- Rotisería / Minutas (categorías: Platos del Día, Minutas, Tartas, Guarniciones, Postres).

- [ ] **Step 2: Implement `StoreOnboardingWizard.jsx`**

Implementar el componente modal/pantalla con validación de slug en vivo, preview en tiempo real del logo y colores de marca, y carga de la plantilla seleccionada.

- [ ] **Step 3: Integrate Wizard in `OwnerAuditPortal.jsx`**

Agregar botón "Registrar Nuevo Comercio" en el portal de administración que abre el Wizard.

- [ ] **Step 4: Verify with build**

Run: `npm run build`
Expected: Build exitoso.

- [ ] **Step 5: Commit**

```bash
git add src/data/storeTemplates.js src/components/admin/onboarding/StoreOnboardingWizard.jsx src/components/admin/OwnerAuditPortal.jsx
git commit -m "feat(onboarding): add store onboarding wizard and industry templates"
```

---

### Task 5: Módulo de Salón y Mapa Interactivo de Mesas (`tableService`)

**Files:**
- Create: `src/services/tableService.js`
- Create: `tests/tableService.test.js`
- Create: `src/components/pos/TableMapModal.jsx`
- Modify: `src/components/pos/FastOrderPad.jsx`

**Interfaces:**
- Produces: `getTables(storeId: string): Promise<RestaurantTable[]>`
- Produces: `updateTableStatus(tableId: string, status: 'free' | 'occupied' | 'bill_requested'): Promise<void>`
- Produces: `linkOrderToTable(tableId: string, orderId: string): Promise<void>`

- [ ] **Step 1: Write failing unit tests for table state management**

```javascript
// tests/tableService.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidTableTransition } from '../src/services/tableService.js';

test('isValidTableTransition validates table lifecycle', () => {
  assert.equal(isValidTableTransition('free', 'occupied'), true);
  assert.equal(isValidTableTransition('occupied', 'bill_requested'), true);
  assert.equal(isValidTableTransition('bill_requested', 'free'), true);
  assert.equal(isValidTableTransition('free', 'bill_requested'), false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/tableService.test.js`
Expected: FAIL (Cannot find module `../src/services/tableService.js`)

- [ ] **Step 3: Implement `tableService.js` y `TableMapModal.jsx`**

Implementar la lógica de transición de estados de mesas y la interfaz visual interactiva con grilla de mesas (chips de color verde, amarillo, morado).

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/tableService.test.js`
Expected: PASS

- [ ] **Step 5: Connect Table Selector in `FastOrderPad.jsx`**

Permitir seleccionar "Mesa" como tipo de pedido y asociar la comanda al número de mesa seleccionado.

- [ ] **Step 6: Commit**

```bash
git add src/services/tableService.js tests/tableService.test.js src/components/pos/TableMapModal.jsx src/components/pos/FastOrderPad.jsx
git commit -m "feat(tables): add floor plan table management and order linkage"
```

---

### Task 6: Desacoplamiento y Parametrización del Bot de WhatsApp Local

**Files:**
- Modify: `server/whatsappBotServer.js`
- Create: `server/botStoreConfig.js`
- Create: `tests/botConfig.test.js`

**Interfaces:**
- Produces: `loadBotConfig(storeId?: string): BotRuntimeConfig`
- Desacopla: Mensajes fijos de hamburguesas por plantillas dinámicas alimentadas por `bot_templates.json` y el menú del comercio.

- [ ] **Step 1: Write unit tests for dynamic bot template renderer**

```javascript
// tests/botConfig.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { renderBotGreeting } from '../server/botStoreConfig.js';

test('renderBotGreeting formats welcome message with dynamic store name and catalog link', () => {
  const greeting = renderBotGreeting({
    name: 'Pizzería Napoles',
    slug: 'pizzeria-napoles',
    baseUrl: 'https://comanda.app'
  });
  assert.ok(greeting.includes('Pizzería Napoles'));
  assert.ok(greeting.includes('https://comanda.app/carta/pizzeria-napoles'));
  assert.ok(!greeting.includes('Burga'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/botConfig.test.js`
Expected: FAIL (Cannot find module `../server/botStoreConfig.js`)

- [ ] **Step 3: Implement `server/botStoreConfig.js` y refactorizar `server/whatsappBotServer.js`**

Extraer la configuración de tienda (`store_id`, nombre comercial, enlace al catálogo y textos de saludo) a un cargador dinámico configurable por archivo `.env` o `store_config.json`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/botConfig.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/botStoreConfig.js tests/botConfig.test.js server/whatsappBotServer.js
git commit -m "refactor(bot): decouple hardcoded brand text and support dynamic store config"
```

---

### Task 7: Empaquetado y Verificación Integral del Sistema

**Files:**
- Modify: `INICIAR_SISTEMA_COMPLETO.bat`
- Modify: `README.md`
- Create: `scripts/verify_white_label.mjs`

**Interfaces:**
- Verifica: Integridad del build de producción, ejecución de todos los unit tests, y arranque conjunto de frontend + bot.

- [ ] **Step 1: Create verification script `scripts/verify_white_label.mjs`**

Script que valida que:
1. No queden menciones fijas de la marca antigua en componentes del core.
2. La suite de pruebas unitarias (`node --test tests/*.test.js`) ejecute con 100% de éxito.
3. El build de Vite (`npm run build`) complete sin errores.

- [ ] **Step 2: Update launch scripts (`INICIAR_SISTEMA_COMPLETO.bat`)**

Asegurar que el script de inicio para el cliente soporte pasar el `STORE_ID` o cargarlo de su archivo local.

- [ ] **Step 3: Execute full verification**

Run: `npm test; npm run build`
Expected: Todos los tests pasan y build generado en `dist/`.

- [ ] **Step 4: Commit**

```bash
git add scripts/verify_white_label.mjs INICIAR_SISTEMA_COMPLETO.bat README.md
git commit -m "chore: add automated verification script and update client launcher"
```
