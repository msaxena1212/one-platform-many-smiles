import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt as ReceiptIcon, FileText, CheckCircle2, ArrowRightLeft, Wifi } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data-context";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/cashier/")({
  component: CashierDashboard,
});

function CashierDashboard() {
  const { leases, pdcs, vouchers, syncing } = useAppData();

  const postedVouchers = vouchers.filter((voucher) => voucher.status === "posted");
  const totalCollected = postedVouchers.reduce((sum, voucher) => sum + voucher.amount, 0);
  const pdcHeld = pdcs.filter((pdc) => pdc.status === "received").length;
  const pdcDeposited = pdcs.filter((pdc) => pdc.status === "deposited" || pdc.status === "cleared").length;
  const activeLeases = leases.filter((lease) => lease.status !== "closed" && lease.status !== "non_renewal").length;

  const chartData = (() => {
    const months: Record<string, number> = {};
    postedVouchers
      .filter((voucher) => voucher.name.includes("Rental Income") || voucher.name.includes("Receipts Voucher") || voucher.name.includes("Receipt Voucher"))
      .forEach((voucher) => {
        const month = voucher.period?.slice(0, 3) || "Unk";
        months[month] = (months[month] || 0) + voucher.amount;
      });
    return Object.entries(months).map(([name, amount]) => ({ name, amount }));
  })();

  if (syncing) {
    return (
      <div className="flex h-64 items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="text-muted-foreground text-sm">Loading shared data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cashier Operations</h1>
          <p className="text-muted-foreground mt-1">Manage daily collections and post-dated cheques.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-green-700 border-green-300 bg-green-50">
            <Wifi className="h-3 w-3" />
            Live Sync
          </Badge>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
            <ReceiptIcon className="h-4 w-4" />
            Generate Receipt
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Collected</CardTitle>
            <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">QAR {totalCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{postedVouchers.length} posted vouchers</p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">PDCs In Hand</CardTitle>
            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pdcHeld}</div>
            <p className="text-xs text-muted-foreground mt-1">{pdcDeposited} deposited / cleared</p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Leases</CardTitle>
            <div className="h-9 w-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLeases}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all properties</p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vouchers Posted</CardTitle>
            <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <ReceiptIcon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postedVouchers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{vouchers.filter((voucher) => voucher.status === "draft").length} drafts pending</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50">
          <CardHeader className="border-b border-border pb-3">
            <CardTitle className="text-sm font-semibold">Collection Trend - Posted Vouchers</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(value) => `QR ${(value / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => [`QR ${value.toLocaleString()}`, "Amount"]} />
                <Area type="monotone" dataKey="amount" stroke="#10b981" fill="url(#colGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50">
        <CardHeader className="border-b border-border py-3">
          <CardTitle className="text-sm font-semibold">Active Leases - Shared Data</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/10 text-xs text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Tenant</th>
                <th className="px-4 py-2 text-left font-medium">Property / Unit</th>
                <th className="px-4 py-2 text-left font-medium">Period</th>
                <th className="px-4 py-2 text-right font-medium">Monthly Rent</th>
                <th className="px-4 py-2 text-right font-medium">PDCs</th>
                <th className="px-4 py-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leases.map((lease) => {
                const leasePdcs = pdcs.filter((pdc) => pdc.leaseId === lease.id);
                const cleared = leasePdcs.filter((pdc) => pdc.status === "deposited" || pdc.status === "cleared").length;
                return (
                  <tr key={lease.id} className="hover:bg-muted/10">
                    <td className="px-4 py-3 font-medium">{lease.tenantName}</td>
                    <td className="px-4 py-3 text-xs">
                      <div>{lease.property}</div>
                      <div className="text-muted-foreground">{lease.unit}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {lease.startDate} {"->"} {lease.endDate}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">QR {lease.monthlyRent.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-xs">{cleared}/{leasePdcs.length} cleared</td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant="outline" className="text-xs capitalize">
                        {lease.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
