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
  const sql = fs.readFileSync('supabase/migrations/20260915160000_security_audit_log_table.sql', 'utf-8');
  await client.query(sql);
  console.log('Security audit log table created successfully!');
  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
