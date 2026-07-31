import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchReceipts, createReceipt, type Receipt } from "@/lib/supabase";
import { Loader2, Plus, CreditCard, Banknote, Building, Download, FileText, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateReceiptBlob, VIVEK_RECEIPT_DATA, type ReceiptData } from "@/components/receipt-template";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/lib/app-data-context";

export const Route = createFileRoute("/cashier/receipts")({
  component: ReceiptsPage,
});

function ReceiptsPage() {
  const { vouchers, leases, syncing } = useAppData();
  const [dbReceipts, setDbReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ amount: 0, payment_mode: 'cash', ref: '', status: 'completed' });

  useEffect(() => { loadReceipts(); }, []);

  // Build receipt acknowledgements from context vouchers (the real-time source of truth)
  type LocalReceipt = ReceiptData & { id: string; received_at: string; payment_mode: string; status: string };
  const contextReceipts: LocalReceipt[] = leases.map(lease => {
    const leaseVouchers = vouchers.filter(v => v.leaseId === lease.id && v.status === 'posted');
    if (leaseVouchers.length === 0) return null;
    const total = leaseVouchers.reduce((s, v) => s + v.amount, 0);
    const firstVoucher = leaseVouchers[0];
    return {
      id: `ctx-${lease.id}`,
      acknowledgement_no: firstVoucher.receiptNo,
      receipt_no: firstVoucher.receiptNo,
      tenant_name: lease.tenantName,
      property_name: lease.property,
      lease_no: `${lease.property.substring(0, 4).toUpperCase()}-LES-${lease.startDate.slice(2, 4)}-${lease.id.slice(-2)}-0`,
      location_code: lease.unit,
      collection_date: lease.startDate,
      lease_start_date: lease.startDate,
      lease_end_date: lease.endDate,
      total_amount: total,
      amount_in_words: '',
      line_items: leaseVouchers.map((v, i) => ({
        sNo: i + 1,
        description: v.name.replace(' Voucher', '').replace(' Doc', ''),
        chequeRef: v.receiptNo,
        maturityDate: '',
        type: (v.method === 'Cash' ? 'Cash' : 'PDC') as 'Cash' | 'PDC',
        amount: v.amount,
      })),
      received_at: lease.startDate,
      payment_mode: leaseVouchers.some(v => v.method === 'PDC') ? 'Cash + PDC' : 'Cash',
      status: 'posted',
    } as LocalReceipt;
  }).filter((r): r is LocalReceipt => r !== null);

  async function loadReceipts() {
    setLoading(true);
    fetchReceipts()
      .then(data => setDbReceipts(data || []))
      .catch(() => setDbReceipts([]))
      .finally(() => setLoading(false));
  }

  const getMethodIcon = (method: string) => {
    if (method.toLowerCase().includes('cash')) return <Banknote className="h-4 w-4 text-green-600" />;
    if (method.toLowerCase().includes('bank') || method.toLowerCase().includes('transfer')) return <Building className="h-4 w-4 text-blue-600" />;
    if (method.toLowerCase().includes('pdc')) return <FileText className="h-4 w-4 text-purple-600" />;
    return <CreditCard className="h-4 w-4 text-purple-600" />;
  };

  const handleDownload = async (data: ReceiptData, filename: string) => {
    try {
      const blob = await generateReceiptBlob(data);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF. Check browser console for details.");
    }
  };

  const handleDownloadDb = (rec: Receipt) => {
    handleDownload({
      receipt_no: rec.ref || rec.id.slice(0, 8),
      acknowledgement_no: rec.ref || rec.id.slice(0, 8),
      receipt_date: rec.received_at,
      tenant_name: 'Tenant',
      property_name: '',
      lease_no: rec.ref || '',
      collection_date: new Date(rec.received_at).toLocaleDateString(),
      lease_start_date: '',
      lease_end_date: '',
      payment_method: rec.payment_mode,
      amount: rec.amount,
      total_amount: rec.amount,
      amount_in_words: '',
      line_items: [],
    }, `Receipt-${rec.ref || rec.id.slice(0, 8)}.pdf`);
  };

  async function handleAddReceipt(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createReceipt(formData as any);
      setIsAddOpen(false);
      setFormData({ amount: 0, payment_mode: 'cash', ref: '', status: 'completed' });
      loadReceipts();
    } catch (err) {
      console.error(err);
      alert("Failed to create receipt");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Receipts & Invoices</h2>
          <p className="text-sm text-muted-foreground">Manage incoming payments and tenant receivables.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-2 h-4 w-4" />Record Receipt</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Record New Receipt</DialogTitle></DialogHeader>
            <form onSubmit={handleAddReceipt} className="space-y-4">
              <div className="space-y-2">
                <Label>Amount (QAR)</Label>
                <Input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.payment_mode} onChange={e => setFormData({...formData, payment_mode: e.target.value})}>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque / PDC</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Reference Number</Label>
                <Input value={formData.ref} onChange={e => setFormData({...formData, ref: e.target.value})} placeholder="Voucher / Cheque ref" />
              </div>
              <Button type="submit" className="w-full">Generate</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Context / Live Receipts ── */}
      <Card>
        <CardHeader className="py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Receipt Acknowledgements</CardTitle>
              <CardDescription>Live from leasing module — synced across all roles via Supabase Realtime.</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1 text-green-700 border-green-300 bg-green-50">
              <Wifi className="h-3 w-3" /> Live Sync
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {syncing ? (
            <div className="flex h-24 items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Syncing with Supabase…</span>
            </div>
          ) : contextReceipts.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No posted vouchers yet. Add leases in the Leasing module.</div>
          ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/10 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Ack No.</th>
                <th className="px-4 py-3 font-medium">Tenant</th>
                <th className="px-4 py-3 font-medium">Property / Unit</th>
                <th className="px-4 py-3 font-medium">Collection Date</th>
                <th className="px-4 py-3 font-medium">Lease Period</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium text-right">Total (QAR)</th>
                <th className="px-4 py-3 font-medium text-right">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>

              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {LOCAL_RECEIPTS.map(rec => (
                <tr key={rec.id} className="hover:bg-muted/10">
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{rec.acknowledgement_no}</td>
                  <td className="px-4 py-3 font-medium">{rec.tenant_name}</td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-medium">{rec.property_name}</div>
                    <div className="text-muted-foreground">{rec.location_code}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{rec.collection_date}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{rec.lease_start_date} – {rec.lease_end_date}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {getMethodIcon(rec.payment_mode)}
                      <span className="text-xs">{rec.payment_mode}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    QR {rec.total_amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 text-xs">
                      {rec.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="outline" size="sm" className="gap-1" onClick={() => handleDownload(rec, `${rec.acknowledgement_no}.pdf`)}>
                      <Download className="h-3.5 w-3.5" /> PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* ── Supabase DB Receipts ── */}
      <Card>
        <CardHeader className="py-4 border-b border-border">
          <CardTitle className="text-base font-semibold">Database Receipts</CardTitle>
          <CardDescription>Receipts recorded directly via the cashier module.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : dbReceipts.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">No additional receipts in database.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted/10 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Reference</th>
                  <th className="px-6 py-3 font-medium">Method</th>
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                  <th className="px-6 py-3 font-medium text-right">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dbReceipts.map(rec => (
                  <tr key={rec.id} className="hover:bg-muted/10">
                    <td className="px-6 py-4 text-muted-foreground">{new Date(rec.received_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-mono text-xs">{rec.ref || "—"}</td>
                    <td className="px-6 py-4 capitalize">
                      <div className="flex items-center space-x-2">
                        {getMethodIcon(rec.payment_mode)}
                        <span>{rec.payment_mode.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">QR {Number(rec.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="outline" className={rec.status === 'completed' ? 'text-green-700 border-green-300 bg-green-50' : ''}>
                        {rec.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadDb(rec)}>
                        <Download className="h-4 w-4 mr-1" /> PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
