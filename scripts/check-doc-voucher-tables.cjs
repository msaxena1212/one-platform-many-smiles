const { Client } = require('pg');
const fs = require('fs');

function getDbUrl() {
  const files = ['.env', '.env.local'];
  for (const file of files) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed.startsWith('DATABASE_URL=')) {
          return trimmed.substring('DATABASE_URL='.length).trim().replace(/^['"]|['"]$/g, '');
        }
      }
    }
  }
  return '';
}

async function run() {
  const dbUrl = getDbUrl();
  console.log('Using DB URL:', dbUrl ? 'Found' : 'Not found');
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  
  const docTables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%doc%'");
  console.log('Doc tables:', docTables.rows.map(r => r.table_name));

  for (const row of docTables.rows) {
    const count = await client.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
    console.log(`Table ${row.table_name}: ${count.rows[0].count} rows`);
  }

  const voucherTables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND (table_name LIKE '%voucher%' OR table_name LIKE '%pdc%' OR table_name LIKE '%receipt%' OR table_name LIKE '%deposit%')");
  console.log('Voucher/PDC/Deposit tables:', voucherTables.rows.map(r => r.table_name));

  for (const row of voucherTables.rows) {
    const count = await client.query(`SELECT COUNT(*) FROM "${row.table_name}"`);
    console.log(`Table ${row.table_name}: ${count.rows[0].count} rows`);
  }

  await client.end();
}

run().catch(console.error);
