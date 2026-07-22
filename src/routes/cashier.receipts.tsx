import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchReceipts, createReceipt, type Receipt } from "@/lib/supabase";
import { formatSAR } from "@/lib/mock-data"; 
import { Loader2, Plus, CreditCard, Banknote, Building, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateReceiptBlob } from "@/components/receipt-template";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/cashier/receipts")({
  component: ReceiptsPage,
});

function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ amount: 0, payment_mode: 'cash', ref: '', status: 'completed' });

  useEffect(() => {
    loadReceipts();
  }, []);

  async function loadReceipts() {
    setLoading(true);
    fetchReceipts().then(data => {
      setReceipts(data || []);
    }).catch(e => {
      console.error(e);
      setReceipts([]);
    }).finally(() => {
      setLoading(false);
    });
  }

  const getMethodIcon = (method: string) => {
    switch(method) {
      case 'cash': return <Banknote className="h-4 w-4 text-green-600" />;
      case 'bank':
      case 'bank_transfer': return <Building className="h-4 w-4 text-blue-600" />;
      default: return <CreditCard className="h-4 w-4 text-purple-600" />;
    }
  };

  const handleDownload = async (rec: any) => {
    try {
      const blob = await generateReceiptBlob({
        receipt_no: rec.ref || rec.id.slice(0, 8),
        receipt_date: rec.received_at,
        tenant_name: 'Tenant (Mock)',
        property_unit: 'Unit (Mock)',
        payment_type: 'Rent',
        payment_method: rec.payment_mode,
        amount: rec.amount
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt-${rec.ref || rec.id.slice(0,8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("Failed to generate PDF");
    }
  };

  async function handleAddReceipt(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createReceipt(formData);
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
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Record Receipt
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record New Receipt</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddReceipt} className="space-y-4">
              <div className="space-y-2">
                <Label>Amount (QAR)</Label>
                <Input type="number" required value={formData.amount} onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.payment_mode} onChange={e => setFormData({...formData, payment_mode: e.target.value})}>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Reference Number</Label>
                <Input value={formData.ref} onChange={e => setFormData({...formData, ref: e.target.value})} placeholder="Optional Ref" />
              </div>
              <Button type="submit" className="w-full">Generate</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="py-4 border-b border-border">
          <CardTitle className="text-base font-semibold">Recent Receipts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : receipts.length === 0 ? (
             <div className="py-8 text-center text-sm text-muted-foreground">No receipts found.</div>
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
                {receipts.map(rec => (
                  <tr key={rec.id} className="hover:bg-muted/10">
                    <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                      {new Date(rec.received_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{rec.ref || "—"}</td>
                    <td className="px-6 py-4 capitalize">
                      <div className="flex items-center space-x-2">
                        {getMethodIcon(rec.payment_mode)}
                        <span>{rec.payment_mode.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">{formatSAR(rec.amount)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        rec.status === 'completed' ? 'bg-[oklch(0.55_0.13_155)]/15 text-[oklch(0.4_0.13_155)]' : 'bg-muted text-muted-foreground'
                      }`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(rec)}>
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
