# Procurement Phase 7 — Production Release Hardening

## Objective

Make the Procurement + Finance lifecycle safe to deploy and rerun by hardening idempotency, line-level integrity, release readiness and schema smoke validation.

## Lifecycle covered

PR → Approval → RFX → Vendor Quote → PO → PO Approval → Shipment → Gate Inward → GRN → Landed Cost → AP Invoice → 3-Way Match → Purchase → Capitalization → GL → Reconciliation → Audit.

## Key hardening

- Repeated landed-cost allocation no longer double-counts purchase-line landed cost.
- Posted landed costs cannot be reallocated.
- GRN accepted + rejected quantity cannot exceed ordered quantity.
- GRN line totals are recalculated from accepted quantity × unit rate.
- AP invoice source lines cannot be duplicated for the same invoice.
- AP invoice source quantities cannot exceed accepted GRN quantities.
- Added `proc_release_readiness(uuid)` for production release checks.
- Added `proc_schema_smoke_check()` for deployment smoke testing.

## Validation

Run:

```sql
SELECT public.proc_schema_smoke_check();
```

Then execute `tests_procurement_phase7_validation.sql`.

A PO is release-ready only when the readiness function returns `ready = true` with zero issues.
