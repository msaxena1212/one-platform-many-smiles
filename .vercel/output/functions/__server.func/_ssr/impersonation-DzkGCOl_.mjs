import { n as logSecurityEvent } from "./security-BK-Kx7Zx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/impersonation-DzkGCOl_.js
var IMPERSONATION_KEY = "zyno_impersonation_session";
function startImpersonation(tenant) {
	if (typeof window === "undefined") return;
	const session = {
		isImpersonating: true,
		tenantId: tenant.id,
		tenantKey: tenant.tenant_key,
		tenantName: tenant.name,
		adminName: tenant.admin_name,
		adminEmail: tenant.admin_email,
		originalRole: "SUPER_ADMIN",
		startedAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	window.localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(session));
	logSecurityEvent({
		event_type: "IMPERSONATION_STARTED",
		severity: "warning",
		resource: `tenant_organisations/${tenant.id}`,
		action: `Super Admin started customer support impersonation for tenant "${tenant.name}" (${tenant.tenant_key})`,
		user_role: "SUPER_ADMIN",
		details: {
			tenant_id: tenant.id,
			tenant_key: tenant.tenant_key,
			admin_email: tenant.admin_email
		}
	});
}
function getImpersonationSession() {
	if (typeof window === "undefined") return null;
	const raw = window.localStorage.getItem(IMPERSONATION_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw);
	} catch {
		window.localStorage.removeItem(IMPERSONATION_KEY);
		return null;
	}
}
function stopImpersonation() {
	if (typeof window === "undefined") return;
	const current = getImpersonationSession();
	if (current) logSecurityEvent({
		event_type: "IMPERSONATION_STOPPED",
		severity: "info",
		resource: `tenant_organisations/${current.tenantId}`,
		action: `Super Admin ended support impersonation for tenant "${current.tenantName}"`,
		user_role: "SUPER_ADMIN",
		details: {
			tenant_id: current.tenantId,
			tenant_key: current.tenantKey
		}
	});
	window.localStorage.removeItem(IMPERSONATION_KEY);
}
//#endregion
export { startImpersonation as n, stopImpersonation as r, getImpersonationSession as t };
