import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Receipt, AlertTriangle, CheckCircle2, RotateCcw, Landmark, ArrowUpRight, ArrowDownLeft, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { depositPdc, clearPdc, returnPdc } from "@/lib/finance/pdcService";
import { useAppData } from "@/lib/app-data-context";
import { ReceiptModal, type TenantReceiptDetails } from "@/components/receipt-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const PAGE_SIZE = 20;

// ── GL Impact Definition ─────────────────────────────────────────────────────
type GlImpact = {
  type: "Debit" | "Credit";
  account: string;
  code: string;
  description: string;
};

type ActionConfig = {
  action: "deposit" | "clear" | "return";
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  impacts: GlImpact[];
  newStatus: string;
  newSharedStatus: "received" | "deposited" | "cleared" | "bounced" | "returned" | "replaced" | "cancelled";
};

function getActionConfig(action: "deposit" | "clear" | "return", chequeNo: string, tenantName: string, amount: number): ActionConfig {
  const fmtAmt = `QAR ${amount.toLocaleString()}`;
  if (action === "deposit") {
    return {
      action,
      title: "Confirm PDC Bank Deposit",
      description: `You are depositing Cheque #${chequeNo} (${tenantName}) of ${fmtAmt} into the bank.`,
      icon: <Landmark className="h-5 w-5 text-blue-600" />,
      color: "blue",
      newStatus: "Deposited",
      newSharedStatus: "deposited",
      impacts: [
        { type: "Debit",  account: "Bank Operating Account", code: "12000", description: "Cash received into bank" },
        { type: "Credit", account: "PDC In Hand",            code: "12900", description: "PDC cleared from holding account" },
      ],
    };
  }
  if (action === "clear") {
    return {
      action,
      title: "Confirm PDC Bank Clearance",
      description: `You are marking Cheque #${chequeNo} (${tenantName}) of ${fmtAmt} as cleared in bank.`,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      color: "emerald",
      newStatus: "Cleared",
      newSharedStatus: "cleared",
      impacts: [
        { type: "Debit",  account: "Customer(PDC) - Unit Account", code: "21400", description: "Customer PDC Liability settled" },
        { type: "Credit", account: "Receivable - Unit Account",    code: "12413", description: "Tenant Receivable offset" },
      ],
    };
  }
  // return — 4 GL lines (paired)
  return {
    action,
    title: "Confirm PDC Return / Bounce",
    description: `You are marking Cheque #${chequeNo} (${tenantName}) of ${fmtAmt} as returned / bounced.`,
    icon: <RotateCcw className="h-5 w-5 text-red-600" />,
    color: "red",
    newStatus: "Returned",
    newSharedStatus: "bounced",
    impacts: [
      { type: "Debit",  account: "PDC In Hand",                  code: "12900", description: "Cheque physically returned to hand" },
      { type: "Credit", account: "Bank Account",                  code: "12000", description: "Bank credit reversed on bounce" },
      { type: "Debit",  account: "Receivable - Unit Account",     code: "12413", description: "Outstanding receivable re-exposed" },
      { type: "Credit", account: "Customer(PDC) - Unit Account",  code: "21400", description: "PDC liability reversed" },
    ],
  };
}

// ── GL Confirmation Modal ─────────────────────────────────────────────────────
interface GlConfirmModalProps {
  open: boolean;
  config: ActionConfig | null;
  amount: number;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function GlConfirmModal({ open, config, amount, loading, onConfirm, onCancel }: GlConfirmModalProps) {
  if (!config) return null;
  const fmtAmt = `QAR ${amount.toLocaleString()}`;
  const colorMap: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50",
    emerald: "border-emerald-200 bg-emerald-50",
    red: "border-red-200 bg-red-50",
  };
  const badgeColorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800",
    emerald: "bg-emerald-100 text-emerald-800",
    red: "bg-red-100 text-red-800",
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        {/* GL Impact Table */}
        <div className={`rounded-lg border p-4 space-y-3 ${colorMap[config.color] || "border-muted bg-muted/10"}`}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            General Ledger / COA Accounts Impacted
          </div>
          <div className="space-y-2">
            {config.impacts.map((impact, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/70 rounded-md px-3 py-2 border border-white/80 shadow-sm">
                <div className="mt-0.5">
                  {impact.type === "Debit"
                    ? <ArrowUpRight className="h-4 w-4 text-green-600" />
                    : <ArrowDownLeft className="h-4 w-4 text-orange-500" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${impact.type === "Debit" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                      {impact.type}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${badgeColorMap[config.color]}`}>
                      GL {impact.code}
                    </span>
                    <span className="text-xs font-semibold">{impact.account}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{impact.description}</p>
                </div>
                <div className="text-xs font-mono font-bold tabular-nums">{fmtAmt}</div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-muted-foreground border-t border-white/60 pt-2">
            Both entries will be posted simultaneously to maintain double-entry integrity.
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={config.color === "red" ? "bg-red-600 hover:bg-red-700 text-white" : config.color === "emerald" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
          >
            {loading ? "Processing…" : `Confirm ${config.action === "deposit" ? "Deposit" : config.action === "clear" ? "Clear" : "Return"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function PdcManagement() {
  const { pdcs: sharedPdcs, setPdcs: setSharedPdcs, leases } = useAppData();
  const [pdcs, setPdcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<TenantReceiptDetails | null>(null);

  // GL Confirm Modal state
  const [glConfirmOpen, setGlConfirmOpen] = useState(false);
  const [pendingActionPdc, setPendingActionPdc] = useState<any | null>(null);
  const [pendingAction, setPendingAction] = useState<"deposit" | "clear" | "return" | null>(null);

  // Status Tab: "posted" (Deposited, Cleared) vs "due" (In Hand, Due) vs "all"
  const [statusTab, setStatusTab] = useState<"due" | "posted" | "all">("due");
  // Period filter: "all" | "past" | "current" | "upcoming"
  const [periodTab, setPeriodTab] = useState<"all" | "past" | "current" | "upcoming">("all");
  // Upcoming maturity month filter (e.g. "ALL" or "2026-09", "2026-10", etc.)
  const [upcomingMonth, setUpcomingMonth] = useState<string>("ALL");

  // Only reload when leases change (not sharedPdcs — that triggers premature re-fetch before DB update completes)
  useEffect(() => { load(); }, [leases]);

  async function load() {
    setLoading(true);
    try {
      let finRegisterData: any[] = [];
      try {
        const { data, error } = await supabase
          .from('fin_pdc_register')
          .select('*')
          .order('cheque_date', { ascending: false });
        if (!error && data) {
          finRegisterData = data.map(p => {
            const rawStatus = (p.status || '').trim().toLowerCase();
            const normalizedStatus =
              rawStatus === 'deposited' ? 'Deposited' :
              rawStatus === 'cleared' ? 'Cleared' :
              (rawStatus === 'bounced' || rawStatus === 'returned') ? 'Returned' :
              rawStatus === 'replaced' ? 'Replaced' :
              'In Hand';

            return {
              ...p,
              status: normalizedStatus,
            };
          });
        }
      } catch (e) { /* fallback */ }

      let pdcsTableData: any[] = [];
      try {
        const { data: altData } = await supabase.from('pdcs').select('*').order('created_at', { ascending: false });
        if (altData && altData.length > 0) {
          pdcsTableData = altData.map(p => {
            const rawStatus = (p.status || p.status_pdc || '').trim().toLowerCase();
            const normalizedStatus =
              rawStatus === 'deposited' ? 'Deposited' :
              rawStatus === 'cleared' ? 'Cleared' :
              (rawStatus === 'bounced' || rawStatus === 'returned') ? 'Returned' :
              rawStatus === 'replaced' ? 'Replaced' :
              'In Hand';

            return {
              id: p.id,
              entry_date: p.created_at ? p.created_at.split('T')[0] : '2026-08-01',
              cheque_date: p.maturity_date || p.deposit_date || (p.created_at ? p.created_at.split('T')[0] : '2026-08-01'),
              cheque_number: p.cheque_number,
              amount: Number(p.amount) || 0,
              status: normalizedStatus,
              bank_name: p.bank,
              property_name: p.property_code || p.property_name || '—',
              unit_ref: p.unit_name || p.unit_ref || '—',
              tenant_name: p.tenant_name || '—',
              lease_start: p.rent_from_date || p.lease_start,
              lease_end: p.rent_to_date || p.lease_end,
              monthly_rent: Number(p.amount) || 0,
              _source: 'supabase',
            };
          });
        }
      } catch { /* fallback */ }

      // Build primary list starting from fin_pdc_register, complemented by pdcs table
      const dbDataMap = new Map<string, any>();
      for (const p of pdcsTableData) {
        if (p.cheque_number) dbDataMap.set(String(p.cheque_number), p);
      }
      for (const p of finRegisterData) {
        const key = p.cheque_number ? String(p.cheque_number) : String(p.id);
        const existing = dbDataMap.get(key);
        if (existing) {
          // Priority: Cleared/Returned/Replaced > Deposited > In Hand
          const isFinalStatus = (s: string) => s === 'Cleared' || s === 'Returned' || s === 'Replaced';
          let finalStatus = p.status;
          if (isFinalStatus(existing.status)) {
            finalStatus = existing.status;
          } else if (isFinalStatus(p.status)) {
            finalStatus = p.status;
          } else if (existing.status === 'Deposited' || p.status === 'Deposited') {
            finalStatus = 'Deposited';
          }

          dbDataMap.set(key, {
            ...existing,
            ...p,
            status: finalStatus,
          });
        } else {
          dbDataMap.set(key, p);
        }
      }

      const dbData = Array.from(dbDataMap.values());

      const contextPdcs = (sharedPdcs || []).map((p, idx) => {
        const lease = leases?.find((l) => l.id === p.leaseId);
        const rawStatus = (p.status || '').trim().toLowerCase();
        const normalizedStatus =
          rawStatus === 'deposited' ? 'Deposited' :
          rawStatus === 'cleared' ? 'Cleared' :
          (rawStatus === 'bounced' || rawStatus === 'returned') ? 'Returned' :
          rawStatus === 'replaced' ? 'Replaced' :
          'In Hand';

        return {
          id: p.id || `ctx-pdc-${idx}`,
          leaseId: p.leaseId,
          entry_date: (p as any).entry_date || lease?.startDate || p.date || '2026-08-01',
          cheque_date: p.date,
          cheque_number: p.chequeNo,
          amount: Number(p.amount) || 0,
          status: normalizedStatus,
          bank_name: p.bank,
          property_name: (p as any).propertyName || (p as any).property || lease?.property || 'Old Salata - Residence No:23',
          unit_ref: (p as any).unitRef || (p as any).unit || lease?.unit || 'AAA - Flat16',
          tenant_name: (p as any).tenantName || (p as any).payerName || lease?.tenantName || 'Valued Tenant',
          lease_start: (p as any).tenureStart || lease?.startDate || p.date,
          lease_end: (p as any).tenureEnd || lease?.endDate || p.date,
          monthly_rent: lease?.monthlyRent || Number(p.amount) || 0,
          _source: 'context',
        };
      });

      const allPdcs = [...dbData];
      for (const cp of contextPdcs) {
        if (!allPdcs.some(d => String(d.cheque_number) === String(cp.cheque_number) || String(d.id) === String(cp.id))) {
          allPdcs.push(cp);
        }
      }
      allPdcs.sort((a, b) => new Date(b.cheque_date || "").getTime() - new Date(a.cheque_date || "").getTime());
      setPdcs(allPdcs);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Open GL Confirm Modal ──────────────────────────────────────────────────
  function openGlConfirm(pdc: any, action: "deposit" | "clear" | "return") {
    setPendingActionPdc(pdc);
    setPendingAction(action);
    setGlConfirmOpen(true);
  }

  // ── Execute Confirmed Action ───────────────────────────────────────────────
  async function executeConfirmedAction() {
    if (!pendingActionPdc || !pendingAction) return;
    const pdc = pendingActionPdc;
    const action = pendingAction;
    const id = pdc.id;
    const amt = Number(pdc.amount) || 0;
    const chqNo = pdc.cheque_number || id;
    const config = getActionConfig(action, chqNo, pdc.tenant_name || 'Tenant', amt);

    // Close modal immediately so user isn't stuck
    setGlConfirmOpen(false);
    setPendingActionPdc(null);
    setPendingAction(null);
    setActionLoading(true);

    try {
      // Persist status and accounting atomically via pdcService.
      if (action === "deposit") {
        await depositPdc(id, String(chqNo));
      } else if (action === "clear") {
        await clearPdc(id, String(chqNo));
      } else {
        await returnPdc(id, String(chqNo));
      }

      // Update UI/context only after the database transaction succeeds.
      setPdcs(prev => prev.map(p =>
        (String(p.id) === String(id) || String(p.cheque_number) === String(chqNo))
          ? { ...p, status: config.newStatus }
          : p
      ));

      setSharedPdcs(prev => prev.map(p =>
        (String(p.id) === String(id) || String((p as any).chequeNo) === String(chqNo))
          ? { ...p, status: config.newSharedStatus }
          : p
      ));

      toast.success(`PDC #${chqNo} marked as ${config.newStatus}. General Ledger updated.`);
    } catch (e: any) {
      toast.error(e.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  }

  function handleViewReceipt(pdc: any) {
    const details: TenantReceiptDetails = {
      receiptNo: `REC-PDC-${String(pdc.id).slice(-4)}`,
      acknowledgementNo: `PDC-ACK-${pdc.cheque_number}`,
      date: pdc.cheque_date || new Date().toISOString().split("T")[0],
      tenantName: pdc.tenant_name && pdc.tenant_name !== '—' ? pdc.tenant_name : 'Valued Tenant',
      propertyName: pdc.property_name && pdc.property_name !== '—' ? pdc.property_name : 'Property',
      unitRef: pdc.unit_ref && pdc.unit_ref !== '—' ? pdc.unit_ref : 'Unit',
      leaseStartDate: pdc.lease_start || pdc.cheque_date,
      leaseEndDate: pdc.lease_end || pdc.cheque_date,
      monthlyRent: Number(pdc.monthly_rent || pdc.amount) || 0,
      totalContractRent: (Number(pdc.monthly_rent || pdc.amount) * 12) || Number(pdc.amount) || 0,
      depositAmount: 0,
      depositMode: 'PDC',
      pdcCount: 1,
      pdcs: [{
        chequeNo: pdc.cheque_number,
        bank: pdc.bank_name || 'Bank',
        date: pdc.cheque_date,
        amount: Number(pdc.amount) || 0,
        period: pdc.period || (pdc.lease_start && pdc.lease_end ? `${pdc.lease_start} to ${pdc.lease_end}` : 'Rent Instalment'),
        tenureStart: pdc.lease_start || pdc.cheque_date,
        tenureEnd: pdc.lease_end || pdc.cheque_date,
      }],
      totalCollected: Number(pdc.amount) || 0,
      cashierName: 'Finance Department',
      notes: `Official acknowledgment for PDC ${pdc.cheque_number} status: ${pdc.status}.`,
    };
    setReceiptData(details);
    setReceiptOpen(true);
  }

  // Filter based on status and period
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  const filteredPdcs = pdcs.filter(pdc => {
    // 1. Status Filter
    if (statusTab === "posted") {
      if (pdc.status !== "Deposited" && pdc.status !== "Cleared") return false;
    } else if (statusTab === "due") {
      if (pdc.status !== "In Hand" && pdc.status !== "Returned") return false;
    }

    // 2. Period Filter
    if (periodTab === "all") return true;

    const chequeDate = new Date(pdc.cheque_date || "");
    if (isNaN(chequeDate.getTime())) return true;

    const chqYear = chequeDate.getFullYear();
    const chqMonth = chequeDate.getMonth();

    if (periodTab === "current") {
      return chqYear === currentYear && chqMonth === currentMonth;
    } else if (periodTab === "past") {
      if (chqYear < currentYear) return true;
      return chqYear === currentYear && chqMonth < currentMonth;
    } else if (periodTab === "upcoming") {
      const isUpcoming = chqYear > currentYear || (chqYear === currentYear && chqMonth > currentMonth);
      if (!isUpcoming) return false;
      if (upcomingMonth === "ALL") return true;
      const monthKey = `${chqYear}-${String(chqMonth + 1).padStart(2, "0")}`;
      return monthKey === upcomingMonth;
    }

    return true;
  });

  // Extract unique upcoming months from PDCs
  const upcomingMonthsList = Array.from(
    new Set(
      pdcs
        .filter(p => {
          const d = new Date(p.cheque_date || "");
          if (isNaN(d.getTime())) return false;
          return d.getFullYear() > currentYear || (d.getFullYear() === currentYear && d.getMonth() > currentMonth);
        })
        .map(p => {
          const d = new Date(p.cheque_date || "");
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        })
    )
  ).sort();

  const totalPages = Math.max(1, Math.ceil(filteredPdcs.length / PAGE_SIZE));
  const paginated = filteredPdcs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalAmount = filteredPdcs.reduce((s, p) => s + (Number(p.amount) || 0), 0);

  // GL Confirm Modal config
  const glConfig = pendingActionPdc && pendingAction
    ? getActionConfig(pendingAction, pendingActionPdc.cheque_number || '', pendingActionPdc.tenant_name || 'Tenant', Number(pendingActionPdc.amount) || 0)
    : null;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle>PDC Register &amp; Management</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredPdcs.length} cheques ({statusTab.toUpperCase()} • {periodTab.toUpperCase()}{periodTab === 'upcoming' && upcomingMonth !== 'ALL' ? ` • ${upcomingMonth}` : ''}) • Total: <strong className="text-emerald-600 font-mono">QR {totalAmount.toLocaleString()}</strong>
            </p>
          </div>

          {/* Status Tabs (Due vs Posted vs All) */}
          <div className="inline-flex rounded-lg bg-muted p-1 text-xs">
            <button
              onClick={() => { setStatusTab("due"); setPage(1); }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusTab === "due" ? "bg-background text-primary shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Due ({pdcs.filter(p => p.status === 'In Hand' || p.status === 'Returned').length})
            </button>
            <button
              onClick={() => { setStatusTab("posted"); setPage(1); }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusTab === "posted" ? "bg-background text-primary shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Posted ({pdcs.filter(p => p.status === 'Deposited' || p.status === 'Cleared').length})
            </button>
            <button
              onClick={() => { setStatusTab("all"); setPage(1); }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                statusTab === "all" ? "bg-background text-primary shadow-sm font-bold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All PDCs ({pdcs.length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {actionLoading && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin text-amber-600" /> Updating GL &amp; Database...
              </span>
            )}
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground" onClick={() => load()}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Sub-Tabs: Past Month, Current Month, Upcoming Months */}
          <div className="flex flex-wrap items-center gap-1.5 border-b pb-2.5 text-xs">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Period Filter:</span>
            <Button size="sm" variant={periodTab === "all" ? "default" : "outline"} className="h-7 text-xs" onClick={() => { setPeriodTab("all"); setUpcomingMonth("ALL"); setPage(1); }}>All Dates</Button>
            <Button size="sm" variant={periodTab === "past" ? "default" : "outline"} className="h-7 text-xs" onClick={() => { setPeriodTab("past"); setUpcomingMonth("ALL"); setPage(1); }}>Past Months</Button>
            <Button size="sm" variant={periodTab === "current" ? "default" : "outline"} className="h-7 text-xs" onClick={() => { setPeriodTab("current"); setUpcomingMonth("ALL"); setPage(1); }}>Current Month</Button>
            <Button size="sm" variant={periodTab === "upcoming" ? "default" : "outline"} className="h-7 text-xs" onClick={() => { setPeriodTab("upcoming"); setPage(1); }}>Upcoming Months</Button>
          </div>

          {/* Maturity Month Sub-Tabs under Upcoming Tab */}
          {periodTab === "upcoming" && (
            <div className="flex flex-wrap items-center gap-1.5 bg-muted/40 p-2 rounded-lg border text-xs">
              <span className="font-semibold text-primary text-xs mr-1">Maturity Month:</span>
              <Button
                size="sm"
                variant={upcomingMonth === "ALL" ? "default" : "outline"}
                className="h-6 text-[11px] px-2.5"
                onClick={() => { setUpcomingMonth("ALL"); setPage(1); }}
              >
                All Upcoming ({pdcs.filter(p => {
                  const d = new Date(p.cheque_date || "");
                  return d.getFullYear() > currentYear || (d.getFullYear() === currentYear && d.getMonth() > currentMonth);
                }).length})
              </Button>
              {upcomingMonthsList.map(month => {
                const [y, m] = month.split("-");
                const monthName = new Date(Number(y), Number(m) - 1, 1).toLocaleString("default", { month: "short", year: "numeric" });
                const countInMonth = pdcs.filter(p => (p.cheque_date || "").startsWith(month)).length;
                return (
                  <Button
                    key={month}
                    size="sm"
                    variant={upcomingMonth === month ? "default" : "outline"}
                    className="h-6 text-[11px] px-2.5 font-mono"
                    onClick={() => { setUpcomingMonth(month); setPage(1); }}
                  >
                    {monthName} ({countInMonth})
                  </Button>
                );
              })}
            </div>
          )}

          {loading ? <p className="text-sm text-muted-foreground py-4">Loading...</p> : (
            <>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold text-xs">Entry Date</TableHead>
                      <TableHead className="font-bold text-xs">Cheque Date</TableHead>
                      <TableHead className="font-bold text-xs">Cheque No.</TableHead>
                      <TableHead className="font-bold text-xs">Bank</TableHead>
                      <TableHead className="font-bold text-xs">Property</TableHead>
                      <TableHead className="font-bold text-xs">Unit</TableHead>
                      <TableHead className="font-bold text-xs">Tenant</TableHead>
                      <TableHead className="text-right font-bold text-xs">Amount (QAR)</TableHead>
                      <TableHead className="font-bold text-xs">Status</TableHead>
                      <TableHead className="font-bold text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8 text-muted-foreground text-xs">
                          No PDCs matching the selected tab and period filters.
                        </TableCell>
                      </TableRow>
                    )}
                    {paginated.map(pdc => (
                      <TableRow key={pdc.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs text-muted-foreground">{pdc.entry_date || pdc.cheque_date}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold">{pdc.cheque_date}</TableCell>
                        <TableCell className="font-mono font-semibold text-xs text-primary">{pdc.cheque_number}</TableCell>
                        <TableCell className="text-xs">{pdc.bank_name || '—'}</TableCell>
                        <TableCell className="text-xs">{pdc.property_name || '—'}</TableCell>
                        <TableCell className="text-xs font-mono">{pdc.unit_ref || '—'}</TableCell>
                        <TableCell className="text-xs">{pdc.tenant_name || '—'}</TableCell>
                        <TableCell className="text-right font-bold font-mono text-xs">{Number(pdc.amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              pdc.status === 'In Hand' ? 'default' :
                              pdc.status === 'Deposited' ? 'secondary' :
                              pdc.status === 'Cleared' ? 'outline' :
                              'destructive'
                            }
                            className={`text-xs ${
                              pdc.status === 'Cleared' ? 'bg-emerald-500/15 text-emerald-700 border-emerald-300 font-semibold' :
                              pdc.status === 'Returned' ? 'bg-red-500/15 text-red-700 border-red-300 font-semibold' :
                              pdc.status === 'Deposited' ? 'bg-blue-500/15 text-blue-700 border-blue-300 font-semibold' :
                              pdc.status === 'Replaced' ? 'bg-purple-500/15 text-purple-700 border-purple-300 font-semibold' :
                              ''
                            }`}
                          >
                            {pdc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="space-x-1">
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-primary gap-1" onClick={() => handleViewReceipt(pdc)}>
                            <Receipt className="h-3 w-3" /> Receipt
                          </Button>
                          {pdc.status === 'In Hand' && (
                            <Button size="sm" className="h-7 text-xs" onClick={() => openGlConfirm(pdc, "deposit")}>
                              Deposit
                            </Button>
                          )}
                          {pdc.status === 'Deposited' && (
                            <>
                              <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50" onClick={() => openGlConfirm(pdc, "clear")}>
                                Clear
                              </Button>
                              <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => openGlConfirm(pdc, "return")}>
                                Return
                              </Button>
                            </>
                          )}
                          {pdc.status === 'Returned' && (
                            <Button size="sm" variant="outline" className="h-7 text-xs border-blue-500 text-blue-600 hover:bg-blue-50" onClick={() => openGlConfirm(pdc, "deposit")}>
                              Re-Deposit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {filteredPdcs.length > PAGE_SIZE && (
                <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                  <span>Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filteredPdcs.length)} of {filteredPdcs.length}</span>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="h-7" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => Math.abs(p - page) <= 2).map(p => (
                      <Button key={p} size="sm" variant={p === page ? "default" : "outline"} className="h-7 w-7 p-0" onClick={() => setPage(p)}>{p}</Button>
                    ))}
                    <Button size="sm" variant="outline" className="h-7" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* GL Confirmation Modal */}
      <GlConfirmModal
        open={glConfirmOpen}
        config={glConfig}
        amount={Number(pendingActionPdc?.amount) || 0}
        loading={actionLoading}
        onConfirm={executeConfirmedAction}
        onCancel={() => { setGlConfirmOpen(false); setPendingActionPdc(null); setPendingAction(null); }}
      />

      <ReceiptModal open={receiptOpen} onOpenChange={setReceiptOpen} data={receiptData} />
    </>
  );
}
