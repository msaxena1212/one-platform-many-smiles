import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { requireConsoleAccess } from "@/lib/auth-guards";
import { getConsoleConfig, resolveConsoleTitle } from "@/lib/console-config";

export const Route = createFileRoute("/cashier")({
  beforeLoad: async () => {
    await requireConsoleAccess("cashier");
  },
  component: CashierLayout,
});

function CashierLayout() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const config = getConsoleConfig("cashier");
  const title = resolveConsoleTitle("cashier", path);

  return (
    <AppShell variant={config.variant} title={title} consoleLabel={config.consoleLabel} nav={config.nav} user={config.user}>
      <Outlet />
    </AppShell>
  );
}
