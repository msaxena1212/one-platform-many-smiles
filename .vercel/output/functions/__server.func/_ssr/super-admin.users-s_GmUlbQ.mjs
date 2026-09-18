import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { A as Shield, H as Receipt, f as UserCheck, gn as Building2, ht as KeyRound, j as ShieldCheck, o as Wallet, r as Wrench, s as Users } from "../_libs/lucide-react.mjs";
import { m as createFileRoute, p as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/super-admin.users-s_GmUlbQ.js
var import_jsx_runtime = require_jsx_runtime();
var $$splitComponentImporter = () => import("./super-admin.users-BSWHBmts.mjs");
var Route = createFileRoute("/super-admin/users")({
	head: () => ({ meta: [{ title: "User Management & RBAC — ZYNO Super Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var ALL_PMS_ROLES = [
	{
		role: "SUPER_ADMIN",
		label: "Super Admin",
		badgeStyle: "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-purple-600 dark:text-purple-400" }),
		category: "Platform",
		description: "Full governance over tenants, global platform configs, billing tiers & all system modules.",
		permissions: [
			"Cross-tenant root access",
			"Impersonate tenant admin",
			"Manage database & billing",
			"Manage Super Admins"
		]
	},
	{
		role: "ADMIN",
		label: "Tenant Admin",
		badgeStyle: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4 text-blue-600 dark:text-blue-400" }),
		category: "Platform",
		description: "Organization administrator with complete management authority across their tenant instance.",
		permissions: [
			"Manage staff & branches",
			"Configure property settings",
			"Approve high-value transactions",
			"Full tenant reporting"
		]
	},
	{
		role: "PROP_MGR",
		label: "Property Manager",
		badgeStyle: "bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 text-indigo-600 dark:text-indigo-400" }),
		category: "Property Ops",
		description: "Manages building inventories, units, move-in/out inspections, and lease contracts.",
		permissions: [
			"Unit & lease operations",
			"Move-in / Move-out",
			"Issue tenant notices",
			"Operations reporting"
		]
	},
	{
		role: "LEASING",
		label: "Leasing Officer",
		badgeStyle: "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-4 w-4 text-sky-600 dark:text-sky-400" }),
		category: "Finance & Leasing",
		description: "Handles prospect inquiries, leads, reservations, lease agreements and renewals.",
		permissions: [
			"Draft & execute leases",
			"Customer KYC records",
			"Unit reservation holds",
			"Lease renewals"
		]
	},
	{
		role: "FINANCE",
		label: "Finance Officer",
		badgeStyle: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" }),
		category: "Finance & Leasing",
		description: "Oversees general ledger, journal vouchers, PDC registers, invoices and tax ledgers.",
		permissions: [
			"Voucher creation & posting",
			"PDC clearing & bounced check mgmt",
			"Chart of accounts",
			"Financial statements"
		]
	},
	{
		role: "CASHIER",
		label: "Cashier",
		badgeStyle: "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-4 w-4 text-teal-600 dark:text-teal-400" }),
		category: "Finance & Leasing",
		description: "Front-desk collections, issuing official receipts, and receiving rent / deposit cheques.",
		permissions: [
			"Create collection receipts",
			"Deposit cheque entries",
			"Print payment receipts",
			"Daily cash summary"
		]
	},
	{
		role: "MAINTENANCE",
		label: "Maintenance Officer",
		badgeStyle: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-4 w-4 text-amber-600 dark:text-amber-400" }),
		category: "Property Ops",
		description: "Dispatches contractors, tracks unit work orders, spare parts, and asset maintenance.",
		permissions: [
			"Manage maintenance tickets",
			"Assign vendor / work orders",
			"Inventory & parts logs",
			"Resolution sign-off"
		]
	},
	{
		role: "HOST",
		label: "Host / Ops",
		badgeStyle: "bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-4 w-4 text-cyan-600 dark:text-cyan-400" }),
		category: "Property Ops",
		description: "On-site property host handling visitor entry, check-ins, and guest concierge tasks.",
		permissions: [
			"Visitor gate check-in",
			"Unit key handover",
			"Guest inquiries",
			"Incident reporting"
		]
	},
	{
		role: "SALES",
		label: "Sales Agent",
		badgeStyle: "bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-orange-600 dark:text-orange-400" }),
		category: "Finance & Leasing",
		description: "Real estate broker / sales consultant managing showings, listings and commission leads.",
		permissions: [
			"Public listings view",
			"Submit lease leads",
			"Client showing schedule",
			"Commission tracking"
		]
	},
	{
		role: "OWNER",
		label: "Property Owner",
		badgeStyle: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 text-rose-600 dark:text-rose-400" }),
		category: "Client Portal",
		description: "Landlord / Asset Investor portal with portfolio yield, rent disbursement and statement views.",
		permissions: [
			"Asset performance dashboard",
			"View owner statements",
			"Approve major CAPEX",
			"Unit occupancy status"
		]
	},
	{
		role: "TENANT",
		label: "Tenant / Resident",
		badgeStyle: "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-slate-600 dark:text-slate-400" }),
		category: "Client Portal",
		description: "Resident portal for rent payments, maintenance requests, lease documents and renewals.",
		permissions: [
			"View personal lease & invoices",
			"Submit maintenance tickets",
			"Make online payments",
			"Gate visitor passes"
		]
	},
	{
		role: "GUEST",
		label: "Guest / Lead",
		badgeStyle: "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-zinc-500 dark:text-zinc-400" }),
		category: "Client Portal",
		description: "Unverified lead or public inquiry exploring property availability and listings.",
		permissions: [
			"Search listings",
			"Book property visit",
			"Submit tenant application",
			"No admin privileges"
		]
	}
];
//#endregion
export { Route as n, ALL_PMS_ROLES as t };
