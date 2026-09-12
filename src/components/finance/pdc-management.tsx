import { useState, useEffect, useMemo } from "react";
import { useSearch } from "@tanstack/react-router";
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
import { collectSecurityDeposit } from "@/lib/finance/depositService";
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
    title: "Confirm PDC Cheque Return / Dishonour",
    description: `You are executing Cheque Return / Bounce for Cheque #${chequeNo} (${tenantName}) of ${fmtAmt}.`,
    icon: <RotateCcw className="h-5 w-5 text-red-600" />,
    color: "red",
    newStatus: "Returned",
    newSharedStatus: "bounced",
    impacts: [
      { type: "Debit",  account: "PDC In Hand",                  code: "12900", description: "Cheque physically returned to hand (Dr 12900)" },
      { type: "Credit", account: "Bank Account",                 code: "12000", description: "Bank Account clawback on dishonour (Cr 12000)" },
      { type: "Debit",  account: "Receivable - Unit Account",    code: "12413", description: "Tenant dues restored in Unit Account (Dr 12413)" },
      { type: "Credit", account: "Customer(PDC) - Unit Account", code: "21400", description: "Customer(PDC) liability reversed (Cr 21400)" },
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

const RECEIPT_HISTORY_STORAGE_KEY = "zyno-pdc-cash-receipts-v2";

function loadSavedReceiptHistory(): Record<string, TenantReceiptDetails[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(RECEIPT_HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveReceiptHistory(history: Record<string, TenantReceiptDetails[]>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RECEIPT_HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch { /* ignore */ }
}

// ── Main Component ────────────────────────────────────────────────────────────
export function PdcManagement() {
  const routeSearch = useSearch({ strict: false }) as { collect?: string };
  const { pdcs: sharedPdcs, setPdcs: setSharedPdcs, leases, units, customers } = useAppData();
  const { addCashBookEntry, addVoucher } = useFinanceStore();
  const [pdcs, setPdcs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<TenantReceiptDetails | null>(null);
  // Per-PDC receipt history: cheque_number -> list of TenantReceiptDetails (one per partial payment)
  const [receiptHistory, setReceiptHistory] = useState<Record<string, TenantReceiptDetails[]>>(loadSavedReceiptHistory);
  const [receiptHistoryOpen, setReceiptHistoryOpen] = useState(false);
  const [receiptHistoryPdc, setReceiptHistoryPdc] = useState<any | null>(null);
  const [receiptHistoryIndex, setReceiptHistoryIndex] = useState(0);

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
  type AddPdcRow = {
    id: string;
    chequeNo: string;
    bank: string;
    chequeDate: string;
    period: string;
    amount: string;
  };

  const [addPdcOpen, setAddPdcOpen] = useState(false);
  const [addPdcLoading, setAddPdcLoading] = useState(false);
  const [collectionType, setCollectionType] = useState<"PDC" | "Security Deposit" | "Other Amount">("PDC");
  const [otherCollectionAmount, setOtherCollectionAmount] = useState("");
  const [otherCollectionDescription, setOtherCollectionDescription] = useState("");
  const [selectedLeaseId, setSelectedLeaseId] = useState("");
  const [addPdcRows, setAddPdcRows] = useState<AddPdcRow[]>([
    {
      id: "1",
      chequeNo: "",
      bank: "Qatar National Bank (QNB)",
      chequeDate: new Date().toISOString().split("T")[0],
      period: "Rent Instalment",
      amount: "6500",
    }
  ]);
  const [genCount, setGenCount] = useState("12");
  const [genPrefix, setGenPrefix] = useState("PDC-Flat14-");
  const [genStartNo, setGenStartNo] = useState("1");
  const [genStartDate, setGenStartDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    if (routeSearch.collect === "1") setAddPdcOpen(true);
  }, [routeSearch.collect]);


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

  // Load data from DB & context smoothly on mount and subscribe to realtime DB updates
  useEffect(() => {
    load(true);
    const channel = supabase
      .channel("pdc-management:live")
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "fin_pdc_register" },
        () => { load(false); }
      )
      .on(
        "postgres_changes" as any,
        { event: "UPDATE", schema: "public", table: "pdcs" },
        () => { load(false); }
      )
      .on(
        "postgres_changes" as any,
        { event: "INSERT", schema: "public", table: "pdcs" },
        () => { load(false); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function load(showLoading = true) {
    if (showLoading && pdcs.length === 0) {
      setLoading(true);
    }
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
              (rawStatus === "partial cash" || rawStatus === "partial_cash") ? "Partial Cash" :
              "In Hand";

            return {
              ...p,
              paid_amount: (p as any).paid_amount != null ? Number((p as any).paid_amount) : undefined,
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
              (rawStatus === "partial cash" || rawStatus === "partial_cash") ? "Partial Cash" :
              "In Hand";

            return {
              id: p.id,
              entry_date: p.created_at ? p.created_at.split("T")[0] : "2026-08-01",
              cheque_date: p.maturity_date || p.deposit_date || (p.created_at ? p.created_at.split("T")[0] : "2026-08-01"),
              cheque_number: p.cheque_number,
              amount: Number(p.amount) || 0,
              paid_amount: (p as any).paid_amount != null ? Number((p as any).paid_amount) : undefined,
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
          const isFinalStatus = (s: string) => s === "Cleared" || s === "Returned" || s === "Replaced" || s === "Cancelled" || s === "Partial Cash";
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
            paid_amount: p.paid_amount ?? existing.paid_amount,
            status: finalStatus,
          });
        } else {
          dbDataMap.set(key, p);
        }
      }

      const contextPdcs = (sharedPdcs || []).map((p, idx) => {
        const lease = leases?.find((l) => l.id === p.leaseId);
        const rawStatus = (p.status || "").trim().toLowerCase();
        const normalizedStatus =
          rawStatus === "deposited" ? "Deposited" :
          rawStatus === "cleared" ? "Cleared" :
          (rawStatus === "bounced" || rawStatus === "returned") ? "Returned" :
          rawStatus === "cancelled" ? "Cancelled" :
          rawStatus === "replaced" ? "Replaced" :
          (rawStatus === "partial cash" || rawStatus === "partial_cash") ? "Partial Cash" :
          "In Hand";

        return {
          id: p.id || `ctx-pdc-${idx}`,
          leaseId: p.leaseId,
          entry_date: (p as any).entry_date || lease?.startDate || p.date || "2026-08-01",
          cheque_date: p.date,
          cheque_number: p.chequeNo,
          amount: Number(p.amount) || 0,
          paid_amount: (p as any).paid_amount != null ? Number((p as any).paid_amount) : undefined,
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

      // Merge contextPdcs into dbDataMap so recorded cash settlements in context are retained
      for (const cp of contextPdcs) {
        const key = cp.cheque_number ? String(cp.cheque_number) : String(cp.id);
        const existing = dbDataMap.get(key);
        if (existing) {
          if (cp.paid_amount != null && (existing.paid_amount == null || cp.paid_amount > existing.paid_amount)) {
            existing.paid_amount = cp.paid_amount;
          }
          if (cp.status === "Partial Cash" || cp.status === "Replaced") {
            existing.status = cp.status;
          }
          dbDataMap.set(key, existing);
        } else {
          dbDataMap.set(key, cp);
        }
      }

      // If a lease is closed / vacated, all unpresented future PDCs beyond the vacate date are Returned
      for (const p of dbDataMap.values()) {
        const lease = leases?.find((l) => l.id === p.lease_id || l.tenantName === p.tenant_name || l.unit === p.unit_ref);
        if (lease && (lease.status === "closed" || (lease as any).earlyVacate)) {
          const vacateDate = (lease as any).actualVacateDate || (lease as any).moveOutDate || lease.endDate;
          if (vacateDate && p.cheque_date && new Date(p.cheque_date).getTime() > new Date(vacateDate).getTime()) {
            if (p.status === "In Hand" || p.status === "Deposited") {
              p.status = "Returned";
            }
          }
        }
      }

      const allPdcs = Array.from(dbDataMap.values());
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

      // 3. Immediately reflect in local FinanceStore vouchers so General Ledger updates without waiting for network/socket
      const today = new Date().toISOString().split("T")[0];
      const tenant = pdc.tenant_name || "Tenant";
      const unit = pdc.unit_ref || "Unit";
      const prop = pdc.property_name || "Property";

      if (action === "deposit") {
        addVoucher({
          voucher_no: `VCH-DEP-${chqNo}`,
          voucher_type: "Receipt Voucher",
          date: today,
          name: `PDC Deposited to Bank – ${chqNo} (${tenant} - ${unit})`,
          debit: "Bank Operating Account",
          debit_code: "12000",
          credit: "PDC In Hand",
          credit_code: "12900",
          amount: amt,
          method: "Cheque Deposit",
          property_name: prop,
          unit_ref: unit,
          tenant_name: tenant,
        });
      } else if (action === "clear") {
        // If the cheque was still "In Hand", clearPdc auto-runs deposit first.
        // Mirror both GL legs in FinanceStore so reports update immediately.
        const wasInHand = (pdc.status || "").toLowerCase() === "in hand" || (pdc.status || "") === "In Hand";
        if (wasInHand) {
          addVoucher({
            voucher_no: `VCH-DEP-${chqNo}`,
            voucher_type: "Receipt Voucher",
            date: today,
            name: `PDC Deposited to Bank (auto) – ${chqNo} (${tenant} - ${unit})`,
            debit: "Bank Operating Account",
            debit_code: "12000",
            credit: "PDC In Hand",
            credit_code: "12900",
            amount: amt,
            method: "Cheque Deposit",
            property_name: prop,
            unit_ref: unit,
            tenant_name: tenant,
          });
        }
        addVoucher({
          voucher_no: `VCH-CLR-${chqNo}`,
          voucher_type: "Journal Voucher",
          date: today,
          name: `PDC Cleared – ${chqNo} (${tenant} - ${unit})`,
          debit: "Customer(PDC) - Unit Account",
          debit_code: "21400",
          credit: "Receivable - Unit Account",
          credit_code: "12413",
          amount: amt,
          method: "Cheque Clearance",
          property_name: prop,
          unit_ref: unit,
          tenant_name: tenant,
        });
      } else if (action === "return") {
        addVoucher({
          voucher_no: `VCH-RET-${chqNo}`,
          voucher_type: "Journal Voucher",
          date: today,
          name: `PDC Cheque Returned / Dishonoured – ${chqNo} (${tenant} - ${unit})`,
          debit: "PDC In Hand",
          debit_code: "12900",
          credit: "Bank Operating Account",
          credit_code: "12000",
          amount: amt,
          method: "Cheque Return",
          property_name: prop,
          unit_ref: unit,
          tenant_name: tenant,
        });
        addVoucher({
          voucher_no: `VCH-RET-AR-${chqNo}`,
          voucher_type: "Journal Voucher",
          date: today,
          name: `Tenant Dues Restored on Dishonour – ${chqNo} (${tenant} - ${unit})`,
          debit: "Tenant Receivables",
          debit_code: "12413",
          credit: "Customer PDC Liability",
          credit_code: "21400",
          amount: amt,
          method: "Cheque Return",
          property_name: prop,
          unit_ref: unit,
          tenant_name: tenant,
        });
      } else if (action === "cancel") {
        addVoucher({
          voucher_no: `VCH-CNL-${chqNo}`,
          voucher_type: "Journal Voucher",
          date: today,
          name: `PDC Cancelled – ${chqNo} (${tenant} - ${unit}) [${cancelReason}]`,
          debit: "Customer PDC Liability",
          debit_code: "21400",
          credit: "PDC In Hand",
          credit_code: "12900",
          amount: amt,
          method: "Cancellation",
          property_name: prop,
          unit_ref: unit,
          tenant_name: tenant,
        });
      }

      toast.success(`Cheque #${chqNo} marked as ${config.newStatus}. Database & GL updated.`);
      await new Promise(r => setTimeout(r, 400));
    } catch (e: any) {
      toast.error(e.message || "Action failed. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  // ── Open Cash Replacement Confirmation Modal ──────────────────────────────
  function openCashModal(pdc: any) {
    const original = Number(pdc.amount || 0);
    const paid = Number(pdc.paid_amount || 0);
    const remaining = Math.max(0, original - paid);

    setCashPdc(pdc);
    setCashStep(1);
    setCashAmount(String(remaining > 0 ? remaining : original));
    setCashReceiptDate(new Date().toISOString().split("T")[0]);
    setCashNotes("");
    setCashCollectorName("Finance Department");
    setCashModalOpen(true);
  }

  // ── View Receipt or Multi-Receipt History ──────────────────────────────────
  function handleViewReceipt(pdc: any) {
    const chqNo = String(pdc.cheque_number || pdc.id);
    const history = receiptHistory[chqNo] || [];

    // If there is recorded partial/cash payment history, open the multi-receipt viewer
    if (history.length > 0 || pdc.status === "Partial Cash" || (pdc.paid_amount && pdc.paid_amount > 0)) {
      setReceiptHistoryPdc(pdc);
      setReceiptHistoryIndex(Math.max(0, history.length - 1));
      setReceiptHistoryOpen(true);
      return;
    }

    // Otherwise generate and display the standard single receipt for this PDC
    const receipt: TenantReceiptDetails = {
      receiptNo: `REC-PDC-${chqNo}`,
      acknowledgementNo: `ACK-${chqNo}`,
      date: pdc.cheque_date || new Date().toISOString().split("T")[0],
      tenantName: pdc.tenant_name && pdc.tenant_name !== "—" ? pdc.tenant_name : "Valued Tenant",
      propertyName: pdc.property_name && pdc.property_name !== "—" ? pdc.property_name : "Property",
      unitRef: pdc.unit_ref && pdc.unit_ref !== "—" ? pdc.unit_ref : "Unit",
      leaseStartDate: pdc.lease_start || pdc.cheque_date,
      leaseEndDate: pdc.lease_end || pdc.cheque_date,
      monthlyRent: Number(pdc.amount) || 0,
      totalContractRent: Number(pdc.amount) || 0,
      depositAmount: 0,
      depositMode: pdc.status === "Partial Cash" ? "Partial Cash" : pdc.status === "Replaced" ? "Cash Replacement" : "Post-Dated Cheque",
      pdcCount: 1,
      pdcs: [{
        chequeNo: chqNo,
        bank: pdc.bank_name || "Bank",
        date: pdc.cheque_date,
        amount: Number(pdc.amount) || 0,
        period: `PDC Cheque #${chqNo} (${pdc.status})`,
        tenureStart: pdc.lease_start,
        tenureEnd: pdc.lease_end,
      }],
      totalCollected: pdc.paid_amount != null && pdc.paid_amount > 0 ? Number(pdc.paid_amount) : Number(pdc.amount) || 0,
      cashierName: "Finance Department",
      notes: `PDC Record: Cheque #${chqNo} (${pdc.status}) for ${pdc.tenant_name || 'Tenant'} - Unit ${pdc.unit_ref || 'Unit'}. Amount: QAR ${Number(pdc.amount).toLocaleString()}.`,
    };

    setReceiptData(receipt);
    setReceiptOpen(true);
  }

  // ── Execute Confirmed Cash Replacement & Update DB + GL ────────────────────
  async function executeConfirmedCashReplacement() {
    if (!cashPdc) return;
    const pdc = cashPdc;
    const chqNo = pdc.cheque_number || pdc.id;
    const originalAmt = Number(pdc.amount) || 0;
    const alreadyPaid = Number(pdc.paid_amount) || 0;
    const confirmedAmt = parseFloat(cashAmount) || Math.max(0, originalAmt - alreadyPaid);
    const newPaidTotal = alreadyPaid + confirmedAmt;
    const isFullyPaid = newPaidTotal >= originalAmt - 0.01;
    const nextStatus = isFullyPaid ? "Replaced" : "Partial Cash";
    const receiptDate = cashReceiptDate || new Date().toISOString().split("T")[0];
    const remainingAfter = Math.max(0, originalAmt - newPaidTotal);

    setCashModalOpen(false);
    setActionLoading(true);

    try {
      // 1. Persist to DB using cashDepositInPlaceOfPdc (posts double entry and cancels cheque custody)
      await cashDepositInPlaceOfPdc(pdc.id, String(chqNo), confirmedAmt, cashNotes, receiptDate, cashCollectorName);

      // 2. Update local state and shared context after successful persistence
      setPdcs(prev => prev.map(p =>
        (String(p.id) === String(pdc.id) || String(p.cheque_number) === String(chqNo))
          ? { ...p, status: nextStatus, paid_amount: newPaidTotal }
          : p
      ));

      setSharedPdcs(prev => prev.map(p =>
        (String(p.id) === String(pdc.id) || String((p as any).chequeNo) === String(chqNo))
          ? { ...p, status: isFullyPaid ? "replaced" : "partial_cash" as any, paid_amount: newPaidTotal }
          : p
      ));

      // Update Sub-Ledger: Cash Book entry
      addCashBookEntry({
        date: receiptDate,
        voucher: `CSH-CHQ-${chqNo}`,
        description: `Cash Rent ${isFullyPaid ? "Settlement" : "Partial Payment"} (Cheque #${chqNo} - ${pdc.tenant_name || "Tenant"})`,
        type: "in",
        amount: confirmedAmt,
      });

      // Update Finance vouchers so General Ledger reflects cash receipt and PDC return immediately
      addVoucher({
        voucher_no: `VCH-CSH-${chqNo}`,
        voucher_type: "Receipt Voucher",
        date: receiptDate,
        name: `Cash Collected in Place of PDC – ${chqNo} (${pdc.tenant_name || "Tenant"} - ${pdc.unit_ref || "Unit"})`,
        debit: "Cash In Hand",
        debit_code: "12100",
        credit: "Tenant Receivables",
        credit_code: "12413",
        amount: confirmedAmt,
        method: "Cash",
        property_name: pdc.property_name || "Property",
        unit_ref: pdc.unit_ref || "Unit",
        tenant_name: pdc.tenant_name || "Tenant",
      });

      addVoucher({
        voucher_no: `VCH-CSH-RET-${chqNo}`,
        voucher_type: "Journal Voucher",
        date: receiptDate,
        name: `PDC Cancelled / Returned on Cash Settlement – ${chqNo} (${pdc.tenant_name || "Tenant"} - ${pdc.unit_ref || "Unit"})`,
        debit: "Customer PDC Liability",
        debit_code: "21400",
        credit: "PDC In Hand",
        credit_code: "12900",
        amount: confirmedAmt,
        method: "Cash Settlement",
        property_name: pdc.property_name || "Property",
        unit_ref: pdc.unit_ref || "Unit",
        tenant_name: pdc.tenant_name || "Tenant",
      });

      // Part 3: Bank Account Deposit (Dr 12000 Bank Account / Cr 12100 Cash In Hand)
      addVoucher({
        voucher_no: `VCH-CSH-DEP-${chqNo}`,
        voucher_type: "Contra Voucher" as any,
        date: receiptDate,
        name: `Bank Deposit of Replaced PDC Cash Till – ${chqNo} (${pdc.tenant_name || "Tenant"} - ${pdc.unit_ref || "Unit"})`,
        debit: "Bank Operating Account",
        debit_code: "12000",
        credit: "Cash In Hand",
        credit_code: "12100",
        amount: confirmedAmt,
        method: "Bank Deposit",
        property_name: pdc.property_name || "Property",
        unit_ref: pdc.unit_ref || "Unit",
        tenant_name: pdc.tenant_name || "Tenant",
      });

      // 4. Generate Official Receipt with Installment Numbering
      const existingHistory = receiptHistory[chqNo] || [];
      const installmentNum = existingHistory.length + 1;
      const receiptNum = `CASH-${chqNo}-INS${installmentNum}`;

      const receipt: TenantReceiptDetails = {
        receiptNo: receiptNum,
        acknowledgementNo: `ACK-CASH-${chqNo}-${installmentNum}`,
        date: receiptDate,
        tenantName: pdc.tenant_name && pdc.tenant_name !== "—" ? pdc.tenant_name : "Valued Tenant",
        propertyName: pdc.property_name && pdc.property_name !== "—" ? pdc.property_name : "Property",
        unitRef: pdc.unit_ref && pdc.unit_ref !== "—" ? pdc.unit_ref : "Unit",
        leaseStartDate: pdc.lease_start || receiptDate,
        leaseEndDate: pdc.lease_end || receiptDate,
        monthlyRent: confirmedAmt,
        totalContractRent: originalAmt,
        depositAmount: 0,
        depositMode: isFullyPaid
          ? (installmentNum > 1 ? `Final Cash Settlement (Instalment #${installmentNum})` : "Full Cash Settlement")
          : `Partial Cash (Instalment #${installmentNum})`,
        pdcCount: 1,
        pdcs: [{
          chequeNo: String(chqNo),
          bank: pdc.bank_name || "Cash Replacement",
          date: pdc.cheque_date,
          amount: confirmedAmt,
          period: isFullyPaid
            ? `Final Cash Settlement (Instalment #${installmentNum}) of Cheque #${chqNo}`
            : `Cash Instalment #${installmentNum}: QAR ${confirmedAmt.toLocaleString()} (Total Paid: QAR ${newPaidTotal.toLocaleString()} / Remaining: QAR ${remainingAfter.toLocaleString()})`,
          tenureStart: pdc.lease_start || receiptDate,
          tenureEnd: pdc.lease_end || receiptDate
        }],
        totalCollected: confirmedAmt,
        cashierName: cashCollectorName || "Finance Department",
        notes: `CASH IN LIEU OF CHEQUE (Instalment #${installmentNum}): Received QAR ${confirmedAmt.toLocaleString()} in cash for Cheque #${chqNo}. Total Paid So Far: QAR ${newPaidTotal.toLocaleString()} | Remaining Balance Due: QAR ${remainingAfter.toLocaleString()}.${cashNotes ? ` Remarks: ${cashNotes}` : ''}`,
      };

      // Append receipt to persistent history for this PDC
      setReceiptHistory(prev => {
        const key = String(chqNo);
        const existing = prev[key] || [];
        const next = { ...prev, [key]: [...existing, receipt] };
        saveReceiptHistory(next);
        return next;
      });

      // Update multi-receipt viewer target and open receipt view
      setReceiptHistoryPdc({ ...pdc, status: nextStatus, paid_amount: newPaidTotal });
      setReceiptHistoryIndex(installmentNum - 1);
      setReceiptData(receipt);
      setReceiptHistoryOpen(true);

      toast.success(
        isFullyPaid
          ? `Cheque #${chqNo} fully settled in cash (QAR ${confirmedAmt.toLocaleString()}). Receipt #${receiptNum} generated.`
          : `Partial cash payment of QAR ${confirmedAmt.toLocaleString()} recorded for Cheque #${chqNo}. Receipt #${receiptNum} generated. Remaining due: QAR ${remainingAfter.toLocaleString()}.`
      );
      await new Promise(r => setTimeout(r, 400));
    } catch (e: any) {
      toast.error(e.message || "Failed to process cash replacement.");
    } finally {
      setActionLoading(false);
      setCashPdc(null);
    }
  }

  // ── Helper to Auto-Generate Batch PDC Rows ────────────────────────────────
  function handleGeneratePdcSchedule() {
    const count = parseInt(genCount) || 12;
    const startNum = parseInt(genStartNo) || 1;
    const lease = leases.find(l => l.id === selectedLeaseId);
    const rentAmt = String(lease?.monthlyRent || "6500");
    const defaultBank = "Qatar National Bank (QNB)";
    // First maturity date applies to all checks by default, user can manually override
    const maturityDateStr = genStartDate ? new Date(genStartDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
    const contractStartStr = lease?.startDate || maturityDateStr;
    const contractEndStr = lease?.endDate || maturityDateStr;
    const tenurePeriodStr = `${contractStartStr} to ${contractEndStr}`;

    const newRows: AddPdcRow[] = [];
    for (let i = 0; i < count; i++) {
      const chqNum = `${genPrefix || "PDC-"}${String(startNum + i).padStart(3, "0")}`;
      newRows.push({
        id: String(i + 1),
        chequeNo: chqNum,
        bank: defaultBank,
        chequeDate: maturityDateStr,
        period: tenurePeriodStr,
        amount: rentAmt,
      });
    }
    setAddPdcRows(newRows);
    toast.success(`Generated ${count} Post-Dated Cheque schedule rows.`);
  }

  // ── Add PDC to Database & GL Handler ───────────────────────────────────────
  async function handleAddPdc() {
    if (!selectedLeaseId) {
      toast.error("Please select a Lease / Tenant Agreement.");
      return;
    }
    const lease = leases.find(l => l.id === selectedLeaseId);
    if (!lease) {
      toast.error("Selected lease could not be found.");
      return;
    }

    if (collectionType !== "PDC") {
      const amount = parseFloat(otherCollectionAmount);
      if (!amount || amount <= 0) {
        toast.error("Enter a valid collection amount.");
        return;
      }
      setAddPdcLoading(true);
      try {
        const customerId = (lease as any).customerId || "00000000-0000-0000-0000-000000000003";
        const propertyId = (lease as any).propertyId || "00000000-0000-0000-0000-000000000001";
        const unitId = (lease as any).unitId || "00000000-0000-0000-0000-000000000002";
        await collectSecurityDeposit({
          amount,
          tenant_id: customerId,
          property_id: propertyId,
          unit_id: unitId,
          lease_id: lease.id,
          mode: "Cash",
          depositType: collectionType === "Security Deposit" ? "SECURITY" : "SERVICE_FEE",
          ref: otherCollectionDescription.trim() || `${collectionType} collected by Cashier`,
          unit_name: lease.unit,
        });
        addVoucher({
          voucher_no: `VCH-CASH-${Date.now()}`,
          voucher_type: "Receipt Voucher",
          date: new Date().toISOString().split("T")[0],
          name: `${collectionType} - ${lease.tenantName}`,
          debit: "Cash / Bank Collection",
          credit: collectionType === "Security Deposit" ? "Security Deposit Liability" : "Tenant Receivable",
          amount,
          method: "Cashier Collection",
          property_name: lease.property,
          unit_ref: lease.unit,
          tenant_name: lease.tenantName,
        });
        setAddPdcOpen(false);
        setOtherCollectionAmount("");
        setOtherCollectionDescription("");
        toast.success(`${collectionType} collected for ${lease.tenantName} · ${lease.property} · ${lease.unit}.`);
      } catch (error: any) {
        toast.error(error.message || "Collection failed.");
      } finally {
        setAddPdcLoading(false);
      }
      return;
    }

    if (addPdcRows.length === 0) {
      toast.error("Please add at least one Cheque row.");
      return;
    }
    for (let i = 0; i < addPdcRows.length; i++) {
      const r = addPdcRows[i];
      if (!r.chequeNo || !r.chequeDate || !r.amount || parseFloat(r.amount) <= 0) {
        toast.error(`Please complete Cheque Number, Maturity Date and Amount on row #${i + 1}.`);
        return;
      }
    }

    const prop = lease?.property || "Old Salata - Residence No:23";
    const unit = lease?.unit || "Unit";
    const tenant = lease?.tenantName || "Valued Tenant";

    setAddPdcLoading(true);
    try {
      // 1. Resolve authoritative UUID context from the lease record.
      const leaseLookup = selectedLeaseId
        ? (String(selectedLeaseId).match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
          ? supabase.from("leases").select("id, customer_id, property_id, unit_id").eq("id", String(selectedLeaseId)).maybeSingle()
          : supabase.from("leases").select("id, customer_id, property_id, unit_id").eq("lease_number", String(selectedLeaseId)).maybeSingle())
        : Promise.resolve({ data: null, error: null } as any);
      const { data: leaseRow } = await leaseLookup;

      const customerId = leaseRow?.customer_id || (lease as any)?.customerId || "00000000-0000-0000-0000-000000000003";
      const propertyId = leaseRow?.property_id || (lease as any)?.propertyId || "00000000-0000-0000-0000-000000000001";
      const unitId = leaseRow?.unit_id || (lease as any)?.unitId || "00000000-0000-0000-0000-000000000002";
      const dbLeaseId = leaseRow?.id || selectedLeaseId;

      let totalBatchAmt = 0;
      const receiptPdcs: Array<any> = [];
      const newContextPdcs: Array<any> = [];

      // 2. Persist through the authoritative PDC lifecycle / posting engine for each cheque
      for (const row of addPdcRows) {
        const amt = parseFloat(row.amount) || 0;
        totalBatchAmt += amt;

        try {
          await receivePdc({
            cheque_number: row.chequeNo,
            cheque_date: row.chequeDate,
            amount: amt,
            tenant_id: String(customerId),
            property_id: String(propertyId),
            unit_id: String(unitId),
            unitCode: unit,
            lease_id: String(dbLeaseId),
          });
        } catch (e: any) {
          console.warn("[receivePdc] Notice during receive:", e?.message);
        }

        // Add to Finance store vouchers for immediate GL reflection
        addVoucher({
          voucher_no: `VCH-PDC-REC-${row.chequeNo}`,
          voucher_type: "Journal Voucher",
          date: row.chequeDate,
          name: `PDC Collected – ${row.chequeNo} (${tenant} - ${unit})`,
          debit: "PDC In Hand",
          debit_code: "12900",
          credit: "Customer PDC Liability",
          credit_code: "21400",
          amount: amt,
          method: "PDC",
          property_name: prop,
          unit_ref: unit,
          tenant_name: tenant,
        });

        receiptPdcs.push({
          chequeNo: row.chequeNo,
          bank: row.bank || "Qatar National Bank (QNB)",
          date: row.chequeDate,
          amount: amt,
          period: row.period || "Rent Instalment",
          tenureStart: row.period?.includes(" to ") ? row.period.split(" to ")[0] : row.chequeDate,
          tenureEnd: row.period?.includes(" to ") ? row.period.split(" to ")[1] : row.chequeDate,
        });

        newContextPdcs.push({
          id: `pdc-${Date.now()}-${row.chequeNo}`,
          leaseId: selectedLeaseId,
          chequeNo: row.chequeNo,
          bank: row.bank || "Qatar National Bank (QNB)",
          date: row.chequeDate,
          amount: amt,
          status: "received",
          period: row.period,
        });
      }

      // Update shared context
      setSharedPdcs(prev => [...newContextPdcs, ...prev]);

      // 3. Generate Official Collection Receipt matching standard collection format
      const todayStr = new Date().toISOString().split("T")[0];
      const receipt: TenantReceiptDetails = {
        receiptNo: `REC-PDC-BATCH-${Date.now().toString().slice(-6)}`,
        acknowledgementNo: `ACK-PDC-${addPdcRows[0]?.chequeNo || 'COLLECT'}`,
        date: todayStr,
        tenantName: tenant,
        propertyName: prop,
        unitRef: unit,
        leaseStartDate: lease?.startDate || todayStr,
        leaseEndDate: lease?.endDate || todayStr,
        monthlyRent: parseFloat(addPdcRows[0]?.amount) || 0,
        totalContractRent: totalBatchAmt,
        depositAmount: 0,
        depositMode: "PDC",
        pdcCount: addPdcRows.length,
        pdcs: receiptPdcs,
        totalCollected: totalBatchAmt,
        cashierName: "Finance Department",
        notes: `PDC COLLECTION ACKNOWLEDGMENT: Received ${addPdcRows.length} Post-Dated Cheques totaling QAR ${totalBatchAmt.toLocaleString()} for ${tenant} (${prop} - ${unit}). GL Posted: DR 12900 PDC In Hand / CR 21400 Customer PDC Liability.`,
      };

      setReceiptData(receipt);
      setReceiptOpen(true);
      toast.success(`Successfully registered ${addPdcRows.length} Post-Dated Cheques (QAR ${totalBatchAmt.toLocaleString()}) & updated GLs!`);
      setAddPdcOpen(false);
      await new Promise(r => setTimeout(r, 400));
      load(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to save PDCs to database.");
    } finally {
      setAddPdcLoading(false);
    }
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
                        <TableCell className="text-right font-bold font-mono text-xs">
                          <div>{Number(pdc.amount).toLocaleString()}</div>
                          {pdc.paid_amount != null && pdc.paid_amount > 0 && (
                            <div className="text-[10px] font-normal">
                              <span className="text-purple-600 dark:text-purple-400">Paid: {Number(pdc.paid_amount).toLocaleString()}</span>
                              {Number(pdc.amount) - Number(pdc.paid_amount) > 0.01 && (
                                <span className="text-amber-600 dark:text-amber-400 ml-1">Due: {(Number(pdc.amount) - Number(pdc.paid_amount)).toLocaleString()}</span>
                              )}
                            </div>
                          )}
                        </TableCell>
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
                              pdc.status === "Partial Cash" ? "bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-300 font-semibold" :
                              ""
                            }`}
                          >
                            {pdc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {(() => {
                              const linkedLease = leases?.find((l) => l.id === pdc.lease_id || l.tenantName === pdc.tenant_name || l.unit === pdc.unit_ref);
                              const isVacatedLease = Boolean(linkedLease && (linkedLease.status === "closed" || (linkedLease as any).earlyVacate));

                              if (pdc.status === "Returned" && isVacatedLease) {
                                return (
                                  <span className="text-[10px] font-medium text-muted-foreground italic px-1.5 py-0.5 rounded bg-muted/40">
                                    Lease Vacated
                                  </span>
                                );
                              }

                              const chqKey = String(pdc.cheque_number || pdc.id);
                              const histCount = (receiptHistory[chqKey] || []).length;

                              return (
                                <>
                                  <Button
                                    size="sm"
                                    variant={histCount > 1 || pdc.status === "Partial Cash" ? "outline" : "ghost"}
                                    className={`h-6 text-xs gap-1 px-1.5 ${
                                      histCount > 1
                                        ? "border-amber-400 bg-amber-50/60 text-amber-800 dark:text-amber-300 hover:bg-amber-100"
                                        : "text-primary"
                                    }`}
                                    onClick={() => handleViewReceipt(pdc)}
                                    title="View payment receipt(s)"
                                  >
                                    <Receipt className="h-3 w-3" />
                                    {histCount > 1 ? `Receipts (${histCount})` : "Receipt"}
                                  </Button>

                                  {/* In Hand actions */}
                                  {pdc.status === "In Hand" && (
                                    <>
                                      <Button size="sm" className="h-6 text-xs px-2" onClick={() => openGlConfirm(pdc, "deposit")}>
                                        Deposit
                                      </Button>
                                      <Button size="sm" variant="outline" className="h-6 text-xs px-2 border-purple-300 text-purple-700 hover:bg-purple-50" onClick={() => openCashModal(pdc)}>
                                        <Banknote className="h-3 w-3 mr-1" /> Cash
                                      </Button>
                                    </>
                                  )}

                                  {/* Partial Cash actions (allow paying remaining cash balance + view receipts) */}
                                  {pdc.status === "Partial Cash" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-6 text-xs px-2 border-purple-400 bg-purple-50/50 text-purple-700 hover:bg-purple-100"
                                      onClick={() => openCashModal(pdc)}
                                    >
                                      <Banknote className="h-3 w-3 mr-1" /> Pay Cash
                                    </Button>
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

                                  {/* Returned actions for active non-vacated leases */}
                                  {pdc.status === "Returned" && (
                                    <>
                                      <Button size="sm" variant="outline" className="h-6 text-xs border-blue-500 text-blue-600 hover:bg-blue-50 px-2" disabled={actionLoading} onClick={() => openGlConfirm(pdc, "deposit")}>
                                        Re-Deposit
                                      </Button>
                                      <Button size="sm" variant="outline" className="h-6 text-xs border-purple-300 text-purple-700 hover:bg-purple-50 px-2" disabled={actionLoading} onClick={() => openCashModal(pdc)}>
                                        <Banknote className="h-3 w-3 mr-1" /> Cash
                                      </Button>
                                    </>
                                  )}
                                </>
                              );
                            })()}
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
      {/* ── PARTIAL CASH RECEIPT HISTORY MODAL ─────────────────────────────── */}
      <Dialog open={receiptHistoryOpen} onOpenChange={setReceiptHistoryOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Receipt className="h-5 w-5 text-amber-600" />
              Cash Payment Receipts — Cheque #{receiptHistoryPdc?.cheque_number}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              All partial cash payment receipts for this PDC. Each instalment is a separate receipt.
            </DialogDescription>
          </DialogHeader>

          {receiptHistoryPdc && (() => {
            const history = receiptHistory[receiptHistoryPdc.cheque_number] || [];
            const current = history[receiptHistoryIndex];
            const totalPaid = history.reduce((s, r) => s + (r.totalCollected || 0), 0);
            const chequeAmt = Number(receiptHistoryPdc.amount) || 0;

            return (
              <div className="space-y-3 text-xs">
                {/* Summary bar */}
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
                  <div>
                    <span className="text-muted-foreground">Cheque Amount: </span>
                    <span className="font-mono font-bold">QR {chequeAmt.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Paid: </span>
                    <span className="font-mono font-bold text-green-600">QR {totalPaid.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remaining: </span>
                    <span className={`font-mono font-bold ${chequeAmt - totalPaid > 0 ? "text-amber-600" : "text-green-600"}`}>
                      QR {Math.max(0, chequeAmt - totalPaid).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Navigator */}
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground font-semibold">
                    Receipt {receiptHistoryIndex + 1} of {history.length}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-7 px-3" disabled={receiptHistoryIndex === 0} onClick={() => setReceiptHistoryIndex(i => i - 1)}>← Prev</Button>
                    <Button size="sm" variant="outline" className="h-7 px-3" disabled={receiptHistoryIndex === history.length - 1} onClick={() => setReceiptHistoryIndex(i => i + 1)}>Next →</Button>
                  </div>
                </div>

                {/* Receipt detail card */}
                {current && (
                  <div className="rounded-lg border bg-background p-4 space-y-2.5">
                    <div className="flex justify-between items-center border-b pb-2">
                      <div>
                        <div className="font-bold text-sm">{current.receiptNo}</div>
                        <div className="text-muted-foreground text-[11px]">{current.acknowledgementNo}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] text-muted-foreground">Date</div>
                        <div className="font-mono font-bold">{current.date}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div><span className="text-muted-foreground">Tenant: </span><span className="font-medium">{current.tenantName}</span></div>
                      <div><span className="text-muted-foreground">Unit: </span><span className="font-medium">{current.unitRef}</span></div>
                      <div><span className="text-muted-foreground">Property: </span><span className="font-medium">{current.propertyName}</span></div>
                      <div><span className="text-muted-foreground">Mode: </span><span className="font-medium">{current.depositMode}</span></div>
                    </div>

                    <div className="flex justify-between items-center rounded-md bg-green-50 border border-green-200 px-3 py-2 mt-1">
                      <span className="font-semibold text-green-800">Amount Collected</span>
                      <span className="font-mono font-bold text-green-700 text-sm">QR {(current.totalCollected || 0).toLocaleString()}</span>
                    </div>

                    {current.notes && (
                      <div className="text-[11px] text-muted-foreground bg-muted/30 rounded p-2 leading-relaxed">
                        {current.notes}
                      </div>
                    )}

                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full h-7 text-xs gap-1"
                      onClick={() => {
                        setReceiptData(current);
                        setReceiptHistoryOpen(false);
                        setReceiptOpen(true);
                      }}
                    >
                      <Receipt className="h-3 w-3" /> Open Full Receipt
                    </Button>
                  </div>
                )}

                {history.length === 0 && (
                  <div className="text-center text-muted-foreground py-6">No receipts recorded for this PDC yet.</div>
                )}
              </div>
            );
          })()}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptHistoryOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── REGISTER PDC MODAL (FULL PDC COLLECTION SCHEDULE FORMAT: #, Cheque No, Bank, Maturity Date, Period, Amount) ── */}
      <Dialog open={addPdcOpen} onOpenChange={setAddPdcOpen}>
        <DialogContent className="sm:max-w-[840px] max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Plus className="h-5 w-5 text-primary" /> {collectionType === "PDC" ? "Register Post-Dated Cheques (PDC)" : `Collect ${collectionType}`}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {collectionType === "PDC" ? "Add post-dated cheques in full collection format, post double-entry GL, and issue an official acknowledgement receipt." : "Collect the selected tenant amount, post the double-entry finance transaction, and issue an official receipt."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-1 text-xs">
            <div className="rounded-lg border bg-muted/30 p-3">
              <Label className="text-[11px] font-semibold">Collection Type</Label>
              <Select value={collectionType} onValueChange={(value) => setCollectionType(value as typeof collectionType)}>
                <SelectTrigger className="mt-1 h-8 text-xs bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDC">Post-Dated Cheques (PDC)</SelectItem>
                  <SelectItem value="Security Deposit">Security Deposit</SelectItem>
                  <SelectItem value="Other Amount">Other Amount / Service Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lease Selector */}
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-primary" /> Lease / Tenant Agreement <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={selectedLeaseId}
                    onValueChange={(v) => {
                      setSelectedLeaseId(v);
                      const lease = leases.find(l => l.id === v);
                      if (lease) {
                        const rentStr = String(lease.monthlyRent || 6500);
                        const leaseStart = lease.startDate || new Date().toISOString().split("T")[0];
                        const leaseEnd = lease.endDate || leaseStart;
                        const contractTenure = `${leaseStart} to ${leaseEnd}`;
                        setGenPrefix(`PDC-${lease.unit?.replace(/\s+/g, '') || 'Flat'}-`);
                        setGenStartDate(leaseStart);
                        setAddPdcRows(prev => prev.map(r => ({
                          ...r,
                          amount: rentStr,
                          chequeDate: r.chequeDate || leaseStart,
                          period: contractTenure,
                        })));
                      }
                    }}
                  >
                    <SelectTrigger className="h-8 text-xs bg-background">
                      <SelectValue placeholder="Select tenant lease agreement" />
                    </SelectTrigger>
                    <SelectContent>
                      {leases.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.tenantName} — {l.unit} ({l.property}) • QR {l.monthlyRent?.toLocaleString()}/mo
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Auto-Schedule Generator */}
                <div className="border rounded-md p-2 bg-background/80 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase">
                    <span>Quick Generator</span>
                    <span className="font-normal lowercase">auto-fill schedule</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Input
                      className="h-7 text-[11px] w-14 font-mono text-center"
                      placeholder="Qty"
                      title="Number of cheques"
                      value={genCount}
                      onChange={e => setGenCount(e.target.value)}
                    />
                    <Input
                      className="h-7 text-[11px] w-28 font-mono"
                      placeholder="Prefix e.g. PDC-"
                      title="Cheque Number Prefix"
                      value={genPrefix}
                      onChange={e => setGenPrefix(e.target.value)}
                    />
                    <Input
                      type="date"
                      className="h-7 text-[11px] w-32"
                      title="Start Maturity Date"
                      value={genStartDate}
                      onChange={e => setGenStartDate(e.target.value)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-7 text-[11px] px-2 font-semibold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                      onClick={handleGeneratePdcSchedule}
                    >
                      ⚡ Auto-Generate
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {collectionType !== "PDC" && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1"><Label className="text-[11px] font-semibold">Amount (QAR) *</Label><Input type="number" min="0" className="h-8 text-xs" value={otherCollectionAmount} onChange={e => setOtherCollectionAmount(e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-[11px] font-semibold">Description</Label><Input className="h-8 text-xs" value={otherCollectionDescription} onChange={e => setOtherCollectionDescription(e.target.value)} placeholder="Collection reason" /></div>
                </div>
                <p className="text-[11px] text-muted-foreground">This collection will post to the tenant ledger and generate a receipt for the selected lease.</p>
              </div>
            )}

            {/* PDC Schedule Table with exact collection columns: #, Cheque No., Bank, Maturity Date, Period, Amount (QAR) */}
            <div className={collectionType === "PDC" ? "space-y-2" : "hidden"}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  <Receipt className="h-4 w-4 text-primary" />
                  PDC Collection Schedule ({addPdcRows.length} Cheques)
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-foreground">
                    Total: QR {addPdcRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0).toLocaleString()}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/5"
                    onClick={() => {
                      const nextId = String(addPdcRows.length + 1);
                      const last = addPdcRows[addPdcRows.length - 1];
                      const lease = leases.find(l => l.id === selectedLeaseId);
                      const defaultDate = last?.chequeDate || genStartDate || new Date().toISOString().split("T")[0];
                      const defaultPeriod = last?.period || (lease ? `${lease.startDate} to ${lease.endDate}` : "Rent Instalment");
                      setAddPdcRows([
                        ...addPdcRows,
                        {
                          id: nextId,
                          chequeNo: `${genPrefix || 'PDC-'}${String(addPdcRows.length + 1).padStart(3, '0')}`,
                          bank: last?.bank || "Qatar National Bank (QNB)",
                          chequeDate: defaultDate,
                          period: defaultPeriod,
                          amount: last?.amount || String(lease?.monthlyRent || "6500"),
                        }
                      ]);
                    }}
                  >
                    <Plus className="h-3 w-3" /> Add Row
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden bg-background">
                <table className="w-full text-xs">
                  <thead className="bg-muted/60 text-muted-foreground font-semibold border-b">
                    <tr>
                      <th className="py-2 px-2.5 text-center w-10">#</th>
                      <th className="py-2 px-2.5 text-left w-36">Cheque No. <span className="text-destructive">*</span></th>
                      <th className="py-2 px-2.5 text-left">Bank</th>
                      <th className="py-2 px-2.5 text-left w-32">Maturity Date <span className="text-destructive">*</span></th>
                      <th className="py-2 px-2.5 text-left">Period</th>
                      <th className="py-2 px-2.5 text-right w-28">Amount (QAR) <span className="text-destructive">*</span></th>
                      <th className="py-2 px-1 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {addPdcRows.map((row, idx) => (
                      <tr key={row.id || idx} className="hover:bg-muted/20">
                        <td className="py-1.5 px-2 text-center font-mono text-muted-foreground font-bold">{idx + 1}</td>
                        <td className="py-1.5 px-2">
                          <Input
                            className="h-7 text-xs font-mono font-bold"
                            placeholder="e.g. QNB-001"
                            value={row.chequeNo}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAddPdcRows(rows => rows.map((r, i) => i === idx ? { ...r, chequeNo: val } : r));
                            }}
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <Input
                            className="h-7 text-xs"
                            placeholder="Bank Name"
                            value={row.bank}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAddPdcRows(rows => rows.map((r, i) => i === idx ? { ...r, bank: val } : r));
                            }}
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <Input
                            type="date"
                            className="h-7 text-xs font-mono"
                            value={row.chequeDate}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAddPdcRows(rows => rows.map((r, i) => i === idx ? { ...r, chequeDate: val } : r));
                            }}
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <Input
                            className="h-7 text-xs"
                            placeholder="e.g. 2026-09-02 to 2026-10-01"
                            value={row.period}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAddPdcRows(rows => rows.map((r, i) => i === idx ? { ...r, period: val } : r));
                            }}
                          />
                        </td>
                        <td className="py-1.5 px-2">
                          <Input
                            type="number"
                            step="0.01"
                            className="h-7 text-xs font-mono font-bold text-right"
                            placeholder="6500"
                            value={row.amount}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAddPdcRows(rows => rows.map((r, i) => i === idx ? { ...r, amount: val } : r));
                            }}
                          />
                        </td>
                        <td className="py-1.5 px-1 text-center">
                          {addPdcRows.length > 1 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => setAddPdcRows(rows => rows.filter((_, i) => i !== idx))}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Double Entry Accounting Impact Summary */}
            <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-2.5 text-xs text-purple-900 flex items-center justify-between">
              <div>
                <span className="font-semibold block">Automatic Double-Entry Posting:</span>
                <span className="text-[11px] opacity-80">DR 12900 PDC In Hand / CR 21400 Customer PDC Liability (Posted per cheque).</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold">Total: QR {addPdcRows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 border-t pt-2">
            <Button variant="outline" onClick={() => setAddPdcOpen(false)} disabled={addPdcLoading}>
              Cancel
            </Button>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleAddPdc} 
              disabled={addPdcLoading || !selectedLeaseId || addPdcRows.length === 0 || (collectionType !== "PDC" && !otherCollectionAmount)}
            >
              {addPdcLoading ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Posting Collection…</> : collectionType === "PDC" ? "Save PDCs & Issue Receipt" : "Post Collection & Issue Receipt"}
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
                    {cashPdc.paid_amount != null && cashPdc.paid_amount > 0 && (
                      <>
                        <div className="flex justify-between text-purple-700 dark:text-purple-300">
                          <span className="font-medium">Previously Paid in Cash:</span>
                          <span className="font-mono font-bold">QR {Number(cashPdc.paid_amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-amber-700 dark:text-amber-300 font-semibold border-t pt-1">
                          <span>Remaining Balance Due:</span>
                          <span className="font-mono font-bold">QR {Math.max(0, Number(cashPdc.amount || 0) - Number(cashPdc.paid_amount)).toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Amount input with live discrepancy warning */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">
                        Cash Amount Paying Now (QAR) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        className="h-8 text-xs font-mono font-bold"
                        placeholder="Enter cash amount"
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

                  {/* Discrepancy / Completion indicator */}
                  {(() => {
                    const original = Number(cashPdc.amount || 0);
                    const alreadyPaid = Number(cashPdc.paid_amount || 0);
                    const remaining = Math.max(0, original - alreadyPaid);
                    const actual = parseFloat(cashAmount) || 0;
                    const totalAfter = alreadyPaid + actual;

                    if (actual === remaining && remaining > 0) {
                      return (
                        <div className="rounded-md border border-emerald-200 bg-emerald-50/70 p-2 text-[11px] text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <span>This payment of QR {actual.toLocaleString()} will <strong>fully settle</strong> the cheque (Cheque will be cancelled &amp; closed).</span>
                        </div>
                      );
                    }
                    if (actual < remaining) {
                      const stillRemaining = remaining - actual;
                      return (
                        <div className="rounded-md border border-amber-200 bg-amber-50/70 p-2 text-[11px] text-amber-800 flex items-start gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span>
                            <strong>Partial Payment:</strong> Paying QR {actual.toLocaleString()}.
                            Remaining balance of <strong>QR {stillRemaining.toLocaleString()}</strong> will stay open for subsequent cash payments.
                          </span>
                        </div>
                      );
                    }
                    if (actual > remaining && remaining > 0) {
                      return (
                        <div className="rounded-md border border-blue-200 bg-blue-50/70 p-2 text-[11px] text-blue-800 flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span>Excess payment: QR {(actual - remaining).toLocaleString()} above remaining balance.</span>
                        </div>
                      );
                    }
                    return null;
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

                    {/* 1. Cash Receipt Group */}
                    <div className="space-y-2">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Part 1: Cash Collection at Counter
                      </div>
                      {/* Debit Card: Cash In Hand */}
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
                              GL 12100
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              Cash In Hand
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Physical cash collected at counter from tenant
                          </p>
                        </div>
                        <div className="text-xs font-mono font-bold tabular-nums text-foreground">
                          QAR {(parseFloat(cashAmount) || Number(cashPdc.amount || 0)).toLocaleString()}
                        </div>
                      </div>

                      {/* Credit Card: Receivable - Unit Account */}
                      <div className="flex items-start gap-2.5 bg-background/95 rounded-lg px-3.5 py-2.5 border border-border/80 shadow-sm">
                        <div className="mt-0.5">
                          <ArrowDownLeft className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                              Credit
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                              GL 12413
                            </span>
                            <span className="text-xs font-semibold text-foreground">
                              Receivable- Unit Account
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Tenant unit receivable offset &amp; settled
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
                      {/* Discrepancy note for partial payments */}
                      {(() => {
                        const original = Number(cashPdc?.amount || 0);
                        const actual = parseFloat(cashAmount) || original;
                        const diff = original - actual;
                        if (diff > 0.01) {
                          return (
                            <div className="rounded-md border border-amber-200 bg-amber-50/70 p-2 text-[11px] text-amber-800 flex items-start gap-1.5">
                              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 text-amber-600 flex-shrink-0" />
                              <span>
                                <strong>Partial Payment:</strong> QR {actual.toLocaleString()} collected vs QR {original.toLocaleString()} cheque.
                                The PDC liability reversal (21400 / 12900) posts for the <strong>cash amount only (QR {actual.toLocaleString()})</strong>.
                                Outstanding balance of QR {diff.toLocaleString()} remains in Tenant AR (12413).
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}
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
                              Customer(PDC)- Unit Account
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Customer PDC liability reversed upon physical cheque return
                          </p>
                        </div>
                        <div className="text-xs font-mono font-bold tabular-nums text-foreground">
                          QAR {(parseFloat(cashAmount) || Number(cashPdc?.amount || 0)).toLocaleString()}
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
                              PDC in hand
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Physical cheque removed from holding custody
                          </p>
                        </div>
                        <div className="text-xs font-mono font-bold tabular-nums text-foreground">
                          QAR {(parseFloat(cashAmount) || Number(cashPdc?.amount || 0)).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* 3. Bank Account Deposit Group */}
                    <div className="space-y-2 pt-1 border-t border-purple-200/60">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        Part 3: Bank Account Deposit
                      </div>
                      {/* Debit Card: Bank Account */}
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
                              Bank Account
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Cash deposited into bank operating account
                          </p>
                        </div>
                        <div className="text-xs font-mono font-bold tabular-nums text-foreground">
                          QAR {(parseFloat(cashAmount) || Number(cashPdc.amount || 0)).toLocaleString()}
                        </div>
                      </div>

                      {/* Credit Card: Cash In Hand Settlement */}
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
                            Counter cash till cleared upon bank deposit
                          </p>
                        </div>
                        <div className="text-xs font-mono font-bold tabular-nums text-foreground">
                          QAR {(parseFloat(cashAmount) || Number(cashPdc.amount || 0)).toLocaleString()}
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

      {/* ── MULTI-RECEIPT GENERATION & VIEWER MODAL ───────────────────────── */}
      <Dialog open={receiptHistoryOpen} onOpenChange={setReceiptHistoryOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
          {receiptHistoryPdc && (() => {
            const chq = String(receiptHistoryPdc.cheque_number || receiptHistoryPdc.id);
            const originalAmt = Number(receiptHistoryPdc.amount) || 0;
            const paidAmt = Number(receiptHistoryPdc.paid_amount) || 0;
            const remainingDue = Math.max(0, originalAmt - paidAmt);
            const list = receiptHistory[chq] || [];
            const activeReceipt = list[receiptHistoryIndex] || list[list.length - 1] || null;
            const pctPaid = Math.min(100, Math.round((paidAmt / (originalAmt || 1)) * 100));

            return (
              <div className="space-y-5">
                <DialogHeader className="border-b pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <DialogTitle className="text-lg font-bold flex items-center gap-2 text-foreground">
                        <Receipt className="h-5 w-5 text-purple-600" />
                        Cash Receipts Statement – Cheque #{chq}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                        {receiptHistoryPdc.tenant_name || "Tenant"} • {receiptHistoryPdc.property_name || "Property"} – Unit {receiptHistoryPdc.unit_ref || "Unit"}
                      </DialogDescription>
                    </div>
                    <Badge
                      className={
                        receiptHistoryPdc.status === "Replaced" || remainingDue <= 0.01
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold"
                          : "bg-amber-100 text-amber-800 border-amber-300 font-semibold"
                      }
                    >
                      {receiptHistoryPdc.status === "Replaced" || remainingDue <= 0.01 ? "Fully Settled" : "Partial Cash"}
                    </Badge>
                  </div>
                </DialogHeader>

                {/* ── Summary Cards & Progress ────────────────────────────── */}
                <div className="bg-muted/40 rounded-xl p-4 border border-border/70 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-background rounded-lg p-3 border border-border/60">
                      <div className="text-[11px] font-medium text-muted-foreground">Original Cheque Amount</div>
                      <div className="text-base font-bold font-mono text-foreground mt-0.5">
                        QAR {originalAmt.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-3 border border-purple-200 dark:border-purple-900/40">
                      <div className="text-[11px] font-medium text-purple-700 dark:text-purple-400">Total Cash Received</div>
                      <div className="text-base font-bold font-mono text-purple-700 dark:text-purple-300 mt-0.5">
                        QAR {paidAmt.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-background rounded-lg p-3 border border-amber-200 dark:border-amber-900/40">
                      <div className="text-[11px] font-medium text-amber-700 dark:text-amber-400">Remaining Balance Due</div>
                      <div className="text-base font-bold font-mono text-amber-700 dark:text-amber-400 mt-0.5">
                        QAR {remainingDue.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div>
                    <div className="flex justify-between text-[11px] font-medium mb-1">
                      <span className="text-muted-foreground">Settlement Progress ({list.length} Receipt{list.length === 1 ? '' : 's'} Generated)</span>
                      <span className="font-mono font-bold text-foreground">{pctPaid}%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${pctPaid}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Receipts Tab Selector / Timeline ─────────────────────── */}
                <div>
                  <div className="text-xs font-semibold text-foreground mb-2 flex items-center justify-between">
                    <span>Generated Payment Receipts ({list.length})</span>
                    {remainingDue > 0.01 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-purple-400 text-purple-700 hover:bg-purple-50 gap-1"
                        onClick={() => {
                          setReceiptHistoryOpen(false);
                          openCashModal(receiptHistoryPdc);
                        }}
                      >
                        <Plus className="h-3 w-3" /> Record Next Cash Instalment
                      </Button>
                    )}
                  </div>

                  {list.length === 0 ? (
                    <div className="text-center py-6 border border-dashed rounded-lg text-muted-foreground text-xs">
                      No standalone cash receipts generated yet for this cheque.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {list.map((r, idx) => {
                        const isSelected = idx === receiptHistoryIndex;
                        return (
                          <button
                            key={r.receiptNo || idx}
                            type="button"
                            onClick={() => setReceiptHistoryIndex(idx)}
                            className={`p-3 rounded-lg border text-left transition-all relative ${
                              isSelected
                                ? "bg-purple-50/70 dark:bg-purple-950/30 border-purple-500 shadow-sm ring-1 ring-purple-500"
                                : "bg-card hover:bg-muted/40 border-border"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300">
                                Instalment #{idx + 1}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {r.date}
                              </span>
                            </div>
                            <div className="text-sm font-mono font-bold text-foreground">
                              QAR {(r.totalCollected || r.monthlyRent || 0).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                              {r.receiptNo}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ── Active Receipt Detailed Preview ───────────────────────── */}
                {activeReceipt && (
                  <div className="border rounded-xl p-4 bg-card shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <div className="text-xs font-bold text-foreground">
                          Receipt #{activeReceipt.receiptNo}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Issued on {activeReceipt.date} • Cashier: {activeReceipt.cashierName || "Finance Department"}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="h-7 text-xs bg-purple-600 hover:bg-purple-700 text-white gap-1"
                          onClick={() => {
                            setReceiptData(activeReceipt);
                            setReceiptOpen(true);
                          }}
                        >
                          <Receipt className="h-3 w-3" /> View &amp; Print Full Receipt
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-muted/30 p-2.5 rounded border">
                        <span className="text-[10px] text-muted-foreground block">Instalment Amount</span>
                        <strong className="font-mono text-foreground text-sm">
                          QAR {(activeReceipt.totalCollected || activeReceipt.monthlyRent || 0).toLocaleString()}
                        </strong>
                      </div>
                      <div className="bg-muted/30 p-2.5 rounded border">
                        <span className="text-[10px] text-muted-foreground block">Mode</span>
                        <span className="font-medium text-foreground">{activeReceipt.depositMode}</span>
                      </div>
                      <div className="bg-muted/30 p-2.5 rounded border">
                        <span className="text-[10px] text-muted-foreground block">Tenant</span>
                        <span className="font-medium text-foreground truncate block">{activeReceipt.tenantName}</span>
                      </div>
                      <div className="bg-muted/30 p-2.5 rounded border">
                        <span className="text-[10px] text-muted-foreground block">Property / Unit</span>
                        <span className="font-medium text-foreground">{activeReceipt.unitRef}</span>
                      </div>
                    </div>

                    {activeReceipt.notes && (
                      <div className="text-[11px] bg-muted/40 p-2.5 rounded border text-muted-foreground italic">
                        {activeReceipt.notes}
                      </div>
                    )}
                  </div>
                )}

                <DialogFooter className="gap-2 border-t pt-3">
                  <Button variant="outline" onClick={() => setReceiptHistoryOpen(false)}>
                    Close
                  </Button>
                  {remainingDue > 0.01 && (
                    <Button
                      className="bg-purple-600 hover:bg-purple-700 text-white gap-1"
                      onClick={() => {
                        setReceiptHistoryOpen(false);
                        openCashModal(receiptHistoryPdc);
                      }}
                    >
                      <Banknote className="h-3.5 w-3.5" /> Collect Remaining QAR {remainingDue.toLocaleString()}
                    </Button>
                  )}
                </DialogFooter>
              </div>
            );
          })()}
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
