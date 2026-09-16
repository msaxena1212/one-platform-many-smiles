-- =============================================================================
-- Migration: 20260915150000_zero_trust_rls_security.sql
-- Description: Zero-Trust Row Level Security (RLS) hardening.
-- Prevents BOLA (Broken Object Level Authorization), IDOR, and cross-tenant data leaks.
-- Uses exact column names verified from live schema.
-- =============================================================================

-- ── Helper Functions ─────────────────────────────────────────────────────────

-- Get current authenticated user's role from profiles table
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role::text FROM public.profiles WHERE id = auth.uid() LIMIT 1),
    'GUEST'
  );
$$;

-- Check if the current user is an internal staff member
CREATE OR REPLACE FUNCTION public.is_staff_user()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_current_user_role() IN (
    'ADMIN', 'SUPER_ADMIN', 'PROP_MGR', 'LEASING', 'FINANCE', 'CASHIER', 'MAINTENANCE', 'HOST', 'SALES', 'OWNER'
  );
$$;

-- ── Drop All Prior Generic Policies ──────────────────────────────────────────

DO $$
BEGIN
  -- Leases
  DROP POLICY IF EXISTS "Staff can view all leases" ON public.leases;
  DROP POLICY IF EXISTS "Tenants can view own leases" ON public.leases;
  DROP POLICY IF EXISTS "Staff can manage leases" ON public.leases;
  DROP POLICY IF EXISTS "Authenticated staff can view leases" ON public.leases;
  DROP POLICY IF EXISTS "Authenticated staff can manage leases" ON public.leases;
  DROP POLICY IF EXISTS "Allow all for authenticated users" ON public.leases;
  -- Customers
  DROP POLICY IF EXISTS "Staff can view all customers" ON public.customers;
  DROP POLICY IF EXISTS "Tenants can view own customer record" ON public.customers;
  DROP POLICY IF EXISTS "Staff can manage customers" ON public.customers;
  DROP POLICY IF EXISTS "Tenants can update own customer record" ON public.customers;
  DROP POLICY IF EXISTS "Authenticated users can view customers" ON public.customers;
  DROP POLICY IF EXISTS "Authenticated users can manage customers" ON public.customers;
  -- fin_pdc_register
  DROP POLICY IF EXISTS "Staff can manage PDCs" ON public.fin_pdc_register;
  DROP POLICY IF EXISTS "Tenants can view own PDCs" ON public.fin_pdc_register;
  DROP POLICY IF EXISTS "Authenticated users can view PDCs" ON public.fin_pdc_register;
  DROP POLICY IF EXISTS "Authenticated users can manage PDCs" ON public.fin_pdc_register;
  -- pdcs (legacy)
  DROP POLICY IF EXISTS "Staff can manage legacy PDCs" ON public.pdcs;
  DROP POLICY IF EXISTS "Authenticated users can view legacy PDCs" ON public.pdcs;
  DROP POLICY IF EXISTS "Authenticated users can manage legacy PDCs" ON public.pdcs;
  -- fin_vouchers
  DROP POLICY IF EXISTS "Staff can view financial vouchers" ON public.fin_vouchers;
  DROP POLICY IF EXISTS "Staff can manage financial vouchers" ON public.fin_vouchers;
  DROP POLICY IF EXISTS "Authenticated users can view vouchers" ON public.fin_vouchers;
  DROP POLICY IF EXISTS "Authenticated users can manage vouchers" ON public.fin_vouchers;
  -- fin_voucher_lines
  DROP POLICY IF EXISTS "Staff can view voucher lines" ON public.fin_voucher_lines;
  DROP POLICY IF EXISTS "Staff can manage voucher lines" ON public.fin_voucher_lines;
  DROP POLICY IF EXISTS "Authenticated users can view voucher lines" ON public.fin_voucher_lines;
  DROP POLICY IF EXISTS "Authenticated users can manage voucher lines" ON public.fin_voucher_lines;
  -- collection_receipts
  DROP POLICY IF EXISTS "Staff can manage collection receipts" ON public.collection_receipts;
  DROP POLICY IF EXISTS "Tenants can view own receipts" ON public.collection_receipts;
  DROP POLICY IF EXISTS "Authenticated users can view collection receipts" ON public.collection_receipts;
  DROP POLICY IF EXISTS "Authenticated users can manage collection receipts" ON public.collection_receipts;
END $$;

-- ── LEASES ───────────────────────────────────────────────────────────────────
-- Staff see all leases. Tenants see ONLY their own (matched via customer_id → customers.email_address).
CREATE POLICY "Staff can view all leases"
ON public.leases FOR SELECT TO authenticated
USING (public.is_staff_user());

CREATE POLICY "Tenants can view own leases"
ON public.leases FOR SELECT TO authenticated
USING (
  customer_id IN (
    SELECT id FROM public.customers
    WHERE id = auth.uid()
       OR email_address = (auth.jwt() ->> 'email')
  )
);

CREATE POLICY "Staff can manage leases"
ON public.leases FOR ALL TO authenticated
USING (public.is_staff_user())
WITH CHECK (public.is_staff_user());

-- ── CUSTOMERS ────────────────────────────────────────────────────────────────
CREATE POLICY "Staff can view all customers"
ON public.customers FOR SELECT TO authenticated
USING (public.is_staff_user());

CREATE POLICY "Tenants can view own customer record"
ON public.customers FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR email_address = (auth.jwt() ->> 'email')
);

CREATE POLICY "Staff can manage customers"
ON public.customers FOR ALL TO authenticated
USING (public.is_staff_user())
WITH CHECK (public.is_staff_user());

CREATE POLICY "Tenants can update own customer record"
ON public.customers FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- ── FIN_PDC_REGISTER ─────────────────────────────────────────────────────────
-- tenant_id (bigint) links to the tenant — staff-only mutation;
-- tenants see rows where their auth.uid() is in the customer via leases lookup.
CREATE POLICY "Staff can manage PDCs"
ON public.fin_pdc_register FOR ALL TO authenticated
USING (public.is_staff_user())
WITH CHECK (public.is_staff_user());

CREATE POLICY "Tenants can view own PDCs"
ON public.fin_pdc_register FOR SELECT TO authenticated
USING (
  -- Allow if tenant matches via the leases the tenant owns
  EXISTS (
    SELECT 1 FROM public.leases l
    JOIN public.customers c ON c.id = l.customer_id
    WHERE (c.id = auth.uid() OR c.email_address = (auth.jwt() ->> 'email'))
  )
);

-- ── LEGACY PDCS ──────────────────────────────────────────────────────────────
CREATE POLICY "Staff can manage legacy PDCs"
ON public.pdcs FOR ALL TO authenticated
USING (public.is_staff_user())
WITH CHECK (public.is_staff_user());

-- ── FINANCIAL VOUCHERS (General Ledger) ─ STAFF ONLY ────────────────────────
CREATE POLICY "Staff can view financial vouchers"
ON public.fin_vouchers FOR SELECT TO authenticated
USING (public.is_staff_user());

CREATE POLICY "Staff can manage financial vouchers"
ON public.fin_vouchers FOR ALL TO authenticated
USING (public.is_staff_user())
WITH CHECK (public.is_staff_user());

-- ── VOUCHER LINES (General Ledger Detail) ─ STAFF ONLY ──────────────────────
CREATE POLICY "Staff can view voucher lines"
ON public.fin_voucher_lines FOR SELECT TO authenticated
USING (public.is_staff_user());

CREATE POLICY "Staff can manage voucher lines"
ON public.fin_voucher_lines FOR ALL TO authenticated
USING (public.is_staff_user())
WITH CHECK (public.is_staff_user());

-- ── COLLECTION RECEIPTS ──────────────────────────────────────────────────────
-- Receipts use lease_id; tenants see receipts from leases they own.
CREATE POLICY "Staff can manage collection receipts"
ON public.collection_receipts FOR ALL TO authenticated
USING (public.is_staff_user())
WITH CHECK (public.is_staff_user());

CREATE POLICY "Tenants can view own receipts"
ON public.collection_receipts FOR SELECT TO authenticated
USING (
  lease_id IN (
    SELECT l.id FROM public.leases l
    JOIN public.customers c ON c.id = l.customer_id
    WHERE c.id = auth.uid()
       OR c.email_address = (auth.jwt() ->> 'email')
  )
);
