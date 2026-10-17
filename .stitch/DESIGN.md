---
name: ComandaFast Luxury Navy & Champagne Gold
colors:
  canvas-navy: "#080d1a"
  surface-navy: "#0d1527"
  surface-elevated: "#131e36"
  surface-hover: "#1a2847"
  gold-champagne: "#d4af37"
  gold-light: "#f3d07a"
  gold-dark: "#b89428"
  titanium-border: "rgba(226, 232, 240, 0.12)"
  titanium-border-hover: "rgba(212, 175, 55, 0.4)"
  text-white: "#ffffff"
  text-sub: "#cbd5e1"
  text-muted: "#94a3b8"
  emerald-success: "#10b981"
  ruby-danger: "#f43f5e"
  sky-accent: "#38bdf8"
typography:
  display: "Outfit, system-ui, -apple-system, sans-serif"
  body: "Plus Jakarta Sans, system-ui, -apple-system, sans-serif"
  mono: "JetBrains Mono, monospace"
---

# Design System: ComandaFast Luxury Navy & Champagne Gold

## 1. Visual Theme & Atmosphere
Un entorno de alta dirección gastronómica y control financiero. Combina la sobriedad y profundidad del azul marino imperial (`#080d1a` / `#0d1527`) con la distinción sutil del oro champagne (`#d4af37` / `#f3d07a`) y bordes de titanio pulido (`rgba(226, 232, 240, 0.12)`).
El resultado proyecta solvencia, precisión operativa y serenidad visual para jornadas intensas de servicio en mostrador, auditoría de dueños y atención a clientes de cuenta corriente.

## 2. Color Palette & Roles
- **Canvas Deep Navy (#080d1a)**: Superficie base de fondo, reduce fatiga visual y proporciona máxima profundidad.
- **Surface Navy (#0d1527)**: Contenedor principal de tarjetas, modales y tablas de datos.
- **Elevated Navy (#131e36)**: Elementos interactivos, bloques de métricas KPI y encabezados de listas.
- **Champagne Gold (#d4af37)**: Acento singular primario. Para acciones principales, precios clave, deudas pendientes y estados activos.
- **Champagne Light (#f3d07a)**: Variación en hover y resplandores focalizados.
- **Titanium Border (rgba(226, 232, 240, 0.12))**: Líneas divisorias estructurales de 1px con precisión micrométrica.
- **Titanium Glow (rgba(212, 175, 55, 0.25))**: Resplandor difuso para elementos recomendados o tarjetas seleccionadas.
- **Crisp Text (#ffffff)**: Títulos principales, valores numéricos destacados.
- **Slate Text (#cbd5e1)**: Descripciones, etiquetas secundarias (contraste > 10:1).
- **Muted Text (#94a3b8)**: Metadatos, notas al pie, marcadores de posición.

## 3. Typography Rules
- **Display & Headlines**: `Outfit` — Pesos 700 a 900. Tracking ajustado (`-0.025em`).
- **Body & Controls**: `Plus Jakarta Sans` — Pesos 500 y 600. Leading relajado (1.6) para lectura fluida.
- **Financial Numbers & Metrics**: `JetBrains Mono` con `font-variant-numeric: tabular-nums` para que los importes monetarios y cálculos no oscilen al actualizarse.

## 4. Component Stylings
- **Buttons**:
  - *Primary Gold*: Fondo degradado sutil `#d4af37` a `#b89428`, texto `#080d1a`, peso 700, sin brillos estridentes.
  - *Secondary Titanium*: Fondo `rgba(255, 255, 255, 0.05)`, borde `rgba(226, 232, 240, 0.15)`, texto `#ffffff`.
  - *Tactile feedback*: `-1px` translate en hover, `+1px` en active.
- **Cards & Modals**:
  - Bordes de titanio de 1px con radio de 16px.
  - Fondo `var(--surface-navy)` con backdrop-filter `blur(16px)` para capas superpuestas.
- **Inputs & Filters**:
  - Fondo `rgba(8, 13, 26, 0.7)`, foco con anillo oro champagne (`outline: 2px solid #d4af37; outline-offset: 2px`).
- **Data Tables (CRM & Fiados)**:
  - Filas alternadas suaves, celdas de números con `tabular-nums font-mono`, badges de saldo (`Al Día` en verde menta, `Con Deuda` en oro champagne).
