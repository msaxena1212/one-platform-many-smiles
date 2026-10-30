import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const ProcurementModule = lazy(() =>
  import("@/components/procurement-module").then((m) => ({ default: m.ProcurementModule }))
);

export const Route = createFileRoute("/prop-mgr/procurement")({
  head: () => ({ meta: [{ title: "Procurement - Property Manager" }] }),
  component: PropMgrProcurement,
});

function PropMgrProcurement() {
  return (
    <ModuleSuspense>
      <ProcurementModule role="prop-mgr" />
    </ModuleSuspense>
  );
}
