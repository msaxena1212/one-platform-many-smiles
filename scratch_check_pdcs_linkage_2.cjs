const { Client } = require('pg');

async function checkAndLink() {
  const client = new Client({ connectionString: "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres" });
  await client.connect();

  console.log('Fetching all units...');
  const units = await client.query('SELECT * FROM public.units');
  console.log(`Found ${units.rowCount} units.`);

  console.log('Fetching all properties...');
  const props = await client.query('SELECT * FROM public.properties');
  console.log(`Found ${props.rowCount} properties.`);

  console.log('Fetching all pdcs...');
  const pdcs = await client.query('SELECT * FROM public.pdcs');
  console.log(`Found ${pdcs.rowCount} pdcs.`);

  console.log('Fetching all contracts...');
  const contracts = await client.query('SELECT * FROM public.contracts');
  console.log(`Found ${contracts.rowCount} contracts.`);

  // Let's see if contracts have invalid property_id or unit_id
  const invalidContracts = contracts.rows.filter(c => {
    const hasProp = props.rows.some(p => p.id === c.property_id);
    const hasUnit = units.rows.some(u => u.id === c.unit_id);
    return !hasProp || !hasUnit;
  });
  console.log(`Contracts with invalid property or unit: ${invalidContracts.length}`);
  if (invalidContracts.length > 0) {
    console.log(invalidContracts.slice(0, 2));
  }

  // Let's see if pdcs have invalid contract_id
  const invalidPDCs = pdcs.rows.filter(p => !contracts.rows.some(c => c.id === p.contract_id));
  console.log(`PDCs with invalid contract: ${invalidPDCs.length}`);

  // Let's check PDC finance mappings (pdc_in_hand, deposit, receivables) for units
  console.log('Checking units for finance mappings...');
  const missingUnitFinance = units.rows.filter(u => !u.pdc_in_hand || !u.deposit || !u.receivables);
  console.log(`Units with missing finance details: ${missingUnitFinance.length}`);

  if (missingUnitFinance.length > 0) {
    console.log('Sample missing finance units:', missingUnitFinance.slice(0, 3).map(u => ({ property_id: u.property_id, unit_code: u.unit_code })));
  }

  await client.end();
}

checkAndLink().catch(console.error);
