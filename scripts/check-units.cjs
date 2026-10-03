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
  
  // Check distinct status values in units
  const r1 = await client.query('SELECT status, COUNT(*) as cnt FROM units GROUP BY status ORDER BY cnt DESC');
  console.log('Unit statuses:', JSON.stringify(r1.rows));
  
  // Check if there is an occupancy_status or similar column
  const r2 = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'units' ORDER BY ordinal_position`);
  console.log('Units columns:', JSON.stringify(r2.rows.map(r => r.column_name)));
  
  // Check leases table if it exists
  const r3 = await client.query(`SELECT COUNT(*) as total FROM information_schema.tables WHERE table_name = 'leases'`);
  console.log('Leases table exists:', r3.rows[0].total);

  if (parseInt(r3.rows[0].total) > 0) {
    const r4 = await client.query('SELECT status, COUNT(*) as cnt FROM leases GROUP BY status');
    console.log('Lease statuses:', JSON.stringify(r4.rows));
  }
  
  await client.end();
})().catch(console.error);
