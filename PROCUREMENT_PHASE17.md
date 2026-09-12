# Procurement Phase 17 — Approval Analytics, SLA Intelligence & Management Dashboard

## Objective
Extend the Phase 15/16 approval workflow with a read-only management intelligence layer covering approval health, SLA performance, cycle time, rejection/escalation rates, delegation utilization, workload, bottlenecks, aging, monthly trends, and high-value approvals.

## Database
Migration: `supabase/migrations/20260824080000_procurement_phase17_approval_intelligence.sql`

Adds/updates:
- `proc_approval_intelligence_dashboard(days, limit, high_value_threshold)`
- SLA compliance percentage
- rejection and escalation rates
- delegation utilization
- approval health score
- approval aging buckets
- workload by approval role
- bottleneck analysis
- high-value approval monitoring
- monthly approval trends

The dashboard is read-only and does not mutate procurement or accounting transactions.

## Application
New service:
- `src/lib/procurement/approvalIntelligence.ts`

Control Tower:
- New **Approval Intelligence** tab
- Health score
- Pending/overdue/due-soon approvals
- SLA compliance
- rejection/escalation/delegation rates
- approval cycle metrics
- aging buckets
- workload by role
- bottleneck detection
- high-value approvals
- monthly trends

## Validation
Command:
`npm run procurement:validate:phase17`

Result:
`PROCUREMENT_PHASE17_VALIDATION=PASSED`
`checks=21`

## Local verification
If dependencies are installed:
```bash
npm install
npm run typecheck
npm run build
npm run procurement:validate:phase15
npm run procurement:validate:phase16
npm run procurement:validate:phase17
```
