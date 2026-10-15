// =========================================================
// OFFLINE SYNC SERVICE — RESILIENCIA Y OPERACIÓN SIN INTERNET
// Permite que el negocio continúe facturando, tomando comandas 
// e imprimiendo tickets aún si se corta la conexión a internet.
// Al restablecerse la red, sincroniza todo automáticamente con Supabase.
// =========================================================

import { supabaseSync } from './supabaseClient.js';
import { storageService } from './storageService.js';

const QUEUE_STORAGE_KEY = 'comandafast_offline_queue';

class OfflineSyncService {
  constructor() {
    this._isOnline = typeof navigator !== 'undefined' ? Boolean(navigator.onLine) : true;
    this._isSyncing = false;
    this._lastSyncAt = null;
    this._listeners = new Set();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));

      // Verificación periódica silenciosa cada 25 segundos
      setInterval(() => {
        this.checkConnectionHealth();
      }, 25000);
    }
  }

  isOnline() {
    return this._isOnline;
  }

  getPendingCount() {
    const queue = this.getQueue();
    return queue.length;
  }

  getQueue() {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  saveQueue(queue) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue || []));
      this.notifyListeners();
    } catch (e) {
      console.warn('[OfflineSync] Error guardando cola offline:', e);
    }
  }

  enqueue(actionType, payload) {
    const queue = this.getQueue();
    const item = {
      id: 'sync_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      type: actionType, // 'CREATE_ORDER' | 'UPDATE_ORDER' | 'SAVE_SHIFT' | 'UPDATE_TABLE'
      payload,
      createdAt: new Date().toISOString(),
      attempts: 0
    };

    queue.push(item);
    this.saveQueue(queue);
    console.log(`[OfflineSync] Acción offline encolada (${actionType}):`, item.id);

    // Si aparentemente hay red, intentar procesar de inmediato
    if (this._isOnline) {
      this.processQueue();
    }

    return item;
  }

  async checkConnectionHealth() {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.setOnlineStatus(false);
      return false;
    }

    // Ping rápido a Supabase
    try {
      const isConfigured = supabaseSync.isConfigured();
      if (!isConfigured) {
        this.setOnlineStatus(true);
        return true;
      }

      const { url } = supabaseSync.getCredentials();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${url}/rest/v1/`, {
        method: 'HEAD',
        headers: supabaseSync._headers(),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const healthy = res.status < 500;
      this.setOnlineStatus(healthy);

      if (healthy && this.getPendingCount() > 0) {
        this.processQueue();
      }
      return healthy;
    } catch (_) {
      this.setOnlineStatus(false);
      return false;
    }
  }

  setOnlineStatus(status) {
    const prev = this._isOnline;
    this._isOnline = Boolean(status);
    if (prev !== this._isOnline) {
      console.log(`[OfflineSync] Estado de conexión: ${this._isOnline ? '🟢 En Línea' : '🟡 Modo Sin Conexión'}`);
      this.notifyListeners();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('comandafast:connection_status', { 
          detail: { isOnline: this._isOnline, pendingCount: this.getPendingCount() } 
        }));
      }
    }
  }

  handleNetworkChange(online) {
    this.setOnlineStatus(online);
    if (online) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this._isSyncing) return;
    const queue = this.getQueue();
    if (queue.length === 0) return;

    this._isSyncing = true;
    console.log(`[OfflineSync] Sincronizando ${queue.length} acciones pendientes con Supabase...`);

    const remaining = [];
    let syncedCount = 0;

    for (const item of queue) {
      try {
        let success = false;
        switch (item.type) {
          case 'CREATE_ORDER':
            const created = await supabaseSync.createOrder(item.payload);
            success = Boolean(created);
            break;

          case 'UPDATE_ORDER':
            if (item.payload && item.payload.id) {
              await supabaseSync.updateOrder(item.payload.id, item.payload.updates);
              success = true;
            }
            break;

          case 'SAVE_SHIFT':
            const shiftRes = await supabaseSync.createCashShift(item.payload);
            success = Boolean(shiftRes);
            break;

          case 'UPDATE_TABLE':
            if (item.payload && item.payload.tableNumber) {
              const res = await fetch(supabaseSync._url('restaurant_tables', `table_number=eq.${item.payload.tableNumber}`), {
                method: 'PATCH',
                headers: supabaseSync._headers({ 'Prefer': 'return=minimal' }),
                body: JSON.stringify(item.payload.data)
              });
              success = res.ok;
            }
            break;

          default:
            success = true;
            break;
        }

        if (success) {
          syncedCount++;
        } else {
          item.attempts = (item.attempts || 0) + 1;
          remaining.push(item);
        }
      } catch (err) {
        console.warn(`[OfflineSync] Falló sincronización de ${item.id}:`, err);
        item.attempts = (item.attempts || 0) + 1;
        remaining.push(item);
      }
    }

    this.saveQueue(remaining);
    this._isSyncing = false;
    this._lastSyncAt = new Date().toISOString();

    if (syncedCount > 0) {
      console.log(`[OfflineSync] ✅ Sincronización exitosa: ${syncedCount} elementos subidos.`);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('comandafast:offline_synced', { 
          detail: { syncedCount, remainingCount: remaining.length } 
        }));
      }
    }
  }

  subscribe(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  notifyListeners() {
    const state = {
      isOnline: this._isOnline,
      pendingCount: this.getPendingCount(),
      lastSyncAt: this._lastSyncAt,
      isSyncing: this._isSyncing
    };
    this._listeners.forEach(cb => {
      try { cb(state); } catch (_) {}
    });
  }
}

export const offlineSyncService = new OfflineSyncService();
