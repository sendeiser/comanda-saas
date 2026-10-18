// tests/themeService.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  getContrastingTextColor, 
  normalizeTheme, 
  DEFAULT_THEME,
  hexToRgb,
  adjustBrightness,
  rgbaFromHex,
  applyStoreTheme
} from '../src/services/themeService.js';

test('hexToRgb parses hex colors correctly', () => {
  assert.deepEqual(hexToRgb('#ffffff'), { r: 255, g: 255, b: 255 });
  assert.deepEqual(hexToRgb('#000000'), { r: 0, g: 0, b: 0 });
  assert.deepEqual(hexToRgb('#f59e0b'), { r: 245, g: 158, b: 11 });
  assert.deepEqual(hexToRgb('#f00'), { r: 255, g: 0, b: 0 });
  assert.equal(hexToRgb('invalid'), null);
});

test('adjustBrightness adjusts color intensity correctly', () => {
  const darkened = adjustBrightness('#ffffff', -20);
  assert.equal(darkened, '#cccccc');
  const brightened = adjustBrightness('#000000', 50);
  assert.equal(brightened, '#000000'); // 0 * 1.5 = 0
  const shifted = adjustBrightness('#10b981', 10);
  assert.match(shifted, /^#[0-9a-f]{6}$/i);
});

test('rgbaFromHex formats valid rgba strings', () => {
  assert.equal(rgbaFromHex('#ffffff', 0.5), 'rgba(255, 255, 255, 0.5)');
  assert.equal(rgbaFromHex('#f59e0b', 0.28), 'rgba(245, 158, 11, 0.28)');
});

test('getContrastingTextColor returns white for dark backgrounds and black for light backgrounds', () => {
  assert.equal(getContrastingTextColor('#000000'), '#ffffff');
  assert.equal(getContrastingTextColor('#ffffff'), '#000000');
  assert.equal(getContrastingTextColor('#0b0f19'), '#ffffff');
  assert.equal(getContrastingTextColor('#fef08a'), '#000000');
});

test('normalizeTheme fills default fallbacks when properties are missing', () => {
  const normalized = normalizeTheme({});
  assert.equal(normalized.primaryColor, DEFAULT_THEME.primaryColor);
  assert.equal(normalized.accentColor, DEFAULT_THEME.accentColor);
  assert.equal(normalized.bgDark, DEFAULT_THEME.bgDark);
});

test('normalizeTheme preserves custom properties when provided', () => {
  const custom = {
    primaryColor: '#e11d48',
    accentColor: '#fb7185',
    bgDark: '#0f172a'
  };
  const normalized = normalizeTheme(custom);
  assert.equal(normalized.primaryColor, '#e11d48');
  assert.equal(normalized.accentColor, '#fb7185');
  assert.equal(normalized.bgDark, '#0f172a');
});

test('applyStoreTheme sets custom CSS properties on document.documentElement', () => {
  const properties = {};
  globalThis.document = {
    documentElement: {
      style: {
        setProperty: (key, val) => {
          properties[key] = val;
        }
      }
    }
  };

  applyStoreTheme({ primaryColor: '#3b82f6', accentColor: '#10b981' });

  assert.equal(properties['--brand-primary'], '#3b82f6');
  assert.equal(properties['--accent-amber'], '#3b82f6');
  assert.equal(properties['--cat-primary'], '#3b82f6');
  assert.equal(properties['--cat-red'], '#3b82f6');
  assert.equal(properties['--st-primary'], '#3b82f6');
  assert.equal(properties['--border-focus'], '#3b82f6');
  assert.ok(properties['--amber-gradient'].includes('#3b82f6'));
  assert.ok(properties['--brand-primary-light'].includes('rgba(59, 130, 246'));

  delete globalThis.document;
});

