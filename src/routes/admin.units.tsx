import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const UnitsModule = lazy(() =>
  import("@/components/units-module").then((m) => ({ default: m.UnitsModule }))
);

export const Route = createFileRoute("/admin/units")({
  head: () => ({ meta: [{ title: "Units - Admin" }] }),
  component: AdminUnits,
});

function AdminUnits() {
  return (
    <ModuleSuspense>
      <UnitsModule role="admin" />
    </ModuleSuspense>
  );
}
