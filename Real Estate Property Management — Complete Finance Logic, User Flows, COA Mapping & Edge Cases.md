# Real Estate Property Management
## Complete Finance Logic, User Flows, COA Mapping, Edge Cases & Scenarios

---

# 1. Executive Summary

The Finance module should operate as a **real-estate-specific subledger + accounting engine**.

The fundamental accounting dimension should be:

```text
Company
   ↓
Property
   ↓
Unit
   ↓
Tenant / Vendor / Employee / Other Party
   ↓
Contract / Lease / Transaction
   ↓
Financial Event
   ↓
Subledger Account
   ↓
GL Account
   ↓
Voucher
   ↓
Financial Reporting
```

The COA establishes dedicated accounts for:

- Tenant Receivables
- Legal Receivables
- Staff Current Accounts
- PDC In Hand
- Tenant PDC liabilities
- Tenant deposits
- Guarantee cheques
- Sundry creditors
- Accruals
- Provisions
- Bank
- Inventory
- Prepaid expenses
- Intercompany accounts
- Related-party accounts
- Rental Revenue
- Property Management Fee
- Other Income
- Penalties
- Damages
- Scrap Sale
- Insurance Claims
- Property Sale Gain/Loss
- Property operating expenses
- Staff costs
- G&A
- Selling & Marketing
- Finance costs
- Depreciation & Amortization

Therefore, the product should be designed around **multiple accounting cycles**, not one rent-collection workflow.

---

# 2. Core Accounting Architecture

The Finance engine should maintain four levels.

## Level 1 — Master

```text
Property
Unit
Tenant
Vendor
Employee
Bank
Asset
Lease
Contract
```

## Level 2 — Transaction

```text
Rent
Security Deposit
PDC
Cheque
Cash
Expense
Purchase
Utility
Maintenance
Salary
Asset Purchase
Loan
Intercompany
Revenue
Refund
Penalty
Damage
Insurance Claim
Property Sale
```

## Level 3 — Subledger

```text
Tenant Ledger
Unit Ledger
Vendor Ledger
Employee Ledger
Asset Register
PDC Register
Deposit Register
Bank Ledger
Inventory Ledger
```

## Level 4 — General Ledger

```text
GL
 ↓
SL
 ↓
Cost Centre
 ↓
Voucher
```

---

# 3. Mandatory Accounting Dimensions

Every property-related transaction should carry:

```text
Company
Property
Unit
Tenant / Counterparty
Lease / Contract
Transaction Date
Accounting Period
Transaction Type
GL Account
SL Account
Cost Centre
Amount
Tax, if applicable
Reference
Created By
Approved By
Posted By
```

Not every transaction requires every dimension.

For example:

### Rent

```text
Property ✓
Unit ✓
Tenant ✓
Lease ✓
GL ✓
SL ✓
```

### Head Office Expense

```text
Property ✕ / optional
Unit ✕
Vendor ✓
GL ✓
SL ✓
```

### Employee Expense

```text
Employee ✓
Department ✓
Property/Cost Centre ✓ if applicable
GL ✓
SL ✓
```

---

# 4. Property and Unit Cost Centres

The earlier finance document requires a cost centre for every property and every unit.

This remains the core design principle.

The source specifically states:

> For each and every property create cost centre  
> For each and every unit create cost centre.

The COA workbook reinforces this by maintaining unit-specific mappings for:

- Receivables
- PDC
- Deposit

Therefore:

```text
Property
   ↓
Property Cost Centre

Unit
   ↓
Unit Cost Centre

Tenant
   ↓
Tenant/Unit Subledger
```

---

# 5. COA Architecture

## 5.1 Assets

The workbook contains the following major asset categories.

### Fixed Assets

```text
11000
PPE Land Cost

11000001
Land Cost
```

### Bank

```text
12000
Bank

12000001
Bank
```

### Sundry Debtors

```text
12410
Sundry Debtors

12410001
Tenant Name
```

### Legal Receivables

```text
12411
Legal Receivables

12411001
Tenant Name
```

### Staff Current Account

```text
12412
Staff Current Account

12412001
Staff Name
```

### Tenant Receivables

```text
12413
Tenant Receivables

12413001+
Unit-specific accounts
```

### Prepaid Expenses

```text
12500
Prepaid Expenses

12500001
Prepaid Insurance
```

### Temporary Loans to Partners

```text
12600
Temp. Loan To Partners

12600001
Loan To Partner Name
```

### Intercompany

```text
12700
Inter Company Accounts

12700001
Inter Company Name
```

### Inventory

```text
12800
Inventory

12800001
Stock-Inventory
```

### PDC In Hand

```text
12900
PDC In Hand

12900001
PDC In Hand

12900002
Deposit-PDC In Hand
```

### Related Parties

```text
13000
Related Parties Account

13000001
Related Party Name
```

---

# 6. Liabilities

The COA supports significantly more liability scenarios than the previous design.

## 6.1 Accounts Payable

```text
21000
Sundry Creditors

21000001
Account Name
```

Used for:

- Vendors
- Contractors
- Suppliers
- Service providers

---

# 6.2 Tenant Refundable Deposit

```text
21100
Tenant - Refundable Deposit

21100001
Reservation Advance
Unclaimed Liability-Deposit
Qatar Cool Deposit - Tenant
Kahramaa Deposit - Tenant
Service Fee - Tenant
...
```

This account should be used for **specific tenant refundable/non-rental liabilities**, according to the transaction type.

---

# 6.3 Guarantee Cheques

```text
21200
Tenant - Guarantee Cheque

21200001
Guarantee Cheque Received
```

This is distinct from rent PDCs.

Therefore:

```text
Rent PDC
≠
Guarantee Cheque
```

The system must never mix them.

---

# 6.4 PDC Received

```text
21400
PDC Received - Leasing Customers

21400001+
Unit-specific PDC accounts
```

This is the liability-side PDC subledger.

---

# 6.5 Deposits Received

```text
21500
Deposits - Leasing Customers

21500001+
Unit-specific deposit accounts
```

This is the unit-linked deposit structure from the original finance logic.

---

# 6.6 Accruals

```text
21600
Accruals
```

With specific accounts such as:

```text
Accrued Expense - General
Accrued Expense - Travel
Accrued Expense - Immigration
Accrued Expense - Insurance
Accrued Expense - Garbage Rent
...
```

This supports expense accrual and reversal.

---

# 6.7 Provisions

The COA includes provisions for:

```text
Provision for Leave Salary
Provision for End of Service
Provision for Air Ticket
Provision for Contingent Liabilities
Other Provisions
Travel Provisions
```

These should be handled through a separate **Provision/Accrual Engine**.

---

# 6.8 Long-Term Loans

The COA supports:

```text
Long Term From Related Parties
Long Term Bank Loans
Long Term From Associates
```

The Finance module should therefore support loan schedules.

---

# 7. Capital

The COA includes:

```text
31000
Capital

31100
Owners Current Account

31500
Retained Earnings

32000
Reserve
```

The system should support:

```text
Owner Investment
Owner Withdrawal
Owner Current Account
Retained Earnings
Reserve
Capital Adjustment
```

These should generally be controlled by Finance/Accounting users rather than operational property users.

---

# 8. Revenue Architecture

The COA has four major revenue scenarios.

## 8.1 Rental Revenue

```text
41100
Rental Revenue

41100001
Rental Revenue
```

This is the primary property income.

---

## 8.2 Property Management Fee

```text
41101
Property Management Fee

41101001
M.I-Beverly Hills Garden-1
```

This should be treated separately from rental revenue.

This distinction is important:

```text
Rent received
       ≠
Property management fee
```

---

## 8.3 Other Income

The COA supports:

```text
Other Income
Penalty
Damages
Scrap Sale
Insurance Claim
```

These should have separate transaction types.

---

## 8.4 Property Sale Gain

```text
41301
Gain/Loss of Sale of Fixed Assets

41301001
Profit on Sale of Property
```

Property disposal must therefore be a separate accounting workflow.

---

# 9. Expense Architecture

The expense COA is broad enough to support a complete property-management operating model.

## Direct Property Expenses

### Labour Outsourcing

```text
Facilities Management Labour
Housekeeping Labour
Security Staff Labour
```

### AMC

```text
Facilities Management AMC
Swimming Pool Maintenance
CCTV AMC
Landscaping AMC
Fire Fighting AMC
Fire Alarm AMC
```

### Utilities

```text
Electricity & Water - Common Area
Electricity & Water - Vacant Period
Electricity & Water - Inclusive
Telephone & Internet
Master Community Charges
Common Area Maintenance
```

### Repairs & Maintenance

```text
Repair & Maintenance
Bathtub/Kitchen/WC Charges
Sewage & Waste Removal
Sweet Water
Sports/Gym Equipment
CMEP Materials
Housekeeping Materials
Landscaping Materials
Check-Out Expenses
```

---

# 10. Staff Cost

The COA contains:

```text
Basic Salary
Accommodation Allowance
Transportation Allowance
Mobile/Telephone
Overtime
Leave Salary
Air Ticket
End of Service Benefits
Bonus
Special Allowance
Food Allowance
Other Allowance
Laundry
Medical & Insurance
Uniform
Visa & Immigration
```

This means the Finance module should support an HR/payroll integration or a dedicated payroll posting interface.

---

# 11. General & Administrative Expenses

Supported categories include:

```text
Vehicle Insurance
Government/Municipal Charges
Legal Charges
General Administration
Commission & Brokerage
Printing & Stationery
Subscriptions
Audit Fees
Vehicle Hire
Vehicle Maintenance
Miscellaneous
Generator Maintenance
Brokerage Leasing
IT Expenses
Recruitment Charges
```

These should be mapped by:

```text
Expense Category
Vendor
Cost Centre
Property, if applicable
Department
```

---

# 12. Finance and Depreciation

The COA includes:

```text
Other Bank Charges
```

and depreciation/amortization for:

```text
Machinery
Furniture & Fixtures
Office Equipment
Commercial Kitchen Equipment
Appliances
IT Software
Sports/Gym Equipment
Tools & Equipment
CCTV Systems
Access Control
Vehicles
```

Therefore the system needs an **Asset Register + Depreciation Engine**.

---

# 13. End-to-End Finance Modules

The final Finance navigation should become:

```text
FINANCE
│
├── Dashboard
│
├── Receivables
│   ├── Tenant Receivables
│   ├── Sundry Debtors
│   ├── Legal Receivables
│   └── Aging
│
├── Collections
│   ├── Rent Receipt
│   ├── Deposit Receipt
│   ├── PDC Receipt
│   └── Other Receipt
│
├── PDC Management
│   ├── PDC Register
│   ├── PDC In Hand
│   ├── PDC Deposits
│   ├── Cleared PDCs
│   └── Returned PDCs
│
├── Tenant Deposits
│   ├── Refundable Deposits
│   ├── Leasing Deposits
│   ├── Utility Deposits
│   └── Deposit Refunds
│
├── Guarantees
│   └── Guarantee Cheques
│
├── Revenue
│   ├── Rental Revenue
│   ├── Property Management Fee
│   ├── Other Income
│   ├── Penalties
│   ├── Damages
│   ├── Insurance Claims
│   └── Property Sale
│
├── Payables
│   ├── Vendors
│   ├── Purchase Invoices
│   ├── Expense Invoices
│   └── Payments
│
├── Expenses
│   ├── Direct Expenses
│   ├── Staff Costs
│   ├── G&A
│   ├── Selling & Marketing
│   ├── Finance Costs
│   └── Head Office
│
├── Accruals & Provisions
│
├── Assets
│   ├── Asset Register
│   ├── Asset Purchase
│   ├── Depreciation
│   └── Asset Disposal
│
├── Inventory
│
├── Loans
│
├── Intercompany
│
├── Related Parties
│
├── Bank
│   ├── Bank Transactions
│   └── Reconciliation
│
├── Vouchers
│
├── Cost Centres
│
└── Reports
```

---

# 14. RENT-TO-REVENUE FLOW

This remains the most important workflow.

## Step 1 — Lease

```text
Leasing Manager
       ↓
Create Lease
       ↓
Property
       ↓
Unit
       ↓
Tenant
       ↓
Rent
       ↓
Security Deposit
       ↓
Payment Terms
```

---

# 15. Rent Due Generation

At the beginning of the accounting period:

```text
Active Lease
      ↓
Check Rent Schedule
      ↓
Generate Rent Due
      ↓
Tenant Receivable
```

Accounting:

```text
Dr Tenant Receivable
Cr Rental Revenue
```

The source document explicitly defines the revenue generation entry as:

```text
Dr Receivable - Unit
Cr Rental Revenue
```

for the rent amount.

### Important design decision

The system should distinguish:

```text
Revenue Generation
```

from:

```text
Collection
```

They are not the same transaction.

---

# 16. PDC Collection

Tenant gives PDCs.

Example:

```text
Monthly Rent = ₹5,000
12 PDCs = ₹60,000
```

Receipt Voucher:

```text
Dr PDC In Hand          ₹60,000
Cr Customer PDC         ₹60,000
```

The original document explicitly uses this structure.

---

# 17. PDC Deposit

For each PDC:

```text
Dr Bank
Cr PDC In Hand

Dr Customer PDC
Cr Tenant Receivable
```

This follows the original finance logic.

---

# 18. PDC Clearing

The system should introduce a distinct state:

```text
Received
 ↓
In Hand
 ↓
Deposited
 ↓
Cleared
```

If the bank confirms clearance:

```text
Status = Cleared
```

The bank balance remains increased.

No new revenue should be generated at clearing because revenue is a separate event.

---

# 19. PDC Return

If returned:

```text
Deposited
 ↓
Returned
```

Accounting follows the supplied logic:

```text
Dr PDC In Hand
Cr Bank

Dr Tenant Receivable
Cr Customer PDC
```

The source defines the cheque-return voucher accordingly.

---

# 20. PDC Re-Presentation

This should be supported.

Example:

```text
PDC #123
 ↓
Deposited
 ↓
Returned
 ↓
Re-presented
 ↓
Cleared
```

The system must NOT create a new PDC identity.

Instead:

```text
Original PDC ID = retained
Presentation #1 = Returned
Presentation #2 = Cleared
```

This is a recommended system design based on the PDC lifecycle.

---

# 21. Security Deposit Flow

The COA contains both:

```text
21100 Tenant - Refundable Deposit
```

and:

```text
21500 Deposits - Leasing Customers
```

This is an important accounting distinction that should be confirmed with the accounting team before production.

Until confirmed, the system should configure them as **separate deposit transaction types** rather than merging them.

Possible structure:

```text
Deposit Type
│
├── Reservation Advance
├── Refundable Tenant Deposit
├── Leasing Customer Deposit
├── Qatar Cool Deposit
├── Kahramaa Deposit
├── Service Fee Deposit
└── Other Tenant Liability
```

---

# 22. Deposit Receipt — Cash

For a leasing deposit:

```text
Dr Cash In Hand
Cr Deposit Liability
```

The earlier source specifically gives:

```text
Dr Cash In Hand
Cr Deposit-Customer-Unit
```



---

# 23. Deposit Receipt — Bank/Cheque

```text
Dr Bank
Cr Deposit Liability
```

The source specifies the same structure for cheque security deposits.

---

# 24. Deposit Refund

When a tenant vacates:

```text
Lease Closed
      ↓
Check Deposit Balance
      ↓
Check Outstanding Receivables
      ↓
Check Damages
      ↓
Check Utility Dues
      ↓
Calculate Refundable Amount
      ↓
Approval
      ↓
Payment
```

Example:

```text
Deposit                     ₹10,000
Outstanding Rent             ₹2,000
Damage Charges               ₹1,000

Refund = ₹7,000
```

Accounting:

```text
Dr Deposit Liability
Cr Bank
```

Any deduction should be separately posted to the appropriate receivable/revenue account.

For example, if damage is charged:

```text
Dr Tenant Receivable
Cr Other Income - Damages
```

Then the tenant receivable can be settled against the deposit according to the configured accounting policy.

---

# 25. Deposit Refund Edge Cases

### Case 1 — Full Refund

```text
Deposit = ₹10,000
Deductions = ₹0
Refund = ₹10,000
```

### Case 2 — Partial Refund

```text
Deposit = ₹10,000
Deductions = ₹2,500
Refund = ₹7,500
```

### Case 3 — No Refund

```text
Deposit = ₹10,000
Deductions = ₹10,000
Refund = ₹0
```

### Case 4 — Tenant Owes More Than Deposit

```text
Deposit = ₹10,000
Dues = ₹15,000

Refund = ₹0
Outstanding Tenant Receivable = ₹5,000
```

### Case 5 — Unclaimed Deposit

The COA explicitly contains:

```text
Unclaimed Liability-Deposit
```

Therefore an aged/unclaimed deposit can move through an approved process:

```text
Deposit Liability
 ↓
Unclaimed Liability
```

The exact legal/accounting timing should be configurable and approved by Finance.

---

# 26. Guarantee Cheque Flow

Guarantee cheques are different from rent PDCs.

```text
Tenant
 ↓
Guarantee Cheque
 ↓
Guarantee Register
 ↓
Guarantee Liability
```

COA:

```text
21200
Tenant - Guarantee Cheque

21200001
Guarantee Cheque Received
```

The system should record:

```text
Cheque Number
Amount
Bank
Tenant
Property
Unit
Purpose
Received Date
Expiry Date
Status
```

Statuses:

```text
Received
Held
Returned
Deposited
Invoked
Expired
```

A guarantee cheque should not automatically be treated as rental revenue or a normal rent PDC.

---

# 27. Tenant Receivable Lifecycle

Tenant receivable should be the central tenant subledger.

```text
Rent Generated
       ↓
Receivable Created
       ↓
Tenant Pays
       ↓
Receivable Settled
```

Exceptions:

```text
Receivable
 ↓
Overdue
 ↓
Reminder
 ↓
Legal
 ↓
Legal Receivable
```

This creates a logical relationship between:

```text
124130xx
Tenant Receivable

12411001
Legal Receivable
```

---

# 28. Legal Receivable Flow

If an overdue tenant account is escalated to legal:

```text
Tenant Receivable
      ↓
Legal Escalation
      ↓
Legal Receivable
```

The system should maintain:

```text
Tenant
Property
Unit
Original Invoice
Outstanding Amount
Legal Case
Legal Costs
Recovery Status
```

Potential accounting transfer:

```text
Dr Legal Receivable
Cr Tenant Receivable
```

This exact journal should be configured with the accounting team because the COA identifies the accounts but does not specify the transfer entry.

---

# 29. Penalty Flow

The COA provides:

```text
41201002
Other Income - Penalty
```

Example:

```text
Rent overdue
 ↓
Penalty calculated
 ↓
Tenant charged
```

Accounting:

```text
Dr Tenant Receivable
Cr Other Income - Penalty
```

The penalty should be independently traceable from the original rent.

---

# 30. Damage Flow

The COA provides:

```text
41201003
Other Income - Damages
```

Flow:

```text
Inspection
 ↓
Damage identified
 ↓
Damage Assessment
 ↓
Tenant Approval / Finance Approval
 ↓
Charge Tenant
```

Accounting:

```text
Dr Tenant Receivable
Cr Other Income - Damages
```

The charge should be linked to:

```text
Property
Unit
Tenant
Lease
Inspection
Damage Record
```

---

# 31. Check-Out Expense Flow

The expense COA includes:

```text
51004009
Check Out Expenses
```

This creates a useful distinction:

```text
Tenant Damage Revenue
```

versus:

```text
Actual Check-Out Expense
```

For example:

```text
Tenant charged ₹2,000 damages

Revenue:
Dr Tenant Receivable
Cr Damage Income

Vendor charges ₹1,200 for repair

Expense:
Dr Check-Out Expense
Cr Vendor Payable
```

---

# 32. Vendor / Accounts Payable Flow

COA:

```text
21000
Sundry Creditors
```

Workflow:

```text
Purchase Request
 ↓
PO
 ↓
Service/Product Received
 ↓
Vendor Invoice
 ↓
Invoice Validation
 ↓
Accounts Payable
 ↓
Approval
 ↓
Payment
```

Accounting:

```text
Dr Expense / Inventory / Asset
Cr Sundry Creditors
```

Payment:

```text
Dr Sundry Creditors
Cr Bank
```

---

# 33. Vendor Invoice Scenarios

### AMC Invoice

```text
Vendor
 ↓
AMC Invoice
 ↓
Facilities AMC Expense
```

### Utility Invoice

```text
Electricity/Water
 ↓
Determine:
Common Area?
Vacant Unit?
Inclusive?
 ↓
Map appropriate expense account
```

The COA specifically distinguishes:

```text
Electricity & Water - Common Area
Electricity & Water - Vacant Period
Electricity & Water - Inclusive
```

Therefore the system must not use one generic utilities account.

---

# 34. Expense Allocation

For property expenses, the system should ask:

```text
Expense Scope
```

Options:

```text
Property
Unit
Common Area
Corporate
Head Office
Department
```

Example:

### Common Area Electricity

```text
Property = AAA
Unit = NULL
Expense = Electricity & Water - Common Area
```

### Vacant Unit Electricity

```text
Property = AAA
Unit = Flat 15
Expense = Electricity & Water - Vacant Period
```

This is critical for property-level profitability.

---

# 35. Inclusive Utility Scenario

If utilities are contractually included in rent:

```text
Tenant Rent
+
Utility Cost
```

The tenant should not automatically be charged a separate utility receivable.

The actual expense should still be recorded under:

```text
Electricity & Water - Inclusive
```

The system should therefore differentiate:

```text
Utility Billing Model
├── Tenant Separately Billed
├── Landlord Absorbed
├── Included in Rent
└── Common Area
```

---

# 36. Prepaid Expense Flow

COA:

```text
12500001
Prepaid Insurance
```

Example:

```text
Annual Insurance = ₹120,000
```

At payment:

```text
Dr Prepaid Insurance       ₹120,000
Cr Bank                    ₹120,000
```

Monthly recognition:

```text
₹120,000 / 12 = ₹10,000
```

```text
Dr Insurance Expense       ₹10,000
Cr Prepaid Insurance       ₹10,000
```

The system should maintain:

```text
Prepaid Start Date
End Date
Total Amount
Recognition Frequency
Recognized Amount
Remaining Balance
```

---

# 37. Accrual Flow

COA:

```text
21600
Accruals
```

Example:

December maintenance service received but invoice not received.

```text
Dr Maintenance Expense
Cr Accrued Expense
```

When invoice arrives:

```text
Dr Accrued Expense
Cr Vendor Payable
```

If actual invoice differs:

```text
Difference
 ↓
Expense Adjustment
```

---

# 38. Accrual Reversal

Recurring accruals should support:

```text
Create Accrual
 ↓
Post
 ↓
Auto-Reverse Next Period
```

Example:

```text
31 Aug
Accrual created

01 Sep
Accrual reversed

Invoice received
 ↓
Actual invoice posted
```

This prevents double booking.

---

# 39. Staff Cost Flow

The COA supports a full employee cost structure.

Monthly payroll process:

```text
HR Payroll
 ↓
Payroll Approval
 ↓
Finance Posting
```

Possible entries:

```text
Dr Staff Basic Salary
Dr Accommodation
Dr Transportation
Dr Mobile
Dr Overtime
...
Cr Salary Payable / Bank
```

For EOSB:

```text
Dr Staff EOSB Expense
Cr Provision for EOSB
```

The exact liability account mapping should follow the organization's payroll configuration.

---

# 40. End-of-Service Provision

The COA contains:

```text
Provision for End of Service
```

and:

```text
Staff End of Service Benefits
```

Therefore the system should maintain an EOSB schedule.

```text
Employee
 ↓
Eligible Service Period
 ↓
Provision Calculation
 ↓
Monthly Provision
 ↓
Provision Liability
```

At settlement:

```text
Provision Liability
 ↓
Final Settlement
 ↓
Bank
```

---

# 41. Leave Salary Provision

Similar lifecycle:

```text
Employee
 ↓
Accrued Leave
 ↓
Leave Salary Calculation
 ↓
Monthly Provision
```

Posting:

```text
Dr Leave Salary Expense
Cr Leave Salary Provision
```

---

# 42. Asset Purchase

COA contains fixed assets and multiple depreciation categories.

Flow:

```text
Asset Request
 ↓
Purchase
 ↓
Vendor Invoice
 ↓
Asset Capitalization
 ↓
Asset Register
 ↓
Depreciation
```

Example:

```text
Dr Furniture & Fixtures
Cr Vendor Payable
```

The specific asset GL should be mapped according to the organization's asset register.

---

# 43. Depreciation Engine

The COA includes separate depreciation accounts for:

```text
Machinery
Furniture
Office Equipment
Kitchen Equipment
Appliances
IT Software
Sports/Gym Equipment
Tools
CCTV
Access Control
Vehicles
```

Each asset should have:

```text
Asset ID
Asset Category
Purchase Date
Capitalized Date
Cost
Useful Life
Residual Value
Depreciation Method
Accumulated Depreciation
Net Book Value
Property
Location
```

Monthly process:

```text
Asset Register
 ↓
Calculate Depreciation
 ↓
Create Depreciation Voucher
```

Accounting:

```text
Dr Depreciation Expense
Cr Accumulated Depreciation
```

---

# 44. Asset Disposal

The COA contains:

```text
41301001
Profit on Sale Of Property
```

Therefore disposal must calculate:

```text
Sale Proceeds
-
Net Book Value
=
Gain / Loss
```

Flow:

```text
Asset
 ↓
Disposal Request
 ↓
Approval
 ↓
Sale
 ↓
Remove Asset
 ↓
Remove Accumulated Depreciation
 ↓
Recognize Gain/Loss
```

---

# 45. Property Sale Scenario

Example:

```text
Property Book Value = ₹8,000,000
Sale Price = ₹9,000,000
```

Gain:

```text
₹1,000,000
```

The system should not simply post the entire sale amount as revenue.

It should separately account for:

```text
Asset Derecognition
Cash/Receivable
Gain/Loss
```

The COA identifies the gain account; the precise journal structure should be configured by Finance.

---

# 46. Inventory Flow

COA:

```text
12800001
Stock-Inventory
```

This can support property-management consumables such as:

```text
Housekeeping Materials
Landscaping Materials
Maintenance Materials
CMEP Materials
```

Flow:

```text
Purchase
 ↓
Inventory
 ↓
Issue to Property
 ↓
Expense
```

Example:

```text
Purchase:
Dr Inventory
Cr Vendor Payable

Issue:
Dr Property Expense
Cr Inventory
```

This provides much better property-level cost tracking than directly expensing every purchase.

---

# 47. Related Party Transactions

COA:

```text
13000001
Related Party Name
```

Flow:

```text
Related Party Transaction
 ↓
Select Related Party
 ↓
Transaction Type
 ↓
Post
 ↓
Related Party Ledger
```

Examples:

```text
Advance to related party
Recovery from related party
Expense paid on behalf
Income received on behalf
```

These should not be mixed with normal tenant/vendor balances.

---

# 48. Intercompany Flow

COA:

```text
12700001
Inter Company Name
```

Example:

```text
Company A pays expense for Company B
```

Company A:

```text
Dr Intercompany Receivable
Cr Bank
```

Company B:

```text
Dr Expense
Cr Intercompany Payable
```

The system should maintain matching references between both companies.

---

# 49. Temporary Partner Loan

COA:

```text
12600001
Loan To Partner Name
```

Flow:

```text
Loan Request
 ↓
Approval
 ↓
Disbursement
 ↓
Partner Loan Ledger
 ↓
Repayment
```

Disbursement:

```text
Dr Loan to Partner
Cr Bank
```

Repayment:

```text
Dr Bank
Cr Loan to Partner
```

---

# 50. Bank Management

The system should maintain:

```text
Bank Account
 ↓
Opening Balance
 ↓
Receipts
 ↓
Payments
 ↓
PDC Deposits
 ↓
Refunds
 ↓
Transfers
 ↓
Closing Balance
```

Bank reconciliation:

```text
System Bank Ledger
        +
Bank Statement
        ↓
Matching
        ↓
Matched
Unmatched
Exception
```

---

# 51. Cash Management

Cash should have:

```text
Cash In Hand
```

The basic flow:

```text
Cash Receipt
 ↓
Cash In Hand
 ↓
Cash Deposit
 ↓
Bank
```

The original source specifically defines the cash deposit:

```text
Dr Bank
Cr Cash In Hand
```



---

# 52. Revenue Generation — Batch vs Single

The original requirement remains:

```text
Single Unit
OR
Batch of all Units
for a specific Property
```



### Batch

Use when:

```text
Normal recurring monthly rent
```

### Single

Use for:

```text
Mid-month vacancy
New lease
Early termination
Special adjustment
Partial month
Manual correction
```

---

# 53. Mid-Month Vacancy

The source explicitly says a tenant vacating mid-month should be considered only in Single processing.

Therefore:

```text
Batch Run
 ↓
Identify Mid-Month Vacancy
 ↓
Exclude Unit
 ↓
Single Unit Processing
```

This should be enforced by the system rather than left to user memory.

---

# 54. Proration Logic

For a mid-month lease:

```text
Monthly Rent
÷
Days in Billing Period
×
Eligible Days
```

Example:

```text
Monthly Rent = ₹30,000
Month = 30 days
Occupancy = 15 days

Revenue = ₹15,000
```

However, the **exact proration convention should be configurable**:

```text
Actual Days
30-Day Convention
30/360
Contractual Rule
```

because the supplied documents do not define the proration formula.

---

# 55. Lease Termination Flow

```text
Termination Request
 ↓
Validate Lease
 ↓
Determine Vacate Date
 ↓
Calculate Final Rent
 ↓
Calculate Utilities
 ↓
Calculate Penalties
 ↓
Calculate Damages
 ↓
Calculate Deposit
 ↓
Calculate Refund
 ↓
Final Tenant Statement
 ↓
Approval
 ↓
Close Lease
```

---

# 56. Tenant Statement

The system should provide a consolidated ledger:

```text
Tenant
Property
Unit
Lease

Opening Balance
+ Rent
+ Penalties
+ Damages
+ Other Charges
- Receipts
- Adjustments
- Deposit Settlement
= Closing Balance
```

This should be one of the most important Finance screens.

---

# 57. Complete Tenant Financial Lifecycle

```text
TENANT CREATED
      ↓
LEASE CREATED
      ↓
RENT SCHEDULE
      ↓
RENT RECEIVABLE
      ↓
PAYMENT
      ↓
RECEIPT
      ↓
PDC / CASH / BANK
      ↓
BANK CLEARING
      ↓
RECEIVABLE SETTLEMENT
      ↓
LEASE ACTIVE
      ↓
RENTAL REVENUE
      ↓
PENALTY / DAMAGE / OTHER CHARGES
      ↓
LEASE TERMINATION
      ↓
DEPOSIT SETTLEMENT
      ↓
FINAL STATEMENT
      ↓
LEASE CLOSED
```

---

# 58. Critical Edge Cases

## Rent

### EC-01 — Tenant pays before rent is generated

System should determine whether the payment is:

```text
Advance
```

or:

```text
Settlement of Existing Receivable
```

It should not automatically create duplicate revenue.

---

### EC-02 — Tenant pays partial rent

Example:

```text
Rent Due = ₹10,000
Payment = ₹6,000
```

Remaining:

```text
₹4,000
```

Tenant receivable remains open.

---

### EC-03 — Tenant overpays

```text
Rent Due = ₹10,000
Payment = ₹12,000
```

System should maintain:

```text
₹10,000 → Rent settlement
₹2,000 → Tenant advance/credit
```

The exact liability/advance account should be configured.

---

### EC-04 — Rent waived

```text
Rent Due
 ↓
Waiver Approval
 ↓
Adjustment
```

No manual deletion of the original rent posting.

---

### EC-05 — Rent revised after posting

Use:

```text
Original Voucher
 ↓
Adjustment / Reversal
 ↓
Correct Voucher
```

Never overwrite historical accounting.

---

# 59. PDC Edge Cases

### EC-06 — Duplicate PDC number

Block unless:

```text
Different Bank
+
Different Instrument Context
```

and Finance explicitly approves.

---

### EC-07 — PDC amount differs from rent

Allow but flag:

```text
Expected = ₹5,000
PDC = ₹5,500
```

Difference should require classification.

---

### EC-08 — PDC dated in future

Allow as:

```text
PDC In Hand
```

but prevent premature deposit.

---

### EC-09 — PDC expired

Flag:

```text
Expired PDC
```

for Finance action.

---

### EC-10 — PDC returned

Move to:

```text
Returned
```

and restore receivable according to the supplied return logic.

---

### EC-11 — Re-presented PDC

Maintain one PDC identity with multiple presentation attempts.

---

### EC-12 — Tenant changes unit

Existing PDC should remain linked to its original contractual obligation.

Do not automatically change its unit account.

---

# 60. Deposit Edge Cases

### EC-13 — Deposit exceeds required amount

Flag excess.

### EC-14 — Deposit insufficient for deductions

Create remaining tenant receivable.

### EC-15 — Tenant has multiple deposits

Maintain separate deposit types.

### EC-16 — Deposit transferred between units

Require controlled transfer.

### EC-17 — Deposit belongs to old lease

Never automatically apply it to a new lease.

---

# 61. Expense Edge Cases

### EC-18 — Invoice received after month-end

Use accrual.

### EC-19 — Invoice lower than accrual

Reverse excess.

### EC-20 — Invoice higher than accrual

Post difference to expense.

### EC-21 — Expense belongs to multiple properties

Support allocation:

```text
Property A 40%
Property B 35%
Property C 25%
```

### EC-22 — Common-area expense

Do not assign to an individual unit unless allocation policy requires it.

---

# 62. Vendor Edge Cases

### EC-23 — Duplicate invoice

Check:

```text
Vendor
Invoice Number
Invoice Date
Amount
```

### EC-24 — Vendor credit note

Create supplier credit and reduce payable.

### EC-25 — Advance to vendor

Do not immediately recognize expense.

Maintain vendor advance until invoice.

---

# 63. Asset Edge Cases

### EC-26 — Asset partially used

Support capitalization date separately from purchase date.

### EC-27 — Asset transferred between properties

Update:

```text
Asset
Property
Cost Centre
Location
```

without losing historical location.

### EC-28 — Asset disposed before fully depreciated

Calculate:

```text
Sale Proceeds
-
Net Book Value
=
Gain/Loss
```

### EC-29 — Asset impairment

Require separate adjustment workflow.

---

# 64. Payroll Edge Cases

### EC-30 — Employee joins mid-month

Prorate salary.

### EC-31 — Employee exits mid-month

Calculate final salary.

### EC-32 — EOSB provision differs from actual settlement

Post adjustment.

### EC-33 — Leave provision changes

Recalculate provision and adjustment.

---

# 65. Intercompany Edge Cases

### EC-34 — One side posted, other side missing

Show:

```text
Intercompany Mismatch
```

### EC-35 — Amount mismatch

Example:

```text
Company A = ₹100,000
Company B = ₹95,000
```

Create reconciliation exception.

---

# 66. Accounting Period Controls

Finance should maintain:

```text
Open
Soft Closed
Closed
Locked
```

A posted voucher cannot be edited in a closed period.

Corrections should occur through:

```text
Adjustment Voucher
```

or:

```text
Reversal + Correct Entry
```

---

# 67. Voucher Types

The final system should support at minimum:

```text
Receipt Voucher
Payment Voucher
Journal Voucher
Deposit Voucher
Cheque Return Voucher
Revenue Voucher
Purchase Voucher
Expense Voucher
Credit Note
Debit Note
Adjustment Voucher
Reversal Voucher
Depreciation Voucher
Accrual Voucher
Provision Voucher
Asset Disposal Voucher
Intercompany Voucher
```

The original document specifically defines Receipt, Deposit and Cheque Returned vouchers and Revenue Generation.

---

# 68. Voucher Approval Workflow

```text
Draft
 ↓
Submitted
 ↓
Validation
 ↓
Finance Approval
 ↓
Posted
```

High-value transactions can have:

```text
Maker
 ↓
Checker
 ↓
Approver
```

---

# 69. No Direct GL Editing for Operational Users

Users should select business transactions rather than GL codes.

For example:

```text
Cashier selects:

Transaction:
Security Deposit

Payment Mode:
Cash

Property:
AAA

Unit:
Flat 15

Amount:
₹5,000
```

The system determines:

```text
Dr Cash In Hand
Cr Deposit - AAA Flat 15
```

This dramatically reduces accounting errors.

---

# 70. COA Mapping Engine

The system should maintain a mapping table:

```text
Transaction Type
+
Property/Unit
+
Counterparty
+
Payment Mode
+
Business Context
        ↓
GL
+
SL
+
Cost Centre
```

Example:

```text
Rent Receipt
+
PDC
+
AAA Flat 15
        ↓
12900001
PDC In Hand

21400007
PDC Received - AAA Flat 15
```

---

# 71. Unit Account Mapping

The Unit Ac Codes sheet should become a system configuration table.

For every unit:

```text
Property
Unit Code
PDC Account
Deposit Account
Receivable Account
```

Example:

```text
AAA - Flat15

PDC:
21400007

Deposit:
21500007

Receivable:
12413007
```

The application should retrieve these automatically.

---

# 72. Account Validation Engine

Before posting:

```text
Does Property exist?
       ↓
Does Unit exist?
       ↓
Does Unit belong to Property?
       ↓
Does Tenant belong to Unit?
       ↓
Does Lease belong to Tenant + Unit?
       ↓
Does mapped SL exist?
       ↓
Is GL active?
       ↓
Is accounting period open?
       ↓
Debit = Credit?
       ↓
POST
```

---

# 73. Financial Integrity Rules

The system must enforce:

### Rule 1

```text
Every voucher must balance.

Total Debit = Total Credit
```

### Rule 2

```text
Every unit transaction must have a valid unit cost centre.
```

### Rule 3

```text
Every tenant transaction must reference a tenant.
```

### Rule 4

```text
Every rent transaction must reference a lease.
```

### Rule 5

```text
Posted transactions cannot be deleted.
```

### Rule 6

```text
PDC cannot be deposited twice.
```

### Rule 7

```text
Revenue cannot be generated twice for the same unit/lease/period.
```

### Rule 8

```text
Returned PDC cannot remain in Cleared status.
```

---

# 74. Month-End Closing

The Finance Manager should run:

```text
Month-End Checklist
```

### Tenant

```text
✓ Rent generation completed
✓ Receivables reviewed
✓ Collections posted
✓ PDCs reconciled
✓ Returned PDCs reviewed
✓ Deposits reconciled
```

### Expenses

```text
✓ Vendor invoices posted
✓ Accruals created
✓ Prepayments amortized
✓ Utility invoices posted
```

### Assets

```text
✓ Asset additions posted
✓ Asset disposals posted
✓ Depreciation generated
```

### Payroll

```text
✓ Payroll posted
✓ Leave provision updated
✓ EOSB provision updated
```

### Banking

```text
✓ Bank reconciliation completed
```

### Accounting

```text
✓ Trial balance reviewed
✓ Suspense/unmapped transactions reviewed
✓ Intercompany reconciled
✓ Period closed
```

---

# 75. Property Profitability

Because every property/unit has a cost-centre relationship, the system should generate:

```text
Property Revenue
-
Property Direct Expenses
=
Property Operating Profit
```

Example:

```text
Rental Revenue                ₹500,000
Management Fee                 ₹50,000
Penalty Income                  ₹5,000
Damage Income                   ₹3,000
                              ---------
Total Revenue                 ₹558,000

Less:

Labour                        ₹100,000
AMC                            ₹40,000
Utilities                      ₹35,000
Repairs                        ₹25,000
Other Direct Expenses          ₹20,000
                              ---------
Total Expenses                ₹220,000

Property Operating Profit     ₹338,000
```

This is one of the strongest reasons to maintain unit/property cost centres.

---

# 76. Unit Profitability

For every unit:

```text
Rent Revenue
+
Other Unit Income
-
Unit Expenses
=
Unit Contribution
```

Example:

```text
Flat 15

Revenue                 ₹60,000
Electricity              ₹3,000
Repair                   ₹2,000
Check-out expense        ₹1,000

Contribution            ₹54,000
```

---

# 77. Vacancy Cost Analytics

Because the COA specifically has:

```text
Electricity & Water - Vacant Period
```

the system can produce:

```text
Vacant Units
+
Vacancy Days
+
Vacancy Utilities
+
Repairs
=
Vacancy Cost
```

This can become an important management KPI.

---

# 78. Property Management Fee

The system should treat Property Management Fee separately:

```text
Management Contract
 ↓
Fee Calculation
 ↓
Invoice/Receivable
 ↓
Revenue
 ↓
Collection
```

Possible fee models:

```text
Fixed Fee
Percentage of Rent
Percentage of Collection
Hybrid
```

The exact calculation should be contract-configurable.

---

# 79. AI Finance Copilot

Because this is intended to showcase AI capability, the Finance module can include an AI layer.

The AI should operate over:

```text
GL
SL
Tenant Ledger
Property Ledger
Unit Ledger
PDC Register
Deposit Register
Expense Ledger
Lease Data
```

Example queries:

> "Show all overdue tenants in Property AAA."

> "Why is Flat 15 showing ₹5,000 receivable?"

> "Which PDCs are due for deposit this week?"

> "Which PDCs were returned in the last 30 days?"

> "What is the vacancy cost for Property AAA?"

> "Which properties have the highest maintenance expense?"

> "Why did Property AAA's profit decline this month?"

---

# 80. AI Anomaly Detection

The system can proactively identify:

```text
Duplicate PDC
Duplicate revenue
Unusual expense
Unexpected increase in utilities
Repeated cheque returns
Unusual tenant adjustments
Missing revenue
Unposted invoice
Unreconciled bank item
Intercompany mismatch
Deposit outstanding after lease closure
```

---

# 81. AI Cash Flow Forecast

AI can use:

```text
Active leases
Rent schedule
Historical collections
PDC schedule
Outstanding receivables
Vendor obligations
Loan schedules
Expected expenses
```

to generate:

```text
Expected Cash Inflow
Expected Cash Outflow
Net Cash Flow
Collection Risk
Liquidity Risk
```

---

# 82. AI-Powered Month-End Copilot

The AI can review:

```text
Revenue
Receivables
PDC
Deposits
AP
Accruals
Prepaids
Assets
Depreciation
Intercompany
Bank
```

and produce:

```text
Month-End Status
Completed Items
Exceptions
Missing Transactions
High-Risk Items
Recommended Actions
```

The AI should recommend actions but **not silently post accounting entries**.

---

# 83. Complete Product Flow

The final end-to-end system should be:

```text
                         PROPERTY
                            │
                            ↓
                           UNIT
                            │
                            ↓
                          TENANT
                            │
                            ↓
                           LEASE
                            │
                ┌───────────┴────────────┐
                ↓                        ↓
             REVENUE                  DEPOSIT
                ↓                        ↓
          RENT GENERATION          RECEIPT
                ↓                        ↓
          RECEIVABLE              DEPOSIT LIABILITY
                ↓
        COLLECTION
                ↓
      ┌─────────┼──────────┐
      ↓         ↓          ↓
     PDC       CASH      BANK
      ↓         ↓
   PDC IN     CASH IN
    HAND       HAND
      ↓         ↓
    BANK      BANK
      ↓
  RECEIVABLE
      ↓
  SETTLEMENT
```

Parallel operating cycle:

```text
PROPERTY
   ↓
OPERATING EXPENSE
   ↓
VENDOR
   ↓
AP
   ↓
PAYMENT
   ↓
BANK
```

And:

```text
PROPERTY
   ↓
ASSET
   ↓
DEPRECIATION
   ↓
PROPERTY EXPENSE
```

And:

```text
PROPERTY
   ↓
VACANCY
   ↓
VACANCY UTILITIES
   ↓
VACANCY COST
```

And:

```text
TENANT
   ↓
LEASE TERMINATION
   ↓
FINAL STATEMENT
   ↓
DEPOSIT SETTLEMENT
   ↓
REFUND / RECOVERY
   ↓
LEASE CLOSED
```

---

# 84. Final Finance Architecture

The Finance module should ultimately consist of these accounting engines:

```text
┌───────────────────────────────────────────┐
│              FINANCE ENGINE               │
├───────────────────────────────────────────┤
│                                           │
│  1. Tenant Receivable Engine              │
│  2. Rent Revenue Engine                   │
│  3. PDC Engine                            │
│  4. Deposit Engine                        │
│  5. Guarantee Engine                      │
│  6. Collection Engine                     │
│  7. Vendor/AP Engine                      │
│  8. Expense Engine                        │
│  9. Accrual Engine                        │
│ 10. Provision Engine                      │
│ 11. Prepayment Engine                     │
│ 12. Asset Engine                          │
│ 13. Depreciation Engine                   │
│ 14. Inventory Engine                      │
│ 15. Payroll Posting Engine                │
│ 16. Bank & Cash Engine                    │
│ 17. Loan Engine                           │
│ 18. Intercompany Engine                   │
│ 19. Related Party Engine                  │
│ 20. Revenue Engine                        │
│ 21. Property Disposal Engine              │
│ 22. Cost Centre Engine                    │
│ 23. GL/SL Posting Engine                  │
│ 24. Reconciliation Engine                 │
│ 25. Month-End Closing Engine              │
│ 26. AI Finance Copilot                    │
│                                           │
└───────────────────────────────────────────┘
```

---

# 85. Most Important Design Principle

The system should **not** be built as:

```text
Transaction → GL
```

It should be:

```text
Business Event
      ↓
Property / Unit / Counterparty
      ↓
Business Rule
      ↓
Transaction Type
      ↓
COA Mapping
      ↓
SL
      ↓
GL
      ↓
Cost Centre
      ↓
Balanced Voucher
      ↓
Subledger
      ↓
Financial Reporting
```

For example:

```text
Tenant pays rent through PDC
```

should internally become:

```text
Tenant
  +
Property
  +
Unit
  +
Lease
  +
Rent
  +
PDC
      ↓
Business Rule
      ↓
PDC In Hand
      +
PDC Received
      ↓
Receipt Voucher
      ↓
GL Posting
      ↓
PDC Register
      +
Tenant Ledger
      +
Unit Ledger
      +
Property Ledger
```

That architecture will allow the product to support **operational workflows and proper accounting simultaneously**, instead of creating a generic accounting screen with property fields attached.

---

# 86. Important COA Configuration Decisions Before Development

There are several places where the workbook defines accounts but does not define the exact business rule. These should be configurable rather than assumed.

## A. 21100 vs 21500 Deposits

The COA contains both:

```text
21100 Tenant - Refundable Deposit
```

and:

```text
21500 Deposits - Leasing Customers
```

The business must explicitly define which deposit types use which account.

---

## B. 12410 vs 12413 Receivables

The COA has:

```text
12410 Sundry Debtors
12413 Tenant Receivables
```

The system should use:

```text
Tenant + Unit + Lease
        ↓
12413 Tenant Receivables
```

and reserve 12410 for non-unit-specific/general debtor scenarios unless Finance specifies otherwise.

---

## C. 12411 Legal Receivables

Define the exact point at which:

```text
Tenant Receivable
```

becomes:

```text
Legal Receivable
```

---

## D. Property Management Fee

The workbook contains:

```text
41101001
M.I-Beverly Hills Garden-1
```

The system should determine whether future properties get:

```text
One common Property Management Fee account
```

or:

```text
Property-specific SLs
```

---

## E. Tax/GST/VAT

The supplied COA does not visibly establish a dedicated tax/VAT structure in the sheets reviewed.

Therefore the Finance engine should **not invent tax accounts**.

If taxation is required, a separate tax-account configuration should be added.

---

## F. Bank Accounts

The current COA shows:

```text
12000001 Bank
```

If the company operates multiple bank accounts, Finance should decide whether to create separate SLs such as:

```text
Bank - Account 1
Bank - Account 2
Bank - Account 3
```

rather than keeping all balances under one account.

---

# 87. Final User Journey

From an end user's perspective, the complete journey becomes:

```text
LEASING
   ↓
Lease Created
   ↓
FINANCE
   ↓
Rent Schedule
   ↓
Revenue / Receivable
   ↓
CASHIER
   ↓
Payment Received
   ↓
PDC / Cash / Bank
   ↓
PDC MANAGEMENT
   ↓
Deposit / Clearing / Return
   ↓
TENANT LEDGER
   ↓
Receivable Settlement
   ↓
PROPERTY OPERATIONS
   ↓
Maintenance / Utilities / AMC / Staff
   ↓
AP
   ↓
Vendor Payment
   ↓
BANK
   ↓
ASSETS
   ↓
Depreciation
   ↓
MONTH END
   ↓
Accruals
   ↓
Provisions
   ↓
Reconciliation
   ↓
Trial Balance
   ↓
Property P&L
   ↓
Management Reporting
   ↓
AI FINANCE COPILOT
```

## The result

The product becomes much more than a **property rent collection application**.

It becomes a:

**Property-aware financial management platform**

where every financial event can be traced:

```text
Property
   ↓
Unit
   ↓
Tenant / Vendor / Employee
   ↓
Contract
   ↓
Transaction
   ↓
Voucher
   ↓
COA
   ↓
Cost Centre
   ↓
GL
   ↓
Property Profitability
```

That is the architecture I would recommend using as the **baseline Finance PRD / functional specification** for the project.