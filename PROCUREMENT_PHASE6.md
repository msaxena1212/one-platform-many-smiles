# Procurement Phase 6 — Reconciliation & Audit Hardening

Phase 6 makes the procurement lifecycle operationally auditable rather than only transactionally connected.

## Added

- Procurement audit trail for critical header transactions.
- PO-level reconciliation RPC covering PO, GRN, AP, landed cost, purchase and accounting events.
- Exception list generated from reconciliation rules.
- Read API for entity-level audit history.
- Finance posting completeness check.

## Reconciliation

`proc_reconcile_po(po_id)` validates:

- selected quote exists
- PO is approved
- GRN exists and is posted
- PO/GRN value agrees within 0.01
- GRN/AP subtotal agrees within 0.01
- AP has a passed three-way match
- posted landed cost equals allocated landed cost
- purchase header equals purchase-line total
- procurement accounting events are posted

It returns `reconciled=true` only when no exceptions are detected.
