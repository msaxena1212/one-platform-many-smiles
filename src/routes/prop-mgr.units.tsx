import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const UnitsModule = lazy(() =>
  import("@/components/units-module").then((m) => ({ default: m.UnitsModule }))
);

export const Route = createFileRoute("/prop-mgr/units")({
  head: () => ({ meta: [{ title: "Units - Property Manager" }] }),
  component: PropMgrUnits,
});

function PropMgrUnits() {
  return (
    <ModuleSuspense>
      <UnitsModule role="prop-mgr" />
    </ModuleSuspense>
  );
}
