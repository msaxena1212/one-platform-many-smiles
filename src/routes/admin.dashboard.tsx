import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Home, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { properties, units, leases, tickets } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboard,
});

function AdminDashboard() {
  // Derive real numbers from Qatar property data
  const totalProps = properties.length;                                           // 23
  const totalUnits = properties.reduce((a, p) => a + p.units, 0);               // 396 (from Excel)
  const occupied   = properties.reduce((a, p) => a + Math.round(p.occupancy * p.units), 0);
  const occPct     = totalUnits > 0 ? Math.round((occupied / totalUnits) * 100) : 0;
  const openTickets = tickets.filter(t => ["new","assigned","in_progress"].includes(t.status)).length;
  const expiringLeases = leases.filter(l => l.status === "expiring").length;
  // Revenue: sum of annual rents from active/expiring leases → monthly estimate
  const monthlyRev = leases.reduce((a, l) => a + Math.round(l.annualRent / 12), 0);

  const kpis = [
    { label: "Total Properties",      value: totalProps.toString(),              change: "Doha, Qatar",         icon: Home },
    { label: "Occupied / Total Units",value: `${occupied} / ${totalUnits}`,      change: `${occPct}% occupied`, icon: Users },
    { label: "Expiring Leases",       value: expiringLeases.toString(),          change: "Within 90 days",      icon: AlertCircle },
    { label: "Open Tickets",          value: openTickets.toString(),             change: "Maintenance queue",   icon: Clock },
    { label: "Monthly Revenue (est)", value: `QAR ${monthlyRev.toLocaleString()}`, change: "From active leases", icon: TrendingUp },
    { label: "Leases Active",         value: leases.filter(l=>l.status==="active").length.toString(), change: "Current portfolio", icon: CheckCircle },
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
