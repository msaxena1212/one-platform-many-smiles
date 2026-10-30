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

  const tables = ['units', 'properties', 'leases', 'pdcs', 'fin_pdc_register', 'customers'];
  for (const t of tables) {
    const res = await client.query(`SELECT count(*) FROM "${t}"`);
    console.log(`${t} count: ${res.rows[0].count}`);
  }

  const distinctUnits = await client.query('SELECT count(DISTINCT unit_name) FROM units');
  console.log('Distinct unit_name count:', distinctUnits.rows[0].count);

  await client.end();
}

main().catch(console.error);
