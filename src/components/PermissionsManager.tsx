import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Check, X, Shield, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

interface Permission {
  id: string;
  role_name: string;
  module_id: string;
  has_access: boolean;
  tenant_id: string | null;
}

export function PermissionsManager({ targetTenantId = null }: { targetTenantId?: string | null }) {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const roles = targetTenantId 
    ? ["PROP_MGR", "LEASING", "FINANCE", "CASHIER", "MAINTENANCE"] // Admin can only manage sub-roles
    : ["SUPER_ADMIN", "ADMIN", "PROP_MGR", "LEASING", "FINANCE", "CASHIER", "MAINTENANCE", "TENANT"]; // Super admin manages all

  const modules = [
    "Tenant Mgmt", "Property CRUD", "Unit Mgmt", "Lease Creation", 
    "Payment Collection", "Receipt Generation", "Maintenance Tickets", 
    "Reports & Analytics", "User Management", "HRMS"
  ];

  useEffect(() => {
    loadPermissions();
  }, [targetTenantId]);

  async function loadPermissions() {
    setLoading(true);
    let query = supabase.from("role_permissions").select("*");
    
    if (targetTenantId) {
      // If tenant specific, we might still want to load global defaults to merge if tenant has none
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

  const togglePermission = (role: string, mod: string) => {
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

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading permissions matrix...</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Role Access Matrix</CardTitle>
          <CardDescription>
            {targetTenantId ? "Manage access for your organization's roles." : "Manage global default platform permissions."}
          </CardDescription>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 pr-4 font-semibold text-muted-foreground">Module</th>
                {roles.map(role => (
                  <th key={role} className="text-center py-3 px-2 font-semibold text-muted-foreground">
                    {role.replace("_", " ")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modules.map(mod => (
                <tr key={mod} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 pr-4 font-medium">{mod}</td>
                  {roles.map(role => {
                    // Find the permission matching this role and module. Prefer tenant-specific if available.
                    let perm = permissions.find(p => p.role_name === role && p.module_id === mod && p.tenant_id === targetTenantId);
                    if (!perm && targetTenantId) {
                       perm = permissions.find(p => p.role_name === role && p.module_id === mod && p.tenant_id === null);
                    }
                    if (!perm && !targetTenantId) {
                       perm = permissions.find(p => p.role_name === role && p.module_id === mod && p.tenant_id === null);
                    }
                    
                    const hasAccess = perm?.has_access ?? false;

                    return (
                      <td key={role} className="text-center py-2 px-2">
                        <button
                          onClick={() => togglePermission(role, mod)}
                          className={`h-8 w-8 rounded-md flex items-center justify-center mx-auto transition-colors ${hasAccess ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                        >
                          {hasAccess ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 opacity-50" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
