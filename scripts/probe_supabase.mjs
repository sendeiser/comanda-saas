// scripts/probe_supabase.mjs
const SUPABASE_URL = 'https://vmnhystuwcbdbukoxdtz.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbmh5c3R1d2NiZGJ1a294ZHR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMDkzNTMsImV4cCI6MjEwNzU4NTM1M30._P68WCxLZLdElXkXuDuitvtSXxsyEU0IdK-S73-NDpg';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbmh5c3R1d2NiZGJ1a294ZHR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjAwOTM1MywiZXhwIjoyMTA3NTg1MzUzfQ.bAKbh19cV5B0GuZd9LeT8Sjre56_XQoiYfMXwdEIH-M';

async function main() {
  console.log('Testing connection to Supabase:', SUPABASE_URL);

  // 1. Fetch OpenAPI schema
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });

    if (res.ok) {
      const openapi = await res.json();
      console.log('OpenAPI definitions found:');
      const tables = Object.keys(openapi.definitions || {});
      console.log('Tables exposed in PostgREST:', tables);
    } else {
      console.log('OpenAPI fetch status:', res.status, res.statusText);
      const text = await res.text();
      console.log('Response:', text);
    }
  } catch (err) {
    console.error('Error fetching OpenAPI:', err);
  }

  // 2. Test specific tables
  const testTables = ['stores', 'restaurant_tables', 'saas_plans', 'store_subscriptions', 'customers', 'orders', 'products', 'cash_shifts', 'cashiers'];
  console.log('\nChecking table endpoints:');
  for (const t of testTables) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${t}?limit=1`, {
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`
        }
      });
      console.log(`Table '${t}': ${res.status} ${res.statusText}`);
      if (res.ok) {
        const data = await res.json();
        console.log(`   Sample count: ${data.length}`);
      } else {
        const errText = await res.text();
        console.log(`   Error: ${errText.slice(0, 100)}`);
      }
    } catch (e) {
      console.log(`Table '${t}' fetch error:`, e.message);
    }
  }
}

main();
