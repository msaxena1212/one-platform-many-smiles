import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const ProcurementModule = lazy(() =>
  import("@/components/procurement-module").then((m) => ({ default: m.ProcurementModule }))
);

export const Route = createFileRoute("/admin/procurement")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "requests",
  }),
  head: () => ({ meta: [{ title: "Procurement - Admin" }] }),
  component: AdminProcurement,
});

function AdminProcurement() {
  return (
    <ModuleSuspense>
      <ProcurementModule role="admin" />
    </ModuleSuspense>
  );
}
