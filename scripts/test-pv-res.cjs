const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const getEnv = (key) => {
  const m = env.match(new RegExp(key + '=["\']?([^"\'\\r\\n]+)'));
  return m ? m[1] : '';
};
const u = getEnv('VITE_SUPABASE_URL');
const k = getEnv('VITE_SUPABASE_ANON_KEY');

async function test() {
  const res1 = await fetch(`${u}/rest/v1/fin_vouchers?voucher_number=ilike.*PV-SET*&select=*`, {
    headers: { 'apikey': k, 'Authorization': `Bearer ${k}` }
  });
  const vchs = await res1.json();
  console.log('PV-SET vouchers in Supabase:', vchs);

  const res2 = await fetch(`${u}/rest/v1/reservations?select=*&limit=5`, {
    headers: { 'apikey': k, 'Authorization': `Bearer ${k}` }
  });
  const reservations = await res2.json();
  console.log('Reservations in Supabase:', reservations);
}
test();
