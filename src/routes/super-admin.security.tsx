import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ShieldCheck, Search, Download, AlertTriangle,
  Info, XCircle, RefreshCw, Eye, BarChart3,
  TrendingUp, Bell, MousePointerClick, Users,
  Activity, ShieldAlert, FileText, UserCheck, CheckCircle2,
  Calendar, Clock, Laptop, Shield, UserCog, KeyRound, Lock,
  ChevronDown, ChevronUp, User
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { fetchSecurityAuditLogs, type SecurityAuditLog } from "@/lib/security";
import { fetchInAppNotifications, type SystemNotification } from "@/lib/system-config";
import { toast } from "sonner";

export const Route = createFileRoute("/super-admin/security")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : "audit-trail",
  }),
  head: () => ({ meta: [{ title: "Security Governance & Audit — ZYNO Super Admin" }] }),
  component: SecurityAndEngagementPage,
});

const SEVERITY_CONFIG: Record<string, { color: string; badge: string; icon: React.ReactNode }> = {
  info: {
    color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300",
    icon: <Info className="h-3.5 w-3.5" />
  },
  warning: {
    color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
    badge: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300",
    icon: <AlertTriangle className="h-3.5 w-3.5" />
  },
  critical: {
    color: "text-red-600 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800",
    badge: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300",
    icon: <XCircle className="h-3.5 w-3.5" />
  },
};

function formatResource(resource?: string, details?: Record<string, unknown>): { display: string; sub?: string } {
  const d = details as any;
  if (d?.target_user_name) {
    return {
      display: d.target_user_name,
      sub: d.target_user_id ? `${d.target_user_id.slice(0, 8)}...${d.target_user_id.slice(-4)}` : undefined
    };
  }

  if (!resource) return { display: "System" };
  if (resource.startsWith("profiles/")) {
    const id = resource.replace("profiles/", "");
    return { display: "User Account", sub: id.length > 16 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id };
  }
  if (resource.startsWith("system_configurations/")) {
    return { display: "System Config", sub: resource.replace("system_configurations/", "") };
  }
  return { display: resource };
}

function formatClientDetails(details?: Record<string, unknown>, userAgent?: string): React.ReactNode {
  if (!details && !userAgent) return <span className="text-muted-foreground">—</span>;

  if (details) {
    const d = details as any;
    if (d.old_role || d.new_role || d.target_user_name) {
      return (
        <div className="space-y-1">
          {d.old_role && d.new_role ? (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
                {d.old_role}
              </span>
              <span className="text-xs text-muted-foreground">→</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                {d.new_role}
              </span>
            </div>
          ) : null}
          {d.audit_reason && (
            <p className="text-[11px] text-muted-foreground italic line-clamp-1">
              "{d.audit_reason}"
            </p>
          )}
        </div>
      );
    }
    if (d.error) {
      return <span className="text-destructive font-medium truncate">{String(d.error)}</span>;
    }
    return (
      <span className="font-mono text-[11px] text-muted-foreground truncate block max-w-xs" title={JSON.stringify(details)}>
        {JSON.stringify(details)}
      </span>
    );
  }

  return (
    <span className="text-muted-foreground truncate block max-w-xs" title={userAgent}>
      {userAgent}
    </span>
  );
}

export function SecurityAndEngagementPage() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: "/super-admin/security" });
  const [logs, setLogs] = useState<SecurityAuditLog[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [selectedLog, setSelectedLog] = useState<SecurityAuditLog | null>(null);
  const [showJsonRaw, setShowJsonRaw] = useState(false);

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

  const filteredLogs = logs.filter((log) => {
    const detailsStr = log.details ? JSON.stringify(log.details).toLowerCase() : "";
    const matchSearch =
      (log.action || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.resource || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.event_type || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.user_role || "").toLowerCase().includes(search.toLowerCase()) ||
      detailsStr.includes(search.toLowerCase());
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

    const headers = ["Timestamp", "Event Type", "Severity", "Resource", "Action", "User Role", "IP Address", "Details"];
    const rows = logs.map((l) => [
      l.timestamp,
      l.event_type,
      l.severity,
      l.resource || "",
      l.action || "",
      l.user_role || "",
      l.ip_address || "",
      `"${JSON.stringify(l.details || {}).replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `security_audit_logs_${new Date().toISOString().split("T")[0]}.csv`);
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
            {isEngagementView ? "Notification & User Engagement Analytics" : "System-Wide Security Audit Trail"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEngagementView
              ? "Comprehensive impression analytics, delivery telemetry, CTA clicks, and read conversion rates across tenant broadcasts."
              : "Immutable security logging protecting against unauthorized database mutations, privilege escalation, and anomalous platform access."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="gap-2 text-xs cursor-pointer">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Data
          </Button>
          {!isEngagementView && (
            <Button size="sm" onClick={exportCSV} className="gap-2 text-xs cursor-pointer">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Dynamic Metric Cards */}
      {isEngagementView ? (
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
              <p className="text-[11px] text-indigo-600/80">Notification reads recorded across tenants</p>
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
              <p className="text-[11px] text-amber-600/80">Permission changes & role modifications</p>
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

      {/* Content */}
      {!isEngagementView ? (
        <div className="space-y-4">
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="p-4 pb-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search action, role, resource, user..."
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
                    className="rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
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
                  Loading security audit records...
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-30 text-emerald-500" />
                  No matching audit logs found.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/60 text-xs">
                      <tr>
                        <th className="p-3">Timestamp (AST)</th>
                        <th className="p-3">Severity</th>
                        <th className="p-3">Event / Action</th>
                        <th className="p-3">Target (Employee / Resource)</th>
                        <th className="p-3">Triggered By</th>
                        <th className="p-3">Role Transition & Summary</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-xs">
                      {filteredLogs.map((log, idx) => {
                        const sev = SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.info;
                        const resourceInfo = formatResource(log.resource, log.details);
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
                              <Badge className={`text-[10px] uppercase font-bold gap-1 px-2 py-0.5 ${sev.badge}`}>
                                {sev.icon}
                                {log.severity}
                              </Badge>
                            </td>
                            <td className="p-3 font-medium text-foreground">
                              <div className="font-semibold text-xs">{log.action || log.event_type}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">{log.event_type}</div>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <div className="font-bold text-foreground text-xs">{resourceInfo.display}</div>
                              {resourceInfo.sub && (
                                <div className="text-[10px] font-mono text-muted-foreground">{resourceInfo.sub}</div>
                              )}
                            </td>
                            <td className="p-3 text-muted-foreground whitespace-nowrap">
                              <span className="font-semibold text-foreground">{log.user_role || "Staff"}</span>
                              {log.user_id && <div className="text-[10px] font-mono text-muted-foreground/80">{log.user_id.slice(0, 8)}...</div>}
                            </td>
                            <td className="p-3 max-w-sm">
                              {formatClientDetails(log.details, log.user_agent)}
                            </td>
                            <td className="p-3 text-right whitespace-nowrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setSelectedLog(log); setShowJsonRaw(false); }}
                                className="h-7 px-2.5 text-xs font-medium border-border hover:border-primary hover:text-primary cursor-pointer gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                Details
                              </Button>
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
                  <CardDescription className="text-xs">Individual notification impression, click-through, and recipient conversion telemetry</CardDescription>
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

      {/* ========================================================================= */}
      {/* SINGLE-VIEW COMPACT MODAL (NO SCROLLBAR)                                 */}
      {/* ========================================================================= */}
      <Dialog open={!!selectedLog} onOpenChange={(o) => !o && setSelectedLog(null)}>
        <DialogContent className="max-w-2xl p-0 gap-0 rounded-xl border border-border shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3.5 border-b border-border bg-muted/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-foreground leading-none">
                  Security Audit Event Details
                </DialogTitle>
                <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
                  Immutable cryptographically-timestamped audit record
                </DialogDescription>
              </div>
            </div>

            {selectedLog && (
              <Badge className={`text-[10px] uppercase font-bold px-2 py-0.5 ${SEVERITY_CONFIG[selectedLog.severity]?.badge}`}>
                {SEVERITY_CONFIG[selectedLog.severity]?.icon}
                <span className="ml-1">{selectedLog.severity}</span>
              </Badge>
            )}
          </div>

          {selectedLog && (() => {
            const details = (selectedLog.details || {}) as any;
            const targetName = details.target_user_name || (selectedLog.resource?.startsWith("profiles/") ? "User Profile" : selectedLog.resource);

            return (
              <div className="p-5 space-y-3 text-xs">
                {/* 2-Column Clean Grid */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Action & Category */}
                  <div className="bg-muted/25 rounded-lg p-2.5 border border-border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <Activity className="h-3 w-3 text-primary" /> Action / Event
                    </span>
                    <p className="font-bold text-foreground text-xs mt-0.5 truncate">
                      {selectedLog.action || selectedLog.event_type}
                    </p>
                    <span className="text-[10px] font-mono text-muted-foreground block">
                      Category: {selectedLog.event_type}
                    </span>
                  </div>

                  {/* Target Employee */}
                  <div className="bg-muted/25 rounded-lg p-2.5 border border-border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3 text-primary" /> Target Employee / Resource
                    </span>
                    <p className="font-bold text-foreground text-xs mt-0.5 truncate text-primary">
                      {targetName}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground truncate">
                      {details.target_user_id || selectedLog.resource || "—"}
                    </p>
                  </div>
                </div>

                {/* Role Transition Bar (if role change) */}
                {(details.old_role || details.new_role) && (
                  <div className="rounded-lg border border-primary/20 bg-primary/[0.03] p-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-[11px] font-bold text-foreground">Role Transition:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] font-bold bg-background">
                        {details.old_role || "None"}
                      </Badge>
                      <span className="text-primary font-bold text-xs">→</span>
                      <Badge className="text-[10px] font-bold bg-primary/10 text-primary border-primary/30">
                        {details.new_role}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Audit Justification */}
                {details.audit_reason && (
                  <div className="bg-muted/20 rounded-lg p-2.5 border border-border">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
                      Audit Justification Note
                    </span>
                    <p className="text-[11px] text-foreground italic">
                      "{details.audit_reason}"
                    </p>
                  </div>
                )}

                {/* Actor & Timestamp Meta */}
                <div className="grid grid-cols-2 gap-3 bg-muted/40 rounded-lg px-3 py-2 border border-border text-[11px]">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Triggered By</span>
                    <span className="font-bold text-foreground">{selectedLog.user_role || "SUPER_ADMIN"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Timestamp (AST)</span>
                    <span className="font-medium text-foreground">
                      {new Date(selectedLog.timestamp).toLocaleString("en-QA", {
                        timeZone: "Asia/Qatar",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                      })}
                    </span>
                  </div>
                </div>

                {/* Expandable JSON Payload Toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowJsonRaw(!showJsonRaw)}
                    className="flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <span>Raw JSON Metadata Payload</span>
                    {showJsonRaw ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>

                  {showJsonRaw && (
                    <pre className="mt-1.5 bg-muted/70 p-2.5 rounded-lg border border-border font-mono text-[10px] overflow-x-auto text-foreground max-h-28 leading-snug">
                      {JSON.stringify(
                        {
                          id: selectedLog.id,
                          action: selectedLog.action,
                          resource: selectedLog.resource,
                          severity: selectedLog.severity,
                          user_role: selectedLog.user_role,
                          timestamp: selectedLog.timestamp,
                          details: selectedLog.details,
                          user_agent: selectedLog.user_agent,
                        },
                        null,
                        2
                      )}
                    </pre>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedLog(null)}
              className="h-8 px-5 cursor-pointer text-xs font-semibold"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
