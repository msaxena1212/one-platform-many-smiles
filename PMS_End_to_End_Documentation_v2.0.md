# PROPERTY MANAGEMENT SYSTEM (PMS)
## End-to-End Functional Specification Document v2.0
### Integrated with Lease-to-Check-Out Process Flow

---

## TABLE OF CONTENTS

1. [System Overview & Architecture](#1-system-overview)
2. [Actors, Roles & RBAC Matrix](#2-actors-roles-rbac)
3. [Module 1: Property & Unit Management](#3-module-property-unit)
4. [Module 2: Customer Master (Tenant/Owner)](#4-module-customer-master)
5. [Module 3: Lease Management (End-to-End Workflow)](#5-module-lease-management)
6. [Module 4: Finance & Accounting](#6-module-finance)
7. [Module 5: Fixed Assets & Procurement](#7-module-fixed-assets)
8. [Module 6: HRMS](#8-module-hrms)
9. [Module 7: Maintenance & Ticketing](#9-module-maintenance)
10. [Module 8: Facility Booking](#10-module-facility-booking)
11. [Module 9: Community & Collaboration](#11-module-community)
12. [Module 10: Document Management System (DMS)](#12-module-dms)
13. [Module 11: Approval Workflows & RBAC](#13-module-approval-workflows)
14. [Module 12: Notifications & Communication](#14-module-notifications)
15. [Module 13: Reports & Analytics](#15-module-reports)
16. [Technology Stack](#16-tech-stack)
17. [Data Model & Entity Relationships](#17-data-model)
18. [Security & Compliance](#18-security)
19. [API Design](#19-api-design)
20. [Development Roadmap](#20-roadmap)
21. [Glossary](#21-glossary)
22. [Appendix A: Complete Workflow Matrix](#appendix-a)
23. [Appendix B: Document Types & Retention](#appendix-b)

---

## 1. SYSTEM OVERVIEW & ARCHITECTURE {#1-system-overview}

### 1.1 Vision
A comprehensive multi-tenant SaaS Property Management Platform that streamlines the entire property lifecycle from unit reservation and tenant onboarding through lease management, financial operations, maintenance, and check-out for property managers, landlords, and tenants.

### 1.2 Architecture Diagram

```
+-----------------------------------------------------------------------------+
|                           SUPER ADMIN (Platform Level)                        |
|  Tenant Management  |  Billing & Plans  |  Platform Config  |  Analytics   |
+-----------------------------------------------------------------------------+
                                    |
                                    v
+-----------------------------------------------------------------------------+
|                        TENANT ISOLATION LAYER                               |
|              Each Admin/Host = One Tenant | Data Isolation                  |
+-----------------------------------------------------------------------------+
                                    |
                    +---------------+---------------+
                    |               |               |
                    v               v               v
            +-----------+   +-----------+   +-----------+
            | Admin/Host|   | Admin/Host|   | Admin/Host|
            | Tenant A  |   | Tenant B  |   | Tenant C  |
            +-----+-----+   +-----+-----+   +-----+-----+
                  |               |               |
    +-------------+---------------+---------------+-------------+
    |             |               |               |             |
    v             v               v               v             v
+-------+   +-------+     +-------+     +-------+     +-------+ +-------+
| Prop  |   | Lease |     | Fin   |     | Maint |     | HRMS  | | Comm  |
| & Unit|   | Mgmt  |     | & Acct|     | & Tick|     |       | | unity |
+-------+   +-------+     +-------+     +-------+     +-------+ +-------+
    |             |               |               |             |
    +-------------+---------------+---------------+-------------+
                                    |
                                    v
+-----------------------------------------------------------------------------+
|                      CUSTOMER/TENANT PORTAL                                  |
|  Inventory | Assets | Tickets | Payments | Bookings | Documents | Community  |
+-----------------------------------------------------------------------------+
                                    |
                    +---------------+---------------+
                    |                               |
                    v                               v
        +-------------------+           +-------------------+
        |  Shared Services  |           |    Data Layer     |
        |  Auth | RBAC     |           |  PostgreSQL       |
        |  Notif| Audit    |           |  Redis Cache      |
        |  File | Search   |           |  S3/MinIO Storage |
        |  Report| MQ      |           |  Elasticsearch    |
        +-------------------+           +-------------------+
```

### 1.3 Key Design Principles

| Principle | Implementation |
|-----------|---------------|
| **Multi-Tenancy** | Shared DB, Shared Schema with `tenant_id` row-level security |
| **RBAC** | Role-Permission matrix per tenant with approval workflow gates |
| **Audit Trail** | All mutations logged immutably with before/after values |
| **Soft Deletes** | `deleted_at` timestamp; never hard delete business records |
| **Document-Centric** | Every process generates, stores, and links documents |
| **Workflow-Driven** | State machines govern lease, ticket, approval lifecycles |

---

## 2. ACTORS, ROLES & RBAC MATRIX {#2-actors-roles-rbac}

### 2.1 Actor Definitions

| Actor | Level | Description |
|-------|-------|-------------|
| **Super Admin** | Platform | Manages entire SaaS ecosystem, tenant onboarding, billing, global config |
| **Admin/Host** | Tenant | Property owner/management company with full tenant control |
| **Property Manager** | Tenant | Day-to-day property operations, leases, maintenance oversight |
| **Leasing Department** | Tenant | Handles reservations, document verification, lease creation, renewals |
| **Marketing Agent** | Tenant | Prospects clients, reserves units, forwards leads to Leasing |
| **Finance Manager** | Tenant | Invoicing, payments, accounting, financial reporting |
| **Cashier** | Tenant | Receives payments, generates receipts, updates cheque status |
| **Maintenance Staff** | Tenant | Ticket resolution, inspections, vendor coordination |
| **HR Manager** | Tenant | Staff records, payroll, attendance, onboarding |
| **Tenant/Customer** | End User | Resident/leaseholder with self-service portal access |
| **Owner (Non-Resident)** | End User | Views property performance, financial statements, community |
| **Security Team** | Tenant | Receives key issue notifications, access control |

### 2.2 RBAC Permission Matrix

| Module | Super Admin | Admin/Host | Property Manager | Leasing Dept | Finance Mgr | Cashier | Maintenance | HR Mgr | Tenant | Owner |
|--------|:-----------:|:----------:|:----------------:|:------------:|:-----------:|:-------:|:-----------:|:------:|:------:|:-----:|
| Tenant Management | Yes | No | No | No | No | No | No | No | No | No |
| Property CRUD | Yes | Yes | Yes | No | No | No | No | No | No | No |
| Unit Management | Yes | Yes | Yes | No | No | No | No | No | No | No |
| Unit Reservation | Yes | Yes | Yes | Yes | No | No | No | No | No | No |
| Customer Master | Yes | Yes | Yes | Yes | No | No | No | No | No | No |
| Document Verification | Yes | Yes | Yes | Yes | No | No | No | No | No | No |
| Lease Creation | Yes | Yes | Yes | Yes | No | No | No | No | No | No |
| Lease Renewal | Yes | Yes | Yes | Yes | No | No | No | No | No | No |
| Payment Collection | Yes | Yes | No | No | Yes | Yes | No | No | No | No |
| Receipt Generation | Yes | Yes | No | No | Yes | Yes | No | No | No | No |
| Cheque Management | Yes | Yes | No | No | Yes | Yes | No | No | No | No |
| Key Handover | Yes | Yes | Yes | Yes | No | No | No | No | No | No |
| Check-In/Out | Yes | Yes | Yes | No | No | No | Yes | No | No | No |
| Maintenance Tickets | Yes | Yes | Yes | No | No | No | Yes | No | Yes | No |
| Facility Booking | Yes | Yes | Yes | No | No | No | No | No | Yes | No |
| Community Posts | Yes | Yes | Yes | No | No | No | No | No | Yes | Yes |
| HRMS | Yes | Yes | No | No | No | No | No | Yes | No | No |
| Fixed Assets | Yes | Yes | Yes | No | No | No | Yes | No | No | No |
| Reports & Analytics | Yes | Yes | Yes | Yes | Yes | No | No | No | No | Yes |
| Approval Workflows | Yes | Yes | No | No | No | No | No | No | No | No |
| User Management | Yes | Yes | No | No | No | No | No | No | No | No |

---

## 3. MODULE 1: PROPERTY & UNIT MANAGEMENT {#3-module-property-unit}

### 3.1 Property Master

| Field | Type | Description |
|-------|------|-------------|
| `property_id` | UUID (PK) | Unique identifier |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `property_name` | String | Display name |
| `property_type` | Enum | Residential, Commercial, Industrial, Mixed-Use |
| `address_line_1/2` | String | Street address |
| `city`, `state`, `country`, `postal_code` | String | Location |
| `geo_latitude`, `geo_longitude` | Decimal | Map coordinates |
| `total_units` | Integer | Computed from units |
| `total_floors` | Integer | Building floors |
| `build_year` | Integer | Year constructed |
| `amenities` | JSONB | ["pool", "gym", "parking", "elevator", ...] |
| `status` | Enum | Active, Under Renovation, Archived |
| `property_manager_id` | UUID (FK) | Assigned manager |
| `landlord_name` | String | Owner/landlord name |
| `landlord_contact` | String | Landlord phone/email |
| `documents` | Array[UUID] | Linked document IDs |
| `created_at`, `updated_at`, `deleted_at` | Timestamp | Audit fields |

### 3.2 Unit Master

| Field | Type | Description |
|-------|------|-------------|
| `unit_id` | UUID (PK) | Unique identifier |
| `property_id` | UUID (FK) | Parent property |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `unit_number` | String | e.g., "2B", "101", "A-05" |
| `unit_type` | Enum | Studio, 1BR, 2BR, 3BR, Villa, Office, Retail, Storage |
| `floor_number` | Integer | Floor level |
| `size_sqft` / `size_sqm` | Decimal | Area measurement |
| `bedrooms`, `bathrooms` | Integer | Room counts |
| `furnished_status` | Enum | Furnished, Semi-Furnished, Unfurnished |
| `rent_price` | Decimal | Base rental amount |
| `deposit_amount` | Decimal | Required security deposit |
| `status` | Enum | **Available**, **Reserved**, **Occupied**, **Under Maintenance**, **Not Ready** |
| `current_lease_id` | UUID (FK) | Active lease reference |
| `inventory_checklist` | JSONB | Fixtures, appliances, keys, meters |
| `photos` | Array[URL] | Unit images |
| `created_at`, `updated_at`, `deleted_at` | Timestamp | Audit fields |

### 3.3 Unit Status Lifecycle
```
Available -> Reserved -> Occupied -> Under Maintenance -> Available
    ^_________________________________________________|

Available -> Not Ready -> Available (after renovation)
Occupied -> Vacant -> Available (after check-out)
```

### 3.4 Unit Reservation (Pre-Lease)

| Field | Type | Description |
|-------|------|-------------|
| `reservation_id` | UUID (PK) | Unique identifier |
| `unit_id` | UUID (FK) | Reserved unit |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `prospect_name` | String | Interested party name |
| `prospect_contact` | String | Phone/email |
| `prospect_id_type` | Enum | Qatar ID, Passport, Commercial Reg |
| `prospect_id_number` | String | ID document number |
| `marketing_agent_id` | UUID (FK) | Agent who reserved |
| `proposed_lease_period` | Integer | Months (e.g., 12) |
| `expected_start_date` | Date | Anticipated move-in |
| `proposed_rental_amount` | Decimal | Agreed/negotiated rent |
| `reservation_validity` | DateTime | Expiry of reservation |
| `special_conditions` | Text | Remarks/notes |
| `status` | Enum | Active, Extended, Cancelled, Expired, Converted |
| `created_at`, `updated_at` | Timestamp | Audit fields |

**Business Rules:**
- When reserved, unit status changes from **Available** to **Reserved**
- Auto-notification to Marketing Agent + Leasing Department 48h before expiry
- If not converted within validity: notify for extension, cancellation, or release
- Duplicate reservation prevention per unit

---

## 4. MODULE 2: CUSTOMER MASTER (TENANT/OWNER) {#4-module-customer-master}

### 4.1 Customer Profile

| Field | Type | Description |
|-------|------|-------------|
| `customer_id` | UUID (PK) | Unique identifier |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `customer_type` | Enum | Individual, Company |
| `full_name` / `company_name` | String | Display name |
| `qatar_id` | String | Qatar ID number |
| `passport_number` | String | Passport number |
| `commercial_registration` | String | CR number (for companies) |
| `nationality` | String | Country of citizenship |
| `mobile_number` | String | Primary contact |
| `email_address` | String | Primary email |
| `permanent_address` | Text | Home country address |
| `local_address` | Text | Current residence address |
| `emergency_contact_name` | String | Emergency contact |
| `emergency_contact_phone` | String | Emergency phone |
| `employer_name` | String | Company/employer |
| `employer_address` | Text | Employer location |
| `designation` | String | Job title |
| `monthly_income` | Decimal | Salary/income |
| `authorized_signatory_name` | String | For company leases |
| `authorized_signatory_id` | String | Signatory ID |
| `documents` | Array[UUID] | Linked document IDs |
| `document_expiry_dates` | JSONB | {qatar_id: "2027-05-01", passport: "2028-03-15"} |
| `verification_status` | Enum | Pending, Verified, Rejected, Additional Info Required |
| `verified_by` | UUID (FK) | Leasing staff who verified |
| `verified_at` | Timestamp | Verification timestamp |
| `created_at`, `updated_at`, `deleted_at` | Timestamp | Audit fields |

### 4.2 Duplicate Prevention
The system prevents duplicate customer creation by checking against:
- Qatar ID number
- Passport number
- Commercial Registration number
- Mobile number
- Email address

**Action on duplicate detection:** Alert user, show existing customer record, offer "Link to Existing" or "Create New with Override Approval"

### 4.3 Document Requirements by Customer Type

**Individual Tenant:**
- Qatar ID (front & back)
- Passport copy
- Residence permit
- Salary certificate / employment confirmation
- Bank statement (last 3 months)

**Company Tenant:**
- Commercial Registration certificate
- Computer Card
- Authorized signatory documents
- Board resolution (if applicable)
- Bank reference letter

**Mandatory Document Verification Status:**
- `Pending` -> Documents uploaded, awaiting review
- `Verified` -> All mandatory docs validated
- `Rejected` -> Documents invalid/expired
- `Additional Info Required` -> Incomplete submission

**Business Rule:** Lease Agreement cannot be generated until all mandatory documents are **Verified** OR an authorized override approval is recorded with approver name, reason, and timestamp.

---

## 5. MODULE 3: LEASE MANAGEMENT (END-TO-END WORKFLOW) {#5-module-lease-management}

### 5.1 Lease Agreement Master

| Field | Type | Description |
|-------|------|-------------|
| `lease_id` | UUID (PK) | Unique identifier |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `unit_id` | UUID (FK) | Leased unit |
| `property_id` | UUID (FK) | Parent property |
| `customer_id` | UUID (FK) | Tenant/customer |
| `lease_number` | String | Auto-generated (e.g., "L-2026-0001") |
| `lease_status` | Enum | See status lifecycle below |
| `commencement_date` | Date | Lease start |
| `expiry_date` | Date | Lease end |
| `lease_period_months` | Integer | Duration in months |
| `rental_amount` | Decimal | Monthly/periodic rent |
| `payment_frequency` | Enum | Monthly, Quarterly, Semi-Annually, Annually |
| `security_deposit` | Decimal | Deposit amount |
| `security_deposit_status` | Enum | Pending, Received, Refunded, Adjusted |
| `grace_period_days` | Integer | Late payment grace |
| `late_penalty_percentage` | Decimal | Penalty rate |
| `late_penalty_fixed` | Decimal | Fixed penalty amount |
| `renewal_terms` | Text | Auto-renewal, negotiation, etc. |
| `notice_period_days` | Integer | Days required for termination notice |
| `maintenance_responsibility` | Enum | Landlord, Tenant, Shared |
| `utility_responsibility` | Enum | Landlord, Tenant, Shared |
| `parking_details` | Text | Parking allocation, count, numbers |
| `additional_facilities` | JSONB | ["gym", "pool_access", "storage"] |
| `special_conditions` | Text | Custom clauses |
| `number_of_pdc` | Integer | Post-dated cheque count |
| `pdc_details` | Array[UUID] | Linked cheque records |
| `tenant_signed_doc_url` | String | Tenant signed agreement |
| `landlord_signed_doc_url` | String | Landlord signed agreement |
| `tenant_signature_date` | Date | When tenant signed |
| `landlord_signature_date` | Date | When landlord signed |
| `signed_by_receiver` | String | Staff who received tenant signature |
| `key_handover_date` | Date | Keys issued |
| `check_in_report_id` | UUID (FK) | Check-in inspection report |
| `check_out_report_id` | UUID (FK) | Check-out inspection report |
| `previous_lease_id` | UUID (FK) | For renewal linkage |
| `created_by` | UUID (FK) | Leasing staff |
| `created_at`, `updated_at`, `deleted_at` | Timestamp | Audit fields |

### 5.2 Lease Status Lifecycle

```
DRAFT -> DOCUMENTS_PENDING -> DOCUMENTS_VERIFIED -> AGREEMENT_CREATED
  -> TENANT_SIGNED -> PAYMENT_PENDING -> PAYMENT_COLLECTED -> LANDLORD_SIGNED
  -> KEY_HANDOVER_PENDING -> KEY_HANDED_OVER -> CHECK_IN_PENDING -> CHECK_IN_COMPLETED
  -> ACTIVE -> RENEWAL_NOTICE_SENT -> RENEWAL_DISCUSSION -> RENEWAL_CONFIRMED
  -> RENEWAL_AGREEMENT_CREATED -> ... (repeat cycle) ...

ACTIVE -> NON_RENEWAL_NOTICE -> CHECK_OUT_SCHEDULED -> CHECK_OUT_COMPLETED
  -> SETTLEMENT_PENDING -> SETTLEMENT_COMPLETED -> CLOSED

[Any Status] -> TERMINATED (with reason and approval)
```

### 5.3 Complete Lease-to-Check-Out Workflow

#### STAGE 1: UNIT RESERVATION
| Attribute | Detail |
|-----------|--------|
| **Responsible** | Marketing Agent |
| **Module** | Lease Module -> Reservation |
| **Input** | Prospect inquiry, unit selection |
| **System Action** | Unit status -> Reserved; Set expiry timer |
| **Output** | Reservation record, unit blocked |
| **Approval** | Auto (within agent authority) |

#### STAGE 2: CUSTOMER CREATION
| Attribute | Detail |
|-----------|--------|
| **Responsible** | Leasing Department |
| **Module** | Customer Master |
| **Input** | Prospect details, documents from Marketing Agent |
| **System Action** | Duplicate check, profile creation, document upload |
| **Output** | Customer record with verification status = Pending |
| **Approval** | Leasing Department verification |

#### STAGE 3: DOCUMENT VERIFICATION
| Attribute | Detail |
|-----------|--------|
| **Responsible** | Leasing Department |
| **Module** | Customer Master + DMS |
| **Input** | Uploaded documents |
| **System Action** | Status tracking, expiry date logging, mandatory check |
| **Output** | Verification status: Verified / Rejected / Additional Info Required |
| **Approval** | Leasing Department Head (if override needed) |

#### STAGE 4: LEASE AGREEMENT CREATION
| Attribute | Detail |
|-----------|--------|
| **Responsible** | Leasing Department |
| **Module** | Lease Module |
| **Input** | Verified customer, unit, negotiated terms |
| **System Action** | Auto-generate agreement from template; Create payment schedule |
| **Output** | Draft lease agreement, payment schedule |
| **Approval** | Property Manager / Admin (if rent discount > threshold) |

**Payment Schedule Auto-Generation:**
- Based on `payment_frequency` and `lease_period_months`
- Generates line items: Period, Due Date, Amount, Status
- Example: Monthly for 12 months = 12 invoice line items

#### STAGE 5: TENANT SIGNATURE
| Attribute | Detail |
|-----------|--------|
| **Responsible** | Tenant |
| **Module** | Lease Module + DMS |
| **Input** | Draft agreement for review |
| **System Action** | e-Signature or physical upload; Status update |
| **Output** | Signed document, status = Tenant Signed |
| **Approval** | Tenant acknowledgment |

**System Records:**
- `tenant_signature_date`
- `signed_document_attachment`
- `signed_by_receiver` (staff name)
- Status: **Tenant Signed -- Pending Collection and Landlord Signature**

#### STAGE 6: PAYMENT COLLECTION (Finance Module)
| Attribute | Detail |
|-----------|--------|
| **Responsible** | Cashier |
| **Module** | Finance Module |
| **Input** | Approved lease, payment schedule |
| **System Action** | Record payments, update cheque details, link to lease |
| **Output** | Payment records, updated lease financial status |
| **Approval** | Cashier + Finance Manager (for large amounts) |

**Collections Include:**
- Advance rent (first period)
- Post-dated cheques (PDCs)
- Security deposit
- Agency commission
- Registration/administrative charges
- Utility deposit
- Other approved charges

**PDC Capture Fields:**
| Field | Description |
|-------|-------------|
| `cheque_id` | UUID (PK) |
| `cheque_number` | Physical cheque number |
| `bank_name` | Issuing bank |
| `cheque_date` | Date on cheque |
| `cheque_amount` | Amount |
| `tenant_name` / `payer_name` | Who issued |
| `lease_id` (FK) | Linked lease |
| `payment_period` | Which period this covers |
| `status` | Received, Deposited, Cleared, Returned, Replaced, Cancelled |
| `deposit_date` | When deposited to bank |
| `clearance_date` | When cleared |
| `return_reason` | If returned (NSF, stopped, etc.) |
| `replaced_by_cheque_id` | If replaced, link to new cheque |
| `document_url` | Scanned cheque image |

**Security Deposit Rules:**
- Recorded separately from rental income
- Linked to tenant AND lease
- Held in escrow tracking
- Refundable upon check-out (less deductions)

#### STAGE 7: RECEIPT GENERATION
| Attribute | Detail |
|-----------|--------|
| **Responsible** | Cashier |
| **Module** | Finance Module |
| **Input** | Confirmed payment/cheque receipt |
| **System Action** | Auto-generate receipt with unique number |
| **Output** | Printable/emailable receipt |
| **Approval** | Auto (system-generated) |

**Receipt Types:**
- Rent collection receipt
- Security deposit receipt
- Agency commission receipt
- Administrative charges receipt
- Other collections receipt

**Receipt Fields:**
| Field | Description |
|-------|-------------|
| `receipt_id` | UUID (PK) |
| `receipt_number` | Auto-generated (e.g., "R-2026-0001") |
| `receipt_date` | Issue date |
| `tenant_name` | Customer name |
| `property_name`, `unit_number` | Location |
| `lease_reference` | Lease number |
| `payment_type` | Rent, Deposit, Commission, etc. |
| `payment_method` | Cash, Cheque, Bank Transfer, Card |
| `cheque_reference` / `transaction_reference` | Tracking number |
| `amount_collected` | Amount |
| `collection_period` | Which period |
| `cashier_name` | Who issued |
| `cashier_id` (FK) | Staff reference |
| `print_count` | Times printed |
| `email_sent` | Boolean |

#### STAGE 8: LANDLORD SIGNATURE
| Attribute | Detail |
|-----------|--------|
| **Responsible** | Leasing Department |
| **Module** | Lease Module + DMS |
| **Input** | Tenant-signed agreement + collection receipts + PDC summary + documents |
| **System Action** | Package submission; Status tracking |
| **Output** | Fully signed agreement uploaded |
| **Approval** | Landlord / Authorized signatory |

**Submission Package to Landlord:**
1. Tenant-signed Lease Agreement
2. Collection receipts
3. Post-dated cheque summary
4. Security deposit receipt
5. Tenant supporting documents
6. Any required approval documents

**Upon Landlord Signature:**
- Upload fully signed agreement
- Share with tenant
- Status: **Active** (pending key handover/check-in)

#### STAGE 9: KEY ISSUE NOTIFICATION
| Attribute | Detail |
|-----------|--------|
| **Responsible** | Leasing Department |
| **Module** | Notifications + Lease Module |
| **Input** | Fully signed lease, completed collections |
| **System Action** | Auto-generate notification; Send to stakeholders |
| **Output** | Key Issue Notification document |
| **Approval** | Auto (system-triggered) |

**Notification Recipients:**
- Tenant
- Property Manager
- Concerned property staff
- Security team
- Maintenance/facility team

**Notification Content:**
- Tenant name
- Property and unit details
- Lease commencement date
- Approved key handover date and time
- Number and type of keys/access cards
- Authorized person collecting keys
- Outstanding requirements (if any)
- Property Manager contact details

**Business Rule:** No key issued unless lease is approved, collections completed, AND landlord has signed.

#### STAGE 10: KEY HANDOVER
| Attribute | Detail |
|-----------|--------|
| **Responsible** | Property Manager / Authorized Staff |
| **Module** | Lease Module |
| **Input** | Key Issue Notification, tenant arrival |
| **System Action** | Record handover details; Update status |
| **Output** | Key Handover Form |
| **Approval** | Tenant + Staff mutual acknowledgment |

**Key Handover Form Fields:**
| Field | Description |
|-------|-------------|
| `handover_id` | UUID (PK) |
| `lease_id` (FK) | Linked lease |
| `handover_date` | Date and time |
| `keys_issued` | JSONB [{type: "main_door", count: 2, number: "K-101-A"}] |
| `access_cards_issued` | JSONB [{type: "elevator", count: 2, number: "AC-045"}] |
| `parking_remotes` | JSONB [{number: "PR-12", bay: "P-05"}] |
| `meter_readings` | JSONB {electricity: "45231", water: "8912"} |
| `tenant_acknowledgement` | Signature / digital acknowledgment |
| `staff_name` | Issuing staff |
| `staff_signature` | Staff signature |
| `staff_id` (FK) | Staff reference |

#### STAGE 11: CHECK-IN PROCESS
| Attribute | Detail |
|-----------|--------|
| **Responsible** | Property Manager + Tenant |
| **Module** | Lease Module + Maintenance Module |
| **Input** | Key handover completed |
| **System Action** | Inspection checklist; Photo upload; Status update |
| **Output** | Check-In Report |
| **Approval** | Tenant acknowledgment |

**Check-In Report Fields:**
| Category | Inspection Items |
|----------|-----------------|
| **Unit Condition** | Walls, floors, ceilings, doors, windows |
| **Furniture** | Condition of each item, count verification |
| **Appliances** | AC, fridge, stove, washing machine -- functional test |
| **Fixtures** | Lights, fans, taps, switches -- working status |
| **Meters** | Electricity reading, water reading, AC reading |
| **Keys/Access** | Count verification against handover form |
| **Photos/Videos** | Before-occupancy documentation |
| **Damages** | Pre-existing damage log with photos |
| **Pending Work** | Maintenance items to be resolved |

**Check-In Workflow:**
1. Property Manager conducts walkthrough with tenant
2. Records condition of each item
3. Takes photos/videos
4. Notes any pre-existing damage
5. Tenant reviews and acknowledges
6. Any pending maintenance -> auto-create ticket in Maintenance Module
7. Status: **Check-In Completed** -> Unit status: **Occupied**

#### STAGE 12: LEASE RENEWAL NOTIFICATION (Auto)
| Attribute | Detail |
|-----------|--------|
| **Responsible** | System (Auto) + Leasing Department |
| **Module** | Lease Module + Notifications |
| **Input** | Lease expiry date - 60 days |
| **System Action** | Auto-generate notification; Send to all stakeholders |
| **Output** | Renewal Notification |
| **Approval** | Auto (system-triggered at T-60 days) |

**Notification Recipients:**
- Tenant
- Leasing Department
- Marketing Agent (if applicable)
- Property Manager
- Landlord / Authorized person

**Notification Content:**
- Current lease expiry date
- Proposed renewal period
- Proposed rental amount (with escalation if applicable)
- Revised terms (if any)
- Required notice period
- Last date for renewal confirmation
- Outstanding payments or obligations

**Renewal Status Tracking:**
- `Renewal Confirmed`
- `Renewal Under Discussion`
- `Non-Renewal Confirmed`
- `Awaiting Tenant Response`

#### STAGE 13: LEASE RENEWAL PROCESS
| Attribute | Detail |
|-----------|--------|
| **Responsible** | Leasing Department |
| **Module** | Lease Module + Finance Module |
| **Input** | Tenant renewal confirmation |
| **System Action** | Create renewal lease; Link to previous; Update schedules |
| **Output** | Renewed Lease Agreement |
| **Approval** | Property Manager / Admin (if rent change > threshold) |

**Renewal Steps:**
1. Review tenant documents (check expiry dates)
2. Update rental amount and lease terms
3. Obtain renewal approval (if required by workflow)
4. Create renewed Lease Agreement (linked to previous)
5. Tenant signature
6. Collect new PDCs or payment adjustments
7. Adjust/continue security deposit
8. Generate collection receipts
9. Landlord/authorized person signature
10. Activate renewed lease period

**Linking:** Renewed lease retains `previous_lease_id` for complete history chain.

#### STAGE 14: NON-RENEWAL & CHECK-OUT
| Attribute | Detail |
|-----------|--------|
| **Responsible** | Leasing Department + Property Manager + Finance |
| **Module** | Lease Module + Finance + Maintenance |
| **Input** | Tenant non-renewal notice |
| **System Action** | Schedule check-out; Notify departments; Track obligations |
| **Output** | Check-Out Schedule + Outstanding Balance Report |
| **Approval** | Property Manager |

**System Records on Non-Renewal:**
- Tenant's non-renewal notice date
- Planned move-out date
- Notice submission date
- Outstanding rent or charges (from Finance)
- Required inspection date (move-out date)
- Utility clearance requirements
- Key return requirements

**Pre Check-Out Finance Clearance:**
- Finance Department confirms outstanding balances
- Any arrears must be settled before check-out

#### STAGE 15: CHECK-OUT INSPECTION
| Attribute | Detail |
|-----------|--------|
| **Responsible** | Property Manager + Tenant |
| **Module** | Lease Module + Maintenance |
| **Input** | Move-out date reached |
| **System Action** | Inspection checklist; Compare with Check-In; Photo upload |
| **Output** | Check-Out Report |
| **Approval** | Tenant acknowledgment |

**Check-Out Report Comparison:**
| Item | Check-In Condition | Check-Out Condition | Assessment | Charge |
|------|-------------------|---------------------|------------|--------|
| Walls | Good | Scratched | Tenant Damage | $200 |
| Floor | Good | Good | Normal Wear | $0 |
| AC Unit | Working | Not Working | Tenant Damage | $150 |
| Keys | 3 issued | 2 returned | Missing | $50 |

**Assessment Categories:**
- **Normal Wear and Tear** -- No charge
- **Tenant-Caused Damage** -- Chargeable (with photo evidence)
- **Missing Items** -- Replacement cost
- **Maintenance Required** -- Chargeable if tenant-caused
- **Utility Balances** -- Final meter readings, settle outstanding
- **Unreturned Keys/Access Cards** -- Replacement cost per item
- **Cleaning/Restoration** -- If unit requires deep cleaning

**Tenant Obligations at Check-Out:**
1. Acknowledge Check-Out Report
2. Return all keys, access cards, remotes, property items
3. Settle any outstanding balances
4. Sign check-out acknowledgment

#### STAGE 16: SECURITY DEPOSIT SETTLEMENT & LEASE CLOSURE
| Attribute | Detail |
|-----------|--------|
| **Responsible** | Finance Department |
| **Module** | Finance Module |
| **Input** | Check-Out Report, outstanding balances |
| **System Action** | Calculate final settlement; Process refund; Close lease |
| **Output** | Final Settlement Statement |
| **Approval** | Finance Manager + Admin (for refunds) |

**Final Settlement Statement:**
| Item | Amount |
|------|--------|
| Security Deposit Received | $2,000.00 |
| Less: Outstanding Rent | -$0.00 |
| Less: Maintenance/Damage Charges | -$400.00 |
| Less: Utility Charges | -$85.00 |
| Less: Missing Keys (1 x $50) | -$50.00 |
| Less: Cleaning Charges | -$150.00 |
| Less: Other Deductions | -$0.00 |
| **Refundable Balance** | **$1,315.00** |

**Refund Processing:**
- Requires Finance Manager approval
- Requires Admin/Host approval (if amount > threshold)
- Processed via original payment method or bank transfer
- Receipt generated for refund

**Lease Closure:**
- Status: **Closed**
- Unit status: **Vacant** -> then **Available** or **Under Maintenance**
- Complete history retained: documents, receipts, inspection reports, settlement
- Audit trail preserved indefinitely


---

## 6. MODULE 4: FINANCE & ACCOUNTING {#6-module-finance}

### 6.1 Chart of Accounts (Sample)
| Code | Account Name | Type |
|------|-------------|------|
| 1000 | Rental Income | Revenue |
| 1100 | Security Deposits Received | Liability |
| 1200 | Agency Commission Income | Revenue |
| 2000 | Maintenance Expenses | Expense |
| 2100 | Utility Expenses | Expense |
| 2200 | Staff Salaries | Expense |
| 3000 | Bank Account | Asset |
| 3100 | Accounts Receivable | Asset |
| 4000 | Accounts Payable | Liability |

### 6.2 Invoice Management

| Field | Type | Description |
|-------|------|-------------|
| `invoice_id` | UUID (PK) | Unique identifier |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `lease_id` | UUID (FK) | Linked lease |
| `invoice_number` | String | Auto-generated |
| `invoice_type` | Enum | Rent, Utility, Penalty, Fee, Other |
| `period_start`, `period_end` | Date | Billing period |
| `due_date` | Date | Payment deadline |
| `amount` | Decimal | Invoice amount |
| `tax_amount` | Decimal | GST/VAT if applicable |
| `total_amount` | Decimal | Amount + Tax |
| `paid_amount` | Decimal | Amount received |
| `balance_due` | Decimal | Outstanding |
| `status` | Enum | Draft, Sent, Partially Paid, Paid, Overdue, Cancelled |
| `auto_generated` | Boolean | From recurring schedule |
| `created_at`, `updated_at` | Timestamp | Audit fields |

**Auto-Invoice Generation:**
- Cron job runs on 1st of each month (or configured date)
- Reads active leases with payment frequency
- Generates invoices for the period
- Applies escalation clauses if configured
- Sends to tenant via email + portal notification

### 6.3 Payment Management

| Field | Type | Description |
|-------|------|-------------|
| `payment_id` | UUID (PK) | Unique identifier |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `invoice_id` | UUID (FK) | Linked invoice |
| `lease_id` | UUID (FK) | Linked lease |
| `amount` | Decimal | Payment amount |
| `payment_method` | Enum | Cash, Cheque, Bank Transfer, Credit Card, Online |
| `payment_date` | Date | When received |
| `reference_number` | String | Cheque #, TXN ID, etc. |
| `gateway_response` | JSONB | Payment gateway raw response |
| `status` | Enum | Pending, Completed, Failed, Refunded |
| `recorded_by` | UUID (FK) | Cashier/Staff |
| `created_at` | Timestamp | Audit field |

### 6.4 Cheque Lifecycle Management

```
Received -> Deposited -> Cleared -> (Completed)
    |           |           |
Returned <- Stopped    Bounced   -> Replaced -> Received
    |
Cancelled
```

**Cheque Status Transitions:**
| From | To | Trigger | Actor |
|------|-----|---------|-------|
| Received | Deposited | Cashier deposits to bank | Cashier |
| Deposited | Cleared | Bank confirms clearance | System (webhook) |
| Deposited | Returned | Bank returns (NSF, stopped) | System (webhook) |
| Returned | Replaced | Tenant provides new cheque | Cashier |
| Received | Cancelled | Lease cancelled, cheque returned | Cashier |

### 6.5 Financial Reports

| Report Name | Description | Frequency |
|-------------|-------------|-----------|
| Rent Roll | All leases, rents, payment status | Monthly |
| Arrears Report | Overdue invoices by tenant | Daily/Weekly |
| Occupancy vs Revenue | Correlation analysis | Monthly |
| Expense Analysis | By property, category, vendor | Monthly |
| Cash Flow Statement | Inflows and outflows | Monthly |
| Profit & Loss | Revenue minus expenses | Monthly/Quarterly |
| Balance Sheet | Assets, liabilities, equity | Quarterly |
| Tax Report | GST/VAT summary | Monthly/Quarterly |
| Security Deposit Ledger | All deposits, refunds, adjustments | On Demand |
| Cheque Status Report | All PDCs with current status | Weekly |

---

## 7. MODULE 5: FIXED ASSETS & PROCUREMENT {#7-module-fixed-assets}

### 7.1 Asset Registry

| Field | Type | Description |
|-------|------|-------------|
| `asset_id` | UUID (PK) | Unique identifier |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `property_id` | UUID (FK) | Location |
| `unit_id` | UUID (FK) | Specific unit (optional) |
| `asset_name` | String | Display name |
| `asset_category` | Enum | HVAC, Electrical, Plumbing, Furniture, Appliance, Security, Elevator, Generator, Other |
| `asset_tag` | String | Unique QR/Barcode |
| `manufacturer` | String | Brand/Manufacturer |
| `model_number` | String | Model |
| `serial_number` | String | Serial # |
| `purchase_date` | Date | When acquired |
| `purchase_cost` | Decimal | Acquisition cost |
| `installation_date` | Date | When installed |
| `warranty_expiry` | Date | Warranty end |
| `expected_life_years` | Integer | Useful life |
| `depreciation_method` | Enum | Straight-Line, Declining Balance |
| `annual_depreciation` | Decimal | Computed amount |
| `current_book_value` | Decimal | Cost - Accumulated depreciation |
| `condition` | Enum | Excellent, Good, Fair, Poor, Non-Functional |
| `status` | Enum | Active, Under Maintenance, Retired, Disposed |
| `maintenance_schedule` | JSONB | Frequency, last service, next due |
| `documents` | Array[UUID] | Manuals, warranties, invoices |
| `created_at`, `updated_at` | Timestamp | Audit fields |

### 7.2 Depreciation Calculation

**Straight-Line Method:**
```
Annual Depreciation = (Purchase Cost - Salvage Value) / Useful Life
Monthly Depreciation = Annual Depreciation / 12
```

**Declining Balance Method:**
```
Annual Depreciation = Book Value at Start of Year x Depreciation Rate
```

### 7.3 Procurement Workflow

| Stage | Responsible | Module | Input | Output | Approval |
|-------|-------------|--------|-------|--------|----------|
| 1. Requisition | Any Staff | Fixed Assets | Need identification | Purchase Requisition | Department Head |
| 2. RFQ | Procurement | Fixed Assets | Requisition approved | Vendor quotations | Property Manager |
| 3. PO Creation | Procurement | Fixed Assets | Selected vendor | Purchase Order | Admin/Host (if > threshold) |
| 4. Goods Receipt | Maintenance | Fixed Assets | PO + Delivery | GRN (Goods Receipt Note) | Maintenance Staff |
| 5. Inspection | Maintenance | Fixed Assets | Received goods | Inspection Report | Property Manager |
| 6. Invoice Matching | Finance | Finance | PO + GRN + Vendor Invoice | 3-Way Match | Finance Manager |
| 7. Payment | Cashier | Finance | Approved invoice | Payment + Receipt | Auto (if within limit) |
| 8. Asset Registration | Maintenance | Fixed Assets | Payment confirmed | Asset record created | Auto |

---

## 8. MODULE 6: HRMS {#8-module-hrms}

### 8.1 Employee Master

| Field | Type | Description |
|-------|------|-------------|
| `employee_id` | UUID (PK) | Unique identifier |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `user_id` | UUID (FK) | Linked system user |
| `employee_code` | String | Internal code (e.g., "EMP-001") |
| `full_name` | String | Employee name |
| `department` | Enum | Leasing, Finance, Maintenance, Security, Management, Admin |
| `designation` | String | Job title |
| `employment_type` | Enum | Full-Time, Part-Time, Contract |
| `joining_date` | Date | Start date |
| `probation_end_date` | Date | Probation completion |
| `basic_salary` | Decimal | Base pay |
| `allowances` | JSONB | {housing: 500, transport: 200, ...} |
| `deductions` | JSONB | {tax: 150, insurance: 50, ...} |
| `net_salary` | Decimal | Computed |
| `bank_account` | String | Salary account |
| `bank_name` | String | Bank |
| `status` | Enum | Active, On Leave, Terminated, Resigned |
| `documents` | Array[UUID] | Contract, ID, certificates |
| `created_at`, `updated_at` | Timestamp | Audit fields |

### 8.2 Attendance Management

| Field | Type | Description |
|-------|------|-------------|
| `attendance_id` | UUID (PK) | Unique identifier |
| `employee_id` | UUID (FK) | Staff member |
| `date` | Date | Attendance date |
| `check_in` | DateTime | Clock-in time |
| `check_out` | DateTime | Clock-out time |
| `check_in_method` | Enum | Web, Mobile App, Biometric, Manual |
| `check_out_method` | Enum | Web, Mobile App, Biometric, Manual |
| `check_in_location` | JSONB | {lat: x, lng: y} (if GPS) |
| `work_hours` | Decimal | Computed duration |
| `overtime_hours` | Decimal | Computed OT |
| `status` | Enum | Present, Absent, Late, Early Leave, On Leave, Holiday |
| `shift_id` | UUID (FK) | Assigned shift |
| `approved_by` | UUID (FK) | Manager approval (for corrections) |
| `created_at` | Timestamp | Audit field |

### 8.3 Leave Management

| Field | Type | Description |
|-------|------|-------------|
| `leave_id` | UUID (PK) | Unique identifier |
| `employee_id` | UUID (FK) | Requesting staff |
| `leave_type` | Enum | Annual, Sick, Emergency, Unpaid, Maternity, Paternity |
| `start_date`, `end_date` | Date | Leave period |
| `days_requested` | Integer | Total days |
| `reason` | Text | Leave reason |
| `status` | Enum | Pending, Approved, Rejected, Cancelled |
| `approved_by` | UUID (FK) | Approver |
| `approved_at` | Timestamp | Approval timestamp |
| `created_at` | Timestamp | Audit field |

**Leave Balance Tracking:**
- Auto-accrual based on employment type and tenure
- Real-time balance display
- Carry-forward rules (configurable)

### 8.4 Payroll Processing

| Field | Type | Description |
|-------|------|-------------|
| `payroll_id` | UUID (PK) | Unique identifier |
| `employee_id` | UUID (FK) | Staff member |
| `payroll_month` | String | "YYYY-MM" |
| `basic_salary` | Decimal | Base pay |
| `allowances_total` | Decimal | Sum of allowances |
| `gross_salary` | Decimal | Basic + Allowances |
| `deductions_total` | Decimal | Tax + Insurance + Loans + Absence |
| `net_pay` | Decimal | Gross - Deductions |
| `overtime_pay` | Decimal | OT hours x rate |
| `leave_deduction` | Decimal | Unpaid leave deduction |
| `status` | Enum | Draft, Approved, Processed, Paid |
| `payslip_url` | String | Generated payslip PDF |
| `processed_by` | UUID (FK) | HR/Finance staff |
| `paid_at` | Timestamp | Payment timestamp |
| `created_at` | Timestamp | Audit field |

**Payroll Workflow:**
1. System auto-generates draft payroll on configured date
2. HR reviews attendance, leave, OT data
3. Finance reviews deductions, tax calculations
4. Admin/Host approves (if required by workflow)
5. System generates payslips
6. Bank transfer initiated (integration)
7. Status: Paid

---

## 9. MODULE 7: MAINTENANCE & TICKETING {#9-module-maintenance}

### 9.1 Maintenance Ticket

| Field | Type | Description |
|-------|------|-------------|
| `ticket_id` | UUID (PK) | Unique identifier |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `unit_id` | UUID (FK) | Affected unit |
| `property_id` | UUID (FK) | Parent property |
| `raised_by` | UUID (FK) | Tenant or staff who raised |
| `raised_by_type` | Enum | Tenant, Staff, System (auto) |
| `category` | Enum | Plumbing, Electrical, HVAC, Carpentry, Painting, Cleaning, Pest Control, Security, Other |
| `priority` | Enum | Low, Medium, High, Emergency |
| `title` | String | Brief description |
| `description` | Text | Detailed issue description |
| `photos` | Array[URL] | Evidence images |
| `videos` | Array[URL] | Evidence videos |
| `assigned_to` | UUID (FK) | Maintenance staff |
| `vendor_id` | UUID (FK) | External vendor (if outsourced) |
| `status` | Enum | Open, Acknowledged, In Progress, On Hold, Resolved, Pending Verification, Closed, Reopened |
| `sla_target` | DateTime | SLA deadline |
| `sla_breached` | Boolean | SLA exceeded |
| `estimated_cost` | Decimal | Pre-work estimate |
| `actual_cost` | Decimal | Final cost |
| `materials_used` | JSONB | [{item: "pipe", qty: 2, cost: 50}] |
| `before_photos` | Array[URL] | Pre-repair images |
| `after_photos` | Array[URL] | Post-repair images |
| `tenant_rating` | Integer | 1-5 satisfaction score |
| `tenant_feedback` | Text | Comments |
| `created_at`, `resolved_at`, `closed_at` | Timestamp | Lifecycle timestamps |

### 9.2 Ticket Status Lifecycle

```
OPEN -> ACKNOWLEDGED -> IN_PROGRESS -> RESOLVED -> PENDING_VERIFICATION -> CLOSED
  |         |              |            |              |
REOPENED (if tenant not satisfied or issue recurs)

OPEN -> ON_HOLD (awaiting parts, tenant availability, etc.)
```

### 9.3 SLA Configuration

| Priority | Response Time | Resolution Time | Escalation |
|----------|--------------|-----------------|------------|
| Emergency | 15 minutes | 4 hours | Auto-escalate to Property Manager after 1 hour |
| High | 2 hours | 24 hours | Escalate after 12 hours |
| Medium | 4 hours | 72 hours | Escalate after 48 hours |
| Low | 24 hours | 7 days | Escalate after 5 days |

### 9.4 Preventive Maintenance

| Field | Type | Description |
|-------|------|-------------|
| `schedule_id` | UUID (PK) | Unique identifier |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `asset_id` | UUID (FK) | Target asset |
| `schedule_type` | Enum | Daily, Weekly, Monthly, Quarterly, Annually, Custom |
| `frequency` | Integer | Every N periods |
| `last_completed` | Date | Last service date |
| `next_due` | Date | Upcoming service |
| `checklist` | JSONB | [{task: "Clean filter", required: true}] |
| `assigned_to` | UUID (FK) | Staff responsible |
| `status` | Enum | Scheduled, In Progress, Completed, Overdue |
| `created_at` | Timestamp | Audit field |

---

## 10. MODULE 8: FACILITY BOOKING {#10-module-facility-booking}

### 10.1 Facility Master

| Field | Type | Description |
|-------|------|-------------|
| `facility_id` | UUID (PK) | Unique identifier |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `property_id` | UUID (FK) | Location |
| `facility_name` | String | e.g., "Swimming Pool", "Gym", "Meeting Room A" |
| `facility_type` | Enum | Pool, Gym, Meeting Room, Event Hall, BBQ Area, Tennis Court, Play Area, Parking |
| `capacity` | Integer | Max people |
| `description` | Text | Rules, amenities |
| `operating_hours` | JSONB | {open: "06:00", close: "22:00", days: ["Mon","Tue",...]} |
| `booking_window_days` | Integer | How far in advance (e.g., 30) |
| `max_booking_duration_hours` | Integer | Max per booking |
| `price_per_hour` | Decimal | 0 if free |
| `price_type` | Enum | Free, Per Hour, Per Session, Per Person |
| `status` | Enum | Active, Under Maintenance, Closed |
| `images` | Array[URL] | Facility photos |
| `created_at` | Timestamp | Audit field |

### 10.2 Booking Record

| Field | Type | Description |
|-------|------|-------------|
| `booking_id` | UUID (PK) | Unique identifier |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `facility_id` | UUID (FK) | Booked facility |
| `customer_id` | UUID (FK) | Who booked |
| `booking_date` | Date | Date of booking |
| `start_time` | DateTime | From |
| `end_time` | DateTime | To |
| `number_of_guests` | Integer | Attendees |
| `purpose` | Text | Reason for booking |
| `total_amount` | Decimal | Computed from duration x rate |
| `payment_status` | Enum | Not Required, Pending, Paid, Refunded |
| `status` | Enum | Confirmed, Cancelled, Completed, No-Show |
| `cancellation_reason` | Text | If cancelled |
| `created_at`, `updated_at` | Timestamp | Audit fields |

### 10.3 Booking Rules
- Cannot book if facility is under maintenance
- Cannot double-book same time slot
- Waitlist available for fully booked slots
- Cancellation policy: Full refund if > 24h notice, 50% if < 24h
- Reminder sent 2 hours before booking


---

## 11. MODULE 9: COMMUNITY & COLLABORATION {#11-module-community}

### 11.1 Community Post

| Field | Type | Description |
|-------|------|-------------|
| `post_id` | UUID (PK) | Unique identifier |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `property_id` | UUID (FK) | Scope (optional: property-wide) |
| `author_id` | UUID (FK) | Who posted |
| `author_type` | Enum | Admin, Staff, Tenant, Owner |
| `post_type` | Enum | Announcement, Discussion, Poll, Event, Emergency |
| `title` | String | Post title |
| `content` | Text | Body (rich text) |
| `attachments` | Array[URL] | Files, images |
| `is_pinned` | Boolean | Sticky post |
| `is_announcement` | Boolean | Official notice |
| `target_audience` | Enum | All, Tenants Only, Owners Only, Staff Only |
| `read_count` | Integer | Views |
| `like_count` | Integer | Reactions |
| `comment_count` | Integer | Comments |
| `status` | Enum | Active, Hidden, Archived |
| `created_at`, `updated_at` | Timestamp | Audit fields |

### 11.2 Comment

| Field | Type | Description |
|-------|------|-------------|
| `comment_id` | UUID (PK) | Unique identifier |
| `post_id` | UUID (FK) | Parent post |
| `author_id` | UUID (FK) | Commenter |
| `content` | Text | Comment text |
| `parent_comment_id` | UUID (FK) | For threaded replies |
| `is_flagged` | Boolean | Moderation flag |
| `created_at` | Timestamp | Audit field |

### 11.3 Poll

| Field | Type | Description |
|-------|------|-------------|
| `poll_id` | UUID (PK) | Unique identifier |
| `post_id` | UUID (FK) | Linked post |
| `question` | String | Poll question |
| `options` | JSONB | [{option_id: "1", text: "Option A", votes: 5}] |
| `is_multiple_choice` | Boolean | Allow multiple selections |
| `is_anonymous` | Boolean | Hide voter identity |
| `end_date` | DateTime | Poll closing |
| `total_votes` | Integer | Computed |
| `created_at` | Timestamp | Audit field |

---

## 12. MODULE 10: DOCUMENT MANAGEMENT SYSTEM (DMS) {#12-module-dms}

### 12.1 Document Record

| Field | Type | Description |
|-------|------|-------------|
| `document_id` | UUID (PK) | Unique identifier |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `entity_type` | Enum | Property, Unit, Lease, Customer, Ticket, Asset, Employee, Receipt, General |
| `entity_id` | UUID (FK) | Linked record |
| `document_name` | String | File name |
| `document_type` | Enum | PDF, Image, Video, Word, Excel, Other |
| `file_url` | String | Storage path (S3/MinIO) |
| `file_size` | Integer | Bytes |
| `mime_type` | String | MIME type |
| `category` | Enum | Contract, ID, Receipt, Inspection, Invoice, Certificate, Manual, Other |
| `uploaded_by` | UUID (FK) | Uploader |
| `is_confidential` | Boolean | Restricted access |
| `expiry_date` | Date | Document validity (for IDs, contracts) |
| `version` | Integer | Document version |
| `previous_version_id` | UUID (FK) | For version chain |
| `created_at`, `updated_at` | Timestamp | Audit fields |

### 12.2 Document Expiry Alerts
- System checks daily for documents expiring in 30, 15, 7 days
- Notifications sent to: document owner, Property Manager, Leasing Department
- Expired documents flagged in customer/lease views
- Lease renewal blocked if mandatory documents expired

---

## 13. MODULE 11: APPROVAL WORKFLOWS & RBAC {#13-module-approval-workflows}

### 13.1 Workflow Configuration

| Field | Type | Description |
|-------|------|-------------|
| `workflow_id` | UUID (PK) | Unique identifier |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `workflow_name` | String | e.g., "Rent Discount Approval" |
| `entity_type` | Enum | Lease, Invoice, Expense, Purchase Order, Payroll, User Creation, Vendor Onboarding |
| `trigger_conditions` | JSONB | {field: "discount_percentage", operator: ">", value: 10} |
| `approver_chain` | JSONB | [{step: 1, role: "Property Manager", action: "approve"}, {step: 2, role: "Admin", action: "approve"}] |
| `is_parallel` | Boolean | Multiple approvers at same step |
| `escalation_hours` | Integer | Auto-escalate if no response |
| `is_active` | Boolean | Enable/disable |
| `created_at` | Timestamp | Audit field |

### 13.2 Approval Request

| Field | Type | Description |
|-------|------|-------------|
| `approval_id` | UUID (PK) | Unique identifier |
| `tenant_id` | UUID (FK) | Tenant isolation |
| `workflow_id` | UUID (FK) | Linked workflow |
| `requester_id` | UUID (FK) | Who initiated |
| `entity_type` | Enum | What is being approved |
| `entity_id` | UUID (FK) | Specific record |
| `current_step` | Integer | Active step in chain |
| `status` | Enum | Pending, Approved, Rejected, Escalated, Cancelled |
| `approver_notes` | Text | Comments from approvers |
| `requested_at` | Timestamp | When raised |
| `completed_at` | Timestamp | When finalized |
| `created_at` | Timestamp | Audit field |

### 13.3 Approval Scenarios

| Scenario | Initiator | Approver Chain | Condition |
|----------|-----------|---------------|-----------|
| Rent Discount > 10% | Property Manager | Finance Manager -> Admin/Host | Discount percentage threshold |
| Capital Expenditure > $5,000 | Maintenance Staff | Property Manager -> Finance -> Admin | Budget category + amount |
| New Hire | HR Manager | Department Head -> Admin/Host | Headcount budget check |
| Lease Termination (penalty waiver) | Property Manager | Admin/Host | Penalty waiver flag |
| Vendor Onboarding | Any Staff | Property Manager -> Finance -> Admin | Vendor category + contract value |
| Payroll Processing | HR Manager | Finance Manager -> Admin | Monthly payroll approval |
| Security Deposit Refund | Cashier | Finance Manager -> Admin | Refund amount threshold |

---

## 14. MODULE 12: NOTIFICATIONS & COMMUNICATION {#14-module-notifications}

### 14.1 Notification Types

| Channel | Use Cases |
|---------|-----------|
| **Email** | Invoices, receipts, lease agreements, reports, newsletters |
| **SMS** | OTP, payment reminders, urgent maintenance, emergency alerts |
| **Push (Mobile)** | Ticket updates, booking confirmations, community posts |
| **In-App** | All system events, approval requests, document expiry |
| **WhatsApp** | Payment reminders, maintenance updates (optional integration) |

### 14.2 Notification Templates

| Template Name | Trigger | Recipients | Channels |
|--------------|---------|------------|----------|
| Lease Expiry Reminder | T-60, T-30, T-15, T-7 days | Tenant, Leasing, PM, Landlord | Email + SMS |
| Rent Due Reminder | T-3, T-1, Due Date, T+1, T+3 | Tenant | Email + SMS + Push |
| Ticket Status Update | Status change | Tenant (if tenant-raised) | Push + Email |
| Payment Received | Payment confirmed | Tenant | Email + Push |
| Payment Overdue | Due date + grace passed | Tenant + Finance + PM | Email + SMS |
| Document Expiry | T-30, T-15, T-7, Expired | Tenant + Leasing | Email + In-App |
| Approval Request | New approval needed | Approver | In-App + Email + Push |
| Facility Booking Confirmed | Booking created | Customer | Email + Push |
| Community Announcement | New announcement | Target audience | Push + Email |
| Key Handover Scheduled | Handover date set | Tenant + PM + Security | Email + SMS |
| Check-Out Scheduled | Move-out date set | Tenant + PM + Finance | Email + SMS |

### 14.3 Notification Preferences
- Users can configure channel preferences per notification type
- Quiet hours for non-urgent notifications
- Digest mode: daily/weekly summary instead of individual emails

---

## 15. MODULE 13: REPORTS & ANALYTICS {#15-module-reports}

### 15.1 Standard Reports

| Report | Description | Audience | Frequency |
|--------|-------------|----------|-----------|
| **Occupancy Dashboard** | Vacant vs occupied units, vacancy rate %, revenue at risk | Admin, PM | Real-time |
| **Rent Roll** | All active leases, rents, payment status, arrears | Finance, Admin | Monthly |
| **Financial Summary** | Revenue, expenses, net income by property | Finance, Admin | Monthly/Quarterly |
| **Maintenance Analytics** | Ticket volume, resolution time, SLA compliance, costs | PM, Maintenance | Monthly |
| **Tenant Satisfaction** | Ticket ratings, community engagement, complaints | PM, Admin | Quarterly |
| **Lease Pipeline** | Reservations, pending approvals, expiring leases | Leasing, PM | Weekly |
| **Cheque Status Report** | All PDCs: received, deposited, cleared, returned | Finance | Weekly |
| **Security Deposit Ledger** | All deposits held, refunds pending, adjustments | Finance | Monthly |
| **Asset Depreciation Report** | Asset values, depreciation schedules, book values | Finance, PM | Annually |
| **HR Attendance Report** | Staff attendance, leave balances, OT hours | HR, Admin | Monthly |
| **Payroll Summary** | Total payroll, deductions, bank transfers | HR, Finance | Monthly |
| **Facility Utilization** | Booking rates, peak hours, revenue from bookings | PM | Monthly |
| **Community Engagement** | Post activity, poll participation, forum usage | PM | Monthly |

### 15.2 Custom Report Builder
- Drag-and-drop field selection
- Filter configuration (date range, property, status, etc.)
- Grouping and aggregation (sum, count, average)
- Visualization: Table, Bar, Line, Pie, Map
- Export: PDF, Excel, CSV
- Scheduled delivery: Daily, Weekly, Monthly


---

## 16. TECHNOLOGY STACK {#16-tech-stack}

### 16.1 Frontend
| Component | Technology |
|-----------|-----------|
| Framework | React 18+ with TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | React Query (server) + Zustand (client) |
| Routing | React Router v6 |
| Charts | Recharts / Chart.js |
| PDF | React-PDF / jsPDF |
| Real-time | Socket.io-client |
| Forms | React Hook Form + Zod validation |
| Mobile | React Native (Phase 4) |

### 16.2 Backend
| Component | Technology |
|-----------|-----------|
| Runtime | Node.js + Express OR Python + FastAPI |
| API | REST + GraphQL (Apollo) |
| Auth | JWT (access: 15min, refresh: 7 days) + OAuth2 |
| Authorization | CASL / Oso (RBAC) |
| Background Jobs | BullMQ / Celery + Redis |
| Real-time | Socket.io |
| Logging | Winston / Pino (structured JSON) |
| API Docs | Swagger / OpenAPI 3.0 |

### 16.3 Database & Storage
| Component | Technology |
|-----------|-----------|
| Primary DB | PostgreSQL 15+ |
| Cache | Redis (sessions, cache, rate limiting) |
| File Storage | MinIO / AWS S3 |
| Search | Elasticsearch |
| Time-series | TimescaleDB (metrics, analytics) |
| Queue | RabbitMQ / Apache Kafka |

### 16.4 DevOps & Infrastructure
| Component | Technology |
|-----------|-----------|
| Containers | Docker + Kubernetes |
| Cloud | AWS / GCP / Azure |
| IaC | Terraform |
| CI/CD | GitHub Actions / GitLab CI |
| Monitoring | Prometheus + Grafana |
| Logs | ELK Stack (Elasticsearch, Logstash, Kibana) |
| Tracing | Jaeger |
| CDN | Cloudflare / AWS CloudFront |

### 16.5 Third-Party Integrations
| Service | Provider | Purpose |
|---------|----------|---------|
| Payments | Stripe / Razorpay / PayPal | Online payments |
| e-Signature | DocuSign / HelloSign | Lease signing |
| Email | SendGrid / AWS SES | Transactional emails |
| SMS | Twilio / MessageBird | OTP, alerts |
| Maps | Google Maps API | Property location |
| Accounting | QuickBooks / Xero | Financial sync |
| Chat | Slack / Teams | Internal notifications |
| Video | Zoom / Google Meet | Virtual inspections |

---

## 17. DATA MODEL & ENTITY RELATIONSHIPS {#17-data-model}

### 17.1 Core Entity Relationship Diagram

```
+-----------------+     +-----------------+     +-----------------+
|   super_admins  |     |    tenants      |     |  subscription   |
|-----------------|     |-----------------|     |   _plans        |
| id (PK)         |<----| id (PK)         |---->| id (PK)         |
| email           |     | name            |     | name            |
| password_hash   |     | slug            |     | price_monthly   |
| full_name       |     | domain          |     | price_yearly    |
| role            |     | status          |     | features[]      |
| created_at      |     | plan_id (FK)    |     | max_properties  |
+-----------------+     | created_at      |     | max_users       |
                        +-----------------+     +-----------------+
                                |
                                | 1:N
                                v
+-----------------------------------------------------------------------------+
|                              TENANT-SCOPED ENTITIES                         |
+-----------------------------------------------------------------------------+

+-----------------+     +-----------------+     +-----------------+
|     users       |     |   properties    |     |     units       |
|-----------------|     |-----------------|     |-----------------|
| id (PK)         |     | id (PK)         |     | id (PK)         |
| tenant_id (FK)  |<----| tenant_id (FK)  |<----| tenant_id (FK)  |
| email           |     | name            |     | property_id(FK) |
| password_hash   |     | type            |     | unit_number     |
| full_name       |     | address         |     | unit_type       |
| role_id (FK)    |     | city            |     | floor           |
| phone           |     | country         |     | size_sqft       |
| status          |     | amenities[]     |     | status          |
| created_at      |     | status          |     | rent_price      |
+-----------------+     | landlord_name   |     | current_lease_id|
        |               | created_at      |     | created_at      |
        |               +-----------------+     +-----------------+
        |                       |                       |
        |                       |                       |
        v                       v                       v
+-----------------+     +-----------------+     +-----------------+
|  roles (RBAC)   |     |  reservations   |     |    leases       |
|-----------------|     |-----------------|     |-----------------|
| id (PK)         |     | id (PK)         |     | id (PK)         |
| tenant_id (FK)  |     | tenant_id (FK)  |     | tenant_id (FK)  |
| name            |     | unit_id (FK)    |     | unit_id (FK)    |
| permissions[]   |     | prospect_name   |     | customer_id(FK) |
| is_default      |     | prospect_contact|     | lease_number    |
| created_at      |     | agent_id (FK)   |     | lease_status    |
+-----------------+     | validity_period |     | start_date      |
                        | status          |     | end_date        |
+-----------------+     | created_at      |     | rent_amount     |
|  customers      |     +-----------------+     | deposit_amount  |
|-----------------|             |               | payment_freq    |
| id (PK)         |             |               | pdc_details[]   |
| tenant_id (FK)  |             |               | signed_docs[]   |
| customer_type   |             |               | check_in/out_id |
| full_name       |             |               | previous_lease  |
| qatar_id        |             |               | created_at      |
| passport_number |             |               +-----------------+
| mobile_number   |             |                       |
| email_address   |             |                       |
| nationality     |             |                       |
| employer_name   |             |                       |
| verification    |             |                       |
| status          |             |                       |
| documents[]     |             |                       |
| created_at      |             |                       |
+-----------------+             |                       |
        |                       |                       |
        +-----------------------+-----------------------+
                                |
                                v
+-----------------------------------------------------------------------------+
|                           FINANCIAL ENTITIES                                |
+-----------------------------------------------------------------------------+

+-----------------+     +-----------------+     +-----------------+
|    invoices     |     |    payments     |     |    cheques      |
|-----------------|     |-----------------|     |-----------------|
| id (PK)         |     | id (PK)         |     | id (PK)         |
| tenant_id (FK)  |     | tenant_id (FK)  |     | tenant_id (FK)  |
| lease_id (FK)   |     | invoice_id (FK) |     | lease_id (FK)   |
| invoice_number  |     | amount          |     | cheque_number   |
| invoice_type    |     | method          |     | bank_name       |
| period_start    |     | status          |     | cheque_date     |
| period_end      |     | reference       |     | cheque_amount   |
| due_date        |     | gateway_response|     | status          |
| amount          |     | paid_at         |     | deposit_date    |
| status          |     | created_at      |     | clearance_date  |
| created_at      |     +-----------------+     | return_reason   |
+-----------------+                             | created_at      |
                                              +-----------------+
+-----------------+     +-----------------+     +-----------------+
|   receipts      |     |  transactions   |     |  chart_of_acct  |
|-----------------|     |-----------------|     |-----------------|
| id (PK)         |     | id (PK)         |     | id (PK)         |
| tenant_id (FK)  |     | tenant_id (FK)  |     | tenant_id (FK)  |
| receipt_number  |     | type            |     | account_code    |
| receipt_date    |     | amount          |     | account_name    |
| tenant_name     |     | category        |     | account_type    |
| lease_ref       |     | description     |     | parent_id       |
| payment_type    |     | date            |     | is_active       |
| amount          |     | related_id      |     | created_at      |
| cashier_id (FK) |     | created_at      |     +-----------------+
| created_at      |     +-----------------+
+-----------------+

+-----------------------------------------------------------------------------+
|                         OPERATIONAL ENTITIES                                |
+-----------------------------------------------------------------------------+

+-----------------+     +-----------------+     +-----------------+
|  maintenance_   |     |  facility_      |     |  fixed_assets   |
|    tickets      |     |   bookings      |     |                 |
|-----------------|     |-----------------|     |-----------------|
| id (PK)         |     | id (PK)         |     | id (PK)         |
| tenant_id (FK)  |     | tenant_id (FK)  |     | tenant_id (FK)  |
| unit_id (FK)    |     | facility_id(FK) |     | property_id(FK) |
| category        |     | customer_id(FK) |     | name            |
| priority        |     | booking_date    |     | category        |
| description     |     | start_time      |     | asset_tag       |
| photos[]        |     | end_time          |     | purchase_cost   |
| assigned_to(FK) |     | status          |     | book_value      |
| status          |     | payment_status  |     | condition       |
| sla_target      |     | created_at      |     | status          |
| actual_cost     |     +-----------------+     | created_at      |
| tenant_rating   |                             +-----------------+
| created_at      |
+-----------------+

+-----------------+     +-----------------+     +-----------------+
|  community_     |     |   documents     |     |  approval_      |
|    posts        |     |                 |     |   workflows     |
|-----------------|     |-----------------|     |-----------------|
| id (PK)         |     | id (PK)         |     | id (PK)         |
| tenant_id (FK)  |     | tenant_id (FK)  |     | tenant_id (FK)  |
| author_id (FK)  |     | entity_type     |     | name            |
| type            |     | entity_id       |     | entity_type     |
| title           |     | file_url        |     | conditions      |
| content         |     | category        |     | approver_chain  |
| is_pinned       |     | uploaded_by(FK) |     | is_active       |
| status          |     | expiry_date     |     | created_at      |
| created_at      |     | created_at      |     +-----------------+
+-----------------+     +-----------------+

+-----------------+     +-----------------+     +-----------------+
|    hrms_        |     |   hrms_         |     |   hrms_         |
|   employees     |     |  attendance     |     |   payroll       |
|-----------------|     |-----------------|     |-----------------|
| id (PK)         |     | id (PK)         |     | id (PK)         |
| tenant_id (FK)  |     | employee_id(FK) |     | employee_id(FK) |
| user_id (FK)    |     | date            |     | month           |
| department      |     | check_in        |     | basic_salary    |
| designation     |     | check_out       |     | gross_salary    |
| salary          |     | status          |     | net_pay         |
| joining_date    |     | created_at      |     | status          |
| status          |     +-----------------+     | created_at      |
| created_at      |                             +-----------------+
+-----------------+

+-----------------+     +-----------------+
|   audit_logs    |     |  notifications  |
|-----------------|     |-----------------|
| id (PK)         |     | id (PK)         |
| tenant_id (FK)  |     | tenant_id (FK)  |
| user_id (FK)    |     | recipient_id    |
| action          |     | type            |
| entity_type     |     | title           |
| entity_id       |     | message         |
| old_values      |     | channel         |
| new_values      |     | is_read         |
| ip_address      |     | created_at      |
| user_agent      |     +-----------------+
| created_at      |
+-----------------+
```

### 17.2 Multi-Tenancy Strategy
| Aspect | Implementation |
|--------|---------------|
| **Architecture** | Shared Database, Shared Schema |
| **Isolation** | `tenant_id` column on every tenant-scoped table |
| **Query Filtering** | Middleware auto-injects `tenant_id = ?` on all queries |
| **RLS** | PostgreSQL Row-Level Security policies as secondary defense |
| **Tenant Context** | Set from JWT claim (`x-tenant-id` header or subdomain) |
| **Data Export** | Per-tenant filtered export for GDPR compliance |
| **Cross-Tenant Access** | Super Admin uses `SET ROLE` or bypass with audit logging |

### 17.3 Indexing Strategy
| Index | Tables | Purpose |
|-------|--------|---------|
| `(tenant_id, status)` | units, leases, tickets, invoices | Fast filtered lists |
| `(tenant_id, created_at DESC)` | Most entities | Recent records |
| `(lease_id, due_date)` | invoices | Payment schedule lookups |
| `(customer_id)` | leases, invoices, tickets | Customer history |
| `(unit_id, status)` | leases, tickets | Unit-specific queries |
| `(expiry_date)` | leases, documents | Expiry alerts |
| `GIN (amenities)` | properties | Amenity filtering |
| `GIN (permissions)` | roles | Permission checks |

---

## 18. SECURITY & COMPLIANCE {#18-security}

### 18.1 Authentication
| Control | Implementation |
|---------|---------------|
| Password Policy | Min 12 chars, uppercase, lowercase, number, special char |
| Hashing | bcrypt with cost factor 12 |
| MFA | TOTP (Google Authenticator) + SMS fallback |
| Session | JWT access token (15 min) + refresh token (7 days, rotation) |
| SSO | SAML 2.0, OIDC (Google, Microsoft, Okta) |
| Lockout | 5 failed attempts = 15 min lockout, alert admin |
| Device Tracking | New device = email verification required |

### 18.2 Authorization
| Control | Implementation |
|---------|---------------|
| RBAC | Role-Permission matrix per tenant |
| Resource-Level | Users can only access their tenant's data |
| Field-Level | Sensitive fields masked based on role (e.g., salary for non-HR) |
| API-Level | Every endpoint checks permission before execution |
| Approval Gates | Sensitive operations require workflow approval |

### 18.3 Data Protection
| Control | Implementation |
|---------|---------------|
| Encryption at Rest | AES-256 (DB + file storage) |
| Encryption in Transit | TLS 1.3 minimum |
| PII Masking | Credit cards, IDs masked in logs |
| Data Retention | Configurable per jurisdiction |
| Backup | Encrypted daily backups, 30-day retention |
| GDPR | Right to access, rectification, erasure, portability |
| Data Residency | EU, US, APAC region options |

### 18.4 Compliance Standards
| Standard | Scope | Status |
|----------|-------|--------|
| SOC 2 Type II | Security, Availability, Confidentiality | Target: Year 2 |
| ISO 27001 | Information Security Management | Target: Year 2 |
| GDPR | EU Data Protection | Required from launch |
| PCI DSS | Payment Card Security | Via gateway (Stripe) |
| Local Regulations | Qatar: NCSA Cybersecurity Guidelines | Required for Qatar market |

---

## 19. API DESIGN {#19-api-design}

### 19.1 API Standards
| Standard | Value |
|----------|-------|
| Base URL | `https://api.pms-platform.com/v1` |
| Content-Type | `application/json` |
| Versioning | URL path (`/v1/`, `/v2/`) |
| Authentication | `Authorization: Bearer <jwt_token>` |
| Tenant Header | `X-Tenant-ID: <tenant_uuid>` |
| Pagination | Cursor-based (`?cursor=xyz&limit=20`) |
| Rate Limit | 100 req/min per user, 1000 req/min per tenant |
| Idempotency | `Idempotency-Key: <uuid>` for POST/PUT |
| Webhook Signature | HMAC-SHA256 verification |

### 19.2 Core Endpoints

#### Authentication
```
POST /auth/login          -> {access_token, refresh_token, user}
POST /auth/refresh        -> {access_token, refresh_token}
POST /auth/logout         -> 204 No Content
POST /auth/mfa/enable     -> {qr_code_url, backup_codes}
POST /auth/mfa/verify     -> {success: true}
```

#### Properties & Units
```
GET    /properties                    -> List (tenant-scoped)
POST   /properties                    -> Create
GET    /properties/:id                -> Details
PUT    /properties/:id                -> Update
DELETE /properties/:id                -> Archive (soft delete)
GET    /properties/:id/units          -> List units
POST   /units                         -> Create unit
GET    /units/:id                     -> Details
PUT    /units/:id                     -> Update
PUT    /units/:id/status              -> Update status
POST   /units/:id/reserve             -> Create reservation
GET    /units/:id/reservations        -> Reservation history
```

#### Customers
```
GET    /customers                     -> List with search
POST   /customers                     -> Create (duplicate check)
GET    /customers/:id                 -> Details
PUT    /customers/:id                 -> Update
GET    /customers/:id/documents       -> List documents
POST   /customers/:id/documents       -> Upload document
PUT    /customers/:id/verify          -> Verify documents
GET    /customers/:id/leases          -> Lease history
```

#### Leases
```
GET    /leases                        -> List with filters
POST   /leases                        -> Create (triggers approval if needed)
GET    /leases/:id                    -> Full details
PUT    /leases/:id                    -> Update draft
POST   /leases/:id/sign-tenant        -> Upload tenant signature
POST   /leases/:id/sign-landlord      -> Upload landlord signature
POST   /leases/:id/key-handover       -> Record key handover
POST   /leases/:id/check-in           -> Submit check-in report
POST   /leases/:id/renew              -> Initiate renewal
POST   /leases/:id/terminate          -> Initiate termination
POST   /leases/:id/check-out          -> Submit check-out report
GET    /leases/:id/payment-schedule   -> Generated schedule
GET    /leases/:id/documents          -> All linked documents
GET    /leases/:id/history            -> Status change audit trail
```

#### Finance
```
GET    /invoices                      -> List with filters
POST   /invoices                      -> Generate invoice
GET    /invoices/:id                  -> Details
PUT    /invoices/:id                  -> Update
POST   /invoices/:id/send             -> Email to tenant
POST   /payments                      -> Record payment
GET    /payments                      -> List
GET    /payments/:id                  -> Details
POST   /cheques                       -> Record cheque
GET    /cheques                       -> List
PUT    /cheques/:id/status            -> Update status (deposited, cleared, returned)
POST   /receipts                      -> Generate receipt
GET    /receipts                      -> List
GET    /receipts/:id                  -> Details (with print/email)
GET    /reports/rent-roll             -> Rent roll report
GET    /reports/arrears               -> Arrears report
GET    /reports/financial-summary     -> P&L summary
```

#### Maintenance
```
GET    /maintenance-tickets           -> List with filters
POST   /maintenance-tickets           -> Raise ticket
GET    /maintenance-tickets/:id       -> Details
PUT    /maintenance-tickets/:id       -> Update
PUT    /maintenance-tickets/:id/assign -> Assign to staff/vendor
PUT    /maintenance-tickets/:id/status -> Update status
POST   /maintenance-tickets/:id/resolve -> Mark resolved
POST   /maintenance-tickets/:id/verify -> Tenant verification
GET    /maintenance-tickets/:id/photos -> List evidence photos
GET    /preventive-schedules          -> List schedules
POST   /preventive-schedules          -> Create schedule
PUT    /preventive-schedules/:id      -> Update
```

#### Facility Booking
```
GET    /facilities                    -> List available
GET    /facilities/:id                -> Details + calendar
GET    /facilities/:id/availability   -> Check slots
POST   /facility-bookings             -> Create booking
GET    /facility-bookings             -> My bookings
PUT    /facility-bookings/:id         -> Modify
DELETE /facility-bookings/:id         -> Cancel
```

#### Community
```
GET    /community/posts               -> List (with filters)
POST   /community/posts               -> Create post
GET    /community/posts/:id           -> Details with comments
PUT    /community/posts/:id           -> Update
DELETE /community/posts/:id           -> Archive
POST   /community/posts/:id/comments  -> Add comment
POST   /community/posts/:id/like      -> React
POST   /community/posts/:id/poll/vote -> Vote in poll
```

#### HRMS
```
GET    /hrms/employees                -> List
POST   /hrms/employees                -> Add employee
GET    /hrms/employees/:id            -> Details
PUT    /hrms/employees/:id            -> Update
GET    /hrms/attendance               -> List records
POST   /hrms/attendance/check-in      -> Clock in
POST   /hrms/attendance/check-out     -> Clock out
GET    /hrms/leave-balances           -> Balances
POST   /hrms/leave-requests           -> Request leave
PUT    /hrms/leave-requests/:id       -> Approve/reject
GET    /hrms/payroll                  -> List payrolls
POST   /hrms/payroll/generate         -> Generate draft
PUT    /hrms/payroll/:id/approve      -> Approve payroll
PUT    /hrms/payroll/:id/process      -> Process payment
```

#### Approval Workflows
```
GET    /approval-workflows            -> List configurations
POST   /approval-workflows            -> Create workflow
PUT    /approval-workflows/:id        -> Update
GET    /approvals/pending             -> My pending approvals
GET    /approvals/:id                 -> Details
POST   /approvals/:id/approve         -> Approve
POST   /approvals/:id/reject          -> Reject
POST   /approvals/:id/escalate        -> Manual escalation
```

#### Admin
```
GET    /users                         -> List (tenant-scoped)
POST   /users                         -> Create user
GET    /users/:id                     -> Details
PUT    /users/:id                     -> Update
PUT    /users/:id/role                -> Assign role
DELETE /users/:id                     -> Deactivate
GET    /roles                         -> List roles
POST   /roles                         -> Create role
PUT    /roles/:id                     -> Update permissions
GET    /audit-logs                    -> View audit trail
GET    /reports/occupancy             -> Occupancy dashboard
GET    /reports/custom                -> Custom report builder
POST   /documents                     -> Upload document
GET    /documents/:id                 -> Download
GET    /notifications                 -> My notifications
PUT    /notifications/:id/read        -> Mark read
PUT    /notifications/read-all        -> Mark all read
```

### 19.3 Response Format
```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "cursor": "eyJpZCI6MTAwfQ==",
    "limit": 20,
    "total": 150,
    "has_next": true
  },
  "message": "Operation completed successfully"
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" },
      { "field": "rent_amount", "message": "Must be greater than 0" }
    ],
    "trace_id": "abc-123-xyz"
  }
}
```

---

## 20. DEVELOPMENT ROADMAP {#20-roadmap}

### Phase 1: MVP -- Foundation (Months 1-3)
| Sprint | Deliverables |
|--------|-------------|
| Week 1-2 | Project setup, DB schema, auth system, tenant isolation |
| Week 3-4 | Property & Unit CRUD, unit reservation system |
| Week 5-6 | Customer Master, document upload, duplicate prevention |
| Week 7-8 | Lease creation, payment schedule generation, e-signature integration |
| Week 9-10 | Finance Module: invoices, payments, receipts, cheque tracking |
| Week 11-12 | Key handover, check-in process, basic notifications |

**MVP Exit Criteria:**
- Complete lease creation flow (reservation -> check-in)
- Payment collection and receipt generation
- Basic RBAC (Admin, Property Manager, Cashier, Tenant)
- Document management
- Email notifications

### Phase 2: Enhancement -- Growth (Months 4-6)
| Sprint | Deliverables |
|--------|-------------|
| Week 13-14 | Maintenance ticketing system, SLA tracking, vendor management |
| Week 15-16 | HRMS: employee profiles, attendance, leave management |
| Week 17-18 | Payroll processing, payslip generation, bank integration |
| Week 19-20 | Fixed Assets: registry, depreciation, procurement workflow |
| Week 21-22 | Approval Workflow Builder, multi-level approvals, escalation |
| Week 23-24 | Advanced reporting, custom report builder, data export |

### Phase 3: Tenant Experience -- Engagement (Months 7-9)
| Sprint | Deliverables |
|--------|-------------|
| Week 25-26 | Tenant portal: self-service dashboard, document access, payment history |
| Week 27-28 | Community module: forums, announcements, polls, private messaging |
| Week 29-30 | Facility booking: amenity catalog, real-time calendar, online payment |
| Week 31-32 | Mobile-responsive tenant portal, push notifications |
| Week 33-34 | Lease renewal automation, auto-notifications, renewal workflow |
| Week 35-36 | Check-out process automation, settlement calculation, deposit refund |

### Phase 4: Scale & Intelligence (Months 10-12)
| Sprint | Deliverables |
|--------|-------------|
| Week 37-38 | AI features: smart rent pricing, predictive maintenance, chatbot |
| Week 39-40 | Third-party integrations: QuickBooks, Slack, Google Calendar |
| Week 41-42 | Mobile apps: iOS and Android native apps |
| Week 43-44 | Multi-language, multi-currency, regional compliance |
| Week 45-46 | Advanced analytics: predictive occupancy, revenue forecasting |
| Week 47-48 | Performance optimization, load testing, security hardening, SOC 2 prep |

---

## 21. GLOSSARY {#21-glossary}

| Term | Definition |
|------|-----------|
| **Admin/Host** | The property owner or management company operating within a tenant boundary |
| **Approval Workflow** | Configurable multi-step process for reviewing and approving sensitive operations |
| **Cashier** | Staff responsible for receiving payments, generating receipts, and updating cheque status |
| **Check-In Report** | Documented inspection of unit condition at tenant move-in, with photos and meter readings |
| **Check-Out Report** | Final inspection comparing unit condition against Check-In Report, determining damages and charges |
| **Commercial Registration (CR)** | Business registration document required for company tenants |
| **Customer Master** | Central repository of all tenant and owner profiles with documents and verification status |
| **Facility Booking** | Reservation system for shared amenities like gym, pool, meeting rooms |
| **Fixed Asset** | Long-term tangible property asset (HVAC, elevator, furniture) tracked for maintenance and depreciation |
| **HRMS** | Human Resource Management System for staff records, attendance, leave, and payroll |
| **Key Handover Form** | Document recording keys, access cards, and remotes issued to tenant with mutual acknowledgment |
| **Landlord** | The property owner who signs lease agreements and receives rent |
| **Leasing Department** | Team responsible for reservations, document verification, lease creation, and renewals |
| **Maintenance Ticket** | Formal request for repair work, tracked from creation through resolution |
| **Marketing Agent** | Staff who prospects clients, shows units, and creates reservations |
| **Multi-Tenancy** | Architecture where multiple organizations share infrastructure but data is isolated |
| **PDC (Post-Dated Cheque)** | Cheque issued with a future date for scheduled rent payments |
| **Property Manager** | Staff overseeing day-to-day property operations, maintenance, and tenant relations |
| **Qatar ID** | National identification card required for individual tenants in Qatar |
| **RBAC** | Role-Based Access Control -- permissions assigned to roles, not individual users |
| **Receipt** | Official document confirming payment received, with unique number and details |
| **Rent Roll** | Financial report listing all leases, rents, and payment statuses for a period |
| **Reservation** | Temporary hold on a unit for a prospective tenant during the decision period |
| **Security Deposit** | Upfront payment held as collateral against damages, refunded at check-out (less deductions) |
| **SLA** | Service Level Agreement -- defined response and resolution times for maintenance tickets |
| **Super Admin** | Platform-level administrator managing tenants, billing, and global configurations |
| **Tenant (Customer)** | The resident or leaseholder occupying a unit |
| **Tenant (SaaS)** | An isolated organization instance within the multi-tenant platform |
| **Unit** | An individual rentable space within a property |

---

## APPENDIX A: COMPLETE WORKFLOW MATRIX {#appendix-a}

| Stage | Module | Responsible | Input | System Action | Output | Approval | System Status |
|-------|--------|-------------|-------|---------------|--------|----------|---------------|
| 1. Unit Reservation | Lease | Marketing Agent | Prospect inquiry | Block unit, set timer | Reservation record | Auto | Unit: Reserved |
| 2. Customer Creation | Customer Master | Leasing Dept | Prospect details | Duplicate check, create profile | Customer record | Leasing Dept | Verification: Pending |
| 3. Document Verification | DMS + Customer | Leasing Dept | Uploaded docs | Verify, log status | Verification status | Leasing Head (override) | Verified/Rejected |
| 4. Lease Creation | Lease | Leasing Dept | Verified customer + terms | Generate agreement + schedule | Draft lease | PM/Admin (if discount) | Draft |
| 5. Tenant Signature | Lease + DMS | Tenant | Draft agreement | Record signature, update status | Signed doc | Tenant | Tenant Signed |
| 6. Payment Collection | Finance | Cashier | Approved lease | Record payments, cheques | Payment records | Cashier + Finance (large) | Payment Pending -> Collected |
| 7. Receipt Generation | Finance | Cashier | Confirmed payment | Auto-generate receipt | Receipt | Auto | Receipt Issued |
| 8. Landlord Signature | Lease + DMS | Leasing Dept | Signed agreement + receipts | Package, submit, record | Fully signed lease | Landlord | Landlord Signed |
| 9. Key Issue Notification | Notifications | System (Auto) | Fully signed lease | Generate, send to stakeholders | Notification | Auto | Key Handover Pending |
| 10. Key Handover | Lease | Property Manager | Tenant arrival | Record keys issued | Handover form | Mutual acknowledgment | Key Handed Over |
| 11. Check-In | Lease + Maintenance | Property Manager + Tenant | Key handover complete | Inspection, photos, meter readings | Check-In Report | Tenant | Check-In Completed, Unit: Occupied |
| 12. Renewal Notification | Notifications | System (Auto) | T-60 days to expiry | Generate, send to all | Renewal notice | Auto | Renewal Notice Sent |
| 13. Lease Renewal | Lease + Finance | Leasing Dept | Tenant confirmation | Create renewal, link to previous | Renewed lease | PM/Admin (if rent change) | Active (renewed) |
| 14. Non-Renewal | Lease + Finance | Leasing Dept | Tenant notice | Schedule check-out, notify departments | Check-out schedule | Property Manager | Check-Out Scheduled |
| 15. Check-Out | Lease + Maintenance | Property Manager + Tenant | Move-out date | Inspection, compare with check-in | Check-Out Report | Tenant | Check-Out Completed |
| 16. Settlement | Finance | Finance Dept | Check-out report | Calculate deductions, process refund | Settlement statement | Finance + Admin | Settlement Completed, Lease: Closed |

---

## APPENDIX B: DOCUMENT TYPES & RETENTION {#appendix-b}

| Document Type | Generated By | Retention Period | Storage |
|--------------|-------------|------------------|---------|
| Lease Agreement | Lease Module | 7 years after closure | S3/MinIO + DB reference |
| Reservation Form | Lease Module | 2 years | S3/MinIO + DB reference |
| Customer ID Documents | Customer Master | Duration of relationship + 2 years | S3/MinIO (encrypted) |
| Payment Receipt | Finance | 7 years | S3/MinIO + DB reference |
| Cheque Images | Finance | 7 years | S3/MinIO (encrypted) |
| Check-In/Out Report | Lease Module | 7 years after closure | S3/MinIO + DB reference |
| Key Handover Form | Lease Module | 7 years after closure | S3/MinIO + DB reference |
| Maintenance Ticket Photos | Maintenance | 3 years | S3/MinIO |
| Employee Contracts | HRMS | 7 years after termination | S3/MinIO (encrypted) |
| Payslips | HRMS | 7 years | S3/MinIO |
| Audit Logs | System | 10 years | Immutable storage (WORM) |
| Approval Records | Workflow | 7 years | DB + backup |

---

*Document Version: 2.0*
*Last Updated: 2026-07-21*
*Classification: Internal -- Property Management System Specification*
