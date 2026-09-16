import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  Building2, Plus, Search, MoreHorizontal, CheckCircle2,
  XCircle, Clock, Mail, Phone, Users, Edit, Trash2, Eye,
  ShieldCheck, Sparkles, ArrowRight, ArrowLeft, Key,
  Check, Lock, Globe, Server, Layers, HelpCircle,
  Copy, CheckCheck, RefreshCw, Send, AlertTriangle,
  CreditCard, Banknote, Receipt, DollarSign, Wallet,
  Calendar, Percent, Shield, FileCheck, Tag, Landmark,
  Download, PackageOpen, Database
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { logSecurityEvent } from "@/lib/security";
import { startImpersonation } from "@/lib/impersonation";
import { createBroadcastNotification } from "@/lib/system-config";
import { RBAC_MODULES } from "@/lib/rbac";
import { toast } from "sonner";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

export const Route = createFileRoute("/super-admin/tenants")({
  head: () => ({ meta: [{ title: "Tenant Organisations Onboarding & Governance — ZYNO Super Admin" }] }),
  component: TenantsPage,
});

export interface TenantOrg {
  id: string;
  tenant_key: string;
  name: string;
  legal_entity_name?: string;
  commercial_reg_no?: string;
  tax_id_no?: string;
  industry_type?: string;
  country: string;
  city: string;
  address_line?: string;
  primary_phone?: string;
  primary_email: string;
  admin_name: string;
  admin_email: string;
  admin_user_id?: string;
  plan: "Starter" | "Professional" | "Enterprise" | "Custom";
  billing_cycle: "monthly" | "annual";
  status: "Active" | "Suspended" | "Trial" | "Cancelled";
  max_properties: number;
  max_units: number;
  max_staff_users: number;
  max_storage_gb: number;
  enabled_modules: string[];
  custom_subdomain?: string;
  created_at: string;
  propertyCount?: number;
  // Payment details
  subscription_amount?: number;
  currency?: string;
  payment_method?: string;
  payment_status?: string;
  transaction_ref?: string;
  total_paid?: number;
}

const PLAN_PRESETS = {
  Starter: {
    price_monthly: 299,
    price_annual: 2990,
    max_properties: 10,
    max_units: 100,
    max_staff_users: 5,
    max_storage_gb: 10,
    badge: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/20",
    modules: ["Property CRUD", "Unit Mgmt", "Lease Creation", "Payment Collection", "Receipt Generation", "Maintenance Tickets"],
  },
  Professional: {
    price_monthly: 999,
    price_annual: 9990,
    max_properties: 30,
    max_units: 500,
    max_staff_users: 20,
    max_storage_gb: 50,
    badge: "bg-blue-500/15 text-blue-600 border-blue-500/20",
    modules: ["Property CRUD", "Unit Mgmt", "Lease Creation", "Payment Collection", "Receipt Generation", "Finance & GL", "Asset Management", "Vendor Management", "Maintenance Tickets", "Reports & Analytics"],
  },
  Enterprise: {
    price_monthly: 2499,
    price_annual: 24990,
    max_properties: 100,
    max_units: 3000,
    max_staff_users: 100,
    max_storage_gb: 500,
    badge: "bg-purple-500/15 text-purple-600 border-purple-500/20",
    modules: [...RBAC_MODULES],
  },
};

export function TenantsPage() {
  const [tenants, setTenants] = useState<TenantOrg[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Onboarding Wizard State
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Success Credential Modal
  const [credentialModal, setCredentialModal] = useState<{
    tenantName: string;
    adminEmail: string;
    tempPassword: string;
    tenantKey: string;
    portalUrl: string;
    invoiceNo: string;
    paidAmount: number;
    currency: string;
    paymentMethod: string;
  } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Export Modal State
  const [exportModal, setExportModal] = useState<{
    tenant: TenantOrg;
    stage: "collecting" | "packaging" | "done" | "error";
    steps: { label: string; done: boolean; count?: number }[];
    exportId?: string;
    errorMsg?: string;
  } | null>(null);

  // Full 4-Step Onboarding Form State
  const [form, setForm] = useState({
    // Step 1: Organisation & Legal
    name: "",
    legal_entity_name: "",
    commercial_reg_no: "",
    tax_id_no: "",
    country: "Qatar",
    city: "Doha",
    address_line: "",
    primary_phone: "+974 ",
    primary_email: "",
    // Step 2: Primary Administrator Credentials
    admin_name: "",
    admin_email: "",
    admin_password: "",
    admin_phone: "",
    send_welcome_email: true,
    // Step 3: Subscription & Entitlements
    plan: "Professional" as "Starter" | "Professional" | "Enterprise",
    billing_cycle: "monthly" as "monthly" | "annual",
    max_properties: 30,
    max_units: 500,
    max_staff_users: 20,
    max_storage_gb: 50,
    enabled_modules: [...PLAN_PRESETS.Professional.modules],
    custom_subdomain: "",
    // Step 4: Payment Processing & Settlement
    payment_method: "qpay_naps" as "qpay_naps" | "credit_card" | "bank_transfer" | "cheque" | "complimentary_trial",
    currency: "QAR",
    subscription_amount: 999,
    discount_amount: 0,
    tax_rate_percent: 0, // Qatar 0% VAT standard
    tax_amount: 0,
    total_payable: 999,
    payment_status: "Paid" as "Paid" | "Pending" | "Trial",
    transaction_ref: "",
    bank_name: "Qatar National Bank (QNB)",
    cheque_number: "",
    auto_renew: true,
  });

  useEffect(() => {
    loadTenants();
  }, []);

  async function loadTenants() {
    setLoading(true);
    try {
      const { data: orgs, error } = await supabase
        .from("tenant_organisations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Enrich property counts
      const { data: props } = await supabase.from("properties").select("id, host_id");
      const propMap: Record<string, number> = {};
      (props || []).forEach((p: any) => {
        propMap[p.host_id] = (propMap[p.host_id] || 0) + 1;
      });

      const list: TenantOrg[] = (orgs || []).map((o: any) => ({
        ...o,
        propertyCount: propMap[o.admin_user_id] || propMap[o.id] || 0,
      }));

      setTenants(list);
    } catch (e: any) {
      toast.error("Failed to load tenant organisations: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  function handlePlanChange(newPlan: "Starter" | "Professional" | "Enterprise") {
    const preset = PLAN_PRESETS[newPlan];
    const amount = form.billing_cycle === "annual" ? preset.price_annual : preset.price_monthly;
    const total = Math.max(0, amount - form.discount_amount);

    setForm((prev) => ({
      ...prev,
      plan: newPlan,
      subscription_amount: amount,
      total_payable: total,
      max_properties: preset.max_properties,
      max_units: preset.max_units,
      max_staff_users: preset.max_staff_users,
      max_storage_gb: preset.max_storage_gb,
      enabled_modules: [...preset.modules],
    }));
  }

  function handleBillingCycleChange(cycle: "monthly" | "annual") {
    const preset = PLAN_PRESETS[form.plan];
    const amount = cycle === "annual" ? preset.price_annual : preset.price_monthly;
    const total = Math.max(0, amount - form.discount_amount);

    setForm((prev) => ({
      ...prev,
      billing_cycle: cycle,
      subscription_amount: amount,
      total_payable: total,
    }));
  }

  function toggleModule(mod: string) {
    setForm((prev) => {
      const exists = prev.enabled_modules.includes(mod);
      return {
        ...prev,
        enabled_modules: exists
          ? prev.enabled_modules.filter((m) => m !== mod)
          : [...prev.enabled_modules, mod],
      };
    });
  }

  function generateAutoKey(name: string) {
    const clean = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 20);
    return `tenant-${clean || "org"}-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  function generateSecurePassword() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd + "@2026";
  }

  function generateTxnRef() {
    return `TXN-QPAY-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  }

  function handleImpersonateTenant(tenant: TenantOrg) {
    startImpersonation({
      id: tenant.id,
      tenant_key: tenant.tenant_key,
      name: tenant.name,
      admin_name: tenant.admin_name,
      admin_email: tenant.admin_email,
    });
    toast.success(`Support Impersonation Started for ${tenant.name}`);
    window.location.href = "/prop-mgr";
  }

  async function handleExportTenantData(tenant: TenantOrg) {
    // Open export progress modal
    const exportId = `EXP-${tenant.tenant_key.toUpperCase()}-${Date.now()}`;
    const steps = [
      { label: "Organisation & Legal Records", done: false },
      { label: "Properties & Units Portfolio", done: false },
      { label: "Lease Contracts", done: false },
      { label: "Financial Ledger & Payments", done: false },
      { label: "Maintenance Tickets & Work Orders", done: false },
      { label: "Subscription Invoices", done: false },
      { label: "Packaging & Compressing", done: false },
    ];

    setExportModal({ tenant, stage: "collecting", steps, exportId });

    const markStep = (index: number, count?: number) => {
      setExportModal(prev => {
        if (!prev) return null;
        const updated = [...prev.steps];
        updated[index] = { ...updated[index], done: true, count };
        return { ...prev, steps: updated };
      });
    };

    try {
      // Step 0 — org record (already loaded)
      await new Promise(r => setTimeout(r, 300));
      markStep(0, 1);

      // Step 1 — properties
      const propsRes = await supabase.from("properties")
        .select("*")
        .eq("host_id", tenant.admin_user_id || tenant.id);
      markStep(1, (propsRes.data || []).length);

      // Step 2 — leases
      const leasesRes = await supabase.from("leases")
        .select("*")
        .eq("tenant_id", tenant.id);
      markStep(2, (leasesRes.data || []).length);

      // Step 3 — payments + journals
      const [paymentsRes, journalsRes] = await Promise.all([
        supabase.from("payments").select("*").eq("tenant_id", tenant.id),
        supabase.from("journal_entries").select("*").eq("tenant_id", tenant.id).limit(500),
      ]);
      markStep(3, (paymentsRes.data || []).length + (journalsRes.data || []).length);

      // Step 4 — maintenance
      const maintenanceRes = await supabase.from("maintenance_tickets")
        .select("*")
        .eq("tenant_id", tenant.id);
      markStep(4, (maintenanceRes.data || []).length);

      // Step 5 — subscription invoices
      const invoicesRes = await supabase.from("tenant_subscription_invoices")
        .select("*")
        .eq("tenant_id", tenant.id);
      markStep(5, (invoicesRes.data || []).length);

      // Step 6 — packaging
      setExportModal(prev => prev ? { ...prev, stage: "packaging" } : null);
      await new Promise(r => setTimeout(r, 400));

      const exportPackage = {
        metadata: {
          export_id: exportId,
          generated_at: new Date().toISOString(),
          timezone: "Asia/Qatar (UTC+3 / AST)",
          platform: "ZYNO Real Estate OS — SaaS Multi-Tenant Platform",
          exported_by: "Super Admin Governance Console",
          compliance_framework: "Qatar Personal Data Protection Law (PDPL) · GDPR Article 20 (Data Portability)",
          record_counts: {
            properties: (propsRes.data || []).length,
            leases: (leasesRes.data || []).length,
            payments: (paymentsRes.data || []).length,
            journal_entries: (journalsRes.data || []).length,
            maintenance_tickets: (maintenanceRes.data || []).length,
            subscription_invoices: (invoicesRes.data || []).length,
          },
        },
        tenant_organisation: tenant,
        portfolio: {
          properties_count: (propsRes.data || []).length,
          properties: propsRes.data || [],
        },
        contracts: {
          leases_count: (leasesRes.data || []).length,
          leases: leasesRes.data || [],
        },
        financials: {
          payments_count: (paymentsRes.data || []).length,
          payments: paymentsRes.data || [],
          journal_entries_count: (journalsRes.data || []).length,
          journal_entries: journalsRes.data || [],
        },
        maintenance: {
          tickets_count: (maintenanceRes.data || []).length,
          tickets: maintenanceRes.data || [],
        },
        billing: {
          subscription_invoices_count: (invoicesRes.data || []).length,
          subscription_invoices: invoicesRes.data || [],
        },
      };

      // Trigger JSON download
      const blob = new Blob([JSON.stringify(exportPackage, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zyno_data_export_${tenant.tenant_key}_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      markStep(6);

      await logSecurityEvent({
        event_type: "TENANT_DATA_EXPORTED",
        severity: "info",
        resource: `tenant_organisations/${tenant.id}`,
        action: `Super Admin exported comprehensive GDPR/PDPL data package for ${tenant.name}`,
        user_role: "SUPER_ADMIN",
        details: {
          export_id: exportId,
          tenant_id: tenant.id,
          tenant_key: tenant.tenant_key,
          records_exported: exportPackage.metadata.record_counts,
        },
      });

      setExportModal(prev => prev ? { ...prev, stage: "done" } : null);
      toast.success(`Export package downloaded for ${tenant.name}`, { id: "export-pkg" });
    } catch (err: any) {
      setExportModal(prev => prev ? { ...prev, stage: "error", errorMsg: err.message } : null);
      toast.error("Export failed: " + err.message, { id: "export-pkg" });
    }
  }

  function startOnboardingWizard() {
    const pwd = generateSecurePassword();
    const txn = generateTxnRef();
    setForm({
      name: "",
      legal_entity_name: "",
      commercial_reg_no: "",
      tax_id_no: "",
      country: "Qatar",
      city: "Doha",
      address_line: "",
      primary_phone: "+974 ",
      primary_email: "",
      admin_name: "",
      admin_email: "",
      admin_password: pwd,
      admin_phone: "+974 ",
      send_welcome_email: true,
      plan: "Professional",
      billing_cycle: "monthly",
      max_properties: PLAN_PRESETS.Professional.max_properties,
      max_units: PLAN_PRESETS.Professional.max_units,
      max_staff_users: PLAN_PRESETS.Professional.max_staff_users,
      max_storage_gb: PLAN_PRESETS.Professional.max_storage_gb,
      enabled_modules: [...PLAN_PRESETS.Professional.modules],
      custom_subdomain: "",
      payment_method: "qpay_naps",
      currency: "QAR",
      subscription_amount: PLAN_PRESETS.Professional.price_monthly,
      discount_amount: 0,
      tax_rate_percent: 0,
      tax_amount: 0,
      total_payable: PLAN_PRESETS.Professional.price_monthly,
      payment_status: "Paid",
      transaction_ref: txn,
      bank_name: "Qatar National Bank (QNB)",
      cheque_number: "",
      auto_renew: true,
    });
    setWizardStep(1);
    setShowWizard(true);
  }

  async function handleCompleteOnboarding() {
    // Validations
    if (!form.name || !form.primary_email || !form.admin_name || !form.admin_email) {
      toast.error("Please fill in all mandatory organisation and administrator fields.");
      return;
    }

    setSubmitting(true);
    const tenantKey = generateAutoKey(form.name);
    const invoiceNo = `INV-SUB-${Date.now().toString().slice(-6)}`;

    try {
      // 1. Create Supabase Auth Account for Administrator
      let adminUserId: string | null = null;
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.admin_email,
          password: form.admin_password,
          options: {
            data: {
              full_name: form.admin_name,
              role: "ADMIN",
              tenant_key: tenantKey,
              organisation_name: form.name,
              phone: form.admin_phone,
            },
          },
        });
        if (authError) throw authError;
        adminUserId = authData?.user?.id || null;
      } catch (authErr: any) {
        console.warn("Auth signup notice:", authErr.message);
      }

      // 2. Insert into tenant_organisations table with payment and settlement details
      const { data: tenantInsertData, error: dbError } = await supabase.from("tenant_organisations").insert({
        tenant_key: tenantKey,
        name: form.name,
        legal_entity_name: form.legal_entity_name || form.name,
        commercial_reg_no: form.commercial_reg_no || null,
        tax_id_no: form.tax_id_no || null,
        country: form.country,
        city: form.city,
        address_line: form.address_line,
        primary_phone: form.primary_phone,
        primary_email: form.primary_email,
        admin_name: form.admin_name,
        admin_email: form.admin_email,
        admin_user_id: adminUserId,
        plan: form.plan,
        billing_cycle: form.billing_cycle,
        status: form.payment_method === "complimentary_trial" ? "Trial" : "Active",
        max_properties: form.max_properties,
        max_units: form.max_units,
        max_staff_users: form.max_staff_users,
        max_storage_gb: form.max_storage_gb,
        enabled_modules: form.enabled_modules,
        custom_subdomain: form.custom_subdomain || null,
        subscription_amount: form.subscription_amount,
        currency: form.currency,
        payment_method: form.payment_method,
        payment_status: form.payment_status,
        transaction_ref: form.transaction_ref || null,
        bank_name: form.bank_name || null,
        cheque_number: form.cheque_number || null,
        auto_renew: form.auto_renew,
        tax_amount: form.tax_amount,
        total_paid: form.total_payable,
        created_at: new Date().toISOString(),
      }).select("id").single();

      if (dbError) throw dbError;

      const newTenantId = tenantInsertData?.id;

      // 3. Create Subscription Invoice in tenant_subscription_invoices
      if (newTenantId) {
        await supabase.from("tenant_subscription_invoices").insert({
          invoice_number: invoiceNo,
          tenant_id: newTenantId,
          tenant_key: tenantKey,
          tenant_name: form.name,
          plan: form.plan,
          billing_cycle: form.billing_cycle,
          subtotal_amount: form.subscription_amount,
          tax_amount: form.tax_amount,
          discount_amount: form.discount_amount,
          total_amount: form.total_payable,
          currency: form.currency,
          status: form.payment_status === "Paid" ? "Paid" : "Pending",
          payment_method: form.payment_method,
          transaction_ref: form.transaction_ref || null,
          payment_date: form.payment_status === "Paid" ? new Date().toISOString() : null,
          issue_date: new Date().toISOString().split("T")[0],
          due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
          created_at: new Date().toISOString(),
        });
      }

      // 4. Security Audit Logging
      await logSecurityEvent({
        event_type: "auth",
        severity: "info",
        resource: `tenant_organisations/${tenantKey}`,
        action: "TENANT_ONBOARDED_WITH_PAYMENT",
        details: {
          tenantKey,
          organisationName: form.name,
          adminEmail: form.admin_email,
          plan: form.plan,
          totalPaid: form.total_payable,
          paymentMethod: form.payment_method,
          invoiceNo,
        },
      });

      // 5. In-App Notification to System
      await createBroadcastNotification({
        title: `Organisation Onboarded: ${form.name}`,
        message: `${form.name} (${form.plan} Plan, ${form.currency} ${form.total_payable}) successfully activated with admin ${form.admin_email}.`,
        type: "success",
        target_role: "SUPER_ADMIN",
      });

      // 6. Present Success & Credentials Modal with Receipt Details
      setShowWizard(false);
      setCredentialModal({
        tenantName: form.name,
        adminEmail: form.admin_email,
        tempPassword: form.admin_password,
        tenantKey,
        portalUrl: window.location.origin + "/auth",
        invoiceNo,
        paidAmount: form.total_payable,
        currency: form.currency,
        paymentMethod: form.payment_method.replace("_", " ").toUpperCase(),
      });

      loadTenants();
      toast.success(`Organisation "${form.name}" onboarded and invoice ${invoiceNo} generated!`);
    } catch (err: any) {
      toast.error("Onboarding failed: " + (err.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  }

  function copyToClipboard(text: string, fieldName: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  }

  const filtered = tenants.filter((t) =>
    (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.admin_email || "").toLowerCase().includes(search.toLowerCase()) ||
    (t.tenant_key || "").toLowerCase().includes(search.toLowerCase())
  );

  const paginatedTenants = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tenant Organisation Governance</h1>
          <p className="text-sm text-muted-foreground mt-1">
            End-to-end organisation onboarding, payment settlements, subscription billing, and platform module entitlements.
          </p>
        </div>
        <Button
          onClick={startOnboardingWizard}
          className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white gap-2 font-medium shadow-md shadow-primary/20"
        >
          <Plus className="h-4 w-4" /> Onboard New Organisation
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border border-border/80 shadow-sm bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Organisations</p>
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-bold mt-2 text-foreground">{tenants.length}</p>
            <p className="text-[11px] text-muted-foreground mt-1">Multi-tenant client accounts</p>
          </CardContent>
        </Card>

        <Card className="border border-emerald-500/20 shadow-sm bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-emerald-600 uppercase">Active Organisations</p>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold mt-2 text-emerald-600">
              {tenants.filter((t) => t.status === "Active").length}
            </p>
            <p className="text-[11px] text-emerald-600/80 mt-1">Paid & active access</p>
          </CardContent>
        </Card>

        <Card className="border border-indigo-500/20 shadow-sm bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-indigo-600 uppercase">Managed Properties</p>
              <Server className="h-4 w-4 text-indigo-600" />
            </div>
            <p className="text-3xl font-bold mt-2 text-indigo-600">
              {tenants.reduce((sum, t) => sum + (t.propertyCount || 0), 0)}
            </p>
            <p className="text-[11px] text-indigo-600/80 mt-1">Properties across clients</p>
          </CardContent>
        </Card>

        <Card className="border border-amber-500/20 shadow-sm bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-amber-600 uppercase">Subscription MRR</p>
              <Wallet className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-3xl font-bold mt-2 text-amber-600">
              QAR {tenants.reduce((sum, t) => sum + (Number(t.subscription_amount) || 999), 0).toLocaleString()}
            </p>
            <p className="text-[11px] text-amber-600/80 mt-1">Monthly recurring revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Tenants Table Card */}
      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="p-4 pb-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by organisation name, email, or key..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadTenants} disabled={loading} className="text-xs gap-1.5">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
              Loading organisations...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-30 text-primary" />
              No organisations found matching your filter.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/60">
                  <tr>
                    <th className="p-3">Organisation & Key</th>
                    <th className="p-3">Admin Contact</th>
                    <th className="p-3">Plan & Billing</th>
                    <th className="p-3">Payment Status</th>
                    <th className="p-3">Capacity Limits</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Joined Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {paginatedTenants.map((t) => {
                    const preset = PLAN_PRESETS[t.plan as keyof typeof PLAN_PRESETS] || PLAN_PRESETS.Starter;
                    return (
                      <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-foreground text-sm flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-primary" />
                            {t.name}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">{t.tenant_key}</div>
                          {t.commercial_reg_no && (
                            <div className="text-[10px] text-muted-foreground">CR: {t.commercial_reg_no}</div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-foreground">{t.admin_name}</div>
                          <div className="text-[11px] text-muted-foreground">{t.admin_email}</div>
                          {t.primary_phone && <div className="text-[10px] text-muted-foreground">{t.primary_phone}</div>}
                        </td>
                        <td className="p-3">
                          <Badge className={`text-[10px] uppercase font-bold ${preset.badge}`}>
                            {t.plan}
                          </Badge>
                          <div className="text-[11px] font-semibold text-foreground mt-1">
                            {t.currency || "QAR"} {(t.subscription_amount || (t.plan === "Starter" ? 299 : t.plan === "Professional" ? 999 : 2499)).toLocaleString()}/{t.billing_cycle === "annual" ? "yr" : "mo"}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px]">
                            {t.payment_status || "Paid"}
                          </Badge>
                          <div className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                            {(t.payment_method || "qpay_naps").replace("_", " ")}
                          </div>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-muted-foreground">
                          <div>Props: <span className="font-semibold text-foreground">{t.max_properties}</span></div>
                          <div>Units: <span className="font-semibold text-foreground">{t.max_units}</span></div>
                        </td>
                        <td className="p-3">
                          <Badge className={t.status === "Active" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" : "bg-amber-500/15 text-amber-600 border-amber-500/20"}>
                            {t.status}
                          </Badge>
                        </td>
                        <td className="p-3 text-muted-foreground whitespace-nowrap">
                          {new Date(t.created_at).toLocaleDateString("en-QA", { year: "numeric", month: "short", day: "numeric" })}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleImpersonateTenant(t)}
                              className="h-7 px-2.5 text-xs text-amber-600 border-amber-500/30 hover:bg-amber-500/10 gap-1 font-semibold"
                              title="Log In As Tenant Admin (Support Mode)"
                            >
                              <Lock className="h-3 w-3 text-amber-600" /> Impersonate
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExportTenantData(t)}
                              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                              title="Export Tenant Data Package"
                            >
                              <FileCheck className="h-3.5 w-3.5" /> Export
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCredentialModal({
                                  tenantName: t.name,
                                  adminEmail: t.admin_email,
                                  tempPassword: "• • • • • • • • (Hidden)",
                                  tenantKey: t.tenant_key,
                                  portalUrl: window.location.origin + "/auth",
                                  invoiceNo: `INV-REC-${t.tenant_key.slice(-4)}`,
                                  paidAmount: t.subscription_amount || 999,
                                  currency: t.currency || "QAR",
                                  paymentMethod: (t.payment_method || "QPAY").toUpperCase(),
                                });
                              }}
                              className="h-7 px-2 text-xs"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                            </Button>
                          </div>
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

      {/* ── MULTI-STEP ONBOARDING WIZARD MODAL (4-STEPS WITH PAYMENT) ──────── */}
      <Dialog open={showWizard} onOpenChange={setShowWizard}>
        <DialogContent className="sm:max-w-[720px] border border-primary/20 shadow-2xl bg-card p-0 overflow-hidden">
          {/* Modal Header with Progress */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white border-b border-indigo-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-foreground">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-white">Onboard New Organisation</DialogTitle>
                  <DialogDescription className="text-xs text-slate-300">
                    Step {wizardStep} of 4 — {
                      wizardStep === 1 ? "Organisation Details & Entity" :
                      wizardStep === 2 ? "Administrator Credentials & Auth" :
                      wizardStep === 3 ? "Subscription Plan & Entitlements" :
                      "Payment Processing & Billing Settlement"
                    }
                  </DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      step === wizardStep ? "w-7 bg-primary" : step < wizardStep ? "w-2 bg-emerald-500" : "w-2 bg-slate-700"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            {/* ── STEP 1: ORGANISATION PROFILE ──────────────────────────────── */}
            {wizardStep === 1 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-semibold">Organisation Display Name <span className="text-red-500">*</span></Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Al Baraka Properties W.L.L."
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Legal Entity Name</Label>
                    <Input
                      value={form.legal_entity_name}
                      onChange={(e) => setForm({ ...form, legal_entity_name: e.target.value })}
                      placeholder="e.g. Al Baraka Real Estate Holdings LLC"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Primary Contact Email <span className="text-red-500">*</span></Label>
                    <Input
                      type="email"
                      value={form.primary_email}
                      onChange={(e) => setForm({ ...form, primary_email: e.target.value })}
                      placeholder="contact@albaraka.qa"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Commercial Registration (CR) Number</Label>
                    <Input
                      value={form.commercial_reg_no}
                      onChange={(e) => setForm({ ...form, commercial_reg_no: e.target.value })}
                      placeholder="e.g. CR-7890123-QA"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Tax Identification Number (TIN)</Label>
                    <Input
                      value={form.tax_id_no}
                      onChange={(e) => setForm({ ...form, tax_id_no: e.target.value })}
                      placeholder="e.g. TIN-1002345678"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Country</Label>
                    <Input
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">City</Label>
                    <Input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <Label className="text-xs font-semibold">Official Business Address</Label>
                    <Input
                      value={form.address_line}
                      onChange={(e) => setForm({ ...form, address_line: e.target.value })}
                      placeholder="Tower 4, Level 18, West Bay, Doha, Qatar"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: ADMINISTRATOR CREDENTIALS ─────────────────────────── */}
            {wizardStep === 2 && (
              <div className="space-y-4 animate-in fade-in-50 duration-200">
                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary space-y-1">
                  <p className="font-semibold flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Root Tenant Administrator Account
                  </p>
                  <p className="text-muted-foreground">
                    This user will receive root admin credentials to manage properties, leases, financial ledgers, and team members for this organisation.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Admin Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      value={form.admin_name}
                      onChange={(e) => setForm({ ...form, admin_name: e.target.value })}
                      placeholder="e.g. Mohammed Al-Kuwari"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Admin Work Email <span className="text-red-500">*</span></Label>
                    <Input
                      type="email"
                      value={form.admin_email}
                      onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
                      placeholder="admin@albaraka.qa"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Admin Mobile Phone</Label>
                    <Input
                      value={form.admin_phone}
                      onChange={(e) => setForm({ ...form, admin_phone: e.target.value })}
                      placeholder="+974 5500 1234"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Generated Temporary Password</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="text"
                        value={form.admin_password}
                        onChange={(e) => setForm({ ...form, admin_password: e.target.value })}
                        className="font-mono text-xs"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setForm({ ...form, admin_password: generateSecurePassword() })}
                        className="text-xs px-2.5"
                      >
                        Regen
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: SUBSCRIPTION & MODULE ENTITLEMENTS ───────────────── */}
            {wizardStep === 3 && (
              <div className="space-y-5 animate-in fade-in-50 duration-200">
                {/* Billing Cycle Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60">
                  <div>
                    <p className="text-xs font-bold text-foreground">Billing Cadence</p>
                    <p className="text-[11px] text-muted-foreground">Annual billing provides 2 months free</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-background p-1 rounded-lg border border-border/60">
                    <Button
                      type="button"
                      size="sm"
                      variant={form.billing_cycle === "monthly" ? "default" : "ghost"}
                      onClick={() => handleBillingCycleChange("monthly")}
                      className="h-7 text-xs px-3"
                    >
                      Monthly
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={form.billing_cycle === "annual" ? "default" : "ghost"}
                      onClick={() => handleBillingCycleChange("annual")}
                      className="h-7 text-xs px-3 gap-1"
                    >
                      Annual <Badge className="bg-emerald-500 text-white text-[9px] py-0 px-1">Save 16%</Badge>
                    </Button>
                  </div>
                </div>

                {/* Plan Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Select Subscription Tier</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["Starter", "Professional", "Enterprise"] as const).map((tier) => {
                      const p = PLAN_PRESETS[tier];
                      const cost = form.billing_cycle === "annual" ? p.price_annual : p.price_monthly;
                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => handlePlanChange(tier)}
                          className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                            form.plan === tier
                              ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                              : "border-border/60 hover:border-border hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-foreground">{tier}</span>
                            {form.plan === tier && <CheckCircle2 className="h-4 w-4 text-primary" />}
                          </div>
                          <p className="text-xs font-bold text-primary mt-1">
                            QAR {cost.toLocaleString()} <span className="text-[10px] font-normal text-muted-foreground">/{form.billing_cycle === "annual" ? "yr" : "mo"}</span>
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-1">
                            Up to {p.max_properties} Props, {p.max_units} Units
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Capacity Limits */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Max Properties</Label>
                    <Input
                      type="number"
                      value={form.max_properties}
                      onChange={(e) => setForm({ ...form, max_properties: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Max Units</Label>
                    <Input
                      type="number"
                      value={form.max_units}
                      onChange={(e) => setForm({ ...form, max_units: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Staff Seats</Label>
                    <Input
                      type="number"
                      value={form.max_staff_users}
                      onChange={(e) => setForm({ ...form, max_staff_users: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">Storage (GB)</Label>
                    <Input
                      type="number"
                      value={form.max_storage_gb}
                      onChange={(e) => setForm({ ...form, max_storage_gb: Number(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Enabled RBAC Modules */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">Enabled System Modules ({form.enabled_modules.length})</Label>
                    <span className="text-[11px] text-muted-foreground">Toggle access permissions</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {RBAC_MODULES.map((mod) => {
                      const enabled = form.enabled_modules.includes(mod);
                      return (
                        <button
                          key={mod}
                          type="button"
                          onClick={() => toggleModule(mod)}
                          className={`p-2 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                            enabled
                              ? "border-primary/40 bg-primary/10 text-foreground font-medium"
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
              </div>
            )}

            {/* ── STEP 4: PAYMENT PROCESSING & SETTLEMENT ────────────────────── */}
            {wizardStep === 4 && (
              <div className="space-y-5 animate-in fade-in-50 duration-200">
                {/* Pricing Breakdown Summary */}
                <Card className="border border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">Order & Invoice Breakdown</span>
                      <Badge className="bg-primary/15 text-primary text-[10px] uppercase font-bold">{form.plan} Plan</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/40 text-muted-foreground">
                      <span>Subscription Fee ({form.billing_cycle}):</span>
                      <span className="font-semibold text-foreground">{form.currency} {form.subscription_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40 text-muted-foreground">
                      <span>VAT / Tax (Qatar 0% Standard):</span>
                      <span className="font-semibold text-foreground">{form.currency} {form.tax_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 text-sm font-bold text-foreground">
                      <span>Total Amount Payable:</span>
                      <span className="text-primary text-base font-extrabold">{form.currency} {form.total_payable.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Payment Method & Settlement Mode</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: "qpay_naps", label: "QPay / NAPS", icon: <CreditCard className="h-4 w-4" /> },
                      { id: "credit_card", label: "Credit Card (Visa/MC)", icon: <CreditCard className="h-4 w-4" /> },
                      { id: "bank_transfer", label: "Direct Wire (QNB)", icon: <Landmark className="h-4 w-4" /> },
                      { id: "cheque", label: "Bank Cheque / PDC", icon: <Banknote className="h-4 w-4" /> },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setForm({ ...form, payment_method: method.id as any })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          form.payment_method === method.id
                            ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20"
                            : "border-border/60 hover:bg-muted/40"
                        }`}
                      >
                        <div className="text-primary mb-1">{method.icon}</div>
                        <p className="text-xs font-bold text-foreground truncate">{method.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Specific Fields */}
                <div className="grid gap-3 md:grid-cols-2 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Payment Reference / Transaction ID</Label>
                    <Input
                      value={form.transaction_ref}
                      onChange={(e) => setForm({ ...form, transaction_ref: e.target.value })}
                      placeholder="e.g. TXN-QPAY-984210"
                      className="font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Payment Settlement Status</Label>
                    <select
                      value={form.payment_status}
                      onChange={(e) => setForm({ ...form, payment_status: e.target.value as any })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="Paid">Payment Received (Active)</option>
                      <option value="Pending">Payment Pending Verification</option>
                      <option value="Trial">14-Day Free Trial</option>
                    </select>
                  </div>

                  {form.payment_method === "cheque" && (
                    <div className="space-y-1.5 md:col-span-2">
                      <Label className="text-xs font-semibold">Cheque Number & Issuing Bank</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Cheque No (e.g. CHQ-89021)"
                          value={form.cheque_number}
                          onChange={(e) => setForm({ ...form, cheque_number: e.target.value })}
                        />
                        <Input
                          placeholder="Issuing Bank (e.g. QNB / CBQ)"
                          value={form.bank_name}
                          onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
                  <div>
                    <p className="text-xs font-semibold text-foreground">Auto-Renew Subscription</p>
                    <p className="text-[11px] text-muted-foreground">Automatically trigger recurring invoice at end of period</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.auto_renew}
                    onChange={(e) => setForm({ ...form, auto_renew: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <DialogFooter className="p-4 bg-muted/30 border-t border-border/60 flex items-center justify-between gap-3">
            <div>
              {wizardStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setWizardStep(wizardStep - 1)}
                  className="gap-1.5 text-xs"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowWizard(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              {wizardStep < 4 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (wizardStep === 1 && (!form.name || !form.primary_email)) {
                      toast.error("Please enter the organisation name and primary email.");
                      return;
                    }
                    if (wizardStep === 2 && (!form.admin_name || !form.admin_email)) {
                      toast.error("Please enter the administrator name and email.");
                      return;
                    }
                    setWizardStep(wizardStep + 1);
                  }}
                  className="gap-1.5 text-xs"
                >
                  Next Step <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled={submitting}
                  onClick={handleCompleteOnboarding}
                  className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white gap-1.5 text-xs font-semibold shadow-md"
                >
                  {submitting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Receipt className="h-3.5 w-3.5" />}
                  Process Payment & Onboard
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── ONBOARDING SUCCESS & PAYMENT RECEIPT MODAL ───────────────────────── */}
      <Dialog open={!!credentialModal} onOpenChange={() => setCredentialModal(null)}>
        <DialogContent className="sm:max-w-[560px] border border-emerald-500/30 bg-card p-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="h-16 w-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCheck className="h-8 w-8" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Organisation Activated & Invoiced!
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {credentialModal?.tenantName} is ready. Access credentials and official tax invoice have been generated.
            </DialogDescription>
          </div>

          <div className="space-y-3 pt-3">
            {/* Invoice & Payment Snapshot */}
            <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-400">
                <span className="flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5" /> Invoice Number:
                </span>
                <span className="font-mono">{credentialModal?.invoiceNo}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Amount Paid:</span>
                <span className="font-bold text-foreground">{credentialModal?.currency} {credentialModal?.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Payment Settlement:</span>
                <span className="font-semibold text-emerald-600">{credentialModal?.paymentMethod}</span>
              </div>
            </div>

            {/* Login Credentials */}
            <div className="p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Tenant Key:</span>
                <span className="font-mono font-bold text-foreground">{credentialModal?.tenantKey}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Administrator Email:</span>
                <span className="font-semibold text-foreground">{credentialModal?.adminEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Temporary Password:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-emerald-600">{credentialModal?.tempPassword}</span>
                  {credentialModal?.tempPassword && !credentialModal.tempPassword.includes("•") && (
                    <button
                      onClick={() => copyToClipboard(credentialModal.tempPassword, "Password")}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {copiedField === "Password" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-medium">Sign-In URL:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-primary truncate max-w-[200px]">{credentialModal?.portalUrl}</span>
                  <button
                    onClick={() => copyToClipboard(credentialModal?.portalUrl || "", "Login URL")}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {copiedField === "Login URL" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              onClick={() => setCredentialModal(null)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md"
            >
              Done & Return to Organisation List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DATA EXPORT PROGRESS MODAL ─────────────────────────────────────── */}
      <Dialog open={!!exportModal} onOpenChange={() => exportModal?.stage !== "collecting" && exportModal?.stage !== "packaging" && setExportModal(null)}>
        <DialogContent className="sm:max-w-[480px] border border-indigo-500/30 bg-card p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Download className="h-5 w-5 text-indigo-500" />
              Comprehensive Data Export
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {exportModal?.tenant.name} — GDPR / Qatar PDPL data portability snapshot
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Export ID */}
            {exportModal?.exportId && (
              <div className="bg-muted/50 rounded-lg p-2.5 flex items-center justify-between text-xs border border-border/60">
                <span className="text-muted-foreground">Export ID:</span>
                <span className="font-mono font-semibold text-foreground">{exportModal.exportId}</span>
              </div>
            )}

            {/* Steps */}
            <div className="space-y-2">
              {exportModal?.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                    step.done
                      ? "bg-emerald-500/15 border border-emerald-500/30"
                      : (exportModal.stage === "collecting" || exportModal.stage === "packaging") && !exportModal.steps[i].done && exportModal.steps.findIndex(s => !s.done) === i
                      ? "bg-indigo-500/15 border border-indigo-500/30 animate-pulse"
                      : "bg-muted border border-border/40"
                  }`}>
                    {step.done
                      ? <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                      : (exportModal.stage === "collecting" || exportModal.stage === "packaging") && exportModal.steps.findIndex(s => !s.done) === i
                      ? <RefreshCw className="h-3 w-3 text-indigo-500 animate-spin" />
                      : <span className="text-[9px] text-muted-foreground font-bold">{i + 1}</span>}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className={`text-xs ${step.done ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                    {step.done && step.count !== undefined && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px]">
                        {step.count} records
                      </Badge>
                    )}
                    {step.done && step.count === undefined && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px]">
                        ✓ done
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Stage indicator */}
            {exportModal?.stage === "packaging" && (
              <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-600 flex items-center gap-2">
                <PackageOpen className="h-4 w-4 animate-pulse" />
                Compressing and packaging all records into JSON...
              </div>
            )}

            {exportModal?.stage === "done" && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 flex items-center gap-2">
                <CheckCheck className="h-4 w-4" />
                Export downloaded successfully! File saved to your browser Downloads folder.
              </div>
            )}

            {exportModal?.stage === "error" && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Export Failed</div>
                  <div>{exportModal.errorMsg}</div>
                </div>
              </div>
            )}

            {/* Compliance note */}
            <div className="pt-1 text-[11px] text-muted-foreground border-t border-border/40 flex items-start gap-1.5">
              <Shield className="h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
              Exported under Qatar PDPL &amp; GDPR Article 20 (Right to Data Portability). All records logged to Security Audit Trail.
            </div>
          </div>

          <DialogFooter>
            <Button
              variant={exportModal?.stage === "done" ? "default" : "outline"}
              size="sm"
              disabled={exportModal?.stage === "collecting" || exportModal?.stage === "packaging"}
              onClick={() => setExportModal(null)}
              className={`text-xs ${exportModal?.stage === "done" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
            >
              {exportModal?.stage === "done" ? "Done" : exportModal?.stage === "error" ? "Close" : "Please wait..."}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  );
}
