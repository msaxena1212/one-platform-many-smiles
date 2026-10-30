# Procurement Phase 13 — Governance, Audit & Compliance

## Objective
Phase 13 adds an executive governance and compliance reporting layer over the procurement controls delivered in Phases 1–12.

## Delivered
- Governance & Compliance tab inside Finance → Procurement.
- Read-only `proc_governance_dashboard` reporting RPC.
- Audit integrity monitoring for actorless audit records and delete actions.
- High-value PO approval review using a configurable reporting threshold (default 100,000).
- Segregation-of-duties review signal when the same audited actor creates a PO and later changes its status to `APPROVED`.
- Critical exception monitoring.
- Vendor concentration analysis using a configurable reporting threshold (default 50%).
- Policy violation summary with severity and counts.
- Governance boundary explicitly prevents this phase from approving, rejecting, repairing, posting, reconciling or mutating transactions.

## Policy boundary
The PO approval threshold and vendor concentration percentage are **reporting parameters**, not authoritative business policy. They should be aligned with the organisation's approved delegation-of-authority and procurement policy before being treated as compliance limits.

SOD findings are review signals. They do not automatically reject or block a purchase order.

## Migration
```text
supabase/migrations/20260824040000_procurement_phase13_governance.sql
```

## Frontend service
```text
src/lib/procurement/governance.ts
```

## Validation
```bash
npm run procurement:validate:phase13
```

Expected:
```text
PROCUREMENT_PHASE13_VALIDATION=PASSED
checks=10
```

Then run the standard application checks in an environment with dependencies installed:
```bash
npm run typecheck
npm run build
```

## Known validation environment note
The supplied Phase 12 ZIP did not contain `node_modules`. A dependency installation was attempted during Phase 13 validation but timed out, so TypeScript/build validation could not be completed in this execution environment. The Phase 13 static validator passes all 10 checks.

## Scope for next phase
The next logical phase is **Phase 14 — Procurement Policy Configuration & Delegation of Authority**, where reporting-only thresholds can be replaced by explicit, versioned policy configuration and controlled enforcement after the organisation's approval matrix is defined.
