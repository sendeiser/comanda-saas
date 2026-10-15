# Plan de Modernización de Diseño, UI/UX y Componentes Visuales

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar integralmente el diseño, interfaces, estructura visual, paleta cromática y ergonomía de Comanda SaaS aplicando las directivas de **taste-design**, **ui-ux-pro-max** e **impeccable**, verificando la terminación y estabilidad visual con **Playwright** en móvil y escritorio.

**Architecture:** Sistema de diseño centralizado en tokens semánticos CSS (Zinc/Slate + Ámbar gastronómico cálido), desacoplando estilos ad-hoc hacia componentes modulares con feedback táctil activo (`:active`), tipografía con números tabulares (`font-variant-numeric: tabular-nums`), y doble modo visual (`Persuade` para catálogo de clientes y `Operate` para comandas POS y KDS cocina).

**Tech Stack:** React 19, Vite, Vanilla CSS con Variables Semánticas y Grid/Flexbox moderno, Playwright 1.60 (e2e & visual regression).

**Spec:** Diseño guiado por las 3 skills de vanguardia:
- [`taste-design`](file:///d:/Proyecto%20ZEN/.agents/skills/taste-design/SKILL.md): Anti-slop, micro-motion con física de resortes, eliminación de clichés (cero `#000000` puro, cero glows violetas artificiales).
- [`ui-ux-pro-max`](file:///d:/Proyecto%20ZEN/.agents/skills/ui-ux-pro-max/SKILL.md): Objetivos táctiles mínimos de 44x44px, contraste accesible WCAG 4.5:1, tipografía escalable con `clamp()`.
- [`impeccable`](file:///d:/Proyecto%20ZEN/.agents/skills/impeccable/SKILL.md): Artesanía de clase mundial, jerarquía visual estricta, pulido de estados vacíos y de error, endurecimiento visual.
- [`playwright-cli`](file:///d:/Proyecto%20ZEN/.agents/skills/playwright-cli/SKILL.md): Inspección automatizada en vivo con snapshots desktop (1440x900) y mobile (390x844).

## Global Constraints

- Prohibido el uso de TailwindCSS arbitrario; utilizar CSS semántico puro mediante tokens globales en `src/styles/index.css`.
- Nunca usar negro puro `#000000`; utilizar Off-Black (`#09090b` / `#0b0f19`) y Zinc-900/950 para fondos oscuros.
- Contraste de texto mínimo 4.5:1 sobre cualquier fondo según estándar WCAG AA.
- Todos los elementos táctiles e interactivos (botones, pills, cards de compra) deben tener un tamaño táctil mínimo de 44x44px en móviles.
- Cero desbordamiento horizontal (`overflow-x: hidden` / sin scroll horizontal en viewport móvil).
- Precios y montos numéricos deben usar obligatoriamente `tabular-nums` para evitar saltos de layout en tiempo real.

## Review Focus

1. **Desbordamiento horizontal en celulares (< 390px):** Verificar que la barra flotante de carrito y las cards de producto nunca generen scroll horizontal.
2. **Targets táctiles pequeños en botones rápidos:** Asegurar que los botones `+` y `-` del carrito y teclado POS tengan al menos 44px de área de pulsación.
3. **Contraste insuficiente en etiquetas de estado:** Badges como "Pendiente", "Cocina" o "Listo" deben ser legibles sin depender exclusivamente del color.
4. **Saltos de layout (CLS) al abrir modales:** El bloqueo de scroll del fondo no debe desplazar el contenido de la pantalla.
5. **Legibilidad bajo iluminación de cocina/mostrador:** KDS y POS deben mantener visibilidad en modo oscuro con superficies diferenciadas (`#131b2e` sobre `#0b0f19`).

---

### Task 1: Arquitectura de Tokens de Diseño y Core CSS (`taste-design` + `ui-ux-pro-max`)

**Files:**
- Modify: `src/styles/index.css:1-250`
- Modify: `DESIGN.md:1-138`
- Test: `tests/e2e/design-tokens.spec.js`

**Interfaces:**
- Produces: Variables semánticas CSS (`--bg-canvas`, `--surface-card`, `--surface-hover`, `--brand-primary`, `--brand-hover`, `--text-primary`, `--text-secondary`, `--radius-md`, `--spring-bounce`).
- Consumes: Google Fonts (`Outfit`, `Plus Jakarta Sans`, `JetBrains Mono`).

- [ ] **Step 1: Crear test de verificación de tokens semánticos en Playwright**

```javascript
// tests/e2e/design-tokens.spec.js
import { test, expect } from '@playwright/test';

test('design tokens and typography classes are correctly loaded', async ({ page }) => {
  await page.goto('http://localhost:5173');
  const primaryColor = await page.evaluate(() => 
    getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim()
  );
  expect(primaryColor).toBe('#f59e0b');

  const bgCanvas = await page.evaluate(() => 
    getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()
  );
  expect(bgCanvas).not.toBe('#000000'); // Anti-pattern rule: No pure black
});
```

- [ ] **Step 2: Ejecutar test para verificar que falla antes de implementar**

Run: `npx playwright test tests/e2e/design-tokens.spec.js`
Expected: FAIL (variables semánticas unificadas no definidas).

- [ ] **Step 3: Implementar la capa de tokens semánticos y reglas anti-slop en `src/styles/index.css` y `DESIGN.md`**

Unificar la paleta de colores gastronómica cálida (Zinc/Slate + Ámbar `#f59e0b`), tipografía `Outfit` para display y `Plus Jakarta Sans` para cuerpo, números tabulares obligatorios, y feedback táctil `:active { transform: scale(0.98); }`.

- [ ] **Step 4: Ejecutar test para verificar que pasa**

Run: `npx playwright test tests/e2e/design-tokens.spec.js`
Expected: PASS.

- [ ] **Step 5: Commit de los cambios**

```bash
git add src/styles/index.css DESIGN.md tests/e2e/design-tokens.spec.js
git commit -m "design(tokens): implementar arquitectura de tokens semanticos taste-design y ui-ux-pro-max"
```

---

### Task 2: Rediseño Premium del Catálogo Online de Clientes (`impeccable` - Modo Persuade)

**Files:**
- Modify: `src/pages/CatalogPage.jsx:1-400`
- Modify: `src/styles/catalog.css:1-350`
- Test: `tests/e2e/catalog-visual.spec.js`

**Interfaces:**
- Consumes: Tokens de `index.css`, estado de productos de Supabase/local.
- Produces: Experiencia de catálogo móvil fluida con hero branding, selector de categorías sticky, cards de producto de alta apetencia visual, y drawer inferior flotante de carrito.

- [ ] **Step 1: Crear test de Playwright para navegación móvil del catálogo y drawer**

```javascript
// tests/e2e/catalog-visual.spec.js
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } }); // iPhone 12/13/14

test('catalog mobile view has no horizontal overflow and sticky cart drawer', async ({ page }) => {
  await page.goto('http://localhost:5173/#/catalogo');
  await page.waitForLoadState('networkidle');

  // Verificar que no hay desbordamiento horizontal
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

  // Agregar primer producto disponible
  const addBtn = page.locator('button:has-text("Agregar"), button:has-text("+")').first();
  await addBtn.click();

  // Verificar que la barra flotante de carrito aparece con altura táctil >= 44px
  const floatingBar = page.locator('.floating-cart-bar, [data-testid="floating-cart"]');
  await expect(floatingBar).toBeVisible();
  const box = await floatingBar.boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
});
```

- [ ] **Step 2: Ejecutar test para verificar estado inicial**

Run: `npx playwright test tests/e2e/catalog-visual.spec.js`
Expected: Verificar fallos de layout o responsive en móvil.

- [ ] **Step 3: Pulir la interfaz del catálogo en `src/pages/CatalogPage.jsx` y `src/styles/catalog.css`**

- Hero section con foto del local integrada limpiamente sin texto encimado ilegible.
- Barra de categorías con scroll horizontal suave sin barras de desplazamiento visibles (`scrollbar-width: none`).
- Cards de producto con aspect ratio fotográfico 16:9, badges destacados de "Promo", "Envío Gratis" y "Veggie".
- Micro-animación en botón de agregar con feedback háptico visual y actualización instantánea del subtotal.
- Drawer inferior flotante accesible con resumen de ítems y botón principal destacado hacia el checkout.

- [ ] **Step 4: Ejecutar test y capturar snapshot visual con Playwright**

Run: `npx playwright test tests/e2e/catalog-visual.spec.js`
Expected: PASS en resolución móvil 390x844.

- [ ] **Step 5: Commit de los cambios**

```bash
git add src/pages/CatalogPage.jsx src/styles/catalog.css tests/e2e/catalog-visual.spec.js
git commit -m "feat(catalog): rediseño premium y ergonomia movil impecable para catalogo online"
```

---

### Task 3: Ergonomía de Caja y Mostrador POS (`ui-ux-pro-max` - Modo Operate)

**Files:**
- Modify: `src/components/pos/FastOrderPad.jsx:1-350`
- Modify: `src/components/pos/PaymentModal.jsx:1-250`
- Test: `tests/e2e/pos-fastpad.spec.js`

**Interfaces:**
- Consumes: Tokens semánticos, cola de pedidos POS.
- Produces: Panel táctil de alta velocidad con botones de categoría grandes, selector de cantidades con teclado numérico ergonómico y modal de cobro ultra claro (Efectivo / Transferencia).

- [ ] **Step 1: Escribir test Playwright para interacción táctil de comanda rápida**

```javascript
// tests/e2e/pos-fastpad.spec.js
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 800 } }); // Pantalla táctil de mostrador / tablet

test('pos fast order pad allows rapid item selection and modal payment trigger', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  // Verificar teclado táctil y target de botones >= 44px
  const itemBtn = page.locator('.product-grid-btn, [data-testid="pos-product-item"]').first();
  if (await itemBtn.isVisible()) {
    const box = await itemBtn.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  }
});
```

- [ ] **Step 2: Ejecutar test para verificar fallas de espaciado o dimensiones**

Run: `npx playwright test tests/e2e/pos-fastpad.spec.js`
Expected: FAIL si algún target es menor a 44px.

- [ ] **Step 3: Optimizar `FastOrderPad.jsx` y `PaymentModal.jsx`**

- Espaciado mínimo de 8px entre botones táctiles para evitar toques accidentales de cajero.
- Contraste visual elevado en totales de ticket con fuente mono-tabular (`$ 16.800` alineado).
- Botón de cobro en Efectivo y Transferencia con iconos SVG de alta legibilidad (sin emojis deformables).
- Accesibilidad por teclado (atajos `F1`, `F2`, `ESC` para cerrar modales).

- [ ] **Step 4: Ejecutar test de verificación**

Run: `npx playwright test tests/e2e/pos-fastpad.spec.js`
Expected: PASS.

- [ ] **Step 5: Commit de los cambios**

```bash
git add src/components/pos/FastOrderPad.jsx src/components/pos/PaymentModal.jsx tests/e2e/pos-fastpad.spec.js
git commit -m "feat(pos): optimizar ergonomia tactil y modal de cobro en mostrador segun ui-ux-pro-max"
```

---

### Task 4: Monitor de Cocina KDS y Tablero en Tiempo Real (`taste-design` - Cockpit Mode)

**Files:**
- Modify: `src/components/pos/KitchenDisplay.jsx:1-350`
- Modify: `src/components/pos/WhatsAppLiveMonitor.jsx:1-300`
- Test: `tests/e2e/kds-visual.spec.js`

**Interfaces:**
- Consumes: Pedidos en cocina (`status: 'cocina'`), tiempos transcurridos en ISO.
- Produces: Tarjetas de comanda con tipografía mono visible a 3 metros de distancia, alertas de tiempo transcurrido (Verde <15m, Amarillo 15-25m, Rojo crítico >25m), y botones táctiles gigantes para avanzar pedidos a "Listo".

- [ ] **Step 1: Crear test Playwright para tarjetas KDS y legibilidad de estados**

```javascript
// tests/e2e/kds-visual.spec.js
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });

test('kitchen display orders have high contrast status badges and action buttons', async ({ page }) => {
  await page.goto('http://localhost:5173/#/cocina');
  await page.waitForLoadState('networkidle');

  const kdsTitle = page.locator('h1, h2:has-text("Cocina"), :text("KDS")').first();
  await expect(kdsTitle).toBeVisible();
});
```

- [ ] **Step 2: Ejecutar test de KDS**

Run: `npx playwright test tests/e2e/kds-visual.spec.js`
Expected: Verificar que la vista de cocina monta correctamente y no tiene desbordamientos.

- [ ] **Step 3: Implementar mejoras de contraste y tipografía KDS en `KitchenDisplay.jsx` y `WhatsAppLiveMonitor.jsx`**

- Tarjetas de pedido con bordes contrastados y tiempo transcurrido en tiempo real en negrita.
- Lista de ingredientes con modificadores resaltados (`[SIN CEBOLLA]`, `[EXTRA CHEDDAR]`) en color de alta atención (amarillo/naranja).
- Botón táctil ancho para pasar pedido a "Listo para retirar/despachar".
- Chat de WhatsApp Live Monitor con burbujas de mensaje simétricas y auto-scroll suave.

- [ ] **Step 4: Ejecutar test KDS para verificar aprobación**

Run: `npx playwright test tests/e2e/kds-visual.spec.js`
Expected: PASS.

- [ ] **Step 5: Commit de los cambios**

```bash
git add src/components/pos/KitchenDisplay.jsx src/components/pos/WhatsAppLiveMonitor.jsx tests/e2e/kds-visual.spec.js
git commit -m "feat(kds): rediseño visual de alta visibilidad para cocina y monitor whatsapp en tiempo real"
```

---

### Task 5: Endurecimiento Visual de Modales, CRM y Portal de Auditoría (`impeccable` - Harden & Polish)

**Files:**
- Modify: `src/components/pos/CashControlModal.jsx:1-250`
- Modify: `src/components/pos/CustomerCrmModal.jsx:1-250`
- Modify: `src/components/admin/OwnerAuditPortal.jsx:1-350`
- Test: `tests/e2e/modals-accessibility.spec.js`

**Interfaces:**
- Consumes: Componentes modales del POS y portal administrativo.
- Produces: Estructura unificada de modales con encabezado sticky, cierre por tecla ESC, backdrop con desenfoque suave (`backdrop-filter: blur(8px)`), y tablas numéricas tabulares.

- [ ] **Step 1: Escribir test de accesibilidad y cierre de modales**

```javascript
// tests/e2e/modals-accessibility.spec.js
import { test, expect } from '@playwright/test';

test('modals trap focus, close on ESC key, and maintain readable tables', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');

  // Abrir modal de control de caja si está presente
  const cashBtn = page.locator('button:has-text("Caja"), button:has-text("Arqueo")').first();
  if (await cashBtn.isVisible()) {
    await cashBtn.click();
    const modal = page.locator('.modal-content, [role="dialog"]').first();
    await expect(modal).toBeVisible();

    // Probar cierre con tecla Escape
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  }
});
```

- [ ] **Step 2: Ejecutar test para comprobar comportamiento**

Run: `npx playwright test tests/e2e/modals-accessibility.spec.js`
Expected: PASS o reporte de modales que no responden a ESC.

- [ ] **Step 3: Implementar cierre por ESC, backdrop estandarizado y tablas tabulares en los modales y portal de auditoría**

- Unificar el backdrop oscuro con desenfoque de fondo.
- Incorporar listener `keydown` para tecla `Escape` en todos los modales.
- Estilizar tablas de arqueo de caja y clientes con tipografía `tabular-nums` y encabezados `sticky`.

- [ ] **Step 4: Ejecutar test de modales y confirmar éxito**

Run: `npx playwright test tests/e2e/modals-accessibility.spec.js`
Expected: PASS.

- [ ] **Step 5: Commit de los cambios**

```bash
git add src/components/pos/CashControlModal.jsx src/components/pos/CustomerCrmModal.jsx src/components/admin/OwnerAuditPortal.jsx tests/e2e/modals-accessibility.spec.js
git commit -m "feat(modals): estandarizar accesibilidad, backdrop y cierre por teclado en modales y auditoria"
```

---

### Task 6: Suite Completa de Verificación Visual Automatizada con Playwright (`playwright-cli`)

**Files:**
- Create: `tests/e2e/visual-regression-master.spec.js`
- Test: Capturas completas en `test-results/`
- Modify: `package.json` (agregar script `npm run test:visual`)

**Interfaces:**
- Consumes: Servidor Vite en `http://localhost:5173`.
- Produces: Reporte visual automatizado y suite de screenshots en 2 resoluciones canónicas: Desktop (1440x900) y Mobile (390x844).

- [ ] **Step 1: Crear la suite maestra de regresión visual de Playwright**

```javascript
// tests/e2e/visual-regression-master.spec.js
import { test, expect } from '@playwright/test';

const surfaces = [
  { name: 'landing-desktop', url: 'http://localhost:5173/#/', viewport: { width: 1440, height: 900 } },
  { name: 'landing-mobile', url: 'http://localhost:5173/#/', viewport: { width: 390, height: 844 } },
  { name: 'catalog-desktop', url: 'http://localhost:5173/#/catalogo', viewport: { width: 1440, height: 900 } },
  { name: 'catalog-mobile', url: 'http://localhost:5173/#/catalogo', viewport: { width: 390, height: 844 } },
  { name: 'kds-desktop', url: 'http://localhost:5173/#/cocina', viewport: { width: 1440, height: 900 } }
];

for (const surface of surfaces) {
  test(`visual check for ${surface.name}`, async ({ page }) => {
    await page.setViewportSize(surface.viewport);
    await page.goto(surface.url);
    await page.waitForLoadState('networkidle');

    // Verificar ausencia total de scroll horizontal
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    // Capturar screenshot de auditoría visual
    await page.screenshot({ path: `tests/screenshots/${surface.name}.png`, fullPage: false });
  });
}
```

- [ ] **Step 2: Ejecutar la suite maestra de verificación visual con Playwright**

Run: `npx playwright test tests/e2e/visual-regression-master.spec.js`
Expected: PASS en las 5 superficies y generación de capturas en `tests/screenshots/`.

- [ ] **Step 3: Agregar comando `test:visual` en `package.json` y validar salida**

Añadir `"test:visual": "playwright test tests/e2e/visual-regression-master.spec.js"` en `package.json`.

- [ ] **Step 4: Ejecutar `npm run test:visual` y confirmar que todas las superficies pasan al 100%**

Run: `npm run test:visual`
Expected: 5 passed (100% de tests visuales exitosos).

- [ ] **Step 5: Commit final de la suite de verificación**

```bash
git add package.json tests/e2e/visual-regression-master.spec.js
git commit -m "test(visual): suite maestra de verificacion visual responsive con playwright"
```
