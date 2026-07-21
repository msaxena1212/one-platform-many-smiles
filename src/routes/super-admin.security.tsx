import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ShieldCheck, Search, Filter, Download, AlertTriangle,
  CheckCircle2, Info, XCircle, User, Building2, FileText,
  Key, Settings, Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/super-admin/security")({
  head: () => ({ meta: [{ title: "Security & Audit — ZYNO Super Admin" }] }),
  component: SecurityPage,
});

type AuditLog = {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  resource: string;
  severity: "info" | "warning" | "error" | "success";
  ip: string;
  details: string;
};

const MOCK_LOGS: AuditLog[] = [
  { id: "1", timestamp: "2026-07-21 08:45:12", user: "System Administrator", role: "SUPER_ADMIN", action: "ROLE_UPDATED", resource: "profiles/user-123", severity: "warning", ip: "192.168.1.1", details: "Role changed from HOST to ADMIN" },
  { id: "2", timestamp: "2026-07-21 08:32:05", user: "Ahmed Al-Rashidi", role: "ADMIN", action: "LEASE_CREATED", resource: "leases/L-2026-0042", severity: "success", ip: "10.0.0.15", details: "New lease created for Unit A-205" },
  { id: "3", timestamp: "2026-07-21 08:20:44", user: "Sara Mohammed", role: "HOST", action: "LOGIN_FAILED", resource: "auth", severity: "error", ip: "203.45.12.89", details: "Failed login attempt (3rd attempt)" },
  { id: "4", timestamp: "2026-07-21 08:15:30", user: "System", role: "SYSTEM", action: "BACKUP_COMPLETED", resource: "database", severity: "success", ip: "—", details: "Daily backup completed successfully (2.3 GB)" },
  { id: "5", timestamp: "2026-07-21 07:58:21", user: "Fatima Al-Hamad", role: "ADMIN", action: "TENANT_ONBOARDED", resource: "profiles/tenant-089", severity: "info", ip: "10.0.0.12", details: "New tenant onboarded: Pearl Tower Management" },
  { id: "6", timestamp: "2026-07-21 07:45:18", user: "Ahmed Al-Rashidi", role: "ADMIN", action: "RECEIPT_GENERATED", resource: "receipts/R-2026-0183", severity: "info", ip: "10.0.0.15", details: "Receipt generated for payment SAR 4,500" },
  { id: "7", timestamp: "2026-07-21 07:30:02", user: "Unknown", role: "—", action: "BRUTE_FORCE_DETECTED", resource: "auth", severity: "error", ip: "185.220.101.45", details: "Multiple rapid login attempts from unknown IP — auto-blocked" },
  { id: "8", timestamp: "2026-07-21 07:10:55", user: "System Administrator", role: "SUPER_ADMIN", action: "CONFIG_UPDATED", resource: "platform/config", severity: "warning", ip: "192.168.1.1", details: "Security policy updated: 2FA enforced for all admins" },
  { id: "9", timestamp: "2026-07-21 06:55:40", user: "Khalid Hassan", role: "GUEST", action: "TICKET_CREATED", resource: "tickets/TK-00892", severity: "info", ip: "10.0.1.88", details: "Maintenance ticket created for Unit B-101" },
  { id: "10", timestamp: "2026-07-21 06:30:00", user: "System", role: "SYSTEM", action: "AUTO_INVOICE_GENERATED", resource: "invoices", severity: "success", ip: "—", details: "12 monthly invoices generated automatically" },
];

const SEVERITY_CONFIG = {
  info: { color: "bg-blue-100 text-blue-700", icon: <Info className="h-3.5 w-3.5" /> },
  success: { color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  warning: { color: "bg-amber-100 text-amber-700", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  error: { color: "bg-red-100 text-red-700", icon: <XCircle className="h-3.5 w-3.5" /> },
};

const ACTION_ICONS: Record<string, React.ReactNode> = {
  ROLE_UPDATED: <User className="h-4 w-4" />,
  LEASE_CREATED: <FileText className="h-4 w-4" />,
  LOGIN_FAILED: <Key className="h-4 w-4" />,
  BACKUP_COMPLETED: <ShieldCheck className="h-4 w-4" />,
  TENANT_ONBOARDED: <Building2 className="h-4 w-4" />,
  RECEIPT_GENERATED: <FileText className="h-4 w-4" />,
  BRUTE_FORCE_DETECTED: <AlertTriangle className="h-4 w-4" />,
  CONFIG_UPDATED: <Settings className="h-4 w-4" />,
  TICKET_CREATED: <FileText className="h-4 w-4" />,
  AUTO_INVOICE_GENERATED: <FileText className="h-4 w-4" />,
};

function SecurityPage() {
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");

  const filtered = MOCK_LOGS.filter(log => {
    const matchSearch = log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = severityFilter === "All" || log.severity === severityFilter;
    return matchSearch && matchSeverity;
  });

  const counts = {
    error: MOCK_LOGS.filter(l => l.severity === "error").length,
    warning: MOCK_LOGS.filter(l => l.severity === "warning").length,
    info: MOCK_LOGS.filter(l => l.severity === "info").length,
    success: MOCK_LOGS.filter(l => l.severity === "success").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Security & Audit</h1>
          <p className="text-sm text-muted-foreground mt-1">Immutable log of all platform-level actions and security events.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Export Logs
        </Button>
      </div>

      {/* Security Summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Critical Alerts", value: counts.error, tone: "bg-red-50 border-red-200 text-red-700", icon: <XCircle className="h-4 w-4" /> },
          { label: "Warnings", value: counts.warning, tone: "bg-amber-50 border-amber-200 text-amber-700", icon: <AlertTriangle className="h-4 w-4" /> },
          { label: "Info Events", value: counts.info, tone: "bg-blue-50 border-blue-200 text-blue-700", icon: <Info className="h-4 w-4" /> },
          { label: "Successful Actions", value: counts.success, tone: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: <CheckCircle2 className="h-4 w-4" /> },
        ].map(card => (
          <div key={card.label} className={`rounded-xl border p-4 ${card.tone}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">{card.label}</p>
              {card.icon}
            </div>
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-xs mt-1 opacity-80">Last 24 hours</p>
          </div>
        ))}
      </div>

      {/* Active Security Alerts */}
      <Card className="border-red-200 bg-red-50/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-red-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Active Security Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-100/60 border border-red-200">
              <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-800">Brute Force Attempt Detected</p>
                <p className="text-xs text-red-600 mt-0.5">IP 185.220.101.45 — Multiple rapid login attempts — Auto-blocked at 07:30</p>
              </div>
              <Button size="sm" variant="outline" className="text-xs h-7 border-red-300 text-red-700 hover:bg-red-100">Investigate</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-base">Audit Log</CardTitle>
              <CardDescription>Complete immutable history of all platform actions</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  className="pl-9 h-9 w-56"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select
                value={severityFilter}
                onChange={e => setSeverityFilter(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="All">All Levels</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {filtered.map(log => {
              const sev = SEVERITY_CONFIG[log.severity];
              return (
                <div
                  key={log.id}
                  className="grid grid-cols-[auto_1fr_auto] gap-4 p-3 rounded-lg hover:bg-muted/40 transition-colors border border-transparent hover:border-border"
                >
                  <div className="flex items-start pt-0.5">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${sev.color}`}>
                      {sev.icon} {log.severity}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{log.action.replace(/_/g, " ")}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{log.user}</span>
                      <Badge variant="outline" className="text-xs px-1 py-0 h-4">{log.role}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5 font-mono">{log.resource} · IP: {log.ip}</p>
                  </div>
                  <div className="flex items-start gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mt-0.5" />
                    <span className="whitespace-nowrap">{log.timestamp}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
