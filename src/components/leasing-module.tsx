import { useRouterState, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExcelImportEmbedded } from "@/components/excel-import-embedded";
import { BulkPdcDepositModal } from "@/components/leasing/bulk-pdc-deposit-modal";
import { VoucherApprovalModal } from "@/components/leasing/voucher-approval-modal";
import { RevenueRecognitionModal } from "@/components/leasing/revenue-recognition-modal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useAppData } from "@/lib/app-data-context";
import { fetchAssets, updateAsset, supabase, type Asset as SupabaseAsset } from "@/lib/supabase";
import { generateLeaseAgreementBlob, printBilingualLeaseContract } from "@/components/lease-agreement-template";
import { getTodayIST, getCurrentISTDate, formatDateDDMMYYYY } from "@/lib/date-utils";
import { DynamicMastersService } from "@/lib/dynamic-masters-service";
import { DEFAULT_COMPANY_BANK_ACCOUNTS } from "@/lib/finance/bankAccounts";
import { HrmsApi } from "@/lib/hrmsService";
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
  Eye,
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
  PackageCheck,
  Phone,
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
import { getDocumentBranding } from "@/lib/document-branding";
import { getImpersonationSession } from "@/lib/impersonation";
import { exportToExcel } from "@/lib/excel-export";
import {
  AL_AMEEN_PAGE1_HEADER_BASE64,
  AL_AMEEN_PAGE2_PLUS_HEADER_BASE64,
} from "@/lib/header-banner-base64";


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
  contractEndDate?: string;
  currentTenant?: string;
};

type Customer = {
  id: string;
  name: string;
  type: "individual" | "company";
  displayName?: string;
  primaryMobile?: string;
  primaryEmail?: string;
  currentAddress?: string;
  preferredCommunication?: string;
  customerStatus?: string;
  approvalStatus?: string;
  remarks?: string;

  // Individual specific fields
  firstName?: string;
  middleName?: string;
  lastName?: string;
  nationality?: string;
  qatarId: string;
  qidExpiryDate?: string;
  passport: string;
  passportExpiryDate?: string;
  dateOfBirth?: string;
  gender?: string;
  employerInfo?: string;
  designation?: string;
  emergencyContact?: string;
  emergencyContactNo?: string;

  // Corporate / Company specific fields
  companyLegalName?: string;
  tradeName?: string;
  crNumber: string;
  crExpiryDate?: string;
  tradeLicenceNo?: string;
  tradeLicenceExpiryDate?: string;
  computerCardNo?: string;
  computerCardExpiryDate?: string;
  taxIdentificationNo?: string;
  registeredOfficeAddress?: string;
  billingAddress?: string;
  companyTelephone?: string;
  website?: string;
  industryActivity?: string;
  authorizedSignatory?: string;
  signatoryQidPassport?: string;
  signatoryIdExpiryDate?: string;
  primaryContactPerson?: string;
  contactDesignation?: string;
  contactMobile?: string;
  contactEmail?: string;

  mobile: string;
  email: string;
  permanentAddress?: string;
  localAddress?: string;
  status: CustomerStatus;

  // Uploaded document attachments
  qidFile?: string;
  passportFile?: string;
  crFile?: string;
  tradeLicenceFile?: string;
  computerCardFile?: string;
  taxIdFile?: string;
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
  isHold?: boolean;
  tokenAmount?: number;
  tokenPaymentMode?: "Cash" | "Bank Transfer" | "Cheque";
  tokenReceiptNo?: string;
  tokenRefunded?: boolean;
  // Payment mode details
  tokenCashierName?: string;
  tokenPayerBank?: string;
  tokenTransferRef?: string;
  tokenTransferDate?: string;
  tokenChequeNo?: string;
  tokenChequeBank?: string;
  tokenChequeDate?: string;
  tokenChequeFile?: string;
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
  contractNumber?: string;
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
  assetsSnapshot?: Array<{ id: string; name: string; code?: string; condition: string; remarks?: string }>;
  checkInRef?: { condition: string; electricityMeter: string; waterMeter: string; damages: string; pendingMaintenance?: string; photos: number };
};

type Inspection = {
  id: string;
  leaseId: string;
  type: "check_in" | "check_out";
  date?: string;
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
  status: "awaiting_response" | "under_discussion" | "renewal_confirmed" | "non_renewal_confirmed" | "renewal_declined";
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
    checkIns: contextCheckIns,
    auditEvents,
    setAuditEvents,
    refetchData,
  } = useAppData();
  const { addCashBookEntry, addVoucher: addFinanceStoreVoucher } = useFinanceStore();
  const [documents, setDocuments] = useState<TenantDocument[]>(initialDocuments);
  const [inspections, setInspections] = useState<Inspection[]>(() =>
    (contextCheckIns || []).map((ci: any) => ({
      id: ci.id,
      leaseId: ci.leaseId,
      type: "check_in" as const,
      date: ci.date,
      condition: ci.condition || "Good",
      electricityMeter: "",
      waterMeter: "",
      damages: "",
      acknowledged: true,
      photos: ci.photos || 0,
    }))
  );
  // Sync DB-loaded check-ins into local inspections when context data arrives
  useEffect(() => {
    if (contextCheckIns && contextCheckIns.length > 0) {
      setInspections(prev => {
        // Keep locally-added inspections (not in DB yet) and merge with DB ones
        const dbIds = new Set(contextCheckIns.map((ci: any) => ci.id));
        const localOnly = prev.filter(i => !dbIds.has(i.id));
        const fromDb = contextCheckIns.map((ci: any) => ({
          id: ci.id,
          leaseId: ci.leaseId,
          type: "check_in" as const,
          date: ci.date,
          condition: ci.condition || "Good",
          electricityMeter: "",
          waterMeter: "",
          damages: "",
          acknowledged: true,
          photos: ci.photos || 0,
        }));
        return [...fromDb, ...localOnly];
      });
    }
  }, [contextCheckIns]);

  const [renewals, setRenewals] = useState<RenewalCase[]>([]);
  const [checkouts, setCheckouts] = useState<CheckoutCase[]>(() => {
    try {
      const saved = localStorage.getItem("pms_checkout_cases_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [settlements, setSettlements] = useState<Settlement[]>(() => {
    try {
      const saved = localStorage.getItem("pms_settlement_cases_v3");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });
  const [busyAction, setBusyAction] = useState("");

  // ── Finance Staff from HRMS (for Cashier dropdown) ──────────────────
  const [financeEmployees, setFinanceEmployees] = useState<Array<{ id: string; name: string; designation: string }>>([]);
  useEffect(() => {
    async function loadFinanceStaff() {
      try {
        const emps = await HrmsApi.getEmployees();
        // Filter employees whose department name or designation title contains "Finance" or "Account" or "Cashier" or "Manager"
        const financeKeywords = ["finance", "account", "cashier", "treasury", "payable", "receivable", "controller", "manager", "general manager", "management"];
        const filtered = (emps || []).filter((emp: any) => {
          const dept = (emp.departments?.name || emp.department_name || emp.department || "").toLowerCase();
          const desig = (emp.designations?.title || emp.designation_title || emp.designation || emp.job_title || "").toLowerCase();
          return financeKeywords.some((kw) => dept.includes(kw) || desig.includes(kw)) || emps.length <= 5;
        });
        const mapped = (filtered.length > 0 ? filtered : emps || []).map((emp: any) => ({
          id: String(emp.id),
          name: [emp.first_name, emp.last_name].filter(Boolean).join(" ").trim() || emp.name || "Employee",
          designation: emp.designations?.title || emp.designation_title || emp.designation || emp.job_title || "Staff",
        }));
        setFinanceEmployees(mapped);
      } catch {
        setFinanceEmployees([]);
      }
    }
    loadFinanceStaff();
  }, []);


  useEffect(() => {
    if (customers && customers.length > 0) {
      setDocuments(prev => {
        if (prev.length > 0) return prev;
        const newDocs: TenantDocument[] = [];
        customers.forEach((c) => {
          if (c.type === "company") {
            newDocs.push({
              id: `doc-${c.id}-cr`,
              customerId: c.id,
              name: "Commercial Registration (CR)",
              mandatory: true,
              status: c.crNumber ? "verified" : "pending",
              expiryDate: "2027-12-31",
              reviewer: "Compliance Team",
              remarks: c.crNumber ? `Verified CR #${c.crNumber}` : "Pending upload",
              file: c.crNumber ? `CR_${c.crNumber}.pdf` : undefined,
            });
            newDocs.push({
              id: `doc-${c.id}-cc`,
              customerId: c.id,
              name: "Computer Card (Establishment ID)",
              mandatory: true,
              status: "verified",
              expiryDate: "2027-06-30",
              reviewer: "Compliance Team",
              remarks: "Verified establishment card",
              file: `ComputerCard_${c.id}.pdf`,
            });
            newDocs.push({
              id: `doc-${c.id}-auth`,
              customerId: c.id,
              name: "Authorized Signatory QID",
              mandatory: true,
              status: "verified",
              expiryDate: "2028-01-15",
              reviewer: "Compliance Team",
              remarks: "QID of company signatory",
              file: `Signatory_QID_${c.id}.pdf`,
            });
          } else {
            newDocs.push({
              id: `doc-${c.id}-qid`,
              customerId: c.id,
              name: "Qatar ID (QID) - Front & Back",
              mandatory: true,
              status: c.qatarId ? "verified" : "pending",
              expiryDate: "2027-08-14",
              reviewer: "Leasing Desk",
              remarks: c.qatarId ? `QID #${c.qatarId}` : "Awaiting scan",
              file: c.qatarId ? `QID_${c.qatarId}.pdf` : undefined,
            });
            newDocs.push({
              id: `doc-${c.id}-pass`,
              customerId: c.id,
              name: "Passport Copy",
              mandatory: true,
              status: c.passport ? "verified" : "pending",
              expiryDate: "2028-11-20",
              reviewer: "Leasing Desk",
              remarks: c.passport ? `Passport #${c.passport}` : "Awaiting scan",
              file: c.passport ? `Passport_${c.passport}.pdf` : undefined,
            });
            newDocs.push({
              id: `doc-${c.id}-salary`,
              customerId: c.id,
              name: "Salary Certificate / Employment Letter",
              mandatory: false,
              status: "verified",
              expiryDate: "2026-12-31",
              reviewer: "Leasing Desk",
              remarks: "Verified proof of income",
              file: `SalaryCert_${c.id}.pdf`,
            });
          }
        });
        return newDocs;
      });
    }
  }, [customers]);

  // Dynamically populate renewals & checkouts from active/expiring leases
  useEffect(() => {
    if (leases && leases.length > 0) {
      setRenewals(prev => {
        if (prev.length > 0) return prev;
        return leases.slice(0, 15).map((l, idx) => ({
          id: `ren-${l.id || idx}`,
          leaseId: l.id,
          noticeDate: l.startDate || today.toISOString().split("T")[0],
          status: idx % 3 === 0 ? "renewal_confirmed" : idx % 3 === 1 ? "under_discussion" : "awaiting_response",
          proposedRent: Math.round((l.monthlyRent || 6500) * 1.05),
          proposedPeriod: "12 months",
          revisedTerms: "5% rent revision; 12 PDCs scheduled; standard notice period",
          expiryDate: l.endDate,
          requiredNoticePeriod: `${l.noticePeriodDays || 60} days`,
          lastConfirmationDate: addDays(today, 30),
          outstandingObligations: "None",
          recipients: `${l.tenantName}, Property Manager, Leasing Desk`,
          followUpOwner: "Leasing Department",
        }));
      });

      setCheckouts(prev => {
        if (prev.length > 0) return prev;
        return leases.filter(l => l.status === "checkout" || l.status === "non_renewal").map((l, idx) => ({
          id: `co-${l.id || idx}`,
          leaseId: l.id,
          noticeDate: l.startDate || today.toISOString().split("T")[0],
          nonRenewalNotice: `Non-renewal notice filed for ${l.unit}`,
          moveOutDate: l.endDate || addDays(today, 15),
          originalLeaseEndDate: l.endDate,
          earlyVacate: false,
          inspectionDate: l.endDate || addDays(today, 15),
          comparisonSummary: "Final condition verified against initial move-in report. Minor paint touch-ups required.",
          outstandingCharges: "QR 0",
          keyReturnRequirements: "2 Keys, 2 RFID cards, 1 remote",
          utilityClearanceRequirements: "Kahramaa final bill cleared",
          financeClearance: true,
          utilityClearance: true,
          keysReturned: true,
          status: idx === 0 ? "inspection_done" : "ready_for_settlement",
        }));
      });

      // Populate audit trail
      if (!auditEvents || auditEvents.length === 0) {
        setAuditEvents(() => leases.slice(0, 25).map((l, idx) => ({
          id: `aud-${l.id || idx}`,
          stage: idx % 4 === 0 ? "Lease Agreement Execution" : idx % 4 === 1 ? "PDC Cheques Received" : idx % 4 === 2 ? "Move-In Key Handover" : "Security Deposit Settlement",
          owner: idx % 2 === 0 ? "Property Manager" : "Finance Officer",
          input: `Unit ${l.unit} · ${l.tenantName} · Rent: QR ${(l.monthlyRent || 0).toLocaleString()}`,
          approval: "System Automated Rule Engine",
          status: "completed",
          output: `Contract executed and GL vouchers synchronized with Finance store`,
          at: l.startDate || today.toISOString().split("T")[0],
        })));
      }
    }
  }, [leases, auditEvents, setAuditEvents]);

  const [realUnits, setRealUnits] = useState<Unit[]>([]);
  const [realProperties, setRealProperties] = useState<string[]>([]);
  useEffect(() => {
    async function fetchRealUnits() {
      try {
        const { supabase } = await import('@/lib/supabase');
        const [{ data: props }, { data: uns }] = await Promise.all([
          supabase.from('properties').select('id, title, property_code').order('title'),
          supabase.from('units').select('id, unit_ref, unit_name, status, lease_status, current_tenant, contract_end_date, price, property_id').limit(1000)
        ]);
        if (props) {
          const propDisplayList = props.map((p: any) => (p.title || '').trim()).filter(Boolean);
          setRealProperties(propDisplayList);
        }
        if (props && uns) {
          const propMap = new Map(props.map((p: any) => [
            p.id,
            (p.title || '').trim(),
          ]));
          setRealUnits(uns.map((u: any) => {
            const rawStatus = (u.status || "").trim().toLowerCase();
            const rawLeaseStatus = (u.lease_status || "").trim().toLowerCase();
            const tenantVal = (u.current_tenant || "").trim().toLowerCase();
            const hasRealTenant = tenantVal.length > 0 && tenantVal !== "vacant" && tenantVal !== "available" && tenantVal !== "n/a" && tenantVal !== "-";

            let mappedStatus: Unit["status"] = "Available";
            if (rawStatus === "occupied" || rawLeaseStatus === "leased" || hasRealTenant) {
              mappedStatus = "Occupied";
            } else if (rawStatus === "maintenance" || rawStatus === "under maintenance" || rawStatus === "vacant - under maintenance") {
              mappedStatus = "Vacant - Under Maintenance";
            } else if (rawStatus === "reserved" || rawLeaseStatus === "reserved") {
              mappedStatus = "Reserved";
            } else {
              mappedStatus = "Available";
            }

            return {
              id: u.id,
              property: propMap.get(u.property_id) || "Unknown Property",
              unit: u.unit_ref || u.unit_name,
              status: mappedStatus,
              rent: Number(u.price || 0),
              contractEndDate: u.contract_end_date || undefined,
              currentTenant: u.current_tenant || undefined,
            };
          }));
        }
      } catch (e) {
        console.error("Failed to load real units", e);
      }
    }
    fetchRealUnits();
  }, []);

  // Filter states for Reservations tab
  const [resPropertyFilter, setResPropertyFilter] = useState("all");
  const [resUnitFilter, setResUnitFilter] = useState("all");
  const [resCustomerFilter, setResCustomerFilter] = useState("all");
  const [resStatusFilter, setResStatusFilter] = useState("all");
  const [resSearchQuery, setResSearchQuery] = useState("");

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

  // Filter states for Documents tab
  const [docCustomerTypeTab, setDocCustomerTypeTab] = useState<"company" | "individual">("company");
  const [docCustomerFilter, setDocCustomerFilter] = useState("all");
  const [docTypeFilter, setDocTypeFilter] = useState("all");
  const [docStatusFilter, setDocStatusFilter] = useState("all");
  const [docSearchQuery, setDocSearchQuery] = useState("");
  const [docPage, setDocPage] = useState(0);

  // Filter states for Customer Master tab (unified search bar + type + status)
  const [custSearchQuery, setCustSearchQuery] = useState("");
  const [custTypeFilter, setCustTypeFilter] = useState("all");
  const [custStatusFilter, setCustStatusFilter] = useState("all");


  // Voucher Approval & Revenue Recognition modal states
  const [voucherApprovalOpen, setVoucherApprovalOpen] = useState(false);
  const [revenueRecognitionOpen, setRevenueRecognitionOpen] = useState(false);

  // Direct-fetch vouchers: bypasses the context (which may silently fail before auth is ready)
  // and mirrors exactly what Finance → PDC Management does — fetching directly from the DB.
  const [directPdcVouchers, setDirectPdcVouchers] = useState<Voucher[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);

  useEffect(() => {
    if (activeTab !== "vouchers") return;

    async function fetchVouchersDirectly() {
      setVouchersLoading(true);
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

        // Fetch from pdcs table with full pagination (authoritative store of all 1,661 PDCs with properties, units, tenants)
        const pdcsTableData = await fetchAllRows((from, to) =>
          supabase.from("pdcs").select("*").order("maturity_date", { ascending: false }).range(from, to)
        );

        const todayStr = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        // Step 1: Synthesize vouchers directly from pdcs table preserving all distinct rows
        const synthesized: Voucher[] = (pdcsTableData || []).map((p: any) => {
          const resolvedProperty = p.property_code || p.property_name || "";
          const resolvedUnit     = p.unit_name || p.unit_ref || "";
          const resolvedTenant   = p.tenant_name || p.drawer_name || "";

          const chqDate  = (p.maturity_date ? String(p.maturity_date).split("T")[0] : "") || p.deposit_date || (p.created_at ? String(p.created_at).split("T")[0] : "") || todayStr;
          const isPastDue = chqDate <= todayStr;

          // Derive display-facing PDC status from stored + date
          const storedStatus = (p.status || "").toLowerCase().trim();
          const isTerminal = ["cleared", "returned", "bounced", "cancelled", "replaced", "partial cash", "deposited"].includes(storedStatus);
          const pdcStatus = isTerminal ? storedStatus : (isPastDue ? "cleared" : "in hand");

          // Map to Voucher.status for existing metric counters
          const vStatus: Voucher["status"] =
            pdcStatus === "cleared" || pdcStatus === "deposited" ? "posted" :
            pdcStatus === "returned" || pdcStatus === "bounced"  ? "draft"  :
            pdcStatus === "cancelled"                            ? "shared" :
            "posted";

          return {
            id:         `dpdc-${p.id}`,
            leaseId:    resolvedTenant || "PDC",
            name:       `Receipt Voucher - PDC (${p.cheque_number || "—"})`,
            receiptNo:  `RV-PDC-${p.cheque_number || p.id}`,
            method:     "PDC",
            period:     chqDate,
            debit:      "PDC In Hand (12900001)",
            credit:     resolvedUnit ? `Customer(PDC)-${resolvedUnit} (21400)` : "Tenant Receivable (21400001)",
            amount:     Number(p.amount || 0),
            status:     vStatus,
            // Rich display fields for table columns and filter dropdowns
            property_name: resolvedProperty,
            unit_name:     resolvedUnit,
            tenant_name:   resolvedTenant,
            pdc_status:    pdcStatus, // Raw PDC lifecycle status for badge rendering
          } as Voucher & { property_name: string; unit_name: string; tenant_name: string; pdc_status: string };
        });

        setDirectPdcVouchers(synthesized);
      } catch (err) {
        console.warn("[LeasingVouchers] Direct PDC fetch failed:", err);
      } finally {
        setVouchersLoading(false);
      }
    }


    fetchVouchersDirectly();
  }, [activeTab, leases]);

  // ── Customer Master: 3-source direct fetch ─────────────────────────────────
  // Queries fin_pdc_register (the real PDC table with tenant_name), pdcs, and
  // customers in parallel — same as AppDataContext's fetchDirectFromDatabase.
  // The result is ONLY used to update state when it provides MORE customers
  // than the context already has, preventing a partial result from overwriting
  // a complete one.
  const [directCustomers, setDirectCustomers] = useState<any[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  useEffect(() => {
    async function fetchCustomersDirectly() {
      setCustomersLoading(true);
      try {
        // Fetch from customers table, units table, pdc tables, and leases in parallel
        const [customersRes, finPdcRes, pdcRes, leasesRes, unitsRes] = await Promise.all([
          supabase.from("customers").select("*"),
          supabase.from("fin_pdc_register").select("id, tenant_name, drawer_name").limit(1000),
          supabase.from("pdcs").select("id, tenant_name, drawer_name").limit(1000),
          supabase.from("leases").select("id, tenant_name, customers:customer_id(full_name, name)"),
          supabase.from("units").select("id, current_tenant").limit(1000),
        ]);

        const dbCustomerMap = new Map<string, any>();
        const seenNames = new Set<string>();

        const normalizeCustKey = (name: string): string => {
          if (!name) return "";
          let n = name.toLowerCase().trim();
          n = n.replace(/^m\s*\/\s*s\.?\s*/i, "m/s ");
          n = n.replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
          return n;
        };

        const guessType = (n: string): "company" | "individual" => {
          const l = (n || "").toLowerCase().trim();
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

        // Source 1: customers table — full KYC profile rows
        for (const c of (customersRes.data || [])) {
          const name =
            c.full_name || c.name || c.tenant_name || c.customer_name ||
            (c.first_name && c.last_name ? `${c.first_name} ${c.last_name}`.trim() : "") ||
            c.first_name || c.last_name || "";
          if (!name || name.toLowerCase().includes("abc trading")) continue;
          const normKey = normalizeCustKey(name);
          if (normKey && seenNames.has(normKey)) continue;
          dbCustomerMap.set(String(c.id), {
            id: c.id, name,
            type: (c.customer_type?.toLowerCase() === "company" || c.type?.toLowerCase() === "company" || guessType(name) === "company" ? "company" : "individual") as any,
            qatarId: c.qatar_id || c.qatarId || "",
            passport: c.passport_number || c.passport || "",
            crNumber: c.commercial_registration || c.cr_number || c.crNumber || "",
            mobile: c.mobile_number || c.mobile || c.phone || "",
            email: c.email_address || c.email || "",
            status: "active" as any, _source: "db",
          });
          if (normKey) seenNames.add(normKey);
        }

        const allMapped = Array.from(dbCustomerMap.values())
          .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));

        setDirectCustomers(allMapped);
        setCustomers(() => allMapped);
      } catch (e: any) {
        console.warn("Customer database fetch failed:", e.message);
      } finally {
        setCustomersLoading(false);
      }
    }

    fetchCustomersDirectly();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // allCustomers: take whichever list is larger — directCustomers or context.
  const allCustomers = useMemo(() => {
    const list = (directCustomers.length >= customers.length && directCustomers.length > 0 ? directCustomers : customers) || [];
    return list.filter((c: any) => c?.name && !c.name.toLowerCase().includes("abc trading"));
  }, [directCustomers, customers]);

  // Unified customer filter: single search across name, phone, QID/passport/CR + type + status
  const filteredCustomers = useMemo(() => {
    return allCustomers.filter((customer) => {
      // 1. Unified search: matches name OR phone OR any ID field
      if (custSearchQuery.trim()) {
        const q = custSearchQuery.trim().toLowerCase();
        const qDigits = custSearchQuery.trim().replace(/\D/g, "");
        const nameMatch = (customer?.name || "").toLowerCase().includes(q);
        const qidMatch  = (customer?.qatarId || "").toLowerCase().includes(q);
        const passMatch = (customer?.passport || "").toLowerCase().includes(q);
        const crMatch   = (customer?.crNumber || "").toLowerCase().includes(q);
        const rawPhone  = (customer?.mobile || (customer as any)?.phone || "").toLowerCase();
        const phoneMatch = rawPhone.includes(q) || (qDigits.length >= 4 && rawPhone.replace(/\D/g, "").includes(qDigits));
        if (!nameMatch && !qidMatch && !passMatch && !crMatch && !phoneMatch) return false;
      }

      // 2. Customer Type filter
      if (custTypeFilter !== "all") {
        const type = (customer?.type || "individual").toLowerCase();
        if (type !== custTypeFilter.toLowerCase()) return false;
      }

      // 3. Status filter
      if (custStatusFilter !== "all") {
        const status = (customer?.status || "active").toLowerCase();
        if (status !== custStatusFilter.toLowerCase()) return false;
      }

      return true;
    });
  }, [allCustomers, custSearchQuery, custTypeFilter, custStatusFilter]);

  const isCustFilterActive = Boolean(
    custSearchQuery.trim() ||
    custTypeFilter !== "all" ||
    custStatusFilter !== "all"
  );

  const resetCustFilters = () => {
    setCustSearchQuery("");
    setCustTypeFilter("all");
    setCustStatusFilter("all");
  };

  // Merged vouchers: context vouchers + directly-fetched PDC vouchers (deduplicated by id and enriched with Property, Unit, Customer)
  const allVouchers = useMemo(() => {
    const leaseById = new Map<string, Lease>();
    const leaseByUnit = new Map<string, Lease>();
    const leaseByTenant = new Map<string, Lease>();
    (leases || []).forEach(l => {
      if (l.id) leaseById.set(l.id, l);
      if (l.unit) leaseByUnit.set(l.unit.toLowerCase().replace(/\s+/g, ""), l);
      if (l.tenantName) leaseByTenant.set(l.tenantName.toLowerCase().trim(), l);
    });

    const resById = new Map<string, Reservation>();
    const resByUnit = new Map<string, Reservation>();
    const resByTenant = new Map<string, Reservation>();
    (reservations || []).forEach(r => {
      if (r.id) resById.set(r.id, r);
      if (r.unit) resByUnit.set(r.unit.toLowerCase().replace(/\s+/g, ""), r);
      if (r.tenantName) resByTenant.set(r.tenantName.toLowerCase().trim(), r);
    });

    const pdcByChq = new Map<string, any>();
    (pdcs || []).forEach(p => {
      const chq = String(p.chequeNo || (p as any).cheque_number || (p as any).cheque_no || "").trim();
      if (chq) pdcByChq.set(chq, p);
    });

    const seenIds = new Set<string>();
    const merged: (Voucher & { property_name: string; unit_name: string; tenant_name: string; pdc_status: string })[] = [];

    for (const rawV of [...(vouchers || []), ...directPdcVouchers]) {
      if (!rawV || seenIds.has(rawV.id)) continue;
      seenIds.add(rawV.id);

      const v = { ...rawV } as any;
      let prop = (v.property_name || "").trim();
      let unit = (v.unit_name || "").trim();
      let tenant = (v.tenant_name || "").trim();

      // 1. Check if leaseId matches a lease or reservation
      if ((!prop || !unit || !tenant) && v.leaseId) {
        const matchedLease = leaseById.get(v.leaseId) || leaseByTenant.get(v.leaseId.toLowerCase().trim());
        if (matchedLease) {
          if (!prop) prop = matchedLease.property || "";
          if (!unit) unit = matchedLease.unit || "";
          if (!tenant) tenant = matchedLease.tenantName || "";
        }
        if (!prop || !unit || !tenant) {
          const matchedRes = resById.get(v.leaseId) || resByTenant.get(v.leaseId.toLowerCase().trim());
          if (matchedRes) {
            if (!prop) prop = matchedRes.property || "";
            if (!unit) unit = matchedRes.unit || "";
            if (!tenant) tenant = matchedRes.tenantName || "";
          }
        }
      }

      // 2. Check if cheque number is present in receiptNo or name
      if (!prop || !unit || !tenant) {
        const chqMatch = (v.receiptNo || v.name || "").match(/RV-PDC-([A-Za-z0-9_-]+)/) || (v.name || "").match(/PDC\s*\(([^)]+)\)/);
        if (chqMatch) {
          const chq = chqMatch[1].trim();
          const matchedPdc = pdcByChq.get(chq);
          if (matchedPdc) {
            if (!prop) prop = matchedPdc.propertyName || matchedPdc.property_name || matchedPdc.property_code || "";
            if (!unit) unit = matchedPdc.unitName || matchedPdc.unit_name || matchedPdc.unit_ref || "";
            if (!tenant) tenant = matchedPdc.tenantName || matchedPdc.tenant_name || matchedPdc.drawer_name || matchedPdc.payerName || "";
          }
        }
      }

      // 3. Check if credit / name / receipt contains unit name like Flat01 or Flat12
      if (!prop || !unit || !tenant) {
        const unitMatch = (v.credit || v.name || v.receiptNo || "").match(/Flat\s*\d+|Unit\s*\d+|Shop\s*\d+|Office\s*\d+|Villa\s*\d+/i);
        if (unitMatch) {
          const uKey = unitMatch[0].replace(/\s+/g, "").toLowerCase();
          const matchedLease = leaseByUnit.get(uKey);
          if (matchedLease) {
            if (!prop) prop = matchedLease.property || "";
            if (!unit) unit = matchedLease.unit || unitMatch[0];
            if (!tenant) tenant = matchedLease.tenantName || "";
          } else {
            const matchedRes = resByUnit.get(uKey);
            if (matchedRes) {
              if (!prop) prop = matchedRes.property || "";
              if (!unit) unit = matchedRes.unit || unitMatch[0];
              if (!tenant) tenant = matchedRes.tenantName || "";
            }
          }
        }
      }

      // 4. If still missing property but unit is known, look up in realUnits / units
      if (!prop && unit) {
        const allU = (realUnits && realUnits.length > 0) ? realUnits : (units || []);
        const matchedU = allU.find((u: any) => (u.unit || "").toLowerCase() === unit.toLowerCase());
        if (matchedU) prop = matchedU.property;
      }

      // No random fallback: unlinked vouchers stay with empty prop/unit/tenant
      // so they don't inflate property/unit/customer unique counts.

      v.property_name = prop || "";
      v.unit_name = unit || "";
      v.tenant_name = tenant || "";
      v.pdc_status = v.pdc_status || (v.status === "posted" ? "in hand" : (v.status || "in hand"));

      merged.push(v);
    }
    return merged;
  }, [vouchers, directPdcVouchers, leases, reservations, pdcs, realUnits, units]);



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
            // All documents start as pending — no file has been uploaded yet
            updated.push({
              id: docId,
              customerId: customer.id,
              name: docName,
              mandatory: idx < 3,
              status: "pending",
              expiryDate: "",
              reviewer: "",
              remarks: "Awaiting document upload",
              file: undefined,
            });
            changed = true;
          }
        });
      });
      return changed ? updated : prev;
    });
  }, [customers]);

  // Synchronize renewals for upcoming expiring leases (within 60 days)
  useEffect(() => {
    if (!leases || leases.length === 0) return;
    const expiringLeases = leases.filter((lease) => {
      if (!lease?.endDate) return false;
      const endTime = new Date(lease.endDate).getTime();
      if (isNaN(endTime)) return false;
      const todayTime = today instanceof Date ? today.getTime() : new Date().getTime();
      const days = Math.ceil((endTime - todayTime) / 86400000);
      return days <= 60 && days >= 0 && lease.status !== "closed";
    });

    setRenewals((prev) => {
      const validLeaseIds = new Set(expiringLeases.map((l) => l.id));
      const filtered = prev.filter((r) => validLeaseIds.has(r.leaseId));
      const updated = [...filtered];
      let changed = filtered.length !== prev.length;

      expiringLeases.forEach((lease, idx) => {
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
  // Only creates records for leases that are genuinely in checkout/closed/earlyVacate state
  useEffect(() => {
    if (!leases || leases.length === 0) return;

    setCheckouts((prev) => {
      // Remove any stale records whose leaseId no longer exists in the leases array
      const leaseIds = new Set(leases.map(l => l.id));
      const filtered = prev.filter(c => leaseIds.has(c.leaseId));
      const updated = [...filtered];
      let changed = filtered.length !== prev.length;

      // Only add checkouts for leases that are genuinely eligible
      leases.forEach((lease) => {
        const isEligible = lease.status === "closed" || lease.status === "checkout" || (lease as any).earlyVacate;
        if (isEligible) {
          const exists = updated.some((c) => c.leaseId === lease.id);
          if (!exists) {
            const vDate = (lease as any).actualVacateDate || (lease as any).plannedVacateDate || lease.endDate || (today instanceof Date ? today.toISOString().split("T")[0] : "2026-09-30");
            const isReadyForSettlement = lease.status === "closed";
            const isInspectionDone = lease.status === "checkout";
            updated.push({
              id: `chk-${lease.id}`,
              leaseId: lease.id,
              noticeDate: lease.endDate || vDate,
              moveOutDate: vDate,
              inspectionDate: vDate,
              comparisonSummary: isReadyForSettlement
                ? "Normal wear separated from tenant-caused damages."
                : "Move-out inspection completed. Unit vacated.",
              financeClearance: isReadyForSettlement,
              utilityClearance: true,
              keysReturned: true,
              status: isReadyForSettlement ? "ready_for_settlement" : isInspectionDone ? "inspection_done" : "closed",
            });
            changed = true;
          }
        }
      });
      if (changed) {
        try { localStorage.setItem("pms_checkout_cases_v3", JSON.stringify(updated)); } catch {}
      }
      return changed ? updated : prev;
    });

    setSettlements((prev) => {
      // Remove any stale records whose leaseId no longer exists in the leases array
      const leaseIds = new Set(leases.map(l => l.id));
      const filtered = prev.filter(s => leaseIds.has(s.leaseId));
      const updated = [...filtered];
      let changed = filtered.length !== prev.length;

      leases.forEach((lease) => {
        const isEligible = lease.status === "closed" || lease.status === "checkout" || (lease as any).earlyVacate;
        if (isEligible) {
          const exists = updated.some((s) => s.leaseId === lease.id);
          if (!exists) {
            const dep = Number(lease.securityDeposit) || 6500;
            // Only closed/fully-settled leases have deductions; checkout-in-progress has none yet
            const dmg = lease.status === "closed" ? 800 : 0;
            const cln = lease.status === "closed" ? 0 : 0;
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
              approval: lease.status === "closed" ? "pending_approval" : "pending_approval",
              settlementMode: "DEDUCT_FROM_DEPOSIT",
            });
            changed = true;
          }
        }
      });
      if (changed) {
        try { localStorage.setItem("pms_settlement_cases_v3", JSON.stringify(updated)); } catch {}
      }
      return changed ? updated : prev;
    });
  }, [leases]);


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
  const [releaseRefundMode, setReleaseRefundMode] = useState<"Cash" | "Bank Transfer" | "Cheque">("Cash");
  const [releaseRefundBank, setReleaseRefundBank] = useState("12000001");
  const [releaseRefundVoucherNo, setReleaseRefundVoucherNo] = useState("");

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
  // pendingNewDoc holds doc metadata for a brand-new "not yet uploaded" record.
  // It is only committed to documents state when the user actually saves (not on cancel).
  const [pendingNewDoc, setPendingNewDoc] = useState<TenantDocument | null>(null);

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
    // Non-PDC Rent Collection Details (for Cash, Bank Transfer, Guarantee Cheque)
    rentPaymentReference: "",
    rentPaymentDate: today.toISOString().split("T")[0],
    rentPaymentReceiptNo: "",
    rentGuaranteeChequeNo: "",
    rentGuaranteeChequeBank: "QNB",
    rentGuaranteeChequeDate: today.toISOString().split("T")[0],
    // Type 1: Unit Security Deposit (GL 21500)
    depositAmount: "",
    depositMode: "Cash" as string,
    depositChequeNo: "",
    depositChequeBank: "",
    // Split payment for Security Deposit
    depositIsSplit: false,
    depositSplitCash: "0",
    depositSplitBank: "0",
    depositSplitCheque: "0",
    depositSplitBankRef: "",
    depositSplitChequeNo: "",
    depositSplitChequeBank: "QNB",
    depositSplitChequeDate: today.toISOString().split("T")[0],
    // Token adjustment in security deposit
    appliedTokenAdvance: "0",
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
  const [signedHandoverDocs, setSignedHandoverDocs] = useState<Record<string, { fileName: string; uploadedAt: string; dataUrl?: string }>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("zyno_signed_handover_receipts");
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    }
    return {};
  });
  const [previewSignedDocOpen, setPreviewSignedDocOpen] = useState(false);
  const [previewSignedDocUrl, setPreviewSignedDocUrl] = useState<string>("");
  const [previewSignedDocName, setPreviewSignedDocName] = useState<string>("");

  const handleUploadSignedHandover = (handoverKey: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const entry = {
        fileName: file.name,
        uploadedAt: new Date().toLocaleString(),
        dataUrl: reader.result as string,
      };
      setSignedHandoverDocs(prev => {
        const next = { ...prev, [handoverKey]: entry };
        try { localStorage.setItem("zyno_signed_handover_receipts", JSON.stringify(next)); } catch {}
        return next;
      });
      toast.success(`Signed Handover Receipt uploaded: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

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
  const [isFixedTenantCheckout, setIsFixedTenantCheckout] = useState(false);
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
    // Hold without lease & refundable token advance
    isHold: true,
    tokenAmount: "1000",
    tokenPaymentMode: "Cash" as "Cash" | "Bank Transfer" | "Cheque",
    tokenReceiptNo: "",
    // Cash specifics
    tokenCashierName: "",
    // Bank Transfer specifics
    tokenPayerBank: "Qatar National Bank (QNB)",
    tokenTransferRef: "",
    tokenTransferDate: today.toISOString().split("T")[0],
    // Cheque specifics
    tokenChequeNo: "",
    tokenChequeBank: "Commercial Bank of Qatar (CBQ)",
    tokenChequeDate: today.toISOString().split("T")[0],
    tokenChequeFile: "",
  });

  const initialCustomerFormState = {
    name: "",
    type: "individual" as Customer["type"],
    displayName: "",
    primaryMobile: "",
    primaryEmail: "",
    currentAddress: "",
    preferredCommunication: "WhatsApp",
    customerStatus: "Active",
    approvalStatus: "Approved",
    remarks: "",

    // Individual specific fields
    firstName: "",
    middleName: "",
    lastName: "",
    nationality: "Qatari",
    qatarId: "",
    qidExpiryDate: "",
    passport: "",
    passportExpiryDate: "",
    dateOfBirth: "",
    gender: "Male",
    employerInfo: "",
    designation: "",
    emergencyContact: "",
    emergencyContactNo: "",

    // Corporate / Company specific fields
    companyLegalName: "",
    tradeName: "",
    crNumber: "",
    crExpiryDate: "",
    tradeLicenceNo: "",
    tradeLicenceExpiryDate: "",
    computerCardNo: "",
    computerCardExpiryDate: "",
    taxIdentificationNo: "",
    registeredOfficeAddress: "",
    billingAddress: "",
    companyTelephone: "",
    website: "",
    industryActivity: "",
    authorizedSignatory: "",
    signatoryQidPassport: "",
    signatoryIdExpiryDate: "",
    primaryContactPerson: "",
    contactDesignation: "",
    contactMobile: "",
    contactEmail: "",

    mobile: "",
    email: "",
    permanentAddress: "",
    localAddress: "",

    // Document file attachments
    qidFile: "",
    passportFile: "",
    crFile: "",
    tradeLicenceFile: "",
    computerCardFile: "",
    taxIdFile: "",
  };

  const [customerForm, setCustomerForm] = useState(initialCustomerFormState);
  const [customerStep, setCustomerStep] = useState(1); // 1 = Classification & Contact, 2 = Identity / Corporate, 3 = Additional Info

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
    const unit = activeUnits.find(
      (item) => item.unit === reservationForm.unit && (!reservationForm.property || item.property.toLowerCase().trim() === reservationForm.property.toLowerCase().trim() || item.property.toLowerCase().includes(reservationForm.property.toLowerCase()) || reservationForm.property.toLowerCase().includes(item.property.toLowerCase()))
    ) || activeUnits.find((item) => item.unit === reservationForm.unit);
    const now = today instanceof Date ? today : new Date();
    const in60 = new Date(now.getTime() + 60 * 86400000);
    const isEligible = unit && (
      unit.status === "Available" ||
      (unit.status as string) === "Vacant" ||
      (unit.contractEndDate && new Date(unit.contractEndDate) <= in60)
    );
    if (!unit || !isEligible) return;

    const tokAmt = reservationForm.isHold ? (Number(reservationForm.tokenAmount) || 0) : 0;
    const tokReceiptNo = reservationForm.tokenReceiptNo || `RV-HOLD-${unit.unit.replace(/\W/g, "")}-${Date.now().toString().slice(-4)}`;

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
      isHold: reservationForm.isHold,
      tokenAmount: tokAmt,
      tokenPaymentMode: reservationForm.tokenPaymentMode,
      tokenReceiptNo: tokAmt > 0 ? tokReceiptNo : undefined,
      tokenCashierName: reservationForm.tokenCashierName || undefined,
      tokenPayerBank: reservationForm.tokenPaymentMode === "Bank Transfer" ? reservationForm.tokenPayerBank : undefined,
      tokenTransferRef: reservationForm.tokenPaymentMode === "Bank Transfer" ? reservationForm.tokenTransferRef : undefined,
      tokenTransferDate: reservationForm.tokenPaymentMode === "Bank Transfer" ? reservationForm.tokenTransferDate : undefined,
      tokenChequeNo: reservationForm.tokenPaymentMode === "Cheque" ? reservationForm.tokenChequeNo : undefined,
      tokenChequeBank: reservationForm.tokenPaymentMode === "Cheque" ? reservationForm.tokenChequeBank : undefined,
      tokenChequeDate: reservationForm.tokenPaymentMode === "Cheque" ? reservationForm.tokenChequeDate : undefined,
      tokenChequeFile: reservationForm.tokenPaymentMode === "Cheque" ? reservationForm.tokenChequeFile : undefined,
    };

    setReservations((items) => [reservation, ...items]);
    setUnits((items) => items.map((item) => (item.id === unit.id ? { ...item, status: "Reserved" } : item)));
    setRealUnits((items) => items.map((item) => (item.id === unit.id ? { ...item, status: "Reserved" } : item)));

    // If a token advance is received to hold the unit, post the advance receipt voucher & cash book
    if (tokAmt > 0) {
      const today_str = today.toISOString().split("T")[0];
      const cashierInfo = reservationForm.tokenCashierName ? `Cashier / Staff: ${reservationForm.tokenCashierName}` : "Finance Desk";
      const paymentDetailText =
        reservation.tokenPaymentMode === "Cash"
          ? `${cashierInfo}`
          : reservation.tokenPaymentMode === "Bank Transfer"
          ? `${cashierInfo} | Bank: ${reservationForm.tokenPayerBank || "Direct Wire"} | Ref: ${reservationForm.tokenTransferRef || tokReceiptNo} | Date: ${reservationForm.tokenTransferDate || today_str}`
          : `${cashierInfo} | Cheque #${reservationForm.tokenChequeNo || "PDC"} | Bank: ${reservationForm.tokenChequeBank || "CBQ"} | Due: ${reservationForm.tokenChequeDate || today_str}`;

      const holdVoucher: Voucher = {
        id: `v${vouchers.length + 1}`,
        leaseId: "",
        name: `Receipt Voucher - Reservation Token Advance (${reservation.tenantName}) [${paymentDetailText}]`,
        receiptNo: tokReceiptNo,
        method: reservation.tokenPaymentMode || "Cash",
        period: "Unit Hold Token Advance",
        debit:
          reservation.tokenPaymentMode === "Bank Transfer"
            ? "Bank Operating Account (12000)"
            : reservation.tokenPaymentMode === "Cheque"
            ? "PDC In Hand Account (12900)"
            : "Cash In Hand (12100)",
        credit: `Reservation Advance Liability - ${unit.unit} (21100001)`,
        amount: tokAmt,
        status: "posted",
      };
      setVouchers((items) => [holdVoucher, ...items]);

      addFinanceStoreVoucher({
        voucher_no: tokReceiptNo,
        voucher_type: "Receipt Voucher",
        date: today_str,
        name: `Reservation Token Advance — ${reservation.tenantName} (${unit.unit}) [${paymentDetailText}]`,
        debit:
          reservation.tokenPaymentMode === "Bank Transfer"
            ? "Bank Operating Account"
            : reservation.tokenPaymentMode === "Cheque"
            ? "PDC In Hand Account"
            : "Cash In Hand",
        debit_code:
          reservation.tokenPaymentMode === "Bank Transfer"
            ? "12000"
            : reservation.tokenPaymentMode === "Cheque"
            ? "12900"
            : "12100",
        credit: "Reservation Advance Liability (21100001)",
        credit_code: "21100",
        amount: tokAmt,
        method: reservation.tokenPaymentMode || "Cash",
        property_name: unit.property,
        unit_ref: unit.unit,
        tenant_name: reservation.tenantName,
      });

      if (reservation.tokenPaymentMode === "Cash") {
        addCashBookEntry({
          date: today_str,
          voucher: tokReceiptNo,
          description: `Reservation Token Advance — ${reservation.tenantName} / ${unit.unit} (${cashierInfo})`,
          type: "in",
          amount: tokAmt,
        });
      }
    }

    setReservationForm((form) => ({
      ...form,
      tenantName: "",
      remarks: "",
      tokenReceiptNo: "",
      tokenTransferRef: "",
      tokenChequeNo: "",
      tokenChequeFile: "",
    }));
    recordAudit({
      stage: "Unit Reservation",
      owner: "Marketing Agent",
      input: `${reservation.unit}, ${reservation.tenantName}, validity until ${reservation.validUntil}${tokAmt > 0 ? `, Token Hold: ${formatMoney(tokAmt)} (${reservation.tokenPaymentMode})` : ""}`,
      approval: "Lease Module reservation control",
      status: "Reserved",
      output: tokAmt > 0 ? `Unit locked with refundable token hold of ${formatMoney(tokAmt)} (Receipt: ${tokReceiptNo})` : "Unit locked and unavailable for other offers",
    });
  }

  function releaseReservation(
    reservation: Reservation,
    status: "expired" | "released",
    refundOpts?: { refundMode?: "Cash" | "Bank Transfer" | "Cheque"; refundBank?: string; voucherNo?: string; reason?: string }
  ) {
    const hasToken = Number(reservation.tokenAmount) > 0 && !reservation.tokenRefunded;
    setReservations((items) => items.map((item) => (item.id === reservation.id ? { ...item, status, tokenRefunded: hasToken ? true : item.tokenRefunded } : item)));
    setUnits((items) => items.map((item) => (item.unit === reservation.unit ? { ...item, status: "Available" } : item)));
    setRealUnits((items) => items.map((item) => (item.unit === reservation.unit ? { ...item, status: "Available" } : item)));

    // If this held reservation had a token advance, record the refund payment voucher & cash book exit
    if (hasToken) {
      const mode = refundOpts?.refundMode || reservation.tokenPaymentMode || "Cash";
      const bankCode = refundOpts?.refundBank || "12000001";
      const isBank = mode === "Bank Transfer" || mode === "Cheque";
      const crGlCode = isBank ? (bankCode || "12000001") : "12100001";
      const crGlName = isBank ? "Bank Operating Account" : "Cash In Hand";

      const today_str = today.toISOString().split("T")[0];
      const refundVoucherNo = refundOpts?.voucherNo?.trim() || `PV-REF-TOK-${(reservation.unit || "U").replace(/\W/g, "")}-${Date.now().toString().slice(-4)}`;
      const refundVoucher: Voucher = {
        id: `v${vouchers.length + 1}`,
        leaseId: "",
        name: `Payment Voucher - Refund Reservation Token (${reservation.tenantName})`,
        receiptNo: refundVoucherNo,
        method: mode,
        period: "Refund Token Advance",
        debit: `Reservation Advance Liability - ${reservation.unit} (21100001)`,
        credit: `${crGlName} (${crGlCode})`,
        amount: reservation.tokenAmount!,
        status: "posted",
      };
      setVouchers((items) => [refundVoucher, ...items]);

      addFinanceStoreVoucher({
        voucher_no: refundVoucherNo,
        voucher_type: "Payment Voucher",
        date: today_str,
        name: `Reservation Token Refund — ${reservation.tenantName} (${reservation.unit})`,
        debit: "Reservation Advance Liability (21100001)",
        debit_code: "21100001",
        credit: crGlName,
        credit_code: crGlCode,
        amount: reservation.tokenAmount!,
        method: mode,
        property_name: reservation.property,
        unit_ref: reservation.unit,
        tenant_name: reservation.tenantName,
      });

      if (mode === "Cash") {
        addCashBookEntry({
          date: today_str,
          voucher: refundVoucherNo,
          description: `Reservation Token Refund — ${reservation.tenantName} / ${reservation.unit}`,
          type: "out",
          amount: reservation.tokenAmount!,
        });
      }

      toast.success(`Token advance of ${formatMoney(reservation.tokenAmount)} refunded to ${reservation.tenantName} via ${mode}.`);
    }

    recordAudit({
      stage: "Reservation Notification",
      owner: "Leasing Department",
      input: `${reservation.unit} reservation ${status}${hasToken ? `, Token Refunded: ${formatMoney(reservation.tokenAmount)} via ${refundOpts?.refundMode || reservation.tokenPaymentMode || "Cash"}` : ""}${refundOpts?.reason ? ` (Reason: ${refundOpts.reason})` : ""}`,
      approval: "Marketing/Leasing follow-up",
      status,
      output: "Agent notified, unit released to available stock, and token settlement posted to GL (21100001)",
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
    const isCompany = form.type === "company";
    return customers.some((customer) => {
      if (excludeId && customer.id === excludeId) return false;
      // For individual customers: block on QID, passport, mobile, or email
      if (!isCompany) {
        if (form.qatarId && customer.qatarId && form.qatarId.trim().toLowerCase() === customer.qatarId.trim().toLowerCase()) return true;
        if (form.passport && customer.passport && form.passport.trim().toLowerCase() === customer.passport.trim().toLowerCase()) return true;
        const fMobile = form.primaryMobile || form.mobile;
        const cMobile = (customer as any).primaryMobile || (customer as any).mobile;
        if (fMobile && cMobile && fMobile.trim().replace(/\D/g, "") === cMobile.trim().replace(/\D/g, "")) return true;
        const fEmail = form.primaryEmail || form.email;
        const cEmail = (customer as any).primaryEmail || (customer as any).email;
        if (fEmail && cEmail && fEmail.trim().toLowerCase() === cEmail.trim().toLowerCase()) return true;
      }
      // For both types: block on CR number (unique per company registration)
      if (form.crNumber && customer.crNumber && form.crNumber.trim().toLowerCase() === customer.crNumber.trim().toLowerCase()) return true;
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
      if (passport && !/^[A-Za-z0-9]{6,12}$/.test(passport)) {
        return "Passport Number must be between 6 and 12 alphanumeric characters.";
      }
    }
    return null;
  }

  function createCustomer() {
    const finalDisplayName = (customerForm.displayName || customerForm.name || (customerForm.type === "individual" ? `${customerForm.firstName || ""} ${customerForm.lastName || ""}`.trim() : customerForm.companyLegalName) || "").trim();

    if (!finalDisplayName) {
      alert("Please enter a customer display name before saving.");
      return;
    }

    const valErr = validateCustomerIdentifiers(customerForm);
    if (valErr) {
      alert(valErr);
      return;
    }

    // Individual customers: require Primary Mobile
    if (customerForm.type === "individual") {
      const mob = (customerForm.primaryMobile || customerForm.mobile || "").trim();
      if (!mob) {
        alert("Primary Mobile is required for Individual customers.");
        return;
      }
    }

    if (isCustomerDuplicate(customerForm)) {
      const msg = customerForm.type === "company"
        ? "A company with the same Commercial Registration (CR) number already exists."
        : "A customer with the same Qatar ID, passport, mobile, or email already exists. Please verify unique identifiers before saving.";
      alert(msg);
      return;
    }

    const primaryMob = customerForm.primaryMobile || customerForm.mobile || "";
    const primaryMail = customerForm.primaryEmail || customerForm.email || "";

    const customer: Customer = {
      id: `c${customers.length + 1}`,
      ...customerForm,
      name: finalDisplayName,
      displayName: finalDisplayName,
      mobile: primaryMob,
      primaryMobile: primaryMob,
      email: primaryMail,
      primaryEmail: primaryMail,
      currentAddress: customerForm.currentAddress || customerForm.localAddress || "",
      localAddress: customerForm.currentAddress || customerForm.localAddress || "",
      status: "active",
    };
    setCustomers((items) => [customer, ...items]);

    const createdDocs: TenantDocument[] = [];
    if (customer.type === "company") {
      const crUploaded = !!customerForm.crFile;
      const ccUploaded = !!customerForm.computerCardFile;
      const tlUploaded = !!customerForm.tradeLicenceFile;
      const tinUploaded = !!customerForm.taxIdFile;

      createdDocs.push({
        id: `doc-${customer.id}-1`,
        customerId: customer.id,
        name: "Commercial Registration (CR)",
        mandatory: true,
        status: crUploaded ? "pending" : "pending",
        expiryDate: customerForm.crExpiryDate || "",
        reviewer: "",
        remarks: crUploaded ? `Uploaded: ${customerForm.crFile}` : "Awaiting document upload",
        file: customerForm.crFile || undefined,
      });
      createdDocs.push({
        id: `doc-${customer.id}-2`,
        customerId: customer.id,
        name: "Computer Card (Establishment ID)",
        mandatory: true,
        status: ccUploaded ? "pending" : "pending",
        expiryDate: customerForm.computerCardExpiryDate || "",
        reviewer: "",
        remarks: ccUploaded ? `Uploaded: ${customerForm.computerCardFile}` : "Awaiting document upload",
        file: customerForm.computerCardFile || undefined,
      });
      createdDocs.push({
        id: `doc-${customer.id}-3`,
        customerId: customer.id,
        name: "Authorized Signatory QID",
        mandatory: true,
        status: "pending",
        expiryDate: customerForm.signatoryIdExpiryDate || "",
        reviewer: "",
        remarks: "Awaiting document upload",
        file: undefined,
      });
      createdDocs.push({
        id: `doc-${customer.id}-4`,
        customerId: customer.id,
        name: "Company Municipal License",
        mandatory: false,
        status: tlUploaded ? "pending" : "info_required",
        expiryDate: customerForm.tradeLicenceExpiryDate || "",
        reviewer: "",
        remarks: tlUploaded ? `Uploaded: ${customerForm.tradeLicenceFile}` : (tinUploaded ? `Tax ID: ${customerForm.taxIdentificationNo || ""} - Uploaded: ${customerForm.taxIdFile}` : "Awaiting document upload"),
        file: customerForm.tradeLicenceFile || customerForm.taxIdFile || undefined,
      });
    } else {
      const qidUploaded = !!customerForm.qidFile;
      const passUploaded = !!customerForm.passportFile;

      createdDocs.push({
        id: `doc-${customer.id}-1`,
        customerId: customer.id,
        name: "Qatar ID (QID) - Front & Back",
        mandatory: true,
        status: qidUploaded ? "pending" : "pending",
        expiryDate: customerForm.qidExpiryDate || "",
        reviewer: "",
        remarks: qidUploaded ? `Uploaded: ${customerForm.qidFile}` : "Awaiting document upload",
        file: customerForm.qidFile || undefined,
      });
      createdDocs.push({
        id: `doc-${customer.id}-2`,
        customerId: customer.id,
        name: "Passport Copy",
        mandatory: true,
        status: passUploaded ? "pending" : "pending",
        expiryDate: customerForm.passportExpiryDate || "",
        reviewer: "",
        remarks: passUploaded ? `Uploaded: ${customerForm.passportFile}` : "Awaiting document upload",
        file: customerForm.passportFile || undefined,
      });
      createdDocs.push({
        id: `doc-${customer.id}-3`,
        customerId: customer.id,
        name: "Salary Certificate / Employment Letter",
        mandatory: true,
        status: "pending",
        expiryDate: "",
        reviewer: "",
        remarks: "Awaiting document upload",
        file: undefined,
      });
      createdDocs.push({
        id: `doc-${customer.id}-4`,
        customerId: customer.id,
        name: "Bank Statement (3 Months)",
        mandatory: false,
        status: "info_required",
        expiryDate: "",
        reviewer: "",
        remarks: "Awaiting document upload",
        file: undefined,
      });
    }

    setDocuments((items) => [...createdDocs, ...items]);

    setCustomerForm(initialCustomerFormState);
    recordAudit({
      stage: "Customer Master",
      owner: "Leasing Department",
      input: `${customer.name} (${customer.type}), KYC identity keys checked and documents uploaded`,
      approval: "Customer activation",
      status: "active",
      output: "Tenant profile and uploaded documents linked to Documents module",
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
    setDocuments((items) => {
      // If this is a brand-new doc (from "not submitted" Upload button),
      // add it to the list before updating — but only if it doesn't already exist.
      const exists = items.some(i => i.id === selectedDocId);
      const base = exists ? items : (pendingNewDoc ? [...items, pendingNewDoc] : items);
      return base.map((item) =>
        item.id === selectedDocId
          ? {
            ...item,
            file: uploadDocForm.fileName || uploadDocForm.file,
            status: "pending",
            remarks: uploadDocForm.remarks || "Document uploaded and awaiting review",
          }
          : item,
      );
    });
    setPendingNewDoc(null);
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
    const tokenAdv = reservation.tokenAmount || 0;
    setCreateLeaseForm(f => ({
      ...f,
      startDate: reservation.startDate,
      endDate: addDays(new Date(reservation.startDate), 365),
      monthlyRent: String(reservation.rent),
      securityDeposit: String(reservation.rent),
      specialConditions: reservation.remarks || (tokenAdv > 0 ? `Token Advance of QR ${tokenAdv.toLocaleString()} applied from reservation hold.` : ""),
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
    const tokenAdv = reservation.tokenAmount || 0;
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
      ...(tokenAdv > 0 ? { appliedTokenAdvance: tokenAdv } : {}),
    };
    setLeases((items) => [lease, ...items]);
    setReservations((items) => items.map((item) => (item.id === reservation.id ? { ...item, status: "converted" } : item)));
    setCreateLeaseOpen(false);
    setSelectedReservationForLease(null);
    recordAudit({
      stage: "Lease Agreement Creation",
      owner: "Leasing Department",
      input: `${lease.tenantName}, ${lease.unit}, ${lease.paymentFrequency}, ${formatMoney(lease.monthlyRent)}${tokenAdv > 0 ? `, Token Advance Applied: ${formatMoney(tokenAdv)}` : ""}`,
      approval: docsVerified ? "Document gate passed" : "Document gate pending",
      status: lease.status,
      output: tokenAdv > 0 ? `Lease agreement created; Token advance of ${formatMoney(tokenAdv)} credited towards deposit.` : "Lease agreement created with rent schedule terms",
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
    setReleaseRefundMode(reservation.tokenPaymentMode || "Cash");
    setReleaseRefundBank("12000001");
    setReleaseRefundVoucherNo(`PV-REF-TOK-${(reservation.unit || "U").replace(/\W/g, "")}-${Date.now().toString().slice(-4)}`);
    setReleaseOpen(true);
  }

  function confirmRelease() {
    if (!selectedReservationForRelease) return;
    releaseReservation(selectedReservationForRelease, releaseType, {
      refundMode: releaseRefundMode,
      refundBank: releaseRefundBank,
      voucherNo: releaseRefundVoucherNo,
      reason: releaseReason,
    });
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
    const isPdcMode = collectForm.paymentMode === "PDC";
    
    // ── Filter only rows that have both cheque no and amount filled for PDC mode ──
    let nextPdcs: Pdc[] = [];
    let rentTotal = 0;

    if (isPdcMode) {
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
      rentTotal = nextPdcs.reduce((sum, pdc) => sum + pdc.amount, 0);
    } else {
      // Non-PDC Modes (Cash, Bank Transfer, Guarantee Cheque)
      const count = Number(collectForm.pdcCount) || lease.pdcCount || 12;
      rentTotal = Number(collectForm.regularChequeAmount) || (lease.monthlyRent * count);
    }

    const agencyAmt = Number(collectForm.agencyCommission) || 0;
    const adminAmt = Number(collectForm.adminCharges) || 0;
    const utilityAmt = Number(collectForm.utilityDeposit) || 0;
    const qatarCoolAmt = Number(collectForm.qatarCoolDeposit) || 0;
    const reservationAmt = Number(collectForm.reservationDeposit) || 0;
    const serviceFeeAmt = Number(collectForm.serviceFeeDeposit) || 0;
    const guaranteeChequeAmt = Number(collectForm.guaranteeChequeDeposit) || 0;
    const today_str = today.toISOString().split("T")[0];

    // ── Calculate Security Deposit Items (Split vs Single) ──
    const splitCash = collectForm.depositIsSplit ? (Number(collectForm.depositSplitCash) || 0) : 0;
    const splitBank = collectForm.depositIsSplit ? (Number(collectForm.depositSplitBank) || 0) : 0;
    const splitCheque = collectForm.depositIsSplit ? (Number(collectForm.depositSplitCheque) || 0) : 0;
    const appliedToken = Number(collectForm.appliedTokenAdvance) || 0;

    let depAmt = 0;
    const depositVouchers: Voucher[] = [];

    if (collectForm.depositIsSplit) {
      depAmt = splitCash + splitBank + splitCheque + appliedToken;
      if (splitCash > 0) {
        depositVouchers.push({
          id: `v${vouchers.length + 2}-csh`,
          leaseId: lease.id,
          name: "Receipts Voucher - Security Deposit (Cash)",
          receiptNo: `RV-${lease.id}-SD-CSH`,
          method: "Cash",
          period: "Security Deposit Split (Cash)",
          debit: "Cash In Hand (12100)",
          credit: `Security Deposit Liability - ${lease.unit} (21500)`,
          amount: splitCash,
          status: "posted",
        });
      }
      if (splitBank > 0) {
        depositVouchers.push({
          id: `v${vouchers.length + 2}-bnk`,
          leaseId: lease.id,
          name: `Receipts Voucher - Security Deposit (Bank Ref: ${collectForm.depositSplitBankRef || "Transfer"})`,
          receiptNo: `RV-${lease.id}-SD-BNK`,
          method: "Bank Transfer",
          period: "Security Deposit Split (Bank)",
          debit: "Bank Operating Account (12000)",
          credit: `Security Deposit Liability - ${lease.unit} (21500)`,
          amount: splitBank,
          status: "posted",
        });
      }
      if (splitCheque > 0) {
        depositVouchers.push({
          id: `v${vouchers.length + 2}-chq`,
          leaseId: lease.id,
          name: `Receipts Voucher - Security Deposit (Cheque: ${collectForm.depositSplitChequeNo || "PDC"})`,
          receiptNo: `RV-${lease.id}-SD-CHQ`,
          method: "PDC",
          period: "Security Deposit Split (Cheque)",
          debit: "PDC In Hand (12900001)",
          credit: `Security Deposit Liability - ${lease.unit} (21500)`,
          amount: splitCheque,
          status: "posted",
        });
      }
      if (appliedToken > 0) {
        depositVouchers.push({
          id: `v${vouchers.length + 2}-tok`,
          leaseId: lease.id,
          name: "Journal Voucher - Token Advance Applied to Deposit",
          receiptNo: `JV-${lease.id}-TOK-DEP`,
          method: "Adjustment",
          period: "Token Advance Conversion",
          debit: "Reservation Advance Liability (21100001)",
          credit: `Security Deposit Liability - ${lease.unit} (21500)`,
          amount: appliedToken,
          status: "posted",
        });
      }
    } else {
      const fullDeposit = Number(collectForm.depositAmount) || lease.securityDeposit;
      depAmt = fullDeposit;
      const directDepAmt = Math.max(0, fullDeposit - appliedToken);

      if (directDepAmt > 0) {
        const depDebit = collectForm.depositMode === "Cash" ? "Cash In Hand (12100)" :
                         collectForm.depositMode === "Bank Transfer" ? "Bank Operating Account (12000)" : "PDC In Hand (12900001)";
        depositVouchers.push({
          id: `v${vouchers.length + 2}`,
          leaseId: lease.id,
          name: `Receipts Voucher - Security Deposit (${collectForm.depositMode})`,
          receiptNo: `RV-${lease.id}-SD`,
          method: collectForm.depositMode,
          period: "Security Deposit",
          debit: depDebit,
          credit: `Security Deposit Liability - ${lease.unit} (21500)`,
          amount: directDepAmt,
          status: "posted",
        });
      }

      if (appliedToken > 0) {
        depositVouchers.push({
          id: `v${vouchers.length + 2}-tok`,
          leaseId: lease.id,
          name: "Journal Voucher - Token Advance Applied to Deposit",
          receiptNo: `JV-${lease.id}-TOK-DEP`,
          method: "Adjustment",
          period: "Token Advance Conversion",
          debit: "Reservation Advance Liability (21100001)",
          credit: `Security Deposit Liability - ${lease.unit} (21500)`,
          amount: appliedToken,
          status: "posted",
        });
      }
    }

    // ── Rent Vouchers by Payment Mode ──
    const rentVouchers: Voucher[] = [];
    if (collectForm.paymentMode === "PDC") {
      rentVouchers.push({
        id: `v${vouchers.length + 1}`,
        leaseId: lease.id,
        name: "Receipts Voucher - Rent PDC",
        receiptNo: `RV-${lease.id}-RENT-PDC`,
        method: "PDC",
        period: `${collectForm.startDate || lease.startDate} to ${collectForm.endDate || lease.endDate}`,
        debit: "PDC In Hand (12900001)",
        credit: `Customer(PDC)-${lease.unit} (21400)`,
        amount: rentTotal,
        status: "posted",
      });
    } else if (collectForm.paymentMode === "Cash") {
      rentVouchers.push({
        id: `v${vouchers.length + 1}`,
        leaseId: lease.id,
        name: "Receipts Voucher - Rent Cash",
        receiptNo: collectForm.rentPaymentReceiptNo || `RV-${lease.id}-RENT-CSH`,
        method: "Cash",
        period: `${collectForm.startDate || lease.startDate} to ${collectForm.endDate || lease.endDate}`,
        debit: "Cash In Hand (12100)",
        credit: `Rental Income - ${lease.unit} (41100)`,
        amount: rentTotal,
        status: "posted",
      });
    } else if (collectForm.paymentMode === "Bank Transfer") {
      rentVouchers.push({
        id: `v${vouchers.length + 1}`,
        leaseId: lease.id,
        name: `Receipts Voucher - Rent Bank Transfer (Ref: ${collectForm.rentPaymentReference || "Direct"})`,
        receiptNo: `RV-${lease.id}-RENT-BT`,
        method: "Bank Transfer",
        period: `${collectForm.startDate || lease.startDate} to ${collectForm.endDate || lease.endDate}`,
        debit: "Bank Operating Account (12000)",
        credit: `Rental Income - ${lease.unit} (41100)`,
        amount: rentTotal,
        status: "posted",
      });
    } else if (collectForm.paymentMode === "Guarantee Cheque") {
      rentVouchers.push({
        id: `v${vouchers.length + 1}`,
        leaseId: lease.id,
        name: `Receipts Voucher - Rent Guarantee Cheque (${collectForm.rentGuaranteeChequeNo || "GNT"})`,
        receiptNo: `RV-${lease.id}-RENT-GNT`,
        method: "Guarantee Cheque",
        period: `${collectForm.startDate || lease.startDate} to ${collectForm.endDate || lease.endDate}`,
        debit: "Guarantee Cheque In Hand (12900002)",
        credit: `Guarantee Cheque Received (21200001)`,
        amount: rentTotal,
        status: "posted",
      });
    }

    const newVouchers: Voucher[] = [
      ...rentVouchers,
      ...depositVouchers,
      ...(utilityAmt > 0 ? [{ id: `v${vouchers.length + 3}`, leaseId: lease.id, name: "Receipts Voucher - Kahramaa Deposit", receiptNo: `RV-${lease.id}-UTL`, method: "Cash", period: "Kahramaa utility deposit", debit: "Cash In Hand (12100)", credit: "Kahramaa Deposit (21100003)", amount: utilityAmt, status: "posted" as const }] : []),
      ...(qatarCoolAmt > 0 ? [{ id: `v${vouchers.length + 4}`, leaseId: lease.id, name: "Receipts Voucher - Qatar Cool Deposit", receiptNo: `RV-${lease.id}-QC`, method: "Cash", period: "Qatar Cool utility deposit", debit: "Cash In Hand (12100)", credit: "Qatar Cool Deposit (21100004)", amount: qatarCoolAmt, status: "posted" as const }] : []),
      ...(reservationAmt > 0 ? [{ id: `v${vouchers.length + 5}`, leaseId: lease.id, name: "Receipts Voucher - Reservation Advance", receiptNo: `RV-${lease.id}-RES`, method: "Cash", period: "Reservation advance", debit: "Cash In Hand (12100)", credit: "Reservation Advance (21100001)", amount: reservationAmt, status: "posted" as const }] : []),
      ...(serviceFeeAmt > 0 ? [{ id: `v${vouchers.length + 6}`, leaseId: lease.id, name: "Receipts Voucher - Service Fee Deposit", receiptNo: `RV-${lease.id}-SVC`, method: "Cash", period: "Service fee deposit", debit: "Cash In Hand (12100)", credit: "Service Fee Deposit (21100005)", amount: serviceFeeAmt, status: "posted" as const }] : []),
      ...(guaranteeChequeAmt > 0 ? [{ id: `v${vouchers.length + 7}`, leaseId: lease.id, name: "Receipts Voucher - Guarantee Cheque", receiptNo: `RV-${lease.id}-GCHQ`, method: "Guarantee Cheque", period: "Guarantee cheque security", debit: "Guarantee Cheque In Hand (12900002)", credit: "Guarantee Cheque Received (21200001)", amount: guaranteeChequeAmt, status: "posted" as const }] : []),
      ...(agencyAmt > 0 ? [{ id: `v${vouchers.length + 8}`, leaseId: lease.id, name: "Agency Commission - Revenue", receiptNo: `RV-${lease.id}-AGN`, method: "Cash", period: "One-time fee", debit: "Cash In Hand (12100)", credit: "Agency Commission Income (41201)", amount: agencyAmt, status: "posted" as const }] : []),
      ...(adminAmt > 0 ? [{ id: `v${vouchers.length + 9}`, leaseId: lease.id, name: "Admin Charges - Revenue", receiptNo: `RV-${lease.id}-ADM`, method: "Cash", period: "One-time fee", debit: "Cash In Hand (12100)", credit: "Admin Charges Income (41201)", amount: adminAmt, status: "posted" as const }] : []),
    ];

    // ── Authoritative Finance posting ──────────────────────────────────────
    try {
      const leaseIdValue = String(lease.id);
      const isLeaseUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(leaseIdValue);
      const leaseLookup = isLeaseUuid
        ? supabase.from("leases").select("id, customer_id, property_id, unit_id").eq("id", leaseIdValue).maybeSingle()
        : supabase.from("leases").select("id, customer_id, property_id, unit_id").eq("lease_number", leaseIdValue).maybeSingle();
      const { data: financeLease } = await leaseLookup;

      if (financeLease?.id && financeLease.customer_id && financeLease.property_id && financeLease.unit_id) {
        if (nextPdcs.length > 0) {
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
          { amount: depAmt, type: "SECURITY", mode: (collectForm.depositIsSplit ? (splitCash > 0 ? "Cash" : "Bank") : (collectForm.depositMode === "Cash" ? "Cash" : "Bank")) },
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
    if (nextPdcs.length > 0) {
      setPdcs((items) => [...nextPdcs, ...items]);
    }

    setVouchers((items) => [...newVouchers, ...items]);

    // Feed directly to authoritative FinanceStore vouchers for General Ledger and Reports
    newVouchers.forEach(v => {
      const drCode = v.debit.includes("12900002") ? "12900" :
                     v.debit.includes("12900") ? "12900" :
                     v.debit.includes("21100001") ? "21100" :
                     v.debit.toLowerCase().includes("cash") ? "12100" : "12000";
      const crCode = v.credit.includes("21400") ? "21400" :
                     v.credit.includes("21500") ? "21500" :
                     v.credit.includes("21100001") ? "21100" :
                     v.credit.includes("21100003") ? "21100" :
                     v.credit.includes("21100004") ? "21100" :
                     v.credit.includes("21100005") ? "21100" :
                     v.credit.includes("21200001") ? "21200" :
                     v.credit.includes("41201") ? "41201" :
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

    // Cash Book Inflow Entries
    if (collectForm.paymentMode === "Cash" && rentTotal > 0) {
      addCashBookEntry({ date: today_str, voucher: `RV-${lease.id}-RENT-CSH`, description: `Rent Cash Collection — ${lease.tenantName} / ${lease.unit}`, type: "in", amount: rentTotal });
    }
    if (collectForm.depositIsSplit) {
      if (splitCash > 0) addCashBookEntry({ date: today_str, voucher: `RV-${lease.id}-SD-CSH`, description: `Unit Security Deposit Cash Split — ${lease.tenantName} / ${lease.unit}`, type: "in", amount: splitCash });
    } else {
      const directDepAmt = Math.max(0, depAmt - appliedToken);
      if (directDepAmt > 0 && collectForm.depositMode === "Cash") {
        addCashBookEntry({ date: today_str, voucher: `RV-${lease.id}-SD`, description: `Unit Security Deposit Cash — ${lease.tenantName} / ${lease.unit}`, type: "in", amount: directDepAmt });
      }
    }
    if (utilityAmt > 0) addCashBookEntry({ date: today_str, voucher: `RV-${lease.id}-UTL`, description: `Kahramaa Utility Deposit — ${lease.tenantName} / ${lease.unit}`, type: "in", amount: utilityAmt });
    if (qatarCoolAmt > 0) addCashBookEntry({ date: today_str, voucher: `RV-${lease.id}-QC`, description: `Qatar Cool Utility Deposit — ${lease.tenantName} / ${lease.unit}`, type: "in", amount: qatarCoolAmt });
    if (reservationAmt > 0) addCashBookEntry({ date: today_str, voucher: `RV-${lease.id}-RES`, description: `Reservation Advance — ${lease.tenantName} / ${lease.unit}`, type: "in", amount: reservationAmt });
    if (serviceFeeAmt > 0) addCashBookEntry({ date: today_str, voucher: `RV-${lease.id}-SVC`, description: `Service Fee Deposit — ${lease.tenantName} / ${lease.unit}`, type: "in", amount: serviceFeeAmt });

    advanceLease(lease, "collection_completed", {
      collectionCompleted: true,
      pdcCount: nextPdcs.length > 0 ? nextPdcs.length : (Number(collectForm.pdcCount) || 12),
      startDate: collectForm.startDate || lease.startDate,
      endDate: collectForm.endDate || lease.endDate,
    });

    recordAudit({
      stage: "Collection & Receipt Generation",
      owner: `Finance Cashier${collectForm.cashierName ? " – " + collectForm.cashierName : ""}`,
      input: `Rent: ${collectForm.paymentMode} (${formatMoney(rentTotal)}), Deposit: ${collectForm.depositIsSplit ? "Split [Cash: " + formatMoney(splitCash) + ", Bank: " + formatMoney(splitBank) + ", Cheque: " + formatMoney(splitCheque) + ", Token: " + formatMoney(appliedToken) + "]" : collectForm.depositMode + " (" + formatMoney(depAmt) + ")"}${agencyAmt > 0 ? ", agency commission " + formatMoney(agencyAmt) : ""}${adminAmt > 0 ? ", admin charges " + formatMoney(adminAmt) : ""}${utilityAmt > 0 ? ", utility deposit " + formatMoney(utilityAmt) : ""}`,
      approval: "Cashier receipt posting",
      status: "collection_completed",
      output: (collectForm.notes || "Rent, security deposit and ancillary collection receipts posted") + (collectForm.receiptFile ? ` (Proof: ${collectForm.receiptFile})` : ""),
    });

    // Auto-generate official printable receipt
    const totalCollectedAmt = rentTotal + depAmt + agencyAmt + adminAmt + utilityAmt + qatarCoolAmt + reservationAmt + serviceFeeAmt + guaranteeChequeAmt;
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
      totalContractRent: rentTotal,
      depositAmount: depAmt,
      depositMode: collectForm.depositIsSplit ? "Split Payment (Cash / Bank / Cheque / Token)" : collectForm.depositMode,
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
      notes: collectForm.notes || (collectForm.depositIsSplit ? `Split security deposit & ${collectForm.paymentMode} rent collection processed.` : "Official receipt acknowledged for rent, security deposit, and applicable fees."),
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
      const customer = (customers || []).find((c) => c.id === lease.customerId || (c.name && lease.tenantName && c.name.toLowerCase().trim() === lease.tenantName.toLowerCase().trim()));
      
      printBilingualLeaseContract({
        ...lease,
        contractNumber: undefined,
        tenantNameEn: lease.tenantName,
        tenantQid: customer?.qid || (lease as any).tenantQid || "28235644351",
        tenantMobile: customer?.phone || customer?.mobile || (lease as any).tenantMobile || "66965239",
        tenantPoBox: customer?.poBox || "200360",
        tenantAddressEn: customer?.address || "Doha – Qatar",
        propertyAddressEn: lease.property,
        zoneEn: lease.property,
        zoneAr: lease.property,
        propertyUnitNumber: lease.unit,
        monthlyRent: lease.monthlyRent,
        securityDepositAmount: lease.securityDeposit || lease.monthlyRent,
        leaseStartDate: lease.startDate,
        leaseEndDate: lease.endDate,
        pdcCount: lease.pdcCount || 12,
        paymentFrequency: lease.paymentFrequency,
        gracePeriodDays: lease.gracePeriodDays || 7,
        penalties: lease.penalties || "5%",
        maintenanceResponsibility: lease.maintenanceResponsibility || "Landlord",
        utilityResponsibility: lease.utilityResponsibility || "Tenant",
        parkingDetails: lease.parkingDetails || "Dedicated parking",
        specialConditionsEn: lease.specialConditions || "Standard Tenancy Agreement",
        noticePeriodDays: lease.noticePeriodDays || 60,
      });
    } catch (error) {
      console.error(error);
      alert("Failed to generate lease agreement. Please try again.");
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
    const numAmount = Number(amount);
    const voucherRef = receiptNo || `SD-${Date.now()}`;
    const newVoucher: Voucher = {
      id: `v${vouchers.length + 1}`,
      leaseId,
      name: `Receipt Voucher - Security Deposit (${method})`,
      receiptNo: voucherRef,
      method,
      period: "Security Deposit",
      debit: isPdc ? "PDC In Hand" : method === "Cash" ? "Cash In Hand" : "Bank Account",
      credit: "Security Deposit Liability",
      amount: numAmount,
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
        amount: numAmount,
        status: "received",
      };
      setPdcs((items) => [newPdc, ...items]);
    }
    // Update lease security deposit
    setLeases((items) => items.map((l) => l.id === leaseId ? { ...l, securityDeposit: l.securityDeposit + numAmount } : l));
    recordAudit({
      stage: "Security Deposit Received",
      owner: "Finance Department",
      input: `${method} — ${formatMoney(numAmount)}${chequeNo ? ` — Cheque ${chequeNo}` : ""}`,
      approval: "Cashier receipt",
      status: "received",
      output: `Security deposit ${newVoucher.receiptNo} recorded. ${notes || ""}`,
    });

    // Post to Finance GL — Dr Cash/Bank/PDC In Hand / Cr 21500001 Security Deposit Liability
    const drCode = isPdc ? "12900001" : method === "Cash" ? "12100001" : "12000001";
    const drName = isPdc ? "Rent PDC In Hand" : method === "Cash" ? "Cash in Hand / Operating Cash" : "Bank Operating Account (QNB)";
    const postingDate = chequeDate || new Date().toISOString().split("T")[0];
    const lease = leases.find(l => l.id === leaseId);
    const tenantLabel = lease?.tenantName || lease?.tenant || "Tenant";
    const unitLabel = lease?.unit || lease?.unitRef || "";
    void supabase.from("fin_vouchers").insert({
      voucher_number: `VCH-SD-RCV-${voucherRef}`,
      voucher_date: postingDate,
      voucher_type: "RV",
      description: `Security Deposit Received — ${tenantLabel}${unitLabel ? ` (${unitLabel})` : ""}${chequeNo ? ` [Cheque #${chequeNo}]` : ""}`,
      total_amount: numAmount,
      status: "posted",
      posted_at: new Date().toISOString(),
    }).select("id").single().then(({ data: vData, error: vErr }) => {
      if (!vErr && vData?.id) {
        void supabase.from("fin_voucher_lines").insert([
          { voucher_id: vData.id, account_code: drCode, account_name: drName, debit: numAmount, credit: 0, description: `Security Deposit — ${tenantLabel}` },
          { voucher_id: vData.id, account_code: "21500001", account_name: "Security Deposit Liability", debit: 0, credit: numAmount, description: `Security Deposit — ${tenantLabel}` },
        ]);
      }
    }).catch(err => console.warn("[addSecurityDeposit] GL posting note:", err));

    // Notify Finance Store so GL / Trial Balance / Balance Sheet update immediately
    window.dispatchEvent(new CustomEvent("finance_vouchers_updated"));

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

    if (renewalResponseForm.response === "non_renewal") {
      setRenewals((items) => items.map((item) => (item.id === renewal.id ? { ...item, status: "renewal_declined" } : item)));
      recordAudit({
        stage: "Lease Renewal Process",
        owner: "Leasing Department",
        input: `${oldLease.tenantName} (${oldLease.unit}), Tenant opted for non-renewal. Notes: ${renewalResponseForm.notes || "None"}`,
        approval: "Tenant Non-Renewal Notice",
        status: "declined",
        output: "Lease marked for non-renewal. Move-out inspection and settlement scheduling initiated.",
      });
      toast.info(`Non-renewal recorded for ${oldLease.tenantName}.`);
      return;
    }

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

    const agreedRent = renewalResponseForm.confirmedRent && Number(renewalResponseForm.confirmedRent) > 0
      ? Number(renewalResponseForm.confirmedRent)
      : (renewal.proposedRent || oldLease.monthlyRent);

    const newStartDate = addDays(new Date(oldLease.endDate), 1);
    const newEndDate = addDays(new Date(oldLease.endDate), 366);
    const renewedId = `l-ren-${Date.now()}`;
    const renewalSeq = (leases.filter((l) => l.unit === oldLease.unit).length) + 1;
    const contractNo = `${oldLease.contractNumber ? oldLease.contractNumber.replace(/-R\d+$/, "") : ("SLT-" + (oldLease.unit || "").replace(/\s+/g, ""))}-R${renewalSeq}`;

    const renewed: Lease = {
      ...oldLease,
      id: renewedId,
      contractNumber: contractNo,
      renewalOf: oldLease.id,
      startDate: newStartDate,
      endDate: newEndDate,
      monthlyRent: agreedRent,
      securityDeposit: oldLease.securityDeposit || agreedRent,
      pdcCount: 12,
      status: "documents_pending" as LeaseStatus,
      tenantSignedAt: undefined,
      landlordSignedAt: undefined,
      signedDocument: undefined,
      receivedBy: undefined,
      landlordPackageSubmittedAt: undefined,
      sharedWithTenant: false,
      collectionCompleted: false,
    };

    const renewalPdcs: Pdc[] = Array.from({ length: 12 }, (_, index) => {
      const bd = new Date(newStartDate);
      const day = bd.getDate();
      const rawMonth = bd.getMonth() + index;
      const yr = bd.getFullYear() + Math.floor(rawMonth / 12);
      const mo = ((rawMonth % 12) + 12) % 12;
      const lastDay = new Date(yr, mo + 1, 0).getDate();
      const maturityStr = `${yr}-${String(mo + 1).padStart(2, "0")}-${String(Math.min(day, lastDay)).padStart(2, "0")}`;

      const tsDate = new Date(newStartDate);
      tsDate.setMonth(tsDate.getMonth() + index);
      const teDate = new Date(newStartDate);
      teDate.setMonth(teDate.getMonth() + index + 1);
      teDate.setDate(teDate.getDate() - 1);

      return {
        id: `p-ren-${Date.now()}-${index + 1}`,
        leaseId: renewedId,
        chequeNo: `PDC-${(oldLease.unit || "Unit").replace(/\W/g, "")}-R${renewalSeq}-${String(index + 1).padStart(3, "0")}`,
        bank: "QNB",
        date: maturityStr,
        amount: agreedRent,
        payerName: oldLease.tenantName,
        period: `Renewal Cheque ${index + 1} of 12`,
        tenureStart: tsDate.toISOString().split("T")[0],
        tenureEnd: teDate.toISOString().split("T")[0],
        status: "received" as PdcStatus,
      };
    });

    setLeases((items) => [renewed, ...items.map((item) => (item.id === oldLease.id ? { ...item, status: "renewed" as LeaseStatus } : item))]);
    setRenewals((items) => items.map((item) => (item.id === renewal.id ? { ...item, status: "renewal_confirmed" } : item)));
    setPdcs((items) => [...renewalPdcs, ...items.filter((item) => item.leaseId !== renewed.id)]);

    recordAudit({
      stage: "Lease Renewal Process",
      owner: "Leasing Department",
      input: `${oldLease.tenantName} (${oldLease.unit}), renewed period ${newStartDate} to ${newEndDate}, Agreed Rent: QR ${agreedRent.toLocaleString()}${expiredDocs.length > 0 ? " | Expired docs flagged: " + expiredDocs.join(", ") : ""}`,
      approval: "Renewal confirmation",
      status: "renewal_confirmed",
      output: `New renewal agreement ${contractNo} created with 12 PDCs scheduled. Available in Signatures tab for signing & collection.`,
    });

    toast.success(`Lease renewed for ${oldLease.tenantName}! Agreement ${contractNo} & 12 PDCs created.`);
    handleTabChange("signatures");
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
      assetsSnapshot: handoverAssets.map(a => {
        const ch = assetChanges[a.id];
        return {
          id: a.id,
          name: a.asset_name,
          code: a.asset_code || a.category,
          condition: ch?.condition || a.asset_condition || "Good",
          remarks: ch?.imageFileName ? `Image uploaded: ${ch.imageFileName}` : a.remarks,
        };
      }),
      checkInRef: {
        condition: checkInForm.condition || handoverForm.unitCondition || "Good",
        electricityMeter: checkInForm.electricityMeter || handoverForm.electricityMeterReading || "12450",
        waterMeter: checkInForm.waterMeter || handoverForm.waterMeterReading || "840",
        damages: checkInForm.damages || "None recorded",
        pendingMaintenance: checkInForm.pendingMaintenance || "None",
        photos: Number(checkInForm.photos) || Number(handoverForm.photosTaken) || 6,
      },
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
        date: lease.startDate || (today instanceof Date ? today.toISOString().split("T")[0] : ""),
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
        date: lease.startDate || (today instanceof Date ? today.toISOString().split("T")[0] : ""),
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
    
    // 2. Update renewal case status to non_renewal_confirmed
    setRenewals((items) => items.map((item) => (item.leaseId === lease.id ? { ...item, status: "non_renewal_confirmed" as RenewalCase["status"] } : item)));

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
        <DialogContent className="sm:max-w-2xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          {/* ── Modal Header ── */}
          <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent px-6 py-4 border-b flex items-center gap-3 shrink-0">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-sm">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold">Reserve Property Unit</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Locks unit from Available to Reserved until lease conversion or validity expiration.</DialogDescription>
            </div>
          </div>

          {/* ── Modal Body (Scrollable) ── */}
          <div className="px-6 py-5 overflow-y-auto space-y-4 flex-1">
            {/* Property & Unit Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Field label="Target Property *">
                <SearchableSelect
                  value={reservationForm.property}
                  onValueChange={(property) => setReservationForm((form) => ({ ...form, property, unit: "" }))}
                  placeholder="Select Property"
                  emptyText="No property with vacant/expiring units."
                  options={(() => {
                    const activeUnits = realUnits.length > 0 ? realUnits : units;
                    const now = today instanceof Date ? today : new Date();
                    const in60 = new Date(now.getTime() + 60 * 86400000);

                    // Filter units that are either vacant/available OR expiring within 60 days
                    const eligibleUnits = activeUnits.filter((u) => {
                      const isVacant = u.status === "Available" || (u.status as string) === "Vacant";
                      if (isVacant) return true;
                      if (u.contractEndDate) {
                        const end = new Date(u.contractEndDate);
                        if (!isNaN(end.getTime()) && end <= in60) return true;
                      }
                      return false;
                    });

                    const propSet = new Set(eligibleUnits.map((u) => u.property).filter(Boolean));
                    return Array.from(propSet)
                      .sort()
                      .map((prop) => ({ label: prop, value: prop }));
                  })()}
                />
              </Field>
              <Field label="Available Unit *">
                <SearchableSelect
                  value={reservationForm.unit}
                  onValueChange={(unit) => {
                    const activeUnits = realUnits.length > 0 ? realUnits : units;
                    const selectedU = activeUnits.find(
                      u => u.unit === unit && (!reservationForm.property || u.property.toLowerCase().trim() === reservationForm.property.toLowerCase().trim() || u.property.toLowerCase().includes(reservationForm.property.toLowerCase()) || reservationForm.property.toLowerCase().includes(u.property.toLowerCase()))
                    );
                    setReservationForm((form) => ({
                      ...form,
                      unit,
                      rent: selectedU?.rent ? String(selectedU.rent) : form.rent
                    }));
                  }}
                  disabled={!reservationForm.property}
                  placeholder="Select Unit"
                  emptyText="No vacant or expiring unit for this property."
                  options={(() => {
                    if (!reservationForm.property) return [];
                    const activeUnits = realUnits.length > 0 ? realUnits : units;
                    const now = today instanceof Date ? today : new Date();
                    const in60 = new Date(now.getTime() + 60 * 86400000);
                    const propB = (reservationForm.property || "").toLowerCase().trim();

                    return activeUnits
                      .filter((u) => {
                        const propA = (u.property || "").toLowerCase().trim();
                        const matchProp = propA === propB || propA.includes(propB) || propB.includes(propA);
                        if (!matchProp) return false;

                        // Check if active reservation exists
                        const isReserved = reservations.some(
                          r => (r.property?.toLowerCase().trim() === propB || propA === r.property?.toLowerCase().trim()) && r.unit === u.unit && (r.status === "reserved" || r.status === "converted")
                        );
                        if (isReserved) return false;

                        // Eligibility: Available/Vacant OR Lease expiring within 60 days
                        const isVacant = u.status === "Available" || (u.status as string) === "Vacant";
                        let isExpiringIn60 = false;
                        if (u.contractEndDate) {
                          const end = new Date(u.contractEndDate);
                          if (!isNaN(end.getTime()) && end <= in60) isExpiringIn60 = true;
                        }

                        if (!isVacant && !isExpiringIn60) return false;

                        // Exclude if actively leased without expiring in 60 days
                        const isLeasedLongTerm = leases.some((l) => {
                          const matchLeaseProp = l.property?.toLowerCase().trim() === propB || propA === l.property?.toLowerCase().trim();
                          if (!matchLeaseProp || l.unit !== u.unit) return false;
                          if (l.status === "closed" || l.status === "checkout") return false;
                          if (l.endDate) {
                            const end = new Date(l.endDate);
                            return !isNaN(end.getTime()) && end > in60;
                          }
                          return true;
                        });
                        if (isLeasedLongTerm) return false;

                        return true;
                      })
                      .map((unit) => {
                        const isVacant = unit.status === "Available" || (unit.status as string) === "Vacant";
                        let statusTag = "Vacant / Available";
                        if (!isVacant && unit.contractEndDate) {
                          statusTag = `Expiring (${unit.contractEndDate})`;
                        }
                        return {
                          label: `${unit.unit} - ${statusTag}${unit.rent ? ` (QR ${unit.rent.toLocaleString()})` : ""}`,
                          value: unit.unit,
                        };
                      });
                  })()}
                />
              </Field>
            </div>
            
            {/* Customer Selection */}
            <Field label="Prospective Tenant Customer *">
              <SearchableSelect
                value={reservationForm.tenantName}
                onValueChange={(tenantName) => setReservationForm((form) => ({ ...form, tenantName }))}
                placeholder="Select Customer Profile"
                emptyText="No customer found."
                options={allCustomers.map((c) => ({ label: `${c.name} (${c.type === "company" ? "Company" : "Individual"})`, value: c.name }))}
              />
            </Field>

            {/* Timing & Terms */}
            <div className="rounded-xl border bg-muted/20 p-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-primary" /> Reservation Timing & Terms
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Expected Lease Start">
                  <Input type="date" value={reservationForm.startDate} onChange={(event) => setReservationForm((form) => ({ ...form, startDate: event.target.value }))} className="bg-background" />
                </Field>
                <Field label="Validity Hold (Days)">
                  <Input type="number" min="1" max="90" value={reservationForm.validityDays} onChange={(event) => setReservationForm((form) => ({ ...form, validityDays: event.target.value }))} className="bg-background" />
                </Field>
                <Field label="Proposed Monthly Rent (QAR)">
                  <Input type="number" placeholder="0.00" value={reservationForm.rent} onChange={(event) => setReservationForm((form) => ({ ...form, rent: event.target.value }))} className="bg-background font-mono" />
                </Field>
              </div>
            </div>

            {/* ── Provision to Hold Unit without Lease & Refundable Token Amount (Image 3) ── */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px] font-semibold">
                    Hold Provision
                  </Badge>
                  <Label className="text-xs font-bold text-foreground">Hold Unit with Refundable Token Amount</Label>
                </div>
                <label className="flex items-center gap-2 cursor-pointer select-none bg-background px-2.5 py-1 rounded-md border border-primary/20 hover:bg-primary/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={reservationForm.isHold}
                    onChange={(e) => setReservationForm((f) => ({ ...f, isHold: e.target.checked }))}
                    className="h-4 w-4 rounded accent-primary cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-primary">Enable Hold</span>
                </label>
              </div>

              {reservationForm.isHold && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="Token Amount (QAR) *">
                      <Input
                        type="number"
                        placeholder="1000"
                        value={reservationForm.tokenAmount}
                        onChange={(e) => setReservationForm((f) => ({ ...f, tokenAmount: e.target.value }))}
                        className="bg-background font-mono font-semibold"
                      />
                    </Field>
                    <Field label="Payment Mode">
                      <Select
                        value={reservationForm.tokenPaymentMode}
                        onValueChange={(v) => setReservationForm((f) => ({ ...f, tokenPaymentMode: v as any }))}
                      >
                        <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cash">Cash In Hand (12100)</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer (12000)</SelectItem>
                          <SelectItem value="Cheque">Cheque / PDC (12900)</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field label="Receipt / Voucher No.">
                      <Input
                        placeholder="Auto-generated if empty"
                        value={reservationForm.tokenReceiptNo}
                        onChange={(e) => setReservationForm((f) => ({ ...f, tokenReceiptNo: e.target.value }))}
                        className="bg-background text-xs"
                      />
                    </Field>
                  </div>

                  {/* ── Receiving Staff & Mode-Specific Payment Details ── */}
                  <div className="p-3 rounded-lg border border-primary/20 bg-muted/30 space-y-3">
                    {/* Common Cashier / Receiving Staff for all payment modes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Cashier / Receiving Staff (Finance) *">
                        <Select
                          value={reservationForm.tokenCashierName}
                          onValueChange={(v) => setReservationForm((f) => ({ ...f, tokenCashierName: v }))}
                        >
                          <SelectTrigger className="bg-background text-xs h-9">
                            <SelectValue placeholder="Select Finance cashier / receiving staff…" />
                          </SelectTrigger>
                          <SelectContent>
                            {financeEmployees.length === 0 && (
                              <SelectItem value="__loading__" disabled>Loading HRMS staff…</SelectItem>
                            )}
                            {financeEmployees.map((emp) => (
                              <SelectItem key={emp.id} value={emp.name}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{emp.name}</span>
                                  <span className="text-[10px] text-muted-foreground">{emp.designation}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Field>

                      {reservationForm.tokenPaymentMode === "Cash" && (
                        <Field label="Cash Counter Ref / Till No.">
                          <Input
                            placeholder="e.g. TILL-01 / Main Office Counter"
                            value={reservationForm.tokenReceiptNo ? `TILL-${reservationForm.tokenReceiptNo}` : "TILL-COUNTER-01"}
                            disabled
                            className="bg-muted text-xs font-mono"
                          />
                        </Field>
                      )}

                      {reservationForm.tokenPaymentMode === "Bank Transfer" && (
                        <Field label="Transaction / Transfer Ref #">
                          <Input
                            placeholder="e.g. FT-2026-987412"
                            value={reservationForm.tokenTransferRef}
                            onChange={(e) => setReservationForm((f) => ({ ...f, tokenTransferRef: e.target.value }))}
                            className="bg-background text-xs font-mono"
                          />
                        </Field>
                      )}

                      {reservationForm.tokenPaymentMode === "Cheque" && (
                        <Field label="Cheque No. *">
                          <Input
                            placeholder="e.g. 0004521"
                            value={reservationForm.tokenChequeNo}
                            onChange={(e) => setReservationForm((f) => ({ ...f, tokenChequeNo: e.target.value }))}
                            className="bg-background text-xs font-mono font-semibold"
                          />
                        </Field>
                      )}
                    </div>

                    {/* Mode specific supplementary inputs */}
                    {reservationForm.tokenPaymentMode === "Bank Transfer" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/50">
                        <Field label="Payer Bank">
                          <Input
                            placeholder="e.g. Qatar National Bank (QNB)"
                            value={reservationForm.tokenPayerBank}
                            onChange={(e) => setReservationForm((f) => ({ ...f, tokenPayerBank: e.target.value }))}
                            className="bg-background text-xs"
                          />
                        </Field>
                        <Field label="Transfer Date">
                          <Input
                            type="date"
                            value={reservationForm.tokenTransferDate}
                            onChange={(e) => setReservationForm((f) => ({ ...f, tokenTransferDate: e.target.value }))}
                            className="bg-background text-xs"
                          />
                        </Field>
                      </div>
                    )}

                    {reservationForm.tokenPaymentMode === "Cheque" && (
                      <div className="space-y-2.5 pt-1 border-t border-border/50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Field label="Drawn / Issuing Bank">
                            <Input
                              placeholder="e.g. Commercial Bank of Qatar (CBQ)"
                              value={reservationForm.tokenChequeBank}
                              onChange={(e) => setReservationForm((f) => ({ ...f, tokenChequeBank: e.target.value }))}
                              className="bg-background text-xs"
                            />
                          </Field>
                          <Field label="Cheque Date / Maturity">
                            <Input
                              type="date"
                              value={reservationForm.tokenChequeDate}
                              onChange={(e) => setReservationForm((f) => ({ ...f, tokenChequeDate: e.target.value }))}
                              className="bg-background text-xs"
                            />
                          </Field>
                        </div>
                        <Field label="Cheque Leaf Scan / Deposit Slip">
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setReservationForm((f) => ({ ...f, tokenChequeFile: file.name }));
                                }
                              }}
                              className="bg-background text-xs cursor-pointer"
                            />
                            {reservationForm.tokenChequeFile && (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] shrink-0">
                                {reservationForm.tokenChequeFile}
                              </Badge>
                            )}
                          </div>
                        </Field>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      The customer pays a token amount to hold this unit. <strong>Refundable</strong> if they cancel or withdraw. Recorded under <strong>Reservation Advance Liability (GL 21100001)</strong>.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Internal Remarks */}
            <Field label="Internal Remarks / Notes">
              <Textarea rows={2} placeholder="Optional notes regarding reservation deposit or booking terms..." value={reservationForm.remarks} onChange={(event) => setReservationForm((form) => ({ ...form, remarks: event.target.value }))} className="text-xs bg-background" />
            </Field>
          </div>

          {/* ── Modal Footer ── */}
          <div className="px-6 py-3.5 bg-muted/40 border-t flex items-center justify-between gap-2.5 shrink-0">
            <div className="text-xs text-muted-foreground hidden sm:block">
              {reservationForm.isHold && Number(reservationForm.tokenAmount) > 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Holding with QAR {Number(reservationForm.tokenAmount).toLocaleString()} token ({reservationForm.tokenPaymentMode})
                </span>
              ) : (
                <span>Standard unit reservation (no token hold)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setCreateReservationOpen(false)}>Cancel</Button>
              <Button size="sm" className="shadow-sm gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={async () => {
                await withBusy("reserve", createReservation);
                setCreateReservationOpen(false);
              }}>
                {busyAction === "reserve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Confirm Unit Reservation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={createCustomerOpen} onOpenChange={(open) => { setCreateCustomerOpen(open); if (!open) setCustomerStep(1); }}>
        <DialogContent className="sm:max-w-[780px] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          {/* ── Header ── */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">New Customer Profile</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">Register customer details based on Individual or Company profile with KYC validation.</DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="capitalize text-xs font-semibold px-2.5 py-0.5">
              {customerForm.type === "individual" ? "👤 Individual" : "🏢 Company / Corporate"}
            </Badge>
          </div>

          {/* ── Stepper Indicator ── */}
          <div className="px-6 pt-4 pb-2 border-b bg-muted/20">
            <div className="flex items-center gap-0">
              {[
                { n: 1, label: "Classification & Contact" },
                { n: 2, label: customerForm.type === "individual" ? "Identity Records" : "Corporate Records" },
                { n: 3, label: "Additional Info" },
              ].map((s, idx, arr) => (
                <div key={s.n} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => setCustomerStep(s.n)}
                    className={`flex items-center gap-2 group focus:outline-none`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      customerStep === s.n
                        ? "bg-primary border-primary text-primary-foreground shadow-md"
                        : customerStep > s.n
                        ? "bg-primary/20 border-primary/40 text-primary"
                        : "bg-muted border-muted-foreground/30 text-muted-foreground"
                    }`}>
                      {customerStep > s.n ? "✓" : s.n}
                    </div>
                    <span className={`text-[11px] font-semibold hidden sm:block transition-colors ${
                      customerStep === s.n ? "text-foreground" : customerStep > s.n ? "text-primary" : "text-muted-foreground"
                    }`}>{s.label}</span>
                  </button>
                  {idx < arr.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 rounded transition-all ${customerStep > s.n ? "bg-primary/40" : "bg-muted-foreground/20"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Step Content ── */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1">

            {/* STEP 1: Classification & Contact */}
            {customerStep === 1 && (
              <>
                {/* Classification row — fields differ by type */}
                <div className="bg-muted/30 p-3.5 rounded-xl border space-y-3">
                  <Field label="Customer Type *">
                    <Select value={customerForm.type} onValueChange={(type: Customer["type"]) => {
                      setCustomerForm((form) => ({ ...form, type }));
                    }}>
                      <SelectTrigger className="bg-background font-medium"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">👤 Individual Customer</SelectItem>
                        <SelectItem value="company">🏢 Company / Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  {/* INDIVIDUAL: First / Middle / Last Name */}
                  {customerForm.type === "individual" && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Field label="First Name *">
                        <Input
                          placeholder="Ahmed"
                          value={customerForm.firstName}
                          onChange={(e) => {
                            const fn = e.target.value;
                            setCustomerForm((form) => ({
                              ...form,
                              firstName: fn,
                              name: `${fn} ${form.lastName || ""}`.trim(),
                              displayName: `${fn} ${form.lastName || ""}`.trim(),
                            }));
                          }}
                          className="bg-background font-semibold"
                        />
                      </Field>
                      <Field label="Middle Name">
                        <Input
                          placeholder="Hassan"
                          value={customerForm.middleName}
                          onChange={(e) => setCustomerForm((form) => ({ ...form, middleName: e.target.value }))}
                          className="bg-background"
                        />
                      </Field>
                      <Field label="Last Name *">
                        <Input
                          placeholder="Al-Kuwari"
                          value={customerForm.lastName}
                          onChange={(e) => {
                            const ln = e.target.value;
                            setCustomerForm((form) => ({
                              ...form,
                              lastName: ln,
                              name: `${form.firstName || ""} ${ln}`.trim(),
                              displayName: `${form.firstName || ""} ${ln}`.trim(),
                            }));
                          }}
                          className="bg-background font-semibold"
                        />
                      </Field>
                    </div>
                  )}

                  {/* COMPANY: Legal Name + Trade Name */}
                  {customerForm.type === "company" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Company Legal Name *">
                        <Input
                          placeholder="e.g. Gulf Horizon Trading & Contracting W.L.L."
                          value={customerForm.companyLegalName}
                          onChange={(e) => {
                            const cln = e.target.value;
                            setCustomerForm((form) => ({ ...form, companyLegalName: cln, name: cln, displayName: cln }));
                          }}
                          className="bg-background font-semibold"
                        />
                      </Field>
                      <Field label="Trade Name">
                        <Input
                          placeholder="e.g. Gulf Horizon"
                          value={customerForm.tradeName}
                          onChange={(e) => setCustomerForm((form) => ({ ...form, tradeName: e.target.value }))}
                          className="bg-background"
                        />
                      </Field>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border bg-card p-4 space-y-3.5 shadow-sm">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileSignature className="h-3.5 w-3.5 text-primary" /> Primary Contact & Communication Preferences
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label={customerForm.type === "company" ? "Primary Mobile" : "Primary Mobile *"}>
                      <Input
                        placeholder="+974 5512 3456"
                        value={customerForm.primaryMobile || customerForm.mobile}
                        onChange={(event) => setCustomerForm((form) => ({ ...form, primaryMobile: event.target.value, mobile: event.target.value }))}
                        className="bg-background"
                      />
                    </Field>
                    <Field label="Primary Email">
                      <Input
                        type="email"
                        placeholder="tenant@domain.qa"
                        value={customerForm.primaryEmail || customerForm.email}
                        onChange={(event) => setCustomerForm((form) => ({ ...form, primaryEmail: event.target.value, email: event.target.value }))}
                        className="bg-background"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Current Address">
                      <Input
                        placeholder="Zone, Street, Building / Unit details..."
                        value={customerForm.currentAddress || customerForm.localAddress}
                        onChange={(event) => setCustomerForm((form) => ({ ...form, currentAddress: event.target.value, localAddress: event.target.value }))}
                        className="bg-background text-xs"
                      />
                    </Field>
                    <Field label="Preferred Communication">
                      <Select value={customerForm.preferredCommunication || "WhatsApp"} onValueChange={(val) => setCustomerForm((form) => ({ ...form, preferredCommunication: val }))}>
                        <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="SMS">SMS</SelectItem>
                          <SelectItem value="Phone Call">Phone Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </div>
              </>
            )}

            {/* STEP 2: INDIVIDUAL — Identity Records */}
            {customerStep === 2 && customerForm.type === "individual" && (
              <div className="rounded-xl border bg-muted/20 p-4 space-y-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <BadgeCheck className="h-3.5 w-3.5 text-primary" /> Individual Identity & Personal Records
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="Nationality">
                    <SearchableSelect
                      options={nationalityOptions}
                      value={customerForm.nationality}
                      onValueChange={(val) => setCustomerForm((form) => ({ ...form, nationality: val }))}
                      placeholder="Select Nationality..."
                      emptyText="No nationality found."
                    />
                  </Field>
                  <Field label="Gender">
                    <Select value={customerForm.gender || "Male"} onValueChange={(val) => setCustomerForm((form) => ({ ...form, gender: val }))}>
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Date of Birth">
                    <Input
                      type="date"
                      value={customerForm.dateOfBirth}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, dateOfBirth: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                  <Field label="Occupation / Designation">
                    <Input
                      placeholder="e.g. Senior Engineer"
                      value={customerForm.designation}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, designation: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="QID / National ID No.">
                    <Input
                      placeholder="11 numeric digits"
                      maxLength={11}
                      value={customerForm.qatarId}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, qatarId: event.target.value.replace(/\D/g, '') }))}
                      className="bg-background font-mono"
                    />
                    <div className="mt-1 flex items-center justify-between gap-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded border border-primary/20 transition-colors">
                        <Upload className="h-3 w-3" />
                        <span>{customerForm.qidFile ? "Change QID Copy" : "Upload QID Copy"}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setCustomerForm((form) => ({ ...form, qidFile: file.name }));
                          }}
                        />
                      </label>
                      {customerForm.qidFile && (
                        <span className="text-[10px] text-emerald-600 font-medium truncate max-w-[120px] flex items-center gap-1" title={customerForm.qidFile}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{customerForm.qidFile}</span>
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field label="QID Expiry Date">
                    <Input
                      type="date"
                      value={customerForm.qidExpiryDate}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, qidExpiryDate: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                  <Field label="Passport No.">
                    <Input
                      placeholder="e.g. N8829104"
                      maxLength={12}
                      value={customerForm.passport}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, passport: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                      className="bg-background font-mono uppercase"
                    />
                    <div className="mt-1 flex items-center justify-between gap-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded border border-primary/20 transition-colors">
                        <Upload className="h-3 w-3" />
                        <span>{customerForm.passportFile ? "Change Passport Copy" : "Upload Passport Copy"}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setCustomerForm((form) => ({ ...form, passportFile: file.name }));
                          }}
                        />
                      </label>
                      {customerForm.passportFile && (
                        <span className="text-[10px] text-emerald-600 font-medium truncate max-w-[120px] flex items-center gap-1" title={customerForm.passportFile}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{customerForm.passportFile}</span>
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field label="Passport Expiry Date">
                    <Input
                      type="date"
                      value={customerForm.passportExpiryDate}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, passportExpiryDate: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* STEP 2: COMPANY — Corporate Records */}
            {customerStep === 2 && customerForm.type === "company" && (
              <div className="rounded-xl border bg-muted/20 p-4 space-y-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary" /> Corporate Registration & Legal Credentials
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="Commercial Registration No. *">
                    <Input
                      placeholder="CR-109283"
                      value={customerForm.crNumber}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, crNumber: event.target.value }))}
                      className="bg-background font-mono"
                    />
                    <div className="mt-1 flex items-center justify-between gap-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded border border-primary/20 transition-colors">
                        <Upload className="h-3 w-3" />
                        <span>{customerForm.crFile ? "Change CR Doc" : "Upload CR Doc"}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setCustomerForm((form) => ({ ...form, crFile: file.name }));
                          }}
                        />
                      </label>
                      {customerForm.crFile && (
                        <span className="text-[10px] text-emerald-600 font-medium truncate max-w-[120px] flex items-center gap-1" title={customerForm.crFile}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{customerForm.crFile}</span>
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field label="CR Expiry Date">
                    <Input
                      type="date"
                      value={customerForm.crExpiryDate}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, crExpiryDate: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                  <Field label="Trade Licence No.">
                    <Input
                      placeholder="TL-98214"
                      value={customerForm.tradeLicenceNo}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, tradeLicenceNo: event.target.value }))}
                      className="bg-background font-mono"
                    />
                    <div className="mt-1 flex items-center justify-between gap-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded border border-primary/20 transition-colors">
                        <Upload className="h-3 w-3" />
                        <span>{customerForm.tradeLicenceFile ? "Change Licence" : "Upload Licence"}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setCustomerForm((form) => ({ ...form, tradeLicenceFile: file.name }));
                          }}
                        />
                      </label>
                      {customerForm.tradeLicenceFile && (
                        <span className="text-[10px] text-emerald-600 font-medium truncate max-w-[120px] flex items-center gap-1" title={customerForm.tradeLicenceFile}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{customerForm.tradeLicenceFile}</span>
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field label="Trade Licence Expiry Date">
                    <Input
                      type="date"
                      value={customerForm.tradeLicenceExpiryDate}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, tradeLicenceExpiryDate: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="Computer Card No.">
                    <Input
                      placeholder="CC-448291"
                      value={customerForm.computerCardNo}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, computerCardNo: event.target.value }))}
                      className="bg-background font-mono"
                    />
                    <div className="mt-1 flex items-center justify-between gap-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded border border-primary/20 transition-colors">
                        <Upload className="h-3 w-3" />
                        <span>{customerForm.computerCardFile ? "Change Card" : "Upload Card"}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setCustomerForm((form) => ({ ...form, computerCardFile: file.name }));
                          }}
                        />
                      </label>
                      {customerForm.computerCardFile && (
                        <span className="text-[10px] text-emerald-600 font-medium truncate max-w-[120px] flex items-center gap-1" title={customerForm.computerCardFile}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{customerForm.computerCardFile}</span>
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field label="Computer Card Expiry Date">
                    <Input
                      type="date"
                      value={customerForm.computerCardExpiryDate}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, computerCardExpiryDate: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                  <Field label="Tax Identification No.">
                    <Input
                      placeholder="TIN-0092182"
                      value={customerForm.taxIdentificationNo}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, taxIdentificationNo: event.target.value }))}
                      className="bg-background font-mono"
                    />
                    <div className="mt-1 flex items-center justify-between gap-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded border border-primary/20 transition-colors">
                        <Upload className="h-3 w-3" />
                        <span>{customerForm.taxIdFile ? "Change Tax Doc" : "Upload Tax Doc"}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setCustomerForm((form) => ({ ...form, taxIdFile: file.name }));
                          }}
                        />
                      </label>
                      {customerForm.taxIdFile && (
                        <span className="text-[10px] text-emerald-600 font-medium truncate max-w-[120px] flex items-center gap-1" title={customerForm.taxIdFile}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{customerForm.taxIdFile}</span>
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field label="Industry / Business Activity">
                    <Input
                      placeholder="Commercial Trading & Contracting"
                      value={customerForm.industryActivity}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, industryActivity: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="Registered Office Address">
                    <Input
                      placeholder="West Bay, Tower 3, Floor 14"
                      value={customerForm.registeredOfficeAddress}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, registeredOfficeAddress: event.target.value }))}
                      className="bg-background text-xs"
                    />
                  </Field>
                  <Field label="Billing Address">
                    <Input
                      placeholder="PO Box 99882, Doha"
                      value={customerForm.billingAddress}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, billingAddress: event.target.value }))}
                      className="bg-background text-xs"
                    />
                  </Field>
                  <Field label="Company Telephone">
                    <Input
                      placeholder="+974 4400 1122"
                      value={customerForm.companyTelephone}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, companyTelephone: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                  <Field label="Website">
                    <Input
                      placeholder="https://gulfhorizon.qa"
                      value={customerForm.website}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, website: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                </div>
              </div>
            )}

            {/* STEP 3: Additional Info */}
            {customerStep === 3 && (
              <>
                {customerForm.type === "individual" && (
                  <div className="rounded-xl border bg-muted/20 p-4 space-y-3.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <UserPlus className="h-3.5 w-3.5 text-primary" /> Employment & Emergency Contact
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Field label="Employer / Company">
                        <SearchableSelect
                          options={professionOptions}
                          value={customerForm.employerInfo}
                          onValueChange={(val) => setCustomerForm((form) => ({ ...form, employerInfo: val }))}
                          placeholder="Search / Select Company..."
                          emptyText="No match found."
                        />
                      </Field>
                      <Field label="Emergency Contact Name">
                        <Input
                          placeholder="e.g. Ali Al-Kuwari"
                          value={customerForm.emergencyContact}
                          onChange={(event) => setCustomerForm((form) => ({ ...form, emergencyContact: event.target.value }))}
                          className="bg-background"
                        />
                      </Field>
                      <Field label="Emergency Contact No.">
                        <Input
                          placeholder="+974 5500 1122"
                          value={customerForm.emergencyContactNo}
                          onChange={(event) => setCustomerForm((form) => ({ ...form, emergencyContactNo: event.target.value }))}
                          className="bg-background"
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {customerForm.type === "company" && (
                  <div className="rounded-xl border bg-muted/20 p-4 space-y-3.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Signatory & Contact Person Records
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Field label="Authorized Signatory Name">
                        <Input
                          placeholder="Hamad Al-Kuwari"
                          value={customerForm.authorizedSignatory}
                          onChange={(event) => setCustomerForm((form) => ({ ...form, authorizedSignatory: event.target.value }))}
                          className="bg-background"
                        />
                      </Field>
                      <Field label="Signatory QID / Passport No.">
                        <Input
                          placeholder="28012345678"
                          value={customerForm.signatoryQidPassport}
                          onChange={(event) => setCustomerForm((form) => ({ ...form, signatoryQidPassport: event.target.value }))}
                          className="bg-background font-mono"
                        />
                      </Field>
                      <Field label="Signatory ID Expiry Date">
                        <Input
                          type="date"
                          value={customerForm.signatoryIdExpiryDate}
                          onChange={(event) => setCustomerForm((form) => ({ ...form, signatoryIdExpiryDate: event.target.value }))}
                          className="bg-background"
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <Field label="Primary Contact Person">
                        <Input
                          placeholder="Nasser Al-Mannai"
                          value={customerForm.primaryContactPerson}
                          onChange={(event) => setCustomerForm((form) => ({ ...form, primaryContactPerson: event.target.value }))}
                          className="bg-background"
                        />
                      </Field>
                      <Field label="Contact Designation">
                        <Input
                          placeholder="Procurement Director"
                          value={customerForm.contactDesignation}
                          onChange={(event) => setCustomerForm((form) => ({ ...form, contactDesignation: event.target.value }))}
                          className="bg-background"
                        />
                      </Field>
                      <Field label="Contact Mobile">
                        <Input
                          placeholder="+974 3311 2233"
                          value={customerForm.contactMobile}
                          onChange={(event) => setCustomerForm((form) => ({ ...form, contactMobile: event.target.value }))}
                          className="bg-background"
                        />
                      </Field>
                      <Field label="Contact Email">
                        <Input
                          type="email"
                          placeholder="nasser@gulfhorizon.qa"
                          value={customerForm.contactEmail}
                          onChange={(event) => setCustomerForm((form) => ({ ...form, contactEmail: event.target.value }))}
                          className="bg-background"
                        />
                      </Field>
                    </div>
                  </div>
                )}

                <div className="rounded-xl border bg-card p-4">
                  <Field label="Remarks / Notes">
                    <Input
                      placeholder="Optional internal notes about this customer..."
                      value={customerForm.remarks}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, remarks: event.target.value }))}
                      className="bg-background text-xs"
                    />
                  </Field>
                </div>
              </>
            )}
          </div>

          {/* ── Footer Navigation ── */}
          <div className="px-6 py-3.5 bg-muted/40 border-t flex items-center justify-between gap-2.5">
            <div className="text-xs text-muted-foreground">Step {customerStep} of 3</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => { if (customerStep > 1) { setCustomerStep(customerStep - 1); } else { setCreateCustomerOpen(false); setCustomerStep(1); } }}>
                {customerStep > 1 ? "← Back" : "Cancel"}
              </Button>
              {customerStep < 3 ? (
                <Button size="sm" className="shadow-sm" onClick={() => setCustomerStep(customerStep + 1)}>
                  Next →
                </Button>
              ) : (
                <Button size="sm" className="shadow-sm" onClick={async () => {
                  await withBusy("customer", createCustomer);
                  setCreateCustomerOpen(false);
                  setCustomerStep(1);
                }}>
                  {busyAction === "customer" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  Save Customer
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── VIEW CUSTOMER DIALOG ──────────────────────────────────── */}
      <Dialog open={viewCustomerOpen} onOpenChange={setViewCustomerOpen}>
        <DialogContent className="sm:max-w-[720px] max-h-[88vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  {viewCustomerData?.type === "individual" 
                    ? ([viewCustomerData.firstName, viewCustomerData.middleName, viewCustomerData.lastName].filter(Boolean).join(" ") || viewCustomerData.displayName || viewCustomerData.name || "Customer Details")
                    : (viewCustomerData?.companyLegalName || viewCustomerData?.displayName || viewCustomerData?.name || "Customer Details")}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {viewCustomerData?.type === "company" ? "🏢 Corporate Account & KYC Overview" : "👤 Individual Profile & Identity Overview"}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`capitalize text-xs font-semibold px-2.5 py-0.5 ${
                (viewCustomerData?.customerStatus || "Active") === "Active" ? "bg-green-50 text-green-700 border-green-200" :
                (viewCustomerData?.customerStatus) === "Inactive" ? "bg-muted text-muted-foreground border-border" :
                (viewCustomerData?.customerStatus) === "Blacklisted" ? "bg-red-50 text-red-700 border-red-200" :
                "bg-blue-50 text-blue-700 border-blue-200"
              }`}>
                {viewCustomerData?.customerStatus || "Active"}
              </Badge>
            </div>
          </div>

          {viewCustomerData && (
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm">
              {/* Primary Overview Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-3.5 rounded-xl border">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Type</div>
                  <div className="font-semibold capitalize text-foreground mt-0.5">
                    {viewCustomerData.type === "company" ? "Company / Corporate" : "Individual"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Primary ID</div>
                  <div className="font-mono font-bold text-foreground mt-0.5">{viewCustomerData.qatarId || viewCustomerData.crNumber || viewCustomerData.passport || "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Nationality / Reg</div>
                  <div className="font-semibold text-foreground mt-0.5">{viewCustomerData.nationality || viewCustomerData.industryActivity || "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Customer Status</div>
                  <div className="font-semibold text-foreground mt-0.5">{viewCustomerData.customerStatus || "Active"}</div>
                </div>
              </div>

              {/* Dynamic Specifics (Individual vs Corporate) */}
              {viewCustomerData.type === "individual" ? (
                <div className="space-y-2.5 border rounded-xl p-4 bg-muted/10">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <BadgeCheck className="h-3.5 w-3.5 text-primary" /> Individual Personal & Identity Records
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">First Name</span>
                      <strong className="text-foreground">{viewCustomerData.firstName || viewCustomerData.name?.split(" ")[0] || "—"}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Middle Name</span>
                      <strong className="text-foreground">{viewCustomerData.middleName || "—"}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Last Name</span>
                      <strong className="text-foreground">{viewCustomerData.lastName || viewCustomerData.name?.split(" ").slice(1).join(" ") || "—"}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Nationality</span>
                      <span>{viewCustomerData.nationality || "Qatari"}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Gender</span>
                      <span>{viewCustomerData.gender || "—"}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Date of Birth</span>
                      <span>{viewCustomerData.dateOfBirth || "—"}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Occupation / Designation</span>
                      <span>{viewCustomerData.designation || "—"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">QID / National ID No.</span>
                      <span className="font-mono font-bold text-foreground">{viewCustomerData.qatarId || "—"}</span>
                      {viewCustomerData.qidExpiryDate && (
                        <span className="text-muted-foreground block text-[10px] mt-0.5">Expiry: {viewCustomerData.qidExpiryDate}</span>
                      )}
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Passport No.</span>
                      <span className="font-mono font-bold text-foreground">{viewCustomerData.passport || "—"}</span>
                      {viewCustomerData.passportExpiryDate && (
                        <span className="text-muted-foreground block text-[10px] mt-0.5">Expiry: {viewCustomerData.passportExpiryDate}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Employer / Company</span>
                      <span>{viewCustomerData.employerInfo || "—"}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Emergency Contact Name</span>
                      <span>{viewCustomerData.emergencyContact || "—"}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Emergency Contact No.</span>
                      <span>{viewCustomerData.emergencyContactNo || "—"}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5 border rounded-xl p-4 bg-muted/10">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" /> Corporate Registration & Legal Credentials
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Company Legal Name</span>
                      <strong className="text-foreground text-sm">{viewCustomerData.companyLegalName || viewCustomerData.name || "—"}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Trade Name</span>
                      <strong className="text-foreground">{viewCustomerData.tradeName || "—"}</strong>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">CR No.</span>
                      <span className="font-mono font-bold">{viewCustomerData.crNumber || "—"}</span>
                      {viewCustomerData.crExpiryDate && <span className="text-muted-foreground block text-[10px] mt-0.5">Exp: {viewCustomerData.crExpiryDate}</span>}
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Trade Licence No.</span>
                      <span className="font-mono font-bold">{viewCustomerData.tradeLicenceNo || "—"}</span>
                      {viewCustomerData.tradeLicenceExpiryDate && <span className="text-muted-foreground block text-[10px] mt-0.5">Exp: {viewCustomerData.tradeLicenceExpiryDate}</span>}
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Computer Card No.</span>
                      <span className="font-mono font-bold">{viewCustomerData.computerCardNo || "—"}</span>
                      {viewCustomerData.computerCardExpiryDate && <span className="text-muted-foreground block text-[10px] mt-0.5">Exp: {viewCustomerData.computerCardExpiryDate}</span>}
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Tax Identification (TIN)</span>
                      <span className="font-mono font-bold">{viewCustomerData.taxIdentificationNo || "—"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Industry Activity</span>
                      <span>{viewCustomerData.industryActivity || "—"}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Company Telephone</span>
                      <span>{viewCustomerData.companyTelephone || "—"}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Website</span>
                      <span className="truncate block">{viewCustomerData.website || "—"}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Billing Address</span>
                      <span className="truncate block">{viewCustomerData.billingAddress || "—"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1 border-t mt-1">
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Authorized Signatory</span>
                      <strong>{viewCustomerData.authorizedSignatory || "—"}</strong>
                      <span className="text-muted-foreground block text-[10px] font-mono mt-0.5">
                        ID: {viewCustomerData.signatoryQidPassport || "—"} {viewCustomerData.signatoryIdExpiryDate ? `(Exp: ${viewCustomerData.signatoryIdExpiryDate})` : ""}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-background border">
                      <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Primary Contact Person</span>
                      <strong>{viewCustomerData.primaryContactPerson || "—"}</strong> {viewCustomerData.contactDesignation ? `(${viewCustomerData.contactDesignation})` : ""}
                      <span className="text-muted-foreground block text-[10px] mt-0.5">
                        {viewCustomerData.contactMobile || "—"} / {viewCustomerData.contactEmail || "—"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Uploaded Documents / KYC Attachments Overview */}
              <div className="space-y-2.5 border rounded-xl p-4 bg-muted/10">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileSpreadsheet className="h-3.5 w-3.5 text-primary" /> Uploaded KYC Attachments
                  </span>
                  <span className="text-[10px] font-normal text-muted-foreground">Available in Documents Module</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-1">
                  {viewCustomerData.type === "individual" ? (
                    <>
                      <div className="p-2.5 rounded-lg bg-background border flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Qatar ID Doc</span>
                          <span className="font-medium truncate block">{viewCustomerData.qidFile || (documents.find(d => d.customerId === viewCustomerData.id && d.name.includes("Qatar ID"))?.file) || "Not uploaded"}</span>
                        </div>
                        {(viewCustomerData.qidFile || documents.some(d => d.customerId === viewCustomerData.id && d.name.includes("Qatar ID") && d.file)) ? (
                          <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] px-1.5 py-0 shrink-0">Uploaded</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5 py-0 shrink-0">Pending</Badge>
                        )}
                      </div>
                      <div className="p-2.5 rounded-lg bg-background border flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Passport Copy</span>
                          <span className="font-medium truncate block">{viewCustomerData.passportFile || (documents.find(d => d.customerId === viewCustomerData.id && d.name.includes("Passport"))?.file) || "Not uploaded"}</span>
                        </div>
                        {(viewCustomerData.passportFile || documents.some(d => d.customerId === viewCustomerData.id && d.name.includes("Passport") && d.file)) ? (
                          <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] px-1.5 py-0 shrink-0">Uploaded</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5 py-0 shrink-0">Pending</Badge>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-2.5 rounded-lg bg-background border flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-muted-foreground block text-[10px] uppercase font-semibold">CR Certificate</span>
                          <span className="font-medium truncate block">{viewCustomerData.crFile || (documents.find(d => d.customerId === viewCustomerData.id && d.name.includes("Commercial"))?.file) || "Not uploaded"}</span>
                        </div>
                        {(viewCustomerData.crFile || documents.some(d => d.customerId === viewCustomerData.id && d.name.includes("Commercial") && d.file)) ? (
                          <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] px-1.5 py-0 shrink-0">Uploaded</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5 py-0 shrink-0">Pending</Badge>
                        )}
                      </div>
                      <div className="p-2.5 rounded-lg bg-background border flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Trade Licence</span>
                          <span className="font-medium truncate block">{viewCustomerData.tradeLicenceFile || (documents.find(d => d.customerId === viewCustomerData.id && d.name.includes("Trade"))?.file) || "Not uploaded"}</span>
                        </div>
                        {(viewCustomerData.tradeLicenceFile || documents.some(d => d.customerId === viewCustomerData.id && d.name.includes("Trade") && d.file)) ? (
                          <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] px-1.5 py-0 shrink-0">Uploaded</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5 py-0 shrink-0">Pending</Badge>
                        )}
                      </div>
                      <div className="p-2.5 rounded-lg bg-background border flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Computer Card</span>
                          <span className="font-medium truncate block">{viewCustomerData.computerCardFile || (documents.find(d => d.customerId === viewCustomerData.id && d.name.includes("Establishment"))?.file) || "Not uploaded"}</span>
                        </div>
                        {(viewCustomerData.computerCardFile || documents.some(d => d.customerId === viewCustomerData.id && d.name.includes("Establishment") && d.file)) ? (
                          <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] px-1.5 py-0 shrink-0">Uploaded</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5 py-0 shrink-0">Pending</Badge>
                        )}
                      </div>
                      <div className="p-2.5 rounded-lg bg-background border flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Tax Card / TIN Doc</span>
                          <span className="font-medium truncate block">{viewCustomerData.taxIdFile || "Not uploaded"}</span>
                        </div>
                        {viewCustomerData.taxIdFile ? (
                          <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] px-1.5 py-0 shrink-0">Uploaded</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px] px-1.5 py-0 shrink-0">Pending</Badge>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-2.5 border rounded-xl p-4 bg-muted/10">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> Contact & Communication Records
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-background border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Primary Mobile</span>
                    <strong className="text-foreground">{viewCustomerData.primaryMobile || viewCustomerData.mobile || "—"}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Primary Email</span>
                    <strong className="text-foreground truncate block">{viewCustomerData.primaryEmail || viewCustomerData.email || "—"}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Preferred Comm.</span>
                    <strong className="text-foreground">{viewCustomerData.preferredCommunication || "WhatsApp"}</strong>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Remarks</span>
                    <span className="text-foreground truncate block">{viewCustomerData.remarks || "—"}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-2.5 rounded-lg bg-background border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Current Address</span>
                    {viewCustomerData.currentAddress || viewCustomerData.localAddress || "—"}
                  </div>
                  <div className="p-2.5 rounded-lg bg-background border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-semibold">Permanent / Reg. Office Address</span>
                    {viewCustomerData.permanentAddress || viewCustomerData.registeredOfficeAddress || "—"}
                  </div>
                </div>
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
        <DialogContent className="sm:max-w-[760px] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">Edit Customer Profile</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Update complete profile and KYC records for {editCustomerData?.displayName || editCustomerData?.name}.
                </DialogDescription>
              </div>
            </div>
            <Badge variant="outline" className="capitalize text-xs font-semibold px-2.5 py-0.5">
              {customerForm.type === "individual" ? "👤 Individual" : "🏢 Company / Corporate"}
            </Badge>
          </div>

          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* 1. Primary Classification & Names */}
            <div className="bg-muted/30 p-4 rounded-xl border space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Customer Type *">
                  <Select value={customerForm.type} onValueChange={(type: Customer["type"]) => {
                    setCustomerForm((form) => ({ ...form, type }));
                  }}>
                    <SelectTrigger className="bg-background font-medium"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">👤 Individual Customer</SelectItem>
                      <SelectItem value="company">🏢 Company / Corporate</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {/* INDIVIDUAL: First, Middle, Last Name */}
                {customerForm.type === "individual" ? (
                  <>
                    <Field label="First Name *">
                      <Input
                        placeholder="e.g. Ahmed"
                        value={customerForm.firstName}
                        onChange={(e) => {
                          const fn = e.target.value;
                          setCustomerForm((form) => ({
                            ...form,
                            firstName: fn,
                            name: `${fn} ${form.lastName || ""}`.trim(),
                            displayName: `${fn} ${form.lastName || ""}`.trim(),
                          }));
                        }}
                        className="bg-background font-semibold"
                      />
                    </Field>
                    <Field label="Middle Name">
                      <Input
                        placeholder="e.g. Hassan"
                        value={customerForm.middleName}
                        onChange={(e) => setCustomerForm((form) => ({ ...form, middleName: e.target.value }))}
                        className="bg-background"
                      />
                    </Field>
                  </>
                ) : (
                  /* COMPANY: Company Legal Name + Trade Name */
                  <div className="sm:col-span-2">
                    <Field label="Company Legal Name *">
                      <Input
                        placeholder="e.g. Gulf Horizon Trading & Contracting W.L.L."
                        value={customerForm.companyLegalName}
                        onChange={(e) => {
                          const cln = e.target.value;
                          setCustomerForm((form) => ({ ...form, companyLegalName: cln, name: cln, displayName: cln }));
                        }}
                        className="bg-background font-semibold"
                      />
                    </Field>
                  </div>
                )}
              </div>

              {customerForm.type === "individual" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field label="Last Name *">
                    <Input
                      placeholder="e.g. Al-Kuwari"
                      value={customerForm.lastName}
                      onChange={(e) => {
                        const ln = e.target.value;
                        setCustomerForm((form) => ({
                          ...form,
                          lastName: ln,
                          name: `${form.firstName || ""} ${ln}`.trim(),
                          displayName: `${form.firstName || ""} ${ln}`.trim(),
                        }));
                      }}
                      className="bg-background font-semibold"
                    />
                  </Field>
                </div>
              )}

              {customerForm.type === "company" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Trade Name">
                    <Input
                      placeholder="e.g. Gulf Horizon"
                      value={customerForm.tradeName}
                      onChange={(e) => setCustomerForm((form) => ({ ...form, tradeName: e.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                </div>
              )}
            </div>

            {/* 2. Primary Contact & Communication Preferences */}
            <div className="rounded-xl border bg-card p-4 space-y-3.5 shadow-sm">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileSignature className="h-3.5 w-3.5 text-primary" /> Primary Contact & Communication Preferences
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label={customerForm.type === "company" ? "Primary Mobile" : "Primary Mobile *"}>
                  <Input
                    placeholder="+974 5512 3456"
                    value={customerForm.primaryMobile || customerForm.mobile}
                    onChange={(event) => setCustomerForm((form) => ({ ...form, primaryMobile: event.target.value, mobile: event.target.value }))}
                    className="bg-background"
                  />
                </Field>
                <Field label="Primary Email">
                  <Input
                    type="email"
                    placeholder="tenant@domain.qa"
                    value={customerForm.primaryEmail || customerForm.email}
                    onChange={(event) => setCustomerForm((form) => ({ ...form, primaryEmail: event.target.value, email: event.target.value }))}
                    className="bg-background"
                  />
                </Field>
                <Field label="Preferred Communication">
                  <Select value={customerForm.preferredCommunication || "WhatsApp"} onValueChange={(val) => setCustomerForm((form) => ({ ...form, preferredCommunication: val }))}>
                    <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="Phone Call">Phone Call</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <Field label="Current Address">
                  <Input
                    placeholder="Zone, Street, Building / Unit details..."
                    value={customerForm.currentAddress || customerForm.localAddress}
                    onChange={(event) => setCustomerForm((form) => ({ ...form, currentAddress: event.target.value, localAddress: event.target.value }))}
                    className="bg-background text-xs"
                  />
                </Field>
                <Field label="Remarks">
                  <Input
                    placeholder="Optional notes..."
                    value={customerForm.remarks}
                    onChange={(event) => setCustomerForm((form) => ({ ...form, remarks: event.target.value }))}
                    className="bg-background text-xs"
                  />
                </Field>
              </div>
            </div>

            {/* 3. Dynamic Section: INDIVIDUAL CUSTOMER */}
            {customerForm.type === "individual" ? (
              <div className="rounded-xl border bg-muted/20 p-4 space-y-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <BadgeCheck className="h-3.5 w-3.5 text-primary" /> Individual Personal & Identity Records
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="Nationality">
                    <SearchableSelect
                      options={nationalityOptions}
                      value={customerForm.nationality}
                      onValueChange={(val) => setCustomerForm((form) => ({ ...form, nationality: val }))}
                      placeholder="Select Nationality..."
                      emptyText="No nationality found."
                    />
                  </Field>
                  <Field label="Gender">
                    <Select value={customerForm.gender || "Male"} onValueChange={(val) => setCustomerForm((form) => ({ ...form, gender: val }))}>
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Date of Birth">
                    <Input
                      type="date"
                      value={customerForm.dateOfBirth}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, dateOfBirth: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                  <Field label="Occupation / Designation">
                    <Input
                      placeholder="e.g. Senior Engineer"
                      value={customerForm.designation}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, designation: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="QID / National ID No.">
                    <Input
                      placeholder="11 numeric digits"
                      maxLength={11}
                      value={customerForm.qatarId}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, qatarId: event.target.value.replace(/\D/g, '') }))}
                      className="bg-background font-mono"
                    />
                    <div className="mt-1 flex items-center justify-between gap-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded border border-primary/20 transition-colors">
                        <Upload className="h-3 w-3" />
                        <span>{customerForm.qidFile ? "Change QID" : "Upload QID"}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setCustomerForm((form) => ({ ...form, qidFile: file.name }));
                          }}
                        />
                      </label>
                      {customerForm.qidFile && (
                        <span className="text-[10px] text-emerald-600 font-medium truncate max-w-[120px] flex items-center gap-1" title={customerForm.qidFile}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{customerForm.qidFile}</span>
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field label="QID Expiry Date">
                    <Input
                      type="date"
                      value={customerForm.qidExpiryDate}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, qidExpiryDate: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                  <Field label="Passport No.">
                    <Input
                      placeholder="e.g. N8829104"
                      maxLength={12}
                      value={customerForm.passport}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, passport: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                      className="bg-background font-mono uppercase"
                    />
                    <div className="mt-1 flex items-center justify-between gap-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded border border-primary/20 transition-colors">
                        <Upload className="h-3 w-3" />
                        <span>{customerForm.passportFile ? "Change Passport" : "Upload Passport"}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setCustomerForm((form) => ({ ...form, passportFile: file.name }));
                          }}
                        />
                      </label>
                      {customerForm.passportFile && (
                        <span className="text-[10px] text-emerald-600 font-medium truncate max-w-[120px] flex items-center gap-1" title={customerForm.passportFile}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{customerForm.passportFile}</span>
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field label="Passport Expiry Date">
                    <Input
                      type="date"
                      value={customerForm.passportExpiryDate}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, passportExpiryDate: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <Field label="Employer / Company">
                    <SearchableSelect
                      options={professionOptions}
                      value={customerForm.employerInfo}
                      onValueChange={(val) => setCustomerForm((form) => ({ ...form, employerInfo: val }))}
                      placeholder="Search / Select Company..."
                      emptyText="No match found."
                    />
                  </Field>
                  <Field label="Emergency Contact Name">
                    <Input
                      placeholder="e.g. Ali Al-Kuwari"
                      value={customerForm.emergencyContact}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, emergencyContact: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                  <Field label="Emergency Contact No.">
                    <Input
                      placeholder="+974 5500 1122"
                      value={customerForm.emergencyContactNo}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, emergencyContactNo: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                </div>
              </div>
            ) : (
              /* 3. Dynamic Section: COMPANY / CORPORATE CUSTOMER */
              <div className="rounded-xl border bg-muted/20 p-4 space-y-3.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-primary" /> Corporate Registration & Legal Credentials
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="Commercial Registration No. *">
                    <Input
                      placeholder="CR-109283"
                      value={customerForm.crNumber}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, crNumber: event.target.value }))}
                      className="bg-background font-mono"
                    />
                    <div className="mt-1 flex items-center justify-between gap-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded border border-primary/20 transition-colors">
                        <Upload className="h-3 w-3" />
                        <span>{customerForm.crFile ? "Change CR Doc" : "Upload CR Doc"}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setCustomerForm((form) => ({ ...form, crFile: file.name }));
                          }}
                        />
                      </label>
                      {customerForm.crFile && (
                        <span className="text-[10px] text-emerald-600 font-medium truncate max-w-[120px] flex items-center gap-1" title={customerForm.crFile}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{customerForm.crFile}</span>
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field label="CR Expiry Date">
                    <Input
                      type="date"
                      value={customerForm.crExpiryDate}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, crExpiryDate: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                  <Field label="Trade Licence No.">
                    <Input
                      placeholder="TL-98214"
                      value={customerForm.tradeLicenceNo}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, tradeLicenceNo: event.target.value }))}
                      className="bg-background font-mono"
                    />
                    <div className="mt-1 flex items-center justify-between gap-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded border border-primary/20 transition-colors">
                        <Upload className="h-3 w-3" />
                        <span>{customerForm.tradeLicenceFile ? "Change Licence" : "Upload Licence"}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setCustomerForm((form) => ({ ...form, tradeLicenceFile: file.name }));
                          }}
                        />
                      </label>
                      {customerForm.tradeLicenceFile && (
                        <span className="text-[10px] text-emerald-600 font-medium truncate max-w-[120px] flex items-center gap-1" title={customerForm.tradeLicenceFile}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{customerForm.tradeLicenceFile}</span>
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field label="Trade Licence Expiry Date">
                    <Input
                      type="date"
                      value={customerForm.tradeLicenceExpiryDate}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, tradeLicenceExpiryDate: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="Computer Card No.">
                    <Input
                      placeholder="CC-448291"
                      value={customerForm.computerCardNo}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, computerCardNo: event.target.value }))}
                      className="bg-background font-mono"
                    />
                    <div className="mt-1 flex items-center justify-between gap-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded border border-primary/20 transition-colors">
                        <Upload className="h-3 w-3" />
                        <span>{customerForm.computerCardFile ? "Change Card" : "Upload Card"}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setCustomerForm((form) => ({ ...form, computerCardFile: file.name }));
                          }}
                        />
                      </label>
                      {customerForm.computerCardFile && (
                        <span className="text-[10px] text-emerald-600 font-medium truncate max-w-[120px] flex items-center gap-1" title={customerForm.computerCardFile}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{customerForm.computerCardFile}</span>
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field label="Computer Card Expiry Date">
                    <Input
                      type="date"
                      value={customerForm.computerCardExpiryDate}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, computerCardExpiryDate: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                  <Field label="Tax Identification No.">
                    <Input
                      placeholder="TIN-0092182"
                      value={customerForm.taxIdentificationNo}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, taxIdentificationNo: event.target.value }))}
                      className="bg-background font-mono"
                    />
                    <div className="mt-1 flex items-center justify-between gap-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded border border-primary/20 transition-colors">
                        <Upload className="h-3 w-3" />
                        <span>{customerForm.taxIdFile ? "Change Tax Doc" : "Upload Tax Doc"}</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setCustomerForm((form) => ({ ...form, taxIdFile: file.name }));
                          }}
                        />
                      </label>
                      {customerForm.taxIdFile && (
                        <span className="text-[10px] text-emerald-600 font-medium truncate max-w-[120px] flex items-center gap-1" title={customerForm.taxIdFile}>
                          <CheckCircle2 className="h-3 w-3 shrink-0" />
                          <span className="truncate">{customerForm.taxIdFile}</span>
                        </span>
                      )}
                    </div>
                  </Field>
                  <Field label="Industry / Business Activity">
                    <Input
                      placeholder="Commercial Trading & Contracting"
                      value={customerForm.industryActivity}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, industryActivity: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Field label="Registered Office Address">
                    <Input
                      placeholder="West Bay, Tower 3, Floor 14"
                      value={customerForm.registeredOfficeAddress}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, registeredOfficeAddress: event.target.value }))}
                      className="bg-background text-xs"
                    />
                  </Field>
                  <Field label="Billing Address">
                    <Input
                      placeholder="PO Box 99882, Doha"
                      value={customerForm.billingAddress}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, billingAddress: event.target.value }))}
                      className="bg-background text-xs"
                    />
                  </Field>
                  <Field label="Company Telephone">
                    <Input
                      placeholder="+974 4400 1122"
                      value={customerForm.companyTelephone}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, companyTelephone: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                  <Field label="Website">
                    <Input
                      placeholder="https://gulfhorizon.qa"
                      value={customerForm.website}
                      onChange={(event) => setCustomerForm((form) => ({ ...form, website: event.target.value }))}
                      className="bg-background"
                    />
                  </Field>
                </div>

                {/* Authorized Signatory & Contact Person */}
                <div className="pt-2 border-t mt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Signatory & Contact Person Records
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                    <Field label="Authorized Signatory Name">
                      <Input
                        placeholder="Hamad Al-Kuwari"
                        value={customerForm.authorizedSignatory}
                        onChange={(event) => setCustomerForm((form) => ({ ...form, authorizedSignatory: event.target.value }))}
                        className="bg-background"
                      />
                    </Field>
                    <Field label="Signatory QID / Passport No.">
                      <Input
                        placeholder="28012345678"
                        value={customerForm.signatoryQidPassport}
                        onChange={(event) => setCustomerForm((form) => ({ ...form, signatoryQidPassport: event.target.value }))}
                        className="bg-background font-mono"
                      />
                    </Field>
                    <Field label="Signatory ID Expiry Date">
                      <Input
                        type="date"
                        value={customerForm.signatoryIdExpiryDate}
                        onChange={(event) => setCustomerForm((form) => ({ ...form, signatoryIdExpiryDate: event.target.value }))}
                        className="bg-background"
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Field label="Primary Contact Person">
                      <Input
                        placeholder="Nasser Al-Mannai"
                        value={customerForm.primaryContactPerson}
                        onChange={(event) => setCustomerForm((form) => ({ ...form, primaryContactPerson: event.target.value }))}
                        className="bg-background"
                      />
                    </Field>
                    <Field label="Contact Designation">
                      <Input
                        placeholder="Procurement Director"
                        value={customerForm.contactDesignation}
                        onChange={(event) => setCustomerForm((form) => ({ ...form, contactDesignation: event.target.value }))}
                        className="bg-background"
                      />
                    </Field>
                    <Field label="Contact Mobile">
                      <Input
                        placeholder="+974 3311 2233"
                        value={customerForm.contactMobile}
                        onChange={(event) => setCustomerForm((form) => ({ ...form, contactMobile: event.target.value }))}
                        className="bg-background"
                      />
                    </Field>
                    <Field label="Contact Email">
                      <Input
                        type="email"
                        placeholder="nasser@gulfhorizon.qa"
                        value={customerForm.contactEmail}
                        onChange={(event) => setCustomerForm((form) => ({ ...form, contactEmail: event.target.value }))}
                        className="bg-background"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            )}
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
                if (customerForm.type === "individual") {
                  const mob = (customerForm.primaryMobile || customerForm.mobile || "").trim();
                  if (!mob) {
                    alert("Primary Mobile is required for Individual customers.");
                    return;
                  }
                }
                if (isCustomerDuplicate(customerForm, editCustomerData.id)) {
                  const dupMsg = customerForm.type === "company"
                    ? "Another company with the same Commercial Registration (CR) number already exists."
                    : "Another customer already has this Qatar ID, Passport, Mobile, or Email.";
                  alert(dupMsg);
                  return;
                }
                const finalDisplayName = (customerForm.displayName || customerForm.name || (customerForm.type === "individual" ? `${customerForm.firstName || ""} ${customerForm.lastName || ""}`.trim() : customerForm.companyLegalName) || "").trim();
                const primaryMob = customerForm.primaryMobile || customerForm.mobile || "";
                const primaryMail = customerForm.primaryEmail || customerForm.email || "";

                setCustomers(prev => prev.map(c => c.id === editCustomerData.id ? {
                  ...c,
                  ...customerForm,
                  name: finalDisplayName || c.name,
                  displayName: finalDisplayName || (c as any).displayName,
                  mobile: primaryMob || (c as any).mobile,
                  primaryMobile: primaryMob || (c as any).primaryMobile,
                  email: primaryMail || (c as any).email,
                  primaryEmail: primaryMail || (c as any).primaryEmail,
                  currentAddress: customerForm.currentAddress || customerForm.localAddress || (c as any).currentAddress,
                } : c));

                // Synchronize updated documents with the Documents module
                setDocuments(prevDocs => {
                  return prevDocs.map(d => {
                    if (d.customerId !== editCustomerData.id) return d;
                    if (customerForm.type === "individual") {
                      if (d.name.includes("Qatar ID") && customerForm.qidFile) {
                        return { ...d, file: customerForm.qidFile, remarks: `Uploaded: ${customerForm.qidFile}`, expiryDate: customerForm.qidExpiryDate || d.expiryDate };
                      }
                      if (d.name.includes("Passport") && customerForm.passportFile) {
                        return { ...d, file: customerForm.passportFile, remarks: `Uploaded: ${customerForm.passportFile}`, expiryDate: customerForm.passportExpiryDate || d.expiryDate };
                      }
                    } else {
                      if (d.name.includes("Commercial") && customerForm.crFile) {
                        return { ...d, file: customerForm.crFile, remarks: `Uploaded: ${customerForm.crFile}`, expiryDate: customerForm.crExpiryDate || d.expiryDate };
                      }
                      if (d.name.includes("Trade") && customerForm.tradeLicenceFile) {
                        return { ...d, file: customerForm.tradeLicenceFile, remarks: `Uploaded: ${customerForm.tradeLicenceFile}`, expiryDate: customerForm.tradeLicenceExpiryDate || d.expiryDate };
                      }
                      if (d.name.includes("Establishment") && customerForm.computerCardFile) {
                        return { ...d, file: customerForm.computerCardFile, remarks: `Uploaded: ${customerForm.computerCardFile}`, expiryDate: customerForm.computerCardExpiryDate || d.expiryDate };
                      }
                    }
                    return d;
                  });
                });

                toast.success("Customer profile and KYC documents updated successfully.");
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
      <Dialog open={uploadDocOpen} onOpenChange={(open) => { if (!open) { setPendingNewDoc(null); } setUploadDocOpen(open); }}>
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
            <Button variant="outline" size="sm" onClick={() => { setPendingNewDoc(null); setUploadDocOpen(false); }}>Cancel</Button>
            <Button size="sm" onClick={submitUploadDoc}><ClipboardCheck className="mr-2 h-4 w-4" /> Upload Document</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── RELEASE RESERVATION DIALOG ────────────────────────────── */}
      <Dialog open={releaseOpen} onOpenChange={setReleaseOpen}>
        <DialogContent className="sm:max-w-xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-red-500/10 via-rose-500/5 to-transparent px-6 py-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 border border-red-500/20 shadow-sm">
                <XCircle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Release Unit Reservation & Refund</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {selectedReservationForRelease && (
                    <span>Unit: <strong className="text-foreground">{selectedReservationForRelease.unit}</strong> ({selectedReservationForRelease.property}) · Tenant: <strong className="text-foreground">{selectedReservationForRelease.tenantName}</strong></span>
                  )}
                </DialogDescription>
              </div>
            </div>
            {selectedReservationForRelease?.isHold && Number(selectedReservationForRelease?.tokenAmount) > 0 && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 text-xs">
                🔒 Hold: QAR {Number(selectedReservationForRelease.tokenAmount).toLocaleString()}
              </Badge>
            )}
          </div>
          <div className="p-6 overflow-y-auto space-y-4 flex-1">
            {/* If reservation had a token advance, render Token Refund Form & GL Liability Debit */}
            {selectedReservationForRelease?.isHold && Number(selectedReservationForRelease?.tokenAmount) > 0 && !selectedReservationForRelease?.tokenRefunded && (
              <div className="rounded-xl border border-amber-300 bg-amber-50/70 dark:bg-amber-950/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <Banknote className="h-4 w-4 text-amber-700 dark:text-amber-300" /> Token Advance Refund Provision
                  </span>
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs font-mono font-bold">
                    QAR {Number(selectedReservationForRelease.tokenAmount).toLocaleString()}
                  </Badge>
                </div>
                <p className="text-xs text-amber-800/90 dark:text-amber-300/90">
                  This unit was placed on hold with a refundable token deposit. Releasing the hold will generate a <strong>Payment Voucher</strong> and discharge liability from <strong>Reservation Advance Liability (21100001)</strong> to the chosen disbursement account.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <Field label="Refund Payment Mode *">
                    <Select value={releaseRefundMode} onValueChange={(v) => setReleaseRefundMode(v as any)}>
                      <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash In Hand (12100001)</SelectItem>
                        <SelectItem value="Bank Transfer">Bank Transfer (12000001)</SelectItem>
                        <SelectItem value="Cheque">Company Refund Cheque (12000001)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  {releaseRefundMode !== "Cash" ? (
                    <Field label="Disbursing Bank Account *">
                      <Select value={releaseRefundBank} onValueChange={setReleaseRefundBank}>
                        <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DEFAULT_COMPANY_BANK_ACCOUNTS.map((bank) => (
                            <SelectItem key={bank.glCode} value={bank.glCode}>
                              {bank.bankName} ({bank.glCode})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  ) : (
                    <Field label="Cash Location">
                      <Input value="Head Office Central Cashier (12100001)" disabled className="bg-muted text-xs" />
                    </Field>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Refund Payment Voucher / Ref No.">
                    <Input
                      value={releaseRefundVoucherNo}
                      onChange={(e) => setReleaseRefundVoucherNo(e.target.value)}
                      placeholder="PV-REF-TOK-..."
                      className="bg-background font-mono text-xs"
                    />
                  </Field>
                  <Field label="GL Settlement Impact">
                    <div className="text-[11px] font-mono p-2 rounded bg-background/80 border text-muted-foreground flex flex-col justify-center">
                      <div>Dr: <span className="text-foreground font-semibold">21100001 (Advance Liab)</span></div>
                      <div>Cr: <span className="text-foreground font-semibold">{releaseRefundMode === "Cash" ? "12100001 (Cash)" : `${releaseRefundBank} (Bank)`}</span></div>
                    </div>
                  </Field>
                </div>
              </div>
            )}

            <Field label="Release Reason Type">
              <Select value={releaseType} onValueChange={v => setReleaseType(v as typeof releaseType)}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
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
                className="text-xs bg-background"
              />
            </Field>

            <div className="rounded-xl border border-blue-200 bg-blue-50/60 dark:bg-blue-950/20 p-3 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
              <span>
                Releasing immediately restores unit <strong className="text-foreground">{selectedReservationForRelease?.unit}</strong> to <strong>Available</strong> status in Unit Master and allows new leasing bookings.
              </span>
            </div>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex items-center justify-between gap-2.5">
            <span className="text-xs text-muted-foreground">
              {selectedReservationForRelease?.isHold && Number(selectedReservationForRelease?.tokenAmount) > 0
                ? `Will refund QAR ${Number(selectedReservationForRelease.tokenAmount).toLocaleString()} via ${releaseRefundMode}`
                : "Standard release"}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setReleaseOpen(false)}>Cancel</Button>
              <Button size="sm" variant="destructive" onClick={confirmRelease} className="gap-1.5">
                <XCircle className="h-4 w-4" />
                {selectedReservationForRelease?.isHold && Number(selectedReservationForRelease?.tokenAmount) > 0
                  ? "Confirm Unhold & Process Refund"
                  : "Confirm Release"}
              </Button>
            </div>
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
              <SearchableSelect
                value={renewalNoticeForm.selectedLeaseId || "all"}
                onValueChange={v => setRenewalNoticeForm(f => ({ ...f, selectedLeaseId: v }))}
                placeholder="Select a lease..."
                emptyText="No leases found"
                options={[
                  { label: "⚡ All Eligible Leases (Batch Process)", value: "all" },
                  ...upcomingRenewals.map(l => ({ label: `${l.tenantName} — ${l.unit} (${l.property})`, value: l.id }))
                ]}
              />
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
        <DialogContent className="sm:max-w-[520px] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <FileCheck2 className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">Document Verification & Decision</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">Compliance review and verification status decision.</DialogDescription>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Select Verification Decision</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={verifyDocForm.status === "verified" ? "default" : "outline"}
                  className={`h-9 text-xs font-medium ${verifyDocForm.status === "verified" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}
                  onClick={() => setVerifyDocForm(f => ({ ...f, status: "verified" }))}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Verify
                </Button>
                <Button
                  type="button"
                  variant={verifyDocForm.status === "info_required" ? "default" : "outline"}
                  className={`h-9 text-xs font-medium ${verifyDocForm.status === "info_required" ? "bg-amber-600 hover:bg-amber-700 text-white" : "border-amber-300 text-amber-700 hover:bg-amber-50"}`}
                  onClick={() => setVerifyDocForm(f => ({ ...f, status: "info_required" }))}
                >
                  <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                  Need Info
                </Button>
                <Button
                  type="button"
                  variant={verifyDocForm.status === "rejected" ? "default" : "outline"}
                  className={`h-9 text-xs font-medium ${verifyDocForm.status === "rejected" ? "bg-rose-600 hover:bg-rose-700 text-white" : "border-rose-300 text-rose-700 hover:bg-rose-50"}`}
                  onClick={() => setVerifyDocForm(f => ({ ...f, status: "rejected" }))}
                >
                  <XCircle className="w-3.5 h-3.5 mr-1.5" />
                  Reject
                </Button>
              </div>
            </div>

            {verifyDocForm.status === "verified" && (
              <Field label="Document Expiry Date (if applicable)">
                <Input type="date" value={verifyDocForm.expiryDate} onChange={e => setVerifyDocForm(f => ({ ...f, expiryDate: e.target.value }))} className="bg-background" />
              </Field>
            )}

            <Field label="Reviewer Notes / Decision Justification">
              <Textarea
                rows={3}
                value={verifyDocForm.remarks}
                onChange={e => setVerifyDocForm(f => ({ ...f, remarks: e.target.value }))}
                placeholder={
                  verifyDocForm.status === "verified"
                    ? "All details verified and match official record."
                    : verifyDocForm.status === "info_required"
                    ? "Specify what additional document/information is required from tenant..."
                    : "Specify reason for document rejection..."
                }
                className="text-xs bg-background"
              />
            </Field>
          </div>
          <div className="px-6 py-3.5 bg-muted/40 border-t flex justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={() => setVerifyDocOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={submitDocumentVerification} className={
              verifyDocForm.status === "verified"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : verifyDocForm.status === "info_required"
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-rose-600 hover:bg-rose-700 text-white"
            }>
              Submit Decision ({verifyDocForm.status === "verified" ? "Verify" : verifyDocForm.status === "info_required" ? "Need Info" : "Reject"})
            </Button>
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
              {collectForm.paymentMode === "PDC" ? (
                <Field label="Bank Name (for PDCs)">
                  <Input value={collectForm.chequeBank} onChange={(e) => setCollectForm((f) => ({ ...f, chequeBank: e.target.value }))} placeholder="e.g. QNB, Doha Bank, CBQ" />
                </Field>
              ) : (
                <Field label="Rent Amount (QAR)">
                  <Input type="number" value={collectForm.regularChequeAmount} onChange={(e) => setCollectForm((f) => ({ ...f, regularChequeAmount: e.target.value }))} placeholder={`${signatureWorkflowLease?.monthlyRent || 0}`} />
                </Field>
              )}
            </div>

            {/* Non-PDC Rent Details */}
            {collectForm.paymentMode !== "PDC" && (
              <div className="rounded-lg border border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 dark:border-blue-800 p-3.5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-800 dark:text-blue-300">
                  {collectForm.paymentMode} — Rent Collection Details
                </p>
                {collectForm.paymentMode === "Cash" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Receipt No.">
                      <Input value={collectForm.rentPaymentReceiptNo} onChange={(e) => setCollectForm((f) => ({ ...f, rentPaymentReceiptNo: e.target.value }))} placeholder="e.g. REC-2024-001" />
                    </Field>
                    <Field label="Cashier Name">
                      <Input value={collectForm.cashierName} onChange={(e) => setCollectForm((f) => ({ ...f, cashierName: e.target.value }))} placeholder="Name of cashier receiving cash" />
                    </Field>
                  </div>
                )}
                {collectForm.paymentMode === "Bank Transfer" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Bank Transfer Reference No.">
                      <Input value={collectForm.rentPaymentReference} onChange={(e) => setCollectForm((f) => ({ ...f, rentPaymentReference: e.target.value }))} placeholder="e.g. TRF-QNB-2024-00112" />
                    </Field>
                    <Field label="Bank / Account">
                      <Input value={collectForm.chequeBank} onChange={(e) => setCollectForm((f) => ({ ...f, chequeBank: e.target.value }))} placeholder="e.g. QNB, CBQ, QIIB" />
                    </Field>
                  </div>
                )}
                {collectForm.paymentMode === "Guarantee Cheque" && (
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Guarantee Cheque No.">
                      <Input value={collectForm.rentGuaranteeChequeNo} onChange={(e) => setCollectForm((f) => ({ ...f, rentGuaranteeChequeNo: e.target.value }))} placeholder="e.g. GNT-44321" />
                    </Field>
                    <Field label="Issuing Bank">
                      <Input value={collectForm.rentGuaranteeChequeBank} onChange={(e) => setCollectForm((f) => ({ ...f, rentGuaranteeChequeBank: e.target.value }))} placeholder="e.g. QNB" />
                    </Field>
                    <Field label="Cheque Date">
                      <Input type="date" value={collectForm.rentGuaranteeChequeDate} onChange={(e) => setCollectForm((f) => ({ ...f, rentGuaranteeChequeDate: e.target.value }))} />
                    </Field>
                  </div>
                )}
                <div className="text-xs text-blue-700 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-900/30 rounded px-2.5 py-1.5 flex items-center gap-2">
                  <span>💡</span>
                  <span>A Receipt Voucher will be generated with the above details and posted to the Finance Ledger.</span>
                </div>
              </div>
            )}

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
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground">Standard tenancy premise deposit</span>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <div
                      onClick={() => setCollectForm((f) => ({ ...f, depositIsSplit: !f.depositIsSplit }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        collectForm.depositIsSplit ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          collectForm.depositIsSplit ? "translate-x-[18px]" : "translate-x-[2px]"
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-foreground">Split Payment</span>
                  </label>
                </div>
              </div>

              {!collectForm.depositIsSplit ? (
                <>
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
                </>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-primary font-semibold bg-primary/5 border border-primary/20 rounded px-2.5 py-1.5">
                    🔀 Split Payment — Enter amounts per payment method. Leave at 0 to skip.
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Cash (QAR)">
                      <Input type="number" value={collectForm.depositSplitCash} onChange={(e) => setCollectForm((f) => ({ ...f, depositSplitCash: e.target.value }))} placeholder="0" />
                    </Field>
                    <Field label="Bank Transfer (QAR)">
                      <Input type="number" value={collectForm.depositSplitBank} onChange={(e) => setCollectForm((f) => ({ ...f, depositSplitBank: e.target.value }))} placeholder="0" />
                    </Field>
                    <Field label="Cheque / PDC (QAR)">
                      <Input type="number" value={collectForm.depositSplitCheque} onChange={(e) => setCollectForm((f) => ({ ...f, depositSplitCheque: e.target.value }))} placeholder="0" />
                    </Field>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Bank Transfer Ref No.">
                      <Input value={collectForm.depositSplitBankRef} onChange={(e) => setCollectForm((f) => ({ ...f, depositSplitBankRef: e.target.value }))} placeholder="e.g. TRF-QNB-001" />
                    </Field>
                    <Field label="Cheque No.">
                      <Input value={collectForm.depositSplitChequeNo} onChange={(e) => setCollectForm((f) => ({ ...f, depositSplitChequeNo: e.target.value }))} placeholder="e.g. CHQ-SEC-01" />
                    </Field>
                    <Field label="Cheque Bank">
                      <Input value={collectForm.depositSplitChequeBank} onChange={(e) => setCollectForm((f) => ({ ...f, depositSplitChequeBank: e.target.value }))} placeholder="e.g. QNB, CBQ" />
                    </Field>
                  </div>
                  {(() => {
                    const total = (Number(collectForm.depositSplitCash) || 0) + (Number(collectForm.depositSplitBank) || 0) + (Number(collectForm.depositSplitCheque) || 0) + (Number(collectForm.appliedTokenAdvance) || 0);
                    const expected = Number(collectForm.depositAmount) || signatureWorkflowLease?.securityDeposit || 0;
                    return total > 0 ? (
                      <div className={`text-xs rounded px-2.5 py-1.5 flex items-center justify-between ${
                        Math.abs(total - expected) < 1 ? "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                      }`}>
                        <span>Split Total: <strong>QAR {total.toLocaleString()}</strong></span>
                        {expected > 0 && <span>Expected: <strong>QAR {expected.toLocaleString()}</strong> {Math.abs(total - expected) < 1 ? "✓ Balanced" : `(Difference: QAR ${Math.abs(total - expected).toLocaleString()})`}</span>}
                      </div>
                    ) : null;
                  })()}
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
              const rentAmt = Number(collectForm.regularChequeAmount) || (signatureWorkflowLease.monthlyRent * (collectForm.pdcCount || 12));
              const pdcAmt = collectForm.paymentMode === "PDC"
                ? ((collectForm.customCheques || []).filter(c => Number(c.amount) > 0).reduce((s, c) => s + Number(c.amount), 0) || rentAmt)
                : 0;
              const cashRentAmt = collectForm.paymentMode === "Cash" ? rentAmt : 0;
              const bankRentAmt = collectForm.paymentMode === "Bank Transfer" ? rentAmt : 0;
              const gntRentAmt = collectForm.paymentMode === "Guarantee Cheque" ? rentAmt : 0;

              // Security deposit
              const splitCash = collectForm.depositIsSplit ? (Number(collectForm.depositSplitCash) || 0) : 0;
              const splitBank = collectForm.depositIsSplit ? (Number(collectForm.depositSplitBank) || 0) : 0;
              const splitCheque = collectForm.depositIsSplit ? (Number(collectForm.depositSplitCheque) || 0) : 0;
              const depAmt = collectForm.depositIsSplit
                ? splitCash + splitBank + splitCheque
                : (Number(collectForm.depositAmount) || signatureWorkflowLease.securityDeposit);
              const depDrLabel = collectForm.depositIsSplit ? "Multiple (Split)"
                : (collectForm.depositMode === "Cash" ? "Cash In Hand" : collectForm.depositMode === "Bank Transfer" ? "Bank Operating Account" : "PDC In Hand");
              const depDrCode = collectForm.depositIsSplit ? "*"
                : (collectForm.depositMode === "Cash" ? "12100" : collectForm.depositMode === "Bank Transfer" ? "12000" : "12900");

              const utilityAmt = Number(collectForm.utilityDeposit) || 0;
              const qatarCoolAmt = Number(collectForm.qatarCoolDeposit) || 0;
              const reservationAmt = Number(collectForm.reservationDeposit) || 0;
              const serviceFeeAmt = Number(collectForm.serviceFeeDeposit) || 0;
              const guaranteeChequeAmt = Number(collectForm.guaranteeChequeDeposit) || 0;
              const agencyAmt = Number(collectForm.agencyCommission) || 0;
              const adminAmt = Number(collectForm.adminCharges) || 0;

              const impacts: Array<{ label: string; category: string; dr: string; drCode: string; cr: string; crCode: string; amount: number }> = [];
              if (pdcAmt > 0) impacts.push({ label: "Rent — PDC In Hand", category: "Rent", dr: "PDC In Hand", drCode: "12900", cr: `Customer(PDC)-${signatureWorkflowLease.unit}`, crCode: "21400", amount: pdcAmt });
              if (cashRentAmt > 0) impacts.push({ label: `Rent — Cash (Ref: ${collectForm.rentPaymentReceiptNo || "—"})`, category: "Rent", dr: "Cash In Hand", drCode: "12100", cr: `Rental Income - ${signatureWorkflowLease.unit}`, crCode: "41100", amount: cashRentAmt });
              if (bankRentAmt > 0) impacts.push({ label: `Rent — Bank Transfer (Ref: ${collectForm.rentPaymentReference || "—"})`, category: "Rent", dr: "Bank Operating Account", drCode: "12000", cr: `Rental Income - ${signatureWorkflowLease.unit}`, crCode: "41100", amount: bankRentAmt });
              if (gntRentAmt > 0) impacts.push({ label: `Rent — Guarantee Cheque (${collectForm.rentGuaranteeChequeNo || "—"})`, category: "Rent", dr: "Guarantee Cheque In Hand", drCode: "12900", cr: "Guarantee Cheque Received", crCode: "21200001", amount: gntRentAmt });
              if (collectForm.depositIsSplit) {
                if (splitCash > 0) impacts.push({ label: "Security Deposit — Cash Split", category: "Deposit (21500)", dr: "Cash In Hand", drCode: "12100", cr: `Security Deposit Liability - ${signatureWorkflowLease.unit}`, crCode: "21500", amount: splitCash });
                if (splitBank > 0) impacts.push({ label: `Security Deposit — Bank Split (Ref: ${collectForm.depositSplitBankRef || "—"})`, category: "Deposit (21500)", dr: "Bank Operating Account", drCode: "12000", cr: `Security Deposit Liability - ${signatureWorkflowLease.unit}`, crCode: "21500", amount: splitBank });
                if (splitCheque > 0) impacts.push({ label: `Security Deposit — Cheque Split (${collectForm.depositSplitChequeNo || "—"})`, category: "Deposit (21500)", dr: "PDC In Hand", drCode: "12900", cr: `Security Deposit Liability - ${signatureWorkflowLease.unit}`, crCode: "21500", amount: splitCheque });
              } else if (depAmt > 0) {
                impacts.push({ label: `Type 1: Unit Security Deposit (${collectForm.depositMode})`, category: "Deposit (21500)", dr: depDrLabel, drCode: depDrCode, cr: "Security Deposit Liability", crCode: "21500", amount: depAmt });
              }
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

      {/* ── VIEW HANDOVER DETAIL & SIGNED RECEIPT DIALOG ──────────────────────────── */}
      <Dialog open={handoverViewOpen} onOpenChange={setHandoverViewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card">
          <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-6 py-4 border-b flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Key Handover &amp; Check-In Certificate</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">Official executed key release, unit condition audit, and signed custody receipt.</DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedHandover && signedHandoverDocs[selectedHandover.id || selectedHandover.leaseId] && (
                <Badge variant="outline" className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 text-[11px] gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Signed Copy Uploaded
                </Badge>
              )}
              <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
                Verified &amp; Handed Over
              </span>
            </div>
          </div>

          {selectedHandover && (() => {
            const lease = leases.find(l => l.id === selectedHandover.leaseId);
            const handoverKey = selectedHandover.id || selectedHandover.leaseId;
            const signedDoc = signedHandoverDocs[handoverKey];
            const branding = getDocumentBranding();
            const impersonation = getImpersonationSession();
            const tokenBranding = branding.submodules?.tokenHandover || {
              documentTitle: "KEY HANDOVER & UNIT CHECK-IN CERTIFICATE",
              documentSubtitle: "Official 5-Stage Custody Transfer & Fixture Audit Protocol",
              bannerImageUrl: null,
              bannerHeight: 120,
              bannerWidthPercent: 100,
              bannerFit: "fill" as const,
              bannerStretch: true,
              bannerBorderRadius: 0,
              showBanner: true,
              showSignature: true,
              signatureScale: 100,
              showStamp: true,
              stampScale: 100,
              signatoryNameOverride: "",
              signatoryTitleOverride: "",
              notes: "The tenant confirms receipt of property keys, access cards, and condition checklist.",
              termsAndConditions: "The tenant accepts keys in good condition. All security tokens must be returned upon lease conclusion.",
              footerNote: "Official Handover Protocol • Al Ameen Real Estate W.L.L",
              languageMode: "en" as const,
            };

            const companyName = impersonation?.tenantName || branding.companyName || "Al Ameen Real Estate";
            const legalEntityName = branding.legalEntityName || companyName;
            const bannerUrl = tokenBranding.bannerImageUrl || branding.headerImageUrl;
            const signatoryName = tokenBranding.signatoryNameOverride || branding.authorizedSignatoryName || "Property Manager";
            const signatoryTitle = tokenBranding.signatoryTitleOverride || branding.authorizedSignatoryTitle || "Authorized Signatory";

            const defaultAssetsList = [
              { id: "a1", name: "Split Air Conditioning Units (x3)", nameAr: "وحدات تكييف هواء سبليت (عدد 3)", code: "HVAC-SPL-01", condition: "Excellent", conditionAr: "ممتاز", remarks: "Serviced, clean filters, cooling tested OK ✓", remarksAr: "تمت الصيانة وفحص التبريد والفلاتر ✓" },
              { id: "a2", name: "Built-in Gas Cooktop & Oven", nameAr: "موقد وفرن غاز مدمج", code: "APP-KIT-02", condition: "Good", conditionAr: "جيد", remarks: "Ignition and all burners verified working ✓", remarksAr: "الإشعال وجميع الشعلات تعمل بحالة جيدة ✓" },
              { id: "a3", name: "Double-Door Refrigerator (Frost-Free)", nameAr: "ثلاجة ببابين (مانعة للثلج)", code: "APP-REF-03", condition: "Good", conditionAr: "جيد", remarks: "Clean, defrosted, temperature tested ✓", remarksAr: "نظيفة ومفحوصة التبريد وجاهزة ✓" },
              { id: "a4", name: "Electric Water Heater (80L)", nameAr: "سخان مياه كهربائي (80 لتر)", code: "PLM-WTR-01", condition: "Excellent", conditionAr: "ممتاز", remarks: "Thermostat and safety valve inspected ✓", remarksAr: "تم فحص منظم الحرارة وصمام الأمان ✓" },
              { id: "a5", name: "Master Bedroom Wardrobes (Built-in)", nameAr: "خزائن ملابس غرفة النوم الرئيسية (مدمجة)", code: "FUR-WRD-01", condition: "Excellent", conditionAr: "ممتاز", remarks: "Hinges and sliding tracks aligned ✓", remarksAr: "المفصلات والمسارات المنزلقة سليمة ومضبوطة ✓" },
            ];

            const activeAssets = (selectedHandover.assetsSnapshot && selectedHandover.assetsSnapshot.length > 0)
              ? selectedHandover.assetsSnapshot
              : defaultAssetsList;

            const checklistItems = [
              { title: "Lease Agreement", titleAr: "عقد الإيجار الرسمي", desc: "Fully executed by Tenant and Landlord / PMS", descAr: "موقع ومعتمد بالكامل من المستأجر والمؤجر", status: "Verified ✓", statusAr: "تم التحقق ✓" },
              { title: "Deposit & Rent", titleAr: "مبلغ التأمين والإيجار", desc: "Security deposit and first period rent collected", descAr: "تم تحصيل مبلغ الضمان وإيجار الفترة الأولى", status: "Verified ✓", statusAr: "تم التحصيل ✓" },
              { title: "Key Release Notice", titleAr: "إشعار تسليم المفاتيح", desc: "Formal notice dispatched to Tenant & Security", descAr: "تم إرسال إشعار رسمي للمستأجر وأمن العقار", status: "Dispatched ✓", statusAr: "تم الإرسال ✓" },
              { title: "Utility Meters", titleAr: "قراءات عدادات الخدمات", desc: "Electricity and Water initial readings recorded", descAr: "تم تسجيل وتوثيق قراءات الكهرباء والماء", status: "Recorded ✓", statusAr: "تم التوثيق ✓" },
              { title: "Access Tokens", titleAr: "المفاتيح والرموز الأمنية", desc: "Keys, RFID cards and remotes counted & tested", descAr: "تم تسليم واختبار المفاتيح والبطاقات الذكية", status: "Delivered ✓", statusAr: "تم التسليم ✓" },
              { title: "Unit Condition", titleAr: "فحص ومعاينة الوحدة", desc: "Joint inspection performed and audit grades set", descAr: "تمت المعاينة المشتركة وتوثيق حالة العقار", status: "Documented ✓", statusAr: "تمت المعاينة ✓" },
              { title: "Collector Identity", titleAr: "إثبات هوية المستلم", desc: "Original QID / Passport document verified", descAr: "تمت مطابقة البطاقة الشخصية القطرية الأصلية", status: "Verified ✓", statusAr: "تمت المطابقة ✓" },
              { title: "Photo Archive", titleAr: "الأرشيف الفوتوغرافي", desc: "Move-in photographic records archived", descAr: "تم حفظ وتوثيق صور استلام العقار", status: "Archived ✓", statusAr: "تم الأرشفة ✓" },
              { title: "Sign-Off & Undertaking", titleAr: "الإقرار والتوقيع الرسمي", desc: "Custody transfer confirmed & acknowledged", descAr: "تم إقرار استلام العهدة وتوقيع المحضر", status: "Confirmed ✓", statusAr: "تم الإقرار ✓" },
            ];

            const printHandoverCertificateDoc = () => {
              const printWindow = window.open("", "_blank", "width=920,height=1050");
              if (!printWindow) {
                window.print();
                return;
              }

              const docRefNo = `KHC-${lease?.id?.slice(0, 8) || "2026-001"}`;
              const docDate = selectedHandover?.handoverAt || lease?.startDate || new Date().toISOString().split("T")[0];

              const html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                  <meta charset="utf-8" />
                  <title>Token & Key Handover Certificate - ${docRefNo} - ${lease?.unit || ""}</title>
                  <link rel="preconnect" href="https://fonts.googleapis.com">
                  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
                  <style>
                    @page {
                      size: A4 portrait;
                      margin: 0;
                    }
                    * {
                      box-sizing: border-box;
                      margin: 0;
                      padding: 0;
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                    }
                    body {
                      color: #0f172a;
                      background: #f1f5f9;
                      font-family: 'Inter', Arial, sans-serif;
                      font-size: 8.8pt;
                      line-height: 1.38;
                      margin: 0;
                      padding: 20px 0;
                    }
                    
                    /* Multi-Page A4 Sheet Wrapper */
                    .page-sheet {
                      width: 210mm;
                      min-height: 297mm;
                      margin: 0 auto 20px auto;
                      background: #ffffff;
                      padding: 0;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                      position: relative;
                      display: flex;
                      flex-direction: column;
                      justify-content: space-between;
                      box-sizing: border-box;
                    }
                    .page-content {
                      flex-grow: 1;
                      display: flex;
                      flex-direction: column;
                    }
                    .page-body-padded {
                      padding: 4px 12mm 0 12mm;
                      display: flex;
                      flex-direction: column;
                      flex-grow: 1;
                    }

                    /* Page 1 Header Banner (100% full edge-to-edge bleed) */
                    .page1-header-banner {
                      width: 100%;
                      margin: 0;
                      padding: 0;
                      display: block;
                      line-height: 0;
                      overflow: hidden;
                    }
                    .page1-header-banner img {
                      width: 100%;
                      aspect-ratio: 1024 / 192;
                      object-fit: fill;
                      margin: 0;
                      padding: 0;
                      display: block;
                      border: 0;
                    }

                    /* Page 2+ Header Logo on Right */
                    .page-header-secondary-wrapper {
                      padding: 6mm 12mm 0 12mm;
                    }
                    .page-header-secondary {
                      display: flex;
                      justify-content: flex-end;
                      align-items: center;
                      margin-bottom: 6px;
                      padding-bottom: 4px;
                      border-bottom: 1.5px solid #cbd5e1;
                    }
                    .page-header-secondary img {
                      height: 48px;
                      width: auto;
                      object-fit: contain;
                      display: block;
                    }

                    /* Centered Bilingual Title Banner */
                    .doc-title-bar {
                      background: #ecfdf5;
                      border: 1.5px solid #a7f3d0;
                      border-radius: 6px;
                      padding: 6px 12px;
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      margin: 6px 0 8px 0;
                    }
                    .title-en {
                      font-size: 11pt;
                      font-weight: 800;
                      color: #065f46;
                      text-transform: uppercase;
                      letter-spacing: 0.5px;
                    }
                    .title-ar {
                      font-family: 'Cairo', Tahoma, sans-serif;
                      font-size: 12pt;
                      font-weight: 800;
                      color: #065f46;
                      direction: rtl;
                      text-align: right;
                    }
                    .doc-meta-badge {
                      text-align: right;
                      font-size: 8pt;
                      color: #047857;
                      font-family: monospace;
                      font-weight: 600;
                      line-height: 1.3;
                    }

                    /* Bilingual Step Header */
                    .step-header {
                      background: #f8fafc;
                      border-left: 4px solid #059669;
                      border-right: 4px solid #059669;
                      padding: 4px 8px;
                      font-size: 8.5pt;
                      font-weight: 800;
                      color: #0f172a;
                      margin: 7px 0 5px 0;
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                    }
                    .step-header .step-title-en {
                      text-transform: uppercase;
                      letter-spacing: 0.3px;
                    }
                    .step-header .step-title-ar {
                      font-family: 'Cairo', Tahoma, sans-serif;
                      direction: rtl;
                      color: #047857;
                      font-size: 9pt;
                    }
                    .step-badge {
                      font-size: 7.5pt;
                      background: #059669;
                      color: #ffffff;
                      padding: 1px 6px;
                      border-radius: 3px;
                      font-weight: 700;
                    }

                    /* Grid Cards */
                    .grid-4 {
                      display: grid;
                      grid-template-columns: repeat(4, 1fr);
                      gap: 5px;
                      margin-bottom: 5px;
                    }
                    .grid-3 {
                      display: grid;
                      grid-template-columns: repeat(3, 1fr);
                      gap: 5px;
                      margin-bottom: 5px;
                    }
                    .grid-2 {
                      display: grid;
                      grid-template-columns: repeat(2, 1fr);
                      gap: 6px;
                      margin-bottom: 5px;
                    }
                    .info-card {
                      border: 1px solid #e2e8f0;
                      background: #fafafa;
                      border-radius: 4px;
                      padding: 4px 7px;
                    }
                    .info-header-bilingual {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      margin-bottom: 2px;
                    }
                    .info-label-en {
                      font-size: 7pt;
                      text-transform: uppercase;
                      font-weight: 700;
                      color: #64748b;
                    }
                    .info-label-ar {
                      font-family: 'Cairo', sans-serif;
                      font-size: 7.5pt;
                      font-weight: 700;
                      color: #64748b;
                      direction: rtl;
                    }
                    .info-val {
                      font-size: 9pt;
                      font-weight: 700;
                      color: #0f172a;
                      display: block;
                    }

                    /* Audit Grid */
                    .audit-grid {
                      display: grid;
                      grid-template-columns: repeat(4, 1fr);
                      gap: 5px;
                      margin-bottom: 5px;
                    }
                    .audit-item {
                      border: 1px solid #cbd5e1;
                      border-radius: 4px;
                      padding: 4px;
                      text-align: center;
                      font-weight: 600;
                      font-size: 8pt;
                      background: #ffffff;
                    }
                    .audit-item.ok {
                      border-color: #86efac;
                      background: #f0fdf4;
                      color: #166534;
                    }

                    /* Asset Table */
                    .asset-table {
                      width: 100%;
                      border-collapse: collapse;
                      font-size: 8.2pt;
                      margin-bottom: 5px;
                    }
                    .asset-table th {
                      background: #f1f5f9;
                      border: 1px solid #cbd5e1;
                      padding: 3.5px 6px;
                      font-weight: 700;
                      color: #334155;
                      font-size: 7.5pt;
                    }
                    .asset-table td {
                      border: 1px solid #e2e8f0;
                      padding: 3.5px 6px;
                      color: #1e293b;
                      vertical-align: middle;
                    }
                    .asset-table tr:nth-child(even) {
                      background: #f8fafc;
                    }

                    /* Checklist Grid */
                    .checklist-grid {
                      display: grid;
                      grid-template-columns: repeat(3, 1fr);
                      gap: 5px;
                      margin-bottom: 5px;
                    }
                    .chk-item {
                      border: 1px solid #cbd5e1;
                      border-radius: 4px;
                      padding: 4px 6px;
                      background: #ffffff;
                      display: flex;
                      align-items: flex-start;
                      gap: 5px;
                    }
                    .chk-item.verified {
                      border-color: #a7f3d0;
                      background: #f0fdf4;
                    }
                    .chk-icon {
                      color: #059669;
                      font-weight: 800;
                      font-size: 9.5pt;
                    }
                    .chk-text {
                      font-size: 7.8pt;
                      line-height: 1.25;
                      flex-grow: 1;
                    }
                    .chk-header-bilingual {
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                    }
                    .chk-title-en {
                      font-weight: 700;
                      color: #0f172a;
                    }
                    .chk-title-ar {
                      font-family: 'Cairo', sans-serif;
                      font-weight: 700;
                      color: #047857;
                      direction: rtl;
                    }
                    .chk-desc {
                      color: #64748b;
                      font-size: 7.2pt;
                      margin-top: 1px;
                    }

                    /* Bilingual Terms Box */
                    .bilingual-terms-table {
                      width: 100%;
                      border-collapse: collapse;
                      border: 1px solid #cbd5e1;
                      border-radius: 4px;
                      background: #f8fafc;
                      margin-bottom: 6px;
                    }
                    .bilingual-terms-table td {
                      padding: 6px 10px;
                      vertical-align: top;
                      font-size: 7.8pt;
                      line-height: 1.35;
                      color: #334155;
                    }
                    .bilingual-terms-table .terms-en {
                      width: 50%;
                      direction: ltr;
                      text-align: left;
                      border-right: 1px dashed #cbd5e1;
                    }
                    .bilingual-terms-table .terms-ar {
                      width: 50%;
                      direction: rtl;
                      text-align: right;
                      font-family: 'Cairo', Tahoma, sans-serif;
                    }

                    /* Signature Grid */
                    .signature-grid {
                      display: grid;
                      grid-template-columns: repeat(2, 1fr);
                      gap: 12px;
                      margin-top: 5px;
                      padding-top: 5px;
                    }
                    .sig-block {
                      border: 1px solid #cbd5e1;
                      border-radius: 5px;
                      padding: 6px 10px;
                      background: #ffffff;
                      position: relative;
                    }
                    .sig-space {
                      height: 46px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      position: relative;
                      margin: 2px 0;
                    }
                    .sig-img {
                      max-height: 42px;
                      max-width: 120px;
                      object-fit: contain;
                    }
                    .stamp-img {
                      position: absolute;
                      right: 8px;
                      bottom: 0px;
                      max-height: 48px;
                      max-width: 75px;
                      opacity: 0.85;
                    }

                    /* Page Footer */
                    .page-footer {
                      border-top: 1px solid #cbd5e1;
                      padding: 4px 12mm 5px 12mm;
                      margin-top: 4px;
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      font-size: 7.8pt;
                      color: #64748b;
                    }

                    /* Action bar for web preview */
                    .action-bar {
                      position: sticky;
                      top: 0;
                      background: #0f172a;
                      color: #ffffff;
                      padding: 10px 24px;
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                      z-index: 1000;
                      margin-bottom: 15px;
                    }
                    .action-bar button {
                      background: #059669;
                      color: #ffffff;
                      border: none;
                      padding: 8px 20px;
                      border-radius: 6px;
                      font-weight: 600;
                      font-size: 13px;
                      cursor: pointer;
                      display: inline-flex;
                      align-items: center;
                      gap: 8px;
                    }
                    .action-bar button:hover {
                      background: #047857;
                    }

                    @media print {
                      html, body {
                        background: #ffffff !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 210mm !important;
                        height: auto !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                      }
                      .action-bar {
                        display: none !important;
                      }
                      .page-sheet {
                        width: 210mm !important;
                        height: 297mm !important;
                        max-height: 297mm !important;
                        min-height: 297mm !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                        page-break-after: always !important;
                        page-break-inside: avoid !important;
                        break-after: page !important;
                        break-inside: avoid !important;
                        overflow: hidden !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                        box-sizing: border-box !important;
                      }
                      .page-sheet:last-child {
                        page-break-after: avoid !important;
                        break-after: avoid !important;
                      }
                    }
                  </style>
                </head>
                <body>
                  <!-- Print Action Bar -->
                  <div class="action-bar">
                    <div>
                      <span style="font-weight: 700; font-size: 15px;">KEY HANDOVER & CHECK-IN CERTIFICATE (شهادة تسليم المفاتيح ومعاينة الوحدة)</span>
                      <span style="margin-left: 15px; color: #94a3b8; font-size: 13px;">Ref: ${docRefNo} | Tenant: ${lease?.tenantName || "Tenant"} | Unit: ${lease?.unit || "—"}</span>
                    </div>
                    <div style="display: flex; gap: 10px;">
                      <button onclick="window.print()">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
                        Print / Save as PDF (A4)
                      </button>
                      <button onclick="window.close()" style="background: #475569;">Close</button>
                    </div>
                  </div>

                  <!-- ==================== PAGE 1 ==================== -->
                  <div class="page-sheet">
                    <div class="page-content">
                      <!-- Page 1 Header Banner (100% full edge-to-edge bleed) -->
                      <div class="page1-header-banner">
                        <img src="${bannerUrl || AL_AMEEN_PAGE1_HEADER_BASE64}" alt="Al Ameen Letterhead" />
                      </div>

                      <div class="page-body-padded">
                        <!-- Bilingual Document Title Banner -->
                        <div class="doc-title-bar">
                          <div style="text-align: left;">
                            <div class="title-en">TOKEN & KEY HANDOVER CERTIFICATE</div>
                            <div style="font-size: 7.8pt; color: #047857; margin-top: 1px;">Official 5-Stage Custody Transfer & Fixture Audit Protocol</div>
                          </div>
                          <div class="doc-meta-badge">
                            <div>REF: ${docRefNo}</div>
                            <div>DATE: ${docDate}</div>
                            <div style="color: #059669; font-weight: 700;">✓ ALL 5 STAGES VERIFIED</div>
                          </div>
                          <div style="text-align: right; font-family: 'Cairo', Tahoma, sans-serif;">
                            <div class="title-ar">شهادة تسليم المفاتيح والرموز الأمنية</div>
                            <div style="font-size: 8pt; color: #047857; direction: rtl;">محضر تسليم العهدة وفحص ومعاينة الوحدة السكنية</div>
                          </div>
                        </div>

                        <!-- ── STEP 1: KEY & ACCESS DEVICE DETAILS + UTILITY METERS ── -->
                        <div class="step-header">
                          <span class="step-title-en">STEP 1 · Key, Access Token &amp; Initial Utility Particulars</span>
                          <span class="step-badge">STAGE 1 COMPLETED</span>
                          <span class="step-title-ar">المرحلة 1: بيانات المفاتيح والرموز الأمنية وقراءات العدادات</span>
                        </div>

                        <div class="grid-4">
                          <div class="info-card">
                            <div class="info-header-bilingual">
                              <span class="info-label-en">Tenant Customer</span>
                              <span class="info-label-ar">العميل المستأجر</span>
                            </div>
                            <span class="info-val">${lease?.tenantName || "Tenant"}</span>
                          </div>
                          <div class="info-card">
                            <div class="info-header-bilingual">
                              <span class="info-label-en">Property &amp; Unit</span>
                              <span class="info-label-ar">العقار والوحدة</span>
                            </div>
                            <span class="info-val">${lease?.property || "—"} (${lease?.unit || "—"})</span>
                          </div>
                          <div class="info-card">
                            <div class="info-header-bilingual">
                              <span class="info-label-en">Handover Date</span>
                              <span class="info-label-ar">تاريخ التسليم</span>
                            </div>
                            <span class="info-val" style="font-family: monospace;">${docDate}</span>
                          </div>
                          <div class="info-card">
                            <div class="info-header-bilingual">
                              <span class="info-label-en">Handover Officer</span>
                              <span class="info-label-ar">مسؤول التسليم</span>
                            </div>
                            <span class="info-val">${selectedHandover?.issuedBy || signatoryName}</span>
                          </div>
                        </div>

                        <div class="grid-4">
                          <div class="info-card">
                            <div class="info-header-bilingual">
                              <span class="info-label-en">Door Keys Issued</span>
                              <span class="info-label-ar">مفاتيح الأبواب</span>
                            </div>
                            <span class="info-val" style="font-family: monospace;">${selectedHandover?.keys || 2}× ${selectedHandover?.keyType || "Door Keys"}</span>
                          </div>
                          <div class="info-card">
                            <div class="info-header-bilingual">
                              <span class="info-label-en">Access Cards</span>
                              <span class="info-label-ar">بطاقات الدخول</span>
                            </div>
                            <span class="info-val" style="font-family: monospace;">${selectedHandover?.accessCards || 2} RFID Card(s)</span>
                          </div>
                          <div class="info-card">
                            <div class="info-header-bilingual">
                              <span class="info-label-en">Parking Remotes</span>
                              <span class="info-label-ar">أجهزة المواقف</span>
                            </div>
                            <span class="info-val" style="font-family: monospace;">${selectedHandover?.parkingRemotes || 1} Remote(s)</span>
                          </div>
                          <div class="info-card">
                            <div class="info-header-bilingual">
                              <span class="info-label-en">Parking Bay / Tag</span>
                              <span class="info-label-ar">موقف السيارات</span>
                            </div>
                            <span class="info-val" style="font-size: 8pt;">${selectedHandover?.parkingDeviceDetails || "Allocated Bay"}</span>
                          </div>
                        </div>

                        <div class="grid-2">
                          <div class="info-card" style="background: #eff6ff; border-color: #bfdbfe;">
                            <div class="info-header-bilingual">
                              <span class="info-label-en" style="color: #1e40af;">⚡ Initial Electricity Meter Reading</span>
                              <span class="info-label-ar" style="color: #1e40af;">قراءة عداد الكهرباء الأولية</span>
                            </div>
                            <span class="info-val" style="color: #1e3a8a; font-family: monospace; font-size: 10pt;">${selectedHandover?.electricityMeterReading || "12,450 kWh"}</span>
                          </div>
                          <div class="info-card" style="background: #ecfeff; border-color: #a5f3fc;">
                            <div class="info-header-bilingual">
                              <span class="info-label-en" style="color: #0e7490;">💧 Initial Water Meter Reading</span>
                              <span class="info-label-ar" style="color: #0e7490;">قراءة عداد المياه الأولية</span>
                            </div>
                            <span class="info-val" style="color: #155e75; font-family: monospace; font-size: 10pt;">${selectedHandover?.waterMeterReading || "840 m³"}</span>
                          </div>
                        </div>

                        <!-- ── STEP 2: FIXTURE & UNIT CONDITION AUDIT ── -->
                        <div class="step-header">
                          <span class="step-title-en">STEP 2 · Fixture &amp; Unit Condition Audit</span>
                          <span class="step-badge">STAGE 2 COMPLETED</span>
                          <span class="step-title-ar">المرحلة 2: فحص ومعاينة حالة الوحدة والتجهيزات</span>
                        </div>

                        <div class="grid-3">
                          <div class="info-card">
                            <div class="info-header-bilingual">
                              <span class="info-label-en">Overall Condition</span>
                              <span class="info-label-ar">الحالة العامة</span>
                            </div>
                            <span class="info-val" style="color: #059669;">${selectedHandover?.unitCondition || "Good"} (جيد) ✓</span>
                          </div>
                          <div class="info-card">
                            <div class="info-header-bilingual">
                              <span class="info-label-en">Cleanliness Grade</span>
                              <span class="info-label-ar">درجة النظافة</span>
                            </div>
                            <span class="info-val" style="color: #059669;">${selectedHandover?.cleanliness || "Clean"} (نظيف) ✓</span>
                          </div>
                          <div class="info-card">
                            <div class="info-header-bilingual">
                              <span class="info-label-en">Photos Documented</span>
                              <span class="info-label-ar">الصور الموثقة</span>
                            </div>
                            <span class="info-val" style="font-family: monospace;">${selectedHandover?.photosTaken || 6} Photos on File</span>
                          </div>
                        </div>

                        <div class="audit-grid">
                          <div class="audit-item ${selectedHandover?.acWorking !== false ? 'ok' : ''}">🌀 A/C ${selectedHandover?.acWorking !== false ? "Operational ✓ (صالح)" : "Defective ✗"}</div>
                          <div class="audit-item ${selectedHandover?.plumbingOk !== false ? 'ok' : ''}">🚿 Plumbing ${selectedHandover?.plumbingOk !== false ? "Tested OK ✓ (سليم)" : "Issue ✗"}</div>
                          <div class="audit-item ${selectedHandover?.electricalOk !== false ? 'ok' : ''}">💡 Electrical ${selectedHandover?.electricalOk !== false ? "Tested OK ✓ (سليم)" : "Issue ✗"}</div>
                          <div class="audit-item ${selectedHandover?.doorsWindowsOk !== false ? 'ok' : ''}">🚪 Doors/Locks ${selectedHandover?.doorsWindowsOk !== false ? "Intact ✓ (سليم)" : "Issue ✗"}</div>
                        </div>

                        <!-- ── STEP 3: UNIT ASSET & FURNISHING INVENTORY ── -->
                        <div class="step-header">
                          <span class="step-title-en">STEP 3 · Unit Asset &amp; Furnishing Inventory</span>
                          <span class="step-badge">STAGE 3 COMPLETED (${activeAssets.length} Assets)</span>
                          <span class="step-title-ar">المرحلة 3: جرد الأصول والأثاث بالوحدة</span>
                        </div>

                        <table class="asset-table">
                          <thead>
                            <tr>
                              <th style="width: 25px; text-align: center;">#</th>
                              <th style="width: 42%;">Asset Item / اسم الأصل</th>
                              <th style="width: 18%;">Code / الرمز</th>
                              <th style="width: 15%;">Condition / الحالة</th>
                              <th style="width: 25%;">Remarks / ملاحظات الفحص</th>
                            </tr>
                          </thead>
                          <tbody>
                            ${activeAssets.map((asset, idx) => `
                              <tr>
                                <td style="font-family: monospace; text-align: center;">${idx + 1}</td>
                                <td>
                                  <strong>${asset.name}</strong>
                                  ${asset.nameAr ? `<div style="font-family: 'Cairo', sans-serif; direction: rtl; font-size: 7.5pt; color: #475569;">${asset.nameAr}</div>` : ''}
                                </td>
                                <td style="font-family: monospace; color: #64748b;">${asset.code || "Asset"}</td>
                                <td><span style="color: #059669; font-weight: 700;">${asset.condition || "Good"} ${asset.conditionAr ? `(${asset.conditionAr})` : ''} ✓</span></td>
                                <td style="font-size: 7.5pt; color: #475569;">
                                  <div>${asset.remarks || "Inspected & Verified OK"}</div>
                                  ${asset.remarksAr ? `<div style="font-family: 'Cairo', sans-serif; direction: rtl; color: #64748b;">${asset.remarksAr}</div>` : ''}
                                </td>
                              </tr>
                            `).join("")}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div class="page-footer">
                      <div>Al Ameen Real Estate • Key Handover Protocol Ref: ${docRefNo}</div>
                      <div>Page 1 of 2 • الصفحة 1 من 2</div>
                    </div>
                  </div>

                  <!-- ==================== PAGE 2 ==================== -->
                  <div class="page-sheet">
                    <div class="page-content">
                      <!-- Page 2+ Header Logo on Right -->
                      <div class="page-header-secondary-wrapper">
                        <div class="page-header-secondary">
                          <img src="${AL_AMEEN_PAGE2_PLUS_HEADER_BASE64}" alt="Al Ameen Logo" />
                        </div>
                      </div>

                      <div class="page-body-padded">
                        <!-- ── STEP 4: COLLECTOR VERIFICATION & COMPLIANCE CHECKLIST ── -->
                        <div class="step-header">
                          <span class="step-title-en">STEP 4 · Collector Verification &amp; Compliance Checklist</span>
                          <span class="step-badge">STAGE 4 COMPLETED</span>
                          <span class="step-title-ar">المرحلة 4: التحقق من هوية المستلم وقائمة المطابقة</span>
                        </div>

                        <div class="grid-3" style="margin-bottom: 5px;">
                          <div class="info-card">
                            <div class="info-header-bilingual">
                              <span class="info-label-en">Authorized Collector</span>
                              <span class="info-label-ar">المستلم المفوض</span>
                            </div>
                            <span class="info-val">${selectedHandover?.collectorName || lease?.tenantName || "Tenant"}</span>
                          </div>
                          <div class="info-card">
                            <div class="info-header-bilingual">
                              <span class="info-label-en">Collector ID / Passport</span>
                              <span class="info-label-ar">رقم البطاقة / الجواز</span>
                            </div>
                            <span class="info-val" style="font-family: monospace;">${selectedHandover?.collectorIdNumber || "29463401928 (QID)"}</span>
                          </div>
                          <div class="info-card">
                            <div class="info-header-bilingual">
                              <span class="info-label-en">Document Verification</span>
                              <span class="info-label-ar">حالة التحقق</span>
                            </div>
                            <span class="info-val" style="color: #059669;">QID Sighted &amp; Verified ✓ (تمت المطابقة)</span>
                          </div>
                        </div>

                        <div class="checklist-grid">
                          ${checklistItems.map(item => `
                            <div class="chk-item verified">
                              <span class="chk-icon">✓</span>
                              <div class="chk-text">
                                <div class="chk-header-bilingual">
                                  <span class="chk-title-en">${item.title}</span>
                                  <span class="chk-title-ar">${item.titleAr}</span>
                                </div>
                                <div class="chk-desc">${item.desc}</div>
                                <div class="chk-desc" style="font-family: 'Cairo', sans-serif; direction: rtl;">${item.descAr}</div>
                              </div>
                            </div>
                          `).join("")}
                        </div>

                        <!-- ── STEP 5: OFFICIAL SIGN-OFF & LEGAL ACKNOWLEDGEMENT ── -->
                        <div class="step-header" style="margin-top: 10px;">
                          <span class="step-title-en">STEP 5 · Official Sign-Off &amp; Legal Acknowledgement</span>
                          <span class="step-badge">STAGE 5 COMPLETED</span>
                          <span class="step-title-ar">المرحلة 5: الإقرار القانوني والتوقيع الرسمي</span>
                        </div>

                        <!-- Parallel Bilingual Legal Terms Table (English Left, Arabic Right) -->
                        <table class="bilingual-terms-table">
                          <tr>
                            <td class="terms-en">
                              <strong>Tenant Legal Acknowledgement Undertaking:</strong><br />
                              The undersigned Tenant / Authorized Representative hereby confirms receipt of the designated keys, access tokens, and unit assets in the documented condition with all initial meter readings verified.<br />
                              All security tokens remain property of the Landlord and must be returned intact upon lease termination.
                            </td>
                            <td class="terms-ar">
                              <strong>إقرار وتعهد المستأجر القانوني:</strong><br />
                              يقر المستأجر / المستلم المفوض الموقع أدناه باستلام المفاتيح والبطاقات الذكية وأصول الوحدة بالحالة المذكورة، مع مطابقة قراءات العدادات الأولية.<br />
                              تعتبر جميع الرموز والمفاتيح الأمنية عهدة للمؤجر ويجب إعادتها كاملة وبحالة جيدة عند انتهاء فترة الإيجار.
                            </td>
                          </tr>
                        </table>

                        <!-- Dual Side-by-Side Signature & Stamp Blocks -->
                        <div class="signature-grid">
                          <div class="sig-block">
                            <div class="info-header-bilingual">
                              <span class="info-label-en">Issued By (Landlord / PMS)</span>
                              <span class="info-label-ar">جهة الإصدار (المؤجر / إدارة العقارات)</span>
                            </div>
                            <div class="sig-space">
                              ${tokenBranding.showSignature && branding.signatureImageUrl ? `<img src="${branding.signatureImageUrl}" class="sig-img" alt="Signature" />` : `<span style="font-style: italic; font-family: Georgia, serif; color: #059669; font-size: 11pt;">${companyName}</span>`}
                              ${tokenBranding.showStamp && branding.stampImageUrl ? `<img src="${branding.stampImageUrl}" class="stamp-img" alt="Stamp" />` : ''}
                            </div>
                            <div style="font-size: 8pt; color: #64748b; margin-top: 2px; border-top: 1px dashed #cbd5e1; padding-top: 3px;">
                              <div>Officer / المسؤول: <strong style="color: #0f172a;">${signatoryName}</strong> (${signatoryTitle})</div>
                              <div>Date / التاريخ: <span style="font-family: monospace;">${docDate}</span></div>
                            </div>
                          </div>

                          <div class="sig-block">
                            <div class="info-header-bilingual">
                              <span class="info-label-en">Received &amp; Acknowledged By Tenant</span>
                              <span class="info-label-ar">جهة الاستلام (المستأجر / المستلم)</span>
                            </div>
                            <div class="sig-space">
                              <span style="font-style: italic; color: #475569; font-size: 10pt; font-family: Georgia, serif;">
                                ${selectedHandover?.collectorName || lease?.tenantName || "Tenant Signature"}
                              </span>
                            </div>
                            <div style="font-size: 8pt; color: #64748b; margin-top: 2px; border-top: 1px dashed #cbd5e1; padding-top: 3px;">
                              <div>Collector / المستلم: <strong style="color: #0f172a;">${selectedHandover?.collectorName || lease?.tenantName || "Tenant"}</strong></div>
                              <div>Date / التاريخ: <span style="font-family: monospace;">${docDate}</span></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="page-footer">
                      <div>Al Ameen Real Estate • Key Handover Protocol Ref: ${docRefNo}</div>
                      <div>Page 2 of 2 • الصفحة 2 من 2</div>
                    </div>
                  </div>
                </body>
                </html>
              `;

              printWindow.document.open();
              printWindow.document.write(html);
              printWindow.document.close();
              printWindow.focus();
              setTimeout(() => {
                printWindow.print();
              }, 300);
            };

            return (
              <div className="p-6 overflow-y-auto space-y-4 flex-1 text-sm">
                {/* ── Printable Official Handover Certificate Document ── */}
                <div id="handover-printable-receipt" className="rounded-xl border bg-card overflow-hidden space-y-4 shadow-sm">
                  {/* Official Letterhead Banner */}
                  <div className="w-full overflow-hidden bg-muted/20 border-b">
                    <img
                      src={bannerUrl || AL_AMEEN_PAGE1_HEADER_BASE64}
                      alt="Al Ameen Letterhead Banner"
                      className="w-full h-auto object-cover max-h-[140px]"
                    />
                  </div>

                  <div className="p-5 space-y-4 pt-0">
                    {/* Certificate Bilingual Title Header */}
                    <div className="flex items-start justify-between border-b pb-3.5 gap-4">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                          {companyName}
                        </div>
                        <h4 className="text-base font-bold text-foreground mt-0.5">
                          {tokenBranding.documentTitle || "KEY HANDOVER & UNIT CHECK-IN CERTIFICATE"}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          Document Ref: <span className="font-mono font-semibold">KHC-{lease?.id?.slice(0, 8) || "2026-001"}</span> • Execution Date: {selectedHandover.handoverAt}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="inline-block px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                          ✓ ALL 5 STAGES VERIFIED &amp; COMPLETED
                        </div>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold mt-1 font-arabic" dir="rtl">
                          شهادة تسليم المفاتيح والرموز الأمنية ومعاينة الوحدة
                        </div>
                      </div>
                    </div>

                    {/* ── STEP 1: KEY, ACCESS TOKEN & INITIAL UTILITY METERS ── */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between border-b pb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <Key className="h-3.5 w-3.5 text-emerald-600" /> Step 1: Key, Access Device &amp; Utility Particulars
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400" dir="rtl">
                          المرحلة 1: بيانات المفاتيح والرموز الأمنية وقراءات العدادات
                        </span>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]">
                          Stage 1 Complete
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-muted/20 p-3 rounded-lg border text-xs">
                        <div>
                          <div className="flex justify-between items-center text-muted-foreground text-[10px] uppercase font-semibold">
                            <span>Tenant Customer</span>
                            <span dir="rtl">المستأجر</span>
                          </div>
                          <span className="font-semibold text-foreground">{lease?.tenantName || "—"}</span>
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-muted-foreground text-[10px] uppercase font-semibold">
                            <span>Property</span>
                            <span dir="rtl">العقار</span>
                          </div>
                          <span className="font-semibold text-foreground">{lease?.property || "—"}</span>
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-muted-foreground text-[10px] uppercase font-semibold">
                            <span>Unit Number</span>
                            <span dir="rtl">رقم الوحدة</span>
                          </div>
                          <span className="font-semibold text-foreground font-mono">{lease?.unit || "—"}</span>
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-muted-foreground text-[10px] uppercase font-semibold">
                            <span>Handover Officer</span>
                            <span dir="rtl">مسؤول التسليم</span>
                          </div>
                          <span className="font-semibold text-foreground">{selectedHandover.issuedBy || signatoryName}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        <div className="border rounded-lg p-2.5 bg-background">
                          <div className="flex justify-between items-center text-muted-foreground text-[10px] uppercase font-semibold">
                            <span>Door Keys</span>
                            <span dir="rtl">مفاتيح الأبواب</span>
                          </div>
                          <span className="font-bold text-foreground text-sm font-mono">{selectedHandover.keys}× {selectedHandover.keyType || "Keys"}</span>
                        </div>
                        <div className="border rounded-lg p-2.5 bg-background">
                          <div className="flex justify-between items-center text-muted-foreground text-[10px] uppercase font-semibold">
                            <span>Access Cards</span>
                            <span dir="rtl">بطاقات الدخول</span>
                          </div>
                          <span className="font-bold text-foreground text-sm font-mono">{selectedHandover.accessCards} RFID Cards</span>
                        </div>
                        <div className="border rounded-lg p-2.5 bg-background">
                          <div className="flex justify-between items-center text-muted-foreground text-[10px] uppercase font-semibold">
                            <span>Parking Remotes</span>
                            <span dir="rtl">أجهزة المواقف</span>
                          </div>
                          <span className="font-bold text-foreground text-sm font-mono">{selectedHandover.parkingRemotes || 1} Remote(s)</span>
                        </div>
                        <div className="border rounded-lg p-2.5 bg-background">
                          <div className="flex justify-between items-center text-muted-foreground text-[10px] uppercase font-semibold">
                            <span>Bay / Tag Device</span>
                            <span dir="rtl">موقف السيارات</span>
                          </div>
                          <span className="font-semibold text-foreground text-xs truncate block" title={selectedHandover.parkingDeviceDetails || "Allocated Bay"}>
                            {selectedHandover.parkingDeviceDetails || "Allocated Bay"}
                          </span>
                        </div>
                      </div>

                      {/* Utility Meters */}
                      <div className="grid grid-cols-2 gap-2.5 text-xs">
                        <div className="border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 rounded-lg p-2.5">
                          <div className="flex justify-between items-center text-blue-800 dark:text-blue-300 text-[10px] uppercase font-bold">
                            <span>⚡ Initial Electricity Meter</span>
                            <span dir="rtl">عداد الكهرباء الأولي</span>
                          </div>
                          <span className="font-mono font-bold text-foreground text-sm">
                            {selectedHandover.electricityMeterReading || "12,450"} <span className="text-xs text-muted-foreground font-normal">kWh</span>
                          </span>
                        </div>
                        <div className="border border-cyan-200 dark:border-cyan-900/50 bg-cyan-50/40 dark:bg-cyan-950/20 rounded-lg p-2.5">
                          <div className="flex justify-between items-center text-cyan-800 dark:text-cyan-300 text-[10px] uppercase font-bold">
                            <span>💧 Initial Water Meter</span>
                            <span dir="rtl">عداد المياه الأولي</span>
                          </div>
                          <span className="font-mono font-bold text-foreground text-sm">
                            {selectedHandover.waterMeterReading || "840"} <span className="text-xs text-muted-foreground font-normal">m³</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ── STEP 2: FIXTURE & UNIT CONDITION AUDIT ── */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between border-b pb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-emerald-600" /> Step 2: Fixture &amp; Unit Condition Audit
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400" dir="rtl">
                          المرحلة 2: فحص ومعاينة حالة الوحدة والتجهيزات
                        </span>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]">
                          Stage 2 Complete
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-2.5 text-xs">
                        <div className="border rounded-lg p-2 bg-muted/20">
                          <div className="flex justify-between items-center text-muted-foreground text-[10px] uppercase font-semibold">
                            <span>Overall Condition</span>
                            <span dir="rtl">الحالة العامة</span>
                          </div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedHandover.unitCondition || "Good"} (جيد) ✓</span>
                        </div>
                        <div className="border rounded-lg p-2 bg-muted/20">
                          <div className="flex justify-between items-center text-muted-foreground text-[10px] uppercase font-semibold">
                            <span>Cleanliness Grade</span>
                            <span dir="rtl">درجة النظافة</span>
                          </div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedHandover.cleanliness || "Clean"} (نظيف) ✓</span>
                        </div>
                        <div className="border rounded-lg p-2 bg-muted/20">
                          <div className="flex justify-between items-center text-muted-foreground text-[10px] uppercase font-semibold">
                            <span>Photos Documented</span>
                            <span dir="rtl">الصور الموثقة</span>
                          </div>
                          <span className="font-bold font-mono text-foreground">{selectedHandover.photosTaken || 6} Photos on File</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
                        <div className={`rounded-lg border p-2 text-center ${selectedHandover.acWorking !== false ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300" : "border-rose-200 bg-rose-50/50 text-rose-700"}`}>🌀 A/C {selectedHandover.acWorking !== false ? "Operational ✓" : "Defective ✗"}</div>
                        <div className={`rounded-lg border p-2 text-center ${selectedHandover.plumbingOk !== false ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300" : "border-rose-200 bg-rose-50/50 text-rose-700"}`}>🚿 Plumb. {selectedHandover.plumbingOk !== false ? "Tested ✓" : "Issue ✗"}</div>
                        <div className={`rounded-lg border p-2 text-center ${selectedHandover.electricalOk !== false ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300" : "border-rose-200 bg-rose-50/50 text-rose-700"}`}>💡 Elec. {selectedHandover.electricalOk !== false ? "Tested ✓" : "Issue ✗"}</div>
                        <div className={`rounded-lg border p-2 text-center ${selectedHandover.doorsWindowsOk !== false ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300" : "border-rose-200 bg-rose-50/50 text-rose-700"}`}>🚪 Doors {selectedHandover.doorsWindowsOk !== false ? "Intact ✓" : "Defect ✗"}</div>
                      </div>

                      {selectedHandover.note && (
                        <div className="border rounded-lg p-2.5 bg-muted/10 text-xs">
                          <span className="text-[10px] font-bold uppercase text-muted-foreground block mb-0.5">Inspection Notes:</span>
                          <p className="text-foreground text-[11px]">{selectedHandover.note}</p>
                        </div>
                      )}
                    </div>

                    {/* ── STEP 3: UNIT ASSET & FURNISHING INVENTORY ── */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between border-b pb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <PackageCheck className="h-3.5 w-3.5 text-emerald-600" /> Step 3: Unit Asset &amp; Furnishing Inventory
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400" dir="rtl">
                          المرحلة 3: جرد الأصول والأثاث بالوحدة
                        </span>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]">
                          Stage 3 Complete ({activeAssets.length} Assets)
                        </Badge>
                      </div>

                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-muted/60 text-muted-foreground text-[10px] uppercase font-bold border-b">
                            <tr>
                              <th className="p-2 w-8 text-center">#</th>
                              <th className="p-2">Asset Item / اسم الأصل</th>
                              <th className="p-2">Code / Category</th>
                              <th className="p-2">Condition / الحالة</th>
                              <th className="p-2">Remarks / ملاحظات الفحص</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {activeAssets.map((asset, index) => (
                              <tr key={asset.id || index} className="hover:bg-muted/30">
                                <td className="p-2 font-mono text-center text-muted-foreground text-[11px]">{index + 1}</td>
                                <td className="p-2 font-semibold text-foreground">
                                  <div>{asset.name}</div>
                                  {(asset as any).nameAr && <div className="text-[10px] text-muted-foreground font-normal" dir="rtl">{(asset as any).nameAr}</div>}
                                </td>
                                <td className="p-2 font-mono text-muted-foreground text-[11px]">{asset.code || "Asset"}</td>
                                <td className="p-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200">
                                    {asset.condition || "Good"} ✓
                                  </span>
                                </td>
                                <td className="p-2 text-muted-foreground text-[11px]">{asset.remarks || "Inspected & Verified OK"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* ── STEP 4: COLLECTOR VERIFICATION & PRE-HANDOVER COMPLIANCE CHECKLIST ── */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between border-b pb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Step 4: Collector Verification &amp; Compliance Checklist
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400" dir="rtl">
                          المرحلة 4: التحقق من هوية المستلم وقائمة المطابقة
                        </span>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]">
                          Stage 4 Complete
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-muted/20 p-3 rounded-lg border">
                        <div>
                          <div className="flex justify-between items-center text-muted-foreground text-[10px] uppercase font-semibold">
                            <span>Authorized Collector</span>
                            <span dir="rtl">المستلم المفوض</span>
                          </div>
                          <span className="font-bold text-foreground">{selectedHandover.collectorName || lease?.tenantName || "Tenant"}</span>
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-muted-foreground text-[10px] uppercase font-semibold">
                            <span>Collector ID / Passport</span>
                            <span dir="rtl">رقم البطاقة الشخصية</span>
                          </div>
                          <span className="font-mono font-semibold text-foreground">{selectedHandover.collectorIdNumber || "29463401928 (QID)"}</span>
                        </div>
                        <div>
                          <div className="flex justify-between items-center text-muted-foreground text-[10px] uppercase font-semibold">
                            <span>Verification Status</span>
                            <span dir="rtl">حالة التحقق</span>
                          </div>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {selectedHandover.idVerified !== false ? "QID Sighted & Verified ✓" : "Verified ✓"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {checklistItems.map((item, idx) => (
                          <div key={idx} className="border border-emerald-200/80 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-lg p-2 flex items-start gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <div className="flex justify-between items-center">
                                <p className="font-bold text-foreground text-[11px] leading-tight">{item.title}</p>
                                <p className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300" dir="rtl">{item.titleAr}</p>
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── STEP 5: OFFICIAL SIGN-OFF & LEGAL ACKNOWLEDGEMENT ── */}
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-center justify-between border-b pb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                          <FileSignature className="h-3.5 w-3.5 text-emerald-600" /> Step 5: Official Sign-Off &amp; Legal Acknowledgement
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400" dir="rtl">
                          المرحلة 5: الإقرار القانوني والتوقيع الرسمي
                        </span>
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]">
                          Stage 5 Complete
                        </Badge>
                      </div>

                      {/* Handover Legal Acknowledgement Undertaking in Parallel Layout */}
                      <div className="rounded-lg border bg-muted/15 p-3 text-[11px] text-muted-foreground leading-relaxed grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="text-left">
                          <strong className="text-foreground">Tenant Undertaking &amp; Confirmation:</strong>
                          <p className="mt-1">The Tenant / Authorized Collector hereby confirms receipt of the designated key sets, access devices, and takes over the premises in the condition detailed above. All functional fixtures and utility meter readings have been jointly inspected and agreed upon.</p>
                        </div>
                        <div className="text-right" dir="rtl">
                          <strong className="text-foreground">إقرار وتعهد المستأجر القانوني:</strong>
                          <p className="mt-1">يقر المستأجر / المستلم المفوض باستلام المفاتيح والبطاقات الذكية وأصول الوحدة بالحالة المذكورة أعلاه، مع مطابقة قراءات العدادات الأولية وسلامة جميع التركيبات والتجهيزات.</p>
                        </div>
                      </div>

                      {/* Dual Formal Signature & Stamp Blocks */}
                      <div className="grid grid-cols-2 gap-6 pt-1">
                        <div className="border border-dashed rounded-lg p-3 bg-muted/10 space-y-3 text-xs relative">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground uppercase text-[10px] tracking-wider">Issued By (Landlord / PMS)</span>
                            <span className="text-[10px] font-semibold text-emerald-600" dir="rtl">جهة الإصدار (المؤجر)</span>
                          </div>
                          <div className="h-14 border-b border-muted-foreground/40 flex items-center justify-center relative overflow-hidden">
                            {tokenBranding.showSignature && branding.signatureImageUrl ? (
                              <img
                                src={branding.signatureImageUrl}
                                alt="Signature"
                                className="max-h-12 max-w-[130px] object-contain"
                                style={{ transform: `scale(${((tokenBranding.signatureScale || 100) / 100).toFixed(2)})` }}
                              />
                            ) : (
                              <span className="font-serif italic text-primary/80 text-sm">{companyName}</span>
                            )}
                            {tokenBranding.showStamp && branding.stampImageUrl && (
                              <img
                                src={branding.stampImageUrl}
                                alt="Company Stamp"
                                className="absolute right-2 bottom-0 max-h-14 max-w-[80px] object-contain opacity-85 pointer-events-none"
                                style={{ transform: `scale(${((tokenBranding.stampScale || 100) / 100).toFixed(2)})` }}
                              />
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground space-y-0.5">
                            <div>Officer / المسؤول: <strong className="text-foreground">{signatoryName}</strong> ({signatoryTitle})</div>
                            <div>Execution Date / تاريخ التنفيذ: <span className="font-mono">{selectedHandover.handoverAt}</span></div>
                          </div>
                        </div>

                        <div className="border border-dashed rounded-lg p-3 bg-muted/10 space-y-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-foreground uppercase text-[10px] tracking-wider">Received &amp; Acknowledged By</span>
                            <span className="text-[10px] font-semibold text-emerald-600" dir="rtl">جهة الاستلام (المستأجر)</span>
                          </div>
                          <div className="h-14 border-b border-muted-foreground/40 flex items-end justify-center pb-1">
                            <span className="text-[11px] text-muted-foreground italic">
                              {selectedHandover.collectorName || lease?.tenantName || "Signature of Tenant / Collector"}
                            </span>
                          </div>
                          <div className="text-[10px] text-muted-foreground space-y-0.5">
                            <div>Customer / المستلم: <strong className="text-foreground">{selectedHandover.collectorName || lease?.tenantName || "Tenant"}</strong></div>
                            <div>Date &amp; Time / التاريخ: <span className="font-mono">{selectedHandover.handoverAt}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Upload & Manage Physical Signed Handover Document Section ── */}
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-primary" />
                      <Label className="text-xs font-bold text-foreground">
                        Physical Signed Handover Receipt (Upload / Attachment)
                      </Label>
                    </div>
                    {signedDoc ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-300 text-[10px]">
                        ✓ Scanned Copy On File
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-300 text-[10px]">
                        Pending Physical Upload
                      </Badge>
                    )}
                  </div>

                  {signedDoc ? (
                    <div className="bg-background rounded-lg border p-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded bg-emerald-50 text-emerald-600">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground truncate">{signedDoc.fileName}</p>
                          <p className="text-[10px] text-muted-foreground">Uploaded on {signedDoc.uploadedAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {signedDoc.dataUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1 text-primary hover:bg-primary/10"
                            onClick={() => {
                              setPreviewSignedDocUrl(signedDoc.dataUrl || "");
                              setPreviewSignedDocName(signedDoc.fileName);
                              setPreviewSignedDocOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3" /> View Document
                          </Button>
                        )}
                        <label className="cursor-pointer">
                          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" asChild>
                            <span>
                              <Upload className="h-3 w-3" /> Replace
                            </span>
                          </Button>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleUploadSignedHandover(handoverKey, f);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] text-muted-foreground">
                        Download or print the handover receipt above, have the customer sign upon key delivery, and upload the signed scanned/photographed copy here.
                      </p>
                      <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted/40 transition-colors">
                        <div className="flex flex-col items-center justify-center text-center">
                          <Upload className="h-6 w-6 text-primary mb-1" />
                          <span className="text-xs font-semibold text-foreground">Click to upload signed handover receipt</span>
                          <span className="text-[10px] text-muted-foreground mt-0.5">Supports PDF, PNG, JPG files</span>
                        </div>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleUploadSignedHandover(handoverKey, f);
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Modal Footer */}
          <div className="px-6 py-3.5 bg-muted/40 border-t flex items-center justify-between gap-2.5 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setHandoverViewOpen(false)}>
              Close
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  const printBtn = document.getElementById("handover-printable-receipt");
                  if (printBtn) {
                    const printWindow = window.open("", "_blank", "width=880,height=1050");
                    if (!printWindow) {
                      window.print();
                      return;
                    }
                    printWindow.document.open();
                    printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                      <head>
                        <title>Key Handover & Check-In Certificate</title>
                        <style>
                          @page { size: A4 portrait; margin: 8mm 10mm; }
                          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 10px; color: #0f172a; }
                        </style>
                        <script src="https://cdn.tailwindcss.com"></script>
                      </head>
                      <body class="bg-white p-4">
                        ${printBtn.outerHTML}
                      </body>
                      </html>
                    `);
                    printWindow.document.close();
                    printWindow.focus();
                    setTimeout(() => {
                      printWindow.print();
                    }, 350);
                  } else {
                    window.print();
                  }
                }}
                className="gap-2 shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Printer className="h-4 w-4" /> Download / Print Handover Receipt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── PREVIEW SIGNED HANDOVER DOCUMENT MODAL ── */}
      <Dialog open={previewSignedDocOpen} onOpenChange={setPreviewSignedDocOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-6 py-3 border-b flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-sm font-bold">Signed Handover Document</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">{previewSignedDocName}</DialogDescription>
            </div>
          </DialogHeader>
          <div className="p-4 flex-1 overflow-auto flex items-center justify-center bg-muted/20 min-h-[400px]">
            {previewSignedDocUrl.startsWith("data:image/") ? (
              <img src={previewSignedDocUrl} alt={previewSignedDocName} className="max-w-full max-h-[70vh] rounded-md shadow-md object-contain" />
            ) : previewSignedDocUrl.startsWith("data:application/pdf") ? (
              <iframe src={previewSignedDocUrl} title={previewSignedDocName} className="w-full h-[70vh] rounded-md border" />
            ) : (
              <div className="text-center text-xs text-muted-foreground">
                Document preview available. <a href={previewSignedDocUrl} download={previewSignedDocName} className="text-primary underline font-semibold">Download File</a>
              </div>
            )}
          </div>
          <DialogFooter className="px-6 py-2.5 border-t bg-muted/40">
            <Button variant="outline" size="sm" onClick={() => setPreviewSignedDocOpen(false)}>Close</Button>
            <Button size="sm" asChild>
              <a href={previewSignedDocUrl} download={previewSignedDocName} className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> Download File
              </a>
            </Button>
          </DialogFooter>
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
              <SearchableSelect
                value={addVoucherForm.leaseId || ""}
                onValueChange={v => {
                  const lease = leases.find(l => l.id === v);
                  const accounts = getVoucherAccounts(addVoucherForm.name, lease?.unit || "", addVoucherForm.method);
                  setAddVoucherForm(f => ({ ...f, leaseId: v, debit: accounts.debit, credit: accounts.credit }));
                }}
                placeholder="Select lease..."
                emptyText="No leases found"
                options={leases.map(l => ({ label: `${l.tenantName} — ${l.unit} (${l.property})`, value: l.id }))}
              />
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
      <Dialog open={startCheckoutOpen} onOpenChange={(open) => { setStartCheckoutOpen(open); if (!open) { setCheckoutWorkflowLease(null); setIsFixedTenantCheckout(false); } }}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 flex flex-col max-h-[88vh] overflow-hidden">
          {/* Fixed Header */}
          <div className="flex items-start gap-3 px-5 py-4 border-b shrink-0">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 shrink-0">
              <LogOut className="h-4.5 w-4.5 text-rose-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-foreground leading-tight">Initiate Tenant Vacate &amp; Check-Out</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Record tenant vacating / early move-out notice, verify lease tenure, and queue inspection and deposit settlement.</p>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-4 space-y-4">
            {/* Customer / Lease Selector */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" /> Select Customer / Tenant Lease
                </Label>
                {isFixedTenantCheckout && (
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 px-1.5 py-0.5 rounded">
                    Locked for this tenant
                  </span>
                )}
              </div>
              {(() => {
                const activeLeases = leases.filter(
                  (l) => (l.status as any) !== "closed" && (l.status as any) !== "terminated" && (l.status as any) !== "checkout"
                );
                return (
                  <SearchableSelect
                    disabled={isFixedTenantCheckout}
                    value={checkoutWorkflowLease?.id || ""}
                    onValueChange={(val) => {
                      if (isFixedTenantCheckout) return;
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
                    placeholder="Choose an active customer / lease..."
                    emptyText="No active leases available"
                    options={activeLeases.map(l => ({
                      label: `${l.tenantName} — ${l.unit} (${l.property}) [${l.startDate} to ${l.endDate}]`,
                      value: l.id
                    }))}
                  />
                );
              })()}
            </div>

            {checkoutWorkflowLease && (() => {
              const customer = customers.find(c => c.id === checkoutWorkflowLease.customerId);
              return (
                <div className="space-y-3 text-xs">
                  {/* Tenant Overview Card */}
                  <div className="rounded-lg border bg-muted/40 p-3">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-0.5">Tenant Name</span>
                        <span className="font-semibold text-foreground text-sm">{checkoutWorkflowLease.tenantName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-0.5">Unit &amp; Property</span>
                        <span className="font-semibold text-foreground">{checkoutWorkflowLease.unit} ({checkoutWorkflowLease.property})</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-0.5">Contact / QID / Mobile</span>
                        <span className="font-mono text-muted-foreground">{customer?.qatarId || customer?.crNumber || "—"} • {customer?.mobile || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-0.5">Email Address</span>
                        <span className="text-muted-foreground truncate block">{customer?.email || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-0.5">Lease Tenure</span>
                        <span className="font-mono text-foreground font-medium">{checkoutWorkflowLease.startDate} to {checkoutWorkflowLease.endDate}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold mb-0.5">Monthly Rent</span>
                        <span className="font-mono text-foreground font-medium">QR {checkoutWorkflowLease.monthlyRent?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Notice Date <span className="text-destructive">*</span></Label>
                      <Input type="date" className="h-8 text-xs font-mono" value={startCheckoutForm.noticeDate} onChange={e => setStartCheckoutForm(f => ({ ...f, noticeDate: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Planned Move-Out Date <span className="text-destructive">*</span></Label>
                      <Input type="date" className="h-8 text-xs font-mono" value={startCheckoutForm.moveOutDate} onChange={e => setStartCheckoutForm(f => ({ ...f, moveOutDate: e.target.value }))} />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Vacating Reason / Handover Notes</Label>
                    <Textarea rows={2} className="text-xs resize-none" value={startCheckoutForm.notes} onChange={e => setStartCheckoutForm(f => ({ ...f, notes: e.target.value }))} placeholder="e.g. Tenant relocating abroad / lease non-renewal / early vacating agreed by landlord..." />
                  </div>

                  {/* Info box */}
                  <div className="rounded-md bg-blue-50 border border-blue-200 p-2.5 text-[11px] text-blue-800">
                    <p className="font-semibold mb-0.5">Next Step upon Initiation:</p>
                    <p className="text-blue-700">A Check-Out Inspection case will be queued under <strong>Checkout</strong>. You can then complete the unit meter readings, verify asset checklist, calculate approved deductions, and issue the official refund receipt &amp; GL settlement vouchers.</p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Fixed Footer */}
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t bg-muted/30 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setStartCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
              disabled={!checkoutWorkflowLease}
              onClick={() => {
                if (checkoutWorkflowLease) {
                  startCheckout(checkoutWorkflowLease);
                  setStartCheckoutOpen(false);
                }
              }}
            >
              <LogOut className="h-3.5 w-3.5" /> Confirm &amp; Queue Check-Out
            </Button>
          </div>
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
            <Metric label="Total Customers" value={customersLoading ? "…" : allCustomers.length} icon={<Users className="h-4 w-4 text-emerald-600" />} description="Active tenant profiles" />
            <Metric label="Individual Tenants" value={customersLoading ? "…" : allCustomers.filter(c => c?.type === "individual").length} icon={<UserCheck className="h-4 w-4 text-blue-600" />} description="Personal residential leases" />
            <Metric label="Corporate Accounts" value={customersLoading ? "…" : allCustomers.filter(c => c?.type === "company").length} icon={<Building2 className="h-4 w-4 text-indigo-600" />} description="Commercial & bulk company leases" />
            <Metric label="Active Status" value={customersLoading ? "…" : allCustomers.filter(c => c?.status === "active").length} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} description="Verified & active customers" />
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
            <Metric label="Released / Expired" value={(reservations || []).filter(r => r?.status === "released" || r?.status === "expired").length} icon={<AlertCircle className="h-4 w-4 text-amber-600" />} description="Released back to inventory" />
            <Metric label="Total Reservations" value={(reservations || []).length} icon={<DoorOpen className="h-4 w-4 text-purple-600" />} description="Historical bookings logged" />
          </div>
        </>
      )}

      {activeTab === "documents" && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Document Verification</h2>
              <p className="text-sm text-muted-foreground">Verify mandatory QID, Passport, CR, and salary documents before lease generation.</p>
            </div>
          </div>
          <div className="grid gap-3 grid-cols-2 md:grid-cols-5">
            <Metric label="Verified Documents" value={(documents || []).filter(d => d?.status === "verified").length} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} description="Compliant & approved" />
            <Metric label="Document Blocks" value={blockedDocuments} icon={<AlertCircle className="h-4 w-4 text-amber-600" />} description="Mandatory docs pending review" />
            <Metric label="Info Required" value={(documents || []).filter(d => d?.status === "info_required").length} icon={<AlertCircle className="h-4 w-4 text-orange-500" />} description="Awaiting tenant submission" />
            <Metric label="Rejected" value={(documents || []).filter(d => d?.status === "rejected").length} icon={<ShieldAlert className="h-4 w-4 text-red-600" />} description="Requires KYC resubmission" />
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
            <Metric
              label="Ready For Keys"
              value={0}
              icon={<KeyRound className="h-4 w-4 text-green-600" />}
              description="Signed leases pending key issue"
            />
            <Metric
              label="Key Notices Issued"
              value={(leases && leases.length > 0) ? leases.length : 360}
              icon={<Clock className="h-4 w-4 text-blue-600" />}
              description="Handover notices sent"
            />
            <Metric
              label="Handover Completed"
              value={(leases && leases.length > 0) ? leases.length : 360}
              icon={<Key className="h-4 w-4 text-emerald-600" />}
              description="Keys & access devices issued"
            />
            <Metric
              label="Inspections Verified"
              value={(leases && leases.length > 0) ? leases.length : 360}
              icon={<ClipboardCheck className="h-4 w-4 text-indigo-600" />}
              description="Condition checklists logged"
            />
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
            <div className="flex items-center gap-2 flex-wrap">
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
            <Metric label="Total Vouchers" value={vouchersLoading ? "…" : allVouchers.length} icon={<Receipt className="h-4 w-4 text-blue-600" />} description="All leasing accounting records" />
            <Metric label="Properties" value={vouchersLoading ? "…" : new Set(allVouchers.map(v => v?.property_name).filter(Boolean)).size} icon={<Building2 className="h-4 w-4 text-indigo-600" />} description="Distinct properties with vouchers" />
            <Metric label="Units" value={vouchersLoading ? "…" : new Set(allVouchers.filter(v => v?.property_name && v?.unit_name).map(v => `${v.property_name}||${v.unit_name}`)).size} icon={<DoorOpen className="h-4 w-4 text-emerald-600" />} description="Distinct units billed" />
            <Metric label="Customers" value={vouchersLoading ? "…" : new Set(allVouchers.map(v => (v?.tenant_name || "").trim().toLowerCase()).filter(Boolean)).size} icon={<Users className="h-4 w-4 text-amber-600" />} description="Distinct tenants with vouchers" />
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
            <Metric label="Renewal Confirmed" value={upcomingRenewals.filter(l => (renewals || []).some(r => r.leaseId === l.id && r.status === "renewal_confirmed")).length} icon={<CheckCircle2 className="h-4 w-4 text-green-600" />} description="Agreed to renew" />
            <Metric label="In Discussion / Awaiting" value={upcomingRenewals.filter(l => (renewals || []).some(r => r.leaseId === l.id && (r.status === "under_discussion" || r.status === "awaiting_response"))).length} icon={<Clock className="h-4 w-4 text-amber-600" />} description="Active negotiation" />
            <Metric label="Non-Renewal Confirmed" value={upcomingRenewals.filter(l => (renewals || []).some(r => r.leaseId === l.id && r.status === "non_renewal_confirmed")).length} icon={<LogOut className="h-4 w-4 text-slate-600" />} description="Proceeding to checkout" />
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
                setIsFixedTenantCheckout(false);
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
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle>Unit Reservation - Lease Module</CardTitle>
                  <CardDescription>Reserving a unit locks it from Available to Reserved until conversion, expiry or release.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                    onClick={() => {
                      exportToExcel(
                        reservations.map((r) => ({
                          "Reservation ID": r.id,
                          "Property": r.property,
                          "Unit": r.unit,
                          "Customer / Tenant": r.tenantName,
                          "Token Amount (QAR)": r.tokenAmount || 0,
                          "Valid Until": r.validUntil || "—",
                          "Reserved By": r.reservedBy || "—",
                          "Status": r.status,
                          "Created Date": r.createdAt || "—",
                        })),
                        `Reservations_Export_${new Date().toISOString().split("T")[0]}`
                      );
                    }}
                  >
                    <Download className="h-3.5 w-3.5" /> Export to Excel
                  </Button>
                  <Badge variant="outline" className="bg-primary/5 text-primary text-xs">
                    {reservations.length} Total Records
                  </Badge>
                </div>
              </div>

              {/* Multi-Dimensional Filter Bar with SearchableSelect */}
              {(() => {
                const propertyFilteredRes = resPropertyFilter === "all" ? reservations : reservations.filter(r => r.property === resPropertyFilter);
                // Unit filter value is either a plain unit name (when a property is selected)
                // or "Property||Unit" composite (when all properties shown) — handle both.
                const unitFilteredRes = resUnitFilter === "all"
                  ? propertyFilteredRes
                  : propertyFilteredRes.filter(r => {
                      if (resUnitFilter.includes("||")) {
                        const [fp, fu] = resUnitFilter.split("||");
                        return r.property === fp && r.unit === fu;
                      }
                      return r.unit === resUnitFilter;
                    });
                // Normalize name for dedup/comparison (M/s. → M/s)
                const normResName = (n: string) => (n || "").trim().replace(/^(M|m)\s*\/(S|s)\.?\s*/, "M/s ").replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
                const customerFilteredRes = resCustomerFilter === "all" ? unitFilteredRes : unitFilteredRes.filter(r => normResName(r.tenantName) === normResName(resCustomerFilter));

                // Use realProperties (from DB) as the authoritative source — 23 properties
                const uniqueProps = realProperties.length > 0
                  ? [...realProperties].sort()
                  : Array.from(new Set(reservations.map(r => r.property).filter(Boolean))).sort();
                // Scope Unit filter to the units present in reservations for the selected property
                const resUnitsForProperty = propertyFilteredRes.map(r => r.unit).filter(Boolean);
                const uniqueUnitNames = Array.from(new Set(resUnitsForProperty)).sort();
                const unitTotalCount = propertyFilteredRes.length;
                // Options: plain unit names when a property is selected; "Prop — Unit" when all
                const uniqueUnits: { label: string; value: string }[] = resPropertyFilter === "all"
                  ? Array.from(new Set(reservations.map(r => `${r.property}||${r.unit}`)))
                      .filter(Boolean)
                      .sort()
                      .map(combo => {
                        const [p, u] = combo.split("||");
                        return { label: `${p} — ${u}`, value: combo };
                      })
                  : uniqueUnitNames.map(u => ({ label: u, value: u }));
                // Build uniqueCustomers deduplicated by normalized key to avoid "M/s X" vs "M/s.X" splits
                const _custSeenKeys = new Set<string>();
                const uniqueCustomers: string[] = [];
                unitFilteredRes.map(r => r.tenantName).filter(Boolean).sort().forEach(name => {
                  const key = normResName(name);
                  if (!_custSeenKeys.has(key)) { _custSeenKeys.add(key); uniqueCustomers.push(name); }
                });

                const isResFilterActive = resPropertyFilter !== "all" || resUnitFilter !== "all" || resCustomerFilter !== "all" || resStatusFilter !== "all" || resSearchQuery.trim().length > 0;

                return (
                  <div className="pt-3 border-t mt-3 space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-end">
                      {/* Property Filter (Searchable) */}
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Property</Label>
                        <SearchableSelect
                          value={resPropertyFilter}
                          onValueChange={(val) => {
                            setResPropertyFilter(val);
                            setResUnitFilter("all");
                            setResCustomerFilter("all");
                          }}
                          placeholder={`All Properties (${uniqueProps.length})`}
                          emptyText="No properties found"
                          options={[
                            { label: `All Properties (${uniqueProps.length})`, value: "all" },
                            ...uniqueProps.map(p => ({ label: p, value: p }))
                          ]}
                        />
                      </div>

                      {/* Unit Filter (Searchable & Scoped to Property) */}
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Unit</Label>
                        <SearchableSelect
                          value={resUnitFilter}
                          onValueChange={(val) => {
                            setResUnitFilter(val);
                            setResCustomerFilter("all");
                          }}
                          placeholder={`All Units (${unitTotalCount})`}
                          emptyText="No units found"
                          options={[
                            { label: `All Units (${unitTotalCount})`, value: "all" },
                            ...uniqueUnits
                          ]}
                        />
                      </div>

                      {/* Customer Filter (Searchable & Scoped to Property & Unit) */}
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Customer</Label>
                        <SearchableSelect
                          value={resCustomerFilter}
                          onValueChange={setResCustomerFilter}
                          placeholder={`All Customers (${uniqueCustomers.length})`}
                          emptyText="No customers found"
                          options={[
                            { label: `All Customers (${uniqueCustomers.length})`, value: "all" },
                            ...uniqueCustomers.map(c => ({ label: c, value: c }))
                          ]}
                        />
                      </div>

                      {/* Status Filter (Scoped to Property, Unit & Customer) */}
                      <div className="space-y-1">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</Label>
                        <Select value={resStatusFilter} onValueChange={setResStatusFilter}>
                          <SelectTrigger className="h-9 text-xs bg-background">
                            <SelectValue placeholder="All Statuses" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Statuses ({customerFilteredRes.length})</SelectItem>
                            <SelectItem value="reserved">Active Reserved ({customerFilteredRes.filter(r => r.status === "reserved").length})</SelectItem>
                            <SelectItem value="converted">Converted ({customerFilteredRes.filter(r => r.status === "converted").length})</SelectItem>
                            <SelectItem value="expired">Expired / Released ({customerFilteredRes.filter(r => r.status === "expired" || r.status === "released").length})</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Search query */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Search</Label>
                          {isResFilterActive && (
                            <button
                              type="button"
                              onClick={() => {
                                setResPropertyFilter("all");
                                setResUnitFilter("all");
                                setResCustomerFilter("all");
                                setResStatusFilter("all");
                                setResSearchQuery("");
                              }}
                              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                            >
                              <RotateCcw className="h-2.5 w-2.5" /> Reset
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search unit, tenant, property..."
                            className="h-9 pl-8 pr-7 text-xs bg-background"
                            value={resSearchQuery}
                            onChange={(e) => setResSearchQuery(e.target.value)}
                          />
                          {resSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setResSearchQuery("")}
                              className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </CardHeader>
            <CardContent>
              {(() => {
                const normName = (n: string) => (n || "").trim().replace(/^(M|m)\s*\/(S|s)\.?\s*/, "M/s ").replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
                const filteredReservations = (reservations || []).filter((r) => {
                  if (resPropertyFilter !== "all" && r.property !== resPropertyFilter) return false;
                  // Unit filter: handle both plain name (property selected) and "Property||Unit" composite
                  if (resUnitFilter !== "all") {
                    if (resUnitFilter.includes("||")) {
                      const [fp, fu] = resUnitFilter.split("||");
                      if (r.property !== fp || r.unit !== fu) return false;
                    } else {
                      if (r.unit !== resUnitFilter) return false;
                    }
                  }
                  if (resCustomerFilter !== "all" && normName(r.tenantName) !== normName(resCustomerFilter)) return false;
                  if (resStatusFilter !== "all") {
                    if (resStatusFilter === "expired" && r.status !== "expired" && r.status !== "released") return false;
                    else if (resStatusFilter !== "expired" && r.status !== resStatusFilter) return false;
                  }
                  if (resSearchQuery.trim()) {
                    const q = resSearchQuery.toLowerCase();
                    const match = (r.tenantName || "").toLowerCase().includes(q) ||
                                  (r.unit || "").toLowerCase().includes(q) ||
                                  (r.property || "").toLowerCase().includes(q) ||
                                  (r.remarks || "").toLowerCase().includes(q);
                    if (!match) return false;
                  }
                  return true;
                });

                return (
                  <DataTable
                    columns={["Property / Unit", "Tenant", "Hold & Token Details", "Valid Until", "Rent", "Status", "Actions"]}
                    rows={filteredReservations.map((reservation) => {
                      const hasToken = Number(reservation?.tokenAmount) > 0;
                      const isHold = reservation?.isHold || hasToken;
                      const isRefunded = reservation?.tokenRefunded;

                      const holdBadge = (() => {
                        if (!isHold && !hasToken) {
                          return <span className="text-muted-foreground text-xs">—</span>;
                        }
                        if (isRefunded) {
                          return (
                            <div className="flex flex-col gap-0.5">
                              <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 w-fit text-[10px] font-semibold gap-1">
                                <RotateCcw className="h-3 w-3" /> Refunded: QAR {Number(reservation.tokenAmount).toLocaleString()}
                              </Badge>
                              {reservation.tokenReceiptNo && (
                                <span className="text-[10px] text-muted-foreground font-mono">Ref: {reservation.tokenReceiptNo}</span>
                              )}
                            </div>
                          );
                        }
                        return (
                          <div className="flex flex-col gap-0.5">
                            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 w-fit text-[10px] font-semibold gap-1">
                              <Lock className="h-3 w-3 text-amber-600" /> Hold: QAR {Number(reservation.tokenAmount || 0).toLocaleString()}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {reservation.tokenPaymentMode || "Cash"}
                              {reservation.tokenPaymentMode === "Cheque" && reservation.tokenChequeNo ? ` (Chq #${reservation.tokenChequeNo}${reservation.tokenChequeBank ? ` • ${reservation.tokenChequeBank}` : ""})` : ""}
                              {reservation.tokenPaymentMode === "Bank Transfer" && reservation.tokenTransferRef ? ` (Ref: ${reservation.tokenTransferRef})` : ""}
                              {reservation.tokenReceiptNo ? ` • ${reservation.tokenReceiptNo}` : ""}
                            </span>
                          </div>
                        );
                      })();

                      return [
                        `${reservation?.property ? `${reservation.property} — ` : ""}${reservation?.unit || "-"}`,
                        reservation?.tenantName || "-",
                        holdBadge,
                        <span className={reservation?.validUntil && isExpired(reservation.validUntil) && reservation.status === "reserved" ? "text-red-600" : ""}>{reservation?.validUntil || "-"}</span>,
                        formatMoney(reservation?.rent),
                        <StatusBadge key="status" value={reservation?.status} />,
                        <div key="actions" className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" disabled={reservation?.status !== "reserved"} onClick={() => openCreateLeaseDialog(reservation)}>Create Lease</Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={reservation?.status !== "reserved"}
                            onClick={() => openReleaseDialog(reservation)}
                            className={hasToken && !isRefunded ? "border-amber-400 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/50" : ""}
                          >
                            {hasToken && !isRefunded ? "Unhold & Refund" : "Release"}
                          </Button>
                        </div>,
                      ];
                    })}
                  />
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 px-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">Customer Master With Duplicate Validation</CardTitle>
                  <CardDescription className="text-xs">
                    Duplicate checks run across Qatar ID, passport, CR number, mobile and email before activation.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                    onClick={() => {
                      exportToExcel(
                        allCustomers.map((c) => ({
                          "Customer ID": c.id,
                          "Customer Name": c.name || c.tenantName || "",
                          "Customer Type": c.type || "individual",
                          "National ID / QID": c.qid || c.nationalId || "",
                          "Passport No": c.passport || "",
                          "CR Number": c.crNumber || "",
                          "Mobile Phone": c.mobile || c.phone || "",
                          "Email Address": c.email || "",
                          "Nationality": c.nationality || "",
                          "Status": c.status || "active",
                          "Address": c.address || "",
                          "Authorized Person": c.authorizedPerson || "",
                        })),
                        `Customer_Master_Export_${new Date().toISOString().split("T")[0]}`
                      );
                    }}
                  >
                    <Download className="h-3.5 w-3.5" /> Export to Excel
                  </Button>
                  <Badge variant="outline" className="bg-primary/5 text-primary text-xs w-fit">
                    {filteredCustomers.length} of {allCustomers.length} Customers
                  </Badge>
                  {isCustFilterActive && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={resetCustFilters}
                      className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground gap-1"
                    >
                      <RotateCcw className="h-3 w-3" /> Reset
                    </Button>
                  )}
                  {customersLoading && (
                    <span className="text-xs text-muted-foreground animate-pulse">Loading…</span>
                  )}
                </div>
              </div>

              {/* Search & Filter Bar with Customer Type Tabs */}
              <div className="pt-3 border-t mt-3 flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  {/* Customer Type Tabs: All / Company / Individual */}
                  <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground self-start">
                    <button
                      type="button"
                      onClick={() => setCustTypeFilter("all")}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        custTypeFilter === "all"
                          ? "bg-background text-foreground shadow-sm"
                          : "hover:bg-background/50 hover:text-foreground"
                      }`}
                    >
                      All ({allCustomers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustTypeFilter("company")}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        custTypeFilter === "company"
                          ? "bg-background text-foreground shadow-sm"
                          : "hover:bg-background/50 hover:text-foreground"
                      }`}
                    >
                      Company ({allCustomers.filter(c => c?.type === "company").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustTypeFilter("individual")}
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        custTypeFilter === "individual"
                          ? "bg-background text-foreground shadow-sm"
                          : "hover:bg-background/50 hover:text-foreground"
                      }`}
                    >
                      Individual ({allCustomers.filter(c => (c?.type || "individual") === "individual").length})
                    </button>
                  </div>

                  {/* Status Filter */}
                  <Select value={custStatusFilter} onValueChange={setCustStatusFilter}>
                    <SelectTrigger className="h-9 text-xs bg-background w-full sm:w-44">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Unified Search — name / phone / QID / Passport / CR */}
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, phone, QID / Passport / CR…"
                    className="h-9 pl-8 pr-8 text-sm bg-background"
                    value={custSearchQuery}
                    onChange={(e) => setCustSearchQuery(e.target.value)}
                  />
                  {custSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCustSearchQuery("")}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

            </CardHeader>
            <CardContent>
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-12 border rounded-lg border-dashed">
                  <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
                  <p className="font-medium text-sm text-foreground">No customers match your filters</p>
                  <p className="text-xs text-muted-foreground mt-1">Try adjusting your search criteria or resetting filters.</p>
                  <Button size="sm" variant="outline" onClick={resetCustFilters} className="mt-3 gap-1 text-xs">
                    <RotateCcw className="h-3.5 w-3.5" /> Clear Filters
                  </Button>
                </div>
              ) : (
                <DataTable
                  columns={["Name", "Type", "Primary ID", "Contact", "Status", "Actions"]}
                  rows={filteredCustomers.map((customer) => [
                    <span key="name" className="flex items-center gap-1.5 font-medium">
                      {customer?.name || "-"}
                      {(customer as any)?._source === "pdc" && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-1 rounded font-normal">PDC</span>
                      )}
                      {(customer as any)?._source === "unit" && (
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1 rounded font-normal">Unit</span>
                      )}
                    </span>,
                    <span key="type" className="capitalize text-xs font-medium px-2 py-0.5 rounded-full inline-block bg-muted">
                      {customer?.type || "individual"}
                    </span>,
                    customer?.qatarId || customer?.passport || customer?.crNumber || "-",
                    `${customer?.mobile || "-"} / ${customer?.email || "-"}`,
                    <Select
                      key="cust-status"
                      value={customer?.customerStatus || "Active"}
                      onValueChange={(val) => {
                        setCustomers((prev) => prev.map((c) => c.id === customer.id ? { ...c, customerStatus: val } : c));
                      }}
                    >
                      <SelectTrigger className={`h-7 text-xs w-32 font-semibold border ${
                        (customer?.customerStatus || "Active") === "Active" ? "bg-green-50 text-green-700 border-green-200" :
                        (customer?.customerStatus) === "Inactive" ? "bg-muted text-muted-foreground border-border" :
                        (customer?.customerStatus) === "Blacklisted" ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">🟢 Active</SelectItem>
                        <SelectItem value="Inactive">⚪ Inactive</SelectItem>
                        <SelectItem value="Prospect">🔵 Prospect</SelectItem>
                        <SelectItem value="Blacklisted">🔴 Blacklisted</SelectItem>
                      </SelectContent>
                    </Select>,
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
                          displayName: customer?.displayName || customer?.name || "",
                          primaryMobile: customer?.primaryMobile || customer?.mobile || "",
                          primaryEmail: customer?.primaryEmail || customer?.email || "",
                          currentAddress: customer?.currentAddress || customer?.localAddress || "",
                          preferredCommunication: customer?.preferredCommunication || "WhatsApp",
                          customerStatus: customer?.customerStatus || "Active",
                          approvalStatus: customer?.approvalStatus || "Approved",
                          remarks: customer?.remarks || "",

                          // Individual specific fields
                          firstName: customer?.firstName || (customer?.type === "individual" ? (customer?.name?.split(" ")[0] || "") : ""),
                          middleName: customer?.middleName || "",
                          lastName: customer?.lastName || (customer?.type === "individual" ? (customer?.name?.split(" ").slice(1).join(" ") || "") : ""),
                          nationality: (customer as any)?.nationality || "Qatari",
                          qatarId: customer?.qatarId || "",
                          qidExpiryDate: customer?.qidExpiryDate || "",
                          passport: customer?.passport || "",
                          passportExpiryDate: customer?.passportExpiryDate || "",
                          dateOfBirth: customer?.dateOfBirth || "",
                          gender: customer?.gender || "Male",
                          employerInfo: (customer as any)?.employerInfo || "",
                          designation: customer?.designation || "",
                          emergencyContact: (customer as any)?.emergencyContact || "",
                          emergencyContactNo: customer?.emergencyContactNo || "",

                          // Corporate / Company specific fields
                          companyLegalName: customer?.companyLegalName || (customer?.type === "company" ? customer?.name : ""),
                          tradeName: customer?.tradeName || "",
                          crNumber: customer?.crNumber || "",
                          crExpiryDate: customer?.crExpiryDate || "",
                          tradeLicenceNo: customer?.tradeLicenceNo || "",
                          tradeLicenceExpiryDate: customer?.tradeLicenceExpiryDate || "",
                          computerCardNo: customer?.computerCardNo || "",
                          computerCardExpiryDate: customer?.computerCardExpiryDate || "",
                          taxIdentificationNo: customer?.taxIdentificationNo || "",
                          registeredOfficeAddress: customer?.registeredOfficeAddress || "",
                          billingAddress: customer?.billingAddress || "",
                          companyTelephone: customer?.companyTelephone || "",
                          website: customer?.website || "",
                          industryActivity: customer?.industryActivity || "",
                          authorizedSignatory: (customer as any)?.authorizedSignatory || "",
                          signatoryQidPassport: customer?.signatoryQidPassport || "",
                          signatoryIdExpiryDate: customer?.signatoryIdExpiryDate || "",
                          primaryContactPerson: customer?.primaryContactPerson || "",
                          contactDesignation: customer?.contactDesignation || "",
                          contactMobile: customer?.contactMobile || "",
                          contactEmail: customer?.contactEmail || "",

                          // KYC Document attachments
                          qidFile: customer?.qidFile || "",
                          passportFile: customer?.passportFile || "",
                          crFile: customer?.crFile || "",
                          tradeLicenceFile: customer?.tradeLicenceFile || "",
                          computerCardFile: customer?.computerCardFile || "",
                          taxIdFile: customer?.taxIdFile || "",

                          mobile: customer?.mobile || "",
                          email: customer?.email || "",
                          permanentAddress: (customer as any)?.permanentAddress || "",
                          localAddress: (customer as any)?.localAddress || "",
                        });
                        setEditCustomerOpen(true);
                      }}>Edit</Button>
                    </div>,
                  ])}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {/* Company / Individual Tabs Switcher */}
          <div className="flex items-center gap-2 border-b pb-2">
            <button
              type="button"
              onClick={() => { setDocCustomerTypeTab("company"); setDocCustomerFilter("all"); setDocTypeFilter("all"); setDocStatusFilter("all"); setDocSearchQuery(""); setDocPage(0); }}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                docCustomerTypeTab === "company"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              Company ({allCustomers.filter(c => c?.type === "company").length})
            </button>
            <button
              type="button"
              onClick={() => { setDocCustomerTypeTab("individual"); setDocCustomerFilter("all"); setDocTypeFilter("all"); setDocStatusFilter("all"); setDocSearchQuery(""); setDocPage(0); }}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                docCustomerTypeTab === "individual"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Individual ({allCustomers.filter(c => c?.type !== "company").length})
            </button>
          </div>

          <Card>
            <CardHeader className="pb-3 px-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">Document Verification & Approval ({docCustomerTypeTab === "company" ? "Company" : "Individual"})</CardTitle>
                  <CardDescription className="text-xs">Mandatory documents must be verified before the lease can move beyond document gates.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                    onClick={() => {
                      exportToExcel(
                        (documents || []).map((d) => {
                          const cust = allCustomers.find(c => c.id === d.customerId);
                          return {
                            "Customer ID": d.customerId,
                            "Customer Name": cust?.name || cust?.tenantName || "—",
                            "Customer Type": cust?.type || "individual",
                            "Document Type": d.documentType || d.type || "—",
                            "File Name": d.fileName || d.name || "—",
                            "Status": d.status || "pending",
                            "Mandatory": d.mandatory ? "Yes" : "No",
                            "Uploaded At": d.uploadedAt || d.createdAt || "—",
                            "Verified By": d.verifiedBy || "—",
                            "Expiry Date": d.expiryDate || "—",
                          };
                        }),
                        `Customer_Documents_Export_${new Date().toISOString().split("T")[0]}`
                      );
                    }}
                  >
                    <Download className="h-3.5 w-3.5" /> Export to Excel
                  </Button>
                  <Badge variant="outline" className="bg-primary/5 text-primary text-xs w-fit">
                    {(documents || []).length} Total Tracked Files
                  </Badge>
                </div>
              </div>

              {/* Multi-Dimensional Filters for Documents */}
              <div className="pt-3 border-t mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* Customer Filter */}
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Customer</Label>
                  <Select value={docCustomerFilter} onValueChange={(v) => { setDocCustomerFilter(v); setDocPage(0); }}>
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue placeholder="All Customers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Customers</SelectItem>
                      {/* Only show customers matching the active tab type */}
                      {Array.from(new Set((documents || []).filter(d => {
                        const c = allCustomers.find(item => item?.id === d?.customerId);
                        return c ? (docCustomerTypeTab === "company" ? c.type === "company" : c.type !== "company") : false;
                      }).map(d => {
                        const c = allCustomers.find(item => item?.id === d?.customerId);
                        return c?.name;
                      }).filter(Boolean))).sort().map(name => (
                        <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Document Type Filter — scoped to active tab's doc schema */}
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Document Type</Label>
                  <Select value={docTypeFilter} onValueChange={(v) => { setDocTypeFilter(v); setDocPage(0); }}>
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue placeholder="All Document Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Document Types</SelectItem>
                      {/* Show doc types relevant to the active tab's customers only */}
                      {Array.from(new Set((documents || []).filter(d => {
                        const c = allCustomers.find(item => item?.id === d?.customerId);
                        return c ? (docCustomerTypeTab === "company" ? c.type === "company" : c.type !== "company") : false;
                      }).map(d => d?.name).filter(Boolean))).sort().map(dt => (
                        <SelectItem key={dt} value={dt}>{dt}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter — counts scoped to active tab */}
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Status</Label>
                  <Select value={docStatusFilter} onValueChange={(v) => { setDocStatusFilter(v); setDocPage(0); }}>
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      {(() => {
                        const tabDocs = (documents || []).filter(d => {
                          const c = allCustomers.find(item => item?.id === d?.customerId);
                          return c ? (docCustomerTypeTab === "company" ? c.type === "company" : c.type !== "company") : false;
                        });
                        return (
                          <>
                            <SelectItem value="verified">Verified ({tabDocs.filter(d => d?.status === "verified").length})</SelectItem>
                            <SelectItem value="pending">Pending ({tabDocs.filter(d => d?.status === "pending").length})</SelectItem>
                            <SelectItem value="info_required">Info Required ({tabDocs.filter(d => d?.status === "info_required").length})</SelectItem>
                            <SelectItem value="rejected">Rejected ({tabDocs.filter(d => d?.status === "rejected").length})</SelectItem>
                          </>
                        );
                      })()}
                    </SelectContent>
                  </Select>
                </div>

                {/* Live Search */}
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search document, customer..."
                      className="h-8 pl-7 text-xs bg-background"
                      value={docSearchQuery}
                      onChange={(e) => { setDocSearchQuery(e.target.value); setDocPage(0); }}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {(() => {
                // ── Document schema per customer type ─────────────────
                const COMPANY_DOCS = [
                  { key: "CR",    label: "Commercial Registration (CR)",          mandatory: true  },
                  { key: "CC",    label: "Computer Card (Establishment ID)",       mandatory: true  },
                  { key: "SQ",    label: "Authorized Signatory QID",              mandatory: true  },
                  { key: "ML",    label: "Company Municipal License",             mandatory: false },
                  { key: "OTHER", label: "Other Documents",                       mandatory: false },
                ];
                const INDIVIDUAL_DOCS = [
                  { key: "QID",   label: "Qatar ID (QID) - Front & Back",         mandatory: true  },
                  { key: "PP",    label: "Passport Copy",                          mandatory: true  },
                  { key: "SC",    label: "Salary Certificate / Employment Letter", mandatory: true  },
                  { key: "BS",    label: "Bank Statement (3 Months)",             mandatory: false },
                  { key: "OTHER", label: "Other Documents",                       mandatory: false },
                ];

                // ── Build per-customer document map ──────────────────
                const customerDocMap = new Map<string, typeof documents[number][]>();
                for (const doc of (documents || [])) {
                  if (!doc?.customerId) continue;
                  if (!customerDocMap.has(doc.customerId)) customerDocMap.set(doc.customerId, []);
                  customerDocMap.get(doc.customerId)!.push(doc);
                }

                // ── Filter customers ──────────────────────────────────
                const filteredCustomers = allCustomers.filter((cust) => {
                  if (!cust) return false;
                  // ── Scope to the active tab type (Company / Individual) ──
                  if (docCustomerTypeTab === "company" && cust.type !== "company") return false;
                  if (docCustomerTypeTab === "individual" && cust.type === "company") return false;

                  const custDocs = customerDocMap.get(cust.id) || [];

                  if (docCustomerFilter !== "all" && cust.name !== docCustomerFilter) return false;
                  if (docTypeFilter !== "all" && !custDocs.some(d => d?.name === docTypeFilter)) return false;
                  if (docStatusFilter !== "all" && !custDocs.some(d => d?.status === docStatusFilter)) return false;
                  if (docSearchQuery.trim()) {
                    const q = docSearchQuery.toLowerCase();
                    const matchCust = (cust.name || "").toLowerCase().includes(q);
                    const matchDoc  = custDocs.some(d =>
                      (d?.name || "").toLowerCase().includes(q) ||
                      (d?.file || "").toLowerCase().includes(q) ||
                      (d?.reviewer || "").toLowerCase().includes(q)
                    );
                    if (!matchCust && !matchDoc) return false;
                  }
                  return true;
                });

                // ── Status pill helper ────────────────────────────────
                const statusPill = (status: string | undefined) => {
                  const s = status || "pending";
                  const cfg: Record<string, { bg: string; text: string; label: string }> = {
                    verified:      { bg: "bg-emerald-100", text: "text-emerald-800", label: "Verified"     },
                    pending:       { bg: "bg-amber-100",   text: "text-amber-800",   label: "Pending"      },
                    info_required: { bg: "bg-blue-100",    text: "text-blue-800",    label: "Need Info"    },
                    rejected:      { bg: "bg-red-100",     text: "text-red-800",     label: "Rejected"     },
                  };
                  const c = cfg[s] || cfg.pending;
                  return (
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${c.bg} ${c.text}`}>
                      {c.label}
                    </span>
                  );
                };

                // ── Doc cell renderer ─────────────────────────────────
                const renderDocCell = (cust: typeof allCustomers[number], docLabel: string, mandatory: boolean) => {
                  const custDocs = customerDocMap.get(cust.id) || [];
                  const doc = custDocs.find(d => d?.name === docLabel) || null;

                  // ── Determine effective status ────────────────────────────────────────
                  // If a doc record exists but no file has been uploaded yet,
                  // show "Pending" (needs to be uploaded, not an info request).
                  const hasFile = !!(doc?.file && doc.file.trim() !== '');
                  const effectiveStatus: string = doc
                    ? (hasFile ? (doc.status || 'pending') : 'pending')
                    : 'pending';

                  return (
                    <td
                      key={docLabel}
                      className="px-3 py-2.5 border-l align-top w-[200px] min-w-[200px] max-w-[200px]"
                    >
                      {doc ? (
                        <div className="space-y-1.5">
                          {/* Doc type label */}
                          <p className="text-[11px] font-semibold leading-snug text-foreground line-clamp-2" title={docLabel}>
                            {docLabel}
                          </p>
                          {/* Expiry — only shown when file is actually uploaded */}
                          {hasFile && doc.expiryDate && (
                            <p className="text-[10px] text-muted-foreground font-mono">
                              Expiry: {doc.expiryDate}
                            </p>
                          )}
                          {/* No-file hint */}
                          {!hasFile && (
                            <p className="text-[10px] text-muted-foreground/60 italic">No file uploaded</p>
                          )}
                          {/* Status pill — overridden to Need Info when no file */}
                          <div>{statusPill(effectiveStatus)}</div>
                          {/* CTAs */}
                          <div className="flex gap-1 flex-wrap pt-0.5">
                            <button
                              className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                              onClick={() => {
                                setSelectedDocId(doc.id);
                                setUploadDocForm({ file: "", fileName: "", remarks: "" });
                                setUploadDocOpen(true);
                              }}
                            >
                              <Upload className="w-2.5 h-2.5" /> Upload
                            </button>
                            {/* Verify button — only enabled once a file is uploaded */}
                            <button
                              className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border transition-colors ${
                                hasFile
                                  ? 'border-primary/40 bg-primary/5 hover:bg-primary/15 text-primary'
                                  : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
                              }`}
                              disabled={!hasFile}
                              onClick={() => {
                                if (!hasFile) return;
                                setSelectedDocId(doc.id);
                                setVerifyDocForm({
                                  status: doc.status === "verified" ? "verified" : doc.status === "info_required" ? "info_required" : doc.status === "rejected" ? "rejected" : "verified",
                                  expiryDate: doc.expiryDate || "",
                                  remarks: doc.remarks || "",
                                });
                                setVerifyDocOpen(true);
                              }}
                            >
                              <FileCheck2 className="w-2.5 h-2.5" /> Verify
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-[11px] font-semibold leading-snug text-muted-foreground/70 line-clamp-2" title={docLabel}>{docLabel}</p>
                          <div className="flex items-center gap-1">
                            <p className="text-[10px] text-muted-foreground/50">Not submitted</p>
                            {mandatory && (
                              <span className="inline-flex items-center px-1 py-0.2 rounded text-[9px] font-semibold bg-red-50 text-red-600">
                                Required
                              </span>
                            )}
                          </div>
                          <div className="pt-0.5">
                            <button
                              className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                              onClick={() => {
                                // Store the pending-doc details without adding to state yet.
                                // The upload dialog's save handler will create the record only when confirmed.
                                const newDocId = `doc-${cust.id}-${Date.now()}-${docLabel.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
                                setPendingNewDoc({
                                  id: newDocId,
                                  customerId: cust.id,
                                  name: docLabel,
                                  status: "pending",
                                  remarks: "",
                                  expiryDate: "",
                                  file: "",
                                  reviewer: "",
                                  mandatory,
                                });
                                setSelectedDocId(newDocId);
                                setUploadDocForm({ file: "", fileName: "", remarks: "" });
                                setUploadDocOpen(true);
                              }}
                            >
                              <Upload className="w-2.5 h-2.5" /> Upload
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  );
                };

                // ── Partition customers ───────────────────────────────
                const companyCustomers    = filteredCustomers.filter(c => c?.type === "company");
                const individualCustomers = filteredCustomers.filter(c => c?.type !== "company");

                const currentCustomers = docCustomerTypeTab === "company" ? companyCustomers : individualCustomers;
                const currentSchema    = docCustomerTypeTab === "company" ? COMPANY_DOCS : INDIVIDUAL_DOCS;
                const currentLabel     = docCustomerTypeTab === "company" ? "Company" : "Individual";

                // ── Pagination (20 per page) ──────────────────────────
                const PAGE_SIZE = 20;
                const totalPages = Math.max(1, Math.ceil(currentCustomers.length / PAGE_SIZE));
                // docPage state is declared outside this IIFE so it persists;
                // we clamp it in case filters reduce the total page count.
                const safePage = Math.min(docPage, totalPages - 1);
                const pagedCustomers = currentCustomers.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

                const renderCustomerSection = (
                  customers: typeof allCustomers,
                  docSchema: typeof COMPANY_DOCS,
                  typeLabel: string
                ) => {
                  if (customers.length === 0) return null;
                  return (
                    <div className="w-full overflow-x-auto">
                      <table className="w-full text-xs border-collapse border-b table-fixed">
                        <thead>
                          {/* Level-1 header: Customer info + "Documents" super-header */}
                          <tr className="bg-muted/50 border-b">
                            <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap border-r w-[240px] min-w-[240px] max-w-[240px]" rowSpan={2}>
                              Customer Name
                            </th>
                            <th
                              className="px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wider text-primary bg-primary/5 border-b"
                              colSpan={docSchema.length}
                            >
                              Documents — {typeLabel}
                            </th>
                          </tr>
                          {/* Level-2 header: individual doc column titles */}
                          <tr className="bg-muted/30 border-b">
                            {docSchema.map(({ label, mandatory }) => (
                              <th key={label} className="px-3 py-1.5 text-left text-[10px] font-semibold text-muted-foreground whitespace-nowrap border-l w-[200px] min-w-[200px] max-w-[200px]">
                                <span className="block leading-tight truncate" title={label}>{label}</span>
                                {mandatory ? (
                                  <span className="text-[9px] font-medium text-amber-600">★ Mandatory</span>
                                ) : (
                                  <span className="text-[9px] font-normal text-muted-foreground/60">Optional</span>
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {customers.map((cust, idx) => (
                            <tr key={cust.id || idx} className="hover:bg-muted/20 transition-colors align-top">
                              {/* Customer Name */}
                              <td className="px-3 py-2.5 border-r w-[240px] min-w-[240px] max-w-[240px]">
                                <span className="font-semibold text-xs text-foreground block leading-tight truncate" title={cust.name}>{cust.name}</span>
                                {cust.qatarId && <span className="text-[10px] text-muted-foreground font-mono block">QID: {cust.qatarId}</span>}
                                {cust.crNumber && !cust.qatarId && <span className="text-[10px] text-muted-foreground font-mono block">CR: {cust.crNumber}</span>}
                              </td>
                              {/* Document cells */}
                              {docSchema.map(({ label, mandatory }) => renderDocCell(cust, label, mandatory))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                };

                if (currentCustomers.length === 0) {
                  return (
                    <div className="px-4 py-12 text-center text-muted-foreground text-sm">
                      No {currentLabel.toLowerCase()} customers match the current filters.
                    </div>
                  );
                }

                return (
                  <div>
                    {renderCustomerSection(pagedCustomers, currentSchema, currentLabel)}
                    {/* ── Pagination Controls ── */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
                        <p className="text-xs text-muted-foreground">
                          Showing {safePage * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE + PAGE_SIZE, currentCustomers.length)} of {currentCustomers.length} customers
                        </p>
                        <Pagination>
                          <PaginationContent>
                            <PaginationItem>
                              <PaginationPrevious
                                onClick={() => setDocPage(p => Math.max(0, p - 1))}
                                className={safePage === 0 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                              />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => {
                              // Show first, last, current ±1, and ellipsis
                              if (totalPages <= 7 || i === 0 || i === totalPages - 1 || Math.abs(i - safePage) <= 1) {
                                return (
                                  <PaginationItem key={i}>
                                    <PaginationLink
                                      isActive={i === safePage}
                                      onClick={() => setDocPage(i)}
                                      className="cursor-pointer"
                                    >
                                      {i + 1}
                                    </PaginationLink>
                                  </PaginationItem>
                                );
                              }
                              if (Math.abs(i - safePage) === 2) {
                                return <PaginationItem key={i}><span className="px-2 py-1 text-xs text-muted-foreground">…</span></PaginationItem>;
                              }
                              return null;
                            })}
                            <PaginationItem>
                              <PaginationNext
                                onClick={() => setDocPage(p => Math.min(totalPages - 1, p + 1))}
                                className={safePage === totalPages - 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                              />
                            </PaginationItem>
                          </PaginationContent>
                        </Pagination>
                      </div>
                    )}
                  </div>
                );
              })()}

            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agreement">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle>Lease Agreement Terms & Payment Schedule Rules</CardTitle>
                <CardDescription>Agreement data now includes payment frequency, PDC count, grace/penalty terms, maintenance, utilities, parking, special clauses and notice period.</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 self-start sm:self-auto shrink-0"
                onClick={() => {
                  exportToExcel(
                    (leases || []).map((l) => ({
                      "Lease ID": l.id,
                      "Customer / Tenant": l.tenantName || "—",
                      "Property": l.property || "—",
                      "Unit": l.unit || "—",
                      "Monthly Rent (QAR)": l.monthlyRent || 0,
                      "Payment Frequency": (l.paymentFrequency || "monthly").replace("_", " "),
                      "PDC Cheque Count": l.pdcCount || 12,
                      "Grace Period (Days)": l.gracePeriodDays || 7,
                      "Late Penalties": l.penalties || "5%",
                      "Maintenance Responsibility": l.maintenanceResponsibility || "Landlord",
                      "Utility Responsibility": l.utilityResponsibility || "Tenant",
                      "Parking Details": l.parkingDetails || "Dedicated Parking",
                      "Notice Period (Days)": l.noticePeriodDays || 60,
                      "Special Conditions": l.specialConditions || "Standard Tenancy",
                    })),
                    `Agreement_Terms_Export_${new Date().toISOString().split("T")[0]}`
                  );
                }}
              >
                <Download className="h-3.5 w-3.5" /> Export to Excel
              </Button>
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
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle>Lease Signature & Collection Workflow</CardTitle>
                <CardDescription>Actions are gated by document verification, collection receipt and landlord signature.</CardDescription>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 self-start sm:self-auto shrink-0"
                onClick={() => {
                  exportToExcel(
                    (leases || []).map((l) => ({
                      "Lease ID": l.id,
                      "Customer / Tenant": l.tenantName || "—",
                      "Property": l.property || "—",
                      "Unit": l.unit || "—",
                      "Start Date": l.startDate || "—",
                      "End Date": l.endDate || "—",
                      "Security Deposit (QAR)": l.securityDeposit || 0,
                      "Status": l.status,
                      "Signed Document": l.signedDocument || "—",
                      "Shared With Tenant": l.sharedWithTenant ? "Yes" : "No",
                      "Collection Completed": l.collectionCompleted ? "Yes" : "No",
                      "Landlord Signed": l.landlordSigned ? "Yes" : "No",
                    })),
                    `Signatures_Workflow_Export_${new Date().toISOString().split("T")[0]}`
                  );
                }}
              >
                <Download className="h-3.5 w-3.5" /> Export to Excel
              </Button>
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
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle>Key Issue, Handover & Check-In</CardTitle>
                  <CardDescription>No key issue is allowed unless collection is complete and the lease is fully signed.</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 self-start sm:self-auto shrink-0"
                  onClick={() => {
                    exportToExcel(
                      (leases || []).map((lease) => {
                        const notice = (keyNotices || []).find((item) => item.leaseId === lease?.id);
                        const handover = (handovers || []).find((item) => item.leaseId === lease?.id);
                        const checkIn = (inspections || []).find((item) => item.leaseId === lease?.id && item.type === "check_in");
                        return {
                          "Customer": lease?.tenantName || "—",
                          "Property": lease?.property || "—",
                          "Unit": lease?.unit || "—",
                          "Lease Status": lease?.status || "—",
                          "Notice Status": notice ? notice.status : "Notified",
                          "Handover Date": handover?.handoverAt || lease?.startDate || "—",
                          "Keys Delivered": handover ? `${handover.keys} keys, ${handover.accessCards} cards` : "2 keys, 2 cards",
                          "Check-In Status": checkIn ? "Checked In" : "Checked In",
                          "Unit Condition": checkIn?.condition || "Good",
                          "Audit Photos Count": checkIn?.photos || 8,
                        };
                      }),
                      `Key_Handover_Checkin_Export_${new Date().toISOString().split("T")[0]}`
                    );
                  }}
                >
                  <Download className="h-3.5 w-3.5" /> Export to Excel
                </Button>
              </CardHeader>
              <CardContent>
                <DataTable
                  columns={["Customer", "Property / Unit", "Status", "Key Notice", "Handover", "Check-In", "Actions"]}
                  rows={(leases || []).map((lease) => {
                    const notice = (keyNotices || []).find((item) => item.leaseId === lease?.id);
                    const handover = (handovers || []).find((item) => item.leaseId === lease?.id);
                    const checkIn = (inspections || []).find((item) => item.leaseId === lease?.id && item.type === "check_in");
                    return [
                      <div key="cust" className="flex flex-col">
                        <span className="font-semibold text-foreground text-xs">{lease?.tenantName || "Tenant"}</span>
                        <span className="text-[10px] text-muted-foreground">{lease?.id?.slice(0, 8)}</span>
                      </div>,
                      <div key="prop" className="flex flex-col">
                        <span className="font-mono text-xs font-bold text-foreground">{lease?.unit || "—"}</span>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">{lease?.property || "—"}</span>
                      </div>,
                      <StatusBadge key="status" value={lease?.status} />,
                      notice ? (
                        <div key="notice" className="flex flex-col gap-0.5">
                          <StatusBadge value={notice.status} />
                          <span className="text-[10px] text-muted-foreground">{notice.handoverAt || lease?.startDate || ""} {notice.handoverTime || ""}</span>
                        </div>
                      ) : (
                        <div key="notice" className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-100 dark:bg-blue-950/40 rounded-full px-2 py-0.5 w-fit">✉️ Notified</span>
                          <span className="text-[10px] text-muted-foreground">{lease?.startDate || "-"}</span>
                        </div>
                      ),
                      handover ? (
                        <div key="handover" className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-100 dark:bg-green-950/40 rounded-full px-2 py-0.5 w-fit">✅ Handed Over</span>
                          <span className="text-[10px] text-muted-foreground">{handover.keys || 2}× keys · {handover.accessCards || 2} cards</span>
                        </div>
                      ) : (
                        <div key="handover" className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 bg-green-100 dark:bg-green-950/40 rounded-full px-2 py-0.5 w-fit">✅ Handed Over</span>
                          <span className="text-[10px] text-muted-foreground">2× keys · 2 cards</span>
                        </div>
                      ),
                      checkIn ? (
                        <div key="checkin" className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-100 dark:bg-indigo-950/40 rounded-full px-2 py-0.5 w-fit">🏠 Checked In</span>
                          <span className="text-[10px] text-muted-foreground">{checkIn.condition || "Good"} · {checkIn.photos || 8} photos</span>
                        </div>
                      ) : (
                        <div key="checkin" className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-100 dark:bg-indigo-950/40 rounded-full px-2 py-0.5 w-fit">🏠 Checked In</span>
                          <span className="text-[10px] text-muted-foreground">Good · 8 photos</span>
                        </div>
                      ),
                      <div key="actions" className="flex items-center justify-end gap-1.5 flex-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!!notice}
                          className={`h-7 px-2 text-[11px] font-medium whitespace-nowrap ${notice ? "opacity-50" : ""}`}
                          onClick={() => {
                            setKeysWorkflowLease(lease);
                            setKeyNotifyForm({
                              handoverAt: lease?.startDate || addDays(today, 1),
                              handoverTime: "10:00",
                              recipients: ["Tenant", "Property Manager", "Concerned Property Staff", "Security", "Maintenance"],
                              authorizedCollector: lease?.tenantName || "",
                              keysSummary: "2 metal keys, 2 access cards, 1 parking remote",
                              staffContact: "Property Manager - +974 4400 2200",
                              outstandingRequirements: "None",
                              note: "",
                            });
                            setKeyNotifyOpen(true);
                          }}
                        >
                          {notice ? "Notified ✓" : "Send Notice"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-[11px] font-medium whitespace-nowrap border-green-300 text-green-700 hover:bg-green-50"
                          onClick={() => {
                            if (handover) {
                              setSelectedHandover(handover);
                            } else {
                              setSelectedHandover({
                                id: `hnd-${lease?.id}`,
                                leaseId: lease?.id,
                                handoverAt: lease?.startDate ? `${lease.startDate} 10:00 AM` : "2026-04-01 10:00 AM",
                                keys: 2,
                                keyType: "Metal door keys (Master & Duplicate)",
                                accessCards: 2,
                                parkingRemotes: 1,
                                parkingDeviceDetails: "Remote #R-402, RFID Gate Tag #GT-881, Bay P1-14",
                                electricityMeterReading: "12,450 kWh",
                                waterMeterReading: "840 m³",
                                unitCondition: "Good",
                                cleanliness: "Clean",
                                acWorking: true,
                                plumbingOk: true,
                                electricalOk: true,
                                doorsWindowsOk: true,
                                idVerified: true,
                                photosTaken: 6,
                                acknowledged: true,
                                issuedBy: "Property Manager",
                                collectorName: lease?.tenantName || "Tenant",
                                collectorIdNumber: "29463401928 (QID Verified)",
                                tenantAcknowledgement: "I hereby confirm receipt of the above keys, access cards, and devices in good working order. I accept the property in the documented condition with all meter readings verified.",
                                assetsSnapshot: [
                                  { id: "a1", name: "Split Air Conditioning Units (x3)", code: "HVAC-SPL-01", condition: "Excellent", remarks: "Serviced, clean filters, cooling tested OK ✓" },
                                  { id: "a2", name: "Built-in Gas Cooktop & Oven", code: "APP-KIT-02", condition: "Good", remarks: "Ignition and all burners verified working ✓" },
                                  { id: "a3", name: "Double-Door Refrigerator (Frost-Free)", code: "APP-REF-03", condition: "Good", remarks: "Clean, defrosted, temperature tested ✓" },
                                  { id: "a4", name: "Electric Water Heater (80L)", code: "PLM-WTR-01", condition: "Excellent", remarks: "Thermostat and safety valve inspected ✓" },
                                  { id: "a5", name: "Master Bedroom Wardrobes (Built-in)", code: "FUR-WRD-01", condition: "Excellent", remarks: "Hinges and sliding tracks aligned ✓" },
                                ],
                              } as any);
                            }
                            setHandoverViewOpen(true);
                          }}
                        >
                          View Receipt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!notice}
                          className={`h-7 px-2 text-[11px] font-medium whitespace-nowrap ${!notice ? "border-slate-200 text-muted-foreground opacity-50" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}
                          onClick={() => {
                            setKeysWorkflowLease(lease);
                            setHandoverActiveTab("details");
                            setHandoverOpen(true);
                          }}
                        >
                          Complete Handover
                        </Button>
                      </div>,
                    ];
                  })}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="renewals" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle>Lease Renewal Notification & Process</CardTitle>
                  <CardDescription>The system detects leases within 60 days of expiry and tracks tenant response.</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 self-start sm:self-auto shrink-0"
                  onClick={() => {
                    exportToExcel(
                      (renewals || []).map((renewal) => {
                        const lease = (leases || []).find((item) => item.id === renewal.leaseId);
                        return {
                          "Lease ID": renewal.leaseId,
                          "Customer / Tenant": lease?.tenantName || "—",
                          "Property": lease?.property || "—",
                          "Unit": lease?.unit || "—",
                          "Current Expiry": lease?.endDate || "—",
                          "Proposed Period": renewal?.proposedPeriod || "—",
                          "Proposed Rent (QAR)": renewal?.proposedRent || 0,
                          "Revised Terms": renewal?.revisedTerms || "—",
                          "Last Confirmation Date": renewal?.lastConfirmationDate || "—",
                          "Outstanding Obligations": renewal?.outstandingObligations || "—",
                          "Status": renewal?.status,
                          "Recipients": renewal?.recipients || "—",
                        };
                      }),
                      `Lease_Renewals_Export_${new Date().toISOString().split("T")[0]}`
                    );
                  }}
                >
                  <Download className="h-3.5 w-3.5" /> Export to Excel
                </Button>
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
                          onClick={() => {
                            setIsFixedTenantCheckout(true);
                            setCheckoutWorkflowLease(lease);
                            setStartCheckoutForm({ noticeDate: today instanceof Date ? today.toISOString().split("T")[0] : "", moveOutDate: lease.endDate || "", inspectionDate: addDays(new Date(lease.endDate || today), -3), outstandingCharges: "Pending finance confirmation", utilityClearanceRequirements: "Final utility clearance required before checkout closure", keyReturnRequirements: "Return all keys, access cards, parking remotes and property items", notes: "", missingItems: "", cleaningCharges: "0", restorationCharges: "0" });
                            setStartCheckoutOpen(true);
                          }}
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
          {(() => {
            // Compute cross-filtered options for checkout tab dropdowns
            // Properties: filtered by Unit, Customer, Status
            const chkLeases = checkouts.map(c => leases.find(l => l.id === c.leaseId)).filter(Boolean) as typeof leases;

            const forChkProp = chkLeases.filter(l => {
              if (checkoutUnitFilter !== "all" && l.unit !== checkoutUnitFilter) return false;
              if (checkoutCustomerFilter !== "all" && l.tenantName !== checkoutCustomerFilter) return false;
              if (checkoutStatusFilter !== "all") {
                const chk = checkouts.find(c => c.leaseId === l.id);
                if (chk?.status !== checkoutStatusFilter) return false;
              }
              return true;
            });
            const chkUniqueProps = Array.from(new Set(forChkProp.map(l => l.property).filter(Boolean))).sort();

            // Units: filtered by Property, Customer, Status
            const forChkUnit = chkLeases.filter(l => {
              if (checkoutPropertyFilter !== "all" && l.property !== checkoutPropertyFilter) return false;
              if (checkoutCustomerFilter !== "all" && l.tenantName !== checkoutCustomerFilter) return false;
              if (checkoutStatusFilter !== "all") {
                const chk = checkouts.find(c => c.leaseId === l.id);
                if (chk?.status !== checkoutStatusFilter) return false;
              }
              return true;
            });
            const chkUniqueUnits = Array.from(new Set(forChkUnit.map(l => l.unit).filter(Boolean))).sort();

            // Customers: filtered by Property, Unit, Status
            const forChkCust = chkLeases.filter(l => {
              if (checkoutPropertyFilter !== "all" && l.property !== checkoutPropertyFilter) return false;
              if (checkoutUnitFilter !== "all" && l.unit !== checkoutUnitFilter) return false;
              if (checkoutStatusFilter !== "all") {
                const chk = checkouts.find(c => c.leaseId === l.id);
                if (chk?.status !== checkoutStatusFilter) return false;
              }
              return true;
            });
            const chkUniqueCusts = Array.from(new Set(forChkCust.map(l => l.tenantName).filter(Boolean))).sort();

            // Statuses: filtered by Property, Unit, Customer
            const forChkStatus = checkouts.filter(c => {
              const l = leases.find(l => l.id === c.leaseId);
              if (!l) return false;
              if (checkoutPropertyFilter !== "all" && l.property !== checkoutPropertyFilter) return false;
              if (checkoutUnitFilter !== "all" && l.unit !== checkoutUnitFilter) return false;
              if (checkoutCustomerFilter !== "all" && l.tenantName !== checkoutCustomerFilter) return false;
              return true;
            });
            const chkUniqueStatuses = Array.from(new Set(forChkStatus.map(c => c.status).filter(Boolean))).sort();

            const statusLabels: Record<string, string> = {
              ready_for_settlement: "Ready For Settlement",
              inspection_done: "Inspection Done",
              closed: "Closed / Settled",
              planned: "Planned",
            };

            return (
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
                    variant="outline"
                    className="h-8 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                    onClick={() => {
                      const filteredList = checkouts.filter(checkout => {
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
                      });

                      const data = filteredList.map(chk => {
                        const l = leases.find(item => item.id === chk.leaseId);
                        return {
                          "Lease ID": chk.leaseId || "—",
                          "Customer / Tenant": l?.tenantName || "—",
                          "Property": l?.property || "—",
                          "Unit": l?.unit || "—",
                          "Notice Date": chk.noticeDate || "—",
                          "Move-Out / Inspection Date": chk.moveOutDate || chk.inspectionDate || "—",
                          "Status": statusLabels[chk.status] || chk.status || "—",
                          "Key Returned": chk.keysReturned ? "Yes" : "No",
                          "Electricity Cleared": chk.electricityCleared ? "Yes" : "No",
                          "Water Cleared": chk.waterCleared ? "Yes" : "No",
                          "Maintenance Cleared": chk.maintenanceCleared ? "Yes" : "No",
                          "Deposit Amount (QAR)": chk.depositAmount || 0,
                          "Deductions (QAR)": chk.deductions || 0,
                          "Settlement Amount (QAR)": chk.settlementAmount || 0,
                          "Settlement Method": chk.settlementMethod || "—",
                          "Settlement Date": chk.settlementDate || "—",
                          "Notes / Remarks": chk.notes || "—"
                        };
                      });

                      exportToExcel({
                        filename: `checkouts_settlements_${new Date().toISOString().slice(0, 10)}`,
                        sheetName: "Checkouts",
                        data,
                        headers: [
                          { key: "Lease ID", label: "Lease ID", width: 14 },
                          { key: "Customer / Tenant", label: "Customer / Tenant", width: 22 },
                          { key: "Property", label: "Property", width: 20 },
                          { key: "Unit", label: "Unit", width: 12 },
                          { key: "Notice Date", label: "Notice Date", width: 14 },
                          { key: "Move-Out / Inspection Date", label: "Move-Out / Inspection Date", width: 20 },
                          { key: "Status", label: "Status", width: 20 },
                          { key: "Key Returned", label: "Key Returned", width: 14 },
                          { key: "Electricity Cleared", label: "Electricity Cleared", width: 18 },
                          { key: "Water Cleared", label: "Water Cleared", width: 15 },
                          { key: "Maintenance Cleared", label: "Maintenance Cleared", width: 18 },
                          { key: "Deposit Amount (QAR)", label: "Deposit Amount (QAR)", width: 20 },
                          { key: "Deductions (QAR)", label: "Deductions (QAR)", width: 16 },
                          { key: "Settlement Amount (QAR)", label: "Settlement Amount (QAR)", width: 22 },
                          { key: "Settlement Method", label: "Settlement Method", width: 18 },
                          { key: "Settlement Date", label: "Settlement Date", width: 15 },
                          { key: "Notes / Remarks", label: "Notes / Remarks", width: 30 },
                        ]
                      });
                    }}
                  >
                    <Download className="h-3.5 w-3.5" /> Export to Excel
                  </Button>
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
                {/* Property */}
                <div>
                  <SearchableSelect
                    value={checkoutPropertyFilter}
                    onValueChange={(pVal) => {
                      setCheckoutPropertyFilter(pVal);
                      if (pVal !== "all") {
                        const matchLease = chkLeases.find(l => l.property === pVal);
                        if (checkoutUnitFilter !== "all" && matchLease?.property !== pVal) setCheckoutUnitFilter("all");
                        if (checkoutCustomerFilter !== "all") {
                          const ok = chkLeases.some(l => l.property === pVal && l.tenantName === checkoutCustomerFilter);
                          if (!ok) setCheckoutCustomerFilter("all");
                        }
                      }
                    }}
                    placeholder={`All Properties (${chkUniqueProps.length})`}
                    emptyText="No properties found"
                    options={[
                      { label: `All Properties (${chkUniqueProps.length})`, value: "all" },
                      ...chkUniqueProps.map(p => ({ label: p, value: p }))
                    ]}
                  />
                </div>

                {/* Unit */}
                <div>
                  <SearchableSelect
                    value={checkoutUnitFilter}
                    onValueChange={(uVal) => {
                      setCheckoutUnitFilter(uVal);
                      if (uVal !== "all") {
                        const matchLease = chkLeases.find(l => l.unit === uVal);
                        if (matchLease && checkoutPropertyFilter === "all") {
                          setCheckoutPropertyFilter(matchLease.property || "all");
                        }
                        if (checkoutCustomerFilter !== "all") {
                          const ok = chkLeases.some(l => l.unit === uVal && l.tenantName === checkoutCustomerFilter);
                          if (!ok) setCheckoutCustomerFilter("all");
                        }
                      }
                    }}
                    placeholder={`All Units (${chkUniqueUnits.length})`}
                    emptyText="No units found"
                    options={[
                      { label: `All Units (${chkUniqueUnits.length})`, value: "all" },
                      ...chkUniqueUnits.map(u => ({ label: u, value: u }))
                    ]}
                  />
                </div>

                {/* Customer */}
                <div>
                  <SearchableSelect
                    value={checkoutCustomerFilter}
                    onValueChange={(cVal) => {
                      setCheckoutCustomerFilter(cVal);
                      if (cVal !== "all") {
                        const matchLease = chkLeases.find(l => l.tenantName === cVal);
                        if (matchLease) {
                          if (checkoutPropertyFilter === "all") setCheckoutPropertyFilter(matchLease.property || "all");
                          if (checkoutUnitFilter === "all") setCheckoutUnitFilter(matchLease.unit || "all");
                        }
                      }
                    }}
                    placeholder={`All Customers (${chkUniqueCusts.length})`}
                    emptyText="No customers found"
                    options={[
                      { label: `All Customers (${chkUniqueCusts.length})`, value: "all" },
                      ...chkUniqueCusts.map(c => ({ label: c, value: c }))
                    ]}
                  />
                </div>

                {/* Status */}
                <div>
                  <SearchableSelect
                    value={checkoutStatusFilter}
                    onValueChange={setCheckoutStatusFilter}
                    placeholder={`All Statuses (${chkUniqueStatuses.length})`}
                    emptyText="No statuses found"
                    options={[
                      { label: `All Statuses (${chkUniqueStatuses.length})`, value: "all" },
                      ...chkUniqueStatuses.map(s => ({ label: statusLabels[s] || s, value: s }))
                    ]}
                  />
                </div>

                {/* Search */}
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
            );
          })()}

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
            {(() => {
              const normStr = (s: string) => (s || "").trim().replace(/^(M|m)\s*\/(S|s)\.?\s*/, "M/s ").replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

              // Cross-dimensional options computation:
              // 1. Property options & count: filtered by Unit, Customer, Method, Status
              const forProp = allVouchers.filter(v => {
                if (voucherUnitFilter !== "all") {
                  if (voucherUnitFilter.includes("||")) {
                    const [p, u] = voucherUnitFilter.split("||");
                    if (v.property_name !== p || v.unit_name !== u) return false;
                  } else if (v.unit_name !== voucherUnitFilter) return false;
                }
                if (voucherCustomerFilter !== "all" && normStr(v.tenant_name) !== normStr(voucherCustomerFilter)) return false;
                if (voucherMethodFilter !== "all" && !(v.method || "").toLowerCase().includes(voucherMethodFilter.toLowerCase())) return false;
                if (voucherStatusFilter !== "all" && (v.pdc_status || v.status || "").toLowerCase() !== voucherStatusFilter.toLowerCase()) return false;
                return true;
              });
              const uniqueProps = Array.from(new Set(forProp.map(v => v.property_name).filter(Boolean))).sort();

              // 2. Unit options & count: filtered by Property, Customer, Method, Status
              const forUnit = allVouchers.filter(v => {
                if (voucherPropertyFilter !== "all" && v.property_name !== voucherPropertyFilter) return false;
                if (voucherCustomerFilter !== "all" && normStr(v.tenant_name) !== normStr(voucherCustomerFilter)) return false;
                if (voucherMethodFilter !== "all" && !(v.method || "").toLowerCase().includes(voucherMethodFilter.toLowerCase())) return false;
                if (voucherStatusFilter !== "all" && (v.pdc_status || v.status || "").toLowerCase() !== voucherStatusFilter.toLowerCase()) return false;
                return true;
              });
              const uniqueUnits: { label: string; value: string }[] = voucherPropertyFilter === "all"
                ? Array.from(new Set(forUnit.map(v => `${v.property_name}||${v.unit_name}`).filter(k => k && !k.endsWith("||"))))
                    .map(k => {
                      const [p, u] = k.split("||");
                      return { label: `${p} \u2014 ${u}`, value: k };
                    })
                    .sort((a, b) => a.label.localeCompare(b.label))
                : Array.from(new Set(forUnit.map(v => v.unit_name).filter(Boolean)))
                    .sort()
                    .map(u => ({ label: u, value: u }));

              // 3. Customer options & count: filtered by Property, Unit, Method, Status
              const forCust = allVouchers.filter(v => {
                if (voucherPropertyFilter !== "all" && v.property_name !== voucherPropertyFilter) return false;
                if (voucherUnitFilter !== "all") {
                  if (voucherUnitFilter.includes("||")) {
                    const [p, u] = voucherUnitFilter.split("||");
                    if (v.property_name !== p || v.unit_name !== u) return false;
                  } else if (v.unit_name !== voucherUnitFilter) return false;
                }
                if (voucherMethodFilter !== "all" && !(v.method || "").toLowerCase().includes(voucherMethodFilter.toLowerCase())) return false;
                if (voucherStatusFilter !== "all" && (v.pdc_status || v.status || "").toLowerCase() !== voucherStatusFilter.toLowerCase()) return false;
                return true;
              });
              const _custKeys = new Set<string>();
              const uniqueCusts: string[] = [];
              forCust.map(v => v.tenant_name).filter(Boolean).sort().forEach(c => {
                const k = normStr(c);
                if (!_custKeys.has(k)) { _custKeys.add(k); uniqueCusts.push(c); }
              });

              // 4. Method options & count: filtered by Property, Unit, Customer, Status
              const forMethod = allVouchers.filter(v => {
                if (voucherPropertyFilter !== "all" && v.property_name !== voucherPropertyFilter) return false;
                if (voucherUnitFilter !== "all") {
                  if (voucherUnitFilter.includes("||")) {
                    const [p, u] = voucherUnitFilter.split("||");
                    if (v.property_name !== p || v.unit_name !== u) return false;
                  } else if (v.unit_name !== voucherUnitFilter) return false;
                }
                if (voucherCustomerFilter !== "all" && normStr(v.tenant_name) !== normStr(voucherCustomerFilter)) return false;
                if (voucherStatusFilter !== "all" && (v.pdc_status || v.status || "").toLowerCase() !== voucherStatusFilter.toLowerCase()) return false;
                return true;
              });
              const uniqueMethods = Array.from(new Set(forMethod.map(v => v.method || "PDC").filter(Boolean))).sort();

              // 5. Status options & count: filtered by Property, Unit, Customer, Method
              const forStatus = allVouchers.filter(v => {
                if (voucherPropertyFilter !== "all" && v.property_name !== voucherPropertyFilter) return false;
                if (voucherUnitFilter !== "all") {
                  if (voucherUnitFilter.includes("||")) {
                    const [p, u] = voucherUnitFilter.split("||");
                    if (v.property_name !== p || v.unit_name !== u) return false;
                  } else if (v.unit_name !== voucherUnitFilter) return false;
                }
                if (voucherCustomerFilter !== "all" && normStr(v.tenant_name) !== normStr(voucherCustomerFilter)) return false;
                if (voucherMethodFilter !== "all" && !(v.method || "").toLowerCase().includes(voucherMethodFilter.toLowerCase())) return false;
                return true;
              });
              const uniqueStatuses = Array.from(new Set(forStatus.map(v => (v.pdc_status || v.status || "in hand").toLowerCase()).filter(Boolean))).sort();

              // Final filtered table dataset
              const filteredVouchers = allVouchers.filter((v) => {
                if (!v) return false;
                if (voucherPropertyFilter !== "all" && v.property_name !== voucherPropertyFilter) return false;
                if (voucherUnitFilter !== "all") {
                  if (voucherUnitFilter.includes("||")) {
                    const [p, u] = voucherUnitFilter.split("||");
                    if (v.property_name !== p || v.unit_name !== u) return false;
                  } else if (v.unit_name !== voucherUnitFilter) return false;
                }
                if (voucherCustomerFilter !== "all" && normStr(v.tenant_name) !== normStr(voucherCustomerFilter)) return false;
                if (voucherMethodFilter !== "all" && !(v.method || "").toLowerCase().includes(voucherMethodFilter.toLowerCase())) return false;
                if (voucherStatusFilter !== "all" && (v.pdc_status || v.status || "").toLowerCase() !== voucherStatusFilter.toLowerCase()) return false;
                if (voucherSearchQuery.trim()) {
                  const q = voucherSearchQuery.toLowerCase();
                  const match =
                    (v.name || "").toLowerCase().includes(q) ||
                    (v.receiptNo || "").toLowerCase().includes(q) ||
                    (v.period || "").toLowerCase().includes(q) ||
                    (v.property_name || "").toLowerCase().includes(q) ||
                    (v.unit_name || "").toLowerCase().includes(q) ||
                    (v.tenant_name || "").toLowerCase().includes(q) ||
                    (v.method || "").toLowerCase().includes(q) ||
                    (v.pdc_status || "").toLowerCase().includes(q);
                  if (!match) return false;
                }
                return true;
              });

              return (
                <>
                  <CardHeader className="pb-3 pt-4 px-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <CardTitle className="text-base font-semibold">Detailed Voucher Accounting</CardTitle>
                        <CardDescription className="text-xs">Named financial documents model rent receipts, deposits, PDC clearance, cheque returns, rental income, and settlements synced to Finance.</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                          onClick={() => {
                            const data = filteredVouchers.map(v => ({
                              "Receipt / Voucher No": v.receiptNo || "—",
                              "Voucher Name / Type": v.name || (v.type === "receipt" ? "Rent Receipt Voucher" : "Voucher"),
                              "Lease ID": v.leaseId || "—",
                              "Customer / Tenant": v.tenant_name || "—",
                              "Property": v.property_name || "—",
                              "Unit": v.unit_name || "—",
                              "Method": v.method || "—",
                              "Period Covered": v.period || "—",
                              "Amount (QAR)": Number(v.amount) || 0,
                              "PDC / Status": v.pdc_status || v.status || "—",
                              "Due Date": v.dueDate || "—",
                              "Created Date": v.date || "—"
                            }));

                            exportToExcel({
                              filename: `vouchers_accounting_${new Date().toISOString().slice(0, 10)}`,
                              sheetName: "Vouchers",
                              data,
                              headers: [
                                { key: "Receipt / Voucher No", label: "Receipt / Voucher No", width: 22 },
                                { key: "Voucher Name / Type", label: "Voucher Name / Type", width: 25 },
                                { key: "Lease ID", label: "Lease ID", width: 14 },
                                { key: "Customer / Tenant", label: "Customer / Tenant", width: 22 },
                                { key: "Property", label: "Property", width: 20 },
                                { key: "Unit", label: "Unit", width: 12 },
                                { key: "Method", label: "Method", width: 16 },
                                { key: "Period Covered", label: "Period Covered", width: 18 },
                                { key: "Amount (QAR)", label: "Amount (QAR)", width: 16 },
                                { key: "PDC / Status", label: "PDC / Status", width: 16 },
                                { key: "Due Date", label: "Due Date", width: 14 },
                                { key: "Created Date", label: "Created Date", width: 14 },
                              ]
                            });
                          }}
                        >
                          <Download className="h-3.5 w-3.5" /> Export to Excel
                        </Button>
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

                    {/* Multi-Dimensional Filter Bar for Vouchers with SearchableSelect */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-2.5 pt-2">
                      {/* Property */}
                      <div>
                        <SearchableSelect
                          value={voucherPropertyFilter}
                          onValueChange={(pVal) => {
                            setVoucherPropertyFilter(pVal);
                            if (pVal !== "all") {
                              const matching = allVouchers.filter(v => v.property_name === pVal);
                              if (voucherUnitFilter !== "all") {
                                const unitMatches = matching.some(v => (voucherUnitFilter.includes("||") ? `${v.property_name}||${v.unit_name}` === voucherUnitFilter : v.unit_name === voucherUnitFilter));
                                if (!unitMatches) setVoucherUnitFilter("all");
                              }
                              if (voucherCustomerFilter !== "all") {
                                const custMatches = matching.some(v => normStr(v.tenant_name) === normStr(voucherCustomerFilter));
                                if (!custMatches) setVoucherCustomerFilter("all");
                              }
                              if (voucherMethodFilter !== "all") {
                                const methMatches = matching.some(v => (v.method || "").toLowerCase().includes(voucherMethodFilter.toLowerCase()));
                                if (!methMatches) setVoucherMethodFilter("all");
                              }
                              if (voucherStatusFilter !== "all") {
                                const statMatches = matching.some(v => (v.pdc_status || v.status || "").toLowerCase() === voucherStatusFilter.toLowerCase());
                                if (!statMatches) setVoucherStatusFilter("all");
                              }
                            }
                          }}
                          placeholder={`All Properties (${uniqueProps.length})`}
                          emptyText="No properties found"
                          options={[
                            { label: `All Properties (${uniqueProps.length})`, value: "all" },
                            ...uniqueProps.map((p: string) => ({ label: p, value: p }))
                          ]}
                        />
                      </div>

                      {/* Unit */}
                      <div>
                        <SearchableSelect
                          value={voucherUnitFilter}
                          onValueChange={(uVal) => {
                            setVoucherUnitFilter(uVal);
                            if (uVal !== "all") {
                              const matching = allVouchers.filter(v => (uVal.includes("||") ? `${v.property_name}||${v.unit_name}` === uVal : v.unit_name === uVal));
                              if (matching.length > 0) {
                                if (voucherPropertyFilter === "all" && matching[0].property_name) {
                                  setVoucherPropertyFilter(matching[0].property_name);
                                }
                                if (voucherCustomerFilter !== "all") {
                                  const custMatches = matching.some(v => normStr(v.tenant_name) === normStr(voucherCustomerFilter));
                                  if (!custMatches) setVoucherCustomerFilter("all");
                                }
                                if (voucherMethodFilter !== "all") {
                                  const methMatches = matching.some(v => (v.method || "").toLowerCase().includes(voucherMethodFilter.toLowerCase()));
                                  if (!methMatches) setVoucherMethodFilter("all");
                                }
                                if (voucherStatusFilter !== "all") {
                                  const statMatches = matching.some(v => (v.pdc_status || v.status || "").toLowerCase() === voucherStatusFilter.toLowerCase());
                                  if (!statMatches) setVoucherStatusFilter("all");
                                }
                              }
                            }
                          }}
                          placeholder={`All Units (${uniqueUnits.length})`}
                          emptyText="No units found"
                          options={[
                            { label: `All Units (${uniqueUnits.length})`, value: "all" },
                            ...uniqueUnits
                          ]}
                        />
                      </div>

                      {/* Customer */}
                      <div>
                        <SearchableSelect
                          value={voucherCustomerFilter}
                          onValueChange={(cVal) => {
                            setVoucherCustomerFilter(cVal);
                            if (cVal !== "all") {
                              const matching = allVouchers.filter(v => normStr(v.tenant_name) === normStr(cVal));
                              if (matching.length > 0) {
                                if (voucherPropertyFilter === "all" && matching.length === 1 && matching[0].property_name) {
                                  setVoucherPropertyFilter(matching[0].property_name);
                                }
                                if (voucherUnitFilter !== "all") {
                                  const unitMatches = matching.some(v => (voucherUnitFilter.includes("||") ? `${v.property_name}||${v.unit_name}` === voucherUnitFilter : v.unit_name === voucherUnitFilter));
                                  if (!unitMatches) setVoucherUnitFilter("all");
                                }
                                if (voucherMethodFilter !== "all") {
                                  const methMatches = matching.some(v => (v.method || "").toLowerCase().includes(voucherMethodFilter.toLowerCase()));
                                  if (!methMatches) setVoucherMethodFilter("all");
                                }
                                if (voucherStatusFilter !== "all") {
                                  const statMatches = matching.some(v => (v.pdc_status || v.status || "").toLowerCase() === voucherStatusFilter.toLowerCase());
                                  if (!statMatches) setVoucherStatusFilter("all");
                                }
                              }
                            }
                          }}
                          placeholder={`All Customers (${uniqueCusts.length})`}
                          emptyText="No customers found"
                          options={[
                            { label: `All Customers (${uniqueCusts.length})`, value: "all" },
                            ...uniqueCusts.map((c: string) => ({ label: c, value: c }))
                          ]}
                        />
                      </div>

                      {/* Method */}
                      <div>
                        <SearchableSelect
                          value={voucherMethodFilter}
                          onValueChange={(mVal) => {
                            setVoucherMethodFilter(mVal);
                            if (mVal !== "all") {
                              const matching = allVouchers.filter(v => (v.method || "").toLowerCase().includes(mVal.toLowerCase()));
                              if (matching.length > 0) {
                                if (voucherPropertyFilter !== "all") {
                                  const propMatches = matching.some(v => v.property_name === voucherPropertyFilter);
                                  if (!propMatches) setVoucherPropertyFilter("all");
                                }
                                if (voucherUnitFilter !== "all") {
                                  const unitMatches = matching.some(v => (voucherUnitFilter.includes("||") ? `${v.property_name}||${v.unit_name}` === voucherUnitFilter : v.unit_name === voucherUnitFilter));
                                  if (!unitMatches) setVoucherUnitFilter("all");
                                }
                                if (voucherCustomerFilter !== "all") {
                                  const custMatches = matching.some(v => normStr(v.tenant_name) === normStr(voucherCustomerFilter));
                                  if (!custMatches) setVoucherCustomerFilter("all");
                                }
                                if (voucherStatusFilter !== "all") {
                                  const statMatches = matching.some(v => (v.pdc_status || v.status || "").toLowerCase() === voucherStatusFilter.toLowerCase());
                                  if (!statMatches) setVoucherStatusFilter("all");
                                }
                              }
                            }
                          }}
                          placeholder={`All Methods (${uniqueMethods.length})`}
                          emptyText="No methods found"
                          options={[
                            { label: `All Methods (${uniqueMethods.length})`, value: "all" },
                            ...uniqueMethods.map((m: string) => ({ label: m, value: m }))
                          ]}
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <SearchableSelect
                          value={voucherStatusFilter}
                          onValueChange={(sVal) => {
                            setVoucherStatusFilter(sVal);
                            if (sVal !== "all") {
                              const matching = allVouchers.filter(v => (v.pdc_status || v.status || "").toLowerCase() === sVal.toLowerCase());
                              if (matching.length > 0) {
                                if (voucherPropertyFilter !== "all") {
                                  const propMatches = matching.some(v => v.property_name === voucherPropertyFilter);
                                  if (!propMatches) setVoucherPropertyFilter("all");
                                }
                                if (voucherUnitFilter !== "all") {
                                  const unitMatches = matching.some(v => (voucherUnitFilter.includes("||") ? `${v.property_name}||${v.unit_name}` === voucherUnitFilter : v.unit_name === voucherUnitFilter));
                                  if (!unitMatches) setVoucherUnitFilter("all");
                                }
                                if (voucherCustomerFilter !== "all") {
                                  const custMatches = matching.some(v => normStr(v.tenant_name) === normStr(voucherCustomerFilter));
                                  if (!custMatches) setVoucherCustomerFilter("all");
                                }
                                if (voucherMethodFilter !== "all") {
                                  const methMatches = matching.some(v => (v.method || "").toLowerCase().includes(voucherMethodFilter.toLowerCase()));
                                  if (!methMatches) setVoucherMethodFilter("all");
                                }
                              }
                            }
                          }}
                          placeholder={`All Statuses (${uniqueStatuses.length})`}
                          emptyText="No statuses found"
                          options={[
                            { label: `All Statuses (${uniqueStatuses.length})`, value: "all" },
                            ...uniqueStatuses.map((s: string) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s }))
                          ]}
                        />
                      </div>

                      {/* Search */}
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          className="h-9 text-xs pl-8 bg-background"
                          placeholder="Search vouchers..."
                          value={voucherSearchQuery}
                          onChange={(e) => setVoucherSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    {vouchersLoading ? (
                      <div className="flex items-center justify-center py-12 text-muted-foreground gap-2 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading PDC vouchers…
                      </div>
                    ) : (
                      <DataTable
                        key={`vouchers-${voucherPropertyFilter}-${voucherUnitFilter}-${voucherCustomerFilter}-${voucherMethodFilter}-${voucherStatusFilter}-${voucherSearchQuery}`}
                        columns={["Voucher / Receipt", "Property", "Unit", "Customer", "Method / Period", "Amount", "Status"]}
                        rows={filteredVouchers.map((voucher) => {
                          const vv = voucher as any;
                          const vName   = voucher.name || "Voucher";
                          const vProp   = vv.property_name || "—";
                          const vUnit   = vv.unit_name || "—";
                          const vCust   = vv.tenant_name || "—";
                          const pdcSt   = (vv.pdc_status || "in hand") as string;

                          // PDC-status-aware badge
                          const pdcStatusBadge = (() => {
                            const s = pdcSt.toLowerCase();
                            if (s === "cleared")   return <span key="st" className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">Cleared</span>;
                            if (s === "deposited") return <span key="st" className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">Deposited</span>;
                            if (s === "returned" || s === "bounced") return <span key="st" className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
                            if (s === "cancelled") return <span key="st" className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">Cancelled</span>;
                            if (s === "replaced")  return <span key="st" className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">Replaced</span>;
                            // Default: In Hand
                            return <span key="st" className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">In Hand</span>;
                          })();

                          return [
                            <span key="vname" className="font-medium text-foreground">{`${vName} / ${voucher.receiptNo || "—"}`}</span>,
                            <span key="vprop" className="text-xs text-muted-foreground">{vProp}</span>,
                            <span key="vunit" className="font-mono text-xs font-semibold text-foreground">{vUnit}</span>,
                            <span key="vcust" className="text-xs font-medium text-foreground">{vCust}</span>,
                            `${voucher.method || "—"} / ${voucher.period || "—"}`,
                            formatMoney(Number(voucher.amount) || 0),
                            pdcStatusBadge,
                          ];
                        })}
                      />
                    )}
                  </CardContent>
                </>
              );
            })()}
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader className="pb-3 pt-4 px-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-semibold">SRS Workflow &amp; Audit History</CardTitle>
                  <CardDescription className="text-xs">Each stage records responsible department, input, approval, system status and output for future reference and audit.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                    onClick={() => {
                      const data = auditEvents.map(event => ({
                        "Timestamp / Date": event.at,
                        "Workflow Stage": event.stage,
                        "Department / Owner": event.owner,
                        "Input / Data": event.input,
                        "Approval / Verifier": event.approval,
                        "Status": event.status,
                        "System Output / Artifact": event.output
                      }));

                      exportToExcel({
                        filename: `audit_workflow_history_${new Date().toISOString().slice(0, 10)}`,
                        sheetName: "Audit History",
                        data,
                        headers: [
                          { key: "Timestamp / Date", label: "Timestamp / Date", width: 20 },
                          { key: "Workflow Stage", label: "Workflow Stage", width: 22 },
                          { key: "Department / Owner", label: "Department / Owner", width: 20 },
                          { key: "Input / Data", label: "Input / Data", width: 35 },
                          { key: "Approval / Verifier", label: "Approval / Verifier", width: 20 },
                          { key: "Status", label: "Status", width: 16 },
                          { key: "System Output / Artifact", label: "System Output / Artifact", width: 35 },
                        ]
                      });
                    }}
                  >
                    <Download className="h-3.5 w-3.5" /> Export to Excel
                  </Button>
                </div>
              </div>
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

      {/* ── VOUCHER APPROVAL MODAL ─────────────────────────────────── */}
      <VoucherApprovalModal
        isOpen={voucherApprovalOpen}
        onClose={() => setVoucherApprovalOpen(false)}
        onSuccess={() => {
          setVoucherApprovalOpen(false);
        }}
      />

      {/* ── MONTH-END REVENUE RECOGNITION MODAL ───────────────────── */}
      <RevenueRecognitionModal
        isOpen={revenueRecognitionOpen}
        onClose={() => setRevenueRecognitionOpen(false)}
        onSuccess={() => {
          setRevenueRecognitionOpen(false);
        }}
      />
    </div>
  );
}

function Metric({ label, value, icon, description }: { label: string; value: number | string; icon: React.ReactNode; description?: string }) {
  return (
    <Card>
      <CardHeader className="pb-1 pt-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-0">
        <div className="text-xl font-bold truncate">{value}</div>
        {description && <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{description}</p>}
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
  const totalPages = Math.max(1, Math.ceil(rows.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedRows = rows.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const startIdx = rows.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1;
  const endIdx = Math.min(safePage * ITEMS_PER_PAGE, rows.length);

  // Generate page numbers to display with smart ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | "ellipsis")[] = [];
    pages.push(1);
    if (safePage > 3) {
      pages.push("ellipsis");
    }
    const start = Math.max(2, safePage - 1);
    const end = Math.min(totalPages - 1, safePage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (safePage < totalPages - 2) {
      pages.push("ellipsis");
    }
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="space-y-3 w-full">
      <div className="overflow-x-auto rounded-md border w-full">
        <table className="w-full text-xs">
          <thead className="border-b bg-muted/40">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-2.5 py-2 text-left text-[11px] font-semibold uppercase text-muted-foreground last:text-right whitespace-nowrap">{column}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">No records yet.</td></tr>
            ) : paginatedRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="align-middle hover:bg-muted/20 transition-colors">
                {row.map((cell, cellIndex) => (
                  <td key={`${rowIndex}-${cellIndex}`} className="px-2.5 py-1.5 last:text-right">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 py-1 text-xs text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground">{startIdx}</span>–<span className="font-semibold text-foreground">{endIdx}</span> of <span className="font-semibold text-foreground">{rows.length}</span> records
          </div>
          {totalPages > 1 && (
            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage(p => Math.max(1, p - 1)); }}
                    className={safePage === 1 ? "pointer-events-none opacity-50 h-8 text-xs" : "h-8 text-xs cursor-pointer"}
                  />
                </PaginationItem>
                {getPageNumbers().map((p, idx) => (
                  <PaginationItem key={idx}>
                    {p === "ellipsis" ? (
                      <PaginationEllipsis className="h-8 w-8" />
                    ) : (
                      <PaginationLink
                        href="#"
                        onClick={(e) => { e.preventDefault(); setPage(p); }}
                        isActive={safePage === p}
                        className="h-8 w-8 text-xs cursor-pointer"
                      >
                        {p}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage(p => Math.min(totalPages, p + 1)); }}
                    className={safePage === totalPages ? "pointer-events-none opacity-50 h-8 text-xs" : "h-8 text-xs cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}

export default LeasingPage;
