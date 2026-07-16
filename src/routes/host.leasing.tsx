import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  BadgeCheck,
  Banknote,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  DoorOpen,
  FileCheck2,
  FileSignature,
  KeyRound,
  Loader2,
  Lock,
  Receipt,
  RefreshCw,
  ShieldCheck,
  UserPlus,
  Wallet,
  XCircle,
} from "lucide-react";
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

export const Route = createFileRoute("/host/leasing")({
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
  mobile: string;
  email: string;
  status: CustomerStatus;
};

type Reservation = {
  id: string;
  property: string;
  unit: string;
  tenantName: string;
  agent: string;
  startDate: string;
  validUntil: string;
  rent: number;
  status: ReservationStatus;
  remarks: string;
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
  paymentFrequency: "monthly" | "quarterly" | "half_yearly" | "yearly";
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
};

type Pdc = {
  id: string;
  leaseId: string;
  chequeNo: string;
  bank: string;
  date: string;
  amount: number;
  status: PdcStatus;
};

type KeyNotice = {
  id: string;
  leaseId: string;
  recipient: string;
  handoverAt: string;
  status: "ready" | "sent" | "blocked";
  note: string;
};

type KeyHandover = {
  id: string;
  leaseId: string;
  keys: number;
  accessCards: number;
  parkingRemotes: number;
  meterInfo: string;
  acknowledged: boolean;
  issuedBy: string;
};

type Inspection = {
  id: string;
  leaseId: string;
  type: "check_in" | "check_out";
  condition: string;
  electricityMeter: string;
  waterMeter: string;
  damages: string;
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
  lastConfirmationDate: string;
  outstandingObligations: string;
  recipients: string;
};

type CheckoutCase = {
  id: string;
  leaseId: string;
  noticeDate: string;
  moveOutDate: string;
  inspectionDate: string;
  comparisonSummary: string;
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
  otherDeductions: number;
  approval: "draft" | "pending_approval" | "approved" | "paid";
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

const today = new Date("2026-07-16");

const initialUnits: Unit[] = [
  { id: "u1", property: "Old Salata - Residence No:23", unit: "AAA - GF2", status: "Available", rent: 5500 },
  { id: "u2", property: "Old Salata - Residence No:23", unit: "AAA - Flat16", status: "Occupied", rent: 5100 },
  { id: "u3", property: "Old Salata - Residence No:13", unit: "Old Salata 2 - Flat04", status: "Available", rent: 4300 },
  { id: "u4", property: "Old Salata - Residence No:23", unit: "AAA - Flat21", status: "Occupied", rent: 6400 },
];

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
];

const initialPdcs: Pdc[] = [
  { id: "p1", leaseId: "l1", chequeNo: "CHQ-1001", bank: "QNB", date: "2026-08-01", amount: 5600, status: "received" },
  { id: "p2", leaseId: "l1", chequeNo: "CHQ-1002", bank: "QNB", date: "2026-09-01", amount: 5600, status: "received" },
  { id: "p3", leaseId: "l2", chequeNo: "CHQ-2001", bank: "Doha Bank", date: "2026-08-01", amount: 5500, status: "deposited" },
];

const initialVouchers: Voucher[] = [
  { id: "v1", leaseId: "l1", name: "Receipts Voucher - Rent", receiptNo: "RV-2025-1001", method: "PDC", period: "Oct 2025 - Sep 2026", debit: "PDC In Hand", credit: "Customer(PDC)-AAA Flat16", amount: 67200, status: "posted" },
  { id: "v2", leaseId: "l1", name: "Receipts Voucher - Deposit", receiptNo: "RV-2025-1002", method: "Cash", period: "Security deposit", debit: "Cash In Hand", credit: "Security Deposit Liability", amount: 5100, status: "posted" },
  { id: "v3", leaseId: "l1", name: "Rental Income Doc", receiptNo: "RID-2025-1001", method: "Batch", period: "Oct 2025", debit: "Receivable-AAA Flat16", credit: "Rental Income", amount: 5600, status: "draft" },
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

function LeasingPage() {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [documents, setDocuments] = useState<TenantDocument[]>(initialDocuments);
  const [leases, setLeases] = useState<Lease[]>(initialLeases);
  const [pdcs, setPdcs] = useState<Pdc[]>(initialPdcs);
  const [keyNotices, setKeyNotices] = useState<KeyNotice[]>([]);
  const [handovers, setHandovers] = useState<KeyHandover[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [renewals, setRenewals] = useState<RenewalCase[]>([]);
  const [checkouts, setCheckouts] = useState<CheckoutCase[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>(initialVouchers);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([
    {
      id: "a1",
      stage: "Receipt Generation",
      owner: "Finance",
      input: "Lease L1, PDC schedule, security deposit",
      approval: "Cashier posting",
      status: "Posted",
      output: "Rent and deposit receipts available for print/email/share",
      at: "2025-09-24",
    },
  ]);
  const [busyAction, setBusyAction] = useState("");

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

  // ── Signature Workflow Dialogs ─────────────────────────────────
  const [signatureWorkflowLease, setSignatureWorkflowLease] = useState<Lease | null>(null);

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
    chequeBank: "",
    depositAmount: "",
    depositMode: "Cash" as string,
    notes: "",
  });

  // Submit to Landlord
  const [submitLandlordOpen, setSubmitLandlordOpen] = useState(false);
  const [submitLandlordForm, setSubmitLandlordForm] = useState({
    submittedTo: "",
    submittedAt: today.toISOString().split("T")[0],
    docsSent: "Email",
    notes: "",
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
  const [keysWorkflowLease, setKeysWorkflowLease] = useState<Lease | null>(null);
  const [keyNotifyOpen, setKeyNotifyOpen] = useState(false);
  const [keyNotifyForm, setKeyNotifyForm] = useState({ handoverAt: addDays(today, 1), recipients: "Tenant, Property Manager, Security, Maintenance", note: "" });

  const [handoverOpen, setHandoverOpen] = useState(false);
  const [handoverForm, setHandoverForm] = useState({ keys: "2", accessCards: "2", parkingRemotes: "1", electricityMeterReading: "", waterMeterReading: "", issuedBy: "Property Manager", note: "" });

  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkInForm, setCheckInForm] = useState({ condition: "Good", electricityMeter: "", waterMeter: "", damages: "", photos: "8", note: "" });

  // ── Renewals Dialog ──────────────────────────────────────────────
  const [renewalResponseOpen, setRenewalResponseOpen] = useState(false);
  const [selectedRenewal, setSelectedRenewal] = useState<RenewalCase | null>(null);
  const [renewalResponseForm, setRenewalResponseForm] = useState({ response: "confirm" as "confirm" | "non_renewal", confirmedRent: "", notes: "" });

  // ── Checkout Dialogs ─────────────────────────────────────────────
  const [startCheckoutOpen, setStartCheckoutOpen] = useState(false);
  const [checkoutWorkflowLease, setCheckoutWorkflowLease] = useState<Lease | null>(null);
  const [startCheckoutForm, setStartCheckoutForm] = useState({ noticeDate: today.toISOString().split("T")[0], moveOutDate: "", inspectionDate: "", notes: "" });

  const [completeCheckoutOpen, setCompleteCheckoutOpen] = useState(false);
  const [selectedCheckout, setSelectedCheckout] = useState<CheckoutCase | null>(null);
  const [completeCheckoutForm, setCompleteCheckoutForm] = useState({ condition: "Repair required", electricityMeter: "", waterMeter: "", damages: "", outstandingRent: "0", damagesAmount: "650", utilityCharges: "220", otherDeductions: "0", photos: "12", financeClearance: false, utilityClearance: false, keysReturned: false });

  // ── PDC Add Dialog ───────────────────────────────────────────────
  const [addPdcOpen, setAddPdcOpen] = useState(false);
  const [pdcLeaseId, setPdcLeaseId] = useState("");
  const [pdcForm, setPdcForm] = useState({ chequeNo: "", bank: "", date: today.toISOString().split("T")[0], amount: "" });


  const [reservationForm, setReservationForm] = useState({
    unit: "AAA - GF2",
    tenantName: "",
    agent: "Marketing Agent",
    startDate: addDays(today, 10),
    validityDays: "7",
    rent: "5500",
    remarks: "",
  });

  const [customerForm, setCustomerForm] = useState({
    name: "",
    type: "individual" as Customer["type"],
    qatarId: "",
    passport: "",
    crNumber: "",
    mobile: "",
    email: "",
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

  function createReservation() {
    const unit = units.find((item) => item.unit === reservationForm.unit);
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

  function createCustomer() {
    const duplicate = customers.find((customer) =>
      [customer.qatarId, customer.passport, customer.crNumber, customer.mobile, customer.email]
        .filter(Boolean)
        .some((value) =>
          [customerForm.qatarId, customerForm.passport, customerForm.crNumber, customerForm.mobile, customerForm.email]
            .filter(Boolean)
            .includes(value),
        ),
    );
    const customer: Customer = {
      id: `c${customers.length + 1}`,
      ...customerForm,
      status: duplicate ? "duplicate" : "active",
    };
    setCustomers((items) => [customer, ...items]);
    if (!duplicate) {
      const requiredDocs = customer.type === "company" ? ["Commercial Registration", "Computer Card", "Authorized signatory documents"] : ["Qatar ID", "Passport copy", "Residence permit"];
      setDocuments((items) => [
        ...requiredDocs.map((name, index) => ({
          id: `d${documents.length + index + 1}`,
          customerId: customer.id,
          name,
          mandatory: true,
          status: "pending" as VerificationStatus,
          expiryDate: "",
          reviewer: "",
          remarks: "Awaiting upload",
        })),
        ...items,
      ]);
    }
    setCustomerForm({ name: "", type: "individual", qatarId: "", passport: "", crNumber: "", mobile: "", email: "" });
    recordAudit({
      stage: "Customer Master",
      owner: "Leasing Department",
      input: `${customer.name}, duplicate keys checked`,
      approval: duplicate ? "Duplicate block" : "Customer activation",
      status: customer.status,
      output: duplicate ? "Customer marked duplicate for review" : "Tenant profile and mandatory document checklist created",
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
    const pdcTotal = lease.monthlyRent * lease.pdcCount;
    const nextPdcs = Array.from({ length: lease.pdcCount }, (_, index) => ({
      id: `p${pdcs.length + index + 1}`,
      leaseId: lease.id,
      chequeNo: `PDC-${lease.unit.replace(/\W/g, "")}-${index + 1}`,
      bank: collectForm.chequeBank || "Tenant Bank",
      date: addDays(new Date(lease.startDate), index * 30),
      amount: lease.monthlyRent,
      status: "received" as PdcStatus,
    }));
    setPdcs((items) => [...nextPdcs, ...items]);
    setVouchers((items) => [
      { id: `v${items.length + 1}`, leaseId: lease.id, name: "Receipts Voucher - Rent", receiptNo: `RV-${lease.id}-01`, method: collectForm.paymentMode, period: `${lease.startDate} to ${lease.endDate}`, debit: "PDC In Hand", credit: `Customer(PDC)-${lease.unit}`, amount: pdcTotal, status: "posted" },
      { id: `v${items.length + 2}`, leaseId: lease.id, name: "Receipts Voucher - Deposit", receiptNo: `RV-${lease.id}-02`, method: collectForm.depositMode, period: "Security deposit", debit: "Cash In Hand", credit: "Security Deposit Liability", amount: Number(collectForm.depositAmount) || lease.securityDeposit, status: "posted" },
      ...items,
    ]);
    advanceLease(lease, "collection_completed", { collectionCompleted: true });
    recordAudit({
      stage: "Collection & Receipt Generation",
      owner: "Finance Cashier",
      input: `${lease.pdcCount} PDCs (${collectForm.chequeBank}), deposit ${collectForm.depositMode}`,
      approval: "Cashier receipt posting",
      status: "collection_completed",
      output: collectForm.notes || "Rent and deposit receipts generated",
    });
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
      output: submitLandlordForm.notes || "Lease package submitted to landlord for signature",
    });
    setSubmitLandlordOpen(false);
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

  function issueKeyNotice(lease: Lease) {
    const blocked = !(lease.status === "fully_signed" && lease.collectionCompleted);
    const notice: KeyNotice = {
      id: `kn${keyNotices.length + 1}`,
      leaseId: lease.id,
      recipient: `${lease.tenantName}, Property Manager, Security, Maintenance`,
      handoverAt: addDays(today, 1),
      status: blocked ? "blocked" : "sent",
      note: blocked ? "Lease must be fully signed and collection completed" : "Key issue approved",
    };
    setKeyNotices((items) => [notice, ...items]);
    if (!blocked) advanceLease(lease, "active");
    recordAudit({
      stage: "Key Issue Notification",
      owner: "Leasing Department",
      input: `${lease.tenantName}, ${lease.unit}, handover ${notice.handoverAt}`,
      approval: blocked ? "Blocked by lease gate" : "Fully signed and collected",
      status: notice.status,
      output: blocked ? notice.note : "Tenant, property manager, security and facility team notified",
    });
  }

  function completeHandover(lease: Lease) {
    setHandovers((items) => [
      {
        id: `kh${items.length + 1}`,
        leaseId: lease.id,
        keys: 2,
        accessCards: 2,
        parkingRemotes: 1,
        meterInfo: "Electricity and water readings captured",
        acknowledged: true,
        issuedBy: "Property Manager",
      },
      ...items,
    ]);
    recordAudit({
      stage: "Key Handover",
      owner: "Property Manager",
      input: `${lease.unit}, keys/access cards/parking remote, meter readings`,
      approval: "Tenant and staff acknowledgement",
      status: "acknowledged",
      output: "Key handover form completed",
    });
  }

  function completeCheckIn(lease: Lease) {
    setInspections((items) => [
      {
        id: `ci${items.length + 1}`,
        leaseId: lease.id,
        type: "check_in",
        condition: "Good; furniture, appliances, fixtures, walls, floor, ceiling, doors, windows and AC checked",
        electricityMeter: "182167",
        waterMeter: "149089",
        damages: "Existing wall marks recorded; maintenance ticket assigned for paint touch-up",
        acknowledged: true,
        photos: 8,
      },
      ...items,
    ]);
    setUnits((items) => items.map((item) => (item.unit === lease.unit ? { ...item, status: "Occupied" } : item)));
    recordAudit({
      stage: "Check-In Process",
      owner: "Property Manager",
      input: "Unit condition, meter readings, photos/videos, pending maintenance",
      approval: "Tenant acknowledgement",
      status: "completed",
      output: "Check-in report completed and unit marked occupied",
    });
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
        proposedPeriod: `${addDays(new Date(lease.endDate), 1)} to ${addDays(new Date(lease.endDate), 366)}`,
        revisedTerms: f.revisedTerms || `${f.rentIncreasePercent}% rent revision, ${lease.noticePeriodDays}-day notice period retained`,
        lastConfirmationDate: addDays(new Date(lease.endDate), -(Number(f.lastConfirmationDays) || 30)),
        outstandingObligations: "Finance to confirm outstanding rent, PDC and maintenance obligations",
        recipients: `Tenant, Leasing Department, Marketing Agent, Property Manager, Landlord${f.additionalRecipients ? `, ${f.additionalRecipients}` : ""}`,
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
        output: `${next.length} renewal notice(s) generated with proposed terms and recipients`,
      });
    } else {
      alert("No leases are due for renewal within 60 days, or notices have already been generated.");
    }
  }

  function renewLease(renewal: RenewalCase) {
    const oldLease = leases.find((item) => item.id === renewal.leaseId);
    if (!oldLease) return;
    const renewed: Lease = {
      ...oldLease,
      id: `l${leases.length + 1}`,
      renewalOf: oldLease.id,
      startDate: addDays(new Date(oldLease.endDate), 1),
      endDate: addDays(new Date(oldLease.endDate), 366),
      monthlyRent: renewal.proposedRent,
      status: "documents_pending",
      tenantSignedAt: undefined,
      landlordSignedAt: undefined,
      signedDocument: undefined,
      receivedBy: undefined,
      landlordPackageSubmittedAt: undefined,
      sharedWithTenant: false,
      collectionCompleted: false,
    };
    setLeases((items) => [renewed, ...items.map((item) => (item.id === oldLease.id ? { ...item, status: "renewed" } : item))]);
    setRenewals((items) => items.map((item) => (item.id === renewal.id ? { ...item, status: "renewal_confirmed" } : item)));
    recordAudit({
      stage: "Lease Renewal Process",
      owner: "Leasing Department",
      input: `${oldLease.tenantName}, renewed period ${renewal.proposedPeriod}`,
      approval: "Renewal confirmation",
      status: "renewal_confirmed",
      output: "Renewed lease linked to previous lease history",
    });
  }

  function startCheckout(lease: Lease) {
    setLeases((items) => items.map((item) => (item.id === lease.id ? { ...item, status: "checkout" } : item)));
    setCheckouts((items) => [
      {
        id: `co${items.length + 1}`,
        leaseId: lease.id,
        noticeDate: today.toISOString().split("T")[0],
        moveOutDate: lease.endDate,
        inspectionDate: addDays(new Date(lease.endDate), -3),
        comparisonSummary: "Pending final comparison with original check-in report",
        financeClearance: false,
        utilityClearance: false,
        keysReturned: false,
        status: "planned",
      },
      ...items,
    ]);
    recordAudit({
      stage: "Non-Renewal & Check-Out",
      owner: "Leasing Department",
      input: `${lease.tenantName}, notice date ${today.toISOString().split("T")[0]}, planned move-out ${lease.endDate}`,
      approval: "Tenant non-renewal notice",
      status: "planned",
      output: "Checkout case opened with finance, utility and key return requirements",
    });
  }

  function completeCheckout(checkout: CheckoutCase) {
    const lease = leases.find((item) => item.id === checkout.leaseId);
    if (!lease) return;
    setCheckouts((items) =>
      items.map((item) =>
        item.id === checkout.id
          ? { ...item, financeClearance: true, utilityClearance: true, keysReturned: true, status: "ready_for_settlement" }
          : item,
      ),
    );
    setInspections((items) => [
      {
        id: `coi${items.length + 1}`,
        leaseId: lease.id,
        type: "check_out",
        condition: "Repair required; compared with original check-in report",
        electricityMeter: "182207",
        waterMeter: "149129",
        damages: "Tenant-caused paint damage, AC remote missing, cleaning/restoration required; normal wear excluded",
        acknowledged: true,
        photos: 12,
      },
      ...items,
    ]);
    setCheckouts((items) =>
      items.map((item) =>
        item.id === checkout.id
          ? { ...item, comparisonSummary: "Normal wear separated from tenant-caused damages, missing items and utility balances" }
          : item,
      ),
    );
    setSettlements((items) => [
      {
        id: `s${items.length + 1}`,
        leaseId: lease.id,
        depositReceived: lease.securityDeposit,
        outstandingRent: 0,
        damages: 650,
        utilityCharges: 220,
        otherDeductions: 0,
        approval: "pending_approval",
      },
      ...items,
    ]);
    recordAudit({
      stage: "Check-Out Inspection",
      owner: "Property Manager",
      input: "Original check-in report, final condition, keys, utilities, missing items",
      approval: "Tenant acknowledgement",
      status: "ready_for_settlement",
      output: "Settlement draft created with deductions",
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
      setUnits((items) => items.map((item) => (item.unit === lease.unit ? { ...item, status: "Available" } : item)));
    }
    recordAudit({
      stage: "Security Deposit Settlement & Lease Closure",
      owner: "Finance Department",
      input: `Deposit ${formatMoney(settlement.depositReceived)}, refund ${formatMoney(refundable)}`,
      approval: "Settlement approval",
      status: "closed",
      output: "Refund processed, lease closed, unit released and history retained",
    });
  }

  return (
    <div className="space-y-6">

      {/* ── CREATE LEASE DIALOG ───────────────────────────────────── */}
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
            <Field label="Signed Document Reference / Filename">
              <Input value={tenantSignForm.signedDocument} onChange={e => setTenantSignForm(f => ({ ...f, signedDocument: e.target.value }))} placeholder={`tenant-signed-${signatureWorkflowLease?.id}.pdf`} />
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /> Collect Rent & PDC</DialogTitle>
            <DialogDescription>Record PDC collection and security deposit for {signatureWorkflowLease?.tenantName} — {signatureWorkflowLease?.pdcCount} PDCs × QR {signatureWorkflowLease?.monthlyRent?.toLocaleString()}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rent Payment Mode">
                <Select value={collectForm.paymentMode} onValueChange={v => setCollectForm(f => ({ ...f, paymentMode: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDC">PDC (Cheques)</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Guarantee Cheque">Guarantee Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Bank Name (for PDC)">
                <Input value={collectForm.chequeBank} onChange={e => setCollectForm(f => ({ ...f, chequeBank: e.target.value }))} placeholder="e.g. QNB, Doha Bank" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Security Deposit Mode">
                <Select value={collectForm.depositMode} onValueChange={v => setCollectForm(f => ({ ...f, depositMode: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="PDC">PDC</SelectItem>
                    <SelectItem value="Guarantee Cheque">Guarantee Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Security Deposit Amount">
                <Input type="number" value={collectForm.depositAmount} onChange={e => setCollectForm(f => ({ ...f, depositAmount: e.target.value }))} placeholder={`${signatureWorkflowLease?.securityDeposit}`} />
              </Field>
            </div>
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <p>📦 {signatureWorkflowLease?.pdcCount} PDC cheques will be auto-generated and vouchers will be posted.</p>
            </div>
            <Field label="Notes">
              <Textarea rows={2} value={collectForm.notes} onChange={e => setCollectForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes..." />
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
            <Field label="Signed Document Reference">
              <Input value={landlordSignForm.signedDocument} onChange={e => setLandlordSignForm(f => ({ ...f, signedDocument: e.target.value }))} placeholder={`fully-signed-${signatureWorkflowLease?.id}.pdf`} />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /> Key Issue Notification</DialogTitle>
            <DialogDescription>Send handover notification to tenant and all responsible parties for {keysWorkflowLease?.tenantName} — {keysWorkflowLease?.unit}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Planned Handover Date">
              <Input type="date" value={typeof keyNotifyForm.handoverAt === "string" ? keyNotifyForm.handoverAt : keyNotifyForm.handoverAt.toISOString().split("T")[0]} onChange={e => setKeyNotifyForm(f => ({ ...f, handoverAt: e.target.value }))} />
            </Field>
            <Field label="Recipients">
              <Input value={keyNotifyForm.recipients} onChange={e => setKeyNotifyForm(f => ({ ...f, recipients: e.target.value }))} />
            </Field>
            <Field label="Special Instructions / Note">
              <Textarea rows={2} value={keyNotifyForm.note} onChange={e => setKeyNotifyForm(f => ({ ...f, note: e.target.value }))} placeholder="Any special access or coordination instructions..." />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyNotifyOpen(false)}>Cancel</Button>
            <Button onClick={() => keysWorkflowLease && issueKeyNotice(keysWorkflowLease)}><Bell className="mr-2 h-4 w-4" /> Send Notification</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── KEY HANDOVER DIALOG ───────────────────────────────── */}
      <Dialog open={handoverOpen} onOpenChange={setHandoverOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Key className="h-5 w-5 text-primary" /> Key Handover</DialogTitle>
            <DialogDescription>Record key issue details for {keysWorkflowLease?.tenantName} — {keysWorkflowLease?.unit}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Keys Issued"><Input type="number" value={handoverForm.keys} onChange={e => setHandoverForm(f => ({ ...f, keys: e.target.value }))} /></Field>
              <Field label="Access Cards"><Input type="number" value={handoverForm.accessCards} onChange={e => setHandoverForm(f => ({ ...f, accessCards: e.target.value }))} /></Field>
              <Field label="Parking Remotes"><Input type="number" value={handoverForm.parkingRemotes} onChange={e => setHandoverForm(f => ({ ...f, parkingRemotes: e.target.value }))} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Electricity Meter Reading"><Input value={handoverForm.electricityMeterReading} onChange={e => setHandoverForm(f => ({ ...f, electricityMeterReading: e.target.value }))} placeholder="e.g. 182167" /></Field>
              <Field label="Water Meter Reading"><Input value={handoverForm.waterMeterReading} onChange={e => setHandoverForm(f => ({ ...f, waterMeterReading: e.target.value }))} placeholder="e.g. 149089" /></Field>
            </div>
            <Field label="Issued By">
              <Select value={handoverForm.issuedBy} onValueChange={v => setHandoverForm(f => ({ ...f, issuedBy: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Property Manager">Property Manager</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Notes / Observations">
              <Textarea rows={2} value={handoverForm.note} onChange={e => setHandoverForm(f => ({ ...f, note: e.target.value }))} placeholder="Any notes on handover..." />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHandoverOpen(false)}>Cancel</Button>
            <Button onClick={() => keysWorkflowLease && completeHandover(keysWorkflowLease)}><Key className="mr-2 h-4 w-4" /> Confirm Handover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── CHECK-IN DIALOG ───────────────────────────────────── */}
      <Dialog open={checkInOpen} onOpenChange={setCheckInOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-primary" /> Check-In Inspection</DialogTitle>
            <DialogDescription>Record unit condition and meter readings at the start of tenancy for {keysWorkflowLease?.tenantName}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Field label="Overall Condition">
              <Select value={checkInForm.condition} onValueChange={v => setCheckInForm(f => ({ ...f, condition: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Excellent">Excellent</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Needs Repair">Needs Repair</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Electricity Meter"><Input value={checkInForm.electricityMeter} onChange={e => setCheckInForm(f => ({ ...f, electricityMeter: e.target.value }))} placeholder="e.g. 182167" /></Field>
              <Field label="Water Meter"><Input value={checkInForm.waterMeter} onChange={e => setCheckInForm(f => ({ ...f, waterMeter: e.target.value }))} placeholder="e.g. 149089" /></Field>
            </div>
            <Field label="No. of Photos Taken"><Input type="number" value={checkInForm.photos} onChange={e => setCheckInForm(f => ({ ...f, photos: e.target.value }))} /></Field>
            <Field label="Damages / Remarks">
              <Textarea rows={2} value={checkInForm.damages} onChange={e => setCheckInForm(f => ({ ...f, damages: e.target.value }))} placeholder="Existing marks, pending items..." />
            </Field>
            <Field label="Additional Notes">
              <Textarea rows={2} value={checkInForm.note} onChange={e => setCheckInForm(f => ({ ...f, note: e.target.value }))} placeholder="Tenant observations, signed acknowledgement..." />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckInOpen(false)}>Cancel</Button>
            <Button onClick={() => keysWorkflowLease && completeCheckIn(keysWorkflowLease)}><ClipboardCheck className="mr-2 h-4 w-4" /> Complete Check-In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── RENEWAL RESPONSE DIALOG ───────────────────────────── */}
      <Dialog open={renewalResponseOpen} onOpenChange={setRenewalResponseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><RefreshCw className="h-5 w-5 text-primary" /> Tenant Renewal Response</DialogTitle>
            <DialogDescription>Record tenant's decision regarding lease renewal.</DialogDescription>
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

      {/* ── COMPLETE CHECKOUT DIALOG ──────────────────────────── */}
      <Dialog open={completeCheckoutOpen} onOpenChange={setCompleteCheckoutOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-primary" /> Check-Out Inspection & Clearances</DialogTitle>
            <DialogDescription>Record final unit condition, deductions and clearance status for settlement.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-2">
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
            <div className="grid grid-cols-2 gap-3">
              <Field label="Final Electricity Meter"><Input value={completeCheckoutForm.electricityMeter} onChange={e => setCompleteCheckoutForm(f => ({ ...f, electricityMeter: e.target.value }))} placeholder="e.g. 182207" /></Field>
              <Field label="Final Water Meter"><Input value={completeCheckoutForm.waterMeter} onChange={e => setCompleteCheckoutForm(f => ({ ...f, waterMeter: e.target.value }))} placeholder="e.g. 149129" /></Field>
            </div>
            <Field label="Damages / Missing Items">
              <Textarea rows={2} value={completeCheckoutForm.damages} onChange={e => setCompleteCheckoutForm(f => ({ ...f, damages: e.target.value }))} placeholder="Tenant-caused damage, missing items..." />
            </Field>
            <Field label="No. of Photos"><Input type="number" value={completeCheckoutForm.photos} onChange={e => setCompleteCheckoutForm(f => ({ ...f, photos: e.target.value }))} /></Field>
            <div className="rounded-md border p-3 space-y-2">
              <p className="text-sm font-medium">Settlement Deductions (QR)</p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Outstanding Rent"><Input type="number" value={completeCheckoutForm.outstandingRent} onChange={e => setCompleteCheckoutForm(f => ({ ...f, outstandingRent: e.target.value }))} /></Field>
                <Field label="Damage Costs"><Input type="number" value={completeCheckoutForm.damagesAmount} onChange={e => setCompleteCheckoutForm(f => ({ ...f, damagesAmount: e.target.value }))} /></Field>
                <Field label="Utility Charges"><Input type="number" value={completeCheckoutForm.utilityCharges} onChange={e => setCompleteCheckoutForm(f => ({ ...f, utilityCharges: e.target.value }))} /></Field>
                <Field label="Other Deductions"><Input type="number" value={completeCheckoutForm.otherDeductions} onChange={e => setCompleteCheckoutForm(f => ({ ...f, otherDeductions: e.target.value }))} /></Field>
              </div>
            </div>
            <div className="rounded-md border p-3 space-y-2">
              <p className="text-sm font-medium">Clearances</p>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={completeCheckoutForm.financeClearance} onChange={e => setCompleteCheckoutForm(f => ({ ...f, financeClearance: e.target.checked }))} className="h-4 w-4" /> Finance Cleared</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={completeCheckoutForm.utilityClearance} onChange={e => setCompleteCheckoutForm(f => ({ ...f, utilityClearance: e.target.checked }))} className="h-4 w-4" /> Utility Cleared</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={completeCheckoutForm.keysReturned} onChange={e => setCompleteCheckoutForm(f => ({ ...f, keysReturned: e.target.checked }))} className="h-4 w-4" /> Keys Returned</label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteCheckoutOpen(false)}>Cancel</Button>
            <Button onClick={() => selectedCheckout && completeCheckout(selectedCheckout)}><ClipboardCheck className="mr-2 h-4 w-4" /> Complete & Generate Settlement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ADD PDC DIALOG ────────────────────────────────────── */}
      <Dialog open={addPdcOpen} onOpenChange={setAddPdcOpen}>
        <DialogContent>
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
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cheque No."><Input value={pdcForm.chequeNo} onChange={e => setPdcForm(f => ({ ...f, chequeNo: e.target.value }))} placeholder="e.g. PDC-GF1-001" /></Field>
              <Field label="Bank"><Input value={pdcForm.bank} onChange={e => setPdcForm(f => ({ ...f, bank: e.target.value }))} placeholder="e.g. QNB" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cheque Date"><Input type="date" value={pdcForm.date} onChange={e => setPdcForm(f => ({ ...f, date: e.target.value }))} /></Field>
              <Field label="Amount (QR)"><Input type="number" value={pdcForm.amount} onChange={e => setPdcForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g. 5600" /></Field>
            </div>
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
          <h2 className="text-2xl font-bold tracking-tight">Lease Lifecycle</h2>
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

      <LifecycleRail />

      <Tabs defaultValue="reservations" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
          <TabsTrigger value="customers">Customer Master</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="agreement">Agreement Terms</TabsTrigger>
          <TabsTrigger value="signatures">Signatures</TabsTrigger>
          <TabsTrigger value="keys">Keys & Check-In</TabsTrigger>
          <TabsTrigger value="renewals">Renewals</TabsTrigger>
          <TabsTrigger value="checkout">Checkout</TabsTrigger>
          <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
          <TabsTrigger value="audit">Audit Flow</TabsTrigger>
          <TabsTrigger value="masters">Masters</TabsTrigger>
        </TabsList>

        <TabsContent value="reservations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Unit Reservation - Lease Module</CardTitle>
              <CardDescription>Reserving a unit locks it from Available to Reserved until conversion, expiry or release.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[320px_1fr]">
              <div className="space-y-3 rounded-md border p-4">
                <Field label="Unit">
                  <Select value={reservationForm.unit} onValueChange={(unit) => setReservationForm((form) => ({ ...form, unit }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => <SelectItem key={unit.id} value={unit.unit} disabled={unit.status !== "Available"}>{unit.unit} - {unit.status}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Prospective tenant"><Input value={reservationForm.tenantName} onChange={(event) => setReservationForm((form) => ({ ...form, tenantName: event.target.value }))} /></Field>
                <Field label="Lease start"><Input type="date" value={reservationForm.startDate} onChange={(event) => setReservationForm((form) => ({ ...form, startDate: event.target.value }))} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Validity days"><Input type="number" value={reservationForm.validityDays} onChange={(event) => setReservationForm((form) => ({ ...form, validityDays: event.target.value }))} /></Field>
                  <Field label="Rent"><Input type="number" value={reservationForm.rent} onChange={(event) => setReservationForm((form) => ({ ...form, rent: event.target.value }))} /></Field>
                </div>
                <Field label="Remarks"><Textarea value={reservationForm.remarks} onChange={(event) => setReservationForm((form) => ({ ...form, remarks: event.target.value }))} /></Field>
                <Button className="w-full" onClick={() => withBusy("reserve", createReservation)}>
                  {busyAction === "reserve" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                  Reserve Unit
                </Button>
              </div>
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
            <CardHeader>
              <CardTitle>Customer Master With Duplicate Validation</CardTitle>
              <CardDescription>Duplicate checks run across Qatar ID, passport, CR number, mobile and email before activation.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[320px_1fr]">
              <div className="space-y-3 rounded-md border p-4">
                <Field label="Name"><Input value={customerForm.name} onChange={(event) => setCustomerForm((form) => ({ ...form, name: event.target.value }))} /></Field>
                <Field label="Type">
                  <Select value={customerForm.type} onValueChange={(type: Customer["type"]) => setCustomerForm((form) => ({ ...form, type }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="individual">Individual</SelectItem><SelectItem value="company">Company</SelectItem></SelectContent>
                  </Select>
                </Field>
                <Field label="Qatar ID"><Input value={customerForm.qatarId} onChange={(event) => setCustomerForm((form) => ({ ...form, qatarId: event.target.value }))} /></Field>
                <Field label="Passport"><Input value={customerForm.passport} onChange={(event) => setCustomerForm((form) => ({ ...form, passport: event.target.value }))} /></Field>
                <Field label="Commercial Registration"><Input value={customerForm.crNumber} onChange={(event) => setCustomerForm((form) => ({ ...form, crNumber: event.target.value }))} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Mobile"><Input value={customerForm.mobile} onChange={(event) => setCustomerForm((form) => ({ ...form, mobile: event.target.value }))} /></Field>
                  <Field label="Email"><Input value={customerForm.email} onChange={(event) => setCustomerForm((form) => ({ ...form, email: event.target.value }))} /></Field>
                </div>
                <Button className="w-full" onClick={() => withBusy("customer", createCustomer)}>
                  {busyAction === "customer" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  Save Customer
                </Button>
              </div>
              <DataTable
                columns={["Name", "Type", "Primary ID", "Contact", "Status"]}
                rows={customers.map((customer) => [
                  customer.name,
                  customer.type,
                  customer.qatarId || customer.passport || customer.crNumber || "-",
                  `${customer.mobile || "-"} / ${customer.email || "-"}`,
                  <StatusBadge key="status" value={customer.status} />,
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
                    <StatusBadge key="status" value={document.status} />,
                    document.reviewer || "-",
                    <div key="actions" className="flex justify-end gap-2">
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
            <CardHeader>
              <CardTitle>Lease Agreement Terms & Payment Schedule Rules</CardTitle>
              <CardDescription>Agreement data now includes payment frequency, PDC count, grace/penalty terms, maintenance, utilities, parking, special clauses and notice period.</CardDescription>
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
                    `Tenant: ${lease.tenantSignedAt || "-"}; file: ${lease.signedDocument || "-"}; received by: ${lease.receivedBy || "-"}; landlord package: ${lease.landlordPackageSubmittedAt || "-"}; shared: ${lease.sharedWithTenant ? "Yes" : "No"}`,
                    <div key="actions" className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" disabled={!docsVerified || lease.status !== "documents_verified"} onClick={() => { setSignatureWorkflowLease(lease); setTenantSignForm({ signedAt: today.toISOString().split("T")[0], signedDocument: "", receivedBy: "Leasing Department", remarks: "" }); setTenantSignOpen(true); }}>Tenant Sign</Button>
                      <Button size="sm" variant="outline" disabled={!lease.tenantSignedAt || lease.collectionCompleted} onClick={() => { setSignatureWorkflowLease(lease); setCollectForm({ paymentMode: "PDC", chequeBank: "", depositAmount: String(lease.securityDeposit), depositMode: "Cash", notes: "" }); setCollectOpen(true); }}>Collect</Button>
                      <Button size="sm" variant="outline" disabled={!lease.collectionCompleted || lease.status === "pending_landlord_signature" || lease.status === "fully_signed"} onClick={() => { setSignatureWorkflowLease(lease); setSubmitLandlordForm({ submittedTo: "", submittedAt: today.toISOString().split("T")[0], docsSent: "Email", notes: "" }); setSubmitLandlordOpen(true); }}>Submit Landlord</Button>
                      <Button size="sm" variant="outline" disabled={lease.status !== "pending_landlord_signature"} onClick={() => { setSignatureWorkflowLease(lease); setLandlordSignForm({ signedAt: today.toISOString().split("T")[0], signedBy: "", signedDocument: "", sharedWithTenant: true, remarks: "" }); setLandlordSignOpen(true); }}>Landlord Sign</Button>
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
                    notice ? <StatusBadge key="notice" value={notice.status} /> : "-",
                    handover ? `${handover.keys} keys, ${handover.accessCards} cards` : "-",
                    checkIn ? `${checkIn.condition}, ${checkIn.photos} photos` : "-",
                    <div key="actions" className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setKeysWorkflowLease(lease); setKeyNotifyForm({ handoverAt: addDays(today, 1), recipients: "Tenant, Property Manager, Security, Maintenance", note: "" }); setKeyNotifyOpen(true); }}>Notify</Button>
                      <Button size="sm" variant="outline" disabled={lease.status !== "active"} onClick={() => { setKeysWorkflowLease(lease); setHandoverForm({ keys: "2", accessCards: "2", parkingRemotes: "1", electricityMeterReading: "", waterMeterReading: "", issuedBy: "Property Manager", note: "" }); setHandoverOpen(true); }}>Handover</Button>
                      <Button size="sm" variant="outline" disabled={!handover} onClick={() => { setKeysWorkflowLease(lease); setCheckInForm({ condition: "Good", electricityMeter: handover?.meterInfo || "", waterMeter: "", damages: "", photos: "8", note: "" }); setCheckInOpen(true); }}>Check-In</Button>
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
                      <Button size="sm" variant="outline" onClick={() => setRenewals((items) => items.map((item) => item.id === renewal.id ? { ...item, status: "under_discussion" } : item))}>Discuss</Button>
                      <Button size="sm" variant="outline" onClick={() => { setSelectedRenewal(renewal); setRenewalResponseForm({ response: "confirm", confirmedRent: String(renewal.proposedRent), notes: "" }); setRenewalResponseOpen(true); }}>Renew</Button>
                      {lease && <Button size="sm" variant="outline" onClick={() => { setCheckoutWorkflowLease(lease); setStartCheckoutForm({ noticeDate: today.toISOString().split("T")[0], moveOutDate: lease.endDate, inspectionDate: addDays(new Date(lease.endDate), -3), notes: "" }); setStartCheckoutOpen(true); }}>Non-Renew</Button>}
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
                    <Button key="action" size="sm" variant="outline" onClick={() => { setSelectedCheckout(checkout); setCompleteCheckoutForm({ condition: "Repair required", electricityMeter: "", waterMeter: "", damages: "", outstandingRent: "0", damagesAmount: "650", utilityCharges: "220", otherDeductions: "0", photos: "12", financeClearance: false, utilityClearance: false, keysReturned: false }); setCompleteCheckoutOpen(true); }} disabled={checkout.status === "ready_for_settlement" || checkout.status === "closed"}>Complete Inspection</Button>,
                  ];
                })}
              />
              <DataTable
                columns={["Lease", "Deposit", "Deductions", "Refund", "Approval", "Actions"]}
                rows={settlements.map((settlement) => {
                  const lease = leases.find((item) => item.id === settlement.leaseId);
                  const deductions = settlement.outstandingRent + settlement.damages + settlement.utilityCharges + settlement.otherDeductions;
                  const refund = settlement.depositReceived - deductions;
                  return [
                    lease ? `${lease.tenantName} / ${lease.unit}` : "-",
                    formatMoney(settlement.depositReceived),
                    formatMoney(deductions),
                    formatMoney(refund),
                    <StatusBadge key="status" value={settlement.approval} />,
                    <Button key="action" size="sm" variant="outline" disabled={settlement.approval === "paid"} onClick={() => approveSettlement(settlement)}>Approve & Pay</Button>,
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
                  <CardDescription>Named financial documents model rent receipt, deposit, PDC clearance, cheque return, rental income and settlement.</CardDescription>
                </div>
                <Button size="sm" onClick={() => { setPdcLeaseId(leases[0]?.id || ""); setPdcForm({ chequeNo: "", bank: "", date: today.toISOString().split("T")[0], amount: "" }); setAddPdcOpen(true); }}>
                  <Receipt className="mr-2 h-4 w-4" /> Add PDC
                </Button>
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
                      <Button size="sm" variant="outline" disabled={voucher.status !== "draft"} onClick={() => setVouchers((items) => items.map((item) => item.id === voucher.id ? { ...item, status: "posted" } : item))}>Post</Button>
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

        <TabsContent value="masters">
          <div className="grid gap-4 lg:grid-cols-3">
            <MasterCard title="Reservation Status Master" icon={<Lock className="h-4 w-4" />} items={reservationStatusMasters} />
            <MasterCard title="Customer Identity Master" icon={<ShieldCheck className="h-4 w-4" />} items={customerIdentityMasters} />
            <MasterCard title="Document Verification Master" icon={<FileCheck2 className="h-4 w-4" />} items={documentVerificationMasters} />
            <MasterCard title="Lease Status Master" icon={<FileSignature className="h-4 w-4" />} items={leaseStatusMasters} />
            <MasterCard title="Key Handover Master" icon={<KeyRound className="h-4 w-4" />} items={keyHandoverMasters} />
            <MasterCard title="Settlement Master" icon={<Wallet className="h-4 w-4" />} items={securitySettlementMasters} />
            <MasterCard title="Voucher Document Master" icon={<Receipt className="h-4 w-4" />} items={voucherDocumentMasters} />
          </div>
        </TabsContent>
      </Tabs>
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
  return (
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
          ) : rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="align-middle">
              {row.map((cell, cellIndex) => (
                <td key={`${rowIndex}-${cellIndex}`} className="px-4 py-3 last:text-right">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
