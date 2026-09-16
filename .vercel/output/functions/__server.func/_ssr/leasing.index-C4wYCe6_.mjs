import { i as __toESM } from "../_runtime.mjs";
import { B as supabase, C as fetchLeases } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { Gt as Clock, Tn as ArrowUpRight, hn as Building, jt as FilePenLine } from "../_libs/lucide-react.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { c as ResponsiveContainer, i as XAxis, l as Tooltip, n as BarChart, o as CartesianGrid, r as YAxis, s as Bar } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leasing.index-C4wYCe6_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Get reservations expiring soon (within daysAhead days).
* Uses the correct table name (lease_reservations) and filter field (valid_until).
*/
async function getExpiringReservations(daysAhead = 7) {
	const fromDate = /* @__PURE__ */ new Date();
	fromDate.setDate(fromDate.getDate() + 1);
	const toDate = /* @__PURE__ */ new Date();
	toDate.setDate(toDate.getDate() + daysAhead);
	const { data, error } = await supabase.from("lease_reservations").select("*").gte("valid_until", fromDate.toISOString().split("T")[0]).lte("valid_until", toDate.toISOString().split("T")[0]).neq("status", "converted").neq("status", "expired").neq("status", "released");
	if (error) {
		console.error("Error fetching expiring reservations:", error);
		return [];
	}
	return data;
}
/**
* Checks for reservations expiring within 24 hours and triggers browser notifications.
* Falls back to a console warning when browser notifications are unavailable or denied.
*/
async function checkExpiringReservationsAndNotify() {
	try {
		const expiringReservations = await getExpiringReservations(1);
		for (const reservation of expiringReservations) {
			const unitRef = reservation["unit_ref"] ?? reservation["unit"] ?? "unknown unit";
			const tenantName = reservation["prospect_name"] ?? reservation["tenantName"] ?? "unknown tenant";
			if (typeof window === "undefined") {
				console.warn(`Reservation ${reservation.id} (${tenantName}) is expiring soon.`);
				continue;
			}
			if (!("Notification" in window)) {
				console.warn(`Reservation ${reservation.id} expiring soon – browser notifications not supported.`);
				continue;
			}
			const showNotification = () => {
				new Notification("Reservation Expiring Soon", {
					body: `Reservation for unit ${unitRef} by ${tenantName} expires within 24 hours.`,
					icon: "/favicon.ico"
				});
			};
			if (Notification.permission === "granted") showNotification();
			else if (Notification.permission !== "denied") Notification.requestPermission().then((permission) => {
				if (permission === "granted") showNotification();
			});
			else console.warn(`Reservation ${reservation.id} (${tenantName} – ${unitRef}) is expiring soon.`);
		}
	} catch (error) {
		console.error("Error checking expiring reservations for notification:", error);
	}
}
function LeasingDashboard() {
	const [leases, setLeases] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		async function loadData() {
			try {
				setLeases(await fetchLeases());
			} catch (err) {
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		loadData();
	}, []);
	(0, import_react.useEffect)(() => {
		const intervalId = setInterval(() => {
			checkExpiringReservationsAndNotify();
		}, 300 * 1e3);
		return () => clearInterval(intervalId);
	}, []);
	const activeLeases = leases.filter((l) => l.lease_status === "Active").length;
	const pendingLeases = leases.filter((l) => l.lease_status === "Pending").length;
	const chartData = [
		{
			name: "Jan",
			newLeases: 4,
			renewals: 2
		},
		{
			name: "Feb",
			newLeases: 6,
			renewals: 1
		},
		{
			name: "Mar",
			newLeases: 8,
			renewals: 5
		},
		{
			name: "Apr",
			newLeases: 3,
			renewals: 7
		},
		{
			name: "May",
			newLeases: Math.floor(Math.random() * 10),
			renewals: 4
		},
		{
			name: "Jun",
			newLeases: activeLeases,
			renewals: pendingLeases
		}
	];
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex h-64 items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" })
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8 animate-in fade-in duration-500",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-center justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold tracking-tight",
					children: "Leasing Overview"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground mt-1",
					children: "Monitor occupancy, lease executions, and renewals."
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-sm font-medium text-muted-foreground",
								children: "Active Leases"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-4 w-4" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-3xl font-bold",
							children: activeLeases
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-emerald-600 flex items-center mt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3 w-3 mr-1" }), "+12% from last month"]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-sm font-medium text-muted-foreground",
								children: "Pending Approvals"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-3xl font-bold",
							children: pendingLeases
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: "Awaiting signatures or deposit"
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-border/50 shadow-sm transition-all hover:shadow-md",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-sm font-medium text-muted-foreground",
								children: "Overall Occupancy"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building, { className: "h-4 w-4" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-3xl font-bold",
							children: "87%"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-emerald-600 flex items-center mt-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3 w-3 mr-1" }), "+2.4% from last quarter"]
						})] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 md:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/50 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Leasing Activity" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "h-[300px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
							width: "100%",
							height: "100%",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
								data: chartData,
								margin: {
									top: 10,
									right: 10,
									left: -20,
									bottom: 0
								},
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
										strokeDasharray: "3 3",
										vertical: false,
										stroke: "#e2e8f0"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
										dataKey: "name",
										axisLine: false,
										tickLine: false,
										tick: {
											fontSize: 12,
											fill: "#64748b"
										},
										dy: 10
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
										axisLine: false,
										tickLine: false,
										tick: {
											fontSize: 12,
											fill: "#64748b"
										}
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
										contentStyle: {
											borderRadius: "8px",
											border: "none",
											boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
										},
										cursor: { fill: "#f1f5f9" }
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "newLeases",
										name: "New Leases",
										fill: "#3b82f6",
										radius: [
											4,
											4,
											0,
											0
										],
										barSize: 32
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
										dataKey: "renewals",
										name: "Renewals",
										fill: "#10b981",
										radius: [
											4,
											4,
											0,
											0
										],
										barSize: 32
									})
								]
							})
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/50 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Recent Leases" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [leases.slice(0, 5).map((lease) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: lease.lease_number
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm text-muted-foreground",
									children: [
										lease.payment_frequency,
										" • QAR ",
										lease.rental_amount.toLocaleString()
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `px-2.5 py-1 rounded-full text-xs font-medium ${lease.lease_status === "Active" ? "bg-emerald-100 text-emerald-700" : lease.lease_status === "Pending" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"}`,
								children: lease.lease_status
							})]
						}, lease.id)), leases.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-center py-8 text-muted-foreground text-sm",
							children: "No leases found."
						})]
					}) })]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex justify-center mt-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: checkExpiringReservationsAndNotify,
					className: "bg-yellow-600 text-white px-4 py-2 rounded",
					children: "Check Expiring Reservations"
				})
			})
		]
	});
}
//#endregion
export { LeasingDashboard as component };
