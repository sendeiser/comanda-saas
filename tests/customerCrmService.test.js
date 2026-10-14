// tests/customerCrmService.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  applyCustomerChargeSync, 
  applyCustomerPaymentSync, 
  generateWhatsAppDebtReminder 
} from '../src/services/customerCrmService.js';

test('applyCustomerChargeSync increments current balance on fiado order', () => {
  const customer = { id: 'c1', name: 'Juan Perez', currentBalance: 5000, totalOrdersCount: 2 };
  const updated = applyCustomerChargeSync(customer, 3500, 'ord-101', 'Comanda #101 Mostrador');
  assert.equal(updated.currentBalance, 8500);
  assert.equal(updated.totalOrdersCount, 3);
  assert.ok(Array.isArray(updated.ledger));
  assert.equal(updated.ledger.length, 1);
  assert.equal(updated.ledger[0].amount, 3500);
  assert.equal(updated.ledger[0].type, 'charge');
});

test('applyCustomerPaymentSync reduces debt accurately without falling below 0', () => {
  const customer = { 
    id: 'c1', 
    name: 'Juan Perez', 
    currentBalance: 8500,
    ledger: [] 
  };
  const updated = applyCustomerPaymentSync(customer, 5000, 'efectivo', 'Pago a cuenta en caja');
  assert.equal(updated.currentBalance, 3500);
  assert.equal(updated.ledger.length, 1);
  assert.equal(updated.ledger[0].amount, 5000);
  assert.equal(updated.ledger[0].type, 'payment');

  // Overpayment clamping test
  const overpaid = applyCustomerPaymentSync(updated, 10000, 'transferencia');
  assert.equal(overpaid.currentBalance, 0);
});

test('generateWhatsAppDebtReminder produces polite WhatsApp message with balance', () => {
  const customer = { name: 'Carlos Gomez', phone: '3826 43-0159', currentBalance: 12500 };
  const res = generateWhatsAppDebtReminder(customer, { name: 'Pizzería Nápoles' });
  assert.ok(res.text.includes('12.500'));
  assert.ok(res.text.includes('Pizzería Nápoles'));
  assert.ok(res.text.includes('Carlos Gomez'));
  assert.ok(res.url.includes('3826430159'));
});
