// One-time migration script: run in browser console or as a standalone node script
// to add the missing approval_status column to the customers table.
//
// Run: node scripts/add-approval-status.js

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rnebpqnzignwjeukgztz.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function run() {
  const sql = `
    ALTER TABLE public.customers
      ADD COLUMN IF NOT EXISTS approval_status TEXT
        CHECK (approval_status IN ('Pending', 'Approved', 'Rejected', 'Under Review'))
        DEFAULT 'Approved';

    UPDATE public.customers
    SET approval_status = 'Approved'
    WHERE approval_status IS NULL;
  `;

  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.error('Migration failed:', error.message);
  } else {
    console.log('Migration applied successfully.');
  }
}

run();
