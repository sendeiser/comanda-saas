// tests/themeService.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { getContrastingTextColor, normalizeTheme, DEFAULT_THEME } from '../src/services/themeService.js';

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
