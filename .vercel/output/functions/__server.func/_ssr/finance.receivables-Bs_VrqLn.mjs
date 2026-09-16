import { i as __toESM } from "../_runtime.mjs";
import { d as fetchARLedgers } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-xVPC106M.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/finance.receivables-Bs_VrqLn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function FinanceReceivables() {
	const [ledgers, setLedgers] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		fetchARLedgers().then((res) => setLedgers(res)).finally(() => setLoading(false));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-bold tracking-tight",
			children: "Receivables"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Accounts Receivable Ledger" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Loading..." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-4",
			children: ledgers.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between p-3 border rounded-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold",
					children: l.reference
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: new Date(l.date).toLocaleDateString()
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-right",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-bold",
						children: ["QAR ", l.amount]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: `text-sm ${l.balance > 0 ? "text-red-500" : "text-green-500"}`,
						children: ["Balance: QAR ", l.balance]
					})]
				})]
			}, l.id))
		}) })] })]
	});
}
//#endregion
export { FinanceReceivables as component };
