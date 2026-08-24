# Procurement Phase 4 — Operational + Finance Integration Hardening

## Scope

Phase 4 turns the Procurement Control Tower into an operational workflow over the Phase 1 database and Phase 2 service layer.

### Operational forms
- Purchase Request with multi-line item entry.
- RFX vendor invitation and vendor selection.
- Vendor quote selection and Quote → PO conversion.
- Shipment / import capture.
- Gate inward capture.
- PO → GRN creation.
- Payable invoice creation with PO/GRN linkage.
- Landed-cost creation with allocation basis.
- GRN → Purchase creation.

### Finance controls
- GRN submission and atomic posting.
- AP invoice submission and atomic posting.
- Landed-cost posting through the existing accounting-event engine.
- Purchase capitalization through the existing accounting-event engine.
- Procurement approval queue for submitted GRN / invoice / PO / quote documents.
- Idempotent posting keys remain enforced by the accounting-event engine.

## Database hardening migration

`supabase/migrations/20260823200000_procurement_phase4_hardening.sql`

Adds:
- One selected vendor quote per RFX.
- Receiving quantity consistency checks.
- Operational indexes for PO delivery, shipment ETA, GRN posting, invoice due dates and landed-cost posting.
- Server-side total recalculation functions for PO, GRN, AP invoice and Purchase records.

## Accounting flow

GRN:
- CAPEX → DR 13400 CWIP
- Inventory → DR 13410 Goods in Transit
- GR/IR → CR 21600

AP Invoice:
- GR/IR → DR 21600
- Input Tax → DR 12500
- Accounts Payable → CR 21000

Landed Cost:
- Customs/Duty → DR 13400 / CR 21620
- Other logistics → DR 13410 / CR 21610

Capitalization:
- Asset category account → DR
- 13400 CWIP → CR

## Validation status

The source was parsed with TypeScript. A full dependency build cannot be claimed from the supplied repository because `node_modules` is not included and dependency installation exceeded the execution window. The package itself is checked with ZIP integrity validation.
