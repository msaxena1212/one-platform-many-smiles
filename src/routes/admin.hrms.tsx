import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const HrmsModule = lazy(() =>
  import("@/components/hrms-module").then((m) => ({ default: m.HrmsModule }))
);

export const Route = createFileRoute("/admin/hrms")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "dashboard",
  }),
  head: () => ({ meta: [{ title: "Enterprise HRMS & Workforce - Admin" }] }),
  component: AdminHRMSPage,
});

function AdminHRMSPage() {
  return (
    <ModuleSuspense>
      <HrmsModule role="admin" />
    </ModuleSuspense>
  );
}
