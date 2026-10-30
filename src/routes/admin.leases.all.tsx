import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const LeasesModule = lazy(() =>
  import("@/components/leases-module").then((m) => ({ default: m.LeasesModule }))
);

export const Route = createFileRoute("/admin/leases/all")({
  head: () => ({ meta: [{ title: "All Leases - Admin" }] }),
  component: AdminAllLeases,
});

function AdminAllLeases() {
  return (
    <ModuleSuspense>
      <LeasesModule role="admin" />
    </ModuleSuspense>
  );
}
