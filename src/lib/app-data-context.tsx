import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase } from './supabase';
import { toast } from 'sonner';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES — mirrors the types in prop-mgr.leasing.tsx
// ─────────────────────────────────────────────────────────────────────────────

export type UnitStatus = 'Available' | 'Occupied' | 'Reserved' | 'Vacant - Under Maintenance';

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
  type: 'individual' | 'company';
  qatarId: string;
  passport: string;
  crNumber: string;
  mobile: string;
  email: string;
  status: 'active' | 'inactive';
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
  paymentFrequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
  gracePeriodDays: number;
  penalties: string;
  maintenanceResponsibility: string;
  utilityResponsibility: string;
  parkingDetails: string;
  specialConditions: string;
  noticePeriodDays: number;
  status: string;
  tenantSignedAt?: string;
  landlordSignedAt?: string;
  signedDocument?: string;
  receivedBy?: string;
  landlordPackageSubmittedAt?: string;
  sharedWithTenant?: boolean;
  collectionCompleted: boolean;
  renewalOf?: string;
}

export interface PmsPdc {
  id: string;
  leaseId: string;
  chequeNo: string;
  bank: string;
  date: string;
  amount: number;
  status: 'received' | 'deposited' | 'cleared' | 'bounced' | 'returned';
  payerName?: string;
  period?: string;
  file?: string;
}

export interface PmsVoucher {
  id: string;
  leaseId: string;
  name: string;
  receiptNo: string;
  method: string;
  period: string;
  debit: string;
  credit: string;
  amount: number;
  status: 'draft' | 'posted';
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
  status: 'sent' | 'blocked' | 'pending';
}

export interface PmsHandover {
  id: string;
  leaseId: string;
  handoverAt: string;
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
  status: 'reserved' | 'released' | 'expired' | 'converted';
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
  _version: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL SEED DATA
// ─────────────────────────────────────────────────────────────────────────────

const SEED_DATA: PmsAppData = {
  _version: 1,
  units: [
    { id: 'u1', property: 'Old Salata - Residence No:23', unit: 'AAA - GF2',    status: 'Available', rent: 5500 },
    { id: 'u2', property: 'Old Salata - Residence No:23', unit: 'AAA - Flat16', status: 'Occupied',  rent: 5100 },
    { id: 'u3', property: 'Old Salata - Residence No:13', unit: 'Old Salata 2 - Flat04', status: 'Available', rent: 4300 },
    { id: 'u4', property: 'Old Salata - Residence No:23', unit: 'AAA - Flat21', status: 'Occupied',  rent: 6400 },
    { id: 'u5', property: 'Regency Residence Al Sadd 1',  unit: 'ARRS01-B00-F00-AG01', status: 'Occupied', rent: 4000 },
  ],
  customers: [
    { id: 'c1', name: 'Mr. Hafeez Shaik',            type: 'individual', qatarId: 'QID-28475630123', passport: 'P9823114',  crNumber: '', mobile: '+974 5511 2200', email: 'hafeez@example.com',  status: 'active' },
    { id: 'c2', name: 'M/S. Al Ameen Real Estate',   type: 'company',    qatarId: '',                passport: '',          crNumber: 'CR-779214', mobile: '+974 4477 8800', email: 'accounts@alameen.qa', status: 'active' },
    { id: 'c3', name: 'Vivek Viswakumaran Nair',      type: 'individual', qatarId: 'QID-ARRS01-52',  passport: '',          crNumber: '', mobile: '+974 4448 5111', email: 'vivek@example.com',   status: 'active' },
  ],
  reservations: [
    { id: 'r1', property: 'Old Salata - Residence No:23', unit: 'AAA - GF2', tenantName: 'Mr. Abdullah Saleh', agent: 'Marketing Agent', startDate: '2026-08-01', validUntil: '2026-07-22', rent: 5500, status: 'reserved', remarks: 'Awaiting QID and salary certificate' },
  ],
  leases: [
    { id: 'l1', customerId: 'c1', reservationId: '', property: 'Old Salata - Residence No:23', unit: 'AAA - Flat16', tenantName: 'Mr. Hafeez Shaik', startDate: '2025-10-01', endDate: '2026-09-30', monthlyRent: 5600, securityDeposit: 5100, pdcCount: 12, paymentFrequency: 'monthly', gracePeriodDays: 5, penalties: 'Late payment penalty after grace period', maintenanceResponsibility: 'Property Manager for major repairs, tenant for misuse damages', utilityResponsibility: 'Tenant', parkingDetails: '1 parking remote and access card', specialConditions: 'Subject to landlord signature and key handover', noticePeriodDays: 60, status: 'collection_completed', tenantSignedAt: '2025-09-24', signedDocument: 'tenant-signed-lease-l1.pdf', receivedBy: 'Leasing Department', collectionCompleted: true },
    { id: 'l2', customerId: 'c2', reservationId: '', property: 'Old Salata - Residence No:23', unit: 'AAA - GF1', tenantName: 'M/S. Al Ameen Real Estate', startDate: '2025-01-01', endDate: '2026-08-31', monthlyRent: 5500, securityDeposit: 5500, pdcCount: 12, paymentFrequency: 'monthly', gracePeriodDays: 5, penalties: 'Returned cheque charges apply', maintenanceResponsibility: 'Shared as per lease clause', utilityResponsibility: 'Tenant', parkingDetails: 'Covered parking', specialConditions: 'Corporate authorized signatory required', noticePeriodDays: 60, status: 'renewal_due', tenantSignedAt: '2024-12-20', landlordSignedAt: '2024-12-22', signedDocument: 'fully-signed-lease-l2.pdf', receivedBy: 'Leasing Department', landlordPackageSubmittedAt: '2024-12-21', sharedWithTenant: true, collectionCompleted: true },
    { id: 'l3', customerId: 'c3', reservationId: '', property: 'Regency Residence Al Sadd 1', unit: 'ARRS01-B00-F00-AG01', tenantName: 'Vivek Viswakumaran Nair', startDate: '2026-01-01', endDate: '2026-12-31', monthlyRent: 4000, securityDeposit: 4000, pdcCount: 12, paymentFrequency: 'monthly', gracePeriodDays: 5, penalties: 'Returned cheque charges apply; late payment penalty after grace period', maintenanceResponsibility: 'Property Manager for major repairs', utilityResponsibility: 'Tenant', parkingDetails: 'Covered parking bay', specialConditions: 'Location code ARRS01-B00-F00-AG01; PO Box 9012', noticePeriodDays: 60, status: 'fully_signed', tenantSignedAt: '2025-12-23', landlordSignedAt: '2025-12-23', signedDocument: 'ARRS01-LES-25-52-0-signed.pdf', receivedBy: 'Ms. MerricSuibai Murla', landlordPackageSubmittedAt: '2025-12-23', sharedWithTenant: true, collectionCompleted: true },
  ],
  pdcs: [
    { id: 'p1',  leaseId: 'l1', chequeNo: 'CHQ-1001',  bank: 'QNB',   date: '2026-08-01', amount: 5600, status: 'received' },
    { id: 'p2',  leaseId: 'l1', chequeNo: 'CHQ-1002',  bank: 'QNB',   date: '2026-09-01', amount: 5600, status: 'received' },
    { id: 'p3',  leaseId: 'l2', chequeNo: 'CHQ-2001',  bank: 'Doha Bank', date: '2026-08-01', amount: 5500, status: 'deposited' },
    { id: 'p4',  leaseId: 'l3', chequeNo: '25631298',  bank: 'Cash',  date: '2025-12-23', amount: 1000, status: 'cleared' },
    { id: 'p5',  leaseId: 'l3', chequeNo: '01000069',  bank: 'CBQ',   date: '2026-01-05', amount: 1500, status: 'received' },
    { id: 'p6',  leaseId: 'l3', chequeNo: '01000070',  bank: 'CBQ',   date: '2026-02-05', amount: 1500, status: 'received' },
    { id: 'p7',  leaseId: 'l3', chequeNo: '01000049',  bank: 'CBQ',   date: '2026-01-05', amount: 4000, status: 'deposited' },
    { id: 'p8',  leaseId: 'l3', chequeNo: '01000050',  bank: 'CBQ',   date: '2026-02-05', amount: 4000, status: 'deposited' },
    { id: 'p9',  leaseId: 'l3', chequeNo: '01000059',  bank: 'CBQ',   date: '2026-03-05', amount: 4000, status: 'deposited' },
    { id: 'p10', leaseId: 'l3', chequeNo: '01000060',  bank: 'CBQ',   date: '2026-04-05', amount: 4000, status: 'deposited' },
    { id: 'p11', leaseId: 'l3', chequeNo: '01000061',  bank: 'CBQ',   date: '2026-05-05', amount: 4000, status: 'deposited' },
    { id: 'p12', leaseId: 'l3', chequeNo: '01000062',  bank: 'CBQ',   date: '2026-06-05', amount: 4000, status: 'deposited' },
    { id: 'p13', leaseId: 'l3', chequeNo: '01000063',  bank: 'CBQ',   date: '2026-07-05', amount: 4000, status: 'received' },
    { id: 'p14', leaseId: 'l3', chequeNo: '01000064',  bank: 'CBQ',   date: '2026-08-05', amount: 4000, status: 'received' },
    { id: 'p15', leaseId: 'l3', chequeNo: '01000065',  bank: 'CBQ',   date: '2026-09-05', amount: 4000, status: 'received' },
    { id: 'p16', leaseId: 'l3', chequeNo: '01000066',  bank: 'CBQ',   date: '2026-10-05', amount: 4000, status: 'received' },
    { id: 'p17', leaseId: 'l3', chequeNo: '01000067',  bank: 'CBQ',   date: '2026-11-05', amount: 4000, status: 'received' },
    { id: 'p18', leaseId: 'l3', chequeNo: '01000068',  bank: 'CBQ',   date: '2026-12-05', amount: 4000, status: 'received' },
  ],
  vouchers: [
    { id: 'v1',  leaseId: 'l1', name: 'Receipts Voucher - Rent',                        receiptNo: 'RV-2025-1001',     method: 'PDC',   period: 'Oct 2025 - Sep 2026', debit: 'PDC In Hand',    credit: 'Customer(PDC)-AAA Flat16',          amount: 67200, status: 'posted' },
    { id: 'v2',  leaseId: 'l1', name: 'Receipts Voucher - Deposit',                     receiptNo: 'RV-2025-1002',     method: 'Cash',  period: 'Security deposit',    debit: 'Cash In Hand',   credit: 'Security Deposit Liability',         amount: 5100,  status: 'posted' },
    { id: 'v3',  leaseId: 'l1', name: 'Rental Income Doc',                              receiptNo: 'RID-2025-1001',    method: 'Batch', period: 'Oct 2025',            debit: 'Receivable-AAA Flat16', credit: 'Rental Income',              amount: 5600,  status: 'draft'  },
    { id: 'v4',  leaseId: 'l3', name: 'Receipt Voucher - Security Deposit (Cash)',       receiptNo: 'ARE-RT-25-3962-0', method: 'Cash',  period: 'Security Deposit',    debit: 'Cash In Hand',   credit: 'Security Deposit Liability-AG01',    amount: 1000,  status: 'posted' },
    { id: 'v5',  leaseId: 'l3', name: 'Receipt Voucher - Security Deposit (PDC)',        receiptNo: 'ARE-RT-25-3962-1', method: 'PDC',   period: 'Security Deposit',    debit: 'PDC In Hand',    credit: 'Customer(PDC)-AG01',                 amount: 3000,  status: 'posted' },
    { id: 'v6',  leaseId: 'l3', name: 'Receipt Voucher - Rent (PDC)',                   receiptNo: 'ARE-RT-25-3962-2', method: 'PDC',   period: 'Jan 2026 - Dec 2026', debit: 'PDC In Hand',    credit: 'Customer(PDC)-AG01',                 amount: 48000, status: 'posted' },
    { id: 'v7',  leaseId: 'l3', name: 'Deposit Voucher - Jan Rent (CBQ)',               receiptNo: 'DV-L3-2601',       method: 'PDC',   period: 'Jan 2026',            debit: 'Bank Account-CBQ', credit: 'PDC In Hand',                      amount: 4000,  status: 'posted' },
    { id: 'v8',  leaseId: 'l3', name: 'Deposit Voucher - Feb Rent (CBQ)',               receiptNo: 'DV-L3-2602',       method: 'PDC',   period: 'Feb 2026',            debit: 'Bank Account-CBQ', credit: 'PDC In Hand',                      amount: 4000,  status: 'posted' },
    { id: 'v9',  leaseId: 'l3', name: 'Deposit Voucher - Mar Rent (CBQ)',               receiptNo: 'DV-L3-2603',       method: 'PDC',   period: 'Mar 2026',            debit: 'Bank Account-CBQ', credit: 'PDC In Hand',                      amount: 4000,  status: 'posted' },
    { id: 'v10', leaseId: 'l3', name: 'Deposit Voucher - Apr Rent (CBQ)',               receiptNo: 'DV-L3-2604',       method: 'PDC',   period: 'Apr 2026',            debit: 'Bank Account-CBQ', credit: 'PDC In Hand',                      amount: 4000,  status: 'posted' },
    { id: 'v11', leaseId: 'l3', name: 'Deposit Voucher - May Rent (CBQ)',               receiptNo: 'DV-L3-2605',       method: 'PDC',   period: 'May 2026',            debit: 'Bank Account-CBQ', credit: 'PDC In Hand',                      amount: 4000,  status: 'posted' },
    { id: 'v12', leaseId: 'l3', name: 'Deposit Voucher - Jun Rent (CBQ)',               receiptNo: 'DV-L3-2606',       method: 'PDC',   period: 'Jun 2026',            debit: 'Bank Account-CBQ', credit: 'PDC In Hand',                      amount: 4000,  status: 'posted' },
    { id: 'v13', leaseId: 'l3', name: 'Rental Income Doc - Jan 2026',                   receiptNo: 'RI-L3-2601',       method: 'Batch', period: 'Jan 2026',            debit: 'Receivable-AG01', credit: 'Rental Income-AG01',                 amount: 4000,  status: 'posted' },
    { id: 'v14', leaseId: 'l3', name: 'Rental Income Doc - Feb 2026',                   receiptNo: 'RI-L3-2602',       method: 'Batch', period: 'Feb 2026',            debit: 'Receivable-AG01', credit: 'Rental Income-AG01',                 amount: 4000,  status: 'posted' },
    { id: 'v15', leaseId: 'l3', name: 'Rental Income Doc - Mar 2026',                   receiptNo: 'RI-L3-2603',       method: 'Batch', period: 'Mar 2026',            debit: 'Receivable-AG01', credit: 'Rental Income-AG01',                 amount: 4000,  status: 'posted' },
    { id: 'v16', leaseId: 'l3', name: 'Rental Income Doc - Apr 2026',                   receiptNo: 'RI-L3-2604',       method: 'Batch', period: 'Apr 2026',            debit: 'Receivable-AG01', credit: 'Rental Income-AG01',                 amount: 4000,  status: 'posted' },
    { id: 'v17', leaseId: 'l3', name: 'Rental Income Doc - May 2026',                   receiptNo: 'RI-L3-2605',       method: 'Batch', period: 'May 2026',            debit: 'Receivable-AG01', credit: 'Rental Income-AG01',                 amount: 4000,  status: 'posted' },
    { id: 'v18', leaseId: 'l3', name: 'Rental Income Doc - Jun 2026',                   receiptNo: 'RI-L3-2606',       method: 'Batch', period: 'Jun 2026',            debit: 'Receivable-AG01', credit: 'Rental Income-AG01',                 amount: 4000,  status: 'posted' },
    { id: 'v19', leaseId: 'l3', name: 'Rental Income Doc - Jul 2026',                   receiptNo: 'RI-L3-2607',       method: 'Batch', period: 'Jul 2026',            debit: 'Receivable-AG01', credit: 'Rental Income-AG01',                 amount: 4000,  status: 'draft'  },
  ],
  keyNotices: [],
  handovers: [],
  checkIns: [],
  auditEvents: [
    { id: 'a1', stage: 'Receipt Generation', owner: 'Finance', input: 'Lease L1, PDC schedule, security deposit', approval: 'Cashier posting', status: 'Posted', output: 'Rent and deposit receipts available for print/email/share', at: '2025-09-24' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE SYNC — pms_app_state table (single-row JSONB store with realtime)
// ─────────────────────────────────────────────────────────────────────────────

const PMS_ROW_ID = 'pms-global-state';
const PMS_TABLE  = 'pms_app_state';

async function loadFromSupabase(): Promise<PmsAppData | null> {
  try {
    const { data, error } = await supabase
      .from(PMS_TABLE)
      .select('data')
      .eq('id', PMS_ROW_ID)
      .maybeSingle();
    if (error) { console.warn('[PMS] load error:', error.message); return null; }
    return data?.data ?? null;
  } catch { return null; }
}

async function saveToSupabase(appData: PmsAppData): Promise<void> {
  try {
    await supabase
      .from(PMS_TABLE)
      .upsert({ id: PMS_ROW_ID, data: appData, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  } catch (e: any) {
    console.warn('[PMS] save error:', e.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

interface AppDataContextValue {
  // Data
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
  // Setters — each persists to Supabase + broadcasts via realtime
  setUnits:        (fn: (prev: PmsUnit[])        => PmsUnit[])        => void;
  setCustomers:    (fn: (prev: PmsCustomer[])    => PmsCustomer[])    => void;
  setReservations: (fn: (prev: PmsReservation[]) => PmsReservation[]) => void;
  setLeases:       (fn: (prev: PmsLease[])       => PmsLease[])       => void;
  setPdcs:         (fn: (prev: PmsPdc[])         => PmsPdc[])         => void;
  setVouchers:     (fn: (prev: PmsVoucher[])     => PmsVoucher[])     => void;
  setKeyNotices:   (fn: (prev: PmsKeyNotice[])   => PmsKeyNotice[])   => void;
  setHandovers:    (fn: (prev: PmsHandover[])    => PmsHandover[])    => void;
  setCheckIns:     (fn: (prev: PmsCheckIn[])     => PmsCheckIn[])     => void;
  setAuditEvents:  (fn: (prev: PmsAuditEvent[])  => PmsAuditEvent[])  => void;
  // Status
  syncing: boolean;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [appData, setAppData] = useState<PmsAppData>(SEED_DATA);
  const [syncing, setSyncing] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initial load from Supabase ──────────────────────────────────────────
  useEffect(() => {
    loadFromSupabase().then(remote => {
      if (remote && remote._version >= SEED_DATA._version) {
        // Merge: remote takes precedence but fall back to seed for missing fields
        setAppData(prev => ({ ...prev, ...remote }));
      } else if (!remote) {
        // First boot: push seed data to Supabase
        saveToSupabase(SEED_DATA);
      }
      setSyncing(false);
    });
  }, []);

  // ── Realtime subscription — any OTHER tab/user changes arrive here ────────
  useEffect(() => {
    const channel = supabase
      .channel('pms-app-state-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: PMS_TABLE, filter: `id=eq.${PMS_ROW_ID}` },
        (payload: any) => {
          const incoming: PmsAppData | null = payload?.new?.data ?? null;
          if (incoming) {
            setAppData(incoming);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.info('[PMS] Realtime connected ✓');
        }
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ── Debounced save to Supabase (300 ms after last change) ────────────────
  const persistLater = (next: PmsAppData) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveToSupabase(next);
    }, 300);
  };

  // ── Generic updater factory ───────────────────────────────────────────────
  function makeUpdater<K extends keyof PmsAppData>(key: K) {
    return (fn: (prev: PmsAppData[K]) => PmsAppData[K]) => {
      setAppData(prev => {
        const next: PmsAppData = { ...prev, [key]: fn(prev[key] as any) as any };
        persistLater(next);
        return next;
      });
    };
  }

  const ctx: AppDataContextValue = {
    // data
    units:        appData.units,
    customers:    appData.customers,
    reservations: appData.reservations,
    leases:       appData.leases,
    pdcs:         appData.pdcs,
    vouchers:     appData.vouchers,
    keyNotices:   appData.keyNotices,
    handovers:    appData.handovers,
    checkIns:     appData.checkIns,
    auditEvents:  appData.auditEvents,
    // setters
    setUnits:        makeUpdater('units')        as any,
    setCustomers:    makeUpdater('customers')    as any,
    setReservations: makeUpdater('reservations') as any,
    setLeases:       makeUpdater('leases')       as any,
    setPdcs:         makeUpdater('pdcs')         as any,
    setVouchers:     makeUpdater('vouchers')     as any,
    setKeyNotices:   makeUpdater('keyNotices')   as any,
    setHandovers:    makeUpdater('handovers')    as any,
    setCheckIns:     makeUpdater('checkIns')     as any,
    setAuditEvents:  makeUpdater('auditEvents')  as any,
    syncing,
  };

  return (
    <AppDataContext.Provider value={ctx}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside <AppDataProvider>');
  return ctx;
}
