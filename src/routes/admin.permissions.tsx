import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PermissionsManager } from "@/components/PermissionsManager";
import { supabase } from "@/lib/supabase";
import { resolveTenantContextId } from "@/lib/tenant-context";

export const Route = createFileRoute("/admin/permissions")({
  component: AdminPermissions,
});

function AdminPermissions() {
  const [tenantContextId, setTenantContextId] = useState<string | null>(null);

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
          <h1 className="text-2xl font-bold tracking-tight">Role Access</h1>
          <p className="text-muted-foreground">
            Manage module access for your organization's staff roles.
          </p>
        </div>
      </div>
      <PermissionsManager targetTenantId={tenantContextId} />
    </div>
  );
}
