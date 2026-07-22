import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchERPVouchers, createERPVoucher,
  type ERPVoucher
} from "@/lib/supabase";
import { Loader2, Plus, ArrowDownLeft, ArrowUpRight, Receipt, FileText, Banknote, RotateCcw } from "lucide-react";
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

// Demo transactions from the Accounts-Transactions sheet
const DEMO_TRANSACTIONS = [
  {
    id: 'd1', voucher_no: 'RV-001', voucher_type: 'Receipt', voucher_date: '2025-10-01', total_amount: 67200, notes: 'Receipt Voucher - Rent (PDC)',
    erp_journal_entries: [
      { id: 'j1', account_name: 'PDC In Hand', debit: 67200, credit: 0 },
      { id: 'j2', account_name: 'Customer(PDC)-AAA Flat16', debit: 0, credit: 67200 },
    ]
  },
  {
    id: 'd2', voucher_no: 'RV-002', voucher_type: 'Receipt', voucher_date: '2025-10-01', total_amount: 5100, notes: 'Receipt Voucher - Deposit (Cash)',
    erp_journal_entries: [
      { id: 'j3', account_name: 'Cash In Hand', debit: 5100, credit: 0 },
      { id: 'j4', account_name: 'Deposit-Customer-AAA Flat16', debit: 0, credit: 5100 },
    ]
  },
  {
    id: 'd3', voucher_no: 'DV-001', voucher_type: 'Deposit', voucher_date: '2025-11-01', total_amount: 5600, notes: 'Deposit Voucher - PDC (Nov)',
    erp_journal_entries: [
      { id: 'j5', account_name: 'Bank Account', debit: 5600, credit: 0 },
      { id: 'j6', account_name: 'PDC In Hand', debit: 0, credit: 5600 },
      { id: 'j7', account_name: 'Customer(PDC)-AAA Flat16', debit: 5600, credit: 0 },
      { id: 'j8', account_name: 'Receivable-AAA Flat16', debit: 0, credit: 5600 },
    ]
  },
  {
    id: 'd4', voucher_no: 'RI-001', voucher_type: 'Rent Income', voucher_date: '2025-11-01', total_amount: 5600, notes: 'Revenue Generation - Nov 2025',
    erp_journal_entries: [
      { id: 'j9', account_name: 'Receivable-AAA Flat16', debit: 5600, credit: 0 },
      { id: 'j10', account_name: 'Rental Income', debit: 0, credit: 5600 },
    ]
  },
  {
    id: 'd5', voucher_no: 'DV-002', voucher_type: 'Deposit', voucher_date: '2025-11-01', total_amount: 5100, notes: 'Deposit Voucher - Cash (Nov)',
    erp_journal_entries: [
      { id: 'j11', account_name: 'Bank Account', debit: 5100, credit: 0 },
      { id: 'j12', account_name: 'Cash In Hand', debit: 0, credit: 5100 },
    ]
  },
];

function TransactionsPage() {
  const [vouchers, setVouchers] = useState<ERPVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("all");
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [vForm, setVForm] = useState({
    voucher_no: "", voucher_type: "Receipt" as ERPVoucher["voucher_type"],
    voucher_date: new Date().toISOString().slice(0, 10), total_amount: 0, notes: "",
  });
  const [lines, setLines] = useState([
    { account_name: "", debit: 0, credit: 0 },
    { account_name: "", debit: 0, credit: 0 },
  ]);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchERPVouchers();
      // Merge with demo data if empty
      if (!data || data.length === 0) {
        setVouchers(DEMO_TRANSACTIONS as any);
      } else {
        setVouchers([...(DEMO_TRANSACTIONS as any), ...data]);
      }
    } catch (e) {
      setVouchers(DEMO_TRANSACTIONS as any);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const filtered = activeType === "all"
    ? vouchers
    : vouchers.filter(v => v.voucher_type === activeType);

  const totalDr = filtered.reduce((s, v) => s + (v.erp_journal_entries || []).reduce((a, l) => a + Number(l.debit || 0), 0), 0);
  const totalCr = filtered.reduce((s, v) => s + (v.erp_journal_entries || []).reduce((a, l) => a + Number(l.credit || 0), 0), 0);

  async function handleCreate() {
    if (!vForm.voucher_no || !vForm.voucher_type) return toast.error("Voucher No and Type are required");
    const drTotal = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
    const crTotal = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
    if (Math.abs(drTotal - crTotal) > 0.01) return toast.error(`Journal is not balanced! Dr: ${drTotal} ≠ Cr: ${crTotal}`);
    setSaving(true);
    try {
      await createERPVoucher({ ...vForm }, lines.filter(l => l.account_name));
      toast.success("Voucher created successfully!");
      setShowNew(false);
      await load();
    } catch (e: any) {
      toast.error("Failed: " + e.message);
    } finally { setSaving(false); }
  }

  const vTypeInfo = (type: string) => VOUCHER_TYPES.find(t => t.value === type) || VOUCHER_TYPES[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Finance Transactions</h2>
          <p className="text-sm text-muted-foreground">Vouchers, Journal Entries & Accounting Ledger</p>
        </div>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="h-4 w-4 mr-2" /> New Voucher
        </Button>
      </div>

      {/* Voucher Type Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {VOUCHER_TYPES.map(vt => {
          const count = vouchers.filter(v => v.voucher_type === vt.value).length;
          const total = vouchers.filter(v => v.voucher_type === vt.value).reduce((s, v) => s + Number(v.total_amount || 0), 0);
          return (
            <Card
              key={vt.value}
              className={`cursor-pointer transition-all border-2 ${activeType === vt.value ? 'border-primary' : 'border-border hover:border-primary/30'}`}
              onClick={() => setActiveType(activeType === vt.value ? 'all' : vt.value)}
            >
              <CardContent className="p-4">
                <div className={`inline-flex items-center justify-center rounded-lg p-2 mb-2 ${vt.color}`}>
                  <vt.icon className="h-4 w-4" />
                </div>
                <div className="text-xs font-medium text-muted-foreground">{vt.label}</div>
                <div className="text-lg font-bold mt-1">{count}</div>
                <div className="text-xs text-muted-foreground">QR {total.toLocaleString()}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Bar */}
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
          <span className={`font-semibold ${Math.abs(totalDr - totalCr) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(totalDr - totalCr) < 0.01 ? '✓ Balanced' : `QR ${(totalDr - totalCr).toLocaleString()} Unbalanced`}
          </span>
        </div>
        <div className="ml-auto text-muted-foreground">{filtered.length} vouchers shown</div>
      </div>

      {/* Vouchers List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No transactions found</div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(v => {
                const info = vTypeInfo(v.voucher_type);
                const isExpanded = expandedId === v.id;
                const entries = v.erp_journal_entries || [];
                return (
                  <div key={v.id}>
                    <div
                      className="flex items-center gap-4 px-5 py-4 hover:bg-muted/10 cursor-pointer transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : v.id)}
                    >
                      <div className={`flex items-center justify-center rounded-lg h-9 w-9 flex-shrink-0 ${info.color}`}>
                        <info.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm">{v.voucher_no}</div>
                        <div className="text-xs text-muted-foreground">{info.label} · {v.voucher_date}</div>
                        {v.notes && <div className="text-xs text-muted-foreground mt-0.5 truncate">{v.notes}</div>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-semibold text-sm">QR {Number(v.total_amount || 0).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">{entries.length} lines</div>
                      </div>
                      <div className="text-muted-foreground text-xs ml-2">{isExpanded ? '▲' : '▼'}</div>
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
                            {entries.map((e: any, i: number) => (
                              <tr key={e.id || i} className="border-b border-border/50 last:border-0">
                                <td className="px-10 py-2 text-sm">{e.account_name}</td>
                                <td className="px-6 py-2 text-right font-mono text-sm text-blue-600">
                                  {Number(e.debit || 0) > 0 ? Number(e.debit).toLocaleString() : '—'}
                                </td>
                                <td className="px-6 py-2 text-right font-mono text-sm text-red-600">
                                  {Number(e.credit || 0) > 0 ? Number(e.credit).toLocaleString() : '—'}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-muted/20">
                              <td className="px-10 py-2 text-xs font-semibold text-muted-foreground">TOTAL</td>
                              <td className="px-6 py-2 text-right font-mono text-sm font-semibold text-blue-700">
                                {entries.reduce((s: number, e: any) => s + Number(e.debit || 0), 0).toLocaleString()}
                              </td>
                              <td className="px-6 py-2 text-right font-mono text-sm font-semibold text-red-700">
                                {entries.reduce((s: number, e: any) => s + Number(e.credit || 0), 0).toLocaleString()}
                              </td>
                            </tr>
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

      {/* New Voucher Dialog */}
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
                <Input value={vForm.voucher_no} onChange={e => setVForm(f => ({ ...f, voucher_no: e.target.value }))} placeholder="e.g. RV-2026-001" />
              </div>
              <div className="space-y-1">
                <Label>Voucher Type *</Label>
                <Select value={vForm.voucher_type} onValueChange={v => setVForm(f => ({ ...f, voucher_type: v as any }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {VOUCHER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Voucher Date *</Label>
                <Input type="date" value={vForm.voucher_date} onChange={e => setVForm(f => ({ ...f, voucher_date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Total Amount (QR)</Label>
                <Input type="number" value={vForm.total_amount || ''} onChange={e => setVForm(f => ({ ...f, total_amount: Number(e.target.value) }))} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Notes / Narration</Label>
                <Input value={vForm.notes} onChange={e => setVForm(f => ({ ...f, notes: e.target.value }))} placeholder="Description of this transaction" />
              </div>
            </div>

            {/* Journal Lines */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Journal Entries</Label>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setLines(l => [...l, { account_name: '', debit: 0, credit: 0 }])}>
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
                    {lines.map((line, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="px-2 py-1">
                          <Input value={line.account_name} onChange={e => setLines(ls => ls.map((l, j) => j === i ? { ...l, account_name: e.target.value } : l))} className="h-8 text-sm" placeholder="e.g. PDC In Hand" />
                        </td>
                        <td className="px-2 py-1 text-right">
                          <Input type="number" value={line.debit || ''} onChange={e => setLines(ls => ls.map((l, j) => j === i ? { ...l, debit: Number(e.target.value) } : l))} className="h-8 text-sm text-right w-28" />
                        </td>
                        <td className="px-2 py-1 text-right">
                          <Input type="number" value={line.credit || ''} onChange={e => setLines(ls => ls.map((l, j) => j === i ? { ...l, credit: Number(e.target.value) } : l))} className="h-8 text-sm text-right w-28" />
                        </td>
                        <td className="px-2 py-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500" onClick={() => setLines(ls => ls.filter((_, j) => j !== i))}>✕</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-muted/10 border-t-2 border-border">
                    <tr>
                      <td className="px-3 py-2 text-xs font-semibold text-muted-foreground">TOTAL</td>
                      <td className="px-3 py-2 text-right font-mono text-sm font-semibold text-blue-600">{lines.reduce((s, l) => s + Number(l.debit || 0), 0).toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-mono text-sm font-semibold text-red-600">{lines.reduce((s, l) => s + Number(l.credit || 0), 0).toLocaleString()}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              {(() => {
                const dr = lines.reduce((s, l) => s + Number(l.debit || 0), 0);
                const cr = lines.reduce((s, l) => s + Number(l.credit || 0), 0);
                return Math.abs(dr - cr) > 0.01 ? (
                  <p className="text-xs text-red-500 mt-1">⚠ Not balanced — Dr ({dr}) ≠ Cr ({cr})</p>
                ) : dr > 0 ? (
                  <p className="text-xs text-green-600 mt-1">✓ Balanced</p>
                ) : null;
              })()}
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
