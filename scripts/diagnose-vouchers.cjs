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

  const pdcCols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'pdcs'");
  console.log('pdcs cols:', pdcCols.rows.map(r => r.column_name));

  const samplePdc = await client.query("SELECT * FROM pdcs LIMIT 1");
  console.log('sample pdc:', samplePdc.rows[0]);

  const sampleFin = await client.query("SELECT * FROM fin_pdc_register LIMIT 1");
  console.log('sample fin_pdc_register:', sampleFin.rows[0]);

  const allProps = await client.query("SELECT id, title, property_code FROM properties ORDER BY title");
  console.log('All DB properties count:', allProps.rows.length);
  console.log('Properties:', allProps.rows.map(r => `${r.property_code}: ${r.title}`));

  const allUnits = await client.query("SELECT id, unit_ref, unit_name, property_id, current_tenant FROM units");
  console.log('All DB units count:', allUnits.rows.length);

  const allCusts = await client.query("SELECT id, name, full_name, customer_type FROM customers");
  console.log('All DB customers count:', allCusts.rows.length);

  await client.end();
}

main().catch(console.error);
