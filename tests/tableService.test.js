// tests/tableService.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidTableTransition,
  generateDefaultTables,
  TABLE_STATUSES
} from '../src/services/tableService.js';

test('isValidTableTransition correctly validates lifecycle transitions', () => {
  assert.equal(isValidTableTransition('free', 'occupied'), true);
  assert.equal(isValidTableTransition('occupied', 'bill_requested'), true);
  assert.equal(isValidTableTransition('bill_requested', 'free'), true);
  assert.equal(isValidTableTransition('occupied', 'free'), true); // Cancelación o liberación directa
  assert.equal(isValidTableTransition('free', 'bill_requested'), false);
  assert.equal(isValidTableTransition('invalid_status', 'free'), false);
});

test('generateDefaultTables generates requested number of tables with free status', () => {
  const tables = generateDefaultTables('store-123', 12);
  assert.equal(tables.length, 12);
  assert.equal(tables[0].tableNumber, 1);
  assert.equal(tables[11].tableNumber, 12);
  assert.ok(tables.every(t => t.status === TABLE_STATUSES.FREE));
  assert.ok(tables.every(t => t.storeId === 'store-123'));
});
