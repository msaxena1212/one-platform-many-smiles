import { useState, useMemo, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ShieldCheck,
  Building2,
  Download,
  Printer,
  Wrench,
  CheckCircle2,
  Search,
  Banknote,
} from "lucide-react";
import { useAppData } from "@/lib/app-data-context";
import { useFinanceStore } from "@/lib/finance/finance-store";
import { supabase, fetchMaintenanceTickets, type MaintenanceTicket } from "@/lib/supabase";
import { settleDeposit } from "@/lib/finance/depositService";
import { toast } from "sonner";

function norm(s?: string): string {
  return (s || "").trim().toLowerCase();
}

interface DepositReconciliationItem {
  key: string;
  dbDepositId?: string | number;
  leaseId: string;
  property: string;
  unit: string;
  tenantName: string;
  leaseEndDate: string;
  leaseStatus: string;
  grossDeposit: number;
  snaggingTicketsCount: number;
  snaggingDamageCost: number;
  snaggingSummary: string;
  settledDeduction: number;
  settledRefund: number;
  status: "Held (Active)" | "Checkout Pending Refund" | "Settled & Refunded";
}

export function SecurityDepositReconciliationSubModule() {
  const { leases, units } = useAppData();
  const { addJournalEntry, addVoucher, allLedgerTransactions } = useFinanceStore();

  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [dbDeposits, setDbDeposits] = useState<any[]>([]);
  const [settledLocalMap, setSettledLocalMap] = useState<
    Record<string, { deduction: number; refund: number; date: string }>
  >(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("pms_deposit_settlements_v1") || "{}");
    } catch {
      return {};
    }
  });

  const [propertyFilter, setPropertyFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Settlement Modal State
  const [activeDeposit, setActiveDeposit] = useState<DepositReconciliationItem | null>(null);
  const [deductionInput, setDeductionInput] = useState<string>("0");
  const [settlementNotes, setSettlementNotes] = useState<string>("");
  const [settlementDate, setSettlementDate] = useState<string>(
    () => new Date().toISOString().split("T")[0],
  );
  const [settling, setSettling] = useState(false);

  useEffect(() => {
    fetchMaintenanceTickets()
      .then((res) => setTickets(res || []))
      .catch(() => {});

    supabase
      .from("fin_deposits")
      .select("*")
      .then(({ data }) => {
        if (data) setDbDeposits(data);
      });
  }, []);

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

  // Reconcile Security Deposits strictly per (Property + Unit + Lease) and link exact Move-Out / Damage Maintenance Tickets
  const depositItems = useMemo<DepositReconciliationItem[]>(() => {
    return leases
      .filter((l) => Number(l.securityDeposit || 0) > 0)
      .map((l) => {
        const pKey = norm(l.property);
        const uKey = norm(l.unit);
        const rowKey = `${pKey}__${uKey}__${l.id}`;

        // Match any DB deposit record strictly for this lease or (property + unit + tenant)
        const matchedDbDep = dbDeposits.find(
          (d) =>
            (d.lease_id && String(d.lease_id) === String(l.id)) ||
            (norm(d.unit_ref) === uKey && norm(d.tenant_name) === norm(l.tenantName)),
        );

        // Match Maintenance / Move-Out Snagging tickets strictly for THIS exact (property + unit)
        const unitTickets = tickets.filter((t: any) => {
          const tProp = norm(t.property_name || t.property);
          const tUnit = norm(t.unit_number || t.unit);
          if (tProp && tProp !== pKey) return false;
          if (!tUnit || tUnit !== uKey) return false;
          // Only tenant-chargeable / move-out / damage tickets or tickets with explicit tenant chargeback cost
          const isChargeable =
            Boolean(t.charge_to_tenant) ||
            (t.category || "").toLowerCase().includes("damage") ||
            (t.title || "").toLowerCase().includes("move-out") ||
            (t.title || "").toLowerCase().includes("snag") ||
            (t.title || "").toLowerCase().includes("checkout");
          return isChargeable;
        });

        const snaggingCost = unitTickets.reduce(
          (s, t: any) => s + Number(t.actual_cost || t.estimated_cost || t.cost || 0),
          0,
        );
        const snaggingSummary = unitTickets
          .map(
            (t: any) =>
              `${t.title || t.category || "Snagging"} (QR ${Number(t.actual_cost || t.estimated_cost || 0)})`,
          )
          .join("; ");

        // Check if settled in DB, local cache, or Ledger
        const localSettle = settledLocalMap[rowKey];
        const isDbSettled = matchedDbDep?.status === "Settled";
        const ledgerSettled = allLedgerTransactions.some(
          (tx) =>
            (tx.account_code.startsWith("211") || tx.account_code.startsWith("215")) &&
            tx.debit > 0 &&
            norm(tx.property_name) === pKey &&
            norm(tx.unit_ref) === uKey,
        );

        const gross = Number(matchedDbDep?.amount || l.securityDeposit || 0);
        const isSettled = Boolean(localSettle || isDbSettled || ledgerSettled);
        const isCheckoutState =
          String(l.status) === "checkout" ||
          String(l.status) === "closed" ||
          Boolean(l.actualVacateDate || l.plannedVacateDate);

        const status: DepositReconciliationItem["status"] = isSettled
          ? "Settled & Refunded"
          : isCheckoutState
            ? "Checkout Pending Refund"
            : "Held (Active)";

        const settledDeduction = isSettled
          ? Number(localSettle?.deduction ?? matchedDbDep?.deduction_amount ?? 0)
          : 0;
        const settledRefund = isSettled
          ? Number(
              localSettle?.refund ??
                matchedDbDep?.refund_amount ??
                Math.max(0, gross - settledDeduction),
            )
          : 0;

        return {
          key: rowKey,
          dbDepositId: matchedDbDep?.id,
          leaseId: l.id,
          property: l.property,
          unit: l.unit,
          tenantName: l.tenantName,
          leaseEndDate: l.endDate,
          leaseStatus: l.status,
          grossDeposit: gross,
          snaggingTicketsCount: unitTickets.length,
          snaggingDamageCost: snaggingCost,
          snaggingSummary,
          settledDeduction,
          settledRefund,
          status,
        };
      })
      .filter((item) => {
        if (propertyFilter !== "ALL" && norm(item.property) !== norm(propertyFilter)) return false;
        if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          if (
            !item.property.toLowerCase().includes(q) &&
            !item.unit.toLowerCase().includes(q) &&
            !item.tenantName.toLowerCase().includes(q)
          ) {
            return false;
          }
        }
        return true;
      });
  }, [
    leases,
    dbDeposits,
    tickets,
    settledLocalMap,
    allLedgerTransactions,
    propertyFilter,
    statusFilter,
    searchQuery,
  ]);

  const summary = useMemo(() => {
    return depositItems.reduce(
      (acc, i) => ({
        totalHeld: acc.totalHeld + (i.status !== "Settled & Refunded" ? i.grossDeposit : 0),
        pendingSnagging:
          acc.pendingSnagging + (i.status !== "Settled & Refunded" ? i.snaggingDamageCost : 0),
        totalRefunded: acc.totalRefunded + i.settledRefund,
        totalRecoveredToPnl: acc.totalRecoveredToPnl + i.settledDeduction,
      }),
      { totalHeld: 0, pendingSnagging: 0, totalRefunded: 0, totalRecoveredToPnl: 0 },
    );
  }, [depositItems]);

  const openSettlementModal = (item: DepositReconciliationItem) => {
    setActiveDeposit(item);
    setDeductionInput(String(Math.min(item.grossDeposit, item.snaggingDamageCost)));
    setSettlementNotes(
      item.snaggingSummary ||
        `Move-out Security Deposit settlement for ${item.unit} (${item.tenantName})`,
    );
    setSettlementDate(new Date().toISOString().split("T")[0]);
  };

  const handleConfirmMoveOutSettlement = async () => {
    if (!activeDeposit) return;
    const gross = activeDeposit.grossDeposit;
    const deduction = Math.max(0, parseFloat(deductionInput) || 0);
    if (deduction > gross) {
      toast.error(
        `Deduction (QR ${deduction}) cannot exceed gross security deposit (QR ${gross}).`,
      );
      return;
    }
    const netRefund = Math.round((gross - deduction) * 100) / 100;
    setSettling(true);

    try {
      // 1. If backed by fin_deposits row, update DB deposit status
      if (activeDeposit.dbDepositId) {
        try {
          await settleDeposit(activeDeposit.dbDepositId, deduction);
        } catch {}
      }

      // 2. Post Move-Out Damage / Maintenance Snagging Deduction Journal strictly to THIS Property & Unit (CR 41201004)
      if (deduction > 0) {
        const jeNo = `JE-DEP-DED-${activeDeposit.unit.replace(/\W/g, "").toUpperCase()}-${Date.now().toString().slice(-4)}`;
        addJournalEntry({
          je_no: jeNo,
          posting_date: settlementDate,
          reference: `DEP-SNAG-${activeDeposit.unit}`,
          narration: `Move-Out Snagging / Damage Recovery from Security Deposit — ${activeDeposit.tenantName} (${activeDeposit.unit})`,
          dr_account: "21500001 - Security Deposit Liability",
          dr_code: "21500001",
          cr_account: "41201004 - CAM & Maintenance Recovery",
          cr_code: "41201004",
          amount: deduction,
          property_name: activeDeposit.property,
          unit_ref: activeDeposit.unit,
          tenant_name: activeDeposit.tenantName,
          lines: [
            {
              id: "1",
              type: "DR",
              account: "21500001 - Security Deposit Liability",
              account_code: "21500001",
              amount: deduction,
              property_name: activeDeposit.property,
              description: `Deposit Deduction: ${settlementNotes}`,
            },
            {
              id: "2",
              type: "CR",
              account: "41201004 - CAM & Maintenance Recovery",
              account_code: "41201004",
              amount: deduction,
              property_name: activeDeposit.property,
              description: `Move-Out Maintenance Recovery — ${activeDeposit.unit}`,
            },
          ],
        });
      }

      // 3. Post Net Refund Payment Voucher strictly tagged to THIS Property, Unit, and Tenant
      if (netRefund > 0) {
        const pvNo = `PV-DEP-REF-${activeDeposit.unit.replace(/\W/g, "").toUpperCase()}-${Date.now().toString().slice(-4)}`;
        addVoucher({
          voucher_no: pvNo,
          voucher_type: "Payment Voucher",
          date: settlementDate,
          name: `Security Deposit Net Refund — ${activeDeposit.tenantName} (${activeDeposit.unit})`,
          debit: "Security Deposit Liability",
          debit_code: "21500001",
          credit: "Bank Operating Account",
          credit_code: "12000001",
          amount: netRefund,
          method: "Bank Transfer",
          property_name: activeDeposit.property,
          unit_ref: activeDeposit.unit,
          tenant_name: activeDeposit.tenantName,
        });
      }

      // 4. Persist settlement locally to prevent duplicate refunding
      const nextMap = {
        ...settledLocalMap,
        [activeDeposit.key]: { deduction, refund: netRefund, date: settlementDate },
      };
      setSettledLocalMap(nextMap);
      if (typeof window !== "undefined") {
        localStorage.setItem("pms_deposit_settlements_v1", JSON.stringify(nextMap));
      }

      toast.success(
        `Security Deposit settled for ${activeDeposit.property} / ${activeDeposit.unit}: Damage Recovery QR ${deduction.toLocaleString()} (GL 41201004) • Net Refund QR ${netRefund.toLocaleString()} (PV Posted)!`,
      );
      setActiveDeposit(null);
    } finally {
      setSettling(false);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "Property",
      "Unit",
      "Tenant",
      "Lease Expiry",
      "Gross Deposit (QAR)",
      "Linked Move-Out Snagging Cost (QAR)",
      "Settled Deduction to GL 41201004 (QAR)",
      "Net Refund Paid (QAR)",
      "Reconciliation Status",
    ];
    const rows = depositItems.map((i) => [
      `"${i.property.replace(/"/g, '""')}"`,
      `"${i.unit}"`,
      `"${i.tenantName.replace(/"/g, '""')}"`,
      i.leaseEndDate,
      i.grossDeposit.toFixed(2),
      i.snaggingDamageCost.toFixed(2),
      i.settledDeduction.toFixed(2),
      i.settledRefund.toFixed(2),
      `"${i.status}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Security_Deposit_Reconciliation_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Security Deposit & Snagging Reconciliation CSV exported!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border rounded-xl p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 border border-teal-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Security Deposit Ledger, Move-Out Snagging &amp; Refund Reconciliation
            </h2>
            <p className="text-xs text-muted-foreground">
              Links unit move-out maintenance snagging costs directly to Security Deposit Liability
              (GL 21500001), Damage Recovery (GL 41201004), and Net Refund Payment Vouchers
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 text-xs"
          >
            <Printer className="h-3.5 w-3.5" /> Print Ledger
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <span className="text-[11px] uppercase font-bold text-muted-foreground block">
            Active Escrow Deposits Held
          </span>
          <span className="text-lg font-bold font-mono text-blue-600 mt-1 block">
            QR {summary.totalHeld.toLocaleString()}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-amber-500">
          <span className="text-[11px] uppercase font-bold text-muted-foreground block">
            Linked Move-Out Snagging Claims
          </span>
          <span className="text-lg font-bold font-mono text-amber-600 mt-1 block">
            QR {summary.pendingSnagging.toLocaleString()}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-emerald-500">
          <span className="text-[11px] uppercase font-bold text-muted-foreground block">
            Damage Recovered to Property P&amp;L
          </span>
          <span className="text-lg font-bold font-mono text-emerald-600 mt-1 block">
            QR {summary.totalRecoveredToPnl.toLocaleString()}
          </span>
        </Card>
        <Card className="p-4 border-l-4 border-l-teal-500">
          <span className="text-[11px] uppercase font-bold text-muted-foreground block">
            Net Refunds Disbursed
          </span>
          <span className="text-lg font-bold font-mono text-teal-600 mt-1 block">
            QR {summary.totalRefunded.toLocaleString()}
          </span>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
              <Label className="text-[11px] text-muted-foreground">Deposit Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs mt-0.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Deposit States</SelectItem>
                  <SelectItem value="Held (Active)">Held (Active Lease)</SelectItem>
                  <SelectItem value="Checkout Pending Refund">Checkout Pending Refund</SelectItem>
                  <SelectItem value="Settled & Refunded">Settled &amp; Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[11px] text-muted-foreground">Search Unit / Tenant</Label>
              <div className="relative mt-0.5">
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <Input
                  placeholder="Unit #, tenant, property..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reconciliation Table */}
      <Card>
        <div className="rounded-xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-xs font-bold">Property</TableHead>
                <TableHead className="text-xs font-bold">Unit</TableHead>
                <TableHead className="text-xs font-bold">Tenant</TableHead>
                <TableHead className="text-xs font-bold">Lease Expiry</TableHead>
                <TableHead className="text-xs font-bold text-right">Escrow Deposit</TableHead>
                <TableHead className="text-xs font-bold text-right">Move-Out Snagging</TableHead>
                <TableHead className="text-xs font-bold text-right">Est. Net Refund</TableHead>
                <TableHead className="text-xs font-bold">Status</TableHead>
                <TableHead className="text-xs font-bold text-right">Settlement</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {depositItems.map((item) => {
                const estNet =
                  item.status === "Settled & Refunded"
                    ? item.settledRefund
                    : Math.max(0, item.grossDeposit - item.snaggingDamageCost);
                return (
                  <TableRow key={item.key} className="hover:bg-muted/30">
                    <TableCell className="text-xs font-medium">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-muted-foreground" /> {item.property}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-mono font-bold text-primary">
                      {item.unit}
                    </TableCell>
                    <TableCell className="text-xs font-medium">{item.tenantName}</TableCell>
                    <TableCell className="text-xs font-mono">{item.leaseEndDate}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold">
                      QR {item.grossDeposit.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      {item.status === "Settled & Refunded" ? (
                        <span className="text-rose-600 font-semibold">
                          -QR {item.settledDeduction.toLocaleString()}
                        </span>
                      ) : item.snaggingDamageCost > 0 ? (
                        <span
                          className="inline-flex items-center gap-1 text-amber-600 font-semibold"
                          title={item.snaggingSummary}
                        >
                          <Wrench className="h-3 w-3" /> -QR{" "}
                          {item.snaggingDamageCost.toLocaleString()} ({item.snaggingTicketsCount})
                        </span>
                      ) : (
                        <span className="text-muted-foreground">QR 0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs font-bold text-emerald-600">
                      QR {estNet.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "Settled & Refunded"
                            ? "default"
                            : item.status === "Checkout Pending Refund"
                              ? "destructive"
                              : "outline"
                        }
                        className="text-[10px]"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.status === "Settled & Refunded" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Reconciled
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] gap-1"
                          onClick={() => openSettlementModal(item)}
                        >
                          <Banknote className="h-3 w-3 text-teal-600" /> Settle &amp; Refund
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {depositItems.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="text-center py-10 text-muted-foreground text-xs"
                  >
                    No security deposits match the selected property and status filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Move-Out Snagging & Refund Settlement Modal */}
      <Dialog
        open={Boolean(activeDeposit)}
        onOpenChange={(open) => !open && setActiveDeposit(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              Move-Out Security Deposit Settlement &amp; Refund Voucher
            </DialogTitle>
            <DialogDescription className="text-xs">
              Property:{" "}
              <span className="font-semibold text-foreground">{activeDeposit?.property}</span> •
              Unit: <span className="font-semibold text-foreground">{activeDeposit?.unit}</span> •
              Tenant:{" "}
              <span className="font-semibold text-foreground">{activeDeposit?.tenantName}</span>
            </DialogDescription>
          </DialogHeader>

          {activeDeposit && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-3 rounded-lg border bg-muted/30 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Gross Escrow Deposit Held (GL 21500001):
                  </span>
                  <span className="font-mono font-bold">
                    QR {activeDeposit.grossDeposit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Linked Maintenance / Snagging Tickets ({activeDeposit.snaggingTicketsCount}):
                  </span>
                  <span className="font-mono text-amber-600 font-semibold">
                    QR {activeDeposit.snaggingDamageCost.toLocaleString()}
                  </span>
                </div>
                {activeDeposit.snaggingSummary && (
                  <p className="text-[11px] text-amber-700 bg-amber-500/10 rounded px-2 py-1 mt-1">
                    Snagging Details: {activeDeposit.snaggingSummary}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Approved Snagging Deduction (QAR)</Label>
                  <Input
                    type="number"
                    min="0"
                    max={activeDeposit.grossDeposit}
                    className="mt-1 h-8 text-xs font-mono"
                    value={deductionInput}
                    onChange={(e) => setDeductionInput(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Settlement Posting Date</Label>
                  <Input
                    type="date"
                    className="mt-1 h-8 text-xs"
                    value={settlementDate}
                    onChange={(e) => setSettlementDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold">Inspection / Settlement Narration</Label>
                <Input
                  className="mt-1 h-8 text-xs"
                  value={settlementNotes}
                  onChange={(e) => setSettlementNotes(e.target.value)}
                />
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Damage Recovery Income (CR 41201004 → Property P&amp;L):
                  </span>
                  <span className="font-mono font-semibold text-rose-600">
                    QR {(parseFloat(deductionInput) || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-emerald-500/20">
                  <span className="font-bold text-emerald-800 dark:text-emerald-300">
                    Net Refund Payment Voucher (CR 12000001 Bank):
                  </span>
                  <span className="text-sm font-bold font-mono text-emerald-700 dark:text-emerald-300">
                    QR{" "}
                    {Math.max(
                      0,
                      activeDeposit.grossDeposit - (parseFloat(deductionInput) || 0),
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveDeposit(null)}
              disabled={settling}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmMoveOutSettlement} disabled={settling}>
              {settling ? "Posting GL & Refund..." : "Confirm Settlement & Post Refund Voucher"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
