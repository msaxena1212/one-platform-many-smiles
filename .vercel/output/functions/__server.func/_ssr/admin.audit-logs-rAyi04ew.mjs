import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { I as Search, M as ShieldAlert, Mn as Activity, Pt as Eye, Rt as Download, V as RefreshCw, Yt as CircleX, g as TrendingUp, gt as Info, h as TriangleAlert, j as ShieldCheck, tt as MousePointerClick, yn as Bell } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as fetchSecurityAuditLogs } from "./security-BK-Kx7Zx.mjs";
import { r as fetchInAppNotifications } from "./system-config-CPYcxFsS.mjs";
import { v as useNavigate, y as useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.audit-logs-rAyi04ew.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SEVERITY_CONFIG = {
	info: {
		color: "bg-blue-500/15 text-blue-600 border-blue-500/20",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-3.5 w-3.5" })
	},
	warning: {
		color: "bg-amber-500/15 text-amber-600 border-amber-500/20",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3.5 w-3.5" })
	},
	critical: {
		color: "bg-red-500/15 text-red-600 border-red-500/20",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3.5 w-3.5" })
	}
};
function AdminAuditAndEngagementPage() {
	useNavigate();
	const searchParams = useSearch({ from: "/admin/audit-logs" });
	const [logs, setLogs] = (0, import_react.useState)([]);
	const [notifications, setNotifications] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [search, setSearch] = (0, import_react.useState)("");
	const [severityFilter, setSeverityFilter] = (0, import_react.useState)("All");
	const activeTab = searchParams.tab === "engagement-analytics" ? "engagement-analytics" : "audit-trail";
	(0, import_react.useEffect)(() => {
		loadData();
	}, []);
	async function loadData() {
		setLoading(true);
		try {
			const [auditData, notifData] = await Promise.all([fetchSecurityAuditLogs(), fetchInAppNotifications()]);
			setLogs(auditData);
			setNotifications(notifData);
		} catch (err) {
			toast.error("Failed to load audit & engagement logs: " + err.message);
		} finally {
			setLoading(false);
		}
	}
	const filteredLogs = logs.filter((log) => {
		const matchSearch = (log.action || "").toLowerCase().includes(search.toLowerCase()) || (log.resource || "").toLowerCase().includes(search.toLowerCase()) || (log.event_type || "").toLowerCase().includes(search.toLowerCase()) || (log.user_role || "").toLowerCase().includes(search.toLowerCase());
		const matchSeverity = severityFilter === "All" || log.severity === severityFilter;
		return matchSearch && matchSeverity;
	});
	const totalViews = notifications.reduce((s, n) => s + (n.engagement_count || 0), 0);
	const totalClicks = notifications.reduce((s, n) => s + (n.click_count || 0), 0);
	const avgEngagementRate = totalViews > 0 ? (totalClicks / totalViews * 100).toFixed(1) : "0.0";
	const counts = {
		critical: logs.filter((l) => l.severity === "critical").length,
		warning: logs.filter((l) => l.severity === "warning").length,
		info: logs.filter((l) => l.severity === "info").length,
		total: logs.length
	};
	function exportCSV() {
		if (logs.length === 0) {
			toast.error("No logs to export.");
			return;
		}
		const headers = [
			"Timestamp",
			"Event Type",
			"Severity",
			"Resource",
			"Action",
			"User Role",
			"IP Address",
			"User Agent"
		];
		const rows = logs.map((l) => [
			l.timestamp,
			l.event_type,
			l.severity,
			l.resource || "",
			l.action || "",
			l.user_role || "",
			l.ip_address || "",
			`"${(l.user_agent || "").replace(/"/g, "\"\"")}"`
		]);
		const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `admin_audit_logs_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success("Audit trail logs exported to CSV!");
	}
	const isEngagementView = activeTab === "engagement-analytics";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold tracking-tight text-foreground",
					children: isEngagementView ? "Notification & User Engagement Analytics" : "System-Wide Audit Trail"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: isEngagementView ? "Comprehensive impression analytics, delivery telemetry, CTA clicks, and read conversion rates across tenant broadcasts." : "Detailed ledger of staff actions, security events, database updates, and authentication activity."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: loadData,
						disabled: loading,
						className: "gap-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` }), " Refresh Data"]
					}), !isEngagementView && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: exportCSV,
						className: "gap-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Export CSV"]
					})]
				})]
			}),
			isEngagementView ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border border-indigo-500/20 bg-indigo-500/5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-indigo-600 uppercase tracking-wider",
									children: "Total User Impressions"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4 text-indigo-600" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-2xl font-bold text-indigo-700",
								children: totalViews
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-indigo-600/80",
							children: "Notification reads recorded"
						}) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border border-emerald-500/20 bg-emerald-500/5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-emerald-600 uppercase tracking-wider",
									children: "CTA Button Clicks"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MousePointerClick, { className: "h-4 w-4 text-emerald-600" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-2xl font-bold text-emerald-700",
								children: totalClicks
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-emerald-600/80",
							children: "Active user CTA conversions"
						}) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border border-blue-500/20 bg-blue-500/5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-blue-600 uppercase tracking-wider",
									children: "Average CTR"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4 text-blue-600" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-2xl font-bold text-blue-700",
								children: [avgEngagementRate, "%"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-blue-600/80",
							children: "Click-through rate on dispatches"
						}) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border border-purple-500/20 bg-purple-500/5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-purple-600 uppercase tracking-wider",
									children: "Tracked Dispatches"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4 text-purple-600" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-2xl font-bold text-purple-700",
								children: notifications.length
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-purple-600/80",
							children: "Active & scheduled campaigns"
						}) })]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border border-red-500/20 bg-red-500/5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-red-600 uppercase tracking-wider",
									children: "Critical Events"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "h-4 w-4 text-red-600" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-2xl font-bold text-red-700",
								children: counts.critical
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-red-600/80",
							children: "High-priority security escalations"
						}) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border border-amber-500/20 bg-amber-500/5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-amber-600 uppercase tracking-wider",
									children: "Warnings & Anomalies"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-amber-600" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-2xl font-bold text-amber-700",
								children: counts.warning
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-amber-600/80",
							children: "Permission changes & failed attempts"
						}) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border border-blue-500/20 bg-blue-500/5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-blue-600 uppercase tracking-wider",
									children: "Standard Actions"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-blue-600" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-2xl font-bold text-blue-700",
								children: counts.info
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-blue-600/80",
							children: "Routine operations & queries"
						}) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border border-emerald-500/20 bg-emerald-500/5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-emerald-600 uppercase tracking-wider",
									children: "Total Audit Entries"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-emerald-600" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-2xl font-bold text-emerald-700",
								children: counts.total
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-emerald-600/80",
							children: "Immutable append-only records"
						}) })]
					})
				]
			}),
			!isEngagementView ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border border-border/80 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "p-4 pb-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col sm:flex-row items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative w-full sm:w-80",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Search action, role, resource...",
									value: search,
									onChange: (e) => setSearch(e.target.value),
									className: "pl-9 text-xs"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 w-full sm:w-auto",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Severity:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: severityFilter,
									onChange: (e) => setSeverityFilter(e.target.value),
									className: "rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "All",
											children: "All Severities"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "info",
											children: "Info Only"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "warning",
											children: "Warning Only"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "critical",
											children: "Critical Only"
										})
									]
								})]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-4 pt-4",
						children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "py-12 text-center text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-6 w-6 animate-spin mx-auto mb-2 text-primary" }), "Loading audit logs..."]
						}) : filteredLogs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "py-12 text-center text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-8 w-8 mx-auto mb-2 opacity-30 text-emerald-500" }), "No matching audit logs found."]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto rounded-lg border border-border/60",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-left text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "bg-muted/50 text-muted-foreground font-semibold border-b border-border/60",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3",
											children: "Timestamp (AST)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3",
											children: "Severity"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3",
											children: "Event / Action"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3",
											children: "Resource Target"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3",
											children: "User & Role"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3",
											children: "Client Details"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-border/40",
									children: filteredLogs.map((log, idx) => {
										const sev = SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.info;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "hover:bg-muted/30 transition-colors",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap",
													children: new Date(log.timestamp).toLocaleString("en-QA", {
														timeZone: "Asia/Qatar",
														month: "short",
														day: "numeric",
														hour: "2-digit",
														minute: "2-digit",
														second: "2-digit"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-3 whitespace-nowrap",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														className: `text-[10px] uppercase font-bold gap-1 px-2 py-0.5 ${sev.color}`,
														children: [sev.icon, log.severity]
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "p-3 font-medium text-foreground",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-semibold",
														children: log.action || log.event_type
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-[10px] text-muted-foreground",
														children: log.event_type
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-3 font-mono text-[11px] text-primary",
													children: log.resource || "—"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "p-3 text-muted-foreground",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-medium text-foreground",
														children: log.user_role || "Staff"
													}), log.user_id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-[10px] font-mono text-muted-foreground/80",
														children: [log.user_id.slice(0, 8), "..."]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-3 max-w-xs text-[11px] text-muted-foreground truncate",
													title: JSON.stringify(log.details || {}),
													children: log.details ? JSON.stringify(log.details) : log.user_agent || "—"
												})
											]
										}, log.id || idx);
									})
								})]
							})
						})
					})]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border border-border/80 shadow-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "pb-3 border-b border-border/40",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base font-semibold",
								children: "Notification Broadcast Engagement Feed"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "Individual notification impression and conversion telemetry"
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								className: "bg-primary/10 text-primary border-primary/20 text-xs",
								children: [notifications.length, " Tracked Dispatches"]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-4",
						children: notifications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center py-12 text-muted-foreground text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-8 w-8 mx-auto mb-2 opacity-30" }), "No notification engagements recorded yet."]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto rounded-lg border border-border/60",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-left text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "bg-muted/50 text-muted-foreground font-semibold border-b border-border/60",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3",
											children: "Notification Title"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3",
											children: "Type"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3",
											children: "Audience Target"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3",
											children: "Schedule"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3 text-center",
											children: "User Views"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3 text-center",
											children: "CTA Clicks"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3 text-center",
											children: "CTR (%)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3",
											children: "Sent At (AST)"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-border/40",
									children: notifications.map((n) => {
										const views = n.engagement_count || 0;
										const clicks = n.click_count || 0;
										const ctr = views > 0 ? (clicks / views * 100).toFixed(1) : "0.0";
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "hover:bg-muted/30 transition-colors",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "p-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "font-semibold text-foreground",
														children: n.title
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[11px] text-muted-foreground line-clamp-1",
														children: n.message
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-3",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														className: "text-[10px] uppercase font-bold",
														variant: "outline",
														children: n.type
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-3 font-mono text-[11px] text-primary",
													children: n.target_role
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-3",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														className: "text-[10px] capitalize",
														variant: "secondary",
														children: n.schedule_type || "instant"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-3 text-center font-bold text-foreground",
													children: views
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-3 text-center font-bold text-emerald-600",
													children: clicks
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-3 text-center",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														className: Number(ctr) > 20 ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground",
														children: [ctr, "%"]
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap",
													children: new Date(n.created_at).toLocaleDateString("en-QA", {
														hour: "2-digit",
														minute: "2-digit"
													})
												})
											]
										}, n.id);
									})
								})]
							})
						})
					})]
				})
			})
		]
	});
}
//#endregion
export { AdminAuditAndEngagementPage as component };
