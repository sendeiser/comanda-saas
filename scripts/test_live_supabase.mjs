// scripts/test_live_supabase.mjs
const SUPABASE_URL = 'https://vmnhystuwcbdbukoxdtz.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbmh5c3R1d2NiZGJ1a294ZHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMDkzNTMsImV4cCI6MjEwNzU4NTM1M30._P68WCxLZLdElXkXuDuitvtSXxsyEU0IdK-S73-NDpg';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbmh5c3R1d2NiZGJ1a294ZHR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjAwOTM1MywiZXhwIjoyMTA3NTg1MzUzfQ.bAKbh19cV5B0GuZd9LeT8Sjre56_XQoiYfMXwdEIH-M';

async function testStoresAndTables() {
  console.log('--- 1. Testing Store Creation in Supabase ---');
  const demoStore = {
    slug: 'fastburga-centro',
    name: 'FastBurga Centro',
    tagline: 'Hamburguesas Artesanales & Cerveza',
    industry: 'fast_food',
    theme: {
      primaryColor: '#f59e0b',
      accentColor: '#10b981',
      bgDark: '#0b0f19'
    },
    is_active: true
  };

  const insertStoreRes = await fetch(`${SUPABASE_URL}/rest/v1/stores`, {
    method: 'POST',
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation,resolution=merge-duplicates'
    },
    body: JSON.stringify(demoStore)
  });

  console.log('Insert Store Status:', insertStoreRes.status);
  const storeData = await insertStoreRes.json();
  console.log('Store record in DB:', storeData);

  const storeId = Array.isArray(storeData) && storeData[0]?.id ? storeData[0].id : null;

  if (storeId) {
    console.log('\n--- 2. Testing Restaurant Tables Creation in Supabase ---');
    const tableData = {
      store_id: storeId,
      table_number: 1,
      label: 'Mesa 1 - Ventana',
      capacity: 4,
      status: 'free'
    };

    const insertTableRes = await fetch(`${SUPABASE_URL}/rest/v1/restaurant_tables`, {
      method: 'POST',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation,resolution=merge-duplicates'
      },
      body: JSON.stringify(tableData)
    });

    console.log('Insert Table Status:', insertTableRes.status);
    const createdTable = await insertTableRes.json();
    console.log('Table record in DB:', createdTable);

    console.log('\n--- 3. Testing Public Anon Key Query ---');
    const anonQuery = await fetch(`${SUPABASE_URL}/rest/v1/stores?slug=eq.fastburga-centro`, {
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    });

    console.log('Anon Query Status:', anonQuery.status);
    const readStores = await anonQuery.json();
    console.log('Store read via Public Anon Key:', readStores);
  }
}

testStoresAndTables().catch(console.error);
