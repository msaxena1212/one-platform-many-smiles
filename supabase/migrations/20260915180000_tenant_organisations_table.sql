-- =============================================================================
-- Migration: 20260915180000_tenant_organisations_table.sql
-- Description: Comprehensive multi-tenant organisation table with contact info,
-- legal registration, subscription plan, initial allocation limits, and module entitlements.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.tenant_organisations (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_key            TEXT UNIQUE NOT NULL,
  name                  TEXT NOT NULL,
  legal_entity_name     TEXT,
  commercial_reg_no     TEXT,
  tax_id_no             TEXT,
  industry_type         TEXT DEFAULT 'Property Management & Real Estate',
  country               TEXT DEFAULT 'Qatar',
  city                  TEXT DEFAULT 'Doha',
  address_line          TEXT,
  primary_phone         TEXT,
  primary_email         TEXT NOT NULL,
  admin_name            TEXT NOT NULL,
  admin_email           TEXT NOT NULL,
  admin_user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan                  TEXT NOT NULL DEFAULT 'Starter' CHECK (plan IN ('Starter', 'Professional', 'Enterprise', 'Custom')),
  billing_cycle         TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'annual')),
  status                TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Trial', 'Cancelled')),
  max_properties        INTEGER NOT NULL DEFAULT 10,
  max_units             INTEGER NOT NULL DEFAULT 100,
  max_staff_users       INTEGER NOT NULL DEFAULT 5,
  max_storage_gb        INTEGER NOT NULL DEFAULT 10,
  enabled_modules       TEXT[] DEFAULT ARRAY[
    'Property CRUD', 'Unit Mgmt', 'Lease Creation', 'Payment Collection',
    'Receipt Generation', 'Finance & GL', 'Maintenance Tickets', 'Reports & Analytics'
  ],
  custom_subdomain      TEXT,
  brand_primary_color   TEXT DEFAULT '#0f766e',
  onboarded_by          UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  trial_ends_at         TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenant_orgs_key ON public.tenant_organisations (tenant_key);
CREATE INDEX IF NOT EXISTS idx_tenant_orgs_status ON public.tenant_organisations (status);
CREATE INDEX IF NOT EXISTS idx_tenant_orgs_admin_email ON public.tenant_organisations (admin_email);

-- Enable RLS
ALTER TABLE public.tenant_organisations ENABLE ROW LEVEL SECURITY;

-- 1. Super Admin has full management access
DROP POLICY IF EXISTS "Super Admin can manage tenant organisations" ON public.tenant_organisations;
CREATE POLICY "Super Admin can manage tenant organisations"
ON public.tenant_organisations FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'SUPER_ADMIN')
WITH CHECK (public.get_current_user_role() = 'SUPER_ADMIN');

-- 2. Staff / Tenant Admins can view their own organisation details
DROP POLICY IF EXISTS "Tenant Admins can view own organisation" ON public.tenant_organisations;
CREATE POLICY "Tenant Admins can view own organisation"
ON public.tenant_organisations FOR SELECT
TO authenticated
USING (
  admin_user_id = auth.uid()
  OR admin_email = (auth.jwt() ->> 'email')
  OR public.is_staff_user()
);

-- Seed existing tenants if table is empty
INSERT INTO public.tenant_organisations (tenant_key, name, legal_entity_name, primary_email, admin_name, admin_email, plan, status, max_properties, max_units)
VALUES
(
  'tenant-pearl-real-estate',
  'Pearl Island Properties W.L.L.',
  'Pearl Real Estate Holdings Q.P.S.C',
  'contact@pearlistate.qa',
  'Nasser Al-Kuwari',
  'admin@pearlistate.qa',
  'Enterprise',
  'Active',
  50,
  1500
),
(
  'tenant-lusail-towers',
  'Lusail Marina Towers Management',
  'Lusail Hospitality & Property LLC',
  'info@lusailtowers.qa',
  'Tariq Mansoor',
  'admin@lusailtowers.qa',
  'Professional',
  'Active',
  20,
  500
)
ON CONFLICT (tenant_key) DO NOTHING;
