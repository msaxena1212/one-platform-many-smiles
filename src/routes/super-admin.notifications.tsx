import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell, Send, CheckCircle2, AlertTriangle, Info,
  Building2, Users, FileText, Wallet, Plus, X
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/super-admin/notifications")({
  head: () => ({ meta: [{ title: "Notifications — ZYNO Super Admin" }] }),
  component: NotificationsPage,
});

type NotifType = "info" | "success" | "warning" | "alert";

type Notification = {
  id: string;
  title: string;
  body: string;
  type: NotifType;
  audience: string;
  sentAt: string;
  reach: number;
};

const TYPE_CONFIG: Record<NotifType, { color: string; icon: React.ReactNode }> = {
  info: { color: "bg-blue-100 text-blue-700", icon: <Info className="h-3.5 w-3.5" /> },
  success: { color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  warning: { color: "bg-amber-100 text-amber-700", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  alert: { color: "bg-red-100 text-red-700", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
};

const SENT_NOTIFICATIONS: Notification[] = [
  { id: "1", title: "System Maintenance Scheduled", body: "The platform will undergo scheduled maintenance on July 25, 2026 from 2:00–4:00 AM AST. All services may be temporarily unavailable.", type: "warning", audience: "All Users", sentAt: "2026-07-20 14:00", reach: 156 },
  { id: "2", title: "New Feature: Lease Renewal Automation", body: "We've launched automated lease renewal notifications. Tenants will now receive reminders 60, 30, and 7 days before lease expiry.", type: "info", audience: "Admins & Hosts", sentAt: "2026-07-18 09:30", reach: 42 },
  { id: "3", title: "Billing Cycle Complete", body: "The July 2026 billing cycle has been processed. All tenant invoices have been generated and emailed.", type: "success", audience: "Tenant Admins", sentAt: "2026-07-01 06:00", reach: 13 },
  { id: "4", title: "Security Alert: Suspicious Login Activity", body: "We detected suspicious login attempts from multiple unrecognised IPs. Please review your account security settings.", type: "alert", audience: "All Admins", sentAt: "2026-06-28 11:15", reach: 55 },
];

const AUDIENCE_OPTIONS = [
  { value: "all", label: "All Users", icon: <Users className="h-4 w-4" /> },
  { value: "admins", label: "Tenant Admins & Hosts", icon: <Building2 className="h-4 w-4" /> },
  { value: "super_admins", label: "Super Admins Only", icon: <Bell className="h-4 w-4" /> },
  { value: "tenants", label: "Tenants / Customers", icon: <FileText className="h-4 w-4" /> },
];

function NotificationsPage() {
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({
    title: "", body: "", type: "info" as NotifType, audience: "all"
  });
  const [sending, setSending] = useState(false);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success(`Notification "${form.title}" sent to ${AUDIENCE_OPTIONS.find(a => a.value === form.audience)?.label}!`);
      setSending(false);
      setShowCompose(false);
      setForm({ title: "", body: "", type: "info", audience: "all" });
    }, 1200);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Broadcast platform-wide announcements and alerts to all tenants and users.
          </p>
        </div>
        <Button onClick={() => setShowCompose(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Notification
        </Button>
      </div>

      {/* Compose Panel */}
      {showCompose && (
        <Card className="border-primary/40 shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Compose Notification</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowCompose(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="notif-title">Notification Title</Label>
                  <Input
                    id="notif-title"
                    placeholder="e.g. System Maintenance Scheduled"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Type</Label>
                  <div className="flex gap-2">
                    {(["info", "success", "warning", "alert"] as NotifType[]).map(t => {
                      const cfg = TYPE_CONFIG[t];
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, type: t }))}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all ${
                            form.type === t ? cfg.color + " border-current ring-2 ring-offset-1" : "border-border hover:bg-muted"
                          }`}
                        >
                          {cfg.icon} {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notif-body">Message</Label>
                <Textarea
                  id="notif-body"
                  placeholder="Write your notification message here..."
                  rows={3}
                  value={form.body}
                  onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Target Audience</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {AUDIENCE_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, audience: opt.value }))}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-sm transition-all ${
                        form.audience === opt.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {opt.icon}
                      <span className="text-xs font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCompose(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 gap-2" disabled={sending}>
                  <Send className="h-4 w-4" />
                  {sending ? "Sending..." : "Send Notification"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "Sent This Month", value: "4", icon: <Send className="h-4 w-4" /> },
          { label: "Total Reach", value: "266", icon: <Users className="h-4 w-4" /> },
          { label: "Active Alerts", value: "1", icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
          { label: "Scheduled", value: "0", icon: <Bell className="h-4 w-4" /> },
        ].map(card => (
          <Card key={card.label}><CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <span className="text-primary opacity-70">{card.icon}</span>
            </div>
            <p className="text-2xl font-bold">{card.value}</p>
          </CardContent></Card>
        ))}
      </div>

      {/* Sent Notifications History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sent Notifications</CardTitle>
          <CardDescription>History of all platform-wide broadcasts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SENT_NOTIFICATIONS.map(notif => {
              const cfg = TYPE_CONFIG[notif.type];
              return (
                <div key={notif.id} className="rounded-xl border border-border p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <span className={`mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold flex-shrink-0 ${cfg.color}`}>
                        {cfg.icon} {notif.type}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {notif.audience}</span>
                          <span>·</span>
                          <span>{notif.reach} users reached</span>
                          <span>·</span>
                          <span>{notif.sentAt}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">Delivered</Badge>
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
