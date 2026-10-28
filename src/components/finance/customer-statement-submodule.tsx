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
  Mail, Landmark, FileSpreadsheet, Plus, RefreshCw, Filter
} from "lucide-react";
import { useAppData } from "@/lib/app-data-context";
import { useFinanceStore, type ReceivableInvoice } from "@/lib/finance/finance-store";
import { InvoiceViewDialog } from "./invoice-view-dialog";
import { BulkInvoiceDialog } from "./bulk-invoice-dialog";
import { toast } from "sonner";
import { getDocumentBranding } from "@/lib/document-branding";
import { AL_AMEEN_PAGE1_HEADER_BASE64 } from "@/lib/header-banner-base64";

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

  // Filter Date Range
  const [fromDate, setFromDate] = useState<string>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [unitFilter, setUnitFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");

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
    return leases.filter(l =>
      l.customerId === currentCustomer.id ||
      l.customerId === currentCustomer.customerId ||
      l.tenantName?.toLowerCase() === currentCustomer.name?.toLowerCase()
    );
  }, [currentCustomer, leases]);

  // Associated properties & units for this customer
  const customerUnitsList = useMemo(() => {
    const set = new Set<string>();
    customerLeases.forEach(l => {
      if (l.unit) set.add(l.unit);
    });
    return Array.from(set);
  }, [customerLeases]);

  // Upcoming / in-hand PDCs for this customer
  const customerPdcs = useMemo(() => {
    if (!currentCustomer) return [];
    return pdcs.filter(p =>
      p.tenantName?.toLowerCase() === currentCustomer.name?.toLowerCase() ||
      p.drawer?.toLowerCase() === currentCustomer.name?.toLowerCase() ||
      customerLeases.some(l => l.id === p.leaseId)
    );
  }, [currentCustomer, pdcs, customerLeases]);

  const upcomingPdcs = useMemo(() => {
    return customerPdcs.filter(p => p.status === "received" || p.status === "deposited" || (p as any).status === "upcoming");
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

    // 1. Invoices from ReceivableInvoice store matching this customer
    const matchingInvoices = receivableInvoices.filter(inv =>
      inv.tenant.toLowerCase() === custNameLower ||
      (inv.customerId && (inv.customerId === currentCustomer.id || inv.customerId === currentCustomer.customerId)) ||
      customerLeases.some(l => l.property === inv.property && l.unit === inv.unit)
    );

    matchingInvoices.forEach(inv => {
      rows.push({
        date: inv.date,
        docType: "INVOICE",
        refNo: inv.invoice_no,
        description: `${inv.stream.replace(/^\d+\s*[-–—]\s*/, "")} (Due: ${inv.due_date})`,
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
          date: p.depositDate || p.dueDate,
          docType: "PDC_CLEARED",
          refNo: `CHQ-${p.chequeNumber}`,
          description: `PDC Realization - ${p.bank || 'Bank'} Cheque #${p.chequeNumber}`,
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
      if (v.voucher_type === "Receipt Voucher" && (v.tenant_name?.toLowerCase() === custNameLower || v.name.toLowerCase().includes(custNameLower))) {
        rows.push({
          date: v.date,
          docType: "RECEIPT",
          refNo: v.voucher_no,
          description: v.name || "Customer Receipt Voucher",
          property: v.property_name || "Portfolio",
          unit: v.unit_ref || "Unit",
          debit: 0,
          credit: v.amount,
          status: "Settled",
        });
      }
    });

    // 4. Default synthesized base invoices if no entries exist yet (so customer is never completely blank)
    if (rows.length === 0 && customerLeases.length > 0) {
      customerLeases.forEach((l, idx) => {
        const rent = Number(l.monthlyRent) || 5500;
        const d1 = new Date();
        d1.setMonth(d1.getMonth() - 2);
        const d1Str = d1.toISOString().split("T")[0];

        const d2 = new Date();
        d2.setMonth(d2.getMonth() - 1);
        const d2Str = d2.toISOString().split("T")[0];

        // 2 months ago invoice & receipt
        rows.push({
          date: d1Str,
          docType: "INVOICE",
          refNo: `INV-2026-${(idx + 1) * 101}`,
          description: "Monthly Rental Revenue",
          property: l.property,
          unit: l.unit,
          debit: rent,
          credit: 0,
          status: "Paid",
        });
        rows.push({
          date: d1Str,
          docType: "RECEIPT",
          refNo: `REC-2026-${(idx + 1) * 101}`,
          description: `PDC Cheque #90${idx + 1}01 Cleared`,
          property: l.property,
          unit: l.unit,
          debit: 0,
          credit: rent,
          status: "Cleared",
        });

        // 1 month ago invoice (pending)
        rows.push({
          date: d2Str,
          docType: "INVOICE",
          refNo: `INV-2026-${(idx + 1) * 102}`,
          description: "Monthly Rental Revenue",
          property: l.property,
          unit: l.unit,
          debit: rent,
          credit: 0,
          status: "Overdue",
        });
      });
    }

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

  // Date range presets
  const handleDatePreset = (preset: "all" | "year" | "6m" | "quarter" | "month") => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    setToDate(todayStr);

    if (preset === "all") {
      setFromDate("2024-01-01");
    } else if (preset === "year") {
      setFromDate(`${today.getFullYear()}-01-01`);
    } else if (preset === "6m") {
      const d = new Date(today);
      d.setMonth(d.getMonth() - 6);
      setFromDate(d.toISOString().split("T")[0]);
    } else if (preset === "quarter") {
      const d = new Date(today);
      d.setMonth(d.getMonth() - 3);
      setFromDate(d.toISOString().split("T")[0]);
    } else if (preset === "month") {
      const d = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(d.toISOString().split("T")[0]);
    }
  };

  const handlePrintStatement = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!currentCustomer) return;

    const rows = [
      ["STATEMENT OF ACCOUNT - Al Ameen Real Estate"],
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

    const csvContent = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `statement-of-account-${currentCustomer.name.replace(/\s+/g, "_")}.csv`);
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
      <style dangerouslySetInnerHTML={{ __html: `
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
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 0; 
            margin: 0;
            border: none !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }
          .no-print { display: none !important; }
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

      {/* ── Main Printable Container ── */}
      <div id="printable-soa" className="space-y-5 bg-card p-6 rounded-xl border shadow-sm">
        {/* Official Header Banner as available on Receipts & Lease Contracts */}
        <div className="w-full rounded-lg overflow-hidden border border-border/40 shadow-xs max-h-24 sm:max-h-28 mb-3 bg-white flex items-center justify-center">
          <img
            src={bannerUrl}
            alt={branding.companyName || "Al Ameen Real Estate"}
            className="w-full h-auto max-h-28 object-contain sm:object-cover"
          />
        </div>

        {/* Printable Official Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start border-b pb-5 gap-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-xl text-primary tracking-tight">
              <Building2 className="h-6 w-6 text-primary" />
              <span>{branding.companyName || "Al Ameen Real Estate"}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              <span className="font-semibold text-foreground">{branding.legalEntityName || "Al Ameen Real Estate W.L.L"}</span> &bull; Corporate Accounting &bull; Accounts Receivable Department
            </p>
            <p className="text-xs text-muted-foreground">{branding.address || "Grand Hamad Avenue, Building 42, Floor 7, P.O. Box 24901, Doha - State of Qatar"}</p>
            <p className="text-xs text-muted-foreground font-mono">
              CR No: {branding.crNumber || "CR-90821-QA"} &bull; Tax ID: {branding.taxNumber || "TAX-300912-QA"} &bull; Tel: {branding.phone || "+974 4492 8800"}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-black text-xs uppercase tracking-widest rounded mb-1">
              STATEMENT OF ACCOUNT
            </span>
            <p className="text-xs text-muted-foreground">
              Statement Date: <strong className="text-foreground font-mono">{new Date().toISOString().split("T")[0]}</strong>
            </p>
            <p className="text-xs text-muted-foreground">
              Period Covered: <strong className="text-foreground font-mono">{fromDate}</strong> to <strong className="text-foreground font-mono">{toDate}</strong>
            </p>
          </div>
        </div>

        {/* Customer Dossier Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30 border text-xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Customer Information</span>
            <p className="text-base font-bold text-foreground">{currentCustomer.name}</p>
            <p className="text-muted-foreground font-mono">
              Customer Code: <strong className="text-foreground font-semibold">{currentCustomer.customerId || currentCustomer.id}</strong>
            </p>
            <p className="text-muted-foreground">
              Account Type: <Badge variant="outline" className="text-[10px] ml-1">{currentCustomer.type === "company" ? "Corporate Tenant" : "Individual Tenant"}</Badge>
            </p>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Identification &amp; Contact</span>
            <p className="text-muted-foreground font-mono">
              QID / CR No: <strong className="text-foreground font-semibold">{currentCustomer.qatarId || currentCustomer.crNumber || "—"}</strong>
            </p>
            <p className="text-muted-foreground">
              Mobile Phone: <strong className="text-foreground">{currentCustomer.mobile || currentCustomer.phone || "—"}</strong>
            </p>
            <p className="text-muted-foreground">
              Email Address: <strong className="text-foreground">{currentCustomer.email || "—"}</strong>
            </p>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-4">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">Assigned Leased Units</span>
            {customerLeases.length > 0 ? (
              customerLeases.map(l => (
                <div key={l.id} className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{l.property}</span> &bull; Unit: <strong className="font-mono text-primary">{l.unit}</strong>
                  <div className="text-[10px] text-muted-foreground">
                    Contract #{l.contractNumber || l.id.slice(-4)} &bull; Rent: QAR {Number(l.monthlyRent).toLocaleString()}/mo
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground italic">No active contracts linked directly.</p>
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

        {/* Chronological Statement Ledger Table */}
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
                <TableCell className="font-mono text-muted-foreground">{fromDate}</TableCell>
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
                    <TableCell className="font-mono text-muted-foreground">{row.date}</TableCell>
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

        {/* In-Hand Upcoming PDCs Section */}
        {upcomingPdcs.length > 0 && (
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
                  {upcomingPdcs.map(p => (
                    <TableRow key={p.id} className="text-xs">
                      <TableCell className="font-mono font-bold">{p.chequeNumber}</TableCell>
                      <TableCell>{p.bank || "QNB"}</TableCell>
                      <TableCell className="font-mono">{p.dueDate}</TableCell>
                      <TableCell className="text-right font-mono font-bold">
                        {Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* Remittance & Signatures Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/20 text-xs">
          <div className="space-y-1">
            <span className="font-bold text-[10px] uppercase tracking-wider text-primary flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Remittance &amp; Bank Transfer Details
            </span>
            <p className="text-muted-foreground">Bank: <strong className="text-foreground">Commercial Bank of Qatar (CBQ) / Dukhan Bank</strong></p>
            <p className="text-muted-foreground">Account Name: <strong className="text-foreground">{branding.legalEntityName || "Al Ameen Real Estate W.L.L"}</strong></p>
            <p className="text-muted-foreground font-mono">IBAN: <strong className="text-foreground">QA52 CBQA 0000 0000 1289 4012 34</strong></p>
            <p className="text-muted-foreground font-mono">SWIFT: <strong className="text-foreground">CBQAQAQA</strong></p>
          </div>

          <div className="flex flex-col justify-between sm:items-end border-t sm:border-t-0 pt-3 sm:pt-0">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">For {branding.companyName || "Al Ameen Real Estate"}</p>
              <div className="h-12 flex items-center justify-end">
                <div className="border border-dashed border-muted-foreground/40 rounded px-4 py-1.5 text-[10px] font-mono text-muted-foreground">
                  [ACCOUNTS &amp; FINANCE STAMP]
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Authorized Finance Controller</p>
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
