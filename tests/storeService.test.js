// tests/storeService.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizeSlug,
  validateStoreConfig,
  resolveStoreFromUrl,
  DEFAULT_DEMO_STORE
} from '../src/services/storeService.js';

test('sanitizeSlug converts company names into valid web slugs', () => {
  assert.equal(sanitizeSlug('Pizzería & Empanadas Don Tito!'), 'pizzeria-empanadas-don-tito');
  assert.equal(sanitizeSlug('La Farola 24hs'), 'la-farola-24hs');
  assert.equal(sanitizeSlug('  Hamburguesas   del   Sur  '), 'hamburguesas-del-sur');
  assert.equal(sanitizeSlug('Bar & Café 100%'), 'bar-cafe-100');
});

test('validateStoreConfig ensures required fields are present and valid', () => {
  const valid = validateStoreConfig({ name: 'Don Tito', slug: 'don-tito' });
  assert.equal(valid.isValid, true);
  assert.equal(valid.errors.length, 0);

  const invalidName = validateStoreConfig({ name: '', slug: 'don-tito' });
  assert.equal(invalidName.isValid, false);
  assert.ok(invalidName.errors.some(e => e.includes('nombre')));

  const invalidSlug = validateStoreConfig({ name: 'Don Tito', slug: 'Don Tito Invalido!' });
  assert.equal(invalidSlug.isValid, false);
  assert.ok(invalidSlug.errors.some(e => e.includes('slug')));
});

test('resolveStoreFromUrl parses slug from pathname correctly', () => {
  assert.equal(resolveStoreFromUrl('/carta/pizzeria-roma'), 'pizzeria-roma');
  assert.equal(resolveStoreFromUrl('/carta/don-tito/'), 'don-tito');
  assert.equal(resolveStoreFromUrl('/carta/bar-123/mesa/4'), 'bar-123');
  assert.equal(resolveStoreFromUrl('/pos'), null);
  assert.equal(resolveStoreFromUrl('/admin'), null);
  assert.equal(resolveStoreFromUrl('/'), null);
});

test('DEFAULT_DEMO_STORE contains baseline properties', () => {
  assert.ok(DEFAULT_DEMO_STORE.id);
  assert.ok(DEFAULT_DEMO_STORE.name);
  assert.ok(DEFAULT_DEMO_STORE.slug);
  assert.ok(DEFAULT_DEMO_STORE.theme);
});
