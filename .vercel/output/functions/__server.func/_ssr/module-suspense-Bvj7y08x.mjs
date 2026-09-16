import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/module-suspense-Bvj7y08x.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* ModuleSuspense
* ──────────────
* Wraps any lazily-loaded route component with a full-page skeleton shimmer.
* Import this in every route that uses React.lazy() so the user sees a
* smooth loading state instead of a blank screen.
*/
function ModuleSkeletonFallback() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 p-6 w-full animate-pulse",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-48 rounded-lg bg-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-9 w-24 rounded-lg bg-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-9 w-24 rounded-lg bg-muted" })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2 border-b pb-2",
				children: [
					1,
					2,
					3,
					4,
					5
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-24 rounded-md bg-muted" }, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 sm:grid-cols-4 gap-4",
				children: [
					1,
					2,
					3,
					4
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border bg-card p-4 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-3/4 rounded bg-muted" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-1/2 rounded bg-muted" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-3 w-2/3 rounded bg-muted" })
					]
				}, i))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border bg-card overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 border-b",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-5 w-36 rounded bg-muted" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "divide-y",
					children: [
						1,
						2,
						3,
						4,
						5,
						6
					].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4 px-4 py-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-4 rounded bg-muted shrink-0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 flex-1 rounded bg-muted" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-24 rounded bg-muted" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-4 w-20 rounded bg-muted" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-6 w-16 rounded-full bg-muted" })
						]
					}, i))
				})]
			})
		]
	});
}
function ModuleSuspense({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ModuleSkeletonFallback, {}),
		children
	});
}
//#endregion
export { ModuleSuspense as t };
