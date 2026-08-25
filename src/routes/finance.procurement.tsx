import { createFileRoute } from "@tanstack/react-router";
import { requireConsoleAccess } from "@/lib/auth-guards";
import { ProcurementModule } from "@/components/procurement-module";

export const Route = createFileRoute("/finance/procurement")({
  beforeLoad: async () => { await requireConsoleAccess("finance"); },
  component: () => <ProcurementModule role="admin" />,
});
