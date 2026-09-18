import { i as __toESM } from "../_runtime.mjs";
import { B as supabase, f as fetchAllProperties } from "./supabase-y7n1teoy.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { Dn as ArrowRight, ct as LoaderCircle, g as TrendingUp, gn as Building2, jt as FilePenLine, o as Wallet, r as Wrench } from "../_libs/lucide-react.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as CardContent, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { s as formatSAR } from "./mock-data-B9OWnoA7.mjs";
import { t as StatCard } from "./stat-card-D1sG2ZF1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.index-CSaZLlCc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminDashboard() {
	const [properties, setProperties] = (0, import_react.useState)([]);
	const [stats, setStats] = (0, import_react.useState)({
		unitsCount: 0,
		activeLeases: 0,
		openTickets: 0,
		collected: 0
	});
	const [recentTickets, setRecentTickets] = (0, import_react.useState)([]);
	const [expiringLeases, setExpiringLeases] = (0, import_react.useState)([]);
	const [propertyOccupancies, setPropertyOccupancies] = (0, import_react.useState)({});
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		async function loadData() {
			try {
				const [props, unitsRes, leasesRes, { data: ticketsData, count: ticketCount }, { data: paymentsData }, { data: expiringData }] = await Promise.all([
					fetchAllProperties().catch(() => []),
					supabase.from("units").select("id, unit_ref, unit_name, status, lease_status, current_tenant, contract_no, contract_start_date, contract_end_date, current_rent, price, property_id"),
					supabase.from("leases").select("*, properties(title), units(unit_number), customers:customer_id(full_name)"),
					supabase.from("maintenance_tickets").select("*", { count: "exact" }).in("status", [
						"OPEN",
						"IN_PROGRESS",
						"ASSIGNED",
						"new",
						"assigned",
						"in_progress"
					]).order("created_at", { ascending: false }).limit(5),
					supabase.from("payments").select("amount, paid_at, created_at").limit(100),
					supabase.from("leases").select("*, properties(title)").in("lease_status", ["ACTIVE", "active"]).order("end_date", { ascending: true }).limit(5)
				]);
				const allUnits = unitsRes.data || [];
				const allLeases = leasesRes.data || [];
				const unitCount = allUnits.length;
				const occupiedUnits = allUnits.filter((u) => u.status?.toLowerCase() === "occupied" || u.lease_status?.toLowerCase() === "leased" && u.status?.toLowerCase() !== "available" || u.current_tenant && u.current_tenant.trim().length > 0);
				const leaseCount = Math.max(occupiedUnits.length, allLeases.filter((l) => (l.lease_status || "").toUpperCase() === "ACTIVE").length);
				const propOccMap = {};
				props.forEach((prop) => {
					const pUnits = allUnits.filter((u) => {
						if (u.property_id === prop.id) return true;
						const uProp = (u.property_id || "").trim().toLowerCase();
						const pId = (prop.id || "").trim().toLowerCase();
						const pCode = (prop.property_code || "").trim().toLowerCase();
						const pTitle = (prop.title || "").trim().toLowerCase();
						return uProp === pId || pCode && uProp === pCode || pTitle && uProp === pTitle;
					});
					const pOcc = pUnits.filter((u) => u.status?.toLowerCase() === "occupied" || u.lease_status?.toLowerCase() === "leased" && u.status?.toLowerCase() !== "available" || u.current_tenant && u.current_tenant.trim().length > 0).length;
					propOccMap[prop.id] = {
						total: pUnits.length,
						occupied: pOcc
					};
				});
				setPropertyOccupancies(propOccMap);
				const combinedExpirations = [];
				const seenKeys = /* @__PURE__ */ new Set();
				(expiringData || []).forEach((l) => {
					const key = `${l.tenant_name || ""}-${l.end_date || ""}`;
					if (!seenKeys.has(key)) {
						seenKeys.add(key);
						combinedExpirations.push({
							id: l.id || l.lease_number,
							tenant_name: l.tenant_name || l.customers?.full_name || "Active Tenant",
							end_date: l.end_date || l.expiry_date || "2026-12-31",
							rent_amount: l.rent_amount || l.rental_amount || l.monthly_rent || 6500
						});
					}
				});
				(/* @__PURE__ */ new Date()).toISOString().split("T")[0];
				occupiedUnits.filter((u) => u.contract_end_date).sort((a, b) => a.contract_end_date > b.contract_end_date ? 1 : -1).forEach((u) => {
					const key = `${u.current_tenant}-${u.contract_end_date}`;
					if (!seenKeys.has(key)) {
						seenKeys.add(key);
						combinedExpirations.push({
							id: u.id || u.unit_ref,
							tenant_name: u.current_tenant ? `${u.current_tenant} (${u.unit_ref || u.unit_name})` : u.unit_ref || "Unit Tenant",
							end_date: u.contract_end_date,
							rent_amount: u.current_rent || u.price || 6500
						});
					}
				});
				const now = /* @__PURE__ */ new Date();
				const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
				let mtdTotal = 0;
				if (paymentsData && paymentsData.length > 0) mtdTotal = paymentsData.reduce((sum, p) => {
					return new Date(p.paid_at || p.created_at).getTime() >= startOfMonth ? sum + Number(p.amount || 0) : sum;
				}, 0);
				setProperties(props);
				setRecentTickets(ticketsData || []);
				setExpiringLeases(combinedExpirations.slice(0, 5));
				setStats({
					unitsCount: unitCount || 0,
					activeLeases: leaseCount || 0,
					openTickets: ticketCount || 0,
					collected: mtdTotal
				});
			} catch (err) {
				console.error("Failed to load admin stats:", err);
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, []);
	const totalUnits = stats.unitsCount;
	const activeLeases = stats.activeLeases;
	const occupancyRate = totalUnits > 0 ? Math.round(activeLeases / totalUnits * 100) : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Portfolio",
						value: loading ? "Loading..." : `${properties.length} properties`,
						hint: `${totalUnits} units total`,
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Occupancy",
						value: loading ? "..." : `${occupancyRate}%`,
						tone: occupancyRate > 0 ? "success" : "default",
						delta: occupancyRate > 0 ? "▲ Live" : "0 active",
						hint: "Active leases / Units",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Collected (MTD)",
						value: loading ? "..." : formatSAR(stats.collected),
						tone: "default",
						delta: "QAR",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatCard, {
						label: "Open tickets",
						value: loading ? "..." : String(stats.openTickets),
						tone: "default",
						hint: "0 pending resolution",
						icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-4 w-4" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "lg:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-base font-semibold",
								children: "Portfolio at a glance"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "ghost",
								size: "sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/admin/properties",
									children: ["All properties ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1 h-4 w-4" })]
								})
							})]
						}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-center py-8 text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin mr-2 text-primary" }), " Loading portfolio..."]
						}) : properties.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-center py-8 text-muted-foreground text-sm",
							children: "No properties registered yet."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 space-y-3",
							children: properties.slice(0, 5).map((p) => {
								const occ = propertyOccupancies[p.id] || {
									total: 0,
									occupied: 0
								};
								const occPercent = occ.total > 0 ? Math.round(occ.occupied / occ.total * 100) : p.is_active ? 100 : 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-12 items-center gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "col-span-5 min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate font-medium",
												children: p.title
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs text-muted-foreground",
												children: [
													p.city,
													" · ",
													occ.total > 0 ? `${occ.occupied}/${occ.total} Occupied` : p.property_type || "Residential"
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "col-span-5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-2 overflow-hidden rounded-full bg-secondary",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "h-full rounded-full bg-primary",
													style: { width: `${occPercent}%` }
												})
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "col-span-2 text-right text-sm font-medium",
											children: occ.total > 0 ? `${occPercent}%` : p.is_active ? "Active" : "Unlisted"
										})
									]
								}, p.id);
							})
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-semibold",
							children: "Approvals queue"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 text-center py-6 text-muted-foreground text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "mx-auto h-8 w-8 mb-2 opacity-30" }), "All approval queues are clear."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "mt-5 w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/admin/leases",
								children: "Open Lease Registry"
							})
						})
					]
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-semibold",
							children: "Active Service Tickets"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/admin/maintenance",
								children: ["View all ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1 h-3.5 w-3.5" })]
							})
						})]
					}), recentTickets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center py-6 text-muted-foreground text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "mx-auto h-8 w-8 mb-2 opacity-30" }), "No open maintenance tickets in queue."]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2.5",
						children: recentTickets.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold text-foreground",
									children: t.title || t.subject || "Maintenance Request"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] text-muted-foreground",
									children: [
										t.category || "General",
										" • Unit: ",
										t.unit_ref || "Main"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-600 border border-amber-500/20",
								children: t.status || "OPEN"
							})]
						}, t.id))
					})]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-base font-semibold",
							children: "Upcoming Lease Expirations"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "ghost",
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/admin/leases",
								children: ["All leases ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-1 h-3.5 w-3.5" })]
							})
						})]
					}), expiringLeases.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center py-6 text-muted-foreground text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "mx-auto h-8 w-8 mb-2 opacity-30" }), "No leases pending renewal or review."]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2.5",
						children: expiringLeases.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-semibold text-foreground",
									children: l.tenant_name || "Tenant Contract"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] text-muted-foreground",
									children: ["Expires: ", l.end_date || "Within 90 Days"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "font-mono font-bold text-primary text-xs",
								children: [
									"QAR ",
									Number(l.rent_amount || l.monthly_rent || 6500).toLocaleString(),
									"/mo"
								]
							})]
						}, l.id))
					})]
				}) })]
			})
		]
	});
}
//#endregion
export { AdminDashboard as component };
