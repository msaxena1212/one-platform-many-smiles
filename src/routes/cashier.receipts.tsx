import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { fetchReceipts, createReceipt, type Receipt } from "@/lib/supabase";
import { Loader2, Plus, CreditCard, Banknote, Building, Download, FileText, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateReceiptBlob, type ReceiptData } from "@/components/receipt-template";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAppData } from "@/lib/app-data-context";

export const Route = createFileRoute("/cashier/receipts")({
  component: ReceiptsPage,
});

type LocalReceipt = ReceiptData & { id: string; received_at: string; payment_mode: string; status: string };

function ReceiptsPage() {
  const { vouchers, leases, syncing } = useAppData();
  const [dbReceipts, setDbReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ amount: 0, payment_mode: "cash", ref: "", status: "completed" });

  useEffect(() => {
    loadReceipts();
  }, []);

  const contextReceipts: LocalReceipt[] = leases
    .map((lease) => {
      const leaseVouchers = vouchers.filter((voucher) => voucher.leaseId === lease.id && voucher.status === "posted");
      if (leaseVouchers.length === 0) return null;

      const total = leaseVouchers.reduce((sum, voucher) => sum + voucher.amount, 0);
      const firstVoucher = leaseVouchers[0];
      return {
        id: `ctx-${lease.id}`,
        acknowledgement_no: firstVoucher.receiptNo ?? lease.id,
        receipt_no: firstVoucher.receiptNo ?? lease.id,
        tenant_name: lease.tenantName,
        property_name: lease.property,
        lease_no: `${lease.property.substring(0, 4).toUpperCase()}-LES-${lease.startDate.slice(2, 4)}-${lease.id.slice(-2)}-0`,
        location_code: lease.unit,
        collection_date: lease.startDate,
        lease_start_date: lease.startDate,
        lease_end_date: lease.endDate,
        total_amount: total,
        amount_in_words: "",
        line_items: leaseVouchers.map((voucher, index) => ({
          sNo: index + 1,
          description: voucher.name.replace(" Voucher", "").replace(" Doc", ""),
          chequeRef: voucher.receiptNo,
          maturityDate: "",
          type: voucher.method === "Cash" ? "Cash" : "PDC",
          amount: voucher.amount,
        })),
        received_at: lease.startDate,
        payment_mode: leaseVouchers.some((voucher) => voucher.method === "PDC") ? "Cash + PDC" : "Cash",
        status: "posted",
      } as LocalReceipt;
    })
    .filter((receipt): receipt is LocalReceipt => receipt !== null);

  async function loadReceipts() {
    setLoading(true);
    fetchReceipts()
      .then((data) => setDbReceipts(data || []))
      .catch(() => setDbReceipts([]))
      .finally(() => setLoading(false));
  }

  const getMethodIcon = (method: string) => {
    if (method.toLowerCase().includes("cash")) return <Banknote className="h-4 w-4 text-green-600" />;
    if (method.toLowerCase().includes("bank") || method.toLowerCase().includes("transfer")) return <Building className="h-4 w-4 text-blue-600" />;
    if (method.toLowerCase().includes("pdc")) return <FileText className="h-4 w-4 text-purple-600" />;
    return <CreditCard className="h-4 w-4 text-purple-600" />;
  };

  const handleDownload = async (data: ReceiptData, filename: string) => {
    try {
      const blob = await generateReceiptBlob(data);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Failed to generate PDF. Check browser console for details.");
    }
  };

  const handleDownloadDb = (receipt: Receipt) => {
    handleDownload(
      {
        receipt_no: receipt.ref || receipt.id.slice(0, 8),
        acknowledgement_no: receipt.ref || receipt.id.slice(0, 8),
        receipt_date: receipt.received_at,
        tenant_name: "Tenant",
        property_name: "",
        lease_no: receipt.ref || "",
        collection_date: new Date(receipt.received_at).toLocaleDateString(),
        lease_start_date: "",
        lease_end_date: "",
        payment_method: receipt.payment_mode,
        amount: receipt.amount,
        total_amount: receipt.amount,
        amount_in_words: "",
        line_items: [],
      },
      `Receipt-${receipt.ref || receipt.id.slice(0, 8)}.pdf`,
    );
  };

  async function handleAddReceipt(event: React.FormEvent) {
    event.preventDefault();
    try {
      await createReceipt(formData as never);
      setIsAddOpen(false);
      setFormData({ amount: 0, payment_mode: "cash", ref: "", status: "completed" });
      loadReceipts();
    } catch (error) {
      console.error(error);
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
                <Input type="number" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
              </div>
              <div className="space-y-2">
                <Label>Payment Mode</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.payment_mode}
                  onChange={(e) => setFormData({ ...formData, payment_mode: e.target.value })}
                >
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque / PDC</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Reference Number</Label>
                <Input value={formData.ref} onChange={(e) => setFormData({ ...formData, ref: e.target.value })} placeholder="Voucher / Cheque ref" />
              </div>
              <Button type="submit" className="w-full">
                Generate
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">Receipt Acknowledgements</CardTitle>
              <CardDescription>Built from shared leasing vouchers and persisted in local browser storage.</CardDescription>
            </div>
            <Badge variant="outline" className="gap-1 text-green-700 border-green-300 bg-green-50">
              <Wifi className="h-3 w-3" />
              Live Sync
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {syncing ? (
            <div className="flex h-24 items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading shared data...</span>
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
                {contextReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-muted/10">
                    <td className="px-4 py-3 font-mono text-xs font-semibold">{receipt.acknowledgement_no}</td>
                    <td className="px-4 py-3 font-medium">{receipt.tenant_name}</td>
                    <td className="px-4 py-3 text-xs">
                      <div className="font-medium">{receipt.property_name}</div>
                      <div className="text-muted-foreground">{receipt.location_code}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{receipt.collection_date}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {receipt.lease_start_date} - {receipt.lease_end_date}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {getMethodIcon(receipt.payment_mode)}
                        <span className="text-xs">{receipt.payment_mode}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">QR {receipt.total_amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50 text-xs">
                        {receipt.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => handleDownload(receipt, `${receipt.acknowledgement_no}.pdf`)}>
                        <Download className="h-3.5 w-3.5" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-4 border-b border-border">
          <CardTitle className="text-base font-semibold">Database Receipts</CardTitle>
          <CardDescription>Receipts recorded directly via the cashier module.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
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
                {dbReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-muted/10">
                    <td className="px-6 py-4 text-muted-foreground">{new Date(receipt.received_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-mono text-xs">{receipt.ref || "-"}</td>
                    <td className="px-6 py-4 capitalize">
                      <div className="flex items-center space-x-2">
                        {getMethodIcon(receipt.payment_mode)}
                        <span>{receipt.payment_mode.replace("_", " ")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium">QR {Number(receipt.amount).toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="outline" className={receipt.status === "completed" ? "text-green-700 border-green-300 bg-green-50" : ""}>
                        {receipt.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleDownloadDb(receipt)}>
                        <Download className="h-4 w-4 mr-1" />
                        PDF
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
