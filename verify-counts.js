import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const SUPABASE_URL = 'https://rnebpqnzignwjeukgztz.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDE3NTg4MiwiZXhwIjoyMDk5NzUxODgyfQ.mRwmoyI1ZIKX96qT5dwrno4RATxj01qgSVZ10YigG28';

async function checkCounts() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const tables = [
    { name: 'Customer Master', table: 'customers' },
    { name: 'Reservations', table: 'reservations' },
    { name: 'Agreement Terms', table: 'agreement_terms' },
    { name: 'Leases', table: 'leases' },
    { name: 'General Ledger', table: 'gl_entries' },
    { name: 'PDC Management', table: 'pdcs' },
  ];

  console.log('--- Database Record Counts ---');
  for (const item of tables) {
    const { count, error } = await supabase
      .from(item.table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`${item.name} (${item.table}): Error - ${error.message}`);
    } else {
      console.log(`${item.name}: ${count}`);
    }
  }
}

checkCounts().catch(console.error);
