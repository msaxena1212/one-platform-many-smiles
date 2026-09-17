import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { Ot as FileText, Qt as CircleCheck, hn as Building2, zt as DollarSign } from "../_libs/lucide-react.mjs";
import { f as Outlet } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as AppShell } from "./app-shell-BTlCDuJd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/owner-B8sZOAgM.js
var import_jsx_runtime = require_jsx_runtime();
function OwnerLayout() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		variant: "host",
		title: "Owner Portal",
		nav: [
			{
				label: "Statements",
				to: "/owner/statements",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
			},
			{
				label: "Distributions",
				to: "/owner/distributions",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" })
			},
			{
				label: "Properties",
				to: "/owner/properties",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4" })
			},
			{
				label: "Approvals",
				to: "/owner/approvals",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" })
			}
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
//#endregion
export { OwnerLayout as component };
