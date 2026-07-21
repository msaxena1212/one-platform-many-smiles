import { Client } from 'pg';

async function migrate() {
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });

  try {
    console.log('Connecting to Supabase...');
    await client.connect();

    console.log('Applying PMS v2 schema changes...');

    // 1. Properties Table
    await client.query(`
      ALTER TABLE public.properties
      ADD COLUMN IF NOT EXISTS property_category TEXT,
      ADD COLUMN IF NOT EXISTS year_built INTEGER,
      ADD COLUMN IF NOT EXISTS total_floors INTEGER,
      ADD COLUMN IF NOT EXISTS total_units INTEGER,
      ADD COLUMN IF NOT EXISTS property_status TEXT DEFAULT 'Active',
      ADD COLUMN IF NOT EXISTS contact_person TEXT,
      ADD COLUMN IF NOT EXISTS mobile_number TEXT,
      ADD COLUMN IF NOT EXISTS email TEXT,
      ADD COLUMN IF NOT EXISTS alternate_contact TEXT,
      ADD COLUMN IF NOT EXISTS postal_code TEXT,
      ADD COLUMN IF NOT EXISTS landmark TEXT;
    `);

    // 2. Property Images
    await client.query(`
      ALTER TABLE public.property_images
      ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Exterior';
    `);

    // 3. Units Table
    await client.query(`
      ALTER TABLE public.units
      ADD COLUMN IF NOT EXISTS unit_number TEXT,
      ADD COLUMN IF NOT EXISTS unit_name TEXT,
      ADD COLUMN IF NOT EXISTS floor_number TEXT,
      ADD COLUMN IF NOT EXISTS unit_type TEXT,
      ADD COLUMN IF NOT EXISTS max_adults INTEGER DEFAULT 2,
      ADD COLUMN IF NOT EXISTS max_children INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS total_occupancy INTEGER DEFAULT 2,
      ADD COLUMN IF NOT EXISTS base_price_per_night NUMERIC DEFAULT 0,
      ADD COLUMN IF NOT EXISTS weekend_price NUMERIC,
      ADD COLUMN IF NOT EXISTS holiday_price NUMERIC,
      ADD COLUMN IF NOT EXISTS cleaning_fee NUMERIC DEFAULT 0,
      ADD COLUMN IF NOT EXISTS security_deposit NUMERIC DEFAULT 0;
    `);

    // 4. Unit Rooms
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.unit_rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
        room_type TEXT NOT NULL,
        name TEXT,
        length NUMERIC,
        width NUMERIC,
        area NUMERIC,
        capacity INTEGER,
        details JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 5. Unit Amenities
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.unit_amenities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
        room_id UUID REFERENCES public.unit_rooms(id) ON DELETE CASCADE,
        amenity_id TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 6. Pricing Rules
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.pricing_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
        rule_type TEXT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        adjustment_type TEXT NOT NULL DEFAULT 'percentage',
        value NUMERIC NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 7. PDCs Update
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.pdcs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lease_id UUID,
        cheque_number TEXT,
        bank TEXT,
        deposit_date DATE,
        amount NUMERIC(12,2),
        status TEXT DEFAULT 'ISSUED',
        created_at TIMESTAMPTZ DEFAULT now()
      );
      ALTER TABLE public.pdcs
      ADD COLUMN IF NOT EXISTS maturity_date DATE,
      ADD COLUMN IF NOT EXISTS collection_date DATE,
      ADD COLUMN IF NOT EXISTS bank_branch TEXT,
      ADD COLUMN IF NOT EXISTS cheque_front_url TEXT,
      ADD COLUMN IF NOT EXISTS cheque_back_url TEXT;
    `);

    // 8. Collection Receipts Update
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.collection_receipts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        lease_collection_id UUID,
        lease_id UUID,
        receipt_no TEXT UNIQUE NOT NULL,
        receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
        tenant_name TEXT NOT NULL,
        property_unit TEXT NOT NULL,
        payment_type TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        transaction_reference TEXT,
        amount NUMERIC(18,4) NOT NULL DEFAULT 0,
        collection_period TEXT,
        cashier_name TEXT,
        print_count INTEGER NOT NULL DEFAULT 0,
        emailed_at TIMESTAMPTZ,
        shared_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
      ALTER TABLE public.collection_receipts
      ADD COLUMN IF NOT EXISTS original_receipt_id UUID REFERENCES public.collection_receipts(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
    `);

    console.log('PMS v2 schema applied successfully.');
  } catch (error) {
    console.error('Error running PMS v2 migration:', error);
  } finally {
    await client.end();
  }
}

migrate();
