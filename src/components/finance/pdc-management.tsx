import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Receipt,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Landmark,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  RefreshCw,
  Search,
  Filter,
  Download,
  Plus,
  XCircle,
  Banknote,
  Calendar,
  Building,
  Home,
  User,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import {
  depositPdc,
  clearPdc,
  returnPdc,
  cancelPdc,
  cashDepositInPlaceOfPdc,
  receivePdc,
} from "@/lib/finance/pdcService";
import { useAppData } from "@/lib/app-data-context";
import { useFinanceStore } from "@/lib/finance/finance-store";
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
  action: "deposit" | "clear" | "return" | "cancel";
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  impacts: GlImpact[];
  newStatus: string;
  newSharedStatus: "received" | "deposited" | "cleared" | "bounced" | "returned" | "replaced" | "cancelled";
};

function getActionConfig(action: "deposit" | "clear" | "return" | "cancel", chequeNo: string, tenantName: string, amount: number): ActionConfig {
  const fmtAmt = `QAR ${amount.toLocaleString()}`;
  if (action === "deposit") {
    return {
      action,
      title: "Confirm PDC Bank Deposit",
      description: `You are depositing Cheque #${chequeNo} (${tenantName}) of ${fmtAmt} into the bank account.`,
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
  if (action === "cancel") {
    return {
      action,
      title: "Confirm PDC Cancellation",
      description: `You are cancelling Cheque #${chequeNo} (${tenantName}) of ${fmtAmt} before presentation.`,
      icon: <XCircle className="h-5 w-5 text-rose-600" />,
      color: "red",
      newStatus: "Cancelled",
      newSharedStatus: "cancelled",
      impacts: [
        { type: "Debit",  account: "Customer(PDC) - Unit Account", code: "21400", description: "Customer PDC liability reversed" },
        { type: "Credit", account: "PDC In Hand",                  code: "12900", description: "PDC In Hand holding reversed" },
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
  cancelReason?: string;
  onCancelReasonChange?: (reason: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function GlConfirmModal({
  open,
  config,
  amount,
  loading,
  cancelReason,
  onCancelReasonChange,
  onConfirm,
  onCancel,
}: GlConfirmModalProps) {
  if (!config) return null;
  const fmtAmt = `QAR ${amount.toLocaleString()}`;
  const colorMap: Record<string, string> = {
    blue: "border-blue-200 bg-blue-50/70",
    emerald: "border-emerald-200 bg-emerald-50/70",
    red: "border-red-200 bg-red-50/70",
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

        {config.action === "cancel" && (
          <div className="space-y-1.5 py-1 text-xs">
            <Label className="font-semibold text-xs text-foreground">
              Cancellation Reason <span className="text-destructive">*</span>
            </Label>
            <Textarea
              rows={2}
              placeholder="e.g. Tenant replaced with online transfer, date error..."
              value={cancelReason || ""}
              onChange={(e) => onCancelReasonChange?.(e.target.value)}
              className="text-xs"
            />
          </div>
        )}

        {/* GL Impact Table */}
        <div className={`rounded-lg border p-3.5 space-y-2.5 ${colorMap[config.color] || "border-muted bg-muted/10"}`}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <AlertTriangle className="h-3.5 w-3.5" />
            General Ledger / COA Accounts Impacted
          </div>
          <div className="space-y-2">
            {config.impacts.map((impact, i) => (
              <div key={i} className="flex items-start gap-2.5 bg-background/85 rounded-md px-3 py-2 border shadow-sm">
                <div className="mt-0.5">
                  {impact.type === "Debit"
                    ? <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    : <ArrowDownLeft className="h-4 w-4 text-amber-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${impact.type === "Debit" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
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

          <div className="text-[11px] text-muted-foreground border-t border-border/50 pt-2">
            Double-entry transactions will be posted simultaneously to maintain trial balance integrity and persist directly to the database.
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button
            onClick={onConfirm}
            disabled={loading || (config.action === "cancel" && !cancelReason?.trim())}
            className={config.color === "red" ? "bg-red-600 hover:bg-red-700 text-white" : config.color === "emerald" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
          >
            {loading ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Processing…</> : `Confirm ${config.action === "deposit" ? "Deposit" : config.action === "clear" ? "Clear" : config.action === "cancel" ? "Cancel Cheque" : "Return"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function PdcManagement() {
  const { pdcs: sharedPdcs, setPdcs: setSharedPdcs, leases, units, customers } = useAppData();
  const { addJournalEntry, addCashBookEntry, addVoucher } = useFinanceStore();
  const [pdcs, setPdcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<TenantReceiptDetails | null>(null);

  // GL Confirm Modal state
  const [glConfirmOpen, setGlConfirmOpen] = useState(false);
  const [pendingActionPdc, setPendingActionPdc] = useState<any | null>(null);
  const [pendingAction, setPendingAction] = useState<"deposit" | "clear" | "return" | "cancel" | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Cash Replacement Modal state
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [cashStep, setCashStep] = useState<1 | 2>(1);
  const [cashPdc, setCashPdc] = useState<any | null>(null);
  const [cashAmount, setCashAmount] = useState("");
  const [cashReceiptDate, setCashReceiptDate] = useState(new Date().toISOString().split("T")[0]);
  const [cashNotes, setCashNotes] = useState("");
  const [cashCollectorName, setCashCollectorName] = useState("Finance Department");

  // Add PDC Modal state
  const [addPdcOpen, setAddPdcOpen] = useState(false);
  const [addPdcLoading, setAddPdcLoading] = useState(false);
  const [addPdcForm, setAddPdcForm] = useState({
    chequeNo: "",
    bank: "Qatar National Bank (QNB)",
    amount: "5000",
    chequeDate: new Date().toISOString().split("T")[0],
    leaseId: "",
    propertyName: "",
    unitRef: "",
    tenantName: "",
  });

  // ── Multi-Dimensional Filters ──────────────────────────────────────────────
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<"cheque_date" | "cheque_number" | "tenant_name" | "amount">("cheque_date");
  const [sortAsc, setSortAsc] = useState<boolean>(false); // Descending order based on date default

  // Load data from DB & context
  useEffect(() => {
    load();
  }, [leases]);

  // Supabase Realtime: auto-refresh PDC list when fin_pdc_register or pdcs change.
  useEffect(() => {
    const channel = supabase
      .channel("pdc-management:live")
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "fin_pdc_register" },
        () => { load(); }
      )
      .on(
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table: "pdcs" },
        () => { load(); }
      )
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "pdcs" },
        () => { load(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true);
    try {
      let finRegisterData: any[] = [];
      try {
        const { data, error } = await supabase
          .from("fin_pdc_register")
          .select("*")
          .order("cheque_date", { ascending: true });
        if (!error && data) {
          finRegisterData = data.map((p) => {
            const rawStatus = (p.status || "").trim().toLowerCase();
            const normalizedStatus =
              rawStatus === "deposited" ? "Deposited" :
              rawStatus === "cleared" ? "Cleared" :
              (rawStatus === "bounced" || rawStatus === "returned") ? "Returned" :
              rawStatus === "cancelled" ? "Cancelled" :
              rawStatus === "replaced" ? "Replaced" :
              "In Hand";

            return {
              ...p,
              status: normalizedStatus,
            };
          });
        }
      } catch { /* fallback */ }

      let pdcsTableData: any[] = [];
      try {
        const { data: altData } = await supabase.from("pdcs").select("*").order("created_at", { ascending: true });
        if (altData && altData.length > 0) {
          pdcsTableData = altData.map((p) => {
            const rawStatus = (p.status || p.status_pdc || "").trim().toLowerCase();
            const normalizedStatus =
              rawStatus === "deposited" ? "Deposited" :
              rawStatus === "cleared" ? "Cleared" :
              (rawStatus === "bounced" || rawStatus === "returned") ? "Returned" :
              rawStatus === "cancelled" ? "Cancelled" :
              rawStatus === "replaced" ? "Replaced" :
              "In Hand";

            return {
              id: p.id,
              entry_date: p.created_at ? p.created_at.split("T")[0] : "2026-08-01",
              cheque_date: p.maturity_date || p.deposit_date || (p.created_at ? p.created_at.split("T")[0] : "2026-08-01"),
              cheque_number: p.cheque_number,
              amount: Number(p.amount) || 0,
              status: normalizedStatus,
              bank_name: p.bank,
              property_name: p.property_code || p.property_name || "—",
              unit_ref: p.unit_name || p.unit_ref || "—",
              tenant_name: p.tenant_name || "—",
              lease_start: p.rent_from_date || p.lease_start,
              lease_end: p.rent_to_date || p.lease_end,
              monthly_rent: Number(p.amount) || 0,
              _source: "supabase",
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
          const isFinalStatus = (s: string) => s === "Cleared" || s === "Returned" || s === "Replaced" || s === "Cancelled";
          let finalStatus = p.status;
          if (isFinalStatus(existing.status)) {
            finalStatus = existing.status;
          } else if (isFinalStatus(p.status)) {
            finalStatus = p.status;
          } else if (existing.status === "Deposited" || p.status === "Deposited") {
            finalStatus = "Deposited";
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
        const rawStatus = (p.status || "").trim().toLowerCase();
        const normalizedStatus =
          rawStatus === "deposited" ? "Deposited" :
          rawStatus === "cleared" ? "Cleared" :
          (rawStatus === "bounced" || rawStatus === "returned") ? "Returned" :
          rawStatus === "cancelled" ? "Cancelled" :
          rawStatus === "replaced" ? "Replaced" :
          "In Hand";

        return {
          id: p.id || `ctx-pdc-${idx}`,
          leaseId: p.leaseId,
          entry_date: (p as any).entry_date || lease?.startDate || p.date || "2026-08-01",
          cheque_date: p.date,
          cheque_number: p.chequeNo,
          amount: Number(p.amount) || 0,
          status: normalizedStatus,
          bank_name: p.bank,
          property_name: (p as any).propertyName || (p as any).property || lease?.property || "Old Salata - Residence No:23",
          unit_ref: (p as any).unitRef || (p as any).unit || lease?.unit || "AAA - Flat16",
          tenant_name: (p as any).tenantName || (p as any).payerName || lease?.tenantName || "Valued Tenant",
          lease_start: (p as any).tenureStart || lease?.startDate || p.date,
          lease_end: (p as any).tenureEnd || lease?.endDate || p.date,
          monthly_rent: lease?.monthlyRent || Number(p.amount) || 0,
          _source: "context",
        };
      });

      const allPdcs = [...dbData];
      for (const cp of contextPdcs) {
        if (!allPdcs.some(d => String(d.cheque_number) === String(cp.cheque_number) || String(d.id) === String(cp.id))) {
          allPdcs.push(cp);
        }
      }
      setPdcs(allPdcs);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  // ── Ascending Sorted Dropdown Filter Options ────────────────────────────────
  const propertyOptions = useMemo(() => {
    const set = new Set<string>();
    pdcs.forEach(p => { if (p.property_name && p.property_name !== "—") set.add(String(p.property_name).trim()); });
    leases?.forEach(l => { if (l.property) set.add(String(l.property).trim()); });
    units?.forEach(u => { const prop = (u as any).propertyName || (u as any).property; if (prop) set.add(String(prop).trim()); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [pdcs, leases, units]);

  const unitOptions = useMemo(() => {
    const set = new Set<string>();
    pdcs.forEach(p => {
      if (selectedProperty !== "all" && p.property_name !== selectedProperty) return;
      if (p.unit_ref && p.unit_ref !== "—") set.add(String(p.unit_ref).trim());
    });
    leases?.forEach(l => {
      if (selectedProperty !== "all" && l.property !== selectedProperty) return;
      if (l.unit) set.add(String(l.unit).trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  }, [pdcs, leases, selectedProperty]);

  const customerOptions = useMemo(() => {
    const set = new Set<string>();
    pdcs.forEach(p => { if (p.tenant_name && p.tenant_name !== "—") set.add(String(p.tenant_name).trim()); });
    leases?.forEach(l => { if (l.tenantName) set.add(String(l.tenantName).trim()); });
    customers?.forEach(c => { if (c.name) set.add(String(c.name).trim()); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
  }, [pdcs, leases, customers]);

  const monthOptions = useMemo(() => {
    const set = new Set<string>();
    pdcs.forEach(p => {
      if (p.cheque_date && p.cheque_date.length >= 7) {
        set.add(p.cheque_date.slice(0, 7));
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b)); // Ascending chronological
  }, [pdcs]);

  // ── Filtered & Sorted PDCs ─────────────────────────────────────────────────
  const filteredPdcs = useMemo(() => {
    return pdcs.filter(pdc => {
      // 1. Status Filter
      if (statusFilter !== "all") {
        if (statusFilter === "due" && pdc.status !== "In Hand" && pdc.status !== "Returned") return false;
        if (statusFilter === "posted" && pdc.status !== "Deposited" && pdc.status !== "Cleared") return false;
        if (statusFilter !== "due" && statusFilter !== "posted" && pdc.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      // 2. Property Filter
      if (selectedProperty !== "all" && pdc.property_name !== selectedProperty) return false;

      // 3. Unit Filter
      if (selectedUnit !== "all" && pdc.unit_ref !== selectedUnit) return false;

      // 4. Customer Name Filter
      if (selectedCustomer !== "all" && pdc.tenant_name !== selectedCustomer) return false;

      // 5. Month Filter
      if (selectedMonth !== "all") {
        if (!pdc.cheque_date || !pdc.cheque_date.startsWith(selectedMonth)) return false;
      }

      // 6. Date Range Filter
      if (fromDate) {
        if (!pdc.cheque_date || pdc.cheque_date < fromDate) return false;
      }
      if (toDate) {
        if (!pdc.cheque_date || pdc.cheque_date > toDate) return false;
      }

      // 7. General Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          (pdc.cheque_number && String(pdc.cheque_number).toLowerCase().includes(q)) ||
          (pdc.tenant_name && String(pdc.tenant_name).toLowerCase().includes(q)) ||
          (pdc.property_name && String(pdc.property_name).toLowerCase().includes(q)) ||
          (pdc.unit_ref && String(pdc.unit_ref).toLowerCase().includes(q)) ||
          (pdc.bank_name && String(pdc.bank_name).toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      // Ascending / Descending sorting
      let comp = 0;
      if (sortField === "cheque_date") {
        comp = (a.cheque_date || "").localeCompare(b.cheque_date || "");
      } else if (sortField === "cheque_number") {
        comp = String(a.cheque_number || "").localeCompare(String(b.cheque_number || ""), undefined, { numeric: true });
      } else if (sortField === "tenant_name") {
        comp = String(a.tenant_name || "").localeCompare(String(b.tenant_name || ""));
      } else if (sortField === "amount") {
        comp = (Number(a.amount) || 0) - (Number(b.amount) || 0);
      }
      return sortAsc ? comp : -comp;
    });
  }, [pdcs, statusFilter, selectedProperty, selectedUnit, selectedCustomer, selectedMonth, fromDate, toDate, searchQuery, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filteredPdcs.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    return filteredPdcs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filteredPdcs, page]);

  const totalFilteredAmount = useMemo(() => {
    return filteredPdcs.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  }, [filteredPdcs]);

  // ── Open GL Confirm Modal ──────────────────────────────────────────────────
  function openGlConfirm(pdc: any, action: "deposit" | "clear" | "return" | "cancel") {
    setPendingActionPdc(pdc);
    setPendingAction(action);
    setCancelReason("");
    setGlConfirmOpen(true);
  }

  // ── Execute Confirmed Action & Persist to DB ────────────────────────────────
  async function executeConfirmedAction() {
    if (!pendingActionPdc || !pendingAction) return;
    const pdc = pendingActionPdc;
    const action = pendingAction;
    const id = pdc.id;
    const amt = Number(pdc.amount) || 0;
    const chqNo = pdc.cheque_number || id;
    const todayStr = new Date().toISOString().split("T")[0];
    const config = getActionConfig(action, chqNo, pdc.tenant_name || "Tenant", amt);

    // 1. Immediately update UI local state & shared context
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

    setGlConfirmOpen(false);
    setPendingActionPdc(null);
    setPendingAction(null);
    setActionLoading(true);

    try {
      // 2. Persist status and GL double entries directly to Supabase Database
      if (action === "deposit") {
        await depositPdc(id, String(chqNo));
      } else if (action === "clear") {
        await clearPdc(id, String(chqNo));
      } else if (action === "cancel") {
        await cancelPdc(id, String(chqNo), cancelReason || "Cancelled by Finance Officer");
      } else {
        await returnPdc(id, String(chqNo));
      }

      // 3. Mirror all paired debit/credit impact lines into the in-memory finance audit store
      if (action === "return") {
        addJournalEntry({
          je_no: `JE-RET-${String(chqNo).replace(/\W/g, "")}-${Date.now().toString().slice(-4)}`,
          posting_date: todayStr,
          reference: `RET-CHQ-${chqNo}`,
          narration: `PDC Cheque Physically Returned — Cheque #${chqNo} | ${pdc.tenant_name || "Tenant"}`,
          dr_account: "PDC In Hand",
          dr_code: "12900",
          cr_account: "Bank Account",
          cr_code: "12000",
          amount: amt,
          property_name: pdc.property_name && pdc.property_name !== "—" ? pdc.property_name : undefined,
          unit_ref: pdc.unit_ref && pdc.unit_ref !== "—" ? pdc.unit_ref : undefined,
          tenant_name: pdc.tenant_name && pdc.tenant_name !== "—" ? pdc.tenant_name : undefined,
        });
        addJournalEntry({
          je_no: `JE-REV-${String(chqNo).replace(/\W/g, "")}-${Date.now().toString().slice(-4)}`,
          posting_date: todayStr,
          reference: `REV-CHQ-${chqNo}`,
          narration: `Re-instate Tenant Receivable & Reverse PDC Liability — Cheque #${chqNo}`,
          dr_account: "Receivable - Unit Account",
          dr_code: "12413",
          cr_account: "Customer(PDC) - Unit Account",
          cr_code: "21400",
          amount: amt,
          property_name: pdc.property_name && pdc.property_name !== "—" ? pdc.property_name : undefined,
          unit_ref: pdc.unit_ref && pdc.unit_ref !== "—" ? pdc.unit_ref : undefined,
          tenant_name: pdc.tenant_name && pdc.tenant_name !== "—" ? pdc.tenant_name : undefined,
        });
      } else if (action === "clear") {
        addJournalEntry({
          je_no: `JE-CLE-${String(chqNo).replace(/\W/g, "")}-${Date.now().toString().slice(-4)}`,
          posting_date: todayStr,
          reference: `CLE-CHQ-${chqNo}`,
          narration: `PDC Cleared in Bank — Cheque #${chqNo} | ${pdc.tenant_name || "Tenant"}`,
          dr_account: "Customer(PDC) - Unit Account",
          dr_code: "21400",
          cr_account: "Receivable - Unit Account",
          cr_code: "12413",
          amount: amt,
          property_name: pdc.property_name && pdc.property_name !== "—" ? pdc.property_name : undefined,
          unit_ref: pdc.unit_ref && pdc.unit_ref !== "—" ? pdc.unit_ref : undefined,
          tenant_name: pdc.tenant_name && pdc.tenant_name !== "—" ? pdc.tenant_name : undefined,
        });
      } else if (action === "deposit") {
        addJournalEntry({
          je_no: `JE-DEP-${String(chqNo).replace(/\W/g, "")}-${Date.now().toString().slice(-4)}`,
          posting_date: todayStr,
          reference: `DEP-CHQ-${chqNo}`,
          narration: `PDC Deposited to Bank — Cheque #${chqNo} | ${pdc.tenant_name || "Tenant"}`,
          dr_account: "Bank Account",
          dr_code: "12000",
          cr_account: "PDC In Hand",
          cr_code: "12900",
          amount: amt,
          property_name: pdc.property_name && pdc.property_name !== "—" ? pdc.property_name : undefined,
          unit_ref: pdc.unit_ref && pdc.unit_ref !== "—" ? pdc.unit_ref : undefined,
          tenant_name: pdc.tenant_name && pdc.tenant_name !== "—" ? pdc.tenant_name : undefined,
        });
      } else if (action === "cancel") {
        addJournalEntry({
          je_no: `JE-CXL-${String(chqNo).replace(/\W/g, "")}-${Date.now().toString().slice(-4)}`,
          posting_date: todayStr,
          reference: `CXL-CHQ-${chqNo}`,
          narration: `PDC Cancelled: ${cancelReason || "Voluntary cancellation"} — Cheque #${chqNo}`,
          dr_account: "Customer(PDC) - Unit Account",
          dr_code: "21400",
          cr_account: "PDC In Hand",
          cr_code: "12900",
          amount: amt,
          property_name: pdc.property_name && pdc.property_name !== "—" ? pdc.property_name : undefined,
          unit_ref: pdc.unit_ref && pdc.unit_ref !== "—" ? pdc.unit_ref : undefined,
          tenant_name: pdc.tenant_name && pdc.tenant_name !== "—" ? pdc.tenant_name : undefined,
        });

        // Update Sub-Ledger: Journal Voucher Register
        addVoucher({
          voucher_no: `VCH-CXL-${String(chqNo).replace(/\W/g, "")}-${Date.now().toString().slice(-4)}`,
          voucher_type: "Journal Voucher",
          date: todayStr,
          name: `PDC Cheque #${chqNo} Cancellation Reversal (${pdc.tenant_name || "Tenant"})`,
          debit: "Customer(PDC) - Unit Account",
          debit_code: "21400",
          credit: "PDC In Hand",
          credit_code: "12900",
          amount: amt,
          method: "Reversal",
        } as any);
      }

      toast.success(`Cheque #${chqNo} marked as ${config.newStatus}. Database & GL updated.`);
    } catch (e: any) {
      toast.error(e.message || "Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  // ── Open Cash Replacement Confirmation Modal ──────────────────────────────
  function openCashModal(pdc: any) {
    setCashPdc(pdc);
    setCashStep(1);
    setCashAmount(String(pdc.amount || ""));
    setCashReceiptDate(new Date().toISOString().split("T")[0]);
    setCashNotes("");
    setCashCollectorName("Finance Department");
    setCashModalOpen(true);
  }

  // ── Execute Confirmed Cash Replacement & Update DB + GL ────────────────────
  async function executeConfirmedCashReplacement() {
    if (!cashPdc) return;
    const pdc = cashPdc;
    const chqNo = pdc.cheque_number || pdc.id;
    const originalAmt = Number(pdc.amount) || 0;
    const confirmedAmt = parseFloat(cashAmount) || originalAmt;
    const receiptDate = cashReceiptDate || new Date().toISOString().split("T")[0];
    const discrepancy = confirmedAmt - originalAmt;

    setCashModalOpen(false);
    setActionLoading(true);

    try {
      // 1. Persist to DB using cashDepositInPlaceOfPdc first
      await cashDepositInPlaceOfPdc(pdc.id, String(chqNo), confirmedAmt, cashNotes, receiptDate, cashCollectorName);

      // 2. Update local state and shared context after successful persistence
      setPdcs(prev => prev.map(p =>
        (String(p.id) === String(pdc.id) || String(p.cheque_number) === String(chqNo))
          ? { ...p, status: "Replaced" }
          : p
      ));

      setSharedPdcs(prev => prev.map(p =>
        (String(p.id) === String(pdc.id) || String((p as any).chequeNo) === String(chqNo))
          ? { ...p, status: "replaced" }
          : p
      ));

      // 3. Mirror into Finance store Journal Audit & Sub-Ledger:
      // Entry A: Cash Collection & Deposit (DR 12000 Bank Operating Account / CR 12100 Cash In Hand)
      addJournalEntry({
        je_no: `JE-CSH-${String(chqNo).replace(/\W/g, "")}-${Date.now().toString().slice(-4)}`,
        posting_date: receiptDate,
        reference: `CSH-CHQ-${chqNo}`,
        narration: `Cash Deposit in lieu of PDC Cheque #${chqNo}${discrepancy !== 0 ? ` (Discrepancy: ${discrepancy > 0 ? '+' : ''}${discrepancy} QAR from original QAR ${originalAmt})` : ''} | ${pdc.tenant_name || "Tenant"}${cashNotes ? ` — ${cashNotes}` : ''}`,
        dr_account: "Bank Operating Account",
        dr_code: "12000",
        cr_account: "Cash In Hand",
        cr_code: "12100",
        amount: confirmedAmt,
        property_name: pdc.property_name && pdc.property_name !== "—" ? pdc.property_name : "Old Salata - Residence No:23",
        unit_ref: pdc.unit_ref && pdc.unit_ref !== "—" ? pdc.unit_ref : "Unit",
        tenant_name: pdc.tenant_name && pdc.tenant_name !== "—" ? pdc.tenant_name : "Tenant",
      });

      // Entry B: Cheque Cancellation Reversal (DR 21400 Customer PDC Liability / CR 12900 PDC In Hand)
      addJournalEntry({
        je_no: `JE-CXL-CHQ-${String(chqNo).replace(/\W/g, "")}-${Date.now().toString().slice(-4)}`,
        posting_date: receiptDate,
        reference: `CXL-CHQ-${chqNo}`,
        narration: `Cheque Cancelled & Returned on Cash Replacement — Cheque #${chqNo} | ${pdc.tenant_name || "Tenant"}`,
        dr_account: "Customer(PDC) - Unit Account",
        dr_code: "21400",
        cr_account: "PDC In Hand",
        cr_code: "12900",
        amount: originalAmt,
        property_name: pdc.property_name && pdc.property_name !== "—" ? pdc.property_name : "Old Salata - Residence No:23",
        unit_ref: pdc.unit_ref && pdc.unit_ref !== "—" ? pdc.unit_ref : "Unit",
        tenant_name: pdc.tenant_name && pdc.tenant_name !== "—" ? pdc.tenant_name : "Tenant",
      });

      // Entry C: Handle Discrepancy (if cash received differs from original cheque)
      if (discrepancy < 0) {
        // Shortfall / Discount: DR 50800 Settlement Discount / CR 12413 Tenant Receivable
        addJournalEntry({
          je_no: `JE-DISC-${String(chqNo).replace(/\W/g, "")}-${Date.now().toString().slice(-4)}`,
          posting_date: receiptDate,
          reference: `DISC-CHQ-${chqNo}`,
          narration: `Settlement Discount / Shortfall on Cash Replacement — Cheque #${chqNo}`,
          dr_account: "Settlement Discount Allowed",
          dr_code: "50800",
          cr_account: "Tenant Receivable",
          cr_code: "12413",
          amount: Math.abs(discrepancy),
          property_name: pdc.property_name && pdc.property_name !== "—" ? pdc.property_name : "Old Salata - Residence No:23",
          unit_ref: pdc.unit_ref && pdc.unit_ref !== "—" ? pdc.unit_ref : "Unit",
          tenant_name: pdc.tenant_name && pdc.tenant_name !== "—" ? pdc.tenant_name : "Tenant",
        });
      } else if (discrepancy > 0) {
        // Excess Collection: DR 12100 Cash / CR 41900 Other Income / Adjustment
        addJournalEntry({
          je_no: `JE-ADJ-${String(chqNo).replace(/\W/g, "")}-${Date.now().toString().slice(-4)}`,
          posting_date: receiptDate,
          reference: `ADJ-CHQ-${chqNo}`,
          narration: `Excess Cash Adjustment on Replacement — Cheque #${chqNo}`,
          dr_account: "Cash In Hand",
          dr_code: "12100",
          cr_account: "Other Operating Income",
          cr_code: "41900",
          amount: discrepancy,
          property_name: pdc.property_name && pdc.property_name !== "—" ? pdc.property_name : "Old Salata - Residence No:23",
          unit_ref: pdc.unit_ref && pdc.unit_ref !== "—" ? pdc.unit_ref : "Unit",
          tenant_name: pdc.tenant_name && pdc.tenant_name !== "—" ? pdc.tenant_name : "Tenant",
        });
      }

      // Update Sub-Ledger: Cash Book entry
      addCashBookEntry({
        date: receiptDate,
        voucher: `CSH-CHQ-${chqNo}`,
        description: `Cash Rent Replacement (Cheque #${chqNo} - ${pdc.tenant_name || "Tenant"})`,
        type: "in",
        amount: confirmedAmt,
      });

      // Update Sub-Ledger: Receipt Voucher Register (Cash Inflow)
      addVoucher({
        voucher_no: `VCH-CSH-${String(chqNo).replace(/\W/g, "")}-${Date.now().toString().slice(-4)}`,
        voucher_type: "Receipt Voucher",
        date: receiptDate,
        name: `Cash Settlement in lieu of Cheque #${chqNo} (${pdc.tenant_name || "Tenant"})`,
        debit: "Bank Operating Account",
        debit_code: "12000",
        credit: "Cash In Hand",
        credit_code: "12100",
        amount: confirmedAmt,
        method: "Cash",
      } as any);

      // Update Sub-Ledger: Journal Voucher Register (Cheque Cancellation Reversal)
      addVoucher({
        voucher_no: `VCH-CXL-${String(chqNo).replace(/\W/g, "")}-${Date.now().toString().slice(-4)}`,
        voucher_type: "Journal Voucher",
        date: receiptDate,
        name: `PDC Cheque #${chqNo} Cancellation on Cash Settlement (${pdc.tenant_name || "Tenant"})`,
        debit: "Customer(PDC) - Unit Account",
        debit_code: "21400",
        credit: "PDC In Hand",
        credit_code: "12900",
        amount: originalAmt,
        method: "Reversal",
      } as any);

      // 4. Generate Official Receipt
      const receipt: TenantReceiptDetails = {
        receiptNo: `CASH-${chqNo}-${Date.now().toString().slice(-4)}`,
        acknowledgementNo: `ACK-CASH-${chqNo}`,
        date: receiptDate,
        tenantName: pdc.tenant_name && pdc.tenant_name !== "—" ? pdc.tenant_name : "Valued Tenant",
        propertyName: pdc.property_name && pdc.property_name !== "—" ? pdc.property_name : "Property",
        unitRef: pdc.unit_ref && pdc.unit_ref !== "—" ? pdc.unit_ref : "Unit",
        leaseStartDate: pdc.lease_start || receiptDate,
        leaseEndDate: pdc.lease_end || receiptDate,
        monthlyRent: confirmedAmt,
        totalContractRent: confirmedAmt,
        depositAmount: 0,
        depositMode: "Cash",
        pdcCount: 1,
        pdcs: [{
          chequeNo: chqNo,
          bank: pdc.bank_name || "Cash Replacement",
          date: pdc.cheque_date,
          amount: confirmedAmt,
          period: "Cash in place of PDC",
          tenureStart: pdc.lease_start || receiptDate,
          tenureEnd: pdc.lease_end || receiptDate
        }],
        totalCollected: confirmedAmt,
        cashierName: cashCollectorName || "Finance Department",
        notes: `CASH IN LIEU OF CHEQUE: Received QAR ${confirmedAmt.toLocaleString()} in cash for Cheque #${chqNo}.${discrepancy !== 0 ? ` Note: Amount confirmed differs from original cheque amount (Original: QAR ${originalAmt.toLocaleString()}).` : ''} Physical cheque returned. GL: DR 12000 Bank / CR 12100 Cash.${cashNotes ? ` Remarks: ${cashNotes}` : ''}`,
      };

      setReceiptData(receipt);
      setReceiptOpen(true);
      toast.success(`Cash settlement of QAR ${confirmedAmt.toLocaleString()} recorded for Cheque #${chqNo}. Database & GL updated.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to process cash replacement.");
    } finally {
      setActionLoading(false);
      setCashPdc(null);
    }
  }

  // ── Add PDC to Database Handler ────────────────────────────────────────────
  async function handleAddPdc() {
    const { chequeNo, bank, amount, chequeDate, leaseId } = addPdcForm;
    if (!chequeNo || !amount || !chequeDate) {
      toast.error("Please fill in Cheque Number, Amount, and Cheque Date.");
      return;
    }

    const lease = leases.find(l => l.id === leaseId);
    const amt = parseFloat(amount) || 0;
    const prop = lease?.property || addPdcForm.propertyName || "Old Salata - Residence No:23";
    const unit = lease?.unit || addPdcForm.unitRef || "Unit";
    const tenant = lease?.tenantName || addPdcForm.tenantName || "Valued Tenant";

    setAddPdcLoading(true);
    try {
      // 1. Persist directly to DB using receivePdc
      await receivePdc({
        cheque_number: chequeNo,
        cheque_date: chequeDate,
        amount: amt,
        tenant_id: lease?.customerId ? Number(lease.customerId) : 1,
        property_id: 1,
        unit_id: 1,
        unitCode: unit,
      });

      // 2. Also register in shared context
      setSharedPdcs(prev => [
        {
          id: `pdc-${Date.now()}`,
          leaseId: leaseId || "l1",
          chequeNo,
          bank,
          date: chequeDate,
          amount: amt,
          status: "received",
        },
        ...prev,
      ]);

      toast.success(`PDC #${chequeNo} registered and saved to database!`);
      setAddPdcOpen(false);
      setAddPdcForm({
        chequeNo: "",
        bank: "Qatar National Bank (QNB)",
        amount: "5000",
        chequeDate: new Date().toISOString().split("T")[0],
        leaseId: "",
        propertyName: "",
        unitRef: "",
        tenantName: "",
      });
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to save PDC to database.");
    } finally {
      setAddPdcLoading(false);
    }
  }

  // ── View Receipt ───────────────────────────────────────────────────────────
  function handleViewReceipt(pdc: any) {
    const details: TenantReceiptDetails = {
      receiptNo: `REC-PDC-${String(pdc.id).slice(-4)}`,
      acknowledgementNo: `PDC-ACK-${pdc.cheque_number}`,
      date: pdc.cheque_date || new Date().toISOString().split("T")[0],
      tenantName: pdc.tenant_name && pdc.tenant_name !== "—" ? pdc.tenant_name : "Valued Tenant",
      propertyName: pdc.property_name && pdc.property_name !== "—" ? pdc.property_name : "Property",
      unitRef: pdc.unit_ref && pdc.unit_ref !== "—" ? pdc.unit_ref : "Unit",
      leaseStartDate: pdc.lease_start || pdc.cheque_date,
      leaseEndDate: pdc.lease_end || pdc.cheque_date,
      monthlyRent: Number(pdc.monthly_rent || pdc.amount) || 0,
      totalContractRent: (Number(pdc.monthly_rent || pdc.amount) * 12) || Number(pdc.amount) || 0,
      depositAmount: 0,
      depositMode: "PDC",
      pdcCount: 1,
      pdcs: [{
        chequeNo: pdc.cheque_number,
        bank: pdc.bank_name || "Bank",
        date: pdc.cheque_date,
        amount: Number(pdc.amount) || 0,
        period: pdc.period || (pdc.lease_start && pdc.lease_end ? `${pdc.lease_start} to ${pdc.lease_end}` : "Rent Instalment"),
        tenureStart: pdc.lease_start || pdc.cheque_date,
        tenureEnd: pdc.lease_end || pdc.cheque_date,
      }],
      totalCollected: Number(pdc.amount) || 0,
      cashierName: "Finance Department",
      notes: `Official acknowledgment for PDC ${pdc.cheque_number} status: ${pdc.status}.`,
    };
    setReceiptData(details);
    setReceiptOpen(true);
  }

  // ── Export to CSV ──────────────────────────────────────────────────────────
  function handleExportCsv() {
    const headers = ["Entry Date", "Cheque Date", "Cheque No", "Bank", "Property", "Unit", "Customer Name", "Amount (QAR)", "Status"];
    const rows = filteredPdcs.map(p => [
      p.entry_date || p.cheque_date,
      p.cheque_date,
      p.cheque_number,
      `"${p.bank_name || ""}"`,
      `"${p.property_name || ""}"`,
      `"${p.unit_ref || ""}"`,
      `"${p.tenant_name || ""}"`,
      p.amount,
      p.status,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pdc_register_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("PDC Register exported to CSV");
  }

  // Reset all filters
  function resetFilters() {
    setSelectedProperty("all");
    setSelectedUnit("all");
    setSelectedCustomer("all");
    setSelectedMonth("all");
    setFromDate("");
    setToDate("");
    setSearchQuery("");
    setStatusFilter("all");
    setSortField("cheque_date");
    setSortAsc(false);
    setPage(1);
    toast.info("All PDC filters reset to default");
  }

  const glConfig = pendingActionPdc && pendingAction
    ? getActionConfig(pendingAction, pendingActionPdc.cheque_number || "", pendingActionPdc.tenant_name || "Tenant", Number(pendingActionPdc.amount) || 0)
    : null;

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Landmark className="h-5 w-5 text-primary" />
              PDC Register &amp; Management
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Track collected cheques, filter by Property, Unit, Date, Month and Customer (Ascending order), manage bank deposits, clearances, returns, and voluntary cancellations with real-time DB persistence.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {actionLoading && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin text-amber-600" /> Syncing DB &amp; GL...
              </span>
            )}
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={handleExportCsv}>
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => load()}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
            <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => setAddPdcOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Register PDC
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ── MULTI-DIMENSIONAL FILTER BAR (Property, Unit, Customer, Month, Date) ── */}
          <div className="rounded-xl border bg-muted/25 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Multi-Dimensional Filter Bar (Ascending Order)
                </span>
              </div>
              <Button size="sm" variant="ghost" className="h-6 text-xs text-muted-foreground hover:text-primary px-2" onClick={resetFilters}>
                Reset All Filters
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {/* 1. Property Filter (Ascending) */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Building className="h-3 w-3" /> Property
                </Label>
                <Select value={selectedProperty} onValueChange={(v) => { setSelectedProperty(v); setSelectedUnit("all"); setPage(1); }}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties ({propertyOptions.length})</SelectItem>
                    {propertyOptions.map((prop) => (
                      <SelectItem key={prop} value={prop}>{prop}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2. Unit Filter (Ascending) */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Home className="h-3 w-3" /> Unit
                </Label>
                <Select value={selectedUnit} onValueChange={(v) => { setSelectedUnit(v); setPage(1); }}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="All Units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units ({unitOptions.length})</SelectItem>
                    {unitOptions.map((u) => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 3. Customer / Tenant Name Filter (Ascending) */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <User className="h-3 w-3" /> Customer Name
                </Label>
                <Select value={selectedCustomer} onValueChange={(v) => { setSelectedCustomer(v); setPage(1); }}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="All Customers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Customers ({customerOptions.length})</SelectItem>
                    {customerOptions.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 4. Month Filter (Ascending Chronological) */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Maturity Month
                </Label>
                <Select value={selectedMonth} onValueChange={(v) => { setSelectedMonth(v); setPage(1); }}>
                  <SelectTrigger className="h-8 text-xs bg-background font-mono">
                    <SelectValue placeholder="All Months" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Maturity Months</SelectItem>
                    {monthOptions.map((m) => {
                      const [y, mm] = m.split("-");
                      const monthName = new Date(Number(y), Number(mm) - 1, 1).toLocaleString("default", { month: "short", year: "numeric" });
                      return (
                        <SelectItem key={m} value={m} className="font-mono text-xs">
                          {monthName} ({m})
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* 5. Status Filter */}
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> PDC Status
                </Label>
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses ({pdcs.length})</SelectItem>
                    <SelectItem value="due">Due / In Hand ({pdcs.filter(p => p.status === "In Hand" || p.status === "Returned").length})</SelectItem>
                    <SelectItem value="posted">Posted / Banking ({pdcs.filter(p => p.status === "Deposited" || p.status === "Cleared").length})</SelectItem>
                    <SelectItem value="In Hand">In Hand</SelectItem>
                    <SelectItem value="Deposited">Deposited to Bank</SelectItem>
                    <SelectItem value="Cleared">Cleared</SelectItem>
                    <SelectItem value="Returned">Returned / Bounced</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Replaced">Replaced with Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sub-row: Date Range & Search & Sort Order */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
              <div className="sm:col-span-4 relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="pl-8 h-8 text-xs bg-background"
                  placeholder="Search cheque #, bank, customer, property, unit..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                />
              </div>

              <div className="sm:col-span-3 flex items-center gap-1.5">
                <Label className="text-[11px] text-muted-foreground whitespace-nowrap">From Date:</Label>
                <Input
                  type="date"
                  className="h-8 text-xs bg-background"
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                />
              </div>

              <div className="sm:col-span-3 flex items-center gap-1.5">
                <Label className="text-[11px] text-muted-foreground whitespace-nowrap">To Date:</Label>
                <Input
                  type="date"
                  className="h-8 text-xs bg-background"
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-1.5 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs w-full gap-1"
                  onClick={() => setSortAsc(!sortAsc)}
                  title="Toggle Ascending / Descending order"
                >
                  <ArrowUpDown className="h-3 w-3" /> {sortAsc ? "Sort: Ascending ↑" : "Sort: Descending ↓"}
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Status Summary Banner */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-muted-foreground">
              Showing <strong className="text-foreground">{filteredPdcs.length}</strong> of {pdcs.length} cheques
              {selectedProperty !== "all" ? ` • Property: ${selectedProperty}` : ""}
              {selectedUnit !== "all" ? ` • Unit: ${selectedUnit}` : ""}
              {selectedCustomer !== "all" ? ` • Customer: ${selectedCustomer}` : ""}
              {selectedMonth !== "all" ? ` • Month: ${selectedMonth}` : ""}
            </span>
            <span className="font-mono">
              Filtered Total: <strong className="text-emerald-600 font-bold">QR {totalFilteredAmount.toLocaleString()}</strong>
            </span>
          </div>

          {/* ── PDC DATA TABLE ───────────────────────────────────────────────── */}
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-muted-foreground gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading PDC register from database...
            </div>
          ) : (
            <>
              <div className="border rounded-lg overflow-hidden bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 text-xs">
                      <TableHead className="font-bold cursor-pointer" onClick={() => { setSortField("cheque_date"); setSortAsc(!sortAsc); }}>
                        Cheque Date {sortField === "cheque_date" && (sortAsc ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="font-bold cursor-pointer" onClick={() => { setSortField("cheque_number"); setSortAsc(!sortAsc); }}>
                        Cheque No. {sortField === "cheque_number" && (sortAsc ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="font-bold">Bank</TableHead>
                      <TableHead className="font-bold">Property</TableHead>
                      <TableHead className="font-bold">Unit</TableHead>
                      <TableHead className="font-bold cursor-pointer" onClick={() => { setSortField("tenant_name"); setSortAsc(!sortAsc); }}>
                        Customer / Tenant {sortField === "tenant_name" && (sortAsc ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="text-right font-bold cursor-pointer" onClick={() => { setSortField("amount"); setSortAsc(!sortAsc); }}>
                        Amount (QAR) {sortField === "amount" && (sortAsc ? "↑" : "↓")}
                      </TableHead>
                      <TableHead className="font-bold text-center">Status</TableHead>
                      <TableHead className="font-bold text-center">Actions &amp; GL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-10 text-muted-foreground text-xs">
                          No post-dated cheques match the active Property, Unit, Date, Month, or Customer filter criteria.
                        </TableCell>
                      </TableRow>
                    )}
                    {paginated.map((pdc) => (
                      <TableRow key={pdc.id} className="hover:bg-muted/30 text-xs">
                        <TableCell className="font-mono text-xs font-semibold">{pdc.cheque_date}</TableCell>
                        <TableCell className="font-mono font-bold text-xs text-primary">{pdc.cheque_number}</TableCell>
                        <TableCell className="text-xs">{pdc.bank_name || "—"}</TableCell>
                        <TableCell className="text-xs">{pdc.property_name || "—"}</TableCell>
                        <TableCell className="text-xs font-mono font-medium">{pdc.unit_ref || "—"}</TableCell>
                        <TableCell className="text-xs font-medium">{pdc.tenant_name || "—"}</TableCell>
                        <TableCell className="text-right font-bold font-mono text-xs">{Number(pdc.amount).toLocaleString()}</TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              pdc.status === "In Hand" ? "default" :
                              pdc.status === "Deposited" ? "secondary" :
                              pdc.status === "Cleared" ? "outline" :
                              "destructive"
                            }
                            className={`text-[11px] capitalize ${
                              pdc.status === "Cleared" ? "bg-emerald-500/15 text-emerald-700 border-emerald-300 font-semibold" :
                              pdc.status === "Returned" ? "bg-red-500/15 text-red-700 border-red-300 font-semibold" :
                              pdc.status === "Deposited" ? "bg-blue-500/15 text-blue-700 border-blue-300 font-semibold" :
                              pdc.status === "Cancelled" ? "bg-gray-400/20 text-gray-700 border-gray-300 font-semibold" :
                              pdc.status === "Replaced" ? "bg-purple-500/15 text-purple-700 border-purple-300 font-semibold" :
                              ""
                            }`}
                          >
                            {pdc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <Button size="sm" variant="ghost" className="h-6 text-xs text-primary gap-1 px-1.5" onClick={() => handleViewReceipt(pdc)}>
                              <Receipt className="h-3 w-3" /> Receipt
                            </Button>

                            {/* In Hand actions */}
                            {pdc.status === "In Hand" && (
                              <>
                                <Button size="sm" className="h-6 text-xs px-2" onClick={() => openGlConfirm(pdc, "deposit")}>
                                  Deposit
                                </Button>
                                <Button size="sm" variant="outline" className="h-6 text-xs px-2 border-rose-300 text-rose-700 hover:bg-rose-50" onClick={() => openGlConfirm(pdc, "cancel")}>
                                  <XCircle className="h-3 w-3 mr-1" /> Cancel
                                </Button>
                                <Button size="sm" variant="outline" className="h-6 text-xs px-2 border-purple-300 text-purple-700 hover:bg-purple-50" onClick={() => openCashModal(pdc)}>
                                  <Banknote className="h-3 w-3 mr-1" /> Cash
                                </Button>
                              </>
                            )}

                            {/* Deposited actions */}
                            {pdc.status === "Deposited" && (
                              <>
                                <Button size="sm" variant="outline" className="h-6 text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-2" onClick={() => openGlConfirm(pdc, "clear")}>
                                  Clear
                                </Button>
                                <Button size="sm" variant="destructive" className="h-6 text-xs px-2" onClick={() => openGlConfirm(pdc, "return")}>
                                  Return
                                </Button>
                              </>
                            )}

                            {/* Returned actions */}
                            {pdc.status === "Returned" && (
                              <>
                                <Button size="sm" variant="outline" className="h-6 text-xs border-blue-500 text-blue-600 hover:bg-blue-50 px-2" onClick={() => openGlConfirm(pdc, "deposit")}>
                                  Re-Deposit
                                </Button>
                                <Button size="sm" variant="outline" className="h-6 text-xs border-purple-300 text-purple-700 hover:bg-purple-50 px-2" onClick={() => openCashModal(pdc)}>
                                  <Banknote className="h-3 w-3 mr-1" /> Cash
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
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

      {/* ── REGISTER NEW PDC MODAL ─────────────────────────────────────────── */}
      <Dialog open={addPdcOpen} onOpenChange={setAddPdcOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Register Post-Dated Cheque (PDC)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Registers a new PDC in the database and creates initial GL entry (DR 12900 PDC In Hand / CR 21400 Customer PDC Liability).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label>Lease / Tenant Agreement</Label>
              <Select
                value={addPdcForm.leaseId}
                onValueChange={(v) => {
                  const lease = leases.find(l => l.id === v);
                  setAddPdcForm(f => ({
                    ...f,
                    leaseId: v,
                    propertyName: lease?.property || "",
                    unitRef: lease?.unit || "",
                    tenantName: lease?.tenantName || "",
                    amount: String(lease?.monthlyRent || f.amount),
                  }));
                }}
              >
                <SelectTrigger className="h-8 text-xs bg-background">
                  <SelectValue placeholder="Select lease" />
                </SelectTrigger>
                <SelectContent>
                  {leases.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.tenantName} — {l.unit} ({l.property}) • QR {l.monthlyRent?.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Cheque Number <span className="text-destructive">*</span></Label>
                <Input
                  className="h-8 text-xs font-mono"
                  placeholder="e.g. QNB-990142"
                  value={addPdcForm.chequeNo}
                  onChange={(e) => setAddPdcForm({ ...addPdcForm, chequeNo: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Maturity / Cheque Date <span className="text-destructive">*</span></Label>
                <Input
                  type="date"
                  className="h-8 text-xs"
                  value={addPdcForm.chequeDate}
                  onChange={(e) => setAddPdcForm({ ...addPdcForm, chequeDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Bank Name</Label>
                <Input
                  className="h-8 text-xs"
                  value={addPdcForm.bank}
                  onChange={(e) => setAddPdcForm({ ...addPdcForm, bank: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Amount (QAR) <span className="text-destructive">*</span></Label>
                <Input
                  type="number"
                  className="h-8 text-xs font-mono"
                  value={addPdcForm.amount}
                  onChange={(e) => setAddPdcForm({ ...addPdcForm, amount: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddPdcOpen(false)} disabled={addPdcLoading}>Cancel</Button>
            <Button onClick={handleAddPdc} disabled={addPdcLoading || !addPdcForm.chequeNo || !addPdcForm.amount}>
              {addPdcLoading ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Saving to DB…</> : "Save PDC & Post GL"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── CASH REPLACEMENT & SETTLEMENT CONFIRMATION MODAL (2-STEP STEPPER) ───────────── */}
      <Dialog open={cashModalOpen} onOpenChange={setCashModalOpen}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Banknote className="h-5 w-5 text-purple-600" />
              Cash Settlement in Place of Cheque
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {cashStep === 1
                ? "Step 1 of 2: Verify tenant details and enter the confirmed cash collected."
                : "Step 2 of 2: Review double-entry accounting impact for cash receipt & cheque cancellation."}
            </DialogDescription>
          </DialogHeader>

          {/* Stepper Tabs Bar */}
          <div className="flex items-center gap-2 border-b pb-2 text-xs">
            <button
              type="button"
              onClick={() => setCashStep(1)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
                cashStep === 1
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="h-4 w-4 rounded-full bg-background/20 text-[10px] flex items-center justify-center font-bold">1</span>
              Collection Details
            </button>
            <button
              type="button"
              onClick={() => {
                if (cashAmount && parseFloat(cashAmount) > 0) setCashStep(2);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
                cashStep === 2
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <span className="h-4 w-4 rounded-full bg-background/20 text-[10px] flex items-center justify-center font-bold">2</span>
              GL &amp; Sub-Ledger Impact
            </button>
          </div>

          {cashPdc && (
            <div className="space-y-3.5 py-1 text-xs">
              {/* STEP 1: Collection details */}
              {cashStep === 1 && (
                <div className="space-y-3">
                  {/* Cheque Summary Card */}
                  <div className="rounded-lg border bg-muted/40 p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Cheque Number:</span>
                      <span className="font-mono font-bold text-primary">{cashPdc.cheque_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Customer / Tenant:</span>
                      <span className="font-semibold text-foreground">{cashPdc.tenant_name || "Valued Tenant"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Property &amp; Unit:</span>
                      <span>{cashPdc.property_name || "—"} • {cashPdc.unit_ref || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Original Cheque Amount:</span>
                      <span className="font-mono font-bold text-foreground">QR {Number(cashPdc.amount || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Amount input with live discrepancy warning */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">
                        Actual Cash Received (QAR) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-8 text-xs font-mono font-bold"
                        placeholder="Enter cash received"
                        value={cashAmount}
                        onChange={(e) => setCashAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Settlement Date</Label>
                      <Input
                        type="date"
                        className="h-8 text-xs"
                        value={cashReceiptDate}
                        onChange={(e) => setCashReceiptDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Discrepancy indicator */}
                  {(() => {
                    const original = Number(cashPdc.amount || 0);
                    const actual = parseFloat(cashAmount) || 0;
                    const diff = actual - original;
                    if (diff === 0) {
                      return (
                        <div className="rounded-md border border-emerald-200 bg-emerald-50/70 p-2 text-[11px] text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <span>Amount matches original cheque exactly (QR {actual.toLocaleString()}).</span>
                        </div>
                      );
                    }
                    return (
                      <div className={`rounded-md border p-2 text-[11px] flex items-center gap-1.5 ${diff > 0 ? 'border-blue-200 bg-blue-50/70 text-blue-800' : 'border-amber-200 bg-amber-50/70 text-amber-800'}`}>
                        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                        <span>
                          {diff > 0
                            ? `Excess Cash: +QR ${diff.toLocaleString()} collected above cheque amount.`
                            : `Shortfall / Discount: QR ${Math.abs(diff).toLocaleString()} less than cheque amount.`}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Remarks and Cashier */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Cashier / Collected By</Label>
                      <Input
                        className="h-8 text-xs"
                        value={cashCollectorName}
                        onChange={(e) => setCashCollectorName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Remarks / Reason</Label>
                      <Input
                        className="h-8 text-xs"
                        placeholder="e.g. Cash received at counter, cheque returned"
                        value={cashNotes}
                        onChange={(e) => setCashNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Accounting & GL / SL Preview */}
              {cashStep === 2 && (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                  <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-3.5 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5 text-purple-600" />
                      General Ledger / Sub-Ledger (COA) Accounts Impacted
                    </div>

                    {/* 1. Cash Inflow Group */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Part 1: Cash Collection &amp; Bank Deposit
                      </div>
                      {/* Debit Card: Bank Operating Account */}
                      <div className="flex items-start gap-2.5 bg-background/95 rounded-lg px-3.5 py-2.5 border border-border/80 shadow-sm">
                        <div className="mt-0.5">
                          <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              Debit
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                              GL 12000
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              Bank Operating Account
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Cash received deposited into Bank Account (Dr Bank 12000)
                          </p>
                        </div>
                        <div className="text-xs font-mono font-bold tabular-nums text-foreground">
                          QAR {(parseFloat(cashAmount) || Number(cashPdc.amount || 0)).toLocaleString()}
                        </div>
                      </div>

                      {/* Credit Card: Cash In Hand */}
                      <div className="flex items-start gap-2.5 bg-background/95 rounded-lg px-3.5 py-2.5 border border-border/80 shadow-sm">
                        <div className="mt-0.5">
                          <ArrowDownLeft className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                              Credit
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                              GL 12100
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              Cash In Hand
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Cash holding settled / offset against replacement cheque
                          </p>
                        </div>
                        <div className="text-xs font-mono font-bold tabular-nums text-foreground">
                          QAR {(parseFloat(cashAmount) || Number(cashPdc.amount || 0)).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* 2. Cheque Cancellation Reversal Group */}
                    <div className="space-y-2 pt-1 border-t border-purple-200/60">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Part 2: Original Cheque Cancellation &amp; Liability Reversal
                      </div>
                      {/* Debit Card: Customer PDC Liability Reversal */}
                      <div className="flex items-start gap-2.5 bg-background/95 rounded-lg px-3.5 py-2.5 border border-border/80 shadow-sm">
                        <div className="mt-0.5">
                          <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              Debit
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                              GL 21400
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              Customer(PDC) - Unit Account
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Customer PDC liability reversed upon physical cheque return
                          </p>
                        </div>
                        <div className="text-xs font-mono font-bold tabular-nums text-foreground">
                          QAR {Number(cashPdc.amount || 0).toLocaleString()}
                        </div>
                      </div>

                      {/* Credit Card: PDC In Hand Reversal */}
                      <div className="flex items-start gap-2.5 bg-background/95 rounded-lg px-3.5 py-2.5 border border-border/80 shadow-sm">
                        <div className="mt-0.5">
                          <ArrowDownLeft className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                              Credit
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                              GL 12900
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              PDC In Hand
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            PDC In Hand holding account cleared
                          </p>
                        </div>
                        <div className="text-xs font-mono font-bold tabular-nums text-foreground">
                          QAR {Number(cashPdc.amount || 0).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-muted-foreground border-t border-border/50 pt-2">
                      All 4 double-entry lines will be posted simultaneously to General Ledger &amp; Sub-Ledgers to maintain balance integrity.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 border-t pt-2">
            <Button variant="outline" onClick={() => setCashModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            {cashStep === 1 ? (
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => setCashStep(2)}
                disabled={!cashAmount || parseFloat(cashAmount) <= 0}
              >
                Review Accounting Impact →
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setCashStep(1)} disabled={actionLoading}>
                  ← Back to Details
                </Button>
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={executeConfirmedCashReplacement}
                  disabled={actionLoading || !cashAmount || parseFloat(cashAmount) <= 0}
                >
                  {actionLoading ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Recording Cash &amp; GL…</> : "Confirm Cash & Post GL"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── GL CONFIRMATION MODAL ──────────────────────────────────────────── */}
      <GlConfirmModal
        open={glConfirmOpen}
        config={glConfig}
        amount={Number(pendingActionPdc?.amount) || 0}
        loading={actionLoading}
        cancelReason={cancelReason}
        onCancelReasonChange={setCancelReason}
        onConfirm={executeConfirmedAction}
        onCancel={() => { setGlConfirmOpen(false); setPendingActionPdc(null); setPendingAction(null); }}
      />

      <ReceiptModal open={receiptOpen} onOpenChange={setReceiptOpen} data={receiptData} />
    </div>
  );
}
