// setup-pms-state-table.js
// Run: node setup-pms-state-table.js
// Creates the pms_app_state table and enables Realtime on it.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnebpqnzignwjeukgztz.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

if (!supabaseServiceKey) {
  console.error('ERROR: Set SUPABASE_SERVICE_KEY env var to a service-role key (not anon key).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log('Creating pms_app_state table...');

  // 1. Create table via raw SQL using the sql() RPC (requires pg_net or direct connection)
  // Since we can't run DDL via the JS client directly, we'll use the REST admin endpoint.
  // Alternative: use supabase.rpc if pg extension allows it.

  // Try inserting the seed row — if the table doesn't exist this will fail gracefully
  // and tell us to create it via the Supabase dashboard.
  const { error: insertError } = await supabase
    .from('pms_app_state')
    .upsert({
      id: 'pms-global-state',
      data: {},
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });

  if (insertError) {
    if (insertError.message.includes('does not exist') || insertError.code === '42P01') {
      console.log('\n⚠️  Table pms_app_state does not exist yet.');
      console.log('Please run this SQL in your Supabase dashboard SQL editor:\n');
      console.log(`
-- ============================================================
-- PMS App State Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pms_app_state (
  id           TEXT PRIMARY KEY DEFAULT 'pms-global-state',
  data         JSONB NOT NULL DEFAULT '{}',
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (allow all authenticated + anon for demo)
ALTER TABLE public.pms_app_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pms_app_state_all" ON public.pms_app_state
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.pms_app_state;
-- ============================================================
      `);
    } else {
      console.error('Insert error:', insertError.message);
    }
  } else {
    console.log('✅ pms_app_state table exists and is reachable.');
    console.log('Make sure Realtime is enabled on it in: Supabase Dashboard → Database → Replication → pms_app_state');
  }
}

run();
