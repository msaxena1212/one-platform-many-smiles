import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import {
  Building2,
  Calendar,
  Download,
  Printer,
  DoorOpen,
  Search,
  Clock,
} from "lucide-react";
import { useAppData } from "@/lib/app-data-context";
import { toast } from "sonner";

function normProp(p?: string): string {
  return (p || "").trim().toLowerCase();
}

export function LeaseExpiryVacancyReportSubModule() {
  const { units, leases } = useAppData();

  const [activeTab, setActiveTab] = useState<"expiring" | "vacant" | "property_summary">("expiring");
  const [expiryWindowDays, setExpiryWindowDays] = useState<string>("90");
  const [propertyFilter, setPropertyFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [referenceDate, setReferenceDate] = useState<string>(() => new Date().toISOString().split("T")[0]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const propertiesList = useMemo(() => {
    const set = new Set<string>();
    units.forEach((u) => {
      if (u.property && u.property !== "Property") set.add(u.property.trim());
    });
    leases.forEach((l) => {
      if (l.property && l.property !== "Property") set.add(l.property.trim());
    });
    return Array.from(set).filter(Boolean).sort();
  }, [units, leases]);

  // Compute real average contracted rent per property (so unpriced vacant units use only their own property's real avg rent, never hardcoded fake numbers)
  const propertyAvgRentMap = useMemo(() => {
    const map = new Map<string, number>();
    propertiesList.forEach((propName) => {
      const pKey = normProp(propName);
      const rents: number[] = [];
      leases.forEach((l) => {
        if (normProp(l.property) === pKey && Number(l.monthlyRent) > 0) {
          rents.push(Number(l.monthlyRent));
        }
      });
      units.forEach((u) => {
        if (normProp(u.property) === pKey && Number(u.rent) > 0) {
          rents.push(Number(u.rent));
        }
      });
      const avg = rents.length > 0 ? Math.round(rents.reduce((a, b) => a + b, 0) / rents.length) : 0;
      map.set(pKey, avg);
    });
    return map;
  }, [propertiesList, leases, units]);

  // 1. Expiring Leases Pipeline
  const expiringLeases = useMemo(() => {
    const refMs = new Date(referenceDate).getTime();
    const maxDays = Number(expiryWindowDays);

    return leases
      .filter((l) => String(l.status) !== "closed" && String(l.status) !== "cancelled" && String(l.status) !== "checkout")
      .map((l) => {
        const endMs = new Date(l.endDate).getTime();
        const daysRemaining = isNaN(endMs) || isNaN(refMs)
          ? 999
          : Math.round((endMs - refMs) / (1000 * 60 * 60 * 24));

        // Check if currently in grace / rent-free period
        const startMs = new Date(l.startDate).getTime();
        const graceDays = Number(l.gracePeriodDays || 0);
        const graceEndMs = !isNaN(startMs) ? startMs + graceDays * 24 * 3600 * 1000 : 0;
        const inGracePeriod = graceDays > 0 && refMs >= startMs && refMs <= graceEndMs;

        return {
          ...l,
          daysRemaining,
          inGracePeriod,
        };
      })
      .filter((l) => {
        if (propertyFilter !== "ALL" && normProp(l.property) !== normProp(propertyFilter)) return false;
        if (maxDays > 0 && (l.daysRemaining < -60 || l.daysRemaining > maxDays)) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          if (
            !(l.tenantName || "").toLowerCase().includes(q) &&
            !(l.property || "").toLowerCase().includes(q) &&
            !(l.unit || "").toLowerCase().includes(q)
          ) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [leases, referenceDate, expiryWindowDays, propertyFilter, searchQuery]);

  // 2. Vacant Units & Estimated Monthly Vacancy Rent Loss (strictly derived from real unit rent or same-property avg rent)
  const vacantUnits = useMemo(() => {
    const activeLeaseUnitKeys = new Set(
      leases
        .filter((l) => String(l.status) !== "closed" && String(l.status) !== "cancelled" && String(l.status) !== "checkout")
        .map((l) => `${normProp(l.property)}__${(l.unit || "").trim().toLowerCase()}`)
    );

    return units
      .filter((u) => {
        const key = `${normProp(u.property)}__${(u.unit || "").trim().toLowerCase()}`;
        if (activeLeaseUnitKeys.has(key)) return false;
        return u.status === "Available" || u.status === "Vacant - Under Maintenance";
      })
      .filter((u) => {
        if (propertyFilter !== "ALL" && normProp(u.property) !== normProp(propertyFilter)) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          if (!(u.property || "").toLowerCase().includes(q) && !(u.unit || "").toLowerCase().includes(q)) return false;
        }
        return true;
      })
      .map((u) => {
        const unitRent = Number(u.rent) || propertyAvgRentMap.get(normProp(u.property)) || 0;
        return {
          ...u,
          estimatedMonthlyLoss: unitRent,
        };
      });
  }, [units, leases, propertyFilter, searchQuery, propertyAvgRentMap]);

  // 3. Property Occupancy & Vacancy Loss Summary
  const propertySummaries = useMemo(() => {
    return propertiesList
      .filter((p) => propertyFilter === "ALL" || normProp(p) === normProp(propertyFilter))
      .map((propName) => {
        const pKey = normProp(propName);
        const propUnits = units.filter((u) => normProp(u.property) === pKey);
        const propActiveLeases = leases.filter(
          (l) =>
            normProp(l.property) === pKey &&
            String(l.status) !== "closed" &&
            String(l.status) !== "cancelled" &&
            String(l.status) !== "checkout"
        );

        const occupiedUnitNames = new Set<string>();
        propActiveLeases.forEach((l) => {
          if (l.unit) occupiedUnitNames.add(l.unit.trim().toLowerCase());
        });
        propUnits.forEach((u) => {
          if (u.status === "Occupied" || u.status === "Reserved") {
            occupiedUnitNames.add((u.unit || "").trim().toLowerCase());
          }
        });

        const totalUnits = Math.max(propUnits.length, occupiedUnitNames.size);
        const occupiedUnits = occupiedUnitNames.size;
        const vacantCount = Math.max(0, totalUnits - occupiedUnits);
        const occupancyPct = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 1000) / 10 : 0;

        const occupiedRent =
          propActiveLeases.length > 0
            ? propActiveLeases.reduce((s, l) => s + Number(l.monthlyRent || 0), 0)
            : propUnits
                .filter((u) => u.status === "Occupied" || u.status === "Reserved")
                .reduce((s, u) => s + Number(u.rent || 0), 0);

        const avgPropRent = propertyAvgRentMap.get(pKey) || 0;
        const monthlyVacancyLoss = propUnits
          .filter((u) => !occupiedUnitNames.has((u.unit || "").trim().toLowerCase()))
          .reduce((s, u) => s + (Number(u.rent) || avgPropRent || 0), 0);

        const expiring90Count = propActiveLeases.filter((l) => {
          const diff = (new Date(l.endDate).getTime() - new Date(referenceDate).getTime()) / (1000 * 3600 * 24);
          return diff >= 0 && diff <= 90;
        }).length;

        return {
          property: propName,
          totalUnits,
          occupiedUnits,
          vacantCount,
          occupancyPct,
          occupiedRent,
          monthlyVacancyLoss,
          expiring90Count,
        };
      });
  }, [propertiesList, units, leases, propertyFilter, referenceDate, propertyAvgRentMap]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, expiryWindowDays, propertyFilter, searchQuery, referenceDate]);

  const activeRows = activeTab === "expiring" ? expiringLeases : activeTab === "vacant" ? vacantUnits : propertySummaries;
  const totalPages = Math.max(1, Math.ceil(activeRows.length / pageSize));
  const visibleExpiringLeases = expiringLeases.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visibleVacantUnits = vacantUnits.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const visiblePropertySummaries = propertySummaries.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const renderPagination = (rowCount: number) => rowCount > 0 ? (
    <div className="flex flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-muted-foreground">
        Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, rowCount)} of {rowCount}
      </span>
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setCurrentPage((page) => Math.max(1, page - 1));
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          <PaginationItem><span className="px-3 text-xs">Page {currentPage} of {totalPages}</span></PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(event) => {
                event.preventDefault();
                setCurrentPage((page) => Math.min(totalPages, page + 1));
              }}
              className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  ) : null;

  const handleExportCsv = () => {
    if (activeTab === "expiring") {
      const headers = [
        "Property",
        "Unit",
        "Tenant Name",
        "Start Date",
        "End Date",
        "Days Remaining",
        "Monthly Rent (QAR)",
        "Grace Period (Days)",
        "Status",
      ];
      const rows = expiringLeases.map((l) => [
        `"${(l.property || "").replace(/"/g, '""')}"`,
        `"${l.unit || ""}"`,
        `"${(l.tenantName || "").replace(/"/g, '""')}"`,
        l.startDate,
        l.endDate,
        l.daysRemaining,
        Number(l.monthlyRent || 0).toFixed(2),
        l.gracePeriodDays || 0,
        l.status,
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Lease_Expiry_Pipeline_${referenceDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = [
        "Property",
        "Total Units",
        "Occupied Units",
        "Vacant Units",
        "Occupancy %",
        "Contracted Rent (QAR)",
        "Monthly Vacancy Loss (QAR)",
        "Expiring in 90 Days",
      ];
      const rows = propertySummaries.map((p) => [
        `"${p.property.replace(/"/g, '""')}"`,
        p.totalUnits,
        p.occupiedUnits,
        p.vacantCount,
        `${p.occupancyPct}%`,
        p.occupiedRent.toFixed(2),
        p.monthlyVacancyLoss.toFixed(2),
        p.expiring90Count,
      ]);
      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Property_Occupancy_Vacancy_Loss_${referenceDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    toast.success("Report CSV exported!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-xl p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Lease Expiry Pipeline & Vacancy Rent Loss Report</h2>
            <p className="text-xs text-muted-foreground">
              30 / 60 / 90-day contract renewal pipeline, grace period tracking, and property-isolated vacancy revenue loss analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList>
                <TabsTrigger value="expiring" className="text-xs font-semibold">
                  Upcoming Lease Expiries ({expiringLeases.length})
                </TabsTrigger>
                <TabsTrigger value="vacant" className="text-xs font-semibold">
                  Vacant Units & Loss ({vacantUnits.length})
                </TabsTrigger>
                <TabsTrigger value="property_summary" className="text-xs font-semibold">
                  Property Occupancy Matrix ({propertySummaries.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 flex-1 max-w-3xl">
              <div>
                <Label className="text-[11px] text-muted-foreground">As-Of Date</Label>
                <Input
                  type="date"
                  value={referenceDate}
                  onChange={(e) => setReferenceDate(e.target.value)}
                  className="h-8 text-xs mt-0.5"
                />
              </div>

              <div>
                <Label className="text-[11px] text-muted-foreground">Expiry Window</Label>
                <Select value={expiryWindowDays} onValueChange={setExpiryWindowDays}>
                  <SelectTrigger className="h-8 text-xs mt-0.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Expiring in 30 Days</SelectItem>
                    <SelectItem value="60">Expiring in 60 Days</SelectItem>
                    <SelectItem value="90">Expiring in 90 Days</SelectItem>
                    <SelectItem value="180">Expiring in 180 Days</SelectItem>
                    <SelectItem value="0">All Active Leases</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px] text-muted-foreground">Property Filter</Label>
                <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                  <SelectTrigger className="h-8 text-xs mt-0.5">
                    <SelectValue placeholder="All Properties" />
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
                <Label className="text-[11px] text-muted-foreground">Search Unit / Tenant</Label>
                <div className="relative mt-0.5">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Unit #, tenant..."
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

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border-l-4 border-l-amber-500">
          <span className="text-[11px] uppercase font-bold text-muted-foreground block">
            Leases Expiring ({expiryWindowDays === "0" ? "All" : `${expiryWindowDays}d`})
          </span>
          <span className="text-lg font-bold font-mono text-amber-600 mt-1 block">{expiringLeases.length} Leases</span>
        </Card>
        <Card className="p-4 border-l-4 border-l-indigo-500">
          <span className="text-[11px] uppercase font-bold text-muted-foreground block">Expiring Monthly Rent</span>
          <span className="text-lg font-bold font-mono text-indigo-600 mt-1 block">
            QR {expiringLeases.reduce((s, l) => s + Number(l.monthlyRent || 0), 0).toLocaleString()}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-rose-500">
          <span className="text-[11px] uppercase font-bold text-muted-foreground block">Vacant Units</span>
          <span className="text-lg font-bold font-mono text-rose-600 mt-1 block">{vacantUnits.length} Units</span>
        </Card>
        <Card className="p-4 border-l-4 border-l-rose-600 bg-rose-500/5">
          <span className="text-[11px] uppercase font-bold text-rose-700 dark:text-rose-300 block">
            Est. Monthly Vacancy Loss
          </span>
          <span className="text-lg font-bold font-mono text-rose-600 mt-1 block">
            QR {vacantUnits.reduce((s, u) => s + u.estimatedMonthlyLoss, 0).toLocaleString()}
          </span>
        </Card>
      </div>

      {/* Tab 1: Expiring Leases */}
      {activeTab === "expiring" && (
        <Card>
          <div className="rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs font-bold">Property</TableHead>
                  <TableHead className="text-xs font-bold">Unit</TableHead>
                  <TableHead className="text-xs font-bold">Tenant Name</TableHead>
                  <TableHead className="text-xs font-bold">Lease Start</TableHead>
                  <TableHead className="text-xs font-bold">Lease Expiry</TableHead>
                  <TableHead className="text-xs font-bold">Days Remaining</TableHead>
                  <TableHead className="text-xs font-bold text-right">Monthly Rent</TableHead>
                  <TableHead className="text-xs font-bold">Concession / Grace</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleExpiringLeases.map((l) => (
                  <TableRow key={l.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" /> {l.property}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono font-bold text-primary">{l.unit}</TableCell>
                    <TableCell className="text-xs font-semibold">{l.tenantName}</TableCell>
                    <TableCell className="text-xs font-mono">{l.startDate}</TableCell>
                    <TableCell className="text-xs font-mono font-semibold">{l.endDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={l.daysRemaining <= 30 ? "destructive" : "outline"}
                        className="text-[10px] font-mono"
                      >
                        {l.daysRemaining < 0
                          ? `Expired ${Math.abs(l.daysRemaining)}d ago`
                          : `${l.daysRemaining} days left`}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">
                      QR {Number(l.monthlyRent || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {l.inGracePeriod ? (
                        <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 text-[10px]">
                          <Clock className="h-2.5 w-2.5 mr-1" /> Active Grace ({l.gracePeriodDays}d)
                        </Badge>
                      ) : Number(l.gracePeriodDays || 0) > 0 ? (
                        <span className="text-[11px] text-muted-foreground">{l.gracePeriodDays}d grace</span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {l.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {expiringLeases.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-muted-foreground text-xs">
                      No leases expiring within the selected window.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {renderPagination(expiringLeases.length)}
        </Card>
      )}

      {/* Tab 2: Vacant Units */}
      {activeTab === "vacant" && (
        <Card>
          <div className="rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs font-bold">Property</TableHead>
                  <TableHead className="text-xs font-bold">Vacant Unit</TableHead>
                  <TableHead className="text-xs font-bold">Type / Layout</TableHead>
                  <TableHead className="text-xs font-bold">Availability Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Est. Monthly Opportunity Loss</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleVacantUnits.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-medium">{u.property}</TableCell>
                    <TableCell className="text-xs font-mono font-bold text-primary">
                      <span className="inline-flex items-center gap-1">
                        <DoorOpen className="h-3.5 w-3.5 text-rose-500" /> {u.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{u.type || "Residential Unit"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] border-rose-500/30 text-rose-600">
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-rose-600">
                      {u.estimatedMonthlyLoss > 0 ? `-QR ${u.estimatedMonthlyLoss.toLocaleString()} / mo` : "QR 0 (Unpriced)"}
                    </TableCell>
                  </TableRow>
                ))}
                {vacantUnits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10 text-emerald-600 text-xs font-medium">
                      100% Occupied — Zero vacant units for the selected property!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {renderPagination(vacantUnits.length)}
        </Card>
      )}

      {/* Tab 3: Property Occupancy Matrix */}
      {activeTab === "property_summary" && (
        <Card>
          <div className="rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="text-xs font-bold">Property</TableHead>
                  <TableHead className="text-xs font-bold text-center">Total Units</TableHead>
                  <TableHead className="text-xs font-bold text-center">Occupied</TableHead>
                  <TableHead className="text-xs font-bold text-center">Vacant</TableHead>
                  <TableHead className="text-xs font-bold text-center">Occupancy %</TableHead>
                  <TableHead className="text-xs font-bold text-right">Contracted Monthly Rent</TableHead>
                  <TableHead className="text-xs font-bold text-right text-rose-600">Monthly Vacancy Loss</TableHead>
                  <TableHead className="text-xs font-bold text-center">Expiring &lt;90d</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visiblePropertySummaries.map((p) => (
                  <TableRow key={p.property} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-semibold">{p.property}</TableCell>
                    <TableCell className="text-center font-mono text-xs">{p.totalUnits}</TableCell>
                    <TableCell className="text-center font-mono text-xs text-emerald-600 font-bold">
                      {p.occupiedUnits}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs text-rose-600 font-bold">
                      {p.vacantCount}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={p.occupancyPct >= 85 ? "default" : "outline"}
                        className="text-[10px] font-mono"
                      >
                        {p.occupancyPct}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold text-emerald-700">
                      QR {p.occupiedRent.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold text-rose-600">
                      {p.monthlyVacancyLoss > 0 ? `-QR ${p.monthlyVacancyLoss.toLocaleString()}` : "QR 0"}
                    </TableCell>
                    <TableCell className="text-center font-mono text-xs">{p.expiring90Count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {renderPagination(propertySummaries.length)}
        </Card>
      )}
    </div>
  );
}
