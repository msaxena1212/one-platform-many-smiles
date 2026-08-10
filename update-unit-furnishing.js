import { Client } from 'pg';

async function run() {
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Updating units with furnishing data...');
    const res = await client.query('SELECT id FROM public.units');
    const furnishingOptions = ["Fully Furnished", "Semi Furnished", "Unfurnished"];
    for (let i = 0; i < res.rows.length; i++) {
      const u = res.rows[i];
      const furnishing = furnishingOptions[Math.floor(Math.random() * furnishingOptions.length)];
      
      await client.query(`
        UPDATE public.units 
        SET furnishing = $1 
        WHERE id = $2
      `, [furnishing, u.id]);
    }
    console.log('Updated', res.rows.length, 'units with furnishing data.');
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
