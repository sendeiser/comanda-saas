// scripts/check_old_db.mjs
const OLD_URL = 'https://yqynuvjpipmvurualgtg.supabase.co';
const OLD_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxeW51dmpwaXBtdnVydWFsZ3RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MzMyOTgsImV4cCI6MjEwNTUwOTI5OH0.mLO52rFPD384yQHdGlBasrx4QvqXiHYH3zRmJ9Bq2go';

async function checkOld() {
  try {
    const res = await fetch(`${OLD_URL}/rest/v1/cashiers`, {
      headers: {
        'apikey': OLD_KEY,
        'Authorization': `Bearer ${OLD_KEY}`
      }
    });
    console.log('Old DB cashiers status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Old DB cashiers:', data);
    }
  } catch (e) {
    console.log('Old DB error:', e.message);
  }
}

checkOld();
