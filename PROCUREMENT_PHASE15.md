# Procurement Phase 15 — Multi-Step Approval Orchestration & Escalation

## Objective
Phase 15 converts the Phase 14 policy/DoA configuration into an executable approval workflow for Purchase Orders.

## Delivered
- Approval request records with a controlled lifecycle: PENDING, APPROVED, REJECTED, CANCELLED.
- Sequential approval stages generated from all applicable policy tiers.
- Stage-level SLA due dates and escalation roles.
- Delegation-aware approver authorization using the active Phase 14 delegation records.
- Immutable approval action history for submission, approval, rejection and escalation events.
- Database RPCs for submission, stage decisions, SLA escalation, queue retrieval and request detail.
- Final PO approval is blocked while an ENFORCE policy has an incomplete approval request.
- Final successful approval changes the PO to APPROVED only after every required stage is approved.
- Rejection changes the PO to REJECTED and records the rejection reason.
- Re-submission creates a new workflow after the previous request is closed.
- Procurement Control Tower approval UI now includes orchestration queue, stage decisions, SLA escalation and PO submission.
- Legacy approval controls remain available for non-PO procurement documents.

## Approval lifecycle
```text
PO DRAFT
   ↓
Submit for Approval
   ↓
Approval Request PENDING
   ↓
Stage 1 PENDING
   ↓ approve
Stage 2 PENDING
   ↓ approve
...
   ↓ approve
Approval Request APPROVED
   ↓
PO APPROVED
```

Rejection:
```text
Any actionable stage
   ↓ reject
Approval Request REJECTED
   ↓
PO REJECTED
```

SLA escalation:
```text
Stage due_at reached
   ↓
Stage ESCALATED
   ↓
assigned_role = escalation_role
   ↓
New due_at calculated
```

## Enforcement boundary
For an ACTIVE policy in `ENFORCE` mode, the database trigger on `proc_purchase_orders.status` requires the latest approval request for the PO to be `APPROVED`. Client-side status changes cannot bypass the final approval gate.

## Important implementation boundary
Phase 15 executes the configured role/delegation workflow, but it does not invent organisational approver users. Role routing is resolved from the authenticated user's profile and Phase 14 delegation configuration.

## Migration
```text
supabase/migrations/20260824060000_procurement_phase15_approval_orchestration.sql
```

## Frontend service
```text
src/lib/procurement/approvalOrchestration.ts
```

## Validation
```bash
npm run procurement:validate:phase15
```

Expected:
```text
PROCUREMENT_PHASE15_VALIDATION=PASSED
checks=15
```

## Standard checks
The supplied repository did not contain `node_modules`. Dependency installation was attempted in this execution environment but timed out. Therefore the Phase 15 static validator passed, while TypeScript and production-build checks were not completed here.

Run locally after dependency installation:
```bash
npm install
npm run typecheck
npm run build
npm run procurement:validate:phase15
```

## Next phase
Phase 16 should focus on **Approval Inbox, Notifications & Operational Escalation**: approver-specific inboxes, notification events, escalation reminders, approval delegation visibility, aging dashboards and operational SLA reporting.
