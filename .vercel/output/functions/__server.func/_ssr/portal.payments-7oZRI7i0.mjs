import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { n as CardContent, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { d as payments, s as formatSAR } from "./mock-data-B9OWnoA7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/portal.payments-7oZRI7i0.js
var import_jsx_runtime = require_jsx_runtime();
var methodColor = {
	SADAD: "bg-primary/10 text-primary",
	Mada: "bg-gold/15 text-gold-foreground",
	"Apple Pay": "bg-foreground/5 text-foreground",
	"STC Pay": "bg-[oklch(0.55_0.18_140)]/15 text-[oklch(0.4_0.18_140)]",
	"Bank Transfer": "bg-secondary text-secondary-foreground"
};
function PaymentsPage() {
	const handlePayment = (method) => {
		toast.success(`Payment flow started with ${method}.`);
	};
	const handleAutoPay = () => {
		toast(`Auto-pay setup form opened.`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "border-gold/40 bg-gradient-to-br from-card to-gold/5",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-widest text-muted-foreground",
						children: "Next installment"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-3xl font-semibold",
						children: formatSAR(15e3)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "Due July 1, 2026 · Reference 119988443"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => handlePayment("SADAD"),
							children: "Pay with SADAD"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => handlePayment("Mada"),
							children: "Pay with Mada"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							onClick: handleAutoPay,
							children: "Set up auto-pay"
						})
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "p-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-border px-6 py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-base font-semibold",
					children: "Payment history"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "All receipts on your account"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-muted/60 text-left text-xs uppercase tracking-wider text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-6 py-3 font-medium",
								children: "Receipt"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-6 py-3 font-medium",
								children: "Date"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-6 py-3 font-medium",
								children: "Method"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-6 py-3 font-medium text-right",
								children: "Amount"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-6 py-3 font-medium",
								children: "Status"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-border bg-card",
						children: payments.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-6 py-3 font-mono text-xs",
								children: p.reference
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-6 py-3 text-muted-foreground",
								children: p.date
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-6 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `rounded-full px-2 py-0.5 text-[10px] font-medium ${methodColor[p.method]}`,
									children: p.method
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-6 py-3 text-right font-medium",
								children: formatSAR(p.amount)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-6 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${p.status === "completed" ? "bg-[oklch(0.55_0.13_155)]/15 text-[oklch(0.4_0.13_155)]" : p.status === "pending" ? "bg-gold/20 text-gold-foreground" : p.status === "failed" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`,
									children: p.status
								})
							})
						] }, p.id))
					})]
				})
			})]
		}) })]
	});
}
//#endregion
export { PaymentsPage as component };
