import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Home, AlertCircle, Clock, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const kpis = [
    { label: "Total Properties", value: "24", change: "+2", icon: Home },
    { label: "Occupied Units", value: "487/556", change: "87%", icon: Users },
    { label: "Pending Approvals", value: "8", change: "+1", icon: AlertCircle },
    { label: "Open Tickets", value: "42", change: "-3", icon: Clock },
    { label: "Completed This Month", value: "156", change: "+12%", icon: CheckCircle },
    { label: "Revenue (YTD)", value: "₨8.5M", change: "+15%", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">System overview and key metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground opacity-50" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">API Service</span>
              <span className="text-xs font-semibold text-green-600">✓ Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <span className="text-xs font-semibold text-green-600">✓ Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Supabase Integration</span>
              <span className="text-xs font-semibold text-green-600">✓ Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Service</span>
              <span className="text-xs font-semibold text-yellow-600">⚠ Degraded</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm border-l-2 border-blue-500 pl-3 py-1">
              <p className="font-medium">New lease created</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
            <div className="text-sm border-l-2 border-green-500 pl-3 py-1">
              <p className="font-medium">Maintenance ticket closed</p>
              <p className="text-xs text-muted-foreground">4 hours ago</p>
            </div>
            <div className="text-sm border-l-2 border-orange-500 pl-3 py-1">
              <p className="font-medium">Payment received</p>
              <p className="text-xs text-muted-foreground">6 hours ago</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
