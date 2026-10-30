-- =============================================================================
-- Migration: 20260915200000_subscription_plans_table.sql
-- Description: Dynamic subscription plans table where Super Admin can define
-- tiers, pricing (monthly & annual), property/unit limits, and granular RBAC module entitlements.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.platform_subscription_plans (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_code             TEXT UNIQUE NOT NULL,
  name                  TEXT NOT NULL,
  description           TEXT,
  price_monthly_qar     NUMERIC(12,2) NOT NULL DEFAULT 999.00,
  price_annual_qar      NUMERIC(12,2) NOT NULL DEFAULT 9990.00,
  currency              TEXT NOT NULL DEFAULT 'QAR',
  max_properties        INTEGER NOT NULL DEFAULT 30,
  max_units             INTEGER NOT NULL DEFAULT 500,
  max_staff_users       INTEGER NOT NULL DEFAULT 20,
  max_storage_gb        INTEGER NOT NULL DEFAULT 50,
  enabled_modules       TEXT[] NOT NULL DEFAULT ARRAY[
    'Property CRUD', 'Unit Mgmt', 'Lease Creation', 'Payment Collection',
    'Receipt Generation', 'Finance & GL', 'Asset Management', 'Vendor Management',
    'Maintenance Tickets', 'Reports & Analytics'
  ],
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured           BOOLEAN NOT NULL DEFAULT FALSE,
  display_order         INTEGER NOT NULL DEFAULT 1,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.platform_subscription_plans ENABLE ROW LEVEL SECURITY;

-- Staff / Authenticated can view plans
DROP POLICY IF EXISTS "Authenticated can view subscription plans" ON public.platform_subscription_plans;
CREATE POLICY "Authenticated can view subscription plans"
ON public.platform_subscription_plans FOR SELECT
TO authenticated
USING (true);

-- Super Admin can manage plans
DROP POLICY IF EXISTS "Super Admin can manage subscription plans" ON public.platform_subscription_plans;
CREATE POLICY "Super Admin can manage subscription plans"
ON public.platform_subscription_plans FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'SUPER_ADMIN')
WITH CHECK (public.get_current_user_role() = 'SUPER_ADMIN');

-- Seed Default Plans
INSERT INTO public.platform_subscription_plans (
  plan_code, name, description, price_monthly_qar, price_annual_qar,
  max_properties, max_units, max_staff_users, max_storage_gb, is_featured, display_order, enabled_modules
)
VALUES
(
  'starter',
  'Starter Plan',
  'Designed for boutique landlords and independent single/multi-property operators.',
  299.00,
  2990.00,
  10,
  100,
  5,
  10,
  FALSE,
  1,
  ARRAY['Property CRUD', 'Unit Mgmt', 'Lease Creation', 'Payment Collection', 'Receipt Generation', 'Maintenance Tickets']
),
(
  'professional',
  'Professional Plan',
  'For growing commercial & residential property management firms and agencies.',
  999.00,
  9990.00,
  30,
  500,
  20,
  50,
  TRUE,
  2,
  ARRAY['Property CRUD', 'Unit Mgmt', 'Lease Creation', 'Payment Collection', 'Receipt Generation', 'Finance & GL', 'Asset Management', 'Vendor Management', 'Maintenance Tickets', 'Reports & Analytics']
),
(
  'enterprise',
  'Enterprise Plan',
  'Full-scale corporate property chains, REITs, and institutional landlords with unlimited operations.',
  2499.00,
  24990.00,
  100,
  3000,
  100,
  500,
  FALSE,
  3,
  ARRAY[
    'Tenant Mgmt', 'Property CRUD', 'Unit Mgmt', 'Lease Creation', 'Payment Collection',
    'Receipt Generation', 'Finance & GL', 'Asset Management', 'Procurement & POs',
    'Vendor Management', 'Maintenance Tickets', 'HRMS', 'Workforce & Shifts',
    'Payroll & Salary', 'Performance & KPA', 'Reports & Analytics', 'User Management', 'Approval Workflows'
  ]
)
ON CONFLICT (plan_code) DO UPDATE
SET price_monthly_qar = EXCLUDED.price_monthly_qar,
    price_annual_qar = EXCLUDED.price_annual_qar,
    enabled_modules = EXCLUDED.enabled_modules,
    updated_at = NOW();
