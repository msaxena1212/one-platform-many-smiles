import { createFileRoute } from "@tanstack/react-router";
import { useState, type ElementType } from "react";
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

const TODAY = new Date("2026-07-31T00:00:00");

const statusConfig: Record<string, { label: string; className: string; icon: ElementType }> = {
  "In Hand": { label: "In Hand", className: "bg-blue-500/15 text-blue-700 border-blue-300", icon: Clock },
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
  const value = (status || "").trim().toLowerCase();
  if (value === "received" || value === "in hand" || value === "held") return "In Hand";
  if (value === "deposited") return "deposited";
  if (value === "cleared") return "cleared";
  if (value === "bounced") return "bounced";
  if (value === "returned") return "returned";
  return "In Hand";
}

function formatDate(value?: string, options?: Intl.DateTimeFormatOptions) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-GB", options ?? { day: "2-digit", month: "short", year: "numeric" });
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
  const { pdcs, leases, setPdcs, syncing } = useAppData();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const rows = pdcs.map((pdc) => {
    const lease = leases.find((item) => item.id === pdc.leaseId);
    return {
      ...pdc,
      tenantName: lease?.tenantName || "-",
      unitName: lease?.unit || "-",
      propertyName: lease?.property || "-",
      leaseStart: lease?.startDate,
      leaseEnd: lease?.endDate,
      effectiveStatus: normalizeStatus(pdc.status),
    };
  });

  function handleMark(id: string, status: PmsPdc["status"]) {
    setPdcs((previous) => previous.map((pdc) => (pdc.id === id ? { ...pdc, status } : pdc)));
  }

  const statuses = ["all", ...Array.from(new Set(rows.map((row) => row.effectiveStatus)))];
  const filtered = rows.filter((row) => {
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      row.chequeNo.toLowerCase().includes(query) ||
      row.tenantName.toLowerCase().includes(query) ||
      row.unitName.toLowerCase().includes(query) ||
      row.propertyName.toLowerCase().includes(query) ||
      row.bank.toLowerCase().includes(query);
    const matchesStatus = filterStatus === "all" || row.effectiveStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = filtered.reduce((sum, row) => sum + row.amount, 0);
  const inHandCount = filtered.filter((row) => row.effectiveStatus === "In Hand").length;
  const depositedCount = filtered.filter((row) => row.effectiveStatus === "deposited" || row.effectiveStatus === "cleared").length;
  const dueCount = filtered.filter((row) => row.effectiveStatus === "In Hand" && new Date(row.date) <= TODAY).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PDC Register</h1>
          <p className="text-sm text-muted-foreground mt-1">Shared cheque register backed by the app data store.</p>
        </div>
        <Badge variant="outline" className="gap-1 text-green-700 border-green-300 bg-green-50">
          <Wifi className="h-3 w-3" />
          Live Sync
        </Badge>
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
          <Input placeholder="Search by cheque, tenant, unit, property or bank..." className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((status) => (
            <Button key={status} size="sm" variant={filterStatus === status ? "default" : "outline"} onClick={() => setFilterStatus(status)} className="capitalize">
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
          {syncing ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              Loading shared PDC records...
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
                    <th className="px-4 py-3 font-medium">Maturity Date</th>
                    <th className="px-4 py-3 font-medium">Lease Period</th>
                    <th className="px-4 py-3 font-medium">Finance Doc</th>
                    <th className="px-4 py-3 font-medium text-right">Amount (QAR)</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                    <th className="px-4 py-3 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {filtered.map((row, index) => (
                    <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground">{index + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{row.chequeNo}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium leading-tight">{row.tenantName}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.unitName} - {row.propertyName}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{row.bank}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-medium">{formatDate(row.date)}</p>
                        <p className={`text-xs ${new Date(row.date) <= TODAY ? "text-amber-700" : "text-muted-foreground"}`}>
                          {new Date(row.date) <= TODAY ? "Due as of July 31, 2026" : "Future-dated cheque"}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {row.leaseStart && row.leaseEnd ? `${formatDate(row.leaseStart, { day: "2-digit", month: "short" })} - ${formatDate(row.leaseEnd, { day: "2-digit", month: "short", year: "numeric" })}` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">
                          {row.effectiveStatus === "deposited" || row.effectiveStatus === "cleared"
                            ? "Deposit Voucher"
                            : row.effectiveStatus === "bounced" || row.effectiveStatus === "returned"
                              ? "Cheque Returned Voucher"
                              : "Receipts Voucher"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatQAR(row.amount)}</td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={row.effectiveStatus} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {row.effectiveStatus === "In Hand" && (
                          <div className="flex gap-1 justify-center">
                            <Button size="sm" className="h-7 px-2 text-xs" onClick={() => handleMark(row.id, "deposited")}>
                              Deposit
                            </Button>
                            <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => handleMark(row.id, "bounced")}>
                              Bounce
                            </Button>
                          </div>
                        )}
                        {row.effectiveStatus === "deposited" && (
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleMark(row.id, "cleared")}>
                            Clear
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && !syncing && (
                    <tr>
                      <td colSpan={10} className="px-4 py-10 text-center text-muted-foreground">
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

      <p className="text-xs text-muted-foreground text-right">{filtered.length} of {rows.length} cheques shown from shared app data.</p>
    </div>
  );
}
