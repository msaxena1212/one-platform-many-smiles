import { createFileRoute } from "@tanstack/react-router";
import { FinanceModule } from "@/components/finance-module";

export const Route = createFileRoute("/admin/finance")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as string) || "finance_dashboard",
  }),
  head: () => ({ meta: [{ title: "Finance - Admin" }] }),
  component: AdminFinance,
});

function AdminFinance() {
  return <FinanceModule role="admin" />;
}
