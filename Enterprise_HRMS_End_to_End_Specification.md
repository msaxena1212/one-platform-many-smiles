# Enterprise HRMS — End-to-End Functional & Technical Specification

## 1. Document Purpose

This document defines the end-to-end functional, technical, workflow, data, validation, reporting, security, integration, and operational requirements for an enterprise-grade Human Resource Management System (HRMS) to be integrated into a Property Management System (PMS).

The HRMS covers:

- Core HR and employee lifecycle
- Organization and master data
- Employee self-service
- Attendance and workforce management
- Shift management
- Leave and comp-off management
- Overtime
- Payroll and statutory processing
- Tax declarations
- Performance and appraisal
- Learning and knowledge transfer
- Travel and expense management
- Asset management
- Complaints and help desk
- Employee documents
- Employee transfer
- Resignation and full-and-final settlement
- RBAC and workflow
- Bulk import/export
- Reporting and dashboards
- Audit and compliance

> **Scope:** This specification intentionally excludes AI/ML functionality.

---

# 2. Product Vision

The HRMS should provide a single source of truth for the employee lifecycle from onboarding and employment through attendance, leave, salary, performance, expenses, assets, resignation, and full-and-final settlement.

The system should support:

1. Multi-company operation
2. Multi-entity operation
3. Multi-branch operation
4. Multi-department organization
5. Multi-location workforce
6. Employee self-service
7. Manager self-service
8. HR administration
9. Payroll administration
10. Finance integration
11. Configurable approval workflows
12. Role-based data access
13. Auditability
14. Bulk operations
15. Historical data tracking
16. Integration with external attendance devices and financial systems

---

# 3. High-Level Module Architecture

```text
HRMS
│
├── Dashboard & Analytics
│
├── Core HR
│   ├── Employee Master
│   ├── Employee Details
│   ├── Employee Transfer
│   ├── Organization
│   ├── Company
│   ├── Branch
│   ├── Entity
│   ├── Business Unit
│   ├── Department
│   ├── Sub Department
│   ├── Designation
│   ├── Grade
│   ├── Employment Type
│   └── Contract Type
│
├── Workforce Management
│   ├── Attendance
│   ├── Attendance Calendar
│   ├── Attendance Reports
│   ├── Shift Master
│   ├── Shift Allocation
│   ├── Week Off
│   ├── Comp Off
│   ├── Overtime
│   └── Attendance Generation
│
├── Leave Management
│   ├── Leave Management
│   ├── Leave Apply
│   ├── Leave Approval
│   ├── Leave Cancellation
│   ├── Cancelled Leave
│   └── Leave Encashment
│
├── Payroll
│   ├── Salary Components
│   ├── Salary Templates
│   ├── Employee Salary
│   ├── Payroll Cycle
│   ├── Generate Attendance
│   ├── Process Salary
│   ├── Salary Approval
│   ├── Approved Payroll
│   ├── Payslip
│   ├── Variable Earnings
│   ├── Arrear Salary
│   ├── Incentive
│   ├── Fine Management
│   ├── Loan
│   └── FNF Settlement
│
├── Tax & Statutory
│   ├── Statutory Components
│   ├── Tax Slab
│   ├── Declaration Form
│   └── Upload Declaration Form
│
├── Performance
│   ├── KPA Master
│   ├── Employee Appraisal
│   ├── Self Assessment
│   ├── Colleague Review
│   ├── Appraisal Interval
│   └── Ad Hoc Appraisal
│
├── Learning & Development
│   ├── Learning Gallery
│   ├── Course Category
│   ├── Course Approval
│   └── KT Master
│
├── Employee Services
│   ├── Announcements
│   ├── Complaints
│   ├── Help Desk
│   ├── My Templates
│   ├── Change Password
│   └── Company Review
│
├── Travel & Expenses
│   ├── Travel & Reimbursement
│   ├── Travel Expense
│   ├── Travel Allowance
│   ├── Other Expense
│   ├── Reimbursement Expense
│   └── Expense Types
│
├── Asset Management
│   ├── Asset Master
│   ├── Asset Allocation
│   ├── Asset Transfer
│   ├── Asset Return
│   └── Employee Asset Mapping
│
├── Employee Lifecycle / Exit
│   ├── Resignation
│   ├── Notice Period
│   ├── Knowledge Transfer
│   ├── Exit Clearance
│   ├── Asset Clearance
│   └── FNF Settlement
│
├── Documents
│   ├── Employee Documents
│   ├── HR Documents
│   ├── Salary Documents
│   ├── Tax Documents
│   └── Exit Documents
│
├── Administration
│   ├── RBAC
│   ├── Workflow Master
│   ├── Global Minutes
│   ├── Financial Year
│   ├── Currency
│   ├── Country
│   ├── State
│   ├── City
│   ├── Region
│   ├── Bank
│   ├── Device User ID
│   └── Bulk Upload
│
└── Reporting
    ├── Attendance Reports
    ├── Leave Reports
    ├── Employee Reports
    ├── Payroll Reports
    ├── Expense Reports
    ├── Appraisal Reports
    └── Exit/FNF Reports
```

---

# 4. User Personas

## 4.1 Super Administrator

Responsibilities:

- Configure system
- Manage companies
- Manage entities
- Manage branches
- Configure RBAC
- Configure workflows
- Manage global settings
- Manage master data

## 4.2 HR Administrator

Responsibilities:

- Employee management
- Attendance
- Leave
- Transfers
- Appraisal
- Documents
- Announcements
- Complaints
- Exit management

## 4.3 HR Manager

Responsibilities:

- HR approvals
- Employee lifecycle
- Leave approvals
- Transfers
- Appraisals
- Exit approvals
- Reports

## 4.4 Payroll Administrator

Responsibilities:

- Salary configuration
- Payroll cycle
- Salary processing
- Statutory deductions
- Tax
- Payslip
- Arrears
- Incentives
- Fines

## 4.5 Finance User

Responsibilities:

- Payroll verification
- Reimbursements
- Expenses
- Loans
- FNF
- Financial reports

## 4.6 Manager

Responsibilities:

- Team attendance
- Leave approval
- Overtime approval
- Expense approval
- Appraisal
- Course approval
- Employee review

## 4.7 Employee

Responsibilities:

- View/update permitted profile information
- Apply leave
- View attendance
- Apply overtime
- Apply comp-off
- View payslip
- Submit declarations
- Apply loan
- Submit expenses
- Raise complaints
- Raise help desk tickets
- Complete appraisal
- Review colleagues
- Apply resignation

---

# 5. Core Design Principles

## 5.1 Employee as Central Entity

Employee should be the central HRMS business entity.

All major HR transactions should reference an employee ID.

```text
Employee
├── Organization Assignment
├── Reporting Manager
├── Employment Details
├── Salary
├── Attendance
├── Leave
├── Shift
├── Overtime
├── Appraisal
├── Learning
├── Expenses
├── Loans
├── Assets
├── Documents
├── Complaints
└── Exit
```

## 5.2 Effective Dating

Any configuration that changes over time should support:

- Effective From
- Effective To
- Current Status
- Historical Version

Examples:

- Salary
- Department
- Designation
- Grade
- Branch
- Shift
- Reporting Manager
- Employment Type
- Leave entitlement

## 5.3 Immutable Financial Records

Once payroll is finalized, financial transactions should not be directly overwritten.

Corrections should use:

- Reversal
- Adjustment
- Arrear
- Recovery
- Reprocessing with audit trail

## 5.4 Audit Everything Important

Track:

- Created By
- Created At
- Updated By
- Updated At
- Approved By
- Approved At
- Status
- Previous Value
- New Value
- IP/device where appropriate
- Reason for change

---

# 6. Dashboard

## 6.1 HRMS Dashboard

### KPI Cards

- Total Employees
- Active Employees
- New Joiners
- Employees on Notice
- Employees Exited
- Present Today
- Absent Today
- Employees on Leave
- Late Employees
- Early Departures
- Pending Approvals
- Open Complaints
- Open Help Desk Tickets
- Pending Expenses
- Payroll Status

### Charts

- Headcount by Department
- Headcount by Branch
- Headcount by Designation
- Headcount by Employment Type
- Attendance Trend
- Leave Trend
- Overtime Trend
- Attrition Trend
- Payroll Cost Trend
- Expense Trend

### Quick Actions

- Add Employee
- Apply Leave
- Approve Leave
- Allocate Shift
- Upload Attendance
- Start Payroll
- Create Announcement
- Create Appraisal Cycle

---

# 7. Employee Master

## 7.1 Employee Identification

Fields:

- Employee ID
- Employee Code
- Employee Number
- Prefix
- First Name
- Middle Name
- Last Name
- Display Name
- Date of Birth
- Gender
- Marital Status
- Nationality
- Personal Email
- Official Email
- Mobile Number
- Alternate Contact

## 7.2 Employment Information

- Joining Date
- Confirmation Date
- Employment Type
- Contract Type
- Employee Status
- Probation Status
- Probation End Date
- Notice Period
- Date of Exit
- Exit Reason
- Rehire Eligibility

## 7.3 Organization

- Company
- Entity
- Branch
- Business Unit
- Department
- Sub Department
- Designation
- Grade
- Cost Center
- Location
- Reporting Manager
- HR Manager

## 7.4 Bank Information

- Bank
- Account Number
- IFSC/SWIFT where applicable
- Account Holder Name
- Account Type
- Primary Bank Flag

Sensitive bank information must be protected.

## 7.5 Employee Statuses

Suggested statuses:

```text
DRAFT
ACTIVE
PROBATION
CONFIRMED
ON_NOTICE
SUSPENDED
ON_LONG_LEAVE
INACTIVE
RESIGNED
TERMINATED
RETIRED
EXITED
```

---

# 8. Employee Details

Employee Details should provide a consolidated employee profile.

Sections:

- Personal
- Employment
- Organization
- Contact
- Bank
- Emergency Contact
- Family
- Education
- Experience
- Documents
- Salary
- Attendance
- Leave
- Shift
- Assets
- Appraisal
- Learning
- Expenses
- Loans
- Complaints
- Exit

---

# 9. Employee Transfer

Transfers should support:

- Department transfer
- Branch transfer
- Entity transfer
- Company transfer
- Business Unit transfer
- Designation change
- Grade change
- Reporting Manager change
- Location change

## Workflow

```text
Transfer Request
    ↓
Validation
    ↓
Manager Approval
    ↓
HR Approval
    ↓
Effective Date
    ↓
Employee Master Update
    ↓
History Record
    ↓
Payroll/Attendance Impact
```

## Edge Cases

- Transfer effective in the middle of payroll
- Transfer across companies
- Transfer across states
- Transfer with salary change
- Transfer with shift change
- Transfer while on leave
- Transfer while on notice
- Transfer after payroll lock

---

# 10. Organization Master

## 10.1 Company Master

Fields:

- Company Code
- Company Name
- Legal Name
- Registration Details
- Address
- Country
- State
- City
- Currency
- Financial Year
- Tax/Statutory configuration
- Status

## 10.2 Entity Master

Defines legal/operational entities under a company.

## 10.3 Branch Setup

Fields:

- Branch Code
- Branch Name
- Entity
- Address
- Region
- Time Zone
- Contact
- Status

## 10.4 Business Unit

Supports organizational segmentation.

## 10.5 Department

Fields:

- Department Code
- Department Name
- Business Unit
- Department Head
- Status

## 10.6 Sub Department

Linked to Department.

## 10.7 Designation

Fields:

- Designation Code
- Designation Name
- Grade
- Department
- Job Level
- Status

## 10.8 Grade Master

Fields:

- Grade
- Level
- Minimum Salary
- Maximum Salary
- Applicable Benefits

## 10.9 Employment Type

Examples:

- Permanent
- Contract
- Temporary
- Intern
- Consultant
- Part Time

## 10.10 Contract Type

Examples:

- Fixed Term
- Indefinite
- Project Based
- Probationary

---

# 11. Attendance Management

## 11.1 Attendance Sources

- Biometric device
- Attendance machine
- Mobile
- Web
- Manual HR entry
- Bulk Excel
- API integration

## 11.2 Attendance Event

Fields:

- Employee
- Date
- Time
- Direction
- Device
- Device User ID
- Source
- Location
- Raw Event ID

## 11.3 Processed Attendance

Fields:

- Employee
- Attendance Date
- Shift
- First In
- Last Out
- Total Working Hours
- Break Hours
- Late Minutes
- Early Minutes
- Overtime Minutes
- Status
- Regularization Status

## Attendance Statuses

```text
PRESENT
ABSENT
HALF_DAY
WEEK_OFF
HOLIDAY
LEAVE
COMP_OFF
ON_DUTY
LATE
EARLY_EXIT
MISSING_PUNCH
```

---

# 12. Attendance Calendar

Employee calendar should show:

- Present
- Absent
- Leave
- Holiday
- Week Off
- Comp Off
- Overtime
- Late
- Early Exit
- Missing Punch

Calendar views:

- Monthly
- Weekly
- Daily

---

# 13. Attendance Regularization

Although not explicitly listed, this should be included because missing punches are common.

Employee can request:

- Missing In
- Missing Out
- Incorrect time
- Wrong shift
- Incorrect attendance status

Workflow:

```text
Employee Request
↓
Manager Approval
↓
HR Validation if configured
↓
Attendance Recalculation
```

Edge cases:

- Request after payroll lock
- Duplicate regularization
- Regularization on leave
- Regularization on holiday
- Regularization on week off

---

# 14. Face/Device Attendance Integration

This module should support attendance-device integration without embedding AI.

### Device User ID Master

Fields:

- Device
- Device User ID
- Employee
- Effective Date
- Status

### Device Integration

```text
Attendance Device
    ↓
Raw Attendance Events
    ↓
Integration Service
    ↓
Validation
    ↓
Deduplication
    ↓
Attendance Processing
```

Important technical requirements:

- Idempotency
- Retry mechanism
- Duplicate event detection
- Offline event handling
- Device connectivity monitoring
- Error logging

---

# 15. Shift Master

Fields:

- Shift Code
- Shift Name
- Start Time
- End Time
- Break Duration
- Grace In
- Grace Out
- Late Threshold
- Early Threshold
- Overtime Eligibility
- Cross-Day Flag
- Night Shift Flag
- Status

## Cross-Day Shift

Example:

```text
22:00 → 06:00
```

The attendance engine must associate both timestamps with the correct work date.

---

# 16. Shift Allocation

Support:

- Employee-level allocation
- Department-level allocation
- Branch-level allocation
- Bulk allocation
- Rotational shift allocation

Validation:

- Employee must be active
- Effective date cannot conflict
- Existing allocation must be closed
- Shift must be active

---

# 17. Week Off

Support:

- Fixed weekly off
- Multiple weekly offs
- Rotational weekly off
- Branch-specific week off
- Employee-specific override

Examples:

- Sunday
- Saturday + Sunday
- Alternate Saturday
- Friday
- Custom rotation

---

# 18. Comp Off

## Comp Off Assignment

Fields:

- Employee
- Worked Date
- Eligible Hours
- Comp Off Days/Hours
- Expiry Date
- Reason
- Approval
- Status

Statuses:

```text
EARNED
AVAILABLE
USED
EXPIRED
CANCELLED
```

Edge cases:

- Comp off expires
- Partial use
- Multiple comp offs
- Comp off used before approval
- Comp off during payroll lock

---

# 19. Overtime

## Overtime Master

Configuration:

- Eligibility
- Minimum overtime
- Maximum overtime
- Rate
- Multiplier
- Weekday rate
- Weekend rate
- Holiday rate
- Approval requirement

## Overtime Request

Employee submits:

- Date
- Start Time
- End Time
- Reason

Workflow:

```text
Employee
↓
Manager
↓
HR/Payroll
↓
Approved Overtime
↓
Payroll
```

Edge cases:

- Overtime overlaps shift
- Overtime overlaps leave
- Overtime on holiday
- Overtime exceeds maximum
- Duplicate request
- Payroll already processed

---

# 20. Leave Management

## Leave Master

Fields:

- Leave Code
- Leave Name
- Paid/Unpaid
- Accrual Rule
- Annual Entitlement
- Carry Forward
- Encashment Allowed
- Minimum Days
- Maximum Days
- Advance Notice
- Half Day Allowed
- Negative Balance Allowed
- Probation Eligibility
- Gender Eligibility
- Status

## Leave Apply

Fields:

- Employee
- Leave Type
- From Date
- To Date
- Duration
- Reason
- Attachment
- Contact During Leave

## Leave Approval

Approval chain should be configurable.

```text
Employee
↓
Reporting Manager
↓
Department/HR
↓
Final Approval
```

---

# 21. Leave Validation Rules

Before submission:

1. Employee must be active.
2. Leave type must be active.
3. Dates must be valid.
4. Start date cannot exceed end date.
5. Leave balance must be sufficient unless negative balance is allowed.
6. Dates must not overlap approved leave.
7. Holiday/week-off treatment must follow configuration.
8. Required attachment must exist where applicable.
9. Notice period rules must be satisfied.
10. Workflow approver must exist.

---

# 22. Leave Cancellation

Support:

- Full cancellation
- Partial cancellation
- Cancellation before leave
- Cancellation during leave
- Cancellation after leave

Rules should be configurable.

Cancellation should:

- Restore leave balance
- Reverse attendance impact
- Reverse payroll impact if permitted
- Maintain cancellation history

---

# 23. Leave Encashment

Fields:

- Employee
- Leave Type
- Eligible Balance
- Encashment Units
- Calculation Rate
- Gross Amount
- Deductions
- Net Amount
- Payroll Cycle
- Approval

Edge cases:

- Maximum encashment limit
- Minimum balance requirement
- Expired leave
- Resigned employee
- FNF encashment
- Duplicate encashment

---

# 24. Payroll Architecture

Payroll must operate as a controlled processing cycle.

```text
Payroll Cycle
↓
Freeze Employee Inputs
↓
Generate Attendance
↓
Calculate Earnings
↓
Calculate Deductions
↓
Calculate Statutory
↓
Calculate Tax
↓
Calculate Net Salary
↓
Validation
↓
Payroll Review
↓
Approval
↓
Finalize
↓
Payslip
```

---

# 25. Salary Components

Support:

## Earnings

- Basic
- HRA
- Conveyance
- Special Allowance
- Medical
- Travel
- Incentive
- Bonus
- Overtime
- Variable Earnings
- Arrears

## Deductions

- Provident Fund
- Professional Tax
- Tax
- Loan
- Advance
- Fine
- Other deductions

Every component should have configurable:

- Formula
- Fixed Amount
- Percentage
- Taxable Flag
- Statutory Flag
- Payroll Frequency
- Pro-rata behavior
- Effective date

---

# 26. Salary Templates

A salary template defines the standard salary structure for a grade/designation.

Example:

```text
Template
├── Basic
├── HRA
├── Special Allowance
├── Employer Contributions
├── Employee Contributions
└── Other Components
```

Templates should be versioned.

---

# 27. Employee Salary

Employee salary should maintain historical versions.

Fields:

- Employee
- Salary Template
- Effective Date
- Basic
- Gross
- CTC
- Component Values
- Revision Reason
- Approved By

Do not overwrite old salary records.

---

# 28. Payroll Cycle

Fields:

- Payroll Month
- Payroll Year
- Company
- Entity
- Branch
- Start Date
- End Date
- Cutoff Date
- Processing Date
- Payment Date
- Status

Statuses:

```text
DRAFT
OPEN
INPUT_LOCKED
PROCESSING
CALCULATED
UNDER_REVIEW
PENDING_APPROVAL
APPROVED
FINALIZED
PAID
CANCELLED
```

---

# 29. Generate Attendance

Payroll should consume processed attendance.

Calculations:

- Present days
- Paid leave
- Unpaid leave
- LOP
- Holidays
- Week offs
- Overtime
- Late deductions if configured
- Absence deductions

---

# 30. Process Salary

Salary processing must support:

- New joiner pro-rata
- Exit employee pro-rata
- Leave without pay
- Overtime
- Incentive
- Variable earnings
- Arrears
- Loan deductions
- Fines
- Tax
- Statutory deductions
- Reimbursements

---

# 31. Payroll Validation

Before finalization:

- Employee salary exists
- Bank details exist if required
- Attendance processed
- Leave processed
- No unresolved payroll exceptions
- Statutory configuration exists
- Tax configuration exists
- Duplicate payroll does not exist
- Employee status is valid

---

# 32. Payroll Edge Cases

## New Joiner

Calculate salary based on configured joining-day rule.

## Mid-Month Exit

Calculate payable salary up to last working date.

## Salary Revision Mid-Month

Support:

- New salary from effective date
- Arrear calculation
- Proration

## Transfer Mid-Month

Support company/entity/branch-specific payroll rules.

## Unpaid Leave

Calculate LOP according to configured divisor.

## Negative Salary

System must prevent or flag negative net salary according to policy.

## Payroll Reprocessing

Only authorized users can reopen or recalculate payroll.

---

# 33. Payslip

Payslip should include:

- Employee information
- Payroll period
- Earnings
- Deductions
- Employer contributions
- Gross
- Taxable income
- Net salary
- Bank details partially masked
- Leave/attendance summary
- Year-to-date values where applicable

Payslip should become immutable after finalization.

---

# 34. Statutory Components

Statutory configuration should be parameterized by:

- Company
- Entity
- Location
- Employee category
- Effective date
- Financial year

Each statutory component should define:

- Employee contribution
- Employer contribution
- Wage ceiling
- Eligibility
- Calculation basis
- Tax treatment

---

# 35. Tax Slab

Tax configuration should support:

- Financial year
- Tax regime where applicable
- Income ranges
- Rate
- Threshold
- Rebate
- Surcharge
- Cess
- Exemption configuration

Tax rules must be effective-dated and versioned.

---

# 36. Declaration Form

Employees should be able to:

- Submit declarations
- Upload proofs
- Modify declarations before cutoff
- Track status

HR/Payroll can:

- Review
- Approve
- Reject
- Request clarification

Statuses:

```text
DRAFT
SUBMITTED
UNDER_REVIEW
APPROVED
REJECTED
CLARIFICATION_REQUIRED
LOCKED
```

---

# 37. Loan Management

## Apply Loan

Fields:

- Employee
- Loan Type
- Requested Amount
- Tenure
- Interest
- Purpose
- Documents

Workflow:

```text
Employee
↓
Manager
↓
HR
↓
Finance
↓
Approved
↓
Disbursement
↓
Payroll Deduction
```

Loan ledger should track:

- Principal
- Interest
- Installment
- Paid
- Outstanding
- Advance payment
- Closure

Edge cases:

- Employee resigns with outstanding loan
- Salary insufficient for deduction
- Loan restructuring
- Early closure
- Duplicate loan

---

# 38. Variable Earning Allotment

Support:

- Incentive
- Bonus
- Commission
- Special allowance
- Ad hoc earning

Fields:

- Employee
- Component
- Amount
- Effective Payroll
- Reason
- Approval

---

# 39. Arrear Salary

Arrears may arise from:

- Backdated salary revision
- Attendance correction
- Leave correction
- Statutory correction
- Payroll correction

Arrear record should include:

- Original amount
- Revised amount
- Difference
- Reason
- Payroll cycle
- Approval

---

# 40. Fine Management

Support:

- Fine type
- Amount
- Reason
- Employee
- Effective payroll
- Approval
- Recovery schedule

Fines should be auditable and subject to configured policy.

---

# 41. Incentive Management

Support:

- Incentive scheme
- Eligibility
- Target
- Achievement
- Amount
- Approval
- Payroll cycle

---

# 42. Performance Management

## KPA Master

Fields:

- KPA
- Description
- Department
- Designation
- Weight
- Measurement Method
- Rating Scale

## Appraisal Interval

Examples:

- Quarterly
- Half Yearly
- Annual
- Custom

---

# 43. Employee Appraisal

Lifecycle:

```text
Appraisal Cycle
↓
Goal Assignment
↓
Self Assessment
↓
Manager Assessment
↓
Colleague Review
↓
Final Review
↓
Rating
↓
Approval
↓
Closure
```

---

# 44. Self Assessment

Employee enters:

- Achievements
- Goals
- Challenges
- Development needs
- Comments
- Rating

System should enforce:

- Cycle dates
- Mandatory fields
- Submission deadline
- Lock after submission

---

# 45. Colleague Review

Support configurable peer review.

Controls:

- Reviewer selection
- Anonymous/non-anonymous configuration
- Rating criteria
- Comments
- Submission deadline

---

# 46. Ad Hoc Appraisal

Used outside regular appraisal cycles.

Examples:

- Promotion
- Role change
- Exceptional performance
- Salary review

---

# 47. Learning Gallery

Support:

- Courses
- Videos
- Documents
- Training sessions
- Learning paths
- Completion tracking

Fields:

- Course
- Category
- Instructor
- Duration
- Content
- Start Date
- End Date
- Status

---

# 48. Course Approval

Employees/managers may request courses.

Workflow:

```text
Course Request
↓
Manager
↓
HR/L&D
↓
Approval
↓
Enrollment
↓
Completion
```

---

# 49. KT Master

Knowledge transfer records should support:

- Knowledge area
- Source employee
- Recipient employee
- Documents
- Sessions
- Completion status
- Handover date
- Approval

KT should be linked to resignation and transfer processes.

---

# 50. Employee Complaints

Complaint management should support:

- Complaint Type
- Subject
- Description
- Priority
- Confidentiality
- Attachment
- Assigned HR
- Status
- Resolution
- Closure

Statuses:

```text
OPEN
ASSIGNED
UNDER_REVIEW
INVESTIGATION
ACTION_REQUIRED
RESOLVED
CLOSED
REOPENED
```

Confidential complaints require restricted visibility.

---

# 51. Help Desk

Ticket fields:

- Ticket Number
- Category
- Subcategory
- Priority
- Subject
- Description
- Attachment
- Assigned Team
- Assigned User
- SLA
- Status

Statuses:

```text
OPEN
ASSIGNED
IN_PROGRESS
WAITING_FOR_EMPLOYEE
RESOLVED
CLOSED
REOPENED
```

---

# 52. Announcements

Support:

- Title
- Message
- Audience
- Company
- Branch
- Department
- Employee group
- Publish date
- Expiry date
- Attachment
- Acknowledgement required

---

# 53. Company Review

Support internal company feedback:

- Review category
- Rating
- Comments
- Visibility
- Submission date

Access must respect configured confidentiality rules.

---

# 54. Travel & Reimbursement

## Travel Request

Fields:

- Employee
- Destination
- Purpose
- Travel dates
- Mode
- Estimated cost
- Advance required

Workflow:

```text
Employee
↓
Manager
↓
Finance
↓
Approved
```

---

# 55. Travel Allowance

Configure:

- Grade
- Location
- Travel type
- Daily allowance
- Hotel limit
- Meal allowance
- Local conveyance
- Currency

---

# 56. Travel Expense

After travel:

- Expense date
- Category
- Amount
- Currency
- Receipt
- Business purpose
- Travel reference

System should calculate eligible reimbursement according to policy.

---

# 57. Other Expense

Examples:

- Office supplies
- Client expenses
- Communication
- Training
- Miscellaneous

---

# 58. Reimbursement Expense

Lifecycle:

```text
Expense
↓
Employee Submission
↓
Manager Approval
↓
Finance Verification
↓
Approved
↓
Payment/Reimbursement
↓
Ledger
```

---

# 59. Expense Edge Cases

- Missing receipt
- Duplicate receipt
- Currency mismatch
- Expense exceeds policy
- Expense submitted after deadline
- Employee exits before reimbursement
- Travel cancelled
- Partial approval
- Reimbursement rejected

---

# 60. Asset Management

## Asset Master

Fields:

- Asset Code
- Asset Type
- Asset Name
- Serial Number
- Purchase Date
- Purchase Cost
- Warranty
- Vendor
- Location
- Status

Statuses:

```text
AVAILABLE
ALLOCATED
UNDER_REPAIR
LOST
DAMAGED
RETIRED
DISPOSED
```

---

# 61. Employee Asset Allocation

Fields:

- Employee
- Asset
- Allocation Date
- Condition
- Accessories
- Expected Return Date
- Acknowledgement

Support employee acknowledgement.

---

# 62. Asset Transfer

Transfer asset between employees.

Validation:

- Asset must be allocated to source employee
- Source employee must approve/hand over
- Destination employee must acknowledge

---

# 63. Asset Return

Return process:

```text
Employee
↓
Asset Inspection
↓
Condition Assessment
↓
Damage/Loss Assessment
↓
Recovery if applicable
↓
Asset Available/Repair
```

---

# 64. Document Management

Document categories:

- Identity
- Address
- Education
- Experience
- Employment
- Salary
- Tax
- Bank
- Appraisal
- Training
- Exit

Document fields:

- Employee
- Category
- Type
- File
- Version
- Issue Date
- Expiry Date
- Verification Status
- Uploaded By
- Verified By

---

# 65. Document Security

Requirements:

- Encryption at rest
- Encryption in transit
- Role-based access
- Employee-level access
- Download restrictions where required
- Audit trail
- Versioning
- Retention policy
- Secure deletion

---

# 66. Resignation

Employee submits:

- Resignation date
- Last working date
- Reason
- Comments

Workflow:

```text
Employee
↓
Manager
↓
HR
↓
Approval
↓
Notice Period
↓
Exit Process
```

---

# 67. Notice Period

Notice period can depend on:

- Company
- Employee type
- Grade
- Contract
- Designation

Calculate:

- Notice period
- Served period
- Remaining period
- Buyout
- Recovery

---

# 68. Exit Clearance

Departments may provide clearance:

- HR
- Finance
- IT
- Admin
- Security
- Manager
- Asset Management

Clearance statuses:

```text
PENDING
CLEARED
NOT_APPLICABLE
HOLD
```

---

# 69. FNF Settlement

## Payables

- Salary
- Leave encashment
- Incentive
- Bonus
- Reimbursement
- Arrears

## Recoveries

- Notice period
- Loan
- Advance
- Asset recovery
- Fine
- Other deductions

```text
Gross FNF Payable
- Total Recoveries
= Net FNF
```

FNF should have:

- Calculation sheet
- Approval
- Payment status
- Settlement date
- Settlement document

---

# 70. My Templates

Employees should have access to approved templates:

- Leave documents
- HR forms
- Declaration forms
- Reimbursement forms
- Exit forms
- Employment forms

Templates should support:

- Versioning
- Effective dates
- Role-based access

---

# 71. Change Password

Security requirements:

- Current password verification
- Minimum password complexity
- Password history
- Expiry policy
- Failed-attempt lock
- MFA support if enabled
- Session invalidation after password change

---

# 72. RBAC-HRMS

## Role

Examples:

- Super Admin
- HR Admin
- HR Manager
- Payroll Admin
- Finance
- Manager
- Employee
- Auditor

## Permissions

Actions:

- View
- Create
- Edit
- Delete
- Approve
- Reject
- Process
- Finalize
- Export
- Import
- Download
- Assign

## Data Scope

```text
SELF
TEAM
DEPARTMENT
BRANCH
ENTITY
COMPANY
GLOBAL
```

---

# 73. Workflow Master

Workflow should be reusable.

Configuration:

- Module
- Transaction Type
- Trigger
- Conditions
- Approval Levels
- Approver Type
- SLA
- Escalation
- Notification
- Auto Approval Rules

Supported workflows:

- Leave
- Overtime
- Loan
- Expense
- Travel
- Course
- Transfer
- Appraisal
- Salary
- Resignation
- FNF
- Complaints

---

# 74. Notification Engine

Channels:

- In-app
- Email
- SMS where integrated

Events:

- Leave submitted
- Leave approved
- Leave rejected
- Overtime approved
- Payroll finalized
- Payslip generated
- Document expiring
- Course approved
- Complaint updated
- Ticket assigned
- Resignation submitted
- FNF approved

Notification should support templates and localization.

---

# 75. Global Minutes

A configurable system-level time/unit configuration.

Potential uses:

- Working minutes
- Overtime thresholds
- Grace periods
- SLA minutes
- Break duration
- Payroll cutoffs

Avoid hard-coding time constants.

---

# 76. Geographic Masters

Hierarchy:

```text
Country
↓
Region
↓
State
↓
City
↓
Branch
```

Must support effective and active status.

---

# 77. Financial Year

Fields:

- Financial Year
- Start Date
- End Date
- Status
- Current Flag

Transactions must reference a financial year where applicable.

---

# 78. Currency Master

Fields:

- Currency Code
- Currency Name
- Symbol
- Decimal Precision
- Exchange Rate
- Effective Date

Multi-currency should be supported for travel and reimbursement.

---

# 79. Bank Master

Fields:

- Bank Code
- Bank Name
- Branch
- Country
- Status

Employee bank accounts should reference the bank master.

---

# 80. Excel Bulk Upload

The upload engine should support:

1. Template download
2. File upload
3. Header validation
4. Data type validation
5. Mandatory field validation
6. Duplicate detection
7. Reference validation
8. Preview
9. Error report
10. Import
11. Import summary
12. Audit log

Supported imports:

- Employees
- Attendance
- Salary
- Shift allocation
- Leave
- Assets
- Variable earnings
- Incentives
- Bank details

---

# 81. Bulk Upload Edge Cases

- Duplicate employee code
- Invalid department
- Invalid designation
- Invalid date
- Invalid salary
- Missing mandatory field
- Invalid bank
- Invalid currency
- Duplicate attendance
- Invalid employee status
- Existing transaction conflict

The import should be transactional where appropriate and should not partially corrupt data.

---

# 82. Reports

## Attendance Reports

- Daily attendance
- Monthly attendance
- Late coming
- Early leaving
- Missing punches
- Absenteeism
- Overtime
- Shift report
- Employee attendance

## Leave Reports

- Leave balance
- Leave utilization
- Leave trend
- Department leave
- Leave encashment
- Leave cancellation

## Employee Reports

- Employee master
- Headcount
- New joiners
- Exits
- Transfers
- Department report
- Designation report
- Employee status

## Payroll Reports

- Payroll register
- Salary register
- Earnings
- Deductions
- Statutory
- Tax
- Overtime
- Incentive
- Arrear
- Loan
- Fine
- FNF

## Expense Reports

- Expense by employee
- Expense by category
- Pending reimbursement
- Approved reimbursement
- Travel expense

---

# 83. Reporting Requirements

Reports should support:

- Filters
- Date range
- Company
- Entity
- Branch
- Department
- Employee
- Status
- Export to Excel
- Export to PDF
- Pagination
- Sorting
- Saved filters

Sensitive reports must enforce RBAC.

---

# 84. Data Model — Core Entities

Suggested primary entities:

```text
Company
Entity
Branch
BusinessUnit
Department
SubDepartment
Designation
Grade
EmploymentType
ContractType
Employee
EmployeeOrganization
EmployeeBank
EmployeeEmergencyContact
EmployeeFamily
EmployeeEducation
EmployeeExperience
EmployeeDocument
EmployeeAsset
EmployeeTransfer
EmployeeStatusHistory

Shift
ShiftAllocation
WeekOff
AttendanceRaw
Attendance
AttendanceRegularization
OvertimeMaster
OvertimeRequest
CompOff

LeaveType
LeavePolicy
LeaveBalance
LeaveTransaction
LeaveApplication
LeaveApproval
LeaveCancellation
LeaveEncashment

SalaryComponent
SalaryTemplate
EmployeeSalary
PayrollCycle
PayrollRun
PayrollEmployee
PayrollComponent
Payslip
VariableEarning
Arrear
Incentive
Fine
Loan
LoanTransaction

StatutoryComponent
TaxSlab
TaxDeclaration
TaxDeclarationDocument

KPA
AppraisalCycle
EmployeeGoal
SelfAssessment
ManagerAssessment
ColleagueReview
AppraisalResult

CourseCategory
Course
CourseEnrollment
CourseApproval
KTRecord

ComplaintType
Complaint
TicketCategory
HelpDeskTicket

TravelRequest
TravelAllowance
TravelExpense
ExpenseType
OtherExpense
Reimbursement

Asset
AssetAllocation
AssetTransfer
AssetReturn
AssetRecovery

Resignation
NoticePeriod
ExitClearance
FNFSettlement

Role
Permission
RolePermission
UserRole
Workflow
WorkflowStep
WorkflowInstance
WorkflowAction

Announcement
Template
Notification
AuditLog
FinancialYear
Currency
Country
Region
State
City
Bank
Device
DeviceUser
```

---

# 85. Key Database Relationships

```text
Company
  └── Entity
       └── Branch
            └── Business Unit
                 └── Department
                      └── Sub Department
                           └── Employee
```

Employee:

```text
Employee
 ├── EmployeeSalary
 ├── ShiftAllocation
 ├── Attendance
 ├── LeaveBalance
 ├── LeaveApplication
 ├── OvertimeRequest
 ├── CompOff
 ├── Loan
 ├── Expense
 ├── AssetAllocation
 ├── Document
 ├── Appraisal
 ├── CourseEnrollment
 ├── Complaint
 └── Resignation
```

---

# 86. API Architecture

Recommended API domains:

```text
/api/v1/auth
/api/v1/users
/api/v1/roles
/api/v1/permissions

/api/v1/companies
/api/v1/entities
/api/v1/branches
/api/v1/departments
/api/v1/designations
/api/v1/grades

/api/v1/employees
/api/v1/employees/{id}/documents
/api/v1/employees/{id}/salary
/api/v1/employees/{id}/assets

/api/v1/attendance
/api/v1/shifts
/api/v1/week-offs
/api/v1/overtime
/api/v1/comp-off

/api/v1/leaves
/api/v1/leave-balances
/api/v1/leave-encashment

/api/v1/payroll
/api/v1/salary-components
/api/v1/salary-templates
/api/v1/payslips
/api/v1/loans

/api/v1/tax
/api/v1/statutory

/api/v1/appraisals
/api/v1/kpa
/api/v1/courses
/api/v1/kt

/api/v1/expenses
/api/v1/travel
/api/v1/reimbursements

/api/v1/assets
/api/v1/complaints
/api/v1/helpdesk

/api/v1/resignations
/api/v1/fnf

/api/v1/workflows
/api/v1/notifications
/api/v1/reports
/api/v1/imports
```

---

# 87. API Standards

Every API should provide:

- Authentication
- Authorization
- Validation
- Pagination
- Filtering
- Sorting
- Consistent error structure
- Correlation ID
- Audit information

Example error:

```json
{
  "success": false,
  "code": "LEAVE_BALANCE_INSUFFICIENT",
  "message": "Insufficient leave balance.",
  "details": {
    "employee_id": "EMP001",
    "leave_type": "CL",
    "available": 1,
    "requested": 3
  },
  "correlation_id": "..."
}
```

---

# 88. Transaction Management

Financial and workflow transactions should use database transactions.

Examples:

### Leave Approval

```text
BEGIN
Update Leave Application
Update Leave Balance
Update Attendance
Create Approval History
Create Notification
COMMIT
```

### Payroll Finalization

```text
BEGIN
Lock Payroll Cycle
Finalize Payroll Employees
Create Payroll Components
Generate Payslips
Create Accounting Entries if integrated
Create Audit Record
COMMIT
```

Failure should result in rollback where transaction boundaries permit.

---

# 89. Idempotency

Idempotency is required for:

- Attendance ingestion
- Payroll processing
- Payment callbacks
- Bulk uploads
- Notifications where applicable
- Integration jobs

Example:

```text
attendance_event_id + device_id
```

must not create duplicate attendance events.

---

# 90. Concurrency Controls

Protect against:

- Two HR users processing the same payroll
- Two managers approving the same transaction
- Concurrent leave requests
- Concurrent salary revisions
- Concurrent employee transfers

Use:

- Optimistic locking
- Status locking
- Database constraints
- Transaction isolation
- Unique indexes

---

# 91. Audit Trail

Audit events should include:

```text
Entity
Entity ID
Action
Old Value
New Value
User
Timestamp
IP
Device
Reason
Correlation ID
```

High-priority audited modules:

- Employee
- Salary
- Payroll
- Leave
- Attendance
- Transfer
- RBAC
- Workflow
- Tax
- FNF
- Documents

---

# 92. Security

## Authentication

Support:

- Username/password
- SSO where required
- MFA where required
- Session management

## Authorization

Use RBAC plus data scope.

## Data Protection

Protect:

- PAN/tax information
- Bank account information
- Salary
- Documents
- Personal contact data
- Complaints

---

# 93. Security Edge Cases

- User tries to access another employee's data
- Manager changes department and retains old access
- Employee exits but account remains active
- Role removed during active session
- Unauthorized payroll export
- Unauthorized salary download
- Expired session
- Brute-force login
- Password reuse
- Document URL guessing

---

# 94. Data Retention

Define retention policies for:

- Employee records
- Attendance
- Payroll
- Tax records
- Documents
- Complaints
- Audit logs
- FNF records

Retention must follow organizational and applicable legal requirements.

---

# 95. Integration Architecture

Potential integrations:

```text
HRMS
├── Attendance Devices
├── Biometric Systems
├── Finance/Accounting
├── Banking/Payment Systems
├── Email
├── SMS
├── Identity Provider
├── Document Storage
└── Property Management System
```

---

# 96. PMS Integration

Since HRMS is part of the Property Management System, common services should be shared where possible.

Shared:

- Authentication
- Users
- RBAC
- Company
- Branch
- Entity
- Department
- Finance
- Documents
- Notifications
- Audit
- Workflow

This avoids duplicate master data.

---

# 97. Finance Integration

Payroll may create accounting entries.

Example:

```text
Salary Expense
    DR

Salary Payable
    CR

Statutory Payable
    CR

Tax Payable
    CR

Loan Recovery
    CR
```

The exact chart of accounts should be configurable.

---

# 98. Payroll-to-Finance Flow

```text
Payroll Calculation
↓
Payroll Approval
↓
Payroll Finalization
↓
Accounting Validation
↓
Journal Generation
↓
Finance System
↓
Payment Processing
```

---

# 99. End-to-End Employee Lifecycle

```text
Employee Creation
       ↓
Organization Assignment
       ↓
Document Collection
       ↓
Salary Assignment
       ↓
Shift Allocation
       ↓
Attendance
       ↓
Leave
       ↓
Overtime
       ↓
Payroll
       ↓
Performance
       ↓
Learning
       ↓
Transfers/Promotions
       ↓
Expenses/Loans
       ↓
Resignation
       ↓
Notice Period
       ↓
KT
       ↓
Asset Clearance
       ↓
Department Clearance
       ↓
FNF
       ↓
Exit
```

---

# 100. End-to-End Monthly Payroll Flow

```text
1. Open Payroll Cycle
        ↓
2. Freeze Payroll Inputs
        ↓
3. Import/Generate Attendance
        ↓
4. Process Leave
        ↓
5. Process Overtime
        ↓
6. Process Comp Off
        ↓
7. Process Variable Earnings
        ↓
8. Process Incentives
        ↓
9. Process Arrears
        ↓
10. Process Fines
        ↓
11. Process Loans
        ↓
12. Calculate Salary
        ↓
13. Calculate Statutory
        ↓
14. Calculate Tax
        ↓
15. Generate Payroll Register
        ↓
16. Payroll Validation
        ↓
17. Payroll Approval
        ↓
18. Finalize Payroll
        ↓
19. Generate Payslips
        ↓
20. Generate Finance Entries
        ↓
21. Payment
```

---

# 101. Important Business Edge Cases

## Employee

- Duplicate employee
- Rehire
- Backdated joining
- Future joining
- Employee transfer
- Employee termination
- Employee resignation withdrawal

## Attendance

- Missing punch
- Multiple punches
- Duplicate punches
- Cross-day shift
- Night shift
- Holiday attendance
- Week-off attendance
- Device offline
- Device duplicate events

## Leave

- Overlapping leave
- Insufficient balance
- Leave during notice
- Leave after resignation
- Leave cancellation
- Partial cancellation
- Negative balance

## Payroll

- Salary revision
- Mid-month joining
- Mid-month exit
- LOP
- Negative net salary
- Duplicate payroll
- Payroll reopen
- Backdated correction
- Arrear

## Loan

- Salary insufficient
- Employee exit
- Early closure
- Outstanding balance

## Expense

- Missing receipt
- Duplicate claim
- Policy violation
- Currency conversion
- Employee exit

## Asset

- Lost asset
- Damaged asset
- Asset not returned
- Employee transfer
- Asset recovery

## Exit

- Resignation withdrawal
- Notice extension
- Notice buyout
- Outstanding loan
- Outstanding asset
- Pending expense
- Pending leave
- Pending appraisal

---

# 102. Workflow State Machine

Every approval-based transaction should have a controlled state machine.

Example:

```text
DRAFT
 ↓
SUBMITTED
 ↓
PENDING_APPROVAL
 ├──→ REJECTED
 └──→ APPROVED
          ↓
       PROCESSED
          ↓
       COMPLETED
```

Cancellation:

```text
SUBMITTED/APPROVED
        ↓
CANCELLATION_REQUEST
        ↓
CANCELLED
```

Rejection should capture:

- Rejected By
- Rejected At
- Rejection Reason

---

# 103. Validation Framework

Validation should operate at:

1. UI level
2. API level
3. Database level
4. Business-rule level

Never rely only on UI validation.

---

# 104. Notification Framework

Notifications should support:

- Event
- Recipient
- Template
- Channel
- Priority
- Delivery status
- Retry
- Read status

Example:

```text
Leave Approved
↓
Notification Template
↓
Employee
↓
In-App + Email
```

---

# 105. Search

Global employee search should support:

- Employee ID
- Employee code
- Name
- Email
- Mobile
- Department
- Designation

Search results must respect RBAC.

---

# 106. Pagination and Performance

Large tables should support:

- Server-side pagination
- Filtering
- Sorting
- Cursor pagination where useful
- Indexed search

Avoid loading all employees into the browser.

---

# 107. Background Jobs

Use asynchronous jobs for:

- Attendance processing
- Payroll processing
- Payslip generation
- Bulk imports
- Notifications
- Report generation
- Document processing
- Expiry reminders

Jobs should provide:

- Status
- Retry
- Error
- Started At
- Completed At
- Initiated By

---

# 108. Scheduled Jobs

Examples:

- Leave accrual
- Leave expiry
- Document expiry reminder
- Payroll reminder
- Loan deduction
- Tax calculation
- Attendance processing
- Probation reminders
- Notice period reminders
- Course expiry
- Appraisal cycle opening

---

# 109. Observability

System should provide:

- Application logs
- Audit logs
- Integration logs
- Job logs
- Error logs
- Performance metrics

Track:

- API latency
- Payroll processing time
- Attendance ingestion rate
- Failed jobs
- Failed notifications
- Database errors

---

# 110. Backup & Recovery

Requirements:

- Scheduled database backup
- Document backup
- Point-in-time recovery where supported
- Backup validation
- Disaster recovery plan
- Recovery Point Objective
- Recovery Time Objective

---

# 111. Data Migration

Migration utilities should support:

- Employee master
- Historical salary
- Leave balance
- Attendance
- Payroll history
- Assets
- Documents

Migration must include:

- Mapping
- Validation
- Error report
- Reconciliation
- Record counts

---

# 112. Reconciliation

Important reconciliation processes:

### Attendance

```text
Raw Events
vs
Processed Attendance
```

### Payroll

```text
Payroll Register
vs
Payslip
vs
Finance Journal
```

### Leave

```text
Leave Applications
vs
Leave Balance
vs
Attendance
```

### Assets

```text
Allocated Assets
vs
Employee Records
vs
Physical Inventory
```

---

# 113. Configuration Management

Avoid hard-coded business rules.

Configurable:

- Working hours
- Leave rules
- Overtime rules
- Salary formulas
- Tax rules
- Statutory rules
- Approval rules
- Notice period
- Expense limits
- Travel allowance
- Payroll calendar

---

# 114. Multi-Tenancy Considerations

If the HRMS is SaaS-enabled, support:

```text
Tenant
 ├── Company
 │    ├── Entity
 │    ├── Branch
 │    └── Employees
```

Every tenant-owned transaction should include tenant isolation.

Possible approaches:

- Shared database + tenant_id
- Separate schema per tenant
- Separate database per tenant

Tenant isolation must be enforced at the service and database levels.

---

# 115. API Security

Implement:

- OAuth2/JWT where appropriate
- Token expiry
- Refresh token rotation
- Rate limiting
- Request validation
- CORS policy
- API gateway
- Audit logging

---

# 116. File Storage

Documents should not be stored directly in relational database blobs unless there is a strong reason.

Recommended:

```text
Application
   ↓
Object Storage
   ↓
Document Metadata DB
```

Metadata contains:

- File ID
- Employee
- Category
- Storage path
- File size
- MIME type
- Version
- Hash
- Uploaded By

---

# 117. Database Constraints

Important constraints:

- Unique Employee Code
- Unique Official Email where required
- Unique Device User ID per device
- Unique active salary record per employee/effective period
- Unique payroll cycle
- Unique leave transaction references
- Unique attendance event ID
- Unique asset code
- Unique ticket number
- Unique complaint number
- Unique resignation record where applicable

---

# 118. Database Indexing

Recommended indexes:

```text
Employee(employee_code)
Employee(official_email)
Employee(department_id)
Employee(branch_id)
Employee(status)

Attendance(employee_id, attendance_date)
Attendance(attendance_date)
LeaveApplication(employee_id, from_date, to_date)
LeaveBalance(employee_id, leave_type_id)

PayrollEmployee(payroll_cycle_id, employee_id)
EmployeeSalary(employee_id, effective_from)

OvertimeRequest(employee_id, overtime_date)

Expense(employee_id, expense_date)
AssetAllocation(employee_id)
EmployeeDocument(employee_id, document_type)

AuditLog(entity_type, entity_id)
```

---

# 119. Frontend Structure

Recommended navigation:

```text
Dashboard

HRMS
├── Employee Management
├── Attendance
├── Leave
├── Shift
├── Overtime
├── Comp Off
├── Payroll
├── Tax & Statutory
├── Performance
├── Learning
├── Travel & Expenses
├── Assets
├── Complaints
├── Help Desk
├── Documents
├── Exit Management
├── Reports
└── Administration
```

---

# 120. Employee Portal Navigation

```text
My Dashboard
My Profile
My Attendance
My Leave
My Comp Off
My Overtime
My Salary
My Payslip
My Loans
My Expenses
My Reimbursements
My Declarations
My Performance
My Learning
My Documents
My Assets
My Complaints
My Help Desk
Announcements
My Templates
Resignation
Change Password
```

---

# 121. Manager Portal

```text
Manager Dashboard
My Team
Team Attendance
Leave Approvals
Overtime Approvals
Expense Approvals
Loan Approvals
Course Approvals
Appraisals
Colleague Reviews
Team Reports
```

---

# 122. HR Administration Portal

```text
HR Dashboard
Employee Master
Organization
Attendance
Leave
Shift
Overtime
Performance
Learning
Complaints
Documents
Transfers
Exit
FNF
Reports
Configuration
```

---

# 123. Payroll Portal

```text
Payroll Dashboard
Salary Components
Salary Templates
Employee Salary
Payroll Cycle
Attendance Generation
Process Salary
Variable Earnings
Arrears
Incentives
Fine Management
Loans
Tax
Statutory
Salary Approval
Approved Payroll
Payslips
Payroll Reports
```

---

# 124. Acceptance Criteria

A module should not be considered complete until:

- UI implemented
- API implemented
- Database model implemented
- Validation implemented
- RBAC implemented
- Workflow implemented where applicable
- Audit implemented
- Notifications implemented where applicable
- Reports implemented
- Error handling implemented
- Edge cases tested
- Security tested
- Performance tested
- Integration tested

---

# 125. Testing Strategy

## Unit Testing

Test:

- Payroll formulas
- Leave calculations
- Overtime calculations
- Tax calculations
- FNF calculations
- Pro-rata salary
- Loan schedules

## Integration Testing

Test:

- Attendance → Payroll
- Leave → Attendance
- Leave → Payroll
- Overtime → Payroll
- Loan → Payroll
- Expense → Reimbursement
- Asset → Exit
- Resignation → FNF

## End-to-End Testing

Test complete employee lifecycle.

---

# 126. Payroll Test Scenarios

Minimum test coverage should include:

1. Full-month employee
2. New joiner
3. Mid-month joiner
4. Mid-month exit
5. Employee with LOP
6. Employee with overtime
7. Employee with incentive
8. Employee with arrears
9. Employee with loan
10. Employee with fine
11. Employee with leave encashment
12. Salary revision
13. Transfer
14. Negative salary condition
15. Payroll reopening
16. Duplicate payroll attempt

---

# 127. Leave Test Scenarios

1. Full-day leave
2. Half-day leave
3. Multiple-day leave
4. Insufficient balance
5. Negative balance
6. Overlapping leave
7. Holiday within leave
8. Week off within leave
9. Leave cancellation
10. Partial cancellation
11. Leave encashment
12. Leave during notice
13. Leave after payroll lock

---

# 128. Attendance Test Scenarios

1. Single punch
2. Multiple punches
3. Missing punch
4. Duplicate punch
5. Night shift
6. Cross-day shift
7. Holiday attendance
8. Week-off attendance
9. Overtime
10. Device offline
11. Bulk import
12. Manual correction

---

# 129. Exit Test Scenarios

1. Resignation
2. Resignation withdrawal
3. Notice period completion
4. Notice buyout
5. Loan recovery
6. Asset recovery
7. Leave encashment
8. Pending reimbursement
9. Pending salary revision
10. FNF approval
11. Final settlement
12. Exit document generation

---

# 130. Non-Functional Requirements

## Performance

Typical targets:

- Standard API response: under 500 ms where practical
- Search response: under 1 second where practical
- Dashboard response: under 2–3 seconds where practical
- Bulk processing: asynchronous

Actual targets should be finalized based on expected load.

## Availability

Production should target high availability appropriate to business criticality.

## Scalability

The architecture should scale independently for:

- API
- Payroll jobs
- Attendance processing
- Reports
- Notifications
- File storage

---

# 131. Recommended Service Boundaries

If using modular monolith:

```text
Identity Module
Core HR Module
Attendance Module
Leave Module
Payroll Module
Performance Module
Learning Module
Expense Module
Asset Module
Exit Module
Document Module
Workflow Module
Notification Module
Reporting Module
```

If later moving to microservices, these modules can become service boundaries.

A modular monolith is preferable initially unless scale or organizational requirements justify microservices.

---

# 132. Recommended Architecture Pattern

```text
Frontend
   ↓
API Gateway / Backend
   ↓
Application Services
   ↓
Domain Services
   ↓
Repositories
   ↓
Database
```

Cross-cutting:

```text
Authentication
Authorization
Audit
Workflow
Notifications
File Storage
Background Jobs
Observability
```

---

# 133. Domain Events

Useful events:

```text
EmployeeCreated
EmployeeTransferred
EmployeeStatusChanged
AttendanceProcessed
LeaveSubmitted
LeaveApproved
LeaveCancelled
OvertimeApproved
PayrollStarted
PayrollProcessed
PayrollApproved
PayrollFinalized
PayslipGenerated
SalaryRevised
LoanApproved
ExpenseApproved
AssetAllocated
AssetReturned
AppraisalSubmitted
ResignationSubmitted
ExitApproved
FNFFinalized
```

These events can support integrations without tightly coupling modules.

---

# 134. Business Rule Priority

Where rules conflict, establish precedence.

Example:

```text
Company Policy
    ↓
Entity Policy
    ↓
Branch Policy
    ↓
Department Policy
    ↓
Employee Override
```

The exact hierarchy should be configurable.

---

# 135. Master Data Governance

Masters should support:

- Code
- Name
- Description
- Status
- Effective date
- Expiry date
- Created by
- Approved by

Do not physically delete master data referenced by historical transactions.

Use inactive/archived status.

---

# 136. Soft Delete

Use soft delete for business records where historical traceability is required.

Examples:

- Employees
- Departments
- Salary components
- Leave types
- Assets
- Documents
- Workflow configurations

Financial records should generally not be deleted.

---

# 137. Data Consistency Rules

Examples:

```text
Employee cannot be ACTIVE without organization assignment.

Employee salary cannot be processed without active salary configuration.

Leave cannot be approved without sufficient balance unless policy allows it.

Payroll cannot finalize while mandatory validation errors exist.

Asset cannot be allocated to two active employees simultaneously.

Employee cannot be fully exited while mandatory clearance remains pending.

Workflow transaction cannot be approved by an unauthorized user.
```

---

# 138. End-to-End Integration Example

## Leave → Attendance → Payroll

```text
Employee applies leave
        ↓
Manager approves
        ↓
Leave balance reduced
        ↓
Attendance marked LEAVE
        ↓
Payroll calculates paid/LOP treatment
        ↓
Salary calculated
        ↓
Payslip generated
```

---

# 139. End-to-End Integration Example

## Overtime → Payroll

```text
Employee works overtime
        ↓
Attendance captures extra hours
        ↓
Overtime generated/requested
        ↓
Manager approves
        ↓
Payroll picks approved overtime
        ↓
Overtime earning calculated
        ↓
Salary processed
```

---

# 140. End-to-End Integration Example

## Resignation → FNF

```text
Resignation
↓
Notice Period
↓
KT
↓
Asset Clearance
↓
Finance Clearance
↓
Leave Calculation
↓
Loan Calculation
↓
Salary Calculation
↓
Reimbursement
↓
FNF
↓
Approval
↓
Final Settlement
↓
Employee Exit
```

---

# 141. Critical Production Controls

The following operations should require elevated authorization:

- Payroll finalization
- Payroll reopening
- Salary modification
- Tax configuration
- Statutory configuration
- FNF finalization
- Bulk employee upload
- RBAC changes
- Workflow changes
- Employee deletion/deactivation
- Historical transaction modification

---

# 142. Recommended Audit Dashboard

HR/Admin should be able to see:

- Recent employee changes
- Salary changes
- Payroll changes
- Permission changes
- Workflow changes
- Attendance corrections
- Leave overrides
- Document verification
- FNF changes
- Bulk uploads

---

# 143. Final Module Inventory

The final HRMS should contain the following modules and features:

### Core

- Dashboard
- HRMS Dashboard
- Employee Master
- Employee Details
- Employee Transfer
- Company Master
- Branch Setup
- Entity Master
- Business Unit
- Department
- Sub Department
- Designation
- Grade Master
- Employment Type
- Contract Type
- Reason for Recruitment
- Notice Period

### Workforce

- Attendance
- Attendance Calendar
- Attendance Reports
- Generate Attendance
- Shift Master
- Shift Allocation
- Week Off
- Overtime Master
- Overtime Request
- Comp Off Assign
- My Comp Off Work
- Device User ID Master
- Attendance Device Integration
- Attendance Regularization

### Leave

- Leave Management
- Leave Apply
- Leave Approval
- Leave Cancellation
- Cancelled Leave
- Leave Encashment
- Leave Reports

### Payroll

- Salary Components
- Salary Templates
- Employee Salary
- Payroll Cycle
- Process Salary
- Salary Approval
- Approved Payroll
- Pay Slip
- Salary Pay Slip
- Variable Earning Allotment
- Arrear Salary
- Fine Management
- Incentive
- Apply Loan
- Payroll Reports

### Tax & Statutory

- Statutory Components
- Tax Slab
- Declaration Form
- Upload Declaration Form

### Performance

- KPA Master
- Employee Appraisal
- Set Appraisal Interval
- Self Assessment
- Colleague Review
- Ad Hoc Appraisal

### Learning

- Learning Gallery
- Course Category
- Course Approval
- KT Master

### Employee Services

- Announcement
- Complaint
- Complaint Type
- Help Desk
- Ticket Category
- Company Review
- My Templates
- Change Password

### Travel & Expenses

- Travel & Reimbursement
- Travel Expense
- Travel Allowance
- Other Expense
- Reimbursement Expense
- Type of Expense

### Assets

- Assets
- Asset Management linked to Employee
- Asset Allocation
- Asset Transfer
- Asset Return
- Asset Recovery

### Exit

- Resignation
- Notice Period
- Knowledge Transfer
- Exit Clearance
- FNF Settlement

### Administration

- RBAC-HRMS
- Workflow Master
- Excel Bulk Upload
- Global Minutes
- Financial Year
- Currency Master
- Bank Master
- Country Master
- State Master
- City Master
- Region
- Document Management

---

# 144. Recommended Implementation Phases

## Phase 1 — Foundation

- Authentication
- RBAC
- Company
- Entity
- Branch
- Department
- Designation
- Employee Master
- Employee Details
- Document Management
- Audit

## Phase 2 — Workforce

- Attendance
- Attendance Calendar
- Shift Master
- Shift Allocation
- Week Off
- Device Integration
- Attendance Reports

## Phase 3 — Leave

- Leave Master
- Leave Balance
- Leave Apply
- Approval
- Cancellation
- Encashment
- Comp Off

## Phase 4 — Payroll

- Salary Components
- Salary Templates
- Employee Salary
- Payroll Cycle
- Attendance Generation
- Salary Processing
- Tax
- Statutory
- Payslip
- Payroll Approval

## Phase 5 — Advanced Payroll

- Loans
- Incentives
- Variable Earnings
- Arrears
- Fine
- Overtime
- Payroll Reports

## Phase 6 — Performance & Learning

- KPA
- Appraisal
- Self Assessment
- Colleague Review
- Learning Gallery
- Courses
- KT

## Phase 7 — Employee Services

- Complaints
- Help Desk
- Announcements
- Company Review
- Templates

## Phase 8 — Expenses & Assets

- Travel
- Expense
- Reimbursement
- Asset Management

## Phase 9 — Exit

- Resignation
- Notice Period
- KT
- Clearance
- FNF
- Exit Documents

## Phase 10 — Enterprise Hardening

- Advanced reporting
- Reconciliation
- Performance optimization
- Disaster recovery
- Security hardening
- Integration framework
- Data migration
- Operational dashboards

---

# 145. Definition of Done

The HRMS should be considered production-ready only when:

- All functional modules are implemented.
- Core entities and relationships are normalized.
- All critical workflows are configurable.
- RBAC is enforced server-side.
- Employee data is effective-dated.
- Payroll records are immutable after finalization.
- Attendance is idempotent.
- Leave and payroll are integrated.
- Overtime and payroll are integrated.
- Loan and payroll are integrated.
- Expense and reimbursement workflows are implemented.
- Asset and exit workflows are integrated.
- FNF is integrated with salary, leave, loan, expense, and asset data.
- Documents are secured.
- Audit logging is enabled.
- Reports enforce permissions.
- Bulk uploads have validation and reconciliation.
- Background jobs are retryable.
- Notifications are reliable.
- APIs have consistent validation/error handling.
- Database constraints prevent duplicate critical records.
- Backup and recovery procedures are tested.
- Security testing is completed.
- Unit, integration, and end-to-end tests are completed.
- Payroll calculations are reconciled against approved business rules.
- Production monitoring and alerting are configured.

---

# 146. Final Architecture Outcome

The completed HRMS should operate as a unified employee lifecycle platform:

```text
                 ENTERPRISE HRMS
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     CORE HR       WORKFORCE       PAYROLL
        │              │              │
   Employee        Attendance      Salary
   Organization    Shift           Tax
   Transfer        Leave           Statutory
   Documents       Overtime        Incentive
   Assets          Comp Off        Arrear
        │              │            Loan
        └──────────────┼──────────────┘
                       │
                PERFORMANCE
                       │
                LEARNING & KT
                       │
              TRAVEL & EXPENSE
                       │
                EMPLOYEE SERVICES
                       │
                  EXIT / FNF
                       │
               WORKFLOW ENGINE
                       │
                 RBAC / AUDIT
                       │
             REPORTING / ANALYTICS
                       │
              PMS / FINANCE INTEGRATION
```

The result is a **complete enterprise HRMS platform**, not simply a collection of HR screens. The core design should be driven by shared employee data, effective-dated masters, configurable workflows, transaction integrity, payroll controls, auditability, RBAC, and cross-module lifecycle integration.
