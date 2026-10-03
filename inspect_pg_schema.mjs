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
    console.log('Connected to Postgres successfully!');
    
    // 1. List all public tables
    const resTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    console.log('\n--- Public Tables ---');
    console.log(resTables.rows.map(r => r.table_name).join(', '));

    // 2. Check specific COA / Finance tables
    const coaTables = [
      'fin_coa_accounts', 
      'erp_chart_of_accounts', 
      'fin_unit_sl_accounts', 
      'fin_transaction_account_rules',
      'fin_vouchers',
      'fin_voucher_lines',
      'fin_accounting_events',
      'fin_accounting_event_lines',
      'unit_coa_mapping'
    ];

    for (const t of coaTables) {
      const exists = resTables.rows.some(r => r.table_name === t);
      if (exists) {
        const countRes = await client.query(`SELECT count(*) FROM "${t}"`);
        const colRes = await client.query(`
          SELECT column_name, data_type, is_nullable 
          FROM information_schema.columns 
          WHERE table_schema = 'public' AND table_name = '${t}'
          ORDER BY ordinal_position;
        `);
        console.log(`\nTable [${t}] - Rows: ${countRes.rows[0].count}`);
        console.log('Columns:', colRes.rows.map(c => `${c.column_name} (${c.data_type})`).join(', '));
      } else {
        console.log(`\nTable [${t}] - DOES NOT EXIST`);
      }
    }

  } catch (err) {
    console.error('Postgres Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
