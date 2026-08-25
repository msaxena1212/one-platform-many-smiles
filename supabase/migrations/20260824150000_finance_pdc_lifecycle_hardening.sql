BEGIN;

-- ============================================================
-- Finance PDC Lifecycle Hardening
--
-- Fixes the split PDC/accounting path by making every PDC
-- lifecycle transition a single database transaction:
--
--   PDC business state
--        +
--   fin_accounting_events / fin_accounting_event_lines
--        +
--   fin_vouchers / fin_voucher_lines
--
-- The legacy `pdcs` table and legacy erp_* posting path are NOT
-- written by this migration.
--
-- IMPORTANT:
-- fin_pdc_register is a legacy BIGINT business register while the
-- final accounting architecture uses UUIDs. Therefore legacy
-- numeric tenant/property/unit IDs are retained in event metadata
-- rather than being cast into UUID columns.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Ensure the PDC register supports the final business states
-- ------------------------------------------------------------

ALTER TABLE public.fin_pdc_register
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_fin_pdc_register_cheque_number
    ON public.fin_pdc_register(cheque_number);

CREATE INDEX IF NOT EXISTS idx_fin_pdc_register_status
    ON public.fin_pdc_register(status);

CREATE INDEX IF NOT EXISTS idx_fin_pdc_register_maturity_status
    ON public.fin_pdc_register(cheque_date, status);

-- ------------------------------------------------------------
-- 2. Generic updated-at trigger for PDC register
-- ------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_fin_pdc_register_updated_at
ON public.fin_pdc_register;

CREATE TRIGGER trg_fin_pdc_register_updated_at
BEFORE UPDATE ON public.fin_pdc_register
FOR EACH ROW
EXECUTE FUNCTION public.fin_set_updated_at();

-- ------------------------------------------------------------
-- 3. Canonical PDC accounting event helper
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fin_post_pdc_event(
    p_pdc_id BIGINT,
    p_event_type public.fin_accounting_event_type,
    p_description TEXT,
    p_reference_number TEXT,
    p_idempotency_key TEXT,
    p_lines JSONB,
    p_metadata JSONB DEFAULT '{}'::jsonb
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
    v_event_id UUID;
    v_existing public.fin_accounting_events%ROWTYPE;
    v_line JSONB;
    v_line_number INTEGER := 0;
    v_total_debit NUMERIC(18,2) := 0;
    v_total_credit NUMERIC(18,2) := 0;
    v_result RECORD;
BEGIN
    IF p_pdc_id IS NULL THEN
        RAISE EXCEPTION 'PDC id is required.';
    END IF;

    IF jsonb_typeof(p_lines) <> 'array' OR jsonb_array_length(p_lines) = 0 THEN
        RAISE EXCEPTION 'PDC accounting event must contain at least one line.';
    END IF;

    -- Idempotency is checked before creating a new event.
    SELECT *
      INTO v_existing
      FROM public.fin_accounting_events
     WHERE idempotency_key = p_idempotency_key
     FOR UPDATE;

    IF FOUND THEN
        IF v_existing.status = 'POSTED' AND v_existing.voucher_id IS NOT NULL THEN
            SELECT *
              INTO v_result
              FROM public.post_accounting_event_atomic(v_existing.id);

            RETURN QUERY SELECT
                v_result.event_id,
                v_result.voucher_id,
                v_result.voucher_number,
                v_result.status;
            RETURN;
        END IF;

        v_event_id := v_existing.id;
    ELSE
        INSERT INTO public.fin_accounting_events (
            event_type,
            status,
            event_date,
            posting_date,
            source_type,
            source_id,
            reference_number,
            description,
            idempotency_key,
            metadata,
            total_debit,
            total_credit
        )
        VALUES (
            p_event_type,
            'DRAFT',
            CURRENT_DATE,
            CURRENT_DATE,
            'PDC',
            NULL,
            p_reference_number,
            p_description,
            p_idempotency_key,
            COALESCE(p_metadata, '{}'::jsonb) || jsonb_build_object('pdc_id', p_pdc_id),
            0,
            0
        )
        RETURNING id INTO v_event_id;
    END IF;

    -- Lines are only inserted when the event has not already been built.
    IF NOT EXISTS (
        SELECT 1
          FROM public.fin_accounting_event_lines
         WHERE event_id = v_event_id
    ) THEN
        FOR v_line IN SELECT * FROM jsonb_array_elements(p_lines)
        LOOP
            v_line_number := v_line_number + 1;

            IF NULLIF(TRIM(v_line->>'account_code'), '') IS NULL THEN
                RAISE EXCEPTION 'PDC accounting line % has no account_code.', v_line_number;
            END IF;

            IF COALESCE((v_line->>'debit')::NUMERIC, 0) < 0
               OR COALESCE((v_line->>'credit')::NUMERIC, 0) < 0 THEN
                RAISE EXCEPTION 'PDC accounting line % contains a negative amount.', v_line_number;
            END IF;

            IF COALESCE((v_line->>'debit')::NUMERIC, 0) > 0
               AND COALESCE((v_line->>'credit')::NUMERIC, 0) > 0 THEN
                RAISE EXCEPTION 'PDC accounting line % cannot contain both debit and credit.', v_line_number;
            END IF;

            IF COALESCE((v_line->>'debit')::NUMERIC, 0) = 0
               AND COALESCE((v_line->>'credit')::NUMERIC, 0) = 0 THEN
                RAISE EXCEPTION 'PDC accounting line % has no amount.', v_line_number;
            END IF;

            v_total_debit := v_total_debit + COALESCE((v_line->>'debit')::NUMERIC, 0);
            v_total_credit := v_total_credit + COALESCE((v_line->>'credit')::NUMERIC, 0);

            INSERT INTO public.fin_accounting_event_lines (
                event_id,
                line_number,
                account_id,
                account_code,
                account_name,
                debit,
                credit,
                description,
                source_type,
                source_id,
                metadata
            )
            SELECT
                v_event_id,
                v_line_number,
                NULL,
                v_line->>'account_code',
                v_line->>'account_name',
                ROUND(COALESCE((v_line->>'debit')::NUMERIC, 0), 2),
                ROUND(COALESCE((v_line->>'credit')::NUMERIC, 0), 2),
                v_line->>'description',
                'PDC',
                NULL,
                COALESCE(p_metadata, '{}'::jsonb) || jsonb_build_object('pdc_id', p_pdc_id)
            ;
        END LOOP;
    ELSE
        SELECT COALESCE(SUM(debit), 0), COALESCE(SUM(credit), 0)
          INTO v_total_debit, v_total_credit
          FROM public.fin_accounting_event_lines
         WHERE event_id = v_event_id;
    END IF;

    IF ROUND(v_total_debit, 2) <= 0 OR ROUND(v_total_credit, 2) <= 0 THEN
        RAISE EXCEPTION 'PDC accounting event % has zero accounting value.', v_event_id;
    END IF;

    IF ROUND(v_total_debit, 2) <> ROUND(v_total_credit, 2) THEN
        RAISE EXCEPTION
            'PDC accounting event % is unbalanced. Debit=%, Credit=%.',
            v_event_id, v_total_debit, v_total_credit;
    END IF;

    UPDATE public.fin_accounting_events
       SET total_debit = ROUND(v_total_debit, 2),
           total_credit = ROUND(v_total_credit, 2),
           updated_at = NOW()
     WHERE id = v_event_id;

    SELECT *
      INTO v_result
      FROM public.post_accounting_event_atomic(v_event_id);

    RETURN QUERY SELECT
        v_result.event_id,
        v_result.voucher_id,
        v_result.voucher_number,
        v_result.status;
END;
$$;

-- ------------------------------------------------------------
-- 4. Canonical PDC lifecycle processor
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fin_process_pdc_lifecycle(
    p_action TEXT,
    p_pdc_id BIGINT DEFAULT NULL,
    p_cheque_number TEXT DEFAULT NULL,
    p_cheque_date DATE DEFAULT NULL,
    p_amount NUMERIC(18,2) DEFAULT NULL,
    p_tenant_id BIGINT DEFAULT NULL,
    p_property_id BIGINT DEFAULT NULL,
    p_unit_id BIGINT DEFAULT NULL,
    p_bank_id BIGINT DEFAULT NULL,
    p_unit_code TEXT DEFAULT NULL
)
RETURNS TABLE (
    pdc_id BIGINT,
    pdc_status TEXT,
    accounting_event_id UUID,
    voucher_id UUID,
    voucher_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_pdc public.fin_pdc_register%ROWTYPE;
    v_event_type public.fin_accounting_event_type;
    v_target_status TEXT;
    v_description TEXT;
    v_reference TEXT;
    v_idempotency TEXT;
    v_lines JSONB;
    v_metadata JSONB;
    v_result RECORD;
BEGIN
    p_action := UPPER(TRIM(COALESCE(p_action, '')));

    IF p_action = 'RECEIVE' THEN
        IF NULLIF(TRIM(p_cheque_number), '') IS NULL THEN
            RAISE EXCEPTION 'Cheque number is required.';
        END IF;
        IF p_cheque_date IS NULL THEN
            RAISE EXCEPTION 'Cheque date is required.';
        END IF;
        IF COALESCE(p_amount, 0) <= 0 THEN
            RAISE EXCEPTION 'PDC amount must be greater than zero.';
        END IF;

        IF EXISTS (
            SELECT 1
              FROM public.fin_pdc_register
             WHERE cheque_number = TRIM(p_cheque_number)
        ) THEN
            RAISE EXCEPTION 'PDC cheque % already exists.', TRIM(p_cheque_number);
        END IF;

        INSERT INTO public.fin_pdc_register (
            cheque_number,
            cheque_date,
            amount,
            tenant_id,
            property_id,
            unit_id,
            bank_id,
            status
        )
        VALUES (
            TRIM(p_cheque_number),
            p_cheque_date,
            ROUND(p_amount, 2),
            p_tenant_id,
            p_property_id,
            p_unit_id,
            p_bank_id,
            'In Hand'
        )
        RETURNING * INTO v_pdc;

        v_event_type := 'PDC_RECEIVED';
        v_target_status := 'In Hand';
        v_description := format('PDC Collection — Chq %s', v_pdc.cheque_number);
        v_reference := v_pdc.cheque_number;
        v_idempotency := format('PDC:%s:PDC_RECEIVED', v_pdc.id);
        v_lines := jsonb_build_array(
            jsonb_build_object('account_code','12900','account_name','PDC In Hand','debit',v_pdc.amount,'credit',0,'description','PDC In Hand'),
            jsonb_build_object('account_code','21400','account_name','Customer(PDC) - Unit','debit',0,'credit',v_pdc.amount,'description','Customer(PDC) - Unit Account')
        );

    ELSE
        IF p_pdc_id IS NULL AND NULLIF(TRIM(p_cheque_number), '') IS NULL THEN
            RAISE EXCEPTION 'PDC id or cheque number is required.';
        END IF;

        SELECT *
          INTO v_pdc
          FROM public.fin_pdc_register
         WHERE (p_pdc_id IS NOT NULL AND id = p_pdc_id)
            OR (p_cheque_number IS NOT NULL AND cheque_number = TRIM(p_cheque_number))
         ORDER BY CASE WHEN p_pdc_id IS NOT NULL AND id = p_pdc_id THEN 0 ELSE 1 END
         LIMIT 1
         FOR UPDATE;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'PDC % was not found.', COALESCE(p_pdc_id::TEXT, p_cheque_number);
        END IF;

        IF p_action = 'DEPOSIT' THEN
            IF v_pdc.status <> 'In Hand' THEN
                RAISE EXCEPTION 'PDC % cannot be deposited from status %.', v_pdc.id, v_pdc.status;
            END IF;
            v_event_type := 'PDC_DEPOSITED';
            v_target_status := 'Deposited';
            v_description := format('PDC Deposited to Bank — Chq %s', v_pdc.cheque_number);
            v_lines := jsonb_build_array(
                jsonb_build_object('account_code','12000','account_name','Bank Account','debit',v_pdc.amount,'credit',0,'description','Bank Account'),
                jsonb_build_object('account_code','12900','account_name','PDC In Hand','debit',0,'credit',v_pdc.amount,'description','PDC In Hand')
            );

        ELSIF p_action = 'CLEAR' THEN
            IF v_pdc.status <> 'Deposited' THEN
                RAISE EXCEPTION 'PDC % cannot be cleared from status %.', v_pdc.id, v_pdc.status;
            END IF;
            v_event_type := 'PDC_CLEARED';
            v_target_status := 'Cleared';
            v_description := format('PDC Cleared — Chq %s', v_pdc.cheque_number);
            v_lines := jsonb_build_array(
                jsonb_build_object('account_code','21400','account_name','Customer(PDC) - Unit','debit',v_pdc.amount,'credit',0,'description','Customer(PDC) - Unit Account'),
                jsonb_build_object('account_code','12413','account_name','Receivable - Unit','debit',0,'credit',v_pdc.amount,'description','Receivable - Unit Account')
            );

        ELSIF p_action IN ('RETURN','BOUNCE') THEN
            IF v_pdc.status <> 'Deposited' THEN
                RAISE EXCEPTION 'PDC % cannot be returned from status %.', v_pdc.id, v_pdc.status;
            END IF;
            v_event_type := 'PDC_RETURNED';
            v_target_status := 'Returned';
            v_description := format('PDC Returned / Bounced — Chq %s', v_pdc.cheque_number);
            v_lines := jsonb_build_array(
                jsonb_build_object('account_code','12900','account_name','PDC In Hand','debit',v_pdc.amount,'credit',0,'description','PDC In Hand (re-recorded on return)'),
                jsonb_build_object('account_code','12000','account_name','Bank Account','debit',0,'credit',v_pdc.amount,'description','Bank Account (reversed on cheque return)'),
                jsonb_build_object('account_code','12413','account_name','Receivable - Unit','debit',v_pdc.amount,'credit',0,'description','Receivable - Unit Account (re-exposed)'),
                jsonb_build_object('account_code','21400','account_name','Customer(PDC) - Unit','debit',0,'credit',v_pdc.amount,'description','Customer(PDC) - Unit Account (reversed)')
            );

        ELSIF p_action = 'REPLACE' THEN
            IF v_pdc.status NOT IN ('In Hand','Returned') THEN
                RAISE EXCEPTION 'PDC % cannot be replaced from status %.', v_pdc.id, v_pdc.status;
            END IF;
            v_event_type := 'PDC_REPLACED';
            v_target_status := 'Replaced';
            v_description := format('Cash Deposit in place of PDC — %s', v_pdc.cheque_number);
            v_lines := jsonb_build_array(
                jsonb_build_object('account_code','12000','account_name','Bank Account','debit',v_pdc.amount,'credit',0,'description','Bank Account'),
                jsonb_build_object('account_code','12100','account_name','Cash In Hand','debit',0,'credit',v_pdc.amount,'description','Cash In Hand')
            );

        ELSE
            RAISE EXCEPTION 'Unsupported PDC action: %', p_action;
        END IF;

        v_reference := v_pdc.cheque_number;
        v_idempotency := format('PDC:%s:%s', v_pdc.id, v_event_type::TEXT);

        v_metadata := jsonb_build_object(
            'pdc_id', v_pdc.id,
            'tenant_id_legacy', v_pdc.tenant_id,
            'property_id_legacy', v_pdc.property_id,
            'unit_id_legacy', v_pdc.unit_id,
            'bank_id_legacy', v_pdc.bank_id,
            'unit_code', p_unit_code
        );
    END IF;

    IF v_metadata IS NULL THEN
        v_metadata := jsonb_build_object(
            'pdc_id', v_pdc.id,
            'tenant_id_legacy', v_pdc.tenant_id,
            'property_id_legacy', v_pdc.property_id,
            'unit_id_legacy', v_pdc.unit_id,
            'bank_id_legacy', v_pdc.bank_id,
            'unit_code', p_unit_code
        );
    END IF;

    SELECT *
      INTO v_result
      FROM public.fin_post_pdc_event(
          v_pdc.id,
          v_event_type,
          v_description,
          v_reference,
          v_idempotency,
          v_lines,
          v_metadata
      );

    -- Update the business status only after the accounting event has
    -- successfully posted. Because the function is transactional, a
    -- posting failure rolls back this status change as well.
    IF p_action <> 'RECEIVE' THEN
        UPDATE public.fin_pdc_register
           SET status = v_target_status,
               deposit_date = CASE WHEN p_action IN ('DEPOSIT','REPLACE') THEN CURRENT_DATE ELSE deposit_date END,
               cleared_date = CASE WHEN p_action = 'CLEAR' THEN CURRENT_DATE ELSE cleared_date END,
               returned_date = CASE WHEN p_action IN ('RETURN','BOUNCE') THEN CURRENT_DATE ELSE returned_date END,
               updated_at = NOW()
         WHERE id = v_pdc.id;

        v_pdc.status := v_target_status;
    END IF;

    RETURN QUERY SELECT
        v_pdc.id,
        v_pdc.status,
        v_result.event_id,
        v_result.voucher_id,
        v_result.voucher_number;
END;
$$;

-- ------------------------------------------------------------
-- 5. Permissions
-- ------------------------------------------------------------

REVOKE ALL ON FUNCTION public.fin_post_pdc_event(
    BIGINT,
    public.fin_accounting_event_type,
    TEXT,
    TEXT,
    TEXT,
    JSONB,
    JSONB
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.fin_post_pdc_event(
    BIGINT,
    public.fin_accounting_event_type,
    TEXT,
    TEXT,
    TEXT,
    JSONB,
    JSONB
) TO service_role;

REVOKE ALL ON FUNCTION public.fin_process_pdc_lifecycle(
    TEXT,
    BIGINT,
    TEXT,
    DATE,
    NUMERIC,
    BIGINT,
    BIGINT,
    BIGINT,
    BIGINT,
    TEXT
) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.fin_process_pdc_lifecycle(
    TEXT,
    BIGINT,
    TEXT,
    DATE,
    NUMERIC,
    BIGINT,
    BIGINT,
    BIGINT,
    BIGINT,
    TEXT
) TO authenticated, service_role;

COMMIT;
