import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT routine_name, routine_type 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      ORDER BY routine_name;
    `);
    console.log('--- Public Postgres Routines ---');
    console.log(res.rows.map(r => `${r.routine_name} (${r.routine_type})`).join('\n'));

    // Check unit_coas table schema and count
    const uCoas = await client.query(`SELECT count(*) FROM "unit_coas"`);
    console.log(`\nunit_coas count: ${uCoas.rows[0].count}`);

    // Check fin_coa_accounts count and erp_chart_of_accounts count
    const finCoa = await client.query(`SELECT count(*) FROM "fin_coa_accounts"`);
    console.log(`fin_coa_accounts count: ${finCoa.rows[0].count}`);

    const erpCoa = await client.query(`SELECT count(*) FROM "erp_chart_of_accounts"`);
    console.log(`erp_chart_of_accounts count: ${erpCoa.rows[0].count}`);

    const rules = await client.query(`SELECT count(*) FROM "fin_transaction_account_rules"`);
    console.log(`fin_transaction_account_rules count: ${rules.rows[0].count}`);

    const units = await client.query(`SELECT count(*) FROM "units"`);
    console.log(`units count: ${units.rows[0].count}`);

  } catch (err) {
    console.error('Postgres Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
