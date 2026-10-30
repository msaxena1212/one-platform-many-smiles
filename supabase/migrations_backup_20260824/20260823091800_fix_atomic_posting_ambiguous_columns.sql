
BEGIN;

-- ============================================================
-- Fix Atomic Accounting Event Posting
-- Migration:
--
-- Purpose:
--   Fix PL/pgSQL ambiguity caused by RETURNS TABLE output
--   variables sharing names with table columns.
--
--   In particular:
--
--       event_id
--
--   was ambiguous between:
--
--       fin_accounting_event_lines.event_id
--
--   and the function output variable:
--
--       event_id
--
--   All table columns are now explicitly qualified.
--
-- UUID architecture:
--   fin_accounting_events.id              = UUID
--   fin_accounting_events.voucher_id      = UUID
--   fin_vouchers.id                       = UUID
--   fin_vouchers.accounting_event_id      = UUID
--   fin_voucher_lines.voucher_id          = UUID
--   fin_coa_accounts.id                   = UUID
-- ============================================================


CREATE OR REPLACE FUNCTION public.post_accounting_event_atomic(
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

    SELECT e.*
    INTO v_event
    FROM public.fin_accounting_events AS e
    WHERE e.id = p_event_id
    FOR UPDATE;


    IF NOT FOUND THEN

        RAISE EXCEPTION
            'Accounting event % was not found.',
            p_event_id;

    END IF;


    -- ========================================================
    -- 2. Already POSTED
    --
    -- Idempotent behavior:
    -- If the event is already posted, return the existing
    -- voucher instead of creating another voucher.
    -- ========================================================

    IF v_event.status = 'POSTED' THEN

        IF v_event.voucher_id IS NULL THEN

            RAISE EXCEPTION
                'Accounting event % is POSTED but voucher_id is null.',
                p_event_id;

        END IF;


        SELECT v.*
        INTO v_voucher
        FROM public.fin_vouchers AS v
        WHERE v.id = v_event.voucher_id;


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
    --
    -- IMPORTANT:
    -- Explicit alias qualification prevents ambiguity with
    -- the RETURNS TABLE event_id output variable.
    -- ========================================================

    IF NOT EXISTS (

        SELECT 1
        FROM public.fin_accounting_event_lines AS l
        WHERE l.event_id = p_event_id

    ) THEN

        RAISE EXCEPTION
            'Accounting event % contains no accounting lines.',
            p_event_id;

    END IF;


    -- ========================================================
    -- 5. Validate accounting line amounts
    -- ========================================================

    SELECT
        COALESCE(SUM(l.debit), 0),
        COALESCE(SUM(l.credit), 0)

    INTO
        v_total_debit,
        v_total_credit

    FROM public.fin_accounting_event_lines AS l

    WHERE l.event_id = p_event_id;


    v_total_debit := ROUND(v_total_debit, 2);
    v_total_credit := ROUND(v_total_credit, 2);


    IF v_total_debit <= 0
       AND v_total_credit <= 0 THEN

        RAISE EXCEPTION
            'Accounting event % contains zero-value accounting lines.',
            p_event_id;

    END IF;


    -- ========================================================
    -- 6. Validate debit / credit balance
    -- ========================================================

    IF ABS(v_total_debit - v_total_credit) > 0.001 THEN

        RAISE EXCEPTION
            'Accounting event % is unbalanced. Debit=%, Credit=%.',
            p_event_id,
            v_total_debit,
            v_total_credit;

    END IF;


    -- ========================================================
    -- 7. Validate event totals
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
    -- 8. Validate COA account resolution
    --
    -- Every accounting line must resolve to an active COA
    -- account either through:
    --
    --   1. account_id
    --   2. account_code
    --
    -- No unresolved accounting line may be posted.
    -- ========================================================

    IF EXISTS (

        SELECT 1

        FROM public.fin_accounting_event_lines AS l

        LEFT JOIN public.fin_coa_accounts AS coa

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

          AND COALESCE(
                l.account_id,
                coa.id
              ) IS NULL

    ) THEN

        RAISE EXCEPTION
            'Accounting event % contains an accounting line with an unresolved COA account.',
            p_event_id;

    END IF;


    -- ========================================================
    -- 9. Check for an existing voucher
    --
    -- Handles an earlier/incomplete posting attempt.
    -- ========================================================

    SELECT v.*
    INTO v_voucher

    FROM public.fin_vouchers AS v

    WHERE v.accounting_event_id = p_event_id

    LIMIT 1;


    IF FOUND THEN

        UPDATE public.fin_accounting_events AS e

        SET
            status = 'POSTED',
            voucher_id = v_voucher.id,
            posted_at = COALESCE(
                e.posted_at,
                NOW()
            )

        WHERE e.id = p_event_id;


        RETURN QUERY
        SELECT
            p_event_id,
            v_voucher.id,
            v_voucher.voucher_number,
            'POSTED'::TEXT;

        RETURN;

    END IF;


    -- ========================================================
    -- 10. Generate voucher number
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
    -- 11. Create financial voucher
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
    -- 12. Create voucher lines
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

        COALESCE(
            l.tenant_id,
            v_event.tenant_id
        ),

        COALESCE(
            l.lease_id,
            v_event.lease_id
        ),

        COALESCE(
            l.property_id,
            v_event.property_id
        ),

        COALESCE(
            l.unit_id,
            v_event.unit_id
        ),

        COALESCE(
            l.customer_id,
            v_event.customer_id
        ),

        l.cost_center_id,

        COALESCE(
            l.source_type,
            v_event.source_type
        ),

        COALESCE(
            l.source_id,
            v_event.source_id
        )

    FROM public.fin_accounting_event_lines AS l

    LEFT JOIN public.fin_coa_accounts AS coa

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
    -- 13. Mark accounting event as POSTED
    -- ========================================================

    UPDATE public.fin_accounting_events AS e

    SET
        status = 'POSTED',
        voucher_id = v_voucher.id,
        posted_at = NOW()

    WHERE e.id = p_event_id;


    -- ========================================================
    -- 14. Return posting result
    -- ========================================================

    RETURN QUERY

    SELECT
        v_event.id,
        v_voucher.id,
        v_voucher.voucher_number,
        'POSTED'::TEXT;

END;
$$;


-- ============================================================
-- Restore function permissions
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