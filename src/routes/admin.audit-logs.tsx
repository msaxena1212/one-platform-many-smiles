import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ShieldCheck, Search, Download, AlertTriangle,
  Info, XCircle, RefreshCw, Eye, BarChart3,
  TrendingUp, Bell, MousePointerClick, Users,
  Activity, ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fetchSecurityAuditLogs, type SecurityAuditLog } from "@/lib/security";
import { fetchInAppNotifications, type SystemNotification } from "@/lib/system-config";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/audit-logs")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : "audit-trail",
  }),
  head: () => ({ meta: [{ title: "Audit Trail & Engagement Analytics — ZYNO Admin" }] }),
  component: AdminAuditAndEngagementPage,
});

const SEVERITY_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  info: { color: "bg-blue-500/15 text-blue-600 border-blue-500/20", icon: <Info className="h-3.5 w-3.5" /> },
  warning: { color: "bg-amber-500/15 text-amber-600 border-amber-500/20", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  critical: { color: "bg-red-500/15 text-red-600 border-red-500/20", icon: <XCircle className="h-3.5 w-3.5" /> },
};

function AdminAuditAndEngagementPage() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: "/admin/audit-logs" });
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");

  const activeTab = searchParams.tab === "engagement-analytics" ? "engagement-analytics" : "audit-trail";

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [auditData, notifData] = await Promise.all([
        fetchSecurityAuditLogs(),
        fetchInAppNotifications()
      ]);
      setLogs(auditData);
      setNotifications(notifData);
    } catch (err: any) {
      toast.error("Failed to load audit & engagement logs: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleTabChange(newTab: string) {
    navigate({
      to: "/admin/audit-logs",
      search: { tab: newTab },
    });
  }

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      (log.action || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.resource || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.event_type || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.user_role || "").toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === "All" || log.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  const totalViews = notifications.reduce((s, n) => s + (n.engagement_count || 0), 0);
  const totalClicks = notifications.reduce((s, n) => s + (n.click_count || 0), 0);
  const avgEngagementRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";

  const counts = {
    critical: logs.filter((l) => l.severity === "critical").length,
    warning: logs.filter((l) => l.severity === "warning").length,
    info: logs.filter((l) => l.severity === "info").length,
    total: logs.length,
  };

  function exportCSV() {
    if (logs.length === 0) {
      toast.error("No logs to export.");
      return;
    }

    const headers = ["Timestamp", "Event Type", "Severity", "Resource", "Action", "User Role", "IP Address", "User Agent"];
    const rows = logs.map((l) => [
      l.timestamp,
      l.event_type,
      l.severity,
      l.resource || "",
      l.action || "",
      l.user_role || "",
      l.ip_address || "",
      `"${(l.user_agent || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `admin_audit_logs_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Audit trail logs exported to CSV!");
  }

  const isEngagementView = activeTab === "engagement-analytics";

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEngagementView ? "Notification & User Engagement Analytics" : "System-Wide Audit Trail"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEngagementView
              ? "Comprehensive impression analytics, delivery telemetry, CTA clicks, and read conversion rates across tenant broadcasts."
              : "Detailed ledger of staff actions, security events, database updates, and authentication activity."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-2 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Data
          </Button>
          {!isEngagementView && (
            <Button size="sm" onClick={exportCSV} className="gap-2 text-xs">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Dynamic Metric Cards depending on the view */}
      {isEngagementView ? (
        /* Notification Analytics Metrics */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-indigo-500/20 bg-indigo-500/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total User Impressions</span>
                <Eye className="h-4 w-4 text-indigo-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-indigo-700">{totalViews}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-indigo-600/80">Notification reads recorded</p>
            </CardContent>
          </Card>

          <Card className="border border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">CTA Button Clicks</span>
                <MousePointerClick className="h-4 w-4 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-emerald-700">{totalClicks}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-emerald-600/80">Active user CTA conversions</p>
            </CardContent>
          </Card>

          <Card className="border border-blue-500/20 bg-blue-500/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Average CTR</span>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-700">{avgEngagementRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-blue-600/80">Click-through rate on dispatches</p>
            </CardContent>
          </Card>

          <Card className="border border-purple-500/20 bg-purple-500/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Tracked Dispatches</span>
                <Bell className="h-4 w-4 text-purple-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-purple-700">{notifications.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-purple-600/80">Active & scheduled campaigns</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* System Audit Trail Metrics */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-red-500/20 bg-red-500/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Critical Events</span>
                <ShieldAlert className="h-4 w-4 text-red-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-red-700">{counts.critical}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-red-600/80">High-priority security escalations</p>
            </CardContent>
          </Card>

          <Card className="border border-amber-500/20 bg-amber-500/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Warnings & Anomalies</span>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-amber-700">{counts.warning}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-amber-600/80">Permission changes & failed attempts</p>
            </CardContent>
          </Card>

          <Card className="border border-blue-500/20 bg-blue-500/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Standard Actions</span>
                <Activity className="h-4 w-4 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-700">{counts.info}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-blue-600/80">Routine operations & queries</p>
            </CardContent>
          </Card>

          <Card className="border border-emerald-500/20 bg-emerald-500/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Total Audit Entries</span>
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-emerald-700">{counts.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[11px] text-emerald-600/80">Immutable append-only records</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content dynamically displayed based on route / search parameter */}
      {!isEngagementView ? (
        <div className="space-y-4">
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="p-4 pb-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search action, role, resource..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 text-xs"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">Severity:</span>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="All">All Severities</option>
                    <option value="info">Info Only</option>
                    <option value="warning">Warning Only</option>
                    <option value="critical">Critical Only</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 pt-4">
              {loading ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                  Loading audit logs...
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-30 text-emerald-500" />
                  No matching audit logs found.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/60">
                      <tr>
                        <th className="p-3">Timestamp (AST)</th>
                        <th className="p-3">Severity</th>
                        <th className="p-3">Event / Action</th>
                        <th className="p-3">Resource Target</th>
                        <th className="p-3">User & Role</th>
                        <th className="p-3">Client Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredLogs.map((log, idx) => {
                        const sev = SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.info;
                        return (
                          <tr key={log.id || idx} className="hover:bg-muted/30 transition-colors">
                            <td className="p-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleString("en-QA", {
                                timeZone: "Asia/Qatar",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <Badge className={`text-[10px] uppercase font-bold gap-1 px-2 py-0.5 ${sev.color}`}>
                                {sev.icon}
                                {log.severity}
                              </Badge>
                            </td>
                            <td className="p-3 font-medium text-foreground">
                              <div className="font-semibold">{log.action || log.event_type}</div>
                              <div className="text-[10px] text-muted-foreground">{log.event_type}</div>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-primary">
                              {log.resource || "—"}
                            </td>
                            <td className="p-3 text-muted-foreground">
                              <span className="font-medium text-foreground">{log.user_role || "Staff"}</span>
                              {log.user_id && <div className="text-[10px] font-mono text-muted-foreground/80">{log.user_id.slice(0, 8)}...</div>}
                            </td>
                            <td className="p-3 max-w-xs text-[11px] text-muted-foreground truncate" title={JSON.stringify(log.details || {})}>
                              {log.details ? JSON.stringify(log.details) : log.user_agent || "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">Notification Broadcast Engagement Feed</CardTitle>
                  <CardDescription className="text-xs">Individual notification impression and conversion telemetry</CardDescription>
                </div>
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                  {notifications.length} Tracked Dispatches
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-xs">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  No notification engagements recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/60">
                      <tr>
                        <th className="p-3">Notification Title</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Audience Target</th>
                        <th className="p-3">Schedule</th>
                        <th className="p-3 text-center">User Views</th>
                        <th className="p-3 text-center">CTA Clicks</th>
                        <th className="p-3 text-center">CTR (%)</th>
                        <th className="p-3">Sent At (AST)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {notifications.map((n) => {
                        const views = n.engagement_count || 0;
                        const clicks = n.click_count || 0;
                        const ctr = views > 0 ? ((clicks / views) * 100).toFixed(1) : "0.0";
                        return (
                          <tr key={n.id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-3">
                              <p className="font-semibold text-foreground">{n.title}</p>
                              <p className="text-[11px] text-muted-foreground line-clamp-1">{n.message}</p>
                            </td>
                            <td className="p-3">
                              <Badge className="text-[10px] uppercase font-bold" variant="outline">
                                {n.type}
                              </Badge>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-primary">{n.target_role}</td>
                            <td className="p-3">
                              <Badge className="text-[10px] capitalize" variant="secondary">
                                {n.schedule_type || "instant"}
                              </Badge>
                            </td>
                            <td className="p-3 text-center font-bold text-foreground">{views}</td>
                            <td className="p-3 text-center font-bold text-emerald-600">{clicks}</td>
                            <td className="p-3 text-center">
                              <Badge className={Number(ctr) > 20 ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}>
                                {ctr}%
                              </Badge>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                              {new Date(n.created_at).toLocaleDateString("en-QA", { hour: "2-digit", minute: "2-digit" })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
