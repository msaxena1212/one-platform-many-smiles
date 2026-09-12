import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PermissionsManager } from "@/components/PermissionsManager";
import { supabase } from "@/lib/supabase";
import { resolveTenantContextId } from "@/lib/tenant-context";

export const Route = createFileRoute("/admin/permissions")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : "matrix",
  }),
  component: AdminPermissions,
});

function AdminPermissions() {
  const [tenantContextId, setTenantContextId] = useState<string | null>(null);
  const search = useSearch({ from: "/admin/permissions" });
  const activeTab = search.tab === "workflows" ? "workflows" : "matrix";

  useEffect(() => {
    let mounted = true;

    async function loadTenantContext() {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session?.user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (!mounted) return;
      setTenantContextId(resolveTenantContextId((profile as any) ?? null, session.user));
    }

    loadTenantContext();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {activeTab === "workflows" ? "Approval Workflows" : "Role Permissions & Access Matrix"}
          </h1>
          <p className="text-muted-foreground">
            {activeTab === "workflows"
              ? "Configure automated 1-to-4 layer approval chains across Leasing, Finance, Assets, Procurement, Vendor Management, Operations, Maintenance & HRMS."
              : "Manage granular module access for your organization's staff roles."}
          </p>
        </div>
      </div>
      <PermissionsManager key={activeTab} targetTenantId={tenantContextId} initialView={activeTab} />
    </div>
  );
}
