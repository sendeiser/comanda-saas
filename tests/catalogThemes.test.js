import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CATALOG_THEMES, getCatalogTheme, applyCatalogTheme } from '../src/data/catalogThemes.js';

describe('Catalog Themes Engine', () => {
  it('defines at least 6 distinct visual themes', () => {
    assert.ok(Array.isArray(CATALOG_THEMES));
    assert.ok(CATALOG_THEMES.length >= 6);
  });

  it('includes required theme keys: retro-burger, neon-cyber, italian-trattoria, bistro-gourmet, warm-cafe, street-fiesta, clean-light', () => {
    const ids = CATALOG_THEMES.map(t => t.id);
    assert.ok(ids.includes('retro-burger'), 'retro-burger should exist');
    assert.ok(ids.includes('neon-cyber'), 'neon-cyber should exist');
    assert.ok(ids.includes('italian-trattoria'), 'italian-trattoria should exist');
    assert.ok(ids.includes('bistro-gourmet'), 'bistro-gourmet should exist');
    assert.ok(ids.includes('warm-cafe'), 'warm-cafe should exist');
    assert.ok(ids.includes('street-fiesta'), 'street-fiesta should exist');
    assert.ok(ids.includes('clean-light'), 'clean-light should exist');
  });

  it('provides safe fallback for unknown or empty theme id', () => {
    const fallbackNull = getCatalogTheme(null);
    assert.strictEqual(fallbackNull.id, 'retro-burger');

    const fallbackUnknown = getCatalogTheme('non-existent-theme-xyz');
    assert.strictEqual(fallbackUnknown.id, 'retro-burger');
  });

  it('each theme provides complete token set including bg, surface, primary, text, and bannerBg', () => {
    for (const t of CATALOG_THEMES) {
      assert.ok(t.name, `${t.id} missing name`);
      assert.ok(t.tokens, `${t.id} missing tokens`);
      assert.ok(t.tokens.bg, `${t.id} missing tokens.bg`);
      assert.ok(t.tokens.surface, `${t.id} missing tokens.surface`);
      assert.ok(t.tokens.primary, `${t.id} missing tokens.primary`);
      assert.ok(t.tokens.text, `${t.id} missing tokens.text`);
      assert.ok(t.tokens.bannerBg, `${t.id} missing tokens.bannerBg`);
    }
  });

  it('correctly sets clean-light as isLight', () => {
    const lightTheme = getCatalogTheme('clean-light');
    assert.strictEqual(lightTheme.isLight, true);
    assert.strictEqual(getCatalogTheme('retro-burger').isLight, false);
  });

  it('adapts surfaces for dark theme when target element has data-theme="light"', () => {
    const props = {};
    const mockEl = {
      getAttribute: (attr) => (attr === 'data-theme' ? 'light' : null),
      style: {
        setProperty: (key, val) => { props[key] = val; }
      }
    };
    applyCatalogTheme('retro-burger', mockEl);
    assert.strictEqual(props['--cat-bg'], '#f9f9f8');
    assert.strictEqual(props['--cat-surface'], '#ffffff');
    assert.strictEqual(props['--cat-text'], '#0f172a');
    assert.strictEqual(props['--cat-red'], '#dc2626'); // Brand primary preserved
  });
});

