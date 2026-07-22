import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchJournalEntries, fetchARLedgers, JournalEntry, ARLedger } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/finance/")({
  component: FinanceDashboard,
});

function FinanceDashboard() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [arLedgers, setArLedgers] = useState<ARLedger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [je, ar] = await Promise.all([
          fetchJournalEntries(),
          fetchARLedgers()
        ]);
        setJournalEntries(je || []);
        setArLedgers(ar || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalAr = arLedgers.reduce((acc, curr) => acc + curr.balance, 0);
  const recentJeCount = journalEntries.length;

  const chartData = [
    { name: "Week 1", revenue: 14000, expenses: 4000 },
    { name: "Week 2", revenue: 22000, expenses: 5500 },
    { name: "Week 3", revenue: 18000, expenses: 3200 },
    { name: "Week 4", revenue: 31000, expenses: 7800 },
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
          <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage revenue, GL accounts, and financial health.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue (MTD)</CardTitle>
            <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">QAR 85,000</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +8.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accounts Receivable</CardTitle>
            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">QAR {totalAr.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending collections
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recent Transactions</CardTitle>
            <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{recentJeCount} entries</div>
            <p className="text-xs text-muted-foreground mt-1">
              Posted in the last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Cash Flow Overview</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`QAR ${value.toLocaleString()}`, undefined]}
                />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Open Receivables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {arLedgers.filter(ar => ar.balance > 0).slice(0, 5).map((ar) => (
                <div key={ar.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="flex flex-col">
                    <span className="font-medium">{ar.reference}</span>
                    <span className="text-sm text-muted-foreground">{new Date(ar.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-red-600">QAR {ar.balance.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground capitalize">{ar.type}</span>
                  </div>
                </div>
              ))}
              {arLedgers.filter(ar => ar.balance > 0).length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No open receivables!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
