import { i as __toESM } from "../_runtime.mjs";
import { I as fetchUnits, T as fetchMaintenanceTickets, U as updateMaintenanceTicket, f as fetchAllProperties, k as fetchProperties } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $t as CircleCheck, A as ShieldCheck, Bt as DollarSign, Dt as File, E as ShoppingCart, F as Send, G as Plus, Gt as Clock, H as Receipt, Ht as CreditCard, I as Search, Kt as ClipboardList, Mt as FileCheck, Ot as FileUp, Pt as Eye, V as RefreshCw, X as Paperclip, Z as Package, b as Star, ct as LoaderCircle, en as CircleCheckBig, f as UserCheck, fn as Calendar, gn as Building2, gt as Info, h as TriangleAlert, in as ChevronRight, kt as FileText, n as X, nt as MessageSquare, p as Upload, r as Wrench, s as Users, st as Lock, tn as CircleAlert, wt as Globe } from "../_libs/lucide-react.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { f as properties, m as units } from "./mock-data-B9OWnoA7.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DJOO1b-0.mjs";
import { t as ApInvoicesApi } from "./proc-invoices-api-BBGs9sGK.mjs";
import { n as SwitchThumb, t as Switch$1 } from "../_libs/radix-ui__react-switch.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/maintenance-module-BdWb_ADZ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Switch = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch$1, {
	className: cn("peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input", className),
	...props,
	ref,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SwitchThumb, { className: cn("pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0") })
}));
Switch.displayName = Switch$1.displayName;
var MOCK_HOST_ID = "00000000-0000-4000-8000-000000000001";
var TICKET_CATEGORIES = [
	"Carpenter",
	"CCTV",
	"Civil & Structural",
	"Door Issue",
	"Electrician",
	"Elevator / Lift",
	"Fire & Safety",
	"Groutin",
	"Housekeeping",
	"HVAC & Chillers",
	"Intercom",
	"Mason",
	"Painter",
	"Plumber",
	"Security",
	"Other"
];
var PROPERTY_UNITS = {
	"Al Sadd Commercial Tower": [
		"Office 101",
		"Office 102",
		"Office 201",
		"Office 305",
		"Office 402",
		"Retail Shop 1",
		"Retail Shop 2",
		"B2 Pump Room",
		"Main Chiller Plant Room",
		"Common Area Corridor"
	],
	"Lusail Marina Heights": [
		"Apt 101",
		"Apt 204",
		"Apt 502",
		"Apt 801",
		"Apt 1204",
		"Penthouse 1",
		"Basement Parking B1",
		"Lobby & Reception",
		"Gym & Club"
	],
	"West Bay Pearl Residence": [
		"Apt 301",
		"Apt 405",
		"Apt 702",
		"Apt 1103",
		"Apt 1502",
		"Building Pump Room B2",
		"Elevator Shaft 2",
		"Common Corridor"
	],
	"Doha Port Logistics Park": [
		"Warehouse A1",
		"Warehouse A2",
		"Loading Bay 3",
		"Office Block B",
		"Security Gate 1"
	]
};
var PROPERTIES_LIST = Object.keys(PROPERTY_UNITS);
var MAINTENANCE_GL_ACCOUNTS = [
	{
		code: "52100001",
		name: "Building Repairs & Structural Maintenance Opex",
		category: "OPEX"
	},
	{
		code: "52100002",
		name: "HVAC & Central Chiller Plant Servicing",
		category: "OPEX"
	},
	{
		code: "52100003",
		name: "Elevator & Escalator Statutory Maintenance",
		category: "OPEX"
	},
	{
		code: "52100004",
		name: "Fire Protection & Safety Systems Maintenance",
		category: "OPEX"
	},
	{
		code: "52100005",
		name: "Plumbing, Pumps & Drainage Systems",
		category: "OPEX"
	},
	{
		code: "52100006",
		name: "Electrical Switchgear & Lighting Fixtures",
		category: "OPEX"
	},
	{
		code: "52100007",
		name: "Civil Works, Carpentry & Painting Maintenance",
		category: "OPEX"
	},
	{
		code: "52100008",
		name: "Tenant Recoverable Damage & Chargeback Clearing",
		category: "RECOVERABLE"
	},
	{
		code: "11200001",
		name: "Tenant Accounts Receivable (Trade Debtors)",
		category: "ASSET"
	},
	{
		code: "21200001",
		name: "Tenant Security Deposits Held (Escrow Liability)",
		category: "LIABILITY"
	},
	{
		code: "41300002",
		name: "Tenant Damage Recharge & Admin Surcharge Income",
		category: "REVENUE"
	},
	{
		code: "12400001",
		name: "Internal Maintenance Warehouse Stock Asset",
		category: "ASSET"
	}
];
var COST_CENTERS = [
	{
		code: "CC-101",
		name: "Property Operations & Facility Management"
	},
	{
		code: "CC-102",
		name: "MEP Technical Engineering Services"
	},
	{
		code: "CC-103",
		name: "Common Area Maintenance (CAM)"
	},
	{
		code: "CC-104",
		name: "Tenant Fit-Out & Reactive Maintenance"
	}
];
function SearchableSelect({ value, onValueChange, options, placeholder = "Select option...", searchPlaceholder = "Search...", className = "" }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [search, setSearch] = (0, import_react.useState)("");
	const filtered = options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()) || opt.value.toLowerCase().includes(search.toLowerCase()) || opt.subtext && opt.subtext.toLowerCase().includes(search.toLowerCase()));
	const selectedOption = options.find((opt) => opt.value === value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `relative ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: () => setOpen((prev) => !prev),
			className: "flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs cursor-pointer hover:bg-muted/40 transition-colors",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: selectedOption ? "text-foreground font-medium truncate" : "text-muted-foreground truncate",
				children: selectedOption ? selectedOption.label : placeholder
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-3 w-3 text-muted-foreground shrink-0 ml-1.5 opacity-60" })]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-40",
			onClick: () => setOpen(false)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute left-0 right-0 top-full mt-1 z-50 rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg max-h-56 overflow-hidden flex flex-col min-w-[280px]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-1 border-b border-border/60 flex items-center gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-3 w-3 text-muted-foreground shrink-0" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "text",
						autoFocus: true,
						placeholder: searchPlaceholder,
						value: search,
						onChange: (e) => setSearch(e.target.value),
						className: "w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/70"
					}),
					search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setSearch(""),
						className: "text-[10px] text-muted-foreground hover:text-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-y-auto max-h-44 py-1",
				children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-2 text-center text-[11px] text-muted-foreground",
					children: "No matches found"
				}) : filtered.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onClick: () => {
						onValueChange(opt.value);
						setOpen(false);
						setSearch("");
					},
					className: `flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer hover:bg-muted transition-colors ${opt.value === value ? "bg-orange-500/10 text-orange-600 font-semibold" : "text-foreground"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "truncate",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: opt.label }), opt.subtext && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[10px] text-muted-foreground ml-1.5 opacity-70",
							children: [
								"(",
								opt.subtext,
								")"
							]
						})]
					}), opt.value === value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 text-orange-600 shrink-0" })]
				}, opt.value))
			})]
		})] })]
	});
}
var COMPLAINT_AREAS = [
	"Property",
	"Unit (name)",
	"Commercial",
	"Common Area",
	"Entry Gate",
	"Exit Gate",
	"Facility Office",
	"Gym & Club",
	"Shop",
	"Security Office",
	"Parking"
];
var initialTickets = [];
var initialWorkOrders = [];
var initialPpmSchedules = [];
var initialTechnicians = [];
var initialVendorInvoices = [];
var initialStockCatalog = [];
var COLUMNS = [
	{
		key: "new",
		label: "New Request"
	},
	{
		key: "dispatched",
		label: "Dispatched"
	},
	{
		key: "scheduled",
		label: "Scheduled"
	},
	{
		key: "in_progress",
		label: "In Progress"
	},
	{
		key: "resolved",
		label: "Resolved / Closed"
	},
	{
		key: "cancelled",
		label: "Cancelled"
	}
];
var PRIORITY_STYLES = {
	low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
	medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
	high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
	urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
};
function MaintenanceModule({ role }) {
	const routerState = useRouterState();
	const activeTab = new URLSearchParams(routerState.location.search).get("tab") || "tickets";
	const [tickets, setTickets] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("pms_maintenance_tickets");
			return saved ? JSON.parse(saved) : initialTickets;
		} catch {
			return initialTickets;
		}
	});
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [workOrders, setWorkOrders] = (0, import_react.useState)(() => {
		return initialWorkOrders;
	});
	const [ppmSchedules, setPpmSchedules] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("pms_ppm_schedules");
			return saved ? JSON.parse(saved) : initialPpmSchedules;
		} catch {
			return initialPpmSchedules;
		}
	});
	const [technicians, setTechnicians] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("pms_technicians");
			return saved ? JSON.parse(saved) : initialTechnicians;
		} catch {
			return initialTechnicians;
		}
	});
	const [vendorInvoices, setVendorInvoices] = (0, import_react.useState)(() => {
		return initialVendorInvoices;
	});
	const [stockCatalog, setStockCatalog] = (0, import_react.useState)(() => {
		return initialStockCatalog;
	});
	const [properties$1, setProperties] = (0, import_react.useState)([]);
	const [units$1, setUnits] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		localStorage.removeItem("pms_work_orders");
		localStorage.removeItem("pms_vendor_invoices");
		localStorage.removeItem("pms_maintenance_stock");
	}, []);
	const [ticketSparePartsMap, setTicketSparePartsMap] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("pms_ticket_spare_parts");
			return saved ? JSON.parse(saved) : {};
		} catch {
			return {};
		}
	});
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("pms_ticket_spare_parts", JSON.stringify(ticketSparePartsMap));
		} catch (e) {
			console.error("Failed to save ticketSparePartsMap to localStorage", e);
		}
	}, [ticketSparePartsMap]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("pms_vendor_invoices", JSON.stringify(vendorInvoices));
		} catch (e) {
			console.error("Failed to save vendorInvoices to localStorage", e);
		}
	}, [vendorInvoices]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("pms_work_orders", JSON.stringify(workOrders));
		} catch (e) {
			console.error("Failed to save workOrders to localStorage", e);
		}
	}, [workOrders]);
	(0, import_react.useEffect)(() => {
		const handleInvoiceSync = () => {
			try {
				const saved = localStorage.getItem("pms_vendor_invoices");
				if (saved) setVendorInvoices(JSON.parse(saved));
			} catch {}
		};
		window.addEventListener("pms_vendor_invoices_updated", handleInvoiceSync);
		window.addEventListener("finance_vouchers_updated", handleInvoiceSync);
		window.addEventListener("ap_invoices_updated", handleInvoiceSync);
		return () => {
			window.removeEventListener("pms_vendor_invoices_updated", handleInvoiceSync);
			window.removeEventListener("finance_vouchers_updated", handleInvoiceSync);
			window.removeEventListener("ap_invoices_updated", handleInvoiceSync);
		};
	}, []);
	const dynamicPropertyList = (0, import_react.useMemo)(() => {
		const list = [];
		properties$1.forEach((p) => {
			if (p.title) list.push(p.title);
			const anyP = p;
			if (anyP.name && !list.includes(anyP.name)) list.push(anyP.name);
			if (anyP.code && !list.includes(anyP.code)) list.push(anyP.code);
		});
		properties.forEach((p) => {
			if (p.name && !list.includes(p.name)) list.push(p.name);
			if (p.code && !list.includes(p.code)) list.push(p.code);
		});
		PROPERTIES_LIST.forEach((p) => {
			if (!list.includes(p)) list.push(p);
		});
		return Array.from(new Set(list.filter(Boolean)));
	}, [properties$1]);
	const dynamicPropertyUnitsMap = (0, import_react.useMemo)(() => {
		const map = {};
		dynamicPropertyList.forEach((pName) => {
			const prop = properties$1.find((p) => p.title === pName || p.name === pName || p.code === pName || p.id === pName);
			const mockProp = properties.find((p) => p.name === pName || p.code === pName || p.id === pName);
			const foundUnits = [];
			if (prop) units$1.filter((u) => u.property_id === prop.id).forEach((u) => {
				const uName = u.unit_name || u.unit_ref || u.unit_code;
				if (uName && !foundUnits.includes(uName)) foundUnits.push(uName);
			});
			if (mockProp) units.filter((u) => u.propertyId === mockProp.id).forEach((u) => {
				const uName = u.number ? `Unit ${u.number}` : "";
				if (uName && !foundUnits.includes(uName)) foundUnits.push(uName);
			});
			if (foundUnits.length > 0) {
				map[pName] = foundUnits;
				return;
			}
			map[pName] = PROPERTY_UNITS[pName] || [
				"Unit 101",
				"Unit 102",
				"Unit 201",
				"Penthouse 1",
				"Common Corridor",
				"Main Pump Room",
				"Lobby Area",
				"Basement Parking"
			];
		});
		return map;
	}, [
		properties$1,
		units$1,
		dynamicPropertyList
	]);
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [filterProperty, setFilterProperty] = (0, import_react.useState)("all");
	const [filterCategory, setFilterCategory] = (0, import_react.useState)("all");
	const [filterArea, setFilterArea] = (0, import_react.useState)("all");
	const [ticketStatusTab, setTicketStatusTab] = (0, import_react.useState)("all");
	const [woStatusTab, setWoStatusTab] = (0, import_react.useState)("all");
	const [chargebackStatusTab, setChargebackStatusTab] = (0, import_react.useState)("all");
	const [selectedTicket, setSelectedTicket] = (0, import_react.useState)(null);
	const [editStatus, setEditStatus] = (0, import_react.useState)("");
	const [editAssignee, setEditAssignee] = (0, import_react.useState)("");
	const [editDescription, setEditDescription] = (0, import_react.useState)("");
	const [showNewTicketModal, setShowNewTicketModal] = (0, import_react.useState)(false);
	const [showNewWoModal, setShowNewWoModal] = (0, import_react.useState)(false);
	const [showNewPpmModal, setShowNewPpmModal] = (0, import_react.useState)(false);
	const [showNewTechModal, setShowNewTechModal] = (0, import_react.useState)(false);
	const [showVendorInvoiceModal, setShowVendorInvoiceModal] = (0, import_react.useState)(false);
	const [showNewChargebackModal, setShowNewChargebackModal] = (0, import_react.useState)(false);
	const [showProcurePrModal, setShowProcurePrModal] = (0, import_react.useState)(false);
	const [procurePartTarget, setProcurePartTarget] = (0, import_react.useState)(null);
	const [selectedWoForDetail, setSelectedWoForDetail] = (0, import_react.useState)(null);
	const [woConsumedQtyMap, setWoConsumedQtyMap] = (0, import_react.useState)({});
	const [selectedPpmForWo, setSelectedPpmForWo] = (0, import_react.useState)(null);
	const [ppmWoForm, setPpmWoForm] = (0, import_react.useState)({
		title: "",
		scheduledDate: "",
		scopeOfWork: "",
		assigneeType: "vendor",
		vendorName: "Carrier Middle East Qatar",
		technicianName: "Faisal Tariq (HVAC Specialist)",
		estimatedCost: 0
	});
	const [showInHouseMaterialModal, setShowInHouseMaterialModal] = (0, import_react.useState)(false);
	const [inHouseMaterialForm, setInHouseMaterialForm] = (0, import_react.useState)({
		materialName: "",
		property: "Al Sadd Commercial Tower",
		unitRef: "Office 402",
		quantity: 1,
		unitPrice: 0,
		costCenter: "CC-101",
		glAccount: "52100008",
		reason: "Chargeable replacement part provided by internal MEP team",
		chargebackToTenant: true
	});
	const [generatedReceipt, setGeneratedReceipt] = (0, import_react.useState)(null);
	const [ticketForm, setTicketForm] = (0, import_react.useState)({
		title: "",
		property: "Al Sadd Commercial Tower",
		visibility: "Personal (Only Me)",
		category: "Electrician",
		complaintArea: "Unit (name)",
		unitRef: "Office 402",
		isUrgent: false,
		description: "",
		reportedBy: role === "admin" ? "Admin Operations (Staff)" : role === "owner" ? "Property Owner" : "Property Manager (Operations)",
		attachments: []
	});
	const [tempAttachmentName, setTempAttachmentName] = (0, import_react.useState)("");
	const initialTicketCommentsState = {
		"f1": [{
			id: "tc-1",
			author: "Ahmed Al-Kuwari",
			role: "Tenant",
			timestamp: "2026-09-04 09:15 AM",
			comment: "AC blowing warm air since morning. Thermostat display shows error code E-41.",
			attachments: [{
				name: "thermostat_error_e41.jpg",
				size: "1.2 MB"
			}]
		}, {
			id: "tc-2",
			author: "Faisal Tariq",
			role: "Technician",
			timestamp: "2026-09-04 10:30 AM",
			comment: "Inspected FCU unit. The 2-way chilled water actuator is locked in closed position. Procuring replacement Honeywell actuator from warehouse."
		}],
		"f2": [{
			id: "tc-3",
			author: "Security Office",
			role: "Property Manager",
			timestamp: "2026-09-03 04:45 PM",
			comment: "Booster pump B2 making high pressure vibration sounds. Dispatched Qatar Facilities Management."
		}]
	};
	const initialWoCommentsState = {
		"WO-2026-001": [{
			id: "woc-1",
			author: "Faisal Tariq",
			role: "Technician",
			timestamp: "2026-09-04 11:00 AM",
			comment: "Replaced 2-way valve and actuator. Water pressure tested up to 4.5 bar without leaks. Temperature normalized at 18°C.",
			attachments: [{
				name: "completion_chiller_valve.jpg",
				size: "2.4 MB"
			}]
		}],
		"WO-2026-003": [{
			id: "woc-2",
			author: "Al Mana Maintenance",
			role: "Vendor",
			timestamp: "2026-09-03 02:00 PM",
			comment: "Tempered balcony glass replaced and sealed with silicone. Mortise lock latch aligned. Tenant accepted handover.",
			attachments: [{
				name: "glass_door_inspection.pdf",
				size: "840 KB"
			}]
		}]
	};
	const [ticketComments, setTicketComments] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("pms_ticket_comments");
			return saved ? JSON.parse(saved) : initialTicketCommentsState;
		} catch {
			return initialTicketCommentsState;
		}
	});
	const [woComments, setWoComments] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("pms_wo_comments");
			return saved ? JSON.parse(saved) : initialWoCommentsState;
		} catch {
			return initialWoCommentsState;
		}
	});
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("pms_ticket_comments", JSON.stringify(ticketComments));
		} catch (e) {
			console.error("Failed to save ticketComments to localStorage", e);
		}
	}, [ticketComments]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("pms_wo_comments", JSON.stringify(woComments));
		} catch (e) {
			console.error("Failed to save woComments to localStorage", e);
		}
	}, [woComments]);
	const [newTicketCommentText, setNewTicketCommentText] = (0, import_react.useState)("");
	const [newTicketCommentRole, setNewTicketCommentRole] = (0, import_react.useState)("Property Manager");
	const [newTicketCommentFile, setNewTicketCommentFile] = (0, import_react.useState)("");
	const [newWoCommentText, setNewWoCommentText] = (0, import_react.useState)("");
	const [newWoCommentRole, setNewWoCommentRole] = (0, import_react.useState)("Property Manager");
	const [newWoCommentFile, setNewWoCommentFile] = (0, import_react.useState)("");
	const [woForm, setWoForm] = (0, import_react.useState)({
		title: "",
		property: "Al Sadd Commercial Tower",
		unitRef: "Unit 101",
		category: "HVAC",
		priority: "medium",
		assigneeType: "in_house",
		technicianName: "Faisal Tariq",
		vendorName: "Carrier Middle East Qatar",
		scheduledDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		labourCost: 150,
		materialsCost: 200,
		scopeOfWork: "",
		chargebackToTenant: false,
		tenantChargeReason: ""
	});
	const [ppmForm, setPpmForm] = (0, import_react.useState)({
		title: "",
		property: "Al Sadd Commercial Tower",
		scopeType: "property",
		unitRef: "Entire Building / Common MEP",
		category: "HVAC",
		frequency: "Quarterly",
		nextDueDate: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10),
		assignedVendorName: "Carrier Middle East Qatar",
		estimatedCost: 2500,
		checklist: "Compressor oil check, condenser coil cleaning, water flow test, thermostat calibration"
	});
	const [techForm, setTechForm] = (0, import_react.useState)({
		name: "",
		specialty: "HVAC & Chiller Plants",
		phone: "+974 5511 2233",
		email: "",
		status: "Available"
	});
	const [vendorInvStep, setVendorInvStep] = (0, import_react.useState)(1);
	const [vendorInvModalForm, setVendorInvModalForm] = (0, import_react.useState)({
		invoiceNo: "",
		vendorName: "Carrier Middle East Qatar",
		property: "Al Sadd Commercial Tower",
		unitRef: "Office 402",
		amount: 1200,
		taxRate: 0,
		costCenter: "CC-101",
		partsDescription: "Replacement sensor and filter assembly",
		labourDescription: "Emergency on-site troubleshooting",
		glAccount: "52100001",
		paymentMode: "Bank Wire / Electronic Transfer (QNB)",
		paymentTerms: "Net 30 Days",
		settlementMode: "Bank Wire / Electronic Transfer (QNB)",
		receiptFileName: "",
		receiptAttachment: ""
	});
	const [chargebackForm, setChargebackForm] = (0, import_react.useState)({
		workOrderId: "WO-2026-003",
		tenantName: "Salim Mansour (Apt 1204)",
		property: "Lusail Marina Heights",
		unitRef: "Apt 1204",
		damageCategory: "Move-in / Move-out Accidental Damage",
		inspectionRef: "INSP-2026-881",
		incidentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		laborCost: 200,
		materialsCost: 550,
		adminFeeRate: 0,
		amount: 750,
		reason: "Broken Balcony Sliding Door Glass & Lock Latch during furniture move-in",
		recoveryMode: "Security Deposit Deduction",
		debitGlAccount: "21200001",
		creditGlAccount: "52100008",
		costCenter: "CC-104"
	});
	const [partSourceMode, setPartSourceMode] = (0, import_react.useState)("warehouse");
	const [selectedWarehousePartId, setSelectedWarehousePartId] = (0, import_react.useState)("");
	const [warehouseQty, setWarehouseQty] = (0, import_react.useState)(1);
	const [ticketSpareParts, setTicketSpareParts] = (0, import_react.useState)([]);
	const [vendorInvoiceRaised, setVendorInvoiceRaised] = (0, import_react.useState)(false);
	const [vendorPartForm, setVendorPartForm] = (0, import_react.useState)({
		vendorName: "Carrier Middle East Qatar",
		partDescription: "",
		quantity: 1,
		unitPrice: 0,
		invoiceNo: "",
		glAccount: "52100001 - Building Maintenance Expense"
	});
	const [prForm, setPrForm] = (0, import_react.useState)({
		partName: initialStockCatalog[0]?.name || "",
		itemCode: initialStockCatalog[0]?.code || "",
		qty: 10,
		estimatedCost: initialStockCatalog[0]?.unitCost || 0,
		property: "Al Sadd Commercial Tower",
		urgency: "HIGH",
		budgetHead: "Maintenance Items",
		notes: "Auto-replenishment for maintenance warehouse"
	});
	const load = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const [ticketsData, propsData, unitsData] = await Promise.all([
				fetchMaintenanceTickets(role === "admin" ? {} : { host_id: MOCK_HOST_ID }),
				fetchAllProperties().catch(() => fetchProperties().catch(() => [])),
				fetchUnits().catch(() => [])
			]);
			if (ticketsData && ticketsData.length > 0) setTickets(ticketsData);
			else setTickets(initialTickets);
			if (propsData && propsData.length > 0) setProperties(propsData);
			if (unitsData && unitsData.length > 0) setUnits(unitsData);
		} catch {
			setTickets(initialTickets);
		} finally {
			setLoading(false);
		}
	}, [role]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	const filteredTickets = (0, import_react.useMemo)(() => {
		return tickets.filter((t) => {
			const matchesSearch = !searchQuery.trim() || t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || t.id?.toLowerCase().includes(searchQuery.toLowerCase()) || t.description?.toLowerCase().includes(searchQuery.toLowerCase()) || t.reported_by?.toLowerCase().includes(searchQuery.toLowerCase()) || t.assignee?.toLowerCase().includes(searchQuery.toLowerCase()) || t.unit_ref?.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory = filterCategory === "all" || t.category?.toLowerCase() === filterCategory.toLowerCase();
			const matchesArea = filterArea === "all" || t.unit_ref?.toLowerCase().includes(filterArea.toLowerCase());
			const matchesProperty = filterProperty === "all" || t.unit_ref && t.unit_ref.toLowerCase().includes(filterProperty.toLowerCase());
			const matchesStatusTab = ticketStatusTab === "all" || ticketStatusTab === "new" && t.status === "new" || ticketStatusTab === "assigned" && (t.status === "assigned" || t.status === "dispatched") || ticketStatusTab === "in_progress" && t.status === "in_progress" || ticketStatusTab === "resolved" && (t.status === "resolved" || t.status === "completed" || t.status === "closed") || ticketStatusTab === "cancelled" && t.status === "cancelled" || t.status === ticketStatusTab;
			return matchesSearch && matchesCategory && matchesArea && matchesProperty && matchesStatusTab;
		});
	}, [
		tickets,
		searchQuery,
		filterProperty,
		filterCategory,
		filterArea,
		ticketStatusTab
	]);
	const filteredWorkOrders = (0, import_react.useMemo)(() => {
		return workOrders.filter((w) => {
			const matchesSearch = !searchQuery.trim() || w.title?.toLowerCase().includes(searchQuery.toLowerCase()) || w.id?.toLowerCase().includes(searchQuery.toLowerCase()) || w.property?.toLowerCase().includes(searchQuery.toLowerCase()) || w.unitRef?.toLowerCase().includes(searchQuery.toLowerCase()) || w.technicianName?.toLowerCase().includes(searchQuery.toLowerCase()) || w.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) || w.category?.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = woStatusTab === "all" || w.status === woStatusTab;
			return matchesSearch && matchesStatus;
		});
	}, [
		workOrders,
		searchQuery,
		woStatusTab
	]);
	(0, import_react.useMemo)(() => {
		return workOrders.filter((w) => {
			const matchesSearch = !searchQuery.trim() || w.id?.toLowerCase().includes(searchQuery.toLowerCase()) || w.property?.toLowerCase().includes(searchQuery.toLowerCase()) || w.unitRef?.toLowerCase().includes(searchQuery.toLowerCase()) || w.category?.toLowerCase().includes(searchQuery.toLowerCase()) || w.tenantChargeReason?.toLowerCase().includes(searchQuery.toLowerCase());
			if (chargebackStatusTab === "chargeable") return matchesSearch && w.chargebackToTenant;
			if (chargebackStatusTab === "opex") return matchesSearch && !w.chargebackToTenant;
			if (chargebackStatusTab === "deposit") return matchesSearch && w.chargebackToTenant && w.chargebackStatus === "Deposit Deducted";
			if (chargebackStatusTab === "ar_invoice") return matchesSearch && w.chargebackToTenant && (w.chargebackStatus === "AR Invoice Queued" || w.chargebackStatus === "Billed on Next Rent");
			return matchesSearch;
		});
	}, [
		workOrders,
		searchQuery,
		chargebackStatusTab
	]);
	(0, import_react.useMemo)(() => {
		return COLUMNS.map((col) => ({
			...col,
			items: filteredTickets.filter((t) => {
				if (col.key === "new") return t.status === "new";
				if (col.key === "dispatched") return t.status === "dispatched" || t.status === "assigned";
				if (col.key === "scheduled") return t.status === "scheduled";
				if (col.key === "in_progress") return t.status === "in_progress";
				if (col.key === "resolved") return t.status === "resolved" || t.status === "completed" || t.status === "closed";
				if (col.key === "cancelled") return t.status === "cancelled";
				return t.status === col.key;
			})
		}));
	}, [filteredTickets]);
	function handleCreateTicket() {
		if (role === "maintenance") {
			toast.error("In-house maintenance staff can update tickets but cannot create new service tickets.");
			return;
		}
		if (!ticketForm.title.trim()) {
			toast.error("Please enter a ticket title");
			return;
		}
		if (!ticketForm.description.trim()) {
			toast.error("Description is mandatory. Please provide detailed symptoms.");
			return;
		}
		const newT = {
			id: `T-${Date.now().toString().slice(-4)}`,
			property_id: null,
			unit_ref: ticketForm.complaintArea === "Unit (name)" ? ticketForm.unitRef : ticketForm.complaintArea,
			title: ticketForm.title,
			description: ticketForm.description,
			category: ticketForm.category,
			priority: ticketForm.isUrgent ? "urgent" : "medium",
			status: "new",
			assignee: null,
			host_id: null,
			reported_by: `${ticketForm.reportedBy} (${ticketForm.visibility})`,
			resolved_at: null,
			created_at: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			updated_at: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		};
		if (ticketForm.attachments.length > 0) setTicketComments((prev) => ({
			...prev,
			[newT.id]: [{
				id: `tc-init-${Date.now()}`,
				author: ticketForm.reportedBy,
				role: "Tenant",
				timestamp: (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
					dateStyle: "short",
					timeStyle: "short"
				}),
				comment: `Initial complaint logged with ${ticketForm.attachments.length} attachment(s).`,
				attachments: ticketForm.attachments
			}]
		}));
		if (ticketForm.isUrgent) {
			const autoWo = {
				id: `WO-2026-${(workOrders.length + 1).toString().padStart(3, "0")}`,
				ticketId: newT.id,
				title: `EMERGENCY: ${ticketForm.title}`,
				property: ticketForm.property,
				unitRef: ticketForm.complaintArea === "Unit (name)" ? ticketForm.unitRef : ticketForm.complaintArea,
				category: ticketForm.category,
				priority: "urgent",
				status: "in_progress",
				assigneeType: "in_house",
				technicianName: "Faisal Tariq (Emergency Lead)",
				scheduledDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				labourCost: 200,
				materialsCost: 250,
				totalCost: 450,
				chargebackToTenant: false,
				scopeOfWork: `Emergency triage auto-dispatched from Ticket ${newT.id}: ${ticketForm.description}`
			};
			setWorkOrders((prev) => [autoWo, ...prev]);
			newT.status = "in_progress";
			newT.assignee = "Faisal Tariq (Emergency Lead)";
			toast.info(`Emergency SLA: Linked Work Order ${autoWo.id} auto-created & dispatched to on-call technician`);
		}
		setTickets((prev) => [newT, ...prev]);
		toast.success(`Maintenance ticket ${newT.id} created successfully (${ticketForm.visibility})`);
		setShowNewTicketModal(false);
		setTicketForm({
			title: "",
			property: "Al Sadd Commercial Tower",
			visibility: "Personal (Only Me)",
			category: "Electrician",
			complaintArea: "Unit (name)",
			unitRef: "Office 402",
			isUrgent: false,
			description: "",
			reportedBy: "Tenant Portal",
			attachments: []
		});
		setTempAttachmentName("");
	}
	function handleAddTicketComment(ticketId) {
		if (!newTicketCommentText.trim() && !newTicketCommentFile.trim()) {
			toast.error("Please type a comment or attach a file");
			return;
		}
		const newC = {
			id: `tc-${Date.now()}`,
			author: newTicketCommentRole === "Tenant" ? "Tenant" : newTicketCommentRole === "Technician" ? selectedTicket?.assignee || "Assigned Technician" : "Property Manager",
			role: newTicketCommentRole,
			timestamp: (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
				dateStyle: "medium",
				timeStyle: "short"
			}),
			comment: newTicketCommentText.trim() || "Uploaded attachment update.",
			attachments: newTicketCommentFile.trim() ? [{
				name: newTicketCommentFile.trim(),
				size: "1.5 MB"
			}] : void 0
		};
		setTicketComments((prev) => ({
			...prev,
			[ticketId]: [...prev[ticketId] || [], newC]
		}));
		toast.success("Comment and attachment posted to ticket timeline");
		setNewTicketCommentText("");
		setNewTicketCommentFile("");
	}
	function handleAddWoComment(woId) {
		if (!newWoCommentText.trim() && !newWoCommentFile.trim()) {
			toast.error("Please type an update note or attach a file");
			return;
		}
		const currentAuthor = role === "admin" ? "Admin Operations" : role === "owner" ? "Property Owner" : "Property Manager";
		const newC = {
			id: `woc-${Date.now()}`,
			author: currentAuthor,
			role: "Property Manager",
			timestamp: (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
				dateStyle: "medium",
				timeStyle: "short"
			}),
			comment: newWoCommentText.trim() || "Uploaded job sheet / photo.",
			attachments: newWoCommentFile.trim() ? [{
				name: newWoCommentFile.trim(),
				size: "2.1 MB"
			}] : void 0
		};
		setWoComments((prev) => ({
			...prev,
			[woId]: [...prev[woId] || [], newC]
		}));
		toast.success("Note and timestamped attachment added to Work Order");
		setNewWoCommentText("");
		setNewWoCommentFile("");
	}
	function handleCreateWorkOrder() {
		if (!woForm.title.trim()) {
			toast.error("Please enter a work order title");
			return;
		}
		const newWo = {
			id: `WO-2026-${(workOrders.length + 1).toString().padStart(3, "0")}`,
			title: woForm.title,
			property: woForm.property,
			unitRef: woForm.unitRef,
			category: woForm.category,
			priority: woForm.priority,
			status: "scheduled",
			assigneeType: woForm.assigneeType,
			technicianName: woForm.assigneeType === "in_house" ? woForm.technicianName : void 0,
			vendorName: woForm.assigneeType === "vendor" ? woForm.vendorName : void 0,
			scheduledDate: woForm.scheduledDate,
			labourCost: Number(woForm.labourCost) || 0,
			materialsCost: Number(woForm.materialsCost) || 0,
			totalCost: (Number(woForm.labourCost) || 0) + (Number(woForm.materialsCost) || 0),
			chargebackToTenant: woForm.chargebackToTenant,
			tenantChargeReason: woForm.chargebackToTenant ? woForm.tenantChargeReason : void 0,
			scopeOfWork: woForm.scopeOfWork || "Standard maintenance task execution."
		};
		setWorkOrders((prev) => [newWo, ...prev]);
		toast.success(`Work Order ${newWo.id} created & scheduled`);
		setShowNewWoModal(false);
		setWoForm({
			title: "",
			property: "Al Sadd Commercial Tower",
			unitRef: "Unit 101",
			category: "HVAC & Chillers",
			priority: "medium",
			assigneeType: "in_house",
			technicianName: "Faisal Tariq",
			vendorName: "Carrier Middle East Qatar",
			scheduledDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			labourCost: 150,
			materialsCost: 200,
			scopeOfWork: "",
			chargebackToTenant: false,
			tenantChargeReason: ""
		});
	}
	async function handleUpdateWorkOrderStatus(woId, newStatus) {
		let targetWo;
		setWorkOrders((prev) => prev.map((w) => {
			if (w.id === woId) {
				const updated = {
					...w,
					status: newStatus
				};
				if (newStatus === "completed") updated.completionDate = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
				targetWo = updated;
				return updated;
			}
			return w;
		}));
		if (selectedWoForDetail?.id === woId) setSelectedWoForDetail((prev) => prev ? {
			...prev,
			status: newStatus,
			completionDate: newStatus === "completed" ? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) : prev.completionDate
		} : null);
		const currentWo = targetWo || workOrders.find((w) => w.id === woId);
		if (currentWo?.ticketId) {
			const ticketId = currentWo.ticketId;
			const mappedTicketStatus = newStatus === "completed" ? "resolved" : newStatus === "in_progress" ? "in_progress" : newStatus === "scheduled" ? "assigned" : newStatus === "cancelled" ? "cancelled" : "new";
			setTickets((prev) => prev.map((t) => t.id === ticketId ? {
				...t,
				status: mappedTicketStatus,
				resolved_at: newStatus === "completed" ? (/* @__PURE__ */ new Date()).toISOString() : t.resolved_at
			} : t));
			if (selectedTicket?.id === ticketId) {
				setSelectedTicket((prev) => prev ? {
					...prev,
					status: mappedTicketStatus,
					resolved_at: newStatus === "completed" ? (/* @__PURE__ */ new Date()).toISOString() : prev.resolved_at
				} : null);
				setEditStatus(mappedTicketStatus);
			}
			try {
				await updateMaintenanceTicket(ticketId, {
					status: mappedTicketStatus,
					resolved_at: newStatus === "completed" ? (/* @__PURE__ */ new Date()).toISOString() : null
				});
			} catch (e) {
				console.warn("Skipping remote ticket update for mock ticket:", ticketId, e);
			}
			const timestamp = (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
				dateStyle: "medium",
				timeStyle: "short"
			});
			const syncNote = `Work Order ${woId} status updated to [${newStatus.toUpperCase().replace("_", " ")}]. Linked Service Ticket ${ticketId} status automatically updated to [${mappedTicketStatus.toUpperCase()}].`;
			const syncComment = {
				id: `sync-${Date.now()}`,
				author: role === "admin" ? "Admin Operations" : "Property Manager",
				role: "Property Manager",
				timestamp,
				comment: syncNote
			};
			setTicketComments((prev) => ({
				...prev,
				[ticketId]: [...prev[ticketId] || [], syncComment]
			}));
			setWoComments((prev) => ({
				...prev,
				[woId]: [...prev[woId] || [], syncComment]
			}));
			toast.success(`Work Order ${woId} is now ${newStatus.toUpperCase()}. Linked Ticket ${ticketId} updated to ${mappedTicketStatus.toUpperCase()}!`);
		} else toast.success(`Work Order ${woId} status updated to ${newStatus.toUpperCase()}`);
	}
	function handleCreatePpm() {
		if (!ppmForm.title.trim()) {
			toast.error("Please enter a PPM title");
			return;
		}
		const newPpm = {
			id: `PPM-${(ppmSchedules.length + 1).toString().padStart(3, "0")}`,
			title: ppmForm.title,
			property: ppmForm.property,
			unitRef: ppmForm.scopeType === "property" ? "Entire Building / Common MEP" : ppmForm.unitRef,
			scopeType: ppmForm.scopeType,
			category: ppmForm.category,
			frequency: ppmForm.frequency,
			nextDueDate: ppmForm.nextDueDate,
			lastDoneDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			assignedVendorName: role === "maintenance" ? void 0 : ppmForm.assignedVendorName,
			estimatedCost: Number(ppmForm.estimatedCost) || 0,
			status: "Upcoming",
			checklist: ppmForm.checklist.split(",").map((c) => c.trim()).filter(Boolean)
		};
		setPpmSchedules((prev) => [newPpm, ...prev]);
		toast.success(`Preventive PPM schedule ${newPpm.id} registered`);
		setShowNewPpmModal(false);
		setPpmForm({
			title: "",
			property: "Al Sadd Commercial Tower",
			scopeType: "property",
			unitRef: "Entire Building / Common MEP",
			category: "HVAC",
			frequency: "Quarterly",
			nextDueDate: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10),
			assignedVendorName: "Carrier Middle East Qatar",
			estimatedCost: 2500,
			checklist: "Compressor oil check, condenser coil cleaning, water flow test, thermostat calibration"
		});
	}
	function handleCreateTechnician() {
		if (!techForm.name.trim()) {
			toast.error("Please enter the technician's full name");
			return;
		}
		const newTech = {
			id: `tech-${technicians.length + 1}`,
			name: techForm.name,
			specialty: techForm.specialty,
			phone: techForm.phone,
			email: techForm.email || `${techForm.name.toLowerCase().replace(/\s+/g, ".")}@pms.qa`,
			activeWorkload: 0,
			status: techForm.status,
			rating: 5,
			completedJobsCount: 0
		};
		setTechnicians((prev) => [newTech, ...prev]);
		toast.success(`Technician ${newTech.name} added to in-house roster`);
		setShowNewTechModal(false);
		setTechForm({
			name: "",
			specialty: "HVAC & Chiller Plants",
			phone: "+974 5511 2233",
			email: "",
			status: "Available"
		});
	}
	function handleDispatchWoFromPpm() {
		if (!selectedPpmForWo) return;
		if (role === "maintenance" && ppmWoForm.assigneeType === "vendor") {
			toast.error("In-house maintenance staff cannot dispatch third-party vendors.");
			return;
		}
		const newWoId = `WO-2026-${(workOrders.length + 1).toString().padStart(3, "0")}`;
		const newWo = {
			id: newWoId,
			title: ppmWoForm.title || `${selectedPpmForWo.title} (PPM)`,
			property: selectedPpmForWo.property,
			unitRef: selectedPpmForWo.unitRef || (selectedPpmForWo.scopeType === "property" ? "Entire Property" : "Specific Unit"),
			category: selectedPpmForWo.category,
			priority: "medium",
			status: "scheduled",
			assigneeType: ppmWoForm.assigneeType,
			technicianName: ppmWoForm.assigneeType === "in_house" ? ppmWoForm.technicianName : void 0,
			vendorName: ppmWoForm.assigneeType === "vendor" ? ppmWoForm.vendorName : void 0,
			scheduledDate: ppmWoForm.scheduledDate || selectedPpmForWo.nextDueDate,
			labourCost: ppmWoForm.assigneeType === "vendor" ? Math.round(Number(ppmWoForm.estimatedCost) * .4) : 0,
			materialsCost: ppmWoForm.assigneeType === "vendor" ? Math.round(Number(ppmWoForm.estimatedCost) * .6) : 0,
			totalCost: ppmWoForm.assigneeType === "vendor" ? Number(ppmWoForm.estimatedCost) || 0 : 0,
			chargebackToTenant: false,
			scopeOfWork: ppmWoForm.scopeOfWork || `Statutory PPM routine execution.\nCheckpoints:\n` + selectedPpmForWo.checklist.map((c) => `- ${c}`).join("\n")
		};
		setWorkOrders((prev) => [newWo, ...prev]);
		setPpmSchedules((prev) => prev.map((p) => p.id === selectedPpmForWo.id ? {
			...p,
			lastDoneDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			status: "Active"
		} : p));
		toast.success(`Work Order ${newWoId} created & dispatched from ${selectedPpmForWo.id}`);
		setSelectedPpmForWo(null);
	}
	function handleCreateInHouseMaterial() {
		if (!inHouseMaterialForm.materialName.trim() || Number(inHouseMaterialForm.unitPrice) <= 0) {
			toast.error("Please enter a valid material name and unit price");
			return;
		}
		const qty = Number(inHouseMaterialForm.quantity || 1);
		const totalAmount = qty * Number(inHouseMaterialForm.unitPrice || 0);
		const glItem = MAINTENANCE_GL_ACCOUNTS.find((g) => g.code === inHouseMaterialForm.glAccount) || MAINTENANCE_GL_ACCOUNTS[7];
		const costCenterItem = COST_CENTERS.find((c) => c.code === inHouseMaterialForm.costCenter) || COST_CENTERS[0];
		const newInv = {
			id: `VI-IH-${Date.now().toString().slice(-4)}`,
			invoiceNo: `IH-MAT-${Date.now().toString().slice(-5)}`,
			ticketId: "T-IH-CHARGE",
			workOrderId: "WO-INHOUSE",
			vendorName: "In-House Facilities & Workshop Stock",
			property: inHouseMaterialForm.property,
			unitRef: inHouseMaterialForm.unitRef,
			invoiceDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			amount: totalAmount,
			partsDescription: `${qty}x ${inHouseMaterialForm.materialName} (Internal Stock Issue)`,
			labourDescription: inHouseMaterialForm.reason,
			status: "Submitted",
			glAccount: `${glItem.code} - ${glItem.name}`,
			paymentMode: "Internal Cost Journal"
		};
		setVendorInvoices((prev) => [newInv, ...prev]);
		toast.success(`In-House Material [${inHouseMaterialForm.materialName}] logged & mapped to GL ${glItem.code}`);
		setShowInHouseMaterialModal(false);
		setGeneratedReceipt({
			receiptNo: `MAT-RCP-${Date.now().toString().slice(-6)}`,
			voucherType: "IN_HOUSE_MATERIAL",
			date: (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
				dateStyle: "medium",
				timeStyle: "short"
			}),
			partyName: "In-House Maintenance Workshop (Internal Stock)",
			referenceId: newInv.invoiceNo,
			property: inHouseMaterialForm.property,
			unitRef: inHouseMaterialForm.unitRef,
			baseAmount: totalAmount,
			taxAmount: 0,
			totalAmount,
			glAccount: `${glItem.code} - ${glItem.name}`,
			glAccountName: glItem.name,
			costCenter: `${costCenterItem.code} - ${costCenterItem.name}`,
			description: `${inHouseMaterialForm.materialName} (Qty: ${qty}) · ${inHouseMaterialForm.reason}`,
			paymentMode: inHouseMaterialForm.chargebackToTenant ? "Tenant Damage Chargeback (Deposit / Ledger)" : "Landlord Maintenance OPEX",
			issuedBy: role === "admin" ? "Facilities Operations Admin" : "Property Manager (Maintenance Lead)"
		});
		setInHouseMaterialForm({
			materialName: "",
			property: "Al Sadd Commercial Tower",
			unitRef: "Office 402",
			quantity: 1,
			unitPrice: 0,
			costCenter: "CC-101",
			glAccount: "52100008",
			reason: "Chargeable replacement part provided by internal MEP team",
			chargebackToTenant: true
		});
	}
	function pushApInvoiceToFinanceStore(inv) {
		try {
			const baseAmt = inv.base_amount !== void 0 ? inv.base_amount : inv.amount - (inv.tax_amount || 0);
			const taxAmt = inv.tax_amount || 0;
			const totalAmt = inv.amount;
			const FINANCE_AP_KEY = "zyno-pms-finance-data-v1-ap";
			const existing = JSON.parse(localStorage.getItem(FINANCE_AP_KEY) || "[]");
			if (!existing.some((i) => i.invoice_no === inv.invoice_no)) {
				existing.unshift({
					...inv,
					id: `ap-mnt-${Date.now()}`,
					status: "Unpaid",
					base_amount: baseAmt,
					tax_amount: taxAmt,
					amount: totalAmt,
					property: inv.property || "Unassigned",
					unit_ref: inv.unit_ref || "Building Maintenance",
					po_number: inv.work_order_id || inv.ticket_id || "—",
					grn_number: inv.ticket_id || "—",
					payment_terms: inv.payment_terms || "Net 30 Days",
					settlement_mode: inv.settlement_mode || "Bank Wire / Electronic Transfer (QNB)",
					receipt_attachment: inv.receipt_attachment
				});
				localStorage.setItem(FINANCE_AP_KEY, JSON.stringify(existing));
			}
			ApInvoicesApi.create({
				invoice_number: inv.invoice_no,
				vendor_id: inv.vendor,
				vendor_name: inv.vendor,
				po_number: inv.work_order_id || inv.ticket_id || "—",
				grn_number: inv.ticket_id || "—",
				invoice_date: inv.date,
				due_date: inv.due_date,
				amount: baseAmt,
				tax_amount: taxAmt,
				total_amount: totalAmt,
				payment_terms: inv.payment_terms || "Net 30 Days",
				settlement_mode: inv.settlement_mode || "Bank Wire / Electronic Transfer (QNB)",
				status: "SUBMITTED",
				posting_status: "UNPOSTED",
				source_type: "MAINTENANCE",
				remarks: `Maintenance AP Invoice: ${inv.vendor} (${inv.invoice_no})`,
				receipt_attachment: inv.receipt_attachment,
				property: inv.property,
				unit_ref: inv.unit_ref,
				expense_gl_account: inv.account,
				expense_gl_code: inv.account_code
			});
			window.dispatchEvent(new Event("finance_vouchers_updated"));
			window.dispatchEvent(new Event("ap_invoices_updated"));
			window.dispatchEvent(new Event("pms_vendor_invoices_updated"));
		} catch (e) {
			console.warn("[Maintenance] Finance store sync failed:", e);
		}
	}
	function pushJournalToFinanceStore(entry) {
		try {
			const FINANCE_JOURNALS_KEY = "zyno-pms-finance-data-v1-journals";
			const journals = JSON.parse(localStorage.getItem(FINANCE_JOURNALS_KEY) || "[]");
			journals.unshift({
				...entry,
				id: `je-mnt-${Date.now()}`,
				status: "Posted"
			});
			localStorage.setItem(FINANCE_JOURNALS_KEY, JSON.stringify(journals));
			window.dispatchEvent(new Event("finance_vouchers_updated"));
		} catch (e) {
			console.warn("[Maintenance] GL Journal sync failed:", e);
		}
	}
	function handleCreateVendorInvoiceFromModal() {
		if (role === "maintenance") {
			toast.error("In-house maintenance staff cannot create third-party vendor AP invoices.");
			return;
		}
		if (!vendorInvModalForm.invoiceNo.trim() || Number(vendorInvModalForm.amount) <= 0) {
			toast.error("Please specify a valid invoice number and amount");
			return;
		}
		const baseAmt = Number(vendorInvModalForm.amount) || 0;
		const taxAmt = baseAmt * ((Number(vendorInvModalForm.taxRate) || 0) / 100);
		const totalPayable = baseAmt + taxAmt;
		const glItem = MAINTENANCE_GL_ACCOUNTS.find((g) => g.code === vendorInvModalForm.glAccount) || MAINTENANCE_GL_ACCOUNTS[0];
		const invoiceDate = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const dueDate = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
		const newInv = {
			id: `VI-${Date.now().toString().slice(-4)}`,
			invoiceNo: vendorInvModalForm.invoiceNo,
			ticketId: "T-101",
			workOrderId: "WO-2026-001",
			vendorName: vendorInvModalForm.vendorName,
			property: vendorInvModalForm.property,
			unitRef: vendorInvModalForm.unitRef,
			invoiceDate,
			dueDate,
			amount: totalPayable,
			baseAmount: baseAmt,
			taxAmount: taxAmt,
			partsDescription: vendorInvModalForm.partsDescription,
			labourDescription: vendorInvModalForm.labourDescription,
			status: "Submitted",
			glAccount: `${glItem.code} - ${glItem.name}`,
			paymentMode: vendorInvModalForm.settlementMode || vendorInvModalForm.paymentMode || "Bank Wire / Electronic Transfer (QNB)",
			paymentTerms: vendorInvModalForm.paymentTerms || "Net 30 Days",
			settlementMode: vendorInvModalForm.settlementMode || "Bank Wire / Electronic Transfer (QNB)",
			receiptAttachment: vendorInvModalForm.receiptAttachment || vendorInvModalForm.receiptFileName,
			receiptFileName: vendorInvModalForm.receiptFileName
		};
		const updatedInvoices = [newInv, ...vendorInvoices.filter((i) => i.invoiceNo !== newInv.invoiceNo)];
		setVendorInvoices(updatedInvoices);
		try {
			localStorage.setItem("pms_vendor_invoices", JSON.stringify(updatedInvoices));
		} catch (e) {
			console.error("Failed to save pms_vendor_invoices:", e);
		}
		pushApInvoiceToFinanceStore({
			invoice_no: vendorInvModalForm.invoiceNo,
			vendor: vendorInvModalForm.vendorName,
			date: invoiceDate,
			due_date: dueDate,
			account: `${glItem.code} - ${glItem.name}`,
			account_code: glItem.code,
			base_amount: baseAmt,
			tax_amount: taxAmt,
			amount: totalPayable,
			payment_terms: vendorInvModalForm.paymentTerms || "Net 30 Days",
			settlement_mode: vendorInvModalForm.settlementMode || "Bank Wire / Electronic Transfer (QNB)",
			receipt_attachment: vendorInvModalForm.receiptAttachment || vendorInvModalForm.receiptFileName,
			property: vendorInvModalForm.property,
			unit_ref: vendorInvModalForm.unitRef,
			work_order_id: "WO-2026-001",
			ticket_id: "T-101"
		});
		toast.success(`AP Payable Invoice ${newInv.invoiceNo} registered & submitted to Finance team for payment settlement`);
		setShowVendorInvoiceModal(false);
		setVendorInvModalForm({
			invoiceNo: "",
			vendorName: "Carrier Middle East Qatar",
			property: "Al Sadd Commercial Tower",
			unitRef: "Office 402",
			amount: 1200,
			taxRate: 0,
			costCenter: "CC-101",
			partsDescription: "Replacement sensor and filter assembly",
			labourDescription: "Emergency on-site troubleshooting",
			glAccount: "52100001",
			paymentMode: "Bank Wire / Electronic Transfer (QNB)",
			paymentTerms: "Net 30 Days",
			settlementMode: "Bank Wire / Electronic Transfer (QNB)",
			receiptFileName: "",
			receiptAttachment: ""
		});
	}
	function handleCreateChargeback() {
		workOrders.find((w) => w.id === chargebackForm.workOrderId);
		const totalCost = (Number(chargebackForm.laborCost) || 0) + (Number(chargebackForm.materialsCost) || 0);
		const adminFee = totalCost * ((Number(chargebackForm.adminFeeRate) || 0) / 100);
		const totalChargeback = totalCost + adminFee;
		const chargebackAmount = Number(chargebackForm.amount) || totalChargeback;
		const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const jeNo = `JE-CB-${Date.now().toString().slice(-6)}`;
		const isDepositDeduction = chargebackForm.recoveryMode === "Security Deposit Deduction";
		const drCode = isDepositDeduction ? "21200001" : "11200001";
		const drName = isDepositDeduction ? "Tenant Security Deposits Held (Escrow Liability)" : "Tenant Accounts Receivable (Trade Debtors)";
		const crCode = "52100008";
		const crName = "Tenant Recoverable Damage & Chargeback Clearing";
		const costCenterItem = COST_CENTERS.find((c) => c.code === chargebackForm.costCenter) || COST_CENTERS[3];
		setWorkOrders((prev) => prev.map((w) => w.id === chargebackForm.workOrderId ? {
			...w,
			chargebackStatus: isDepositDeduction ? "Deposit Deducted" : "AR Invoice Queued",
			chargebackToTenant: true
		} : w));
		pushJournalToFinanceStore({
			je_no: jeNo,
			posting_date: today,
			reference: `CB-${chargebackForm.workOrderId}-${chargebackForm.inspectionRef}`,
			narration: `Tenant Chargeback: ${chargebackForm.tenantName} | ${chargebackForm.damageCategory} | ${chargebackForm.reason}`,
			dr_account: drName,
			dr_code: drCode,
			cr_account: crName,
			cr_code: crCode,
			amount: chargebackAmount
		});
		if (!isDepositDeduction) try {
			const FINANCE_AR_KEY = "zyno-pms-finance-data-v1-ar";
			const existingAr = JSON.parse(localStorage.getItem(FINANCE_AR_KEY) || "[]");
			existingAr.unshift({
				id: `ar-cb-${Date.now()}`,
				invoice_no: `AR-CB-${chargebackForm.workOrderId.replace("WO-", "")}`,
				tenant: chargebackForm.tenantName,
				property: chargebackForm.property,
				unit: chargebackForm.unitRef,
				date: today,
				due_date: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10),
				stream: "Tenant Damage Recharge",
				account_code: "41300002",
				amount: chargebackAmount,
				status: "Pending"
			});
			localStorage.setItem(FINANCE_AR_KEY, JSON.stringify(existingAr));
			window.dispatchEvent(new Event("finance_vouchers_updated"));
		} catch (e) {
			console.warn("[Maintenance] AR chargeback sync failed:", e);
		}
		setGeneratedReceipt({
			receiptNo: `CB-VCHR-${Date.now().toString().slice(-6)}`,
			voucherType: "TENANT_CHARGEBACK",
			date: (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
				dateStyle: "medium",
				timeStyle: "short"
			}),
			partyName: chargebackForm.tenantName,
			referenceId: `${chargebackForm.workOrderId} | ${chargebackForm.inspectionRef}`,
			property: chargebackForm.property,
			unitRef: chargebackForm.unitRef,
			baseAmount: totalCost,
			taxAmount: adminFee,
			totalAmount: chargebackAmount,
			glAccount: `${crCode} - ${crName}`,
			glAccountName: crName,
			costCenter: `${costCenterItem.code} - ${costCenterItem.name}`,
			description: `${chargebackForm.damageCategory}: ${chargebackForm.reason}`,
			paymentMode: chargebackForm.recoveryMode,
			issuedBy: role === "admin" ? "Facilities Operations Admin" : "Property Manager (Maintenance Lead)",
			journalLines: [{
				account: `${drCode} - ${drName}`,
				description: isDepositDeduction ? `Security Deposit Deduction: ${chargebackForm.tenantName}` : `AR Invoice Raised: ${chargebackForm.tenantName}`,
				costCenter: `${costCenterItem.code} - ${costCenterItem.name}`,
				debit: chargebackAmount
			}, {
				account: `${crCode} - ${crName}`,
				description: `Chargeback Clearing: WO ${chargebackForm.workOrderId} | Labor QAR ${chargebackForm.laborCost} + Materials QAR ${chargebackForm.materialsCost}${adminFee > 0 ? ` + Admin Fee QAR ${adminFee.toFixed(2)}` : ""}`,
				costCenter: `${costCenterItem.code} - ${costCenterItem.name}`,
				credit: chargebackAmount
			}]
		});
		toast.success(`Tenant chargeback of QAR ${chargebackAmount.toLocaleString()} posted for ${chargebackForm.tenantName}. GL Journal ${jeNo} generated.`);
		setShowNewChargebackModal(false);
	}
	function handleAddVendorInvoice() {
		if (!vendorPartForm.invoiceNo.trim() || vendorPartForm.unitPrice <= 0) {
			toast.error("Please specify a valid invoice number and amount");
			return;
		}
		const invDate = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const dueDate = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
		const invAmt = vendorPartForm.unitPrice * vendorPartForm.quantity;
		const glCodeRaw = vendorPartForm.glAccount.split(" - ")[0] || "52100001";
		vendorPartForm.glAccount.split(" - ").slice(1).join(" - ");
		const newInv = {
			id: `VI-${Date.now().toString().slice(-4)}`,
			invoiceNo: vendorPartForm.invoiceNo,
			ticketId: selectedTicket?.id || "T-GEN",
			vendorName: vendorPartForm.vendorName,
			property: selectedTicket?.unit_ref ? "West Bay Pearl Residence" : "Al Sadd Commercial Tower",
			unitRef: selectedTicket?.unit_ref || "Unit",
			invoiceDate: invDate,
			amount: invAmt,
			partsDescription: vendorPartForm.partDescription || "Vendor supplied maintenance material",
			labourDescription: "Specialist vendor on-site maintenance service",
			status: "Submitted",
			glAccount: vendorPartForm.glAccount,
			paymentMode: "Bank Transfer (Net 30)"
		};
		setVendorInvoices((prev) => [newInv, ...prev]);
		pushApInvoiceToFinanceStore({
			invoice_no: vendorPartForm.invoiceNo,
			vendor: vendorPartForm.vendorName,
			date: invDate,
			due_date: dueDate,
			account: vendorPartForm.glAccount,
			account_code: glCodeRaw,
			amount: invAmt
		});
		toast.success(`AP Payable Invoice ${newInv.invoiceNo} registered & synced to Finance Payable`);
		setVendorPartForm({
			vendorName: "Carrier Middle East Qatar",
			partDescription: "",
			quantity: 1,
			unitPrice: 0,
			invoiceNo: "",
			glAccount: "52100001 - Building Maintenance Expense"
		});
	}
	function handleCreateProcurementPr() {
		toast.success(`Purchase Request (PR) raised for ${prForm.qty}x ${prForm.partName} to Procurement Module`);
		setShowProcurePrModal(false);
	}
	const currentTabConfig = (0, import_react.useMemo)(() => {
		switch (activeTab) {
			case "work_orders": return {
				title: "Work Orders & Job Execution",
				subtitle: "Dispatch technicians, allocate internal spares or vendor parts, and track job costs.",
				ctaLabel: "+ Create Work Order",
				ctaIcon: Plus,
				onCtaClick: () => setShowNewWoModal(true),
				cards: [
					{
						title: "Total Work Orders",
						value: workOrders.length,
						subtext: "Active & dispatched jobs",
						icon: ClipboardList,
						colorClass: "text-blue-600"
					},
					{
						title: "In-House Assigned",
						value: workOrders.filter((w) => w.assigneeType === "in_house").length,
						subtext: "Handled by field staff",
						icon: Users,
						colorClass: "text-indigo-600"
					},
					{
						title: "Contractor Dispatched",
						value: workOrders.filter((w) => w.assigneeType === "vendor").length,
						subtext: "Outsourced specialized MEP",
						icon: Building2,
						colorClass: "text-amber-600"
					},
					{
						title: "Total Job Cost (MTD)",
						value: `QAR ${workOrders.reduce((s, w) => s + w.totalCost, 0).toLocaleString()}`,
						subtext: "Labor + parts incurred",
						icon: DollarSign,
						colorClass: "text-emerald-600"
					}
				]
			};
			case "ppm": return {
				title: "Preventive Maintenance (PPM)",
				subtitle: "Recurring routine schedules, compliance inspection checklists, and statutory servicing.",
				ctaLabel: "+ Add PPM Schedule",
				ctaIcon: Plus,
				onCtaClick: () => setShowNewPpmModal(true),
				cards: [
					{
						title: "Active Schedules",
						value: ppmSchedules.length,
						subtext: "Recurring asset routines",
						icon: Calendar,
						colorClass: "text-blue-600"
					},
					{
						title: "Due in 30 Days",
						value: ppmSchedules.filter((p) => p.status === "Upcoming").length,
						subtext: "Upcoming inspection dates",
						icon: CircleAlert,
						colorClass: "text-amber-600"
					},
					{
						title: "Critical MEP Assets",
						value: ppmSchedules.filter((p) => [
							"HVAC",
							"Elevator",
							"Fire Safety"
						].includes(p.category)).length,
						subtext: "Statutory compliance",
						icon: ShieldCheck,
						colorClass: "text-indigo-600"
					},
					{
						title: "Estimated PPM Budget",
						value: `QAR ${ppmSchedules.reduce((s, p) => s + p.estimatedCost, 0).toLocaleString()}`,
						subtext: "Annual routine reserve",
						icon: DollarSign,
						colorClass: "text-emerald-600"
					}
				]
			};
			case "technicians": return {
				title: "Technicians & Maintenance Teams",
				subtitle: "Field staff directory, trade certifications, availability status, and workload allocation synchronized with HRMS / Staff Operations.",
				cards: [
					{
						title: "Total Field Staff",
						value: technicians.length,
						subtext: "Active in-house team",
						icon: Users,
						colorClass: "text-blue-600"
					},
					{
						title: "Available on Standby",
						value: technicians.filter((t) => t.status === "Available").length,
						subtext: "Ready for immediate dispatch",
						icon: CircleCheckBig,
						colorClass: "text-emerald-600"
					},
					{
						title: "On-Site Active",
						value: technicians.filter((t) => t.status === "On-Site").length,
						subtext: "Handling live work orders",
						icon: Wrench,
						colorClass: "text-amber-600"
					},
					{
						title: "Avg Tech Rating",
						value: "4.85 / 5.0",
						subtext: "Tenant satisfaction score",
						icon: Star,
						colorClass: "text-yellow-600"
					}
				]
			};
			case "inventory": return {
				title: "Spare Parts & Maintenance Inventory",
				subtitle: "Warehouse stock levels, min-max thresholds, and Procurement PR automated re-ordering.",
				ctaLabel: "+ Reorder via Procurement PR",
				ctaIcon: ShoppingCart,
				onCtaClick: () => {
					const part = stockCatalog[0];
					setProcurePartTarget(part);
					setPrForm({
						partName: part?.name || "AC Air Filter (24x24x2)",
						itemCode: part?.code || "HVAC-FLT-2024",
						qty: 20,
						estimatedCost: part?.unitCost || 65,
						property: "Al Sadd Commercial Tower",
						urgency: "HIGH",
						budgetHead: "Maintenance Items",
						notes: "Regular stock replenishment for warehouse"
					});
					setShowProcurePrModal(true);
				},
				cards: [
					{
						title: "Catalog Items Tracked",
						value: stockCatalog.length,
						subtext: "Warehouse SKU parts",
						icon: Package,
						colorClass: "text-blue-600"
					},
					{
						title: "Low Stock Alerts",
						value: stockCatalog.filter((p) => p.onHand <= p.minLevel).length,
						subtext: "Below reorder threshold",
						icon: TriangleAlert,
						colorClass: "text-red-600"
					},
					{
						title: "Warehouse Valuation",
						value: `QAR ${stockCatalog.reduce((s, p) => s + p.onHand * p.unitCost, 0).toLocaleString()}`,
						subtext: "Current inventory valuation",
						icon: DollarSign,
						colorClass: "text-emerald-600"
					},
					{
						title: "Procurement Restocks",
						value: "3 Active PRs",
						subtext: "In PR -> PO -> GRN pipeline",
						icon: ShoppingCart,
						colorClass: "text-indigo-600"
					}
				]
			};
			case "vendor_jobs": return {
				title: "Vendor Jobs & Accounts Payable",
				subtitle: "3rd-party specialist contractor jobs, parts billing, and direct AP invoice processing.",
				ctaLabel: role === "maintenance" ? void 0 : "+ Record Vendor AP Invoice",
				ctaIcon: Plus,
				onCtaClick: () => setShowVendorInvoiceModal(true),
				cards: [
					{
						title: "Contractor Invoices",
						value: vendorInvoices.length,
						subtext: "Direct AP bills registered",
						icon: FileText,
						colorClass: "text-blue-600"
					},
					{
						title: "Total AP Invoiced",
						value: `QAR ${vendorInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}`,
						subtext: "Queued to Finance AP",
						icon: CreditCard,
						colorClass: "text-violet-600"
					},
					{
						title: "Specialist Vendors",
						value: "5 Registered",
						subtext: "Carrier, Otis, Al Mana, QFM...",
						icon: Building2,
						colorClass: "text-indigo-600"
					},
					{
						title: "Pending Finance Approval",
						value: vendorInvoices.filter((i) => i.status === "Submitted").length,
						subtext: "Awaiting controller sign-off",
						icon: Clock,
						colorClass: "text-amber-600"
					}
				]
			};
			case "chargebacks": return {
				title: "Maintenance Costing & Tenant Chargebacks",
				subtitle: "Tenant accidental damage recoveries, security deposit deductions, and cost allocation.",
				ctaLabel: "+ Create Chargeback Notice",
				ctaIcon: Plus,
				onCtaClick: () => setShowNewChargebackModal(true),
				cards: [
					{
						title: "Tenant Chargeable Jobs",
						value: workOrders.filter((w) => w.chargebackToTenant).length,
						subtext: "Tenant damage liabilities",
						icon: CircleAlert,
						colorClass: "text-orange-600"
					},
					{
						title: "Billable Recovery Value",
						value: `QAR ${workOrders.filter((w) => w.chargebackToTenant).reduce((s, w) => s + w.totalCost, 0).toLocaleString()}`,
						subtext: "To recover from tenants",
						icon: DollarSign,
						colorClass: "text-red-600"
					},
					{
						title: "Deposit Deductions",
						value: "1 Settled",
						subtext: "Deducted on checkout",
						icon: CircleCheckBig,
						colorClass: "text-emerald-600"
					},
					{
						title: "Absorbed in OPEX",
						value: `QAR ${workOrders.filter((w) => !w.chargebackToTenant).reduce((s, w) => s + w.totalCost, 0).toLocaleString()}`,
						subtext: "Property operating expense",
						icon: Building2,
						colorClass: "text-slate-600"
					}
				]
			};
			default: return {
				title: "Maintenance Service Tickets",
				subtitle: "Intake customer requests, triage priority faults, and track resolution SLAs.",
				ctaLabel: role === "maintenance" ? void 0 : "+ Log Service Ticket",
				ctaIcon: Plus,
				onCtaClick: () => setShowNewTicketModal(true),
				cards: [
					{
						title: "Active Tickets",
						value: tickets.filter((t) => t.status !== "resolved").length,
						subtext: "Open or in progress",
						icon: Wrench,
						colorClass: "text-orange-600"
					},
					{
						title: "Urgent & High Priority",
						value: tickets.filter((t) => t.priority === "urgent" || t.priority === "high").length,
						subtext: "Immediate dispatch required",
						icon: TriangleAlert,
						colorClass: "text-red-600"
					},
					{
						title: "In Progress",
						value: tickets.filter((t) => t.status === "in_progress").length,
						subtext: "Under technician resolution",
						icon: Clock,
						colorClass: "text-blue-600"
					},
					{
						title: "Resolved (30d)",
						value: tickets.filter((t) => t.status === "resolved").length,
						subtext: "Successfully closed",
						icon: CircleCheckBig,
						colorClass: "text-emerald-600"
					}
				]
			};
		}
	}, [
		activeTab,
		tickets,
		workOrders,
		ppmSchedules,
		technicians,
		stockCatalog,
		vendorInvoices
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-bold tracking-tight",
					children: currentTabConfig.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground text-sm",
					children: currentTabConfig.subtitle
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: load,
						disabled: loading,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}` }), " Refresh"]
					}), currentTabConfig.ctaLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "bg-orange-600 hover:bg-orange-700 text-white",
						onClick: currentTabConfig.onCtaClick,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(currentTabConfig.ctaIcon, { className: "h-4 w-4 mr-1" }),
							" ",
							currentTabConfig.ctaLabel
						]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-4",
				children: currentTabConfig.cards.map((card, idx) => {
					const IconComp = card.icon;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border/60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-medium uppercase text-muted-foreground",
									children: card.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(IconComp, { className: `h-4 w-4 ${card.colorClass}` })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-2xl font-bold",
							children: card.value
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-[11px] text-muted-foreground mt-1",
							children: card.subtext
						})] })]
					}, idx);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: activeTab,
				onValueChange: (tab) => {
					const url = new URL(window.location.href);
					url.searchParams.set("tab", tab);
					window.history.pushState({}, "", url.toString());
				},
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "tickets",
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col sm:flex-row gap-2.5 bg-muted/20 p-3 rounded-xl border border-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "Search tickets by ID, title, description, assignee...",
										value: searchQuery,
										onChange: (e) => setSearchQuery(e.target.value),
										className: "pl-8 h-9 text-xs bg-background"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-3 gap-2 shrink-0 sm:w-[500px]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
											value: filterProperty,
											onValueChange: setFilterProperty,
											options: [{
												label: "All Properties",
												value: "all"
											}, ...dynamicPropertyList.map((p) => ({
												label: p,
												value: p
											}))],
											placeholder: "All Properties",
											searchPlaceholder: "Search property..."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
											value: filterCategory,
											onValueChange: setFilterCategory,
											options: [{
												label: "All Categories",
												value: "all"
											}, ...TICKET_CATEGORIES.map((cat) => ({
												label: cat,
												value: cat
											}))],
											placeholder: "All Categories",
											searchPlaceholder: "Search category..."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
											value: filterArea,
											onValueChange: setFilterArea,
											options: [{
												label: "All Areas",
												value: "all"
											}, ...COMPLAINT_AREAS.map((area) => ({
												label: area,
												value: area
											}))],
											placeholder: "All Areas",
											searchPlaceholder: "Search area..."
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap items-center gap-1.5 p-1.5 bg-muted/30 rounded-xl border border-border",
								children: [
									{
										key: "all",
										label: "All Tickets",
										count: tickets.length
									},
									{
										key: "new",
										label: "New Request",
										count: tickets.filter((t) => t.status === "new").length
									},
									{
										key: "assigned",
										label: "Assigned",
										count: tickets.filter((t) => t.status === "assigned" || t.status === "dispatched").length
									},
									{
										key: "in_progress",
										label: "In Progress",
										count: tickets.filter((t) => t.status === "in_progress").length
									},
									{
										key: "resolved",
										label: "Resolved / Closed",
										count: tickets.filter((t) => t.status === "resolved" || t.status === "completed" || t.status === "closed").length
									},
									{
										key: "cancelled",
										label: "Cancelled",
										count: tickets.filter((t) => t.status === "cancelled").length
									}
								].map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setTicketStatusTab(st.key),
									className: `px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${ticketStatusTab === st.key ? "bg-orange-600 text-white shadow-sm font-semibold" : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: st.label }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `text-[10px] px-1.5 py-0.2 rounded-full font-bold ${ticketStatusTab === st.key ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`,
										children: st.count
									})]
								}, st.key))
							}),
							loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex h-48 items-center justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-base font-bold",
									children: "Maintenance Service Tickets"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
									className: "text-xs",
									children: "Comprehensive log of all reported issues, fault triage, technician assignments, and SLA status."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-muted-foreground",
									children: [
										"Showing ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: filteredTickets.length
										}),
										" of ",
										tickets.length,
										" tickets"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "text-xs bg-muted/40",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "w-16",
											children: "Ticket #"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Issue & Scope" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Property & Unit / Scope" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Category" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Priority" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Assigned Staff / Vendor" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Reported By" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Date Logged" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-right",
											children: "Actions"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filteredTickets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									colSpan: 10,
									className: "text-center py-8 text-xs text-muted-foreground",
									children: "No service tickets found matching current filters."
								}) }) : filteredTickets.map((ticket) => {
									const isPersonal = !ticket.reported_by?.includes("Community");
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "text-xs hover:bg-muted/30",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "font-mono font-bold text-orange-600",
												children: ticket.id
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "max-w-xs",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-col gap-0.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-foreground truncate",
														title: ticket.title,
														children: ticket.title
													}), ticket.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[11px] text-muted-foreground truncate max-w-xs",
														title: ticket.description,
														children: ticket.description
													})]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium text-foreground",
													children: ticket.property || "Al Sadd Commercial Tower"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted-foreground",
													children: ticket.unit_ref || "General MEP"
												})]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-[10px] bg-muted/40 font-normal",
												children: ticket.category
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide capitalize ${PRIORITY_STYLES[ticket.priority] || ""}`,
												children: ticket.priority
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: ticket.assignee ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium text-foreground",
												children: ticket.assignee
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "secondary",
												className: "text-[10px] text-muted-foreground",
												children: "Unassigned"
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground",
													children: ticket.reported_by || "Tenant"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[9px] text-muted-foreground",
													children: isPersonal ? "Personal (Only Me)" : "Community (All)"
												})]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-muted-foreground font-mono",
												children: ticket.created_at ? ticket.created_at.slice(0, 10) : "2026-09-04"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: `text-[10px] capitalize font-medium ${ticket.status === "resolved" ? "bg-green-600 text-white" : ticket.status === "in_progress" ? "bg-blue-600 text-white" : ticket.status === "assigned" ? "bg-purple-600 text-white" : "bg-amber-600 text-white"}`,
												children: COLUMNS.find((c) => c.key === ticket.status)?.label || ticket.status
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "outline",
													className: "h-7 text-xs gap-1 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-orange-700 dark:text-orange-300",
													onClick: () => {
														setSelectedTicket(ticket);
														setEditStatus(ticket.status);
														let partsForTicket = ticketSparePartsMap[ticket.id] || [];
														if (partsForTicket.length === 0) {
															const linkedWo = workOrders.find((w) => w.ticketId === ticket.id);
															if (linkedWo?.spareParts && linkedWo.spareParts.length > 0) partsForTicket = linkedWo.spareParts.map((sp, i) => {
																const foundCatalog = stockCatalog.find((c) => c.code === (sp.code || sp.partCode) || c.id === sp.partId);
																return {
																	id: `sp-${ticket.id}-${i}-${Date.now()}`,
																	partId: foundCatalog ? foundCatalog.id : sp.partId || sp.code || `item-${i}`,
																	quantity: sp.quantity || sp.qty || 1
																};
															});
														}
														setTicketSpareParts(partsForTicket);
														setVendorInvoiceRaised(false);
														setVendorPartForm({
															vendorName: "Carrier Middle East Qatar",
															partDescription: "",
															quantity: 1,
															unitPrice: 0,
															invoiceNo: "",
															glAccount: "52100001 - Building Maintenance Expense"
														});
													},
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }),
														" View / Edit",
														(ticketComments[ticket.id]?.length || 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "secondary",
															className: "ml-0.5 text-[9px] px-1 py-0 h-3.5 bg-orange-100 text-orange-800",
															children: ticketComments[ticket.id].length
														})
													]
												})
											})
										]
									}, ticket.id);
								}) })] })
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "work_orders",
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex flex-wrap items-center gap-1.5",
							children: [
								{
									key: "all",
									label: "All",
									count: workOrders.length
								},
								{
									key: "scheduled",
									label: "Scheduled",
									count: workOrders.filter((w) => w.status === "scheduled").length
								},
								{
									key: "in_progress",
									label: "In Progress",
									count: workOrders.filter((w) => w.status === "in_progress").length
								},
								{
									key: "completed",
									label: "Completed",
									count: workOrders.filter((w) => w.status === "completed").length
								},
								{
									key: "cancelled",
									label: "Cancelled",
									count: workOrders.filter((w) => w.status === "cancelled").length
								}
							].map((st) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setWoStatusTab(st.key),
								className: `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${woStatusTab === st.key ? st.key === "completed" ? "bg-green-600 text-white border-green-600 shadow-sm" : st.key === "in_progress" ? "bg-blue-600 text-white border-blue-600 shadow-sm" : st.key === "scheduled" ? "bg-purple-600 text-white border-purple-600 shadow-sm" : st.key === "cancelled" ? "bg-red-500 text-white border-red-500 shadow-sm" : "bg-orange-600 text-white border-orange-600 shadow-sm" : "bg-background text-muted-foreground border-border hover:bg-muted/60"}`,
								children: [st.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `text-[10px] font-bold px-1 py-0 rounded-full ${woStatusTab === st.key ? "bg-white/20" : "bg-muted text-muted-foreground"}`,
									children: st.count
								})]
							}, st.key))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: "Work Orders & Job Execution"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardDescription, {
								className: "text-xs",
								children: ["Dispatch technicians, allocate spares or vendor parts, track job costs and sign-offs.", woStatusTab !== "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-1 font-semibold text-foreground capitalize",
									children: ["— Showing: ", woStatusTab.replace("_", " ")]
								})]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "text-[11px]",
								children: [
									filteredWorkOrders.length,
									" job",
									filteredWorkOrders.length !== 1 ? "s" : ""
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "text-xs bg-muted/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "WO #" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Job Title & Scope" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Property / Unit" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Category" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Assigned To" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Schedule Date" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Total Cost"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Actions"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: filteredWorkOrders.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
								colSpan: 9,
								className: "text-center py-8 text-xs text-muted-foreground",
								children: "No work orders found for the selected status."
							}) }) : filteredWorkOrders.map((wo) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "text-xs hover:bg-muted/30",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-mono font-bold text-orange-600",
										children: wo.id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-medium max-w-xs truncate",
										title: wo.scopeOfWork,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: wo.title }), wo.chargebackToTenant && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: "text-[9px] px-1 py-0 h-3.5 bg-rose-600 w-fit mt-0.5",
												children: "Tenant Chargeback"
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [
										wo.property,
										" (",
										wo.unitRef,
										")"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-[10px]",
										children: wo.category
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: wo.technicianName || wo.vendorName
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground",
											children: wo.assigneeType === "in_house" ? "In-House Staff" : "3rd-Party Vendor"
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: wo.scheduledDate }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "text-right font-mono font-bold",
										children: ["QAR ", wo.totalCost.toLocaleString()]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: wo.status,
										onValueChange: (val) => handleUpdateWorkOrderStatus(wo.id, val),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: `h-6 text-[11px] font-semibold w-32 border-0 shadow-none px-2 ${wo.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300" : wo.status === "in_progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300" : wo.status === "scheduled" ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300" : wo.status === "cancelled" ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"}`,
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "scheduled",
												children: "Scheduled"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "in_progress",
												children: "In Progress"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "completed",
												children: "Completed"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "cancelled",
												children: "Cancelled"
											})
										] })]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "outline",
											className: "h-7 text-xs gap-1 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-orange-700 dark:text-orange-300",
											onClick: () => setSelectedWoForDetail(wo),
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3 w-3" }),
												" Details",
												(woComments[wo.id]?.length || 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "secondary",
													className: "ml-0.5 text-[9px] px-1 py-0 h-3.5 bg-orange-100 text-orange-800",
													children: woComments[wo.id].length
												})
											]
										})
									})
								]
							}, wo.id)) })] })
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "ppm",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: "Preventive Maintenance (PPM) Schedules"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "Automated routine servicing for central chillers, elevators, fire systems, pumps, and water tanks."
							})] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "text-xs bg-muted/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "PPM Code" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Maintenance Task" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Property & Unit / Scope" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Frequency" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Next Due Date" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Contractor / Vendor" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Est. Budget"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Checklist Items" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Actions"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: ppmSchedules.map((ppm) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "text-xs hover:bg-muted/30",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-mono font-bold text-blue-600",
										children: ppm.id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-medium",
										children: ppm.title
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-col",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-foreground",
											children: ppm.property
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground mt-0.5",
											children: ppm.scopeType === "property" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-[9px] px-1 py-0 h-3.5 bg-blue-50/50 text-blue-700 dark:bg-blue-950/40",
												children: "Entire Property"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-[9px] px-1 py-0 h-3.5 bg-purple-50/50 text-purple-700 dark:bg-purple-950/40",
												children: ppm.unitRef || "Specific Unit"
											})
										})]
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "secondary",
										className: "text-[10px]",
										children: ppm.frequency
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-semibold text-orange-600",
										children: ppm.nextDueDate
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: ppm.assignedVendorName || "In-House Team" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "text-right font-mono font-bold",
										children: ["QAR ", ppm.estimatedCost.toLocaleString()]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "text-muted-foreground",
										children: [ppm.checklist.length, " checklist checkpoints"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											variant: "outline",
											className: "h-7 text-xs gap-1 border-orange-200 hover:bg-orange-50 text-orange-700 dark:text-orange-300 font-medium",
											onClick: () => {
												setSelectedPpmForWo(ppm);
												setPpmWoForm({
													title: `${ppm.title} - [PPM Service]`,
													scheduledDate: ppm.nextDueDate,
													scopeOfWork: `Checklist Requirements:\n` + ppm.checklist.map((c, i) => `${i + 1}. ${c}`).join("\n"),
													assigneeType: ppm.assignedVendorName ? "vendor" : "in_house",
													vendorName: ppm.assignedVendorName || "Carrier Middle East Qatar",
													technicianName: "Faisal Tariq (HVAC Specialist)",
													estimatedCost: ppm.estimatedCost
												});
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3 w-3" }), " Generate WO"]
										})
									})
								]
							}, ppm.id)) })] })
						})] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "technicians",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: "In-House Maintenance Technicians"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "Capacity management, skills directory, contact details, and performance scores."
							})] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "text-xs bg-muted/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Technician Name" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Primary Trade Specialty" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Contact Phone" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Active Jobs" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Status" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Completed Jobs"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Rating"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: technicians.map((tech) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "text-xs hover:bg-muted/30",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-semibold",
										children: tech.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-[10px]",
										children: tech.specialty
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "font-mono text-muted-foreground",
										children: tech.phone
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "font-bold text-orange-600",
										children: [tech.activeWorkload, " active"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										className: `text-[10px] ${tech.status === "Available" ? "bg-green-600" : tech.status === "On-Site" ? "bg-blue-600" : "bg-slate-500"}`,
										children: tech.status
									}) }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										className: "text-right font-mono font-bold",
										children: tech.completedJobsCount
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
										className: "text-right font-mono text-amber-500 font-bold",
										children: ["⭐ ", tech.rating]
									})
								]
							}, tech.id)) })] })
						})] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "inventory",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "flex flex-row items-center justify-between pb-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: "Facility Spare Parts Warehouse"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "Real-time shelf counts, bin locations, and direct integration to Procurement via Purchase Requests (PR)."
							})] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "text-xs bg-muted/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Item Code" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Part Name & Spec" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Category" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "On Hand"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Min Reorder Level"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "UOM" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Unit Cost (QAR)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Bin Location" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Stock Status" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Procurement Action"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: stockCatalog.map((part) => {
								const isLow = part.onHand <= part.minLevel;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "text-xs hover:bg-muted/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono font-bold text-primary",
											children: part.code
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-medium",
											children: part.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: "text-[10px]",
											children: part.category
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-right font-mono font-bold",
											children: part.onHand
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-right font-mono text-amber-600",
											children: part.minLevel
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-muted-foreground",
											children: part.uom
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
											className: "text-right font-mono font-bold",
											children: ["QAR ", part.unitCost]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-muted-foreground",
											children: part.location
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: isLow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: "text-[10px] bg-amber-500 hover:bg-amber-600",
											children: "Low Stock"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: "text-[10px] bg-emerald-600 hover:bg-emerald-700",
											children: "In Stock"
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: isLow ? "default" : "outline",
												className: `h-7 text-xs gap-1 ${isLow ? "bg-orange-600 hover:bg-orange-700 text-white" : ""}`,
												onClick: () => {
													setProcurePartTarget(part);
													setPrForm({
														partName: part.name,
														itemCode: part.code,
														qty: part.minLevel * 2,
														estimatedCost: part.unitCost,
														property: "Al Sadd Commercial Tower",
														urgency: isLow ? "HIGH" : "NORMAL",
														budgetHead: "Maintenance Items",
														notes: `Restock request for facility inventory bin: ${part.location}`
													});
													setShowProcurePrModal(true);
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-3 w-3" }), " Procure via PR"]
											})
										})
									]
								}, part.id);
							}) })] })
						})] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "vendor_jobs",
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-center justify-between gap-2 p-3 bg-muted/20 border border-border rounded-xl",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground",
										children: "Vendor Work Invoicing & AP Sync"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: "Raise final AP payable invoices for completed vendor contractor jobs, or record chargeable internal stock. Raised invoices are automatically synced to Finance → Payable Invoice & General Ledger."
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex items-center gap-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										className: "h-8 text-xs gap-1.5 border-blue-300 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-medium",
										onClick: () => setShowInHouseMaterialModal(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5 text-blue-600" }), " + Record In-House Chargeable Material"]
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
								className: "border-border",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "flex flex-row items-center justify-between pb-3 bg-muted/20 border-b border-border/60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
										className: "text-sm font-semibold flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-4 w-4 text-violet-600" }), "Completed 3rd-Party Vendor Work Orders (Pending AP Invoicing)"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
										className: "text-xs",
										children: "Work orders successfully completed by outsourced vendors ready to raise final AP invoices with items and costs."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										className: "text-[11px] bg-violet-50 text-violet-700 border-violet-200 font-medium",
										children: [workOrders.filter((w) => w.assigneeType === "vendor" && w.status === "completed").length, " Completed Jobs"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
									className: "p-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "text-xs bg-muted/40",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "WO #" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "3rd-Party Vendor" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Property & Unit / Scope" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Completed Date" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Items & Materials Used / Scope" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "text-right",
												children: "Total Cost (QAR)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "text-right",
												children: "Action"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: (() => {
										const completedVendorWos = workOrders.filter((w) => w.assigneeType === "vendor" && w.status === "completed");
										if (completedVendorWos.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											colSpan: 7,
											className: "text-center py-6 text-xs text-muted-foreground",
											children: "No completed 3rd-party vendor work orders pending invoice."
										}) });
										return completedVendorWos.map((wo) => {
											const itemsSummary = wo.spareParts && wo.spareParts.length > 0 ? wo.spareParts.map((s) => `${s.quantity || 1}x ${s.name}`).join(", ") : wo.scopeOfWork;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
												className: "text-xs hover:bg-muted/30",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "font-mono font-bold text-orange-600",
														children: wo.id
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "font-semibold text-foreground",
														children: wo.vendorName || "Outsourced Vendor"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex flex-col",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-medium text-foreground",
															children: wo.property
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground",
															children: wo.unitRef
														})]
													}) }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "font-mono text-muted-foreground",
														children: wo.completionDate || wo.scheduledDate
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "max-w-xs truncate",
														title: itemsSummary,
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex flex-col",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-medium text-foreground truncate",
																children: wo.title
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-[10px] text-muted-foreground truncate",
																children: itemsSummary
															})]
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
														className: "text-right font-mono font-bold text-emerald-600",
														children: ["QAR ", wo.totalCost.toLocaleString()]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "text-right",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															size: "sm",
															className: "h-7 text-xs bg-violet-600 hover:bg-violet-700 text-white gap-1",
															onClick: () => {
																setVendorInvModalForm({
																	invoiceNo: `INV-WO-${wo.id.replace("WO-", "")}`,
																	vendorName: wo.vendorName || "Carrier Middle East Qatar",
																	property: wo.property,
																	unitRef: wo.unitRef,
																	amount: wo.totalCost,
																	taxRate: 0,
																	costCenter: "CC-101",
																	partsDescription: itemsSummary,
																	labourDescription: `Final contractor maintenance invoice for ${wo.title} (${wo.id})`,
																	glAccount: "52100001",
																	paymentMode: "Bank Wire / Electronic Transfer (QNB)",
																	paymentTerms: "Net 30 Days",
																	settlementMode: "Bank Wire / Electronic Transfer (QNB)",
																	receiptFileName: "",
																	receiptAttachment: ""
																});
																setShowVendorInvoiceModal(true);
															},
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5" }), " Raise AP Invoice"]
														})
													})
												]
											}, wo.id);
										});
									})() })] })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-base",
									children: "Posted Vendor Maintenance Invoices & AP Sync"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
									className: "text-xs",
									children: "Invoices raised directly by 3rd-party maintenance contractors from Vendor Management, synced into Finance AP."
								})] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "text-xs bg-muted/40",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Invoice #" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Contractor / Vendor" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Ticket #" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Property / Unit" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Payment Terms & Settlement" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Parts & Labor Details" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "GL Account" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "text-right",
											children: "Total (QAR)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Finance Status" })
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: vendorInvoices.map((inv) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "text-xs hover:bg-muted/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono font-bold text-violet-600",
											children: inv.invoiceNo
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-semibold",
											children: inv.vendorName
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono",
											children: inv.ticketId
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [
											inv.property,
											" (",
											inv.unitRef,
											")"
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-0.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium text-foreground",
												children: inv.paymentTerms || "Net 30 Days"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground",
												children: inv.settlementMode || inv.paymentMode || "Bank Wire / Electronic Transfer (QNB)"
											})]
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "max-w-xs truncate",
											title: inv.partsDescription,
											children: inv.partsDescription
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-[11px] font-mono text-muted-foreground",
											children: inv.glAccount
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
											className: "text-right",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-bold text-emerald-600",
												children: ["QAR ", inv.amount.toLocaleString()]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[10px] text-muted-foreground font-mono",
												children: [
													"Base: ",
													Number(inv.baseAmount || inv.amount - (inv.taxAmount || 0)).toLocaleString(),
													" | Tax: ",
													Number(inv.taxAmount || 0).toLocaleString()
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: `text-[10px] ${inv.status === "Approved" ? "bg-green-600" : "bg-amber-600"}`,
											children: inv.status
										}) })
									]
								}, inv.id)) })] })
							})] })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "chargebacks",
						className: "space-y-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
							className: "pb-3 flex flex-row items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: "Tenant Maintenance Cost Allocation & Chargebacks"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
								className: "text-xs",
								children: "Automated lease liability resolution: Landlord Opex vs. Tenant Damage Billing with complete Work Order itemization."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white gap-1.5",
								onClick: () => setShowNewChargebackModal(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Issue Tenant Chargeback"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
								className: "text-xs bg-muted/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "WO / Ticket #" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Property & Unit" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Service & Scope Provided" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Items / Materials Utilized" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Responsibility Rule" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Charge Reason" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
										className: "text-right",
										children: "Cost Breakdown (QAR)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, { children: "Billing Status" })
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: workOrders.map((wo) => {
								const linkedTicket = tickets.find((t) => t.id === wo.ticketId);
								const itemsText = wo.scopeOfWork ? wo.scopeOfWork : `${wo.title}`;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "text-xs hover:bg-muted/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-mono font-bold text-primary",
											children: wo.id
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-[10px] text-muted-foreground font-mono flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Ticket:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold text-orange-600",
												children: wo.ticketId || linkedTicket?.id || "T-GEN"
											})]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-semibold text-foreground",
											children: wo.property
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[11px] text-muted-foreground font-mono",
											children: wo.unitRef
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
											className: "max-w-xs",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-medium text-foreground",
													children: wo.title
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[11px] text-muted-foreground line-clamp-2 mt-0.5",
													children: itemsText
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[10px] text-primary/80 mt-0.5",
													children: ["Assigned: ", wo.technicianName || wo.vendorName || "In-House Team"]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "max-w-[200px]",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[11px] font-mono bg-muted/50 p-1.5 rounded border border-border/60",
												children: wo.id === "WO-2026-003" ? "Custom Double-Glazed Glass Panel (1x) + Mortise Lock Latch" : wo.id === "WO-2026-001" ? "Honeywell Modulating 2-Way Actuator Valve (1x) + R410A Freon Gas" : wo.id === "WO-2026-002" ? "Digital Pressure Transducer 0-10 Bar (1x) + Switch Assembly" : `Warehouse Part / Materials for ${wo.category}`
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: wo.chargebackToTenant ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											className: "text-[10px] bg-rose-600 hover:bg-rose-700",
											children: "Tenant Responsibility"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "secondary",
											className: "text-[10px]",
											children: "Landlord Opex Expense"
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-muted-foreground text-[11px]",
											children: wo.tenantChargeReason || (wo.chargebackToTenant ? "Tenant Move-in/out Damage" : "Normal Wear & Tear")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
											className: "text-right font-mono",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "font-bold text-foreground",
												children: ["QAR ", wo.totalCost.toLocaleString()]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[10px] text-muted-foreground",
												children: [
													"Labor: ",
													wo.labourCost || 0,
													" | Mat: ",
													wo.materialsCost || 0
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: wo.chargebackToTenant ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: "text-[10px] border-rose-400 text-rose-600 bg-rose-50/30",
											children: wo.chargebackStatus || "AR Invoice Queued"
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: "text-[10px] border-slate-300 text-slate-600",
											children: "Absorbed in Opex"
										}) })
									]
								}, wo.id);
							}) })] })
						})] })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!selectedTicket,
				onOpenChange: (open) => {
					if (!open) setSelectedTicket(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-3xl max-h-[90vh] overflow-y-auto",
					onPointerDownOutside: (e) => e.preventDefault(),
					onInteractOutside: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-2 pr-6",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-lg font-bold",
								children: selectedTicket?.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
								className: "text-xs flex items-center gap-2 mt-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono font-bold text-orange-600",
										children: selectedTicket?.id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-[10px]",
										children: selectedTicket?.category
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: selectedTicket?.unit_ref })
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
									children: selectedTicket?.reported_by?.includes("Community") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "h-3 w-3" }), " Community (All)"]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "h-3 w-3" }), " Personal (Only Me)"]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide capitalize ${selectedTicket ? PRIORITY_STYLES[selectedTicket.priority] : ""}`,
									children: selectedTicket?.priority
								})]
							})]
						}) }),
						selectedTicket && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-lg bg-muted/40 p-3.5 text-xs space-y-2 border border-border/60",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2 text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: "Reported By:"
										}),
										" ",
										selectedTicket.reported_by || "Tenant"
									] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: "Date Logged:"
										}),
										" ",
										selectedTicket.created_at
									] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pt-1 border-t border-border/40",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-semibold text-foreground",
										children: "Description & Symptoms:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-foreground/90 whitespace-pre-wrap leading-relaxed",
										children: selectedTicket.description || "No further details provided."
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
								defaultValue: "timeline",
								className: "w-full",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
										className: "grid grid-cols-2 w-full h-8 bg-muted/60",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
											value: "timeline",
											className: "text-xs gap-1.5 h-7",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3.5 w-3.5 text-orange-600" }),
												" Comments & Attachments Timeline",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "secondary",
													className: "ml-1 text-[9px] px-1 py-0 h-3.5 bg-orange-100 text-orange-800",
													children: ticketComments[selectedTicket.id]?.length || 0
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
											value: "parts_sourcing",
											className: "text-xs gap-1.5 h-7",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3.5 w-3.5 text-blue-600" }), " Parts Sourcing & Dispatch"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
										value: "timeline",
										className: "space-y-3 pt-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "rounded-lg border border-border p-3 space-y-3 bg-muted/10 max-h-[260px] overflow-y-auto",
											children: (ticketComments[selectedTicket.id]?.length || 0) === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-center py-6 text-xs text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-6 w-6 mx-auto mb-1.5 opacity-40" }), "No comments or attachments logged yet. Post an update below."]
											}) : ticketComments[selectedTicket.id]?.map((cmt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-2.5 rounded-lg bg-background border border-border/70 space-y-1.5 shadow-sm",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center justify-between text-[11px]",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-1.5 font-medium",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-foreground",
																children: cmt.author
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																variant: "outline",
																className: `text-[9px] px-1 py-0 h-3.5 ${cmt.role === "Tenant" ? "bg-emerald-50 text-emerald-700 border-emerald-300" : cmt.role === "Technician" ? "bg-blue-50 text-blue-700 border-blue-300" : cmt.role === "Vendor" ? "bg-violet-50 text-violet-700 border-violet-300" : "bg-amber-50 text-amber-700 border-amber-300"}`,
																children: cmt.role
															})]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground font-mono",
															children: cmt.timestamp
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap",
														children: cmt.comment
													}),
													cmt.attachments && cmt.attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "flex flex-wrap gap-1.5 pt-1",
														children: cmt.attachments.map((att, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-[10px] font-mono text-muted-foreground border border-border",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-3 w-3 text-orange-600" }),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: att.name }),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "opacity-60",
																	children: [
																		"(",
																		att.size,
																		")"
																	]
																})
															]
														}, idx))
													})
												]
											}, cmt.id))
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border border-border/80 p-3 space-y-2.5 bg-background",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-xs font-semibold flex items-center gap-1 text-foreground",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3.5 w-3.5 text-orange-600" }), " Add Comment or Attachment"]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-1.5 text-xs",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-[11px] text-muted-foreground",
															children: "Posting As:"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "outline",
															className: "text-[11px] font-medium bg-muted/60 text-foreground border-border px-2 py-0.5 rounded",
															children: role === "admin" ? "Admin Operations" : role === "owner" ? "Property Owner" : "Property Manager"
														})]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
													placeholder: "Type comment, technician diagnostic notes, tenant feedback...",
													value: newTicketCommentText,
													onChange: (e) => setNewTicketCommentText(e.target.value),
													className: "text-xs min-h-[50px]"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-1.5 flex-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															placeholder: "Attach filename (e.g. photo_defect.jpg, repair_slip.pdf)",
															value: newTicketCommentFile,
															onChange: (e) => setNewTicketCommentFile(e.target.value),
															className: "h-7 text-xs font-mono"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														className: "h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white shrink-0",
														onClick: () => handleAddTicketComment(selectedTicket.id),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3 w-3 mr-1" }), " Post Update"]
													})]
												})
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
										value: "parts_sourcing",
										className: "space-y-3 pt-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border border-border p-3.5 space-y-3 bg-muted/10",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
													className: "font-bold text-xs uppercase tracking-wider text-foreground",
													children: "Parts & Material Sourcing"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: partSourceMode === "warehouse" ? "default" : "outline",
														className: "h-7 text-xs",
														onClick: () => setPartSourceMode("warehouse"),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3 w-3 mr-1" }), " Internal Warehouse Stock"]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: partSourceMode === "vendor" ? "default" : "outline",
														className: "h-7 text-xs",
														onClick: () => setPartSourceMode("vendor"),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3 w-3 mr-1" }), " Vendor Provided & Invoiced"]
													})]
												})]
											}), partSourceMode === "warehouse" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-3 pt-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-1 md:grid-cols-12 gap-2 items-end",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "md:col-span-7",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-[11px]",
																children: "Select Warehouse Spare Part"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
																value: selectedWarehousePartId,
																onValueChange: setSelectedWarehousePartId,
																options: stockCatalog.map((p) => ({
																	label: p.name,
																	value: p.id,
																	subtext: `${p.onHand} in stock · QAR ${p.unitCost}`
																})),
																placeholder: "Select in-stock part...",
																searchPlaceholder: "Search warehouse items..."
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "md:col-span-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-[11px]",
																children: "Qty"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "number",
																min: "1",
																value: warehouseQty,
																onChange: (e) => setWarehouseQty(Math.max(1, Number(e.target.value))),
																className: "h-8 text-xs font-mono"
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "md:col-span-3",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																size: "sm",
																className: "h-8 text-xs w-full bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700",
																onClick: () => {
																	const part = stockCatalog.find((p) => p.id === selectedWarehousePartId);
																	if (!part) {
																		toast.error("Please select a spare part first");
																		return;
																	}
																	if (part.onHand < warehouseQty) toast.warning(`Insufficient stock (${part.onHand} on hand). You can still add the line or raise a PR.`);
																	setTicketSpareParts((prev) => {
																		const existingIdx = prev.findIndex((item) => item.partId === part.id);
																		if (existingIdx >= 0) {
																			const updated = [...prev];
																			updated[existingIdx].quantity += warehouseQty;
																			return updated;
																		}
																		return [...prev, {
																			id: `item-${Date.now()}-${Math.random()}`,
																			partId: part.id,
																			quantity: warehouseQty
																		}];
																	});
																	toast.success(`Added ${warehouseQty}x ${part.name} to required parts list`);
																	setSelectedWarehousePartId("");
																	setWarehouseQty(1);
																},
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5 mr-1" }), " Add Part Line"]
															})
														})
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "rounded-lg border border-border bg-background p-2.5 space-y-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center justify-between text-xs font-semibold text-foreground",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
															"Allocated Spare Parts (",
															ticketSpareParts.length,
															" items)"
														] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[11px] text-muted-foreground font-normal",
															children: "Parts will be issued & deducted upon clicking \"Save Updates\""
														})]
													}), ticketSpareParts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "py-4 text-center text-xs text-muted-foreground border border-dashed border-border rounded",
														children: "No warehouse parts added yet. Select an item above and click \"Add Part Line\"."
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5 max-h-48 overflow-y-auto",
														children: [ticketSpareParts.map((item) => {
															const part = stockCatalog.find((p) => p.id === item.partId);
															if (!part) return null;
															const isLowStock = part.onHand < item.quantity;
															return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center justify-between p-2 rounded border border-border/80 bg-muted/20 text-xs gap-2",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "flex-1 min-w-0",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																		className: "font-medium text-foreground truncate flex items-center gap-1.5",
																		children: [
																			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: part.name }),
																			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																				className: "font-mono text-[10px] text-muted-foreground",
																				children: [
																					"(",
																					part.code,
																					")"
																				]
																			}),
																			isLowStock && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
																				variant: "destructive",
																				className: "text-[9px] px-1 py-0 h-4",
																				children: [
																					"Low Stock (",
																					part.onHand,
																					" avail)"
																				]
																			})
																		]
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																		className: "text-[10px] text-muted-foreground",
																		children: [
																			"QAR ",
																			part.unitCost,
																			" / ",
																			part.uom,
																			" · Stock: ",
																			part.onHand,
																			" on hand · Location: ",
																			part.location
																		]
																	})]
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "flex items-center gap-2 shrink-0",
																	children: [
																		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																			className: "flex items-center gap-1",
																			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																				className: "text-[10px] text-muted-foreground",
																				children: "Qty:"
																			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																				type: "number",
																				min: "1",
																				value: item.quantity,
																				onChange: (e) => {
																					const newQty = Math.max(1, Number(e.target.value));
																					setTicketSpareParts((prev) => prev.map((p) => p.id === item.id ? {
																						...p,
																						quantity: newQty
																					} : p));
																				},
																				className: "h-7 w-16 text-xs font-mono text-center"
																			})]
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																			className: "font-mono font-bold text-foreground text-xs w-20 text-right",
																			children: ["QAR ", (part.unitCost * item.quantity).toLocaleString()]
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																			variant: "outline",
																			className: "text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-medium shrink-0 h-6",
																			children: "Allocated to Ticket"
																		})
																	]
																})]
															}, item.id);
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex justify-between items-center pt-2 border-t border-border/60 text-xs font-semibold px-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Estimated Materials Total:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "font-mono text-orange-600 font-bold",
																children: ["QAR ", ticketSpareParts.reduce((acc, item) => {
																	const part = stockCatalog.find((p) => p.id === item.partId);
																	return acc + (part ? part.unitCost * item.quantity : 0);
																}, 0).toLocaleString()]
															})]
														})]
													})]
												})]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-3 pt-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-2 gap-2.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-[11px]",
														children: "Certified Vendor (Vendor Master)"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: vendorPartForm.vendorName,
														onValueChange: (v) => setVendorPartForm((f) => ({
															...f,
															vendorName: v
														})),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "h-8 text-xs",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Carrier Middle East Qatar",
																children: "Carrier Middle East Qatar"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Qatar Facilities Management (QFM)",
																children: "Qatar Facilities Management (QFM)"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Al Mana Engineering & Maintenance",
																children: "Al Mana Engineering & Maintenance"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Otis Elevator Qatar WLL",
																children: "Otis Elevator Qatar WLL"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Doha Fire Protection Solutions",
																children: "Doha Fire Protection Solutions"
															})
														] })]
													})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-[11px]",
														children: "Vendor Work Order / Dispatch Ref"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														placeholder: "e.g. VWO-2026-081",
														value: vendorPartForm.invoiceNo,
														onChange: (e) => setVendorPartForm((f) => ({
															...f,
															invoiceNo: e.target.value
														})),
														className: "h-8 text-xs font-mono"
													})] })]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3 rounded-lg border border-border/80 bg-background space-y-2.5",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center justify-between",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "font-semibold text-xs text-foreground flex items-center gap-1.5",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5 text-orange-600" }), " Vendor Service & Estimated Charges"]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																variant: vendorInvoiceRaised ? "default" : "outline",
																className: vendorInvoiceRaised ? "bg-emerald-600 text-[10px]" : "text-[10px] text-muted-foreground",
																children: vendorInvoiceRaised ? "Initial Estimate Recorded" : "Estimated Amount (Initial)"
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "text-[11px] text-muted-foreground",
															children: [
																"The amount entered here is an ",
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
																	className: "text-foreground",
																	children: "estimated budget"
																}),
																" for reference. The actual final invoice, AP posting, and approval will be finalized via the ",
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
																	className: "text-foreground",
																	children: "Vendor Jobs & AP"
																}),
																" sub-module. Final settlement is performed under ",
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
																	className: "text-foreground",
																	children: "Finance > Payable Invoice"
																}),
																"."
															]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-[11px]",
																children: "Part / Service Scope Description"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																placeholder: "e.g. Copper coil brazing, compressor capacitor",
																value: vendorPartForm.partDescription,
																onChange: (e) => setVendorPartForm((f) => ({
																	...f,
																	partDescription: e.target.value
																})),
																className: "h-8 text-xs"
															})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-[11px]",
																children: "Estimated Cost / Quote (QAR)"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "number",
																placeholder: "0.00",
																value: vendorPartForm.unitPrice || "",
																onChange: (e) => setVendorPartForm((f) => ({
																	...f,
																	unitPrice: Number(e.target.value)
																})),
																className: "h-8 text-xs font-mono"
															})] })]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center justify-between pt-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-[10px] text-muted-foreground italic",
																children: "* Final bill settlement processed in Finance > Payable Invoice"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																size: "sm",
																disabled: vendorInvoiceRaised,
																className: "h-8 text-xs bg-violet-600 hover:bg-violet-700 text-white",
																onClick: () => {
																	if (!vendorPartForm.unitPrice || vendorPartForm.unitPrice <= 0) {
																		toast.error("Please enter the estimated amount");
																		return;
																	}
																	handleAddVendorInvoice();
																	setVendorInvoiceRaised(true);
																},
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3 w-3 mr-1" }), vendorInvoiceRaised ? "Estimate Linked to AP" : "Record Vendor Estimate to AP"]
															})]
														})
													]
												})]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3 pt-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs",
												children: "Update Status"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: editStatus || "",
												onValueChange: (v) => setEditStatus(v),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: COLUMNS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: c.key,
													children: c.label
												}, c.key)) })]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs",
												children: "Technician / Vendor Assignee"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: editAssignee || "",
												onChange: (e) => setEditAssignee(e.target.value),
												className: "h-8 text-xs",
												placeholder: "e.g. Faisal Tariq"
											})] })]
										})]
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "mt-2 flex items-center justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setSelectedTicket(null),
								children: "Close"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "bg-orange-600 hover:bg-orange-700 text-white font-medium shadow-sm",
								onClick: async () => {
									if (!selectedTicket) return;
									let issuedSummary = [];
									let calculatedMaterialsCost = 0;
									const consolidatedSparePartsMap = /* @__PURE__ */ new Map();
									ticketSpareParts.forEach((item) => {
										consolidatedSparePartsMap.set(item.partId, (consolidatedSparePartsMap.get(item.partId) || 0) + Number(item.quantity || 1));
									});
									const issuedPartsList = [];
									if (consolidatedSparePartsMap.size > 0) {
										setStockCatalog((prevCatalog) => {
											let updatedCatalog = [...prevCatalog];
											consolidatedSparePartsMap.forEach((qty, partId) => {
												const part = updatedCatalog.find((p) => p.id === partId);
												if (part) {
													updatedCatalog = updatedCatalog.map((p) => p.id === part.id ? {
														...p,
														onHand: Math.max(0, p.onHand - qty)
													} : p);
													issuedSummary.push(`${qty}x ${part.name}`);
													calculatedMaterialsCost += part.unitCost * qty;
													issuedPartsList.push({
														partId: part.id,
														code: part.code,
														name: part.name,
														quantity: qty,
														unitCost: part.unitCost
													});
												}
											});
											return updatedCatalog;
										});
										setTicketSparePartsMap((prev) => ({
											...prev,
											[selectedTicket.id]: ticketSpareParts
										}));
									}
									const assignedTechnicianOrVendor = editAssignee || selectedTicket.assignee || "Faisal Tariq (Field Lead)";
									const newWoId = `WO-2026-${(workOrders.length + 1).toString().padStart(3, "0")}`;
									const targetProperty = dynamicPropertyList.find((p) => selectedTicket.unit_ref && dynamicPropertyUnitsMap[p]?.includes(selectedTicket.unit_ref)) || selectedTicket.unit_ref || "Al Sadd Commercial Tower";
									const newWo = {
										id: newWoId,
										ticketId: selectedTicket.id,
										title: selectedTicket.title,
										property: targetProperty,
										unitRef: selectedTicket.unit_ref || "General Area",
										category: selectedTicket.category || "General Maintenance",
										priority: selectedTicket.priority,
										status: "scheduled",
										assigneeType: "in_house",
										technicianName: assignedTechnicianOrVendor,
										scheduledDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
										labourCost: 150,
										materialsCost: calculatedMaterialsCost > 0 ? calculatedMaterialsCost : 100,
										totalCost: 150 + (calculatedMaterialsCost > 0 ? calculatedMaterialsCost : 100),
										chargebackToTenant: false,
										scopeOfWork: `Executed from Ticket ${selectedTicket.id}: ${editDescription || selectedTicket.description || selectedTicket.title}${issuedSummary.length > 0 ? ` | Issued Spares: ${issuedSummary.join(", ")}` : ""}`,
										spareParts: issuedPartsList.length > 0 ? issuedPartsList : void 0
									};
									setWorkOrders((prev) => [newWo, ...prev]);
									const partsNote = issuedSummary.length > 0 ? ` Issued Parts: ${issuedSummary.join(", ")}.` : "";
									const currentTimestamp = (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
										dateStyle: "medium",
										timeStyle: "short"
									});
									const auditLog = {
										id: `tc-save-wo-${Date.now()}`,
										author: role === "admin" ? "Admin Operations" : "Property Manager",
										role: "Property Manager",
										timestamp: currentTimestamp,
										comment: `Updated ticket details & dispatched linked Work Order ${newWoId} to ${assignedTechnicianOrVendor}.${partsNote}`
									};
									setTicketComments((prev) => ({
										...prev,
										[selectedTicket.id]: [...prev[selectedTicket.id] || [], auditLog]
									}));
									const existingTicketTimeline = ticketComments[selectedTicket.id] || [];
									setWoComments((prev) => ({
										...prev,
										[newWoId]: [...existingTicketTimeline, {
											id: `woc-init-${Date.now()}`,
											author: role === "admin" ? "Admin Operations" : "Property Manager",
											role: "Property Manager",
											timestamp: currentTimestamp,
											comment: `Work Order ${newWoId} initiated and dispatched from Ticket ${selectedTicket.id}.${partsNote}`
										}]
									}));
									if (issuedPartsList.length > 0) try {
										const existingMovements = JSON.parse(localStorage.getItem("pms_stock_movements") || "[]");
										const newMovements = issuedPartsList.map((part, idx) => ({
											id: `mov-${Date.now()}-${idx}`,
											partCode: part.code,
											type: "issue_wo",
											title: `Issue to Work Order #${newWoId}`,
											subtitle: `${targetProperty} - Maintenance execution`,
											quantity: -part.quantity,
											uom: "Nos",
											date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
											timestamp: currentTimestamp,
											refNo: newWoId
										}));
										localStorage.setItem("pms_stock_movements", JSON.stringify([...newMovements, ...existingMovements]));
									} catch (e) {
										console.error("Failed to append stock movements", e);
									}
									const targetStatus = editStatus || "in_progress";
									try {
										await updateMaintenanceTicket(selectedTicket.id, {
											status: targetStatus,
											assignee: assignedTechnicianOrVendor || null,
											description: editDescription || null
										});
									} catch (e) {
										console.warn("Remote Supabase update skipped for local/mock ticket ID:", selectedTicket.id, e);
									}
									setTickets((prev) => prev.map((t) => t.id === selectedTicket.id ? {
										...t,
										status: targetStatus,
										assignee: assignedTechnicianOrVendor,
										description: editDescription || t.description
									} : t));
									toast.success(`Saved & dispatched Work Order ${newWoId} linked to Ticket ${selectedTicket.id}`);
									setSelectedTicket(null);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3.5 w-3.5 mr-1" }), "Save Updates & Dispatch Work Order"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showNewTicketModal,
				onOpenChange: setShowNewTicketModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg max-h-[90vh] overflow-y-auto",
					onPointerDownOutside: (e) => e.preventDefault(),
					onInteractOutside: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Log Maintenance Service Ticket" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Create a complaint with property visibility, category, area, and attachments." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "font-semibold text-foreground",
									children: "Complaint Visibility *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2 mt-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										onClick: () => setTicketForm((f) => ({
											...f,
											visibility: "Personal (Only Me)"
										})),
										className: `p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2 ${ticketForm.visibility === "Personal (Only Me)" ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20" : "border-border hover:bg-muted/40"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: `h-4 w-4 mt-0.5 ${ticketForm.visibility === "Personal (Only Me)" ? "text-orange-600" : "text-muted-foreground"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground block text-[11px]",
											children: "Personal (Only Me)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground leading-tight block",
											children: "Visible only to you & management"
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										onClick: () => setTicketForm((f) => ({
											...f,
											visibility: "Community (All)"
										})),
										className: `p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2 ${ticketForm.visibility === "Community (All)" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" : "border-border hover:bg-muted/40"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: `h-4 w-4 mt-0.5 ${ticketForm.visibility === "Community (All)" ? "text-blue-600" : "text-muted-foreground"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground block text-[11px]",
											children: "Community (All)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground leading-tight block",
											children: "Visible to all property residents"
										})] })]
									})]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Property *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
									value: ticketForm.property,
									onValueChange: (v) => {
										setTicketForm((f) => ({
											...f,
											property: v,
											unitRef: dynamicPropertyUnitsMap[v]?.[0] || ""
										}));
									},
									options: dynamicPropertyList.map((p) => ({
										label: p,
										value: p
									})),
									placeholder: "Select property...",
									searchPlaceholder: "Search property...",
									className: "mt-1"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Category *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
										value: ticketForm.category,
										onValueChange: (v) => setTicketForm((f) => ({
											...f,
											category: v
										})),
										options: TICKET_CATEGORIES.map((cat) => ({
											label: cat,
											value: cat
										})),
										placeholder: "Select category...",
										searchPlaceholder: "Search category...",
										className: "mt-1"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Complaint Area *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
										value: ticketForm.complaintArea,
										onValueChange: (v) => setTicketForm((f) => ({
											...f,
											complaintArea: v
										})),
										options: COMPLAINT_AREAS.map((area) => ({
											label: area,
											value: area
										})),
										placeholder: "Select area...",
										searchPlaceholder: "Search area...",
										className: "mt-1"
									})] })]
								}),
								ticketForm.complaintArea === "Unit (name)" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Unit / Location *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
									value: ticketForm.unitRef,
									onValueChange: (v) => setTicketForm((f) => ({
										...f,
										unitRef: v
									})),
									options: (dynamicPropertyUnitsMap[ticketForm.property] || []).map((u) => ({
										label: u,
										value: u
									})),
									placeholder: "Select unit / location...",
									searchPlaceholder: "Search unit (e.g. Apt 1204, Office 402)...",
									className: "mt-1"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Issue Title *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "e.g. Water leak under kitchen sink pipe joint",
									value: ticketForm.title,
									onChange: (e) => setTicketForm((f) => ({
										...f,
										title: e.target.value
									})),
									className: "h-8 text-xs mt-1"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Mandatory Detailed Description *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-red-500 font-normal",
										children: "Required"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									placeholder: "Provide detailed description of the symptoms, noise, water leakage severity, exact room location...",
									value: ticketForm.description,
									onChange: (e) => setTicketForm((f) => ({
										...f,
										description: e.target.value
									})),
									className: "text-xs min-h-[70px] mt-1"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-0.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "font-semibold text-xs cursor-pointer",
												children: "Urgent / Emergency Fault"
											}), ticketForm.isUrgent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												className: "bg-red-600 text-[9px] px-1 py-0 h-4",
												children: "EMERGENCY SLA"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground",
											children: "Toggle on for major water leaks, total power outages, or safety hazards."
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: ticketForm.isUrgent,
										onCheckedChange: (c) => setTicketForm((f) => ({
											...f,
											isUrgent: c
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "flex items-center gap-1 text-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-3.5 w-3.5 text-orange-600" }), " Attachments & Photos"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: "Enter file name or photo name (e.g. pipe_leak_photo.jpg)",
												value: tempAttachmentName,
												onChange: (e) => setTempAttachmentName(e.target.value),
												className: "h-8 text-xs font-mono"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "button",
												variant: "outline",
												size: "sm",
												className: "h-8 text-xs shrink-0",
												onClick: () => {
													if (!tempAttachmentName.trim()) {
														toast.error("Please enter a file name");
														return;
													}
													setTicketForm((f) => ({
														...f,
														attachments: [...f.attachments, {
															name: tempAttachmentName.trim(),
															size: "1.8 MB"
														}]
													}));
													setTempAttachmentName("");
													toast.success("Attachment added to draft ticket");
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3.5 w-3.5 mr-1" }), " Add File"]
											})]
										}),
										ticketForm.attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex flex-wrap gap-1.5 pt-1",
											children: ticketForm.attachments.map((att, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5 bg-muted px-2 py-1 rounded-md text-[11px] font-mono border border-border",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(File, { className: "h-3 w-3 text-orange-600" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: att.name }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[9px] text-muted-foreground",
														children: [
															"(",
															att.size,
															")"
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
														className: "h-3 w-3 text-muted-foreground hover:text-red-600 cursor-pointer ml-1",
														onClick: () => {
															setTicketForm((f) => ({
																...f,
																attachments: f.attachments.filter((_, i) => i !== idx)
															}));
														}
													})
												]
											}, idx))
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Reported By (Contact)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Ahmed Al-Kuwari (+974 5512 3456)",
									value: ticketForm.reportedBy,
									onChange: (e) => setTicketForm((f) => ({
										...f,
										reportedBy: e.target.value
									})),
									className: "h-8 text-xs mt-1"
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setShowNewTicketModal(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "bg-orange-600 hover:bg-orange-700 text-white",
							onClick: handleCreateTicket,
							children: "Submit Service Ticket"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!selectedWoForDetail,
				onOpenChange: (open) => {
					if (!open) setSelectedWoForDetail(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-2xl max-h-[90vh] overflow-y-auto",
					onPointerDownOutside: (e) => e.preventDefault(),
					onInteractOutside: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center justify-between gap-3 pr-6 pb-2 border-b",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-lg font-bold",
								children: selectedWoForDetail?.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
								className: "text-xs flex items-center gap-2 mt-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono font-bold text-orange-600",
										children: selectedWoForDetail?.id
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
										selectedWoForDetail?.property,
										" (",
										selectedWoForDetail?.unitRef,
										")"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "text-[10px]",
										children: selectedWoForDetail?.category
									}),
									selectedWoForDetail?.ticketId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-muted-foreground font-mono",
										children: ["Linked Ticket: ", selectedWoForDetail.ticketId]
									})] })
								]
							})] }), selectedWoForDetail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 bg-muted/60 p-1.5 rounded-lg border",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[11px] font-semibold text-muted-foreground",
										children: "WO Status:"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: selectedWoForDetail.status,
										onValueChange: (val) => handleUpdateWorkOrderStatus(selectedWoForDetail.id, val),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-7 text-xs font-semibold w-36 bg-background",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "dispatched",
												children: "Dispatched"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "in_progress",
												children: "In Progress"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "scheduled",
												children: "Scheduled"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "completed",
												children: "Completed (Resolved)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "cancelled",
												children: "Cancelled"
											})
										] })]
									}),
									selectedWoForDetail.status !== "completed" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										className: "h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1",
										onClick: () => handleUpdateWorkOrderStatus(selectedWoForDetail.id, "completed"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-3.5 w-3.5" }), " Mark Completed"]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										className: "bg-emerald-600 text-white text-xs px-2 py-1 gap-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-3 w-3" }), " Job Completed"]
									})
								]
							})]
						}) }),
						selectedWoForDetail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg bg-muted/40 p-3.5 space-y-2.5 border border-border",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 sm:grid-cols-4 gap-2 text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-[10px] uppercase font-semibold",
												children: "Assigned To"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium text-foreground",
												children: selectedWoForDetail.technicianName || selectedWoForDetail.vendorName
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-[10px] uppercase font-semibold",
												children: "Scheduled Date"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium text-foreground",
												children: selectedWoForDetail.scheduledDate
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-[10px] uppercase font-semibold",
												children: "Labor + Spares"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-bold text-foreground",
												children: ["QAR ", selectedWoForDetail.totalCost.toLocaleString()]
											})] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-[10px] uppercase font-semibold",
												children: "Liability"
											}), selectedWoForDetail.chargebackToTenant ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium text-rose-600",
												children: "Tenant Chargeable"
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium text-slate-600",
												children: "Landlord OPEX"
											})] })
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "pt-2 border-t border-border/40",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground",
											children: "Scope of Work:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-0.5 text-foreground/90 whitespace-pre-wrap leading-relaxed",
											children: selectedWoForDetail.scopeOfWork
										})]
									})]
								}),
								(() => {
									if (!selectedWoForDetail.spareParts || selectedWoForDetail.spareParts.length === 0) return null;
									const woId = selectedWoForDetail.id;
									const consolidatedMap = /* @__PURE__ */ new Map();
									selectedWoForDetail.spareParts.forEach((sp) => {
										const key = sp.code || sp.name;
										const existing = consolidatedMap.get(key);
										if (existing) existing.quantity += sp.quantity || 1;
										else consolidatedMap.set(key, {
											partId: sp.partId || sp.code || sp.name,
											code: sp.code,
											name: sp.name,
											quantity: sp.quantity || 1,
											unitCost: sp.unitCost || 0
										});
									});
									const consolidatedList = Array.from(consolidatedMap.values());
									const totalAllocatedCount = consolidatedList.reduce((acc, it) => acc + it.quantity, 0);
									let totalConsumedCount = 0;
									let calculatedMaterialsCost = 0;
									consolidatedList.forEach((sp) => {
										const consumed = woConsumedQtyMap[woId]?.[sp.code] !== void 0 ? woConsumedQtyMap[woId][sp.code] : sp.quantity;
										totalConsumedCount += consumed;
										calculatedMaterialsCost += consumed * sp.unitCost;
										if (consumed !== sp.quantity) {}
									});
									const totalReturnedCount = totalAllocatedCount - totalConsumedCount;
									const handleSaveConsumption = () => {
										const updatedSpareParts = consolidatedList.map((sp) => {
											const consumed = woConsumedQtyMap[woId]?.[sp.code] !== void 0 ? woConsumedQtyMap[woId][sp.code] : sp.quantity;
											return {
												partId: sp.partId,
												code: sp.code,
												name: sp.name,
												quantity: consumed,
												unitCost: sp.unitCost
											};
										});
										if (totalReturnedCount > 0) setStockCatalog((prev) => prev.map((stock) => {
											const matched = consolidatedList.find((sp) => sp.code === stock.code);
											if (matched) {
												const consumed = woConsumedQtyMap[woId]?.[matched.code] !== void 0 ? woConsumedQtyMap[woId][matched.code] : matched.quantity;
												const returned = Math.max(0, matched.quantity - consumed);
												if (returned > 0) return {
													...stock,
													onHand: stock.onHand + returned
												};
											}
											return stock;
										}));
										const newTotalCost = (selectedWoForDetail.labourCost || 0) + calculatedMaterialsCost;
										setWorkOrders((prev) => prev.map((w) => {
											if (w.id === woId) return {
												...w,
												spareParts: updatedSpareParts,
												materialsCost: calculatedMaterialsCost,
												totalCost: newTotalCost
											};
											return w;
										}));
										setSelectedWoForDetail((prev) => prev ? {
											...prev,
											spareParts: updatedSpareParts,
											materialsCost: calculatedMaterialsCost,
											totalCost: newTotalCost
										} : null);
										const timestamp = (/* @__PURE__ */ new Date()).toLocaleString("en-US", {
											dateStyle: "medium",
											timeStyle: "short"
										});
										const logDetail = consolidatedList.map((sp) => {
											const consumed = woConsumedQtyMap[woId]?.[sp.code] !== void 0 ? woConsumedQtyMap[woId][sp.code] : sp.quantity;
											const returned = sp.quantity - consumed;
											return `${sp.name}: ${consumed}/${sp.quantity} consumed (${returned} returned to warehouse)`;
										}).join(" | ");
										const consumptionLog = {
											id: `mat-usage-${Date.now()}`,
											author: role === "admin" ? "Admin Operations" : "Property Manager (Maintenance Lead)",
											role: "Property Manager",
											timestamp,
											comment: `Updated material consumption: ${logDetail}. Billed Material Cost: QAR ${calculatedMaterialsCost.toLocaleString()} (${totalReturnedCount} unused units returned to inventory).`
										};
										setWoComments((prev) => ({
											...prev,
											[woId]: [...prev[woId] || [], consumptionLog]
										}));
										toast.success(`Material consumption updated! ${totalReturnedCount} unused units returned to inventory.`);
									};
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-border/80 p-3 space-y-2.5 bg-background shadow-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap items-center justify-between gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
													className: "font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5 text-orange-600" }), " Allocated Spare Parts & Material Consumption"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[11px] text-muted-foreground",
													children: "Adjust consumed quantities to bill exact usage and return unused units to warehouse stock."
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1.5",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
															variant: "outline",
															className: "text-[10px] bg-orange-50 text-orange-700 border-orange-200",
															children: [totalAllocatedCount, " Issued"]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
															variant: "outline",
															className: "text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
															children: [totalConsumedCount, " Consumed"]
														}),
														totalReturnedCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
															variant: "outline",
															className: "text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-semibold",
															children: [totalReturnedCount, " Returned to Stock"]
														})
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "border rounded-md overflow-hidden",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
													className: "bg-muted/40 text-[11px]",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
															className: "py-1 px-2.5 font-semibold",
															children: "Part Code"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
															className: "py-1 px-2.5 font-semibold",
															children: "Item Name"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
															className: "py-1 px-2.5 font-semibold text-center",
															children: "Allocated"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
															className: "py-1 px-2.5 font-semibold text-center",
															children: "Actual Consumed"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
															className: "py-1 px-2.5 font-semibold text-center",
															children: "Unused / Return"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
															className: "py-1 px-2.5 font-semibold text-right",
															children: "Unit Cost (QAR)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
															className: "py-1 px-2.5 font-semibold text-right",
															children: "Billed Cost (QAR)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
															className: "py-1 px-2.5 font-semibold text-right",
															children: "Status"
														})
													]
												}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: consolidatedList.map((sp, idx) => {
													const currentConsumed = woConsumedQtyMap[woId]?.[sp.code] !== void 0 ? woConsumedQtyMap[woId][sp.code] : sp.quantity;
													const unusedCount = Math.max(0, sp.quantity - currentConsumed);
													const billedTotal = currentConsumed * sp.unitCost;
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
														className: "text-xs",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
																className: "py-1.5 px-2.5 font-mono font-medium text-orange-600",
																children: sp.code
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
																className: "py-1.5 px-2.5 font-medium",
																children: sp.name
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
																className: "py-1.5 px-2.5 font-mono text-center text-muted-foreground font-semibold",
																children: sp.quantity
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
																className: "py-1.5 px-2.5 text-center",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "flex items-center justify-center gap-1",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																		type: "number",
																		min: 0,
																		max: sp.quantity,
																		value: currentConsumed,
																		onChange: (e) => {
																			const val = Math.min(sp.quantity, Math.max(0, parseInt(e.target.value) || 0));
																			setWoConsumedQtyMap((prev) => ({
																				...prev,
																				[woId]: {
																					...prev[woId] || {},
																					[sp.code]: val
																				}
																			}));
																		},
																		className: "h-7 w-16 text-center font-mono font-bold text-xs p-1"
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																		className: "text-[10px] text-muted-foreground",
																		children: ["/ ", sp.quantity]
																	})]
																})
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
																className: "py-1.5 px-2.5 font-mono text-center",
																children: unusedCount > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "text-blue-600 font-bold",
																	children: [
																		"+",
																		unusedCount,
																		" returned"
																	]
																}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-muted-foreground",
																	children: "0"
																})
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
																className: "py-1.5 px-2.5 font-mono text-right",
																children: sp.unitCost.toLocaleString()
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
																className: "py-1.5 px-2.5 font-mono font-bold text-right text-emerald-600",
																children: billedTotal.toLocaleString()
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
																className: "py-1.5 px-2.5 text-right",
																children: currentConsumed === sp.quantity ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
																	className: "bg-emerald-600 text-white text-[10px] font-medium gap-1",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-2.5 w-2.5" }), " Fully Consumed"]
																}) : currentConsumed > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
																	variant: "outline",
																	className: "text-[10px] text-blue-700 bg-blue-50 border-blue-300 font-medium",
																	children: [
																		"Partially Used (",
																		currentConsumed,
																		"/",
																		sp.quantity,
																		")"
																	]
																}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	variant: "outline",
																	className: "text-[10px] text-slate-600 bg-slate-100 border-slate-300 font-medium",
																	children: "Returned Unused"
																})
															})
														]
													}, idx);
												}) })] })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-wrap items-center justify-between gap-2 pt-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-xs text-muted-foreground",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Calculated Material Total: " }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-mono font-bold text-foreground",
															children: ["QAR ", calculatedMaterialsCost.toLocaleString()]
														}),
														totalReturnedCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "text-blue-600 ml-1 font-medium",
															children: [
																"(",
																totalReturnedCount,
																" units will return to warehouse stock)"
															]
														})
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "default",
													className: "h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white gap-1",
													onClick: handleSaveConsumption,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-3 w-3" }), " Update Consumption & Restock Unused Items"]
												})]
											})
										]
									});
								})(),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
												className: "font-bold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "h-3.5 w-3.5 text-orange-600" }), " Work Order Timeline & Technical Notes"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												variant: "secondary",
												className: "text-[9px]",
												children: [woComments[selectedWoForDetail.id]?.length || 0, " updates"]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "rounded-lg border border-border p-3 space-y-2.5 bg-muted/10 max-h-[220px] overflow-y-auto",
											children: (woComments[selectedWoForDetail.id]?.length || 0) === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-center py-5 text-xs text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-5 w-5 mx-auto mb-1 opacity-40" }), "No field updates logged yet for this work order."]
											}) : woComments[selectedWoForDetail.id]?.map((cmt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-2.5 rounded-lg bg-background border border-border/70 space-y-1 shadow-sm",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center justify-between text-[11px]",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-1.5 font-medium",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-foreground",
																children: cmt.author
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																variant: "outline",
																className: "text-[9px] px-1 py-0 h-3.5 bg-blue-50 text-blue-700 border-blue-300",
																children: cmt.role
															})]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground font-mono",
															children: cmt.timestamp
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap",
														children: cmt.comment
													}),
													cmt.attachments && cmt.attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "flex flex-wrap gap-1.5 pt-1",
														children: cmt.attachments.map((att, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-1 bg-muted px-2 py-0.5 rounded text-[10px] font-mono text-muted-foreground border border-border",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-3 w-3 text-orange-600" }),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: att.name }),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "opacity-60",
																	children: [
																		"(",
																		att.size,
																		")"
																	]
																})
															]
														}, idx))
													})
												]
											}, cmt.id))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border border-border/80 p-3 space-y-2 bg-background",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-xs font-semibold text-foreground",
														children: "Add Work Order Log & Attachment"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-1.5 text-xs",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-[11px] text-muted-foreground",
															children: "Posting As:"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "outline",
															className: "text-[11px] font-medium bg-muted/50 border-border text-foreground px-2 py-0.5",
															children: role === "admin" ? "Admin Operations" : role === "owner" ? "Property Owner" : "Property Manager"
														})]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
													placeholder: "Add diagnostic notes, pressure tests, completed steps...",
													value: newWoCommentText,
													onChange: (e) => setNewWoCommentText(e.target.value),
													className: "text-xs min-h-[45px]"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-1.5 flex-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-3.5 w-3.5 text-muted-foreground shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															placeholder: "Attach job sheet or photo (e.g. completion_photo.jpg)",
															value: newWoCommentFile,
															onChange: (e) => setNewWoCommentFile(e.target.value),
															className: "h-7 text-xs font-mono"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														className: "h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white shrink-0",
														onClick: () => handleAddWoComment(selectedWoForDetail.id),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3 w-3 mr-1" }), " Post Note"]
													})]
												})
											]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setSelectedWoForDetail(null),
							children: "Close"
						}) })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showProcurePrModal,
				onOpenChange: setShowProcurePrModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg max-h-[90vh] overflow-y-auto",
					onPointerDownOutside: (e) => e.preventDefault(),
					onInteractOutside: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Raise Procurement Purchase Request (PR)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs",
								children: "Order replacement spare parts via the Procurement & Inventory module."
							})] })]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "font-semibold text-foreground",
									children: "Select Catalog Item / Spare Part *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: prForm.itemCode,
									onValueChange: (selectedCode) => {
										const part = stockCatalog.find((p) => p.code === selectedCode);
										if (part) setPrForm((f) => ({
											...f,
											itemCode: part.code,
											partName: part.name,
											estimatedCost: part.unitCost
										}));
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-9 text-xs mt-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select catalog spare item" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
										className: "max-h-56",
										children: stockCatalog.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: item.code,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-medium",
												children: item.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-muted-foreground ml-1.5 font-mono text-[11px]",
												children: [
													"(",
													item.code,
													" · QAR ",
													item.unitCost,
													" / ",
													item.uom,
													")"
												]
											})]
										}, item.id))
									})]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-muted-foreground",
									children: "Item Description & Specification"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: prForm.partName,
									onChange: (e) => setPrForm((f) => ({
										...f,
										partName: e.target.value
									})),
									placeholder: "e.g. AC Air Filter 24x24",
									className: "h-8 text-xs mt-1"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Item Code / SKU" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										disabled: true,
										value: prForm.itemCode,
										className: "h-8 text-xs bg-muted font-mono font-medium mt-1"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Required Quantity *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: "1",
										value: prForm.qty,
										onChange: (e) => setPrForm((f) => ({
											...f,
											qty: Math.max(1, Number(e.target.value))
										})),
										className: "h-8 text-xs font-mono mt-1"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5 p-3 rounded-lg border border-border bg-muted/20",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-[11px] text-muted-foreground",
										children: "Estimated Unit Cost"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-mono font-bold text-sm text-foreground mt-0.5",
										children: ["QAR ", prForm.estimatedCost]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-[11px] text-muted-foreground",
										children: "Total Estimated Value"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "font-mono font-bold text-sm text-emerald-600 mt-0.5",
										children: ["QAR ", (prForm.estimatedCost * prForm.qty).toLocaleString()]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Destination Property *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
										value: prForm.property,
										onValueChange: (v) => {
											setPrForm((f) => ({
												...f,
												property: v
											}));
										},
										options: dynamicPropertyList.map((p) => ({
											label: p,
											value: p
										})),
										placeholder: "Select property...",
										searchPlaceholder: "Search property...",
										className: "mt-1"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Budget Head & Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										disabled: true,
										value: "OPEX / Maintenance Items",
										className: "h-8 text-xs bg-muted mt-1"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Notes & Restock Justification" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									placeholder: "Explain the urgency or link to active fault tickets...",
									value: prForm.notes,
									onChange: (e) => setPrForm((f) => ({
										...f,
										notes: e.target.value
									})),
									className: "text-xs min-h-[60px] mt-1"
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setShowProcurePrModal(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "bg-orange-600 hover:bg-orange-700 text-white",
							onClick: handleCreateProcurementPr,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3.5 w-3.5 mr-1" }), " Submit PR to Procurement"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showNewWoModal,
				onOpenChange: setShowNewWoModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg max-h-[90vh] overflow-y-auto",
					onPointerDownOutside: (e) => e.preventDefault(),
					onInteractOutside: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Create & Dispatch Work Order"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs",
								children: "Assign job scope to in-house technician or specialized vendor contractor."
							})] })]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "font-semibold text-foreground",
									children: "Work Order Title / Scope *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "e.g. Chiller Condenser Pump Mechanical Seal Replacement",
									value: woForm.title,
									onChange: (e) => setWoForm((f) => ({
										...f,
										title: e.target.value
									})),
									className: "h-8 text-xs mt-1"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Property *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
										value: woForm.property,
										onValueChange: (v) => {
											setWoForm((f) => ({
												...f,
												property: v,
												unitRef: dynamicPropertyUnitsMap[v]?.[0] || ""
											}));
										},
										options: dynamicPropertyList.map((p) => ({
											label: p,
											value: p
										})),
										placeholder: "Select property...",
										searchPlaceholder: "Search property...",
										className: "mt-1"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Unit / Location *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
										value: woForm.unitRef,
										onValueChange: (v) => setWoForm((f) => ({
											...f,
											unitRef: v
										})),
										options: (dynamicPropertyUnitsMap[woForm.property] || []).map((u) => ({
											label: u,
											value: u
										})),
										placeholder: "Select unit...",
										searchPlaceholder: "Search unit...",
										className: "mt-1"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Category *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
										value: woForm.category,
										onValueChange: (v) => setWoForm((f) => ({
											...f,
											category: v
										})),
										options: TICKET_CATEGORIES.map((cat) => ({
											label: cat,
											value: cat
										})),
										placeholder: "Select category...",
										searchPlaceholder: "Search category...",
										className: "mt-1"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Priority *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: woForm.priority,
										onValueChange: (v) => setWoForm((f) => ({
											...f,
											priority: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs mt-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "low",
												children: "Low (Standard)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "medium",
												children: "Medium (48h SLA)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "high",
												children: "High (24h SLA)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "urgent",
												children: "Urgent (Emergency)"
											})
										] })]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "font-semibold text-foreground",
									children: "Assignee Dispatch Mode *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2 mt-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										onClick: () => setWoForm((f) => ({
											...f,
											assigneeType: "in_house"
										})),
										className: `p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2 ${woForm.assigneeType === "in_house" ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20" : "border-border hover:bg-muted/40"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: `h-4 w-4 mt-0.5 ${woForm.assigneeType === "in_house" ? "text-orange-600" : "text-muted-foreground"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground block text-[11px]",
											children: "In-House Team"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground leading-tight block",
											children: "Internal field technician"
										})] })]
									}), role !== "maintenance" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										onClick: () => setWoForm((f) => ({
											...f,
											assigneeType: "vendor"
										})),
										className: `p-2.5 rounded-lg border cursor-pointer transition-all flex items-start gap-2 ${woForm.assigneeType === "vendor" ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" : "border-border hover:bg-muted/40"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: `h-4 w-4 mt-0.5 ${woForm.assigneeType === "vendor" ? "text-blue-600" : "text-muted-foreground"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold text-foreground block text-[11px]",
											children: "Outsourced Vendor"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground leading-tight block",
											children: "Specialist 3rd-party vendor"
										})] })]
									})]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: woForm.assigneeType === "in_house" ? "Assign In-House Technician" : "Assign Specialist Contractor" }), woForm.assigneeType === "in_house" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: woForm.technicianName,
									onValueChange: (v) => setWoForm((f) => ({
										...f,
										technicianName: v
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs mt-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: technicians.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: t.name,
										children: [
											t.name,
											" (",
											t.specialty,
											") · ",
											t.status
										]
									}, t.id)) })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: woForm.vendorName,
									onValueChange: (v) => setWoForm((f) => ({
										...f,
										vendorName: v
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs mt-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Carrier Middle East Qatar",
											children: "Carrier Middle East Qatar"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Qatar Facilities Management (QFM)",
											children: "Qatar Facilities Management (QFM)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Al Mana Engineering & Maintenance",
											children: "Al Mana Engineering & Maintenance"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Otis Elevator Qatar WLL",
											children: "Otis Elevator Qatar WLL"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Doha Fire Protection Solutions",
											children: "Doha Fire Protection Solutions"
										})
									] })]
								})] }),
								woForm.assigneeType === "in_house" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg border border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-200 space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "font-semibold flex items-center gap-1.5 text-blue-800 dark:text-blue-300",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5 text-blue-600" }), " In-House Field Team Execution"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] text-muted-foreground leading-relaxed",
										children: [
											"Technician labor is covered under internal company payroll / HRMS. Materials are issued directly from warehouse stock. If materials or services are chargeable to tenant, record a line in ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
												className: "text-foreground font-medium",
												children: "Vendor Jobs & AP"
											}),
											"."
										]
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Est. Labor Cost (QAR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: woForm.labourCost,
										onChange: (e) => setWoForm((f) => ({
											...f,
											labourCost: Number(e.target.value)
										})),
										className: "h-8 text-xs font-mono mt-1"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Est. Materials Cost (QAR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: woForm.materialsCost,
										onChange: (e) => setWoForm((f) => ({
											...f,
											materialsCost: Number(e.target.value)
										})),
										className: "h-8 text-xs font-mono mt-1"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Detailed Scope of Work & Procedures" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									placeholder: "Specific maintenance instructions, safety procedures, parts required...",
									value: woForm.scopeOfWork,
									onChange: (e) => setWoForm((f) => ({
										...f,
										scopeOfWork: e.target.value
									})),
									className: "text-xs min-h-[60px] mt-1"
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setShowNewWoModal(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "bg-orange-600 hover:bg-orange-700 text-white",
							onClick: handleCreateWorkOrder,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3.5 w-3.5 mr-1" }), " Dispatch Work Order"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showNewPpmModal,
				onOpenChange: setShowNewPpmModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg max-h-[90vh] overflow-y-auto",
					onPointerDownOutside: (e) => e.preventDefault(),
					onInteractOutside: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Register Preventive Maintenance (PPM) Schedule"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs",
								children: "Set up statutory and routine recurring maintenance schedules for building assets."
							})] })]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "font-semibold text-foreground",
									children: "PPM Routine Title *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "e.g. Bi-Annual Fire Alarm & Smoke Detector System Certification",
									value: ppmForm.title,
									onChange: (e) => setPpmForm((f) => ({
										...f,
										title: e.target.value
									})),
									className: "h-8 text-xs mt-1"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Target Property *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
										value: ppmForm.property,
										onValueChange: (v) => {
											setPpmForm((f) => ({
												...f,
												property: v,
												unitRef: dynamicPropertyUnitsMap[v]?.[0] || "Unit 101"
											}));
										},
										options: dynamicPropertyList.map((p) => ({
											label: p,
											value: p
										})),
										placeholder: "Select property...",
										searchPlaceholder: "Search property...",
										className: "mt-1"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Coverage Scope *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: ppmForm.scopeType,
										onValueChange: (v) => {
											setPpmForm((f) => ({
												...f,
												scopeType: v,
												unitRef: v === "property" ? "Entire Building / Common MEP" : dynamicPropertyUnitsMap[f.property]?.[0] || "Unit 101"
											}));
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs mt-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "property",
												children: "Entire Property (Building-Wide)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "unit",
												children: "Specific Unit"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "common_area",
												children: "Common Area Facility"
											})
										] })]
									})] })]
								}),
								ppmForm.scopeType !== "property" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: ppmForm.scopeType === "unit" ? "Specific Unit *" : "Facility / Common Area Location *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
									value: ppmForm.unitRef,
									onValueChange: (v) => setPpmForm((f) => ({
										...f,
										unitRef: v
									})),
									options: (dynamicPropertyUnitsMap[ppmForm.property] || []).map((u) => ({
										label: u,
										value: u
									})),
									placeholder: "Select unit or area...",
									searchPlaceholder: "Search unit...",
									className: "mt-1"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Asset Category *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
									value: ppmForm.category,
									onValueChange: (v) => setPpmForm((f) => ({
										...f,
										category: v
									})),
									options: [
										{
											label: "HVAC & Central Chillers",
											value: "HVAC"
										},
										{
											label: "Elevators & Escalators",
											value: "Elevator"
										},
										{
											label: "Fire Protection & Safety Systems",
											value: "Fire Safety"
										},
										{
											label: "Plumbing, Pumps & Drainage",
											value: "Plumbing"
										},
										{
											label: "Electrical Switchgear & BMS",
											value: "Electrical"
										},
										{
											label: "Civil & Structural",
											value: "Civil"
										},
										{
											label: "Carpenter & Joinery",
											value: "Carpenter"
										},
										{
											label: "Painter & Surface Finishing",
											value: "Painter"
										},
										{
											label: "CCTV & Access Control",
											value: "CCTV"
										},
										{
											label: "Intercom & Communication",
											value: "Intercom"
										},
										{
											label: "Housekeeping & Sanitation",
											value: "Housekeeping"
										},
										{
											label: "Door & Lock Systems",
											value: "Door Issue"
										},
										{
											label: "Security Systems",
											value: "Security"
										},
										{
											label: "Mason & Grouting",
											value: "Mason"
										},
										{
											label: "General Facility",
											value: "General"
										}
									],
									placeholder: "Select category...",
									searchPlaceholder: "Search category...",
									className: "mt-1"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Frequency Cycle" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: ppmForm.frequency,
										onValueChange: (v) => setPpmForm((f) => ({
											...f,
											frequency: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs mt-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Monthly",
												children: "Monthly"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Quarterly",
												children: "Quarterly"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Semi-Annual",
												children: "Semi-Annual"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Annual",
												children: "Annual"
											})
										] })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Next Inspection Due Date" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: ppmForm.nextDueDate,
										onChange: (e) => setPpmForm((f) => ({
											...f,
											nextDueDate: e.target.value
										})),
										className: "h-8 text-xs font-mono mt-1"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Assigned Vendor Specialist" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: ppmForm.assignedVendorName,
										onValueChange: (v) => setPpmForm((f) => ({
											...f,
											assignedVendorName: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs mt-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Carrier Middle East Qatar",
												children: "Carrier Middle East Qatar"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Otis Elevator Qatar WLL",
												children: "Otis Elevator Qatar WLL"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Doha Fire Protection Solutions",
												children: "Doha Fire Protection Solutions"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Qatar Facilities Management (QFM)",
												children: "Qatar Facilities Management (QFM)"
											})
										] })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Est. Cost per Cycle (QAR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: ppmForm.estimatedCost,
										onChange: (e) => setPpmForm((f) => ({
											...f,
											estimatedCost: Number(e.target.value)
										})),
										className: "h-8 text-xs font-mono mt-1"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Checklist Inspection Checkpoints (comma separated)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									placeholder: "e.g. Compressor oil check, condenser coil cleaning, water flow test",
									value: ppmForm.checklist,
									onChange: (e) => setPpmForm((f) => ({
										...f,
										checklist: e.target.value
									})),
									className: "text-xs min-h-[55px] mt-1"
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setShowNewPpmModal(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "bg-orange-600 hover:bg-orange-700 text-white",
							onClick: handleCreatePpm,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-3.5 w-3.5 mr-1" }), " Save PPM Schedule"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showNewTechModal,
				onOpenChange: setShowNewTechModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg max-h-[90vh] overflow-y-auto",
					onPointerDownOutside: (e) => e.preventDefault(),
					onInteractOutside: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Add In-House Field Technician"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs",
								children: "Register a certified technician to the internal facilities maintenance roster."
							})] })]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "font-semibold text-foreground",
									children: "Technician Full Name *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "e.g. Tariq Al-Hassan",
									value: techForm.name,
									onChange: (e) => setTechForm((f) => ({
										...f,
										name: e.target.value
									})),
									className: "h-8 text-xs mt-1"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Primary Trade Specialty *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: techForm.specialty,
									onValueChange: (v) => setTechForm((f) => ({
										...f,
										specialty: v
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs mt-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "HVAC & Chiller Plants",
											children: "HVAC & Chiller Plants"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Plumbing & Drainage",
											children: "Plumbing & Drainage"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Electrical & BMS Automation",
											children: "Electrical & BMS Automation"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Carpentry & Locks",
											children: "Carpentry & Locks"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Multi-Skilled Generalist",
											children: "Multi-Skilled Generalist"
										})
									] })]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Direct Contact Phone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "+974 5511 2233",
										value: techForm.phone,
										onChange: (e) => setTechForm((f) => ({
											...f,
											phone: e.target.value
										})),
										className: "h-8 text-xs font-mono mt-1"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Initial Availability Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: techForm.status,
										onValueChange: (v) => setTechForm((f) => ({
											...f,
											status: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs mt-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Available",
												children: "Available (Standby)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "On-Site",
												children: "On-Site Active"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "On-Leave",
												children: "On-Leave"
											})
										] })]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email Address" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "technician@pms.qa",
									value: techForm.email,
									onChange: (e) => setTechForm((f) => ({
										...f,
										email: e.target.value
									})),
									className: "h-8 text-xs mt-1"
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setShowNewTechModal(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "bg-orange-600 hover:bg-orange-700 text-white",
							onClick: handleCreateTechnician,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-3.5 w-3.5 mr-1" }), " Add to Team Roster"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showVendorInvoiceModal,
				onOpenChange: (open) => {
					setShowVendorInvoiceModal(open);
					if (open) setVendorInvStep(1);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg p-0 overflow-hidden flex flex-col",
					onPointerDownOutside: (e) => e.preventDefault(),
					onInteractOutside: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "p-4 pb-3 border-b bg-muted/20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "p-2 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
										className: "text-sm font-bold",
										children: "Record Vendor AP Invoice & GL Mapping"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
										className: "text-[11px]",
										children: "Synchronize invoice directly with Finance AP & General Ledger."
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "font-mono text-[10px] bg-background",
									children: [
										"Step ",
										vendorInvStep,
										" of 3"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-3 gap-1.5 pt-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										onClick: () => setVendorInvStep(1),
										className: `flex items-center justify-center gap-1.5 py-1 px-2 rounded text-[11px] font-medium cursor-pointer transition ${vendorInvStep === 1 ? "bg-orange-600 text-white font-bold shadow-sm" : vendorInvStep > 1 ? "bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200" : "bg-muted text-muted-foreground"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "1. Vendor & Location" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										onClick: () => {
											if (vendorInvModalForm.invoiceNo.trim()) setVendorInvStep(2);
										},
										className: `flex items-center justify-center gap-1.5 py-1 px-2 rounded text-[11px] font-medium cursor-pointer transition ${vendorInvStep === 2 ? "bg-orange-600 text-white font-bold shadow-sm" : vendorInvStep > 2 ? "bg-orange-100 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200" : "bg-muted text-muted-foreground"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "2. Pricing & GL" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										onClick: () => {
											if (vendorInvModalForm.invoiceNo.trim() && Number(vendorInvModalForm.amount) > 0) setVendorInvStep(3);
										},
										className: `flex items-center justify-center gap-1.5 py-1 px-2 rounded text-[11px] font-medium cursor-pointer transition ${vendorInvStep === 3 ? "bg-orange-600 text-white font-bold shadow-sm" : "bg-muted text-muted-foreground"}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "3. Scope & Bill" })
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 text-xs",
							children: [
								vendorInvStep === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "font-semibold text-foreground text-[11px]",
												children: "Certified Vendor *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: vendorInvModalForm.vendorName,
												onValueChange: (v) => setVendorInvModalForm((f) => ({
													...f,
													vendorName: v
												})),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs mt-1",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Carrier Middle East Qatar",
														children: "Carrier Middle East Qatar"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Qatar Facilities Management (QFM)",
														children: "Qatar Facilities Management (QFM)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Al Mana Engineering & Maintenance",
														children: "Al Mana Engineering & Maintenance"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Otis Elevator Qatar WLL",
														children: "Otis Elevator Qatar WLL"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Doha Fire Protection Solutions",
														children: "Doha Fire Protection Solutions"
													})
												] })]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "font-semibold text-foreground text-[11px]",
												children: "Vendor Invoice / DN # *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: "INV-2026-901",
												value: vendorInvModalForm.invoiceNo,
												onChange: (e) => setVendorInvModalForm((f) => ({
													...f,
													invoiceNo: e.target.value
												})),
												className: "h-8 text-xs font-mono mt-1"
											})] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px]",
												children: "Property *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
												value: vendorInvModalForm.property,
												onValueChange: (v) => {
													setVendorInvModalForm((f) => ({
														...f,
														property: v,
														unitRef: dynamicPropertyUnitsMap[v]?.[0] || ""
													}));
												},
												options: dynamicPropertyList.map((p) => ({
													label: p,
													value: p
												})),
												placeholder: "Select property...",
												searchPlaceholder: "Search property...",
												className: "mt-1"
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px]",
												children: "Unit / Location *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
												value: vendorInvModalForm.unitRef,
												onValueChange: (v) => setVendorInvModalForm((f) => ({
													...f,
													unitRef: v
												})),
												options: (dynamicPropertyUnitsMap[vendorInvModalForm.property] || []).map((u) => ({
													label: u,
													value: u
												})),
												placeholder: "Select unit...",
												searchPlaceholder: "Search unit...",
												className: "mt-1"
											})] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px] font-semibold text-foreground",
												children: "Payment Terms *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: vendorInvModalForm.paymentTerms || "Net 30 Days",
												onValueChange: (v) => setVendorInvModalForm((f) => ({
													...f,
													paymentTerms: v
												})),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs mt-1",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Immediate / Cash on Delivery",
														children: "Immediate / Cash on Delivery"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Net 7 Days",
														children: "Net 7 Days"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Net 14 Days",
														children: "Net 14 Days"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Net 30 Days",
														children: "Net 30 Days"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Net 45 Days",
														children: "Net 45 Days"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Net 60 Days",
														children: "Net 60 Days"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Net 90 Days",
														children: "Net 90 Days"
													})
												] })]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-[11px] font-semibold text-foreground",
												children: "Settlement Mode *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: vendorInvModalForm.settlementMode || "Bank Wire / Electronic Transfer (QNB)",
												onValueChange: (v) => setVendorInvModalForm((f) => ({
													...f,
													settlementMode: v,
													paymentMode: v
												})),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs mt-1",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Bank Wire / Electronic Transfer (QNB)",
														children: "Bank Wire (QNB)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "CBQ Electronic Wire",
														children: "CBQ Electronic Wire"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Corporate Cheque on Delivery",
														children: "Corporate Cheque on Delivery"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Direct Debit / Online Portal",
														children: "Direct Debit / Online Portal"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Cash in Hand / Petty Cash",
														children: "Cash in Hand / Petty Cash"
													})
												] })]
											})] })]
										})
									]
								}),
								vendorInvStep === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "font-semibold text-foreground text-[11px]",
												children: "Invoice Base Amount (QAR) *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												value: vendorInvModalForm.amount,
												onChange: (e) => setVendorInvModalForm((f) => ({
													...f,
													amount: Number(e.target.value)
												})),
												className: "h-8 text-xs font-mono font-bold text-foreground mt-1"
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "font-semibold text-foreground text-[11px]",
												children: "Tax / VAT Rate (%)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: String(vendorInvModalForm.taxRate || 0),
												onValueChange: (v) => setVendorInvModalForm((f) => ({
													...f,
													taxRate: Number(v)
												})),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs mt-1",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "0",
														children: "0% (Zero Rated / Exempt)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "5",
														children: "5% VAT / Tax"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "10",
														children: "10% Standard Rate"
													})
												] })]
											})] })]
										}),
										(() => {
											const base = Number(vendorInvModalForm.amount || 0);
											const rate = Number(vendorInvModalForm.taxRate || 0);
											const tax = base * (rate / 100);
											const total = base + tax;
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-2 rounded-lg bg-muted/40 border border-border grid grid-cols-3 gap-2 text-center text-xs",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground uppercase",
														children: "Base Amount"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "font-mono font-bold text-foreground",
														children: ["QAR ", base.toLocaleString()]
													})] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[10px] text-muted-foreground uppercase",
														children: [
															"Tax (",
															rate,
															"%)"
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "font-mono font-medium text-amber-600",
														children: ["QAR ", tax.toLocaleString()]
													})] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground uppercase",
														children: "Net Payable AP"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "font-mono font-bold text-emerald-600",
														children: ["QAR ", total.toLocaleString()]
													})] })
												]
											});
										})(),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "font-semibold text-foreground text-[11px]",
												children: "General Ledger (GL) Account *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: vendorInvModalForm.glAccount,
												onValueChange: (v) => setVendorInvModalForm((f) => ({
													...f,
													glAccount: v
												})),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs mt-1 font-mono",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: MAINTENANCE_GL_ACCOUNTS.map((gl) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
													value: gl.code,
													children: [
														gl.code,
														" - ",
														gl.name
													]
												}, gl.code)) })]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "font-semibold text-foreground text-[11px]",
												children: "Cost Center Allocation *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: vendorInvModalForm.costCenter,
												onValueChange: (v) => setVendorInvModalForm((f) => ({
													...f,
													costCenter: v
												})),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs mt-1 font-mono",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: COST_CENTERS.map((cc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
													value: cc.code,
													children: [
														cc.code,
														" - ",
														cc.name
													]
												}, cc.code)) })]
											})] })]
										})
									]
								}),
								vendorInvStep === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-[11px]",
											children: "Parts & Material Supplied"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "e.g. Replacement sensor and filter assembly",
											value: vendorInvModalForm.partsDescription,
											onChange: (e) => setVendorInvModalForm((f) => ({
												...f,
												partsDescription: e.target.value
											})),
											className: "h-8 text-xs mt-1"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-[11px]",
											children: "Specialist Labor & Services Performed"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "e.g. Emergency on-site troubleshooting",
											value: vendorInvModalForm.labourDescription,
											onChange: (e) => setVendorInvModalForm((f) => ({
												...f,
												labourDescription: e.target.value
											})),
											className: "h-8 text-xs mt-1"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-2.5 rounded-lg border border-dashed border-primary/40 bg-muted/20 space-y-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
														className: "font-semibold text-foreground flex items-center gap-1.5 text-xs",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3.5 w-3.5 text-primary" }), " Vendor Bill / Scanned Invoice Document *"]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground",
														children: "PDF, PNG, JPG up to 10MB"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex gap-2 items-center",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
														className: "flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-input bg-background hover:bg-muted/40 cursor-pointer text-xs transition",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileUp, { className: "h-3.5 w-3.5 text-orange-600" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "truncate text-foreground font-mono text-[11px]",
																children: vendorInvModalForm.receiptFileName || "Click to browse & upload file..."
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																type: "file",
																accept: ".pdf,.png,.jpg,.jpeg,.doc,.docx",
																className: "hidden",
																onChange: (e) => {
																	const file = e.target.files?.[0];
																	if (file) {
																		setVendorInvModalForm((f) => ({
																			...f,
																			receiptFileName: file.name,
																			receiptAttachment: file.name
																		}));
																		toast.success(`Attached "${file.name}"`);
																	}
																}
															})
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														type: "button",
														variant: "outline",
														size: "sm",
														className: "h-8 text-xs shrink-0 gap-1 font-medium",
														onClick: () => {
															const sampleName = `Vendor_Bill_${vendorInvModalForm.invoiceNo || "INV"}_Scanned.pdf`;
															setVendorInvModalForm((f) => ({
																...f,
																receiptFileName: sampleName,
																receiptAttachment: sampleName
															}));
															toast.success("Sample invoice PDF attached");
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-3.5 w-3.5" }), " Auto-Attach"]
													})]
												}),
												vendorInvModalForm.receiptFileName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between p-1.5 px-2.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono border border-emerald-300 dark:border-emerald-800",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "flex items-center gap-1.5 truncate",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5 text-emerald-600 shrink-0" }), vendorInvModalForm.receiptFileName]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														onClick: () => setVendorInvModalForm((f) => ({
															...f,
															receiptFileName: "",
															receiptAttachment: ""
														})),
														className: "text-[10px] text-destructive hover:underline ml-2",
														children: "Remove"
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-2 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-900 dark:text-blue-200 flex gap-2 items-start",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-3.5 w-3.5 text-blue-600 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Finance Routing:" }),
												" Registered in ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Submitted (Unpaid)" }),
												" status. Payment and official receipt are settled by the Finance team via ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Finance → Payable Invoice" }),
												"."
											] })]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "p-3 border-t bg-muted/20 flex flex-row justify-between items-center sm:justify-between w-full",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: vendorInvStep > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "outline",
								size: "sm",
								className: "h-8 text-xs",
								onClick: () => setVendorInvStep((s) => s - 1),
								children: "Back"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "ghost",
								size: "sm",
								className: "h-8 text-xs",
								onClick: () => setShowVendorInvoiceModal(false),
								children: "Cancel"
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-2",
								children: vendorInvStep < 3 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									size: "sm",
									className: "h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white gap-1",
									onClick: () => {
										if (vendorInvStep === 1) {
											if (!vendorInvModalForm.invoiceNo.trim()) {
												toast.error("Please enter a Vendor Invoice #");
												return;
											}
											setVendorInvStep(2);
										} else if (vendorInvStep === 2) {
											if (Number(vendorInvModalForm.amount) <= 0) {
												toast.error("Please enter a valid base amount");
												return;
											}
											setVendorInvStep(3);
										}
									},
									children: ["Next Step ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "button",
									size: "sm",
									className: "h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white gap-1.5",
									onClick: handleCreateVendorInvoiceFromModal,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3.5 w-3.5" }), " Submit to Finance AP"]
								})
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showNewChargebackModal,
				onOpenChange: setShowNewChargebackModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg max-h-[90vh] overflow-y-auto",
					onPointerDownOutside: (e) => e.preventDefault(),
					onInteractOutside: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Issue Tenant Chargeback Notice"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs",
								children: "Bill tenant or deduct from security deposit for accidental unit damage repairs."
							})] })]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "font-semibold text-foreground",
										children: "Referenced Work Order *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: chargebackForm.workOrderId,
										onValueChange: (v) => {
											const wo = workOrders.find((w) => w.id === v);
											setChargebackForm((f) => ({
												...f,
												workOrderId: v,
												property: wo?.property || f.property,
												unitRef: wo?.unitRef || f.unitRef,
												laborCost: wo?.labourCost || f.laborCost,
												materialsCost: wo?.materialsCost || f.materialsCost,
												amount: wo?.totalCost || f.amount
											}));
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs mt-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [workOrders.filter((w) => w.chargebackToTenant).map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: w.id,
											children: [
												w.id,
												" — ",
												w.unitRef,
												" (",
												w.vendorName || w.technicianName,
												")"
											]
										}, w.id)), workOrders.filter((w) => !w.chargebackToTenant).map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: w.id,
											children: [
												w.id,
												" — ",
												w.unitRef
											]
										}, w.id))] })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "font-semibold text-foreground",
										children: "Tenant Name & Unit *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: chargebackForm.tenantName,
										onChange: (e) => setChargebackForm((f) => ({
											...f,
											tenantName: e.target.value
										})),
										placeholder: "e.g. Salim Mansour (Apt 1204)",
										className: "h-8 text-xs mt-1"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Property & Unit Ref" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-1 mt-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: chargebackForm.property,
											onChange: (e) => setChargebackForm((f) => ({
												...f,
												property: e.target.value
											})),
											className: "h-8 text-xs flex-1",
											placeholder: "Property name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: chargebackForm.unitRef,
											onChange: (e) => setChargebackForm((f) => ({
												...f,
												unitRef: e.target.value
											})),
											className: "h-8 text-xs w-24",
											placeholder: "Unit ref"
										})]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Damage / Chargeback Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: chargebackForm.damageCategory,
										onValueChange: (v) => setChargebackForm((f) => ({
											...f,
											damageCategory: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs mt-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Move-in / Move-out Accidental Damage",
												children: "Move-in / Move-out Accidental Damage"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Tenant Negligence / Wilful Damage",
												children: "Tenant Negligence / Wilful Damage"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Unauthorised Modifications",
												children: "Unauthorised Modifications"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "End of Lease Unit Restoration",
												children: "End of Lease Unit Restoration"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Appliance / Fixture Misuse",
												children: "Appliance / Fixture Misuse"
											})
										] })]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg bg-muted/40 border border-border space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-foreground text-[11px] uppercase tracking-wide",
											children: "Cost Breakdown"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-3 gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-[10px]",
													children: "Labour Cost (QAR)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: chargebackForm.laborCost,
													onChange: (e) => {
														const labor = Number(e.target.value);
														const mat = Number(chargebackForm.materialsCost);
														const admin = (labor + mat) * (Number(chargebackForm.adminFeeRate) / 100);
														setChargebackForm((f) => ({
															...f,
															laborCost: labor,
															amount: labor + mat + admin
														}));
													},
													className: "h-8 text-xs font-mono mt-1"
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-[10px]",
													children: "Materials Cost (QAR)"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: chargebackForm.materialsCost,
													onChange: (e) => {
														const mat = Number(e.target.value);
														const labor = Number(chargebackForm.laborCost);
														const admin = (labor + mat) * (Number(chargebackForm.adminFeeRate) / 100);
														setChargebackForm((f) => ({
															...f,
															materialsCost: mat,
															amount: labor + mat + admin
														}));
													},
													className: "h-8 text-xs font-mono mt-1"
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-[10px]",
													children: "Admin Fee %"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													value: chargebackForm.adminFeeRate,
													onChange: (e) => {
														const rate = Number(e.target.value);
														const labor = Number(chargebackForm.laborCost);
														const mat = Number(chargebackForm.materialsCost);
														const admin = (labor + mat) * (rate / 100);
														setChargebackForm((f) => ({
															...f,
															adminFeeRate: rate,
															amount: labor + mat + admin
														}));
													},
													className: "h-8 text-xs font-mono mt-1"
												})] })
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between pt-1 border-t border-border/50",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[11px] font-semibold text-foreground",
												children: "Total Chargeback Amount"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-bold text-rose-600 text-sm",
												children: ["QAR ", Number(chargebackForm.amount).toLocaleString()]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "font-semibold text-foreground",
										children: "Recovery Mode"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: chargebackForm.recoveryMode,
										onValueChange: (v) => setChargebackForm((f) => ({
											...f,
											recoveryMode: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs mt-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Security Deposit Deduction",
												children: "Security Deposit Deduction"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Direct Invoice / Payment Link",
												children: "Direct Invoice / AR Invoice"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Add to Next Month Rent",
												children: "Add to Next Month Rent"
											})
										] })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Inspection / Evidence Ref" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: chargebackForm.inspectionRef,
										onChange: (e) => setChargebackForm((f) => ({
											...f,
											inspectionRef: e.target.value
										})),
										placeholder: "e.g. INSP-2026-881",
										className: "h-8 text-xs mt-1"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-2 text-[11px]",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-blue-700 dark:text-blue-300",
											children: "📘 Auto-Generated GL Journal"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-bold text-emerald-700 dark:text-emerald-400",
														children: "Dr."
													}),
													" ",
													chargebackForm.recoveryMode === "Security Deposit Deduction" ? "21200001 - Tenant Security Deposits Held" : "11200001 - Tenant Accounts Receivable"
												] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono font-bold text-foreground",
													children: ["QAR ", Number(chargebackForm.amount).toLocaleString()]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-bold text-rose-600 dark:text-rose-400",
														children: "Cr."
													}),
													" ",
													"52100008 - Tenant Recoverable Damage & Chargeback Clearing"
												] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono font-bold text-foreground",
													children: ["QAR ", Number(chargebackForm.amount).toLocaleString()]
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[10px] text-muted-foreground pt-1 border-t border-blue-200/60 dark:border-blue-800/60",
											children: chargebackForm.recoveryMode === "Security Deposit Deduction" ? "Security deposit escrow balance will be reduced. No AR invoice generated." : "An AR Receivable invoice will be created in Finance and sent to the tenant."
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Reason & Damage Evidence Details" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									placeholder: "Explain tenant liability, inspection report references, and move-in/out check comparisons...",
									value: chargebackForm.reason,
									onChange: (e) => setChargebackForm((f) => ({
										...f,
										reason: e.target.value
									})),
									className: "text-xs min-h-[55px] mt-1"
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setShowNewChargebackModal(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "bg-orange-600 hover:bg-orange-700 text-white",
							onClick: handleCreateChargeback,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3.5 w-3.5 mr-1" }), " Post Chargeback & GL Journal"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!selectedPpmForWo,
				onOpenChange: (open) => {
					if (!open) setSelectedPpmForWo(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg max-h-[90vh] overflow-y-auto",
					onPointerDownOutside: (e) => e.preventDefault(),
					onInteractOutside: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Generate Work Order from PPM Routine"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs",
								children: "Review schedule parameters, assigned contractor/team, checklist, and dispatch automated Work Order."
							})] })]
						}) }),
						selectedPpmForWo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg bg-muted/40 border border-border space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono font-bold text-orange-600",
												children: selectedPpmForWo.id
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "secondary",
												className: "text-[10px]",
												children: selectedPpmForWo.frequency
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-foreground font-semibold text-sm",
											children: selectedPpmForWo.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1 border-t border-border/40",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-foreground",
														children: "Property:"
													}),
													" ",
													selectedPpmForWo.property
												] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-foreground",
														children: "Scope:"
													}),
													" ",
													selectedPpmForWo.scopeType === "property" ? "Entire Property" : selectedPpmForWo.unitRef || "Specific Unit"
												] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-foreground",
														children: "Category:"
													}),
													" ",
													selectedPpmForWo.category
												] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-foreground",
														children: "Est. Budget:"
													}),
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-mono font-bold text-foreground",
														children: ["QAR ", selectedPpmForWo.estimatedCost.toLocaleString()]
													})
												] })
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "font-semibold text-foreground",
									children: "Work Order Title *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: ppmWoForm.title,
									onChange: (e) => setPpmWoForm((f) => ({
										...f,
										title: e.target.value
									})),
									className: "h-8 text-xs mt-1"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Scheduled Service Date *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: ppmWoForm.scheduledDate,
										onChange: (e) => setPpmWoForm((f) => ({
											...f,
											scheduledDate: e.target.value
										})),
										className: "h-8 text-xs font-mono mt-1"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Dispatch Mode *" }), role === "maintenance" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "h-8 mt-1 flex items-center rounded-md border px-2 text-xs text-muted-foreground",
										children: "In-House Field Technician"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: ppmWoForm.assigneeType,
										onValueChange: (v) => setPpmWoForm((f) => ({
											...f,
											assigneeType: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs mt-1",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "vendor",
											children: "Outsourced Specialist Vendor"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "in_house",
											children: "In-House Field Technician"
										})] })]
									})] })]
								}),
								ppmWoForm.assigneeType === "vendor" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Assigned Vendor Contractor" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: ppmWoForm.vendorName,
									onValueChange: (v) => setPpmWoForm((f) => ({
										...f,
										vendorName: v
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs mt-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Carrier Middle East Qatar",
											children: "Carrier Middle East Qatar"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Otis Elevator Qatar WLL",
											children: "Otis Elevator Qatar WLL"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Doha Fire Protection Solutions",
											children: "Doha Fire Protection Solutions"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Qatar Facilities Management (QFM)",
											children: "Qatar Facilities Management (QFM)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "Al Mana Engineering & Maintenance",
											children: "Al Mana Engineering & Maintenance"
										})
									] })]
								})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Assigned In-House Technician" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: ppmWoForm.technicianName,
									onValueChange: (v) => setPpmWoForm((f) => ({
										...f,
										technicianName: v
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "h-8 text-xs mt-1",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: technicians.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: t.name,
										children: [
											t.name,
											" (",
											t.specialty,
											") · ",
											t.status
										]
									}, t.id)) })]
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "font-semibold text-foreground",
									children: "Statutory Inspection Checkpoints"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 rounded-lg border border-border p-2.5 bg-muted/20 space-y-1.5 max-h-36 overflow-y-auto",
									children: selectedPpmForWo.checklist.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-[11px] text-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-3.5 w-3.5 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item })]
									}, idx))
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setSelectedPpmForWo(null),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "bg-orange-600 hover:bg-orange-700 text-white",
							onClick: handleDispatchWoFromPpm,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3.5 w-3.5 mr-1" }), " Confirm & Dispatch Work Order"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showInHouseMaterialModal,
				onOpenChange: setShowInHouseMaterialModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg max-h-[90vh] overflow-y-auto",
					onPointerDownOutside: (e) => e.preventDefault(),
					onInteractOutside: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-base font-bold",
								children: "Record In-House Chargeable Material & GL Journal"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs",
								children: "Log chargeable warehouse parts or specialized materials with General Ledger cost allocation."
							})] })]
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "font-semibold text-foreground",
									children: "Material / Part Name & Description *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "e.g. 60x60 LED Panel 40W, Heavy Duty Brass Ball Valve 1-inch",
									value: inHouseMaterialForm.materialName,
									onChange: (e) => setInHouseMaterialForm((f) => ({
										...f,
										materialName: e.target.value
									})),
									className: "h-8 text-xs mt-1"
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Destination Property *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
										value: inHouseMaterialForm.property,
										onValueChange: (v) => {
											setInHouseMaterialForm((f) => ({
												...f,
												property: v,
												unitRef: dynamicPropertyUnitsMap[v]?.[0] || ""
											}));
										},
										options: dynamicPropertyList.map((p) => ({
											label: p,
											value: p
										})),
										placeholder: "Select property...",
										searchPlaceholder: "Search property...",
										className: "mt-1"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Unit / Location *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchableSelect, {
										value: inHouseMaterialForm.unitRef,
										onValueChange: (v) => setInHouseMaterialForm((f) => ({
											...f,
											unitRef: v
										})),
										options: (dynamicPropertyUnitsMap[inHouseMaterialForm.property] || []).map((u) => ({
											label: u,
											value: u
										})),
										placeholder: "Select unit...",
										searchPlaceholder: "Search unit...",
										className: "mt-1"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "font-semibold text-foreground",
										children: "Quantity Issued *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: "1",
										value: inHouseMaterialForm.quantity,
										onChange: (e) => setInHouseMaterialForm((f) => ({
											...f,
											quantity: Math.max(1, Number(e.target.value))
										})),
										className: "h-8 text-xs font-mono mt-1"
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "font-semibold text-foreground",
										children: "Unit Price (QAR) *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: inHouseMaterialForm.unitPrice,
										onChange: (e) => setInHouseMaterialForm((f) => ({
											...f,
											unitPrice: Number(e.target.value)
										})),
										className: "h-8 text-xs font-mono font-bold text-foreground mt-1"
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "font-semibold text-foreground",
										children: "GL Accounting Mapping *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: inHouseMaterialForm.glAccount,
										onValueChange: (v) => setInHouseMaterialForm((f) => ({
											...f,
											glAccount: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs mt-1 font-mono",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: MAINTENANCE_GL_ACCOUNTS.map((gl) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: gl.code,
											children: [
												gl.code,
												" - ",
												gl.name
											]
										}, gl.code)) })]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "font-semibold text-foreground",
										children: "Cost Center Allocation *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: inHouseMaterialForm.costCenter,
										onValueChange: (v) => setInHouseMaterialForm((f) => ({
											...f,
											costCenter: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs mt-1 font-mono",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: COST_CENTERS.map((cc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: cc.code,
											children: [
												cc.code,
												" - ",
												cc.name
											]
										}, cc.code)) })]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/20",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "checkbox",
										id: "ihChargebackCheck",
										checked: inHouseMaterialForm.chargebackToTenant,
										onChange: (e) => setInHouseMaterialForm((f) => ({
											...f,
											chargebackToTenant: e.target.checked
										})),
										className: "h-4 w-4 rounded border-border text-orange-600 focus:ring-orange-500"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
										htmlFor: "ihChargebackCheck",
										className: "text-xs font-medium cursor-pointer",
										children: "Billable / Recoverable from Tenant (Charge to Tenant Ledger / Security Deposit)"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-2.5 rounded-lg bg-muted/40 border border-border flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground font-medium",
										children: "Total Material Valuation:"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono font-bold text-sm text-emerald-600",
										children: ["QAR ", (Number(inHouseMaterialForm.unitPrice || 0) * Number(inHouseMaterialForm.quantity || 1)).toLocaleString()]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Reason / Usage Justification" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									placeholder: "Explain the necessity of the part replacement, damage reason, or tenant charge justification...",
									value: inHouseMaterialForm.reason,
									onChange: (e) => setInHouseMaterialForm((f) => ({
										...f,
										reason: e.target.value
									})),
									className: "text-xs min-h-[55px] mt-1"
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setShowInHouseMaterialModal(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							className: "bg-blue-600 hover:bg-blue-700 text-white",
							onClick: handleCreateInHouseMaterial,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5 mr-1" }), " Post & Generate Financial Voucher"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!generatedReceipt,
				onOpenChange: (open) => {
					if (!open) setGeneratedReceipt(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-xl max-h-[92vh] overflow-y-auto",
					onPointerDownOutside: (e) => e.preventDefault(),
					onInteractOutside: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between pb-2 border-b border-border/80",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "p-2 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
									className: "text-base font-bold",
									children: generatedReceipt?.voucherType === "AP_INVOICE" ? "Accounts Payable (AP) Voucher" : "Material Chargeback & Cost Journal"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "text-xs",
									children: "Official General Ledger posting voucher & synchronization receipt."
								})] })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "font-mono text-xs px-2 py-0.5 bg-muted",
								children: generatedReceipt?.receiptNo
							})]
						}) }),
						generatedReceipt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3.5 rounded-xl bg-muted/30 border border-border space-y-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-center text-[11px] text-muted-foreground pb-2 border-b border-border/50",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Issued Date: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "text-foreground",
											children: generatedReceipt.date
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Ref #: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
											className: "font-mono text-orange-600",
											children: generatedReceipt.referenceId
										})] })]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground text-[11px]",
											children: "Party / Contractor:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-foreground",
											children: generatedReceipt.partyName
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground text-[11px]",
											children: "Property & Location:"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-semibold text-foreground",
											children: [
												generatedReceipt.property,
												" (",
												generatedReceipt.unitRef,
												")"
											]
										})] })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
										className: "font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5 text-blue-600" }), " General Ledger (GL) Accounting Entries"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "border rounded-lg overflow-hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
											className: "bg-muted/50 text-[11px]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "py-1 px-2.5 font-semibold",
													children: "Account Code & Description"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "py-1 px-2.5 font-semibold",
													children: "Cost Center"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "py-1 px-2.5 font-semibold text-right",
													children: "Debit (QAR)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "py-1 px-2.5 font-semibold text-right",
													children: "Credit (QAR)"
												})
											]
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
												className: "text-xs",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
														className: "py-1.5 px-2.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "font-mono font-bold text-primary",
															children: generatedReceipt.glAccount
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "text-[10px] text-muted-foreground",
															children: generatedReceipt.description
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "py-1.5 px-2.5 font-mono text-[11px] text-muted-foreground",
														children: generatedReceipt.costCenter
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "py-1.5 px-2.5 font-mono font-bold text-right text-emerald-600",
														children: generatedReceipt.baseAmount.toLocaleString()
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "py-1.5 px-2.5 font-mono text-right text-muted-foreground",
														children: "-"
													})
												]
											}),
											generatedReceipt.taxAmount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
												className: "text-xs",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "py-1.5 px-2.5",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "font-mono font-semibold text-foreground",
															children: "21300001 - VAT / Input Tax Recoverable"
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "py-1.5 px-2.5 font-mono text-[11px] text-muted-foreground",
														children: generatedReceipt.costCenter
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "py-1.5 px-2.5 font-mono font-bold text-right text-amber-600",
														children: generatedReceipt.taxAmount.toLocaleString()
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "py-1.5 px-2.5 font-mono text-right text-muted-foreground",
														children: "-"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
												className: "text-xs bg-muted/10",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
														className: "py-1.5 px-2.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "font-mono font-bold text-foreground",
															children: generatedReceipt.voucherType === "AP_INVOICE" ? "21100001 - Accounts Payable (Trade Creditors)" : "12400001 - Internal Facility Spare Parts Inventory"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "text-[10px] text-muted-foreground",
															children: ["Settlement via ", generatedReceipt.paymentMode]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "py-1.5 px-2.5 font-mono text-[11px] text-muted-foreground",
														children: generatedReceipt.costCenter
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "py-1.5 px-2.5 font-mono text-right text-muted-foreground",
														children: "-"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
														className: "py-1.5 px-2.5 font-mono font-bold text-right text-foreground",
														children: generatedReceipt.totalAmount.toLocaleString()
													})
												]
											})
										] })] })
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3 pt-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 rounded-lg bg-muted/20 border border-border space-y-1",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] uppercase text-muted-foreground font-semibold",
												children: "Authorized By / Originator"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-medium text-foreground",
												children: generatedReceipt.issuedBy
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[10px] text-emerald-600 flex items-center gap-1 font-mono",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheckBig, { className: "h-3 w-3" }), " Digitally Signed & Synced to AP"]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-right space-y-0.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] uppercase text-emerald-800 dark:text-emerald-300 font-semibold",
												children: "Total Voucher Value"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300",
												children: ["QAR ", generatedReceipt.totalAmount.toLocaleString()]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground",
												children: "Inclusive of all applied taxes"
											})
										]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "flex items-center justify-between sm:justify-between w-full pt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "gap-1.5 text-xs",
								onClick: () => {
									window.print();
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5" }), " Print / Save PDF"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1",
								onClick: () => setGeneratedReceipt(null),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), " Done & Close"]
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { MaintenanceModule };
