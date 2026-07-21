import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2, Users, CreditCard, TrendingUp, ShieldCheck,
  ArrowUpRight, AlertTriangle, CheckCircle2, Clock, Globe,
  Wallet, Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/super-admin/")({
  head: () => ({ meta: [{ title: "Platform Overview — ZYNO Super Admin" }] }),
  component: SuperAdminDashboard,
});

function StatCard({
  label, value, hint, icon, tone = "default", delta
}: {
  label: string; value: string; hint?: string;
  icon?: React.ReactNode; tone?: "default" | "success" | "warning" | "danger";
  delta?: string;
}) {
  const toneColors = {
    default: "text-primary",
    success: "text-emerald-500",
    warning: "text-amber-500",
    danger: "text-red-500",
  };
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <span className={`${toneColors[tone]} opacity-80`}>{icon}</span>
        </div>
        <p className={`text-2xl font-bold ${toneColors[tone]}`}>{value}</p>
        {(hint || delta) && (
          <div className="flex items-center gap-2 mt-1">
            {delta && <span className={`text-xs font-semibold ${toneColors[tone]}`}>{delta}</span>}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalTenants: 0, activeTenants: 0,
    totalProperties: 0, totalUnits: 0,
    totalLeases: 0, activeLeases: 0,
    totalUsers: 0, totalRevenue: 0,
  });
  const [recentTenants, setRecentTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [propertiesRes, leasesRes, profilesRes] = await Promise.all([
          supabase.from('properties').select('id, host_id, title, city, is_active, created_at').order('created_at', { ascending: false }),
          supabase.from('leases').select('id, lease_status, rental_amount').limit(500),
          supabase.from('profiles').select('id, full_name, role, created_at').order('created_at', { ascending: false }),
        ]);

        const properties = propertiesRes.data || [];
        const leases = leasesRes.data || [];
        const profiles = profilesRes.data || [];

        const hostIds = [...new Set(properties.map((p: any) => p.host_id))];
        const activeLeases = leases.filter((l: any) => l.lease_status === 'ACTIVE');
        const totalRevenue = activeLeases.reduce((s: number, l: any) => s + (l.rental_amount || 0), 0);

        setStats({
          totalTenants: hostIds.length,
          activeTenants: hostIds.length,
          totalProperties: properties.length,
          totalUnits: 0,
          totalLeases: leases.length,
          activeLeases: activeLeases.length,
          totalUsers: profiles.length,
          totalRevenue,
        });

        // Show 5 most recent hosts (tenants)
        const hosts = profiles.filter((p: any) => p.role === 'HOST' || p.role === 'ADMIN');
        setRecentTenants(hosts.slice(0, 5));
      } catch (err) {
        console.error("Failed to load platform stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const systemHealthItems = [
    { label: "Database", status: "Operational", ok: true },
    { label: "Auth Service", status: "Operational", ok: true },
    { label: "Storage", status: "Operational", ok: true },
    { label: "Email Service", status: "Degraded", ok: false },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Full visibility across all tenants, properties, and operations.
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 text-emerald-600 border-emerald-200 bg-emerald-50">
          <CheckCircle2 className="h-3.5 w-3.5" /> All Systems Operational
        </Badge>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Tenants (Orgs)" value={String(stats.totalTenants)} hint="Active orgs on platform" icon={<Building2 className="h-4 w-4" />} tone="default" />
        <StatCard label="Total Properties" value={String(stats.totalProperties)} hint="Across all tenants" icon={<Globe className="h-4 w-4" />} tone="default" />
        <StatCard label="Active Leases" value={String(stats.activeLeases)} hint={`${stats.totalLeases} total leases`} icon={<CheckCircle2 className="h-4 w-4" />} tone="success" />
        <StatCard label="Monthly Revenue" value={`SAR ${stats.totalRevenue.toLocaleString()}`} hint="From active leases" icon={<Wallet className="h-4 w-4" />} tone="success" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={String(stats.totalUsers)} hint="All roles" icon={<Users className="h-4 w-4" />} tone="default" />
        <StatCard label="Platform Uptime" value="99.97%" hint="Last 30 days" icon={<Activity className="h-4 w-4" />} tone="success" delta="▲ 0.02%" />
        <StatCard label="Pending Approvals" value="3" hint="Require attention" icon={<Clock className="h-4 w-4" />} tone="warning" />
        <StatCard label="Security Alerts" value="0" hint="Last 24 hours" icon={<ShieldCheck className="h-4 w-4" />} tone="success" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Tenants */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Recent Tenants</CardTitle>
              <CardDescription>Organizations onboarded to the platform</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link to="/super-admin/tenants">View all <ArrowUpRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {loading ? (
                <div className="text-sm text-muted-foreground">Loading tenants...</div>
              ) : recentTenants.length === 0 ? (
                <div className="text-sm text-muted-foreground py-4 text-center">No tenants found.</div>
              ) : recentTenants.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">{tenant.full_name}</p>
                    <p className="text-xs text-muted-foreground">{tenant.role} · Joined {new Date(tenant.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{tenant.role}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">System Health</CardTitle>
            <CardDescription>Service status overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemHealthItems.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm">{item.label}</span>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${item.ok ? "text-emerald-600" : "text-amber-600"}`}>
                    {item.ok
                      ? <CheckCircle2 className="h-3.5 w-3.5" />
                      : <AlertTriangle className="h-3.5 w-3.5" />}
                    {item.status}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</p>
              <div className="grid grid-cols-1 gap-2">
                <Button asChild variant="outline" size="sm" className="justify-start gap-2">
                  <Link to="/super-admin/tenants"><Building2 className="h-3.5 w-3.5" /> Onboard New Tenant</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="justify-start gap-2">
                  <Link to="/super-admin/billing"><CreditCard className="h-3.5 w-3.5" /> Manage Billing</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="justify-start gap-2">
                  <Link to="/super-admin/security"><ShieldCheck className="h-3.5 w-3.5" /> View Audit Logs</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RBAC Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform Role Access Matrix</CardTitle>
          <CardDescription>Summary of permissions per role as defined in PMS v2.0 specification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-semibold text-muted-foreground">Module</th>
                  {["Super Admin", "Admin/Host", "Prop. Mgr", "Leasing", "Finance", "Cashier", "Maintenance", "Tenant"].map(role => (
                    <th key={role} className="text-center py-2 px-2 font-semibold text-muted-foreground">{role}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { module: "Tenant Mgmt", perms: [true, false, false, false, false, false, false, false] },
                  { module: "Property CRUD", perms: [true, true, true, false, false, false, false, false] },
                  { module: "Unit Mgmt", perms: [true, true, true, false, false, false, false, false] },
                  { module: "Lease Creation", perms: [true, true, true, true, false, false, false, false] },
                  { module: "Payment Collection", perms: [true, true, false, false, true, true, false, false] },
                  { module: "Receipt Generation", perms: [true, true, false, false, true, true, false, false] },
                  { module: "Maintenance Tickets", perms: [true, true, true, false, false, false, true, true] },
                  { module: "Reports & Analytics", perms: [true, true, true, true, true, false, false, false] },
                  { module: "User Management", perms: [true, true, false, false, false, false, false, false] },
                  { module: "HRMS", perms: [true, true, false, false, false, false, false, false] },
                ].map(row => (
                  <tr key={row.module} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2 pr-4 font-medium">{row.module}</td>
                    {row.perms.map((has, i) => (
                      <td key={i} className="text-center py-2 px-2">
                        {has
                          ? <span className="text-emerald-500">✓</span>
                          : <span className="text-muted-foreground/40">—</span>}
                      </td>
                    ))}
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
