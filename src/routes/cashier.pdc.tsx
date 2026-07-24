import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { fetchPDCs, PDC, updatePDC } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CreditCard, Building2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { formatQAR } from "@/lib/mock-data";

export const Route = createFileRoute("/cashier/pdc")({
  head: () => ({ meta: [{ title: "PDC Management — ZYNO Property Management" }] }),
  component: CashierPDCs,
});

const statusConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  "In Hand":  { label: "In Hand",   className: "bg-blue-500/15 text-blue-700 border-blue-300",    icon: Clock },
  "ISSUED":   { label: "Issued",    className: "bg-violet-500/15 text-violet-700 border-violet-300", icon: Clock },
  "held":     { label: "Held",      className: "bg-amber-500/15 text-amber-700 border-amber-300",  icon: Clock },
  "deposited":{ label: "Deposited", className: "bg-green-500/15 text-green-700 border-green-300",  icon: CheckCircle2 },
  "cleared":  { label: "Cleared",   className: "bg-emerald-500/15 text-emerald-700 border-emerald-300", icon: CheckCircle2 },
  "bounced":  { label: "Bounced",   className: "bg-red-500/15 text-red-700 border-red-300",        icon: AlertCircle },
  "returned": { label: "Returned",  className: "bg-rose-500/15 text-rose-700 border-rose-300",     icon: AlertCircle },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, className: "bg-muted text-muted-foreground border-border", icon: Clock };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.className}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function CashierPDCs() {
  const [pdcs, setPdcs] = useState<PDC[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => { loadPDCs(); }, []);

  async function loadPDCs() {
    setLoading(true);
    fetchPDCs().then(res => setPdcs(res)).finally(() => setLoading(false));
  }

  async function handleMark(id: string, status: PDC['status']) {
    await updatePDC(id, status);
    loadPDCs();
  }

  // Derive the effective bank name: try bank field first, then bank_name
  const bank = (p: PDC) => p.bank || p.bank_name || "—";
  // Derive effective tenant: try tenant_name, then leases join
  const tenant = (p: PDC) => p.tenant_name || (p as any).leases?.tenant_name || "—";
  // Effective status for display
  const effStatus = (p: PDC) => p.status_pdc || p.status;

  const statuses = ["all", ...Array.from(new Set(pdcs.map(p => effStatus(p))))];

  const filtered = pdcs.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (p.cheque_number || "").toLowerCase().includes(q) ||
      tenant(p).toLowerCase().includes(q) ||
      (p.unit_name || "").toLowerCase().includes(q) ||
      (p.property_code || "").toLowerCase().includes(q) ||
      bank(p).toLowerCase().includes(q);
    const matchStatus = filterStatus === "all" || effStatus(p) === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalAmount = filtered.reduce((a, p) => a + (p.amount || 0), 0);
  const inHandCount = filtered.filter(p => ["In Hand", "ISSUED", "held"].includes(effStatus(p))).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PDC Register</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Post-dated cheques from Real Estate - Simerjith.xlsx
          </p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: CreditCard,  label: "Total Cheques",    value: filtered.length.toString() },
          { icon: Clock,       label: "In Hand",          value: inHandCount.toString() },
          { icon: Building2,   label: "Total Value (QAR)",value: formatQAR(totalAmount) },
          { icon: CheckCircle2,label: "Deposited/Cleared",value: filtered.filter(p => ["deposited","cleared"].includes(effStatus(p))).length.toString() },
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

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by cheque no, tenant, unit or bank..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map(s => (
            <Button
              key={s}
              size="sm"
              variant={filterStatus === s ? "default" : "outline"}
              onClick={() => setFilterStatus(s)}
              className="capitalize"
            >
              {s === "all" ? "All" : (statusConfig[s]?.label ?? s)}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
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
                    <th className="px-4 py-3 font-medium">Tenant</th>
                    <th className="px-4 py-3 font-medium">Unit</th>
                    <th className="px-4 py-3 font-medium">Property</th>
                    <th className="px-4 py-3 font-medium">Bank</th>
                    <th className="px-4 py-3 font-medium">Maturity Date</th>
                    <th className="px-4 py-3 font-medium">Rent Period</th>
                    <th className="px-4 py-3 font-medium text-right">Amount (QAR)</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                    <th className="px-4 py-3 font-medium text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {filtered.map((pdc, i) => (
                    <tr key={pdc.id} className="hover:bg-muted/40 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {pdc.sl_no ?? i + 1}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold">
                        {pdc.cheque_number}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium leading-tight">{tenant(pdc)}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {pdc.unit_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <Badge variant="outline">{pdc.property_code || "—"}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{bank(pdc)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {pdc.maturity_date
                          ? new Date(pdc.maturity_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                          : pdc.deposit_date
                            ? new Date(pdc.deposit_date).toLocaleDateString("en-GB")
                            : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {pdc.rent_from_date && pdc.rent_to_date
                          ? `${new Date(pdc.rent_from_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })} – ${new Date(pdc.rent_to_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">
                        {formatQAR(pdc.amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={effStatus(pdc)} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        {(effStatus(pdc) === "held" || effStatus(pdc) === "In Hand" || effStatus(pdc) === "ISSUED") && (
                          <div className="flex gap-1 justify-center">
                            <Button size="sm" className="h-7 px-2 text-xs" onClick={() => handleMark(pdc.id, "deposited")}>
                              Deposit
                            </Button>
                            <Button size="sm" variant="destructive" className="h-7 px-2 text-xs" onClick={() => handleMark(pdc.id, "bounced")}>
                              Bounce
                            </Button>
                          </div>
                        )}
                        {(effStatus(pdc) === "deposited") && (
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => handleMark(pdc.id, "cleared")}>
                            Clear
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
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
        {filtered.length} of {pdcs.length} cheques shown · Source: pdcs table (Supabase)
      </p>
    </div>
  );
}
