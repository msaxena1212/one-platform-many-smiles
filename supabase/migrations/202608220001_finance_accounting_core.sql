BEGIN;

-- ============================================================
-- Finance Accounting Core
--
-- Base accounting-event architecture.
--
-- Final posting architecture:
--
-- fin_accounting_events
--        ↓
-- fin_accounting_event_lines
--        ↓
-- fin_coa_accounts
--
-- Voucher creation is handled by the subsequent posting
-- architecture migration.
--
-- IMPORTANT:
-- This migration does NOT use:
--   erp_vouchers
--   erp_journal_entries
--
-- Those tables are outside the new accounting posting engine.
-- ============================================================


-- ============================================================
-- 1. Required extensions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- 2. Accounting Event Status
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'fin_accounting_event_status'
    ) THEN

        CREATE TYPE public.fin_accounting_event_status AS ENUM (
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


-- ============================================================
-- 3. Accounting Event Type
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'fin_accounting_event_type'
    ) THEN

        CREATE TYPE public.fin_accounting_event_type AS ENUM (

            -- Rent
            'RENT_RECEIVABLE',
            'RENT_COLLECTION',
            'RENT_ADJUSTMENT',

            -- Security Deposit
            'SECURITY_DEPOSIT_RECEIVED',
            'SECURITY_DEPOSIT_TRANSFERRED',
            'SECURITY_DEPOSIT_ADJUSTED',
            'SECURITY_DEPOSIT_REFUNDED',

            -- PDC
            'PDC_RECEIVED',
            'PDC_DEPOSITED',
            'PDC_CLEARED',
            'PDC_BOUNCED',
            'PDC_CANCELLED',
            'PDC_RETURNED',
            'PDC_REPLACED',

            -- Receipts
            'RECEIPT_CREATED',
            'RECEIPT_CANCELLED',

            -- Refunds
            'REFUND_CREATED',
            'REFUND_CANCELLED',

            -- Manual accounting
            'MANUAL_JOURNAL',
            'ADJUSTMENT'
        );

    END IF;
END
$$;


-- ============================================================
-- 4. Accounting Events
-- ============================================================

CREATE TABLE IF NOT EXISTS public.fin_accounting_events (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_type
        public.fin_accounting_event_type
        NOT NULL,

    status
        public.fin_accounting_event_status
        NOT NULL DEFAULT 'DRAFT',

    event_date
        DATE
        NOT NULL DEFAULT CURRENT_DATE,

    posting_date
        DATE
        NOT NULL DEFAULT CURRENT_DATE,

    source_type
        TEXT
        NOT NULL,

    source_id
        UUID,

    reference_number
        TEXT,

    description
        TEXT,

    idempotency_key
        TEXT
        NOT NULL,

    reversal_of_event_id
        UUID,

    reversed_by_event_id
        UUID,

    /*
     * Voucher ID uses UUID because fin_vouchers.id is UUID.
     *
     * The FK is added by the posting-architecture migration.
     */
    voucher_id
        UUID,

    tenant_id
        UUID,

    lease_id
        UUID,

    property_id
        UUID,

    unit_id
        UUID,

    customer_id
        UUID,

    total_debit
        NUMERIC(18,2)
        NOT NULL DEFAULT 0,

    total_credit
        NUMERIC(18,2)
        NOT NULL DEFAULT 0,

    metadata
        JSONB
        NOT NULL DEFAULT '{}'::jsonb,

    created_by
        UUID,

    posted_by
        UUID,

    reversed_by
        UUID,

    created_at
        TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    posted_at
        TIMESTAMPTZ,

    reversed_at
        TIMESTAMPTZ,

    updated_at
        TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),


    -- ========================================================
    -- Constraints
    -- ========================================================

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


-- ============================================================
-- 5. Accounting Event Indexes
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
ux_fin_accounting_events_idempotency
ON public.fin_accounting_events(idempotency_key);


CREATE INDEX IF NOT EXISTS
idx_fin_accounting_events_source
ON public.fin_accounting_events(
    source_type,
    source_id
);


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


CREATE INDEX IF NOT EXISTS
idx_fin_accounting_events_voucher
ON public.fin_accounting_events(voucher_id);


-- ============================================================
-- 6. Accounting Event Reversal Relationship
-- ============================================================

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


-- ============================================================
-- 7. Accounting Event Lines
-- ============================================================

CREATE TABLE IF NOT EXISTS public.fin_accounting_event_lines (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_id
        UUID
        NOT NULL,

    line_number
        INTEGER
        NOT NULL,

    /*
     * fin_coa_accounts.id is UUID.
     */
    account_id
        UUID,

    /*
     * Account code is retained as a fallback/reference.
     */
    account_code
        TEXT,

    account_name
        TEXT,

    debit
        NUMERIC(18,2)
        NOT NULL DEFAULT 0,

    credit
        NUMERIC(18,2)
        NOT NULL DEFAULT 0,

    description
        TEXT,

    tenant_id
        UUID,

    lease_id
        UUID,

    property_id
        UUID,

    unit_id
        UUID,

    customer_id
        UUID,

    cost_center_id
        UUID,

    source_type
        TEXT,

    source_id
        UUID,

    metadata
        JSONB
        NOT NULL DEFAULT '{}'::jsonb,

    created_at
        TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),


    -- ========================================================
    -- Constraints
    -- ========================================================

    CONSTRAINT fin_event_lines_line_number_positive
        CHECK (
            line_number > 0
        ),

    CONSTRAINT fin_event_lines_amount_non_negative
        CHECK (
            debit >= 0
            AND credit >= 0
        ),

    CONSTRAINT fin_event_lines_not_both
        CHECK (
            NOT (
                debit > 0
                AND credit > 0
            )
        ),

    CONSTRAINT fin_event_lines_has_amount
        CHECK (
            debit > 0
            OR credit > 0
        ),

    CONSTRAINT fin_event_lines_account_required
        CHECK (
            account_id IS NOT NULL
            OR account_code IS NOT NULL
        )

);


-- ============================================================
-- 8. Accounting Event Line → Event
-- ============================================================

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


-- ============================================================
-- 9. Accounting Event Line Indexes
-- ============================================================

CREATE UNIQUE INDEX IF NOT EXISTS
ux_fin_event_lines_event_line
ON public.fin_accounting_event_lines(
    event_id,
    line_number
);


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


-- ============================================================
-- 10. Payment Allocations
-- ============================================================

CREATE TABLE IF NOT EXISTS public.fin_payment_allocations (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    receipt_id
        UUID,

    accounting_event_id
        UUID,

    lease_id
        UUID,

    tenant_id
        UUID,

    property_id
        UUID,

    unit_id
        UUID,

    receivable_reference
        TEXT,

    payment_instrument_type
        TEXT
        NOT NULL,

    payment_instrument_id
        UUID,

    allocated_amount
        NUMERIC(18,2)
        NOT NULL,

    allocation_date
        DATE
        NOT NULL DEFAULT CURRENT_DATE,

    status
        TEXT
        NOT NULL DEFAULT 'ALLOCATED',

    reversal_of_allocation_id
        UUID,

    metadata
        JSONB
        NOT NULL DEFAULT '{}'::jsonb,

    created_by
        UUID,

    created_at
        TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    updated_at
        TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),


    CONSTRAINT fin_payment_allocations_amount_positive
        CHECK (
            allocated_amount > 0
        ),

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


-- ============================================================
-- 11. Payment Allocation Indexes
-- ============================================================

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


-- ============================================================
-- 12. Account Mappings
-- ============================================================

CREATE TABLE IF NOT EXISTS public.fin_account_mappings (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    mapping_key
        TEXT
        NOT NULL,

    /*
     * fin_coa_accounts.id is UUID.
     */
    account_id
        UUID,

    account_code
        TEXT,

    account_name
        TEXT,

    property_id
        UUID,

    unit_id
        UUID,

    company_id
        UUID,

    is_active
        BOOLEAN
        NOT NULL DEFAULT TRUE,

    effective_from
        DATE
        NOT NULL DEFAULT CURRENT_DATE,

    effective_to
        DATE,

    metadata
        JSONB
        NOT NULL DEFAULT '{}'::jsonb,

    created_by
        UUID,

    created_at
        TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),

    updated_at
        TIMESTAMPTZ
        NOT NULL DEFAULT NOW(),


    CONSTRAINT fin_account_mappings_key_chk
        CHECK (
            LENGTH(TRIM(mapping_key)) > 0
        ),

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


-- ============================================================
-- 13. Account Mapping Uniqueness
-- ============================================================

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


-- ============================================================
-- 14. Validate Accounting Event Balance
-- ============================================================

CREATE OR REPLACE FUNCTION public.fin_validate_event_balance(
    p_event_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE

    v_debit
        NUMERIC(18,2);

    v_credit
        NUMERIC(18,2);

BEGIN

    SELECT
        COALESCE(SUM(debit), 0),
        COALESCE(SUM(credit), 0)

    INTO
        v_debit,
        v_credit

    FROM public.fin_accounting_event_lines

    WHERE event_id = p_event_id;


    v_debit :=
        ROUND(v_debit, 2);

    v_credit :=
        ROUND(v_credit, 2);


    IF v_debit = 0
       AND v_credit = 0 THEN

        RAISE EXCEPTION
            'Accounting event % contains no accounting value.',
            p_event_id;

    END IF;


    IF v_debit <> v_credit THEN

        RAISE EXCEPTION
            'Accounting event % is unbalanced. Debit=%, Credit=%',
            p_event_id,
            v_debit,
            v_credit;

    END IF;


    RETURN TRUE;

END;
$$;


-- ============================================================
-- 15. Refresh Accounting Event Totals
-- ============================================================

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

            COALESCE(
                SUM(debit),
                0
            )::NUMERIC(18,2)
            AS total_debit,

            COALESCE(
                SUM(credit),
                0
            )::NUMERIC(18,2)
            AS total_credit

        FROM public.fin_accounting_event_lines

        WHERE event_id = p_event_id

        GROUP BY event_id

    ) x

    WHERE e.id = x.event_id;

END;
$$;


-- ============================================================
-- 16. Updated At Function
-- ============================================================

CREATE OR REPLACE FUNCTION public.fin_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN

    NEW.updated_at = NOW();

    RETURN NEW;

END;
$$;


-- ============================================================
-- 17. Accounting Event Updated At Trigger
-- ============================================================

DROP TRIGGER IF EXISTS
trg_fin_accounting_events_updated_at
ON public.fin_accounting_events;


CREATE TRIGGER
trg_fin_accounting_events_updated_at

BEFORE UPDATE
ON public.fin_accounting_events

FOR EACH ROW

EXECUTE FUNCTION public.fin_set_updated_at();


-- ============================================================
-- 18. Payment Allocation Updated At Trigger
-- ============================================================

DROP TRIGGER IF EXISTS
trg_fin_payment_allocations_updated_at
ON public.fin_payment_allocations;


CREATE TRIGGER
trg_fin_payment_allocations_updated_at

BEFORE UPDATE
ON public.fin_payment_allocations

FOR EACH ROW

EXECUTE FUNCTION public.fin_set_updated_at();


-- ============================================================
-- 19. Enable RLS
-- ============================================================

ALTER TABLE public.fin_accounting_events
ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.fin_accounting_event_lines
ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.fin_payment_allocations
ENABLE ROW LEVEL SECURITY;


ALTER TABLE public.fin_account_mappings
ENABLE ROW LEVEL SECURITY;


COMMIT;