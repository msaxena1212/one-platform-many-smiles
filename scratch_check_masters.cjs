const { Client } = require('pg');

async function checkMasters() {
  const client = new Client({ connectionString: 'postgresql://postgres.rnebpqnzignwjeukgztz:A6TeHnuvQfFqMHMZ@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres' });
  await client.connect();
  const tables = ['fin_financial_years', 'fin_regions', 'fin_cost_centers', 'fin_posting_periods', 'fin_coa_accounts', 'erp_chart_of_accounts'];
  for (const t of tables) {
    const res = await client.query(`SELECT count(*) FROM "${t}";`);
    console.log(`${t} count: ${res.rows[0].count}`);
  }
  await client.end();
}
checkMasters().catch(console.error);
