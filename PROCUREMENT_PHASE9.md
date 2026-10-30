# Procurement Phase 9 — End-to-End UAT Automation

## Objective

Phase 9 adds a read-only UAT harness for the procurement lifecycle built across Phases 1–8. It evaluates an existing Purchase Order through the complete control chain without creating, updating, posting or deleting transactional data.

## Automated checks

For each PO, `proc_uat_validate_po(uuid)` evaluates:

1. Purchase Request approval
2. Selected vendor quote
3. Purchase Order approval
4. Posted GRN
5. AP invoice presence
6. Passed three-way match
7. Purchase record creation
8. PO reconciliation
9. Release readiness
10. Lifecycle readiness for capitalization
11. Procurement audit trail presence

The function returns individual test IDs, pass/fail state, details and the underlying reconciliation/release/lifecycle payloads.

## Dashboard

`proc_uat_dashboard(limit)` evaluates the latest non-cancelled/non-rejected POs and returns:

- number of POs checked
- passed POs
- failed POs
- overall status
- per-PO pass/fail summary

## SQL usage

```sql
SELECT public.proc_uat_validate_po('<PO UUID>');
SELECT public.proc_uat_dashboard(25);
```

## Frontend usage

`src/lib/procurement/uat.ts` exposes:

- `validateProcurementUat(poId)`
- `getProcurementUatDashboard(limit)`

## Deployment

Apply:

`supabase/migrations/20260824010000_procurement_phase9_uat_automation.sql`

Then run:

```bash
npm install
npm run procurement:validate:phase9
npm run typecheck
npm run build
```

## Important scope

This phase intentionally does **not** manufacture fake accounting transactions or mutate production procurement records. It validates real transaction chains already present in the database. A PO with missing downstream records should fail UAT rather than being silently repaired.
