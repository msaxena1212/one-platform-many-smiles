import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Building2, DoorOpen, FileSignature, Wallet, Wrench, Users, Settings, Activity } from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/admin/properties", label: "Properties", icon: <Building2 className="h-4 w-4" /> },
  { to: "/admin/units", label: "Units", icon: <DoorOpen className="h-4 w-4" /> },
  { to: "/admin/leases", label: "Leases", icon: <FileSignature className="h-4 w-4" />, badge: 1 },
  { to: "/admin/finance", label: "Finance", icon: <Wallet className="h-4 w-4" /> },
  { to: "/admin/maintenance", label: "Maintenance", icon: <Wrench className="h-4 w-4" />, badge: 5 },
  { to: "/admin/users", label: "Users & roles", icon: <Users className="h-4 w-4" /> },
  { to: "/admin/masters", label: "Configuration", icon: <Settings className="h-4 w-4" /> },
  { to: "/admin/audit-logs", label: "Audit Logs", icon: <Activity className="h-4 w-4" /> },
];

const titles: Record<string, string> = {
  "/admin": "Operations dashboard",
  "/admin/properties": "Properties",
  "/admin/units": "Units",
  "/admin/leases": "Leases & PDC",
  "/admin/finance": "Finance",
  "/admin/maintenance": "Maintenance",
  "/admin/users": "Users & roles",
  "/admin/masters": "System Configuration",
  "/admin/audit-logs": "Audit Logs",
};

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const path = useRouterState({ select: s => s.location.pathname });
  const title = titles[path] ?? "Staff console";
  return (
    <AppShell variant="admin" title={title} nav={nav}>
      <Outlet />
    </AppShell>
  );
}
