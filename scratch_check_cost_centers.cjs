const { Client } = require('pg');

async function checkCostCenters() {
  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  const countRes = await client.query('SELECT count(*) FROM public.fin_cost_centers');
  const count = parseInt(countRes.rows[0].count);
  console.log(`fin_cost_centers count: ${count}`);

  if (count === 0) {
    console.log('Inserting sample cost centers...');
    const samples = [
      { code: 'CC-RES', name: 'Cost Center - Residential', description: 'Residential Properties Cost Center', type: 'Property' },
      { code: 'CC-COM', name: 'Cost Center - Commercial', description: 'Commercial Properties Cost Center', type: 'Property' },
      { code: 'CC-RET', name: 'Cost Center - Retail', description: 'Retail Properties Cost Center', type: 'Property' }
    ];
    for (const sc of samples) {
      await client.query(
        'INSERT INTO public.fin_cost_centers (code, name, description, type, is_active) VALUES ($1, $2, $3, $4, true)',
        [sc.code, sc.name, sc.description, sc.type]
      );
    }
    console.log('Sample cost centers inserted.');
  } else {
    const res = await client.query('SELECT * FROM public.fin_cost_centers LIMIT 5');
    console.log('Sample cost centers:', res.rows);
  }

  await client.end();
}

checkCostCenters().catch(console.error);
