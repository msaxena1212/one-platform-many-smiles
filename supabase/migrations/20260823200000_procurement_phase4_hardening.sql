-- Procurement Phase 4: operational + finance hardening.
-- Idempotent safeguards for line totals, receiving quantities and quote selection.

CREATE UNIQUE INDEX IF NOT EXISTS ux_proc_one_selected_quote_per_rfx
  ON public.proc_vendor_quotes (rfx_id)
  WHERE is_selected = true;

CREATE INDEX IF NOT EXISTS idx_proc_po_status_delivery
  ON public.proc_purchase_orders(status, expected_delivery_date);
CREATE INDEX IF NOT EXISTS idx_proc_shipments_status_eta
  ON public.proc_shipments(status, eta);
CREATE INDEX IF NOT EXISTS idx_proc_grn_status_posting
  ON public.proc_goods_receipts(status, posting_status);
CREATE INDEX IF NOT EXISTS idx_proc_invoice_status_due
  ON public.proc_payable_invoices(status, due_date, payment_status);
CREATE INDEX IF NOT EXISTS idx_proc_landed_cost_posting
  ON public.proc_landed_costs(posting_status, cost_type);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ck_proc_grn_qty_consistent') THEN
    ALTER TABLE public.proc_grn_lines
      ADD CONSTRAINT ck_proc_grn_qty_consistent
      CHECK (accepted_quantity >= 0 AND rejected_quantity >= 0 AND accepted_quantity + rejected_quantity <= ordered_quantity);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.proc_recalculate_po_total(p_po_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_total NUMERIC(18,2);
BEGIN
  SELECT COALESCE(SUM(line_total),0)::NUMERIC(18,2) INTO v_total
  FROM public.proc_po_lines WHERE purchase_order_id = p_po_id;
  UPDATE public.proc_purchase_orders
  SET subtotal = v_total, total_amount = v_total + tax_amount - discount_amount, updated_at = NOW()
  WHERE id = p_po_id;
  RETURN v_total;
END;
$$;

CREATE OR REPLACE FUNCTION public.proc_recalculate_grn_total(p_grn_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_total NUMERIC(18,2);
BEGIN
  SELECT COALESCE(SUM(line_total),0)::NUMERIC(18,2) INTO v_total
  FROM public.proc_grn_lines WHERE goods_receipt_id = p_grn_id;
  UPDATE public.proc_goods_receipts SET total_amount = v_total, updated_at = NOW() WHERE id = p_grn_id;
  RETURN v_total;
END;
$$;

CREATE OR REPLACE FUNCTION public.proc_recalculate_invoice_total(p_invoice_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_subtotal NUMERIC(18,2); v_tax NUMERIC(18,2); v_discount NUMERIC(18,2); v_total NUMERIC(18,2);
BEGIN
  SELECT COALESCE(SUM(line_total),0), COALESCE(SUM(tax_amount),0)
    INTO v_subtotal, v_tax
  FROM public.proc_payable_invoice_lines WHERE payable_invoice_id = p_invoice_id;
  SELECT COALESCE(discount_amount,0) INTO v_discount FROM public.proc_payable_invoices WHERE id = p_invoice_id;
  v_total := v_subtotal + v_tax - v_discount;
  UPDATE public.proc_payable_invoices
  SET subtotal = v_subtotal, tax_amount = v_tax, total_amount = v_total,
      outstanding_amount = GREATEST(v_total - paid_amount, 0), updated_at = NOW()
  WHERE id = p_invoice_id;
  RETURN v_total;
END;
$$;

CREATE OR REPLACE FUNCTION public.proc_recalculate_purchase_total(p_purchase_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_total NUMERIC(18,2);
BEGIN
  SELECT COALESCE(SUM(total_amount),0)::NUMERIC(18,2) INTO v_total
  FROM public.proc_purchase_lines WHERE purchase_id = p_purchase_id;
  UPDATE public.proc_purchases SET total_amount = v_total, updated_at = NOW() WHERE id = p_purchase_id;
  RETURN v_total;
END;
$$;

GRANT EXECUTE ON FUNCTION public.proc_recalculate_po_total(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.proc_recalculate_grn_total(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.proc_recalculate_invoice_total(UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.proc_recalculate_purchase_total(UUID) TO anon, authenticated, service_role;
