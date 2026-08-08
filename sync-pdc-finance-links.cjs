const { Client } = require('pg');

const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function mapPDCFinanceLinks() {
  console.log('Connecting to PostgreSQL database...');
  const client = new Client({ connectionString });
  await client.connect();

  console.log('Adding property_id, unit_id, and AC code columns to public.pdcs if missing...');
  await client.query(`
    ALTER TABLE public.pdcs ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
    ALTER TABLE public.pdcs ADD COLUMN IF NOT EXISTS unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL;
    ALTER TABLE public.pdcs ADD COLUMN IF NOT EXISTS pdc_in_hand_code TEXT;
    ALTER TABLE public.pdcs ADD COLUMN IF NOT EXISTS pdc_in_hand_name TEXT;
    ALTER TABLE public.pdcs ADD COLUMN IF NOT EXISTS deposit_code TEXT;
    ALTER TABLE public.pdcs ADD COLUMN IF NOT EXISTS deposit_name TEXT;
    ALTER TABLE public.pdcs ADD COLUMN IF NOT EXISTS receivables_code TEXT;
    ALTER TABLE public.pdcs ADD COLUMN IF NOT EXISTS receivables_name TEXT;
  `);

  console.log('Fetching Properties and Units for mapping...');
  const propsRes = await client.query('SELECT id, property_code, title FROM public.properties');
  const unitsRes = await client.query('SELECT id, unit_code, unit_name, unit_ref, property_id, pdc_in_hand_code, pdc_in_hand_name, deposit_code, deposit_name, receivables_code, receivables_name FROM public.units');

  // Property mapping
  const propMap = {};
  propsRes.rows.forEach(p => {
    if (p.property_code) propMap[p.property_code.trim().toLowerCase()] = p;
    if (p.title) propMap[p.title.trim().toLowerCase()] = p;
  });

  // Manual property aliases
  const binOmran1 = propsRes.rows.find(p => p.property_code === 'BIN OMRAN 1');
  const binOmran2 = propsRes.rows.find(p => p.property_code === 'BIN OMRAN 2');
  const musheireb05 = propsRes.rows.find(p => p.property_code === 'MUSHEIREB - 05');
  const naser03 = propsRes.rows.find(p => p.property_code === 'NASER - 03');
  propMap['bin omran 3'] = binOmran2 || binOmran1;
  propMap['musheireb - 06'] = musheireb05;
  propMap['naser - 04'] = naser03;

  // Unit mapping lookup
  const unitMap = {};
  unitsRes.rows.forEach(u => {
    if (u.unit_name) unitMap[`${u.property_id}_${u.unit_name.trim().toLowerCase()}`] = u;
    if (u.unit_code) unitMap[`${u.property_id}_${u.unit_code.trim().toLowerCase()}`] = u;
    if (u.unit_ref) unitMap[`${u.property_id}_${u.unit_ref.trim().toLowerCase()}`] = u;
    if (u.unit_name) unitMap[u.unit_name.trim().toLowerCase()] = u;
    if (u.unit_code) unitMap[u.unit_code.trim().toLowerCase()] = u;
  });

  console.log('Fetching all PDCs...');
  const pdcsRes = await client.query('SELECT id, property_code, unit_name FROM public.pdcs');
  console.log(`Mapping ${pdcsRes.rows.length} PDC records...`);

  let mappedPropCount = 0;
  let mappedUnitCount = 0;

  for (const pdc of pdcsRes.rows) {
    const rawProp = pdc.property_code ? pdc.property_code.trim() : '';
    const rawUnit = pdc.unit_name ? pdc.unit_name.trim() : '';

    let matchedProp = null;
    if (rawProp) {
      const pKey = rawProp.toLowerCase();
      matchedProp = propMap[pKey] || propsRes.rows.find(p => p.title && p.title.toLowerCase().includes(pKey) || p.property_code && p.property_code.toLowerCase().includes(pKey));
    }

    let matchedUnit = null;
    if (matchedProp && rawUnit) {
      const uKey = rawUnit.toLowerCase();
      matchedUnit = unitMap[`${matchedProp.id}_${uKey}`];
      if (!matchedUnit && rawUnit.includes('-')) {
        const simpleU = rawUnit.split('-').pop().trim().toLowerCase();
        matchedUnit = unitMap[`${matchedProp.id}_${simpleU}`];
      }
    }
    if (!matchedUnit && rawUnit) {
      matchedUnit = unitMap[rawUnit.toLowerCase()];
    }

    const propId = matchedProp ? matchedProp.id : (matchedUnit ? matchedUnit.property_id : null);
    const unitId = matchedUnit ? matchedUnit.id : null;

    if (propId) mappedPropCount++;
    if (unitId) mappedUnitCount++;

    const pdcCode = matchedUnit ? matchedUnit.pdc_in_hand_code : null;
    const pdcName = matchedUnit ? matchedUnit.pdc_in_hand_name : null;
    const depCode = matchedUnit ? matchedUnit.deposit_code : null;
    const depName = matchedUnit ? matchedUnit.deposit_name : null;
    const recCode = matchedUnit ? matchedUnit.receivables_code : null;
    const recName = matchedUnit ? matchedUnit.receivables_name : null;

    await client.query(`
      UPDATE public.pdcs
      SET property_id = $1,
          unit_id = $2,
          pdc_in_hand_code = $3,
          pdc_in_hand_name = $4,
          deposit_code = $5,
          deposit_name = $6,
          receivables_code = $7,
          receivables_name = $8
      WHERE id = $9
    `, [propId, unitId, pdcCode, pdcName, depCode, depName, recCode, recName, pdc.id]);
  }

  console.log(`\n================ PDC FINANCE LINKAGE SUMMARY ================`);
  console.log(`- Total PDCs: ${pdcsRes.rows.length}`);
  console.log(`- PDCs Mapped to Property UUID: ${mappedPropCount}`);
  console.log(`- PDCs Mapped to Unit UUID: ${mappedUnitCount}`);
  console.log(`=============================================================\n`);

  await client.end();
}

mapPDCFinanceLinks().catch(console.error);
