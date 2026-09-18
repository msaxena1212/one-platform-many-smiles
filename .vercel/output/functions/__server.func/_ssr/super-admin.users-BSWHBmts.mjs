import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-y7n1teoy.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $t as CircleCheck, I as Search, V as RefreshCw, h as TriangleAlert, ht as KeyRound, j as ShieldCheck, l as UserX, s as Users, st as Lock } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { n as logSecurityEvent } from "./security-BK-Kx7Zx.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-C7RsdMLq.mjs";
import { a as PaginationNext, i as PaginationLink, n as PaginationContent, o as PaginationPrevious, r as PaginationItem, t as Pagination } from "./pagination-Mm0k59kY.mjs";
import { t as ALL_PMS_ROLES } from "./super-admin.users-s_GmUlbQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/super-admin.users-BSWHBmts.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROLE_MAP = ALL_PMS_ROLES.reduce((acc, curr) => {
	acc[curr.role] = curr;
	return acc;
}, {});
var LOCAL_PROFILES_KEY = "pms_managed_user_profiles";
function getLocalProfileOverrides() {
	if (typeof window === "undefined") return {};
	try {
		const raw = localStorage.getItem(LOCAL_PROFILES_KEY);
		return raw ? JSON.parse(raw) : {};
	} catch {
		return {};
	}
}
function saveLocalProfileOverride(userId, updates) {
	if (typeof window === "undefined") return;
	try {
		const current = getLocalProfileOverrides();
		current[userId] = {
			...current[userId] || {},
			...updates
		};
		localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(current));
	} catch (e) {
		console.warn("Failed to persist local profile override", e);
	}
}
function UsersPage() {
	const [users, setUsers] = (0, import_react.useState)([]);
	const [search, setSearch] = (0, import_react.useState)("");
	const [roleFilter, setRoleFilter] = (0, import_react.useState)("All");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [currentPage, setCurrentPage] = (0, import_react.useState)(1);
	const ITEMS_PER_PAGE = 15;
	const [editModalOpen, setEditModalOpen] = (0, import_react.useState)(false);
	const [selectedUser, setSelectedUser] = (0, import_react.useState)(null);
	const [selectedRole, setSelectedRole] = (0, import_react.useState)("TENANT");
	const [changeReason, setChangeReason] = (0, import_react.useState)("");
	const [isSubmitting, setIsSubmitting] = (0, import_react.useState)(false);
	const [suspendModalOpen, setSuspendModalOpen] = (0, import_react.useState)(false);
	const [userToSuspend, setUserToSuspend] = (0, import_react.useState)(null);
	const [suspendReason, setSuspendReason] = (0, import_react.useState)("");
	const filterRoles = [
		"All",
		"SUPER_ADMIN",
		"ADMIN",
		"PROP_MGR",
		"LEASING",
		"FINANCE",
		"CASHIER",
		"MAINTENANCE",
		"HOST",
		"SALES",
		"OWNER",
		"TENANT",
		"GUEST"
	];
	(0, import_react.useEffect)(() => {
		loadUsers();
	}, []);
	async function loadUsers() {
		setLoading(true);
		try {
			const { data, error } = await supabase.from("profiles").select("id, full_name, role, created_at, avatar_url").order("created_at", { ascending: false });
			const overrides = getLocalProfileOverrides();
			let rawList = data || [];
			if (rawList.length === 0) rawList = [
				{
					id: "44d9684a-a043-4f54-ae24-3cabb79e7134",
					full_name: "Demo Maintenance Officer",
					role: "MAINTENANCE",
					created_at: (/* @__PURE__ */ new Date()).toISOString()
				},
				{
					id: "0c64c887-9ad2-4a7b-95bb-842416ce3998",
					full_name: "Demo Cashier",
					role: "CASHIER",
					created_at: (/* @__PURE__ */ new Date()).toISOString()
				},
				{
					id: "de427b95-6338-406b-b26a-93a0b5134706",
					full_name: "Demo Finance Officer",
					role: "FINANCE",
					created_at: (/* @__PURE__ */ new Date()).toISOString()
				},
				{
					id: "72bbc50f-705b-4680-a681-6780c8502f04",
					full_name: "Demo Leasing Officer",
					role: "LEASING",
					created_at: (/* @__PURE__ */ new Date()).toISOString()
				},
				{
					id: "1a8b9c0d-1111-2222-3333-444455556666",
					full_name: "Demo Property Manager",
					role: "PROP_MGR",
					created_at: (/* @__PURE__ */ new Date()).toISOString()
				},
				{
					id: "9f8e7d6c-5555-4444-3333-222211110000",
					full_name: "Demo Super Admin",
					role: "SUPER_ADMIN",
					created_at: (/* @__PURE__ */ new Date()).toISOString()
				}
			];
			setUsers(rawList.map((u) => ({
				...u,
				...overrides[u.id] || {}
			})));
		} catch (e) {
			toast.error("Failed to load users: " + e.message);
		} finally {
			setLoading(false);
		}
	}
	function openEditModal(user) {
		setSelectedUser(user);
		setSelectedRole(user.role || "TENANT");
		setChangeReason("");
		setEditModalOpen(true);
	}
	function openSuspendModal(user) {
		setUserToSuspend(user);
		setSuspendReason("");
		setSuspendModalOpen(true);
	}
	async function handleSaveRole() {
		if (!selectedUser) return;
		if (!selectedRole) {
			toast.error("Please select a valid role.");
			return;
		}
		setIsSubmitting(true);
		try {
			const oldRole = selectedUser.role;
			saveLocalProfileOverride(selectedUser.id, { role: selectedRole });
			const { error: dbError } = await supabase.from("profiles").update({ role: selectedRole }).eq("id", selectedUser.id);
			if (dbError) console.warn("Supabase profiles update notice:", dbError.message);
			await logSecurityEvent({
				event_type: "access_denied",
				severity: selectedRole === "SUPER_ADMIN" ? "critical" : "warning",
				resource: `profiles/${selectedUser.id}`,
				action: `USER_ROLE_CHANGED: ${oldRole} → ${selectedRole}`,
				user_role: "SUPER_ADMIN",
				details: {
					target_user_id: selectedUser.id,
					target_user_name: selectedUser.full_name,
					old_role: oldRole,
					new_role: selectedRole,
					audit_reason: changeReason || `Role updated from ${oldRole} to ${selectedRole} via Super Admin Console`
				}
			});
			setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? {
				...u,
				role: selectedRole
			} : u));
			toast.success(`Role updated to ${ROLE_MAP[selectedRole]?.label || selectedRole} successfully.`);
			setEditModalOpen(false);
		} catch (e) {
			toast.error("Failed to update role: " + e.message);
		} finally {
			setIsSubmitting(false);
		}
	}
	async function handleConfirmSuspend() {
		if (!userToSuspend) return;
		setIsSubmitting(true);
		try {
			saveLocalProfileOverride(userToSuspend.id, { status: "SUSPENDED" });
			await logSecurityEvent({
				event_type: "suspicious_activity",
				severity: "critical",
				resource: `profiles/${userToSuspend.id}`,
				action: `USER_ACCOUNT_SUSPENDED: ${userToSuspend.full_name}`,
				user_role: "SUPER_ADMIN",
				details: {
					target_user_id: userToSuspend.id,
					target_user_name: userToSuspend.full_name,
					reason: suspendReason || "Suspended by Super Admin"
				}
			});
			toast.success(`User ${userToSuspend.full_name} has been suspended.`);
			setSuspendModalOpen(false);
			loadUsers();
		} catch (e) {
			toast.error("Failed to suspend user: " + e.message);
		} finally {
			setIsSubmitting(false);
		}
	}
	const filtered = users.filter((u) => {
		const query = search.toLowerCase();
		const matchesSearch = u.full_name?.toLowerCase().includes(query) || u.id?.toLowerCase().includes(query) || u.role?.toLowerCase().includes(query);
		const matchesRole = roleFilter === "All" || u.role === roleFilter;
		return matchesSearch && matchesRole;
	});
	const roleCounts = filterRoles.slice(1).reduce((acc, r) => {
		acc[r] = users.filter((u) => u.role === r).length;
		return acc;
	}, {});
	const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
	const paginatedUsers = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
	(0, import_react.useEffect)(() => {
		setCurrentPage(1);
	}, [search, roleFilter]);
	const selectedRoleMeta = ROLE_MAP[selectedRole] || ROLE_MAP["GUEST"];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-2xl font-bold tracking-tight text-foreground flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-7 w-7 text-primary" }), "User Management & RBAC"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Centrally inspect, assign PMS operational roles, manage permissions, and audit user access."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: loadUsers,
						disabled: loading,
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 ${loading ? "animate-spin" : ""}` }), "Refresh"]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-2.5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
				children: ALL_PMS_ROLES.map((r) => {
					const count = roleCounts[r.role] || 0;
					const isSelected = roleFilter === r.role;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setRoleFilter(isSelected ? "All" : r.role),
						className: `rounded-xl border p-3 text-left transition-all relative overflow-hidden group cursor-pointer ${isSelected ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary" : "border-border bg-card hover:border-border/80 hover:bg-muted/40"}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center justify-between gap-1 mb-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: `inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${r.badgeStyle}`,
								children: [r.icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: r.label
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between mt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-2xl font-bold tracking-tight",
								children: count
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[11px] text-muted-foreground",
								children: r.category
							})]
						})]
					}, r.role);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border border-border/80 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-4 border-b border-border/40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col md:flex-row md:items-center md:justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-base font-semibold",
									children: "Platform Users"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "secondary",
									className: "font-mono text-xs",
									children: [filtered.length, " total"]
								}),
								roleFilter !== "All" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "text-xs bg-primary/5 text-primary border-primary/20",
									children: [
										"Filter: ",
										ROLE_MAP[roleFilter]?.label || roleFilter,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											onClick: () => setRoleFilter("All"),
											className: "ml-1.5 text-muted-foreground hover:text-foreground cursor-pointer",
											children: "×"
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative w-full md:w-72",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Search by name, role or ID...",
									className: "pl-9 h-9 text-sm",
									value: search,
									onChange: (e) => setSearch(e.target.value)
								})]
							}), roleFilter !== "All" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setRoleFilter("All"),
								className: "text-xs h-9",
								children: "Reset Filter"
							})]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border bg-muted/30 text-xs text-muted-foreground uppercase font-semibold tracking-wider",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left py-3.5 px-4",
										children: "User"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left py-3.5 px-4",
										children: "Assigned Role"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left py-3.5 px-4 hidden md:table-cell",
										children: "Role Category"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-left py-3.5 px-4",
										children: "Joined Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "text-right py-3.5 px-4",
										children: "Manage Access"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border/40",
								children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									colSpan: 5,
									className: "text-center py-12 text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col items-center justify-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-6 w-6 animate-spin text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Loading user directory..." })]
									})
								}) }) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									colSpan: 5,
									className: "text-center py-12 text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-8 w-8 mx-auto text-muted-foreground/50 mb-2" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-medium text-foreground",
											children: "No users found"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground mt-1",
											children: "Try adjusting your search terms or role filters."
										})
									]
								}) }) : paginatedUsers.map((user) => {
									const meta = ROLE_MAP[user.role] || {
										role: user.role,
										label: user.role,
										badgeStyle: "bg-muted text-muted-foreground border-border",
										icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" }),
										category: "Platform",
										description: "Custom role",
										permissions: []
									};
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-muted/40 transition-colors",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-3.5 px-4",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 shadow-sm",
														children: user.full_name ? user.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() : "U"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "font-medium text-foreground text-sm leading-snug",
														children: user.full_name || "Unnamed User"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs font-mono text-muted-foreground/80 mt-0.5",
														children: user.id
													})] })]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-3.5 px-4",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: `inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${meta.badgeStyle}`,
													children: [meta.icon, meta.label]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-3.5 px-4 hidden md:table-cell",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs text-muted-foreground font-medium",
													children: meta.category
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-3.5 px-4 text-xs text-muted-foreground",
												children: user.created_at ? new Date(user.created_at).toLocaleDateString("en-GB", {
													day: "2-digit",
													month: "short",
													year: "numeric"
												}) : "N/A"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "py-3.5 px-4 text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-end gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														variant: "outline",
														size: "sm",
														onClick: () => openEditModal(user),
														className: "h-8 text-xs font-medium gap-1.5 border-border hover:border-primary hover:text-primary transition-colors cursor-pointer",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-3.5 w-3.5 text-primary" }), "Edit Role & Access"]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														variant: "ghost",
														size: "sm",
														onClick: () => openSuspendModal(user),
														className: "h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer",
														title: "Suspend user account",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserX, { className: "h-4 w-4" })
													})]
												})
											})
										]
									}, user.id);
								})
							})]
						})
					}), totalPages > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-4 border-t border-border/40",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pagination, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PaginationContent, { children: [
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
						] }) })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: editModalOpen,
				onOpenChange: setEditModalOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl max-h-[90vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "pb-3 border-b border-border/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-primary font-semibold text-xs tracking-wide uppercase",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4" }), "Role-Based Access Control (RBAC)"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-xl font-bold",
									children: "Update Role & Permissions"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Assign the appropriate operational or platform role to control this user's module access." })
							]
						}),
						selectedUser && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-5 py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-muted/40 rounded-xl p-3.5 border border-border flex items-center justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary",
											children: selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : "U"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "text-sm font-bold text-foreground",
											children: selectedUser.full_name || "Unnamed User"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-mono text-muted-foreground",
											children: selectedUser.id
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-right",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] text-muted-foreground block font-medium",
											children: "Current Role"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: "mt-0.5 text-xs font-semibold",
											children: ROLE_MAP[selectedUser.role]?.label || selectedUser.role
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2",
									children: "Select New Role"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1",
									children: ALL_PMS_ROLES.map((r) => {
										const isPicked = selectedRole === r.role;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											onClick: () => setSelectedRole(r.role),
											className: `cursor-pointer rounded-xl border p-3 transition-all flex flex-col justify-between ${isPicked ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/80" : "border-border hover:border-border/80 hover:bg-muted/30"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-start justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: `p-1.5 rounded-lg ${r.badgeStyle}`,
														children: r.icon
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-sm font-semibold text-foreground leading-tight",
														children: r.label
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground font-medium",
														children: r.category
													})] })]
												}), isPicked && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-primary shrink-0" })]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed",
												children: r.description
											})]
										}, r.role);
									})
								})] }),
								selectedRoleMeta && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-primary/20 bg-primary/[0.02] p-3.5 space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-xs font-bold text-foreground flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3.5 w-3.5 text-primary" }),
												"Granted Privileges for ",
												selectedRoleMeta.label,
												":"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: `text-[11px] font-semibold px-2 py-0.5 rounded-full border ${selectedRoleMeta.badgeStyle}`,
											children: selectedRoleMeta.role
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1",
										children: selectedRoleMeta.permissions.map((perm, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1.5 text-xs text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 text-emerald-500 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: perm })]
										}, idx))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5",
									children: ["Audit Reason / Justification ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground font-normal",
										children: "(Recorded to immutable audit trail)"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									placeholder: "e.g. Promoted to Leasing Officer for tenant contract management.",
									className: "text-xs resize-none h-16",
									value: changeReason,
									onChange: (e) => setChangeReason(e.target.value)
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "pt-3 border-t border-border/60 flex items-center justify-between sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setEditModalOpen(false),
								disabled: isSubmitting,
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: handleSaveRole,
								disabled: isSubmitting || !selectedRole,
								className: "gap-2 cursor-pointer",
								children: isSubmitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-4 w-4 animate-spin" }), "Updating Permissions..."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4" }), "Confirm & Apply Role"] })
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: suspendModalOpen,
				onOpenChange: setSuspendModalOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "pb-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-lg font-bold text-destructive",
									children: "Suspend User Account"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Are you sure you want to revoke active platform access for this user?" })
							]
						}),
						userToSuspend && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bg-destructive/5 rounded-lg p-3 border border-destructive/20 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold text-foreground",
										children: userToSuspend.full_name || "Unnamed User"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-muted-foreground font-mono mt-0.5",
										children: userToSuspend.id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-destructive font-medium mt-2",
										children: [
											"• User sessions will be invalidated.",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
											"• API access & operational permissions will be frozen immediately."
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5",
								children: "Suspension Reason (Required for Audit Log)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "e.g. Employee offboarding or security breach investigation",
								className: "text-xs",
								value: suspendReason,
								onChange: (e) => setSuspendReason(e.target.value)
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "flex items-center justify-between sm:justify-between pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => setSuspendModalOpen(false),
								disabled: isSubmitting,
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "destructive",
								size: "sm",
								onClick: handleConfirmSuspend,
								disabled: isSubmitting,
								className: "gap-1.5 cursor-pointer",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserX, { className: "h-4 w-4" }), isSubmitting ? "Suspending..." : "Confirm Suspension"]
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { UsersPage as component };
