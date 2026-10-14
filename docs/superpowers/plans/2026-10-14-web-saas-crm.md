# Web SaaS & CRM Gastronómico Dual Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the gastronomic platform into a complete Web SaaS system with a Super-Admin Subscription/Abonos CRM and an internal Restaurant Clientes & Fiados CRM.

**Architecture:** Two-tier CRM architecture:
1. `saasCrmService.js` manages platform tenant subscriptions, billing dates, monthly plans, suspension states, and MRR.
2. `customerCrmService.js` manages restaurant diners, debts/fiados balances, payments, and WhatsApp balance notifications.
Unified web access through URL parameters (`?store=slug` and `/carta/:slug`), offline-first storage with Supabase cloud sync.

**Tech Stack:** React 18, Vite, Vanilla CSS Design System, Supabase PostgreSQL, Node.js Native Test Runner (`node --test`).

**Spec:** [docs/superpowers/specs/2026-10-14-web-saas-crm-design.md](file:///d:/Proyecto%20ZEN/ComandaFastBurga/docs/superpowers/specs/2026-10-14-web-saas-crm-design.md)

## Global Constraints
- Node.js ESM format (`type: "module"`) with explicit `.js` extensions on all local imports.
- Zero external UI libraries: vanilla CSS aligned with `:root` dynamic variables.
- Offline-First: all services must function locally and fall back gracefully if Supabase is offline.
- TDD required: write failing unit tests before implementing each service.

## Review Focus
1. Store suspension blocking: suspended store displays friendly advisory without losing access to past data.
2. Fiado order charging: selecting "A Cuenta" accurately debits the customer's balance.
3. Partial debt payments: recording a partial payment decrements `currentBalance` without dropping below 0.
4. WhatsApp link generation: phone numbers are sanitized for `wa.me` links without crashing on special characters.
5. Backward compatibility: existing orders and tables must continue working seamlessly for stores without active CRM records.

---

### Task 1: SaaS Subscriptions & Billing Engine (`saasCrmService.js`)

**Files:**
- Create: `src/services/saasCrmService.js`
- Create: `tests/saasCrmService.test.js`

**Interfaces:**
- Produces: `getSubscriptions(): Promise<StoreSubscription[]>`
- Produces: `recordSubscriptionPayment(storeId, amount, paymentMethod): Promise<StoreSubscription>`
- Produces: `updateSubscriptionStatus(storeId, status): Promise<void>`
- Produces: `calculateSaasMetrics(subscriptions): SaasMetrics`

- [ ] **Step 1: Write failing unit tests for SaaS subscription management**

```javascript
// tests/saasCrmService.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSaasMetrics, recordSubscriptionPaymentSync } from '../src/services/saasCrmService.js';

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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/saasCrmService.test.js`
Expected: FAIL (Cannot find module)

- [ ] **Step 3: Implement `src/services/saasCrmService.js`**

Implement subscription store listing, MRR calculation, payment recording, and status transitions.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/saasCrmService.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/saasCrmService.js tests/saasCrmService.test.js
git commit -m "feat(saas): implement subscription billing engine and metrics service"
```

---

### Task 2: Super-Admin SaaS Web Portal (`SaasAdminPortal.jsx`)

**Files:**
- Create: `src/components/admin/SaasAdminPortal.jsx`
- Modify: `src/App.jsx`

**Interfaces:**
- Accessible at `#saas`, `#superadmin`, or via the Owner Portal.
- Allows registering subscription payments, toggling store suspension, opening store config, and triggering the Onboarding Wizard.

- [ ] **Step 1: Implement `SaasAdminPortal.jsx`**

Create the dashboard with StatCards (MRR, Clientes Activos, Vencidos), stores subscription table, payment collection modal, and WhatsApp contact link to store owner.

- [ ] **Step 2: Connect route `#saas` in `src/App.jsx`**

Add `#saas` routing alongside `#admin` / `#dueno` and render `SaasAdminPortal` when active.

- [ ] **Step 3: Run build to verify compilation**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/admin/SaasAdminPortal.jsx src/App.jsx
git commit -m "feat(saas): add Super-Admin Web Portal for store subscriptions and MRR management"
```

---

### Task 3: Restaurant Customer & Fiados Data Layer (`customerCrmService.js`)

**Files:**
- Create: `src/services/customerCrmService.js`
- Create: `tests/customerCrmService.test.js`

**Interfaces:**
- Produces: `getCustomers(storeId): Promise<Customer[]>`
- Produces: `saveCustomer(storeId, customer): Promise<Customer>`
- Produces: `addCustomerCharge(storeId, customerId, amount, orderId, concept): Promise<Customer>`
- Produces: `recordCustomerPayment(storeId, customerId, amount, method): Promise<Customer>`
- Produces: `generateWhatsAppDebtReminder(customer, storeConfig): { text: string, url: string }`

- [ ] **Step 1: Write failing unit tests for customer CRM and balance calculations**

```javascript
// tests/customerCrmService.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  applyCustomerChargeSync, 
  applyCustomerPaymentSync, 
  generateWhatsAppDebtReminder 
} from '../src/services/customerCrmService.js';

test('applyCustomerChargeSync increments current balance on fiado order', () => {
  const customer = { id: 'c1', name: 'Juan Perez', currentBalance: 5000 };
  const updated = applyCustomerChargeSync(customer, 3500);
  assert.equal(updated.currentBalance, 8500);
});

test('applyCustomerPaymentSync reduces debt accurately', () => {
  const customer = { id: 'c1', name: 'Juan Perez', currentBalance: 8500 };
  const updated = applyCustomerPaymentSync(customer, 5000);
  assert.equal(updated.currentBalance, 3500);
});

test('generateWhatsAppDebtReminder produces polite WhatsApp message with balance', () => {
  const customer = { name: 'Carlos', phone: '3826430159', currentBalance: 12000 };
  const res = generateWhatsAppDebtReminder(customer, { name: 'Pizzería Napoles' });
  assert.ok(res.text.includes('12.000'));
  assert.ok(res.text.includes('Pizzería Napoles'));
  assert.ok(res.url.includes('3826430159'));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/customerCrmService.test.js`
Expected: FAIL

- [ ] **Step 3: Implement `src/services/customerCrmService.js`**

Implement customer listing, saving, charge debit, payment credit, and WhatsApp reminder link generator.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/customerCrmService.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/customerCrmService.js tests/customerCrmService.test.js
git commit -m "feat(crm): implement restaurant diner CRM and fiados balance engine"
```

---

### Task 4: Restaurant Customer & Fiados UI (`CustomerCrmModal.jsx`)

**Files:**
- Create: `src/components/pos/CustomerCrmModal.jsx`
- Modify: `src/components/common/Header.jsx`

**Interfaces:**
- Modal triggered from Header/POS displaying diner directory, debt cards, fast debt collection modal, and WhatsApp statement sender.

- [ ] **Step 1: Implement `CustomerCrmModal.jsx`**

Full modal with search, customer creation/edit, debt balance badges, quick payment modal (Total, 50%, Otro monto), and direct WhatsApp debt reminder button.

- [ ] **Step 2: Connect CRM button in `src/components/common/Header.jsx`**

Add `👥 Clientes & Fiados` button to header navigation to open the CRM modal.

- [ ] **Step 3: Run build to verify compilation**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/pos/CustomerCrmModal.jsx src/components/common/Header.jsx
git commit -m "feat(crm): add customer directory and fiados debt manager modal"
```

---

### Task 5: POS "A Cuenta / Fiado" Payment Method Integration

**Files:**
- Modify: `src/components/pos/PaymentModal.jsx`
- Modify: `src/components/pos/FastOrderPad.jsx`

**Interfaces:**
- Adds 5th payment method "A Cuenta / Fiado" in checkout.
- Allows picking existing customer or creating one on the fly.
- Automatically debits order total to customer's account balance upon completion.

- [ ] **Step 1: Modify `PaymentModal.jsx`**

Add "A Cuenta / Fiado" button with customer selector and balance preview.

- [ ] **Step 2: Modify `FastOrderPad.jsx`**

When order completes with `paymentMethod === 'a_cuenta'`, call `addCustomerCharge` to update the customer's balance.

- [ ] **Step 3: Run tests and build**

Run: `npm test; npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/components/pos/PaymentModal.jsx src/components/pos/FastOrderPad.jsx
git commit -m "feat(pos): integrate 'A Cuenta / Fiado' payment method with customer CRM"
```

---

### Task 6: Automated Verification and Documentation Update

**Files:**
- Modify: `scripts/verify_white_label.mjs`
- Modify: `README.md`

- [ ] **Step 1: Update `scripts/verify_white_label.mjs`**

Add checks for `saasCrmService.js`, `customerCrmService.js`, `SaasAdminPortal.jsx`, and `CustomerCrmModal.jsx`.

- [ ] **Step 2: Run verification script**

Run: `node scripts/verify_white_label.mjs`
Expected: 100% OK

- [ ] **Step 3: Update `README.md`**

Document the Super-Admin SaaS CRM and the Restaurant Fiados CRM.

- [ ] **Step 4: Commit**

```bash
git add scripts/verify_white_label.mjs README.md
git commit -m "chore: verify complete SaaS and CRM features and update documentation"
```
