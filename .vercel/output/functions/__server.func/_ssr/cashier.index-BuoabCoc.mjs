import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $t as CircleCheck, H as Receipt, On as ArrowRightLeft, Sn as Banknote, i as Wifi, kt as FileText } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { g as Link, y as useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { n as useAppData } from "./app-data-context-Lw7cnnXe.mjs";
import { FinanceModule } from "./finance-module-BuTE3csG.mjs";
import { a as Area, c as ResponsiveContainer, i as XAxis, l as Tooltip, o as CartesianGrid, r as YAxis, t as AreaChart } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/cashier.index-BuoabCoc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CashierDashboard() {
	const { leases, pdcs, vouchers, syncing } = useAppData();
	const selectedTab = useSearch({ strict: false }).tab;
	const [selectedLeaseId, setSelectedLeaseId] = (0, import_react.useState)("");
	const selectedLease = leases.find((lease) => lease.id === selectedLeaseId) ?? null;
	if (selectedTab) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "pb-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
				className: "text-base",
				children: "Collection Target"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Select the tenant, property, and unit before recording this collection."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
			value: selectedLeaseId,
			onValueChange: setSelectedLeaseId,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
				className: "max-w-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select tenant / property / unit" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: leases.map((lease) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
				value: lease.id,
				children: [
					lease.tenantName,
					" · ",
					lease.property,
					" · ",
					lease.unit
				]
			}, lease.id)) })]
		}) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinanceModule, {
			role: "cashier",
			collectionContext: selectedLease ? {
				tenantName: selectedLease.tenantName,
				property: selectedLease.property,
				unit: selectedLease.unit
			} : null
		})]
	});
	const postedVouchers = vouchers.filter((voucher) => voucher.status === "posted");
	const totalCollected = postedVouchers.reduce((sum, voucher) => sum + voucher.amount, 0);
	const pdcHeld = pdcs.filter((pdc) => pdc.status === "received").length;
	const pdcDeposited = pdcs.filter((pdc) => pdc.status === "deposited" || pdc.status === "cleared").length;
	const activeLeases = leases.filter((lease) => lease.status !== "closed" && lease.status !== "non_renewal").length;
	const chartData = (() => {
		const months = {};
		postedVouchers.filter((voucher) => voucher.name.includes("Rental Income") || voucher.name.includes("Receipts Voucher") || voucher.name.includes("Receipt Voucher")).forEach((voucher) => {
			const month = voucher.period?.slice(0, 3) || "Unk";
			months[month] = (months[month] || 0) + voucher.amount;
		});
		return Object.entries(months).map(([name, amount]) => ({
			name,
			amount
		}));
	})();
	if (syncing) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-64 items-center justify-center gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-muted-foreground text-sm",
			children: "Loading shared data..."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8 animate-in fade-in duration-500",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold tracking-tight",
					children: "Cashier Operations"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground mt-1",
					children: "Manage daily collections and post-dated cheques."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "gap-1 text-green-700 border-green-300 bg-green-50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "h-3 w-3" }), "Live Sync"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "bg-emerald-600 hover:bg-emerald-700 text-white gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/cashier/receipts",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-4 w-4" }), "View Financial Receipts"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "bg-teal-700 hover:bg-teal-800 text-white gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/cashier/pdc",
								search: { collect: "1" },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-4 w-4" }), "Collect PDC / Deposit"]
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-sm font-medium text-muted-foreground",
								children: "Total Collected"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-2xl font-bold",
							children: ["QAR ", totalCollected.toLocaleString()]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: [postedVouchers.length, " posted vouchers"]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-sm font-medium text-muted-foreground",
								children: "PDCs In Hand"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold",
							children: pdcHeld
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: [pdcDeposited, " deposited / cleared"]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-sm font-medium text-muted-foreground",
								children: "Active Leases"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "h-4 w-4" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold",
							children: activeLeases
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: "Across all properties"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm hover:shadow-md transition-all",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-sm font-medium text-muted-foreground",
								children: "Vouchers Posted"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-4 w-4" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold",
							children: postedVouchers.length
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: [vouchers.filter((voucher) => voucher.status === "draft").length, " drafts pending"]
						})] })]
					})
				]
			}),
			chartData.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "border-b border-border pb-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-semibold",
						children: "Collection Trend - Posted Vouchers"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: 180,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
							data: chartData,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
									id: "colGrad",
									x1: "0",
									y1: "0",
									x2: "0",
									y2: "1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "5%",
										stopColor: "#10b981",
										stopOpacity: .3
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
										offset: "95%",
										stopColor: "#10b981",
										stopOpacity: 0
									})]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									strokeDasharray: "3 3",
									className: "stroke-border"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "name",
									tick: { fontSize: 11 }
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tick: { fontSize: 11 },
									tickFormatter: (value) => `QR ${(value / 1e3).toFixed(0)}k`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { formatter: (value) => [`QR ${value.toLocaleString()}`, "Amount"] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
									type: "monotone",
									dataKey: "amount",
									stroke: "#10b981",
									fill: "url(#colGrad)",
									strokeWidth: 2
								})
							]
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "border-b border-border py-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-sm font-semibold",
						children: "Active Leases - Shared Data"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-muted/10 text-xs text-muted-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2 text-left font-medium",
									children: "Tenant"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2 text-left font-medium",
									children: "Property / Unit"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2 text-left font-medium",
									children: "Period"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2 text-right font-medium",
									children: "Monthly Rent"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2 text-right font-medium",
									children: "PDCs"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2 text-right font-medium",
									children: "Status"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border",
							children: leases.map((lease) => {
								const leasePdcs = pdcs.filter((pdc) => pdc.leaseId === lease.id);
								const cleared = leasePdcs.filter((pdc) => pdc.status === "deposited" || pdc.status === "cleared").length;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-muted/10",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-medium",
											children: lease.tenantName
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3 text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: lease.property }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-muted-foreground",
												children: lease.unit
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3 text-xs text-muted-foreground",
											children: [
												lease.startDate,
												" ",
												"->",
												" ",
												lease.endDate
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3 text-right font-semibold",
											children: ["QR ", lease.monthlyRent.toLocaleString()]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3 text-right text-xs",
											children: [
												cleared,
												"/",
												leasePdcs.length,
												" cleared"
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-xs capitalize",
												children: lease.status.replace(/_/g, " ")
											})
										})
									]
								}, lease.id);
							})
						})]
					})
				})]
			})
		]
	});
}
//#endregion
export { CashierDashboard as component };
