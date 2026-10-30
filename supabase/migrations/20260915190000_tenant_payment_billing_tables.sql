-- =============================================================================
-- Migration: 20260915190000_tenant_payment_billing_tables.sql
-- Description: Add billing and payment fields to tenant_organisations and create
-- tenant_subscription_invoices and tenant_payment_records tables.
-- =============================================================================

-- 1. Alter tenant_organisations to add payment & billing fields
ALTER TABLE public.tenant_organisations
ADD COLUMN IF NOT EXISTS subscription_amount NUMERIC(12,2) DEFAULT 999.00,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'QAR',
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'credit_card',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'Paid' CHECK (payment_status IN ('Paid', 'Pending', 'Trial', 'Overdue', 'Failed')),
ADD COLUMN IF NOT EXISTS transaction_ref TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS cheque_number TEXT,
ADD COLUMN IF NOT EXISTS next_billing_date DATE DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS discount_code TEXT,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(12,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_paid NUMERIC(12,2) DEFAULT 999.00;

-- 2. Create tenant_subscription_invoices table
CREATE TABLE IF NOT EXISTS public.tenant_subscription_invoices (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number      TEXT UNIQUE NOT NULL,
  tenant_id           UUID REFERENCES public.tenant_organisations(id) ON DELETE CASCADE,
  tenant_key          TEXT NOT NULL,
  tenant_name         TEXT NOT NULL,
  plan                TEXT NOT NULL,
  billing_cycle       TEXT NOT NULL,
  subtotal_amount     NUMERIC(12,2) NOT NULL,
  tax_amount          NUMERIC(12,2) DEFAULT 0.00,
  discount_amount     NUMERIC(12,2) DEFAULT 0.00,
  total_amount        NUMERIC(12,2) NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'QAR',
  status              TEXT NOT NULL DEFAULT 'Paid' CHECK (status IN ('Paid', 'Pending', 'Overdue', 'Cancelled')),
  issue_date          DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date            DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
  payment_date        TIMESTAMPTZ,
  payment_method      TEXT NOT NULL DEFAULT 'credit_card',
  transaction_ref     TEXT,
  invoice_pdf_url     TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sub_inv_tenant_id ON public.tenant_subscription_invoices (tenant_id);
CREATE INDEX IF NOT EXISTS idx_sub_inv_status ON public.tenant_subscription_invoices (status);

-- Enable RLS
ALTER TABLE public.tenant_subscription_invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super Admins can manage subscription invoices" ON public.tenant_subscription_invoices;
CREATE POLICY "Super Admins can manage subscription invoices"
ON public.tenant_subscription_invoices FOR ALL
TO authenticated
USING (public.get_current_user_role() = 'SUPER_ADMIN')
WITH CHECK (public.get_current_user_role() = 'SUPER_ADMIN');

DROP POLICY IF EXISTS "Tenant staff can view own invoices" ON public.tenant_subscription_invoices;
CREATE POLICY "Tenant staff can view own invoices"
ON public.tenant_subscription_invoices FOR SELECT
TO authenticated
USING (
  public.is_staff_user()
  OR tenant_id IN (
    SELECT id FROM public.tenant_organisations
    WHERE admin_user_id = auth.uid() OR admin_email = (auth.jwt() ->> 'email')
  )
);
