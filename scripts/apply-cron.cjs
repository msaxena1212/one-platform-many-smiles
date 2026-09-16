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
  const sql = fs.readFileSync('supabase/migrations/20260915130000_cron_automations.sql', 'utf-8');
  await client.query(sql);
  console.log('Cron jobs updated to Qatar Standard Time (UTC+3) successfully!');

  // Verify scheduled jobs
  const { rows } = await client.query("SELECT jobname, schedule, command FROM cron.job ORDER BY jobname");
  console.log('\nScheduled cron jobs:');
  rows.forEach(r => console.log(`  [${r.jobname}]  schedule: ${r.schedule}`));
  await client.end();
}

main().catch(err => { console.error(err.message); process.exit(1); });
