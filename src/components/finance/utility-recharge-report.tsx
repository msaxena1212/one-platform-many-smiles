import { useState, useMemo } from "react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Zap,
  Droplets,
  Building2,
  Download,
  Printer,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useAppData } from "@/lib/app-data-context";
import { useFinanceStore } from "@/lib/finance/finance-store";
import { toast } from "sonner";

function norm(s?: string): string {
  return (s || "").trim().toLowerCase();
}

interface PropertyUtilityRow {
  property: string;
  masterUtilityExpense: number;
  tenantRecoverableUnits: number;
  landlordInclusiveUnits: number;
  billedRecoveryRevenue: number;
  collectedRecovery: number;
  netUnrecoveredCost: number;
  recoveryRatioPct: number;
}

export function UtilityRechargeRecoverySubModule() {
  const { units, leases } = useAppData();
  const { receivableInvoices, allLedgerTransactions, addReceivableInvoice } = useFinanceStore();

  const [activeTab, setActiveTab] = useState<"property_matrix" | "unit_recharges">(
    "property_matrix",
  );
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [propertyFilter, setPropertyFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sub-Meter Recharge Modal State
  const [rechargeModalOpen, setRechargeModalOpen] = useState(false);
  const [rechargeForm, setRechargeForm] = useState({
    leaseId: "",
    property: "",
    unit: "",
    tenantName: "",
    customerId: "",
    utilityType: "Kahramaa Electricity & Water",
    meterNo: "",
    prevReading: "1200",
    currReading: "1650",
    tariffRate: "0.32",
    fixedCharge: "0",
    directAmount: "",
    billingDate: new Date().toISOString().split("T")[0],
  });

  // Strict master properties list
  const propertiesList = useMemo(() => {
    const set = new Set<string>();
    units.forEach((u) => {
      if (u.property && u.property !== "Property") set.add(u.property.trim());
    });
    leases.forEach((l) => {
      if (l.property && l.property !== "Property") set.add(l.property.trim());
    });
    allLedgerTransactions.forEach((tx) => {
      if (
        tx.property_name &&
        tx.property_name !== "Unassigned" &&
        tx.property_name !== "All / Corporate" &&
        tx.property_name !== "Main Portfolio"
      ) {
        set.add(tx.property_name.trim());
      }
    });
    return Array.from(set).filter(Boolean).sort();
  }, [units, leases, allLedgerTransactions]);

  // Period options (YYYY-MM)
  const periodOptions = useMemo(() => {
    const set = new Set<string>();
    const curYear = new Date().getFullYear();
    for (let m = 1; m <= 12; m++) {
      set.add(`${curYear}-${String(m).padStart(2, "0")}`);
    }
    allLedgerTransactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) set.add(tx.date.slice(0, 7));
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [allLedgerTransactions]);

  // 1. Property-wise Utility Expense vs. Tenant Recovery Matrix (Strictly Ledger-Backed, Zero Cross-Property Leakage)
  const propertyMatrix = useMemo<PropertyUtilityRow[]>(() => {
    return propertiesList
      .filter((prop) => propertyFilter === "ALL" || norm(prop) === norm(propertyFilter))
      .map((propName) => {
        const pKey = norm(propName);

        // Master Kahramaa / Utility Expense booked to GL 51003xxx / 513xx for THIS exact property & period
        const masterUtilityExpense = allLedgerTransactions
          .filter((tx) => {
            if (tx.account_type !== "Expenses") return false;
            const code = tx.account_code || "";
            const nameLower = (tx.account_name || "").toLowerCase();
            const isUtilityAcct =
              code.startsWith("51003001") ||
              code.startsWith("51003002") ||
              code.startsWith("51003003") ||
              code.startsWith("513") ||
              nameLower.includes("electricity") ||
              nameLower.includes("water") ||
              nameLower.includes("kahramaa") ||
              nameLower.includes("qatar cool") ||
              nameLower.includes("utility");
            if (!isUtilityAcct) return false;
            if (norm(tx.property_name) !== pKey) return false;
            if (selectedPeriod !== "ALL" && tx.date && !tx.date.startsWith(selectedPeriod))
              return false;
            return true;
          })
          .reduce((s, tx) => s + (Number(tx.debit || 0) - Number(tx.credit || 0)), 0);

        // Active leases in this property & their utility responsibility
        const propLeases = leases.filter(
          (l) =>
            norm(l.property) === pKey &&
            String(l.status) !== "closed" &&
            String(l.status) !== "cancelled" &&
            String(l.status) !== "checkout",
        );
        const tenantRecoverableUnits = propLeases.filter((l) => {
          const resp = (l.utilityResponsibility || "Tenant").toLowerCase();
          return resp.includes("tenant") || resp.includes("sub-meter") || resp.includes("recharge");
        }).length;
        const landlordInclusiveUnits = Math.max(0, propLeases.length - tenantRecoverableUnits);

        // Billed Utility Recovery Income (GL 41201003 / Utility Recovery stream) strictly for THIS property & period
        const matchingUtilityInvoices = receivableInvoices.filter((inv) => {
          if (norm(inv.property) !== pKey) return false;
          const isUtilityStream =
            inv.account_code === "41201003" ||
            (inv.stream || "").toLowerCase().includes("utility") ||
            (inv.stream || "").toLowerCase().includes("kahramaa") ||
            (inv.stream || "").toLowerCase().includes("electricity");
          if (!isUtilityStream) return false;
          if (selectedPeriod !== "ALL") {
            const invPeriod =
              inv.billingPeriod?.slice(0, 7) || (inv.date ? inv.date.slice(0, 7) : "");
            if (invPeriod !== selectedPeriod) return false;
          }
          return true;
        });

        const billedFromInvoices = matchingUtilityInvoices.reduce(
          (s, i) => s + Number(i.amount || 0),
          0,
        );
        const collectedRecovery = matchingUtilityInvoices
          .filter((i) => i.status === "Paid")
          .reduce((s, i) => s + Number(i.amount || 0), 0);

        // Also include any direct Journal Ledger postings to GL 41201003 (excluding Receivable Invoice source to prevent double counting)
        const directGlRecovery = allLedgerTransactions
          .filter((tx) => {
            if (tx.source === "Receivable Invoice") return false;
            if (tx.account_code !== "41201003") return false;
            if (norm(tx.property_name) !== pKey) return false;
            if (selectedPeriod !== "ALL" && tx.date && !tx.date.startsWith(selectedPeriod))
              return false;
            return true;
          })
          .reduce((s, tx) => s + (Number(tx.credit || 0) - Number(tx.debit || 0)), 0);

        const billedRecoveryRevenue = Math.max(0, billedFromInvoices + directGlRecovery);
        const netUnrecoveredCost =
          Math.round((masterUtilityExpense - billedRecoveryRevenue) * 100) / 100;
        const recoveryRatioPct =
          masterUtilityExpense > 0
            ? Math.min(100, Math.round((billedRecoveryRevenue / masterUtilityExpense) * 1000) / 10)
            : billedRecoveryRevenue > 0
              ? 100
              : 0;

        return {
          property: propName,
          masterUtilityExpense: Math.round(masterUtilityExpense * 100) / 100,
          tenantRecoverableUnits,
          landlordInclusiveUnits,
          billedRecoveryRevenue: Math.round(billedRecoveryRevenue * 100) / 100,
          collectedRecovery: Math.round(collectedRecovery * 100) / 100,
          netUnrecoveredCost,
          recoveryRatioPct,
        };
      })
      .filter((row) => {
        if (!searchQuery.trim()) return true;
        return row.property.toLowerCase().includes(searchQuery.toLowerCase().trim());
      });
  }, [
    propertiesList,
    propertyFilter,
    allLedgerTransactions,
    leases,
    receivableInvoices,
    selectedPeriod,
    searchQuery,
  ]);

  // 2. Unit-Level Tenant Utility Responsibility & Recharge Status
  const unitRechargeRows = useMemo(() => {
    return leases
      .filter(
        (l) =>
          String(l.status) !== "closed" &&
          String(l.status) !== "cancelled" &&
          String(l.status) !== "checkout",
      )
      .filter((l) => propertyFilter === "ALL" || norm(l.property) === norm(propertyFilter))
      .map((l) => {
        const resp = l.utilityResponsibility || "Tenant Direct / Sub-Meter";
        const isLandlordInclusive =
          resp.toLowerCase().includes("landlord") || resp.toLowerCase().includes("inclusive");

        const matchedInv = receivableInvoices.find((inv) => {
          if (norm(inv.property) !== norm(l.property)) return false;
          if (norm(inv.unit) !== norm(l.unit)) return false;
          const isUtil =
            inv.account_code === "41201003" ||
            (inv.stream || "").toLowerCase().includes("utility") ||
            (inv.stream || "").toLowerCase().includes("kahramaa");
          if (!isUtil) return false;
          if (selectedPeriod !== "ALL") {
            const p = inv.billingPeriod?.slice(0, 7) || (inv.date ? inv.date.slice(0, 7) : "");
            if (p !== selectedPeriod) return false;
          }
          return true;
        });

        return {
          lease: l,
          property: l.property,
          unit: l.unit,
          tenantName: l.tenantName,
          responsibility: resp,
          isLandlordInclusive,
          billedInvoice: matchedInv,
          billedAmount: Number(matchedInv?.amount || 0),
        };
      })
      .filter((r) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          r.property.toLowerCase().includes(q) ||
          r.unit.toLowerCase().includes(q) ||
          r.tenantName.toLowerCase().includes(q)
        );
      });
  }, [leases, propertyFilter, receivableInvoices, selectedPeriod, searchQuery]);

  const summary = useMemo(() => {
    return propertyMatrix.reduce(
      (acc, r) => ({
        expense: acc.expense + r.masterUtilityExpense,
        recovered: acc.recovered + r.billedRecoveryRevenue,
        collected: acc.collected + r.collectedRecovery,
        netCost: acc.netCost + r.netUnrecoveredCost,
      }),
      { expense: 0, recovered: 0, collected: 0, netCost: 0 },
    );
  }, [propertyMatrix]);

  const computedRechargeAmount = useMemo(() => {
    if (rechargeForm.directAmount && Number(rechargeForm.directAmount) > 0) {
      return Math.round(Number(rechargeForm.directAmount) * 100) / 100;
    }
    const prev = parseFloat(rechargeForm.prevReading) || 0;
    const curr = parseFloat(rechargeForm.currReading) || 0;
    const unitsConsumed = Math.max(0, curr - prev);
    const rate = parseFloat(rechargeForm.tariffRate) || 0;
    const fixed = parseFloat(rechargeForm.fixedCharge) || 0;
    return Math.round((unitsConsumed * rate + fixed) * 100) / 100;
  }, [rechargeForm]);

  const openRechargeForLease = (l: any) => {
    setRechargeForm({
      leaseId: l.id || "",
      property: l.property || "",
      unit: l.unit || "",
      tenantName: l.tenantName || "",
      customerId: l.customerId || "",
      utilityType: "Kahramaa Electricity & Water",
      meterNo: `KM-${(l.unit || "101").replace(/\W/g, "")}`,
      prevReading: "1200",
      currReading: "1650",
      tariffRate: "0.32",
      fixedCharge: "25",
      directAmount: "",
      billingDate:
        selectedPeriod !== "ALL" ? `${selectedPeriod}-28` : new Date().toISOString().split("T")[0],
    });
    setRechargeModalOpen(true);
  };

  const handlePostUtilityRechargeInvoice = () => {
    if (!rechargeForm.property || !rechargeForm.unit || !rechargeForm.tenantName) {
      toast.error("Please select a valid Property, Unit, and Tenant.");
      return;
    }
    if (computedRechargeAmount <= 0) {
      toast.error("Calculated utility recharge amount must be greater than QR 0.");
      return;
    }

    const periodKey = rechargeForm.billingDate.slice(0, 7);
    const unitCode = rechargeForm.unit.replace(/\W/g, "").toUpperCase();
    const invNo = `INV-UTIL-${periodKey.replace("-", "")}-${unitCode}`;

    const duplicate = receivableInvoices.some((i) => i.invoice_no === invNo);
    if (duplicate) {
      toast.error(
        `Utility Recharge Invoice ${invNo} already exists for ${rechargeForm.unit} in ${periodKey}.`,
      );
      return;
    }

    const prev = parseFloat(rechargeForm.prevReading) || 0;
    const curr = parseFloat(rechargeForm.currReading) || 0;
    const consumptionNote = rechargeForm.directAmount
      ? `${rechargeForm.utilityType} Direct Recharge`
      : `${rechargeForm.utilityType} [Meter ${rechargeForm.meterNo}: ${prev} → ${curr} (${Math.max(0, curr - prev)} units)]`;

    addReceivableInvoice({
      invoice_no: invNo,
      tenant: rechargeForm.tenantName,
      customerId: rechargeForm.customerId || undefined,
      leaseId: rechargeForm.leaseId || undefined,
      property: rechargeForm.property,
      unit: rechargeForm.unit,
      date: rechargeForm.billingDate,
      due_date: rechargeForm.billingDate,
      billingPeriod: periodKey,
      stream: `41201003 - Utility Recovery Income (${consumptionNote})`,
      account_code: "41201003",
      amount: computedRechargeAmount,
      notes: consumptionNote,
    });

    setRechargeModalOpen(false);
    toast.success(
      `Utility Recharge Invoice ${invNo} (QR ${computedRechargeAmount.toLocaleString()}) posted to GL 41201003 for ${rechargeForm.property} / ${rechargeForm.unit}!`,
    );
  };

  const handleExportCsv = () => {
    const headers = [
      "Property",
      "Period",
      "Master Utility Expense (GL 51003)",
      "Tenant-Recoverable Units",
      "Landlord-Inclusive Units",
      "Billed Utility Recovery (GL 41201003)",
      "Collected Recovery",
      "Net Unrecovered Utility Cost (QAR)",
      "Recovery %",
    ];
    const rows = propertyMatrix.map((r) => [
      `"${r.property.replace(/"/g, '""')}"`,
      selectedPeriod,
      r.masterUtilityExpense.toFixed(2),
      r.tenantRecoverableUnits,
      r.landlordInclusiveUnits,
      r.billedRecoveryRevenue.toFixed(2),
      r.collectedRecovery.toFixed(2),
      r.netUnrecoveredCost.toFixed(2),
      `${r.recoveryRatioPct}%`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Utility_Expense_vs_Recovery_${selectedPeriod}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Utility Expense vs. Recovery Report exported to CSV!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-xl p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 border border-cyan-500/20">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Kahramaa & Utility Sub-Meter Recharge vs. Expense Recovery Report
            </h2>
            <p className="text-xs text-muted-foreground">
              Property-isolated master utility bills (GL 51003) vs. tenant sub-meter utility
              recovery invoices (GL 41201003)
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              const firstLease = unitRechargeRows[0]?.lease;
              if (firstLease) openRechargeForLease(firstLease);
              else setRechargeModalOpen(true);
            }}
            className="gap-1.5 text-xs"
          >
            <Plus className="h-3.5 w-3.5" /> Bill Sub-Meter Recharge
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 text-xs"
          >
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border-l-4 border-l-rose-500">
          <span className="text-[11px] uppercase font-bold text-muted-foreground block">
            Master Utility Bills (GL 51003)
          </span>
          <span className="text-lg font-bold font-mono text-rose-600 mt-1 block">
            QR {summary.expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-[11px] uppercase font-bold text-muted-foreground block">
            Tenant Recharges Billed (GL 41201003)
          </span>
          <span className="text-lg font-bold font-mono text-emerald-600 mt-1 block">
            QR {summary.recovered.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-cyan-500">
          <span className="text-[11px] uppercase font-bold text-muted-foreground block">
            Utility Recharges Collected
          </span>
          <span className="text-lg font-bold font-mono text-cyan-600 mt-1 block">
            QR {summary.collected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <span className="text-[11px] uppercase font-bold text-muted-foreground block">
            Net Landlord Utility Absorption
          </span>
          <span className="text-lg font-bold font-mono text-amber-600 mt-1 block">
            QR {summary.netCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList>
                <TabsTrigger value="property_matrix" className="text-xs font-semibold">
                  Property Expense vs. Recovery ({propertyMatrix.length})
                </TabsTrigger>
                <TabsTrigger value="unit_recharges" className="text-xs font-semibold">
                  Unit Sub-Meter Recharges ({unitRechargeRows.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 max-w-2xl">
              <div>
                <Label className="text-[11px] text-muted-foreground">Billing Month</Label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="h-8 text-xs mt-0.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Periods (Cumulative)</SelectItem>
                    {periodOptions.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px] text-muted-foreground">Property Filter</Label>
                <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                  <SelectTrigger className="h-8 text-xs mt-0.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Properties</SelectItem>
                    {propertiesList.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px] text-muted-foreground">Search Property / Unit</Label>
                <div className="relative mt-0.5">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Property, unit, tenant..."
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

      {/* Tab 1: Property Matrix */}
      {activeTab === "property_matrix" && (
        <Card>
          <div className="rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs font-bold">Property</TableHead>
                  <TableHead className="text-xs font-bold text-center">Recoverable Units</TableHead>
                  <TableHead className="text-xs font-bold text-center">Inclusive Units</TableHead>
                  <TableHead className="text-xs font-bold text-right text-rose-600">
                    Master Utility Bill (QAR)
                  </TableHead>
                  <TableHead className="text-xs font-bold text-right text-emerald-600">
                    Billed Recovery (QAR)
                  </TableHead>
                  <TableHead className="text-xs font-bold text-right">Net Landlord Cost</TableHead>
                  <TableHead className="text-xs font-bold text-center">Recovery %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {propertyMatrix.map((row) => (
                  <TableRow key={row.property} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-semibold">
                      <span className="inline-flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {row.property}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">
                      {row.tenantRecoverableUnits}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {row.landlordInclusiveUnits}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-rose-600 font-medium">
                      QR{" "}
                      {row.masterUtilityExpense.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-emerald-600 font-medium">
                      QR{" "}
                      {row.billedRecoveryRevenue.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">
                      QR{" "}
                      {row.netUnrecoveredCost.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={row.recoveryRatioPct >= 80 ? "default" : "outline"}
                        className="text-[10px] font-mono"
                      >
                        {row.recoveryRatioPct}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {propertyMatrix.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground text-xs"
                    >
                      No properties found matching the current filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Tab 2: Unit Sub-Meter Recharges */}
      {activeTab === "unit_recharges" && (
        <Card>
          <div className="rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs font-bold">Property</TableHead>
                  <TableHead className="text-xs font-bold">Unit</TableHead>
                  <TableHead className="text-xs font-bold">Tenant</TableHead>
                  <TableHead className="text-xs font-bold">Lease Utility Terms</TableHead>
                  <TableHead className="text-xs font-bold">
                    Recharge Status ({selectedPeriod})
                  </TableHead>
                  <TableHead className="text-xs font-bold text-right">Billed Amount</TableHead>
                  <TableHead className="text-xs font-bold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unitRechargeRows.map((r) => (
                  <TableRow key={r.lease.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-medium">{r.property}</TableCell>
                    <TableCell className="text-xs font-mono font-bold text-primary">
                      {r.unit}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{r.tenantName}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          r.isLandlordInclusive
                            ? "text-[10px] border-amber-500/30 text-amber-700"
                            : "text-[10px] border-cyan-500/30 text-cyan-700"
                        }
                      >
                        <Droplets className="h-2.5 w-2.5 mr-1" />
                        {r.responsibility}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.billedInvoice ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-emerald-500/30 text-emerald-600"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Billed (
                          {r.billedInvoice.invoice_no})
                        </Badge>
                      ) : r.isLandlordInclusive ? (
                        <span className="text-[11px] text-muted-foreground">
                          Landlord Inclusive (No Recharge)
                        </span>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] border-rose-500/30 text-rose-600"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" /> Pending Sub-Meter Recharge
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">
                      {r.billedAmount > 0 ? `QR ${r.billedAmount.toLocaleString()}` : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {!r.billedInvoice && !r.isLandlordInclusive && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] gap-1"
                          onClick={() => openRechargeForLease(r.lease)}
                        >
                          <Zap className="h-3 w-3 text-cyan-600" /> Bill Utility
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {unitRechargeRows.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground text-xs"
                    >
                      No active unit leases match the selected property filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Sub-Meter Utility Recharge Invoice Modal */}
      <Dialog open={rechargeModalOpen} onOpenChange={setRechargeModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Generate Tenant Sub-Meter Utility Recharge Invoice (GL 41201003)
            </DialogTitle>
            <DialogDescription className="text-xs">
              Posts directly to Tenant Receivables (DR 12413) &amp; Utility Recovery Income (CR
              41201003) for the exact Property &amp; Unit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs py-2">
            <div>
              <Label className="text-xs font-semibold">
                Select Active Lease (Property &amp; Unit)
              </Label>
              <Select
                value={rechargeForm.leaseId}
                onValueChange={(lid) => {
                  const found = leases.find((l) => l.id === lid);
                  if (found) {
                    setRechargeForm((prev) => ({
                      ...prev,
                      leaseId: found.id,
                      property: found.property,
                      unit: found.unit,
                      tenantName: found.tenantName,
                      customerId: found.customerId || "",
                      meterNo: `KM-${(found.unit || "101").replace(/\W/g, "")}`,
                    }));
                  }
                }}
              >
                <SelectTrigger className="mt-1 h-8 text-xs">
                  <SelectValue placeholder="Choose Tenant Unit..." />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {leases
                    .filter(
                      (l) => String(l.status) !== "closed" && String(l.status) !== "cancelled",
                    )
                    .map((l) => (
                      <SelectItem key={l.id} value={l.id} className="text-xs">
                        {l.property} — {l.unit} ({l.tenantName})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Utility Type</Label>
                <Select
                  value={rechargeForm.utilityType}
                  onValueChange={(v) => setRechargeForm({ ...rechargeForm, utilityType: v })}
                >
                  <SelectTrigger className="mt-1 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kahramaa Electricity & Water">
                      Kahramaa Electricity &amp; Water
                    </SelectItem>
                    <SelectItem value="Kahramaa Electricity (kWh)">
                      Kahramaa Electricity (kWh)
                    </SelectItem>
                    <SelectItem value="Kahramaa Water (m³)">Kahramaa Water (m³)</SelectItem>
                    <SelectItem value="Qatar Cool District Cooling">
                      Qatar Cool District Cooling
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Billing Date</Label>
                <Input
                  type="date"
                  className="mt-1 h-8 text-xs"
                  value={rechargeForm.billingDate}
                  onChange={(e) =>
                    setRechargeForm({ ...rechargeForm, billingDate: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 p-3 rounded-lg border bg-muted/30">
              <div>
                <Label className="text-[11px]">Prev Reading</Label>
                <Input
                  type="number"
                  className="mt-1 h-8 text-xs font-mono"
                  value={rechargeForm.prevReading}
                  onChange={(e) =>
                    setRechargeForm({
                      ...rechargeForm,
                      prevReading: e.target.value,
                      directAmount: "",
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-[11px]">Current Reading</Label>
                <Input
                  type="number"
                  className="mt-1 h-8 text-xs font-mono"
                  value={rechargeForm.currReading}
                  onChange={(e) =>
                    setRechargeForm({
                      ...rechargeForm,
                      currReading: e.target.value,
                      directAmount: "",
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-[11px]">Tariff (QAR/unit)</Label>
                <Input
                  type="number"
                  step="0.01"
                  className="mt-1 h-8 text-xs font-mono"
                  value={rechargeForm.tariffRate}
                  onChange={(e) =>
                    setRechargeForm({
                      ...rechargeForm,
                      tariffRate: e.target.value,
                      directAmount: "",
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Fixed Meter Fee (QAR)</Label>
                <Input
                  type="number"
                  className="mt-1 h-8 text-xs font-mono"
                  value={rechargeForm.fixedCharge}
                  onChange={(e) =>
                    setRechargeForm({
                      ...rechargeForm,
                      fixedCharge: e.target.value,
                      directAmount: "",
                    })
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Or Override Direct Amount (QAR)</Label>
                <Input
                  type="number"
                  placeholder="Optional override..."
                  className="mt-1 h-8 text-xs font-mono"
                  value={rechargeForm.directAmount}
                  onChange={(e) =>
                    setRechargeForm({ ...rechargeForm, directAmount: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
              <span className="font-semibold text-cyan-800 dark:text-cyan-300">
                Calculated Utility Recharge Invoice:
              </span>
              <span className="text-base font-bold font-mono text-cyan-700 dark:text-cyan-300">
                QR {computedRechargeAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRechargeModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handlePostUtilityRechargeInvoice}>
              Post Recharge Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
