# Procurement Phase 21 — Action Center & Continuous Monitoring

## Objective
Convert the intelligence from Phases 17–20 and unresolved control exceptions into a prioritized, accountable operational work queue without mutating the source procurement or accounting records.

## Delivered
- `proc_action_items` operational action table.
- Approval due-soon and overdue signals.
- Deterministic anomaly action signals for duplicate PO, price variance and split-PO patterns.
- Supplier concentration review signals aligned to the Phase 20 30% default threshold.
- Unresolved Phase 11 exception-to-action synchronization.
- Action Center KPIs: open, acknowledged, in-progress, overdue, critical and unassigned.
- Assignment/ownership, acknowledgement, investigation, evidence, resolution and closure states.
- Resolution notes and evidence references retained on the action item.
- Controlled mutation RPC with Finance/Admin/Super Admin authorization.
- Procurement Control Tower **Action Center** tab.
- No approval, PO, GRN, invoice, reconciliation, posting or accounting mutation.

## Workflow
`Signal → Assign → Acknowledge → Investigate → Evidence → Resolve → Close`

Reopening is supported when a previously resolved action requires further work.

## Database
Migration:
`supabase/migrations/20260824120000_procurement_phase21_action_center.sql`

RPCs:
- `proc_refresh_action_center(days, due_hours, limit)`
- `proc_refresh_exception_actions(limit)`
- `proc_action_center(limit)`
- `proc_update_action_item(action_id, status, owner_user_id, due_at, resolution_notes, evidence_reference)`

## Frontend
Service:
`src/lib/procurement/actionCenter.ts`

Control Tower:
- **Action Center** tab
- prioritized queue
- owner/status disposition
- evidence reference
- resolution notes
- continuous monitoring boundary

## Validation
```bash
npm run procurement:validate:phase21
```
Expected:
```text
PROCUREMENT_PHASE21_VALIDATION=PASSED
```

## Local verification
```bash
npm install
npm run typecheck
npm run build
npm run procurement:validate:phase20
npm run procurement:validate:phase21
```

## Safety boundary
Action items are operational control records. Saving a disposition never approves, rejects, modifies, posts, reconciles or closes the underlying procurement/accounting transaction. The source workflow remains the system of record.

## Next phase
Phase 22 should focus on **Control Automation, Scheduled Monitoring & Management Escalation**: scheduled refresh, configurable signal thresholds, escalation timers, owner-level workload metrics, recurring control attestations and management summaries while preserving the same source-transaction safety boundary.
