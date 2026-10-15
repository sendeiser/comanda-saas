// server/botStoreConfig.js
import fs from 'fs';
import path from 'path';

export const DEFAULT_BOT_STORE = {
  id: 'store-demo',
  name: 'Comanda Gastronómica',
  slug: 'demo',
  rubro: 'gastronomia',
  address: 'Av. Principal 123',
  phone: '3826400000',
  schedule: 'Martes a Domingos de 19:30 a 00:30 hs',
  baseUrl: process.env.VITE_APP_URL || process.env.APP_URL || 'http://localhost:5173',
  bankData: {
    alias: 'COMERCIO.PAGO',
    bank: 'Banco Nación / MercadoPago',
    holder: 'Comercio Gastronómico',
    cbu: '0000000000000000000000'
  }
};

/**
 * Compiles a flat variable map for template interpolation based on store config.
 * @param {Object} storeConfig 
 * @returns {Record<string, string>}
 */
export function compileBotVariables(storeConfig = {}) {
  const cfg = { ...DEFAULT_BOT_STORE, ...storeConfig };
  const base = cfg.baseUrl || DEFAULT_BOT_STORE.baseUrl;
  const catalogLink = `${base.replace(/\/+$/, '')}/carta/${cfg.slug || 'demo'}`;

  return {
    nombre_local: cfg.name || DEFAULT_BOT_STORE.name,
    direccion: cfg.address || DEFAULT_BOT_STORE.address,
    horarios: cfg.schedule || DEFAULT_BOT_STORE.schedule,
    telefono_contacto: cfg.phone || DEFAULT_BOT_STORE.phone,
    link_carta: catalogLink,
    alias_banco: cfg.bankData?.alias || DEFAULT_BOT_STORE.bankData.alias,
    banco: cfg.bankData?.bank || DEFAULT_BOT_STORE.bankData.bank,
    titular: cfg.bankData?.holder || DEFAULT_BOT_STORE.bankData.holder,
    cbu: cfg.bankData?.cbu || DEFAULT_BOT_STORE.bankData.cbu
  };
}

/**
 * Renders a clean, white-label greeting for customers.
 * @param {Object} storeConfig 
 * @param {string} [clientName]
 * @returns {string}
 */
export function renderBotGreeting(storeConfig = {}, clientName = 'Cliente') {
  const cfg = { ...DEFAULT_BOT_STORE, ...storeConfig };
  const base = cfg.baseUrl || DEFAULT_BOT_STORE.baseUrl;
  const catalogLink = `${base.replace(/\/+$/, '')}/carta/${cfg.slug || 'demo'}`;

  return `¡Hola ${clientName}! Bienvenido a *${cfg.name}* 👋

Podés explorar nuestra carta digital y armar tu pedido acá:
🔗 ${catalogLink}

───────────────────
👉 *Escribí el nombre o número de lo que quieras pedir*
👉 O escribí *HORARIOS*, *DATOS* de pago o *ESTADO* de tu pedido`;
}

/**
 * Loads the active store configuration for the local bot service.
 * Prioritizes environment variables, then local store config file, then defaults.
 * @param {string} [storeIdentifier]
 * @returns {{ store: Object, variables: Record<string, string> }}
 */
export function loadBotConfig(storeIdentifier) {
  const args = typeof process !== 'undefined' ? (process.argv || []) : [];
  let cliSlug = null;
  const sIdx = args.findIndex(a => a === '--store' || a === '-s' || a === '--slug');
  if (sIdx !== -1 && args[sIdx + 1] && !args[sIdx + 1].startsWith('-')) {
    cliSlug = args[sIdx + 1].trim();
  }

  const storeSlug = storeIdentifier || 
                     cliSlug ||
                     (typeof process !== 'undefined' ? (process.env.STORE_SLUG || process.env.STORE_ID) : null);

  let store = { ...DEFAULT_BOT_STORE };

  // Attempt reading custom store config file if present in data directory
  const configPath = path.join(process.cwd(), 'data', 'store_config.json');
  if (fs.existsSync(configPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      if (parsed && typeof parsed === 'object') {
        store = { ...store, ...parsed };
      }
    } catch (err) {
      console.warn('[BOT_CONFIG] Could not parse data/store_config.json:', err.message);
    }
  }

  if (storeSlug) {
    store.slug = storeSlug;
  }

  return {
    store,
    variables: compileBotVariables(store)
  };
}

/**
 * Interpolates variables within a bot message template.
 * @param {string} template 
 * @param {Record<string, string>} variables 
 * @param {Object} [extraContext] 
 * @returns {string}
 */
export function interpolateBotTemplate(template, variables = {}, extraContext = {}) {
  if (!template || typeof template !== 'string') return '';
  const merged = { ...variables, ...extraContext };
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
    return merged[key] !== undefined ? String(merged[key]) : match;
  });
}
