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
import { Receipt, Banknote, AlertTriangle, CheckCircle2, Building2, User, Hash, Info } from "lucide-react";
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

// ── Standard Default Refundable Deposits Seed Data (GL 21100) ──────────────────
const DEFAULT_GL21100_DEPOSITS: DepositRecord[] = [
  {
    id: "dep-21100-01",
    deposit_type: "Kahramaa Deposit - Tenant",
    coa_account_code: "21100003 - Kahramaa Utility Deposit (21100)",
    amount: 1500,
    status: "Refundable",
    property_name: "Old Salata - Residence No:23",
    unit_ref: "AAA - Flat16",
    tenant_name: "Mr. Hafeez Shaik",
    lease_start_date: "2025-10-01",
    lease_end_date: "2026-09-30",
    monthly_rent: 5600,
    total_contract_rent: 67200,
    category: "Kahramaa",
    created_at: "2025-10-01",
  },
  {
    id: "dep-21100-02",
    deposit_type: "Qatar Cool Deposit - Tenant",
    coa_account_code: "21100004 - Qatar Cool Deposit (21100)",
    amount: 1000,
    status: "Refundable",
    property_name: "Old Salata - Residence No:23",
    unit_ref: "AAA - Flat16",
    tenant_name: "Mr. Hafeez Shaik",
    lease_start_date: "2025-10-01",
    lease_end_date: "2026-09-30",
    monthly_rent: 5600,
    total_contract_rent: 67200,
    category: "Qatar Cool",
    created_at: "2025-10-01",
  },
  {
    id: "dep-21100-03",
    deposit_type: "Guarantee Cheque Received",
    coa_account_code: "21100006 - Guarantee Cheque Liability (21100)",
    amount: 5600,
    status: "Refundable",
    property_name: "Old Salata - Residence No:23",
    unit_ref: "AAA - Flat16",
    tenant_name: "Mr. Hafeez Shaik",
    lease_start_date: "2025-10-01",
    lease_end_date: "2026-09-30",
    monthly_rent: 5600,
    total_contract_rent: 67200,
    category: "Guarantee Cheque",
    created_at: "2025-10-01",
  },
  {
    id: "dep-21100-04",
    deposit_type: "Reservation Advance Deposit",
    coa_account_code: "21100001 - Reservation Advance (21100)",
    amount: 2000,
    status: "Refundable",
    property_name: "MANSOURA - BLDG06",
    unit_ref: "Flat14",
    tenant_name: "Vipind",
    lease_start_date: "2026-08-26",
    lease_end_date: "2027-08-25",
    monthly_rent: 7400,
    total_contract_rent: 88800,
    category: "Reservation Advance",
    created_at: "2026-08-26",
  },
  {
    id: "dep-21100-05",
    deposit_type: "Service Fee - Tenant",
    coa_account_code: "21100005 - Service Fee / Key Deposit (21100)",
    amount: 500,
    status: "Refundable",
    property_name: "Neeman's New Building",
    unit_ref: "Flat 002",
    tenant_name: "Vishal Sharma",
    lease_start_date: "2026-08-21",
    lease_end_date: "2027-08-20",
    monthly_rent: 4000,
    total_contract_rent: 48000,
    category: "Service Fee",
    created_at: "2026-08-21",
  },
  {
    id: "dep-21100-06",
    deposit_type: "Unclaimed Liability - Deposit",
    coa_account_code: "21100002 - Unclaimed Deposit Liability (21100)",
    amount: 1200,
    status: "Refundable",
    property_name: "MANSOURA - BLDG06",
    unit_ref: "Flat08",
    tenant_name: "Tariq Mahmood",
    lease_start_date: "2025-06-01",
    lease_end_date: "2026-05-31",
    monthly_rent: 5200,
    total_contract_rent: 62400,
    category: "Unclaimed Deposit",
    created_at: "2025-06-01",
  },
];

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
            <CheckCircle2 className="h-3.5 w-3.5" />
            {loading ? "Settling…" : "Confirm Settlement & Refund"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Deposits & Guarantees Component ──────────────────────────────────────────
export function DepositsGuarantees() {
  const { vouchers: sharedVouchers, setVouchers: setSharedVouchers, leases } = useAppData();
  const { addJournalEntry, addVoucher, addCashBookEntry } = useFinanceStore();
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<TenantReceiptDetails | null>(null);

  const [settleTarget, setSettleTarget] = useState<DepositRecord | null>(null);
  const [settleDeductions, setSettleDeductions] = useState("0");
  const [settleLoading, setSettleLoading] = useState(false);

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setLoading(true);
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
            credit.includes("refundable") ||
            name.includes("kahramaa") ||
            name.includes("qatar cool") ||
            name.includes("reservation") ||
            name.includes("service fee") ||
            name.includes("guarantee cheque") ||
            name.includes("utility deposit") ||
            credit.includes("utility deposit")
          );
        })
        .map((v, idx) => {
          const lease = leases?.find((l) => l.id === v.leaseId);
          const isSettled = (v.status as any) === "settled";
          return {
            id: v.id || `ctx-dep-${idx}`,
            leaseId: v.leaseId,
            deposit_type: v.name.replace("Receipts Voucher - ", "").replace("Receipt Voucher - ", ""),
            coa_account_code: v.credit || "21100 - Refundable Deposit Liability",
            amount: Number(v.amount) || 0,
            status: isSettled ? "Settled" : "Refundable",
            property_name: lease?.property || "Old Salata - Residence No:23",
            unit_ref: lease?.unit || "AAA - Flat16",
            tenant_name: lease?.tenantName || "Mr. Hafeez Shaik",
            lease_start_date: lease?.startDate || "2025-10-01",
            lease_end_date: lease?.endDate || "2026-09-30",
            monthly_rent: lease?.monthlyRent || 5600,
            total_contract_rent: (lease?.monthlyRent ? lease.monthlyRent * 12 : 67200),
            created_at: lease?.startDate || "2026-08-01",
          };
        });

      const allMap = new Map<string, DepositRecord>();

      DEFAULT_GL21100_DEPOSITS.forEach(d => allMap.set(String(d.id), { ...d }));

      dbData.forEach(d => {
        allMap.set(String(d.id), {
          id: d.id,
          deposit_type: d.deposit_type || "Refundable Deposit (21100)",
          coa_account_code: d.coa_account_code || "21100 - Refundable Security Deposit",
          amount: Number(d.amount) || 0,
          status: d.status === "Settled" ? "Settled" : "Refundable",
          property_name: d.property_name || "Old Salata - Residence No:23",
          unit_ref: d.unit_ref || "AAA - Flat16",
          tenant_name: d.tenant_name || "Mr. Hafeez Shaik",
          lease_start_date: d.lease_start_date,
          lease_end_date: d.lease_end_date,
          created_at: d.created_at,
        });
      });

      contextDeposits.forEach(d => {
        allMap.set(String(d.id), d);
      });

      const merged = Array.from(allMap.values());
      merged.sort((a, b) => new Date(b.lease_start_date || b.created_at || "").getTime() - new Date(a.lease_start_date || a.created_at || "").getTime());
      setDeposits(merged);
      setPage(1);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
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
        setSharedVouchers(prev => prev.map(v => v.id === id ? { ...v, status: "settled" as any } : v));
        setDeposits(prev => prev.map(d => d.id === id ? { ...d, status: "Settled" } : d));
      } else {
        await settleDeposit(Number(id), deductions, refund);
      }

      if (refund > 0) {
        // Payment Voucher handles the fund outflow posting to GL (DR 21100 / CR 12000)
        addVoucher({
          voucher_no: `VCH-PAY-REF-${Date.now().toString().slice(-4)}`,
          voucher_type: "Payment Voucher",
          date: todayStr,
          name: `Deposit Settlement Refund — ${targetTenant} (${targetDep.deposit_type})`,
          debit: "Refundable Security Deposit - Tenant",
          debit_code: "21100006",
          credit: "Bank Account",
          credit_code: "12000",
          amount: refund,
          method: "Bank Transfer",
          property_name: targetProp,
          unit_ref: targetUnit,
          tenant_name: targetTenant,
        });
      }

      if (deductions > 0) {
        addJournalEntry({
          je_no: `JE-DED-21100-${String(id).replace(/\W/g, "")}-${Date.now().toString().slice(-4)}`,
          posting_date: todayStr,
          reference: `DED-21100-${id}`,
          narration: `Deductions from Refundable Deposit (${targetDep.deposit_type}) — ${targetTenant} (${targetUnit})`,
          dr_account: "Refundable Security Deposit - Tenant",
          dr_code: "21100006",
          cr_account: "Damage Recovery Income",
          cr_code: "41201001",
          amount: deductions,
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
        vouchers: [{
          receiptNo: `PV-REF-${Date.now().toString().slice(-4)}`,
          name: `${targetDep.deposit_type} Settlement Refund (Gross: ${amount}, Deductions: ${deductions}, Net: ${refund})`,
          amount: refund,
          method: "Bank Transfer",
          debit: "21100 - Refundable Deposit Liability",
          credit: "12000 - Bank Operating Account",
        }],
        totalCollected: refund,
        cashierName: "Finance Department",
        notes: `OFFICIAL SETTLEMENT REFUND RECEIPT (${targetDep.deposit_type}): Gross: QR ${amount.toLocaleString()} | Deductions: QR ${deductions.toLocaleString()} | Net Refund: QR ${refund.toLocaleString()}. GL 21100 posted.`,
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
    const details: TenantReceiptDetails = {
      receiptNo: dep.receipt_no || `REC-DEP-${String(dep.id).slice(-4)}`,
      acknowledgementNo: `DEP-ACK-${dep.id}`,
      date: new Date().toISOString().split("T")[0],
      tenantName: dep.tenant_name && dep.tenant_name !== "—" ? dep.tenant_name : "Mr. Hafeez Shaik",
      propertyName: dep.property_name && dep.property_name !== "—" ? dep.property_name : "Old Salata - Residence No:23",
      unitRef: dep.unit_ref && dep.unit_ref !== "—" ? dep.unit_ref : "AAA - Flat16",
      leaseStartDate: dep.lease_start_date || "2025-10-01",
      leaseEndDate: dep.lease_end_date || "2026-09-30",
      monthlyRent: dep.monthly_rent || 5600,
      totalContractRent: dep.total_contract_rent || (dep.monthly_rent ? dep.monthly_rent * 12 : 67200),
      depositAmount: Number(dep.amount) || 0,
      depositMode: dep.deposit_type || "Refundable Security Deposit",
      pdcCount: 0,
      pdcs: [],
      vouchers: [{
        receiptNo: dep.receipt_no || `RV-DEP-${dep.id}`,
        name: `${dep.deposit_type} Voucher`,
        amount: Number(dep.amount) || 0,
        debit: "Cash In Hand / Bank",
        credit: dep.coa_account_code || "21100 - Refundable Deposit Liability",
      }],
      totalCollected: Number(dep.amount) || 0,
      cashierName: "Finance Department",
      notes: `Official acknowledgment for ${dep.deposit_type} held under GL ${dep.coa_account_code}. Status: ${dep.status} (By Default Refundable).`,
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
                        <TableCell className="font-mono text-xs text-muted-foreground">{d.lease_start_date || d.created_at || "2026-08-01"}</TableCell>
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
                        <TableCell className="text-right font-bold font-mono text-xs">{Number(d.amount).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={d.status === "Settled" ? "outline" : "secondary"}
                            className={`text-xs ${
                              d.status === "Settled"
                                ? "border-muted text-muted-foreground"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300"
                            }`}
                          >
                            {d.status === "Settled" ? "Settled" : "Refundable (Default)"}
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
