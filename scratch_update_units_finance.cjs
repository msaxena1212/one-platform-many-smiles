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
        unitCode,
        pdcCode,
        pdcName,
        depCode,
        depName,
        recCode,
        recName
      ] = parts.map(p => p.trim());

      if (unitCode && pdcCode) {
        updates.push({
          unitCode,
          pdcCode,
          pdcName,
          depCode,
          depName,
          recCode,
          recName
        });
      }
    } else if (parts.length > 1) {
       // Just in case it's space separated or something else, but we assume TSV
    }
  }

  console.log(`Parsed ${updates.length} records to update.`);

  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  let successCount = 0;
  for (const up of updates) {
    // Find the unit by unit_code
    const res = await client.query('SELECT id FROM public.units WHERE unit_code = $1', [up.unitCode]);
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
      console.log(`Unit not found for unit_code: ${up.unitCode}`);
    }
  }

  console.log(`Successfully updated ${successCount} units.`);
  await client.end();
}

updateUnits().catch(console.error);
