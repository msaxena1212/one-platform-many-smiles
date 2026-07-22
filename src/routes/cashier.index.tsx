import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchReceipts, fetchPDCs, Receipt, PDC } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt as ReceiptIcon, FileText, CheckCircle2, ArrowRightLeft } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cashier/")({
  component: CashierDashboard,
});

function CashierDashboard() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [pdcs, setPdcs] = useState<PDC[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [rcpt, pdcData] = await Promise.all([
          fetchReceipts(),
          fetchPDCs()
        ]);
        setReceipts(rcpt || []);
        setPdcs(pdcData || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalCollected = receipts.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingPDCs = pdcs.filter(p => p.status === 'held').length;

  const chartData = [
    { time: "9 AM", amount: 1500 },
    { time: "11 AM", amount: 3200 },
    { time: "1 PM", amount: 2100 },
    { time: "3 PM", amount: 5400 },
    { time: "5 PM", amount: 1200 },
    { time: "Now", amount: totalCollected > 0 ? 800 : 0 },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
          <ReceiptIcon className="h-4 w-4" /> Generate Receipt
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Today's Collection</CardTitle>
            <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">QAR {totalCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {receipts.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending PDCs</CardTitle>
            <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingPDCs}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cheques waiting to be deposited
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Reversals</CardTitle>
            <div className="h-9 w-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Bounced or returned this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Daily Collection Flow</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`QAR ${value}`, undefined]}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>PDCs Due Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pdcs.filter(p => p.status === 'held').slice(0, 5).map((pdc) => (
                <div key={pdc.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">Chq: {pdc.cheque_number}</span>
                    <span className="text-xs text-muted-foreground">{pdc.bank_name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-sm">QAR {pdc.amount.toLocaleString()}</span>
                    <span className="text-xs text-amber-600 font-medium">Due: {new Date(pdc.deposit_date).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
              {pdcs.filter(p => p.status === 'held').length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No pending PDCs due.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
