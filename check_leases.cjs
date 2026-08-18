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
  const { data, error } = await supabase.from('leases').select('*');
  console.log("Error:", error?.message);
  console.log("Leases count:", data?.length);
  if (data?.length > 0) {
    console.log("Statuses:", [...new Set(data.map(l => l.lease_status))]);
    console.log(data[0]);
  }
}

run();
