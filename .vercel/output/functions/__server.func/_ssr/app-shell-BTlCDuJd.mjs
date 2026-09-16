import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $t as CircleCheck, Yt as CircleX, gt as Info, h as TriangleAlert, in as ChevronRight, ot as LogOut, rt as Megaphone, yn as Bell } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as clearDemoSession } from "./demo-auth-Dw5zdnz8.mjs";
import { r as stopImpersonation, t as getImpersonationSession } from "./impersonation-BBADrwZA.mjs";
import { t as ScrollArea } from "./scroll-area-BlnbM3_c.mjs";
import { i as DropdownMenuTrigger, r as DropdownMenuContent, t as DropdownMenu } from "./dropdown-menu-CqJvCzVX.mjs";
import { i as markNotificationAsRead, r as fetchInAppNotifications } from "./system-config-CsVWXlCy.mjs";
import { g as Link, l as useRouterState, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-BTlCDuJd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InAppNotificationBell() {
	const [notifications, setNotifications] = (0, import_react.useState)([]);
	const [unreadCount, setUnreadCount] = (0, import_react.useState)(0);
	const [open, setOpen] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		loadNotifs();
		const interval = setInterval(loadNotifs, 3e4);
		return () => clearInterval(interval);
	}, []);
	async function loadNotifs() {
		const list = await fetchInAppNotifications();
		setNotifications(list);
		setUnreadCount(list.filter((n) => !n.is_read).length);
	}
	async function handleNotificationClick(n) {
		if (!n.is_read) {
			await markNotificationAsRead(n.id);
			setNotifications((prev) => prev.map((item) => item.id === n.id ? {
				...item,
				is_read: true
			} : item));
			setUnreadCount((prev) => Math.max(0, prev - 1));
		}
		if (n.action_url) {
			setOpen(false);
			navigate({ to: n.action_url });
		}
	}
	const getIcon = (type) => {
		switch (type) {
			case "critical": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-4 w-4 text-red-500 shrink-0" });
			case "warning": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-amber-500 shrink-0" });
			case "success": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-emerald-500 shrink-0" });
			case "announcement": return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "h-4 w-4 text-purple-500 shrink-0" });
			default: return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-4 w-4 text-blue-500 shrink-0" });
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, {
		open,
		onOpenChange: setOpen,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				className: "relative rounded-lg p-2 text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors focus:outline-none",
				title: "Notifications",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" }), unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background animate-pulse",
					children: unreadCount > 9 ? "9+" : unreadCount
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
			align: "end",
			className: "w-80 md:w-96 p-0 shadow-2xl border border-border/80 bg-card rounded-xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs font-bold uppercase tracking-wider text-foreground",
						children: "In-App Notifications"
					}), unreadCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
						className: "bg-primary/15 text-primary border-primary/20 text-[10px] font-bold py-0",
						children: [unreadCount, " New"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => loadNotifs(),
					className: "text-[11px] text-muted-foreground hover:text-foreground font-medium",
					children: "Refresh"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-[380px] overflow-y-auto divide-y divide-border/40",
				children: notifications.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-6 text-center text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-8 w-8 mx-auto mb-2 opacity-30" }), "No notifications yet."]
				}) : notifications.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onClick: () => handleNotificationClick(n),
					className: `p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-muted/40 ${!n.is_read ? "bg-primary/5" : ""}`,
					children: [getIcon(n.type), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 space-y-1 min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: `text-xs font-semibold truncate ${!n.is_read ? "text-foreground" : "text-muted-foreground"}`,
								children: n.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-muted-foreground whitespace-nowrap",
								children: new Date(n.created_at).toLocaleDateString("en-QA", {
									month: "short",
									day: "numeric"
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground line-clamp-2 leading-relaxed",
							children: n.message
						})]
					})]
				}, n.id))
			})]
		})]
	});
}
var SIDEBAR_BG = "bg-[#161b22]";
var SIDEBAR_HEADER = "bg-[#1c2128]";
var SIDEBAR_ITEM_ACT = "bg-[#1f6feb22]";
var ACCENT = "text-teal-400";
var DIVIDER = "border-[#30363d]";
function AppShell({ variant, title, consoleLabel, nav, navGroups, navModules, children, user }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const searchParams = useRouterState({ select: (s) => s.location.search });
	const navigate = useNavigate();
	const profile = user ?? {
		initials: variant === "admin" ? "AD" : variant === "host" ? "PM" : "TP",
		name: variant === "admin" ? "Admin User" : variant === "host" ? "Property Manager" : "Tenant User",
		meta: consoleLabel ?? (variant === "admin" ? "Staff Console" : variant === "host" ? "Host Console" : "Tenant Portal")
	};
	async function handleSignOut() {
		clearDemoSession();
		await supabase.auth.signOut();
		navigate({ to: "/auth" });
	}
	function isItemActive(item) {
		const pathOk = item.to !== "/" && (pathname === item.to || pathname.startsWith(item.to));
		if (item.search?.tab) return pathOk && searchParams?.tab === item.search.tab;
		return pathOk;
	}
	const [impersonation, setImpersonation] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		setImpersonation(getImpersonationSession());
	}, [pathname]);
	function handleExitImpersonation() {
		stopImpersonation();
		navigate({ to: "/super-admin/tenants" });
	}
	if (navModules) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col h-screen overflow-hidden",
		children: [impersonation && impersonation.isImpersonating && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "bg-amber-500 text-slate-950 px-4 py-1.5 flex items-center justify-between text-xs font-semibold z-50 shrink-0 shadow-md",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-2 w-2 rounded-full bg-red-600 animate-ping" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					"SUPPORT IMPERSONATION MODE: Viewing console as Tenant Admin for ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
						"\"",
						impersonation.tenantName,
						"\""
					] }),
					" (",
					impersonation.tenantKey,
					")"
				] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: handleExitImpersonation,
				className: "px-2.5 py-0.5 rounded bg-slate-950 text-white text-[11px] font-bold hover:bg-slate-800 transition-all flex items-center gap-1 shadow-sm",
				children: "Exit Impersonation → Return to Super Admin"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-1 min-h-0 overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavModulesSidebar, {
				navModules,
				consoleLabel,
				profile,
				isItemActive,
				pathname,
				searchParams,
				onSignOut: handleSignOut
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "h-12 border-b flex items-center justify-between px-6 shrink-0 bg-background/95 backdrop-blur-sm gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-sm font-semibold text-foreground truncate",
						children: title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InAppNotificationBell, {})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 overflow-y-auto p-6",
					children
				})]
			})]
		})]
	});
	if (navGroups) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LegacyNavGroupsLayout, {
		navGroups,
		consoleLabel,
		profile,
		title,
		isItemActive,
		onSignOut: handleSignOut,
		children
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-screen overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: cn("hidden md:flex w-56 shrink-0 flex-col border-r h-screen overflow-hidden", DIVIDER, SIDEBAR_BG),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flex items-center gap-3 px-5 py-4 border-b", DIVIDER, SIDEBAR_HEADER),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-8 w-8 items-center justify-center rounded-md bg-teal-500 text-white font-bold text-xs shrink-0",
						children: "Z"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold text-white truncate",
							children: "ZYNO PMS"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-white/40 truncate",
							children: consoleLabel
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "py-3 px-3 space-y-0.5",
						children: nav?.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.to,
							search: item.search,
							className: cn("flex items-center gap-3 px-3 py-2 rounded-md text-xs transition-colors", isItemActive(item) ? cn("text-teal-400", SIDEBAR_ITEM_ACT) : "text-white/60 hover:text-white hover:bg-white/5"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-3.5 w-3.5 shrink-0",
								children: item.icon
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: item.label
							})]
						}, item.to))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("border-t p-3", DIVIDER),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: handleSignOut,
						className: "flex w-full items-center gap-3 px-3 py-2 rounded-md text-xs text-white/50 hover:text-white hover:bg-white/5 transition-colors",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sign out" })]
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "h-12 border-b flex items-center px-6 shrink-0 bg-background/95 backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-sm font-semibold truncate",
					children: title
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 overflow-y-auto p-6",
				children
			})]
		})]
	});
}
function NavModulesSidebar({ navModules, consoleLabel, profile, isItemActive, pathname, searchParams, onSignOut }) {
	function detectExpanded() {
		let bestScore = -1;
		let bestMi = -1;
		let bestGi = -1;
		for (let mi = 0; mi < navModules.length; mi++) for (let gi = 0; gi < navModules[mi].groups.length; gi++) for (const item of navModules[mi].groups[gi].items) {
			if (!isItemActive(item)) continue;
			const score = item.to.length + (item.search?.tab ? 1e3 : 0);
			if (score > bestScore) {
				bestScore = score;
				bestMi = mi;
				bestGi = gi;
			}
		}
		const openMods = /* @__PURE__ */ new Set();
		const openGrps = {};
		if (bestMi !== -1) {
			openMods.add(bestMi);
			openGrps[bestMi] = new Set([bestGi]);
		}
		return {
			openMods,
			openGrps
		};
	}
	const initial = detectExpanded();
	const [openMods, setOpenMods] = (0, import_react.useState)(initial.openMods);
	const [openGrps, setOpenGrps] = (0, import_react.useState)(initial.openGrps);
	(0, import_react.useEffect)(() => {
		const { openMods: om, openGrps: og } = detectExpanded();
		setOpenMods(om);
		setOpenGrps(og);
	}, [pathname, searchParams]);
	function toggleModule(mi) {
		setOpenMods((prev) => {
			const next = new Set(prev);
			if (next.has(mi)) next.delete(mi);
			else {
				next.add(mi);
				setOpenGrps((gPrev) => {
					if (!gPrev[mi] || gPrev[mi].size === 0) return {
						...gPrev,
						[mi]: new Set([0])
					};
					return gPrev;
				});
			}
			return next;
		});
	}
	function toggleGroup(mi, gi) {
		setOpenGrps((prev) => {
			const current = new Set(prev[mi] ?? []);
			if (current.has(gi)) current.delete(gi);
			else current.add(gi);
			return {
				...prev,
				[mi]: current
			};
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
		className: cn("hidden md:flex w-60 shrink-0 flex-col border-r", DIVIDER, SIDEBAR_BG, "overflow-hidden"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex items-center gap-3 px-5 py-4 border-b shrink-0", DIVIDER, SIDEBAR_HEADER),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-8 w-8 items-center justify-center rounded-md bg-teal-500 text-white font-bold text-xs shrink-0",
					children: "Z"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-bold text-white truncate",
						children: "ZYNO PMS"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] text-white/40 truncate",
						children: consoleLabel
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "py-2",
					children: navModules.map((mod, mi) => {
						const isModOpen = openMods.has(mi);
						const modHasActive = mod.groups.some((g) => g.items.some(isItemActive));
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => toggleModule(mi),
							className: cn("w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium transition-colors", modHasActive ? cn(ACCENT, "font-semibold") : isModOpen ? "text-white/80" : "text-white/55 hover:text-white hover:bg-white/5"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("shrink-0 h-4 w-4", modHasActive ? ACCENT : isModOpen ? "text-white/60" : "text-white/35"),
									children: mod.icon
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex-1 truncate",
									children: mod.module
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: cn("h-3 w-3 shrink-0 transition-transform", modHasActive ? "text-teal-400/60" : "text-white/25", isModOpen && "rotate-90") })
							]
						}), isModOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-2 relative",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-3 top-0 bottom-2 w-px bg-white/8" }), mod.groups.map((grp, gi) => {
								const isGrpOpen = openGrps[mi]?.has(gi) ?? false;
								const grpHasActive = grp.items.some(isItemActive);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => toggleGroup(mi, gi),
									className: cn("w-full flex items-center gap-2 pl-6 pr-4 py-2 text-left text-[11px] transition-colors", grpHasActive ? "text-white font-semibold" : "text-white/50 hover:text-white/85 hover:bg-white/4"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("shrink-0 h-3 w-3", grpHasActive ? ACCENT : "text-white/30"),
											children: grp.icon
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex-1 truncate",
											children: grp.group
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: cn("h-2.5 w-2.5 shrink-0 transition-transform", grpHasActive ? "text-teal-400/50" : "text-white/20", isGrpOpen && "rotate-90") })
									]
								}), isGrpOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "ml-3 relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-3 top-0 bottom-1 w-px bg-teal-500/25" }), grp.items.map((item) => {
										const active = isItemActive(item);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: item.to,
											search: item.search,
											className: cn("relative flex items-center gap-2 pl-7 pr-3 py-1.5 text-[10.5px] transition-colors", active ? cn("text-teal-400 font-semibold", SIDEBAR_ITEM_ACT) : "text-white/40 hover:text-white/80 hover:bg-white/4"),
											children: [
												active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-2.5 h-1.5 w-1.5 rounded-full bg-teal-400" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: cn("h-2.5 w-2.5 shrink-0", active ? "text-teal-400" : "text-white/25"),
													children: item.icon
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "truncate",
													children: item.label
												}),
												item.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "ml-auto text-[8px] font-bold bg-teal-500 text-white rounded-full px-1 py-0.5 shrink-0",
													children: item.badge
												})
											]
										}, `${item.to}${item.search?.tab ?? ""}`);
									})]
								})] }, grp.group);
							})]
						})] }, mod.module);
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("border-t shrink-0", DIVIDER),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "px-3 pt-2 pb-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white/25",
						children: "Settings"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: onSignOut,
						className: "flex items-center gap-2 px-2 py-2 rounded-md text-[11px] text-white/50 hover:text-white hover:bg-white/5 transition-colors w-full",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sign out" })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flex items-center gap-3 px-4 py-3 border-t", DIVIDER, SIDEBAR_HEADER),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 text-[11px] font-bold shrink-0",
						children: profile.initials
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] font-semibold text-white truncate",
							children: profile.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[9px] text-white/40 truncate",
							children: profile.meta
						})]
					})]
				})]
			})
		]
	});
}
function LegacyNavGroupsLayout({ navGroups, consoleLabel, profile, title, isItemActive, onSignOut, children }) {
	function findActiveGroup() {
		const idx = navGroups.findIndex((g) => g.items.some(isItemActive));
		return idx >= 0 ? idx : 0;
	}
	const [openGroups, setOpenGroups] = (0, import_react.useState)(() => {
		const s = /* @__PURE__ */ new Set();
		s.add(findActiveGroup());
		return s;
	});
	function toggle(gi) {
		setOpenGroups((prev) => {
			const n = new Set(prev);
			if (n.has(gi)) n.delete(gi);
			else n.add(gi);
			return n;
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-screen overflow-hidden",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
			className: cn("hidden md:flex w-60 shrink-0 flex-col border-r h-screen overflow-hidden", DIVIDER, SIDEBAR_BG),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flex items-center gap-3 px-5 py-4 border-b shrink-0", DIVIDER, SIDEBAR_HEADER),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-8 w-8 items-center justify-center rounded-md bg-teal-500 text-white font-bold text-xs shrink-0",
						children: "Z"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold text-white truncate",
							children: "ZYNO PMS"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[10px] text-white/40 truncate",
							children: consoleLabel
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "py-2",
						children: navGroups.map((grp, gi) => {
							const isOpen = openGroups.has(gi);
							const hasActive = grp.items.some(isItemActive);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => toggle(gi),
									className: cn("w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-xs transition-colors", hasActive ? "text-white font-semibold" : "text-white/60 hover:text-white hover:bg-white/5"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("shrink-0 h-3.5 w-3.5", hasActive ? ACCENT : "text-white/40"),
											children: grp.icon
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex-1 truncate",
											children: grp.group
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: cn("h-3 w-3 shrink-0 transition-transform text-white/30", isOpen && "rotate-90") })
									]
								}), isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "ml-4 relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute left-3 top-0 bottom-0 w-px bg-teal-500/30" }), grp.items.map((item) => {
										const active = isItemActive(item);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
											to: item.to,
											search: item.search,
											className: cn("relative flex items-center gap-2.5 pl-7 pr-4 py-2 text-[11px] transition-colors", active ? cn("text-teal-400 font-semibold", SIDEBAR_ITEM_ACT) : "text-white/50 hover:text-white/90 hover:bg-white/4"),
											children: [
												active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute left-2.5 h-2 w-2 rounded-full bg-teal-400 -translate-x-px" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: cn("h-3 w-3 shrink-0", active ? "text-teal-400" : "text-white/30"),
													children: item.icon
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "truncate",
													children: item.label
												}),
												item.badge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "ml-auto text-[9px] font-bold bg-teal-500 text-white rounded-full px-1.5 py-0.5 shrink-0",
													children: item.badge
												})
											]
										}, `${item.to}${item.search?.tab ?? ""}`);
									})]
								})]
							}, grp.group);
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("border-t shrink-0", DIVIDER),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-3 pt-2 pb-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white/25",
							children: "Settings"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: onSignOut,
							className: "flex items-center gap-2 px-2 py-2 rounded-md text-[11px] text-white/50 hover:text-white hover:bg-white/5 transition-colors w-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "h-3.5 w-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Sign out" })]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("flex items-center gap-3 px-4 py-3 border-t", DIVIDER, SIDEBAR_HEADER),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "inline-flex h-8 w-8 items-center justify-center rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-400 text-[11px] font-bold shrink-0",
							children: profile.initials
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[11px] font-semibold text-white truncate",
								children: profile.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-[9px] text-white/40 truncate",
								children: profile.meta
							})]
						})]
					})]
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "h-12 border-b flex items-center px-6 shrink-0 bg-background/95 backdrop-blur-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-sm font-semibold truncate",
					children: title
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "flex-1 overflow-y-auto p-6",
				children
			})]
		})]
	});
}
//#endregion
export { AppShell as t };
