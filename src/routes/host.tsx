import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Building2, DoorOpen, FileSignature, Wallet, Wrench, Users, Package, ShieldCheck, FileText } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { to: "/host", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/host/properties", label: "Properties", icon: <Building2 className="h-4 w-4" /> },
  { to: "/host/units", label: "Units", icon: <DoorOpen className="h-4 w-4" /> },
  { to: "/host/leasing", label: "Lease Lifecycle", icon: <FileSignature className="h-4 w-4" />, badge: 4 },
  { to: "/host/finance", label: "Finance", icon: <Wallet className="h-4 w-4" /> },
  { to: "/host/finance/transactions", label: "Transactions", icon: <FileText className="h-4 w-4" />, indent: true },
  { to: "/host/assets", label: "Fixed Assets", icon: <Package className="h-4 w-4" /> },
  { to: "/host/maintenance", label: "Maintenance", icon: <Wrench className="h-4 w-4" />, badge: 2 },
  { to: "/host/approvals", label: "Approvals", icon: <ShieldCheck className="h-4 w-4" />, badge: 3 },
  { to: "/host/users", label: "Users & roles", icon: <Users className="h-4 w-4" /> },
];

const titles: Record<string, string> = {
  "/host": "Operations Dashboard",
  "/host/properties": "Properties",
  "/host/units": "Units",
  "/host/leasing": "Lease Lifecycle",
  "/host/finance": "Finance & Accounting",
  "/host/finance/transactions": "Finance Transactions",
  "/host/assets": "Fixed Assets & Inventory",
  "/host/maintenance": "Maintenance",
  "/host/approvals": "Approval Workflows",
  "/host/users": "Users & Roles",
};

export const Route = createFileRoute("/host")({
  component: HostLayout,
});

function HostLayout() {
  const path = useRouterState({ select: s => s.location.pathname });
  
  // Use a heuristic to find titles for nested dynamic routes if necessary
  let title = "Host Console";
  if (titles[path]) {
    title = titles[path];
  } else if (path.includes("/host/manage")) {
    title = "Manage Property";
  } else if (path.includes("/host/create")) {
    title = "New Property";
  }

  return (
    <AppShell variant="host" title={title} nav={nav}>
      <Outlet />
    </AppShell>
  );
}
