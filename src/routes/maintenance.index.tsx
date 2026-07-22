import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { fetchMaintenanceTickets, MaintenanceTicket } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/maintenance/")({
  component: MaintenanceDashboard,
});

function MaintenanceDashboard() {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchMaintenanceTickets();
        setTickets(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const openTickets = tickets.filter(t => ['new', 'assigned', 'in_progress'].includes(t.status)).length;
  const urgentTickets = tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed' && t.status !== 'resolved').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  // Chart Data preparation based on status
  const chartData = [
    { name: "New/Assigned", value: tickets.filter(t => t.status === 'new' || t.status === 'assigned').length, color: "#3b82f6" },
    { name: "In Progress", value: tickets.filter(t => t.status === 'in_progress').length, color: "#f59e0b" },
    { name: "Resolved", value: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length, color: "#10b981" },
  ].filter(d => d.value > 0);

  // If no data, provide a mock segment for visualization
  if (chartData.length === 0) {
    chartData.push({ name: "No Data", value: 1, color: "#e2e8f0" });
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Ops</h1>
          <p className="text-muted-foreground mt-1">Track issues, dispatch workers, and monitor facility health.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Tickets</CardTitle>
            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <Wrench className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{openTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently open or in progress
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md border-red-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Urgent Issues</CardTitle>
            <div className="h-9 w-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{urgentTickets}</div>
            <p className="text-xs text-red-500 mt-1">
              Requires immediate dispatch
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolved (30d)</CardTitle>
            <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{resolvedTickets}</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              Successfully closed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Ticket Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#334155' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Needs Attention</CardTitle>
            <Button variant="ghost" size="sm" className="text-primary h-8 text-xs gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved')
                .sort((a, b) => (a.priority === 'urgent' ? -1 : 1))
                .slice(0, 5).map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                  <div className="flex flex-col max-w-[200px] sm:max-w-[300px]">
                    <span className="font-medium text-sm truncate">{ticket.title}</span>
                    <span className="text-xs text-muted-foreground">{ticket.category} &bull; Unit: {ticket.unit_ref || 'General'}</span>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                    ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {ticket.priority}
                  </div>
                </div>
              ))}
              {tickets.filter(t => t.status !== 'closed' && t.status !== 'resolved').length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  All caught up! No active tickets.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
