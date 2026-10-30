import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Building2, Building, TrendingUp, TrendingDown, DollarSign,
  Download, Printer, RefreshCw, Calendar, Filter, Search,
  CheckCircle2, AlertCircle, FileText, ChevronRight, Layers,
  PieChart, ShieldCheck, ArrowUpRight, ArrowDownRight, Eye
} from "lucide-react";
import { toast } from "sonner";
import { useFinanceStore } from "@/lib/finance/finance-store";
import { useAppData } from "@/lib/app-data-context";
import { getDocumentBranding } from "@/lib/document-branding";
import { AL_AMEEN_PAGE1_HEADER_BASE64 } from "@/lib/header-banner-base64";
import { calculateContractPeriodMonthlyRevenue, calculatePropertyPortfolioRevenue } from "@/lib/finance/revenue-engine";

interface PropertyPnlMetrics {
  property: string;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  rentalRevenue: number;
  otherRevenue: number;
  totalRevenue: number;
  maintenanceExpense: number;
  payrollExpense: number;
  utilitiesExpense: number;
  cleaningExpense: number;
  otherExpense: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  tenancySchedules: Array<{
    unit: string;
    tenant: string;
    contractStart: string;
    contractEnd: string;
    applicableDays: number;
    totalDays: number;
    monthlyRent: number;
    recognizedRevenue: number;
    reason: string;
  }>;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export function PropertyWiseProfitAndLossSubModule() {
  const { allLedgerTransactions, isSyncing, refreshFinanceData } = useFinanceStore();
  const { leases, units } = useAppData();
  const branding = useMemo(() => getDocumentBranding(), []);
  const bannerUrl = branding.headerImageUrl || AL_AMEEN_PAGE1_HEADER_BASE64;

  const now = useMemo(() => new Date(), []);
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const [selectedPeriod, setSelectedPeriod] = useState<string>("2026-10");
  const [selectedPropertyFilter, setSelectedPropertyFilter] = useState<string>("all");
  const [activeDrillDownProperty, setActiveDrillDownProperty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Period Options (Rolling months + Consolidated)
  const periodOptions = useMemo(() => {
    const list: { value: string; label: string }[] = [{ value: "all", label: "All Periods (Consolidated)" }];
    const set = new Set<string>();

    // From transactions
    allLedgerTransactions.forEach(tx => {
      if (tx.date && tx.date.length >= 7) {
        set.add(tx.date.slice(0, 7));
      }
    });

    // Ensure 2026-10 and adjacent months exist
    set.add("2026-10");
    set.add("2026-11");
    set.add("2026-09");
    set.add("2026-08");

    const sorted = Array.from(set).sort((a, b) => b.localeCompare(a));
    sorted.forEach(m => {
      const [y, mon] = m.split("-");
      const mIdx = parseInt(mon, 10) - 1;
      const label = `${MONTH_NAMES[mIdx] || mon} ${y}`;
      list.push({ value: m, label: `${label} (${m})` });
    });
    return list;
  }, [allLedgerTransactions]);

  // Master property list
  const propertiesList = useMemo(() => {
    const set = new Set<string>();
    units.forEach(u => { if (u.property) set.add(u.property); });
    leases.forEach(l => { if (l.property) set.add(l.property); });
    allLedgerTransactions.forEach(tx => {
      if (tx.property_name && tx.property_name !== "Unassigned" && tx.property_name !== "Corporate / Admin") {
        set.add(tx.property_name);
      }
    });
    if (set.size === 0) {
      set.add("Old Salata - Residence No:23");
      set.add("MANSOURA - BLDG06");
      set.add("Neeman's New Building");
    }
    return Array.from(set).sort();
  }, [units, leases, allLedgerTransactions]);

  // ──────────────────────────────────────────────────────────────────────────
  // COMPUTE PROPERTY-WISE P&L (CONTRACT-PERIOD ACCRUAL REVENUE + EXPENSES)
  // ──────────────────────────────────────────────────────────────────────────
  const propertyMetricsList: PropertyPnlMetrics[] = useMemo(() => {
    return propertiesList.map((propName) => {
      const propUnits = units.filter(u => u.property === propName);
      const propLeases = leases.filter(l => l.property === propName && l.status !== "cancelled" && l.status !== "draft");

      let totalUnits = propUnits.length;
      if (totalUnits === 0) totalUnits = propLeases.length || 10;

      const activeTenantsSet = new Set<string>();
      let rentalRevenue = 0;
      const tenancySchedules: PropertyPnlMetrics["tenancySchedules"] = [];

      // 1. Accrual Rental Revenue calculation based on contract period
      propLeases.forEach((l) => {
        const baseMonthlyRent = Number(l.monthlyRent) || 0;

        if (selectedPeriod === "all") {
          // If All Periods, sum ledger revenue tagged to this lease or evaluate default month
          rentalRevenue += baseMonthlyRent;
          activeTenantsSet.add(l.unit);
          tenancySchedules.push({
            unit: l.unit,
            tenant: l.tenantName,
            contractStart: l.startDate,
            contractEnd: l.endDate,
            applicableDays: 30,
            totalDays: 30,
            monthlyRent: baseMonthlyRent,
            recognizedRevenue: baseMonthlyRent,
            reason: "Contract Tenancy (Consolidated)",
          });
        } else {
          // Calculate exact contract period overlap for selected month (e.g. 2026-10)
          const proration = calculateContractPeriodMonthlyRevenue({
            startDate: l.startDate,
            endDate: l.endDate,
            monthlyRent: baseMonthlyRent,
            targetMonth: selectedPeriod,
          });

          if (proration && proration.applicableDays > 0) {
            rentalRevenue += proration.recognizedRevenue;
            activeTenantsSet.add(l.unit);
            tenancySchedules.push({
              unit: l.unit,
              tenant: l.tenantName,
              contractStart: l.startDate,
              contractEnd: l.endDate,
              applicableDays: proration.applicableDays,
              totalDays: proration.totalDaysInMonth,
              monthlyRent: baseMonthlyRent,
              recognizedRevenue: proration.recognizedRevenue,
              reason: proration.explanation,
            });
          }
        }
      });

      // Also incorporate any ledger rental transactions if they exist and exceed computed
      let ledgerRentalRev = 0;
      let otherRevenue = 0;
      let maintenanceExpense = 0;
      let payrollExpense = 0;
      let utilitiesExpense = 0;
      let cleaningExpense = 0;
      let otherExpense = 0;

      allLedgerTransactions.forEach((tx) => {
        // Match by property name
        const txProp = tx.property_name || "";
        const matchesProp = txProp === propName || (propName.includes("Old Salata") && txProp.includes("Salata")) || (propName.includes("MANSOURA") && txProp.includes("MANSOURA"));
        if (!matchesProp) return;

        // Date period filtering
        if (selectedPeriod !== "all" && tx.date) {
          if (!tx.date.startsWith(selectedPeriod)) return;
        }

        if (tx.account_type === "Revenue") {
          const net = (tx.credit || 0) - (tx.debit || 0);
          if (tx.account_code.startsWith("411")) {
            ledgerRentalRev += net;
          } else {
            otherRevenue += net;
          }
        } else if (tx.account_type === "Expenses") {
          const net = (tx.debit || 0) - (tx.credit || 0);
          if (tx.account_code.startsWith("51004") || tx.account_code.startsWith("502")) {
            maintenanceExpense += net;
          } else if (tx.account_code.startsWith("51101") || tx.account_code.startsWith("501")) {
            payrollExpense += net;
          } else if (tx.account_code.startsWith("51003") || tx.account_code.startsWith("505")) {
            utilitiesExpense += net;
          } else if (tx.account_code === "51004007" || tx.account_code === "51001002" || tx.account_code === "51002002" || tx.account_code.startsWith("503")) {
            cleaningExpense += net;
          } else {
            otherExpense += net;
          }
        }
      });

      // In accrual mode, prefer the contract-period calculated rental revenue when leases exist
      const finalRentalRevenue = rentalRevenue > 0 ? rentalRevenue : ledgerRentalRev;
      const totalRevenue = finalRentalRevenue + otherRevenue;
      const totalExpenses = maintenanceExpense + payrollExpense + utilitiesExpense + cleaningExpense + otherExpense;
      const netProfit = totalRevenue - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      const occupiedUnits = Math.max(activeTenantsSet.size, propUnits.filter(u => u.status === "Occupied").length);
      const occupancyRate = totalUnits > 0 ? Math.min(100, Math.round((occupiedUnits / totalUnits) * 100)) : 0;

      return {
        property: propName,
        totalUnits,
        occupiedUnits,
        occupancyRate,
        rentalRevenue: finalRentalRevenue,
        otherRevenue,
        totalRevenue,
        maintenanceExpense,
        payrollExpense,
        utilitiesExpense,
        cleaningExpense,
        otherExpense,
        totalExpenses,
        netProfit,
        profitMargin,
        tenancySchedules,
      };
    });
  }, [propertiesList, units, leases, allLedgerTransactions, selectedPeriod]);

  // Filtered view by property dropdown or search
  const filteredMetricsList = useMemo(() => {
    return propertyMetricsList.filter(m => {
      if (selectedPropertyFilter !== "all" && m.property !== selectedPropertyFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return m.property.toLowerCase().includes(q);
      }
      return true;
    });
  }, [propertyMetricsList, selectedPropertyFilter, searchQuery]);

  // Portfolio Totals
  const portfolioSummary = useMemo(() => {
    const totalRev = filteredMetricsList.reduce((acc, m) => acc + m.totalRevenue, 0);
    const totalRental = filteredMetricsList.reduce((acc, m) => acc + m.rentalRevenue, 0);
    const totalOther = filteredMetricsList.reduce((acc, m) => acc + m.otherRevenue, 0);
    const totalExp = filteredMetricsList.reduce((acc, m) => acc + m.totalExpenses, 0);
    const totalNet = totalRev - totalExp;
    const avgMargin = totalRev > 0 ? (totalNet / totalRev) * 100 : 0;

    // Top performer
    const sorted = [...filteredMetricsList].sort((a, b) => b.netProfit - a.netProfit);
    const topProperty = sorted[0]?.property || "—";
    const topProfit = sorted[0]?.netProfit || 0;

    return {
      totalRevenue: totalRev,
      totalRental,
      totalOther,
      totalExpenses: totalExp,
      netProfit: totalNet,
      margin: avgMargin,
      topProperty,
      topProfit,
      propertyCount: filteredMetricsList.length,
    };
  }, [filteredMetricsList]);

  // Selected drill-down property
  const activePropertyData = useMemo(() => {
    if (!activeDrillDownProperty) return null;
    return propertyMetricsList.find(m => m.property === activeDrillDownProperty) || null;
  }, [activeDrillDownProperty, propertyMetricsList]);

  // Print P&L
  const handlePrint = () => {
    window.print();
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      [`PROPERTY-WISE PROFIT & LOSS STATEMENT - ${branding.companyName || "Al Ameen Real Estate"}`],
      [`Period: ${selectedPeriod === "all" ? "All Periods (Consolidated)" : selectedPeriod} | Generated: ${new Date().toISOString().split("T")[0]}`],
      [],
      [
        "Property Name",
        "Total Units",
        "Occupied",
        "Occupancy %",
        "Rental Revenue (Accrual)",
        "Other Revenue",
        "Total Revenue (QAR)",
        "Maintenance & Repairs",
        "Staff & Payroll",
        "Utilities (Kahramaa)",
        "Cleaning & Sanitation",
        "Other Operating Expenses",
        "Total Operating Expenses (QAR)",
        "Net Profit / (Loss) (QAR)",
        "Net Operating Margin %"
      ],
      ...filteredMetricsList.map(m => [
        `"${m.property}"`,
        m.totalUnits,
        m.occupiedUnits,
        `${m.occupancyRate}%`,
        m.rentalRevenue,
        m.otherRevenue,
        m.totalRevenue,
        m.maintenanceExpense,
        m.payrollExpense,
        m.utilitiesExpense,
        m.cleaningExpense,
        m.otherExpense,
        m.totalExpenses,
        m.netProfit,
        `${m.profitMargin.toFixed(1)}%`
      ]),
      [],
      [
        "PORTFOLIO TOTAL",
        "",
        "",
        "",
        portfolioSummary.totalRental,
        portfolioSummary.totalOther,
        portfolioSummary.totalRevenue,
        "",
        "",
        "",
        "",
        "",
        portfolioSummary.totalExpenses,
        portfolioSummary.netProfit,
        `${portfolioSummary.margin.toFixed(1)}%`
      ]
    ];

    const csvContent = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `property-pnl-${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Property-wise P&L exported to CSV successfully.");
  };

  return (
    <div className="space-y-4">
      {/* ── TOP HEADER & CONTROLS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">Property-Wise Profit &amp; Loss Report (P&amp;L)</h3>
            <Badge variant="outline" className="text-[10px] font-mono bg-emerald-500/10 text-emerald-700 border-emerald-300">
              Accrual Contract Basis
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Property performance recognizing revenue on lease contract tenancy periods, matched against site operating expenses.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="h-8 text-xs w-[190px] font-medium bg-background">
              <Calendar className="h-3.5 w-3.5 mr-1.5 text-primary" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {periodOptions.map(p => (
                <SelectItem key={p.value} value={p.value} className="text-xs font-medium">
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="sm"
            variant="outline"
            onClick={refreshFinanceData}
            disabled={isSyncing}
            className="h-8 text-xs gap-1.5"
            title="Refresh Ledger Transactions"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-primary" : ""}`} />
            Refresh
          </Button>

          <Button size="sm" variant="outline" onClick={handleExportCSV} className="h-8 text-xs gap-1.5">
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>

          <Button size="sm" variant="outline" onClick={handlePrint} className="h-8 text-xs gap-1.5">
            <Printer className="h-3.5 w-3.5" /> Print Report
          </Button>
        </div>
      </div>

      {/* Accrual Standard Callout Banner */}
      <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-emerald-950 dark:text-emerald-100">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Revenue Recognition Standard:</strong> Rental income is recognized based on the active contract period falling within the accounting month (e.g. 15–31 October recognized in October, 1–14 November in November), independent of cheque clearance or cash collection.
          </span>
        </div>
        <div className="text-right shrink-0">
          <span className="text-[10px] uppercase font-mono text-emerald-800 font-semibold block">Accounting Month</span>
          <span className="font-bold text-xs text-foreground font-mono">{selectedPeriod === "all" ? "Consolidated" : selectedPeriod}</span>
        </div>
      </div>

      {/* ── KPI METRICS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3.5 shadow-xs border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Portfolio Revenue</span>
            <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-emerald-600">
              QR {portfolioSummary.totalRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              Rental: QR {portfolioSummary.totalRental.toLocaleString()}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Contract-period accrual across {portfolioSummary.propertyCount} properties
          </p>
        </Card>

        <Card className="p-3.5 shadow-xs border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Operating Expenses</span>
            <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-600">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-rose-600">
              -QR {portfolioSummary.totalExpenses.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground">Direct Site Costs</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Maintenance, Kahramaa, staff &amp; facility services
          </p>
        </Card>

        <Card className={`p-3.5 shadow-xs border ${portfolioSummary.netProfit >= 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Net Operating Profit</span>
            <div className={`p-1.5 rounded-md ${portfolioSummary.netProfit >= 0 ? "bg-emerald-500/20 text-emerald-700" : "bg-rose-500/20 text-rose-700"}`}>
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className={`text-xl font-bold font-mono ${portfolioSummary.netProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
              QR {Math.abs(portfolioSummary.netProfit).toLocaleString()}
            </span>
            <Badge variant="outline" className={`font-mono text-xs ${portfolioSummary.margin >= 0 ? "text-emerald-700 border-emerald-300" : "text-rose-700 border-rose-300"}`}>
              {portfolioSummary.margin >= 0 ? "+" : ""}{portfolioSummary.margin.toFixed(1)}% Margin
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Net Operating Income (NOI) across active portfolio
          </p>
        </Card>

        <Card className="p-3.5 shadow-xs border bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Top Performing Property</span>
            <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 truncate font-bold text-sm text-foreground" title={portfolioSummary.topProperty}>
            {portfolioSummary.topProperty}
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-muted-foreground text-[11px]">Net Profit:</span>
            <span className="font-mono font-bold text-emerald-600">QR {portfolioSummary.topProfit.toLocaleString()}</span>
          </div>
        </Card>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg border bg-muted/20 text-xs">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-64">
            <Select value={selectedPropertyFilter} onValueChange={setSelectedPropertyFilter}>
              <SelectTrigger className="h-8 text-xs bg-background">
                <Building2 className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="All Properties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties (Comparison View)</SelectItem>
                {propertiesList.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
            <Input
              placeholder="Search property..."
              className="h-8 pl-8 text-xs bg-background"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing <strong>{filteredMetricsList.length}</strong> of {propertiesList.length} properties
        </div>
      </div>

      {/* ── COMPARATIVE PROPERTY P&L TABLE ── */}
      <Card className="shadow-xs border overflow-hidden">
        <div className="p-4 border-b bg-muted/40 flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span>Multi-Property Financial Performance Comparison</span>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Property-wise breakdown of recognized rental revenue, recovery income, and operating expenses.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            Cycle: {selectedPeriod === "all" ? "All" : selectedPeriod}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/60 text-xs">
                <TableHead className="font-bold">Property Name</TableHead>
                <TableHead className="text-center font-bold">Occupancy</TableHead>
                <TableHead className="text-right font-bold text-emerald-700">Rental Revenue</TableHead>
                <TableHead className="text-right font-bold">Other Income</TableHead>
                <TableHead className="text-right font-bold text-primary">Total Revenue</TableHead>
                <TableHead className="text-right font-bold">Maintenance</TableHead>
                <TableHead className="text-right font-bold">Utilities</TableHead>
                <TableHead className="text-right font-bold">Staff &amp; Other</TableHead>
                <TableHead className="text-right font-bold text-rose-600">Total Expenses</TableHead>
                <TableHead className="text-right font-bold">Net Profit / (Loss)</TableHead>
                <TableHead className="text-center font-bold">Margin</TableHead>
                <TableHead className="text-center font-bold w-16">Drill-Down</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMetricsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="text-center py-8 text-xs text-muted-foreground">
                    No properties match the selected criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredMetricsList.map((m) => {
                  const isProfitable = m.netProfit >= 0;
                  return (
                    <TableRow key={m.property} className="text-xs hover:bg-muted/30 transition-colors">
                      <TableCell className="font-bold text-foreground max-w-[200px] truncate" title={m.property}>
                        <div className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span>{m.property}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {m.occupiedUnits}/{m.totalUnits} ({m.occupancyRate}%)
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-emerald-600">
                        {m.rentalRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {m.otherRevenue > 0 ? m.otherRevenue.toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-foreground">
                        {m.totalRevenue.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {m.maintenanceExpense > 0 ? m.maintenanceExpense.toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {m.utilitiesExpense > 0 ? m.utilitiesExpense.toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {(m.payrollExpense + m.cleaningExpense + m.otherExpense) > 0 ? (m.payrollExpense + m.cleaningExpense + m.otherExpense).toLocaleString() : "—"}
                      </TableCell>
                      <TableCell className="text-right font-mono font-bold text-rose-600">
                        {m.totalExpenses > 0 ? `-${m.totalExpenses.toLocaleString()}` : "0"}
                      </TableCell>
                      <TableCell className={`text-right font-mono font-bold ${isProfitable ? "text-emerald-600" : "text-rose-600"}`}>
                        QR {Math.abs(m.netProfit).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className={`text-[10px] font-mono ${isProfitable ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-rose-50 text-rose-700 border-rose-300"}`}>
                          {isProfitable ? "+" : ""}{m.profitMargin.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setActiveDrillDownProperty(m.property)}
                          className="h-7 w-7 p-0"
                          title="View Property P&L Details"
                        >
                          <Eye className="h-3.5 w-3.5 text-primary" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Portfolio Table Footer Summary */}
        <div className="p-3 px-6 bg-muted/40 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="font-semibold text-foreground flex items-center gap-2">
            <span>Portfolio Total:</span>
            <Badge variant="outline" className="font-mono text-xs">
              {portfolioSummary.propertyCount} Properties
            </Badge>
          </div>
          <div className="flex items-center gap-6 font-mono text-xs">
            <div>
              <span className="text-muted-foreground mr-1">Revenue:</span>
              <strong className="text-emerald-600">QR {portfolioSummary.totalRevenue.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-muted-foreground mr-1">Expenses:</span>
              <strong className="text-rose-600">-QR {portfolioSummary.totalExpenses.toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-muted-foreground mr-1">Net Operating Profit:</span>
              <strong className={portfolioSummary.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}>
                QR {portfolioSummary.netProfit.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </Card>

      {/* ── PROPERTY DRILL-DOWN MODAL / PANEL ── */}
      {activePropertyData && (
        <Dialog open={Boolean(activePropertyData)} onOpenChange={() => setActiveDrillDownProperty(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-xl">
            <DialogHeader className="p-6 border-b bg-gradient-to-r from-primary/10 via-background to-muted/40">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                    <Building className="h-5 w-5 text-primary" />
                    <span>{activePropertyData.property} — Property P&amp;L Statement</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Period: <strong>{selectedPeriod === "all" ? "Consolidated" : selectedPeriod}</strong> &bull; Accrual contract tenancy schedules and operating expenses.
                  </DialogDescription>
                </div>
                <Badge variant="outline" className={`font-mono font-bold text-xs ${activePropertyData.netProfit >= 0 ? "text-emerald-700 border-emerald-300 bg-emerald-50" : "text-rose-700 border-rose-300 bg-rose-50"}`}>
                  Net Profit: QR {activePropertyData.netProfit.toLocaleString()} ({activePropertyData.profitMargin.toFixed(1)}%)
                </Badge>
              </div>
            </DialogHeader>

            <div className="p-6 space-y-4 text-xs">
              {/* Financial Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg border bg-muted/20">
                  <span className="text-muted-foreground block text-[10px] uppercase">Occupancy</span>
                  <span className="text-base font-bold text-foreground font-mono">
                    {activePropertyData.occupiedUnits} / {activePropertyData.totalUnits} ({activePropertyData.occupancyRate}%)
                  </span>
                </div>
                <div className="p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/20">
                  <span className="text-emerald-800 dark:text-emerald-300 block text-[10px] uppercase font-bold">Total Revenue</span>
                  <span className="text-base font-bold text-emerald-600 font-mono">
                    QR {activePropertyData.totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="p-3 rounded-lg border bg-rose-500/10 border-rose-500/20">
                  <span className="text-rose-800 dark:text-rose-300 block text-[10px] uppercase font-bold">Operating Expenses</span>
                  <span className="text-base font-bold text-rose-600 font-mono">
                    -QR {activePropertyData.totalExpenses.toLocaleString()}
                  </span>
                </div>
                <div className={`p-3 rounded-lg border ${activePropertyData.netProfit >= 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"}`}>
                  <span className="text-muted-foreground block text-[10px] uppercase font-bold">Net Profit (NOI)</span>
                  <span className={`text-base font-bold font-mono ${activePropertyData.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    QR {activePropertyData.netProfit.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Tenancy Schedule Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs flex items-center gap-1.5 text-foreground">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Unit Tenancy Accrual Schedule ({activePropertyData.tenancySchedules.length} Active Leases)</span>
                  </h4>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Recognized based on contract active days in {selectedPeriod}
                  </span>
                </div>

                <div className="border rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/60 text-[11px]">
                        <TableHead className="font-bold">Unit</TableHead>
                        <TableHead className="font-bold">Tenant</TableHead>
                        <TableHead className="font-bold">Contract Term</TableHead>
                        <TableHead className="text-center font-bold">Days in Month</TableHead>
                        <TableHead className="text-right font-bold">Monthly Rent</TableHead>
                        <TableHead className="text-right font-bold text-emerald-600">Recognized Income (QAR)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activePropertyData.tenancySchedules.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                            No active tenancy schedules found for this property in this period.
                          </TableCell>
                        </TableRow>
                      ) : (
                        activePropertyData.tenancySchedules.map((ts, idx) => (
                          <TableRow key={idx} className="text-xs hover:bg-muted/30">
                            <TableCell className="font-mono font-bold">{ts.unit}</TableCell>
                            <TableCell className="font-medium text-foreground">{ts.tenant}</TableCell>
                            <TableCell className="font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                              {ts.contractStart} → {ts.contractEnd}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className="text-[10px] font-mono">
                                {ts.applicableDays} of {ts.totalDays} days
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right font-mono text-muted-foreground">
                              {ts.monthlyRent.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right font-mono font-bold text-emerald-600">
                              {ts.recognizedRevenue.toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Expense Breakdown Card */}
              <div className="p-4 rounded-lg border bg-muted/20 space-y-2">
                <h4 className="font-bold text-xs text-foreground">Operating Expenses Breakdown</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Maintenance (51004):</span>
                    <span className="font-mono font-medium">QR {activePropertyData.maintenanceExpense.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Utilities Kahramaa (51003):</span>
                    <span className="font-mono font-medium">QR {activePropertyData.utilitiesExpense.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Staff &amp; Payroll (51101):</span>
                    <span className="font-mono font-medium">QR {activePropertyData.payrollExpense.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span className="text-muted-foreground">Cleaning &amp; AMC:</span>
                    <span className="font-mono font-medium">QR {activePropertyData.cleaningExpense.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 border-t bg-muted/40">
              <Button variant="outline" size="sm" onClick={() => setActiveDrillDownProperty(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* ── PRINTABLE TEMPLATE (A4 Landscape) ── */}
      <style dangerouslySetInnerHTML={{ __html: `
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
          #printable-property-pnl, #printable-property-pnl * { 
            visibility: visible; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-property-pnl { 
            display: block !important;
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            padding: 0; 
            margin: 0;
            background: #ffffff !important;
          }
        }
      `}} />
      <div id="printable-property-pnl" className="hidden text-left text-foreground bg-white p-6 space-y-4">
        <div className="w-full rounded-lg overflow-hidden border border-border/40 shadow-xs max-h-24 mb-3 bg-white flex items-center justify-center">
          <img
            src={bannerUrl}
            alt={branding.companyName || "Al Ameen Real Estate"}
            className="w-full h-auto max-h-24 object-contain"
          />
        </div>
        <div className="flex justify-between items-start border-b pb-4">
          <div>
            <h2 className="text-lg font-bold text-primary">{branding.companyName || "Al Ameen Real Estate"}</h2>
            <p className="text-xs text-muted-foreground">{branding.legalEntityName || "Al Ameen Real Estate W.L.L"} &bull; Finance &amp; Asset Management</p>
            <p className="text-[11px] text-muted-foreground">Property-Wise Profit and Loss Statement (Accrual Basis)</p>
          </div>
          <div className="text-right">
            <span className="font-black text-xs uppercase px-2.5 py-1 bg-primary/10 text-primary rounded">
              P&amp;L REPORT
            </span>
            <p className="text-xs text-muted-foreground mt-1">Period: {selectedPeriod === "all" ? "Consolidated" : selectedPeriod}</p>
            <p className="text-xs text-muted-foreground">Date: {new Date().toISOString().split("T")[0]}</p>
          </div>
        </div>

        <table className="w-full text-xs border">
          <thead>
            <tr className="bg-muted text-muted-foreground border-b text-[11px]">
              <th className="p-2 text-left">Property Name</th>
              <th className="p-2 text-center">Occupancy</th>
              <th className="p-2 text-right">Rental Revenue</th>
              <th className="p-2 text-right">Other Revenue</th>
              <th className="p-2 text-right">Total Revenue (QAR)</th>
              <th className="p-2 text-right">Maintenance</th>
              <th className="p-2 text-right">Utilities</th>
              <th className="p-2 text-right">Staff &amp; Other</th>
              <th className="p-2 text-right">Total Expenses (QAR)</th>
              <th className="p-2 text-right">Net Profit (QAR)</th>
              <th className="p-2 text-center">Margin</th>
            </tr>
          </thead>
          <tbody>
            {filteredMetricsList.map((m, idx) => (
              <tr key={idx} className="border-b">
                <td className="p-2 font-bold">{m.property}</td>
                <td className="p-2 text-center">{m.occupancyRate}%</td>
                <td className="p-2 text-right font-mono">{m.rentalRevenue.toLocaleString()}</td>
                <td className="p-2 text-right font-mono">{m.otherRevenue.toLocaleString()}</td>
                <td className="p-2 text-right font-mono font-bold">{m.totalRevenue.toLocaleString()}</td>
                <td className="p-2 text-right font-mono">{m.maintenanceExpense.toLocaleString()}</td>
                <td className="p-2 text-right font-mono">{m.utilitiesExpense.toLocaleString()}</td>
                <td className="p-2 text-right font-mono">{(m.payrollExpense + m.cleaningExpense + m.otherExpense).toLocaleString()}</td>
                <td className="p-2 text-right font-mono font-bold text-rose-600">-{m.totalExpenses.toLocaleString()}</td>
                <td className="p-2 text-right font-mono font-bold text-emerald-600">{m.netProfit.toLocaleString()}</td>
                <td className="p-2 text-center font-mono">{m.profitMargin.toFixed(1)}%</td>
              </tr>
            ))}
            <tr className="bg-muted/40 font-bold border-t">
              <td className="p-2">PORTFOLIO TOTAL:</td>
              <td className="p-2 text-center"></td>
              <td className="p-2 text-right font-mono">{portfolioSummary.totalRental.toLocaleString()}</td>
              <td className="p-2 text-right font-mono">{portfolioSummary.totalOther.toLocaleString()}</td>
              <td className="p-2 text-right font-mono text-primary">{portfolioSummary.totalRevenue.toLocaleString()}</td>
              <td colSpan={3} className="p-2"></td>
              <td className="p-2 text-right font-mono text-rose-600">-{portfolioSummary.totalExpenses.toLocaleString()}</td>
              <td className="p-2 text-right font-mono text-emerald-600">{portfolioSummary.netProfit.toLocaleString()}</td>
              <td className="p-2 text-center font-mono">{portfolioSummary.margin.toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-between items-end pt-6 text-xs border-t">
          <div>
            <p className="font-semibold text-muted-foreground">Certified By: Chief Financial Officer / Head of Finance</p>
            <p className="text-[10px] text-muted-foreground">Compliant with Qatar Real Estate Tenancy Accrual Accounting Standards</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground">Authorized Corporate Seal</p>
            <div className="h-10 border border-dashed rounded px-4 py-1 text-[10px] font-mono text-muted-foreground flex items-center justify-center mt-1">
              [AL AMEEN FINANCE SEAL]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

