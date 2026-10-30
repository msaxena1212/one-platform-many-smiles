# Procurement Phase 14 — Policy Configuration & Delegation of Authority

## Objective
Phase 14 converts the Phase 13 reporting-only governance thresholds into a versioned procurement policy and delegation-of-authority layer.

## Delivered
- Versioned `procurement_policy_versions` with DRAFT / ACTIVE / RETIRED lifecycle.
- Effective-dated policy versions and explicit `REPORT_ONLY` / `ENFORCE` modes.
- Amount-tiered `procurement_policy_rules` with required role, approval sequence, SLA and escalation role.
- Effective-dated `procurement_approval_delegations` supporting role-to-role delegation and optional user-level principals.
- `proc_resolve_approval_policy` RPC to resolve the applicable active policy, approval tier, actor role and delegation.
- Database trigger enforcement for PO transitions to `APPROVED` when the active policy is in `ENFORCE` mode.
- Default global policy version 1 with conservative tiers: FINANCE up to 100,000; ADMIN 100,000.01–500,000; SUPER_ADMIN above 500,000.
- Policy & DoA administration UI inside the Procurement Control Tower.
- Policy snapshot, approval-rule and delegation configuration views.
- Admin-only RLS for policy configuration writes; read access remains available for operational review.

## Enforcement boundary
The enforcement point is the database trigger on `proc_purchase_orders.status` when a PO changes to `APPROVED`. Direct client-side updates cannot bypass the policy when the active policy is `ENFORCE`.

`REPORT_ONLY` remains available for controlled rollout of a new policy version before enforcement.

## Default-policy warning
The seeded policy is a safe technical baseline, not a claim about the organisation's legally approved delegation matrix. Replace it with an organisation-approved policy version before relying on the configuration for compliance certification.

## Migration
```text
supabase/migrations/20260824050000_procurement_phase14_policy_doa.sql
```

## Frontend service
```text
src/lib/procurement/policy.ts
```

## Validation
```bash
npm run procurement:validate:phase14
```

Expected:
```text
PROCUREMENT_PHASE14_VALIDATION=PASSED
checks=15
```

## Standard checks
The supplied repository did not contain `node_modules` in this execution environment. Therefore the static Phase 14 validator was run successfully, but TypeScript and production-build checks were not executed here.

Run after dependency installation:
```bash
npm install
npm run typecheck
npm run build
npm run procurement:validate:phase14
```

## Next phase
Phase 15 should focus on **multi-step approval orchestration and escalation execution**: approval requests, sequential approval stages, SLA timers, escalation events, delegated approver routing, approval history, and controlled re-submission after rejection.
