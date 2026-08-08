const { Client } = require('pg');

async function checkCOASchemas() {
  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  const tables = ['erp_chart_of_accounts', 'unit_coas', 'units', 'assets'];
  
  for (const table of tables) {
    const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name=$1`, [table]);
    console.log(`\nColumns in public.${table}:`);
    console.log(res.rows.map(r => `${r.column_name} (${r.data_type})`));
    
    const count = await client.query(`SELECT COUNT(*) FROM public.${table}`);
    console.log(`Total rows in ${table}: ${count.rows[0].count}`);
  }

  const sampleCOA = await client.query('SELECT * FROM public.erp_chart_of_accounts LIMIT 3');
  console.log('\nSample erp_chart_of_accounts:', sampleCOA.rows);

  const sampleUnitCOA = await client.query('SELECT * FROM public.unit_coas LIMIT 3');
  console.log('\nSample unit_coas:', sampleUnitCOA.rows);

  await client.end();
}

checkCOASchemas().catch(console.error);
