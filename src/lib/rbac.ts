import type { ConsoleKey } from "@/lib/console-config";
import type { Profile } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

export type AppRole = Profile["role"] | "GUEST";

export const RBAC_MODULES = [
  "Tenant Mgmt",
  "Property CRUD",
  "Unit Mgmt",
  "Lease Creation",
  "Payment Collection",
  "Receipt Generation",
  "Finance & GL",
  "Asset Management",
  "Procurement & POs",
  "Vendor Management",
  "Maintenance Tickets",
  "HRMS",
  "Workforce & Shifts",
  "Payroll & Salary",
  "Performance & KPA",
  "Reports & Analytics",
  "User Management",
] as const;

export type RbacModule = (typeof RBAC_MODULES)[number];

export type PermissionAction = "view" | "create" | "edit" | "delete" | "approve";

export const GLOBAL_MANAGED_ROLES: AppRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "PROP_MGR",
  "LEASING",
  "FINANCE",
  "CASHIER",
  "MAINTENANCE",
  "TENANT",
];

export const TENANT_MANAGED_ROLES: AppRole[] = ["PROP_MGR", "LEASING", "FINANCE", "CASHIER", "MAINTENANCE"];

export interface ApprovalWorkflowLevel {
  level: number; // 1, 2, 3, 4
  level_name: string; // e.g. "Level 1: Operational Review", "Level 2: Head of Department", "Level 3: Finance Controller", "Level 4: Super Admin / Board"
  required_roles: AppRole[];
  sla_hours: number;
  threshold_min_qar?: number;
  auto_approve_if_below?: boolean;
}

export interface ApprovalWorkflowRule {
  id: string;
  code: string;
  title: string;
  module: RbacModule;
  description: string;
  total_levels: number; // 1 to 4
  levels: ApprovalWorkflowLevel[];
  is_active: boolean;
  tier?: number;
  threshold_min_qar?: number;
  threshold_max_qar?: number;
  required_approver_roles?: AppRole[];
  auto_approve_below_min?: boolean;
  escalation_timeout_hours?: number;
}

export const DEFAULT_APPROVAL_WORKFLOWS: ApprovalWorkflowRule[] = [
  // 1. LEASING (3-Level Workflow)
  {
    id: "wf-lease-contract",
    code: "LEASING_EXEC_WFLOW",
    title: "Lease Contract, Exceptions & Discount Overrides",
    module: "Lease Creation",
    description: "Multi-level approval for lease contracts, rent concessions, payment terms, and deposit waivers.",
    total_levels: 4,
    is_active: true,
    levels: [
      { level: 1, level_name: "Level 1: Leasing Specialist", required_roles: ["LEASING"], sla_hours: 12 },
      { level: 2, level_name: "Level 2: Property Manager Verification", required_roles: ["PROP_MGR", "ADMIN"], sla_hours: 24, threshold_min_qar: 1000 },
      { level: 3, level_name: "Level 3: Finance Commercial Sign-off", required_roles: ["FINANCE"], sla_hours: 24, threshold_min_qar: 5000 },
      { level: 4, level_name: "Level 4: Super Admin / Director Authorization", required_roles: ["SUPER_ADMIN"], sla_hours: 48, threshold_min_qar: 20000 },
    ],
  },
  // 2. FINANCE (4-Level Workflow)
  {
    id: "wf-finance-disburse",
    code: "FIN_DISBURSE_WFLOW",
    title: "High-Value Payments, Journal Adjustments & Refunds",
    module: "Finance & GL",
    description: "Financial disbursements, credit/debit adjustments, ledger corrections, and bank transfers.",
    total_levels: 4,
    is_active: true,
    levels: [
      { level: 1, level_name: "Level 1: Cashier / Accountant Initiation", required_roles: ["CASHIER", "FINANCE"], sla_hours: 12 },
      { level: 2, level_name: "Level 2: Senior Finance Controller", required_roles: ["FINANCE", "ADMIN"], sla_hours: 24, threshold_min_qar: 5000 },
      { level: 3, level_name: "Level 3: General Operations Admin", required_roles: ["ADMIN"], sla_hours: 24, threshold_min_qar: 25000 },
      { level: 4, level_name: "Level 4: Super Admin / CFO Final Sign-off", required_roles: ["SUPER_ADMIN"], sla_hours: 48, threshold_min_qar: 100000 },
    ],
  },
  // 3. ASSETS (3-Level Workflow)
  {
    id: "wf-asset-lifecycle",
    code: "ASSET_WRITE_REVAL",
    title: "Asset Acquisition, Revaluation & Write-off Disposal",
    module: "Asset Management",
    description: "Approval chain for asset capitalizations, transfers, revaluations, and scrap write-offs.",
    total_levels: 3,
    is_active: true,
    levels: [
      { level: 1, level_name: "Level 1: Facility & Asset Custodian", required_roles: ["MAINTENANCE", "PROP_MGR"], sla_hours: 24 },
      { level: 2, level_name: "Level 2: Operations / Admin Review", required_roles: ["ADMIN"], sla_hours: 24, threshold_min_qar: 5000 },
      { level: 3, level_name: "Level 3: Finance Asset Controller & Super Admin", required_roles: ["FINANCE", "SUPER_ADMIN"], sla_hours: 48, threshold_min_qar: 25000 },
    ],
  },
  // 4. PROCUREMENT (4-Level Workflow)
  {
    id: "wf-proc-po-complete",
    code: "PROC_PO_TIER4",
    title: "Procurement Requisition, RFQ Award & Purchase Order",
    module: "Procurement & POs",
    description: "Full 4-level requisition to PO award cycle based on commercial threshold.",
    total_levels: 4,
    is_active: true,
    levels: [
      { level: 1, level_name: "Level 1: Department Requester / Site Head", required_roles: ["PROP_MGR", "MAINTENANCE"], sla_hours: 12 },
      { level: 2, level_name: "Level 2: Procurement Officer Quotation Review", required_roles: ["ADMIN"], sla_hours: 24, threshold_min_qar: 2000 },
      { level: 3, level_name: "Level 3: Finance Budgetary Verification", required_roles: ["FINANCE"], sla_hours: 24, threshold_min_qar: 15000 },
      { level: 4, level_name: "Level 4: Super Admin Final Purchase Release", required_roles: ["SUPER_ADMIN"], sla_hours: 48, threshold_min_qar: 50000 },
    ],
  },
  // 5. VENDOR MANAGEMENT (3-Level Workflow)
  {
    id: "wf-vendor-onboard",
    code: "VENDOR_KYC_APPR",
    title: "Vendor Onboarding, Bank Details & Qualification",
    module: "Vendor Management",
    description: "Verification of vendor documentation, trade license, bank details, and payment terms.",
    total_levels: 3,
    is_active: true,
    levels: [
      { level: 1, level_name: "Level 1: Vendor Relations Coordinator", required_roles: ["ADMIN", "PROP_MGR"], sla_hours: 24 },
      { level: 2, level_name: "Level 2: Finance Compliance & Bank Audit", required_roles: ["FINANCE"], sla_hours: 24 },
      { level: 3, level_name: "Level 3: Super Admin Commercial Approval", required_roles: ["SUPER_ADMIN"], sla_hours: 48 },
    ],
  },
  // 6. MAINTENANCE (4-Level Workflow)
  {
    id: "wf-maint-job-flow",
    code: "MAINT_WO_TIER4",
    title: "Maintenance Work Orders, Vendor Jobs & Chargebacks",
    module: "Maintenance Tickets",
    description: "Routine to emergency maintenance repairs, third-party vendor jobs, and tenant chargebacks.",
    total_levels: 4,
    is_active: true,
    levels: [
      { level: 1, level_name: "Level 1: Maintenance Lead / Facility Engr", required_roles: ["MAINTENANCE"], sla_hours: 8 },
      { level: 2, level_name: "Level 2: Property Manager Estimation Review", required_roles: ["PROP_MGR"], sla_hours: 12, threshold_min_qar: 2500 },
      { level: 3, level_name: "Level 3: Operations Administrator", required_roles: ["ADMIN"], sla_hours: 24, threshold_min_qar: 10000 },
      { level: 4, level_name: "Level 4: Finance & Super Admin Escalation", required_roles: ["FINANCE", "SUPER_ADMIN"], sla_hours: 48, threshold_min_qar: 30000 },
    ],
  },
  // 7. HRMS (4-Level Workflow)
  {
    id: "wf-hrms-lifecycle",
    code: "HRMS_MULTI_LEVEL",
    title: "HR Leaves, Loans, Salary Revisions & FNF Settlement",
    module: "HRMS",
    description: "Employee leave requests, payroll cycle disbursement, salary adjustments, and gratuity clearance.",
    total_levels: 4,
    is_active: true,
    levels: [
      { level: 1, level_name: "Level 1: Reporting Manager / Supervisor", required_roles: ["PROP_MGR", "ADMIN"], sla_hours: 24 },
      { level: 2, level_name: "Level 2: HR Operations & Attendance Officer", required_roles: ["ADMIN"], sla_hours: 24 },
      { level: 3, level_name: "Level 3: Finance & Payroll Auditor", required_roles: ["FINANCE"], sla_hours: 48, threshold_min_qar: 5000 },
      { level: 4, level_name: "Level 4: Super Admin / Managing Director", required_roles: ["SUPER_ADMIN"], sla_hours: 72, threshold_min_qar: 25000 },
    ],
  },
  // 8. OPERATIONS (2-Level Workflow)
  {
    id: "wf-ops-ppm",
    code: "OPS_PPM_FACILITY",
    title: "Facility Schedules, PPM & Unit Inspections",
    module: "Property CRUD",
    description: "Approval for preventive maintenance plans, unit inspection clearances, and handover signs.",
    total_levels: 2,
    is_active: true,
    levels: [
      { level: 1, level_name: "Level 1: Property Manager / Operations Lead", required_roles: ["PROP_MGR", "MAINTENANCE"], sla_hours: 24 },
      { level: 2, level_name: "Level 2: System Administrator", required_roles: ["ADMIN", "SUPER_ADMIN"], sla_hours: 48 },
    ],
  },
];

const WORKFLOWS_STORAGE_KEY = "zyno_approval_workflows_v2";

export function loadSavedApprovalWorkflows(): ApprovalWorkflowRule[] {
  try {
    const saved = localStorage.getItem(WORKFLOWS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Error reading saved workflows:", e);
  }
  return DEFAULT_APPROVAL_WORKFLOWS;
}

export function saveApprovalWorkflows(workflows: ApprovalWorkflowRule[]) {
  try {
    localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(workflows));
    window.dispatchEvent(new CustomEvent("approval_workflows_updated", { detail: workflows }));
  } catch (e) {
    console.error("Error saving workflows:", e);
  }
}

export const DEFAULT_ROLE_ACCESS: Record<AppRole, Record<RbacModule, boolean>> = {
  SUPER_ADMIN: {
    "Tenant Mgmt": true,
    "Property CRUD": true,
    "Unit Mgmt": true,
    "Lease Creation": true,
    "Payment Collection": true,
    "Receipt Generation": true,
    "Finance & GL": true,
    "Asset Management": true,
    "Procurement & POs": true,
    "Vendor Management": true,
    "Maintenance Tickets": true,
    HRMS: true,
    "Workforce & Shifts": true,
    "Payroll & Salary": true,
    "Performance & KPA": true,
    "Reports & Analytics": true,
    "User Management": true,
  },
  ADMIN: {
    "Tenant Mgmt": false,
    "Property CRUD": true,
    "Unit Mgmt": true,
    "Lease Creation": true,
    "Payment Collection": true,
    "Receipt Generation": true,
    "Finance & GL": true,
    "Asset Management": true,
    "Procurement & POs": true,
    "Vendor Management": true,
    "Maintenance Tickets": true,
    HRMS: true,
    "Workforce & Shifts": true,
    "Payroll & Salary": true,
    "Performance & KPA": true,
    "Reports & Analytics": true,
    "User Management": true,
  },
  HOST: {
    "Tenant Mgmt": false,
    "Property CRUD": true,
    "Unit Mgmt": true,
    "Lease Creation": true,
    "Payment Collection": false,
    "Receipt Generation": false,
    "Finance & GL": false,
    "Asset Management": true,
    "Procurement & POs": false,
    "Vendor Management": false,
    "Maintenance Tickets": true,
    HRMS: false,
    "Workforce & Shifts": false,
    "Payroll & Salary": false,
    "Performance & KPA": false,
    "Reports & Analytics": true,
    "User Management": false,
  },
  PROP_MGR: {
    "Tenant Mgmt": false,
    "Property CRUD": true,
    "Unit Mgmt": true,
    "Lease Creation": true,
    "Payment Collection": false,
    "Receipt Generation": false,
    "Finance & GL": false,
    "Asset Management": true,
    "Procurement & POs": false,
    "Vendor Management": false,
    "Maintenance Tickets": true,
    HRMS: false,
    "Workforce & Shifts": false,
    "Payroll & Salary": false,
    "Performance & KPA": false,
    "Reports & Analytics": true,
    "User Management": false,
  },
  LEASING: {
    "Tenant Mgmt": false,
    "Property CRUD": false,
    "Unit Mgmt": false,
    "Lease Creation": true,
    "Payment Collection": false,
    "Receipt Generation": false,
    "Finance & GL": false,
    "Asset Management": false,
    "Procurement & POs": false,
    "Vendor Management": false,
    "Maintenance Tickets": false,
    HRMS: false,
    "Workforce & Shifts": false,
    "Payroll & Salary": false,
    "Performance & KPA": false,
    "Reports & Analytics": true,
    "User Management": false,
  },
  FINANCE: {
    "Tenant Mgmt": false,
    "Property CRUD": false,
    "Unit Mgmt": false,
    "Lease Creation": false,
    "Payment Collection": true,
    "Receipt Generation": true,
    "Finance & GL": true,
    "Asset Management": false,
    "Procurement & POs": true,
    "Vendor Management": true,
    "Maintenance Tickets": false,
    HRMS: false,
    "Workforce & Shifts": false,
    "Payroll & Salary": true,
    "Performance & KPA": false,
    "Reports & Analytics": true,
    "User Management": false,
  },
  CASHIER: {
    "Tenant Mgmt": false,
    "Property CRUD": false,
    "Unit Mgmt": false,
    "Lease Creation": false,
    "Payment Collection": true,
    "Receipt Generation": true,
    "Finance & GL": false,
    "Asset Management": false,
    "Procurement & POs": false,
    "Vendor Management": false,
    "Maintenance Tickets": false,
    HRMS: false,
    "Workforce & Shifts": false,
    "Payroll & Salary": false,
    "Performance & KPA": false,
    "Reports & Analytics": false,
    "User Management": false,
  },
  MAINTENANCE: {
    "Tenant Mgmt": false,
    "Property CRUD": false,
    "Unit Mgmt": false,
    "Lease Creation": false,
    "Payment Collection": false,
    "Receipt Generation": false,
    "Finance & GL": false,
    "Asset Management": false,
    "Procurement & POs": false,
    "Vendor Management": false,
    "Maintenance Tickets": true,
    HRMS: false,
    "Workforce & Shifts": false,
    "Payroll & Salary": false,
    "Performance & KPA": false,
    "Reports & Analytics": false,
    "User Management": false,
  },
  TENANT: {
    "Tenant Mgmt": false,
    "Property CRUD": false,
    "Unit Mgmt": false,
    "Lease Creation": false,
    "Payment Collection": false,
    "Receipt Generation": false,
    "Finance & GL": false,
    "Asset Management": false,
    "Procurement & POs": false,
    "Vendor Management": false,
    "Maintenance Tickets": true,
    HRMS: false,
    "Workforce & Shifts": false,
    "Payroll & Salary": false,
    "Performance & KPA": false,
    "Reports & Analytics": false,
    "User Management": false,
  },
  GUEST: {
    "Tenant Mgmt": false,
    "Property CRUD": false,
    "Unit Mgmt": false,
    "Lease Creation": false,
    "Payment Collection": false,
    "Receipt Generation": false,
    "Finance & GL": false,
    "Asset Management": false,
    "Procurement & POs": false,
    "Vendor Management": false,
    "Maintenance Tickets": false,
    HRMS: false,
    "Workforce & Shifts": false,
    "Payroll & Salary": false,
    "Performance & KPA": false,
    "Reports & Analytics": false,
    "User Management": false,
  },
  SALES: {
    "Tenant Mgmt": false,
    "Property CRUD": false,
    "Unit Mgmt": false,
    "Lease Creation": true,
    "Payment Collection": false,
    "Receipt Generation": false,
    "Finance & GL": false,
    "Asset Management": false,
    "Procurement & POs": false,
    "Vendor Management": false,
    "Maintenance Tickets": false,
    HRMS: false,
    "Workforce & Shifts": false,
    "Payroll & Salary": false,
    "Performance & KPA": false,
    "Reports & Analytics": true,
    "User Management": false,
  },
  OWNER: {
    "Tenant Mgmt": false,
    "Property CRUD": false,
    "Unit Mgmt": false,
    "Lease Creation": false,
    "Payment Collection": false,
    "Receipt Generation": false,
    "Finance & GL": false,
    "Asset Management": false,
    "Procurement & POs": false,
    "Vendor Management": false,
    "Maintenance Tickets": false,
    HRMS: false,
    "Workforce & Shifts": false,
    "Payroll & Salary": false,
    "Performance & KPA": false,
    "Reports & Analytics": true,
    "User Management": false,
  },
};

type RolePermissionRow = {
  role_name: string;
  module_id: string;
  has_access: boolean;
  tenant_id: string | null;
};

const CONSOLE_MODULE_RULES: Record<ConsoleKey, { anyOf?: RbacModule[]; allowedRoles?: AppRole[] }> = {
  portal: { allowedRoles: ["TENANT", "GUEST", "SUPER_ADMIN", "ADMIN"] },
  "prop-mgr": { allowedRoles: ["PROP_MGR", "HOST", "SUPER_ADMIN", "ADMIN"], anyOf: ["Property CRUD", "Unit Mgmt", "Lease Creation", "Maintenance Tickets", "Reports & Analytics"] },
  admin: { allowedRoles: ["ADMIN", "SUPER_ADMIN"], anyOf: ["Property CRUD", "Unit Mgmt", "Lease Creation", "Payment Collection", "Receipt Generation", "Finance & GL", "HRMS", "User Management"] },
  "super-admin": { allowedRoles: ["SUPER_ADMIN"] },
  leasing: { allowedRoles: ["LEASING", "SUPER_ADMIN", "ADMIN", "PROP_MGR"], anyOf: ["Lease Creation", "Reports & Analytics"] },
  finance: { allowedRoles: ["FINANCE", "SUPER_ADMIN", "ADMIN", "PROP_MGR", "CASHIER"], anyOf: ["Payment Collection", "Receipt Generation", "Finance & GL", "Reports & Analytics"] },
  cashier: { allowedRoles: ["CASHIER", "FINANCE", "SUPER_ADMIN", "ADMIN", "PROP_MGR"], anyOf: ["Payment Collection", "Receipt Generation"] },
  maintenance: { allowedRoles: ["MAINTENANCE", "SUPER_ADMIN", "ADMIN", "PROP_MGR"], anyOf: ["Maintenance Tickets"] },
};

function getDefaultAccess(role: AppRole) {
  return { ...DEFAULT_ROLE_ACCESS[role] };
}

export async function fetchEffectiveRoleAccess(role: AppRole, tenantId?: string | null) {
  const effective = getDefaultAccess(role);

  let query = supabase.from("role_permissions").select("role_name,module_id,has_access,tenant_id").eq("role_name", role);
  query = tenantId ? query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`) : query.is("tenant_id", null);

  const { data, error } = await query;
  if (error || !data) {
    return effective;
  }

  const rows = data as RolePermissionRow[];
  for (const moduleId of RBAC_MODULES) {
    const tenantSpecific = rows.find((row) => row.module_id === moduleId && row.tenant_id === (tenantId ?? null));
    const globalDefault = rows.find((row) => row.module_id === moduleId && row.tenant_id === null);
    const resolved = tenantSpecific ?? globalDefault;
    if (resolved) {
      effective[moduleId] = resolved.has_access;
    }
  }

  return effective;
}

export function getDefaultModuleAccess(role: AppRole, moduleId: RbacModule) {
  return DEFAULT_ROLE_ACCESS[role]?.[moduleId] ?? false;
}

export async function canAccessConsole(consoleKey: ConsoleKey, role: AppRole, tenantId?: string | null) {
  const rule = CONSOLE_MODULE_RULES[consoleKey];
  if (!rule) return true;

  // 1. Check direct role list
  if (rule.allowedRoles?.includes(role)) {
    return true;
  }
  if (!rule.anyOf?.length) {
    return false;
  }

  // 2. Check static default permissions first to ensure fast, synchronous check
  const staticAccess = DEFAULT_ROLE_ACCESS[role];
  if (staticAccess && rule.anyOf.some((moduleId) => staticAccess[moduleId])) {
    return true;
  }

  // 3. Fallback to Supabase permissions if custom tenant config is loaded
  try {
    const access = await fetchEffectiveRoleAccess(role, tenantId);
    return rule.anyOf.some((moduleId) => access[moduleId]);
  } catch {
    return false;
  }
}
