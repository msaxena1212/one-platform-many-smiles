import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Globe, Save, Mail, Bell, Shield, Database,
  Key, Languages, Clock, Upload, CheckCircle2,
  AlertTriangle, RefreshCw, Sparkles, Send, Eye,
  Sliders, ShieldCheck, Check, Info, Server,
  Lock, ArrowRight, Zap, CheckCheck, Edit,
  Plus, Calendar, Repeat, Activity, Users, MousePointerClick,
  Megaphone
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  fetchAllSystemConfigs, saveSystemConfig, createBroadcastNotification,
  fetchInAppNotifications, markNotificationAsRead,
  type ConfigKey, type PlatformIdentityConfig, type LocalizationConfig,
  type EngineAutomationConfig, type NotificationConfig, type SecurityPolicyConfig,
  type IntegrationConfig, type SystemNotification
} from "@/lib/system-config";

export const Route = createFileRoute("/super-admin/config")({
  head: () => ({ meta: [{ title: "Global Config & Governance — ZYNO Super Admin" }] }),
  component: ConfigPage,
});

// Custom template structure for interactive split-screen editor/preview
interface NotificationTemplateItem {
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

function DisplayField({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="p-3.5 rounded-xl border border-border/50 bg-background/80 hover:bg-muted/20 transition-all">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-foreground mt-1 truncate">{value || "—"}</p>
    </div>
  );
}

function ConfigPage() {
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // State slices
  const [identity, setIdentity] = useState<PlatformIdentityConfig>({} as any);
  const [localization, setLocalization] = useState<LocalizationConfig>({} as any);
  const [engines, setEngines] = useState<EngineAutomationConfig>({} as any);
  const [notifications, setNotifications] = useState<NotificationConfig>({} as any);
  const [security, setSecurity] = useState<SecurityPolicyConfig>({} as any);
  const [integrations, setIntegrations] = useState<IntegrationConfig>({} as any);

  // Template customizer state
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

  // Modals & Feedback
  const [savedSuccessModal, setSavedSuccessModal] = useState<{ title: string; desc: string } | null>(null);
  const [editModalSection, setEditModalSection] = useState<string | null>(null);

  // Custom Automation Creation State
  const [newAutomationForm, setNewAutomationForm] = useState<CustomAutomationItem>({
    id: "",
    name: "",
    description: "",
    executionTimeQatar: "00:00 AST",
    frequency: "daily",
    enabled: true,
    targetModule: "Core Finance & Ledger",
  });

  // Notification Sub-Tab State
  const [notificationSubTab, setNotificationSubTab] = useState<"in-app" | "emails" | "all-rules">("all-rules");

  useEffect(() => {
    loadAllConfigs();
    loadNotifications();
  }, []);

  async function loadAllConfigs() {
    setLoading(true);
    try {
      const data = await fetchAllSystemConfigs();
      setIdentity(data.platform_identity);
      setLocalization(data.localization);
      setEngines(data.engine_automations);
      setNotifications(data.notifications);
      setSecurity(data.security_policies);
      setIntegrations(data.integrations);
    } catch (err: any) {
      toast.error("Failed to load platform settings: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadNotifications() {
    const list = await fetchInAppNotifications();
    setInAppNotifs(list);
  }

  async function handleSave(sectionKey: ConfigKey, sectionName: string, data: any) {
    setSavingSection(sectionKey);
    try {
      const res = await saveSystemConfig(sectionKey, data);
      if (!res.success) {
        toast.error(`Error saving ${sectionName}: ${res.error}`);
        return;
      }

      setSavedSuccessModal({
        title: `${sectionName} Saved Successfully`,
        desc: `Your new ${sectionName.toLowerCase()} settings are now live across all tenants and database functions.`,
      });
      toast.success(`${sectionName} saved live to database!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update configuration.");
    } finally {
      setSavingSection(null);
    }
  }

  async function handleToggleEngine(engineKey: "pdcClearingEnabled" | "recurringBillingEnabled" | "assetDepreciationEnabled", currentVal: boolean | undefined) {
    const updated = {
      ...engines,
      [engineKey]: currentVal === undefined ? false : !currentVal,
    };
    setEngines(updated);
    await handleSave("engine_automations", "Engine Automations", updated);
  }

  async function handleToggleCustomEngine(id: string) {
    const existing = engines.customAutomations || [];
    const updatedList = existing.map((item) =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    const updatedEngines = {
      ...engines,
      customAutomations: updatedList,
    };
    setEngines(updatedEngines);
    await handleSave("engine_automations", "Engine Automations", updatedEngines);
  }

  async function handleCreateCustomAutomation(e: React.FormEvent) {
    e.preventDefault();
    if (!newAutomationForm.name) {
      toast.error("Please enter an automation name.");
      return;
    }

    const newId = `auto_${Date.now()}`;
    const itemToAdd: CustomAutomationItem = {
      ...newAutomationForm,
      id: newId,
    };

    const updatedEngines = {
      ...engines,
      customAutomations: [...(engines.customAutomations || []), itemToAdd],
    };

    setEngines(updatedEngines);
    await handleSave("engine_automations", "Engine Automations", updatedEngines);
    setEditModalSection(null);
    setNewAutomationForm({
      id: "",
      name: "",
      description: "",
      executionTimeQatar: "00:00 AST",
      frequency: "daily",
      enabled: true,
      targetModule: "Core Finance & Ledger",
    });
    toast.success(`Automation "${itemToAdd.name}" added successfully!`);
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

  if (loading) {
    return (
      <div className="min-h-[450px] flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading Global Configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white border border-indigo-500/20 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Platform Governance & Standards</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Global System Configuration</h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Master control center for branding, Qatar localization, automated background engines, security policies, and notification templates.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadAllConfigs}
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

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 h-auto p-1.5 bg-muted/60 backdrop-blur-sm rounded-xl border border-border/60">
          <TabsTrigger value="overview" className="rounded-lg py-2.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Sliders className="h-3.5 w-3.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="branding" className="rounded-lg py-2.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Globe className="h-3.5 w-3.5" /> Identity
          </TabsTrigger>
          <TabsTrigger value="localization" className="rounded-lg py-2.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Languages className="h-3.5 w-3.5" /> Regional (QA)
          </TabsTrigger>
          <TabsTrigger value="engines" className="rounded-lg py-2.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Zap className="h-3.5 w-3.5" /> Automations
          </TabsTrigger>
          <TabsTrigger value="security" className="rounded-lg py-2.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" /> Security & APIs
          </TabsTrigger>
        </TabsList>

        {/* ── 1. OVERVIEW TAB ──────────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Active Standard Card */}
            <Card className="bg-gradient-to-br from-card to-card/50 border border-primary/20 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all pointer-events-none" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Standard</span>
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px]">Active</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditModalSection("localization")}
                      className="h-7 px-2 text-xs text-primary font-semibold hover:bg-primary/10 gap-1"
                    >
                      <Sliders className="h-3 w-3" /> Edit
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg font-bold text-foreground mt-1">Qatar Standard (AST)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span>Timezone:</span>
                  <span className="font-semibold text-foreground">{localization.defaultTimezone || "Asia/Qatar"} (UTC+3)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span>Currency:</span>
                  <span className="font-semibold text-foreground">{localization.defaultCurrency || "QAR"} ({localization.currencySymbol || "QR"})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Date Format:</span>
                  <span className="font-semibold text-foreground">{localization.dateFormat || "DD/MM/YYYY"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Automated Engines Card */}
            <Card className="bg-gradient-to-br from-card to-card/50 border border-indigo-500/20 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Automated Engines</span>
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-indigo-500/15 text-indigo-600 border-indigo-500/20 text-[10px]">Active</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("engines")}
                      className="h-7 px-2 text-xs text-indigo-500 font-semibold hover:bg-indigo-500/10 gap-1"
                    >
                      <Sliders className="h-3 w-3" /> View All
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg font-bold text-foreground mt-1">Nightly AST Automations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span>PDC Clearing:</span>
                  <span className="font-semibold text-foreground">{engines.pdcClearingTimeQatar || "00:05 AST"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span>Rent Invoicing:</span>
                  <span className="font-semibold text-foreground">{engines.recurringBillingTimeQatar || "00:15 AST (1st of month)"}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Asset Depreciation:</span>
                  <span className="font-semibold text-foreground">{engines.assetDepreciationTimeQatar || "00:30 AST (1st of month)"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Security Tier Card */}
            <Card className="bg-gradient-to-br from-card to-card/50 border border-rose-500/20 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all pointer-events-none" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Security Tier</span>
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/20 text-[10px]">Zero-Trust</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditModalSection("security")}
                      className="h-7 px-2 text-xs text-rose-500 font-semibold hover:bg-rose-500/10 gap-1"
                    >
                      <Sliders className="h-3 w-3" /> Edit
                    </Button>
                  </div>
                </div>
                <CardTitle className="text-lg font-bold text-foreground mt-1">Immutable Audit & RLS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span>2FA Enforced (Super Admin):</span>
                  <span className="font-semibold text-emerald-600">{security.enforce2FASuperAdmin ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/40">
                  <span>Rate Limit:</span>
                  <span className="font-semibold text-foreground">{security.apiRateLimitPerMinute || 60} req/min</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Audit Logging:</span>
                  <span className="font-semibold text-emerald-600">Active (PostgreSQL)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* In-App Notifications Feed & Engagement Audit Trail */}
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Live In-App System Alerts & Engagement Trail</CardTitle>
                  <CardDescription className="text-xs">Broadcast history, delivery status, and user engagement metrics</CardDescription>
                </div>
              </div>
              <Button size="sm" onClick={() => setShowBroadcastModal(true)} className="gap-2 text-xs font-semibold">
                <Send className="h-3.5 w-3.5" /> Push New Alert
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              {inAppNotifs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Bell className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  No system notifications broadcasted yet. Push your first alert above.
                </div>
              ) : (
                <div className="divide-y divide-border/40 space-y-2">
                  {inAppNotifs.slice(0, 6).map((n) => (
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

                      {/* Engagement Metrics & Timestamp */}
                      <div className="text-right space-y-1 whitespace-nowrap">
                        <span className="text-[11px] text-muted-foreground block">
                          {new Date(n.created_at).toLocaleDateString("en-QA", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] font-semibold text-muted-foreground justify-end">
                          <span className="flex items-center gap-0.5 text-emerald-600" title="User Views / Reads">
                            <Users className="h-3 w-3" /> {n.engagement_count || 0} views
                          </span>
                          <span className="flex items-center gap-0.5 text-indigo-600" title="CTA Button Clicks">
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
        </TabsContent>

        {/* ── 2. IDENTITY TAB (View Mode with Modal Edit) ────────────────────────── */}
        <TabsContent value="branding" className="space-y-6">
          <Card className="border border-border/80 shadow-sm bg-card">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold">Corporate Identity & Entity Details</CardTitle>
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold">Legal & Display</Badge>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                      Official branding, tax, and commercial registration details reflected across contracts and invoices
                    </CardDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setEditModalSection("branding")}
                  className="gap-2 text-xs font-semibold h-9 shadow-sm"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit Identity
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <DisplayField label="Platform Brand Name" value={identity.platformName} />
                <DisplayField label="Legal Company Name (Entity)" value={identity.companyName} />
                <DisplayField label="Official Support Email" value={identity.supportEmail} />
                <DisplayField label="Official Support Phone" value={identity.supportPhone} />
                <DisplayField label="Commercial Registration No (CR)" value={identity.commercialRegistrationNo} />
                <DisplayField label="Tax Identification Number (TIN)" value={identity.taxRegistrationNo} />
                <div className="md:col-span-2">
                  <DisplayField label="Platform Header Tagline" value={identity.tagline} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 3. REGIONAL (QA) TAB (View Mode with Modal Edit) ─────────────────── */}
        <TabsContent value="localization" className="space-y-6">
          <Card className="border border-border/80 shadow-sm bg-card">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                    <Languages className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold">Regional Standards & Fiscal Rules (Qatar / GCC)</CardTitle>
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] uppercase font-bold">Qatar Standard</Badge>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                      Enforces currency codes, timezone calculations, and date formatting for financial postings
                    </CardDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setEditModalSection("localization")}
                  className="gap-2 text-xs font-semibold h-9 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit Regional Settings
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <DisplayField label="Default Timezone" value={`${localization.defaultTimezone || "Asia/Qatar"} (UTC+3)`} />
                <DisplayField label="Default Currency" value={`${localization.defaultCurrency || "QAR"} (${localization.currencySymbol || "QR"})`} />
                <DisplayField label="Date Format Standard" value={localization.dateFormat || "DD/MM/YYYY"} />
                <DisplayField label="Fiscal Year Start Month" value={localization.fiscalYearStartMonth === 1 ? "January (Calendar Year)" : `Month ${localization.fiscalYearStartMonth}`} />
                <DisplayField label="Locale Number Format" value={localization.numberFormat || "en-QA"} />
                <DisplayField label="Active Status" value="Enforced Platform-Wide" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 4. AUTOMATIONS TAB (Individual Modals, Turn On/Off Provision & + Add Automation) ──── */}
        <TabsContent value="engines" className="space-y-6">
          <Card className="border border-border/80 shadow-sm bg-card">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold">Automated Engine Execution & Business Rules</CardTitle>
                      <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[10px] uppercase font-bold">
                        {4 + (engines.customAutomations?.length || 0)} Total Engines
                      </Badge>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                      Manage automated background processes, turn rules on/off, calibrate execution schedules, and add custom cron jobs
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setEditModalSection("engine_custom")}
                    className="gap-1.5 text-xs font-semibold h-9 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add New Automation
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* 1. Daily PDC Clearing Engine */}
                <div className={`p-4 rounded-xl border transition-all space-y-3 ${
                  engines.pdcClearingEnabled !== false ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/60 bg-muted/20 opacity-75"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-600" />
                      <h4 className="text-sm font-bold text-foreground">Daily PDC Clearing Engine</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={engines.pdcClearingEnabled !== false ? "bg-emerald-500/15 text-emerald-600 text-[10px]" : "bg-muted text-muted-foreground text-[10px]"}>
                        {engines.pdcClearingEnabled !== false ? "ENABLED" : "OFF / DISABLED"}
                      </Badge>
                      <input
                        type="checkbox"
                        checked={engines.pdcClearingEnabled !== false}
                        onChange={() => handleToggleEngine("pdcClearingEnabled", engines.pdcClearingEnabled !== false)}
                        className="h-4 w-4 rounded text-emerald-600 cursor-pointer"
                        title="Toggle PDC Clearing Engine On/Off"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Evaluates deposited cheques daily and marks matured PDCs as Cleared, generating double-entry journal vouchers automatically.
                  </p>
                  <div className="flex items-center justify-between pt-2 text-xs border-t border-border/40">
                    <span className="text-muted-foreground font-medium">Timing: <span className="text-foreground font-bold">{engines.pdcClearingTimeQatar || "00:05 AST"}</span></span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditModalSection("engine_pdc")}
                      className="h-7 px-2.5 text-xs font-semibold gap-1 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10"
                    >
                      <Sliders className="h-3 w-3" /> Edit Engine
                    </Button>
                  </div>
                </div>

                {/* 2. Recurring Rent Billing Engine */}
                <div className={`p-4 rounded-xl border transition-all space-y-3 ${
                  engines.recurringBillingEnabled !== false ? "border-indigo-500/40 bg-indigo-500/5" : "border-border/60 bg-muted/20 opacity-75"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-indigo-500" />
                      <h4 className="text-sm font-bold text-foreground">Recurring Rent Billing Engine</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={engines.recurringBillingEnabled !== false ? "bg-indigo-500/15 text-indigo-600 text-[10px]" : "bg-muted text-muted-foreground text-[10px]"}>
                        {engines.recurringBillingEnabled !== false ? "ENABLED" : "OFF / DISABLED"}
                      </Badge>
                      <input
                        type="checkbox"
                        checked={engines.recurringBillingEnabled !== false}
                        onChange={() => handleToggleEngine("recurringBillingEnabled", engines.recurringBillingEnabled !== false)}
                        className="h-4 w-4 rounded text-indigo-600 cursor-pointer"
                        title="Toggle Rent Billing Engine On/Off"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Automatically generates monthly rent tax invoices for all active lease contracts across all registered properties and units.
                  </p>
                  <div className="flex items-center justify-between pt-2 text-xs border-t border-border/40">
                    <span className="text-muted-foreground font-medium">Timing: <span className="text-foreground font-bold">{engines.recurringBillingTimeQatar || "00:15 AST (1st of month)"}</span></span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditModalSection("engine_rent")}
                      className="h-7 px-2.5 text-xs font-semibold gap-1 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10"
                    >
                      <Sliders className="h-3 w-3" /> Edit Engine
                    </Button>
                  </div>
                </div>

                {/* 3. Fixed Asset Depreciation Engine */}
                <div className={`p-4 rounded-xl border transition-all space-y-3 ${
                  engines.assetDepreciationEnabled !== false ? "border-violet-500/40 bg-violet-500/5" : "border-border/60 bg-muted/20 opacity-75"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-violet-500" />
                      <h4 className="text-sm font-bold text-foreground">Fixed Asset Depreciation Engine</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={engines.assetDepreciationEnabled !== false ? "bg-violet-500/15 text-violet-600 text-[10px]" : "bg-muted text-muted-foreground text-[10px]"}>
                        {engines.assetDepreciationEnabled !== false ? "ENABLED" : "OFF / DISABLED"}
                      </Badge>
                      <input
                        type="checkbox"
                        checked={engines.assetDepreciationEnabled !== false}
                        onChange={() => handleToggleEngine("assetDepreciationEnabled", engines.assetDepreciationEnabled !== false)}
                        className="h-4 w-4 rounded text-violet-600 cursor-pointer"
                        title="Toggle Asset Depreciation Engine On/Off"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Straight-Line monthly asset depreciation posted directly to General Ledger accounts (`fin_vouchers`) at close of month.
                  </p>
                  <div className="flex items-center justify-between pt-2 text-xs border-t border-border/40">
                    <span className="text-muted-foreground font-medium">Timing: <span className="text-foreground font-bold">{engines.assetDepreciationTimeQatar || "00:30 AST (1st of month)"}</span></span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditModalSection("engine_depreciation")}
                      className="h-7 px-2.5 text-xs font-semibold gap-1 text-violet-700 dark:text-violet-300 border-violet-500/30 hover:bg-violet-500/10"
                    >
                      <Sliders className="h-3 w-3" /> Edit Engine
                    </Button>
                  </div>
                </div>

                {/* 4. Lease Grace & Penalty Parameters */}
                <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-amber-500" />
                      <h4 className="text-sm font-bold text-foreground">Lease Penalty & Grace Parameters</h4>
                    </div>
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px]">ACTIVE POLICY</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                    <div className="p-2 rounded-lg bg-background border border-border/40">
                      <p className="text-[10px] text-muted-foreground">Grace</p>
                      <p className="text-sm font-bold text-foreground">{engines.gracePeriodDays ?? 5} Days</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background border border-border/40">
                      <p className="text-[10px] text-muted-foreground">Late Fee</p>
                      <p className="text-sm font-bold text-foreground">{engines.latePenaltyPercentage ?? 2.5}%</p>
                    </div>
                    <div className="p-2 rounded-lg bg-background border border-border/40">
                      <p className="text-[10px] text-muted-foreground">Renewal</p>
                      <p className="text-sm font-bold text-foreground">{engines.leaseExpiryNoticeDays ?? 60} Days</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 text-xs border-t border-border/40">
                    <span className="text-muted-foreground">Applies to All Tenancies</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditModalSection("engine_penalty")}
                      className="h-7 px-2.5 text-xs font-semibold gap-1 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/10"
                    >
                      <Sliders className="h-3 w-3" /> Edit Parameters
                    </Button>
                  </div>
                </div>

                {/* Custom Automations List */}
                {engines.customAutomations && engines.customAutomations.map((item) => (
                  <div key={item.id} className={`p-4 rounded-xl border transition-all space-y-3 ${
                    item.enabled ? "border-primary/40 bg-primary/5" : "border-border/60 bg-muted/20 opacity-75"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <h4 className="text-sm font-bold text-foreground">{item.name}</h4>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={item.enabled ? "bg-primary/15 text-primary text-[10px]" : "bg-muted text-muted-foreground text-[10px]"}>
                          {item.enabled ? "ENABLED" : "OFF"}
                        </Badge>
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => handleToggleCustomEngine(item.id)}
                          className="h-4 w-4 rounded text-primary cursor-pointer"
                          title="Toggle Custom Automation On/Off"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-between pt-2 text-xs border-t border-border/40">
                      <span className="text-muted-foreground font-medium">Module: <span className="text-foreground font-bold">{item.targetModule}</span></span>
                      <span className="text-muted-foreground font-medium">Timing: <span className="text-foreground font-bold">{item.executionTimeQatar}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>



        {/* ── 6. SECURITY TAB (View Mode with Modal Edit) ──────────────────────── */}
        <TabsContent value="security" className="space-y-6">
          <Card className="border border-border/80 shadow-sm bg-card">
            <CardHeader className="pb-4 border-b border-border/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold">Zero-Trust Security Policies & Access Controls</CardTitle>
                      <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] uppercase font-bold">Zero-Trust</Badge>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">
                      Multi-Factor authentication, rate limits, session timeout, and third-party gateway configurations
                    </CardDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => setEditModalSection("security")}
                  className="gap-2 text-xs font-semibold h-9 shadow-sm bg-rose-600 hover:bg-rose-700 text-white"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit Security Policies
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4 text-rose-500" /> Platform Security Rules
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Enforce 2FA (Super Admin):</span>
                      <span className="font-bold text-emerald-600">{security.enforce2FASuperAdmin ? "Enforced" : "Disabled"}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Enforce 2FA (Internal Staff):</span>
                      <span className="font-bold text-foreground">{security.enforce2FAStaff ? "Enforced" : "Optional"}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">API Rate Limiting:</span>
                      <span className="font-bold text-foreground">{security.apiRateLimitPerMinute || 60} req/min</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/40">
                      <span className="text-muted-foreground">Session Inactivity Timeout:</span>
                      <span className="font-bold text-foreground">{security.sessionTimeoutMinutes || 480} minutes</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Security Audit Trail:</span>
                      <span className="font-bold text-emerald-600">Active (PostgreSQL Immutable Table)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3">
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Key className="h-4 w-4 text-primary" /> Third-Party Integrations Status
                  </h4>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-background">
                      <div>
                        <p className="text-xs font-semibold">QPay Gateway (Qatar NAPS)</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{integrations.qpayMerchantId || "QPAY-MCH-98214"}</p>
                      </div>
                      <Badge className={integrations.qpayEnabled ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}>
                        {integrations.qpayEnabled ? "Connected" : "Disabled"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-background">
                      <div>
                        <p className="text-xs font-semibold">SendGrid Email Gateway</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{integrations.sendgridSenderEmail || "noreply@zyno.qa"}</p>
                      </div>
                      <Badge className={integrations.sendgridConfigured ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground"}>
                        {integrations.sendgridConfigured ? "Connected" : "Disabled"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-background">
                      <div>
                        <p className="text-xs font-semibold">Supabase Storage Buckets</p>
                        <p className="text-[11px] text-muted-foreground font-mono">property-images, receipts, leases</p>
                      </div>
                      <Badge className="bg-emerald-500/15 text-emerald-600">Active (4 Buckets)</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>



      {/* ── DEDICATED EDIT MODALS ─────────────────────────────────────────── */}

      {/* 1. Edit Regional & Fiscal Standards Modal */}
      <Dialog open={editModalSection === "localization"} onOpenChange={(open) => !open && setEditModalSection(null)}>
        <DialogContent className="sm:max-w-[580px] border border-primary/30 shadow-2xl bg-card">
          <DialogHeader className="space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/25">
              <Languages className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Edit Regional Standards (Qatar / GCC)</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify currency standards, timezone calculation baselines, and fiscal reporting dates.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Timezone Standard</Label>
              <select
                value={localization.defaultTimezone || "Asia/Qatar"}
                onChange={(e) => setLocalization({ ...localization, defaultTimezone: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Asia/Qatar">Asia/Qatar (AST +3 — Default)</option>
                <option value="Asia/Riyadh">Asia/Riyadh (AST +3)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST +4)</option>
                <option value="UTC">UTC (Universal Time)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Currency Code</Label>
              <select
                value={localization.defaultCurrency || "QAR"}
                onChange={(e) => {
                  const sym = e.target.value === "QAR" ? "QR" : e.target.value === "SAR" ? "SR" : e.target.value === "AED" ? "AED" : "$";
                  setLocalization({ ...localization, defaultCurrency: e.target.value, currencySymbol: sym });
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="QAR">QAR — Qatari Riyal (Recommended)</option>
                <option value="SAR">SAR — Saudi Riyal</option>
                <option value="AED">AED — UAE Dirham</option>
                <option value="USD">USD — US Dollar</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Currency Symbol</Label>
              <Input
                value={localization.currencySymbol || "QR"}
                onChange={(e) => setLocalization({ ...localization, currencySymbol: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Date Format</Label>
              <select
                value={localization.dateFormat || "DD/MM/YYYY"}
                onChange={(e) => setLocalization({ ...localization, dateFormat: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (Qatar / UK)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Fiscal Year Start Month</Label>
              <select
                value={localization.fiscalYearStartMonth || 1}
                onChange={(e) => setLocalization({ ...localization, fiscalYearStartMonth: Number(e.target.value) })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={1}>January (Calendar Year)</option>
                <option value={4}>April (Q2 Fiscal)</option>
                <option value={7}>July (Mid-Year)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Locale Number Format</Label>
              <Input
                value={localization.numberFormat || "en-QA"}
                onChange={(e) => setLocalization({ ...localization, numberFormat: e.target.value })}
                placeholder="en-QA"
              />
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button variant="outline" onClick={() => setEditModalSection(null)} className="text-xs">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await handleSave("localization", "Localization Standards", localization);
                setEditModalSection(null);
              }}
              disabled={savingSection === "localization"}
              className="bg-primary text-white text-xs font-semibold gap-2"
            >
              {savingSection === "localization" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Regional Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2a. Edit Daily PDC Clearing Engine Modal */}
      <Dialog open={editModalSection === "engine_pdc"} onOpenChange={(open) => !open && setEditModalSection(null)}>
        <DialogContent className="sm:max-w-[540px] border border-emerald-500/30 shadow-2xl bg-card">
          <DialogHeader className="space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25">
              <Clock className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Configure Daily PDC Clearing Engine</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define execution schedule and active state for the automated cheque clearing cron.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20">
              <div>
                <p className="text-xs font-semibold text-foreground">Engine Active Status</p>
                <p className="text-[11px] text-muted-foreground">Enables nightly evaluation of matured cheques in General Ledger</p>
              </div>
              <input
                type="checkbox"
                checked={engines.pdcClearingEnabled !== false}
                onChange={(e) => setEngines({ ...engines, pdcClearingEnabled: e.target.checked })}
                className="h-4 w-4 rounded text-emerald-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nightly Execution Time (Qatar AST)</Label>
              <select
                value={engines.pdcClearingTimeQatar || "00:05 AST"}
                onChange={(e) => setEngines({ ...engines, pdcClearingTimeQatar: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="00:05 AST">00:05 AST (5 min past midnight — Recommended)</option>
                <option value="00:15 AST">00:15 AST</option>
                <option value="01:00 AST">01:00 AST (1:00 AM)</option>
                <option value="06:00 AST">06:00 AST (6:00 AM Morning)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button variant="outline" onClick={() => setEditModalSection(null)} className="text-xs">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await handleSave("engine_automations", "PDC Clearing Engine", engines);
                setEditModalSection(null);
              }}
              disabled={savingSection === "engine_automations"}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-2"
            >
              {savingSection === "engine_automations" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save PDC Engine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2b. Edit Recurring Rent Billing Engine Modal */}
      <Dialog open={editModalSection === "engine_rent"} onOpenChange={(open) => !open && setEditModalSection(null)}>
        <DialogContent className="sm:max-w-[540px] border border-indigo-500/30 shadow-2xl bg-card">
          <DialogHeader className="space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Clock className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Configure Rent Invoicing Engine</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define monthly recurring rent billing timing and enabled state for all tenant lease contracts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20">
              <div>
                <p className="text-xs font-semibold text-foreground">Engine Active Status</p>
                <p className="text-[11px] text-muted-foreground">Enables automated monthly invoice generation for active leases</p>
              </div>
              <input
                type="checkbox"
                checked={engines.recurringBillingEnabled !== false}
                onChange={(e) => setEngines({ ...engines, recurringBillingEnabled: e.target.checked })}
                className="h-4 w-4 rounded text-indigo-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Recurring Invoicing Schedule (Qatar AST)</Label>
              <select
                value={engines.recurringBillingTimeQatar || "00:15 AST (1st of month)"}
                onChange={(e) => setEngines({ ...engines, recurringBillingTimeQatar: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="00:15 AST (1st of month)">1st of every month at 00:15 AST (Standard)</option>
                <option value="01:00 AST (1st of month)">1st of every month at 01:00 AST</option>
                <option value="25th of month (Advance)">25th of preceding month (Advance Billing)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button variant="outline" onClick={() => setEditModalSection(null)} className="text-xs">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await handleSave("engine_automations", "Recurring Rent Invoicing Engine", engines);
                setEditModalSection(null);
              }}
              disabled={savingSection === "engine_automations"}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-2"
            >
              {savingSection === "engine_automations" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Rent Engine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2c. Edit Fixed Asset Depreciation Engine Modal */}
      <Dialog open={editModalSection === "engine_depreciation"} onOpenChange={(open) => !open && setEditModalSection(null)}>
        <DialogContent className="sm:max-w-[540px] border border-violet-500/30 shadow-2xl bg-card">
          <DialogHeader className="space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/25">
              <Clock className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Configure Asset Depreciation Engine</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define monthly straight-line depreciation journal posting timing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20">
              <div>
                <p className="text-xs font-semibold text-foreground">Engine Active Status</p>
                <p className="text-[11px] text-muted-foreground">Enables automated monthly depreciation journal postings to General Ledger</p>
              </div>
              <input
                type="checkbox"
                checked={engines.assetDepreciationEnabled !== false}
                onChange={(e) => setEngines({ ...engines, assetDepreciationEnabled: e.target.checked })}
                className="h-4 w-4 rounded text-violet-600 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Depreciation Posting Timing (Qatar AST)</Label>
              <select
                value={engines.assetDepreciationTimeQatar || "00:30 AST (1st of month)"}
                onChange={(e) => setEngines({ ...engines, assetDepreciationTimeQatar: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="00:30 AST (1st of month)">1st of every month at 00:30 AST (Standard)</option>
                <option value="Last day of month 23:59 AST">Last day of month at 23:59 AST (Month-End Close)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button variant="outline" onClick={() => setEditModalSection(null)} className="text-xs">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await handleSave("engine_automations", "Asset Depreciation Engine", engines);
                setEditModalSection(null);
              }}
              disabled={savingSection === "engine_automations"}
              className="bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold gap-2"
            >
              {savingSection === "engine_automations" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Depreciation Engine
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2d. Edit Lease Grace & Penalty Parameters Modal */}
      <Dialog open={editModalSection === "engine_penalty"} onOpenChange={(open) => !open && setEditModalSection(null)}>
        <DialogContent className="sm:max-w-[540px] border border-amber-500/30 shadow-2xl bg-card">
          <DialogHeader className="space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25">
              <Sliders className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Configure Lease Penalty & Grace Parameters</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Adjust grace period days, late payment penalty surcharge %, and advance lease expiration notices.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Grace Period (Days)</Label>
                <Input
                  type="number"
                  value={engines.gracePeriodDays ?? 5}
                  onChange={(e) => setEngines({ ...engines, gracePeriodDays: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Late Penalty (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={engines.latePenaltyPercentage ?? 2.5}
                  onChange={(e) => setEngines({ ...engines, latePenaltyPercentage: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Renewal Notice (Days)</Label>
                <Input
                  type="number"
                  value={engines.leaseExpiryNoticeDays ?? 60}
                  onChange={(e) => setEngines({ ...engines, leaseExpiryNoticeDays: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button variant="outline" onClick={() => setEditModalSection(null)} className="text-xs">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await handleSave("engine_automations", "Lease Penalty & Grace Parameters", engines);
                setEditModalSection(null);
              }}
              disabled={savingSection === "engine_automations"}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold gap-2"
            >
              {savingSection === "engine_automations" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Parameters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2e. Add New Custom Automation Modal */}
      <Dialog open={editModalSection === "engine_custom"} onOpenChange={(open) => !open && setEditModalSection(null)}>
        <DialogContent className="sm:max-w-[580px] border border-indigo-500/30 shadow-2xl bg-card">
          <DialogHeader className="space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Plus className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Add New Automation Rule</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define a new automated background task, execution time, and target operational module.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCustomAutomation}>
            <div className="space-y-4 py-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Automation Name</Label>
                <Input
                  value={newAutomationForm.name}
                  onChange={(e) => setNewAutomationForm({ ...newAutomationForm, name: e.target.value })}
                  placeholder="e.g. Utility Charge Reconciliation Engine"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Description</Label>
                <Textarea
                  rows={3}
                  value={newAutomationForm.description}
                  onChange={(e) => setNewAutomationForm({ ...newAutomationForm, description: e.target.value })}
                  placeholder="Explain the background operation performed by this automation..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Target Module</Label>
                  <select
                    value={newAutomationForm.targetModule}
                    onChange={(e) => setNewAutomationForm({ ...newAutomationForm, targetModule: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Core Finance & Ledger">Core Finance & Ledger</option>
                    <option value="Lease Contracts & Renewals">Lease Contracts & Renewals</option>
                    <option value="Maintenance & Work Orders">Maintenance & Work Orders</option>
                    <option value="Tenant Invoicing & Collection">Tenant Invoicing & Collection</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Frequency</Label>
                  <select
                    value={newAutomationForm.frequency}
                    onChange={(e) => setNewAutomationForm({ ...newAutomationForm, frequency: e.target.value as any })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="daily">Daily (Qatar Midnight AST)</option>
                    <option value="monthly">Monthly (1st of Month)</option>
                    <option value="weekly">Weekly (Every Sunday)</option>
                    <option value="custom">Custom Timing</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Execution Timing (AST)</Label>
                <select
                  value={newAutomationForm.executionTimeQatar}
                  onChange={(e) => setNewAutomationForm({ ...newAutomationForm, executionTimeQatar: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="00:00 AST">00:00 AST (Midnight)</option>
                  <option value="00:45 AST">00:45 AST</option>
                  <option value="01:30 AST">01:30 AST</option>
                  <option value="06:00 AST">06:00 AST (Morning)</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="outline" onClick={() => setEditModalSection(null)} className="text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={savingSection === "engine_automations"}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-2"
              >
                {savingSection === "engine_automations" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Create Automation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 3. Edit Security Tier Modal */}
      <Dialog open={editModalSection === "security"} onOpenChange={(open) => !open && setEditModalSection(null)}>
        <DialogContent className="sm:max-w-[580px] border border-rose-500/30 shadow-2xl bg-card">
          <DialogHeader className="space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/25">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Edit Zero-Trust Security Policies</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure 2FA mandates, rate limits, session timeouts, and immutable logging rules.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/20">
                <div>
                  <p className="text-xs font-semibold">Enforce 2FA for Super Admins</p>
                  <p className="text-[11px] text-muted-foreground">Requires mandatory OTP / Authenticator App</p>
                </div>
                <input
                  type="checkbox"
                  checked={security.enforce2FASuperAdmin ?? true}
                  onChange={(e) => setSecurity({ ...security, enforce2FASuperAdmin: e.target.checked })}
                  className="h-4 w-4 rounded text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/20">
                <div>
                  <p className="text-xs font-semibold">Enforce 2FA for Property Managers & Finance</p>
                  <p className="text-[11px] text-muted-foreground">Mandatory OTP for staff roles</p>
                </div>
                <input
                  type="checkbox"
                  checked={security.enforce2FAStaff ?? false}
                  onChange={(e) => setSecurity({ ...security, enforce2FAStaff: e.target.checked })}
                  className="h-4 w-4 rounded text-primary focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/20">
                <div>
                  <p className="text-xs font-semibold">Strict XSS & SQLi Sanitization Guard</p>
                  <p className="text-[11px] text-muted-foreground">Sanitizes all payload mutations automatically</p>
                </div>
                <input
                  type="checkbox"
                  checked={security.strictXSSSanitization ?? true}
                  onChange={(e) => setSecurity({ ...security, strictXSSSanitization: e.target.checked })}
                  className="h-4 w-4 rounded text-primary focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">API Rate Limit (Req / Min)</Label>
                <Input
                  type="number"
                  value={security.apiRateLimitPerMinute ?? 60}
                  onChange={(e) => setSecurity({ ...security, apiRateLimitPerMinute: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Session Timeout (Minutes)</Label>
                <Input
                  type="number"
                  value={security.sessionTimeoutMinutes ?? 480}
                  onChange={(e) => setSecurity({ ...security, sessionTimeoutMinutes: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button variant="outline" onClick={() => setEditModalSection(null)} className="text-xs">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await handleSave("security_policies", "Security Policies", security);
                setEditModalSection(null);
              }}
              disabled={savingSection === "security_policies"}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold gap-2"
            >
              {savingSection === "security_policies" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Security Policies
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 4. Edit Corporate Branding & Identity Modal */}
      <Dialog open={editModalSection === "branding"} onOpenChange={(open) => !open && setEditModalSection(null)}>
        <DialogContent className="sm:max-w-[620px] border border-primary/30 shadow-2xl bg-card">
          <DialogHeader className="space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/25">
              <Globe className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">Edit Corporate Identity & Branding</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update legal entity details, official tax numbers, and contact information.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-3 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Brand Name</Label>
              <Input
                value={identity.platformName || ""}
                onChange={(e) => setIdentity({ ...identity, platformName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Legal Company Name</Label>
              <Input
                value={identity.companyName || ""}
                onChange={(e) => setIdentity({ ...identity, companyName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Official Support Email</Label>
              <Input
                type="email"
                value={identity.supportEmail || ""}
                onChange={(e) => setIdentity({ ...identity, supportEmail: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Official Support Phone</Label>
              <Input
                value={identity.supportPhone || ""}
                onChange={(e) => setIdentity({ ...identity, supportPhone: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">CR Registration Number</Label>
              <Input
                value={identity.commercialRegistrationNo || ""}
                onChange={(e) => setIdentity({ ...identity, commercialRegistrationNo: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">TIN Tax Number</Label>
              <Input
                value={identity.taxRegistrationNo || ""}
                onChange={(e) => setIdentity({ ...identity, taxRegistrationNo: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs font-semibold">Platform Header Tagline</Label>
              <Input
                value={identity.tagline || ""}
                onChange={(e) => setIdentity({ ...identity, tagline: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button variant="outline" onClick={() => setEditModalSection(null)} className="text-xs">
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await handleSave("platform_identity", "Platform Identity", identity);
                setEditModalSection(null);
              }}
              disabled={savingSection === "platform_identity"}
              className="bg-primary text-white text-xs font-semibold gap-2"
            >
              {savingSection === "platform_identity" ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              Save Identity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── SAVE CELEBRATION MODAL ────────────────────────────────────────── */}
      <Dialog open={!!savedSuccessModal} onOpenChange={() => setSavedSuccessModal(null)}>
        <DialogContent className="sm:max-w-[440px] text-center border border-emerald-500/30 bg-card p-6 shadow-2xl">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 mx-auto mb-3 shadow-lg shadow-emerald-500/15">
            <CheckCheck className="h-8 w-8" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">{savedSuccessModal?.title}</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-2 leading-relaxed">
            {savedSuccessModal?.desc}
          </DialogDescription>
          <div className="pt-5">
            <Button
              onClick={() => setSavedSuccessModal(null)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md"
            >
              Continue Working
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
