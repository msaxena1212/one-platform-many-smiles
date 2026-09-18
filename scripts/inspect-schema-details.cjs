const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=')[1].trim().replace(/"/g, '');
});

const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

async function main() {
  await client.connect();

  const tables = ['leases', 'units', 'fin_pdc_register', 'pdcs', 'fin_accounting_events', 'fin_accounting_event_lines', 'fin_vouchers', 'fin_voucher_lines'];
  for (const t of tables) {
    const cols = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = $1 
      ORDER BY ordinal_position
    `, [t]);
    console.log(`\n=== Table: ${t} ===`);
    cols.rows.forEach(c => console.log(`  ${c.column_name}: ${c.data_type}`));
  }

  // Check foreign keys on leases
  const fks = await client.query(`
    SELECT
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name 
    FROM 
      information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='leases';
  `);
  console.log('\n=== Foreign Keys on leases ===', fks.rows);

  await client.end();
}

main().catch(console.error);
