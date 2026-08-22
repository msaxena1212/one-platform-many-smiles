import { createFileRoute } from "@tanstack/react-router";
import { FinanceModule } from "@/components/finance-module";

export const Route = createFileRoute("/prop-mgr/finance")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "finance_dashboard",
  }),
  head: () => ({ meta: [{ title: "Finance - Property Manager" }] }),
  component: HostFinance,
});

function HostFinance() {
  return <FinanceModule role="prop-mgr" />;
}
