import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Bell, Mail, Send, Eye, Sliders, Check, ArrowRight,
  Plus, Calendar, Repeat, RefreshCw, Sparkles, Save, Edit, Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  createBroadcastNotification,
  fetchInAppNotifications,
  type SystemNotification
} from "@/lib/system-config";

export const Route = createFileRoute("/super-admin/alerts")({
  head: () => ({ meta: [{ title: "In-App & Alerts Governance — ZYNO Super Admin" }] }),
  component: AlertsPage,
});

// Custom template structure for interactive split-screen editor/preview
export interface NotificationTemplateItem {
  id: string;
  name: string;
  channel: "In-App Notification" | "Transactional Email" | "System SMS";
  trigger: string;
  enabled: boolean;
  subject: string;
  body: string;
  badgeTone: "emerald" | "indigo" | "amber" | "rose" | "blue";
  schedule_type?: "instant" | "future" | "recurring";
  scheduled_for?: string;
  recurring_cron?: string;
  ctaText?: string;
  ctaUrl?: string;
}

const DEFAULT_TEMPLATES: Record<string, NotificationTemplateItem> = {
  welcome: {
    id: "welcome",
    name: "Tenant Organisation Welcome",
    channel: "Transactional Email",
    trigger: "Triggered on successful tenant onboarding and plan provisioning",
    enabled: true,
    subject: "Welcome to ZYNO Real Estate OS — Credentials & Onboarding Handover",
    body: "Dear {{organisation_name}} Team,\n\nYour tenant workspace is now active under the {{plan_name}} Plan.\n\nAdmin Email: {{admin_email}}\nAccess URL: https://pms.zyno.qa/login\n\nPlease sign in with your credentials to configure properties, staff roles, and payment gateways.",
    badgeTone: "indigo",
    schedule_type: "instant",
    ctaText: "Access Portal",
    ctaUrl: "https://pms.zyno.qa/login",
  },
  newSignup: {
    id: "newSignup",
    name: "Super Admin Onboarding Alert",
    channel: "In-App Notification",
    trigger: "Broadcasted when a new client organization registers or subscribes",
    enabled: true,
    subject: "New Tenant Registered: {{organisation_name}}",
    body: "A new client organisation ({{organisation_name}}) has completed onboarding with plan {{plan_name}}. Initial subscription invoice generated.",
    badgeTone: "emerald",
    schedule_type: "instant",
    ctaText: "Review Tenant",
    ctaUrl: "/super-admin/tenants",
  },
  monthlyInvoice: {
    id: "monthlyInvoice",
    name: "Recurring Monthly Billing Invoice",
    channel: "Transactional Email",
    trigger: "Dispatched at 00:15 AST on the 1st of every calendar month",
    enabled: true,
    subject: "Tax Invoice #{{invoice_no}} for Period {{billing_period}}",
    body: "Hello {{recipient_name}},\n\nYour monthly property rental invoice #{{invoice_no}} of QAR {{amount_due}} is now available for settlement.\n\nDue Date: {{due_date}}\nPayment Methods: QPay (Debit Card), Credit Card, or PDC Deposit.",
    badgeTone: "indigo",
    schedule_type: "recurring",
    recurring_cron: "00:15 AST (1st of month)",
    ctaText: "Pay Invoice",
    ctaUrl: "/portal/payments",
  },
  leaseRenewal: {
    id: "leaseRenewal",
    name: "Lease Expiry & Renewal Notice",
    channel: "Transactional Email",
    trigger: "Triggered automatically 60 days prior to contract expiration date",
    enabled: true,
    subject: "Notice: Your Lease for Unit {{unit_no}} Expires in 60 Days",
    body: "Dear {{tenant_name}},\n\nThis is a formal notification that your lease agreement for Unit {{unit_no}} at {{property_name}} is set to expire on {{expiry_date}}.\n\nPlease contact your Property Manager to execute your lease renewal.",
    badgeTone: "amber",
    schedule_type: "future",
    scheduled_for: "60 Days Prior to Expiry",
    ctaText: "Renew Contract",
    ctaUrl: "/portal/leases",
  },
  maintenanceUpdate: {
    id: "maintenanceUpdate",
    name: "Maintenance Work Order Status Update",
    channel: "In-App Notification",
    trigger: "Triggered whenever a ticket transitions between Open, In Progress, or Resolved",
    enabled: true,
    subject: "Ticket #{{ticket_id}}: Status Changed to {{ticket_status}}",
    body: "Work order #{{ticket_id}} ({{issue_category}}) for Unit {{unit_no}} has been updated by technician {{technician_name}}.",
    badgeTone: "blue",
    schedule_type: "instant",
    ctaText: "View Ticket",
    ctaUrl: "/maintenance/tickets",
  },
  pdcClearingAlert: {
    id: "pdcClearingAlert",
    name: "Cheque / PDC Clearing Notification",
    channel: "In-App Notification",
    trigger: "Triggered at 00:05 AST when matured cheques are cleared to General Ledger",
    enabled: true,
    subject: "PDC Cleared: Cheque #{{cheque_no}} for QAR {{cheque_amount}}",
    body: "Cheque #{{cheque_no}} from tenant {{tenant_name}} for QAR {{cheque_amount}} was successfully verified and cleared into {{bank_account}}.",
    badgeTone: "emerald",
    schedule_type: "recurring",
    recurring_cron: "00:05 AST Daily",
    ctaText: "View Voucher",
    ctaUrl: "/finance/vouchers",
  },
};

export function AlertsPage() {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<Record<string, NotificationTemplateItem>>(DEFAULT_TEMPLATES);
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<string | null>(null);
  const [templateForm, setTemplateForm] = useState<NotificationTemplateItem | null>(null);
  const [isCreatingNewTemplate, setIsCreatingNewTemplate] = useState(false);
  
  // In-App Notifications State
  const [inAppNotifs, setInAppNotifs] = useState<SystemNotification[]>([]);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
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
  const [broadcasting, setBroadcasting] = useState(false);

  // Sub-Tab State: All, In-App, Emails
  const [notificationSubTab, setNotificationSubTab] = useState<"all-rules" | "in-app" | "emails">("all-rules");

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const list = await fetchInAppNotifications();
      setInAppNotifs(list);
    } catch (e: any) {
      toast.error("Failed to load notifications: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendBroadcast(e: React.FormEvent) {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      toast.error("Please provide both a title and a message.");
      return;
    }

    setBroadcasting(true);
    try {
      const res = await createBroadcastNotification({
        title: broadcastForm.title,
        message: broadcastForm.message,
        type: broadcastForm.type,
        target_role: broadcastForm.target_role,
        action_url: broadcastForm.action_url,
        schedule_type: broadcastForm.schedule_type,
        scheduled_for: broadcastForm.schedule_type === "future" ? broadcastForm.scheduled_for : null,
        recurring_cron: broadcastForm.schedule_type === "recurring" ? broadcastForm.recurring_cron : null,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to broadcast notification.");
        return;
      }

      toast.success(
        broadcastForm.schedule_type === "instant"
          ? "In-App Broadcast notification pushed to all users!"
          : `Notification successfully scheduled (${broadcastForm.schedule_type})!`
      );
      setShowBroadcastModal(false);
      setBroadcastForm({
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
    } catch (e: any) {
      toast.error(e.message || "Broadcast failed.");
    } finally {
      setBroadcasting(false);
    }
  }

  function openTemplateEditor(key: string) {
    setIsCreatingNewTemplate(false);
    setSelectedTemplateKey(key);
    setTemplateForm({ ...templates[key] });
  }

  function openNewTemplateModal() {
    setIsCreatingNewTemplate(true);
    const newId = `custom_${Date.now()}`;
    setSelectedTemplateKey(newId);
    setTemplateForm({
      id: newId,
      name: "New Notification Rule",
      channel: notificationSubTab === "emails" ? "Transactional Email" : "In-App Notification",
      trigger: "Triggered on custom system event or schedule",
      enabled: true,
      subject: "Important System Notification",
      body: "Hello {{recipient_name}},\n\nThis is a notification regarding your account.\n\nThank you,\n{{organisation_name}} Management",
      badgeTone: "emerald",
      schedule_type: "instant",
      ctaText: "View Portal",
      ctaUrl: "/portal",
    });
  }

  function saveTemplateCustomization() {
    if (!selectedTemplateKey || !templateForm) return;
    setTemplates({
      ...templates,
      [selectedTemplateKey]: templateForm,
    });
    toast.success(`Template "${templateForm.name}" updated successfully!`);
    setSelectedTemplateKey(null);
    setTemplateForm(null);
    setIsCreatingNewTemplate(false);
  }

  // Filter templates based on active sub-tab
  const filteredTemplates = Object.entries(templates).filter(([_, item]) => {
    if (notificationSubTab === "in-app") return item.channel === "In-App Notification";
    if (notificationSubTab === "emails") return item.channel === "Transactional Email";
    return true; // "all-rules"
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white border border-indigo-500/20 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-md">
              <Bell className="h-3.5 w-3.5 text-amber-300" />
              <span>Notification Governance & Broadcast Delivery</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">In-App & Alerts Management</h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Configure system notification rules, compose transactional email templates with live side-by-side preview, and dispatch scheduled platform announcements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={openNewTemplateModal}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white gap-1.5 text-xs font-semibold h-9 shadow-md"
            >
              <Plus className="h-3.5 w-3.5" /> Add Notification Rule
            </Button>
            <Button
              onClick={() => setShowBroadcastModal(true)}
              className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white gap-1.5 text-xs font-semibold h-9 shadow-md"
            >
              <Send className="h-3.5 w-3.5" /> Broadcast Live Alert
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadNotifications}
              disabled={loading}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-9 gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>
        </div>

        {/* Decorative ambient background */}
        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      </div>

      {/* Main Content Card */}
      <Card className="border border-border/80 shadow-sm bg-card">
        <CardHeader className="pb-4 border-b border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold">In-App & Email Notification Rules & Templates</CardTitle>
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] uppercase font-bold">
                  {filteredTemplates.length} Rules in View
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Configure instant, scheduled, or recurring delivery rules with full split-screen text editor & live preview
              </CardDescription>
            </div>

            {/* Sub-Tabs */}
            <div className="inline-flex p-1 bg-muted/60 rounded-xl border border-border/60">
              <button
                onClick={() => setNotificationSubTab("all-rules")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  notificationSubTab === "all-rules" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All Rules ({Object.keys(templates).length})
              </button>
              <button
                onClick={() => setNotificationSubTab("in-app")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  notificationSubTab === "in-app" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Bell className="h-3.5 w-3.5" /> In-App Notifications
              </button>
              <button
                onClick={() => setNotificationSubTab("emails")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  notificationSubTab === "emails" ? "bg-background text-indigo-600 shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail className="h-3.5 w-3.5" /> Transactional Emails
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
              No templates found in this category. Click "Add Notification Rule" to create one.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredTemplates.map(([key, item]) => (
                <div
                  key={key}
                  className="p-4 rounded-xl border border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/30 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-bold">
                          {item.channel}
                        </Badge>
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] capitalize">
                          {item.schedule_type || "Instant"}
                        </Badge>
                      </div>
                      <Badge className={`text-[10px] font-bold ${
                        item.badgeTone === "emerald" ? "bg-emerald-500/15 text-emerald-600" :
                        item.badgeTone === "indigo" ? "bg-indigo-500/15 text-indigo-600" :
                        item.badgeTone === "amber" ? "bg-amber-500/15 text-amber-600" :
                        "bg-blue-500/15 text-blue-600"
                      }`}>
                        Active Trigger
                      </Badge>
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{item.name}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.trigger}</p>
                    <div className="p-2.5 rounded-lg bg-background/80 border border-border/40 text-xs">
                      <span className="font-semibold text-foreground">Subject: </span>
                      <span className="text-muted-foreground font-mono">{item.subject}</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openTemplateEditor(key)}
                    className="w-full justify-center gap-2 text-xs font-semibold h-9 bg-card hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <Sliders className="h-3.5 w-3.5" /> Customize Template & Live Preview
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── SPLIT-SCREEN NOTIFICATION TEMPLATE & RULE CUSTOMIZER MODAL ───────── */}
      <Dialog open={!!selectedTemplateKey && !!templateForm} onOpenChange={(open) => !open && setSelectedTemplateKey(null)}>
        <DialogContent className="sm:max-w-[1000px] border border-amber-500/30 shadow-2xl bg-card p-0 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {isCreatingNewTemplate ? "Create New Notification Rule & Template" : `Customize Template: ${templateForm?.name}`}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Interactive split-screen text editor with real-time simulated client preview
                  </p>
                </div>
              </div>
              <Badge className="bg-primary/20 text-primary-foreground border-primary/30 text-xs">
                Live Preview
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60 p-6 gap-6 max-h-[70vh] overflow-y-auto">
            {/* Left Part: Text Editor & Parameters */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Edit className="h-4 w-4 text-primary" /> Template Editor & Content
                </h4>
                <span className="text-[11px] text-muted-foreground">Markdown & Variables Enabled</span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Rule / Template Name</Label>
                <Input
                  value={templateForm?.name || ""}
                  onChange={(e) => templateForm && setTemplateForm({ ...templateForm, name: e.target.value })}
                  placeholder="e.g. Monthly Rent Invoice Dispatch"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Dispatch Channel</Label>
                  <select
                    value={templateForm?.channel}
                    onChange={(e) => templateForm && setTemplateForm({ ...templateForm, channel: e.target.value as any })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="In-App Notification">In-App Notification</option>
                    <option value="Transactional Email">Transactional Email</option>
                    <option value="System SMS">System SMS</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Schedule Delivery</Label>
                  <select
                    value={templateForm?.schedule_type || "instant"}
                    onChange={(e) => templateForm && setTemplateForm({ ...templateForm, schedule_type: e.target.value as any })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="instant">Instant (Immediate Trigger)</option>
                    <option value="future">Scheduled Future Window</option>
                    <option value="recurring">Recurring Schedule (AST)</option>
                  </select>
                </div>
              </div>

              {templateForm?.schedule_type === "future" && (
                <div className="space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/40">
                  <Label className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                    <Calendar className="h-3.5 w-3.5" /> Future Trigger Date / Window
                  </Label>
                  <Input
                    value={templateForm?.scheduled_for || ""}
                    onChange={(e) => templateForm && setTemplateForm({ ...templateForm, scheduled_for: e.target.value })}
                    placeholder="e.g. 2026-10-01 09:00 AST or 60 Days Prior to Expiry"
                    className="text-xs font-semibold"
                  />
                </div>
              )}

              {templateForm?.schedule_type === "recurring" && (
                <div className="space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/40">
                  <Label className="text-xs font-semibold flex items-center gap-1.5 text-indigo-500">
                    <Repeat className="h-3.5 w-3.5" /> Recurring Frequency (AST Standard)
                  </Label>
                  <select
                    value={templateForm?.recurring_cron || "00:00 AST (Daily Midnight)"}
                    onChange={(e) => templateForm && setTemplateForm({ ...templateForm, recurring_cron: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="00:05 AST Daily">Daily at 00:05 AST (Midnight)</option>
                    <option value="00:15 AST (1st of month)">Monthly (1st of Month at 00:15 AST)</option>
                    <option value="Weekly (Every Sunday 08:00 AST)">Weekly (Every Sunday 08:00 AST)</option>
                    <option value="Quarterly (1st Day of Quarter)">Quarterly (1st Day of Quarter)</option>
                  </select>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Subject / Title</Label>
                <Input
                  value={templateForm?.subject || ""}
                  onChange={(e) => templateForm && setTemplateForm({ ...templateForm, subject: e.target.value })}
                  placeholder="Enter notification subject..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Notification Content Body</Label>
                <Textarea
                  rows={6}
                  value={templateForm?.body || ""}
                  onChange={(e) => templateForm && setTemplateForm({ ...templateForm, body: e.target.value })}
                  placeholder="Enter message body with {{variables}}..."
                  className="font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Button Label (CTA)</Label>
                  <Input
                    value={templateForm?.ctaText || ""}
                    onChange={(e) => templateForm && setTemplateForm({ ...templateForm, ctaText: e.target.value })}
                    placeholder="e.g. View Invoice"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Button Action URL</Label>
                  <Input
                    value={templateForm?.ctaUrl || ""}
                    onChange={(e) => templateForm && setTemplateForm({ ...templateForm, ctaUrl: e.target.value })}
                    placeholder="e.g. /portal/payments"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-[11px] space-y-1 text-muted-foreground">
                <p className="font-semibold text-foreground">Supported Merge Tags:</p>
                <p className="font-mono text-[10px] text-primary">
                  {"{{organisation_name}}"}, {"{{tenant_name}}"}, {"{{unit_no}}"}, {"{{property_name}}"}, {"{{amount_due}}"}, {"{{invoice_no}}"}
                </p>
              </div>
            </div>

            {/* Right Part: Real-Time User Delivery Preview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4 text-emerald-600" /> Real-Time Delivery Preview
                </h4>
                <Badge variant="outline" className="text-[10px]">
                  {templateForm?.channel === "Transactional Email" ? "Email Client View" : "In-App Popup View"}
                </Badge>
              </div>

              {templateForm?.channel === "Transactional Email" ? (
                /* Email Delivery Mock */
                <div className="rounded-xl border border-border/80 shadow-md bg-card overflow-hidden text-xs">
                  <div className="p-3 bg-muted/50 border-b border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <div>
                      <span className="font-bold text-foreground">From: </span>ZYNO Real Estate OS &lt;noreply@zyno.qa&gt;
                    </div>
                    <span className="font-mono">Today, 00:15 AST</span>
                  </div>
                  <div className="p-3 bg-muted/20 border-b border-border/40 text-[11px]">
                    <span className="font-bold text-foreground">Subject: </span>
                    <span className="font-semibold text-foreground">
                      {(templateForm?.subject || "")
                        .replace("{{invoice_no}}", "INV-2026-0901")
                        .replace("{{billing_period}}", "September 2026")
                        .replace("{{unit_no}}", "Unit 402")
                        .replace("{{organisation_name}}", "Al Rayyan Properties")}
                    </span>
                  </div>
                  <div className="p-5 space-y-4 bg-background">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                      <Sparkles className="h-4 w-4" /> ZYNO PMS Notification
                    </div>
                    <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                      {(templateForm?.body || "")
                        .replace("{{organisation_name}}", "Al Rayyan Properties W.L.L.")
                        .replace("{{plan_name}}", "Enterprise Tier")
                        .replace("{{admin_email}}", "admin@alrayyan.qa")
                        .replace("{{recipient_name}}", "Fatima Al-Kuwari")
                        .replace("{{invoice_no}}", "INV-2026-0901")
                        .replace("{{amount_due}}", "8,500")
                        .replace("{{due_date}}", "05/10/2026")
                        .replace("{{tenant_name}}", "Mohammed Al-Sulaiti")
                        .replace("{{unit_no}}", "Unit 402")
                        .replace("{{property_name}}", "Lusail Marina Tower")
                        .replace("{{expiry_date}}", "30/11/2026")}
                    </p>
                    {templateForm?.ctaText && (
                      <div className="pt-2">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold text-xs shadow-md"
                        >
                          {templateForm.ctaText} →
                        </button>
                      </div>
                    )}
                    <div className="border-t border-border/40 pt-3 text-[10px] text-muted-foreground">
                      © 2026 ZYNO Holdings W.L.L. • Doha, State of Qatar • All rights reserved.
                    </div>
                  </div>
                </div>
              ) : (
                /* In-App Bell Notification Mock */
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 shadow-md space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                          <Bell className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {(templateForm?.subject || "").replace("{{organisation_name}}", "Al Rayyan Properties")}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">Just now</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed pl-9">
                      {(templateForm?.body || "")
                        .replace("{{organisation_name}}", "Al Rayyan Properties")
                        .replace("{{plan_name}}", "Enterprise Tier")
                        .replace("{{ticket_id}}", "TKT-8841")
                        .replace("{{ticket_status}}", "In Progress")
                        .replace("{{technician_name}}", "Karim Mansour")
                        .replace("{{unit_no}}", "Unit 402")
                        .replace("{{issue_category}}", "HVAC Maintenance")
                        .replace("{{cheque_no}}", "CHQ-99042")
                        .replace("{{cheque_amount}}", "12,000")
                        .replace("{{tenant_name}}", "Nasser Al-Attiyah")
                        .replace("{{bank_account}}", "QNB Main Operating Account")}
                    </p>
                    {templateForm?.ctaText && (
                      <div className="pl-9 pt-1">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                          {templateForm.ctaText} <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-muted/40 border-t border-border/60 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setSelectedTemplateKey(null)} className="text-xs">
              Cancel
            </Button>
            <Button
              onClick={saveTemplateCustomization}
              className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white text-xs font-semibold gap-2 shadow-md"
            >
              <Save className="h-3.5 w-3.5" /> {isCreatingNewTemplate ? "Create Rule" : "Save Template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── BROADCAST LIVE IN-APP ALERT (Split-Screen Editor + Live Preview + Scheduling) ── */}
      <Dialog open={showBroadcastModal} onOpenChange={setShowBroadcastModal}>
        <DialogContent className="sm:max-w-[1000px] border border-primary/30 shadow-2xl bg-card p-0 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/25">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Broadcast In-App Announcement & Notification</h3>
                  <p className="text-xs text-slate-300">
                    Live split-screen broadcast composer with instant, future, and recurring delivery scheduling
                  </p>
                </div>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                Interactive Preview Active
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSendBroadcast}>
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60 p-6 gap-6 max-h-[70vh] overflow-y-auto">
              {/* Left Part: Broadcast Input Form */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Edit className="h-4 w-4 text-primary" /> Announcement Details
                  </h4>
                  <span className="text-[11px] text-muted-foreground">Super Admin Authority</span>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Alert Headline / Title</Label>
                  <Input
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    placeholder="e.g. Scheduled System Upgrade or Important Notice"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Alert Severity / Type</Label>
                    <select
                      value={broadcastForm.type}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value as any })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="info">Information (Blue)</option>
                      <option value="announcement">Announcement (Purple)</option>
                      <option value="success">Success / Milestone (Green)</option>
                      <option value="warning">Warning Notice (Amber)</option>
                      <option value="critical">Critical Urgency (Red)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Target Audience</Label>
                    <select
                      value={broadcastForm.target_role}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, target_role: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="ALL">Everyone (Staff + Tenants)</option>
                      <option value="ADMIN">Property Managers & Admins</option>
                      <option value="FINANCE">Finance & Cashier Team</option>
                      <option value="TENANT">Tenants Only</option>
                    </select>
                  </div>
                </div>

                {/* Scheduling controls */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Schedule Delivery</Label>
                  <select
                    value={broadcastForm.schedule_type}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, schedule_type: e.target.value as any })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="instant">One-Time (Broadcast Immediately)</option>
                    <option value="future">Scheduled Future Date & Time</option>
                    <option value="recurring">Recurring Periodic Schedule</option>
                  </select>
                </div>

                {broadcastForm.schedule_type === "future" && (
                  <div className="space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/40">
                    <Label className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                      <Calendar className="h-3.5 w-3.5" /> Scheduled Dispatch Time (AST)
                    </Label>
                    <Input
                      type="datetime-local"
                      value={broadcastForm.scheduled_for}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, scheduled_for: e.target.value })}
                      className="text-xs"
                      required
                    />
                  </div>
                )}

                {broadcastForm.schedule_type === "recurring" && (
                  <div className="space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/40">
                    <Label className="text-xs font-semibold flex items-center gap-1.5 text-indigo-500">
                      <Repeat className="h-3.5 w-3.5" /> Recurrence Cycle (AST)
                    </Label>
                    <select
                      value={broadcastForm.recurring_cron}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, recurring_cron: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="00:00 AST (Daily Midnight)">Daily at Midnight (00:00 AST)</option>
                      <option value="08:00 AST (Daily Morning)">Daily Morning at 08:00 AST</option>
                      <option value="00:15 AST (1st of month)">Monthly on the 1st (00:15 AST)</option>
                      <option value="Every Sunday 08:00 AST">Weekly on Sundays at 08:00 AST</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Announcement Body</Label>
                  <Textarea
                    rows={4}
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    placeholder="Enter message content..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Action Button Text</Label>
                    <Input
                      value={broadcastForm.ctaText}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, ctaText: e.target.value })}
                      placeholder="e.g. View Details"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Action URL (Optional Link)</Label>
                    <Input
                      value={broadcastForm.action_url}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, action_url: e.target.value })}
                      placeholder="e.g. /prop-mgr/leases"
                    />
                  </div>
                </div>
              </div>

              {/* Right Part: Real-Time User Delivery Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4 text-emerald-600" /> Recipient Live Preview
                  </h4>
                  <Badge variant="outline" className="text-[10px]">
                    In-App Notification Bell Item
                  </Badge>
                </div>

                <div className="space-y-3 pt-2">
                  <div className={`p-4 rounded-xl border shadow-md space-y-2.5 transition-all ${
                    broadcastForm.type === "critical"
                      ? "border-red-500/30 bg-red-500/5"
                      : broadcastForm.type === "warning"
                      ? "border-amber-500/30 bg-amber-500/5"
                      : broadcastForm.type === "success"
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-primary/30 bg-primary/5"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                          <Bell className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-bold text-foreground">
                          {broadcastForm.title || "Announcement Title"}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">Just now</span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed pl-9">
                      {broadcastForm.message || "Your message body content will appear here in real-time as you type..."}
                    </p>

                    {broadcastForm.action_url && (
                      <div className="pl-9 pt-1">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                          {broadcastForm.ctaText || "View Details"} <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20 text-xs space-y-1.5 text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Audience Reach:</span>
                      <span className="font-mono text-primary font-bold">{broadcastForm.target_role} Accounts</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Delivery Method:</span>
                      <span className="font-bold text-foreground capitalize">{broadcastForm.schedule_type}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">Audit Logging:</span>
                      <span className="font-bold text-emerald-600">Recorded to security_audit_logs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/40 border-t border-border/60 flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowBroadcastModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={broadcasting}
                className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white gap-2 text-xs font-semibold shadow-md"
              >
                <Send className="h-3.5 w-3.5" /> {broadcastForm.schedule_type === "instant" ? "Broadcast Alert Live" : "Schedule Alert"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
