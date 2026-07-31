import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ElementType } from "react";
import { fetchPDCs, type PDC, updatePDC } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CreditCard, Building2, AlertCircle, CheckCircle2, Clock, Wifi } from "lucide-react";
import { useAppData, type PmsPdc } from "@/lib/app-data-context";

export const Route = createFileRoute("/cashier/pdc")({
  head: () => ({ meta: [{ title: "PDC Management - ZYNO Property Management" }] }),
  component: CashierPDCs,
});

const TODAY = new Date("2026-07-24T00:00:00");

const statusConfig: Record<string, { label: string; className: string; icon: ElementType }> = {
  "In Hand": { label: "In Hand", className: "bg-blue-500/15 text-blue-700 border-blue-300", icon: Clock },
  ISSUED: { label: "Issued", className: "bg-violet-500/15 text-violet-700 border-violet-300", icon: Clock },
  held: { label: "Held", className: "bg-amber-500/15 text-amber-700 border-amber-300", icon: Clock },
  deposited: { label: "Deposited", className: "bg-green-500/15 text-green-700 border-green-300", icon: CheckCircle2 },
  cleared: { label: "Cleared", className: "bg-emerald-500/15 text-emerald-700 border-emerald-300", icon: CheckCircle2 },
  bounced: { label: "Bounced", className: "bg-red-500/15 text-red-700 border-red-300", icon: AlertCircle },
  returned: { label: "Returned", className: "bg-rose-500/15 text-rose-700 border-rose-300", icon: AlertCircle },
};

function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
    icon: Clock,
  };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

function normalizeStatus(status?: string) {
  const value = (status || "").trim();
  const lowered = value.toLowerCase();

  if (value === "In Hand" || lowered === "in hand") return "In Hand";
  if (value === "ISSUED" || lowered === "issued") return "ISSUED";
  if (lowered === "held") return "held";
  if (lowered === "deposited") return "deposited";
  if (lowered === "cleared") return "cleared";
  if (lowered === "bounced") return "bounced";
  if (lowered === "returned") return "returned";
  return value || "held";
}

function formatDate(value?: string, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", options ?? { day: "2-digit", month: "short", year: "numeric" });
}

function formatRentPeriod(from?: string, to?: string) {
  if (!from || !to) return "-";
  return `${formatDate(from, { day: "2-digit", month: "short" })} - ${formatDate(to, { day: "2-digit", month: "short", year: "numeric" })}`;
}

function formatQAR(amount?: number) {
  return new Intl.NumberFormat("en-QA", {
    style: "currency",
    currency: "QAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function CashierPDCs() {
  const { pdcs: ctxPdcs, leases, setPdcs: setCtxPdcs, syncing } = useAppData();
  const [dbPdcs, setDbPdcs] = useState<PDC[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchPDCs().then(d => setDbPdcs(d || [])).catch(() => {});
  }, []);

  // Merge context PDCs (primary, real-time) with any extra DB PDCs
  const ctxAsDbPdcs: PDC[] = ctxPdcs.map(p => ({
    id: p.id,
    lease_id: p.leaseId,
    cheque_number: p.chequeNo,
    bank_name: p.bank,
    bank: p.bank,
    amount: p.amount,
    deposit_date: p.date,
    status: (p.status === 'received' ? 'held' : p.status) as PDC['status'],
    tenant_name: leases.find(l => l.id === p.leaseId)?.tenantName,
    unit_name: leases.find(l => l.id === p.leaseId)?.unit,
    maturity_date: p.date,
    created_at: p.date,
  }));
  const dbOnlyPdcs = dbPdcs.filter(d => !ctxPdcs.some(c => c.id === d.id));
  const pdcs = [...ctxAsDbPdcs, ...dbOnlyPdcs];

  async function handleMark(id: string, status: PDC["status"]) {
    // Update in context
    setCtxPdcs(prev => prev.map(p => p.id === id ? { ...p, status: status as PmsPdc['status'] } : p));
    // Also persist to Supabase DB if it's a DB record
    if (dbPdcs.some(d => d.id === id)) {
      updatePDC(id, status).catch(console.warn);
    }
  }

  const bank = (pdc: PDC) => pdc.bank || pdc.bank_name || "-";
  const tenant = (pdc: PDC) => pdc.tenant_name || (pdc as PDC & { leases?: { tenant_name?: string } }).leases?.tenant_name || "-";
  const unitRef = (pdc: PDC) => pdc.unit_name || (pdc as PDC & { leases?: { unit_ref?: string } }).leases?.unit_ref || "-";
  const effectiveStatus = (pdc: PDC) => normalizeStatus(pdc.status_pdc || pdc.status);
  const financeDocument = (pdc: PDC) => {
    const status = effectiveStatus(pdc);
    if (status === "deposited" || status === "cleared") return "Deposit Voucher";
    if (status === "bounced" || status === "returned") return "Cheque Returned Voucher";
    return "Receipts Voucher";
  };
  const accountingFlow = (pdc: PDC) => {
    const status = effectiveStatus(pdc);
    if (status === "deposited") return "PDC moved from in-hand to bank deposit";
    if (status === "cleared") return "Banked and receivable settled";
    if (status === "bounced") return "Cheque returned, receivable reopened";
    if (status === "returned") return "Cheque returned to tenant/file";
    return "Receipt captured as PDC in hand";
  };
  const maturityDate = (pdc: PDC) => pdc.maturity_date || pdc.deposit_date;
  const isDue = (pdc: PDC) => {
    const dueDate = maturityDate(pdc);
    if (!dueDate) return false;
    return new Date(dueDate) <= TODAY;
  };

  const statuses = ["all", ...Array.from(new Set(pdcs.map((pdc) => effectiveStatus(pdc))))];

  const filtered = pdcs.filter((pdc) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (pdc.cheque_number || "").toLowerCase().includes(q) ||
      tenant(pdc).toLowerCase().includes(q) ||
      unitRef(pdc).toLowerCase().includes(q) ||
      (pdc.property_code || "").toLowerCase().includes(q) ||
      bank(pdc).toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || effectiveStatus(pdc) === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalAmount = filtered.reduce((sum, pdc) => sum + (pdc.amount || 0), 0);
  const inHandCount = filtered.filter((pdc) => ["In Hand", "ISSUED", "held"].includes(effectiveStatus(pdc))).length;
  const depositedCount = filtered.filter((pdc) => ["deposited", "cleared"].includes(effectiveStatus(pdc))).length;
  const dueCount = filtered.filter((pdc) => ["In Hand", "ISSUED", "held"].includes(effectiveStatus(pdc)) && isDue(pdc)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PDC Register</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real cheque register from the `pdcs` table, aligned to receipt, deposit, and cheque-return flow.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: CreditCard, label: "Total Cheques", value: filtered.length.toString() },
          { icon: Clock, label: "In Hand", value: inHandCount.toString() },
          { icon: Building2, label: "Total Value (QAR)", value: formatQAR(totalAmount) },
          { icon: CheckCircle2, label: "Due / Deposited", value: `${dueCount} / ${depositedCount}` },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="rounded-lg p-2 bg-primary/10">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-lg font-bold leading-tight">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by cheque, tenant, unit, property or bank..."
            className="pl-9"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={filterStatus === status ? "default" : "outline"}
              onClick={() => setFilterStatus(status)}
              className="capitalize"
            >
              {status === "all" ? "All" : statusConfig[status]?.label ?? status}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-0">
          <CardTitle className="text-base">Cheque Register</CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-3">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              Loading PDC records from Supabase...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">#</th>
                    <th className="px-4 py-3 font-medium">Cheque No.</th>
                    <th className="px-4 py-3 font-medium">Tenant / Lease</th>
                    <th className="px-4 py-3 font-medium">Bank</th>
                    <th className="px-4 py-3 font-medium">Collection Stage</th>
                    <th className="px-4 py-3 font-medium">Maturity Date</th>
                    <th className="px-4 py-3 font-medium">Rent Period</th>
                    <th className="px-4 py-3 font-medium">Finance Doc</th>
                    <th className="px-4 py-3 font-medium text-right">Amount (QAR)</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                    <th className="px-4 py-3 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {filtered.map((pdc, index) => {
                    const status = effectiveStatus(pdc);
                    const readyForDeposit = ["In Hand", "ISSUED", "held"].includes(status) && isDue(pdc);

                    return (
                      <tr key={pdc.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3 text-xs text-muted-foreground">{pdc.sl_no ?? index + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs font-semibold">{pdc.cheque_number}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium leading-tight">{tenant(pdc)}</p>
                          <p className="text-xs text-muted-foreground">
                            {unitRef(pdc)} - {pdc.property_code || "-"}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{bank(pdc)}</td>
                        <td className="px-4 py-3">
                          <p className="text-sm">{accountingFlow(pdc)}</p>
                          <p className="text-xs text-muted-foreground">
                            {status === "deposited"
                              ? "Deposit voucher posted to bank account"
                              : status === "cleared"
                                ? "Revenue cycle can stay fully settled"
                                : status === "bounced" || status === "returned"
                                  ? "Follow cheque return handling and receivable recovery"
                                  : "Receipt voucher stage before bank deposit"}
                          </p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-medium">{formatDate(maturityDate(pdc))}</p>
                          <p className={`text-xs ${readyForDeposit ? "text-amber-700" : "text-muted-foreground"}`}>
                            {readyForDeposit ? "Due as of 24 Jul 2026" : "Future-dated cheque"}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {formatRentPeriod(pdc.rent_from_date, pdc.rent_to_date)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{financeDocument(pdc)}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatQAR(pdc.amount)}</td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={status} />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {["held", "In Hand", "ISSUED"].includes(status) && (
                            <div className="flex gap-1 justify-center">
                              <Button size="sm" className="h-7 px-2 text-xs" onClick={() => handleMark(pdc.id, "deposited")}>
                                Deposit
                              </Button>
                              <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => handleMark(pdc.id, "bounced")}>
                                Bounce
                              </Button>
                            </div>
                          )}
                          {status === "deposited" && (
                            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleMark(pdc.id, "cleared")}>
                              Clear
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && !loading && (
                    <tr>
                      <td colSpan={11} className="px-4 py-10 text-center text-muted-foreground">
                        No PDC records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-right">
        {filtered.length} of {pdcs.length} cheques shown - Source: `pdcs` table (Supabase)
      </p>
    </div>
  );
}
