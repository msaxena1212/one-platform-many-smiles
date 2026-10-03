import pg from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const sql = fs.readFileSync('migration_coa_hierarchy.sql', 'utf8');
  const client = await pool.connect();
  try {
    console.log('Running migration_coa_hierarchy.sql...');
    await client.query(sql);
    console.log('Migration executed successfully!');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
