import { createFileRoute } from "@tanstack/react-router";
import { MaintenanceModule } from "@/components/maintenance-module";

export const Route = createFileRoute("/prop-mgr/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance - Property Manager" }] }),
  component: HostMaintenance,
});

function HostMaintenance() {
  return <MaintenanceModule role="prop-mgr" />;
}
