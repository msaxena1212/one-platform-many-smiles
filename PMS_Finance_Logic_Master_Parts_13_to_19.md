# PMS Finance Logic Master --- Parts 13--19 {#pms-finance-logic-master--parts-1319}

## Purpose

This is the consolidated continuation of the Finance Logic Master. It is
intended to be the implementation baseline for the remaining Finance
work: VAT/Tax, Fixed Assets, Month/Year End Close, GL/SL Reconciliation,
Accounting Event/Voucher Posting, Implementation Deviation Audit, and
the Final Finance Matrix.

> **Mandatory rule:** Every accounting transaction must persist the
> complete hierarchy **Type/Group/Class/GL/SL**, together with the
> operational dimensions required for audit: legal entity, property,
> building, unit, tenant, lease, owner, vendor, cost centre, profit
> centre, currency, source document and source transaction.

------------------------------------------------------------------------

# 1. Approved COA Baseline {#1-approved-coa-baseline}

The approved COA extract contains the following exact accounts relevant
to this document:

  Type          Group                 Class                            GL GL Name                              SL SL Name
  ------------- --------------------- --------------------------- ------- ---------------------------- ---------- -----------------------------
  Assets        Current Assets        Bank                          12000 Bank                           12000001 Bank
  Assets        Current Assets        Cash                          12100 Cash                           12100001 Cash in Hand
  Assets        Current Assets        Accounts Receivables          12410 Sundry Debtors                 12410001 Tenant Name
  Assets        Current Assets        Legal Receivables             12411 Legal Receivables              12411001 Tenant Name
  Assets        Current Assets        Prepaid Expenses              12500 Prepaid Expenses               12500001 Prepaid Insurance
  Assets        Current Assets        PDC In Hand                   12900 PDC In Hand                    12900001 PDC In Hand
  Assets        Current Assets        PDC In Hand                   12900 PDC In Hand                    12900002 Deposit-PDC In Hand
  Liabilities   Current Liabilities   Accounts Payables             21000 Sundry Creditors               21000001 Account Name
  Liabilities   Current Liabilities   Security Deposit Received     21100 Tenant- Refundable Deposit     21100001 Reservation Advance
  Liabilities   Current Liabilities   Security Deposit Received     21100 Tenant- Refundable Deposit     21100002 Unclaimed Liability-Deposit
  Liabilities   Current Liabilities   Security Deposit Received     21100 Tenant- Refundable Deposit     21100003 Qatar Cool Deposit - Tenant
  Liabilities   Current Liabilities   Security Deposit Received     21100 Tenant- Refundable Deposit     21100004 Kahramaa Deposit - Tenant
  Liabilities   Current Liabilities   Security Deposit Received     21100 Tenant- Refundable Deposit     21100005 Service Fee - Tenant
  Liabilities   Current Liabilities   Guarantee Received            21200 Tenant- Guarantee Cheque       21200001 Guarantee Cheque Received

The application also currently uses **21400 Customer/PDC** and **21500
Security Deposit**. Those codes must be formally mapped into the
approved COA before production rather than remaining undocumented
application aliases.

------------------------------------------------------------------------

# PART 13 --- VAT / TAX ENGINE {#part-13--vat--tax-engine}

## 13.1 Tax architecture {#131-tax-architecture}

Tax must be a component of the transaction, not an attribute hidden
inside revenue or expense. Every taxable line should carry:

``` text
Tax Code
Tax Rate
Taxable Amount
Tax Amount
Tax Inclusive/Exclusive Flag
Tax Date / Tax Point
Tax Jurisdiction
Tax Registration Context
Input/Output Classification
Tax Source Document
```

Exact input/output tax GLs must be taken from the approved COA. Do not
invent tax account numbers in code.

## 13.2 Tax master {#132-tax-master}

Recommended master:

``` text
TAX_CODE
TAX_NAME
RATE
INPUT_GL_ID
OUTPUT_GL_ID
RECOVERABILITY_RULE
EFFECTIVE_FROM
EFFECTIVE_TO
JURISDICTION
ROUNDING_RULE
```

The accounting rule engine resolves the tax GL from this master.

## 13.3 Tenant rent invoice {#133-tenant-rent-invoice}

Example:

``` text
Rent                 100,000
Tax @ 10%             10,000
Gross                 110,000
```

Posting:

  Dr/Cr   Group         Class                      GL GL Name              SL              SL Name              Amount
  ------- ------------- ---------------- ------------ -------------------- --------------- ----------------- ---------
  Dr      Assets        Current Assets          12410 Sundry Debtors       Tenant/Unit     Tenant AR SL        110,000
  Cr      Revenue       Rent Revenue       Configured Rent Revenue         Property/Unit   Rent Revenue SL     100,000
  Cr      Liabilities   Tax Payable        Configured Output Tax Payable   Tax             Output Tax SL        10,000

AR must equal the gross invoice.

## 13.4 Tax-inclusive invoice {#134-tax-inclusive-invoice}

If total is 110,000 and rate is 10%:

``` text
Taxable = 110,000 / 1.10
Tax = Gross - Taxable
```

Store both values; do not reconstruct tax later from rounded totals.

## 13.5 Tax on service fee {#135-tax-on-service-fee}

If service fee is non-refundable revenue:

``` text
Dr Tenant AR
    Cr Service Fee Revenue
    Cr Output Tax
```

Do **not** use `21100005 Service Fee - Tenant` for revenue merely
because the account name contains "Service Fee". That SL is under the
refundable-deposit liability hierarchy. It is appropriate only when the
business transaction is actually a refundable tenant-held amount.

## 13.6 Tax on utility recovery {#136-tax-on-utility-recovery}

If taxable:

``` text
Dr Tenant AR
    Cr Utility Recovery
    Cr Output Tax
```

The original utility expense remains a separate event.

## 13.7 Tax on damage recovery {#137-tax-on-damage-recovery}

If the damage recovery is taxable under the configured tax policy:

``` text
Dr Tenant AR
    Cr Damage/Maintenance Recovery
    Cr Output Tax
```

If not taxable, no output tax line is generated.

## 13.8 Security deposits {#138-security-deposits}

Receipt of a refundable security deposit is not automatically revenue:

``` text
Dr Bank/Cash/PDC Control
    Cr Security Deposit Liability
```

Tax must be determined from the legal/commercial tax treatment, not from
the fact that cash was received.

## 13.9 Reservation advance {#139-reservation-advance}

Refundable reservation advance:

``` text
Dr Bank/Cash
    Cr 21100 / SL 21100001 Reservation Advance
```

When applied against an invoice, the invoice creates revenue/tax and the
advance then clears AR:

``` text
Invoice:
Dr Tenant AR
    Cr Revenue
    Cr Output Tax

Apply advance:
Dr Reservation Advance
    Cr Tenant AR
```

## 13.10 Vendor input tax {#1310-vendor-input-tax}

Example:

``` text
Expense             100,000
Input tax            10,000
Vendor payable      110,000
```

``` text
Dr Expense
Dr Input Tax Recoverable
    Cr Vendor Payable
```

If input tax is non-recoverable, include it in the applicable
expense/asset cost according to policy while retaining the tax detail in
the source transaction.

## 13.11 Credit note {#1311-credit-note}

For a taxable credit note:

``` text
Dr Revenue / Recovery
Dr Output Tax
    Cr Tenant AR
```

If the tenant already paid, the resulting credit becomes refundable or
available for future allocation.

## 13.12 Debit note {#1312-debit-note}

``` text
Dr Tenant AR
    Cr Revenue / Recovery
    Cr Output Tax
```

## 13.13 Tax rounding {#1313-tax-rounding}

Store:

``` text
calculated_tax
rounded_tax
rounding_difference
```

Use a configured rounding GL where required.

## 13.14 Tax corrections {#1314-tax-corrections}

Never edit posted tax values. Use:

``` text
Credit Note
Debit Note
Tax Adjustment
Reversal + Rebill
```

## 13.15 Tax close {#1315-tax-close}

A closed tax period must block ordinary posting. Corrections require
controlled adjustment with reason, approval and audit trail.

------------------------------------------------------------------------

# PART 14 --- FIXED ASSETS & DEPRECIATION {#part-14--fixed-assets--depreciation}

## 14.1 Asset lifecycle {#141-asset-lifecycle}

``` text
PR
↓
RFQ / Quotation
↓
PO
↓
GRN / Service Receipt
↓
Vendor Invoice
↓
Capitalization Assessment
↓
CWIP / Asset
↓
Placed in Service
↓
Depreciation
↓
Transfer / Impairment
↓
Disposal / Write-off
```

## 14.2 Capitalization decision {#142-capitalization-decision}

Each procurement line must resolve to one of:

``` text
EXPENSE
ASSET
CWIP
INVENTORY
PREPAID
```

Decision criteria include capitalization threshold, useful life, nature
of spend, replacement versus repair, ownership and accounting policy.

## 14.3 Asset invoice {#143-asset-invoice}

Example:

``` text
Asset cost       100,000
Input tax         10,000
Total            110,000
```

``` text
Dr Fixed Asset GL               100,000
Dr Input Tax GL                  10,000
    Cr Vendor Payable           110,000
```

The exact asset GL/Class/SL must be resolved from the approved COA.
Recommended SL identity is Asset ID + Property/Unit.

## 14.4 CWIP {#144-cwip}

``` text
Dr CWIP GL
    Cr Vendor Payable
```

No depreciation until the asset is placed in service according to
policy.

## 14.5 CWIP capitalization {#145-cwip-capitalization}

``` text
Dr Fixed Asset GL
    Cr CWIP GL
```

This is a reclassification, not a second purchase.

## 14.6 Depreciation {#146-depreciation}

Example:

``` text
Cost              100,000
Residual            10,000
Useful life         36 months
Depreciable base    90,000
Monthly depreciation 2,500
```

``` text
Dr Depreciation Expense             2,500
    Cr Accumulated Depreciation     2,500
```

Group/Class/GL/SL must be stored on both lines.

## 14.7 Depreciation start {#147-depreciation-start}

Use the configured placed-in-service convention. Do not start
depreciation simply because an invoice was posted.

## 14.8 Mid-month capitalization {#148-mid-month-capitalization}

Support configurable conventions:

-   full month,
-   half month,
-   daily,
-   next-month start.

## 14.9 Asset transfer {#149-asset-transfer}

Transfer must update property/unit/cost-centre ownership/location
dimensions. If legal ownership does not change, do not create a fake
disposal and purchase.

## 14.10 Impairment {#1410-impairment}

If carrying value is 100,000 and recoverable value is 70,000:

``` text
Dr Impairment Loss                  30,000
    Cr Accumulated Impairment       30,000
```

## 14.11 Disposal {#1411-disposal}

Cost = 100,000; accumulated depreciation = 70,000; proceeds = 40,000;
gain = 10,000.

``` text
Dr Bank/Cash                        40,000
Dr Accumulated Depreciation         70,000
    Cr Fixed Asset Cost            100,000
    Cr Gain on Disposal             10,000
```

Loss scenarios use a debit to Loss on Disposal.

## 14.12 Asset controls {#1412-asset-controls}

Hard controls:

-   duplicate capitalization blocked;
-   serial number duplication flagged;
-   depreciation before service date blocked;
-   disposal of already disposed asset blocked;
-   transfer of inactive asset blocked unless explicitly permitted;
-   posted depreciation immutable;
-   asset register must reconcile to fixed-asset GL.

------------------------------------------------------------------------

# PART 15 --- MONTH-END / YEAR-END CLOSE {#part-15--month-end--year-end-close}

## 15.1 Close sequence {#151-close-sequence}

``` text
OPEN
↓
PRE-CLOSE
↓
VALIDATION
↓
EXCEPTION REVIEW
↓
CLOSING
↓
CLOSED
↓
LOCKED
```

## 15.2 Revenue close checklist {#152-revenue-close-checklist}

-   Billing runs completed.
-   Unposted invoices reviewed.
-   Credit/debit notes reviewed.
-   Revenue cut-off reviewed.
-   Advance/deferred balances reviewed.

## 15.3 AR close {#153-ar-close}

-   Tenant ageing reviewed.
-   Unallocated receipts reviewed.
-   Overpayments reviewed.
-   Underpayments reviewed.
-   Legal receivables reviewed.
-   AR control GL reconciled to tenant SLs.

## 15.4 PDC close {#154-pdc-close}

-   PDC register reconciled.
-   PDC in hand reconciled.
-   Deposited/un-cleared instruments reconciled.
-   Bounced instruments reconciled.
-   Re-presented instruments reconciled.
-   Returned/cancelled instruments reconciled.
-   Duplicate instruments checked.

## 15.5 Deposit close {#155-deposit-close}

For each deposit type:

``` text
Opening
+ Receipts
+ Transfers In
- Approved Adjustments
- Refunds
- Transfers Out
= Closing Liability
```

Closing must equal GL/SL balance.

## 15.6 AP close {#156-ap-close}

-   Vendor invoices posted.
-   Duplicate invoices checked.
-   GRNI reviewed.
-   Invoice-not-received accruals reviewed.
-   Vendor advances reviewed.
-   AP ageing reconciled.

## 15.7 Asset close {#157-asset-close}

-   Additions posted.
-   Capitalization completed.
-   Depreciation posted.
-   Transfers completed.
-   Disposals completed.
-   Asset GL reconciled to asset register.

## 15.8 Bank and cash close {#158-bank-and-cash-close}

-   Bank reconciliation complete.
-   Unmatched transactions reviewed.
-   Cash till reconciled.
-   Shortage/overage approved.
-   Bank charges posted.
-   Unpresented items reviewed.

## 15.9 Period lock {#159-period-lock}

Normal postings into a locked period must fail. Backdated postings
require authorized reopening or a current-period adjustment with reason
and approval.

## 15.10 Year-end {#1510-year-end}

Balance-sheet accounts carry forward. Revenue/expense closing follows
the configured accounting policy. No historical transaction should be
edited simply to force the trial balance.

------------------------------------------------------------------------

# PART 16 --- GL / SL RECONCILIATION {#part-16--gl--sl-reconciliation}

## 16.1 Core formula {#161-core-formula}

For every control account:

``` text
GL Balance = Sum of valid SL balances
```

Any variance becomes an exception.

## 16.2 Tenant AR {#162-tenant-ar}

``` text
12410 GL
=
Σ Tenant/Lease/Unit AR SL balances
```

The tenant ledger and GL must use the same posting events.

## 16.3 PDC liability {#163-pdc-liability}

The application currently uses 21400 for Customer/PDC. The final system
must formally map:

``` text
Type: Liabilities
Group: Current Liabilities
Class: PDC Received
GL: 21400
GL Name: PDC Received
SL: Customer/Unit/Instrument
```

The balance must reconcile to active PDC exposure.

## 16.4 PDC in hand {#164-pdc-in-hand}

``` text
12900 PDC In Hand
=
Σ PDC instruments physically held / in the corresponding accounting state
```

Cleared, returned and cancelled instruments must not remain in this
balance.

## 16.5 Unit security deposit {#165-unit-security-deposit}

Requested business mapping:

``` text
GL 21500 — Unit Security Deposit
```

The final approved hierarchy must be:

``` text
Type: Liabilities
Group: Current Liabilities
Class: Security Deposit Received
GL: 21500
GL Name: Unit Security Deposit / Leasing Security Deposit
SL: Tenant + Unit + Lease
```

If 21500 is not present in the approved COA, create an approved COA
migration before production. Do not let application code invent the
hierarchy.

## 16.6 GL 21100 refundable deposits {#166-gl-21100-refundable-deposits}

Use exact SLs:

``` text
21100001 Reservation Advance
21100002 Unclaimed Liability-Deposit
21100003 Qatar Cool Deposit - Tenant
21100004 Kahramaa Deposit - Tenant
21100005 Service Fee - Tenant
```

Never post all of these to one generic 21100 SL.

## 16.7 Guarantee cheque {#167-guarantee-cheque}

``` text
21200 / 21200001
Guarantee Cheque Received
```

This is a guarantee liability/control, not ordinary rent settlement.

------------------------------------------------------------------------

# PART 17 --- ACCOUNTING EVENT / POSTING ENGINE {#part-17--accounting-event--posting-engine}

## 17.1 Target architecture {#171-target-architecture}

``` text
Business Event
↓
Accounting Rule
↓
Accounting Event
↓
Accounting Event Lines
↓
Validation
↓
Atomic Voucher
↓
Voucher Lines
↓
GL / SL
```

The current project already contains `fin_accounting_events`,
`fin_accounting_event_lines`, `fin_vouchers` and `fin_voucher_lines`,
plus an atomic posting migration. This is the correct target
architecture.

## 17.2 Accounting event minimum data {#172-accounting-event-minimum-data}

``` text
event_id
event_type
source_type
source_id
event_date
posting_date
legal_entity_id
property_id
unit_id
tenant_id
lease_id
currency
total_debit
total_credit
idempotency_key
status
created_by
approved_by
```

## 17.3 Accounting line minimum data {#173-accounting-line-minimum-data}

``` text
event_id
account_id
account_code
sl_code
debit
credit
description
property_id
building_id
unit_id
tenant_id
lease_id
owner_id
vendor_id
cost_center_id
profit_center_id
currency
source_line_id
```

## 17.4 Mandatory accounting validation {#174-mandatory-accounting-validation}

Before posting:

``` text
Total Debit = Total Credit
Debit >= 0
Credit >= 0
At least one debit
At least one credit
GL active
SL valid for GL
Period open
Source event valid
No duplicate idempotency key
```

## 17.5 Idempotency {#175-idempotency}

Example:

``` text
PDC_CLEAR:PDC-123:2026-08-26
```

If the same event is submitted twice, only one accounting event/voucher
may be posted.

## 17.6 Atomic posting {#176-atomic-posting}

The following must be one database transaction:

``` text
Validate event
Resolve accounts
Validate balance
Create accounting event
Create event lines
Create voucher
Create voucher lines
Link voucher ↔ event
Mark event posted
```

If any step fails, rollback everything.

## 17.7 Immutable posting {#177-immutable-posting}

Posted voucher lines must never be edited. Corrections require a new
reversal/adjustment event.

## 17.8 Reversal {#178-reversal}

``` text
Original Event
↓
Reversal Event
↓
Reversal Voucher
```

Store `original_event_id`, `original_voucher_id`, reason and actor.

------------------------------------------------------------------------

# PART 18 --- IMPLEMENTATION DEVIATION AUDIT {#part-18--implementation-deviation-audit}

## 18.1 Overall verdict {#181-overall-verdict}

The current implementation is **directionally aligned** with the desired
architecture, but it is **not yet fully aligned** with the final finance
rules.

The strongest existing areas are:

-   accounting event/voucher architecture;
-   atomic posting direction;
-   PDC service separation;
-   security deposit service;
-   idempotency concepts;
-   GL/SL context;
-   PDC lifecycle statuses.

The most important deviations are:

1.  Hard-coded account codes without complete Type → Group → Class → GL
    → SL validation.
2.  Security deposit logic hard-codes 21500 and then transfers to
    generic 21100 without a complete deposit-type mapping engine.
3.  Deposit settlement can post to generic 21100 instead of the actual
    originating deposit SL.
4.  PDC return/bounce logic must distinguish pre-clearance,
    deposited-but-un-cleared and post-clearance bank reversal.
5.  Bank dishonour charges must be separate from principal reversal.
6.  Tax and fixed-asset accounting need a rule-driven posting layer.
7.  Every accounting line needs exact Group/Class/GL/SL persistence, not
    only account code.

## 18.2 Existing PDC receipt {#182-existing-pdc-receipt}

Current logic is:

``` text
Dr 12900 PDC In Hand
Cr 21400 Customer PDC Liability
```

**Status: APPROVED DIRECTIONALLY.**

Required final mapping:

  Side   Type          Group                 Class               GL GL Name        SL
  ------ ------------- --------------------- -------------- ------- -------------- ------------------------------
  Dr     Assets        Current Assets        PDC In Hand      12900 PDC In Hand    PDC In Hand / Property
  Cr     Liabilities   Current Liabilities   PDC Received     21400 PDC Received   Customer + Unit + Instrument

## 18.3 Existing PDC deposit to bank {#183-existing-pdc-deposit-to-bank}

Current logic:

``` text
Dr 12000 Bank
Cr 12900 PDC In Hand
```

**Status: APPROVED if the configured accounting model treats
presentation as transfer from PDC-in-hand directly to bank.**

If a separate clearing account is required, it must be introduced
explicitly.

## 18.4 Existing PDC clear {#184-existing-pdc-clear}

The code contains a `postPdcClear` path that debits Customer(PDC)-Unit
and credits Bank. This matches the required clearing direction.

However, it must validate whether the bank debit was already recognized
during presentation. Otherwise the system can double-count the bank
movement.

## 18.5 Existing PDC return/bounce {#185-existing-pdc-returnbounce}

The code contains a `postPdcReturn` path with PDC In Hand, Bank,
Receivable and Customer PDC lines.

**Risk:** this logic is valid only for the relevant lifecycle state. It
must not be reused for a cheque already cleared.

### Pre-clearance return

For an instrument still held and never deposited:

``` text
Dr 21400 Customer PDC Liability
Cr 12900 PDC In Hand
```

and restore the tenant\'s AR exposure according to the original
allocation.

### Deposited but bank returned

The bank-side movement must reverse the presentation/clearing state and
restore AR/PDC exposure without duplicating entries.

### Already cleared then bank-reversed

Use a completely separate event:

``` text
Dr 12000 Bank
Cr 21400 Customer PDC Liability
```

Then restore tenant AR as required by the original allocation.

**Do not call the normal pre-clearance return function for this event.**

## 18.6 Bank dishonour charge {#186-bank-dishonour-charge}

If property absorbs it:

``` text
Dr Bank Dishonour Expense GL
Cr 12000 Bank
```

If tenant bears it:

``` text
Dr Tenant AR
Cr Dishonour Recovery GL
```

These are separate events from the principal bounced amount.

## 18.7 Re-presentation {#187-re-presentation}

A bounced PDC may be re-presented. Preserve the original instrument
identity and create a new presentation event. Do not create a second
economic obligation.

## 18.8 Replacement payment {#188-replacement-payment}

Replacement payment is a separate payment event linked to the original
instrument. The original instrument becomes `REPLACED` only after the
replacement is successfully posted, unless policy explicitly allows
another sequence.

## 18.9 Existing security deposit collection {#189-existing-security-deposit-collection}

The application currently hard-codes:

``` text
coa_account_code = 21500
```

for security deposit collection.

**Status: PARTIALLY ALIGNED.**

It is correct only for the Unit Security Deposit transaction.

The final rule must be:

``` text
Unit Security Deposit → 21500 + tenant/unit/lease SL
Reservation Advance → 21100001
Qatar Cool Deposit → 21100003
Kahramaa Deposit → 21100004
Service Fee refundable → 21100005
Unclaimed Liability → 21100002
Guarantee Cheque → 21200001
```

## 18.10 Existing deposit transfer 21500 → 21100 {#1810-existing-deposit-transfer-21500--21100}

The code contains a transfer path from 21500 to 21100.

**Status: REQUIRES BUSINESS-RULE VALIDATION.**

It is valid only when the liability has actually changed in nature. If
it is merely a settlement/refund workflow, the deposit should remain
linked to its originating GL/SL.

## 18.11 Existing deposit settlement {#1811-existing-deposit-settlement}

The current code checks refundable status, calculates deduction +
refund, and validates that the total equals the deposit amount. That
control is good.

The major correction is account resolution: settlement must debit the
**actual source deposit account/SL**, not a generic 21100 account.

Example:

``` text
Original deposit = 21500 / Tenant-Unit SL
Damage adjustment = 20,000
```

must post:

``` text
Dr 21500 / Tenant-Unit Security Deposit SL   20,000
Cr Damage Recovery GL                        20,000
```

not generic 21100.

## 18.12 Security deposit refund {#1812-security-deposit-refund}

Remaining deposit must refund from the same originating liability:

``` text
Dr 21500 / source deposit SL
Cr 12000 Bank / bank SL
```

If source is Qatar Cool:

``` text
Dr 21100003 Qatar Cool Deposit - Tenant
Cr 12000 Bank
```

## 18.13 Early termination {#1813-early-termination}

The existing SRS requires:

``` text
Final settlement
Refund/recovery
Future PDC return/cancel
Advance settlement
Reconciliation
Lease closure
```

The implementation must block lease closure until these checks pass.

## 18.14 User\'s PDC return logic {#1814-users-pdc-return-logic}

The proposed:

``` text
Customer(PDC)-Unit Debit
PDC In Hand Credit
```

is **correct for an unpresented PDC still held by the property**.

It must not be used for already deposited, cleared, bank-reversed or
already replaced instruments.

------------------------------------------------------------------------

# PART 19 --- FINAL MASTER FINANCE MATRIX {#part-19--final-master-finance-matrix}

## 19.1 Rent invoice {#191-rent-invoice}

``` text
Dr 12410 Tenant AR
Cr Approved Rent Revenue GL
Cr Approved Output Tax GL, if applicable
```

## 19.2 Cash receipt {#192-cash-receipt}

``` text
Dr 12100 / 12100001 Cash in Hand
Cr 12410 Tenant AR / Tenant SL
```

## 19.3 Bank receipt {#193-bank-receipt}

``` text
Dr 12000 / bank SL
Cr 12410 Tenant AR / Tenant SL
```

## 19.4 PDC receipt {#194-pdc-receipt}

``` text
Dr 12900 PDC In Hand / PDC SL
Cr 21400 PDC Received / Customer-Unit PDC SL
```

## 19.5 PDC return while still held {#195-pdc-return-while-still-held}

``` text
Dr 21400 PDC Received / Customer-Unit PDC SL
Cr 12900 PDC In Hand / PDC SL
```

Then restore AR if the instrument had been allocated against an invoice.

## 19.6 PDC deposit {#196-pdc-deposit}

``` text
Dr 12000 Bank / Bank SL
Cr 12900 PDC In Hand / PDC SL
```

## 19.7 PDC clearance {#197-pdc-clearance}

Where direct-clearing model is used:

``` text
Dr 21400 Customer PDC SL
Cr 12000 Bank SL
```

## 19.8 PDC bounce after presentation {#198-pdc-bounce-after-presentation}

The exact entry depends on whether presentation already moved the
instrument to a clearing account. The rule is:

``` text
Reverse the bank/clearing movement
Restore tenant AR exposure
Restore PDC liability/control state
```

No duplicated bank movement.

## 19.9 Post-clearance bank reversal {#199-post-clearance-bank-reversal}

``` text
Dr 12000 Bank SL
Cr 21400 Customer PDC SL
```

Then the tenant\'s underlying AR is reopened through the
payment-allocation layer.

## 19.10 Dishonour charges {#1910-dishonour-charges}

Property expense:

``` text
Dr Dishonour Expense GL
Cr 12000 Bank SL
```

Tenant recovery:

``` text
Dr Tenant AR
Cr Dishonour Recovery GL
```

## 19.11 Unit security deposit {#1911-unit-security-deposit}

``` text
Dr Bank/Cash/PDC Control
Cr 21500 Unit Security Deposit / Tenant-Unit SL
```

## 19.12 Unit security deposit adjustment {#1912-unit-security-deposit-adjustment}

``` text
Dr 21500 Unit Security Deposit / Tenant-Unit SL
Cr Damage Recovery / Utility Recovery / Other Approved Recovery GL
```

## 19.13 Unit security deposit refund {#1913-unit-security-deposit-refund}

``` text
Dr 21500 Unit Security Deposit / Tenant-Unit SL
Cr 12000 Bank / Bank SL
```

## 19.14 Reservation advance {#1914-reservation-advance}

``` text
Dr Bank/Cash
Cr 21100001 Reservation Advance
```

## 19.15 Unclaimed liability {#1915-unclaimed-liability}

``` text
Dr Original Refundable Deposit SL
Cr 21100002 Unclaimed Liability-Deposit
```

Only after controlled release/unclaimed process.

## 19.16 Qatar Cool deposit {#1916-qatar-cool-deposit}

``` text
Dr Bank/Cash
Cr 21100003 Qatar Cool Deposit - Tenant
```

## 19.17 Kahramaa deposit {#1917-kahramaa-deposit}

``` text
Dr Bank/Cash
Cr 21100004 Kahramaa Deposit - Tenant
```

## 19.18 Refundable service fee {#1918-refundable-service-fee}

``` text
Dr Bank/Cash
Cr 21100005 Service Fee - Tenant
```

If non-refundable revenue, use the approved service-fee revenue GL
instead.

## 19.19 Guarantee cheque {#1919-guarantee-cheque}

``` text
Dr Guarantee Cheque Control / configured instrument control
Cr 21200001 Guarantee Cheque Received
```

Do not settle rent with the guarantee merely because it is physically
held.

## 19.20 Vendor expense invoice {#1920-vendor-expense-invoice}

``` text
Dr Expense GL
Dr Input Tax GL, if recoverable
Cr 21000 Accounts Payable / Vendor SL
```

## 19.21 Vendor payment {#1921-vendor-payment}

``` text
Dr 21000 Accounts Payable / Vendor SL
Cr 12000 Bank / Bank SL
```

## 19.22 Prepaid expense {#1922-prepaid-expense}

At payment:

``` text
Dr 12500 Prepaid Expenses / 12500001 where applicable
Cr 12000 Bank
```

Monthly:

``` text
Dr Expense GL
Cr 12500 Prepaid Expenses
```

## 19.23 Accrued expense {#1923-accrued-expense}

``` text
Dr Expense GL
Cr Accrued Expense GL
```

Invoice later clears the accrual and records AP/tax.

## 19.24 Asset purchase {#1924-asset-purchase}

``` text
Dr Fixed Asset GL
Dr Input Tax GL
Cr 21000 Accounts Payable / Vendor SL
```

## 19.25 Depreciation {#1925-depreciation}

``` text
Dr Depreciation Expense GL
Cr Accumulated Depreciation GL
```

## 19.26 Asset disposal {#1926-asset-disposal}

``` text
Dr Bank/Cash — proceeds
Dr Accumulated Depreciation
Dr Loss on Disposal, if applicable
Cr Fixed Asset Cost
Cr Gain on Disposal, if applicable
```

------------------------------------------------------------------------

# 20. FINAL LEASE CLOSURE ENGINE {#20-final-lease-closure-engine}

The final closure process must be:

``` text
Termination Initiated
↓
Stop/Freeze New Billing
↓
Finance Pre-Check
↓
Outstanding Rent
↓
Outstanding Utilities
↓
Service/CAM/Other Charges
↓
Inspection
↓
Damage Assessment
↓
Approved Deductions
↓
Final Tenant Statement
↓
Apply Valid Advances
↓
Apply Security Deposits
↓
Create Residual AR if Deposit < Liability
↓
Calculate Refundable Deposit
↓
Return/Cancel Future PDCs
↓
Refund Remaining Deposits
↓
Reconcile AR
↓
Reconcile PDC
↓
Reconcile Deposit GL/SL
↓
Reconcile Bank/Cash
↓
Final Approval
↓
Lease Closed
↓
Unit Vacant
↓
Available / Maintenance
```

The system must not close a lease merely because the operational
move-out is complete. Finance closure is a separate controlled state.

------------------------------------------------------------------------

# 21. MANDATORY GLOBAL CONTROLS {#21-mandatory-global-controls}

1.  Every transaction line stores Type, Group, Class, GL, GL Name, SL
    and SL Name.
2.  Every control GL reconciles to its SLs.
3.  Every business event has an idempotency key.
4.  Every posting is atomic.
5.  Posted transactions are immutable.
6.  Corrections use reversal/credit/debit-note events.
7.  Refunds cannot exceed refundable balances.
8.  Deposit deductions cannot exceed available deposits.
9.  PDC state controls the permitted accounting event.
10. A cleared PDC reversal is never processed as a normal PDC return.
11. Replacement payment cannot settle the same invoice twice.
12. Security deposits never become revenue without an explicit approved
    release/reclassification event.
13. Tax is a separate accounting component.
14. AP invoice and payment are separate events.
15. Asset acquisition and depreciation are separate events.
16. Closed periods block normal posting.
17. Every sensitive transaction has maker/checker and audit trail.
18. Bank/cash/PDC/deposit reconciliation is required before period
    close.
19. Tenant, vendor, asset and deposit SLs must retain source-document
    references.
20. No application screen may directly create an accounting voucher
    bypassing the accounting event/rule engine.

------------------------------------------------------------------------

# 22. PRIORITY IMPLEMENTATION PLAN {#22-priority-implementation-plan}

## P0 --- Immediate {#p0--immediate}

1.  Formalize approved COA including 21500 and 21400 mappings.
2.  Implement exact Type/Group/Class/GL/SL resolution.
3.  Make deposit posting source-account driven.
4.  Separate 21500 Unit Security Deposit from 21100 refundable-deposit
    SLs.
5.  Fix PDC state-specific posting.
6.  Add post-clearance bank-reversal event.
7.  Add dishonour-charge event.
8.  Enforce atomic accounting posting.
9.  Enforce idempotency and concurrency locks.
10. Enforce GL/SL reconciliation.
11. Enforce early-termination PDC return.
12. Enforce final-settlement closure gate.

## P1

13. Tax engine.
14. AP/Procurement accounting.
15. Asset/CWIP/depreciation.
16. Bank reconciliation.
17. Month-end close.
18. Period lock.

## P2

19. Advanced dashboards.
20. Automated exception workflows.
21. Advanced management reporting.
22. Automated monitoring and notifications.

------------------------------------------------------------------------

# 23. FINAL VERDICT {#23-final-verdict}

### User\'s proposed PDC return

``` text
Customer(PDC)-Unit → Debit
PDC In Hand → Credit
```

**Approved for an unpresented PDC that remains physically in hand.**

### Unit Security Deposit {#unit-security-deposit}

``` text
21500
```

**Use for Unit Security Deposit only after its exact approved COA
hierarchy is formally established.**

### Other refundable deposits

``` text
21100
```

**Correct at GL level, but exact SL must be selected:**

``` text
21100001 Reservation Advance
21100002 Unclaimed Liability-Deposit
21100003 Qatar Cool Deposit - Tenant
21100004 Kahramaa Deposit - Tenant
21100005 Service Fee - Tenant
```

### Guarantee cheque {#guarantee-cheque}

``` text
21200 / 21200001
```

**Keep separate from ordinary PDC/rent collection.**

### Current implementation

**Directionally aligned but not production-complete.** The biggest
remaining issue is not simply debit/credit direction. The critical
requirement is that the accounting engine must resolve and persist the
exact **Group → Class → GL → SL** for every event and every reversal,
while the business transaction remains separately identifiable.

------------------------------------------------------------------------

# 24. DEFINITION OF DONE {#24-definition-of-done}

Finance is complete only when:

-   Tenant AR reconciles to GL.
-   Vendor AP reconciles to GL.
-   PDC register reconciles to PDC GL/SL.
-   Unit security deposits reconcile to 21500 SLs.
-   Other refundable deposits reconcile to 21100 SLs.
-   Guarantee cheques reconcile to 21200001.
-   Bank reconciles to bank GL.
-   Cash reconciles to cash GL.
-   Assets reconcile to fixed-asset GL.
-   Tax reconciles to tax GLs/register.
-   All posted events are immutable.
-   Reversals are separate accounting events.
-   Duplicate events are blocked.
-   Closed periods are protected.
-   Early termination returns/cancels future PDCs.
-   Final settlement is approved before lease closure.
-   Every transaction is traceable from operational source → accounting
    event → voucher → GL/SL → reconciliation/report.

------------------------------------------------------------------------

## Source/Implementation Notes

The Finance SRS establishes the required lease-to-finance lifecycle,
PDC/deposit controls, final settlement, future-PDC cancellation/return,
AP, assets, reconciliation and period close. The approved COA extract
provides the exact 12000, 12100, 12410, 12500, 12900, 21000, 21100 and
21200 hierarchy and SLs. The application audit shows current use of
21400 and 21500, PDC service functions, security-deposit service
functions, and the accounting-event/voucher posting architecture. These
current application mappings are therefore treated as **implementation
evidence requiring alignment**, not automatically as the final approved
accounting policy.
