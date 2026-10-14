// tests/saasCrmService.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  calculateSaasMetrics, 
  calculateSubscriptionStatus, 
  recordSubscriptionPaymentSync,
  DEFAULT_SAAS_PLANS 
} from '../src/services/saasCrmService.js';

test('calculateSaasMetrics calculates MRR and status counts correctly', () => {
  const subs = [
    { storeId: '1', plan: 'pro', monthlyFee: 25000, status: 'al_dia' },
    { storeId: '2', plan: 'full', monthlyFee: 40000, status: 'al_dia' },
    { storeId: '3', plan: 'basico', monthlyFee: 15000, status: 'vencido' }
  ];
  const metrics = calculateSaasMetrics(subs);
  assert.equal(metrics.mrr, 80000);
  assert.equal(metrics.activeCount, 2);
  assert.equal(metrics.overdueCount, 1);
  assert.equal(metrics.totalStores, 3);
});

test('calculateSubscriptionStatus evaluates due date relative to reference date', () => {
  const refDate = new Date('2026-10-14T00:00:00Z');
  
  // Due in 15 days -> al_dia
  const sub1 = { nextDueDate: '2026-10-29T00:00:00Z', isManuallySuspended: false };
  assert.equal(calculateSubscriptionStatus(sub1, refDate), 'al_dia');

  // Due in 2 days -> por_vencer
  const sub2 = { nextDueDate: '2026-10-16T00:00:00Z', isManuallySuspended: false };
  assert.equal(calculateSubscriptionStatus(sub2, refDate), 'por_vencer');

  // Past due -> vencido
  const sub3 = { nextDueDate: '2026-10-10T00:00:00Z', isManuallySuspended: false };
  assert.equal(calculateSubscriptionStatus(sub3, refDate), 'vencido');

  // Manually suspended -> suspendido
  const sub4 = { nextDueDate: '2026-10-29T00:00:00Z', isManuallySuspended: true };
  assert.equal(calculateSubscriptionStatus(sub4, refDate), 'suspendido');
});

test('recordSubscriptionPaymentSync extends nextDueDate by 30 days and sets status al_dia', () => {
  const sub = {
    storeId: 'demo-1',
    monthlyFee: 25000,
    status: 'vencido',
    nextDueDate: '2026-10-10T00:00:00.000Z',
    isManuallySuspended: true
  };

  const updated = recordSubscriptionPaymentSync(sub, 25000, '2026-10-14T12:00:00.000Z');
  assert.equal(updated.status, 'al_dia');
  assert.equal(updated.isManuallySuspended, false);
  assert.equal(updated.lastPaymentAmount, 25000);
  assert.ok(new Date(updated.nextDueDate) > new Date('2026-11-01'));
});

test('DEFAULT_SAAS_PLANS provides standard tiers', () => {
  assert.ok(DEFAULT_SAAS_PLANS.basico);
  assert.ok(DEFAULT_SAAS_PLANS.pro);
  assert.ok(DEFAULT_SAAS_PLANS.full);
});
