BEGIN;

-- ============================================================
-- PROCUREMENT FOUNDATION
-- ============================================================
-- Purpose:
--   Establish the procurement lifecycle independently from
--   Finance / Chart of Accounts.
--
-- Lifecycle:
--   PR
--    -> RFP
--    -> Vendor Quotation
--    -> Negotiation
--    -> PO
--    -> Shipping / Logistics
--    -> GRN
--    -> Supplier Invoice
--
-- IMPORTANT:
--   This migration DOES NOT modify:
--   - erp_chart_of_accounts
--   - erp_journal_entries
--   - Finance / GL tables
-- ============================================================


-- ============================================================
-- 1. ENUMS
-- ============================================================

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'proc_document_status'
    ) THEN
        CREATE TYPE public.proc_document_status AS ENUM (
            'DRAFT',
            'SUBMITTED',
            'PENDING_APPROVAL',
            'PARTIALLY_APPROVED',
            'APPROVED',
            'PARTIALLY_PROCESSED',
            'IN_PROGRESS',
            'COMPLETED',
            'REJECTED',
            'CANCELLED',
            'CLOSED'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'proc_rfx_type'
    ) THEN
        CREATE TYPE public.proc_rfx_type AS ENUM (
            'RFI',
            'RFQ',
            'RFP'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'proc_question_type'
    ) THEN
        CREATE TYPE public.proc_question_type AS ENUM (
            'MCQ',
            'VALUE',
            'DATE',
            'YES_NO',
            'DESCRIPTIVE'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'proc_vendor_response_status'
    ) THEN
        CREATE TYPE public.proc_vendor_response_status AS ENUM (
            'INVITED',
            'VIEWED',
            'RESPONDED',
            'PARTIALLY_RESPONDED',
            'REJECTED',
            'APPROVED',
            'PARTIALLY_APPROVED',
            'NEGOTIATION'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'proc_negotiation_status'
    ) THEN
        CREATE TYPE public.proc_negotiation_status AS ENUM (
            'OPEN',
            'IN_PROGRESS',
            'PARTIALLY_FINALIZED',
            'FINALIZED',
            'CANCELLED'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'proc_logistics_status'
    ) THEN
        CREATE TYPE public.proc_logistics_status AS ENUM (
            'DRAFT',
            'SUBMITTED',
            'APPROVED',
            'VEHICLE_REACHED',
            'IN_TRANSIT',
            'GATE_IN',
            'COMPLETED',
            'CANCELLED'
        );
    END IF;


    IF NOT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'proc_grn_status'
    ) THEN
        CREATE TYPE public.proc_grn_status AS ENUM (
            'DRAFT',
            'SUBMITTED',
            'ACCEPTED',
            'PARTIALLY_ACCEPTED',
            'REJECTED',
            'WAREHOUSE_ACKNOWLEDGED',
            'CANCELLED'
        );
    END IF;

END $$;


-- ============================================================
-- 2. DOCUMENT NUMBER SEQUENCE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_document_sequences (
    document_type TEXT NOT NULL,
    prefix TEXT NOT NULL,
    current_number BIGINT NOT NULL DEFAULT 0,
    padding_length INTEGER NOT NULL DEFAULT 6,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_document_sequences_pkey
        PRIMARY KEY (document_type)
);


-- ============================================================
-- DOCUMENT SEQUENCE SCHEMA NORMALIZATION
-- ============================================================
-- The procurement document sequence table may already exist
-- from an earlier/incomplete procurement foundation attempt.
--
-- Normalize it to the canonical structure used by the
-- Procurement document-number generation layer.
-- ============================================================

DO $$
BEGIN

    -- Remove legacy primary key if present.
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'proc_document_sequences_pkey'
          AND conrelid = 'public.proc_document_sequences'::regclass
    ) THEN
        ALTER TABLE public.proc_document_sequences
            DROP CONSTRAINT proc_document_sequences_pkey;
    END IF;

    -- Remove legacy unique constraint if present.
    IF EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ux_proc_document_sequence'
          AND conrelid = 'public.proc_document_sequences'::regclass
    ) THEN
        ALTER TABLE public.proc_document_sequences
            DROP CONSTRAINT ux_proc_document_sequence;
    END IF;

END $$;


-- Ensure canonical columns exist.

ALTER TABLE public.proc_document_sequences
    ADD COLUMN IF NOT EXISTS document_type TEXT;

ALTER TABLE public.proc_document_sequences
    ADD COLUMN IF NOT EXISTS prefix TEXT;

ALTER TABLE public.proc_document_sequences
    ADD COLUMN IF NOT EXISTS current_number BIGINT DEFAULT 0;

ALTER TABLE public.proc_document_sequences
    ADD COLUMN IF NOT EXISTS padding_length INTEGER DEFAULT 6;

ALTER TABLE public.proc_document_sequences
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.proc_document_sequences
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();


-- Populate canonical columns from legacy columns if they exist.

DO $$
BEGIN

    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'proc_document_sequences'
          AND column_name = 'doc_type'
    ) THEN

        UPDATE public.proc_document_sequences
        SET document_type = COALESCE(document_type, doc_type)
        WHERE document_type IS NULL;

    END IF;


    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'proc_document_sequences'
          AND column_name = 'last_number'
    ) THEN

        UPDATE public.proc_document_sequences
        SET current_number = COALESCE(
            current_number,
            last_number,
            0
        )
        WHERE current_number IS NULL;

    END IF;

END $$;


-- Remove legacy columns after migration to canonical columns.

ALTER TABLE public.proc_document_sequences
    DROP COLUMN IF EXISTS id,
    DROP COLUMN IF EXISTS doc_type,
    DROP COLUMN IF EXISTS fiscal_year,
    DROP COLUMN IF EXISTS last_number;


-- Canonical columns must be mandatory.

ALTER TABLE public.proc_document_sequences
    ALTER COLUMN document_type SET NOT NULL,
    ALTER COLUMN prefix SET NOT NULL,
    ALTER COLUMN current_number SET NOT NULL,
    ALTER COLUMN padding_length SET NOT NULL,
    ALTER COLUMN created_at SET NOT NULL,
    ALTER COLUMN updated_at SET NOT NULL;


-- Restore canonical primary key.

ALTER TABLE public.proc_document_sequences
    ADD CONSTRAINT proc_document_sequences_pkey
    PRIMARY KEY (document_type);


-- Seed document number sequences.

INSERT INTO public.proc_document_sequences
    (
        document_type,
        prefix,
        current_number,
        padding_length
    )
VALUES
    ('PR',   'PR',   0, 6),
    ('RFI',  'RFI',  0, 6),
    ('RFQ',  'RFQ',  0, 6),
    ('RFP',  'RFP',  0, 6),
    ('QT',   'QT',   0, 6),
    ('NEG',  'NEG',  0, 6),
    ('PO',   'PO',   0, 6),
    ('SA',   'SA',   0, 6),
    ('GRN',  'GRN',  0, 6),
    ('PINV', 'PINV', 0, 6)
ON CONFLICT (document_type)
DO UPDATE SET
    prefix = EXCLUDED.prefix,
    padding_length = EXCLUDED.padding_length,
    updated_at = NOW();


-- ============================================================
-- 3. PURCHASE REQUISITION
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_purchase_requisitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_no TEXT NOT NULL UNIQUE,
    document_date DATE NOT NULL DEFAULT CURRENT_DATE,

    status public.proc_document_status
        NOT NULL DEFAULT 'DRAFT',

    title TEXT,
    description TEXT,

    requested_by UUID,
    requested_by_name TEXT,

    department_id UUID,
    department_name TEXT,

    branch_id UUID,
    branch_name TEXT,

    warehouse_id UUID,
    warehouse_name TEXT,

    budget_type TEXT,

    currency_code TEXT NOT NULL DEFAULT 'INR',
    exchange_rate NUMERIC(18,8) NOT NULL DEFAULT 1,

    billing_address TEXT,
    shipping_address TEXT,

    required_date DATE,

    approval_status TEXT
        NOT NULL DEFAULT 'PENDING',

    approved_by UUID,
    approved_at TIMESTAMPTZ,

    rejection_reason TEXT,

    remarks TEXT,

    created_by UUID,
    updated_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_pr_exchange_rate_positive
        CHECK (exchange_rate > 0)
);


CREATE INDEX IF NOT EXISTS idx_proc_pr_status
    ON public.proc_purchase_requisitions(status);

CREATE INDEX IF NOT EXISTS idx_proc_pr_requested_by
    ON public.proc_purchase_requisitions(requested_by);

CREATE INDEX IF NOT EXISTS idx_proc_pr_document_date
    ON public.proc_purchase_requisitions(document_date);


-- ============================================================
-- 4. PURCHASE REQUISITION LINES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_purchase_requisition_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    purchase_requisition_id UUID NOT NULL
        REFERENCES public.proc_purchase_requisitions(id)
        ON DELETE CASCADE,

    line_no INTEGER NOT NULL,

    item_id UUID,
    item_code TEXT,
    item_name TEXT,

    item_category_id UUID,
    item_category_name TEXT,

    description TEXT,

    requested_quantity NUMERIC(18,6) NOT NULL,

    uom_id UUID,
    uom_code TEXT,

    required_delivery_date DATE,

    minimum_price NUMERIC(18,4),
    maximum_price NUMERIC(18,4),

    currency_code TEXT NOT NULL DEFAULT 'INR',
    exchange_rate NUMERIC(18,8) NOT NULL DEFAULT 1,

    estimated_min_value NUMERIC(18,4),
    estimated_max_value NUMERIC(18,4),

    warehouse_id UUID,
    warehouse_name TEXT,

    cost_center_id UUID,
    cost_center_name TEXT,

    profit_center_id UUID,
    profit_center_name TEXT,

    remarks TEXT,

    -- Running procurement quantities
    rfp_quantity NUMERIC(18,6) NOT NULL DEFAULT 0,
    negotiation_quantity NUMERIC(18,6) NOT NULL DEFAULT 0,
    po_quantity NUMERIC(18,6) NOT NULL DEFAULT 0,
    grn_quantity NUMERIC(18,6) NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_pr_line_quantity_positive
        CHECK (requested_quantity > 0),

    CONSTRAINT proc_pr_line_min_price_positive
        CHECK (
            minimum_price IS NULL
            OR minimum_price >= 0
        ),

    CONSTRAINT proc_pr_line_max_price_positive
        CHECK (
            maximum_price IS NULL
            OR maximum_price >= 0
        ),

    CONSTRAINT proc_pr_line_price_range
        CHECK (
            minimum_price IS NULL
            OR maximum_price IS NULL
            OR maximum_price >= minimum_price
        ),

    CONSTRAINT proc_pr_line_quantities_non_negative
        CHECK (
            rfp_quantity >= 0
            AND negotiation_quantity >= 0
            AND po_quantity >= 0
            AND grn_quantity >= 0
        ),

    UNIQUE (
        purchase_requisition_id,
        line_no
    )
);


CREATE INDEX IF NOT EXISTS idx_proc_pr_lines_pr
    ON public.proc_purchase_requisition_lines(purchase_requisition_id);

CREATE INDEX IF NOT EXISTS idx_proc_pr_lines_item
    ON public.proc_purchase_requisition_lines(item_id);


-- ============================================================
-- 5. RFX HEADER
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_rfx (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_no TEXT NOT NULL UNIQUE,
    document_date DATE NOT NULL DEFAULT CURRENT_DATE,

    rfx_type public.proc_rfx_type NOT NULL,

    status public.proc_document_status
        NOT NULL DEFAULT 'DRAFT',

    purchase_requisition_id UUID
        REFERENCES public.proc_purchase_requisitions(id)
        ON DELETE SET NULL,

    title TEXT,
    description TEXT,

    submission_deadline TIMESTAMPTZ,

    currency_code TEXT NOT NULL DEFAULT 'INR',
    exchange_rate NUMERIC(18,8) NOT NULL DEFAULT 1,

    billing_address TEXT NOT NULL,
    shipping_address TEXT NOT NULL,

    internal_notes TEXT,

    created_by UUID,
    updated_by UUID,

    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_rfx_exchange_rate_positive
        CHECK (exchange_rate > 0)
);


CREATE INDEX IF NOT EXISTS idx_proc_rfx_pr
    ON public.proc_rfx(purchase_requisition_id);

CREATE INDEX IF NOT EXISTS idx_proc_rfx_status
    ON public.proc_rfx(status);

CREATE INDEX IF NOT EXISTS idx_proc_rfx_type
    ON public.proc_rfx(rfx_type);


-- ============================================================
-- 6. RFX LINES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_rfx_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    rfx_id UUID NOT NULL
        REFERENCES public.proc_rfx(id)
        ON DELETE CASCADE,

    pr_line_id UUID
        REFERENCES public.proc_purchase_requisition_lines(id)
        ON DELETE SET NULL,

    line_no INTEGER NOT NULL,

    item_id UUID,
    item_code TEXT,
    item_name TEXT,

    requested_quantity NUMERIC(18,6) NOT NULL,

    uom_code TEXT,

    required_delivery_date DATE,

    minimum_price NUMERIC(18,4),
    maximum_price NUMERIC(18,4),

    currency_code TEXT NOT NULL DEFAULT 'INR',
    exchange_rate NUMERIC(18,8) NOT NULL DEFAULT 1,

    remarks TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_rfx_line_quantity_positive
        CHECK (requested_quantity > 0),

    UNIQUE (rfx_id, line_no)
);


CREATE INDEX IF NOT EXISTS idx_proc_rfx_lines_rfx
    ON public.proc_rfx_lines(rfx_id);

CREATE INDEX IF NOT EXISTS idx_proc_rfx_lines_pr_line
    ON public.proc_rfx_lines(pr_line_id);


-- ============================================================
-- 7. RFX VENDORS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_rfx_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    rfx_id UUID NOT NULL
        REFERENCES public.proc_rfx(id)
        ON DELETE CASCADE,

    vendor_id UUID,
    vendor_code TEXT,
    vendor_name TEXT,

    vendor_email TEXT,

    status public.proc_vendor_response_status
        NOT NULL DEFAULT 'INVITED',

    invited_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    responded_at TIMESTAMPTZ,

    selected BOOLEAN NOT NULL DEFAULT FALSE,
    approved BOOLEAN NOT NULL DEFAULT FALSE,

    rejection_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (rfx_id, vendor_id)
);


CREATE INDEX IF NOT EXISTS idx_proc_rfx_vendors_rfx
    ON public.proc_rfx_vendors(rfx_id);

CREATE INDEX IF NOT EXISTS idx_proc_rfx_vendors_vendor
    ON public.proc_rfx_vendors(vendor_id);


-- ============================================================
-- 8. RFX VENDOR ITEM ALLOCATION
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_rfx_vendor_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    rfx_vendor_id UUID NOT NULL
        REFERENCES public.proc_rfx_vendors(id)
        ON DELETE CASCADE,

    rfx_line_id UUID NOT NULL
        REFERENCES public.proc_rfx_lines(id)
        ON DELETE CASCADE,

    allocated_quantity NUMERIC(18,6) NOT NULL,

    selected BOOLEAN NOT NULL DEFAULT FALSE,
    approved BOOLEAN NOT NULL DEFAULT FALSE,

    rejected BOOLEAN NOT NULL DEFAULT FALSE,

    rejection_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_rfx_vendor_item_qty_positive
        CHECK (allocated_quantity > 0),

    UNIQUE (rfx_vendor_id, rfx_line_id)
);


-- ============================================================
-- 9. RFX QUESTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_rfx_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    rfx_id UUID NOT NULL
        REFERENCES public.proc_rfx(id)
        ON DELETE CASCADE,

    question_no INTEGER NOT NULL,

    question TEXT NOT NULL,

    question_type public.proc_question_type NOT NULL,

    options JSONB,

    is_required BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (rfx_id, question_no)
);


-- ============================================================
-- 10. VENDOR QUOTATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_vendor_quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_no TEXT NOT NULL UNIQUE,
    document_date DATE NOT NULL DEFAULT CURRENT_DATE,

    rfx_id UUID NOT NULL
        REFERENCES public.proc_rfx(id)
        ON DELETE RESTRICT,

    rfx_vendor_id UUID
        REFERENCES public.proc_rfx_vendors(id)
        ON DELETE SET NULL,

    vendor_id UUID,
    vendor_code TEXT,
    vendor_name TEXT,

    status public.proc_document_status
        NOT NULL DEFAULT 'DRAFT',

    currency_code TEXT NOT NULL DEFAULT 'INR',
    exchange_rate NUMERIC(18,8) NOT NULL DEFAULT 1,

    quotation_valid_until DATE,

    subtotal NUMERIC(18,4) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(18,4) NOT NULL DEFAULT 0,
    additional_charges NUMERIC(18,4) NOT NULL DEFAULT 0,
    total_amount NUMERIC(18,4) NOT NULL DEFAULT 0,

    vendor_remarks TEXT,

    submitted_at TIMESTAMPTZ,

    approved_by UUID,
    approved_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_quote_exchange_rate_positive
        CHECK (exchange_rate > 0)
);


CREATE INDEX IF NOT EXISTS idx_proc_vendor_quotes_rfx
    ON public.proc_vendor_quotes(rfx_id);

CREATE INDEX IF NOT EXISTS idx_proc_vendor_quotes_vendor
    ON public.proc_vendor_quotes(vendor_id);


-- ============================================================
-- 11. VENDOR QUOTATION LINES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_vendor_quote_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    vendor_quote_id UUID NOT NULL
        REFERENCES public.proc_vendor_quotes(id)
        ON DELETE CASCADE,

    rfx_line_id UUID
        REFERENCES public.proc_rfx_lines(id)
        ON DELETE SET NULL,

    line_no INTEGER NOT NULL,

    item_id UUID,
    item_code TEXT,
    item_name TEXT,

    quoted_quantity NUMERIC(18,6) NOT NULL,

    unit_price NUMERIC(18,4) NOT NULL,

    tax_rate NUMERIC(8,4) DEFAULT 0,
    tax_amount NUMERIC(18,4) DEFAULT 0,

    additional_charges NUMERIC(18,4) DEFAULT 0,

    line_total NUMERIC(18,4) NOT NULL DEFAULT 0,

    currency_code TEXT NOT NULL DEFAULT 'INR',
    exchange_rate NUMERIC(18,8) NOT NULL DEFAULT 1,

    delivery_date DATE,

    status TEXT NOT NULL DEFAULT 'PENDING',

    rejection_reason TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_quote_line_qty_positive
        CHECK (quoted_quantity > 0),

    CONSTRAINT proc_quote_line_price_non_negative
        CHECK (unit_price >= 0),

    UNIQUE (vendor_quote_id, line_no)
);


CREATE INDEX IF NOT EXISTS idx_proc_quote_lines_quote
    ON public.proc_vendor_quote_lines(vendor_quote_id);


-- ============================================================
-- 12. QUOTATION ADDITIONAL CHARGES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_vendor_quote_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    vendor_quote_id UUID NOT NULL
        REFERENCES public.proc_vendor_quotes(id)
        ON DELETE CASCADE,

    charge_name TEXT NOT NULL,

    amount NUMERIC(18,4) NOT NULL,

    currency_code TEXT NOT NULL DEFAULT 'INR',

    remarks TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_quote_charge_non_negative
        CHECK (amount >= 0)
);


-- ============================================================
-- 13. NEGOTIATION
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_negotiations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_no TEXT NOT NULL UNIQUE,
    document_date DATE NOT NULL DEFAULT CURRENT_DATE,

    rfx_id UUID
        REFERENCES public.proc_rfx(id)
        ON DELETE RESTRICT,

    vendor_quote_id UUID
        REFERENCES public.proc_vendor_quotes(id)
        ON DELETE RESTRICT,

    vendor_id UUID,
    vendor_code TEXT,
    vendor_name TEXT,

    status public.proc_negotiation_status
        NOT NULL DEFAULT 'OPEN',

    currency_code TEXT NOT NULL DEFAULT 'INR',
    exchange_rate NUMERIC(18,8) NOT NULL DEFAULT 1,

    created_by UUID,

    finalized_by UUID,
    finalized_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 14. NEGOTIATION ITEMS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_negotiation_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    negotiation_id UUID NOT NULL
        REFERENCES public.proc_negotiations(id)
        ON DELETE CASCADE,

    rfx_line_id UUID
        REFERENCES public.proc_rfx_lines(id)
        ON DELETE SET NULL,

    quote_line_id UUID
        REFERENCES public.proc_vendor_quote_lines(id)
        ON DELETE SET NULL,

    item_id UUID,
    item_code TEXT,
    item_name TEXT,

    negotiated_quantity NUMERIC(18,6) NOT NULL,

    finalized_quantity NUMERIC(18,6) NOT NULL DEFAULT 0,

    offered_price NUMERIC(18,4),
    finalized_price NUMERIC(18,4),

    currency_code TEXT NOT NULL DEFAULT 'INR',
    exchange_rate NUMERIC(18,8) NOT NULL DEFAULT 1,

    status TEXT NOT NULL DEFAULT 'OPEN',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_neg_item_qty_positive
        CHECK (negotiated_quantity > 0),

    CONSTRAINT proc_neg_final_qty_non_negative
        CHECK (finalized_quantity >= 0)
);


-- ============================================================
-- 15. NEGOTIATION HISTORY
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_negotiation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    negotiation_item_id UUID NOT NULL
        REFERENCES public.proc_negotiation_items(id)
        ON DELETE CASCADE,

    round_no INTEGER NOT NULL,

    actor_type TEXT NOT NULL,

    actor_id UUID,

    offered_quantity NUMERIC(18,6),
    offered_price NUMERIC(18,4),

    counter_quantity NUMERIC(18,6),
    counter_price NUMERIC(18,4),

    remarks TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_proc_neg_history_item
    ON public.proc_negotiation_history(negotiation_item_id);


-- ============================================================
-- 16. PURCHASE ORDER
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_no TEXT NOT NULL UNIQUE,
    document_date DATE NOT NULL DEFAULT CURRENT_DATE,

    status public.proc_document_status
        NOT NULL DEFAULT 'DRAFT',

    purchase_requisition_id UUID
        REFERENCES public.proc_purchase_requisitions(id)
        ON DELETE SET NULL,

    rfx_id UUID
        REFERENCES public.proc_rfx(id)
        ON DELETE SET NULL,

    negotiation_id UUID
        REFERENCES public.proc_negotiations(id)
        ON DELETE SET NULL,

    vendor_id UUID,
    vendor_code TEXT,
    vendor_name TEXT,

    currency_code TEXT NOT NULL DEFAULT 'INR',
    exchange_rate NUMERIC(18,8) NOT NULL DEFAULT 1,

    billing_address TEXT,
    shipping_address TEXT,

    payment_terms TEXT,

    subtotal NUMERIC(18,4) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(18,4) NOT NULL DEFAULT 0,
    additional_charges NUMERIC(18,4) NOT NULL DEFAULT 0,
    total_amount NUMERIC(18,4) NOT NULL DEFAULT 0,

    advance_percentage NUMERIC(8,4) DEFAULT 0,
    advance_amount NUMERIC(18,4) DEFAULT 0,

    advance_utr_number TEXT,
    advance_payment_date DATE,
    advance_remarks TEXT,
    advance_attachment_url TEXT,

    cost_center_id UUID,
    cost_center_name TEXT,

    profit_center_id UUID,
    profit_center_name TEXT,

    requested_delivery_date DATE,

    approved_by UUID,
    approved_at TIMESTAMPTZ,

    created_by UUID,
    updated_by UUID,

    remarks TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_po_exchange_rate_positive
        CHECK (exchange_rate > 0),

    CONSTRAINT proc_po_advance_percentage_valid
        CHECK (
            advance_percentage IS NULL
            OR (
                advance_percentage >= 0
                AND advance_percentage <= 100
            )
        ),

    CONSTRAINT proc_po_advance_amount_non_negative
        CHECK (
            advance_amount IS NULL
            OR advance_amount >= 0
        )
);


CREATE INDEX IF NOT EXISTS idx_proc_po_vendor
    ON public.proc_purchase_orders(vendor_id);

CREATE INDEX IF NOT EXISTS idx_proc_po_status
    ON public.proc_purchase_orders(status);


-- ============================================================
-- 17. PURCHASE ORDER LINES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_purchase_order_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    purchase_order_id UUID NOT NULL
        REFERENCES public.proc_purchase_orders(id)
        ON DELETE CASCADE,

    negotiation_item_id UUID
        REFERENCES public.proc_negotiation_items(id)
        ON DELETE SET NULL,

    pr_line_id UUID
        REFERENCES public.proc_purchase_requisition_lines(id)
        ON DELETE SET NULL,

    line_no INTEGER NOT NULL,

    item_id UUID,
    item_code TEXT,
    item_name TEXT,

    ordered_quantity NUMERIC(18,6) NOT NULL,

    unit_price NUMERIC(18,4) NOT NULL,

    tax_rate NUMERIC(8,4) DEFAULT 0,
    tax_amount NUMERIC(18,4) DEFAULT 0,

    additional_charges NUMERIC(18,4) DEFAULT 0,

    line_total NUMERIC(18,4) NOT NULL DEFAULT 0,

    delivered_quantity NUMERIC(18,6) NOT NULL DEFAULT 0,
    grn_quantity NUMERIC(18,6) NOT NULL DEFAULT 0,

    pending_quantity NUMERIC(18,6)
        GENERATED ALWAYS AS (
            ordered_quantity - grn_quantity
        ) STORED,

    currency_code TEXT NOT NULL DEFAULT 'INR',
    exchange_rate NUMERIC(18,8) NOT NULL DEFAULT 1,

    required_delivery_date DATE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_po_line_qty_positive
        CHECK (ordered_quantity > 0),

    CONSTRAINT proc_po_line_price_non_negative
        CHECK (unit_price >= 0),

    CONSTRAINT proc_po_line_grn_non_negative
        CHECK (grn_quantity >= 0),

    UNIQUE (purchase_order_id, line_no)
);


CREATE INDEX IF NOT EXISTS idx_proc_po_lines_po
    ON public.proc_purchase_order_lines(purchase_order_id);

CREATE INDEX IF NOT EXISTS idx_proc_po_lines_pr
    ON public.proc_purchase_order_lines(pr_line_id);

CREATE INDEX IF NOT EXISTS idx_proc_po_lines_negotiation
    ON public.proc_purchase_order_lines(negotiation_item_id);


-- ============================================================
-- 18. PO PAYMENT TERMS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_po_payment_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    purchase_order_id UUID NOT NULL
        REFERENCES public.proc_purchase_orders(id)
        ON DELETE CASCADE,

    sequence_no INTEGER NOT NULL,

    percentage NUMERIC(8,4) NOT NULL,

    amount NUMERIC(18,4),

    milestone TEXT,

    due_days INTEGER,

    remarks TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_po_payment_term_percentage_valid
        CHECK (
            percentage >= 0
            AND percentage <= 100
        ),

    UNIQUE (purchase_order_id, sequence_no)
);


-- ============================================================
-- 19. SHIPPING ALERT
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_shipping_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_no TEXT NOT NULL UNIQUE,
    document_date DATE NOT NULL DEFAULT CURRENT_DATE,

    purchase_order_id UUID NOT NULL
        REFERENCES public.proc_purchase_orders(id)
        ON DELETE RESTRICT,

    status public.proc_logistics_status
        NOT NULL DEFAULT 'DRAFT',

    mode_of_transport TEXT,

    shipment_type TEXT,

    part_load BOOLEAN NOT NULL DEFAULT FALSE,

    consignment_terms TEXT,

    incoterms TEXT,

    currency_code TEXT NOT NULL DEFAULT 'INR',
    exchange_rate NUMERIC(18,8) NOT NULL DEFAULT 1,

    shipment_value NUMERIC(18,4),

    discount_amount NUMERIC(18,4) DEFAULT 0,
    additional_charges NUMERIC(18,4) DEFAULT 0,

    expected_arrival_date DATE,

    created_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 20. SHIPPING ALERT DOCUMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_shipping_alert_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    shipping_alert_id UUID NOT NULL
        REFERENCES public.proc_shipping_alerts(id)
        ON DELETE CASCADE,

    document_name TEXT NOT NULL,

    document_url TEXT NOT NULL,

    file_size_bytes BIGINT,

    mime_type TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_shipping_document_size
        CHECK (
            file_size_bytes IS NULL
            OR file_size_bytes <= 5242880
        )
);


-- ============================================================
-- 21. IMPORT CONTAINERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_import_containers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    shipping_alert_id UUID NOT NULL
        REFERENCES public.proc_shipping_alerts(id)
        ON DELETE CASCADE,

    container_number TEXT,
    seal_number TEXT,

    dimensions TEXT,

    weight NUMERIC(18,6),
    weight_uom TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 22. GRN
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_goods_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_no TEXT NOT NULL UNIQUE,

    purchase_order_id UUID NOT NULL
        REFERENCES public.proc_purchase_orders(id)
        ON DELETE RESTRICT,

    shipping_alert_id UUID
        REFERENCES public.proc_shipping_alerts(id)
        ON DELETE SET NULL,

    gate_inward_date DATE,

    grn_date DATE NOT NULL DEFAULT CURRENT_DATE,

    status public.proc_grn_status
        NOT NULL DEFAULT 'DRAFT',

    warehouse_id UUID,
    warehouse_name TEXT,

    acknowledged_at TIMESTAMPTZ,
    acknowledged_by UUID,

    created_by UUID,

    remarks TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_proc_grn_po
    ON public.proc_goods_receipts(purchase_order_id);

CREATE INDEX IF NOT EXISTS idx_proc_grn_status
    ON public.proc_goods_receipts(status);


-- ============================================================
-- 23. GRN LINES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_goods_receipt_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    goods_receipt_id UUID NOT NULL
        REFERENCES public.proc_goods_receipts(id)
        ON DELETE CASCADE,

    purchase_order_line_id UUID NOT NULL
        REFERENCES public.proc_purchase_order_lines(id)
        ON DELETE RESTRICT,

    line_no INTEGER NOT NULL,

    item_id UUID,
    item_code TEXT,
    item_name TEXT,

    ordered_quantity NUMERIC(18,6) NOT NULL,

    received_quantity NUMERIC(18,6) NOT NULL DEFAULT 0,

    accepted_quantity NUMERIC(18,6) NOT NULL DEFAULT 0,

    rejected_quantity NUMERIC(18,6) NOT NULL DEFAULT 0,

    base_item_value NUMERIC(18,4) NOT NULL DEFAULT 0,

    freight_amount NUMERIC(18,4) NOT NULL DEFAULT 0,
    insurance_amount NUMERIC(18,4) NOT NULL DEFAULT 0,
    customs_duty_amount NUMERIC(18,4) NOT NULL DEFAULT 0,
    forwarding_amount NUMERIC(18,4) NOT NULL DEFAULT 0,
    handling_amount NUMERIC(18,4) NOT NULL DEFAULT 0,
    other_landed_cost NUMERIC(18,4) NOT NULL DEFAULT 0,

    landed_cost NUMERIC(18,4)
        GENERATED ALWAYS AS (
            base_item_value
            + freight_amount
            + insurance_amount
            + customs_duty_amount
            + forwarding_amount
            + handling_amount
            + other_landed_cost
        ) STORED,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_grn_line_received_non_negative
        CHECK (received_quantity >= 0),

    CONSTRAINT proc_grn_line_accepted_non_negative
        CHECK (accepted_quantity >= 0),

    CONSTRAINT proc_grn_line_rejected_non_negative
        CHECK (rejected_quantity >= 0),

    UNIQUE (goods_receipt_id, line_no)
);


-- ============================================================
-- 24. GRN SERIAL NUMBERS
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_grn_serial_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    goods_receipt_line_id UUID NOT NULL
        REFERENCES public.proc_goods_receipt_lines(id)
        ON DELETE CASCADE,

    serial_number TEXT NOT NULL UNIQUE,

    batch_number TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 25. SUPPLIER INVOICE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_supplier_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    document_no TEXT NOT NULL UNIQUE,

    supplier_invoice_number TEXT NOT NULL,

    supplier_invoice_date DATE NOT NULL,

    purchase_order_id UUID
        REFERENCES public.proc_purchase_orders(id)
        ON DELETE SET NULL,

    status public.proc_document_status
        NOT NULL DEFAULT 'DRAFT',

    vendor_id UUID,
    vendor_code TEXT,
    vendor_name TEXT,

    currency_code TEXT NOT NULL DEFAULT 'INR',
    exchange_rate NUMERIC(18,8) NOT NULL DEFAULT 1,

    subtotal NUMERIC(18,4) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(18,4) NOT NULL DEFAULT 0,
    additional_charges NUMERIC(18,4) NOT NULL DEFAULT 0,
    total_amount NUMERIC(18,4) NOT NULL DEFAULT 0,

    advance_adjusted NUMERIC(18,4) NOT NULL DEFAULT 0,

    balance_payable NUMERIC(18,4)
        GENERATED ALWAYS AS (
            total_amount - advance_adjusted
        ) STORED,

    created_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_supplier_invoice_exchange_rate_positive
        CHECK (exchange_rate > 0),

    CONSTRAINT proc_supplier_invoice_unique_vendor_invoice
        UNIQUE (vendor_id, supplier_invoice_number)
);


-- ============================================================
-- 26. SUPPLIER INVOICE LINES
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_supplier_invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    supplier_invoice_id UUID NOT NULL
        REFERENCES public.proc_supplier_invoices(id)
        ON DELETE CASCADE,

    purchase_order_line_id UUID
        REFERENCES public.proc_purchase_order_lines(id)
        ON DELETE SET NULL,

    goods_receipt_line_id UUID
        REFERENCES public.proc_goods_receipt_lines(id)
        ON DELETE SET NULL,

    line_no INTEGER NOT NULL,

    item_id UUID,
    item_code TEXT,
    item_name TEXT,

    quantity NUMERIC(18,6) NOT NULL,

    unit_price NUMERIC(18,4) NOT NULL,

    tax_amount NUMERIC(18,4) DEFAULT 0,

    line_total NUMERIC(18,4) NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (supplier_invoice_id, line_no)
);


-- ============================================================
-- 27. THREE-WAY MATCH
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_three_way_match_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    supplier_invoice_id UUID NOT NULL
        REFERENCES public.proc_supplier_invoices(id)
        ON DELETE CASCADE,

    purchase_order_id UUID
        REFERENCES public.proc_purchase_orders(id)
        ON DELETE SET NULL,

    goods_receipt_id UUID
        REFERENCES public.proc_goods_receipts(id)
        ON DELETE SET NULL,

    quantity_match BOOLEAN NOT NULL DEFAULT FALSE,
    price_match BOOLEAN NOT NULL DEFAULT FALSE,
    tax_match BOOLEAN NOT NULL DEFAULT FALSE,

    overall_match BOOLEAN NOT NULL DEFAULT FALSE,

    variance_amount NUMERIC(18,4) DEFAULT 0,

    remarks TEXT,

    checked_by UUID,
    checked_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- 28. VENDOR ADVANCE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_vendor_advances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    purchase_order_id UUID NOT NULL
        REFERENCES public.proc_purchase_orders(id)
        ON DELETE RESTRICT,

    vendor_id UUID,

    advance_percentage NUMERIC(8,4) NOT NULL,

    advance_amount NUMERIC(18,4) NOT NULL,

    utr_number TEXT,

    payment_date DATE,

    remarks TEXT,

    attachment_url TEXT,

    adjusted_amount NUMERIC(18,4) NOT NULL DEFAULT 0,

    balance_amount NUMERIC(18,4)
        GENERATED ALWAYS AS (
            advance_amount - adjusted_amount
        ) STORED,

    created_by UUID,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT proc_vendor_advance_percentage
        CHECK (
            advance_percentage >= 0
            AND advance_percentage <= 100
        ),

    CONSTRAINT proc_vendor_advance_amount
        CHECK (advance_amount >= 0),

    CONSTRAINT proc_vendor_advance_adjusted
        CHECK (adjusted_amount >= 0)
);


-- ============================================================
-- 29. PROCUREMENT DOCUMENT AUDIT LOG
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proc_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    entity_type TEXT NOT NULL,

    entity_id UUID NOT NULL,

    action TEXT NOT NULL,

    old_values JSONB,

    new_values JSONB,

    performed_by UUID,

    performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_proc_audit_entity
    ON public.proc_audit_log(entity_type, entity_id);


-- ============================================================
-- 30. QUANTITY TRACKING VIEW
-- ============================================================
-- Provides the required:
--
-- PR Qty
-- -> RFP Qty
-- -> Negotiation Qty
-- -> PO Qty
-- -> GRN Qty
-- -> Pending Qty
--
-- The ELAN requirement explicitly calls for this running ledger.
-- ============================================================

CREATE OR REPLACE VIEW public.proc_pr_quantity_tracking AS
SELECT
    pr.id AS purchase_requisition_id,
    pr.document_no AS pr_document_no,

    prl.id AS pr_line_id,
    prl.line_no,

    prl.item_id,
    prl.item_code,
    prl.item_name,

    prl.requested_quantity AS pr_quantity,

    COALESCE(prl.rfp_quantity, 0) AS rfp_quantity,

    COALESCE(prl.negotiation_quantity, 0)
        AS negotiation_quantity,

    COALESCE(prl.po_quantity, 0)
        AS po_quantity,

    COALESCE(prl.grn_quantity, 0)
        AS grn_quantity,

    GREATEST(
        prl.requested_quantity
        - COALESCE(prl.rfp_quantity, 0),
        0
    ) AS pending_rfp_quantity,

    GREATEST(
        prl.requested_quantity
        - COALESCE(prl.po_quantity, 0),
        0
    ) AS pending_po_quantity,

    GREATEST(
        prl.requested_quantity
        - COALESCE(prl.grn_quantity, 0),
        0
    ) AS pending_grn_quantity

FROM public.proc_purchase_requisitions pr

JOIN public.proc_purchase_requisition_lines prl
    ON prl.purchase_requisition_id = pr.id;


-- ============================================================
-- 31. UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION public.proc_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


-- ============================================================
-- 32. UPDATED_AT TRIGGERS
-- ============================================================

DROP TRIGGER IF EXISTS trg_proc_pr_updated_at
    ON public.proc_purchase_requisitions;

CREATE TRIGGER trg_proc_pr_updated_at
BEFORE UPDATE ON public.proc_purchase_requisitions
FOR EACH ROW
EXECUTE FUNCTION public.proc_set_updated_at();


DROP TRIGGER IF EXISTS trg_proc_pr_lines_updated_at
    ON public.proc_purchase_requisition_lines;

CREATE TRIGGER trg_proc_pr_lines_updated_at
BEFORE UPDATE ON public.proc_purchase_requisition_lines
FOR EACH ROW
EXECUTE FUNCTION public.proc_set_updated_at();


DROP TRIGGER IF EXISTS trg_proc_rfx_updated_at
    ON public.proc_rfx;

CREATE TRIGGER trg_proc_rfx_updated_at
BEFORE UPDATE ON public.proc_rfx
FOR EACH ROW
EXECUTE FUNCTION public.proc_set_updated_at();


DROP TRIGGER IF EXISTS trg_proc_rfx_vendors_updated_at
    ON public.proc_rfx_vendors;

CREATE TRIGGER trg_proc_rfx_vendors_updated_at
BEFORE UPDATE ON public.proc_rfx_vendors
FOR EACH ROW
EXECUTE FUNCTION public.proc_set_updated_at();


DROP TRIGGER IF EXISTS trg_proc_vendor_quotes_updated_at
    ON public.proc_vendor_quotes;

CREATE TRIGGER trg_proc_vendor_quotes_updated_at
BEFORE UPDATE ON public.proc_vendor_quotes
FOR EACH ROW
EXECUTE FUNCTION public.proc_set_updated_at();


DROP TRIGGER IF EXISTS trg_proc_negotiations_updated_at
    ON public.proc_negotiations;

CREATE TRIGGER trg_proc_negotiations_updated_at
BEFORE UPDATE ON public.proc_negotiations
FOR EACH ROW
EXECUTE FUNCTION public.proc_set_updated_at();


DROP TRIGGER IF EXISTS trg_proc_negotiation_items_updated_at
    ON public.proc_negotiation_items;

CREATE TRIGGER trg_proc_negotiation_items_updated_at
BEFORE UPDATE ON public.proc_negotiation_items
FOR EACH ROW
EXECUTE FUNCTION public.proc_set_updated_at();


DROP TRIGGER IF EXISTS trg_proc_po_updated_at
    ON public.proc_purchase_orders;

CREATE TRIGGER trg_proc_po_updated_at
BEFORE UPDATE ON public.proc_purchase_orders
FOR EACH ROW
EXECUTE FUNCTION public.proc_set_updated_at();


DROP TRIGGER IF EXISTS trg_proc_shipping_alert_updated_at
    ON public.proc_shipping_alerts;

CREATE TRIGGER trg_proc_shipping_alert_updated_at
BEFORE UPDATE ON public.proc_shipping_alerts
FOR EACH ROW
EXECUTE FUNCTION public.proc_set_updated_at();


DROP TRIGGER IF EXISTS trg_proc_grn_updated_at
    ON public.proc_goods_receipts;

CREATE TRIGGER trg_proc_grn_updated_at
BEFORE UPDATE ON public.proc_goods_receipts
FOR EACH ROW
EXECUTE FUNCTION public.proc_set_updated_at();


DROP TRIGGER IF EXISTS trg_proc_supplier_invoice_updated_at
    ON public.proc_supplier_invoices;

CREATE TRIGGER trg_proc_supplier_invoice_updated_at
BEFORE UPDATE ON public.proc_supplier_invoices
FOR EACH ROW
EXECUTE FUNCTION public.proc_set_updated_at();


-- ============================================================
-- 33. ENABLE RLS
-- ============================================================

ALTER TABLE public.proc_document_sequences ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.proc_purchase_requisitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_purchase_requisition_lines ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.proc_rfx ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_rfx_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_rfx_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_rfx_vendor_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_rfx_questions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.proc_vendor_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_vendor_quote_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_vendor_quote_charges ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.proc_negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_negotiation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_negotiation_history ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.proc_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_purchase_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_po_payment_terms ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.proc_shipping_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_shipping_alert_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_import_containers ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.proc_goods_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_goods_receipt_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_grn_serial_numbers ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.proc_supplier_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_supplier_invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proc_three_way_match_results ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.proc_vendor_advances ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.proc_audit_log ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 34. DEVELOPMENT POLICIES
-- ============================================================
-- These are intentionally simple authenticated-user policies
-- for the initial development phase.
--
-- We will replace these with role/permission based policies
-- after the Procurement workflow is functional.
-- ============================================================

DO $$
DECLARE
    tbl TEXT;
BEGIN

    FOREACH tbl IN ARRAY ARRAY[
        'proc_document_sequences',
        'proc_purchase_requisitions',
        'proc_purchase_requisition_lines',
        'proc_rfx',
        'proc_rfx_lines',
        'proc_rfx_vendors',
        'proc_rfx_vendor_items',
        'proc_rfx_questions',
        'proc_vendor_quotes',
        'proc_vendor_quote_lines',
        'proc_vendor_quote_charges',
        'proc_negotiations',
        'proc_negotiation_items',
        'proc_negotiation_history',
        'proc_purchase_orders',
        'proc_purchase_order_lines',
        'proc_po_payment_terms',
        'proc_shipping_alerts',
        'proc_shipping_alert_documents',
        'proc_import_containers',
        'proc_goods_receipts',
        'proc_goods_receipt_lines',
        'proc_grn_serial_numbers',
        'proc_supplier_invoices',
        'proc_supplier_invoice_lines',
        'proc_three_way_match_results',
        'proc_vendor_advances',
        'proc_audit_log'
    ]
    LOOP

        EXECUTE format(
            'DROP POLICY IF EXISTS "proc_authenticated_all" ON public.%I',
            tbl
        );

        EXECUTE format(
            'CREATE POLICY "proc_authenticated_all"
             ON public.%I
             FOR ALL
             TO authenticated
             USING (true)
             WITH CHECK (true)',
            tbl
        );

    END LOOP;

END $$;


COMMIT;