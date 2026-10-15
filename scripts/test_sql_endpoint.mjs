// scripts/test_sql_endpoint.mjs
const SUPABASE_URL = 'https://vmnhystuwcbdbukoxdtz.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbmh5c3R1d2NiZGJ1a294ZHR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjAwOTM1MywiZXhwIjoyMTA3NTg1MzUzfQ.bAKbh19cV5B0GuZd9LeT8Sjre56_XQoiYfMXwdEIH-M';

async function testEndpoints() {
  const endpoints = [
    { url: `${SUPABASE_URL}/pg`, method: 'POST', body: JSON.stringify({ query: 'SELECT 1;' }) },
    { url: `${SUPABASE_URL}/rest/v1/rpc/execute_sql`, method: 'POST', body: JSON.stringify({ query: 'SELECT 1;' }) },
    { url: `${SUPABASE_URL}/rest/v1/rpc/exec_sql`, method: 'POST', body: JSON.stringify({ query: 'SELECT 1;' }) },
    { url: `${SUPABASE_URL}/rest/v1/rpc/sql`, method: 'POST', body: JSON.stringify({ query: 'SELECT 1;' }) },
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: ep.method,
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: ep.body
      });
      console.log(`Endpoint ${ep.url}: status ${res.status}`);
      const text = await res.text();
      console.log('   Response:', text.slice(0, 100));
    } catch (e) {
      console.log(`Endpoint ${ep.url} error:`, e.message);
    }
  }
}

testEndpoints();
