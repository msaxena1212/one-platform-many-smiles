-- ==============================================================================
-- PMS COA RELATIONAL HIERARCHY & MAPPING ENGINE MIGRATION
-- ==============================================================================

BEGIN;

-- 1. Create coa_types table
CREATE TABLE IF NOT EXISTS public.coa_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    normal_balance TEXT NOT NULL CHECK (normal_balance IN ('Debit', 'Credit')),
    report_type TEXT NOT NULL CHECK (report_type IN ('Balance Sheet', 'Profit & Loss')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create coa_groups table
CREATE TABLE IF NOT EXISTS public.coa_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type_id UUID NOT NULL REFERENCES public.coa_types(id) ON DELETE RESTRICT,
    type_code TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create coa_classes table
CREATE TABLE IF NOT EXISTS public.coa_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES public.coa_groups(id) ON DELETE RESTRICT,
    type_id UUID NOT NULL REFERENCES public.coa_types(id) ON DELETE RESTRICT,
    group_code TEXT NOT NULL,
    type_code TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create coa_gl (General Ledger) table
CREATE TABLE IF NOT EXISTS public.coa_gl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES public.coa_classes(id) ON DELETE RESTRICT,
    group_id UUID NOT NULL REFERENCES public.coa_groups(id) ON DELETE RESTRICT,
    type_id UUID NOT NULL REFERENCES public.coa_types(id) ON DELETE RESTRICT,
    class_code TEXT NOT NULL,
    group_code TEXT NOT NULL,
    type_code TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    normal_balance TEXT NOT NULL CHECK (normal_balance IN ('Debit', 'Credit')),
    is_control_account BOOLEAN NOT NULL DEFAULT FALSE,
    is_posting_account BOOLEAN NOT NULL DEFAULT TRUE,
    allows_direct_posting BOOLEAN NOT NULL DEFAULT TRUE,
    requires_property BOOLEAN NOT NULL DEFAULT FALSE,
    requires_unit BOOLEAN NOT NULL DEFAULT FALSE,
    requires_tenant BOOLEAN NOT NULL DEFAULT FALSE,
    requires_vendor BOOLEAN NOT NULL DEFAULT FALSE,
    requires_employee BOOLEAN NOT NULL DEFAULT FALSE,
    requires_asset BOOLEAN NOT NULL DEFAULT FALSE,
    requires_inventory BOOLEAN NOT NULL DEFAULT FALSE,
    requires_security_deposit BOOLEAN NOT NULL DEFAULT FALSE,
    requires_pdc BOOLEAN NOT NULL DEFAULT FALSE,
    requires_lease BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create coa_sl (Sub Ledger) table
CREATE TABLE IF NOT EXISTS public.coa_sl (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gl_id UUID NOT NULL REFERENCES public.coa_gl(id) ON DELETE RESTRICT,
    class_id UUID NOT NULL REFERENCES public.coa_classes(id) ON DELETE RESTRICT,
    group_id UUID NOT NULL REFERENCES public.coa_groups(id) ON DELETE RESTRICT,
    type_id UUID NOT NULL REFERENCES public.coa_types(id) ON DELETE RESTRICT,
    gl_code TEXT NOT NULL,
    class_code TEXT NOT NULL,
    group_code TEXT NOT NULL,
    type_code TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    normal_balance TEXT NOT NULL CHECK (normal_balance IN ('Debit', 'Credit')),
    is_control_account BOOLEAN NOT NULL DEFAULT FALSE,
    is_posting_account BOOLEAN NOT NULL DEFAULT TRUE,
    allows_direct_posting BOOLEAN NOT NULL DEFAULT TRUE,
    requires_property BOOLEAN NOT NULL DEFAULT FALSE,
    requires_unit BOOLEAN NOT NULL DEFAULT FALSE,
    requires_tenant BOOLEAN NOT NULL DEFAULT FALSE,
    requires_vendor BOOLEAN NOT NULL DEFAULT FALSE,
    requires_employee BOOLEAN NOT NULL DEFAULT FALSE,
    requires_asset BOOLEAN NOT NULL DEFAULT FALSE,
    requires_inventory BOOLEAN NOT NULL DEFAULT FALSE,
    requires_security_deposit BOOLEAN NOT NULL DEFAULT FALSE,
    requires_pdc BOOLEAN NOT NULL DEFAULT FALSE,
    requires_lease BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Create unit_coa_mapping table
CREATE TABLE IF NOT EXISTS public.unit_coa_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    unit_code TEXT NOT NULL,
    property_name TEXT,
    receivable_sl_id UUID REFERENCES public.coa_sl(id),
    receivable_sl_code TEXT,
    receivable_sl_name TEXT,
    pdc_sl_id UUID REFERENCES public.coa_sl(id),
    pdc_sl_code TEXT,
    pdc_sl_name TEXT,
    deposit_sl_id UUID REFERENCES public.coa_sl(id),
    deposit_sl_code TEXT,
    deposit_sl_name TEXT,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_to DATE,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_unit_coa_mapping UNIQUE (unit_id)
);

-- 7. Create property_coa_mapping table
CREATE TABLE IF NOT EXISTS public.property_coa_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    property_code TEXT,
    property_name TEXT,
    rental_revenue_gl_code TEXT DEFAULT '41100',
    property_management_fee_gl_code TEXT DEFAULT '41101',
    other_income_gl_code TEXT DEFAULT '41201',
    gain_loss_disposal_gl_code TEXT DEFAULT '41301',
    direct_labour_gl_code TEXT DEFAULT '51001',
    amc_maintenance_gl_code TEXT DEFAULT '51002',
    utilities_gl_code TEXT DEFAULT '51003',
    repairs_gl_code TEXT DEFAULT '51004',
    staff_cost_gl_code TEXT DEFAULT '51101',
    general_admin_gl_code TEXT DEFAULT '51102',
    depreciation_gl_code TEXT DEFAULT '51106',
    default_bank_gl_code TEXT DEFAULT '12000',
    default_ap_gl_code TEXT DEFAULT '21000',
    default_inventory_gl_code TEXT DEFAULT '12800',
    default_pdc_in_hand_gl_code TEXT DEFAULT '12900',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_property_coa_mapping UNIQUE (property_id)
);

-- 8. Enable Row Level Security (RLS) and Grant Access
ALTER TABLE public.coa_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coa_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coa_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coa_gl ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coa_sl ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_coa_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_coa_mapping ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow all for authenticated on coa_types" ON public.coa_types;
    CREATE POLICY "Allow all for authenticated on coa_types" ON public.coa_types FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for authenticated on coa_groups" ON public.coa_groups;
    CREATE POLICY "Allow all for authenticated on coa_groups" ON public.coa_groups FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for authenticated on coa_classes" ON public.coa_classes;
    CREATE POLICY "Allow all for authenticated on coa_classes" ON public.coa_classes FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for authenticated on coa_gl" ON public.coa_gl;
    CREATE POLICY "Allow all for authenticated on coa_gl" ON public.coa_gl FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for authenticated on coa_sl" ON public.coa_sl;
    CREATE POLICY "Allow all for authenticated on coa_sl" ON public.coa_sl FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for authenticated on unit_coa_mapping" ON public.unit_coa_mapping;
    CREATE POLICY "Allow all for authenticated on unit_coa_mapping" ON public.unit_coa_mapping FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all for authenticated on property_coa_mapping" ON public.property_coa_mapping;
    CREATE POLICY "Allow all for authenticated on property_coa_mapping" ON public.property_coa_mapping FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);
END $$;

GRANT ALL ON public.coa_types TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.coa_groups TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.coa_classes TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.coa_gl TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.coa_sl TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.unit_coa_mapping TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.property_coa_mapping TO postgres, anon, authenticated, service_role;

COMMIT;
