-- Finance Module Hardening: Phase 1
-- 1. Budget Heads Persistence
-- 2. Revenue Recognition Ledger

-- Budget Heads Table
CREATE TABLE IF NOT EXISTS public.fin_budget_heads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    head_name TEXT NOT NULL,
    category TEXT,
    allocated_amount DECIMAL(15, 2) DEFAULT 0,
    utilized_amount DECIMAL(15, 2) DEFAULT 0,
    fiscal_year TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Revenue Recognition Ledger
-- This table stores the output of the revenue-engine.ts to prevent retrospective changes
CREATE TABLE IF NOT EXISTS public.revenue_recognition_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recognition_key TEXT UNIQUE NOT NULL, -- leaseId|periodStart|periodEnd|revenueType
    batch_id TEXT NOT NULL,
    as_of_date DATE NOT NULL,
    lease_id UUID NOT NULL,
    tenant_id UUID,
    tenant_name TEXT NOT NULL,
    property_id UUID,
    property_name TEXT NOT NULL,
    unit_id UUID,
    unit_ref TEXT NOT NULL,
    revenue_type TEXT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    effective_revenue_end DATE,
    contractual_rent DECIMAL(15, 2) NOT NULL,
    total_days_in_period INTEGER NOT NULL,
    recognizable_days INTEGER NOT NULL,
    gross_revenue DECIMAL(15, 2) NOT NULL,
    discount_or_waiver DECIMAL(15, 2) DEFAULT 0,
    net_recognized_revenue DECIMAL(15, 2) NOT NULL,
    deferred_revenue DECIMAL(15, 2) NOT NULL,
    status TEXT NOT NULL,
    reason_code TEXT NOT NULL,
    recognition_date DATE,
    calculation_explanation TEXT,
    pdc_cheque_no TEXT,
    pdc_status TEXT,
    pdc_amount DECIMAL(15, 2),
    is_early_vacate BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    
    CONSTRAINT fk_lease FOREIGN KEY (lease_id) REFERENCES public.leases(id) ON DELETE CASCADE
);

-- Indexing for reporting
CREATE INDEX IF NOT EXISTS idx_rev_ledger_period ON public.revenue_recognition_ledger(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_rev_ledger_lease ON public.revenue_recognition_ledger(lease_id);
CREATE INDEX IF NOT EXISTS idx_rev_ledger_batch ON public.revenue_recognition_ledger(batch_id);

-- Enable RLS
ALTER TABLE public.fin_budget_heads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_recognition_ledger ENABLE ROW LEVEL SECURITY;

-- Policies (Finance & Admin roles)
CREATE POLICY "Finance access to budget heads" ON public.fin_budget_heads
    FOR ALL TO authenticated
    USING ( (SELECT current_setting('app.current_role', true)) IN ('finance', 'admin') );

CREATE POLICY "Finance access to revenue ledger" ON public.revenue_recognition_ledger
    FOR ALL TO authenticated
    USING ( (SELECT current_setting('app.current_role', true)) IN ('finance', 'admin') );
