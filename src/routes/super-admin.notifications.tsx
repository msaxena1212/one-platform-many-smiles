import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Bell, Send, CheckCircle2, AlertTriangle, Info,
  Building2, Users, FileText, Wallet, Plus, X,
  Calendar, Repeat, Clock, Eye, ArrowRight, MousePointerClick,
  Sparkles, RefreshCw, Check, ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchInAppNotifications, createBroadcastNotification,
  type SystemNotification
} from "@/lib/system-config";
import { toast } from "sonner";

export const Route = createFileRoute("/super-admin/notifications")({
  head: () => ({ meta: [{ title: "Notification Center — ZYNO Super Admin" }] }),
  component: SuperAdminNotificationsPage,
});

export function SuperAdminNotificationsPage() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [form, setForm] = useState({
    title: "",
    message: "",
    type: "info" as "info" | "success" | "warning" | "critical" | "announcement",
    target_role: "ALL",
    action_url: "",
    schedule_type: "instant" as "instant" | "future" | "recurring",
    scheduled_for: "",
    recurring_cron: "00:00 AST (Daily Midnight)",
    ctaText: "View Details",
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const data = await fetchInAppNotifications();
      setNotifications(data);
    } catch (err: any) {
      toast.error("Failed to load notifications: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.message) {
      toast.error("Please provide both a title and message.");
      return;
    }

    setSending(true);
    try {
      const res = await createBroadcastNotification({
        title: form.title,
        message: form.message,
        type: form.type,
        target_role: form.target_role,
        action_url: form.action_url,
        schedule_type: form.schedule_type,
        scheduled_for: form.schedule_type === "future" ? form.scheduled_for : null,
        recurring_cron: form.schedule_type === "recurring" ? form.recurring_cron : null,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to send notification.");
        return;
      }

      toast.success(
        form.schedule_type === "instant"
          ? "Platform broadcast sent successfully!"
          : `Notification scheduled (${form.schedule_type})!`
      );
      setShowCompose(false);
      setForm({
        title: "",
        message: "",
        type: "info",
        target_role: "ALL",
        action_url: "",
        schedule_type: "instant",
        scheduled_for: "",
        recurring_cron: "00:00 AST (Daily Midnight)",
        ctaText: "View Details",
      });
      loadNotifications();
    } catch (err: any) {
      toast.error(err.message || "Failed to send notification.");
    } finally {
      setSending(false);
    }
  }

  const filteredNotifs = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "scheduled") return n.schedule_type && n.schedule_type !== "instant";
    if (activeTab === "critical") return n.type === "critical" || n.type === "warning";
    return true;
  });

  const totalViews = notifications.reduce((s, n) => s + (n.engagement_count || 0), 0);
  const totalClicks = notifications.reduce((s, n) => s + (n.click_count || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Platform Notification Center</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Broadcast platform-wide system announcements, emergency alerts, and operational messages across all tenants.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadNotifications} disabled={loading} className="gap-2 text-xs">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button onClick={() => setShowCompose(!showCompose)} className="gap-2 text-xs font-semibold">
            {showCompose ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showCompose ? "Close Composer" : "Compose Broadcast"}
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border border-border/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Total Broadcasts</span>
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold mt-1 text-foreground">{notifications.length}</p>
          </CardContent>
        </Card>
        <Card className="border border-border/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Scheduled Alerts</span>
              <Calendar className="h-4 w-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-bold mt-1 text-indigo-600">
              {notifications.filter((n) => n.schedule_type && n.schedule_type !== "instant").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">Tenant User Views</span>
              <Users className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold mt-1 text-emerald-600">{totalViews}</p>
          </CardContent>
        </Card>
        <Card className="border border-border/80">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">CTA Clicks</span>
              <MousePointerClick className="h-4 w-4 text-violet-500" />
            </div>
            <p className="text-2xl font-bold mt-1 text-violet-600">{totalClicks}</p>
          </CardContent>
        </Card>
      </div>

      {/* Split-Screen Compose Panel */}
      {showCompose && (
        <Card className="border border-primary/40 shadow-xl overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <Send className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Compose Platform Broadcast</h3>
                <p className="text-[11px] text-slate-300">Live WYSIWYG preview & scheduling for all tenants</p>
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">
              Live Delivery Preview
            </Badge>
          </div>

          <form onSubmit={handleSend}>
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60 p-6 gap-6">
              {/* Left Column: Form Editor */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Broadcast Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Platform Infrastructure Upgrade on Sunday 02:00 AST"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Tone & Style</Label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="info">Information (Blue)</option>
                      <option value="announcement">Platform Announcement (Purple)</option>
                      <option value="success">Feature Release (Green)</option>
                      <option value="warning">Maintenance Notice (Amber)</option>
                      <option value="critical">Critical Security (Red)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Recipient Target</Label>
                    <select
                      value={form.target_role}
                      onChange={(e) => setForm({ ...form, target_role: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="ALL">All Tenants & Users</option>
                      <option value="ADMIN">Tenant Administrators Only</option>
                      <option value="TENANT">End Tenants Only</option>
                      <option value="SUPER_ADMIN">Platform Super Admins</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Delivery Type</Label>
                  <select
                    value={form.schedule_type}
                    onChange={(e) => setForm({ ...form, schedule_type: e.target.value as any })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="instant">Instant Delivery (Send Now)</option>
                    <option value="future">Scheduled Future Date & Time</option>
                    <option value="recurring">Recurring Schedule</option>
                  </select>
                </div>

                {form.schedule_type === "future" && (
                  <div className="space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/40">
                    <Label className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                      <Calendar className="h-3.5 w-3.5" /> Scheduled AST Time
                    </Label>
                    <Input
                      type="datetime-local"
                      value={form.scheduled_for}
                      onChange={(e) => setForm({ ...form, scheduled_for: e.target.value })}
                      className="text-xs"
                      required
                    />
                  </div>
                )}

                {form.schedule_type === "recurring" && (
                  <div className="space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/40">
                    <Label className="text-xs font-semibold flex items-center gap-1.5 text-indigo-500">
                      <Repeat className="h-3.5 w-3.5" /> Recurrence Interval
                    </Label>
                    <select
                      value={form.recurring_cron}
                      onChange={(e) => setForm({ ...form, recurring_cron: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="00:00 AST (Daily Midnight)">Daily Midnight (00:00 AST)</option>
                      <option value="08:00 AST (Daily Morning)">Daily Morning (08:00 AST)</option>
                      <option value="00:15 AST (1st of month)">Monthly (1st of Month at 00:15 AST)</option>
                      <option value="Weekly (Every Sunday 08:00 AST)">Weekly (Sundays at 08:00 AST)</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Message Body</Label>
                  <Textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Broadcast message content..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Action Button Text</Label>
                    <Input
                      value={form.ctaText}
                      onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                      placeholder="e.g. View Details"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Action Target Link</Label>
                    <Input
                      value={form.action_url}
                      onChange={(e) => setForm({ ...form, action_url: e.target.value })}
                      placeholder="e.g. /super-admin/config"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Live Recipient Delivery Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4 text-emerald-600" /> User Notification Preview
                  </h4>
                  <Badge variant="outline" className="text-[10px]">
                    Delivered Notification Card
                  </Badge>
                </div>

                <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2.5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                        <Bell className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-bold text-foreground">
                        {form.title || "Broadcast Title"}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">Just now</span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed pl-9">
                    {form.message || "Message content will appear here in real time..."}
                  </p>

                  {form.action_url && (
                    <div className="pl-9 pt-1">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                        {form.ctaText || "View Details"} <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 text-xs space-y-1.5 text-muted-foreground">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Target Audience:</span>
                    <span className="font-mono text-primary font-bold">{form.target_role} Accounts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Delivery Method:</span>
                    <span className="font-bold text-foreground capitalize">{form.schedule_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Engagement Telemetry:</span>
                    <span className="font-bold text-emerald-600">Reads, Clicks & CTR Tracked</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/40 border-t border-border/60 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowCompose(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={sending}
                className="bg-primary text-white gap-2 text-xs font-semibold shadow-md"
              >
                {sending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                {form.schedule_type === "instant" ? "Broadcast Alert Now" : "Save & Schedule Alert"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Broadcasts History */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold">Broadcast & Alert History</CardTitle>
                <CardDescription className="text-xs">All platform broadcasts, scheduled dispatches and user engagement metrics</CardDescription>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-muted/60 p-0.5 text-xs">
                <TabsTrigger value="all" className="text-xs py-1">All ({notifications.length})</TabsTrigger>
                <TabsTrigger value="scheduled" className="text-xs py-1">Scheduled</TabsTrigger>
                <TabsTrigger value="critical" className="text-xs py-1">Critical / Urgent</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {filteredNotifs.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No notifications found for this view.
            </div>
          ) : (
            <div className="divide-y divide-border/40 space-y-3">
              {filteredNotifs.map((n) => (
                <div key={n.id} className="pt-3 first:pt-0 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        className={`text-[10px] uppercase font-bold ${
                          n.type === "critical"
                            ? "bg-red-500/15 text-red-600 border-red-500/20"
                            : n.type === "warning"
                            ? "bg-amber-500/15 text-amber-600 border-amber-500/20"
                            : n.type === "success"
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
                            : "bg-blue-500/15 text-blue-600 border-blue-500/20"
                        }`}
                      >
                        {n.type}
                      </Badge>
                      <span className="text-sm font-semibold text-foreground">{n.title}</span>
                      <span className="text-[11px] text-muted-foreground">Target: {n.target_role}</span>
                      {n.schedule_type && n.schedule_type !== "instant" && (
                        <Badge variant="outline" className="text-[10px] gap-1 text-primary">
                          <Calendar className="h-2.5 w-2.5" /> {n.schedule_type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                  </div>

                  <div className="text-right space-y-1 whitespace-nowrap">
                    <span className="text-[11px] text-muted-foreground block">
                      {new Date(n.created_at).toLocaleDateString("en-QA", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground justify-end">
                      <span className="flex items-center gap-0.5 text-emerald-600" title="User Views">
                        <Users className="h-3 w-3" /> {n.engagement_count || 0} views
                      </span>
                      <span className="flex items-center gap-0.5 text-indigo-600" title="CTA Clicks">
                        <MousePointerClick className="h-3 w-3" /> {n.click_count || 0} clicks
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
