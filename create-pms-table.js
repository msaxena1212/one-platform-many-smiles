// create-pms-table.js — Run: node create-pms-table.js
// Uses Supabase REST API to probe the table and prints SQL to run in dashboard.

const https = require('https');

const PROJECT_REF = 'rnebpqnzignwjeukgztz';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg';

const SQL = `
CREATE TABLE IF NOT EXISTS public.pms_app_state (
  id           TEXT PRIMARY KEY,
  data         JSONB NOT NULL DEFAULT '{}',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pms_app_state ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'pms_app_state' AND policyname = 'pms_app_state_all'
  ) THEN
    EXECUTE 'CREATE POLICY pms_app_state_all ON public.pms_app_state FOR ALL USING (true) WITH CHECK (true)';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'pms_app_state'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.pms_app_state;
  END IF;
END $$;
`;

console.log('\n=== PMS App State Table Setup ===\n');
console.log('The table needs to be created manually via the Supabase Dashboard.');
console.log('\nPlease follow these steps:');
console.log('\n1. Open: https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
console.log('\n2. Paste and run this SQL:\n');
console.log('─'.repeat(60));
console.log(SQL);
console.log('─'.repeat(60));
console.log('\n3. Then in Supabase Dashboard → Database → Replication,');
console.log('   enable Realtime for the table: pms_app_state\n');
console.log('\nAfter running the SQL, re-run this script to verify:');
console.log('   node create-pms-table.js --verify\n');

if (process.argv.includes('--verify')) {
  const options = {
    hostname: `${PROJECT_REF}.supabase.co`,
    path: '/rest/v1/pms_app_state?id=eq.pms-global-state&select=id',
    method: 'GET',
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('✅ Table pms_app_state exists and is reachable!');
        console.log('Response:', data);
      } else if (res.statusCode === 404 || data.includes('does not exist')) {
        console.log('❌ Table still missing. Please run the SQL above first.');
      } else {
        console.log(`Status ${res.statusCode}:`, data);
      }
    });
  });

  req.on('error', e => console.error('Request error:', e.message));
  req.end();
}
