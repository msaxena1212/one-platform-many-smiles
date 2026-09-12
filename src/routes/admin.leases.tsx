import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const LeasesModule = lazy(() =>
  import("@/components/leases-module").then((m) => ({ default: m.LeasesModule }))
);

export const Route = createFileRoute("/admin/leases")({
  head: () => ({ meta: [{ title: "Leases - Admin" }] }),
  component: AdminLeases,
});

function AdminLeases() {
  return (
    <ModuleSuspense>
      <LeasesModule role="admin" />
    </ModuleSuspense>
  );
}
