import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  CreditCard, CheckCircle2, TrendingUp, Wallet, AlertTriangle,
  Building2, Plus, Download, RefreshCw, Sparkles, Receipt,
  Check, ArrowRight, Eye, ShieldCheck, DollarSign, Calendar,
  Layers, Lock, Sliders, Trash2, Edit, Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { RBAC_MODULES } from "@/lib/rbac";
import { logSecurityEvent } from "@/lib/security";
import { toast } from "sonner";

export const Route = createFileRoute("/super-admin/billing")({
  head: () => ({ meta: [{ title: "Subscription Plans & Pricing — ZYNO Super Admin" }] }),
  component: BillingPage,
});

export interface SubscriptionPlan {
  id: string;
  plan_code: string;
  name: string;
  description: string;
  price_monthly_qar: number;
  price_annual_qar: number;
  currency: string;
  max_properties: number;
  max_units: number;
  max_staff_users: number;
  max_storage_gb: number;
  enabled_modules: string[];
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
}

export function BillingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTabBilling, setActiveTabBilling] = useState<"monthly" | "annual">("monthly");

  // Add / Edit Plan Modal State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Plan Form State
  const [planForm, setPlanForm] = useState({
    name: "",
    plan_code: "",
    description: "",
    price_monthly_qar: 999,
    price_annual_qar: 9990,
    max_properties: 30,
    max_units: 500,
    max_staff_users: 20,
    max_storage_gb: 50,
    enabled_modules: [
      "Property CRUD", "Unit Mgmt", "Lease Creation", "Payment Collection",
      "Receipt Generation", "Finance & GL", "Maintenance Tickets", "Reports & Analytics"
    ],
    is_featured: false,
  });

  // Success Confirmation Modal
  const [successModal, setSuccessModal] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("platform_subscription_plans")
        .select("*")
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        setPlans(data as SubscriptionPlan[]);
      } else {
        // Default Qatar plans if query returns empty
        setPlans([
          {
            id: "1",
            plan_code: "starter",
            name: "Starter Plan",
            description: "Designed for boutique landlords and independent single/multi-property operators.",
            price_monthly_qar: 299,
            price_annual_qar: 2990,
            currency: "QAR",
            max_properties: 10,
            max_units: 100,
            max_staff_users: 5,
            max_storage_gb: 10,
            enabled_modules: ["Property CRUD", "Unit Mgmt", "Lease Creation", "Payment Collection", "Receipt Generation", "Maintenance Tickets"],
            is_active: true,
            is_featured: false,
            display_order: 1,
          },
          {
            id: "2",
            plan_code: "professional",
            name: "Professional Plan",
            description: "For growing commercial & residential property management firms and agencies.",
            price_monthly_qar: 999,
            price_annual_qar: 9990,
            currency: "QAR",
            max_properties: 30,
            max_units: 500,
            max_staff_users: 20,
            max_storage_gb: 50,
            enabled_modules: ["Property CRUD", "Unit Mgmt", "Lease Creation", "Payment Collection", "Receipt Generation", "Finance & GL", "Asset Management", "Vendor Management", "Maintenance Tickets", "Reports & Analytics"],
            is_active: true,
            is_featured: true,
            display_order: 2,
          },
          {
            id: "3",
            plan_code: "enterprise",
            name: "Enterprise Plan",
            description: "Full-scale corporate property chains, REITs, and institutional landlords with unlimited operations.",
            price_monthly_qar: 2499,
            price_annual_qar: 24990,
            currency: "QAR",
            max_properties: 100,
            max_units: 3000,
            max_staff_users: 100,
            max_storage_gb: 500,
            enabled_modules: [...RBAC_MODULES],
            is_active: true,
            is_featured: false,
            display_order: 3,
          },
        ]);
      }
    } catch (err: any) {
      toast.error("Failed to load plans: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function openCreatePlanModal() {
    setEditingPlanId(null);
    setPlanForm({
      name: "",
      plan_code: "",
      description: "",
      price_monthly_qar: 499,
      price_annual_qar: 4990,
      max_properties: 15,
      max_units: 200,
      max_staff_users: 10,
      max_storage_gb: 25,
      enabled_modules: [
        "Property CRUD", "Unit Mgmt", "Lease Creation", "Payment Collection",
        "Receipt Generation", "Finance & GL", "Maintenance Tickets"
      ],
      is_featured: false,
    });
    setShowPlanModal(true);
  }

  function openEditPlanModal(plan: SubscriptionPlan) {
    setEditingPlanId(plan.id);
    setPlanForm({
      name: plan.name,
      plan_code: plan.plan_code,
      description: plan.description || "",
      price_monthly_qar: Number(plan.price_monthly_qar),
      price_annual_qar: Number(plan.price_annual_qar),
      max_properties: plan.max_properties,
      max_units: plan.max_units,
      max_staff_users: plan.max_staff_users,
      max_storage_gb: plan.max_storage_gb,
      enabled_modules: [...plan.enabled_modules],
      is_featured: plan.is_featured,
    });
    setShowPlanModal(true);
  }

  function toggleModuleSelection(mod: string) {
    setPlanForm((prev) => {
      const exists = prev.enabled_modules.includes(mod);
      return {
        ...prev,
        enabled_modules: exists
          ? prev.enabled_modules.filter((m) => m !== mod)
          : [...prev.enabled_modules, mod],
      };
    });
  }

  function selectAllModules() {
    setPlanForm((prev) => ({
      ...prev,
      enabled_modules: [...RBAC_MODULES],
    }));
  }

  function clearAllModules() {
    setPlanForm((prev) => ({
      ...prev,
      enabled_modules: [],
    }));
  }

  async function handleSavePlan(e: React.FormEvent) {
    e.preventDefault();
    if (!planForm.name) {
      toast.error("Please enter a plan name.");
      return;
    }

    setSubmitting(true);
    const code = planForm.plan_code || planForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    try {
      if (editingPlanId) {
        // Update existing plan
        const { error } = await supabase
          .from("platform_subscription_plans")
          .update({
            name: planForm.name,
            plan_code: code,
            description: planForm.description,
            price_monthly_qar: planForm.price_monthly_qar,
            price_annual_qar: planForm.price_annual_qar,
            max_properties: planForm.max_properties,
            max_units: planForm.max_units,
            max_staff_users: planForm.max_staff_users,
            max_storage_gb: planForm.max_storage_gb,
            enabled_modules: planForm.enabled_modules,
            is_featured: planForm.is_featured,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingPlanId);

        if (error) throw error;

        await logSecurityEvent({
          event_type: "data_mutation",
          severity: "info",
          resource: `platform_subscription_plans/${code}`,
          action: "PLAN_UPDATED",
          details: { name: planForm.name, code },
        });

        toast.success(`Plan "${planForm.name}" updated successfully!`);
      } else {
        // Insert new plan
        const { error } = await supabase
          .from("platform_subscription_plans")
          .insert({
            name: planForm.name,
            plan_code: code,
            description: planForm.description,
            price_monthly_qar: planForm.price_monthly_qar,
            price_annual_qar: planForm.price_annual_qar,
            max_properties: planForm.max_properties,
            max_units: planForm.max_units,
            max_staff_users: planForm.max_staff_users,
            max_storage_gb: planForm.max_storage_gb,
            enabled_modules: planForm.enabled_modules,
            is_featured: planForm.is_featured,
            display_order: plans.length + 1,
            currency: "QAR",
            is_active: true,
            created_at: new Date().toISOString(),
          });

        if (error) throw error;

        await logSecurityEvent({
          event_type: "data_mutation",
          severity: "info",
          resource: `platform_subscription_plans/${code}`,
          action: "PLAN_CREATED",
          details: { name: planForm.name, code },
        });

        toast.success(`New Plan "${planForm.name}" created and published!`);
      }

      setShowPlanModal(false);
      loadPlans();
    } catch (err: any) {
      toast.error("Failed to save plan: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner with "Add Plan" Primary CTA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white border border-indigo-500/20 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-md">
              <CreditCard className="h-3.5 w-3.5 text-amber-300" />
              <span>Subscription & Feature Entitlements</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Subscription Plans & Tiers</h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Create, configure, and manage subscription pricing tiers with granular capacity limits and RBAC module permissions for tenant onboarding.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={openCreatePlanModal}
              className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white font-medium shadow-lg hover:shadow-indigo-500/25 transition-all gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Plan
            </Button>
          </div>
        </div>

        <div className="absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      </div>

      {/* Subscription Plans Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">Available Platform Plans</h2>
            <p className="text-xs text-muted-foreground">Active pricing tiers applied during organisation onboarding</p>
          </div>

          {/* Billing Cycle Switcher */}
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/60 self-start">
            <Button
              size="sm"
              variant={activeTabBilling === "monthly" ? "default" : "ghost"}
              onClick={() => setActiveTabBilling("monthly")}
              className="h-8 text-xs font-semibold px-3.5"
            >
              Monthly Billing
            </Button>
            <Button
              size="sm"
              variant={activeTabBilling === "annual" ? "default" : "ghost"}
              onClick={() => setActiveTabBilling("annual")}
              className="h-8 text-xs font-semibold px-3.5 gap-1.5"
            >
              Annual Billing <Badge className="bg-emerald-500 text-white text-[9px] py-0 px-1">Save 16%</Badge>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            Loading subscription plans...
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const price = activeTabBilling === "annual" ? plan.price_annual_qar : plan.price_monthly_qar;
              return (
                <Card
                  key={plan.id}
                  className={`border-2 ${
                    plan.is_featured
                      ? "border-primary shadow-lg ring-1 ring-primary/20 bg-card"
                      : "border-border/80 hover:border-slate-400 bg-card"
                  } relative transition-all duration-200 hover:shadow-lg flex flex-col justify-between`}
                >
                  {plan.is_featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-sm">
                      <Badge className="bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-3 py-0.5">
                        Featured Tier
                      </Badge>
                    </div>
                  )}

                  <div>
                    <CardHeader className="pb-3 pt-6">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold font-mono">
                          {plan.plan_code}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs mt-1 leading-relaxed">
                        {plan.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-5">
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/40">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-extrabold text-foreground">
                            {plan.currency || "QAR"} {Number(price).toLocaleString()}
                          </span>
                          <span className="text-muted-foreground text-xs font-medium">
                            {activeTabBilling === "annual" ? "/ year" : "/ month"}
                          </span>
                        </div>
                        {activeTabBilling === "annual" && (
                          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                            Equivalent to {plan.currency || "QAR"} {Math.round(Number(plan.price_annual_qar) / 12).toLocaleString()} / mo
                          </p>
                        )}
                      </div>

                      {/* Capacity Limits Grid */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase">Properties:</span>
                          <p className="font-bold text-foreground mt-0.5">{plan.max_properties} Max</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase">Units:</span>
                          <p className="font-bold text-foreground mt-0.5">{plan.max_units} Max</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase">Staff Seats:</span>
                          <p className="font-bold text-foreground mt-0.5">{plan.max_staff_users} Seats</p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/20 border border-border/40">
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase">Storage:</span>
                          <p className="font-bold text-foreground mt-0.5">{plan.max_storage_gb} GB Cloud</p>
                        </div>
                      </div>

                      {/* Enabled Modules Preview */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-foreground">Enabled Modules:</span>
                          <span className="text-[11px] text-primary font-bold">
                            {plan.enabled_modules?.length || 0} / {RBAC_MODULES.length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 rounded-lg bg-muted/15 border border-border/40">
                          {(plan.enabled_modules || []).map((m, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[10px] font-medium py-0">
                              <Check className="h-2.5 w-2.5 mr-1 text-emerald-500" />
                              {m}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-6 pt-0 border-t border-border/40 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => openEditPlanModal(plan)}
                      className="w-full text-xs font-semibold gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                    >
                      <Sliders className="h-3.5 w-3.5" /> Configure Plan & Permissions
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── CREATE / EDIT PLAN MODAL (With Module RBAC Permissions) ─────────── */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="sm:max-w-[680px] border border-primary/20 shadow-2xl bg-card p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white border-b border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-foreground">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white">
                  {editingPlanId ? "Configure Subscription Plan" : "Create New Subscription Plan"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300">
                  Set plan pricing, property/unit capacity thresholds, and granular RBAC module entitlements.
                </DialogDescription>
              </div>
            </div>
          </div>

          <form onSubmit={handleSavePlan} className="p-6 max-h-[72vh] overflow-y-auto space-y-5">
            {/* Basic Plan Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Plan Display Name <span className="text-red-500">*</span></Label>
                <Input
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                  placeholder="e.g. Growth Accelerator Plan"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Plan Code Identifier</Label>
                <Input
                  value={planForm.plan_code}
                  onChange={(e) => setPlanForm({ ...planForm, plan_code: e.target.value })}
                  placeholder="e.g. growth-accelerator"
                  className="font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-semibold">Plan Marketing Description</Label>
                <Textarea
                  rows={2}
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  placeholder="Brief description of the intended customer profile and value proposition..."
                />
              </div>
            </div>

            {/* Pricing Details */}
            <div className="grid gap-4 md:grid-cols-2 p-3.5 rounded-xl bg-muted/30 border border-border/60">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Monthly Price (QAR)</Label>
                <Input
                  type="number"
                  value={planForm.price_monthly_qar}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    setPlanForm({ ...planForm, price_monthly_qar: m, price_annual_qar: m * 10 });
                  }}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Annual Price (QAR — 10x monthly)</Label>
                <Input
                  type="number"
                  value={planForm.price_annual_qar}
                  onChange={(e) => setPlanForm({ ...planForm, price_annual_qar: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            {/* Capacity Threshold Limits */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Capacity Threshold Limits</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Max Properties</Label>
                  <Input
                    type="number"
                    value={planForm.max_properties}
                    onChange={(e) => setPlanForm({ ...planForm, max_properties: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Max Units</Label>
                  <Input
                    type="number"
                    value={planForm.max_units}
                    onChange={(e) => setPlanForm({ ...planForm, max_units: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Staff Seats</Label>
                  <Input
                    type="number"
                    value={planForm.max_staff_users}
                    onChange={(e) => setPlanForm({ ...planForm, max_staff_users: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Storage (GB)</Label>
                  <Input
                    type="number"
                    value={planForm.max_storage_gb}
                    onChange={(e) => setPlanForm({ ...planForm, max_storage_gb: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>

            {/* Granular Feature / RBAC Module Entitlements */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-semibold">
                    Feature & Module Entitlements ({planForm.enabled_modules.length} Enabled)
                  </Label>
                  <p className="text-[11px] text-muted-foreground">Subscribed tenants on this plan will only have access to selected modules.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllModules}
                    className="text-[11px] text-primary hover:underline font-semibold"
                  >
                    Select All
                  </button>
                  <span className="text-muted-foreground text-xs">•</span>
                  <button
                    type="button"
                    onClick={clearAllModules}
                    className="text-[11px] text-muted-foreground hover:underline"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {RBAC_MODULES.map((mod) => {
                  const enabled = planForm.enabled_modules.includes(mod);
                  return (
                    <button
                      key={mod}
                      type="button"
                      onClick={() => toggleModuleSelection(mod)}
                      className={`p-2 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                        enabled
                          ? "border-primary/40 bg-primary/10 text-foreground font-semibold shadow-xs"
                          : "border-border/40 text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <span className="truncate">{mod}</span>
                      {enabled && <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/60">
              <div>
                <p className="text-xs font-semibold text-foreground">Featured Highlight Tier</p>
                <p className="text-[11px] text-muted-foreground">Display with a &quot;Featured&quot; badge and prominent border</p>
              </div>
              <input
                type="checkbox"
                checked={planForm.is_featured}
                onChange={(e) => setPlanForm({ ...planForm, is_featured: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>

            <DialogFooter className="pt-4 border-t border-border/60 gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowPlanModal(false)} className="text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={submitting}
                className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white gap-1.5 text-xs font-semibold shadow-md"
              >
                {submitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                {editingPlanId ? "Save Changes" : "Create & Publish Plan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
