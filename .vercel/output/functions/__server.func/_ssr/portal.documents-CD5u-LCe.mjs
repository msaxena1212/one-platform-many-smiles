import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { J as PenLine, Lt as Download, Ot as FileText } from "../_libs/lucide-react.mjs";
import { n as CardContent, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as documents } from "./mock-data-B9OWnoA7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portal.documents-CD5u-LCe.js
var import_jsx_runtime = require_jsx_runtime();
var docs = documents;
function DocsPage() {
	const handleDownload = (name) => {
		toast.success(`${name} download started.`);
	};
	const handleSign = (name) => {
		toast(`${name} is ready for signature.`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
		className: "p-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "border-b border-border px-6 py-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-base font-semibold",
				children: "My documents"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "Lease, invoices, inspections and community policies."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-border",
			children: docs.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between gap-4 px-6 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-medium",
							children: d.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								d.size,
								" · ",
								d.date
							]
						})]
					})]
				}), d.action === "sign" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "shrink-0",
					onClick: () => handleSign(d.name),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PenLine, {}), " Sign"]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					className: "shrink-0",
					onClick: () => handleDownload(d.name),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {}), " Download"]
				})]
			}, d.id))
		})]
	}) });
}
//#endregion
export { DocsPage as component };
