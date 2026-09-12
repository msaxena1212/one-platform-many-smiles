-- Phase 7 deployment smoke checks. Run after applying all procurement migrations.
DO $$
DECLARE
  v_tables TEXT[] := ARRAY[
    'proc_purchase_requests','proc_rfx','proc_vendor_quotes','proc_purchase_orders',
    'proc_shipments','proc_gate_inwards','proc_goods_receipts','proc_landed_costs',
    'proc_payable_invoices','proc_purchases','proc_three_way_matches',
    'proc_landed_cost_allocations','proc_audit_log'
  ];
  v_table TEXT;
BEGIN
  FOREACH v_table IN ARRAY v_tables LOOP
    IF to_regclass('public.' || v_table) IS NULL THEN
      RAISE EXCEPTION 'Missing procurement table: %', v_table;
    END IF;
  END LOOP;

  IF to_regprocedure('public.proc_run_three_way_match(uuid,numeric)') IS NULL THEN
    RAISE EXCEPTION 'Missing three-way match function';
  END IF;
  IF to_regprocedure('public.proc_allocate_landed_cost(uuid)') IS NULL THEN
    RAISE EXCEPTION 'Missing landed-cost allocation function';
  END IF;
  IF to_regprocedure('public.proc_release_readiness(uuid)') IS NULL THEN
    RAISE EXCEPTION 'Missing release-readiness function';
  END IF;
END $$;

SELECT 'proc_schema_smoke_check' AS check_name, public.proc_schema_smoke_check() AS result;
