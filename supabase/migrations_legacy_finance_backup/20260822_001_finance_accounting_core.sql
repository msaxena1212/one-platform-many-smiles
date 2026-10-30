BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Accounting event status

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'fin_accounting_event_status'
    ) THEN
        CREATE TYPE fin_accounting_event_status AS ENUM (
            'DRAFT',
            'POSTING',
            'POSTED',
            'REVERSED',
            'FAILED',
            'CANCELLED'
        );
    END IF;
END
$$;

-- Accounting event type

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'fin_accounting_event_type'
    ) THEN
        CREATE TYPE fin_accounting_event_type AS ENUM (
            'RENT_RECEIVABLE',
            'RENT_COLLECTION',
            'RENT_ADJUSTMENT',

            'SECURITY_DEPOSIT_RECEIVED',
            'SECURITY_DEPOSIT_TRANSFERRED',
            'SECURITY_DEPOSIT_ADJUSTED',
            'SECURITY_DEPOSIT_REFUNDED',

            'PDC_RECEIVED',
            'PDC_DEPOSITED',
            'PDC_CLEARED',
            'PDC_BOUNCED',
            'PDC_CANCELLED',
            'PDC_RETURNED',
            'PDC_REPLACED',

            'RECEIPT_CREATED',
            'RECEIPT_CANCELLED',

            'REFUND_CREATED',
            'REFUND_CANCELLED',

            'MANUAL_JOURNAL',
            'ADJUSTMENT'
        );
    END IF;
END
$$;

--Create fin_accounting_events
CREATE TABLE IF NOT EXISTS public.fin_accounting_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_type fin_accounting_event_type NOT NULL,

    status fin_accounting_event_status NOT NULL DEFAULT 'DRAFT',

    event_date DATE NOT NULL DEFAULT CURRENT_DATE,

    posting_date DATE NOT NULL DEFAULT CURRENT_DATE,

    source_type TEXT NOT NULL,

    source_id UUID,

    reference_number TEXT,

    description TEXT,

    idempotency_key TEXT NOT NULL,

    reversal_of_event_id UUID,

    reversed_by_event_id UUID,

    voucher_id UUID,

    tenant_id UUID,

    lease_id UUID,

    property_id UUID,

    unit_id UUID,

    customer_id UUID,

    total_debit NUMERIC(18,2) NOT NULL DEFAULT 0,

    total_credit NUMERIC(18,2) NOT NULL DEFAULT 0,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_by UUID,

    posted_by UUID,

    reversed_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    posted_at TIMESTAMPTZ,

    reversed_at TIMESTAMPTZ,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fin_accounting_events_amounts_non_negative
        CHECK (
            total_debit >= 0
            AND total_credit >= 0
        ),

    CONSTRAINT fin_accounting_events_source_type_chk
        CHECK (
            LENGTH(TRIM(source_type)) > 0
        ),

    CONSTRAINT fin_accounting_events_idempotency_key_chk
        CHECK (
            LENGTH(TRIM(idempotency_key)) > 0
        )
);

-- Prevent duplicate accounting events
CREATE UNIQUE INDEX IF NOT EXISTS
ux_fin_accounting_events_idempotency
ON public.fin_accounting_events(idempotency_key);

-- Accounting event indexes
CREATE INDEX IF NOT EXISTS
idx_fin_accounting_events_source
ON public.fin_accounting_events(source_type, source_id);

CREATE INDEX IF NOT EXISTS
idx_fin_accounting_events_event_type
ON public.fin_accounting_events(event_type);

CREATE INDEX IF NOT EXISTS
idx_fin_accounting_events_status
ON public.fin_accounting_events(status);

CREATE INDEX IF NOT EXISTS
idx_fin_accounting_events_lease
ON public.fin_accounting_events(lease_id);

CREATE INDEX IF NOT EXISTS
idx_fin_accounting_events_property
ON public.fin_accounting_events(property_id);

CREATE INDEX IF NOT EXISTS
idx_fin_accounting_events_posting_date
ON public.fin_accounting_events(posting_date);

-- Self-reference for reversals
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_fin_accounting_events_reversal'
    ) THEN
        ALTER TABLE public.fin_accounting_events
        ADD CONSTRAINT fk_fin_accounting_events_reversal
        FOREIGN KEY (reversal_of_event_id)
        REFERENCES public.fin_accounting_events(id);
    END IF;
END
$$;

-- Create accounting event lines
CREATE TABLE IF NOT EXISTS public.fin_accounting_event_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_id UUID NOT NULL,

    line_number INTEGER NOT NULL,

    account_id UUID,

    account_code TEXT,

    account_name TEXT,

    debit NUMERIC(18,2) NOT NULL DEFAULT 0,

    credit NUMERIC(18,2) NOT NULL DEFAULT 0,

    description TEXT,

    tenant_id UUID,

    lease_id UUID,

    property_id UUID,

    unit_id UUID,

    customer_id UUID,

    cost_center_id UUID,

    source_type TEXT,

    source_id UUID,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fin_event_lines_line_number_positive
        CHECK (line_number > 0),

    CONSTRAINT fin_event_lines_amount_non_negative
        CHECK (
            debit >= 0
            AND credit >= 0
        ),

    CONSTRAINT fin_event_lines_not_both
        CHECK (
            NOT (debit > 0 AND credit > 0)
        ),

    CONSTRAINT fin_event_lines_has_amount
        CHECK (
            debit > 0 OR credit > 0
        ),

    CONSTRAINT fin_event_lines_account_required
        CHECK (
            account_id IS NOT NULL
            OR account_code IS NOT NULL
        )
);

-- Link event lines to events
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_fin_event_lines_event'
    ) THEN
        ALTER TABLE public.fin_accounting_event_lines
        ADD CONSTRAINT fk_fin_event_lines_event
        FOREIGN KEY (event_id)
        REFERENCES public.fin_accounting_events(id)
        ON DELETE RESTRICT;
    END IF;
END
$$;

-- Prevent duplicate line numbers
CREATE UNIQUE INDEX IF NOT EXISTS
ux_fin_event_lines_event_line
ON public.fin_accounting_event_lines(event_id, line_number);
CREATE INDEX IF NOT EXISTS
idx_fin_event_lines_event
ON public.fin_accounting_event_lines(event_id);

CREATE INDEX IF NOT EXISTS
idx_fin_event_lines_account
ON public.fin_accounting_event_lines(account_id);

CREATE INDEX IF NOT EXISTS
idx_fin_event_lines_account_code
ON public.fin_accounting_event_lines(account_code);

CREATE INDEX IF NOT EXISTS
idx_fin_event_lines_lease
ON public.fin_accounting_event_lines(lease_id);

CREATE INDEX IF NOT EXISTS
idx_fin_event_lines_unit
ON public.fin_accounting_event_lines(unit_id);

-- Payment allocations
CREATE TABLE IF NOT EXISTS public.fin_payment_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    receipt_id UUID,

    accounting_event_id UUID,

    lease_id UUID,

    tenant_id UUID,

    property_id UUID,

    unit_id UUID,

    receivable_reference TEXT,

    payment_instrument_type TEXT NOT NULL,

    payment_instrument_id UUID,

    allocated_amount NUMERIC(18,2) NOT NULL,

    allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,

    status TEXT NOT NULL DEFAULT 'ALLOCATED',

    reversal_of_allocation_id UUID,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fin_payment_allocations_amount_positive
        CHECK (allocated_amount > 0),

    CONSTRAINT fin_payment_allocations_status_chk
        CHECK (
            status IN (
                'ALLOCATED',
                'PARTIALLY_REVERSED',
                'REVERSED',
                'CANCELLED'
            )
        )
);

-- Payment allocation indexes
CREATE INDEX IF NOT EXISTS
idx_fin_payment_allocations_receipt
ON public.fin_payment_allocations(receipt_id);

CREATE INDEX IF NOT EXISTS
idx_fin_payment_allocations_event
ON public.fin_payment_allocations(accounting_event_id);

CREATE INDEX IF NOT EXISTS
idx_fin_payment_allocations_lease
ON public.fin_payment_allocations(lease_id);

CREATE INDEX IF NOT EXISTS
idx_fin_payment_allocations_instrument
ON public.fin_payment_allocations(
    payment_instrument_type,
    payment_instrument_id
);

-- Account mapping table
CREATE TABLE IF NOT EXISTS public.fin_account_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    mapping_key TEXT NOT NULL,

    account_id UUID,

    account_code TEXT,

    account_name TEXT,

    property_id UUID,

    unit_id UUID,

    company_id UUID,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,

    effective_to DATE,

    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    created_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fin_account_mappings_key_chk
        CHECK (LENGTH(TRIM(mapping_key)) > 0),

    CONSTRAINT fin_account_mappings_account_chk
        CHECK (
            account_id IS NOT NULL
            OR account_code IS NOT NULL
        ),

    CONSTRAINT fin_account_mappings_date_chk
        CHECK (
            effective_to IS NULL
            OR effective_to >= effective_from
        )
);

-- Mapping uniqueness

CREATE UNIQUE INDEX IF NOT EXISTS
ux_fin_account_mappings_global
ON public.fin_account_mappings(mapping_key)
WHERE property_id IS NULL
  AND unit_id IS NULL
  AND company_id IS NULL
  AND is_active = TRUE;

  CREATE UNIQUE INDEX IF NOT EXISTS
ux_fin_account_mappings_property
ON public.fin_account_mappings(
    mapping_key,
    property_id
)
WHERE property_id IS NOT NULL
  AND unit_id IS NULL
  AND is_active = TRUE;

  CREATE UNIQUE INDEX IF NOT EXISTS
ux_fin_account_mappings_unit
ON public.fin_account_mappings(
    mapping_key,
    unit_id
)
WHERE unit_id IS NOT NULL
  AND is_active = TRUE;


-- Strengthen voucher table

ALTER TABLE public.erp_vouchers
ADD COLUMN IF NOT EXISTS
accounting_event_id UUID;

ALTER TABLE public.erp_vouchers
ADD COLUMN IF NOT EXISTS
source_type TEXT;

ALTER TABLE public.erp_vouchers
ADD COLUMN IF NOT EXISTS
source_id UUID;

ALTER TABLE public.erp_vouchers
ADD COLUMN IF NOT EXISTS
posting_status TEXT NOT NULL DEFAULT 'POSTED';

ALTER TABLE public.erp_vouchers
ADD COLUMN IF NOT EXISTS
reversal_of_voucher_id UUID;

ALTER TABLE public.erp_vouchers
ADD COLUMN IF NOT EXISTS
created_by UUID;

CREATE INDEX IF NOT EXISTS
idx_erp_vouchers_accounting_event
ON public.erp_vouchers(accounting_event_id);

CREATE INDEX IF NOT EXISTS
idx_erp_vouchers_source
ON public.erp_vouchers(source_type, source_id);

CREATE INDEX IF NOT EXISTS
idx_erp_vouchers_posting_status
ON public.erp_vouchers(posting_status);

-- Strengthen journal entries
ALTER TABLE public.erp_journal_entries
ADD COLUMN IF NOT EXISTS
accounting_event_id UUID;

ALTER TABLE public.erp_journal_entries
ADD COLUMN IF NOT EXISTS
line_number INTEGER;

ALTER TABLE public.erp_journal_entries
ADD COLUMN IF NOT EXISTS
description TEXT;

ALTER TABLE public.erp_journal_entries
ADD COLUMN IF NOT EXISTS
lease_id UUID;

ALTER TABLE public.erp_journal_entries
ADD COLUMN IF NOT EXISTS
property_id UUID;

ALTER TABLE public.erp_journal_entries
ADD COLUMN IF NOT EXISTS
unit_id UUID;

ALTER TABLE public.erp_journal_entries
ADD COLUMN IF NOT EXISTS
customer_id UUID;

CREATE INDEX IF NOT EXISTS
idx_erp_journal_entries_event
ON public.erp_journal_entries(accounting_event_id);

CREATE INDEX IF NOT EXISTS
idx_erp_journal_entries_lease
ON public.erp_journal_entries(lease_id);

CREATE INDEX IF NOT EXISTS
idx_erp_journal_entries_property
ON public.erp_journal_entries(property_id);

CREATE INDEX IF NOT EXISTS
idx_erp_journal_entries_unit
ON public.erp_journal_entries(unit_id);

-- Add event → voucher relationship
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_fin_accounting_events_voucher'
    ) THEN
        ALTER TABLE public.fin_accounting_events
        ADD CONSTRAINT fk_fin_accounting_events_voucher
        FOREIGN KEY (voucher_id)
        REFERENCES public.erp_vouchers(id)
        ON DELETE RESTRICT;
    END IF;
END
$$;

-- Add event → journal relationship
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_erp_journal_entries_accounting_event'
    ) THEN
        ALTER TABLE public.erp_journal_entries
        ADD CONSTRAINT fk_erp_journal_entries_accounting_event
        FOREIGN KEY (accounting_event_id)
        REFERENCES public.fin_accounting_events(id)
        ON DELETE RESTRICT;
    END IF;
END
$$;

-- Balance validation function
CREATE OR REPLACE FUNCTION public.fin_validate_event_balance(
    p_event_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    v_debit NUMERIC(18,2);
    v_credit NUMERIC(18,2);
BEGIN

    SELECT
        COALESCE(SUM(debit), 0),
        COALESCE(SUM(credit), 0)
    INTO
        v_debit,
        v_credit
    FROM public.fin_accounting_event_lines
    WHERE event_id = p_event_id;

    IF ROUND(v_debit, 2) <> ROUND(v_credit, 2) THEN
        RAISE EXCEPTION
            'Accounting event % is unbalanced. Debit=%, Credit=%',
            p_event_id,
            v_debit,
            v_credit;
    END IF;

    IF v_debit = 0 AND v_credit = 0 THEN
        RAISE EXCEPTION
            'Accounting event % contains no accounting value',
            p_event_id;
    END IF;

    RETURN TRUE;
END;
$$;

-- Event totals function
CREATE OR REPLACE FUNCTION public.fin_refresh_event_totals(
    p_event_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN

    UPDATE public.fin_accounting_events e
    SET
        total_debit = x.total_debit,
        total_credit = x.total_credit,
        updated_at = NOW()
    FROM (
        SELECT
            event_id,
            COALESCE(SUM(debit), 0)::NUMERIC(18,2) AS total_debit,
            COALESCE(SUM(credit), 0)::NUMERIC(18,2) AS total_credit
        FROM public.fin_accounting_event_lines
        WHERE event_id = p_event_id
        GROUP BY event_id
    ) x
    WHERE e.id = x.event_id;

END;
$$;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION public.fin_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS
trg_fin_accounting_events_updated_at
ON public.fin_accounting_events;

CREATE TRIGGER
trg_fin_accounting_events_updated_at
BEFORE UPDATE ON public.fin_accounting_events
FOR EACH ROW
EXECUTE FUNCTION public.fin_set_updated_at();

DROP TRIGGER IF EXISTS
trg_fin_payment_allocations_updated_at
ON public.fin_payment_allocations;

CREATE TRIGGER
trg_fin_payment_allocations_updated_at
BEFORE UPDATE ON public.fin_payment_allocations
FOR EACH ROW
EXECUTE FUNCTION public.fin_set_updated_at();

-- Enable RLS
ALTER TABLE public.fin_accounting_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.fin_accounting_event_lines ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.fin_payment_allocations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.fin_account_mappings ENABLE ROW LEVEL SECURITY;

COMMIT;