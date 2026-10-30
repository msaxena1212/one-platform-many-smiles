import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const PropertiesModule = lazy(() =>
  import("@/components/properties-module").then((m) => ({ default: m.PropertiesModule }))
);

export const Route = createFileRoute("/prop-mgr/properties")({
  head: () => ({ meta: [{ title: "Properties - Property Manager" }] }),
  component: PropMgrProperties,
});

function PropMgrProperties() {
  return (
    <ModuleSuspense>
      <PropertiesModule role="prop-mgr" />
    </ModuleSuspense>
  );
}
