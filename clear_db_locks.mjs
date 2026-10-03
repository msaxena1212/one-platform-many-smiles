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
      SELECT pid, usename, state, query, query_start, age(clock_timestamp(), query_start) as duration
      FROM pg_stat_activity
      WHERE state != 'idle' AND pid != pg_backend_pid();
    `);
    console.log('--- Active Postgres Queries ---');
    console.log(res.rows);

    // Terminate any stuck locks/transactions
    for (const r of res.rows) {
      if (r.duration && r.duration.seconds > 10) {
        console.log(`Terminating stuck pid: ${r.pid} (query: ${r.query})`);
        await client.query(`SELECT pg_terminate_backend($1)`, [r.pid]);
      }
    }
    console.log('Done checking locks.');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
