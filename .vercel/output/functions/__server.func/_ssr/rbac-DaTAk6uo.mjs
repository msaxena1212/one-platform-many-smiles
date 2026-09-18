import { B as supabase } from "./supabase-y7n1teoy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rbac-DaTAk6uo.js
var RBAC_MODULES = [
	"Tenant Mgmt",
	"Property CRUD",
	"Unit Mgmt",
	"Lease Creation",
	"Payment Collection",
	"Receipt Generation",
	"Finance & GL",
	"Asset Management",
	"Procurement & POs",
	"Vendor Management",
	"Maintenance Tickets",
	"HRMS",
	"Workforce & Shifts",
	"Payroll & Salary",
	"Performance & KPA",
	"Reports & Analytics",
	"User Management"
];
var GLOBAL_MANAGED_ROLES = [
	"SUPER_ADMIN",
	"ADMIN",
	"PROP_MGR",
	"LEASING",
	"FINANCE",
	"CASHIER",
	"MAINTENANCE",
	"TENANT"
];
var TENANT_MANAGED_ROLES = [
	"PROP_MGR",
	"LEASING",
	"FINANCE",
	"CASHIER",
	"MAINTENANCE"
];
var DEFAULT_ROLE_ACCESS = {
	SUPER_ADMIN: {
		"Tenant Mgmt": true,
		"Property CRUD": true,
		"Unit Mgmt": true,
		"Lease Creation": true,
		"Payment Collection": true,
		"Receipt Generation": true,
		"Finance & GL": true,
		"Asset Management": true,
		"Procurement & POs": true,
		"Vendor Management": true,
		"Maintenance Tickets": true,
		HRMS: true,
		"Workforce & Shifts": true,
		"Payroll & Salary": true,
		"Performance & KPA": true,
		"Reports & Analytics": true,
		"User Management": true
	},
	ADMIN: {
		"Tenant Mgmt": false,
		"Property CRUD": true,
		"Unit Mgmt": true,
		"Lease Creation": true,
		"Payment Collection": true,
		"Receipt Generation": true,
		"Finance & GL": true,
		"Asset Management": true,
		"Procurement & POs": true,
		"Vendor Management": true,
		"Maintenance Tickets": true,
		HRMS: true,
		"Workforce & Shifts": true,
		"Payroll & Salary": true,
		"Performance & KPA": true,
		"Reports & Analytics": true,
		"User Management": true
	},
	HOST: {
		"Tenant Mgmt": false,
		"Property CRUD": true,
		"Unit Mgmt": true,
		"Lease Creation": true,
		"Payment Collection": false,
		"Receipt Generation": false,
		"Finance & GL": false,
		"Asset Management": true,
		"Procurement & POs": false,
		"Vendor Management": false,
		"Maintenance Tickets": true,
		HRMS: false,
		"Workforce & Shifts": false,
		"Payroll & Salary": false,
		"Performance & KPA": false,
		"Reports & Analytics": true,
		"User Management": false
	},
	PROP_MGR: {
		"Tenant Mgmt": false,
		"Property CRUD": true,
		"Unit Mgmt": true,
		"Lease Creation": true,
		"Payment Collection": false,
		"Receipt Generation": false,
		"Finance & GL": false,
		"Asset Management": true,
		"Procurement & POs": false,
		"Vendor Management": false,
		"Maintenance Tickets": true,
		HRMS: false,
		"Workforce & Shifts": false,
		"Payroll & Salary": false,
		"Performance & KPA": false,
		"Reports & Analytics": true,
		"User Management": false
	},
	LEASING: {
		"Tenant Mgmt": false,
		"Property CRUD": false,
		"Unit Mgmt": false,
		"Lease Creation": true,
		"Payment Collection": false,
		"Receipt Generation": false,
		"Finance & GL": false,
		"Asset Management": false,
		"Procurement & POs": false,
		"Vendor Management": false,
		"Maintenance Tickets": false,
		HRMS: false,
		"Workforce & Shifts": false,
		"Payroll & Salary": false,
		"Performance & KPA": false,
		"Reports & Analytics": true,
		"User Management": false
	},
	FINANCE: {
		"Tenant Mgmt": false,
		"Property CRUD": false,
		"Unit Mgmt": false,
		"Lease Creation": false,
		"Payment Collection": true,
		"Receipt Generation": true,
		"Finance & GL": true,
		"Asset Management": false,
		"Procurement & POs": true,
		"Vendor Management": true,
		"Maintenance Tickets": false,
		HRMS: false,
		"Workforce & Shifts": false,
		"Payroll & Salary": true,
		"Performance & KPA": false,
		"Reports & Analytics": true,
		"User Management": false
	},
	CASHIER: {
		"Tenant Mgmt": false,
		"Property CRUD": false,
		"Unit Mgmt": false,
		"Lease Creation": false,
		"Payment Collection": true,
		"Receipt Generation": true,
		"Finance & GL": false,
		"Asset Management": false,
		"Procurement & POs": false,
		"Vendor Management": false,
		"Maintenance Tickets": false,
		HRMS: false,
		"Workforce & Shifts": false,
		"Payroll & Salary": false,
		"Performance & KPA": false,
		"Reports & Analytics": false,
		"User Management": false
	},
	MAINTENANCE: {
		"Tenant Mgmt": false,
		"Property CRUD": false,
		"Unit Mgmt": false,
		"Lease Creation": false,
		"Payment Collection": false,
		"Receipt Generation": false,
		"Finance & GL": false,
		"Asset Management": false,
		"Procurement & POs": false,
		"Vendor Management": false,
		"Maintenance Tickets": true,
		HRMS: false,
		"Workforce & Shifts": false,
		"Payroll & Salary": false,
		"Performance & KPA": false,
		"Reports & Analytics": false,
		"User Management": false
	},
	TENANT: {
		"Tenant Mgmt": false,
		"Property CRUD": false,
		"Unit Mgmt": false,
		"Lease Creation": false,
		"Payment Collection": false,
		"Receipt Generation": false,
		"Finance & GL": false,
		"Asset Management": false,
		"Procurement & POs": false,
		"Vendor Management": false,
		"Maintenance Tickets": true,
		HRMS: false,
		"Workforce & Shifts": false,
		"Payroll & Salary": false,
		"Performance & KPA": false,
		"Reports & Analytics": false,
		"User Management": false
	},
	GUEST: {
		"Tenant Mgmt": false,
		"Property CRUD": false,
		"Unit Mgmt": false,
		"Lease Creation": false,
		"Payment Collection": false,
		"Receipt Generation": false,
		"Finance & GL": false,
		"Asset Management": false,
		"Procurement & POs": false,
		"Vendor Management": false,
		"Maintenance Tickets": false,
		HRMS: false,
		"Workforce & Shifts": false,
		"Payroll & Salary": false,
		"Performance & KPA": false,
		"Reports & Analytics": false,
		"User Management": false
	},
	SALES: {
		"Tenant Mgmt": false,
		"Property CRUD": false,
		"Unit Mgmt": false,
		"Lease Creation": true,
		"Payment Collection": false,
		"Receipt Generation": false,
		"Finance & GL": false,
		"Asset Management": false,
		"Procurement & POs": false,
		"Vendor Management": false,
		"Maintenance Tickets": false,
		HRMS: false,
		"Workforce & Shifts": false,
		"Payroll & Salary": false,
		"Performance & KPA": false,
		"Reports & Analytics": true,
		"User Management": false
	},
	OWNER: {
		"Tenant Mgmt": false,
		"Property CRUD": false,
		"Unit Mgmt": false,
		"Lease Creation": false,
		"Payment Collection": false,
		"Receipt Generation": false,
		"Finance & GL": false,
		"Asset Management": false,
		"Procurement & POs": false,
		"Vendor Management": false,
		"Maintenance Tickets": false,
		HRMS: false,
		"Workforce & Shifts": false,
		"Payroll & Salary": false,
		"Performance & KPA": false,
		"Reports & Analytics": true,
		"User Management": false
	}
};
var CONSOLE_MODULE_RULES = {
	portal: { allowedRoles: [
		"TENANT",
		"GUEST",
		"SUPER_ADMIN",
		"ADMIN"
	] },
	"prop-mgr": {
		allowedRoles: [
			"PROP_MGR",
			"HOST",
			"SUPER_ADMIN",
			"ADMIN"
		],
		anyOf: [
			"Property CRUD",
			"Unit Mgmt",
			"Lease Creation",
			"Maintenance Tickets",
			"Reports & Analytics"
		]
	},
	admin: {
		allowedRoles: ["ADMIN", "SUPER_ADMIN"],
		anyOf: [
			"Property CRUD",
			"Unit Mgmt",
			"Lease Creation",
			"Payment Collection",
			"Receipt Generation",
			"Finance & GL",
			"HRMS",
			"User Management"
		]
	},
	"super-admin": { allowedRoles: ["SUPER_ADMIN"] },
	leasing: {
		allowedRoles: [
			"LEASING",
			"SUPER_ADMIN",
			"ADMIN",
			"PROP_MGR"
		],
		anyOf: ["Lease Creation", "Reports & Analytics"]
	},
	finance: {
		allowedRoles: [
			"FINANCE",
			"SUPER_ADMIN",
			"ADMIN",
			"PROP_MGR",
			"CASHIER"
		],
		anyOf: [
			"Payment Collection",
			"Receipt Generation",
			"Finance & GL",
			"Reports & Analytics"
		]
	},
	cashier: {
		allowedRoles: [
			"CASHIER",
			"FINANCE",
			"SUPER_ADMIN",
			"ADMIN",
			"PROP_MGR"
		],
		anyOf: ["Payment Collection", "Receipt Generation"]
	},
	maintenance: {
		allowedRoles: [
			"MAINTENANCE",
			"SUPER_ADMIN",
			"ADMIN",
			"PROP_MGR"
		],
		anyOf: ["Maintenance Tickets"]
	}
};
function getDefaultAccess(role) {
	return { ...DEFAULT_ROLE_ACCESS[role] };
}
async function fetchEffectiveRoleAccess(role, tenantId) {
	const effective = getDefaultAccess(role);
	let query = supabase.from("role_permissions").select("role_name,module_id,has_access,tenant_id").eq("role_name", role);
	query = tenantId ? query.or(`tenant_id.eq.${tenantId},tenant_id.is.null`) : query.is("tenant_id", null);
	const { data, error } = await query;
	if (error || !data) return effective;
	const rows = data;
	for (const moduleId of RBAC_MODULES) {
		const tenantSpecific = rows.find((row) => row.module_id === moduleId && row.tenant_id === (tenantId ?? null));
		const globalDefault = rows.find((row) => row.module_id === moduleId && row.tenant_id === null);
		const resolved = tenantSpecific ?? globalDefault;
		if (resolved) effective[moduleId] = resolved.has_access;
	}
	return effective;
}
async function canAccessConsole(consoleKey, role, tenantId) {
	const rule = CONSOLE_MODULE_RULES[consoleKey];
	if (!rule) return true;
	if (rule.allowedRoles?.includes(role)) return true;
	if (!rule.anyOf?.length) return false;
	const staticAccess = DEFAULT_ROLE_ACCESS[role];
	if (staticAccess && rule.anyOf.some((moduleId) => staticAccess[moduleId])) return true;
	try {
		const access = await fetchEffectiveRoleAccess(role, tenantId);
		return rule.anyOf.some((moduleId) => access[moduleId]);
	} catch {
		return false;
	}
}
//#endregion
export { canAccessConsole as a, TENANT_MANAGED_ROLES as i, GLOBAL_MANAGED_ROLES as n, RBAC_MODULES as r, DEFAULT_ROLE_ACCESS as t };
