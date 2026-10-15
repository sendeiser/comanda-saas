import { DEFAULT_THEME, normalizeTheme } from './themeService.js';
import { supabaseSync } from './supabaseClient.js';

export const STORE_STORAGE_KEY = 'comandafast_active_store';
export const ALL_STORES_KEY = 'comandafast_registered_stores';

export const DEFAULT_DEMO_STORE = {
  id: '00000000-0000-0000-0000-000000000001',
  slug: 'comandafast-demo',
  name: 'ComandaFast Demo',
  tagline: 'Hamburguesería & Fast Food de Alta Velocidad',
  industry: 'fast_food',
  logoUrl: '',
  bannerUrl: '',
  faviconUrl: '',
  theme: DEFAULT_THEME,
  contactInfo: {
    phone: '1122334455',
    whatsapp: '5491122334455',
    instagram: '@comandafast',
    address: 'Av. Gastronómica 123',
    googleMapsUrl: ''
  },
  deliverySettings: {
    enabled: true,
    baseFee: 1500,
    zones: []
  },
  paymentSettings: {
    acceptCash: true,
    acceptTransfer: true,
    transferAlias: 'COMANDA.FAST.BURGA',
    transferCbu: '0000003100012345678901',
    transferBank: 'Banco Santander',
    acceptMercadoPago: false,
    mercadoPagoLink: ''
  },
  isActive: true,
  createdAt: '2026-10-14T00:00:00.000Z'
};

/**
 * Sanitizes any text string into a clean, URL-safe slug.
 * @param {string} text 
 * @returns {string}
 */
export function sanitizeSlug(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .normalize('NFD') // separate accents from letters
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '') // trim leading/trailing hyphens
    .replace(/-+/g, '-'); // collapse multiple hyphens
}

/**
 * Validates store configuration payload.
 * @param {Partial<typeof DEFAULT_DEMO_STORE>} store 
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateStoreConfig(store = {}) {
  const errors = [];

  if (!store.name || typeof store.name !== 'string' || !store.name.trim()) {
    errors.push('El nombre del comercio es obligatorio.');
  }

  if (!store.slug || typeof store.slug !== 'string' || !store.slug.trim()) {
    errors.push('El slug del comercio es obligatorio.');
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(store.slug)) {
    errors.push('El slug debe contener únicamente letras minúsculas, números y guiones medios.');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Extracts store slug from the current URL pathname (e.g. /carta/:storeSlug)
 * @param {string} pathname 
 * @returns {string | null}
 */
export function resolveStoreFromUrl(urlPathOrQuery) {
  if (!urlPathOrQuery || typeof urlPathOrQuery !== 'string') return null;
  const match = urlPathOrQuery.match(/^\/carta\/([^/?#]+)/i);
  if (match) return match[1].toLowerCase();
  const queryMatch = urlPathOrQuery.match(/[?&]store=([a-z0-9-]+)/i);
  if (queryMatch) return queryMatch[1].toLowerCase();
  return null;
}

/**
 * Gets the active store from local storage or defaults to demo store.
 * @returns {typeof DEFAULT_DEMO_STORE}
 */
export function getActiveStore() {
  if (typeof localStorage === 'undefined') return DEFAULT_DEMO_STORE;
  try {
    const raw = localStorage.getItem(STORE_STORAGE_KEY);
    if (!raw) return DEFAULT_DEMO_STORE;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_DEMO_STORE, ...parsed, theme: normalizeTheme(parsed.theme) };
  } catch {
    return DEFAULT_DEMO_STORE;
  }
}

/**
 * Sets the active store in local storage.
 * @param {typeof DEFAULT_DEMO_STORE} store 
 */
export function setActiveStore(store) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORE_STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Error saving active store:', err);
  }
}

/**
 * Gets a store by its slug from Supabase, falling back to local list or demo store.
 * @param {string} slug 
 * @returns {Promise<typeof DEFAULT_DEMO_STORE | null>}
 */
export async function getStoreBySlug(slug) {
  const cleanSlug = sanitizeSlug(slug);
  if (!cleanSlug) return null;

  // 1. Check if it matches active store in local session
  const active = getActiveStore();
  if (active && active.slug === cleanSlug) {
    return active;
  }

  // 2. Query Supabase via REST if online
  if (supabaseSync && typeof fetch !== 'undefined') {
    try {
      const { url } = supabaseSync.getCredentials();
      if (url) {
        const endpoint = supabaseSync._url('stores', `slug=eq.${encodeURIComponent(cleanSlug)}&is_active=eq.true&limit=1`);
        const res = await fetch(endpoint, {
          method: 'GET',
          headers: supabaseSync._headers()
        });
        if (res.ok) {
          const list = await res.json();
          if (Array.isArray(list) && list.length > 0) {
            const data = list[0];
            return {
              id: data.id,
              slug: data.slug,
              name: data.name,
              tagline: data.tagline || '',
              industry: data.industry || 'fast_food',
              logoUrl: data.logo_url || '',
              bannerUrl: data.banner_url || '',
              faviconUrl: data.favicon_url || '',
              theme: normalizeTheme(data.theme),
              contactInfo: data.contact_info || DEFAULT_DEMO_STORE.contactInfo,
              deliverySettings: data.delivery_settings || DEFAULT_DEMO_STORE.deliverySettings,
              paymentSettings: data.payment_settings || DEFAULT_DEMO_STORE.paymentSettings,
              isActive: data.is_active,
              createdAt: data.created_at
            };
          }
        }
      }
    } catch {
      // offline fallback
    }
  }

  // 3. Fallback to local registered stores
  if (typeof localStorage !== 'undefined') {
    try {
      const storesRaw = localStorage.getItem(ALL_STORES_KEY);
      if (storesRaw) {
        const stores = JSON.parse(storesRaw);
        const match = stores.find(s => s.slug === cleanSlug);
        if (match) return match;
      }
    } catch {}
  }

  // 4. Fallback to default demo store if slug matches
  if (cleanSlug === DEFAULT_DEMO_STORE.slug) {
    return DEFAULT_DEMO_STORE;
  }

  return null;
}

/**
 * Saves or updates a store profile locally and in Supabase.
 * @param {Partial<typeof DEFAULT_DEMO_STORE>} storeData 
 * @returns {Promise<typeof DEFAULT_DEMO_STORE>}
 */
export async function saveStoreConfig(storeData) {
  const current = getActiveStore();
  const slug = sanitizeSlug(storeData.slug || current.slug || storeData.name);
  const updatedStore = {
    ...current,
    ...storeData,
    slug,
    theme: normalizeTheme(storeData.theme || current.theme),
    updatedAt: new Date().toISOString()
  };

  const validation = validateStoreConfig(updatedStore);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(' '));
  }

  // 1. Save locally
  setActiveStore(updatedStore);

  if (typeof localStorage !== 'undefined') {
    try {
      const storesRaw = localStorage.getItem(ALL_STORES_KEY);
      const stores = storesRaw ? JSON.parse(storesRaw) : [DEFAULT_DEMO_STORE];
      const index = stores.findIndex(s => s.slug === updatedStore.slug || s.id === updatedStore.id);
      if (index >= 0) {
        stores[index] = updatedStore;
      } else {
        stores.push(updatedStore);
      }
      localStorage.setItem(ALL_STORES_KEY, JSON.stringify(stores));
    } catch (err) {
      console.warn('Could not update registered stores list:', err);
    }
  }

  // 2. Sync to Supabase if connected
  if (supabaseSync && typeof fetch !== 'undefined') {
    try {
      const { url } = supabaseSync.getCredentials();
      if (url) {
        const payload = {
          name: updatedStore.name,
          slug: updatedStore.slug,
          tagline: updatedStore.tagline,
          industry: updatedStore.industry,
          logo_url: updatedStore.logoUrl,
          banner_url: updatedStore.bannerUrl,
          favicon_url: updatedStore.faviconUrl,
          theme: updatedStore.theme,
          contact_info: updatedStore.contactInfo,
          delivery_settings: updatedStore.deliverySettings,
          payment_settings: updatedStore.paymentSettings,
          is_active: updatedStore.isActive,
          updated_at: new Date().toISOString()
        };

        const endpoint = supabaseSync._url('stores');
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            ...supabaseSync._headers(),
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(payload)
        });
      }
    } catch (err) {
      console.warn('Supabase store sync deferred (operating offline):', err);
    }
  }

  return updatedStore;
}
