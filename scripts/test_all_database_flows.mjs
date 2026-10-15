// scripts/test_all_database_flows.mjs
import { readFileSync } from 'node:fs';

const SUPABASE_URL = 'https://vmnhystuwcbdbukoxdtz.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbmh5c3R1d2NiZGJ1a294ZHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMDkzNTMsImV4cCI6MjEwNzU4NTM1M30._P68WCxLZLdElXkXuDuitvtSXxsyEU0IdK-S73-NDpg';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbmh5c3R1d2NiZGJ1a294ZHR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjAwOTM1MywiZXhwIjoyMTA3NTg1MzUzfQ.bAKbh19cV5B0GuZd9LeT8Sjre56_XQoiYfMXwdEIH-M';

const headers = (key = SERVICE_KEY) => ({
  'apikey': key,
  'Authorization': `Bearer ${key}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

async function runAllFlows() {
  console.log('====================================================');
  console.log('🧪 SUITE INTEGRAL DE PRUEBAS DE BASE DE DATOS SUPABASE');
  console.log('Target:', SUPABASE_URL);
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.log(`❌ [FAIL] ${name}: ${err.message}`);
    }
  }

  // FLUJO 1: Locales y White-Label (Multi-Tenant)
  let storeId = null;
  await test('Flujo 1: Crear y recuperar Comercio Multi-Tenant (stores)', async () => {
    const slug = `test-local-${Date.now()}`;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/stores`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        slug,
        name: 'Pizzería & Empanadas Test',
        tagline: 'Horno a la leña',
        industry: 'pizzeria',
        is_active: true
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const data = await res.json();
    if (!data[0]?.id) throw new Error('No se generó el store_id');
    storeId = data[0].id;

    // Verificar lectura pública anónima por slug
    const readRes = await fetch(`${SUPABASE_URL}/rest/v1/stores?slug=eq.${slug}`, {
      headers: headers(ANON_KEY)
    });
    const readData = await readRes.json();
    if (readData[0]?.slug !== slug) throw new Error('No se recuperó el comercio con la clave pública anon');
  });

  // FLUJO 2: Mapa de Mesas y Salón (restaurant_tables)
  await test('Flujo 2: Gestión de Mesas del Salón y Ocupación (restaurant_tables)', async () => {
    if (!storeId) throw new Error('Store ID no disponible');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/restaurant_tables`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        store_id: storeId,
        table_number: 10,
        label: 'Mesa Terraza 10',
        capacity: 6,
        status: 'free'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const tableData = await res.json();
    const tableId = tableData[0]?.id;

    // Actualizar mesa a ocupada con orden
    const updateRes = await fetch(`${SUPABASE_URL}/rest/v1/restaurant_tables?id=eq.${tableId}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({
        status: 'occupied',
        current_order_id: 'ord-test-99',
        opened_at: new Date().toISOString()
      })
    });
    if (!updateRes.ok) throw new Error(`Error actualizando mesa: ${await updateRes.text()}`);
  });

  // FLUJO 3: Planes SaaS y Suscripciones (saas_plans & store_subscriptions)
  await test('Flujo 3: Planes SaaS y Suscripciones de Comercios (saas_plans)', async () => {
    const plansRes = await fetch(`${SUPABASE_URL}/rest/v1/saas_plans?limit=5`, {
      headers: headers(ANON_KEY)
    });
    if (plansRes.status === 404) {
      throw new Error('Tabla "saas_plans" aún no existe en Supabase. Ejecuta COMPLETE_SAAS_SCHEMA.sql en el SQL Editor.');
    }
    const plans = await plansRes.json();
    if (!Array.isArray(plans) || plans.length === 0) {
      throw new Error('No se encontraron planes SaaS en la base de datos');
    }
    console.log(`      ℹ️ Planes disponibles: ${plans.map(p => `${p.name} ($${p.monthly_fee})`).join(', ')}`);

    // Crear suscripción
    const subRes = await fetch(`${SUPABASE_URL}/rest/v1/store_subscriptions`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        store_id: storeId,
        store_slug: `sub-test-${Date.now()}`,
        store_name: 'Pizzería Test',
        plan_id: 'pro',
        monthly_fee: 28000,
        status: 'al_dia'
      })
    });
    if (!subRes.ok) throw new Error(`Error en suscripción: ${await subRes.text()}`);
  });

  // FLUJO 4: CRM de Clientes y Fiados (customers)
  await test('Flujo 4: CRM de Clientes, Cuentas Corrientes y Fiados (customers)', async () => {
    const custRes = await fetch(`${SUPABASE_URL}/rest/v1/customers`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        store_id: storeId,
        name: 'Martín Gómez',
        phone: '5491198765432',
        current_balance: 14500.00,
        ledger: [
          { date: new Date().toISOString(), type: 'charge', amount: 14500, note: 'Comanda #101 (Fiado)' }
        ]
      })
    });
    if (custRes.status === 404) {
      throw new Error('Tabla "customers" aún no existe en Supabase. Ejecuta COMPLETE_SAAS_SCHEMA.sql en el SQL Editor.');
    }
    if (!custRes.ok) throw new Error(`HTTP ${custRes.status}: ${await custRes.text()}`);
    const customers = await custRes.json();
    if (!customers[0]?.id) throw new Error('No se pudo crear cliente de fiado');
  });

  // FLUJO 5: Productos y Menú (products)
  await test('Flujo 5: Catálogo de Productos y Modificadores (products)', async () => {
    const prodRes = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        id: `prod-${Date.now()}`,
        store_id: storeId,
        name: 'Hamburguesa Doble Smash',
        category: 'Hamburguesas',
        price: 8500.00,
        emoji: '🍔',
        modifiers: [{ name: 'Bacon Extra', price: 1200 }]
      })
    });
    if (prodRes.status === 404) {
      throw new Error('Tabla "products" aún no existe en Supabase. Ejecuta COMPLETE_SAAS_SCHEMA.sql en el SQL Editor.');
    }
    if (!prodRes.ok) throw new Error(`HTTP ${prodRes.status}: ${await prodRes.text()}`);
  });

  // FLUJO 6: Comandas / Pedidos en Tiempo Real (orders)
  await test('Flujo 6: Comandas POS y Ciclo de Vida KDS (orders)', async () => {
    const orderId = `ord-${Date.now()}`;
    const orderRes = await fetch(`${SUPABASE_URL}/rest/v1/orders`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        id: orderId,
        store_id: storeId,
        order_number: 1,
        channel: 'mesa',
        table_number: '10',
        items: [{ name: 'Hamburguesa Doble Smash', qty: 2, price: 8500 }],
        total: 17000.00,
        payment_method: 'efectivo',
        status: 'pendiente'
      })
    });
    if (orderRes.status === 404) {
      throw new Error('Tabla "orders" aún no existe en Supabase. Ejecuta COMPLETE_SAAS_SCHEMA.sql en el SQL Editor.');
    }
    if (!orderRes.ok) throw new Error(`HTTP ${orderRes.status}: ${await orderRes.text()}`);

    // Transición a 'cocina' en KDS
    const kdsRes = await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ status: 'cocina' })
    });
    if (!kdsRes.ok) throw new Error(`Error en KDS: ${await kdsRes.text()}`);
  });

  // FLUJO 7: Control de Turnos y Caja (cash_shifts)
  await test('Flujo 7: Apertura, Gastos y Arqueo Ciego de Caja (cash_shifts)', async () => {
    const shiftId = `shift-${Date.now()}`;
    const shiftRes = await fetch(`${SUPABASE_URL}/rest/v1/cash_shifts`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        id: shiftId,
        store_id: storeId,
        opened_at: new Date().toISOString(),
        initial_cash: 25000.00,
        cashier_name: 'Cajero Principal',
        expenses: [{ amount: 3500, reason: 'Hielo y servilletas' }]
      })
    });
    if (shiftRes.status === 404) {
      throw new Error('Tabla "cash_shifts" aún no existe en Supabase. Ejecuta COMPLETE_SAAS_SCHEMA.sql en el SQL Editor.');
    }
    if (!shiftRes.ok) throw new Error(`HTTP ${shiftRes.status}: ${await shiftRes.text()}`);
  });

  // FLUJO 8: Cajeros y Roles (cashiers)
  await test('Flujo 8: Control de Acceso por PIN de Cajero (cashiers)', async () => {
    const cashierId = `caj-${Date.now()}`;
    const cajRes = await fetch(`${SUPABASE_URL}/rest/v1/cashiers`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        id: cashierId,
        store_id: storeId,
        username: `cajero_${Date.now()}`,
        pin: '1234',
        name: 'Lucas Cajero',
        role: 'cajero',
        is_active: true
      })
    });
    if (cajRes.status === 404) {
      throw new Error('Tabla "cashiers" aún no existe en Supabase. Ejecuta COMPLETE_SAAS_SCHEMA.sql en el SQL Editor.');
    }
    if (!cajRes.ok) throw new Error(`HTTP ${cajRes.status}: ${await cajRes.text()}`);
  });

  console.log('\n====================================================');
  console.log(`📊 RESUMEN: ${passed}/${total} flujos completados exitosamente.`);
  console.log('====================================================');
}

runAllFlows().catch(console.error);
