const { Client } = require('pg');
const { connectionString, ssl } = require('./database-config.cjs');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = new Client({ connectionString, ssl });
  try {
    await client.connect();
    console.log('Connected to DB');
    const sql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/20260912000001_hrms_gl_accounts.sql'), 'utf8');
    await client.query(sql);
    console.log('Migration 20260912000001_hrms_gl_accounts.sql applied successfully!');
    const res = await client.query(`SELECT account_code, account_name, account_type FROM fin_coa_accounts WHERE account_code IN ('54100', '54200', '55000', '13100', '50100', '21900', '12000')`);
    console.log('Verified COA Accounts:', res.rows);
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await client.end().catch(() => {});
  }
}
runMigration();
