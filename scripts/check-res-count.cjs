const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const getEnv = (k) => {
  const line = env.split('\n').find(l => l.trim().startsWith(k + '='));
  return line ? line.split('=')[1].trim().replace(/^["']|["']$/g, '') : '';
};
const supabase = createClient(getEnv('VITE_SUPABASE_URL'), getEnv('VITE_SUPABASE_ANON_KEY'));

async function check() {
  const { data: units } = await supabase.from('units').select('id, unit_ref, unit_name, current_tenant, status, lease_status, property_id, properties(title)');
  const { data: leases } = await supabase.from('leases').select('*, properties(title)');
  const { data: reservations } = await supabase.from('reservations').select('*');
  console.log('Units total:', units ? units.length : 0);
  const occupiedUnits = (units || []).filter(u => u.status === 'Occupied' || (u.current_tenant && u.current_tenant.trim() && u.current_tenant.toLowerCase() !== 'vacant'));
  console.log('Occupied units count:', occupiedUnits.length);
  console.log('Leases table count:', leases ? leases.length : 0);
  console.log('Reservations table count:', reservations ? reservations.length : 0);
}
check();
