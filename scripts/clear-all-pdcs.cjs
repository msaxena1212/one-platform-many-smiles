/**
 * clear-all-pdcs.cjs
 * Deletes all rows from the PDC-related tables (pdcs + fin_pdc_register).
 * Run once to wipe stale/imported PDC data before fresh bulk upload.
 */
const { Client } = require('pg');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf-8');
let dbUrl = '';
envFile.split('\n').forEach(line => {
  if (line.startsWith('DATABASE_URL='))
    dbUrl = line.split('=').slice(1).join('=').trim().replace(/^['"]/, '').replace(/['"]\s*$/, '');
});

(async () => {
  const client = new Client({ connectionString: dbUrl });
  await client.connect();

  // Count before
  const beforePdcs    = (await client.query('SELECT COUNT(*) AS n FROM pdcs')).rows[0].n;
  const beforeFinPdcs = (await client.query('SELECT COUNT(*) AS n FROM fin_pdc_register')).rows[0].n;
  console.log(`Before: pdcs=${beforePdcs}, fin_pdc_register=${beforeFinPdcs}`);

  // Delete child table first (fin_pdc_register references pdcs via original_pdc_id)
  await client.query('DELETE FROM fin_pdc_register');
  console.log('✓ Deleted all rows from fin_pdc_register');

  await client.query('DELETE FROM pdcs');
  console.log('✓ Deleted all rows from pdcs');

  // Verify
  const afterPdcs    = (await client.query('SELECT COUNT(*) AS n FROM pdcs')).rows[0].n;
  const afterFinPdcs = (await client.query('SELECT COUNT(*) AS n FROM fin_pdc_register')).rows[0].n;
  console.log(`After:  pdcs=${afterPdcs}, fin_pdc_register=${afterFinPdcs}`);
  console.log('All PDC records cleared successfully.');

  await client.end();
})().catch(err => { console.error('Error:', err.message); process.exit(1); });
