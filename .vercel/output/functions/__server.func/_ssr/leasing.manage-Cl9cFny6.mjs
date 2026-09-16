import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leasing.manage-Cl9cFny6.js
var import_jsx_runtime = require_jsx_runtime();
var mockLeases = [
	{
		ref: "L-L1",
		tenant: "Khalid Al-Mutairi",
		unit: "A-1201",
		start: "2025-01-01",
		end: "2025-12-31",
		rent: "$54,000",
		status: "ACTIVE"
	},
	{
		ref: "L-L2",
		tenant: "Sara Al-Qahtani",
		unit: "V-07",
		start: "2025-03-01",
		end: "2026-02-28",
		rent: "$38,400",
		status: "ACTIVE"
	},
	{
		ref: "L-L3",
		tenant: "Omar Industries LLC",
		unit: "C-2210",
		start: "2024-07-01",
		end: "2025-06-30",
		rent: "$81,600",
		status: "EXPIRING"
	},
	{
		ref: "L-L4",
		tenant: "Layla Al-Harbi",
		unit: "B-0804",
		start: "2026-01-01",
		end: "2026-12-31",
		rent: "$35,400",
		status: "DRAFT"
	},
	{
		ref: "L-L5",
		tenant: "Fahad Real Estate",
		unit: "A-1305",
		start: "2024-09-01",
		end: "2027-08-31",
		rent: "$93,600",
		status: "ACTIVE"
	}
];
var mockPDCs = [
	{
		tenant: "Khalid Al-Mutairi",
		details: "SNB — presents 2025-12-05",
		amount: "$4,500",
		status: "HELD"
	},
	{
		tenant: "Sara Al-Qahtani",
		details: "Al Rajhi Bank — deposited 2026-01-10",
		amount: "$3,200",
		status: "DEPOSITED"
	},
	{
		tenant: "Omar Industries LLC",
		details: "SAB — cleared 2024-10-01",
		amount: "$6,800",
		status: "CLEARED"
	},
	{
		tenant: "Layla Al-Harbi",
		details: "Riyadh Bank — bounced 2026-02-15",
		amount: "$2,950",
		status: "BOUNCED"
	}
];
function HostLeases() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
								children: "Active"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold",
							children: "2"
						}) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
								children: [
									"Expiring ",
									"<",
									" 90D"
								]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold text-amber-600",
							children: "1"
						}) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
								children: "Drafts"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold",
							children: "1"
						}) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
								children: "Annual Rent Roll"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold",
							children: "$400,000"
						}) })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between p-6 pb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-lg",
						children: "Leases"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "bg-primary hover:bg-primary/90",
						children: "New lease"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "border-y border-border bg-muted/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider",
										children: "Ref"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider",
										children: "Tenant"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider",
										children: "Unit"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider",
										children: "Start"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider",
										children: "End"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider",
										children: "Annual Rent"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-6 py-3 text-left font-medium text-muted-foreground uppercase text-xs tracking-wider",
										children: "Status"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border",
								children: mockLeases.map((lease, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-muted/10 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4 font-mono text-xs",
											children: lease.ref
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4 font-medium",
											children: lease.tenant
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4 text-muted-foreground",
											children: lease.unit
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4 text-muted-foreground",
											children: lease.start
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4 text-muted-foreground",
											children: lease.end
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4 font-medium",
											children: lease.rent
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-6 py-4",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${lease.status === "ACTIVE" ? "bg-green-100 text-green-700" : lease.status === "EXPIRING" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`,
												children: lease.status
											})
										})
									]
								}, i))
							})]
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Post-dated cheques (PDC)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Upcoming bank presentations - auto-posted to ledger when cleared" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "space-y-4",
					children: mockPDCs.map((pdc, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between border-b border-border last:border-0 pb-4 last:pb-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: pdc.tenant
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs text-muted-foreground",
							children: pdc.details
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-medium",
							children: pdc.amount
						})]
					}, i))
				}) })]
			})
		]
	});
}
//#endregion
export { HostLeases as component };
