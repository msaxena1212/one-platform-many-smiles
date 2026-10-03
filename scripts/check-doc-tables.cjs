const { Client } = require('pg');
const fs = require('fs');
const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL='))
    dbUrl = line.split('=').slice(1).join('=').trim().replace(/^['"]/, '').replace(/['"]\s*$/, '');
});

(async () => {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  // Find all tables with 'doc' in name
  const docs = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name ILIKE '%doc%' ORDER BY table_name"
  );
  console.log('Doc-related tables:', docs.rows.map(r => r.table_name));

  // Show counts for all those tables
  for (const row of docs.rows) {
    try {
      const cnt = await client.query(`SELECT COUNT(*) n FROM "${row.table_name}"`);
      console.log(`  ${row.table_name}: ${cnt.rows[0].n} rows`);
    } catch(e) { console.log(`  ${row.table_name}: error - ${e.message}`); }
  }

  // Count fin_vouchers
  try {
    const v = await client.query('SELECT COUNT(*) n FROM fin_vouchers');
    console.log('fin_vouchers count:', v.rows[0].n);
    const sample = await client.query('SELECT voucher_no, narration, total_amount FROM fin_vouchers LIMIT 3');
    console.log('fin_vouchers sample:', sample.rows);
  } catch(e) { console.log('fin_vouchers:', e.message); }

  await client.end();
})().catch(console.error);
