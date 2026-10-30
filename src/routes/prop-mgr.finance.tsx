import { lazy } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ModuleSuspense } from "@/components/module-suspense";

const FinanceModule = lazy(() =>
  import("@/components/finance-module").then((m) => ({ default: m.FinanceModule }))
);

export const Route = createFileRoute("/prop-mgr/finance")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "finance_dashboard",
  }),
  head: () => ({ meta: [{ title: "Finance - Property Manager" }] }),
  component: HostFinance,
});

function HostFinance() {
  return (
    <ModuleSuspense>
      <FinanceModule role="prop-mgr" />
    </ModuleSuspense>
  );
}
