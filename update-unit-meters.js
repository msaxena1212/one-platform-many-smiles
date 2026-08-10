import { Client } from 'pg';

async function run() {
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Updating units with floor, e-meter, w-meter...');
    const res = await client.query('SELECT id, unit_ref FROM public.units');
    for (let i = 0; i < res.rows.length; i++) {
      const u = res.rows[i];
      const floor = "Floor " + (Math.floor(Math.random() * 10) + 1);
      const eMeter = "E" + Math.floor(100000 + Math.random() * 900000);
      const wMeter = "W" + Math.floor(100000 + Math.random() * 900000);
      
      await client.query(`
        UPDATE public.units 
        SET floor = $1, electricity_meter_no = $2, water_meter_no = $3 
        WHERE id = $4
      `, [floor, eMeter, wMeter, u.id]);
    }
    console.log('Updated', res.rows.length, 'units.');
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}
run();
