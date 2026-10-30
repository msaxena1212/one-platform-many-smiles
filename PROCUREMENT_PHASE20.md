# Procurement Phase 20 — Supplier Performance, Spend & Delivery Intelligence

## Objective
Extend the Phase 19 anomaly-control layer with a read-only supplier scorecard and spend intelligence layer. This phase focuses on supplier delivery, quality, commercial award performance, outstanding exposure and spend concentration.

## Delivered
- `procurement_supplier_performance(days, limit, concentration_threshold)` read-only RPC.
- Supplier scorecards with:
  - approved PO spend
  - PO count and average PO value
  - vendor quote count and award rate
  - GRN count
  - OTIF delivery rate
  - accepted-vs-ordered quantity quality rate
  - outstanding payable exposure
  - spend share / concentration flag
  - weighted performance score
- Portfolio KPIs for total approved spend, suppliers, approved POs, award rate, OTIF, quality acceptance and outstanding AP.
- Top supplier spend concentration view.
- Explainable methodology returned with the dashboard payload.
- Procurement Control Tower **Supplier Performance** tab.
- No transaction mutation, approval, posting or accounting changes.

## Scoring
Supplier performance score = OTIF 40% + quality acceptance 35% + quote award rate 25%.

## Concentration
A supplier is flagged when its share of approved PO spend reaches the configured concentration threshold. Default: 30%.

## Migration
```text
supabase/migrations/20260824110000_procurement_phase20_supplier_performance.sql
```

## Frontend service
```text
src/lib/procurement/supplierPerformance.ts
```

## Validation
```bash
npm run procurement:validate:phase20
```

Expected:
```text
PROCUREMENT_PHASE20_VALIDATION=PASSED
checks=19
```

## Local verification
```bash
npm install
npm run typecheck
npm run build
npm run procurement:validate:phase19
npm run procurement:validate:phase20
```

## Database verification
After applying migrations:
```sql
select public.procurement_supplier_performance(365, 25, 30);
```

## Important boundary
This phase is analytical only. It does not automatically block a vendor, change a PO, alter payment status, modify supplier master data, or post accounting entries. Scorecards are decision-support signals and should be reviewed alongside contracts, delivery records, quality records and approved procurement policy.

## Next phase
Phase 21 should focus on **Procurement Action Center & Continuous Monitoring**: turn the intelligence layers from Phases 17–20 into a prioritized work queue with accountable owners, due dates, acknowledgement, resolution evidence, recurring control checks and closure metrics—without bypassing the existing approval, audit and accounting controls.
