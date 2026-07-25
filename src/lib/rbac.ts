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
  "Maintenance Tickets",
  "Reports & Analytics",
  "User Management",
  "HRMS",
] as const;

export type RbacModule = (typeof RBAC_MODULES)[number];

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

export const DEFAULT_ROLE_ACCESS: Record<AppRole, Record<RbacModule, boolean>> = {
  SUPER_ADMIN: {
    "Tenant Mgmt": true,
    "Property CRUD": true,
    "Unit Mgmt": true,
    "Lease Creation": true,
    "Payment Collection": true,
    "Receipt Generation": true,
    "Maintenance Tickets": true,
    "Reports & Analytics": true,
    "User Management": true,
    HRMS: true,
  },
  ADMIN: {
    "Tenant Mgmt": false,
    "Property CRUD": true,
    "Unit Mgmt": true,
    "Lease Creation": true,
    "Payment Collection": true,
    "Receipt Generation": true,
    "Maintenance Tickets": true,
    "Reports & Analytics": true,
    "User Management": true,
    HRMS: true,
  },
  HOST: {
    "Tenant Mgmt": false,
    "Property CRUD": true,
    "Unit Mgmt": true,
    "Lease Creation": true,
    "Payment Collection": false,
    "Receipt Generation": false,
    "Maintenance Tickets": true,
    "Reports & Analytics": true,
    "User Management": false,
    HRMS: false,
  },
  PROP_MGR: {
    "Tenant Mgmt": false,
    "Property CRUD": true,
    "Unit Mgmt": true,
    "Lease Creation": true,
    "Payment Collection": false,
    "Receipt Generation": false,
    "Maintenance Tickets": true,
    "Reports & Analytics": true,
    "User Management": false,
    HRMS: false,
  },
  LEASING: {
    "Tenant Mgmt": false,
    "Property CRUD": false,
    "Unit Mgmt": false,
    "Lease Creation": true,
    "Payment Collection": false,
    "Receipt Generation": false,
    "Maintenance Tickets": false,
    "Reports & Analytics": true,
    "User Management": false,
    HRMS: false,
  },
  FINANCE: {
    "Tenant Mgmt": false,
    "Property CRUD": false,
    "Unit Mgmt": false,
    "Lease Creation": false,
    "Payment Collection": true,
    "Receipt Generation": true,
    "Maintenance Tickets": false,
    "Reports & Analytics": true,
    "User Management": false,
    HRMS: false,
  },
  CASHIER: {
    "Tenant Mgmt": false,
    "Property CRUD": false,
    "Unit Mgmt": false,
    "Lease Creation": false,
    "Payment Collection": true,
    "Receipt Generation": true,
    "Maintenance Tickets": false,
    "Reports & Analytics": false,
    "User Management": false,
    HRMS: false,
  },
  MAINTENANCE: {
    "Tenant Mgmt": false,
    "Property CRUD": false,
    "Unit Mgmt": false,
    "Lease Creation": false,
    "Payment Collection": false,
    "Receipt Generation": false,
    "Maintenance Tickets": true,
    "Reports & Analytics": false,
    "User Management": false,
    HRMS: false,
  },
  TENANT: {
    "Tenant Mgmt": false,
    "Property CRUD": false,
    "Unit Mgmt": false,
    "Lease Creation": false,
    "Payment Collection": false,
    "Receipt Generation": false,
    "Maintenance Tickets": true,
    "Reports & Analytics": false,
    "User Management": false,
    HRMS: false,
  },
  GUEST: {
    "Tenant Mgmt": false,
    "Property CRUD": false,
    "Unit Mgmt": false,
    "Lease Creation": false,
    "Payment Collection": false,
    "Receipt Generation": false,
    "Maintenance Tickets": true,
    "Reports & Analytics": false,
    "User Management": false,
    HRMS: false,
  },
  SALES: {
    "Tenant Mgmt": false,
    "Property CRUD": false,
    "Unit Mgmt": false,
    "Lease Creation": true,
    "Payment Collection": false,
    "Receipt Generation": false,
    "Maintenance Tickets": false,
    "Reports & Analytics": true,
    "User Management": false,
    HRMS: false,
  },
  OWNER: {
    "Tenant Mgmt": false,
    "Property CRUD": false,
    "Unit Mgmt": false,
    "Lease Creation": false,
    "Payment Collection": false,
    "Receipt Generation": false,
    "Maintenance Tickets": false,
    "Reports & Analytics": true,
    "User Management": false,
    HRMS: false,
  },
};

type RolePermissionRow = {
  role_name: string;
  module_id: string;
  has_access: boolean;
  tenant_id: string | null;
};

const CONSOLE_MODULE_RULES: Record<ConsoleKey, { anyOf?: RbacModule[]; allowedRoles?: AppRole[] }> = {
  portal: { allowedRoles: ["TENANT", "GUEST"] },
  "prop-mgr": { anyOf: ["Property CRUD", "Unit Mgmt", "Lease Creation", "Maintenance Tickets", "Reports & Analytics"] },
  admin: { anyOf: ["Property CRUD", "Unit Mgmt", "Lease Creation", "Payment Collection", "Receipt Generation", "User Management", "HRMS"] },
  "super-admin": { allowedRoles: ["SUPER_ADMIN"] },
  leasing: { anyOf: ["Lease Creation", "Reports & Analytics"] },
  finance: { anyOf: ["Payment Collection", "Receipt Generation", "Reports & Analytics"] },
  cashier: { anyOf: ["Payment Collection", "Receipt Generation"] },
  maintenance: { anyOf: ["Maintenance Tickets"] },
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
  if (rule.allowedRoles?.includes(role)) {
    return true;
  }
  if (!rule.anyOf?.length) {
    return false;
  }

  const access = await fetchEffectiveRoleAccess(role, tenantId);
  return rule.anyOf.some((moduleId) => access[moduleId]);
}
