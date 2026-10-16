# Catalog Multi-Themes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a comprehensive, dynamic multi-theme system for the public digital catalog (`CatalogPage.jsx`), providing the store owner and end customers with a rich palette of varied visual styles tailored to different restaurant concepts (Retro Smash Burger, Cyber Neon, Trattoria Italiana, Bistro Gourmet, Warm Cafe/Brunch, Street Food Fiesta, and Fresh Clean Light).

**Architecture:** 
- Centralized theme catalog in `src/data/catalogThemes.js` with structured tokens (backgrounds, surfaces, primary/accent colors, banner textures/gradients, font pairings, contrast ratios).
- Dynamic CSS theme rules in `src/styles/catalog.css` driven by `data-cat-theme="[id]"` attributes and CSS custom properties on `.catalog-app`.
- Interactive live Theme Selector in `CatalogPage.jsx` allowing instant live preview and admin default-setting capability, plus POS integration in `SettingsModal.jsx`.

**Tech Stack:** React 18, CSS Custom Properties, Vanilla CSS, Lucide React icons, localStorage persistence, Vitest / Node test runner.

**Spec:** Direct user request: *"quiero que crees varios temas al caltalogo para que el cliente tenga opciones variadas del mismo"*.

## Global Constraints
- Must look visually stunning and premium on both desktop and mobile viewports.
- Light and dark themes must maintain WCAG AA contrast for text and prices (never illegible white-on-white or dark-on-dark).
- All changes must be 100% backward-compatible: existing stores default to `retro-burger` without breaking existing custom brand colors or logos.
- Store owner's selection must persist in `storageService.getSettings().catalog_theme` and propagate immediately without page reloads.

## Review Focus
1. Switching theme in real-time must immediately re-render banner, sticky nav, product cards, modals, and floating cart without page reload.
2. Light mode theme (`clean-light`) must ensure product names, descriptions, prices, and search inputs have high-contrast dark text and clean surfaces.
3. Custom uploaded store banner images must still be respected if present, gracefully overlaying or adapting to the selected theme.
4. Product Modal, Information Modal, Category Drawer, and Checkout views must adopt the active theme variables seamlessly.
5. URL query or store slug changes must load the store's configured default theme, but allow temporary preview switching if the customer opens the theme selector.

---

### Task 1: Catalog Themes Engine & Preset Definitions

**Files:**
- Create: `src/data/catalogThemes.js`
- Create: `tests/unit/catalogThemes.spec.js`

**Interfaces:**
- Produces: `CATALOG_THEMES` array, `getCatalogTheme(themeId)`, `applyCatalogThemeToElement(element, themeId)`

- [ ] **Step 1: Write the unit test for catalog themes**
```javascript
// tests/unit/catalogThemes.spec.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CATALOG_THEMES, getCatalogTheme } from '../../src/data/catalogThemes.js';

describe('Catalog Themes Engine', () => {
  it('defines at least 6 distinct visual themes', () => {
    assert.ok(CATALOG_THEMES.length >= 6);
  });

  it('includes required theme keys: retro-burger, neon-cyber, italian-trattoria, bistro-gourmet, warm-cafe, street-fiesta, clean-light', () => {
    const ids = CATALOG_THEMES.map(t => t.id);
    assert.ok(ids.includes('retro-burger'));
    assert.ok(ids.includes('neon-cyber'));
    assert.ok(ids.includes('italian-trattoria'));
    assert.ok(ids.includes('bistro-gourmet'));
    assert.ok(ids.includes('clean-light'));
  });

  it('provides safe fallback for unknown theme id', () => {
    const fallback = getCatalogTheme('unknown-theme-xyz');
    assert.strictEqual(fallback.id, 'retro-burger');
  });

  it('each theme provides complete token set including bg, surface, primary, text, and banner', () => {
    for (const t of CATALOG_THEMES) {
      assert.ok(t.tokens.bg, `${t.id} missing bg`);
      assert.ok(t.tokens.surface, `${t.id} missing surface`);
      assert.ok(t.tokens.primary, `${t.id} missing primary`);
      assert.ok(t.tokens.text, `${t.id} missing text`);
      assert.ok(t.tokens.bannerBg, `${t.id} missing bannerBg`);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `node --test tests/unit/catalogThemes.spec.js`
Expected: FAIL (module not found)

- [ ] **Step 3: Implement `src/data/catalogThemes.js`**
Define `CATALOG_THEMES` with rich design tokens, banner styles (e.g. classic damero, cyber glowing grid, italian flag/stripes, luxury slate, cozy latte warm tones, neon graffiti, clean white gourmet), font styles, and helper functions.

- [ ] **Step 4: Run test to verify it passes**
Run: `node --test tests/unit/catalogThemes.spec.js`
Expected: PASS

- [ ] **Step 5: Verify all unit tests pass**
Run: `npm test`
Expected: All tests PASS

---

### Task 2: Dynamic CSS Theming System in `catalog.css`

**Files:**
- Modify: `src/styles/catalog.css`

**Interfaces:**
- Consumes: Theme token variables defined in `src/data/catalogThemes.js`
- Produces: Scoped styles on `.catalog-app[data-cat-theme="..."]` and dynamic root tokens `--cat-*`

- [ ] **Step 1: Inspect and update variable references in `src/styles/catalog.css`**
Replace hardcoded `#dc2626`, `#ef4444`, `#b91c1c`, `#141416`, and fixed black backgrounds with `--cat-primary`, `--cat-primary-hover`, `--cat-primary-glow`, `--cat-surface`, `--cat-surface-2`, `--cat-text`, `--cat-text-muted`, and `--cat-banner-bg`.

- [ ] **Step 2: Add theme-specific modifiers for each preset**
Add dedicated attribute blocks:
- `.catalog-app[data-cat-theme="retro-burger"]`
- `.catalog-app[data-cat-theme="neon-cyber"]`
- `.catalog-app[data-cat-theme="italian-trattoria"]`
- `.catalog-app[data-cat-theme="bistro-gourmet"]`
- `.catalog-app[data-cat-theme="warm-cafe"]`
- `.catalog-app[data-cat-theme="street-fiesta"]`
- `.catalog-app[data-cat-theme="clean-light"]`

- [ ] **Step 3: Test light mode specific styling in `catalog.css`**
Ensure that `.catalog-app[data-cat-theme="clean-light"]` uses light background, crisp dark text `#0f172a`, subtle shadows, clean gray card borders `#e2e8f0`, and high-contrast inputs.

- [ ] **Step 4: Verify syntax and build integrity**
Run: `npm test`
Expected: PASS

---

### Task 3: Interactive Theme Selector & Live Preview in `CatalogPage.jsx`

**Files:**
- Create: `src/components/catalog/CatalogThemeModal.jsx`
- Modify: `src/pages/CatalogPage.jsx`

**Interfaces:**
- Consumes: `CATALOG_THEMES`, `getCatalogTheme` from `src/data/catalogThemes.js`
- Produces: Theme selector button in catalog header/sticky bar, modal with preview cards, instant live theme switching and persistence.

- [ ] **Step 1: Create `src/components/catalog/CatalogThemeModal.jsx`**
Build a modern modal displaying all catalog themes with:
- Thumbnail preview with color swatch badges and icon
- "Activo" indicator
- Live click-to-preview
- "Guardar como tema oficial de mi local" button (calls `onSaveDefaultTheme(themeId)`)
- Close button and smooth entrance animation

- [ ] **Step 2: Integrate theme state and modal in `src/pages/CatalogPage.jsx`**
- Load active theme from `settings.catalog_theme` or `localStorage.getItem('comandafast_catalog_preview_theme')` or `'retro-burger'`.
- Apply `data-cat-theme={activeThemeId}` to the top `.catalog-app` container and inject theme CSS variables.
- Add a discreet "🎨 Estilos de Carta" floating pill or header action button.
- Implement theme change handler and save default handler.

- [ ] **Step 3: Test modal rendering and theme switching**
Verify that selecting each theme updates `data-cat-theme` and transforms the catalog in real-time.

---

### Task 4: Store Owner Theme Configuration in POS Settings (`SettingsModal.jsx`)

**Files:**
- Modify: `src/components/pos/SettingsModal.jsx`

**Interfaces:**
- Consumes: `CATALOG_THEMES` from `src/data/catalogThemes.js`
- Produces: Visual theme selector inside the Brand Identity section of Settings

- [ ] **Step 1: Add "Tema de la Carta Digital" section to `SettingsModal.jsx`**
Display the available catalog themes as interactive cards with icon, title, description, and miniature color swatches.
Allow the store owner to select their favorite default theme for their catalog link.

- [ ] **Step 2: Bind to `form.catalog_theme` and save to `storageService`**
Ensure `form.catalog_theme` is included when `onSaveSettings(form)` is executed and triggers the `comandafast:settings_updated` event.

- [ ] **Step 3: Verify POS Settings integration**
Run tests to confirm `SettingsModal` compiles cleanly without regression.

---

### Task 5: End-to-End Verification & Visual Proof

**Files:**
- Verification: Browser subagent / screenshot testing on `http://localhost:5173/#catalog`

- [ ] **Step 1: Run all unit tests**
Run: `npm test`
Expected: 25+ tests PASS

- [ ] **Step 2: Open catalog in browser and test each theme preset**
Verify visual appearance of:
- Retro Smash Burger (Classic Red/White Damero)
- Cyber Neon (Midnight Obsidian with Amber Glow)
- Italian Trattoria (Basil & Ruby Rust)
- Bistro Gourmet (Monochrome Slate & Champagne Gold)
- Clean Light (Minimalist White & Emerald)

- [ ] **Step 3: Capture screenshot artifacts**
Save screenshots demonstrating the variety of themes for the user.
