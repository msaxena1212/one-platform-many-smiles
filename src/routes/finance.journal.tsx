import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { createERPVoucher, type ERPVoucher } from "@/lib/supabase";
import { useAppData } from "@/lib/app-data-context";
import { Loader2, Plus, ArrowDownLeft, ArrowUpRight, Receipt, Banknote, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/finance/journal")({
  component: TransactionsPage,
});

const VOUCHER_TYPES = [
  { value: "Receipt", label: "Receipt Voucher", icon: ArrowDownLeft, color: "text-green-600 bg-green-50" },
  { value: "Deposit", label: "Deposit Voucher", icon: Banknote, color: "text-blue-600 bg-blue-50" },
  { value: "Cheque Return", label: "Cheque Returned", icon: RotateCcw, color: "text-red-600 bg-red-50" },
  { value: "Rent Income", label: "Rent Income", icon: Receipt, color: "text-emerald-600 bg-emerald-50" },
  { value: "Payment", label: "Payment Voucher", icon: ArrowUpRight, color: "text-orange-600 bg-orange-50" },
];

function toVoucherType(name: string): ERPVoucher["voucher_type"] {
  if (name.includes("Deposit")) return "Deposit";
  if (name.includes("Cheque Return")) return "Cheque Return";
  if (name.includes("Rent Income") || name.includes("Rental Income")) return "Rent Income";
  if (name.includes("Payment")) return "Payment";
  return "Receipt";
}

function TransactionsPage() {
  const { vouchers: sharedVouchers, setVouchers, syncing } = useAppData();
  const [activeType, setActiveType] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [vForm, setVForm] = useState({
    voucher_no: "",
    voucher_type: "Receipt" as ERPVoucher["voucher_type"],
    voucher_date: new Date().toISOString().slice(0, 10),
    total_amount: 0,
    notes: "",
  });
  const [lines, setLines] = useState([
    { account_name: "", debit: 0, credit: 0 },
    { account_name: "", debit: 0, credit: 0 },
  ]);

  const vouchers: ERPVoucher[] = sharedVouchers.map((voucher) => ({
    id: voucher.id,
    voucher_no: voucher.receiptNo ?? voucher.id,
    voucher_type: toVoucherType(voucher.name),
    voucher_date: voucher.period?.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "",
    total_amount: voucher.amount,
    notes: `${voucher.name}${voucher.period ? ` | ${voucher.period}` : ""} | ${voucher.debit} -> ${voucher.credit}`,
    created_at: "",
    erp_journal_entries: [
      { id: `${voucher.id}-dr`, voucher_id: voucher.id, account_name: voucher.debit, debit: voucher.amount, credit: 0, created_at: "" },
      { id: `${voucher.id}-cr`, voucher_id: voucher.id, account_name: voucher.credit, debit: 0, credit: voucher.amount, created_at: "" },
    ],
  }));

  const filtered = activeType === "all" ? vouchers : vouchers.filter((voucher) => voucher.voucher_type === activeType);
  const totalDr = filtered.reduce((sum, voucher) => sum + (voucher.erp_journal_entries || []).reduce((acc, line) => acc + Number(line.debit || 0), 0), 0);
  const totalCr = filtered.reduce((sum, voucher) => sum + (voucher.erp_journal_entries || []).reduce((acc, line) => acc + Number(line.credit || 0), 0), 0);

  async function handleCreate() {
    if (!vForm.voucher_no || !vForm.voucher_type) {
      return toast.error("Voucher No and Type are required");
    }

    const drTotal = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
    const crTotal = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
    if (Math.abs(drTotal - crTotal) > 0.01) {
      return toast.error(`Journal is not balanced. Dr: ${drTotal} vs Cr: ${crTotal}`);
    }

    setSaving(true);
    try {
      await createERPVoucher({ ...vForm }, lines.filter((line) => line.account_name));

      const primaryDebit = lines.find((line) => line.debit > 0);
      const primaryCredit = lines.find((line) => line.credit > 0);
      setVouchers((previous) => [
        {
          id: `v${previous.length + 1}`,
          leaseId: "",
          name: `${vForm.voucher_type} Voucher`,
          receiptNo: vForm.voucher_no,
          method: vForm.voucher_type === "Receipt" ? "Manual" : "Journal",
          period: vForm.voucher_date,
          debit: primaryDebit?.account_name || "Unknown Debit",
          credit: primaryCredit?.account_name || "Unknown Credit",
          amount: vForm.total_amount || drTotal,
          status: "posted",
        },
        ...previous,
      ]);

      toast.success("Voucher created successfully");
      setShowNew(false);
      setVForm({ voucher_no: "", voucher_type: "Receipt", voucher_date: new Date().toISOString().slice(0, 10), total_amount: 0, notes: "" });
      setLines([
        { account_name: "", debit: 0, credit: 0 },
        { account_name: "", debit: 0, credit: 0 },
      ]);
    } catch (error: any) {
      toast.error("Failed: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  const vTypeInfo = (type: string) => VOUCHER_TYPES.find((item) => item.value === type) || VOUCHER_TYPES[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Finance Transactions</h2>
          <p className="text-sm text-muted-foreground">Live journal built from the shared voucher store.</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Voucher
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {VOUCHER_TYPES.map((voucherType) => {
          const count = vouchers.filter((voucher) => voucher.voucher_type === voucherType.value).length;
          const total = vouchers.filter((voucher) => voucher.voucher_type === voucherType.value).reduce((sum, voucher) => sum + Number(voucher.total_amount || 0), 0);
          return (
            <Card
              key={voucherType.value}
              className={`cursor-pointer transition-all border-2 ${activeType === voucherType.value ? "border-primary" : "border-border hover:border-primary/30"}`}
              onClick={() => setActiveType(activeType === voucherType.value ? "all" : voucherType.value)}
            >
              <CardContent className="p-4">
                <div className={`inline-flex items-center justify-center rounded-lg p-2 mb-2 ${voucherType.color}`}>
                  <voucherType.icon className="h-4 w-4" />
                </div>
                <div className="text-xs font-medium text-muted-foreground">{voucherType.label}</div>
                <div className="text-lg font-bold mt-1">{count}</div>
                <div className="text-xs text-muted-foreground">QR {total.toLocaleString()}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-6 px-4 py-3 bg-muted/30 rounded-xl border border-border text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Total Dr:</span>
          <span className="font-semibold text-blue-600">QR {totalDr.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Total Cr:</span>
          <span className="font-semibold text-red-600">QR {totalCr.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Balance:</span>
          <span className={`font-semibold ${Math.abs(totalDr - totalCr) < 0.01 ? "text-green-600" : "text-red-600"}`}>
            {Math.abs(totalDr - totalCr) < 0.01 ? "Balanced" : `QR ${(totalDr - totalCr).toLocaleString()} Unbalanced`}
          </span>
        </div>
        <div className="ml-auto text-muted-foreground">{filtered.length} vouchers shown</div>
      </div>

      <Card>
        <CardContent className="p-0">
          {syncing ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No transactions found</div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((voucher) => {
                const info = vTypeInfo(voucher.voucher_type);
                const isExpanded = expandedId === voucher.id;
                const entries = voucher.erp_journal_entries || [];
                return (
                  <div key={voucher.id}>
                    <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted/10 cursor-pointer transition-colors" onClick={() => setExpandedId(isExpanded ? null : voucher.id)}>
                      <div className={`flex items-center justify-center rounded-lg h-9 w-9 flex-shrink-0 ${info.color}`}>
                        <info.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{voucher.voucher_no}</div>
                        <div className="text-xs text-muted-foreground">{info.label} - {voucher.voucher_date || "Shared voucher"}</div>
                        {voucher.notes && <div className="text-xs text-muted-foreground mt-0.5 truncate">{voucher.notes}</div>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-sm">QR {Number(voucher.total_amount || 0).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{entries.length} lines</div>
                      </div>
                    </div>
                    {isExpanded && entries.length > 0 && (
                      <div className="bg-muted/5 border-t border-border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="px-10 py-2 text-left text-xs text-muted-foreground font-medium">Account Name</th>
                              <th className="px-6 py-2 text-right text-xs text-muted-foreground font-medium">Debit (QR)</th>
                              <th className="px-6 py-2 text-right text-xs text-muted-foreground font-medium">Credit (QR)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {entries.map((entry, index) => (
                              <tr key={entry.id || index} className="border-b border-border/50 last:border-0">
                                <td className="px-10 py-2 text-sm">{entry.account_name}</td>
                                <td className="px-6 py-2 text-right font-mono text-sm text-blue-600">{Number(entry.debit || 0) > 0 ? Number(entry.debit).toLocaleString() : "-"}</td>
                                <td className="px-6 py-2 text-right font-mono text-sm text-red-600">{Number(entry.credit || 0) > 0 ? Number(entry.credit).toLocaleString() : "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Finance Voucher</DialogTitle>
            <DialogDescription>Create a double-entry journal voucher. Debit must equal Credit.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Voucher No *</Label>
                <Input value={vForm.voucher_no} onChange={(e) => setVForm((form) => ({ ...form, voucher_no: e.target.value }))} placeholder="e.g. RV-2026-001" />
              </div>
              <div className="space-y-1">
                <Label>Voucher Type *</Label>
                <Select value={vForm.voucher_type} onValueChange={(value) => setVForm((form) => ({ ...form, voucher_type: value as ERPVoucher["voucher_type"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VOUCHER_TYPES.map((type) => <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Voucher Date *</Label>
                <Input type="date" value={vForm.voucher_date} onChange={(e) => setVForm((form) => ({ ...form, voucher_date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Total Amount (QR)</Label>
                <Input type="number" value={vForm.total_amount || ""} onChange={(e) => setVForm((form) => ({ ...form, total_amount: Number(e.target.value) }))} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Notes / Narration</Label>
                <Input value={vForm.notes} onChange={(e) => setVForm((form) => ({ ...form, notes: e.target.value }))} placeholder="Description of this transaction" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Journal Entries</Label>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setLines((current) => [...current, { account_name: "", debit: 0, credit: 0 }])}>
                  + Add Line
                </Button>
              </div>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs text-muted-foreground font-medium">Account Name</th>
                      <th className="px-3 py-2 text-right text-xs text-muted-foreground font-medium">Dr (QR)</th>
                      <th className="px-3 py-2 text-right text-xs text-muted-foreground font-medium">Cr (QR)</th>
                      <th className="w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, index) => (
                      <tr key={index} className="border-t border-border">
                        <td className="px-2 py-1">
                          <Input value={line.account_name} onChange={(e) => setLines((items) => items.map((item, i) => i === index ? { ...item, account_name: e.target.value } : item))} className="h-8 text-sm" placeholder="e.g. PDC In Hand" />
                        </td>
                        <td className="px-2 py-1 text-right">
                          <Input type="number" value={line.debit || ""} onChange={(e) => setLines((items) => items.map((item, i) => i === index ? { ...item, debit: Number(e.target.value) } : item))} className="h-8 text-sm text-right w-28" />
                        </td>
                        <td className="px-2 py-1 text-right">
                          <Input type="number" value={line.credit || ""} onChange={(e) => setLines((items) => items.map((item, i) => i === index ? { ...item, credit: Number(e.target.value) } : item))} className="h-8 text-sm text-right w-28" />
                        </td>
                        <td className="px-2 py-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500" onClick={() => setLines((items) => items.filter((_, i) => i !== index))}>
                            x
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Post Voucher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
