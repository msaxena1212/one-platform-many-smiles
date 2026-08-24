# Procurement Phase 5 — End-to-End Transaction Orchestration

Phase 5 connects the operational lifecycle through server-side controls rather than treating each screen as an isolated CRUD action.

## Added
- `supabase/migrations/20260823210000_procurement_phase5_orchestration.sql`
- `src/lib/procurement/lifecycle.ts`
- GRN → AP invoice three-way match enforcement.
- Landed-cost allocation to purchase lines by VALUE, QUANTITY or EQUAL basis.
- PO lifecycle validation.
- Purchase finalization guard.
- Idempotent three-way-match audit record per AP invoice.
- Invoice-from-GRN helper that maps invoice lines back to GRN lines.
- Procurement UI lifecycle controls for validation, matching and purchase finalization.

## Transaction lifecycle

PR → approval → RFX → vendor quote → PO → approval → shipment/import → gate inward → GRN → GRN posting → landed-cost allocation/posting → AP invoice → 3-way match → AP posting → purchase finalization → CAPEX capitalization.

## 3-way match rules

An AP invoice linked to Procurement cannot post unless:
1. It references a Purchase Order.
2. It references a GRN belonging to that PO.
3. The invoice vendor matches the PO vendor.
4. Invoice subtotal is within the configured amount tolerance of the GRN amount.
5. Every invoice line maps to a GRN line.
6. Invoice quantities match accepted GRN quantities.

## Landed cost

Posted landed costs can be allocated to Purchase lines by VALUE, QUANTITY or EQUAL basis. The allocation is stored and rolled into `proc_purchase_lines.landed_cost_amount` and `total_amount`.

## Finalization

A Purchase can only be finalized when its GRN is posted, its linked AP invoice has a passed 3-way match, and all linked landed costs are posted.

## Accounting

The existing Finance accounting engine remains the single posting engine. Procurement does not create a parallel journal/voucher mechanism.
