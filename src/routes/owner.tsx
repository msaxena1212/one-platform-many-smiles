import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/owner")({
  component: OwnerLayout,
});

function OwnerLayout() {
  const nav = [
    { label: "Statements", to: "/owner/statements", icon: "FileText" },
    { label: "Distributions", to: "/owner/distributions", icon: "DollarSign" },
    { label: "Properties", to: "/owner/properties", icon: "Building2" },
    { label: "Approvals", to: "/owner/approvals", icon: "CheckCircle2" },
  ];

  return (
    <AppShell variant="host" title="Owner Portal" nav={nav}>
      <Outlet />
    </AppShell>
  );
}
