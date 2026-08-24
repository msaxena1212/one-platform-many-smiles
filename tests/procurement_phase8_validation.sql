-- Procurement Phase 8 deployment verification.
-- Run after applying all Procurement migrations.

DO $$
DECLARE
  v_missing TEXT[] := ARRAY[]::TEXT[];
  v_table TEXT;
BEGIN
  FOREACH v_table IN ARRAY ARRAY[
    'proc_purchase_requests','proc_rfx','proc_vendor_quotes','proc_purchase_orders',
    'proc_shipments','proc_gate_inwards','proc_goods_receipts','proc_grn_lines',
    'proc_landed_costs','proc_landed_cost_allocations','proc_payable_invoices',
    'proc_payable_invoice_lines','proc_purchases','proc_purchase_lines',
    'proc_three_way_matches','proc_audit_log'
  ] LOOP
    IF to_regclass('public.' || v_table) IS NULL THEN
      v_missing := array_append(v_missing, v_table);
    END IF;
  END LOOP;

  IF cardinality(v_missing) > 0 THEN
    RAISE EXCEPTION 'Procurement schema verification failed. Missing: %', v_missing;
  END IF;
END $$;

SELECT public.proc_schema_smoke_check();
