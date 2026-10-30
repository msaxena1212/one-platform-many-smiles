const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rnebpqnzignwjeukgztz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function analyze() {
  // 1. Fetch all pdcs
  const { data: pdcs } = await supabase.from('pdcs').select('*').range(0, 2000);
  console.log('pdcs count:', pdcs?.length);
  // Show 5 distinct properties and units in pdcs
  const propUnitSet = new Set();
  pdcs?.forEach(p => {
    propUnitSet.add(`${p.property_code || p.property_name} | ${p.unit_name || p.unit_ref} | ${p.tenant_name}`);
  });
  console.log('Unique prop/unit/tenant combos in pdcs table:', propUnitSet.size);
  console.log('Sample combos from pdcs:', Array.from(propUnitSet).slice(0, 10));

  // 2. Fetch all units
  let allUnits = [];
  let from = 0;
  while (true) {
    const { data } = await supabase.from('units').select('id, unit_ref, unit_name, current_tenant, current_rent, price, property_id, properties(id, title, property_code)').range(from, from + 999);
    if (!data || data.length === 0) break;
    allUnits = allUnits.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log('Total units:', allUnits.length);
  const unitsWithTenant = allUnits.filter(u => u.current_tenant);
  console.log('Units with current_tenant:', unitsWithTenant.length);
  console.log('Sample units with current_tenant:', unitsWithTenant.slice(0, 5).map(u => ({
    prop: u.properties?.title || u.properties?.property_code,
    unit: u.unit_ref || u.unit_name,
    tenant: u.current_tenant,
    rent: u.current_rent || u.price
  })));

  // 3. Fetch all customers
  let allCusts = [];
  from = 0;
  while (true) {
    const { data } = await supabase.from('customers').select('*').range(from, from + 999);
    if (!data || data.length === 0) break;
    allCusts = allCusts.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log('Total customers:', allCusts.length);

  // 4. Fetch all fin_pdc_register
  let allFin = [];
  from = 0;
  while (true) {
    const { data } = await supabase.from('fin_pdc_register').select('*').range(from, from + 999);
    if (!data || data.length === 0) break;
    allFin = allFin.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log('Total fin_pdc_register:', allFin.length);
  
  // Let's see if fin_pdc_register amounts match any unit rents or customer names
  // Check how many pdcs in allFin have matching cheque_number in pdcs
  const pdcByCheque = new Map();
  pdcs?.forEach(p => {
    if (p.cheque_number) pdcByCheque.set(String(p.cheque_number).trim(), p);
  });

  let matchedByChq = 0;
  let unmatchedFin = [];
  allFin.forEach(f => {
    const p = pdcByCheque.get(String(f.cheque_number).trim());
    if (p) matchedByChq++;
    else unmatchedFin.push(f);
  });
  console.log({ matchedByChq, unmatchedCount: unmatchedFin.length });
  console.log('Sample unmatched fin_pdc_register:', unmatchedFin.slice(0, 5));
}

analyze().catch(console.error);
