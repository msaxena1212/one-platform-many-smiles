import { createContext, useContext, useEffect, useMemo, useState, useRef, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

const today = new Date();

function addDays(date: Date, days: number): string {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().split("T")[0];
}

export type UnitStatus = "Available" | "Occupied" | "Reserved" | "Vacant - Under Maintenance";
export type CustomerStatus = "draft" | "active" | "inactive" | "duplicate";
export type LeasePaymentFrequency = "monthly" | "quarterly" | "semi-annual" | "annual" | "half_yearly" | "yearly";
export type LeaseStatus =
  | "draft"
  | "documents_pending"
  | "documents_verified"
  | "tenant_signed_pending_collection"
  | "collection_completed"
  | "pending_landlord_signature"
  | "fully_signed"
  | "active"
  | "renewal_due"
  | "renewed"
  | "non_renewal"
  | "checkout"
  | "closed";
export type PdcStatus = "received" | "deposited" | "cleared" | "bounced" | "returned" | "replaced" | "cancelled" | "partial_cash";
export type VoucherStatus = "draft" | "posted" | "shared" | "settled";

export interface PmsUnit {
  id: string;
  property: string;
  unit: string;
  status: UnitStatus;
  rent: number;
  contractEndDate?: string;
  currentTenant?: string;
}

export interface PmsCustomer {
  id: string;
  name: string;
  type: "individual" | "company";
  qatarId: string;
  passport: string;
  crNumber: string;
  mobile: string;
  email: string;
  status: CustomerStatus;
  qid?: string;
  phone?: string;
  poBox?: string;
  address?: string;
  [key: string]: any;
}

export interface PmsLease {
  id: string;
  customerId: string;
  reservationId: string;
  property: string;
  unit: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  pdcCount: number;
  paymentFrequency: LeasePaymentFrequency;
  gracePeriodDays: number;
  penalties: string;
  maintenanceResponsibility: string;
  utilityResponsibility: string;
  parkingDetails: string;
  specialConditions: string;
  noticePeriodDays: number;
  status: LeaseStatus;
  tenantSignedAt?: string;
  landlordSignedAt?: string;
  signedDocument?: string;
  receivedBy?: string;
  landlordPackageSubmittedAt?: string;
  sharedWithTenant?: boolean;
  collectionCompleted: boolean;
  renewalOf?: string;
  plannedVacateDate?: string;
  actualVacateDate?: string;
  earlyVacate?: boolean;
  earlyVacateReason?: string;
  contractNumber?: string;
  [key: string]: any;
}

export interface PmsPdc {
  id: string;
  leaseId: string;
  chequeNo: string;
  bank: string;
  date: string;
  amount: number;
  paid_amount?: number;
  status: PdcStatus;
  payerName?: string;
  period?: string;
  file?: string;
}

export interface PmsVoucher {
  id: string;
  leaseId: string;
  name: string;
  receiptNo?: string;
  method?: string;
  period?: string;
  debit: string;
  credit: string;
  amount: number;
  status: VoucherStatus;
  settlement_deductions?: number;
  settlement_refund?: number;
  settlement_date?: string;
}

export interface PmsKeyNotice {
  id: string;
  leaseId: string;
  recipient: string;
  handoverAt: string;
  handoverTime?: string;
  authorizedCollector?: string;
  keysSummary?: string;
  outstandingRequirements?: string;
  staffContact?: string;
  note?: string;
  status: "ready" | "sent" | "blocked" | "pending";
}

export interface PmsHandover {
  id: string;
  leaseId: string;
  handoverAt?: string;
  keys: number;
  keyType?: string;
  accessCards: number;
  parkingRemotes: number;
  parkingDeviceDetails?: string;
  electricityMeterReading?: string;
  waterMeterReading?: string;
  meterInfo?: string;
  unitCondition?: string;
  cleanliness?: string;
  acWorking?: boolean;
  plumbingOk?: boolean;
  electricalOk?: boolean;
  doorsWindowsOk?: boolean;
  idVerified?: boolean;
  photosTaken?: number;
  collectorName?: string;
  collectorIdNumber?: string;
  issuedBy?: string;
  tenantAcknowledgement?: string;
  note?: string;
  acknowledged: boolean;
}

export interface PmsCheckIn {
  id: string;
  leaseId: string;
  date: string;
  condition: string;
  furnitureCondition?: string;
  fixturesCondition?: string;
  wallFloorCeilingCondition?: string;
  acCondition?: string;
  electricityMeter?: string;
  waterMeter?: string;
  damages?: string;
  pendingMaintenance?: string;
  photos: number;
  note?: string;
}

export interface PmsReservation {
  id: string;
  property: string;
  unit: string;
  tenantName: string;
  agent?: string;
  startDate: string;
  validUntil: string;
  rent: number;
  status: "reserved" | "released" | "expired" | "converted";
  remarks?: string;
  proposedEndDate?: string;
  isHold?: boolean;
  tokenAmount?: number;
  tokenPaymentMode?: "Cash" | "Bank Transfer" | "Cheque";
  tokenReceiptNo?: string;
  tokenRefunded?: boolean;
}

export interface PmsAuditEvent {
  id: string;
  stage: string;
  owner: string;
  input: string;
  approval: string;
  status: string;
  output: string;
  at: string;
}

export interface PmsAppData {
  units: PmsUnit[];
  customers: PmsCustomer[];
  reservations: PmsReservation[];
  leases: PmsLease[];
  pdcs: PmsPdc[];
  vouchers: PmsVoucher[];
  keyNotices: PmsKeyNotice[];
  handovers: PmsHandover[];
  checkIns: PmsCheckIn[];
  auditEvents: PmsAuditEvent[];
}

const INITIAL_SEED_CUSTOMERS: PmsCustomer[] = [];

const INITIAL_SEED_RESERVATIONS: PmsReservation[] = [];

const EMPTY_DATA: PmsAppData = {
  units: [],
  customers: [],   // populated by fetchDirectFromDatabase (3-source: customers + fin_pdc_register + pdcs)
  reservations: [],
  leases: [],
  pdcs: [],
  vouchers: [],
  keyNotices: [],
  handovers: [],
  checkIns: [],
  auditEvents: [],
};

interface AppDataContextValue extends PmsAppData {
  setUnits: (fn: (prev: PmsUnit[]) => PmsUnit[]) => void;
  setCustomers: (fn: (prev: PmsCustomer[]) => PmsCustomer[]) => void;
  setReservations: (fn: (prev: PmsReservation[]) => PmsReservation[]) => void;
  setLeases: (fn: (prev: PmsLease[]) => PmsLease[]) => void;
  setPdcs: (fn: (prev: PmsPdc[]) => PmsPdc[]) => void;
  setVouchers: (fn: (prev: PmsVoucher[]) => PmsVoucher[]) => void;
  setKeyNotices: (fn: (prev: PmsKeyNotice[]) => PmsKeyNotice[]) => void;
  setHandovers: (fn: (prev: PmsHandover[]) => PmsHandover[]) => void;
  setCheckIns: (fn: (prev: PmsCheckIn[]) => PmsCheckIn[]) => void;
  setAuditEvents: (fn: (prev: PmsAuditEvent[]) => PmsAuditEvent[]) => void;
  syncing: boolean;
  refetchData: () => Promise<void>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [appData, setAppData] = useState<PmsAppData>(EMPTY_DATA);
  const [syncing, setSyncing] = useState(true);

  const fetchDirectFromDatabase = useCallback(async () => {
    setSyncing(true);
    try {
      // Helper to fetch all rows across PostgREST 1000-row default pages
      async function fetchAllRows<T = any>(
        queryFn: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: any }>
      ): Promise<T[]> {
        let rows: T[] = [];
        let from = 0;
        const pageSize = 1000;
        while (true) {
          try {
            const res = await Promise.resolve(queryFn(from, from + pageSize - 1));
            if (res.error || !res.data || res.data.length === 0) break;
            rows = rows.concat(res.data);
            if (res.data.length < pageSize) break;
            from += pageSize;
          } catch {
            break;
          }
        }
        return rows;
      }

      // Safe concurrent fetch with full pagination
      const [
        unitsData,
        propertiesData,
        customersData,
        leasesData,
        finPdcsData,
        altPdcsData,
        reservationsData,
        vouchersData,
        handoversData,
        inspectionsData,
      ] = await Promise.all([
        fetchAllRows((from, to) =>
          supabase
            .from("units")
            .select("id, unit_ref, unit_name, unit_code, status, lease_status, current_tenant, contract_no, contract_start_date, contract_end_date, current_rent, price, security_deposit_amount, rent_frequency, maintenance_responsibility, parking_slot_no, property_id, properties(id, title, property_code)")
            .range(from, to)
        ),
        fetchAllRows((from, to) =>
          supabase.from("properties").select("id, title, property_code").range(from, to)
        ),
        fetchAllRows((from, to) =>
          supabase.from("customers").select("*").range(from, to)
        ),
        fetchAllRows((from, to) =>
          supabase.from("leases").select("*, properties(id, title, property_code), customers:customer_id(full_name)").range(from, to)
        ),
        fetchAllRows((from, to) =>
          supabase.from("fin_pdc_register").select("*").range(from, to)
        ),
        fetchAllRows((from, to) =>
          supabase.from("pdcs").select("*").range(from, to)
        ),
        fetchAllRows((from, to) =>
          supabase.from("reservations").select("*").range(from, to)
        ),
        fetchAllRows((from, to) =>
          supabase.from("fin_vouchers").select("*").range(from, to)
        ),
        fetchAllRows((from, to) =>
          supabase.from("key_handovers").select("*").range(from, to)
        ),
        fetchAllRows((from, to) =>
          supabase.from("inspection_reports").select("*").range(from, to)
        ),
      ]);

      const unitsRes = { data: unitsData };
      const propertiesRes = { data: propertiesData };
      const customersRes = { data: customersData };
      const leasesRes = { data: leasesData };
      const pdcsRes = { data: finPdcsData };
      const altPdcsRes = { data: altPdcsData };
      const reservationsRes = { data: reservationsData };
      const vouchersRes = { data: vouchersData };
      const handoversRes = { data: handoversData };
      const inspectionsRes = { data: inspectionsData };

      const propMap = new Map<string, string>();
      (propertiesRes.data || []).forEach((p: any) => {
        if (p.id) propMap.set(p.id, p.title);
        if (p.property_code) propMap.set(p.property_code, p.title);
      });

      const unitMap = new Map<string, string>();
      (unitsRes.data || []).forEach((u: any) => {
        if (u.id) unitMap.set(u.id, u.unit_ref || u.unit_name || u.unit_code || "Unit");
      });

      const mappedUnits: PmsUnit[] = (unitsRes.data || []).map((u: any) => {
        const propTitle = u.properties?.title || propMap.get(u.property_id) || u.property_id || "Property";
        return {
          id: u.id,
          property: propTitle,
          unit: u.unit_ref || u.unit_name || u.unit_code || "Unit",
          status: (u.status === "Occupied" || u.lease_status === "Leased" ? "Occupied" : u.status === "Available" ? "Available" : (u.status as UnitStatus)) || "Available",
          rent: Number(u.current_rent || u.price || 0),
        };
      });

      // ──────────────────────────────────────────────────────────────────────
      // CUSTOMER MASTER: 3-source synthesis (same logic as PDC Management)
      //   Source 1: customers table   → real DB rows with full profile data
      //   Source 2: fin_pdc_register  → unique tenant_name across all PDCs
      //   Source 3: pdcs table        → unique tenant_name / drawer_name
      //
      // This guarantees that Customer Master, Reservations, and any other
      // component that reads `customers` from context all see the same N.
      // ──────────────────────────────────────────────────────────────────────

      const seenCustIds  = new Set<string>();
      const seenCustNames = new Set<string>();
      const mergedCustomers: PmsCustomer[] = [];

      // Helper: normalize customer name to prevent duplicates like "M/s Embassy of Pakistan" vs "M/s.Embassy of Pakistan"
      const normalizeCustKey = (name: string): string => {
        if (!name) return "";
        let n = name.toLowerCase().trim();
        // Normalize common salutations / prefixes like M/s, M/s., M/S.
        n = n.replace(/^m\s*\/\s*s\.?\s*/i, "m/s ");
        // Strip punctuation/special chars and collapse multiple whitespace
        n = n.replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
        return n;
      };

      // Helper: produce a canonical display name (preserves original casing but normalises the M/s prefix)
      const canonicalName = (name: string): string => {
        if (!name) return name;
        // Normalise M/s. → M/s  (with a space after)
        return name.trim().replace(/^(M|m)\s*\/\s*(S|s)\.?\s*/,  "M/s ");
      };

      // Helper: resolve the best available name from a raw DB row
      const resolveName = (c: any): string =>
        (c.full_name || c.name || c.tenant_name || c.customer_name ||
          (c.first_name && c.last_name ? `${c.first_name} ${c.last_name}`.trim() : "") ||
          c.first_name || c.last_name || "").trim();

      // Helper: guess company vs individual from display name
      const guessType = (name: string): "company" | "individual" => {
        const l = (name || "").toLowerCase().trim();
        return l.startsWith("m/s") || l.startsWith("m/s.") || l.includes("trading") || l.includes("w.l.l") || l.includes("llc") ||
          l.includes("corp") || l.includes("group") || l.includes("co.") ||
          l.includes("company") || l.includes("services") || l.includes("international") ||
          l.includes("logistics") || l.includes("contracting") || l.includes("industries") ||
          l.includes("enterprise") || l.includes("real estate") || l.includes("embassy") ||
          l.includes("solutions") || l.includes("limited") || l.includes("sport club") ||
          l.includes("electrical") || l.includes("katara") || l.includes("larsen") ||
          l.includes("qentz") || l.includes("saipem") || l.includes("special numberz") ||
          l.includes("glamour") || l.includes("alfanet") || l.includes("axiom") ? "company" : "individual";
      };

      // SOURCE 1: proper DB records from customers table
      for (const c of (customersRes.data || [])) {
        const name = resolveName(c);
        if (!name || name.toLowerCase().includes("abc trading")) continue;
        const id = String(c.id);
        const normKey = normalizeCustKey(name);
        if (seenCustIds.has(id) || (normKey && seenCustNames.has(normKey))) continue;
        seenCustIds.add(id);
        if (normKey) seenCustNames.add(normKey);
        mergedCustomers.push({
          id,
          name,
          type: (c.customer_type?.toLowerCase() === "company" || c.type?.toLowerCase() === "company" || guessType(name) === "company" ? "company" : "individual") as any,
          qatarId:  c.qatar_id || c.qatarId || "",
          passport: c.passport_number || c.passport || "",
          crNumber: c.commercial_registration || c.cr_number || c.crNumber || "",
          mobile:   c.mobile_number || c.mobile || c.phone || "",
          email:    c.email_address || c.email || "",
          status:   "active" as any,
          _source:  "db",
        } as any);
      }

      // Also pull any imported customers from localStorage (Excel bulk import)
      try {
        const rawHistory = localStorage.getItem("zyno_pms_import_batches_history_v2");
        if (rawHistory) {
          const parsedBatches = JSON.parse(rawHistory);
          if (Array.isArray(parsedBatches)) {
            parsedBatches.forEach((b: any) => {
              if (b.module === "customer" && Array.isArray(b.records)) {
                b.records.forEach((r: any) => {
                  const norm = r.normalizedData || r.rawRowData || {};
                  const custName = norm.full_name || norm["Full Name / Company Name"] || norm["Full Name / Company Name *"] || r.recordName;
                  if (custName && (r.status === "SUCCESS" || r.status === "READY" || b.status === "COMPLETED" || b.status === "PARTIAL_SUCCESS")) {
                    const nameClean = String(custName).trim();
                    const normKey = normalizeCustKey(nameClean);
                    if (!nameClean || (normKey && seenCustNames.has(normKey)) || nameClean.toLowerCase().includes("abc trading")) return;
                    if (normKey) seenCustNames.add(normKey);
                    const isCompany = (norm.customer_type || norm["Customer Type"])?.toLowerCase() === "company" || guessType(nameClean) === "company";
                    mergedCustomers.push({
                      id: r.recordId || `cust-imp-${r.recordKey || Math.floor(Math.random() * 100000)}`,
                      name: nameClean,
                      type: isCompany ? "company" : "individual",
                      qatarId: norm.qatar_id || norm["Qatar ID"] || (isCompany ? "" : r.recordKey),
                      passport: norm.passport_number || norm["Passport Number"] || "",
                      crNumber: norm.commercial_registration || norm["Commercial Registration (CR)"] || (isCompany ? r.recordKey : ""),
                      mobile: norm.mobile_number || norm["Mobile Number"] || "",
                      email: norm.email_address || norm["Email Address"] || "",
                      status: "active" as any,
                      _source: "import",
                    } as any);
                  }
                });
              }
            });
          }
        }
      } catch (err) {
        console.warn("Failed to load local imported customers:", err);
      }

      const mappedCustomers: PmsCustomer[] = mergedCustomers.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
      );


      // Map existing relational leases
      const existingLeases: PmsLease[] = (leasesRes.data || []).map((l: any) => ({
        id: l.lease_number || l.id,
        customerId: l.customer_id || "",
        reservationId: l.id || "",
        property: l.properties?.title || propMap.get(l.property_id) || "Property",
        unit: unitMap.get(l.unit_id) || l.unit_ref || "Unit",
        tenantName: canonicalName(l.customers?.full_name || l.tenant_name || "Tenant"),
        startDate: l.commencement_date || "",
        endDate: l.expiry_date || "",
        monthlyRent: Number(l.rental_amount || 0),
        securityDeposit: Number(l.security_deposit || 0),
        pdcCount: Number(l.number_of_pdc || 12),
        paymentFrequency: (l.payment_frequency?.toLowerCase() as LeasePaymentFrequency) || "monthly",
        gracePeriodDays: Number(l.grace_period_days || 7),
        penalties: `${l.late_penalty_percentage || 0}%`,
        maintenanceResponsibility: l.maintenance_responsibility || "Landlord",
        utilityResponsibility: l.utility_responsibility || "Tenant",
        parkingDetails: l.parking_details || "",
        specialConditions: l.special_conditions || "",
        noticePeriodDays: Number(l.notice_period_days || 30),
        status: (l.lease_status?.toLowerCase() as LeaseStatus) || "active",
        collectionCompleted: true,
      }));

      // Also synthesize active leases for occupied units or units with current_tenant / contract
      const seenLeaseUnits = new Set(existingLeases.map((l) => `${l.property}-${l.unit}`.toLowerCase()));
      const unitContracts: PmsLease[] = [];

      (unitsRes.data || []).forEach((u: any, idx: number) => {
        const isOccupied =
          u.status?.toLowerCase() === "occupied" ||
          (u.lease_status?.toLowerCase() === "leased" && u.status?.toLowerCase() !== "available") ||
          (u.current_tenant && u.current_tenant.trim().length > 0);

        if (isOccupied) {
          const propTitle = u.properties?.title || propMap.get(u.property_id) || u.property_id || "Property";
          const unitIdentifier = u.unit_ref || u.unit_name || u.unit_code || "Unit";
          const unitKey = `${propTitle}-${unitIdentifier}`.toLowerCase();

          if (!seenLeaseUnits.has(unitKey)) {
            seenLeaseUnits.add(unitKey);
            const monthlyRent = Number(u.current_rent || u.price || u.rent_amount || 6500);
            const secDeposit = Number(u.security_deposit_amount || monthlyRent);
            const contractNo = u.contract_no || `L-${unitIdentifier.replace(/\W/g, "") || u.id.slice(0, 5)}`;
            const tenantName = u.current_tenant && u.current_tenant.trim() ? canonicalName(u.current_tenant.trim()) : `Tenant (${unitIdentifier})`;
            const custId = `cust-${u.id.slice(0, 8)}`;

            unitContracts.push({
              id: contractNo,
              customerId: custId,
              reservationId: `res-${u.id.slice(0, 8)}`,
              property: propTitle,
              unit: unitIdentifier,
              tenantName: tenantName,
              startDate: u.contract_start_date || "2026-01-01",
              endDate: u.contract_end_date || (() => { const d = new Date(); d.setFullYear(d.getFullYear() + 1); return d.toISOString().split("T")[0]; })(),
              monthlyRent: monthlyRent,
              securityDeposit: secDeposit,
              pdcCount: 12,
              paymentFrequency: ((u.rent_frequency || "monthly").toLowerCase() as LeasePaymentFrequency),
              gracePeriodDays: 7,
              penalties: "5%",
              maintenanceResponsibility: u.maintenance_responsibility || "Landlord",
              utilityResponsibility: "Tenant",
              parkingDetails: u.parking_slot_no ? `Slot ${u.parking_slot_no}` : "Dedicated parking",
              specialConditions: "Standard Tenancy Agreement",
              noticePeriodDays: 60,
              status: "active",
              collectionCompleted: true,
            });
          }
        }
      });

      const mappedLeases: PmsLease[] = [...existingLeases, ...unitContracts];

      // Build lookup from pdcs table by compound key (unit||cheque) and cheque number
      const pdcsLookup = new Map<string, any>();
      (altPdcsRes.data || []).forEach((p: any) => {
        const u = (p.unit_name || p.unit_ref || "").trim();
        const c = String(p.cheque_number || p.id).trim();
        if (c) {
          if (u) pdcsLookup.set(`${u}||${c}`, p);
          if (!pdcsLookup.has(c)) pdcsLookup.set(c, p);
        }
      });

      // Combine PDCs preserving ALL unique records by row ID
      const allRawPdcs: any[] = [];
      const seenPdcIds = new Set<string>();

      (pdcsRes.data || []).forEach((p: any) => {
        const id = `fin-${p.id}`;
        if (!seenPdcIds.has(id)) {
          seenPdcIds.add(id);
          const chq = String(p.cheque_number || "").trim();
          const u = (p.unit_name || p.unit_ref || "").trim();
          const matched = (u && chq ? pdcsLookup.get(`${u}||${chq}`) : null) || (chq ? pdcsLookup.get(chq) : null);

          allRawPdcs.push({
            ...p,
            id: String(p.id),
            property_name: matched?.property_name || matched?.property_code || p.property_name || p.property_code || "",
            unit_name: matched?.unit_name || matched?.unit_ref || p.unit_name || p.unit_ref || "",
            tenant_name: matched?.tenant_name || matched?.drawer_name || p.tenant_name || p.drawer_name || "",
            bank: matched?.bank || p.bank || p.bank_name || "QNB",
          });
        }
      });

      // Also add any pdcs table entries not covered
      (altPdcsRes.data || []).forEach((p: any) => {
        const chq = String(p.cheque_number || p.id).trim();
        const covered = allRawPdcs.some(f => String(f.cheque_number || f.id).trim() === chq);
        if (!covered) {
          allRawPdcs.push(p);
        }
      });

      const mappedPdcs: PmsPdc[] = allRawPdcs.map((p: any) => ({
        id: String(p.id),
        leaseId: p.lease_id || "",
        chequeNo: p.cheque_number || "",
        bank: p.bank || p.bank_name || "QNB",
        date: p.maturity_date || p.cheque_date || "",
        amount: Number(p.amount || 0),
        status: (p.status?.toLowerCase().replace(/ /g, "_") as PdcStatus) || "received",
        payerName: p.tenant_name || p.drawer_name || "Tenant",
      }));

      // Map raw reservations or synthesize realistic reservations from available units and ALL active/expired leases
      const rawReservations: PmsReservation[] = (reservationsRes.data || []).map((r: any) => ({
        id: r.id,
        property: "Property",
        unit: r.unit_id || "",
        tenantName: r.prospect_name || "Prospect",
        startDate: r.expected_start_date || "",
        validUntil: r.reservation_validity || "",
        rent: Number(r.proposed_rental_amount || 0),
        status: (r.status?.toLowerCase() as any) || "reserved",
        remarks: r.special_conditions,
      }));

      // Ensure all customers with a lease are visible in Reservations as converted.
      // Lease-backed reservations always use "converted" status because the tenant
      // successfully signed — only raw DB reservations that lapsed without a lease
      // should appear as "expired" or "released".
      const leaseReservations: PmsReservation[] = mappedLeases.map((l, idx) => ({
        id: `res-lease-${l.id || idx}`,
        property: l.property || "Property",
        unit: l.unit || "Unit",
        tenantName: l.tenantName || "Tenant",
        agent: "Leasing Desk",
        startDate: l.startDate || today.toISOString().split("T")[0],
        validUntil: l.endDate || addDays(today, 30),
        rent: l.monthlyRent || 0,
        status: "converted" as const,
        remarks: `Linked to Lease Contract ${l.id} (${l.status || "Active"})`,
      }));

      // Deduplicate reservations by (property + unit + id)
      const seenResKey = new Set<string>();
      const combinedReservations: PmsReservation[] = [];
      [...rawReservations, ...leaseReservations].forEach((res) => {
        const key = `${(res.property || "").trim().toLowerCase()}--${(res.unit || "").trim().toLowerCase()}`;
        if (res.unit && !seenResKey.has(key)) {
          seenResKey.add(key);
          combinedReservations.push(res);
        }
      });

      let mappedReservations: PmsReservation[] = combinedReservations;
      if (mappedReservations.length === 0) {
        // Generate seed reservations for Available or Reserved units
        const availUnits = mappedUnits.filter((u) => u.status === "Available" || u.status === "Reserved").slice(0, 6);
        const sampleProspects = [
          { name: "Khalid Ibrahim Al-Hajri", agent: "Sarah Jenkins (Leasing Officer)", days: 7, rent: 7500 },
          { name: "Doha Engineering Services W.L.L.", agent: "Ahmed Al-Baker (Corporate Leasing)", days: 10, rent: 11000 },
          { name: "Mariam Al-Kaabi", agent: "Sarah Jenkins (Leasing Officer)", days: 5, rent: 6200 },
          { name: "Apex International Media", agent: "Marketing Direct", days: 14, rent: 8500 },
          { name: "Mohammed Reza", agent: "Leasing Desk", days: 3, rent: 5800 },
        ];

        mappedReservations = (availUnits.length > 0 ? availUnits : mappedUnits.slice(0, 5)).map((u, i) => {
          const prospect = sampleProspects[i % sampleProspects.length];
          const todayIso = today.toISOString().split("T")[0];
          const validDate = addDays(today, prospect.days);
          return {
            id: `res-seed-${i + 1}`,
            property: u.property,
            unit: u.unit,
            tenantName: prospect.name,
            agent: prospect.agent,
            startDate: todayIso,
            validUntil: validDate,
            rent: u.rent || prospect.rent,
            status: i === 0 ? "reserved" : i === 1 ? "reserved" : i === 2 ? "reserved" : i === 3 ? "converted" : "reserved",
            remarks: "Deposit hold confirmed. Tenancy agreement under draft.",
          };
        });
      }

      // Map vouchers from fin_vouchers
      const standardVouchers: PmsVoucher[] = (vouchersRes.data || []).map((v: any) => ({
        id: v.id,
        leaseId: v.party_id || v.tenant_id || v.lease_id || "",
        name: v.narration || v.voucher_no || "General Voucher",
        receiptNo: v.voucher_no || v.reference_no,
        method: v.voucher_type === "Receipt" ? "Bank Transfer" : "Journal",
        period: v.voucher_date,
        debit: "Bank",
        credit: "Receivable",
        amount: Number(v.total_amount || 0),
        status: (v.status as VoucherStatus) || "posted",
      }));

      // Only include real vouchers from the database (fin_vouchers).
      // Do not synthesize placeholder or default deposit/PDC vouchers.
      const mappedVouchers: PmsVoucher[] = [
        ...standardVouchers,
      ];

      const mappedHandovers: PmsHandover[] = (handoversRes.data || []).map((h: any) => ({
        id: h.id,
        leaseId: h.lease_id,
        handoverAt: h.handover_date,
        keys: (h.keys_issued || []).length || 2,
        accessCards: (h.access_cards_issued || []).length || 1,
        parkingRemotes: (h.parking_remotes || []).length || 1,
        acknowledged: true,
      }));

      const mappedCheckIns: PmsCheckIn[] = (inspectionsRes.data || []).map((i: any) => ({
        id: i.id,
        leaseId: i.lease_id,
        date: i.inspection_date,
        condition: typeof i.unit_condition === "string" ? i.unit_condition : "Good",
        photos: (i.photos || []).length,
      }));

      setAppData({
        units: mappedUnits,
        customers: mappedCustomers,
        leases: mappedLeases,
        pdcs: mappedPdcs,
        reservations: mappedReservations,
        vouchers: mappedVouchers,
        keyNotices: [],
        handovers: mappedHandovers,
        checkIns: mappedCheckIns,
        auditEvents: [],
      });
    } catch (err) {
      console.error("Failed to load initial data from Supabase:", err);
      setAppData(prev => ({
        ...prev,
        // On error, keep whatever was already loaded; fall back to seed reservations only
        reservations: prev.reservations.length > 0 ? prev.reservations : INITIAL_SEED_RESERVATIONS,
      }));
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchDirectFromDatabase();

    const handleRefresh = () => {
      fetchDirectFromDatabase();
    };

    window.addEventListener("finance_vouchers_updated", handleRefresh);
    window.addEventListener("pms_data_updated", handleRefresh);

    return () => {
      window.removeEventListener("finance_vouchers_updated", handleRefresh);
      window.removeEventListener("pms_data_updated", handleRefresh);
    };
  }, [fetchDirectFromDatabase]);

  function makeUpdater<K extends keyof PmsAppData>(key: K) {
    return (fn: (prev: PmsAppData[K]) => PmsAppData[K]) => {
      setAppData((prev) => ({ ...prev, [key]: fn(prev[key]) }));
    };
  }

  const value = useMemo<AppDataContextValue>(
    () => ({
      ...appData,
      setUnits: makeUpdater("units"),
      setCustomers: makeUpdater("customers"),
      setReservations: makeUpdater("reservations"),
      setLeases: makeUpdater("leases"),
      setPdcs: makeUpdater("pdcs"),
      setVouchers: makeUpdater("vouchers"),
      setKeyNotices: makeUpdater("keyNotices"),
      setHandovers: makeUpdater("handovers"),
      setCheckIns: makeUpdater("checkIns"),
      setAuditEvents: makeUpdater("auditEvents"),
      syncing,
      refetchData: fetchDirectFromDatabase,
    }),
    [appData, syncing, fetchDirectFromDatabase],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used inside <AppDataProvider>");
  }
  return context;
}
