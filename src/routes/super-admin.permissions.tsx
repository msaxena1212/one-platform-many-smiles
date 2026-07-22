import { createFileRoute } from "@tanstack/react-router";
import { PermissionsManager } from "@/components/PermissionsManager";

export const Route = createFileRoute("/super-admin/permissions")({
  component: SuperAdminPermissions,
});

function SuperAdminPermissions() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Global Permissions</h1>
          <p className="text-muted-foreground">Manage baseline access levels for all platform roles.</p>
        </div>
      </div>
      <PermissionsManager />
    </div>
  );
}
