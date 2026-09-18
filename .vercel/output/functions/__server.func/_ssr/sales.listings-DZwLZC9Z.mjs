import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { Pt as Eye, S as SquarePen } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sales.listings-DZwLZC9Z.js
var import_jsx_runtime = require_jsx_runtime();
function SalesListings() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold tracking-tight",
					children: "Active Listings"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Manage and monitor property listings"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, { children: "+ New Listing" })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-medium",
							children: "Active"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xl font-bold",
						children: "2"
					}) })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-medium",
							children: "Reserved"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xl font-bold",
						children: "1"
					}) })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-medium",
							children: "Total Views"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xl font-bold",
						children: "658"
					}) })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-sm font-medium",
							children: "Inquiries"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-2xl font-bold",
						children: "25"
					}) })] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Listings" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: [
					{
						id: 1,
						unit: "AL-RYD-201",
						property: "Al Nakheel",
						price: "₨850,000",
						status: "available",
						views: 342,
						inquiries: 12
					},
					{
						id: 2,
						unit: "AL-RYD-305",
						property: "Al Nakheel",
						price: "₨1.2M",
						status: "reserved",
						views: 189,
						inquiries: 5
					},
					{
						id: 3,
						unit: "SH-JED-401",
						property: "Al Shati",
						price: "₨2.1M",
						status: "available",
						views: 127,
						inquiries: 8
					}
				].map((listing) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "font-semibold",
							children: [
								listing.property,
								" - ",
								listing.unit
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: listing.price
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-muted-foreground",
									children: [listing.views, " views"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-medium",
									children: [listing.inquiries, " inquiries"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: listing.status === "available" ? "default" : "secondary",
								children: listing.status
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									className: "gap-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									variant: "ghost",
									className: "gap-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "h-4 w-4" })
								})]
							})
						]
					})]
				}, listing.id))
			}) })] })
		]
	});
}
//#endregion
export { SalesListings as component };
