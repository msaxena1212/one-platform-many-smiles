const { Client } = require('pg');

async function checkCOABreakdown() {
  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  const types = await client.query('SELECT type, COUNT(*) FROM public.erp_chart_of_accounts GROUP BY type');
  console.log('COA Breakdown by type:');
  console.log(types.rows);

  const missingTypes = await client.query("SELECT COUNT(*) FROM public.erp_chart_of_accounts WHERE type IS NULL OR type = ''");
  console.log(`\nRows with missing type: ${missingTypes.rows[0].count}`);

  await client.end();
}

checkCOABreakdown().catch(console.error);
