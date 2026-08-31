import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useAppData } from "@/lib/app-data-context";
import { fetchAssets, updateAsset, type Asset as SupabaseAsset } from "@/lib/supabase";
import { generateLeaseAgreementBlob } from "@/components/lease-agreement-template";
import { getTodayIST, getCurrentISTDate, formatDateDDMMYYYY } from "@/lib/date-utils";
import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  DoorOpen,
  Download,
  FileCheck2,
  FileSignature,
  Key,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Printer,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Upload,
  UserPlus,
  Users,
  Wallet,
  XCircle,
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
import { postVoucher } from "@/lib/finance/posting-engine";

export const Route = createFileRoute("/prop-mgr/leasing")({
  component: LeasingPage,
});

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

const initialUnits: Unit[] = [
  { id: "u1", property: "Old Salata - Residence No:23", unit: "AAA - GF2", status: "Available", rent: 5500 },
  { id: "u2", property: "Old Salata - Residence No:23", unit: "AAA - Flat16", status: "Occupied", rent: 5100 },
  { id: "u3", property: "Old Salata - Residence No:13", unit: "Old Salata 2 - Flat04", status: "Available", rent: 4300 },
  { id: "u4", property: "Old Salata - Residence No:23", unit: "AAA - Flat21", status: "Occupied", rent: 6400 },
  { id: "u5", property: "Regency Residence Al Sadd 1", unit: "ARRS01-B00-F00-AG01", status: "Occupied", rent: 4000 },
];

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

const initialCustomers: Customer[] = [
  {
    id: "c1",
    name: "Mr. Hafeez Shaik",
    type: "individual",
    qatarId: "QID-28475630123",
    passport: "P9823114",
    crNumber: "",
    mobile: "+974 5511 2200",
    email: "hafeez@example.com",
    status: "active",
  },
  {
    id: "c2",
    name: "M/S. Al Ameen Real Estate",
    type: "company",
    qatarId: "",
    passport: "",
    crNumber: "CR-779214",
    mobile: "+974 4477 8800",
    email: "accounts@alameen.qa",
    status: "active",
  },
  {
    id: "c3",
    name: "Vivek Viswakumaran Nair",
    type: "individual",
    qatarId: "QID-ARRS01-52",
    passport: "",
    crNumber: "",
    mobile: "+974 4448 5111",
    email: "vivek@example.com",
    status: "active",
  },
];

const initialReservations: Reservation[] = [
  {
    id: "r1",
    property: "Old Salata - Residence No:23",
    unit: "AAA - GF2",
    tenantName: "Mr. Abdullah Saleh",
    agent: "Marketing Agent",
    startDate: "2026-08-01",
    validUntil: "2026-07-22",
    rent: 5500,
    status: "reserved",
    remarks: "Awaiting QID and salary certificate",
  },
];

const initialDocuments: TenantDocument[] = [
  { id: "d1", customerId: "c1", name: "Qatar ID", mandatory: true, status: "verified", expiryDate: "2027-04-20", reviewer: "Leasing Dept", remarks: "" },
  { id: "d2", customerId: "c1", name: "Passport copy", mandatory: true, status: "verified", expiryDate: "2029-12-10", reviewer: "Leasing Dept", remarks: "" },
  { id: "d3", customerId: "c1", name: "Security deposit proof", mandatory: true, status: "pending", expiryDate: "", reviewer: "", remarks: "Cashier receipt pending" },
  { id: "d4", customerId: "c2", name: "Commercial Registration", mandatory: true, status: "verified", expiryDate: "2026-12-31", reviewer: "Leasing Dept", remarks: "" },
  { id: "d5", customerId: "c2", name: "Computer Card", mandatory: true, status: "info_required", expiryDate: "2026-10-10", reviewer: "Leasing Dept", remarks: "Need renewed copy" },
];

const initialLeases: Lease[] = [
  {
    id: "l1",
    customerId: "c1",
    reservationId: "",
    property: "Old Salata - Residence No:23",
    unit: "AAA - Flat16",
    tenantName: "Mr. Hafeez Shaik",
    startDate: "2025-10-01",
    endDate: "2026-09-30",
    monthlyRent: 5600,
    securityDeposit: 5100,
    pdcCount: 12,
    paymentFrequency: "monthly",
    gracePeriodDays: 5,
    penalties: "Late payment penalty after grace period",
    maintenanceResponsibility: "Property Manager for major repairs, tenant for misuse damages",
    utilityResponsibility: "Tenant",
    parkingDetails: "1 parking remote and access card",
    specialConditions: "Subject to landlord signature and key handover",
    noticePeriodDays: 60,
    status: "collection_completed",
    tenantSignedAt: "2025-09-24",
    signedDocument: "tenant-signed-lease-l1.pdf",
    receivedBy: "Leasing Department",
    collectionCompleted: true,
  },
  {
    id: "l2",
    customerId: "c2",
    reservationId: "",
    property: "Old Salata - Residence No:23",
    unit: "AAA - GF1",
    tenantName: "M/S. Al Ameen Real Estate",
    startDate: "2025-01-01",
    endDate: "2026-08-31",
    monthlyRent: 5500,
    securityDeposit: 5500,
    pdcCount: 12,
    paymentFrequency: "monthly",
    gracePeriodDays: 5,
    penalties: "Returned cheque charges apply",
    maintenanceResponsibility: "Shared as per lease clause",
    utilityResponsibility: "Tenant",
    parkingDetails: "Covered parking",
    specialConditions: "Corporate authorized signatory required",
    noticePeriodDays: 60,
    status: "renewal_due",
    tenantSignedAt: "2024-12-20",
    landlordSignedAt: "2024-12-22",
    signedDocument: "fully-signed-lease-l2.pdf",
    receivedBy: "Leasing Department",
    landlordPackageSubmittedAt: "2024-12-21",
    sharedWithTenant: true,
    collectionCompleted: true,
  },
  {
    // ARRS01-LES-25-52-0 — Receipt Acknowledgement dated 23-DEC-25
    id: "l3",
    customerId: "c3",
    reservationId: "",
    property: "Regency Residence Al Sadd 1",
    unit: "ARRS01-B00-F00-AG01",
    tenantName: "Vivek Viswakumaran Nair",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    monthlyRent: 4000,
    securityDeposit: 4000, // QR 1,000 cash + 2× QR 1,500 PDC
    pdcCount: 12,
    paymentFrequency: "monthly",
    gracePeriodDays: 5,
    penalties: "Returned cheque charges apply; late payment penalty after grace period",
    maintenanceResponsibility: "Property Manager for major repairs",
    utilityResponsibility: "Tenant",
    parkingDetails: "Covered parking bay",
    specialConditions: "Location code ARRS01-B00-F00-AG01; PO Box 9012",
    noticePeriodDays: 60,
    status: "fully_signed",
    tenantSignedAt: "2025-12-23",
    landlordSignedAt: "2025-12-23",
    signedDocument: "ARRS01-LES-25-52-0-signed.pdf",
    receivedBy: "Ms. MerricSuibai Murla",
    landlordPackageSubmittedAt: "2025-12-23",
    sharedWithTenant: true,
    collectionCompleted: true,
  },
];

const initialPdcs: Pdc[] = [
  { id: "p1", leaseId: "l1", chequeNo: "CHQ-1001", bank: "QNB", date: "2026-08-01", amount: 5600, status: "received" },
  { id: "p2", leaseId: "l1", chequeNo: "CHQ-1002", bank: "QNB", date: "2026-09-01", amount: 5600, status: "received" },
  { id: "p3", leaseId: "l2", chequeNo: "CHQ-2001", bank: "Doha Bank", date: "2026-08-01", amount: 5500, status: "deposited" },
  // Vivek Viswakumaran Nair — ARRS01-LES-25-52-0 (Security Deposits)
  { id: "p4", leaseId: "l3", chequeNo: "25631298", bank: "Cash", date: "2025-12-23", amount: 1000, status: "cleared" },   // Deposit S/No.1 — Cash
  { id: "p5", leaseId: "l3", chequeNo: "01000069", bank: "CBQ", date: "2026-01-05", amount: 1500, status: "received" },    // Deposit S/No.2 — PDC
  { id: "p6", leaseId: "l3", chequeNo: "01000070", bank: "CBQ", date: "2026-02-05", amount: 1500, status: "received" },    // Deposit S/No.3 — PDC
  // Vivek — Rent PDCs (S/No.4–15)
  { id: "p7",  leaseId: "l3", chequeNo: "01000049", bank: "CBQ", date: "2026-01-05", amount: 4000, status: "deposited" },  // Jan 2026
  { id: "p8",  leaseId: "l3", chequeNo: "01000050", bank: "CBQ", date: "2026-02-05", amount: 4000, status: "deposited" },  // Feb 2026
  { id: "p9",  leaseId: "l3", chequeNo: "01000059", bank: "CBQ", date: "2026-03-05", amount: 4000, status: "deposited" },  // Mar 2026
  { id: "p10", leaseId: "l3", chequeNo: "01000060", bank: "CBQ", date: "2026-04-05", amount: 4000, status: "deposited" },  // Apr 2026
  { id: "p11", leaseId: "l3", chequeNo: "01000061", bank: "CBQ", date: "2026-05-05", amount: 4000, status: "deposited" },  // May 2026
  { id: "p12", leaseId: "l3", chequeNo: "01000062", bank: "CBQ", date: "2026-06-05", amount: 4000, status: "deposited" },  // Jun 2026
  { id: "p13", leaseId: "l3", chequeNo: "01000063", bank: "CBQ", date: "2026-07-05", amount: 4000, status: "received" },   // Jul 2026
  { id: "p14", leaseId: "l3", chequeNo: "01000064", bank: "CBQ", date: "2026-08-05", amount: 4000, status: "received" },   // Aug 2026
  { id: "p15", leaseId: "l3", chequeNo: "01000065", bank: "CBQ", date: "2026-09-05", amount: 4000, status: "received" },   // Sep 2026
  { id: "p16", leaseId: "l3", chequeNo: "01000066", bank: "CBQ", date: "2026-10-05", amount: 4000, status: "received" },   // Oct 2026
  { id: "p17", leaseId: "l3", chequeNo: "01000067", bank: "CBQ", date: "2026-11-05", amount: 4000, status: "received" },   // Nov 2026
  { id: "p18", leaseId: "l3", chequeNo: "01000068", bank: "CBQ", date: "2026-12-05", amount: 4000, status: "received" },   // Dec 2026
];

const initialVouchers: Voucher[] = [
  // ── L1: Mr. Hafeez Shaik / AAA - Flat16 ──────────────────────────────
  { id: "v1", leaseId: "l1", name: "Receipts Voucher - Rent", receiptNo: "RV-2025-1001", method: "PDC", period: "Oct 2025 - Sep 2026", debit: "PDC In Hand", credit: "Customer(PDC)-AAA Flat16", amount: 67200, status: "posted" },
  { id: "v2", leaseId: "l1", name: "Receipts Voucher - Deposit", receiptNo: "RV-2025-1002", method: "Cash", period: "Security deposit", debit: "Cash In Hand", credit: "Security Deposit Liability", amount: 5100, status: "posted" },
  { id: "v3", leaseId: "l1", name: "Rental Income Doc", receiptNo: "RID-2025-1001", method: "Batch", period: "Oct 2025", debit: "Receivable-AAA Flat16", credit: "Rental Income", amount: 5600, status: "draft" },
  // ── L3: Vivek Viswakumaran Nair / ARRS01-B00-F00-AG01 ───────────────
  // Acknowledgement No. ARE-RT-25-3962-0 | Collection Date: 23-DEC-25
  { id: "v4", leaseId: "l3", name: "Receipt Voucher - Security Deposit (Cash)", receiptNo: "ARE-RT-25-3962-0", method: "Cash", period: "Security Deposit", debit: "Cash In Hand", credit: "Security Deposit Liability-AG01", amount: 1000, status: "posted" },
  { id: "v5", leaseId: "l3", name: "Receipt Voucher - Security Deposit (PDC)", receiptNo: "ARE-RT-25-3962-1", method: "PDC", period: "Security Deposit", debit: "PDC In Hand", credit: "Customer(PDC)-AG01", amount: 3000, status: "posted" },
  { id: "v6", leaseId: "l3", name: "Receipt Voucher - Rent (PDC)", receiptNo: "ARE-RT-25-3962-2", method: "PDC", period: "Jan 2026 - Dec 2026", debit: "PDC In Hand", credit: "Customer(PDC)-AG01", amount: 48000, status: "posted" },
  { id: "v7", leaseId: "l3", name: "Deposit Voucher - Jan Rent (CBQ)", receiptNo: "DV-L3-2601", method: "PDC", period: "Jan 2026", debit: "Bank Account-CBQ", credit: "PDC In Hand", amount: 4000, status: "posted" },
  { id: "v8", leaseId: "l3", name: "Deposit Voucher - Feb Rent (CBQ)", receiptNo: "DV-L3-2602", method: "PDC", period: "Feb 2026", debit: "Bank Account-CBQ", credit: "PDC In Hand", amount: 4000, status: "posted" },
  { id: "v9", leaseId: "l3", name: "Deposit Voucher - Mar Rent (CBQ)", receiptNo: "DV-L3-2603", method: "PDC", period: "Mar 2026", debit: "Bank Account-CBQ", credit: "PDC In Hand", amount: 4000, status: "posted" },
  { id: "v10", leaseId: "l3", name: "Deposit Voucher - Apr Rent (CBQ)", receiptNo: "DV-L3-2604", method: "PDC", period: "Apr 2026", debit: "Bank Account-CBQ", credit: "PDC In Hand", amount: 4000, status: "posted" },
  { id: "v11", leaseId: "l3", name: "Deposit Voucher - May Rent (CBQ)", receiptNo: "DV-L3-2605", method: "PDC", period: "May 2026", debit: "Bank Account-CBQ", credit: "PDC In Hand", amount: 4000, status: "posted" },
  { id: "v12", leaseId: "l3", name: "Deposit Voucher - Jun Rent (CBQ)", receiptNo: "DV-L3-2606", method: "PDC", period: "Jun 2026", debit: "Bank Account-CBQ", credit: "PDC In Hand", amount: 4000, status: "posted" },
  { id: "v13", leaseId: "l3", name: "Rental Income Doc - Jan 2026", receiptNo: "RI-L3-2601", method: "Batch", period: "Jan 2026", debit: "Receivable-AG01", credit: "Rental Income-AG01", amount: 4000, status: "posted" },
  { id: "v14", leaseId: "l3", name: "Rental Income Doc - Feb 2026", receiptNo: "RI-L3-2602", method: "Batch", period: "Feb 2026", debit: "Receivable-AG01", credit: "Rental Income-AG01", amount: 4000, status: "posted" },
  { id: "v15", leaseId: "l3", name: "Rental Income Doc - Mar 2026", receiptNo: "RI-L3-2603", method: "Batch", period: "Mar 2026", debit: "Receivable-AG01", credit: "Rental Income-AG01", amount: 4000, status: "posted" },
  { id: "v16", leaseId: "l3", name: "Rental Income Doc - Apr 2026", receiptNo: "RI-L3-2604", method: "Batch", period: "Apr 2026", debit: "Receivable-AG01", credit: "Rental Income-AG01", amount: 4000, status: "posted" },
  { id: "v17", leaseId: "l3", name: "Rental Income Doc - May 2026", receiptNo: "RI-L3-2605", method: "Batch", period: "May 2026", debit: "Receivable-AG01", credit: "Rental Income-AG01", amount: 4000, status: "posted" },
  { id: "v18", leaseId: "l3", name: "Rental Income Doc - Jun 2026", receiptNo: "RI-L3-2606", method: "Batch", period: "Jun 2026", debit: "Receivable-AG01", credit: "Rental Income-AG01", amount: 4000, status: "posted" },
  { id: "v19", leaseId: "l3", name: "Rental Income Doc - Jul 2026", receiptNo: "RI-L3-2607", method: "Batch", period: "Jul 2026", debit: "Receivable-AG01", credit: "Rental Income-AG01", amount: 4000, status: "draft" },
];

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next.toISOString().split("T")[0];
}

function isExpired(date: string) {
  return new Date(date) < today;
}

function formatMoney(value: number) {
  return `QR ${Number(value || 0).toLocaleString()}`;
}

function getVoucherAccounts(name: string, unit: string, method?: string) {
  const cleanUnit = unit || "Unit";
  if (name.includes("Deposit Voucher") || name.includes("Deposit - Rent")) {
    return { debit: "Bank Account-CBQ", credit: "PDC In Hand" };
  }
  if (name.includes("Security Deposit") || name.includes("Deposit")) {
    const dr = method === "Cash" ? "Cash In Hand" : method === "Bank Transfer" ? "Bank Account-CBQ" : "PDC In Hand";
    return { debit: dr, credit: `Security Deposit Liability-${cleanUnit}` };
  }
  if (name.includes("Rental Income") || name.includes("Rent Income")) {
    return { debit: `Receivable-${cleanUnit}`, credit: `Rental Income-${cleanUnit}` };
  }
  if (name.includes("Payment Voucher") || name.includes("Payment")) {
    return { debit: "Payable Account", credit: "Bank Account-CBQ" };
  }
  if (name.includes("Cheque Return")) {
    return { debit: `Receivable-${cleanUnit}`, credit: "Bank Account-CBQ" };
  }
  // Default Rent Receipts Voucher
  const dr = method === "Cash" ? "Cash In Hand" : method === "Bank Transfer" ? "Bank Account-CBQ" : "PDC In Hand";
  return { debit: dr, credit: `Customer(PDC)-${cleanUnit}` };
}

function LeasingPage() {
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
  } = useAppData();
  const { addJournalEntry, addVoucher: addFinanceVoucher, addReceivableInvoice, addCashBookEntry } = useFinanceStore();
  const [documents, setDocuments] = useState<TenantDocument[]>(initialDocuments);
  const [inspections, setInspections] = useState<Inspection[]>([
    {
      id: "ci-l1",
      leaseId: "l1",
      type: "check_in",
      condition: "Good",
      electricityMeter: "182167",
      waterMeter: "149089",
      damages: "None recorded",
      acknowledged: true,
      photos: 8,
    }
  ]);
  const [renewals, setRenewals] = useState<RenewalCase[]>([
    {
      id: "rn1",
      leaseId: "l1",
      noticeDate: "2026-08-01",
      status: "awaiting_response",
      proposedRent: 5880,
      proposedPeriod: "12 months; QR 5,880; 5% rent revision; notice period retained",
      revisedTerms: "5% rent revision; 60-day notice period retained",
      expiryDate: "2026-09-30",
      requiredNoticePeriod: "60 days",
      lastConfirmationDate: "2026-08-31",
      outstandingObligations: "Finance to confirm outstanding rent, PDC and maintenance obligations",
      recipients: "Tenant, Leasing Department, Marketing Agent, Property Manager, Landlord or Authorized Person",
      followUpOwner: "Leasing Department",
    },
    {
      id: "rn2",
      leaseId: "l2",
      noticeDate: "2026-07-01",
      status: "awaiting_response",
      proposedRent: 5775,
      proposedPeriod: "12 months; QR 5,775; 5% rent revision; notice period retained",
      revisedTerms: "5% rent revision; 60-day notice period retained",
      expiryDate: "2026-08-31",
      requiredNoticePeriod: "60 days",
      lastConfirmationDate: "2026-08-01",
      outstandingObligations: "Finance to confirm outstanding rent, PDC and maintenance obligations",
      recipients: "Tenant, Leasing Department, Marketing Agent, Property Manager, Landlord or Authorized Person",
      followUpOwner: "Leasing Department",
    }
  ]);
  const [checkouts, setCheckouts] = useState<CheckoutCase[]>([
    {
      id: "co1",
      leaseId: "l1",
      noticeDate: "2026-08-25",
      moveOutDate: "2026-09-30",
      inspectionDate: "2026-09-27",
      comparisonSummary: "Pending final comparison with original check-in report",
      nonRenewalNotice: "Tenant non-renewal notice received",
      outstandingCharges: "Pending finance confirmation",
      utilityClearanceRequirements: "Final utility clearance required before checkout closure",
      keyReturnRequirements: "Return all keys, access cards, parking remotes and property items",
      financeClearance: false,
      utilityClearance: false,
      keysReturned: false,
      status: "planned",
    }
  ]);
  const [settlements, setSettlements] = useState<Settlement[]>([
    {
      id: "s1",
      leaseId: "l1",
      depositReceived: 5100,
      outstandingRent: 0,
      damages: 650,
      utilityCharges: 220,
      cleaningCharges: 0,
      restorationCharges: 0,
      otherDeductions: 0,
      refundableBalance: 4230,
      unitDisposition: "Vacant - Under Maintenance",
      approval: "pending_approval",
    }
  ]);
  const [busyAction, setBusyAction] = useState("");

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
    let channel: ReturnType<typeof import('@/lib/supabase').supabase.channel> | null = null;
    import('@/lib/supabase').then(({ supabase }) => {
      channel = supabase
        .channel("leasing-page:leases")
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
    return () => { channel && import('@/lib/supabase').then(({ supabase }) => supabase.removeChannel(channel!)); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Customer Dialog States ────────────────────────────────────
  const [viewCustomerOpen, setViewCustomerOpen] = useState(false);
  const [viewCustomerData, setViewCustomerData] = useState<Customer | null>(null);
  const [editCustomerOpen, setEditCustomerOpen] = useState(false);
  const [editCustomerData, setEditCustomerData] = useState<Customer | null>(null);

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
    chequeIntervalDays: 30,
    regularChequeAmount: "",
    customCheques: [] as Array<{ chequeNo: string; bank: string; date: string; amount: number; period: string; tenureStart: string; tenureEnd: string; file: string }>,
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
    damageRemarks: "",
    notes: "",
    // Payment details when customer pays separately
    paymentRefNo: "",
    payerBank: "QNB",
    paymentDate: today.toISOString().split("T")[0],
    bgExpiryDate: "",
    paymentProofFileName: "",
    paymentProofData: "",
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

  const activeReservations = reservations.filter((item) => item.status === "reserved").length;
  const blockedDocuments = documents.filter((item) => item.mandatory && item.status !== "verified").length;
  const readyForKeys = leases.filter((lease) => lease.status === "fully_signed").length;
  const openSettlements = settlements.filter((item) => item.approval !== "paid").length;

  const upcomingRenewals = useMemo(
    () =>
      leases.filter((lease) => {
        const days = Math.ceil((new Date(lease.endDate).getTime() - today.getTime()) / 86400000);
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

  function releaseFuturePdcExposure(lease: Lease, vacateDate: string) {
    const effectiveVacateTs = new Date(vacateDate).getTime();
    const pendingStatuses: PdcStatus[] = ["received", "replaced"];
    const futurePdcs = pdcs.filter((item) =>
      item.leaseId === lease.id &&
      pendingStatuses.includes(item.status) &&
      new Date(item.date).getTime() > effectiveVacateTs,
    );

    if (futurePdcs.length === 0) {
      return { returnedCount: 0, returnedAmount: 0 };
    }

    setPdcs((items) => items.map((item) => (
      futurePdcs.some((pdc) => pdc.id === item.id)
        ? { ...item, status: "returned" as PdcStatus }
        : item
    )));

    const returnedAmount = futurePdcs.reduce((sum, item) => sum + item.amount, 0);
    const voucherNo = `JV-PDC-RET-${Date.now().toString().slice(-6)}`;

    addJournalEntry({
      je_no: voucherNo,
      posting_date: vacateDate,
      reference: `Early vacate PDC return: ${lease.tenantName}`,
      narration: `Future rent PDCs returned after early vacate for ${lease.unit}`,
      dr_account: "Customer PDC Liability",
      dr_code: "21400",
      cr_account: "PDC In Hand",
      cr_code: "12900",
      amount: returnedAmount,
      property_name: lease.property,
      unit_ref: lease.unit,
      tenant_name: lease.tenantName,
    });

    setVouchers((items) => [
      {
        id: `v${items.length + 1}`,
        leaseId: lease.id,
        name: "Journal Voucher - Future PDCs Returned on Early Vacate",
        receiptNo: voucherNo,
        method: "Journal",
        period: `PDCs after ${vacateDate}`,
        debit: "Customer PDC Liability (21400)",
        credit: "PDC In Hand (12900)",
        amount: returnedAmount,
        status: "posted",
      },
      ...items,
    ]);

    recordAudit({
      stage: "Early Vacate PDC Return",
      owner: "Finance Department",
      input: `${futurePdcs.length} future PDC(s) after ${vacateDate}`,
      approval: "Lease early termination settlement",
      status: "completed",
      output: `Returned ${futurePdcs.length} pending PDC(s) totalling ${formatMoney(returnedAmount)} and reversed PDC exposure from finance reports`,
    });

    return { returnedCount: futurePdcs.length, returnedAmount };
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

  function isCustomerDuplicate(form: Omit<Customer, "id" | "status">) {
    const identifiers = [form.qatarId, form.passport, form.crNumber, form.mobile, form.email].filter(Boolean);
    if (identifiers.length === 0) {
      return false;
    }

    return customers.some((customer) =>
      [customer.qatarId, customer.passport, customer.crNumber, customer.mobile, customer.email]
        .filter(Boolean)
        .some((value) => identifiers.includes(value)),
    );
  }

  function createCustomer() {
    if (!customerForm.name.trim()) {
      alert("Please enter a customer name before saving.");
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

  function submitCollect() {
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
      const firstDate = new Date(collectForm.firstChequeDate || collectForm.startDate || lease.startDate);
      const interval = Number(collectForm.chequeIntervalDays) || 30;

      nextPdcs = Array.from({ length: count }, (_, index) => {
        let amount = regularAmt;
        if (index === count - 1 && count > 1 && regularAmt * (count - 1) < totalRent) {
          amount = totalRent - regularAmt * (count - 1);
        }
        return {
          id: `p${pdcs.length + index + 1}`,
          leaseId: lease.id,
          chequeNo: `PDC-${lease.unit.replace(/\W/g, "")}-${String(index + 1).padStart(3, "0")}`,
          bank: collectForm.chequeBank || "Tenant Bank",
          date: addDays(firstDate, index * interval),
          amount: Math.max(0, amount),
          payerName: collectForm.payerName || lease.tenantName,
          period: `Cheque ${index + 1} of ${count}`,
          status: "received" as PdcStatus,
        };
      });
    }

    const pdcTotal = nextPdcs.reduce((sum, pdc) => sum + pdc.amount, 0);
    setPdcs((items) => [...nextPdcs, ...items]);

    const agencyAmt = Number(collectForm.agencyCommission) || 0;
    const adminAmt = Number(collectForm.adminCharges) || 0;
    // Type 1: Unit Security Deposit (GL 21500)
    const depAmt = Number(collectForm.depositAmount) || lease.securityDeposit;
    // Type 2: Ancillary Refundable Deposits & Guarantees (GL 21100)
    const utilityAmt = Number(collectForm.utilityDeposit) || 0; // Kahramaa (21100003)
    const qatarCoolAmt = Number(collectForm.qatarCoolDeposit) || 0; // Qatar Cool (21100004)
    const reservationAmt = Number(collectForm.reservationDeposit) || 0; // Reservation Advance (21100001)
    const serviceFeeAmt = Number(collectForm.serviceFeeDeposit) || 0; // Service Fee (21100005)
    const guaranteeChequeAmt = Number(collectForm.guaranteeChequeDeposit) || 0; // Guarantee Cheque (21100006)

    const today_str = today.toISOString().split("T")[0];
    const jeNo = `JE-COLL-${lease.id.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const newVouchers: Voucher[] = [
      { id: `v${vouchers.length + 1}`, leaseId: lease.id, name: "Receipts Voucher - Rent", receiptNo: `RV-${lease.id}-01`, method: collectForm.paymentMode, period: `${collectForm.startDate || lease.startDate} to ${collectForm.endDate || lease.endDate}`, debit: "PDC In Hand", credit: `Customer(PDC)-${lease.unit}`, amount: pdcTotal, status: "posted" },
      { id: `v${vouchers.length + 2}`, leaseId: lease.id, name: "Receipts Voucher - Unit Security Deposit (21500)", receiptNo: `RV-${lease.id}-02`, method: collectForm.depositMode, period: "Unit Security Deposit", debit: collectForm.depositMode === "Cash" ? "Cash In Hand" : collectForm.depositMode === "Bank Transfer" ? "Bank Operating Account" : "PDC In Hand", credit: "Security Deposit Liability (21500)", amount: depAmt, status: "posted" },
      ...(utilityAmt > 0 ? [{ id: `v${vouchers.length + 3}`, leaseId: lease.id, name: "Receipts Voucher - Kahramaa Deposit (21100)", receiptNo: `RV-${lease.id}-03`, method: "Cash", period: "Kahramaa Utility Deposit", debit: "Cash In Hand", credit: "Refundable Security Deposit - Tenant (21100003)", amount: utilityAmt, status: "posted" as const }] : []),
      ...(qatarCoolAmt > 0 ? [{ id: `v${vouchers.length + 4}`, leaseId: lease.id, name: "Receipts Voucher - Qatar Cool Deposit (21100)", receiptNo: `RV-${lease.id}-04`, method: "Cash", period: "Qatar Cool Deposit", debit: "Cash In Hand", credit: "Refundable Security Deposit - Tenant (21100004)", amount: qatarCoolAmt, status: "posted" as const }] : []),
      ...(reservationAmt > 0 ? [{ id: `v${vouchers.length + 5}`, leaseId: lease.id, name: "Receipts Voucher - Reservation Advance (21100)", receiptNo: `RV-${lease.id}-05`, method: "Cash", period: "Reservation Advance Deposit", debit: "Cash In Hand", credit: "Refundable Security Deposit - Tenant (21100001)", amount: reservationAmt, status: "posted" as const }] : []),
      ...(serviceFeeAmt > 0 ? [{ id: `v${vouchers.length + 6}`, leaseId: lease.id, name: "Receipts Voucher - Service Fee / Key Deposit (21100)", receiptNo: `RV-${lease.id}-06`, method: "Cash", period: "Service Fee Deposit", debit: "Cash In Hand", credit: "Refundable Security Deposit - Tenant (21100005)", amount: serviceFeeAmt, status: "posted" as const }] : []),
      ...(guaranteeChequeAmt > 0 ? [{ id: `v${vouchers.length + 7}`, leaseId: lease.id, name: "Receipts Voucher - Guarantee Cheque (21100)", receiptNo: `RV-${lease.id}-07`, method: "Guarantee Cheque", period: "Guarantee Cheque Security", debit: "PDC In Hand", credit: "Refundable Security Deposit - Tenant (21100006)", amount: guaranteeChequeAmt, status: "posted" as const }] : []),
      ...(agencyAmt > 0 ? [{ id: `v${vouchers.length + 8}`, leaseId: lease.id, name: "Receipts Voucher - Agency Commission", receiptNo: `RV-${lease.id}-08`, method: "Cash", period: "One-time fee", debit: "Cash In Hand", credit: "Agency Commission Income", amount: agencyAmt, status: "posted" as const }] : []),
      ...(adminAmt > 0 ? [{ id: `v${vouchers.length + 9}`, leaseId: lease.id, name: "Receipts Voucher - Admin Charges", receiptNo: `RV-${lease.id}-09`, method: "Cash", period: "One-time fee", debit: "Cash In Hand", credit: "Admin Charges Income", amount: adminAmt, status: "posted" as const }] : []),
    ];
    setVouchers((items) => [...newVouchers, ...items]);

    // ── Post to Finance Store (Journal Ledger + Receipt Vouchers) ──
    // 1. PDC Rent Collection: DR PDC In Hand (12900) / CR Customer PDC Liability (21400)
    if (pdcTotal > 0) {
      addJournalEntry({
        je_no: jeNo,
        posting_date: today_str,
        reference: `RV-${lease.id}-01`,
        narration: `PDC Rent Collection — ${lease.tenantName} / ${lease.unit} (${nextPdcs.length} cheques)`,
        dr_account: "PDC In Hand",
        dr_code: "12900",
        cr_account: "Customer PDC Liability",
        cr_code: "21400",
        amount: pdcTotal,
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
      addFinanceVoucher({
        voucher_no: `VCH-REC-${lease.id.toUpperCase()}-RENT`,
        voucher_type: "Receipt Voucher",
        date: today_str,
        name: `Rent PDC Collection — ${lease.unit} (${nextPdcs.length} cheques)`,
        debit: "PDC In Hand",
        debit_code: "12900",
        credit: `Customer(PDC)-${lease.unit}`,
        credit_code: "21400",
        amount: pdcTotal,
        method: collectForm.paymentMode,
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
    }

    // 2. Type 1: Unit Security Deposit (GL 21500)
    if (depAmt > 0) {
      const depDrAccount = collectForm.depositMode === "Cash" ? "Cash In Hand" : collectForm.depositMode === "Bank Transfer" ? "Bank Operating Account" : "PDC In Hand";
      const depDrCode = collectForm.depositMode === "Cash" ? "12100" : collectForm.depositMode === "Bank Transfer" ? "12000" : "12900";
      addJournalEntry({
        je_no: `${jeNo}-DEP`,
        posting_date: today_str,
        reference: `RV-${lease.id}-02`,
        narration: `Unit Security Deposit (GL 21500) — ${lease.tenantName} / ${lease.unit} via ${collectForm.depositMode}`,
        dr_account: depDrAccount,
        dr_code: depDrCode,
        cr_account: "Security Deposit Liability",
        cr_code: "21500",
        amount: depAmt,
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
      addFinanceVoucher({
        voucher_no: `VCH-REC-${lease.id.toUpperCase()}-DEP`,
        voucher_type: "Receipt Voucher",
        date: today_str,
        name: `Unit Security Deposit — ${lease.unit} via ${collectForm.depositMode}`,
        debit: depDrAccount,
        debit_code: depDrCode,
        credit: "Security Deposit Liability",
        credit_code: "21500",
        amount: depAmt,
        method: collectForm.depositMode,
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
      if (collectForm.depositMode === "Cash") {
        addCashBookEntry({
          date: today_str,
          voucher: `RV-${lease.id}-02`,
          description: `Unit Security Deposit Cash — ${lease.tenantName} / ${lease.unit}`,
          type: "in",
          amount: depAmt,
        });
      }
    }

    // 3. Type 2: Ancillary Refundable Deposits & Guarantees (GL 21100)
    // 3a. Kahramaa Utility Deposit (GL 21100003 / 21600)
    if (utilityAmt > 0) {
      addJournalEntry({
        je_no: `${jeNo}-UTL`,
        posting_date: today_str,
        reference: `RV-${lease.id}-UTL`,
        narration: `Kahramaa Deposit (GL 21100) — ${lease.tenantName} / ${lease.unit}`,
        dr_account: "Cash In Hand",
        dr_code: "12100",
        cr_account: "Kahramaa Utility Deposit - Tenant",
        cr_code: "21100003",
        amount: utilityAmt,
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
      addFinanceVoucher({
        voucher_no: `VCH-REC-${lease.id.toUpperCase()}-UTL`,
        voucher_type: "Receipt Voucher",
        date: today_str,
        name: `Kahramaa Deposit (21100) — ${lease.unit}`,
        debit: "Cash In Hand",
        debit_code: "12100",
        credit: "Kahramaa Utility Deposit - Tenant",
        credit_code: "21100003",
        amount: utilityAmt,
        method: "Cash",
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
      addCashBookEntry({
        date: today_str,
        voucher: `RV-${lease.id}-UTL`,
        description: `Kahramaa Utility Deposit — ${lease.tenantName} / ${lease.unit}`,
        type: "in",
        amount: utilityAmt,
      });
    }

    // 3b. Qatar Cool Deposit (GL 21100004)
    if (qatarCoolAmt > 0) {
      addJournalEntry({
        je_no: `${jeNo}-QC`,
        posting_date: today_str,
        reference: `RV-${lease.id}-QC`,
        narration: `Qatar Cool Deposit (GL 21100) — ${lease.tenantName} / ${lease.unit}`,
        dr_account: "Cash In Hand",
        dr_code: "12100",
        cr_account: "Qatar Cool Deposit - Tenant",
        cr_code: "21100004",
        amount: qatarCoolAmt,
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
      addFinanceVoucher({
        voucher_no: `VCH-REC-${lease.id.toUpperCase()}-QC`,
        voucher_type: "Receipt Voucher",
        date: today_str,
        name: `Qatar Cool Deposit (21100) — ${lease.unit}`,
        debit: "Cash In Hand",
        debit_code: "12100",
        credit: "Qatar Cool Deposit - Tenant",
        credit_code: "21100004",
        amount: qatarCoolAmt,
        method: "Cash",
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
      addCashBookEntry({
        date: today_str,
        voucher: `RV-${lease.id}-QC`,
        description: `Qatar Cool Deposit Cash — ${lease.tenantName} / ${lease.unit}`,
        type: "in",
        amount: qatarCoolAmt,
      });
    }

    // 3c. Reservation Advance Deposit (GL 21100001)
    if (reservationAmt > 0) {
      addJournalEntry({
        je_no: `${jeNo}-RES`,
        posting_date: today_str,
        reference: `RV-${lease.id}-RES`,
        narration: `Reservation Advance Deposit (GL 21100) — ${lease.tenantName} / ${lease.unit}`,
        dr_account: "Cash In Hand",
        dr_code: "12100",
        cr_account: "Reservation Advance - Tenant",
        cr_code: "21100001",
        amount: reservationAmt,
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
      addFinanceVoucher({
        voucher_no: `VCH-REC-${lease.id.toUpperCase()}-RES`,
        voucher_type: "Receipt Voucher",
        date: today_str,
        name: `Reservation Advance Deposit (21100) — ${lease.unit}`,
        debit: "Cash In Hand",
        debit_code: "12100",
        credit: "Reservation Advance - Tenant",
        credit_code: "21100001",
        amount: reservationAmt,
        method: "Cash",
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
      addCashBookEntry({
        date: today_str,
        voucher: `RV-${lease.id}-RES`,
        description: `Reservation Advance Deposit Cash — ${lease.tenantName} / ${lease.unit}`,
        type: "in",
        amount: reservationAmt,
      });
    }

    // 3d. Service Fee / Key Deposit (GL 21100005)
    if (serviceFeeAmt > 0) {
      addJournalEntry({
        je_no: `${jeNo}-SVC`,
        posting_date: today_str,
        reference: `RV-${lease.id}-SVC`,
        narration: `Service Fee Deposit (GL 21100) — ${lease.tenantName} / ${lease.unit}`,
        dr_account: "Cash In Hand",
        dr_code: "12100",
        cr_account: "Service Fee Deposit - Tenant",
        cr_code: "21100005",
        amount: serviceFeeAmt,
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
      addFinanceVoucher({
        voucher_no: `VCH-REC-${lease.id.toUpperCase()}-SVC`,
        voucher_type: "Receipt Voucher",
        date: today_str,
        name: `Service Fee Deposit (21100) — ${lease.unit}`,
        debit: "Cash In Hand",
        debit_code: "12100",
        credit: "Service Fee Deposit - Tenant",
        credit_code: "21100005",
        amount: serviceFeeAmt,
        method: "Cash",
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
      addCashBookEntry({
        date: today_str,
        voucher: `RV-${lease.id}-SVC`,
        description: `Service Fee Deposit Cash — ${lease.tenantName} / ${lease.unit}`,
        type: "in",
        amount: serviceFeeAmt,
      });
    }

    // 3e. Guarantee Cheque Security (GL 21100006)
    if (guaranteeChequeAmt > 0) {
      addJournalEntry({
        je_no: `${jeNo}-GCHQ`,
        posting_date: today_str,
        reference: `RV-${lease.id}-GCHQ`,
        narration: `Guarantee Cheque Security Deposit (GL 21100) — ${lease.tenantName} / ${lease.unit} (${collectForm.guaranteeChequeNo || "CHQ-GNT"})`,
        dr_account: "PDC In Hand",
        dr_code: "12900",
        cr_account: "Guarantee Cheque Liability",
        cr_code: "21100006",
        amount: guaranteeChequeAmt,
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
      addFinanceVoucher({
        voucher_no: `VCH-REC-${lease.id.toUpperCase()}-GCHQ`,
        voucher_type: "Receipt Voucher",
        date: today_str,
        name: `Guarantee Cheque Security (21100) — ${lease.unit}`,
        debit: "PDC In Hand",
        debit_code: "12900",
        credit: "Guarantee Cheque Liability",
        credit_code: "21100006",
        amount: guaranteeChequeAmt,
        method: "Guarantee Cheque",
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
    }

    // 4. One-Time Non-Refundable Revenues
    if (agencyAmt > 0) {
      addFinanceVoucher({
        voucher_no: `VCH-REC-${lease.id.toUpperCase()}-AGN`,
        voucher_type: "Receipt Voucher",
        date: today_str,
        name: `Agency Commission — ${lease.unit}`,
        debit: "Cash In Hand",
        debit_code: "12100",
        credit: "Agency Commission Income",
        credit_code: "41201",
        amount: agencyAmt,
        method: "Cash",
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
    }

    if (adminAmt > 0) {
      addFinanceVoucher({
        voucher_no: `VCH-REC-${lease.id.toUpperCase()}-ADM`,
        voucher_type: "Receipt Voucher",
        date: today_str,
        name: `Admin Charges — ${lease.unit}`,
        debit: "Cash In Hand",
        debit_code: "12100",
        credit: "Admin Charges Income",
        credit_code: "41201",
        amount: adminAmt,
        method: "Cash",
        property_name: lease.property,
        unit_ref: lease.unit,
        tenant_name: lease.tenantName,
      });
    }

    advanceLease(lease, "collection_completed", {
      collectionCompleted: true,
      pdcCount: nextPdcs.length,
      startDate: collectForm.startDate || lease.startDate,
      endDate: collectForm.endDate || lease.endDate,
    });

    recordAudit({
      stage: "Collection & Receipt Generation",
      owner: `Finance Cashier${collectForm.cashierName ? " – " + collectForm.cashierName : ""}`,
      input: `${nextPdcs.length} PDCs (${collectForm.chequeBank}), unit deposit ${collectForm.depositMode} QR ${depAmt.toLocaleString()}${utilityAmt > 0 ? ", Kahramaa " + formatMoney(utilityAmt) : ""}${qatarCoolAmt > 0 ? ", Qatar Cool " + formatMoney(qatarCoolAmt) : ""}${reservationAmt > 0 ? ", Reservation " + formatMoney(reservationAmt) : ""}${serviceFeeAmt > 0 ? ", Service Fee " + formatMoney(serviceFeeAmt) : ""}${guaranteeChequeAmt > 0 ? ", Guarantee Cheque " + formatMoney(guaranteeChequeAmt) : ""}`,
      approval: "Cashier receipt posting",
      status: "collection_completed",
      output: (collectForm.notes || "Rent, security deposits (Type 1 GL 21500 & Type 2 GL 21100), and fee collection receipts generated") + (collectForm.receiptFile ? ` (Proof: ${collectForm.receiptFile})` : ""),
    });

    // Auto-generate official printable receipt
    const totalCollectedAmt = pdcTotal + depAmt + utilityAmt + qatarCoolAmt + reservationAmt + serviceFeeAmt + guaranteeChequeAmt + agencyAmt + adminAmt;
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
      notes: collectForm.notes || "Official receipt acknowledged for rent cheques, Unit Security Deposit (GL 21500), Ancillary Refundable Deposits (GL 21100), and applicable fees.",
    };

    setReceiptModalData(generatedReceipt);
    setReceiptModalSecondaryData(null);
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
      status: "posted",
    };

    // 1. Update shared in-memory context so all UI modules reflect it immediately
    setVouchers((items) => [newVoucher, ...items]);

    // 2. If PDC method and user wants to create PDC entry, register it in PDC register
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

    // 3. Mirror into FinanceStore Sub-Ledger & General Ledger (addFinanceVoucher posts directly to GL)
    addFinanceVoucher({
      voucher_no: vchNo,
      voucher_type: name.includes("Deposit") ? "Receipt Voucher" : name.includes("Payment") ? "Payment Voucher" : "Receipt Voucher",
      date: today.toISOString().split("T")[0],
      name: `${name} — ${lease?.tenantName || "Tenant"} (${unitCode})`,
      debit: accounts.debit,
      debit_code: accounts.debit.includes("Cash") ? "12100" : accounts.debit.includes("PDC") ? "12900" : "12000",
      credit: accounts.credit,
      credit_code: accounts.credit.includes("Security") ? "21500" : accounts.credit.includes("PDC") ? "21400" : "41100",
      amount: numAmount,
      method: method,
      property: lease?.property || "Old Salata - Residence No:23",
      unit: unitCode,
      tenant: lease?.tenantName || "Tenant",
    } as any);

    // 4. Post through the central Accounting Event -> Atomic Posting Engine
    try {
      const accountCode = (label: string) => {
        if (label.includes("Cash In Hand")) return "12100";
        if (label.includes("Bank Account")) return "12000";
        if (label.includes("PDC In Hand")) return "12900";
        if (label.includes("Security Deposit Liability")) return "21500";
        if (label.includes("Customer(PDC)")) return "21400";
        if (label.includes("Receivable")) return "12413";
        if (label.includes("Rental Income")) return "41100";
        if (label.includes("Payable")) return "21000";
        return "12000";
      };

      await postVoucher({
        voucher_date: today.toISOString().split("T")[0],
        voucher_type: name.includes("Deposit") ? "Deposit" : name.includes("Payment") ? "Payment" : "Receipt",
        reference_no: vchNo,
        source_type: "LEASING_VOUCHER",
        description: `${name} | ${period || "Lease Voucher"} | ${accounts.debit} -> ${accounts.credit}`,
        lines: [
          { account_code: accountCode(accounts.debit), debit: numAmount, credit: 0, description: accounts.debit },
          { account_code: accountCode(accounts.credit), debit: 0, credit: numAmount, description: accounts.credit },
        ],
      });
    } catch (e) {
      console.warn("Central finance posting notice:", e);
    }

    recordAudit({
      stage: "Voucher Created",
      owner: "Finance Department",
      input: `${name} — ${method} — ${period || "-"}`,
      approval: "Manual entry",
      status: "posted",
      output: `Voucher ${newVoucher.receiptNo} created and posted to Finance for ${formatMoney(numAmount)}. ${(method === "PDC" || method === "Guarantee Cheque") && createPdc && pdcChequeNo ? `PDC ${pdcChequeNo} also registered.` : ""}`,
    });

    // 5. Generate Official Tenant Receipt Modal
    const isSecurity = name.includes("Security Deposit") || name.includes("Deposit");
    const receiptData: TenantReceiptDetails = {
      receiptNo: vchNo,
      acknowledgementNo: `ACK-${vchNo}`,
      date: today.toISOString().split("T")[0],
      tenantName: lease?.tenantName || "Valued Tenant",
      tenantPhone: "",
      tenantEmail: "",
      tenantQid: "",
      propertyName: lease?.property || "Old Salata - Residence No:23",
      unitRef: unitCode,
      leaseNo: lease ? `LES-${lease.id.toUpperCase()}` : `LES-GEN`,
      leaseStartDate: lease?.startDate || today.toISOString().split("T")[0],
      leaseEndDate: lease?.endDate || today.toISOString().split("T")[0],
      monthlyRent: lease?.monthlyRent || numAmount,
      totalContractRent: lease ? lease.monthlyRent * (lease.pdcCount || 12) : numAmount,
      depositAmount: isSecurity ? numAmount : (lease?.securityDeposit || 0),
      depositMode: method,
      pdcCount: (method === "PDC" && createPdc) ? 1 : 0,
      pdcs: (method === "PDC" && createPdc && pdcChequeNo) ? [{
        chequeNo: pdcChequeNo,
        bank: pdcBank || "Tenant Bank",
        date: pdcDate,
        amount: numAmount,
        period: period || "Rent"
      }] : [],
      vouchers: [{
        receiptNo: vchNo,
        name: name,
        amount: numAmount,
        method: method,
        debit: accounts.debit,
        credit: accounts.credit
      }],
      totalCollected: numAmount,
      cashierName: "Finance Department",
      notes: `Official receipt for ${name} (${method}). Posted to Finance General Ledger.`,
    };

    setReceiptModalData(receiptData);
    setReceiptModalOpen(true);

    setAddVoucherOpen(false);
    setAddVoucherForm({ leaseId: "", name: "Receipts Voucher - Rent", receiptNo: "", method: "PDC", period: "", debit: "PDC In Hand", credit: "Rental Income", amount: "", createPdc: true, pdcChequeNo: "", pdcBank: "", pdcDate: today.toISOString().split("T")[0] });
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

  function openSettleRefundModal(settlement: Settlement) {
    setSelectedSettlement(settlement);
    const deductions = (settlement.outstandingRent || 0) + (settlement.damages || 0) + (settlement.utilityCharges || 0)
      + (settlement.cleaningCharges || 0) + (settlement.restorationCharges || 0) + (settlement.otherDeductions || 0);
    const initialMode = (settlement.settlementMode || "DEDUCT_FROM_DEPOSIT") as "DEDUCT_FROM_DEPOSIT" | "PAY_SEPARATELY";
    const calcRefund = initialMode === "PAY_SEPARATELY" 
      ? settlement.depositReceived 
      : Math.max(0, settlement.depositReceived - deductions);
    setSettleRefundForm({
      damages: String(settlement.damages || 0),
      outstandingRent: String(settlement.outstandingRent || 0),
      utilityCharges: String(settlement.utilityCharges || 0),
      cleaningCharges: String(settlement.cleaningCharges || 0),
      restorationCharges: String(settlement.restorationCharges || 0),
      otherDeductions: String(settlement.otherDeductions || 0),
      refundAmount: String(calcRefund),
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
    });
    setSettleRefundStep(1);
    setSettleRefundOpen(true);
  }

  function executeSettleAndRefund() {
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

    const customRefund = parseFloat(settleRefundForm.refundAmount);
    const refundable = !isNaN(customRefund) ? customRefund : (mode === "PAY_SEPARATELY" ? grossDeposit : Math.max(0, grossDeposit - totalDeductions));

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
        approval: "paid",
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

    // ─────────────────────────────────────────────────────────────────────
    // SCENARIO 1 — PAY_SEPARATELY: Customer pays damages out-of-pocket
    //   Step 1: Damage recognized → DR 12413 Tenant AR / CR 41400 Recovery
    //   Step 2: Customer pays AR → DR Bank/Cash/Cheque/BG / CR 12413 Tenant AR
    //   Step 3: Deposit liability released → DR 21500 / CR 12000/12100 (full)
    // ─────────────────────────────────────────────────────────────────────
    if (mode === "PAY_SEPARATELY") {
      // Step 1: Recognize each damage charge into Tenant AR
      if (damages > 0) {
        addJournalEntry({
          je_no: `${jvNo}-A1`, posting_date: settlementDate,
          reference: `Damage charge: ${tenantName}`,
          narration: `Damage / repair charge recognized as Tenant AR — ${unitRef}${settleRefundForm.damageRemarks ? ` | ${settleRefundForm.damageRemarks}` : ''}`,
          dr_account: "Tenant Receivables", dr_code: "12413",
          cr_account: "Repairs & Maintenance Recovery", cr_code: "41400",
          amount: damages, property_name: propName, unit_ref: unitRef, tenant_name: tenantName,
        });
      }
      if (outstandingRent > 0) {
        addJournalEntry({
          je_no: `${jvNo}-A2`, posting_date: settlementDate,
          reference: `Outstanding rent: ${tenantName}`,
          narration: `Outstanding rent recognized as Tenant AR — ${unitRef}`,
          dr_account: "Tenant Receivables", dr_code: "12413",
          cr_account: "Rental Revenue / Income", cr_code: "41100",
          amount: outstandingRent, property_name: propName, unit_ref: unitRef, tenant_name: tenantName,
        });
      }
      if (utilityCharges > 0) {
        addJournalEntry({
          je_no: `${jvNo}-A3`, posting_date: settlementDate,
          reference: `Utility charges: ${tenantName}`,
          narration: `Final Kahramaa / utility charges recognized as Tenant AR — ${unitRef}`,
          dr_account: "Tenant Receivables", dr_code: "12413",
          cr_account: "CAM & Maintenance Recovery", cr_code: "41400",
          amount: utilityCharges, property_name: propName, unit_ref: unitRef, tenant_name: tenantName,
        });
      }
      const otherTotal = cleaningCharges + restorationCharges + otherDeductions;
      if (otherTotal > 0) {
        addJournalEntry({
          je_no: `${jvNo}-A4`, posting_date: settlementDate,
          reference: `Other charges: ${tenantName}`,
          narration: `Cleaning / restoration / admin charges recognized as Tenant AR — ${unitRef}`,
          dr_account: "Tenant Receivables", dr_code: "12413",
          cr_account: "CAM & Maintenance Recovery", cr_code: "41400",
          amount: otherTotal, property_name: propName, unit_ref: unitRef, tenant_name: tenantName,
        });
      }

      // Step 2 & 3: Damage collection and Deposit refund are handled via Receipt Voucher & Payment Voucher (addFinanceVoucher) below to prevent duplicate GL postings.
      if (totalDeductions > 0) {
        // Add Receipt Voucher for the tenant's damage payment
        addFinanceVoucher({
          voucher_no: rvDmgNo,
          voucher_type: "Receipt Voucher",
          date: settleRefundForm.paymentDate || settlementDate,
          name: `Tenant Damage Charges Settlement Collection (${dmgPayMode}) — ${tenantName}${settleRefundForm.paymentRefNo ? ` (Ref: ${settleRefundForm.paymentRefNo})` : ''}`,
          debit: dmgDrAccount,
          debit_code: dmgDrCode,
          credit: "Tenant Receivables",
          credit_code: "12413",
          amount: totalDeductions,
          method: dmgPayMode,
          property_name: propName,
          unit_ref: unitRef,
          tenant_name: tenantName,
        } as any);
      }
    }
    // ─────────────────────────────────────────────────────────────────────
    // SCENARIO 2 — DEDUCT_FROM_DEPOSIT: Damages deducted from security deposit
    //   Step 1: Damage recognized → DR 12413 Tenant AR / CR 41400 Recovery
    //   Step 2: Deposit deduction → DR 21500 / CR 12413 Tenant AR (min(deposit, damage))
    //   Step 3: Remaining deposit refund → DR 21500 / CR 12000/12100
    // ─────────────────────────────────────────────────────────────────────
    else {
      // Step 1: Recognize each damage charge into Tenant AR
      if (damages > 0) {
        addJournalEntry({
          je_no: `${jvNo}-A1`, posting_date: settlementDate,
          reference: `Damage charge: ${tenantName}`,
          narration: `Damage / repair charge recognized as Tenant AR — ${unitRef}${settleRefundForm.damageRemarks ? ` | ${settleRefundForm.damageRemarks}` : ''}`,
          dr_account: "Tenant Receivables", dr_code: "12413",
          cr_account: "Repairs & Maintenance Recovery", cr_code: "41400",
          amount: damages, property_name: propName, unit_ref: unitRef, tenant_name: tenantName,
        });
      }
      if (outstandingRent > 0) {
        addJournalEntry({
          je_no: `${jvNo}-A2`, posting_date: settlementDate,
          reference: `Outstanding rent: ${tenantName}`,
          narration: `Outstanding rent recognized as Tenant AR — ${unitRef}`,
          dr_account: "Tenant Receivables", dr_code: "12413",
          cr_account: "Rental Revenue / Income", cr_code: "41100",
          amount: outstandingRent, property_name: propName, unit_ref: unitRef, tenant_name: tenantName,
        });
      }
      if (utilityCharges > 0) {
        addJournalEntry({
          je_no: `${jvNo}-A3`, posting_date: settlementDate,
          reference: `Utility charges: ${tenantName}`,
          narration: `Final Kahramaa / utility charges recognized as Tenant AR — ${unitRef}`,
          dr_account: "Tenant Receivables", dr_code: "12413",
          cr_account: "CAM & Maintenance Recovery", cr_code: "41400",
          amount: utilityCharges, property_name: propName, unit_ref: unitRef, tenant_name: tenantName,
        });
      }
      const otherTotal = cleaningCharges + restorationCharges + otherDeductions;
      if (otherTotal > 0) {
        addJournalEntry({
          je_no: `${jvNo}-A4`, posting_date: settlementDate,
          reference: `Other charges: ${tenantName}`,
          narration: `Cleaning / restoration / admin charges recognized as Tenant AR — ${unitRef}`,
          dr_account: "Tenant Receivables", dr_code: "12413",
          cr_account: "CAM & Maintenance Recovery", cr_code: "41400",
          amount: otherTotal, property_name: propName, unit_ref: unitRef, tenant_name: tenantName,
        });
      }

      // Step 2: Deposit deduction — capped at deposit balance (never negative)
      const depositDeduction = Math.min(grossDeposit, totalDeductions);
      const remainingAR = Math.max(0, totalDeductions - grossDeposit);
      if (depositDeduction > 0) {
        addJournalEntry({
          je_no: `${jvNo}-B`, posting_date: settlementDate,
          reference: `Deposit deduction: ${tenantName}`,
          narration: `Security deposit applied against approved damages/charges (AR settled) — ${unitRef}`,
          dr_account: "Security Deposit Liability", dr_code: "21500",
          cr_account: "Tenant Receivables", cr_code: "12413",
          amount: depositDeduction, property_name: propName, unit_ref: unitRef, tenant_name: tenantName,
        });
      }

      if (remainingAR > 0) {
        toast.warning(`⚠ Damage (QR ${totalDeductions.toLocaleString()}) exceeds deposit (QR ${grossDeposit.toLocaleString()}). Residual AR of QR ${remainingAR.toLocaleString()} remains outstanding.`);
      }

      // Step 3: Refund remaining deposit balance (if any) is handled exclusively via Payment Voucher (addFinanceVoucher) below to prevent duplicate GL postings.
    }

    // ─────────────────────────────────────────────────────────────────────
    // Common: Post finance voucher (PV) for the actual cash/bank refund paid
    // ─────────────────────────────────────────────────────────────────────
    if (refundable > 0) {
      addFinanceVoucher({
        voucher_no: pvNo,
        voucher_type: "Payment Voucher",
        date: settlementDate,
        name: `Tenant Security Deposit Refund — ${tenantName}`,
        debit: "Security Deposit Liability",
        debit_code: "21500",
        credit: bankCrName,
        credit_code: bankCrCode,
        amount: refundable,
        method: settleRefundForm.paymentMethod,
        property_name: propName,
        unit_ref: unitRef,
        tenant_name: tenantName,
      } as any);
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

    // ─────────────────────────────────────────────────────────────────────
    // Post sub-ledger voucher entries (local state for vouchers tab)
    // ─────────────────────────────────────────────────────────────────────
    setVouchers((items) => [
      ...(mode === "PAY_SEPARATELY" && totalDeductions > 0 ? [{ id: `v${items.length + 1}`, leaseId: settlement.leaseId, name: `Receipt Voucher — Tenant Damages Paid (${dmgPayMode}${settleRefundForm.paymentRefNo ? ` • Ref: ${settleRefundForm.paymentRefNo}` : ''})`, receiptNo: rvDmgNo, method: dmgPayMode, period: "Damage settlement", debit: dmgDrAccount, credit: "Tenant Receivables (12413)", amount: totalDeductions, status: "posted" as const }] : []),
      { id: `v${items.length + 2}`, leaseId: settlement.leaseId, name: "Settlement — Security Deposit Liability Released", receiptNo: jvNo, method: "Journal", period: "Final checkout", debit: "Security Deposit Liability (21500)", credit: bankCrName, amount: refundable > 0 ? refundable : grossDeposit, status: "posted" as const },
      ...(refundable > 0 ? [{ id: `v${items.length + 3}`, leaseId: settlement.leaseId, name: "Payment Voucher — Tenant Security Refund", receiptNo: pvNo, method: settleRefundForm.paymentMethod, period: "Refund", debit: bankCrName, credit: "Refund Payable (21300)", amount: refundable, status: "posted" as const }] : []),
      ...(mode === "DEDUCT_FROM_DEPOSIT" && totalDeductions > 0 ? [{ id: `v${items.length + 4}`, leaseId: settlement.leaseId, name: "Deductions — Deducted from Security Deposit", receiptNo: `${jvNo}-D`, method: "Journal", period: "Deductions", debit: "Security Deposit Liability (21500)", credit: "Tenant Receivables (12413)", amount: Math.min(grossDeposit, totalDeductions), status: "posted" as const }] : []),
      ...items,
    ]);

    const earlyVacateDate = checkout?.moveOutDate || lease?.plannedVacateDate;
    const isEarlyVacate = Boolean(
      lease &&
      earlyVacateDate &&
      new Date(earlyVacateDate).getTime() < new Date(lease.endDate).getTime(),
    );
    const pdcRelease = lease && isEarlyVacate && earlyVacateDate
      ? releaseFuturePdcExposure(lease, earlyVacateDate)
      : { returnedCount: 0, returnedAmount: 0 };

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
          { receiptNo: pvNo, name: `Security Deposit Refund Paid (${settleRefundForm.paymentMethod})`, amount: refundable > 0 ? refundable : grossDeposit, method: settleRefundForm.paymentMethod, debit: bankCrName, credit: "Refund Payable (21300)" },
        ],
        agencyCommission: 0,
        adminCharges: 0,
        utilityDeposit: 0,
        totalCollected: refundable > 0 ? refundable : grossDeposit,
        cashierName: "Finance Department",
        notes: `Full Security Deposit Liability Refund (Damages settled separately via ${dmgPayMode}) | Gross Deposit: QR ${grossDeposit.toLocaleString()} | Refund Paid: QR ${(refundable > 0 ? refundable : grossDeposit).toLocaleString()} via ${settleRefundForm.paymentMethod}${settleRefundForm.notes ? ` | Remarks: ${settleRefundForm.notes}` : ''}`,
      };
    } else {
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
          { receiptNo: jvNo, name: `Security Deposit Released (21500 → ${bankCrCode})`, amount: refundable > 0 ? refundable : grossDeposit, method: "Journal", debit: "Security Deposit Liability (21500)", credit: bankCrName },
          ...(refundable > 0 ? [{ receiptNo: pvNo, name: `Security Deposit Refund Paid (${settleRefundForm.paymentMethod})`, amount: refundable, method: settleRefundForm.paymentMethod, debit: bankCrName, credit: "Refund Payable (21300)" }] : []),
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
        cashierName: "Finance Department",
        notes: `Settlement Mode: Deductions from Deposit | Gross Deposit: QR ${grossDeposit.toLocaleString()} | Total Deductions: QR ${totalDeductions.toLocaleString()} | Net Refund Paid: QR ${refundable.toLocaleString()} | Refund Channel: ${settleRefundForm.paymentMethod}${settleRefundForm.damageRemarks ? ` | Damage Agreement: ${settleRefundForm.damageRemarks}` : ''}${settleRefundForm.notes ? ` | Remarks: ${settleRefundForm.notes}` : ''}`,
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
    const _totalDeductions = _outstandingRent + _damages + _utility + _cleaning + _restoration + _other;
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
        refundableBalance: Math.max(0, lease.securityDeposit - _totalDeductions),
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Reservation</DialogTitle>
            <DialogDescription>Select a property, then a unit to reserve.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Field label="Property">
              <SearchableSelect
                value={reservationForm.property}
                onValueChange={(property) => setReservationForm((form) => ({ ...form, property, unit: "" }))}
                placeholder="Select Property"
                emptyText="No property found."
                options={Array.from(new Set((realUnits.length > 0 ? realUnits : units).map(u => u.property))).map(prop => ({ label: prop, value: prop }))}
              />
            </Field>
            <Field label="Unit">
              <SearchableSelect
                value={reservationForm.unit}
                onValueChange={(unit) => setReservationForm((form) => ({ ...form, unit }))}
                disabled={!reservationForm.property}
                placeholder="Select Unit"
                emptyText="No available unit found for this property."
                options={(realUnits.length > 0 ? realUnits : units)
                  .filter(u => {
                    if (u.property !== reservationForm.property) return false;
                    // Check if unit is occupied/leased in unit status
                    if (u.status && u.status.toLowerCase() !== "available") return false;
                    // Check if unit is currently reserved (active reservation)
                    const isReserved = reservations.some(
                      r => r.property === u.property && r.unit === u.unit && (r.status === "reserved" || r.status === "converted")
                    );
                    if (isReserved) return false;
                    // Check if unit has an active lease
                    const isLeased = leases.some(
                      l => l.property === u.property && l.unit === u.unit && (l.status === "active" || l.status === "fully_signed" || l.status === "collection_completed")
                    );
                    if (isLeased) return false;
                    return true;
                  })
                  .map((unit) => ({ label: `${unit.unit} - Available`, value: unit.unit }))}
              />
            </Field>
            <Field label="Prospective tenant">
              <SearchableSelect
                value={reservationForm.tenantName}
                onValueChange={(tenantName) => setReservationForm((form) => ({ ...form, tenantName }))}
                placeholder="Select Customer"
                emptyText="No customer found."
                options={customers.map((c) => ({ label: c.name, value: c.name }))}
              />
            </Field>
            <Field label="Expected Lease start"><Input type="date" value={reservationForm.startDate} onChange={(event) => setReservationForm((form) => ({ ...form, startDate: event.target.value }))} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Validity days"><Input type="number" value={reservationForm.validityDays} onChange={(event) => setReservationForm((form) => ({ ...form, validityDays: event.target.value }))} /></Field>
              <Field label="Rent"><Input type="number" value={reservationForm.rent} onChange={(event) => setReservationForm((form) => ({ ...form, rent: event.target.value }))} /></Field>
            </div>
            <Field label="Remarks"><Textarea value={reservationForm.remarks} onChange={(event) => setReservationForm((form) => ({ ...form, remarks: event.target.value }))} /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateReservationOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              await withBusy("reserve", createReservation);
              setCreateReservationOpen(false);
            }}>
              {busyAction === "reserve" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              Reserve Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={createCustomerOpen} onOpenChange={setCreateCustomerOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
            <DialogDescription>Create a new customer profile.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <Field label="Name"><Input value={customerForm.name} onChange={(event) => setCustomerForm((form) => ({ ...form, name: event.target.value }))} /></Field>
            <Field label="Type">
              <Select value={customerForm.type} onValueChange={(type: Customer["type"]) => setCustomerForm((form) => ({ ...form, type }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="individual">Individual</SelectItem><SelectItem value="company">Company</SelectItem></SelectContent>
              </Select>
            </Field>
            {customerForm.type === "individual" ? (
              <>
                <Field label="Qatar ID"><Input value={customerForm.qatarId} onChange={(event) => setCustomerForm((form) => ({ ...form, qatarId: event.target.value }))} /></Field>
                <Field label="Passport"><Input value={customerForm.passport} onChange={(event) => setCustomerForm((form) => ({ ...form, passport: event.target.value }))} /></Field>
                <Field label="Nationality"><Input value={customerForm.nationality} onChange={(event) => setCustomerForm((form) => ({ ...form, nationality: event.target.value }))} /></Field>
                <Field label="Emergency Contact"><Input value={customerForm.emergencyContact} onChange={(event) => setCustomerForm((form) => ({ ...form, emergencyContact: event.target.value }))} /></Field>
                <Field label="Employer / Profession"><Input value={customerForm.employerInfo} onChange={(event) => setCustomerForm((form) => ({ ...form, employerInfo: event.target.value }))} /></Field>
              </>
            ) : (
              <>
                <Field label="Commercial Registration"><Input value={customerForm.crNumber} onChange={(event) => setCustomerForm((form) => ({ ...form, crNumber: event.target.value }))} /></Field>
                <Field label="Authorized Signatory"><Input value={customerForm.authorizedSignatory} onChange={(event) => setCustomerForm((form) => ({ ...form, authorizedSignatory: event.target.value }))} /></Field>
                <Field label="Emergency Contact"><Input value={customerForm.emergencyContact} onChange={(event) => setCustomerForm((form) => ({ ...form, emergencyContact: event.target.value }))} /></Field>
                <Field label="Company / Operational Contact"><Input value={customerForm.employerInfo} onChange={(event) => setCustomerForm((form) => ({ ...form, employerInfo: event.target.value }))} /></Field>
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Mobile"><Input value={customerForm.mobile} onChange={(event) => setCustomerForm((form) => ({ ...form, mobile: event.target.value }))} /></Field>
              <Field label="Email"><Input value={customerForm.email} onChange={(event) => setCustomerForm((form) => ({ ...form, email: event.target.value }))} /></Field>
            </div>
            <Field label="Permanent Address"><Textarea value={customerForm.permanentAddress} onChange={(event) => setCustomerForm((form) => ({ ...form, permanentAddress: event.target.value }))} /></Field>
            <Field label="Local Address"><Textarea value={customerForm.localAddress} onChange={(event) => setCustomerForm((form) => ({ ...form, localAddress: event.target.value }))} /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateCustomerOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              await withBusy("customer", createCustomer);
              setCreateCustomerOpen(false);
            }}>
              {busyAction === "customer" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Save Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── VIEW CUSTOMER DIALOG ──────────────────────────────────── */}
      <Dialog open={viewCustomerOpen} onOpenChange={setViewCustomerOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Customer Profile
            </DialogTitle>
            <DialogDescription>Full registered details for {viewCustomerData?.name}</DialogDescription>
          </DialogHeader>
          {viewCustomerData && (
            <div className="space-y-4 py-3 text-sm">
              <div className="grid grid-cols-2 gap-3 bg-muted/20 p-3 rounded-lg border">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">Name</div>
                  <div className="font-bold text-foreground">{viewCustomerData.name}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">Type</div>
                  <div className="font-medium capitalize">{viewCustomerData.type}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">Primary ID</div>
                  <div className="font-mono font-medium">{viewCustomerData.qatarId || viewCustomerData.passport || viewCustomerData.crNumber || "—"}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-muted-foreground">Status</div>
                  <div><StatusBadge value={viewCustomerData.status} /></div>
                </div>
              </div>
              <div className="space-y-2 border rounded-lg p-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase">Contact Information</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><strong>Mobile:</strong> {viewCustomerData.mobile || "—"}</div>
                  <div><strong>Email:</strong> {viewCustomerData.email || "—"}</div>
                  <div><strong>Nationality:</strong> {viewCustomerData.nationality || "—"}</div>
                  <div><strong>Emergency:</strong> {viewCustomerData.emergencyContact || "—"}</div>
                </div>
                {viewCustomerData.employerInfo && (
                  <div className="text-xs pt-1"><strong>Employer / Info:</strong> {viewCustomerData.employerInfo}</div>
                )}
                {viewCustomerData.permanentAddress && (
                  <div className="text-xs pt-1"><strong>Permanent Address:</strong> {viewCustomerData.permanentAddress}</div>
                )}
                {viewCustomerData.localAddress && (
                  <div className="text-xs pt-1"><strong>Local Address:</strong> {viewCustomerData.localAddress}</div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewCustomerOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── EDIT CUSTOMER DIALOG ──────────────────────────────────── */}
      <Dialog open={editCustomerOpen} onOpenChange={setEditCustomerOpen}>
        <DialogContent className="sm:max-w-[480px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>Update customer profile details for {editCustomerData?.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <Field label="Name"><Input value={customerForm.name} onChange={(event) => setCustomerForm((form) => ({ ...form, name: event.target.value }))} /></Field>
            <Field label="Type">
              <Select value={customerForm.type} onValueChange={(type: Customer["type"]) => setCustomerForm((form) => ({ ...form, type }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="individual">Individual</SelectItem><SelectItem value="company">Company</SelectItem></SelectContent>
              </Select>
            </Field>
            {customerForm.type === "individual" ? (
              <>
                <Field label="Qatar ID"><Input value={customerForm.qatarId} onChange={(event) => setCustomerForm((form) => ({ ...form, qatarId: event.target.value }))} /></Field>
                <Field label="Passport"><Input value={customerForm.passport} onChange={(event) => setCustomerForm((form) => ({ ...form, passport: event.target.value }))} /></Field>
                <Field label="Nationality"><Input value={customerForm.nationality} onChange={(event) => setCustomerForm((form) => ({ ...form, nationality: event.target.value }))} /></Field>
                <Field label="Emergency Contact"><Input value={customerForm.emergencyContact} onChange={(event) => setCustomerForm((form) => ({ ...form, emergencyContact: event.target.value }))} /></Field>
                <Field label="Employer / Profession"><Input value={customerForm.employerInfo} onChange={(event) => setCustomerForm((form) => ({ ...form, employerInfo: event.target.value }))} /></Field>
              </>
            ) : (
              <>
                <Field label="Commercial Registration"><Input value={customerForm.crNumber} onChange={(event) => setCustomerForm((form) => ({ ...form, crNumber: event.target.value }))} /></Field>
                <Field label="Authorized Signatory"><Input value={customerForm.authorizedSignatory} onChange={(event) => setCustomerForm((form) => ({ ...form, authorizedSignatory: event.target.value }))} /></Field>
                <Field label="Emergency Contact"><Input value={customerForm.emergencyContact} onChange={(event) => setCustomerForm((form) => ({ ...form, emergencyContact: event.target.value }))} /></Field>
                <Field label="Company / Operational Contact"><Input value={customerForm.employerInfo} onChange={(event) => setCustomerForm((form) => ({ ...form, employerInfo: event.target.value }))} /></Field>
              </>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Mobile"><Input value={customerForm.mobile} onChange={(event) => setCustomerForm((form) => ({ ...form, mobile: event.target.value }))} /></Field>
              <Field label="Email"><Input value={customerForm.email} onChange={(event) => setCustomerForm((form) => ({ ...form, email: event.target.value }))} /></Field>
            </div>
            <Field label="Permanent Address"><Textarea value={customerForm.permanentAddress} onChange={(event) => setCustomerForm((form) => ({ ...form, permanentAddress: event.target.value }))} /></Field>
            <Field label="Local Address"><Textarea value={customerForm.localAddress} onChange={(event) => setCustomerForm((form) => ({ ...form, localAddress: event.target.value }))} /></Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCustomerOpen(false)}>Cancel</Button>
            <Button onClick={() => {
              if (editCustomerData) {
                setCustomers(prev => prev.map(c => c.id === editCustomerData.id ? { ...c, ...customerForm } : c));
                toast.success("Customer profile updated successfully.");
                setEditCustomerOpen(false);
              }
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={createLeaseOpen} onOpenChange={setCreateLeaseOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-primary" /> Create Lease Agreement
            </DialogTitle>
            <DialogDescription>
              {selectedReservationForLease && (
                <span>Reservation: <strong>{selectedReservationForLease.unit}</strong> · Tenant: <strong>{selectedReservationForLease.tenantName}</strong></span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Lease Period */}
            <section>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b pb-1">Lease Period</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Lease Start Date *">
                  <Input type="date" value={createLeaseForm.startDate} onChange={e => setCreateLeaseForm(f => ({ ...f, startDate: e.target.value }))} />
                </Field>
                <Field label="Lease End Date *">
                  <Input type="date" value={createLeaseForm.endDate} onChange={e => setCreateLeaseForm(f => ({ ...f, endDate: e.target.value }))} />
                </Field>
              </div>
            </section>

            {/* Financial Terms */}
            <section>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b pb-1">Financial Terms</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Monthly Rent (QR) *">
                  <Input type="number" value={createLeaseForm.monthlyRent} onChange={e => setCreateLeaseForm(f => ({ ...f, monthlyRent: e.target.value }))} />
                </Field>
                <Field label="Security Deposit (QR) *">
                  <Input type="number" value={createLeaseForm.securityDeposit} onChange={e => setCreateLeaseForm(f => ({ ...f, securityDeposit: e.target.value }))} />
                </Field>
                <Field label="Payment Frequency">
                  <Select value={createLeaseForm.paymentFrequency} onValueChange={v => setCreateLeaseForm(f => ({ ...f, paymentFrequency: v as Lease["paymentFrequency"] }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="half_yearly">Half Yearly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="No. of PDC Cheques">
                  <Input type="number" min={1} max={36} value={createLeaseForm.pdcCount} onChange={e => setCreateLeaseForm(f => ({ ...f, pdcCount: e.target.value }))} />
                </Field>
                <Field label="Grace Period (days)">
                  <Input type="number" value={createLeaseForm.gracePeriodDays} onChange={e => setCreateLeaseForm(f => ({ ...f, gracePeriodDays: e.target.value }))} />
                </Field>
                <Field label="Notice Period (days)">
                  <Input type="number" value={createLeaseForm.noticePeriodDays} onChange={e => setCreateLeaseForm(f => ({ ...f, noticePeriodDays: e.target.value }))} />
                </Field>
              </div>
            </section>

            {/* Responsibilities */}
            <section>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 border-b pb-1">Responsibilities & Clauses</p>
              <div className="space-y-3">
                <Field label="Penalties">
                  <Input value={createLeaseForm.penalties} onChange={e => setCreateLeaseForm(f => ({ ...f, penalties: e.target.value }))} />
                </Field>
                <Field label="Maintenance Responsibility">
                  <Select value={createLeaseForm.maintenanceResponsibility} onValueChange={v => setCreateLeaseForm(f => ({ ...f, maintenanceResponsibility: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tenant">Tenant</SelectItem>
                      <SelectItem value="Owner">Owner</SelectItem>
                      <SelectItem value="Shared">Shared</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Parking / Facility Details">
                  <Input value={createLeaseForm.parkingDetails} onChange={e => setCreateLeaseForm(f => ({ ...f, parkingDetails: e.target.value }))} />
                </Field>
                <Field label="Special Conditions">
                  <Textarea rows={3} value={createLeaseForm.specialConditions} onChange={e => setCreateLeaseForm(f => ({ ...f, specialConditions: e.target.value }))} placeholder="Any special conditions or remarks..." />
                </Field>
              </div>
            </section>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateLeaseOpen(false)}>Cancel</Button>
            <Button
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── UPLOAD DOC DIALOG ─────────────────────────────────────── */}
      <Dialog open={uploadDocOpen} onOpenChange={setUploadDocOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-primary" /> Upload Document</DialogTitle>
            <DialogDescription>Upload the requested document for verification.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Document File *">
              <Input type="file" onChange={e => {
                const name = e.target.files?.[0]?.name || "";
                setUploadDocForm(f => ({ ...f, file: name, fileName: f.fileName || name }));
              }} />
              {uploadDocForm.file && <p className="text-xs text-muted-foreground mt-1">Selected: {uploadDocForm.file}</p>}
            </Field>
            <Field label="File Name (Optional)">
              <Input value={uploadDocForm.fileName} onChange={e => setUploadDocForm(f => ({ ...f, fileName: e.target.value }))} placeholder="Custom name for the file" />
            </Field>
            <Field label="Remarks (Optional)">
              <Textarea rows={2} value={uploadDocForm.remarks} onChange={e => setUploadDocForm(f => ({ ...f, remarks: e.target.value }))} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDocOpen(false)}>Cancel</Button>
            <Button onClick={submitUploadDoc}><ClipboardCheck className="mr-2 h-4 w-4" /> Upload Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── RELEASE RESERVATION DIALOG ────────────────────────────── */}
      <Dialog open={releaseOpen} onOpenChange={setReleaseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" /> Release Reservation
            </DialogTitle>
            <DialogDescription>
              {selectedReservationForRelease && (
                <span>Unit: <strong>{selectedReservationForRelease.unit}</strong> · Tenant: <strong>{selectedReservationForRelease.tenantName}</strong></span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Release Type">
              <Select value={releaseType} onValueChange={v => setReleaseType(v as typeof releaseType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="released">Released (Manual / Tenant withdrew)</SelectItem>
                  <SelectItem value="expired">Expired (Validity period lapsed)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Reason / Remarks">
              <Textarea
                rows={3}
                value={releaseReason}
                onChange={e => setReleaseReason(e.target.value)}
                placeholder="State the reason for releasing this reservation..."
              />
            </Field>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              ⚠ Releasing this reservation will change the unit status back to <strong>Available</strong> and the reservation will be marked as <strong>{releaseType}</strong>.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReleaseOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmRelease}>
              <XCircle className="mr-2 h-4 w-4" /> Confirm Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── GENERATE RENEWAL NOTICE DIALOG ────────────────────────── */}
      <Dialog open={renewalNoticeOpen} onOpenChange={setRenewalNoticeOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" /> Generate Renewal Notices
            </DialogTitle>
            <DialogDescription>
              Notices will be generated for all leases expiring within 60 days that don't already have an active renewal case.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              <strong>{upcomingRenewals.length}</strong> lease(s) expiring within 60 days detected.
            </div>

            <Field label="Select Lease / Unit to Renew">
              <Select value={renewalNoticeForm.selectedLeaseId} onValueChange={v => setRenewalNoticeForm(f => ({ ...f, selectedLeaseId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select a lease..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leases (Batch Generate)</SelectItem>
                  {upcomingRenewals.map(l => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.tenantName} - {l.unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Separator />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rent Increase %">
                <Input type="number" min={0} max={30} value={renewalNoticeForm.rentIncreasePercent} onChange={e => setRenewalNoticeForm(f => ({ ...f, rentIncreasePercent: e.target.value }))} />
              </Field>
              <Field label="Last Confirmation (days before expiry)">
                <Input type="number" min={7} max={90} value={renewalNoticeForm.lastConfirmationDays} onChange={e => setRenewalNoticeForm(f => ({ ...f, lastConfirmationDays: e.target.value }))} />
              </Field>
            </div>
            <Field label="Revised Terms Description">
              <Input value={renewalNoticeForm.revisedTerms} onChange={e => setRenewalNoticeForm(f => ({ ...f, revisedTerms: e.target.value }))} />
            </Field>
            <Field label="Additional Recipients (comma-separated)">
              <Input value={renewalNoticeForm.additionalRecipients} onChange={e => setRenewalNoticeForm(f => ({ ...f, additionalRecipients: e.target.value }))} placeholder="e.g. Legal Dept, Owner Rep" />
            </Field>
            <Field label="Internal Notes">
              <Textarea rows={2} value={renewalNoticeForm.notes} onChange={e => setRenewalNoticeForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional internal notes for this batch..." />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewalNoticeOpen(false)}>Cancel</Button>
            <Button onClick={() => generateRenewalNotices(renewalNoticeForm)}>
              <CalendarClock className="mr-2 h-4 w-4" /> Generate Notices
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DOCUMENT VERIFICATION DIALOG ───────────────────────────── */}
      <Dialog open={verifyDocOpen} onOpenChange={setVerifyDocOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-primary" /> Document Verification
            </DialogTitle>
            <DialogDescription>Review and verify the uploaded tenant document.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Action">
              <Select value={verifyDocForm.status} onValueChange={v => setVerifyDocForm(f => ({ ...f, status: v as VerificationStatus }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">Verified & Accepted</SelectItem>
                  <SelectItem value="info_required">Need More Info</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {verifyDocForm.status === "verified" && (
              <Field label="Expiry Date (if applicable)">
                <Input type="date" value={verifyDocForm.expiryDate} onChange={e => setVerifyDocForm(f => ({ ...f, expiryDate: e.target.value }))} />
              </Field>
            )}
            <Field label="Remarks / Reason">
              <Textarea
                rows={3}
                value={verifyDocForm.remarks}
                onChange={e => setVerifyDocForm(f => ({ ...f, remarks: e.target.value }))}
                placeholder={verifyDocForm.status === "verified" ? "Looks good." : "Specify what needs to be corrected..."}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDocOpen(false)}>Cancel</Button>
            <Button onClick={submitDocumentVerification}>Submit Review</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── AGREEMENT TERMS DIALOG ───────────────────────────── */}
      <Dialog open={editTermsOpen} onOpenChange={setEditTermsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-primary" /> Edit Agreement Terms
            </DialogTitle>
            <DialogDescription>Update payment frequencies, responsibilities, and special clauses.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Payment Frequency">
                <Select value={agreementTermsForm.paymentFrequency} onValueChange={(v) => setAgreementTermsForm((f) => ({ ...f, paymentFrequency: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="half_yearly">Half Yearly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="No. of PDCs">
                <Input type="number" value={agreementTermsForm.pdcCount} onChange={(e) => setAgreementTermsForm((f) => ({ ...f, pdcCount: Number(e.target.value) }))} />
              </Field>
              <Field label="Grace Period (Days)">
                <Input type="number" value={agreementTermsForm.gracePeriodDays} onChange={(e) => setAgreementTermsForm((f) => ({ ...f, gracePeriodDays: Number(e.target.value) }))} />
              </Field>
              <Field label="Notice Period (Days)">
                <Input type="number" value={agreementTermsForm.noticePeriodDays} onChange={(e) => setAgreementTermsForm((f) => ({ ...f, noticePeriodDays: Number(e.target.value) }))} />
              </Field>
            </div>

            <Field label="Penalties">
              <Textarea rows={2} value={agreementTermsForm.penalties} onChange={(e) => setAgreementTermsForm((f) => ({ ...f, penalties: e.target.value }))} placeholder="Late payment penalty after grace period..." />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Maintenance Responsibility">
                <Select value={agreementTermsForm.maintenanceResponsibility} onValueChange={(v) => setAgreementTermsForm((f) => ({ ...f, maintenanceResponsibility: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select responsibility" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Property Manager for major repairs, tenant for misuse damages">Property Manager / Shared</SelectItem>
                    <SelectItem value="Owner">Owner</SelectItem>
                    <SelectItem value="Tenant">Tenant</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Utility Responsibility">
                <Select value={agreementTermsForm.utilityResponsibility} onValueChange={(v) => setAgreementTermsForm((f) => ({ ...f, utilityResponsibility: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select responsibility" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tenant">Tenant</SelectItem>
                    <SelectItem value="Owner">Owner</SelectItem>
                    <SelectItem value="Shared">Shared</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Parking Details">
              <Input value={agreementTermsForm.parkingDetails} onChange={(e) => setAgreementTermsForm((f) => ({ ...f, parkingDetails: e.target.value }))} placeholder="e.g. 1 covered parking, remote..." />
            </Field>
            <Field label="Special Conditions / Clauses">
              <Textarea rows={2} value={agreementTermsForm.specialConditions} onChange={(e) => setAgreementTermsForm((f) => ({ ...f, specialConditions: e.target.value }))} placeholder="Any other specific clauses..." />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTermsOpen(false)}>Cancel</Button>
            <Button onClick={submitAgreementTerms}>Save Terms</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── TENANT SIGN DIALOG ───────────────────────────────── */}
      <Dialog open={tenantSignOpen} onOpenChange={setTenantSignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileSignature className="h-5 w-5 text-primary" /> Tenant Signature</DialogTitle>
            <DialogDescription>Record tenant signature details for {signatureWorkflowLease?.tenantName} / {signatureWorkflowLease?.unit}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Date of Signing">
              <Input type="date" value={tenantSignForm.signedAt} onChange={e => setTenantSignForm(f => ({ ...f, signedAt: e.target.value }))} />
            </Field>
            <Field label="Upload Signed Document">
              <Input type="file" onChange={e => setTenantSignForm(f => ({ ...f, signedDocument: e.target.files?.[0]?.name || "" }))} />
              {tenantSignForm.signedDocument && <p className="text-xs text-muted-foreground mt-1">Selected: {tenantSignForm.signedDocument}</p>}
            </Field>
            <Field label="Received By">
              <Select value={tenantSignForm.receivedBy} onValueChange={v => setTenantSignForm(f => ({ ...f, receivedBy: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Leasing Department">Leasing Department</SelectItem>
                  <SelectItem value="Property Manager">Property Manager</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Remarks">
              <Textarea rows={2} value={tenantSignForm.remarks} onChange={e => setTenantSignForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional remarks..." />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTenantSignOpen(false)}>Cancel</Button>
            <Button onClick={submitTenantSign}><FileSignature className="mr-2 h-4 w-4" /> Confirm Tenant Sign</Button>
          </DialogFooter>
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

              const regenerateCheques = (newCount = count, newRegAmt = regAmount, newFirstDate = collectForm.firstChequeDate || collectForm.startDate || signatureWorkflowLease.startDate, newInterval = collectForm.chequeIntervalDays) => {
                const firstDateObj = new Date(newFirstDate);
                const intervalNum = Number(newInterval) || 30;
                const generated = Array.from({ length: newCount }, (_, i) => {
                  let amount = newRegAmt;
                  if (i === newCount - 1 && newCount > 1) {
                    amount = Math.max(0, totalContractRent - newRegAmt * (newCount - 1));
                  }
                  const startDt = addDays(firstDateObj, i * intervalNum);
                  const endDt = addDays(new Date(startDt), intervalNum - 1);
                  return {
                    chequeNo: `PDC-${signatureWorkflowLease.unit.replace(/\W/g, "")}-${String(i + 1).padStart(3, "0")}`,
                    bank: collectForm.chequeBank || "QNB",
                    date: startDt,
                    amount,
                    period: `Cheque ${i + 1} of ${newCount}`,
                    tenureStart: startDt,
                    tenureEnd: endDt,
                    file: "",
                  };
                });
                setCollectForm((f) => ({ ...f, pdcCount: newCount, customCheques: generated }));
              };

              // Ensure we display up to 12 rows or customCheques length
              const displayedRows = collectForm.customCheques && collectForm.customCheques.length > 0
                ? collectForm.customCheques
                : Array.from({ length: 12 }, (_, i) => ({
                    chequeNo: `PDC-${i + 1}`,
                    bank: collectForm.chequeBank || "QNB",
                    date: addDays(new Date(collectForm.firstChequeDate || today), i * 30),
                    amount: regAmount,
                    period: `Cheque ${i + 1}`,
                    tenureStart: addDays(new Date(collectForm.firstChequeDate || today), i * 30),
                    tenureEnd: addDays(new Date(collectForm.firstChequeDate || today), i * 30 + 29),
                    file: "",
                  }));

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

                  <div className="grid grid-cols-3 gap-3">
                    <Field label="First Maturity Date">
                      <Input type="date" value={collectForm.firstChequeDate} onChange={(e) => {
                        const val = e.target.value;
                        setCollectForm((f) => ({ ...f, firstChequeDate: val }));
                        regenerateCheques(count, regAmount, val, collectForm.chequeIntervalDays);
                      }} />
                    </Field>
                    <Field label="Interval (Days)">
                      <Input type="number" min={1} value={collectForm.chequeIntervalDays} onChange={(e) => {
                        const val = Number(e.target.value);
                        setCollectForm((f) => ({ ...f, chequeIntervalDays: val }));
                        regenerateCheques(count, regAmount, collectForm.firstChequeDate, val);
                      }} />
                    </Field>
                    <Field label="Regular Cheque Amount (QR)">
                      <Input type="number" value={collectForm.regularChequeAmount} onChange={(e) => {
                        const val = Number(e.target.value) || 0;
                        setCollectForm((f) => ({ ...f, regularChequeAmount: String(val) }));
                        regenerateCheques(count, val, collectForm.firstChequeDate, collectForm.chequeIntervalDays);
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
                        const lastCheque = existing[existing.length - 1];
                        const nextDate = lastCheque ? addDays(new Date(lastCheque.date), Number(collectForm.chequeIntervalDays) || 30) : today.toISOString().split("T")[0];
                        const nextIdx = existing.length + 1;
                        setCollectForm(f => ({
                          ...f,
                          pdcCount: nextIdx,
                          customCheques: [
                            ...existing,
                            {
                              chequeNo: `PDC-${nextIdx}`,
                              bank: collectForm.chequeBank || "Bank",
                              date: nextDate,
                              amount: regAmount,
                              period: `Cheque ${nextIdx}`,
                              tenureStart: nextDate,
                              tenureEnd: addDays(new Date(nextDate), 29),
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-primary" /> Submit Package to Landlord</DialogTitle>
            <DialogDescription>Send collected lease documents and PDCs to landlord for signature.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Submitted To (Landlord / Owner Rep)">
              <Input value={submitLandlordForm.submittedTo} onChange={e => setSubmitLandlordForm(f => ({ ...f, submittedTo: e.target.value }))} placeholder="e.g. Sheikh Hassan Al-Thani" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Submission Date">
                <Input type="date" value={submitLandlordForm.submittedAt} onChange={e => setSubmitLandlordForm(f => ({ ...f, submittedAt: e.target.value }))} />
              </Field>
              <Field label="Delivery Method">
                <Select value={submitLandlordForm.docsSent} onValueChange={v => setSubmitLandlordForm(f => ({ ...f, docsSent: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Physical">Physical Copy</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Courier">Courier</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Upload Proof of Submission (Optional)">
              <Input type="file" onChange={e => setSubmitLandlordForm(f => ({ ...f, proofFile: e.target.files?.[0]?.name || "" }))} />
              {submitLandlordForm.proofFile && <p className="text-xs text-muted-foreground mt-1">Selected: {submitLandlordForm.proofFile}</p>}
            </Field>
            <Field label="Notes">
              <Textarea rows={2} value={submitLandlordForm.notes} onChange={e => setSubmitLandlordForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitLandlordOpen(false)}>Cancel</Button>
            <Button onClick={submitToLandlord}><ClipboardCheck className="mr-2 h-4 w-4" /> Confirm Submission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── UPLOAD AGREEMENT DIALOG ───────────────────────────── */}
      <Dialog open={uploadAgreementOpen} onOpenChange={setUploadAgreementOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5 text-primary" /> Upload Agreement</DialogTitle>
            <DialogDescription>Upload the signed lease agreement document and mark the lease as fully signed.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Upload Agreement File">
              <Input type="file" onChange={e => setUploadAgreementForm(f => ({ ...f, file: e.target.files?.[0]?.name || "" }))} />
              {uploadAgreementForm.file && <p className="text-xs text-muted-foreground mt-1">Selected: {uploadAgreementForm.file}</p>}
            </Field>
            <Field label="Saved File Name (Optional)">
              <Input value={uploadAgreementForm.fileName} onChange={e => setUploadAgreementForm(f => ({ ...f, fileName: e.target.value }))} placeholder="Custom name for uploaded agreement" />
            </Field>
            <Field label="Remarks">
              <Textarea rows={2} value={uploadAgreementForm.remarks} onChange={e => setUploadAgreementForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional notes..." />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadAgreementOpen(false)}>Cancel</Button>
            <Button onClick={submitUploadAgreement}><Upload className="mr-2 h-4 w-4" /> Confirm Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── LANDLORD SIGN DIALOG ───────────────────────────── */}
      <Dialog open={landlordSignOpen} onOpenChange={setLandlordSignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-primary" /> Landlord Signature</DialogTitle>
            <DialogDescription>Record landlord / owner signature for {signatureWorkflowLease?.tenantName} — {signatureWorkflowLease?.unit}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Date of Signing">
              <Input type="date" value={landlordSignForm.signedAt} onChange={e => setLandlordSignForm(f => ({ ...f, signedAt: e.target.value }))} />
            </Field>
            <Field label="Signed By">
              <Input value={landlordSignForm.signedBy} onChange={e => setLandlordSignForm(f => ({ ...f, signedBy: e.target.value }))} placeholder="e.g. Sheikh Hassan Al-Thani" />
            </Field>
            <Field label="Upload Signed Document">
              <Input type="file" onChange={e => setLandlordSignForm(f => ({ ...f, signedDocument: e.target.files?.[0]?.name || "" }))} />
              {landlordSignForm.signedDocument && <p className="text-xs text-muted-foreground mt-1">Selected: {landlordSignForm.signedDocument}</p>}
            </Field>
            <div className="flex items-center gap-3 rounded-md border p-3">
              <input type="checkbox" id="shared" checked={landlordSignForm.sharedWithTenant} onChange={e => setLandlordSignForm(f => ({ ...f, sharedWithTenant: e.target.checked }))} className="h-4 w-4" />
              <Label htmlFor="shared">Share signed copy with tenant</Label>
            </div>
            <Field label="Remarks">
              <Textarea rows={2} value={landlordSignForm.remarks} onChange={e => setLandlordSignForm(f => ({ ...f, remarks: e.target.value }))} placeholder="Optional remarks..." />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLandlordSignOpen(false)}>Cancel</Button>
            <Button onClick={submitLandlordSign}><BadgeCheck className="mr-2 h-4 w-4" /> Confirm Landlord Sign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* ── KEY NOTIFY DIALOG ─────────────────────────────────── */}
      <Dialog open={keyNotifyOpen} onOpenChange={setKeyNotifyOpen}>
        <DialogContent className="sm:max-w-[500px] w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Key Issue Notification</DialogTitle>
            <DialogDescription>Send handover notification to tenant and all responsible parties for {keysWorkflowLease?.tenantName} — {keysWorkflowLease?.unit}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Planned Handover Date">
              <Input type="date" value={keyNotifyForm.handoverAt} onChange={e => setKeyNotifyForm(f => ({ ...f, handoverAt: e.target.value }))} />
            </Field>
            <Field label="Planned Handover Time">
              <Input type="time" value={keyNotifyForm.handoverTime} onChange={e => setKeyNotifyForm(f => ({ ...f, handoverTime: e.target.value }))} />
            </Field>
            <Field label="Recipients">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal h-auto min-h-10 py-2 whitespace-normal break-words">
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
            <Field label="Authorized Person Collecting Keys">
              <Input value={keyNotifyForm.authorizedCollector} onChange={e => setKeyNotifyForm(f => ({ ...f, authorizedCollector: e.target.value }))} placeholder="Tenant or approved representative" />
            </Field>
            <Field label="Keys / Access Items Summary">
              <Input value={keyNotifyForm.keysSummary} onChange={e => setKeyNotifyForm(f => ({ ...f, keysSummary: e.target.value }))} placeholder="2 keys, 2 cards, 1 parking remote" />
            </Field>
            <Field label="Outstanding Requirements">
              <Input value={keyNotifyForm.outstandingRequirements} onChange={e => setKeyNotifyForm(f => ({ ...f, outstandingRequirements: e.target.value }))} placeholder="None" />
            </Field>
            <Field label="Property Manager / Staff Contact">
              <Input value={keyNotifyForm.staffContact} onChange={e => setKeyNotifyForm(f => ({ ...f, staffContact: e.target.value }))} placeholder="Name and contact details" />
            </Field>
            <Field label="Special Instructions / Note">
              <Textarea rows={2} value={keyNotifyForm.note} onChange={e => setKeyNotifyForm(f => ({ ...f, note: e.target.value }))} placeholder="Any special access or coordination instructions..." />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyNotifyOpen(false)}>Cancel</Button>
            <Button onClick={() => keysWorkflowLease && issueDetailedKeyNotice(keysWorkflowLease)}><Bell className="mr-2 h-4 w-4" /> Send Notification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── KEY HANDOVER DIALOG ───────────────────────────────── */}
      <Dialog open={handoverOpen} onOpenChange={setHandoverOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <span className="inline-flex items-center justify-center rounded-full bg-primary/10 p-2"><Key className="h-5 w-5 text-primary" /></span>
              Handover & Check-In Workflow
            </DialogTitle>
            <DialogDescription className="text-sm">
              <span className="font-medium text-foreground">{keysWorkflowLease?.tenantName}</span> · {keysWorkflowLease?.unit} · {keysWorkflowLease?.property}
            </DialogDescription>
          </DialogHeader>

          {/* Tab navigation inside dialog */}
          <div className="flex gap-1 rounded-lg bg-muted p-1 text-sm">
            {handoverTabOrder.map((tab) => (
              <button
                key={tab}
                className={`flex-1 rounded-md px-3 py-1.5 font-medium transition-colors ${
                  handoverActiveTab === tab
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setHandoverActiveTab(tab)}
                type="button"
              >
                {tab === "details" && "🔑 Handover Details"}
                {tab === "condition" && "🏠 Condition"}
                {tab === "assets" && "📦 Assets"}
                {tab === "checklist" && "✅ Checklist"}
                {tab === "acknowledgement" && "📝 Acknowledgement"}
              </button>
            ))}
          </div>

          <div className="space-y-4 py-2">
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center rounded-full bg-green-100 p-2"><Key className="h-5 w-5 text-green-600" /></span>
              Handover Certificate
            </DialogTitle>
            <DialogDescription>Official key handover record</DialogDescription>
          </DialogHeader>
          {selectedHandover && (() => {
            const lease = leases.find(l => l.id === selectedHandover.leaseId);
            return (
              <div className="space-y-3">
                <div className="rounded-lg bg-green-50 border border-green-200 p-3 flex items-center gap-2 text-green-800 text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" /> Keys successfully handed over
                </div>
                <div className="rounded-lg border p-4 space-y-1 text-sm">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <span className="text-muted-foreground">Tenant</span><span className="font-medium">{lease?.tenantName}</span>
                    <span className="text-muted-foreground">Unit</span><span className="font-medium">{lease?.unit}</span>
                    <span className="text-muted-foreground">Date / Time</span><span className="font-medium">{selectedHandover.handoverAt}</span>
                    <span className="text-muted-foreground">Keys</span><span className="font-medium">{selectedHandover.keys}× {selectedHandover.keyType || "keys"}</span>
                    <span className="text-muted-foreground">Access Cards</span><span className="font-medium">{selectedHandover.accessCards}</span>
                    <span className="text-muted-foreground">Parking Remotes</span><span className="font-medium">{selectedHandover.parkingRemotes}</span>
                    {selectedHandover.parkingDeviceDetails && (
                      <><span className="text-muted-foreground">Parking Device</span><span className="font-medium">{selectedHandover.parkingDeviceDetails}</span></>
                    )}
                    <span className="text-muted-foreground">Elec. Meter</span><span className="font-medium">{selectedHandover.electricityMeterReading || "—"}</span>
                    <span className="text-muted-foreground">Water Meter</span><span className="font-medium">{selectedHandover.waterMeterReading || "—"}</span>
                    <span className="text-muted-foreground">Unit Condition</span><span className="font-medium">{selectedHandover.unitCondition || "—"}</span>
                    <span className="text-muted-foreground">Cleanliness</span><span className="font-medium">{selectedHandover.cleanliness || "—"}</span>
                    <span className="text-muted-foreground">Collector</span><span className="font-medium">{selectedHandover.collectorName}</span>
                    {selectedHandover.collectorIdNumber && (
                      <><span className="text-muted-foreground">Collector ID</span><span className="font-medium">{selectedHandover.collectorIdNumber}</span></>
                    )}
                    <span className="text-muted-foreground">ID Verified</span>
                    <span className={`font-medium ${selectedHandover.idVerified ? "text-green-600" : "text-red-500"}`}>{selectedHandover.idVerified ? "Yes ✓" : "No ✗"}</span>
                    <span className="text-muted-foreground">Issued By</span><span className="font-medium">{selectedHandover.issuedBy}</span>
                    <span className="text-muted-foreground">Photos</span><span className="font-medium">{selectedHandover.photosTaken ?? "—"}</span>
                  </div>
                </div>
                {selectedHandover.note && (
                  <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Notes</p>
                    <p>{selectedHandover.note}</p>
                  </div>
                )}
                <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Tenant Acknowledgement</p>
                  <p className="italic">{selectedHandover.tenantAcknowledgement}</p>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className={`rounded border p-2 text-center ${selectedHandover.acWorking ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>🌀 A/C<br />{selectedHandover.acWorking ? "OK" : "Issue"}</div>
                  <div className={`rounded border p-2 text-center ${selectedHandover.plumbingOk ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>🚿 Plumb.<br />{selectedHandover.plumbingOk ? "OK" : "Issue"}</div>
                  <div className={`rounded border p-2 text-center ${selectedHandover.electricalOk ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>💡 Elec.<br />{selectedHandover.electricalOk ? "OK" : "Issue"}</div>
                  <div className={`rounded border p-2 text-center ${selectedHandover.doorsWindowsOk ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>🚪 Doors<br />{selectedHandover.doorsWindowsOk ? "OK" : "Issue"}</div>
                </div>
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHandoverViewOpen(false)}>Close</Button>
            <Button variant="outline" onClick={() => { window.print(); }} className="gap-2"><Key className="h-4 w-4" /> Print Certificate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── RENEWAL RESPONSE DIALOG ───────────────────────────── */}
      <Dialog open={renewalResponseOpen} onOpenChange={setRenewalResponseOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><RefreshCw className="h-5 w-5 text-primary" /> Tenant Renewal Response</DialogTitle>
            <DialogDescription>Record tenant's decision regarding lease renewal for {leases.find(l => l.id === selectedRenewal?.leaseId)?.tenantName} — {leases.find(l => l.id === selectedRenewal?.leaseId)?.unit}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Tenant Response">
              <Select value={renewalResponseForm.response} onValueChange={v => setRenewalResponseForm(f => ({ ...f, response: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirm">Confirmed Renewal</SelectItem>
                  <SelectItem value="non_renewal">Non-Renewal / Vacating</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {renewalResponseForm.response === "confirm" && (
              <Field label="Confirmed Monthly Rent (QR)">
                <Input type="number" value={renewalResponseForm.confirmedRent} onChange={e => setRenewalResponseForm(f => ({ ...f, confirmedRent: e.target.value }))} placeholder={`Proposed: QR ${selectedRenewal?.proposedRent}`} />
              </Field>
            )}
            <Field label="Notes">
              <Textarea rows={2} value={renewalResponseForm.notes} onChange={e => setRenewalResponseForm(f => ({ ...f, notes: e.target.value }))} placeholder="Negotiation notes, special terms..." />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewalResponseOpen(false)}>Cancel</Button>
            <Button onClick={() => { if (selectedRenewal) renewLease(selectedRenewal); setRenewalResponseOpen(false); }}><RefreshCw className="mr-2 h-4 w-4" /> Confirm Response</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DISCUSS RENEWAL DIALOG ────────────────────────────── */}
      <Dialog open={discussRenewalOpen} onOpenChange={setDiscussRenewalOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Renewal Discussion</DialogTitle>
            <DialogDescription>Record discussion notes and update proposed terms for {leases.find(l => l.id === selectedDiscussRenewal?.leaseId)?.tenantName} — {leases.find(l => l.id === selectedDiscussRenewal?.leaseId)?.unit}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg border bg-muted/30 p-3 text-sm space-y-1">
              <p><span className="text-muted-foreground">Current Proposed Rent:</span> <span className="font-semibold">QR {selectedDiscussRenewal?.proposedRent?.toLocaleString()}</span></p>
              <p><span className="text-muted-foreground">Proposed Period:</span> <span className="font-semibold">{selectedDiscussRenewal?.proposedPeriod}</span></p>
              <p><span className="text-muted-foreground">Expiry:</span> <span className="font-semibold">{selectedDiscussRenewal?.expiryDate}</span></p>
            </div>
            <Field label="Tenant Response">
              <Select value={discussRenewalForm.tenantResponse} onValueChange={v => setDiscussRenewalForm(f => ({ ...f, tenantResponse: v as any }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive — Likely to renew</SelectItem>
                  <SelectItem value="pending">Pending — Awaiting decision</SelectItem>
                  <SelectItem value="negative">Negative — Likely to vacate</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Discussed Rent (QR) — leave blank to keep proposed">
              <Input type="number" value={discussRenewalForm.discussedRent} onChange={e => setDiscussRenewalForm(f => ({ ...f, discussedRent: e.target.value }))} placeholder={`e.g. ${selectedDiscussRenewal?.proposedRent}`} />
            </Field>
            <Field label="Updated Renewal Period — leave blank to keep proposed">
              <Input value={discussRenewalForm.proposedPeriod} onChange={e => setDiscussRenewalForm(f => ({ ...f, proposedPeriod: e.target.value }))} placeholder="e.g. 12 months" />
            </Field>
            <Field label="Next Follow-Up / Confirmation Date">
              <Input type="date" value={discussRenewalForm.nextFollowUpDate} onChange={e => setDiscussRenewalForm(f => ({ ...f, nextFollowUpDate: e.target.value }))} />
            </Field>
            <Field label="Discussion Notes">
              <Textarea rows={3} value={discussRenewalForm.notes} onChange={e => setDiscussRenewalForm(f => ({ ...f, notes: e.target.value }))} placeholder="Key discussion points, tenant concerns, agreed items..." />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscussRenewalOpen(false)}>Cancel</Button>
            <Button onClick={discussRenewal}><Bell className="mr-2 h-4 w-4" /> Save Discussion</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ADD VOUCHER DIALOG ────────────────────────────────── */}
      <Dialog open={addVoucherOpen} onOpenChange={setAddVoucherOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Banknote className="h-5 w-5 text-primary" /> Add Voucher</DialogTitle>
            <DialogDescription>Create a financial voucher entry. If PDC, a corresponding PDC record will also be created.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Lease">
              <Select value={addVoucherForm.leaseId} onValueChange={v => {
                const lease = leases.find(l => l.id === v);
                const accounts = getVoucherAccounts(addVoucherForm.name, lease?.unit || "", addVoucherForm.method);
                setAddVoucherForm(f => ({ ...f, leaseId: v, debit: accounts.debit, credit: accounts.credit }));
              }}>
                <SelectTrigger><SelectValue placeholder="Select lease" /></SelectTrigger>
                <SelectContent>{leases.map(l => <SelectItem key={l.id} value={l.id}>{l.tenantName} / {l.unit}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Voucher Type / Name">
              <Select value={addVoucherForm.name} onValueChange={v => {
                const lease = leases.find(l => l.id === addVoucherForm.leaseId);
                const accounts = getVoucherAccounts(v, lease?.unit || "", addVoucherForm.method);
                setAddVoucherForm(f => ({ ...f, name: v, debit: accounts.debit, credit: accounts.credit }));
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Receipts Voucher - Rent">Receipts Voucher — Rent</SelectItem>
                  <SelectItem value="Receipt Voucher - Security Deposit">Receipt Voucher — Security Deposit</SelectItem>
                  <SelectItem value="Deposit Voucher - Rent">Deposit Voucher — Rent</SelectItem>
                  <SelectItem value="Rental Income Document">Rental Income Document</SelectItem>
                  <SelectItem value="Payment Voucher">Payment Voucher</SelectItem>
                  <SelectItem value="Cheque Return Voucher">Cheque Return Voucher</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Receipt / Voucher No.">
                <Input value={addVoucherForm.receiptNo} onChange={e => setAddVoucherForm(f => ({ ...f, receiptNo: e.target.value }))} placeholder="Auto-generated if blank" />
              </Field>
              <Field label="Payment Method">
                <Select value={addVoucherForm.method} onValueChange={v => {
                  const lease = leases.find(l => l.id === addVoucherForm.leaseId);
                  const accounts = getVoucherAccounts(addVoucherForm.name, lease?.unit || "", v);
                  setAddVoucherForm(f => ({ ...f, method: v, debit: accounts.debit, credit: accounts.credit }));
                }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDC">PDC</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Guarantee Cheque">Guarantee Cheque</SelectItem>
                    <SelectItem value="Batch">Batch</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Period (e.g. Jan 2026)">
              <Input value={addVoucherForm.period} onChange={e => setAddVoucherForm(f => ({ ...f, period: e.target.value }))} placeholder="e.g. Jan 2026" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Debit Account (Auto-locked)">
                <Input value={addVoucherForm.debit} readOnly disabled className="bg-muted/60 text-muted-foreground font-medium cursor-not-allowed" />
              </Field>
              <Field label="Credit Account (Auto-locked)">
                <Input value={addVoucherForm.credit} readOnly disabled className="bg-muted/60 text-muted-foreground font-medium cursor-not-allowed" />
              </Field>
            </div>
            <Field label="Amount (QR)">
              <Input type="number" value={addVoucherForm.amount} onChange={e => setAddVoucherForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
            </Field>
            {(addVoucherForm.method === "PDC" || addVoucherForm.method === "Guarantee Cheque") && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Also Register PDC Entry</p>
                    <p className="text-[11px] text-muted-foreground">Automatically creates an active cheque record in PDC Management / Treasury register.</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={addVoucherForm.createPdc} onChange={e => setAddVoucherForm(f => ({ ...f, createPdc: e.target.checked }))} className="h-4 w-4" />
                    <span className="text-sm font-medium">Create PDC record</span>
                  </label>
                </div>
                {addVoucherForm.createPdc && (
                  <div className="grid grid-cols-3 gap-2">
                    <Field label="Cheque No.">
                      <Input value={addVoucherForm.pdcChequeNo} onChange={e => setAddVoucherForm(f => ({ ...f, pdcChequeNo: e.target.value }))} placeholder="CHQ-001" />
                    </Field>
                    <Field label="Bank">
                      <Input value={addVoucherForm.pdcBank} onChange={e => setAddVoucherForm(f => ({ ...f, pdcBank: e.target.value }))} placeholder="QNB" />
                    </Field>
                    <Field label="Date">
                      <Input type="date" value={addVoucherForm.pdcDate} onChange={e => setAddVoucherForm(f => ({ ...f, pdcDate: e.target.value }))} />
                    </Field>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddVoucherOpen(false)}>Cancel</Button>
            <Button onClick={addVoucher}><Banknote className="mr-2 h-4 w-4" /> Add Voucher</Button>
          </DialogFooter>
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
            const maxCalculated = Math.max(0, grossDeposit - totalDeductions);
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

            const depositDeduction = Math.min(grossDeposit, totalDeductions);
            const remainingAR = Math.max(0, totalDeductions - grossDeposit);

            const handleDeductionChange = (field: string, val: string) => {
              const updatedForm = { ...settleRefundForm, [field]: val };
              const d = parseFloat(field === "damages" ? val : updatedForm.damages) || 0;
              const r = parseFloat(field === "outstandingRent" ? val : updatedForm.outstandingRent) || 0;
              const u = parseFloat(field === "utilityCharges" ? val : updatedForm.utilityCharges) || 0;
              const c = parseFloat(field === "cleaningCharges" ? val : updatedForm.cleaningCharges) || 0;
              const res = parseFloat(field === "restorationCharges" ? val : updatedForm.restorationCharges) || 0;
              const o = parseFloat(field === "otherDeductions" ? val : updatedForm.otherDeductions) || 0;
              const tot = d + r + u + c + res + o;
              if (updatedForm.settlementMode === "DEDUCT_FROM_DEPOSIT") {
                updatedForm.refundAmount = String(Math.max(0, grossDeposit - tot));
              } else {
                updatedForm.refundAmount = String(grossDeposit);
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

                    {/* Financial Summary Card */}
                    <div className="rounded-lg border bg-purple-50/50 border-purple-200 p-2.5 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 block">
                        Settlement Financial Summary
                      </span>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded bg-background border">
                          <span className="text-muted-foreground block text-[10px]">Gross Deposit Held:</span>
                          <span className="font-bold text-foreground font-mono">QAR {grossDeposit.toLocaleString()}</span>
                        </div>
                        <div className="p-2 rounded bg-background border">
                          <span className="text-muted-foreground block text-[10px]">Total Damages / Deductions:</span>
                          <span className="font-bold text-destructive font-mono">-QAR {totalDeductions.toLocaleString()}</span>
                        </div>
                        <div className="p-2 rounded bg-background border border-emerald-300 bg-emerald-50/70">
                          <span className="text-emerald-800 block text-[10px] font-semibold">
                            {mode === "PAY_SEPARATELY" ? "Deposit Refund:" : "Net Refund to Pay:"}
                          </span>
                          <span className="font-bold text-emerald-700 font-mono">
                            QAR {mode === "PAY_SEPARATELY" ? grossDeposit.toLocaleString() : maxCalculated.toLocaleString()}
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

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Settlement &amp; Refund Remarks</Label>
                      <Input
                        className="h-8 text-xs"
                        placeholder="e.g. Unit inspected, damage costs settled, deposit refund processed"
                        value={settleRefundForm.notes}
                        onChange={(e) => setSettleRefundForm({ ...settleRefundForm, notes: e.target.value })}
                      />
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

      {/* ── START CHECKOUT DIALOG ─────────────────────────────── */}
      <Dialog open={startCheckoutOpen} onOpenChange={setStartCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><LogOut className="h-5 w-5 text-primary" /> Initiate Non-Renewal & Checkout</DialogTitle>
            <DialogDescription>Open a checkout case for {checkoutWorkflowLease?.tenantName} — {checkoutWorkflowLease?.unit}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Notice Date"><Input type="date" value={startCheckoutForm.noticeDate} onChange={e => setStartCheckoutForm(f => ({ ...f, noticeDate: e.target.value }))} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Move-Out Date"><Input type="date" value={startCheckoutForm.moveOutDate} onChange={e => setStartCheckoutForm(f => ({ ...f, moveOutDate: e.target.value }))} /></Field>
              <Field label="Inspection Date"><Input type="date" value={startCheckoutForm.inspectionDate} onChange={e => setStartCheckoutForm(f => ({ ...f, inspectionDate: e.target.value }))} /></Field>
            </div>
            <Field label="Notes">
              <Textarea rows={2} value={startCheckoutForm.notes} onChange={e => setStartCheckoutForm(f => ({ ...f, notes: e.target.value }))} placeholder="Reason for non-renewal, coordination notes..." />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStartCheckoutOpen(false)}>Cancel</Button>
            <Button onClick={() => checkoutWorkflowLease && startCheckout(checkoutWorkflowLease)}><LogOut className="mr-2 h-4 w-4" /> Initiate Checkout</Button>
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
                    const netRefund = dep - totalDeductions;
                    return (
                      <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                        <div className="p-2 rounded bg-background border">
                          <span className="text-muted-foreground block text-[11px]">Gross Deposit:</span>
                          <span className="font-bold text-foreground font-mono">QR {dep.toLocaleString()}</span>
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
        <DialogContent className="sm:max-w-[1000px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary" /> Add PDC / Cheque</DialogTitle>
            <DialogDescription>Manually record a post-dated cheque for a lease.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Lease">
              <Select value={pdcLeaseId} onValueChange={setPdcLeaseId}>
                <SelectTrigger><SelectValue placeholder="Select lease" /></SelectTrigger>
                <SelectContent>
                  {leases.map(l => <SelectItem key={l.id} value={l.id}>{l.tenantName} / {l.unit}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="mb-2 text-sm font-semibold">Enter up to 12 PDC rows</p>
              <div className="grid grid-cols-[2fr_2fr_2fr_2fr_3fr_2fr] gap-2 text-xs font-semibold text-muted-foreground mb-2">
                <span>Cheque No.</span>
                <span>Bank</span>
                <span>Maturity</span>
                <span>Amount</span>
                <span>Tenure (Start & End)</span>
                <span>Document</span>
              </div>
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-2">
                {pdcRows.map((row, idx) => (
                  <div key={idx} className="grid grid-cols-[2fr_2fr_2fr_2fr_3fr_2fr] gap-2 items-center text-sm">
                    <Input
                      value={row.chequeNo}
                      onChange={e => handlePdcRowChange(idx, "chequeNo", e.target.value)}
                      placeholder={`PDC-${idx + 1}`}
                    />
                    <Input
                      value={row.bank}
                      onChange={e => handlePdcRowChange(idx, "bank", e.target.value)}
                      placeholder="Bank"
                    />
                    <Input
                      type="date"
                      value={row.maturityDate}
                      onChange={e => handlePdcRowChange(idx, "maturityDate", e.target.value)}
                    />
                    <Input
                      type="number"
                      value={row.amount}
                      onChange={e => handlePdcRowChange(idx, "amount", e.target.value)}
                      placeholder="Amount"
                    />
                    <div className="flex gap-1">
                      <Input
                        type="date"
                        value={row.tenureStart}
                        onChange={e => handlePdcRowChange(idx, "tenureStart", e.target.value)}
                        title="Start Date"
                      />
                      <Input
                        type="date"
                        value={row.tenureEnd}
                        onChange={e => handlePdcRowChange(idx, "tenureEnd", e.target.value)}
                        title="End Date"
                      />
                    </div>
                    <Input
                      type="file"
                      onChange={e => handlePdcRowChange(idx, "file", e.target.files?.[0]?.name || "")}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Leave rows blank to skip them. Only fully completed rows will be saved.</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPdcOpen(false)}>Cancel</Button>
            <Button onClick={addManualPdc}><Receipt className="mr-2 h-4 w-4" /> Add PDC</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── PAGE HEADER ───────────────────────────────────────────── */}

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Lease Management</h2>
          <p className="text-muted-foreground">Reservation to lease closure with gates, approvals, handover, inspections and accounting documents.</p>
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
        <Metric label="Reserved Units" value={activeReservations} icon={<Lock className="h-4 w-4 text-blue-600" />} />
        <Metric label="Document Blocks" value={blockedDocuments} icon={<AlertCircle className="h-4 w-4 text-amber-600" />} />
        <Metric label="Ready For Keys" value={readyForKeys} icon={<KeyRound className="h-4 w-4 text-green-600" />} />
        <Metric label="Open Settlements" value={openSettlements} icon={<Wallet className="h-4 w-4 text-red-600" />} />
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="customers">Customer Master</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="agreement">Agreement Terms</TabsTrigger>
          <TabsTrigger value="signatures">Signatures</TabsTrigger>
          <TabsTrigger value="keys">Keys & Check-In</TabsTrigger>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="renewals">Renewals</TabsTrigger>
          <TabsTrigger value="checkout">Checkout</TabsTrigger>
          <TabsTrigger value="audit">Audit Flow</TabsTrigger>
          
        </TabsList>

        <TabsContent value="reservations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Unit Reservation - Lease Module</CardTitle>
                <CardDescription>Reserving a unit locks it from Available to Reserved until conversion, expiry or release.</CardDescription>
              </div>
              <Button onClick={() => setCreateReservationOpen(true)}>
                <Lock className="mr-2 h-4 w-4" /> Create Reservation
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={["Unit", "Tenant", "Valid Until", "Rent", "Status", "Actions"]}
                rows={reservations.map((reservation) => [
                  reservation.unit,
                  reservation.tenantName,
                  <span className={isExpired(reservation.validUntil) && reservation.status === "reserved" ? "text-red-600" : ""}>{reservation.validUntil}</span>,
                  formatMoney(reservation.rent),
                  <StatusBadge key="status" value={reservation.status} />,
                  <div key="actions" className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" disabled={reservation.status !== "reserved"} onClick={() => openCreateLeaseDialog(reservation)}>Create Lease</Button>
                    <Button size="sm" variant="outline" disabled={reservation.status !== "reserved"} onClick={() => openReleaseDialog(reservation)}>Release</Button>
                  </div>,
                ])}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Customer Master With Duplicate Validation</CardTitle>
                <CardDescription>Duplicate checks run across Qatar ID, passport, CR number, mobile and email before activation.</CardDescription>
              </div>
              <Button onClick={() => setCreateCustomerOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" /> Add Customer
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={["Name", "Type", "Primary ID", "Contact", "Status", "Actions"]}
                rows={customers.map((customer) => [
                  customer.name,
                  customer.type,
                  customer.qatarId || customer.passport || customer.crNumber || "-",
                  `${customer.mobile || "-"} / ${customer.email || "-"}`,
                  <StatusBadge key="status" value={customer.status} />,
                  <div key="actions" className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => {
                      setViewCustomerData(customer as any);
                      setViewCustomerOpen(true);
                    }}>View</Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      setEditCustomerData(customer as any);
                      setCustomerForm({
                        name: customer.name,
                        type: customer.type,
                        qatarId: customer.qatarId || "",
                        passport: customer.passport || "",
                        crNumber: customer.crNumber || "",
                        nationality: (customer as any).nationality || "",
                        mobile: customer.mobile || "",
                        email: customer.email || "",
                        permanentAddress: (customer as any).permanentAddress || "",
                        localAddress: (customer as any).localAddress || "",
                        authorizedSignatory: (customer as any).authorizedSignatory || "",
                        emergencyContact: (customer as any).emergencyContact || "",
                        employerInfo: (customer as any).employerInfo || "",
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
                rows={documents.map((document) => {
                  const customer = customers.find((item) => item.id === document.customerId);
                  return [
                    customer?.name || "-",
                    document.name,
                    document.mandatory ? "Yes" : "No",
                    document.expiryDate || "-",
                    <div key="status" className="flex items-center gap-2">
                      <StatusBadge value={document.status} />
                      {document.file && <span className="text-xs text-muted-foreground">({document.file})</span>}
                    </div>,
                    document.reviewer || "-",
                    <div key="actions" className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedDocId(document.id); setUploadDocForm({ file: "", fileName: "", remarks: "" }); setUploadDocOpen(true); }}>Upload</Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedDocId(document.id); setVerifyDocForm({ status: "verified", expiryDate: "", remarks: "" }); setVerifyDocOpen(true); }}>Verify</Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedDocId(document.id); setVerifyDocForm({ status: "info_required", expiryDate: "", remarks: "" }); setVerifyDocOpen(true); }}>Need Info</Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedDocId(document.id); setVerifyDocForm({ status: "rejected", expiryDate: "", remarks: "" }); setVerifyDocOpen(true); }}>Reject</Button>
                    </div>,
                  ];
                })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agreement">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Lease Agreement Terms & Payment Schedule Rules</CardTitle>
                <CardDescription>Agreement data now includes payment frequency, PDC count, grace/penalty terms, maintenance, utilities, parking, special clauses and notice period.</CardDescription>
              </div>
              <Button onClick={() => setCreateLeaseOpen(true)}>
                <FileSignature className="mr-2 h-4 w-4" /> Create Lease
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={["Lease", "Rent / Frequency", "PDCs", "Grace / Penalty", "Responsibilities", "Facilities / Clauses", "Renewal Notice", "Actions"]}
                rows={leases.map((lease) => [
                  `${lease.tenantName} / ${lease.unit}`,
                  `${formatMoney(lease.monthlyRent)} / ${lease.paymentFrequency.replace("_", " ")}`,
                  `${lease.pdcCount} cheques`,
                  `${lease.gracePeriodDays} days / ${lease.penalties}`,
                  `Maintenance: ${lease.maintenanceResponsibility}; Utilities: ${lease.utilityResponsibility}`,
                  `${lease.parkingDetails}; ${lease.specialConditions}`,
                  `${lease.noticePeriodDays} days`,
                  <div key="actions" className="flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
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
                rows={leases.map((lease) => {
                  const docsVerified = documents.filter((item) => item.customerId === lease.customerId && item.mandatory).every((item) => item.status === "verified");
                  return [
                    `${lease.property} / ${lease.unit}`,
                    lease.tenantName,
                    `${lease.startDate} to ${lease.endDate}`,
                    formatMoney(lease.securityDeposit),
                    <StatusBadge key="status" value={lease.status} />,
                    `Agreement: ${lease.signedDocument || "-"}; shared: ${lease.sharedWithTenant ? "Yes" : "No"}`,
                    <div key="actions" className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => downloadLeaseAgreement(lease)}><Download className="mr-2 h-4 w-4" />Download Agreement</Button>
                      <Button size="sm" variant="outline" onClick={() => { setSignatureWorkflowLease(lease); setUploadAgreementForm({ file: "", fileName: "", remarks: "" }); setUploadAgreementOpen(true); }}><Upload className="mr-2 h-4 w-4" />Upload Agreement</Button>
                      <Button size="sm" variant="outline" disabled={lease.collectionCompleted} title={lease.collectionCompleted ? "Collection already recorded — cannot re-collect" : undefined} onClick={() => {
                        setSignatureWorkflowLease(lease);
                        const count = lease.pdcCount || 12;
                        const totalRent = (lease.monthlyRent || 0) * (lease.pdcCount || 12);
                        const regAmt = lease.monthlyRent || 0;
                        const firstDate = new Date(lease.startDate || today);
                        const generated = Array.from({ length: count }, (_, i) => {
                          let amount = regAmt;
                          if (i === count - 1 && count > 1) {
                            amount = Math.max(0, totalRent - regAmt * (count - 1));
                          }
                          const chequeStartDate = addDays(firstDate, i * 30);
                          const chequeEndDate = addDays(new Date(chequeStartDate), 29);
                          return {
                            chequeNo: `PDC-${lease.unit.replace(/\W/g, "")}-${String(i + 1).padStart(3, "0")}`,
                            bank: "QNB",
                            date: chequeStartDate,
                            amount,
                            period: `Cheque ${i + 1} of ${count}`,
                            tenureStart: chequeStartDate,
                            tenureEnd: chequeEndDate,
                            file: "",
                          };
                        });
                        setCollectForm({
                          paymentMode: "PDC",
                          chequeBank: "QNB",
                          payerName: lease.tenantName,
                          depositAmount: String(lease.securityDeposit),
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
                          startDate: lease.startDate,
                          endDate: lease.endDate,
                          firstChequeDate: lease.startDate,
                          chequeIntervalDays: 30,
                          regularChequeAmount: String(lease.monthlyRent),
                          customCheques: generated,
                        });
                        setCollectOpen(true);
                      }}>{lease.collectionCompleted ? <><Lock className="mr-1 h-3 w-3" />Collected</> : "Collect"}</Button>
                      <Button size="sm" variant="outline" className="text-primary border-primary/50 gap-1" onClick={() => {
                        const leasePdcs = pdcs.filter(p => p.leaseId === lease.id);
                        const leaseVouchers = vouchers.filter(v => v.leaseId === lease.id);
                        const pdcTot = leasePdcs.reduce((s, p) => s + p.amount, 0) || (lease.monthlyRent * (lease.pdcCount || 12));
                        const totalCol = pdcTot + lease.securityDeposit;
                        const rec: TenantReceiptDetails = {
                          receiptNo: `REC-${lease.id.toUpperCase()}`,
                          acknowledgementNo: `ACK-${lease.id.toUpperCase()}`,
                          date: lease.startDate || today.toISOString().split("T")[0],
                          tenantName: lease.tenantName,
                          tenantPhone: (lease as any).phone || "",
                          tenantEmail: (lease as any).email || "",
                          tenantQid: (lease as any).qatarId || "",
                          propertyName: lease.property,
                          unitRef: lease.unit,
                          leaseNo: `LES-${lease.id.toUpperCase()}`,
                          leaseStartDate: lease.startDate,
                          leaseEndDate: lease.endDate,
                          monthlyRent: lease.monthlyRent,
                          totalContractRent: pdcTot,
                          depositAmount: lease.securityDeposit,
                          depositMode: "Cash / PDC",
                          pdcCount: leasePdcs.length || lease.pdcCount || 12,
                          pdcs: leasePdcs.length > 0 ? leasePdcs.map((p, idx) => ({
                            chequeNo: p.chequeNo,
                            bank: p.bank,
                            date: p.date,
                            amount: p.amount,
                            period: p.period || ((p as any).tenureStart && (p as any).tenureEnd ? `${(p as any).tenureStart} to ${(p as any).tenureEnd}` : `Cheque ${idx + 1}`),
                            tenureStart: (p as any).tenureStart || addDays(new Date(lease.startDate || today), idx * 30),
                            tenureEnd: (p as any).tenureEnd || addDays(new Date(lease.startDate || today), idx * 30 + 29),
                          })) : Array.from({ length: lease.pdcCount || 12 }, (_, i) => ({
                            chequeNo: `PDC-${lease.unit.replace(/\W/g, "")}-${String(i + 1).padStart(3, "0")}`,
                            bank: "QNB",
                            date: addDays(new Date(lease.startDate || today), i * 30),
                            amount: i === (lease.pdcCount || 12) - 1 ? Math.max(0, pdcTot - lease.monthlyRent * ((lease.pdcCount || 12) - 1)) : lease.monthlyRent,
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
                rows={leases.map((lease) => {
                  const notice = keyNotices.find((item) => item.leaseId === lease.id);
                  const handover = handovers.find((item) => item.leaseId === lease.id);
                  const checkIn = inspections.find((item) => item.leaseId === lease.id && item.type === "check_in");
                  return [
                    `${lease.tenantName} / ${lease.unit}`,
                    <StatusBadge key="status" value={lease.status} />,
                    notice ? (
                      <div key="notice" className="flex flex-col gap-1">
                        <StatusBadge value={notice.status} />
                        {notice.handoverAt && <span className="text-xs text-muted-foreground">{notice.handoverAt} {notice.handoverTime}</span>}
                      </div>
                    ) : "-",
                    handover ? (
                      <div key="handover" className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full px-2 py-0.5 w-fit">✅ Handed Over</span>
                        <span className="text-xs text-muted-foreground">{handover.keys}× {handover.keyType || "keys"} · {handover.accessCards} cards</span>
                        {handover.handoverAt && <span className="text-xs text-muted-foreground">{handover.handoverAt}</span>}
                      </div>
                    ) : "-",
                    checkIn ? (
                      <div key="checkin" className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full px-2 py-0.5 w-fit">🏠 Checked In</span>
                        <span className="text-xs text-muted-foreground">{checkIn.condition} · {checkIn.photos} photos</span>
                      </div>
                    ) : "-",
                    <div key="actions" className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setKeysWorkflowLease(lease); setKeyNotifyForm({ handoverAt: addDays(today, 1), handoverTime: "10:00", recipients: ["Tenant", "Property Manager", "Concerned Property Staff", "Security", "Maintenance"], authorizedCollector: lease.tenantName, keysSummary: "2 metal keys, 2 access cards, 1 parking remote", staffContact: "Property Manager - +974 4400 2200", outstandingRequirements: "None", note: "" }); setKeyNotifyOpen(true); }}>Notify</Button>
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
                          collectorName: notice?.authorizedCollector || lease.tenantName,
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
                rows={renewals.map((renewal) => {
                  const lease = leases.find((item) => item.id === renewal.leaseId);
                  return [
                    lease ? `${lease.tenantName} / ${lease.unit}` : "-",
                    lease?.endDate || "-",
                    renewal.recipients,
                    `${renewal.proposedPeriod}; ${formatMoney(renewal.proposedRent)}; ${renewal.revisedTerms}`,
                    renewal.lastConfirmationDate,
                    renewal.outstandingObligations,
                    <StatusBadge key="status" value={renewal.status} />,
                    <div key="actions" className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedDiscussRenewal(renewal); setDiscussRenewalForm({ discussedRent: String(renewal.proposedRent), proposedPeriod: renewal.proposedPeriod, tenantResponse: "pending", notes: "", nextFollowUpDate: renewal.lastConfirmationDate }); setDiscussRenewalOpen(true); }}>Discuss</Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedRenewal(renewal); setRenewalResponseForm({ response: "confirm", confirmedRent: String(renewal.proposedRent), notes: "", updateStatus: "awaiting_response" }); setRenewalResponseOpen(true); }}>Renew</Button>
                      {lease && <Button size="sm" variant="outline" onClick={() => { setCheckoutWorkflowLease(lease); setStartCheckoutForm({ noticeDate: today.toISOString().split("T")[0], moveOutDate: lease.endDate, inspectionDate: addDays(new Date(lease.endDate), -3), outstandingCharges: "Pending finance confirmation", utilityClearanceRequirements: "Final utility clearance required before checkout closure", keyReturnRequirements: "Return all keys, access cards, parking remotes and property items", notes: "", missingItems: "", cleaningCharges: "0", restorationCharges: "0" }); setStartCheckoutOpen(true); }}>Non-Renew</Button>}
                    </div>,
                  ];
                })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checkout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Non-Renewal, Check-Out & Security Deposit Settlement</CardTitle>
              <CardDescription>Final inspection, finance clearance, key return and settlement close the lease and release the unit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DataTable
                columns={["Lease", "Notice", "Move-Out / Inspection", "Clearances", "Comparison", "Status", "Actions"]}
                rows={checkouts.map((checkout) => {
                  const lease = leases.find((item) => item.id === checkout.leaseId);
                  return [
                    lease ? `${lease.tenantName} / ${lease.unit}` : "-",
                    checkout.noticeDate,
                    `${checkout.moveOutDate} / ${checkout.inspectionDate}`,
                    `Finance ${checkout.financeClearance ? "OK" : "Pending"}, Utility ${checkout.utilityClearance ? "OK" : "Pending"}, Keys ${checkout.keysReturned ? "Returned" : "Pending"}`,
                    checkout.comparisonSummary,
                    <StatusBadge key="status" value={checkout.status} />,
                    <Button key="action" size="sm" variant="outline" onClick={() => { setSelectedCheckout(checkout); setCompleteCheckoutForm({ condition: "Good", electricityMeter: "", waterMeter: "", damages: "", missingItems: "", cleaningCharges: "0", restorationCharges: "0", outstandingRent: "0", damagesAmount: "0", utilityCharges: "0", otherDeductions: "0", photos: "0", checkoutPhotos: "", checkoutReportFile: "", handoverConditionSummary: "", finalConditionSummary: "", financeClearance: false, utilityClearance: false, keysReturned: false, unitDisposition: "Available" as any }); setCheckoutActiveTab("condition"); setCompleteCheckoutOpen(true); }} disabled={checkout.status === "ready_for_settlement" || checkout.status === "closed"}>Complete Inspection</Button>,
                  ];
                })}
              />
              <DataTable
                columns={["Lease", "Deposit", "Deductions", "Refund", "Approval", "Actions"]}
                rows={settlements.map((settlement) => {
                  const lease = leases.find((item) => item.id === settlement.leaseId);
                  const deductions = settlement.outstandingRent + settlement.damages + settlement.utilityCharges
                    + (settlement.cleaningCharges || 0) + (settlement.restorationCharges || 0) + settlement.otherDeductions;
                  const refund = Math.max(0, settlement.depositReceived - deductions);
                  return [
                    lease ? `${lease.tenantName} / ${lease.unit}` : "-",
                    formatMoney(settlement.depositReceived),
                    formatMoney(deductions),
                    formatMoney(refund),
                    <StatusBadge key="status" value={settlement.approval} />,
                    <Button key="action" size="sm" variant="outline" disabled={settlement.approval === "paid"} onClick={() => openSettleRefundModal(settlement)}>
                      {settlement.approval === "paid" ? "Settled" : "Settle & Refund"}
                    </Button>,
                  ];
                })}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vouchers">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Detailed Voucher Accounting</CardTitle>
                  <CardDescription>Named financial documents model rent receipt, deposit, PDC clearance, cheque return, rental income and settlement. Vouchers posted here are automatically synced to Finance.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => { setAddVoucherForm(f => ({ ...f, leaseId: leases[0]?.id || "" })); setAddVoucherOpen(true); }}>
                    <Banknote className="mr-2 h-4 w-4" /> Add Voucher
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={["Voucher / Receipt", "Lease", "Method / Period", "Debit", "Credit", "Amount", "Status", "Actions"]}
                rows={vouchers.map((voucher) => {
                  const lease = leases.find((item) => item.id === voucher.leaseId);
                  return [
                    `${voucher.name} / ${voucher.receiptNo || "-"}`,
                    lease ? `${lease.tenantName} / ${lease.unit}` : voucher.leaseId,
                    `${voucher.method || "-"} / ${voucher.period || "-"}`,
                    voucher.debit,
                    voucher.credit,
                    formatMoney(voucher.amount),
                    <StatusBadge key="status" value={voucher.status} />,
                    <div key="actions" className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        const isSecurity = voucher.name.includes("Security Deposit") || voucher.name.includes("Deposit");
                        const receiptData: TenantReceiptDetails = {
                          receiptNo: voucher.receiptNo || voucher.id,
                          acknowledgementNo: `ACK-${voucher.receiptNo || voucher.id}`,
                          date: today.toISOString().split("T")[0],
                          tenantName: lease?.tenantName || "Valued Tenant",
                          tenantPhone: "",
                          tenantEmail: "",
                          tenantQid: "",
                          propertyName: lease?.property || "Old Salata - Residence No:23",
                          unitRef: lease?.unit || "Unit",
                          leaseNo: lease ? `LES-${lease.id.toUpperCase()}` : `LES-GEN`,
                          leaseStartDate: lease?.startDate || today.toISOString().split("T")[0],
                          leaseEndDate: lease?.endDate || today.toISOString().split("T")[0],
                          monthlyRent: lease?.monthlyRent || voucher.amount,
                          totalContractRent: lease ? lease.monthlyRent * (lease.pdcCount || 12) : voucher.amount,
                          depositAmount: isSecurity ? voucher.amount : (lease?.securityDeposit || 0),
                          depositMode: voucher.method || "PDC",
                          pdcCount: voucher.method === "PDC" ? 1 : 0,
                          pdcs: voucher.method === "PDC" ? [{
                            chequeNo: voucher.receiptNo || "CHQ-001",
                            bank: "QNB",
                            date: today.toISOString().split("T")[0],
                            amount: voucher.amount,
                            period: voucher.period || "Rent"
                          }] : [],
                          vouchers: [{
                            receiptNo: voucher.receiptNo || voucher.id,
                            name: voucher.name,
                            amount: voucher.amount,
                            method: voucher.method || "PDC",
                            debit: voucher.debit,
                            credit: voucher.credit
                          }],
                          totalCollected: voucher.amount,
                          cashierName: "Finance Department",
                          notes: `Official receipt for ${voucher.name} (${voucher.method || "Voucher"}).`,
                        };
                        setReceiptModalData(receiptData);
                        setReceiptModalOpen(true);
                      }}>
                        <Printer className="h-3.5 w-3.5 mr-1" /> Receipt
                      </Button>
                      <Button size="sm" variant="outline" disabled={voucher.status !== "draft"} onClick={async () => {
                        setVouchers((items) => items.map((item) => item.id === voucher.id ? { ...item, status: "posted" } : item));
                        try {
                          const accountCode = (label: string) => {
                            if (label.includes("Cash In Hand")) return "12100";
                            if (label.includes("Bank Account")) return "12000";
                            if (label.includes("PDC In Hand")) return "12900";
                            if (label.includes("Security Deposit Liability")) return "21500";
                            if (label.includes("Customer(PDC)")) return "21400";
                            if (label.includes("Receivable")) return "12413";
                            if (label.includes("Rental Income")) return "41100";
                            if (label.includes("Payable")) return "21000";
                            return "12000";
                          };
                          await postVoucher({
                            voucher_date: today.toISOString().split("T")[0],
                            voucher_type: voucher.name.includes("Deposit") ? "Deposit" : voucher.name.includes("Payment") ? "Payment" : "Receipt",
                            reference_no: voucher.receiptNo || voucher.id,
                            source_type: "LEASING_VOUCHER",
                            description: `${voucher.name} | ${voucher.debit} -> ${voucher.credit}`,
                            lines: [
                              { account_code: accountCode(voucher.debit), debit: Number(voucher.amount || 0), credit: 0, description: voucher.debit },
                              { account_code: accountCode(voucher.credit), debit: 0, credit: Number(voucher.amount || 0), description: voucher.credit },
                            ],
                          });
                        } catch (e) {
                          console.warn("Central finance posting failed:", e);
                        }
                      }}>Post</Button>
                      <Button size="sm" variant="outline" disabled={voucher.status === "draft" || voucher.status === "shared"} onClick={() => setVouchers((items) => items.map((item) => item.id === voucher.id ? { ...item, status: "shared" } : item))}>Share</Button>
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
    </div>
  );
}

function Metric({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs font-medium uppercase text-muted-foreground">{label}</CardTitle>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
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

function StatusBadge({ value }: { value: string }) {
  const normalized = value.replace(/_/g, " ");
  const tone =
    value.includes("verified") || value.includes("active") || value.includes("sent") || value.includes("posted") || value.includes("paid")
      ? "border-green-200 bg-green-50 text-green-700"
      : value.includes("pending") || value.includes("awaiting") || value.includes("draft") || value.includes("reserved")
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : value.includes("rejected") || value.includes("blocked") || value.includes("duplicate") || value.includes("expired")
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
