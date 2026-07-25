import type { LinkProps } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Box,
  Building2,
  CreditCard,
  DoorOpen,
  FileSignature,
  FileText,
  Globe,
  LayoutDashboard,
  Package,
  Receipt,
  SearchCheck,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import type { NavItem } from "@/components/app-shell";
import type { Profile } from "@/lib/supabase";

export type ConsoleKey =
  | "portal"
  | "prop-mgr"
  | "admin"
  | "super-admin"
  | "leasing"
  | "finance"
  | "cashier"
  | "maintenance";

type TitleRule = {
  match: string;
  title: string;
  mode?: "exact" | "prefix";
};

type ConsoleConfig = {
  variant: "portal" | "admin" | "host";
  consoleLabel: string;
  titleFallback: string;
  user: {
    initials: string;
    name: string;
    meta: string;
  };
  nav: NavItem[];
  titleRules: TitleRule[];
};

const consoleConfigs: Record<ConsoleKey, ConsoleConfig> = {
  portal: {
    variant: "portal",
    consoleLabel: "Tenant Portal",
    titleFallback: "Tenant Portal",
    user: {
      initials: "TP",
      name: "Tenant User",
      meta: "Payments and maintenance self service",
    },
    nav: [
      { to: "/portal", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { to: "/portal/tickets", label: "Maintenance Tickets", icon: <Wrench className="h-4 w-4" /> },
      { to: "/portal/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" /> },
      { to: "/portal/documents", label: "Documents", icon: <FileText className="h-4 w-4" /> },
      { to: "/portal/settings", label: "Account Settings", icon: <Settings className="h-4 w-4" /> },
    ],
    titleRules: [
      { match: "/portal", title: "Tenant Overview" },
      { match: "/portal/tickets", title: "Maintenance Tickets" },
      { match: "/portal/payments", title: "Payments" },
      { match: "/portal/documents", title: "Documents" },
      { match: "/portal/settings", title: "Account Settings" },
    ],
  },
  "prop-mgr": {
    variant: "host",
    consoleLabel: "Property Manager Console",
    titleFallback: "Property Manager Console",
    user: {
      initials: "PM",
      name: "Property Manager",
      meta: "Portfolio operations and approvals",
    },
    nav: [
      { to: "/prop-mgr", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
      { to: "/prop-mgr/properties", label: "Properties", icon: <Building2 className="h-4 w-4" /> },
      { to: "/prop-mgr/units", label: "Units", icon: <DoorOpen className="h-4 w-4" /> },
      { to: "/prop-mgr/leasing", label: "Lease Lifecycle", icon: <FileSignature className="h-4 w-4" /> },
      { to: "/prop-mgr/finance", label: "Finance Overview", icon: <Wallet className="h-4 w-4" /> },
      { to: "/prop-mgr/finance/transactions", label: "Transactions", icon: <FileText className="h-4 w-4" />, indent: true },
      { to: "/prop-mgr/assets", label: "Assets", icon: <Package className="h-4 w-4" /> },
      { to: "/prop-mgr/maintenance", label: "Maintenance", icon: <Wrench className="h-4 w-4" /> },
      { to: "/prop-mgr/approvals", label: "Approvals", icon: <ShieldCheck className="h-4 w-4" /> },
    ],
    titleRules: [
      { match: "/prop-mgr", title: "Operations Dashboard" },
      { match: "/prop-mgr/properties", title: "Properties" },
      { match: "/prop-mgr/units", title: "Units" },
      { match: "/prop-mgr/leasing", title: "Lease Lifecycle" },
      { match: "/prop-mgr/finance", title: "Finance Overview" },
      { match: "/prop-mgr/finance/transactions", title: "Finance Transactions" },
      { match: "/prop-mgr/assets", title: "Assets" },
      { match: "/prop-mgr/maintenance", title: "Maintenance" },
      { match: "/prop-mgr/approvals", title: "Approvals" },
      { match: "/prop-mgr/manage", title: "Manage Property", mode: "prefix" },
      { match: "/prop-mgr/create", title: "New Property", mode: "prefix" },
    ],
  },
  admin: {
    variant: "admin",
    consoleLabel: "Admin Console",
    titleFallback: "Admin Console",
    user: {
      initials: "AD",
      name: "Admin User",
      meta: "Tenant operations and governance",
    },
    nav: [
      { to: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
      { to: "/admin/properties", label: "Properties", icon: <Building2 className="h-4 w-4" /> },
      { to: "/admin/units", label: "Units", icon: <DoorOpen className="h-4 w-4" /> },
      { to: "/admin/leases", label: "Leases", icon: <FileSignature className="h-4 w-4" /> },
      { to: "/admin/finance", label: "Finance", icon: <Wallet className="h-4 w-4" /> },
      { to: "/admin/maintenance", label: "Maintenance", icon: <Wrench className="h-4 w-4" /> },
      { to: "/admin/users", label: "Users", icon: <Users className="h-4 w-4" /> },
      { to: "/admin/permissions", label: "Permissions", icon: <ShieldCheck className="h-4 w-4" /> },
      { to: "/admin/masters", label: "Configuration", icon: <Settings className="h-4 w-4" /> },
      { to: "/admin/audit-logs", label: "Audit Logs", icon: <Activity className="h-4 w-4" /> },
    ],
    titleRules: [
      { match: "/admin", title: "Operations Dashboard" },
      { match: "/admin/dashboard", title: "Operations Dashboard" },
      { match: "/admin/properties", title: "Properties" },
      { match: "/admin/units", title: "Units" },
      { match: "/admin/leases", title: "Leases" },
      { match: "/admin/finance", title: "Finance" },
      { match: "/admin/maintenance", title: "Maintenance" },
      { match: "/admin/users", title: "Users" },
      { match: "/admin/permissions", title: "Permissions" },
      { match: "/admin/masters", title: "Configuration" },
      { match: "/admin/audit-logs", title: "Audit Logs" },
    ],
  },
  "super-admin": {
    variant: "admin",
    consoleLabel: "Super Admin Console",
    titleFallback: "Super Admin Console",
    user: {
      initials: "SA",
      name: "Super Admin",
      meta: "Platform governance and tenancy",
    },
    nav: [
      { to: "/super-admin", label: "Platform Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { to: "/super-admin/tenants", label: "Tenant Management", icon: <Building2 className="h-4 w-4" /> },
      { to: "/super-admin/users", label: "User Management", icon: <Users className="h-4 w-4" /> },
      { to: "/super-admin/permissions", label: "Permissions", icon: <ShieldCheck className="h-4 w-4" /> },
      { to: "/super-admin/billing", label: "Billing & Plans", icon: <CreditCard className="h-4 w-4" /> },
      { to: "/super-admin/analytics", label: "Platform Analytics", icon: <BarChart3 className="h-4 w-4" /> },
      { to: "/super-admin/config", label: "Global Config", icon: <Globe className="h-4 w-4" /> },
      { to: "/super-admin/security", label: "Security & Audit", icon: <ShieldCheck className="h-4 w-4" /> },
      { to: "/super-admin/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    ],
    titleRules: [
      { match: "/super-admin", title: "Platform Overview" },
      { match: "/super-admin/tenants", title: "Tenant Management" },
      { match: "/super-admin/users", title: "User Management" },
      { match: "/super-admin/permissions", title: "Permissions" },
      { match: "/super-admin/billing", title: "Billing & Plans" },
      { match: "/super-admin/analytics", title: "Platform Analytics" },
      { match: "/super-admin/config", title: "Global Configuration" },
      { match: "/super-admin/security", title: "Security & Audit" },
      { match: "/super-admin/notifications", title: "Notifications" },
    ],
  },
  leasing: {
    variant: "admin",
    consoleLabel: "Leasing Console",
    titleFallback: "Leasing Console",
    user: {
      initials: "LS",
      name: "Leasing Officer",
      meta: "Reservations and lease execution",
    },
    nav: [
      { to: "/leasing", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { to: "/leasing/manage", label: "Manage Leases", icon: <FileSignature className="h-4 w-4" /> },
      { to: "/leasing/create", label: "Create Lease", icon: <SearchCheck className="h-4 w-4" /> },
    ],
    titleRules: [
      { match: "/leasing", title: "Leasing Overview" },
      { match: "/leasing/manage", title: "Manage Leases" },
      { match: "/leasing/create", title: "Create Lease" },
    ],
  },
  finance: {
    variant: "admin",
    consoleLabel: "Finance Console",
    titleFallback: "Finance Console",
    user: {
      initials: "FN",
      name: "Finance Officer",
      meta: "Ledger, journals, and receivables",
    },
    nav: [
      { to: "/finance", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { to: "/finance/receivables", label: "Receivables", icon: <Wallet className="h-4 w-4" /> },
      { to: "/finance/ledger", label: "General Ledger", icon: <BookOpen className="h-4 w-4" /> },
      { to: "/finance/journal", label: "Journal Entries", icon: <FileText className="h-4 w-4" /> },
    ],
    titleRules: [
      { match: "/finance", title: "Finance Overview" },
      { match: "/finance/receivables", title: "Receivables" },
      { match: "/finance/ledger", title: "General Ledger" },
      { match: "/finance/journal", title: "Journal Entries" },
    ],
  },
  cashier: {
    variant: "admin",
    consoleLabel: "Cashier Console",
    titleFallback: "Cashier Console",
    user: {
      initials: "CS",
      name: "Cashier",
      meta: "Collections, receipts, and PDCs",
    },
    nav: [
      { to: "/cashier", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { to: "/cashier/receipts", label: "Receipts", icon: <Receipt className="h-4 w-4" /> },
      { to: "/cashier/pdc", label: "PDC Register", icon: <CreditCard className="h-4 w-4" /> },
    ],
    titleRules: [
      { match: "/cashier", title: "Cashier Overview" },
      { match: "/cashier/receipts", title: "Receipts" },
      { match: "/cashier/pdc", title: "PDC Register" },
    ],
  },
  maintenance: {
    variant: "admin",
    consoleLabel: "Maintenance Console",
    titleFallback: "Maintenance Console",
    user: {
      initials: "MT",
      name: "Maintenance Team",
      meta: "Tickets, work orders, and inventory",
    },
    nav: [
      { to: "/maintenance", label: "Overview", icon: <LayoutDashboard className="h-4 w-4" /> },
      { to: "/maintenance/tickets", label: "Tickets", icon: <Ticket className="h-4 w-4" /> },
      { to: "/maintenance/inventory", label: "Inventory", icon: <Box className="h-4 w-4" /> },
    ],
    titleRules: [
      { match: "/maintenance", title: "Maintenance Overview" },
      { match: "/maintenance/tickets", title: "Tickets" },
      { match: "/maintenance/inventory", title: "Inventory" },
    ],
  },
};

const landingRoutes: Partial<Record<Profile["role"] | "GUEST", LinkProps["to"]>> = {
  SUPER_ADMIN: "/super-admin",
  ADMIN: "/admin/dashboard",
  HOST: "/prop-mgr",
  PROP_MGR: "/prop-mgr",
  LEASING: "/leasing",
  FINANCE: "/finance",
  CASHIER: "/cashier",
  MAINTENANCE: "/maintenance",
  TENANT: "/portal",
  GUEST: "/portal",
};

export function getConsoleConfig(key: ConsoleKey) {
  return consoleConfigs[key];
}

export function resolveConsoleTitle(key: ConsoleKey, path: string) {
  const config = consoleConfigs[key];
  const exactMatch = config.titleRules.find((rule) => (rule.mode ?? "exact") === "exact" && rule.match === path);
  if (exactMatch) return exactMatch.title;

  const prefixMatch = config.titleRules.find((rule) => rule.mode === "prefix" && path.startsWith(rule.match));
  return prefixMatch?.title ?? config.titleFallback;
}

export function getLandingRouteForRole(role?: Profile["role"] | "GUEST") {
  return landingRoutes[role ?? "GUEST"] ?? "/portal";
}
