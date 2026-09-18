import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-y7n1teoy.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as Shield, R as Save, h as TriangleAlert, in as ChevronRight, n as X, on as ChevronDown, sn as Check } from "../_libs/lucide-react.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as TENANT_MANAGED_ROLES, n as GLOBAL_MANAGED_ROLES, t as DEFAULT_ROLE_ACCESS } from "./rbac-DaTAk6uo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PermissionsManager-C_xxYzNY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var MODULE_GROUPS = [
	{
		label: "Property & Leasing",
		color: "text-sky-600",
		bg: "bg-sky-50 dark:bg-sky-950/30",
		modules: [
			"Tenant Mgmt",
			"Property CRUD",
			"Unit Mgmt",
			"Lease Creation"
		]
	},
	{
		label: "Finance & Payments",
		color: "text-emerald-600",
		bg: "bg-emerald-50 dark:bg-emerald-950/30",
		modules: [
			"Payment Collection",
			"Receipt Generation",
			"Finance & GL"
		]
	},
	{
		label: "Operations & Supply",
		color: "text-amber-600",
		bg: "bg-amber-50 dark:bg-amber-950/30",
		modules: [
			"Asset Management",
			"Procurement & POs",
			"Vendor Management",
			"Maintenance Tickets"
		]
	},
	{
		label: "Human Resources",
		color: "text-violet-600",
		bg: "bg-violet-50 dark:bg-violet-950/30",
		modules: [
			"HRMS",
			"Workforce & Shifts",
			"Payroll & Salary",
			"Performance & KPA"
		]
	},
	{
		label: "Platform & Admin",
		color: "text-rose-600",
		bg: "bg-rose-50 dark:bg-rose-950/30",
		modules: ["Reports & Analytics", "User Management"]
	}
];
function PermissionsManager({ targetTenantId = null }) {
	const [permissions, setPermissions] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [collapsedGroups, setCollapsedGroups] = (0, import_react.useState)({});
	const roles = targetTenantId ? TENANT_MANAGED_ROLES : GLOBAL_MANAGED_ROLES;
	(0, import_react.useEffect)(() => {
		loadPermissions();
	}, [targetTenantId]);
	async function loadPermissions() {
		setLoading(true);
		let query = supabase.from("role_permissions").select("*");
		if (targetTenantId) query = query.or(`tenant_id.eq.${targetTenantId},tenant_id.is.null`);
		else query = query.is("tenant_id", null);
		const { data, error } = await query;
		if (error) {
			toast.error("Failed to load permissions");
			console.error(error);
		} else setPermissions(data || []);
		setLoading(false);
	}
	const togglePermission = (role, mod) => {
		setPermissions((prev) => {
			const existing = prev.find((p) => p.role_name === role && p.module_id === mod);
			if (existing) return prev.map((p) => p.id === existing.id ? {
				...p,
				has_access: !p.has_access
			} : p);
			else return [...prev, {
				id: `temp-${Date.now()}`,
				role_name: role,
				module_id: mod,
				has_access: true,
				tenant_id: targetTenantId
			}];
		});
	};
	const handleSave = async () => {
		setSaving(true);
		try {
			const upserts = permissions.map((p) => ({
				role_name: p.role_name,
				module_id: p.module_id,
				has_access: p.has_access,
				tenant_id: targetTenantId
			}));
			const { error } = await supabase.from("role_permissions").upsert(upserts, { onConflict: "role_name,module_id,tenant_id" });
			if (error) throw error;
			toast.success("Permissions updated successfully");
			await loadPermissions();
		} catch (err) {
			toast.error(err.message || "Failed to save permissions");
		} finally {
			setSaving(false);
		}
	};
	const toggleGroup = (label) => setCollapsedGroups((prev) => ({
		...prev,
		[label]: !prev[label]
	}));
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-12 text-center text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-8 w-8 mx-auto mb-3 opacity-30 animate-pulse" }), "Loading permissions matrix..."]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
			className: "flex flex-row items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-5 w-5 text-primary" }), " Role Access Matrix"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: targetTenantId ? "Manage module access for your organization's staff roles." : "Configure global platform permissions. Click any cell to toggle access." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: handleSave,
				disabled: saving,
				className: "gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-4 w-4" }), saving ? "Saving..." : "Save Changes"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-left py-3 pr-6 font-semibold text-muted-foreground min-w-[200px]",
						children: "Module"
					}), roles.map((role) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
						className: "text-center py-3 px-2 font-semibold text-muted-foreground min-w-[80px]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs leading-tight",
							children: role.replace(/_/g, " ")
						})
					}, role))]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: MODULE_GROUPS.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
					className: `cursor-pointer select-none ${group.bg}`,
					onClick: () => toggleGroup(group.label),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						colSpan: roles.length + 1,
						className: `py-2.5 px-3 font-semibold text-xs uppercase tracking-wider ${group.color}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "inline-flex items-center gap-2",
							children: [
								collapsedGroups[group.label] ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3.5 w-3.5" }),
								group.label,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-normal text-muted-foreground",
									children: [
										"(",
										group.modules.length,
										")"
									]
								})
							]
						})
					})
				}, `g-${group.label}`), !collapsedGroups[group.label] && group.modules.map((mod) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b border-border/40 hover:bg-muted/20 transition-colors",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "py-2.5 pr-6 pl-8 font-medium text-sm",
						children: mod
					}), roles.map((role) => {
						let perm = permissions.find((p) => p.role_name === role && p.module_id === mod && p.tenant_id === targetTenantId);
						if (!perm) perm = permissions.find((p) => p.role_name === role && p.module_id === mod && p.tenant_id === null);
						const hasAccess = perm?.has_access ?? DEFAULT_ROLE_ACCESS[role]?.[mod] ?? false;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "text-center py-2 px-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => togglePermission(role, mod),
								title: `${hasAccess ? "Revoke" : "Grant"} ${role} — ${mod}`,
								className: `h-8 w-8 rounded-md flex items-center justify-center mx-auto transition-all hover:scale-110 ${hasAccess ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-muted text-muted-foreground hover:bg-muted/80"}`,
								children: hasAccess ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4 opacity-40" })
							})
						}, role);
					})]
				}, mod))] })) })]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-5 flex items-center gap-6 text-xs text-muted-foreground border-t pt-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "h-5 w-5 rounded bg-emerald-100 flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3 text-emerald-600" })
					}), " Access Granted"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "h-5 w-5 rounded bg-muted flex items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3 opacity-40" })
					}), " Access Denied"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "ml-auto flex items-center gap-1 text-amber-600",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3.5 w-3.5" }), " Changes apply on next login"]
				})
			]
		})] })] })
	});
}
//#endregion
export { PermissionsManager as t };
