const fs = require('fs');
const https = require('https');
const path = require('path');

const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] ? match[2].trim() : '';
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[match[1]] = val;
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;
const url = new URL(supabaseUrl);

function checkTable(table) {
  return new Promise((resolve) => {
    const req = https.request({
      hostname: url.hostname,
      path: `/rest/v1/${table}?select=count`,
      method: 'HEAD',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Prefer': 'count=exact'
      }
    }, res => {
      resolve({ table, range: res.headers['content-range'] || `Status: ${res.statusCode}` });
    });
    req.on('error', e => resolve({ table, error: e.message }));
    req.end();
  });
}

async function run() {
  const tables = [
    'properties', 'units', 'leases', 'customers', 'reservations', 
    'pdcs', 'fin_pdc_register', 'fin_vouchers', 'fin_journal_entries',
    'key_handovers', 'inspection_reports', 'documents', 'tickets', 
    'maintenance_requests', 'assets', 'profiles', 'excel_import_batches'
  ];
  for (const t of tables) {
    const res = await checkTable(t);
    console.log(`${t.padEnd(25)} : ${res.range || res.error}`);
  }
}

run();
