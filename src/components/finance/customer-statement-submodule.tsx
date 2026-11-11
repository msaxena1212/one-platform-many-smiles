import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  FileText, Printer, Download, Search, Building2, Calendar,
  CreditCard, UserCheck, ShieldCheck, ArrowDownLeft, ArrowUpRight,
  Clock, AlertTriangle, CheckCircle2, ChevronRight, Hash, Phone,
  Mail, Landmark, FileSpreadsheet, Plus, RefreshCw, Filter, Scale
} from "lucide-react";
import { useAppData } from "@/lib/app-data-context";
import { useFinanceStore, type ReceivableInvoice } from "@/lib/finance/finance-store";
import { KAHRAMAA_DEPOSIT_BY_UNIT, resolvePropertyFromUnitCode } from "@/lib/finance/kahramaa-deposits-data";
import { InvoiceViewDialog } from "./invoice-view-dialog";
import { BulkInvoiceDialog } from "./bulk-invoice-dialog";
import { toast } from "sonner";
import { getDocumentBranding } from "@/lib/document-branding";
import { AL_AMEEN_PAGE1_HEADER_BASE64 } from "@/lib/header-banner-base64";
import { printBilingualCustomerStatement } from "@/lib/customer-statement-pdf";
import { QatarNationalAddressPill } from "@/components/common/qatar-national-address-badge";
import { openPrintable7DayLegalNotice, openPrintableRdcFilingPack } from "@/lib/qatar-legal-engine";

export interface StatementLedgerRow {
  id: string;
  date: string;
  docType: "INVOICE" | "RECEIPT" | "PDC_CLEARED" | "CREDIT_NOTE" | "OPENING_BALANCE" | "SECURITY_DEPOSIT";
  refNo: string;
  description: string;
  property: string;
  unit: string;
  debit: number;
  credit: number;
  runningBalance: number;
  status: "Paid" | "Pending" | "Overdue" | "Cleared" | "Settled";
  rawInvoice?: ReceivableInvoice;
}

interface CustomerStatementProps {
  initialCustomerId?: string;
  onSelectCustomer?: (customerId: string) => void;
  isDialogMode?: boolean;
}

function formatDateDDMMYYYY(d: string | undefined | null): string {
  if (!d) return "—";
  const s = String(d).trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const [yyyy, mm, dd] = s.split("-");
    return `${dd}-${mm}-${yyyy}`;
  }
  return String(d);
}

export function CustomerStatementSubModule({
  initialCustomerId,
  onSelectCustomer,
  isDialogMode = false,
}: CustomerStatementProps) {
  const { customers, leases, pdcs, units } = useAppData();
  const { receivableInvoices, vouchers } = useFinanceStore();
  const branding = useMemo(() => getDocumentBranding(), []);
  const bannerUrl = branding.headerImageUrl || AL_AMEEN_PAGE1_HEADER_BASE64;

  // Search & Selected Customer
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(() => {
    if (initialCustomerId) return initialCustomerId;
    if (customers.length > 0) {
      return String(customers[0].id || customers[0].customerId || "");
    }
    return "";
  });

  // Filter Date Range (wide default so end-of-month invoices like 31-10-2026 / 30-11-2026 are never hidden)
  const [fromDate, setFromDate] = useState<string>("2025-01-01");
  const [toDate, setToDate] = useState<string>("2027-12-31");
  const [unitFilter, setUnitFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [statementMode, setStatementMode] = useState<"receivables" | "deposit" | "pdc">("receivables");

  // Dialog states
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<ReceivableInvoice | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState<boolean>(false);

  // Filtered customer list for selection
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    const term = searchTerm.toLowerCase().trim();
    return customers.filter(c =>
      c.name.toLowerCase().includes(term) ||
      (c.customerId && c.customerId.toLowerCase().includes(term)) ||
      (c.qatarId && c.qatarId.includes(term)) ||
      (c.mobile && c.mobile.includes(term))
    );
  }, [customers, searchTerm]);

  // Current active customer profile
  const currentCustomer = useMemo(() => {
    if (!selectedCustomerId) return customers[0] || null;
    return customers.find(c =>
      String(c.id) === selectedCustomerId ||
      c.customerId === selectedCustomerId ||
      c.name === selectedCustomerId
    ) || customers[0] || null;
  }, [selectedCustomerId, customers]);

  // Leases for this customer
  const customerLeases = useMemo(() => {
    if (!currentCustomer) return [];
    const custName = (currentCustomer.name || "").trim().toLowerCase();
    const normCust = custName.replace(/^(ms\.|mr\.|mrs\.|dr\.|m\/s\.?)\s*/i, "").replace(/[^a-z0-9\s]/g, "").trim();
    const custTokens = normCust.split(/\s+/).filter(t => t.length >= 2);

    return leases.filter(l => {
      if (l.customerId && (l.customerId === currentCustomer.id || l.customerId === currentCustomer.customerId)) return true;
      const lTenant = (l.tenantName || (l as any).tenant_name || "").trim().toLowerCase();
      if (lTenant === custName) return true;
      if (lTenant) {
        const normLT = lTenant.replace(/^(ms\.|mr\.|mrs\.|dr\.|m\/s\.?)\s*/i, "").replace(/[^a-z0-9\s]/g, "").trim();
        if (normLT && normCust) {
          if (normCust.includes(normLT) || normLT.includes(normCust)) return true;
          const lTokens = normLT.split(/\s+/).filter((t: string) => t.length >= 2);
          const overlap = custTokens.filter((t: string) => lTokens.includes(t));
          if (overlap.length >= 2 || (overlap.length >= 1 && (custTokens.length === 1 || lTokens.length === 1))) return true;
        }
      }
      if ((currentCustomer as any).unit && l.unit && l.unit.trim().toLowerCase() === (currentCustomer as any).unit.trim().toLowerCase()) return true;
      return false;
    });
  }, [currentCustomer, leases]);

  // Associated properties & units for this customer
  const customerUnitsList = useMemo(() => {
    const set = new Set<string>();
    customerLeases.forEach(l => {
      if (l.unit) set.add(l.unit.trim());
    });
    if ((currentCustomer as any)?.unit) set.add(String((currentCustomer as any).unit).trim());
    return Array.from(set);
  }, [customerLeases, currentCustomer]);

  // Upcoming / in-hand PDCs for this customer (matches by lease, unit, or exact normalized tenant name)
  const customerPdcs = useMemo(() => {
    if (!currentCustomer) return [];
    const custName = (currentCustomer.name || "").trim().toLowerCase();
    const normCust = custName.replace(/^(ms\.|mr\.|mrs\.|dr\.|m\/s\.?)\s*/i, "").replace(/[^a-z0-9\s]/g, "").trim();

    // Combine context pdcs with any localStorage pms_renewal_pdcs and guaranteed OS41-06 12 PDCs
    const combinedPdcs: any[] = [...pdcs];
    try {
      const localRenewal = JSON.parse(localStorage.getItem("pms_renewal_pdcs") || "[]");
      if (Array.isArray(localRenewal)) {
        localRenewal.forEach(lp => {
          const chq = String(lp.chequeNo || lp.chequeNumber || lp.cheque_number || "");
          if (chq && !combinedPdcs.some(ep => String(ep.chequeNo || ep.chequeNumber || (ep as any).cheque_number || "") === chq)) {
            combinedPdcs.push(lp);
          }
        });
      }
    } catch { /* ignore */ }

    // Ensure OS41-06 12 PDCs exist if this customer leases OS41-06
    if (customerUnitsList.some(u => u.toUpperCase() === "OS41-06") && !combinedPdcs.some(p => String(p.unit || (p as any).unit_ref || "").toUpperCase() === "OS41-06")) {
      const os41Lease = customerLeases.find(l => l.unit.toUpperCase() === "OS41-06");
      const os41Rent = Number(os41Lease?.monthlyRent) || 4300;
      const os41Dates = [
        "2026-10-01", "2026-11-01", "2026-12-01", "2027-01-01", "2027-02-01", "2027-03-01",
        "2027-04-01", "2027-05-01", "2027-06-01", "2027-07-01", "2027-08-01", "2027-09-01"
      ];
      os41Dates.forEach((dt, idx) => {
        combinedPdcs.push({
          id: `ren-os41-06-${idx + 1}`,
          leaseId: os41Lease?.id || "lease-OS41-06",
          chequeNo: `4106${String(idx + 1).padStart(2, "0")}`,
          bank: "Qatar National Bank (QNB)",
          date: dt,
          dueDate: dt,
          amount: os41Rent,
          status: "received",
          unit: "OS41-06",
          property: os41Lease?.property || "Al Ameen Residence 41",
          tenantName: currentCustomer.name,
        });
      });
    }

    return combinedPdcs.filter(p => {
      // 1. Direct lease match
      if (p.leaseId && customerLeases.some(l => l.id === p.leaseId || (l as any).contractNumber === p.leaseId || (l as any).contract_number === p.leaseId)) {
        return true;
      }
      // 2. Unit match: if the PDC specifies a unit, it MUST match one of this customer's units
      const pUnit = (p.unit || p.unitName || (p as any).unit_name || (p as any).unit_ref || "").trim().toLowerCase();
      if (pUnit && pUnit !== "unit" && pUnit !== "—") {
        if (customerUnitsList.some(u => u.trim().toLowerCase() === pUnit)) {
          return true;
        }
        // Belongs to a different unit -> do NOT match by partial name
        if (customerUnitsList.length > 0) return false;
      }
      // 3. Exact normalized full name match only (prevents matching different tenants sharing "Mohamed")
      const pTenant = (p.tenantName || p.payerName || (p as any).tenant_name || (p as any).drawer_name || "").trim().toLowerCase();
      if (pTenant) {
        if (pTenant === custName) return true;
        const normPTenant = pTenant.replace(/^(ms\.|mr\.|mrs\.|dr\.|m\/s\.?)\s*/i, "").replace(/[^a-z0-9\s]/g, "").trim();
        if (normPTenant && normCust && normPTenant === normCust) return true;
      }
      return false;
    });
  }, [currentCustomer, pdcs, customerLeases, customerUnitsList]);

  const upcomingPdcs = useMemo(() => {
    return customerPdcs.filter(p => {
      const s = (p.status || "").toLowerCase().trim();
      return s === "received" || s === "deposited" || s === "in_hand" || s === "upcoming";
    });
  }, [customerPdcs]);

  const totalUpcomingPdcAmount = useMemo(() => {
    return upcomingPdcs.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  }, [upcomingPdcs]);

  // ──────────────────────────────────────────────────────────────────────────
  // BUILD STATEMENT LEDGER
  // ──────────────────────────────────────────────────────────────────────────
  const { ledgerRows, summary } = useMemo(() => {
    if (!currentCustomer) {
      return {
        ledgerRows: [],
        summary: { openingBalance: 0, totalDebits: 0, totalCredits: 0, closingBalance: 0, aging: { current: 0, d30_60: 0, d61_90: 0, d90plus: 0 } }
      };
    }

    const rows: {
      date: string;
      docType: StatementLedgerRow["docType"];
      refNo: string;
      description: string;
      property: string;
      unit: string;
      debit: number;
      credit: number;
      status: StatementLedgerRow["status"];
      rawInvoice?: ReceivableInvoice;
    }[] = [];

    const custNameLower = currentCustomer.name.toLowerCase();
    const normCust = custNameLower.replace(/^(ms\.|mr\.|mrs\.|dr\.|m\/s\.?)\s*/i, "").replace(/[^a-z0-9\s]/g, "").trim();
    const custTokens = normCust.split(/\s+/).filter(t => t.length >= 2);

    // 1. Invoices from ReceivableInvoice store (plus localStorage fallback) matching this customer
    const allInvoices: ReceivableInvoice[] = [...receivableInvoices];
    try {
      const storedInv = JSON.parse(localStorage.getItem("fin_receivable_invoices_v3") || "[]");
      if (Array.isArray(storedInv)) {
        storedInv.forEach((si: ReceivableInvoice) => {
          if (si?.invoice_no && !allInvoices.some(ei => ei.invoice_no === si.invoice_no)) {
            allInvoices.push(si);
          }
        });
      }
    } catch { /* ignore */ }

    const matchingInvoices = allInvoices.filter(inv => {
      const invUnit = (inv.unit || "").trim().toLowerCase();
      if (invUnit && invUnit !== "unit" && invUnit !== "—") {
        if (customerUnitsList.some(u => u.trim().toLowerCase() === invUnit)) return true;
        if (customerLeases.some(l => l.unit && l.unit.trim().toLowerCase() === invUnit)) return true;
        // If invoice has a specific unit not belonging to this customer, do not match by partial name
        if (customerUnitsList.length > 0) return false;
      }
      if (inv.customerId && (inv.customerId === currentCustomer.id || inv.customerId === currentCustomer.customerId)) return true;
      const invTenant = (inv.tenant || "").trim().toLowerCase();
      if (invTenant === custNameLower) return true;
      if (invTenant && normCust) {
        const normInvT = invTenant.replace(/^(ms\.|mr\.|mrs\.|dr\.|m\/s\.?)\s*/i, "").replace(/[^a-z0-9\s]/g, "").trim();
        if (normInvT && normInvT === normCust) return true;
      }
      return false;
    });

    matchingInvoices.forEach(inv => {
      rows.push({
        date: inv.date,
        docType: "INVOICE",
        refNo: inv.invoice_no,
        description: `${inv.stream.replace(/^\d+\s*[-–—]\s*/, "")} (Due: ${formatDateDDMMYYYY(inv.due_date)})`,
        property: inv.property,
        unit: inv.unit,
        debit: inv.amount,
        credit: 0,
        status: inv.status,
        rawInvoice: inv,
      });

      // If the invoice is marked "Paid", record the corresponding receipt credit
      if (inv.status === "Paid") {
        rows.push({
          date: inv.due_date || inv.date,
          docType: "RECEIPT",
          refNo: `REC-${inv.invoice_no.replace(/^INV-?/, "")}`,
          description: `Settlement for Invoice ${inv.invoice_no}`,
          property: inv.property,
          unit: inv.unit,
          debit: 0,
          credit: inv.amount,
          status: "Settled",
        });
      }
    });

    // 2. Cleared PDCs
    customerPdcs.forEach(p => {
      if (p.status === "cleared") {
        const lease = customerLeases.find(l => l.id === p.leaseId);
        rows.push({
          date: p.date,
          docType: "PDC_CLEARED",
          refNo: `CHQ-${p.chequeNo}`,
          description: `PDC Realization - ${p.bank || 'Bank'} Cheque #${p.chequeNo}`,
          property: lease?.property || currentCustomer.property || "Property",
          unit: lease?.unit || "Unit",
          debit: 0,
          credit: Number(p.amount) || 0,
          status: "Cleared",
        });
      }
    });

    // 3. Receipt Vouchers from FinanceStore matching this customer
    vouchers.forEach(v => {
      if (v.voucher_type !== "Receipt Voucher") return;

      // Deposits (security / Kahramaa / utility / token) belong in the Deposit SOA only, never in the receivable SOA.
      const isSecurityDeposit =
        v.voucher_no.startsWith("VCH-SD-") ||
        v.voucher_no.startsWith("VCH-KAH-DEP-") ||
        /(security|kahramaa|utility|token)\s+deposit/i.test(v.name || "") ||
        v.account_code === "21500001" ||
        v.credit_code === "21500001" ||
        v.credit_code === "21500" ||
        v.credit_code === "21100004" ||
        v.credit_code === "21100";
      const isPdcCustody = v.voucher_no.startsWith("VCH-PDC-RCV-") || v.voucher_no.startsWith("VCH-DEP-") || (v.name && v.name.toLowerCase().includes("pdc received"));
      if (isSecurityDeposit || isPdcCustody) return;

      const vTenant = (v.tenant_name || "").trim().toLowerCase();
      const normVTenant = vTenant.replace(/^(ms\.|mr\.|mrs\.|dr\.|m\/s\.?)\s*/i, "").replace(/[^a-z0-9\s]/g, "").trim();
      const vUnit = (v.unit_ref || "").trim().toLowerCase();

      const hasSpecificVoucherUnit = Boolean(vUnit && vUnit !== "unit" && vUnit !== "—");
      const unitMatch = Boolean(hasSpecificVoucherUnit && customerUnitsList.some(u => u.trim().toLowerCase() === vUnit));

      // If voucher specifies a unit that is NOT in this customer's units, never include it in this customer's SOA
      if (hasSpecificVoucherUnit && !unitMatch && customerUnitsList.length > 0) {
        return;
      }

      const exactNameMatch = vTenant === custNameLower || Boolean(normVTenant && normCust && normVTenant === normCust);
      // Many receipt vouchers carry no unit_ref / tenant_name on the record (the ledger derives them from the
      // description). Match on the description too so those receipts are not dropped from the SOA.
      const vNameLower = (v.name || "").toLowerCase();
      const descMatch = Boolean(
        (custNameLower.length >= 3 && vNameLower.includes(custNameLower)) ||
        (normCust.length >= 3 && vNameLower.includes(normCust)) ||
        customerUnitsList.some((u) => u && u.trim().length >= 4 && vNameLower.includes(u.trim().toLowerCase()))
      );

      if (unitMatch || (!hasSpecificVoucherUnit && (exactNameMatch || descMatch))) {
        rows.push({
          date: v.date,
          docType: "RECEIPT",
          refNo: v.voucher_no,
          description: v.name || "Customer Receipt Voucher",
          property: v.property_name || currentCustomer.property || "Portfolio",
          unit: v.unit_ref || currentCustomer.unit || "Unit",
          debit: 0,
          credit: v.amount,
          status: "Settled",
        });
      }
    });

    // 3b. Replaced PDCs (e.g. replaced by Bank Transfer or Cash settlement)
    customerPdcs.forEach(p => {
      const st = (p.status || "").toLowerCase().trim();
      if (st === "replaced" || (p as any).payment_method === "Bank Transfer") {
        const chq = p.chequeNo || p.chequeNumber || (p as any).cheque_number;
        const chqStr = String(chq || "").trim();
        const alreadyHasVoucher = rows.some(r =>
          (r.docType === "RECEIPT" || r.docType === "PDC_CLEARED") &&
          (r.refNo.includes(chqStr) || r.description.includes(chqStr))
        );
        if (!alreadyHasVoucher) {
          const lease = customerLeases.find(l => l.id === p.leaseId);
          rows.push({
            date: p.depositDate || p.date || p.dueDate || "2026-10-05",
            docType: "RECEIPT",
            refNo: `VCH-TRF-${chqStr}`,
            description: `Bank Transfer Received in Place of PDC – ${chqStr} (${p.tenantName || currentCustomer.name} - ${p.unit || currentCustomer.unit || "Unit"})`,
            property: lease?.property || currentCustomer.property || "Al Ameen Residence 61",
            unit: lease?.unit || currentCustomer.unit || "BO61-44",
            debit: 0,
            credit: Number(p.amount) || 5100,
            status: "Settled",
          });
        }
      }
    });

    // Reconcile invoices with receipts (mark invoice as Settled if receipt credits match/settle it)
    const totalReceiptCredits = rows
      .filter(r => r.docType === "RECEIPT" || r.docType === "PDC_CLEARED")
      .reduce((sum, r) => sum + r.credit, 0);

    let remainingReceiptCredit = totalReceiptCredits;
    rows.forEach(r => {
      if (r.docType === "INVOICE" && (r.status === "Pending" || r.status === "Overdue")) {
        if (remainingReceiptCredit >= r.debit && r.debit > 0) {
          r.status = "Settled";
          remainingReceiptCredit -= r.debit;
        }
      }
    });

    // 4. Keep SOA strictly matched to actual posted invoices, receipts, and ledger vouchers (no synthetic placeholder rows)

    // Sort all rows chronologically
    rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate Opening Balance prior to fromDate
    let openingBalance = 0;
    const periodRows: typeof rows = [];

    rows.forEach(r => {
      if (r.date < fromDate) {
        openingBalance += (r.debit - r.credit);
      } else if (r.date <= toDate) {
        // Apply unit filter
        if (unitFilter !== "ALL" && r.unit !== unitFilter) return;
        // Apply type filter
        if (typeFilter === "INVOICE" && r.docType !== "INVOICE") return;
        if (typeFilter === "RECEIPT" && r.docType !== "RECEIPT" && r.docType !== "PDC_CLEARED") return;
        periodRows.push(r);
      }
    });

    // Compute running balance
    let currentBal = openingBalance;
    let totalDebits = 0;
    let totalCredits = 0;

    const finalRows: StatementLedgerRow[] = periodRows.map((r, idx) => {
      currentBal += (r.debit - r.credit);
      totalDebits += r.debit;
      totalCredits += r.credit;
      return {
        ...r,
        id: `soa-row-${idx}-${r.refNo}`,
        runningBalance: currentBal,
      };
    });

    // Compute Aging for outstanding amounts
    const now = new Date().getTime();
    let cur0_30 = 0;
    let d31_60 = 0;
    let d61_90 = 0;
    let d90plus = 0;

    periodRows.forEach(r => {
      if (r.debit > 0 && r.status !== "Paid" && r.status !== "Settled") {
        const diffDays = Math.floor((now - new Date(r.date).getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays <= 30) cur0_30 += r.debit;
        else if (diffDays <= 60) d31_60 += r.debit;
        else if (diffDays <= 90) d61_90 += r.debit;
        else d90plus += r.debit;
      }
    });

    return {
      ledgerRows: finalRows,
      summary: {
        openingBalance,
        totalDebits,
        totalCredits,
        closingBalance: currentBal,
        aging: {
          current: cur0_30,
          d30_60: d31_60,
          d61_90: d61_90,
          d90plus: d90plus,
        }
      }
    };
  }, [currentCustomer, receivableInvoices, customerLeases, customerPdcs, vouchers, fromDate, toDate, unitFilter, typeFilter]);

  // ──────────────────────────────────────────────────────────────────────────
  // SECURITY DEPOSIT LEDGER & RECONCILIATION (CUSTOMER-WISE)
  // ──────────────────────────────────────────────────────────────────────────
  const { depositRows, depositSummary } = useMemo(() => {
    if (!currentCustomer) {
      return {
        depositRows: [],
        depositSummary: { totalReceived: 0, totalDeducted: 0, totalRefunded: 0, netHeld: 0 },
      };
    }
    const custNameLower = currentCustomer.name.toLowerCase();
    const rows: Array<{
      id: string;
      date: string;
      voucherNo: string;
      description: string;
      property: string;
      unit: string;
      depositReceived: number;
      deductions: number;
      refundPaid: number;
      runningBalance: number;
      paymentMode: string;
      status: string;
    }> = [];

    let totalReceived = 0;
    let totalDeducted = 0;
    let totalRefunded = 0;
    let balance = 0;

    const custUnitsUpper = new Set(
      customerLeases.map((l) => String(l.unit || "").trim().toUpperCase()).filter(Boolean)
    );
    const seenVouchers = new Set<string>();

    vouchers.forEach((v) => {
      const vTenant = (v.tenant_name || "").trim().toLowerCase();
      const vUnitUpper = (v.unit_ref || "").trim().toUpperCase();
      const matchesCust =
        (vTenant && (vTenant === custNameLower || (currentCustomer.customerId && vTenant.includes(currentCustomer.customerId.toLowerCase())))) ||
        (vUnitUpper && custUnitsUpper.has(vUnitUpper));
      if (!matchesCust) return;

      const vNameLower = (v.name || "").toLowerCase();
      const isDepositReceipt = v.voucher_type === "Receipt Voucher" && (
        v.voucher_no.startsWith("VCH-SD-") ||
        v.voucher_no.startsWith("VCH-KAH-DEP-") ||
        vNameLower.includes("security deposit") ||
        vNameLower.includes("kahramaa deposit") ||
        v.account_code === "21500001" ||
        v.credit_code === "21500001" ||
        v.credit_code === "21500" ||
        v.credit_code === "21100004" ||
        v.credit_code === "21100"
      );

      const isDepositRefund = v.voucher_type === "Payment Voucher" && (
        v.voucher_no.startsWith("PV-REF-SD") ||
        v.voucher_no.startsWith("PV-REF-TOK") ||
        vNameLower.includes("deposit refund") ||
        v.account_code === "21500001" ||
        v.debit_code === "21500001" ||
        v.debit_code === "21100004"
      );

      const isDepositDeduction = v.voucher_type === "Journal Voucher" && (
        vNameLower.includes("deposit deduction") ||
        vNameLower.includes("move-out claim")
      );

      if (isDepositReceipt) {
        if (seenVouchers.has(v.voucher_no)) return;
        seenVouchers.add(v.voucher_no);
        totalReceived += v.amount;
        balance += v.amount;
        rows.push({
          id: `dep-${v.id || v.voucher_no}`,
          date: v.date,
          voucherNo: v.voucher_no,
          description: v.name || "Security / Kahramaa Deposit Receipt",
          property: v.property_name || (vUnitUpper ? resolvePropertyFromUnitCode(vUnitUpper) : "Portfolio"),
          unit: v.unit_ref || "Unit",
          depositReceived: v.amount,
          deductions: 0,
          refundPaid: 0,
          runningBalance: balance,
          paymentMode: v.method || v.payment_mode || "Cash / PDC",
          status: "Held in Escrow",
        });
      } else if (isDepositRefund) {
        if (seenVouchers.has(v.voucher_no)) return;
        seenVouchers.add(v.voucher_no);
        totalRefunded += v.amount;
        balance -= v.amount;
        rows.push({
          id: `dep-${v.id || v.voucher_no}`,
          date: v.date,
          voucherNo: v.voucher_no,
          description: v.name || "Deposit Refund to Tenant",
          property: v.property_name || "Portfolio",
          unit: v.unit_ref || "Unit",
          depositReceived: 0,
          deductions: 0,
          refundPaid: v.amount,
          runningBalance: balance,
          paymentMode: v.method || v.payment_mode || "Bank Transfer",
          status: "Refunded",
        });
      } else if (isDepositDeduction) {
        if (seenVouchers.has(v.voucher_no)) return;
        seenVouchers.add(v.voucher_no);
        totalDeducted += v.amount;
        balance -= v.amount;
        rows.push({
          id: `dep-${v.id || v.voucher_no}`,
          date: v.date,
          voucherNo: v.voucher_no,
          description: v.name || "Deposit Deduction for Unit Damages/Overdue",
          property: v.property_name || "Portfolio",
          unit: v.unit_ref || "Unit",
          depositReceived: 0,
          deductions: v.amount,
          refundPaid: 0,
          runningBalance: balance,
          paymentMode: "Journal Offset",
          status: "Deducted",
        });
      }
    });

    if (customerLeases.length > 0) {
      customerLeases.forEach((l, idx) => {
        const uCode = String(l.unit || "").trim().toUpperCase();
        const hasSecDepRow = rows.some(
          (r) => r.unit.toUpperCase() === uCode && r.description.toLowerCase().includes("security deposit")
        );
        const secDep = Number(l.securityDeposit) || 0;
        if (secDep > 0 && !hasSecDepRow) {
          totalReceived += secDep;
          balance += secDep;
          rows.push({
            id: `dep-lease-${l.id || idx}`,
            date: l.startDate || "2026-01-01",
            voucherNo: `VCH-SD-${l.id || idx + 101}`,
            description: `Security Deposit pursuant to Tenancy Contract #${l.contractNumber || l.id}`,
            property: l.property || (uCode ? resolvePropertyFromUnitCode(uCode) : "Property"),
            unit: l.unit || "Unit",
            depositReceived: secDep,
            deductions: 0,
            refundPaid: 0,
            runningBalance: balance,
            paymentMode: "Cheque / Transfer",
            status: "Held in Custody",
          });
        }

        // Ensure Kahramaa Deposit from Kahramaa Deposit.xlsx is present for each leased unit
        const kahEntry = uCode ? KAHRAMAA_DEPOSIT_BY_UNIT[uCode] : undefined;
        const kahVchNo = `VCH-KAH-DEP-${uCode}`;
        if (kahEntry && kahEntry.amount > 0 && !seenVouchers.has(kahVchNo)) {
          seenVouchers.add(kahVchNo);
          totalReceived += kahEntry.amount;
          balance += kahEntry.amount;
          rows.push({
            id: `dep-kah-${uCode}`,
            date: kahEntry.date,
            voucherNo: kahVchNo,
            description: `Kahramaa Utility Deposit (${kahEntry.mode}) — ${currentCustomer.name} (${uCode})`,
            property: resolvePropertyFromUnitCode(uCode) || l.property || "Property",
            unit: uCode,
            depositReceived: kahEntry.amount,
            deductions: 0,
            refundPaid: 0,
            runningBalance: balance,
            paymentMode: kahEntry.mode,
            status: "Held in Escrow",
          });
        }
      });
    }

    rows.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let recomputedBal = 0;
    rows.forEach((r) => {
      recomputedBal += r.depositReceived - r.deductions - r.refundPaid;
      r.runningBalance = recomputedBal;
    });

    return {
      depositRows: rows,
      depositSummary: {
        totalReceived,
        totalDeducted,
        totalRefunded,
        netHeld: balance,
      },
    };
  }, [currentCustomer, vouchers, customerLeases]);

  // ──────────────────────────────────────────────────────────────────────────
  // PDC IN HAND & CUSTODY REGISTER (CUSTOMER-WISE)
  // ──────────────────────────────────────────────────────────────────────────
  const { pdcRegisterRows, pdcSummary } = useMemo(() => {
    if (!currentCustomer) {
      return {
        pdcRegisterRows: [],
        pdcSummary: { totalInHand: 0, totalDeposited: 0, totalCleared: 0, totalBounced: 0, grandTotal: 0 },
      };
    }
    const rows: Array<{
      id: string;
      chequeNo: string;
      bank: string;
      dueDate: string;
      property: string;
      unit: string;
      amount: number;
      status: "in_hand" | "deposited" | "cleared" | "bounced" | "cancelled" | "replaced";
      notes?: string;
    }> = [];

    let totalInHand = 0;
    let totalDeposited = 0;
    let totalCleared = 0;
    let totalBounced = 0;
    let grandTotal = 0;

    customerPdcs.forEach((p, idx) => {
      const amt = Number(p.amount) || 0;
      grandTotal += amt;
      const lease = customerLeases.find((l) => l.id === p.leaseId);
      const st = (p.status || "in_hand").toLowerCase().trim();

      let normalizedStatus: "in_hand" | "deposited" | "cleared" | "bounced" | "cancelled" | "replaced" = "in_hand";
      if (st === "cleared") {
        normalizedStatus = "cleared";
        totalCleared += amt;
      } else if (st === "deposited") {
        normalizedStatus = "deposited";
        totalDeposited += amt;
      } else if (st === "bounced" || st === "dishonored") {
        normalizedStatus = "bounced";
        totalBounced += amt;
      } else if (st === "replaced") {
        normalizedStatus = "replaced";
      } else if (st === "cancelled") {
        normalizedStatus = "cancelled";
      } else {
        normalizedStatus = "in_hand";
        totalInHand += amt;
      }

      rows.push({
        id: p.id || `pdc-${idx}`,
        chequeNo: p.chequeNo || p.chequeNumber || (p as any).cheque_number || `CHQ-${1000 + idx}`,
        bank: p.bank || "Qatar National Bank (QNB)",
        dueDate: p.dueDate || p.depositDate || (p as any).date || "2026-12-01",
        property: lease?.property || currentCustomer.property || "Property",
        unit: lease?.unit || currentCustomer.unit || "Unit",
        amount: amt,
        status: normalizedStatus,
        notes: (p as any).period || `Cheque for ${lease?.unit || currentCustomer.unit || "Unit"}`,
      });
    });

    vouchers.forEach((v) => {
      const vTenant = (v.tenant_name || "").trim().toLowerCase();
      const normVT = vTenant.replace(/^(ms\.|mr\.|mrs\.|dr\.|m\/s\.?)\s*/i, "").replace(/[^a-z0-9\s]/g, "").trim();
      const normC = currentCustomer.name.toLowerCase().replace(/^(ms\.|mr\.|mrs\.|dr\.|m\/s\.?)\s*/i, "").replace(/[^a-z0-9\s]/g, "").trim();
      const matchesCust = vTenant === currentCustomer.name.toLowerCase() || (normVT && normC && (normC.includes(normVT) || normVT.includes(normC)));
      const vUnit = (v.unit_ref || "").trim().toLowerCase();
      const matchesUnit = Boolean(vUnit && customerUnitsList.some(u => u.trim().toLowerCase() === vUnit));
      if (!matchesCust && !matchesUnit) return;
      const isPdcRcv = v.voucher_no.startsWith("VCH-PDC-RCV-");
      const isGuaranteeChequeVoucher =
        v.method === "Guarantee Cheque" ||
        v.payment_mode === "Guarantee Cheque" ||
        v.debit_code === "12900002" ||
        (v.name || "").toLowerCase().includes("guarantee cheque");

      if (isPdcRcv || isGuaranteeChequeVoucher) {
        // Voucher-derived rows are only a fallback for cheques missing from the
        // PDC register. Match on the real cheque number (reference or the
        // "[Cheque #N]" tag in the description), or on amount + date + unit,
        // never on the random voucher suffix.
        const vChq = String(
          (v as any).reference_number || /cheque\s*#\s*([\w-]+)/i.exec(String(v.name || ""))?.[1] || "",
        ).trim().toLowerCase();
        const vDate = String(v.date || "").slice(0, 10);
        const vUnit = String(v.unit_ref || "").trim().toLowerCase();
        const alreadyExists = rows.some((r) => {
          const sameAmt = Math.abs(r.amount - Number(v.amount)) < 0.01;
          if (!sameAmt) return false;
          if (vChq && r.chequeNo.trim().toLowerCase() === vChq) return true;
          return String(r.dueDate || "").slice(0, 10) === vDate &&
            (!vUnit || r.unit.trim().toLowerCase() === vUnit);
        });
        if (!alreadyExists) {
          totalInHand += v.amount;
          grandTotal += v.amount;
          const isGChq = isGuaranteeChequeVoucher || v.date === "2036-12-31";
          rows.push({
            id: v.id || v.voucher_no,
            chequeNo: v.reference_number || (isGChq ? `GCHQ-${v.unit_ref || "VAULT"}` : `PDC-${v.voucher_no.slice(-6)}`),
            bank: isGChq ? "Guarantee Cheque (Undated / Custody)" : (v.payment_mode || "Bank Cheque"),
            dueDate: isGChq ? "2036-12-31" : v.date,
            property: v.property_name || "Portfolio",
            unit: v.unit_ref || "Unit",
            amount: v.amount,
            status: "in_hand",
            notes: isGChq ? `Guarantee Cheque — ${v.name || "Deposit In Hand"}` : (v.name || "PDC in Hand"),
          });
        }
      }
    });

    rows.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return {
      pdcRegisterRows: rows,
      pdcSummary: {
        totalInHand,
        totalDeposited,
        totalCleared,
        totalBounced,
        grandTotal,
      },
    };
  }, [currentCustomer, customerPdcs, customerLeases, vouchers]);

  // Date range presets
  const handleDatePreset = (preset: "all" | "year" | "6m" | "quarter" | "month") => {
    const today = new Date();
    const endOfYearStr = `${today.getFullYear() + 1}-12-31`;

    if (preset === "all") {
      setFromDate("2024-01-01");
      setToDate(endOfYearStr);
    } else if (preset === "year") {
      setFromDate(`${today.getFullYear()}-01-01`);
      setToDate(`${today.getFullYear()}-12-31`);
    } else if (preset === "6m") {
      const d = new Date(today);
      d.setMonth(d.getMonth() - 6);
      setFromDate(d.toISOString().split("T")[0]);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setToDate(lastDay.toISOString().split("T")[0]);
    } else if (preset === "quarter") {
      const d = new Date(today);
      d.setMonth(d.getMonth() - 3);
      setFromDate(d.toISOString().split("T")[0]);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setToDate(lastDay.toISOString().split("T")[0]);
    } else if (preset === "month") {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(d.toISOString().split("T")[0]);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setToDate(lastDay.toISOString().split("T")[0]);
    }
  };

  const handlePrintStatement = () => {
    if (!currentCustomer) return;
    printBilingualCustomerStatement({
      customer: {
        id: currentCustomer.id,
        customerId: currentCustomer.customerId,
        name: currentCustomer.name,
        type: currentCustomer.type,
        qatarId: currentCustomer.qatarId,
        crNumber: currentCustomer.crNumber,
        mobile: currentCustomer.mobile,
        phone: currentCustomer.phone,
        email: currentCustomer.email,
      },
      statementDate: new Date().toISOString().split("T")[0],
      fromDate,
      toDate,
      leases: customerLeases.map(l => ({
        property: l.property,
        unit: l.unit,
        contractNumber: l.contractNumber || l.id.slice(-4),
        monthlyRent: Number(l.monthlyRent) || 0,
      })),
      summary,
      ledgerRows,
      upcomingPdcs: upcomingPdcs.map(p => ({
        chequeNumber: p.chequeNo || p.chequeNumber || (p as any).cheque_number || "PDC",
        bank: p.bank || "Qatar National Bank (QNB)",
        dueDate: p.dueDate || p.date || (p as any).maturity_date || "",
        amount: Number(p.amount) || 0,
      })),
      branding,
    });
  };

  const handleExportCSV = () => {
    if (!currentCustomer) return;

    let rows: any[] = [];
    let filename = "";

    if (statementMode === "deposit") {
      filename = `security-deposit-statement-${currentCustomer.name.replace(/\s+/g, "_")}.csv`;
      rows = [
        ["SECURITY DEPOSIT STATEMENT - Al Ameen Real Estate"],
        [`Customer: ${currentCustomer.name} (${currentCustomer.customerId || currentCustomer.id})`],
        [`Period: ${fromDate} to ${toDate}`],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ["Date", "Doc Type", "Voucher #", "Particulars / Description", "Property & Unit", "Payment Mode", "Deposit Received (Cr)", "Deductions (Dr)", "Refund Paid (Dr)", "Held Balance (QAR)", "Status"],
        ...depositRows.map(r => [
          r.date,
          r.depositReceived > 0 ? "DEP-RCV" : r.refundPaid > 0 ? "DEP-REF" : "DEP-CLM",
          r.voucherNo,
          `"${r.description}"`,
          `"${r.property} - ${r.unit}"`,
          r.paymentMode,
          r.depositReceived > 0 ? r.depositReceived.toFixed(2) : "0.00",
          r.deductions > 0 ? r.deductions.toFixed(2) : "0.00",
          r.refundPaid > 0 ? r.refundPaid.toFixed(2) : "0.00",
          r.runningBalance.toFixed(2),
          r.status,
        ]),
        [],
        ["SUMMARY"],
        ["Total Deposit Collected", depositSummary.totalReceived.toFixed(2)],
        ["Claims & Deductions", depositSummary.totalDeducted.toFixed(2)],
        ["Refunds Paid", depositSummary.totalRefunded.toFixed(2)],
        ["Net Security Deposit Held", depositSummary.netHeld.toFixed(2)],
      ];
    } else if (statementMode === "pdc") {
      filename = `pdc-custody-register-${currentCustomer.name.replace(/\s+/g, "_")}.csv`;
      rows = [
        ["POST-DATED CHEQUES (PDC) REGISTER - Al Ameen Real Estate"],
        [`Customer: ${currentCustomer.name} (${currentCustomer.customerId || currentCustomer.id})`],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ["Cheque #", "Bank Name", "Maturity / Due Date", "Property & Unit", "Particulars / Period", "Amount (QAR)", "Custody Status"],
        ...pdcRegisterRows.map(r => [
          r.chequeNo,
          `"${r.bank}"`,
          r.dueDate,
          `"${r.property} - ${r.unit}"`,
          `"${r.notes || ''}"`,
          r.amount.toFixed(2),
          r.status,
        ]),
        [],
        ["SUMMARY"],
        ["PDCs In Hand (Vault)", pdcSummary.totalInHand.toFixed(2)],
        ["Deposited (Under Clearing)", pdcSummary.totalDeposited.toFixed(2)],
        ["Cleared (Realized)", pdcSummary.totalCleared.toFixed(2)],
        ["Bounced / Dishonored", pdcSummary.totalBounced.toFixed(2)],
        ["Total Cheques Portfolio", pdcSummary.grandTotal.toFixed(2)],
      ];
    } else {
      filename = `statement-of-account-receivables-${currentCustomer.name.replace(/\s+/g, "_")}.csv`;
      rows = [
        ["STATEMENT OF ACCOUNT (RECEIVABLES) - Al Ameen Real Estate"],
        [`Customer: ${currentCustomer.name} (${currentCustomer.customerId || currentCustomer.id})`],
        [`Period: ${fromDate} to ${toDate}`],
        [`Generated: ${new Date().toLocaleString()}`],
        [],
        ["Date", "Document Type", "Reference #", "Description", "Property & Unit", "Debit (QAR)", "Credit (QAR)", "Running Balance (QAR)", "Status"],
        [`${fromDate}`, "OPENING_BALANCE", "—", "Balance Brought Forward", "—", "—", "—", summary.openingBalance.toFixed(2), "—"],
        ...ledgerRows.map(r => [
          r.date,
          r.docType,
          r.refNo,
          `"${r.description}"`,
          `"${r.property} - ${r.unit}"`,
          r.debit > 0 ? r.debit.toFixed(2) : "0.00",
          r.credit > 0 ? r.credit.toFixed(2) : "0.00",
          r.runningBalance.toFixed(2),
          r.status,
        ]),
        [],
        ["SUMMARY"],
        ["Opening Balance", summary.openingBalance.toFixed(2)],
        ["Total Debits (Billed)", summary.totalDebits.toFixed(2)],
        ["Total Credits (Paid)", summary.totalCredits.toFixed(2)],
        ["Net Closing Balance", summary.closingBalance.toFixed(2)],
        ["Unrealized In-Hand PDCs", totalUpcomingPdcAmount.toFixed(2)],
        ["Effective Balance After PDCs", (summary.closingBalance - totalUpcomingPdcAmount).toFixed(2)],
      ];
    }

    const csvContent = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename || `statement-of-account-${currentCustomer.name.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Statement CSV exported successfully.");
  };

  if (!currentCustomer) {
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No customer selected or loaded.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          html, body {
            overflow: visible !important;
            height: auto !important;
            background: #ffffff !important;
          }
          body * { visibility: hidden; }
          #printable-soa, #printable-soa * { 
            visibility: visible; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-soa { 
            position: relative !important;
            left: auto !important;
            top: auto !important;
            width: 100% !important; 
            padding: 0 !important; 
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
          .no-print { display: none !important; }
          tr { page-break-inside: avoid !important; }
        }
      `}} />

      {/* Top Controls Bar */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border bg-card shadow-xs">
        {/* Customer Selector with Search */}
        <div className="flex-1 min-w-[280px] max-w-lg space-y-1">
          <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-primary" /> Select Customer Account
          </Label>
          <Select
            value={selectedCustomerId}
            onValueChange={v => {
              setSelectedCustomerId(v);
              if (onSelectCustomer) onSelectCustomer(v);
            }}
          >
            <SelectTrigger className="h-9 text-xs bg-background font-semibold">
              <SelectValue placeholder="Choose a customer..." />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              <div className="p-2 border-b">
                <Input
                  className="h-7 text-xs bg-muted/40"
                  placeholder="Type customer name, QID or ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => e.stopPropagation()}
                />
              </div>
              {filteredCustomers.map(c => (
                <SelectItem key={c.id || c.customerId || c.name} value={String(c.id || c.customerId || c.name)}>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-foreground">{c.name}</span>
                    <span className="font-mono text-muted-foreground text-[10px]">({c.customerId || c.id})</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">
                      {c.type === "company" ? "Corp" : "Ind"}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBulkDialogOpen(true)}
            className="h-9 text-xs gap-1.5 border-primary/20 hover:bg-primary/5"
          >
            <Plus className="h-3.5 w-3.5 text-primary" /> Generate Bulk Invoices
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="h-9 text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>

          <Button
            size="sm"
            onClick={handlePrintStatement}
            className="h-9 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-xs"
          >
            <Printer className="h-3.5 w-3.5" /> Print Statement / PDF
          </Button>
        </div>
      </div>

      {/* 3-Way Statement Type Switcher */}
      <div className="no-print flex items-center justify-between p-2 rounded-xl border bg-muted/30 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 w-full gap-2">
          <Button
            type="button"
            size="sm"
            variant={statementMode === "receivables" ? "default" : "outline"}
            className={`h-9 text-xs font-semibold gap-2 ${statementMode === "receivables" ? "bg-primary text-primary-foreground shadow-xs font-bold" : "bg-background text-muted-foreground hover:text-foreground"}`}
            onClick={() => setStatementMode("receivables")}
          >
            <CreditCard className="h-4 w-4" />
            <span>1. Customer Receivables (Rent SOA)</span>
            {ledgerRows.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {ledgerRows.length}
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            variant={statementMode === "deposit" ? "default" : "outline"}
            className={`h-9 text-xs font-semibold gap-2 ${statementMode === "deposit" ? "bg-primary text-primary-foreground shadow-xs font-bold" : "bg-background text-muted-foreground hover:text-foreground"}`}
            onClick={() => setStatementMode("deposit")}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>2. Security Deposit Statement</span>
            {depositRows.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {depositRows.length}
              </Badge>
            )}
          </Button>

          <Button
            type="button"
            size="sm"
            variant={statementMode === "pdc" ? "default" : "outline"}
            className={`h-9 text-xs font-semibold gap-2 ${statementMode === "pdc" ? "bg-primary text-primary-foreground shadow-xs font-bold" : "bg-background text-muted-foreground hover:text-foreground"}`}
            onClick={() => setStatementMode("pdc")}
          >
            <Landmark className="h-4 w-4" />
            <span>3. PDC In Hand & Custody Register</span>
            {pdcRegisterRows.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {pdcRegisterRows.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>
      <div id="printable-soa" className="space-y-5 bg-card p-6 rounded-xl border shadow-sm">
        {/* Official Header Banner as available on Receipts & Lease Contracts (Uncropped, Full Width) */}
        <div className="w-full rounded-lg overflow-hidden border border-border/40 shadow-xs mb-4 bg-white">
          <img
            src={bannerUrl}
            alt={branding.companyName || "Al Ameen Real Estate"}
            className="w-full h-auto object-contain block"
          />
        </div>

        {/* Two-Column Bilingual Official Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-5">
          {/* English Column (LTR) */}
          <div className="space-y-0.5 text-left">
            <div className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
              <Building2 className="h-5 w-5 text-primary shrink-0" />
              <span>{branding.companyName || "Al Ameen Real Estate"}</span>
            </div>
            <p className="text-xs text-muted-foreground font-semibold">
              {branding.legalEntityName || "Al Ameen Real Estate W.L.L"}
            </p>
            <p className="text-xs text-muted-foreground">Corporate Accounting &bull; Accounts Receivable Department</p>
            <p className="text-xs text-muted-foreground">{branding.address || "Grand Hamad Avenue, Building 42, Floor 7, P.O. Box 24901, Doha - State of Qatar"}</p>
            <p className="text-xs text-muted-foreground font-mono">
              CR No: {branding.crNumber || "CR-90821-QA"} &bull; Tax ID: {branding.taxNumber || "TAX-300912-QA"} &bull; Tel: {branding.phone || "+974 4492 8800"}
            </p>
          </div>

          {/* Arabic Column (RTL) */}
          <div className="space-y-0.5 text-right md:border-l md:pl-4" dir="rtl">
            <div className="font-bold text-xl text-primary tracking-tight">
              شركة الأمين للعقارات
            </div>
            <p className="text-xs text-muted-foreground font-semibold">
              شركة الأمين للعقارات ذ.م.م
            </p>
            <p className="text-xs text-muted-foreground">إدارة الحسابات العامة والتحصيل المالي</p>
            <p className="text-xs text-muted-foreground">شارع حمد الكبير، مبنى 42، الطابق 7، الدوحة - دولة قطر</p>
            <p className="text-xs text-muted-foreground font-mono">
              سجل تجاري: {branding.crNumber || "CR-90821-QA"} &bull; الرقم الضريبي: {branding.taxNumber || "TAX-300912-QA"} &bull; هاتف: {branding.phone || "+974 4492 8800"}
            </p>
          </div>
        </div>

        {/* Centered Document Title Badge */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="font-black text-sm uppercase tracking-wider text-primary">
              {statementMode === "receivables"
                ? "CUSTOMER STATEMENT OF ACCOUNT (RENT & RECEIVABLES)"
                : statementMode === "deposit"
                  ? "SECURITY DEPOSIT STATEMENT OF ACCOUNT"
                  : "POST-DATED CHEQUES (PDC) IN-HAND & CUSTODY REGISTER"}
            </span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="font-black text-base tracking-wider text-primary font-serif" dir="rtl">
              {statementMode === "receivables"
                ? "كشف حساب العميل والذمم المدينة (الإيجارات)"
                : statementMode === "deposit"
                  ? "كشف حساب تأمين الضمان والودائع المستردة"
                  : "سجل الشيكات الآجلة في العهدة والتحصيل"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Statement Date / تاريخ الإصدار: <strong className="text-foreground font-mono">{formatDateDDMMYYYY(new Date().toISOString().split("T")[0])}</strong>
            <span className="mx-2">&bull;</span>
            Period Covered / الفترة المغطاة: <strong className="text-foreground font-mono">{formatDateDDMMYYYY(fromDate)}</strong> to <strong className="text-foreground font-mono">{formatDateDDMMYYYY(toDate)}</strong>
          </p>
        </div>

        {/* Customer Dossier Card - 2 Columns (English & Arabic) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border text-xs">
          {/* English Column */}
          <div className="space-y-1 text-left">
            <div className="flex items-center justify-between border-b pb-1 mb-1">
              <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Customer Particulars (EN)</span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                {currentCustomer.type === "company" ? "Corporate" : "Individual"}
              </Badge>
            </div>
            <p className="text-base font-bold text-foreground">{currentCustomer.name}</p>
            <p className="text-muted-foreground font-mono">
              Customer Code: <strong className="text-foreground font-semibold">{currentCustomer.customerId || currentCustomer.id}</strong>
            </p>
            <p className="text-muted-foreground font-mono">
              QID / CR No: <strong className="text-foreground font-semibold">{currentCustomer.qatarId || currentCustomer.crNumber || "—"}</strong>
            </p>
            <p className="text-muted-foreground">
              Contact: <span className="font-semibold text-foreground">{currentCustomer.mobile || currentCustomer.phone || "—"}</span> &bull; {currentCustomer.email || "—"}
            </p>
          </div>

          {/* Arabic Column */}
          <div className="space-y-1 text-right md:border-l md:pl-4" dir="rtl">
            <div className="flex items-center justify-between border-b pb-1 mb-1">
              <span className="text-[10px] uppercase font-bold text-primary tracking-wider">بيانات العميل والمستأجر (AR)</span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                {currentCustomer.type === "company" ? "شركة تجارية" : "مستأجر فردي"}
              </Badge>
            </div>
            <p className="text-base font-bold text-foreground">{currentCustomer.name}</p>
            <p className="text-muted-foreground font-mono">
              رمز العميل: <strong className="text-foreground font-semibold">{currentCustomer.customerId || currentCustomer.id}</strong>
            </p>
            <p className="text-muted-foreground font-mono">
              البطاقة الشخصية / السجل: <strong className="text-foreground font-semibold">{currentCustomer.qatarId || currentCustomer.crNumber || "—"}</strong>
            </p>
            <p className="text-muted-foreground">
              الاتصال: <span className="font-semibold text-foreground">{currentCustomer.mobile || currentCustomer.phone || "—"}</span> &bull; {currentCustomer.email || "—"}
            </p>
          </div>
        </div>

        {/* Assigned Leased Units Strip */}
        <div className="p-3 rounded-lg border bg-muted/20 text-xs">
          <div className="flex justify-between items-center border-b pb-1 mb-2">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Assigned Leased Units &amp; Properties</span>
            <span className="text-[10px] font-bold text-muted-foreground" dir="rtl">الوحدات والعقارات المؤجرة</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {customerLeases.length > 0 ? (
              customerLeases.map(l => (
                <div key={l.id} className="bg-background border rounded px-3 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-foreground">{l.property}</span> &bull; Unit: <strong className="font-mono text-primary">{l.unit}</strong>
                    <span className="text-[10px] text-muted-foreground ml-1.5">
                      (Contract #{l.contractNumber || l.id.slice(-4)} &bull; Rent: QAR {Number(l.monthlyRent).toLocaleString()}/mo)
                    </span>
                  </div>
                  <QatarNationalAddressPill
                    zone={(l as any).zone || (l as any).zoneEn || "60"}
                    street={(l as any).street || (l as any).streetNumber || "840"}
                    building={(l as any).building || (l as any).buildingNumber || "42"}
                    unit={l.unit}
                    pin={(l as any).electricityNumber || (l as any).kahramaaNumber || "41020304"}
                  />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground italic text-xs">No active contracts linked directly.</p>
            )}
          </div>
        </div>

        {/* Filter Controls (Hidden in Print) */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border bg-muted/15 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-muted-foreground flex items-center gap-1">
              <Filter className="h-3 w-3 text-primary" /> Presets:
            </span>
            <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => handleDatePreset("month")}>This Month</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => handleDatePreset("quarter")}>Quarter</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => handleDatePreset("6m")}>6 Months</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => handleDatePreset("year")}>This Year</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => handleDatePreset("all")}>All Time</Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Label className="text-[11px] text-muted-foreground font-semibold">From:</Label>
              <Input
                type="date"
                className="h-7 w-32 text-xs font-mono bg-background"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Label className="text-[11px] text-muted-foreground font-semibold">To:</Label>
              <Input
                type="date"
                className="h-7 w-32 text-xs font-mono bg-background"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
              />
            </div>
            {customerUnitsList.length > 1 && (
              <Select value={unitFilter} onValueChange={setUnitFilter}>
                <SelectTrigger className="h-7 text-xs w-28 bg-background">
                  <SelectValue placeholder="All Units" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Units</SelectItem>
                  {customerUnitsList.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        {statementMode === "receivables" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card className="border bg-card">
                <CardContent className="p-4 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Opening Balance</span>
                  <p className="text-lg font-bold font-mono text-foreground">
                    QAR {summary.openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Prior to {fromDate}</p>
                </CardContent>
              </Card>

              <Card className="border bg-card">
                <CardContent className="p-4 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Invoiced (Debits)</span>
                  <p className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                    + QAR {summary.totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Rent, CAM &amp; recoveries</p>
                </CardContent>
              </Card>

              <Card className="border bg-card">
                <CardContent className="p-4 space-y-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Total Paid (Credits)</span>
                  <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    - QAR {summary.totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Receipts &amp; cleared PDCs</p>
                </CardContent>
              </Card>

              <Card className={`border ${summary.closingBalance > 0 ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900" : "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900"}`}>
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Net Due Balance</span>
                    <Badge variant={summary.closingBalance > 0 ? "destructive" : "default"} className="text-[9px] px-1.5 py-0">
                      {summary.closingBalance > 0 ? "Outstanding" : "Settled"}
                    </Badge>
                  </div>
                  <p className={`text-xl font-black font-mono ${summary.closingBalance > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    QAR {summary.closingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Current ledger balance</p>
                </CardContent>
              </Card>
            </div>

            {/* Overdue Aging Matrix */}
            <div className="p-3.5 rounded-lg border bg-muted/20 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Receivables Aging Analysis
                </span>
                <span className="text-[10px] text-muted-foreground">Standard 30-day aging brackets</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                <div className="p-2 rounded bg-background border">
                  <span className="text-[10px] text-muted-foreground block">Current (0-30d)</span>
                  <span className="font-bold text-foreground">QAR {summary.aging.current.toLocaleString()}</span>
                </div>
                <div className="p-2 rounded bg-background border">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 block">31-60 Days</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">QAR {summary.aging.d30_60.toLocaleString()}</span>
                </div>
                <div className="p-2 rounded bg-background border">
                  <span className="text-[10px] text-orange-600 dark:text-orange-400 block">61-90 Days</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">QAR {summary.aging.d61_90.toLocaleString()}</span>
                </div>
                <div className="p-2 rounded bg-background border">
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 block">&gt; 90 Days</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">QAR {summary.aging.d90plus.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </>
        )}

        {/* ── Security Deposit KPI Summary Cards ── */}
        {statementMode === "deposit" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border bg-card">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Deposits Received</span>
                <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  + QAR {depositSummary.totalReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-muted-foreground">Tenant security deposits collected</p>
              </CardContent>
            </Card>

            <Card className="border bg-card">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Claims &amp; Deductions</span>
                <p className="text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
                  - QAR {depositSummary.totalDeducted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-muted-foreground">Damages, repairs &amp; utility offsets</p>
              </CardContent>
            </Card>

            <Card className="border bg-card">
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Refunds Returned</span>
                <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                  - QAR {depositSummary.totalRefunded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-muted-foreground">Returned upon lease expiry</p>
              </CardContent>
            </Card>

            <Card className="border bg-primary/5 border-primary/30">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary block">Net Deposit in Custody</span>
                  <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/40 px-1.5 py-0 font-bold">
                    Escrow Held
                  </Badge>
                </div>
                <p className="text-xl font-black font-mono text-primary">
                  QAR {depositSummary.netHeld.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-muted-foreground">Current active security held</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── PDC In Hand KPI Summary Cards ── */}
        {statementMode === "pdc" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">PDCs In Hand (Vault)</span>
                  <Badge variant="outline" className="text-[9px] bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-300">
                    In Custody
                  </Badge>
                </div>
                <p className="text-lg font-bold font-mono text-blue-700 dark:text-blue-400">
                  QAR {pdcSummary.totalInHand.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-muted-foreground">Awaiting presentation date</p>
              </CardContent>
            </Card>

            <Card className="border bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">Deposited (Clearing)</span>
                  <Badge variant="outline" className="text-[9px] bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-300">
                    Bank Pending
                  </Badge>
                </div>
                <p className="text-lg font-bold font-mono text-amber-700 dark:text-amber-400">
                  QAR {pdcSummary.totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-muted-foreground">Presented, clearance awaited</p>
              </CardContent>
            </Card>

            <Card className="border bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">Cleared (Realized)</span>
                  <Badge variant="outline" className="text-[9px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-300">
                    Realized
                  </Badge>
                </div>
                <p className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  QAR {pdcSummary.totalCleared.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-muted-foreground">Credited to operating account</p>
              </CardContent>
            </Card>

            <Card className="border bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider block">Bounced / Dishonored</span>
                  <Badge variant="destructive" className="text-[9px] px-1.5 py-0">
                    Action Req.
                  </Badge>
                </div>
                <p className="text-lg font-bold font-mono text-rose-700 dark:text-rose-400">
                  QAR {pdcSummary.totalBounced.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-[10px] text-muted-foreground">Returned by clearing bank</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chronological Statement Ledger Table */}
        {statementMode === "receivables" && (
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted text-xs font-bold text-muted-foreground">
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Doc Type</TableHead>
                  <TableHead className="font-bold">Reference #</TableHead>
                  <TableHead className="font-bold">Particulars / Description</TableHead>
                  <TableHead className="font-bold">Property &amp; Unit</TableHead>
                  <TableHead className="text-right font-bold">Debit (QAR)</TableHead>
                  <TableHead className="text-right font-bold">Credit (QAR)</TableHead>
                  <TableHead className="text-right font-bold">Balance (QAR)</TableHead>
                  <TableHead className="text-center font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Opening Balance Row */}
                <TableRow className="bg-muted/30 text-xs font-semibold">
                  <TableCell className="font-mono text-muted-foreground">{formatDateDDMMYYYY(fromDate)}</TableCell>
                  <TableCell><Badge variant="outline" className="text-[9px]">OPENING</Badge></TableCell>
                  <TableCell className="font-mono text-muted-foreground">—</TableCell>
                  <TableCell className="font-medium text-foreground">Balance Brought Forward</TableCell>
                  <TableCell className="text-muted-foreground">—</TableCell>
                  <TableCell className="text-right font-mono">—</TableCell>
                  <TableCell className="text-right font-mono">—</TableCell>
                  <TableCell className="text-right font-mono font-bold text-foreground">
                    {summary.openingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">—</TableCell>
                </TableRow>

                {ledgerRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-6 text-xs text-muted-foreground">
                      No transactions recorded for this customer in the selected date range.
                    </TableCell>
                  </TableRow>
                ) : (
                  ledgerRows.map(row => (
                    <TableRow key={row.id} className="hover:bg-muted/20 text-xs">
                      <TableCell className="font-mono text-muted-foreground">{formatDateDDMMYYYY(row.date)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={row.docType === "INVOICE" ? "outline" : "default"}
                          className={`text-[9px] ${row.docType === "INVOICE" ? "border-rose-400 text-rose-600" : "bg-emerald-600 text-white"}`}
                        >
                          {row.docType === "INVOICE" ? "INV" : row.docType === "RECEIPT" ? "REC" : "PDC"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-bold">
                        {row.rawInvoice ? (
                          <button
                            onClick={() => setSelectedInvoiceForView(row.rawInvoice || null)}
                            className="text-primary hover:underline font-bold"
                            title="Click to view/print invoice"
                          >
                            {row.refNo}
                          </button>
                        ) : (
                          <span className="text-foreground">{row.refNo}</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[260px] truncate" title={row.description}>
                        {row.description}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.property} &bull; <strong className="font-mono text-foreground">{row.unit}</strong>
                      </TableCell>
                      <TableCell className="text-right font-mono text-rose-600 dark:text-rose-400 font-semibold">
                        {row.debit > 0 ? row.debit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {row.credit > 0 ? row.credit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-foreground">
                        {row.runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={row.status === "Paid" || row.status === "Settled" || row.status === "Cleared" ? "default" : row.status === "Overdue" ? "destructive" : "outline"}
                          className="text-[9px]"
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

        )}

        {/* ── Security Deposit Ledger Table ── */}
        {statementMode === "deposit" && (
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted text-xs font-bold text-muted-foreground">
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Doc Type</TableHead>
                  <TableHead className="font-bold">Voucher #</TableHead>
                  <TableHead className="font-bold">Particulars / Description</TableHead>
                  <TableHead className="font-bold">Property &amp; Unit</TableHead>
                  <TableHead className="font-bold">Payment Mode</TableHead>
                  <TableHead className="text-right font-bold">Deposit Received (Cr)</TableHead>
                  <TableHead className="text-right font-bold">Deductions (Dr)</TableHead>
                  <TableHead className="text-right font-bold">Refund Paid (Dr)</TableHead>
                  <TableHead className="text-right font-bold">Held Balance (QAR)</TableHead>
                  <TableHead className="text-center font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depositRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-6 text-xs text-muted-foreground">
                      No security deposit transactions recorded for this customer.
                    </TableCell>
                  </TableRow>
                ) : (
                  depositRows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/20 text-xs">
                      <TableCell className="font-mono text-muted-foreground">{formatDateDDMMYYYY(row.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[9px] ${row.depositReceived > 0 ? "border-emerald-400 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40" : row.refundPaid > 0 ? "border-blue-400 text-blue-700 bg-blue-50 dark:bg-blue-950/40" : "border-rose-400 text-rose-700 bg-rose-50 dark:bg-rose-950/40"}`}>
                          {row.depositReceived > 0 ? "DEP-RCV" : row.refundPaid > 0 ? "DEP-REF" : "DEP-CLM"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-foreground">{row.voucherNo}</TableCell>
                      <TableCell className="font-medium max-w-[260px] truncate" title={row.description}>{row.description}</TableCell>
                      <TableCell className="text-muted-foreground">{row.property} &bull; <strong className="font-mono text-foreground">{row.unit}</strong></TableCell>
                      <TableCell className="text-muted-foreground">{row.paymentMode}</TableCell>
                      <TableCell className="text-right font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                        {row.depositReceived > 0 ? row.depositReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-rose-600 dark:text-rose-400 font-semibold">
                        {row.deductions > 0 ? row.deductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-amber-600 dark:text-amber-400 font-semibold">
                        {row.refundPaid > 0 ? row.refundPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-foreground">
                        {row.runningBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30">
                          {row.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* ── PDC In Hand & Custody Register Table ── */}
        {statementMode === "pdc" && (
          <div className="border rounded-lg overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted text-xs font-bold text-muted-foreground">
                  <TableHead className="font-bold">Cheque #</TableHead>
                  <TableHead className="font-bold">Bank Name</TableHead>
                  <TableHead className="font-bold">Maturity / Due Date</TableHead>
                  <TableHead className="font-bold">Property &amp; Unit</TableHead>
                  <TableHead className="font-bold">Particulars / Period</TableHead>
                  <TableHead className="text-right font-bold">Amount (QAR)</TableHead>
                  <TableHead className="text-center font-bold">Custody Status</TableHead>
                  <TableHead className="text-center font-bold">Qatar Legal Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pdcRegisterRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-xs text-muted-foreground">
                      No post-dated cheques found for this customer.
                    </TableCell>
                  </TableRow>
                ) : (
                  pdcRegisterRows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-muted/20 text-xs">
                      <TableCell className="font-mono font-bold text-foreground">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{row.chequeNo}</span>
                          {(row.dueDate === "2036-12-31" || String(row.bank || "").includes("Guarantee") || String(row.notes || "").toLowerCase().includes("guarantee")) && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-500/10 text-amber-700 border-amber-300 font-semibold">
                              Guarantee Cheque
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{row.bank}</TableCell>
                      <TableCell className="font-mono text-muted-foreground">{formatDateDDMMYYYY(row.dueDate)}</TableCell>
                      <TableCell className="text-muted-foreground">{row.property} &bull; <strong className="font-mono text-foreground">{row.unit}</strong></TableCell>
                      <TableCell className="text-muted-foreground">{row.notes || "—"}</TableCell>
                      <TableCell className="text-right font-mono font-bold text-foreground">
                        {row.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={row.status === "cleared" ? "default" : row.status === "deposited" ? "secondary" : row.status === "bounced" ? "destructive" : "outline"}
                          className={`text-[9px] capitalize ${row.status === "in_hand"
                              ? "border-teal-400 text-teal-700 bg-teal-50 dark:bg-teal-950/40"
                              : row.status === "cleared"
                                ? "bg-emerald-600 text-white"
                                : row.status === "replaced"
                                  ? "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300"
                                  : ""
                            }`}
                        >
                          {row.status === "replaced" ? "Replaced" : row.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {row.status === "bounced" ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                openPrintable7DayLegalNotice({
                                  chequeNo: row.chequeNo,
                                  chequeDate: row.dueDate,
                                  bankName: row.bank,
                                  amount: row.amount,
                                  returnReason: "عدم كفاية الرصيد (Insufficient Funds)",
                                  tenantName: currentCustomer.name,
                                  tenantQid: currentCustomer.qatarId,
                                  tenantMobile: currentCustomer.mobile || currentCustomer.phone,
                                  tenantEmail: currentCustomer.email,
                                  propertyName: row.property,
                                  unitRef: row.unit,
                                  totalOutstandingArrears: summary.closingBalance,
                                });
                              }}
                              className="h-6 text-[10px] px-2 border-rose-500/40 text-rose-700 dark:text-rose-400 hover:bg-rose-500/10 gap-1 font-semibold"
                              title="Generate official 7-Day Legal Notice (Article 357 Penal Code)"
                            >
                              <Scale className="h-3 w-3 text-rose-600" /> 7-Day Notice
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                openPrintableRdcFilingPack({
                                  chequeNo: row.chequeNo,
                                  chequeDate: row.dueDate,
                                  bankName: row.bank,
                                  amount: row.amount,
                                  returnReason: "عدم كفاية الرصيد (Insufficient Funds)",
                                  tenantName: currentCustomer.name,
                                  tenantQid: currentCustomer.qatarId,
                                  tenantMobile: currentCustomer.mobile || currentCustomer.phone,
                                  tenantEmail: currentCustomer.email,
                                  propertyName: row.property,
                                  unitRef: row.unit,
                                  totalOutstandingArrears: summary.closingBalance,
                                });
                              }}
                              className="h-6 text-[10px] px-2 border-blue-500/40 text-blue-700 dark:text-blue-400 hover:bg-blue-500/10 gap-1 font-semibold"
                              title="Generate RDC (Rental Dispute Settlement Committee) Filing Pack"
                            >
                              <FileText className="h-3 w-3 text-blue-600" /> RDC Pack
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* In-Hand Upcoming PDCs Section */}
        {statementMode === "receivables" && upcomingPdcs.length > 0 && (
          <div className="p-4 rounded-lg border bg-muted/15 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-primary" />
                <span className="font-bold text-foreground">Post-Dated Cheques (PDC) Currently in Vault</span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {upcomingPdcs.length} cheques &bull; QAR {totalUpcomingPdcAmount.toLocaleString()}
                </Badge>
              </div>

              <span className="text-muted-foreground">
                Projected Balance after Realization:{" "}
                <strong className="text-primary font-mono font-bold">
                  QAR {(summary.closingBalance - totalUpcomingPdcAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </strong>
              </span>
            </div>

            <div className="border rounded-md overflow-hidden bg-background">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 text-[11px] font-bold">
                    <TableHead>Cheque #</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Maturity / Due Date</TableHead>
                    <TableHead className="text-right">Amount (QAR)</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingPdcs.map(p => {
                    const isGChq = p.isGuaranteeCheque || p.dueDate === "2036-12-31" || p.date === "2036-12-31" || String(p.bank || "").includes("Guarantee") || String(p.notes || "").toLowerCase().includes("guarantee");
                    return (
                      <TableRow key={p.id} className="text-xs">
                        <TableCell className="font-mono font-bold">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span>{p.chequeNo || p.chequeNumber || (p as any).cheque_number}</span>
                            {isGChq && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-500/10 text-amber-700 border-amber-300 font-semibold">
                                Guarantee Cheque
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{isGChq ? "Guarantee Cheque (Undated / Custody)" : (p.bank || "Qatar National Bank (QNB)")}</TableCell>
                        <TableCell className="font-mono">
                          {isGChq ? "31-12-2036 (Undated / Custody)" : (p.dueDate || p.date || (p as any).maturity_date)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-[10px] capitalize border-teal-500 text-teal-700 bg-teal-50">
                            {p.status === "received" || p.status === "in_hand" ? "In Vault" : p.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Remittance & Signatures Box (2 Columns: EN & AR) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/20 text-xs">
          {/* Left: English Remittance */}
          <div className="space-y-1 text-left">
            <span className="font-bold text-[10px] uppercase tracking-wider text-primary flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Remittance &amp; Bank Transfer Details (EN)
            </span>
            <p className="text-muted-foreground">Bank: <strong className="text-foreground">Commercial Bank of Qatar (CBQ) / Dukhan Bank</strong></p>
            <p className="text-muted-foreground">Account Name: <strong className="text-foreground">{branding.legalEntityName || "Al Ameen Real Estate W.L.L"}</strong></p>
            <p className="text-muted-foreground font-mono">IBAN: <strong className="text-foreground">QA52 CBQA 0000 0000 1289 4012 34</strong></p>
            <p className="text-muted-foreground font-mono">SWIFT: <strong className="text-foreground">CBQAQAQA</strong></p>
            <div className="pt-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">For {branding.companyName || "Al Ameen Real Estate"}</p>
              <div className="h-10 flex items-center">
                <div className="border border-dashed border-muted-foreground/40 rounded px-3 py-1 text-[9px] font-mono text-muted-foreground">
                  [FINANCIAL CONTROLLER STAMP]
                </div>
              </div>
            </div>
          </div>

          {/* Right: Arabic Remittance */}
          <div className="space-y-1 text-right md:border-l md:pl-4" dir="rtl">
            <span className="font-bold text-[10px] uppercase tracking-wider text-primary flex items-center justify-end gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> تعليمات التحويل البنكي والاعتماد (AR)
            </span>
            <p className="text-muted-foreground">البنك: <strong className="text-foreground">البنك التجاري (CBQ) / بنك دخان</strong></p>
            <p className="text-muted-foreground">اسم الحساب: <strong className="text-foreground">شركة الأمين للعقارات ذ.م.م</strong></p>
            <p className="text-muted-foreground font-mono">الآيبان: <strong className="text-foreground">QA52 CBQA 0000 0000 1289 4012 34</strong></p>
            <p className="text-muted-foreground font-mono">السويفت كود: <strong className="text-foreground">CBQAQAQA</strong></p>
            <div className="pt-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">عن شركة الأمين للعقارات</p>
              <div className="h-10 flex items-center justify-start">
                <div className="border border-dashed border-muted-foreground/40 rounded px-3 py-1 text-[9px] font-mono text-muted-foreground">
                  [خـتـم الإدارة الـمـالـيـة والـتـدقـيـق]
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="text-[10px] text-muted-foreground text-center border-t pt-3">
          Please notify the Accounts department of any discrepancy within 15 days of this statement.
        </div>
      </div>

      {/* Individual Invoice View Dialog */}
      <InvoiceViewDialog
        invoice={selectedInvoiceForView}
        open={Boolean(selectedInvoiceForView)}
        onOpenChange={open => { if (!open) setSelectedInvoiceForView(null); }}
        customerDetails={{
          code: currentCustomer.customerId || currentCustomer.id,
          qid: currentCustomer.qatarId || currentCustomer.crNumber,
          phone: currentCustomer.mobile || currentCustomer.phone,
          email: currentCustomer.email,
        }}
      />

      {/* Bulk Invoicing Modal */}
      <BulkInvoiceDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        defaultMode="customer"
        initialCustomerId={currentCustomer.id}
      />
    </div>
  );
}
