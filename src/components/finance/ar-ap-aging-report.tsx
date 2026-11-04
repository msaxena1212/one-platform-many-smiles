import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Clock,
  Download,
  Printer,
  Search,
  Building2,
  CheckCircle2,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import { useFinanceStore } from "@/lib/finance/finance-store";
import { useAppData } from "@/lib/app-data-context";
import { toast } from "sonner";

interface AgingItem {
  id: string;
  invoiceNo: string;
  partyName: string;
  property: string;
  unit?: string;
  invoiceDate: string;
  dueDate: string;
  daysOverdue: number;
  bucket: "current" | "1_30" | "31_60" | "61_90" | "90_plus";
  originalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
  description?: string;
  canQuickSettle?: boolean;
}

interface PartyAgingRow {
  partyName: string;
  property: string;
  invoiceCount: number;
  current: number;
  days1To30: number;
  days31To60: number;
  days61To90: number;
  days90Plus: number;
  totalOutstanding: number;
  items: AgingItem[];
}

function normalizeKey(val?: string): string {
  return (val || "").trim().toLowerCase();
}

export function ArApAgingReportSubModule() {
  const {
    receivableInvoices,
    payableInvoices,
    vouchers,
    legalReceivables,
    markPayableInvoicePaid,
    markReceivableInvoicePaid,
  } = useFinanceStore();
  const { units, leases, pdcs } = useAppData();

  const [activeTab, setActiveTab] = useState<"ar" | "ap">("ar");
  const [asOfDate, setAsOfDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [propertyFilter, setPropertyFilter] = useState<string>("ALL");
  const [bucketFilter, setBucketFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPartyRow, setSelectedPartyRow] = useState<PartyAgingRow | null>(null);

  // Build strict master list of real properties
  const propertiesList = useMemo(() => {
    const set = new Set<string>();
    units.forEach((u) => {
      if (u.property && u.property !== "Property") set.add(u.property.trim());
    });
    leases.forEach((l) => {
      if (l.property && l.property !== "Property") set.add(l.property.trim());
    });
    receivableInvoices.forEach((inv) => {
      if (inv.property) set.add(inv.property.trim());
    });
    payableInvoices.forEach((inv) => {
      if (inv.property && inv.property !== "Multiple Properties") set.add(inv.property.trim());
      inv.lines?.forEach((ln) => {
        if (ln.property) set.add(ln.property.trim());
      });
    });
    return Array.from(set).filter(Boolean).sort();
  }, [units, leases, receivableInvoices, payableInvoices]);

  const computeDaysOverdue = (dueDateStr: string, refDateStr: string): number => {
    const dueMs = new Date(dueDateStr).getTime();
    const refMs = new Date(refDateStr).getTime();
    if (isNaN(dueMs) || isNaN(refMs)) return 0;
    return Math.floor((refMs - dueMs) / (1000 * 60 * 60 * 24));
  };

  const resolveBucket = (daysOverdue: number): AgingItem["bucket"] => {
    if (daysOverdue <= 0) return "current";
    if (daysOverdue <= 30) return "1_30";
    if (daysOverdue <= 60) return "31_60";
    if (daysOverdue <= 90) return "61_90";
    return "90_plus";
  };

  // Compute AR Aging Items — strictly scoped to real unpaid AR Invoices, Bounced PDCs, and Legal Receivables
  const arAgingItems = useMemo<AgingItem[]>(() => {
    const items: AgingItem[] = [];
    const seenRefs = new Set<string>();

    // 1. Real Receivable Invoices (excluding Paid or future-dated after asOfDate)
    receivableInvoices.forEach((inv) => {
      if (inv.status === "Paid") return;
      const invDate = (inv.date || asOfDate).split("T")[0];
      if (invDate > asOfDate) return;

      const dueDateStr = (inv.due_date || invDate).split("T")[0];
      const totalAmt = Number(inv.amount || 0);
      if (totalAmt <= 0) return;

      // Strictly match only Receipt Vouchers explicitly referencing this exact invoice_no
      const invRefLower = inv.invoice_no.trim().toLowerCase();
      const voucherReceipts = vouchers
        .filter(
          (v) =>
            v.voucher_type === "Receipt Voucher" &&
            v.date <= asOfDate &&
            Boolean(invRefLower && v.name?.toLowerCase().includes(invRefLower))
        )
        .reduce((s, v) => s + Number(v.amount || 0), 0);

      const paidAmt = Math.min(totalAmt, Math.max(Number(inv.paidAmount || 0), voucherReceipts));
      const outstanding = Math.max(0, totalAmt - paidAmt);
      if (outstanding <= 0.005) return;

      seenRefs.add(invRefLower);
      const daysOverdue = computeDaysOverdue(dueDateStr, asOfDate);
      items.push({
        id: inv.id,
        invoiceNo: inv.invoice_no,
        partyName: (inv.tenant || "Unassigned Tenant").trim(),
        property: (inv.property || "Unassigned Property").trim(),
        unit: (inv.unit || "").trim(),
        invoiceDate: invDate,
        dueDate: dueDateStr,
        daysOverdue,
        bucket: resolveBucket(daysOverdue),
        originalAmount: totalAmt,
        paidAmount: paidAmt,
        outstandingAmount: outstanding,
        status: daysOverdue > 0 ? "Overdue" : inv.status,
        description: `${inv.stream || "Rental Revenue"}${inv.unit ? ` (${inv.unit})` : ""}`,
        canQuickSettle: true,
      });
    });

    // 2. Dishonored / Bounced PDCs (only if not already escalated to Legal Receivables)
    const escalatedCheques = new Set(
      legalReceivables.map((l) => l.legal_case_id.replace(/^LGL-/, "").trim().toLowerCase())
    );
    pdcs.forEach((pdc) => {
      const st = String(pdc.status || "").toLowerCase();
      if (st !== "bounced" && st !== "returned") return;
      const chqKey = String(pdc.chequeNo || "").trim().toLowerCase();
      if (chqKey && escalatedCheques.has(chqKey)) return;

      const lease = leases.find((l) => l.id === pdc.leaseId);
      // A returned/bounced cheque often has no linked lease row. Fall back to the
      // PDC's own property/unit/tenant, then to the unit master, so the dishonoured
      // amount stays under the real property instead of "Unassigned Property".
      const pdcUnitName = (lease?.unit || pdc.unitName || "").trim();
      const unitMaster = pdcUnitName
        ? units.find((u) => normalizeKey(u.unit) === normalizeKey(pdcUnitName))
        : undefined;
      const resolvedProperty = (
        lease?.property || pdc.propertyName || unitMaster?.property || ""
      ).trim();
      const origAmt = Number(pdc.amount || 0);
      const paidAmt = Number((pdc as any).paid_amount || 0);
      const amt = Math.max(0, origAmt - paidAmt);
      if (amt <= 0) return;

      const dueDateStr = (pdc.date || asOfDate).split("T")[0];
      if (dueDateStr > asOfDate) return;
      const daysOverdue = computeDaysOverdue(dueDateStr, asOfDate);

      items.push({
        id: `pdc-ar-${pdc.id}`,
        invoiceNo: `CHQ-${pdc.chequeNo}`,
        partyName: (lease?.tenantName || pdc.tenantName || unitMaster?.currentTenant || "Unassigned Tenant").trim(),
        property: resolvedProperty || "Unassigned Property",
        unit: pdcUnitName,
        invoiceDate: dueDateStr,
        dueDate: dueDateStr,
        daysOverdue,
        bucket: resolveBucket(daysOverdue),
        originalAmount: origAmt,
        paidAmount: paidAmt,
        outstandingAmount: amt,
        status: `Dishonored (${pdc.status})`,
        description: `Returned/Bounced Cheque #${pdc.chequeNo} (${pdc.bank || "Bank"})`,
        canQuickSettle: false,
      });
    });

    // 3. Escalated Legal Receivables (GL 12411)
    legalReceivables.forEach((lgl) => {
      if (lgl.status === "Fully Recovered" || Number(lgl.outstanding_balance || 0) <= 0) return;
      const escDate = (lgl.escalation_date || asOfDate).split("T")[0];
      if (escDate > asOfDate) return;
      const daysOverdue = computeDaysOverdue(escDate, asOfDate);

      items.push({
        id: lgl.id,
        invoiceNo: lgl.legal_case_id,
        partyName: (lgl.tenant_name || "Tenant").trim(),
        property: (lgl.property_name || "Unassigned Property").trim(),
        unit: (lgl.unit_ref || "").trim(),
        invoiceDate: escDate,
        dueDate: escDate,
        daysOverdue,
        bucket: resolveBucket(daysOverdue),
        originalAmount: Number(lgl.original_amount || 0),
        paidAmount: Math.max(0, Number(lgl.original_amount || 0) - Number(lgl.outstanding_balance || 0)),
        outstandingAmount: Number(lgl.outstanding_balance || 0),
        status: lgl.status,
        description: `Legal Escalation: ${lgl.reason}`,
        canQuickSettle: false,
      });
    });

    return items;
  }, [receivableInvoices, vouchers, pdcs, leases, legalReceivables, asOfDate]);

  // Compute AP Aging Items — splits multi-line AP invoices strictly per property line to prevent cross-property data leakage!
  const apAgingItems = useMemo<AgingItem[]>(() => {
    const items: AgingItem[] = [];

    payableInvoices.forEach((inv) => {
      if (inv.status === "Paid") return;
      const invDate = (inv.date || asOfDate).split("T")[0];
      if (invDate > asOfDate) return;

      const dueDateStr = (inv.due_date || invDate).split("T")[0];
      const totalAmt = Number(inv.amount || 0);
      if (totalAmt <= 0) return;

      // Strictly match ONLY Payment Vouchers explicitly referencing this exact invoice_no
      const invNoLower = inv.invoice_no.trim().toLowerCase();
      const paidViaVouchers = vouchers
        .filter(
          (v) =>
            v.voucher_type === "Payment Voucher" &&
            v.date <= asOfDate &&
            Boolean(invNoLower && (v.name?.toLowerCase().includes(invNoLower) || v.voucher_no.toLowerCase().includes(invNoLower)))
        )
        .reduce((s, v) => s + Number(v.amount || 0), 0);

      const totalPaid = Math.min(totalAmt, paidViaVouchers);
      const totalOutstanding = Math.max(0, totalAmt - totalPaid);
      if (totalOutstanding <= 0.005) return;

      const daysOverdue = computeDaysOverdue(dueDateStr, asOfDate);
      const bucket = resolveBucket(daysOverdue);
      const paidRatio = totalAmt > 0 ? totalPaid / totalAmt : 0;

      // Line-by-line property isolation: never leak Property B's share into Property A!
      if (inv.lines && inv.lines.length > 0) {
        inv.lines.forEach((ln, idx) => {
          const lineAmt = Number(ln.amount || 0);
          if (lineAmt <= 0) return;
          const linePaid = Math.round(lineAmt * paidRatio * 100) / 100;
          const lineOut = Math.max(0, Math.round((lineAmt - linePaid) * 100) / 100);
          if (lineOut <= 0) return;

          const lineProp = (ln.property || inv.property || "All / Corporate").trim();
          items.push({
            id: `${inv.id}-ln-${idx}`,
            invoiceNo: inv.invoice_no,
            partyName: (inv.vendor || "Vendor").trim(),
            property: lineProp,
            invoiceDate: invDate,
            dueDate: dueDateStr,
            daysOverdue,
            bucket,
            originalAmount: lineAmt,
            paidAmount: linePaid,
            outstandingAmount: lineOut,
            status: daysOverdue > 0 ? "Overdue" : inv.status,
            description: `${ln.account}${ln.description ? ` — ${ln.description}` : ""}`,
            canQuickSettle: inv.lines!.length === 1,
          });
        });
      } else {
        items.push({
          id: inv.id,
          invoiceNo: inv.invoice_no,
          partyName: (inv.vendor || "Vendor").trim(),
          property: (inv.property || "All / Corporate").trim(),
          invoiceDate: invDate,
          dueDate: dueDateStr,
          daysOverdue,
          bucket,
          originalAmount: totalAmt,
          paidAmount: totalPaid,
          outstandingAmount: totalOutstanding,
          status: daysOverdue > 0 ? "Overdue" : inv.status,
          description: inv.account || "Vendor Payable Invoice",
          canQuickSettle: true,
        });
      }
    });

    return items;
  }, [payableInvoices, vouchers, asOfDate]);

  // Group into PartyAgingRow strictly isolated by (partyName + property)
  const buildPartyRows = (sourceItems: AgingItem[]): PartyAgingRow[] => {
    const filtered = sourceItems.filter((item) => {
      if (propertyFilter !== "ALL" && normalizeKey(item.property) !== normalizeKey(propertyFilter)) return false;
      if (bucketFilter !== "ALL" && item.bucket !== bucketFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          item.partyName.toLowerCase().includes(q) ||
          item.invoiceNo.toLowerCase().includes(q) ||
          item.property.toLowerCase().includes(q) ||
          (item.unit && item.unit.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });

    const map = new Map<string, PartyAgingRow>();
    filtered.forEach((item) => {
      const key = `${normalizeKey(item.partyName)}__${normalizeKey(item.property)}`;
      const existing = map.get(key) || {
        partyName: item.partyName,
        property: item.property,
        invoiceCount: 0,
        current: 0,
        days1To30: 0,
        days31To60: 0,
        days61To90: 0,
        days90Plus: 0,
        totalOutstanding: 0,
        items: [],
      };
      existing.invoiceCount += 1;
      if (item.bucket === "current") existing.current += item.outstandingAmount;
      else if (item.bucket === "1_30") existing.days1To30 += item.outstandingAmount;
      else if (item.bucket === "31_60") existing.days31To60 += item.outstandingAmount;
      else if (item.bucket === "61_90") existing.days61To90 += item.outstandingAmount;
      else existing.days90Plus += item.outstandingAmount;

      existing.totalOutstanding += item.outstandingAmount;
      existing.items.push(item);
      map.set(key, existing);
    });

    return Array.from(map.values()).sort((a, b) => b.totalOutstanding - a.totalOutstanding);
  };

  const activeRows = useMemo(
    () => buildPartyRows(activeTab === "ar" ? arAgingItems : apAgingItems),
    [activeTab, arAgingItems, apAgingItems, propertyFilter, bucketFilter, searchQuery]
  );

  const totals = useMemo(() => {
    return activeRows.reduce(
      (acc, r) => ({
        current: acc.current + r.current,
        days1To30: acc.days1To30 + r.days1To30,
        days31To60: acc.days31To60 + r.days31To60,
        days61To90: acc.days61To90 + r.days61To90,
        days90Plus: acc.days90Plus + r.days90Plus,
        total: acc.total + r.totalOutstanding,
        invoices: acc.invoices + r.invoiceCount,
      }),
      { current: 0, days1To30: 0, days31To60: 0, days61To90: 0, days90Plus: 0, total: 0, invoices: 0 }
    );
  }, [activeRows]);

  const handleExportCsv = () => {
    const label = activeTab === "ar" ? "AR_Receivables_Aging" : "AP_Payables_Aging";
    const headers = [
      activeTab === "ar" ? "Customer / Tenant" : "Vendor / Supplier",
      "Property",
      "Open Docs",
      "Current (Not Due)",
      "1-30 Days Overdue",
      "31-60 Days Overdue",
      "61-90 Days Overdue",
      "90+ Days Overdue",
      "Total Outstanding (QAR)",
    ];
    const rows = activeRows.map((r) => [
      `"${r.partyName.replace(/"/g, '""')}"`,
      `"${r.property.replace(/"/g, '""')}"`,
      r.invoiceCount,
      r.current.toFixed(2),
      r.days1To30.toFixed(2),
      r.days31To60.toFixed(2),
      r.days61To90.toFixed(2),
      r.days90Plus.toFixed(2),
      r.totalOutstanding.toFixed(2),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${label}_${asOfDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${activeTab.toUpperCase()} Aging Report exported to CSV!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-xl p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Accounts Receivable (AR) & Accounts Payable (AP) Aging Matrix
            </h2>
            <p className="text-xs text-muted-foreground">
              Property-isolated overdue aging analysis (Current, 1–30, 31–60, 61–90, 90+ Days) strictly reconciled with General Ledger
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" /> Print Matrix
          </Button>
        </div>
      </div>

      {/* Mode Switcher & Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "ar" | "ap")} className="w-full lg:w-auto">
              <TabsList className="grid grid-cols-2 w-full sm:w-[380px]">
                <TabsTrigger value="ar" className="gap-1.5 text-xs font-semibold">
                  <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-600" />
                  AR Tenant Aging ({arAgingItems.length})
                </TabsTrigger>
                <TabsTrigger value="ap" className="gap-1.5 text-xs font-semibold">
                  <ArrowUpRight className="h-3.5 w-3.5 text-rose-600" />
                  AP Vendor Aging ({apAgingItems.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 flex-1 max-w-3xl">
              <div>
                <Label className="text-[11px] text-muted-foreground">Aging As-Of Date</Label>
                <Input
                  type="date"
                  value={asOfDate}
                  onChange={(e) => setAsOfDate(e.target.value)}
                  className="h-8 text-xs mt-0.5"
                />
              </div>

              <div>
                <Label className="text-[11px] text-muted-foreground">Property Filter</Label>
                <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                  <SelectTrigger className="h-8 text-xs mt-0.5">
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Properties (Consolidated)</SelectItem>
                    <SelectItem value="All / Corporate">All / Corporate Office</SelectItem>
                    {propertiesList.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px] text-muted-foreground">Overdue Bucket</Label>
                <Select value={bucketFilter} onValueChange={setBucketFilter}>
                  <SelectTrigger className="h-8 text-xs mt-0.5">
                    <SelectValue placeholder="All Buckets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Aging Buckets</SelectItem>
                    <SelectItem value="current">Current (Not Yet Due)</SelectItem>
                    <SelectItem value="1_30">1 – 30 Days Overdue</SelectItem>
                    <SelectItem value="31_60">31 – 60 Days Overdue</SelectItem>
                    <SelectItem value="61_90">61 – 90 Days Overdue</SelectItem>
                    <SelectItem value="90_plus">90+ Days Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px] text-muted-foreground">Search Party / Invoice</Label>
                <div className="relative mt-0.5">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Tenant, vendor, invoice #..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aging Bucket Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 border-l-4 border-l-emerald-500">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground block">Current (Not Due)</span>
          <span className="text-base font-bold font-mono text-emerald-600 mt-1 block">
            QR {totals.current.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </Card>
        <Card className="p-3.5 border-l-4 border-l-sky-500">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground block">1 – 30 Days</span>
          <span className="text-base font-bold font-mono text-sky-600 mt-1 block">
            QR {totals.days1To30.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </Card>
        <Card className="p-3.5 border-l-4 border-l-amber-500">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground block">31 – 60 Days</span>
          <span className="text-base font-bold font-mono text-amber-600 mt-1 block">
            QR {totals.days31To60.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </Card>
        <Card className="p-3.5 border-l-4 border-l-orange-500">
          <span className="text-[11px] font-semibold uppercase text-muted-foreground block">61 – 90 Days</span>
          <span className="text-base font-bold font-mono text-orange-600 mt-1 block">
            QR {totals.days61To90.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </Card>
        <Card className="p-3.5 border-l-4 border-l-rose-600 bg-rose-500/5">
          <span className="text-[11px] font-semibold uppercase text-rose-700 dark:text-rose-300 block">
            90+ Days Overdue
          </span>
          <span className="text-base font-bold font-mono text-rose-600 mt-1 block">
            QR {totals.days90Plus.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </Card>
        <Card className="p-3.5 border-l-4 border-l-primary bg-primary/5">
          <span className="text-[11px] font-semibold uppercase text-primary block">
            Total {activeTab === "ar" ? "Receivable" : "Payable"}
          </span>
          <span className="text-base font-bold font-mono text-foreground mt-1 block">
            QR {totals.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </Card>
      </div>

      {/* Main Aging Matrix Table */}
      <Card>
        <div className="rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs font-bold">
                  {activeTab === "ar" ? "Customer / Tenant" : "Vendor / Supplier"}
                </TableHead>
                <TableHead className="text-xs font-bold">Property</TableHead>
                <TableHead className="text-xs font-bold text-center">Docs</TableHead>
                <TableHead className="text-xs font-bold text-right">Current</TableHead>
                <TableHead className="text-xs font-bold text-right">1–30 Days</TableHead>
                <TableHead className="text-xs font-bold text-right">31–60 Days</TableHead>
                <TableHead className="text-xs font-bold text-right">61–90 Days</TableHead>
                <TableHead className="text-xs font-bold text-right text-rose-600">90+ Days</TableHead>
                <TableHead className="text-xs font-bold text-right">Total Balance</TableHead>
                <TableHead className="text-xs font-bold text-right">Drill-Down</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeRows.map((row) => (
                <TableRow
                  key={`${row.partyName}-${row.property}`}
                  className="hover:bg-muted/40 cursor-pointer"
                  onClick={() => setSelectedPartyRow(row)}
                >
                  <TableCell className="font-semibold text-xs">{row.partyName}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-muted-foreground" />
                      {row.property}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {row.invoiceCount}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-emerald-600">
                    {row.current > 0 ? `QR ${row.current.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-sky-600">
                    {row.days1To30 > 0 ? `QR ${row.days1To30.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-amber-600">
                    {row.days31To60 > 0 ? `QR ${row.days31To60.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-orange-600">
                    {row.days61To90 > 0 ? `QR ${row.days61To90.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold text-rose-600">
                    {row.days90Plus > 0 ? `QR ${row.days90Plus.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-bold">
                    QR {row.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPartyRow(row);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" /> Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {activeRows.length > 0 && (
                <TableRow className="bg-muted/60 font-bold border-t-2">
                  <TableCell className="text-xs">TOTAL ({activeRows.length} Accounts)</TableCell>
                  <TableCell className="text-xs">
                    {propertyFilter === "ALL" ? "All Properties" : propertyFilter}
                  </TableCell>
                  <TableCell className="text-center font-mono text-xs">{totals.invoices}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-emerald-700">
                    QR {totals.current.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-sky-700">
                    QR {totals.days1To30.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-amber-700">
                    QR {totals.days31To60.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-orange-700">
                    QR {totals.days61To90.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs text-rose-700">
                    QR {totals.days90Plus.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs font-extrabold">
                    QR {totals.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell />
                </TableRow>
              )}

              {activeRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-12 text-muted-foreground text-xs">
                    No unpaid {activeTab === "ar" ? "receivable invoices" : "payable bills"} match the selected property and aging filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Invoice-Level Drill-Down Dialog */}
      <Dialog open={Boolean(selectedPartyRow)} onOpenChange={(open) => !open && setSelectedPartyRow(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {selectedPartyRow?.partyName} — Document Aging Breakdown
            </DialogTitle>
            <DialogDescription className="text-xs">
              Property: <span className="font-semibold text-foreground">{selectedPartyRow?.property}</span> • As of{" "}
              {asOfDate}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border overflow-hidden max-h-[420px] overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs">Ref / Invoice #</TableHead>
                  <TableHead className="text-xs">Invoice Date</TableHead>
                  <TableHead className="text-xs">Due Date</TableHead>
                  <TableHead className="text-xs">Days Overdue</TableHead>
                  <TableHead className="text-xs">Description</TableHead>
                  <TableHead className="text-xs text-right">Balance (QAR)</TableHead>
                  <TableHead className="text-xs text-right">Quick Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedPartyRow?.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs font-semibold">{item.invoiceNo}</TableCell>
                    <TableCell className="text-xs font-mono">{item.invoiceDate}</TableCell>
                    <TableCell className="text-xs font-mono">{item.dueDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={item.daysOverdue > 60 ? "destructive" : "outline"}
                        className="text-[10px] font-mono"
                      >
                        {item.daysOverdue <= 0 ? "Current" : `${item.daysOverdue}d overdue`}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[240px] truncate">
                      {item.description}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">
                      QR {item.outstandingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.canQuickSettle ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] gap-1"
                          onClick={() => {
                            if (activeTab === "ar") {
                              markReceivableInvoicePaid(item.invoiceNo);
                            } else {
                              markPayableInvoicePaid(item.invoiceNo);
                            }
                            setSelectedPartyRow(null);
                          }}
                        >
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          {activeTab === "ar" ? "Record Receipt" : "Settle Bill"}
                        </Button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">{item.status}</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectedPartyRow(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
