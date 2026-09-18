import { i as __toESM } from "../_runtime.mjs";
import { B as supabase, f as fetchAllProperties } from "./supabase-y7n1teoy.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { G as Plus, Z as Package, ct as LoaderCircle, un as ChartNoAxesColumnIncreasing, vt as House } from "../_libs/lucide-react.mjs";
import { g as Link, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prop-mgr.index-CJ11QYM2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FALLBACK_IMAGE = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=100";
function HostDashboard() {
	useNavigate();
	const [properties, setProperties] = (0, import_react.useState)([]);
	const [hostName, setHostName] = (0, import_react.useState)("Host");
	const [stats, setStats] = (0, import_react.useState)({
		properties: 0,
		units: 0,
		activeLeases: 0,
		monthlyRevenue: 0,
		pendingTickets: 0,
		assetsCount: 0,
		employeesCount: 0
	});
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		async function loadDashboard() {
			const { data: { session } } = await supabase.auth.getSession();
			if (session?.user) {
				const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", session.user.id).single();
				if (profile) setHostName(profile.full_name.split(" ")[0]);
			}
			fetchAllProperties().then(setProperties).catch(console.error).finally(() => setLoading(false));
			try {
				const { count: propCount } = await supabase.from("properties").select("*", {
					count: "exact",
					head: true
				});
				const { count: unitCount } = await supabase.from("units").select("*", {
					count: "exact",
					head: true
				});
				const { count: leaseCount } = await supabase.from("leases").select("*", {
					count: "exact",
					head: true
				}).eq("lease_status", "ACTIVE");
				const { data: propData } = await supabase.from("properties").select("id");
				const propIds = propData?.map((p) => p.id) || [];
				let assetsCount = 0;
				let empIds = /* @__PURE__ */ new Set();
				if (propIds.length > 0) {
					const { data: assetsData } = await supabase.from("assets").select("id, assigned_employee_id").in("assigned_property_id", propIds);
					if (assetsData) {
						assetsCount = assetsData.length;
						assetsData.forEach((a) => {
							if (a.assigned_employee_id) empIds.add(a.assigned_employee_id);
						});
					}
				}
				setStats({
					properties: propCount || 0,
					units: unitCount || 0,
					activeLeases: leaseCount || 0,
					monthlyRevenue: 0,
					pendingTickets: 0,
					assetsCount,
					employeesCount: empIds.size
				});
			} catch (e) {
				console.warn("Could not load full stats, using defaults/partial");
			}
		}
		loadDashboard();
	}, []);
	const activeCount = properties.filter((p) => p.is_active).length;
	properties.reduce((sum, p) => sum + p.base_price_per_night * 15, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-3xl font-bold tracking-tight",
					children: ["Welcome back, ", hostName]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground mt-2",
					children: "Manage your properties and reservations."
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 md:grid-cols-4 mb-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-sm font-medium text-muted-foreground",
								children: "Active Listings"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-4 w-4 text-primary" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold text-foreground",
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-primary" }) : activeCount
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Properties live in portfolio"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-sm font-medium text-muted-foreground",
								children: "Active Leases"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartNoAxesColumnIncreasing, { className: "h-4 w-4 text-primary" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold text-foreground",
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-primary" }) : stats.activeLeases
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Currently active contracts"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-sm font-medium text-muted-foreground",
								children: "Available Units"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "h-4 w-4 text-primary" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold text-foreground",
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-primary" }) : stats.units
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Total rentable units"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-sm font-medium text-muted-foreground",
								children: "Linked Assets"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4 text-primary" })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold text-foreground",
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-primary" }) : stats.assetsCount
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Assigned to your properties"
						})] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Your Properties" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-center py-12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-muted-foreground",
						children: "Loading properties..."
					})]
				}) : properties.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-center py-12 text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(House, { className: "mx-auto h-12 w-12 mb-4 opacity-30" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: "No properties yet"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm mt-1",
							children: "Get started by creating your first listing."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "mt-4 bg-primary hover:bg-primary/90 text-primary-foreground",
							onClick: () => alert("Create property coming soon!"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " Create listing"]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "relative w-full overflow-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full caption-bottom text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-border",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
									children: "Property"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
									children: "Price/Night"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
									children: "Location"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "h-12 px-4 text-right align-middle font-medium text-muted-foreground",
									children: "Action"
								})
							]
						}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: properties.map((property) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border hover:bg-muted/50 transition-colors",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4 align-middle font-medium",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "h-10 w-10 rounded bg-muted overflow-hidden flex-shrink-0",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: property.property_images?.find((i) => i.is_primary)?.image_url || property.property_images?.[0]?.image_url || FALLBACK_IMAGE,
													className: "object-cover h-full w-full",
													alt: property.title
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "line-clamp-1",
												children: property.title
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4 align-middle",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${property.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`,
											children: property.is_active ? "Active" : "Unlisted"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "p-4 align-middle",
										children: ["$", property.base_price_per_night]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "p-4 align-middle text-muted-foreground",
										children: [
											property.city,
											", ",
											property.country
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "p-4 align-middle text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											variant: "outline",
											size: "sm",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
												to: "/prop-mgr/manage/$id",
												params: { id: property.id },
												children: "Manage"
											})
										})
									})
								]
							}, property.id);
						}) })]
					})
				}) })]
			})
		]
	});
}
//#endregion
export { HostDashboard as component };
