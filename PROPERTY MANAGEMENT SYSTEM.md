# PROPERTY MANAGEMENT SYSTEM
# Consolidated Finance, Billing, Collections, PDC, Security Deposit, Procurement & Asset Management
## Detailed Functional Specification with Edge Cases

**Version:** 1.1  
**Status:** Implementation Baseline  
**Domain:** Real Estate / Property Management  
**Primary Modules:**

- Property
- Unit
- Tenant
- Lease
- Billing
- Invoice
- Receivables
- Collections
- Cheque/PDC
- Security Deposit
- Procurement
- Accounts Payable
- Asset Management
- Reconciliation
- Accounting
- Reporting
- Audit

---

## Finance
The Finance module serves as the central nervous system for all monetary transactions, accounting entries, and financial reporting within the Property Management System. It ensures strict adherence to double-entry accounting principles while providing comprehensive audit trails for every financial operation.

### Core Responsibilities
- **Ledger Management**: Maintains General Ledger, Sub-Ledgers (AP, AR, Fixed Assets, Security Deposits)
- **Transaction Processing**: Handles all incoming/outgoing payments, receipts, refunds, and adjustments
- **Reconciliation Engine**: Automates bank reconciliations, cash applications, and interaccount transfers
- **Financial Reporting**: Generates balance sheets, income statements, cash flow statements, and custom financial reports
- **Audit Trail**: Preserves immutable records of all transactions with references to source documents

### Key Financial Operations
- **Payment Allocation**: Distributes payments across multiple invoices or cost centers
- **Accrual Accounting**: Recognizes revenue and expenses based on usage, not cash flow
- **Depreciation & Amortization**: Manages asset depreciation schedules and methods
- **Budget Variance Analysis**: Compares actuals against budgeted figures with variance reporting
- **Bank Reconciliation**: Automates matching of bank statements with system entries

### Financial Controls
- **Transaction Immutability**: Prevents deletion/modification of posted transactions
- **Segregation of Duties**: Enforces role-based access controls for financial operations
- **Approval Workflows**: Requires multi-level approvals for high-value transactions
- **Audit Trails**: Maintains complete history of all changes with user, timestamp, and reason

---

## Billing
The Billing module automates the generation, validation, and management of tenant billing cycles, ensuring accurate and timely fee assessment while supporting complex billing scenarios.

### Billing Features
- **Automated Invoice Generation**: Creates invoices based on lease terms, meter readings, and service usage
- **Proration Logic**: Handles move-in/out mid-period billing with configurable proration rules
- **Recurring Billing**: Supports monthly, quarterly, annual billing cycles with auto-generation
- **Late Fee Calculation**: Applies late fees based on configurable grace periods and rate structures
- **Multi-Currency Support**: Handles foreign currency invoices with real-time exchange rates
- **Tax Calculation**: Integrates tax rules for different jurisdictions (GST, VAT, etc.)

### Advanced Billing Scenarios
- **Utility Billing**: Tracks consumption (electricity, water, gas) with tiered pricing
- **Common Area Maintenance (CAM)**: Calculates shared expense allocations
- **Variable Rate Billing**: Adjusts rates based on usage thresholds or seasonal patterns
- **Installment Plans**: Supports partial payments toward large balances
- **Billing Disputes**: Workflow for handling tenant challenges to billing amounts

---

## Collections
The Collections module manages the full lifecycle of tenant receivables, from initial billing to final settlement, ensuring robust cash flow monitoring and recovery processes.

### Collection Stages
- **Receivable Tracking**: Monitors outstanding balances by tenant, property, and lease
- **Payment Application**: Allocates payments to specific invoices or receivables
- **Dunning Management**: Implements escalating reminders with configurable warning thresholds
- **Payment Allocation Rules**: Supports prioritization rules for multiple outstanding items
- **Write-off Management**: Handles bad debt write-offs with approval workflows

### Collection Tools
- **Payment Portal**: Online interface for tenants to view statements and pay
- **Auto-Reminders**: Scheduled email/SMS reminders based on due dates
- **Installment Plans**: Configurable repayment schedules for outstanding balances
- **Dispute Resolution**: Workflow for handling billing disputes with document attachment
- **Reconciliation Engine**: Matches payments against invoices with exception handling

### Collection Scenarios
- **Partial Payments**: Handles payments that don't fully cover outstanding balances
- **Overpayments**: Manages excess payments as advances or refunds
- **Underpayments**: Flags shortfalls for follow-up
- **Payment Holds**: Temporarily suspends collection activity for disputed items
- **Portfolio Recovery**: Manages aged receivables with custom collection strategies

---

## PDC (Post-Dated Cheques)
The PDC module provides specialized handling for post-dated cheques and payment instruments, supporting complex replacement scenarios while maintaining complete transaction integrity.

### PDC Management Features
- **Instrument Tracking**: Records cheque numbers, banks, amounts, and maturity dates
- **Presentment Workflow**: Manages cheque processing stages (received → cleared → honored)
- **Replacement Management**: Handles scenarios where PDCs are replaced due to date changes, amount adjustments, or cancellations
- **Exception Handling**: Flags potential issues (early presentment, stopped cheques, duplicate numbers)
- **Audit Trail**: Preserves complete history of PDC lifecycle events

### PDC Replacement Logic
Supports multiple replacement patterns:
- **Date Adjustment**: Changing maturity date while retaining same amount
- **Amount Adjustment**: Modifying payment amount with or without date change
- **Instrument Swap**: Replacing bounced/stopped cheques with new instruments
- **Distribution Mapping**: Allocating single PDC across multiple invoices
- **Multi-Instrument Consolidation**: Combining multiple small PDCs into one larger payment

### PDC Edge Cases
- **Partial Cash Application**: Handling scenarios where cash covers part of PDC exposure
- **Overpayment Handling**: Managing excess cash against PDC obligations
- **Failed Presentment**: Automatic transition to alternative payment methods
- **Re-ceiling Logic**: Tracking successive replacement attempts with escalation rules

---

## Security Deposit
The Security Deposit module provides comprehensive management of tenant security deposits, ensuring proper liability tracking, adjustment capabilities, and compliant refund processes.

### Deposit Lifecycle
- **Requirement Definition**: Establishes minimum deposit amounts based on property/lease terms
- **Collection Process**: Records deposits via various instruments (cash, cheque, PDC)
- **Liability Accounting**: Maintains separate tracking of deposit balances per tenant/property
- **Adjustment Workflow**: Handles tenant-initiated adjustments (increases/decreases)
- **Refund Process**: Manages move-out inspections, damage assessments, and refund disbursement

### Deposit Edge Cases
- **Partial Refunds**: Refund only portion while maintaining remaining balance
- **Over-Refund Prevention**: Blocks refunds exceeding available deposit balance
- **Disputed Deductions**: Workflow for handling tenant challenges to deposit claims
- **Multi-Tenant Deposits**: Tracks individual tenant balances in shared properties
- **Interest Calculation**: Applies statutory interest on held deposits where required

### Security Deposit Adjustments
- **Deficit Handling**: When damages exceed deposit, creates recoverable receivable
- **Excess Refunds**: Prevents issuing refunds beyond available deposit balance
- **Adjustment Approvals**: Requires configurable approval workflows for changes
- **Audit Trail**: Preserves rationale for all deposit adjustments

---

## Procurement
The Procurement module streamlines acquisition processes from requisition to payment, ensuring compliance with budgetary controls and vendor management policies.

### Procurement Workflow
- **Requisition Creation**: Captures departmental requests with item details and justification
- **Budget Validation**: Enforces spending limits before approving requisitions
- **RFQ/RFP Process**: Supports tender issuance with vendor response tracking
- **Quotation Comparison**: Evaluates multiple vendor submissions with scoring criteria
- **Purchase Order Generation**: Converts approved requisitions into formal PO documents
- **Goods Receipt Note (GRN)**: Validates physical receipt against PO quantities
- **Three-Way Match**: Automatically matches PO, GRN, and vendor invoice

### Procurement Controls
- **Approval Hierarchies**: Configurable multi-level approval workflows
- **Budget Consumption**: Real-time tracking against allocated budgets
- **Vendor Management**: Maintains vendor master with performance metrics
- **Purchase Requisition Status**: Tracks from draft to approved to closed
- **Exception Reporting**: Flags unauthorized or out-of-budget attempts

### Procurement Edge Cases
- **Budget Override**: Requires special authorization for exceeding limits
- **Budget Re-forecasting**: Adjusts allocations mid-cycle with documentation
- **Emergency Purchases**: Fast-track workflow for urgent needs with audit trail
- **Single Source Justification**: Documents rationale for non-competitive procurement
- **Procurement Audits**: Maintains complete trail of all approvals and exceptions

---

## Asset Management
The Asset Management module oversees the entire lifecycle of physical assets from acquisition to disposal, ensuring accurate valuation, depreciation, and compliance with accounting standards.

### Asset Lifecycle Management
- **Asset Register**: Central database of all owned/managed assets with unique identifiers
- **Acquisition Recording**: Captures purchase cost, date, and vendor details
- **Depreciation Scheduling**: Applies configurable depreciation methods and rates
- **Capitalization Rules**: Determines threshold for asset capitalization vs. expense
- **Maintenance Tracking**: Records service events, repairs, and associated costs
- **Transfer Processes**: Documents movement between properties/units with valuation impact

### Asset Operations
- **Condition Monitoring**: Tracks maintenance history and condition assessments
- **Warranty Management**: Tracks warranty periods and claims processing
- **Impairment Testing**: Evaluates asset value reductions requiring accounting adjustments
- **Disposal Procedures**: Manages asset retirement with gain/loss recognition
- **Replacement Logic**: Supports asset swaps with proper accounting treatment

### Asset Edge Cases
- **Componentization**: Handles assets with multiple replaceable parts
- **Mid-Life Upgrades**: Capitalizes upgrades that extend useful life
- **Partial Disposals**: Records gain/loss on portion of asset disposed
- **Leasehold Improvements**: Tracks tenant-owned assets with special accounting
- **Asset Transfers**: Documents movement between cost centers with valuation adjustments

---

# 1. CORE DESIGN PRINCIPLE

The system must distinguish between:

1. **Commercial obligation**
2. **Invoice**
3. **Payment**
4. **Payment instrument**
5. **Payment realization**
6. **Payment allocation**
7. **Adjustment**
8. **Reversal**
9. **Refund**
10. **Accounting entry**

These must not be represented by a single transaction record.

For example:

```text
Invoice
₹100,000
   ↓
Cheque Received
₹100,000
   ↓
Cheque Cancelled
   ↓
Cash Received
₹100,000
   ↓
Cash Allocated
   ↓
Invoice Paid
```

The cheque should remain in history even though it no longer contributes to the settlement.

---

# 2. FINANCIAL TRANSACTION IMMUTABILITY

Once a financial transaction is posted:

### DO NOT:

- Delete it.
- Overwrite the amount.
- Change the payment mode without history.
- Change the customer silently.
- Change the invoice reference without audit.
- Change the accounting date without authorization.

### Instead use:

- Reversal
- Cancellation
- Replacement
- Adjustment
- Credit Note
- Debit Note
- Refund
- Reallocation

---

# 3. UNIVERSAL TRANSACTION RELATIONSHIP

Every financial transaction should support:

```text
Source Document
      ↓
Original Transaction
      ↓
Related Transaction
      ↓
Replacement / Adjustment / Reversal
      ↓
Accounting Entry
      ↓
Reconciliation
```

Every related transaction must retain:

- Original Transaction ID
- Parent Transaction ID
- Related Transaction ID
- Reason
- User
- Date/time
- Approval
- Supporting document

---

# 4. EDGE CASE CATEGORY 1
# CHEQUE / PDC → CASH

## Scenario

Invoice:

₹100,000

Cheque:

₹100,000

Tenant later pays:

₹100,000 Cash

### Correct process

```text
Cheque Received
      ↓
Cash Against Cheque
      ↓
Cheque Returned/Cancelled
      ↓
Cash Receipt Created
      ↓
Cash Allocated
      ↓
Invoice Paid
```

### Important

The invoice must retain:

- Original cheque
- Cheque cancellation
- Cash receipt
- Cash allocation

Do not simply change:

`Payment Mode = Cheque`

to:

`Payment Mode = Cash`

---

# 5. CHEQUE → BANK TRANSFER

Tenant provides cheque for ₹100,000.

Later pays through bank transfer.

System:

1. Verify cheque is not cleared.
2. Create bank receipt.
3. Link bank receipt to cheque.
4. Mark cheque `Replaced by Bank Transfer`.
5. Return/cancel cheque.
6. Allocate bank receipt.
7. Invoice becomes paid.

---

# 6. CHEQUE → UPI

Same logic:

```text
Cheque
 ₹100K
  ↓
UPI Payment
 ₹100K
  ↓
Cheque Returned
  ↓
UPI Receipt Allocated
```

---

# 7. CHEQUE → NEW CHEQUE

Original cheque:

₹100,000

Tenant provides new cheque:

₹100,000

Original:

`Returned / Replaced`

New:

`Received`

Relationship:

```text
CHQ-001
₹100K
   ↓
Replaced By
   ↓
CHQ-002
₹100K
```

The system must retain both instruments.

---

# 8. PDC → NEW PDC

Example:

Original PDC date:

01-Sep

Tenant requests new cheque date:

15-Sep.

System:

- Old PDC = Replaced
- New PDC = Active
- Same invoice
- Replacement reason = Date Change
- Approval required if configured

---

# 9. PARTIAL CASH AGAINST PDC

PDC:

₹100,000

Cash:

₹60,000

Remaining:

₹40,000

System should support two configurations.

### Option A — Partial Replacement

PDC exposure becomes ₹40,000.

### Option B — Full Replacement

Original PDC is returned.

New PDC:

₹40,000

Recommended:

**Option B**, because the physical instrument then exactly matches the remaining exposure.

---

# 10. CASH EXCEEDS CHEQUE

Cheque:

₹100,000

Cash:

₹120,000

System must not automatically treat ₹120,000 as replacement of the cheque.

Possible handling:

₹100,000 → Original invoice

₹20,000 → Another outstanding invoice / advance

The user must explicitly allocate the excess.

---

# 11. CASH LESS THAN CHEQUE

Cheque:

₹100,000

Cash:

₹80,000

Remaining:

₹20,000

System should ask:

> What should happen to the remaining ₹20,000 instrument exposure?

Options:

- Retain cheque for ₹20,000 exposure
- Return original cheque and create new ₹20,000 cheque
- Record remaining amount as outstanding

---

# 12. CHEQUE ALREADY DEPOSITED

Tenant asks to pay cash after cheque has been deposited.

The system must NOT allow normal "Cash Against Cheque."

Status:

`Deposited`

System message:

> "Cheque has already been deposited. Use the Cheque Withdrawal/Reversal workflow."

---

# 13. CHEQUE ALREADY CLEARED

Cheque:

`Cleared`

Tenant wants to pay cash.

This is no longer a replacement transaction.

The system must treat it as:

**Existing payment already realized + new cash transaction**

Possible business actions:

- Refund original payment
- Apply cash to another invoice
- Record duplicate payment as advance
- Refund cash
- Reverse existing payment if erroneous

A normal Cash Against Cheque operation must be blocked.

---

# 14. CHEQUE LOST

PDC is physically lost.

System:

`Held → Lost`

Mandatory:

- Lost date
- Reason
- User
- Approval
- Police/bank documentation if required by business policy
- Replacement instrument

Replacement:

```text
Old PDC = Lost
New PDC = Received
```

---

# 15. CHEQUE STOPPED

Bank/customer indicates payment stopped.

Status:

`Stopped`

System should not mark the invoice paid.

Possible actions:

- New cheque
- Cash
- Bank transfer
- UPI
- Collection follow-up

---

# 16. CHEQUE EXPIRED / STALE

If the cheque is no longer usable according to configured banking/business rules:

`Held → Expired/Stale`

System should:

- Flag invoice as unpaid/unrealized.
- Prevent deposit.
- Request replacement.
- Maintain original instrument history.

---

# 17. DUPLICATE CHEQUE

Tenant submits the same cheque twice.

Validation:

```text
Customer
+
Bank
+
Cheque Number
+
Amount
```

System should flag a potential duplicate.

It should require authorized override.

---

# 18. SAME CHEQUE NUMBER FROM DIFFERENT BANKS

Cheque number alone may not be globally unique.

Recommended duplicate key:

```text
Bank
+
Account/Instrument Identifier where available
+
Cheque Number
+
Customer
```

Configuration should determine the uniqueness rule.

---

# 19. PDC DATE EARLIER THAN RECEIPT DATE

Example:

Received:

15-Aug

Cheque date:

10-Aug

System should flag:

> "Cheque date is earlier than instrument receipt date."

Allow only with authorized override.

---

# 20. PDC DATE EQUAL TO CURRENT DATE

This is effectively a current-dated cheque.

System should allow configuration:

- Treat as Cheque
- Treat as PDC
- Automatically classify based on date

---

# 21. PDC FOR FUTURE INVOICE

Tenant provides a PDC for an invoice that has not yet been generated.

Example:

PDC:

₹100,000

Future rent invoice:

September

System should allow:

`Unapplied PDC`

Then automatically propose allocation when the invoice is generated.

---

# 22. PDC AMOUNT DOES NOT MATCH INVOICE

Invoice:

₹105,000

PDC:

₹100,000

System:

- PDC = ₹100,000
- Invoice remains ₹5,000 outstanding

Do not force the invoice to Paid.

---

# 23. ONE PDC FOR MULTIPLE INVOICES

PDC:

₹300,000

Invoices:

- Rent = ₹100,000
- CAM = ₹100,000
- Utility = ₹100,000

System should support:

```text
PDC ₹300K
   ├── INV001 ₹100K
   ├── INV002 ₹100K
   └── INV003 ₹100K
```

---

# 24. MULTIPLE PDCs FOR ONE INVOICE

Invoice:

₹300,000

PDCs:

- ₹100,000
- ₹100,000
- ₹100,000

System should support multiple instruments against one invoice.

---

# 25. PDC BOUNCED AFTER INVOICE WAS MARKED PAID

If business/accounting process treated the cleared cheque as settlement:

```text
Invoice Paid
     ↓
Cheque Bounced
     ↓
Payment Reversal
     ↓
Invoice Reopened
```

Then:

- Bounce fee
- Collection follow-up
- New payment instrument

can be created.

Never edit the original receipt to make it disappear.

---

# 26. PDC BOUNCED BUT CUSTOMER ALREADY PAID CASH

Potential duplicate situation.

Example:

PDC bounced:

₹100,000

Customer already paid cash:

₹100,000

System must identify:

```text
Cash = ₹100K
PDC Bounce = ₹100K
```

The invoice should remain settled only once.

If the bounce was recorded after cash settlement, the system should not reopen the invoice without checking the linked replacement payment.

---

# 27. PDC RE-PRESENTATION

Original:

`PDC-001 → Bounced`

Re-presentation:

`PDC-001-R1 → Deposited`

Second bounce:

`PDC-001-R2 → Bounced`

Never overwrite the original presentation history.

---

# 28. SECURITY DEPOSIT EDGE CASES

Security deposits should remain separately identifiable because they are generally a liability until legitimately applied or refunded, subject to the applicable jurisdiction and contract.

---

# 29. SECURITY DEPOSIT LESS THAN REQUIRED

Required:

₹500,000

Received:

₹300,000

System:

`Partially Received`

Outstanding Deposit Requirement:

₹200,000

---

# 30. SECURITY DEPOSIT MORE THAN REQUIRED

Required:

₹500,000

Received:

₹600,000

System should not automatically increase the deposit requirement.

₹100,000 becomes:

- Additional deposit, if approved
- Tenant advance
- Refundable excess

Business rule must determine treatment.

---

# 31. SECURITY DEPOSIT RECEIVED BY CHEQUE

Deposit:

₹500,000

Cheque received.

System:

`Pending Realization`

After clearance:

`Realized`

Do not treat the cheque as bank cash before realization.

---

# 32. SECURITY DEPOSIT CHEQUE → CASH

Same replacement model:

```text
Deposit Cheque
      ↓
Cash Received
      ↓
Cheque Cancelled/Returned
      ↓
Deposit Ledger Updated
```

The deposit should reflect only the realized/valid payment.

---

# 33. SECURITY DEPOSIT PARTIAL REFUND

Deposit:

₹500,000

Adjustment:

₹100,000

Refund:

₹400,000

System status:

`Partially Adjusted → Refunded/Closed`

---

# 34. SECURITY DEPOSIT REFUND FAILURE

Refund initiated:

₹400,000

Bank transaction fails.

System:

`Refund Initiated → Failed`

Do NOT mark the deposit as refunded.

The refundable balance remains ₹400,000.

---

# 35. SECURITY DEPOSIT REFUND TWICE

System must prevent:

Refund #1 = ₹400,000

Refund #2 = ₹400,000

Available deposit = ₹400,000

Second refund must be blocked.

---

# 36. SECURITY DEPOSIT ADJUSTMENT GREATER THAN DEPOSIT

Deposit:

₹500,000

Claims:

₹600,000

System should calculate:

Deposit adjusted = ₹500,000

Remaining tenant recoverable:

₹100,000

That ₹100,000 becomes an AR/recovery amount rather than a negative deposit.

---

# 37. SECURITY DEPOSIT ADJUSTMENT DISPUTED

Tenant disputes:

₹50,000 damage deduction.

System should support:

`Adjustment = Disputed`

Do not permanently close the deposit until dispute resolution.

---

# 38. SECURITY DEPOSIT + OUTSTANDING RENT

Deposit:

₹500,000

Rent outstanding:

₹300,000

System should not automatically adjust the deposit unless the lease/business process permits it and approval is obtained.

Workflow:

```text
Outstanding
 ↓
Proposed Deposit Adjustment
 ↓
Approval
 ↓
Adjustment
```

---

# 39. TENANT HAS MULTIPLE LEASES

Tenant:

ABC Pvt Ltd

Lease A:

₹500,000 deposit

Lease B:

₹300,000 deposit

System must maintain deposit balances at:

- Tenant
- Lease
- Property
- Unit

level.

Do not combine deposits automatically.

---

# 40. LEASE TRANSFER

Tenant moves:

Unit A → Unit B.

System should support:

### Option 1

Transfer existing deposit from Lease A to Lease B.

### Option 2

Close Lease A and refund deposit.

### Option 3

Use deposit from Lease A to settle Lease A and collect new deposit for Lease B.

The selected business rule must be explicitly recorded.

---

# 41. INVOICE EDGE CASES

# 42. DUPLICATE INVOICE

Same:

- Lease
- Billing Period
- Charge

System should detect duplicate billing.

---

# 43. INVOICE GENERATED TWICE

If an invoice already exists for:

Lease + Month + Charge

system should block another invoice unless explicitly marked as an adjustment/rebill.

---

# 44. INVOICE GENERATED AFTER PAYMENT

Example:

Tenant gives advance ₹100,000.

Later invoice = ₹100,000.

System should automatically propose:

`Advance → Invoice Allocation`

---

# 45. PAYMENT BEFORE INVOICE

Tenant pays ₹100,000 before invoice exists.

System:

`Unallocated/Advance`

When invoice is created:

`Advance → Invoice`

---

# 46. INVOICE CANCELLED AFTER PAYMENT

Invoice:

₹100,000

Payment:

₹100,000

Invoice needs cancellation.

System should not simply cancel the invoice.

Required process:

```text
Invoice Paid
 ↓
Reverse/Unallocate Payment
 ↓
Create Credit/Adjustment as required
 ↓
Cancel/Rebill Invoice
```

---

# 47. INVOICE PARTIALLY PAID THEN CANCELLED

Invoice:

₹100,000

Payment:

₹60,000

Invoice cancelled.

System must:

1. Unallocate ₹60,000.
2. Return payment to advance/unallocated/refund according to decision.
3. Cancel/reverse invoice.
4. Preserve audit history.

---

# 48. INVOICE DISPUTE

Tenant disputes ₹20,000 of a ₹100,000 invoice.

System should support:

- Disputed Amount
- Reason
- Dispute Date
- Supporting Documents
- Owner
- Resolution
- Approved Adjustment

Invoice can remain:

`Partially Disputed`

---

# 49. RENT ESCALATION MISSED

System discovers that rent should have increased from ₹100K to ₹110K.

Instead of modifying the original invoice:

Generate:

**Debit Note ₹10K**

or configured adjustment invoice.

---

# 50. RENT ESCALATION APPLIED INCORRECTLY

Tenant was billed ₹110K instead of ₹100K.

Generate:

**Credit Note ₹10K**

rather than editing the posted invoice.

---

# 51. BACKDATED INVOICE

Finance user attempts to create an invoice for a closed accounting period.

System:

- Blocks, or
- Requires period reopening/authorized approval.

---

# 52. BACKDATED PAYMENT

Payment received today but user enters previous date.

System should require:

- Permission
- Reason
- Supporting document
- Audit trail

---

# 53. PERIOD LOCK

Once month-end is closed:

Financial transactions should not be posted into that period without controlled reopening.

---

# 54. PAYMENT EDGE CASES

# 55. PAYMENT WITHOUT INVOICE

Record as:

`Unallocated Receipt`

---

# 56. PAYMENT AGAINST WRONG TENANT

If payment belongs to Tenant A but user selects Tenant B:

System should require correction/reallocation.

Do not delete the receipt.

---

# 57. PAYMENT AGAINST WRONG PROPERTY

Tenant operates multiple properties.

Receipt should be traceable to:

- Property
- Lease
- Unit

Incorrect allocation can be reversed and reallocated.

---

# 58. PAYMENT AMOUNT GREATER THAN ALL OUTSTANDING

Example:

Outstanding:

₹100K

Payment:

₹150K

Result:

₹100K → Outstanding

₹50K → Advance

---

# 59. PAYMENT AMOUNT LESS THAN MINIMUM REQUIRED

If business requires full payment for certain invoices, system may allow:

- Partial payment
- Hold
- Rejection

This should be configurable.

---

# 60. ONE PAYMENT, MULTIPLE TENANTS

If legally/operationally permitted, one bank transaction may cover multiple tenants.

System should create:

```text
Bank Receipt
     ↓
Multiple Allocation Lines
     ├── Tenant A
     ├── Tenant B
     └── Tenant C
```

Approval should be required.

---

# 61. UNKNOWN BANK PAYMENT

Bank statement:

₹250,000

No reference.

System:

`Unidentified Bank Receipt`

It should go into a suspense/unallocated account until identified.

---

# 62. DUPLICATE BANK TRANSACTION

Same:

- Bank reference
- Amount
- Date
- Account

appears twice.

System should flag potential duplicate.

---

# 63. PAYMENT REVERSAL

Payment incorrectly posted:

₹100K

System should create:

`Payment Reversal`

rather than deleting it.

---

# 64. REFUND AGAINST PAYMENT

Customer accidentally pays ₹200K instead of ₹100K.

Possible:

₹100K → Invoice

₹100K → Refund

Refund must reference original payment.

---

# 65. CUSTOMER ADVANCE REFUND

Advance:

₹100K

No future invoice required.

Customer requests refund.

System:

```text
Advance
 ↓
Refund Request
 ↓
Approval
 ↓
Payment
 ↓
Advance Balance = ₹0
```

---

# 66. PROCUREMENT EDGE CASES

# 67. PURCHASE REQUISITION WITHOUT BUDGET

System should show:

`Budget unavailable`

Possible actions:

- Block
- Escalate
- Management override

---

# 68. PR AMOUNT CHANGES AFTER APPROVAL

Original PR:

₹500K

New requirement:

₹600K

System should not silently edit approved PR.

Use:

`Amendment`

with:

- Original amount
- Revised amount
- Difference
- Reason
- Approval

---

# 69. RFQ RECEIVES NO QUOTATIONS

System should allow:

- Reissue RFQ
- Direct procurement with approval
- Vendor negotiation
- Cancel PR

---

# 70. SINGLE VENDOR PROCUREMENT

If only one vendor exists:

System should capture:

**Single Source Justification**

and approval.

---

# 71. QUOTATION EXPIRES

Vendor quote validity expires before PO approval.

System should flag:

`Quotation Expired`

Require renewed quotation or authorized exception.

---

# 72. VENDOR SELECTED BUT PO NOT CREATED

Quotation can remain:

`Selected / Awaiting PO`

and should appear in procurement dashboard.

---

# 73. PO PRICE DIFFERENT FROM QUOTATION

Example:

Quotation:

₹100K

PO:

₹120K

System should require:

- Variance reason
- Approval
- Audit trail

---

# 74. PO QUANTITY CHANGE

PO:

100 units

Amended to:

120 units

System must maintain:

- Original quantity
- Revised quantity
- Difference
- Approval

---

# 75. PARTIAL GRN

PO:

100 units

Received:

60.

GRN:

60

Remaining:

40

PO remains:

`Partially Received`

---

# 76. OVER-RECEIPT

PO:

100

Received:

110

System should:

- Block, or
- Allow tolerance, e.g. 5%

Anything above configured tolerance requires approval.

---

# 77. UNDER-RECEIPT

PO:

100

Received:

95

System:

`Partial Receipt`

Remaining PO:

5

---

# 78. DAMAGED GOODS

Received:

100

Accepted:

90

Rejected:

10

System should record:

- Received = 100
- Accepted = 90
- Rejected = 10

Rejected goods should not be capitalized or invoiced as accepted assets.

---

# 79. WRONG ASSET RECEIVED

PO:

Laptop Model A

Vendor sends Model B.

System should:

- Reject GRN line
- Record discrepancy
- Prevent capitalization
- Notify procurement
- Create replacement/return process

---

# 80. SERIAL NUMBER DUPLICATE

Asset serial number already exists.

System must block duplicate registration unless explicitly marked as a legitimate duplicate under the configured policy.

---

# 81. ASSET RECEIVED BUT INVOICE NOT RECEIVED

GRN completed.

Vendor invoice pending.

System should show:

**Received Not Invoiced**

This should appear in AP accrual/unbilled reports.

---

# 82. INVOICE RECEIVED BUT GOODS NOT RECEIVED

Vendor invoice received.

GRN missing.

System should flag:

**Invoice Without Receipt**

Three-way match fails unless authorized.

---

# 83. PO + GRN + INVOICE AMOUNT MISMATCH

Example:

PO:

₹1M

GRN:

₹1M

Invoice:

₹1.2M

System:

`Invoice Price Variance = ₹200K`

Approval required.

---

# 84. TAX MISMATCH

PO tax:

18%

Vendor invoice:

12%

System should flag tax discrepancy.

---

# 85. DUPLICATE VENDOR INVOICE

Same vendor:

Invoice #INV-123

already recorded.

System must block or require authorized override.

---

# 86. VENDOR BANK ACCOUNT CHANGE

Vendor requests new bank account.

This should be a high-risk operation.

Recommended:

```text
Vendor Bank Change Request
 ↓
Verification
 ↓
Approval
 ↓
Effective Date
 ↓
Future Payments Use New Account
```

Do not immediately overwrite the old bank account.

---

# 87. VENDOR ADVANCE WITHOUT PO

If allowed:

System should require:

- Reason
- Vendor
- Approval
- Supporting document
- Advance type

---

# 88. VENDOR ADVANCE GREATER THAN PO

PO:

₹500K

Advance:

₹600K

System should block unless approved.

---

# 89. VENDOR PAYMENT GREATER THAN AP

AP:

₹100K

Payment:

₹120K

System should:

- Allocate ₹100K
- ₹20K → Vendor Advance

or block based on policy.

---

# 90. ASSET EDGE CASES

# 91. ASSET BELOW CAPITALIZATION THRESHOLD

Purchase:

₹20K

Capitalization threshold:

₹50K

System should classify as expense/operational asset according to configured policy.

---

# 92. ASSET ABOVE THRESHOLD BUT MULTIPLE COMPONENTS

Example:

Three components:

₹30K + ₹30K + ₹30K

Individually below threshold.

Together:

₹90K.

System should support configurable componentization rules.

---

# 93. ASSET PURCHASE + INSTALLATION

Equipment:

₹1M

Installation:

₹100K

Testing:

₹50K

System should allow eligible costs to be accumulated into the asset cost/CWIP according to accounting policy.

---

# 94. ASSET RECEIVED BUT NOT READY FOR USE

Example:

Generator received.

Installation pending.

Asset status:

`Pending Capitalization / CWIP`

Do not automatically start depreciation if policy requires depreciation only when placed in service.

---

# 95. ASSET READY FOR USE BUT VENDOR INVOICE PENDING

System should support:

`Asset Capitalization Pending AP`

or configured accrual process.

The asset should not be dependent on the physical receipt of the invoice if capitalization criteria have otherwise been met.

---

# 96. ASSET CAPITALIZED TWICE

System must prevent:

Same GRN/invoice/project being capitalized twice.

---

# 97. ASSET TRANSFER DURING MONTH

Asset moves:

Property A → Property B

System should record:

- Transfer date
- Old property
- New property
- Old cost centre
- New cost centre
- Custodian
- Approval

Depreciation allocation should follow the configured transfer policy.

---

# 98. ASSET PARTIAL DISPOSAL

Asset:

₹1M

Component worth:

₹200K

Component disposed.

System should support component-level disposal rather than disposing the entire asset.

---

# 99. ASSET SOLD ABOVE BOOK VALUE

NBV:

₹300K

Sale:

₹350K

Gain:

₹50K

---

# 100. ASSET SOLD BELOW BOOK VALUE

NBV:

₹300K

Sale:

₹250K

Loss:

₹50K

---

# 101. ASSET LOST

Asset:

Laptop ₹80K

Status:

`Lost`

System should initiate:

- Investigation
- Approval
- Insurance claim if applicable
- Write-off/disposal
- Accounting treatment

---

# 102. ASSET DAMAGED

System should distinguish:

### Repairable

Asset remains active.

### Beyond Repair

Asset may require write-off/disposal.

---

# 103. WARRANTY CLAIM

Asset fails during warranty.

System should create:

- Warranty claim
- Vendor
- Asset
- Failure date
- Description
- Resolution
- Replacement details

If vendor replaces the asset:

Old asset:

`Returned`

New asset:

New Asset ID

Relationship:

```text
AST-001
Returned
   ↓
Replaced By
   ↓
AST-019
Active
```

---

# 104. ASSET REPLACEMENT

Old asset:

₹100K

New asset:

₹120K

System must maintain:

- Old asset disposal/retirement
- New procurement
- New capitalization
- Link between old and new assets

---

# 105. DEPRECIATION EDGE CASES

System should handle:

- Mid-month capitalization
- Mid-month disposal
- Asset transfer
- Change in useful life
- Change in depreciation method
- Residual value change
- Impairment
- Partial disposal
- Asset componentization

Any change to depreciation configuration after depreciation has been posted should generate a controlled adjustment rather than silently rewriting history.

---

# 106. DEPRECIATION POSTED INCORRECTLY

If monthly depreciation:

₹20K

but should have been:

₹18K

System should generate:

`Depreciation Adjustment = ₹2K`

rather than changing the historical entry.

---

# 107. LEASE TERMINATION EDGE CASES

# 108. TERMINATION WITH OUTSTANDING RENT

Deposit:

₹500K

Rent outstanding:

₹200K

System proposes:

`Deposit Adjustment = ₹200K`

Remaining:

₹300K

Requires approval.

---

# 109. TERMINATION WITH OVERDUE PDCs

Tenant has future PDCs after termination.

System must identify:

`Future PDCs linked to terminated lease`

and initiate:

- Return
- Cancel
- Replace
- Apply against final settlement

---

# 110. TERMINATION WITH ADVANCE

Tenant has:

₹100K advance.

Final invoice:

₹70K.

Remaining:

₹30K.

System:

₹70K → Final invoice

₹30K → Refund/remaining advance

---

# 111. TERMINATION WITH SECURITY DEPOSIT + ADVANCE

Example:

Security Deposit:

₹500K

Advance:

₹50K

Outstanding:

₹100K

System should not automatically combine the two unless business rules permit.

They remain separate financial balances.

---

# 112. TENANT TRANSFER BETWEEN UNITS

Tenant moves:

Unit A → Unit B.

System should support:

- Old lease closure
- New lease creation
- Deposit transfer/settlement
- Final billing
- New billing
- PDC transfer/replacement
- Outstanding transfer if permitted

---

# 113. MULTI-CURRENCY EDGE CASE

If property/tenant/vendor supports multiple currencies:

System should store:

- Transaction Currency
- Transaction Amount
- Exchange Rate
- Base Currency Amount
- Realized Exchange Rate
- Exchange Gain/Loss

Never overwrite the original exchange rate.

---

# 114. FOREIGN PAYMENT

Payment:

USD

Invoice:

INR equivalent.

System should calculate:

- Original receivable
- Receipt amount
- Conversion rate
- Base amount
- Difference

Exchange difference should be separately identified.

---

# 115. TAX / INVOICE ADJUSTMENT EDGE CASES

The tax treatment should be configurable for the relevant jurisdiction.

Possible scenarios:

- Tax rate change
- Tax exemption
- Reverse charge where applicable
- Tax-inclusive pricing
- Tax-exclusive pricing
- Credit note tax adjustment
- Debit note tax adjustment
- Cancelled invoice
- Reissued invoice

The product should not hard-code one tax treatment into the finance engine.

---

# 116. RECONCILIATION EDGE CASES

# 117. BANK PAYMENT WITHOUT PMS RECEIPT

Bank:

₹100K

PMS:

No receipt.

Create:

`Unidentified Bank Transaction`

Do not manually force it against an invoice without evidence.

---

# 118. PMS RECEIPT WITHOUT BANK TRANSACTION

PMS:

₹100K receipt.

Bank:

No transaction.

Status:

`Pending Reconciliation`

---

# 119. BANK AMOUNT DIFFERENT FROM RECEIPT

PMS:

₹100K

Bank:

₹99,500

System flags:

`₹500 variance`

Possible:

- Bank charge
- Short payment
- Error

---

# 120. BANK TRANSACTION DUPLICATED

Bank statement contains duplicate transaction.

System should flag potential duplicate rather than automatically creating two receipts.

---

# 121. CASH SHORTAGE

Expected cash:

₹100K

Actual:

₹98K

Difference:

₹2K

System should create:

`Cash Reconciliation Exception`

with reason and approval.

---

# 122. CASH OVERAGE

Expected:

₹100K

Actual:

₹102K

Difference:

₹2K

Again:

`Cash Reconciliation Exception`

---

# 123. MONTH-END UNRECONCILED TRANSACTIONS

Dashboard should show:

- Unallocated receipts
- Unmatched bank entries
- Unreconciled PDC
- Unmatched vendor payments
- Pending refunds
- Unbilled GRNs
- Invoice mismatches
- Pending capitalization

---

# 124. AUDIT EDGE CASES

# 125. USER EDITS AMOUNT

System should record:

```text
Old Amount: ₹100,000
New Amount: ₹90,000
Changed By: User
Date:
Reason:
Approval:
```

---

# 126. USER CHANGES PAYMENT MODE

This should be prohibited after posting.

Instead:

```text
Original Receipt
     ↓
Reversal
     ↓
New Receipt
```

---

# 127. USER CANCELS POSTED RECEIPT

System should:

- Ask reason
- Require approval
- Generate reversal
- Preserve original
- Update allocation
- Update ledger

---

# 128. USER CANCELS PDC

System should require:

- Reason
- Status
- Physical instrument disposition
- Approval if configured

---

# 129. USER CHANGES INVOICE AFTER PAYMENT

Blocked.

Use:

- Credit Note
- Debit Note
- Reversal/Rebill

---

# 130. USER CHANGES VENDOR BANK ACCOUNT

Audit + approval + effective date required.

---

# 131. USER DELETES ASSET

Never hard delete an active asset.

Use:

- Disposal
- Write-off
- Retirement

---

# 132. FINANCIAL PERIOD CLOSURE

Before closing a month, system should check:

### Receivables

- Unallocated receipts
- Unreconciled receipts
- Open PDC exceptions
- Incorrect allocations

### Payables

- Unapproved invoices
- Unmatched GRNs
- Unpaid due invoices

### Assets

- Pending capitalization
- Depreciation not posted
- Asset reconciliation differences

### Deposits

- Deposit ledger mismatch
- Pending refunds
- Unapproved adjustments

---

# 133. MONTH-END VALIDATION

System should produce:

## Finance Close Checklist

```text
[ ] All invoices generated
[ ] All receipts posted
[ ] All PDCs reconciled
[ ] Bank reconciled
[ ] Cash reconciled
[ ] AR reconciled
[ ] AP reconciled
[ ] Security deposits reconciled
[ ] GRN/invoice mismatches reviewed
[ ] Assets reconciled
[ ] Capitalization completed
[ ] Depreciation posted
[ ] Suspense cleared
[ ] Unallocated receipts reviewed
[ ] Adjustments approved
[ ] Period locked
```

---

# 134. OWNER / PROPERTY MONEY SEPARATION

If the PMS manages property on behalf of owners, the architecture should support separate tracking of:

- Owner funds
- Tenant deposits
- Operating funds
- Property-specific funds
- Management fees
- Vendor payments

Property-management accounting commonly requires clear separation and reconciliation of funds belonging to different parties; exact legal requirements depend on jurisdiction and entity structure.

---

# 135. PROPERTY-LEVEL ACCOUNTING

Every relevant transaction should carry:

- Legal Entity
- Property
- Building
- Unit
- Owner
- Tenant
- Lease
- Cost Centre
- Department

This allows reporting such as:

> "What is the outstanding receivable for Property A?"

or:

> "How much did Property B spend on HVAC assets this year?"

---

# 136. OWNER SETTLEMENT EDGE CASE

If your PMS manages properties for owners, add:

```text
Tenant Collection
      ↓
Property Trust/Collection Account
      ↓
Property Expenses
      ↓
Management Fee
      ↓
Owner Payable
      ↓
Owner Settlement
```

Owner settlement should be based on approved property transactions, not simply bank balance.

---

# 137. OWNER DISTRIBUTION CONTROL

System should prevent:

```text
Owner Distribution
>
Available Owner Funds
```

unless explicitly authorized.

---

# 138. VENDOR PAYMENT + OWNER FUNDS

If property expenses are paid from owner/property funds, system should preserve:

- Property
- Owner
- Vendor
- Invoice
- Payment
- Approval
- Bank transaction

This provides complete traceability.

---

# 139. REPORT: PAYMENT REPLACEMENT REGISTER

This is a new report I strongly recommend.

| Original | Original Amount | Replacement | Amount | Reason | Status |
|---|---:|---|---:|---|---|
| CHQ001 | ₹100K | Cash RCT001 | ₹100K | Cash Payment | Completed |
| PDC002 | ₹200K | Bank RCT002 | ₹200K | Bank Transfer | Completed |
| CHQ003 | ₹100K | CHQ004 | ₹100K | Cheque Replacement | Completed |

Filters:

- Date
- Property
- Tenant
- Payment Mode
- Original Instrument
- Replacement Mode
- User
- Status

---

# 140. REPORT: EXCEPTION REGISTER

Create a central exception dashboard:

### Receivables

- Unallocated payment
- Overpayment
- Underpayment
- Disputed invoice

### Cheques

- Bounced
- Lost
- Stopped
- Expired
- Duplicate

### PDC

- Due but not deposited
- Deposited but not cleared
- Bounced
- Re-presentation pending

### Security Deposit

- Refund overdue
- Adjustment disputed
- Deposit mismatch

### Procurement

- PO/GRN mismatch
- GRN/Invoice mismatch
- Price variance
- Quantity variance

### Assets

- Pending capitalization
- Missing serial number
- Duplicate serial number
- Asset location mismatch

---

# 141. EXCEPTION SEVERITY

Every exception should have:

### Critical

Financial statement / duplicate payment / security deposit mismatch.

### High

PDC bounce / bank mismatch / major PO variance.

### Medium

Missing document / delayed approval.

### Low

Data correction / informational discrepancy.

---

# 142. AUTOMATIC BLOCKS VS WARNINGS

Not every exception should block the user.

## Hard Block

Examples:

- Duplicate invoice
- Duplicate asset serial number
- Refund > available balance
- Payment allocation > payment amount
- Cleared cheque cancellation
- Duplicate PDC
- Posted transaction deletion

## Warning

Examples:

- PDC date unusual
- PO price variance
- Payment above expected amount
- Missing optional attachment

## Approval Required

Examples:

- Backdated entry
- High-value refund
- Asset disposal
- Vendor bank change
- PDC cancellation
- Budget override

---

# 143. RECOMMENDED PAYMENT STATE MACHINE

This should be implemented centrally.

```text id="rqq5k6"
                    RECEIVED
                       │
             ┌─────────┼──────────┐
             ▼         ▼          ▼
           CASH      BANK      CHEQUE/PDC
             │         │          │
             │         │          ▼
             │         │        HELD
             │         │          │
             │         │    ┌─────┼─────┐
             │         │    ▼     ▼     ▼
             │         │  DEPOSIT RETURN REPLACE
             │         │    │
             │         │    ▼
             │         │ CLEARING
             │         │    │
             │         │    ▼
             │         │ CLEARED
             │         │
             └─────────┴────┬─────┘
                            ▼
                         REALIZED
                            │
                            ▼
                         ALLOCATED
                            │
                            ▼
                         SETTLED
```

---

# 144. PAYMENT REPLACEMENT STATE

```text id="o6o8hf"
Original Instrument
       ↓
Replacement Requested
       ↓
Approval
       ↓
Replacement Payment Received
       ↓
Original Instrument Cancelled/Returned
       ↓
Replacement Allocated
       ↓
Completed
```

If replacement payment fails:

```text
Replacement Failed
       ↓
Original Instrument
remains active
```

This is important.

The system should **not cancel the original cheque before the replacement payment is successfully posted**, unless the business process explicitly requires otherwise.

---

# 145. CRITICAL TRANSACTION SAFETY RULE

For Cash Against Cheque/PDC:

### Recommended order

```text
1. Validate original instrument
2. Validate invoice
3. Validate amount
4. Create replacement payment
5. Post replacement payment
6. Allocate replacement payment
7. Cancel/return original instrument
8. Link both transactions
9. Generate accounting entries
10. Update invoice
11. Update ledger
12. Audit
```

If Step 4 or 5 fails:

**Original cheque must remain active.**

This prevents accidental loss of the original payment coverage.

---

# 146. ATOMIC TRANSACTION REQUIREMENT

The Cash Against Cheque operation should ideally execute as one transactional operation from the system perspective.

Either:

### Success

```text
Cash Posted
+
Cash Allocated
+
Cheque Cancelled
+
Invoice Updated
+
Ledger Updated
+
Audit Updated
```

or:

### Failure

```text
Nothing changes
```

This is extremely important from a backend/system-design perspective.

---

# 147. CONCURRENCY EDGE CASE

Two finance users attempt to process the same cheque simultaneously.

User A:

Cash Against Cheque

User B:

Deposit Cheque

System must lock the instrument during processing.

Example:

`CHQ-123456 = Processing`

User B should receive:

> "This payment instrument is currently being processed by another user."

This prevents duplicate settlement.

---

# 148. CONCURRENT PAYMENT EDGE CASE

Two payments are received simultaneously against the same invoice.

Invoice:

₹100K

User A:

₹100K cash

User B:

₹100K bank

System must prevent both from settling the same invoice.

One becomes:

`Allocated`

The other becomes:

`Advance / Unallocated`

according to the business rule.

---

# 149. DUPLICATE PAYMENT DETECTION ENGINE

Potential duplicate indicators:

- Same tenant
- Same amount
- Same invoice
- Same payment date
- Same bank reference
- Same cheque number
- Same PDC number

The system should calculate a duplicate-risk score or flag.

---

# 150. FINAL EDGE-CASE MATRIX

| Area | Edge Case | Expected System Behaviour |
|---|---|---|
| Cheque | Cheque → Cash | Replace instrument |
| Cheque | Cheque → Bank | Replace instrument |
| Cheque | Cheque → UPI | Replace instrument |
| Cheque | Cheque → New Cheque | Replace instrument |
| PDC | PDC → Cash | Replace PDC |
| PDC | PDC → New PDC | Replace PDC |
| PDC | Partial Cash | Retain/reissue based on policy |
| PDC | Bounced | Reopen receivable |
| PDC | Re-presented | New presentation record |
| PDC | Lost | Mark lost + replacement |
| PDC | Stopped | Mark stopped + replacement |
| PDC | Future Invoice | Unapplied PDC |
| Payment | Overpayment | Advance |
| Payment | Underpayment | Partial payment |
| Payment | Unknown invoice | Unallocated |
| Payment | Wrong invoice | Reallocation |
| Payment | Duplicate | Flag/block |
| Payment | Reversal | Reversal transaction |
| Invoice | Duplicate | Block |
| Invoice | Wrong amount | Credit/debit note |
| Invoice | Paid then cancelled | Reverse allocation first |
| Invoice | Dispute | Dispute workflow |
| Deposit | Partial receipt | Pending balance |
| Deposit | Excess receipt | Configurable excess treatment |
| Deposit | Partial refund | Remaining balance |
| Deposit | Refund failure | Refund remains pending |
| Deposit | Excess deduction | Recover balance separately |
| Deposit | Dispute | Hold disputed amount |
| Lease | Termination | Final settlement |
| Lease | Future PDCs | Return/cancel/replace |
| Lease | Tenant transfer | Deposit/PDC transfer logic |
| Procurement | No budget | Block/escalate |
| Procurement | PO amendment | Approval |
| Procurement | Partial GRN | Remaining quantity open |
| Procurement | Over GRN | Tolerance/approval |
| Procurement | Damaged goods | Rejected quantity |
| AP | Invoice without GRN | Exception |
| AP | GRN without invoice | Unbilled receipt |
| AP | Price mismatch | Approval |
| AP | Duplicate invoice | Block |
| AP | Vendor advance | Advance ledger |
| Vendor | Bank change | Verification + approval |
| Asset | Below threshold | Expense/non-capital classification |
| Asset | CWIP | Pending capitalization |
| Asset | Duplicate serial | Block |
| Asset | Transfer | Transfer transaction |
| Asset | Lost | Investigation/write-off |
| Asset | Disposal | Gain/loss |
| Asset | Replacement | Link old/new asset |
| Asset | Depreciation error | Adjustment |
| Bank | Missing transaction | Unmatched |
| Bank | Duplicate transaction | Duplicate flag |
| Cash | Shortage | Reconciliation exception |
| Cash | Overage | Reconciliation exception |
| Audit | Posted edit | Reversal/adjustment |
| Audit | Backdated transaction | Approval |
| Audit | Period closed | Block |

---

# 151. MINIMUM UAT SCENARIOS

The QA/UAT team should test at least the following.

## Collections

1. Full cash payment.
2. Partial cash payment.
3. Full cheque payment.
4. Partial cheque payment.
5. PDC against invoice.
6. Multiple PDCs against invoice.
7. One PDC against multiple invoices.
8. Cash against cheque.
9. Cash against PDC.
10. Partial cash against PDC.
11. Cheque replaced by bank transfer.
12. Cheque replaced by UPI.
13. Cheque replaced by new cheque.
14. PDC bounced.
15. PDC re-presented.
16. PDC lost.
17. PDC stopped.
18. Duplicate cheque.
19. Duplicate payment.
20. Overpayment.
21. Underpayment.
22. Unallocated payment.
23. Payment reversal.
24. Payment refund.

---

# 152. SECURITY DEPOSIT UAT

25. Full deposit by cash.
26. Full deposit by cheque.
27. Deposit by PDC.
28. Partial deposit.
29. Excess deposit.
30. Deposit adjustment.
31. Partial adjustment.
32. Full adjustment.
33. Partial refund.
34. Full refund.
35. Refund failure.
36. Refund retry.
37. Over-refund prevention.
38. Adjustment greater than deposit.
39. Disputed adjustment.
40. Deposit transfer between leases.

---

# 153. INVOICE UAT

41. Normal monthly invoice.
42. Prorated invoice.
43. Escalated rent.
44. Credit note.
45. Debit note.
46. Duplicate invoice prevention.
47. Invoice cancellation.
48. Paid invoice cancellation.
49. Partially paid invoice cancellation.
50. Invoice dispute.
51. Backdated invoice.
52. Invoice period lock.

---

# 154. PROCUREMENT UAT

53. PR.
54. PR approval.
55. Budget failure.
56. RFQ.
57. Multiple quotations.
58. Single vendor.
59. Quotation expiry.
60. PO creation.
61. PO approval.
62. PO amendment.
63. Partial GRN.
64. Full GRN.
65. Over-receipt.
66. Under-receipt.
67. Damaged goods.
68. Wrong goods.
69. Three-way match.
70. Quantity mismatch.
71. Price mismatch.
72. Tax mismatch.
73. Duplicate vendor invoice.
74. Vendor advance.
75. Vendor payment.

---

# 155. ASSET UAT

76. Asset purchase.
77. Asset receipt.
78. Asset tagging.
79. Asset capitalization.
80. CWIP.
81. Asset commissioning.
82. Depreciation.
83. Mid-month capitalization.
84. Asset transfer.
85. Asset componentization.
86. Asset maintenance.
87. Warranty.
88. Asset replacement.
89. Asset impairment.
90. Asset disposal.
91. Asset sale above NBV.
92. Asset sale below NBV.
93. Asset write-off.
94. Lost asset.

---

# 156. RECONCILIATION UAT

95. Bank receipt matching.
96. Bank payment matching.
97. Unmatched bank transaction.
98. Duplicate bank transaction.
99. Cash shortage.
100. Cash overage.
101. PDC reconciliation.
102. AR reconciliation.
103. AP reconciliation.
104. Security deposit reconciliation.
105. Asset subledger reconciliation.
106. General ledger reconciliation.

---

# 157. FINAL PRODUCT ARCHITECTURE

The final architecture should therefore be:

```text
                         PMS
                          │
       ┌──────────────────┼───────────────────┐
       │                  │                   │
    PROPERTY            LEASE             PROCUREMENT
       │                  │                   │
       │             ┌────┴────┐         ┌────┴────┐
       │             │         │         │         │
       │           BILLING   DEPOSIT     PR        RFQ
       │             │         │         │         │
       │           INVOICE     │         └────┬────┘
       │             │         │              ▼
       │             ▼         ▼             PO
       │           AR      DEPOSIT            │
       │             │       LEDGER           ▼
       │             │                    GRN/RECEIPT
       │             │                         │
       └─────────────┼─────────────────────────┘
                     │
                     ▼
                COLLECTION
                     │
         ┌───────────┼────────────┐
         ▼           ▼            ▼
       CASH        BANK       CHEQUE/PDC
                                  │
                         ┌────────┼────────┐
                         ▼        ▼        ▼
                      CLEARED   RETURNED  REPLACED
                                            │
                                            ▼
                                      CASH/BANK/UPI
                     │
                     ▼
              PAYMENT ALLOCATION
                     │
              ┌──────┴───────┐
              ▼              ▼
             AR             AP
              │              │
              │              ▼
              │           PAYMENT
              │              │
              │              ▼
              │         RECONCILIATION
              │
              ▼
       LEASE SETTLEMENT
              │
              ▼
       SECURITY DEPOSIT
              │
        ┌─────┴─────┐
        ▼           ▼
    ADJUSTMENT    REFUND

PROCUREMENT
    │
    ▼
ASSET
    │
 ┌──┼──────────────┐
 ▼  ▼              ▼
CWIP CAPITALIZE DEPRECIATION
       │
       ▼
    TRANSFER
       │
       ▼
  MAINTENANCE
       │
       ▼
   DISPOSAL
       │
       ▼
   GAIN/LOSS

All modules
      ↓
ACCOUNTING ENGINE
      ↓
GENERAL LEDGER
      ↓
RECONCILIATION
      ↓
REPORTING
      ↓
AUDIT
```

---

# 158. MOST IMPORTANT DESIGN RULES

The implementation team should treat these as **non-negotiable financial controls**:

1. **Never delete posted financial transactions.**
2. **Never overwrite payment history.**
3. **Never treat a PDC as realized cash merely because it was received.**
4. **Never cancel an original cheque before a replacement payment is successfully posted, unless the business process explicitly requires it.**
5. **Never allow a cleared cheque to go through the normal Cash Against Cheque workflow.**
6. **Never allow a payment to settle an invoice twice.**
7. **Never allow refund + adjustment to exceed the available balance.**
8. **Never allow vendor payment to silently exceed AP.**
9. **Never capitalize the same asset twice.**
10. **Never create a second asset for the same serialized equipment without validation.**
11. **Never change a posted invoice; use credit/debit notes or reversal/rebill.**
12. **Never close a lease without final financial settlement.**
13. **Never allow financial-period changes without controlled authorization.**
14. **Every replacement must reference the original transaction.**
15. **Every reversal must reference the original transaction.**
16. **Every adjustment must have a reason.**
17. **Every refund must reference its source balance.**
18. **Every PDC event must be auditable.**
19. **Every asset must be traceable to its procurement source.**
20. **Every financial subledger must reconcile to the General Ledger.**

---

# 159. FINAL RECOMMENDED MODULE STRUCTURE

```text
FINANCE
│
├── Dashboard
│
├── Billing & Invoicing
│   ├── Billing Schedules
│   ├── Billing Run
│   ├── Invoices
│   ├── Credit Notes
│   ├── Debit Notes
│   └── Invoice Disputes
│
├── Receivables
│   ├── Tenant Ledger
│   ├── Customer Ledger
│   ├── Outstanding
│   ├── Ageing
│   ├── Advances
│   └── Write-offs
│
├── Collections
│   ├── Cash
│   ├── Cheque
│   ├── PDC
│   ├── Bank
│   ├── UPI
│   ├── Allocation
│   ├── Unallocated
│   ├── Refunds
│   └── Reversals
│
├── Payment Instruments
│   ├── Cheque Register
│   ├── PDC Register
│   ├── PDC Batches
│   ├── PDC Presentations
│   ├── Replacements
│   ├── Returns
│   └── Bounces
│
├── Security Deposits
│   ├── Deposit Requirement
│   ├── Collection
│   ├── Deposit Ledger
│   ├── Adjustments
│   ├── Disputes
│   ├── Settlement
│   └── Refund
│
├── Procurement
│   ├── Purchase Requisition
│   ├── Budget
│   ├── RFQ
│   ├── Quotations
│   ├── Comparison
│   ├── Purchase Orders
│   ├── GRN
│   └── Procurement Exceptions
│
├── Accounts Payable
│   ├── Vendor Invoice
│   ├── Vendor Ledger
│   ├── Vendor Advance
│   ├── Payment Request
│   ├── Vendor Payment
│   └── AP Ageing
│
├── Assets
│   ├── Asset Register
│   ├── Asset Categories
│   ├── Pending Capitalization
│   ├── CWIP
│   ├── Depreciation
│   ├── Transfer
│   ├── Maintenance
│   ├── Warranty
│   ├── AMC
│   ├── Impairment
│   ├── Disposal
│   └── Write-off
│
├── Reconciliation
│   ├── Bank
│   ├── Cash
│   ├── AR
│   ├── AP
│   ├── PDC
│   ├── Security Deposit
│   └── Assets
│
├── Accounting
│   ├── Chart of Accounts
│   ├── Account Mapping
│   ├── Journal
│   ├── General Ledger
│   ├── Cost Centre
│   └── Profit Centre
│
└── Reports
    ├── Receivables
    ├── Collections
    ├── PDC
    ├── Security Deposit
    ├── Procurement
    ├── Payables
    ├── Assets
    ├── Depreciation
    ├── Reconciliation
    └── Exceptions
```

# 160. FINAL RECOMMENDATION

The **Payment Replacement Engine** should be treated as a core capability of your PMS rather than a special case for Cash Against PDC.

It should support:

**Cheque → Cash**  
**PDC → Cash**  
**Cheque → Bank Transfer**  
**PDC → Bank Transfer**  
**Cheque → UPI**  
**PDC → UPI**  
**Cheque → New Cheque**  
**PDC → New PDC**

with the same underlying model:

```text
ORIGINAL PAYMENT INSTRUMENT
            │
            ▼
    REPLACEMENT REQUEST
            │
            ▼
       VALIDATION
            │
            ▼
    REPLACEMENT PAYMENT
            │
            ▼
         POSTED?
        /      \
      NO        YES
      │          │
      │          ▼
      │    ALLOCATE PAYMENT
      │          │
      │          ▼
      │    CANCEL/RETURN
      │    ORIGINAL INSTRUMENT
      │          │
      └──────────┴──────────┐
                            ▼
                     UPDATE INVOICE
                            │
                            ▼
                     UPDATE LEDGER
                            │
                            ▼
                       ACCOUNTING
                            │
                            ▼
                       AUDIT TRAIL
```

This model is much safer than having separate hard-coded flows for "Cash Against PDC", "Cash Against Cheque", etc. It also makes the system substantially easier to extend later.

For property-management systems, **reconciliation and segregation of tenant/owner/client funds are particularly important**, so I would make reconciliation and auditability first-class components rather than reports bolted on at the end.