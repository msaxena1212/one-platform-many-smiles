BEGIN;

-- ============================================================
-- UNIVERSAL FINANCIAL TRANSACTION RECEIPTS
--
-- Every POSTED accounting event receives exactly one immutable
-- financial receipt/acknowledgement document.
--
-- Architecture:
--   Business transaction
--        -> Accounting Event
--        -> Atomic Posting
--        -> Voucher / GL
--        -> Financial Receipt
--
-- The receipt is evidence of the posted financial transaction;
-- it is NOT a second accounting record and must never be used
-- as an alternative posting path.
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS public.fin_receipt_number_seq;

CREATE TABLE IF NOT EXISTS public.fin_transaction_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_no TEXT NOT NULL UNIQUE,
  acknowledgement_no TEXT NOT NULL UNIQUE,

  accounting_event_id UUID NOT NULL UNIQUE
    REFERENCES public.fin_accounting_events(id) ON DELETE RESTRICT,

  voucher_id UUID
    REFERENCES public.fin_vouchers(id) ON DELETE RESTRICT,

  receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_category TEXT NOT NULL DEFAULT 'FINANCIAL_TRANSACTION',
  direction TEXT NOT NULL DEFAULT 'NON_CASH',

  amount NUMERIC(18,2) NOT NULL CHECK (amount > 0),
  currency_code TEXT NOT NULL DEFAULT 'QAR',

  source_type TEXT,
  source_id UUID,
  reference_no TEXT,
  description TEXT,

  tenant_id UUID,
  customer_id UUID,
  property_id UUID,
  unit_id UUID,
  lease_id UUID,

  payment_method TEXT,
  instrument_reference TEXT,

  status TEXT NOT NULL DEFAULT 'ISSUED',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  issued_by UUID,

  -- Immutable snapshot used for printing/PDF generation and audit.
  receipt_payload JSONB NOT NULL DEFAULT '{}'::jsonb,

  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fin_transaction_receipts_direction_chk
    CHECK (direction IN ('IN', 'OUT', 'NON_CASH')),

  CONSTRAINT fin_transaction_receipts_status_chk
    CHECK (status IN ('ISSUED', 'VOIDED'))
);

CREATE INDEX IF NOT EXISTS idx_fin_transaction_receipts_event
  ON public.fin_transaction_receipts(accounting_event_id);

CREATE INDEX IF NOT EXISTS idx_fin_transaction_receipts_voucher
  ON public.fin_transaction_receipts(voucher_id);

CREATE INDEX IF NOT EXISTS idx_fin_transaction_receipts_date
  ON public.fin_transaction_receipts(receipt_date DESC);

CREATE INDEX IF NOT EXISTS idx_fin_transaction_receipts_source
  ON public.fin_transaction_receipts(source_type, source_id);

CREATE INDEX IF NOT EXISTS idx_fin_transaction_receipts_tenant
  ON public.fin_transaction_receipts(tenant_id);

CREATE INDEX IF NOT EXISTS idx_fin_transaction_receipts_status
  ON public.fin_transaction_receipts(status);

DROP TRIGGER IF EXISTS trg_fin_transaction_receipts_updated_at
  ON public.fin_transaction_receipts;

CREATE TRIGGER trg_fin_transaction_receipts_updated_at
BEFORE UPDATE ON public.fin_transaction_receipts
FOR EACH ROW
EXECUTE FUNCTION public.fin_set_updated_at();

-- ------------------------------------------------------------
-- Receipt classification
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fin_receipt_category(
  p_event_type TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE p_event_type
    WHEN 'REFUND_CREATED' THEN 'REFUND'
    WHEN 'REFUND_CANCELLED' THEN 'REFUND_CANCELLATION'
    WHEN 'SECURITY_DEPOSIT_REFUNDED' THEN 'DEPOSIT_REFUND'
    WHEN 'PDC_RECEIVED' THEN 'PDC_RECEIPT'
    WHEN 'PDC_DEPOSITED' THEN 'PDC_DEPOSIT'
    WHEN 'PDC_CLEARED' THEN 'PDC_CLEARANCE'
    WHEN 'PDC_BOUNCED' THEN 'PDC_BOUNCE'
    WHEN 'PDC_RETURNED' THEN 'PDC_RETURN'
    WHEN 'PDC_CANCELLED' THEN 'PDC_CANCELLATION'
    WHEN 'PDC_REPLACED' THEN 'PDC_REPLACEMENT'
    WHEN 'SECURITY_DEPOSIT_RECEIVED' THEN 'DEPOSIT_RECEIPT'
    WHEN 'RENT_COLLECTION' THEN 'RENT_RECEIPT'
    WHEN 'RECEIPT_CREATED' THEN 'RECEIPT'
    WHEN 'RECEIPT_CANCELLED' THEN 'RECEIPT_CANCELLATION'
    WHEN 'MANUAL_JOURNAL' THEN 'JOURNAL_RECEIPT'
    WHEN 'ADJUSTMENT' THEN 'ADJUSTMENT_RECEIPT'
    ELSE 'FINANCIAL_TRANSACTION'
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.fin_receipt_direction(
  p_event_type TEXT,
  p_total_debit NUMERIC,
  p_total_credit NUMERIC
)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_event_type IN (
    'REFUND_CREATED',
    'SECURITY_DEPOSIT_REFUNDED'
  ) THEN
    RETURN 'OUT';
  END IF;

  IF p_event_type IN (
    'RENT_COLLECTION',
    'SECURITY_DEPOSIT_RECEIVED',
    'PDC_RECEIVED',
    'RECEIPT_CREATED'
  ) THEN
    RETURN 'IN';
  END IF;

  RETURN 'NON_CASH';
END;
$$;

-- ------------------------------------------------------------
-- Generate the receipt from the POSTED accounting event.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fin_generate_transaction_receipt()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_receipt_no TEXT;
  v_category TEXT;
  v_direction TEXT;
  v_currency TEXT;
  v_voucher_number TEXT;
  v_lines JSONB;
  v_payload JSONB;
BEGIN
  IF NEW.status <> 'POSTED' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.status = 'POSTED' THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.fin_transaction_receipts r
    WHERE r.accounting_event_id = NEW.id
  ) THEN
    RETURN NEW;
  END IF;

  v_category := public.fin_receipt_category(NEW.event_type::TEXT);
  v_direction := public.fin_receipt_direction(
    NEW.event_type::TEXT,
    NEW.total_debit,
    NEW.total_credit
  );

  v_currency := COALESCE(
    NULLIF(NEW.metadata ->> 'currency_code', ''),
    NULLIF(NEW.metadata ->> 'currency', ''),
    'QAR'
  );

  SELECT v.voucher_number
  INTO v_voucher_number
  FROM public.fin_vouchers v
  WHERE v.id = NEW.voucher_id;

  SELECT COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'line_number', l.line_number,
        'account_code', COALESCE(coa.account_code, l.account_code),
        'account_name', COALESCE(coa.account_name, l.account_name),
        'debit', ROUND(l.debit, 2),
        'credit', ROUND(l.credit, 2),
        'description', l.description
      ) ORDER BY l.line_number
    ),
    '[]'::jsonb
  )
  INTO v_lines
  FROM public.fin_accounting_event_lines l
  LEFT JOIN public.fin_coa_accounts coa
    ON coa.id = l.account_id;

  v_receipt_no := format(
    'FR-%s-%s',
    to_char(COALESCE(NEW.posting_date, CURRENT_DATE), 'YYYY'),
    lpad(nextval('public.fin_receipt_number_seq')::TEXT, 8, '0')
  );

  v_payload := jsonb_build_object(
    'receipt_no', v_receipt_no,
    'acknowledgement_no', v_receipt_no,
    'receipt_date', COALESCE(NEW.posting_date, CURRENT_DATE),
    'receipt_category', v_category,
    'direction', v_direction,
    'amount', ROUND(NEW.total_debit, 2),
    'currency_code', v_currency,
    'accounting_event_id', NEW.id,
    'event_type', NEW.event_type,
    'event_status', NEW.status,
    'voucher_id', NEW.voucher_id,
    'voucher_number', v_voucher_number,
    'source_type', NEW.source_type,
    'source_id', NEW.source_id,
    'reference_no', NEW.reference_number,
    'description', NEW.description,
    'tenant_id', NEW.tenant_id,
    'customer_id', NEW.customer_id,
    'property_id', NEW.property_id,
    'unit_id', NEW.unit_id,
    'lease_id', NEW.lease_id,
    'payment_method', COALESCE(
      NEW.metadata ->> 'payment_method',
      NEW.metadata ->> 'payment_mode'
    ),
    'instrument_reference', COALESCE(
      NEW.metadata ->> 'instrument_reference',
      NEW.metadata ->> 'cheque_number',
      NEW.reference_number
    ),
    'lines', v_lines,
    'metadata', NEW.metadata
  );

  INSERT INTO public.fin_transaction_receipts (
    receipt_no,
    acknowledgement_no,
    accounting_event_id,
    voucher_id,
    receipt_date,
    receipt_category,
    direction,
    amount,
    currency_code,
    source_type,
    source_id,
    reference_no,
    description,
    tenant_id,
    customer_id,
    property_id,
    unit_id,
    lease_id,
    payment_method,
    instrument_reference,
    status,
    issued_by,
    receipt_payload,
    metadata
  )
  VALUES (
    v_receipt_no,
    v_receipt_no,
    NEW.id,
    NEW.voucher_id,
    COALESCE(NEW.posting_date, CURRENT_DATE),
    v_category,
    v_direction,
    ROUND(NEW.total_debit, 2),
    v_currency,
    NEW.source_type,
    NEW.source_id,
    NEW.reference_number,
    NEW.description,
    NEW.tenant_id,
    NEW.customer_id,
    NEW.property_id,
    NEW.unit_id,
    NEW.lease_id,
    COALESCE(
      NEW.metadata ->> 'payment_method',
      NEW.metadata ->> 'payment_mode'
    ),
    COALESCE(
      NEW.metadata ->> 'instrument_reference',
      NEW.metadata ->> 'cheque_number',
      NEW.reference_number
    ),
    'ISSUED',
    NEW.posted_by,
    v_payload,
    NEW.metadata
  )
  ON CONFLICT (accounting_event_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fin_generate_transaction_receipt
  ON public.fin_accounting_events;

CREATE TRIGGER trg_fin_generate_transaction_receipt
AFTER INSERT OR UPDATE OF status
ON public.fin_accounting_events
FOR EACH ROW
WHEN (NEW.status = 'POSTED')
EXECUTE FUNCTION public.fin_generate_transaction_receipt();

-- ------------------------------------------------------------
-- Deferred integrity guard:
-- a POSTED event must have a POSTED voucher at transaction end.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.fin_guard_posted_event_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_voucher_status TEXT;
BEGIN
  IF NEW.status <> 'POSTED' THEN
    RETURN NEW;
  END IF;

  IF NEW.voucher_id IS NULL THEN
    RAISE EXCEPTION
      'Posted accounting event % requires voucher_id.', NEW.id;
  END IF;

  SELECT UPPER(v.status)
  INTO v_voucher_status
  FROM public.fin_vouchers v
  WHERE v.id = NEW.voucher_id;

  IF v_voucher_status IS DISTINCT FROM 'POSTED' THEN
    RAISE EXCEPTION
      'Posted accounting event % requires a POSTED voucher.', NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fin_guard_posted_event_integrity
  ON public.fin_accounting_events;

CREATE CONSTRAINT TRIGGER trg_fin_guard_posted_event_integrity
AFTER INSERT OR UPDATE OF status, voucher_id
ON public.fin_accounting_events
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.fin_guard_posted_event_integrity();

-- Voucher lines are also checked at transaction end. This allows the
-- atomic posting function to create a Posted voucher and its lines before
-- flipping the event to POSTED, while still rejecting an incomplete
-- transaction at COMMIT.
DROP TRIGGER IF EXISTS trg_fin_guard_voucher_line_parent
  ON public.fin_voucher_lines;

CREATE CONSTRAINT TRIGGER trg_fin_guard_voucher_line_parent
AFTER INSERT OR UPDATE
ON public.fin_voucher_lines
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.fin_guard_voucher_line_parent();

-- Replace the voucher guard with a deferred constraint trigger so the
-- atomic posting function can create the voucher before it flips the
-- accounting event to POSTED, while direct incomplete writes still fail
-- at transaction commit.

DROP TRIGGER IF EXISTS trg_fin_guard_posted_voucher ON public.fin_vouchers;

CREATE CONSTRAINT TRIGGER trg_fin_guard_posted_voucher
AFTER INSERT OR UPDATE
ON public.fin_vouchers
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION public.fin_guard_posted_voucher();

-- ------------------------------------------------------------
-- Backfill receipts for transactions that were already posted
-- before this migration.
-- ------------------------------------------------------------

INSERT INTO public.fin_transaction_receipts (
  receipt_no,
  acknowledgement_no,
  accounting_event_id,
  voucher_id,
  receipt_date,
  receipt_category,
  direction,
  amount,
  currency_code,
  source_type,
  source_id,
  reference_no,
  description,
  tenant_id,
  customer_id,
  property_id,
  unit_id,
  lease_id,
  payment_method,
  instrument_reference,
  status,
  issued_by,
  receipt_payload,
  metadata
)
SELECT
  format(
    'FR-%s-%s',
    to_char(COALESCE(ae.posting_date, CURRENT_DATE), 'YYYY'),
    lpad(seq.seq_no::TEXT, 8, '0')
  ),
  format(
    'FR-%s-%s',
    to_char(COALESCE(ae.posting_date, CURRENT_DATE), 'YYYY'),
    lpad(seq.seq_no::TEXT, 8, '0')
  ),
  ae.id,
  ae.voucher_id,
  COALESCE(ae.posting_date, CURRENT_DATE),
  public.fin_receipt_category(ae.event_type::TEXT),
  public.fin_receipt_direction(ae.event_type::TEXT, ae.total_debit, ae.total_credit),
  ROUND(ae.total_debit, 2),
  COALESCE(NULLIF(ae.metadata ->> 'currency_code', ''), NULLIF(ae.metadata ->> 'currency', ''), 'QAR'),
  ae.source_type,
  ae.source_id,
  ae.reference_number,
  ae.description,
  ae.tenant_id,
  ae.customer_id,
  ae.property_id,
  ae.unit_id,
  ae.lease_id,
  COALESCE(ae.metadata ->> 'payment_method', ae.metadata ->> 'payment_mode'),
  COALESCE(ae.metadata ->> 'instrument_reference', ae.metadata ->> 'cheque_number', ae.reference_number),
  'ISSUED',
  ae.posted_by,
  jsonb_build_object(
    'receipt_no', format('FR-%s-%s', to_char(COALESCE(ae.posting_date, CURRENT_DATE), 'YYYY'), lpad(seq.seq_no::TEXT, 8, '0')),
    'acknowledgement_no', format('FR-%s-%s', to_char(COALESCE(ae.posting_date, CURRENT_DATE), 'YYYY'), lpad(seq.seq_no::TEXT, 8, '0')),
    'receipt_date', COALESCE(ae.posting_date, CURRENT_DATE),
    'receipt_category', public.fin_receipt_category(ae.event_type::TEXT),
    'direction', public.fin_receipt_direction(ae.event_type::TEXT, ae.total_debit, ae.total_credit),
    'amount', ROUND(ae.total_debit, 2),
    'currency_code', COALESCE(NULLIF(ae.metadata ->> 'currency_code', ''), NULLIF(ae.metadata ->> 'currency', ''), 'QAR'),
    'accounting_event_id', ae.id,
    'event_type', ae.event_type,
    'voucher_id', ae.voucher_id,
    'voucher_number', v.voucher_number,
    'source_type', ae.source_type,
    'source_id', ae.source_id,
    'reference_no', ae.reference_number,
    'description', ae.description,
    'tenant_id', ae.tenant_id,
    'customer_id', ae.customer_id,
    'property_id', ae.property_id,
    'unit_id', ae.unit_id,
    'lease_id', ae.lease_id,
    'payment_method', COALESCE(ae.metadata ->> 'payment_method', ae.metadata ->> 'payment_mode'),
    'instrument_reference', COALESCE(ae.metadata ->> 'instrument_reference', ae.metadata ->> 'cheque_number', ae.reference_number),
    'lines', COALESCE((
      SELECT jsonb_agg(
        jsonb_build_object(
          'line_number', l.line_number,
          'account_code', COALESCE(coa.account_code, l.account_code),
          'account_name', COALESCE(coa.account_name, l.account_name),
          'debit', ROUND(l.debit, 2),
          'credit', ROUND(l.credit, 2),
          'description', l.description
        ) ORDER BY l.line_number
      )
      FROM public.fin_accounting_event_lines l
      LEFT JOIN public.fin_coa_accounts coa ON coa.id = l.account_id
      WHERE l.event_id = ae.id
    ), '[]'::jsonb),
    'metadata', ae.metadata
  ),
  ae.metadata
FROM public.fin_accounting_events ae
LEFT JOIN public.fin_vouchers v ON v.id = ae.voucher_id
CROSS JOIN LATERAL (SELECT nextval('public.fin_receipt_number_seq') AS seq_no) seq
WHERE ae.status = 'POSTED'
  AND NOT EXISTS (
    SELECT 1
    FROM public.fin_transaction_receipts r
    WHERE r.accounting_event_id = ae.id
  );

-- Sequence should continue after any existing backfill rows.
SELECT setval(
  'public.fin_receipt_number_seq',
  GREATEST(
    COALESCE((SELECT MAX((regexp_match(receipt_no, '-([0-9]+)$'))[1]::BIGINT)
      FROM public.fin_transaction_receipts), 0),
    1
  ),
  TRUE
);

COMMIT;
