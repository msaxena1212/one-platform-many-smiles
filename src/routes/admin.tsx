import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { requireConsoleAccess } from "@/lib/auth-guards";
import { getConsoleConfig, resolveConsoleTitle } from "@/lib/console-config";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    await requireConsoleAccess("admin");
  },
  component: AdminLayout,
});

function AdminLayout() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const config = getConsoleConfig("admin");
  const title = resolveConsoleTitle("admin", path);

  return (
    <AppShell variant={config.variant} title={title} consoleLabel={config.consoleLabel} nav={config.nav} user={config.user}>
      <Outlet />
    </AppShell>
  );
}
