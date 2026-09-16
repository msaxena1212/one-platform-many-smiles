import { logSecurityEvent } from "@/lib/security";

export interface ImpersonationSession {
  isImpersonating: boolean;
  tenantId: string;
  tenantKey: string;
  tenantName: string;
  adminName: string;
  adminEmail: string;
  originalRole: "SUPER_ADMIN";
  startedAt: string;
}

const IMPERSONATION_KEY = "zyno_impersonation_session";

export function startImpersonation(tenant: {
  id: string;
  tenant_key: string;
  name: string;
  admin_name: string;
  admin_email: string;
}) {
  if (typeof window === "undefined") return;

  const session: ImpersonationSession = {
    isImpersonating: true,
    tenantId: tenant.id,
    tenantKey: tenant.tenant_key,
    tenantName: tenant.name,
    adminName: tenant.admin_name,
    adminEmail: tenant.admin_email,
    originalRole: "SUPER_ADMIN",
    startedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(session));

  logSecurityEvent({
    event_type: "IMPERSONATION_STARTED",
    severity: "warning",
    resource: `tenant_organisations/${tenant.id}`,
    action: `Super Admin started customer support impersonation for tenant "${tenant.name}" (${tenant.tenant_key})`,
    user_role: "SUPER_ADMIN",
    details: { tenant_id: tenant.id, tenant_key: tenant.tenant_key, admin_email: tenant.admin_email },
  });
}

export function getImpersonationSession(): ImpersonationSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(IMPERSONATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ImpersonationSession;
  } catch {
    window.localStorage.removeItem(IMPERSONATION_KEY);
    return null;
  }
}

export function stopImpersonation() {
  if (typeof window === "undefined") return;
  const current = getImpersonationSession();
  if (current) {
    logSecurityEvent({
      event_type: "IMPERSONATION_STOPPED",
      severity: "info",
      resource: `tenant_organisations/${current.tenantId}`,
      action: `Super Admin ended support impersonation for tenant "${current.tenantName}"`,
      user_role: "SUPER_ADMIN",
      details: { tenant_id: current.tenantId, tenant_key: current.tenantKey },
    });
  }
  window.localStorage.removeItem(IMPERSONATION_KEY);
}
