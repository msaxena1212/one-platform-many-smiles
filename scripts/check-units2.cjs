const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL=')) dbUrl = line.split('=').slice(1).join('=').trim().replace(/^['"]/, '').replace(/['"]\s*$/, '');
});

(async () => {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();
  
  // Check units columns
  const r1 = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'units' ORDER BY ordinal_position`);
  console.log('Units columns:', r1.rows.map(r => r.column_name).join(', '));
  
  // Check leases columns
  const r2 = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'leases' ORDER BY ordinal_position`);
  console.log('Leases columns:', r2.rows.map(r => r.column_name).join(', '));
  
  // Check sample rows from leases
  const r3 = await client.query('SELECT * FROM leases LIMIT 3');
  console.log('Leases sample:', JSON.stringify(r3.rows));
  
  // Check current_tenant column in units
  const r4 = await client.query(`SELECT COUNT(*) as with_tenant, COUNT(CASE WHEN current_tenant IS NOT NULL AND current_tenant != '' THEN 1 END) as occupied FROM units`);
  console.log('Units with tenant:', JSON.stringify(r4.rows));
  
  await client.end();
})().catch(console.error);
