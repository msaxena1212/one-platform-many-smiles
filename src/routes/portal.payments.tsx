import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { payments, formatSAR, type Payment } from "@/lib/mock-data";

export const Route = createFileRoute("/portal/payments")({
  head: () => ({ meta: [{ title: "Payments — ZYNO Property Management Portal" }] }),
  component: PaymentsPage,
});

const methodColor: Record<Payment["method"], string> = {
  SADAD: "bg-primary/10 text-primary",
  Mada: "bg-gold/15 text-gold-foreground",
  "Apple Pay": "bg-foreground/5 text-foreground",
  "STC Pay": "bg-[oklch(0.55_0.18_140)]/15 text-[oklch(0.4_0.18_140)]",
  "Bank Transfer": "bg-secondary text-secondary-foreground",
};

function PaymentsPage() {
  const handlePayment = (method: Payment["method"]) => {
    toast.success(`Payment flow started with ${method}.`);
  };

  const handleAutoPay = () => {
    toast(`Auto-pay setup form opened.`);
  };

  return (
    <div className="space-y-6">
      <Card className="border-gold/40 bg-gradient-to-br from-card to-gold/5">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Next installment</p>
            <p className="mt-1 text-3xl font-semibold">{formatSAR(15000)}</p>
            <p className="text-sm text-muted-foreground">Due July 1, 2026 · Reference 119988443</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handlePayment("SADAD")}>Pay with SADAD</Button>
            <Button variant="outline" onClick={() => handlePayment("Mada")}>Pay with Mada</Button>
            <Button variant="ghost" onClick={handleAutoPay}>Set up auto-pay</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-border px-6 py-4">
            <h3 className="text-base font-semibold">Payment history</h3>
            <p className="text-xs text-muted-foreground">All receipts on your account</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Receipt</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Method</th>
                  <th className="px-6 py-3 font-medium text-right">Amount</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {payments.map(p => (
                  <tr key={p.id}>
                    <td className="px-6 py-3 font-mono text-xs">{p.reference}</td>
                    <td className="px-6 py-3 text-muted-foreground">{p.date}</td>
                    <td className="px-6 py-3"><span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${methodColor[p.method]}`}>{p.method}</span></td>
                    <td className="px-6 py-3 text-right font-medium">{formatSAR(p.amount)}</td>
                    <td className="px-6 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                        p.status === "completed" ? "bg-[oklch(0.55_0.13_155)]/15 text-[oklch(0.4_0.13_155)]" :
                        p.status === "pending" ? "bg-gold/20 text-gold-foreground" :
                        p.status === "failed" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
