import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const MaintenanceModule = lazy(() =>
  import("@/components/maintenance-module").then((m) => ({ default: m.MaintenanceModule }))
);

export const Route = createFileRoute("/admin/maintenance")({
  head: () => ({ meta: [{ title: "Maintenance - Admin" }] }),
  component: AdminMaintenance,
});

function AdminMaintenance() {
  return (
    <ModuleSuspense>
      <MaintenanceModule role="admin" />
    </ModuleSuspense>
  );
}
