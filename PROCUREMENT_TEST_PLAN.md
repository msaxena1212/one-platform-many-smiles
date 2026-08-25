# Procurement → Asset → Maintenance Validation

Apply migrations in order through `supabase/migrations`.

## 1. Catalog
- Create an Asset item.
- Create a Maintenance Spare.
- Create a Consumable.
- Create a Service.

## 2. Purchase Order
- Create a PO for a property/unit.
- Confirm status is `draft`.
- Approve it and confirm status is `approved`.

## 3. Receiving
- Receive less than ordered quantity.
- Confirm GRN is created.
- Confirm PO becomes `partially_received`.
- Receive the balance.
- Confirm PO becomes `received`.
- For damaged/wrong items, set accepted < received and verify rejected quantity.

## 4. Asset Management
For an Asset item:
- Confirm only accepted quantity appears in Asset Linkage.
- Register the asset.
- Confirm Property and Unit are preserved.
- Confirm purchase cost is based on accepted quantity unless manually overridden.
- Confirm the PO line receives `asset_id`.

## 5. Maintenance Management
For Maintenance Spare / Consumable items:
- Confirm accepted receipt increases the linked `inventory_parts.quantity_on_hand`.
- Confirm the Procurement Maintenance Stock tab shows the same quantity.
- Confirm the existing Maintenance material-usage flow can select the item and consume stock.
- Confirm reorder status is shown when on-hand quantity is at/below reorder level.

## 6. Procurement integrity
Run:

```sql
SELECT * FROM public.validate_procurement_po('<PO_ID>');
```

The result should show:
- ordered = accepted + rejected + outstanding
- accepted + rejected = received
- `is_valid = true`

For an asset PO line:

```sql
SELECT public.validate_procurement_asset_queue('<PO_LINE_ID>');
```

This should return `true` only when the line is an accepted, received Asset item that has not yet been registered as an asset.

## Finance boundary
No Procurement migration in this phase creates accounting events, vouchers, or voucher lines. Finance integration remains the next phase after Procurement → Asset → Maintenance is validated.
