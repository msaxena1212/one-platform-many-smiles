import { Client } from 'pg';

async function migrate() {
  const connectionString = "postgresql://postgres.rnebpqnzignwjeukgztz:ZZaM4YMKu80iCTa2@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Migrating ERP Masters & Expansions...');

    // 1. Create Master Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.mst_property_types (id TEXT PRIMARY KEY, label TEXT);
      CREATE TABLE IF NOT EXISTS public.mst_property_categories (id TEXT PRIMARY KEY, label TEXT);
      CREATE TABLE IF NOT EXISTS public.mst_ownership_types (id TEXT PRIMARY KEY, label TEXT);
      CREATE TABLE IF NOT EXISTS public.mst_vat_treatments (id TEXT PRIMARY KEY, label TEXT);
      CREATE TABLE IF NOT EXISTS public.mst_unit_usages (id TEXT PRIMARY KEY, label TEXT);
      CREATE TABLE IF NOT EXISTS public.mst_view_types (id TEXT PRIMARY KEY, label TEXT);
      CREATE TABLE IF NOT EXISTS public.mst_furnishing (id TEXT PRIMARY KEY, label TEXT);
      CREATE TABLE IF NOT EXISTS public.mst_lease_statuses (id TEXT PRIMARY KEY, label TEXT);
      CREATE TABLE IF NOT EXISTS public.mst_rent_frequencies (id TEXT PRIMARY KEY, label TEXT);
      CREATE TABLE IF NOT EXISTS public.mst_maintenance_responsibilities (id TEXT PRIMARY KEY, label TEXT);
      CREATE TABLE IF NOT EXISTS public.mst_security_deposit_types (id TEXT PRIMARY KEY, label TEXT);
    `);

    // 2. Expand Properties Table
    await client.query(`
      ALTER TABLE public.properties 
        ADD COLUMN IF NOT EXISTS property_code TEXT,
        ADD COLUMN IF NOT EXISTS cost_center_code TEXT,
        ADD COLUMN IF NOT EXISTS cost_center_name TEXT,
        ADD COLUMN IF NOT EXISTS property_category TEXT,
        ADD COLUMN IF NOT EXISTS ownership_type TEXT,
        ADD COLUMN IF NOT EXISTS area_zone TEXT,
        ADD COLUMN IF NOT EXISTS street_building_name TEXT,
        ADD COLUMN IF NOT EXISTS plot_building_no TEXT,
        ADD COLUMN IF NOT EXISTS title_deed_no TEXT,
        ADD COLUMN IF NOT EXISTS municipality_ref_no TEXT,
        ADD COLUMN IF NOT EXISTS property_manager TEXT,
        ADD COLUMN IF NOT EXISTS no_of_floors INTEGER,
        ADD COLUMN IF NOT EXISTS no_of_units INTEGER,
        ADD COLUMN IF NOT EXISTS total_built_up_area_sqm NUMERIC,
        ADD COLUMN IF NOT EXISTS common_area_sqm NUMERIC,
        ADD COLUMN IF NOT EXISTS parking_count INTEGER,
        ADD COLUMN IF NOT EXISTS no_of_elevators INTEGER,
        ADD COLUMN IF NOT EXISTS completion_date DATE,
        ADD COLUMN IF NOT EXISTS handover_date DATE,
        ADD COLUMN IF NOT EXISTS documents_received BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS remarks TEXT;
    `);

    // 3. Expand Units Table
    await client.query(`
      ALTER TABLE public.units
        ADD COLUMN IF NOT EXISTS unit_code TEXT,
        ADD COLUMN IF NOT EXISTS unit_cost_center_code TEXT,
        ADD COLUMN IF NOT EXISTS unit_name TEXT,
        ADD COLUMN IF NOT EXISTS parent_cost_center_code TEXT,
        ADD COLUMN IF NOT EXISTS unit_usage TEXT,
        ADD COLUMN IF NOT EXISTS block_tower TEXT,
        ADD COLUMN IF NOT EXISTS floor TEXT,
        ADD COLUMN IF NOT EXISTS balcony_sqm NUMERIC,
        ADD COLUMN IF NOT EXISTS total_area_sqm NUMERIC,
        ADD COLUMN IF NOT EXISTS view_type TEXT,
        ADD COLUMN IF NOT EXISTS furnishing TEXT,
        ADD COLUMN IF NOT EXISTS parking_slot_no TEXT,
        ADD COLUMN IF NOT EXISTS electricity_meter_no TEXT,
        ADD COLUMN IF NOT EXISTS water_meter_no TEXT,
        ADD COLUMN IF NOT EXISTS cooling_meter_no TEXT,
        ADD COLUMN IF NOT EXISTS lease_status TEXT,
        ADD COLUMN IF NOT EXISTS rent_frequency TEXT,
        ADD COLUMN IF NOT EXISTS current_tenant TEXT,
        ADD COLUMN IF NOT EXISTS contract_no TEXT,
        ADD COLUMN IF NOT EXISTS contract_start_date DATE,
        ADD COLUMN IF NOT EXISTS contract_end_date DATE,
        ADD COLUMN IF NOT EXISTS current_rent NUMERIC,
        ADD COLUMN IF NOT EXISTS security_deposit_type TEXT,
        ADD COLUMN IF NOT EXISTS security_deposit_amount NUMERIC,
        ADD COLUMN IF NOT EXISTS service_charge NUMERIC,
        ADD COLUMN IF NOT EXISTS maintenance_responsibility TEXT,
        ADD COLUMN IF NOT EXISTS handover_date DATE,
        ADD COLUMN IF NOT EXISTS documents_received BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS remarks TEXT;
    `);

    // 4. Financial Ledger Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.erp_chart_of_accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL, -- Asset, Liability, Equity, Revenue, Expense
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS public.erp_vouchers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        voucher_no TEXT UNIQUE NOT NULL,
        voucher_type TEXT NOT NULL, -- Receipt, Deposit, Cheque Return, Rent Income, Payment
        voucher_date DATE NOT NULL,
        total_amount NUMERIC(18,4) NOT NULL,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS public.erp_journal_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        voucher_id UUID REFERENCES public.erp_vouchers(id) ON DELETE CASCADE,
        account_id UUID REFERENCES public.erp_chart_of_accounts(id),
        account_name TEXT,
        debit NUMERIC(18,4) DEFAULT 0,
        credit NUMERIC(18,4) DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    
    // Seed Masters
    const seeds = [
      { t: 'mst_property_types', d: ['Residential', 'Commercial', 'Mixed Use', 'Retail', 'Office', 'Warehouse', 'Industrial', 'Staff Accommodation', 'Hotel / Hospitality', 'Land', 'Other'] },
      { t: 'mst_property_categories', d: ['Building', 'Villa Compound', 'Tower', 'Mall', 'Office Complex', 'Warehouse Complex', 'Staff Accommodation', 'Standalone Villa', 'Compound', 'Land Parcel', 'Other'] },
      { t: 'mst_ownership_types', d: ['Owned', 'Leased', 'Managed for Owner', 'Joint Venture', 'Subleased', 'Other'] },
      { t: 'mst_vat_treatments', d: ['Taxable', 'Exempt', 'Zero Rated', 'Out of Scope', 'Not Applicable'] },
      { t: 'mst_unit_usages', d: ['Residential', 'Commercial', 'Retail', 'Office', 'Storage', 'Parking', 'Common Area', 'Staff Accommodation', 'Other'] },
      { t: 'mst_view_types', d: ['Road View', 'Sea View', 'City View', 'Garden View', 'Pool View', 'Internal View', 'No Specific View', 'Other'] },
      { t: 'mst_furnishing', d: ['Unfurnished', 'Semi Furnished', 'Fully Furnished', 'Not Applicable'] },
      { t: 'mst_lease_statuses', d: ['Vacant', 'Leased', 'Notice Given', 'Renewal Due', 'Expired', 'Legal Case', 'Not Applicable'] },
      { t: 'mst_rent_frequencies', d: ['Monthly', 'Quarterly', 'Half Yearly', 'Yearly', 'One Time', 'Not Applicable'] },
      { t: 'mst_maintenance_responsibilities', d: ['Owner', 'Tenant', 'Property Manager', 'Shared', 'Not Applicable'] },
      { t: 'mst_security_deposit_types', d: ['Cash', 'Guarantee Cheque', 'PDC'] }
    ];

    for (const s of seeds) {
      for (const val of s.d) {
        await client.query(`INSERT INTO public.${s.t} (id, label) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING;`, [val.toLowerCase().replace(/[\s/]+/g, '_'), val]);
      }
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Error migrating ERP schema:', error);
  } finally {
    await client.end();
  }
}

migrate();
