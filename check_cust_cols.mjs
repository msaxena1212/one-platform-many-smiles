import { createClient } from './node_modules/@supabase/supabase-js/dist/main/index.js';
import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(process.cwd(), '.env.local');
let serviceRoleKey = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match && match[1] === 'SUPABASE_SERVICE_ROLE_KEY') {
      let val = match[2] || '';
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      serviceRoleKey = val.trim();
    }
  });
}

const supabase = createClient('https://rnebpqnzignwjeukgztz.supabase.co', serviceRoleKey);

async function checkCols() {
  const dummy = { full_name: '__test__' };
  const { data, error } = await supabase.from('customers').insert(dummy).select();
  if (error) {
    console.error('Insert dummy error:', error);
  } else {
    console.log('CUSTOMER_KEYS=' + JSON.stringify(Object.keys(data[0])));
    await supabase.from('customers').delete().eq('id', data[0].id);
  }
}
checkCols();
