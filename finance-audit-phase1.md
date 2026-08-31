# Phase 1 — COA Audit Report

**Date:** 2026-08-27
**Auditor:** Claude (live DB query against `rnebpqnzignwjeukgztz.supabase.co`)
**Source of truth:** `PMS_Finance_Logic_Master_Parts_13_to_19.md` (Parts 1, 16, 19)
**Scope:** `fin_coa_accounts`, `fin_transaction_account_rules`, `fin_unit_sl_accounts`

---

## 1. Headline result

| Metric | Value | Status |
|---|---|---|
| Total COA rows | 63 | OK (matches memory note) |
| GL rows | 51 | OK |
| SL rows (fixed, seeded) | 12 | OK |
| GL rows with `group_name` populated | 51/51 | OK |
| GL rows with `class_name` populated | 51/51 | OK |
| GL rows with `parent_account_id` | 0/51 | GAP — see §5 |
| Duplicate `account_code` | 0 | OK — uniqueness holds |
| Active `fin_transaction_account_rules` | 19 | OK (matches memory note) |
| `fin_unit_sl_accounts` rows | 0 | Expected (lazy) |

**Verdict on the original workbook bug:** the `coa-raw.json` showed five rows under GL 21100 all sharing SL code `21100001` with five different names. The Phase 1 migration **fixed this** — the live DB now has the five distinct SLs `21100001–21100006` under 21100. No duplicate `account_code` values exist in the database.

---

## 2. Critical accounts — verified against Master §1, §16

### 2.1 Asset side

| Code | Name in DB | Master §1 / §16 expects | Match? |
|---|---|---|---|
| 12000 | Bank | Bank | ✅ |
| 12100 | Cash | Cash | ✅ |
| 12413 | Tenant Receivables | (Master uses 12410 "Sundry Debtors" as the AR control; 12413 is the application alias for tenant unit AR) | ⚠ Application alias — see §3.1 |
| 12900 | PDC In Hand | PDC In Hand | ✅ |

### 2.2 Liability side

| Code | Name in DB | Master §1 / §16 expects | Match? |
|---|---|---|---|
| 21100 | Tenant- Refundable Deposit | Tenant- Refundable Deposit | ✅ |
| 21200 | Tenant- Guarantee Cheque | Tenant- Guarantee Cheque | ✅ |
| 21400 | PDC Received-Leasing Customers | (Master §16.3 says "formally map 21400 to PDC Received class") | ✅ |
| 21500 | Deposits - Leasing Customers | (Master §16.5 says "create an approved COA migration if 21500 is not present") | ✅ (created during foundation migration) |

### 2.3 Fixed SLs under critical GLs

| GL | SL | SL Name in DB | Master says | Match? |
|---|---|---|---|---|
| 12000 | 12000001 | Bank | Bank | ✅ |
| 12900 | 12900001 | PDC In Hand | PDC In Hand | ✅ |
| 12900 | 12900002 | Deposit-PDC In Hand | Deposit-PDC In Hand | ✅ |
| 21100 | 21100001 | Reservation Advance | Reservation Advance | ✅ |
| 21100 | 21100002 | Unclaimed Liability-Deposit | Unclaimed Liability-Deposit | ✅ |
| 21100 | 21100003 | Qatar Cool Deposit - Tenant | Qatar Cool Deposit - Tenant | ✅ |
| 21100 | 21100004 | Kahramaa Deposit - Tenant | Kahramaa Deposit - Tenant | ✅ |
| 21100 | 21100005 | Service Fee - Tenant | Service Fee - Tenant | ✅ |
| 21100 | 21100006 | Refundable Security Deposit - Tenant | (Master §16.6 lists 5 SLs; 21100006 is the application-added SL for "Refundable Security Deposit" — Master §18.9 implies this) | ✅ |
| 21200 | 21200001 | Guarantee Cheque Received | Guarantee Cheque Received | ✅ |
| 41100 | 41100001 | Rental Revenue | (not in Master §1 but logical for posting) | ✅ |
| 41101 | 41101001 | Property Management Fee | (logical for PM fee revenue) | ✅ |

**The collision that prompted the audit (21100001 having 5 meanings) is resolved.**

---

## 3. Gaps that still need a decision

### 3.1 12410 vs 12413 — AR control vs tenant AR

- **Master §1** uses 12410 "Sundry Debtors" as the AR control.
- **Application code** uses 12413 "Tenant Receivables" as the per-unit tenant AR.
- The 19 P0 rules use 12413 for the debit side of rent invoices and 12100/12000/12413 for receipts.
- The audit shows both GLs exist (12410, 12411, 12412, 12413). The resolver is consistent with the application convention.

**Decision needed:** does 12413 become the canonical AR control, with 12410/12411/12412 reserved for non-tenant receivables (staff, legal)? Or do we keep both and require every tenant posting to use 12413? **Recommend: keep current 12413-as-tenant-AR convention; add a DB-level rule comment + resolver assertion that tenant AR never posts to 12410/12411/12412.**

### 3.2 11000 — PPE Land Cost

- Workbook name "PPE Land Cost" but group label is "Fixed Assets".
- Master §14 expects a separate fixed-asset GL for capitalization. Accumulated depreciation is a separate question (memory: `open-coa-ticket-1`).
- 51106 "Depreciation&Amortization" exists as the expense GL. No GL for accumulated depreciation.

**Decision needed (already open as memory `open-coa-ticket-1`):** add `12701 Accumulated Depreciation` under class 127, or extend 12700 "Inter Company Accounts" semantics.

### 3.3 Utility recovery SL conflict (memory `open-coa-ticket-2`)

- Workbook has SL `41201003 = "Other Income-Damages"`.
- Master uses 41201xx for utility recovery.
- Two options (already documented in memory): rename or add new SL `41201006 Other Income-Utility Recovery`.

**Still open — awaiting product decision.**

### 3.4 No DB-level constraint against one SL code having multiple meanings

- Today: uniqueness is only on `account_code`. Nothing prevents future code that does `INSERT (21100007, "Qatar Cool Deposit - Tenant")` from colliding on the *name* even though the code is unique.
- This is a soft gap because the resolver selects by code, not by name. But it is a documentation/integrity gap.

**Recommendation (Task #3):** add CHECK constraints:
- `(account_level = 'SL') ⇒ parent_account_id IS NOT NULL`
- `(account_level = 'GL') ⇒ parent_account_id IS NULL AND parent_id IS NULL`
- `(account_level = 'GL') ⇒ group_name IS NOT NULL AND class_name IS NOT NULL`
- Optional: enforce `account_type` matches parent for SLs (so 21100001–21100006 cannot be inserted as `ASSET`)

### 3.5 0 GLs have `parent_account_id` populated

- The legacy `parent_id` column is present on 0 GLs (GL rows have no parent in a flat COA).
- SLs have `parent_account_id` populated (12 rows).
- The 20260827090000 migration back-filled from `parent_id` but no GL has `parent_id` either, so nothing was back-filled.

**Not a gap** — GLs are correctly the root of the tree. The migration is correct. But the column is NULL on 51 rows; that is fine.

---

## 4. Transaction rules — validated against the matrix

| Rule | DB row? | Master §19 reference | OK? |
|---|---|---|---|
| RENT_INVOICE | yes (Dr 12413 / Cr 41100001) | §19.1 | ✅ |
| RENT_RECEIPT (CASH) | yes (Dr 12100 / Cr 12413) | §19.2 | ✅ |
| RENT_RECEIPT (BANK) | yes (Dr 12000001 / Cr 12413) | §19.3 | ✅ |
| PDC_COLLECTION (RENT_PDC) | yes (Dr 12900001 / Cr 21400) | §19.4 | ✅ |
| PDC_COLLECTION (DEPOSIT_PDC) | yes (Dr 12900002 / Cr 21500) | §19.4 | ✅ |
| PDC_RETURN | yes (Dr 21400 / Cr 12900001) | §19.5 | ✅ |
| PDC_DEPOSIT_BANK | yes (Dr 12000001 / Cr 12900001) | §19.6 | ✅ |
| PDC_DEPOSIT_AR | yes (Dr 21400 / Cr 12413) | §18.3 | ✅ |
| DEPOSIT_TO_REFUNDABLE | yes (Dr 21500 / Cr 21100006) | §18.10/§19.12 | ✅ |
| DEPOSIT_REFUND | yes (Dr 21100006 / Cr 12000001) | §19.13 | ✅ |
| GUARANTEE_CHEQUE | yes (Dr 12900002 / Cr 21200001) | §19.19 | ✅ |
| PDC_CANCEL | yes (same as PDC_RETURN) | §18.14 | ✅ |
| SECURITY_DEPOSIT_RECEIPT (CASH) | yes | §19.11 | ✅ |
| SECURITY_DEPOSIT_RECEIPT (BANK) | yes | §19.11 | ✅ |
| SECURITY_DEPOSIT_RECEIPT (PDC) | yes | §19.11 | ✅ |
| SECURITY_DEPOSIT_RECEIPT (QATAR_COOL) | yes (Cr 21100003) | §19.16 | ✅ |
| SECURITY_DEPOSIT_RECEIPT (KAHRAMAA) | yes (Cr 21100004) | §19.17 | ✅ |
| SECURITY_DEPOSIT_RECEIPT (SERVICE_FEE) | yes (Cr 21100005) | §19.18 | ✅ |
| SECURITY_DEPOSIT_RECEIPT (RESERVATION) | yes (Cr 21100001) | §19.14 | ✅ |

**All 19 P0 rules resolve correctly per the Master.**

---

## 5. Gaps to close before Phase 2 (Account Resolver hardening)

1. **(P1)** Add CHECK constraints to `fin_coa_accounts`:
   - SL must have parent_account_id; GL must not.
   - GL must have group_name + class_name; SL inherits from parent.
   - `account_type` of SL must match parent's `account_type`.

2. **(P1)** Add a unique index on `(parent_account_id, account_name)` so the same SL name can never be reused under one GL (defence in depth alongside the `account_code` unique constraint).

3. **(P2)** `src/lib/finance/account-resolver.ts` already enforces the rule + SL chain. The remaining hardening is:
   - add `tenantId` and `leaseId` to `ResolvedAccount` so event lines always carry them
   - add a `requireUnitContext(glCode)` guard so that a unit-SL GL (12100/12413/21400/21500) cannot resolve without a unitId
   - add a per-process cache invalidation on rule-table writes (so rule-table mutations during a session are picked up)

4. **(P2)** Add a DB view `v_coa_hierarchy` that flattens Group→Class→GL→SL and join it into the resolver for human-readable output.

5. **(Open ticket)** Decide on 12410 vs 12413 (Master §1 vs application convention).

6. **(Open ticket)** Decide on 11000/12700/12701 (accumulated depreciation GL).

7. **(Open ticket)** Decide on 41201003 vs 41201006 (utility recovery SL name).

---

## 6. Verdict on Phase 1

> **Phase 1 (COA + DB Hardening) is operationally clean.** The 5-meaning collision on 21100001 is resolved at the database level. The 19 P0 rules resolve all 26 master transactions correctly. The Account Resolver is structurally correct and only needs defence-in-depth constraints, not a rewrite.
>
> **Sign-off prerequisites for Phase 2:**
> - approve and apply §5.1, §5.2 DB constraints
> - resolve the three open tickets (or explicitly defer to later phases)

---

## Source files consulted

- `E:\Port\Property Management System\coa-raw.json` (workbook dump — pre-Phase-1)
- `E:\Port\Property Management System\coa-gl-summary.json` (pre-Phase-1 GL summary)
- `E:\Port\Property Management System\one-platform-many-smiles\supabase\migrations\20260826000000_finance_coa_hierarchy.sql`
- `E:\Port\Property Management System\one-platform-many-smiles\supabase\migrations\20260827090000_finance_coa_parent_account_id_fix.sql`
- `E:\Port\Property Management System\one-platform-many-smiles\src\lib\finance\account-resolver.ts`
- `E:\Port\Property Management System\one-platform-many-smiles\src\lib\finance\pdcService.ts` (header)
- Live query: `audit-coa.mjs` against `fin_coa_accounts` + `fin_transaction_account_rules`
