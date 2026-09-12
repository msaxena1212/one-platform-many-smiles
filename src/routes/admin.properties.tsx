import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const PropertiesModule = lazy(() =>
  import("@/components/properties-module").then((m) => ({ default: m.PropertiesModule }))
);

export const Route = createFileRoute("/admin/properties")({
  head: () => ({ meta: [{ title: "Properties - Admin" }] }),
  component: AdminProperties,
});

function AdminProperties() {
  return (
    <ModuleSuspense>
      <PropertiesModule role="admin" />
    </ModuleSuspense>
  );
}
