import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { requireConsoleAccess } from "@/lib/auth-guards";
import { getConsoleConfig, resolveConsoleTitle } from "@/lib/console-config";

export const Route = createFileRoute("/prop-mgr")({
  beforeLoad: async () => {
    await requireConsoleAccess("prop-mgr");
  },
  component: PropertyManagerLayout,
});

function PropertyManagerLayout() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const config = getConsoleConfig("prop-mgr");
  const title = resolveConsoleTitle("prop-mgr", path);

  return (
    <AppShell variant={config.variant} title={title} consoleLabel={config.consoleLabel} nav={config.nav} user={config.user}>
      <Outlet />
    </AppShell>
  );
}
