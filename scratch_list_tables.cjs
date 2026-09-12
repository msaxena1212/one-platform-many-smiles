const { Client } = require('pg');

async function listTables() {
  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:A6TeHnuvQfFqMHMZ@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  const res = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);

  console.log('Tables in public schema:');
  console.log(JSON.stringify(res.rows.map(r => r.table_name), null, 2));
  
  await client.end();
}

listTables().catch(console.error);
