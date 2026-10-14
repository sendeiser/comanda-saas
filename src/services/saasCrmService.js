// src/services/saasCrmService.js
import { supabaseSync } from './supabaseClient.js';

export const SAAS_SUBSCRIPTIONS_STORAGE_KEY = 'comandafast_saas_subscriptions';

export const DEFAULT_SAAS_PLANS = {
  basico: {
    id: 'basico',
    name: 'Plan Básico',
    monthlyFee: 18000,
    features: ['POS Mostrador', 'Catálogo Digital Web', 'Tickets Térmicos 58/80mm']
  },
  pro: {
    id: 'pro',
    name: 'Plan Pro Gastronómico',
    monthlyFee: 28000,
    features: ['Todo lo del Básico', 'Módulo de Salón & Mesas', 'Bot de WhatsApp Local', 'Pantalla KDS Cocina']
  },
  full: {
    id: 'full',
    name: 'Plan Full Franquicia',
    monthlyFee: 38000,
    features: ['Todo lo del Pro', 'CRM de Clientes & Fiados', 'Múltiples Cajas', 'Soporte Prioritario']
  }
};

/**
 * Calculates current status based on nextDueDate and manual suspension.
 * @param {Object} sub 
 * @param {Date|string} [referenceDate] 
 * @returns {'al_dia' | 'por_vencer' | 'vencido' | 'suspendido'}
 */
export function calculateSubscriptionStatus(sub, referenceDate = new Date()) {
  if (sub.isManuallySuspended) return 'suspendido';
  if (!sub.nextDueDate) return 'al_dia';

  const ref = new Date(referenceDate).getTime();
  const due = new Date(sub.nextDueDate).getTime();
  const diffDays = Math.ceil((due - ref) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'vencido';
  if (diffDays <= 5) return 'por_vencer';
  return 'al_dia';
}

/**
 * Pure helper to extend due date and mark al_dia upon payment.
 * @param {Object} sub 
 * @param {number} amount 
 * @param {string} [paymentDate] 
 * @returns {Object}
 */
export function recordSubscriptionPaymentSync(sub, amount, paymentDate = new Date().toISOString()) {
  const currentDue = sub.nextDueDate ? new Date(sub.nextDueDate) : new Date(paymentDate);
  const baseDate = currentDue > new Date(paymentDate) ? currentDue : new Date(paymentDate);
  const nextDate = new Date(baseDate.getTime() + (30 * 24 * 60 * 60 * 1000));

  return {
    ...sub,
    status: 'al_dia',
    isManuallySuspended: false,
    lastPaymentDate: paymentDate,
    lastPaymentAmount: Number(amount) || sub.monthlyFee,
    nextDueDate: nextDate.toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Calculates MRR and count summaries from a list of subscriptions.
 * @param {Array<Object>} subscriptions 
 * @returns {{ mrr: number, activeCount: number, overdueCount: number, totalStores: number }}
 */
export function calculateSaasMetrics(subscriptions = []) {
  let mrr = 0;
  let activeCount = 0;
  let overdueCount = 0;

  for (const sub of subscriptions) {
    const fee = Number(sub.monthlyFee) || 0;
    mrr += fee;
    if (sub.status === 'al_dia' || sub.status === 'por_vencer') {
      activeCount++;
    } else if (sub.status === 'vencido' || sub.status === 'suspendido') {
      overdueCount++;
    }
  }

  return {
    mrr,
    activeCount,
    overdueCount,
    totalStores: subscriptions.length
  };
}

/**
 * Generates initial demo subscriptions if none exist.
 */
export function generateDefaultSubscriptions() {
  const now = new Date();
  const next30 = new Date(now.getTime() + (25 * 24 * 60 * 60 * 1000)).toISOString();
  const next5 = new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)).toISOString();

  return [
    {
      storeId: 'demo',
      storeName: 'ComandaFast Demo',
      slug: 'demo',
      ownerName: 'Martín Dueño',
      ownerPhone: '3826430159',
      plan: 'full',
      monthlyFee: 38000,
      billingDay: 10,
      status: 'al_dia',
      isManuallySuspended: false,
      lastPaymentDate: now.toISOString(),
      lastPaymentAmount: 38000,
      nextDueDate: next30,
      createdAt: now.toISOString()
    },
    {
      storeId: 'pizzeria-napoles',
      storeName: 'Pizzería Nápoles',
      slug: 'pizzeria-napoles',
      ownerName: 'Franco Rossi',
      ownerPhone: '3826401122',
      plan: 'pro',
      monthlyFee: 28000,
      billingDay: 15,
      status: 'por_vencer',
      isManuallySuspended: false,
      lastPaymentDate: new Date(now.getTime() - (27 * 24 * 60 * 60 * 1000)).toISOString(),
      lastPaymentAmount: 28000,
      nextDueDate: next5,
      createdAt: now.toISOString()
    }
  ];
}

/**
 * Loads all subscriptions from local storage or defaults.
 * @returns {Promise<Array<Object>>}
 */
export async function getSubscriptions() {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(SAAS_SUBSCRIPTIONS_STORAGE_KEY);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          // Re-calculate statuses dynamically based on current date
          const now = new Date();
          return list.map(s => ({
            ...s,
            status: calculateSubscriptionStatus(s, now)
          }));
        }
      }
    } catch {}
  }

  const defaults = generateDefaultSubscriptions();
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(SAAS_SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(defaults));
    } catch {}
  }
  return defaults;
}

/**
 * Saves subscriptions list locally and emits window event.
 * @param {Array<Object>} subs 
 */
export async function saveSubscriptions(subs) {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(SAAS_SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(subs));
    } catch (err) {
      console.warn('Error saving subscriptions locally:', err);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('comandafast:saas_subscriptions_updated', { detail: { subscriptions: subs } }));
  }
}

/**
 * Records a payment for a store subscription.
 * @param {string} storeId 
 * @param {number} amount 
 * @param {string} [method] 
 * @returns {Promise<Object>}
 */
export async function recordSubscriptionPayment(storeId, amount, method = 'transferencia') {
  const list = await getSubscriptions();
  const idx = list.findIndex(s => s.storeId === storeId || s.slug === storeId);
  if (idx === -1) throw new Error(`No se encontró la tienda con ID ${storeId}`);

  const updated = recordSubscriptionPaymentSync(list[idx], amount);
  updated.lastPaymentMethod = method;
  list[idx] = updated;

  await saveSubscriptions(list);
  return updated;
}

/**
 * Toggles manual suspension for a store.
 * @param {string} storeId 
 * @param {boolean} suspend 
 * @returns {Promise<Object>}
 */
export async function toggleStoreSuspension(storeId, suspend) {
  const list = await getSubscriptions();
  const idx = list.findIndex(s => s.storeId === storeId || s.slug === storeId);
  if (idx === -1) throw new Error(`No se encontró la tienda con ID ${storeId}`);

  list[idx].isManuallySuspended = Boolean(suspend);
  list[idx].status = calculateSubscriptionStatus(list[idx]);
  list[idx].updatedAt = new Date().toISOString();

  await saveSubscriptions(list);
  return list[idx];
}

/**
 * Generates polite WhatsApp reminder for store owner.
 * @param {Object} sub 
 * @returns {{ text: string, url: string }}
 */
export function generateStoreReminderMessage(sub) {
  const phone = (sub.ownerPhone || '').replace(/\D/g, '');
  const planInfo = DEFAULT_SAAS_PLANS[sub.plan]?.name || 'Plan Gastronómico';
  const dueDateStr = sub.nextDueDate ? new Date(sub.nextDueDate).toLocaleDateString('es-AR') : 'próximamente';

  const text = `Hola ${sub.ownerName || 'amigo/a'} de *${sub.storeName}*, ¿cómo estás? 👋

Te escribo para recordarte el abono mensual de tu sistema (${planInfo}).
📅 *Vencimiento:* ${dueDateStr}
💵 *Monto:* $${Number(sub.monthlyFee || 0).toLocaleString('es-AR')}

Si ya realizaste la transferencia podés compartirme el comprobante por acá para registrarlo en el sistema. ¡Muchas gracias!`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  return { text, url };
}
