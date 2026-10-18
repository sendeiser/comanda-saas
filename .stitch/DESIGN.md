---
name: Atelier Gastronomy OS
project_id: "12215373613650474894"
design_system_id: "assets/fe11aa0355ec447988293ccadcb31b56"
colors:
  canvas-base: "#f9f9f8"
  surface-card: "#ffffff"
  surface-hover: "#f1f1ef"
  surface-dim: "#eeeeed"
  surface-low: "#f3f4f3"
  surface-high: "#e8e8e7"
  border-hairline: "#e6e6e3"
  border-strong: "#d0d0cb"
  terracotta-primary: "#a43716"
  terracotta-container: "#c54f2c"
  terracotta-light: "#ffdbd1"
  text-obsidian: "#1a1c1c"
  text-secondary: "#5b5e67"
  text-tertiary: "#8c909a"
  emerald-live: "#10b981"
  amber-warning: "#ea580c"
  ruby-urgent: "#ba1a1a"
typography:
  display: "Geist, system-ui, -apple-system, sans-serif"
  body: "Geist, system-ui, -apple-system, sans-serif"
  mono: "JetBrains Mono, monospace"
---

# Design System Oficial: Atelier Gastronomy OS (Google Stitch)

Sistema de diseño unificado generado y sincronizado a través del MCP de Google Stitch para toda la suite gastronómica **ComandaSaaS**.

---

## 1. Filosofía y Estética Visual

- **Minimalist Modern B2B SaaS**: Lienzo neutro de alabastro cálido (`#f9f9f8`) con tarjetas blancas puras (`#ffffff`) delimitadas por bordes milimétricos *hairline* de 1px (`#e6e6e3`), eliminando sombras pesadas y sobrecargas visuales.
- **Acento Terracota Kiln-Fired (`#a43716`)**: Calidez gastronómica sobria aplicada exclusivamente en botones primarios de acción, selectores activos y estados clave de despacho.
- **Tipografía Dual de Alta Precisión**:
  - **Geist**: Para encabezados, nombres de platos, navegación y controles ergonómicos.
  - **JetBrains Mono**: Para todos los números de mesa, importes financieros, cronómetros de cocina, números de comanda y códigos de ticket.

---

## 2. Pantallas Rediseñadas en Google Stitch (100% Cobertura Desktop & Mobile)

| Módulo / Ruta | Dispositivo | Screen ID en Stitch | Archivos en `.stitch/designs/` | Captura Playwright Original |
|---|---|---|---|---|
| **Landing Page Principal** (`/`) | Desktop | `60e82055e425437680dbef02eae4dafd` | `landing-minimalista-desktop.html` / `.png` | `.stitch/crawler-screenshots/landing-desktop.png` |
| **Landing Page Mobile** (`/`) | Mobile | `4af888e00062482cbe3579cc590ce467` | `landing-minimalista-mobile.html` / `.png` | `.stitch/crawler-screenshots/landing-mobile.png` |
| **Terminal POS Táctil** (`/#pos`) | Desktop | `e3636961295b47e9b3825ec8e0cb4fa4` | `pos-terminal-desktop.html` / `.png` | `.stitch/crawler-screenshots/pos-terminal-desktop.png` |
| **Comandero Móvil de Mozo** (`/#pos`) | Mobile | `add1e5077f10423aa3a521dc6b26dc12` | `waiter-pos-mobile.html` / `.png` | `.stitch/crawler-screenshots/pos-terminal-mobile.png` |
| **KDS Pantalla de Cocina** (`/#cocina`) | Desktop | `5fef9d5d92824fe4b0a08af0f2b77783` | `kds-screen-desktop.html` / `.png` | `.stitch/crawler-screenshots/kitchen-kds-desktop.png` |
| **KDS Pantalla de Cocina** (`/#cocina`) | Mobile | `202727b044a0452b983a63e2c6c8c13d` | `kds-screen-mobile.html` / `.png` | `.stitch/crawler-screenshots/kitchen-kds-mobile.png` |
| **Carta Digital QR Clientes** (`/#catalog`) | Desktop | `ab03bf23292f44668113595a8ccca5f2` | `catalog-screen-desktop.html` / `.png` | `.stitch/crawler-screenshots/public-catalog-desktop.png` |
| **Carta Digital QR Clientes** (`/#catalog`) | Mobile | `3c306334f63c455d96a7b300fdd25a53` | `catalog-screen-mobile.html` / `.png` | `.stitch/crawler-screenshots/public-catalog-mobile.png` |
| **Portal SaaS & Red Multilocal** (`/#saas`) | Desktop | `35096408e88c44e58301cb6adf0801ee` | `saas-admin-desktop.html` / `.png` | `.stitch/crawler-screenshots/saas-admin-desktop.png` |
| **Portal SaaS & Red Multilocal** (`/#saas`) | Mobile | `14b0725d6cb841269071cc3c1ee11898` | `saas-admin-mobile.html` / `.png` | `.stitch/crawler-screenshots/saas-admin-mobile.png` |
| **Portal Auditoría de Dueño** (`/#dueno`) | Desktop | `422c41af9e944a4c97ccc8848321d1ee` | `owner-audit-desktop.html` / `.png` | `.stitch/crawler-screenshots/owner-audit-desktop.png` |
| **Portal Auditoría de Dueño** (`/#dueno`) | Mobile | `e3285cfc10294d2291b102852dbba537` | `owner-audit-mobile.html` / `.png` | `.stitch/crawler-screenshots/owner-audit-mobile.png` |

---

## 3. Tokens de Color y Superficies

```css
:root {
  --st-bg: #f9f9f8;                    /* Alabastro Cálido Base */
  --st-surface: #ffffff;               /* Tarjetas y Contenedores */
  --st-surface-hover: #f1f1ef;         /* Hover sutil */
  --st-surface-low: #f3f4f3;           /* Barras de herramientas */
  --st-surface-high: #e8e8e7;          /* Separadores */
  --st-border: #e6e6e3;                /* Bordes hairline 1px */
  --st-border-strong: #d0d0cb;         /* Bordes de foco/activos */
  --st-primary: #a43716;               /* Terracota Core */
  --st-primary-container: #c54f2c;     /* Terracota Hover */
  --st-primary-light: #ffdbd1;         /* Badge container suave */
  --st-text-main: #1a1c1c;             /* Obsidiana Profunda */
  --st-text-muted: #5b5e67;            /* Pizarra Muted */
  --st-text-sub: #8c909a;              /* Micro etiquetas */
  --st-emerald: #10b981;               /* Online / Sync 0ms */
  --st-warning: #ea580c;               /* Alerta demora KDS */
  --st-error: #ba1a1a;                 /* SLA Urgente KDS */
}
```

---

## 4. Estándares por Módulo

1. **Terminal POS (Desktop & Mozo Mobile):**
   - Panel izquierdo de catálogo con cards táctiles blancas y botón `+` rápido.
   - Panel derecho de comanda con desglose de ítems, modificadores en tipografía mono y botón protagónico de confirmación en terracota.
2. **KDS Pantalla de Cocina:**
   - Barra superior con selector de estaciones (*Todas, Plancha, Freidora, Armado, Bebidas*) y reloj en vivo.
   - Tickets estructurados con semáforo de tiempo (verde <10m, ámbar 15-20m, rojo urgente >20m).
   - Casillas táctiles para tachar ítems preparados individualmente.
   - Barra inferior fija de "En Fuego" con resumen consolidado de producción.
3. **Carta Digital QR para Clientes:**
   - Portada gastronómica con fotografía de alta definición.
   - Píldoras horizontales de categorías con desplazamiento suave.
   - Drawer flotante inferior en color carbón oscuro (`#1a1c1c`) con total en JetBrains Mono y botón terracota de envío directo por WhatsApp.
4. **Portal SaaS & Métricas Multilocal:**
   - Fila de KPIs ejecutivos (MRR, Comandas Totales, Ahorro Comisiones 35%, SLA KDS).
   - Tabla de alta densidad para auditoría y administración de sucursales.
