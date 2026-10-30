# Procurement Phase 2 — Domain Services

This phase adds the application service layer on top of `20260823140000_procurement_core.sql`.

## Added
- `src/lib/procurement/types.ts` — Procurement domain types.
- `src/lib/procurement/supabase-procurement.ts` — CRUD and lifecycle queries.
- `src/lib/procurement/numbering.ts` — database-backed document numbering.
- `src/lib/procurement/conversions.ts` — PR → RFX and selected Quote → PO conversion.
- `src/lib/procurement/approvals.ts` — submit/approve/reject lifecycle transitions.
- `src/lib/procurement/postingService.ts` — GRN, AP invoice and landed-cost posting through the existing Finance accounting-event engine.
- `src/lib/procurement/capitalizationService.ts` — CAPEX purchase capitalization event and purchase status update.
- `src/lib/procurement/index.ts` — public service exports.

## Finance integration
Procurement uses the existing `createAccountingEvent` and `post_accounting_event_atomic` flow. It does not create a second voucher/journal engine.

## Important note
Asset creation itself remains owned by the existing Assets module. Phase 2 records the capitalization accounting event and marks the Procurement purchase as posted; the Phase 3/4 integration will connect this to the application's asset-creation workflow.
