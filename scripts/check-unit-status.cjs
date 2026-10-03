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
  
  // Check status column values
  const r1 = await client.query(`SELECT status, COUNT(*) as cnt FROM units GROUP BY status ORDER BY cnt DESC`);
  console.log('status values:', JSON.stringify(r1.rows));
  
  // Check lease_status column values
  const r2 = await client.query(`SELECT lease_status, COUNT(*) as cnt FROM units GROUP BY lease_status ORDER BY cnt DESC`);
  console.log('lease_status values:', JSON.stringify(r2.rows));
  
  await client.end();
})().catch(console.error);
