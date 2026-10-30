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
  const tables = ['collection_receipts', 'leases', 'fin_vouchers', 'fin_voucher_lines'];
  for (const table of tables) {
    const res = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position",
      [table]
    );
    console.log(`\nColumns in ${table}:`, res.rows.map(r => r.column_name));
  }
  await client.end();
}

main().catch(console.error);
