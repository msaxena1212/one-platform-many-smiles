import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { r as resolveConsoleTitle, t as getConsoleConfig } from "./console-config-CIlKUfrx.mjs";
import { f as Outlet, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as AppShell } from "./app-shell-fN2cZ0dk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/maintenance-CNheX6ZD.js
var import_jsx_runtime = require_jsx_runtime();
function MaintenanceLayout() {
	const path = useRouterState({ select: (state) => state.location.pathname });
	const config = getConsoleConfig("maintenance");
	const title = resolveConsoleTitle("maintenance", path);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		variant: config.variant,
		title,
		consoleLabel: config.consoleLabel,
		navGroups: config.navGroups,
		navModules: config.navModules,
		nav: config.nav,
		user: config.user,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
//#endregion
export { MaintenanceLayout as component };
