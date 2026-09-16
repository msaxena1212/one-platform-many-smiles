import { createContext, useContext, useEffect, useMemo, useState, useRef, useCallback, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";

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
      // Fetch concurrently from PostgreSQL tables
      const [
        unitsRes,
        customersRes,
        leasesRes,
        pdcsRes,
        reservationsRes,
        vouchersRes,
        handoversRes,
        inspectionsRes,
      ] = await Promise.all([
        supabase.from("units").select("id, unit_number, status, rent_amount, property_id, properties(title)").limit(200),
        supabase.from("customer_masters").select("id, full_name, customer_type, qatar_id, passport_no, commercial_registration_no, mobile, email, verification_status").limit(200),
        supabase.from("leases").select("*, properties(title), units(unit_number), customers:customer_id(full_name)").limit(200),
        supabase.from("fin_pdc_register").select("*").limit(300),
        supabase.from("reservations").select("*").limit(100),
        supabase.from("fin_vouchers").select("*").limit(200),
        supabase.from("key_handovers").select("*").limit(100),
        supabase.from("inspection_reports").select("*").limit(100),
      ]);

      const mappedUnits: PmsUnit[] = (unitsRes.data || []).map((u: any) => ({
        id: u.id,
        property: u.properties?.title || "Property",
        unit: u.unit_number || "Unit",
        status: (u.status as UnitStatus) || "Available",
        rent: Number(u.rent_amount || 0),
      }));

      const mappedCustomers: PmsCustomer[] = (customersRes.data || []).map((c: any) => ({
        id: c.id,
        name: c.full_name || "Customer",
        type: c.customer_type === "Company" ? "company" : "individual",
        qatarId: c.qatar_id || "",
        passport: c.passport_no || "",
        crNumber: c.commercial_registration_no || "",
        mobile: c.mobile || "",
        email: c.email || "",
        status: "active",
      }));

      const mappedLeases: PmsLease[] = (leasesRes.data || []).map((l: any) => ({
        id: l.lease_number || l.id,
        customerId: l.customer_id || "",
        reservationId: l.id || "",
        property: l.properties?.title || "Property",
        unit: l.units?.unit_number || l.unit_ref || "Unit",
        tenantName: l.customers?.full_name || l.tenant_name || "Tenant",
        startDate: l.commencement_date || "",
        endDate: l.expiry_date || "",
        monthlyRent: Number(l.rental_amount || 0),
        securityDeposit: Number(l.security_deposit || 0),
        pdcCount: Number(l.number_of_pdc || 0),
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

      const mappedReservations: PmsReservation[] = (reservationsRes.data || []).map((r: any) => ({
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

      const mappedVouchers: PmsVoucher[] = (vouchersRes.data || []).map((v: any) => ({
        id: v.id,
        leaseId: v.party_id || "",
        name: v.narration || v.voucher_no,
        receiptNo: v.voucher_no,
        debit: "Bank",
        credit: "Receivable",
        amount: Number(v.total_amount || 0),
        status: (v.status as VoucherStatus) || "posted",
      }));

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
