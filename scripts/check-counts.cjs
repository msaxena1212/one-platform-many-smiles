const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rnebpqnzignwjeukgztz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { count: propCount } = await supabase.from('properties').select('*', { count: 'exact', head: true });
  const { count: unitCount } = await supabase.from('units').select('*', { count: 'exact', head: true });
  const { count: custCount } = await supabase.from('customers').select('*', { count: 'exact', head: true });
  const { count: leaseCount } = await supabase.from('leases').select('*', { count: 'exact', head: true });
  const { count: pdcCount } = await supabase.from('pdcs').select('*', { count: 'exact', head: true });
  const { count: finPdcCount } = await supabase.from('fin_pdc_register').select('*', { count: 'exact', head: true });
  const { count: assetCount } = await supabase.from('assets').select('*', { count: 'exact', head: true });
  const { count: warrantyCount } = await supabase.from('asset_warranties').select('*', { count: 'exact', head: true });
  const { count: employeeCount } = await supabase.from('employees').select('*', { count: 'exact', head: true });
  
  console.log(JSON.stringify({
    propCount,
    unitCount,
    custCount,
    leaseCount,
    pdcCount,
    finPdcCount,
    assetCount,
    warrantyCount,
    employeeCount
  }, null, 2));

  // Check some pdc samples
  const { data: pdcSamples } = await supabase.from('pdcs').select('*').limit(3);
  console.log('pdc samples:', pdcSamples);

  const { data: finPdcSamples } = await supabase.from('fin_pdc_register').select('*').limit(3);
  console.log('fin_pdc samples:', finPdcSamples);

  // Check properties and units samples
  const { data: props } = await supabase.from('properties').select('id, title, property_code');
  console.log(`Fetched ${props?.length} properties`);
  
  const { data: allPdcs, count: pdcExact } = await supabase.from('pdcs').select('id, cheque_number, property_code, property_name, unit_name, unit_ref, tenant_name, amount').range(0, 2000);
  console.log(`Fetched ${allPdcs?.length} rows from pdcs table. Exact count: ${pdcExact}`);

  const { data: allFinPdcs, count: finExact } = await supabase.from('fin_pdc_register').select('id, cheque_number, property_name, property_code, unit_ref, unit_name, tenant_name, amount').range(0, 2000);
  console.log(`Fetched ${allFinPdcs?.length} rows from fin_pdc_register. Exact count: ${finExact}`);

  // Count distinct properties, units, tenants in pdcs
  if (allPdcs) {
    const pSet = new Set(allPdcs.map(p => p.property_name || p.property_code).filter(Boolean));
    const uSet = new Set(allPdcs.map(p => p.unit_name || p.unit_ref).filter(Boolean));
    const tSet = new Set(allPdcs.map(p => p.tenant_name).filter(Boolean));
    console.log(`In pdcs table: ${pSet.size} properties, ${uSet.size} units, ${tSet.size} tenant names`);
  }

  if (allFinPdcs) {
    const pSet = new Set(allFinPdcs.map(p => p.property_name || p.property_code).filter(Boolean));
    const uSet = new Set(allFinPdcs.map(p => p.unit_ref || p.unit_name).filter(Boolean));
    const tSet = new Set(allFinPdcs.map(p => p.tenant_name).filter(Boolean));
    console.log(`In fin_pdc_register: ${pSet.size} properties, ${uSet.size} units, ${tSet.size} tenant names`);
  }
}

run().catch(console.error);
