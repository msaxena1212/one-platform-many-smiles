import { createFileRoute } from "@tanstack/react-router";
import { FinanceModule } from "@/components/finance-module";

export const Route = createFileRoute("/finance/")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
  }),
  head: () => ({ meta: [{ title: "Finance Operations" }] }),
  component: FinanceIndexPage,
});

function FinanceIndexPage() {
  return <FinanceModule role="finance" />;
}
