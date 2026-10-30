# Procurement Phase 1 — Applied to Current Repository

The repository supplied by the user was inspected as the source of truth.

## Finding
The supplied repository is greenfield for Procurement: there are no `proc_*` procurement tables,
routes, components, or `supabase-procurement.ts` implementation in the repository.

Therefore the previously referenced temporary `procurement-phase1.zip` cannot be recovered from this
repository and should not be treated as already applied.

## Change made
Added:

`supabase/migrations/20260823140000_procurement_core.sql`

This is Phase 1 of the agreed implementation order: database foundation only.

It creates:
- 6 guarded PostgreSQL enums
- 24 `proc_*` tables
- UUID primary keys for procurement records
- `vendor_id BIGINT` references to the existing `fin_vendors`
- `property_id UUID`
- `cost_center_id BIGINT` aligned to the current repository
- GR/IR, CWIP, input-tax and logistics accrual COA seeds
- atomic document-number RPC `proc_next_document_number`
- updated-at trigger function and triggers
- RLS policies and browser grants required by the direct Supabase client architecture
- defensive accounting-event foreign keys
- vendor master extensions required by Procurement

## Important repository alignment
The earlier planning document describes `fin_coa_accounts.id` as UUID, but the supplied repository
currently defines/uses it as BIGINT. The migration therefore follows the actual repository schema
rather than blindly applying the older assumption.

## Next implementation step
After applying and verifying this migration:
1. `src/lib/supabase-procurement.ts`
2. `src/lib/procurement/numbering.ts`
3. `src/lib/procurement/conversions.ts`
4. `src/lib/procurement/approvals.ts`
5. `src/lib/procurement/postingService.ts`
6. `src/lib/procurement/capitalizationService.ts`
7. Procurement UI/routes/navigation/RBAC
8. Replace Finance GRN/Payable mock tabs

## Apply
Run from the repository root:

```bash
npx supabase db push
```

Then verify the 24 `proc_*` tables and:

```sql
select public.proc_next_document_number('PO', 2026);
select public.proc_next_document_number('PO', 2026);
```

Expected:
- `PO-2026-0001`
- `PO-2026-0002`

Do not apply the migration blindly to production without reviewing the Supabase target/project.
