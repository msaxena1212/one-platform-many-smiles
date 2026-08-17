/**
 * update-cost-centers.cjs
 * Creates cost centers for all Properties and Units.
 */
const { Client } = require('pg');

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  console.log('Connected to PostgreSQL');

  try {
    // Get all properties
    const props = await client.query('SELECT id, property_code, title as property_name FROM public.properties');
    console.log(`Found ${props.rowCount} properties`);

    // Get all units
    const units = await client.query('SELECT id, unit_code, unit_name FROM public.units');
    console.log(`Found ${units.rowCount} units`);

    await client.query('BEGIN');

    let inserted = 0;
    
    // Insert property cost centers
    for (const p of props.rows) {
      if (!p.property_code) continue;
      const code = `CC-PRP-${p.property_code}`;
      const name = `Property: ${p.property_name || p.property_code}`;
      
      const res = await client.query(`
        INSERT INTO public.fin_cost_centers (code, name)
        VALUES ($1, $2)
        ON CONFLICT (code) DO NOTHING
      `, [code, name]);
      inserted += res.rowCount;
    }

    // Insert unit cost centers
    for (const u of units.rows) {
      if (!u.unit_code) continue;
      const code = `CC-UNT-${u.unit_code}`;
      const name = `Unit: ${u.unit_name || u.unit_code}`;
      
      const res = await client.query(`
        INSERT INTO public.fin_cost_centers (code, name)
        VALUES ($1, $2)
        ON CONFLICT (code) DO NOTHING
      `, [code, name]);
      inserted += res.rowCount;
    }

    await client.query('COMMIT');
    console.log(`Successfully added ${inserted} new cost centers.`);

  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error:', e.message);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
