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
    id: "00000000-0000-4000-8000-000000000010",
    role: "GUEST",
    full_name: "Demo Tenant",
    tenant_key: "demo-tenant",
  },
  TENANT: {
    id: "00000000-0000-4000-8000-000000000011",
    role: "TENANT",
    full_name: "Demo Tenant",
    tenant_key: "demo-tenant",
  },
  PROP_MGR: {
    id: "00000000-0000-4000-8000-000000000002",
    role: "PROP_MGR",
    full_name: "Demo Property Manager",
    tenant_key: "demo-tenant",
  },
  ADMIN: {
    id: "00000000-0000-4000-8000-000000000003",
    role: "ADMIN",
    full_name: "Demo Admin",
    tenant_key: "demo-tenant",
  },
  SUPER_ADMIN: {
    id: "00000000-0000-4000-8000-000000000004",
    role: "SUPER_ADMIN",
    full_name: "Demo Super Admin",
  },
  LEASING: {
    id: "00000000-0000-4000-8000-000000000005",
    role: "LEASING",
    full_name: "Demo Leasing Officer",
    tenant_key: "demo-tenant",
  },
  FINANCE: {
    id: "00000000-0000-4000-8000-000000000006",
    role: "FINANCE",
    full_name: "Demo Finance Officer",
    tenant_key: "demo-tenant",
  },
  CASHIER: {
    id: "00000000-0000-4000-8000-000000000007",
    role: "CASHIER",
    full_name: "Demo Cashier",
    tenant_key: "demo-tenant",
  },
  MAINTENANCE: {
    id: "00000000-0000-4000-8000-000000000008",
    role: "MAINTENANCE",
    full_name: "Demo Maintenance Officer",
    tenant_key: "demo-tenant",
  },
  HOST: {
    id: "00000000-0000-4000-8000-000000000001",
    role: "HOST",
    full_name: "Demo Host",
    tenant_key: "demo-tenant",
  },
  SALES: {
    id: "00000000-0000-4000-8000-000000000009",
    role: "SALES",
    full_name: "Demo Sales User",
    tenant_key: "demo-tenant",
  },
  OWNER: {
    id: "00000000-0000-4000-8000-000000000012",
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
