# Finance PDC Lifecycle Fix

## Files

- `20260824150000_finance_pdc_lifecycle_hardening.sql` — database transaction/RPC for the canonical PDC lifecycle.
- `pdcService.ts` — replace `src/lib/finance/pdcService.ts`.
- `pdc-management.tsx` — replace `src/components/finance/pdc-management.tsx` or apply the patch.
- `*.patch` — diffs against the supplied project snapshot.

## Apply

1. Copy the SQL migration into `supabase/migrations/`.
2. Run the Supabase migration.
3. Replace `src/lib/finance/pdcService.ts` with the supplied file.
4. Apply the `pdc-management.tsx` change. This removes the duplicate in-memory journal posting.
5. Restart the dev server and test PDC Receive -> Deposit -> Clear and Deposit -> Return.

## Important

The fix makes `fin_pdc_register` the finance PDC register and stops the PDC service from writing `pdcs` or legacy `erp_*` accounting tables. Legacy `pdcs` reads may remain in the UI temporarily for display compatibility, but lifecycle writes are canonicalized through the finance RPC.
