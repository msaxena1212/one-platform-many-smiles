# MASTER BUILD PROMPT — Kinan Unified Real Estate Platform (Web MVP)

> Paste this entire document into your builder AI (Lovable, Cursor, Claude Code, etc.). Replace `{{PLACEHOLDERS}}` with brand values before running. Companion: `ARCHITECTURE.md`.

---

## 0. Role & Mission
You are a **senior full-stack architect + product engineer**. Design and implement a production-grade **web MVP** of a unified Real Estate platform for **Kinan International Real Estate Development Co.** combining:

1. A **customer-facing application** — Customer Services, Marketing & Sales, Community.
2. A **Real-Estate ERP backbone** — Properties, Units, Leases, PDC, Finance, Fixed Assets, Maintenance.
3. An **internal admin console** for staff, management and approvals.

Native iOS / Android are **out of scope** for this MVP. Build **web first** on a Flutter-portable architecture.

### Success criteria (non-negotiables)
- Every screen in §4 is reachable and functional with the seed data in §18.
- Every entity in §5 exists with migrations + FK integrity.
- Every state machine in §6 is enforced **server-side**, not in the UI.
- Bilingual **Arabic (RTL) + English (LTR)** from day one.
- RBAC enforced by row-level policies, not just UI guards.
- Finance postings (§9) are automatic and **balanced** (Σ debits = Σ credits).
- KSA data residency, AES-256 at rest, TLS 1.2+, MFA for admin, audit log on every write.

### How to work
1. Produce `ARCHITECTURE.md` + ERD diagram first.
2. Scaffold Sprint 0 (auth, RBAC, i18n, layout, CI).
3. Build modules in the order of §16.
4. After each phase: tests green, seed updated, demo script, **stop for review**.

---

## 1. Product Vision
> One platform where Kinan customers buy, move-in, live, request services and pay; and Kinan staff manage every property, unit, lease, riyal of cash and maintenance ticket — with one source of truth and one audit trail.

### Personas
| Persona | Count | Surface | Primary jobs |
|---|---|---|---|
| Kinan Customer (owner / tenant) | ~943 | Customer Portal | Tickets, payments, facility booking, docs, surveys |
| Prospective Buyer | unbounded | Public + Portal | Browse, book visit, reserve, sign, pay |
| Internal Staff | ~20 (scalable) | Admin | ERP, CRM, approvals |
| Real Estate Officer | small | Admin | Lease lifecycle, unit status, tenant coordination |
| Finance Officer | small | Admin | Receipts, PDC, deposits, ledger, reports |
| Maintenance Coordinator + Technicians + Vendors | medium | Admin (limited) | Ticket execution, materials, closure |
| Management | small | Admin | Dashboards, approvals, profitability |
| Owner (3rd-party) | small | Owner Portal (lite) | Statements, distributions |
| Sales Agent | small | Admin (Sales) | Reservations, contracts, ownership transfer |
| System Admin | 1–2 | Admin | Users, roles, masters, config |

---

## 2. Scope of the MVP (web)
- **Customer Portal** (responsive web) — mirrors the future mobile app feature-for-feature.
- **Admin Console** (web) — ERP + module management + dashboards.
- **Owner Portal** (lite, web) — statements & approvals only.
- **Public marketing pages** — listings & project pages, SEO-ready, SSR.
- **Integration layer** — REST + webhooks; **mock adapters** with the real interface for Oracle Fusion / Yardi / Dynamics 365 / Power BI / SADAD / Mada / Apple Pay / STC Pay / FCM / APNs / WhatsApp Business / e-signature.

**Out of scope:** native iOS/Android binaries, PCI-DSS certification ceremony (use tokenized gateway), real e-sign certifying authority (mock with cryptographic hash + audit trail).

---

## 3. Brand & UX Tokens (fill in)
```
PRIMARY      = {{#XXXXXX}}        // Kinan primary
SECONDARY    = {{#XXXXXX}}
ACCENT       = {{#XXXXXX}}
SUCCESS / WARN / DANGER / INFO = standard semantic
FONT_AR      = {{IBM Plex Arabic / Tajawal / Noto Sans Arabic}}
FONT_EN      = {{Inter / Manrope / Plus Jakarta Sans}}
RADIUS       = 12px, 16px
SHADOW       = subtle, no neon
LOGO_LIGHT   = {{path}}
LOGO_DARK    = {{path}}
```
Tone: **premium, calm, trustworthy**. Avoid generic AI gradients (purple→indigo on white) and default Inter-only pairings. Provide both light and dark themes. **RTL is a first-class layout**, not a flipped LTR.

---

## 4. Module Catalogue

For each module produce: screens · primary actions · role access · KPIs · acceptance criteria.

### 4.1 Customer Services (after-sales)
**Screens:** Dashboard · Tickets (list/detail/new) · Warranty · Documents (Layout, Floor Plan, Building Permit) · Loyalty (coupons) · Surveys · Complaints · Notifications · Feedback/Reviews · My Profile.
**Actions:** Create ticket with photos/attachments, track L1–L4 status, redeem coupon, submit survey, file complaint, mark notification read.
**Access:** Customer (own), Maintenance (assigned), Officer (all), Mgmt (read+escalate).
**KPIs:** First-response time, CSAT, ticket backlog, repeat-issue rate.
**Acceptance:** A customer submits a ticket with 5 photos, sees the technician's note 24h later, and rates it.

### 4.2 Marketing & Sales
**Screens:** Public listings (Land/Villa/Apartment) · Project detail (gallery, video, plans, map) · Appointment scheduler (sales-center, show-unit, construction, ownership transfer, sales-call) · Reservation wizard · ID upload (KYC) · Down-payment + receipt upload · E-sign reservation form · Balance tracker with reminders · Auto contract issuance on full payment · Banner & promo manager (admin).
**Acceptance:** End-to-end purchase: browse → reserve → 10% down → e-sign → automated reminders → full payment → contract PDF → ownership-transfer appointment booked.

### 4.3 Community (separable)
**Screens:** Facility booking (gym, hall, cinema, nursery, amenities) · Common-area tickets · Gate / parking access · Visitor passes · EV-charging slots · Camera embed (placeholder) · Construction live feed · Interactive map · Bicycle / pedestrian routes · Events & updates · Paid services + payments · Reviews / suggestions · Third-party maintenance requests.
**Architectural rule:** Community tables live in a dedicated PostgreSQL schema `community.*` with a dedicated NestJS module. Cross-module access goes through **events only**. The entire module must be extractable into a standalone app via DNS + branding swap without data migration. Document the extraction procedure.
**Acceptance:** Drop the `community.*` schema into a fresh DB, boot only the Community service — it works standalone.

### 4.4 ERP — Real Estate Operations
**Screens:** Owner master · Property master (Kahramaa/municipality) · Unit master (category, furnish, rooms, base rent, declared rent, status, photos) · Tenant/Customer master (KYC, contacts, ledger) · Lease (terms, PDC schedule, deposit, documents) · Lead pipeline (Inquiry → Unit Match → Quotation → Approval → Lease → Move-in) · Renewal · Move-in / Move-out checklist · Asset handover.
**Acceptance:** Activating a lease auto-creates rent schedule, deposit liability, PDC register and tenant receivable (§9).

### 4.5 ERP — Finance
**Screens:** Chart of Accounts · GL Journal · Tenant Receivables · Receipts (cash/bank/cheque/card/SADAD/Mada/Apple Pay/STC Pay) · Bank reconciliation · PDC register & maturity · Security-deposit ledger · Owner-payable / distribution · Rent invoices · Aging reports · Property P&L · Owner statement.
**Rules:** Every operational event posts via a versioned **Posting Rule** (§9). Period-close locks postings. Multi-currency, SAR base.
**Acceptance:** A lease + 12 receipts + 1 maintenance bill produce a balanced trial balance and a Property P&L that reconciles.

### 4.6 ERP — Fixed Assets
**Screens:** Asset master (per Unit) · Categories · Handover list (photos, condition, serial) · Movement · Depreciation run · Disposal · Asset register report.
**Acceptance:** Posting depreciation creates the right JE per cost center.

### 4.7 ERP — Maintenance
**Screens:** Tickets (queue, kanban, calendar) · Assignment (in-house or vendor) · Visit schedule · Material issue · Vendor invoice capture · Cost capture (labour / parts / consumables) · Escalation queue · QC + tenant confirmation · Closure · SLA report.
**Acceptance:** A high-priority ticket auto-escalates on SLA breach; vendor cost above limit needs Mgmt approval; closure requires tenant e-confirmation.

### 4.8 Admin / Platform
Users · Roles · Permissions · Approval matrices · Workflow designer (lite) · Masters (countries, banks, payment modes, ticket categories, facility types) · Audit log · Notification templates (EN+AR) · Integration registry · Feature flags · System health.

---

## 5. Data Model (author migrations for ALL of these)

PostgreSQL · snake_case · UUID v7 PKs · `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at` on every table · soft-delete by default · money = `numeric(18,4)` + ISO currency code · FK `ON DELETE RESTRICT` unless noted · index every FK and every status column.

**Core / RBAC**
- `users` (id, email, phone, locale, mfa_enabled, password_hash, last_login_at, status)
- `roles` (id, code unique, name_en, name_ar)
- `permissions` (id, code unique, description)
- `role_permissions` (role_id, permission_id) — composite PK
- `user_roles` (user_id, role_id, scope_owner_id NULL, scope_property_id NULL) — composite PK
- `audit_log` (id, actor_user_id, entity, entity_id, action, before jsonb, after jsonb, ip, ua, created_at)
- `approval_matrices` (id, code, entity, criteria jsonb)
- `approval_requests` (id, matrix_id, entity, entity_id, requested_by, status, current_step)
- `approval_steps` (id, request_id, sequence, approver_role_id, approver_user_id NULL, status, acted_at, comment)

**Real Estate masters**
- `owners` (id, legal_name, type, revenue_share_pct, contact jsonb, status)
- `properties` (id, owner_id FK, code unique, name_en, name_ar, type enum[villa,compound,tower,building,common_area], address jsonb, geo point, kahramaa_no, municipality, amenities text[], cost_center_id FK)
- `units` (id, property_id FK, code unique, category, furnished bool, rooms int, bathrooms int, maid_room bool, laundry_room bool, area_m2 numeric, base_rent numeric, declared_rent numeric, status enum[vacant,reserved,under_approval,occupied,renewal_due,vacating,maintenance_hold,available], current_lease_id FK NULL, photos jsonb)
- `unit_status_history` (id, unit_id FK, from_status, to_status, lease_id NULL, reason, changed_by, changed_at)

**Customers / Tenants** (single table; used as buyer or tenant)
- `customers` (id, type enum[individual,corporate], full_name_en, full_name_ar, national_id, passport_no, dob, nationality, kyc_status, contacts jsonb, segments text[])
- `customer_documents` (id, customer_id FK, doc_type, url, expires_at, verified bool)

**Leasing**
- `leases` (id, unit_id FK, customer_id FK, start_date, end_date, monthly_rent, payment_terms enum[monthly,quarterly,half,annual], deposit_amount, status enum[draft,pending_approval,active,renewed,terminated,cancelled], commercial_terms jsonb, signed_at)
- `lease_schedules` (id, lease_id FK, period_no, due_date, amount, status enum[scheduled,invoiced,partial,paid,overdue,waived])
- `pdcs` (id, lease_id FK, schedule_id FK, cheque_no, bank, branch, cheque_date, amount, status enum[pending,deposited,cleared,bounced,returned,replaced], scan_url)
- `security_deposits` (id, lease_id FK, amount, status enum[held,partially_refunded,refunded,deducted], deduction_jsonb, refund_jsonb)

**Finance**
- `gl_accounts` (id, code unique, name_en, name_ar, type enum[asset,liability,equity,income,expense], parent_id FK NULL, currency, is_postable bool)
- `cost_centers` (id, code, name, parent_id FK NULL, dimension enum[property,unit,owner,department,project])
- `journal_entries` (id, je_no unique, posting_date, period, source_module, source_id, narration, status enum[draft,posted,reversed])
- `journal_lines` (id, je_id FK, line_no, account_id FK, debit numeric, credit numeric, cost_center_id, property_id, unit_id, owner_id, currency, fx_rate)
  - CHECK: per JE, SUM(debit) = SUM(credit).
- `invoices` (id, customer_id, lease_id NULL, type enum[rent,maintenance,service,deposit_deduction,community], lines jsonb, total, status)
- `receipts` (id, customer_id, payment_mode enum[cash,bank,cheque,sadad,mada,apple_pay,stc_pay,card,bank_transfer], amount, currency, ref, received_at, allocations jsonb, status)
- `bank_accounts` (id, bank, account_no, currency, gl_account_id FK)
- `owner_payables` (id, owner_id, period, gross, expenses, net, status, paid_at)
- `posting_rules` (id, event_code unique, version, active bool, rule_json)

**Fixed Assets**
- `assets` (id, unit_id FK NULL, property_id FK NULL, category, name, serial_no, condition, acquired_at, acquired_value, useful_life_months, depreciation_method, status enum[in_use,returned,disposed,lost])
- `asset_handovers` (id, lease_id FK, type enum[move_in,move_out], items jsonb, tenant_sign_url, officer_sign_url, photos jsonb, performed_at)
- `depreciation_runs` (id, period, status, je_id FK NULL)

**Maintenance**
- `ticket_categories` (id, code, name_en, name_ar, default_sla_hours, default_priority)
- `tickets` (id, ticket_no unique, source enum[customer_app,front_desk,admin,community,vendor], category_id, unit_id FK NULL, property_id FK NULL, customer_id FK NULL, priority enum[low,medium,high,critical], status enum[new,validated,assigned,in_progress,on_hold,resolved,closed,cancelled], assignee_user_id NULL, vendor_id NULL, opened_at, due_at, resolved_at, closed_at, summary, description, photos jsonb, sla_breached bool)
- `ticket_events` (id, ticket_id FK, type, payload jsonb, by_user_id, at)
- `vendors` (id, legal_name, trade_license, contact jsonb, status)
- `vendor_invoices` (id, vendor_id, ticket_id NULL, amount, tax, currency, status enum[draft,submitted,approved,paid])
- `material_issues` (id, ticket_id, item, qty, unit_cost, total)

**Sales**
- `listings` (id, project_id, unit_id FK NULL, headline_en, headline_ar, price, status enum[available,reserved,sold,inactive], media jsonb, seo jsonb)
- `appointments` (id, type enum[sales_center,show_unit,construction,ownership_transfer,sales_call], customer_id, listing_id NULL, requested_at, scheduled_at, status, assigned_to_user_id)
- `reservations` (id, listing_id FK, customer_id FK, down_payment_amount, status enum[draft,pending_payment,payment_received,signed,contracted,cancelled,expired], expires_at, kyc_status, signed_form_url, signature_hash)
- `sales_contracts` (id, reservation_id FK, contract_no unique, signed_at, pdf_url, status, balance_amount, balance_due_at)
- `payment_intents` (id, source_type, source_id, provider, provider_ref, amount, status, raw_payload jsonb)

**Community (schema = `community`)**
- `community.facilities` (id, property_id, name_en, name_ar, capacity, slot_minutes, paid bool, price, rules jsonb)
- `community.facility_bookings` (id, facility_id, customer_id, start_at, end_at, status, payment_id NULL)
- `community.visitor_passes` (id, customer_id, visitor_name, visitor_id_no, vehicle_no, valid_from, valid_to, qr_code, status)
- `community.access_requests` (id, customer_id, type enum[gate,parking,resident_card], status, payload jsonb)
- `community.ev_requests` (id, customer_id, slot, start_at, end_at, price, status, payment_id NULL)
- `community.events` (id, property_id, title_en, title_ar, body_en, body_ar, starts_at, ends_at, hero_url)
- `community.reviews` (id, customer_id, target_type, target_id, rating, body, status)

**Customer engagement**
- `loyalty_coupons` (id, code, customer_id NULL, segment NULL, discount_pct, valid_from, valid_to, max_uses, used_count)
- `surveys` (id, code, title_en, title_ar, questions jsonb, audience jsonb, active)
- `survey_responses` (id, survey_id, customer_id, answers jsonb, submitted_at)
- `complaints` (id, customer_id, subject, body, severity, status, escalation_level, resolved_at)
- `notifications` (id, user_id NULL, customer_id NULL, channel enum[in_app,email,sms,push,whatsapp], template_code, payload jsonb, sent_at, read_at, status)
- `documents` (id, owner_type, owner_id, type, url, lang, version, signed_hash NULL)

**Required indexes:** `units(status, property_id)`, `tickets(status, due_at)`, `leases(status, end_date)`, `pdcs(cheque_date, status)`, `journal_lines(account_id, posting_date)`, `notifications(user_id, read_at)`.

---

## 6. State Machines (server-enforced)

- **Unit:** `vacant → reserved → under_approval → occupied → renewal_due → vacating → maintenance_hold → available → vacant`. Each transition writes `unit_status_history`.
- **Lease:** `draft → pending_approval → active → (renewed | terminated) → archived`; `cancelled` from any pre-active state.
- **PDC:** `pending → deposited → (cleared | bounced) → (replaced | written_off)`.
- **Reservation:** `draft → pending_payment → payment_received → signed → contracted`; sidetracks `cancelled`, `expired`.
- **Ticket:** `new → validated → assigned → in_progress → (on_hold ↔ in_progress) → resolved → closed`; `cancelled` allowed before resolved.
- **Approval:** `pending → (approved | rejected | cancelled)` with multi-step sequencing.

Encode with a transitions table + service guard; reject illegal transitions with HTTP 422 and a machine-readable error code.

---

## 7. Role & Permission Matrix (extend exhaustively)

| Capability | Admin | RE Officer | Finance | Maintenance | Mgmt | Sales | Vendor | Owner | Customer |
|---|---|---|---|---|---|---|---|---|---|
| Manage masters | ✅ | r | r | – | r | – | – | – | – |
| Create / activate lease | ✅ | ✅ (approval) | r | – | approve | – | – | r(own) | – |
| Approve rent < declared | – | – | – | – | ✅ | – | – | – | – |
| Capture PDC | – | ✅ | ✅ | – | r | – | – | – | – |
| Post receipt | – | – | ✅ | – | r | – | – | – | – |
| Refund deposit | – | submit | execute | – | approve | – | – | – | – |
| Assign ticket | – | – | – | ✅ | r | – | – | – | – |
| Close ticket | – | – | – | ✅ | r | – | – | – | confirm |
| Issue contract | – | – | – | – | approve | ✅ | – | – | – |
| View owner P&L | ✅ | – | ✅ | – | ✅ | – | – | own | – |
| View own ledger | – | – | – | – | – | – | – | own | own |
| View internal approvals | ✅ | partial | partial | – | ✅ | – | – | – | **never** |

**Customer-surface masking:** never expose internal approvals, owner profitability, mgmt notes, finance journals, vendor costs, staff activities.

---

## 8. Workflows & Business Rules

1. **Base rent floor** — if `lease.monthly_rent < unit.declared_rent`, lease moves to `pending_approval` and creates an `approval_request` against the `rent_below_declared` matrix.
2. **Deposit deduction & refund** — deductions need Mgmt approval; refund posts JE Dr Deposit Liability / Cr Bank.
3. **Lease cancellation** — Mgmt approval; voids future schedules, returns PDC, posts refunds.
4. **Renewal discount > X%** — Mgmt approval (default X = 10).
5. **Maintenance cost ceiling** — vendor invoice above limit (per category) → approval chain.
6. **SLA escalation cron** — every 15 min flags tickets where `now > due_at` and not resolved; bumps priority; notifies supervisor.
7. **Dunning** — reminders at 7 / 3 / 0 / +3 / +7 days vs `due_date`, channels per customer pref.
8. **PDC bounce** — status → bounced; creates `bounce_charge` invoice; notifies Finance + Tenant; recovery workflow.
9. **Owner revenue share** — monthly job computes `owner_payable` from posted revenue – posted expenses by `owner_id` dimension.
10. **Community separability** — no cross-schema FKs; inter-module reads only via published events (`customer.created`, `unit.status_changed`, `payment.captured`).

---

## 9. Finance Posting Rules (auto-JE)

| Event | Dr | Cr | Dimensions |
|---|---|---|---|
| Lease activated | — (creates schedules + deposit_liability) | — | — |
| Deposit received | Bank / Cash | Security Deposit Liability | property, unit, lease, customer |
| Rent accrual (monthly) | Tenant Receivable | Rental Income | property, unit, lease, customer, cost_center |
| Rent invoice issued | Tenant Receivable | Rental Income (if not accrued) | same |
| PDC deposited | PDC Control | Tenant Receivable | same |
| PDC cleared | Bank | PDC Control | same + bank_account |
| PDC bounced | Tenant Receivable + Bank Charges | PDC Control + Bank | same |
| Cash receipt | Bank / Cash | Tenant Receivable | same |
| Deposit deduction | Security Deposit Liability | Maintenance Expense / Rental Income | same |
| Deposit refund | Security Deposit Liability | Bank | same |
| Maintenance vendor invoice | Maintenance Expense (or CWIP) | Vendor Payable | property, unit, ticket |
| Vendor payment | Vendor Payable | Bank | same |
| Owner distribution | Owner Payable | Bank | owner, property |
| Depreciation | Depreciation Expense | Accumulated Depreciation | asset, property |
| Community paid service | Bank | Community Income | property, facility |

Implement as **`posting_rules.rule_json`** + a deterministic engine. Versioned and reversible (`journal_entries.status='reversed'` writes a counter-JE).

---

## 10. Integration Contracts (mocked adapters with real shapes)

Each adapter implements `IIntegration` with `dispatch(event, payload)`, `pull(query)`, `verifyWebhook(req)`, `healthCheck()`, exponential retry, idempotency key, DLQ.

- **Oracle Fusion ERP** — out: customers, invoices, receipts, JEs; in: GL period status. JSON over REST stub.
- **Yardi Voyager** — out: leases, charges, payments; in: unit/lease deltas. Yardi SOAP envelope shape, mocked via REST.
- **Dynamics 365 CRM** — bidirectional: contacts, accounts, cases (tickets), opportunities (reservations). OAuth2 client-credentials.
- **Power BI Embedded** — embed-token endpoint; dataset RLS by `owner_id` / `property_id`.
- **Power Automate** — outbound webhook on configurable events; HMAC-SHA256 signed.
- **Payments (SADAD / Mada / Apple Pay / STC Pay)** — `PaymentGateway` abstraction with `createIntent`, `confirm`, `refund`, `webhook`. Sandbox provider, tokenized PAN, **never store PAN**.
- **FCM / APNs** — persist device registrations; mock send.
- **WhatsApp Business Cloud API** — template messages for OTP, dunning, ticket updates.
- **E-signature** — mock provider: hash rendered PDF + capture signature image + audit. Future swap to DocuSign / Adobe Sign.

Every webhook at **`/api/public/webhooks/{provider}`** verifies HMAC + replay window (5 min) before processing.

---

## 11. API Surface

- **REST** under `/api/v1`, plural resources, OpenAPI 3.1 spec auto-generated.
- **GraphQL** under `/graphql` for dashboard composite reads.
- **Webhooks** under `/api/public/webhooks/{provider}`.
- **Auth** — OIDC bearer; staff via Entra ID SSO; customers via Entra External ID (B2C) **or** local auth + WebAuthn fallback for MVP.
- **Pagination** — cursor-based, `?cursor=&limit=`, max 100.
- **Filtering** — RSQL or `?filter[field]=op:value`.
- **Errors** — RFC 7807 problem+json with `code`, `field_errors`.
- **Idempotency** — `Idempotency-Key` header on POSTs that move money.
- **Rate limits** — 60 rpm/user default, 600 rpm staff.

Build resources: `/auth`, `/users`, `/roles`, `/owners`, `/properties`, `/units`, `/customers`, `/leases`, `/lease-schedules`, `/pdcs`, `/security-deposits`, `/invoices`, `/receipts`, `/journal-entries`, `/gl-accounts`, `/cost-centers`, `/assets`, `/asset-handovers`, `/tickets`, `/ticket-events`, `/vendors`, `/vendor-invoices`, `/listings`, `/appointments`, `/reservations`, `/sales-contracts`, `/loyalty-coupons`, `/surveys`, `/complaints`, `/notifications`, `/documents`, `/audit-log`, `/approvals`, `/community/*`, `/dashboards/{name}`, `/reports/{name}`.

Each resource: list / get / create / update / delete (where allowed) + domain actions (`POST /leases/:id/activate`, `POST /tickets/:id/assign`, `POST /reservations/:id/sign`, `POST /pdcs/:id/mark-cleared`, …).

---

## 12. UI / UX Spec

- **Layout** — Admin: collapsible sidebar + top bar + content. Customer Portal: 3-section nav (Home, Services, Community) + header. RTL mirrors everything; directional icons flip.
- **Components** — server-paginated data table with saved views; kanban (tickets); calendar (appointments, facility bookings, lease expiries); wizard (reservation, lease, move-in checklist); approval drawer; PDF/image viewer (EXIF strip on upload).
- **States** — every list has empty / loading / error / forbidden / offline; every form has a dirty-guard.
- **Accessibility** — WCAG 2.1 AA, focus rings, contrast ≥ 4.5:1, EN+AR labels, fully keyboard navigable.
- **Offline-first (customer portal)** — cache lease summary, last 20 tickets, docs; queue ticket-create when offline (service worker + IndexedDB).
- **i18n** — ICU plurals, AR/EN bundles, locale-aware dates (Gregorian default + Hijri toggle), numerals (Eastern vs Western Arabic per user pref), currency formatting (SAR base).
- Produce a `SCREENS.md` listing every screen with route, role gate, and acceptance criteria.

---

## 13. Tech Stack

**Target (per Kinan SOW):** Flutter (iOS/Android/Web) · Node.js NestJS · PostgreSQL · Redis · Docker · Azure (AKS + APIM + Blob + Postgres Flexible Server + Entra External ID) **or** GCP (Cloud Run + Apigee + Cloud Storage + Cloud SQL + Identity Platform) · GitHub Actions · Power BI Embedded · KSA region.

**MVP build (this prompt):**
- **Frontend** — Flutter Web (single codebase, mobile-ready). Fallback: React 18 + TS + Vite + TanStack Router + TanStack Query + shadcn/ui + Tailwind (explicitly note mobile will be re-implemented in Flutter).
- **Backend** — NestJS (TypeScript), Prisma ORM (Postgres), Zod input validation, BullMQ + Redis for jobs/cron, OpenAPI generated, GraphQL via Apollo, Pino logs, OpenTelemetry traces.
- **Auth** — Entra External ID (customers), Entra ID SSO (staff); local dev mock IdP; WebAuthn/passkeys for biometric on web; OTP via WhatsApp/SMS.
- **Storage** — S3-compatible (Azure Blob in prod, MinIO in dev).
- **Search** — Postgres full-text for MVP, OpenSearch later.
- **CI/CD** — GitHub Actions → Docker → AKS; envs dev / staging / prod; blue-green.
- **IaC** — Terraform stubs for Azure **and** GCP (cloud-agnostic).
- **Local dev** — `docker compose up` brings Postgres, Redis, MinIO, mailhog, mock-payments, mock-idp.

---

## 14. Security & Compliance Checklist

- KSA data residency (region pin) — documented config.
- AES-256 at rest (managed Postgres + Blob); TLS 1.2+ everywhere; HSTS + secure cookies.
- MFA mandatory for admin; WebAuthn for customers (optional).
- OAuth 2.0 / OIDC; access tokens ≤ 1h; refresh-token rotation.
- RBAC + row-level security policies per tenant scope.
- PCI-DSS — tokenized payments only; no raw PAN; SAQ-A scope.
- OWASP ASVS L2 + OWASP MTOP10 (mobile prep): SAST in CI, dependency scan, secret scan, weekly DAST against staging.
- Audit log on every write (immutable append-only; periodic Merkle-root hash).
- PII inventory + DSAR endpoint (export + delete).
- Pen-test gate before each prod release; remediation evidence stored.
- ISO 27001 alignment: backup, DR, IR, change-mgmt docs in repo.
- KMS-managed keys; rotate every 90 days.

---

## 15. Non-Functional Requirements

| Aspect | Target |
|---|---|
| API latency p95 | < 300 ms |
| Customer page TTI | < 2.5 s on 4G |
| Availability | 99.9% monthly |
| RPO / RTO | 1h / 4h |
| Concurrent users | 5k baseline, 10× burst |
| Logs retention | 90d hot, 1y cold |
| Metrics | Prometheus-compatible + OTel |
| Tracing | OTel with 10% sampling |
| Error rate budget | < 0.1% |
| Cron drift | < 30 s |

---

## 16. Phased Delivery Plan (build in this order)

- **Phase 0 — Foundation (week 1–2):** monorepo, CI, docker compose, NestJS skeleton, Flutter Web/React skeleton, OpenAPI plumbing, design tokens, i18n, RTL, auth (mock IdP), RBAC scaffolding, audit log, base layout.
- **Phase 1 — Masters & Admin:** owners, properties, units (with status machine), customers, COA, cost centers, users/roles, approval matrices, masters CRUD UI, audit log viewer.
- **Phase 2 — Leasing + PDC:** lease wizard, schedule generator, PDC capture, deposit liability, move-in checklist + asset handover; auto-JEs from §9.
- **Phase 3 — Customer Services portal:** customer auth, dashboard, tickets, docs, surveys, notifications, complaints, loyalty.
- **Phase 4 — Marketing & Sales:** listings, project pages, appointment scheduler, reservation wizard, KYC upload, mock e-sign, mock payment, contract issuance.
- **Phase 5 — Community module (separable schema):** facility booking, visitor passes, access requests, EV charging, events, paid services.
- **Phase 6 — Maintenance:** full ticket lifecycle, vendor management, material/cost capture, SLA escalation cron.
- **Phase 7 — Finance:** receipts, bank rec, owner payable, period close, posting-rule engine fully wired, reversals.
- **Phase 8 — Dashboards & reports:** occupancy, vacancy, collections aging, ticket backlog, property P&L; Power BI embed slot.
- **Phase 9 — Hardening:** pen-test fixes, perf, observability, DR drill, docs, training.

Each phase ends with: tests green, seed updated, demo script, sign-off checklist.

---

## 17. Acceptance & Test Plan

- **Unit** — Vitest/Jest, ≥ 80% on services and posting engine.
- **Integration** — Supertest against dockerized Postgres; happy path + 3 edge cases per endpoint.
- **E2E** — Playwright across customer portal + admin; scenarios: full lease lifecycle, full sale lifecycle, ticket SLA breach, PDC bounce + recovery, deposit refund with deduction approval, Arabic RTL smoke.
- **Load** — k6: 500 RPS read, 50 RPS write; p95 budgets above.
- **Security** — ZAP baseline, npm audit, container scan; no critical/high CVEs.
- **Accessibility** — axe-core in Playwright; zero serious violations.
- **UAT** — scripts per module, EN + AR.

---

## 18. Seed & Demo Data

Idempotent `seed` command:
- 1 owner, 3 properties, 30 units (mix of statuses).
- 50 customers (20 active tenants, 10 prospects, 20 mixed history).
- 12 months of rent schedules + PDCs for the 20 active leases (some cleared, 2 bounced).
- 25 tickets across statuses; 1 vendor + 5 vendor invoices.
- 10 listings, 5 reservations across all stages.
- 3 facilities + 15 bookings; 5 visitor passes; 2 EV requests.
- 3 loyalty coupons, 2 surveys with responses, 5 complaints.
- COA preloaded with §9 accounts; opening balances zero.
- All copy in EN + AR.

---

## 19. Repo & Deliverable Format

```
/apps
  /api          (NestJS)
  /web          (Flutter Web or React fallback)
/packages
  /shared-types (zod schemas + generated TS)
  /sdk          (typed API client)
/infra
  /docker
  /terraform/azure
  /terraform/gcp
/db
  /migrations
  /seed
/docs
  ARCHITECTURE.md
  ERD.svg
  SCREENS.md
  API.md (openapi.yaml link)
  SECURITY.md
  RUNBOOK.md
  DR.md
.github/workflows
README.md
```

Branching — `main` (prod), `develop`, `feat/*`, conventional commits. PR template with checklist (tests, docs, i18n, RTL, a11y, security). All PRs require green CI.

---

## 20. Output Contract (in order)

1. `ARCHITECTURE.md` (≤ 8 pages) + ERD.
2. Sprint 0 scaffold (Phase 0) — `docker compose up` boots the platform with a working login + empty dashboard in EN + AR.
3. Phase 1 — masters + RBAC + audit + seed.
4. Phases 2 → 9 sequentially. After each phase: tests green, seed updated, demo script, **stop for review**.

For every entity/endpoint/screen — list it, build it, test it. Do **not** stub UI with TODO once the phase declares it done.

---

## 21. Guardrails / Out of Scope (MVP)

- Native iOS / Android binaries (web only; Flutter codebase keeps the door open).
- PCI-DSS certification ceremony (use tokenized gateway only).
- Live ERP / Yardi / CRM credentials (mock adapters).
- Live e-signature certificate authority (mock + real cryptographic hash & audit).
- Real Power BI workspace (provide embed slot + sample dataset).
- Real WhatsApp Business sender ID (mock).
- Hijri calendar primary view (Gregorian primary, Hijri optional toggle).
- Public pricing pages beyond listings.

---

## 22. Glossary

- **PDC** — Post-Dated Cheque
- **Kahramaa** — utility account identifier (per source doc); for KSA equivalent treat as utility account id
- **COA** — Chart of Accounts
- **RBAC** — Role-Based Access Control
- **KYC** — Know Your Customer
- **CWIP** — Capital Work In Progress
- **SLA** — Service Level Agreement
- **JE** — Journal Entry
- **AR / AP** — Accounts Receivable / Payable
- **OIDC** — OpenID Connect
- **RLS** — Row Level Security
- **DLQ** — Dead-Letter Queue
- **DSAR** — Data Subject Access Request

---

## 23. Definition of Done (MVP)

- All 22 sections above honored.
- Every persona completes their primary journey end-to-end with seed data, in EN and AR.
- Every monetary movement posts a balanced, reversible JE.
- Every customer-visible surface excludes the restricted fields listed in §7.
- CI green, tests pass, OpenAPI publishes, docs complete, security checklist signed.
- `docker compose up` on a clean machine → fully working demo in ≤ 5 minutes.

**Begin by producing `ARCHITECTURE.md` and the ERD. Then scaffold Phase 0. Then ask me to review before Phase 1.**
