import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

// Limpieza automática de Service Workers huérfanos de proyectos previos en localhost
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (const registration of registrations) {
      registration.unregister();
    }
  }).catch(() => {});
}

// Purga automática de caché de base de datos previa (yqynuvjpipmvurualgtg -> vmnhystuwcbdbukoxdtz)
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  try {
    const CURRENT_INSTANCE = 'vmnhystuwcbdbukoxdtz_v4';
    const activeInstance = localStorage.getItem('comandafast_db_instance_id');
    const rawSettings = localStorage.getItem('comandafast_settings') || '';
    const rawCashiers = localStorage.getItem('comandafast_cashiers') || '';
    const rawProducts = localStorage.getItem('comandafast_products') || '';

    const hasStaleCashiers = rawCashiers.includes('Cande') || rawCashiers.includes('Martin Gonzalez');
    const hasStaleProducts = rawProducts.includes('BAJONERA') || rawProducts.includes('DOÑA BURGA') || rawProducts.includes('PANCHO GUACAMOLE');
    const hasStaleSettings = rawSettings.includes('yqynuvjpipmvurualgtg');

    if (activeInstance !== CURRENT_INSTANCE || hasStaleCashiers || hasStaleProducts || hasStaleSettings) {
      console.log('[Sistema] Purgando caché obsoleta y conectando a Supabase limpio:', CURRENT_INSTANCE);
      localStorage.removeItem('comandafast_cashiers');
      localStorage.removeItem('comandafast_current_cashier');
      localStorage.removeItem('comandafast_orders');
      localStorage.removeItem('comandafast_cash_shift');
      localStorage.removeItem('comandafast_cash_shifts_history');
      localStorage.removeItem('comandafast_products');
      localStorage.removeItem('comandafast_categories');

      if (rawSettings) {
        try {
          const s = JSON.parse(rawSettings);
          delete s.supabaseUrl;
          delete s.supabaseAnonKey;
          localStorage.setItem('comandafast_settings', JSON.stringify(s));
        } catch (_) {}
      }
      localStorage.setItem('comandafast_db_instance_id', CURRENT_INSTANCE);
    }
  } catch (_) {}
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
