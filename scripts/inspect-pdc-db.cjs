const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rnebpqnzignwjeukgztz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  // 1. Fetch 100 rows from fin_pdc_register
  const { data: finRows } = await supabase.from('fin_pdc_register').select('*').limit(20);
  console.log('fin_pdc_register columns and sample:', Object.keys(finRows[0] || {}), finRows.slice(0, 3));

  // Count how many in fin_pdc_register have tenant info or property info
  const { data: allFin } = await supabase.from('fin_pdc_register').select('*').range(0, 2000);
  console.log('Total fin fetched:', allFin?.length);
  
  let finWithTenant = 0, finWithProp = 0, finWithUnit = 0;
  allFin?.forEach(r => {
    if (r.tenant_name || r.tenant_id) finWithTenant++;
    if (r.property_name || r.property_code || r.property_id) finWithProp++;
    if (r.unit_name || r.unit_ref || r.unit_id) finWithUnit++;
  });
  console.log({ finWithTenant, finWithProp, finWithUnit });

  // 2. Fetch all from pdcs table
  const { data: allPdcs } = await supabase.from('pdcs').select('*').range(0, 2000);
  console.log('Total pdcs fetched:', allPdcs?.length);
  let pdcWithTenant = 0, pdcWithProp = 0, pdcWithUnit = 0;
  allPdcs?.forEach(r => {
    if (r.tenant_name || r.tenant_id) pdcWithTenant++;
    if (r.property_name || r.property_code || r.property_id) pdcWithProp++;
    if (r.unit_name || r.unit_ref || r.unit_id) pdcWithUnit++;
  });
  console.log({ pdcWithTenant, pdcWithProp, pdcWithUnit });

  // 3. Check if we have localStorage / import files / units matching
  // Check units table: current_tenant, contract_no, unit_ref, property_id
  const { data: allUnits } = await supabase.from('units').select('id, unit_ref, unit_name, current_tenant, properties(id, title, property_code)').range(0, 1000);
  console.log('Total units fetched:', allUnits?.length);
  const unitsWithTenant = allUnits?.filter(u => u.current_tenant);
  console.log('Units with current_tenant:', unitsWithTenant?.length);

  // Check how cheques link to units or customers or properties
  // Let's check some cheque_numbers in fin_pdc_register vs pdcs
  const pdcChequeMap = new Map();
  allPdcs?.forEach(p => {
    if (p.cheque_number) pdcChequeMap.set(String(p.cheque_number).trim(), p);
  });
  console.log('Unique cheque numbers in pdcs table:', pdcChequeMap.size);

  let matchCount = 0;
  allFin?.forEach(f => {
    if (f.cheque_number && pdcChequeMap.has(String(f.cheque_number).trim())) matchCount++;
  });
  console.log('fin_pdc_register cheques matching pdcs table:', matchCount);
}

check().catch(console.error);
