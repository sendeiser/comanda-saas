// scripts/seed_clean_demo_data.mjs
const SUPABASE_URL = 'https://vmnhystuwcbdbukoxdtz.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbmh5c3R1d2NiZGJ1a294ZHR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjAwOTM1MywiZXhwIjoyMTA3NTg1MzUzfQ.bAKbh19cV5B0GuZd9LeT8Sjre56_XQoiYfMXwdEIH-M';

const DEFAULT_PRODUCTS = [
  {
    id: 'prod-promo-duo-smash',
    name: 'Promo Dúo Smash + Papas (Envío Gratis)',
    category: 'Promos',
    price: 15500,
    emoji: '🛵',
    description: '2 Hamburguesas Clásicas + Papas Fritas Grandes + ¡ENVÍO GRATIS INCLUIDO! Ahorrás $5.000.',
    modifiers: ['Sin cebolla', 'Extra Cheddar (+$800)', 'Doble Carne (+$2000)', 'Bebida 1.5L (+$2000)'],
    is_active: true
  },
  {
    id: 'prod-promo-4-cheese',
    name: 'Promo 4 Cheeseburgers (25% OFF)',
    category: 'Promos',
    price: 24000,
    emoji: '🍔',
    description: '4 Cheeseburgers con doble cheddar y carne smash + 2 Papas Grandes. ¡Super precio promo para amigos!',
    modifiers: ['Sin cebolla', 'Extra Bacon (+$1200)', 'Salsas extras'],
    is_active: true
  },
  {
    id: 'prod-promo-pareja-cheddar',
    name: 'Promo Pareja Doble Cheddar + 2 Papas',
    category: 'Promos',
    price: 16900,
    emoji: '🧀',
    description: '2 Dobles Cuarto Cheddar + 2 Papas Fritas con salsa cheddar. ¡Descuento imperdible!',
    modifiers: ['Sin cebolla', 'Extra Bacon (+$900)', 'Papas con Cheddar & Bacon (+$1500)'],
    is_active: true
  },
  {
    id: 'prod-1',
    name: 'Burger Clásica',
    category: 'Hamburguesas',
    price: 6500,
    emoji: '🍔',
    description: 'Medallón 150g, lechuga, tomate, queso y mayonesa casera',
    modifiers: ['Sin cebolla', 'Sin tomate', 'Extra Cheddar (+$800)', 'Extra Bacon (+$900)', 'Papas Rústicas'],
    is_active: true
  },
  {
    id: 'prod-2',
    name: 'Doble Cuarto Cheddar',
    category: 'Hamburguesas',
    price: 8200,
    emoji: '🧀',
    description: 'Doble medallón 300g, 4 fetas de cheddar, cebolla picada y ketchup',
    modifiers: ['Sin cebolla', 'Extra Cheddar (+$800)', 'Doble Bacon (+$1200)', 'Medallón Extra (+$2000)'],
    is_active: true
  },
  {
    id: 'prod-3',
    name: 'Triple Bacon BBQ',
    category: 'Hamburguesas',
    price: 9800,
    emoji: '🥓',
    description: 'Triple medallón 450g, 6 fetas de cheddar, abundante bacon crocante y salsa BBQ',
    modifiers: ['Sin salsa BBQ', 'Extra Bacon (+$900)', 'Salsa Picante', 'Papas Grandes'],
    is_active: true
  },
  {
    id: 'prod-6',
    name: 'Papas Fritas Clásicas',
    category: 'Agregados',
    price: 3500,
    emoji: '🍟',
    description: 'Porción grande de papas bastón crocantes',
    modifiers: ['Sin sal', 'Con provenzal'],
    is_active: true
  },
  {
    id: 'prod-7',
    name: 'Papas Cheddar & Bacon',
    category: 'Agregados',
    price: 4900,
    emoji: '🧀',
    description: 'Papas fritas bañadas en salsa cheddar y lluvia de bacon crocante con verdeo',
    modifiers: ['Sin verdeo', 'Cheddar aparte', 'Doble Bacon (+$900)'],
    is_active: true
  },
  {
    id: 'prod-9',
    name: 'Coca Cola 500ml',
    category: 'Bebidas',
    price: 2000,
    emoji: '🥤',
    description: 'Botella 500ml bien fría',
    modifiers: ['Fría', 'Natural'],
    is_active: true
  },
  {
    id: 'prod-11',
    name: 'Cerveza IPA 473ml',
    category: 'Bebidas',
    price: 3200,
    emoji: '🍺',
    description: 'Lata de cerveza artesanal rubia o IPA',
    modifiers: ['Muy fría'],
    is_active: true
  }
];

const DEFAULT_CASHIERS = [
  {
    id: 'csh-demo-1',
    username: 'cajero1',
    name: 'Cajero Mostrador',
    pin: '1234',
    role: 'cajero',
    is_active: true
  },
  {
    id: 'csh-demo-2',
    username: 'admin',
    name: 'Administrador Local',
    pin: '1234',
    role: 'admin',
    is_active: true
  }
];

async function seedCleanData() {
  console.log('Seeding products into vmnhystuwcbdbukoxdtz...');
  const resProd = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(DEFAULT_PRODUCTS)
  });
  console.log('Products seed status:', resProd.status);

  console.log('Seeding clean cashiers into vmnhystuwcbdbukoxdtz...');
  const resCash = await fetch(`${SUPABASE_URL}/rest/v1/cashiers`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(DEFAULT_CASHIERS)
  });
  console.log('Cashiers seed status:', resCash.status);

  // Clean test cashier if present
  await fetch(`${SUPABASE_URL}/rest/v1/cashiers?username=like.cajero_*`, {
    method: 'DELETE',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  });

  console.log('Seed completed successfully!');
}

seedCleanData().catch(console.error);
