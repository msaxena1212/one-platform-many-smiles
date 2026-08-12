**PROPERTY MANAGEMENT SYSTEM**

**FINANCE MODULE - END-TO-END FUNCTIONAL & SYSTEM REQUIREMENTS**

Billing • Receivables • Collections • PDC • Security Deposits • AP • Procurement • Assets • Reconciliation • Accounting

Version: 1.0

Status: Detailed Functional Specification / SRS Baseline

Prepared for: Real Estate Property Management System

Source process reference: Lease to Check Out Process Flow

Scope note: The attached process defines the lease lifecycle through reservation, tenant creation, document verification, lease creation/signature, collection of rent/PDC/security deposit, receipt generation, key handover, check-in, renewal, non-renewal, check-out and security-deposit settlement. This document extends the Finance module around those source-defined touchpoints and incorporates the additional finance, payment replacement, procurement and asset requirements discussed for the PMS.

# 1\. Purpose and Scope

The Finance Module shall be the financial control layer of the Property Management System. It shall convert lease obligations and procurement events into invoices, receipts, payment instruments, allocations, payables, assets, accounting entries, reconciliations and auditable settlement records.

The attached lease process explicitly places collection of advance rent, post-dated cheques, security deposit, agency commission, registration/administrative charges, utility deposit and other approved charges in the Finance Module. It also requires cheque details and statuses, separate security-deposit accounting, receipt generation, final tenant settlement and refund processing at check-out. fileciteturn0file0L88-L119

The Finance Module therefore covers the complete lifecycle from pre-lease billing and collection through active-lease billing, payment processing, PDC management, security-deposit management, procurement/AP, asset acquisition, reconciliation, month-end close and lease closure.

# 2\. Source-Aligned Lease-to-Finance Touchpoints

| **Lease Process Stage**                 | **Finance Responsibility**                                                                | **Key Output**                         |
| --------------------------------------- | ----------------------------------------------------------------------------------------- | -------------------------------------- |
| Unit Reservation                        | No financial posting; may capture proposed commercial terms for downstream billing.       | Commercial proposal / reservation data |
| Customer Creation                       | Establish tenant/customer financial profile and billing relationships.                    | Customer account                       |
| Document Verification                   | Validate security-deposit/payment requirements before collection.                         | Finance-ready tenant                   |
| Lease Agreement Creation                | Create billing schedule, rent, deposit, PDC requirements and charge rules.                | Lease financial schedule               |
| Tenant Signature                        | Prepare collection requirements.                                                          | Collection request                     |
| Collection of Rent/PDC/Security Deposit | Receive, validate and post cash/cheque/PDC/deposit/other charges.                         | Receipts and payment instruments       |
| Receipt Generation                      | Generate collection receipts by charge type.                                              | Receipt(s)                             |
| Landlord Signature                      | Finance package remains linked to lease execution.                                        | Complete financial/lease record        |
| Key Handover / Check-In                 | Confirm required financial conditions are met where configured.                           | Financial clearance                    |
| Renewal                                 | Generate revised billing schedule, collect new PDCs/payments and continue/adjust deposit. | Renewed financial schedule             |
| Non-Renewal / Check-Out                 | Confirm outstanding balances and calculate final settlement.                              | Final tenant statement                 |
| Deposit Settlement                      | Apply approved deductions, create refund or recovery.                                     | Settlement + refund/recovery           |
| Lease Closure                           | Close financial subledger only after settlement/reconciliation.                           | Closed lease financial record          |

# 3\. Finance Module Objectives

- Provide one source of truth for tenant, landlord/property, vendor and asset financial transactions.
- Generate invoices from approved lease billing schedules and approved procurement/vendor documents.
- Record cash, cheque, PDC, bank transfer, card, UPI and other configured payment methods.
- Maintain PDC lifecycle from receipt through deposit, clearing, return, replacement, cancellation, bounce and re-presentation.
- Support Cash Against Cheque/PDC and all payment replacement scenarios without deleting or overwriting the original instrument.
- Maintain security deposits separately from rental income and support receipt, adjustment, dispute, settlement and refund.
- Manage procurement-to-pay and asset acquisition-to-capitalization.
- Provide tenant and vendor ledgers, ageing, reconciliation and audit trails.
- Prevent duplicate financial settlement and unauthorized modification of posted transactions.
- Support configurable approvals, accounting periods, tax rules, currencies, properties, cost centres and legal entities.

# 4\. Finance Master Data

## 4.1 Required Masters

- Legal Entity
- Property
- Building / Block
- Unit
- Owner / Landlord
- Tenant / Customer
- Lease
- Vendor
- Bank Account
- Cashier / Cash Location
- Chart of Accounts
- Tax Codes
- Charge Types
- Payment Methods
- Payment Instrument Types
- Cost Centre
- Profit Centre
- Budget
- Asset Category
- Asset Location
- Depreciation Book / Policy
- Currency and Exchange Rate
- Approval Matrix
- Accounting Period
- Document Numbering

## 4.2 Customer/Tenant Financial Profile

The source document requires duplicate prevention using identifiers such as Qatar ID, passport number, Commercial Registration number, mobile number or email. fileciteturn0file0L20-L38 Finance shall reuse the same customer master and maintain the financial dimensions needed for billing and collection.

| **Field Group** | **Examples**                                                                       |
| --------------- | ---------------------------------------------------------------------------------- |
| Identity        | Customer ID, individual/company, Qatar ID/passport/CR                              |
| Billing         | Billing address, tax profile, currency, payment terms                              |
| Lease           | Lease ID, property, unit, owner, commencement/expiry                               |
| Financial       | AR account, deposit liability account, advance account, credit limit if applicable |
| Contacts        | Primary contact, email, mobile, authorized signatory                               |
| Documents       | Supporting documents, expiry dates                                                 |
| Controls        | Active/inactive, blocked, credit hold, notes                                       |

# 5\. Chart of Accounts & Accounting Dimensions

The Finance Module shall use a configurable Chart of Accounts. Exact account numbers shall be configured by the implementing entity's accounting policy.

| **Account Category** | **Illustrative Accounts**                                                         |
| -------------------- | --------------------------------------------------------------------------------- |
| Assets               | Cash, bank, accounts receivable, advances to vendors, fixed assets, CWIP          |
| Liabilities          | Security deposits, tenant advances, accounts payable, taxes payable               |
| Revenue              | Rent, CAM/service charges, parking, utilities, admin fees, other income           |
| Expenses             | Repairs, maintenance, utilities, cleaning, insurance, property operating expenses |
| Fixed Asset          | Buildings/improvements, equipment, furniture, IT, vehicles                        |
| Contra / Accumulated | Accumulated depreciation, allowances                                              |
| Gain/Loss            | Asset disposal gain/loss, FX gain/loss                                            |

Every posting should carry the required dimensions: legal entity, property, building, unit where relevant, owner where relevant, tenant/customer where relevant, lease, vendor, cost centre, profit centre, currency and source document.

# 6\. Lease Financial Setup

The source lease agreement includes rental amount/frequency, security deposit, number/value of PDCs, grace period, penalties, renewal terms and related commercial conditions. The system must generate a payment schedule for monthly, quarterly, semi-annual or annual frequency. fileciteturn0file0L58-L76

## 6.1 Lease Billing Schedule

| **Field**         | **Description**                                          |
| ----------------- | -------------------------------------------------------- |
| Lease             | Lease identifier                                         |
| Billing Frequency | Monthly / quarterly / semi-annual / annual / configured  |
| Period Start/End  | Billing coverage                                         |
| Due Date          | Contractual due date                                     |
| Rent              | Base rent                                                |
| CAM/Service       | Common-area or service charge if applicable              |
| Utilities         | Fixed/estimated/meter-based charge if configured         |
| Parking/Facility  | Additional recurring charges                             |
| Tax               | Calculated tax                                           |
| Discount          | Approved discount                                        |
| Net Amount        | Amount due                                               |
| Grace Period      | Days before penalty                                      |
| Penalty Rule      | Configured late fee/interest rule                        |
| Status            | Scheduled / Invoiced / Partially Paid / Paid / Cancelled |

## 6.2 Billing Generation

Approved Lease → Billing Schedule → Billing Run → Invoice Draft → Validation → Approval/Post → Tenant AR Ledger

## 6.3 Invoice Generation Rules

- Invoices must be generated from an approved lease schedule or approved manual billing request.
- The system shall prevent duplicate invoices for the same lease, billing period and charge unless an authorized adjustment/rebill flow is used.
- A posted invoice shall be immutable.
- Corrections shall use credit notes, debit notes, reversal/rebill or approved adjustment workflows.
- Invoice numbering must be unique by configured legal entity/series.
- Invoice status must reflect financial settlement separately from document status.

# 7\. Invoice Types

| **Invoice Type**           | **Purpose**                                   |
| -------------------------- | --------------------------------------------- |
| Rent Invoice               | Periodic lease rent                           |
| CAM / Service Invoice      | Common-area/service charges                   |
| Utility Invoice            | Utility recovery                              |
| Parking Invoice            | Parking or facility charges                   |
| Administrative Invoice     | Registration/admin charges                    |
| Agency/Commission Invoice  | Agency or commission charges where billed     |
| Damage/Maintenance Invoice | Approved tenant-recoverable charges           |
| Final Settlement Invoice   | Lease closure/final charges                   |
| Debit Note                 | Increase in amount due after original billing |
| Credit Note                | Reduction/reversal of amount due              |
| Manual Invoice             | Authorized exceptional billing                |

# 8\. Receivables & Tenant Ledger

The tenant ledger shall maintain all financial movements by tenant and lease. A payment instrument must not be treated as realized funds until the relevant realization criteria are satisfied.

| **Ledger Event** | **Debit/Credit Concept**                | **Examples**                |
| ---------------- | --------------------------------------- | --------------------------- |
| Invoice          | Increases receivable                    | Rent ₹100,000               |
| Credit Note      | Reduces receivable                      | Billing correction          |
| Payment Realized | Reduces receivable                      | Cash, cleared cheque, bank  |
| Advance          | Liability/credit balance                | Payment before invoice      |
| Deposit          | Separate deposit liability              | Security deposit            |
| Adjustment       | Controlled settlement                   | Approved deposit adjustment |
| Refund           | Reduces customer credit/deposit balance | Advance/deposit refund      |
| Write-off        | Controlled receivable reduction         | Approved bad debt           |

## 8.1 Ageing

- Current
- 1-30 days
- 31-60 days
- 61-90 days
- 91-180 days
- 181-365 days
- 365+ days

# 9\. Collections

## 9.1 Supported Payment Methods

- Cash
- Cheque
- Post-Dated Cheque (PDC)
- Bank Transfer
- UPI / Digital Payment
- Card
- Demand Draft
- Other configured method

## 9.2 Receipt Generation

The source process requires applicable collection receipts for rent, security deposit, agency commission, administrative charges and other collections. Each receipt should contain receipt number/date, tenant, property/unit, lease, payment type/method, cheque or transaction reference, amount, collection period and cashier details. fileciteturn0file0L120-L141

| **Receipt Field** | **Required**                |
| ----------------- | --------------------------- |
| Receipt Number    | Yes                         |
| Receipt Date      | Yes                         |
| Tenant            | Yes                         |
| Property / Unit   | Yes where applicable        |
| Lease             | Yes where applicable        |
| Payment Type      | Yes                         |
| Payment Method    | Yes                         |
| Reference         | Yes for cheque/bank/digital |
| Amount            | Yes                         |
| Allocation        | Yes where invoice-related   |
| Cashier/User      | Yes                         |
| Remarks           | Conditional                 |
| Attachments       | Conditional                 |

# 10\. Cash Management

## 10.1 Cash Receipt

Cash Collected → Receipt Created → Validation → Posting → Allocation → Cashier Till → Cash Reconciliation → Bank Deposit (if applicable)

## 10.2 Cash Controls

- Each cashier must have an assigned cash location/till where applicable.
- Opening cash, receipts, refunds and closing cash must be traceable.
- Cash overage and shortage must be recorded as reconciliation exceptions.
- Refunds from cash should require configured approval limits.
- A receipt cannot be deleted after posting.

# 11\. Cheque & PDC Management

The source process requires cheque number, bank, cheque date, amount, payer, lease, payment period and cheque status. The source status list includes Received, Deposited, Cleared, Returned, Replaced and Cancelled. fileciteturn0file0L100-L117

## 11.1 PDC Register

| **Field**             | **Description**                              |
| --------------------- | -------------------------------------------- |
| Instrument ID         | System-generated unique ID                   |
| Cheque Number         | Bank instrument number                       |
| Bank                  | Bank name                                    |
| Cheque Date           | Instrument date                              |
| Amount                | Face value                                   |
| Payer                 | Tenant/customer                              |
| Lease                 | Lease reference                              |
| Payment Period        | Rent/charge period                           |
| Invoice               | Optional at receipt; required when allocated |
| Received Date         | Date instrument was received                 |
| Status                | Lifecycle status                             |
| Presentation No.      | Attempt/re-presentation number               |
| Replacement Reference | Linked replacement transaction               |
| Return Reason         | If returned/bounced                          |
| Attachments           | Instrument copy/receipt                      |

## 11.2 PDC Lifecycle

Received  
→ Held  
→ Due for Deposit  
→ Deposited  
→ Clearing  
→ Cleared  
<br/>Alternative:  
Held → Returned  
Held → Cancelled  
Held → Replaced  
Deposited → Returned/Bounced → Re-presented

## 11.3 PDC Controls

- A PDC must not be considered bank-received cash merely because it is recorded.
- Cheque number/bank/payer validation should identify possible duplicates.
- Future-dated PDCs may remain unapplied until the target invoice exists.
- A PDC can be allocated to one or multiple invoices based on business rules.
- An invoice may have one or multiple PDCs.
- A PDC must never be deleted once posted; use cancellation/return/replacement.
- A cleared cheque cannot use the normal Cash Against Cheque workflow.

# 12\. Cash Against Cheque / PDC

This is a core requirement. A tenant may replace an existing cheque/PDC with cash before the original instrument is realized. The system must create a new cash receipt, link it to the original instrument, allocate the cash to the invoice and mark the original cheque as Returned/Cancelled/Replaced according to the physical disposition.

Invoice ₹100,000  
↓  
Cheque/PDC Received ₹100,000  
↓  
Tenant requests Cash Against Cheque  
↓  
Validate instrument + invoice + amount + status  
↓  
Create Cash Receipt ₹100,000  
↓  
Post Cash Receipt  
↓  
Allocate Cash to Invoice  
↓  
Return/Cancel Original Cheque  
↓  
Link Original ↔ Replacement  
↓  
Invoice Paid / Balance Updated  
↓  
Audit + Accounting

## 12.1 Golden Rule

Never overwrite the original cheque/PDC record. The invoice history must show the original instrument, its cancellation/return, the replacement cash receipt and the final allocation.

## 12.2 Transaction Safety

- The original instrument must be validated before replacement.
- The replacement amount must not exceed the instrument or allocation amount without explicit allocation of the excess.
- The original instrument should normally remain active until the replacement payment is successfully posted.
- If replacement posting fails, the original instrument must remain active.
- Concurrent processing of the same instrument must be prevented by record locking or equivalent control.

## 12.3 Example

| **Transaction**      | **Amount** | **Status**                  |
| -------------------- | ---------- | --------------------------- |
| Invoice INV-001      | ₹100,000   | Unpaid                      |
| Cheque CHQ-001       | ₹100,000   | Held                        |
| Cash Receipt RCT-001 | ₹100,000   | Posted & Allocated          |
| Cheque CHQ-001       | ₹100,000   | Returned - Replaced by Cash |
| Invoice INV-001      | ₹100,000   | Paid                        |

## 12.4 Edge Cases

- Cash amount less than cheque amount: retain remaining exposure or require replacement instrument per policy.
- Cash amount greater than cheque: allocate the excess to another invoice or advance only with explicit allocation.
- Cheque already deposited: block normal replacement and use withdrawal/reversal workflow.
- Cheque already cleared: treat as a separate payment/refund/reversal scenario, not Cash Against Cheque.
- Cheque already replaced: block second replacement.
- Cheque lost/stopped/stale: use the relevant controlled status and replacement flow.
- Partial replacement: maintain exact remaining exposure and physical instrument status.

# 13\. Payment Replacement Engine

Payment replacement shall be implemented as a generic capability rather than separate hard-coded flows.

| **Original** | **Replacement** | **Reason Examples**             |
| ------------ | --------------- | ------------------------------- |
| Cheque       | Cash            | Tenant requests cash settlement |
| PDC          | Cash            | Tenant requests cash settlement |
| Cheque       | Bank Transfer   | Electronic settlement           |
| PDC          | Bank Transfer   | Electronic settlement           |
| Cheque       | UPI             | Digital settlement              |
| PDC          | UPI             | Digital settlement              |
| Cheque       | New Cheque      | Instrument correction           |
| PDC          | New PDC         | Date/amount correction          |

## 13.1 Replacement Entity

| **Field**                  | **Description**                                               |
| -------------------------- | ------------------------------------------------------------- |
| Replacement ID             | Unique identifier                                             |
| Original Transaction ID    | Original receipt/instrument                                   |
| Replacement Transaction ID | New receipt/instrument                                        |
| Original Amount            | Original value                                                |
| Replacement Amount         | New payment value                                             |
| Reason                     | Mandatory reason                                              |
| Requested By               | User                                                          |
| Requested Date             | Timestamp                                                     |
| Approved By                | If required                                                   |
| Status                     | Requested / Approved / Posted / Completed / Failed / Rejected |
| Remarks                    | Free text                                                     |

# 14\. Payment Allocation

A payment is separate from allocation. The same receipt may be allocated to one or more invoices, or may remain unallocated/advance until the correct invoice is known.

| **Scenario**                    | **System Treatment**                                         |
| ------------------------------- | ------------------------------------------------------------ |
| One payment → one invoice       | Full or partial allocation                                   |
| One payment → multiple invoices | Multiple allocation lines                                    |
| Multiple payments → one invoice | Multiple receipts linked to same invoice                     |
| Payment before invoice          | Unallocated/advance                                          |
| Overpayment                     | Invoice balance + advance                                    |
| Wrong invoice                   | Reverse allocation + reallocate                              |
| Duplicate payment               | Second payment to advance/refund or block, based on approval |

# 15\. Security Deposit Management

The source process explicitly requires the security deposit to be recorded separately from rental income and linked to tenant and lease. At check-out, the system must calculate outstanding rent, maintenance/damage charges, utility charges, other deductions and the refundable balance, with refund after required approval. fileciteturn0file0L118-L119 fileciteturn0file0L277-L296

## 15.1 Deposit Lifecycle

Deposit Required  
→ Deposit Received  
→ Realized  
→ Held  
→ Adjustment Proposed  
→ Approved Adjustment  
→ Final Settlement  
→ Refund / Recovery  
→ Closed

## 15.2 Deposit Ledger

| **Event**           | **Effect**                                                      |
| ------------------- | --------------------------------------------------------------- |
| Deposit Receipt     | Increases refundable deposit liability                          |
| Approved Adjustment | Reduces refundable deposit balance                              |
| Refund              | Reduces deposit liability and cash/bank                         |
| Additional Deposit  | Increases deposit liability                                     |
| Transfer            | Moves deposit between permitted lease accounts with audit trail |
| Dispute             | Marks disputed amount without silently reducing balance         |

## 15.3 Deposit Edge Cases

- Partial deposit received.
- Deposit received by cheque/PDC and not yet realized.
- Deposit replaced from cheque to cash.
- Excess deposit.
- Deposit adjustment greater than available deposit.
- Tenant disputes damage deduction.
- Partial refund.
- Refund fails or is rejected by bank.
- Duplicate refund attempt.
- Tenant has multiple leases.
- Deposit transfer during unit/lease transfer.
- Lease terminated with future PDCs.

# 16\. Check-Out Final Financial Settlement

The source process requires Finance to confirm outstanding balances before check-out and then prepare the final tenant settlement after inspection. The settlement must include security deposit received, outstanding rent, maintenance/damage charges, utility charges, other deductions and refundable balance. fileciteturn0file0L250-L287

## 16.1 Settlement Formula

Refundable Deposit = Realized Security Deposit - Approved Deductions - Approved Outstanding Recoveries

If the result is positive, create a refund. If zero, close the deposit without refund. If negative, create a tenant receivable/recovery amount rather than creating a negative deposit balance.

## 16.2 Settlement Workflow

Lease Non-Renewal / Termination  
↓  
Finance Pre-Check  
↓  
Outstanding Rent / Charges  
↓  
Final Inspection  
↓  
Damage / Utility / Missing Item Assessment  
↓  
Approved Deductions  
↓  
Final Tenant Statement  
↓  
Tenant/Manager/Finance Approval  
↓  
Refund or Recovery  
↓  
Return/Cancel Future PDCs  
↓  
Final Reconciliation  
↓  
Lease Closed

# 17\. Renewal Finance

The source renewal process includes review of tenant documents, updated rent/terms, renewed lease agreement, tenant signature, collection of new PDCs/payments, adjustment or continuation of security deposit, receipt generation, landlord signature and activation of the renewed lease. fileciteturn0file0L234-L249

- Generate revised billing schedule.
- Calculate rent escalation or revised charges.
- Identify existing PDCs that remain applicable or require replacement.
- Calculate additional deposit requirement or deposit carry-forward.
- Generate renewal invoices/receipts.
- Maintain linkage between old and renewed lease.

# 18\. Accounts Payable

The Finance Module shall handle vendor invoices arising from property operations, procurement, maintenance, utilities, services and asset purchases.

## 18.1 AP Lifecycle

PR → RFQ → Quotation → Evaluation → PO → GRN/Service Receipt → Vendor Invoice → 3-Way Match → Approval → Payment → Reconciliation

## 18.2 Vendor Invoice

| **Field**           | **Description**                                               |
| ------------------- | ------------------------------------------------------------- |
| Vendor              | Supplier                                                      |
| Invoice Number      | Vendor invoice reference                                      |
| Invoice Date        | Vendor invoice date                                           |
| Due Date            | Payment due date                                              |
| PO                  | Purchase order reference                                      |
| GRN/Service Receipt | Receipt reference                                             |
| Currency            | Transaction currency                                          |
| Subtotal            | Before tax                                                    |
| Tax                 | Configured tax                                                |
| Total               | Gross invoice                                                 |
| Cost Centre         | Expense allocation                                            |
| Property/Unit       | Operational dimension                                         |
| Status              | Draft / Pending / Approved / Partially Paid / Paid / Disputed |

# 19\. Procurement-to-Pay

## 19.1 Purchase Requisition

1. Requester creates PR.
2. Select property/cost centre/category.
3. Enter quantity, estimated price, required date and justification.
4. System checks budget where configured.
5. Approval workflow runs.

## 19.2 RFQ & Quotation

- RFQ may be issued to one or multiple vendors.
- Vendor quotations are captured.
- Quotation comparison supports price, tax, lead time, warranty and commercial terms.
- Single-vendor procurement should require justification/approval if policy requires.
- Expired quotations must be flagged.

## 19.3 Purchase Order

- Approved quotation is converted to PO.
- PO contains vendor, items/services, quantities, price, tax, delivery, payment terms, property/cost centre and asset indicators.
- PO amendment must preserve original version and approval history.

## 19.4 GRN / Service Receipt

- Full receipt.
- Partial receipt.
- Over-receipt with tolerance/approval.
- Under-receipt.
- Damaged/rejected quantity.
- Wrong item/service discrepancy.

# 20\. Three-Way Match

For applicable procurement, the system should compare Purchase Order, Goods/Service Receipt and Vendor Invoice.

| **Dimension** | **Example**                        | **Action**        |
| ------------- | ---------------------------------- | ----------------- |
| Quantity      | PO 100 / GRN 95 / Invoice 100      | Flag mismatch     |
| Price         | PO ₹100 / Invoice ₹120             | Variance approval |
| Tax           | PO 18% / Invoice 12%               | Tax exception     |
| Vendor        | Invoice vendor differs from PO     | Block/exception   |
| Duplicate     | Same vendor invoice already posted | Block             |

# 21\. Vendor Payments

- Payment request must reference approved AP liability or approved vendor advance.
- Payment amount must not exceed available payable unless approved as advance/overpayment.
- Vendor bank-account changes require controlled verification and approval.
- Payment should carry property/cost centre dimensions where relevant.
- Payment must be reconciled with bank statement or cash record.

# 22\. Asset Procurement & Asset Management

The Finance Module shall connect procurement to the Asset Register for assets purchased for properties, offices, facilities, IT, furniture, equipment and other capitalizable categories.

## 22.1 Asset Acquisition Lifecycle

PR  
↓  
RFQ / Quotation  
↓  
PO  
↓  
GRN / Receipt  
↓  
Vendor Invoice  
↓  
Capitalization Assessment  
↓  
CWIP / Asset Under Construction (if applicable)  
↓  
Asset Creation  
↓  
Capitalization  
↓  
Placed in Service  
↓  
Depreciation  
↓  
Transfer / Maintenance / Impairment  
↓  
Disposal / Sale / Write-off

## 22.2 Asset Master

| **Field**              | **Description**                                          |
| ---------------------- | -------------------------------------------------------- |
| Asset ID               | Unique asset identifier                                  |
| Asset Category         | Equipment/furniture/IT/etc.                              |
| Description            | Asset description                                        |
| Serial Number          | Where applicable                                         |
| Tag Number             | Physical tag                                             |
| Purchase Date          | Acquisition date                                         |
| Capitalization Date    | Capitalized date                                         |
| Placed-in-Service Date | Ready-for-use date                                       |
| Cost                   | Capitalized cost                                         |
| Residual Value         | Configured residual value                                |
| Useful Life            | Configured useful life                                   |
| Depreciation Method    | Configured policy                                        |
| Property               | Asset location/property                                  |
| Unit/Area              | Physical placement where applicable                      |
| Custodian              | Responsible person/team                                  |
| Vendor                 | Source vendor                                            |
| PO/GRN/Invoice         | Procurement references                                   |
| Status                 | CWIP / Active / Transferred / Impaired / Disposed / Lost |

## 22.3 Capitalization Controls

- Prevent duplicate capitalization of the same procurement receipt/invoice.
- Support capitalization thresholds and configured componentization rules.
- Support CWIP for assets not yet ready for use.
- Separate eligible capitalizable costs from expenses according to configured accounting policy.
- Do not start depreciation before the configured placed-in-service/capitalization trigger.

# 23\. Depreciation

Depreciation shall be calculated using the configured depreciation method, useful life, residual value and placed-in-service rules. The system must support controlled adjustments rather than editing posted depreciation.

| **Scenario**                | **Expected Treatment**                       |
| --------------------------- | -------------------------------------------- |
| Normal monthly depreciation | Generate scheduled depreciation              |
| Mid-month capitalization    | Apply configured convention                  |
| Asset transfer              | Apply configured transfer convention         |
| Change in useful life       | Prospective/configured adjustment with audit |
| Impairment                  | Separate impairment event                    |
| Disposal                    | Stop depreciation and calculate gain/loss    |
| Partial disposal            | Reduce relevant asset component/value        |

# 24\. Asset Disposal / Write-Off

- Sale of asset.
- Scrapping.
- Loss/theft.
- Damage beyond repair.
- Replacement.
- Write-off under approved policy.

The disposal process must calculate carrying/book value, proceeds where applicable, accumulated depreciation and resulting gain/loss according to the configured accounting policy.

# 25\. Bank Reconciliation

## 25.1 Reconciliation Flow

Bank Statement Import → Transaction Matching → Auto-Match → Exception Queue → Manual Match/Adjustment → Reconciled → Period Close

## 25.2 Matching Rules

- Bank reference.
- Amount.
- Transaction date.
- Customer/vendor.
- Cheque number.
- Payment reference.
- Configured tolerance.

## 25.3 Exceptions

- Bank transaction with no PMS receipt.
- PMS receipt with no bank transaction.
- Duplicate bank transaction.
- Amount mismatch.
- Bank charges.
- Unknown receipt.
- Unknown payment.
- Stale/unpresented cheque.

# 26\. Cash Reconciliation

| **Item**              | **Formula / Logic**                                         |
| --------------------- | ----------------------------------------------------------- |
| Expected Closing Cash | Opening Cash + Cash Receipts - Cash Refunds - Cash Deposits |
| Actual Closing Cash   | Physical cash count                                         |
| Variance              | Actual - Expected                                           |
| Status                | Reconciled / Short / Excess / Pending Investigation         |

# 27\. PDC Reconciliation

- PDC register total.
- PDCs due for deposit.
- PDCs deposited.
- PDCs under clearing.
- PDCs cleared.
- PDCs returned/bounced.
- PDCs replaced.
- PDCs cancelled.
- PDCs still held.

# 28\. Security Deposit Reconciliation

The deposit subledger must reconcile tenant-level deposit balances to the relevant liability account and identify unmatched receipts, adjustments, refunds and transfers.

# 29\. General Ledger Integration

Every posted source transaction shall create or trigger accounting entries based on configured account mapping. The Finance Module should expose source-document drill-down from GL to subledger transaction and back.

| **Business Event**                           | **Illustrative Accounting Effect**                                                |
| -------------------------------------------- | --------------------------------------------------------------------------------- |
| Rent invoice                                 | Dr AR / Cr Rent Revenue (+ applicable tax accounts)                               |
| Cash rent receipt                            | Dr Cash / Cr AR                                                                   |
| Cleared bank receipt                         | Dr Bank / Cr AR                                                                   |
| Security deposit receipt                     | Dr Cash/Bank / Cr Security Deposit Liability                                      |
| Deposit refund                               | Dr Security Deposit Liability / Cr Cash/Bank                                      |
| Approved deposit deduction for tenant charge | Dr Deposit Liability / Cr relevant receivable/revenue/recovery account per policy |
| Vendor invoice                               | Dr Expense/Asset/CWIP / Cr AP                                                     |
| Vendor payment                               | Dr AP / Cr Bank/Cash                                                              |
| Asset capitalization                         | Dr Fixed Asset / Cr CWIP or relevant clearing account                             |
| Depreciation                                 | Dr Depreciation Expense / Cr Accumulated Depreciation                             |

The exact debit/credit mapping must be configured and approved by the accounting owner for the implementing entity.

# 30\. Credit Notes, Debit Notes & Adjustments

- Credit note for overbilling or approved reduction.
- Debit note for underbilling or approved additional charge.
- Adjustment for approved reconciliation differences.
- Reversal for erroneous posted transaction.
- Rebill after cancellation where legally/accountingly permitted.

# 31\. Refund Management

## 31.1 Refund Types

- Security deposit refund.
- Tenant advance refund.
- Overpayment refund.
- Duplicate payment refund.
- Other approved customer refund.

## 31.2 Refund Workflow

Refund Request → Validate Available Balance → Approval → Refund Payment → Reconciliation → Close Refund

## 31.3 Refund Controls

- Refund cannot exceed available refundable balance.
- A failed refund does not close the balance.
- Duplicate refund requests must be blocked/flagged.
- Refund must reference source deposit/payment/advance.
- High-value refunds require configured approval.

# 32\. Lease Termination & Financial Closure

Before check-out, Finance must confirm outstanding balances. After inspection, Finance calculates the final settlement. The source process explicitly requires final settlement and refund before lease closure. fileciteturn0file0L250-L296

| **Closure Check** | **Required Action**                     |
| ----------------- | --------------------------------------- |
| Outstanding rent  | Invoice / collect / approved settlement |
| Other charges     | Invoice or approved adjustment          |
| Utilities         | Final bill/clearance                    |
| Damage            | Approved recoverable charge             |
| Keys/access cards | Confirm return                          |
| Future PDCs       | Return/cancel/replace as required       |
| Security deposit  | Settle and refund/recover               |
| Advance balance   | Apply/refund                            |
| Final statement   | Generate and approve                    |
| Reconciliation    | Confirm subledgers                      |

# 33\. Lease Closure Status

Active  
→ Non-Renewal / Termination Initiated  
→ Financial Clearance Pending  
→ Inspection Pending  
→ Final Settlement Pending  
→ Refund / Recovery Pending  
→ Financially Settled  
→ Lease Closed

# 34\. Month-End Close

## 34.1 Pre-Close Checklist

- All billing runs completed.
- All posted invoices reviewed.
- AR ageing reviewed.
- Unallocated receipts reviewed.
- PDC register reconciled.
- Bank reconciliation completed.
- Cash reconciliation completed.
- Security deposits reconciled.
- AP invoices reviewed.
- Vendor advances reviewed.
- GRN-not-invoiced items reviewed.
- Invoice-not-received exceptions reviewed.
- Asset additions reconciled.
- Capitalization completed where applicable.
- Depreciation posted.
- Suspense accounts reviewed.
- Open refunds reviewed.
- Material exceptions approved/resolved.
- Period locked.

# 35\. Period Lock & Backdated Transactions

- Closed periods must block normal posting.
- Backdated entries require permission and reason.
- If a closed period must be corrected, use an approved adjustment/reversal process in the open period where appropriate.
- All period reopenings must be audited.

# 36\. Approval Matrix

| **Transaction**            | **Suggested Approval Control**            |
| -------------------------- | ----------------------------------------- |
| Manual invoice             | Finance approval                          |
| Credit/Debit note          | Finance manager or configured authority   |
| PDC cancellation           | Configured approval based on value/status |
| Payment replacement        | Approval based on value/risk              |
| Security deposit deduction | Property/Finance approval                 |
| Security deposit refund    | Finance approval                          |
| Vendor bank change         | Verification + approval                   |
| Vendor payment             | AP/Finance approval                       |
| PO                         | Budget/Procurement authority              |
| PO amendment               | Original/extended approval                |
| Asset capitalization       | Finance/Asset authority                   |
| Asset disposal             | Asset owner + Finance approval            |
| Write-off                  | Management approval based on threshold    |
| Backdated posting          | Finance controller/authorized role        |
| Period reopening           | Authorized finance administrator          |

# 37\. Roles & Responsibilities

| **Role**              | **Key Responsibilities**                                         |
| --------------------- | ---------------------------------------------------------------- |
| Cashier               | Cash/cheque/PDC receipt entry, receipt generation, cash controls |
| Finance Executive     | Invoice, allocation, reconciliation, deposit, refund processing  |
| Finance Manager       | Approvals, exceptions, adjustments, refunds, close               |
| Leasing               | Lease terms, billing triggers, renewal, termination initiation   |
| Property Manager      | Inspection, damage/utility inputs, check-in/check-out            |
| Procurement           | PR/RFQ/quotation/PO management                                   |
| Store/Warehouse       | GRN/receipt and asset handover inputs                            |
| Asset Manager         | Asset register, transfer, maintenance, disposal                  |
| AP Officer            | Vendor invoice and payment processing                            |
| Accountant/Controller | GL, accounting policies, period close, reconciliation            |
| Auditor               | Read-only audit and exception review                             |
| Admin                 | Master data and configuration under controlled permissions       |

# 38\. Security & Access Controls

- Role-based access control.
- Property-level access where required.
- Legal-entity-level access where required.
- Segregation of duties for receipt, approval, refund and reconciliation.
- Maker-checker for sensitive transactions.
- Audit trail for create/edit/approve/reject/post/reverse/cancel.
- Attachment and document access controls.
- Sensitive customer identifiers protected by role.

# 39\. Audit Trail

Every financial object must maintain an immutable audit trail.

| **Audit Field** | **Description**                              |
| --------------- | -------------------------------------------- |
| Event ID        | Unique event                                 |
| Entity          | Invoice/payment/PDC/deposit/etc.             |
| Entity ID       | Record reference                             |
| Action          | Create/Edit/Approve/Post/Reverse/Cancel/etc. |
| Old Value       | Before change where relevant                 |
| New Value       | After change where relevant                  |
| User            | Actor                                        |
| Timestamp       | System timestamp                             |
| Reason          | Mandatory for sensitive actions              |
| Approval        | Approver reference                           |
| IP/Device       | If required by security policy               |

# 40\. Notifications

The source process already requires lease expiry/renewal notifications and key issue notifications. fileciteturn0file0L157-L177 fileciteturn0file0L211-L228 Finance notifications should extend this model.

| **Event**                       | **Recipients / Audience**             | **Suggested Timing**       |
| ------------------------------- | ------------------------------------- | -------------------------- |
| Invoice generated               | Tenant / Finance                      | Immediately                |
| Invoice due                     | Tenant / Finance                      | Configured before due date |
| Payment received                | Tenant / Finance                      | Immediately                |
| PDC due for deposit             | Finance                               | Configured lead time       |
| PDC bounced                     | Finance / Leasing / Tenant            | Immediately                |
| PDC replacement                 | Finance / Leasing                     | Immediately                |
| Overdue invoice                 | Tenant / Leasing / Finance            | Configured cadence         |
| Refund approved                 | Tenant / Finance                      | Immediately                |
| Refund failed                   | Finance                               | Immediately                |
| Vendor invoice pending approval | Approver                              | Configured SLA             |
| PO/GRN/invoice mismatch         | Procurement / AP                      | Immediately                |
| Asset capitalization pending    | Asset / Finance                       | Configured SLA             |
| Lease expiry                    | Tenant / Leasing / Property / Finance | Per lease process          |
| Final settlement ready          | Tenant / Finance / Property           | Immediately                |

# 41\. Core Reports

- Tenant Statement.
- Tenant AR Ageing.
- Lease Billing Schedule.
- Invoice Register.
- Receipt Register.
- Cash Collection Report.
- Cheque Register.
- PDC Register.
- PDC Due for Deposit.
- PDC Clearing Report.
- PDC Bounce Report.
- PDC Replacement Report.
- Cash Against Cheque/PDC Report.
- Unallocated Receipts.
- Advance Balance Report.
- Security Deposit Register.
- Security Deposit Adjustment Report.
- Security Deposit Refund Register.
- Final Tenant Settlement Report.
- Vendor Ledger.
- AP Ageing.
- Vendor Advance Report.
- Procurement Spend Report.
- PO/GRN/Invoice Variance Report.
- Asset Register.
- Asset Additions.
- CWIP Report.
- Depreciation Report.
- Asset Transfer Report.
- Asset Disposal Report.
- Bank Reconciliation.
- Cash Reconciliation.
- GL.
- Trial Balance.
- Exception Register.
- Audit Log.

# 42\. Exception Dashboard

| **Category** | **Exceptions**                                                                |
| ------------ | ----------------------------------------------------------------------------- |
| Receivables  | Overdue, disputed, unallocated, overpayment, underpayment                     |
| PDC          | Due, unpresented, bounced, returned, lost, stopped, duplicate                 |
| Deposits     | Unrealized, disputed adjustment, refund overdue, mismatch                     |
| AP           | Invoice mismatch, duplicate, approval pending, payment overdue                |
| Procurement  | Budget exception, quotation expiry, PO variance, over-receipt                 |
| Assets       | Pending capitalization, duplicate serial, transfer mismatch, disposal pending |
| Bank         | Unmatched, duplicate, amount variance                                         |
| Cash         | Shortage, overage, pending deposit                                            |
| Period Close | Open exceptions preventing close                                              |

# 43\. Critical Edge Cases

| **Edge Case**                | **Expected Result**                                                |
| ---------------------------- | ------------------------------------------------------------------ |
| Cheque → Cash                | Cash posted; original cheque returned/cancelled; invoice allocated |
| PDC → Cash                   | Same replacement logic                                             |
| Cheque already deposited     | Block normal replacement; controlled withdrawal/reversal           |
| Cheque already cleared       | Separate reversal/refund/other payment workflow                    |
| Partial replacement          | Maintain remaining exposure accurately                             |
| Overpayment                  | Allocate due amount; excess becomes advance/refund                 |
| Payment before invoice       | Unallocated/advance                                                |
| Invoice paid then cancelled  | Reverse/unallocate first; then cancel/rebill                       |
| Deposit deduction > deposit  | Recoverable AR balance, not negative deposit                       |
| Refund > balance             | Hard block                                                         |
| Duplicate refund             | Hard block/exception                                               |
| Duplicate invoice            | Hard block                                                         |
| Duplicate vendor invoice     | Hard block/exception                                               |
| PO/GRN/Invoice mismatch      | Exception / approval                                               |
| Asset capitalized twice      | Hard block                                                         |
| Concurrent cheque processing | Lock instrument                                                    |
| Concurrent invoice payment   | Prevent double settlement                                          |
| Closed period posting        | Hard block unless controlled authorization                         |

# 44\. UAT Scenarios

1. 1\. Create monthly rent invoice.
2. 2\. Generate invoice for quarterly lease.
3. 3\. Receive full cash payment.
4. 4\. Receive partial cash payment.
5. 5\. Receive cheque.
6. 6\. Receive PDC.
7. 7\. Allocate one PDC to one invoice.
8. 8\. Allocate one PDC to multiple invoices.
9. 9\. Allocate multiple PDCs to one invoice.
10. 10\. Cash Against Cheque.
11. 11\. Cash Against PDC.
12. 12\. Cheque to bank replacement.
13. 13\. PDC to UPI replacement.
14. 14\. Cheque to new cheque replacement.
15. 15\. Partial replacement.
16. 16\. Cheque cancellation.
17. 17\. Cheque return.
18. 18\. PDC deposit.
19. 19\. PDC clearing.
20. 20\. PDC bounce.
21. 21\. PDC re-presentation.
22. 22\. PDC lost.
23. 23\. PDC stopped.
24. 24\. Duplicate PDC.
25. 25\. Overpayment.
26. 26\. Underpayment.
27. 27\. Payment before invoice.
28. 28\. Unallocated payment.
29. 29\. Wrong invoice allocation and correction.
30. 30\. Payment reversal.
31. 31\. Refund.
32. 32\. Security deposit by cash.
33. 33\. Security deposit by cheque.
34. 34\. Security deposit by PDC.
35. 35\. Partial security deposit.
36. 36\. Security deposit adjustment.
37. 37\. Disputed security deposit deduction.
38. 38\. Partial security deposit refund.
39. 39\. Refund failure.
40. 40\. Lease termination settlement.
41. 41\. Future PDC cancellation at checkout.
42. 42\. Advance settlement at checkout.
43. 43\. Procurement PR to PO.
44. 44\. Partial GRN.
45. 45\. Over-receipt.
46. 46\. Three-way match.
47. 47\. Vendor invoice mismatch.
48. 48\. Vendor payment.
49. 49\. Asset purchase.
50. 50\. Asset capitalization.
51. 51\. CWIP.
52. 52\. Depreciation.
53. 53\. Asset transfer.
54. 54\. Asset disposal.
55. 55\. Bank reconciliation.
56. 56\. Cash reconciliation.
57. 57\. PDC reconciliation.
58. 58\. Security deposit reconciliation.
59. 59\. Month-end close.
60. 60\. Period lock.
61. 61\. Audit trail validation.

# 45\. Non-Functional Requirements

- Reliability: posted financial transactions must be durable and recoverable.
- Auditability: all sensitive events must be traceable.
- Concurrency: financial instruments and invoices must be protected from double processing.
- Performance: standard list/search screens should support configured operational volumes without excessive latency.
- Security: financial data and customer documents must be role-controlled.
- Availability: finance operations should follow the platform's defined availability SLA.
- Scalability: support multiple properties, entities, currencies, banks, cash locations and users.
- Configurability: approval thresholds, numbering, tax, payment methods, charge types and accounting mappings should be configurable.
- Integration: support bank statements, payment gateways, ERP/GL and document systems where applicable.
- Data retention: preserve transaction, audit and document history according to organizational/legal retention requirements.

# 46\. Recommended Data Model

LEGAL_ENTITY  
PROPERTY  
BUILDING  
UNIT  
OWNER  
CUSTOMER / TENANT  
LEASE  
LEASE_BILLING_SCHEDULE  
INVOICE  
INVOICE_LINE  
CREDIT_NOTE  
DEBIT_NOTE  
RECEIPT  
RECEIPT_ALLOCATION  
PAYMENT_INSTRUMENT  
PDC_PRESENTATION  
PAYMENT_REPLACEMENT  
REFUND  
SECURITY_DEPOSIT  
SECURITY_DEPOSIT_TRANSACTION  
SETTLEMENT  
VENDOR  
PURCHASE_REQUISITION  
RFQ  
VENDOR_QUOTATION  
PURCHASE_ORDER  
GRN / SERVICE_RECEIPT  
VENDOR_INVOICE  
VENDOR_PAYMENT  
ASSET  
ASSET_TRANSACTION  
DEPRECIATION  
BANK_ACCOUNT  
BANK_STATEMENT  
BANK_RECONCILIATION  
CASH_TILL  
CASH_RECONCILIATION  
JOURNAL  
JOURNAL_LINE  
CHART_OF_ACCOUNT  
COST_CENTRE  
PROFIT_CENTRE  
ACCOUNTING_PERIOD  
APPROVAL  
AUDIT_EVENT  
ATTACHMENT

# 47\. Recommended Status Matrix

| **Entity**          | **Statuses**                                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Invoice             | Draft, Pending Approval, Posted, Partially Paid, Paid, Disputed, Cancelled, Reversed                                             |
| Receipt             | Draft, Pending Approval, Posted, Allocated, Partially Allocated, Reversed, Cancelled                                             |
| Cheque/PDC          | Received, Held, Due, Deposited, Clearing, Cleared, Returned, Bounced, Replaced, Cancelled, Lost, Stopped, Expired                |
| Replacement         | Requested, Pending Approval, Approved, Processing, Posted, Completed, Failed, Rejected                                           |
| Deposit             | Required, Partially Received, Received, Realized, Held, Partially Adjusted, Adjusted, Refund Pending, Refunded, Closed, Disputed |
| Refund              | Draft, Pending Approval, Approved, Processing, Paid, Failed, Cancelled                                                           |
| Vendor Invoice      | Draft, Pending Match, Pending Approval, Approved, Partially Paid, Paid, Disputed, Rejected, Cancelled                            |
| PO                  | Draft, Pending Approval, Approved, Partially Received, Received, Closed, Cancelled, Amended                                      |
| GRN                 | Draft, Posted, Partial, Complete, Rejected, Cancelled                                                                            |
| Asset               | Draft, CWIP, Active, Transferred, Impaired, Lost, Disposed, Written Off                                                          |
| Bank Reconciliation | Open, Partially Reconciled, Reconciled, Exception                                                                                |
| Lease Finance       | Pending Collection, Collection Partial, Collection Complete, Active, Final Settlement Pending, Settled, Closed                   |

# 48\. End-to-End Finance Flow

RESERVATION  
↓  
CUSTOMER MASTER  
↓  
DOCUMENT VERIFICATION  
↓  
LEASE CREATION  
↓  
BILLING SCHEDULE  
↓  
TENANT SIGNATURE  
↓  
INITIAL COLLECTION  
├── Advance Rent  
├── Security Deposit  
├── PDC/Cheques  
├── Agency Commission  
├── Admin Charges  
├── Utility Deposit  
└── Other Charges  
↓  
RECEIPTS + PAYMENT INSTRUMENTS  
↓  
LEASE ACTIVATION / KEY HANDOVER  
↓  
MONTHLY / PERIODIC BILLING  
↓  
INVOICE  
↓  
COLLECTION  
├── Cash  
├── Bank  
├── Cheque  
├── PDC  
└── Digital  
↓  
ALLOCATION  
↓  
RECONCILIATION  
↓  
RENEWAL OR CHECKOUT  
├── Renewal → New Billing/PDC/Deposit  
│  
└── Checkout  
↓  
Final Inspection  
↓  
Final Charges  
↓  
Deposit Adjustment  
↓  
Final Statement  
↓  
Refund / Recovery  
↓  
Future PDC Return/Cancellation  
↓  
Financial Settlement  
↓  
Lease Closed  
↓  
PROCUREMENT (parallel operational stream)  
↓  
PR → RFQ → PO → GRN → AP Invoice → Payment  
↓  
ASSET ACQUISITION  
↓  
CWIP / CAPITALIZATION  
↓  
DEPRECIATION / TRANSFER / DISPOSAL  
↓  
MONTH-END CLOSE  
↓  
GL / RECONCILIATION / REPORTING / AUDIT

# 49\. Golden Rules for Implementation

1. 1\. Never delete posted financial transactions.
2. 2\. Never overwrite a payment instrument to hide its history.
3. 3\. Separate payment receipt from payment realization.
4. 4\. Separate payment from allocation.
5. 5\. Keep security deposits separate from rental income.
6. 6\. Use replacement transactions for Cheque/PDC → Cash/Bank/UPI.
7. 7\. Do not cancel an original instrument until the replacement payment is safely posted, unless the configured process explicitly requires a different order.
8. 8\. Never let a cleared cheque go through the normal Cash Against Cheque workflow.
9. 9\. Prevent duplicate settlement through transaction locking and allocation validation.
10. 10\. Use credit/debit notes or reversal/rebill instead of editing posted invoices.
11. 11\. Refunds must never exceed available refundable balances.
12. 12\. Deposit deductions must be approved and traceable.
13. 13\. Procurement must preserve PR → RFQ → PO → GRN → Invoice → Payment traceability.
14. 14\. Asset records must preserve procurement lineage.
15. 15\. Every sensitive transaction must have an audit trail.
16. 16\. Closed accounting periods must be protected.
17. 17\. All subledgers must reconcile to the General Ledger.

# 50\. Traceability to the Attached Lease Process

The following requirements are directly grounded in the uploaded Lease to Check Out Process Flow: unit reservation and lease preparation; customer master and duplicate prevention; mandatory document verification; lease financial terms and payment schedule; collection of advance rent, PDCs, security deposit and other charges; cheque details and statuses; separate security-deposit recording; receipt generation; landlord signature package; key issue controls; renewal collections and deposit continuation/adjustment; non-renewal/check-out financial clearance; final settlement and security-deposit refund; and retention of complete lease history for audit. fileciteturn0file0L2-L19 fileciteturn0file0L20-L57 fileciteturn0file0L58-L87 fileciteturn0file0L88-L156 fileciteturn0file0L157-L210 fileciteturn0file0L211-L249 fileciteturn0file0L250-L296

The additional payment-replacement, procurement, AP, asset, reconciliation, accounting-control, edge-case and UAT requirements in this document are an expanded Finance-module specification based on the finance requirements provided in the conversation. They are not presented as statements contained in the uploaded source document.

# 51\. Implementation Phasing

| **Phase** | **Scope**                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------- |
| Phase 1   | Customer financial profile, lease billing schedule, invoices, receipts, cash, cheque/PDC, tenant ledger |
| Phase 2   | PDC presentation/clearing/bounce, payment replacement, allocation, refunds, security deposit settlement |
| Phase 3   | AP, procurement, vendor invoice, three-way match, vendor payments                                       |
| Phase 4   | Asset register, capitalization, CWIP, depreciation, transfers, disposal                                 |
| Phase 5   | Bank/cash/PDC/deposit reconciliation, GL integration, close, advanced reports                           |
| Phase 6   | Advanced automation, integrations, dashboards, exception intelligence                                   |

# 52\. Definition of Done for Finance Module

- All source lease-to-finance touchpoints are implemented.
- Every invoice can be traced to its lease/billing source.
- Every receipt can be traced to its source and allocation.
- Every cheque/PDC has a complete lifecycle.
- Cash Against Cheque/PDC is fully auditable.
- Security deposit balances reconcile from receipt through final refund/adjustment.
- Procurement-to-pay has full traceability.
- Assets can be traced to procurement and accounting.
- Bank/cash/PDC/deposit subledgers reconcile.
- Posted transactions are immutable.
- Approvals and segregation of duties are enforced.
- Month-end close and period lock are operational.
- All critical UAT scenarios pass.

# Appendix A - Example Cash Against Cheque Transaction

| **Object**          | **Reference**  | **Amount**    | **Status**          |
| ------------------- | -------------- | ------------- | ------------------- |
| Lease               | LEASE-001      | \-            | Active              |
| Invoice             | INV-2026-001   | 100,000       | Paid                |
| Original Cheque     | CHQ-123456     | 100,000       | Returned - Replaced |
| Replacement Receipt | RCT-CASH-00045 | 100,000       | Posted & Allocated  |
| Payment Replacement | PR-00001       | 100,000       | Completed           |
| Tenant Ledger       | TEN-001        | 0 Outstanding | Settled             |

Audit narrative: On the replacement date, the tenant's existing cheque was replaced by a cash payment. The system retained the original cheque record, marked it Returned/Cancelled according to physical disposition, created a separate cash receipt, allocated the cash to the invoice, updated the tenant ledger and generated the corresponding accounting/audit events.

# Appendix B - Example Check-Out Settlement

| **Component**             | **Amount** |
| ------------------------- | ---------- |
| Security Deposit Received | 500,000    |
| Outstanding Rent          | (100,000)  |
| Approved Damage Charges   | (50,000)   |
| Utility Charges           | (20,000)   |
| Other Approved Deductions | (10,000)   |
| Refundable Balance        | 320,000    |

The above is an illustrative calculation only. Actual accounting and tax treatment must follow the applicable lease terms and accounting policy.

# Appendix C - Finance Module Screen Inventory

- Finance Dashboard
- Customer/Tenant Financial Profile
- Lease Billing Schedule
- Billing Run
- Invoice List
- Invoice View
- Credit Note
- Debit Note
- Receipt Entry
- Receipt List
- Payment Allocation
- Unallocated Receipts
- Cashier Till
- Cash Reconciliation
- Cheque Register
- PDC Register
- PDC Presentation
- PDC Bounce/Return
- Payment Replacement
- Cash Against Cheque/PDC
- Security Deposit Register
- Security Deposit Adjustment
- Final Settlement
- Refund Request
- Vendor Master
- PR
- RFQ
- Quotation Comparison
- PO
- GRN
- Vendor Invoice
- AP Payment
- Vendor Ledger
- Asset Register
- Asset Capitalization
- CWIP
- Depreciation
- Asset Transfer
- Asset Disposal
- Bank Reconciliation
- General Ledger
- Trial Balance
- Period Close
- Exception Dashboard
- Audit Log