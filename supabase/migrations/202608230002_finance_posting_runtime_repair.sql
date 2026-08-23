BEGIN;

-- ============================================================
-- Finance Posting Runtime Repair
-- Migration: 202608230002
--
-- Purpose:
--   Repair the live finance posting runtime using the ACTUAL
--   finance schema currently present in the database.
--
-- FINAL ARCHITECTURE:
--
--   fin_accounting_events
--             |
--             | voucher_id UUID
--             v
--   fin_vouchers
--             |
--             | accounting_event_id UUID
--             v
--   fin_accounting_events
--
--   fin_accounting_event_lines.account_id UUID
--             |
--             v
--   fin_coa_accounts.id UUID
--
--   fin_voucher_lines.account_id UUID
--             |
--             v
--   fin_coa_accounts.id UUID
--
--   post_accounting_event_atomic(UUID)
--
-- IMPORTANT:
--   The current live schema uses UUID for:
--
--     fin_accounting_events.id
--     fin_accounting_events.voucher_id
--     fin_accounting_event_lines.account_id
--     fin_coa_accounts.id
--     fin_vouchers.id
--     fin_vouchers.accounting_event_id
--     fin_voucher_lines.voucher_id
--     fin_voucher_lines.account_id
--
--   Therefore this migration intentionally uses UUID
--   relationships throughout.
--
--   No ERP voucher/journal tables are used by the posting engine.
--
--   Existing unique constraints/indexes are preserved.
-- ============================================================


-- ============================================================
-- 1. Ensure event -> voucher relationship
-- ============================================================
--
-- Both columns are UUID in the current schema:
--
--   fin_accounting_events.voucher_id
--   fin_vouchers.id
--
-- ============================================================

ALTER TABLE public.fin_accounting_events
DROP CONSTRAINT IF EXISTS fk_fin_accounting_events_voucher;


ALTER TABLE public.fin_accounting_events
ADD CONSTRAINT fk_fin_accounting_events_voucher
FOREIGN KEY (voucher_id)
REFERENCES public.fin_vouchers(id)
ON DELETE RESTRICT;


-- ============================================================
-- 2. Ensure voucher -> accounting event relationship
-- ============================================================
--
-- fin_vouchers.accounting_event_id is UUID.
--
-- ============================================================

ALTER TABLE public.fin_vouchers
ADD COLUMN IF NOT EXISTS accounting_event_id UUID;


ALTER TABLE public.fin_vouchers
DROP CONSTRAINT IF EXISTS fk_fin_vouchers_accounting_event;


ALTER TABLE public.fin_vouchers
ADD CONSTRAINT fk_fin_vouchers_accounting_event
FOREIGN KEY (accounting_event_id)
REFERENCES public.fin_accounting_events(id)
ON DELETE RESTRICT;


-- ============================================================
-- 3. Ensure accounting event line -> COA relationship
-- ============================================================
--
-- Both columns are UUID:
--
--   fin_accounting_event_lines.account_id
--   fin_coa_accounts.id
--
-- ============================================================

ALTER TABLE public.fin_accounting_event_lines
DROP CONSTRAINT IF EXISTS fk_fin_event_lines_account;


ALTER TABLE public.fin_accounting_event_lines
ADD CONSTRAINT fk_fin_event_lines_account
FOREIGN KEY (account_id)
REFERENCES public.fin_coa_accounts(id)
ON DELETE RESTRICT;


-- ============================================================
-- 4. Supporting event indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_fin_accounting_events_voucher
ON public.fin_accounting_events(voucher_id);


CREATE INDEX IF NOT EXISTS
idx_fin_accounting_events_source
ON public.fin_accounting_events(source_type, source_id);


-- ============================================================
-- 5. Supporting voucher indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_fin_vouchers_accounting_event
ON public.fin_vouchers(accounting_event_id);


CREATE INDEX IF NOT EXISTS
idx_fin_vouchers_source
ON public.fin_vouchers(source_type, source_id);


-- ============================================================
-- 6. Supporting accounting-event-line indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_fin_event_lines_event
ON public.fin_accounting_event_lines(event_id);


CREATE INDEX IF NOT EXISTS
idx_fin_event_lines_account_id
ON public.fin_accounting_event_lines(account_id);


-- ============================================================
-- 7. Supporting voucher-line indexes
-- ============================================================

CREATE INDEX IF NOT EXISTS
idx_fin_voucher_lines_voucher
ON public.fin_voucher_lines(voucher_id);


CREATE INDEX IF NOT EXISTS
idx_fin_voucher_lines_account
ON public.fin_voucher_lines(account_id);


CREATE INDEX IF NOT EXISTS
idx_fin_voucher_lines_property
ON public.fin_voucher_lines(property_id);


CREATE INDEX IF NOT EXISTS
idx_fin_voucher_lines_unit
ON public.fin_voucher_lines(unit_id);


CREATE INDEX IF NOT EXISTS
idx_fin_voucher_lines_tenant
ON public.fin_voucher_lines(tenant_id);


CREATE INDEX IF NOT EXISTS
idx_fin_voucher_lines_lease
ON public.fin_voucher_lines(lease_id);


CREATE INDEX IF NOT EXISTS
idx_fin_voucher_lines_customer
ON public.fin_voucher_lines(customer_id);


CREATE INDEX IF NOT EXISTS
idx_fin_voucher_lines_source
ON public.fin_voucher_lines(source_type, source_id);


-- ============================================================
-- 8. Voucher integrity
-- ============================================================
--
-- Voucher amount cannot be negative.
--
-- Existing constraint is preserved if already present.
-- ============================================================

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fin_vouchers_total_amount_positive'
          AND conrelid = 'public.fin_vouchers'::regclass
    ) THEN

        ALTER TABLE public.fin_vouchers
        ADD CONSTRAINT fin_vouchers_total_amount_positive
        CHECK (total_amount >= 0);

    END IF;

END
$$;


-- ============================================================
-- 9. Remove incompatible previous posting function
-- ============================================================
--
-- Migration 202608220005 may have created:
--
--   post_accounting_event_atomic(UUID)
--
-- with a return structure incompatible with the current
-- UUID-based voucher architecture.
--
-- PostgreSQL cannot CREATE OR REPLACE a function when its
-- return type changes, therefore the existing function is
-- removed before the corrected implementation is created.
--
-- ============================================================

DROP FUNCTION IF EXISTS
public.post_accounting_event_atomic(UUID);


-- ============================================================
-- 10. Restore atomic accounting-event posting function
-- ============================================================
--
-- Final contract:
--
--   post_accounting_event_atomic(UUID)
--
-- Returns:
--
--   event_id
--   voucher_id
--   voucher_number
--   status
--
-- All IDs are UUID.
--
-- ============================================================

CREATE FUNCTION public.post_accounting_event_atomic(
    p_event_id UUID
)
RETURNS TABLE (
    event_id UUID,
    voucher_id UUID,
    voucher_number TEXT,
    status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE

    v_event public.fin_accounting_events%ROWTYPE;
    v_voucher public.fin_vouchers%ROWTYPE;

    v_total_debit NUMERIC(18,2);
    v_total_credit NUMERIC(18,2);

    v_voucher_number TEXT;

BEGIN

    -- ========================================================
    -- 1. Lock accounting event
    -- ========================================================
    --
    -- FOR UPDATE guarantees that concurrent posting attempts
    -- for the same accounting event are serialized.
    --
    -- ========================================================

    SELECT *
    INTO v_event
    FROM public.fin_accounting_events
    WHERE id = p_event_id
    FOR UPDATE;


    IF NOT FOUND THEN

        RAISE EXCEPTION
            'Accounting event % was not found.',
            p_event_id;

    END IF;


    -- ========================================================
    -- 2. Already POSTED
    -- ========================================================
    --
    -- Idempotent behavior:
    --
    -- If the event is already posted, return its existing
    -- voucher instead of creating another voucher.
    --
    -- ========================================================

    IF v_event.status = 'POSTED' THEN

        IF v_event.voucher_id IS NULL THEN

            RAISE EXCEPTION
                'Accounting event % is POSTED but voucher_id is null.',
                p_event_id;

        END IF;


        SELECT *
        INTO v_voucher
        FROM public.fin_vouchers
        WHERE id = v_event.voucher_id;


        IF NOT FOUND THEN

            RAISE EXCEPTION
                'Accounting event % is POSTED but voucher % was not found.',
                p_event_id,
                v_event.voucher_id;

        END IF;


        RETURN QUERY
        SELECT
            v_event.id,
            v_voucher.id,
            v_voucher.voucher_number,
            'POSTED'::TEXT;


        RETURN;

    END IF;


    -- ========================================================
    -- 3. Reject invalid event states
    -- ========================================================

    IF v_event.status = 'REVERSED' THEN

        RAISE EXCEPTION
            'Accounting event % has already been reversed.',
            p_event_id;

    END IF;


    IF v_event.status = 'CANCELLED' THEN

        RAISE EXCEPTION
            'Accounting event % has been cancelled.',
            p_event_id;

    END IF;


    -- ========================================================
    -- 4. Validate accounting lines exist
    -- ========================================================

    IF NOT EXISTS (
        SELECT 1
        FROM public.fin_accounting_event_lines
        WHERE event_id = p_event_id
    ) THEN

        RAISE EXCEPTION
            'Accounting event % contains no accounting lines.',
            p_event_id;

    END IF;


    -- ========================================================
    -- 5. Calculate accounting totals
    -- ========================================================

    SELECT
        COALESCE(SUM(debit), 0),
        COALESCE(SUM(credit), 0)
    INTO
        v_total_debit,
        v_total_credit
    FROM public.fin_accounting_event_lines
    WHERE event_id = p_event_id;


    v_total_debit :=
        ROUND(v_total_debit, 2);


    v_total_credit :=
        ROUND(v_total_credit, 2);


    -- ========================================================
    -- 6. Reject zero-value events
    -- ========================================================

    IF v_total_debit <= 0
       AND v_total_credit <= 0 THEN

        RAISE EXCEPTION
            'Accounting event % contains zero-value accounting lines.',
            p_event_id;

    END IF;


    -- ========================================================
    -- 7. Validate debit / credit balance
    -- ========================================================

    IF ABS(v_total_debit - v_total_credit) > 0.001 THEN

        RAISE EXCEPTION
            'Accounting event % is unbalanced. Debit=%, Credit=%.',
            p_event_id,
            v_total_debit,
            v_total_credit;

    END IF;


    -- ========================================================
    -- 8. Validate event totals
    -- ========================================================

    IF ABS(
        ROUND(COALESCE(v_event.total_debit, 0), 2)
        - v_total_debit
    ) > 0.001 THEN

        RAISE EXCEPTION
            'Accounting event % debit total does not match event lines. Event=%, Lines=%.',
            p_event_id,
            v_event.total_debit,
            v_total_debit;

    END IF;


    IF ABS(
        ROUND(COALESCE(v_event.total_credit, 0), 2)
        - v_total_credit
    ) > 0.001 THEN

        RAISE EXCEPTION
            'Accounting event % credit total does not match event lines. Event=%, Lines=%.',
            p_event_id,
            v_event.total_credit,
            v_total_credit;

    END IF;


    -- ========================================================
    -- 9. Validate COA account resolution
    -- ========================================================
    --
    -- Primary resolution:
    --
    --   1. account_id
    --
    -- Fallback resolution:
    --
    --   2. account_code when account_id is NULL
    --
    -- Every accounting line must resolve to an ACTIVE COA
    -- account before posting.
    --
    -- ========================================================

    IF EXISTS (

        SELECT 1

        FROM public.fin_accounting_event_lines l

        LEFT JOIN public.fin_coa_accounts coa
            ON (
                coa.id = l.account_id
                AND coa.is_active = TRUE
            )
            OR (
                l.account_id IS NULL
                AND coa.account_code = l.account_code
                AND coa.is_active = TRUE
            )

        WHERE l.event_id = p_event_id

          AND coa.id IS NULL

    ) THEN

        RAISE EXCEPTION
            'Accounting event % contains an accounting line with an unresolved COA account.',
            p_event_id;

    END IF;


    -- ========================================================
    -- 10. Check for an existing voucher
    -- ========================================================
    --
    -- This handles an earlier/incomplete posting attempt where
    -- the voucher was created but the event status was not yet
    -- updated.
    --
    -- ========================================================

    SELECT *
    INTO v_voucher
    FROM public.fin_vouchers
    WHERE accounting_event_id = p_event_id
    LIMIT 1;


    IF FOUND THEN

        -- ----------------------------------------------------
        -- Ensure the event points to the existing voucher.
        -- ----------------------------------------------------

        UPDATE public.fin_accounting_events
        SET
            status = 'POSTED',
            voucher_id = v_voucher.id,
            posted_at = COALESCE(
                posted_at,
                NOW()
            )
        WHERE id = p_event_id;


        RETURN QUERY
        SELECT
            p_event_id,
            v_voucher.id,
            v_voucher.voucher_number,
            'POSTED'::TEXT;


        RETURN;

    END IF;


    -- ========================================================
    -- 11. Generate voucher number
    -- ========================================================
    --
    -- Prefer the accounting event reference number.
    --
    -- Otherwise generate:
    --
    --   EVT-XXXXXXXX
    --
    -- based on the accounting event UUID.
    --
    -- ========================================================

    IF NULLIF(
        TRIM(v_event.reference_number),
        ''
    ) IS NOT NULL THEN

        v_voucher_number :=
            TRIM(v_event.reference_number);

    ELSE

        v_voucher_number :=
            'EVT-' ||
            UPPER(
                SUBSTRING(
                    REPLACE(
                        v_event.id::TEXT,
                        '-',
                        ''
                    )
                    FROM 1 FOR 8
                )
            );

    END IF;


    -- ========================================================
    -- 12. Create financial voucher
    -- ========================================================

    INSERT INTO public.fin_vouchers (
        voucher_number,
        voucher_date,
        voucher_type,
        reference_no,
        description,
        total_amount,
        status,
        accounting_event_id,
        source_type,
        source_id,
        created_by,
        posted_at
    )
    VALUES (
        v_voucher_number,

        v_event.posting_date,

        'Journal',

        COALESCE(
            v_event.reference_number,
            v_event.source_id::TEXT
        ),

        COALESCE(
            v_event.description,
            v_event.event_type::TEXT ||
            ' - ' ||
            v_event.source_type
        ),

        v_total_debit,

        'Posted',

        v_event.id,

        v_event.source_type,

        v_event.source_id,

        v_event.created_by,

        NOW()
    )
    RETURNING *
    INTO v_voucher;


    -- ========================================================
    -- 13. Create voucher lines
    -- ========================================================
    --
    -- Resolve account using:
    --
    --   1. account_id
    --   2. account_code
    --
    -- All IDs use the actual UUID-based finance schema.
    --
    -- ========================================================

    INSERT INTO public.fin_voucher_lines (
        voucher_id,
        account_id,
        account_code,
        account_name,
        debit_amount,
        credit_amount,
        description,
        tenant_id,
        lease_id,
        property_id,
        unit_id,
        customer_id,
        cost_center_id,
        source_type,
        source_id
    )

    SELECT

        v_voucher.id,

        COALESCE(
            coa.id,
            l.account_id
        ),

        COALESCE(
            coa.account_code,
            l.account_code
        ),

        COALESCE(
            coa.account_name,
            l.account_name
        ),

        ROUND(l.debit, 2),

        ROUND(l.credit, 2),

        COALESCE(
            l.description,
            coa.account_name,
            l.account_name
        ),

        l.tenant_id,

        l.lease_id,

        l.property_id,

        l.unit_id,

        l.customer_id,

        l.cost_center_id,

        COALESCE(
            l.source_type,
            v_event.source_type
        ),

        COALESCE(
            l.source_id,
            v_event.source_id
        )

    FROM public.fin_accounting_event_lines l

    LEFT JOIN public.fin_coa_accounts coa
        ON (
            coa.id = l.account_id
            AND coa.is_active = TRUE
        )
        OR (
            l.account_id IS NULL
            AND coa.account_code = l.account_code
            AND coa.is_active = TRUE
        )

    WHERE l.event_id = p_event_id;


    -- ========================================================
    -- 14. Mark accounting event as POSTED
    -- ========================================================

    UPDATE public.fin_accounting_events
    SET
        status = 'POSTED',
        voucher_id = v_voucher.id,
        posted_at = NOW()
    WHERE id = p_event_id;


    -- ========================================================
    -- 15. Return posting result
    -- ========================================================

    RETURN QUERY
    SELECT
        p_event_id,
        v_voucher.id,
        v_voucher.voucher_number,
        'POSTED'::TEXT;

END;
$$;


-- ============================================================
-- 16. Secure posting function
-- ============================================================
--
-- The function is SECURITY DEFINER.
--
-- It must not be callable directly by anon/authenticated users.
-- The application/backend should invoke it through a trusted
-- server-side path using service_role.
--
-- ============================================================

REVOKE ALL
ON FUNCTION public.post_accounting_event_atomic(UUID)
FROM PUBLIC;


REVOKE ALL
ON FUNCTION public.post_accounting_event_atomic(UUID)
FROM anon;


REVOKE ALL
ON FUNCTION public.post_accounting_event_atomic(UUID)
FROM authenticated;


GRANT EXECUTE
ON FUNCTION public.post_accounting_event_atomic(UUID)
TO service_role;


COMMIT;