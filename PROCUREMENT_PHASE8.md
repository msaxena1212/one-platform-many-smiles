# Procurement Phase 8 — Operational Controls & Production Monitoring

## Objective

Provide a read-only operational health layer on top of the Procurement + Finance lifecycle so production users can quickly identify blocked procurement documents, unposted accounting stages and failed three-way matches without changing transactional data.

## Lifecycle covered

PR → RFX → Vendor Quote → PO → Shipment → Gate Inward → GRN → Landed Cost → AP Invoice → 3-Way Match → Purchase → Capitalization → GL → Reconciliation → Audit.

## Delivered

- Added `proc_operational_health()` as a read-only operational health RPC.
- Added counts for open PR/RFX/quote/PO/shipment records.
- Added counts for unposted GRNs, landed costs and AP invoices.
- Added count of unfinalized purchases and failed three-way matches.
- Added an exception list for POs that still require approval, posted GRN or posted AP invoice.
- Added a `ready` signal that is false when failed three-way matches or unposted landed costs exist.
- Added authenticated execution permission.
- Kept Phase 7 release-readiness checks intact; Phase 8 is an operational monitoring layer, not a replacement for release readiness.

## Validation

Run:

```bash
npm run procurement:validate
```

Then, against the deployed Supabase project:

```sql
SELECT public.proc_schema_smoke_check();
SELECT public.proc_operational_health();
```

For an individual PO, continue using:

```sql
SELECT public.proc_release_readiness('<PO UUID>');
```

## Deployment order

1. Apply migrations through `20260823230000_procurement_phase7_release_hardening.sql`.
2. Apply `20260824000000_procurement_phase8_operational_controls.sql`.
3. Run schema smoke check.
4. Run procurement validation.
5. Run reconciliation and release-readiness checks on representative POs.
