# Procurement Phase 11 — Exception Resolution & Workflow Automation

## Objective
Phase 11 adds a controlled exception-management layer on top of the Phase 10 Command Center. It surfaces failed procurement controls, records ownership/status/resolution notes, and preserves the source transaction as the system of record.

## Delivered
- `proc_exception_resolutions` operational resolution table.
- `proc_exception_queue()` read-only exception discovery from Phase 9 UAT failures.
- `proc_resolve_exception()` controlled status/resolution workflow.
- `proc_reopen_exception()` controlled reopening.
- Finance/Admin/Super Admin authorization for exception mutations.
- Exception Resolution tab in Finance → Procurement.
- Open / In Progress / Resolved / Reopened states.
- Severity classification for critical reconciliation, 3-way-match and release-readiness failures.
- Mandatory resolution notes before resolving from the UI.

## Safety boundary
Resolution records do not modify purchase orders, GRNs, AP invoices, 3-way matches, reconciliations, accounting events, or capitalization records. A resolved exception is only an operational disposition. The underlying control must be corrected through its normal workflow and then revalidated.

## Validation
```bash
npm run procurement:validate:phase11
```
Then run:
```bash
npm run typecheck
npm run build
```

## Migration
```text
supabase/migrations/20260824020000_procurement_phase11_exception_workflow.sql
```
