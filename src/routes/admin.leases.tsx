import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const LeasingPage = lazy(() => import("@/components/leasing-module"));

export const Route = createFileRoute("/admin/leases")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "agreement",
  }),
  head: () => ({ meta: [{ title: "Leasing - Admin" }] }),
  component: AdminLeases,
});

function AdminLeases() {
  return (
    <ModuleSuspense>
      <LeasingPage role="admin" />
    </ModuleSuspense>
  );
}
