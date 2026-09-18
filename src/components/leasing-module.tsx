import { useRouterState, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExcelImportEmbedded } from "@/components/excel-import-embedded";
import { BulkPdcDepositModal } from "@/components/leasing/bulk-pdc-deposit-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useAppData } from "@/lib/app-data-context";
import { fetchAssets, updateAsset, supabase, type Asset as SupabaseAsset } from "@/lib/supabase";
import { generateLeaseAgreementBlob } from "@/components/lease-agreement-template";
import { getTodayIST, getCurrentISTDate, formatDateDDMMYYYY } from "@/lib/date-utils";
import { DynamicMastersService } from "@/lib/dynamic-masters-service";
import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  Bell,
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  CreditCard,
  DoorOpen,
  Download,
  FileCheck,
  FileCheck2,
  FileSignature,
  FileSpreadsheet,
  Key,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Percent,
  Printer,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
  XCircle,
  FileUp,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  customerIdentityMasters,
  documentVerificationMasters,
  keyHandoverMasters,
  leaseLifecycleSteps,
  leaseStatusMasters,
  reservationStatusMasters,
  securitySettlementMasters,
  voucherDocumentMasters,
} from "@/lib/reference-data";
import { ReceiptModal, type TenantReceiptDetails } from "@/components/receipt-modal";
import { useFinanceStore } from "@/lib/finance/finance-store";
import { executeFinalSettlement, settleEarlyLeaseVacate } from "@/lib/finance/settlement-engine";
import { collectSecurityDeposit } from "@/lib/finance/depositService";
import { receivePdc } from "@/lib/finance/pdcService";
import { postGuaranteeCheque } from "@/lib/finance/posting-engine";


type ReservationStatus = "reserved" | "converted" | "expired" | "released";
type CustomerStatus = "draft" | "active" | "duplicate";
type VerificationStatus = "pending" | "verified" | "rejected" | "info_required";
type LeaseStatus =
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
type PdcStatus = "received" | "deposited" | "cleared" | "returned" | "replaced" | "cancelled";

type Unit = {
  id: string;
  property: string;
  unit: string;
  status: "Available" | "Reserved" | "Occupied" | "Vacant - Under Maintenance";
  rent: number;
};

type Customer = {
  id: string;
  name: string;
  type: "individual" | "company";
  qatarId: string;
  passport: string;
  crNumber: string;
  nationality?: string;
  mobile: string;
  email: string;
  permanentAddress?: string;
  localAddress?: string;
  authorizedSignatory?: string;
  emergencyContact?: string;
  employerInfo?: string;
  status: CustomerStatus;
};

type Reservation = {
  id: string;
  property: string;
  unit: string;
  tenantName: string;
  agent?: string;
  startDate: string;
  validUntil: string;
  rent: number;
  status: ReservationStatus;
  remarks?: string;
  proposedEndDate?: string;
};

type TenantDocument = {
  id: string;
  customerId: string;
  name: string;
  mandatory: boolean;
  status: VerificationStatus;
  expiryDate: string;
  reviewer: string;
  remarks: string;
  file?: string;
};

type Lease = {
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
  paymentFrequency: "monthly" | "quarterly" | "half_yearly" | "yearly" | "semi-annual" | "annual";
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
};

type Pdc = {
  id: string;
  leaseId: string;
  chequeNo: string;
  bank: string;
  date: string;
  amount: number;
  status: PdcStatus;
  payerName?: string;
  period?: string;
  file?: string;
};

type PdcRow = {
  chequeNo: string;
  bank: string;
  amount: string;
  maturityDate: string;
  file: string;
};

type KeyNotice = {
  id: string;
  leaseId: string;
  recipient: string;
  handoverAt: string;
  handoverTime?: string;
  status: "ready" | "sent" | "blocked";
  note: string;
  authorizedCollector?: string;
  keysSummary?: string;
  staffContact?: string;
  outstandingRequirements?: string;
};

type KeyHandover = {
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
  acknowledged: boolean;
  issuedBy?: string;
  collectorName?: string;
  collectorIdNumber?: string;
  tenantAcknowledgement?: string;
  note?: string;
};

type Inspection = {
  id: string;
  leaseId: string;
  type: "check_in" | "check_out";
  condition: string;
  furnitureCondition?: string;
  fixturesCondition?: string;
  wallFloorCeilingCondition?: string;
  acCondition?: string;
  electricityMeter: string;
  waterMeter: string;
  damages: string;
  pendingMaintenance?: string;
  acknowledged: boolean;
  photos: number;
};

type RenewalCase = {
  id: string;
  leaseId: string;
  noticeDate: string;
  status: "awaiting_response" | "under_discussion" | "renewal_confirmed" | "non_renewal_confirmed";
  proposedRent: number;
  proposedPeriod: string;
  revisedTerms: string;
  expiryDate?: string;
  requiredNoticePeriod?: string;
  lastConfirmationDate: string;
  outstandingObligations: string;
  recipients: string;
  followUpOwner?: string;
};

type CheckoutCase = {
  id: string;
  leaseId: string;
  noticeDate: string;
  nonRenewalNotice?: string;
  moveOutDate: string;
  originalLeaseEndDate?: string;
  earlyVacate?: boolean;
  inspectionDate: string;
  comparisonSummary: string;
  outstandingCharges?: string;
  keyReturnRequirements?: string;
  utilityClearanceRequirements?: string;
  financeClearance: boolean;
  utilityClearance: boolean;
  keysReturned: boolean;
  status: "planned" | "inspection_done" | "ready_for_settlement" | "closed";
};

type Settlement = {
  id: string;
  leaseId: string;
  depositReceived: number;
  outstandingRent: number;
  damages: number;
  utilityCharges: number;
  cleaningCharges: number;
  restorationCharges: number;
  otherDeductions: number;
  daysOccupiedInMonth?: number;
  totalDaysInMonth?: number;
  currentMonthPdcDeposited?: boolean;
  unusedRentRefund?: number;
  refundableBalance?: number;
  unitDisposition?: Unit["status"];
  approval: "draft" | "pending_approval" | "approved" | "paid";
  settlementMode?: "DEDUCT_FROM_DEPOSIT" | "PAY_SEPARATELY";
  damagePaymentMode?: "Bank Transfer" | "Cash" | "Cheque" | "Bank Guarantee";
  paymentProofUrl?: string;
  paymentProofFileName?: string;
  paymentRefNo?: string;
  payerBank?: string;
  paymentDate?: string;
  bgExpiryDate?: string;
};

type Voucher = {
  id: string;
  leaseId: string;
  name: string;
  receiptNo?: string;
  method?: string;
  period?: string;
  debit: string;
  credit: string;
  amount: number;
  status: "draft" | "posted" | "shared";
};

type AuditEvent = {
  id: string;
  stage: string;
  owner: string;
  input: string;
  approval: string;
  status: string;
  output: string;
  at: string;
};

const today = getCurrentISTDate();

const initialUnits: Unit[] = [];


function createSampleAssetsForUnits(units: Unit[]) {
  const categories = ["Furniture", "Electronics", "Appliance", "Safety", "Housekeeping", "IT"];
  return units.flatMap((unit) => {
    const list = Array.from({ length: 20 }, (_, index) => {
      const category = categories[index % categories.length];
      const isPropertyOnly = index < 3;
      return {
        id: `demo-${unit.id}-${index + 1}`,
        asset_name: index === 0 ? "Executive Wooden Desk & Table" : `${category} Item ${index + 1}`,
        asset_code: index === 0 ? "FUR-TAB-1775" : `${unit.unit.replace(/\W/g, "").slice(0, 10).toUpperCase()}-${index + 1}`,
        category: index === 0 ? "Furniture" : category,
        asset_condition: index % 5 === 0 ? "Fair" : "Good",
        remarks: index % 5 === 0 ? "Needs attention" : "Operational",
        assigned_property_id: unit.id,
        assigned_property_code: unit.property,
        assigned_unit_id: unit.id,
        assigned_unit_code: unit.unit,
        created_at: today.toISOString(),
        updated_at: today.toISOString(),
      } as SupabaseAsset;
    });
    return list;
  });
}

const initialCustomers: Customer[] = [];


const initialReservations: Reservation[] = [];


const initialDocuments: TenantDocument[] = [];


const initialLeases: Lease[] = [];

const initialPdcs: Pdc[] = [];

const initialVouchers: Voucher[] = [];


function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().split("T")[0];
}

function isExpired(date: string) {
  if (!date) return false;
  const d = new Date(date);
  return !isNaN(d.getTime()) && d < today;
}

function formatMoney(value: number | string | undefined | null) {
  return `QR ${Number(value || 0).toLocaleString()}`;
}

function getVoucherAccounts(name: string, unit: string, method?: string) {
  const cleanUnit = unit || "Unit Account";
  if (name.includes("Deposit Voucher - PDC") || name.includes("Deposit Voucher (PDC)") || name.includes("Deposit - Rent") || name.includes("Deposit Voucher")) {
    // Deposit Voucher - PDC: Dr Bank Account, Cr PDC In Hand / Dr Customer(PDC)-Unit Account, Cr Receivable-Unit Account
    return { debit: "Bank Account", credit: "PDC In Hand", drAr: `Customer(PDC)-${cleanUnit}`, crAr: `Receivable-${cleanUnit}` };
  }
  if (name.includes("Deposit Voucher - Cash")) {
    // Deposit Voucher - Cash: Dr Bank Account, Cr Cash In Hand
    return { debit: "Bank Account", credit: "Cash In Hand" };
  }
  if (name.includes("Receipts Voucher - Deposit") || name.includes("Security Deposit") || name.includes("Receipt Voucher - Security Deposit")) {
    // Receipts Voucher - Deposit: Dr Cash In Hand, Cr Deposit-Customer-Unit Account (or Security Deposit Liability)
    const dr = method === "Bank Transfer" ? "Bank Account" : method === "PDC" ? "PDC In Hand" : "Cash In Hand";
    return { debit: dr, credit: `Deposit-Customer-${cleanUnit}` };
  }
  if (name.includes("Rental Income") || name.includes("Rent Income") || name.includes("Revenue Generation")) {
    // Revenue Generation (Single or Batch): Dr Receivable-Unit Account, Cr Rental Income
    return { debit: `Receivable-${cleanUnit}`, credit: "Rental Income" };
  }
  if (name.includes("Payment Voucher") || name.includes("Payment")) {
    return { debit: "Payable Account", credit: "Bank Account" };
  }
  if (name.includes("Cheque Return") || name.includes("Cheque Returned")) {
    // Cheque Returned Voucher: Dr PDC In Hand, Cr Bank Account / Dr Receivable-Unit Account, Cr Customer(PDC)-Unit Account
    return { debit: "PDC In Hand", credit: "Bank Account", drAr: `Receivable-${cleanUnit}`, crAr: `Customer(PDC)-${cleanUnit}` };
  }
  // Default: Receipts Voucher - Rent: Dr PDC In Hand (or Cash/Bank), Cr Customer(PDC)-Unit Account
  const dr = method === "Cash" ? "Cash In Hand" : method === "Bank Transfer" ? "Bank Account" : "PDC In Hand";
  return { debit: dr, credit: `Customer(PDC)-${cleanUnit}` };
}

function LeasingPage({ role }: { role?: "admin" | "prop-mgr" | "leasing" }) {
  const routerState = useRouterState();
  const navigate = useNavigate();
  const currentPath = routerState.location.pathname;
  const searchParams = new URLSearchParams(routerState.location.searchStr);
  const activeTab = searchParams.get("tab") || "customers";

  const handleTabChange = (val: string) => {
    const targetRoute = currentPath.startsWith("/admin") 
      ? "/admin/leases" 
      : currentPath.startsWith("/leasing") 
        ? "/leasing/create" 
        : "/prop-mgr/leasing";

    navigate({
      to: targetRoute as any,
      search: { tab: val } as any,
    });
  };

  const {
    units,
    setUnits,
    customers,
    setCustomers,
    reservations,
    setReservations,
    leases,
    setLeases,
    pdcs,
    setPdcs,
    vouchers,
    setVouchers,
    keyNotices,
    setKeyNotices,
    handovers,
    setHandovers,
    auditEvents,
    setAuditEvents,
    refetchData,
  } = useAppData();
  const { addCashBookEntry, addVoucher: addFinanceStoreVoucher } = useFinanceStore();
  const [documents, setDocuments] = useState<TenantDocument[]>(initialDocuments);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [renewals, setRenewals] = useState<RenewalCase[]>([]);
  const [checkouts, setCheckouts] = useState<CheckoutCase[]>(() => {
    try {
      const saved = localStorage.getItem("pms_checkout_cases_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [settlements, setSettlements] = useState<Settlement[]>(() => {
    try {
      const saved = localStorage.getItem("pms_settlement_cases_v2");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [busyAction, setBusyAction] = useState("");

  // Filter states for Checkout & Settlement tab
  const [checkoutPropertyFilter, setCheckoutPropertyFilter] = useState("all");
  const [checkoutUnitFilter, setCheckoutUnitFilter] = useState("all");
  const [checkoutCustomerFilter, setCheckoutCustomerFilter] = useState("all");
  const [checkoutStatusFilter, setCheckoutStatusFilter] = useState("all");
  const [checkoutSearchQuery, setCheckoutSearchQuery] = useState("");

  // Filter states for Vouchers tab
  const [voucherPropertyFilter, setVoucherPropertyFilter] = useState("all");
  const [voucherUnitFilter, setVoucherUnitFilter] = useState("all");
  const [voucherCustomerFilter, setVoucherCustomerFilter] = useState("all");
  const [voucherMethodFilter, setVoucherMethodFilter] = useState("all");
  const [voucherStatusFilter, setVoucherStatusFilter] = useState("all");
  const [voucherSearchQuery, setVoucherSearchQuery] = useState("");

  // Synchronize KYC documents for all customers
  useEffect(() => {
    if (!customers || customers.length === 0) return;
    setDocuments((prev) => {
      const updated = [...prev];
      let changed = false;
      customers.forEach((customer) => {
        const requiredDocs = customer.type === "company"
          ? ["Commercial Registration (CR)", "Computer Card (Establishment ID)", "Authorized Signatory QID", "Company Municipal License"]
          : ["Qatar ID (QID) - Front & Back", "Passport Copy", "Salary Certificate / Employment Letter", "Bank Statement (3 Months)"];

        requiredDocs.forEach((docName, idx) => {
          const docId = `doc-${customer.id}-${idx + 1}`;
          const exists = updated.some((d) => d.id === docId || (d.customerId === customer.id && d.name === docName));
          if (!exists) {
            const isVerified = idx === 0 || idx === 1;
            updated.push({
              id: docId,
              customerId: customer.id,
              name: docName,
              mandatory: idx < 3,
              status: isVerified ? "verified" : idx === 2 ? "pending" : "info_required",
              expiryDate: isVerified ? "2027-12-31" : "",
              reviewer: isVerified ? "Compliance Officer" : "",
              remarks: isVerified ? "Official document verified against MOI / MOCI database" : "Awaiting document upload",
              file: isVerified ? `${customer.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${docName.toLowerCase().replace(/[^a-z0-9]/g, "_")}.pdf` : undefined,
            });
            changed = true;
          }
        });
      });
      return changed ? updated : prev;
    });
  }, [customers]);

  // Synchronize renewals for upcoming expiring leases
  useEffect(() => {
    if (!leases || leases.length === 0) return;
    setRenewals((prev) => {
      const updated = [...prev];
      let changed = false;
      leases.forEach((lease, idx) => {
        const exists = updated.some((r) => r.leaseId === lease.id);
        if (!exists) {
          const proposedRent = Math.round((lease.monthlyRent || 6000) * 1.05);
          const noticeDate = today instanceof Date ? today.toISOString().split("T")[0] : "2026-09-01";
          const lastConfDate = lease.endDate ? addDays(new Date(lease.endDate), -30) : "2026-11-30";
          updated.push({
            id: `rnw-${lease.id}`,
            leaseId: lease.id,
            noticeDate: noticeDate,
            status: idx % 3 === 0 ? "awaiting_response" : idx % 3 === 1 ? "under_discussion" : "renewal_confirmed",
            proposedRent: proposedRent,
            proposedPeriod: "12 Months (1 Year Extension)",
            revisedTerms: "5% rent revision; notice period 60 days retained",
            expiryDate: lease.endDate || "2026-12-31",
            requiredNoticePeriod: "60 Days",
            lastConfirmationDate: lastConfDate,
            outstandingObligations: "None - All PDCs cleared to date",
            recipients: `${lease.tenantName} (Primary), leasing@property.qa`,
            followUpOwner: "Leasing Department",
          });
          changed = true;
        }
      });
      return changed ? updated : prev;
    });
  }, [leases]);

  // Synchronize closed, checkout, or early-vacated leases with checkouts and settlements
  useEffect(() => {
    if (!leases || leases.length === 0) return;

    setCheckouts((prev) => {
      const updated = [...prev];
      let changed = false;
      
      // Ensure at least 3-4 realistic checkout records exist for preview
      leases.forEach((lease, idx) => {
        const isEligible = lease.status === "closed" || lease.status === "checkout" || (lease as any).earlyVacate || idx < 3;
        if (isEligible) {
          const exists = updated.some((c) => c.leaseId === lease.id);
          if (!exists) {
            const vDate = (lease as any).actualVacateDate || (lease as any).plannedVacateDate || lease.endDate || (today instanceof Date ? today.toISOString().split("T")[0] : "2026-09-30");
            updated.push({
              id: `chk-${lease.id}`,
              leaseId: lease.id,
              noticeDate: vDate,
              moveOutDate: vDate,
              inspectionDate: vDate,
              comparisonSummary: idx === 0 ? "Normal wear separated from tenant-caused damages." : "Move-out inspection completed. Unit vacated.",
              financeClearance: idx !== 1,
              utilityClearance: true,
              keysReturned: true,
              status: idx === 0 ? "ready_for_settlement" : idx === 1 ? "inspection_done" : "closed",
            });
            changed = true;
          }
        }
      });
      if (changed) {
        try { localStorage.setItem("pms_checkout_cases_v2", JSON.stringify(updated)); } catch {}
      }
      return updated;
    });

    setSettlements((prev) => {
      const updated = [...prev];
      let changed = false;
      leases.forEach((lease, idx) => {
        const isEligible = lease.status === "closed" || lease.status === "checkout" || (lease as any).earlyVacate || idx < 3;
        if (isEligible) {
          const exists = updated.some((s) => s.leaseId === lease.id);
          if (!exists) {
            const dep = Number(lease.securityDeposit) || 6500;
            const dmg = idx === 0 ? 500 : 0;
            const cln = idx === 0 ? 300 : 0;
            const totalDeductions = dmg + cln;
            const refundable = Math.max(0, dep - totalDeductions);
            updated.push({
              id: `set-${lease.id}`,
              leaseId: lease.id,
              depositReceived: dep,
              outstandingRent: 0,
              damages: dmg,
              utilityCharges: 0,
              cleaningCharges: cln,
              restorationCharges: 0,
              otherDeductions: 0,
              refundableBalance: refundable,
              approval: idx === 2 ? "paid" : "pending_approval",
              settlementMode: "DEDUCT_FROM_DEPOSIT",
            });
            changed = true;
          }
        }
      });
      if (changed) {
        try { localStorage.setItem("pms_settlement_cases_v2", JSON.stringify(updated)); } catch {}
      }
      return updated;
    });
  }, [leases]);

  const [realUnits, setRealUnits] = useState<Unit[]>([]);
  useEffect(() => {
    async function fetchRealUnits() {
      try {
        const { supabase } = await import('@/lib/supabase');
        const [{ data: props }, { data: uns }] = await Promise.all([
          supabase.from('properties').select('id, title'),
          supabase.from('units').select('*')
        ]);
        if (props && uns) {
          const propMap = new Map(props.map((p: any) => [p.id, p.title]));
          setRealUnits(uns.map((u: any) => ({
            id: u.id,
            property: propMap.get(u.property_id) || "Unknown Property",
            unit: u.unit_ref,
            status: u.status === "available" ? "Available" : u.status === "occupied" ? "Occupied" : u.status === "maintenance" ? "Vacant - Under Maintenance" : "Available",
            rent: Number(u.price || 0)
          })));
        }
      } catch (e) {
        console.error("Failed to load real units", e);
      }
    }
    fetchRealUnits();
  }, []);

  // Supabase Realtime: subscribe to lease status changes from any session.
  useEffect(() => {
    let channel: any = null;
    import('@/lib/supabase').then(({ supabase }) => {
      channel = supabase
        .channel(`leasing-page:leases:${Math.random().toString(36).substring(2, 9)}`)
        .on(
          "postgres_changes" as any,
          { event: "UPDATE", schema: "public", table: "leases" },
          (payload: any) => {
            const updated = payload.new;
            if (!updated?.lease_number) return;
            // Map the Supabase lease_status back into the local context lease.
            setLeases(prev => prev.map(l =>
              l.id === updated.lease_number
                ? { ...l, status: updated.lease_status ?? l.status }
                : l
            ));
          }
        )
        .subscribe();
    });
    return () => {
      if (channel) {
        import('@/lib/supabase').then(({ supabase }) => {
          supabase.removeChannel(channel);
        });
      }
    };
  }, []);

  // ── Customer Dialog States ────────────────────────────────────
  const [viewCustomerOpen, setViewCustomerOpen] = useState(false);
  const [viewCustomerData, setViewCustomerData] = useState<Customer | null>(null);
  const [editCustomerOpen, setEditCustomerOpen] = useState(false);
  const [editCustomerData, setEditCustomerData] = useState<Customer | null>(null);

  // ── Bulk Importer States ───────────────────────────────────────
  const [bulkCustomerOpen, setBulkCustomerOpen] = useState(false);
  const [bulkCustomerCsv, setBulkCustomerCsv] = useState("");
  const [bulkLeaseOpen, setBulkLeaseOpen] = useState(false);
  const [bulkLeaseCsv, setBulkLeaseCsv] = useState("");
  const [bulkPdcOpen, setBulkPdcOpen] = useState(false);
  const [bulkPdcCsv, setBulkPdcCsv] = useState("");
  const [bulkDepositOpen, setBulkDepositOpen] = useState(false);
  const [bulkDepositCsv, setBulkDepositCsv] = useState("");
  const [bulkLeasingImporting, setBulkLeasingImporting] = useState(false);

  const downloadCustomerTemplate = () => {
    const headers = "CustomerName,CustomerType,QatarId,Passport,CrNumber,Mobile,Email,Status";
    const sample = "Nasser Al-Kuwari,individual,29063401928,,+974 5511 2233,nasser@example.qa,active\nAl Mana Trading W.L.L.,company,,,CR-QAT-88192,+974 4433 2211,leasing@almana.qa,active";
    const blob = new Blob([headers + "\n" + sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "bulk_customers_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Customer CSV Template downloaded!");
  };

  const handleBulkCustomerImport = () => {
    if (!bulkCustomerCsv.trim()) {
      toast.error("Please paste CSV data.");
      return;
    }
    setBulkLeasingImporting(true);
    try {
      const lines = bulkCustomerCsv.trim().split("\n");
      if (lines.length <= 1) {
        toast.error("CSV must contain at least 1 customer row.");
        return;
      }
      const dataRows = lines.slice(1);
      const newItems: Customer[] = [];
      dataRows.forEach((row, idx) => {
        const cols = row.split(",").map(c => c.trim().replace(/^"|"$/g, ''));
        if (!cols[0]) return;
        const [name, ctype, qid, passport, cr, mob, em, st] = cols;
        newItems.push({
          id: `c-bulk-${Date.now()}-${idx}`,
          name,
          type: (ctype?.toLowerCase() === "company" ? "company" : "individual") as Customer["type"],
          qatarId: qid || "",
          passport: passport || "",
          crNumber: cr || "",
          mobile: mob || "+974 5500 0000",
          email: em || "tenant@example.qa",
          status: (st || "active") as CustomerStatus,
        });
      });
      setCustomers(prev => [...newItems, ...prev]);
      toast.success(`Successfully imported ${newItems.length} customers!`);
      setBulkCustomerOpen(false);
      setBulkCustomerCsv("");
    } catch (e: any) {
      toast.error("Failed customer import: " + e.message);
    } finally {
      setBulkLeasingImporting(false);
    }
  };

  const downloadLeaseTemplate = () => {
    const headers = "TenantName,Property,Unit,StartDate,EndDate,MonthlyRent,SecurityDeposit,PdcCount,PaymentFrequency";
    const sample = "Nasser Al-Kuwari,Al Sadd Commercial Tower,Unit 101,2026-01-01,2026-12-31,6500,6500,12,monthly\nAl Mana Trading W.L.L.,Lusail Marina Residences,Unit 204,2026-02-01,2027-01-31,8000,8000,12,monthly";
    const blob = new Blob([headers + "\n" + sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "bulk_leases_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Lease CSV Template downloaded!");
  };

  const handleBulkLeaseImport = () => {
    if (!bulkLeaseCsv.trim()) {
      toast.error("Please paste CSV data.");
      return;
    }
    setBulkLeasingImporting(true);
    try {
      const lines = bulkLeaseCsv.trim().split("\n");
      if (lines.length <= 1) {
        toast.error("CSV must contain at least 1 lease row.");
        return;
      }
      const dataRows = lines.slice(1);
      const newItems: Lease[] = [];
      dataRows.forEach((row, idx) => {
        const cols = row.split(",").map(c => c.trim().replace(/^"|"$/g, ''));
        if (!cols[0]) return;
        const [tenant, prop, unit, start, end, rent, dep, pdcCnt, freq] = cols;
        const matchedCust = customers.find(c => c.name.toLowerCase() === tenant.toLowerCase());
        newItems.push({
          id: `L-BULK-${Date.now().toString().slice(-4)}-${idx + 1}`,
          customerId: matchedCust ? matchedCust.id : `c-gen-${Date.now()}`,
          reservationId: "",
          property: prop || "Main Portfolio",
          unit: unit || "101",
          tenantName: tenant,
          startDate: start || today.toISOString().split("T")[0],
          endDate: end || addDays(today, 365),
          monthlyRent: Number(rent) || 6000,
          securityDeposit: Number(dep) || Number(rent) || 6000,
          pdcCount: Number(pdcCnt) || 12,
          paymentFrequency: (freq || "monthly") as Lease["paymentFrequency"],
          gracePeriodDays: 5,
          penalties: "Standard late penalties apply",
          maintenanceResponsibility: "Property Manager for major repairs",
          utilityResponsibility: "Tenant",
          parkingDetails: "1 Covered Space",
          specialConditions: "",
          noticePeriodDays: 60,
          status: "active",
          collectionCompleted: true,
        });
      });
      setLeases(prev => [...newItems, ...prev]);
      toast.success(`Successfully imported ${newItems.length} leases!`);
      setBulkLeaseOpen(false);
      setBulkLeaseCsv("");
    } catch (e: any) {
      toast.error("Failed lease import: " + e.message);
    } finally {
      setBulkLeasingImporting(false);
    }
  };

  const downloadPdcTemplate = () => {
    const headers = "LeaseId,ChequeNumber,BankName,MaturityDate,Amount,PayerName";
    const sample = "L-1001,PDC-889901,Qatar National Bank (QNB),2026-03-01,6500,Nasser Al-Kuwari\nL-1001,PDC-889902,Qatar National Bank (QNB),2026-04-01,6500,Nasser Al-Kuwari";
    const blob = new Blob([headers + "\n" + sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "bulk_pdcs_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("PDC CSV Template downloaded!");
  };

  const handleBulkPdcImport = () => {
    if (!bulkPdcCsv.trim()) {
      toast.error("Please paste CSV data.");
      return;
    }
    setBulkLeasingImporting(true);
    try {
      const lines = bulkPdcCsv.trim().split("\n");
      if (lines.length <= 1) {
        toast.error("CSV must contain at least 1 PDC row.");
        return;
      }
      const dataRows = lines.slice(1);
      const newItems: Pdc[] = [];
      dataRows.forEach((row, idx) => {
        const cols = row.split(",").map(c => c.trim().replace(/^"|"$/g, ''));
        if (!cols[0]) return;
        const [leaseId, chqNo, bank, mDate, amt, payer] = cols;
        newItems.push({
          id: `pdc-bulk-${Date.now()}-${idx}`,
          leaseId: leaseId || leases[0]?.id || "L-1001",
          chequeNo: chqNo || `CHQ-${Math.floor(100000 + Math.random() * 900000)}`,
          bank: bank || "QNB",
          date: mDate || today.toISOString().split("T")[0],
          amount: Number(amt) || 5000,
          payerName: payer || "Tenant Customer",
          status: "received",
        });
      });
      setPdcs(prev => [...newItems, ...prev]);
      toast.success(`Successfully imported ${newItems.length} PDC cheques!`);
      setBulkPdcOpen(false);
      setBulkPdcCsv("");
    } catch (e: any) {
      toast.error("Failed PDC import: " + e.message);
    } finally {
      setBulkLeasingImporting(false);
    }
  };

  const downloadDepositTemplate = () => {
    const headers = "LeaseId,ReceiptNumber,DepositType,Amount,PaymentMethod,BankOrReference,Remarks";
    const sample = "L-1001,RV-DEP-991,Security Deposit,6500,Bank Transfer,TRF-QNB-998811,Standard 1-month deposit\nL-1002,RV-DEP-992,Kahramaa Utility Deposit,2000,Cash,Vault-01,Utility deposit";
    const blob = new Blob([headers + "\n" + sample], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "bulk_deposits_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Deposit CSV Template downloaded!");
  };

  const handleBulkDepositImport = () => {
    if (!bulkDepositCsv.trim()) {
      toast.error("Please paste CSV data.");
      return;
    }
    setBulkLeasingImporting(true);
    try {
      const lines = bulkDepositCsv.trim().split("\n");
      if (lines.length <= 1) {
        toast.error("CSV must contain at least 1 deposit row.");
        return;
      }
      const dataRows = lines.slice(1);
      const newItems: Voucher[] = [];
      dataRows.forEach((row, idx) => {
        const cols = row.split(",").map(c => c.trim().replace(/^"|"$/g, ''));
        if (!cols[0]) return;
        const [leaseId, rcptNo, depType, amt, method, ref, rem] = cols;
        newItems.push({
          id: `v-dep-${Date.now()}-${idx}`,
          leaseId: leaseId || leases[0]?.id || "L-1001",
          name: `Receipts Voucher - ${depType || "Security Deposit"}`,
          receiptNo: rcptNo || `RV-DEP-${Math.floor(1000 + Math.random() * 9000)}`,
          method: method || "Bank Transfer",
          period: rem || "Security Deposit Guarantee",
          debit: method === "Cash" ? "Cash In Hand" : "Bank Operating Account",
          credit: "Security Deposit Liability (21500)",
          amount: Number(amt) || 5000,
          status: "posted",
        });
      });
      setVouchers(prev => [...newItems, ...prev]);
      toast.success(`Successfully recorded ${newItems.length} deposit vouchers!`);
      setBulkDepositOpen(false);
      setBulkDepositCsv("");
    } catch (e: any) {
      toast.error("Failed deposit import: " + e.message);
    } finally {
      setBulkLeasingImporting(false);
    }
  };

  // ── Dialog States ──────────────────────────────────────────────
  const [createLeaseOpen, setCreateLeaseOpen] = useState(false);
  const [selectedReservationForLease, setSelectedReservationForLease] = useState<Reservation | null>(null);
  const [createLeaseForm, setCreateLeaseForm] = useState({
    startDate: "",
    endDate: "",
    monthlyRent: "",
    securityDeposit: "",
    pdcCount: "12",
    paymentFrequency: "monthly" as Lease["paymentFrequency"],
    gracePeriodDays: "5",
    penalties: "Late payment and returned cheque penalties apply",
    maintenanceResponsibility: "Owner/Property Manager for major repairs; tenant for misuse",
    utilityResponsibility: "Tenant",
    parkingDetails: "Covered parking, 1 remote and access card",
    specialConditions: "",
    noticePeriodDays: "60",
  });

  const [releaseOpen, setReleaseOpen] = useState(false);
  const [selectedReservationForRelease, setSelectedReservationForRelease] = useState<Reservation | null>(null);
  const [releaseReason, setReleaseReason] = useState("");
  const [releaseType, setReleaseType] = useState<"expired" | "released">("released");

  const [renewalNoticeOpen, setRenewalNoticeOpen] = useState(false);
  const [renewalNoticeForm, setRenewalNoticeForm] = useState({
    selectedLeaseId: "",
    rentIncreasePercent: "5",
    revisedTerms: "5% rent revision; notice period retained",
    proposedRenewalPeriod: "12 months",
    lastConfirmationDays: "30",
    additionalRecipients: "",
    notes: "",
  });

  const [editTermsOpen, setEditTermsOpen] = useState(false);
  const [selectedLeaseForTerms, setSelectedLeaseForTerms] = useState<string | null>(null);
  const [agreementTermsForm, setAgreementTermsForm] = useState({
    paymentFrequency: "monthly" as Lease["paymentFrequency"],
    pdcCount: 12,
    gracePeriodDays: 5,
    penalties: "",
    maintenanceResponsibility: "",
    utilityResponsibility: "",
    parkingDetails: "",
    specialConditions: "",
    noticePeriodDays: 60,
  });

  const [verifyDocOpen, setVerifyDocOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [verifyDocForm, setVerifyDocForm] = useState({
    status: "verified" as VerificationStatus,
    expiryDate: "",
    remarks: "",
  });

  const [uploadDocOpen, setUploadDocOpen] = useState(false);
  const [uploadDocForm, setUploadDocForm] = useState({
    file: "",
    fileName: "",
    remarks: "",
  });

  // ── Signature Workflow Dialogs ─────────────────────────────────
  const [signatureWorkflowLease, setSignatureWorkflowLease] = useState<Lease | null>(null);
  const [assets, setAssets] = useState<SupabaseAsset[]>([]);
  const [assetChanges, setAssetChanges] = useState<Record<string, { condition: string; imageFileName: string }>>({});
  const [assetLoading, setAssetLoading] = useState(false);

  useEffect(() => {
    loadAssets();
  }, []);

  async function loadAssets() {
    setAssetLoading(true);
    try {
      const data = await fetchAssets();
      const allAssets = Array.isArray(data) && data.length > 0 ? data : createSampleAssetsForUnits(units);
      setAssets(allAssets || []);
      const initial = Object.fromEntries((allAssets || []).map((asset) => [asset.id, {
        condition: asset.asset_condition || "Good",
        imageFileName: "",
      }]));
      setAssetChanges(initial);
    } catch (error) {
      console.error("Failed to load assets", error);
      const fallback = createSampleAssetsForUnits(units);
      setAssets(fallback);
      const initial = Object.fromEntries(fallback.map((asset) => [asset.id, {
        condition: asset.asset_condition || "Good",
        imageFileName: "",
      }]));
      setAssetChanges(initial);
    } finally {
      setAssetLoading(false);
    }
  }

  async function saveAssetUpdate(assetId: string) {
    const change = assetChanges[assetId];
    if (!change) return;
    try {
      if (assetId.startsWith("demo-")) {
        setAssets((items) =>
          items.map((asset) =>
            asset.id === assetId
              ? {
                  ...asset,
                  asset_condition: change.condition,
                  remarks: change.imageFileName ? `Image uploaded: ${change.imageFileName}` : asset.remarks,
                }
              : asset,
          ),
        );
      } else {
        await updateAsset(assetId, {
          asset_condition: change.condition,
          remarks: change.imageFileName ? `Image uploaded: ${change.imageFileName}` : undefined,
        });
        await loadAssets();
      }
      alert("Asset update saved.");
    } catch (error) {
      console.error("Failed to save asset update", error);
      alert("Unable to save asset update. Please try again.");
    }
  }

  async function saveAllAssetUpdates() {
    const entries = Object.entries(assetChanges);
    if (entries.length === 0) return;
    try {
      const demoEntries = entries.filter(([assetId]) => assetId.startsWith("demo-"));
      const realEntries = entries.filter(([assetId]) => !assetId.startsWith("demo-"));

      if (demoEntries.length > 0) {
        setAssets((items) =>
          items.map((asset) => {
            const change = assetChanges[asset.id];
            if (!asset.id.startsWith("demo-") || !change) return asset;
            return {
              ...asset,
              asset_condition: change.condition,
              remarks: change.imageFileName ? `Image uploaded: ${change.imageFileName}` : asset.remarks,
            };
          }),
        );
      }

      if (realEntries.length > 0) {
        await Promise.all(realEntries.map(([assetId, change]) => updateAsset(assetId, {
          asset_condition: change.condition,
          remarks: change.imageFileName ? `Image uploaded: ${change.imageFileName}` : undefined,
        })));
        await loadAssets();
      }
      alert("Asset updates saved.");
    } catch (error) {
      console.error("Failed to save asset updates", error);
      alert("Unable to save asset updates. Please try again.");
    }
  }

  function updateAssetChange(assetId: string, partial: Partial<{ condition: string; imageFileName: string }>) {
    setAssetChanges((prev) => ({
      ...prev,
      [assetId]: { ...prev[assetId], ...partial },
    }));
  }

  const [keysWorkflowLease, setKeysWorkflowLease] = useState<Lease | null>(null);

  const handoverAssets = useMemo(() => {
    if (!keysWorkflowLease) return [];
    const unit = units.find((item) => item.unit === keysWorkflowLease.unit);
    if (!unit) return [];
    return assets.filter((asset) => asset.assigned_unit_id === unit.id || asset.assigned_property_id === unit.id);
  }, [assets, keysWorkflowLease, units]);

  // Tenant Sign
  const [tenantSignOpen, setTenantSignOpen] = useState(false);
  const [tenantSignForm, setTenantSignForm] = useState({
    signedAt: today.toISOString().split("T")[0],
    signedDocument: "",
    receivedBy: "Leasing Department",
    remarks: "",
  });

  // Collect Rent/PDC
  const [collectOpen, setCollectOpen] = useState(false);
  const [collectForm, setCollectForm] = useState({
    paymentMode: "PDC" as "PDC" | "Cash" | "Bank Transfer" | "Guarantee Cheque",
    chequeBank: "QNB",
    payerName: "",
    // Type 1: Unit Security Deposit (GL 21500)
    depositAmount: "",
    depositMode: "Cash" as string,
    depositChequeNo: "",
    depositChequeBank: "",
    // Type 2: Ancillary Refundable Deposits & Guarantees (GL 21100)
    utilityDeposit: "0", // Kahramaa Electricity/Water (21100003)
    qatarCoolDeposit: "0", // Qatar Cool (21100004)
    reservationDeposit: "0", // Reservation Advance (21100001)
    serviceFeeDeposit: "0", // Service Fee / Key Deposit (21100005)
    guaranteeChequeDeposit: "0", // Guarantee Cheque (21100006)
    guaranteeChequeNo: "",
    guaranteeChequeBank: "QNB",
    // One-time fees
    agencyCommission: "0",
    adminCharges: "0",
    cashierName: "",
    notes: "",
    receiptFile: "",
    pdcCount: 12,
    startDate: today.toISOString().split("T")[0],
    endDate: addDays(today, 365),
    firstChequeDate: today.toISOString().split("T")[0],
    regularChequeAmount: "",
    customCheques: [] as Array<{ chequeNo: string; bank: string; date: string; amount: number; period: string; tenureStart: string; tenureEnd: string; file: string }>,
  });

  // ── Security Deposit Dialog ──────────────────────────────────────
  const [securityDepositOpen, setSecurityDepositOpen] = useState(false);
  const [securityDepositForm, setSecurityDepositForm] = useState({
    leaseId: "",
    amount: "",
    method: "Cash" as string,
    receiptNo: "",
    chequeNo: "",
    bank: "",
    chequeDate: today.toISOString().split("T")[0],
    notes: "",
  });

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptModalData, setReceiptModalData] = useState<TenantReceiptDetails | null>(null);
  const [receiptModalSecondaryData, setReceiptModalSecondaryData] = useState<TenantReceiptDetails | null>(null);

  // Submit to Landlord
  const [submitLandlordOpen, setSubmitLandlordOpen] = useState(false);
  const [submitLandlordForm, setSubmitLandlordForm] = useState({
    submittedTo: "",
    submittedAt: today.toISOString().split("T")[0],
    docsSent: "Email",
    notes: "",
    proofFile: "",
  });

  const [uploadAgreementOpen, setUploadAgreementOpen] = useState(false);
  const [uploadAgreementForm, setUploadAgreementForm] = useState({
    file: "",
    fileName: "",
    remarks: "",
  });

  // Landlord Sign
  const [landlordSignOpen, setLandlordSignOpen] = useState(false);
  const [landlordSignForm, setLandlordSignForm] = useState({
    signedAt: today.toISOString().split("T")[0],
    signedBy: "",
    signedDocument: "",
    sharedWithTenant: true,
    remarks: "",
  });

  // ── Keys & Check-In Dialogs ──────────────────────────────────────
  // Setup Handover
  const [keyNotifyOpen, setKeyNotifyOpen] = useState(false);
  const [keyNotifyForm, setKeyNotifyForm] = useState({
    handoverAt: addDays(today, 1),
    handoverTime: "10:00",
    recipients: ["Tenant", "Property Manager", "Concerned Property Staff", "Security", "Maintenance"],
    authorizedCollector: "",
    keysSummary: "2 metal keys, 2 access cards, 1 parking remote",
    staffContact: "Property Manager - +974 4400 2200",
    outstandingRequirements: "None",
    note: "",
  });

  const [handoverOpen, setHandoverOpen] = useState(false);
  const [handoverViewOpen, setHandoverViewOpen] = useState(false);
  const [selectedHandover, setSelectedHandover] = useState<KeyHandover | null>(null);
  const [handoverActiveTab, setHandoverActiveTab] = useState<"details" | "assets" | "condition" | "checklist" | "acknowledgement" | string>("details");
  const [handoverForm, setHandoverForm] = useState({
    handoverAt: addDays(today, 1),
    handoverTime: "10:00",
    keys: "2",
    keyType: "Metal door keys",
    accessCards: "2",
    parkingRemotes: "1",
    parkingDeviceDetails: "Remote for covered parking bay",
    electricityMeterReading: "",
    waterMeterReading: "",
    issuedBy: "Property Manager",
    collectorName: "",
    collectorIdNumber: "",
    unitCondition: "Good",
    cleanliness: "Clean",
    acWorking: true,
    plumbingOk: true,
    electricalOk: true,
    doorsWindowsOk: true,
    idVerified: true,
    photosTaken: "6",
    handoverPhotos: "",
    checklistDocument: "",
    assetChecklist: "",
    financeConfirmed: false,
    propertyManagerConfirmed: true,
    tenantConfirmed: false,
    tenantAcknowledgement: "Tenant acknowledged receipt of keys and access items.",
    note: "",
  });

  const [checkInForm, setCheckInForm] = useState({
    condition: "Good",
    furnitureCondition: "Good",
    fixturesCondition: "Good",
    wallFloorCeilingCondition: "Good",
    acCondition: "Operational",
    electricityMeter: "",
    waterMeter: "",
    damages: "",
    pendingMaintenance: "",
    photos: "8",
    note: "",
  });

  // ── Renewals Dialog ──────────────────────────────────────────────
  const [renewalResponseOpen, setRenewalResponseOpen] = useState(false);
  const [selectedRenewal, setSelectedRenewal] = useState<RenewalCase | null>(null);
  const [renewalResponseForm, setRenewalResponseForm] = useState({ response: "confirm" as "confirm" | "non_renewal", confirmedRent: "", notes: "", updateStatus: "awaiting_response" as RenewalCase["status"] });

  // ── Checkout Dialogs ─────────────────────────────────────────────
  const [startCheckoutOpen, setStartCheckoutOpen] = useState(false);
  const [checkoutWorkflowLease, setCheckoutWorkflowLease] = useState<Lease | null>(null);
  const [startCheckoutForm, setStartCheckoutForm] = useState({
    noticeDate: today.toISOString().split("T")[0],
    moveOutDate: "",
    inspectionDate: "",
    outstandingCharges: "Pending finance confirmation",
    utilityClearanceRequirements: "Final utility clearance required before checkout closure",
    keyReturnRequirements: "Return all keys, access cards, parking remotes and property items",
    notes: "",
    missingItems: "",
    cleaningCharges: "0",
    restorationCharges: "0",
  });

  const [checkoutActiveTab, setCheckoutActiveTab] = useState<string>("condition");
  const [completeCheckoutOpen, setCompleteCheckoutOpen] = useState(false);
  const [selectedCheckout, setSelectedCheckout] = useState<CheckoutCase | null>(null);
  const [completeCheckoutForm, setCompleteCheckoutForm] = useState({
    condition: "Repair required",
    electricityMeter: "",
    waterMeter: "",
    damages: "",
    missingItems: "",
    cleaningCharges: "0",
    restorationCharges: "0",
    outstandingRent: "0",
    damagesAmount: "0",
    utilityCharges: "0",
    otherDeductions: "0",
    daysOccupiedInMonth: "30",
    totalDaysInMonth: "30",
    currentMonthPdcDeposited: false,
    unusedRentRefund: "0",
    photos: "0",
    checkoutPhotos: "",
    checkoutReportFile: "",
    handoverConditionSummary: "",
    finalConditionSummary: "",
    financeClearance: false,
    utilityClearance: false,
    keysReturned: false,
    unitDisposition: "Vacant - Under Maintenance" as Unit["status"],
  });

  // ── PDC Add Dialog ───────────────────────────────────────────────
  const [addPdcOpen, setAddPdcOpen] = useState(false);
  const [pdcLeaseId, setPdcLeaseId] = useState("");
  const [pdcRows, setPdcRows] = useState<any[]>(() =>
    Array.from({ length: 12 }, () => ({ chequeNo: "", bank: "", amount: "", maturityDate: today.toISOString().split("T")[0], tenureStart: "", tenureEnd: "", file: "" }))
  );

  // ── Add Voucher Dialog ───────────────────────────────────────────
  const [addVoucherOpen, setAddVoucherOpen] = useState(false);
  const [addVoucherForm, setAddVoucherForm] = useState({
    leaseId: "",
    name: "Receipts Voucher - Rent",
    receiptNo: "",
    method: "PDC" as string,
    period: "",
    debit: "PDC In Hand",
    credit: "",
    amount: "",
    createPdc: true,
    pdcChequeNo: "",
    pdcBank: "",
    pdcDate: today.toISOString().split("T")[0],
  });

  // ── Security Deposit Settle & Refund Modal ─────────────────────────
  const [settleRefundOpen, setSettleRefundOpen] = useState(false);
  const [settleRefundStep, setSettleRefundStep] = useState<1 | 2>(1);
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [settleRefundForm, setSettleRefundForm] = useState({
    refundAmount: "",
    paymentMethod: "Bank Transfer",
    settlementMode: "DEDUCT_FROM_DEPOSIT" as "DEDUCT_FROM_DEPOSIT" | "PAY_SEPARATELY",
    damagePaymentMode: "Bank Transfer" as "Bank Transfer" | "Cash" | "Cheque" | "Bank Guarantee",
    damages: "0",
    outstandingRent: "0",
    utilityCharges: "0",
    cleaningCharges: "0",
    restorationCharges: "0",
    otherDeductions: "0",
    daysOccupiedInMonth: "30",
    totalDaysInMonth: "30",
    currentMonthPdcDeposited: false,
    unusedRentRefund: "0",
    damageRemarks: "",
    notes: "",
    // Payment details when customer pays separately
    paymentRefNo: "",
    payerBank: "QNB",
    paymentDate: today.toISOString().split("T")[0],
    bgExpiryDate: "",
    paymentProofFileName: "",
    paymentProofData: "",
    // Detailed refund payment fields
    refundBank: "Qatar National Bank (QNB)",
    refundIban: "",
    refundTxRef: "",
    refundChequeNo: "",
    refundChequeBank: "Qatar National Bank (QNB)",
    refundChequeDate: today.toISOString().split("T")[0],
    refundCashierName: "Treasury Department",
    refundPaymentDate: today.toISOString().split("T")[0],
    refundProofFileName: "",
    refundProofData: "",
  });

  // ── Discuss Renewal Dialog ───────────────────────────────────────
  const [discussRenewalOpen, setDiscussRenewalOpen] = useState(false);
  const [selectedDiscussRenewal, setSelectedDiscussRenewal] = useState<RenewalCase | null>(null);
  const [discussRenewalForm, setDiscussRenewalForm] = useState({
    discussedRent: "",
    proposedPeriod: "",
    tenantResponse: "positive" as "positive" | "negative" | "pending",
    notes: "",
    nextFollowUpDate: "",
  });


  const [createReservationOpen, setCreateReservationOpen] = useState(false);
  const [createCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [reservationForm, setReservationForm] = useState({
    property: "",
    unit: "AAA - GF2",
    tenantName: "",
    agent: "Marketing Agent",
    startDate: addDays(today, 10),
    validityDays: "7",
    rent: "5500",
    proposedEndDate: "",
    remarks: "",
  });

  const [customerForm, setCustomerForm] = useState({
    name: "",
    type: "individual" as Customer["type"],
    qatarId: "",
    passport: "",
    crNumber: "",
    nationality: "",
    mobile: "",
    email: "",
    permanentAddress: "",
    localAddress: "",
    authorizedSignatory: "",
    emergencyContact: "",
    employerInfo: "",
  });

  const activeReservations = (reservations || []).filter((item) => item?.status === "reserved").length;
  const blockedDocuments = (documents || []).filter((item) => item?.mandatory && item?.status !== "verified").length;
  const readyForKeys = (leases || []).filter((lease) => lease?.status === "fully_signed").length;
  const openSettlements = (settlements || []).filter((item) => item?.approval !== "paid").length;

  const upcomingRenewals = useMemo(
    () =>
      (leases || []).filter((lease) => {
        if (!lease?.endDate) return false;
        const endTime = new Date(lease.endDate).getTime();
        if (isNaN(endTime)) return false;
        const todayTime = today instanceof Date ? today.getTime() : new Date().getTime();
        const days = Math.ceil((endTime - todayTime) / 86400000);
        return days <= 60 && days >= 0 && lease.status !== "closed";
      }),
    [leases],
  );

  function withBusy(action: string, handler: () => void) {
    setBusyAction(action);
    window.setTimeout(() => {
      handler();
      setBusyAction("");
    }, 180);
  }

  function recordAudit(event: Omit<AuditEvent, "id" | "at">) {
    setAuditEvents((items) => [
      {
        id: `a${items.length + 1}`,
        at: today.toISOString().split("T")[0],
        ...event,
      },
      ...items,
    ]);
  }

  async function releaseFuturePdcExposure(lease: Lease, vacateDate: string) {
    try {
      const propId = String((lease as any).propertyId || "");
      const unitId = String((lease as any).unitId || "");
      const result = await settleEarlyLeaseVacate({
        leaseId: String(lease.id),
        tenantId: String(lease.customerId),
        propertyId: propId || undefined,
        unitId: unitId || undefined,
        unitName: lease.unit,
        vacateDate,
        leaseEndDate: lease.endDate,
      });

      // 1. Identify and mark all future PDCs returned
      const futurePdcList = pdcs.filter(
        (p) => p.leaseId === lease.id && new Date(p.date).getTime() > new Date(vacateDate).getTime() && ["received", "replaced", "in_hand", "partial_cash"].includes(p.status)
      );
      const returnedIds = new Set(futurePdcList.map((p) => p.id));

      if (returnedIds.size > 0) {
        setPdcs((items) => items.map((item) => returnedIds.has(item.id) ? { ...item, status: "returned" as PdcStatus } : item));
      }

      // 2. Post GL / SL vouchers to Finance Store so General Ledger, Trial Balance, P&L and Balance Sheet reflect the reversal
      for (const fp of futurePdcList) {
        addFinanceStoreVoucher({
          voucher_no: `VCH-PDC-RET-${fp.chequeNo || fp.id}`,
          voucher_type: "Journal Voucher",
          date: vacateDate,
          name: `Early Vacate: Return Future PDC #${fp.chequeNo} (${lease.tenantName} - ${lease.unit})`,
          debit: "Customer PDC Liability",
          debit_code: "21400",
          credit: "PDC In Hand",
          credit_code: "12900",
          amount: fp.amount,
          method: "Cheque Return",
          property_name: lease.property,
          unit_ref: lease.unit,
          tenant_name: lease.tenantName,
        });
      }

      // 3. Post unearned future rent reversal voucher if future rent was recognized
      if (result.reversedRentAmount > 0) {
        addFinanceStoreVoucher({
          voucher_no: `VCH-RENT-REV-${lease.id}`,
          voucher_type: "Journal Voucher",
          date: vacateDate,
          name: `Early Vacate: Reverse Unearned Rent Invoices (${lease.tenantName} - ${lease.unit})`,
          debit: "Rental Revenue (Unearned Reversal)",
          debit_code: "41100",
          credit: "Tenant Receivables",
          credit_code: "12413",
          amount: result.reversedRentAmount,
          method: "Revenue Normalization",
          property_name: lease.property,
          unit_ref: lease.unit,
          tenant_name: lease.tenantName,
        });
      }

      recordAudit({
        stage: "Early Vacate Finance Normalization",
        owner: "Finance Department",
        input: `${lease.tenantName} / ${lease.unit}; vacate ${vacateDate}; contractual expiry ${lease.endDate}`,
        approval: "Lease early termination settlement",
        status: "completed",
        output: `Reversed ${result.reversedInvoiceCount} future rent invoice(s) for ${formatMoney(result.reversedRentAmount)} and returned ${Math.max(result.returnedPdcCount, futurePdcList.length)} eligible future PDC(s) for ${formatMoney(result.returnedPdcAmount || futurePdcList.reduce((s, p) => s + p.amount, 0))}. GL/SL updated.`,
      });

      return {
        returnedCount: Math.max(result.returnedPdcCount, futurePdcList.length),
        returnedAmount: result.returnedPdcAmount || futurePdcList.reduce((s, p) => s + p.amount, 0),
        reversedInvoiceCount: result.reversedInvoiceCount,
        reversedRentAmount: result.reversedRentAmount,
      };
    } catch (error) {
      console.warn("[Early Vacate Finance] supplementary normalization notice:", error);
      recordAudit({
        stage: "Early Vacate Finance Normalization",
        owner: "Finance Department",
        input: `${lease.tenantName} / ${lease.unit}; vacate ${vacateDate}`,
        approval: "Partial – primary settlement posted successfully",
        status: "completed",
        output: `Primary settlement posted. Supplementary PDC normalization notice: ${error instanceof Error ? error.message : String(error)}. Finance team should verify any remaining future PDCs manually.`,
      });
      return { returnedCount: 0, returnedAmount: 0, reversedInvoiceCount: 0, reversedRentAmount: 0 };
    }
  }

  function createReservation() {
    const activeUnits = realUnits.length > 0 ? realUnits : units;
    const unit = activeUnits.find((item) => item.unit === reservationForm.unit);
    if (!unit || unit.status !== "Available") return;
    const reservation: Reservation = {
      id: `r${reservations.length + 1}`,
      property: unit.property,
      unit: unit.unit,
      tenantName: reservationForm.tenantName || "Prospective Tenant",
      agent: reservationForm.agent,
      startDate: reservationForm.startDate,
      validUntil: addDays(today, Number(reservationForm.validityDays || 7)),
      rent: Number(reservationForm.rent || unit.rent),
      status: "reserved",
      remarks: reservationForm.remarks,
      proposedEndDate: reservationForm.proposedEndDate,
    };
    setReservations((items) => [reservation, ...items]);
    setUnits((items) => items.map((item) => (item.id === unit.id ? { ...item, status: "Reserved" } : item)));
    setReservationForm((form) => ({ ...form, tenantName: "", remarks: "" }));
    recordAudit({
      stage: "Unit Reservation",
      owner: "Marketing Agent",
      input: `${reservation.unit}, ${reservation.tenantName}, validity until ${reservation.validUntil}`,
      approval: "Lease Module reservation control",
      status: "Reserved",
      output: "Unit locked and unavailable for other offers",
    });
  }

  function releaseReservation(reservation: Reservation, status: "expired" | "released") {
    setReservations((items) => items.map((item) => (item.id === reservation.id ? { ...item, status } : item)));
    setUnits((items) => items.map((item) => (item.unit === reservation.unit ? { ...item, status: "Available" } : item)));
    recordAudit({
      stage: "Reservation Notification",
      owner: "Leasing Department",
      input: `${reservation.unit} reservation ${status}`,
      approval: "Marketing/Leasing follow-up",
      status,
      output: "Agent notified and unit released to available stock",
    });
  }

  const nationalityOptions = useMemo(() => {
    return DynamicMastersService.getMasterStringOptions("nationality").map((name) => ({
      label: name,
      value: name,
    }));
  }, []);

  const professionOptions = useMemo(() => {
    return DynamicMastersService.getMasterStringOptions("profession").map((name) => ({
      label: name,
      value: name,
    }));
  }, []);

  function isCustomerDuplicate(form: Omit<Customer, "id" | "status">, excludeId?: string) {
    // Check each unique identifier field independently against the same field in existing records
    // This prevents false positives caused by short coincidental value matches across different fields
    return customers.some((customer) => {
      if (excludeId && customer.id === excludeId) return false;
      if (form.qatarId && customer.qatarId && form.qatarId.trim().toLowerCase() === customer.qatarId.trim().toLowerCase()) return true;
      if (form.passport && customer.passport && form.passport.trim().toLowerCase() === customer.passport.trim().toLowerCase()) return true;
      if (form.crNumber && customer.crNumber && form.crNumber.trim().toLowerCase() === customer.crNumber.trim().toLowerCase()) return true;
      if (form.mobile && customer.mobile && form.mobile.trim() === customer.mobile.trim()) return true;
      if (form.email && customer.email && form.email.trim().toLowerCase() === customer.email.trim().toLowerCase()) return true;
      return false;
    });
  }

  function validateCustomerIdentifiers(form: typeof customerForm): string | null {
    if (form.type === "individual") {
      const qid = form.qatarId?.trim();
      if (qid && !/^\d{11}$/.test(qid)) {
        return "Qatar ID (QID) must be exactly 11 numeric digits.";
      }
      const passport = form.passport?.trim();
      if (passport && !/^[A-Za-z0-9]{9}$/.test(passport)) {
        return "Passport Number must be exactly 9 alphanumeric characters.";
      }
    }
    return null;
  }

  function createCustomer() {
    if (!customerForm.name.trim()) {
      alert("Please enter a customer name before saving.");
      return;
    }

    const valErr = validateCustomerIdentifiers(customerForm);
    if (valErr) {
      alert(valErr);
      return;
    }

    if (isCustomerDuplicate(customerForm)) {
      alert("A customer with the same Qatar ID, passport, CR number, mobile, or email already exists. Please verify unique identifiers before saving.");
      return;
    }

    const customer: Customer = {
      id: `c${customers.length + 1}`,
      ...customerForm,
      status: "active",
    };
    setCustomers((items) => [customer, ...items]);

    const requiredDocs = customer.type === "company" ? ["Commercial Registration", "Computer Card", "Authorized signatory documents"] : ["Qatar ID", "Passport copy", "Residence permit"];
    setDocuments((items) => [
      ...requiredDocs.map((name, index) => ({
        id: `d${documents.length + index + 1}`,
        customerId: customer.id,
        name,
        mandatory: true,
        status: "pending" as VerificationStatus,
        issueDate: "",
        expiryDate: "",
        reviewer: "",
        remarks: "Awaiting upload",
      })),
      ...items,
    ]);

    setCustomerForm({
      name: "",
      type: "individual",
      qatarId: "",
      passport: "",
      crNumber: "",
      nationality: "",
      mobile: "",
      email: "",
      permanentAddress: "",
      localAddress: "",
      authorizedSignatory: "",
      emergencyContact: "",
      employerInfo: "",
    });
    recordAudit({
      stage: "Customer Master",
      owner: "Leasing Department",
      input: `${customer.name}, duplicate keys checked`,
      approval: "Customer activation",
      status: "active",
      output: "Tenant profile and mandatory document checklist created",
    });
  }

  function submitDocumentVerification() {
    if (!selectedDocId) return;
    setDocuments((items) =>
      items.map((item) =>
        item.id === selectedDocId
          ? {
            ...item,
            status: verifyDocForm.status,
            expiryDate: verifyDocForm.status === "verified" ? verifyDocForm.expiryDate : item.expiryDate,
            reviewer: "Leasing Department",
            remarks: verifyDocForm.remarks || (verifyDocForm.status === "verified" ? "Verified and accepted" : verifyDocForm.status === "rejected" ? "Rejected by reviewer" : item.remarks),
          }
          : item,
      ),
    );
    recordAudit({
      stage: "Document Verification",
      owner: "Leasing Department",
      input: `Doc ${selectedDocId} status ${verifyDocForm.status}`,
      approval: "Verification complete",
      status: verifyDocForm.status,
      output: verifyDocForm.remarks || `Document marked as ${verifyDocForm.status}`,
    });
    setVerifyDocOpen(false);
  }

  function submitUploadDoc() {
    if (!selectedDocId || !uploadDocForm.file) {
      alert("Please select a file to upload.");
      return;
    }
    setDocuments((items) =>
      items.map((item) =>
        item.id === selectedDocId
          ? {
            ...item,
            file: uploadDocForm.fileName || uploadDocForm.file,
            status: "pending",
            remarks: uploadDocForm.remarks || "Document uploaded and awaiting review",
          }
          : item,
      ),
    );
    recordAudit({
      stage: "Document Upload",
      owner: "Leasing Department",
      input: `Doc ${selectedDocId} uploaded file: ${uploadDocForm.fileName || uploadDocForm.file}`,
      approval: "N/A",
      status: "pending",
      output: uploadDocForm.remarks || "Document uploaded successfully",
    });
    setUploadDocOpen(false);
  }

  function submitAgreementTerms() {
    if (!selectedLeaseForTerms) return;
    setLeases((items) =>
      items.map((item) =>
        item.id === selectedLeaseForTerms
          ? {
            ...item,
            ...agreementTermsForm,
          }
          : item
      )
    );
    recordAudit({
      stage: "Agreement Terms",
      owner: "Leasing Department",
      input: `Lease ${selectedLeaseForTerms}`,
      approval: "Terms Updated",
      status: "Updated",
      output: "Agreement terms and schedule updated",
    });
    setEditTermsOpen(false);
  }

  function openCreateLeaseDialog(reservation: Reservation) {
    setSelectedReservationForLease(reservation);
    setCreateLeaseForm(f => ({
      ...f,
      startDate: reservation.startDate,
      endDate: addDays(new Date(reservation.startDate), 365),
      monthlyRent: String(reservation.rent),
      securityDeposit: String(reservation.rent),
      specialConditions: reservation.remarks || "",
    }));
    setCreateLeaseOpen(true);
  }

  function createLeaseFromReservation(reservation: Reservation, formOverride?: typeof createLeaseForm) {
    const form = formOverride ?? createLeaseForm;
    const customer = customers.find((item) => item.name.toLowerCase() === reservation.tenantName.toLowerCase() && item.status === "active");
    if (!customer) {
      alert(`No active customer found for "${reservation.tenantName}". Please create the customer in Customer Master first.`);
      return;
    }
    const docsVerified = documents.filter((item) => item.customerId === customer.id && item.mandatory).every((item) => item.status === "verified");
    const lease: Lease = {
      id: `l${leases.length + 1}`,
      customerId: customer.id,
      reservationId: reservation.id,
      property: reservation.property,
      unit: reservation.unit,
      tenantName: customer.name,
      startDate: form.startDate || reservation.startDate,
      endDate: form.endDate || addDays(new Date(reservation.startDate), 365),
      monthlyRent: Number(form.monthlyRent) || reservation.rent,
      securityDeposit: Number(form.securityDeposit) || reservation.rent,
      pdcCount: Number(form.pdcCount) || 12,
      paymentFrequency: form.paymentFrequency,
      gracePeriodDays: Number(form.gracePeriodDays) || 5,
      penalties: form.penalties,
      maintenanceResponsibility: form.maintenanceResponsibility,
      utilityResponsibility: form.utilityResponsibility,
      parkingDetails: form.parkingDetails,
      specialConditions: form.specialConditions || reservation.remarks || "No special conditions",
      noticePeriodDays: Number(form.noticePeriodDays) || 60,
      status: docsVerified ? "documents_verified" : "documents_pending",
      collectionCompleted: false,
    };
    setLeases((items) => [lease, ...items]);
    setReservations((items) => items.map((item) => (item.id === reservation.id ? { ...item, status: "converted" } : item)));
    setCreateLeaseOpen(false);
    setSelectedReservationForLease(null);
    recordAudit({
      stage: "Lease Agreement Creation",
      owner: "Leasing Department",
      input: `${lease.tenantName}, ${lease.unit}, ${lease.paymentFrequency}, ${formatMoney(lease.monthlyRent)}`,
      approval: docsVerified ? "Document gate passed" : "Document gate pending",
      status: lease.status,
      output: "Lease agreement created with rent schedule terms",
    });
    recordAudit({
      stage: "Property Manager Handoff",
      owner: "Leasing Department",
      input: `${lease.tenantName}, ${lease.unit}, lease ${lease.id}`,
      approval: "Property Manager review required",
      status: "pending_approval",
      output: "Lease package forwarded to Property Manager for operational review",
    });
    if (customer.email) {
      void supabase.auth.getSession().then(({ data }) => {
        const accessToken = data.session?.access_token;
        if (!accessToken) throw new Error("Your Leasing session has expired. Please sign in again.");
        return fetch("/api/provision-tenant", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ email: customer.email, fullName: customer.name }),
        });
      })
        .then(async (response) => {
          const result = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(result.error || "Tenant account provisioning failed.");
          toast.success(`Tenant login created for ${result.email}. Initial password: Mindz@007`);
        })
        .catch((error) => toast.error(error instanceof Error ? error.message : "Tenant account provisioning failed."));
    }
  }

  function openReleaseDialog(reservation: Reservation) {
    setSelectedReservationForRelease(reservation);
    setReleaseReason("");
    setReleaseType(isExpired(reservation.validUntil) ? "expired" : "released");
    setReleaseOpen(true);
  }

  function confirmRelease() {
    if (!selectedReservationForRelease) return;
    releaseReservation(selectedReservationForRelease, releaseType);
    setReleaseOpen(false);
    setSelectedReservationForRelease(null);
  }

  function advanceLease(lease: Lease, status: LeaseStatus, patch: Partial<Lease> = {}) {
    const fullPatch: Partial<Lease> = { status, ...patch };
    setLeases((items) => items.map((item) => (item.id === lease.id ? { ...item, ...fullPatch } : item)));
    recordAudit({
      stage: status === "tenant_signed_pending_collection" ? "Tenant Signature" : status === "fully_signed" ? "Landlord Signature" : status === "collection_completed" ? "Collection" : "Lease Status",
      owner: status === "tenant_signed_pending_collection" ? "Tenant/Leasing" : status === "fully_signed" ? "Landlord" : "Leasing Department",
      input: `${lease.tenantName}, ${lease.unit}`,
      approval: status === "fully_signed" ? "Landlord or authorized signatory" : "Workflow action",
      status,
      output: status === "fully_signed" ? "Fully signed lease uploaded and shared with tenant" : "Lease status updated",
    });
  }

  function submitTenantSign() {
    if (!signatureWorkflowLease) return;
    advanceLease(signatureWorkflowLease, "tenant_signed_pending_collection", {
      tenantSignedAt: tenantSignForm.signedAt,
      signedDocument: tenantSignForm.signedDocument || `tenant-signed-${signatureWorkflowLease.id}.pdf`,
      receivedBy: tenantSignForm.receivedBy,
    });
    setTenantSignOpen(false);
  }

  async function submitCollect() {
    if (!signatureWorkflowLease) return;
    const lease = signatureWorkflowLease;
    
    // ── Filter only rows that have both cheque no and amount filled ──
    let nextPdcs: Pdc[] = [];
    if (collectForm.customCheques && collectForm.customCheques.length > 0) {
      nextPdcs = collectForm.customCheques
        .filter(c => (c.chequeNo && c.chequeNo.trim() !== "") && Number(c.amount) > 0)
        .map((c, index) => ({
          id: `p${pdcs.length + index + 1}`,
          leaseId: lease.id,
          chequeNo: c.chequeNo,
          bank: c.bank || collectForm.chequeBank || "Tenant Bank",
          date: c.date,
          amount: Number(c.amount),
          payerName: collectForm.payerName || lease.tenantName,
          period: c.period || (c.tenureStart && c.tenureEnd ? `${c.tenureStart} to ${c.tenureEnd}` : `PDC ${index + 1}`),
          tenureStart: c.tenureStart,
          tenureEnd: c.tenureEnd,
          status: "received" as PdcStatus,
        }));
    } else {
      const count = Number(collectForm.pdcCount) || lease.pdcCount || 12;
      const totalRent = (lease.monthlyRent || 0) * (lease.pdcCount || 12);
      const regularAmt = Number(collectForm.regularChequeAmount) || lease.monthlyRent;
      const firstChequeStr = collectForm.firstChequeDate || collectForm.startDate || lease.startDate;
      const leaseStartStr = lease.startDate || firstChequeStr;

      nextPdcs = Array.from({ length: count }, (_, index) => {
        let amount = regularAmt;
        if (index === count - 1 && count > 1 && regularAmt * (count - 1) < totalRent) {
          amount = totalRent - regularAmt * (count - 1);
        }
        // Month-increment maturity date (same day, next month)
        const bd = new Date(firstChequeStr);
        const day = bd.getDate();
        const rawMonth = bd.getMonth() + index;
        const yr = bd.getFullYear() + Math.floor(rawMonth / 12);
        const mo = ((rawMonth % 12) + 12) % 12;
        const lastDay = new Date(yr, mo + 1, 0).getDate();
        const maturityStr = `${yr}-${String(mo + 1).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
        // Tenure anchored to lease start date
        const tsDate = new Date(leaseStartStr); tsDate.setMonth(tsDate.getMonth() + index);
        const teDate = new Date(leaseStartStr); teDate.setMonth(teDate.getMonth() + index + 1); teDate.setDate(teDate.getDate() - 1);
        return {
          id: `p${pdcs.length + index + 1}`,
          leaseId: lease.id,
          chequeNo: `PDC-${lease.unit.replace(/\W/g, "")}-${String(index + 1).padStart(3, "0")}`,
          bank: collectForm.chequeBank || "Tenant Bank",
          date: maturityStr,
          amount: Math.max(0, amount),
          payerName: collectForm.payerName || lease.tenantName,
          period: `Cheque ${index + 1} of ${count}`,
          tenureStart: tsDate.toISOString().split("T")[0],
          tenureEnd: teDate.toISOString().split("T")[0],
          status: "received" as PdcStatus,
        };
      });
    }

    const pdcTotal = nextPdcs.reduce((sum, pdc) => sum + pdc.amount, 0);

    const agencyAmt = Number(collectForm.agencyCommission) || 0;
    const adminAmt = Number(collectForm.adminCharges) || 0;
    const utilityAmt = Number(collectForm.utilityDeposit) || 0;
    const qatarCoolAmt = Number(collectForm.qatarCoolDeposit) || 0;
    const reservationAmt = Number(collectForm.reservationDeposit) || 0;
    const serviceFeeAmt = Number(collectForm.serviceFeeDeposit) || 0;
    const guaranteeChequeAmt = Number(collectForm.guaranteeChequeDeposit) || 0;
    const depAmt = Number(collectForm.depositAmount) || lease.securityDeposit;
    const today_str = today.toISOString().split("T")[0];
    const jeNo = `JE-COLL-${lease.id.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const newVouchers: Voucher[] = [
      { id: `v${vouchers.length + 1}`, leaseId: lease.id, name: "Receipts Voucher - Rent PDC", receiptNo: `RV-${lease.id}-01`, method: collectForm.paymentMode, period: `${collectForm.startDate || lease.startDate} to ${collectForm.endDate || lease.endDate}`, debit: "PDC In Hand (12900001)", credit: `Customer(PDC)-${lease.unit} (21400)`, amount: pdcTotal, status: "posted" },
      ...(depAmt > 0 ? [{ id: `v${vouchers.length + 2}`, leaseId: lease.id, name: "Receipts Voucher - Security Deposit", receiptNo: `RV-${lease.id}-02`, method: collectForm.depositMode, period: "Security deposit", debit: collectForm.depositMode === "Cash" ? "Cash In Hand" : "Bank Operating Account", credit: `Security Deposit Liability - ${lease.unit} (21500)`, amount: depAmt, status: "posted" as const }] : []),
      ...(utilityAmt > 0 ? [{ id: `v${vouchers.length + 3}`, leaseId: lease.id, name: "Receipts Voucher - Kahramaa Deposit", receiptNo: `RV-${lease.id}-UTL`, method: "Cash", period: "Kahramaa utility deposit", debit: "Cash In Hand", credit: "Kahramaa Deposit (21100003)", amount: utilityAmt, status: "posted" as const }] : []),
      ...(qatarCoolAmt > 0 ? [{ id: `v${vouchers.length + 4}`, leaseId: lease.id, name: "Receipts Voucher - Qatar Cool Deposit", receiptNo: `RV-${lease.id}-QC`, method: "Cash", period: "Qatar Cool utility deposit", debit: "Cash In Hand", credit: "Qatar Cool Deposit (21100004)", amount: qatarCoolAmt, status: "posted" as const }] : []),
      ...(reservationAmt > 0 ? [{ id: `v${vouchers.length + 5}`, leaseId: lease.id, name: "Receipts Voucher - Reservation Advance", receiptNo: `RV-${lease.id}-RES`, method: "Cash", period: "Reservation advance", debit: "Cash In Hand", credit: "Reservation Advance (21100001)", amount: reservationAmt, status: "posted" as const }] : []),
      ...(serviceFeeAmt > 0 ? [{ id: `v${vouchers.length + 6}`, leaseId: lease.id, name: "Receipts Voucher - Service Fee Deposit", receiptNo: `RV-${lease.id}-SVC`, method: "Cash", period: "Service fee deposit", debit: "Cash In Hand", credit: "Service Fee Deposit (21100005)", amount: serviceFeeAmt, status: "posted" as const }] : []),
      ...(guaranteeChequeAmt > 0 ? [{ id: `v${vouchers.length + 7}`, leaseId: lease.id, name: "Receipts Voucher - Guarantee Cheque", receiptNo: `RV-${lease.id}-GCHQ`, method: "Guarantee Cheque", period: "Guarantee cheque security", debit: "Deposit-PDC In Hand (12900002)", credit: "Guarantee Cheque Received (21200001)", amount: guaranteeChequeAmt, status: "posted" as const }] : []),
      ...(agencyAmt > 0 ? [{ id: `v${vouchers.length + 8}`, leaseId: lease.id, name: "Agency Commission - Finance Mapping Required", receiptNo: `RV-${lease.id}-AGN`, method: "Cash", period: "One-time fee", debit: "Cash In Hand", credit: "Unmapped Finance Master Account", amount: agencyAmt, status: "draft" as const }] : []),
      ...(adminAmt > 0 ? [{ id: `v${vouchers.length + 9}`, leaseId: lease.id, name: "Admin Charges - Finance Mapping Required", receiptNo: `RV-${lease.id}-ADM`, method: "Cash", period: "One-time fee", debit: "Cash In Hand", credit: "Unmapped Finance Master Account", amount: adminAmt, status: "draft" as const }] : []),
    ];
    // ── Authoritative Finance posting ──────────────────────────────────────
    // Resolve real UUID context if available, and post to ledger. If lease is demo/mock,
    // catch and proceed with in-memory state transition.
    try {
      const leaseIdValue = String(lease.id);
      const isLeaseUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(leaseIdValue);
      const leaseLookup = isLeaseUuid
        ? supabase.from("leases").select("id, customer_id, property_id, unit_id").eq("id", leaseIdValue).maybeSingle()
        : supabase.from("leases").select("id, customer_id, property_id, unit_id").eq("lease_number", leaseIdValue).maybeSingle();
      const { data: financeLease } = await leaseLookup;

      if (financeLease?.id && financeLease.customer_id && financeLease.property_id && financeLease.unit_id) {
        if (pdcTotal > 0) {
          for (const pdc of nextPdcs) {
            await receivePdc({
              cheque_number: pdc.chequeNo,
              cheque_date: pdc.date,
              amount: pdc.amount,
              tenant_id: String(financeLease.customer_id),
              property_id: String(financeLease.property_id),
              unit_id: String(financeLease.unit_id),
              lease_id: String(financeLease.id),
              unitCode: lease.unit,
              pdcType: "RENT_PDC",
            });
          }
        }

        const depositCollections: Array<{ amount: number; type: "SECURITY" | "QATAR_COOL" | "KAHRAMAA" | "SERVICE_FEE" | "RESERVATION"; mode: "Cash" | "Bank" }> = [
          { amount: depAmt, type: "SECURITY", mode: collectForm.depositMode === "Cash" ? "Cash" : "Bank" },
          { amount: utilityAmt, type: "KAHRAMAA", mode: "Cash" },
          { amount: qatarCoolAmt, type: "QATAR_COOL", mode: "Cash" },
          { amount: reservationAmt, type: "RESERVATION", mode: "Cash" },
          { amount: serviceFeeAmt, type: "SERVICE_FEE", mode: "Cash" },
        ];
        for (const deposit of depositCollections) {
          if (deposit.amount <= 0) continue;
          await collectSecurityDeposit({
            amount: deposit.amount,
            tenant_id: String(financeLease.customer_id),
            property_id: String(financeLease.property_id),
            unit_id: String(financeLease.unit_id),
            lease_id: String(financeLease.id),
            mode: deposit.mode,
            depositType: deposit.type,
            unit_name: lease.unit,
            ref: `RV-${lease.id}-${deposit.type}`,
          });
        }

        if (guaranteeChequeAmt > 0) {
          await postGuaranteeCheque({
            amount: guaranteeChequeAmt,
            tenantId: String(financeLease.customer_id),
            propertyId: String(financeLease.property_id),
            unitId: String(financeLease.unit_id),
            leaseId: String(financeLease.id),
            chequeNumber: collectForm.guaranteeChequeNo || `GNT-${lease.id}`,
            unitCode: lease.unit,
          });
        }
      }
    } catch (err) {
      console.warn("Authoritative finance posting skipped for in-memory/demo record:", err);
    }

    // Publish the PDCs to shared state
    setPdcs((items) => [...nextPdcs, ...items]);

    // Agency/Admin charge accounts remain draft
    if (agencyAmt > 0 || adminAmt > 0) {
      toast.warning("Agency/Admin charges remain draft because no authoritative Finance Master account rule exists for those charge types.");
    }
    setVouchers((items) => [...newVouchers, ...items]);

    // Feed directly to authoritative FinanceStore vouchers for General Ledger and Reports
    newVouchers.forEach(v => {
      const drCode = v.debit.includes("12900002") ? "12900" :
                     v.debit.includes("12900") ? "12900" :
                     v.debit.toLowerCase().includes("cash") ? "12100" : "12000";
      const crCode = v.credit.includes("21400") ? "21400" :
                     v.credit.includes("21500") ? "21500" :
                     v.credit.includes("21100001") ? "21100" :
                     v.credit.includes("21100003") ? "21100" :
                     v.credit.includes("21100004") ? "21100" :
                     v.credit.includes("21100005") ? "21100" :
                     v.credit.includes("21200001") ? "21200" :
                     v.credit.includes("21100") ? "21100" : "41100";

      addFinanceStoreVoucher({
        voucher_no: v.receiptNo || `RV-${lease.id}-${Date.now().toString().slice(-4)}`,
        voucher_type: "Receipt Voucher",
        date: today_str,
        name: `${v.name} — ${lease.tenantName} (${lease.unit})`,
        debit: v.debit,
        debit_code: drCode,
        credit: v.credit,
        credit_code: crCode,
        amount: v.amount,
        method: v.method,
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
    });

    if (depAmt > 0 && collectForm.depositMode === "Cash") {
      addCashBookEntry({ date: today_str, voucher: `RV-${lease.id}-02`, description: `Unit Security Deposit Cash — ${lease.tenantName} / ${lease.unit}`, type: "in", amount: depAmt });
    }
    if (utilityAmt > 0) addCashBookEntry({ date: today_str, voucher: `RV-${lease.id}-UTL`, description: `Kahramaa Utility Deposit — ${lease.tenantName} / ${lease.unit}`, type: "in", amount: utilityAmt });
    if (qatarCoolAmt > 0) addCashBookEntry({ date: today_str, voucher: `RV-${lease.id}-QC`, description: `Qatar Cool Utility Deposit — ${lease.tenantName} / ${lease.unit}`, type: "in", amount: qatarCoolAmt });
    if (reservationAmt > 0) addCashBookEntry({ date: today_str, voucher: `RV-${lease.id}-RES`, description: `Reservation Advance — ${lease.tenantName} / ${lease.unit}`, type: "in", amount: reservationAmt });
    if (serviceFeeAmt > 0) addCashBookEntry({ date: today_str, voucher: `RV-${lease.id}-SVC`, description: `Service Fee Deposit — ${lease.tenantName} / ${lease.unit}`, type: "in", amount: serviceFeeAmt });

    advanceLease(lease, "collection_completed", {
      collectionCompleted: true,
      pdcCount: nextPdcs.length,
      startDate: collectForm.startDate || lease.startDate,
      endDate: collectForm.endDate || lease.endDate,
    });

    recordAudit({
      stage: "Collection & Receipt Generation",
      owner: `Finance Cashier${collectForm.cashierName ? " – " + collectForm.cashierName : ""}`,
      input: `${nextPdcs.length} PDCs (${collectForm.chequeBank}), deposit ${collectForm.depositMode}${agencyAmt > 0 ? ", agency commission " + formatMoney(agencyAmt) : ""}${adminAmt > 0 ? ", admin charges " + formatMoney(adminAmt) : ""}${utilityAmt > 0 ? ", utility deposit " + formatMoney(utilityAmt) : ""}`,
      approval: "Cashier receipt posting",
      status: "collection_completed",
      output: (collectForm.notes || "Rent, deposit and fee collection receipts generated") + (collectForm.receiptFile ? ` (Proof: ${collectForm.receiptFile})` : ""),
    });

    // Auto-generate official printable receipt
    const totalCollectedAmt = pdcTotal + depAmt + agencyAmt + adminAmt + utilityAmt + qatarCoolAmt + reservationAmt + serviceFeeAmt + guaranteeChequeAmt;
    const generatedReceipt: TenantReceiptDetails = {
      receiptNo: `REC-${Date.now().toString().slice(-6)}`,
      acknowledgementNo: `ACK-${lease.id.toUpperCase()}`,
      date: today.toISOString().split("T")[0],
      tenantName: lease.tenantName,
      tenantPhone: (lease as any).phone || "",
      tenantEmail: (lease as any).email || "",
      tenantQid: (lease as any).qatarId || "",
      propertyName: lease.property,
      unitRef: lease.unit,
      leaseNo: `LES-${lease.id.toUpperCase()}`,
      leaseStartDate: collectForm.startDate || lease.startDate,
      leaseEndDate: collectForm.endDate || lease.endDate,
      monthlyRent: lease.monthlyRent,
      totalContractRent: pdcTotal,
      depositAmount: depAmt,
      depositMode: collectForm.depositMode,
      pdcCount: nextPdcs.length,
      pdcs: nextPdcs.map((p) => ({
        chequeNo: p.chequeNo,
        bank: p.bank,
        date: p.date,
        amount: p.amount,
        period: p.period,
        tenureStart: (p as any).tenureStart,
        tenureEnd: (p as any).tenureEnd,
      })),
      vouchers: newVouchers.map((v) => ({
        receiptNo: v.receiptNo,
        name: v.name,
        amount: v.amount,
        method: v.method,
        debit: v.debit,
        credit: v.credit,
      })),
      agencyCommission: agencyAmt,
      adminCharges: adminAmt,
      utilityDeposit: utilityAmt,
      totalCollected: totalCollectedAmt,
      cashierName: collectForm.cashierName || "Finance Cashier",
      notes: collectForm.notes || "Official receipt acknowledged for rent cheques, security deposit, and applicable fees.",
    };

    setReceiptModalData(generatedReceipt);
    setReceiptModalOpen(true);
    setCollectOpen(false);
  }

  function submitToLandlord() {
    if (!signatureWorkflowLease) return;
    advanceLease(signatureWorkflowLease, "pending_landlord_signature", {
      landlordPackageSubmittedAt: submitLandlordForm.submittedAt,
    });
    recordAudit({
      stage: "Submit to Landlord",
      owner: "Leasing Department",
      input: `Sent to ${submitLandlordForm.submittedTo} via ${submitLandlordForm.docsSent}`,
      approval: "Landlord package submission",
      status: "pending_landlord_signature",
      output: (submitLandlordForm.notes || "Package submitted to owner/landlord") + (submitLandlordForm.proofFile ? ` (Proof: ${submitLandlordForm.proofFile})` : ""),
    });
    setSubmitLandlordOpen(false);
  }

  async function downloadLeaseAgreement(lease: Lease) {
    try {
      const blob = await generateLeaseAgreementBlob({
        tenantName: lease.tenantName,
        landlordName: "Landlord",
        propertyAddress: lease.property,
        unit: lease.unit,
        startDate: lease.startDate,
        endDate: lease.endDate,
        monthlyRent: lease.monthlyRent,
        securityDeposit: lease.securityDeposit,
        depositNonRefundable: "QR 0 or as agreed",
        leaseNo: `LES-${lease.id}`,
        paymentFrequency: lease.paymentFrequency,
        pdcCount: lease.pdcCount,
        gracePeriodDays: lease.gracePeriodDays,
        penalties: lease.penalties,
        maintenanceResponsibility: lease.maintenanceResponsibility,
        utilityResponsibility: lease.utilityResponsibility,
        parkingDetails: lease.parkingDetails,
        specialConditions: lease.specialConditions,
        noticePeriodDays: lease.noticePeriodDays,
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${lease.tenantName.replace(/\W+/g, "-")}-${lease.unit}-Lease-Agreement.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to generate lease agreement PDF. Please try again.");
    }
  }

  function submitUploadAgreement() {
    if (!signatureWorkflowLease) return;
    advanceLease(signatureWorkflowLease, "fully_signed", {
      landlordSignedAt: today.toISOString().split("T")[0],
      signedDocument: uploadAgreementForm.fileName || uploadAgreementForm.file,
      sharedWithTenant: true,
    });
    recordAudit({
      stage: "Upload Agreement",
      owner: "Leasing Department",
      input: `Uploaded agreement file ${uploadAgreementForm.fileName || uploadAgreementForm.file}`,
      approval: "Agreement upload",
      status: "fully_signed",
      output: uploadAgreementForm.remarks || "Lease agreement uploaded and recorded.",
    });
    setUploadAgreementOpen(false);
  }

  function submitLandlordSign() {
    if (!signatureWorkflowLease) return;
    advanceLease(signatureWorkflowLease, "fully_signed", {
      landlordSignedAt: landlordSignForm.signedAt,
      signedDocument: landlordSignForm.signedDocument || `fully-signed-${signatureWorkflowLease.id}.pdf`,
      sharedWithTenant: landlordSignForm.sharedWithTenant,
    });
    setLandlordSignOpen(false);
  }

  async function addVoucher() {
    const { leaseId, name, receiptNo, method, period, amount, createPdc, pdcChequeNo, pdcBank, pdcDate } = addVoucherForm;
    if (!leaseId || !amount || !name) { alert("Please fill Lease, Voucher Name, and Amount."); return; }
    
    const lease = leases.find((l) => l.id === leaseId);
    const unitCode = lease?.unit || "Unit";
    const accounts = getVoucherAccounts(name, unitCode, method);
    const numAmount = Number(amount) || 0;
    const vchNo = receiptNo || `VCH-${Date.now()}`;
    const newId = `v${vouchers.length + 1}`;

    const newVoucher: Voucher = {
      id: newId,
      leaseId,
      name,
      receiptNo: vchNo,
      method,
      period,
      debit: accounts.debit,
      credit: accounts.credit,
      amount: numAmount,
      status: "draft",
    };

    // 1. Update shared in-memory context so all UI modules reflect it immediately
    setVouchers((items) => [newVoucher, ...items]);

    // 2. If PDC method and user wants to create PDC entry, register it
    if ((method === "PDC" || method === "Guarantee Cheque") && createPdc && pdcChequeNo) {
      const newPdc: Pdc = {
        id: `p${pdcs.length + 1}`,
        leaseId,
        chequeNo: pdcChequeNo,
        bank: pdcBank || "Tenant Bank",
        date: pdcDate,
        amount: numAmount,
        status: "received",
      };
      setPdcs((items) => [newPdc, ...items]);
    }

    // Generic manual vouchers are not allowed to write directly to Finance
    // tables. That legacy path inserted account_id 1/2 and bypassed GL/SL
    // resolution. Supported accounting workflows use the central Posting
    // Engine; unsupported manual entries remain draft for Finance review.
    toast.warning("Manual voucher saved as Draft. Post it through the applicable Finance workflow so GL/SL is resolved from Finance Master.");

    recordAudit({
      stage: "Voucher Created",
      owner: "Finance Department",
      input: `${name} — ${method} — ${period || "-"}`,
      approval: "Manual entry",
      status: "draft",
      output: `Voucher ${newVoucher.receiptNo} saved as draft for Finance review; it was not posted directly to the ledger.`,
    });

    setAddVoucherOpen(false);
    setAddVoucherForm({ leaseId: "", name: "Receipts Voucher - Rent", receiptNo: "", method: "PDC", period: "", debit: "PDC In Hand", credit: "Rental Income", amount: "", createPdc: true, pdcChequeNo: "", pdcBank: "", pdcDate: today.toISOString().split("T")[0] });
  }

  function addSecurityDeposit() {
    const { leaseId, amount, method, receiptNo, chequeNo, bank, chequeDate, notes } = securityDepositForm;
    if (!leaseId || !amount) { alert("Please select a lease and enter the deposit amount."); return; }
    const isPdc = method === "PDC" || method === "Guarantee Cheque";
    const newVoucher: Voucher = {
      id: `v${vouchers.length + 1}`,
      leaseId,
      name: `Receipt Voucher - Security Deposit (${method})`,
      receiptNo: receiptNo || `SD-${Date.now()}`,
      method,
      period: "Security Deposit",
      debit: isPdc ? "PDC In Hand" : method === "Cash" ? "Cash In Hand" : "Bank Account",
      credit: "Security Deposit Liability",
      amount: Number(amount),
      status: "draft",
    };
    setVouchers((items) => [newVoucher, ...items]);
    if (isPdc && chequeNo) {
      const newPdc: Pdc = {
        id: `p${pdcs.length + 1}`,
        leaseId,
        chequeNo,
        bank,
        date: chequeDate,
        amount: Number(amount),
        status: "received",
      };
      setPdcs((items) => [newPdc, ...items]);
    }
    // Update lease security deposit
    setLeases((items) => items.map((l) => l.id === leaseId ? { ...l, securityDeposit: l.securityDeposit + Number(amount) } : l));
    recordAudit({
      stage: "Security Deposit Received",
      owner: "Finance Department",
      input: `${method} — ${formatMoney(Number(amount))}${chequeNo ? ` — Cheque ${chequeNo}` : ""}`,
      approval: "Cashier receipt",
      status: "received",
      output: `Security deposit ${newVoucher.receiptNo} recorded. ${notes || ""}`,
    });
    setSecurityDepositOpen(false);
    setSecurityDepositForm({ leaseId: "", amount: "", method: "Cash", receiptNo: "", chequeNo: "", bank: "", chequeDate: today.toISOString().split("T")[0], notes: "" });
  }

  function discussRenewal() {
    if (!selectedDiscussRenewal) return;
    setRenewals((items) => items.map((item) => item.id === selectedDiscussRenewal.id
      ? {
          ...item,
          status: "under_discussion",
          proposedRent: discussRenewalForm.discussedRent ? Number(discussRenewalForm.discussedRent) : item.proposedRent,
          proposedPeriod: discussRenewalForm.proposedPeriod || item.proposedPeriod,
          outstandingObligations: discussRenewalForm.notes ? item.outstandingObligations + ` | Notes: ${discussRenewalForm.notes}` : item.outstandingObligations,
          lastConfirmationDate: discussRenewalForm.nextFollowUpDate || item.lastConfirmationDate,
        }
      : item
    ));
    recordAudit({
      stage: "Renewal Discussion",
      owner: "Leasing Department",
      input: `Tenant response: ${discussRenewalForm.tenantResponse}${discussRenewalForm.discussedRent ? ` | Discussed rent: QR ${discussRenewalForm.discussedRent}` : ""}`,
      approval: "Leasing manager review",
      status: "under_discussion",
      output: discussRenewalForm.notes || "Renewal discussion recorded. Follow-up scheduled.",
    });
    setDiscussRenewalOpen(false);
    setSelectedDiscussRenewal(null);
    setDiscussRenewalForm({ discussedRent: "", proposedPeriod: "", tenantResponse: "positive", notes: "", nextFollowUpDate: "" });
  }

  function generateRenewalNotices(form?: typeof renewalNoticeForm) {

    const f = form ?? renewalNoticeForm;
    const increaseMultiplier = 1 + (Number(f.rentIncreasePercent) || 5) / 100;
    const existing = new Set(renewals.map((item) => item.leaseId));
    const next = upcomingRenewals
      .filter((lease) => !existing.has(lease.id))
      .map((lease, index) => ({
        id: `rn${renewals.length + index + 1}`,
        leaseId: lease.id,
        noticeDate: today.toISOString().split("T")[0],
        status: "awaiting_response" as RenewalCase["status"],
        proposedRent: Math.round(lease.monthlyRent * increaseMultiplier),
        proposedPeriod: f.proposedRenewalPeriod || `${addDays(new Date(lease.endDate), 1)} to ${addDays(new Date(lease.endDate), 366)}`,
        revisedTerms: f.revisedTerms || `${f.rentIncreasePercent}% rent revision, ${lease.noticePeriodDays}-day notice period retained`,
        expiryDate: lease.endDate,
        requiredNoticePeriod: `${lease.noticePeriodDays} days`,
        lastConfirmationDate: addDays(new Date(lease.endDate), -(Number(f.lastConfirmationDays) || 30)),
        outstandingObligations: "Finance to confirm outstanding rent, PDC and maintenance obligations",
        recipients: `Tenant, Leasing Department, Marketing Agent, Property Manager, Landlord or Authorized Person${f.additionalRecipients ? `, ${f.additionalRecipients}` : ""}`,
        followUpOwner: "Leasing Department",
      }));
    setRenewals((items) => [...next, ...items]);
    setRenewalNoticeOpen(false);
    if (next.length > 0) {
      recordAudit({
        stage: "Lease Renewal Notification",
        owner: "System",
        input: `Leases expiring within 60 days; ${f.rentIncreasePercent}% increase proposed`,
        approval: "Automatic rule + manual override",
        status: "notified",
        output: `${next.length} renewal notice(s) generated at least 60 days before expiry with proposed terms and recipients`,
      });
    } else {
      alert("No leases are due for renewal within 60 days, or notices have already been generated.");
    }
  }

  function renewLease(renewal: RenewalCase) {
    const oldLease = leases.find((item) => item.id === renewal.leaseId);
    if (!oldLease) return;
    // Check for tenant documents that may have expired during the previous lease term
    const expiredDocs = documents
      .filter((d) => d.customerId === oldLease.customerId && d.mandatory && d.expiryDate && new Date(d.expiryDate) < today)
      .map((d) => d.name);
    if (expiredDocs.length > 0) {
      const proceed = window.confirm(
        `Warning: The following mandatory documents have expired and should be renewed before activating the new lease period:\n\n${expiredDocs.join(", ")}\n\nProceed with renewal? (You can update documents in the Documents tab.)` 
      );
      if (!proceed) return;
    }
    const renewed: Lease = {
      ...oldLease,
      id: `l${leases.length + 1}`,
      renewalOf: oldLease.id,
      startDate: addDays(new Date(oldLease.endDate), 1),
      endDate: addDays(new Date(oldLease.endDate), 366),
      monthlyRent: renewal.proposedRent,
      status: "documents_pending" as LeaseStatus,
      tenantSignedAt: undefined,
      landlordSignedAt: undefined,
      signedDocument: undefined,
      receivedBy: undefined,
      landlordPackageSubmittedAt: undefined,
      sharedWithTenant: false,
      collectionCompleted: false,
    };
    setLeases((items) => [renewed, ...items.map((item) => (item.id === oldLease.id ? { ...item, status: "renewed" as LeaseStatus } : item))]);
    setRenewals((items) => items.map((item) => (item.id === renewal.id ? { ...item, status: "renewal_confirmed" } : item)));
    setPdcs((items) => items.filter((item) => item.leaseId !== renewed.id));
    recordAudit({
      stage: "Lease Renewal Process",
      owner: "Leasing Department",
      input: `${oldLease.tenantName}, renewed period ${renewal.proposedPeriod}${expiredDocs.length > 0 ? " | Expired docs flagged: " + expiredDocs.join(", ") : ""}`,
      approval: "Renewal confirmation",
      status: "renewal_confirmed",
      output: "Renewed lease linked to previous lease history; document review recommended for expired credentials",
    });
  }

  function approveSettlement(settlement: Settlement) {
    const refundable = settlement.depositReceived - settlement.outstandingRent - settlement.damages - settlement.utilityCharges - settlement.otherDeductions;
    setSettlements((items) => items.map((item) => (item.id === settlement.id ? { ...item, approval: "paid" } : item)));
    setVouchers((items) => [
      { id: `v${items.length + 1}`, leaseId: settlement.leaseId, name: "Tenant Settlement Voucher", receiptNo: `TS-${settlement.id}`, method: "Settlement", period: "Final checkout", debit: "Security Deposit Liability", credit: "Tenant Refund Payable", amount: refundable, status: "posted" },
      { id: `v${items.length + 2}`, leaseId: settlement.leaseId, name: "Payment Voucher", receiptNo: `PV-${settlement.id}`, method: "Bank Transfer", period: "Refund", debit: "Tenant Refund Payable", credit: "Bank Account", amount: refundable, status: "posted" },
      ...items,
    ]);
    const lease = leases.find((item) => item.id === settlement.leaseId);
    if (lease) {
      setLeases((items) => items.map((item) => (item.id === lease.id ? { ...item, status: "closed" } : item)));
      setUnits((items) => items.map((item) => (item.unit === lease.unit ? { ...item, status: (settlement.unitDisposition || "Vacant - Under Maintenance") as Unit["status"] } : item)));
    }
    recordAudit({
      stage: "Security Deposit Settlement & Lease Closure",
      owner: "Finance Department",
      input: `Deposit ${formatMoney(settlement.depositReceived)}, refund ${formatMoney(refundable)}`,
      approval: "Settlement approval",
      status: "closed",
      output: `Refund processed, lease closed, unit updated to ${settlement.unitDisposition || "Vacant - Available"}, and history retained`,
    });
  }

  function openSettleRefundModal(settlement: Settlement) {
    setSelectedSettlement(settlement);
    const deductions = (settlement.outstandingRent || 0) + (settlement.damages || 0) + (settlement.utilityCharges || 0)
      + (settlement.cleaningCharges || 0) + (settlement.restorationCharges || 0) + (settlement.otherDeductions || 0);
    const initialMode = (settlement.settlementMode || "DEDUCT_FROM_DEPOSIT") as "DEDUCT_FROM_DEPOSIT" | "PAY_SEPARATELY";
    const calcRefund = initialMode === "PAY_SEPARATELY" 
      ? settlement.depositReceived 
      : Math.max(0, settlement.depositReceived - deductions);
    const _unusedRent = settlement.unusedRentRefund || 0;
    setSettleRefundForm({
      damages: String(settlement.damages || 0),
      outstandingRent: String(settlement.outstandingRent || 0),
      utilityCharges: String(settlement.utilityCharges || 0),
      cleaningCharges: String(settlement.cleaningCharges || 0),
      restorationCharges: String(settlement.restorationCharges || 0),
      otherDeductions: String(settlement.otherDeductions || 0),
      daysOccupiedInMonth: String(settlement.daysOccupiedInMonth ?? 30),
      totalDaysInMonth: String(settlement.totalDaysInMonth ?? 30),
      currentMonthPdcDeposited: settlement.currentMonthPdcDeposited ?? false,
      unusedRentRefund: String(_unusedRent),
      refundAmount: String(calcRefund + _unusedRent),
      paymentMethod: "Bank Transfer",
      settlementMode: initialMode,
      damagePaymentMode: settlement.damagePaymentMode || "Bank Transfer",
      damageRemarks: "",
      notes: `Security deposit settlement and refund for Lease ${settlement.leaseId}`,
      paymentRefNo: settlement.paymentRefNo || "",
      payerBank: settlement.payerBank || (settlement.damagePaymentMode === "Cash" ? "Cash In Hand" : "QNB"),
      paymentDate: settlement.paymentDate || today.toISOString().split("T")[0],
      bgExpiryDate: settlement.bgExpiryDate || "",
      paymentProofFileName: settlement.paymentProofFileName || "",
      paymentProofData: settlement.paymentProofUrl || "",
      refundBank: "Qatar National Bank (QNB)",
      refundIban: "",
      refundTxRef: "",
      refundChequeNo: "",
      refundChequeBank: "Qatar National Bank (QNB)",
      refundChequeDate: today.toISOString().split("T")[0],
      refundCashierName: "Treasury Department",
      refundPaymentDate: today.toISOString().split("T")[0],
      refundProofFileName: "",
      refundProofData: "",
    });
    setSettleRefundStep(1);
    setSettleRefundOpen(true);
  }

  async function executeSettleAndRefund() {
    if (!selectedSettlement) return;
    const settlement = selectedSettlement;
    const lease = leases.find((item) => item.id === settlement.leaseId);
    const checkout = checkouts.find((item) => item.leaseId === settlement.leaseId);
    const settlementDate = today.toISOString().split("T")[0];
    const pvNo = `PV-SET-${Date.now().toString().slice(-6)}`;
    const jvNo = `JV-SET-${Date.now().toString().slice(-6)}`;
    const rvDmgNo = `RV-DMG-${Date.now().toString().slice(-6)}`;
    const isBank = settleRefundForm.paymentMethod !== "Cash";
    const bankCrCode = isBank ? "12000" : "12100";
    const bankCrName = isBank ? "Bank Operating Account" : "Cash In Hand";
    const mode = settleRefundForm.settlementMode;
    const dmgPayMode = settleRefundForm.damagePaymentMode || "Bank Transfer";

    // Dynamic debit account for customer separate damage payment
    let dmgDrAccount = "Bank Operating Account";
    let dmgDrCode = "12000";
    if (dmgPayMode === "Cash") {
      dmgDrAccount = "Cash In Hand";
      dmgDrCode = "12100";
    } else if (dmgPayMode === "Cheque") {
      dmgDrAccount = "Cheques / PDC In Hand";
      dmgDrCode = "12200";
    } else if (dmgPayMode === "Bank Guarantee") {
      dmgDrAccount = "Bank Guarantee Security Held";
      dmgDrCode = "12500";
    }

    // Resolved deduction totals from the active form (allows PM to adjust tenant-shared damage amounts)
    const damages = parseFloat(settleRefundForm.damages) || 0;
    const outstandingRent = parseFloat(settleRefundForm.outstandingRent) || 0;
    const utilityCharges = parseFloat(settleRefundForm.utilityCharges) || 0;
    const cleaningCharges = parseFloat(settleRefundForm.cleaningCharges) || 0;
    const restorationCharges = parseFloat(settleRefundForm.restorationCharges) || 0;
    const otherDeductions = parseFloat(settleRefundForm.otherDeductions) || 0;
    const totalDeductions = damages + outstandingRent + utilityCharges + cleaningCharges + restorationCharges + otherDeductions;
    const grossDeposit = settlement.depositReceived;
    // Unused rent: the portion of the deposited current-month PDC that was not earned
    const unusedRentRefund = settleRefundForm.currentMonthPdcDeposited
      ? Math.max(0, parseFloat(settleRefundForm.unusedRentRefund) || 0)
      : 0;
    // Effective deposit = gross security deposit + any unused rent to be refunded
    const effectiveDeposit = grossDeposit + unusedRentRefund;

    const customRefund = parseFloat(settleRefundForm.refundAmount);
    const refundable = !isNaN(customRefund) ? customRefund : (mode === "PAY_SEPARATELY" ? effectiveDeposit : Math.max(0, effectiveDeposit - totalDeductions));

    // 1. Mark settlement as paid and record updated deduction amounts and chosen mode
    setSettlements((items) => items.map((item) =>
      item.id === settlement.id ? {
        ...item,
        damages,
        outstandingRent,
        utilityCharges,
        cleaningCharges,
        restorationCharges,
        otherDeductions,
        refundableBalance: mode === "PAY_SEPARATELY" ? grossDeposit : Math.max(0, grossDeposit - totalDeductions),
        approval: "pending_approval",
        settlementMode: mode,
        damagePaymentMode: mode === "PAY_SEPARATELY" ? dmgPayMode : undefined,
        paymentRefNo: mode === "PAY_SEPARATELY" ? settleRefundForm.paymentRefNo : undefined,
        payerBank: mode === "PAY_SEPARATELY" ? settleRefundForm.payerBank : undefined,
        paymentDate: mode === "PAY_SEPARATELY" ? settleRefundForm.paymentDate : undefined,
        bgExpiryDate: mode === "PAY_SEPARATELY" && dmgPayMode === "Bank Guarantee" ? settleRefundForm.bgExpiryDate : undefined,
        paymentProofFileName: mode === "PAY_SEPARATELY" ? settleRefundForm.paymentProofFileName : undefined,
        paymentProofUrl: mode === "PAY_SEPARATELY" ? settleRefundForm.paymentProofData : undefined,
      } : item
    ));

    const propName = lease?.property || "Old Salata - Residence No:23";
    const unitRef = lease?.unit || "Unit";
    const tenantName = lease?.tenantName || "Tenant";

    // Authoritative settlement posting. The settlement engine resolves every
    // GL/SL from Finance Master and posts atomically; this route only maintains
    // presentation state and receipts.
    const leaseForFinance = lease;
    if (!leaseForFinance) throw new Error("Lease not found for settlement.");

    let centralSettlement;
    try {
      centralSettlement = await executeFinalSettlement({
        leaseId: String(leaseForFinance.id),
        tenantId: String(leaseForFinance.customerId),
        propertyId: String((leaseForFinance as any).propertyId || ""),
        unitId: String((leaseForFinance as any).unitId || ""),
        unitName: unitRef,
        depositAmount: grossDeposit,
        deductions: [
          { type: "RENT", description: "Outstanding rent", amount: outstandingRent },
          { type: "DAMAGE", description: "Damage / repair charges", amount: damages },
          { type: "UTILITY", description: "Utility charges", amount: utilityCharges },
          { type: "OTHER", description: "Cleaning / restoration / other charges", amount: cleaningCharges + restorationCharges + otherDeductions },
        ],
        paymentMethod: isBank ? "BANK" : "CASH",
        settlementMode: mode,
        damagePaymentMethod: dmgPayMode === "Cash" ? "CASH" : dmgPayMode === "Cheque" ? "CHEQUE" : "BANK",
        referenceNo: jvNo,
        settlementDate,
      });
    } catch (error) {
      setSettlements((items) => items.map((item) => item.id === settlement.id ? { ...item, approval: "pending_approval" } : item));
      toast.error(`Settlement was not posted: ${error instanceof Error ? error.message : "Finance posting failed"}`);
      return;
    }

    // Mark the settlement paid only after every authoritative finance voucher
    // has posted successfully. This prevents a UI-only "paid" state from
    // diverging from the accounting ledger.
    setSettlements((items) => items.map((item) => item.id === settlement.id ? { ...item, approval: "paid" } : item));

    if (centralSettlement.summary.netRecoveryAmount > 0) {
      toast.warning(`Tenant recovery remains outstanding: QR ${centralSettlement.summary.netRecoveryAmount.toLocaleString()}.`);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Sync with Live Cash Book & Cash On Hand if Cash is used
    // ─────────────────────────────────────────────────────────────────────
    if (mode === "PAY_SEPARATELY" && dmgPayMode === "Cash" && totalDeductions > 0) {
      addCashBookEntry({
        date: settlementDate,
        voucher: rvDmgNo,
        description: `Damage Cash Collection — ${tenantName} / ${unitRef}`,
        type: "in",
        amount: totalDeductions,
      });
    }

    if (settleRefundForm.paymentMethod === "Cash") {
      const cashRefundAmt = mode === "PAY_SEPARATELY" ? grossDeposit : refundable;
      if (cashRefundAmt > 0) {
        addCashBookEntry({
          date: settlementDate,
          voucher: pvNo,
          description: `Security Deposit Cash Refund — ${tenantName} / ${unitRef}`,
          type: "out",
          amount: cashRefundAmt,
        });
      }
    }

    // Mirror the authoritative posting references into the leasing UI and Central Finance Store.
    // This immediately populates the General Ledger, Trial Balance, P&L, Balance Sheet, and Sub-Ledgers.

    // Post unused rent reversal: Dr Rental Revenue (41100) / Cr Security Deposit Liability (21500)
    // This reverses the portion of revenue that was NOT earned due to early vacate.
    if (unusedRentRefund > 0) {
      const jvUnusedNo = `JV-UNR-${Date.now().toString().slice(-6)}`;
      addFinanceStoreVoucher({
        voucher_no: jvUnusedNo,
        voucher_type: "Journal Voucher",
        date: settlementDate,
        name: `Unearned Rent Reversal (Unused Days Refund) – ${tenantName} (${unitRef})`,
        debit: "Rental Revenue",
        debit_code: "41100",
        credit: "Security Deposit Liability",
        credit_code: "21500",
        amount: unusedRentRefund,
        method: "Journal Adjustment",
        property_name: propName,
        unit_ref: unitRef,
        tenant_name: tenantName,
      });
    }

    if (refundable > 0) {
      addFinanceStoreVoucher({
        voucher_no: pvNo,
        voucher_type: "Payment Voucher",
        date: settlementDate,
        name: `Security Deposit Refund – ${tenantName} (${unitRef})`,
        debit: "Security Deposit Liability",
        debit_code: "21500",
        credit: isBank ? "Bank Operating Account" : "Cash In Hand",
        credit_code: isBank ? "12000" : "12100",
        amount: refundable,
        method: isBank ? "Bank Transfer" : "Cash",
        property_name: propName,
        unit_ref: unitRef,
        tenant_name: tenantName,
      });
    }

    if (totalDeductions > 0) {
      // 1. Recognize charges into AR: Dr 12413 / Cr 41201
      addFinanceStoreVoucher({
        voucher_no: `JV-DMG-REC-${settlement.leaseId}`,
        voucher_type: "Journal Voucher",
        date: settlementDate,
        name: `Checkout Settlement Deductions Recognized – ${tenantName} (${unitRef})`,
        debit: "Tenant Receivables",
        debit_code: "12413",
        credit: "Damage & Repair Recovery",
        credit_code: "41201",
        amount: totalDeductions,
        method: "Settlement Adjustment",
        property_name: propName,
        unit_ref: unitRef,
        tenant_name: tenantName,
      });

      if (mode === "DEDUCT_FROM_DEPOSIT") {
        // 2. Settle against deposit liability: Dr 21500 / Cr 12413
        addFinanceStoreVoucher({
          voucher_no: `JV-DEP-DED-${settlement.leaseId}`,
          voucher_type: "Journal Voucher",
          date: settlementDate,
          name: `Security Deposit Applied to Deductions – ${tenantName} (${unitRef})`,
          debit: "Security Deposit Liability",
          debit_code: "21500",
          credit: "Tenant Receivables",
          credit_code: "12413",
          amount: totalDeductions,
          method: "Deposit Offset",
          property_name: propName,
          unit_ref: unitRef,
          tenant_name: tenantName,
        });
      } else if (mode === "PAY_SEPARATELY") {
        // 2. Separate collection: Dr Cash/Bank / Cr 12413
        addFinanceStoreVoucher({
          voucher_no: rvDmgNo,
          voucher_type: "Receipt Voucher",
          date: settlementDate,
          name: `Damage Settlement Collection (${dmgPayMode}) – ${tenantName} (${unitRef})`,
          debit: dmgDrAccount,
          debit_code: dmgPayMode === "Cash" ? "12100" : "12000",
          credit: "Tenant Receivables",
          credit_code: "12413",
          amount: totalDeductions,
          method: dmgPayMode,
          property_name: propName,
          unit_ref: unitRef,
          tenant_name: tenantName,
        });
      }
    }

    if (centralSettlement.vouchers.length > 0) {
      setVouchers((items) => [
        ...centralSettlement.vouchers.map((v, index) => ({
          id: `central-${v.voucher_id}`,
          leaseId: settlement.leaseId,
          name: `Central Finance Settlement ${index + 1}`,
          receiptNo: v.voucher_number,
          method: "Finance Engine",
          period: "Final checkout settlement",
          debit: "Finance Master",
          credit: "Finance Master",
          amount: index === centralSettlement.vouchers.length - 1 ? centralSettlement.summary.netRefundAmount || centralSettlement.summary.netRecoveryAmount : 0,
          status: "posted" as const,
        })),
        ...items,
      ]);
    }

    const earlyVacateDate = checkout?.moveOutDate || lease?.plannedVacateDate;
    const isEarlyVacate = Boolean(
      lease &&
      earlyVacateDate &&
      new Date(earlyVacateDate).getTime() < new Date(lease.endDate).getTime(),
    );
    const vacateEffectiveDate = earlyVacateDate || settlementDate;
    let pdcRelease = { returnedCount: 0, returnedAmount: 0, reversedInvoiceCount: 0, reversedRentAmount: 0 };
    if (lease && vacateEffectiveDate) {
      try {
        pdcRelease = await releaseFuturePdcExposure(lease, vacateEffectiveDate);
      } catch (vacateErr) {
        console.warn("[Settlement] Vacate PDC normalization notice (non-blocking):", vacateErr);
      }
    }

    // 5. Close lease and update unit disposition
    if (lease) {
      setLeases((items) => items.map((item) => (
        item.id === lease.id
          ? {
              ...item,
              status: "closed",
              endDate: earlyVacateDate || item.endDate,
              actualVacateDate: earlyVacateDate || settlementDate,
              plannedVacateDate: earlyVacateDate || item.plannedVacateDate,
              earlyVacate: isEarlyVacate || item.earlyVacate,
              earlyVacateReason: isEarlyVacate ? (item.earlyVacateReason || "Tenant vacated before lease expiry") : item.earlyVacateReason,
            }
          : item
      )));
      setUnits((items) => items.map((item) => (item.unit === lease.unit ? { ...item, status: (settlement.unitDisposition || "Vacant - Under Maintenance") as Unit["status"] } : item)));
    }

    // 6. Generate official receipt details for the receipt modal
    let primaryReceipt: TenantReceiptDetails;
    let secondaryReceipt: TenantReceiptDetails | null = null;

    if (mode === "PAY_SEPARATELY") {
      // ── RECEIPT 1: Damage & Repair Charges Collection (Receipt Voucher) ──
      primaryReceipt = {
        receiptNo: rvDmgNo,
        acknowledgementNo: jvNo,
        date: settlementDate,
        tenantName: tenantName,
        tenantPhone: "",
        tenantEmail: "",
        tenantQid: "",
        propertyName: propName,
        unitRef: unitRef,
        leaseNo: lease ? `LES-${lease.id.toUpperCase()}` : `LES-${settlement.leaseId}`,
        leaseStartDate: lease?.startDate || settlementDate,
        leaseEndDate: lease?.endDate || settlementDate,
        monthlyRent: lease?.monthlyRent || 0,
        totalContractRent: lease ? lease.monthlyRent * (lease.pdcCount || 12) : 0,
        depositAmount: 0,
        depositMode: `Damage Settlement Collection (${dmgPayMode})`,
        pdcCount: 0,
        pdcs: [],
        vouchers: [
          { receiptNo: rvDmgNo, name: `Damage Charges Paid by Tenant (${dmgPayMode}${settleRefundForm.paymentRefNo ? ` • Ref: ${settleRefundForm.paymentRefNo}` : ''})`, amount: totalDeductions, method: dmgPayMode, debit: dmgDrAccount, credit: "Tenant Receivables (12413)" },
          ...(damages > 0 ? [{ receiptNo: `${jvNo}-A1`, name: `Damage / Repair Costs`, amount: damages, method: dmgPayMode, debit: "Tenant AR (12413)", credit: "Repairs Recovery (41400)" }] : []),
          ...(outstandingRent > 0 ? [{ receiptNo: `${jvNo}-A2`, name: `Outstanding Rent Recovered`, amount: outstandingRent, method: dmgPayMode, debit: "Tenant AR (12413)", credit: "Rental Revenue (41100)" }] : []),
          ...(utilityCharges > 0 ? [{ receiptNo: `${jvNo}-A3`, name: `Kahramaa / Utility Charges`, amount: utilityCharges, method: dmgPayMode, debit: "Tenant AR (12413)", credit: "Utility Recovery (41400)" }] : []),
          ...(cleaningCharges > 0 ? [{ receiptNo: `${jvNo}-A4`, name: `Deep Cleaning Charges`, amount: cleaningCharges, method: dmgPayMode, debit: "Tenant AR (12413)", credit: "Cleaning Recovery (41400)" }] : []),
          ...(restorationCharges > 0 ? [{ receiptNo: `${jvNo}-A5`, name: `Painting / Restoration Charges`, amount: restorationCharges, method: dmgPayMode, debit: "Tenant AR (12413)", credit: "Restoration Recovery (41400)" }] : []),
          ...(otherDeductions > 0 ? [{ receiptNo: `${jvNo}-A6`, name: `Other Charges`, amount: otherDeductions, method: dmgPayMode, debit: "Tenant AR (12413)", credit: "Admin Recovery (41400)" }] : []),
        ],
        agencyCommission: 0,
        adminCharges: 0,
        utilityDeposit: utilityCharges,
        totalCollected: totalDeductions,
        cashierName: "Finance Department",
        notes: `Damage Settlement Collection Receipt | Channel: ${dmgPayMode}${settleRefundForm.paymentRefNo ? ` | Instrument/Ref: ${settleRefundForm.paymentRefNo}` : ''}${settleRefundForm.payerBank ? ` | Source/Bank: ${settleRefundForm.payerBank}` : ''}${dmgPayMode === "Bank Guarantee" && settleRefundForm.bgExpiryDate ? ` | BG Expiry: ${settleRefundForm.bgExpiryDate}` : ''}${settleRefundForm.paymentProofFileName ? ` | Attached Proof: ${settleRefundForm.paymentProofFileName}` : ''}${settleRefundForm.damageRemarks ? ` | Damage Agreement: ${settleRefundForm.damageRemarks}` : ''}`,
      };

      const refundDetailsText =
        settleRefundForm.paymentMethod === "Bank Transfer"
          ? `Bank: ${settleRefundForm.refundBank || 'QNB'}${settleRefundForm.refundIban ? ` | IBAN: ${settleRefundForm.refundIban}` : ''}${settleRefundForm.refundTxRef ? ` | Transfer Ref: ${settleRefundForm.refundTxRef}` : ''}${settleRefundForm.refundPaymentDate ? ` | Transfer Date: ${settleRefundForm.refundPaymentDate}` : ''}`
          : settleRefundForm.paymentMethod === "Cheque"
          ? `Cheque No: ${settleRefundForm.refundChequeNo || 'N/A'}${settleRefundForm.refundChequeBank ? ` | Issuing Bank: ${settleRefundForm.refundChequeBank}` : ''}${settleRefundForm.refundChequeDate ? ` | Cheque Date: ${settleRefundForm.refundChequeDate}` : ''}`
          : `Disbursed by: ${settleRefundForm.refundCashierName || 'Treasury'}${settleRefundForm.refundPaymentDate ? ` | Date: ${settleRefundForm.refundPaymentDate}` : ''}`;

      // ── RECEIPT 2: Full Security Deposit Refund Voucher (Payment Voucher) ──
      secondaryReceipt = {
        receiptNo: pvNo,
        acknowledgementNo: jvNo,
        date: settlementDate,
        tenantName: tenantName,
        tenantPhone: "",
        tenantEmail: "",
        tenantQid: "",
        propertyName: propName,
        unitRef: unitRef,
        leaseNo: lease ? `LES-${lease.id.toUpperCase()}` : `LES-${settlement.leaseId}`,
        leaseStartDate: lease?.startDate || settlementDate,
        leaseEndDate: lease?.endDate || settlementDate,
        monthlyRent: lease?.monthlyRent || 0,
        totalContractRent: lease ? lease.monthlyRent * (lease.pdcCount || 12) : 0,
        depositAmount: grossDeposit,
        depositMode: `Full Deposit Refund (${settleRefundForm.paymentMethod})`,
        pdcCount: 0,
        pdcs: [],
        vouchers: [
          { receiptNo: jvNo, name: `Security Deposit Liability Released (21500 → ${bankCrCode})`, amount: grossDeposit, method: "Journal", debit: "Security Deposit Liability (21500)", credit: bankCrName },
          ...(unusedRentRefund > 0 ? [{ receiptNo: `JV-UNR-${pvNo}`, name: `Unearned Rent Reversal — Unused Days (${settleRefundForm.daysOccupiedInMonth}/${settleRefundForm.totalDaysInMonth} days occupied)`, amount: unusedRentRefund, method: "Journal", debit: "Rental Revenue (41100)", credit: "Security Deposit Liability (21500)" }] : []),
          { receiptNo: pvNo, name: `Full Security Deposit Refund Paid (${settleRefundForm.paymentMethod}${settleRefundForm.refundTxRef ? ` • Ref: ${settleRefundForm.refundTxRef}` : settleRefundForm.refundChequeNo ? ` • Chq: ${settleRefundForm.refundChequeNo}` : ''})`, amount: refundable > 0 ? refundable : effectiveDeposit, method: settleRefundForm.paymentMethod, debit: bankCrName, credit: "Refund Payable (21300)" },
        ],
        agencyCommission: 0,
        adminCharges: 0,
        utilityDeposit: 0,
        totalCollected: refundable > 0 ? refundable : effectiveDeposit,
        cashierName: settleRefundForm.paymentMethod === "Cash" ? (settleRefundForm.refundCashierName || "Finance Department") : "Finance Department",
        notes: `Full Security Deposit Liability Refund (Damages settled separately via ${dmgPayMode}) | Gross Deposit: QR ${grossDeposit.toLocaleString()}${unusedRentRefund > 0 ? ` + Unused Rent Refund: QR ${unusedRentRefund.toLocaleString()} (${settleRefundForm.daysOccupiedInMonth}/${settleRefundForm.totalDaysInMonth} days)` : ''} | Refund Paid: QR ${(refundable > 0 ? refundable : effectiveDeposit).toLocaleString()} via ${settleRefundForm.paymentMethod} (${refundDetailsText})${settleRefundForm.refundProofFileName ? ` | Attached Proof: ${settleRefundForm.refundProofFileName}` : ''}${settleRefundForm.notes ? ` | Remarks: ${settleRefundForm.notes}` : ''}`,
        unusedRentRefund,
      };
    } else {
      const refundDetailsText =
        settleRefundForm.paymentMethod === "Bank Transfer"
          ? `Bank: ${settleRefundForm.refundBank || 'QNB'}${settleRefundForm.refundIban ? ` | IBAN: ${settleRefundForm.refundIban}` : ''}${settleRefundForm.refundTxRef ? ` | Transfer Ref: ${settleRefundForm.refundTxRef}` : ''}${settleRefundForm.refundPaymentDate ? ` | Transfer Date: ${settleRefundForm.refundPaymentDate}` : ''}`
          : settleRefundForm.paymentMethod === "Cheque"
          ? `Cheque No: ${settleRefundForm.refundChequeNo || 'N/A'}${settleRefundForm.refundChequeBank ? ` | Issuing Bank: ${settleRefundForm.refundChequeBank}` : ''}${settleRefundForm.refundChequeDate ? ` | Cheque Date: ${settleRefundForm.refundChequeDate}` : ''}`
          : `Disbursed by: ${settleRefundForm.refundCashierName || 'Treasury'}${settleRefundForm.refundPaymentDate ? ` | Date: ${settleRefundForm.refundPaymentDate}` : ''}`;

      // ── Deduct From Deposit Mode: Single Consolidated Receipt ──
      primaryReceipt = {
        receiptNo: pvNo,
        acknowledgementNo: jvNo,
        date: settlementDate,
        tenantName: tenantName,
        tenantPhone: "",
        tenantEmail: "",
        tenantQid: "",
        propertyName: propName,
        unitRef: unitRef,
        leaseNo: lease ? `LES-${lease.id.toUpperCase()}` : `LES-${settlement.leaseId}`,
        leaseStartDate: lease?.startDate || settlementDate,
        leaseEndDate: lease?.endDate || settlementDate,
        monthlyRent: lease?.monthlyRent || 0,
        totalContractRent: lease ? lease.monthlyRent * (lease.pdcCount || 12) : 0,
        depositAmount: grossDeposit,
        depositMode: `Security Deposit Refund (Deductions Applied)`,
        pdcCount: 0,
        pdcs: [],
        vouchers: [
          { receiptNo: jvNo, name: `Security Deposit Released (21500 → ${bankCrCode})`, amount: grossDeposit, method: "Journal", debit: "Security Deposit Liability (21500)", credit: bankCrName },
          ...(unusedRentRefund > 0 ? [{ receiptNo: `JV-UNR-${jvNo}`, name: `Unearned Rent Reversal — Unused Days (${settleRefundForm.daysOccupiedInMonth}/${settleRefundForm.totalDaysInMonth} days occupied)`, amount: unusedRentRefund, method: "Journal", debit: "Rental Revenue (41100)", credit: "Security Deposit Liability (21500)" }] : []),
          ...(refundable > 0 ? [{ receiptNo: pvNo, name: `Net Deposit Refund Paid (${settleRefundForm.paymentMethod}${settleRefundForm.refundTxRef ? ` • Ref: ${settleRefundForm.refundTxRef}` : settleRefundForm.refundChequeNo ? ` • Chq: ${settleRefundForm.refundChequeNo}` : ''})`, amount: refundable, method: settleRefundForm.paymentMethod, debit: bankCrName, credit: "Refund Payable (21300)" }] : []),
          ...(damages > 0 ? [{ receiptNo: `${jvNo}-A1`, name: `Damage / Repair Costs (Deducted from Deposit)`, amount: damages, method: "Deduction", debit: "Tenant AR (12413)", credit: "Repairs Recovery (41400)" }] : []),
          ...(outstandingRent > 0 ? [{ receiptNo: `${jvNo}-A2`, name: `Outstanding Rent Recovered`, amount: outstandingRent, method: "Deduction", debit: "Tenant AR (12413)", credit: "Rental Revenue (41100)" }] : []),
          ...(utilityCharges > 0 ? [{ receiptNo: `${jvNo}-A3`, name: `Kahramaa / Utility Charges`, amount: utilityCharges, method: "Deduction", debit: "Tenant AR (12413)", credit: "Utility Recovery (41400)" }] : []),
          ...(cleaningCharges > 0 ? [{ receiptNo: `${jvNo}-A4`, name: `Deep Cleaning Charges`, amount: cleaningCharges, method: "Deduction", debit: "Tenant AR (12413)", credit: "Cleaning Recovery (41400)" }] : []),
          ...(restorationCharges > 0 ? [{ receiptNo: `${jvNo}-A5`, name: `Painting / Restoration Charges`, amount: restorationCharges, method: "Deduction", debit: "Tenant AR (12413)", credit: "Restoration Recovery (41400)" }] : []),
          ...(otherDeductions > 0 ? [{ receiptNo: `${jvNo}-A6`, name: `Other Administrative Charges`, amount: otherDeductions, method: "Deduction", debit: "Tenant AR (12413)", credit: "Admin Recovery (41400)" }] : []),
        ],
        agencyCommission: 0,
        adminCharges: 0,
        utilityDeposit: utilityCharges,
        totalCollected: refundable,
        cashierName: settleRefundForm.paymentMethod === "Cash" ? (settleRefundForm.refundCashierName || "Finance Department") : "Finance Department",
        notes: `Settlement Mode: Deductions from Deposit | Gross Deposit: QR ${grossDeposit.toLocaleString()}${unusedRentRefund > 0 ? ` + Unused Rent Refund: QR ${unusedRentRefund.toLocaleString()} (${settleRefundForm.daysOccupiedInMonth}/${settleRefundForm.totalDaysInMonth} days)` : ''} | Total Deductions: QR ${totalDeductions.toLocaleString()} | Net Refund Paid: QR ${refundable.toLocaleString()} | Refund Channel: ${settleRefundForm.paymentMethod} (${refundDetailsText})${settleRefundForm.refundProofFileName ? ` | Attached Proof: ${settleRefundForm.refundProofFileName}` : ''}${settleRefundForm.damageRemarks ? ` | Damage Agreement: ${settleRefundForm.damageRemarks}` : ''}${settleRefundForm.notes ? ` | Remarks: ${settleRefundForm.notes}` : ''}`,
        unusedRentRefund,
      };
      secondaryReceipt = null;
    }

    setReceiptModalData(primaryReceipt);
    setReceiptModalSecondaryData(secondaryReceipt);
    setReceiptModalOpen(true);
    setSettleRefundOpen(false);

    recordAudit({
      stage: "Security Deposit Settlement & Lease Closure",
      owner: "Finance Department",
      input: `Deposit ${formatMoney(grossDeposit)}, deductions ${formatMoney(totalDeductions)}, refund ${formatMoney(refundable)}, mode: ${mode}${mode === "PAY_SEPARATELY" ? ` (${dmgPayMode}, ref: ${settleRefundForm.paymentRefNo || 'N/A'})` : ''}`,
      approval: "Settlement approval",
      status: "closed",
      output: `GL posted (${mode}): DR 21500 / CR ${bankCrCode}. ${mode === "PAY_SEPARATELY" && totalDeductions > 0 ? `RV ${rvDmgNo} (DR ${dmgDrCode} / CR 12413 via ${dmgPayMode}). ` : ''}PV ${pvNo}. Lease closed. Unit → ${settlement.unitDisposition || "Vacant"}.`,
    });

    toast.success(
      mode === "PAY_SEPARATELY"
        ? `Settlement approved! Generated 2 receipts: Damage collection (${dmgPayMode} QR ${totalDeductions.toLocaleString()}) & Full deposit refund (QR ${grossDeposit.toLocaleString()}).`
        : `Settlement approved! Net refund of QR ${refundable.toLocaleString()} paid. Receipt generated.`
    );
  }


  function issueKeyNotice(lease: Lease) {
    const blocked = !(lease.status === "fully_signed" && lease.collectionCompleted);
    const notice: KeyNotice = {
      id: `kn${keyNotices.length + 1}`,
      leaseId: lease.id,
      recipient: keyNotifyForm.recipients.join(", "),
      handoverAt: keyNotifyForm.handoverAt,
      status: blocked ? "blocked" : "sent",
      note: keyNotifyForm.note || (blocked ? "Lease must be fully signed and collection completed" : "Key issue approved"),
    };
    setKeyNotices((items) => [notice, ...items]);
    if (!blocked) advanceLease(lease, "active");
    recordAudit({
      stage: "Key Issue Notification",
      owner: "Leasing Department",
      input: `${lease.tenantName}, ${lease.unit}`,
      approval: blocked ? "Blocked by lease gate" : "Fully signed and collected",
      status: notice.status,
      output: blocked ? notice.note : "Tenant, property manager, security and facility team notified",
    });
    setKeyNotifyOpen(false);
  }

  const handoverTabOrder = ["details", "condition", "assets", "checklist", "acknowledgement"];

  function getNextHandoverTab(current: typeof handoverTabOrder[number]) {
    const index = handoverTabOrder.indexOf(current);
    return index >= 0 && index < handoverTabOrder.length - 1 ? handoverTabOrder[index + 1] : current;
  }

  function completeDetailedHandoverAction(lease: Lease) {
    const newHandover: KeyHandover = {
      id: `kh${Date.now()}`,
      leaseId: lease.id,
      handoverAt: `${handoverForm.handoverAt} ${handoverForm.handoverTime}`,
      keys: Number(handoverForm.keys) || 2,
      keyType: handoverForm.keyType || "Metal door keys",
      accessCards: Number(handoverForm.accessCards) || 2,
      parkingRemotes: Number(handoverForm.parkingRemotes) || 1,
      parkingDeviceDetails: handoverForm.parkingDeviceDetails || "None",
      electricityMeterReading: handoverForm.electricityMeterReading,
      waterMeterReading: handoverForm.waterMeterReading,
      meterInfo: `Elec: ${handoverForm.electricityMeterReading || "-"}, Water: ${handoverForm.waterMeterReading || "-"}`,
      unitCondition: handoverForm.unitCondition,
      cleanliness: handoverForm.cleanliness,
      acWorking: handoverForm.acWorking,
      plumbingOk: handoverForm.plumbingOk,
      electricalOk: handoverForm.electricalOk,
      doorsWindowsOk: handoverForm.doorsWindowsOk,
      idVerified: handoverForm.idVerified,
      photosTaken: Number(handoverForm.photosTaken) || 6,
      acknowledged: true,
      issuedBy: handoverForm.issuedBy,
      collectorName: handoverForm.collectorName || lease.tenantName,
      collectorIdNumber: handoverForm.collectorIdNumber,
      tenantAcknowledgement: handoverForm.tenantAcknowledgement || "Tenant acknowledged receipt",
      note: [
        handoverForm.note,
        handoverForm.assetChecklist ? `Asset Checklist: ${handoverForm.assetChecklist}` : "",
        handoverForm.checklistDocument ? `Checklist Doc: ${handoverForm.checklistDocument}` : "",
        handoverForm.handoverPhotos ? `Photos: ${handoverForm.handoverPhotos}` : "",
        `Finance Confirmed: ${handoverForm.financeConfirmed ? "Yes" : "No"}`,
        `PM Confirmed: ${handoverForm.propertyManagerConfirmed ? "Yes" : "No"}`,
        `Tenant Confirmed: ${handoverForm.tenantConfirmed ? "Yes" : "No"}`,
      ].filter(Boolean).join(" | "),
    };
    setHandovers((items) => [newHandover, ...items]);
    recordAudit({
      stage: "Key Handover",
      owner: "Property Manager",
      input: `${lease.unit} · ${handoverForm.keys}× ${handoverForm.keyType} · ${handoverForm.accessCards}× cards · ${handoverForm.parkingRemotes}× parking devices`,
      approval: `ID verified: ${handoverForm.idVerified ? "Yes" : "No"} · Tenant acknowledgement captured`,
      status: "acknowledged",
      output: handoverForm.note || `Handover recorded for ${handoverForm.collectorName || lease.tenantName} — Elec: ${handoverForm.electricityMeterReading || "-"}, Water: ${handoverForm.waterMeterReading || "-"}`,
    });
    setHandoverOpen(false);
  }

  function completeCheckIn(lease: Lease) {
    setInspections((items) => [
      {
        id: `ci${items.length + 1}`,
        leaseId: lease.id,
        type: "check_in",
        condition: checkInForm.condition,
        electricityMeter: checkInForm.electricityMeter || "182167",
        waterMeter: checkInForm.waterMeter || "149089",
        damages: checkInForm.damages || "None recorded",
        acknowledged: true,
        photos: Number(checkInForm.photos) || 8,
      },
      ...items,
    ]);
    setUnits((items) => items.map((item) => (item.unit === lease.unit ? { ...item, status: "Occupied" } : item)));
    recordAudit({
      stage: "Check-In Process",
      owner: "Property Manager",
      input: "Unit condition, meter readings, photos",
      approval: "Tenant acknowledgement",
      status: "completed",
      output: checkInForm.note || "Check-in report completed and unit marked occupied",
    });
    setHandoverOpen(false);
  }

  function completeHandoverAndCheckIn(lease: Lease) {
    completeDetailedHandoverAction(lease);
    completeDetailedCheckIn(lease);
  }

  function issueDetailedKeyNotice(lease: Lease) {
    const blocked = !(lease.status === "fully_signed" && lease.collectionCompleted);
    const notice: KeyNotice = {
      id: `kn${keyNotices.length + 1}`,
      leaseId: lease.id,
      recipient: keyNotifyForm.recipients.join(", "),
      handoverAt: keyNotifyForm.handoverAt,
      handoverTime: keyNotifyForm.handoverTime,
      status: blocked ? "blocked" : "sent",
      note: keyNotifyForm.note || (blocked ? "Lease must be fully signed and collection completed" : "Key issue approved"),
      authorizedCollector: keyNotifyForm.authorizedCollector || lease.tenantName,
      keysSummary: keyNotifyForm.keysSummary,
      staffContact: keyNotifyForm.staffContact,
      outstandingRequirements: keyNotifyForm.outstandingRequirements || "None",
    };
    setKeyNotices((items) => [notice, ...items]);
    recordAudit({
      stage: "Key Issue Notification",
      owner: "Leasing Department",
      input: `${lease.tenantName}, ${lease.property}, ${lease.unit}, start ${lease.startDate}, handover ${keyNotifyForm.handoverAt} ${keyNotifyForm.handoverTime}`,
      approval: blocked ? "Blocked by lease gate" : "Fully signed and collected",
      status: notice.status,
      output: blocked ? notice.note : `Tenant, PM, staff and support teams notified; collector ${notice.authorizedCollector}; outstanding: ${notice.outstandingRequirements}`,
    });
    setKeyNotifyOpen(false);
  }

  // (unified into completeDetailedHandoverAction above)

  function completeDetailedCheckIn(lease: Lease) {
    setInspections((items) => [
      {
        id: `ci${items.length + 1}`,
        leaseId: lease.id,
        type: "check_in",
        condition: checkInForm.condition,
        furnitureCondition: checkInForm.furnitureCondition,
        fixturesCondition: checkInForm.fixturesCondition,
        wallFloorCeilingCondition: checkInForm.wallFloorCeilingCondition,
        acCondition: checkInForm.acCondition,
        electricityMeter: checkInForm.electricityMeter || "182167",
        waterMeter: checkInForm.waterMeter || "149089",
        damages: checkInForm.damages || "None recorded",
        pendingMaintenance: checkInForm.pendingMaintenance || "None",
        acknowledged: true,
        photos: Number(checkInForm.photos) || 8,
      },
      ...items,
    ]);
    advanceLease(lease, "active");
    setUnits((items) => items.map((item) => (item.unit === lease.unit ? { ...item, status: "Occupied" } : item)));
    recordAudit({
      stage: "Check-In Process",
      owner: "Property Manager",
      input: "Unit condition, fixtures, utilities, photos, damage log and maintenance follow-up",
      approval: "Tenant acknowledgement",
      status: "completed",
      output: checkInForm.note || "Check-in report completed, maintenance logged where needed, and unit marked occupied",
    });
    setHandoverOpen(false);
  }

  function startCheckout(lease: Lease) {
    const moveOutDate = startCheckoutForm.moveOutDate || lease.endDate;
    const isEarlyVacate = new Date(moveOutDate).getTime() < new Date(lease.endDate).getTime();

    // 1. Update lease status
    setLeases((items) => items.map((item) => (
      item.id === lease.id
        ? {
            ...item,
            status: "checkout" as LeaseStatus,
            plannedVacateDate: moveOutDate,
            earlyVacate: isEarlyVacate,
            earlyVacateReason: isEarlyVacate ? (startCheckoutForm.notes || "Tenant requested vacating before lease expiry") : item.earlyVacateReason,
          }
        : item
    )));
    
    // 2. Update renewal case status to non_renewal
    setRenewals((items) => items.map((item) => (item.leaseId === lease.id ? { ...item, status: "non_renewal" as RenewalCase["status"] } : item)));

    // 3. Add or update checkout case
    setCheckouts((items) => {
      const existing = items.find(c => c.leaseId === lease.id);
      const newCheckout: CheckoutCase = {
        id: existing?.id || `co${items.length + 1}`,
        leaseId: lease.id,
        noticeDate: startCheckoutForm.noticeDate || today.toISOString().split("T")[0],
        moveOutDate,
        originalLeaseEndDate: lease.endDate,
        earlyVacate: isEarlyVacate,
        inspectionDate: startCheckoutForm.inspectionDate || addDays(new Date(lease.endDate), -3),
        comparisonSummary: "Pending final comparison with original check-in report",
        nonRenewalNotice: startCheckoutForm.notes || (isEarlyVacate ? "Tenant early vacate notice received" : "Tenant non-renewal notice received"),
        outstandingCharges: startCheckoutForm.outstandingCharges,
        utilityClearanceRequirements: startCheckoutForm.utilityClearanceRequirements,
        keyReturnRequirements: startCheckoutForm.keyReturnRequirements,
        financeClearance: false,
        utilityClearance: false,
        keysReturned: false,
        status: "planned",
      };
      if (existing) {
        return items.map(c => c.leaseId === lease.id ? newCheckout : c);
      }
      return [newCheckout, ...items];
    });

    recordAudit({
      stage: isEarlyVacate ? "Early Vacate & Check-Out" : "Non-Renewal & Check-Out",
      owner: "Leasing Department",
      input: `${lease.tenantName}, notice ${startCheckoutForm.noticeDate}, move-out ${moveOutDate}, lease expiry ${lease.endDate}, inspection ${startCheckoutForm.inspectionDate}`,
      approval: isEarlyVacate ? "Tenant early vacate notice" : "Tenant non-renewal notice",
      status: "planned",
      output: startCheckoutForm.notes || (isEarlyVacate
        ? "Early vacate checkout case opened; future PDCs and deposit settlement will be adjusted at closure"
        : "Checkout case opened with finance, utility and key-return requirements"),
    });

    toast.success(`${isEarlyVacate ? "Early vacate" : "Non-renewal"} initiated for ${lease.tenantName}. Checkout case opened.`);
    setStartCheckoutOpen(false);
  }

  function completeCheckout(checkout: CheckoutCase) {
    const lease = leases.find((item) => item.id === checkout.leaseId);
    if (!lease) return;
    setCheckouts((items) =>
      items.map((item) =>
        item.id === checkout.id
          ? {
            ...item,
            financeClearance: completeCheckoutForm.financeClearance,
            utilityClearance: completeCheckoutForm.utilityClearance,
            keysReturned: completeCheckoutForm.keysReturned,
            status: "ready_for_settlement",
            comparisonSummary: "Normal wear separated from tenant-caused damages",
            outstandingCharges: completeCheckoutForm.outstandingRent,
          }
          : item,
      ),
    );
    setInspections((items) => [
      {
        id: `coi${items.length + 1}`,
        leaseId: lease.id,
        type: "check_out",
        condition: `${completeCheckoutForm.condition} | Handover: ${completeCheckoutForm.handoverConditionSummary || "Not recorded"} | Final: ${completeCheckoutForm.finalConditionSummary || "Not recorded"}`,
        electricityMeter: completeCheckoutForm.electricityMeter || "182207",
        waterMeter: completeCheckoutForm.waterMeter || "149129",
        damages: completeCheckoutForm.damages || "None",
        pendingMaintenance: `Missing items: ${completeCheckoutForm.missingItems || "None"}; checkout photos: ${completeCheckoutForm.checkoutPhotos || "None"}; report: ${completeCheckoutForm.checkoutReportFile || "Pending"}`,
        acknowledged: true,
        photos: Number(completeCheckoutForm.photos) || 12,
      },
      ...items,
    ]);
    const _outstandingRent = Number(completeCheckoutForm.outstandingRent) || 0;
    const _damages = Number(completeCheckoutForm.damagesAmount) || 0;
    const _utility = Number(completeCheckoutForm.utilityCharges) || 0;
    const _cleaning = Number(completeCheckoutForm.cleaningCharges) || 0;
    const _restoration = Number(completeCheckoutForm.restorationCharges) || 0;
    const _other = Number(completeCheckoutForm.otherDeductions) || 0;
    const _daysOccupied = Number(completeCheckoutForm.daysOccupiedInMonth) || 30;
    const _totalDays = Number(completeCheckoutForm.totalDaysInMonth) || 30;
    const _isPdcDeposited = completeCheckoutForm.currentMonthPdcDeposited;
    const _unusedRent = Number(completeCheckoutForm.unusedRentRefund) || 0;
    const _totalDeductions = _outstandingRent + _damages + _utility + _cleaning + _restoration + _other;
    const _refundableBalance = Math.max(0, lease.securityDeposit + (_isPdcDeposited ? _unusedRent : 0) - _totalDeductions);

    setSettlements((items) => [
      {
        id: `s${items.length + 1}`,
        leaseId: lease.id,
        depositReceived: lease.securityDeposit,
        outstandingRent: _outstandingRent,
        damages: _damages,
        utilityCharges: _utility,
        cleaningCharges: _cleaning,
        restorationCharges: _restoration,
        otherDeductions: _other,
        daysOccupiedInMonth: _daysOccupied,
        totalDaysInMonth: _totalDays,
        currentMonthPdcDeposited: _isPdcDeposited,
        unusedRentRefund: _unusedRent,
        refundableBalance: _refundableBalance,
        unitDisposition: completeCheckoutForm.unitDisposition,
        approval: "pending_approval",
      },
      ...items,
    ]);
    recordAudit({
      stage: "Check-Out Inspection",
      owner: "Property Manager",
      input: "Condition, meters, keys, utilities, damages, missing items, cleaning/restoration review",
      approval: "Tenant acknowledgement",
      status: "ready_for_settlement",
      output: `${checkout.earlyVacate ? "Early vacate" : "Checkout"} settlement draft created with damages, cleaning/restoration and refund recommendation`,
    });
    setCompleteCheckoutOpen(false);
  }

  function handlePdcRowChange(idx: number, field: "chequeNo" | "bank" | "amount" | "maturityDate" | "tenureStart" | "tenureEnd" | "file", value: string) {
    setPdcRows((prev) => {
      const newRows = [...prev];
      const oldValue = newRows[idx][field];
      newRows[idx] = { ...newRows[idx], [field]: value };
      
      if (idx === 0 && oldValue !== value) {
        const lease = leases.find(l => l.id === pdcLeaseId);
        const count = lease ? lease.pdcCount : 12;
        
        for (let i = 1; i < count; i++) {
          if (field === "amount" && !prev[i].amount) {
            newRows[i].amount = value;
          }
          if (field === "bank" && !prev[i].bank) {
            newRows[i].bank = value;
          }
          if (field === "maturityDate" && value && (!prev[i].maturityDate || prev[i].maturityDate === today.toISOString().split("T")[0])) {
            const date = new Date(value);
            date.setMonth(date.getMonth() + i);
            newRows[i].maturityDate = date.toISOString().split("T")[0];
          }
          if (field === "tenureStart" && value && !prev[i].tenureStart) {
            const date = new Date(value);
            date.setMonth(date.getMonth() + i);
            newRows[i].tenureStart = date.toISOString().split("T")[0];
          }
          if (field === "tenureEnd" && value && !prev[i].tenureEnd) {
            const date = new Date(value);
            date.setMonth(date.getMonth() + i);
            newRows[i].tenureEnd = date.toISOString().split("T")[0];
          }
        }
      }
      return newRows;
    });
  }

  function addManualPdc() {
    const validRows = pdcRows.filter((row) => row.chequeNo || row.bank || row.amount || row.file);
    if (!pdcLeaseId) {
      alert("Please select a lease before adding PDC details.");
      return;
    }
    if (validRows.length === 0) {
      alert("Please enter at least one PDC line before saving.");
      return;
    }

    const invalidRow = validRows.find(
      (row) => !row.chequeNo || !row.bank || !row.amount || !row.maturityDate || !row.file,
    );
    if (invalidRow) {
      alert("Please fill all required fields for every PDC row you have started.");
      return;
    }

    const newPdcs: Pdc[] = validRows.map((row, index) => ({
      id: `p${pdcs.length + index + 1}`,
      leaseId: pdcLeaseId,
      chequeNo: row.chequeNo,
      bank: row.bank,
      date: row.maturityDate,
      amount: Number(row.amount) || 0,
      status: "received",
      file: row.file,
    }));

    setPdcs((items) => [...newPdcs, ...items]);
    recordAudit({
      stage: "PDC Bulk Added",
      owner: "Finance",
      input: `${newPdcs.length} PDC cheque(s) recorded for lease ${pdcLeaseId}`,
      approval: "Manual bulk entry",
      status: "received",
      output: `${newPdcs.length} PDCs recorded into the system for lease ${pdcLeaseId}`,
    });
    setPdcRows(Array.from({ length: 12 }, () => ({ chequeNo: "", bank: "", amount: "", maturityDate: today.toISOString().split("T")[0], tenureStart: "", tenureEnd: "", file: "" })));
    setPdcLeaseId("");
    setAddPdcOpen(false);
  }

  return (
    <div className="space-y-6">

      {/* ── CREATE LEASE DIALOG ───────────────────────────────────── */}

      <Dialog open={createReservationOpen} onOpenChange={setCreateReservationOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[88vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-sm">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Reserve Property Unit</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Locks unit from Available to Reserved until lease conversion or validity expiration.</DialogDescription>
            </div>
          </div>
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Target Property *">
                <SearchableSelect
                  value={reservationForm.property}
                  onValueChange={(property) => setReservationForm((form) => ({ ...form, property, unit: "" }))}
                  placeholder="Select Property"
                  emptyText="No property found."
                  options={Array.from(new Set((realUnits.length > 0 ? realUnits : units).map(u => u.property))).map(prop => ({ label: prop, value: prop }))}
                />
              </Field>
              <Field label="Available Unit *">
                <SearchableSelect
                  value={reservationForm.unit}
                  onValueChange={(unit) => setReservationForm((form) => ({ ...form, unit }))}
                  disabled={!reservationForm.property}
                  placeholder="Select Unit"
                  emptyText="No available unit found for this property."
                  options={(realUnits.length > 0 ? realUnits : units)
                    .filter(u => {
                      if (u.property !== reservationForm.property) return false;
                      if (u.status && u.status.toLowerCase() !== "available") return false;
                      const isReserved = reservations.some(
                        r => r.property === u.property && r.unit === u.unit && (r.status === "reserved" || r.status === "converted")
                      );
                      if (isReserved) return false;
                      const isLeased = leases.some(
                        l => l.property === u.property && l.unit === u.unit && (l.status === "active" || l.status === "fully_signed" || l.status === "collection_completed")
                      );
                      if (isLeased) return false;
                      return true;
                    })
                    .map((unit) => ({ label: `${unit.unit} - Available`, value: unit.unit }))}
                />
              </Field>
            </div>
            
            <Field label="Prospective Tenant Customer *">
              <SearchableSelect
                value={reservationForm.tenantName}
                onValueChange={(tenantName) => setReservationForm((form) => ({ ...form, tenantName }))}
                placeholder="Select Customer Profile"
                emptyText="No customer found."
                options={customers.map((c) => ({ label: `${c.name} (${c.type})`, value: c.name }))}
              />
            </Field>

            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-primary" /> Reservation Timing & Terms
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Expected Lease Start"><Input type="date" value={reservationForm.startDate} onChange={(event) => setReservationForm((form) => ({ ...form, startDate: event.target.value }))} className="bg-background" /></Field>
                <Field label="Validity Hold (Days)"><Input type="number" value={reservationForm.validityDays} onChange={(event) => setReservationForm((form) => ({ ...form, validityDays: event.target.value }))} className="bg-background" /></Field>
              </div>
              <Field label="Proposed Monthly Rent (QR)"><Input type="number" placeholder="0.00" value={reservationForm.rent} onChange={(event) => setReservationForm((form) => ({ ...form, rent: event.target.value }))} className="bg-background" /></Field>
            </div>

            <Field label="Internal Remarks / Notes"><Textarea rows={2} placeholder="Optional notes regarding reservation deposit or booking terms..." value={reservationForm.remarks} onChange={(event) => setReservationForm((form) => ({ ...form, remarks: event.target.value }))} className="text-xs" /></Field>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex items-center justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setCreateReservationOpen(false)}>Cancel</Button>
            <Button size="sm" className="shadow-sm" onClick={async () => {
              await withBusy("reserve", createReservation);
              setCreateReservationOpen(false);
            }}>
              {busyAction === "reserve" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              Confirm Unit Reservation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createCustomerOpen} onOpenChange={setCreateCustomerOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[88vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">New Customer Profile</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Register individual or corporate tenant details with KYC identity validation.</DialogDescription>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name / Entity Name *">
                <Input placeholder="e.g. John Doe / Gulf Trading W.L.L." value={customerForm.name} onChange={(event) => setCustomerForm((form) => ({ ...form, name: event.target.value }))} className="bg-background/80" />
              </Field>
              <Field label="Customer Type">
                <Select value={customerForm.type} onValueChange={(type: Customer["type"]) => setCustomerForm((form) => ({ ...form, type }))}>
                  <SelectTrigger className="bg-background/80"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="individual">Individual</SelectItem><SelectItem value="company">Corporate / Company</SelectItem></SelectContent>
                </Select>
              </Field>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4 space-y-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" /> Identity & Verification Details
              </span>
              {customerForm.type === "individual" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Qatar ID (QID)">
                      <Input
                        placeholder="11 digits (e.g. 28463400000)"
                        maxLength={11}
                        value={customerForm.qatarId}
                        onChange={(event) => setCustomerForm((form) => ({ ...form, qatarId: event.target.value.replace(/\D/g, '') }))}
                        className="bg-background font-mono"
                      />
                    </Field>
                    <Field label="Passport Number">
                      <Input
                        placeholder="9 characters (e.g. A12345678)"
                        maxLength={9}
                        value={customerForm.passport}
                        onChange={(event) => setCustomerForm((form) => ({ ...form, passport: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                        className="bg-background font-mono uppercase"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nationality">
                      <SearchableSelect
                        options={nationalityOptions}
                        value={customerForm.nationality}
                        onValueChange={(val) => setCustomerForm((form) => ({ ...form, nationality: val }))}
                        placeholder="Search & Select Nationality..."
                        emptyText="No matching nationality found."
                      />
                    </Field>
                    <Field label="Emergency Contact">
                      <Input
                        placeholder="+974 5555 1234"
                        value={customerForm.emergencyContact}
                        onChange={(event) => setCustomerForm((form) => ({ ...form, emergencyContact: event.target.value }))}
                        className="bg-background"
                      />
                    </Field>
                  </div>
                  <Field label="Profession">
                    <SearchableSelect
                      options={professionOptions}
                      value={customerForm.employerInfo}
                      onValueChange={(val) => setCustomerForm((form) => ({ ...form, employerInfo: val }))}
                      placeholder="Search & Select Profession..."
                      emptyText="No matching profession found."
                    />
                  </Field>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Commercial Registration (CR)"><Input placeholder="12345/00" value={customerForm.crNumber} onChange={(event) => setCustomerForm((form) => ({ ...form, crNumber: event.target.value }))} className="bg-background font-mono" /></Field>
                    <Field label="Authorized Signatory"><Input placeholder="Managing Director / POA" value={customerForm.authorizedSignatory} onChange={(event) => setCustomerForm((form) => ({ ...form, authorizedSignatory: event.target.value }))} className="bg-background" /></Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Emergency Contact"><Input placeholder="+974 4400 0000" value={customerForm.emergencyContact} onChange={(event) => setCustomerForm((form) => ({ ...form, emergencyContact: event.target.value }))} className="bg-background" /></Field>
                    <Field label="Company / Ops Contact"><Input placeholder="Operations Manager" value={customerForm.employerInfo} onChange={(event) => setCustomerForm((form) => ({ ...form, employerInfo: event.target.value }))} className="bg-background" /></Field>
                  </div>
                </>
              )}
            </div>

            <div className="rounded-xl border bg-muted/20 p-4 space-y-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileSignature className="h-3.5 w-3.5 text-primary" /> Contact & Address Records
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mobile Number *"><Input placeholder="+974 3300 0000" value={customerForm.mobile} onChange={(event) => setCustomerForm((form) => ({ ...form, mobile: event.target.value }))} className="bg-background" /></Field>
                <Field label="Email Address *"><Input placeholder="tenant@domain.qa" value={customerForm.email} onChange={(event) => setCustomerForm((form) => ({ ...form, email: event.target.value }))} className="bg-background" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Permanent Address"><Textarea rows={2} placeholder="Home country / headquarters address..." value={customerForm.permanentAddress} onChange={(event) => setCustomerForm((form) => ({ ...form, permanentAddress: event.target.value }))} className="bg-background text-xs" /></Field>
                <Field label="Local Qatar Address"><Textarea rows={2} placeholder="Building, Street, Zone / PO Box..." value={customerForm.localAddress} onChange={(event) => setCustomerForm((form) => ({ ...form, localAddress: event.target.value }))} className="bg-background text-xs" /></Field>
              </div>
            </div>
          </div>

          <div className="px-6 py-3.5 bg-muted/40 border-t flex items-center justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setCreateCustomerOpen(false)}>Cancel</Button>
            <Button size="sm" className="shadow-sm" onClick={async () => {
              await withBusy("customer", createCustomer);
              setCreateCustomerOpen(false);
            }}>
              {busyAction === "customer" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Save Customer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── VIEW CUSTOMER DIALOG ──────────────────────────────────── */}
      <Dialog open={viewCustomerOpen} onOpenChange={setViewCustomerOpen}>
        <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2">{viewCustomerData?.name}</DialogTitle>
                <DialogDescription className="text-xs">Customer Profile ID &amp; KYC Overview</DialogDescription>
              </div>
            </div>
            {viewCustomerData && <StatusBadge value={viewCustomerData.status} />}
          </div>
          {viewCustomerData && (
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm">
              <div className="grid grid-cols-3 gap-3 bg-muted/30 p-3.5 rounded-xl border">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Type</div>
                  <div className="font-semibold capitalize text-foreground mt-0.5">{viewCustomerData.type}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Primary ID</div>
                  <div className="font-mono font-bold text-foreground mt-0.5">{viewCustomerData.qatarId || viewCustomerData.passport || viewCustomerData.crNumber || "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Nationality</div>
                  <div className="font-semibold text-foreground mt-0.5">{viewCustomerData.nationality || "—"}</div>
                </div>
              </div>
              
              <div className="space-y-2.5 border rounded-xl p-4 bg-muted/10">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Verified Contact Information
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-background border"><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Mobile</span><strong className="text-foreground">{viewCustomerData.mobile || "—"}</strong></div>
                  <div className="p-2.5 rounded-lg bg-background border"><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Email</span><strong className="text-foreground truncate block">{viewCustomerData.email || "—"}</strong></div>
                  <div className="p-2.5 rounded-lg bg-background border"><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Emergency</span><strong className="text-foreground">{viewCustomerData.emergencyContact || "—"}</strong></div>
                  <div className="p-2.5 rounded-lg bg-background border"><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Profession / Signatory</span><strong className="text-foreground truncate block">{viewCustomerData.employerInfo || viewCustomerData.authorizedSignatory || "—"}</strong></div>
                </div>
                {viewCustomerData.permanentAddress && (
                  <div className="p-2.5 rounded-lg bg-background border text-xs"><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Permanent Address</span>{viewCustomerData.permanentAddress}</div>
                )}
                {viewCustomerData.localAddress && (
                  <div className="p-2.5 rounded-lg bg-background border text-xs"><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Local Address</span>{viewCustomerData.localAddress}</div>
                )}
              </div>
            </div>
          )}
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setViewCustomerOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── EDIT CUSTOMER DIALOG ──────────────────────────────────── */}
      <Dialog open={editCustomerOpen} onOpenChange={setEditCustomerOpen}>
        <DialogContent className="sm:max-w-[560px] max-h-[88vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Edit Customer Profile</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Update profile details for {editCustomerData?.name}.</DialogDescription>
            </div>
          </div>
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name / Entity Name *"><Input value={customerForm.name} onChange={(event) => setCustomerForm((form) => ({ ...form, name: event.target.value }))} className="bg-background/80" /></Field>
              <Field label="Type">
                <Select value={customerForm.type} onValueChange={(type: Customer["type"]) => setCustomerForm((form) => ({ ...form, type }))}>
                  <SelectTrigger className="bg-background/80"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="individual">Individual</SelectItem><SelectItem value="company">Company</SelectItem></SelectContent>
                </Select>
              </Field>
            </div>
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" /> Identity Credentials
              </span>
              {customerForm.type === "individual" ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Qatar ID (QID)">
                      <Input
                        placeholder="11 digits (e.g. 28463400000)"
                        maxLength={11}
                        value={customerForm.qatarId}
                        onChange={(event) => setCustomerForm((form) => ({ ...form, qatarId: event.target.value.replace(/\D/g, '') }))}
                        className="bg-background font-mono"
                      />
                    </Field>
                    <Field label="Passport Number">
                      <Input
                        placeholder="9 characters (e.g. A12345678)"
                        maxLength={9}
                        value={customerForm.passport}
                        onChange={(event) => setCustomerForm((form) => ({ ...form, passport: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                        className="bg-background font-mono uppercase"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Nationality">
                      <SearchableSelect
                        options={nationalityOptions}
                        value={customerForm.nationality}
                        onValueChange={(val) => setCustomerForm((form) => ({ ...form, nationality: val }))}
                        placeholder="Search & Select Nationality..."
                        emptyText="No matching nationality found."
                      />
                    </Field>
                    <Field label="Emergency Contact">
                      <Input
                        placeholder="+974 5555 1234"
                        value={customerForm.emergencyContact}
                        onChange={(event) => setCustomerForm((form) => ({ ...form, emergencyContact: event.target.value }))}
                        className="bg-background"
                      />
                    </Field>
                  </div>
                  <Field label="Profession">
                    <SearchableSelect
                      options={professionOptions}
                      value={customerForm.employerInfo}
                      onValueChange={(val) => setCustomerForm((form) => ({ ...form, employerInfo: val }))}
                      placeholder="Search & Select Profession..."
                      emptyText="No matching profession found."
                    />
                  </Field>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Commercial Registration"><Input value={customerForm.crNumber} onChange={(event) => setCustomerForm((form) => ({ ...form, crNumber: event.target.value }))} className="bg-background font-mono" /></Field>
                    <Field label="Authorized Signatory"><Input value={customerForm.authorizedSignatory} onChange={(event) => setCustomerForm((form) => ({ ...form, authorizedSignatory: event.target.value }))} className="bg-background" /></Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Emergency Contact"><Input value={customerForm.emergencyContact} onChange={(event) => setCustomerForm((form) => ({ ...form, emergencyContact: event.target.value }))} className="bg-background" /></Field>
                    <Field label="Company / Ops Contact"><Input value={customerForm.employerInfo} onChange={(event) => setCustomerForm((form) => ({ ...form, employerInfo: event.target.value }))} className="bg-background" /></Field>
                  </div>
                </>
              )}
            </div>
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileSignature className="h-3.5 w-3.5 text-primary" /> Contact & Address
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Mobile"><Input value={customerForm.mobile} onChange={(event) => setCustomerForm((form) => ({ ...form, mobile: event.target.value }))} className="bg-background" /></Field>
                <Field label="Email"><Input value={customerForm.email} onChange={(event) => setCustomerForm((form) => ({ ...form, email: event.target.value }))} className="bg-background" /></Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Permanent Address"><Textarea rows={2} value={customerForm.permanentAddress} onChange={(event) => setCustomerForm((form) => ({ ...form, permanentAddress: event.target.value }))} className="bg-background text-xs" /></Field>
                <Field label="Local Address"><Textarea rows={2} value={customerForm.localAddress} onChange={(event) => setCustomerForm((form) => ({ ...form, localAddress: event.target.value }))} className="bg-background text-xs" /></Field>
              </div>
            </div>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex items-center justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setEditCustomerOpen(false)}>Cancel</Button>
            <Button size="sm" className="shadow-sm" onClick={() => {
              if (editCustomerData) {
                const valErr = validateCustomerIdentifiers(customerForm);
                if (valErr) {
                  alert(valErr);
                  return;
                }
                if (isCustomerDuplicate(customerForm, editCustomerData.id)) {
                  alert("Another customer already has this Qatar ID, Passport, CR Number, Mobile, or Email.");
                  return;
                }
                setCustomers(prev => prev.map(c => c.id === editCustomerData.id ? { ...c, ...customerForm } : c));
                toast.success("Customer profile updated successfully.");
                setEditCustomerOpen(false);
              }
            }}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={createLeaseOpen} onOpenChange={setCreateLeaseOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <FileSignature className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Create Lease Agreement</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {selectedReservationForLease ? (
                  <span>Convert reservation · Unit: <strong className="text-foreground">{selectedReservationForLease.unit}</strong> · Tenant: <strong className="text-foreground">{selectedReservationForLease.tenantName}</strong></span>
                ) : "Generate lease contract terms and schedule."}
              </DialogDescription>
            </div>
          </div>

          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-primary" /> Lease Period & Duration
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Lease Start Date *">
                  <Input type="date" value={createLeaseForm.startDate} onChange={e => setCreateLeaseForm(f => ({ ...f, startDate: e.target.value }))} className="bg-background" />
                </Field>
                <Field label="Lease End Date *">
                  <Input type="date" value={createLeaseForm.endDate} onChange={e => setCreateLeaseForm(f => ({ ...f, endDate: e.target.value }))} className="bg-background" />
                </Field>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Banknote className="h-3.5 w-3.5 text-primary" /> Financial & PDC Terms
              </span>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Monthly Rent (QR) *">
                  <Input type="number" value={createLeaseForm.monthlyRent} onChange={e => setCreateLeaseForm(f => ({ ...f, monthlyRent: e.target.value }))} className="bg-background" />
                </Field>
                <Field label="Security Deposit (QR) *">
                  <Input type="number" value={createLeaseForm.securityDeposit} onChange={e => setCreateLeaseForm(f => ({ ...f, securityDeposit: e.target.value }))} className="bg-background" />
                </Field>
                <Field label="Payment Frequency">
                  <Select value={createLeaseForm.paymentFrequency} onValueChange={v => setCreateLeaseForm(f => ({ ...f, paymentFrequency: v as Lease["paymentFrequency"] }))}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="half_yearly">Half Yearly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="No. of PDC Cheques">
                  <Input type="number" min={1} max={36} value={createLeaseForm.pdcCount} onChange={e => setCreateLeaseForm(f => ({ ...f, pdcCount: e.target.value }))} className="bg-background" />
                </Field>
                <Field label="Grace Period (days)">
                  <Input type="number" value={createLeaseForm.gracePeriodDays} onChange={e => setCreateLeaseForm(f => ({ ...f, gracePeriodDays: e.target.value }))} className="bg-background" />
                </Field>
                <Field label="Notice Period (days)">
                  <Input type="number" value={createLeaseForm.noticePeriodDays} onChange={e => setCreateLeaseForm(f => ({ ...f, noticePeriodDays: e.target.value }))} className="bg-background" />
                </Field>
              </div>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ClipboardCheck className="h-3.5 w-3.5 text-primary" /> Responsibilities & Special Clauses
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Maintenance Responsibility">
                  <Select value={createLeaseForm.maintenanceResponsibility} onValueChange={v => setCreateLeaseForm(f => ({ ...f, maintenanceResponsibility: v }))}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Owner/Property Manager for major repairs; tenant for misuse">Owner/PM – Major; Tenant – Misuse</SelectItem>
                      <SelectItem value="Tenant">Tenant (Full)</SelectItem>
                      <SelectItem value="Owner">Owner (Full)</SelectItem>
                      <SelectItem value="Shared as per lease clause">Shared as per Clause</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Utility Responsibility">
                  <Select value={createLeaseForm.utilityResponsibility} onValueChange={v => setCreateLeaseForm(f => ({ ...f, utilityResponsibility: v }))}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tenant">Tenant</SelectItem>
                      <SelectItem value="Owner">Owner</SelectItem>
                      <SelectItem value="Shared">Shared</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Parking / Facility Details">
                  <Input value={createLeaseForm.parkingDetails} onChange={e => setCreateLeaseForm(f => ({ ...f, parkingDetails: e.target.value }))} className="bg-background" placeholder="e.g. 1 bay / remote #44" />
                </Field>
                <Field label="Penalties Description">
                  <Input value={createLeaseForm.penalties} onChange={e => setCreateLeaseForm(f => ({ ...f, penalties: e.target.value }))} className="bg-background" placeholder="QR 100/day after grace period" />
                </Field>
              </div>
              <Field label="Special Contract Conditions">
                <Textarea rows={2} value={createLeaseForm.specialConditions} onChange={e => setCreateLeaseForm(f => ({ ...f, specialConditions: e.target.value }))} placeholder="Any specific covenants, permissions or rules..." className="bg-background text-xs" />
              </Field>
            </div>
          </div>

          <div className="px-6 py-3.5 bg-muted/40 border-t flex items-center justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setCreateLeaseOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              className="shadow-sm"
              onClick={() => {
                if (!createLeaseForm.startDate || !createLeaseForm.endDate || !createLeaseForm.monthlyRent) {
                  alert("Start Date, End Date and Monthly Rent are required.");
                  return;
                }
                if (selectedReservationForLease) createLeaseFromReservation(selectedReservationForLease, createLeaseForm);
              }}
            >
              <FileSignature className="mr-2 h-4 w-4" /> Create Lease
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── UPLOAD DOC DIALOG ─────────────────────────────────────── */}
      <Dialog open={uploadDocOpen} onOpenChange={setUploadDocOpen}>
        <DialogContent className="sm:max-w-[480px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-sm">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Upload Tenant Document</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Upload identification, commercial or contract attachments.</DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center">
              <Upload className="mx-auto h-8 w-8 text-primary/60 mb-2" />
              <Field label="Select File *">
                <Input type="file" className="cursor-pointer bg-background" onChange={e => {
                  const name = e.target.files?.[0]?.name || "";
                  setUploadDocForm(f => ({ ...f, file: name, fileName: f.fileName || name }));
                }} />
              </Field>
              {uploadDocForm.file && <p className="text-xs text-primary font-medium mt-2">Selected: {uploadDocForm.file}</p>}
            </div>
            <Field label="Custom Document Name (Optional)">
              <Input value={uploadDocForm.fileName} onChange={e => setUploadDocForm(f => ({ ...f, fileName: e.target.value }))} placeholder="e.g. Qatar ID - Front and Back" />
            </Field>
            <Field label="Remarks (Optional)">
              <Textarea rows={2} value={uploadDocForm.remarks} onChange={e => setUploadDocForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes for verifier..." className="text-xs" />
            </Field>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setUploadDocOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submitUploadDoc}><ClipboardCheck className="mr-2 h-4 w-4" /> Upload Document</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── RELEASE RESERVATION DIALOG ────────────────────────────── */}
      <Dialog open={releaseOpen} onOpenChange={setReleaseOpen}>
        <DialogContent className="sm:max-w-[480px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-red-500/10 via-rose-500/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20 shadow-sm">
              <XCircle className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Release Unit Reservation</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {selectedReservationForRelease && (
                  <span>Unit: <strong className="text-foreground">{selectedReservationForRelease.unit}</strong> · Tenant: <strong className="text-foreground">{selectedReservationForRelease.tenantName}</strong></span>
                )}
              </DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <Field label="Release Reason Type">
              <Select value={releaseType} onValueChange={v => setReleaseType(v as typeof releaseType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="released">Manual Release / Tenant Withdrew</SelectItem>
                  <SelectItem value="expired">Expired Hold (Validity Lapsed)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Reason & Audit Remarks">
              <Textarea
                rows={3}
                value={releaseReason}
                onChange={e => setReleaseReason(e.target.value)}
                placeholder="State why this reservation is being cancelled or released..."
                className="text-xs"
              />
            </Field>
            <div className="rounded-xl border border-amber-300 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>Releasing unlocks this unit immediately back to <strong>Available</strong> status for new lease bookings.</span>
            </div>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setReleaseOpen(false)}>Cancel</Button>
            <Button size="sm" variant="destructive" onClick={confirmRelease}>
              <XCircle className="mr-2 h-4 w-4" /> Confirm Release
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── GENERATE RENEWAL NOTICE DIALOG ────────────────────────── */}
      <Dialog open={renewalNoticeOpen} onOpenChange={setRenewalNoticeOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Generate Lease Renewal Notices</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">Automated notice dispatch for contracts expiring within 60 days.</DialogDescription>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full border border-primary/20">
              {upcomingRenewals.length} Expiring
            </span>
          </div>
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <Field label="Select Target Lease / Unit">
              <Select value={renewalNoticeForm.selectedLeaseId} onValueChange={v => setRenewalNoticeForm(f => ({ ...f, selectedLeaseId: v }))}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Select a lease..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">⚡ All Eligible Leases (Batch Process)</SelectItem>
                  {upcomingRenewals.map(l => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.tenantName} — {l.unit} ({l.property})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Percent className="h-3.5 w-3.5 text-primary" /> Renewal Parameters
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Proposed Rent Increase %">
                  <Input type="number" min={0} max={30} value={renewalNoticeForm.rentIncreasePercent} onChange={e => setRenewalNoticeForm(f => ({ ...f, rentIncreasePercent: e.target.value }))} className="bg-background" />
                </Field>
                <Field label="Cutoff (days before expiry)">
                  <Input type="number" min={7} max={90} value={renewalNoticeForm.lastConfirmationDays} onChange={e => setRenewalNoticeForm(f => ({ ...f, lastConfirmationDays: e.target.value }))} className="bg-background" />
                </Field>
              </div>
              <Field label="Revised Contract Terms">
                <Input value={renewalNoticeForm.revisedTerms} onChange={e => setRenewalNoticeForm(f => ({ ...f, revisedTerms: e.target.value }))} className="bg-background" placeholder="Standard 12-month extension with current terms" />
              </Field>
            </div>

            <Field label="Additional Notification Recipients">
              <Input value={renewalNoticeForm.additionalRecipients} onChange={e => setRenewalNoticeForm(f => ({ ...f, additionalRecipients: e.target.value }))} placeholder="legal@domain.qa, accounts@domain.qa" />
            </Field>
            <Field label="Internal Workflow Notes">
              <Textarea rows={2} value={renewalNoticeForm.notes} onChange={e => setRenewalNoticeForm(f => ({ ...f, notes: e.target.value }))} placeholder="Internal follow-up instructions..." className="text-xs" />
            </Field>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setRenewalNoticeOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => generateRenewalNotices(renewalNoticeForm)}>
              <CalendarClock className="mr-2 h-4 w-4" /> Send Renewal Notices
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── DOCUMENT VERIFICATION DIALOG ───────────────────────────── */}
      <Dialog open={verifyDocOpen} onOpenChange={setVerifyDocOpen}>
        <DialogContent className="sm:max-w-[480px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Document Verification</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Compliance review and verification status assignment.</DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <Field label="Verification Decision">
              <Select value={verifyDocForm.status} onValueChange={v => setVerifyDocForm(f => ({ ...f, status: v as VerificationStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">✅ Verified & Approved</SelectItem>
                  <SelectItem value="info_required">⚠️ Clarification / Re-upload Required</SelectItem>
                  <SelectItem value="rejected">❌ Rejected (Invalid / Mismatched)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {verifyDocForm.status === "verified" && (
              <Field label="Document Expiry Date (if applicable)">
                <Input type="date" value={verifyDocForm.expiryDate} onChange={e => setVerifyDocForm(f => ({ ...f, expiryDate: e.target.value }))} />
              </Field>
            )}
            <Field label="Reviewer Notes / Justification">
              <Textarea
                rows={3}
                value={verifyDocForm.remarks}
                onChange={e => setVerifyDocForm(f => ({ ...f, remarks: e.target.value }))}
                placeholder={verifyDocForm.status === "verified" ? "All details verified and match official record." : "Specify exactly what needs correction..."}
                className="text-xs"
              />
            </Field>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setVerifyDocOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submitDocumentVerification}>Submit Review</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── AGREEMENT TERMS DIALOG ───────────────────────────── */}
      <Dialog open={editTermsOpen} onOpenChange={setEditTermsOpen}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <FileSignature className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Edit Agreement Terms</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Adjust payment schedules, penalties, and governance rules.</DialogDescription>
            </div>
          </div>
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="h-3.5 w-3.5 text-primary" /> Payment Frequency & PDCs
              </span>
              <div className="grid grid-cols-4 gap-3">
                <Field label="Frequency">
                  <Select value={agreementTermsForm.paymentFrequency} onValueChange={(v) => setAgreementTermsForm((f) => ({ ...f, paymentFrequency: v as any }))}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="half_yearly">Half Yearly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="No. of PDCs">
                  <Input type="number" value={agreementTermsForm.pdcCount} onChange={(e) => setAgreementTermsForm((f) => ({ ...f, pdcCount: Number(e.target.value) }))} className="bg-background" />
                </Field>
                <Field label="Grace (Days)">
                  <Input type="number" value={agreementTermsForm.gracePeriodDays} onChange={(e) => setAgreementTermsForm((f) => ({ ...f, gracePeriodDays: Number(e.target.value) }))} className="bg-background" />
                </Field>
                <Field label="Notice (Days)">
                  <Input type="number" value={agreementTermsForm.noticePeriodDays} onChange={(e) => setAgreementTermsForm((f) => ({ ...f, noticePeriodDays: Number(e.target.value) }))} className="bg-background" />
                </Field>
              </div>
              <Field label="Penalties Rule">
                <Textarea rows={2} value={agreementTermsForm.penalties} onChange={(e) => setAgreementTermsForm((f) => ({ ...f, penalties: e.target.value }))} placeholder="Late payment penalty after grace period..." className="bg-background text-xs" />
              </Field>
            </div>

            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Maintenance, Utilities & Facilities
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Maintenance Responsibility">
                  <Select value={agreementTermsForm.maintenanceResponsibility} onValueChange={(v) => setAgreementTermsForm((f) => ({ ...f, maintenanceResponsibility: v }))}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Select responsibility" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Property Manager for major repairs, tenant for misuse damages">PM for Major / Tenant for Misuse</SelectItem>
                      <SelectItem value="Owner">Owner (Full)</SelectItem>
                      <SelectItem value="Tenant">Tenant (Full)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Utility Responsibility">
                  <Select value={agreementTermsForm.utilityResponsibility} onValueChange={(v) => setAgreementTermsForm((f) => ({ ...f, utilityResponsibility: v }))}>
                    <SelectTrigger className="bg-background"><SelectValue placeholder="Select responsibility" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tenant">Tenant</SelectItem>
                      <SelectItem value="Owner">Owner</SelectItem>
                      <SelectItem value="Shared">Shared</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Parking & Facilities">
                <Input value={agreementTermsForm.parkingDetails} onChange={(e) => setAgreementTermsForm((f) => ({ ...f, parkingDetails: e.target.value }))} placeholder="e.g. 1 covered bay, gate remote #12" className="bg-background" />
              </Field>
              <Field label="Special Clauses & Covenants">
                <Textarea rows={2} value={agreementTermsForm.specialConditions} onChange={(e) => setAgreementTermsForm((f) => ({ ...f, specialConditions: e.target.value }))} placeholder="Any specific covenants or permissions..." className="bg-background text-xs" />
              </Field>
            </div>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setEditTermsOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submitAgreementTerms}>Save Agreement Terms</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── TENANT SIGN DIALOG ───────────────────────────────── */}
      <Dialog open={tenantSignOpen} onOpenChange={setTenantSignOpen}>
        <DialogContent className="sm:max-w-[480px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <FileSignature className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Tenant Lease Signature</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Record tenant agreement signing for {signatureWorkflowLease?.tenantName} ({signatureWorkflowLease?.unit}).
              </DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date of Signing">
                <Input type="date" value={tenantSignForm.signedAt} onChange={e => setTenantSignForm(f => ({ ...f, signedAt: e.target.value }))} />
              </Field>
              <Field label="Received By">
                <Select value={tenantSignForm.receivedBy} onValueChange={v => setTenantSignForm(f => ({ ...f, receivedBy: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Leasing Department">Leasing Dept</SelectItem>
                    <SelectItem value="Property Manager">Property Manager</SelectItem>
                    <SelectItem value="Admin">Admin Officer</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center">
              <Upload className="mx-auto h-7 w-7 text-primary/60 mb-2" />
              <Field label="Upload Signed Document">
                <Input type="file" className="cursor-pointer bg-background" onChange={e => setTenantSignForm(f => ({ ...f, signedDocument: e.target.files?.[0]?.name || "" }))} />
              </Field>
              {tenantSignForm.signedDocument && <p className="text-xs text-primary font-medium mt-1">Selected: {tenantSignForm.signedDocument}</p>}
            </div>
            <Field label="Signing Remarks">
              <Textarea rows={2} value={tenantSignForm.remarks} onChange={e => setTenantSignForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes regarding signing..." className="text-xs" />
            </Field>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setTenantSignOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submitTenantSign}><FileSignature className="mr-2 h-4 w-4" /> Confirm Tenant Sign</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── COLLECT RENT/PDC DIALOG ─────────────────────────── */}
      <Dialog open={collectOpen} onOpenChange={setCollectOpen}>
        <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Collect Rent & PDC Schedule</DialogTitle>
            <DialogDescription>
              Record PDC collection, cheque counts, breakdown, and security deposit for {signatureWorkflowLease?.tenantName}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Lease Period & Date Overrides */}
            <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lease Period & PDC Count</p>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Lease Start Date">
                  <Input type="date" value={collectForm.startDate} onChange={(e) => setCollectForm((f) => ({ ...f, startDate: e.target.value }))} />
                </Field>
                <Field label="Lease End Date">
                  <Input type="date" value={collectForm.endDate} onChange={(e) => setCollectForm((f) => ({ ...f, endDate: e.target.value }))} />
                </Field>
                <Field label="PDC Count (No. of Cheques)">
                  <Input type="number" min={1} max={36} value={collectForm.pdcCount} onChange={(e) => {
                    const count = Number(e.target.value);
                    setCollectForm((f) => ({ ...f, pdcCount: count }));
                  }} />
                </Field>
              </div>
            </div>

            {/* Payment Mode & Bank */}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rent Payment Mode">
                <Select value={collectForm.paymentMode} onValueChange={(v) => setCollectForm((f) => ({ ...f, paymentMode: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDC">PDC (Post-Dated Cheques)</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Guarantee Cheque">Guarantee Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Bank Name (for PDCs)">
                <Input value={collectForm.chequeBank} onChange={(e) => setCollectForm((f) => ({ ...f, chequeBank: e.target.value }))} placeholder="e.g. QNB, Doha Bank, CBQ" />
              </Field>
            </div>

            {/* Maturity & Amount Breakdown Section */}
            {collectForm.paymentMode === "PDC" && signatureWorkflowLease && (() => {
              const totalContractRent = (signatureWorkflowLease.monthlyRent || 0) * (signatureWorkflowLease.pdcCount || 12);
              const count = Number(collectForm.pdcCount) || signatureWorkflowLease.pdcCount || 12;
              const regAmount = Number(collectForm.regularChequeAmount) || signatureWorkflowLease.monthlyRent;
              const finalAmount = count > 1 ? totalContractRent - regAmount * (count - 1) : totalContractRent;

              // Helper: increment month from a base date string keeping day-of-month
              function addMonthOffset(baseDateStr: string, monthOffset: number): string {
                const d = new Date(baseDateStr);
                const day = d.getDate();
                const targetMonthRaw = d.getMonth() + monthOffset;
                const targetYear = d.getFullYear() + Math.floor(targetMonthRaw / 12);
                const targetMonth = ((targetMonthRaw % 12) + 12) % 12;
                const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
                const finalDay = Math.min(day, lastDay);
                return `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(finalDay).padStart(2, "0")}`;
              }

              const regenerateCheques = (newCount = count, newRegAmt = regAmount, newFirstDate = collectForm.firstChequeDate || collectForm.startDate || signatureWorkflowLease.startDate) => {
                const leaseStartStr = signatureWorkflowLease.startDate || collectForm.startDate || newFirstDate;
                const generated = Array.from({ length: newCount }, (_, i) => {
                  let amount = newRegAmt;
                  if (i === newCount - 1 && newCount > 1) {
                    amount = Math.max(0, totalContractRent - newRegAmt * (newCount - 1));
                  }
                  // Tenure: anchored to lease.startDate, incrementing month by month
                  const tsDate = new Date(leaseStartStr);
                  tsDate.setMonth(tsDate.getMonth() + i);
                  const tenureStartStr = tsDate.toISOString().split("T")[0];
                  const teDate = new Date(leaseStartStr);
                  teDate.setMonth(teDate.getMonth() + i + 1);
                  teDate.setDate(teDate.getDate() - 1);
                  const tenureEndStr = teDate.toISOString().split("T")[0];
                  // Maturity: keep day from firstChequeDate, increment month only
                  const maturityStr = addMonthOffset(newFirstDate, i);
                  return {
                    chequeNo: `PDC-${signatureWorkflowLease.unit.replace(/\W/g, "")}-${String(i + 1).padStart(3, "0")}`,
                    bank: collectForm.chequeBank || "QNB",
                    date: maturityStr,
                    amount,
                    period: `Cheque ${i + 1} of ${newCount}`,
                    tenureStart: tenureStartStr,
                    tenureEnd: tenureEndStr,
                    file: "",
                  };
                });
                setCollectForm((f) => ({ ...f, pdcCount: newCount, customCheques: generated }));
              };

              // Ensure we display up to count rows or customCheques length
              const displayedRows = collectForm.customCheques && collectForm.customCheques.length > 0
                ? collectForm.customCheques
                : Array.from({ length: count }, (_, i) => {
                    const baseDate = collectForm.firstChequeDate || collectForm.startDate || signatureWorkflowLease.startDate || today.toISOString().split("T")[0];
                    const bd = new Date(baseDate);
                    const day = bd.getDate();
                    const targetMonthRaw = bd.getMonth() + i;
                    const targetYear = bd.getFullYear() + Math.floor(targetMonthRaw / 12);
                    const targetMonth = ((targetMonthRaw % 12) + 12) % 12;
                    const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
                    const maturityStr = `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
                    const leaseStart = signatureWorkflowLease.startDate || collectForm.startDate || baseDate;
                    const tsDate = new Date(leaseStart); tsDate.setMonth(tsDate.getMonth() + i);
                    const teDate = new Date(leaseStart); teDate.setMonth(teDate.getMonth() + i + 1); teDate.setDate(teDate.getDate() - 1);
                    return {
                      chequeNo: `PDC-${signatureWorkflowLease.unit.replace(/\W/g, "")}-${String(i + 1).padStart(3, "0")}`,
                      bank: collectForm.chequeBank || "QNB",
                      date: maturityStr,
                      amount: regAmount,
                      period: `Cheque ${i + 1}`,
                      tenureStart: tsDate.toISOString().split("T")[0],
                      tenureEnd: teDate.toISOString().split("T")[0],
                      file: "",
                    };
                  });

              return (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">Enter up to 12 PDC rows</p>
                      <p className="text-xs text-muted-foreground">Total Rent: <strong>QR {totalContractRent.toLocaleString()}</strong> across <strong>{count}</strong> cheques</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => regenerateCheques()}>
                      <RefreshCw className="h-3 w-3" /> Refresh / Reset Cheques
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="First PDC Maturity Date">
                      <Input type="date" value={collectForm.firstChequeDate} onChange={(e) => {
                        const val = e.target.value;
                        setCollectForm((f) => ({ ...f, firstChequeDate: val }));
                        regenerateCheques(count, regAmount, val);
                      }} />
                    </Field>
                    <Field label="Regular Cheque Amount (QR)">
                      <Input type="number" value={collectForm.regularChequeAmount} onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setCollectForm((f) => ({ ...f, regularChequeAmount: String(val) }));
                        regenerateCheques(count, val, collectForm.firstChequeDate);
                      }} placeholder={`${signatureWorkflowLease.monthlyRent}`} />
                    </Field>
                  </div>

                  {count > 1 && (
                    <div className="text-xs bg-background/80 p-2.5 rounded border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-muted-foreground">
                      <span>Breakdown: <strong>{count - 1}</strong> cheque(s) of <strong>QR {regAmount.toLocaleString()}</strong> + <strong>1</strong> final cheque for remaining balance of <strong>QR {Math.max(0, finalAmount).toLocaleString()}</strong></span>
                      <Badge variant="outline" className="font-mono text-xs font-bold text-primary">Total: QR {((count - 1) * regAmount + finalAmount).toLocaleString()}</Badge>
                    </div>
                  )}

                  {/* Individual Cheques Table - Image 1 Form Style */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-muted-foreground">Cheque Schedule Lines ({displayedRows.length})</span>
                      <Button size="sm" variant="outline" className="h-6 text-xs gap-1" onClick={() => {
                        const existing = collectForm.customCheques && collectForm.customCheques.length > 0 ? collectForm.customCheques : displayedRows;
                        const nextIdx = existing.length + 1;
                        // Maturity: month-increment from firstChequeDate
                        const baseDate = collectForm.firstChequeDate || collectForm.startDate || signatureWorkflowLease.startDate || today.toISOString().split("T")[0];
                        const bd = new Date(baseDate);
                        const day = bd.getDate();
                        const targetMonthRaw = bd.getMonth() + existing.length;
                        const targetYear = bd.getFullYear() + Math.floor(targetMonthRaw / 12);
                        const targetMonth = ((targetMonthRaw % 12) + 12) % 12;
                        const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
                        const nextMaturity = `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;
                        // Tenure: lease-start anchored
                        const leaseStart = signatureWorkflowLease.startDate || collectForm.startDate || baseDate;
                        const tsDate = new Date(leaseStart);
                        tsDate.setMonth(tsDate.getMonth() + existing.length);
                        const tenureStartStr = tsDate.toISOString().split("T")[0];
                        const teDate = new Date(leaseStart);
                        teDate.setMonth(teDate.getMonth() + existing.length + 1);
                        teDate.setDate(teDate.getDate() - 1);
                        const tenureEndStr = teDate.toISOString().split("T")[0];
                        setCollectForm(f => ({
                          ...f,
                          pdcCount: nextIdx,
                          customCheques: [
                            ...existing,
                            {
                              chequeNo: `PDC-${signatureWorkflowLease.unit.replace(/\W/g, "")}-${String(nextIdx).padStart(3, "0")}`,
                              bank: collectForm.chequeBank || "Bank",
                              date: nextMaturity,
                              amount: regAmount,
                              period: `Cheque ${nextIdx}`,
                              tenureStart: tenureStartStr,
                              tenureEnd: tenureEndStr,
                              file: "",
                            }
                          ]
                        }));
                      }}>
                        + Add Cheque Row
                      </Button>
                    </div>

                    <div className="max-h-72 overflow-y-auto border rounded bg-background">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/60 text-muted-foreground border-b sticky top-0 bg-muted">
                          <tr>
                            <th className="px-2 py-2 text-left w-24">Cheque No.</th>
                            <th className="px-2 py-2 text-left w-24">Bank</th>
                            <th className="px-2 py-2 text-left w-32">Maturity</th>
                            <th className="px-2 py-2 text-right w-24">Amount</th>
                            <th className="px-2 py-2 text-left" colSpan={2}>Tenure (Start & End)</th>
                            <th className="px-2 py-2 text-left w-36">Document</th>
                            <th className="px-2 py-2 w-8"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {displayedRows.map((c, i) => (
                            <tr key={i} className="hover:bg-muted/20">
                              <td className="px-1.5 py-1.5">
                                <Input
                                  value={c.chequeNo}
                                  onChange={(e) => {
                                    const rows = collectForm.customCheques && collectForm.customCheques.length > 0 ? [...collectForm.customCheques] : [...displayedRows];
                                    rows[i] = { ...rows[i], chequeNo: e.target.value };
                                    setCollectForm((f) => ({ ...f, customCheques: rows }));
                                  }}
                                  className="h-8 text-xs font-mono"
                                  placeholder={`PDC-${i + 1}`}
                                />
                              </td>
                              <td className="px-1.5 py-1.5">
                                <Input
                                  value={c.bank}
                                  onChange={(e) => {
                                    const rows = collectForm.customCheques && collectForm.customCheques.length > 0 ? [...collectForm.customCheques] : [...displayedRows];
                                    rows[i] = { ...rows[i], bank: e.target.value };
                                    setCollectForm((f) => ({ ...f, customCheques: rows }));
                                  }}
                                  className="h-8 text-xs"
                                  placeholder="Bank"
                                />
                              </td>
                              <td className="px-1.5 py-1.5">
                                <Input
                                  type="date"
                                  value={c.date}
                                  onChange={(e) => {
                                    const rows = collectForm.customCheques && collectForm.customCheques.length > 0 ? [...collectForm.customCheques] : [...displayedRows];
                                    rows[i] = { ...rows[i], date: e.target.value };
                                    setCollectForm((f) => ({ ...f, customCheques: rows }));
                                  }}
                                  className="h-8 text-xs font-mono"
                                />
                              </td>
                              <td className="px-1.5 py-1.5 text-right">
                                <Input
                                  type="number"
                                  value={c.amount || ""}
                                  onChange={(e) => {
                                    const rows = collectForm.customCheques && collectForm.customCheques.length > 0 ? [...collectForm.customCheques] : [...displayedRows];
                                    rows[i] = { ...rows[i], amount: Number(e.target.value) };
                                    setCollectForm((f) => ({ ...f, customCheques: rows }));
                                  }}
                                  className="h-8 text-xs text-right font-mono"
                                  placeholder="Amount"
                                />
                              </td>
                              <td className="px-1.5 py-1.5 w-32">
                                <Input
                                  type="date"
                                  value={c.tenureStart || ""}
                                  onChange={(e) => {
                                    const rows = collectForm.customCheques && collectForm.customCheques.length > 0 ? [...collectForm.customCheques] : [...displayedRows];
                                    rows[i] = { ...rows[i], tenureStart: e.target.value };
                                    setCollectForm((f) => ({ ...f, customCheques: rows }));
                                  }}
                                  className="h-8 text-xs font-mono"
                                  placeholder="Start date"
                                />
                              </td>
                              <td className="px-1.5 py-1.5 w-32">
                                <Input
                                  type="date"
                                  value={c.tenureEnd || ""}
                                  onChange={(e) => {
                                    const rows = collectForm.customCheques && collectForm.customCheques.length > 0 ? [...collectForm.customCheques] : [...displayedRows];
                                    rows[i] = { ...rows[i], tenureEnd: e.target.value };
                                    setCollectForm((f) => ({ ...f, customCheques: rows }));
                                  }}
                                  className="h-8 text-xs font-mono"
                                  placeholder="End date"
                                />
                              </td>
                              <td className="px-1.5 py-1.5">
                                <Input
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]?.name || "";
                                    const rows = collectForm.customCheques && collectForm.customCheques.length > 0 ? [...collectForm.customCheques] : [...displayedRows];
                                    rows[i] = { ...rows[i], file };
                                    setCollectForm((f) => ({ ...f, customCheques: rows }));
                                  }}
                                  className="h-8 text-[11px]"
                                />
                              </td>
                              <td className="px-1 py-1.5 text-center">
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => {
                                  const rows = collectForm.customCheques && collectForm.customCheques.length > 0 ? [...collectForm.customCheques] : [...displayedRows];
                                  setCollectForm(f => ({
                                    ...f,
                                    pdcCount: Math.max(1, rows.length - 1),
                                    customCheques: rows.filter((_, idx) => idx !== i)
                                  }));
                                }}>
                                  ×
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-[11px] text-muted-foreground italic">Leave rows blank to skip them. Only fully completed rows will be saved.</p>
                  </div>
                </div>
              );
            })()}

            {/* ── Type 1: Security Deposit for Unit (GL 21500) ── */}
            <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-300">
                    GL 21500
                  </Badge>
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground">Type 1: Security Deposit for Unit</p>
                </div>
                <span className="text-[11px] text-muted-foreground">Standard tenancy premise deposit</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Deposit Payment Mode">
                  <Select value={collectForm.depositMode} onValueChange={(v) => setCollectForm((f) => ({ ...f, depositMode: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash">Cash In Hand (12100)</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Operating (12000)</SelectItem>
                      <SelectItem value="PDC">PDC / Cheque (12900)</SelectItem>
                      <SelectItem value="Guarantee Cheque">Bank Guarantee Cheque (12900)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Unit Deposit Amount (QAR)">
                  <Input type="number" value={collectForm.depositAmount} onChange={(e) => setCollectForm((f) => ({ ...f, depositAmount: e.target.value }))} placeholder={`${signatureWorkflowLease?.securityDeposit || 5600}`} />
                </Field>
              </div>

              {(collectForm.depositMode === "PDC" || collectForm.depositMode === "Guarantee Cheque") && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Deposit Cheque No.">
                    <Input value={collectForm.depositChequeNo} onChange={(e) => setCollectForm((f) => ({ ...f, depositChequeNo: e.target.value }))} placeholder="e.g. CHQ-SEC-01" />
                  </Field>
                  <Field label="Deposit Cheque Bank">
                    <Input value={collectForm.depositChequeBank} onChange={(e) => setCollectForm((f) => ({ ...f, depositChequeBank: e.target.value }))} placeholder="e.g. QNB, CBQ, Doha Bank" />
                  </Field>
                </div>
              )}
            </div>

            {/* ── Type 2: Ancillary Refundable Deposits & Guarantees (GL 21100) ── */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/10 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300">
                    GL 21100 (Default Refundable)
                  </Badge>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200">
                    Type 2: Ancillary Refundable Deposits &amp; Guarantees
                  </p>
                </div>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400">By-default refundable liabilities</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Kahramaa Deposit (21100003)">
                  <Input type="number" value={collectForm.utilityDeposit} onChange={(e) => setCollectForm((f) => ({ ...f, utilityDeposit: e.target.value }))} placeholder="0" />
                </Field>
                <Field label="Qatar Cool Deposit (21100004)">
                  <Input type="number" value={collectForm.qatarCoolDeposit} onChange={(e) => setCollectForm((f) => ({ ...f, qatarCoolDeposit: e.target.value }))} placeholder="0" />
                </Field>
                <Field label="Reservation Advance (21100001)">
                  <Input type="number" value={collectForm.reservationDeposit} onChange={(e) => setCollectForm((f) => ({ ...f, reservationDeposit: e.target.value }))} placeholder="0" />
                </Field>
                <Field label="Service Fee Deposit (21100005)">
                  <Input type="number" value={collectForm.serviceFeeDeposit} onChange={(e) => setCollectForm((f) => ({ ...f, serviceFeeDeposit: e.target.value }))} placeholder="0" />
                </Field>
                <Field label="Guarantee Cheque Amount (21100006)">
                  <Input type="number" value={collectForm.guaranteeChequeDeposit} onChange={(e) => setCollectForm((f) => ({ ...f, guaranteeChequeDeposit: e.target.value }))} placeholder="0" />
                </Field>
                <Field label="Guarantee Cheque No. / Bank">
                  <Input value={collectForm.guaranteeChequeNo} onChange={(e) => setCollectForm((f) => ({ ...f, guaranteeChequeNo: e.target.value }))} placeholder="e.g. GNT-9988 (CBQ)" />
                </Field>
              </div>
            </div>

            {/* ── One-Time Non-Refundable Fees ── */}
            <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">One-Time Non-Refundable Fees (Revenue 41201)</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Agency Commission (QR)">
                  <Input type="number" value={collectForm.agencyCommission} onChange={(e) => setCollectForm((f) => ({ ...f, agencyCommission: e.target.value }))} placeholder="0" />
                </Field>
                <Field label="Admin Charges (QR)">
                  <Input type="number" value={collectForm.adminCharges} onChange={(e) => setCollectForm((f) => ({ ...f, adminCharges: e.target.value }))} placeholder="0" />
                </Field>
              </div>
            </div>

            {/* ── Finance Impact & Accounts Live Preview ── */}
            {signatureWorkflowLease && (() => {
              const pdcAmt = (collectForm.customCheques || []).filter(c => Number(c.amount) > 0).reduce((s, c) => s + Number(c.amount), 0) || (signatureWorkflowLease.monthlyRent * (collectForm.pdcCount || 12));
              const depAmt = Number(collectForm.depositAmount) || signatureWorkflowLease.securityDeposit;
              const depDrLabel = collectForm.depositMode === "Cash" ? "Cash In Hand" : collectForm.depositMode === "Bank Transfer" ? "Bank Operating Account" : "PDC In Hand";
              const depDrCode = collectForm.depositMode === "Cash" ? "12100" : collectForm.depositMode === "Bank Transfer" ? "12000" : "12900";
              const utilityAmt = Number(collectForm.utilityDeposit) || 0;
              const qatarCoolAmt = Number(collectForm.qatarCoolDeposit) || 0;
              const reservationAmt = Number(collectForm.reservationDeposit) || 0;
              const serviceFeeAmt = Number(collectForm.serviceFeeDeposit) || 0;
              const guaranteeChequeAmt = Number(collectForm.guaranteeChequeDeposit) || 0;
              const agencyAmt = Number(collectForm.agencyCommission) || 0;
              const adminAmt = Number(collectForm.adminCharges) || 0;

              const impacts: Array<{ label: string; category: string; dr: string; drCode: string; cr: string; crCode: string; amount: number }> = [];
              if (pdcAmt > 0) impacts.push({ label: "Rent PDCs In Hand", category: "Rent", dr: "PDC In Hand", drCode: "12900", cr: "Customer PDC Liability", crCode: "21400", amount: pdcAmt });
              if (depAmt > 0) impacts.push({ label: `Type 1: Unit Security Deposit (${collectForm.depositMode})`, category: "Deposit (21500)", dr: depDrLabel, drCode: depDrCode, cr: "Security Deposit Liability", crCode: "21500", amount: depAmt });
              if (utilityAmt > 0) impacts.push({ label: "Type 2: Kahramaa Utility Deposit", category: "Deposit (21100)", dr: "Cash In Hand", drCode: "12100", cr: "Kahramaa Deposit - Tenant", crCode: "21100003", amount: utilityAmt });
              if (qatarCoolAmt > 0) impacts.push({ label: "Type 2: Qatar Cool Deposit", category: "Deposit (21100)", dr: "Cash In Hand", drCode: "12100", cr: "Qatar Cool Deposit - Tenant", crCode: "21100004", amount: qatarCoolAmt });
              if (reservationAmt > 0) impacts.push({ label: "Type 2: Reservation Advance", category: "Deposit (21100)", dr: "Cash In Hand", drCode: "12100", cr: "Reservation Advance - Tenant", crCode: "21100001", amount: reservationAmt });
              if (serviceFeeAmt > 0) impacts.push({ label: "Type 2: Service Fee Deposit", category: "Deposit (21100)", dr: "Cash In Hand", drCode: "12100", cr: "Service Fee Deposit - Tenant", crCode: "21100005", amount: serviceFeeAmt });
              if (guaranteeChequeAmt > 0) impacts.push({ label: "Type 2: Guarantee Cheque Security", category: "Deposit (21100)", dr: "PDC In Hand", drCode: "12900", cr: "Guarantee Cheque Liability", crCode: "21100006", amount: guaranteeChequeAmt });
              if (agencyAmt > 0) impacts.push({ label: "Agency Commission", category: "Revenue", dr: "Cash In Hand", drCode: "12100", cr: "Agency Commission Income", crCode: "41201", amount: agencyAmt });
              if (adminAmt > 0) impacts.push({ label: "Admin Charges", category: "Revenue", dr: "Cash In Hand", drCode: "12100", cr: "Admin Charges Income", crCode: "41201", amount: adminAmt });

              return (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Finance Ledgers &amp; Accounts Updated on Collection</p>
                  </div>
                  <div className="border rounded bg-background overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">Transaction</th>
                          <th className="px-3 py-1.5 text-left font-medium text-emerald-700 dark:text-emerald-400">Debit (DR) Account</th>
                          <th className="px-3 py-1.5 text-left font-medium text-red-600 dark:text-red-400">Credit (CR) Account</th>
                          <th className="px-3 py-1.5 text-right font-medium text-muted-foreground">Amount (QR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {impacts.map((imp, i) => (
                          <tr key={i} className="hover:bg-muted/10">
                            <td className="px-3 py-1.5 font-medium">{imp.label}</td>
                            <td className="px-3 py-1.5">
                              <span className="inline-flex items-center gap-1">
                                <span className="font-mono text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-1 rounded">{imp.drCode}</span>
                                <span className="text-emerald-700 dark:text-emerald-300">{imp.dr}</span>
                              </span>
                            </td>
                            <td className="px-3 py-1.5">
                              <span className="inline-flex items-center gap-1">
                                <span className="font-mono text-[10px] bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300 px-1 rounded">{imp.crCode}</span>
                                <span className="text-red-600 dark:text-red-300">{imp.cr}</span>
                              </span>
                            </td>
                            <td className="px-3 py-1.5 text-right font-mono font-bold">QR {imp.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                        <tr className="bg-muted/20 font-semibold">
                          <td className="px-3 py-1.5" colSpan={3}>Total Impact</td>
                          <td className="px-3 py-1.5 text-right font-mono text-primary">QR {impacts.reduce((s, i) => s + i.amount, 0).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            <Field label="Upload Collection Proof / Receipt (Optional)">
              <Input type="file" onChange={(e) => setCollectForm((f) => ({ ...f, receiptFile: e.target.files?.[0]?.name || "" }))} />
              {collectForm.receiptFile && <p className="text-xs text-muted-foreground mt-1">Selected: {collectForm.receiptFile}</p>}
            </Field>
            <Field label="Notes">
              <Textarea rows={2} value={collectForm.notes} onChange={(e) => setCollectForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Optional notes on PDC collection and schedule..." />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCollectOpen(false)}>Cancel</Button>
            <Button onClick={submitCollect}><Banknote className="mr-2 h-4 w-4" /> Confirm Collection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── SUBMIT TO LANDLORD DIALOG ───────────────────────── */}
      <Dialog open={submitLandlordOpen} onOpenChange={setSubmitLandlordOpen}>
        <DialogContent className="sm:max-w-[480px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Submit Package to Landlord</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Send lease contract bundle and collected PDCs for owner counter-signature.</DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <Field label="Submitted To (Landlord / Owner Representative)">
              <Input value={submitLandlordForm.submittedTo} onChange={e => setSubmitLandlordForm(f => ({ ...f, submittedTo: e.target.value }))} placeholder="e.g. Sheikh Hassan Al-Thani" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Submission Date">
                <Input type="date" value={submitLandlordForm.submittedAt} onChange={e => setSubmitLandlordForm(f => ({ ...f, submittedAt: e.target.value }))} />
              </Field>
              <Field label="Delivery Channel">
                <Select value={submitLandlordForm.docsSent} onValueChange={v => setSubmitLandlordForm(f => ({ ...f, docsSent: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">📧 Email Dispatch</SelectItem>
                    <SelectItem value="Physical">📁 Physical Courier / Hand Delivery</SelectItem>
                    <SelectItem value="WhatsApp">💬 WhatsApp Verified</SelectItem>
                    <SelectItem value="Courier">🚚 Registered Courier</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center">
              <Upload className="mx-auto h-7 w-7 text-primary/60 mb-2" />
              <Field label="Upload Submission Proof (Optional)">
                <Input type="file" className="cursor-pointer bg-background" onChange={e => setSubmitLandlordForm(f => ({ ...f, proofFile: e.target.files?.[0]?.name || "" }))} />
              </Field>
              {submitLandlordForm.proofFile && <p className="text-xs text-primary font-medium mt-1">Selected: {submitLandlordForm.proofFile}</p>}
            </div>
            <Field label="Submission Notes">
              <Textarea rows={2} value={submitLandlordForm.notes} onChange={e => setSubmitLandlordForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional delivery tracking or submission notes..." className="text-xs" />
            </Field>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setSubmitLandlordOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submitToLandlord}><ClipboardCheck className="mr-2 h-4 w-4" /> Confirm Submission</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── UPLOAD AGREEMENT DIALOG ───────────────────────────── */}
      <Dialog open={uploadAgreementOpen} onOpenChange={setUploadAgreementOpen}>
        <DialogContent className="sm:max-w-[480px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Upload Signed Agreement</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Upload executed lease agreement document to finalize and mark fully signed.</DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center">
              <Upload className="mx-auto h-7 w-7 text-primary/60 mb-2" />
              <Field label="Upload Agreement PDF / Document *">
                <Input type="file" className="cursor-pointer bg-background" onChange={e => setUploadAgreementForm(f => ({ ...f, file: e.target.files?.[0]?.name || "" }))} />
              </Field>
              {uploadAgreementForm.file && <p className="text-xs text-primary font-medium mt-1">Selected: {uploadAgreementForm.file}</p>}
            </div>
            <Field label="Saved Document Name (Optional)">
              <Input value={uploadAgreementForm.fileName} onChange={e => setUploadAgreementForm(f => ({ ...f, fileName: e.target.value }))} placeholder="e.g. Fully_Signed_Lease_Agreement_2026.pdf" />
            </Field>
            <Field label="Remarks & Audit Log">
              <Textarea rows={2} value={uploadAgreementForm.remarks} onChange={e => setUploadAgreementForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes regarding final signed copy..." className="text-xs" />
            </Field>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setUploadAgreementOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submitUploadAgreement}><Upload className="mr-2 h-4 w-4" /> Confirm Upload</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── LANDLORD SIGN DIALOG ───────────────────────────── */}
      <Dialog open={landlordSignOpen} onOpenChange={setLandlordSignOpen}>
        <DialogContent className="sm:max-w-[480px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Landlord / Owner Signature</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Record landlord signature for {signatureWorkflowLease?.tenantName} — {signatureWorkflowLease?.unit}.
              </DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date of Signing">
                <Input type="date" value={landlordSignForm.signedAt} onChange={e => setLandlordSignForm(f => ({ ...f, signedAt: e.target.value }))} />
              </Field>
              <Field label="Signed By">
                <Input value={landlordSignForm.signedBy} onChange={e => setLandlordSignForm(f => ({ ...f, signedBy: e.target.value }))} placeholder="Sheikh Hassan Al-Thani" />
              </Field>
            </div>
            <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center">
              <Upload className="mx-auto h-7 w-7 text-primary/60 mb-2" />
              <Field label="Upload Counter-Signed Document">
                <Input type="file" className="cursor-pointer bg-background" onChange={e => setLandlordSignForm(f => ({ ...f, signedDocument: e.target.files?.[0]?.name || "" }))} />
              </Field>
              {landlordSignForm.signedDocument && <p className="text-xs text-primary font-medium mt-1">Selected: {landlordSignForm.signedDocument}</p>}
            </div>
            <div className="flex items-center gap-3 rounded-xl border bg-muted/20 p-3">
              <input type="checkbox" id="shared" checked={landlordSignForm.sharedWithTenant} onChange={e => setLandlordSignForm(f => ({ ...f, sharedWithTenant: e.target.checked }))} className="h-4 w-4 rounded accent-primary" />
              <Label htmlFor="shared" className="text-xs font-semibold cursor-pointer">Automatically share executed copy with tenant</Label>
            </div>
            <Field label="Remarks">
              <Textarea rows={2} value={landlordSignForm.remarks} onChange={e => setLandlordSignForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional remarks..." className="text-xs" />
            </Field>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setLandlordSignOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submitLandlordSign}><BadgeCheck className="mr-2 h-4 w-4" /> Confirm Landlord Sign</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── KEY NOTIFY DIALOG ─────────────────────────────────── */}
      <Dialog open={keyNotifyOpen} onOpenChange={setKeyNotifyOpen}>
        <DialogContent className="sm:max-w-[520px] w-[95vw] max-h-[88vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Key Issue & Handover Notification</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Dispatch official handover schedule notice for {keysWorkflowLease?.tenantName} — {keysWorkflowLease?.unit}.
              </DialogDescription>
            </div>
          </div>
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Planned Handover Date">
                <Input type="date" value={keyNotifyForm.handoverAt} onChange={e => setKeyNotifyForm(f => ({ ...f, handoverAt: e.target.value }))} className="bg-background" />
              </Field>
              <Field label="Planned Handover Time">
                <Input type="time" value={keyNotifyForm.handoverTime} onChange={e => setKeyNotifyForm(f => ({ ...f, handoverTime: e.target.value }))} className="bg-background" />
              </Field>
            </div>
            <Field label="Stakeholder Recipients">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-auto min-h-10 py-2 whitespace-normal break-words bg-background">
                    {keyNotifyForm.recipients.length > 0 ? keyNotifyForm.recipients.join(", ") : "Select recipients..."}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[300px]">
                  {["Tenant", "Property Manager", "Concerned Property Staff", "Security", "Maintenance", "Facility Management"].map(role => (
                    <DropdownMenuCheckboxItem
                      key={role}
                      checked={keyNotifyForm.recipients.includes(role)}
                      onCheckedChange={(checked) => {
                        setKeyNotifyForm(f => ({
                          ...f,
                          recipients: checked
                            ? [...f.recipients, role]
                            : f.recipients.filter(r => r !== role)
                        }));
                      }}
                    >
                      {role}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </Field>

            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-primary" /> Key Handover Particulars
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Authorized Collector">
                  <Input value={keyNotifyForm.authorizedCollector} onChange={e => setKeyNotifyForm(f => ({ ...f, authorizedCollector: e.target.value }))} placeholder="Tenant or representative" className="bg-background" />
                </Field>
                <Field label="Keys & Access Summary">
                  <Input value={keyNotifyForm.keysSummary} onChange={e => setKeyNotifyForm(f => ({ ...f, keysSummary: e.target.value }))} placeholder="2 keys, 2 cards, 1 remote" className="bg-background" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Outstanding Clearances">
                  <Input value={keyNotifyForm.outstandingRequirements} onChange={e => setKeyNotifyForm(f => ({ ...f, outstandingRequirements: e.target.value }))} placeholder="None" className="bg-background" />
                </Field>
                <Field label="Manager / Staff Contact">
                  <Input value={keyNotifyForm.staffContact} onChange={e => setKeyNotifyForm(f => ({ ...f, staffContact: e.target.value }))} placeholder="Name & Mobile #" className="bg-background" />
                </Field>
              </div>
            </div>

            <Field label="Special Access Instructions">
              <Textarea rows={2} value={keyNotifyForm.note} onChange={e => setKeyNotifyForm(f => ({ ...f, note: e.target.value }))} placeholder="Any gate pass, security clearance or parking instructions..." className="text-xs" />
            </Field>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setKeyNotifyOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => keysWorkflowLease && issueDetailedKeyNotice(keysWorkflowLease)}><Bell className="mr-2 h-4 w-4" /> Send Notification</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── KEY HANDOVER DIALOG ───────────────────────────────── */}
      <Dialog open={handoverOpen} onOpenChange={setHandoverOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Key Handover &amp; Check-In Workflow</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{keysWorkflowLease?.tenantName}</span> · {keysWorkflowLease?.unit} · {keysWorkflowLease?.property}
                </DialogDescription>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
              Check-In Ready
            </span>
          </div>

          {/* Tab navigation inside dialog */}
          <div className="px-6 pt-4">
            <div className="flex gap-1 rounded-xl bg-muted/60 p-1 text-xs font-medium border">
              {handoverTabOrder.map((tab) => (
                <button
                  key={tab}
                  className={`flex-1 rounded-lg px-2.5 py-1.5 transition-all ${
                    handoverActiveTab === tab
                      ? "bg-background text-foreground shadow-sm font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => setHandoverActiveTab(tab)}
                  type="button"
                >
                  {tab === "details" && "🔑 Details"}
                  {tab === "condition" && "🏠 Condition"}
                  {tab === "assets" && "📦 Assets"}
                  {tab === "checklist" && "✅ Checklist"}
                  {tab === "acknowledgement" && "📝 Sign-off"}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* TAB: DETAILS */}
            {handoverActiveTab === "details" && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Handover Date &amp; Time</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Date"><Input type="date" value={handoverForm.handoverAt} onChange={e => setHandoverForm(f => ({ ...f, handoverAt: e.target.value }))} /></Field>
                    <Field label="Time"><Input type="time" value={handoverForm.handoverTime} onChange={e => setHandoverForm(f => ({ ...f, handoverTime: e.target.value }))} /></Field>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Keys &amp; Access Items</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Keys Issued"><Input type="number" min="0" value={handoverForm.keys} onChange={e => setHandoverForm(f => ({ ...f, keys: e.target.value }))} /></Field>
                    <Field label="Access Cards"><Input type="number" min="0" value={handoverForm.accessCards} onChange={e => setHandoverForm(f => ({ ...f, accessCards: e.target.value }))} /></Field>
                    <Field label="Parking Remotes"><Input type="number" min="0" value={handoverForm.parkingRemotes} onChange={e => setHandoverForm(f => ({ ...f, parkingRemotes: e.target.value }))} /></Field>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <Field label="Key Type / Description"><Input value={handoverForm.keyType} onChange={e => setHandoverForm(f => ({ ...f, keyType: e.target.value }))} placeholder="Metal door keys / smart key / FOB" /></Field>
                    <Field label="Parking Device Details"><Input value={handoverForm.parkingDeviceDetails} onChange={e => setHandoverForm(f => ({ ...f, parkingDeviceDetails: e.target.value }))} placeholder="Remote serial, bay #, gate tag" /></Field>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Meter Readings at Handover</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="⚡ Electricity Meter"><Input value={handoverForm.electricityMeterReading} onChange={e => setHandoverForm(f => ({ ...f, electricityMeterReading: e.target.value }))} placeholder="e.g. 182167 kWh" /></Field>
                    <Field label="💧 Water Meter"><Input value={handoverForm.waterMeterReading} onChange={e => setHandoverForm(f => ({ ...f, waterMeterReading: e.target.value }))} placeholder="e.g. 149089 m³" /></Field>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Issued By</p>
                  <Field label="Issuing Officer">
                    <Select value={handoverForm.issuedBy} onValueChange={v => setHandoverForm(f => ({ ...f, issuedBy: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Property Manager">Property Manager</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Leasing Agent">Leasing Agent</SelectItem>
                        <SelectItem value="Facility Manager">Facility Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>
            )}

            {/* TAB: CONDITION */}
            {handoverActiveTab === "condition" && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unit Condition at Handover</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Overall Condition">
                      <Select value={handoverForm.unitCondition} onValueChange={v => setHandoverForm(f => ({ ...f, unitCondition: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Excellent">Excellent</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Fair">Fair</SelectItem>
                          <SelectItem value="Needs Attention">Needs Attention</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Cleanliness">
                      <Select value={handoverForm.cleanliness} onValueChange={v => setHandoverForm(f => ({ ...f, cleanliness: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Spotless">Spotless</SelectItem>
                          <SelectItem value="Clean">Clean</SelectItem>
                          <SelectItem value="Acceptable">Acceptable</SelectItem>
                          <SelectItem value="Needs Cleaning">Needs Cleaning</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">System &amp; Fixture Checks</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { key: "acWorking" as const, label: "🌀 Air Conditioning" },
                      { key: "plumbingOk" as const, label: "🚿 Plumbing / Water" },
                      { key: "electricalOk" as const, label: "💡 Electrical" },
                      { key: "doorsWindowsOk" as const, label: "🚪 Doors &amp; Windows" },
                    ]).map(({ key, label }) => (
                      <label key={key} className="flex cursor-pointer items-center gap-2 rounded-md border bg-background p-3 hover:bg-muted/50">
                        <input
                          type="checkbox"
                          checked={handoverForm[key]}
                          onChange={e => setHandoverForm(f => ({ ...f, [key]: e.target.checked }))}
                          className="h-4 w-4 rounded accent-primary"
                        />
                        <span className="text-sm font-medium" dangerouslySetInnerHTML={{ __html: label }} />
                        <span className={`ml-auto text-xs font-semibold ${handoverForm[key] ? "text-green-600" : "text-red-500"}`}>
                          {handoverForm[key] ? "OK" : "Issue"}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Field label="Photos Taken">
                  <Input type="number" min="0" value={handoverForm.photosTaken} onChange={e => setHandoverForm(f => ({ ...f, photosTaken: e.target.value }))} placeholder="Number of photos documented" />
                </Field>

                <Field label="Notes / Observations">
                  <Textarea rows={3} value={handoverForm.note} onChange={e => setHandoverForm(f => ({ ...f, note: e.target.value }))} placeholder="Any observations, pending items, special remarks..." />
                </Field>
              </div>
            )}

            {handoverActiveTab === "assets" && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assets List</p>
                  {assetLoading ? (
                    <p className="text-sm text-muted-foreground">Loading assets…</p>
                  ) : handoverAssets.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No assets assigned to this unit yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {handoverAssets.map((asset) => {
                        const change = assetChanges[asset.id] || { condition: asset.asset_condition || "Good", imageFileName: "" };
                        return (
                          <div key={asset.id} className="rounded-lg border bg-background p-3">
                            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                              <div>
                                <div className="text-sm font-semibold">{asset.asset_name}</div>
                                <div className="text-xs text-muted-foreground">{asset.asset_code || asset.category || "Asset"}</div>
                              </div>
                              <Field label="Condition">
                                <Select value={change.condition} onValueChange={(v) => updateAssetChange(asset.id, { condition: v })}>
                                  <SelectTrigger><SelectValue /></SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Excellent">Excellent</SelectItem>
                                    <SelectItem value="Good">Good</SelectItem>
                                    <SelectItem value="Fair">Fair</SelectItem>
                                    <SelectItem value="Needs Attention">Needs Attention</SelectItem>
                                  </SelectContent>
                                </Select>
                              </Field>
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-3">
                              <Field label="Upload Asset Image">
                                <Input type="file" onChange={e => updateAssetChange(asset.id, { imageFileName: e.target.files?.[0]?.name || "" })} />
                                {change.imageFileName && <p className="text-xs text-muted-foreground mt-1">Selected: {change.imageFileName}</p>}
                              </Field>
                              <Field label="Current Remarks">
                                <Textarea rows={2} value={asset.remarks || ""} readOnly />
                              </Field>
                            </div>
                            <div className="flex justify-end mt-3">
                              <Button size="sm" variant="outline" onClick={() => saveAssetUpdate(asset.id)}>Save Asset</Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {handoverAssets.length > 0 && (
                  <Button size="sm" variant="secondary" onClick={saveAllAssetUpdates}>Save All Asset Updates</Button>
                )}
              </div>
            )}

            {handoverActiveTab === "checklist" && (
              <div className="space-y-3">
                <div className="rounded-lg border bg-amber-50 p-3 text-sm text-amber-800">
                  ⚠️ All items below must be verified before confirming handover.
                </div>
                {[
                  { label: "Lease is fully signed by tenant and landlord", check: true },
                  { label: "Security deposit / collection is fully completed", check: true },
                  { label: "Key Issue Notice has been sent to tenant", check: !!(keysWorkflowLease && handoverForm.collectorName) },
                  { label: "Meter readings recorded (electricity &amp; water)", check: !!(handoverForm.electricityMeterReading && handoverForm.waterMeterReading) },
                  { label: "Keys, access cards and parking remotes counted &amp; ready", check: Number(handoverForm.keys) > 0 },
                  { label: "Unit condition verified and documented", check: !!(handoverForm.unitCondition) },
                  { label: "Collector ID verified", check: handoverForm.idVerified },
                  { label: "Photos taken and on file", check: Number(handoverForm.photosTaken) > 0 },
                  { label: "Tenant acknowledgement text / signature captured", check: !!(handoverForm.tenantAcknowledgement) },
                ].map(({ label, check }, i) => (
                  <div key={i} className={`flex items-start gap-3 rounded-lg border p-3 ${
                    check ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"
                  }`}>
                    <span className={`mt-0.5 text-base ${check ? "text-green-600" : "text-orange-500"}`}>{check ? "✅" : "⏳"}</span>
                    <span className="text-sm" dangerouslySetInnerHTML={{ __html: label }} />
                  </div>
                ))}

                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Collector Identity Verification</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Collector Name"><Input value={handoverForm.collectorName} onChange={e => setHandoverForm(f => ({ ...f, collectorName: e.target.value }))} placeholder="Tenant or authorised representative" /></Field>
                    <Field label="Collector ID / Passport No."><Input value={handoverForm.collectorIdNumber} onChange={e => setHandoverForm(f => ({ ...f, collectorIdNumber: e.target.value }))} placeholder="Qatar ID / Passport" /></Field>
                  </div>
                  <label className="mt-3 flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={handoverForm.idVerified}
                      onChange={e => setHandoverForm(f => ({ ...f, idVerified: e.target.checked }))}
                      className="h-4 w-4 rounded accent-primary"
                    />
                    <span className="text-sm font-medium">ID document sighted and verified ✓</span>
                  </label>
                </div>
              </div>
            )}


            {/* TAB: ACKNOWLEDGEMENT */}
            {handoverActiveTab === "acknowledgement" && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-blue-50 p-4 text-sm text-blue-800">
                  <p className="font-semibold">📜 Digital Acknowledgement</p>
                  <p className="mt-1">The collector confirms receipt of all keys and access items in the condition stated. This record serves as the official handover certificate.</p>
                </div>

                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Handover Summary</p>
                  <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                    <span className="text-muted-foreground">Unit</span><span className="font-medium">{keysWorkflowLease?.unit}</span>
                    <span className="text-muted-foreground">Date / Time</span><span className="font-medium">{handoverForm.handoverAt} {handoverForm.handoverTime}</span>
                    <span className="text-muted-foreground">Keys</span><span className="font-medium">{handoverForm.keys}× {handoverForm.keyType}</span>
                    <span className="text-muted-foreground">Access Cards</span><span className="font-medium">{handoverForm.accessCards}</span>
                    <span className="text-muted-foreground">Parking Remotes</span><span className="font-medium">{handoverForm.parkingRemotes}</span>
                    <span className="text-muted-foreground">Electricity Meter</span><span className="font-medium">{handoverForm.electricityMeterReading || "—"}</span>
                    <span className="text-muted-foreground">Water Meter</span><span className="font-medium">{handoverForm.waterMeterReading || "—"}</span>
                    <span className="text-muted-foreground">Unit Condition</span><span className="font-medium">{handoverForm.unitCondition}</span>
                    <span className="text-muted-foreground">Collector</span><span className="font-medium">{handoverForm.collectorName || keysWorkflowLease?.tenantName}</span>
                    <span className="text-muted-foreground">ID Verified</span><span className={`font-medium ${handoverForm.idVerified ? "text-green-600" : "text-red-500"}`}>{handoverForm.idVerified ? "Yes ✓" : "No ✗"}</span>
                    <span className="text-muted-foreground">Issued By</span><span className="font-medium">{handoverForm.issuedBy}</span>
                    <span className="text-muted-foreground">Photos</span><span className="font-medium">{handoverForm.photosTaken}</span>
                  </div>
                </div>

                <Field label="Tenant Acknowledgement Statement">
                  <Textarea
                    rows={3}
                    value={handoverForm.tenantAcknowledgement}
                    onChange={e => setHandoverForm(f => ({ ...f, tenantAcknowledgement: e.target.value }))}
                    placeholder="I, [Tenant Name], acknowledge receipt of the above keys and access items..."
                  />
                </Field>

                <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4 text-center text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">📸 Signature / Photo Upload</p>
                  <p className="mt-1">Physical signature sheet should be scanned and uploaded to the document store after handover.</p>
                  <Button variant="outline" size="sm" className="mt-2">Upload Signed Form</Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 pt-2 border-t">
            <Button variant="outline" onClick={() => setHandoverOpen(false)}>Cancel</Button>
            <Button
              variant="outline"
              onClick={() => setHandoverActiveTab(getNextHandoverTab(handoverActiveTab))}
              disabled={handoverActiveTab === handoverTabOrder[handoverTabOrder.length - 1]}
            >
              Next →
            </Button>
            <Button
              onClick={() => keysWorkflowLease && completeHandoverAndCheckIn(keysWorkflowLease)}
              disabled={!handoverForm.electricityMeterReading || !handoverForm.waterMeterReading || !handoverForm.collectorName}
              className="gap-2"
            >
              <Key className="h-4 w-4" /> Confirm Handover & Check-In
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── VIEW HANDOVER DETAIL DIALOG ──────────────────────────── */}
      <Dialog open={handoverViewOpen} onOpenChange={setHandoverViewOpen}>
        <DialogContent className="sm:max-w-[540px] max-h-[88vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Key Handover Certificate</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">Official executed key release and check-in audit certificate.</DialogDescription>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
              Verified & Handed Over
            </span>
          </div>
          {selectedHandover && (() => {
            const lease = leases.find(l => l.id === selectedHandover.leaseId);
            return (
              <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm">
                <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 p-3.5 flex items-center gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>Keys and access items released to authorized tenant representative.</span>
                </div>
                <div className="rounded-xl border bg-muted/20 p-4 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <div><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Tenant</span><span className="font-semibold text-foreground">{lease?.tenantName}</span></div>
                    <div><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Unit & Property</span><span className="font-semibold text-foreground">{lease?.unit} ({lease?.property})</span></div>
                    <div><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Handover Date</span><span className="font-semibold text-foreground">{selectedHandover.handoverAt}</span></div>
                    <div><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Keys Count</span><span className="font-semibold text-foreground">{selectedHandover.keys}× {selectedHandover.keyType || "keys"}</span></div>
                    <div><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Access Cards</span><span className="font-semibold text-foreground">{selectedHandover.accessCards} cards</span></div>
                    <div><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Parking Remotes</span><span className="font-semibold text-foreground">{selectedHandover.parkingRemotes} remote(s)</span></div>
                    <div><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Electricity Meter</span><span className="font-semibold text-foreground">{selectedHandover.electricityMeterReading || "—"}</span></div>
                    <div><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Water Meter</span><span className="font-semibold text-foreground">{selectedHandover.waterMeterReading || "—"}</span></div>
                    <div><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Unit Condition</span><span className="font-semibold text-foreground">{selectedHandover.unitCondition || "—"}</span></div>
                    <div><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Cleanliness</span><span className="font-semibold text-foreground">{selectedHandover.cleanliness || "—"}</span></div>
                    <div><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Collector</span><span className="font-semibold text-foreground">{selectedHandover.collectorName}</span></div>
                    <div><span className="text-muted-foreground block text-[10px] uppercase font-semibold">ID Sighted</span><span className={`font-semibold ${selectedHandover.idVerified ? "text-emerald-600" : "text-rose-500"}`}>{selectedHandover.idVerified ? "Yes (Verified ✓)" : "Pending ✗"}</span></div>
                  </div>
                </div>
                {selectedHandover.tenantAcknowledgement && (
                  <div className="rounded-xl border bg-muted/20 p-3.5 text-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Tenant Digital Acknowledgement</p>
                    <p className="italic text-foreground">{selectedHandover.tenantAcknowledgement}</p>
                  </div>
                )}
                <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
                  <div className={`rounded-lg border p-2 text-center ${selectedHandover.acWorking ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300" : "border-rose-200 bg-rose-50/50 text-rose-700"}`}>🌀 A/C {selectedHandover.acWorking ? "✓" : "✗"}</div>
                  <div className={`rounded-lg border p-2 text-center ${selectedHandover.plumbingOk ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300" : "border-rose-200 bg-rose-50/50 text-rose-700"}`}>🚿 Plumb. {selectedHandover.plumbingOk ? "✓" : "✗"}</div>
                  <div className={`rounded-lg border p-2 text-center ${selectedHandover.electricalOk ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300" : "border-rose-200 bg-rose-50/50 text-rose-700"}`}>💡 Elec. {selectedHandover.electricalOk ? "✓" : "✗"}</div>
                  <div className={`rounded-lg border p-2 text-center ${selectedHandover.doorsWindowsOk ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300" : "border-rose-200 bg-rose-50/50 text-rose-700"}`}>🚪 Doors {selectedHandover.doorsWindowsOk ? "✓" : "✗"}</div>
                </div>
              </div>
            );
          })()}
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setHandoverViewOpen(false)}>Close</Button>
            <Button variant="outline" size="sm" onClick={() => { window.print(); }} className="gap-2"><Key className="h-4 w-4" /> Print Certificate</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── RENEWAL RESPONSE DIALOG ───────────────────────────── */}
      <Dialog open={renewalResponseOpen} onOpenChange={setRenewalResponseOpen}>
        <DialogContent className="sm:max-w-[480px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Tenant Renewal Decision</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Record decision for {leases.find(l => l.id === selectedRenewal?.leaseId)?.tenantName} — {leases.find(l => l.id === selectedRenewal?.leaseId)?.unit}.</DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <Field label="Tenant Formal Response">
              <Select value={renewalResponseForm.response} onValueChange={v => setRenewalResponseForm(f => ({ ...f, response: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirm">✅ Confirmed Renewal (Accepts extension)</SelectItem>
                  <SelectItem value="non_renewal">❌ Non-Renewal (Will vacate upon expiry)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {renewalResponseForm.response === "confirm" && (
              <Field label="Agreed Monthly Rent (QR)">
                <Input type="number" value={renewalResponseForm.confirmedRent} onChange={e => setRenewalResponseForm(f => ({ ...f, confirmedRent: e.target.value }))} placeholder={`Proposed: QR ${selectedRenewal?.proposedRent}`} />
              </Field>
            )}
            <Field label="Negotiation & Confirmation Notes">
              <Textarea rows={2} value={renewalResponseForm.notes} onChange={e => setRenewalResponseForm(f => ({ ...f, notes: e.target.value }))} placeholder="Special agreed terms, discount notes, or move-out confirmation..." className="text-xs" />
            </Field>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setRenewalResponseOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={() => { if (selectedRenewal) renewLease(selectedRenewal); setRenewalResponseOpen(false); }}><RefreshCw className="mr-2 h-4 w-4" /> Confirm Decision</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── DISCUSS RENEWAL DIALOG ────────────────────────────── */}
      <Dialog open={discussRenewalOpen} onOpenChange={setDiscussRenewalOpen}>
        <DialogContent className="sm:max-w-[500px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Renewal Discussion & Follow-Up</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Document negotiation points for {leases.find(l => l.id === selectedDiscussRenewal?.leaseId)?.tenantName} ({leases.find(l => l.id === selectedDiscussRenewal?.leaseId)?.unit}).</DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="rounded-xl border bg-muted/20 p-3.5 text-xs grid grid-cols-3 gap-2">
              <div><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Proposed Rent</span><strong className="text-foreground">QR {selectedDiscussRenewal?.proposedRent?.toLocaleString()}</strong></div>
              <div><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Proposed Period</span><strong className="text-foreground">{selectedDiscussRenewal?.proposedPeriod}</strong></div>
              <div><span className="text-muted-foreground block text-[10px] uppercase font-semibold">Expiry Date</span><strong className="text-foreground">{selectedDiscussRenewal?.expiryDate}</strong></div>
            </div>
            <Field label="Tenant Sentiment">
              <Select value={discussRenewalForm.tenantResponse} onValueChange={v => setDiscussRenewalForm(f => ({ ...f, tenantResponse: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">🟢 Positive — High likelihood to renew</SelectItem>
                  <SelectItem value="pending">🟡 Pending — Reviewing proposed offer</SelectItem>
                  <SelectItem value="negative">🔴 Negative — Requesting lower rent or vacating</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Discussed Rent (QR)">
                <Input type="number" value={discussRenewalForm.discussedRent} onChange={e => setDiscussRenewalForm(f => ({ ...f, discussedRent: e.target.value }))} placeholder={`QR ${selectedDiscussRenewal?.proposedRent}`} />
              </Field>
              <Field label="Agreed Period">
                <Input value={discussRenewalForm.proposedPeriod} onChange={e => setDiscussRenewalForm(f => ({ ...f, proposedPeriod: e.target.value }))} placeholder="12 months" />
              </Field>
            </div>
            <Field label="Next Follow-Up / Decision Deadline">
              <Input type="date" value={discussRenewalForm.nextFollowUpDate} onChange={e => setDiscussRenewalForm(f => ({ ...f, nextFollowUpDate: e.target.value }))} />
            </Field>
            <Field label="Discussion Notes & Actions">
              <Textarea rows={2} value={discussRenewalForm.notes} onChange={e => setDiscussRenewalForm(f => ({ ...f, notes: e.target.value }))} placeholder="Key points discussed, maintenance promises, counter-offers..." className="text-xs" />
            </Field>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setDiscussRenewalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={discussRenewal}><Bell className="mr-2 h-4 w-4" /> Save Discussion</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── ADD VOUCHER DIALOG ────────────────────────────────── */}
      <Dialog open={addVoucherOpen} onOpenChange={setAddVoucherOpen}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Add Finance Voucher Entry</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Post double-entry voucher transaction and optionally register corresponding PDC cheque.</DialogDescription>
            </div>
          </div>
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <Field label="Target Lease Contract *">
              <Select value={addVoucherForm.leaseId} onValueChange={v => {
                const lease = leases.find(l => l.id === v);
                const accounts = getVoucherAccounts(addVoucherForm.name, lease?.unit || "", addVoucherForm.method);
                setAddVoucherForm(f => ({ ...f, leaseId: v, debit: accounts.debit, credit: accounts.credit }));
              }}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Select lease" /></SelectTrigger>
                <SelectContent>{leases.map(l => <SelectItem key={l.id} value={l.id}>{l.tenantName} — {l.unit} ({l.property})</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Voucher Transaction Type *">
              <Select value={addVoucherForm.name} onValueChange={v => {
                const lease = leases.find(l => l.id === addVoucherForm.leaseId);
                const accounts = getVoucherAccounts(v, lease?.unit || "", addVoucherForm.method);
                setAddVoucherForm(f => ({ ...f, name: v, debit: accounts.debit, credit: accounts.credit }));
              }}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receipts Voucher - Rent">Receipts Voucher — Rent</SelectItem>
                  <SelectItem value="Receipts Voucher - Deposit">Receipts Voucher — Deposit</SelectItem>
                  <SelectItem value="Deposit Voucher - PDC">Deposit Voucher — PDC</SelectItem>
                  <SelectItem value="Deposit Voucher - Cash">Deposit Voucher — Cash</SelectItem>
                  <SelectItem value="Cheque Returned Voucher">Cheque Returned Voucher</SelectItem>
                  <SelectItem value="Revenue Generation (Single or Batch)">Revenue Generation (Single or Batch)</SelectItem>
                  <SelectItem value="Payment Voucher">Payment Voucher</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Receipt / Voucher No.">
                <Input value={addVoucherForm.receiptNo} onChange={e => setAddVoucherForm(f => ({ ...f, receiptNo: e.target.value }))} placeholder="Auto-generated if blank" className="bg-background" />
              </Field>
              <Field label="Payment Method">
                <Select value={addVoucherForm.method} onValueChange={v => {
                  const lease = leases.find(l => l.id === addVoucherForm.leaseId);
                  const accounts = getVoucherAccounts(addVoucherForm.name, lease?.unit || "", v);
                  setAddVoucherForm(f => ({ ...f, method: v, debit: accounts.debit, credit: accounts.credit }));
                }}>
                  <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDC">PDC Cheque</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Guarantee Cheque">Guarantee Cheque</SelectItem>
                    <SelectItem value="Batch">Batch Post</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> General Ledger Accounts
              </span>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Debit (DR) Account">
                  <Select value={addVoucherForm.debit} onValueChange={v => setAddVoucherForm(f => ({ ...f, debit: v }))}>
                    <SelectTrigger className="text-xs font-mono bg-background"><SelectValue placeholder="Select Debit Account" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDC In Hand">PDC In Hand (12900)</SelectItem>
                      <SelectItem value="Cash In Hand">Cash In Hand (12100)</SelectItem>
                      <SelectItem value="Bank Account">Bank Account (12000)</SelectItem>
                      <SelectItem value={`Customer(PDC)-${leases.find(l => l.id === addVoucherForm.leaseId)?.unit || "Unit"}`}>Customer(PDC)-{leases.find(l => l.id === addVoucherForm.leaseId)?.unit || "Unit"} (21400)</SelectItem>
                      <SelectItem value={`Receivable-${leases.find(l => l.id === addVoucherForm.leaseId)?.unit || "Unit"}`}>Receivable-{leases.find(l => l.id === addVoucherForm.leaseId)?.unit || "Unit"} (12413)</SelectItem>
                      <SelectItem value="Payable Account">Payable Account (20100)</SelectItem>
                      <SelectItem value="Deposit-PDC In Hand">Deposit-PDC In Hand (12900002)</SelectItem>
                      <SelectItem value={`Security Deposit Liability-${leases.find(l => l.id === addVoucherForm.leaseId)?.unit || "Unit"}`}>Security Deposit Liability (21500)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Credit (CR) Account">
                  <Select value={addVoucherForm.credit} onValueChange={v => setAddVoucherForm(f => ({ ...f, credit: v }))}>
                    <SelectTrigger className="text-xs font-mono bg-background"><SelectValue placeholder="Select Credit Account" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PDC In Hand">PDC In Hand (12900)</SelectItem>
                      <SelectItem value="Cash In Hand">Cash In Hand (12100)</SelectItem>
                      <SelectItem value="Bank Account">Bank Account (12000)</SelectItem>
                      <SelectItem value={`Customer(PDC)-${leases.find(l => l.id === addVoucherForm.leaseId)?.unit || "Unit"}`}>Customer(PDC)-{leases.find(l => l.id === addVoucherForm.leaseId)?.unit || "Unit"} (21400)</SelectItem>
                      <SelectItem value={`Receivable-${leases.find(l => l.id === addVoucherForm.leaseId)?.unit || "Unit"}`}>Receivable-{leases.find(l => l.id === addVoucherForm.leaseId)?.unit || "Unit"} (12413)</SelectItem>
                      <SelectItem value="Rental Income">Rental Income (41100)</SelectItem>
                      <SelectItem value={`Deposit-Customer-${leases.find(l => l.id === addVoucherForm.leaseId)?.unit || "Unit"}`}>Deposit-Customer-{leases.find(l => l.id === addVoucherForm.leaseId)?.unit || "Unit"} (21500)</SelectItem>
                      <SelectItem value={`Security Deposit Liability-${leases.find(l => l.id === addVoucherForm.leaseId)?.unit || "Unit"}`}>Security Deposit Liability (21500)</SelectItem>
                      <SelectItem value="Payable Account">Payable Account (20100)</SelectItem>
                      <SelectItem value="Guarantee Cheque Received">Guarantee Cheque Received (21200)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Voucher Amount (QR) *">
                <Input type="number" value={addVoucherForm.amount} onChange={e => setAddVoucherForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" className="bg-background font-mono font-bold" />
              </Field>
            </div>

            <Field label="Voucher Remarks / Particulars">
              <Input value={addVoucherForm.period} onChange={e => setAddVoucherForm(f => ({ ...f, period: e.target.value }))} placeholder="Optional voucher narrative or notes..." className="bg-background" />
            </Field>

            {(addVoucherForm.method === "PDC" || addVoucherForm.method === "Guarantee Cheque") && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-primary">Automated PDC Register Entry</p>
                    <p className="text-[11px] text-muted-foreground">Automatically creates an active cheque record in PDC Management ledger.</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={addVoucherForm.createPdc} onChange={e => setAddVoucherForm(f => ({ ...f, createPdc: e.target.checked }))} className="h-4 w-4 rounded accent-primary" />
                    <span className="text-xs font-semibold">Create PDC</span>
                  </label>
                </div>
                {addVoucherForm.createPdc && (
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <Field label="Cheque No.">
                      <Input value={addVoucherForm.pdcChequeNo} onChange={e => setAddVoucherForm(f => ({ ...f, pdcChequeNo: e.target.value }))} placeholder="CHQ-001" className="bg-background text-xs" />
                    </Field>
                    <Field label="Bank">
                      <Input value={addVoucherForm.pdcBank} onChange={e => setAddVoucherForm(f => ({ ...f, pdcBank: e.target.value }))} placeholder="QNB" className="bg-background text-xs" />
                    </Field>
                    <Field label="Maturity Date">
                      <Input type="date" value={addVoucherForm.pdcDate} onChange={e => setAddVoucherForm(f => ({ ...f, pdcDate: e.target.value }))} className="bg-background text-xs" />
                    </Field>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setAddVoucherOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={addVoucher}><Banknote className="mr-2 h-4 w-4" /> Add Voucher</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── SECURITY DEPOSIT SETTLE & REFUND MODAL (2-STEP WIZARD) ─────────────── */}
      <Dialog open={settleRefundOpen} onOpenChange={setSettleRefundOpen}>
        <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-1">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base font-bold">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
                Settle &amp; Refund Security Deposit
              </DialogTitle>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                <span className={`px-2 py-0.5 rounded-full ${settleRefundStep === 1 ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-800"}`}>
                  1. Deductions
                </span>
                <span className="text-muted-foreground">→</span>
                <span className={`px-2 py-0.5 rounded-full ${settleRefundStep === 2 ? "bg-purple-600 text-white" : "bg-muted text-muted-foreground"}`}>
                  2. Payment &amp; GL
                </span>
              </div>
            </div>
            <DialogDescription className="text-xs">
              {settleRefundStep === 1 
                ? "Step 1 of 2: Review and adjust tenant damage deductions and select settlement mode."
                : "Step 2 of 2: Configure payment details, review GL journal posting, and issue receipt."}
            </DialogDescription>
          </DialogHeader>

          {selectedSettlement && (() => {
            const lease = leases.find(l => l.id === selectedSettlement.leaseId);
            const damages = parseFloat(settleRefundForm.damages) || 0;
            const outstandingRent = parseFloat(settleRefundForm.outstandingRent) || 0;
            const utilityCharges = parseFloat(settleRefundForm.utilityCharges) || 0;
            const cleaningCharges = parseFloat(settleRefundForm.cleaningCharges) || 0;
            const restorationCharges = parseFloat(settleRefundForm.restorationCharges) || 0;
            const otherDeductions = parseFloat(settleRefundForm.otherDeductions) || 0;
            const totalDeductions = damages + outstandingRent + utilityCharges + cleaningCharges + restorationCharges + otherDeductions;
            const grossDeposit = selectedSettlement.depositReceived || (lease?.securityDeposit || 0);
            const unusedRentRefundUI = settleRefundForm.currentMonthPdcDeposited
              ? Math.max(0, parseFloat(settleRefundForm.unusedRentRefund) || 0)
              : 0;
            const effectiveDepositUI = grossDeposit + unusedRentRefundUI;
            const maxCalculated = Math.max(0, effectiveDepositUI - totalDeductions);
            const enteredRefund = parseFloat(settleRefundForm.refundAmount) || 0;
            const mode = settleRefundForm.settlementMode;
            const dmgPayMode = settleRefundForm.damagePaymentMode || "Bank Transfer";
            const isBank = settleRefundForm.paymentMethod !== "Cash";
            const bankLabel = isBank ? "12000 Bank Operating Account" : "12100 Cash In Hand";
            
            let dmgDrLabel = "12000 Bank Operating Account";
            if (dmgPayMode === "Cash") {
              dmgDrLabel = "12100 Cash In Hand";
            } else if (dmgPayMode === "Cheque") {
              dmgDrLabel = "12200 Cheques / PDC In Hand";
            } else if (dmgPayMode === "Bank Guarantee") {
              dmgDrLabel = "12500 Bank Guarantee Security Held";
            }

            const depositDeduction = Math.min(effectiveDepositUI, totalDeductions);
            const remainingAR = Math.max(0, totalDeductions - effectiveDepositUI);

            // Compute unused rent from days occupied
            const _daysOccupied = parseInt(settleRefundForm.daysOccupiedInMonth) || 0;
            const _totalDays = parseInt(settleRefundForm.totalDaysInMonth) || 30;
            const _monthlyRent = lease?.monthlyRent || 0;
            const _computedUnusedRent = settleRefundForm.currentMonthPdcDeposited && _monthlyRent > 0
              ? Math.round((_monthlyRent / _totalDays) * Math.max(0, _totalDays - _daysOccupied))
              : 0;

            const handleDeductionChange = (field: string, val: string) => {
              const updatedForm = { ...settleRefundForm, [field]: val };
              const d = parseFloat(field === "damages" ? val : updatedForm.damages) || 0;
              const r = parseFloat(field === "outstandingRent" ? val : updatedForm.outstandingRent) || 0;
              const u = parseFloat(field === "utilityCharges" ? val : updatedForm.utilityCharges) || 0;
              const c = parseFloat(field === "cleaningCharges" ? val : updatedForm.cleaningCharges) || 0;
              const res = parseFloat(field === "restorationCharges" ? val : updatedForm.restorationCharges) || 0;
              const o = parseFloat(field === "otherDeductions" ? val : updatedForm.otherDeductions) || 0;
              const tot = d + r + u + c + res + o;
              const unusedR = updatedForm.currentMonthPdcDeposited ? (parseFloat(updatedForm.unusedRentRefund) || 0) : 0;
              const effDep = grossDeposit + unusedR;
              if (updatedForm.settlementMode === "DEDUCT_FROM_DEPOSIT") {
                updatedForm.refundAmount = String(Math.max(0, effDep - tot));
              } else {
                updatedForm.refundAmount = String(effDep);
              }
              setSettleRefundForm(updatedForm);
            };

            return (
              <div className="space-y-3 py-1 text-xs">
                {/* Compact Tenant & Property Summary Header */}
                <div className="rounded-lg border bg-muted/40 p-2.5 space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Tenant / Customer:</span>
                    <span className="font-semibold text-foreground">{lease?.tenantName || selectedSettlement.leaseId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Property &amp; Unit:</span>
                    <span>{lease?.property || "Old Salata - Residence No:23"} • {lease?.unit || "Unit"}</span>
                  </div>
                </div>

                {/* ── STEP 1: DEDUCTIONS & MODE SELECTION ────────────────────────── */}
                {settleRefundStep === 1 && (
                  <div className="space-y-3">
                    {/* Settlement Mode Selector */}
                    <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                          Damage Settlement Mode
                        </span>
                        <span className="text-[10px] text-amber-800 font-medium">Select accounting treatment</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSettleRefundForm(f => ({ ...f, settlementMode: "DEDUCT_FROM_DEPOSIT", refundAmount: String(maxCalculated) }));
                          }}
                          className={`rounded-lg border p-2 text-left text-[11px] transition-all ${mode === "DEDUCT_FROM_DEPOSIT"
                            ? "border-purple-500 bg-purple-50 text-purple-900 font-semibold ring-1 ring-purple-400"
                            : "border-border bg-background text-muted-foreground hover:border-purple-300"}`}
                        >
                          <div className="font-semibold mb-0.5">✂ Deduct from Deposit</div>
                          <div className="text-[10px] opacity-75">Offset damages from deposit liability. Refund remainder.</div>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSettleRefundForm(f => ({ ...f, settlementMode: "PAY_SEPARATELY", refundAmount: String(grossDeposit) }));
                          }}
                          className={`rounded-lg border p-2 text-left text-[11px] transition-all ${mode === "PAY_SEPARATELY"
                            ? "border-blue-500 bg-blue-50 text-blue-900 font-semibold ring-1 ring-blue-400"
                            : "border-border bg-background text-muted-foreground hover:border-blue-300"}`}
                        >
                          <div className="font-semibold mb-0.5">💳 Customer Pays Separately</div>
                          <div className="text-[10px] opacity-75">Customer pays via Cash, Cheque, Bank, or BG. Full deposit refunded.</div>
                        </button>
                      </div>
                      {mode === "PAY_SEPARATELY" && (
                        <div className="text-[10px] text-blue-800 bg-blue-50 rounded p-1.5 border border-blue-200">
                          ℹ <strong>Customer Pays Separately Mode:</strong> Customer pays <strong>QAR {totalDeductions.toLocaleString()}</strong> directly for damages &amp; repair charges (via Cash, Cheque, Bank Transfer, or Bank Guarantee). A <strong>Receipt Voucher</strong> will be recorded with payment proof, and the full deposit of <strong>QAR {grossDeposit.toLocaleString()}</strong> will be released untouched.
                        </div>
                      )}
                      {mode === "DEDUCT_FROM_DEPOSIT" && remainingAR > 0 && (
                        <div className="text-[10px] text-red-700 bg-red-50 rounded p-1.5 border border-red-200">
                          ⚠ Damages (QAR {totalDeductions.toLocaleString()}) exceed deposit (QAR {grossDeposit.toLocaleString()}). Residual AR of QAR {remainingAR.toLocaleString()} remains outstanding.
                        </div>
                      )}
                    </div>

                    {/* ── Separate Payment Recording & Slip Upload Card ─────────── */}
                    {mode === "PAY_SEPARATELY" && totalDeductions > 0 && (
                      <div className="rounded-lg border border-blue-300 bg-blue-50/70 p-2.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                            <Upload className="h-3.5 w-3.5 text-blue-600" />
                            Tenant Payment Details &amp; Proof Upload
                          </span>
                          <Badge variant="outline" className="text-[10px] border-blue-300 text-blue-800 bg-blue-100 font-semibold">
                            Separate Collection
                          </Badge>
                        </div>

                        {/* Damage Payment Channel Tabs: Bank Transfer, Cash, Cheque, Bank Guarantee */}
                        <div className="space-y-1">
                          <Label className="text-[10px] font-semibold text-blue-950">Payment Channel / Instrument</Label>
                          <div className="grid grid-cols-4 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSettleRefundForm(f => ({ ...f, damagePaymentMode: "Bank Transfer", payerBank: f.payerBank === "Cash In Hand" ? "QNB" : f.payerBank }))}
                              className={`rounded border px-2 py-1.5 text-center text-[11px] font-medium transition-all ${dmgPayMode === "Bank Transfer"
                                ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                                : "border-border bg-background text-muted-foreground hover:bg-muted"}`}
                            >
                              🏦 Bank Transfer
                            </button>
                            <button
                              type="button"
                              onClick={() => setSettleRefundForm(f => ({ ...f, damagePaymentMode: "Cash", payerBank: "Cash In Hand" }))}
                              className={`rounded border px-2 py-1.5 text-center text-[11px] font-medium transition-all ${dmgPayMode === "Cash"
                                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                                : "border-border bg-background text-muted-foreground hover:bg-muted"}`}
                            >
                              💵 Cash In Hand
                            </button>
                            <button
                              type="button"
                              onClick={() => setSettleRefundForm(f => ({ ...f, damagePaymentMode: "Cheque", payerBank: f.payerBank === "Cash In Hand" ? "Commercial Bank" : f.payerBank }))}
                              className={`rounded border px-2 py-1.5 text-center text-[11px] font-medium transition-all ${dmgPayMode === "Cheque"
                                ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                                : "border-border bg-background text-muted-foreground hover:bg-muted"}`}
                            >
                              📝 Bank Cheque
                            </button>
                            <button
                              type="button"
                              onClick={() => setSettleRefundForm(f => ({ ...f, damagePaymentMode: "Bank Guarantee", payerBank: f.payerBank === "Cash In Hand" ? "QNB" : f.payerBank }))}
                              className={`rounded border px-2 py-1.5 text-center text-[11px] font-medium transition-all ${dmgPayMode === "Bank Guarantee"
                                ? "border-amber-600 bg-amber-600 text-white shadow-sm"
                                : "border-border bg-background text-muted-foreground hover:bg-muted"}`}
                            >
                              🛡 Bank Guarantee
                            </button>
                          </div>
                        </div>

                        {/* Dynamic fields based on payment mode */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-medium text-blue-950">
                              {dmgPayMode === "Cash" ? "Cash Receipt / Slip #" :
                               dmgPayMode === "Cheque" ? "Cheque Number #" :
                               dmgPayMode === "Bank Guarantee" ? "Bank Guarantee (BG) Ref #" :
                               "Transaction / Wire Ref #"} <span className="text-destructive">*</span>
                            </Label>
                            <Input
                              className="h-7 text-xs font-mono bg-background"
                              placeholder={
                                dmgPayMode === "Cash" ? "e.g. CRV-4019" :
                                dmgPayMode === "Cheque" ? "e.g. CHQ-0018492" :
                                dmgPayMode === "Bank Guarantee" ? "e.g. BG-QNB-2026-8812" :
                                "e.g. TRX-CBQ-90123"
                              }
                              value={settleRefundForm.paymentRefNo}
                              onChange={(e) => setSettleRefundForm({ ...settleRefundForm, paymentRefNo: e.target.value })}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] font-medium text-blue-950">
                              {dmgPayMode === "Cash" ? "Receiving Location / Counter" :
                               dmgPayMode === "Bank Guarantee" ? "Issuing Bank Name" :
                               dmgPayMode === "Cheque" ? "Drawn Bank Name" :
                               "Payer Bank Name"}
                            </Label>
                            <Input
                              className="h-7 text-xs bg-background"
                              placeholder={
                                dmgPayMode === "Cash" ? "e.g. Finance Cashier Desk" :
                                dmgPayMode === "Bank Guarantee" ? "e.g. Qatar National Bank (QNB)" :
                                "e.g. QNB / CBQ / Doha Bank"
                              }
                              value={settleRefundForm.payerBank}
                              onChange={(e) => setSettleRefundForm({ ...settleRefundForm, payerBank: e.target.value })}
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-[10px] font-medium text-blue-950">
                              {dmgPayMode === "Cheque" ? "Cheque Date" :
                               dmgPayMode === "Bank Guarantee" ? "BG Issue Date" :
                               "Payment / Receipt Date"}
                            </Label>
                            <Input
                              type="date"
                              className="h-7 text-xs bg-background"
                              value={settleRefundForm.paymentDate}
                              onChange={(e) => setSettleRefundForm({ ...settleRefundForm, paymentDate: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Extra field for Bank Guarantee Expiry */}
                        {dmgPayMode === "Bank Guarantee" && (
                          <div className="grid grid-cols-2 gap-2 bg-amber-100/60 p-2 rounded border border-amber-200">
                            <div className="space-y-1">
                              <Label className="text-[10px] font-semibold text-amber-950">
                                Bank Guarantee Expiry Date <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                type="date"
                                className="h-7 text-xs bg-background font-mono"
                                value={settleRefundForm.bgExpiryDate}
                                onChange={(e) => setSettleRefundForm({ ...settleRefundForm, bgExpiryDate: e.target.value })}
                              />
                            </div>
                            <div className="text-[10px] text-amber-900 flex items-center pt-2">
                              🛡 <em>Bank Guarantee serves as secure payment instrument held against damage clearance (GL 12500).</em>
                            </div>
                          </div>
                        )}

                        {/* File Upload Box */}
                        <div className="space-y-1">
                          <Label className="text-[10px] font-medium text-blue-950">
                            {dmgPayMode === "Cash" ? "Upload Signed Cash Receipt / Counter Slip" :
                             dmgPayMode === "Cheque" ? "Upload Cheque Leaf Copy (Front & Back)" :
                             dmgPayMode === "Bank Guarantee" ? "Upload Bank Guarantee Certificate / Official Letter" :
                             "Upload Payment Slip / Bank Transfer Confirmation"}
                          </Label>
                          {settleRefundForm.paymentProofFileName ? (
                            <div className="flex items-center justify-between p-2 rounded bg-background border border-emerald-300">
                              <div className="flex items-center gap-2 overflow-hidden">
                                <FileCheck2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                <span className="text-xs font-medium truncate text-foreground">{settleRefundForm.paymentProofFileName}</span>
                                <Badge className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0">Attached</Badge>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px] text-destructive hover:bg-destructive/10 px-2"
                                onClick={() => setSettleRefundForm({ ...settleRefundForm, paymentProofFileName: "", paymentProofData: "" })}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center p-2.5 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-background hover:bg-blue-50/50 transition-colors">
                              <div className="flex items-center gap-2 text-blue-700">
                                <Upload className="h-3.5 w-3.5" />
                                <span className="text-xs font-medium">
                                  {dmgPayMode === "Cash" ? "Click to upload signed cash voucher / receipt copy" :
                                   dmgPayMode === "Cheque" ? "Click to upload scanned cheque leaf copy" :
                                   dmgPayMode === "Bank Guarantee" ? "Click to upload scanned BG certificate / letter" :
                                   "Click to upload bank transfer slip / screenshot"}
                                </span>
                              </div>
                              <span className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, PDF up to 10MB</span>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      setSettleRefundForm((prev) => ({
                                        ...prev,
                                        paymentProofFileName: file.name,
                                        paymentProofData: reader.result as string,
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Editable Damage & Deduction Details */}
                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                          ✏ Update Damage &amp; Repair Details (Tenant-Agreed)
                        </span>
                        <span className="text-[10px] text-muted-foreground">Editable before final posting</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[10px] font-medium text-muted-foreground">Damage / Repairs (QAR)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            className="h-7 text-xs font-mono bg-background"
                            value={settleRefundForm.damages}
                            onChange={(e) => handleDeductionChange("damages", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-medium text-muted-foreground">Outstanding Rent (QAR)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            className="h-7 text-xs font-mono bg-background"
                            value={settleRefundForm.outstandingRent}
                            onChange={(e) => handleDeductionChange("outstandingRent", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-medium text-muted-foreground">Kahramaa / Utilities (QAR)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            className="h-7 text-xs font-mono bg-background"
                            value={settleRefundForm.utilityCharges}
                            onChange={(e) => handleDeductionChange("utilityCharges", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-medium text-muted-foreground">Deep Cleaning (QAR)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            className="h-7 text-xs font-mono bg-background"
                            value={settleRefundForm.cleaningCharges}
                            onChange={(e) => handleDeductionChange("cleaningCharges", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-medium text-muted-foreground">Painting / Restoration (QAR)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            className="h-7 text-xs font-mono bg-background"
                            value={settleRefundForm.restorationCharges}
                            onChange={(e) => handleDeductionChange("restorationCharges", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[10px] font-medium text-muted-foreground">Other Charges (QAR)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            className="h-7 text-xs font-mono bg-background"
                            value={settleRefundForm.otherDeductions}
                            onChange={(e) => handleDeductionChange("otherDeductions", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <Label className="text-[10px] font-medium text-muted-foreground">Tenant Damage Agreement / Quotation Notes</Label>
                        <Input
                          className="h-7 text-xs bg-background"
                          placeholder="e.g. Tenant agreed to pay QR 650 for wall repair and faucet replacement"
                          value={settleRefundForm.damageRemarks}
                          onChange={(e) => setSettleRefundForm({ ...settleRefundForm, damageRemarks: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* ── Occupancy & PDC Unused Rent Panel ─────────────── */}
                    <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-2.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900">
                          🗓 Occupancy & Current-Month PDC
                        </span>
                        <span className="text-[10px] text-teal-700">Unused rent refund if PDC deposited</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-teal-900">Days Occupied in Month</label>
                          <input
                            type="number"
                            min={0}
                            max={31}
                            className="w-full h-7 rounded border border-teal-300 bg-background px-2 text-xs font-mono"
                            value={settleRefundForm.daysOccupiedInMonth}
                            onChange={(e) => {
                              const dOcc = parseInt(e.target.value) || 0;
                              const dTot = parseInt(settleRefundForm.totalDaysInMonth) || 30;
                              const computed = settleRefundForm.currentMonthPdcDeposited
                                ? Math.round((_monthlyRent / dTot) * Math.max(0, dTot - dOcc))
                                : 0;
                              const unusedR = computed;
                              const effDep = grossDeposit + unusedR;
                              const tot = (parseFloat(settleRefundForm.damages) || 0) + (parseFloat(settleRefundForm.outstandingRent) || 0)
                                + (parseFloat(settleRefundForm.utilityCharges) || 0) + (parseFloat(settleRefundForm.cleaningCharges) || 0)
                                + (parseFloat(settleRefundForm.restorationCharges) || 0) + (parseFloat(settleRefundForm.otherDeductions) || 0);
                              const refund = settleRefundForm.settlementMode === "DEDUCT_FROM_DEPOSIT"
                                ? Math.max(0, effDep - tot) : effDep;
                              setSettleRefundForm(f => ({ ...f, daysOccupiedInMonth: e.target.value, unusedRentRefund: String(unusedR), refundAmount: String(refund) }));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-teal-900">Total Days in Month</label>
                          <input
                            type="number"
                            min={28}
                            max={31}
                            className="w-full h-7 rounded border border-teal-300 bg-background px-2 text-xs font-mono"
                            value={settleRefundForm.totalDaysInMonth}
                            onChange={(e) => {
                              const dTot = parseInt(e.target.value) || 30;
                              const dOcc = parseInt(settleRefundForm.daysOccupiedInMonth) || 0;
                              const computed = settleRefundForm.currentMonthPdcDeposited
                                ? Math.round((_monthlyRent / dTot) * Math.max(0, dTot - dOcc))
                                : 0;
                              const unusedR = computed;
                              const effDep = grossDeposit + unusedR;
                              const tot = (parseFloat(settleRefundForm.damages) || 0) + (parseFloat(settleRefundForm.outstandingRent) || 0)
                                + (parseFloat(settleRefundForm.utilityCharges) || 0) + (parseFloat(settleRefundForm.cleaningCharges) || 0)
                                + (parseFloat(settleRefundForm.restorationCharges) || 0) + (parseFloat(settleRefundForm.otherDeductions) || 0);
                              const refund = settleRefundForm.settlementMode === "DEDUCT_FROM_DEPOSIT"
                                ? Math.max(0, effDep - tot) : effDep;
                              setSettleRefundForm(f => ({ ...f, totalDaysInMonth: e.target.value, unusedRentRefund: String(unusedR), refundAmount: String(refund) }));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-teal-900">Current Month PDC Deposited?</label>
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const dOcc = parseInt(settleRefundForm.daysOccupiedInMonth) || 0;
                                const dTot = parseInt(settleRefundForm.totalDaysInMonth) || 30;
                                const computed = Math.round((_monthlyRent / dTot) * Math.max(0, dTot - dOcc));
                                const effDep = grossDeposit + computed;
                                const tot = (parseFloat(settleRefundForm.damages) || 0) + (parseFloat(settleRefundForm.outstandingRent) || 0)
                                  + (parseFloat(settleRefundForm.utilityCharges) || 0) + (parseFloat(settleRefundForm.cleaningCharges) || 0)
                                  + (parseFloat(settleRefundForm.restorationCharges) || 0) + (parseFloat(settleRefundForm.otherDeductions) || 0);
                                const refund = settleRefundForm.settlementMode === "DEDUCT_FROM_DEPOSIT"
                                  ? Math.max(0, effDep - tot) : effDep;
                                setSettleRefundForm(f => ({ ...f, currentMonthPdcDeposited: true, unusedRentRefund: String(computed), refundAmount: String(refund) }));
                              }}
                              className={`flex-1 rounded border px-2 py-1 text-[11px] font-semibold transition-all ${
                                settleRefundForm.currentMonthPdcDeposited
                                  ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                                  : "border-border bg-background text-muted-foreground hover:border-teal-400 hover:text-teal-700"
                              }`}
                            >✓ Yes</button>
                            <button
                              type="button"
                              onClick={() => {
                                const tot = (parseFloat(settleRefundForm.damages) || 0) + (parseFloat(settleRefundForm.outstandingRent) || 0)
                                  + (parseFloat(settleRefundForm.utilityCharges) || 0) + (parseFloat(settleRefundForm.cleaningCharges) || 0)
                                  + (parseFloat(settleRefundForm.restorationCharges) || 0) + (parseFloat(settleRefundForm.otherDeductions) || 0);
                                const refund = settleRefundForm.settlementMode === "DEDUCT_FROM_DEPOSIT"
                                  ? Math.max(0, grossDeposit - tot) : grossDeposit;
                                setSettleRefundForm(f => ({ ...f, currentMonthPdcDeposited: false, unusedRentRefund: "0", refundAmount: String(refund) }));
                              }}
                              className={`flex-1 rounded border px-2 py-1 text-[11px] font-semibold transition-all ${
                                !settleRefundForm.currentMonthPdcDeposited
                                  ? "border-red-500 bg-red-500 text-white shadow-sm"
                                  : "border-border bg-background text-muted-foreground hover:border-red-400 hover:text-red-600"
                              }`}
                            >✗ No</button>
                          </div>
                        </div>
                      </div>
                      {settleRefundForm.currentMonthPdcDeposited && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="text-[10px] bg-teal-100 border border-teal-300 rounded p-1.5 space-y-0.5">
                            <div className="font-semibold text-teal-900">Auto-Calculated Unused Rent Refund</div>
                            <div className="font-mono text-teal-800 text-sm font-bold">QAR {_computedUnusedRent.toLocaleString()}</div>
                            <div className="text-teal-700">= QAR {_monthlyRent.toLocaleString()} ÷ {_totalDays}d × {Math.max(0, _totalDays - _daysOccupied)}d unused</div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-medium text-teal-900">Override Unused Rent (QAR)</label>
                            <input
                              type="number"
                              step="0.01"
                              min={0}
                              className="w-full h-7 rounded border border-teal-300 bg-background px-2 text-xs font-mono"
                              value={settleRefundForm.unusedRentRefund}
                              onChange={(e) => {
                                const unusedR = Math.max(0, parseFloat(e.target.value) || 0);
                                const effDep = grossDeposit + unusedR;
                                const tot = (parseFloat(settleRefundForm.damages) || 0) + (parseFloat(settleRefundForm.outstandingRent) || 0)
                                  + (parseFloat(settleRefundForm.utilityCharges) || 0) + (parseFloat(settleRefundForm.cleaningCharges) || 0)
                                  + (parseFloat(settleRefundForm.restorationCharges) || 0) + (parseFloat(settleRefundForm.otherDeductions) || 0);
                                const refund = settleRefundForm.settlementMode === "DEDUCT_FROM_DEPOSIT"
                                  ? Math.max(0, effDep - tot) : effDep;
                                setSettleRefundForm(f => ({ ...f, unusedRentRefund: e.target.value, refundAmount: String(refund) }));
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Financial Summary Card */}
                    <div className="rounded-lg border bg-purple-50/50 border-purple-200 p-2.5 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 block">
                        Settlement Financial Summary
                      </span>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded bg-background border">
                          <span className="text-muted-foreground block text-[10px]">Security Deposit Held:</span>
                          <span className="font-bold text-foreground font-mono">QAR {grossDeposit.toLocaleString()}</span>
                          {unusedRentRefundUI > 0 && (
                            <span className="block text-[10px] text-teal-700 font-semibold">+ QAR {unusedRentRefundUI.toLocaleString()} unused rent</span>
                          )}
                        </div>
                        <div className="p-2 rounded bg-background border">
                          <span className="text-muted-foreground block text-[10px]">Total Damages / Deductions:</span>
                          <span className="font-bold text-destructive font-mono">-QAR {totalDeductions.toLocaleString()}</span>
                        </div>
                        <div className="p-2 rounded bg-background border border-emerald-300 bg-emerald-50/70">
                          <span className="text-emerald-800 block text-[10px] font-semibold">
                            {mode === "PAY_SEPARATELY" ? "Total Refund:" : "Net Refund to Pay:"}
                          </span>
                          <span className="font-bold text-emerald-700 font-mono">
                            QAR {mode === "PAY_SEPARATELY" ? effectiveDepositUI.toLocaleString() : maxCalculated.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── STEP 2: PAYMENT, GL POSTINGS & CONFIRMATION ──────────────── */}
                {settleRefundStep === 2 && (
                  <div className="space-y-3">
                    {/* Mode & Calculation Recap Badge */}
                    <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-muted-foreground block">Selected Settlement Mode</span>
                          <span className="font-semibold text-purple-900 text-xs">
                            {mode === "DEDUCT_FROM_DEPOSIT" ? "✂ Deductions from Deposit" : `💳 Customer Pays Separately (${dmgPayMode})`}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground block">
                            {mode === "PAY_SEPARATELY" ? `Damage Collection (${dmgPayMode})` : "Total Deductions Applied"}
                          </span>
                          <span className="font-mono font-bold text-xs text-foreground">
                            QAR {totalDeductions.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {mode === "PAY_SEPARATELY" && (settleRefundForm.paymentProofFileName || settleRefundForm.paymentRefNo) && (
                        <div className="flex items-center justify-between text-[10px] text-blue-900 bg-blue-100/70 rounded px-2 py-1 border border-blue-200">
                          <span>
                            Channel: <strong>{dmgPayMode}</strong> • Ref: <strong>{settleRefundForm.paymentRefNo || "N/A"}</strong> • Source: <strong>{settleRefundForm.payerBank || "N/A"}</strong>
                            {dmgPayMode === "Bank Guarantee" && settleRefundForm.bgExpiryDate && ` • Exp: ${settleRefundForm.bgExpiryDate}`}
                          </span>
                          {settleRefundForm.paymentProofFileName && (
                            <span className="flex items-center gap-1 font-medium text-emerald-800">
                              <FileCheck2 className="h-3 w-3 text-emerald-600" /> Proof Attached
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Payment Configuration */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">
                          {mode === "PAY_SEPARATELY" ? "Deposit Refund Amount (QAR)" : "Actual Refund to Pay (QAR)"} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          className="h-8 text-xs font-mono font-bold"
                          value={settleRefundForm.refundAmount}
                          onChange={(e) => setSettleRefundForm({ ...settleRefundForm, refundAmount: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Deposit Refund Payment Method</Label>
                        <Select
                          value={settleRefundForm.paymentMethod}
                          onValueChange={(v) => setSettleRefundForm({ ...settleRefundForm, paymentMethod: v })}
                        >
                          <SelectTrigger className="h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            <SelectItem value="Cheque">Bank Cheque</SelectItem>
                            <SelectItem value="Cash">Cash In Hand</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Detailed Payment Transaction Fields */}
                    {settleRefundForm.paymentMethod === "Bank Transfer" && (
                      <div className="rounded-lg border bg-blue-50/40 p-3 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-900">
                          <Building2 className="h-3.5 w-3.5 text-blue-600" />
                          <span>Bank Transfer Details</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-muted-foreground">Beneficiary Bank</Label>
                            <Input
                              className="h-7 text-xs bg-background"
                              placeholder="e.g. Qatar National Bank (QNB)"
                              value={settleRefundForm.refundBank}
                              onChange={(e) => setSettleRefundForm({ ...settleRefundForm, refundBank: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-muted-foreground">Beneficiary IBAN / Account No.</Label>
                            <Input
                              className="h-7 text-xs font-mono bg-background"
                              placeholder="QA00QNBA000000000000000000000"
                              value={settleRefundForm.refundIban}
                              onChange={(e) => setSettleRefundForm({ ...settleRefundForm, refundIban: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-muted-foreground">Transaction / Transfer Ref #</Label>
                            <Input
                              className="h-7 text-xs font-mono bg-background"
                              placeholder="e.g. TRF-998241"
                              value={settleRefundForm.refundTxRef}
                              onChange={(e) => setSettleRefundForm({ ...settleRefundForm, refundTxRef: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-muted-foreground">Transfer Execution Date</Label>
                            <Input
                              type="date"
                              className="h-7 text-xs bg-background"
                              value={settleRefundForm.refundPaymentDate}
                              onChange={(e) => setSettleRefundForm({ ...settleRefundForm, refundPaymentDate: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {settleRefundForm.paymentMethod === "Cheque" && (
                      <div className="rounded-lg border bg-amber-50/40 p-3 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                          <CreditCard className="h-3.5 w-3.5 text-amber-600" />
                          <span>Bank Cheque Disbursement Details</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-muted-foreground">Cheque Number</Label>
                            <Input
                              className="h-7 text-xs font-mono bg-background"
                              placeholder="e.g. CHQ-88219"
                              value={settleRefundForm.refundChequeNo}
                              onChange={(e) => setSettleRefundForm({ ...settleRefundForm, refundChequeNo: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-muted-foreground">Issuing Bank</Label>
                            <Input
                              className="h-7 text-xs bg-background"
                              placeholder="e.g. QNB Operating Account"
                              value={settleRefundForm.refundChequeBank}
                              onChange={(e) => setSettleRefundForm({ ...settleRefundForm, refundChequeBank: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-muted-foreground">Cheque Date</Label>
                            <Input
                              type="date"
                              className="h-7 text-xs bg-background"
                              value={settleRefundForm.refundChequeDate}
                              onChange={(e) => setSettleRefundForm({ ...settleRefundForm, refundChequeDate: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {settleRefundForm.paymentMethod === "Cash" && (
                      <div className="rounded-lg border bg-emerald-50/40 p-3 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
                          <Banknote className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Cash Disbursement Details</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-muted-foreground">Disbursed By / Cashier Name</Label>
                            <Input
                              className="h-7 text-xs bg-background"
                              placeholder="e.g. Main Cash Till / Treasury"
                              value={settleRefundForm.refundCashierName}
                              onChange={(e) => setSettleRefundForm({ ...settleRefundForm, refundCashierName: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] font-semibold text-muted-foreground">Disbursement Date</Label>
                            <Input
                              type="date"
                              className="h-7 text-xs bg-background"
                              value={settleRefundForm.refundPaymentDate}
                              onChange={(e) => setSettleRefundForm({ ...settleRefundForm, refundPaymentDate: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Proof Attachment & Remarks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Payment Proof / Signed Slip (Optional)</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="file"
                            className="h-8 text-xs bg-background"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setSettleRefundForm({
                                    ...settleRefundForm,
                                    refundProofFileName: file.name,
                                    refundProofData: reader.result as string,
                                  });
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          {settleRefundForm.refundProofFileName && (
                            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300 shrink-0">
                              Attached
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Settlement &amp; Refund Remarks</Label>
                        <Input
                          className="h-8 text-xs"
                          placeholder="e.g. Unit inspected, damage costs settled, deposit refund processed"
                          value={settleRefundForm.notes}
                          onChange={(e) => setSettleRefundForm({ ...settleRefundForm, notes: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* GL Double-Entry Preview */}
                    <div className="rounded-lg border bg-muted/30 p-2.5 space-y-1 text-[11px]">
                      <span className="font-semibold text-muted-foreground uppercase text-[10px] block">
                        Automatic Double-Entry Posting on Execution ({mode === "DEDUCT_FROM_DEPOSIT" ? "Deduct from Deposit" : `Customer Pays via ${dmgPayMode}`}):
                      </span>
                      {mode === "DEDUCT_FROM_DEPOSIT" ? (
                        <>
                          {totalDeductions > 0 && (
                            <>
                              <div className="flex justify-between font-mono text-amber-700">
                                <span>DR 12413 Tenant Receivables (damage recognized)</span>
                                <span>QAR {totalDeductions.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-mono text-amber-600 opacity-80">
                                <span>&nbsp;&nbsp;CR 41400/41100 Recovery Income</span>
                                <span>QAR {totalDeductions.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-mono text-purple-700">
                                <span>DR 21500 Security Deposit (deduction)</span>
                                <span>QAR {depositDeduction.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-mono text-purple-600 opacity-80">
                                <span>&nbsp;&nbsp;CR 12413 Tenant Receivables (settled)</span>
                                <span>QAR {depositDeduction.toLocaleString()}</span>
                              </div>
                            </>
                          )}
                          {enteredRefund > 0 && (
                            <>
                              <div className="flex justify-between font-mono text-emerald-700">
                                <span>DR 21500 Security Deposit (refund balance)</span>
                                <span>QAR {enteredRefund.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-mono text-blue-700">
                                <span>&nbsp;&nbsp;CR {bankLabel}</span>
                                <span>QAR {enteredRefund.toLocaleString()}</span>
                              </div>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {totalDeductions > 0 && (
                            <>
                              <div className="flex justify-between font-mono text-amber-700">
                                <span>DR 12413 Tenant Receivables (damage recognized)</span>
                                <span>QAR {totalDeductions.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-mono text-amber-600 opacity-80">
                                <span>&nbsp;&nbsp;CR 41400/41100 Recovery Income</span>
                                <span>QAR {totalDeductions.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-mono text-blue-700">
                                <span>DR {dmgDrLabel} (tenant settles damage via {dmgPayMode})</span>
                                <span>QAR {totalDeductions.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-mono text-blue-600 opacity-80">
                                <span>&nbsp;&nbsp;CR 12413 Tenant Receivables</span>
                                <span>QAR {totalDeductions.toLocaleString()}</span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between font-mono text-emerald-700">
                            <span>DR 21500 Security Deposit (full refund)</span>
                            <span>QAR {grossDeposit.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-mono text-blue-700">
                            <span>&nbsp;&nbsp;CR {bankLabel}</span>
                            <span>QAR {grossDeposit.toLocaleString()}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer Navigation */}
                <DialogFooter className="gap-2 border-t pt-2 mt-2">
                  {settleRefundStep === 1 ? (
                    <>
                      <Button variant="outline" onClick={() => setSettleRefundOpen(false)}>Cancel</Button>
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700 text-white" 
                        onClick={() => setSettleRefundStep(2)}
                      >
                        Next: Payment &amp; GL Review →
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setSettleRefundStep(1)}>
                        ← Back to Deductions
                      </Button>
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700 text-white" 
                        onClick={executeSettleAndRefund}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Settlement &amp; Issue Receipt
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── START CHECKOUT / VACATE DIALOG (UPGRADED WITH FULL TENANT & PROPERTY DETAILS) ── */}
      <Dialog open={startCheckoutOpen} onOpenChange={setStartCheckoutOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <LogOut className="h-5 w-5 text-rose-600" />
              Initiate Tenant Vacate &amp; Check-Out
            </DialogTitle>
            <DialogDescription className="text-xs">
              Record tenant vacating / early move-out notice, verify lease tenure, and queue inspection and deposit settlement.
            </DialogDescription>
          </DialogHeader>

          {/* Customer / Lease Selector dropdown (Always Visible) */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" /> Select Customer / Tenant Lease
            </Label>
            {(() => {
              const activeLeases = leases.filter(
                (l) => (l.status as any) !== "closed" && (l.status as any) !== "terminated" && (l.status as any) !== "checkout"
              );
              return (
                <Select
                  value={checkoutWorkflowLease?.id || ""}
                  onValueChange={(val) => {
                    const target = leases.find((l) => l.id === val);
                    if (target) {
                      setCheckoutWorkflowLease(target);
                      setStartCheckoutForm((f) => ({
                        ...f,
                        moveOutDate: today.toISOString().split("T")[0],
                        inspectionDate: today.toISOString().split("T")[0],
                      }));
                    }
                  }}
                >
                  <SelectTrigger className="h-9 text-xs font-medium bg-background border-primary/40 focus:ring-primary">
                    <SelectValue placeholder={activeLeases.length === 0 ? "No active leases found" : "Choose an active customer / lease"} />
                  </SelectTrigger>
                  <SelectContent>
                    {activeLeases.length === 0 ? (
                      <div className="py-2 px-3 text-xs text-muted-foreground">No active leases available for check-out</div>
                    ) : (
                      activeLeases.map((l) => (
                        <SelectItem key={l.id} value={l.id} className="text-xs font-medium">
                          {l.tenantName} — {l.unit} ({l.property}) [{l.startDate} to {l.endDate}]
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              );
            })()}
          </div>

          {checkoutWorkflowLease && (() => {
            const customer = customers.find(c => c.id === checkoutWorkflowLease.customerId);
            return (
              <div className="space-y-3 py-1 text-xs">
                {/* 2-Column Tenant & Property Overview Card */}
                <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Tenant Name</span>
                      <span className="font-semibold text-foreground text-sm">{checkoutWorkflowLease.tenantName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Unit &amp; Property</span>
                      <span className="font-semibold text-foreground">{checkoutWorkflowLease.unit} ({checkoutWorkflowLease.property})</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Contact / QID / Mobile</span>
                      <span className="font-mono text-muted-foreground">
                        {customer?.qatarId || customer?.crNumber || "—"} • {customer?.mobile || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Email Address</span>
                      <span className="text-muted-foreground truncate block">{customer?.email || "—"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Lease Tenure</span>
                      <span className="font-mono text-foreground font-medium">
                        {checkoutWorkflowLease.startDate} to {checkoutWorkflowLease.endDate}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase font-bold">Monthly Rent / Security Deposit</span>
                      <span className="font-mono text-foreground font-medium">
                        QR {checkoutWorkflowLease.monthlyRent?.toLocaleString()} / QR {checkoutWorkflowLease.securityDeposit?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notice & Dates Form */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Notice Date <span className="text-destructive">*</span></Label>
                    <Input
                      type="date"
                      className="h-8 text-xs font-mono"
                      value={startCheckoutForm.noticeDate}
                      onChange={e => setStartCheckoutForm(f => ({ ...f, noticeDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Planned Move-Out Date <span className="text-destructive">*</span></Label>
                    <Input
                      type="date"
                      className="h-8 text-xs font-mono"
                      value={startCheckoutForm.moveOutDate}
                      onChange={e => setStartCheckoutForm(f => ({ ...f, moveOutDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Inspection Schedule <span className="text-destructive">*</span></Label>
                    <Input
                      type="date"
                      className="h-8 text-xs font-mono"
                      value={startCheckoutForm.inspectionDate}
                      onChange={e => setStartCheckoutForm(f => ({ ...f, inspectionDate: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Reason & Coordination Notes */}
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold">Vacating Reason / Handover Notes</Label>
                  <Textarea
                    rows={2}
                    className="text-xs"
                    value={startCheckoutForm.notes}
                    onChange={e => setStartCheckoutForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="e.g. Tenant relocating abroad / lease non-renewal / early vacating agreed by landlord..."
                  />
                </div>

                <div className="rounded-md bg-blue-50 border border-blue-200 p-2 text-[11px] text-blue-800 space-y-0.5">
                  <p className="font-semibold">Next Step upon Initiation:</p>
                  <p className="text-blue-700">
                    A Check-Out Inspection case will be queued under <strong>Checkout</strong>. You can then complete the unit meter readings, verify asset checklist, calculate approved deductions, and issue the official refund receipt &amp; GL settlement vouchers.
                  </p>
                </div>
              </div>
            );
          })()}

          <DialogFooter className="border-t pt-2 gap-2">
            <Button variant="outline" size="sm" onClick={() => setStartCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
              onClick={() => {
                if (checkoutWorkflowLease) {
                  startCheckout(checkoutWorkflowLease);
                  setStartCheckoutOpen(false);
                }
              }}
            >
              <LogOut className="h-3.5 w-3.5" /> Confirm &amp; Queue Check-Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── COMPLETE CHECKOUT DIALOG (UPGRADED MULTI-TAB WITH ASSET INSPECTION) ── */}
      <Dialog open={completeCheckoutOpen} onOpenChange={setCompleteCheckoutOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-2"><ClipboardCheck className="h-5 w-5 text-primary" /></span>
              Check-Out Inspection &amp; Final Clearances
            </DialogTitle>
            <DialogDescription className="text-sm">
              <span className="font-medium text-foreground">{leases.find(l => l.id === selectedCheckout?.leaseId)?.tenantName}</span> · {leases.find(l => l.id === selectedCheckout?.leaseId)?.unit} · {leases.find(l => l.id === selectedCheckout?.leaseId)?.property}
            </DialogDescription>
          </DialogHeader>

          {/* Tab navigation inside checkout dialog */}
          <div className="flex gap-1 rounded-lg bg-muted p-1 text-xs">
            {[
              { id: "condition", label: "🏠 Condition & Meters" },
              { id: "assets", label: "📦 Asset Verification" },
              { id: "damages", label: "💰 Deductions & Settlement" },
              { id: "clearances", label: "✅ Clearances & Sign-Off" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`flex-1 rounded-md px-2.5 py-1.5 font-medium transition-colors ${
                  checkoutActiveTab === tab.id
                    ? "bg-background text-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setCheckoutActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-4 py-2">
            {/* TAB 1: CONDITION & METERS */}
            {checkoutActiveTab === "condition" && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Unit Overall Condition</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Final Condition">
                      <Select value={completeCheckoutForm.condition} onValueChange={v => setCompleteCheckoutForm(f => ({ ...f, condition: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Good">Good — Minor cleaning only</SelectItem>
                          <SelectItem value="Repair required">Repair Required</SelectItem>
                          <SelectItem value="Major damage">Major Damage</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Unit Disposition on Release">
                      <Select value={completeCheckoutForm.unitDisposition} onValueChange={v => setCompleteCheckoutForm(f => ({ ...f, unitDisposition: v as any }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Available">Vacant - Ready / Available</SelectItem>
                          <SelectItem value="Vacant - Under Maintenance">Vacant - Under Maintenance / Repairs</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Final Meter Readings at Check-Out</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="⚡ Final Electricity Meter (kWh)"><Input value={completeCheckoutForm.electricityMeter} onChange={e => setCompleteCheckoutForm(f => ({ ...f, electricityMeter: e.target.value }))} placeholder="e.g. 182207" /></Field>
                    <Field label="💧 Final Water Meter (m³)"><Input value={completeCheckoutForm.waterMeter} onChange={e => setCompleteCheckoutForm(f => ({ ...f, waterMeter: e.target.value }))} placeholder="e.g. 149129" /></Field>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                  <Field label="No. of Photos Documented">
                    <Input type="number" min="0" value={completeCheckoutForm.photos} onChange={e => setCompleteCheckoutForm(f => ({ ...f, photos: e.target.value }))} />
                  </Field>
                  <Field label="Damages / Inspection Notes">
                    <Textarea rows={2} value={completeCheckoutForm.damages} onChange={e => setCompleteCheckoutForm(f => ({ ...f, damages: e.target.value }))} placeholder="Note any scratches, paint peeling, fixture damages..." />
                  </Field>
                </div>
              </div>
            )}

            {/* TAB 2: ASSET VERIFICATION */}
            {checkoutActiveTab === "assets" && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assigned Assets Check-Out Verification</p>
                    <span className="text-xs text-muted-foreground">{handoverAssets.length} asset(s) registered</span>
                  </div>
                  {handoverAssets.length === 0 ? (
                    <div className="rounded-md border bg-background p-4 text-center text-xs text-muted-foreground">
                      No registered fixed assets found for this unit. You can note any unlisted items in the damages/missing items section.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {handoverAssets.map((asset) => {
                        const change = assetChanges[asset.id] || { condition: asset.asset_condition || "Good", imageFileName: "" };
                        return (
                          <div key={asset.id} className="rounded-lg border bg-background p-3 flex items-center justify-between gap-3 text-xs">
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-foreground">{asset.asset_name}</div>
                              <div className="text-muted-foreground text-[11px] font-mono">{asset.asset_code || asset.category || "Asset"}</div>
                            </div>
                            <div className="w-40">
                              <Select value={change.condition} onValueChange={(v) => updateAssetChange(asset.id, { condition: v })}>
                                <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Excellent">Excellent</SelectItem>
                                  <SelectItem value="Good">Good (Normal Wear)</SelectItem>
                                  <SelectItem value="Fair">Fair / Scratched</SelectItem>
                                  <SelectItem value="Needs Attention">Damaged / Missing</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <Field label="Missing Items or Fixtures">
                  <Input value={completeCheckoutForm.missingItems} onChange={e => setCompleteCheckoutForm(f => ({ ...f, missingItems: e.target.value }))} placeholder="e.g. 1 parking remote missing, kitchen light fixture broken..." />
                </Field>
              </div>
            )}

            {/* TAB 3: DEDUCTIONS & SETTLEMENT */}
            {checkoutActiveTab === "damages" && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-purple-50/40 border-purple-200 p-3 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-900">Security Deposit Settlement Calculation</p>
                  {(() => {
                    const lease = leases.find(l => l.id === selectedCheckout?.leaseId);
                    const dep = lease?.securityDeposit || 5100;
                    const rent = Number(completeCheckoutForm.outstandingRent) || 0;
                    const dmg = Number(completeCheckoutForm.damagesAmount) || 0;
                    const utl = Number(completeCheckoutForm.utilityCharges) || 0;
                    const cln = Number(completeCheckoutForm.cleaningCharges) || 0;
                    const rst = Number(completeCheckoutForm.restorationCharges) || 0;
                    const other = Number(completeCheckoutForm.otherDeductions) || 0;
                    const totalDeductions = rent + dmg + utl + cln + rst + other;
                    const _unusedRent = completeCheckoutForm.currentMonthPdcDeposited
                      ? (Number(completeCheckoutForm.unusedRentRefund) || 0) : 0;
                    const netRefund = dep + _unusedRent - totalDeductions;
                    return (
                      <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                        <div className="p-2 rounded bg-background border">
                          <span className="text-muted-foreground block text-[11px]">Gross Deposit:</span>
                          <span className="font-bold text-foreground font-mono">QR {dep.toLocaleString()}</span>
                          {_unusedRent > 0 && (
                            <span className="block text-[10px] text-teal-700 font-semibold">+ QR {_unusedRent.toLocaleString()} unused rent</span>
                          )}
                        </div>
                        <div className="p-2 rounded bg-background border">
                          <span className="text-muted-foreground block text-[11px]">Total Deductions:</span>
                          <span className="font-bold text-destructive font-mono">-QR {totalDeductions.toLocaleString()}</span>
                        </div>
                        <div className="p-2 rounded bg-background border border-emerald-300 bg-emerald-50/60">
                          <span className="text-emerald-800 block text-[11px] font-semibold">Net Refund Payable:</span>
                          <span className="font-bold text-emerald-700 font-mono">QR {netRefund.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="rounded-lg border p-3 space-y-3 text-xs">
                  <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Deduction Item Breakdown (QAR)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Outstanding Rent"><Input type="number" className="h-8 text-xs font-mono" value={completeCheckoutForm.outstandingRent} onChange={e => setCompleteCheckoutForm(f => ({ ...f, outstandingRent: e.target.value }))} /></Field>
                    <Field label="Damage / Repair Costs"><Input type="number" className="h-8 text-xs font-mono" value={completeCheckoutForm.damagesAmount} onChange={e => setCompleteCheckoutForm(f => ({ ...f, damagesAmount: e.target.value }))} /></Field>
                    <Field label="Final Utility (Kahramaa) Charges"><Input type="number" className="h-8 text-xs font-mono" value={completeCheckoutForm.utilityCharges} onChange={e => setCompleteCheckoutForm(f => ({ ...f, utilityCharges: e.target.value }))} /></Field>
                    <Field label="Deep Cleaning Charges"><Input type="number" className="h-8 text-xs font-mono" value={completeCheckoutForm.cleaningCharges} onChange={e => setCompleteCheckoutForm(f => ({ ...f, cleaningCharges: e.target.value }))} /></Field>
                    <Field label="Painting / Restoration Charges"><Input type="number" className="h-8 text-xs font-mono" value={completeCheckoutForm.restorationCharges} onChange={e => setCompleteCheckoutForm(f => ({ ...f, restorationCharges: e.target.value }))} /></Field>
                    <Field label="Other Administrative Deductions"><Input type="number" className="h-8 text-xs font-mono" value={completeCheckoutForm.otherDeductions} onChange={e => setCompleteCheckoutForm(f => ({ ...f, otherDeductions: e.target.value }))} /></Field>
                  </div>
                </div>

                {/* ── Occupancy & Current-Month PDC Panel ── */}
                {(() => {
                  const _lease = leases.find(l => l.id === selectedCheckout?.leaseId);
                  const _rent = _lease?.monthlyRent || 0;
                  const _dOcc = parseInt(completeCheckoutForm.daysOccupiedInMonth) || 0;
                  const _dTot = parseInt(completeCheckoutForm.totalDaysInMonth) || 30;
                  const _isPdc = completeCheckoutForm.currentMonthPdcDeposited;
                  const _computedUnused = _isPdc && _rent > 0
                    ? Math.round((_rent / _dTot) * Math.max(0, _dTot - _dOcc))
                    : 0;
                  return (
                    <div className="rounded-lg border border-teal-200 bg-teal-50/60 p-3 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900">
                          🗓 Occupancy &amp; Current-Month PDC
                        </span>
                        <span className="text-[10px] text-teal-700">Unused rent refund if PDC was deposited</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-teal-900">Days Occupied in Month</label>
                          <Input
                            type="number" min={0} max={31}
                            className="h-8 text-xs font-mono border-teal-300 bg-background"
                            value={completeCheckoutForm.daysOccupiedInMonth}
                            onChange={e => {
                              const dOcc = parseInt(e.target.value) || 0;
                              const dTot = parseInt(completeCheckoutForm.totalDaysInMonth) || 30;
                              const computed = completeCheckoutForm.currentMonthPdcDeposited && _rent > 0
                                ? Math.round((_rent / dTot) * Math.max(0, dTot - dOcc)) : 0;
                              setCompleteCheckoutForm(f => ({ ...f, daysOccupiedInMonth: e.target.value, unusedRentRefund: String(computed) }));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-teal-900">Total Days in Month</label>
                          <Input
                            type="number" min={28} max={31}
                            className="h-8 text-xs font-mono border-teal-300 bg-background"
                            value={completeCheckoutForm.totalDaysInMonth}
                            onChange={e => {
                              const dTot = parseInt(e.target.value) || 30;
                              const dOcc = parseInt(completeCheckoutForm.daysOccupiedInMonth) || 0;
                              const computed = completeCheckoutForm.currentMonthPdcDeposited && _rent > 0
                                ? Math.round((_rent / dTot) * Math.max(0, dTot - dOcc)) : 0;
                              setCompleteCheckoutForm(f => ({ ...f, totalDaysInMonth: e.target.value, unusedRentRefund: String(computed) }));
                            }}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-teal-900">Current Month PDC Deposited?</label>
                          <div className="flex gap-1.5 pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                const computed = _rent > 0
                                  ? Math.round((_rent / _dTot) * Math.max(0, _dTot - _dOcc)) : 0;
                                setCompleteCheckoutForm(f => ({ ...f, currentMonthPdcDeposited: true, unusedRentRefund: String(computed) }));
                              }}
                              className={`flex-1 rounded border px-2 py-1.5 text-[11px] font-bold transition-all ${
                                _isPdc
                                  ? "border-teal-600 bg-teal-600 text-white shadow-sm"
                                  : "border-border bg-background text-muted-foreground hover:border-teal-400 hover:text-teal-700"
                              }`}
                            >✓ Yes</button>
                            <button
                              type="button"
                              onClick={() => setCompleteCheckoutForm(f => ({ ...f, currentMonthPdcDeposited: false, unusedRentRefund: "0" }))}
                              className={`flex-1 rounded border px-2 py-1.5 text-[11px] font-bold transition-all ${
                                !_isPdc
                                  ? "border-red-500 bg-red-500 text-white shadow-sm"
                                  : "border-border bg-background text-muted-foreground hover:border-red-400 hover:text-red-600"
                              }`}
                            >✗ No</button>
                          </div>
                        </div>
                      </div>
                      {_isPdc && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div className="bg-teal-100 border border-teal-300 rounded p-2 space-y-0.5">
                            <span className="font-semibold text-teal-900 block text-[10px]">Auto-Calculated Unused Rent</span>
                            <span className="font-mono text-teal-800 text-sm font-bold">QAR {_computedUnused.toLocaleString()}</span>
                            <span className="text-teal-700 block text-[10px]">= QAR {_rent.toLocaleString()} ÷ {_dTot}d × {Math.max(0, _dTot - _dOcc)}d unused</span>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-teal-900">Override Unused Rent (QAR)</label>
                            <Input
                              type="number" step="0.01" min={0}
                              className="h-8 text-xs font-mono border-teal-300 bg-background"
                              value={completeCheckoutForm.unusedRentRefund}
                              onChange={e => setCompleteCheckoutForm(f => ({ ...f, unusedRentRefund: e.target.value }))}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* TAB 4: CLEARANCES & SIGN-OFF */}
            {checkoutActiveTab === "clearances" && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/30 p-3 space-y-2 text-xs">
                  <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Inter-Departmental Clearances</p>
                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2.5 p-2 rounded-md border bg-background cursor-pointer hover:bg-muted/40">
                      <input type="checkbox" checked={completeCheckoutForm.financeClearance} onChange={e => setCompleteCheckoutForm(f => ({ ...f, financeClearance: e.target.checked }))} className="h-4 w-4 rounded accent-primary" />
                      <div>
                        <span className="font-semibold block">Finance &amp; Accounts Clearance</span>
                        <span className="text-[11px] text-muted-foreground">All rental dues, bounced cheques, and legal matters cleared.</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-2.5 p-2 rounded-md border bg-background cursor-pointer hover:bg-muted/40">
                      <input type="checkbox" checked={completeCheckoutForm.utilityClearance} onChange={e => setCompleteCheckoutForm(f => ({ ...f, utilityClearance: e.target.checked }))} className="h-4 w-4 rounded accent-primary" />
                      <div>
                        <span className="font-semibold block">Kahramaa &amp; Utility Clearance</span>
                        <span className="text-[11px] text-muted-foreground">Final electricity and water meter bill settled with provider.</span>
                      </div>
                    </label>
                    <label className="flex items-center gap-2.5 p-2 rounded-md border bg-background cursor-pointer hover:bg-muted/40">
                      <input type="checkbox" checked={completeCheckoutForm.keysReturned} onChange={e => setCompleteCheckoutForm(f => ({ ...f, keysReturned: e.target.checked }))} className="h-4 w-4 rounded accent-primary" />
                      <div>
                        <span className="font-semibold block">Key &amp; Access Device Handback</span>
                        <span className="text-[11px] text-muted-foreground">All door keys, building access cards, and parking remotes received.</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="rounded-lg border bg-blue-50/60 border-blue-200 p-3 text-xs text-blue-900 space-y-1">
                  <span className="font-bold block">📜 Settlement Statement Ready for Sign-Off</span>
                  <p className="text-[11px]">
                    Submitting this form will finalize the Move-Out inspection, update the checkout case to <span className="font-semibold">Ready For Settlement</span>, and generate the final deposit refund record.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 border-t pt-2">
            <Button variant="outline" onClick={() => setCompleteCheckoutOpen(false)}>Cancel</Button>
            <Button onClick={() => selectedCheckout && completeCheckout(selectedCheckout)}>
              <ClipboardCheck className="mr-2 h-4 w-4" /> Complete &amp; Generate Settlement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ADD PDC DIALOG ────────────────────────────────────── */}
      <Dialog open={addPdcOpen} onOpenChange={setAddPdcOpen}>
        <DialogContent className="sm:max-w-[1000px] max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Manual Bulk PDC / Cheque Entry</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Register up to 12 post-dated cheques with maturity, tenure periods, and scan attachments.</DialogDescription>
            </div>
          </div>
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            <Field label="Select Lease Contract *">
              <Select value={pdcLeaseId} onValueChange={setPdcLeaseId}>
                <SelectTrigger className="bg-background"><SelectValue placeholder="Select lease" /></SelectTrigger>
                <SelectContent>
                  {leases.map(l => <SelectItem key={l.id} value={l.id}>{l.tenantName} — {l.unit} ({l.property})</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <div className="rounded-xl border bg-muted/20 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-primary" /> Cheque Schedule Rows
                </span>
                <span className="text-xs text-muted-foreground">Leave empty rows to skip</span>
              </div>
              <div className="grid grid-cols-[2fr_2fr_2fr_2fr_3fr_2fr] gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                <span>Cheque No.</span>
                <span>Bank</span>
                <span>Maturity Date</span>
                <span>Amount (QR)</span>
                <span>Tenure (Start & End)</span>
                <span>Cheque Scan</span>
              </div>
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {pdcRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[2fr_2fr_2fr_2fr_3fr_2fr] gap-2 items-center text-sm p-1.5 rounded-lg bg-background border hover:border-primary/40 transition-colors">
                    <Input
                      value={row.chequeNo}
                      onChange={e => handlePdcRowChange(idx, "chequeNo", e.target.value)}
                      placeholder={`PDC-${idx + 1}`}
                      className="h-8 text-xs"
                    />
                    <Input
                      value={row.bank}
                      onChange={e => handlePdcRowChange(idx, "bank", e.target.value)}
                      placeholder="Bank"
                      className="h-8 text-xs"
                    />
                    <Input
                      type="date"
                      value={row.maturityDate}
                      onChange={e => handlePdcRowChange(idx, "maturityDate", e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      value={row.amount}
                      onChange={e => handlePdcRowChange(idx, "amount", e.target.value)}
                      placeholder="Amount"
                      className="h-8 text-xs font-mono font-bold"
                    />
                    <div className="flex gap-1">
                      <Input
                        type="date"
                        value={row.tenureStart}
                        onChange={e => handlePdcRowChange(idx, "tenureStart", e.target.value)}
                        title="Start Date"
                        className="h-8 text-[11px] px-1"
                      />
                      <Input
                        type="date"
                        value={row.tenureEnd}
                        onChange={e => handlePdcRowChange(idx, "tenureEnd", e.target.value)}
                        title="End Date"
                        className="h-8 text-[11px] px-1"
                      />
                    </div>
                    <Input
                      type="file"
                      onChange={e => handlePdcRowChange(idx, "file", e.target.files?.[0]?.name || "")}
                      className="h-8 text-[11px] cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setAddPdcOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={addManualPdc}><Receipt className="mr-2 h-4 w-4" /> Save PDC Records</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── PAGE HEADER ───────────────────────────────────────────── */}

      {/* ── DYNAMIC CONTEXTUAL PAGE HEADER & SUB-MODULE CARDS ───────────────────────────────────────────── */}

      {activeTab === "customers" && (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Customer Master</h2>
              <p className="text-muted-foreground">Manage individual & corporate tenants, KYC verification, duplicate checks and contacts.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setBulkCustomerOpen(true)}
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4 text-primary" /> Excel Bulk Import / Manage
              </Button>
              <Button onClick={() => setCreateCustomerOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" /> Add Customer
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Total Customers" value={(customers || []).length} icon={<Users className="h-4 w-4 text-emerald-600" />} description="Active tenant profiles" />
            <Metric label="Individual Tenants" value={(customers || []).filter(c => c?.type === "individual").length} icon={<UserCheck className="h-4 w-4 text-blue-600" />} description="Personal residential leases" />
            <Metric label="Corporate Accounts" value={(customers || []).filter(c => c?.type === "company").length} icon={<Building2 className="h-4 w-4 text-indigo-600" />} description="Commercial & bulk company leases" />
            <Metric label="Active Status" value={(customers || []).filter(c => c?.status === "active").length} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} description="Verified & active customers" />
          </div>
        </>
      )}

      {activeTab === "reservations" && (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Unit Reservations</h2>
              <p className="text-muted-foreground">Lock available units for prospective tenants with validity limits and conversion controls.</p>
            </div>
            <Button onClick={() => setCreateReservationOpen(true)}>
              <Lock className="mr-2 h-4 w-4" /> Create Reservation
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Active Reserved" value={activeReservations} icon={<Lock className="h-4 w-4 text-blue-600" />} description="Currently held units" />
            <Metric label="Converted to Lease" value={(reservations || []).filter(r => r?.status === "converted").length} icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} description="Successfully converted" />
            <Metric label="Released / Expired" value={(reservations || []).filter(r => r?.status === "released" || (r?.validUntil && isExpired(r.validUntil))).length} icon={<AlertCircle className="h-4 w-4 text-amber-600" />} description="Released back to inventory" />
            <Metric label="Total Reservations" value={(reservations || []).length} icon={<DoorOpen className="h-4 w-4 text-purple-600" />} description="Historical bookings logged" />
          </div>
        </>
      )}

      {activeTab === "documents" && (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Document Verification</h2>
              <p className="text-muted-foreground">Verify mandatory QID, Passport, CR, and salary documents before lease generation.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Verified Documents" value={(documents || []).filter(d => d?.status === "verified").length} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} description="Compliant & approved" />
            <Metric label="Document Blocks" value={blockedDocuments} icon={<AlertCircle className="h-4 w-4 text-amber-600" />} description="Mandatory docs pending review" />
            <Metric label="Info Required / Rejected" value={(documents || []).filter(d => d?.status === "info_required" || d?.status === "rejected").length} icon={<ShieldAlert className="h-4 w-4 text-red-600" />} description="Requires tenant resubmission" />
            <Metric label="Total Documents" value={(documents || []).length} icon={<FileText className="h-4 w-4 text-blue-600" />} description="Tenant KYC files tracked" />
          </div>
        </>
      )}

      {activeTab === "agreement" && (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Lease Agreement Terms</h2>
              <p className="text-muted-foreground">Configure payment schedules, PDC terms, maintenance responsibilities and notice periods.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setBulkLeaseOpen(true)}
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4 text-primary" /> Excel Bulk Import / Manage
              </Button>
              <Button onClick={() => setCreateLeaseOpen(true)}>
                <FileSignature className="mr-2 h-4 w-4" /> Create Lease
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Total Agreements" value={(leases || []).length} icon={<FileSignature className="h-4 w-4 text-emerald-600" />} description="All contract records" />
            <Metric label="Active Contracts" value={(leases || []).filter(l => l?.status === "active" || l?.status === "fully_signed").length} icon={<CheckCircle2 className="h-4 w-4 text-blue-600" />} description="Live tenancy contracts" />
            <Metric label="Draft / In-Review" value={(leases || []).filter(l => l?.status === "documents_pending" || l?.status === "documents_verified" || l?.status === "tenant_signed_pending_collection").length} icon={<Clock className="h-4 w-4 text-amber-600" />} description="Pending execution" />
            <Metric label="Total Monthly Rent" value={formatMoney((leases || []).reduce((sum, l) => sum + (Number(l?.monthlyRent) || 0), 0))} icon={<Banknote className="h-4 w-4 text-indigo-600" />} description="Contracted monthly roll" />
          </div>
        </>
      )}

      {activeTab === "signatures" && (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Signatures & Collection Workflow</h2>
              <p className="text-muted-foreground">Gate execution with tenant digital/ink signature, security deposit & PDC collection, and landlord countersign.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Pending Collection" value={(leases || []).filter(l => !l?.collectionCompleted).length} icon={<Wallet className="h-4 w-4 text-amber-600" />} description="PDCs / Deposit not yet collected" />
            <Metric label="Collections Completed" value={(leases || []).filter(l => l?.collectionCompleted).length} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} description="Receipts generated & locked" />
            <Metric label="Fully Signed" value={(leases || []).filter(l => l?.status === "fully_signed" || l?.status === "active").length} icon={<FileCheck className="h-4 w-4 text-emerald-600" />} description="Tenant & Landlord executed" />
            <Metric label="Pending Signatures" value={(leases || []).filter(l => l?.status === "tenant_signed_pending_collection" || l?.status === "pending_landlord_signature" || l?.status === "documents_pending").length} icon={<Clock className="h-4 w-4 text-blue-600" />} description="Awaiting bilateral signatures" />
          </div>
        </>
      )}

      {activeTab === "keys" && (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Keys Handover & Check-In</h2>
              <p className="text-muted-foreground">Formal key issue notice, access cards, meter readings, inventory verification, and check-in inspection.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Ready For Keys" value={readyForKeys} icon={<KeyRound className="h-4 w-4 text-green-600" />} description="Fully signed & collected" />
            <Metric label="Key Notices Issued" value={(keyNotices || []).length} icon={<Clock className="h-4 w-4 text-blue-600" />} description="Handover notices sent" />
            <Metric label="Handover Completed" value={(handovers || []).length} icon={<Key className="h-4 w-4 text-emerald-600" />} description="Keys & access devices issued" />
            <Metric label="Inspections Verified" value={(inspections || []).filter(i => i?.type === "check_in").length} icon={<ClipboardCheck className="h-4 w-4 text-indigo-600" />} description="Condition checklists logged" />
          </div>
        </>
      )}

      {activeTab === "vouchers" && (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Leasing Vouchers & Receipts</h2>
              <p className="text-muted-foreground">Rent receipts, security deposit liabilities, PDC clearances, and settlement documents synced to Finance.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setBulkPdcOpen(true)} className="gap-2">
                <FileUp className="h-4 w-4 text-primary" /> Bulk PDCs
              </Button>
              <Button variant="outline" onClick={() => setBulkDepositOpen(true)} className="gap-2">
                <FileUp className="h-4 w-4 text-primary" /> Bulk Deposits
              </Button>
              <Button onClick={() => { setAddVoucherForm(f => ({ ...f, leaseId: (leases || [])[0]?.id || "" })); setAddVoucherOpen(true); }}>
                <Banknote className="mr-2 h-4 w-4" /> + Add Voucher
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Total Vouchers" value={(vouchers || []).length} icon={<Receipt className="h-4 w-4 text-blue-600" />} description="All leasing accounting records" />
            <Metric label="Posted Vouchers" value={(vouchers || []).filter(v => v?.status === "posted").length} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} description="Synced to General Ledger" />
            <Metric label="Draft / In-Process" value={(vouchers || []).filter(v => v?.status === "draft").length} icon={<Clock className="h-4 w-4 text-amber-600" />} description="Pending posting/review" />
            <Metric label="Total Value" value={formatMoney((vouchers || []).reduce((s, v) => s + (Number(v?.amount) || 0), 0))} icon={<Wallet className="h-4 w-4 text-indigo-600" />} description="Aggregate voucher amount" />
          </div>
        </>
      )}

      {activeTab === "renewals" && (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Lease Renewals & Expiry Tracking</h2>
              <p className="text-muted-foreground">Automatic 60-day lease expiry alerts, rent increase proposals, negotiations, and renewal notices.</p>
            </div>
            <Button onClick={() => setRenewalNoticeOpen(true)}>
              <CalendarClock className="mr-2 h-4 w-4" />
              Generate Renewal Notices
              {upcomingRenewals.length > 0 && (
                <span className="ml-2 rounded-full bg-white/20 px-1.5 py-0.5 text-xs font-bold">{upcomingRenewals.length}</span>
              )}
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Expiring in 60 Days" value={upcomingRenewals.length} icon={<CalendarClock className="h-4 w-4 text-rose-600" />} description="Upcoming lease expiries" />
            <Metric label="Renewal Confirmed" value={(renewals || []).filter(r => r?.status === "renewal_confirmed").length} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} description="Agreed to renew" />
            <Metric label="In Discussion / Awaiting" value={(renewals || []).filter(r => r?.status === "under_discussion" || r?.status === "awaiting_response").length} icon={<Clock className="h-4 w-4 text-amber-600" />} description="Active negotiation" />
            <Metric label="Non-Renewal Confirmed" value={(renewals || []).filter(r => r?.status === "non_renewal_confirmed").length} icon={<LogOut className="h-4 w-4 text-slate-600" />} description="Proceeding to checkout" />
          </div>
        </>
      )}

      {activeTab === "checkout" && (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Check-Out & Settlement</h2>
              <p className="text-muted-foreground">Move-out inspections, utility clearances, damage deductions, and security deposit settlements.</p>
            </div>
            <Button
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => {
                const activeLease = (leases || []).find(l => l?.status !== "checkout" && l?.status !== "closed") || (leases || [])[0];
                if (activeLease) {
                  setCheckoutWorkflowLease(activeLease);
                  setStartCheckoutForm({
                    noticeDate: today instanceof Date ? today.toISOString().split("T")[0] : "",
                    moveOutDate: today instanceof Date ? today.toISOString().split("T")[0] : "",
                    inspectionDate: today instanceof Date ? today.toISOString().split("T")[0] : "",
                    outstandingCharges: "Pending finance confirmation",
                    utilityClearanceRequirements: "Final utility clearance required before checkout closure",
                    keyReturnRequirements: "Return all keys, access cards, parking remotes and property items",
                    notes: "Tenant requested early vacating / checkout",
                    missingItems: "",
                    cleaningCharges: "0",
                    restorationCharges: "0",
                  });
                  setStartCheckoutOpen(true);
                } else {
                  alert("No active lease found to initiate vacate.");
                }
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> + Initiate Vacate / Check-Out
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Active Check-Outs" value={(settlements || []).filter(s => s?.approval !== "paid").length} icon={<LogOut className="h-4 w-4 text-amber-600" />} description="Move-outs in progress" />
            <Metric label="Open Settlements" value={openSettlements} icon={<Wallet className="h-4 w-4 text-red-600" />} description="Pending deposit refunds" />
            <Metric label="Completed / Settled" value={(settlements || []).filter(s => s?.approval === "paid").length} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} description="Fully settled & closed" />
            <Metric label="Check-Out Inspections" value={(inspections || []).filter(i => i?.type === "check_out").length} icon={<ClipboardCheck className="h-4 w-4 text-blue-600" />} description="Move-out audits filed" />
          </div>
        </>
      )}

      {activeTab === "audit" && (
        <>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">SRS Workflow & Audit Flow</h2>
              <p className="text-muted-foreground">Full immutable audit trail across reservation, KYC verification, contracts, keys, and settlements.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Audit Events Logged" value={(auditEvents || []).length} icon={<ShieldCheck className="h-4 w-4 text-indigo-600" />} description="Immutable system events" />
            <Metric label="Completed Actions" value={(auditEvents || []).filter(a => a?.status === "completed" || a?.status === "approved").length} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} description="Approved transitions" />
            <Metric label="Pending Approvals" value={(auditEvents || []).filter(a => a?.status === "pending" || a?.status === "in_review").length} icon={<Clock className="h-4 w-4 text-amber-600" />} description="Awaiting action" />
            <Metric label="Active Leases" value={(leases || []).filter(l => l?.status === "active").length} icon={<FileCheck className="h-4 w-4 text-blue-600" />} description="Governed portfolio units" />
          </div>
        </>
      )}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">

        <TabsContent value="reservations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unit Reservation - Lease Module</CardTitle>
              <CardDescription>Reserving a unit locks it from Available to Reserved until conversion, expiry or release.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={["Unit", "Tenant", "Valid Until", "Rent", "Status", "Actions"]}
                rows={(reservations || []).map((reservation) => [
                  reservation?.unit || "-",
                  reservation?.tenantName || "-",
                  <span className={reservation?.validUntil && isExpired(reservation.validUntil) && reservation.status === "reserved" ? "text-red-600" : ""}>{reservation?.validUntil || "-"}</span>,
                  formatMoney(reservation?.rent),
                  <StatusBadge key="status" value={reservation?.status} />,
                  <div key="actions" className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" disabled={reservation?.status !== "reserved"} onClick={() => openCreateLeaseDialog(reservation)}>Create Lease</Button>
                    <Button size="sm" variant="outline" disabled={reservation?.status !== "reserved"} onClick={() => openReleaseDialog(reservation)}>Release</Button>
                  </div>,
                ])}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Master With Duplicate Validation</CardTitle>
              <CardDescription>Duplicate checks run across Qatar ID, passport, CR number, mobile and email before activation.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={["Name", "Type", "Primary ID", "Contact", "Status", "Actions"]}
                rows={(customers || []).map((customer) => [
                  customer?.name || "-",
                  customer?.type || "individual",
                  customer?.qatarId || customer?.passport || customer?.crNumber || "-",
                  `${customer?.mobile || "-"} / ${customer?.email || "-"}`,
                  <StatusBadge key="status" value={customer?.status} />,
                  <div key="actions" className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      setViewCustomerData(customer as any);
                      setViewCustomerOpen(true);
                    }}>View</Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditCustomerData(customer as any);
                      setCustomerForm({
                        name: customer?.name || "",
                        type: customer?.type || "individual",
                        qatarId: customer?.qatarId || "",
                        passport: customer?.passport || "",
                        crNumber: customer?.crNumber || "",
                        nationality: (customer as any)?.nationality || "",
                        mobile: customer?.mobile || "",
                        email: customer?.email || "",
                        permanentAddress: (customer as any)?.permanentAddress || "",
                        localAddress: (customer as any)?.localAddress || "",
                        authorizedSignatory: (customer as any)?.authorizedSignatory || "",
                        emergencyContact: (customer as any)?.emergencyContact || "",
                        employerInfo: (customer as any)?.employerInfo || "",
                      });
                      setEditCustomerOpen(true);
                    }}>Edit</Button>
                  </div>,
                ])}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Document Verification & Approval</CardTitle>
              <CardDescription>Mandatory documents must be verified before the lease can move beyond document gates.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={["Customer", "Document", "Mandatory", "Expiry", "Status", "Reviewer", "Actions"]}
                rows={(documents || []).map((document) => {
                  const customer = (customers || []).find((item) => item?.id === document?.customerId);
                  return [
                    customer?.name || "-",
                    document?.name || "Document",
                    document?.mandatory ? "Yes" : "No",
                    document?.expiryDate || "-",
                    <div key="status" className="flex items-center gap-2">
                      <StatusBadge value={document?.status} />
                      {document?.file && <span className="text-xs text-muted-foreground">({document.file})</span>}
                    </div>,
                    document?.reviewer || "-",
                    <div key="actions" className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedDocId(document?.id); setUploadDocForm({ file: "", fileName: "", remarks: "" }); setUploadDocOpen(true); }}>Upload</Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedDocId(document?.id); setVerifyDocForm({ status: "verified", expiryDate: "", remarks: "" }); setVerifyDocOpen(true); }}>Verify</Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedDocId(document?.id); setVerifyDocForm({ status: "info_required", expiryDate: "", remarks: "" }); setVerifyDocOpen(true); }}>Need Info</Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedDocId(document?.id); setVerifyDocForm({ status: "rejected", expiryDate: "", remarks: "" }); setVerifyDocOpen(true); }}>Reject</Button>
                    </div>,
                  ];
                })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agreement">
          <Card>
            <CardHeader>
              <CardTitle>Lease Agreement Terms & Payment Schedule Rules</CardTitle>
              <CardDescription>Agreement data now includes payment frequency, PDC count, grace/penalty terms, maintenance, utilities, parking, special clauses and notice period.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={["Lease", "Rent / Frequency", "PDCs", "Grace / Penalty", "Responsibilities", "Facilities / Clauses", "Renewal Notice", "Actions"]}
                rows={(leases || []).map((lease) => [
                  `${lease?.tenantName || "Tenant"} / ${lease?.unit || "Unit"} (${lease?.property || "Property"})`,
                  `${formatMoney(lease?.monthlyRent)} / ${(lease?.paymentFrequency || "monthly").replace("_", " ")}`,
                  `${lease?.pdcCount || 12} cheques`,
                  `${lease?.gracePeriodDays || 7} days / ${lease?.penalties || "5%"}`,
                  `Maintenance: ${lease?.maintenanceResponsibility || "Landlord"}; Utilities: ${lease?.utilityResponsibility || "Tenant"}`,
                  `${lease?.parkingDetails || "Dedicated Parking"}; ${lease?.specialConditions || "Standard Tenancy"}`,
                  `${lease?.noticePeriodDays || 60} days`,
                  <div key="actions" className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (!lease?.id) return;
                        setSelectedLeaseForTerms(lease.id);
                        setAgreementTermsForm({
                          paymentFrequency: lease.paymentFrequency,
                          pdcCount: lease.pdcCount,
                          gracePeriodDays: lease.gracePeriodDays,
                          penalties: lease.penalties,
                          maintenanceResponsibility: lease.maintenanceResponsibility,
                          utilityResponsibility: lease.utilityResponsibility,
                          parkingDetails: lease.parkingDetails,
                          specialConditions: lease.specialConditions,
                          noticePeriodDays: lease.noticePeriodDays,
                        });
                        setEditTermsOpen(true);
                      }}
                    >
                      Edit Terms
                    </Button>
                  </div>
                ])}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="signatures">
          <Card>
            <CardHeader>
              <CardTitle>Lease Signature & Collection Workflow</CardTitle>
              <CardDescription>Actions are gated by document verification, collection receipt and landlord signature.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={["Lease", "Tenant", "Period", "Deposit", "Status", "Signature Package", "Actions"]}
                rows={(leases || []).map((lease) => {
                  return [
                    `${lease?.property || "Property"} / ${lease?.unit || "Unit"}`,
                    lease?.tenantName || "Tenant",
                    `${lease?.startDate || "-"} to ${lease?.endDate || "-"}`,
                    formatMoney(lease?.securityDeposit),
                    <StatusBadge key="status" value={lease?.status} />,
                    `Agreement: ${lease?.signedDocument || "-"}; shared: ${lease?.sharedWithTenant ? "Yes" : "No"}`,
                    <div key="actions" className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => downloadLeaseAgreement(lease)}><Download className="mr-2 h-4 w-4" />Download Agreement</Button>
                      <Button size="sm" variant="outline" onClick={() => { setSignatureWorkflowLease(lease); setUploadAgreementForm({ file: "", fileName: "", remarks: "" }); setUploadAgreementOpen(true); }}><Upload className="mr-2 h-4 w-4" />Upload Agreement</Button>
                      <Button size="sm" variant="outline" disabled={lease?.collectionCompleted} title={lease?.collectionCompleted ? "Collection already recorded — cannot re-collect" : undefined} onClick={() => {
                        setSignatureWorkflowLease(lease);
                        const count = lease?.pdcCount || 12;
                        const totalRent = (lease?.monthlyRent || 0) * count;
                        const regAmt = lease?.monthlyRent || 0;
                        function addMonthToDate(baseDateStr: string, monthOffset: number): string {
                          const d = new Date(baseDateStr);
                          if (isNaN(d.getTime())) return today.toISOString().split("T")[0];
                          const day = d.getDate();
                          const targetMonthRaw = d.getMonth() + monthOffset;
                          const targetYear = d.getFullYear() + Math.floor(targetMonthRaw / 12);
                          const targetMonth = ((targetMonthRaw % 12) + 12) % 12;
                          const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
                          const finalDay = Math.min(day, lastDay);
                          return `${targetYear}-${String(targetMonth + 1).padStart(2, "0")}-${String(finalDay).padStart(2, "0")}`;
                        }
                        const leaseStartStr = lease?.startDate || today.toISOString().split("T")[0];
                        const firstChequeStr = leaseStartStr;
                        const generated = Array.from({ length: count }, (_, i) => {
                          let amount = regAmt;
                          if (i === count - 1 && count > 1) {
                            amount = Math.max(0, totalRent - regAmt * (count - 1));
                          }
                          const tsDate = new Date(leaseStartStr);
                          tsDate.setMonth(tsDate.getMonth() + i);
                          const tenureStartStr = !isNaN(tsDate.getTime()) ? tsDate.toISOString().split("T")[0] : leaseStartStr;
                          const teDate = new Date(leaseStartStr);
                          teDate.setMonth(teDate.getMonth() + i + 1);
                          teDate.setDate(teDate.getDate() - 1);
                          const tenureEndStr = !isNaN(teDate.getTime()) ? teDate.toISOString().split("T")[0] : leaseStartStr;
                          const maturityStr = addMonthToDate(firstChequeStr, i);
                          return {
                            chequeNo: `PDC-${(lease?.unit || "Unit").replace(/\W/g, "")}-${String(i + 1).padStart(3, "0")}`,
                            bank: "QNB",
                            date: maturityStr,
                            amount,
                            period: `Cheque ${i + 1} of ${count}`,
                            tenureStart: tenureStartStr,
                            tenureEnd: tenureEndStr,
                            file: "",
                          };
                        });
                        setCollectForm({
                          paymentMode: "PDC",
                          chequeBank: "QNB",
                          payerName: lease?.tenantName || "Tenant",
                          depositAmount: String(lease?.securityDeposit || 0),
                          depositMode: "Cash",
                          depositChequeNo: "",
                          depositChequeBank: "",
                          utilityDeposit: "",
                          qatarCoolDeposit: "",
                          reservationDeposit: "",
                          serviceFeeDeposit: "",
                          guaranteeChequeDeposit: "",
                          guaranteeChequeNo: "",
                          guaranteeChequeBank: "QNB",
                          agencyCommission: "",
                          adminCharges: "",
                          cashierName: "",
                          notes: "",
                          receiptFile: "",
                          pdcCount: count,
                          startDate: lease?.startDate || "",
                          endDate: lease?.endDate || "",
                          firstChequeDate: lease?.startDate || "",
                          regularChequeAmount: String(lease?.monthlyRent || 0),
                          customCheques: generated,
                        });
                        setCollectOpen(true);
                      }}>{lease?.collectionCompleted ? <><Lock className="mr-1 h-3 w-3" />Collected</> : "Collect"}</Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!lease?.collectionCompleted}
                          title={!lease?.collectionCompleted ? "Receipt is generated once all PDCs and Security Deposits are collected" : undefined}
                          className={lease?.collectionCompleted ? "text-primary border-primary/50 gap-1" : "gap-1 opacity-50"}
                          onClick={() => {
                            if (!lease) return;
                            const leasePdcs = (pdcs || []).filter(p => p.leaseId === lease.id);
                            const leaseVouchers = (vouchers || []).filter(v => v.leaseId === lease.id);
                            const pdcTot = leasePdcs.reduce((s, p) => s + (p.amount || 0), 0) || ((lease.monthlyRent || 0) * (lease.pdcCount || 12));
                            const totalCol = pdcTot + (lease.securityDeposit || 0);
                            const rec: TenantReceiptDetails = {
                              receiptNo: `REC-${(lease.id || "").toUpperCase()}`,
                              acknowledgementNo: `ACK-${(lease.id || "").toUpperCase()}`,
                              date: lease.startDate || (today instanceof Date ? today.toISOString().split("T")[0] : ""),
                              tenantName: lease.tenantName || "Tenant",
                              tenantPhone: (lease as any).phone || "",
                              tenantEmail: (lease as any).email || "",
                              tenantQid: (lease as any).qatarId || "",
                              propertyName: lease.property || "",
                              unitRef: lease.unit || "",
                              leaseNo: `LES-${(lease.id || "").toUpperCase()}`,
                              leaseStartDate: lease.startDate || "",
                              leaseEndDate: lease.endDate || "",
                              monthlyRent: lease.monthlyRent || 0,
                              totalContractRent: pdcTot,
                              depositAmount: lease.securityDeposit || 0,
                              depositMode: "Cash / PDC",
                              pdcCount: leasePdcs.length || lease.pdcCount || 12,
                              pdcs: leasePdcs.length > 0 ? leasePdcs.map((p, idx) => ({
                                chequeNo: p.chequeNo || "",
                                bank: p.bank || "QNB",
                                date: p.date || "",
                                amount: p.amount || 0,
                                period: p.period || ((p as any).tenureStart && (p as any).tenureEnd ? `${(p as any).tenureStart} to ${(p as any).tenureEnd}` : `Cheque ${idx + 1}`),
                                tenureStart: (p as any).tenureStart || addDays(new Date(lease.startDate || today), idx * 30),
                                tenureEnd: (p as any).tenureEnd || addDays(new Date(lease.startDate || today), idx * 30 + 29),
                              })) : Array.from({ length: lease.pdcCount || 12 }, (_, i) => ({
                                chequeNo: `PDC-${(lease.unit || "").replace(/\W/g, "")}-${String(i + 1).padStart(3, "0")}`,
                                bank: "QNB",
                                date: addDays(new Date(lease.startDate || today), i * 30),
                                amount: i === (lease.pdcCount || 12) - 1 ? Math.max(0, pdcTot - (lease.monthlyRent || 0) * ((lease.pdcCount || 12) - 1)) : (lease.monthlyRent || 0),
                                period: `${addDays(new Date(lease.startDate || today), i * 30)} to ${addDays(new Date(lease.startDate || today), i * 30 + 29)}`,
                                tenureStart: addDays(new Date(lease.startDate || today), i * 30),
                                tenureEnd: addDays(new Date(lease.startDate || today), i * 30 + 29),
                              })),
                              vouchers: leaseVouchers.map(v => ({
                                receiptNo: v.receiptNo,
                                name: v.name,
                                amount: v.amount,
                                method: v.method,
                                debit: v.debit,
                                credit: v.credit,
                              })),
                              totalCollected: totalCol,
                              cashierName: "Finance Cashier",
                              notes: "Official receipt acknowledged for lease security deposit and rent PDC schedule.",
                            };
                            setReceiptModalData(rec);
                            setReceiptModalOpen(true);
                          }}>
                          <Receipt className="h-3.5 w-3.5" /> View Receipt
                        </Button>
                      </div>,
                    ];
                  })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Key Issue, Handover & Check-In</CardTitle>
                <CardDescription>No key issue is allowed unless collection is complete and the lease is fully signed.</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={["Lease", "Status", "Key Notice", "Handover", "Check-In", "Actions"]}
                  rows={(leases || []).map((lease) => {
                    const notice = (keyNotices || []).find((item) => item.leaseId === lease?.id);
                    const handover = (handovers || []).find((item) => item.leaseId === lease?.id);
                    const checkIn = (inspections || []).find((item) => item.leaseId === lease?.id && item.type === "check_in");
                    return [
                      `${lease?.tenantName || "Tenant"} / ${lease?.unit || "Unit"}`,
                      <StatusBadge key="status" value={lease?.status} />,
                      notice ? (
                        <div key="notice" className="flex flex-col gap-1">
                          <StatusBadge value={notice.status} />
                          {notice.handoverAt && <span className="text-xs text-muted-foreground">{notice.handoverAt} {notice.handoverTime || ""}</span>}
                        </div>
                      ) : "-",
                      handover ? (
                        <div key="handover" className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full px-2 py-0.5 w-fit">✅ Handed Over</span>
                          <span className="text-xs text-muted-foreground">{handover.keys || 0}× {handover.keyType || "keys"} · {handover.accessCards || 0} cards</span>
                          {handover.handoverAt && <span className="text-xs text-muted-foreground">{handover.handoverAt}</span>}
                        </div>
                      ) : "-",
                      checkIn ? (
                        <div key="checkin" className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full px-2 py-0.5 w-fit">🏠 Checked In</span>
                          <span className="text-xs text-muted-foreground">{checkIn.condition || "Good"} · {checkIn.photos || 0} photos</span>
                        </div>
                      ) : "-",
                      <div key="actions" className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setKeysWorkflowLease(lease); setKeyNotifyForm({ handoverAt: addDays(today, 1), handoverTime: "10:00", recipients: ["Tenant", "Property Manager", "Concerned Property Staff", "Security", "Maintenance"], authorizedCollector: lease?.tenantName || "", keysSummary: "2 metal keys, 2 access cards, 1 parking remote", staffContact: "Property Manager - +974 4400 2200", outstandingRequirements: "None", note: "" }); setKeyNotifyOpen(true); }}>Notify</Button>
                        {handover ? (
                          <Button size="sm" variant="outline" className="border-green-300 text-green-700 hover:bg-green-50" onClick={() => { setSelectedHandover(handover); setHandoverViewOpen(true); }}>View</Button>
                        ) : null}
                        <Button size="sm" variant="outline" onClick={() => {
                          setKeysWorkflowLease(lease);
                          setHandoverActiveTab("details");
                          setHandoverForm({
                            handoverAt: notice?.handoverAt || addDays(today, 1),
                            handoverTime: notice?.handoverTime || "10:00",
                            keys: "2",
                            keyType: "Metal door keys",
                            accessCards: "2",
                            parkingRemotes: "1",
                            parkingDeviceDetails: "Remote for covered parking bay",
                            electricityMeterReading: handover?.electricityMeterReading || "",
                            waterMeterReading: handover?.waterMeterReading || "",
                            issuedBy: "Property Manager",
                            collectorName: notice?.authorizedCollector || lease?.tenantName || "",
                            collectorIdNumber: "",
                            unitCondition: "Good",
                            cleanliness: "Clean",
                            acWorking: true,
                            plumbingOk: true,
                            electricalOk: true,
                            doorsWindowsOk: true,
                            idVerified: true,
                            photosTaken: "6",
                            handoverPhotos: "",
                            checklistDocument: "",
                            assetChecklist: "",
                            financeConfirmed: false,
                            propertyManagerConfirmed: true,
                            tenantConfirmed: false,
                            tenantAcknowledgement: "Tenant acknowledged receipt of keys and access items.",
                            note: "",
                          });
                          setCheckInForm({
                            condition: "Good",
                            furnitureCondition: "Good",
                            fixturesCondition: "Good",
                            wallFloorCeilingCondition: "Good",
                            acCondition: "Operational",
                            electricityMeter: handover?.electricityMeterReading || "",
                            waterMeter: handover?.waterMeterReading || "",
                            damages: "",
                            pendingMaintenance: "",
                            photos: "8",
                            note: "",
                          });
                          setHandoverOpen(true);
                        }}>Handover & Check-In</Button>
                      </div>,
                    ];
                  })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="renewals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lease Renewal Notification & Process</CardTitle>
                <CardDescription>The system detects leases within 60 days of expiry and tracks tenant response.</CardDescription>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={["Lease", "Expiry", "Recipients", "Proposed Terms", "Last Confirmation", "Obligations", "Status", "Actions"]}
                  rows={(renewals || []).map((renewal) => {
                    const lease = (leases || []).find((item) => item.id === renewal.leaseId);
                    return [
                      lease ? `${lease.tenantName} / ${lease.unit}` : "-",
                      lease?.endDate || "-",
                      renewal?.recipients || "-",
                      `${renewal?.proposedPeriod || ""}; ${formatMoney(renewal?.proposedRent)}; ${renewal?.revisedTerms || ""}`,
                      renewal?.lastConfirmationDate || "-",
                      renewal?.outstandingObligations || "-",
                      <StatusBadge key="status" value={renewal?.status} />,
                      <div key="actions" className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={renewal?.status === "renewal_confirmed" || renewal?.status === "non_renewal_confirmed"}
                          onClick={() => { setSelectedDiscussRenewal(renewal); setDiscussRenewalForm({ discussedRent: String(renewal?.proposedRent || 0), proposedPeriod: renewal?.proposedPeriod || "", tenantResponse: "pending", notes: "", nextFollowUpDate: renewal?.lastConfirmationDate || "" }); setDiscussRenewalOpen(true); }}
                        >Discuss</Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={renewal?.status === "renewal_confirmed" || renewal?.status === "non_renewal_confirmed"}
                          onClick={() => { setSelectedRenewal(renewal); setRenewalResponseForm({ response: "confirm", confirmedRent: String(renewal?.proposedRent || 0), notes: "", updateStatus: "awaiting_response" }); setRenewalResponseOpen(true); }}
                        >Renew</Button>
                        {lease && <Button
                          size="sm"
                          variant="outline"
                          disabled={renewal?.status === "renewal_confirmed" || renewal?.status === "non_renewal_confirmed"}
                          onClick={() => { setCheckoutWorkflowLease(lease); setStartCheckoutForm({ noticeDate: today instanceof Date ? today.toISOString().split("T")[0] : "", moveOutDate: lease.endDate || "", inspectionDate: addDays(new Date(lease.endDate || today), -3), outstandingCharges: "Pending finance confirmation", utilityClearanceRequirements: "Final utility clearance required before checkout closure", keyReturnRequirements: "Return all keys, access cards, parking remotes and property items", notes: "", missingItems: "", cleaningCharges: "0", restorationCharges: "0" }); setStartCheckoutOpen(true); setRenewals(items => (items || []).map(item => item.id === renewal.id ? { ...item, status: "non_renewal_confirmed" as typeof renewal.status } : item)); }}
                        >Non-Renew</Button>}
                      </div>,
                    ];
                  })}
                />
              </CardContent>
            </Card>
          </TabsContent>

        <TabsContent value="checkout" className="space-y-4">
          {/* Multi-Dimensional Filter Bar for Checkouts & Settlements */}
          <Card className="border-border">
            <CardHeader className="pb-3 pt-4 px-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold">Non-Renewal, Check-Out &amp; Security Deposit Settlement</CardTitle>
                  <CardDescription className="text-xs">Initiate tenant move-out/early vacating, complete inspections, verify clearances, and settle security deposits.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-muted-foreground gap-1"
                    onClick={() => {
                      setCheckoutPropertyFilter("all");
                      setCheckoutUnitFilter("all");
                      setCheckoutCustomerFilter("all");
                      setCheckoutStatusFilter("all");
                      setCheckoutSearchQuery("");
                    }}
                  >
                    <RotateCcw className="h-3 w-3" /> Reset Filters
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5 pt-2">
                <div>
                  <Select value={checkoutPropertyFilter} onValueChange={setCheckoutPropertyFilter}>
                    <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="All Properties" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {Array.from(new Set(leases.map(l => l.property).filter(Boolean))).map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={checkoutUnitFilter} onValueChange={setCheckoutUnitFilter}>
                    <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="All Units" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      {Array.from(new Set(leases.map(l => l.unit).filter(Boolean))).map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={checkoutCustomerFilter} onValueChange={setCheckoutCustomerFilter}>
                    <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="All Customers" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      {Array.from(new Set(leases.map(l => l.tenantName).filter(Boolean))).map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={checkoutStatusFilter} onValueChange={setCheckoutStatusFilter}>
                    <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="closed">Closed / Settled</SelectItem>
                      <SelectItem value="ready_for_settlement">Ready for Settlement</SelectItem>
                      <SelectItem value="inspection_done">Inspection Done</SelectItem>
                      <SelectItem value="planned">Planned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    className="h-8 text-xs pl-8 bg-background"
                    placeholder="Search lease, unit, tenant..."
                    value={checkoutSearchQuery}
                    onChange={(e) => setCheckoutSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Section 1: Move-Out Inspections & Key Clearances */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">1. Move-Out Inspections, Clearances &amp; Key Returns</CardTitle>
                <Badge variant="outline" className="text-[10px]">{checkouts.length} records</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4">
              <DataTable
                columns={["Lease", "Notice Date", "Move-Out / Inspection", "Clearances", "Comparison Summary", "Status", "Actions"]}
                rows={checkouts.filter(checkout => {
                  const lease = leases.find((item) => item.id === checkout.leaseId);
                  if (checkoutPropertyFilter !== "all" && lease?.property !== checkoutPropertyFilter) return false;
                  if (checkoutUnitFilter !== "all" && lease?.unit !== checkoutUnitFilter) return false;
                  if (checkoutCustomerFilter !== "all" && lease?.tenantName !== checkoutCustomerFilter) return false;
                  if (checkoutStatusFilter !== "all" && checkout.status !== checkoutStatusFilter) return false;
                  if (checkoutSearchQuery.trim()) {
                    const q = checkoutSearchQuery.toLowerCase();
                    const match = (lease?.tenantName || "").toLowerCase().includes(q) ||
                      (lease?.unit || "").toLowerCase().includes(q) ||
                      (lease?.property || "").toLowerCase().includes(q) ||
                      (checkout.leaseId || "").toLowerCase().includes(q);
                    if (!match) return false;
                  }
                  return true;
                }).map((checkout) => {
                  const lease = leases.find((item) => item.id === checkout.leaseId);
                  return [
                    lease ? `${lease.tenantName} (${lease.unit})` : checkout.leaseId,
                    checkout.noticeDate,
                    `${checkout.moveOutDate} / ${checkout.inspectionDate}`,
                    `Finance ${checkout.financeClearance ? "OK" : "Pending"}, Utility ${checkout.utilityClearance ? "OK" : "Pending"}, Keys ${checkout.keysReturned ? "Returned" : "Pending"}`,
                    checkout.comparisonSummary,
                    <StatusBadge key="status" value={checkout.status} />,
                    <Button key="action" size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setSelectedCheckout(checkout); setCompleteCheckoutForm({ condition: "Good", electricityMeter: "", waterMeter: "", damages: "", missingItems: "", cleaningCharges: "0", restorationCharges: "0", outstandingRent: "0", damagesAmount: "0", utilityCharges: "0", otherDeductions: "0", daysOccupiedInMonth: "30", totalDaysInMonth: "30", currentMonthPdcDeposited: false, unusedRentRefund: "0", photos: "0", checkoutPhotos: "", checkoutReportFile: "", handoverConditionSummary: "", finalConditionSummary: "", financeClearance: false, utilityClearance: false, keysReturned: false, unitDisposition: "Available" as any }); setCheckoutActiveTab("condition"); setCompleteCheckoutOpen(true); }} disabled={checkout.status === "ready_for_settlement" || checkout.status === "closed"}>Complete Inspection</Button>,
                  ];
                })}
              />
            </CardContent>
          </Card>

          {/* Section 2: Security Deposit Settlements & Financial Approvals */}
          <Card>
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">2. Security Deposit Settlements &amp; Financial Approvals</CardTitle>
                <Badge variant="outline" className="text-[10px]">{settlements.length} records</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-4">
              <DataTable
                columns={["Lease", "Deposit Received", "Total Deductions", "Refund Amount", "Approval Status", "Actions"]}
                rows={settlements.filter(settlement => {
                  const lease = leases.find((item) => item.id === settlement.leaseId);
                  if (checkoutPropertyFilter !== "all" && lease?.property !== checkoutPropertyFilter) return false;
                  if (checkoutUnitFilter !== "all" && lease?.unit !== checkoutUnitFilter) return false;
                  if (checkoutCustomerFilter !== "all" && lease?.tenantName !== checkoutCustomerFilter) return false;
                  if (checkoutStatusFilter !== "all" && settlement.approval !== checkoutStatusFilter) return false;
                  if (checkoutSearchQuery.trim()) {
                    const q = checkoutSearchQuery.toLowerCase();
                    const match = (lease?.tenantName || "").toLowerCase().includes(q) ||
                      (lease?.unit || "").toLowerCase().includes(q) ||
                      (lease?.property || "").toLowerCase().includes(q) ||
                      (settlement.leaseId || "").toLowerCase().includes(q);
                    if (!match) return false;
                  }
                  return true;
                }).map((settlement) => {
                  const lease = leases.find((item) => item.id === settlement.leaseId);
                  const deductions = settlement.outstandingRent + settlement.damages + settlement.utilityCharges
                    + (settlement.cleaningCharges || 0) + (settlement.restorationCharges || 0) + settlement.otherDeductions;
                  const refund = Math.max(0, settlement.depositReceived - deductions);
                  return [
                    lease ? `${lease.tenantName} (${lease.unit})` : settlement.leaseId,
                    formatMoney(settlement.depositReceived),
                    formatMoney(deductions),
                    formatMoney(refund),
                    <StatusBadge key="status" value={settlement.approval} />,
                    <Button key="action" size="sm" variant={settlement.approval === "paid" ? "secondary" : "default"} className="h-7 text-xs" disabled={settlement.approval === "paid"} onClick={() => openSettleRefundModal(settlement)}>
                      {settlement.approval === "paid" ? "Settled & Refunded" : "Settle & Refund"}
                    </Button>,
                  ];
                })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vouchers" className="space-y-4">
          <Card className="border-border">
            <CardHeader className="pb-3 pt-4 px-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold">Detailed Voucher Accounting</CardTitle>
                  <CardDescription className="text-xs">Named financial documents model rent receipts, deposits, PDC clearance, cheque returns, rental income, and settlements synced to Finance.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-muted-foreground gap-1"
                    onClick={() => {
                      setVoucherPropertyFilter("all");
                      setVoucherUnitFilter("all");
                      setVoucherCustomerFilter("all");
                      setVoucherMethodFilter("all");
                      setVoucherStatusFilter("all");
                      setVoucherSearchQuery("");
                    }}
                  >
                    <RotateCcw className="h-3 w-3" /> Reset Filters
                  </Button>
                </div>
              </div>

              {/* Multi-Dimensional Filter Bar for Vouchers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5 pt-2">
                <div>
                  <Select value={voucherPropertyFilter} onValueChange={setVoucherPropertyFilter}>
                    <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="All Properties" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                      {Array.from(new Set(leases.map(l => l.property).filter(Boolean))).map(p => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={voucherUnitFilter} onValueChange={setVoucherUnitFilter}>
                    <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="All Units" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      {Array.from(new Set(leases.map(l => l.unit).filter(Boolean))).map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={voucherCustomerFilter} onValueChange={setVoucherCustomerFilter}>
                    <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="All Customers" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      {Array.from(new Set(leases.map(l => l.tenantName).filter(Boolean))).map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={voucherMethodFilter} onValueChange={setVoucherMethodFilter}>
                    <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="All Methods" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="PDC">PDC</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Finance Engine">Finance Engine</SelectItem>
                      <SelectItem value="Deposit Offset">Deposit Offset</SelectItem>
                      <SelectItem value="Journal">Journal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={voucherStatusFilter} onValueChange={setVoucherStatusFilter}>
                    <SelectTrigger className="h-8 text-xs bg-background"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="posted">Posted</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="shared">Shared</SelectItem>
                      <SelectItem value="settled">Settled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="relative">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    className="h-8 text-xs pl-8 bg-background"
                    placeholder="Search vouchers..."
                    value={voucherSearchQuery}
                    onChange={(e) => setVoucherSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <DataTable
                columns={["Voucher / Receipt", "Lease", "Method / Period", "Debit", "Credit", "Amount", "Status", "Actions"]}
                rows={(vouchers || []).filter((voucher) => {
                  if (!voucher) return false;
                  const lease = leases?.find((item) => item.id === voucher.leaseId);
                  if (voucherPropertyFilter !== "all" && lease?.property !== voucherPropertyFilter) return false;
                  if (voucherUnitFilter !== "all" && lease?.unit !== voucherUnitFilter) return false;
                  if (voucherCustomerFilter !== "all" && lease?.tenantName !== voucherCustomerFilter) return false;
                  if (voucherMethodFilter !== "all" && !(voucher.method || "").toLowerCase().includes(voucherMethodFilter.toLowerCase()) && !(voucher.name || "").toLowerCase().includes(voucherMethodFilter.toLowerCase())) return false;
                  if (voucherStatusFilter !== "all" && (voucher.status || "").toLowerCase() !== voucherStatusFilter.toLowerCase()) return false;
                  if (voucherSearchQuery.trim()) {
                    const q = voucherSearchQuery.toLowerCase();
                    const match =
                      (voucher.name || "").toLowerCase().includes(q) ||
                      (voucher.receiptNo || "").toLowerCase().includes(q) ||
                      (voucher.debit || "").toLowerCase().includes(q) ||
                      (voucher.credit || "").toLowerCase().includes(q) ||
                      (lease?.tenantName || "").toLowerCase().includes(q) ||
                      (lease?.unit || "").toLowerCase().includes(q) ||
                      (lease?.property || "").toLowerCase().includes(q);
                    if (!match) return false;
                  }
                  return true;
                }).map((voucher) => {
                  const lease = leases?.find((item) => item.id === voucher.leaseId);
                  const vName = voucher.name || "Voucher";
                  return [
                    `${vName} / ${voucher.receiptNo || "-"}`,
                    lease ? `${lease.tenantName} / ${lease.unit}` : (voucher.leaseId || "-"),
                    `${voucher.method || "-"} / ${voucher.period || "-"}`,
                    voucher.debit || "-",
                    voucher.credit || "-",
                    formatMoney(Number(voucher.amount) || 0),
                    <StatusBadge key="status" value={voucher.status} />,
                    <div key="actions" className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => {
                        const isSecurity = vName.includes("Security Deposit") || vName.includes("Deposit");
                        const receiptData: TenantReceiptDetails = {
                          receiptNo: voucher.receiptNo || voucher.id || "REC",
                          acknowledgementNo: `ACK-${voucher.receiptNo || voucher.id || "001"}`,
                          date: today.toISOString().split("T")[0],
                          tenantName: lease?.tenantName || "Valued Tenant",
                          tenantPhone: "",
                          tenantEmail: "",
                          tenantQid: "",
                          propertyName: lease?.property || "Old Salata - Residence No:23",
                          unitRef: lease?.unit || "Unit",
                          leaseNo: lease ? `LES-${(lease.id || "").toUpperCase()}` : `LES-GEN`,
                          leaseStartDate: lease?.startDate || today.toISOString().split("T")[0],
                          leaseEndDate: lease?.endDate || today.toISOString().split("T")[0],
                          monthlyRent: lease?.monthlyRent || voucher.amount || 0,
                          totalContractRent: lease ? (Number(lease.monthlyRent) || 0) * (lease.pdcCount || 12) : (Number(voucher.amount) || 0),
                          depositAmount: isSecurity ? (Number(voucher.amount) || 0) : (lease?.securityDeposit || 0),
                          depositMode: voucher.method || "PDC",
                          pdcCount: voucher.method === "PDC" ? 1 : 0,
                          pdcs: voucher.method === "PDC" ? [{
                            chequeNo: voucher.receiptNo || "CHQ-001",
                            bank: "QNB",
                            date: today.toISOString().split("T")[0],
                            amount: Number(voucher.amount) || 0,
                            period: voucher.period || "Rent"
                          }] : [],
                          vouchers: [{
                            receiptNo: voucher.receiptNo || voucher.id || "REC",
                            name: vName,
                            amount: Number(voucher.amount) || 0,
                            method: voucher.method || "PDC",
                            debit: voucher.debit || "",
                            credit: voucher.credit || ""
                          }],
                          totalCollected: Number(voucher.amount) || 0,
                          cashierName: "Finance Department",
                          notes: `Official receipt for ${vName} (${voucher.method || "Voucher"}).`,
                        };
                        setReceiptModalData(receiptData);
                        setReceiptModalOpen(true);
                      }}>
                        <Printer className="h-3.5 w-3.5 mr-1" /> Receipt
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" disabled={voucher.status !== "draft"} onClick={() => {
                        toast.warning("Manual leasing vouchers cannot be posted from this screen. Use the applicable Finance workflow so GL/SL/Account is resolved by the Account Resolver and Posting Engine.");
                      }}>Post</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" disabled={voucher.status === "draft" || voucher.status === "shared"} onClick={() => setVouchers((items) => items.map((item) => item.id === voucher.id ? { ...item, status: "shared" } : item))}>Share</Button>
                    </div>,
                  ];
                })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>SRS Workflow & Audit History</CardTitle>
              <CardDescription>Each stage records responsible department, input, approval, system status and output for future reference and audit.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={["Date", "Stage", "Owner", "Input", "Approval", "Status", "Output"]}
                rows={auditEvents.map((event) => [
                  event.at,
                  event.stage,
                  event.owner,
                  event.input,
                  event.approval,
                  <StatusBadge key="status" value={event.status} />,
                  event.output,
                ])}
              />
            </CardContent>
          </Card>
        </TabsContent>

        
      </Tabs>

      {/* Official Tenant Receipt Modal */}
      <ReceiptModal
        open={receiptModalOpen}
        onOpenChange={setReceiptModalOpen}
        data={receiptModalData}
        secondaryData={receiptModalSecondaryData}
      />

      {/* Bulk Customer Import Modal */}
      <Dialog open={bulkCustomerOpen} onOpenChange={setBulkCustomerOpen}>
        <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto bg-card p-6">
          <ExcelImportEmbedded
            module="customer"
            title="Customer Master: Excel Bulk Import & Management"
            description="Production-grade Excel CREATE, UPDATE, and DELETE engine for individual tenants, corporate clients, and KYC data."
            onCompleted={() => {
              refetchData?.();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Bulk Lease Import Modal */}
      <Dialog open={bulkLeaseOpen} onOpenChange={setBulkLeaseOpen}>
        <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto bg-card p-6">
          <ExcelImportEmbedded
            module="lease"
            title="Lease Agreements: Excel Bulk Import & Management"
            description="Production-grade Excel CREATE, UPDATE, and DELETE engine for tenancy contracts, payment terms, and schedules."
            onCompleted={() => {
              refetchData?.();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Enhanced Bulk PDC Management Studio Modal */}
      <BulkPdcDepositModal
        open={bulkPdcOpen}
        onOpenChange={setBulkPdcOpen}
        type="PDC"
        existingLeases={leases}
        onSuccess={(items) => {
          const newPdcs: Pdc[] = items.map((item, idx) => ({
            id: `pdc-bulk-${Date.now()}-${idx}`,
            leaseId: leases.find(l => l.tenantName === item.tenantName || l.unit === item.unitName)?.id || leases[0]?.id || "L-1001",
            chequeNo: item.chequeNumber || `CHQ-${Math.floor(100000 + Math.random() * 900000)}`,
            bank: item.bank || "Doha Bank",
            date: item.maturityDate || today.toISOString().split("T")[0],
            amount: Number(item.amount) || 4700,
            payerName: item.tenantName || "Tenant",
            status: "received",
            period: `${item.rentFromDate} to ${item.rentToDate}`,
          }));
          setPdcs((prev) => [...newPdcs, ...prev]);
        }}
      />

      {/* Enhanced Bulk Security & Utility Deposit Management Studio Modal */}
      <BulkPdcDepositModal
        open={bulkDepositOpen}
        onOpenChange={setBulkDepositOpen}
        type="DEPOSIT"
        existingLeases={leases}
        onSuccess={(items) => {
          const newVouchers: Voucher[] = items.map((item, idx) => ({
            id: `v-dep-${Date.now()}-${idx}`,
            leaseId: leases.find(l => l.tenantName === item.tenantName || l.unit === item.unitName)?.id || leases[0]?.id || "L-1001",
            name: `Receipts Voucher - ${item.depositType || "Security Deposit"}`,
            receiptNo: item.receiptNumber || `RV-DEP-${Math.floor(1000 + Math.random() * 9000)}`,
            method: item.paymentMethod || "Bank Transfer",
            period: item.remarks || "Security Deposit Guarantee",
            debit: item.paymentMethod === "Cash" ? "Cash In Hand" : "Bank Operating Account",
            credit: "Security Deposit Liability (21500)",
            amount: Number(item.amount) || 4700,
            status: "posted",
          }));
          setVouchers((prev) => [...newVouchers, ...prev]);
        }}
      />
    </div>
  );
}

function Metric({ label, value, icon, description }: { label: string; value: number | string; icon: React.ReactNode; description?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium uppercase text-muted-foreground">{label}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold truncate">{value}</div>
        {description && <p className="text-[11px] text-muted-foreground mt-1 truncate">{description}</p>}
      </CardContent>
    </Card>
  );
}

function LifecycleRail() {
  return (
    <Card>
      <CardContent className="grid gap-2 p-4 md:grid-cols-5 lg:grid-cols-10">
        {leaseLifecycleSteps.map((step, index) => (
          <div key={step.code} className="rounded-md border bg-background p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
              {index < 4 ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <ClockIcon index={index} />}
            </div>
            <p className="text-sm font-medium">{step.label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{step.owner}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ClockIcon({ index }: { index: number }) {
  if (index < 7) return <CalendarClock className="h-4 w-4 text-amber-600" />;
  return <ClipboardCheck className="h-4 w-4 text-slate-500" />;
}

function MasterCard({ title, icon, items }: { title: string; icon: React.ReactNode; items: { label: string; value: string; description?: string }[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">{icon}{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((item) => (
          <div key={item.value} className="rounded-md border p-2">
            <div className="text-sm font-medium">{item.label}</div>
            {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function StatusBadge({ value }: { value?: string | null }) {
  const safeValue = String(value || "").trim();
  const normalized = safeValue ? safeValue.replace(/_/g, " ") : "Unknown";
  const valLower = safeValue.toLowerCase();
  const tone =
    valLower.includes("verified") || valLower.includes("active") || valLower.includes("sent") || valLower.includes("posted") || valLower.includes("paid")
      ? "border-green-200 bg-green-50 text-green-700"
      : valLower.includes("pending") || valLower.includes("awaiting") || valLower.includes("draft") || valLower.includes("reserved")
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : valLower.includes("rejected") || valLower.includes("blocked") || valLower.includes("duplicate") || valLower.includes("expired")
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-slate-50 text-slate-700";
  return <Badge variant="outline" className={`capitalize ${tone}`}>{normalized}</Badge>;
}

function DataTable({ columns, rows }: { columns: string[]; rows: React.ReactNode[][] }) {
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const totalPages = Math.ceil(rows.length / ITEMS_PER_PAGE);
  const paginatedRows = rows.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full min-w-[920px] text-sm">
          <thead className="border-b bg-muted/30">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3 text-left text-xs font-semibold uppercase text-muted-foreground last:text-right">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">No records yet.</td></tr>
            ) : paginatedRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="align-middle">
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 last:text-right">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }} className={page === 1 ? "pointer-events-none opacity-50" : ""} /></PaginationItem>
            {[...Array(totalPages)].map((_, i) => (<PaginationItem key={i}><PaginationLink href="#" onClick={(e) => { e.preventDefault(); setPage(i + 1); }} isActive={page === i + 1}>{i + 1}</PaginationLink></PaginationItem>))}
            <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }} className={page === totalPages ? "pointer-events-none opacity-50" : ""} /></PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}

export default LeasingPage;
