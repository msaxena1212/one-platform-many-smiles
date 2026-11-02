import React, { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Building2,
  Calendar,
  DollarSign,
  Download,
  Printer,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  Filter,
  CheckSquare,
  Square,
  Eye,
  Home,
  Users,
  Layers,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useAppData } from "@/lib/app-data-context";
import { useFinanceStore, type ReceivableInvoice } from "@/lib/finance/finance-store";
import { getDocumentBranding } from "@/lib/document-branding";
import { AL_AMEEN_PAGE1_HEADER_BASE64 } from "@/lib/header-banner-base64";
import { exportToExcel } from "@/lib/excel-export";
import { InvoiceViewDialog } from "./invoice-view-dialog";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export interface UnbilledUnitRow {
  key: string;
  unit: string;
  property: string;
  occupancyStatus: "Occupied" | "Available" | "Reserved" | "Under Maintenance";
  tenantName: string;
  customerId?: string;
  contractNumber: string;
  leaseStartDate: string;
  leaseEndDate: string;
  monthlyRent: number;
  expectedBillingAmount: number;
  isInvoiced: boolean;
  invoiceNo?: string;
  invoiceDate?: string;
  invoiceAmount?: number;
  invoiceStatus?: string;
  rawInvoice?: ReceivableInvoice;
  unbilledReason: string;
  isRentFree?: boolean;
  concessionNote?: string;
}

function getConcessionStatusForPeriod(
  l: any,
  periodStartStr: string,
): { isFree: boolean; note?: string } {
  let override: any = null;
  try {
    if (typeof window !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("pms_custom_lease_overrides") || "{}");
      const uKey = (l?.unit || "").toString().toUpperCase().trim();
      override =
        stored[l?.id] ||
        (l?.contractNumber ? stored[l?.contractNumber] : null) ||
        (uKey ? stored[uKey] : null);
    }
  } catch {}

  const graceDays = Number(
    override?.grace_period_days ?? l?.gracePeriodDays ?? l?.grace_period_days ?? 0,
  );
  const startStr = override?.commencement_date || l?.startDate || l?.commencement_date;
  const endStr = override?.expiry_date || l?.endDate || l?.expiry_date;

  if (graceDays > 0 && startStr) {
    const sDate = new Date(startStr);
    const bDate = new Date(periodStartStr || new Date().toISOString());
    const graceEndMs = sDate.getTime() + graceDays * 86400000;
    if (bDate.getTime() >= sDate.getTime() && bDate.getTime() <= graceEndMs) {
      return {
        isFree: true,
        note: `Active Grace Period (${graceDays} Days Rent-Free from ${startStr.split("T")[0]})`,
      };
    }
  }

  const hasRentFree = Boolean(
    override?.has_rent_free ??
    l?.hasRentFree ??
    l?.has_rent_free ??
    l?.rent_free_period_days ??
    l?.rentFreeDays,
  );

  if (!hasRentFree) return { isFree: false };

  const rfPosition =
    override?.rent_free_position ?? l?.rentFreePosition ?? l?.rent_free_position ?? "FIRST_MONTH";

  if (!startStr) {
    return { isFree: true, note: "Rent-Free Concession (QR 0.00)" };
  }

  const sDate = new Date(startStr);
  const bDate = new Date(periodStartStr || new Date().toISOString());

  if (rfPosition === "FIRST_MONTH") {
    const isFirstMonth =
      sDate.getFullYear() === bDate.getFullYear() && sDate.getMonth() === bDate.getMonth();
    if (isFirstMonth) {
      return {
        isFree: true,
        note: "Rent-Free Concession: Month 1 of 13 (Move-in Incentive)",
      };
    }
  } else if (rfPosition === "LAST_MONTH" && endStr) {
    const eDate = new Date(endStr);
    const isLastMonth =
      eDate.getFullYear() === bDate.getFullYear() && eDate.getMonth() === bDate.getMonth();
    if (isLastMonth) {
      return {
        isFree: true,
        note: "Rent-Free Concession: Month 13 of 13 (Completion Concession)",
      };
    }
  }

  return { isFree: false };
}

function normalizeStr(s?: string): string {
  return (s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function isSameProperty(p1?: string, p2?: string): boolean {
  if (!p1 || !p2) return false;
  const n1 = normalizeStr(p1);
  const n2 = normalizeStr(p2);
  if (n1 === n2) return true;
  if (n1.includes(n2) || n2.includes(n1)) return true;
  return false;
}

function isSameUnit(u1?: string, u2?: string): boolean {
  if (!u1 || !u2) return false;
  const n1 = normalizeStr(u1);
  const n2 = normalizeStr(u2);
  if (n1 === n2) return true;
  // Also match suffix e.g. "AAA - Flat16" vs "Flat16"
  const tail1 = (u1.split(/[-–—]/).pop() || u1).toLowerCase().replace(/[^a-z0-9]/g, "");
  const tail2 = (u2.split(/[-–—]/).pop() || u2).toLowerCase().replace(/[^a-z0-9]/g, "");
  if (tail1 && tail2 && tail1 === tail2) return true;
  return false;
}

export function UnbilledUnitsReportSubModule() {
  const { units, leases, syncing, refetchData } = useAppData();
  const {
    receivableInvoices,
    allLedgerTransactions,
    addReceivableInvoice,
    addBulkReceivableInvoices,
    isSyncing,
    refreshFinanceData,
  } = useFinanceStore();

  const branding = useMemo(() => getDocumentBranding(), []);
  const bannerUrl = branding.headerImageUrl || AL_AMEEN_PAGE1_HEADER_BASE64;

  // ── Period Filter State ───────────────────────────────────────────────────
  const now = useMemo(() => new Date(), []);
  const defaultMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [periodMode, setPeriodMode] = useState<"month" | "range">("month");
  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonthKey);
  const [fromDate, setFromDate] = useState<string>(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}-01`;
  });
  const [toDate, setToDate] = useState<string>(() => {
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return `${y}-${m}-${String(lastDay).padStart(2, "0")}`;
  });

  // ── Property & View Filters ───────────────────────────────────────────────
  const [propertyFilter, setPropertyFilter] = useState<string>("ALL");
  const [unitScopeFilter, setUnitScopeFilter] = useState<"occupied_only" | "all_units">(
    "occupied_only",
  );
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<
    "not_generated" | "generated" | "all"
  >("not_generated");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Selection for quick invoice generation
  const [selectedUnitKeys, setSelectedUnitKeys] = useState<Set<string>>(new Set());
  const [viewingInvoice, setViewingInvoice] = useState<ReceivableInvoice | null>(null);

  // ── Available Months List ─────────────────────────────────────────────────
  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    const curYear = now.getFullYear();
    // Populate 2025, 2026, 2027 months
    for (let y = curYear - 1; y <= curYear + 1; y++) {
      for (let m = 1; m <= 12; m++) {
        set.add(`${y}-${String(m).padStart(2, "0")}`);
      }
    }
    receivableInvoices.forEach((inv) => {
      if (inv.date && inv.date.length >= 7) set.add(inv.date.slice(0, 7));
    });
    const sorted = Array.from(set).sort((a, b) => b.localeCompare(a));
    return sorted.map((ym) => {
      const [y, m] = ym.split("-");
      const mIdx = parseInt(m, 10) - 1;
      const label = `${MONTH_NAMES[mIdx] || m} ${y}`;
      return { value: ym, label, ym };
    });
  }, [now, receivableInvoices]);

  // Compute effective period start, end, and display label
  const effectivePeriod = useMemo(() => {
    if (periodMode === "month") {
      const [yStr, mStr] = selectedMonth.split("-");
      const y = parseInt(yStr, 10) || now.getFullYear();
      const m = parseInt(mStr, 10) || now.getMonth() + 1;
      const lastDay = new Date(y, m, 0).getDate();
      const start = `${y}-${String(m).padStart(2, "0")}-01`;
      const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      const monthName = MONTH_NAMES[m - 1] || mStr;
      return {
        start,
        end,
        monthKey: selectedMonth,
        label: `${monthName} ${y}`,
        monthName,
        yearStr: String(y),
      };
    } else {
      const start = fromDate || `${now.getFullYear()}-01-01`;
      const end = toDate || `${now.getFullYear()}-12-31`;
      return {
        start,
        end,
        monthKey: start.slice(0, 7),
        label: `${start} to ${end}`,
        monthName: "",
        yearStr: start.slice(0, 4),
      };
    }
  }, [periodMode, selectedMonth, fromDate, toDate, now]);

  // ── Master Properties List ────────────────────────────────────────────────
  const propertiesList = useMemo(() => {
    const set = new Set<string>();
    units.forEach((u) => {
      if (u.property && u.property !== "Property") set.add(u.property);
    });
    leases.forEach((l) => {
      if (l.property && l.property !== "Property") set.add(l.property);
    });
    receivableInvoices.forEach((inv) => {
      if (inv.property) set.add(inv.property);
    });
    if (set.size === 0) {
      set.add("Old Salata - Residence No:23");
      set.add("MANSOURA - BLDG06");
      set.add("Neeman's New Building");
    }
    return Array.from(set).sort();
  }, [units, leases, receivableInvoices]);

  // ── Combine All Invoices for the Selected Period ──────────────────────────
  const allSystemInvoices = useMemo(() => {
    const list: ReceivableInvoice[] = [...receivableInvoices];

    // Strict: No synthetic baseline invoices to prevent data leakage
    if (false) {
      leases.slice(0, 10).forEach((l, idx) => {
        const amt = Number(l.monthlyRent) || 5500;
        list.push({
          id: `seed-ar-${idx + 1}`,
          invoice_no: `INV-2026-AR-${1001 + idx}`,
          tenant: l.tenantName || `Tenant ${l.unit}`,
          property: l.property || "MANSOURA - BLDG06",
          unit: l.unit || `Unit ${idx + 1}`,
          date: new Date(Date.now() - (idx % 3) * 30 * 86400000).toISOString().split("T")[0],
          due_date: new Date(Date.now() - (idx % 3) * 30 * 86400000 + 30 * 86400000)
            .toISOString()
            .split("T")[0],
          stream: "41100 - Rental Revenue",
          account_code: "41100",
          amount: amt,
          status: idx % 3 === 0 ? "Paid" : idx % 3 === 1 ? "Pending" : "Overdue",
        });
      });
    }

    // Also check ledger transactions from Receivable Invoice source
    allLedgerTransactions.forEach((tx) => {
      if (tx.source === "Receivable Invoice" && tx.credit > 0 && tx.unit_ref) {
        const alreadyExists = list.some((inv) => inv.invoice_no === tx.reference);
        if (!alreadyExists) {
          list.push({
            id: tx.id,
            invoice_no: tx.reference,
            tenant: tx.tenant_name || "Tenant",
            property: tx.property_name || "Portfolio",
            unit: tx.unit_ref,
            date: tx.date,
            due_date: tx.date,
            stream: tx.account_name || "41100 - Rental Revenue",
            account_code: tx.account_code || "41100",
            amount: tx.credit,
            status: "Pending",
          });
        }
      }
    });

    return list;
  }, [receivableInvoices, leases, allLedgerTransactions]);

  // Invoices that belong to the selected period
  const periodInvoices = useMemo(() => {
    return allSystemInvoices.filter((inv) => {
      // 1. Check billingPeriod label match if in month mode (e.g., "October 2026")
      if (periodMode === "month" && inv.billingPeriod) {
        const bpLower = inv.billingPeriod.toLowerCase().trim();
        const targetLabelLower = effectivePeriod.label.toLowerCase().trim();
        if (
          bpLower === targetLabelLower ||
          bpLower.includes(targetLabelLower) ||
          bpLower === effectivePeriod.monthKey
        ) {
          return true;
        }
      }
      // 2. Check invoice date falls within [effectivePeriod.start, effectivePeriod.end]
      if (inv.date) {
        const invDate = inv.date.split("T")[0];
        if (periodMode === "month") {
          if (invDate.startsWith(effectivePeriod.monthKey)) return true;
        } else {
          if (invDate >= effectivePeriod.start && invDate <= effectivePeriod.end) return true;
        }
      }
      return false;
    });
  }, [allSystemInvoices, periodMode, effectivePeriod]);

  // ── Build Complete Unit-by-Unit Evaluation for the Period ─────────────────
  const allUnitRows: UnbilledUnitRow[] = useMemo(() => {
    const unitMap = new Map<string, UnbilledUnitRow>();

    // Helper to find matching invoice in periodInvoices
    const findInvoiceForUnit = (
      prop: string,
      unitName: string,
      tenantName?: string,
    ): ReceivableInvoice | undefined => {
      return periodInvoices.find((inv) => {
        const unitMatch = isSameUnit(inv.unit, unitName);
        if (!unitMatch) return false;
        const propMatch = isSameProperty(inv.property, prop);
        if (propMatch) return true;
        // If unit reference is unique and tenant also matches
        if (tenantName && inv.tenant && normalizeStr(inv.tenant) === normalizeStr(tenantName)) {
          return true;
        }
        return false;
      });
    };

    // 1. Process all active leases first (authoritative for occupied units, rent, contract dates)
    leases.forEach((l, idx) => {
      if (l.status === "closed" || l.status === "checkout" || (l as any).status === "cancelled")
        return;

      const propName = l.property || "Unassigned Property";
      const unitName = l.unit || `Unit-${idx + 1}`;
      const rowKey = `${normalizeStr(propName)}__${normalizeStr(unitName)}`;

      // Check if lease is active during the selected period
      const leaseStart = l.startDate ? l.startDate.split("T")[0] : "2020-01-01";
      const leaseEnd = l.endDate ? l.endDate.split("T")[0] : "2099-12-31";
      const overlapsPeriod = leaseStart <= effectivePeriod.end && leaseEnd >= effectivePeriod.start;

      const baseRent = Number(l.monthlyRent) || 0;
      const concession = getConcessionStatusForPeriod(l, effectivePeriod.start);
      const expectedAmt = concession.isFree ? 0 : baseRent;

      const matchedInv = findInvoiceForUnit(propName, unitName, l.tenantName);

      let unbilledReason = "Invoice Not Generated for Period";
      if (!overlapsPeriod) {
        if (leaseStart > effectivePeriod.end) {
          unbilledReason = `Lease Commences After Period (${leaseStart})`;
        } else {
          unbilledReason = `Lease Expired Before Period (${leaseEnd})`;
        }
      } else if (concession.isFree) {
        unbilledReason = concession.note || "Rent-Free Concession Period (Zero-Invoice Pending)";
      } else {
        unbilledReason = `Pending Monthly Rent Billing (${effectivePeriod.label})`;
      }

      unitMap.set(rowKey, {
        key: rowKey,
        unit: unitName,
        property: propName,
        occupancyStatus: "Occupied",
        tenantName: l.tenantName || "Occupied Tenant",
        customerId: l.customerId,
        contractNumber: l.contractNumber || l.id || `LS-${idx + 101}`,
        leaseStartDate: l.startDate || "—",
        leaseEndDate: l.endDate || "—",
        monthlyRent: baseRent,
        expectedBillingAmount: expectedAmt,
        isInvoiced: Boolean(matchedInv),
        invoiceNo: matchedInv?.invoice_no,
        invoiceDate: matchedInv?.date,
        invoiceAmount: matchedInv?.amount,
        invoiceStatus: matchedInv?.status,
        rawInvoice: matchedInv,
        unbilledReason: matchedInv ? "Invoice Generated" : unbilledReason,
        isRentFree: concession.isFree,
        concessionNote: concession.note,
      });
    });

    // 2. Process all units from units master (adds vacant units or occupied units without explicit lease rows)
    units.forEach((u, idx) => {
      const propName = u.property || "Unassigned Property";
      const unitName = u.unit || `Unit-${idx + 1}`;
      const rowKey = `${normalizeStr(propName)}__${normalizeStr(unitName)}`;

      // Also check if any existing entry in unitMap matches via isSameProperty + isSameUnit
      let existingKey: string | null = unitMap.has(rowKey) ? rowKey : null;
      if (!existingKey) {
        for (const [k, val] of unitMap.entries()) {
          if (isSameProperty(val.property, propName) && isSameUnit(val.unit, unitName)) {
            existingKey = k;
            break;
          }
        }
      }

      if (existingKey) return; // Already populated from active lease

      const isOccupied =
        u.status === "Occupied" || Boolean(u.currentTenant && u.currentTenant.trim());
      const occStatus: UnbilledUnitRow["occupancyStatus"] = isOccupied
        ? "Occupied"
        : u.status === "Reserved"
          ? "Reserved"
          : u.status === "Vacant - Under Maintenance"
            ? "Under Maintenance"
            : "Available";

      const baseRent = Number(u.rent) || 0;
      const tenantName =
        u.currentTenant || (isOccupied ? `Resident (${unitName})` : "Vacant — No Active Tenant");
      const matchedInv = findInvoiceForUnit(
        propName,
        unitName,
        isOccupied ? tenantName : undefined,
      );

      let unbilledReason = "Invoice Not Generated for Period";
      if (!isOccupied) {
        unbilledReason =
          occStatus === "Reserved"
            ? "Unit Reserved (Lease Not Yet Billed)"
            : occStatus === "Under Maintenance"
              ? "Vacant - Under Maintenance"
              : "Vacant Unit (No Active Lease)";
      } else {
        unbilledReason = `Pending Monthly Rent Billing (${effectivePeriod.label})`;
      }

      unitMap.set(rowKey, {
        key: rowKey,
        unit: unitName,
        property: propName,
        occupancyStatus: occStatus,
        tenantName,
        contractNumber: isOccupied ? `CNT-${unitName.replace(/\W/g, "")}` : "—",
        leaseStartDate: "—",
        leaseEndDate: u.contractEndDate || "—",
        monthlyRent: baseRent,
        expectedBillingAmount: isOccupied ? baseRent : 0,
        isInvoiced: Boolean(matchedInv),
        invoiceNo: matchedInv?.invoice_no,
        invoiceDate: matchedInv?.date,
        invoiceAmount: matchedInv?.amount,
        invoiceStatus: matchedInv?.status,
        rawInvoice: matchedInv,
        unbilledReason: matchedInv ? "Invoice Generated" : unbilledReason,
      });
    });

    return Array.from(unitMap.values()).sort((a, b) => {
      const pComp = a.property.localeCompare(b.property);
      if (pComp !== 0) return pComp;
      return a.unit.localeCompare(b.unit, undefined, { numeric: true });
    });
  }, [leases, units, periodInvoices, effectivePeriod]);

  // ── Apply Filters (Property-wise / All Properties, Scope, Status, Search) ──
  const filteredRows = useMemo(() => {
    return allUnitRows.filter((row) => {
      // Property filter ("ALL" vs specific property)
      if (propertyFilter !== "ALL" && !isSameProperty(row.property, propertyFilter)) {
        return false;
      }

      // Unit scope filter (Occupied/Leased units vs All units including vacant)
      if (unitScopeFilter === "occupied_only" && row.occupancyStatus !== "Occupied") {
        return false;
      }

      // Invoice status filter
      if (invoiceStatusFilter === "not_generated" && row.isInvoiced) {
        return false;
      }
      if (invoiceStatusFilter === "generated" && !row.isInvoiced) {
        return false;
      }

      // Search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const hay =
          `${row.unit} ${row.property} ${row.tenantName} ${row.contractNumber} ${row.unbilledReason} ${row.invoiceNo || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [allUnitRows, propertyFilter, unitScopeFilter, invoiceStatusFilter, searchTerm]);

  // ── Property-Wise Breakdown Summary (for All Properties / Property-Wise overview) ──
  const propertyBreakdown = useMemo(() => {
    const scopedRows = allUnitRows.filter((row) => {
      if (propertyFilter !== "ALL" && !isSameProperty(row.property, propertyFilter)) return false;
      if (unitScopeFilter === "occupied_only" && row.occupancyStatus !== "Occupied") return false;
      return true;
    });

    const map = new Map<
      string,
      {
        property: string;
        totalUnits: number;
        invoicedUnits: number;
        unbilledUnits: number;
        invoicedAmount: number;
        unbilledAmount: number;
      }
    >();

    scopedRows.forEach((r) => {
      const existing = map.get(r.property) || {
        property: r.property,
        totalUnits: 0,
        invoicedUnits: 0,
        unbilledUnits: 0,
        invoicedAmount: 0,
        unbilledAmount: 0,
      };
      existing.totalUnits += 1;
      if (r.isInvoiced) {
        existing.invoicedUnits += 1;
        existing.invoicedAmount += Number(r.invoiceAmount ?? r.expectedBillingAmount) || 0;
      } else {
        existing.unbilledUnits += 1;
        existing.unbilledAmount += Number(r.expectedBillingAmount) || 0;
      }
      map.set(r.property, existing);
    });

    return Array.from(map.values()).sort(
      (a, b) => b.unbilledUnits - a.unbilledUnits || a.property.localeCompare(b.property),
    );
  }, [allUnitRows, propertyFilter, unitScopeFilter]);

  // ── KPI Summary Metrics ───────────────────────────────────────────────────
  const kpiStats = useMemo(() => {
    const scopedRows = allUnitRows.filter((row) => {
      if (propertyFilter !== "ALL" && !isSameProperty(row.property, propertyFilter)) return false;
      if (unitScopeFilter === "occupied_only" && row.occupancyStatus !== "Occupied") return false;
      return true;
    });

    const totalEvaluated = scopedRows.length;
    const invoicedRows = scopedRows.filter((r) => r.isInvoiced);
    const unbilledRows = scopedRows.filter((r) => !r.isInvoiced);

    const unbilledRevenue = unbilledRows.reduce(
      (sum, r) => sum + (Number(r.expectedBillingAmount) || 0),
      0,
    );
    const invoicedRevenue = invoicedRows.reduce(
      (sum, r) => sum + (Number(r.invoiceAmount ?? r.expectedBillingAmount) || 0),
      0,
    );
    const coveragePct =
      totalEvaluated > 0 ? Math.round((invoicedRows.length / totalEvaluated) * 100) : 100;

    return {
      totalEvaluated,
      invoicedCount: invoicedRows.length,
      unbilledCount: unbilledRows.length,
      unbilledRevenue,
      invoicedRevenue,
      coveragePct,
    };
  }, [allUnitRows, propertyFilter, unitScopeFilter]);

  // ── Selection Handlers ────────────────────────────────────────────────────
  const unbilledFilteredRows = useMemo(
    () => filteredRows.filter((r) => !r.isInvoiced),
    [filteredRows],
  );

  const toggleSelectRow = (key: string) => {
    setSelectedUnitKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleSelectAllUnbilled = (checked: boolean) => {
    if (checked) {
      setSelectedUnitKeys(new Set(unbilledFilteredRows.map((r) => r.key)));
    } else {
      setSelectedUnitKeys(new Set());
    }
  };

  // ── Generate Single or Bulk Missing Invoices ──────────────────────────────
  const handleGenerateSingleInvoice = (row: UnbilledUnitRow) => {
    const issueDateStr = periodMode === "month" ? effectivePeriod.start : fromDate;
    const dueDateObj = new Date(issueDateStr);
    dueDateObj.setDate(dueDateObj.getDate() + 30);
    const dueDateStr = dueDateObj.toISOString().split("T")[0];

    const propCode = row.property.slice(0, 4).toUpperCase().replace(/\s/g, "");
    const unitClean = row.unit.replace(/[^\w]/g, "").slice(-5).toUpperCase();
    const ymClean = effectivePeriod.monthKey.replace("-", "");
    const invNo = `INV-${ymClean}-${propCode}-${unitClean}`;

    const stream = row.isRentFree
      ? `41100 - Rental Revenue (Rent-Free Concession: ${row.concessionNote || "QR 0"})`
      : "41100 - Rental Revenue (Residential/Commercial)";

    addReceivableInvoice({
      invoice_no: invNo,
      tenant: row.tenantName,
      property: row.property,
      unit: row.unit,
      date: issueDateStr,
      due_date: dueDateStr,
      stream,
      account_code: "41100",
      amount: row.expectedBillingAmount,
      customerId: row.customerId,
      billingPeriod: effectivePeriod.label,
    });

    setSelectedUnitKeys((prev) => {
      const next = new Set(prev);
      next.delete(row.key);
      return next;
    });
  };

  const handleGenerateSelectedInvoices = () => {
    const targets = unbilledFilteredRows.filter((r) => selectedUnitKeys.has(r.key));
    if (targets.length === 0) {
      toast.error("Please select at least one unbilled unit to generate invoices.");
      return;
    }

    const issueDateStr = periodMode === "month" ? effectivePeriod.start : fromDate;
    const dueDateObj = new Date(issueDateStr);
    dueDateObj.setDate(dueDateObj.getDate() + 30);
    const dueDateStr = dueDateObj.toISOString().split("T")[0];
    const ymClean = effectivePeriod.monthKey.replace("-", "");

    const payload: Omit<ReceivableInvoice, "id" | "status">[] = targets.map((row, idx) => {
      const propCode = row.property.slice(0, 4).toUpperCase().replace(/\s/g, "");
      const unitClean = row.unit.replace(/[^\w]/g, "").slice(-5).toUpperCase();
      const invNo = `INV-${ymClean}-${propCode}-${unitClean || idx + 101}`;
      const stream = row.isRentFree
        ? `41100 - Rental Revenue (Rent-Free Concession: ${row.concessionNote || "QR 0"})`
        : "41100 - Rental Revenue (Residential/Commercial)";

      return {
        invoice_no: invNo,
        tenant: row.tenantName,
        property: row.property,
        unit: row.unit,
        date: issueDateStr,
        due_date: dueDateStr,
        stream,
        account_code: "41100",
        amount: row.expectedBillingAmount,
        customerId: row.customerId,
        billingPeriod: effectivePeriod.label,
      };
    });

    addBulkReceivableInvoices(payload);
    setSelectedUnitKeys(new Set());
  };

  // ── Export to Excel ───────────────────────────────────────────────────────
  const handleExportExcel = () => {
    if (filteredRows.length === 0) {
      toast.warning("No records matching current filters to export.");
      return;
    }

    const scopeTitle =
      propertyFilter === "ALL" ? "All-Properties" : propertyFilter.replace(/\s+/g, "-");
    exportToExcel({
      filename: `Unbilled-Units-Report-${scopeTitle}-${effectivePeriod.monthKey}.xlsx`,
      sheetName: "Unbilled Units Report",
      data: filteredRows,
      columns: [
        { header: "Property Name", accessor: (r) => r.property, width: 28 },
        { header: "Unit Reference", accessor: (r) => r.unit, width: 16 },
        { header: "Occupancy Status", accessor: (r) => r.occupancyStatus, width: 16 },
        { header: "Tenant / Customer Name", accessor: (r) => r.tenantName, width: 28 },
        { header: "Lease / Contract #", accessor: (r) => r.contractNumber, width: 18 },
        { header: "Lease Start Date", accessor: (r) => r.leaseStartDate, width: 15 },
        { header: "Lease End Date", accessor: (r) => r.leaseEndDate, width: 15 },
        { header: "Billing Period", accessor: () => effectivePeriod.label, width: 18 },
        { header: "Monthly Rent (QAR)", accessor: (r) => r.monthlyRent, width: 18 },
        { header: "Expected Billing (QAR)", accessor: (r) => r.expectedBillingAmount, width: 20 },
        {
          header: "Invoice Status",
          accessor: (r) => (r.isInvoiced ? `Generated (${r.invoiceNo})` : "NOT GENERATED"),
          width: 22,
        },
        { header: "Reason / Remarks", accessor: (r) => r.unbilledReason, width: 34 },
      ],
    });
  };

  // ── Print Report ──────────────────────────────────────────────────────────
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Print Stylesheet */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
          html, body {
            overflow: visible !important;
            height: auto !important;
            background: #ffffff !important;
          }
          body * { visibility: hidden; }
          #printable-unbilled-units-report, #printable-unbilled-units-report * {
            visibility: visible;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-unbilled-units-report {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            background: #ffffff !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `,
        }}
      />

      {/* ── Top Header & Actions Bar ────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground tracking-tight">
              Unbilled Units Report (Invoices Not Generated)
            </h2>
            <Badge
              variant="outline"
              className="text-xs font-mono border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
            >
              Period: {effectivePeriod.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identify units across <strong className="text-foreground">All Properties</strong> or{" "}
            <strong className="text-foreground">Property-Wise</strong> for which rental invoices
            have not been generated for the selected billing period.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {selectedUnitKeys.size > 0 && (
            <Button
              size="sm"
              onClick={handleGenerateSelectedInvoices}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Generate Invoices for Selected ({selectedUnitKeys.size})
            </Button>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void refetchData();
              void refreshFinanceData();
            }}
            disabled={syncing || isSyncing}
            className="gap-1.5 text-xs h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing || isSyncing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportExcel}
            className="gap-1.5 text-xs h-8 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
          >
            <Download className="h-3.5 w-3.5" />
            Export Excel
          </Button>

          <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5 text-xs h-8">
            <Printer className="h-3.5 w-3.5" />
            Print / PDF
          </Button>
        </div>
      </div>

      {/* ── Filter Bar (Period + Property-Wise / All Properties + Scope) ───── */}
      <Card className="border bg-card shadow-xs no-print">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* 1. Property Scope Filter: All Properties vs Property-Wise */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold flex items-center gap-1.5 text-foreground">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                Property Filter (All / Property-Wise)
              </Label>
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="h-9 text-xs bg-background font-medium">
                  <SelectValue placeholder="All Properties" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="font-bold text-primary">
                    All Properties ({propertiesList.length} Properties)
                  </SelectItem>
                  {propertiesList.map((prop) => (
                    <SelectItem key={prop} value={prop}>
                      {prop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Period Filter Mode */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold flex items-center gap-1.5 text-foreground">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                Period Selection Mode
              </Label>
              <Select value={periodMode} onValueChange={(v: "month" | "range") => setPeriodMode(v)}>
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Billing Month (YYYY-MM)</SelectItem>
                  <SelectItem value="range">Custom Date Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 3. Target Period Selector (Month Dropdown OR Date Range) */}
            {periodMode === "month" ? (
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-foreground">
                  Target Billing Period
                </Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="h-9 text-xs bg-background font-mono font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {monthOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="font-mono text-xs">
                        {opt.label} ({opt.ym})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                <Label className="text-[11px] font-semibold text-foreground">
                  From Date / To Date
                </Label>
                <div className="grid grid-cols-2 gap-1.5">
                  <Input
                    type="date"
                    className="h-9 text-[11px] font-mono bg-background px-2"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                  <Input
                    type="date"
                    className="h-9 text-[11px] font-mono bg-background px-2"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* 4. Unit Occupancy Scope */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold flex items-center gap-1.5 text-foreground">
                <Home className="h-3.5 w-3.5 text-primary" />
                Unit Scope
              </Label>
              <Select
                value={unitScopeFilter}
                onValueChange={(v: "occupied_only" | "all_units") => setUnitScopeFilter(v)}
              >
                <SelectTrigger className="h-9 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="occupied_only">Occupied / Leased Units Only</SelectItem>
                  <SelectItem value="all_units">All Units (Incl. Vacant)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 5. Invoice Generation Status Filter */}
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold flex items-center gap-1.5 text-foreground">
                <Filter className="h-3.5 w-3.5 text-primary" />
                Billing Status View
              </Label>
              <Select
                value={invoiceStatusFilter}
                onValueChange={(v: "not_generated" | "generated" | "all") =>
                  setInvoiceStatusFilter(v)
                }
              >
                <SelectTrigger className="h-9 text-xs bg-background font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_generated">Invoices Not Generated Only</SelectItem>
                  <SelectItem value="generated">Invoices Generated Only</SelectItem>
                  <SelectItem value="all">All Units (Generated &amp; Unbilled)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Property Pills + Search Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-border/60">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
              <span className="text-[11px] font-semibold text-muted-foreground mr-1 shrink-0">
                Quick Property Filter:
              </span>
              <button
                type="button"
                onClick={() => setPropertyFilter("ALL")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                  propertyFilter === "ALL"
                    ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                All Properties ({propertiesList.length})
              </button>
              {propertiesList.map((prop) => {
                const isSelected = propertyFilter === prop;
                return (
                  <button
                    key={prop}
                    type="button"
                    onClick={() => setPropertyFilter(prop)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0 cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {prop}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-72 shrink-0">
              <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-2.5" />
              <Input
                className="h-8 pl-8 text-xs bg-background"
                placeholder="Search unit, tenant, property, contract..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── KPI Summary Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs no-print">
        <Card className="border bg-card">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                Total Scoped Units
              </span>
              <Layers className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <p className="text-xl font-bold font-mono text-foreground">{kpiStats.totalEvaluated}</p>
            <p className="text-[10px] text-muted-foreground">
              {propertyFilter === "ALL"
                ? `Across ${propertiesList.length} properties`
                : propertyFilter}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-rose-500/30 bg-rose-500/5">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400">
                Units Without Invoice
              </span>
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
              {kpiStats.unbilledCount}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Invoices not generated for {effectivePeriod.label}
            </p>
          </CardContent>
        </Card>

        <Card className="border border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">
                Unbilled Rent Value
              </span>
              <DollarSign className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <p className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400">
              QAR {kpiStats.unbilledRevenue.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">
              Expected revenue pending invoice generation
            </p>
          </CardContent>
        </Card>

        <Card className="border border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-3.5 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
                Invoiced Units ({kpiStats.coveragePct}%)
              </span>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {kpiStats.invoicedCount}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                / {kpiStats.totalEvaluated}
              </span>
            </p>
            <p className="text-[10px] text-muted-foreground">
              Billed: QAR {kpiStats.invoicedRevenue.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Property-Wise Summary Strip (When viewing All Properties) ────────── */}
      {propertyBreakdown.length > 1 && (
        <Card className="border bg-card no-print">
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-primary" />
                Property-Wise Unbilled Breakdown ({effectivePeriod.label})
              </h3>
              <span className="text-[11px] text-muted-foreground">
                Click any property card to filter property-wise
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {propertyBreakdown.map((pb) => {
                const isSelected = propertyFilter === pb.property;
                return (
                  <div
                    key={pb.property}
                    onClick={() => setPropertyFilter(isSelected ? "ALL" : pb.property)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "hover:border-primary/40 hover:bg-muted/30 bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-bold text-foreground truncate" title={pb.property}>
                        {pb.property}
                      </span>
                      <Badge
                        variant={pb.unbilledUnits > 0 ? "destructive" : "default"}
                        className="text-[10px] px-1.5 py-0 shrink-0"
                      >
                        {pb.unbilledUnits} Unbilled
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <span>
                        Units: {pb.invoicedUnits}/{pb.totalUnits} billed
                      </span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        QAR {pb.unbilledAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Printable Report Area + Interactive Table ───────────────────────── */}
      <div id="printable-unbilled-units-report" className="space-y-4">
        {/* Print-Only Header */}
        <div className="hidden print:block space-y-3 border-b pb-4 mb-4">
          <div className="w-full rounded-lg overflow-hidden border border-border/40 max-h-24 mb-2 bg-white flex items-center justify-center">
            <img
              src={bannerUrl}
              alt={branding.companyName || "Al Ameen Real Estate"}
              className="w-full h-auto max-h-24 object-contain"
            />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-lg font-bold text-primary">
                {branding.companyName || "Al Ameen Real Estate"} — Unbilled Units Report
              </h1>
              <p className="text-xs text-muted-foreground">
                Units for Which Invoices Were Not Generated &bull; Scope:{" "}
                <strong>{propertyFilter === "ALL" ? "All Properties" : propertyFilter}</strong>
              </p>
            </div>
            <div className="text-right text-xs font-mono">
              <p className="font-bold">Billing Period: {effectivePeriod.label}</p>
              <p className="text-muted-foreground">
                Generated: {new Date().toISOString().split("T")[0]}
              </p>
              <p className="text-rose-600 font-bold">
                Unbilled Units: {kpiStats.unbilledCount} (QAR{" "}
                {kpiStats.unbilledRevenue.toLocaleString()})
              </p>
            </div>
          </div>
        </div>

        {/* Selection Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-1 no-print">
          <div className="flex items-center gap-2 text-xs">
            {unbilledFilteredRows.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleSelectAllUnbilled(true)}
                  className="h-7 text-xs gap-1.5"
                >
                  <CheckSquare className="h-3.5 w-3.5" />
                  Select All Unbilled ({unbilledFilteredRows.length})
                </Button>
                {selectedUnitKeys.size > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleSelectAllUnbilled(false)}
                    className="h-7 text-xs gap-1"
                  >
                    <Square className="h-3.5 w-3.5" />
                    Clear Selection
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="text-xs text-muted-foreground">
            Showing <strong className="text-foreground">{filteredRows.length}</strong> unit records
            for{" "}
            <strong className="text-foreground">
              {propertyFilter === "ALL" ? "All Properties" : propertyFilter}
            </strong>{" "}
            ({effectivePeriod.label})
          </div>
        </div>

        {/* Report Table */}
        <div className="border rounded-lg overflow-hidden bg-card shadow-xs">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 text-xs">
                <TableHead className="w-10 text-center no-print">
                  <Checkbox
                    checked={
                      unbilledFilteredRows.length > 0 &&
                      selectedUnitKeys.size === unbilledFilteredRows.length
                    }
                    onCheckedChange={(checked) => toggleSelectAllUnbilled(Boolean(checked))}
                    aria-label="Select all unbilled units"
                  />
                </TableHead>
                <TableHead className="w-10 text-center font-bold">#</TableHead>
                <TableHead className="font-bold">Property</TableHead>
                <TableHead className="font-bold">Unit Ref</TableHead>
                <TableHead className="font-bold">Occupancy</TableHead>
                <TableHead className="font-bold">Tenant / Customer</TableHead>
                <TableHead className="font-bold">Contract / Lease Period</TableHead>
                <TableHead className="text-right font-bold">Monthly Rent (QAR)</TableHead>
                <TableHead className="text-right font-bold">Expected Billing (QAR)</TableHead>
                <TableHead className="text-center font-bold">Invoice Status</TableHead>
                <TableHead className="font-bold">Reason / Billing Remarks</TableHead>
                <TableHead className="text-center font-bold no-print">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={12}
                    className="text-center py-10 text-xs text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="h-7 w-7 text-emerald-500" />
                      <p className="font-semibold text-foreground">
                        {invoiceStatusFilter === "not_generated"
                          ? `All scoped units have invoices generated for ${effectivePeriod.label}!`
                          : "No unit records match the selected filters."}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Try switching the Property Filter, Target Billing Period, or Billing Status
                        View above.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row, idx) => {
                  const isSelected = selectedUnitKeys.has(row.key);
                  return (
                    <TableRow
                      key={row.key}
                      className={`text-xs transition-colors ${
                        row.isInvoiced
                          ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                          : isSelected
                            ? "bg-primary/5 hover:bg-primary/10"
                            : "hover:bg-muted/30"
                      }`}
                    >
                      <TableCell className="text-center no-print">
                        {!row.isInvoiced ? (
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleSelectRow(row.key)}
                          />
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center font-mono text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell
                        className="font-medium text-foreground max-w-[180px] truncate"
                        title={row.property}
                      >
                        {row.property}
                      </TableCell>
                      <TableCell className="font-mono font-bold text-primary whitespace-nowrap">
                        {row.unit}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            row.occupancyStatus === "Occupied"
                              ? "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400"
                              : row.occupancyStatus === "Reserved"
                                ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                : "border-slate-500/30 bg-slate-500/10 text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          {row.occupancyStatus}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className="font-semibold text-foreground max-w-[190px] truncate"
                        title={row.tenantName}
                      >
                        {row.tenantName}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        <div>{row.contractNumber}</div>
                        {(row.leaseStartDate !== "—" || row.leaseEndDate !== "—") && (
                          <div className="text-[10px] text-muted-foreground/80">
                            {row.leaseStartDate} &rarr; {row.leaseEndDate}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {row.monthlyRent.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-foreground">
                        {row.expectedBillingAmount.toLocaleString()}
                        {row.isRentFree && (
                          <span className="block text-[10px] font-normal text-emerald-600">
                            🎁 Rent-Free
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {row.isInvoiced ? (
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-mono">
                            {row.invoiceNo || "Invoiced"}
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px] font-semibold">
                            Not Generated
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell
                        className="text-muted-foreground max-w-[220px] truncate"
                        title={row.unbilledReason}
                      >
                        {row.unbilledReason}
                      </TableCell>
                      <TableCell className="text-center no-print">
                        {row.isInvoiced && row.rawInvoice ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewingInvoice(row.rawInvoice || null)}
                            className="h-7 px-2 text-xs gap-1 text-primary hover:text-primary"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGenerateSingleInvoice(row)}
                            className="h-7 px-2.5 text-[11px] font-semibold border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground gap-1"
                          >
                            <Sparkles className="h-3 w-3" />
                            Generate Invoice
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}

              {/* Footer Totals Row */}
              {filteredRows.length > 0 && (
                <TableRow className="bg-muted/60 font-bold text-xs border-t-2">
                  <TableCell className="no-print"></TableCell>
                  <TableCell
                    colSpan={6}
                    className="text-right uppercase text-[11px] text-muted-foreground"
                  >
                    Total ({filteredRows.length} Units —{" "}
                    {propertyFilter === "ALL" ? "All Properties" : propertyFilter}):
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    QAR{" "}
                    {filteredRows
                      .reduce((s, r) => s + (Number(r.monthlyRent) || 0), 0)
                      .toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-mono text-primary">
                    QAR{" "}
                    {filteredRows
                      .reduce((s, r) => s + (Number(r.expectedBillingAmount) || 0), 0)
                      .toLocaleString()}
                  </TableCell>
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Invoice View Dialog when clicking an already-invoiced unit */}
      <InvoiceViewDialog
        invoice={viewingInvoice}
        open={Boolean(viewingInvoice)}
        onOpenChange={(open) => {
          if (!open) setViewingInvoice(null);
        }}
      />
    </div>
  );
}
