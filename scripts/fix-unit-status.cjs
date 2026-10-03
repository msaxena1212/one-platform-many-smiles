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
  
  console.log('Fixing 22 units that have current_tenant but status=Available/Vacant...');
  
  // Update status to 'Occupied' and lease_status to 'Leased' for units that have a current_tenant but wrong status
  const result = await client.query(`
    UPDATE units
    SET 
      status = 'Occupied',
      lease_status = 'Leased'
    WHERE 
      current_tenant IS NOT NULL 
      AND current_tenant != ''
      AND (status = 'Available' OR lease_status = 'Vacant' OR lease_status IS NULL)
    RETURNING id, unit_name, unit_ref, current_tenant, status, lease_status
  `);
  
  console.log(`Updated ${result.rowCount} units`);
  if (result.rows.length > 0) {
    result.rows.forEach(r => {
      console.log(`  - ${r.unit_ref || r.unit_name}: tenant="${r.current_tenant}" -> status=${r.status}, lease_status=${r.lease_status}`);
    });
  }
  
  // Verify final counts
  const r2 = await client.query(`SELECT status, COUNT(*) as cnt FROM units GROUP BY status ORDER BY cnt DESC`);
  console.log('\nFinal unit status counts:', JSON.stringify(r2.rows));
  
  const r3 = await client.query(`SELECT lease_status, COUNT(*) as cnt FROM units GROUP BY lease_status ORDER BY cnt DESC`);
  console.log('Final lease_status counts:', JSON.stringify(r3.rows));
  
  await client.end();
})().catch(console.error);
