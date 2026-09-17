import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as ShieldCheck, B as RefreshCw, Ct as Globe, L as Save, P as Send, S as Sparkles, W as Plus, Wt as Clock, dn as Calendar, dt as Languages, et as MousePointerClick, ot as Lock, pt as Key, s as Users, sn as CheckCheck, t as Zap, vn as Bell, w as SlidersVertical, x as SquarePen } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { a as saveSystemConfig, n as fetchAllSystemConfigs, r as fetchInAppNotifications } from "./system-config-CsVWXlCy.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/super-admin.config-CZdiSSy_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
function DisplayField({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3.5 rounded-xl border border-border/50 bg-background/80 hover:bg-muted/20 transition-all",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] font-semibold text-muted-foreground uppercase tracking-wider",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-bold text-foreground mt-1 truncate",
			children: value || "—"
		})]
	});
}
function ConfigPage() {
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [savingSection, setSavingSection] = (0, import_react.useState)(null);
	const [activeTab, setActiveTab] = (0, import_react.useState)("overview");
	const [identity, setIdentity] = (0, import_react.useState)({});
	const [localization, setLocalization] = (0, import_react.useState)({});
	const [engines, setEngines] = (0, import_react.useState)({});
	const [notifications, setNotifications] = (0, import_react.useState)({});
	const [security, setSecurity] = (0, import_react.useState)({});
	const [integrations, setIntegrations] = (0, import_react.useState)({});
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
	const [savedSuccessModal, setSavedSuccessModal] = (0, import_react.useState)(null);
	const [editModalSection, setEditModalSection] = (0, import_react.useState)(null);
	const [newAutomationForm, setNewAutomationForm] = (0, import_react.useState)({
		id: "",
		name: "",
		description: "",
		executionTimeQatar: "00:00 AST",
		frequency: "daily",
		enabled: true,
		targetModule: "Core Finance & Ledger"
	});
	const [notificationSubTab, setNotificationSubTab] = (0, import_react.useState)("all-rules");
	(0, import_react.useEffect)(() => {
		loadAllConfigs();
		loadNotifications();
	}, []);
	async function loadAllConfigs() {
		setLoading(true);
		try {
			const data = await fetchAllSystemConfigs();
			setIdentity(data.platform_identity);
			setLocalization(data.localization);
			setEngines(data.engine_automations);
			setNotifications(data.notifications);
			setSecurity(data.security_policies);
			setIntegrations(data.integrations);
		} catch (err) {
			toast.error("Failed to load platform settings: " + err.message);
		} finally {
			setLoading(false);
		}
	}
	async function loadNotifications() {
		setInAppNotifs(await fetchInAppNotifications());
	}
	async function handleSave(sectionKey, sectionName, data) {
		setSavingSection(sectionKey);
		try {
			const res = await saveSystemConfig(sectionKey, data);
			if (!res.success) {
				toast.error(`Error saving ${sectionName}: ${res.error}`);
				return;
			}
			setSavedSuccessModal({
				title: `${sectionName} Saved Successfully`,
				desc: `Your new ${sectionName.toLowerCase()} settings are now live across all tenants and database functions.`
			});
			toast.success(`${sectionName} saved live to database!`);
		} catch (err) {
			toast.error(err.message || "Failed to update configuration.");
		} finally {
			setSavingSection(null);
		}
	}
	async function handleToggleEngine(engineKey, currentVal) {
		const updated = {
			...engines,
			[engineKey]: currentVal === void 0 ? false : !currentVal
		};
		setEngines(updated);
		await handleSave("engine_automations", "Engine Automations", updated);
	}
	async function handleToggleCustomEngine(id) {
		const updatedList = (engines.customAutomations || []).map((item) => item.id === id ? {
			...item,
			enabled: !item.enabled
		} : item);
		const updatedEngines = {
			...engines,
			customAutomations: updatedList
		};
		setEngines(updatedEngines);
		await handleSave("engine_automations", "Engine Automations", updatedEngines);
	}
	async function handleCreateCustomAutomation(e) {
		e.preventDefault();
		if (!newAutomationForm.name) {
			toast.error("Please enter an automation name.");
			return;
		}
		const newId = `auto_${Date.now()}`;
		const itemToAdd = {
			...newAutomationForm,
			id: newId
		};
		const updatedEngines = {
			...engines,
			customAutomations: [...engines.customAutomations || [], itemToAdd]
		};
		setEngines(updatedEngines);
		await handleSave("engine_automations", "Engine Automations", updatedEngines);
		setEditModalSection(null);
		setNewAutomationForm({
			id: "",
			name: "",
			description: "",
			executionTimeQatar: "00:00 AST",
			frequency: "daily",
			enabled: true,
			targetModule: "Core Finance & Ledger"
		});
		toast.success(`Automation "${itemToAdd.name}" added successfully!`);
	}
	Object.entries(templates).filter(([_, item]) => {
		if (notificationSubTab === "in-app") return item.channel === "In-App Notification";
		if (notificationSubTab === "emails") return item.channel === "Transactional Email";
		return true;
	});
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-[450px] flex flex-col items-center justify-center space-y-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-8 w-8 animate-spin text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-medium text-muted-foreground animate-pulse",
			children: "Loading Global Configurations..."
		})]
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
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-amber-300" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Platform Governance & Standards" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-3xl font-extrabold tracking-tight",
									children: "Global System Configuration"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-slate-300 max-w-2xl",
									children: "Master control center for branding, Qatar localization, automated background engines, security policies, and notification templates."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: loadAllConfigs,
								disabled: loading,
								className: "bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-9 gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` }), " Refresh"]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute -left-10 -top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: activeTab,
				onValueChange: setActiveTab,
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "grid grid-cols-2 md:grid-cols-5 h-auto p-1.5 bg-muted/60 backdrop-blur-sm rounded-xl border border-border/60",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "overview",
								className: "rounded-lg py-2.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "h-3.5 w-3.5" }), " Overview"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "branding",
								className: "rounded-lg py-2.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-3.5 w-3.5" }), " Identity"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "localization",
								className: "rounded-lg py-2.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "h-3.5 w-3.5" }), " Regional (QA)"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "engines",
								className: "rounded-lg py-2.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "h-3.5 w-3.5" }), " Automations"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: "security",
								className: "rounded-lg py-2.5 text-xs font-semibold gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5" }), " Security & APIs"]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "overview",
						className: "space-y-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-6 md:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
									className: "bg-gradient-to-br from-card to-card/50 border border-primary/20 shadow-sm hover:shadow-md transition-all group relative overflow-hidden",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all pointer-events-none" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
											className: "pb-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
													children: "Active Standard"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20 text-[10px]",
														children: "Active"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														variant: "ghost",
														size: "sm",
														onClick: () => setEditModalSection("localization"),
														className: "h-7 px-2 text-xs text-primary font-semibold hover:bg-primary/10 gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "h-3 w-3" }), " Edit"]
													})]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
												className: "text-lg font-bold text-foreground mt-1",
												children: "Qatar Standard (AST)"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
											className: "space-y-2 text-xs text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between py-1 border-b border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Timezone:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-semibold text-foreground",
														children: [localization.defaultTimezone || "Asia/Qatar", " (UTC+3)"]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between py-1 border-b border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Currency:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-semibold text-foreground",
														children: [
															localization.defaultCurrency || "QAR",
															" (",
															localization.currencySymbol || "QR",
															")"
														]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between py-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Date Format:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-foreground",
														children: localization.dateFormat || "DD/MM/YYYY"
													})]
												})
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
									className: "bg-gradient-to-br from-card to-card/50 border border-indigo-500/20 shadow-sm hover:shadow-md transition-all group relative overflow-hidden",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all pointer-events-none" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
											className: "pb-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
													children: "Automated Engines"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														className: "bg-indigo-500/15 text-indigo-600 border-indigo-500/20 text-[10px]",
														children: "Active"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														variant: "ghost",
														size: "sm",
														onClick: () => setActiveTab("engines"),
														className: "h-7 px-2 text-xs text-indigo-500 font-semibold hover:bg-indigo-500/10 gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "h-3 w-3" }), " View All"]
													})]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
												className: "text-lg font-bold text-foreground mt-1",
												children: "Nightly AST Automations"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
											className: "space-y-2 text-xs text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between py-1 border-b border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "PDC Clearing:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-foreground",
														children: engines.pdcClearingTimeQatar || "00:05 AST"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between py-1 border-b border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Rent Invoicing:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-foreground",
														children: engines.recurringBillingTimeQatar || "00:15 AST (1st of month)"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between py-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Asset Depreciation:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-foreground",
														children: engines.assetDepreciationTimeQatar || "00:30 AST (1st of month)"
													})]
												})
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
									className: "bg-gradient-to-br from-card to-card/50 border border-rose-500/20 shadow-sm hover:shadow-md transition-all group relative overflow-hidden",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all pointer-events-none" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
											className: "pb-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-xs font-semibold text-muted-foreground uppercase tracking-wider",
													children: "Security Tier"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														className: "bg-rose-500/15 text-rose-600 border-rose-500/20 text-[10px]",
														children: "Zero-Trust"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														variant: "ghost",
														size: "sm",
														onClick: () => setEditModalSection("security"),
														className: "h-7 px-2 text-xs text-rose-500 font-semibold hover:bg-rose-500/10 gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "h-3 w-3" }), " Edit"]
													})]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
												className: "text-lg font-bold text-foreground mt-1",
												children: "Immutable Audit & RLS"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
											className: "space-y-2 text-xs text-muted-foreground",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between py-1 border-b border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2FA Enforced (Super Admin):" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-emerald-600",
														children: security.enforce2FASuperAdmin ? "Yes" : "No"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between py-1 border-b border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Rate Limit:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-semibold text-foreground",
														children: [security.apiRateLimitPerMinute || 60, " req/min"]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between py-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Audit Logging:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-emerald-600",
														children: "Active (PostgreSQL)"
													})]
												})
											]
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border border-border/80 shadow-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-3 border-b border-border/40",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
										className: "text-base font-semibold",
										children: "Live In-App System Alerts & Engagement Trail"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
										className: "text-xs",
										children: "Broadcast history, delivery status, and user engagement metrics"
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									onClick: () => setShowBroadcastModal(true),
									className: "gap-2 text-xs font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3.5 w-3.5" }), " Push New Alert"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "pt-4",
								children: inAppNotifs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center py-8 text-muted-foreground text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-8 w-8 mx-auto mb-2 opacity-40" }), "No system notifications broadcasted yet. Push your first alert above."]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "divide-y divide-border/40 space-y-2",
									children: inAppNotifs.slice(0, 6).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
													title: "User Views / Reads",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3 w-3" }),
														" ",
														n.engagement_count || 0,
														" views"
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "flex items-center gap-0.5 text-indigo-600",
													title: "CTA Button Clicks",
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
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "branding",
						className: "space-y-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border border-border/80 shadow-sm bg-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								className: "pb-4 border-b border-border/40",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-5 w-5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
												className: "text-base font-bold",
												children: "Corporate Identity & Entity Details"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: "bg-primary/10 text-primary border-primary/20 text-[10px] uppercase font-bold",
												children: "Legal & Display"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
											className: "text-xs text-muted-foreground",
											children: "Official branding, tax, and commercial registration details reflected across contracts and invoices"
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => setEditModalSection("branding"),
										className: "gap-2 text-xs font-semibold h-9 shadow-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "h-3.5 w-3.5" }), " Edit Identity"]
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "pt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 md:grid-cols-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayField, {
											label: "Platform Brand Name",
											value: identity.platformName
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayField, {
											label: "Legal Company Name (Entity)",
											value: identity.companyName
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayField, {
											label: "Official Support Email",
											value: identity.supportEmail
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayField, {
											label: "Official Support Phone",
											value: identity.supportPhone
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayField, {
											label: "Commercial Registration No (CR)",
											value: identity.commercialRegistrationNo
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayField, {
											label: "Tax Identification Number (TIN)",
											value: identity.taxRegistrationNo
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "md:col-span-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayField, {
												label: "Platform Header Tagline",
												value: identity.tagline
											})
										})
									]
								})
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "localization",
						className: "space-y-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border border-border/80 shadow-sm bg-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								className: "pb-4 border-b border-border/40",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "h-5 w-5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
												className: "text-base font-bold",
												children: "Regional Standards & Fiscal Rules (Qatar / GCC)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] uppercase font-bold",
												children: "Qatar Standard"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
											className: "text-xs text-muted-foreground",
											children: "Enforces currency codes, timezone calculations, and date formatting for financial postings"
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => setEditModalSection("localization"),
										className: "gap-2 text-xs font-semibold h-9 shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "h-3.5 w-3.5" }), " Edit Regional Settings"]
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "pt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-4 md:grid-cols-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayField, {
											label: "Default Timezone",
											value: `${localization.defaultTimezone || "Asia/Qatar"} (UTC+3)`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayField, {
											label: "Default Currency",
											value: `${localization.defaultCurrency || "QAR"} (${localization.currencySymbol || "QR"})`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayField, {
											label: "Date Format Standard",
											value: localization.dateFormat || "DD/MM/YYYY"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayField, {
											label: "Fiscal Year Start Month",
											value: localization.fiscalYearStartMonth === 1 ? "January (Calendar Year)" : `Month ${localization.fiscalYearStartMonth}`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayField, {
											label: "Locale Number Format",
											value: localization.numberFormat || "en-QA"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DisplayField, {
											label: "Active Status",
											value: "Enforced Platform-Wide"
										})
									]
								})
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "engines",
						className: "space-y-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border border-border/80 shadow-sm bg-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								className: "pb-4 border-b border-border/40",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "h-5 w-5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
												className: "text-base font-bold",
												children: "Automated Engine Execution & Business Rules"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												className: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 text-[10px] uppercase font-bold",
												children: [4 + (engines.customAutomations?.length || 0), " Total Engines"]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
											className: "text-xs text-muted-foreground",
											children: "Manage automated background processes, turn rules on/off, calibrate execution schedules, and add custom cron jobs"
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex items-center gap-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											onClick: () => setEditModalSection("engine_custom"),
											className: "gap-1.5 text-xs font-semibold h-9 shadow-sm bg-indigo-600 hover:bg-indigo-700 text-white",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add New Automation"]
										})
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "pt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-6 md:grid-cols-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: `p-4 rounded-xl border transition-all space-y-3 ${engines.pdcClearingEnabled !== false ? "border-emerald-500/40 bg-emerald-500/5" : "border-border/60 bg-muted/20 opacity-75"}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-emerald-600" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
															className: "text-sm font-bold text-foreground",
															children: "Daily PDC Clearing Engine"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															className: engines.pdcClearingEnabled !== false ? "bg-emerald-500/15 text-emerald-600 text-[10px]" : "bg-muted text-muted-foreground text-[10px]",
															children: engines.pdcClearingEnabled !== false ? "ENABLED" : "OFF / DISABLED"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
															type: "checkbox",
															checked: engines.pdcClearingEnabled !== false,
															onChange: () => handleToggleEngine("pdcClearingEnabled", engines.pdcClearingEnabled !== false),
															className: "h-4 w-4 rounded text-emerald-600 cursor-pointer",
															title: "Toggle PDC Clearing Engine On/Off"
														})]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted-foreground leading-relaxed",
													children: "Evaluates deposited cheques daily and marks matured PDCs as Cleared, generating double-entry journal vouchers automatically."
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between pt-2 text-xs border-t border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-muted-foreground font-medium",
														children: ["Timing: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-foreground font-bold",
															children: engines.pdcClearingTimeQatar || "00:05 AST"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														variant: "outline",
														size: "sm",
														onClick: () => setEditModalSection("engine_pdc"),
														className: "h-7 px-2.5 text-xs font-semibold gap-1 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/10",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "h-3 w-3" }), " Edit Engine"]
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: `p-4 rounded-xl border transition-all space-y-3 ${engines.recurringBillingEnabled !== false ? "border-indigo-500/40 bg-indigo-500/5" : "border-border/60 bg-muted/20 opacity-75"}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-indigo-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
															className: "text-sm font-bold text-foreground",
															children: "Recurring Rent Billing Engine"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															className: engines.recurringBillingEnabled !== false ? "bg-indigo-500/15 text-indigo-600 text-[10px]" : "bg-muted text-muted-foreground text-[10px]",
															children: engines.recurringBillingEnabled !== false ? "ENABLED" : "OFF / DISABLED"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
															type: "checkbox",
															checked: engines.recurringBillingEnabled !== false,
															onChange: () => handleToggleEngine("recurringBillingEnabled", engines.recurringBillingEnabled !== false),
															className: "h-4 w-4 rounded text-indigo-600 cursor-pointer",
															title: "Toggle Rent Billing Engine On/Off"
														})]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted-foreground leading-relaxed",
													children: "Automatically generates monthly rent tax invoices for all active lease contracts across all registered properties and units."
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between pt-2 text-xs border-t border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-muted-foreground font-medium",
														children: ["Timing: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-foreground font-bold",
															children: engines.recurringBillingTimeQatar || "00:15 AST (1st of month)"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														variant: "outline",
														size: "sm",
														onClick: () => setEditModalSection("engine_rent"),
														className: "h-7 px-2.5 text-xs font-semibold gap-1 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/10",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "h-3 w-3" }), " Edit Engine"]
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: `p-4 rounded-xl border transition-all space-y-3 ${engines.assetDepreciationEnabled !== false ? "border-violet-500/40 bg-violet-500/5" : "border-border/60 bg-muted/20 opacity-75"}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-violet-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
															className: "text-sm font-bold text-foreground",
															children: "Fixed Asset Depreciation Engine"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															className: engines.assetDepreciationEnabled !== false ? "bg-violet-500/15 text-violet-600 text-[10px]" : "bg-muted text-muted-foreground text-[10px]",
															children: engines.assetDepreciationEnabled !== false ? "ENABLED" : "OFF / DISABLED"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
															type: "checkbox",
															checked: engines.assetDepreciationEnabled !== false,
															onChange: () => handleToggleEngine("assetDepreciationEnabled", engines.assetDepreciationEnabled !== false),
															className: "h-4 w-4 rounded text-violet-600 cursor-pointer",
															title: "Toggle Asset Depreciation Engine On/Off"
														})]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted-foreground leading-relaxed",
													children: "Straight-Line monthly asset depreciation posted directly to General Ledger accounts (`fin_vouchers`) at close of month."
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between pt-2 text-xs border-t border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-muted-foreground font-medium",
														children: ["Timing: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-foreground font-bold",
															children: engines.assetDepreciationTimeQatar || "00:30 AST (1st of month)"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														variant: "outline",
														size: "sm",
														onClick: () => setEditModalSection("engine_depreciation"),
														className: "h-7 px-2.5 text-xs font-semibold gap-1 text-violet-700 dark:text-violet-300 border-violet-500/30 hover:bg-violet-500/10",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "h-3 w-3" }), " Edit Engine"]
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-4 rounded-xl border border-amber-500/40 bg-amber-500/5 space-y-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "h-4 w-4 text-amber-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
															className: "text-sm font-bold text-foreground",
															children: "Lease Penalty & Grace Parameters"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														className: "bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[10px]",
														children: "ACTIVE POLICY"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-3 gap-2 pt-1 text-center",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "p-2 rounded-lg bg-background border border-border/40",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[10px] text-muted-foreground",
																children: "Grace"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																className: "text-sm font-bold text-foreground",
																children: [engines.gracePeriodDays ?? 5, " Days"]
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "p-2 rounded-lg bg-background border border-border/40",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[10px] text-muted-foreground",
																children: "Late Fee"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																className: "text-sm font-bold text-foreground",
																children: [engines.latePenaltyPercentage ?? 2.5, "%"]
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "p-2 rounded-lg bg-background border border-border/40",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-[10px] text-muted-foreground",
																children: "Renewal"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																className: "text-sm font-bold text-foreground",
																children: [engines.leaseExpiryNoticeDays ?? 60, " Days"]
															})]
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between pt-2 text-xs border-t border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Applies to All Tenancies"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														variant: "outline",
														size: "sm",
														onClick: () => setEditModalSection("engine_penalty"),
														className: "h-7 px-2.5 text-xs font-semibold gap-1 text-amber-700 dark:text-amber-300 border-amber-500/30 hover:bg-amber-500/10",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "h-3 w-3" }), " Edit Parameters"]
													})]
												})
											]
										}),
										engines.customAutomations && engines.customAutomations.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: `p-4 rounded-xl border transition-all space-y-3 ${item.enabled ? "border-primary/40 bg-primary/5" : "border-border/60 bg-muted/20 opacity-75"}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "h-4 w-4 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
															className: "text-sm font-bold text-foreground",
															children: item.name
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															className: item.enabled ? "bg-primary/15 text-primary text-[10px]" : "bg-muted text-muted-foreground text-[10px]",
															children: item.enabled ? "ENABLED" : "OFF"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
															type: "checkbox",
															checked: item.enabled,
															onChange: () => handleToggleCustomEngine(item.id),
															className: "h-4 w-4 rounded text-primary cursor-pointer",
															title: "Toggle Custom Automation On/Off"
														})]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted-foreground leading-relaxed",
													children: item.description
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between pt-2 text-xs border-t border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-muted-foreground font-medium",
														children: ["Module: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-foreground font-bold",
															children: item.targetModule
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-muted-foreground font-medium",
														children: ["Timing: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-foreground font-bold",
															children: item.executionTimeQatar
														})]
													})]
												})
											]
										}, item.id))
									]
								})
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "security",
						className: "space-y-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border border-border/80 shadow-sm bg-card",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								className: "pb-4 border-b border-border/40",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-5 w-5" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
												className: "text-base font-bold",
												children: "Zero-Trust Security Policies & Access Controls"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: "bg-rose-500/10 text-rose-600 border-rose-500/20 text-[10px] uppercase font-bold",
												children: "Zero-Trust"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
											className: "text-xs text-muted-foreground",
											children: "Multi-Factor authentication, rate limits, session timeout, and third-party gateway configurations"
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => setEditModalSection("security"),
										className: "gap-2 text-xs font-semibold h-9 shadow-sm bg-rose-600 hover:bg-rose-700 text-white",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SquarePen, { className: "h-3.5 w-3.5" }), " Edit Security Policies"]
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "pt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-6 md:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
											className: "text-sm font-bold text-foreground flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-4 w-4 text-rose-500" }), " Platform Security Rules"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2 text-xs",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between py-1.5 border-b border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Enforce 2FA (Super Admin):"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-bold text-emerald-600",
														children: security.enforce2FASuperAdmin ? "Enforced" : "Disabled"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between py-1.5 border-b border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Enforce 2FA (Internal Staff):"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-bold text-foreground",
														children: security.enforce2FAStaff ? "Enforced" : "Optional"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between py-1.5 border-b border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "API Rate Limiting:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-bold text-foreground",
														children: [security.apiRateLimitPerMinute || 60, " req/min"]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between py-1.5 border-b border-border/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Session Inactivity Timeout:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-bold text-foreground",
														children: [security.sessionTimeoutMinutes || 480, " minutes"]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between py-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Security Audit Trail:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-bold text-emerald-600",
														children: "Active (PostgreSQL Immutable Table)"
													})]
												})
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-4 rounded-xl border border-border/60 bg-muted/20 space-y-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
											className: "text-sm font-bold text-foreground flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { className: "h-4 w-4 text-primary" }), " Third-Party Integrations Status"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-background",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs font-semibold",
														children: "QPay Gateway (Qatar NAPS)"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[11px] text-muted-foreground font-mono",
														children: integrations.qpayMerchantId || "QPAY-MCH-98214"
													})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														className: integrations.qpayEnabled ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground",
														children: integrations.qpayEnabled ? "Connected" : "Disabled"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-background",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs font-semibold",
														children: "SendGrid Email Gateway"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[11px] text-muted-foreground font-mono",
														children: integrations.sendgridSenderEmail || "noreply@zyno.qa"
													})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														className: integrations.sendgridConfigured ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground",
														children: integrations.sendgridConfigured ? "Connected" : "Disabled"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-background",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs font-semibold",
														children: "Supabase Storage Buckets"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-[11px] text-muted-foreground font-mono",
														children: "property-images, receipts, leases"
													})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														className: "bg-emerald-500/15 text-emerald-600",
														children: "Active (4 Buckets)"
													})]
												})
											]
										})]
									})]
								})
							})]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: editModalSection === "localization",
				onOpenChange: (open) => !open && setEditModalSection(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[580px] border border-primary/30 shadow-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/25",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Languages, { className: "h-6 w-6" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-xl font-bold tracking-tight",
									children: "Edit Regional Standards (Qatar / GCC)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "text-xs text-muted-foreground",
									children: "Modify currency standards, timezone calculation baselines, and fiscal reporting dates."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 py-3 md:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Timezone Standard"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: localization.defaultTimezone || "Asia/Qatar",
										onChange: (e) => setLocalization({
											...localization,
											defaultTimezone: e.target.value
										}),
										className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Asia/Qatar",
												children: "Asia/Qatar (AST +3 — Default)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Asia/Riyadh",
												children: "Asia/Riyadh (AST +3)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "Asia/Dubai",
												children: "Asia/Dubai (GST +4)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "UTC",
												children: "UTC (Universal Time)"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Currency Code"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: localization.defaultCurrency || "QAR",
										onChange: (e) => {
											const sym = e.target.value === "QAR" ? "QR" : e.target.value === "SAR" ? "SR" : e.target.value === "AED" ? "AED" : "$";
											setLocalization({
												...localization,
												defaultCurrency: e.target.value,
												currencySymbol: sym
											});
										},
										className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "QAR",
												children: "QAR — Qatari Riyal (Recommended)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "SAR",
												children: "SAR — Saudi Riyal"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "AED",
												children: "AED — UAE Dirham"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "USD",
												children: "USD — US Dollar"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Currency Symbol"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: localization.currencySymbol || "QR",
										onChange: (e) => setLocalization({
											...localization,
											currencySymbol: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Date Format"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: localization.dateFormat || "DD/MM/YYYY",
										onChange: (e) => setLocalization({
											...localization,
											dateFormat: e.target.value
										}),
										className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "DD/MM/YYYY",
												children: "DD/MM/YYYY (Qatar / UK)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "YYYY-MM-DD",
												children: "YYYY-MM-DD (ISO 8601)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "MM/DD/YYYY",
												children: "MM/DD/YYYY (US Format)"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Fiscal Year Start Month"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: localization.fiscalYearStartMonth || 1,
										onChange: (e) => setLocalization({
											...localization,
											fiscalYearStartMonth: Number(e.target.value)
										}),
										className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: 1,
												children: "January (Calendar Year)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: 4,
												children: "April (Q2 Fiscal)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: 7,
												children: "July (Mid-Year)"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Locale Number Format"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: localization.numberFormat || "en-QA",
										onChange: (e) => setLocalization({
											...localization,
											numberFormat: e.target.value
										}),
										placeholder: "en-QA"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "pt-3 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setEditModalSection(null),
								className: "text-xs",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: async () => {
									await handleSave("localization", "Localization Standards", localization);
									setEditModalSection(null);
								},
								disabled: savingSection === "localization",
								className: "bg-primary text-white text-xs font-semibold gap-2",
								children: [savingSection === "localization" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }), "Save Regional Settings"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: editModalSection === "engine_pdc",
				onOpenChange: (open) => !open && setEditModalSection(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[540px] border border-emerald-500/30 shadow-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/25",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-6 w-6" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-xl font-bold tracking-tight",
									children: "Configure Daily PDC Clearing Engine"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "text-xs text-muted-foreground",
									children: "Define execution schedule and active state for the automated cheque clearing cron."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold text-foreground",
									children: "Engine Active Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground",
									children: "Enables nightly evaluation of matured cheques in General Ledger"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: engines.pdcClearingEnabled !== false,
									onChange: (e) => setEngines({
										...engines,
										pdcClearingEnabled: e.target.checked
									}),
									className: "h-4 w-4 rounded text-emerald-600 cursor-pointer"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Nightly Execution Time (Qatar AST)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: engines.pdcClearingTimeQatar || "00:05 AST",
									onChange: (e) => setEngines({
										...engines,
										pdcClearingTimeQatar: e.target.value
									}),
									className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "00:05 AST",
											children: "00:05 AST (5 min past midnight — Recommended)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "00:15 AST",
											children: "00:15 AST"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "01:00 AST",
											children: "01:00 AST (1:00 AM)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "06:00 AST",
											children: "06:00 AST (6:00 AM Morning)"
										})
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "pt-3 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setEditModalSection(null),
								className: "text-xs",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: async () => {
									await handleSave("engine_automations", "PDC Clearing Engine", engines);
									setEditModalSection(null);
								},
								disabled: savingSection === "engine_automations",
								className: "bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold gap-2",
								children: [savingSection === "engine_automations" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }), "Save PDC Engine"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: editModalSection === "engine_rent",
				onOpenChange: (open) => !open && setEditModalSection(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[540px] border border-indigo-500/30 shadow-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-6 w-6" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-xl font-bold tracking-tight",
									children: "Configure Rent Invoicing Engine"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "text-xs text-muted-foreground",
									children: "Define monthly recurring rent billing timing and enabled state for all tenant lease contracts."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold text-foreground",
									children: "Engine Active Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground",
									children: "Enables automated monthly invoice generation for active leases"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: engines.recurringBillingEnabled !== false,
									onChange: (e) => setEngines({
										...engines,
										recurringBillingEnabled: e.target.checked
									}),
									className: "h-4 w-4 rounded text-indigo-600 cursor-pointer"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Recurring Invoicing Schedule (Qatar AST)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: engines.recurringBillingTimeQatar || "00:15 AST (1st of month)",
									onChange: (e) => setEngines({
										...engines,
										recurringBillingTimeQatar: e.target.value
									}),
									className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "00:15 AST (1st of month)",
											children: "1st of every month at 00:15 AST (Standard)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "01:00 AST (1st of month)",
											children: "1st of every month at 01:00 AST"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "25th of month (Advance)",
											children: "25th of preceding month (Advance Billing)"
										})
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "pt-3 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setEditModalSection(null),
								className: "text-xs",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: async () => {
									await handleSave("engine_automations", "Recurring Rent Invoicing Engine", engines);
									setEditModalSection(null);
								},
								disabled: savingSection === "engine_automations",
								className: "bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-2",
								children: [savingSection === "engine_automations" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }), "Save Rent Engine"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: editModalSection === "engine_depreciation",
				onOpenChange: (open) => !open && setEditModalSection(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[540px] border border-violet-500/30 shadow-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-12 w-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/25",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-6 w-6" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-xl font-bold tracking-tight",
									children: "Configure Asset Depreciation Engine"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "text-xs text-muted-foreground",
									children: "Define monthly straight-line depreciation journal posting timing."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-semibold text-foreground",
									children: "Engine Active Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground",
									children: "Enables automated monthly depreciation journal postings to General Ledger"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: engines.assetDepreciationEnabled !== false,
									onChange: (e) => setEngines({
										...engines,
										assetDepreciationEnabled: e.target.checked
									}),
									className: "h-4 w-4 rounded text-violet-600 cursor-pointer"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs font-semibold",
									children: "Depreciation Posting Timing (Qatar AST)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: engines.assetDepreciationTimeQatar || "00:30 AST (1st of month)",
									onChange: (e) => setEngines({
										...engines,
										assetDepreciationTimeQatar: e.target.value
									}),
									className: "w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "00:30 AST (1st of month)",
										children: "1st of every month at 00:30 AST (Standard)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Last day of month 23:59 AST",
										children: "Last day of month at 23:59 AST (Month-End Close)"
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "pt-3 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setEditModalSection(null),
								className: "text-xs",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: async () => {
									await handleSave("engine_automations", "Asset Depreciation Engine", engines);
									setEditModalSection(null);
								},
								disabled: savingSection === "engine_automations",
								className: "bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold gap-2",
								children: [savingSection === "engine_automations" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }), "Save Depreciation Engine"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: editModalSection === "engine_penalty",
				onOpenChange: (open) => !open && setEditModalSection(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[540px] border border-amber-500/30 shadow-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-12 w-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/25",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersVertical, { className: "h-6 w-6" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-xl font-bold tracking-tight",
									children: "Configure Lease Penalty & Grace Parameters"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "text-xs text-muted-foreground",
									children: "Adjust grace period days, late payment penalty surcharge %, and advance lease expiration notices."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Grace Period (Days)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: engines.gracePeriodDays ?? 5,
											onChange: (e) => setEngines({
												...engines,
												gracePeriodDays: Number(e.target.value)
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Late Penalty (%)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											step: "0.1",
											value: engines.latePenaltyPercentage ?? 2.5,
											onChange: (e) => setEngines({
												...engines,
												latePenaltyPercentage: Number(e.target.value)
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Renewal Notice (Days)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: engines.leaseExpiryNoticeDays ?? 60,
											onChange: (e) => setEngines({
												...engines,
												leaseExpiryNoticeDays: Number(e.target.value)
											})
										})]
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "pt-3 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setEditModalSection(null),
								className: "text-xs",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: async () => {
									await handleSave("engine_automations", "Lease Penalty & Grace Parameters", engines);
									setEditModalSection(null);
								},
								disabled: savingSection === "engine_automations",
								className: "bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold gap-2",
								children: [savingSection === "engine_automations" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }), "Save Parameters"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: editModalSection === "engine_custom",
				onOpenChange: (open) => !open && setEditModalSection(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[580px] border border-indigo-500/30 shadow-2xl bg-card",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
						className: "space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-6 w-6" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-xl font-bold tracking-tight",
								children: "Add New Automation Rule"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: "Define a new automated background task, execution time, and target operational module."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleCreateCustomAutomation,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Automation Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: newAutomationForm.name,
										onChange: (e) => setNewAutomationForm({
											...newAutomationForm,
											name: e.target.value
										}),
										placeholder: "e.g. Utility Charge Reconciliation Engine",
										required: true
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Description"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										rows: 3,
										value: newAutomationForm.description,
										onChange: (e) => setNewAutomationForm({
											...newAutomationForm,
											description: e.target.value
										}),
										placeholder: "Explain the background operation performed by this automation...",
										required: true
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Target Module"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: newAutomationForm.targetModule,
											onChange: (e) => setNewAutomationForm({
												...newAutomationForm,
												targetModule: e.target.value
											}),
											className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Core Finance & Ledger",
													children: "Core Finance & Ledger"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Lease Contracts & Renewals",
													children: "Lease Contracts & Renewals"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Maintenance & Work Orders",
													children: "Maintenance & Work Orders"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "Tenant Invoicing & Collection",
													children: "Tenant Invoicing & Collection"
												})
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Frequency"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											value: newAutomationForm.frequency,
											onChange: (e) => setNewAutomationForm({
												...newAutomationForm,
												frequency: e.target.value
											}),
											className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "daily",
													children: "Daily (Qatar Midnight AST)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "monthly",
													children: "Monthly (1st of Month)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "weekly",
													children: "Weekly (Every Sunday)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
													value: "custom",
													children: "Custom Timing"
												})
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Execution Timing (AST)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										value: newAutomationForm.executionTimeQatar,
										onChange: (e) => setNewAutomationForm({
											...newAutomationForm,
											executionTimeQatar: e.target.value
										}),
										className: "w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "00:00 AST",
												children: "00:00 AST (Midnight)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "00:45 AST",
												children: "00:45 AST"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "01:30 AST",
												children: "01:30 AST"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "06:00 AST",
												children: "06:00 AST (Morning)"
											})
										]
									})]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "pt-3 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								onClick: () => setEditModalSection(null),
								className: "text-xs",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								disabled: savingSection === "engine_automations",
								className: "bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold gap-2",
								children: [savingSection === "engine_automations" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), "Create Automation"]
							})]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: editModalSection === "security",
				onOpenChange: (open) => !open && setEditModalSection(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[580px] border border-rose-500/30 shadow-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-12 w-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/25",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-6 w-6" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-xl font-bold tracking-tight",
									children: "Edit Zero-Trust Security Policies"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "text-xs text-muted-foreground",
									children: "Configure 2FA mandates, rate limits, session timeouts, and immutable logging rules."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/20",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-semibold",
											children: "Enforce 2FA for Super Admins"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground",
											children: "Requires mandatory OTP / Authenticator App"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: security.enforce2FASuperAdmin ?? true,
											onChange: (e) => setSecurity({
												...security,
												enforce2FASuperAdmin: e.target.checked
											}),
											className: "h-4 w-4 rounded text-primary focus:ring-primary"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/20",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-semibold",
											children: "Enforce 2FA for Property Managers & Finance"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground",
											children: "Mandatory OTP for staff roles"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: security.enforce2FAStaff ?? false,
											onChange: (e) => setSecurity({
												...security,
												enforce2FAStaff: e.target.checked
											}),
											className: "h-4 w-4 rounded text-primary focus:ring-primary"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/20",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-semibold",
											children: "Strict XSS & SQLi Sanitization Guard"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground",
											children: "Sanitizes all payload mutations automatically"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											checked: security.strictXSSSanitization ?? true,
											onChange: (e) => setSecurity({
												...security,
												strictXSSSanitization: e.target.checked
											}),
											className: "h-4 w-4 rounded text-primary focus:ring-primary"
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3 pt-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "API Rate Limit (Req / Min)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: security.apiRateLimitPerMinute ?? 60,
										onChange: (e) => setSecurity({
											...security,
											apiRateLimitPerMinute: Number(e.target.value)
										})
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Session Timeout (Minutes)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: security.sessionTimeoutMinutes ?? 480,
										onChange: (e) => setSecurity({
											...security,
											sessionTimeoutMinutes: Number(e.target.value)
										})
									})]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "pt-3 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setEditModalSection(null),
								className: "text-xs",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: async () => {
									await handleSave("security_policies", "Security Policies", security);
									setEditModalSection(null);
								},
								disabled: savingSection === "security_policies",
								className: "bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold gap-2",
								children: [savingSection === "security_policies" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }), "Save Security Policies"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: editModalSection === "branding",
				onOpenChange: (open) => !open && setEditModalSection(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[620px] border border-primary/30 shadow-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/25",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-6 w-6" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-xl font-bold tracking-tight",
									children: "Edit Corporate Identity & Branding"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "text-xs text-muted-foreground",
									children: "Update legal entity details, official tax numbers, and contact information."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 py-3 md:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Brand Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: identity.platformName || "",
										onChange: (e) => setIdentity({
											...identity,
											platformName: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Legal Company Name"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: identity.companyName || "",
										onChange: (e) => setIdentity({
											...identity,
											companyName: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Official Support Email"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "email",
										value: identity.supportEmail || "",
										onChange: (e) => setIdentity({
											...identity,
											supportEmail: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Official Support Phone"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: identity.supportPhone || "",
										onChange: (e) => setIdentity({
											...identity,
											supportPhone: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "CR Registration Number"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: identity.commercialRegistrationNo || "",
										onChange: (e) => setIdentity({
											...identity,
											commercialRegistrationNo: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "TIN Tax Number"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: identity.taxRegistrationNo || "",
										onChange: (e) => setIdentity({
											...identity,
											taxRegistrationNo: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5 md:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Platform Header Tagline"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: identity.tagline || "",
										onChange: (e) => setIdentity({
											...identity,
											tagline: e.target.value
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "pt-3 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setEditModalSection(null),
								className: "text-xs",
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: async () => {
									await handleSave("platform_identity", "Platform Identity", identity);
									setEditModalSection(null);
								},
								disabled: savingSection === "platform_identity",
								className: "bg-primary text-white text-xs font-semibold gap-2",
								children: [savingSection === "platform_identity" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3.5 w-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }), "Save Identity"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!savedSuccessModal,
				onOpenChange: () => setSavedSuccessModal(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-[440px] text-center border border-emerald-500/30 bg-card p-6 shadow-2xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center text-emerald-600 mx-auto mb-3 shadow-lg shadow-emerald-500/15",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "h-8 w-8" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "text-lg font-bold text-foreground",
							children: savedSuccessModal?.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs text-muted-foreground mt-2 leading-relaxed",
							children: savedSuccessModal?.desc
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pt-5",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => setSavedSuccessModal(null),
								className: "w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md",
								children: "Continue Working"
							})
						})
					]
				})
			})
		]
	});
}
//#endregion
export { ConfigPage as component };
