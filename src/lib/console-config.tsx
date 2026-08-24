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
  Home,
  MapPin,
  FileCheck,
  TrendingUp,
  Database,
  ClipboardList,
  UserCheck,
  Key,
  AlertTriangle,
  PieChart,
  Landmark,
  Scale,
} from "lucide-react";
import type { NavGroup, NavItem, NavModule } from "@/components/app-shell";
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
  nav?: NavItem[];
  navGroups?: NavGroup[];
  /** 3-layer nav: Module → Sub-module → Items */
  navModules?: NavModule[];
  titleRules: TitleRule[];
};

const consoleConfigs: Record<ConsoleKey, ConsoleConfig> = {
  // ── Tenant Portal ──────────────────────────────────────────────────────────
  portal: {
    variant: "portal",
    consoleLabel: "Tenant Portal",
    titleFallback: "Tenant Portal",
    user: {
      initials: "TP",
      name: "Tenant User",
      meta: "Payments and maintenance self service",
    },
    navModules: [
      {
        module: "My Home",
        icon: <Home className="h-4 w-4" />,
        color: "text-sky-500",
        bg: "bg-sky-500/10",
        activeBg: "bg-sky-500",
        groups: [
          {
            group: "Home",
            icon: <Home className="h-3.5 w-3.5" />,
            color: "text-sky-500",
            bg: "bg-sky-500/10",
            items: [
              { to: "/portal", label: "Overview", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
              { to: "/portal/payments", label: "Payments", icon: <CreditCard className="h-3.5 w-3.5" /> },
              { to: "/portal/documents", label: "Documents", icon: <FileText className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
      {
        module: "Services",
        icon: <Wrench className="h-4 w-4" />,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        activeBg: "bg-orange-500",
        groups: [
          {
            group: "Requests",
            icon: <Wrench className="h-3.5 w-3.5" />,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            items: [
              { to: "/portal/tickets", label: "Maintenance Tickets", icon: <Ticket className="h-3.5 w-3.5" /> },
              { to: "/portal/bookings", label: "Bookings", icon: <FileSignature className="h-3.5 w-3.5" /> },
              { to: "/portal/community", label: "Community", icon: <Users className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
      {
        module: "Account",
        icon: <Settings className="h-4 w-4" />,
        color: "text-slate-500",
        bg: "bg-slate-500/10",
        activeBg: "bg-slate-500",
        groups: [
          {
            group: "Account Settings",
            icon: <Settings className="h-3.5 w-3.5" />,
            color: "text-slate-500",
            bg: "bg-slate-500/10",
            items: [
              { to: "/portal/settings", label: "Account Settings", icon: <Settings className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
    ],
    titleRules: [
      { match: "/portal", title: "Tenant Overview" },
      { match: "/portal/tickets", title: "Maintenance Tickets" },
      { match: "/portal/payments", title: "Payments" },
      { match: "/portal/documents", title: "Documents" },
      { match: "/portal/settings", title: "Account Settings" },
      { match: "/portal/bookings", title: "Bookings" },
      { match: "/portal/community", title: "Community" },
    ],
  },



  // ── Property Manager Console ───────────────────────────────────────────────
    "prop-mgr": {
    variant: "host",
    consoleLabel: "Property Manager Console",
    titleFallback: "Property Manager Console",
    user: {
      initials: "PM",
      name: "Property Manager",
      meta: "Portfolio operations and approvals",
    },
    navModules: [
      {
        module: "Portfolio",
        icon: <Building2 className="h-4 w-4" />,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        activeBg: "bg-blue-500",
        groups: [
          {
            group: "Overview",
            icon: <LayoutDashboard className="h-3.5 w-3.5" />,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            items: [
              { to: "/prop-mgr", label: "Dashboard", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/properties", label: "Properties", icon: <Building2 className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/units", label: "Units", icon: <DoorOpen className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
      {
        module: "Leasing",
        icon: <FileSignature className="h-4 w-4" />,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        activeBg: "bg-emerald-500",
        groups: [
          {
            group: "Lease Lifecycle",
            icon: <FileSignature className="h-3.5 w-3.5" />,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            items: [
              { to: "/prop-mgr/leasing", label: "Lease Lifecycle", icon: <FileSignature className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/leases", label: "All Leases", icon: <FileText className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
      {
        module: "Finance",
        icon: <Wallet className="h-4 w-4" />,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        activeBg: "bg-violet-500",
        groups: [
          {
            group: "Setup",
            icon: <Settings className="h-3.5 w-3.5" />,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            items: [
              { to: "/prop-mgr/finance", search: { tab: "financial_year" }, label: "Financial Year", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "region" }, label: "Region", icon: <MapPin className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "vendor_list" }, label: "Vendor List", icon: <Users className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "customer_list" }, label: "Customer List", icon: <UserCheck className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "cost_center" }, label: "Cost Center", icon: <Landmark className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Core Finance",
            icon: <Wallet className="h-3.5 w-3.5" />,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            items: [
              { to: "/prop-mgr/finance", search: { tab: "finance_dashboard" }, label: "Finance Dashboard", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "posting_period" }, label: "Posting Period", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "chart_of_accounts" }, label: "Chart Of Account", icon: <BookOpen className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "journal_ledger" }, label: "Journal Ledger", icon: <FileText className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "credit_debit_builder" }, label: "Credit Debit Builder", icon: <FileText className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Payments",
            icon: <CreditCard className="h-3.5 w-3.5" />,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            items: [
              { to: "/prop-mgr/finance", search: { tab: "grn_cost_mapping" }, label: "GRN Cost Mapping", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "payable_invoice" }, label: "Payable Invoice", icon: <CreditCard className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "journal_voucher" }, label: "Journal Voucher", icon: <FileText className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "payment_voucher" }, label: "Payment Voucher", icon: <CreditCard className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "receivable_invoice" }, label: "Receivable Invoice", icon: <FileText className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "receipt_voucher" }, label: "Receipt Voucher", icon: <Receipt className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Receivables",
            icon: <TrendingUp className="h-3.5 w-3.5" />,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            items: [
              { to: "/prop-mgr/finance", search: { tab: "pdc_management" }, label: "PDC Management", icon: <FileCheck className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "deposits_guarantees" }, label: "Deposits & Guarantees", icon: <Landmark className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "legal_receivables" }, label: "Legal Receivables", icon: <Scale className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "payroll_sync" }, label: "Payroll Sync Engine", icon: <Users className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Banking",
            icon: <Landmark className="h-3.5 w-3.5" />,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            items: [
              { to: "/prop-mgr/finance", search: { tab: "bank" }, label: "Bank", icon: <Building2 className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "bank_account" }, label: "Bank Account", icon: <CreditCard className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "bank_clearance" }, label: "Bank Clearance", icon: <FileCheck className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "bank_reconciliation" }, label: "Bank Reconciliation", icon: <Scale className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "bank_reconciliation_statement_list" }, label: "Reconciliation Statements", icon: <FileText className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Finance Reports",
            icon: <PieChart className="h-3.5 w-3.5" />,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            items: [
              { to: "/prop-mgr/finance", search: { tab: "trial_balance_simple" }, label: "Trial Balance (Simple)", icon: <Scale className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "trial_balance" }, label: "Trial Balance", icon: <Scale className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "profit_and_loss" }, label: "Profit & Loss", icon: <TrendingUp className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "balance_sheet" }, label: "Balance Sheet", icon: <Landmark className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "general_ledger" }, label: "General Ledger", icon: <BookOpen className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "cash_flow_statement" }, label: "Cash Flow Statement", icon: <Wallet className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "cash_book" }, label: "Cash Book", icon: <BookOpen className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "petty_cash_book" }, label: "Petty Cash Book", icon: <BookOpen className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "cash_on_hand" }, label: "Cash On Hand", icon: <Wallet className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Contracts",
            icon: <FileSignature className="h-3.5 w-3.5" />,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            items: [
              { to: "/prop-mgr/finance", search: { tab: "expense_contract" }, label: "Expense Contract", icon: <FileText className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/finance", search: { tab: "revenue_contract" }, label: "Revenue Contract", icon: <FileCheck className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
      {
        module: "Assets",
        icon: <Package className="h-4 w-4" />,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        activeBg: "bg-amber-500",
        groups: [
          {
            group: "Asset Register",
            icon: <Package className="h-3.5 w-3.5" />,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            items: [
              { to: "/prop-mgr/assets", label: "Asset Register", icon: <Package className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
      {
        module: "Operations",
        icon: <Wrench className="h-4 w-4" />,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        activeBg: "bg-orange-500",
        groups: [
          {
            group: "Maintenance",
            icon: <Wrench className="h-3.5 w-3.5" />,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            items: [
              { to: "/prop-mgr/maintenance", label: "Maintenance Tickets", icon: <Wrench className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Management",
            icon: <ShieldCheck className="h-3.5 w-3.5" />,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            items: [
              { to: "/prop-mgr/approvals", label: "Approvals", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
              { to: "/prop-mgr/users", label: "Users", icon: <Users className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
    ],
    titleRules: [
      { match: "/prop-mgr", title: "Operations Dashboard" },
      { match: "/prop-mgr/properties", title: "Properties" },
      { match: "/prop-mgr/units", title: "Units" },
      { match: "/prop-mgr/leasing", title: "Lease Lifecycle" },
      { match: "/prop-mgr/leases", title: "All Leases" },
      { match: "/prop-mgr/finance", title: "Finance" },
      { match: "/prop-mgr/assets", title: "Assets" },
      { match: "/prop-mgr/maintenance", title: "Maintenance" },
      { match: "/prop-mgr/approvals", title: "Approvals" },
      { match: "/prop-mgr/users", title: "Users" },
    ],
  },

  // ── Admin Console ──────────────────────────────────────────────────────────
  admin: {
    variant: "admin",
    consoleLabel: "Staff Console",
    titleFallback: "Staff Console",
    user: {
      initials: "AD",
      name: "Admin User",
      meta: "System administration and oversight",
    },
    navModules: [
      {
        module: "Operations",
        icon: <Building2 className="h-4 w-4" />,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        activeBg: "bg-blue-500",
        groups: [
          {
            group: "Overview",
            icon: <LayoutDashboard className="h-3.5 w-3.5" />,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            items: [
              { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
              { to: "/admin/properties", label: "Properties", icon: <Building2 className="h-3.5 w-3.5" /> },
              { to: "/admin/units", label: "Units", icon: <DoorOpen className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
      {
        module: "Leasing",
        icon: <FileSignature className="h-4 w-4" />,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        activeBg: "bg-emerald-500",
        groups: [
          {
            group: "Lease Lifecycle",
            icon: <FileSignature className="h-3.5 w-3.5" />,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            items: [
              { to: "/admin/leases", label: "All Leases", icon: <FileText className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
      {
        module: "Finance",
        icon: <Wallet className="h-4 w-4" />,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        activeBg: "bg-violet-500",
        groups: [
          {
            group: "Setup",
            icon: <Settings className="h-3.5 w-3.5" />,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            items: [
              { to: "/admin/finance", search: { tab: "financial_year" }, label: "Financial Year", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "region" }, label: "Region", icon: <MapPin className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "vendor_list" }, label: "Vendor List", icon: <Users className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "customer_list" }, label: "Customer List", icon: <UserCheck className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "cost_center" }, label: "Cost Center", icon: <Landmark className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Core Finance",
            icon: <Wallet className="h-3.5 w-3.5" />,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            items: [
              { to: "/admin/finance", search: { tab: "finance_dashboard" }, label: "Finance Dashboard", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "posting_period" }, label: "Posting Period", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "chart_of_accounts" }, label: "Chart Of Account", icon: <BookOpen className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "journal_ledger" }, label: "Journal Ledger", icon: <FileText className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "credit_debit_builder" }, label: "Credit Debit Builder", icon: <FileText className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Payments",
            icon: <CreditCard className="h-3.5 w-3.5" />,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            items: [
              { to: "/admin/finance", search: { tab: "grn_cost_mapping" }, label: "GRN Cost Mapping", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "payable_invoice" }, label: "Payable Invoice", icon: <CreditCard className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "journal_voucher" }, label: "Journal Voucher", icon: <FileText className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "payment_voucher" }, label: "Payment Voucher", icon: <CreditCard className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "receivable_invoice" }, label: "Receivable Invoice", icon: <FileText className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "receipt_voucher" }, label: "Receipt Voucher", icon: <Receipt className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Receivables",
            icon: <TrendingUp className="h-3.5 w-3.5" />,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            items: [
              { to: "/admin/finance", search: { tab: "pdc_management" }, label: "PDC Management", icon: <FileCheck className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "deposits_guarantees" }, label: "Deposits & Guarantees", icon: <Landmark className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "legal_receivables" }, label: "Legal Receivables", icon: <Scale className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "payroll_sync" }, label: "Payroll Sync Engine", icon: <Users className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Banking",
            icon: <Landmark className="h-3.5 w-3.5" />,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            items: [
              { to: "/admin/finance", search: { tab: "bank" }, label: "Bank", icon: <Building2 className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "bank_account" }, label: "Bank Account", icon: <CreditCard className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "bank_clearance" }, label: "Bank Clearance", icon: <FileCheck className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "bank_reconciliation" }, label: "Bank Reconciliation", icon: <Scale className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "bank_reconciliation_statement_list" }, label: "Reconciliation Statements", icon: <FileText className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Finance Reports",
            icon: <PieChart className="h-3.5 w-3.5" />,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            items: [
              { to: "/admin/finance", search: { tab: "trial_balance_simple" }, label: "Trial Balance (Simple)", icon: <Scale className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "trial_balance" }, label: "Trial Balance", icon: <Scale className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "profit_and_loss" }, label: "Profit & Loss", icon: <TrendingUp className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "balance_sheet" }, label: "Balance Sheet", icon: <Landmark className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "general_ledger" }, label: "General Ledger", icon: <BookOpen className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "cash_flow_statement" }, label: "Cash Flow Statement", icon: <Wallet className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "cash_book" }, label: "Cash Book", icon: <BookOpen className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "petty_cash_book" }, label: "Petty Cash Book", icon: <BookOpen className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "cash_on_hand" }, label: "Cash On Hand", icon: <Wallet className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Contracts",
            icon: <FileSignature className="h-3.5 w-3.5" />,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            items: [
              { to: "/admin/finance", search: { tab: "expense_contract" }, label: "Expense Contract", icon: <FileText className="h-3.5 w-3.5" /> },
              { to: "/admin/finance", search: { tab: "revenue_contract" }, label: "Revenue Contract", icon: <FileCheck className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
      {
        module: "Assets",
        icon: <Package className="h-4 w-4" />,
        color: "text-amber-500",
        bg: "bg-amber-500/10",
        activeBg: "bg-amber-500",
        groups: [
          {
            group: "Assets",
            icon: <Package className="h-3.5 w-3.5" />,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            items: [
              { to: "/admin/assets", label: "Assets", icon: <Package className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
      {
        module: "Operations",
        icon: <Wrench className="h-4 w-4" />,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        activeBg: "bg-orange-500",
        groups: [
          {
            group: "Maintenance",
            icon: <Wrench className="h-3.5 w-3.5" />,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            items: [
              { to: "/admin/maintenance", label: "Maintenance", icon: <Wrench className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
      {
        module: "System & Config",
        icon: <Settings className="h-4 w-4" />,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        activeBg: "bg-blue-500",
        groups: [
          {
            group: "HRMS Masters",
            icon: <Users className="h-3.5 w-3.5" />,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            items: [
              { to: "/admin/masters", search: { tab: "gender" }, label: "Genders", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/admin/masters", search: { tab: "department" }, label: "Departments", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/admin/masters", search: { tab: "designation" }, label: "Designations", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/admin/masters", search: { tab: "employment_type" }, label: "Employment Types", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/admin/masters", search: { tab: "work_location" }, label: "Work Locations", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/admin/masters", search: { tab: "employee_status" }, label: "Employee Statuses", icon: <Settings className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Asset Masters",
            icon: <Package className="h-3.5 w-3.5" />,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            items: [
              { to: "/admin/masters", search: { tab: "asset_category" }, label: "Asset Categories", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/admin/masters", search: { tab: "asset_subcategory" }, label: "Asset Subcategories", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/admin/masters", search: { tab: "asset_ownership_type" }, label: "Ownership Types", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/admin/masters", search: { tab: "asset_condition" }, label: "Conditions", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/admin/masters", search: { tab: "asset_status" }, label: "Statuses", icon: <Settings className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "System Masters",
            icon: <Settings className="h-3.5 w-3.5" />,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            items: [
              { to: "/admin/masters", search: { tab: "ticket_categories" }, label: "Ticket Categories", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/admin/masters", search: { tab: "facilities" }, label: "Facilities", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/admin/masters", search: { tab: "payment_modes" }, label: "Payment Modes", icon: <Settings className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Admin",
            icon: <ShieldCheck className="h-3.5 w-3.5" />,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            items: [
              { to: "/admin/users", label: "Users", icon: <Users className="h-3.5 w-3.5" /> },
              { to: "/admin/hrms", label: "HRMS", icon: <Users className="h-3.5 w-3.5" /> },
              { to: "/admin/audit-logs", label: "Audit Logs", icon: <FileText className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
    ],
    titleRules: [
      { match: "/admin", title: "Staff Console" },
      { match: "/admin/properties", title: "Properties" },
      { match: "/admin/units", title: "Units" },
      { match: "/admin/leasing", title: "Lease Lifecycle" },
      { match: "/admin/leases", title: "All Leases" },
      { match: "/admin/finance", title: "Finance" },
      { match: "/admin/assets", title: "Assets" },
      { match: "/admin/maintenance", title: "Maintenance" },
      { match: "/admin/masters", title: "Masters & Config" },
      { match: "/admin/users", title: "Users" },
      { match: "/admin/hrms", title: "HRMS" },
      { match: "/admin/audit-logs", title: "Audit Logs" },
    ],
  },
  // ── Super Admin Console ───────────────────────────────────────────────────
  "super-admin": {
    variant: "admin",
    consoleLabel: "Super Admin Console",
    titleFallback: "Super Admin Console",
    user: {
      initials: "SA",
      name: "Super Admin",
      meta: "Platform governance and tenancy",
    },
    navModules: [
      {
        module: "Platform",
        icon: <Globe className="h-4 w-4" />,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        activeBg: "bg-blue-500",
        groups: [
          {
            group: "Overview",
            icon: <LayoutDashboard className="h-3.5 w-3.5" />,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            items: [
              { to: "/super-admin", label: "Platform Overview", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
              { to: "/super-admin/analytics", label: "Platform Analytics", icon: <BarChart3 className="h-3.5 w-3.5" /> },
              { to: "/super-admin/config", label: "Global Config", icon: <Globe className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
      {
        module: "Tenants",
        icon: <Building2 className="h-4 w-4" />,
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
        activeBg: "bg-indigo-500",
        groups: [
          {
            group: "Tenant Management",
            icon: <Building2 className="h-3.5 w-3.5" />,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            items: [
              { to: "/super-admin/tenants", label: "Tenant Management", icon: <Building2 className="h-3.5 w-3.5" /> },
              { to: "/super-admin/billing", label: "Billing & Plans", icon: <CreditCard className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
      {
        module: "Security",
        icon: <ShieldCheck className="h-4 w-4" />,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
        activeBg: "bg-rose-500",
        groups: [
          {
            group: "Access Control",
            icon: <ShieldCheck className="h-3.5 w-3.5" />,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            items: [
              { to: "/super-admin/users", label: "User Management", icon: <Users className="h-3.5 w-3.5" /> },
              { to: "/super-admin/permissions", label: "Permissions", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
              { to: "/super-admin/security", label: "Security & Audit", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
              { to: "/super-admin/notifications", label: "Notifications", icon: <Bell className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
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

  // ── Leasing Console ───────────────────────────────────────────────────────
  leasing: {
    variant: "admin",
    consoleLabel: "Leasing Console",
    titleFallback: "Leasing Console",
    user: {
      initials: "LS",
      name: "Leasing Officer",
      meta: "Reservations and lease execution",
    },
    navModules: [
      {
        module: "Leasing",
        icon: <FileSignature className="h-4 w-4" />,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        activeBg: "bg-emerald-500",
        groups: [
          {
            group: "Lease Lifecycle",
            icon: <FileSignature className="h-3.5 w-3.5" />,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            items: [
              { to: "/leasing", label: "Overview", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
              { to: "/leasing/manage", label: "Manage Leases", icon: <ClipboardList className="h-3.5 w-3.5" /> },
              { to: "/leasing/create", label: "Create Lease", icon: <SearchCheck className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
    ],
    titleRules: [
      { match: "/leasing", title: "Leasing Overview" },
      { match: "/leasing/manage", title: "Manage Leases" },
      { match: "/leasing/create", title: "Create Lease" },
    ],
  },

  // ── Finance Console ───────────────────────────────────────────────────────
  finance: {
    variant: "admin",
    consoleLabel: "Finance Console",
    titleFallback: "Finance Operations",
    user: {
      initials: "FI",
      name: "Finance Controller",
      meta: "Financial reporting and ledger management",
    },
    navModules: [
      {
        module: "Finance",
        icon: <Wallet className="h-4 w-4" />,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        activeBg: "bg-violet-500",
        groups: [
          {
            group: "Setup",
            icon: <Settings className="h-3.5 w-3.5" />,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            items: [
              { to: "/finance", search: { tab: "financial_year" }, label: "Financial Year", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "region" }, label: "Region", icon: <MapPin className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "vendor_list" }, label: "Vendor List", icon: <Users className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "customer_list" }, label: "Customer List", icon: <UserCheck className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "cost_center" }, label: "Cost Center", icon: <Landmark className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Core Finance",
            icon: <Wallet className="h-3.5 w-3.5" />,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            items: [
              { to: "/finance", search: { tab: "finance_dashboard" }, label: "Finance Dashboard", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "posting_period" }, label: "Posting Period", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "chart_of_accounts" }, label: "Chart Of Account", icon: <BookOpen className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "journal_ledger" }, label: "Journal Ledger", icon: <FileText className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "credit_debit_builder" }, label: "Credit Debit Builder", icon: <FileText className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Payments",
            icon: <CreditCard className="h-3.5 w-3.5" />,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            items: [
              { to: "/finance", search: { tab: "grn_cost_mapping" }, label: "GRN Cost Mapping", icon: <Settings className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "payable_invoice" }, label: "Payable Invoice", icon: <CreditCard className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "journal_voucher" }, label: "Journal Voucher", icon: <FileText className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "payment_voucher" }, label: "Payment Voucher", icon: <CreditCard className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "receivable_invoice" }, label: "Receivable Invoice", icon: <FileText className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "receipt_voucher" }, label: "Receipt Voucher", icon: <Receipt className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Receivables",
            icon: <TrendingUp className="h-3.5 w-3.5" />,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            items: [
              { to: "/finance", search: { tab: "pdc_management" }, label: "PDC Management", icon: <FileCheck className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "deposits_guarantees" }, label: "Deposits & Guarantees", icon: <Landmark className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "legal_receivables" }, label: "Legal Receivables", icon: <Scale className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "payroll_sync" }, label: "Payroll Sync Engine", icon: <Users className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Banking",
            icon: <Landmark className="h-3.5 w-3.5" />,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            items: [
              { to: "/finance", search: { tab: "bank" }, label: "Bank", icon: <Building2 className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "bank_account" }, label: "Bank Account", icon: <CreditCard className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "bank_clearance" }, label: "Bank Clearance", icon: <FileCheck className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "bank_reconciliation" }, label: "Bank Reconciliation", icon: <Scale className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "bank_reconciliation_statement_list" }, label: "Reconciliation Statements", icon: <FileText className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Finance Reports",
            icon: <PieChart className="h-3.5 w-3.5" />,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            items: [
              { to: "/finance", search: { tab: "trial_balance_simple" }, label: "Trial Balance (Simple)", icon: <Scale className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "trial_balance" }, label: "Trial Balance", icon: <Scale className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "profit_and_loss" }, label: "Profit & Loss", icon: <TrendingUp className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "balance_sheet" }, label: "Balance Sheet", icon: <Landmark className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "general_ledger" }, label: "General Ledger", icon: <BookOpen className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "cash_flow_statement" }, label: "Cash Flow Statement", icon: <Wallet className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "cash_book" }, label: "Cash Book", icon: <BookOpen className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "petty_cash_book" }, label: "Petty Cash Book", icon: <BookOpen className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "cash_on_hand" }, label: "Cash On Hand", icon: <Wallet className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Procurement",
            icon: <ClipboardList className="h-3.5 w-3.5" />,
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
            items: [
              { to: "/finance/procurement", label: "Procurement Control Tower", icon: <ClipboardList className="h-3.5 w-3.5" /> },
            ],
          },
          {
            group: "Contracts",
            icon: <FileSignature className="h-3.5 w-3.5" />,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            items: [
              { to: "/finance", search: { tab: "expense_contract" }, label: "Expense Contract", icon: <FileText className="h-3.5 w-3.5" /> },
              { to: "/finance", search: { tab: "revenue_contract" }, label: "Revenue Contract", icon: <FileCheck className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
    ],
    titleRules: [
      { match: "/finance/procurement", title: "Procurement Control Tower" },
      { match: "/finance", title: "Finance" },
    ],
  },
  // ── Cashier Console ───────────────────────────────────────────────────────
  cashier: {
    variant: "admin",
    consoleLabel: "Cashier Console",
    titleFallback: "Cashier Console",
    user: {
      initials: "CS",
      name: "Cashier",
      meta: "Collections, receipts, and PDCs",
    },
    navModules: [
      {
        module: "Collections",
        icon: <Receipt className="h-4 w-4" />,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        activeBg: "bg-violet-500",
        groups: [
          {
            group: "Cash Desk",
            icon: <Receipt className="h-3.5 w-3.5" />,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
            items: [
              { to: "/cashier", label: "Overview", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
              { to: "/cashier/receipts", label: "Receipts", icon: <Receipt className="h-3.5 w-3.5" /> },
              { to: "/cashier/pdc", label: "PDC Register", icon: <CreditCard className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
    ],
    titleRules: [
      { match: "/cashier", title: "Cashier Overview" },
      { match: "/cashier/receipts", title: "Receipts" },
      { match: "/cashier/pdc", title: "PDC Register" },
    ],
  },

  // ── Maintenance Console ───────────────────────────────────────────────────
  maintenance: {
    variant: "admin",
    consoleLabel: "Maintenance Console",
    titleFallback: "Maintenance Console",
    user: {
      initials: "MT",
      name: "Maintenance Team",
      meta: "Tickets, work orders, and inventory",
    },
    navModules: [
      {
        module: "Maintenance",
        icon: <Wrench className="h-4 w-4" />,
        color: "text-orange-500",
        bg: "bg-orange-500/10",
        activeBg: "bg-orange-500",
        groups: [
          {
            group: "Work Orders",
            icon: <Wrench className="h-3.5 w-3.5" />,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            items: [
              { to: "/maintenance", label: "Overview", icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
              { to: "/maintenance/tickets", label: "Tickets", icon: <Ticket className="h-3.5 w-3.5" /> },
              { to: "/maintenance/inventory", label: "Inventory", icon: <Box className="h-3.5 w-3.5" /> },
            ],
          },
        ],
      },
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
