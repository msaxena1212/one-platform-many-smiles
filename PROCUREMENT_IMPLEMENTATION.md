# Procurement Implementation

Procurement is implemented before Finance posting.

## Lifecycle

1. Item Catalog
2. Purchase Requisition
3. Approval
4. Purchase Order
5. Partial / Full GRN
6. Inspection and acceptance
7. Asset registration for asset-type items
8. Maintenance inventory receipt for maintenance spares and consumables
9. Maintenance ticket material usage consumes the received stock
10. Procurement audit / traceability
11. Finance integration is intentionally deferred

## Property and Unit linkage

POs and PO lines carry `property_id` and `unit_id`. Asset registration copies those references into the existing Asset Management `assets` record.

## Maintenance-managed procurement items

- HVAC: AC filters, fan belts
- Electrical: LED bulbs, electrical cable
- Plumbing: flexible hoses, angle valves
- Civil: wall paint, silicone sealant
- Security/Civil: door lock cylinders
- Services: elevator preventive maintenance, pest control

`maintenance_spare` and `consumable` receipts are bridged into the existing `inventory_parts` table through `procurement_item_id`.

## Database migration

Apply:

`supabase/migrations/20260824_009_procurement_complete.sql`

The migration is idempotent for the Procurement foundation and extends existing maintenance inventory instead of replacing it.

## Traceability hardening
- `procurement_asset_registrations` records the Procurement PO line → Asset Management handoff.
- `procurement_inventory_receipts` records accepted maintenance stock receipts against the GRN and PO line.
- Rejected receipt quantities never enter Asset Management or `inventory_parts`.
