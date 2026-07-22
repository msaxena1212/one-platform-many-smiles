import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Building2, DoorOpen, FileSignature, Wallet, Wrench, Users, Package, ShieldCheck, FileText } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { to: "/prop-mgr", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/prop-mgr/properties", label: "Properties", icon: <Building2 className="h-4 w-4" /> },
  { to: "/prop-mgr/units", label: "Units", icon: <DoorOpen className="h-4 w-4" /> },
  { to: "/prop-mgr/leasing", label: "Lease Lifecycle", icon: <FileSignature className="h-4 w-4" />, badge: 4 },
  { to: "/prop-mgr/finance", label: "Finance", icon: <Wallet className="h-4 w-4" /> },
  { to: "/prop-mgr/finance/transactions", label: "Transactions", icon: <FileText className="h-4 w-4" />, indent: true },
  { to: "/prop-mgr/assets", label: "Fixed Assets", icon: <Package className="h-4 w-4" /> },
  { to: "/prop-mgr/maintenance", label: "Maintenance", icon: <Wrench className="h-4 w-4" />, badge: 2 },
  { to: "/prop-mgr/approvals", label: "Approvals", icon: <ShieldCheck className="h-4 w-4" />, badge: 3 },
  { to: "/prop-mgr/users", label: "Users & roles", icon: <Users className="h-4 w-4" /> },
];

const titles: Record<string, string> = {
  "/prop-mgr": "Operations Dashboard",
  "/prop-mgr/properties": "Properties",
  "/prop-mgr/units": "Units",
  "/prop-mgr/leasing": "Lease Lifecycle",
  "/prop-mgr/finance": "Finance & Accounting",
  "/prop-mgr/finance/transactions": "Finance Transactions",
  "/prop-mgr/assets": "Fixed Assets & Inventory",
  "/prop-mgr/maintenance": "Maintenance",
  "/prop-mgr/approvals": "Approval Workflows",
  "/prop-mgr/users": "Users & Roles",
};

export const Route = createFileRoute("/prop-mgr")({
  component: HostLayout,
});

function HostLayout() {
  const path = useRouterState({ select: s => s.location.pathname });
  
  // Use a heuristic to find titles for nested dynamic routes if necessary
  let title = "Host Console";
  if (titles[path]) {
    title = titles[path];
  } else if (path.includes("/prop-mgr/manage")) {
    title = "Manage Property";
  } else if (path.includes("/prop-mgr/create")) {
    title = "New Property";
  }

  return (
    <AppShell variant="host" title={title} nav={nav}>
      <Outlet />
    </AppShell>
  );
}
