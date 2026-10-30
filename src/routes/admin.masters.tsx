import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const MastersModule = lazy(() =>
  import("@/components/masters-module").then((m) => ({ default: m.MastersModule }))
);

export const Route = createFileRoute("/admin/masters")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "asset_category",
  }),
  head: () => ({ meta: [{ title: "Masters - Admin" }] }),
  component: AdminMasters,
});

function AdminMasters() {
  return (
    <ModuleSuspense>
      <MastersModule role="admin" />
    </ModuleSuspense>
  );
}
