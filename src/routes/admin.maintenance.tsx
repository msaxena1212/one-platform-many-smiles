import { createFileRoute } from "@tanstack/react-router";
import { MaintenanceModule } from "@/components/maintenance-module";

export const Route = createFileRoute("/admin/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance - Admin" }] }),
  component: AdminMaintenance,
});

function AdminMaintenance() {
  return <MaintenanceModule role="admin" />;
}
