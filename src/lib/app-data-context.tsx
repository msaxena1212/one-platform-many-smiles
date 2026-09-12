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
  /** Settlement details — populated when status is "settled" */
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

const STORAGE_KEY = "zyno-pms-app-data-fresh-v9";
const STORAGE_VERSION = 9;

const SEED_DATA: PmsAppData = {
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


type PersistedAppData = PmsAppData & { _version: number };

function normalizeStoredData(raw: unknown): PmsAppData | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Partial<PersistedAppData>;
  if (data._version !== STORAGE_VERSION) return null;

  return {
    units: Array.isArray(data.units) ? data.units : SEED_DATA.units,
    customers: Array.isArray(data.customers) ? data.customers : SEED_DATA.customers,
    reservations: Array.isArray(data.reservations) ? data.reservations : SEED_DATA.reservations,
    leases: Array.isArray(data.leases) ? data.leases : SEED_DATA.leases,
    pdcs: Array.isArray(data.pdcs) ? data.pdcs : SEED_DATA.pdcs,
    vouchers: Array.isArray(data.vouchers) ? data.vouchers : SEED_DATA.vouchers,
    keyNotices: Array.isArray(data.keyNotices) ? data.keyNotices : SEED_DATA.keyNotices,
    handovers: Array.isArray(data.handovers) ? data.handovers : SEED_DATA.handovers,
    checkIns: Array.isArray(data.checkIns) ? data.checkIns : SEED_DATA.checkIns,
    auditEvents: Array.isArray(data.auditEvents) ? data.auditEvents : SEED_DATA.auditEvents,
  };
}

function readInitialData(): PmsAppData {
  if (typeof window === "undefined") return SEED_DATA;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_DATA;
    return normalizeStoredData(JSON.parse(raw)) ?? SEED_DATA;
  } catch {
    return SEED_DATA;
  }
}

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
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [appData, setAppData] = useState<PmsAppData>(readInitialData);
  const [syncing, setSyncing] = useState(true);

  // BroadcastChannel: enables zero-latency cross-tab sync within the same origin.
  const bcRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    setAppData(readInitialData());
    setSyncing(false);

    // Open a shared BroadcastChannel so all tabs instantly share state mutations.
    if (typeof BroadcastChannel !== "undefined") {
      const bc = new BroadcastChannel("zyno-pms-sync");
      bcRef.current = bc;
      bc.onmessage = (event) => {
        if (event.data?.type === "STATE_UPDATE" && event.data?.payload) {
          const next = normalizeStoredData(event.data.payload);
          if (next) setAppData(next);
        }
      };
      return () => { bc.close(); };
    }
  }, []);

  // Track the previous appData so we can diff before syncing to Supabase.
  const prevAppDataRef = useRef<PmsAppData | null>(null);
  // Timer ref for debouncing Supabase writes.
  const supabaseSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Build a stable sync function that diffs and only writes changed records.
  const syncChangedRecordsToSupabase = useCallback((current: PmsAppData, prev: PmsAppData | null) => {
    const now = new Date().toISOString();

    // ── Lease status sync ─────────────────────────────────────────────────
    const prevLeaseMap = new Map((prev?.leases ?? []).map(l => [l.id, l.status]));
    const changedLeases = current.leases.filter(
      l => l.status && l.status !== prevLeaseMap.get(l.id)
    );
    changedLeases.forEach(lease => {
      supabase
        .from("leases")
        .update({ lease_status: lease.status, updated_at: now })
        .eq("lease_number", lease.id)
        .then(({ error }) => {
          if (error && error.code !== "PGRST116") {
            // PGRST116 = no rows matched — safe to ignore for seed data.
            console.warn("[AppData] lease sync warn:", error.message);
          }
        });
    });

    // ── PDC status sync ───────────────────────────────────────────────────
    const prevPdcMap = new Map((prev?.pdcs ?? []).map(p => [p.chequeNo, p.status]));
    const changedPdcs = current.pdcs.filter(
      p => p.status && p.chequeNo && p.status !== prevPdcMap.get(p.chequeNo)
    );
    changedPdcs.forEach(pdc => {
      const normalizedStatus =
        pdc.status === "deposited"    ? "Deposited"    :
        pdc.status === "cleared"      ? "Cleared"      :
        pdc.status === "bounced"      ? "Returned"     :
        pdc.status === "returned"     ? "Returned"     :
        pdc.status === "replaced"     ? "Replaced"     :
        pdc.status === "cancelled"    ? "Cancelled"    :
        pdc.status === "partial_cash" || (pdc.status as string) === "Partial Cash"
          ? "Partial Cash"
          : "In Hand";
      supabase
        .from("fin_pdc_register")
        .update({ status: normalizedStatus, updated_at: now })
        .eq("cheque_number", pdc.chequeNo)
        .then(
          ({ error }) => {
            if (error && error.code !== "PGRST116" && error.code !== "42P01") {
              // Ignore non-blocking sync notices.
            }
          },
          () => {}
        );
    });
  }, []);

  // Persist to localStorage AND broadcast to other tabs on every change.
  // Supabase writes are debounced by 2 s and only fire for actually-changed records.
  useEffect(() => {
    if (typeof window === "undefined" || syncing) return;
    const payload: PersistedAppData = { ...appData, _version: STORAGE_VERSION };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    // Broadcast to other tabs via BroadcastChannel (faster than storage events).
    bcRef.current?.postMessage({ type: "STATE_UPDATE", payload });

    // ── Debounced Supabase write-through (best-effort) ────────────────────
    // Cancel any pending sync timer from a rapid previous change.
    if (supabaseSyncTimerRef.current) clearTimeout(supabaseSyncTimerRef.current);

    const snapshot = prevAppDataRef.current;
    supabaseSyncTimerRef.current = setTimeout(() => {
      syncChangedRecordsToSupabase(appData, snapshot);
      prevAppDataRef.current = appData;
    }, 2000);
  }, [appData, syncing, syncChangedRecordsToSupabase]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        const next = normalizeStoredData(JSON.parse(event.newValue));
        if (next) setAppData(next);
      } catch {
        // Ignore malformed storage updates from outside the app.
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

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
    }),
    [appData, syncing],
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
