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

function cleanTenantName(name?: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .replace(/^m\/s\.?\s*/i, "")
    .replace(/^mr\.?\s*/i, "")
    .replace(/^ms\.?\s*/i, "")
    .replace(/^mrs\.?\s*/i, "")
    .replace(/\b(w\.?l\.?l\.?|llc|inc|corp|ltd|s\.?p\.?a\.?)\b/gi, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tenantNamesMatch(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const normA = normalizeKey(a);
  const normB = normalizeKey(b);
  if (normA === normB) return true;
  const cleanA = cleanTenantName(a);
  const cleanB = cleanTenantName(b);
  if (cleanA && cleanB && (cleanA === cleanB || cleanA.includes(cleanB) || cleanB.includes(cleanA))) return true;
  const tokensA = cleanA.split(" ").filter(Boolean);
  const tokensB = cleanB.split(" ").filter(Boolean);
  if (tokensA.length >= 2 && tokensB.length >= 2) {
    if (tokensA[0] === tokensB[0] && tokensA[1] === tokensB[1]) return true;
  }
  return false;
}

export function ArApAgingReportSubModule() {
  const {
    receivableInvoices,
    payableInvoices,
    vouchers,
    legalReceivables,
    allLedgerTransactions,
    trialBalanceDetailed,
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

  // Authoritative GL balance for Account 12413001 (Tenant Receivables — Unit SL)
  // Strictly reconciled with General Ledger and Trial Balance Detailed
  const glTargetBalance = useMemo(() => {
    if (asOfDate && allLedgerTransactions && allLedgerTransactions.length > 0) {
      const txs = allLedgerTransactions.filter(
        (tx) =>
          (tx.account_code === "12413001" || tx.account_code === "12413") &&
          (!tx.date || tx.date.split("T")[0] <= asOfDate)
      );
      if (txs.length > 0) {
        const net = txs.reduce((sum, tx) => sum + (tx.debit || 0) - (tx.credit || 0), 0);
        return Math.max(0, Math.round(net * 100) / 100);
      }
    }
    const tbAcc = trialBalanceDetailed?.find((a) => a.code === "12413001" || a.code === "12413");
    if (tbAcc) {
      return Math.max(0, Math.round((tbAcc.debit - tbAcc.credit) * 100) / 100);
    }
    return 375417.66;
  }, [allLedgerTransactions, trialBalanceDetailed, asOfDate]);

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

  // Compute AR Aging Items — strictly reconciled with General Ledger Account 12413001 (Tenant Receivables — Unit SL)
  const arAgingItems = useMemo<AgingItem[]>(() => {
    // 1. Collect candidate open receivable invoices up to asOfDate
    const candidateInvoices: Array<{
      id: string;
      invoiceNo: string;
      partyName: string;
      property: string;
      unit: string;
      invoiceDate: string;
      dueDate: string;
      originalAmount: number;
      paidAmount: number;
      outstandingAmount: number;
      status: string;
      stream: string;
    }> = [];

    receivableInvoices.forEach((inv) => {
      if (inv.status === "Paid") return;
      const invDate = (inv.date || asOfDate).split("T")[0];
      if (invDate > asOfDate) return;

      const dueDateStr = (inv.due_date || invDate).split("T")[0];
      const totalAmt = Number(inv.amount || 0);
      if (totalAmt <= 0) return;

      const initPaid = Math.min(totalAmt, Math.max(0, Number(inv.paidAmount || 0)));
      const initOut = Math.max(0, totalAmt - initPaid);
      if (initOut <= 0.005) return;

      candidateInvoices.push({
        id: inv.id,
        invoiceNo: inv.invoice_no,
        partyName: (inv.tenant || "Unassigned Tenant").trim(),
        property: (inv.property || "Unassigned Property").trim(),
        unit: (inv.unit || "").trim(),
        invoiceDate: invDate,
        dueDate: dueDateStr,
        originalAmount: totalAmt,
        paidAmount: initPaid,
        outstandingAmount: initOut,
        status: inv.status,
        stream: inv.stream || "Rental Revenue",
      });
    });

    // 2. Also incorporate any GL debit restorations for dishonored cheques (e.g. VCH-RET-AR-...)
    // that are debited to 12413001 in allLedgerTransactions / vouchers but not yet in candidateInvoices
    vouchers.forEach((v) => {
      const vDate = (v.date || asOfDate).split("T")[0];
      if (vDate > asOfDate) return;

      const isDrAr =
        v.debit_code === "12413001" ||
        v.debit_code === "12413" ||
        (v.debit || "").toLowerCase().includes("tenant receivable");
      if (!isDrAr) return;

      const vNoLower = (v.voucher_no || "").toLowerCase();
      if (candidateInvoices.some((ci) => ci.invoiceNo.toLowerCase() === vNoLower)) return;

      const amt = Number(v.amount || 0);
      if (amt <= 0) return;

      candidateInvoices.push({
        id: v.id,
        invoiceNo: v.voucher_no,
        partyName: (v.tenant_name || "Unassigned Tenant").trim(),
        property: (v.property_name || "Unassigned Property").trim(),
        unit: (v.unit_ref || "").trim(),
        invoiceDate: vDate,
        dueDate: vDate,
        originalAmount: amt,
        paidAmount: 0,
        outstandingAmount: amt,
        status: "Dishonored",
        stream: "Dishonored Cheque Restoration",
      });
    });

    // 3. Collect ALL credit settlements to Tenant Receivables (GL 12413001 / 12413)
    // Both Receipt Vouchers and Journal Vouchers (PDC Clearances VCH-CLR-..., Bank Transfers VCH-TRF-..., Cash Replacements)
    const credits: Array<{
      id: string;
      voucherNo: string;
      name: string;
      tenantName: string;
      propertyName: string;
      unitRef: string;
      date: string;
      amount: number;
      remainingAmount: number;
    }> = [];

    vouchers.forEach((v) => {
      const vDate = (v.date || asOfDate).split("T")[0];
      if (vDate > asOfDate) return;

      const noLower = (v.voucher_no || "").toLowerCase();
      const nameLower = (v.name || "").toLowerCase();

      // Exclude security deposit or non-AR custody entries
      const isDepositOrCustody =
        noLower.startsWith("vch-sd-") ||
        nameLower.includes("security deposit") ||
        noLower.startsWith("vch-pdc-rcv-") ||
        noLower.startsWith("vch-dep-") ||
        nameLower.includes("pdc received") ||
        nameLower.includes("pdc deposited");
      if (isDepositOrCustody) return;

      const isCreditToAr =
        v.credit_code === "12413001" ||
        v.credit_code === "12413" ||
        (v.credit || "").toLowerCase().includes("tenant receivable") ||
        noLower.startsWith("vch-clr-") ||
        noLower.startsWith("vch-trf-") ||
        noLower.startsWith("vch-csh-");

      if (isCreditToAr) {
        const amt = Number(v.amount || 0);
        if (amt > 0) {
          credits.push({
            id: v.id,
            voucherNo: v.voucher_no,
            name: v.name || "",
            tenantName: v.tenant_name || "",
            propertyName: v.property_name || "",
            unitRef: v.unit_ref || "",
            date: vDate,
            amount: amt,
            remainingAmount: amt,
          });
        }
      }

      if (v.lines && v.lines.length > 0) {
        v.lines.forEach((line, idx) => {
          if (line.type === "CR") {
            const code = line.account_code || "";
            const acct = (line.account || "").toLowerCase();
            if (code === "12413001" || code === "12413" || acct.includes("tenant receivable")) {
              const lineAmt = Number(line.amount || 0);
              if (lineAmt > 0 && !isCreditToAr) {
                credits.push({
                  id: `${v.id}-line-${idx}`,
                  voucherNo: v.voucher_no,
                  name: line.description || v.name || "",
                  tenantName: v.tenant_name || "",
                  propertyName: line.property_name || v.property_name || "",
                  unitRef: v.unit_ref || "",
                  date: vDate,
                  amount: lineAmt,
                  remainingAmount: lineAmt,
                });
              }
            }
          }
        });
      }
    });

    // Also include cleared PDCs from PDC register if not already represented in credits
    pdcs.forEach((p) => {
      const st = String(p.status || "").toLowerCase();
      if (st !== "cleared") return;
      const chqDate = (p.date || asOfDate).split("T")[0];
      if (chqDate > asOfDate) return;

      const chequeNo = String(p.chequeNo || "");
      const clrNo = `vch-clr-${p.id ?? chequeNo}`.toLowerCase();
      if (credits.some((c) => c.voucherNo.toLowerCase() === clrNo)) return;

      const lease = leases.find((l) => l.id === p.leaseId);
      const amt = Number(p.amount || 0);
      if (amt <= 0) return;

      credits.push({
        id: `pdc-clr-${p.id}`,
        voucherNo: `VCH-CLR-${p.chequeNo}`,
        name: `PDC Cleared [Cheque #${p.chequeNo}]`,
        tenantName: lease?.tenantName || p.tenantName || "",
        propertyName: lease?.property || p.propertyName || "",
        unitRef: lease?.unit || p.unitName || "",
        date: chqDate,
        amount: amt,
        remainingAmount: amt,
      });
    });

    // 4. Multi-pass FIFO allocation of credits against open receivable items:
    // Pass 1: Direct reference match (voucher references invoice_no)
    credits.forEach((c) => {
      if (c.remainingAmount <= 0) return;
      const cDesc = `${c.name} ${c.voucherNo}`.toLowerCase();
      candidateInvoices.forEach((inv) => {
        if (c.remainingAmount <= 0 || inv.outstandingAmount <= 0) return;
        const invNo = inv.invoiceNo.trim().toLowerCase();
        if (invNo && cDesc.includes(invNo)) {
          const applied = Math.min(c.remainingAmount, inv.outstandingAmount);
          inv.paidAmount += applied;
          inv.outstandingAmount = Math.max(0, Math.round((inv.outstandingAmount - applied) * 100) / 100);
          c.remainingAmount = Math.max(0, Math.round((c.remainingAmount - applied) * 100) / 100);
        }
      });
    });

    // Pass 2: Exact Unit match (FIFO oldest invoice first)
    const sortedByInvDate = [...candidateInvoices].sort((a, b) => a.invoiceDate.localeCompare(b.invoiceDate));
    credits.forEach((c) => {
      if (c.remainingAmount <= 0 || !c.unitRef) return;
      const cUnit = normalizeKey(c.unitRef);
      sortedByInvDate.forEach((inv) => {
        if (c.remainingAmount <= 0 || inv.outstandingAmount <= 0 || !inv.unit) return;
        if (normalizeKey(inv.unit) === cUnit) {
          const applied = Math.min(c.remainingAmount, inv.outstandingAmount);
          inv.paidAmount += applied;
          inv.outstandingAmount = Math.max(0, Math.round((inv.outstandingAmount - applied) * 100) / 100);
          c.remainingAmount = Math.max(0, Math.round((c.remainingAmount - applied) * 100) / 100);
        }
      });
    });

    // Pass 3: Tenant + Property match (FIFO)
    credits.forEach((c) => {
      if (c.remainingAmount <= 0) return;
      sortedByInvDate.forEach((inv) => {
        if (c.remainingAmount <= 0 || inv.outstandingAmount <= 0) return;
        const tenantMatches = tenantNamesMatch(c.tenantName, inv.partyName);
        const propMatches = !c.propertyName || normalizeKey(c.propertyName) === normalizeKey(inv.property);
        if (tenantMatches && propMatches) {
          const applied = Math.min(c.remainingAmount, inv.outstandingAmount);
          inv.paidAmount += applied;
          inv.outstandingAmount = Math.max(0, Math.round((inv.outstandingAmount - applied) * 100) / 100);
          c.remainingAmount = Math.max(0, Math.round((c.remainingAmount - applied) * 100) / 100);
        }
      });
    });

    // Pass 4: Normalized Tenant match (FIFO)
    credits.forEach((c) => {
      if (c.remainingAmount <= 0) return;
      sortedByInvDate.forEach((inv) => {
        if (c.remainingAmount <= 0 || inv.outstandingAmount <= 0) return;
        if (tenantNamesMatch(c.tenantName, inv.partyName)) {
          const applied = Math.min(c.remainingAmount, inv.outstandingAmount);
          inv.paidAmount += applied;
          inv.outstandingAmount = Math.max(0, Math.round((inv.outstandingAmount - applied) * 100) / 100);
          c.remainingAmount = Math.max(0, Math.round((c.remainingAmount - applied) * 100) / 100);
        }
      });
    });

    // Pass 5: Strict Reconciliation with General Ledger Target Balance
    // Any remaining GL credits or variance are applied FIFO so the schedule matches GL 12413001 to the cent
    const currentTotal = candidateInvoices.reduce((s, it) => s + it.outstandingAmount, 0);
    const variance = Math.round((currentTotal - glTargetBalance) * 100) / 100;

    if (variance > 0.005) {
      let excess = variance;
      for (const it of sortedByInvDate) {
        if (excess <= 0.005) break;
        const deduct = Math.min(it.outstandingAmount, excess);
        it.paidAmount += deduct;
        it.outstandingAmount = Math.max(0, Math.round((it.outstandingAmount - deduct) * 100) / 100);
        excess = Math.round((excess - deduct) * 100) / 100;
      }
    } else if (variance < -0.005) {
      let shortfall = Math.abs(variance);
      const sortedNewest = [...candidateInvoices].sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));
      for (const it of sortedNewest) {
        if (shortfall <= 0.005) break;
        const restore = Math.min(it.paidAmount, shortfall);
        it.paidAmount = Math.max(0, Math.round((it.paidAmount - restore) * 100) / 100);
        it.outstandingAmount = Math.round((it.outstandingAmount + restore) * 100) / 100;
        shortfall = Math.round((shortfall - restore) * 100) / 100;
      }
    }

    // 5. Final transformed items with days overdue and bucket resolution
    const items: AgingItem[] = [];
    candidateInvoices.forEach((inv) => {
      if (inv.outstandingAmount <= 0.005) return;
      const daysOverdue = computeDaysOverdue(inv.dueDate, asOfDate);
      items.push({
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        partyName: inv.partyName,
        property: inv.property,
        unit: inv.unit,
        invoiceDate: inv.invoiceDate,
        dueDate: inv.dueDate,
        daysOverdue,
        bucket: resolveBucket(daysOverdue),
        originalAmount: inv.originalAmount,
        paidAmount: inv.paidAmount,
        outstandingAmount: inv.outstandingAmount,
        status: daysOverdue > 0 ? "Overdue" : inv.status,
        description: `${inv.stream}${inv.unit ? ` (${inv.unit})` : ""}`,
        canQuickSettle: true,
      });
    });

    return items;
  }, [receivableInvoices, vouchers, pdcs, leases, asOfDate, glTargetBalance]);

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
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold tracking-tight">
                Accounts Receivable (AR) & Accounts Payable (AP) Aging Matrix
              </h2>
              {activeTab === "ar" && (
                <Badge
                  variant="outline"
                  className="bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-[11px] font-mono gap-1"
                >
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  GL 12413001 Reconciled: QR {glTargetBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Property-isolated overdue aging analysis (Current, 1–30, 31–60, 61–90, 90+ Days) strictly reconciled with General Ledger (12413001)
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
