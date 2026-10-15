// scripts/check_cashiers_and_products.mjs
const SUPABASE_URL = 'https://vmnhystuwcbdbukoxdtz.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbmh5c3R1d2NiZGJ1a294ZHR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjAwOTM1MywiZXhwIjoyMTA3NTg1MzUzfQ.bAKbh19cV5B0GuZd9LeT8Sjre56_XQoiYfMXwdEIH-M';

async function check() {
  console.log('Querying vmnhystuwcbdbukoxdtz cashiers...');
  const resCashiers = await fetch(`${SUPABASE_URL}/rest/v1/cashiers`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  });
  const cashiers = await resCashiers.json();
  console.log('Cashiers in vmnhystuwcbdbukoxdtz:', cashiers);

  console.log('\nQuerying vmnhystuwcbdbukoxdtz products...');
  const resProducts = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  });
  const products = await resProducts.json();
  console.log('Products in vmnhystuwcbdbukoxdtz (count: ' + products.length + '):', products.slice(0, 5));

  console.log('\nQuerying vmnhystuwcbdbukoxdtz system_settings...');
  const resSettings = await fetch(`${SUPABASE_URL}/rest/v1/system_settings`, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  });
  const settings = await resSettings.json();
  console.log('Settings in vmnhystuwcbdbukoxdtz:', settings);
}

check().catch(console.error);
