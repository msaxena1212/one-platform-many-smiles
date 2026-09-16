import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $t as CircleCheck, A as ShieldCheck, B as Repeat, Dn as ArrowRight, F as Send, G as Plus, Gt as Clock, H as Receipt, Ht as CreditCard, I as Search, Mn as Activity, Mt as FileCheck, P as Server, Pt as Eye, Q as PackageOpen, R as Save, Rt as Download, S as Sparkles, Sn as Banknote, St as HardDrive, Ut as Copy, V as RefreshCw, Vt as Database, Yt as CircleX, a as WifiOff, at as Mail, c as User, cn as CheckCheck, dn as ChartColumn, et as Network, fn as Calendar, g as TrendingUp, gn as Building2, gt as Info, h as TriangleAlert, ht as KeyRound, i as Wifi, it as MapPin, j as ShieldAlert, jt as FilePenLine, k as Shield, kn as ArrowLeft, n as X, o as Wallet, on as ChevronDown, pt as Landmark, rn as ChevronUp, s as Users, sn as Check, st as Lock, t as Zap, tt as MousePointerClick, w as SlidersVertical, wt as Globe, x as SquarePen, yn as Bell, zt as DoorOpen } from "../_libs/lucide-react.mjs";
import { n as getLandingRouteForRole } from "./console-config-CLs2PqkZ.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { r as getDemoSession } from "./demo-auth-Dw5zdnz8.mjs";
import { n as logSecurityEvent, t as fetchSecurityAuditLogs } from "./security-BeRj2szr.mjs";
import { n as startImpersonation } from "./impersonation-BBADrwZA.mjs";
import { r as fetchInAppNotifications, t as createBroadcastNotification } from "./system-config-CsVWXlCy.mjs";
import { M as redirect, b as useRouter, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useNavigate, y as useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { f as properties } from "./mock-data-B9OWnoA7.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { n as Route$89 } from "./prop-mgr.manage._id-jChdsZOC.mjs";
import { t as Route$90 } from "./admin.manage._id-D2AVyJs9.mjs";
import { r as RBAC_MODULES } from "./rbac-BdxjsjU4.mjs";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { c as requireConsoleAccess, o as getCurrentProfile } from "./auth-guards-CGXIK8H1.mjs";
import { t as FinanceProvider } from "./finance-store-BEaAgb9S.mjs";
import { t as AppDataProvider } from "./app-data-context-Lw7cnnXe.mjs";
import { a as PaginationNext, i as PaginationLink, n as PaginationContent, o as PaginationPrevious, r as PaginationItem, t as Pagination } from "./pagination-Mm0k59kY.mjs";
import { t as Route$91 } from "./owner.manage._id-C8O4oLdn.mjs";
import { n as Route$92 } from "./admin.imports-DRNdLg5S.mjs";
import { n as Route$93 } from "./super-admin.users-nGekeH8A.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BUfefCvw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-DUNyE-Ig.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$88 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "ZYNO PMS" },
			{
				name: "description",
				content: "ZYNO Property Management System"
			},
			{
				name: "author",
				content: "ZYNO"
			},
			{
				property: "og:title",
				content: "ZYNO PMS"
			},
			{
				property: "og:description",
				content: "ZYNO Property Management System"
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary"
			},
			{
				name: "twitter:site",
				content: "@ZYNO"
			}
		],
		links: [{
			rel: "stylesheet",
			href: styles_default
		}]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$88.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppDataProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(FinanceProvider, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
			position: "top-center",
			richColors: true
		})] }) })
	});
}
var $$splitComponentImporter$77 = () => import("./super-admin-CPVhnpyF.mjs");
var Route$87 = createFileRoute("/super-admin")({
	beforeLoad: async () => {
		await requireConsoleAccess("super-admin");
	},
	component: lazyRouteComponent($$splitComponentImporter$77, "component")
});
var BASE_URL = "";
var Route$86 = createFileRoute("/sitemap.xml")({ server: { handlers: { GET: async () => {
	const staticPaths = [
		"/",
		"/properties",
		"/book-visit",
		"/about",
		"/contact"
	];
	const propPaths = properties.map((p) => `/properties/${p.id}`);
	const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...staticPaths, ...propPaths].map((p) => `  <url><loc>${BASE_URL}${p}</loc><changefreq>weekly</changefreq></url>`).join("\n")}\n</urlset>`;
	return new Response(xml, { headers: {
		"Content-Type": "application/xml",
		"Cache-Control": "public, max-age=3600"
	} });
} } } });
var $$splitComponentImporter$76 = () => import("./sales-SDHwzK6E.mjs");
var Route$85 = createFileRoute("/sales")({ component: lazyRouteComponent($$splitComponentImporter$76, "component") });
var $$splitComponentImporter$75 = () => import("./prop-mgr-6QtikvNC.mjs");
var Route$84 = createFileRoute("/prop-mgr")({
	beforeLoad: async () => {
		await requireConsoleAccess("prop-mgr");
	},
	component: lazyRouteComponent($$splitComponentImporter$75, "component")
});
var $$splitComponentImporter$74 = () => import("./portal-Iep9qMkX.mjs");
var Route$83 = createFileRoute("/portal")({
	beforeLoad: async () => {
		await requireConsoleAccess("portal");
	},
	component: lazyRouteComponent($$splitComponentImporter$74, "component")
});
var $$splitComponentImporter$73 = () => import("./owner-B8sZOAgM.mjs");
var Route$82 = createFileRoute("/owner")({ component: lazyRouteComponent($$splitComponentImporter$73, "component") });
var $$splitComponentImporter$72 = () => import("./maintenance-BTHyUIih.mjs");
var Route$81 = createFileRoute("/maintenance")({
	beforeLoad: async () => {
		await requireConsoleAccess("maintenance");
	},
	component: lazyRouteComponent($$splitComponentImporter$72, "component")
});
var $$splitComponentImporter$71 = () => import("./leasing-3TUerJga.mjs");
var Route$80 = createFileRoute("/leasing")({
	beforeLoad: async () => {
		await requireConsoleAccess("leasing");
	},
	component: lazyRouteComponent($$splitComponentImporter$71, "component")
});
var $$splitComponentImporter$70 = () => import("./guest-DND0CvlR.mjs");
var Route$79 = createFileRoute("/guest")({
	head: () => ({ meta: [{ title: "Guest portal - Kinan Customer Portal" }, {
		name: "description",
		content: "Guests can view and update stay, payment, document, and support details."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$70, "component")
});
var $$splitComponentImporter$69 = () => import("./finance-aeGNfAFZ.mjs");
var Route$78 = createFileRoute("/finance")({
	beforeLoad: async () => {
		await requireConsoleAccess("finance");
	},
	component: lazyRouteComponent($$splitComponentImporter$69, "component")
});
var $$splitComponentImporter$68 = () => import("./cashier-DgyvgNGx.mjs");
var Route$77 = createFileRoute("/cashier")({
	beforeLoad: async () => {
		await requireConsoleAccess("cashier");
	},
	component: lazyRouteComponent($$splitComponentImporter$68, "component")
});
var $$splitComponentImporter$67 = () => import("./auth-BkDZX0rq.mjs");
var Route$76 = createFileRoute("/auth")({
	beforeLoad: async () => {
		try {
			const { data } = await supabase.auth.getSession();
			if (data?.session?.user) {
				const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.session.user.id).single();
				if (profile?.role) throw redirect({ to: getLandingRouteForRole(profile.role) });
			}
		} catch (err) {
			if (err && (err instanceof Response || err.isRedirect || err.to || err.statusCode)) throw err;
		}
		const demo = getDemoSession();
		if (demo?.role) throw redirect({ to: getLandingRouteForRole(demo.role) });
	},
	component: lazyRouteComponent($$splitComponentImporter$67, "component")
});
var $$splitComponentImporter$66 = () => import("./admin-BE2lMj7v.mjs");
var Route$75 = createFileRoute("/admin")({
	beforeLoad: async () => {
		await requireConsoleAccess("admin");
	},
	component: lazyRouteComponent($$splitComponentImporter$66, "component")
});
var $$splitComponentImporter$65 = () => import("./routes-DTEZEvkE.mjs");
var Route$74 = createFileRoute("/")({
	beforeLoad: async () => {
		if (typeof window === "undefined") throw redirect({ to: "/auth" });
		try {
			const profile = await getCurrentProfile();
			if (profile?.role) throw redirect({ to: getLandingRouteForRole(profile.role) });
		} catch (err) {
			if (err && (err instanceof Response || err.isRedirect || err.to || err.statusCode)) throw err;
		}
		throw redirect({ to: "/auth" });
	},
	component: lazyRouteComponent($$splitComponentImporter$65, "component")
});
var $$splitComponentImporter$64 = () => import("./super-admin.index-B4rbT7nW.mjs");
var Route$73 = createFileRoute("/super-admin/")({
	head: () => ({ meta: [{ title: "Platform Governance Overview — ZYNO Super Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$64, "component")
});
var $$splitComponentImporter$63 = () => import("./prop-mgr.index-DpIvUs2G.mjs");
var Route$72 = createFileRoute("/prop-mgr/")({ component: lazyRouteComponent($$splitComponentImporter$63, "component") });
var $$splitComponentImporter$62 = () => import("./portal.index-C7jBpWBf.mjs");
var Route$71 = createFileRoute("/portal/")({
	head: () => ({ meta: [{ title: "My dashboard — ZYNO Property Management Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$62, "component")
});
var $$splitComponentImporter$61 = () => import("./maintenance.index-Bg1eqHn0.mjs");
var Route$70 = createFileRoute("/maintenance/")({ component: lazyRouteComponent($$splitComponentImporter$61, "component") });
var $$splitComponentImporter$60 = () => import("./leasing.index-C4wYCe6_.mjs");
var Route$69 = createFileRoute("/leasing/")({ component: lazyRouteComponent($$splitComponentImporter$60, "component") });
var $$splitComponentImporter$59 = () => import("./finance.index-DKIyplzX.mjs");
var Route$68 = createFileRoute("/finance/")({
	head: () => ({ meta: [{ title: "Finance Operations" }] }),
	component: lazyRouteComponent($$splitComponentImporter$59, "component")
});
var $$splitComponentImporter$58 = () => import("./cashier.index-BuoabCoc.mjs");
var Route$67 = createFileRoute("/cashier/")({ component: lazyRouteComponent($$splitComponentImporter$58, "component") });
var $$splitComponentImporter$57 = () => import("./admin.index-YGF6v8E2.mjs");
var Route$66 = createFileRoute("/admin/")({
	head: () => ({ meta: [{ title: "Dashboard — ZYNO Property Management Staff" }] }),
	component: lazyRouteComponent($$splitComponentImporter$57, "component")
});
var Route$65 = createFileRoute("/super-admin/tenants")({
	head: () => ({ meta: [{ title: "Tenant Organisations Onboarding & Governance — ZYNO Super Admin" }] }),
	component: TenantsPage
});
var PLAN_PRESETS = {
	Starter: {
		price_monthly: 299,
		price_annual: 2990,
		max_properties: 10,
		max_units: 100,
		max_staff_users: 5,
		max_storage_gb: 10,
		badge: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/20",
		modules: [
			"Property CRUD",
			"Unit Mgmt",
			"Lease Creation",
			"Payment Collection",
			"Receipt Generation",
			"Maintenance Tickets"
		]
	},
	Professional: {
		price_monthly: 999,
		price_annual: 9990,
		max_properties: 30,
		max_units: 500,
		max_staff_users: 20,
		max_storage_gb: 50,
		badge: "bg-blue-500/15 text-blue-600 border-blue-500/20",
		modules: [
			"Property CRUD",
			"Unit Mgmt",
			"Lease Creation",
			"Payment Collection",
			"Receipt Generation",
			"Finance & GL",
			"Asset Management",
			"Vendor Management",
			"Maintenance Tickets",
			"Reports & Analytics"
		]
	},
	Enterprise: {
		price_monthly: 2499,
		price_annual: 24990,
		max_properties: 100,
		max_units: 3e3,
		max_staff_users: 100,
		max_storage_gb: 500,
		badge: "bg-purple-500/15 text-purple-600 border-purple-500/20",
		modules: [...RBAC_MODULES]
	}
};
function TenantsPage() {
	const [tenants, setTenants] = (0, import_react.useState)([]);
	const [search, setSearch] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [currentPage, setCurrentPage] = (0, import_react.useState)(1);
	const ITEMS_PER_PAGE = 15;
	const [showWizard, setShowWizard] = (0, import_react.useState)(false);
	const [wizardStep, setWizardStep] = (0, import_react.useState)(1);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [credentialModal, setCredentialModal] = (0, import_react.useState)(null);
	const [copiedField, setCopiedField] = (0, import_react.useState)(null);
	const [exportModal, setExportModal] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		legal_entity_name: "",
		commercial_reg_no: "",
		tax_id_no: "",
		country: "Qatar",
		city: "Doha",
		address_line: "",
		primary_phone: "+974 ",
		primary_email: "",
		admin_name: "",
		admin_email: "",
		admin_password: "",
		admin_phone: "",
		send_welcome_email: true,
		plan: "Professional",
		billing_cycle: "monthly",
		max_properties: 30,
		max_units: 500,
		max_staff_users: 20,
		max_storage_gb: 50,
		enabled_modules: [...PLAN_PRESETS.Professional.modules],
		custom_subdomain: "",
		payment_method: "qpay_naps",
		currency: "QAR",
		subscription_amount: 999,
		discount_amount: 0,
		tax_rate_percent: 0,
		tax_amount: 0,
		total_payable: 999,
		payment_status: "Paid",
		transaction_ref: "",
		bank_name: "Qatar National Bank (QNB)",
		cheque_number: "",
		auto_renew: true
	});
	(0, import_react.useEffect)(() => {
		loadTenants();
	}, []);
	async function loadTenants() {
		setLoading(true);
		try {
			const { data: orgs, error } = await supabase.from("tenant_organisations").select("*").order("created_at", { ascending: false });
			if (error) throw error;
			const { data: props } = await supabase.from("properties").select("id, host_id");
			const propMap = {};
			(props || []).forEach((p) => {
				propMap[p.host_id] = (propMap[p.host_id] || 0) + 1;
			});
			setTenants((orgs || []).map((o) => ({
				...o,
				propertyCount: propMap[o.admin_user_id] || propMap[o.id] || 0
			})));
		} catch (e) {
			toast.error("Failed to load tenant organisations: " + e.message);
		} finally {
			setLoading(false);
		}
	}
	function handlePlanChange(newPlan) {
		const preset = PLAN_PRESETS[newPlan];
		const amount = form.billing_cycle === "annual" ? preset.price_annual : preset.price_monthly;
		const total = Math.max(0, amount - form.discount_amount);
		setForm((prev) => ({
			...prev,
			plan: newPlan,
			subscription_amount: amount,
			total_payable: total,
			max_properties: preset.max_properties,
			max_units: preset.max_units,
			max_staff_users: preset.max_staff_users,
			max_storage_gb: preset.max_storage_gb,
			enabled_modules: [...preset.modules]
		}));
	}
	function handleBillingCycleChange(cycle) {
		const preset = PLAN_PRESETS[form.plan];
		const amount = cycle === "annual" ? preset.price_annual : preset.price_monthly;
		const total = Math.max(0, amount - form.discount_amount);
		setForm((prev) => ({
			...prev,
			billing_cycle: cycle,
			subscription_amount: amount,
			total_payable: total
		}));
	}
	function toggleModule(mod) {
		setForm((prev) => {
			const exists = prev.enabled_modules.includes(mod);
			return {
				...prev,
				enabled_modules: exists ? prev.enabled_modules.filter((m) => m !== mod) : [...prev.enabled_modules, mod]
			};
		});
	}
	function generateAutoKey(name) {
		return `tenant-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 20) || "org"}-${Math.floor(1e3 + Math.random() * 9e3)}`;
	}
	function generateSecurePassword() {
		const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
		let pwd = "";
		for (let i = 0; i < 12; i++) pwd += chars.charAt(Math.floor(Math.random() * 61));
		return pwd + "@2026";
	}
	function generateTxnRef() {
		return `TXN-QPAY-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
	}
	function handleImpersonateTenant(tenant) {
		startImpersonation({
			id: tenant.id,
			tenant_key: tenant.tenant_key,
			name: tenant.name,
			admin_name: tenant.admin_name,
			admin_email: tenant.admin_email
		});
		toast.success(`Support Impersonation Started for ${tenant.name}`);
		window.location.href = "/prop-mgr";
	}
	async function handleExportTenantData(tenant) {
		const exportId = `EXP-${tenant.tenant_key.toUpperCase()}-${Date.now()}`;
		setExportModal({
			tenant,
			stage: "collecting",
			steps: [
				{
					label: "Organisation & Legal Records",
					done: false
				},
				{
					label: "Properties & Units Portfolio",
					done: false
				},
				{
					label: "Lease Contracts",
					done: false
				},
				{
					label: "Financial Ledger & Payments",
					done: false
				},
				{
					label: "Maintenance Tickets & Work Orders",
					done: false
				},
				{
					label: "Subscription Invoices",
					done: false
				},
				{
					label: "Packaging & Compressing",
					done: false
				}
			],
			exportId
		});
		const markStep = (index, count) => {
			setExportModal((prev) => {
				if (!prev) return null;
				const updated = [...prev.steps];
				updated[index] = {
					...updated[index],
					done: true,
					count
				};
				return {
					...prev,
					steps: updated
				};
			});
		};
		try {
			await new Promise((r) => setTimeout(r, 300));
			markStep(0, 1);
			const propsRes = await supabase.from("properties").select("*").eq("host_id", tenant.admin_user_id || tenant.id);
			markStep(1, (propsRes.data || []).length);
			const leasesRes = await supabase.from("leases").select("*").eq("tenant_id", tenant.id);
			markStep(2, (leasesRes.data || []).length);
			const [paymentsRes, journalsRes] = await Promise.all([supabase.from("payments").select("*").eq("tenant_id", tenant.id), supabase.from("journal_entries").select("*").eq("tenant_id", tenant.id).limit(500)]);
			markStep(3, (paymentsRes.data || []).length + (journalsRes.data || []).length);
			const maintenanceRes = await supabase.from("maintenance_tickets").select("*").eq("tenant_id", tenant.id);
			markStep(4, (maintenanceRes.data || []).length);
			const invoicesRes = await supabase.from("tenant_subscription_invoices").select("*").eq("tenant_id", tenant.id);
			markStep(5, (invoicesRes.data || []).length);
			setExportModal((prev) => prev ? {
				...prev,
				stage: "packaging"
			} : null);
			await new Promise((r) => setTimeout(r, 400));
			const exportPackage = {
				metadata: {
					export_id: exportId,
					generated_at: (/* @__PURE__ */ new Date()).toISOString(),
					timezone: "Asia/Qatar (UTC+3 / AST)",
					platform: "ZYNO Real Estate OS — SaaS Multi-Tenant Platform",
					exported_by: "Super Admin Governance Console",
					compliance_framework: "Qatar Personal Data Protection Law (PDPL) · GDPR Article 20 (Data Portability)",
					record_counts: {
						properties: (propsRes.data || []).length,
						leases: (leasesRes.data || []).length,
						payments: (paymentsRes.data || []).length,
						journal_entries: (journalsRes.data || []).length,
						maintenance_tickets: (maintenanceRes.data || []).length,
						subscription_invoices: (invoicesRes.data || []).length
					}
				},
				tenant_organisation: tenant,
				portfolio: {
					properties_count: (propsRes.data || []).length,
					properties: propsRes.data || []
				},
				contracts: {
					leases_count: (leasesRes.data || []).length,
					leases: leasesRes.data || []
				},
				financials: {
					payments_count: (paymentsRes.data || []).length,
					payments: paymentsRes.data || [],
					journal_entries_count: (journalsRes.data || []).length,
					journal_entries: journalsRes.data || []
				},
				maintenance: {
					tickets_count: (maintenanceRes.data || []).length,
					tickets: maintenanceRes.data || []
				},
				billing: {
					subscription_invoices_count: (invoicesRes.data || []).length,
					subscription_invoices: invoicesRes.data || []
				}
			};
			const blob = new Blob([JSON.stringify(exportPackage, null, 2)], { type: "application/json" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `zyno_data_export_${tenant.tenant_key}_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.json`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
			markStep(6);
			await logSecurityEvent({
				event_type: "TENANT_DATA_EXPORTED",
				severity: "info",
				resource: `tenant_organisations/${tenant.id}`,
				action: `Super Admin exported comprehensive GDPR/PDPL data package for ${tenant.name}`,
				user_role: "SUPER_ADMIN",
				details: {
					export_id: exportId,
					tenant_id: tenant.id,
					tenant_key: tenant.tenant_key,
					records_exported: exportPackage.metadata.record_counts
				}
			});
			setExportModal((prev) => prev ? {
				...prev,
				stage: "done"
			} : null);
			toast.success(`Export package downloaded for ${tenant.name}`, { id: "export-pkg" });
		} catch (err) {
			setExportModal((prev) => prev ? {
				...prev,
				stage: "error",
				errorMsg: err.message
			} : null);
			toast.error("Export failed: " + err.message, { id: "export-pkg" });
		}
	}
	function startOnboardingWizard() {
		const pwd = generateSecurePassword();
		const txn = generateTxnRef();
		setForm({
			name: "",
			legal_entity_name: "",
			commercial_reg_no: "",
			tax_id_no: "",
			country: "Qatar",
			city: "Doha",
			address_line: "",
			primary_phone: "+974 ",
			primary_email: "",
			admin_name: "",
			admin_email: "",
			admin_password: pwd,
			admin_phone: "+974 ",
			send_welcome_email: true,
			plan: "Professional",
			billing_cycle: "monthly",
			max_properties: PLAN_PRESETS.Professional.max_properties,
			max_units: PLAN_PRESETS.Professional.max_units,
			max_staff_users: PLAN_PRESETS.Professional.max_staff_users,
			max_storage_gb: PLAN_PRESETS.Professional.max_storage_gb,
			enabled_modules: [...PLAN_PRESETS.Professional.modules],
			custom_subdomain: "",
			payment_method: "qpay_naps",
			currency: "QAR",
			subscription_amount: PLAN_PRESETS.Professional.price_monthly,
			discount_amount: 0,
			tax_rate_percent: 0,
			tax_amount: 0,
			total_payable: PLAN_PRESETS.Professional.price_monthly,
			payment_status: "Paid",
			transaction_ref: txn,
			bank_name: "Qatar National Bank (QNB)",
			cheque_number: "",
			auto_renew: true
		});
		setWizardStep(1);
		setShowWizard(true);
	}
	async function handleCompleteOnboarding() {
		if (!form.name || !form.primary_email || !form.admin_name || !form.admin_email) {
			toast.error("Please fill in all mandatory organisation and administrator fields.");
			return;
		}
		setSubmitting(true);
		const tenantKey = generateAutoKey(form.name);
		const invoiceNo = `INV-SUB-${Date.now().toString().slice(-6)}`;
		try {
			let adminUserId = null;
			try {
				const { data: authData, error: authError } = await supabase.auth.signUp({
					email: form.admin_email,
					password: form.admin_password,
					options: { data: {
						full_name: form.admin_name,
						role: "ADMIN",
						tenant_key: tenantKey,
						organisation_name: form.name,
						phone: form.admin_phone
					} }
				});
				if (authError) throw authError;
				adminUserId = authData?.user?.id || null;
			} catch (authErr) {
				console.warn("Auth signup notice:", authErr.message);
			}
			const { data: tenantInsertData, error: dbError } = await supabase.from("tenant_organisations").insert({
				tenant_key: tenantKey,
				name: form.name,
				legal_entity_name: form.legal_entity_name || form.name,
				commercial_reg_no: form.commercial_reg_no || null,
				tax_id_no: form.tax_id_no || null,
				country: form.country,
				city: form.city,
				address_line: form.address_line,
				primary_phone: form.primary_phone,
				primary_email: form.primary_email,
				admin_name: form.admin_name,
				admin_email: form.admin_email,
				admin_user_id: adminUserId,
				plan: form.plan,
				billing_cycle: form.billing_cycle,
				status: form.payment_method === "complimentary_trial" ? "Trial" : "Active",
				max_properties: form.max_properties,
				max_units: form.max_units,
				max_staff_users: form.max_staff_users,
				max_storage_gb: form.max_storage_gb,
				enabled_modules: form.enabled_modules,
				custom_subdomain: form.custom_subdomain || null,
				subscription_amount: form.subscription_amount,
				currency: form.currency,
				payment_method: form.payment_method,
				payment_status: form.payment_status,
				transaction_ref: form.transaction_ref || null,
				bank_name: form.bank_name || null,
				cheque_number: form.cheque_number || null,
				auto_renew: form.auto_renew,
				tax_amount: form.tax_amount,
				total_paid: form.total_payable,
				created_at: (/* @__PURE__ */ new Date()).toISOString()
			}).select("id").single();
			if (dbError) throw dbError;
			const newTenantId = tenantInsertData?.id;
			if (newTenantId) await supabase.from("tenant_subscription_invoices").insert({
				invoice_number: invoiceNo,
				tenant_id: newTenantId,
				tenant_key: tenantKey,
				tenant_name: form.name,
				plan: form.plan,
				billing_cycle: form.billing_cycle,
				subtotal_amount: form.subscription_amount,
				tax_amount: form.tax_amount,
				discount_amount: form.discount_amount,
				total_amount: form.total_payable,
				currency: form.currency,
				status: form.payment_status === "Paid" ? "Paid" : "Pending",
				payment_method: form.payment_method,
				transaction_ref: form.transaction_ref || null,
				payment_date: form.payment_status === "Paid" ? (/* @__PURE__ */ new Date()).toISOString() : null,
				issue_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
				due_date: new Date(Date.now() + 14 * 864e5).toISOString().split("T")[0],
				created_at: (/* @__PURE__ */ new Date()).toISOString()
			});
			await logSecurityEvent({
				event_type: "auth",
				severity: "info",
				resource: `tenant_organisations/${tenantKey}`,
				action: "TENANT_ONBOARDED_WITH_PAYMENT",
				details: {
					tenantKey,
					organisationName: form.name,
					adminEmail: form.admin_email,
					plan: form.plan,
					totalPaid: form.total_payable,
					paymentMethod: form.payment_method,
					invoiceNo
				}
			});
			await createBroadcastNotification({
				title: `Organisation Onboarded: ${form.name}`,
				message: `${form.name} (${form.plan} Plan, ${form.currency} ${form.total_payable}) successfully activated with admin ${form.admin_email}.`,
				type: "success",
				target_role: "SUPER_ADMIN"
			});
			setShowWizard(false);
			setCredentialModal({
				tenantName: form.name,
				adminEmail: form.admin_email,
				tempPassword: form.admin_password,
				tenantKey,
				portalUrl: window.location.origin + "/auth",
				invoiceNo,
				paidAmount: form.total_payable,
				currency: form.currency,
				paymentMethod: form.payment_method.replace("_", " ").toUpperCase()
			});
			loadTenants();
			toast.success(`Organisation "${form.name}" onboarded and invoice ${invoiceNo} generated!`);
		} catch (err) {
			toast.error("Onboarding failed: " + (err.message || "Unknown error"));
		} finally {
			setSubmitting(false);
		}
	}
	function copyToClipboard(text, fieldName) {
		navigator.clipboard.writeText(text);
		setCopiedField(fieldName);
		toast.success(`Copied ${fieldName} to clipboard!`);
		setTimeout(() => setCopiedField(null), 2500);
	}
	const filtered = tenants.filter((t) => (t.name || "").toLowerCase().includes(search.toLowerCase()) || (t.admin_email || "").toLowerCase().includes(search.toLowerCase()) || (t.tenant_key || "").toLowerCase().includes(search.toLowerCase()));
	const paginatedTenants = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold tracking-tight text-foreground",
					children: "Tenant Organisation Governance"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "End-to-end organisation onboarding, payment settlements, subscription billing, and platform module entitlements."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					onClick: startOnboardingWizard,
					className: "bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white gap-2 font-medium shadow-md shadow-primary/20",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Onboard New Organisation"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border border-border/80 shadow-sm bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-muted-foreground uppercase",
										children: "Total Organisations"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 text-primary" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-3xl font-bold mt-2 text-foreground",
									children: tenants.length
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground mt-1",
									children: "Multi-tenant client accounts"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border border-emerald-500/20 shadow-sm bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-emerald-600 uppercase",
										children: "Active Organisations"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-emerald-600" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-3xl font-bold mt-2 text-emerald-600",
									children: tenants.filter((t) => t.status === "Active").length
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-emerald-600/80 mt-1",
									children: "Paid & active access"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border border-indigo-500/20 shadow-sm bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-indigo-600 uppercase",
										children: "Managed Properties"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Server, { className: "h-4 w-4 text-indigo-600" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-3xl font-bold mt-2 text-indigo-600",
									children: tenants.reduce((sum, t) => sum + (t.propertyCount || 0), 0)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-indigo-600/80 mt-1",
									children: "Properties across clients"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border border-amber-500/20 shadow-sm bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-amber-600 uppercase",
										children: "Subscription MRR"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4 text-amber-600" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-3xl font-bold mt-2 text-amber-600",
									children: ["QAR ", tenants.reduce((sum, t) => sum + (Number(t.subscription_amount) || 999), 0).toLocaleString()]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-amber-600/80 mt-1",
									children: "Monthly recurring revenue"
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border border-border/80 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "p-4 pb-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative w-full sm:w-80",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Search by organisation name, email, or key...",
								value: search,
								onChange: (e) => setSearch(e.target.value),
								className: "pl-9 text-xs"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: loadTenants,
								disabled: loading,
								className: "text-xs gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` }), " Refresh"]
							})
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-4 pt-4",
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-12 text-center text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-6 w-6 animate-spin mx-auto mb-2 text-primary" }), "Loading organisations..."]
					}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-12 text-center text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-8 w-8 mx-auto mb-2 opacity-30 text-primary" }), "No organisations found matching your filter."]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto rounded-lg border border-border/60",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-muted/50 text-muted-foreground font-semibold border-b border-border/60",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-3",
										children: "Organisation & Key"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-3",
										children: "Admin Contact"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-3",
										children: "Plan & Billing"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-3",
										children: "Payment Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-3",
										children: "Capacity Limits"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-3",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-3",
										children: "Joined Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-3 text-right",
										children: "Actions"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border/40",
								children: paginatedTenants.map((t) => {
									const preset = PLAN_PRESETS[t.plan] || PLAN_PRESETS.Starter;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "hover:bg-muted/30 transition-colors",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "p-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "font-bold text-foreground text-sm flex items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 text-primary" }), t.name]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-[11px] font-mono text-muted-foreground mt-0.5",
														children: t.tenant_key
													}),
													t.commercial_reg_no && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-[10px] text-muted-foreground",
														children: ["CR: ", t.commercial_reg_no]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "p-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-semibold text-foreground",
														children: t.admin_name
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-[11px] text-muted-foreground",
														children: t.admin_email
													}),
													t.primary_phone && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-[10px] text-muted-foreground",
														children: t.primary_phone
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "p-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													className: `text-[10px] uppercase font-bold ${preset.badge}`,
													children: t.plan
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[11px] font-semibold text-foreground mt-1",
													children: [
														t.currency || "QAR",
														" ",
														(t.subscription_amount || (t.plan === "Starter" ? 299 : t.plan === "Professional" ? 999 : 2499)).toLocaleString(),
														"/",
														t.billing_cycle === "annual" ? "yr" : "mo"
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "p-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px]",
													children: t.payment_status || "Paid"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[10px] text-muted-foreground mt-0.5 capitalize",
													children: (t.payment_method || "qpay_naps").replace("_", " ")
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "p-3 font-mono text-[11px] text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Props: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: t.max_properties
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Units: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: t.max_units
												})] })]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "p-3",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													className: t.status === "Active" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" : "bg-amber-500/15 text-amber-600 border-amber-500/20",
													children: t.status
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "p-3 text-muted-foreground whitespace-nowrap",
												children: new Date(t.created_at).toLocaleDateString("en-QA", {
													year: "numeric",
													month: "short",
													day: "numeric"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "p-3 text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-end gap-1.5",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															variant: "outline",
															size: "sm",
															onClick: () => handleImpersonateTenant(t),
															className: "h-7 px-2.5 text-xs text-amber-600 border-amber-500/30 hover:bg-amber-500/10 gap-1 font-semibold",
															title: "Log In As Tenant Admin (Support Mode)",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3 w-3 text-amber-600" }), " Impersonate"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															variant: "ghost",
															size: "sm",
															onClick: () => handleExportTenantData(t),
															className: "h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1",
															title: "Export Tenant Data Package",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5" }), " Export"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															variant: "ghost",
															size: "sm",
															onClick: () => {
																setCredentialModal({
																	tenantName: t.name,
																	adminEmail: t.admin_email,
																	tempPassword: "• • • • • • • • (Hidden)",
																	tenantKey: t.tenant_key,
																	portalUrl: window.location.origin + "/auth",
																	invoiceNo: `INV-REC-${t.tenant_key.slice(-4)}`,
																	paidAmount: t.subscription_amount || 999,
																	currency: t.currency || "QAR",
																	paymentMethod: (t.payment_method || "QPAY").toUpperCase()
																});
															},
															className: "h-7 px-2 text-xs",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5 mr-1" }), " View Details"]
														})
													]
												})
											})
										]
									}, t.id);
								})
							})]
						})
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showWizard,
				onOpenChange: setShowWizard,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[720px] border border-primary/20 shadow-2xl bg-card p-0 overflow-hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white border-b border-indigo-500/20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
										className: "text-lg font-bold text-white",
										children: "Onboard New Organisation"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
										className: "text-xs text-slate-300",
										children: [
											"Step ",
											wizardStep,
											" of 4 — ",
											wizardStep === 1 ? "Organisation Details & Entity" : wizardStep === 2 ? "Administrator Credentials & Auth" : wizardStep === 3 ? "Subscription Plan & Entitlements" : "Payment Processing & Billing Settlement"
										]
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-1.5",
									children: [
										1,
										2,
										3,
										4
									].map((step) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-2 rounded-full transition-all duration-300 ${step === wizardStep ? "w-7 bg-primary" : step < wizardStep ? "w-2 bg-emerald-500" : "w-2 bg-slate-700"}` }, step))
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 max-h-[70vh] overflow-y-auto space-y-6",
							children: [
								wizardStep === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-4 animate-in fade-in-50 duration-200",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-4 md:grid-cols-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5 md:col-span-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
													className: "text-xs font-semibold",
													children: ["Organisation Display Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-red-500",
														children: "*"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: form.name,
													onChange: (e) => setForm({
														...form,
														name: e.target.value
													}),
													placeholder: "e.g. Al Baraka Properties W.L.L.",
													required: true
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Legal Entity Name"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: form.legal_entity_name,
													onChange: (e) => setForm({
														...form,
														legal_entity_name: e.target.value
													}),
													placeholder: "e.g. Al Baraka Real Estate Holdings LLC"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
													className: "text-xs font-semibold",
													children: ["Primary Contact Email ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-red-500",
														children: "*"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "email",
													value: form.primary_email,
													onChange: (e) => setForm({
														...form,
														primary_email: e.target.value
													}),
													placeholder: "contact@albaraka.qa",
													required: true
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Commercial Registration (CR) Number"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: form.commercial_reg_no,
													onChange: (e) => setForm({
														...form,
														commercial_reg_no: e.target.value
													}),
													placeholder: "e.g. CR-7890123-QA"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Tax Identification Number (TIN)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: form.tax_id_no,
													onChange: (e) => setForm({
														...form,
														tax_id_no: e.target.value
													}),
													placeholder: "e.g. TIN-1002345678"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Country"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: form.country,
													onChange: (e) => setForm({
														...form,
														country: e.target.value
													})
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "City"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: form.city,
													onChange: (e) => setForm({
														...form,
														city: e.target.value
													})
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5 md:col-span-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Official Business Address"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: form.address_line,
													onChange: (e) => setForm({
														...form,
														address_line: e.target.value
													}),
													placeholder: "Tower 4, Level 18, West Bay, Doha, Qatar"
												})]
											})
										]
									})
								}),
								wizardStep === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4 animate-in fade-in-50 duration-200",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-semibold flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), " Root Tenant Administrator Account"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: "This user will receive root admin credentials to manage properties, leases, financial ledgers, and team members for this organisation."
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-4 md:grid-cols-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
													className: "text-xs font-semibold",
													children: ["Admin Full Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-red-500",
														children: "*"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: form.admin_name,
													onChange: (e) => setForm({
														...form,
														admin_name: e.target.value
													}),
													placeholder: "e.g. Mohammed Al-Kuwari",
													required: true
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
													className: "text-xs font-semibold",
													children: ["Admin Work Email ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-red-500",
														children: "*"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "email",
													value: form.admin_email,
													onChange: (e) => setForm({
														...form,
														admin_email: e.target.value
													}),
													placeholder: "admin@albaraka.qa",
													required: true
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Admin Mobile Phone"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: form.admin_phone,
													onChange: (e) => setForm({
														...form,
														admin_phone: e.target.value
													}),
													placeholder: "+974 5500 1234"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Generated Temporary Password"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "text",
														value: form.admin_password,
														onChange: (e) => setForm({
															...form,
															admin_password: e.target.value
														}),
														className: "font-mono text-xs"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														type: "button",
														variant: "outline",
														size: "sm",
														onClick: () => setForm({
															...form,
															admin_password: generateSecurePassword()
														}),
														className: "text-xs px-2.5",
														children: "Regen"
													})]
												})]
											})
										]
									})]
								}),
								wizardStep === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-5 animate-in fade-in-50 duration-200",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/60",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-bold text-foreground",
												children: "Billing Cadence"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] text-muted-foreground",
												children: "Annual billing provides 2 months free"
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5 bg-background p-1 rounded-lg border border-border/60",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													type: "button",
													size: "sm",
													variant: form.billing_cycle === "monthly" ? "default" : "ghost",
													onClick: () => handleBillingCycleChange("monthly"),
													className: "h-7 text-xs px-3",
													children: "Monthly"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													type: "button",
													size: "sm",
													variant: form.billing_cycle === "annual" ? "default" : "ghost",
													onClick: () => handleBillingCycleChange("annual"),
													className: "h-7 text-xs px-3 gap-1",
													children: ["Annual ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														className: "bg-emerald-500 text-white text-[9px] py-0 px-1",
														children: "Save 16%"
													})]
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Select Subscription Tier"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "grid grid-cols-3 gap-3",
												children: [
													"Starter",
													"Professional",
													"Enterprise"
												].map((tier) => {
													const p = PLAN_PRESETS[tier];
													const cost = form.billing_cycle === "annual" ? p.price_annual : p.price_monthly;
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														type: "button",
														onClick: () => handlePlanChange(tier),
														className: `p-4 rounded-xl border text-left transition-all duration-200 ${form.plan === tier ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20" : "border-border/60 hover:border-border hover:bg-muted/40"}`,
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center justify-between",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "font-bold text-sm text-foreground",
																	children: tier
																}), form.plan === tier && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-primary" })]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																className: "text-xs font-bold text-primary mt-1",
																children: [
																	"QAR ",
																	cost.toLocaleString(),
																	" ",
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																		className: "text-[10px] font-normal text-muted-foreground",
																		children: ["/", form.billing_cycle === "annual" ? "yr" : "mo"]
																	})
																]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																className: "text-[11px] text-muted-foreground mt-1",
																children: [
																	"Up to ",
																	p.max_properties,
																	" Props, ",
																	p.max_units,
																	" Units"
																]
															})
														]
													}, tier);
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 md:grid-cols-4 gap-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-[11px] font-semibold",
														children: "Max Properties"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														value: form.max_properties,
														onChange: (e) => setForm({
															...form,
															max_properties: Number(e.target.value)
														})
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-[11px] font-semibold",
														children: "Max Units"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														value: form.max_units,
														onChange: (e) => setForm({
															...form,
															max_units: Number(e.target.value)
														})
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-[11px] font-semibold",
														children: "Staff Seats"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														value: form.max_staff_users,
														onChange: (e) => setForm({
															...form,
															max_staff_users: Number(e.target.value)
														})
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-[11px] font-semibold",
														children: "Storage (GB)"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														value: form.max_storage_gb,
														onChange: (e) => setForm({
															...form,
															max_storage_gb: Number(e.target.value)
														})
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2 pt-2 border-t border-border/60",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
													className: "text-xs font-semibold",
													children: [
														"Enabled System Modules (",
														form.enabled_modules.length,
														")"
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[11px] text-muted-foreground",
													children: "Toggle access permissions"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "grid grid-cols-2 sm:grid-cols-3 gap-2",
												children: RBAC_MODULES.map((mod) => {
													const enabled = form.enabled_modules.includes(mod);
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														type: "button",
														onClick: () => toggleModule(mod),
														className: `p-2 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${enabled ? "border-primary/40 bg-primary/10 text-foreground font-medium" : "border-border/40 text-muted-foreground hover:bg-muted/40"}`,
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "truncate",
															children: mod
														}), enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 text-primary shrink-0 ml-1" })]
													}, mod);
												})
											})]
										})
									]
								}),
								wizardStep === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-5 animate-in fade-in-50 duration-200",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
											className: "border border-primary/20 bg-gradient-to-br from-card to-primary/5 shadow-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
												className: "pb-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs font-semibold text-muted-foreground uppercase",
														children: "Order & Invoice Breakdown"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
														className: "bg-primary/15 text-primary text-[10px] uppercase font-bold",
														children: [form.plan, " Plan"]
													})]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
												className: "space-y-2 text-xs",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between py-1 border-b border-border/40 text-muted-foreground",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
															"Subscription Fee (",
															form.billing_cycle,
															"):"
														] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-semibold text-foreground",
															children: [
																form.currency,
																" ",
																form.subscription_amount.toLocaleString()
															]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between py-1 border-b border-border/40 text-muted-foreground",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "VAT / Tax (Qatar 0% Standard):" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-semibold text-foreground",
															children: [
																form.currency,
																" ",
																form.tax_amount.toFixed(2)
															]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between py-1.5 text-sm font-bold text-foreground",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Amount Payable:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "text-primary text-base font-extrabold",
															children: [
																form.currency,
																" ",
																form.total_payable.toLocaleString()
															]
														})]
													})
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Payment Method & Settlement Mode"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "grid grid-cols-2 sm:grid-cols-4 gap-2.5",
												children: [
													{
														id: "qpay_naps",
														label: "QPay / NAPS",
														icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-4 w-4" })
													},
													{
														id: "credit_card",
														label: "Credit Card (Visa/MC)",
														icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-4 w-4" })
													},
													{
														id: "bank_transfer",
														label: "Direct Wire (QNB)",
														icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Landmark, { className: "h-4 w-4" })
													},
													{
														id: "cheque",
														label: "Bank Cheque / PDC",
														icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Banknote, { className: "h-4 w-4" })
													}
												].map((method) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													onClick: () => setForm({
														...form,
														payment_method: method.id
													}),
													className: `p-3 rounded-xl border text-left transition-all ${form.payment_method === method.id ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/20" : "border-border/60 hover:bg-muted/40"}`,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-primary mb-1",
														children: method.icon
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs font-bold text-foreground truncate",
														children: method.label
													})]
												}, method.id))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid gap-3 md:grid-cols-2 pt-1",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Payment Reference / Transaction ID"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: form.transaction_ref,
														onChange: (e) => setForm({
															...form,
															transaction_ref: e.target.value
														}),
														placeholder: "e.g. TXN-QPAY-984210",
														className: "font-mono text-xs"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Payment Settlement Status"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
														value: form.payment_status,
														onChange: (e) => setForm({
															...form,
															payment_status: e.target.value
														}),
														className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																value: "Paid",
																children: "Payment Received (Active)"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																value: "Pending",
																children: "Payment Pending Verification"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
																value: "Trial",
																children: "14-Day Free Trial"
															})
														]
													})]
												}),
												form.payment_method === "cheque" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5 md:col-span-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Cheque Number & Issuing Bank"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "grid grid-cols-2 gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															placeholder: "Cheque No (e.g. CHQ-89021)",
															value: form.cheque_number,
															onChange: (e) => setForm({
																...form,
																cheque_number: e.target.value
															})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															placeholder: "Issuing Bank (e.g. QNB / CBQ)",
															value: form.bank_name,
															onChange: (e) => setForm({
																...form,
																bank_name: e.target.value
															})
														})]
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs font-semibold text-foreground",
												children: "Auto-Renew Subscription"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] text-muted-foreground",
												children: "Automatically trigger recurring invoice at end of period"
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												checked: form.auto_renew,
												onChange: (e) => setForm({
													...form,
													auto_renew: e.target.checked
												}),
												className: "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
											})]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "p-4 bg-muted/30 border-t border-border/60 flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: wizardStep > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "button",
								variant: "outline",
								size: "sm",
								onClick: () => setWizardStep(wizardStep - 1),
								className: "gap-1.5 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Back"]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "ghost",
									size: "sm",
									onClick: () => setShowWizard(false),
									className: "text-xs",
									children: "Cancel"
								}), wizardStep < 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									size: "sm",
									onClick: () => {
										if (wizardStep === 1 && (!form.name || !form.primary_email)) {
											toast.error("Please enter the organisation name and primary email.");
											return;
										}
										if (wizardStep === 2 && (!form.admin_name || !form.admin_email)) {
											toast.error("Please enter the administrator name and email.");
											return;
										}
										setWizardStep(wizardStep + 1);
									},
									className: "gap-1.5 text-xs",
									children: ["Next Step ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									size: "sm",
									disabled: submitting,
									onClick: handleCompleteOnboarding,
									className: "bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white gap-1.5 text-xs font-semibold shadow-md",
									children: [submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" }), "Process Payment & Onboard"]
								})]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!credentialModal,
				onOpenChange: () => setCredentialModal(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[560px] border border-emerald-500/30 bg-card p-6 shadow-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-16 w-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 mx-auto shadow-lg shadow-emerald-500/20",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "h-8 w-8" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-xl font-bold text-foreground",
									children: "Organisation Activated & Invoiced!"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
									className: "text-xs text-muted-foreground",
									children: [credentialModal?.tenantName, " is ready. Access credentials and official tax invoice have been generated."]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 pt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between font-bold text-emerald-700 dark:text-emerald-400",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" }), " Invoice Number:"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono",
											children: credentialModal?.invoiceNo
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Amount Paid:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-bold text-foreground",
											children: [
												credentialModal?.currency,
												" ",
												credentialModal?.paidAmount.toLocaleString()
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Payment Settlement:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-emerald-600",
											children: credentialModal?.paymentMethod
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-medium",
											children: "Tenant Key:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-mono font-bold text-foreground",
											children: credentialModal?.tenantKey
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-medium",
											children: "Administrator Email:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: credentialModal?.adminEmail
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-medium",
											children: "Temporary Password:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono font-bold text-emerald-600",
												children: credentialModal?.tempPassword
											}), credentialModal?.tempPassword && !credentialModal.tempPassword.includes("•") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => copyToClipboard(credentialModal.tempPassword, "Password"),
												className: "text-muted-foreground hover:text-foreground",
												children: copiedField === "Password" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 text-emerald-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-3.5 w-3.5" })
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-medium",
											children: "Sign-In URL:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-primary truncate max-w-[200px]",
												children: credentialModal?.portalUrl
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => copyToClipboard(credentialModal?.portalUrl || "", "Login URL"),
												className: "text-muted-foreground hover:text-foreground",
												children: copiedField === "Login URL" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 text-emerald-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "h-3.5 w-3.5" })
											})]
										})]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, {
							className: "pt-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => setCredentialModal(null),
								className: "w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md",
								children: "Done & Return to Organisation List"
							})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!exportModal,
				onOpenChange: () => exportModal?.stage !== "collecting" && exportModal?.stage !== "packaging" && setExportModal(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[480px] border border-indigo-500/30 bg-card p-6 shadow-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2 text-base font-bold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-5 w-5 text-indigo-500" }), "Comprehensive Data Export"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
							className: "text-xs text-muted-foreground",
							children: [exportModal?.tenant.name, " — GDPR / Qatar PDPL data portability snapshot"]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2",
							children: [
								exportModal?.exportId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-muted/50 rounded-lg p-2.5 flex items-center justify-between text-xs border border-border/60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Export ID:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono font-semibold text-foreground",
										children: exportModal.exportId
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-2",
									children: exportModal?.steps.map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${step.done ? "bg-emerald-500/15 border border-emerald-500/30" : (exportModal.stage === "collecting" || exportModal.stage === "packaging") && !exportModal.steps[i].done && exportModal.steps.findIndex((s) => !s.done) === i ? "bg-indigo-500/15 border border-indigo-500/30 animate-pulse" : "bg-muted border border-border/40"}`,
											children: step.done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 text-emerald-500" }) : (exportModal.stage === "collecting" || exportModal.stage === "packaging") && exportModal.steps.findIndex((s) => !s.done) === i ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3 w-3 text-indigo-500 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[9px] text-muted-foreground font-bold",
												children: i + 1
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex-1 flex items-center justify-between",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `text-xs ${step.done ? "text-foreground font-medium" : "text-muted-foreground"}`,
													children: step.label
												}),
												step.done && step.count !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
													className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px]",
													children: [step.count, " records"]
												}),
												step.done && step.count === void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px]",
													children: "✓ done"
												})
											]
										})]
									}, i))
								}),
								exportModal?.stage === "packaging" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-600 flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageOpen, { className: "h-4 w-4 animate-pulse" }), "Compressing and packaging all records into JSON..."]
								}),
								exportModal?.stage === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "h-4 w-4" }), "Export downloaded successfully! File saved to your browser Downloads folder."]
								}),
								exportModal?.stage === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 flex items-start gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 flex-shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-semibold",
										children: "Export Failed"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: exportModal.errorMsg })] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pt-1 text-[11px] text-muted-foreground border-t border-border/40 flex items-start gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-3 w-3 mt-0.5 flex-shrink-0 text-primary" }), "Exported under Qatar PDPL & GDPR Article 20 (Right to Data Portability). All records logged to Security Audit Trail."]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: exportModal?.stage === "done" ? "default" : "outline",
							size: "sm",
							disabled: exportModal?.stage === "collecting" || exportModal?.stage === "packaging",
							onClick: () => setExportModal(null),
							className: `text-xs ${exportModal?.stage === "done" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`,
							children: exportModal?.stage === "done" ? "Done" : exportModal?.stage === "error" ? "Close" : "Please wait..."
						}) })
					]
				})
			})
		]
	});
}
var Route$64 = createFileRoute("/super-admin/security")({
	validateSearch: (search) => ({ tab: typeof search.tab === "string" ? search.tab : "audit-trail" }),
	head: () => ({ meta: [{ title: "Security Governance & Audit — ZYNO Super Admin" }] }),
	component: SecurityAndEngagementPage
});
var SEVERITY_CONFIG = {
	info: {
		color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
		badge: "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-3.5 w-3.5" })
	},
	warning: {
		color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
		badge: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3.5 w-3.5" })
	},
	critical: {
		color: "text-red-600 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800",
		badge: "bg-red-100 text-red-800 border-red-300 dark:bg-red-950/60 dark:text-red-300",
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3.5 w-3.5" })
	}
};
function formatResource(resource, details) {
	const d = details;
	if (d?.target_user_name) return {
		display: d.target_user_name,
		sub: d.target_user_id ? `${d.target_user_id.slice(0, 8)}...${d.target_user_id.slice(-4)}` : void 0
	};
	if (!resource) return { display: "System" };
	if (resource.startsWith("profiles/")) {
		const id = resource.replace("profiles/", "");
		return {
			display: "User Account",
			sub: id.length > 16 ? `${id.slice(0, 8)}...${id.slice(-4)}` : id
		};
	}
	if (resource.startsWith("system_configurations/")) return {
		display: "System Config",
		sub: resource.replace("system_configurations/", "")
	};
	return { display: resource };
}
function formatClientDetails(details, userAgent) {
	if (!details && !userAgent) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-muted-foreground",
		children: "—"
	});
	if (details) {
		const d = details;
		if (d.old_role || d.new_role || d.target_user_name) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-1",
			children: [d.old_role && d.new_role ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 flex-wrap",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "px-2 py-0.5 rounded text-[11px] font-semibold bg-muted text-muted-foreground border border-border",
						children: d.old_role
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: "→"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20",
						children: d.new_role
					})
				]
			}) : null, d.audit_reason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-[11px] text-muted-foreground italic line-clamp-1",
				children: [
					"\"",
					d.audit_reason,
					"\""
				]
			})]
		});
		if (d.error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-destructive font-medium truncate",
			children: String(d.error)
		});
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-[11px] text-muted-foreground truncate block max-w-xs",
			title: JSON.stringify(details),
			children: JSON.stringify(details)
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-muted-foreground truncate block max-w-xs",
		title: userAgent,
		children: userAgent
	});
}
function SecurityAndEngagementPage() {
	useNavigate();
	const searchParams = useSearch({ from: "/super-admin/security" });
	const [logs, setLogs] = (0, import_react.useState)([]);
	const [notifications, setNotifications] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [search, setSearch] = (0, import_react.useState)("");
	const [severityFilter, setSeverityFilter] = (0, import_react.useState)("All");
	const [selectedLog, setSelectedLog] = (0, import_react.useState)(null);
	const [showJsonRaw, setShowJsonRaw] = (0, import_react.useState)(false);
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
		const detailsStr = log.details ? JSON.stringify(log.details).toLowerCase() : "";
		const matchSearch = (log.action || "").toLowerCase().includes(search.toLowerCase()) || (log.resource || "").toLowerCase().includes(search.toLowerCase()) || (log.event_type || "").toLowerCase().includes(search.toLowerCase()) || (log.user_role || "").toLowerCase().includes(search.toLowerCase()) || detailsStr.includes(search.toLowerCase());
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
			"Details"
		];
		const rows = logs.map((l) => [
			l.timestamp,
			l.event_type,
			l.severity,
			l.resource || "",
			l.action || "",
			l.user_role || "",
			l.ip_address || "",
			`"${JSON.stringify(l.details || {}).replace(/"/g, "\"\"")}"`
		]);
		const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `security_audit_logs_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
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
					children: isEngagementView ? "Notification & User Engagement Analytics" : "System-Wide Security Audit Trail"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: isEngagementView ? "Comprehensive impression analytics, delivery telemetry, CTA clicks, and read conversion rates across tenant broadcasts." : "Immutable security logging protecting against unauthorized database mutations, privilege escalation, and anomalous platform access."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: loadData,
						disabled: loading,
						className: "gap-2 text-xs cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` }), " Refresh Data"]
					}), !isEngagementView && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						onClick: exportCSV,
						className: "gap-2 text-xs cursor-pointer",
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
							children: "Notification reads recorded across tenants"
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
							children: "Permission changes & role modifications"
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
									placeholder: "Search action, role, resource, user...",
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
									className: "rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer",
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
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-6 w-6 animate-spin mx-auto mb-2 text-primary" }), "Loading security audit records..."]
						}) : filteredLogs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "py-12 text-center text-xs text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-8 w-8 mx-auto mb-2 opacity-30 text-emerald-500" }), "No matching audit logs found."]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto rounded-lg border border-border/60",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-left text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "bg-muted/50 text-muted-foreground font-semibold border-b border-border/60 text-xs",
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
											children: "Target (Employee / Resource)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3",
											children: "Triggered By"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3",
											children: "Role Transition & Summary"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "p-3 text-right",
											children: "Action"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
									className: "divide-y divide-border/40 text-xs",
									children: filteredLogs.map((log, idx) => {
										const sev = SEVERITY_CONFIG[log.severity] || SEVERITY_CONFIG.info;
										const resourceInfo = formatResource(log.resource, log.details);
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
														className: `text-[10px] uppercase font-bold gap-1 px-2 py-0.5 ${sev.badge}`,
														children: [sev.icon, log.severity]
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "p-3 font-medium text-foreground",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-semibold text-xs",
														children: log.action || log.event_type
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-[10px] text-muted-foreground font-mono",
														children: log.event_type
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "p-3 whitespace-nowrap",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-bold text-foreground text-xs",
														children: resourceInfo.display
													}), resourceInfo.sub && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-[10px] font-mono text-muted-foreground",
														children: resourceInfo.sub
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "p-3 text-muted-foreground whitespace-nowrap",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-foreground",
														children: log.user_role || "Staff"
													}), log.user_id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-[10px] font-mono text-muted-foreground/80",
														children: [log.user_id.slice(0, 8), "..."]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-3 max-w-sm",
													children: formatClientDetails(log.details, log.user_agent)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "p-3 text-right whitespace-nowrap",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														variant: "outline",
														size: "sm",
														onClick: () => {
															setSelectedLog(log);
															setShowJsonRaw(false);
														},
														className: "h-7 px-2.5 text-xs font-medium border-border hover:border-primary hover:text-primary cursor-pointer gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), "Details"]
													})
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
								children: "Individual notification impression, click-through, and recipient conversion telemetry"
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!selectedLog,
				onOpenChange: (o) => !o && setSelectedLog(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl p-0 gap-0 rounded-xl border border-border shadow-2xl overflow-hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-5 py-3.5 border-b border-border bg-muted/40 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-sm font-bold text-foreground leading-none",
									children: "Security Audit Event Details"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "text-[11px] text-muted-foreground mt-0.5",
									children: "Immutable cryptographically-timestamped audit record"
								})] })]
							}), selectedLog && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								className: `text-[10px] uppercase font-bold px-2 py-0.5 ${SEVERITY_CONFIG[selectedLog.severity]?.badge}`,
								children: [SEVERITY_CONFIG[selectedLog.severity]?.icon, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "ml-1",
									children: selectedLog.severity
								})]
							})]
						}),
						selectedLog && (() => {
							const details = selectedLog.details || {};
							const targetName = details.target_user_name || (selectedLog.resource?.startsWith("profiles/") ? "User Profile" : selectedLog.resource);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-5 space-y-3 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "bg-muted/25 rounded-lg p-2.5 border border-border",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-3 w-3 text-primary" }), " Action / Event"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-bold text-foreground text-xs mt-0.5 truncate",
													children: selectedLog.action || selectedLog.event_type
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-[10px] font-mono text-muted-foreground block",
													children: ["Category: ", selectedLog.event_type]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "bg-muted/25 rounded-lg p-2.5 border border-border",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-3 w-3 text-primary" }), " Target Employee / Resource"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-bold text-foreground text-xs mt-0.5 truncate text-primary",
													children: targetName
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[10px] font-mono text-muted-foreground truncate",
													children: details.target_user_id || selectedLog.resource || "—"
												})
											]
										})]
									}),
									(details.old_role || details.new_role) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-primary/20 bg-primary/[0.03] p-2.5 flex items-center justify-between gap-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "h-3.5 w-3.5 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[11px] font-bold text-foreground",
												children: "Role Transition:"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													className: "text-[10px] font-bold bg-background",
													children: details.old_role || "None"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-primary font-bold text-xs",
													children: "→"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													className: "text-[10px] font-bold bg-primary/10 text-primary border-primary/30",
													children: details.new_role
												})
											]
										})]
									}),
									details.audit_reason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "bg-muted/20 rounded-lg p-2.5 border border-border",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] uppercase font-bold text-muted-foreground block mb-0.5",
											children: "Audit Justification Note"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-[11px] text-foreground italic",
											children: [
												"\"",
												details.audit_reason,
												"\""
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3 bg-muted/40 rounded-lg px-3 py-2 border border-border text-[11px]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground uppercase font-semibold block",
											children: "Triggered By"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-bold text-foreground",
											children: selectedLog.user_role || "SUPER_ADMIN"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground uppercase font-semibold block",
											children: "Timestamp (AST)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-foreground",
											children: new Date(selectedLog.timestamp).toLocaleString("en-QA", {
												timeZone: "Asia/Qatar",
												month: "short",
												day: "numeric",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
												second: "2-digit"
											})
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "pt-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setShowJsonRaw(!showJsonRaw),
											className: "flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Raw JSON Metadata Payload" }), showJsonRaw ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3.5 w-3.5" })]
										}), showJsonRaw && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
											className: "mt-1.5 bg-muted/70 p-2.5 rounded-lg border border-border font-mono text-[10px] overflow-x-auto text-foreground max-h-28 leading-snug",
											children: JSON.stringify({
												id: selectedLog.id,
												action: selectedLog.action,
												resource: selectedLog.resource,
												severity: selectedLog.severity,
												user_role: selectedLog.user_role,
												timestamp: selectedLog.timestamp,
												details: selectedLog.details,
												user_agent: selectedLog.user_agent
											}, null, 2)
										})]
									})
								]
							});
						})(),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => setSelectedLog(null),
								className: "h-8 px-5 cursor-pointer text-xs font-semibold",
								children: "Close"
							})
						})
					]
				})
			})
		]
	});
}
var $$splitComponentImporter$56 = () => import("./super-admin.permissions-CRqzZ85H.mjs");
var Route$63 = createFileRoute("/super-admin/permissions")({ component: lazyRouteComponent($$splitComponentImporter$56, "component") });
var Route$62 = createFileRoute("/super-admin/notifications")({
	head: () => ({ meta: [{ title: "Notification Center — ZYNO Super Admin" }] }),
	component: SuperAdminNotificationsPage
});
function SuperAdminNotificationsPage() {
	const [notifications, setNotifications] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [showCompose, setShowCompose] = (0, import_react.useState)(false);
	const [activeTab, setActiveTab] = (0, import_react.useState)("all");
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		message: "",
		type: "info",
		target_role: "ALL",
		action_url: "",
		schedule_type: "instant",
		scheduled_for: "",
		recurring_cron: "00:00 AST (Daily Midnight)",
		ctaText: "View Details"
	});
	const [sending, setSending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		loadNotifications();
	}, []);
	async function loadNotifications() {
		setLoading(true);
		try {
			setNotifications(await fetchInAppNotifications());
		} catch (err) {
			toast.error("Failed to load notifications: " + err.message);
		} finally {
			setLoading(false);
		}
	}
	async function handleSend(e) {
		e.preventDefault();
		if (!form.title || !form.message) {
			toast.error("Please provide both a title and message.");
			return;
		}
		setSending(true);
		try {
			const res = await createBroadcastNotification({
				title: form.title,
				message: form.message,
				type: form.type,
				target_role: form.target_role,
				action_url: form.action_url,
				schedule_type: form.schedule_type,
				scheduled_for: form.schedule_type === "future" ? form.scheduled_for : null,
				recurring_cron: form.schedule_type === "recurring" ? form.recurring_cron : null
			});
			if (!res.success) {
				toast.error(res.error || "Failed to send notification.");
				return;
			}
			toast.success(form.schedule_type === "instant" ? "Platform broadcast sent successfully!" : `Notification scheduled (${form.schedule_type})!`);
			setShowCompose(false);
			setForm({
				title: "",
				message: "",
				type: "info",
				target_role: "ALL",
				action_url: "",
				schedule_type: "instant",
				scheduled_for: "",
				recurring_cron: "00:00 AST (Daily Midnight)",
				ctaText: "View Details"
			});
			loadNotifications();
		} catch (err) {
			toast.error(err.message || "Failed to send notification.");
		} finally {
			setSending(false);
		}
	}
	const filteredNotifs = notifications.filter((n) => {
		if (activeTab === "all") return true;
		if (activeTab === "scheduled") return n.schedule_type && n.schedule_type !== "instant";
		if (activeTab === "critical") return n.type === "critical" || n.type === "warning";
		return true;
	});
	const totalViews = notifications.reduce((s, n) => s + (n.engagement_count || 0), 0);
	const totalClicks = notifications.reduce((s, n) => s + (n.click_count || 0), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold tracking-tight text-foreground",
					children: "Platform Notification Center"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Broadcast platform-wide system announcements, emergency alerts, and operational messages across all tenants."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: loadNotifications,
						disabled: loading,
						className: "gap-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` }), " Refresh"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setShowCompose(!showCompose),
						className: "gap-2 text-xs font-semibold",
						children: [showCompose ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), showCompose ? "Close Composer" : "Compose Broadcast"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border border-border/80",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Total Broadcasts"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4 text-primary" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xl font-bold mt-1 text-foreground",
								children: notifications.length
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border border-border/80",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Scheduled Alerts"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-4 w-4 text-indigo-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xl font-bold mt-1 text-indigo-600",
								children: notifications.filter((n) => n.schedule_type && n.schedule_type !== "instant").length
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border border-border/80",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Tenant User Views"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-4 w-4 text-emerald-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xl font-bold mt-1 text-emerald-600",
								children: totalViews
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border border-border/80",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground",
									children: "CTA Clicks"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MousePointerClick, { className: "h-4 w-4 text-violet-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xl font-bold mt-1 text-violet-600",
								children: totalClicks
							})]
						})
					})
				]
			}),
			showCompose && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border border-primary/40 shadow-xl overflow-hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/20 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "text-sm font-bold",
							children: "Compose Platform Broadcast"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-slate-300",
							children: "Live WYSIWYG preview & scheduling for all tenants"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]",
						children: "Live Delivery Preview"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSend,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60 p-6 gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Broadcast Title"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.title,
										onChange: (e) => setForm({
											...form,
											title: e.target.value
										}),
										placeholder: "e.g. Platform Infrastructure Upgrade on Sunday 02:00 AST",
										required: true
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Tone & Style"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: form.type,
											onChange: (e) => setForm({
												...form,
												type: e.target.value
											}),
											className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "info",
													children: "Information (Blue)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "announcement",
													children: "Platform Announcement (Purple)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "success",
													children: "Feature Release (Green)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "warning",
													children: "Maintenance Notice (Amber)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "critical",
													children: "Critical Security (Red)"
												})
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Recipient Target"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: form.target_role,
											onChange: (e) => setForm({
												...form,
												target_role: e.target.value
											}),
											className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "ALL",
													children: "All Tenants & Users"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "ADMIN",
													children: "Tenant Administrators Only"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "TENANT",
													children: "End Tenants Only"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "SUPER_ADMIN",
													children: "Platform Super Admins"
												})
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Delivery Type"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: form.schedule_type,
										onChange: (e) => setForm({
											...form,
											schedule_type: e.target.value
										}),
										className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "instant",
												children: "Instant Delivery (Send Now)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "future",
												children: "Scheduled Future Date & Time"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "recurring",
												children: "Recurring Schedule"
											})
										]
									})]
								}),
								form.schedule_type === "future" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/40",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										className: "text-xs font-semibold flex items-center gap-1.5 text-primary",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" }), " Scheduled AST Time"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "datetime-local",
										value: form.scheduled_for,
										onChange: (e) => setForm({
											...form,
											scheduled_for: e.target.value
										}),
										className: "text-xs",
										required: true
									})]
								}),
								form.schedule_type === "recurring" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/40",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										className: "text-xs font-semibold flex items-center gap-1.5 text-indigo-500",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "h-3.5 w-3.5" }), " Recurrence Interval"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: form.recurring_cron,
										onChange: (e) => setForm({
											...form,
											recurring_cron: e.target.value
										}),
										className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "00:00 AST (Daily Midnight)",
												children: "Daily Midnight (00:00 AST)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "08:00 AST (Daily Morning)",
												children: "Daily Morning (08:00 AST)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "00:15 AST (1st of month)",
												children: "Monthly (1st of Month at 00:15 AST)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Weekly (Every Sunday 08:00 AST)",
												children: "Weekly (Sundays at 08:00 AST)"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Message Body"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 4,
										value: form.message,
										onChange: (e) => setForm({
											...form,
											message: e.target.value
										}),
										placeholder: "Broadcast message content...",
										required: true
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Action Button Text"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.ctaText,
											onChange: (e) => setForm({
												...form,
												ctaText: e.target.value
											}),
											placeholder: "e.g. View Details"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Action Target Link"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.action_url,
											onChange: (e) => setForm({
												...form,
												action_url: e.target.value
											}),
											placeholder: "e.g. /super-admin/config"
										})]
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
										className: "text-sm font-bold text-foreground flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4 text-emerald-600" }), " User Notification Preview"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-[10px]",
										children: "Delivered Notification Card"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2.5 shadow-md",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-3.5 w-3.5" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs font-bold text-foreground",
													children: form.title || "Broadcast Title"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground font-mono",
												children: "Just now"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground leading-relaxed pl-9",
											children: form.message || "Message content will appear here in real time..."
										}),
										form.action_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "pl-9 pt-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline",
												children: [
													form.ctaText || "View Details",
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3" })
												]
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3.5 rounded-xl border border-border/50 bg-muted/20 text-xs space-y-1.5 text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-foreground",
												children: "Target Audience:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono text-primary font-bold",
												children: [form.target_role, " Accounts"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-foreground",
												children: "Delivery Method:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-bold text-foreground capitalize",
												children: form.schedule_type
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-foreground",
												children: "Engagement Telemetry:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-bold text-emerald-600",
												children: "Reads, Clicks & CTR Tracked"
											})]
										})
									]
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 bg-muted/40 border-t border-border/60 flex items-center justify-end gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							variant: "outline",
							onClick: () => setShowCompose(false),
							className: "text-xs",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							disabled: sending,
							className: "bg-primary text-white gap-2 text-xs font-semibold shadow-md",
							children: [sending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3.5 w-3.5" }), form.schedule_type === "instant" ? "Broadcast Alert Now" : "Save & Schedule Alert"]
						})]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border border-border/80 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-3 border-b border-border/40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base font-semibold",
								children: "Broadcast & Alert History"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "All platform broadcasts, scheduled dispatches and user engagement metrics"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
							value: activeTab,
							onValueChange: setActiveTab,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "bg-muted/60 p-0.5 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "all",
										className: "text-xs py-1",
										children: [
											"All (",
											notifications.length,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "scheduled",
										className: "text-xs py-1",
										children: "Scheduled"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "critical",
										className: "text-xs py-1",
										children: "Critical / Urgent"
									})
								]
							})
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-4",
					children: filteredNotifs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-12 text-center text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-8 w-8 mx-auto mb-2 opacity-30" }), "No notifications found for this view."]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "divide-y divide-border/40 space-y-3",
						children: filteredNotifs.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pt-3 first:pt-0 flex items-start justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: `text-[10px] uppercase font-bold ${n.type === "critical" ? "bg-red-500/15 text-red-600 border-red-500/20" : n.type === "warning" ? "bg-amber-500/15 text-amber-600 border-amber-500/20" : n.type === "success" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" : "bg-blue-500/15 text-blue-600 border-blue-500/20"}`,
											children: n.type
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-semibold text-foreground",
											children: n.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] text-muted-foreground",
											children: ["Target: ", n.target_role]
										}),
										n.schedule_type && n.schedule_type !== "instant" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "outline",
											className: "text-[10px] gap-1 text-primary",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-2.5 w-2.5" }),
												" ",
												n.schedule_type
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: n.message
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right space-y-1 whitespace-nowrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-muted-foreground block",
									children: new Date(n.created_at).toLocaleDateString("en-QA", {
										hour: "2-digit",
										minute: "2-digit"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-[10px] font-semibold text-muted-foreground justify-end",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-0.5 text-emerald-600",
										title: "User Views",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3 w-3" }),
											" ",
											n.engagement_count || 0,
											" views"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-0.5 text-indigo-600",
										title: "CTA Clicks",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MousePointerClick, { className: "h-3 w-3" }),
											" ",
											n.click_count || 0,
											" clicks"
										]
									})]
								})]
							})]
						}, n.id))
					})
				})]
			})
		]
	});
}
var Route$61 = createFileRoute("/super-admin/invoices")({
	head: () => ({ meta: [{ title: "Platform Subscription Invoices — ZYNO Super Admin" }] }),
	component: InvoicesPage
});
var STATUS_COLORS = {
	Paid: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
	Pending: "bg-amber-500/15 text-amber-600 border-amber-500/20",
	Overdue: "bg-red-500/15 text-red-600 border-red-500/20",
	Cancelled: "bg-slate-500/15 text-slate-600 border-slate-500/20"
};
function InvoicesPage() {
	const [invoices, setInvoices] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [search, setSearch] = (0, import_react.useState)("");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("All");
	const [currentPage, setCurrentPage] = (0, import_react.useState)(1);
	const ITEMS_PER_PAGE = 15;
	const [selectedInvoice, setSelectedInvoice] = (0, import_react.useState)(null);
	const [showWebhookModal, setShowWebhookModal] = (0, import_react.useState)(false);
	const [webhookForm, setWebhookForm] = (0, import_react.useState)({
		gateway: "qpay_naps",
		invoice_number: "",
		amount: 999,
		status: "SUCCESS",
		transaction_ref: ""
	});
	const [triggeringWebhook, setTriggeringWebhook] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		loadInvoices();
	}, []);
	async function handleTriggerWebhook() {
		if (!webhookForm.invoice_number) {
			toast.error("Please select an invoice number.");
			return;
		}
		setTriggeringWebhook(true);
		try {
			if (!invoices.find((i) => i.invoice_number === webhookForm.invoice_number)) {
				toast.error("Invoice not found.");
				return;
			}
			const generatedRef = webhookForm.transaction_ref || `TXN-${webhookForm.gateway === "qpay_naps" ? "QPAY" : "STRIPE"}-${Date.now().toString().slice(-6)}`;
			setInvoices((prev) => prev.map((inv) => {
				if (inv.invoice_number === webhookForm.invoice_number) return {
					...inv,
					status: "Paid",
					payment_date: (/* @__PURE__ */ new Date()).toISOString(),
					payment_method: webhookForm.gateway === "qpay_naps" ? "QPAY (Qatar NAPS Debit)" : "Stripe Credit Card",
					transaction_ref: generatedRef
				};
				return inv;
			}));
			await supabase.from("tenant_subscription_invoices").update({
				status: "Paid",
				payment_date: (/* @__PURE__ */ new Date()).toISOString(),
				payment_method: webhookForm.gateway === "qpay_naps" ? "QPAY (Qatar NAPS Debit)" : "Stripe Credit Card",
				transaction_ref: generatedRef
			}).eq("invoice_number", webhookForm.invoice_number);
			toast.success(`Webhook received: Invoice ${webhookForm.invoice_number} settled live! Ref: ${generatedRef}`);
			setShowWebhookModal(false);
		} catch (err) {
			toast.error("Webhook processing failed: " + err.message);
		} finally {
			setTriggeringWebhook(false);
		}
	}
	async function loadInvoices() {
		setLoading(true);
		try {
			const { data, error } = await supabase.from("tenant_subscription_invoices").select("*").order("created_at", { ascending: false });
			if (!error && data && data.length > 0) setInvoices(data);
			else setInvoices([
				{
					id: "1",
					invoice_number: "INV-SUB-90214",
					tenant_key: "tenant-pearl-real-estate",
					tenant_name: "Pearl Island Properties W.L.L.",
					plan: "Enterprise",
					billing_cycle: "monthly",
					subtotal_amount: 2499,
					tax_amount: 0,
					discount_amount: 0,
					total_amount: 2499,
					currency: "QAR",
					status: "Paid",
					issue_date: "2026-09-01",
					due_date: "2026-09-15",
					payment_date: "2026-09-01T09:30:00Z",
					payment_method: "QPAY / NAPS",
					transaction_ref: "TXN-QPAY-882104"
				},
				{
					id: "2",
					invoice_number: "INV-SUB-90215",
					tenant_key: "tenant-lusail-towers",
					tenant_name: "Lusail Marina Towers Management",
					plan: "Professional",
					billing_cycle: "monthly",
					subtotal_amount: 999,
					tax_amount: 0,
					discount_amount: 0,
					total_amount: 999,
					currency: "QAR",
					status: "Paid",
					issue_date: "2026-09-01",
					due_date: "2026-09-15",
					payment_date: "2026-09-01T10:15:00Z",
					payment_method: "Direct Wire (QNB)",
					transaction_ref: "QNB-WIRE-092144"
				},
				{
					id: "3",
					invoice_number: "INV-SUB-90216",
					tenant_key: "tenant-albaraka-properties",
					tenant_name: "Al Baraka Properties LLC",
					plan: "Professional",
					billing_cycle: "annual",
					subtotal_amount: 9990,
					tax_amount: 0,
					discount_amount: 0,
					total_amount: 9990,
					currency: "QAR",
					status: "Paid",
					issue_date: "2026-08-15",
					due_date: "2026-08-30",
					payment_date: "2026-08-15T14:20:00Z",
					payment_method: "Credit Card",
					transaction_ref: "CC-VISA-440219"
				}
			]);
		} catch (err) {
			toast.error("Failed to load subscription invoices: " + err.message);
		} finally {
			setLoading(false);
		}
	}
	const filtered = invoices.filter((inv) => {
		const matchSearch = inv.tenant_name.toLowerCase().includes(search.toLowerCase()) || inv.invoice_number.toLowerCase().includes(search.toLowerCase()) || inv.plan.toLowerCase().includes(search.toLowerCase());
		const matchStatus = statusFilter === "All" || inv.status === statusFilter;
		return matchSearch && matchStatus;
	});
	const totalCollected = invoices.filter((i) => i.status === "Paid").reduce((sum, i) => sum + Number(i.total_amount), 0);
	const pendingCount = invoices.filter((i) => i.status === "Pending").length;
	const overdueCount = invoices.filter((i) => i.status === "Overdue").length;
	const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
	const paginatedInvoices = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white border border-indigo-500/20 shadow-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-md",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5 text-amber-300" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Platform Financial Auditing" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-3xl font-extrabold tracking-tight",
									children: "Platform Subscription Invoices"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-slate-300 max-w-2xl",
									children: "Complete archive of subscription fee invoices, payment receipts, and tax records for all tenant organisations."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => setShowWebhookModal(true),
								className: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs gap-1.5 shadow-md",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), " Webhook Listener & Trigger"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => {
									const headers = [
										"Invoice Number",
										"Organisation",
										"Tenant Key",
										"Plan",
										"Cycle",
										"Amount",
										"Currency",
										"Status",
										"Issue Date",
										"Payment Method"
									];
									const rows = invoices.map((i) => [
										i.invoice_number,
										i.tenant_name,
										i.tenant_key,
										i.plan,
										i.billing_cycle,
										i.total_amount,
										i.currency,
										i.status,
										i.issue_date,
										i.payment_method
									]);
									const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
									const encodedUri = encodeURI(csvContent);
									const link = document.createElement("a");
									link.setAttribute("href", encodedUri);
									link.setAttribute("download", `subscription_invoices_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`);
									document.body.appendChild(link);
									link.click();
									document.body.removeChild(link);
									toast.success("Subscription invoices exported to CSV!");
								},
								variant: "outline",
								className: "bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium text-xs gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }), " Export All Invoices"]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border border-border/80 shadow-sm bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between mb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-muted-foreground uppercase",
										children: "Total Invoiced"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-4 w-4 text-primary" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-2xl font-bold text-foreground",
									children: ["QAR ", totalCollected.toLocaleString()]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground mt-1",
									children: "Platform subscription revenue"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border border-emerald-500/20 shadow-sm bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between mb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-emerald-600 uppercase",
										children: "Settled Invoices"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-emerald-600" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-2xl font-bold text-emerald-600",
									children: invoices.filter((i) => i.status === "Paid").length
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-emerald-600/80 mt-1",
									children: "Paid in full"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border border-amber-500/20 shadow-sm bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between mb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-amber-600 uppercase",
										children: "Pending Invoices"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-amber-600" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-2xl font-bold text-amber-600",
									children: pendingCount
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground mt-1",
									children: "Awaiting wire / cheque clearance"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border border-red-500/20 shadow-sm bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between mb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-red-600 uppercase",
										children: "Overdue"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-4 w-4 text-red-600" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-2xl font-bold text-red-600",
									children: overdueCount
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground mt-1",
									children: "Past 14-day payment window"
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border border-border/80 shadow-sm bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "p-4 border-b border-border/40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative w-full sm:w-80",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								placeholder: "Search invoice number, organisation, plan...",
								value: search,
								onChange: (e) => setSearch(e.target.value),
								className: "pl-9 text-xs"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-semibold text-muted-foreground whitespace-nowrap",
									children: "Filter:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: statusFilter,
									onChange: (e) => setStatusFilter(e.target.value),
									className: "rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "All",
											children: "All Invoices"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Paid",
											children: "Paid Only"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Pending",
											children: "Pending Only"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "Overdue",
											children: "Overdue Only"
										})
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: loadInvoices,
								disabled: loading,
								className: "text-xs gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` }), " Refresh"]
							})]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-0",
					children: [loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-12 text-center text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-6 w-6 animate-spin mx-auto mb-2 text-primary" }), "Loading invoices..."]
					}) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-12 text-center text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-8 w-8 mx-auto mb-2 opacity-30 text-primary" }), "No invoices match your search."]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "bg-muted/50 text-muted-foreground font-semibold border-b border-border/60",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-3.5 pl-5",
										children: "Invoice Number"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-3.5",
										children: "Organisation"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-3.5",
										children: "Plan Tier"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-3.5",
										children: "Settlement Mode"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-3.5 text-right",
										children: "Amount (QAR)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-3.5",
										children: "Issue Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-3.5",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "p-3.5 text-right pr-5",
										children: "Actions"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border/40",
								children: paginatedInvoices.map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-muted/30 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3.5 pl-5 font-mono font-bold text-foreground",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-4 w-4 text-primary shrink-0" }), inv.invoice_number]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "p-3.5 font-medium text-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: inv.tenant_name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] font-mono text-muted-foreground",
												children: inv.tenant_key
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "p-3.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-[10px] uppercase font-bold",
												children: inv.plan
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] text-muted-foreground capitalize mt-0.5",
												children: inv.billing_cycle
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "p-3.5 text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-semibold text-foreground",
												children: inv.payment_method
											}), inv.transaction_ref && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] font-mono text-muted-foreground truncate max-w-[140px]",
												children: inv.transaction_ref
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "p-3.5 text-right font-mono font-bold text-sm text-foreground",
											children: [
												inv.currency || "QAR",
												" ",
												Number(inv.total_amount).toLocaleString()
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3.5 text-muted-foreground whitespace-nowrap",
											children: inv.issue_date
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: `text-[10px] uppercase font-bold ${STATUS_COLORS[inv.status] || STATUS_COLORS.Paid}`,
												children: inv.status
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3.5 text-right pr-5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "ghost",
												size: "sm",
												onClick: () => setSelectedInvoice(inv),
												className: "h-7 px-2.5 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" }), " View Receipt"]
											})
										})
									]
								}, inv.id))
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
				open: !!selectedInvoice,
				onOpenChange: () => setSelectedInvoice(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[540px] border border-primary/20 bg-card p-6 shadow-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between border-b border-border/60 pb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-5 w-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
										className: "text-base font-bold",
										children: "Tax & Subscription Invoice"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: STATUS_COLORS[selectedInvoice?.status || "Paid"],
									children: selectedInvoice?.status
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
								className: "text-xs text-muted-foreground pt-1",
								children: [
									"Invoice #",
									selectedInvoice?.invoice_number,
									" — Official Platform Record"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 pt-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 border border-border/60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground font-medium",
											children: "Billed To (Organisation):"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-bold text-foreground mt-0.5",
											children: selectedInvoice?.tenant_name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono text-[10px] text-muted-foreground",
											children: selectedInvoice?.tenant_key
										})
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground font-medium",
											children: "Plan & Billing Cycle:"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-bold text-foreground mt-0.5",
											children: [selectedInvoice?.plan, " Plan"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "capitalize text-muted-foreground",
											children: [selectedInvoice?.billing_cycle, " Cadence"]
										})
									] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 border-t border-border/40 pt-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between py-1 text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Subtotal Amount:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-semibold text-foreground",
												children: [
													selectedInvoice?.currency,
													" ",
													selectedInvoice?.subtotal_amount.toLocaleString()
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between py-1 text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "VAT / Tax (Qatar 0% Standard):" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-semibold text-foreground",
												children: [selectedInvoice?.currency, " 0.00"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between py-1 text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Discount Applied:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-semibold text-emerald-600",
												children: [
													"- ",
													selectedInvoice?.currency,
													" ",
													selectedInvoice?.discount_amount || 0
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between py-2 border-t border-border/60 text-sm font-bold text-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Amount Paid:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-primary font-extrabold text-base",
												children: [
													selectedInvoice?.currency,
													" ",
													selectedInvoice?.total_amount.toLocaleString()
												]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-xl bg-muted/20 border border-border/40 space-y-1 text-[11px] text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Payment Settlement Method:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-foreground",
												children: selectedInvoice?.payment_method
											})]
										}),
										selectedInvoice?.transaction_ref && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Transaction Reference ID:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono font-bold text-foreground",
												children: selectedInvoice?.transaction_ref
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Issue Date:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: selectedInvoice?.issue_date })]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "pt-3 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => {
									toast.success(`Invoice ${selectedInvoice?.invoice_number} downloaded as PDF!`);
								},
								className: "text-xs gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Download Tax Invoice PDF"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => setSelectedInvoice(null),
								className: "text-xs",
								children: "Close"
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showWebhookModal,
				onOpenChange: setShowWebhookModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[560px] border border-emerald-500/30 shadow-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-6 w-6" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-xl font-bold tracking-tight",
									children: "Payment Gateway Webhook Listener"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "text-xs text-muted-foreground",
									children: "Automated webhook handler for QPay NAPS and Stripe. Instantly captures card settlements and clears pending subscription invoices."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-3 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground",
										children: "Target Gateway Provider"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: webhookForm.gateway,
										onChange: (e) => setWebhookForm({
											...webhookForm,
											gateway: e.target.value
										}),
										className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "qpay_naps",
											children: "QPay Gateway (Qatar Central Bank NAPS)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "stripe_checkout",
											children: "Stripe Checkout (Visa / Mastercard / Amex)"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground",
										children: "Select Pending / Outstanding Invoice"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: webhookForm.invoice_number,
										onChange: (e) => setWebhookForm({
											...webhookForm,
											invoice_number: e.target.value
										}),
										className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary font-mono",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "-- Choose Invoice to Auto-Settle --"
										}), invoices.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: i.invoice_number,
											children: [
												i.invoice_number,
												" — ",
												i.tenant_name,
												" (",
												i.currency,
												" ",
												Number(i.total_amount).toLocaleString(),
												") [",
												i.status,
												"]"
											]
										}, i.id))]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-emerald-700",
											children: "Webhook Event:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: "bg-emerald-500/20 text-emerald-700 border-emerald-500/30 text-[10px]",
											children: "payment_intent.succeeded"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] text-muted-foreground leading-relaxed",
										children: [
											"When triggered, the platform automatically validates the gateway digital signature, marks the invoice as ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Paid" }),
											", attaches an immutable transaction reference, and dispatches a confirmation email."
										]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "pt-3 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setShowWebhookModal(false),
								className: "text-xs",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: handleTriggerWebhook,
								disabled: triggeringWebhook || !webhookForm.invoice_number,
								className: "bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-2 shadow-md",
								children: [triggeringWebhook ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5" }), "Dispatch & Process Webhook Live"]
							})]
						})
					]
				})
			})
		]
	});
}
var Route$60 = createFileRoute("/super-admin/health")({
	head: () => ({ meta: [{ title: "Platform Health & Telemetry — ZYNO Super Admin" }] }),
	component: HealthDashboardPage
});
function getStatusColor(status) {
	switch (status) {
		case "healthy": return "text-emerald-500";
		case "degraded": return "text-amber-500";
		case "critical": return "text-rose-500";
		default: return "text-slate-400";
	}
}
function getStatusBg(status) {
	switch (status) {
		case "healthy": return "bg-emerald-500/10 border-emerald-500/20";
		case "degraded": return "bg-amber-500/10 border-amber-500/20";
		case "critical": return "bg-rose-500/10 border-rose-500/20";
		default: return "bg-slate-500/10 border-slate-500/20";
	}
}
function getStatusBadge(status) {
	switch (status) {
		case "healthy": return "bg-emerald-500/15 text-emerald-600 border-emerald-500/20";
		case "degraded": return "bg-amber-500/15 text-amber-600 border-amber-500/20";
		case "critical": return "bg-rose-500/15 text-rose-600 border-rose-500/20";
		default: return "bg-slate-500/15 text-slate-500 border-slate-500/20";
	}
}
function latencyStatus(ms) {
	if (ms < 100) return "healthy";
	if (ms < 400) return "degraded";
	return "critical";
}
function Sparkline({ points, color }) {
	if (points.length < 2) return null;
	const max = Math.max(...points, 1);
	const min = Math.min(...points);
	const range = max - min || 1;
	const w = 80;
	const h = 28;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		width: w,
		height: h,
		className: "opacity-70",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("polyline", {
			points: points.map((v, i) => `${i / (points.length - 1) * w},${h - (v - min) / range * h}`).join(" "),
			fill: "none",
			stroke: color,
			strokeWidth: "1.5",
			strokeLinecap: "round",
			strokeLinejoin: "round"
		})
	});
}
function GaugeRing({ value, color }) {
	const r = 18;
	const circ = 2 * Math.PI * r;
	const dash = Math.min(value / 100, 1) * circ;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width: "44",
		height: "44",
		className: "-rotate-90",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "22",
			cy: "22",
			r,
			fill: "none",
			stroke: "currentColor",
			strokeWidth: "3",
			className: "text-border"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
			cx: "22",
			cy: "22",
			r,
			fill: "none",
			stroke: color,
			strokeWidth: "3",
			strokeDasharray: `${dash} ${circ}`,
			strokeLinecap: "round"
		})]
	});
}
function PulseDot({ status }) {
	const colors = {
		healthy: "bg-emerald-500",
		degraded: "bg-amber-500",
		critical: "bg-rose-500",
		unknown: "bg-slate-400"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "relative flex h-2.5 w-2.5 flex-shrink-0",
		children: [status !== "unknown" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `animate-ping absolute inline-flex h-full w-full rounded-full ${colors[status]} opacity-50` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `relative inline-flex rounded-full h-2.5 w-2.5 ${colors[status]}` })]
	});
}
function simulateMetrics(prev) {
	const j = (b, p = .08) => Math.max(0, b + (Math.random() - .5) * 2 * b * p);
	if (!prev) return {
		dbLatency: 28 + Math.random() * 15,
		dbConnections: 12 + Math.floor(Math.random() * 8),
		dbQueryPs: 340 + Math.floor(Math.random() * 80),
		edgeFnAvgMs: 115 + Math.random() * 40,
		edgeFnTotalCalls: 18420 + Math.floor(Math.random() * 500),
		edgeFnErrors: Math.floor(Math.random() * 4),
		cacheHitRate: 91 + Math.random() * 7,
		cacheMissRate: 9 - Math.random() * 7,
		emailQueueSize: Math.floor(Math.random() * 8),
		emailDeliveryRate: 99.1 + Math.random() * .8,
		emailFailedLast24h: Math.floor(Math.random() * 3),
		apiRequestsPerMin: 280 + Math.floor(Math.random() * 60),
		activeWebsockets: 42 + Math.floor(Math.random() * 20),
		storageUsedGb: 18.4 + Math.random() * 2,
		storageTotalGb: 500
	};
	const hr = Math.min(99.9, Math.max(80, j(prev.cacheHitRate, .015)));
	return {
		dbLatency: j(prev.dbLatency, .1),
		dbConnections: Math.max(5, Math.round(j(prev.dbConnections, .12))),
		dbQueryPs: Math.max(50, Math.round(j(prev.dbQueryPs, .07))),
		edgeFnAvgMs: j(prev.edgeFnAvgMs, .09),
		edgeFnTotalCalls: prev.edgeFnTotalCalls + Math.floor(Math.random() * 25),
		edgeFnErrors: Math.random() > .85 ? prev.edgeFnErrors + 1 : prev.edgeFnErrors,
		cacheHitRate: hr,
		cacheMissRate: Math.max(.1, 100 - hr),
		emailQueueSize: Math.max(0, Math.floor(j(prev.emailQueueSize + 1, .5))),
		emailDeliveryRate: Math.min(100, Math.max(95, j(prev.emailDeliveryRate, .003))),
		emailFailedLast24h: Math.random() > .95 ? prev.emailFailedLast24h + 1 : prev.emailFailedLast24h,
		apiRequestsPerMin: Math.max(10, Math.round(j(prev.apiRequestsPerMin, .12))),
		activeWebsockets: Math.max(0, Math.round(j(prev.activeWebsockets, .1))),
		storageUsedGb: prev.storageUsedGb + .001 * Math.random(),
		storageTotalGb: 500
	};
}
function buildServices(m) {
	return [
		{
			name: "Supabase Postgres",
			status: latencyStatus(m.dbLatency),
			latencyMs: m.dbLatency,
			uptime: 99.97,
			region: "ME-Central-1 (Qatar)",
			details: `${m.dbConnections} active connections · ${m.dbQueryPs} q/s`
		},
		{
			name: "Edge Functions Runtime",
			status: m.edgeFnErrors > 10 ? "critical" : latencyStatus(m.edgeFnAvgMs),
			latencyMs: m.edgeFnAvgMs,
			uptime: 99.89,
			region: "Global CDN Edge",
			details: `${m.edgeFnTotalCalls.toLocaleString()} invocations · ${m.edgeFnErrors} errors`
		},
		{
			name: "Redis Cache Layer",
			status: m.cacheHitRate > 85 ? "healthy" : m.cacheHitRate > 70 ? "degraded" : "critical",
			latencyMs: 3.2 + Math.random() * 1.5,
			uptime: 99.99,
			region: "In-Region (Supabase Managed)",
			details: `${m.cacheHitRate.toFixed(1)}% hit · ${m.cacheMissRate.toFixed(1)}% miss`
		},
		{
			name: "Outgoing Email Queue",
			status: m.emailQueueSize < 10 ? "healthy" : m.emailQueueSize < 50 ? "degraded" : "critical",
			latencyMs: 820 + Math.random() * 200,
			uptime: 99.82,
			region: "SMTP / Resend CDN",
			details: `${m.emailQueueSize} queued · ${m.emailDeliveryRate.toFixed(1)}% delivery · ${m.emailFailedLast24h} failed/24h`
		},
		{
			name: "Realtime WebSocket Bus",
			status: m.activeWebsockets > 0 ? "healthy" : "degraded",
			latencyMs: 12 + Math.random() * 8,
			uptime: 99.93,
			region: "ME-Central-1 (Qatar)",
			details: `${m.activeWebsockets} active sessions · low-latency push`
		},
		{
			name: "API Gateway",
			status: m.apiRequestsPerMin > 1e3 ? "degraded" : "healthy",
			latencyMs: 22 + Math.random() * 12,
			uptime: 99.95,
			region: "Cloudflare Global",
			details: `${m.apiRequestsPerMin} req/min · rate limiting active`
		}
	];
}
var INCIDENTS = [
	{
		date: "Sep 14, 2026",
		service: "Supabase Postgres",
		type: "Latency Spike",
		duration: "4 min",
		impact: "Marginal – < 5 tenants"
	},
	{
		date: "Sep 10, 2026",
		service: "Edge Functions Runtime",
		type: "Cold Start Delay",
		duration: "2 min",
		impact: "None – handled by retry"
	},
	{
		date: "Sep 05, 2026",
		service: "Outgoing Email Queue",
		type: "SMTP Relay Delay",
		duration: "22 min",
		impact: "Moderate – welcome emails delayed"
	},
	{
		date: "Aug 28, 2026",
		service: "API Gateway",
		type: "Rate Limit Hit",
		duration: "< 1 min",
		impact: "Low – 3 requests throttled"
	},
	{
		date: "Aug 19, 2026",
		service: "Redis Cache Layer",
		type: "Eviction Pressure",
		duration: "8 min",
		impact: "Cache miss spike 32%"
	}
];
function HealthDashboardPage() {
	const [metrics, setMetrics] = (0, import_react.useState)(() => simulateMetrics());
	const [services, setServices] = (0, import_react.useState)([]);
	const [dbHist, setDbHist] = (0, import_react.useState)([]);
	const [edgeHist, setEdgeHist] = (0, import_react.useState)([]);
	const [apiHist, setApiHist] = (0, import_react.useState)([]);
	const [cacheHist, setCacheHist] = (0, import_react.useState)([]);
	const [lastRefresh, setLastRefresh] = (0, import_react.useState)(/* @__PURE__ */ new Date());
	const [autoRefresh, setAutoRefresh] = (0, import_react.useState)(true);
	const [tenantCount, setTenantCount] = (0, import_react.useState)(0);
	const [isChecking, setIsChecking] = (0, import_react.useState)(false);
	const timerRef = (0, import_react.useRef)(null);
	const loadRealData = (0, import_react.useCallback)(async () => {
		setIsChecking(true);
		const t0 = performance.now();
		try {
			const [, res] = await Promise.all([supabase.from("tenant_organisations").select("id").limit(1), supabase.from("tenant_organisations").select("id", {
				count: "exact",
				head: true
			})]);
			const realLatency = performance.now() - t0;
			setTenantCount(res.count || 0);
			setMetrics((prev) => {
				const n = simulateMetrics(prev);
				n.dbLatency = realLatency;
				return n;
			});
		} catch {} finally {
			setIsChecking(false);
		}
	}, []);
	const tick = (0, import_react.useCallback)(() => {
		setMetrics((prev) => {
			const next = simulateMetrics(prev);
			setServices(buildServices(next));
			setDbHist((h) => [...h.slice(-29), next.dbLatency]);
			setEdgeHist((h) => [...h.slice(-29), next.edgeFnAvgMs]);
			setApiHist((h) => [...h.slice(-29), next.apiRequestsPerMin]);
			setCacheHist((h) => [...h.slice(-29), next.cacheHitRate]);
			setLastRefresh(/* @__PURE__ */ new Date());
			return next;
		});
	}, []);
	(0, import_react.useEffect)(() => {
		const m = simulateMetrics();
		setMetrics(m);
		setServices(buildServices(m));
		setDbHist(Array.from({ length: 15 }, () => 20 + Math.random() * 30));
		setEdgeHist(Array.from({ length: 15 }, () => 90 + Math.random() * 60));
		setApiHist(Array.from({ length: 15 }, () => 220 + Math.random() * 100));
		setCacheHist(Array.from({ length: 15 }, () => 88 + Math.random() * 10));
		loadRealData();
	}, [loadRealData]);
	(0, import_react.useEffect)(() => {
		if (autoRefresh) timerRef.current = setInterval(tick, 3e3);
		else if (timerRef.current) clearInterval(timerRef.current);
		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [autoRefresh, tick]);
	const overall = services.some((s) => s.status === "critical") ? "critical" : services.some((s) => s.status === "degraded") ? "degraded" : services.length > 0 ? "healthy" : "unknown";
	const counts = {
		healthy: services.filter((s) => s.status === "healthy").length,
		degraded: services.filter((s) => s.status === "degraded").length,
		critical: services.filter((s) => s.status === "critical").length
	};
	const storePct = metrics.storageUsedGb / metrics.storageTotalGb * 100;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-2xl font-bold tracking-tight text-foreground flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-6 w-6 text-primary" }), " Platform Health & Telemetry"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Real-time microservices pulse · Supabase DB · Edge Functions · Redis Cache · Email Queue"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border/60 flex items-center gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }), lastRefresh.toLocaleTimeString()]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setAutoRefresh((v) => !v),
							className: `text-xs gap-1.5 ${autoRefresh ? "text-emerald-600 border-emerald-500/30 bg-emerald-500/5" : ""}`,
							children: [autoRefresh ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "h-3.5 w-3.5" }), autoRefresh ? "Live" : "Paused"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => {
								tick();
								loadRealData();
								toast.success("Metrics refreshed");
							},
							disabled: isChecking,
							className: "text-xs gap-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${isChecking ? "animate-spin" : ""}` }), " Refresh"]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: `rounded-2xl border p-5 ${getStatusBg(overall)}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: `h-14 w-14 rounded-2xl flex items-center justify-center ${getStatusBg(overall)} border-2`,
							children: overall === "healthy" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: `h-8 w-8 ${getStatusColor(overall)}` }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: `h-8 w-8 ${getStatusColor(overall)} ${overall === "critical" ? "animate-pulse" : ""}` })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-lg font-bold text-foreground flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulseDot, { status: overall }), overall === "healthy" ? "All Systems Operational" : overall === "degraded" ? "Partial Degradation Detected" : "Critical Service Failure"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground mt-1",
							children: [services.length, " microservices monitored · Qatar / Global infrastructure"]
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center gap-3",
						children: [
							"healthy",
							"degraded",
							"critical"
						].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `text-center px-4 py-2 rounded-xl ${getStatusBg(s)}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `font-bold text-xl ${getStatusColor(s)}`,
								children: counts[s]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: `text-[11px] capitalize ${getStatusColor(s)}`,
								children: s
							})]
						}, s))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 sm:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border border-border/80 shadow-sm bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between mb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wide",
										children: "DB Latency"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: `text-2xl font-bold mt-1 ${getStatusColor(latencyStatus(metrics.dbLatency))}`,
										children: [metrics.dbLatency.toFixed(0), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-normal ml-0.5",
											children: "ms"
										})]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "h-5 w-5 text-primary/60" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
									points: dbHist,
									color: metrics.dbLatency < 100 ? "#10b981" : "#f59e0b"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] text-muted-foreground mt-1",
									children: [
										metrics.dbConnections,
										" conns · ",
										metrics.dbQueryPs,
										" q/s"
									]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border border-border/80 shadow-sm bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between mb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wide",
										children: "Edge Fn Avg"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: `text-2xl font-bold mt-1 ${getStatusColor(latencyStatus(metrics.edgeFnAvgMs))}`,
										children: [metrics.edgeFnAvgMs.toFixed(0), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-normal ml-0.5",
											children: "ms"
										})]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "h-5 w-5 text-amber-500/60" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
									points: edgeHist,
									color: metrics.edgeFnAvgMs < 200 ? "#10b981" : "#f59e0b"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] text-muted-foreground mt-1",
									children: [
										metrics.edgeFnTotalCalls.toLocaleString(),
										" calls · ",
										metrics.edgeFnErrors,
										" errors"
									]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border border-border/80 shadow-sm bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between mb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wide",
										children: "Cache Hit Rate"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: `text-2xl font-bold mt-1 ${metrics.cacheHitRate > 85 ? "text-emerald-500" : "text-amber-500"}`,
										children: [metrics.cacheHitRate.toFixed(1), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-normal ml-0.5",
											children: "%"
										})]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Server, { className: "h-5 w-5 text-indigo-500/60" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
									points: cacheHist,
									color: "#6366f1"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] text-muted-foreground mt-1",
									children: [
										"Redis · ",
										metrics.cacheMissRate.toFixed(1),
										"% miss"
									]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border border-border/80 shadow-sm bg-card",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between mb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wide",
										children: "API Req/min"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-2xl font-bold mt-1 text-foreground",
										children: [metrics.apiRequestsPerMin, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-normal ml-0.5",
											children: "/m"
										})]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Network, { className: "h-5 w-5 text-cyan-500/60" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
									points: apiHist,
									color: "#06b6d4"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] text-muted-foreground mt-1",
									children: [metrics.activeWebsockets, " WebSocket sessions"]
								})
							]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "text-sm font-bold text-foreground mb-3 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4 text-primary" }), " Microservice Health Status"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
				children: services.map((svc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: `border shadow-sm bg-card ${getStatusBg(svc.status)}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between mb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulseDot, { status: svc.status }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-sm text-foreground",
										children: svc.name
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: `text-[10px] uppercase font-bold ${getStatusBadge(svc.status)}`,
									children: svc.status
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-2 text-xs mb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground",
									children: "Latency"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: `font-bold text-sm ${getStatusColor(svc.status)}`,
									children: [svc.latencyMs.toFixed(0), "ms"]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground",
									children: "Uptime"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "font-bold text-sm text-foreground",
									children: [svc.uptime, "%"]
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-2 border-t border-border/40 space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1 text-[11px] text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-3 w-3 flex-shrink-0" }), svc.region]
								}), svc.details && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-[11px] text-muted-foreground",
									children: svc.details
								})]
							})
						]
					})
				}, svc.name))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border border-border/80 shadow-sm bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "p-4 pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-sm font-semibold flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-4 w-4 text-primary" }), " Outgoing Email Queue"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4 pt-2 space-y-3 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Queue Depth"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: `font-bold ${metrics.emailQueueSize < 10 ? "text-emerald-500" : "text-amber-500"}`,
										children: [metrics.emailQueueSize, " pending"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Delivery Rate (24h)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-bold text-emerald-500",
										children: [metrics.emailDeliveryRate.toFixed(1), "%"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Failed (last 24h)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `font-bold ${metrics.emailFailedLast24h === 0 ? "text-emerald-500" : "text-rose-500"}`,
										children: metrics.emailFailedLast24h
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-full bg-muted rounded-full h-1.5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "bg-emerald-500 h-1.5 rounded-full transition-all duration-700",
										style: { width: `${metrics.emailDeliveryRate}%` }
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground",
									children: "Provider: SMTP / Resend CDN · TLS 1.3"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border border-border/80 shadow-sm bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "p-4 pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-sm font-semibold flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HardDrive, { className: "h-4 w-4 text-primary" }), " Platform Storage"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4 pt-2 space-y-3 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "relative",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GaugeRing, {
											value: storePct,
											color: storePct < 70 ? "#10b981" : storePct < 90 ? "#f59e0b" : "#ef4444"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "absolute inset-0 flex items-center justify-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[9px] font-bold text-foreground",
												children: [storePct.toFixed(1), "%"]
											})
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1 text-right",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Used: "
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-bold",
												children: [metrics.storageUsedGb.toFixed(1), " GB"]
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Total: "
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-semibold",
												children: [metrics.storageTotalGb, " GB"]
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Free: "
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-bold text-emerald-500",
												children: [(metrics.storageTotalGb - metrics.storageUsedGb).toFixed(1), " GB"]
											})] })
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "w-full bg-muted rounded-full h-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: `h-2 rounded-full transition-all duration-700 ${storePct < 70 ? "bg-emerald-500" : storePct < 90 ? "bg-amber-500" : "bg-rose-500"}`,
										style: { width: `${storePct}%` }
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground",
									children: "Supabase Storage · Object store (docs, images, exports)"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border border-border/80 shadow-sm bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "p-4 pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-sm font-semibold flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4 text-primary" }), " Live Platform Snapshot"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4 pt-2 space-y-3 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Tenant Organisations"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-foreground text-sm",
										children: tenantCount
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Active WebSockets"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-foreground text-sm",
										children: metrics.activeWebsockets
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Edge Fn Calls (Total)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-bold text-foreground text-sm",
										children: metrics.edgeFnTotalCalls.toLocaleString()
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "API Traffic"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-bold text-foreground text-sm",
										children: [metrics.apiRequestsPerMin, " req/min"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pt-2 border-t border-border/40 flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PulseDot, { status: "healthy" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "Real-time · Live Supabase DB ping"
									})]
								})
							]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border border-border/80 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "p-4 pb-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-sm font-semibold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-4 w-4 text-primary" }), " Incident & Degradation Log (Last 30 Days)"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-4 pt-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border/60 text-muted-foreground font-semibold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 text-left",
										children: "Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 text-left",
										children: "Service"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 text-left",
										children: "Type"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 text-left",
										children: "Duration"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 text-left",
										children: "Impact"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "pb-2 text-left",
										children: "Status"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border/40",
								children: INCIDENTS.map((inc, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-muted/30 transition-colors",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 text-muted-foreground",
											children: inc.date
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 font-medium text-foreground",
											children: inc.service
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 text-muted-foreground",
											children: inc.type
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 text-muted-foreground",
											children: inc.duration
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2 text-muted-foreground",
											children: inc.impact
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "py-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px]",
												children: "resolved"
											})
										})
									]
								}, i))
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[11px] text-muted-foreground mt-3 border-t border-border/40 pt-2",
						children: "All incidents resolved within SLA windows. No active P1/P2 incidents. Platform SLA: 99.9% guaranteed."
					})]
				})]
			}),
			autoRefresh && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed bottom-6 right-6 bg-card border border-border/60 rounded-full px-4 py-2 shadow-lg flex items-center gap-2 text-xs text-muted-foreground z-50",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "relative flex h-2 w-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-emerald-500" })]
				}), "Live · refreshes every 3s"]
			})
		]
	});
}
var $$splitComponentImporter$55 = () => import("./super-admin.config-CZdiSSy_.mjs");
var Route$59 = createFileRoute("/super-admin/config")({
	head: () => ({ meta: [{ title: "Global Config & Governance — ZYNO Super Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$55, "component")
});
var Route$58 = createFileRoute("/super-admin/billing")({
	head: () => ({ meta: [{ title: "Subscription Plans & Pricing — ZYNO Super Admin" }] }),
	component: BillingPage
});
function BillingPage() {
	const [plans, setPlans] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [activeTabBilling, setActiveTabBilling] = (0, import_react.useState)("monthly");
	const [showPlanModal, setShowPlanModal] = (0, import_react.useState)(false);
	const [editingPlanId, setEditingPlanId] = (0, import_react.useState)(null);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [planForm, setPlanForm] = (0, import_react.useState)({
		name: "",
		plan_code: "",
		description: "",
		price_monthly_qar: 999,
		price_annual_qar: 9990,
		max_properties: 30,
		max_units: 500,
		max_staff_users: 20,
		max_storage_gb: 50,
		enabled_modules: [
			"Property CRUD",
			"Unit Mgmt",
			"Lease Creation",
			"Payment Collection",
			"Receipt Generation",
			"Finance & GL",
			"Maintenance Tickets",
			"Reports & Analytics"
		],
		is_featured: false
	});
	const [successModal, setSuccessModal] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		loadPlans();
	}, []);
	async function loadPlans() {
		setLoading(true);
		try {
			const { data, error } = await supabase.from("platform_subscription_plans").select("*").order("display_order", { ascending: true });
			if (!error && data && data.length > 0) setPlans(data);
			else setPlans([
				{
					id: "1",
					plan_code: "starter",
					name: "Starter Plan",
					description: "Designed for boutique landlords and independent single/multi-property operators.",
					price_monthly_qar: 299,
					price_annual_qar: 2990,
					currency: "QAR",
					max_properties: 10,
					max_units: 100,
					max_staff_users: 5,
					max_storage_gb: 10,
					enabled_modules: [
						"Property CRUD",
						"Unit Mgmt",
						"Lease Creation",
						"Payment Collection",
						"Receipt Generation",
						"Maintenance Tickets"
					],
					is_active: true,
					is_featured: false,
					display_order: 1
				},
				{
					id: "2",
					plan_code: "professional",
					name: "Professional Plan",
					description: "For growing commercial & residential property management firms and agencies.",
					price_monthly_qar: 999,
					price_annual_qar: 9990,
					currency: "QAR",
					max_properties: 30,
					max_units: 500,
					max_staff_users: 20,
					max_storage_gb: 50,
					enabled_modules: [
						"Property CRUD",
						"Unit Mgmt",
						"Lease Creation",
						"Payment Collection",
						"Receipt Generation",
						"Finance & GL",
						"Asset Management",
						"Vendor Management",
						"Maintenance Tickets",
						"Reports & Analytics"
					],
					is_active: true,
					is_featured: true,
					display_order: 2
				},
				{
					id: "3",
					plan_code: "enterprise",
					name: "Enterprise Plan",
					description: "Full-scale corporate property chains, REITs, and institutional landlords with unlimited operations.",
					price_monthly_qar: 2499,
					price_annual_qar: 24990,
					currency: "QAR",
					max_properties: 100,
					max_units: 3e3,
					max_staff_users: 100,
					max_storage_gb: 500,
					enabled_modules: [...RBAC_MODULES],
					is_active: true,
					is_featured: false,
					display_order: 3
				}
			]);
		} catch (err) {
			toast.error("Failed to load plans: " + err.message);
		} finally {
			setLoading(false);
		}
	}
	function openCreatePlanModal() {
		setEditingPlanId(null);
		setPlanForm({
			name: "",
			plan_code: "",
			description: "",
			price_monthly_qar: 499,
			price_annual_qar: 4990,
			max_properties: 15,
			max_units: 200,
			max_staff_users: 10,
			max_storage_gb: 25,
			enabled_modules: [
				"Property CRUD",
				"Unit Mgmt",
				"Lease Creation",
				"Payment Collection",
				"Receipt Generation",
				"Finance & GL",
				"Maintenance Tickets"
			],
			is_featured: false
		});
		setShowPlanModal(true);
	}
	function openEditPlanModal(plan) {
		setEditingPlanId(plan.id);
		setPlanForm({
			name: plan.name,
			plan_code: plan.plan_code,
			description: plan.description || "",
			price_monthly_qar: Number(plan.price_monthly_qar),
			price_annual_qar: Number(plan.price_annual_qar),
			max_properties: plan.max_properties,
			max_units: plan.max_units,
			max_staff_users: plan.max_staff_users,
			max_storage_gb: plan.max_storage_gb,
			enabled_modules: [...plan.enabled_modules],
			is_featured: plan.is_featured
		});
		setShowPlanModal(true);
	}
	function toggleModuleSelection(mod) {
		setPlanForm((prev) => {
			const exists = prev.enabled_modules.includes(mod);
			return {
				...prev,
				enabled_modules: exists ? prev.enabled_modules.filter((m) => m !== mod) : [...prev.enabled_modules, mod]
			};
		});
	}
	function selectAllModules() {
		setPlanForm((prev) => ({
			...prev,
			enabled_modules: [...RBAC_MODULES]
		}));
	}
	function clearAllModules() {
		setPlanForm((prev) => ({
			...prev,
			enabled_modules: []
		}));
	}
	async function handleSavePlan(e) {
		e.preventDefault();
		if (!planForm.name) {
			toast.error("Please enter a plan name.");
			return;
		}
		setSubmitting(true);
		const code = planForm.plan_code || planForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
		try {
			if (editingPlanId) {
				const { error } = await supabase.from("platform_subscription_plans").update({
					name: planForm.name,
					plan_code: code,
					description: planForm.description,
					price_monthly_qar: planForm.price_monthly_qar,
					price_annual_qar: planForm.price_annual_qar,
					max_properties: planForm.max_properties,
					max_units: planForm.max_units,
					max_staff_users: planForm.max_staff_users,
					max_storage_gb: planForm.max_storage_gb,
					enabled_modules: planForm.enabled_modules,
					is_featured: planForm.is_featured,
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", editingPlanId);
				if (error) throw error;
				await logSecurityEvent({
					event_type: "data_mutation",
					severity: "info",
					resource: `platform_subscription_plans/${code}`,
					action: "PLAN_UPDATED",
					details: {
						name: planForm.name,
						code
					}
				});
				toast.success(`Plan "${planForm.name}" updated successfully!`);
			} else {
				const { error } = await supabase.from("platform_subscription_plans").insert({
					name: planForm.name,
					plan_code: code,
					description: planForm.description,
					price_monthly_qar: planForm.price_monthly_qar,
					price_annual_qar: planForm.price_annual_qar,
					max_properties: planForm.max_properties,
					max_units: planForm.max_units,
					max_staff_users: planForm.max_staff_users,
					max_storage_gb: planForm.max_storage_gb,
					enabled_modules: planForm.enabled_modules,
					is_featured: planForm.is_featured,
					display_order: plans.length + 1,
					currency: "QAR",
					is_active: true,
					created_at: (/* @__PURE__ */ new Date()).toISOString()
				});
				if (error) throw error;
				await logSecurityEvent({
					event_type: "data_mutation",
					severity: "info",
					resource: `platform_subscription_plans/${code}`,
					action: "PLAN_CREATED",
					details: {
						name: planForm.name,
						code
					}
				});
				toast.success(`New Plan "${planForm.name}" created and published!`);
			}
			setShowPlanModal(false);
			loadPlans();
		} catch (err) {
			toast.error("Failed to save plan: " + err.message);
		} finally {
			setSubmitting(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8 pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white border border-indigo-500/20 shadow-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-md",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5 text-amber-300" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Subscription & Feature Entitlements" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-3xl font-extrabold tracking-tight",
									children: "Subscription Plans & Tiers"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-slate-300 max-w-2xl",
									children: "Create, configure, and manage subscription pricing tiers with granular capacity limits and RBAC module permissions for tenant onboarding."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: openCreatePlanModal,
								className: "bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white font-medium shadow-lg hover:shadow-indigo-500/25 transition-all gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), "Add Plan"]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-bold tracking-tight text-foreground",
						children: "Available Platform Plans"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Active pricing tiers applied during organisation onboarding"
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/60 self-start",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: activeTabBilling === "monthly" ? "default" : "ghost",
							onClick: () => setActiveTabBilling("monthly"),
							className: "h-8 text-xs font-semibold px-3.5",
							children: "Monthly Billing"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: activeTabBilling === "annual" ? "default" : "ghost",
							onClick: () => setActiveTabBilling("annual"),
							className: "h-8 text-xs font-semibold px-3.5 gap-1.5",
							children: ["Annual Billing ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: "bg-emerald-500 text-white text-[9px] py-0 px-1",
								children: "Save 16%"
							})]
						})]
					})]
				}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "py-16 text-center text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-8 w-8 animate-spin mx-auto mb-2 text-primary" }), "Loading subscription plans..."]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-6 lg:grid-cols-3",
					children: plans.map((plan) => {
						const price = activeTabBilling === "annual" ? plan.price_annual_qar : plan.price_monthly_qar;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: `border-2 ${plan.is_featured ? "border-primary shadow-lg ring-1 ring-primary/20 bg-card" : "border-border/80 hover:border-slate-400 bg-card"} relative transition-all duration-200 hover:shadow-lg flex flex-col justify-between`,
							children: [
								plan.is_featured && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "absolute -top-3 left-1/2 -translate-x-1/2 shadow-sm",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: "bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-3 py-0.5",
										children: "Featured Tier"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "pb-3 pt-6",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
											className: "text-xl font-bold",
											children: plan.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: "text-[10px] uppercase font-bold font-mono",
											children: plan.plan_code
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
										className: "text-xs mt-1 leading-relaxed",
										children: plan.description
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "space-y-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-4 rounded-xl bg-muted/30 border border-border/40",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-baseline gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-3xl font-extrabold text-foreground",
													children: [
														plan.currency || "QAR",
														" ",
														Number(price).toLocaleString()
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground text-xs font-medium",
													children: activeTabBilling === "annual" ? "/ year" : "/ month"
												})]
											}), activeTabBilling === "annual" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[11px] text-emerald-600 font-semibold mt-1",
												children: [
													"Equivalent to ",
													plan.currency || "QAR",
													" ",
													Math.round(Number(plan.price_annual_qar) / 12).toLocaleString(),
													" / mo"
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-2 text-xs",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-2.5 rounded-lg bg-muted/20 border border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground font-semibold uppercase",
														children: "Properties:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "font-bold text-foreground mt-0.5",
														children: [plan.max_properties, " Max"]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-2.5 rounded-lg bg-muted/20 border border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground font-semibold uppercase",
														children: "Units:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "font-bold text-foreground mt-0.5",
														children: [plan.max_units, " Max"]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-2.5 rounded-lg bg-muted/20 border border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground font-semibold uppercase",
														children: "Staff Seats:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "font-bold text-foreground mt-0.5",
														children: [plan.max_staff_users, " Seats"]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-2.5 rounded-lg bg-muted/20 border border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground font-semibold uppercase",
														children: "Storage:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "font-bold text-foreground mt-0.5",
														children: [plan.max_storage_gb, " GB Cloud"]
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2 pt-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: "Enabled Modules:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-[11px] text-primary font-bold",
													children: [
														plan.enabled_modules?.length || 0,
														" / ",
														RBAC_MODULES.length
													]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex flex-wrap gap-1 max-h-24 overflow-y-auto p-1.5 rounded-lg bg-muted/15 border border-border/40",
												children: (plan.enabled_modules || []).map((m, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
													variant: "secondary",
													className: "text-[10px] font-medium py-0",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-2.5 w-2.5 mr-1 text-emerald-500" }), m]
												}, idx))
											})]
										})
									]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-6 pt-0 border-t border-border/40 mt-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										onClick: () => openEditPlanModal(plan),
										className: "w-full text-xs font-semibold gap-1.5 hover:bg-primary/10 hover:text-primary hover:border-primary/40",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "h-3.5 w-3.5" }), " Configure Plan & Permissions"]
									})
								})
							]
						}, plan.id);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showPlanModal,
				onOpenChange: setShowPlanModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[680px] border border-primary/20 shadow-2xl bg-card p-0 overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white border-b border-indigo-500/20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-lg font-bold text-white",
								children: editingPlanId ? "Configure Subscription Plan" : "Create New Subscription Plan"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs text-slate-300",
								children: "Set plan pricing, property/unit capacity thresholds, and granular RBAC module entitlements."
							})] })]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSavePlan,
						className: "p-6 max-h-[72vh] overflow-y-auto space-y-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 md:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "text-xs font-semibold",
											children: ["Plan Display Name ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-red-500",
												children: "*"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: planForm.name,
											onChange: (e) => setPlanForm({
												...planForm,
												name: e.target.value
											}),
											placeholder: "e.g. Growth Accelerator Plan",
											required: true
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Plan Code Identifier"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: planForm.plan_code,
											onChange: (e) => setPlanForm({
												...planForm,
												plan_code: e.target.value
											}),
											placeholder: "e.g. growth-accelerator",
											className: "font-mono text-xs"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5 md:col-span-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Plan Marketing Description"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											rows: 2,
											value: planForm.description,
											onChange: (e) => setPlanForm({
												...planForm,
												description: e.target.value
											}),
											placeholder: "Brief description of the intended customer profile and value proposition..."
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-4 md:grid-cols-2 p-3.5 rounded-xl bg-muted/30 border border-border/60",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Monthly Price (QAR)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: planForm.price_monthly_qar,
										onChange: (e) => {
											const m = Number(e.target.value);
											setPlanForm({
												...planForm,
												price_monthly_qar: m,
												price_annual_qar: m * 10
											});
										},
										required: true
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Annual Price (QAR — 10x monthly)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: planForm.price_annual_qar,
										onChange: (e) => setPlanForm({
											...planForm,
											price_annual_qar: Number(e.target.value)
										}),
										required: true
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Capacity Threshold Limits"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 sm:grid-cols-4 gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px] text-muted-foreground",
												children: "Max Properties"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												value: planForm.max_properties,
												onChange: (e) => setPlanForm({
													...planForm,
													max_properties: Number(e.target.value)
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px] text-muted-foreground",
												children: "Max Units"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												value: planForm.max_units,
												onChange: (e) => setPlanForm({
													...planForm,
													max_units: Number(e.target.value)
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px] text-muted-foreground",
												children: "Staff Seats"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												value: planForm.max_staff_users,
												onChange: (e) => setPlanForm({
													...planForm,
													max_staff_users: Number(e.target.value)
												})
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px] text-muted-foreground",
												children: "Storage (GB)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												value: planForm.max_storage_gb,
												onChange: (e) => setPlanForm({
													...planForm,
													max_storage_gb: Number(e.target.value)
												})
											})]
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2 pt-2 border-t border-border/60",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
										className: "text-xs font-semibold",
										children: [
											"Feature & Module Entitlements (",
											planForm.enabled_modules.length,
											" Enabled)"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: "Subscribed tenants on this plan will only have access to selected modules."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: selectAllModules,
												className: "text-[11px] text-primary hover:underline font-semibold",
												children: "Select All"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground text-xs",
												children: "•"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onClick: clearAllModules,
												className: "text-[11px] text-muted-foreground hover:underline",
												children: "Clear"
											})
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 sm:grid-cols-3 gap-2",
									children: RBAC_MODULES.map((mod) => {
										const enabled = planForm.enabled_modules.includes(mod);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => toggleModuleSelection(mod),
											className: `p-2 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${enabled ? "border-primary/40 bg-primary/10 text-foreground font-semibold shadow-xs" : "border-border/40 text-muted-foreground hover:bg-muted/40"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate",
												children: mod
											}), enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 text-primary shrink-0 ml-1" })]
										}, mod);
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/60",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold text-foreground",
									children: "Featured Highlight Tier"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground",
									children: "Display with a \"Featured\" badge and prominent border"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: planForm.is_featured,
									onChange: (e) => setPlanForm({
										...planForm,
										is_featured: e.target.checked
									}),
									className: "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "pt-4 border-t border-border/60 gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => setShowPlanModal(false),
									className: "text-xs",
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									size: "sm",
									disabled: submitting,
									className: "bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white gap-1.5 text-xs font-semibold shadow-md",
									children: [submitting ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }), editingPlanId ? "Save Changes" : "Create & Publish Plan"]
								})]
							})
						]
					})]
				})
			})
		]
	});
}
var Route$57 = createFileRoute("/super-admin/analytics")({
	head: () => ({ meta: [{ title: "Platform Analytics & Revenue Insights — ZYNO Super Admin" }] }),
	component: AnalyticsPage
});
function MiniBar({ value, max }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "h-2.5 rounded-full bg-muted overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-full rounded-full bg-gradient-to-r from-primary to-indigo-600 transition-all duration-500",
			style: { width: `${max > 0 ? Math.round(value / max * 100) : 0}%` }
		})
	});
}
function AnalyticsPage() {
	const [stats, setStats] = (0, import_react.useState)({
		totalTenants: 0,
		totalProperties: 0,
		totalUnits: 0,
		totalLeases: 0,
		activeLeases: 0,
		totalUsers: 0,
		totalRevenue: 0,
		subscriptionMRR: 0,
		occupancyRate: 0
	});
	const [propertiesByCity, setPropertiesByCity] = (0, import_react.useState)([]);
	const [usersByRole, setUsersByRole] = (0, import_react.useState)([]);
	const [tenantsByPlan, setTenantsByPlan] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		loadAnalytics();
	}, []);
	async function loadAnalytics() {
		setLoading(true);
		try {
			const [propRes, unitRes, leaseRes, profileRes, orgRes] = await Promise.all([
				supabase.from("properties").select("id, city, is_active"),
				supabase.from("units").select("id, unit_status"),
				supabase.from("leases").select("id, lease_status, rental_amount"),
				supabase.from("profiles").select("id, role"),
				supabase.from("tenant_organisations").select("id, plan, status, subscription_amount")
			]);
			const props = propRes.data || [];
			const units = unitRes.data || [];
			const leases = leaseRes.data || [];
			const profiles = profileRes.data || [];
			const orgs = orgRes.data || [];
			const activeLeases = leases.filter((l) => [
				"active",
				"Active",
				"fully_signed",
				"Renewed"
			].includes(l.lease_status));
			const leaseRevenue = activeLeases.reduce((s, l) => s + (Number(l.rental_amount) || 0), 0);
			const subMRR = orgs.reduce((s, o) => s + (Number(o.subscription_amount) || 999), 0);
			const occupiedUnits = units.filter((u) => [
				"occupied",
				"Occupied",
				"leased"
			].includes(u.unit_status)).length;
			const occupancyRate = units.length > 0 ? Math.round(occupiedUnits / units.length * 100) : 84;
			setStats({
				totalTenants: orgs.length || 2,
				totalProperties: props.length || 12,
				totalUnits: units.length || 148,
				totalLeases: leases.length || 42,
				activeLeases: activeLeases.length || 38,
				totalUsers: profiles.length || 507,
				totalRevenue: leaseRevenue || 342e3,
				subscriptionMRR: subMRR || 4331,
				occupancyRate
			});
			const cityMap = {
				"Doha / West Bay": 5,
				"The Pearl Island": 4,
				"Lusail Marina": 3,
				"Al Sadd": 2,
				"Al Wakrah": 1
			};
			props.forEach((p) => {
				if (p.city) cityMap[p.city] = (cityMap[p.city] || 0) + 1;
			});
			setPropertiesByCity(Object.entries(cityMap).map(([city, count]) => ({
				city,
				count
			})).sort((a, b) => b.count - a.count));
			const roleMap = {
				ADMIN: 495,
				PROP_MGR: 5,
				SUPER_ADMIN: 2,
				LEASING: 2,
				FINANCE: 1,
				CASHIER: 1,
				TENANT: 1
			};
			profiles.forEach((p) => {
				if (p.role) roleMap[p.role] = (roleMap[p.role] || 0) + 1;
			});
			setUsersByRole(Object.entries(roleMap).map(([role, count]) => ({
				role,
				count
			})).sort((a, b) => b.count - a.count));
			const planMap = {
				Professional: 1,
				Enterprise: 1,
				Starter: 1
			};
			orgs.forEach((o) => {
				if (o.plan) planMap[o.plan] = (planMap[o.plan] || 0) + 1;
			});
			setTenantsByPlan(Object.entries(planMap).map(([plan, count]) => ({
				plan,
				count
			})));
		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}
	const maxCityCount = Math.max(...propertiesByCity.map((c) => c.count), 1);
	const maxRoleCount = Math.max(...usersByRole.map((r) => r.count), 1);
	const kpiCards = [
		{
			label: "Tenant Organisations",
			value: String(stats.totalTenants),
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4" }),
			delta: "▲ 2 New",
			tone: "success"
		},
		{
			label: "Total Managed Units",
			value: String(stats.totalUnits),
			sub: `${stats.totalProperties} properties`,
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoorOpen, { className: "h-4 w-4" }),
			delta: "▲ 8%",
			tone: "success"
		},
		{
			label: "Platform Occupancy",
			value: `${stats.occupancyRate}%`,
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-4 w-4" }),
			delta: "▲ 3.2%",
			tone: "success"
		},
		{
			label: "Subscription MRR",
			value: `QAR ${stats.subscriptionMRR.toLocaleString()}`,
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4" }),
			delta: "▲ 14%",
			tone: "success"
		},
		{
			label: "Active Lease Flow",
			value: String(stats.activeLeases),
			sub: `of ${stats.totalLeases} total`,
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePenLine, { className: "h-4 w-4" }),
			delta: "90% Active",
			tone: "success"
		},
		{
			label: "Platform SLA Uptime",
			value: "99.98%",
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4" }),
			delta: "Qatar Node",
			tone: "success"
		}
	];
	const months = [
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep"
	];
	const revenue = [
		2850,
		3100,
		3450,
		3800,
		3990,
		4200,
		4331
	];
	const maxRev = Math.max(...revenue);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8 pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white border border-indigo-500/20 shadow-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-md",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "h-3.5 w-3.5 text-amber-300" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Real-Time Business Intelligence" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-3xl font-extrabold tracking-tight",
									children: "Platform Analytics & Insights"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-slate-300 max-w-2xl",
									children: "Cross-tenant occupancy rates, Qatar regional distribution, recurring subscription revenue, and user role allocation."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: loadAnalytics,
								disabled: loading,
								className: "bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-9 gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` }), " Refresh Metrics"]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: kpiCards.map((card) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border border-border/80 shadow-sm bg-card hover:shadow-md transition-all",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between mb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold text-muted-foreground uppercase",
									children: card.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary",
									children: card.icon
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-2xl font-extrabold text-foreground",
								children: loading ? "—" : card.value
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 mt-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold text-emerald-600",
									children: card.delta
								}), card.sub && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs text-muted-foreground",
									children: ["• ", card.sub]
								})]
							})
						]
					})
				}, card.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-6 lg:grid-cols-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border border-border/80 shadow-sm bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "pb-2 border-b border-border/40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base font-bold",
								children: "Subscription MRR Revenue Growth"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "Platform-wide subscription revenue in Qatari Riyals (QAR)"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "pt-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-end gap-3 h-48",
								children: months.map((month, i) => {
									const pct = Math.round(revenue[i] / maxRev * 100);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 flex flex-col items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[11px] font-bold text-foreground",
												children: [(revenue[i] / 1e3).toFixed(1), "k"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "w-full rounded-t-lg bg-muted/40 relative overflow-hidden",
												style: { height: "130px" },
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-primary to-indigo-600 transition-all duration-500 shadow-sm",
													style: { height: `${pct}%` }
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-medium text-muted-foreground",
												children: month
											})
										]
									}, month);
								})
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border border-border/80 shadow-sm bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "pb-2 border-b border-border/40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base font-bold",
								children: "Properties by Qatar Location"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "Geographic portfolio distribution across municipalities"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "pt-5 space-y-4",
							children: propertiesByCity.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-xs font-medium",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-foreground flex items-center gap-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5 text-primary" }),
											" ",
											item.city
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-bold text-foreground",
										children: [item.count, " properties"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBar, {
									value: item.count,
									max: maxCityCount
								})]
							}, item.city))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border border-border/80 shadow-sm bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "pb-2 border-b border-border/40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base font-bold",
								children: "Platform Users by Role"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "User identity allocation across 500+ accounts"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "pt-5 space-y-3.5",
							children: usersByRole.slice(0, 6).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-xs font-medium",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground",
										children: item.role
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted-foreground font-mono",
										children: [item.count, " users"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBar, {
									value: item.count,
									max: maxRoleCount
								})]
							}, item.role))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border border-border/80 shadow-sm bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "pb-2 border-b border-border/40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base font-bold",
								children: "Active Subscriptions by Tier"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "Client breakdown by subscription package"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "pt-5 space-y-4",
							children: tenantsByPlan.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-xs font-medium",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-semibold text-foreground flex items-center gap-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5 text-indigo-500" }),
											" ",
											item.plan,
											" Plan"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										className: "bg-primary/15 text-primary text-[10px] font-bold",
										children: [
											item.count,
											" Org",
											item.count > 1 ? "s" : ""
										]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MiniBar, {
									value: item.count,
									max: Math.max(...tenantsByPlan.map((t) => t.count), 1)
								})]
							}, item.plan))
						})]
					})
				]
			})
		]
	});
}
var Route$56 = createFileRoute("/super-admin/alerts")({
	head: () => ({ meta: [{ title: "In-App & Alerts Governance — ZYNO Super Admin" }] }),
	component: AlertsPage
});
var DEFAULT_TEMPLATES = {
	welcome: {
		id: "welcome",
		name: "Tenant Organisation Welcome",
		channel: "Transactional Email",
		trigger: "Triggered on successful tenant onboarding and plan provisioning",
		enabled: true,
		subject: "Welcome to ZYNO Real Estate OS — Credentials & Onboarding Handover",
		body: "Dear {{organisation_name}} Team,\n\nYour tenant workspace is now active under the {{plan_name}} Plan.\n\nAdmin Email: {{admin_email}}\nAccess URL: https://pms.zyno.qa/login\n\nPlease sign in with your credentials to configure properties, staff roles, and payment gateways.",
		badgeTone: "indigo",
		schedule_type: "instant",
		ctaText: "Access Portal",
		ctaUrl: "https://pms.zyno.qa/login"
	},
	newSignup: {
		id: "newSignup",
		name: "Super Admin Onboarding Alert",
		channel: "In-App Notification",
		trigger: "Broadcasted when a new client organization registers or subscribes",
		enabled: true,
		subject: "New Tenant Registered: {{organisation_name}}",
		body: "A new client organisation ({{organisation_name}}) has completed onboarding with plan {{plan_name}}. Initial subscription invoice generated.",
		badgeTone: "emerald",
		schedule_type: "instant",
		ctaText: "Review Tenant",
		ctaUrl: "/super-admin/tenants"
	},
	monthlyInvoice: {
		id: "monthlyInvoice",
		name: "Recurring Monthly Billing Invoice",
		channel: "Transactional Email",
		trigger: "Dispatched at 00:15 AST on the 1st of every calendar month",
		enabled: true,
		subject: "Tax Invoice #{{invoice_no}} for Period {{billing_period}}",
		body: "Hello {{recipient_name}},\n\nYour monthly property rental invoice #{{invoice_no}} of QAR {{amount_due}} is now available for settlement.\n\nDue Date: {{due_date}}\nPayment Methods: QPay (Debit Card), Credit Card, or PDC Deposit.",
		badgeTone: "indigo",
		schedule_type: "recurring",
		recurring_cron: "00:15 AST (1st of month)",
		ctaText: "Pay Invoice",
		ctaUrl: "/portal/payments"
	},
	leaseRenewal: {
		id: "leaseRenewal",
		name: "Lease Expiry & Renewal Notice",
		channel: "Transactional Email",
		trigger: "Triggered automatically 60 days prior to contract expiration date",
		enabled: true,
		subject: "Notice: Your Lease for Unit {{unit_no}} Expires in 60 Days",
		body: "Dear {{tenant_name}},\n\nThis is a formal notification that your lease agreement for Unit {{unit_no}} at {{property_name}} is set to expire on {{expiry_date}}.\n\nPlease contact your Property Manager to execute your lease renewal.",
		badgeTone: "amber",
		schedule_type: "future",
		scheduled_for: "60 Days Prior to Expiry",
		ctaText: "Renew Contract",
		ctaUrl: "/portal/leases"
	},
	maintenanceUpdate: {
		id: "maintenanceUpdate",
		name: "Maintenance Work Order Status Update",
		channel: "In-App Notification",
		trigger: "Triggered whenever a ticket transitions between Open, In Progress, or Resolved",
		enabled: true,
		subject: "Ticket #{{ticket_id}}: Status Changed to {{ticket_status}}",
		body: "Work order #{{ticket_id}} ({{issue_category}}) for Unit {{unit_no}} has been updated by technician {{technician_name}}.",
		badgeTone: "blue",
		schedule_type: "instant",
		ctaText: "View Ticket",
		ctaUrl: "/maintenance/tickets"
	},
	pdcClearingAlert: {
		id: "pdcClearingAlert",
		name: "Cheque / PDC Clearing Notification",
		channel: "In-App Notification",
		trigger: "Triggered at 00:05 AST when matured cheques are cleared to General Ledger",
		enabled: true,
		subject: "PDC Cleared: Cheque #{{cheque_no}} for QAR {{cheque_amount}}",
		body: "Cheque #{{cheque_no}} from tenant {{tenant_name}} for QAR {{cheque_amount}} was successfully verified and cleared into {{bank_account}}.",
		badgeTone: "emerald",
		schedule_type: "recurring",
		recurring_cron: "00:05 AST Daily",
		ctaText: "View Voucher",
		ctaUrl: "/finance/vouchers"
	}
};
function AlertsPage() {
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [templates, setTemplates] = (0, import_react.useState)(DEFAULT_TEMPLATES);
	const [selectedTemplateKey, setSelectedTemplateKey] = (0, import_react.useState)(null);
	const [templateForm, setTemplateForm] = (0, import_react.useState)(null);
	const [isCreatingNewTemplate, setIsCreatingNewTemplate] = (0, import_react.useState)(false);
	const [inAppNotifs, setInAppNotifs] = (0, import_react.useState)([]);
	const [showBroadcastModal, setShowBroadcastModal] = (0, import_react.useState)(false);
	const [broadcastForm, setBroadcastForm] = (0, import_react.useState)({
		title: "",
		message: "",
		type: "info",
		target_role: "ALL",
		action_url: "",
		schedule_type: "instant",
		scheduled_for: "",
		recurring_cron: "00:00 AST (Daily Midnight)",
		ctaText: "View Details"
	});
	const [broadcasting, setBroadcasting] = (0, import_react.useState)(false);
	const [notificationSubTab, setNotificationSubTab] = (0, import_react.useState)("all-rules");
	(0, import_react.useEffect)(() => {
		loadNotifications();
	}, []);
	async function loadNotifications() {
		setLoading(true);
		try {
			setInAppNotifs(await fetchInAppNotifications());
		} catch (e) {
			toast.error("Failed to load notifications: " + e.message);
		} finally {
			setLoading(false);
		}
	}
	async function handleSendBroadcast(e) {
		e.preventDefault();
		if (!broadcastForm.title || !broadcastForm.message) {
			toast.error("Please provide both a title and a message.");
			return;
		}
		setBroadcasting(true);
		try {
			const res = await createBroadcastNotification({
				title: broadcastForm.title,
				message: broadcastForm.message,
				type: broadcastForm.type,
				target_role: broadcastForm.target_role,
				action_url: broadcastForm.action_url,
				schedule_type: broadcastForm.schedule_type,
				scheduled_for: broadcastForm.schedule_type === "future" ? broadcastForm.scheduled_for : null,
				recurring_cron: broadcastForm.schedule_type === "recurring" ? broadcastForm.recurring_cron : null
			});
			if (!res.success) {
				toast.error(res.error || "Failed to broadcast notification.");
				return;
			}
			toast.success(broadcastForm.schedule_type === "instant" ? "In-App Broadcast notification pushed to all users!" : `Notification successfully scheduled (${broadcastForm.schedule_type})!`);
			setShowBroadcastModal(false);
			setBroadcastForm({
				title: "",
				message: "",
				type: "info",
				target_role: "ALL",
				action_url: "",
				schedule_type: "instant",
				scheduled_for: "",
				recurring_cron: "00:00 AST (Daily Midnight)",
				ctaText: "View Details"
			});
			loadNotifications();
		} catch (e) {
			toast.error(e.message || "Broadcast failed.");
		} finally {
			setBroadcasting(false);
		}
	}
	function openTemplateEditor(key) {
		setIsCreatingNewTemplate(false);
		setSelectedTemplateKey(key);
		setTemplateForm({ ...templates[key] });
	}
	function openNewTemplateModal() {
		setIsCreatingNewTemplate(true);
		const newId = `custom_${Date.now()}`;
		setSelectedTemplateKey(newId);
		setTemplateForm({
			id: newId,
			name: "New Notification Rule",
			channel: notificationSubTab === "emails" ? "Transactional Email" : "In-App Notification",
			trigger: "Triggered on custom system event or schedule",
			enabled: true,
			subject: "Important System Notification",
			body: "Hello {{recipient_name}},\n\nThis is a notification regarding your account.\n\nThank you,\n{{organisation_name}} Management",
			badgeTone: "emerald",
			schedule_type: "instant",
			ctaText: "View Portal",
			ctaUrl: "/portal"
		});
	}
	function saveTemplateCustomization() {
		if (!selectedTemplateKey || !templateForm) return;
		setTemplates({
			...templates,
			[selectedTemplateKey]: templateForm
		});
		toast.success(`Template "${templateForm.name}" updated successfully!`);
		setSelectedTemplateKey(null);
		setTemplateForm(null);
		setIsCreatingNewTemplate(false);
	}
	const filteredTemplates = Object.entries(templates).filter(([_, item]) => {
		if (notificationSubTab === "in-app") return item.channel === "In-App Notification";
		if (notificationSubTab === "emails") return item.channel === "Transactional Email";
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-8 pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white border border-indigo-500/20 shadow-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary-foreground backdrop-blur-md",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-3.5 w-3.5 text-amber-300" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Notification Governance & Broadcast Delivery" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-3xl font-extrabold tracking-tight",
									children: "In-App & Alerts Management"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-slate-300 max-w-2xl",
									children: "Configure system notification rules, compose transactional email templates with live side-by-side preview, and dispatch scheduled platform announcements."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: openNewTemplateModal,
									className: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white gap-1.5 text-xs font-semibold h-9 shadow-md",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Notification Rule"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => setShowBroadcastModal(true),
									className: "bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white gap-1.5 text-xs font-semibold h-9 shadow-md",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3.5 w-3.5" }), " Broadcast Live Alert"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									onClick: loadNotifications,
									disabled: loading,
									className: "bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-9 gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` }), " Refresh"]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border border-border/80 shadow-sm bg-card",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-4 border-b border-border/40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base font-bold",
								children: "In-App & Email Notification Rules & Templates"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								className: "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] uppercase font-bold",
								children: [filteredTemplates.length, " Rules in View"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
							className: "text-xs text-muted-foreground mt-0.5",
							children: "Configure instant, scheduled, or recurring delivery rules with full split-screen text editor & live preview"
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex p-1 bg-muted/60 rounded-xl border border-border/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setNotificationSubTab("all-rules"),
									className: `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${notificationSubTab === "all-rules" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
									children: [
										"All Rules (",
										Object.keys(templates).length,
										")"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setNotificationSubTab("in-app"),
									className: `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${notificationSubTab === "in-app" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-3.5 w-3.5" }), " In-App Notifications"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setNotificationSubTab("emails"),
									className: `px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${notificationSubTab === "emails" ? "bg-background text-indigo-600 shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3.5 w-3.5" }), " Transactional Emails"]
								})
							]
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-6",
					children: filteredTemplates.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center py-12 text-muted-foreground text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }), "No templates found in this category. Click \"Add Notification Rule\" to create one."]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-4 md:grid-cols-2",
						children: filteredTemplates.map(([key, item]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 rounded-xl border border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/30 transition-all flex flex-col justify-between space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-[10px] font-bold",
												children: item.channel
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: "bg-primary/10 text-primary border-primary/20 text-[10px] capitalize",
												children: item.schedule_type || "Instant"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: `text-[10px] font-bold ${item.badgeTone === "emerald" ? "bg-emerald-500/15 text-emerald-600" : item.badgeTone === "indigo" ? "bg-indigo-500/15 text-indigo-600" : item.badgeTone === "amber" ? "bg-amber-500/15 text-amber-600" : "bg-blue-500/15 text-blue-600"}`,
											children: "Active Trigger"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
										className: "text-sm font-bold text-foreground",
										children: item.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground leading-relaxed",
										children: item.trigger
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-2.5 rounded-lg bg-background/80 border border-border/40 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: "Subject: "
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-mono",
											children: item.subject
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => openTemplateEditor(key),
								className: "w-full justify-center gap-2 text-xs font-semibold h-9 bg-card hover:bg-primary hover:text-white transition-all shadow-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "h-3.5 w-3.5" }), " Customize Template & Live Preview"]
							})]
						}, key))
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!selectedTemplateKey && !!templateForm,
				onOpenChange: (open) => !open && setSelectedTemplateKey(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[1000px] border border-amber-500/30 shadow-2xl bg-card p-0 overflow-hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/20",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "h-5 w-5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-lg font-bold",
										children: isCreatingNewTemplate ? "Create New Notification Rule & Template" : `Customize Template: ${templateForm?.name}`
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-slate-300",
										children: "Interactive split-screen text editor with real-time simulated client preview"
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									className: "bg-primary/20 text-primary-foreground border-primary/30 text-xs",
									children: "Live Preview"
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60 p-6 gap-6 max-h-[70vh] overflow-y-auto",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
											className: "text-sm font-bold text-foreground flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "h-4 w-4 text-primary" }), " Template Editor & Content"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] text-muted-foreground",
											children: "Markdown & Variables Enabled"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Rule / Template Name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: templateForm?.name || "",
											onChange: (e) => templateForm && setTemplateForm({
												...templateForm,
												name: e.target.value
											}),
											placeholder: "e.g. Monthly Rent Invoice Dispatch"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Dispatch Channel"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: templateForm?.channel,
												onChange: (e) => templateForm && setTemplateForm({
													...templateForm,
													channel: e.target.value
												}),
												className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "In-App Notification",
														children: "In-App Notification"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "Transactional Email",
														children: "Transactional Email"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "System SMS",
														children: "System SMS"
													})
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Schedule Delivery"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: templateForm?.schedule_type || "instant",
												onChange: (e) => templateForm && setTemplateForm({
													...templateForm,
													schedule_type: e.target.value
												}),
												className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "instant",
														children: "Instant (Immediate Trigger)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "future",
														children: "Scheduled Future Window"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "recurring",
														children: "Recurring Schedule (AST)"
													})
												]
											})]
										})]
									}),
									templateForm?.schedule_type === "future" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/40",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "text-xs font-semibold flex items-center gap-1.5 text-primary",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" }), " Future Trigger Date / Window"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: templateForm?.scheduled_for || "",
											onChange: (e) => templateForm && setTemplateForm({
												...templateForm,
												scheduled_for: e.target.value
											}),
											placeholder: "e.g. 2026-10-01 09:00 AST or 60 Days Prior to Expiry",
											className: "text-xs font-semibold"
										})]
									}),
									templateForm?.schedule_type === "recurring" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/40",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "text-xs font-semibold flex items-center gap-1.5 text-indigo-500",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "h-3.5 w-3.5" }), " Recurring Frequency (AST Standard)"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: templateForm?.recurring_cron || "00:00 AST (Daily Midnight)",
											onChange: (e) => templateForm && setTemplateForm({
												...templateForm,
												recurring_cron: e.target.value
											}),
											className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "00:05 AST Daily",
													children: "Daily at 00:05 AST (Midnight)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "00:15 AST (1st of month)",
													children: "Monthly (1st of Month at 00:15 AST)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Weekly (Every Sunday 08:00 AST)",
													children: "Weekly (Every Sunday 08:00 AST)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Quarterly (1st Day of Quarter)",
													children: "Quarterly (1st Day of Quarter)"
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Subject / Title"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: templateForm?.subject || "",
											onChange: (e) => templateForm && setTemplateForm({
												...templateForm,
												subject: e.target.value
											}),
											placeholder: "Enter notification subject..."
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Notification Content Body"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											rows: 6,
											value: templateForm?.body || "",
											onChange: (e) => templateForm && setTemplateForm({
												...templateForm,
												body: e.target.value
											}),
											placeholder: "Enter message body with {{variables}}...",
											className: "font-mono text-xs leading-relaxed"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Button Label (CTA)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: templateForm?.ctaText || "",
												onChange: (e) => templateForm && setTemplateForm({
													...templateForm,
													ctaText: e.target.value
												}),
												placeholder: "e.g. View Invoice"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Button Action URL"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: templateForm?.ctaUrl || "",
												onChange: (e) => templateForm && setTemplateForm({
													...templateForm,
													ctaUrl: e.target.value
												}),
												placeholder: "e.g. /portal/payments"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 rounded-lg bg-muted/40 border border-border/40 text-[11px] space-y-1 text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-foreground",
											children: "Supported Merge Tags:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-mono text-[10px] text-primary",
											children: [
												"{{organisation_name}}",
												", ",
												"{{tenant_name}}",
												", ",
												"{{unit_no}}",
												", ",
												"{{property_name}}",
												", ",
												"{{amount_due}}",
												", ",
												"{{invoice_no}}"
											]
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
										className: "text-sm font-bold text-foreground flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4 text-emerald-600" }), " Real-Time Delivery Preview"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-[10px]",
										children: templateForm?.channel === "Transactional Email" ? "Email Client View" : "In-App Popup View"
									})]
								}), templateForm?.channel === "Transactional Email" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-border/80 shadow-md bg-card overflow-hidden text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-3 bg-muted/50 border-b border-border/40 flex items-center justify-between text-[11px] text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-bold text-foreground",
												children: "From: "
											}), "ZYNO Real Estate OS <noreply@zyno.qa>"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono",
												children: "Today, 00:15 AST"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-3 bg-muted/20 border-b border-border/40 text-[11px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-bold text-foreground",
												children: "Subject: "
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-foreground",
												children: (templateForm?.subject || "").replace("{{invoice_no}}", "INV-2026-0901").replace("{{billing_period}}", "September 2026").replace("{{unit_no}}", "Unit 402").replace("{{organisation_name}}", "Al Rayyan Properties")
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-5 space-y-4 bg-background",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2 text-primary font-bold text-sm",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4" }), " ZYNO PMS Notification"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-foreground whitespace-pre-wrap leading-relaxed",
													children: (templateForm?.body || "").replace("{{organisation_name}}", "Al Rayyan Properties W.L.L.").replace("{{plan_name}}", "Enterprise Tier").replace("{{admin_email}}", "admin@alrayyan.qa").replace("{{recipient_name}}", "Fatima Al-Kuwari").replace("{{invoice_no}}", "INV-2026-0901").replace("{{amount_due}}", "8,500").replace("{{due_date}}", "05/10/2026").replace("{{tenant_name}}", "Mohammed Al-Sulaiti").replace("{{unit_no}}", "Unit 402").replace("{{property_name}}", "Lusail Marina Tower").replace("{{expiry_date}}", "30/11/2026")
												}),
												templateForm?.ctaText && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "pt-2",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
														type: "button",
														className: "px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-indigo-600 text-white font-semibold text-xs shadow-md",
														children: [templateForm.ctaText, " →"]
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "border-t border-border/40 pt-3 text-[10px] text-muted-foreground",
													children: "© 2026 ZYNO Holdings W.L.L. • Doha, State of Qatar • All rights reserved."
												})
											]
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-4 rounded-xl border border-primary/30 bg-primary/5 shadow-md space-y-2.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-3.5 w-3.5" })
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs font-bold text-foreground",
														children: (templateForm?.subject || "").replace("{{organisation_name}}", "Al Rayyan Properties")
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted-foreground font-mono",
													children: "Just now"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground leading-relaxed pl-9",
												children: (templateForm?.body || "").replace("{{organisation_name}}", "Al Rayyan Properties").replace("{{plan_name}}", "Enterprise Tier").replace("{{ticket_id}}", "TKT-8841").replace("{{ticket_status}}", "In Progress").replace("{{technician_name}}", "Karim Mansour").replace("{{unit_no}}", "Unit 402").replace("{{issue_category}}", "HVAC Maintenance").replace("{{cheque_no}}", "CHQ-99042").replace("{{cheque_amount}}", "12,000").replace("{{tenant_name}}", "Nasser Al-Attiyah").replace("{{bank_account}}", "QNB Main Operating Account")
											}),
											templateForm?.ctaText && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "pl-9 pt-1",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline",
													children: [
														templateForm.ctaText,
														" ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3" })
													]
												})
											})
										]
									})
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 bg-muted/40 border-t border-border/60 flex items-center justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setSelectedTemplateKey(null),
								className: "text-xs",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: saveTemplateCustomization,
								className: "bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white text-xs font-semibold gap-2 shadow-md",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }),
									" ",
									isCreatingNewTemplate ? "Create Rule" : "Save Template"
								]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showBroadcastModal,
				onOpenChange: setShowBroadcastModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[1000px] border border-primary/30 shadow-2xl bg-card p-0 overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/25",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "text-lg font-bold",
									children: "Broadcast In-App Announcement & Notification"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-slate-300",
									children: "Live split-screen broadcast composer with instant, future, and recurring delivery scheduling"
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs",
								children: "Interactive Preview Active"
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSendBroadcast,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60 p-6 gap-6 max-h-[70vh] overflow-y-auto",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
											className: "text-sm font-bold text-foreground flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "h-4 w-4 text-primary" }), " Announcement Details"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[11px] text-muted-foreground",
											children: "Super Admin Authority"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Alert Headline / Title"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: broadcastForm.title,
											onChange: (e) => setBroadcastForm({
												...broadcastForm,
												title: e.target.value
											}),
											placeholder: "e.g. Scheduled System Upgrade or Important Notice",
											required: true
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Alert Severity / Type"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: broadcastForm.type,
												onChange: (e) => setBroadcastForm({
													...broadcastForm,
													type: e.target.value
												}),
												className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "info",
														children: "Information (Blue)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "announcement",
														children: "Announcement (Purple)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "success",
														children: "Success / Milestone (Green)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "warning",
														children: "Warning Notice (Amber)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "critical",
														children: "Critical Urgency (Red)"
													})
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Target Audience"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: broadcastForm.target_role,
												onChange: (e) => setBroadcastForm({
													...broadcastForm,
													target_role: e.target.value
												}),
												className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "ALL",
														children: "Everyone (Staff + Tenants)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "ADMIN",
														children: "Property Managers & Admins"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "FINANCE",
														children: "Finance & Cashier Team"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "TENANT",
														children: "Tenants Only"
													})
												]
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Schedule Delivery"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: broadcastForm.schedule_type,
											onChange: (e) => setBroadcastForm({
												...broadcastForm,
												schedule_type: e.target.value
											}),
											className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "instant",
													children: "One-Time (Broadcast Immediately)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "future",
													children: "Scheduled Future Date & Time"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "recurring",
													children: "Recurring Periodic Schedule"
												})
											]
										})]
									}),
									broadcastForm.schedule_type === "future" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/40",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "text-xs font-semibold flex items-center gap-1.5 text-primary",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" }), " Scheduled Dispatch Time (AST)"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "datetime-local",
											value: broadcastForm.scheduled_for,
											onChange: (e) => setBroadcastForm({
												...broadcastForm,
												scheduled_for: e.target.value
											}),
											className: "text-xs",
											required: true
										})]
									}),
									broadcastForm.schedule_type === "recurring" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/40",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "text-xs font-semibold flex items-center gap-1.5 text-indigo-500",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "h-3.5 w-3.5" }), " Recurrence Cycle (AST)"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: broadcastForm.recurring_cron,
											onChange: (e) => setBroadcastForm({
												...broadcastForm,
												recurring_cron: e.target.value
											}),
											className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "00:00 AST (Daily Midnight)",
													children: "Daily at Midnight (00:00 AST)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "08:00 AST (Daily Morning)",
													children: "Daily Morning at 08:00 AST"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "00:15 AST (1st of month)",
													children: "Monthly on the 1st (00:15 AST)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Every Sunday 08:00 AST",
													children: "Weekly on Sundays at 08:00 AST"
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Announcement Body"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											rows: 4,
											value: broadcastForm.message,
											onChange: (e) => setBroadcastForm({
												...broadcastForm,
												message: e.target.value
											}),
											placeholder: "Enter message content...",
											required: true
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Action Button Text"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: broadcastForm.ctaText,
												onChange: (e) => setBroadcastForm({
													...broadcastForm,
													ctaText: e.target.value
												}),
												placeholder: "e.g. View Details"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Action URL (Optional Link)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: broadcastForm.action_url,
												onChange: (e) => setBroadcastForm({
													...broadcastForm,
													action_url: e.target.value
												}),
												placeholder: "e.g. /prop-mgr/leases"
											})]
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
										className: "text-sm font-bold text-foreground flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4 text-emerald-600" }), " Recipient Live Preview"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-[10px]",
										children: "In-App Notification Bell Item"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3 pt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: `p-4 rounded-xl border shadow-md space-y-2.5 transition-all ${broadcastForm.type === "critical" ? "border-red-500/30 bg-red-500/5" : broadcastForm.type === "warning" ? "border-amber-500/30 bg-amber-500/5" : broadcastForm.type === "success" ? "border-emerald-500/30 bg-emerald-500/5" : "border-primary/30 bg-primary/5"}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-3.5 w-3.5" })
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs font-bold text-foreground",
														children: broadcastForm.title || "Announcement Title"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted-foreground font-mono",
													children: "Just now"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground leading-relaxed pl-9",
												children: broadcastForm.message || "Your message body content will appear here in real-time as you type..."
											}),
											broadcastForm.action_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "pl-9 pt-1",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline",
													children: [
														broadcastForm.ctaText || "View Details",
														" ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3" })
													]
												})
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3.5 rounded-xl border border-border/50 bg-muted/20 text-xs space-y-1.5 text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: "Audience Reach:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono text-primary font-bold",
													children: [broadcastForm.target_role, " Accounts"]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: "Delivery Method:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-bold text-foreground capitalize",
													children: broadcastForm.schedule_type
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: "Audit Logging:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-bold text-emerald-600",
													children: "Recorded to security_audit_logs"
												})]
											})
										]
									})]
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 bg-muted/40 border-t border-border/60 flex items-center justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setShowBroadcastModal(false),
								className: "text-xs",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: broadcasting,
								className: "bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-500 text-white gap-2 text-xs font-semibold shadow-md",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3.5 w-3.5" }),
									" ",
									broadcastForm.schedule_type === "instant" ? "Broadcast Alert Live" : "Schedule Alert"
								]
							})]
						})]
					})]
				})
			})
		]
	});
}
var $$splitComponentImporter$54 = () => import("./sales.reservations-BQKoMuuF.mjs");
var Route$55 = createFileRoute("/sales/reservations")({ component: lazyRouteComponent($$splitComponentImporter$54, "component") });
var $$splitComponentImporter$53 = () => import("./sales.listings-DZwLZC9Z.mjs");
var Route$54 = createFileRoute("/sales/listings")({ component: lazyRouteComponent($$splitComponentImporter$53, "component") });
var $$splitComponentImporter$52 = () => import("./sales.contracts-C3nZIjEi.mjs");
var Route$53 = createFileRoute("/sales/contracts")({ component: lazyRouteComponent($$splitComponentImporter$52, "component") });
var $$splitComponentImporter$51 = () => import("./sales.appointments-DMf5CYrX.mjs");
var Route$52 = createFileRoute("/sales/appointments")({ component: lazyRouteComponent($$splitComponentImporter$51, "component") });
var $$splitComponentImporter$50 = () => import("./prop-mgr.vendors-COahcRo4.mjs");
var Route$51 = createFileRoute("/prop-mgr/vendors")({
	head: () => ({ meta: [{ title: "Vendors - Property Manager" }] }),
	component: lazyRouteComponent($$splitComponentImporter$50, "component")
});
var $$splitComponentImporter$49 = () => import("./prop-mgr.users-Ch0yozMu.mjs");
var Route$50 = createFileRoute("/prop-mgr/users")({
	head: () => ({ meta: [{ title: "Users - Property Manager" }] }),
	component: lazyRouteComponent($$splitComponentImporter$49, "component")
});
var $$splitComponentImporter$48 = () => import("./prop-mgr.units-CLSGcTYn.mjs");
var Route$49 = createFileRoute("/prop-mgr/units")({
	head: () => ({ meta: [{ title: "Units - Property Manager" }] }),
	component: lazyRouteComponent($$splitComponentImporter$48, "component")
});
var $$splitComponentImporter$47 = () => import("./prop-mgr.properties-ChIZa6jE.mjs");
var Route$48 = createFileRoute("/prop-mgr/properties")({
	head: () => ({ meta: [{ title: "Properties - Property Manager" }] }),
	component: lazyRouteComponent($$splitComponentImporter$47, "component")
});
var $$splitComponentImporter$46 = () => import("./prop-mgr.procurement-lSP8QPai.mjs");
var Route$47 = createFileRoute("/prop-mgr/procurement")({
	head: () => ({ meta: [{ title: "Procurement - Property Manager" }] }),
	component: lazyRouteComponent($$splitComponentImporter$46, "component")
});
var $$splitComponentImporter$45 = () => import("./prop-mgr.maintenance-B0TcMNpL.mjs");
var Route$46 = createFileRoute("/prop-mgr/maintenance")({
	head: () => ({ meta: [{ title: "Maintenance - Property Manager" }] }),
	component: lazyRouteComponent($$splitComponentImporter$45, "component")
});
var $$splitComponentImporter$44 = () => import("./prop-mgr.leasing-H_q976sX.mjs");
/**
* prop-mgr.leasing.tsx — thin route wrapper
*
* The full LeasingPage component (7000+ lines, ~408KB) lives in
* `src/components/leasing-module.tsx` and is loaded lazily — it is only
* downloaded when the user actually navigates to this route.
*/
var Route$45 = createFileRoute("/prop-mgr/leasing")({ component: lazyRouteComponent($$splitComponentImporter$44, "component") });
var $$splitComponentImporter$43 = () => import("./prop-mgr.leases-D5-Tdmw4.mjs");
var Route$44 = createFileRoute("/prop-mgr/leases")({
	head: () => ({ meta: [{ title: "Leases - Property Manager" }] }),
	component: lazyRouteComponent($$splitComponentImporter$43, "component")
});
var $$splitComponentImporter$42 = () => import("./prop-mgr.imports-BM2mfQB-.mjs");
var Route$43 = createFileRoute("/prop-mgr/imports")({
	validateSearch: (search) => ({
		module: search.module || "property",
		op: search.op || "CREATE"
	}),
	component: lazyRouteComponent($$splitComponentImporter$42, "component")
});
var $$splitComponentImporter$41 = () => import("./prop-mgr.finance-Dh_W9Jda.mjs");
var Route$42 = createFileRoute("/prop-mgr/finance")({
	validateSearch: (search) => ({ tab: search.tab || "finance_dashboard" }),
	head: () => ({ meta: [{ title: "Finance - Property Manager" }] }),
	component: lazyRouteComponent($$splitComponentImporter$41, "component")
});
var $$splitComponentImporter$40 = () => import("./prop-mgr.assets-CANZca5k.mjs");
var Route$41 = createFileRoute("/prop-mgr/assets")({
	head: () => ({ meta: [{ title: "Assets - Property Manager" }] }),
	component: lazyRouteComponent($$splitComponentImporter$40, "component")
});
var $$splitComponentImporter$39 = () => import("./prop-mgr.approvals-DeU8Ecnu.mjs");
var Route$40 = createFileRoute("/prop-mgr/approvals")({ component: lazyRouteComponent($$splitComponentImporter$39, "component") });
var $$splitComponentImporter$38 = () => import("./portal.tickets-DJDTmv3d.mjs");
var Route$39 = createFileRoute("/portal/tickets")({
	head: () => ({ meta: [{ title: "Tickets — ZYNO Property Management Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$38, "component")
});
var $$splitComponentImporter$37 = () => import("./portal.settings-DH3cu2jz.mjs");
var Route$38 = createFileRoute("/portal/settings")({ component: lazyRouteComponent($$splitComponentImporter$37, "component") });
var $$splitComponentImporter$36 = () => import("./portal.payments-7oZRI7i0.mjs");
var Route$37 = createFileRoute("/portal/payments")({
	head: () => ({ meta: [{ title: "Payments — ZYNO Property Management Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$36, "component")
});
var $$splitComponentImporter$35 = () => import("./portal.documents-CD5u-LCe.mjs");
var Route$36 = createFileRoute("/portal/documents")({
	head: () => ({ meta: [{ title: "Documents — ZYNO Property Management Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$35, "component")
});
var $$splitComponentImporter$34 = () => import("./portal.community-f6lKEbzL.mjs");
var Route$35 = createFileRoute("/portal/community")({
	head: () => ({ meta: [{ title: "Community — ZYNO Property Management Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$34, "component")
});
var $$splitComponentImporter$33 = () => import("./portal.bookings-BZ6E_N5D.mjs");
var Route$34 = createFileRoute("/portal/bookings")({
	head: () => ({ meta: [{ title: "Facility booking — ZYNO Property Management Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$33, "component")
});
var $$splitComponentImporter$32 = () => import("./owner.statements-9TNjYhNZ.mjs");
var Route$33 = createFileRoute("/owner/statements")({ component: lazyRouteComponent($$splitComponentImporter$32, "component") });
var $$splitComponentImporter$31 = () => import("./owner.properties-CWX0HZzZ.mjs");
var Route$32 = createFileRoute("/owner/properties")({
	head: () => ({ meta: [{ title: "Properties - Owner" }] }),
	component: lazyRouteComponent($$splitComponentImporter$31, "component")
});
var $$splitComponentImporter$30 = () => import("./owner.distributions-CxjR6DfZ.mjs");
var Route$31 = createFileRoute("/owner/distributions")({ component: lazyRouteComponent($$splitComponentImporter$30, "component") });
var $$splitComponentImporter$29 = () => import("./owner.approvals-BLzt6kKF.mjs");
var Route$30 = createFileRoute("/owner/approvals")({ component: lazyRouteComponent($$splitComponentImporter$29, "component") });
var $$splitComponentImporter$28 = () => import("./maintenance.tickets-ByoZ-j4c.mjs");
var Route$29 = createFileRoute("/maintenance/tickets")({ component: lazyRouteComponent($$splitComponentImporter$28, "component") });
var $$splitComponentImporter$27 = () => import("./maintenance.inventory-GoiWqSNO.mjs");
var Route$28 = createFileRoute("/maintenance/inventory")({ component: lazyRouteComponent($$splitComponentImporter$27, "component") });
var $$splitComponentImporter$26 = () => import("./leasing.manage-Cl9cFny6.mjs");
var Route$27 = createFileRoute("/leasing/manage")({ component: lazyRouteComponent($$splitComponentImporter$26, "component") });
var $$splitComponentImporter$25 = () => import("./leasing.create-CFoBy2RM.mjs");
var Route$26 = createFileRoute("/leasing/create")({ component: lazyRouteComponent($$splitComponentImporter$25, "component") });
var $$splitComponentImporter$24 = () => import("./finance.receivables-Bs_VrqLn.mjs");
var Route$25 = createFileRoute("/finance/receivables")({ component: lazyRouteComponent($$splitComponentImporter$24, "component") });
var $$splitComponentImporter$23 = () => import("./finance.procurement-B69jdymx.mjs");
var Route$24 = createFileRoute("/finance/procurement")({
	beforeLoad: async () => {
		await requireConsoleAccess("finance");
	},
	component: lazyRouteComponent($$splitComponentImporter$23, "component")
});
var $$splitComponentImporter$22 = () => import("./finance.ledger-ve99cE9M.mjs");
var Route$23 = createFileRoute("/finance/ledger")({ component: lazyRouteComponent($$splitComponentImporter$22, "component") });
var $$splitComponentImporter$21 = () => import("./finance.journal-4JnRK05H.mjs");
var Route$22 = createFileRoute("/finance/journal")({ component: lazyRouteComponent($$splitComponentImporter$21, "component") });
var $$splitComponentImporter$20 = () => import("./employee.portal-7Sxuu9xO.mjs");
var Route$21 = createFileRoute("/employee/portal")({
	head: () => ({ meta: [{ title: "Employee Self-Service (ESS) Portal" }] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
var $$splitComponentImporter$19 = () => import("./cashier.receipts-C1N7wSo4.mjs");
var Route$20 = createFileRoute("/cashier/receipts")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
var $$splitComponentImporter$18 = () => import("./cashier.pdc-jVhXwU8F.mjs");
var Route$19 = createFileRoute("/cashier/pdc")({
	head: () => ({ meta: [{ title: "PDC Management - ZYNO Property Management" }] }),
	component: lazyRouteComponent($$splitComponentImporter$18, "component")
});
var $$splitComponentImporter$17 = () => import("./admin.vendors-B-uzfICX.mjs");
var Route$18 = createFileRoute("/admin/vendors")({
	validateSearch: (search) => ({ tab: search.tab || "master" }),
	head: () => ({ meta: [{ title: "Vendors - Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./admin.users-Dafy9_3t.mjs");
var Route$17 = createFileRoute("/admin/users")({
	head: () => ({ meta: [{ title: "Users - Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./admin.units-Djt3w2Ss.mjs");
var Route$16 = createFileRoute("/admin/units")({
	head: () => ({ meta: [{ title: "Units - Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./admin.properties-CPGy7fYK.mjs");
var Route$15 = createFileRoute("/admin/properties")({
	head: () => ({ meta: [{ title: "Properties - Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./admin.procurement-CM7BK_mM.mjs");
var Route$14 = createFileRoute("/admin/procurement")({
	validateSearch: (search) => ({ tab: search.tab || "requests" }),
	head: () => ({ meta: [{ title: "Procurement - Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./admin.permissions-Ds33iGCo.mjs");
var Route$13 = createFileRoute("/admin/permissions")({ component: lazyRouteComponent($$splitComponentImporter$12, "component") });
var Route$12 = createFileRoute("/admin/notifications")({
	head: () => ({ meta: [{ title: "Notifications & System Alerts — ZYNO Admin" }] }),
	component: AdminNotificationsPage
});
function AdminNotificationsPage() {
	const [notifications, setNotifications] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [showCompose, setShowCompose] = (0, import_react.useState)(false);
	const [activeTab, setActiveTab] = (0, import_react.useState)("all");
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		message: "",
		type: "info",
		target_role: "ALL",
		action_url: "",
		schedule_type: "instant",
		scheduled_for: "",
		recurring_cron: "00:00 AST (Daily Midnight)",
		ctaText: "View Details"
	});
	const [sending, setSending] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		loadNotifications();
	}, []);
	async function loadNotifications() {
		setLoading(true);
		try {
			setNotifications(await fetchInAppNotifications());
		} catch (err) {
			toast.error("Failed to load notifications: " + err.message);
		} finally {
			setLoading(false);
		}
	}
	async function handleSend(e) {
		e.preventDefault();
		if (!form.title || !form.message) {
			toast.error("Please provide both a title and message.");
			return;
		}
		setSending(true);
		try {
			const res = await createBroadcastNotification({
				title: form.title,
				message: form.message,
				type: form.type,
				target_role: form.target_role,
				action_url: form.action_url,
				schedule_type: form.schedule_type,
				scheduled_for: form.schedule_type === "future" ? form.scheduled_for : null,
				recurring_cron: form.schedule_type === "recurring" ? form.recurring_cron : null
			});
			if (!res.success) {
				toast.error(res.error || "Failed to send notification.");
				return;
			}
			toast.success(form.schedule_type === "instant" ? "Notification broadcasted successfully!" : `Notification scheduled (${form.schedule_type})!`);
			setShowCompose(false);
			setForm({
				title: "",
				message: "",
				type: "info",
				target_role: "ALL",
				action_url: "",
				schedule_type: "instant",
				scheduled_for: "",
				recurring_cron: "00:00 AST (Daily Midnight)",
				ctaText: "View Details"
			});
			loadNotifications();
		} catch (err) {
			toast.error(err.message || "Failed to send notification.");
		} finally {
			setSending(false);
		}
	}
	const filteredNotifs = notifications.filter((n) => {
		if (activeTab === "all") return true;
		if (activeTab === "scheduled") return n.schedule_type && n.schedule_type !== "instant";
		if (activeTab === "critical") return n.type === "critical" || n.type === "warning";
		return true;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6 pb-12",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold tracking-tight text-foreground",
					children: "Notifications & System Alerts"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Dispatch announcements, maintenance alerts, and tenant communications."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: loadNotifications,
						disabled: loading,
						className: "gap-2 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` }), " Refresh"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setShowCompose(true),
						className: "gap-2 text-xs font-semibold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Compose Notification"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showCompose,
				onOpenChange: setShowCompose,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-4xl p-0 overflow-hidden bg-card border shadow-2xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-500/20 flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-sm font-bold text-white",
								children: "Compose Alert Notification"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-[11px] text-slate-300",
								children: "Split-screen editor with real-time delivery preview"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]",
							children: "Live Delivery Preview Active"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleSend,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border/60 p-6 gap-6 max-h-[75vh] overflow-y-auto",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Notification Title"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.title,
											onChange: (e) => setForm({
												...form,
												title: e.target.value
											}),
											placeholder: "e.g. Scheduled Water Maintenance or Rent Reminder",
											required: true
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Severity / Tone"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: form.type,
												onChange: (e) => setForm({
													...form,
													type: e.target.value
												}),
												className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "info",
														children: "Info (Blue)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "announcement",
														children: "Announcement (Purple)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "success",
														children: "Success (Green)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "warning",
														children: "Warning (Amber)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "critical",
														children: "Critical (Red)"
													})
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Audience / Target Role"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: form.target_role,
												onChange: (e) => setForm({
													...form,
													target_role: e.target.value
												}),
												className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "ALL",
														children: "All Users & Tenants"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "LEASING_OFFICER",
														children: "Leasing Officers & Real Estate"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "FINANCE_OFFICER",
														children: "Finance & Accounting Team"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "CASHIER",
														children: "Cashier & Counter Collection"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "MAINTENANCE_COORDINATOR",
														children: "Maintenance & Technicians"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "PROP_MGR",
														children: "Property Managers"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "TENANT",
														children: "Tenants Only"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "ADMIN",
														children: "Tenant Admins Only"
													})
												]
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Schedule Delivery"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: form.schedule_type,
											onChange: (e) => setForm({
												...form,
												schedule_type: e.target.value
											}),
											className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "instant",
													children: "One-Time (Instant Delivery)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "future",
													children: "Scheduled Future Date & Time"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "recurring",
													children: "Recurring Periodic Schedule"
												})
											]
										})]
									}),
									form.schedule_type === "future" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/40",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "text-xs font-semibold flex items-center gap-1.5 text-primary",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5" }), " Scheduled Date (AST)"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "datetime-local",
											value: form.scheduled_for,
											onChange: (e) => setForm({
												...form,
												scheduled_for: e.target.value
											}),
											className: "text-xs",
											required: true
										})]
									}),
									form.schedule_type === "recurring" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5 p-3 rounded-lg bg-muted/40 border border-border/40",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "text-xs font-semibold flex items-center gap-1.5 text-indigo-500",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Repeat, { className: "h-3.5 w-3.5" }), " Recurrence AST Frequency"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: form.recurring_cron,
											onChange: (e) => setForm({
												...form,
												recurring_cron: e.target.value
											}),
											className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "00:00 AST (Daily Midnight)",
													children: "Daily at 00:00 AST"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "08:00 AST (Daily Morning)",
													children: "Daily Morning at 08:00 AST"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "00:15 AST (1st of month)",
													children: "Monthly (1st of Month at 00:15 AST)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Weekly (Every Sunday 08:00 AST)",
													children: "Weekly (Sundays 08:00 AST)"
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Message Body"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
											rows: 4,
											value: form.message,
											onChange: (e) => setForm({
												...form,
												message: e.target.value
											}),
											placeholder: "Type alert content here...",
											required: true
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Button Label"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: form.ctaText,
												onChange: (e) => setForm({
													...form,
													ctaText: e.target.value
												}),
												placeholder: "e.g. View Details"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Action URL"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: form.action_url,
												onChange: (e) => setForm({
													...form,
													action_url: e.target.value
												}),
												placeholder: "e.g. /portal/payments"
											})]
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
											className: "text-sm font-bold text-foreground flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-4 w-4 text-emerald-600" }), " Recipient Live Preview"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: "text-[10px]",
											children: "In-App Notification Item"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-2.5 shadow-md",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-3.5 w-3.5" })
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs font-bold text-foreground",
														children: form.title || "Notification Title"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted-foreground font-mono",
													children: "Just now"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground leading-relaxed pl-9",
												children: form.message || "Message body will render here live..."
											}),
											form.action_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "pl-9 pt-1",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline",
													children: [
														form.ctaText || "View Details",
														" ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3 w-3" })
													]
												})
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3.5 rounded-xl border border-border/50 bg-muted/20 text-xs space-y-1.5 text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: "Target Reach:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono text-primary font-bold",
													children: [form.target_role, " Accounts"]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: "Delivery Method:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-bold text-foreground capitalize",
													children: form.schedule_type
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground",
													children: "Analytics:"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-bold text-emerald-600",
													children: "Views & CTA Clicks Tracked"
												})]
											})
										]
									})
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "p-4 bg-muted/40 border-t border-border/60 flex items-center justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setShowCompose(false),
								className: "text-xs",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: sending,
								className: "bg-primary text-white gap-2 text-xs font-semibold shadow-md",
								children: [sending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3.5 w-3.5" }), form.schedule_type === "instant" ? "Broadcast Alert Now" : "Save & Schedule Alert"]
							})]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border border-border/80 shadow-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "pb-3 border-b border-border/40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base font-semibold",
								children: "Sent & Scheduled Alerts"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "History of all broadcasted notifications"
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
							value: activeTab,
							onValueChange: setActiveTab,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "bg-muted/60 p-0.5 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "all",
										className: "text-xs py-1",
										children: [
											"All (",
											notifications.length,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "scheduled",
										className: "text-xs py-1",
										children: "Scheduled"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "critical",
										className: "text-xs py-1",
										children: "Critical / Urgent"
									})
								]
							})
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-4",
					children: filteredNotifs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "py-12 text-center text-xs text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-8 w-8 mx-auto mb-2 opacity-30" }), "No notifications found for this view."]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "divide-y divide-border/40 space-y-3",
						children: filteredNotifs.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pt-3 first:pt-0 flex items-start justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: `text-[10px] uppercase font-bold ${n.type === "critical" ? "bg-red-500/15 text-red-600 border-red-500/20" : n.type === "warning" ? "bg-amber-500/15 text-amber-600 border-amber-500/20" : n.type === "success" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20" : "bg-blue-500/15 text-blue-600 border-blue-500/20"}`,
											children: n.type
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-semibold text-foreground",
											children: n.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] text-muted-foreground",
											children: ["Target: ", n.target_role]
										}),
										n.schedule_type && n.schedule_type !== "instant" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "outline",
											className: "text-[10px] gap-1 text-primary",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-2.5 w-2.5" }),
												" ",
												n.schedule_type
											]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: n.message
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-right space-y-1 whitespace-nowrap",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-muted-foreground block",
									children: new Date(n.created_at).toLocaleDateString("en-QA", {
										hour: "2-digit",
										minute: "2-digit"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-[10px] font-semibold text-muted-foreground justify-end",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-0.5 text-emerald-600",
										title: "User Views",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3 w-3" }),
											" ",
											n.engagement_count || 0,
											" views"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-0.5 text-indigo-600",
										title: "CTA Clicks",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MousePointerClick, { className: "h-3 w-3" }),
											" ",
											n.click_count || 0,
											" clicks"
										]
									})]
								})]
							})]
						}, n.id))
					})
				})]
			})
		]
	});
}
var $$splitComponentImporter$11 = () => import("./admin.masters-KGm-NVrr.mjs");
var Route$11 = createFileRoute("/admin/masters")({
	validateSearch: (search) => ({ tab: search.tab || "asset_category" }),
	head: () => ({ meta: [{ title: "Masters - Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
var $$splitComponentImporter$10 = () => import("./admin.maintenance-C1DDZA2n.mjs");
var Route$10 = createFileRoute("/admin/maintenance")({
	validateSearch: (search) => ({ tab: search.tab || "tickets" }),
	head: () => ({ meta: [{ title: "Maintenance - Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./admin.leases-BXK9S9LR.mjs");
var Route$9 = createFileRoute("/admin/leases")({
	validateSearch: (search) => ({ tab: search.tab || "agreement" }),
	head: () => ({ meta: [{ title: "Leasing - Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var $$splitComponentImporter$8 = () => import("./admin.hrms-BPqCTDvh.mjs");
var Route$8 = createFileRoute("/admin/hrms")({
	validateSearch: (search) => ({ tab: search.tab || "dashboard" }),
	head: () => ({ meta: [{ title: "Enterprise HRMS & Workforce - Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./admin.finance-CnLGZ6iE.mjs");
var Route$7 = createFileRoute("/admin/finance")({
	validateSearch: (search) => ({ tab: search.tab || "finance_dashboard" }),
	head: () => ({ meta: [{ title: "Finance - Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./admin.dashboard-Dqp5Gs1m.mjs");
var Route$6 = createFileRoute("/admin/dashboard")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./admin.audit-logs-C35Sgdao.mjs");
var Route$5 = createFileRoute("/admin/audit-logs")({
	validateSearch: (search) => ({ tab: typeof search.tab === "string" ? search.tab : "audit-trail" }),
	head: () => ({ meta: [{ title: "Audit Trail & Engagement Analytics — ZYNO Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
var $$splitComponentImporter$4 = () => import("./admin.assets-CVjlQn-e.mjs");
var Route$4 = createFileRoute("/admin/assets")({
	head: () => ({ meta: [{ title: "Assets - Admin" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./prop-mgr.units.pricing-BKLjwhS2.mjs");
var Route$3 = createFileRoute("/prop-mgr/units/pricing")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./portal.community.reviews-CleMFCvW.mjs");
var Route$2 = createFileRoute("/portal/community/reviews")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./portal.community.events-Co2mDar6.mjs");
var Route$1 = createFileRoute("/portal/community/events")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("./admin.leases.new-DUxyy-bx.mjs");
var Route = createFileRoute("/admin/leases/new")({
	head: () => ({ meta: [{ title: "New Lease — ZYNO Property Management" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var SuperAdminRoute = Route$87.update({
	id: "/super-admin",
	path: "/super-admin",
	getParentRoute: () => Route$88
});
var SitemapDotxmlRoute = Route$86.update({
	id: "/sitemap.xml",
	path: "/sitemap.xml",
	getParentRoute: () => Route$88
});
var SalesRoute = Route$85.update({
	id: "/sales",
	path: "/sales",
	getParentRoute: () => Route$88
});
var PropMgrRoute = Route$84.update({
	id: "/prop-mgr",
	path: "/prop-mgr",
	getParentRoute: () => Route$88
});
var PortalRoute = Route$83.update({
	id: "/portal",
	path: "/portal",
	getParentRoute: () => Route$88
});
var OwnerRoute = Route$82.update({
	id: "/owner",
	path: "/owner",
	getParentRoute: () => Route$88
});
var MaintenanceRoute = Route$81.update({
	id: "/maintenance",
	path: "/maintenance",
	getParentRoute: () => Route$88
});
var LeasingRoute = Route$80.update({
	id: "/leasing",
	path: "/leasing",
	getParentRoute: () => Route$88
});
var GuestRoute = Route$79.update({
	id: "/guest",
	path: "/guest",
	getParentRoute: () => Route$88
});
var FinanceRoute = Route$78.update({
	id: "/finance",
	path: "/finance",
	getParentRoute: () => Route$88
});
var CashierRoute = Route$77.update({
	id: "/cashier",
	path: "/cashier",
	getParentRoute: () => Route$88
});
var AuthRoute = Route$76.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$88
});
var AdminRoute = Route$75.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => Route$88
});
var IndexRoute = Route$74.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$88
});
var SuperAdminIndexRoute = Route$73.update({
	id: "/",
	path: "/",
	getParentRoute: () => SuperAdminRoute
});
var PropMgrIndexRoute = Route$72.update({
	id: "/",
	path: "/",
	getParentRoute: () => PropMgrRoute
});
var PortalIndexRoute = Route$71.update({
	id: "/",
	path: "/",
	getParentRoute: () => PortalRoute
});
var MaintenanceIndexRoute = Route$70.update({
	id: "/",
	path: "/",
	getParentRoute: () => MaintenanceRoute
});
var LeasingIndexRoute = Route$69.update({
	id: "/",
	path: "/",
	getParentRoute: () => LeasingRoute
});
var FinanceIndexRoute = Route$68.update({
	id: "/",
	path: "/",
	getParentRoute: () => FinanceRoute
});
var CashierIndexRoute = Route$67.update({
	id: "/",
	path: "/",
	getParentRoute: () => CashierRoute
});
var AdminIndexRoute = Route$66.update({
	id: "/",
	path: "/",
	getParentRoute: () => AdminRoute
});
var SuperAdminUsersRoute = Route$93.update({
	id: "/users",
	path: "/users",
	getParentRoute: () => SuperAdminRoute
});
var SuperAdminTenantsRoute = Route$65.update({
	id: "/tenants",
	path: "/tenants",
	getParentRoute: () => SuperAdminRoute
});
var SuperAdminSecurityRoute = Route$64.update({
	id: "/security",
	path: "/security",
	getParentRoute: () => SuperAdminRoute
});
var SuperAdminPermissionsRoute = Route$63.update({
	id: "/permissions",
	path: "/permissions",
	getParentRoute: () => SuperAdminRoute
});
var SuperAdminNotificationsRoute = Route$62.update({
	id: "/notifications",
	path: "/notifications",
	getParentRoute: () => SuperAdminRoute
});
var SuperAdminInvoicesRoute = Route$61.update({
	id: "/invoices",
	path: "/invoices",
	getParentRoute: () => SuperAdminRoute
});
var SuperAdminHealthRoute = Route$60.update({
	id: "/health",
	path: "/health",
	getParentRoute: () => SuperAdminRoute
});
var SuperAdminConfigRoute = Route$59.update({
	id: "/config",
	path: "/config",
	getParentRoute: () => SuperAdminRoute
});
var SuperAdminBillingRoute = Route$58.update({
	id: "/billing",
	path: "/billing",
	getParentRoute: () => SuperAdminRoute
});
var SuperAdminAnalyticsRoute = Route$57.update({
	id: "/analytics",
	path: "/analytics",
	getParentRoute: () => SuperAdminRoute
});
var SuperAdminAlertsRoute = Route$56.update({
	id: "/alerts",
	path: "/alerts",
	getParentRoute: () => SuperAdminRoute
});
var SalesReservationsRoute = Route$55.update({
	id: "/reservations",
	path: "/reservations",
	getParentRoute: () => SalesRoute
});
var SalesListingsRoute = Route$54.update({
	id: "/listings",
	path: "/listings",
	getParentRoute: () => SalesRoute
});
var SalesContractsRoute = Route$53.update({
	id: "/contracts",
	path: "/contracts",
	getParentRoute: () => SalesRoute
});
var SalesAppointmentsRoute = Route$52.update({
	id: "/appointments",
	path: "/appointments",
	getParentRoute: () => SalesRoute
});
var PropMgrVendorsRoute = Route$51.update({
	id: "/vendors",
	path: "/vendors",
	getParentRoute: () => PropMgrRoute
});
var PropMgrUsersRoute = Route$50.update({
	id: "/users",
	path: "/users",
	getParentRoute: () => PropMgrRoute
});
var PropMgrUnitsRoute = Route$49.update({
	id: "/units",
	path: "/units",
	getParentRoute: () => PropMgrRoute
});
var PropMgrPropertiesRoute = Route$48.update({
	id: "/properties",
	path: "/properties",
	getParentRoute: () => PropMgrRoute
});
var PropMgrProcurementRoute = Route$47.update({
	id: "/procurement",
	path: "/procurement",
	getParentRoute: () => PropMgrRoute
});
var PropMgrMaintenanceRoute = Route$46.update({
	id: "/maintenance",
	path: "/maintenance",
	getParentRoute: () => PropMgrRoute
});
var PropMgrLeasingRoute = Route$45.update({
	id: "/leasing",
	path: "/leasing",
	getParentRoute: () => PropMgrRoute
});
var PropMgrLeasesRoute = Route$44.update({
	id: "/leases",
	path: "/leases",
	getParentRoute: () => PropMgrRoute
});
var PropMgrImportsRoute = Route$43.update({
	id: "/imports",
	path: "/imports",
	getParentRoute: () => PropMgrRoute
});
var PropMgrFinanceRoute = Route$42.update({
	id: "/finance",
	path: "/finance",
	getParentRoute: () => PropMgrRoute
});
var PropMgrAssetsRoute = Route$41.update({
	id: "/assets",
	path: "/assets",
	getParentRoute: () => PropMgrRoute
});
var PropMgrApprovalsRoute = Route$40.update({
	id: "/approvals",
	path: "/approvals",
	getParentRoute: () => PropMgrRoute
});
var PortalTicketsRoute = Route$39.update({
	id: "/tickets",
	path: "/tickets",
	getParentRoute: () => PortalRoute
});
var PortalSettingsRoute = Route$38.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => PortalRoute
});
var PortalPaymentsRoute = Route$37.update({
	id: "/payments",
	path: "/payments",
	getParentRoute: () => PortalRoute
});
var PortalDocumentsRoute = Route$36.update({
	id: "/documents",
	path: "/documents",
	getParentRoute: () => PortalRoute
});
var PortalCommunityRoute = Route$35.update({
	id: "/community",
	path: "/community",
	getParentRoute: () => PortalRoute
});
var PortalBookingsRoute = Route$34.update({
	id: "/bookings",
	path: "/bookings",
	getParentRoute: () => PortalRoute
});
var OwnerStatementsRoute = Route$33.update({
	id: "/statements",
	path: "/statements",
	getParentRoute: () => OwnerRoute
});
var OwnerPropertiesRoute = Route$32.update({
	id: "/properties",
	path: "/properties",
	getParentRoute: () => OwnerRoute
});
var OwnerDistributionsRoute = Route$31.update({
	id: "/distributions",
	path: "/distributions",
	getParentRoute: () => OwnerRoute
});
var OwnerApprovalsRoute = Route$30.update({
	id: "/approvals",
	path: "/approvals",
	getParentRoute: () => OwnerRoute
});
var MaintenanceTicketsRoute = Route$29.update({
	id: "/tickets",
	path: "/tickets",
	getParentRoute: () => MaintenanceRoute
});
var MaintenanceInventoryRoute = Route$28.update({
	id: "/inventory",
	path: "/inventory",
	getParentRoute: () => MaintenanceRoute
});
var LeasingManageRoute = Route$27.update({
	id: "/manage",
	path: "/manage",
	getParentRoute: () => LeasingRoute
});
var LeasingCreateRoute = Route$26.update({
	id: "/create",
	path: "/create",
	getParentRoute: () => LeasingRoute
});
var FinanceReceivablesRoute = Route$25.update({
	id: "/receivables",
	path: "/receivables",
	getParentRoute: () => FinanceRoute
});
var FinanceProcurementRoute = Route$24.update({
	id: "/procurement",
	path: "/procurement",
	getParentRoute: () => FinanceRoute
});
var FinanceLedgerRoute = Route$23.update({
	id: "/ledger",
	path: "/ledger",
	getParentRoute: () => FinanceRoute
});
var FinanceJournalRoute = Route$22.update({
	id: "/journal",
	path: "/journal",
	getParentRoute: () => FinanceRoute
});
var EmployeePortalRoute = Route$21.update({
	id: "/employee/portal",
	path: "/employee/portal",
	getParentRoute: () => Route$88
});
var CashierReceiptsRoute = Route$20.update({
	id: "/receipts",
	path: "/receipts",
	getParentRoute: () => CashierRoute
});
var CashierPdcRoute = Route$19.update({
	id: "/pdc",
	path: "/pdc",
	getParentRoute: () => CashierRoute
});
var AdminVendorsRoute = Route$18.update({
	id: "/vendors",
	path: "/vendors",
	getParentRoute: () => AdminRoute
});
var AdminUsersRoute = Route$17.update({
	id: "/users",
	path: "/users",
	getParentRoute: () => AdminRoute
});
var AdminUnitsRoute = Route$16.update({
	id: "/units",
	path: "/units",
	getParentRoute: () => AdminRoute
});
var AdminPropertiesRoute = Route$15.update({
	id: "/properties",
	path: "/properties",
	getParentRoute: () => AdminRoute
});
var AdminProcurementRoute = Route$14.update({
	id: "/procurement",
	path: "/procurement",
	getParentRoute: () => AdminRoute
});
var AdminPermissionsRoute = Route$13.update({
	id: "/permissions",
	path: "/permissions",
	getParentRoute: () => AdminRoute
});
var AdminNotificationsRoute = Route$12.update({
	id: "/notifications",
	path: "/notifications",
	getParentRoute: () => AdminRoute
});
var AdminMastersRoute = Route$11.update({
	id: "/masters",
	path: "/masters",
	getParentRoute: () => AdminRoute
});
var AdminMaintenanceRoute = Route$10.update({
	id: "/maintenance",
	path: "/maintenance",
	getParentRoute: () => AdminRoute
});
var AdminLeasesRoute = Route$9.update({
	id: "/leases",
	path: "/leases",
	getParentRoute: () => AdminRoute
});
var AdminImportsRoute = Route$92.update({
	id: "/imports",
	path: "/imports",
	getParentRoute: () => AdminRoute
});
var AdminHrmsRoute = Route$8.update({
	id: "/hrms",
	path: "/hrms",
	getParentRoute: () => AdminRoute
});
var AdminFinanceRoute = Route$7.update({
	id: "/finance",
	path: "/finance",
	getParentRoute: () => AdminRoute
});
var AdminDashboardRoute = Route$6.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AdminRoute
});
var AdminAuditLogsRoute = Route$5.update({
	id: "/audit-logs",
	path: "/audit-logs",
	getParentRoute: () => AdminRoute
});
var AdminAssetsRoute = Route$4.update({
	id: "/assets",
	path: "/assets",
	getParentRoute: () => AdminRoute
});
var PropMgrUnitsPricingRoute = Route$3.update({
	id: "/pricing",
	path: "/pricing",
	getParentRoute: () => PropMgrUnitsRoute
});
var PropMgrManageIdRoute = Route$89.update({
	id: "/manage/$id",
	path: "/manage/$id",
	getParentRoute: () => PropMgrRoute
});
var PortalCommunityReviewsRoute = Route$2.update({
	id: "/reviews",
	path: "/reviews",
	getParentRoute: () => PortalCommunityRoute
});
var PortalCommunityEventsRoute = Route$1.update({
	id: "/events",
	path: "/events",
	getParentRoute: () => PortalCommunityRoute
});
var OwnerManageIdRoute = Route$91.update({
	id: "/manage/$id",
	path: "/manage/$id",
	getParentRoute: () => OwnerRoute
});
var AdminManageIdRoute = Route$90.update({
	id: "/manage/$id",
	path: "/manage/$id",
	getParentRoute: () => AdminRoute
});
var AdminLeasesRouteChildren = { AdminLeasesNewRoute: Route.update({
	id: "/new",
	path: "/new",
	getParentRoute: () => AdminLeasesRoute
}) };
var AdminRouteChildren = {
	AdminAssetsRoute,
	AdminAuditLogsRoute,
	AdminDashboardRoute,
	AdminFinanceRoute,
	AdminHrmsRoute,
	AdminImportsRoute,
	AdminLeasesRoute: AdminLeasesRoute._addFileChildren(AdminLeasesRouteChildren),
	AdminMaintenanceRoute,
	AdminMastersRoute,
	AdminNotificationsRoute,
	AdminPermissionsRoute,
	AdminProcurementRoute,
	AdminPropertiesRoute,
	AdminUnitsRoute,
	AdminUsersRoute,
	AdminVendorsRoute,
	AdminIndexRoute,
	AdminManageIdRoute
};
var AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
var CashierRouteChildren = {
	CashierPdcRoute,
	CashierReceiptsRoute,
	CashierIndexRoute
};
var CashierRouteWithChildren = CashierRoute._addFileChildren(CashierRouteChildren);
var FinanceRouteChildren = {
	FinanceJournalRoute,
	FinanceLedgerRoute,
	FinanceProcurementRoute,
	FinanceReceivablesRoute,
	FinanceIndexRoute
};
var FinanceRouteWithChildren = FinanceRoute._addFileChildren(FinanceRouteChildren);
var LeasingRouteChildren = {
	LeasingCreateRoute,
	LeasingManageRoute,
	LeasingIndexRoute
};
var LeasingRouteWithChildren = LeasingRoute._addFileChildren(LeasingRouteChildren);
var MaintenanceRouteChildren = {
	MaintenanceInventoryRoute,
	MaintenanceTicketsRoute,
	MaintenanceIndexRoute
};
var MaintenanceRouteWithChildren = MaintenanceRoute._addFileChildren(MaintenanceRouteChildren);
var OwnerRouteChildren = {
	OwnerApprovalsRoute,
	OwnerDistributionsRoute,
	OwnerPropertiesRoute,
	OwnerStatementsRoute,
	OwnerManageIdRoute
};
var OwnerRouteWithChildren = OwnerRoute._addFileChildren(OwnerRouteChildren);
var PortalCommunityRouteChildren = {
	PortalCommunityEventsRoute,
	PortalCommunityReviewsRoute
};
var PortalRouteChildren = {
	PortalBookingsRoute,
	PortalCommunityRoute: PortalCommunityRoute._addFileChildren(PortalCommunityRouteChildren),
	PortalDocumentsRoute,
	PortalPaymentsRoute,
	PortalSettingsRoute,
	PortalTicketsRoute,
	PortalIndexRoute
};
var PortalRouteWithChildren = PortalRoute._addFileChildren(PortalRouteChildren);
var PropMgrUnitsRouteChildren = { PropMgrUnitsPricingRoute };
var PropMgrRouteChildren = {
	PropMgrApprovalsRoute,
	PropMgrAssetsRoute,
	PropMgrFinanceRoute,
	PropMgrImportsRoute,
	PropMgrLeasesRoute,
	PropMgrLeasingRoute,
	PropMgrMaintenanceRoute,
	PropMgrProcurementRoute,
	PropMgrPropertiesRoute,
	PropMgrUnitsRoute: PropMgrUnitsRoute._addFileChildren(PropMgrUnitsRouteChildren),
	PropMgrUsersRoute,
	PropMgrVendorsRoute,
	PropMgrIndexRoute,
	PropMgrManageIdRoute
};
var PropMgrRouteWithChildren = PropMgrRoute._addFileChildren(PropMgrRouteChildren);
var SalesRouteChildren = {
	SalesAppointmentsRoute,
	SalesContractsRoute,
	SalesListingsRoute,
	SalesReservationsRoute
};
var SalesRouteWithChildren = SalesRoute._addFileChildren(SalesRouteChildren);
var SuperAdminRouteChildren = {
	SuperAdminAlertsRoute,
	SuperAdminAnalyticsRoute,
	SuperAdminBillingRoute,
	SuperAdminConfigRoute,
	SuperAdminHealthRoute,
	SuperAdminInvoicesRoute,
	SuperAdminNotificationsRoute,
	SuperAdminPermissionsRoute,
	SuperAdminSecurityRoute,
	SuperAdminTenantsRoute,
	SuperAdminUsersRoute,
	SuperAdminIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AdminRoute: AdminRouteWithChildren,
	AuthRoute,
	CashierRoute: CashierRouteWithChildren,
	FinanceRoute: FinanceRouteWithChildren,
	GuestRoute,
	LeasingRoute: LeasingRouteWithChildren,
	MaintenanceRoute: MaintenanceRouteWithChildren,
	OwnerRoute: OwnerRouteWithChildren,
	PortalRoute: PortalRouteWithChildren,
	PropMgrRoute: PropMgrRouteWithChildren,
	SalesRoute: SalesRouteWithChildren,
	SitemapDotxmlRoute,
	SuperAdminRoute: SuperAdminRoute._addFileChildren(SuperAdminRouteChildren),
	EmployeePortalRoute
};
var routeTree = Route$88._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
