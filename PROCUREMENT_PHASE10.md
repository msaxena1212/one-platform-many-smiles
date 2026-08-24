# Procurement Phase 10 — Production Command Center

## Objective
Phase 10 turns the procurement controls from Phases 8–9 into an operational UI inside the existing Finance → Procurement route.

## Delivered
- Procurement Command Center tab.
- E2E UAT dashboard using `proc_uat_dashboard`.
- Detailed PO UAT using `proc_uat_validate_po`.
- Pass/fail counts and individual control results.
- Approval, unposted GRN and unposted AP exception counters.
- No new transactional mutation logic; the command center consumes existing control/RPC results.

## Files
- `src/components/procurement-module.tsx`
- `src/lib/procurement/uat.ts`
- `scripts/validate-procurement-phase10.mjs`

## Validation
Run:

```bash
npm run procurement:validate:phase10
```

Then validate the application with:

```bash
npm run typecheck
npm run build
```

## Scope boundary
Phase 10 is an operational control UI. It does not automatically approve, post, reconcile, capitalize or repair transactions. Exceptions remain visible for authorized users to resolve through the existing procurement workflows.
