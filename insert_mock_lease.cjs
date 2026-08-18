const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let url = '', key = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) url = line.split('=')[1].trim().replace(/"/g, '');
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim().replace(/"/g, '');
});

const supabase = createClient(url, key);

async function run() {
  const { data: props } = await supabase.from('properties').select('id, title').limit(1);
  const property_id = props && props.length > 0 ? props[0].id : null;

  const mockLease = {
    property_id,
    lease_number: 'L-2026-001',
    commencement_date: '2026-01-01',
    expiry_date: '2026-12-31',
    rental_amount: 60000,
    lease_status: 'ACTIVE',
    payment_frequency: 'MONTHLY',
    lease_period_months: 12
  };

  const { data, error } = await supabase.from('leases').insert([mockLease]).select();
  if (error) {
    console.error("Error inserting lease:", error);
  } else {
    console.log("Successfully inserted mock active lease:", data);
  }
}

run();
