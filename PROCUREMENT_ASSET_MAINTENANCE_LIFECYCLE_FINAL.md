# Procurement -> Asset / Maintenance Stock -> Maintenance Ticket

## Final lifecycle

1. Item Master / Catalog defines `asset`, `maintenance_spare`, `consumable`, or `service`.
2. Purchase Request -> Purchase Order -> GRN/Inspection.
3. Accepted Asset quantity automatically creates one `assets` record per physical unit.
4. Asset receives PO property/unit when present; otherwise it starts in General Pool.
5. Asset Management provides controlled Property / Unit allocation and transfer with `asset_allocation_history`.
6. Accepted maintenance spare / consumable quantity automatically creates or increases the procurement-linked `inventory_parts` record.
7. Maintenance Ticket can only issue procurement-controlled stock.
8. Material issue is atomic: lock stock, validate availability, decrement quantity, create `material_usage`, and create `maintenance_inventory_ledger` entry in one transaction.
9. Negative stock and direct non-procurement maintenance stock issue are blocked.

## Ownership

- `procurement_items`: item master / catalog authority.
- Procurement: request, PO, receipt and inspection authority.
- `assets`: physical/capital asset authority.
- `inventory_parts`: maintenance stock quantity authority.
- `maintenance_tickets` + `material_usage`: maintenance execution/consumption authority.
- `asset_allocation_history` and `maintenance_inventory_ledger`: audit trails.
