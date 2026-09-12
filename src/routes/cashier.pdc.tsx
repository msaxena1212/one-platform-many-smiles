import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState, useEffect, type ElementType } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CreditCard, Building2, AlertCircle, CheckCircle2, Clock, Wifi, Loader2, Banknote } from "lucide-react";
import { useAppData } from "@/lib/app-data-context";
import { supabase } from "@/lib/supabase";
import { depositPdc, clearPdc, returnPdc, cashDepositInPlaceOfPdc, receivePdc } from "@/lib/finance/pdcService";
import { collectSecurityDeposit } from "@/lib/finance/depositService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PdcManagement } from "@/components/finance/pdc-management";

export const Route = createFileRoute("/cashier/pdc")({
  head: () => ({ meta: [{ title: "PDC Management - ZYNO Property Management" }] }),
  component: CashierPDCs,
});

const TODAY = new Date("2026-07-31T00:00:00");

const statusConfig: Record<string, { label: string; className: string; icon: ElementType }> = {
  "In Hand":  { label: "In Hand",  className: "bg-blue-500/15 text-blue-700 border-blue-300",     icon: Clock       },
  held:       { label: "Held",     className: "bg-amber-500/15 text-amber-700 border-amber-300",   icon: Clock       },
  deposited:  { label: "Deposited",className: "bg-green-500/15 text-green-700 border-green-300",   icon: CheckCircle2 },
  cleared:    { label: "Cleared",  className: "bg-emerald-500/15 text-emerald-700 border-emerald-300", icon: CheckCircle2 },
  bounced:    { label: "Bounced",  className: "bg-red-500/15 text-red-700 border-red-300",         icon: AlertCircle },
  returned:   { label: "Returned", className: "bg-rose-500/15 text-rose-700 border-rose-300",      icon: AlertCircle },
  replaced:   { label: "Cash Paid",className: "bg-violet-500/15 text-violet-700 border-violet-300",icon: Banknote    },
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
  if (value === "received" || value === "in hand" || value === "held" || value === "issued") return "In Hand";
  if (value === "deposited") return "deposited";
  if (value === "cleared")   return "cleared";
  if (value === "bounced")   return "bounced";
  if (value === "returned")  return "returned";
  if (value === "replaced")  return "replaced";
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

function LegacyCashierPDCs() {
  const { leases, setVouchers } = useAppData();
  const routeSearch = useSearch({ strict: false }) as { collect?: string };
  const [dbPdcs, setDbPdcs]         = useState<any[]>([]);
  const [loading, setLoading]        = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch]          = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [collectionType, setCollectionType] = useState<"PDC" | "Security Deposit" | "Other Amount">("PDC");
  const [selectedLeaseId, setSelectedLeaseId] = useState("");
  const [collectionAmount, setCollectionAmount] = useState("");
  const [chequeNumber, setChequeNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [savingCollection, setSavingCollection] = useState(false);

  useEffect(() => {
    loadDbPdcs();
  }, []);

  useEffect(() => {
    if (routeSearch.collect === "1") setCollectionOpen(true);
  }, [routeSearch.collect]);

  async function loadDbPdcs() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("fin_pdc_register")
        .select("*")
        .order("cheque_date", { ascending: true });
      if (!error && data && data.length > 0) {
        setDbPdcs(data);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }

  async function saveCollection() {
    const lease = leases.find((item) => item.id === selectedLeaseId);
    const amount = Number(collectionAmount);
    if (!lease || !amount || amount <= 0) {
      alert("Select a tenant/property/unit and enter a valid amount.");
      return;
    }
    if (collectionType === "PDC" && !chequeNumber.trim()) {
      alert("Enter the cheque number for a PDC collection.");
      return;
    }

    setSavingCollection(true);
    try {
      if (collectionType === "PDC") {
        await receivePdc({
          cheque_number: chequeNumber.trim(),
          cheque_date: new Date().toISOString().slice(0, 10),
          amount,
          tenant_id: lease.customerId,
          property_id: (lease as any).propertyId || lease.property,
          unit_id: (lease as any).unitId || lease.unit,
          lease_id: lease.id,
          unitCode: lease.unit,
          pdcType: "RENT_PDC",
        });
      } else {
        await collectSecurityDeposit({
          amount,
          tenant_id: lease.customerId,
          property_id: (lease as any).propertyId || lease.property,
          unit_id: (lease as any).unitId || lease.unit,
          lease_id: lease.id,
          mode: "Cash",
          depositType: collectionType === "Security Deposit" ? "SECURITY" : "SERVICE_FEE",
          ref: collectionDescription.trim() || `${collectionType} collected by Cashier`,
          unit_name: lease.unit,
        });
        setVouchers((items) => [{
          id: `cashier-${Date.now()}`,
          leaseId: lease.id,
          name: `${collectionType} - ${lease.tenantName}`,
          receiptNo: `CSH-${Date.now().toString().slice(-8)}`,
          method: "Cashier Collection",
          period: new Date().toISOString().slice(0, 10),
          debit: "Cash / Bank Collection",
          credit: collectionType === "Security Deposit" ? "Security Deposit Liability" : "Tenant Receivable",
          amount,
          status: "posted",
        }, ...items]);
        window.dispatchEvent(new CustomEvent("finance_vouchers_updated"));
      }
      setCollectionOpen(false);
      setCollectionAmount("");
      setChequeNumber("");
      setBankName("");
      setCollectionDescription("");
      await loadDbPdcs();
      alert(`${collectionType} collected for ${lease.tenantName} · ${lease.property} · ${lease.unit}.`);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Collection failed.");
    } finally {
      setSavingCollection(false);
    }
  }

  const rows = dbPdcs.map((pdc) => ({
    id:             pdc.id,
    chequeNo:       pdc.cheque_number || "-",
    bank:           pdc.bank || "-",
    date:           pdc.maturity_date || pdc.deposit_date || "-",
    amount:         Number(pdc.amount) || 0,
    status:         pdc.status || pdc.status_pdc || "In Hand",
    tenantName:     pdc.tenant_name || "-",
    unitName:       pdc.unit_name || "-",
    propertyName:   pdc.property_code || "-",
    effectiveStatus: normalizeStatus(pdc.status || pdc.status_pdc),
    leaseStart:     pdc.lease_start || "",
    leaseEnd:       pdc.lease_end   || "",
  }));

  // ── Action handler — calls pdcService (which does DB update + GL posting) ──
  async function handleAction(id: string, action: "deposited" | "cleared" | "bounced" | "replaced") {
    setActionLoading(id + action);

    const row = rows.find((r) => r.id === id);
    const chequeNo = row?.chequeNo !== "-" ? row?.chequeNo : undefined;

    try {
      if (action === "deposited") {
        await depositPdc(id, chequeNo);
      } else if (action === "cleared") {
        await clearPdc(id, chequeNo);
      } else if (action === "bounced") {
        await returnPdc(id, chequeNo);
      } else if (action === "replaced") {
        await cashDepositInPlaceOfPdc(id, chequeNo);
      }

      // Optimistic UI update
      setDbPdcs((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: action, status_pdc: action }
            : p,
        ),
      );
    } catch (err) {
      console.error("[handleAction] failed:", err);
      alert(`Action failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setActionLoading(null);
    }
  }

  const statuses = ["all", ...Array.from(new Set(rows.map((r) => r.effectiveStatus)))];
  const filtered = rows.filter((row) => {
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      (row.chequeNo   || "").toLowerCase().includes(query) ||
      (row.tenantName || "").toLowerCase().includes(query) ||
      (row.unitName   || "").toLowerCase().includes(query) ||
      (row.propertyName || "").toLowerCase().includes(query) ||
      (row.bank       || "").toLowerCase().includes(query);
    const matchesStatus = filterStatus === "all" || row.effectiveStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalAmount   = filtered.reduce((sum, r) => sum + r.amount, 0);
  const inHandCount   = filtered.filter((r) => r.effectiveStatus === "In Hand").length;
  const depositedCount = filtered.filter((r) => r.effectiveStatus === "deposited" || r.effectiveStatus === "cleared").length;
  const dueCount      = filtered.filter((r) => r.effectiveStatus === "In Hand" && r.date && new Date(r.date) <= TODAY).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PDC Register</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage post-dated cheques — actions update both the PDC register and the General Ledger.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setCollectionOpen(true)} className="gap-2">Collect Tenant Amount</Button>
          <Badge variant="outline" className="gap-1 text-green-700 border-green-300 bg-green-50">
            <Wifi className="h-3 w-3" />
            Live Sync + GL
          </Badge>
        </div>
      </div>

      <Dialog open={collectionOpen} onOpenChange={setCollectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Collect Tenant Amount</DialogTitle>
            <DialogDescription>Select the tenant, property, and unit before posting the collection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Collection Type</Label><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={collectionType} onChange={(event) => setCollectionType(event.target.value as typeof collectionType)}><option>PDC</option><option>Security Deposit</option><option>Other Amount</option></select></div>
            <div className="space-y-1.5"><Label>Tenant / Property / Unit</Label><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={selectedLeaseId} onChange={(event) => setSelectedLeaseId(event.target.value)}><option value="">Select collection target</option>{leases.map((lease) => <option key={lease.id} value={lease.id}>{lease.tenantName} · {lease.property} · {lease.unit}</option>)}</select></div>
            <div className="grid grid-cols-2 gap-3"><div className="space-y-1.5"><Label>Amount (QAR)</Label><Input type="number" min="0" value={collectionAmount} onChange={(event) => setCollectionAmount(event.target.value)} /></div>{collectionType === "PDC" && <div className="space-y-1.5"><Label>Cheque Number</Label><Input value={chequeNumber} onChange={(event) => setChequeNumber(event.target.value)} /></div>}</div>
            {collectionType === "PDC" && <div className="space-y-1.5"><Label>Bank</Label><Input value={bankName} onChange={(event) => setBankName(event.target.value)} placeholder="Bank name" /></div>}
            {collectionType === "Other Amount" && <div className="space-y-1.5"><Label>Description</Label><Input value={collectionDescription} onChange={(event) => setCollectionDescription(event.target.value)} placeholder="Reason for collection" /></div>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCollectionOpen(false)}>Cancel</Button><Button onClick={saveCollection} disabled={savingCollection}>{savingCollection ? "Posting..." : "Post Collection"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: CreditCard,   label: "Total Cheques",    value: filtered.length.toString() },
          { icon: Clock,        label: "In Hand",          value: inHandCount.toString() },
          { icon: Building2,    label: "Total Value (QAR)",value: formatQAR(totalAmount) },
          { icon: CheckCircle2, label: "Due / Deposited",  value: `${dueCount} / ${depositedCount}` },
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
            placeholder="Search by cheque, tenant, unit, property or bank..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              {status === "all" ? "All" : (statusConfig[status]?.label ?? status)}
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
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading PDC records…
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
                    <th className="px-4 py-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {filtered.map((row, index) => {
                    const isActioning = actionLoading?.startsWith(row.id);
                    return (
                      <tr key={row.id} className="hover:bg-muted/40 transition-colors">
                        <td className="px-4 py-3 text-xs text-muted-foreground">{index + 1}</td>
                        <td className="px-4 py-3 font-mono text-xs font-semibold">{row.chequeNo}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium leading-tight">{row.tenantName}</p>
                          <p className="text-xs text-muted-foreground">
                            {row.unitName} — {row.propertyName}
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
                          {row.leaseStart && row.leaseEnd
                            ? `${formatDate(row.leaseStart, { day: "2-digit", month: "short" })} – ${formatDate(row.leaseEnd, { day: "2-digit", month: "short", year: "numeric" })}`
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">
                            {row.effectiveStatus === "deposited" || row.effectiveStatus === "cleared"
                              ? "Deposit Voucher"
                              : row.effectiveStatus === "bounced" || row.effectiveStatus === "returned"
                              ? "Cheque Return Voucher"
                              : row.effectiveStatus === "replaced"
                              ? "Cash Deposit Voucher"
                              : "Receipt Voucher"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatQAR(row.amount)}</td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={row.effectiveStatus} />
                        </td>

                        {/* ── Action Buttons ── */}
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-1 justify-center flex-wrap">
                            {row.effectiveStatus === "In Hand" && (
                              <>
                                {/* Event 2 — Deposit to Bank */}
                                <Button
                                  size="sm"
                                  className="h-7 px-2 text-xs"
                                  disabled={!!isActioning}
                                  onClick={() => handleAction(row.id, "deposited")}
                                  title="Deposit cheque to bank — GL: Dr Bank, Cr PDC In Hand"
                                >
                                  {isActioning && actionLoading === row.id + "deposited"
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : "Deposit"}
                                </Button>

                                {/* Event 4 — Cash in place of PDC */}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2 text-xs border-violet-400 text-violet-700 hover:bg-violet-50"
                                  disabled={!!isActioning}
                                  onClick={() => handleAction(row.id, "replaced")}
                                  title="Cash collected instead of PDC — GL: Dr Bank, Cr Cash In Hand"
                                >
                                  {isActioning && actionLoading === row.id + "replaced"
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : <><Banknote className="w-3 h-3 mr-1 inline" />Cash</>}
                                </Button>

                                {/* Event 6 — Bounce / Return */}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 px-2 text-xs"
                                  disabled={!!isActioning}
                                  onClick={() => handleAction(row.id, "bounced")}
                                  title="Bounce / Return cheque — GL full reversal"
                                >
                                  {isActioning && actionLoading === row.id + "bounced"
                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                    : "Bounce"}
                                </Button>
                              </>
                            )}

                            {/* Event 3 — Clear (after Deposit) */}
                            {row.effectiveStatus === "deposited" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-xs"
                                disabled={!!isActioning}
                                onClick={() => handleAction(row.id, "cleared")}
                                title="Clear cheque — GL: Dr Customer(PDC), Cr Receivable"
                              >
                                {isActioning && actionLoading === row.id + "cleared"
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : "Clear"}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && !loading && (
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

      <p className="text-xs text-muted-foreground text-right">
        {filtered.length} of {rows.length} cheques shown. All actions post to GL automatically.
      </p>
    </div>
  );
}

function CashierPDCs() {
  return <PdcManagement />;
}
