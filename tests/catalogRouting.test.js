// tests/catalogRouting.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveStoreFromUrl } from '../src/services/storeService.js';

test('resolveStoreFromUrl parses slug from various URL patterns', () => {
  assert.equal(resolveStoreFromUrl('/carta/pizzeria-roma'), 'pizzeria-roma');
  assert.equal(resolveStoreFromUrl('/carta/don-tito/'), 'don-tito');
  assert.equal(resolveStoreFromUrl('/carta/Hamburguesas-Extremas?ref=qr'), 'hamburguesas-extremas');
  assert.equal(resolveStoreFromUrl('/pos'), null);
  assert.equal(resolveStoreFromUrl('/'), null);
});
