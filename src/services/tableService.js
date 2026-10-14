// src/services/tableService.js
import { supabaseSync } from './supabaseClient.js';

export const TABLE_STATUSES = {
  FREE: 'free',
  OCCUPIED: 'occupied',
  BILL_REQUESTED: 'bill_requested'
};

export const TABLES_STORAGE_PREFIX = 'comandafast_tables_';

/**
 * Validates whether a state transition is legal in the restaurant table lifecycle.
 * @param {string} from 
 * @param {string} to 
 * @returns {boolean}
 */
export function isValidTableTransition(from, to) {
  if (!Object.values(TABLE_STATUSES).includes(from) || !Object.values(TABLE_STATUSES).includes(to)) {
    return false;
  }
  if (from === to) return true;

  switch (from) {
    case TABLE_STATUSES.FREE:
      return to === TABLE_STATUSES.OCCUPIED;
    case TABLE_STATUSES.OCCUPIED:
      return to === TABLE_STATUSES.BILL_REQUESTED || to === TABLE_STATUSES.FREE;
    case TABLE_STATUSES.BILL_REQUESTED:
      return to === TABLE_STATUSES.FREE || to === TABLE_STATUSES.OCCUPIED;
    default:
      return false;
  }
}

/**
 * Generates an initial set of numbered tables for a store.
 * @param {string} storeId 
 * @param {number} count 
 * @returns {Array<Object>}
 */
export function generateDefaultTables(storeId, count = 12) {
  const tables = [];
  for (let i = 1; i <= count; i++) {
    tables.push({
      id: `tbl_${storeId}_${i}`,
      storeId,
      tableNumber: i,
      label: `Mesa ${i}`,
      capacity: i <= 4 ? 2 : (i <= 8 ? 4 : 6),
      status: TABLE_STATUSES.FREE,
      currentOrderId: null,
      currentOrderTotal: 0,
      openedAt: null,
      updatedAt: new Date().toISOString()
    });
  }
  return tables;
}

/**
 * Retrieves all tables for a store from local storage or defaults.
 * @param {string} storeId 
 * @returns {Promise<Array<Object>>}
 */
export async function getTables(storeId = 'default') {
  const key = `${TABLES_STORAGE_PREFIX}${storeId}`;
  
  // 1. Try local cache
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {}
  }

  // 2. Fetch from Supabase if online
  if (supabaseSync && typeof fetch !== 'undefined') {
    try {
      const { url } = supabaseSync.getCredentials();
      if (url) {
        const endpoint = supabaseSync._url('restaurant_tables', `store_id=eq.${encodeURIComponent(storeId)}&order=table_number.asc`);
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: supabaseSync._headers()
        });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            const mapped = list.map(t => ({
              id: t.id,
              storeId: t.store_id,
              tableNumber: t.table_number,
              label: t.label || `Mesa ${t.table_number}`,
              capacity: t.capacity || 4,
              status: t.status || TABLE_STATUSES.FREE,
              currentOrderId: t.current_order_id,
              currentOrderTotal: Number(t.current_order_total) || 0,
              openedAt: t.opened_at,
              updatedAt: t.updated_at
            }));
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(key, JSON.stringify(mapped));
            }
            return mapped;
          }
        }
      }
    } catch {}
  }

  // 3. Fallback to default generated tables
  const defaults = generateDefaultTables(storeId, 12);
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(defaults));
    } catch {}
  }
  return defaults;
}

/**
 * Saves all tables in local storage and attempts Supabase sync.
 * @param {string} storeId 
 * @param {Array<Object>} tables 
 */
export async function saveTables(storeId, tables) {
  const key = `${TABLES_STORAGE_PREFIX}${storeId}`;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(tables));
    } catch (err) {
      console.warn('Error saving tables locally:', err);
    }
  }

  // Dispatch custom window event so UI reacts in real-time
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('comandafast:tables_updated', { detail: { storeId, tables } }));
  }
}

/**
 * Updates a single table's status and links an order.
 * @param {string} storeId 
 * @param {number} tableNumber 
 * @param {string} newStatus 
 * @param {string|null} orderId 
 * @param {number} orderTotal 
 */
export async function updateTableStatus(storeId, tableNumber, newStatus, orderId = null, orderTotal = 0) {
  const tables = await getTables(storeId);
  const index = tables.findIndex(t => t.tableNumber === Number(tableNumber));
  if (index === -1) return;

  const table = tables[index];
  if (!isValidTableTransition(table.status, newStatus)) {
    console.warn(`Invalid transition from ${table.status} to ${newStatus} for table ${tableNumber}`);
  }

  table.status = newStatus;
  table.updatedAt = new Date().toISOString();

  if (newStatus === TABLE_STATUSES.OCCUPIED) {
    table.openedAt = table.openedAt || new Date().toISOString();
    if (orderId) table.currentOrderId = orderId;
    if (orderTotal) table.currentOrderTotal = orderTotal;
  } else if (newStatus === TABLE_STATUSES.FREE) {
    table.openedAt = null;
    table.currentOrderId = null;
    table.currentOrderTotal = 0;
  }

  tables[index] = table;
  await saveTables(storeId, tables);
}
