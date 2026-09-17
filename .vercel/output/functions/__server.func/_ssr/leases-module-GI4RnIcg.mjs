import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { F as Search, R as RotateCcw, st as LoaderCircle } from "../_libs/lucide-react.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { n as useAppData } from "./app-data-context-Lw7cnnXe.mjs";
import { a as PaginationNext, i as PaginationLink, n as PaginationContent, o as PaginationPrevious, r as PaginationItem, t as Pagination } from "./pagination-Mm0k59kY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leases-module-GI4RnIcg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LeasesModule({ role }) {
	const { leases: contextLeases } = useAppData();
	const [leases, setLeases] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [currentPage, setCurrentPage] = (0, import_react.useState)(1);
	const ITEMS_PER_PAGE = 15;
	const [propertyFilter, setPropertyFilter] = (0, import_react.useState)("all");
	const [unitFilter, setUnitFilter] = (0, import_react.useState)("all");
	const [customerFilter, setCustomerFilter] = (0, import_react.useState)("all");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const load = (0, import_react.useCallback)(async (showLoading = true) => {
		if (showLoading && leases.length === 0) setLoading(true);
		try {
			let dbLeases = [];
			try {
				const { data, error } = await supabase.from("leases").select("*, properties(title, property_code)").order("created_at", { ascending: false });
				if (!error && data) dbLeases = data;
			} catch (e) {
				console.error(e);
			}
			const mappedContext = (contextLeases || []).map((cl) => ({
				id: cl.id,
				lease_number: cl.id.toUpperCase().startsWith("L") ? cl.id.toUpperCase() : `LES-${cl.id}`,
				properties: { title: cl.property },
				property_name: cl.property,
				unit: cl.unit,
				tenant_name: cl.tenantName,
				commencement_date: cl.startDate,
				expiry_date: cl.endDate,
				rental_amount: cl.monthlyRent ? cl.monthlyRent * 12 : 6e4,
				lease_status: cl.status === "closed" ? "CLOSED" : cl.status === "active" || cl.status === "fully_signed" || cl.status === "collection_completed" ? "ACTIVE" : cl.status === "renewal_due" ? "EXPIRING" : "DRAFT"
			}));
			const allLeases = [...dbLeases];
			for (const mc of mappedContext) if (!allLeases.some((l) => l.id === mc.id || l.lease_number === mc.lease_number)) allLeases.push(mc);
			setLeases(allLeases);
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load(true);
	}, [load]);
	const propertyOptions = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		leases.forEach((l) => {
			const p = l.properties?.title || l.property_name;
			if (p) set.add(p);
		});
		return Array.from(set).sort();
	}, [leases]);
	const unitOptions = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		leases.forEach((l) => {
			if (l.unit) set.add(l.unit);
		});
		return Array.from(set).sort();
	}, [leases]);
	const customerOptions = (0, import_react.useMemo)(() => {
		const set = /* @__PURE__ */ new Set();
		leases.forEach((l) => {
			if (l.tenant_name) set.add(l.tenant_name);
		});
		return Array.from(set).sort();
	}, [leases]);
	const filteredLeases = (0, import_react.useMemo)(() => {
		return leases.filter((l) => {
			const propTitle = (l.properties?.title || l.property_name || "").toLowerCase();
			const unit = (l.unit || "").toLowerCase();
			const tenant = (l.tenant_name || "").toLowerCase();
			const status = (l.lease_status || "").toUpperCase();
			const ref = (l.lease_number || l.id || "").toLowerCase();
			if (propertyFilter !== "all" && (l.properties?.title || l.property_name) !== propertyFilter) return false;
			if (unitFilter !== "all" && l.unit !== unitFilter) return false;
			if (customerFilter !== "all" && l.tenant_name !== customerFilter) return false;
			if (statusFilter !== "all" && status !== statusFilter.toUpperCase()) return false;
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				if (!(ref.includes(q) || propTitle.includes(q) || unit.includes(q) || tenant.includes(q))) return false;
			}
			return true;
		});
	}, [
		leases,
		propertyFilter,
		unitFilter,
		customerFilter,
		statusFilter,
		searchQuery
	]);
	const activeCount = leases.filter((l) => l.lease_status?.toUpperCase() === "ACTIVE").length;
	const draftCount = leases.filter((l) => l.lease_status?.toUpperCase() === "DRAFT").length;
	const expiringCount = leases.filter((l) => l.lease_status?.toUpperCase() === "EXPIRING").length;
	const closedCount = leases.filter((l) => l.lease_status?.toUpperCase() === "CLOSED").length;
	const totalPages = Math.max(1, Math.ceil(filteredLeases.length / ITEMS_PER_PAGE));
	const paginatedLeases = filteredLeases.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
	(0, import_react.useEffect)(() => {
		setCurrentPage(1);
	}, [
		propertyFilter,
		unitFilter,
		customerFilter,
		statusFilter,
		searchQuery
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-1 pt-3 px-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
							children: "Active"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "pb-3 px-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold text-emerald-600",
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : activeCount
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-1 pt-3 px-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
							className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
							children: [
								"Expiring ",
								"<",
								" 90D"
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "pb-3 px-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold text-amber-600",
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : expiringCount
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-1 pt-3 px-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
							children: "Drafts"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "pb-3 px-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold text-slate-600",
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : draftCount
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-1 pt-3 px-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
							children: "Closed / Vacated"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "pb-3 px-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold text-rose-600",
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : closedCount
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-1 pt-3 px-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
							children: "Total Leases"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "pb-3 px-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold text-primary",
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 animate-spin" }) : leases.length
						})
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "border-border",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4 border-b border-border space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-base font-semibold",
						children: "Lease Contracts Registry"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "ghost",
						className: "h-7 text-xs text-muted-foreground gap-1",
						onClick: () => {
							setPropertyFilter("all");
							setUnitFilter("all");
							setCustomerFilter("all");
							setStatusFilter("all");
							setSearchQuery("");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3 w-3" }), " Reset Filters"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: propertyFilter,
							onValueChange: setPropertyFilter,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-8 text-xs bg-background",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Properties" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: "all",
								children: [
									"All Properties (",
									propertyOptions.length,
									")"
								]
							}), propertyOptions.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: p,
								children: p
							}, p))] })]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: unitFilter,
							onValueChange: setUnitFilter,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-8 text-xs bg-background",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Units" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: "all",
								children: [
									"All Units (",
									unitOptions.length,
									")"
								]
							}), unitOptions.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: u,
								children: u
							}, u))] })]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: customerFilter,
							onValueChange: setCustomerFilter,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-8 text-xs bg-background",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Customers" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
								value: "all",
								children: [
									"All Customers (",
									customerOptions.length,
									")"
								]
							}), customerOptions.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
								value: c,
								children: c
							}, c))] })]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: statusFilter,
							onValueChange: setStatusFilter,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-8 text-xs bg-background",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All Statuses" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "all",
									children: "All Statuses"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "ACTIVE",
									children: "Active"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: "EXPIRING",
									children: [
										"Expiring ",
										"<",
										" 90D"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "DRAFT",
									children: "Draft"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "CLOSED",
									children: "Closed / Vacated"
								})
							] })]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								className: "h-8 text-xs pl-8 bg-background",
								placeholder: "Search ref, property, unit, tenant...",
								value: searchQuery,
								onChange: (e) => setSearchQuery(e.target.value)
							})]
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "border-b border-border bg-muted/20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[11px] tracking-wider",
									children: "Ref #"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[11px] tracking-wider",
									children: "Property & Unit"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[11px] tracking-wider",
									children: "Customer / Tenant"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[11px] tracking-wider",
									children: "Start Date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2.5 text-left font-semibold text-muted-foreground uppercase text-[11px] tracking-wider",
									children: "End Date"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2.5 text-right font-semibold text-muted-foreground uppercase text-[11px] tracking-wider",
									children: "Annual Rent"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "px-4 py-2.5 text-center font-semibold text-muted-foreground uppercase text-[11px] tracking-wider",
									children: "Status"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-border",
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								colSpan: 7,
								className: "text-center py-8 text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin mx-auto mb-2 text-primary" }), "Loading leases..."]
							}) }) : filteredLeases.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 7,
								className: "text-center py-8 text-muted-foreground text-xs",
								children: "No matching leases found."
							}) }) : paginatedLeases.map((lease) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "hover:bg-muted/10 transition-colors text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 font-mono font-medium text-primary",
										children: lease.lease_number || "N/A"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-4 py-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-medium",
											children: lease.properties?.title || lease.property_name || "Unknown Property"
										}), lease.unit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[11px] text-muted-foreground font-mono",
											children: ["Unit: ", lease.unit]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 font-medium",
										children: lease.tenant_name || "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-muted-foreground",
										children: lease.commencement_date ? new Date(lease.commencement_date).toLocaleDateString() : "N/A"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-muted-foreground",
										children: lease.expiry_date ? new Date(lease.expiry_date).toLocaleDateString() : "N/A"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-4 py-3 font-mono font-semibold text-right",
										children: ["QAR ", lease.rental_amount?.toLocaleString() || "0"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-4 py-3 text-center",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${lease.lease_status?.toUpperCase() === "ACTIVE" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : lease.lease_status?.toUpperCase() === "EXPIRING" ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300" : lease.lease_status?.toUpperCase() === "CLOSED" ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`,
											children: lease.lease_status || "DRAFT"
										})
									})
								]
							}, lease.id))
						})]
					})
				}), totalPages > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Showing ",
						paginatedLeases.length,
						" of ",
						filteredLeases.length,
						" leases"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, {
						className: "justify-end w-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PaginationContent, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationPrevious, {
								href: "#",
								onClick: (e) => {
									e.preventDefault();
									setCurrentPage((p) => Math.max(1, p - 1));
								},
								className: currentPage === 1 ? "pointer-events-none opacity-50" : ""
							}) }),
							[...Array(totalPages)].map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationLink, {
								href: "#",
								onClick: (e) => {
									e.preventDefault();
									setCurrentPage(i + 1);
								},
								isActive: currentPage === i + 1,
								children: i + 1
							}) }, i)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationItem, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaginationNext, {
								href: "#",
								onClick: (e) => {
									e.preventDefault();
									setCurrentPage((p) => Math.min(totalPages, p + 1));
								},
								className: currentPage === totalPages ? "pointer-events-none opacity-50" : ""
							}) })
						] })
					})]
				})]
			})]
		})]
	});
}
//#endregion
export { LeasesModule };
