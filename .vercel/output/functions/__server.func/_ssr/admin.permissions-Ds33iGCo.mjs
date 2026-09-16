import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { t as resolveTenantContextId } from "./tenant-context-xAvPY413.mjs";
import { t as PermissionsManager } from "./PermissionsManager-C-V_5pE8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.permissions-Ds33iGCo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminPermissions() {
	const [tenantContextId, setTenantContextId] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let mounted = true;
		async function loadTenantContext() {
			const { data } = await supabase.auth.getSession();
			const session = data.session;
			if (!session?.user) return;
			const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
			if (!mounted) return;
			setTenantContextId(resolveTenantContextId(profile ?? null, session.user));
		}
		loadTenantContext();
		return () => {
			mounted = false;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-between",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold tracking-tight",
				children: "Role Permissions & Access Matrix"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Manage granular module access for your organization's staff roles."
			})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PermissionsManager, { targetTenantId: tenantContextId })]
	});
}
//#endregion
export { AdminPermissions as component };
