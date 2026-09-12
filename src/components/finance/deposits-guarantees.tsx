import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Receipt, Banknote, AlertTriangle, CheckCircle2, Building2, User, Hash, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { settleDeposit } from "@/lib/finance/depositService";
import { useAppData } from "@/lib/app-data-context";
import { useFinanceStore } from "@/lib/finance/finance-store";
import { ReceiptModal, type TenantReceiptDetails } from "@/components/receipt-modal";

const PAGE_SIZE = 20;

export interface DepositRecord {
  id: string | number;
  leaseId?: string;
  deposit_type: string;
  coa_account_code: string;
  amount: number;
  status: "Refundable" | "Settled" | "Active";
  deduction_amount?: number;
  refund_amount?: number;
  settled_at?: string;
  property_name?: string;
  unit_ref?: string;
  tenant_name?: string;
  lease_start_date?: string;
  lease_end_date?: string;
  monthly_rent?: number;
  total_contract_rent?: number;
  created_at?: string;
  receipt_no?: string;
  category?: "Reservation Advance" | "Qatar Cool" | "Kahramaa" | "Service Fee" | "Guarantee Cheque" | "Unclaimed Deposit" | "Unit Deposit";
}

function isSettledStatus(status: string | undefined): boolean {
  const s = (status || "").toLowerCase();
  return s === "settled" || s === "refunded";
}

// ── Helper to normalize deposit category for signature matching ────────────────
function getDepositTypeKey(type: string): string {
  const t = (type || "").toLowerCase();
  if (t.includes("kahramaa") || t.includes("utility")) return "kahramaa";
  if (t.includes("qatar cool") || t.includes("cool")) return "qatar_cool";
  if (t.includes("reservation")) return "reservation";
  if (t.includes("service fee") || t.includes("key")) return "service_fee";
  if (t.includes("guarantee")) return "guarantee";
  if (t.includes("unclaimed")) return "unclaimed";
  return "security";
}

function getDepositSignature(d: Partial<DepositRecord>): string {
  const typeKey = getDepositTypeKey(d.deposit_type || d.coa_account_code || "");
  const leaseKey = d.leaseId ? String(d.leaseId).trim().toLowerCase() : "";
  const tenantKey = (d.tenant_name || "").toLowerCase().trim();
  const unitKey = (d.unit_ref || "").toLowerCase().trim();
  return `${leaseKey || `${unitKey}_${tenantKey}`}_${typeKey}`;
}

// ── Standard Default Refundable Deposits Seed Data (GL 21100) ──────────────────
const DEFAULT_GL21100_DEPOSITS: DepositRecord[] = [];

// ── Settle & Refund Modal (Compact 2-Column Layout) ───────────────────────────
function SettleRefundModal({
  open, deposit, deductions, onDeductionsChange, onConfirm, onCancel, loading,
}: {
  open: boolean; deposit: DepositRecord | null; deductions: string;
  onDeductionsChange: (v: string) => void; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  if (!deposit) return null;
  const grossDeposit = Number(deposit.amount) || 0;
  const deductionAmt = parseFloat(deductions) || 0;
  const refund = Math.max(0, grossDeposit - deductionAmt);
  const isOverDeduction = deductionAmt > grossDeposit;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-2xl p-5 gap-3.5">
        <DialogHeader className="space-y-1 pb-1.5 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                <Banknote className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold leading-tight">Settle &amp; Refund Deposit (GL 21100)</DialogTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">{deposit.deposit_type} &bull; Default Refundable Liability</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border-emerald-300 font-bold px-2 py-0.5">
              QAR {grossDeposit.toLocaleString()}
            </Badge>
          </div>
        </DialogHeader>

        {/* 2-Column Balanced Compact Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Left Column: Premise Context & Deductions Input */}
          <div className="space-y-3">
            <div className="rounded-lg border bg-muted/30 p-2.5 space-y-1.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1"><User className="h-3 w-3" /> Tenant:</span>
                <span className="font-semibold text-foreground truncate max-w-[170px]">{deposit.tenant_name || "—"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1"><Building2 className="h-3 w-3" /> Unit / Prop:</span>
                <span className="font-semibold text-foreground truncate max-w-[170px]">{deposit.unit_ref || "—"} ({deposit.property_name || "—"})</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3" /> GL Account:</span>
                <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[170px]" title={deposit.coa_account_code}>
                  {deposit.coa_account_code}
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="deduction-amount" className="text-xs font-semibold">
                  Approved Deductions (QAR)
                </Label>
                <span className="text-[10px] text-muted-foreground">0 for 100% refund</span>
              </div>
              <Input
                id="deduction-amount"
                type="number"
                min="0"
                max={grossDeposit}
                step="0.01"
                value={deductions}
                onChange={(e) => onDeductionsChange(e.target.value)}
                placeholder="0.00"
                className={`h-9 font-mono text-right text-sm ${isOverDeduction ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              {isOverDeduction ? (
                <p className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 shrink-0" /> Exceeds gross deposit of QAR {grossDeposit.toLocaleString()}
                </p>
              ) : (
                <p className="text-[10px] text-muted-foreground">
                  Deductions post to Damage Recovery (GL 41201001)
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Live Settlement Breakdown & GL Postings */}
          <div className="space-y-3">
            <div className="rounded-lg border p-2.5 bg-card space-y-1.5 text-xs">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Settlement Breakdown</p>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Gross Deposit:</span>
                  <span className="font-mono font-medium">QAR {grossDeposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-red-600">Approved Deductions:</span>
                  <span className={`font-mono font-medium ${deductionAmt > 0 ? "text-red-600" : "text-muted-foreground"}`}>
                    {deductionAmt > 0 ? `− QAR ${deductionAmt.toLocaleString()}` : "QAR 0"}
                  </span>
                </div>
                <div className="h-px bg-border my-0.5" />
                <div className="flex justify-between items-center pt-0.5">
                  <span className="font-semibold text-foreground">Net Refund Paid:</span>
                  <span className={`font-mono text-base font-bold ${refund > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600"}`}>
                    QAR {refund.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 p-2 text-[11px] space-y-0.5">
              <p className="font-semibold text-blue-800 dark:text-blue-300 text-[10px] uppercase tracking-wider">GL Accounting Postings</p>
              {refund > 0 && (
                <p className="text-blue-700 dark:text-blue-300 font-mono text-[10px]">
                  DR 21100 / CR 12000 &rarr; QAR {refund.toLocaleString()}
                </p>
              )}
              {deductionAmt > 0 && (
                <p className="text-blue-700 dark:text-blue-300 font-mono text-[10px]">
                  DR 21100 / CR 41201001 &rarr; QAR {deductionAmt.toLocaleString()}
                </p>
              )}
              <p className="text-[10px] text-blue-600 dark:text-blue-400">
                Official refund voucher &amp; receipt auto-generated.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="pt-2 border-t flex-row justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={loading || isOverDeduction}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
          >
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {loading ? "Syncing DB & Settling…" : "Confirm Settlement & Refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Deposits & Guarantees Component ──────────────────────────────────────────
export function DepositsGuarantees() {
  const { vouchers: sharedVouchers, setVouchers: setSharedVouchers, leases } = useAppData();
  const { addVoucher: addFinanceStoreVoucher, addReceivableInvoice } = useFinanceStore();
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<TenantReceiptDetails | null>(null);

  const [settleTarget, setSettleTarget] = useState<DepositRecord | null>(null);
  const [settleDeductions, setSettleDeductions] = useState("0");
  const [settleLoading, setSettleLoading] = useState(false);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("deposits-guarantees:live")
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "fin_deposits" },
        () => { load(false); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function load(showLoading = true) {
    if (showLoading) setLoading(true);
    try {
      let dbData: any[] = [];
      try {
        const { data, error } = await supabase.from("fin_deposits").select("*").order("created_at", { ascending: false });
        if (!error && data) dbData = data;
      } catch (e) { /* fallback */ }

      const contextDeposits: DepositRecord[] = (sharedVouchers || [])
        .filter(v => {
          const name = v.name.toLowerCase();
          const credit = v.credit.toLowerCase();
          return (
            credit.includes("21100") ||
            credit.includes("21500") ||
            credit.includes("refundable") ||
            credit.includes("security deposit") ||
            name.includes("security deposit") ||
            name.includes("kahramaa") ||
            name.includes("qatar cool") ||
            name.includes("reservation") ||
            name.includes("service fee") ||
            name.includes("guarantee cheque") ||
            name.includes("utility deposit")
          );
        })
        .map((v, idx) => {
          const lease = leases?.find((l) => l.id === v.leaseId);
          const isSettled = (v.status as any) === "settled" || (lease && lease.status === "closed");
          return {
            id: v.id || `ctx-dep-${idx}`,
            leaseId: v.leaseId,
            deposit_type: v.name.replace("Receipts Voucher - ", "").replace("Receipt Voucher - ", ""),
            coa_account_code: v.credit || "21100 - Refundable Deposit Liability",
            amount: Number(v.amount) || 0,
            status: isSettled ? "Settled" : "Refundable",
            deduction_amount: v.settlement_deductions != null ? Number(v.settlement_deductions) : undefined,
            refund_amount: v.settlement_refund != null ? Number(v.settlement_refund) : undefined,
            settled_at: v.settlement_date || (lease && (lease as any).actualVacateDate),
            property_name: lease?.property || "Old Salata - Residence No:23",
            unit_ref: lease?.unit || "AAA - Flat16",
            tenant_name: lease?.tenantName || "Valued Tenant",
            lease_start_date: lease?.startDate || "2025-10-01",
            lease_end_date: lease?.endDate || "2026-09-30",
            monthly_rent: lease?.monthlyRent || 5600,
            total_contract_rent: (lease?.monthlyRent ? lease.monthlyRent * 12 : 67200),
            created_at: lease?.startDate || "2026-08-01",
          };
        });

      const allMap = new Map<string, DepositRecord>();
      const sigMap = new Map<string, DepositRecord>();

      DEFAULT_GL21100_DEPOSITS.forEach(d => {
        allMap.set(String(d.id), { ...d });
        sigMap.set(getDepositSignature(d), { ...d });
      });

      dbData.forEach(d => {
        const isSettledDb = d.status === "Settled" || d.status === "Refunded";
        const rec: DepositRecord = {
          id: d.id,
          leaseId: d.lease_id,
          deposit_type: d.deposit_type || "Refundable Deposit (21100)",
          coa_account_code: d.coa_account_code || "21100 - Refundable Security Deposit",
          amount: Number(d.amount) || 0,
          status: isSettledDb ? "Settled" : "Refundable",
          deduction_amount: d.deduction_amount != null ? Number(d.deduction_amount) : undefined,
          refund_amount: d.refund_amount != null ? Number(d.refund_amount) : undefined,
          settled_at: d.settled_at,
          property_name: d.property_name || "Old Salata - Residence No:23",
          unit_ref: d.unit_ref || "AAA - Flat16",
          tenant_name: d.tenant_name || "Valued Tenant",
          lease_start_date: d.lease_start_date,
          lease_end_date: d.lease_end_date,
          created_at: d.created_at,
        };
        allMap.set(String(d.id), rec);
        sigMap.set(getDepositSignature(rec), rec);
      });

      // Merge context vouchers without creating duplicate rows
      contextDeposits.forEach(cd => {
        const sig = getDepositSignature(cd);
        const existing = sigMap.get(sig) || allMap.get(String(cd.id));
        if (existing) {
          if (cd.status === "Settled") {
            existing.status = "Settled";
            if (cd.deduction_amount != null) existing.deduction_amount = cd.deduction_amount;
            if (cd.refund_amount != null) existing.refund_amount = cd.refund_amount;
            if (cd.settled_at) existing.settled_at = cd.settled_at;
          }
        } else {
          allMap.set(String(cd.id), cd);
          sigMap.set(sig, cd);
        }
      });

      // Also propagate settlement status from any closed leases
      for (const d of allMap.values()) {
        const lease = leases?.find((l) => l.id === d.leaseId || l.tenantName === d.tenant_name || l.unit === d.unit_ref);
        if (lease && lease.status === "closed") {
          d.status = "Settled";
          if (!d.settled_at) {
            d.settled_at = (lease as any).actualVacateDate || (lease as any).moveOutDate || new Date().toISOString().split("T")[0];
          }
        }
      }

      const merged = Array.from(allMap.values());
      merged.sort((a, b) => new Date(b.lease_start_date || b.created_at || "").getTime() - new Date(a.lease_start_date || a.created_at || "").getTime());
      setDeposits(merged);
      setPage(1);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      if (showLoading) setLoading(false);
    }
  }

  async function confirmSettle() {
    if (!settleTarget) return;
    const { id } = settleTarget;
    const amount = Number(settleTarget.amount);
    const deductions = parseFloat(settleDeductions) || 0;
    const refund = Math.max(0, amount - deductions);

    setSettleLoading(true);
    try {
      const targetDep = settleTarget;
      const todayStr = new Date().toISOString().split("T")[0];
      const targetProp = targetDep.property_name && targetDep.property_name !== "—" ? targetDep.property_name : "Old Salata - Residence No:23";
      const targetUnit = targetDep.unit_ref && targetDep.unit_ref !== "—" ? targetDep.unit_ref : "AAA - Flat16";
      const targetTenant = targetDep.tenant_name && targetDep.tenant_name !== "—" ? targetDep.tenant_name : "Mr. Hafeez Shaik";

      const isStringId = typeof id === "string" && (id.startsWith("v") || id.startsWith("ctx-") || id.startsWith("dep-") || isNaN(Number(id)));
      if (isStringId) {
        setSharedVouchers(prev => prev.map(v => v.id === id ? {
          ...v,
          status: "settled" as any,
          settlement_deductions: deductions,
          settlement_refund: refund,
          settlement_date: todayStr,
        } : v));
        setDeposits(prev => prev.map(d => d.id === id ? {
          ...d,
          status: "Settled",
          deduction_amount: deductions,
          refund_amount: refund,
          settled_at: todayStr,
        } : d));
      } else {
        await settleDeposit(Number(id), deductions, refund);
      }

      // 1. Post Refund Voucher (Debit 21100 Refundable Deposit / Credit 12000 Bank Operating Account)
      if (refund > 0) {
        addFinanceStoreVoucher({
          voucher_no: `VCH-REF-${String(id).slice(-4)}`,
          voucher_type: "Payment Voucher",
          date: todayStr,
          name: `Deposit Refund (${targetDep.deposit_type}) – ${targetTenant} (${targetUnit})`,
          debit: "Refundable Security Deposit",
          debit_code: "21100",
          credit: "Bank Operating Account",
          credit_code: "12000",
          amount: refund,
          method: "Bank Transfer",
          property_name: targetProp,
          unit_ref: targetUnit,
          tenant_name: targetTenant,
        });
      }

      // 2. If deductions exist, post Damage/Utility Recovery Invoice & Settlement Offset Voucher
      if (deductions > 0) {
        addReceivableInvoice({
          invoice_no: `INV-DED-${String(id).slice(-4)}`,
          date: todayStr,
          due_date: todayStr,
          tenant: targetTenant,
          property: targetProp,
          unit: targetUnit,
          stream: `Deposit Deduction / Damage Recovery (${targetDep.deposit_type})`,
          amount: deductions,
          account_code: "41201",
        });

        addFinanceStoreVoucher({
          voucher_no: `VCH-DED-${String(id).slice(-4)}`,
          voucher_type: "Journal Voucher",
          date: todayStr,
          name: `Deposit Deduction Offset – ${targetDep.deposit_type} (${targetTenant} - ${targetUnit})`,
          debit: "Refundable Security Deposit",
          debit_code: "21100",
          credit: "Damage & Utility Recovery",
          credit_code: "41201",
          amount: deductions,
          method: "Deposit Offset",
          property_name: targetProp,
          unit_ref: targetUnit,
          tenant_name: targetTenant,
        });
      }

      const refReceipt: TenantReceiptDetails = {
        receiptNo: `REC-REF-${String(id).slice(-4)}`,
        acknowledgementNo: `ACK-REF-${id}`,
        date: todayStr,
        tenantName: targetTenant,
        propertyName: targetProp,
        unitRef: targetUnit,
        leaseStartDate: targetDep.lease_start_date || todayStr,
        leaseEndDate: targetDep.lease_end_date || todayStr,
        monthlyRent: targetDep.monthly_rent || 0,
        totalContractRent: targetDep.total_contract_rent || 0,
        depositAmount: targetDep.amount || 0,
        depositMode: "Bank Transfer",
        pdcCount: 0,
        pdcs: [],
        vouchers: [
          {
            receiptNo: `DEP-GROSS-${Date.now().toString().slice(-4)}`,
            name: `${targetDep.deposit_type} (Gross Deposit Released)`,
            amount: amount,
            method: "Deposit Release",
            debit: "21100 - Refundable Deposit Liability",
            credit: "21100 - Refundable Deposit Liability",
          },
          ...(deductions > 0 ? [{
            receiptNo: `DED-OFFSET-${Date.now().toString().slice(-4)}`,
            name: `Approved Deductions (Damage & Utility Offset) [− QR ${deductions.toLocaleString()}]`,
            amount: deductions,
            method: "Deposit Offset",
            debit: "21100 - Refundable Deposit Liability",
            credit: "41201 - Damage & Utility Recovery",
          }] : []),
          {
            receiptNo: `PV-REF-${Date.now().toString().slice(-4)}`,
            name: `Net Settlement Refund Disbursed to Tenant [QR ${refund.toLocaleString()}]`,
            amount: refund,
            method: "Bank Transfer",
            debit: "21100 - Refundable Deposit Liability",
            credit: "12000 - Bank Operating Account",
          },
        ],
        totalCollected: refund,
        cashierName: "Finance Department",
        notes: `OFFICIAL SETTLEMENT REFUND RECEIPT (${targetDep.deposit_type}): Gross: QR ${amount.toLocaleString()} | Approved Deductions: QR ${deductions.toLocaleString()} | Net Refund Paid: QR ${refund.toLocaleString()}. Auto-posted to GL 21100, 12000 & 41201.`,
      };
      setReceiptData(refReceipt);
      setReceiptOpen(true);

      toast.success(`${targetDep.deposit_type} Settled & Refunded for ${targetTenant}. Official Refund Receipt generated.`);
      setSettleTarget(null);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSettleLoading(false);
    }
  }

  function handleViewReceipt(dep: DepositRecord) {
    const isSettled = dep.status === "Settled";
    const grossAmt = Number(dep.amount) || 0;
    const deductionAmt = Number(dep.deduction_amount) || 0;
    const refundAmt = dep.refund_amount != null ? Number(dep.refund_amount) : Math.max(0, grossAmt - deductionAmt);

    const details: TenantReceiptDetails = {
      receiptNo: dep.receipt_no || (isSettled ? `REC-REF-${String(dep.id).slice(-4)}` : `REC-DEP-${String(dep.id).slice(-4)}`),
      acknowledgementNo: `DEP-ACK-${dep.id}`,
      date: isSettled && dep.settled_at ? dep.settled_at.split("T")[0] : new Date().toISOString().split("T")[0],
      tenantName: dep.tenant_name && dep.tenant_name !== "—" ? dep.tenant_name : "Mr. Hafeez Shaik",
      propertyName: dep.property_name && dep.property_name !== "—" ? dep.property_name : "Old Salata - Residence No:23",
      unitRef: dep.unit_ref && dep.unit_ref !== "—" ? dep.unit_ref : "AAA - Flat16",
      leaseStartDate: dep.lease_start_date || "2025-10-01",
      leaseEndDate: dep.lease_end_date || "2026-09-30",
      monthlyRent: dep.monthly_rent || 5600,
      totalContractRent: dep.total_contract_rent || (dep.monthly_rent ? dep.monthly_rent * 12 : 67200),
      depositAmount: grossAmt,
      depositMode: isSettled ? "Bank Transfer (Settlement Refund)" : (dep.deposit_type || "Refundable Security Deposit"),
      pdcCount: 0,
      pdcs: [],
      vouchers: isSettled
        ? [
            {
              receiptNo: `DEP-GROSS-${String(dep.id).slice(-4)}`,
              name: `${dep.deposit_type} (Gross Deposit Released)`,
              amount: grossAmt,
              method: "Deposit Release",
              debit: "21100 - Refundable Deposit Liability",
              credit: "21100 - Refundable Deposit Liability",
            },
            ...(deductionAmt > 0
              ? [{
                  receiptNo: `DED-OFFSET-${String(dep.id).slice(-4)}`,
                  name: `Approved Deductions (Damage & Utility Offset) [− QR ${deductionAmt.toLocaleString()}]`,
                  amount: deductionAmt,
                  method: "Deposit Offset",
                  debit: "21100 - Refundable Deposit Liability",
                  credit: "41201 - Damage & Utility Recovery",
                }]
              : []),
            {
              receiptNo: `PV-REF-${String(dep.id).slice(-4)}`,
              name: `Net Settlement Refund Disbursed to Tenant [QR ${refundAmt.toLocaleString()}]`,
              amount: refundAmt,
              method: "Bank Transfer",
              debit: "21100 - Refundable Deposit Liability",
              credit: "12000 - Bank Operating Account",
            },
          ]
        : [{
            receiptNo: dep.receipt_no || `RV-DEP-${dep.id}`,
            name: `${dep.deposit_type} Voucher`,
            amount: grossAmt,
            debit: "Cash In Hand / Bank",
            credit: dep.coa_account_code || "21100 - Refundable Deposit Liability",
          }],
      totalCollected: isSettled ? refundAmt : grossAmt,
      cashierName: "Finance Department",
      notes: isSettled
        ? `OFFICIAL SETTLEMENT REFUND RECEIPT (${dep.deposit_type}): Gross: QR ${grossAmt.toLocaleString()} | Approved Deductions: QR ${deductionAmt.toLocaleString()} | Net Refund Paid: QR ${refundAmt.toLocaleString()}. Auto-posted to GL 21100, 12000 & 41201.`
        : `Official acknowledgment for ${dep.deposit_type} held under GL ${dep.coa_account_code}. Status: ${dep.status} (By Default Refundable).`,
    };
    setReceiptData(details);
    setReceiptOpen(true);
  }

  const totalPages = Math.max(1, Math.ceil(deposits.length / PAGE_SIZE));
  const paginated = deposits.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle>Deposits &amp; Guarantees (GL 21100)</CardTitle>
              <Badge variant="secondary" className="text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-normal">
                By-Default Refundable Liabilities
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Reservation Advances, Kahramaa, Qatar Cool, Service Fee Deposits, Unclaimed Deposits &amp; Guarantee Cheques Received ({deposits.length} records)
            </p>
          </div>
          <Badge variant="outline">{deposits.length} Total</Badge>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 p-3 text-xs">
            <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <span className="font-semibold text-emerald-900 dark:text-emerald-200">GL 21100 Refundable Policy:</span>
              <p className="text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                All deposits in this registry (Reservation Advance, Kahramaa, Qatar Cool, Service Fees, and Guarantee Cheques) are <strong>by default refundable</strong> and ready for immediate settlement without manual reclassification.
              </p>
            </div>
          </div>

          {loading ? <p className="text-sm text-muted-foreground py-4">Loading...</p> : (
            <>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold text-xs">Entry Date</TableHead>
                      <TableHead className="font-bold text-xs">Deposit Type</TableHead>
                      <TableHead className="font-bold text-xs">GL Account</TableHead>
                      <TableHead className="font-bold text-xs">Property</TableHead>
                      <TableHead className="font-bold text-xs">Unit</TableHead>
                      <TableHead className="font-bold text-xs">Tenant</TableHead>
                      <TableHead className="text-right font-bold text-xs">Amount (QAR)</TableHead>
                      <TableHead className="font-bold text-xs">Refund Status</TableHead>
                      <TableHead className="font-bold text-xs text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length === 0 && (
                      <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No Deposits found. GL 21100 deposits auto-populate from Leasing Collections &amp; Agreements.</TableCell></TableRow>
                    )}
                    {paginated.map(d => (
                      <TableRow key={String(d.id)} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs text-muted-foreground">{d.settled_at ? d.settled_at.split("T")[0] : (d.lease_start_date || d.created_at || "2026-08-01")}</TableCell>
                        <TableCell className="text-xs font-medium">
                          <div className="flex items-center gap-1.5">
                            <span>{d.deposit_type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground max-w-[200px] truncate" title={d.coa_account_code}>
                          {d.coa_account_code}
                        </TableCell>
                        <TableCell className="text-xs">{d.property_name || "—"}</TableCell>
                        <TableCell className="font-mono text-xs">{d.unit_ref || "—"}</TableCell>
                        <TableCell className="text-xs">{d.tenant_name || "—"}</TableCell>
                        <TableCell className="text-right font-bold font-mono text-xs">
                          <div>{Number(d.amount).toLocaleString()}</div>
                          {d.status === "Settled" && d.deduction_amount != null && d.deduction_amount > 0 && (
                            <div className="text-[10px] text-red-500 font-normal">−{Number(d.deduction_amount).toLocaleString()} ded.</div>
                          )}
                          {d.status === "Settled" && d.refund_amount != null && (
                            <div className="text-[10px] text-emerald-600 font-normal">↳ {Number(d.refund_amount).toLocaleString()} refunded</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={d.status === "Settled" ? "outline" : "secondary"}
                            className={`text-xs ${
                              d.status === "Settled"
                                ? "border-muted text-muted-foreground"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                            }`}
                          >
                            {d.status === "Settled" ? "Settled / Refunded" : "Refundable (Default)"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-2 space-x-1">
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-primary gap-1" onClick={() => handleViewReceipt(d)}>
                            <Receipt className="h-3 w-3" /> Receipt
                          </Button>
                          {d.status !== "Settled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950"
                              onClick={() => { setSettleTarget(d); setSettleDeductions("0"); }}
                            >
                              Settle &amp; Refund
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {deposits.length > PAGE_SIZE && (
                <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                  <span>Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, deposits.length)} of {deposits.length}</span>
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

      <SettleRefundModal
        open={!!settleTarget}
        deposit={settleTarget}
        deductions={settleDeductions}
        onDeductionsChange={setSettleDeductions}
        onConfirm={confirmSettle}
        onCancel={() => setSettleTarget(null)}
        loading={settleLoading}
      />

      <ReceiptModal open={receiptOpen} onOpenChange={setReceiptOpen} data={receiptData} />
    </>
  );
}
