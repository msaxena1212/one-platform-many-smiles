import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const MaintenanceModule = lazy(() =>
  import("@/components/maintenance-module").then((m) => ({ default: m.MaintenanceModule }))
);

export const Route = createFileRoute("/prop-mgr/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance - Property Manager" }] }),
  component: HostMaintenance,
});

function HostMaintenance() {
  return (
    <ModuleSuspense>
      <MaintenanceModule role="prop-mgr" />
    </ModuleSuspense>
  );
}
