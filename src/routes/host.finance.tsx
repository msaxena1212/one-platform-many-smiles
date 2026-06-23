import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/host/finance")({
  component: HostFinance,
});

const mockLedger = [
  { date: "2026-06-01", memo: "Rent receipt — Lease L1", account: "1100 Cash @ Bank", debit: "SAR 45,000", credit: "—" },
  { date: "2026-06-01", memo: "Rent receipt — Lease L1", account: "4100 Rental Income", debit: "—", credit: "SAR 45,000" },
  { date: "2026-06-05", memo: "Rent receipt — Lease L2", account: "1100 Cash @ Bank", debit: "SAR 23,750", credit: "—" },
  { date: "2026-06-05", memo: "Rent receipt — Lease L2", account: "4100 Rental Income", debit: "—", credit: "SAR 23,750" },
  { date: "2026-06-10", memo: "HVAC maintenance T1", account: "5200 Maintenance Expense", debit: "SAR 3,200", credit: "—" },
  { date: "2026-06-10", memo: "HVAC maintenance T1", account: "2100 Accounts Payable", debit: "—", credit: "SAR 3,200" },
];

const mockReceipts = [
  { tenant: "Khalid Al-Mutairi", details: "RCT-10421 - SADAD - 2026-06-01", amount: "SAR 45,000" },
  { tenant: "Sara Al-Qahtani", details: "RCT-10422 - Mada - 2026-06-05", amount: "SAR 23,750" },
];

function HostFinance() {
  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Collected MTD</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SAR 80,750</div>
            <div className="text-xs text-green-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> 12%
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Receipts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SAR 55,000</div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Forecast Q3</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">SAR 2,840,000</div>
            <div className="text-xs text-muted-foreground mt-1">On plan</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <CardTitle className="text-lg">General ledger — June 2026</CardTitle>
            <CardDescription>All postings server-enforced and reversible</CardDescription>
          </div>
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">✓ Balanced</span>
        </div>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y border-border bg-muted/10">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Memo</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider">Account</th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground uppercase text-xs tracking-wider">Debit</th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground uppercase text-xs tracking-wider">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockLedger.map((entry, i) => (
                  <tr key={i} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs">{entry.date}</td>
                    <td className="px-6 py-4">{entry.memo}</td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs">{entry.account}</td>
                    <td className="px-6 py-4 text-right">{entry.debit}</td>
                    <td className="px-6 py-4 text-right">{entry.credit}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-border font-semibold">
                <tr>
                  <td className="px-6 py-4" colSpan={3}>Totals</td>
                  <td className="px-6 py-4 text-right">SAR 71,950</td>
                  <td className="px-6 py-4 text-right">SAR 71,950</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader>
          <CardTitle>Recent receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockReceipts.map((receipt, i) => (
              <div key={i} className="flex items-center justify-between border-b border-border last:border-0 pb-4 last:pb-0">
                <div>
                  <div className="font-medium">{receipt.tenant}</div>
                  <div className="text-xs text-muted-foreground">{receipt.details}</div>
                </div>
                <div className="font-medium">{receipt.amount}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
