import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileCheck,
  Download,
  Printer,
  Building2,
  Scale,
  Search,
  Landmark,
  CheckCircle2,
} from "lucide-react";
import { useAppData } from "@/lib/app-data-context";
import { useFinanceStore } from "@/lib/finance/finance-store";
import { toast } from "sonner";

export function PdcMaturityForecastReportSubModule() {
  const { pdcs, leases } = useAppData();
  const { receivableInvoices, legalReceivables, addLegalEscalation, addReceivableInvoice } = useFinanceStore();

  const [activeView, setActiveView] = useState<"upcoming" | "bounced" | "all">("upcoming");
  const [horizonDays, setHorizonDays] = useState<string>("30");
  const [propertyFilter, setPropertyFilter] = useState<string>("ALL");
  const [bankFilter, setBankFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [referenceDate, setReferenceDate] = useState<string>(() => new Date().toISOString().split("T")[0]);

  const enrichedPdcs = useMemo(() => {
    const refMs = new Date(referenceDate).getTime();

    return pdcs.map((pdc) => {
      const lease = leases.find((l) => l.id === pdc.leaseId);
      const prop = (lease?.property || (pdc as any).property || "Unassigned Property").trim();
      const unit = (lease?.unit || (pdc as any).unit || "—").trim();
      const tenant = (lease?.tenantName || (pdc as any).tenantName || (pdc as any).drawer || "Unassigned Tenant").trim();
      const matDateStr = pdc.date || (pdc as any).dueDate || referenceDate;
      const matMs = new Date(matDateStr).getTime();
      const daysToMaturity =
        isNaN(matMs) || isNaN(refMs) ? 0 : Math.round((matMs - refMs) / (1000 * 60 * 60 * 24));

      const caseId = `LGL-${pdc.chequeNo}`;
      const isEscalated = legalReceivables.some((l) => l.legal_case_id === caseId);
      const penaltyInvNo = `DN-BNC-${pdc.chequeNo}`;
      const hasPenaltyBilled = receivableInvoices.some((inv) => inv.invoice_no === penaltyInvNo);

      return {
        ...pdc,
        maturityDate: matDateStr,
        property: prop,
        unit,
        tenantName: tenant,
        customerId: lease?.customerId,
        leaseId: lease?.id || pdc.leaseId,
        daysToMaturity,
        isEscalated,
        hasPenaltyBilled,
      };
    });
  }, [pdcs, leases, referenceDate, legalReceivables, receivableInvoices]);

  const propertiesList = useMemo(() => {
    const set = new Set<string>();
    enrichedPdcs.forEach((p) => {
      if (p.property && p.property !== "Unassigned Property") set.add(p.property);
    });
    leases.forEach((l) => {
      if (l.property) set.add(l.property.trim());
    });
    return Array.from(set).sort();
  }, [enrichedPdcs, leases]);

  const banksList = useMemo(() => {
    const set = new Set<string>();
    enrichedPdcs.forEach((p) => {
      if (p.bank) set.add(p.bank);
    });
    return Array.from(set).sort();
  }, [enrichedPdcs]);

  const filteredPdcs = useMemo(() => {
    const maxDays = Number(horizonDays);
    return enrichedPdcs
      .filter((p) => {
        if (propertyFilter !== "ALL" && p.property !== propertyFilter) return false;
        if (bankFilter !== "ALL" && p.bank !== bankFilter) return false;

        const st = String(p.status || "").toLowerCase();
        if (activeView === "upcoming") {
          if (st !== "received" && st !== "deposited") return false;
          if (maxDays > 0 && (p.daysToMaturity < -30 || p.daysToMaturity > maxDays)) return false;
        } else if (activeView === "bounced") {
          if (st !== "bounced" && st !== "returned") return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            String(p.chequeNo || "").toLowerCase().includes(q) ||
            p.tenantName.toLowerCase().includes(q) ||
            p.property.toLowerCase().includes(q) ||
            p.unit.toLowerCase().includes(q) ||
            String(p.bank || "").toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .sort((a, b) => a.maturityDate.localeCompare(b.maturityDate));
  }, [enrichedPdcs, activeView, horizonDays, propertyFilter, bankFilter, searchQuery]);

  // Property-filtered KPI Summary (zero cross-property leakage when a property filter is selected!)
  const summary = useMemo(() => {
    const scoped = enrichedPdcs.filter(
      (p) => (propertyFilter === "ALL" || p.property === propertyFilter) && (bankFilter === "ALL" || p.bank === bankFilter)
    );
    const due7 = scoped
      .filter((p) => (p.status === "received" || p.status === "deposited") && p.daysToMaturity >= 0 && p.daysToMaturity <= 7)
      .reduce((s, p) => s + Number(p.amount || 0), 0);
    const due30 = scoped
      .filter((p) => (p.status === "received" || p.status === "deposited") && p.daysToMaturity >= 0 && p.daysToMaturity <= 30)
      .reduce((s, p) => s + Number(p.amount || 0), 0);
    const bouncedTotal = scoped
      .filter((p) => String(p.status) === "bounced" || String(p.status) === "returned")
      .reduce((s, p) => s + Number(p.amount || 0), 0);
    const clearedTotal = scoped
      .filter((p) => p.status === "cleared")
      .reduce((s, p) => s + Number(p.amount || 0), 0);

    return { due7, due30, bouncedTotal, clearedTotal };
  }, [enrichedPdcs, propertyFilter, bankFilter]);

  const handleBookBouncePenaltyAndEscalate = (pdc: typeof enrichedPdcs[number]) => {
    const penaltyFee = 250; // Standard QAR 250 cheque dishonor admin charge
    const invNo = `DN-BNC-${pdc.chequeNo}`;
    const caseId = `LGL-${pdc.chequeNo}`;

    if (pdc.isEscalated && pdc.hasPenaltyBilled) {
      toast.info(`Cheque #${pdc.chequeNo} has already been billed a bounce penalty and escalated to Legal.`);
      return;
    }

    if (!pdc.hasPenaltyBilled) {
      addReceivableInvoice({
        invoice_no: invNo,
        tenant: pdc.tenantName,
        customerId: pdc.customerId,
        leaseId: pdc.leaseId,
        property: pdc.property,
        unit: pdc.unit,
        date: referenceDate,
        due_date: referenceDate,
        billingPeriod: referenceDate.slice(0, 7),
        stream: "41201007 - Cheque Dishonour Recovery",
        account_code: "41201007",
        amount: penaltyFee,
        notes: `Dishonored Cheque #${pdc.chequeNo} (${pdc.bank || "Bank"}) Penalty Charge`,
      });
    }

    if (!pdc.isEscalated) {
      const chqAmt = Number(pdc.amount || 0);
      addLegalEscalation({
        legal_case_id: caseId,
        tenant_name: pdc.tenantName,
        property_name: pdc.property,
        unit_ref: pdc.unit,
        original_amount: chqAmt,
        outstanding_balance: chqAmt,
        escalation_date: referenceDate,
        reason: `Dishonored PDC Cheque #${pdc.chequeNo} (${pdc.bank || "Bank"}) matured ${pdc.maturityDate}`,
        status: "Legal Notice Sent",
      });
    }

    toast.success(
      `Posted Bounce Penalty Invoice (${invNo} — QR ${penaltyFee} to GL 41201007) & Escalated Cheque #${pdc.chequeNo} to Legal Receivables (GL 12411)!`
    );
  };

  const handleExportCsv = () => {
    const headers = [
      "Maturity Date",
      "Days to Maturity",
      "Cheque No",
      "Drawee Bank",
      "Tenant Name",
      "Property",
      "Unit",
      "Amount (QAR)",
      "Status",
    ];
    const rows = filteredPdcs.map((p) => [
      p.maturityDate,
      p.daysToMaturity,
      `"${p.chequeNo}"`,
      `"${p.bank || ""}"`,
      `"${p.tenantName.replace(/"/g, '""')}"`,
      `"${p.property.replace(/"/g, '""')}"`,
      `"${p.unit}"`,
      Number(p.amount || 0).toFixed(2),
      p.status,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `PDC_Maturity_Schedule_${referenceDate}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("PDC Maturity & Bounce Schedule exported to CSV!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-xl p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
            <FileCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">PDC Maturity Forecast & Dishonored Cheque Tracker</h2>
            <p className="text-xs text-muted-foreground">
              Daily cashier deposit schedule (7 / 15 / 30 / 60 / 90 days) with direct GL 41201007 bounce penalty & GL 12411 legal escalation
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export Deposit Schedule CSV
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5 text-xs">
            <Printer className="h-3.5 w-3.5" /> Print Schedule
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <span className="text-[11px] uppercase font-bold text-muted-foreground block">Maturing Next 7 Days</span>
          <span className="text-lg font-bold font-mono text-blue-600 mt-1 block">
            QR {summary.due7.toLocaleString()}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-indigo-500">
          <span className="text-[11px] uppercase font-bold text-muted-foreground block">Maturing Next 30 Days</span>
          <span className="text-lg font-bold font-mono text-indigo-600 mt-1 block">
            QR {summary.due30.toLocaleString()}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-rose-500">
          <span className="text-[11px] uppercase font-bold text-muted-foreground block">Dishonored / Bounced PDCs</span>
          <span className="text-lg font-bold font-mono text-rose-600 mt-1 block">
            QR {summary.bouncedTotal.toLocaleString()}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-[11px] uppercase font-bold text-muted-foreground block">Total Cleared PDCs</span>
          <span className="text-lg font-bold font-mono text-emerald-600 mt-1 block">
            QR {summary.clearedTotal.toLocaleString()}
          </span>
        </Card>
      </div>

      {/* Filter Controls */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)}>
              <TabsList>
                <TabsTrigger value="upcoming" className="text-xs font-semibold">
                  Upcoming Deposit Queue
                </TabsTrigger>
                <TabsTrigger value="bounced" className="text-xs font-semibold">
                  Bounced / Returned Cheques
                </TabsTrigger>
                <TabsTrigger value="all" className="text-xs font-semibold">
                  Full PDC Portfolio
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 flex-1 max-w-4xl">
              <div>
                <Label className="text-[11px] text-muted-foreground">Reference Date</Label>
                <Input
                  type="date"
                  value={referenceDate}
                  onChange={(e) => setReferenceDate(e.target.value)}
                  className="h-8 text-xs mt-0.5"
                />
              </div>

              <div>
                <Label className="text-[11px] text-muted-foreground">Maturity Window</Label>
                <Select value={horizonDays} onValueChange={setHorizonDays}>
                  <SelectTrigger className="h-8 text-xs mt-0.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Next 7 Days</SelectItem>
                    <SelectItem value="15">Next 15 Days</SelectItem>
                    <SelectItem value="30">Next 30 Days</SelectItem>
                    <SelectItem value="60">Next 60 Days</SelectItem>
                    <SelectItem value="90">Next 90 Days</SelectItem>
                    <SelectItem value="0">All Future Dates</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px] text-muted-foreground">Property</Label>
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
                <Label className="text-[11px] text-muted-foreground">Drawee Bank</Label>
                <Select value={bankFilter} onValueChange={setBankFilter}>
                  <SelectTrigger className="h-8 text-xs mt-0.5">
                    <SelectValue placeholder="All Banks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Banks</SelectItem>
                    {banksList.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px] text-muted-foreground">Search Cheque / Tenant</Label>
                <div className="relative mt-0.5">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                  <Input
                    placeholder="Cheque #, tenant..."
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

      {/* PDC Schedule Table */}
      <Card>
        <div className="rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs font-bold">Maturity Date</TableHead>
                <TableHead className="text-xs font-bold">Countdown</TableHead>
                <TableHead className="text-xs font-bold">Cheque #</TableHead>
                <TableHead className="text-xs font-bold">Bank</TableHead>
                <TableHead className="text-xs font-bold">Tenant</TableHead>
                <TableHead className="text-xs font-bold">Property & Unit</TableHead>
                <TableHead className="text-xs font-bold text-right">Amount (QAR)</TableHead>
                <TableHead className="text-xs font-bold">Status</TableHead>
                <TableHead className="text-xs font-bold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPdcs.map((pdc) => {
                const isBounced = String(pdc.status) === "bounced" || String(pdc.status) === "returned";
                return (
                  <TableRow key={pdc.id} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-mono font-semibold">{pdc.maturityDate}</TableCell>
                    <TableCell>
                      <Badge
                        variant={pdc.daysToMaturity < 0 ? "destructive" : "outline"}
                        className="text-[10px] font-mono"
                      >
                        {pdc.daysToMaturity === 0
                          ? "Due Today"
                          : pdc.daysToMaturity > 0
                          ? `In ${pdc.daysToMaturity}d`
                          : `${Math.abs(pdc.daysToMaturity)}d ago`}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono font-bold text-primary">#{pdc.chequeNo}</TableCell>
                    <TableCell className="text-xs">
                      <span className="inline-flex items-center gap-1">
                        <Landmark className="h-3 w-3 text-muted-foreground" /> {pdc.bank || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{pdc.tenantName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> {pdc.property} ({pdc.unit})
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">
                      QR {Number(pdc.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isBounced ? "destructive" : pdc.status === "cleared" ? "default" : "outline"}
                        className="text-[10px] capitalize"
                      >
                        {pdc.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {isBounced ? (
                        pdc.isEscalated && pdc.hasPenaltyBilled ? (
                          <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Escalated & Billed
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-7 text-[11px] gap-1"
                            onClick={() => handleBookBouncePenaltyAndEscalate(pdc)}
                          >
                            <Scale className="h-3 w-3" /> Penalty + Legal Escalate
                          </Button>
                        )
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          {pdc.status === "received" ? "Ready for Bank Deposit" : "Tracked"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredPdcs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-xs">
                    No post-dated cheques match the selected maturity window and property filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
