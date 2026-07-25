import type { AppRole } from "@/lib/rbac";

const DEMO_SESSION_KEY = "zyno-demo-session";

export type DemoSession = {
  id: string;
  role: AppRole;
  full_name: string;
  tenant_id?: string | null;
  tenant_key?: string | null;
};

const DEMO_USERS: Record<AppRole, DemoSession> = {
  GUEST: {
    id: "demo-guest",
    role: "GUEST",
    full_name: "Demo Tenant",
    tenant_key: "demo-tenant",
  },
  TENANT: {
    id: "demo-tenant",
    role: "TENANT",
    full_name: "Demo Tenant",
    tenant_key: "demo-tenant",
  },
  PROP_MGR: {
    id: "demo-prop-mgr",
    role: "PROP_MGR",
    full_name: "Demo Property Manager",
    tenant_key: "demo-tenant",
  },
  ADMIN: {
    id: "demo-admin",
    role: "ADMIN",
    full_name: "Demo Admin",
    tenant_key: "demo-tenant",
  },
  SUPER_ADMIN: {
    id: "demo-super-admin",
    role: "SUPER_ADMIN",
    full_name: "Demo Super Admin",
  },
  LEASING: {
    id: "demo-leasing",
    role: "LEASING",
    full_name: "Demo Leasing Officer",
    tenant_key: "demo-tenant",
  },
  FINANCE: {
    id: "demo-finance",
    role: "FINANCE",
    full_name: "Demo Finance Officer",
    tenant_key: "demo-tenant",
  },
  CASHIER: {
    id: "demo-cashier",
    role: "CASHIER",
    full_name: "Demo Cashier",
    tenant_key: "demo-tenant",
  },
  MAINTENANCE: {
    id: "demo-maintenance",
    role: "MAINTENANCE",
    full_name: "Demo Maintenance Officer",
    tenant_key: "demo-tenant",
  },
  HOST: {
    id: "demo-host",
    role: "HOST",
    full_name: "Demo Host",
    tenant_key: "demo-tenant",
  },
  SALES: {
    id: "demo-sales",
    role: "SALES",
    full_name: "Demo Sales User",
    tenant_key: "demo-tenant",
  },
  OWNER: {
    id: "demo-owner",
    role: "OWNER",
    full_name: "Demo Owner",
    tenant_key: "demo-tenant",
  },
};

export function createDemoSession(role: AppRole) {
  return DEMO_USERS[role];
}

export function setDemoSession(role: AppRole) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(createDemoSession(role)));
}

export function getDemoSession() {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as DemoSession;
  } catch {
    window.localStorage.removeItem(DEMO_SESSION_KEY);
    return null;
  }
}

export function clearDemoSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DEMO_SESSION_KEY);
}
