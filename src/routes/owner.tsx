import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell, type NavItem } from "@/components/app-shell";
import { FileText, DollarSign, Building2, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/owner")({
  component: OwnerLayout,
});

function OwnerLayout() {
  const nav: NavItem[] = [
    { label: "Statements", to: "/owner/statements", icon: <FileText className="h-4 w-4" /> },
    { label: "Distributions", to: "/owner/distributions", icon: <DollarSign className="h-4 w-4" /> },
    { label: "Properties", to: "/owner/properties", icon: <Building2 className="h-4 w-4" /> },
    { label: "Approvals", to: "/owner/approvals", icon: <CheckCircle2 className="h-4 w-4" /> },
  ];

  return (
    <AppShell variant="host" title="Owner Portal" nav={nav}>
      <Outlet />
    </AppShell>
  );
}
