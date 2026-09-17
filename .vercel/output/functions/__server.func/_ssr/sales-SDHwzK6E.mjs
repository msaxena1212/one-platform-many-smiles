import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { Ot as FileText, Wt as Clock, dn as Calendar, hn as Building2 } from "../_libs/lucide-react.mjs";
import { f as Outlet } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as AppShell } from "./app-shell-BTlCDuJd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sales-SDHwzK6E.js
var import_jsx_runtime = require_jsx_runtime();
function SalesLayout() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		variant: "host",
		title: "Sales Console",
		nav: [
			{
				label: "Listings",
				to: "/sales/listings",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4" })
			},
			{
				label: "Reservations",
				to: "/sales/reservations",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4" })
			},
			{
				label: "Appointments",
				to: "/sales/appointments",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4" })
			},
			{
				label: "Contracts",
				to: "/sales/contracts",
				icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
			}
		],
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
//#endregion
export { SalesLayout as component };
