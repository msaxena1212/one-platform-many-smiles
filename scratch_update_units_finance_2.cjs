const fs = require('fs');
const { Client } = require('pg');

async function updateUnits() {
  const content = fs.readFileSync('extracted_units.txt', 'utf8');
  const lines = content.split('\n');
  
  let started = false;
  const updates = [];

  for (const line of lines) {
    if (line.includes('Property Name\tUnit Code')) {
      started = true;
      continue;
    }
    if (!started || line.trim() === '') continue;

    const parts = line.split('\t');
    if (parts.length >= 8) {
      const [
        propName,
        fullUnitCode,
        pdcCode,
        pdcName,
        depCode,
        depName,
        recCode,
        recName
      ] = parts.map(p => p.trim());

      if (fullUnitCode && pdcCode) {
        // e.g. "AAA - GF1" -> propCode: "AAA", unitCode: "GF1"
        // "Bin Omran 2 - Flat01" -> propCode: "Bin Omran 2", unitCode: "Flat01"
        const dashIdx = fullUnitCode.lastIndexOf('-');
        if (dashIdx > -1) {
          const propCode = fullUnitCode.substring(0, dashIdx).trim();
          let unitCode = fullUnitCode.substring(dashIdx + 1).trim();
          
          // "FT:11" in TSV -> "Flat11" ? 
          // Let's check for "FT:" and replace with "Flat" if needed, wait the log showed "Flat11".
          if (unitCode.startsWith('FT:')) {
            unitCode = unitCode.replace('FT:', 'Flat');
          }

          updates.push({
            fullUnitCode,
            propCode,
            unitCode,
            pdcCode,
            pdcName,
            depCode,
            depName,
            recCode,
            recName
          });
        }
      }
    }
  }

  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  console.log(`Parsed ${updates.length} records. Updating units...`);

  // load properties
  const props = await client.query('SELECT id, property_code FROM public.properties');
  const propMap = new Map();
  for (const p of props.rows) {
    if (p.property_code) {
      propMap.set(p.property_code.toLowerCase(), p.id);
    }
  }

  let successCount = 0;
  for (const up of updates) {
    const propId = propMap.get(up.propCode.toLowerCase());
    if (!propId) {
      console.log(`Property not found for code: ${up.propCode}`);
      continue;
    }

    const res = await client.query('SELECT id FROM public.units WHERE property_id = $1 AND unit_code = $2', [propId, up.unitCode]);
    if (res.rowCount > 0) {
      const unitId = res.rows[0].id;
      await client.query(`
        UPDATE public.units 
        SET 
          pdc_in_hand_code = $1,
          pdc_in_hand_name = $2,
          deposit_code = $3,
          deposit_name = $4,
          receivables_code = $5,
          receivables_name = $6
        WHERE id = $7
      `, [
        up.pdcCode,
        up.pdcName,
        up.depCode,
        up.depName,
        up.recCode,
        up.recName,
        unitId
      ]);
      successCount++;
    } else {
      console.log(`Unit not found in property ${up.propCode} for unit_code: ${up.unitCode} (from ${up.fullUnitCode})`);
    }
  }

  console.log(`Successfully updated ${successCount} units.`);
  await client.end();
}

updateUnits().catch(console.error);
