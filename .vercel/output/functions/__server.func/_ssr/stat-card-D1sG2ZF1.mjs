import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { n as CardContent, t as Card } from "./card-xVPC106M.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stat-card-D1sG2ZF1.js
var import_jsx_runtime = require_jsx_runtime();
function StatCard({ label, value, delta, hint, icon, tone = "default" }) {
	const toneClass = {
		default: "text-muted-foreground",
		success: "text-[oklch(0.55_0.13_155)]",
		warning: "text-[oklch(0.65_0.15_75)]",
		destructive: "text-destructive"
	}[tone];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
		className: "overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
			className: "p-5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
							children: label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-2xl font-semibold tracking-tight text-foreground",
							children: value
						}),
						(delta || hint) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: cn("mt-1 text-xs", toneClass),
							children: [
								delta && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: delta
								}),
								delta && hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: " · " }),
								hint
							]
						})
					]
				}), icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground",
					children: icon
				})]
			})
		})
	});
}
//#endregion
export { StatCard as t };
