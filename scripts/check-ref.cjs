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

  const tables = ['leases', 'reservations', 'bookings', 'pdcs', 'fin_pdc_register', 'fin_customers', 'fin_vouchers', 'fin_voucher_lines'];
  for (const t of tables) {
    try {
      const res = await client.query(`SELECT count(*) FROM "${t}" WHERE customer_id = 'a77f423f-47a5-4a51-84c5-a537c016875c' OR tenant_id = 'a77f423f-47a5-4a51-84c5-a537c016875c'`);
      console.log(`References in ${t}:`, res.rows[0].count);
    } catch (e) {
      // ignore column not exist
    }
  }

  await client.end();
}

main().catch(console.error);
