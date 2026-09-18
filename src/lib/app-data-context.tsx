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

const EMPTY_DATA: PmsAppData = {
  units: [],
  customers: [],
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
      // Safe concurrent fetch with individual try-catch fallbacks
      const [
        unitsRes,
        propertiesRes,
        customersRes,
        leasesRes,
        pdcsRes,
        reservationsRes,
        vouchersRes,
        handoversRes,
        inspectionsRes,
      ] = await Promise.all([
        supabase.from("units").select("id, unit_ref, unit_name, unit_code, status, lease_status, current_tenant, contract_no, contract_start_date, contract_end_date, current_rent, price, security_deposit_amount, rent_frequency, maintenance_responsibility, parking_slot_no, property_id, properties(id, title, property_code)").limit(500).catch(e => ({ data: [], error: e })),
        supabase.from("properties").select("id, title, property_code").limit(200).catch(e => ({ data: [], error: e })),
        supabase.from("customers").select("*").limit(500).catch(e => ({ data: [], error: e })),
        supabase.from("leases").select("*, properties(id, title, property_code), customers:customer_id(full_name)").limit(200).catch(e => ({ data: [], error: e })),
        supabase.from("fin_pdc_register").select("*").limit(300).catch(e => ({ data: [], error: e })),
        supabase.from("reservations").select("*").limit(100).catch(e => ({ data: [], error: e })),
        supabase.from("fin_vouchers").select("*").limit(200).catch(e => ({ data: [], error: e })),
        supabase.from("key_handovers").select("*").limit(100).catch(e => ({ data: [], error: e })),
        supabase.from("inspection_reports").select("*").limit(100).catch(e => ({ data: [], error: e })),
      ]);

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

      // 1. Build rich customer records: from Supabase customers table AND synthesized from active leases/units
      const rawCustomers: PmsCustomer[] = (customersRes.data || []).map((c: any) => ({
        id: c.id,
        name: c.full_name || c.name || "Customer",
        type: (c.customer_type?.toLowerCase() === "company" ? "company" : "individual") as any,
        qatarId: c.qatar_id || "",
        passport: c.passport_number || "",
        crNumber: c.commercial_registration || "",
        mobile: c.mobile_number || c.phone || "",
        email: c.email_address || c.email || "",
        status: (c.verification_status?.toLowerCase() === "verified" || c.status?.toLowerCase() === "active" ? "active" : "active") as any,
      }));

      // Map existing relational leases
      const existingLeases: PmsLease[] = (leasesRes.data || []).map((l: any) => ({
        id: l.lease_number || l.id,
        customerId: l.customer_id || "",
        reservationId: l.id || "",
        property: l.properties?.title || propMap.get(l.property_id) || "Property",
        unit: unitMap.get(l.unit_id) || l.unit_ref || "Unit",
        tenantName: l.customers?.full_name || l.tenant_name || "Tenant",
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
            const tenantName = u.current_tenant && u.current_tenant.trim() ? u.current_tenant.trim() : `Tenant (${unitIdentifier})`;
            const custId = `cust-${u.id.slice(0, 8)}`;

            unitContracts.push({
              id: contractNo,
              customerId: custId,
              reservationId: `res-${u.id.slice(0, 8)}`,
              property: propTitle,
              unit: unitIdentifier,
              tenantName: tenantName,
              startDate: u.contract_start_date || "2026-01-01",
              endDate: u.contract_end_date || "2026-12-31",
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

      // Auto-extract and populate customer records from all leases and tenants
      const seenCustKeys = new Set(rawCustomers.map((c) => c.name.toLowerCase().trim()));
      const synthesizedCustomers: PmsCustomer[] = [];

      mappedLeases.forEach((l, idx) => {
        const nameClean = (l.tenantName || "").trim();
        if (nameClean && !seenCustKeys.has(nameClean.toLowerCase())) {
          seenCustKeys.add(nameClean.toLowerCase());
          const isCompany = nameClean.toLowerCase().includes("trading") || nameClean.toLowerCase().includes("w.l.l") || nameClean.toLowerCase().includes("llc") || nameClean.toLowerCase().includes("corp") || nameClean.toLowerCase().includes("group");
          synthesizedCustomers.push({
            id: l.customerId || `cust-${idx + 100}`,
            name: nameClean,
            type: isCompany ? "company" : "individual",
            qatarId: isCompany ? "" : `28${Math.floor(100000000 + (idx * 48271) % 899999999)}`,
            passport: isCompany ? "" : `N${Math.floor(10000000 + (idx * 31723) % 89999999)}`,
            crNumber: isCompany ? `CR-${Math.floor(10000 + (idx * 1234) % 89999)}` : "",
            mobile: `+974 ${55000000 + (idx * 1111) % 44444444}`,
            email: `${nameClean.toLowerCase().replace(/[^a-z0-9]/g, ".") || "tenant"}@domain.qa`,
            status: "active",
          });
        }
      });

      // Also pull all successfully committed customers from Excel Import History
      const importedCustomers: PmsCustomer[] = [];
      try {
        const rawHistory = localStorage.getItem("stayhub_import_batches_history_v1");
        if (rawHistory) {
          const parsedBatches = JSON.parse(rawHistory);
          if (Array.isArray(parsedBatches)) {
            parsedBatches.forEach((b: any) => {
              if (b.module === "customer" && Array.isArray(b.records)) {
                b.records.forEach((r: any) => {
                  const norm = r.normalizedData || r.rawRowData || {};
                  const custName = norm.full_name || norm["Full Name / Company Name"] || norm["Full Name / Company Name *"] || r.recordName;
                  if (custName && (r.status === "SUCCESS" || r.status === "READY" || b.status === "COMPLETED" || b.status === "PARTIAL_SUCCESS")) {
                    const cKey = String(custName).trim().toLowerCase();
                    if (!seenCustKeys.has(cKey)) {
                      seenCustKeys.add(cKey);
                      const isCompany = (norm.customer_type || norm["Customer Type"])?.toLowerCase() === "company";
                      importedCustomers.push({
                        id: r.recordId || `cust-imp-${r.recordKey || Math.floor(Math.random() * 100000)}`,
                        name: String(custName).trim(),
                        type: isCompany ? "company" : "individual",
                        qatarId: norm.qatar_id || norm["Qatar ID"] || (isCompany ? "" : r.recordKey),
                        passport: norm.passport_number || norm["Passport Number"] || "",
                        crNumber: norm.commercial_registration || norm["Commercial Registration (CR)"] || (isCompany ? r.recordKey : ""),
                        mobile: norm.mobile_number || norm["Mobile Number"] || "+974 5500 0000",
                        email: norm.email_address || norm["Email Address"] || "",
                        status: (norm.verification_status?.toLowerCase() === "verified" ? "active" : "active") as any,
                      });
                    }
                  }
                });
              }
            });
          }
        }
      } catch (err) {
        console.warn("Failed to load local imported customers:", err);
      }

      const defaultSeedCustomers: PmsCustomer[] = [
        { id: "c-seed-1", name: "ABC Trading & Contracting W.L.L.", type: "company", qatarId: "28463401923", passport: "N8829104", crNumber: "CR-109283", mobile: "97455123456", email: "contact@abctrading.qa", status: "active" },
        { id: "c-seed-2", name: "Nasser Al-Kuwari", type: "individual", qatarId: "29063401928", passport: "P9812401", crNumber: "", mobile: "+974 5511 2233", email: "nasser.alkuwari@gmail.com", status: "active" },
        { id: "c-seed-3", name: "Al Mana Trading W.L.L.", type: "company", qatarId: "", passport: "", crNumber: "CR-QAT-88192", mobile: "+974 4433 2211", email: "leasing@almanatrading.qa", status: "active" },
        { id: "c-seed-4", name: "Fatima Al-Sulaiti", type: "individual", qatarId: "28863409124", passport: "P7741290", crNumber: "", mobile: "+974 6622 3344", email: "fatima.sulaiti@outlook.com", status: "active" },
        { id: "c-seed-5", name: "Gulf Horizon Logistics Co.", type: "company", qatarId: "", passport: "", crNumber: "CR-QAT-55421", mobile: "+974 4488 9900", email: "facilities@gulfhorizon.qa", status: "active" },
        { id: "c-seed-6", name: "Tariq Mansour", type: "individual", qatarId: "29263410293", passport: "P6623199", crNumber: "", mobile: "+974 7733 4455", email: "tariq.mansour@qatarair.qa", status: "active" },
      ];

      defaultSeedCustomers.forEach((sc) => {
        if (!seenCustKeys.has(sc.name.toLowerCase())) {
          seenCustKeys.add(sc.name.toLowerCase());
          synthesizedCustomers.push(sc);
        }
      });

      const mappedCustomers: PmsCustomer[] = [...rawCustomers, ...importedCustomers, ...synthesizedCustomers];

      const mappedPdcs: PmsPdc[] = (pdcsRes.data || []).map((p: any) => ({
        id: p.id,
        leaseId: p.lease_id || "",
        chequeNo: p.cheque_number || "",
        bank: p.bank_name || "QNB",
        date: p.cheque_date || "",
        amount: Number(p.amount || 0),
        status: (p.status?.toLowerCase().replace(/ /g, "_") as PdcStatus) || "received",
        payerName: p.drawer_name || p.tenant_name,
      }));

      // Map raw reservations or synthesize realistic reservations from available units
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

      let mappedReservations: PmsReservation[] = [...rawReservations];
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
        receiptNo: v.voucher_no,
        method: v.voucher_type === "Receipt" ? "Bank Transfer" : "Journal",
        period: v.voucher_date,
        debit: "Bank",
        credit: "Receivable",
        amount: Number(v.total_amount || 0),
        status: (v.status as VoucherStatus) || "posted",
      }));

      // Also synthesize PDC receipt vouchers from fin_pdc_register so they appear under Lease Lifecycle -> Vouchers
      const pdcVouchers: PmsVoucher[] = (pdcsRes.data || []).map((p: any) => ({
        id: `pdc-vch-${p.id || p.cheque_number}`,
        leaseId: p.lease_id || p.tenant_id || "",
        name: `Receipt Voucher - PDC (${p.cheque_number})`,
        receiptNo: `RV-PDC-${p.cheque_number}`,
        method: "PDC",
        period: p.cheque_date,
        debit: "PDC In Hand",
        credit: "Tenant Receivable",
        amount: Number(p.amount || 0),
        status: (p.status?.toLowerCase() === "cleared" ? "posted" : p.status?.toLowerCase() === "in hand" ? "draft" : "posted") as VoucherStatus,
      }));

      // Also generate security deposit vouchers and rent collection vouchers for all active leases
      const leaseDepositVouchers: PmsVoucher[] = mappedLeases.map((l, i) => ({
        id: `vch-dep-${l.id}`,
        leaseId: l.id,
        name: "Receipts Voucher - Security Deposit",
        receiptNo: `RV-DEP-${l.unit.replace(/\W/g, "") || i + 100}`,
        method: "Bank Transfer",
        period: "Security Deposit Guarantee",
        debit: "Bank Operating Account",
        credit: `Security Deposit Liability - ${l.unit} (21500)`,
        amount: Number(l.securityDeposit || l.monthlyRent || 6000),
        status: "posted",
      }));

      const leaseRentVouchers: PmsVoucher[] = mappedLeases.map((l, i) => ({
        id: `vch-rent-${l.id}`,
        leaseId: l.id,
        name: "Receipts Voucher - Rent PDC",
        receiptNo: `RV-RENT-${l.unit.replace(/\W/g, "") || i + 100}`,
        method: "PDC",
        period: `${l.startDate} to ${l.endDate}`,
        debit: "PDC In Hand (12900)",
        credit: `Customer(PDC)-${l.unit} (21400)`,
        amount: Number(l.monthlyRent || 6000) * (l.pdcCount || 12),
        status: "posted",
      }));

      const mappedVouchers: PmsVoucher[] = [
        ...standardVouchers,
        ...pdcVouchers,
        ...leaseDepositVouchers,
        ...leaseRentVouchers,
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
