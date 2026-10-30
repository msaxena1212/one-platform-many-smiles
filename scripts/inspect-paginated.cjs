const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rnebpqnzignwjeukgztz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectFull() {
  // Fetch ALL 1661 rows using pagination
  let allFin = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase.from('fin_pdc_register').select('*').range(from, from + 999);
    if (error || !data || data.length === 0) break;
    allFin = allFin.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log('Total fin_pdc_register fetched with pagination:', allFin.length);

  // Check unique cheque numbers
  const finCheques = new Set(allFin.map(f => f.cheque_number));
  console.log('Unique cheque numbers in fin_pdc_register:', finCheques.size);

  // Check pdcs table pagination
  let allPdcs = [];
  from = 0;
  while (true) {
    const { data, error } = await supabase.from('pdcs').select('*').range(from, from + 999);
    if (error || !data || data.length === 0) break;
    allPdcs = allPdcs.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log('Total pdcs fetched with pagination:', allPdcs.length);

  // Check units
  let allUnits = [];
  from = 0;
  while (true) {
    const { data, error } = await supabase.from('units').select('*, properties(*)').range(from, from + 999);
    if (error || !data || data.length === 0) break;
    allUnits = allUnits.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log('Total units fetched with pagination:', allUnits.length);

  // Check customers
  let allCusts = [];
  from = 0;
  while (true) {
    const { data, error } = await supabase.from('customers').select('*').range(from, from + 999);
    if (error || !data || data.length === 0) break;
    allCusts = allCusts.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log('Total customers fetched with pagination:', allCusts.length);

  // Check leases
  let allLeases = [];
  from = 0;
  while (true) {
    const { data, error } = await supabase.from('leases').select('*').range(from, from + 999);
    if (error || !data || data.length === 0) break;
    allLeases = allLeases.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  console.log('Total leases fetched with pagination:', allLeases.length);
}

inspectFull().catch(console.error);
