const { Client } = require('pg');

async function linkAssets() {
  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  console.log('Fetching properties...');
  const props = await client.query('SELECT id, property_code FROM public.properties');
  const propMap = new Map();
  for (const p of props.rows) {
    if (p.property_code) {
      propMap.set(p.property_code.toLowerCase(), p.id);
    }
  }

  console.log('Fetching units...');
  const units = await client.query('SELECT id, unit_code, property_id FROM public.units');
  // the unit_code in DB might be just "Flat09", but in assets it might be "BinOmran1-Flat09". Let's fetch all and see.

  console.log('Fetching assets...');
  const assets = await client.query('SELECT id, assigned_property_code, assigned_unit_code FROM public.assets');

  let propLinked = 0;
  let unitLinked = 0;

  for (const asset of assets.rows) {
    let updatePropId = null;
    let updateUnitId = null;

    if (asset.assigned_property_code) {
      const pId = propMap.get(asset.assigned_property_code.toLowerCase());
      if (pId) {
        updatePropId = pId;
      }
    }

    if (asset.assigned_unit_code && updatePropId) {
      // Extract the unit code part (e.g. "BinOmran1-Flat09" -> "Flat09")
      const parts = asset.assigned_unit_code.split('-');
      const uCode = parts.length > 1 ? parts[parts.length - 1].trim() : asset.assigned_unit_code.trim();
      
      const u = units.rows.find(u => u.property_id === updatePropId && u.unit_code.toLowerCase() === uCode.toLowerCase());
      if (u) {
        updateUnitId = u.id;
      }
    }

    if (updatePropId || updateUnitId) {
      await client.query(`
        UPDATE public.assets 
        SET assigned_property_id = $1, assigned_unit_id = $2
        WHERE id = $3
      `, [updatePropId, updateUnitId, asset.id]);
      
      if (updatePropId) propLinked++;
      if (updateUnitId) unitLinked++;
    }
  }

  console.log(`Successfully linked ${propLinked} properties and ${unitLinked} units to assets.`);
  await client.end();
}

linkAssets().catch(console.error);
