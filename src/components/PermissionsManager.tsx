import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Check, X, Shield, Save, ChevronDown, ChevronRight,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DEFAULT_ROLE_ACCESS,
  GLOBAL_MANAGED_ROLES,
  TENANT_MANAGED_ROLES,
  type AppRole,
  type RbacModule,
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
    modules: ["Reports & Analytics", "User Management"],
  },
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
}: {
  targetTenantId?: string | null;
  initialView?: string;
}) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const roles = (targetTenantId ? TENANT_MANAGED_ROLES : GLOBAL_MANAGED_ROLES) as AppRole[];

  useEffect(() => {
    loadPermissions();
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

  if (loading) return (
    <div className="p-12 text-center text-muted-foreground">
      <Shield className="h-8 w-8 mx-auto mb-3 opacity-30 animate-pulse" />
      Loading permissions matrix...
    </div>
  );

  return (
    <div className="space-y-6">
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
    </div>
  );
}
