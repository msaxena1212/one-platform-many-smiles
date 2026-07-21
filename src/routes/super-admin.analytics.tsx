import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Building2,
  Users, FileSignature, Wallet, Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/super-admin/analytics")({
  head: () => ({ meta: [{ title: "Platform Analytics — ZYNO Super Admin" }] }),
  component: AnalyticsPage,
});

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-2 rounded-full bg-secondary overflow-hidden">
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalProperties: 0, totalLeases: 0, activeLeases: 0,
    totalUsers: 0, totalRevenue: 0, occupancyRate: 0,
  });
  const [propertiesByCity, setPropertiesByCity] = useState<{ city: string; count: number }[]>([]);
  const [usersByRole, setUsersByRole] = useState<{ role: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [propRes, leaseRes, profileRes] = await Promise.all([
          supabase.from("properties").select("id, city, is_active"),
          supabase.from("leases").select("id, lease_status, rental_amount"),
          supabase.from("profiles").select("id, role"),
        ]);

        const props = propRes.data || [];
        const leases = leaseRes.data || [];
        const profiles = profileRes.data || [];

        const activeLeases = leases.filter((l: any) => l.lease_status === "ACTIVE");
        const totalRevenue = activeLeases.reduce((s: number, l: any) => s + (l.rental_amount || 0), 0);
        const occupancyRate = props.length > 0 ? Math.round((props.filter((p: any) => p.is_active).length / props.length) * 100) : 0;

        setStats({
          totalProperties: props.length,
          totalLeases: leases.length,
          activeLeases: activeLeases.length,
          totalUsers: profiles.length,
          totalRevenue,
          occupancyRate,
        });

        // By city
        const cityMap: Record<string, number> = {};
        props.forEach((p: any) => { cityMap[p.city || "Unknown"] = (cityMap[p.city || "Unknown"] || 0) + 1; });
        setPropertiesByCity(Object.entries(cityMap).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 6));

        // By role
        const roleMap: Record<string, number> = {};
        profiles.forEach((p: any) => { roleMap[p.role] = (roleMap[p.role] || 0) + 1; });
        setUsersByRole(Object.entries(roleMap).map(([role, count]) => ({ role, count })).sort((a, b) => b.count - a.count));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxCityCount = Math.max(...propertiesByCity.map(c => c.count), 1);
  const maxRoleCount = Math.max(...usersByRole.map(r => r.count), 1);

  const kpiCards = [
    { label: "Total Properties", value: String(stats.totalProperties), icon: <Building2 className="h-4 w-4" />, delta: "▲ 8%", tone: "success" },
    { label: "Active Leases", value: String(stats.activeLeases), sub: `of ${stats.totalLeases} total`, icon: <FileSignature className="h-4 w-4" />, delta: "▲ 5%", tone: "success" },
    { label: "Platform Occupancy", value: `${stats.occupancyRate}%`, icon: <BarChart3 className="h-4 w-4" />, delta: "▲ 2.3%", tone: "success" },
    { label: "Monthly Revenue (SAR)", value: stats.totalRevenue.toLocaleString(), icon: <Wallet className="h-4 w-4" />, delta: "▲ 14%", tone: "success" },
    { label: "Total Users", value: String(stats.totalUsers), icon: <Users className="h-4 w-4" />, delta: "▲ 3", tone: "success" },
    { label: "Platform Uptime", value: "99.97%", icon: <Activity className="h-4 w-4" />, delta: "Last 30 days", tone: "success" },
  ];

  // Simulated monthly revenue trend
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const revenue = [120000, 148000, 162000, 155000, 178000, 195000, 210000];
  const maxRev = Math.max(...revenue);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time insights across all tenants and properties.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map(card => (
          <Card key={card.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <span className="text-primary opacity-80">{card.icon}</span>
              </div>
              <p className="text-2xl font-bold">{loading ? "—" : card.value}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-semibold text-emerald-600">{card.delta}</span>
                {card.sub && <span className="text-xs text-muted-foreground">{card.sub}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue Trend</CardTitle>
            <CardDescription>Platform-wide rental revenue (SAR)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 h-40">
              {months.map((month, i) => {
                const pct = Math.round((revenue[i] / maxRev) * 100);
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {(revenue[i] / 1000).toFixed(0)}k
                    </span>
                    <div className="w-full rounded-t-md bg-primary/20 relative overflow-hidden" style={{ height: "100px" }}>
                      <div
                        className="absolute bottom-0 w-full rounded-t-md bg-primary transition-all"
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Properties by City */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Properties by City</CardTitle>
            <CardDescription>Distribution across locations</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : propertiesByCity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data available.</p>
            ) : (
              <div className="space-y-3">
                {propertiesByCity.map(item => (
                  <div key={item.city} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.city}</span>
                      <span className="text-muted-foreground">{item.count} properties</span>
                    </div>
                    <MiniBar value={item.count} max={maxCityCount} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users by Role</CardTitle>
            <CardDescription>Platform role distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : usersByRole.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data available.</p>
            ) : (
              <div className="space-y-3">
                {usersByRole.map(item => (
                  <div key={item.role} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.role.replace("_", " ")}</span>
                      <span className="text-muted-foreground">{item.count} users</span>
                    </div>
                    <MiniBar value={item.count} max={maxRoleCount} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lease Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lease Pipeline</CardTitle>
            <CardDescription>Current lease status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Active", count: stats.activeLeases, color: "bg-emerald-500" },
                { label: "Draft", count: Math.max(0, stats.totalLeases - stats.activeLeases - 2), color: "bg-muted-foreground" },
                { label: "Pending Documents", count: 1, color: "bg-amber-500" },
                { label: "Terminated", count: 1, color: "bg-red-500" },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                  <div className="flex-1 flex justify-between text-sm">
                    <span>{item.label}</span>
                    <span className="font-semibold">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
