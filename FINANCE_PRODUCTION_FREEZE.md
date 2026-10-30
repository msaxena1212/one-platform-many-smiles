# Finance Production Freeze

## Frozen architecture

All financial postings follow one path:

Business module → Accounting Event → Accounting Event Lines → Atomic Posting Engine → Financial Voucher → Voucher Lines → COA / General Ledger → Financial Transaction Receipt.

Operational/subledger records such as PDCs, deposits, receivables and payroll synchronization remain operational records. They must not become an alternative source of truth for the General Ledger.

## Frozen rules

1. Do not add a second accounting engine.
2. Do not post directly to `fin_vouchers` or `fin_voucher_lines` from business modules.
3. Use `postVoucher()` / `postAccountingEvent()` for accounting writes.
4. Accounting events must remain balanced and idempotent.
5. Posted vouchers require a posted accounting event.
6. Posted accounting records are corrected through reversal/adjustment workflows, not mutation.
7. Every POSTED accounting event must have exactly one `fin_transaction_receipts` record. The receipt is evidence only and never a second accounting entry.
8. Receipt generation is automatic and database-enforced when an accounting event reaches `POSTED`.
9. New work after this freeze is limited to bugs, data-integrity fixes, security/authorization fixes, migration/deployment corrections and regression fixes.

## Authoritative schema

`supabase/migrations/` is the production schema source. Legacy scripts and reference SQL files are historical/reference artifacts and must not be required for a clean production installation.
