import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchLeases, Lease } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, FileSignature, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/leasing/")({
  component: LeasingDashboard,
});

function LeasingDashboard() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchLeases();
        setLeases(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeLeases = leases.filter(l => l.lease_status === 'Active').length;
  const pendingLeases = leases.filter(l => l.lease_status === 'Pending').length;
  
  // Chart Data preparation (Dummy monthly leasing data based on today's month)
  const chartData = [
    { name: "Jan", newLeases: 4, renewals: 2 },
    { name: "Feb", newLeases: 6, renewals: 1 },
    { name: "Mar", newLeases: 8, renewals: 5 },
    { name: "Apr", newLeases: 3, renewals: 7 },
    { name: "May", newLeases: Math.floor(Math.random() * 10), renewals: 4 },
    { name: "Jun", newLeases: activeLeases, renewals: pendingLeases },
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
          <h1 className="text-3xl font-bold tracking-tight">Leasing Overview</h1>
          <p className="text-muted-foreground mt-1">Monitor occupancy, lease executions, and renewals.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Leases</CardTitle>
            <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <FileSignature className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeLeases}</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approvals</CardTitle>
            <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingLeases}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting signatures or deposit
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Occupancy</CardTitle>
            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Building className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">87%</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" />
              +2.4% from last quarter
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Leasing Activity</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="newLeases" name="New Leases" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="renewals" name="Renewals" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Leases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leases.slice(0, 5).map((lease) => (
                <div key={lease.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="flex flex-col">
                    <span className="font-medium">{lease.lease_number}</span>
                    <span className="text-sm text-muted-foreground">{lease.payment_frequency} &bull; QAR {lease.rental_amount.toLocaleString()}</span>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    lease.lease_status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                    lease.lease_status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {lease.lease_status}
                  </div>
                </div>
              ))}
              {leases.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No leases found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
