import { createFileRoute } from "@tanstack/react-router";
import { PermissionsManager } from "@/components/PermissionsManager";

export const Route = createFileRoute("/admin/permissions")({
  component: AdminPermissions,
});

function AdminPermissions() {
  // Mock tenant ID to demonstrate tenant-level RBAC overrides
  const tenantId = "tenant-override-123";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Access</h1>
          <p className="text-muted-foreground">Manage module access for your organization's staff.</p>
        </div>
      </div>
      <PermissionsManager targetTenantId={tenantId} />
    </div>
  );
}
