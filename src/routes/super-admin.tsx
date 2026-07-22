import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Settings,
  BarChart3,
  ShieldCheck,
  Globe,
  Bell,
} from "lucide-react";
import { AppShell, type NavItem } from "@/components/app-shell";

const nav: NavItem[] = [
  { to: "/super-admin", label: "Platform Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: "/super-admin/tenants", label: "Tenant Management", icon: <Building2 className="h-4 w-4" /> },
  { to: "/super-admin/users", label: "User Management", icon: <Users className="h-4 w-4" /> },
  { to: "/super-admin/billing", label: "Billing & Plans", icon: <CreditCard className="h-4 w-4" /> },
  { to: "/super-admin/analytics", label: "Platform Analytics", icon: <BarChart3 className="h-4 w-4" /> },
  { to: "/super-admin/config", label: "Global Config", icon: <Globe className="h-4 w-4" /> },
  { to: "/super-admin/security", label: "Security & Audit", icon: <ShieldCheck className="h-4 w-4" /> },
  { to: "/super-admin/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
];

const titles: Record<string, string> = {
  "/super-admin": "Platform Overview",
  "/super-admin/tenants": "Tenant Management",
  "/super-admin/users": "User Management",
  "/super-admin/billing": "Billing & Plans",
  "/super-admin/analytics": "Platform Analytics",
  "/super-admin/config": "Global Configuration",
  "/super-admin/security": "Security & Audit",
  "/super-admin/notifications": "Notification Center",
};

export const Route = createFileRoute("/super-admin")({
  component: SuperAdminLayout,
});

function SuperAdminLayout() {
  const path = useRouterState({ select: s => s.location.pathname });
  const title = titles[path] ?? "Super Admin Console";
  return (
    <AppShell variant="admin" title={title} nav={nav}>
      <Outlet />
    </AppShell>
  );
}
