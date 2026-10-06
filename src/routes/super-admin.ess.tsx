import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const HrmsEssPortal = lazy(() =>
  import("@/components/hrms-ess-portal").then((m) => ({ default: m.HrmsEssPortal }))
);

export const Route = createFileRoute("/super-admin/ess")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "my_details",
  }),
  head: () => ({ meta: [{ title: "My Self-Service (ESS) - Super Admin" }] }),
  component: SuperAdminEssPage,
});

function SuperAdminEssPage() {
  const { tab } = Route.useSearch();
  return (
    <ModuleSuspense>
      <HrmsEssPortal activeTabProp={tab} />
    </ModuleSuspense>
  );
}
