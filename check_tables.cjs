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
  const tables = ['fin_pdc_register', 'fin_deposits', 'fin_legal_receivables', 'fin_payroll_syncs'];
  for (const t of tables) {
    const { error } = await supabase.from(t).select('id').limit(1);
    if (error) console.log(`MISSING: ${t} -> ${error.message}`);
    else console.log(`OK: ${t}`);
  }
}

run();
