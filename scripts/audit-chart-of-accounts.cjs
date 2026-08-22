const { Client } = require('pg');
const { connectionString } = require('./database-config.cjs');

const client = new Client({ connectionString });

async function main() {
  await client.connect();

  const result = await client.query(`
    SELECT *
    FROM erp_chart_of_accounts
    ORDER BY account_code;
  `);

  console.table(result.rows);

  await client.end();
}

main().catch(async error => {
  console.error(error);
  try { await client.end(); } catch {}
  process.exit(1);
});
