// src/services/customerCrmService.js
import { supabaseSync } from './supabaseClient.js';

export const CUSTOMERS_STORAGE_PREFIX = 'comandafast_crm_';

/**
 * Pure function: increments balance when a fiado order is placed.
 * @param {Object} customer 
 * @param {number} amount 
 * @param {string} [orderId] 
 * @param {string} [concept] 
 * @returns {Object}
 */
export function applyCustomerChargeSync(customer, amount, orderId = null, concept = 'Comanda a cuenta') {
  const charge = Number(amount) || 0;
  const prevBalance = Number(customer.currentBalance) || 0;
  const newBalance = prevBalance + charge;
  const ledger = Array.isArray(customer.ledger) ? [...customer.ledger] : [];

  ledger.unshift({
    id: `chg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'charge',
    amount: charge,
    orderId,
    concept,
    date: new Date().toISOString(),
    balanceAfter: newBalance
  });

  return {
    ...customer,
    currentBalance: newBalance,
    totalOrdersCount: (Number(customer.totalOrdersCount) || 0) + 1,
    lastOrderAt: new Date().toISOString(),
    ledger,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Pure function: decrements balance when payment is recorded.
 * @param {Object} customer 
 * @param {number} amount 
 * @param {string} [method] 
 * @param {string} [note] 
 * @returns {Object}
 */
export function applyCustomerPaymentSync(customer, amount, method = 'efectivo', note = 'Pago de cuenta corriente') {
  const payment = Number(amount) || 0;
  const prevBalance = Number(customer.currentBalance) || 0;
  const newBalance = Math.max(0, prevBalance - payment);
  const ledger = Array.isArray(customer.ledger) ? [...customer.ledger] : [];

  ledger.unshift({
    id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: 'payment',
    amount: payment,
    method,
    concept: note,
    date: new Date().toISOString(),
    balanceAfter: newBalance
  });

  return {
    ...customer,
    currentBalance: newBalance,
    lastPaymentAt: new Date().toISOString(),
    ledger,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Formats polite WhatsApp reminder for pending debt.
 * @param {Object} customer 
 * @param {Object} [storeConfig] 
 * @returns {{ text: string, url: string }}
 */
export function generateWhatsAppDebtReminder(customer, storeConfig = {}) {
  const cleanPhone = (customer.phone || '').replace(/\D/g, '');
  const storeName = storeConfig.name || 'Comanda Gastronómica';
  const balanceStr = Number(customer.currentBalance || 0).toLocaleString('es-AR');

  const text = `Hola ${customer.name || 'amigo/a'}, ¿cómo estás? Te escribimos de *${storeName}* 🍽️

Queríamos acercarte el detalle de tu saldo pendiente en cuenta corriente:
💰 *Total acumulado:* $${balanceStr}

Podés abonar en el local o mediante transferencia. Avisanos cualquier duda y con gusto te pasamos los datos. ¡Muchas gracias por elegirnos siempre!`;

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  return { text, url };
}

/**
 * Generates sample customer directory for initial use.
 * @param {string} storeId 
 * @returns {Array<Object>}
 */
export function generateDefaultCustomers(storeId = 'default') {
  const now = new Date();
  return [
    {
      id: `cust_${storeId}_1`,
      storeId,
      name: 'Carlos Gómez',
      phone: '3826 43-0159',
      address: 'Barrio Centro, Calle Belgrano 410',
      notes: 'Cliente habitual de los viernes. Pide delivery.',
      currentBalance: 12500,
      totalOrdersCount: 6,
      lastOrderAt: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
      ledger: [
        {
          id: 'chg-init-1',
          type: 'charge',
          amount: 12500,
          concept: 'Pedido Doble Burger + Papas',
          date: new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000)).toISOString(),
          balanceAfter: 12500
        }
      ],
      createdAt: now.toISOString()
    },
    {
      id: `cust_${storeId}_2`,
      storeId,
      name: 'Lucía Fernández',
      phone: '3826 41-8899',
      address: 'Av. San Martín 120 (Depto 2B)',
      notes: 'Pasa a retirar por mostrador.',
      currentBalance: 0,
      totalOrdersCount: 4,
      lastOrderAt: new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString(),
      ledger: [],
      createdAt: now.toISOString()
    }
  ];
}

/**
 * Loads all customers for a given store.
 * @param {string} storeId 
 * @returns {Promise<Array<Object>>}
 */
export async function getCustomers(storeId = 'default') {
  const key = `${CUSTOMERS_STORAGE_PREFIX}${storeId}`;
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
  }

  const defaults = generateDefaultCustomers(storeId);
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(defaults));
    } catch {}
  }
  return defaults;
}

/**
 * Saves customer list for a store and notifies listeners.
 * @param {string} storeId 
 * @param {Array<Object>} customers 
 */
export async function saveCustomers(storeId, customers) {
  const key = `${CUSTOMERS_STORAGE_PREFIX}${storeId}`;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(customers));
    } catch (err) {
      console.warn('Error saving customers locally:', err);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('comandafast:customers_updated', { detail: { storeId, customers } }));
  }
}

/**
 * Adds or edits a customer in the store directory.
 * @param {string} storeId 
 * @param {Object} customerData 
 * @returns {Promise<Object>}
 */
export async function saveCustomer(storeId, customerData) {
  const customers = await getCustomers(storeId);
  const existingIdx = customers.findIndex(c => c.id === customerData.id);

  if (existingIdx !== -1) {
    customers[existingIdx] = {
      ...customers[existingIdx],
      ...customerData,
      updatedAt: new Date().toISOString()
    };
    await saveCustomers(storeId, customers);
    return customers[existingIdx];
  } else {
    const newCust = {
      id: customerData.id || `cust_${storeId}_${Date.now()}`,
      storeId,
      name: customerData.name || 'Cliente',
      phone: customerData.phone || '',
      address: customerData.address || '',
      notes: customerData.notes || '',
      currentBalance: Number(customerData.currentBalance) || 0,
      totalOrdersCount: 0,
      lastOrderAt: null,
      ledger: [],
      createdAt: new Date().toISOString()
    };
    const nextList = [newCust, ...customers];
    await saveCustomers(storeId, nextList);
    return newCust;
  }
}

/**
 * Debits an order amount to a customer's balance.
 * @param {string} storeId 
 * @param {string} customerId 
 * @param {number} amount 
 * @param {string} [orderId] 
 * @param {string} [concept] 
 * @returns {Promise<Object>}
 */
export async function addCustomerCharge(storeId, customerId, amount, orderId = null, concept = 'Comanda a cuenta') {
  const customers = await getCustomers(storeId);
  const idx = customers.findIndex(c => c.id === customerId);
  if (idx === -1) throw new Error(`Cliente no encontrado: ${customerId}`);

  const updated = applyCustomerChargeSync(customers[idx], amount, orderId, concept);
  customers[idx] = updated;
  await saveCustomers(storeId, customers);
  return updated;
}

/**
 * Credits a payment to a customer's balance.
 * @param {string} storeId 
 * @param {string} customerId 
 * @param {number} amount 
 * @param {string} [method] 
 * @param {string} [note] 
 * @returns {Promise<Object>}
 */
export async function recordCustomerPayment(storeId, customerId, amount, method = 'efectivo', note = 'Cobro de fiado') {
  const customers = await getCustomers(storeId);
  const idx = customers.findIndex(c => c.id === customerId);
  if (idx === -1) throw new Error(`Cliente no encontrado: ${customerId}`);

  const updated = applyCustomerPaymentSync(customers[idx], amount, method, note);
  customers[idx] = updated;
  await saveCustomers(storeId, customers);
  return updated;
}
