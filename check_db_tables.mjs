import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnebpqnzignwjeukgztz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  console.log('--- Checking DB tables ---');

  const tablesToCheck = [
    'fin_coa_accounts',
    'erp_chart_of_accounts',
    'coa_types',
    'coa_groups',
    'coa_classes',
    'coa_gl',
    'coa_sl',
    'unit_coa_mapping',
    'fin_unit_sl_accounts',
    'fin_transaction_account_rules',
    'fin_accounting_events',
    'fin_vouchers',
    'fin_voucher_lines',
    'properties',
    'units',
    'leases',
    'customers',
    'vendors',
    'assets',
    'pms_chart_of_accounts',
    'pms_coa_mappings'
  ];

  for (const table of tablesToCheck) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`Table [${table}]: ERROR/NOT FOUND - ${error.message} (${error.code})`);
      } else {
        const { data: sample } = await supabase.from(table).select('*').limit(1);
        console.log(`Table [${table}]: EXISTS, count=${count}, sample columns: ${sample && sample[0] ? Object.keys(sample[0]).join(', ') : 'empty table'}`);
      }
    } catch (e) {
      console.log(`Table [${table}]: EXCEPTION - ${e.message}`);
    }
  }
}

checkTables();
