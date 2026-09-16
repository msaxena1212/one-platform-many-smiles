import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as PermissionsManager } from "./PermissionsManager-C-V_5pE8.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/super-admin.permissions-CRqzZ85H.js
var import_jsx_runtime = require_jsx_runtime();
function SuperAdminPermissions() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex items-center justify-between",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold tracking-tight",
				children: "Global Permissions"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Manage baseline access levels for all platform roles."
			})] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PermissionsManager, {})]
	});
}
//#endregion
export { SuperAdminPermissions as component };
