import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const LeasesModule = lazy(() =>
  import("@/components/leases-module").then((m) => ({ default: m.LeasesModule }))
);

export const Route = createFileRoute("/prop-mgr/leases")({
  head: () => ({ meta: [{ title: "Leases - Property Manager" }] }),
  component: HostLeases,
});

function HostLeases() {
  return (
    <ModuleSuspense>
      <LeasesModule role="prop-mgr" />
    </ModuleSuspense>
  );
}
