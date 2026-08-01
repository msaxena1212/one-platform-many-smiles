# ARCHITECTURE.md — Kinan Unified Real Estate Platform (Web MVP)

> Companion document to `PROMPT.md`. This file describes **how** the platform is structured. Section numbers cross-reference `PROMPT.md` where relevant.

---

## 1. Executive Summary

The platform unifies three customer-facing modules (Customer Services, Marketing & Sales, Community) with a real-estate ERP backbone (Real Estate Ops, Finance, Fixed Assets, Maintenance) and an internal Admin console.

- **Delivery model:** dedicated single-tenant SaaS, deployed in **KSA region**.
- **Frontend (MVP):** Flutter Web (mobile-ready). React 18 + Vite + shadcn/ui fallback when Flutter Web isn't feasible.
- **Backend:** NestJS (TypeScript), Prisma + PostgreSQL, Redis, BullMQ, GraphQL + REST + OpenAPI 3.1.
- **Cloud:** Azure primary (AKS, APIM, Blob, Postgres Flexible Server, Entra External ID). GCP parity via Terraform.
- **Auth:** OIDC. Staff = Entra ID SSO + MFA. Customers = Entra External ID (B2C) + optional WebAuthn/passkeys.
- **Integrations:** mocked adapters with production-shape interfaces for Oracle Fusion, Yardi Voyager, Dynamics 365, Power BI, Power Automate, SADAD/Mada/Apple Pay/STC Pay, FCM/APNs, WhatsApp Business, e-signature.
- **Compliance posture:** ISO 27001 aligned, PCI-DSS SAQ-A (tokenized), AES-256 at rest, TLS 1.2+, audit log on every write, OWASP ASVS L2 + MTOP10 ready.

---

## 2. Architectural Principles

1. **Modular monolith → microservices ready.** One repo, one deploy unit at MVP, but each module is its own NestJS module with its own DB schema, its own DTOs, and event-based cross-module reads. Split into independent services later by lifting modules out.
2. **Community is separable from day one.** `community.*` schema, no cross-schema FKs, all integration via events. Extraction = DNS + branding swap; no data migration.
3. **API-first.** All business logic lives behind documented REST/GraphQL endpoints. The web app is a client of those APIs, like any future mobile app will be.
4. **Event-driven.** A lightweight event bus (Redis Streams in MVP; upgradable to Kafka/Service Bus) decouples modules.
5. **Server-enforced rules.** State machines, RBAC, posting rules and approvals are enforced in the API. The UI cannot bypass them.
6. **Bilingual first-class.** EN + AR (RTL) at every layer — schema columns, payloads, templates, UI.
7. **Auditable & reversible.** Every write goes to `audit_log`. Every JE is reversible via a counter-JE.
8. **Stateless services, durable data.** Pods are disposable; state in Postgres, Blob, Redis.
9. **Secrets out of code.** Azure Key Vault / GCP Secret Manager, injected at runtime.
10. **Cloud-agnostic.** Terraform modules for Azure and GCP; abstract any vendor-specific call behind an interface.

---

## 3. System Context (C4 Level 1)

```
                                ┌──────────────────────────────┐
                                │      Kinan Customers         │
                                │  (web browser, future mobile)│
                                └──────────────┬───────────────┘
                                               │
                                ┌──────────────▼───────────────┐
                                │   Customer Portal (Flutter   │
                                │   Web)  + Public Listings    │
                                └──────────────┬───────────────┘
                                               │ HTTPS
┌──────────────────┐         ┌─────────────────▼───────────────┐         ┌──────────────────┐
│  Internal Staff  │ ──SSO──▶│        API Gateway / APIM       │◀──HTTPS─│  Owner Portal    │
│  (Admin Console) │         └─────────────────┬───────────────┘         └──────────────────┘
└──────────────────┘                           │
                                               │
                              ┌────────────────▼────────────────┐
                              │   NestJS Backend (modular)      │
                              │  Auth · RE · Finance · FA       │
                              │  Maint · Sales · Community      │
                              │  Engagement · Admin · Integ.    │
                              └────┬────────┬────────┬────────┬─┘
                                   │        │        │        │
                       ┌───────────▼─┐  ┌───▼───┐ ┌──▼──┐ ┌───▼────────┐
                       │ PostgreSQL  │  │ Redis │ │Blob │ │  Event Bus │
                       │ (multi-     │  │ cache │ │S3-  │ │ (Redis     │
                       │  schema)    │  │ + BMQ │ │like │ │  Streams)  │
                       └─────────────┘  └───────┘ └─────┘ └────────────┘
                                   │
                       ┌───────────▼───────────────────────────────────┐
                       │  Integration Adapters (mocked in MVP)          │
                       │  Oracle Fusion · Yardi · D365 · Power BI ·     │
                       │  Power Automate · Payments · FCM/APNs · WA ·   │
                       │  e-Signature                                   │
                       └────────────────────────────────────────────────┘
```

---

## 4. Logical Module Map (C4 Level 2)

```
apps/
├── web/                 Flutter Web (or React fallback)
│   ├── customer/        Customer Portal SPA
│   ├── admin/           Internal Admin Console
│   ├── owner/           Owner Portal (lite)
│   └── public/          SSR'd public listings + marketing
└── api/                 NestJS app
    ├── modules/
    │   ├── auth/                       Entra IdP + local + WebAuthn
    │   ├── iam/                        users, roles, permissions, scopes, RLS
    │   ├── audit/                      append-only audit, Merkle hash job
    │   ├── approvals/                  matrices, requests, steps
    │   ├── re-ops/                     owners, properties, units, customers, leases, pdc, deposits
    │   ├── fixed-assets/               assets, handovers, depreciation
    │   ├── maintenance/                tickets, vendors, materials, SLA cron
    │   ├── sales/                      listings, appointments, reservations, contracts
    │   ├── finance/                    COA, cost centers, JE engine, AR/AP, receipts, bank, posting-rules
    │   ├── engagement/                 loyalty, surveys, complaints, notifications, documents
    │   ├── community/                  community.* schema, facilities, bookings, visitors, EV, events
    │   ├── integration/                adapters, webhooks, event bus producers/consumers
    │   ├── reporting/                  dashboards, exports, Power BI embed tokens
    │   └── platform/                   feature flags, masters, i18n, templates, health
    ├── shared/                         dtos, guards, decorators, pipes, error filters
    └── infra/                          prisma, redis, blob, queue, otel, config
packages/
├── shared-types/        Zod schemas + generated TS types
└── sdk/                 Typed REST/GraphQL client (consumed by web + future mobile)
```

---

## 5. Data Architecture

### 5.1 Schema layout
- `public.*` — core ERP, RBAC, finance, masters.
- `community.*` — isolated community module; **no FK across schemas**; data exchanged through events.
- `audit.*` — append-only audit logs + Merkle anchors.
- `intg.*` — integration outbox, inbox, dead-letter queue.

### 5.2 Standards
- UUID v7 PKs; snake_case columns.
- Standard envelope: `created_at`, `updated_at`, `created_by`, `updated_by`, `deleted_at`.
- Money: `numeric(18,4)` + `currency` (ISO 4217), `fx_rate` on JE lines.
- Soft delete by default; hard delete only via DSAR.
- Required indexes called out in `PROMPT.md` §5.

### 5.3 Row-Level Security
- Tenant scope = Kinan single-tenant, but **owner/property scope** is enforced by policies on `units`, `leases`, `tickets`, `journal_lines`, `owner_payables`, `properties` for Owner and scoped staff roles.
- Customer-facing tables filter to `customer_id = current_setting('app.current_customer_id')::uuid`.

### 5.4 ERD (high level)

```
owners ─< properties ─< units ─< leases ─< lease_schedules ─< pdcs
                                  │
                                  ├──< security_deposits
                                  └──< asset_handovers >── assets

customers ──< customer_documents
customers ──< leases (tenant)
customers ──< reservations >── listings >── sales_contracts

tickets ─< ticket_events
tickets >── units, properties, customers, vendors, vendor_invoices, material_issues

invoices, receipts, journal_entries ─< journal_lines >── gl_accounts, cost_centers, properties, units, owners

community.facilities ─< community.facility_bookings
community.visitor_passes, community.access_requests, community.ev_requests, community.events, community.reviews

users >── user_roles >── roles ──< role_permissions >── permissions
approval_matrices ─< approval_requests ─< approval_steps
audit.audit_log (every write)
intg.outbox, intg.inbox, intg.dlq
```

Render a full ERD as `docs/ERD.svg` from the Prisma schema with `prisma-erd-generator`.

---

## 6. Business Logic Engine

### 6.1 State machines
Each entity has a transitions table + a `StateMachineGuard`. Illegal transitions return HTTP 422 with `code: STATE_TRANSITION_DENIED`. Transitions are recorded in entity-specific history tables (`unit_status_history`, `ticket_events`, …).

### 6.2 Approval engine
- `approval_matrices` define criteria via JSON predicates (e.g. `lease.monthly_rent < unit.declared_rent`).
- On qualifying writes, the service creates an `approval_request` and freezes the target entity until resolved.
- Steps are sequential; each step has a role + optional named approver + SLA timer.
- Reject → entity rolls back to prior state; Approve → engine resumes the originally requested transition.

### 6.3 Posting engine
- `posting_rules.rule_json` is a versioned, declarative mapping `event → {lines, dimensions, account_resolution}`.
- The engine consumes domain events (`lease.activated`, `receipt.posted`, `pdc.cleared`, …), resolves accounts/dimensions, writes balanced JEs.
- Engine guarantees `Σ debit = Σ credit` per JE (DB CHECK + service validation).
- Period close locks `posting_date ≤ closed_period`; reversals only via counter-JE.

### 6.4 Cron / scheduled jobs (BullMQ)
| Job | Cadence | Purpose |
|---|---|---|
| `sla.escalate` | every 15 min | Flag overdue tickets, bump priority, notify |
| `rent.accrual` | nightly | Post monthly rent accrual JE per schedule |
| `dunning.run` | daily 09:00 | Send reminders at 7/3/0/+3/+7 days |
| `pdc.deposit-reminder` | daily | Alert Finance for cheques due to deposit |
| `owner.payable.compute` | monthly | Build owner payable batch |
| `depreciation.run` | monthly | Compute and post depreciation |
| `audit.merkle.anchor` | hourly | Hash-chain new audit rows |
| `integration.retry` | every 5 min | Retry failed outbox rows with backoff |

---

## 7. Service Architecture

### 7.1 NestJS layering
```
Controller (HTTP / GraphQL resolver)
    │
    ▼
Application Service (use-case, orchestration, transactions)
    │
    ▼
Domain Service (pure business rules, state machines, validators)
    │
    ▼
Repository (Prisma)        EventBus (publish)        IntegrationAdapter
```

### 7.2 Transactions
- One application-service method = one DB transaction by default.
- Outbox pattern: domain events inserted in the same TX as data changes; a worker drains the outbox to the event bus, guaranteeing at-least-once delivery.

### 7.3 Validation & errors
- Zod schemas in `shared-types` are the single source of truth — server uses them in pipes; client uses them in forms.
- Error filter maps domain errors to RFC 7807 `application/problem+json` with stable `code` strings.

### 7.4 Observability
- **Logs:** Pino JSON, correlation-id propagated from `traceparent`.
- **Metrics:** Prometheus-compatible, exposed at `/metrics` (scraped by Azure Monitor or GCP Cloud Monitoring).
- **Traces:** OpenTelemetry, 10% sample, exported to OTLP collector.
- **RUM (web):** lightweight beacon to backend.

---

## 8. Frontend Architecture

### 8.1 App shells
- **Customer Portal** — focused, mobile-first responsive, offline-first for core reads.
- **Admin Console** — desktop-first density, dense tables, kanban, calendar.
- **Owner Portal** — minimal, read-mostly.
- **Public** — SSR for SEO; route-level data fetching.

### 8.2 Shared design system
- Design tokens in CSS variables (`PRIMARY`, `RADIUS`, …); both themes (light/dark) derive from the same token set.
- Component library: buttons, inputs, dialogs, drawers, tables, kanban, calendar, wizard, approval drawer, file viewer, empty/loading/error states.
- All components RTL-aware; logical CSS properties (`margin-inline-start`) over directional ones.

### 8.3 i18n & locale
- `intl` JSON bundles per surface; ICU message format.
- Locale switch persisted per user; default by `Accept-Language` with KSA fallback to AR.
- Date: Gregorian default; Hijri toggle (Umm al-Qura).
- Numerals: user preference (Western vs Eastern Arabic).
- Currency: SAR base; show source currency where multi-currency applies.

### 8.4 Offline-first (customer portal)
- Service worker caches app shell + last lease summary + last 20 tickets + last 20 documents.
- IndexedDB queue for new tickets created offline; replays on reconnect with idempotency key.

### 8.5 Accessibility
- WCAG 2.1 AA; tested with axe-core in CI.
- Keyboard-navigable; focus rings; `prefers-reduced-motion` respected.

---

## 9. Security Architecture

| Concern | Control |
|---|---|
| **Identity** | OIDC. Staff: Entra ID SSO + mandatory MFA. Customer: Entra External ID (B2C) or local + WebAuthn. Access tokens ≤ 1h; refresh rotation. |
| **Authorization** | RBAC via `roles` + `permissions` + scopes (`owner_id`, `property_id`). DB RLS for sensitive tables. |
| **Transport** | TLS 1.2+ enforced; HSTS; secure cookies; CSP; SRI on external scripts. |
| **At rest** | AES-256 (managed Postgres + Blob); KMS-rotated keys (90 d). |
| **Secrets** | Azure Key Vault / GCP Secret Manager; never in env files or repo. |
| **Payments** | Tokenized via gateway; no PAN stored; SAQ-A scope. |
| **Audit** | `audit_log` append-only; hourly Merkle root anchored to immutable storage. |
| **Webhooks** | HMAC signature + 5-minute replay window. |
| **Input** | Zod schemas; central error filter; SSRF/SQLi/XSS by ORM + parameterization + sanitization. |
| **Files** | Antivirus scan on upload; EXIF strip on images; signed-URL downloads with short TTL. |
| **Sessions** | Idle 30 min, absolute 12 h; concurrent session limit per role. |
| **Pen-test** | Quarterly + pre-prod gate; remediation evidence stored in `docs/SECURITY.md`. |
| **Compliance** | ISO 27001 alignment; OWASP ASVS L2 + MTOP10 prep; SAST/DAST/dep-scan/secret-scan in CI. |
| **PII / DSAR** | PII inventory; `/users/{id}/dsar/export` and `/dsar/delete` endpoints. |

---

## 10. Integration Architecture

### 10.1 Adapter interface
```ts
interface IIntegration<EventName extends string, Payload> {
  dispatch(event: EventName, payload: Payload, idemKey: string): Promise<DispatchResult>;
  pull(query: PullQuery): AsyncIterable<InboundRecord>;
  verifyWebhook(req: IncomingRequest): VerificationResult;
  healthCheck(): Promise<HealthStatus>;
}
```

### 10.2 Patterns
- **Outbound:** Outbox → worker → adapter; idempotency key per business event; exponential backoff (1s/5s/30s/5m/30m/2h); DLQ after 8 attempts.
- **Inbound:** Webhook endpoints under `/api/public/webhooks/{provider}` with HMAC verify + replay window → push to inbox → dispatch handler.
- **Polling:** for systems without webhooks (e.g. mock Yardi), a poller pulls deltas on a schedule.

### 10.3 Adapter inventory (MVP = mock)
- **Oracle Fusion** — customers, invoices, receipts, JEs, GL period status.
- **Yardi Voyager** — leases, charges, payments; unit/lease deltas.
- **Dynamics 365** — contacts, accounts, cases, opportunities.
- **Power BI Embedded** — embed-token endpoint; dataset RLS by `owner_id`/`property_id`.
- **Power Automate** — outbound HMAC-signed webhooks.
- **Payments (SADAD / Mada / Apple Pay / STC Pay)** — `createIntent`, `confirm`, `refund`, `webhook`.
- **FCM / APNs** — device registration + mock send.
- **WhatsApp Business Cloud** — template messages.
- **E-signature** — hash PDF + capture signature image + audit; swap to DocuSign/Adobe later.

---

## 11. Tech Stack Detail

| Layer | Technology | Rationale |
|---|---|---|
| Mobile/Web client | **Flutter Web** (target) / React 18 + Vite + shadcn/ui (fallback) | Single codebase mobile-ready; SOW-aligned |
| State / data | TanStack Query / Riverpod (Flutter) | Cache, optimistic updates, offline |
| Backend | **NestJS** (TypeScript) | Modular, opinionated, DI, mature ecosystem |
| ORM | **Prisma** | Migrations, type safety, multi-schema |
| DB | **PostgreSQL 16** | Relational integrity, RLS, full-text |
| Cache / Queue | **Redis** + **BullMQ** | Cache, sessions, jobs, cron |
| Search | Postgres FTS (MVP) → OpenSearch | Defer cost until needed |
| File storage | Azure Blob / GCP Cloud Storage / MinIO (dev) | Documents, photos, scans |
| Auth | Entra External ID + Entra ID SSO | SOW-aligned, MFA, OIDC |
| Gateway | Azure API Management / GCP Apigee | Rate limit, throttling, key mgmt |
| Container | Docker + AKS / GKE | Standard, portable |
| CI/CD | GitHub Actions | Cloud-agnostic, mature |
| IaC | Terraform | Azure + GCP modules |
| Observability | OpenTelemetry + Prometheus + Pino | Standards-based |

---

## 12. Environments & Deployment

| Env | Purpose | Data | Auth |
|---|---|---|---|
| `local` | Developer laptops | Seed | Mock IdP |
| `dev` | Integration | Seed + manual | Mock IdP |
| `staging` | UAT, pen-test | Anonymized prod-shape | Real Entra (test tenant) |
| `prod` | Live | Real | Real Entra |

- Branching: `main` (prod), `develop`, `feat/*`.
- Conventional commits + PR template + required checks (lint, type, unit, e2e smoke, security scan).
- Deploys: blue-green on AKS; database migrations via Prisma deploy job gated on backup snapshot.
- Backups: nightly full + 15-min WAL; **RPO 1 h, RTO 4 h**; quarterly restore drill.
- Disaster Recovery: secondary region warm-standby (Azure paired region within KSA / nearest compliant); failover runbook in `docs/DR.md`.

---

## 13. Non-Functional Targets

Mirrored from `PROMPT.md` §15. Validated in CI/staging via k6 perf jobs, axe-core a11y jobs, and synthetic monitoring in prod.

---

## 14. Phased Build Order

Phases 0 → 9 as defined in `PROMPT.md` §16. Each phase produces:
- Migrations + seed delta
- Service + UI changes
- Tests (unit + integration + e2e for the slice)
- Updated `SCREENS.md` and `API.md`
- Demo script + sign-off checklist

---

## 15. Key Architectural Decisions (ADRs)

Track in `docs/adr/NNNN-title.md`. Initial set:

1. **ADR-0001** — Modular monolith over microservices for MVP.
2. **ADR-0002** — Flutter Web as primary client; React fallback documented.
3. **ADR-0003** — Postgres multi-schema for Community separability (instead of separate DB).
4. **ADR-0004** — Outbox pattern for reliable event delivery.
5. **ADR-0005** — Declarative JSON posting rules over hard-coded JE logic.
6. **ADR-0006** — Approval engine driven by JSON predicates, not bespoke code per case.
7. **ADR-0007** — Mock-first integrations with production-shape interfaces.
8. **ADR-0008** — RLS for owner/property scope, not just service-level checks.
9. **ADR-0009** — Tokenized payments only; never store PAN; SAQ-A scope.
10. **ADR-0010** — Cloud-agnostic via Terraform; Azure primary, GCP parity.

---

## 16. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Community module hard to extract later | Enforced by schema separation + event-only reads from day one |
| JE engine bugs corrupt finance | DB CHECK on balanced JE + reversal-only corrections + golden-master tests |
| Integration credentials unavailable at MVP | Mock adapters with production interfaces; swap-in by config |
| RTL regressions in admin | RTL smoke test in every PR; component library RTL-tested |
| Approval bypass via API | Service-level guard + DB RLS + transition table |
| Data-residency drift | Region-pinned resources in Terraform; CI policy check |
| Auth misconfig on B2C | Staging tenant + automated OIDC conformance test |
| Vendor lock-in (Azure) | Cloud-agnostic abstractions + GCP Terraform parity |

---

## 17. Definition of Done — Architecture

- Diagrams (context, container, component) generated and committed.
- `ERD.svg` matches Prisma schema.
- ADR-0001 through ADR-0010 written.
- `SECURITY.md`, `RUNBOOK.md`, `DR.md` drafted with the Phase 0 scaffold.
- Phase 0 scaffold boots locally via `docker compose up` and serves a working login + empty dashboard in EN + AR.

---

*End of ARCHITECTURE.md*
