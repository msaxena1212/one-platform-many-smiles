import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { r as resolveConsoleTitle, t as getConsoleConfig } from "./console-config-CLs2PqkZ.mjs";
import { f as Outlet, l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as AppShell } from "./app-shell-BTlCDuJd.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leasing-3TUerJga.js
var import_jsx_runtime = require_jsx_runtime();
function LeasingLayout() {
	const path = useRouterState({ select: (state) => state.location.pathname });
	const config = getConsoleConfig("leasing");
	const title = resolveConsoleTitle("leasing", path);
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
export { LeasingLayout as component };
