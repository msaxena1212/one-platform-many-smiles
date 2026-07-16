import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvlnwpsijbzcqxutsgwy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bG53cHNpamJ6Y3F4dXRzZ3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjEwNjMsImV4cCI6MjA5NzY5NzA2M30.gL_b8YOgRrM9DC5zm7-iert2O16AEQV8WFmyeG1Ek94';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MOCK_HOST_ID = '00000000-0000-4000-8000-000000000001';

async function migrate() {
  console.log('=== Maintenance Migration ===\n');

  // 1. Create maintenance_tickets table via raw SQL
  console.log('Creating maintenance_tickets table...');
  const { error: createError } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS maintenance_tickets (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
        unit_ref    TEXT,
        title       TEXT NOT NULL,
        description TEXT,
        category    TEXT NOT NULL DEFAULT 'general',
        priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
        status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','assigned','in_progress','resolved','closed')),
        assignee    TEXT,
        host_id     UUID,
        reported_by TEXT,
        resolved_at TIMESTAMPTZ,
        created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS "public_all" ON maintenance_tickets;
      CREATE POLICY "public_all" ON maintenance_tickets FOR ALL USING (true) WITH CHECK (true);
    `
  });

  if (createError) {
    console.log('RPC not available, trying direct insert (table may already exist):', createError.message);
  } else {
    console.log('✓ Table created');
  }

  // 2. Fetch a real property ID to associate tickets with
  const { data: props, error: propsError } = await supabase
    .from('properties')
    .select('id, title')
    .limit(5);

  let propId = null;
  let propTitle = 'Al Nakheel Residences';

  if (!propsError && props && props.length > 0) {
    propId = props[0].id;
    propTitle = props[0].title;
    console.log(`✓ Using property: ${propTitle} (${propId})`);
  } else {
    console.log('No properties found, using null property_id');
  }

  // 3. Seed 10 maintenance tickets
  console.log('\nSeeding 10 maintenance tickets...');
  const tickets = [
    {
      property_id: propId,
      unit_ref: 'A-1201',
      title: 'AC not cooling in master bedroom',
      description: 'The AC unit in the master bedroom is blowing warm air. Tenant has reported since yesterday.',
      category: 'hvac',
      priority: 'high',
      status: 'in_progress',
      assignee: 'Faisal T.',
      host_id: MOCK_HOST_ID,
      reported_by: 'Khalid Al-Mutairi',
    },
    {
      property_id: propId,
      unit_ref: 'V-12',
      title: 'Leaking kitchen tap',
      description: 'Cold water tap under the kitchen sink is leaking. Requires replacement of washer.',
      category: 'plumbing',
      priority: 'medium',
      status: 'assigned',
      assignee: 'Mahmoud K.',
      host_id: MOCK_HOST_ID,
      reported_by: 'Sara Al-Qahtani',
    },
    {
      property_id: propId,
      unit_ref: 'Common',
      title: 'Lobby light flickering',
      description: 'Lobby ceiling lights are flickering. Could be a ballast issue.',
      category: 'electrical',
      priority: 'low',
      status: 'new',
      assignee: null,
      host_id: MOCK_HOST_ID,
      reported_by: 'Security Guard',
    },
    {
      property_id: propId,
      unit_ref: 'C-2210',
      title: 'Deep clean before move-in',
      description: 'Full deep clean required before new tenant moves in on July 1st.',
      category: 'cleaning',
      priority: 'medium',
      status: 'resolved',
      assignee: 'CleanCo Services',
      host_id: MOCK_HOST_ID,
      reported_by: 'Property Manager',
      resolved_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      property_id: propId,
      unit_ref: 'V-07',
      title: 'Front door lock replacement',
      description: 'Electronic lock is malfunctioning, tenant locked out twice this week.',
      category: 'security',
      priority: 'urgent',
      status: 'new',
      assignee: null,
      host_id: MOCK_HOST_ID,
      reported_by: 'Yousef Bin Hamad',
    },
    {
      property_id: propId,
      unit_ref: 'A-1305',
      title: 'Water heater not working',
      description: 'Electric water heater in the bathroom stopped heating. Tenant has no hot water.',
      category: 'plumbing',
      priority: 'high',
      status: 'assigned',
      assignee: 'Mahmoud K.',
      host_id: MOCK_HOST_ID,
      reported_by: 'Omar Industries LLC',
    },
    {
      property_id: propId,
      unit_ref: 'A-1202',
      title: 'Window seal broken - water ingress',
      description: 'Bedroom window seal is compromised, water leaking in during rain.',
      category: 'structural',
      priority: 'high',
      status: 'in_progress',
      assignee: 'Al-Bena Contractors',
      host_id: MOCK_HOST_ID,
      reported_by: 'Layla Al-Harbi',
    },
    {
      property_id: propId,
      unit_ref: 'Common',
      title: 'Elevator annual maintenance service',
      description: 'Scheduled annual elevator inspection and maintenance by certified technician.',
      category: 'elevator',
      priority: 'low',
      status: 'resolved',
      assignee: 'OTIS Service Team',
      host_id: MOCK_HOST_ID,
      reported_by: 'Facilities Manager',
      resolved_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      property_id: propId,
      unit_ref: 'Rooftop',
      title: 'Roof drainage blockage',
      description: 'Roof drainage system is clogged causing water pooling on the roof terrace.',
      category: 'drainage',
      priority: 'medium',
      status: 'new',
      assignee: null,
      host_id: MOCK_HOST_ID,
      reported_by: 'Facilities Manager',
    },
    {
      property_id: propId,
      unit_ref: 'V-12',
      title: 'Intercom system not working',
      description: 'Building intercom is not functioning. Visitors cannot reach tenants.',
      category: 'electrical',
      priority: 'medium',
      status: 'assigned',
      assignee: 'TechServ Arabia',
      host_id: MOCK_HOST_ID,
      reported_by: 'Reception',
    },
  ];

  // Delete existing seed data first (to avoid duplicates on re-run)
  const { error: delError } = await supabase
    .from('maintenance_tickets')
    .delete()
    .eq('host_id', MOCK_HOST_ID);

  if (delError) {
    console.log('Note: Could not delete existing tickets (table may not exist yet):', delError.message);
  }

  const { data: inserted, error: insertError } = await supabase
    .from('maintenance_tickets')
    .insert(tickets)
    .select();

  if (insertError) {
    console.error('✗ Error inserting tickets:', insertError.message);
    console.log('\nIMPORTANT: You need to create the maintenance_tickets table first.');
    console.log('Run this SQL in Supabase Dashboard > SQL Editor:\n');
    console.log(`
CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  unit_ref    TEXT,
  title       TEXT NOT NULL,
  description TEXT,
  category    TEXT NOT NULL DEFAULT 'general',
  priority    TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','assigned','in_progress','resolved','closed')),
  assignee    TEXT,
  host_id     UUID,
  reported_by TEXT,
  resolved_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_all" ON maintenance_tickets FOR ALL USING (true) WITH CHECK (true);
    `);
  } else {
    console.log(`✓ Inserted ${inserted?.length} maintenance tickets`);
    inserted?.forEach(t => console.log(`  - [${t.status.toUpperCase()}] ${t.title}`));
  }

  // 4. Seed Finance data (journal entries + receipts) if tables exist
  console.log('\n=== Seeding Finance Data ===');
  
  const journalEntries = [
    {
      je_no: 'JE-2026-0601',
      posting_date: '2026-06-01',
      period: '2026-06',
      source_module: 'lease',
      narration: 'Rent receipt - Lease L1 - Khalid Al-Mutairi',
      status: 'posted',
    },
    {
      je_no: 'JE-2026-0602',
      posting_date: '2026-06-05',
      period: '2026-06',
      source_module: 'lease',
      narration: 'Rent receipt - Lease L2 - Sara Al-Qahtani',
      status: 'posted',
    },
    {
      je_no: 'JE-2026-0603',
      posting_date: '2026-06-10',
      period: '2026-06',
      source_module: 'maintenance',
      narration: 'HVAC maintenance - Ticket T1 - A-1201',
      status: 'posted',
    },
    {
      je_no: 'JE-2026-0604',
      posting_date: '2026-06-15',
      period: '2026-06',
      source_module: 'lease',
      narration: 'Rent receipt - Lease L3 - Omar Industries LLC',
      status: 'posted',
    },
    {
      je_no: 'JE-2026-0605',
      posting_date: '2026-06-20',
      period: '2026-06',
      source_module: 'maintenance',
      narration: 'Cleaning service - C-2210 - CleanCo',
      status: 'posted',
    },
  ];

  for (const je of journalEntries) {
    const { error: jeErr } = await supabase
      .from('journal_entries')
      .upsert(je, { onConflict: 'je_no' });
    if (jeErr) {
      console.log(`  Note: journal_entry ${je.je_no}: ${jeErr.message}`);
    } else {
      console.log(`  ✓ Journal entry ${je.je_no}`);
    }
  }

  const receipts = [
    { payment_mode: 'sadad', amount: 45000, currency: 'SAR', ref: 'RCT-10421', received_at: '2026-06-01T09:00:00Z', status: 'completed', allocations: {} },
    { payment_mode: 'mada', amount: 23750, currency: 'SAR', ref: 'RCT-10422', received_at: '2026-06-05T11:30:00Z', status: 'completed', allocations: {} },
    { payment_mode: 'bank_transfer', amount: 55000, currency: 'SAR', ref: 'RCT-10423', received_at: '2026-06-15T14:00:00Z', status: 'completed', allocations: {} },
    { payment_mode: 'cheque', amount: 30000, currency: 'SAR', ref: 'RCT-10424', received_at: '2026-06-18T10:00:00Z', status: 'pending', allocations: {} },
    { payment_mode: 'cash', amount: 5000, currency: 'SAR', ref: 'RCT-10425', received_at: '2026-06-20T16:00:00Z', status: 'completed', allocations: {} },
  ];

  for (const receipt of receipts) {
    const { error: rcptErr } = await supabase
      .from('receipts')
      .upsert(receipt, { onConflict: 'ref' });
    if (rcptErr) {
      console.log(`  Note: receipt ${receipt.ref}: ${rcptErr.message}`);
    } else {
      console.log(`  ✓ Receipt ${receipt.ref}`);
    }
  }

  console.log('\n=== Migration Complete ===');
}

migrate().catch(console.error);
