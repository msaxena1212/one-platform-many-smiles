-- Phase 5 validation queries. Run only against a non-production/test Supabase target.
-- 1) Verify new tables.
select to_regclass('public.proc_three_way_matches') as three_way_match_table,
       to_regclass('public.proc_landed_cost_allocations') as landed_cost_allocation_table;

-- 2) Verify lifecycle functions exist.
select proname
from pg_proc
where proname in ('proc_run_three_way_match','proc_allocate_landed_cost','proc_validate_lifecycle','proc_finalize_purchase')
order by proname;

-- 3) Inspect latest match outcomes.
select payable_invoice_id, purchase_order_id, goods_receipt_id, status,
       amount_variance, quantity_variance, details, matched_at
from public.proc_three_way_matches
order by matched_at desc
limit 20;

-- 4) Inspect landed-cost allocations.
select landed_cost_id, purchase_line_id, allocation_basis, allocation_ratio, allocated_amount
from public.proc_landed_cost_allocations
order by created_at desc
limit 20;
