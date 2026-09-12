import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Check, X, Shield, Save, GitBranch, Clock, ChevronDown, ChevronRight,
  AlertTriangle, Plus, Edit2, Trash2, ArrowRight, Layers, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DEFAULT_ROLE_ACCESS,
  GLOBAL_MANAGED_ROLES,
  RBAC_MODULES,
  TENANT_MANAGED_ROLES,
  DEFAULT_APPROVAL_WORKFLOWS,
  loadSavedApprovalWorkflows,
  saveApprovalWorkflows,
  type AppRole,
  type RbacModule,
  type ApprovalWorkflowRule,
  type ApprovalWorkflowLevel,
} from "@/lib/rbac";
import { toast } from "sonner";

const MODULE_GROUPS: { label: string; color: string; bg: string; modules: RbacModule[] }[] = [
  {
    label: "Property & Leasing",
    color: "text-sky-600",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    modules: ["Tenant Mgmt", "Property CRUD", "Unit Mgmt", "Lease Creation"],
  },
  {
    label: "Finance & Payments",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    modules: ["Payment Collection", "Receipt Generation", "Finance & GL"],
  },
  {
    label: "Operations & Supply",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    modules: ["Asset Management", "Procurement & POs", "Vendor Management", "Maintenance Tickets"],
  },
  {
    label: "Human Resources",
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    modules: ["HRMS", "Workforce & Shifts", "Payroll & Salary", "Performance & KPA"],
  },
  {
    label: "Platform & Admin",
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    modules: ["Reports & Analytics", "User Management", "Approval Workflows"],
  },
];

const ALL_ROLES_OPTIONS: AppRole[] = [
  "SUPER_ADMIN", "ADMIN", "PROP_MGR", "LEASING", "FINANCE", "CASHIER", "MAINTENANCE"
];

interface Permission {
  id: string;
  role_name: string;
  module_id: string;
  has_access: boolean;
  tenant_id: string | null;
}

export function PermissionsManager({
  targetTenantId = null,
  initialView = "matrix",
}: {
  targetTenantId?: string | null;
  initialView?: "matrix" | "workflows";
}) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeView, setActiveView] = useState<"matrix" | "workflows">(initialView);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [workflows, setWorkflows] = useState<ApprovalWorkflowRule[]>([]);
  const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>("ALL");

  // Workflow Modal state
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<ApprovalWorkflowRule | null>(null);
  const [wfForm, setWfForm] = useState<{
    id?: string;
    code: string;
    title: string;
    module: RbacModule;
    description: string;
    total_levels: number;
    levels: ApprovalWorkflowLevel[];
    is_active: boolean;
  }>({
    code: "",
    title: "",
    module: "Lease Creation",
    description: "",
    total_levels: 2,
    levels: [
      { level: 1, level_name: "Level 1: Operational Review", required_roles: ["PROP_MGR"], sla_hours: 24 },
      { level: 2, level_name: "Level 2: Management Authorization", required_roles: ["ADMIN", "SUPER_ADMIN"], sla_hours: 48 },
    ],
    is_active: true,
  });

  const roles = (targetTenantId ? TENANT_MANAGED_ROLES : GLOBAL_MANAGED_ROLES) as AppRole[];

  useEffect(() => {
    loadPermissions();
    setWorkflows(loadSavedApprovalWorkflows());
  }, [targetTenantId]);

  async function loadPermissions() {
    setLoading(true);
    let query = supabase.from("role_permissions").select("*");
    
    if (targetTenantId) {
      query = query.or(`tenant_id.eq.${targetTenantId},tenant_id.is.null`);
    } else {
      query = query.is("tenant_id", null);
    }

    const { data, error } = await query;
    if (error) {
      toast.error("Failed to load permissions");
      console.error(error);
    } else {
      setPermissions(data || []);
    }
    setLoading(false);
  }

  const togglePermission = (role: AppRole, mod: RbacModule) => {
    setPermissions(prev => {
      const existing = prev.find(p => p.role_name === role && p.module_id === mod);
      if (existing) {
        return prev.map(p => 
          p.id === existing.id ? { ...p, has_access: !p.has_access } : p
        );
      } else {
        return [...prev, {
          id: `temp-${Date.now()}`,
          role_name: role,
          module_id: mod,
          has_access: true,
          tenant_id: targetTenantId
        }];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const upserts = permissions.map(p => ({
        role_name: p.role_name,
        module_id: p.module_id,
        has_access: p.has_access,
        tenant_id: targetTenantId
      }));

      const { error } = await supabase.from("role_permissions").upsert(upserts, {
        onConflict: "role_name,module_id,tenant_id"
      });

      if (error) throw error;
      toast.success("Permissions updated successfully");
      await loadPermissions();
    } catch (err: any) {
      toast.error(err.message || "Failed to save permissions");
    } finally {
      setSaving(false);
    }
  };

  const toggleGroup = (label: string) =>
    setCollapsedGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const toggleWorkflow = (id: string) => {
    const updated = workflows.map((w) => (w.id === id ? { ...w, is_active: !w.is_active } : w));
    setWorkflows(updated);
    saveApprovalWorkflows(updated);
    toast.success("Workflow status updated");
  };

  const handleDeleteWorkflow = (id: string) => {
    const updated = workflows.filter((w) => w.id !== id);
    setWorkflows(updated);
    saveApprovalWorkflows(updated);
    toast.success("Workflow removed");
  };

  const handleOpenAddWorkflow = () => {
    setEditingWorkflow(null);
    setWfForm({
      code: `WF_${Date.now().toString().slice(-4)}`,
      title: "",
      module: "Lease Creation",
      description: "",
      total_levels: 2,
      levels: [
        { level: 1, level_name: "Level 1: Operational Review", required_roles: ["PROP_MGR"], sla_hours: 24 },
        { level: 2, level_name: "Level 2: Admin Sign-off", required_roles: ["ADMIN"], sla_hours: 48 },
      ],
      is_active: true,
    });
    setWorkflowModalOpen(true);
  };

  const handleOpenEditWorkflow = (wf: ApprovalWorkflowRule) => {
    setEditingWorkflow(wf);
    const totalLevels = wf.total_levels || wf.levels?.length || 1;
    let levels = wf.levels;
    if (!levels || levels.length === 0) {
      levels = [
        {
          level: 1,
          level_name: "Level 1: Primary Approver",
          required_roles: wf.required_approver_roles || ["ADMIN"],
          sla_hours: wf.escalation_timeout_hours || 24,
          threshold_min_qar: wf.threshold_min_qar,
        }
      ];
    }
    setWfForm({
      id: wf.id,
      code: wf.code,
      title: wf.title,
      module: wf.module,
      description: wf.description,
      total_levels: totalLevels,
      levels: levels,
      is_active: wf.is_active,
    });
    setWorkflowModalOpen(true);
  };

  const handleLevelCountChange = (count: number) => {
    const newLevels: ApprovalWorkflowLevel[] = [];
    const titles = [
      "Level 1: Operational Review",
      "Level 2: Department / Manager Review",
      "Level 3: Finance Controller Audit",
      "Level 4: Super Admin / Board Release"
    ];
    const defaultRoles: AppRole[][] = [
      ["PROP_MGR", "LEASING", "MAINTENANCE"],
      ["ADMIN", "PROP_MGR"],
      ["FINANCE", "ADMIN"],
      ["SUPER_ADMIN"]
    ];

    for (let i = 1; i <= count; i++) {
      const existing = wfForm.levels.find(l => l.level === i);
      if (existing) {
        newLevels.push(existing);
      } else {
        newLevels.push({
          level: i,
          level_name: titles[i - 1],
          required_roles: defaultRoles[i - 1] || ["ADMIN"],
          sla_hours: i * 24,
          threshold_min_qar: i > 1 ? (i - 1) * 5000 : 0
        });
      }
    }
    setWfForm({ ...wfForm, total_levels: count, levels: newLevels });
  };

  const handleUpdateLevelField = (levelIdx: number, field: keyof ApprovalWorkflowLevel, val: any) => {
    const updated = [...wfForm.levels];
    updated[levelIdx] = { ...updated[levelIdx], [field]: val };
    setWfForm({ ...wfForm, levels: updated });
  };

  const handleToggleLevelRole = (levelIdx: number, role: AppRole) => {
    const updated = [...wfForm.levels];
    const currentRoles = updated[levelIdx].required_roles || [];
    if (currentRoles.includes(role)) {
      if (currentRoles.length > 1) {
        updated[levelIdx].required_roles = currentRoles.filter(r => r !== role);
      } else {
        toast.error("At least one approver role is required per level");
        return;
      }
    } else {
      updated[levelIdx].required_roles = [...currentRoles, role];
    }
    setWfForm({ ...wfForm, levels: updated });
  };

  const handleSaveWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wfForm.title || !wfForm.code) {
      toast.error("Please enter workflow code and title");
      return;
    }

    if (editingWorkflow) {
      const updated = workflows.map(w => w.id === editingWorkflow.id ? {
        ...w,
        code: wfForm.code,
        title: wfForm.title,
        module: wfForm.module,
        description: wfForm.description,
        total_levels: wfForm.total_levels,
        levels: wfForm.levels,
        is_active: wfForm.is_active,
      } : w);
      setWorkflows(updated);
      saveApprovalWorkflows(updated);
      toast.success("Workflow rule updated!");
    } else {
      const newWf: ApprovalWorkflowRule = {
        id: `wf-${Date.now()}`,
        code: wfForm.code,
        title: wfForm.title,
        module: wfForm.module,
        description: wfForm.description,
        total_levels: wfForm.total_levels,
        levels: wfForm.levels,
        is_active: wfForm.is_active,
      };
      const updated = [newWf, ...workflows];
      setWorkflows(updated);
      saveApprovalWorkflows(updated);
      toast.success("New approval workflow registered!");
    }
    setWorkflowModalOpen(false);
  };

  const filteredWorkflows = workflows.filter(w => {
    if (selectedModuleFilter === "ALL") return true;
    return w.module === selectedModuleFilter;
  });

  if (loading) return (
    <div className="p-12 text-center text-muted-foreground">
      <Shield className="h-8 w-8 mx-auto mb-3 opacity-30 animate-pulse" />
      Loading permissions matrix...
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Tabs */}
      <div className="flex items-center gap-2 border-b pb-4">
        <button
          onClick={() => setActiveView("matrix")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeView === "matrix" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <Shield className="h-4 w-4" /> Role Access Matrix
        </button>
        <button
          onClick={() => setActiveView("workflows")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeView === "workflows" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          <GitBranch className="h-4 w-4" /> 4-Level Approval Workflows
          <Badge variant="outline" className="text-xs ml-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950">
            {workflows.filter((w) => w.is_active).length} Active
          </Badge>
        </button>
      </div>

      {/* ── VIEW 1: ROLE ACCESS MATRIX ────────────────────────────────────────── */}
      {activeView === "matrix" && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" /> Role Access Matrix
              </CardTitle>
              <CardDescription>
                {targetTenantId ? "Manage module access for your organization's staff roles." : "Configure global platform permissions. Click any cell to toggle access."}
              </CardDescription>
            </div>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />{saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-6 font-semibold text-muted-foreground min-w-[200px]">Module</th>
                    {roles.map((role) => (
                      <th key={role} className="text-center py-3 px-2 font-semibold text-muted-foreground min-w-[80px]">
                        <div className="text-xs leading-tight">{role.replace(/_/g, " ")}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULE_GROUPS.map((group) => (
                    <>
                      <tr key={`g-${group.label}`} className={`cursor-pointer select-none ${group.bg}`} onClick={() => toggleGroup(group.label)}>
                        <td colSpan={roles.length + 1} className={`py-2.5 px-3 font-semibold text-xs uppercase tracking-wider ${group.color}`}>
                          <span className="inline-flex items-center gap-2">
                            {collapsedGroups[group.label] ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            {group.label}
                            <span className="font-normal text-muted-foreground">({group.modules.length})</span>
                          </span>
                        </td>
                      </tr>
                      {!collapsedGroups[group.label] && group.modules.map((mod) => (
                        <tr key={mod} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                          <td className="py-2.5 pr-6 pl-8 font-medium text-sm">{mod}</td>
                          {roles.map((role) => {
                            let perm = permissions.find((p) => p.role_name === role && p.module_id === mod && p.tenant_id === targetTenantId);
                            if (!perm) perm = permissions.find((p) => p.role_name === role && p.module_id === mod && p.tenant_id === null);
                            const hasAccess = perm?.has_access ?? DEFAULT_ROLE_ACCESS[role]?.[mod] ?? false;
                            return (
                              <td key={role} className="text-center py-2 px-2">
                                <button
                                  onClick={() => togglePermission(role, mod)}
                                  title={`${hasAccess ? "Revoke" : "Grant"} ${role} — ${mod}`}
                                  className={`h-8 w-8 rounded-md flex items-center justify-center mx-auto transition-all hover:scale-110 ${
                                    hasAccess
                                      ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                                  }`}
                                >
                                  {hasAccess ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 opacity-40" />}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex items-center gap-6 text-xs text-muted-foreground border-t pt-4">
              <span className="flex items-center gap-1.5"><span className="h-5 w-5 rounded bg-emerald-100 flex items-center justify-center"><Check className="h-3 w-3 text-emerald-600" /></span> Access Granted</span>
              <span className="flex items-center gap-1.5"><span className="h-5 w-5 rounded bg-muted flex items-center justify-center"><X className="h-3 w-3 opacity-40" /></span> Access Denied</span>
              <span className="ml-auto flex items-center gap-1 text-amber-600"><AlertTriangle className="h-3.5 w-3.5" /> Changes apply on next login</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── VIEW 2: 4-LEVEL APPROVAL WORKFLOWS ──────────────────────────────────── */}
      {activeView === "workflows" && (
        <div className="space-y-5">
          {/* Header Card with Controls */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-primary" /> Multi-Level Approval Workflows (Up to 4 Levels)
                </CardTitle>
                <CardDescription>
                  Configure automated 1-to-4 layer approval chains across Leasing, Finance, Assets, Procurement, Vendor Management, Operations, Maintenance & HRMS.
                </CardDescription>
              </div>
              <Button onClick={handleOpenAddWorkflow} className="gap-2 shrink-0">
                <Plus className="h-4 w-4" /> Create Workflow
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Module Filter */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mr-1">
                  <Filter className="h-3.5 w-3.5" /> Filter by Module:
                </span>
                {["ALL", "Lease Creation", "Finance & GL", "Asset Management", "Procurement & POs", "Vendor Management", "Maintenance Tickets", "HRMS", "Property CRUD"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedModuleFilter(m)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      selectedModuleFilter === m
                        ? "bg-primary text-primary-foreground border-primary font-medium"
                        : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {m === "ALL" ? "All Modules" : m}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Workflow Cards */}
          <div className="grid gap-4">
            {filteredWorkflows.map((wf) => {
              const totalLevels = wf.total_levels || wf.levels?.length || (wf.tier ? wf.tier : 1);
              const levels = wf.levels || [
                {
                  level: 1,
                  level_name: "Level 1 Review",
                  required_roles: wf.required_approver_roles || ["ADMIN"],
                  sla_hours: wf.escalation_timeout_hours || 24,
                  threshold_min_qar: wf.threshold_min_qar,
                }
              ];

              return (
                <Card
                  key={wf.id}
                  className={`border-l-4 transition-all hover:shadow-md ${
                    wf.is_active ? "border-l-emerald-500" : "border-l-muted opacity-80"
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      {/* Left Details */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={wf.is_active ? "default" : "outline"}
                            className={`text-xs font-mono ${wf.is_active ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                          >
                            {wf.code}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20 font-semibold">
                            {totalLevels} Approval {totalLevels === 1 ? "Layer" : "Layers"}
                          </Badge>
                          <Badge variant="outline" className="text-xs text-violet-600 border-violet-200 dark:border-violet-800">
                            {wf.module}
                          </Badge>
                        </div>

                        <div>
                          <h3 className="font-bold text-base tracking-tight">{wf.title}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{wf.description}</p>
                        </div>

                        {/* Multi-Level Stepper Visualizer (1 to 4 Layers) */}
                        <div className="pt-2">
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Approval Hierarchy ({totalLevels} Stages)
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                            {levels.map((lvl, idx) => (
                              <div
                                key={lvl.level || idx}
                                className="relative p-3 rounded-lg border bg-muted/40 flex flex-col justify-between space-y-2 hover:border-primary/40 transition-colors"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold text-primary">
                                      Stage {lvl.level || idx + 1}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                                      <Clock className="h-2.5 w-2.5" /> {lvl.sla_hours || 24}h SLA
                                    </span>
                                  </div>
                                  <p className="text-xs font-medium text-foreground line-clamp-1">{lvl.level_name}</p>
                                </div>

                                <div className="space-y-1 pt-1 border-t border-border/50">
                                  <div className="text-[10px] text-muted-foreground">Required Roles:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {lvl.required_roles?.map((r) => (
                                      <Badge key={r} variant="secondary" className="text-[10px] px-1 py-0 font-mono">
                                        {r.replace(/_/g, " ")}
                                      </Badge>
                                    ))}
                                  </div>
                                  {lvl.threshold_min_qar !== undefined && lvl.threshold_min_qar > 0 && (
                                    <div className="text-[10px] text-amber-600 font-medium pt-0.5">
                                      Triggers &ge; {lvl.threshold_min_qar.toLocaleString()} QAR
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Action Controls */}
                      <div className="flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleWorkflow(wf.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              wf.is_active ? "bg-emerald-500" : "bg-muted"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                                wf.is_active ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                          <span className={`text-xs font-semibold ${wf.is_active ? "text-emerald-600" : "text-muted-foreground"}`}>
                            {wf.is_active ? "Active" : "Disabled"}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditWorkflow(wf)}
                            className="h-8 text-xs gap-1"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWorkflow(wf.id)}
                            className="h-8 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredWorkflows.length === 0 && (
              <div className="text-center py-12 border rounded-xl bg-card/50 text-muted-foreground text-sm">
                No approval workflows found matching the selected module filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL: CREATE / EDIT WORKFLOW ─────────────────────────────────────── */}
      <Dialog open={workflowModalOpen} onOpenChange={setWorkflowModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              {editingWorkflow ? "Configure Approval Workflow" : "Create Multi-Level Approval Workflow"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveWorkflow} className="space-y-5">
            {/* Top Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Workflow Code *</Label>
                <Input
                  required
                  placeholder="e.g. LEASE_DISCOUNT_T4"
                  value={wfForm.code}
                  onChange={(e) => setWfForm({ ...wfForm, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <Label>Target Module *</Label>
                <Select
                  value={wfForm.module}
                  onValueChange={(val: RbacModule) => setWfForm({ ...wfForm, module: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RBAC_MODULES.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Workflow Title *</Label>
              <Input
                required
                placeholder="e.g. High-Value Procurement Purchase Order Multi-Tier Release"
                value={wfForm.title}
                onChange={(e) => setWfForm({ ...wfForm, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Description / Business Rule Intent</Label>
              <Textarea
                rows={2}
                placeholder="Describe the operational policy and criteria triggering this approval chain..."
                value={wfForm.description}
                onChange={(e) => setWfForm({ ...wfForm, description: e.target.value })}
              />
            </div>

            {/* Approval Layers Selector */}
            <div className="p-4 rounded-xl border bg-muted/30 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h4 className="font-bold text-sm">Number of Approval Layers</h4>
                  <p className="text-xs text-muted-foreground">Select between 1 to 4 sequential sign-off stages</p>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleLevelCountChange(num)}
                      className={`h-9 w-12 rounded-lg font-bold text-sm border transition-all ${
                        wfForm.total_levels === num
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card hover:bg-muted border-border text-foreground"
                      }`}
                    >
                      {num} {num === 1 ? "Lvl" : "Lvls"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Levels Configuration Inputs */}
              <div className="space-y-3 pt-2">
                {wfForm.levels.map((lvl, idx) => (
                  <div key={lvl.level || idx} className="p-3.5 rounded-lg border bg-card space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary text-primary-foreground font-mono text-xs">
                          Level {lvl.level || idx + 1}
                        </Badge>
                        <Input
                          className="h-8 text-xs font-semibold w-64"
                          value={lvl.level_name}
                          onChange={(e) => handleUpdateLevelField(idx, "level_name", e.target.value)}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-muted-foreground">SLA:</Label>
                        <Input
                          type="number"
                          className="h-8 text-xs w-20"
                          value={lvl.sla_hours}
                          onChange={(e) => handleUpdateLevelField(idx, "sla_hours", Number(e.target.value))}
                        />
                        <span className="text-xs text-muted-foreground">hours</span>
                      </div>
                    </div>

                    {/* Roles Selector for this Level */}
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Required Approver Roles (Any of the selected):
                      </Label>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_ROLES_OPTIONS.map((r) => {
                          const isSelected = lvl.required_roles?.includes(r);
                          return (
                            <button
                              key={r}
                              type="button"
                              onClick={() => handleToggleLevelRole(idx, r)}
                              className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                                isSelected
                                  ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                                  : "bg-muted/40 hover:bg-muted text-muted-foreground border-border"
                              }`}
                            >
                              {isSelected && <Check className="h-3 w-3 inline mr-1" />}
                              {r.replace(/_/g, " ")}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Optional Threshold */}
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <Label className="text-xs text-muted-foreground">Min Amount Trigger (QAR)</Label>
                        <Input
                          type="number"
                          className="h-8 text-xs"
                          placeholder="0 for all transactions"
                          value={lvl.threshold_min_qar || 0}
                          onChange={(e) => handleUpdateLevelField(idx, "threshold_min_qar", Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setWorkflowModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Workflow Rule</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

