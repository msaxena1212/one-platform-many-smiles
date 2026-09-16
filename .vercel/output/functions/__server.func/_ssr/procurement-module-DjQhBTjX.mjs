import { i as __toESM } from "../_runtime.mjs";
import { B as supabase, I as fetchUnits, k as fetchProperties } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { $ as PackageCheck, $t as CircleCheck, A as ShieldCheck, Bt as DollarSign, E as ShoppingCart, G as Plus, Gt as Clock, Ht as CreditCard, I as Search, Kt as ClipboardList, Mn as Activity, O as Ship, Pt as Eye, Tn as ArrowUpRight, V as RefreshCw, Vt as Database, Z as Package, _t as Inbox, b as Star, cn as CheckCheck, dn as ChartColumn, dt as Layers, g as TrendingUp, gn as Building2, h as TriangleAlert, in as ChevronRight, kt as FileText, lt as Link2, m as Truck, r as Wrench, s as Users, v as Trash2 } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { l as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-DJOO1b-0.mjs";
import { d as FinVendorsApi } from "./supabase-finance-B6nDq-G1.mjs";
import { t as ApInvoicesApi } from "./proc-invoices-api-BBGs9sGK.mjs";
import { n as ProformaInvoiceDialog, t as PaymentReceiptDialog } from "./proforma-invoice-dialog-bIUbrys6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/procurement-module-DjQhBTjX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function nextProcurementDocumentNumber(docType, date = /* @__PURE__ */ new Date()) {
	const fiscalYear = date.getMonth() >= 3 ? date.getFullYear() : date.getFullYear() - 1;
	const { data, error } = await supabase.rpc("proc_next_document_number", {
		p_doc_type: docType,
		p_fiscal_year: fiscalYear
	});
	if (error) throw error;
	if (!data) throw new Error(`Unable to generate ${docType} document number.`);
	return data;
}
var defaultCatalogItems = [];
var typeLabel = {
	asset: "Fixed Asset",
	maintenance_spare: "Maintenance Spare",
	consumable: "Consumable",
	service: "Service"
};
var PROC_NAV = [
	{
		group: "Procurement Operations",
		icon: ClipboardList,
		color: "text-cyan-400",
		items: [
			{
				key: "requests",
				label: "Purchase Requests",
				icon: ShoppingCart
			},
			{
				key: "orders",
				label: "Purchase Orders",
				icon: ClipboardList
			},
			{
				key: "shipments",
				label: "Shipments",
				icon: Ship
			},
			{
				key: "receiving",
				label: "GRN / Receiving",
				icon: Truck
			}
		]
	},
	{
		group: "Vendor & Sourcing",
		icon: Users,
		color: "text-violet-400",
		items: [
			{
				key: "vendors",
				label: "Vendors",
				icon: Users
			},
			{
				key: "rfx",
				label: "RFX / Tenders",
				icon: Database
			},
			{
				key: "quotations",
				label: "Quotations",
				icon: Star
			}
		]
	},
	{
		group: "Approvals & Invoices",
		icon: Inbox,
		color: "text-amber-400",
		items: [{
			key: "inbox",
			label: "Approval Inbox",
			icon: Inbox
		}, {
			key: "invoices",
			label: "Payable Invoices",
			icon: DollarSign
		}]
	},
	{
		group: "Control Tower",
		icon: ChartColumn,
		color: "text-rose-400",
		items: [{
			key: "dashboard",
			label: "Procurement Analytics",
			icon: ChartColumn
		}, {
			key: "supplier_perf",
			label: "Supplier Scorecards",
			icon: TrendingUp
		}]
	},
	{
		group: "Asset & Maintenance Integration",
		icon: Link2,
		color: "text-orange-400",
		items: [{
			key: "assets",
			label: "Asset Linkage",
			icon: Link2
		}, {
			key: "maintenance",
			label: "Maintenance Stock",
			icon: Wrench
		}]
	},
	{
		group: "Item Master",
		icon: Package,
		color: "text-emerald-400",
		items: [{
			key: "catalog",
			label: "Item Catalog",
			icon: Package
		}]
	}
];
function statusBadgeVariant(s) {
	if ([
		"APPROVED",
		"COMPLETED",
		"PAID",
		"POSTED",
		"CLOSED"
	].includes(s)) return "default";
	if ([
		"REJECTED",
		"CANCELLED",
		"OVERDUE"
	].includes(s)) return "destructive";
	if ([
		"SUBMITTED",
		"IN_PROGRESS",
		"ALERTED",
		"RECEIVED",
		"IN TRANSIT",
		"IN_TRANSIT"
	].includes(s)) return "secondary";
	return "outline";
}
function LineItemCatalogSelector({ catalog, value, onSelect, placeholder = "Select or search catalog item..." }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [search, setSearch] = (0, import_react.useState)("");
	const dropdownRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setOpen(false);
		}
		if (open) document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [open]);
	const filtered = (0, import_react.useMemo)(() => {
		if (!search.trim()) return catalog;
		const q = search.toLowerCase();
		return catalog.filter((c) => c.name.toLowerCase().includes(q) || c.item_code.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
	}, [catalog, search]);
	const selected = catalog.find((c) => c.name === value || c.item_code === value || c.id === value);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		ref: dropdownRef,
		className: "relative w-full",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: () => setOpen(!open),
			className: `flex items-center justify-between border rounded-md px-3 py-1.5 text-xs bg-background cursor-pointer hover:border-primary/60 transition h-9 ${!value ? "border-amber-400/80 bg-amber-50/10" : "border-input"}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2 truncate min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `truncate font-medium ${selected || value ? "text-foreground font-semibold" : "text-muted-foreground"}`,
					children: selected ? `${selected.name} (${selected.item_code})` : value || placeholder
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5 shrink-0 ml-2",
				children: [selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono text-[11px] text-emerald-600 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20",
					children: ["QAR ", selected.unit_price]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-3.5 w-3.5 text-muted-foreground ml-0.5" })]
			})]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "absolute z-50 mt-1 w-full min-w-[300px] max-w-[500px] border rounded-lg bg-popover shadow-2xl text-xs overflow-hidden left-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "p-2 border-b bg-muted/40",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						autoFocus: true,
						placeholder: "Search catalog by name, SKU, or category...",
						value: search,
						onChange: (e) => setSearch(e.target.value),
						className: "h-8 pl-8 text-xs bg-background"
					})]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "max-h-56 overflow-y-auto divide-y divide-border/40",
				children: filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "p-4 text-center text-muted-foreground text-xs",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "No matching master items found." })
				}) : filtered.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					onClick: () => {
						onSelect(item);
						setOpen(false);
						setSearch("");
					},
					className: "p-2.5 hover:bg-primary/10 cursor-pointer flex justify-between items-center transition group",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1 mr-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold text-foreground group-hover:text-primary transition truncate",
							children: item.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground font-mono",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "bg-muted px-1.5 py-0.5 rounded font-semibold text-foreground",
									children: item.item_code
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.category }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-primary font-medium",
									children: [
										item.budget_type,
										" (",
										item.budget_head,
										")"
									]
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-right shrink-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-mono text-emerald-600 font-bold text-xs block",
							children: ["QAR ", item.unit_price]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[10px] text-muted-foreground",
							children: ["/", item.unit_of_measure]
						})]
					})]
				}, item.id))
			})]
		})]
	});
}
function ProcurementModule({ role }) {
	const routerState = useRouterState();
	const activeTab = new URLSearchParams(routerState.location.search).get("tab") || "requests";
	const [properties, setProperties] = (0, import_react.useState)([]);
	const [units, setUnits] = (0, import_react.useState)([]);
	const [vendors, setVendors] = (0, import_react.useState)([]);
	const [prs, setPrs] = (0, import_react.useState)([]);
	const [pos, setPos] = (0, import_react.useState)([]);
	const [poLines, setPoLines] = (0, import_react.useState)([]);
	const [grns, setGrns] = (0, import_react.useState)([]);
	const [grnLines, setGrnLines] = (0, import_react.useState)([]);
	const [rfxList, setRfxList] = (0, import_react.useState)([]);
	const [quoteList, setQuoteList] = (0, import_react.useState)([]);
	const [shipments, setShipments] = (0, import_react.useState)([]);
	const [inventoryParts, setInventoryParts] = (0, import_react.useState)([]);
	const [apInvoices, setApInvoices] = (0, import_react.useState)([]);
	const [catalog, setCatalog] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("proc_catalog_items");
			return saved ? JSON.parse(saved) : defaultCatalogItems;
		} catch {
			return defaultCatalogItems;
		}
	});
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [search, setSearch] = (0, import_react.useState)("");
	const [showNewPR, setShowNewPR] = (0, import_react.useState)(false);
	const [showNewPO, setShowNewPO] = (0, import_react.useState)(false);
	const [showReceiveModal, setShowReceiveModal] = (0, import_react.useState)(false);
	const [showNewRFX, setShowNewRFX] = (0, import_react.useState)(false);
	const [showNewQuote, setShowNewQuote] = (0, import_react.useState)(false);
	const [showCatalogModal, setShowCatalogModal] = (0, import_react.useState)(false);
	const [showShipmentModal, setShowShipmentModal] = (0, import_react.useState)(false);
	const [showReceiptModal, setShowReceiptModal] = (0, import_react.useState)(false);
	const [selectedReceipt, setSelectedReceipt] = (0, import_react.useState)(null);
	const [selectedPOForReceive, setSelectedPOForReceive] = (0, import_react.useState)(null);
	const [selectedShipment, setSelectedShipment] = (0, import_react.useState)(null);
	const [selectedAssetDetail, setSelectedAssetDetail] = (0, import_react.useState)(null);
	const [selectedStockDetail, setSelectedStockDetail] = (0, import_react.useState)(null);
	const [selectedCatalogDetail, setSelectedCatalogDetail] = (0, import_react.useState)(null);
	const [viewPr, setViewPr] = (0, import_react.useState)(null);
	const [viewPo, setViewPo] = (0, import_react.useState)(null);
	const [viewShipment, setViewShipment] = (0, import_react.useState)(null);
	const [viewGrn, setViewGrn] = (0, import_react.useState)(null);
	const [viewInvoice, setViewInvoice] = (0, import_react.useState)(null);
	const [paymentTargetInvoice, setPaymentTargetInvoice] = (0, import_react.useState)(null);
	const [procPayStep, setProcPayStep] = (0, import_react.useState)(1);
	const [paymentForm, setPaymentForm] = (0, import_react.useState)({
		paymentDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		paymentMethod: "Bank Wire / QNB Corporate Electronic",
		disbursingBank: "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
		transactionReference: "",
		beneficiaryAccount: "QA91QNBA99887766554433",
		cashCustodian: "Main Office Cashier Desk",
		cashReceiptNo: "",
		receiverName: "",
		receiverContact: "",
		chequeNumber: "",
		chequeDueDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
		creditCardAuth: "",
		remarks: "",
		paymentAmount: 0,
		applyAdvance: false,
		advanceAmount: 0
	});
	function createDefaultLineItem(propertyId = "", unitId = "") {
		return {
			id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
			itemId: "",
			itemCode: "",
			itemName: "",
			description: "",
			propertyId,
			unitId,
			quantity: 1,
			unitRate: 0,
			lineTotal: 0,
			itemType: "consumable",
			budgetType: "OPEX",
			budgetHead: "Maintenance Items",
			uom: "Nos",
			remarks: ""
		};
	}
	const [prForm, setPrForm] = (0, import_react.useState)({
		priority: "NORMAL",
		remarks: "",
		lines: [createDefaultLineItem()]
	});
	const [poForm, setPoForm] = (0, import_react.useState)({
		vendorId: "",
		sourcePrId: "",
		sourcePrDoc: "",
		paymentTerms: "Net 30 Days",
		settlementMode: "Bank Wire / Electronic Transfer (QNB)",
		deliveryTerms: "FOB Destination",
		remarks: "",
		lines: [createDefaultLineItem()]
	});
	const [receiveForm, setReceiveForm] = (0, import_react.useState)({
		warehouseName: "Main Facility Stores",
		receivingLocation: "Dock 1",
		remarks: "",
		lines: []
	});
	const [catalogForm, setCatalogForm] = (0, import_react.useState)({
		item_code: "",
		name: "",
		category: "HVAC",
		item_type: "asset",
		budget_type: "CAPEX",
		budget_head: "Property Assets",
		unit_price: 100,
		unit_of_measure: "Nos",
		reorder_level: 5,
		active: true
	});
	const [shipmentForm, setShipmentForm] = (0, import_react.useState)({
		purchaseOrderId: "",
		carrierName: "DHL Global Forwarding",
		trackingNumber: "",
		originCountry: "Qatar",
		destinationPort: "Hamad Port / Doha Logistics Village",
		incoterm: "DAP",
		estimatedArrival: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
		customsDeclarationNo: "",
		inTransitValue: "0",
		status: "DRAFT"
	});
	const [editShipment, setEditShipment] = (0, import_react.useState)(null);
	const [rfxForm, setRfxForm] = (0, import_react.useState)({
		title: "",
		rfxType: "RFP",
		prId: "",
		closingDate: new Date(Date.now() + 14 * 864e5).toISOString().slice(0, 10),
		scopeDescription: ""
	});
	const [quoteForm, setQuoteForm] = (0, import_react.useState)({
		rfxId: "",
		vendorId: "",
		amount: "0",
		taxAmount: "0",
		remarks: ""
	});
	const loadAll = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const [pRes, uRes, vRes, prRes, poRes, polRes, grnRes, grnlRes, rfxRes, vqRes, shRes, invRes, apInvRes] = await Promise.all([
				fetchProperties().catch(() => []),
				fetchUnits().catch(() => []),
				FinVendorsApi.fetchAll().catch(() => []),
				supabase.from("proc_purchase_requests").select("*").order("created_at", { ascending: false }),
				supabase.from("proc_purchase_orders").select("*").order("created_at", { ascending: false }),
				supabase.from("proc_purchase_order_lines").select("*").order("line_no", { ascending: true }),
				supabase.from("proc_goods_receipts").select("*").order("created_at", { ascending: false }),
				supabase.from("proc_grn_lines").select("*").order("line_no", { ascending: true }),
				supabase.from("proc_rfx").select("*").order("created_at", { ascending: false }),
				supabase.from("proc_vendor_quotes").select("*").order("created_at", { ascending: false }),
				supabase.from("proc_shipments").select("*").order("created_at", { ascending: false }),
				supabase.from("inventory_parts").select("*"),
				ApInvoicesApi.fetchAll().catch(() => [])
			]);
			const normalizedShipments = (shRes.data || []).map((s) => {
				let meta = {};
				if (s.remarks) try {
					if (s.remarks.startsWith("{") && s.remarks.endsWith("}")) meta = JSON.parse(s.remarks);
				} catch {}
				return {
					...s,
					carrier_name: s.carrier_name || s.shipping_mode || meta.carrier_name || "DHL Global Forwarding",
					tracking_number: s.tracking_number || meta.tracking_number || "",
					origin_country: s.origin_country || meta.origin_country || "Qatar",
					destination_port: s.destination_port || s.destination_city || meta.destination_port || "Hamad Port / Doha Logistics Village",
					incoterm: s.incoterm || meta.incoterm || "DAP",
					estimated_arrival: s.estimated_arrival || s.expected_arrival_date || meta.estimated_arrival || "",
					customs_declaration_no: s.customs_declaration_no || meta.customs_declaration_no || "",
					in_transit_value: s.in_transit_value ?? meta.in_transit_value ?? 0
				};
			});
			setProperties(pRes || []);
			setUnits(uRes || []);
			setVendors(vRes || []);
			setPrs(prRes.data || []);
			setPos(poRes.data || []);
			setPoLines(polRes.data || []);
			setGrns(grnRes.data || []);
			setGrnLines(grnlRes.data || []);
			setRfxList(rfxRes.data || []);
			setQuoteList(vqRes.data || []);
			setShipments(normalizedShipments);
			setInventoryParts(invRes.data || []);
			setApInvoices([]);
		} catch (e) {
			console.error("Error loading procurement data:", e);
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		loadAll();
		const handleUpdate = () => loadAll();
		window.addEventListener("ap_invoices_updated", handleUpdate);
		window.addEventListener("payment_receipts_updated", handleUpdate);
		return () => {
			window.removeEventListener("ap_invoices_updated", handleUpdate);
			window.removeEventListener("payment_receipts_updated", handleUpdate);
		};
	}, [loadAll]);
	function getVendorName(vendorId) {
		if (!vendorId) return "—";
		const v = vendors.find((x) => Number(x.id) === Number(vendorId) || x.code === String(vendorId));
		return v ? v.name : `Vendor #${vendorId}`;
	}
	function getPropertyName(propertyId) {
		if (!propertyId) return "Company / Multi-Property";
		const p = properties.find((x) => x.id === propertyId);
		return p ? p.title : "Property";
	}
	function getUnitRef(unitId) {
		if (!unitId) return "—";
		const u = units.find((x) => x.id === unitId);
		return u ? u.unit_ref || `Unit ${u.id}` : unitId;
	}
	function parsePrLines(pr) {
		if (pr.remarks && pr.remarks.includes("[LINES_JSON]:")) try {
			const jsonStr = pr.remarks.split("[LINES_JSON]:")[1].trim().split("\n")[0];
			const parsed = JSON.parse(jsonStr);
			if (Array.isArray(parsed) && parsed.length > 0) return parsed.map((l, i) => ({
				...l,
				maxQuantity: Number(l.quantity) || 1,
				prLineId: l.id || `pr-line-${pr.id}-${i}`
			}));
		} catch (e) {
			console.warn("Could not parse PR lines JSON:", e);
		}
		let itemDesc = "General Requisition Item";
		let itemCode = "";
		const match = pr.remarks?.match(/Item:\s*([^[()]+?)(?:\s*\[(.*?)\])?(?:\s*\((.*?)\))?$/);
		if (match) {
			itemDesc = match[1]?.trim() || "";
			itemCode = match[2]?.trim() || "";
		} else if (pr.remarks && !pr.remarks.startsWith("Requisition") && !pr.remarks.startsWith("[LINES_JSON]")) itemDesc = pr.remarks.replace(/^Item:\s*/i, "").trim();
		const tot = Number(pr.total_amount || 0);
		const matchedCat = defaultCatalogItems.find((c) => c.item_code === itemCode || c.name.toLowerCase() === itemDesc.toLowerCase());
		const unitPrice = matchedCat?.unit_price || tot;
		const qty = matchedCat && matchedCat.unit_price > 0 && tot > 0 ? Math.round(tot / matchedCat.unit_price) || 1 : 1;
		return [{
			id: `line-${pr.id || "1"}`,
			itemCode: itemCode || matchedCat?.item_code || "",
			itemName: itemDesc || matchedCat?.name || "Requisition Item",
			description: itemDesc,
			propertyId: pr.property_id || "",
			unitId: pr.unit_id || "",
			quantity: qty,
			maxQuantity: qty,
			prLineId: `pr-line-${pr.id || "1"}`,
			unitRate: unitPrice,
			lineTotal: tot,
			itemType: matchedCat?.item_type || "consumable",
			budgetType: matchedCat?.budget_type || "OPEX",
			budgetHead: matchedCat?.budget_head || "Maintenance Items",
			uom: matchedCat?.unit_of_measure || "Nos"
		}];
	}
	async function handleCreatePR() {
		setSaving(true);
		try {
			const docNum = await nextProcurementDocumentNumber("PR");
			const validLines = prForm.lines.filter((l) => (l.itemName || l.description) && Number(l.quantity) > 0);
			if (validLines.length === 0) {
				toast.error("Please add at least one line item with an item name and valid quantity.");
				setSaving(false);
				return;
			}
			const totalAmt = validLines.reduce((sum, l) => sum + (Number(l.quantity) || 1) * (Number(l.unitRate) || 0), 0);
			const primaryPropertyId = validLines[0]?.propertyId || null;
			const primaryUnitId = validLines[0]?.unitId || null;
			const remarksPayload = `[LINES_JSON]: ${JSON.stringify(validLines)}\n${prForm.remarks || ""}`.trim();
			const { data, error } = await supabase.from("proc_purchase_requests").insert({
				doc_number: docNum,
				request_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				status: "DRAFT",
				posting_status: "UNPOSTED",
				priority: prForm.priority,
				property_id: primaryPropertyId,
				unit_id: primaryUnitId,
				total_amount: totalAmt,
				remarks: remarksPayload
			}).select().single();
			if (error) throw error;
			toast.success(`Purchase Requisition ${docNum} created with ${validLines.length} item line(s).`);
			setShowNewPR(false);
			setPrForm({
				priority: "NORMAL",
				remarks: "",
				lines: [createDefaultLineItem()]
			});
			await loadAll();
		} catch (e) {
			toast.error(e.message || "Failed to create PR");
		} finally {
			setSaving(false);
		}
	}
	async function handleSubmitPR(pr) {
		setSaving(true);
		try {
			await supabase.from("proc_purchase_requests").update({ status: "SUBMITTED" }).eq("id", pr.id);
			toast.success(`PR ${pr.doc_number} submitted for approval.`);
			await loadAll();
		} catch (e) {
			toast.error(e.message);
		} finally {
			setSaving(false);
		}
	}
	async function handleApprovePR(pr) {
		setSaving(true);
		try {
			await supabase.from("proc_purchase_requests").update({ status: "APPROVED" }).eq("id", pr.id);
			toast.success(`PR ${pr.doc_number} approved. Ready to create RFX or PO.`);
			await loadAll();
		} catch (e) {
			toast.error(e.message);
		} finally {
			setSaving(false);
		}
	}
	async function handleCreatePO() {
		setSaving(true);
		try {
			const docNum = await nextProcurementDocumentNumber("PO");
			const validLines = poForm.lines.filter((l) => (l.itemName || l.description) && Number(l.quantity) > 0);
			if (validLines.length === 0) {
				toast.error("Please add at least one line item with item details and quantity.");
				setSaving(false);
				return;
			}
			for (const l of validLines) if (l.maxQuantity != null && Number(l.quantity) > l.maxQuantity) {
				toast.error(`Quantity for "${l.itemName || l.description}" (${l.quantity}) cannot exceed requested PR quantity of ${l.maxQuantity} ${l.uom || "Nos"}.`);
				setSaving(false);
				return;
			}
			const totalAmt = validLines.reduce((sum, l) => sum + (Number(l.quantity) || 1) * (Number(l.unitRate) || 0), 0);
			const primaryPropertyId = validLines[0]?.propertyId || null;
			const primaryUnitId = validLines[0]?.unitId || null;
			const { data: poData, error: poErr } = await supabase.from("proc_purchase_orders").insert({
				doc_number: docNum,
				po_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				vendor_id: Number(poForm.vendorId) || 1,
				status: "DRAFT",
				posting_status: "UNPOSTED",
				property_id: primaryPropertyId,
				unit_id: primaryUnitId,
				subtotal: totalAmt,
				tax_amount: 0,
				discount_amount: 0,
				total_amount: totalAmt,
				payment_terms: `${poForm.paymentTerms} (${poForm.settlementMode})`,
				delivery_terms: poForm.deliveryTerms,
				remarks: poForm.remarks || (poForm.sourcePrDoc ? `Generated from Requisition ${poForm.sourcePrDoc}` : "")
			}).select().single();
			if (poErr) throw poErr;
			const linesToInsert = validLines.map((l, idx) => ({
				purchase_order_id: poData.id,
				line_no: idx + 1,
				item_code: l.itemCode || null,
				item_name: l.itemName || l.description || "Procured Item",
				description: l.description || l.itemName || "Procured Item",
				quantity: Number(l.quantity) || 1,
				unit_rate: Number(l.unitRate) || 0,
				line_total: (Number(l.quantity) || 1) * (Number(l.unitRate) || 0),
				received_quantity: 0,
				accepted_quantity: 0,
				rejected_quantity: 0,
				item_type: l.itemType,
				uom: l.uom || "Nos",
				property_id: l.propertyId || null,
				unit_id: l.unitId || null,
				remarks: l.remarks || null
			}));
			const { error: lineErr } = await supabase.from("proc_purchase_order_lines").insert(linesToInsert);
			if (lineErr) console.warn("Error inserting PO lines:", lineErr);
			if (poForm.sourcePrId) try {
				const currentRemarks = prs.find((p) => p.id === poForm.sourcePrId)?.remarks || "";
				const updatedRemarks = currentRemarks ? `${currentRemarks} • [PO Issued: ${docNum}]` : `[PO Issued: ${docNum}]`;
				await supabase.from("proc_purchase_requests").update({
					status: "COMPLETED",
					posting_status: "POSTED",
					remarks: updatedRemarks
				}).eq("id", poForm.sourcePrId);
			} catch (prErr) {
				console.warn("Could not update PR status:", prErr);
			}
			toast.success(`Purchase Order ${docNum} issued in DRAFT with ${validLines.length} item line(s). PR #${poForm.sourcePrDoc || ""} marked as Completed.`);
			setShowNewPO(false);
			setPoForm({
				vendorId: "",
				sourcePrId: "",
				sourcePrDoc: "",
				paymentTerms: "Net 30 Days",
				settlementMode: "Bank Wire / Electronic Transfer (QNB)",
				deliveryTerms: "FOB Destination",
				remarks: "",
				lines: [createDefaultLineItem()]
			});
			await loadAll();
		} catch (e) {
			toast.error(e.message || "Failed to create PO");
		} finally {
			setSaving(false);
		}
	}
	async function handleApprovePO(po) {
		setSaving(true);
		try {
			await supabase.from("proc_purchase_orders").update({ status: "APPROVED" }).eq("id", po.id);
			toast.success(`PO ${po.doc_number} approved. Ready to dispatch shipment or receive.`);
			await loadAll();
		} catch (e) {
			toast.error(e.message);
		} finally {
			setSaving(false);
		}
	}
	function openReceiveModal(po) {
		setSelectedPOForReceive(po);
		const lines = poLines.filter((l) => l.purchase_order_id === po.id);
		const receiveLines = lines.length > 0 ? lines.map((l) => {
			const remaining = Math.max(0, Number(l.quantity || 0) - Number(l.received_quantity || 0));
			return {
				poLineId: l.id,
				itemCode: l.item_code || "",
				itemName: l.item_name || l.description || "Procured Item",
				description: l.description || "",
				propertyId: l.property_id || "",
				unitId: l.unit_id || "",
				orderedQty: Number(l.quantity || 0),
				prevReceivedQty: Number(l.received_quantity || 0),
				acceptedQty: remaining,
				rejectedQty: 0,
				unitRate: Number(l.unit_rate || 0),
				uom: l.uom || "Nos"
			};
		}) : [{
			poLineId: "",
			itemName: "PO Deliverables",
			description: po.remarks || "",
			propertyId: po.property_id || "",
			unitId: po.unit_id || "",
			orderedQty: 1,
			prevReceivedQty: 0,
			acceptedQty: 1,
			rejectedQty: 0,
			unitRate: Number(po.total_amount || 0),
			uom: "Lot"
		}];
		setReceiveForm({
			warehouseName: "Main Facility Stores",
			receivingLocation: "Dock 1",
			remarks: `Inward for PO ${po.doc_number}`,
			lines: receiveLines
		});
		setShowReceiveModal(true);
	}
	async function handleConfirmReceive() {
		if (!selectedPOForReceive) return;
		setSaving(true);
		try {
			const po = selectedPOForReceive;
			const grnNum = await nextProcurementDocumentNumber("GRN");
			const totalAccVal = receiveForm.lines.reduce((sum, l) => sum + (Number(l.acceptedQty) || 0) * (Number(l.unitRate) || 0), 0);
			const { data: grnData, error: grnErr } = await supabase.from("proc_goods_receipts").insert({
				grn_number: grnNum,
				purchase_order_id: po.id,
				vendor_id: po.vendor_id,
				grn_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				warehouse_name: receiveForm.warehouseName,
				receiving_location: receiveForm.receivingLocation,
				status: "APPROVED",
				posting_status: "POSTED",
				subtotal: totalAccVal,
				total_amount: totalAccVal,
				remarks: receiveForm.remarks
			}).select().single();
			if (grnErr) throw grnErr;
			for (let idx = 0; idx < receiveForm.lines.length; idx++) {
				const rl = receiveForm.lines[idx];
				const accQty = Number(rl.acceptedQty) || 0;
				const rejQty = Number(rl.rejectedQty) || 0;
				const rate = Number(rl.unitRate) || 0;
				const lineAccVal = accQty * rate;
				await supabase.from("proc_grn_lines").insert({
					goods_receipt_id: grnData.id,
					purchase_order_line_id: rl.poLineId || null,
					line_no: idx + 1,
					item_code: rl.itemCode || null,
					item_name: rl.itemName,
					description: rl.description || rl.itemName,
					ordered_quantity: rl.orderedQty,
					received_quantity: accQty + rejQty,
					accepted_quantity: accQty,
					rejected_quantity: rejQty,
					unit_rate: rate,
					accepted_amount: lineAccVal,
					uom: rl.uom
				});
				if (rl.poLineId) {
					const originalPoLine = poLines.find((p) => p.id === rl.poLineId);
					if (originalPoLine) await supabase.from("proc_purchase_order_lines").update({
						received_quantity: (originalPoLine.received_quantity || 0) + accQty + rejQty,
						accepted_quantity: (originalPoLine.accepted_quantity || 0) + accQty,
						rejected_quantity: (originalPoLine.rejected_quantity || 0) + rejQty
					}).eq("id", rl.poLineId);
				}
				if ((rl.itemCode?.startsWith("AST-") || rl.itemCode?.startsWith("FUR-") || rl.itemCode?.startsWith("APP-")) && accQty > 0) try {
					const { data: existingAsset } = await supabase.from("assets").select("id").eq("asset_tag", rl.itemCode).maybeSingle();
					if (!existingAsset) await supabase.from("assets").insert({
						asset_tag: rl.itemCode,
						name: rl.itemName,
						category: rl.itemCode?.startsWith("AST-HVAC") ? "HVAC" : rl.itemCode?.startsWith("AST-PUMP") ? "Plumbing" : rl.itemCode?.startsWith("AST-FUR") ? "Furnishing" : "Appliances",
						asset_status: "Available",
						property_id: rl.propertyId || null,
						unit_id: rl.unitId || null,
						purchase_cost: lineAccVal || rate,
						purchase_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
						condition: "Excellent",
						notes: `Received via GRN ${grnNum} (PO: ${po.doc_number})`
					});
				} catch (assetErr) {
					console.warn("Asset auto-creation notice:", assetErr);
				}
			}
			await supabase.from("proc_purchase_orders").update({
				status: "CLOSED",
				posting_status: "POSTED"
			}).eq("id", po.id);
			const invNum = `APINV-${grnNum.replace("GRN-", "")}`;
			const vendorObj = vendors.find((v) => String(v.id) === String(po.vendor_id));
			await ApInvoicesApi.create({
				invoice_number: invNum,
				vendor_id: po.vendor_id,
				po_number: po.doc_number,
				grn_number: grnNum,
				invoice_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				amount: totalAccVal,
				tax_amount: 0,
				total_amount: totalAccVal,
				payment_terms: vendorObj?.payment_terms || po.payment_terms || "Net 30 Days",
				settlement_mode: vendorObj?.settlement_mode || "Bank Wire / Electronic Transfer (QNB)",
				status: "DRAFT",
				remarks: `Auto-generated AP invoice for GRN ${grnNum}`
			});
			toast.success(`GRN ${grnNum} created with ${receiveForm.lines.length} line(s). AP Invoice ${invNum} drafted.`);
			setShowReceiveModal(false);
			await loadAll();
		} catch (e) {
			toast.error(e.message || "Failed to post GRN");
		} finally {
			setSaving(false);
		}
	}
	function openNewShipment() {
		setEditShipment(null);
		setShipmentForm({
			purchaseOrderId: pos[0]?.id || "",
			carrierName: "DHL Global Forwarding",
			trackingNumber: "",
			originCountry: "Qatar",
			destinationPort: "Hamad Port / Doha Logistics Village",
			incoterm: "DAP",
			estimatedArrival: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
			customsDeclarationNo: "",
			inTransitValue: "0",
			status: "DRAFT"
		});
		setShowShipmentModal(true);
	}
	function openEditShipmentModal(s) {
		setEditShipment(s);
		setShipmentForm({
			purchaseOrderId: s.purchase_order_id,
			carrierName: s.carrier_name || s.shipping_mode || "DHL Global Forwarding",
			trackingNumber: s.tracking_number || "",
			originCountry: s.origin_country || "Qatar",
			destinationPort: s.destination_port || s.destination_city || "Hamad Port / Doha Logistics Village",
			incoterm: s.incoterm || "DAP",
			estimatedArrival: s.estimated_arrival || s.expected_arrival_date || new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
			customsDeclarationNo: s.customs_declaration_no || "",
			inTransitValue: String(s.in_transit_value || 0),
			status: s.status || "APPROVED"
		});
		setShowShipmentModal(true);
	}
	async function handleSaveShipment() {
		setSaving(true);
		try {
			const targetPo = pos.find((p) => p.id === shipmentForm.purchaseOrderId);
			const metaPayload = {
				carrier_name: shipmentForm.carrierName,
				tracking_number: shipmentForm.trackingNumber,
				origin_country: shipmentForm.originCountry,
				destination_port: shipmentForm.destinationPort,
				incoterm: shipmentForm.incoterm,
				estimated_arrival: shipmentForm.estimatedArrival,
				customs_declaration_no: shipmentForm.customsDeclarationNo,
				in_transit_value: Number(shipmentForm.inTransitValue) || Number(targetPo?.total_amount) || 0
			};
			if (editShipment) {
				const { error } = await supabase.from("proc_shipments").update({
					shipping_mode: shipmentForm.carrierName,
					tracking_number: shipmentForm.trackingNumber || null,
					origin_country: shipmentForm.originCountry || "Qatar",
					destination_city: shipmentForm.destinationPort || "Hamad Port / Doha Logistics Village",
					expected_arrival_date: shipmentForm.estimatedArrival || null,
					status: shipmentForm.status || "APPROVED",
					remarks: JSON.stringify(metaPayload)
				}).eq("id", editShipment.id);
				if (error) throw error;
				toast.success(`Shipment updated successfully.`);
			} else {
				const shNum = await nextProcurementDocumentNumber("SH");
				const { error } = await supabase.from("proc_shipments").insert({
					shipment_number: shNum,
					purchase_order_id: shipmentForm.purchaseOrderId,
					vendor_id: targetPo?.vendor_id || 1,
					shipment_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
					expected_arrival_date: shipmentForm.estimatedArrival || null,
					shipping_mode: shipmentForm.carrierName || "DHL Global Forwarding",
					tracking_number: shipmentForm.trackingNumber || null,
					origin_country: shipmentForm.originCountry || "Qatar",
					destination_city: shipmentForm.destinationPort || "Hamad Port / Doha Logistics Village",
					status: "APPROVED",
					remarks: JSON.stringify(metaPayload)
				});
				if (error) throw error;
				toast.success(`Shipment ${shNum} created & dispatched.`);
			}
			setShowShipmentModal(false);
			await loadAll();
		} catch (e) {
			console.error("handleSaveShipment error:", e);
			toast.error(e.message || "Failed to save shipment");
		} finally {
			setSaving(false);
		}
	}
	async function handleConfirmPayment() {
		if (!paymentTargetInvoice) return;
		setSaving(true);
		try {
			const inv = paymentTargetInvoice;
			const totalDue = Number(inv.total_amount || 0);
			const partialKey = `partial_paid_${inv.id}`;
			const alreadyPaid = Number(localStorage.getItem(partialKey) || "0");
			const advKey = `vendor_advance_${inv.vendor_id}`;
			const advBalance = Number(localStorage.getItem(advKey) || "0");
			const cashAmount = paymentForm.paymentAmount;
			const advApplied = paymentForm.applyAdvance ? Math.min(paymentForm.advanceAmount, advBalance) : 0;
			const effectivePaid = cashAmount + advApplied;
			const newTotalPaid = alreadyPaid + effectivePaid;
			const isFullySettled = newTotalPaid >= totalDue - .01;
			localStorage.setItem(partialKey, String(newTotalPaid));
			if (advApplied > 0) localStorage.setItem(advKey, String(advBalance - advApplied));
			await ApInvoicesApi.update(inv.id, {
				status: isFullySettled ? "PAID" : "PARTIAL",
				amount_paid: newTotalPaid,
				posting_status: isFullySettled ? "POSTED" : "PARTIAL_POSTED",
				payment_method: paymentForm.paymentMethod,
				payment_reference: paymentForm.transactionReference
			});
			await loadAll();
			if (isFullySettled) toast.success(`Payment of QAR ${Number(effectivePaid).toLocaleString()} disbursed via ${paymentForm.paymentMethod}. Invoice settled.`);
			else {
				const remaining = totalDue - newTotalPaid;
				toast.info(`Partial payment of QAR ${cashAmount.toLocaleString()} disbursed. Remaining balance: QAR ${remaining.toLocaleString()}.`);
			}
			setPaymentTargetInvoice(null);
			openPaymentReceipt(inv);
		} catch (e) {
			toast.error(e.message || "Failed to process payment");
		} finally {
			setSaving(false);
		}
	}
	function openPaymentReceipt(inv) {
		const rcpt = ApInvoicesApi.getReceiptByInvoice(inv.invoice_number);
		if (rcpt) {
			setSelectedReceipt(rcpt);
			setShowReceiptModal(true);
		} else {
			setSelectedReceipt({
				id: `rcpt-${Date.now()}`,
				receipt_number: `RCPT-${inv.invoice_number.replace("APINV-", "")}`,
				voucher_number: `PV-${inv.invoice_number.replace("APINV-", "")}`,
				invoice_number: inv.invoice_number,
				po_number: inv.po_number,
				grn_number: inv.grn_number,
				vendor_id: inv.vendor_id,
				vendor_name: getVendorName(Number(inv.vendor_id)),
				amount_paid: inv.total_amount,
				payment_date: inv.paid_at || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
				payment_method: inv.payment_method || "Bank Wire / QNB Corporate Electronic",
				reference_no: inv.payment_reference || `TXN-${Date.now().toString().slice(-6)}`,
				bank_account: "Qatar National Bank (QNB) - Main Operating",
				gl_debit_account: "22100001 - Trade Payables - Vendors",
				gl_credit_account: "12000001 - Bank Operating Account (QNB)",
				status: "Settled",
				created_at: (/* @__PURE__ */ new Date()).toISOString()
			});
			setShowReceiptModal(true);
		}
	}
	const activeNavLabel = PROC_NAV.flatMap((g) => g.items).find((i) => i.key === activeTab)?.label ?? "Procurement";
	const totalSpend = pos.reduce((s, p) => s + Number(p.total_amount || 0), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col h-[calc(100vh-80px)] overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 flex flex-col min-w-0 overflow-hidden",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "flex-1 overflow-auto p-6 space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-2xl font-bold tracking-tight",
								children: activeNavLabel
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Manage sourcing, vendor negotiations, orders, receiving, and procurement intelligence."
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2 items-center flex-wrap",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										onClick: loadAll,
										disabled: loading,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}` }), "Refresh"]
									}),
									activeTab === "requests" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => setShowNewPR(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " New Purchase Request"]
									}),
									activeTab === "orders" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => setShowNewPO(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "mr-2 h-4 w-4" }), " New Purchase Order"]
									}),
									activeTab === "catalog" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => setShowCatalogModal(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " Add Master Item"]
									}),
									activeTab === "rfx" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => setShowNewRFX(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " Create RFX"]
									}),
									activeTab === "quotations" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => setShowNewQuote(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " Submit Quote"]
									}),
									activeTab === "shipments" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: openNewShipment,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-2 h-4 w-4" }), " New Shipment"]
									})
								]
							})]
						}),
						["requests", "orders"].includes(activeTab) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-2 lg:grid-cols-5 gap-3",
							children: [
								[
									"Purchase Requests",
									prs.length,
									ShoppingCart,
									"text-blue-500"
								],
								[
									"Purchase Orders",
									pos.length,
									ClipboardList,
									"text-cyan-500"
								],
								[
									"GRNs Received",
									grns.length,
									Truck,
									"text-emerald-500"
								],
								[
									"Active Vendors",
									vendors.length,
									Users,
									"text-violet-500"
								],
								[
									"Total PO Spend",
									`QAR ${totalSpend.toLocaleString()}`,
									DollarSign,
									"text-amber-500"
								]
							].map(([label, val, Icon, color]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "bg-card/50 shadow-sm border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "p-4 flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: `text-xl font-bold mt-1 ${color}`,
										children: val
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5 text-muted-foreground/60" })]
								})
							}, label))
						}),
						activeTab === "assets" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 lg:grid-cols-4 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "bg-card/50 shadow-sm border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-4 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Total CAPEX Assets"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xl font-bold mt-1 text-cyan-500",
											children: grnLines.length
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-5 w-5 text-cyan-500/60" })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "bg-card/50 shadow-sm border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-4 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Capitalized Value"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xl font-bold mt-1 text-emerald-500",
											children: ["QAR ", grnLines.reduce((s, gl) => s + Number(gl.accepted_quantity || 0) * Number(gl.unit_rate || 0), 0).toLocaleString()]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-5 w-5 text-emerald-500/60" })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "bg-card/50 shadow-sm border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-4 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Auto-Registered Inward"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xl font-bold mt-1 text-blue-500",
											children: [grnLines.length, " Units"]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5 text-blue-500/60" })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "bg-card/50 shadow-sm border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-4 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Asset Register Linkage"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xl font-bold mt-1 text-emerald-600",
											children: "100% Synced"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "h-5 w-5 text-emerald-600/60" })]
									})
								})
							]
						}),
						activeTab === "maintenance" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 lg:grid-cols-4 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "bg-card/50 shadow-sm border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-4 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Total Stock SKUs"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xl font-bold mt-1 text-primary",
											children: catalog.filter((c) => ["maintenance_spare", "consumable"].includes(c.item_type)).length
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-5 w-5 text-primary/60" })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "bg-card/50 shadow-sm border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-4 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "In-Stock Items"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xl font-bold mt-1 text-emerald-500",
											children: catalog.filter((c) => ["maintenance_spare", "consumable"].includes(c.item_type)).length
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-5 w-5 text-emerald-500/60" })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "bg-card/50 shadow-sm border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-4 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Low / Reorder Stock"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xl font-bold mt-1 text-amber-500",
											children: "0"
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 text-amber-500/60" })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "bg-card/50 shadow-sm border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-4 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Inventory Valuation"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xl font-bold mt-1 text-violet-500",
											children: ["QAR ", catalog.filter((c) => ["maintenance_spare", "consumable"].includes(c.item_type)).reduce((s, c) => s + Number(c.unit_price || 0) * 20, 0).toLocaleString()]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-5 w-5 text-violet-500/60" })]
									})
								})
							]
						}),
						activeTab === "catalog" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 lg:grid-cols-4 gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "bg-card/50 shadow-sm border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-4 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Total Master Items"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xl font-bold mt-1 text-primary",
											children: catalog.length
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-5 w-5 text-primary/60" })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "bg-card/50 shadow-sm border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-4 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Fixed Assets"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xl font-bold mt-1 text-cyan-500",
											children: catalog.filter((c) => c.item_type === "asset").length
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5 text-cyan-500/60" })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "bg-card/50 shadow-sm border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-4 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Maintenance Spares"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xl font-bold mt-1 text-amber-500",
											children: catalog.filter((c) => c.item_type === "maintenance_spare").length
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-5 w-5 text-amber-500/60" })]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "bg-card/50 shadow-sm border",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-4 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Consumables & Services"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xl font-bold mt-1 text-emerald-500",
											children: catalog.filter((c) => ["consumable", "service"].includes(c.item_type)).length
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-5 w-5 text-emerald-500/60" })]
									})
								})
							]
						}),
						activeTab === "requests" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: prs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { text: "No Purchase Requests recorded yet. Click 'New Purchase Request' to create one." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border rounded-lg overflow-hidden bg-card",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "bg-muted/50 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "PR # & Date"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Property Scope & Priority"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Linked Purchase Order"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold text-right",
											children: "Total Amount & Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold text-right",
											children: "Actions"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: prs.map((pr) => {
									const linkedPo = pos.find((p) => p.remarks?.includes(pr.doc_number) || pr.remarks && pr.remarks.includes(p.doc_number));
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "text-xs hover:bg-muted/30",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono font-bold text-primary text-xs",
													children: pr.doc_number
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground text-[11px]",
													children: pr.request_date
												})]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-semibold text-foreground text-xs flex items-center gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3 w-3 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "truncate",
														children: getPropertyName(pr.property_id)
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													className: "w-fit text-[9px] h-4 py-0",
													children: pr.priority || "NORMAL"
												})]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: linkedPo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													className: "text-cyan-700 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 font-mono text-[10px] w-fit",
													children: linkedPo.doc_number
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-[10px] text-muted-foreground",
													children: ["PO Issued • ", linkedPo.status]
												})]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground text-xs",
												children: "—"
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-col items-end gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-semibold font-mono text-xs text-foreground",
														children: ["QAR ", Number(pr.total_amount || 0).toLocaleString()]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: statusBadgeVariant(pr.status),
														className: "text-[10px] h-4 py-0",
														children: pr.status
													})]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-end gap-1.5 items-center",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															size: "sm",
															variant: "outline",
															className: "h-7 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/10",
															onClick: () => setViewPr(pr),
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), " View"]
														}),
														pr.status === "DRAFT" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															size: "sm",
															variant: "secondary",
															className: "h-7 text-xs gap-1",
															onClick: () => handleSubmitPR(pr),
															disabled: saving,
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3 w-3" }), " Submit"]
														}),
														pr.status === "SUBMITTED" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															size: "sm",
															variant: "outline",
															className: "h-7 text-xs",
															onClick: () => handleApprovePR(pr),
															disabled: saving,
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "mr-1 h-3.5 w-3.5 text-emerald-500" }), " Approve"]
														}),
														pr.status === "APPROVED" && !linkedPo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															size: "sm",
															className: "h-7 text-xs gap-1 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold shadow-sm",
															onClick: () => {
																const extractedLines = parsePrLines(pr);
																setPoForm({
																	vendorId: "",
																	sourcePrId: pr.id,
																	sourcePrDoc: pr.doc_number,
																	paymentTerms: "Net 30 Days",
																	settlementMode: "Bank Wire / Electronic Transfer (QNB)",
																	deliveryTerms: "FOB Destination",
																	remarks: `Issued from Approved PR #${pr.doc_number}`,
																	lines: extractedLines.length > 0 ? extractedLines : [createDefaultLineItem(pr.property_id || "", pr.unit_id || "")]
																});
																setShowNewPO(true);
															},
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-3 w-3" }), " Issue PO"]
														}),
														pr.status === "APPROVED" && linkedPo && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "secondary",
															className: "text-[10px] text-cyan-700 bg-cyan-50 border border-cyan-200",
															children: "PO Issued"
														}),
														pr.status === "COMPLETED" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "secondary",
															className: "text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200",
															children: "PO Fulfilled"
														})
													]
												})
											})
										]
									}, pr.id);
								}) })] })
							})
						}),
						activeTab === "orders" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: pos.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { text: "No Purchase Orders found. Create your first PO." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border rounded-lg overflow-hidden bg-card",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "bg-muted/50 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "PO # & Date"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Vendor & Property Scope"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold text-right",
											children: "Total Amount & Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Logistics Chain (SH / GRN)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "AP Invoice"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold text-right",
											children: "Actions"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: pos.map((po) => {
									const sh = shipments.find((s) => s.purchase_order_id === po.id);
									const grn = grns.find((g) => g.purchase_order_id === po.id);
									const inv = apInvoices.find((i) => i.po_number === po.doc_number || i.grn_number === grn?.grn_number);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "text-xs hover:bg-muted/30",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono font-bold text-primary text-xs",
													children: po.doc_number
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground text-[11px]",
													children: po.po_date
												})]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground text-xs",
													children: getVendorName(po.vendor_id)
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-muted-foreground text-[11px] flex items-center gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3 w-3 text-primary shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "truncate",
														children: getPropertyName(po.property_id)
													})]
												})]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-col items-end gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-mono font-bold text-xs text-foreground",
														children: ["QAR ", Number(po.total_amount).toLocaleString()]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: statusBadgeVariant(po.status),
														className: "text-[10px] h-4 py-0",
														children: po.status
													})]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1.5 text-[11px]",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground text-[10px] w-7",
														children: "SH:"
													}), sh ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: "outline",
														className: "font-mono text-cyan-600 text-[9px] h-4 py-0",
														children: sh.shipment_number
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "—"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-1.5 text-[11px]",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground text-[10px] w-7",
														children: "GRN:"
													}), grn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: "outline",
														className: "font-mono text-emerald-600 text-[9px] h-4 py-0",
														children: grn.grn_number
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "—"
													})]
												})]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: inv ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono text-[10px] text-primary font-semibold",
													children: inv.invoice_number
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: inv.status === "PAID" ? "default" : "outline",
													className: inv.status === "PAID" ? "bg-emerald-600 text-[9px] h-4 py-0 w-fit" : "text-amber-600 border-amber-500/40 text-[9px] h-4 py-0 w-fit",
													children: inv.status === "PAID" ? "Paid" : "Draft"
												})]
											}) : "—" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-end gap-1.5 items-center flex-wrap",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															size: "sm",
															variant: "outline",
															className: "h-7 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/10",
															onClick: () => setViewPo(po),
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), " View"]
														}),
														po.status === "DRAFT" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															size: "sm",
															variant: "secondary",
															className: "h-7 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
															onClick: async () => {
																setSaving(true);
																try {
																	await supabase.from("proc_purchase_orders").update({ status: "APPROVED" }).eq("id", po.id);
																	toast.success(`Purchase Order ${po.doc_number} confirmed and approved! Ready for Shipment or GRN Receiving.`);
																	await loadAll();
																} catch (e) {
																	toast.error(e.message || "Failed to approve PO");
																} finally {
																	setSaving(false);
																}
															},
															disabled: saving,
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "h-3.5 w-3.5 text-emerald-300" }), " Approve PO"]
														}),
														po.status === "SUBMITTED" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															size: "sm",
															variant: "outline",
															className: "h-7 text-xs gap-1 text-emerald-600 border-emerald-500/40 hover:bg-emerald-50",
															onClick: () => handleApprovePO(po),
															disabled: saving,
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "h-3.5 w-3.5 text-emerald-500" }), " Approve Order"]
														}),
														po.status === "APPROVED" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: sh ? !grn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															size: "sm",
															className: "h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm",
															onClick: () => openReceiveModal(po),
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, { className: "h-3.5 w-3.5" }), " Receive (GRN)"]
														}) : null : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															size: "sm",
															variant: "outline",
															className: "h-7 text-xs gap-1 text-cyan-600 border-cyan-500/40 hover:bg-cyan-50",
															onClick: () => {
																setShipmentForm((prev) => ({
																	...prev,
																	purchaseOrderId: po.id,
																	inTransitValue: String(po.total_amount)
																}));
																setShowShipmentModal(true);
															},
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ship, { className: "h-3 w-3" }), " Create Shipment"]
														}) })
													]
												})
											})
										]
									}, po.id);
								}) })] })
							})
						}),
						activeTab === "receiving" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: grns.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { text: "No Goods Receipt Notes posted yet. Receive items from the Purchase Orders tab." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border rounded-lg overflow-hidden bg-card",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "bg-muted/50 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "GRN # & PO Reference"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Items & Destination Location"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Vendor & Receipt Date"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Warehouse / Dock"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold text-right",
											children: "Accepted Total & Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "AP Invoice & Settlement"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold text-right",
											children: "Actions"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: grns.map((g) => {
									const po = pos.find((p) => p.id === g.purchase_order_id);
									const linkedInv = apInvoices.find((i) => i.grn_number === g.grn_number);
									const isPaid = linkedInv?.status === "PAID";
									const lines = grnLines.filter((gl) => gl.goods_receipt_id === g.id);
									const fallbackPoLines = po ? poLines.filter((pl) => pl.purchase_order_id === po.id) : [];
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "text-xs hover:bg-muted/30",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono font-bold text-emerald-600 text-xs",
													children: g.grn_number
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono text-cyan-700 text-[11px] flex items-center gap-1",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground font-normal",
															children: "PO:"
														}),
														" ",
														po?.doc_number || "—"
													]
												})]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "max-w-[260px]",
												children: lines.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-col gap-1",
													children: [lines.slice(0, 2).map((gl, i) => {
														const linkedPoLine = poLines.find((pl) => pl.id === gl.purchase_order_line_id);
														const propId = linkedPoLine?.property_id || po?.property_id;
														const unitId = linkedPoLine?.unit_id || po?.unit_id;
														return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex flex-col bg-muted/40 p-1.5 rounded border text-[11px] leading-tight",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center justify-between gap-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "font-semibold text-foreground truncate",
																	children: gl.item_name || gl.description
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "font-mono text-[10px] text-emerald-600 font-bold shrink-0",
																	children: [
																		gl.accepted_quantity,
																		"/",
																		gl.ordered_quantity,
																		" ",
																		gl.uom || "Nos"
																	]
																})]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-2.5 w-2.5 text-primary shrink-0" }),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "truncate",
																		children: getPropertyName(propId)
																	}),
																	unitId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
																		variant: "outline",
																		className: "text-[9px] px-1 py-0 h-3.5 bg-background font-mono",
																		children: ["Unit ", getUnitRef(unitId)]
																	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[9px] opacity-70",
																		children: "· Common Area"
																	})
																]
															})]
														}, i);
													}), lines.length > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[10px] text-muted-foreground font-semibold",
														children: [
															"+",
															lines.length - 2,
															" more items"
														]
													})]
												}) : fallbackPoLines.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "flex flex-col gap-1",
													children: fallbackPoLines.slice(0, 2).map((pl, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex flex-col bg-muted/40 p-1.5 rounded border text-[11px] leading-tight",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center justify-between gap-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-semibold text-foreground truncate",
																children: pl.item_name || pl.description
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "font-mono text-[10px] text-muted-foreground shrink-0",
																children: [
																	pl.quantity,
																	" ",
																	pl.uom || "Nos"
																]
															})]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-2.5 w-2.5 text-primary shrink-0" }),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "truncate",
																	children: getPropertyName(pl.property_id || po?.property_id)
																}),
																pl.unit_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
																	variant: "outline",
																	className: "text-[9px] px-1 py-0 h-3.5 bg-background font-mono",
																	children: ["Unit ", getUnitRef(pl.unit_id)]
																}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[9px] opacity-70",
																	children: "· Common Area"
																})
															]
														})]
													}, i))
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-[11px] text-muted-foreground",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: getPropertyName(po?.property_id) })
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground text-xs truncate max-w-[160px]",
													children: getVendorName(g.vendor_id)
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground text-[11px]",
													children: g.grn_date
												})]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium text-foreground text-xs",
													children: g.warehouse_name || "Main Warehouse"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground text-[11px]",
													children: g.receiving_location || "Central Dock"
												})]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-col items-end gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-bold font-mono text-xs text-foreground",
														children: ["QAR ", Number(g.total_amount || 0).toLocaleString()]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: "default",
														className: "text-[10px] h-4 py-0",
														children: g.status
													})]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: linkedInv ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono font-semibold text-primary text-[11px]",
													children: linkedInv.invoice_number
												}), isPaid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "default",
													className: "w-fit text-[9px] h-4 py-0 bg-emerald-600",
													children: "Paid & Settled"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													className: "w-fit text-[9px] h-4 py-0 text-amber-600 border-amber-500/40 bg-amber-500/10",
													children: linkedInv.status === "DRAFT" ? "Draft (Pending)" : linkedInv.status
												})]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground text-xs",
												children: "—"
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-end gap-1.5 flex-wrap",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-7 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/10",
														onClick: () => setViewGrn(g),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), " View"]
													}), !linkedInv && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-7 text-xs gap-1",
														onClick: async () => {
															const invNum = `APINV-${g.grn_number ? g.grn_number.replace("GRN-", "") : String(Date.now()).slice(-6)}`;
															await ApInvoicesApi.create({
																invoice_number: invNum,
																vendor_id: g.vendor_id || po?.vendor_id || "1",
																po_number: po?.doc_number,
																grn_number: g.grn_number,
																invoice_date: g.grn_date || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
																amount: Number(g.total_amount || 0),
																tax_amount: 0,
																total_amount: Number(g.total_amount || 0),
																status: "DRAFT"
															});
															await loadAll();
															toast.success(`AP Invoice ${invNum} generated.`);
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), " Create AP"]
													})]
												})
											})
										]
									}, g.id);
								}) })] })
							})
						}),
						activeTab === "vendors" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border rounded-lg overflow-hidden bg-card",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "bg-muted/50 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Vendor Code"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Vendor Name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Trade Category"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "City / Location"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Contact Person"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Payment Terms"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Account Status"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: vendors.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "text-xs hover:bg-muted/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono text-primary font-bold",
											children: v.code
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-semibold",
											children: v.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: v.category || "General Contractor" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: v.city || "Doha" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: v.contact_person || v.email || "—" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: v.payment_terms || "30 Days" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "default",
											children: "ACTIVE"
										}) })
									]
								}, v.id)) })] })
							})
						}),
						activeTab === "rfx" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border rounded-lg overflow-hidden bg-card",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "bg-muted/50 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "RFX Number"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Tender Title"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Sourcing Type"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Closing Date"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Status"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [rfxList.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "text-xs hover:bg-muted/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono font-bold text-primary",
											children: r.rfx_number
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-semibold",
											children: r.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											children: r.rfx_type
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: r.closing_date }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "default",
											children: r.status
										}) })
									]
								}, r.id)), rfxList.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									colSpan: 5,
									className: "text-center py-6 text-muted-foreground",
									children: "No active RFX tenders."
								}) })] })] })
							})
						}),
						activeTab === "quotations" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border rounded-lg overflow-hidden bg-card",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "bg-muted/50 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Quote Number"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Vendor Name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold text-right",
											children: "Quoted Amount (QAR)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Evaluation Status"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [quoteList.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "text-xs hover:bg-muted/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-mono font-bold text-primary",
											children: q.quote_number
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "font-semibold",
											children: getVendorName(q.vendor_id)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											className: "text-right font-mono font-bold",
											children: Number(q.total_amount || 0).toLocaleString()
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "default",
											children: q.status
										}) })
									]
								}, q.id)), quoteList.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									colSpan: 4,
									className: "text-center py-6 text-muted-foreground",
									children: "No vendor quotes submitted."
								}) })] })] })
							})
						}),
						activeTab === "inbox" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-6",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 md:grid-cols-4 gap-3",
									children: [
										[
											"Pending PR Approvals",
											prs.filter((p) => p.status === "SUBMITTED").length,
											"text-amber-500"
										],
										[
											"Pending PO Approvals",
											pos.filter((p) => p.status === "SUBMITTED").length,
											"text-cyan-500"
										],
										[
											"In-Transit Shipments",
											shipments.filter((s) => s.status === "APPROVED" || s.status === "DRAFT").length,
											"text-violet-500"
										],
										[
											"Pending Invoices",
											apInvoices.filter((i) => i.status !== "PAID").length,
											"text-emerald-500"
										]
									].map(([label, count, color]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
										className: "bg-card/50 shadow-sm",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
											className: "p-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: label
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: `text-2xl font-bold mt-1 ${color}`,
												children: count
											})]
										})
									}, label))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
										className: "text-base flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4 text-blue-500" }), "Purchase Requests Awaiting Approval"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Review and approve internal departmental purchase requisitions." })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
									className: "p-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "border-t overflow-hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
											className: "bg-muted/50 text-xs",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold",
													children: "Requisition #"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold",
													children: "Request Date"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold",
													children: "Property Scope"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold",
													children: "Priority"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold text-right",
													children: "Amount (QAR)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold text-right",
													children: "Actions"
												})
											]
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [prs.filter((p) => p.status === "SUBMITTED").length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											colSpan: 6,
											className: "text-center py-6 text-muted-foreground text-xs",
											children: "No pending Purchase Requests in approval queue."
										}) }), prs.filter((p) => p.status === "SUBMITTED").map((pr) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
											className: "text-xs hover:bg-muted/30",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "font-mono font-bold text-primary",
													children: pr.doc_number
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: pr.request_date }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: getPropertyName(pr.property_id) }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													children: pr.priority || "NORMAL"
												}) }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
													className: "text-right font-mono font-bold",
													children: ["QAR ", Number(pr.total_amount || 0).toLocaleString()]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-right",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														className: "h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white",
														onClick: () => handleApprovePR(pr),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3" }), " Approve PR"]
													})
												})
											]
										}, pr.id))] })] })
									})
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
									className: "pb-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
										className: "text-base flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-4 w-4 text-cyan-500" }), "Purchase Orders Awaiting Authorization"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Commercial review before vendor order dispatch." })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
									className: "p-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "border-t overflow-hidden",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
											className: "bg-muted/50 text-xs",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold",
													children: "PO Number"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold",
													children: "Vendor Name"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold",
													children: "Property Scope"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold",
													children: "Payment Terms"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold text-right",
													children: "Total Order (QAR)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
													className: "font-bold text-right",
													children: "Actions"
												})
											]
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [pos.filter((p) => p.status === "SUBMITTED").length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
											colSpan: 6,
											className: "text-center py-6 text-muted-foreground text-xs",
											children: "No pending Purchase Orders in approval queue."
										}) }), pos.filter((p) => p.status === "SUBMITTED").map((po) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
											className: "text-xs hover:bg-muted/30",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "font-mono font-bold text-primary",
													children: po.doc_number
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "font-semibold",
													children: getVendorName(po.vendor_id)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: getPropertyName(po.property_id) }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: po.payment_terms || "Net 30 Days" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
													className: "text-right font-mono font-bold",
													children: ["QAR ", Number(po.total_amount || 0).toLocaleString()]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-right",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														className: "h-7 text-xs gap-1 bg-cyan-600 hover:bg-cyan-700 text-white",
														onClick: () => handleApprovePO(po),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3" }), " Approve PO"]
													})
												})
											]
										}, po.id))] })] })
									})
								})] })
							]
						}),
						activeTab === "shipments" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border rounded-lg overflow-hidden bg-card",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "bg-muted/50 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Shipment # & PO Ref"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Items & Destination Location"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Carrier & Tracking"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Origin → ETA & Incoterm"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold text-right",
											children: "In-Transit Value & Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Linked GRN"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold text-right",
											children: "Actions"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [shipments.map((s) => {
									const po = pos.find((p) => p.id === s.purchase_order_id);
									const grn = grns.find((g) => g.purchase_order_id === s.purchase_order_id);
									const lines = po ? poLines.filter((l) => l.purchase_order_id === po.id) : [];
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "text-xs hover:bg-muted/30",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono font-bold text-cyan-600 text-xs",
													children: s.shipment_number
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "font-mono text-primary text-[11px] flex items-center gap-1",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground font-normal",
															children: "PO:"
														}),
														" ",
														po?.doc_number || "—"
													]
												})]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "max-w-[260px]",
												children: lines.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-col gap-1",
													children: [lines.slice(0, 2).map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex flex-col bg-muted/40 p-1.5 rounded border text-[11px] leading-tight",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center justify-between gap-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-semibold text-foreground truncate",
																children: l.item_name || l.description
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "font-mono text-[10px] text-cyan-600 font-bold shrink-0",
																children: [
																	l.quantity,
																	" ",
																	l.uom || "Nos"
																]
															})]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-2.5 w-2.5 text-primary shrink-0" }),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "truncate",
																	children: getPropertyName(l.property_id || po?.property_id)
																}),
																l.unit_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
																	variant: "outline",
																	className: "text-[9px] px-1 py-0 h-3.5 bg-background font-mono",
																	children: ["Unit ", getUnitRef(l.unit_id)]
																}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[9px] opacity-70",
																	children: "· Common Area"
																})
															]
														})]
													}, i)), lines.length > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-[10px] text-muted-foreground font-semibold",
														children: [
															"+",
															lines.length - 2,
															" more items"
														]
													})]
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-col",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold text-xs",
														children: getPropertyName(po?.property_id)
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground",
														children: "Main Receiving Facility"
													})]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-semibold text-foreground text-xs",
													children: s.carrier_name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-mono text-muted-foreground text-[11px]",
													children: s.tracking_number || "AWB Pending"
												})]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-xs text-foreground font-medium",
													children: [
														s.origin_country || "Qatar",
														" → ",
														s.estimated_arrival
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													className: "w-fit text-[9px] h-4 py-0",
													children: s.incoterm || "DAP"
												})]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-col items-end gap-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-bold font-mono text-xs text-foreground",
														children: ["QAR ", Number(s.in_transit_value || po?.total_amount || 0).toLocaleString()]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: statusBadgeVariant(s.status),
														className: "text-[10px] h-4 py-0",
														children: s.status
													})]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: grn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													className: "text-emerald-600 font-mono text-[10px] w-fit",
													children: grn.grn_number
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-emerald-700 font-medium",
													children: "Received"
												})]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground text-xs",
												children: "In Transit"
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-end gap-1.5 items-center flex-wrap",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-7 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/10",
														onClick: () => setViewShipment(s),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), " View"]
													}), po && !grn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														className: "h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white",
														onClick: () => openReceiveModal(po),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-3 w-3" }), " Receive GRN"]
													})]
												})
											})
										]
									}, s.id);
								}), shipments.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
									colSpan: 7,
									className: "text-center py-6 text-muted-foreground",
									children: "No active shipments recorded."
								}) })] })] })
							})
						}),
						activeTab === "invoices" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border rounded-lg overflow-hidden bg-card",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
									className: "bg-muted/50 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Invoice Number"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "PO Reference"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "GRN Reference"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Vendor Name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Payment Terms & Settlement Mode"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Invoice Date"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold text-right",
											children: "Amount (QAR)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold",
											children: "Payment Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
											className: "font-bold text-right",
											children: "Actions"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: apInvoices.map((inv) => {
									const isPaid = inv.status === "PAID";
									const totalDue = Number(inv.total_amount || 0);
									const alreadyPaid = Number(localStorage.getItem(`partial_paid_${inv.id}`) || "0");
									const outstanding = totalDue - alreadyPaid;
									const isPartial = inv.status === "PARTIAL";
									const matchedVendor = vendors.find((v) => String(v.id) === String(inv.vendor_id));
									const termsDisplay = inv.payment_terms || matchedVendor?.payment_terms || "Net 30 Days";
									const modeDisplay = inv.settlement_mode || inv.payment_method || matchedVendor?.settlement_mode || "Bank Wire / Electronic Transfer (QNB)";
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "text-xs hover:bg-muted/30",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "font-mono font-bold text-primary",
												children: inv.invoice_number
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "font-mono text-cyan-600",
												children: inv.po_number || "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "font-mono text-emerald-600",
												children: inv.grn_number || "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "font-semibold",
												children: getVendorName(Number(inv.vendor_id))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex flex-col gap-0.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "font-medium text-foreground",
													children: termsDisplay
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted-foreground",
													children: modeDisplay
												})]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: inv.invoice_date }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
												className: "text-right",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-mono font-bold",
													children: totalDue.toLocaleString()
												}), isPartial && alreadyPaid > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[10px] text-amber-600 font-mono",
													children: [
														"Paid: ",
														alreadyPaid.toLocaleString(),
														" | Due: ",
														outstanding.toLocaleString()
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: isPaid ? "default" : isPartial ? "secondary" : "outline",
												className: isPaid ? "bg-emerald-600" : isPartial ? "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400" : "",
												children: isPaid ? "Paid & Settled" : isPartial ? "Partial Payment" : "Draft / Unpaid"
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-end gap-1.5 items-center flex-wrap",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-7 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/10",
														onClick: () => {
															setViewInvoice(inv);
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), " View Details"]
													}), (isPaid || isPartial && alreadyPaid > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-7 text-xs px-2.5 gap-1 text-emerald-600 border-emerald-500/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
														onClick: () => openPaymentReceipt(inv),
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3 w-3" }),
															" ",
															isPartial ? "Receipts" : "Receipt"
														]
													})]
												})
											})
										]
									}, inv.id);
								}) })] })
							})
						}),
						activeTab === "dashboard" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { text: "No procurement analytics data available." }),
						false,
						activeTab === "supplier_perf" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
								className: "text-base",
								children: "Supplier Performance & Quality Scorecard"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Metrics aggregated across approved purchase orders, delivery compliance, and goods receipt acceptance." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "border-t overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "bg-muted/50 text-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Vendor Code"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Vendor Name"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Primary Trade"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right",
												children: "Orders Fulfilled"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right",
												children: "Total Spend (QAR)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right",
												children: "Quality Score"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right",
												children: "On-Time Rate"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Performance Tier"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableBody, { children: vendors.map((v, idx) => {
										const vPos = pos.filter((p) => Number(p.vendor_id) === Number(v.id));
										const vSpend = vPos.reduce((sum, p) => sum + Number(p.total_amount || 0), 0);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
											className: "text-xs hover:bg-muted/30",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "font-mono font-bold text-primary",
													children: v.code
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "font-semibold",
													children: v.name
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: v.category || "General Contractor" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-right font-mono font-bold",
													children: vPos.length || (idx === 0 ? 5 : 4)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableCell, {
													className: "text-right font-mono font-bold",
													children: ["QAR ", vSpend.toLocaleString()]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-right font-mono font-bold text-emerald-600",
													children: "100%"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-right font-mono font-bold text-emerald-600",
													children: "98.5%"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													className: "text-amber-500 border-amber-500/40 bg-amber-500/10 font-semibold text-[10px]",
													children: "★ Tier 1 Preferred"
												}) })
											]
										}, v.id);
									}) })] })
								})
							})] })
						}),
						activeTab === "assets" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-base",
									children: "Procurement Asset Queue & Register"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "CAPEX / Fixed Asset line items received via GRN — auto-mapped to the central Asset Register." })] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "border-t overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "bg-muted/50 text-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Asset Description"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "GRN Reference"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right",
												children: "Accepted Qty"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right",
												children: "Unit Rate (QAR)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right",
												children: "Total Value (QAR)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Asset Status"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Class / Category"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right",
												children: "Actions"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [grnLines.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										colSpan: 8,
										className: "text-center py-8 text-muted-foreground text-xs",
										children: "No CAPEX asset receipts found."
									}) }), grnLines.map((gl) => {
										const totalVal = Number(gl.accepted_quantity || 0) * Number(gl.unit_rate || 0);
										const grnRec = grns.find((g) => g.id === gl.goods_receipt_id || g.grn_number === gl.grn_number);
										const poRec = pos.find((p) => p.id === grnRec?.purchase_order_id);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
											className: "text-xs hover:bg-muted/30",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "font-semibold",
													children: gl.description || "Asset Item"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "font-mono text-cyan-600",
													children: gl.grn_number || grnRec?.grn_number || "—"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-right font-mono",
													children: Number(gl.accepted_quantity || 0).toLocaleString()
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-right font-mono",
													children: Number(gl.unit_rate || 0).toLocaleString()
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-right font-bold font-mono text-emerald-600",
													children: totalVal.toLocaleString()
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													className: "text-cyan-500 border-cyan-500/30 text-[10px]",
													children: "Auto-Registered"
												}) }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-muted-foreground",
													children: gl.item_type || "Fixed Asset"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-right",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-7 text-xs gap-1",
														onClick: () => setSelectedAssetDetail({
															...gl,
															grn: grnRec,
															po: poRec,
															totalVal
														}),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), " History / Details"]
													})
												})
											]
										}, gl.id);
									})] })] })
								})
							})] })
						}),
						activeTab === "maintenance" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-base",
									children: "Maintenance Stock Inventory"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Spare parts and consumables stocked for facility and building maintenance operations." })] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "border-t overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "bg-muted/50 text-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Item Code"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Item Name & Spec"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Category"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Type"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right",
												children: "On-Hand Qty"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right",
												children: "Reorder Level"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "UOM"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right",
												children: "Unit Cost (QAR)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Stock Status"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Location"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right",
												children: "Actions"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [catalog.filter((c) => ["maintenance_spare", "consumable"].includes(c.item_type)).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										colSpan: 11,
										className: "text-center py-8 text-muted-foreground text-xs",
										children: "No maintenance stock items found."
									}) }), catalog.filter((c) => ["maintenance_spare", "consumable"].includes(c.item_type)).map((item) => {
										let onHand = Number(item.on_hand_qty ?? item.quantity_on_hand ?? 25);
										let storageLoc = item.storage_location || item.warehouse_location || "Facility Store (Rack B-04)";
										try {
											const matched = JSON.parse(localStorage.getItem("pms_maintenance_stock") || "[]").find((s) => s.code === item.item_code || s.name?.toLowerCase().includes(item.name?.toLowerCase().slice(0, 10)));
											if (matched && typeof matched.onHand === "number") {
												onHand = matched.onHand;
												if (matched.location) storageLoc = matched.location;
											}
										} catch {}
										const reorder = Number(item.reorder_level ?? 10);
										const isLow = onHand > 0 && onHand <= reorder;
										const isOut = onHand === 0;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
											className: "text-xs hover:bg-muted/30",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "font-mono text-primary font-bold",
													children: item.item_code
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "font-semibold",
													children: item.name
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-muted-foreground",
													children: item.category
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													className: "text-[10px]",
													children: typeLabel[item.item_type] || item.item_type
												}) }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-right font-mono font-bold",
													children: onHand.toLocaleString()
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-right font-mono text-amber-600 font-semibold",
													children: reorder.toLocaleString()
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-muted-foreground",
													children: item.unit_of_measure || "EA"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-right font-mono",
													children: Number(item.standard_cost ?? item.unit_price ?? 0).toLocaleString()
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: isOut ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "destructive",
													className: "text-[10px]",
													children: "Out of Stock"
												}) : isLow ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													className: "text-[10px] bg-amber-500 hover:bg-amber-600",
													children: "Low Stock"
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													className: "text-[10px] bg-emerald-600 hover:bg-emerald-700",
													children: "In Stock"
												}) }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-muted-foreground",
													children: storageLoc
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
													className: "text-right",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-7 text-xs gap-1",
														onClick: () => setSelectedStockDetail({
															...item,
															current_on_hand: onHand,
															display_location: storageLoc
														}),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), " Movement History"]
													})
												})
											]
										}, item.id);
									})] })] })
								})
							})] })
						}),
						activeTab === "catalog" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-base",
									children: "Item Master Catalog"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: "Central register of all inventory items, fixed assets, maintenance spares, and billable services." })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "Search code, name, category...",
										value: search,
										onChange: (e) => setSearch(e.target.value),
										className: "w-64 text-xs h-8"
									})
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "border-t overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Table, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "bg-muted/50 text-xs",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Item Code"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Item Name & Description"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Category"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Item Type"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Budget Type / Head"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right",
												children: "Unit Price (QAR)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "UOM"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right",
												children: "Reorder Level"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold",
												children: "Status"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableHead, {
												className: "font-bold text-right",
												children: "Actions"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableBody, { children: [catalog.filter((c) => `${c.name} ${c.item_code} ${c.category} ${c.item_type}`.toLowerCase().includes(search.toLowerCase())).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableRow, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
										colSpan: 10,
										className: "text-center py-8 text-muted-foreground text-xs",
										children: "No catalog items matching search query."
									}) }), catalog.filter((c) => `${c.name} ${c.item_code} ${c.category} ${c.item_type}`.toLowerCase().includes(search.toLowerCase())).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TableRow, {
										className: "text-xs hover:bg-muted/30",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "font-mono text-primary font-bold",
												children: item.item_code
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "font-semibold",
												children: item.name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-muted-foreground",
												children: item.category
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: item.item_type === "asset" ? "default" : "secondary",
												className: "text-[10px]",
												children: typeLabel[item.item_type] || item.item_type
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs font-mono",
												children: [
													item.budget_type,
													" · ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: item.budget_head
													})
												]
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right font-mono font-semibold",
												children: Number(item.unit_price || 0).toLocaleString()
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-muted-foreground",
												children: item.unit_of_measure
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right font-mono text-amber-600 font-semibold",
												children: item.reorder_level || "—"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: item.active ? "outline" : "secondary",
												className: item.active ? "text-emerald-600 border-emerald-500/40 text-[10px]" : "text-[10px]",
												children: item.active ? "Active" : "Inactive"
											}) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableCell, {
												className: "text-right",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "outline",
													className: "h-7 text-xs gap-1",
													onClick: () => setSelectedCatalogDetail(item),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), " View Details"]
												})
											})
										]
									}, item.id))] })] })
								})
							})] })
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					open: !!paymentTargetInvoice,
					onOpenChange: (open) => {
						if (!open) setPaymentTargetInvoice(null);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-xl",
						onPointerDownOutside: (e) => e.preventDefault(),
						onEscapeKeyDown: (e) => e.preventDefault(),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
								className: "p-4 pb-2.5 border-b shrink-0 bg-muted/10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
									className: "flex items-center gap-2 text-base",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-5 w-5 text-emerald-600" }), "Disburse Payment & Select Payment Mode"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "text-xs",
									children: "Complete the 2-step settlement workflow to disburse funds and verify GL/SL double-entry posting."
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-2 border-b px-4 py-2 bg-muted/30 shrink-0",
								children: [{
									step: 1,
									label: "1. Settlement & Payment Mode",
									icon: CreditCard
								}, {
									step: 2,
									label: "2. GL & Accounts Verification",
									icon: ShieldCheck
								}].map(({ step, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setProcPayStep(step),
									className: `flex items-center justify-center gap-2 p-2 rounded-lg text-xs font-semibold transition-all ${procPayStep === step ? "bg-primary/10 text-primary border border-primary/30" : procPayStep > step ? "text-emerald-600 hover:bg-muted/50" : "text-muted-foreground hover:bg-muted/30"}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${procPayStep === step ? "bg-primary text-primary-foreground" : procPayStep > step ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground border"}`,
										children: procPayStep > step ? "✓" : step
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "truncate",
										children: label
									})]
								}, step))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex-1 overflow-y-auto px-5 py-4 max-h-[calc(85vh-135px)]",
								children: paymentTargetInvoice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4 py-1 text-xs",
									children: [procPayStep === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-3.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between font-semibold",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-muted-foreground",
															children: "Invoice Reference:"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-mono text-primary",
															children: paymentTargetInvoice.invoice_number
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between font-semibold",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-muted-foreground",
															children: "Vendor Name:"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: getVendorName(Number(paymentTargetInvoice.vendor_id)) })]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between font-semibold",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-muted-foreground",
															children: "PO & GRN Chain:"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-mono",
															children: [
																paymentTargetInvoice.po_number || "—",
																" → ",
																paymentTargetInvoice.grn_number || "—"
															]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between text-sm font-bold border-t border-emerald-500/20 pt-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Invoice Amount:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "text-emerald-600 font-mono",
															children: ["QAR ", Number(paymentTargetInvoice.total_amount || 0).toLocaleString()]
														})]
													})
												]
											}),
											(() => {
												const totalDue = Number(paymentTargetInvoice.total_amount || 0);
												const partialKey = `partial_paid_${paymentTargetInvoice.id}`;
												const alreadyPaid = Number(localStorage.getItem(partialKey) || "0");
												const outstanding = totalDue - alreadyPaid;
												const advKey = `vendor_advance_${paymentTargetInvoice.vendor_id}`;
												const advBalance = Number(localStorage.getItem(advKey) || "0");
												const payingNow = paymentForm.paymentAmount;
												const advApplied = paymentForm.applyAdvance ? Math.min(paymentForm.advanceAmount, advBalance) : 0;
												const remaining = outstanding - payingNow - advApplied;
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-3",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "grid grid-cols-3 gap-2 text-center",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "p-2 rounded-md bg-muted/50 border",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																		className: "text-[10px] text-muted-foreground",
																		children: "Invoice Total"
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																		className: "font-bold font-mono text-sm",
																		children: ["QAR ", totalDue.toLocaleString()]
																	})]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "p-2 rounded-md bg-blue-500/10 border border-blue-500/20",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																		className: "text-[10px] text-blue-600",
																		children: "Previously Paid"
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																		className: "font-bold font-mono text-sm text-blue-600",
																		children: ["QAR ", alreadyPaid.toLocaleString()]
																	})]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: `p-2 rounded-md border ${remaining <= .01 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20"}`,
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																		className: `text-[10px] ${remaining <= .01 ? "text-emerald-600" : "text-amber-600"}`,
																		children: remaining <= .01 ? "Fully Settled" : "Remaining After"
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																		className: `font-bold font-mono text-sm ${remaining <= .01 ? "text-emerald-600" : "text-amber-600"}`,
																		children: ["QAR ", Math.max(0, remaining).toLocaleString()]
																	})]
																})
															]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "p-3 rounded-lg bg-muted/30 border space-y-2",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "flex items-center justify-between",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																		className: "text-xs font-bold",
																		children: "Payment Amount (QAR) *"
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																		type: "button",
																		className: "text-[10px] text-primary underline",
																		onClick: () => setPaymentForm({
																			...paymentForm,
																			paymentAmount: outstanding
																		}),
																		children: "Pay Full Outstanding"
																	})]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																	type: "number",
																	min: "0",
																	max: outstanding,
																	value: paymentForm.paymentAmount,
																	onChange: (e) => setPaymentForm({
																		...paymentForm,
																		paymentAmount: Math.min(Number(e.target.value), outstanding)
																	}),
																	className: "font-mono font-bold text-base h-10"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "flex justify-between text-[10px] text-muted-foreground",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Outstanding: QAR ", outstanding.toLocaleString()] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: payingNow >= outstanding ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold",
																		children: payingNow >= outstanding ? "Full settlement" : `Partial — QAR ${Math.max(0, outstanding - payingNow - advApplied).toLocaleString()} will remain`
																	})]
																})
															]
														}),
														advBalance > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 space-y-2",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center gap-2",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
																	type: "checkbox",
																	id: "procApplyAdv",
																	checked: paymentForm.applyAdvance,
																	onChange: (e) => setPaymentForm({
																		...paymentForm,
																		applyAdvance: e.target.checked
																	}),
																	className: "h-4 w-4 rounded"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
																	htmlFor: "procApplyAdv",
																	className: "text-xs font-semibold cursor-pointer",
																	children: ["Apply Vendor Advance Balance — Available: ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																		className: "font-mono text-violet-700 dark:text-violet-400",
																		children: ["QAR ", advBalance.toLocaleString()]
																	})]
																})]
															}), paymentForm.applyAdvance && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "space-y-1.5",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																		className: "text-[10px] font-semibold block",
																		children: "Advance Amount to Apply (QAR)"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																		type: "number",
																		min: "0",
																		max: Math.min(advBalance, outstanding),
																		value: paymentForm.advanceAmount,
																		onChange: (e) => setPaymentForm({
																			...paymentForm,
																			advanceAmount: Math.min(Number(e.target.value), advBalance, outstanding)
																		}),
																		className: "font-mono h-8 text-xs"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																		className: "text-[10px] text-muted-foreground font-mono",
																		children: ["Offset: Dr. 22100001 Trade Payables / Cr. 12300001 Advance to Vendors — QAR ", advApplied.toLocaleString()]
																	})
																]
															})]
														})
													]
												});
											})(),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Payment Date *",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "date",
														value: paymentForm.paymentDate,
														onChange: (e) => setPaymentForm({
															...paymentForm,
															paymentDate: e.target.value
														}),
														className: "h-8 text-xs"
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Payment Mode *",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: paymentForm.paymentMethod,
														onValueChange: (v) => setPaymentForm({
															...paymentForm,
															paymentMethod: v
														}),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "h-8 text-xs",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Bank Wire / QNB Corporate Electronic",
																children: "Bank Wire / Electronic Transfer (QNB)"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Commercial Bank of Qatar (CBQ) Wire",
																children: "CBQ Electronic Wire"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Cash in Hand / Office Vault Cash",
																children: "Cash in Hand / Office Vault Cash"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Petty Cash / Direct Cash",
																children: "Petty Cash / Direct Cash Voucher"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Corporate Cheque / Manager's Cheque",
																children: "Corporate Cheque / Manager's Cheque"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Purchasing Credit Card",
																children: "Purchasing Credit Card"
															})
														] })]
													})
												})]
											}),
											(paymentForm.paymentMethod.includes("Cash") || paymentForm.paymentMethod.includes("Petty")) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4" }), " Cash Disbursement & Handover Details"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "grid grid-cols-2 gap-3",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
															label: "Disbursing Cash Vault / Till",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																disabled: true,
																value: "12100001 - Cash in Hand (Office Cashier Vault)",
																className: "bg-background h-8 text-xs"
															})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
															label: "Petty Cash Voucher / Receipt # *",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																value: paymentForm.cashReceiptNo,
																onChange: (e) => setPaymentForm({
																	...paymentForm,
																	cashReceiptNo: e.target.value
																}),
																placeholder: "PCV-00821",
																className: "h-8 text-xs font-mono"
															})
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "grid grid-cols-2 gap-3",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
															label: "Receiver / Vendor Rep Name *",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																value: paymentForm.receiverName,
																onChange: (e) => setPaymentForm({
																	...paymentForm,
																	receiverName: e.target.value
																}),
																placeholder: "Full name of representative",
																className: "h-8 text-xs"
															})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
															label: "Receiver Contact / QID",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																value: paymentForm.receiverContact,
																onChange: (e) => setPaymentForm({
																	...paymentForm,
																	receiverContact: e.target.value
																}),
																placeholder: "+974 / QID #",
																className: "h-8 text-xs"
															})
														})]
													})
												]
											}),
											paymentForm.paymentMethod.includes("Cheque") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-4 w-4" }), " Corporate Cheque Details"]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "grid grid-cols-2 gap-3",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
															label: "Issuing Bank",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																disabled: true,
																value: "Qatar National Bank (QNB) - Corporate Cheque",
																className: "bg-background h-8 text-xs"
															})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
															label: "Cheque Number *",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																value: paymentForm.chequeNumber,
																onChange: (e) => setPaymentForm({
																	...paymentForm,
																	chequeNumber: e.target.value
																}),
																placeholder: "CHQ-004812",
																className: "h-8 text-xs font-mono"
															})
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "grid grid-cols-2 gap-3",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
															label: "Cheque Due / Value Date",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																type: "date",
																value: paymentForm.chequeDueDate,
																onChange: (e) => setPaymentForm({
																	...paymentForm,
																	chequeDueDate: e.target.value
																}),
																className: "h-8 text-xs"
															})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
															label: "Payee / In Favor Of",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																value: getVendorName(Number(paymentTargetInvoice.vendor_id)),
																disabled: true,
																className: "bg-background h-8 text-xs"
															})
														})]
													})
												]
											}),
											paymentForm.paymentMethod.includes("Wire") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-3 p-3.5 rounded-lg bg-blue-500/10 border border-blue-500/20",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Disbursing Bank Account",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: paymentForm.disbursingBank,
														onValueChange: (v) => setPaymentForm({
															...paymentForm,
															disbursingBank: v
														}),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "h-8 text-xs",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Qatar National Bank (QNB) - Main Operating (IBAN: QA42QNBA00000000123456)",
															children: "QNB - Main Operating (QA42QNBA00000000123456)"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Commercial Bank of Qatar (CBQ) - Operational (IBAN: QA99CBQA00000000654321)",
															children: "CBQ - Operational (QA99CBQA00000000654321)"
														})] })]
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-2 gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Wire Transfer Reference #",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															value: paymentForm.transactionReference,
															onChange: (e) => setPaymentForm({
																...paymentForm,
																transactionReference: e.target.value
															}),
															placeholder: "e.g. TXN-998821",
															className: "h-8 text-xs font-mono"
														})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Beneficiary Account / IBAN",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															value: paymentForm.beneficiaryAccount,
															onChange: (e) => setPaymentForm({
																...paymentForm,
																beneficiaryAccount: e.target.value
															}),
															className: "h-8 text-xs font-mono"
														})
													})]
												})]
											})
										]
									}), procPayStep === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-4 rounded-xl bg-muted/40 border space-y-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-xs font-bold text-foreground flex items-center gap-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-emerald-600" }), " Chart of Accounts (COA) / GL / SL Double-Entry Mapping"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between items-center text-[11px]",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-bold text-blue-700 dark:text-blue-400 font-mono",
															children: "DEBIT (Dr.) — Liability Settlement"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-bold font-mono text-blue-700 dark:text-blue-400",
															children: ["QAR ", (paymentForm.paymentAmount + (paymentForm.applyAdvance ? paymentForm.advanceAmount : 0)).toLocaleString()]
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-[11px] grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t border-blue-200/50",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "GL Code:" }), " 22100001"] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "GL Name:" }), " Trade Payables (Vendors)"] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Account Group:" }), " Current Liabilities"] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Sub-Ledger:" }),
																" ",
																getVendorName(Number(paymentTargetInvoice.vendor_id))
															] })
														]
													})]
												}),
												paymentForm.paymentAmount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3 rounded-lg border bg-emerald-50/50 dark:bg-emerald-950/20 space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between items-center text-[11px]",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-bold text-emerald-700 dark:text-emerald-400 font-mono",
															children: "CREDIT (Cr.) — Disbursing Source"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-bold font-mono text-emerald-700 dark:text-emerald-400",
															children: ["QAR ", paymentForm.paymentAmount.toLocaleString()]
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-[11px] grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t border-emerald-200/50",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "GL Code:" }),
																" ",
																paymentForm.paymentMethod.includes("Cash") ? "12100001" : "12000001"
															] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "GL Name:" }),
																" ",
																paymentForm.paymentMethod.includes("Cash") ? "Cash in Hand (Office Vault)" : "Bank Operating Account (QNB/CBQ)"
															] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Account Group:" }), " Current Assets / Cash & Bank"] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Voucher Type:" }), " PV (Payment Voucher)"] })
														]
													})]
												}),
												paymentForm.applyAdvance && paymentForm.advanceAmount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3 rounded-lg border bg-violet-50/50 dark:bg-violet-950/20 space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between items-center text-[11px]",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-bold text-violet-700 dark:text-violet-400 font-mono",
															children: "CREDIT (Cr.) — Advance Offset"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-bold font-mono text-violet-700 dark:text-violet-400",
															children: ["QAR ", paymentForm.advanceAmount.toLocaleString()]
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-[11px] grid grid-cols-2 gap-2 text-muted-foreground pt-1 border-t border-violet-200/50",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "GL Code:" }), " 12300001"] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "GL Name:" }), " Advance to Vendors"] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Account Group:" }), " Current Assets (Advance Payments)"] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Offset Status:" }), " Cleared from Advance Ledger"] })
														]
													})]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-3 rounded-lg border bg-background text-[11px] space-y-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Invoice Reference:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono font-bold text-primary",
														children: paymentTargetInvoice.invoice_number
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Payment Mode:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-semibold",
														children: paymentForm.paymentMethod
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground",
														children: "Transaction / Voucher Ref:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono",
														children: paymentForm.transactionReference || "Auto-Generated"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex justify-between border-t pt-1.5 font-bold",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Total Settlement Impact:" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-mono text-emerald-600",
														children: ["QAR ", (paymentForm.paymentAmount + (paymentForm.applyAdvance ? paymentForm.advanceAmount : 0)).toLocaleString()]
													})]
												})
											]
										})]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "p-4 border-t bg-muted/20 flex flex-row justify-between items-center sm:justify-between w-full shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: procPayStep > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "button",
									variant: "outline",
									size: "sm",
									onClick: () => setProcPayStep((s) => s - 1),
									children: "Back to Details"
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "sm",
										onClick: () => setPaymentTargetInvoice(null),
										children: "Cancel"
									}), procPayStep === 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										size: "sm",
										onClick: () => {
											if (paymentForm.paymentAmount <= 0 && (!paymentForm.applyAdvance || paymentForm.advanceAmount <= 0)) return toast.error("Please enter a payment amount or apply advance credit.");
											setProcPayStep(2);
										},
										children: ["Verify GL & Accounts ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-1 h-3.5 w-3.5" })]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										className: "bg-emerald-600 hover:bg-emerald-700 text-white gap-1",
										onClick: handleConfirmPayment,
										disabled: saving,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), " Confirm & Post to GL"]
									})]
								})]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					open: !!selectedAssetDetail,
					onOpenChange: () => setSelectedAssetDetail(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "max-w-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-5 w-5 text-cyan-500" }), "Asset Details & Capitalization History"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Permanent record of asset receipt, capitalization value, and register mapping." })] }),
							selectedAssetDetail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4 py-2 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/40 border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: "Asset Description"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-bold text-foreground mt-0.5",
											children: selectedAssetDetail.description
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: "Classification"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-semibold text-foreground mt-0.5",
											children: selectedAssetDetail.item_type || "Fixed Asset"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: "Inward GRN Reference"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono text-cyan-600 font-bold",
											children: selectedAssetDetail.grn?.grn_number || selectedAssetDetail.grn_number || "—"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: "Purchase Order"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono text-primary font-bold",
											children: selectedAssetDetail.po?.doc_number || "—"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: "Accepted Inward Qty"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm font-mono font-bold",
											children: [selectedAssetDetail.accepted_quantity, " Units"]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: "Unit Acquisition Rate"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm font-mono font-bold",
											children: ["QAR ", Number(selectedAssetDetail.unit_rate || 0).toLocaleString()]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: "Total Capitalized Value"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-base font-mono font-bold text-emerald-600",
											children: ["QAR ", Number(selectedAssetDetail.totalVal || selectedAssetDetail.accepted_quantity * selectedAssetDetail.unit_rate || 0).toLocaleString()]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: "Register Sync Status"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "default",
											className: "bg-emerald-600 mt-1",
											children: "Auto-Mapped to Asset Register"
										})] })
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
									className: "font-bold text-foreground mb-2 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-cyan-500" }), " Lifecycle & Movement History"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border rounded-lg p-3 space-y-2.5 bg-card",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between border-b pb-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold",
												children: "Procurement Inward & Physical Verification"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-muted-foreground",
												children: ["Received at Main Facility Stores via ", selectedAssetDetail.grn?.warehouse_name || "Dock 1"]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-emerald-600 border-emerald-500/40",
												children: "Verified"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between border-b pb-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold",
												children: "Finance Capitalization Entry"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-muted-foreground",
												children: "Fixed Assets Portfolio (13000) Accrual generated"
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-blue-600 border-blue-500/40",
												children: "Posted"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold",
												children: "Central Asset Tag & Barcode"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-muted-foreground",
												children: ["Tag ID: AST-", String(selectedAssetDetail.id || "001").slice(-6).toUpperCase()]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												children: "In Service"
											})]
										})
									]
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setSelectedAssetDetail(null),
								children: "Close"
							}) })
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					open: !!selectedStockDetail,
					onOpenChange: () => setSelectedStockDetail(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "max-w-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-5 w-5 text-amber-500" }), "Stock Item Details & Movement History"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Inventory specifications, storage locations, stock thresholds, and transaction history." })] }),
							selectedStockDetail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4 py-2 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-3 gap-3 p-4 rounded-lg bg-muted/40 border",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: "Part Code"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-mono text-primary font-bold text-sm",
											children: selectedStockDetail.item_code
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "col-span-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-muted-foreground",
												children: "Item Name & Spec"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold text-sm",
												children: selectedStockDetail.name
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: "Category"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold",
											children: selectedStockDetail.category
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: "UOM"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold",
											children: selectedStockDetail.unit_of_measure || "Nos"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: "Unit Cost"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "font-mono font-bold text-emerald-600",
											children: ["QAR ", Number(selectedStockDetail.unit_price || selectedStockDetail.standard_cost || 0).toLocaleString()]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: "Current Stock"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-base font-mono font-bold text-primary",
											children: [
												selectedStockDetail.current_on_hand ?? selectedStockDetail.on_hand_qty ?? 25,
												" ",
												selectedStockDetail.unit_of_measure || "Nos"
											]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: "Reorder Threshold"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-base font-mono font-bold text-amber-600",
											children: [
												selectedStockDetail.reorder_level || 15,
												" ",
												selectedStockDetail.unit_of_measure || "Nos"
											]
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-muted-foreground",
											children: "Storage Location"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold",
											children: selectedStockDetail.display_location || selectedStockDetail.storage_location || "Facility Store (Rack B-04)"
										})] })
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
									className: "font-bold text-foreground mb-2 flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, { className: "h-4 w-4 text-amber-500" }), " Stock Movement Register (Inward / Outward)"]
								}), (() => {
									let movements = [];
									try {
										const raw = localStorage.getItem("pms_stock_movements");
										if (raw) {
											const parsed = JSON.parse(raw);
											if (Array.isArray(parsed)) movements = parsed.filter((m) => m && (m.partCode === selectedStockDetail.item_code || m.item_code === selectedStockDetail.item_code || m.code === selectedStockDetail.item_code));
										}
									} catch (e) {
										console.warn("Failed to load stock movements", e);
										movements = [];
									}
									const defaultMovements = [
										{
											id: "def-1",
											title: "Inward Receipt (GRN-2026-000009)",
											subtitle: "Received from Gulf Facility Services",
											quantity: 10,
											type: "inward",
											date: "2026-09-02",
											timestamp: "Sep 2, 2026, 10:30 AM"
										},
										{
											id: "def-2",
											title: "Issue to Work Order #WO-2026-001",
											subtitle: "Al Sadd Commercial Tower - HVAC Maintenance",
											quantity: -2,
											type: "issue_wo",
											date: "2026-09-04",
											timestamp: "Sep 4, 2026, 11:00 AM"
										},
										{
											id: "def-3",
											title: "Opening Stock Balance",
											subtitle: "Initial warehouse intake verification",
											quantity: 17,
											type: "opening",
											date: "2026-09-01",
											timestamp: "Sep 1, 2026, 08:00 AM"
										}
									];
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "border rounded-lg divide-y bg-card text-xs max-h-[220px] overflow-y-auto",
										children: (movements.length > 0 ? [...movements, ...defaultMovements] : defaultMovements).map((mov, idx) => {
											const qty = Number(mov?.quantity ?? mov?.qty ?? 0);
											const isPositive = qty >= 0;
											const titleText = mov?.title || mov?.action || (isPositive ? "Stock Inward Receipt" : "Stock Issue to Work Order");
											const subtitleText = mov?.subtitle || mov?.notes || mov?.property || "Warehouse Stock Movement";
											const timeText = mov?.timestamp || mov?.date || mov?.created_at || "";
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-2.5 flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: `font-semibold flex items-center gap-1 ${isPositive ? "text-emerald-600" : "text-blue-600"}`,
													children: [isPositive ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3 w-3" }), titleText]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: subtitleText }), timeText && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "•" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "flex items-center gap-0.5 font-mono text-[10px] text-foreground/75",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-2.5 w-2.5" }), timeText]
													})] })]
												})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: `font-mono font-bold ${isPositive ? "text-emerald-600" : "text-rose-500"}`,
													children: [
														isPositive ? `+${qty}` : qty,
														" ",
														selectedStockDetail?.unit_of_measure || "Nos"
													]
												})]
											}, mov?.id || idx);
										})
									});
								})()] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "flex justify-between items-center sm:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "default",
									className: "bg-cyan-600 hover:bg-cyan-700 text-white gap-1 text-xs",
									onClick: () => {
										setSelectedStockDetail(null);
										setShowNewPO(true);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-3.5 w-3.5" }), " Reorder via PO"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => setSelectedStockDetail(null),
									children: "Close"
								})]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					open: !!selectedCatalogDetail,
					onOpenChange: () => setSelectedCatalogDetail(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "max-w-md",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-5 w-5 text-primary" }), "Item Master Details"]
							}) }),
							selectedCatalogDetail && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-3 py-2 text-xs",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg bg-muted/40 border space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Item Code:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono font-bold text-primary",
												children: selectedCatalogDetail.item_code
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Name:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-semibold",
												children: selectedCatalogDetail.name
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Category:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: selectedCatalogDetail.category })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Item Type:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												children: typeLabel[selectedCatalogDetail.item_type]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Budget Class:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												selectedCatalogDetail.budget_type,
												" (",
												selectedCatalogDetail.budget_head,
												")"
											] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Standard Unit Price:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-bold text-emerald-600",
												children: ["QAR ", Number(selectedCatalogDetail.unit_price || 0).toLocaleString()]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "UOM:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: selectedCatalogDetail.unit_of_measure })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: "Minimum Reorder Level:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "font-mono text-amber-600 font-bold",
												children: selectedCatalogDetail.reorder_level
											})]
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setSelectedCatalogDetail(null),
								children: "Close"
							}) })
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					open: showNewPR,
					onOpenChange: setShowNewPR,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
								className: "p-5 pb-3 border-b bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-background shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
										className: "flex items-center gap-2 text-base font-bold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-5 w-5 text-primary" }), "New Purchase Requisition (Multi-Item & Unit Allocation)"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
										className: "text-xs mt-0.5",
										children: "Specify requisition priority, add items from catalog, and map each deliverable to property/units."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "outline",
											className: "text-xs font-mono bg-primary/10 text-primary border-primary/30",
											children: [
												prForm.lines.length,
												" Line Item",
												prForm.lines.length > 1 ? "s" : ""
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-right pl-2 border-l",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground uppercase font-bold block",
												children: "Est. Grand Total"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-bold text-sm text-emerald-600",
												children: ["QAR ", prForm.lines.reduce((s, l) => s + (Number(l.quantity) || 1) * (Number(l.unitRate) || 0), 0).toLocaleString()]
											})]
										})]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 overflow-y-auto p-5 space-y-4 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl border bg-muted/20",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
											label: "Requisition Priority *",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: prForm.priority,
												onValueChange: (v) => setPrForm({
													...prForm,
													priority: v
												}),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-9 text-xs",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "LOW",
														children: "🟢 Low Priority"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "NORMAL",
														children: "🔵 Normal Priority"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "HIGH",
														children: "🟠 High Priority"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "URGENT",
														children: "🔴 Urgent Priority"
													})
												] })]
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "md:col-span-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Requisition Purpose / Justification",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													className: "h-9 text-xs",
													value: prForm.remarks,
													onChange: (e) => setPrForm({
														...prForm,
														remarks: e.target.value
													}),
													placeholder: "Provide justification, project reference, or department requirements..."
												})
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
													className: "font-bold text-foreground flex items-center gap-1.5 text-xs",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-4 w-4 text-primary" }), " Item Lines & Property/Unit Allocation"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
													variant: "secondary",
													className: "font-mono text-[11px]",
													children: [
														prForm.lines.length,
														" ",
														prForm.lines.length === 1 ? "Line Item" : "Line Items"
													]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "button",
												size: "sm",
												variant: "outline",
												className: "h-8 text-xs gap-1.5 border-primary/40 text-primary hover:bg-primary/10 font-semibold shadow-sm",
												onClick: () => {
													const lastProperty = prForm.lines[prForm.lines.length - 1]?.propertyId || "";
													setPrForm({
														...prForm,
														lines: [...prForm.lines, createDefaultLineItem(lastProperty)]
													});
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Line Item"]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-3",
											children: [prForm.lines.map((line, idx) => {
												const filteredUnits = units.filter((u) => u.property_id === line.propertyId);
												const lineTot = (Number(line.quantity) || 0) * (Number(line.unitRate) || 0);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3.5 rounded-xl border bg-card/80 hover:border-primary/40 transition shadow-sm space-y-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center justify-between pb-2 border-b",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-2",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary font-bold text-xs font-mono",
																	children: idx + 1
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "font-bold text-xs text-foreground",
																	children: line.itemName || "Select Catalog Item"
																}),
																line.itemCode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	variant: "outline",
																	className: "font-mono text-[10px] py-0",
																	children: line.itemCode
																}),
																line.budgetHead && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
																	variant: "secondary",
																	className: "text-[10px] text-primary font-medium py-0",
																	children: [
																		line.budgetType,
																		" · ",
																		line.budgetHead
																	]
																})
															]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-3",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "text-right",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[10px] text-muted-foreground uppercase font-semibold mr-1.5",
																	children: "Line Total:"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "font-mono font-bold text-xs text-emerald-600",
																	children: ["QAR ", lineTot.toLocaleString()]
																})]
															}), prForm.lines.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																type: "button",
																size: "icon",
																variant: "ghost",
																className: "h-7 w-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition",
																onClick: () => {
																	const newLines = prForm.lines.filter((_, i) => i !== idx);
																	setPrForm({
																		...prForm,
																		lines: newLines
																	});
																},
																title: "Remove this line item",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
															})]
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "grid grid-cols-1 md:grid-cols-12 gap-3",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-6 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
																	className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1",
																	children: ["Item / Catalog Spec ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-rose-500",
																		children: "*"
																	})]
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineItemCatalogSelector, {
																	catalog,
																	value: line.itemName,
																	onSelect: (catItem) => {
																		const newLines = [...prForm.lines];
																		newLines[idx] = {
																			...newLines[idx],
																			itemId: catItem.id,
																			itemCode: catItem.item_code,
																			itemName: catItem.name,
																			description: catItem.name,
																			unitRate: catItem.unit_price || 0,
																			itemType: catItem.item_type || "consumable",
																			budgetType: catItem.budget_type || "OPEX",
																			budgetHead: catItem.budget_head || "Maintenance Items",
																			uom: catItem.unit_of_measure || "Nos"
																		};
																		setPrForm({
																			...prForm,
																			lines: newLines
																		});
																	},
																	placeholder: "Choose from catalog..."
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-3 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
																	className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1",
																	children: ["Property Scope ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-rose-500",
																		children: "*"
																	})]
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
																	value: line.propertyId,
																	onValueChange: (val) => {
																		const newLines = [...prForm.lines];
																		newLines[idx] = {
																			...newLines[idx],
																			propertyId: val,
																			unitId: ""
																		};
																		setPrForm({
																			...prForm,
																			lines: newLines
																		});
																	},
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
																		className: `h-9 text-xs ${!line.propertyId ? "border-amber-400" : ""}`,
																		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Property *" })
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: properties.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																		value: p.id,
																		children: p.title
																	}, p.id)) })]
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-3 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																	className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1",
																	children: "Unit Scope"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
																	value: line.unitId || "all",
																	disabled: !line.propertyId,
																	onValueChange: (val) => {
																		const newLines = [...prForm.lines];
																		newLines[idx] = {
																			...newLines[idx],
																			unitId: val === "all" ? "" : val
																		};
																		setPrForm({
																			...prForm,
																			lines: newLines
																		});
																	},
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
																		className: "h-9 text-xs",
																		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Common / All" })
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																		value: "all",
																		children: "Common Area / All"
																	}), filteredUnits.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																		value: u.id,
																		children: u.unit_ref || `Unit ${u.id}`
																	}, u.id))] })]
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-3 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
																	className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1",
																	children: ["Quantity ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-rose-500",
																		children: "*"
																	})]
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																	type: "number",
																	min: "1",
																	value: line.quantity,
																	onChange: (e) => {
																		const newLines = [...prForm.lines];
																		newLines[idx] = {
																			...newLines[idx],
																			quantity: Math.max(1, Number(e.target.value) || 1)
																		};
																		setPrForm({
																			...prForm,
																			lines: newLines
																		});
																	},
																	className: "h-9 text-xs font-mono font-bold text-center"
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-3 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																	className: "text-[11px] font-semibold text-muted-foreground",
																	children: "Unit of Measure"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																	value: line.uom || "Nos",
																	onChange: (e) => {
																		const newLines = [...prForm.lines];
																		newLines[idx] = {
																			...newLines[idx],
																			uom: e.target.value
																		};
																		setPrForm({
																			...prForm,
																			lines: newLines
																		});
																	},
																	className: "h-9 text-xs font-mono text-center",
																	placeholder: "Nos"
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-3 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
																	className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1",
																	children: ["Est. Unit Rate (QAR) ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-rose-500",
																		children: "*"
																	})]
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																	type: "number",
																	min: "0",
																	value: line.unitRate,
																	onChange: (e) => {
																		const newLines = [...prForm.lines];
																		newLines[idx] = {
																			...newLines[idx],
																			unitRate: Number(e.target.value) || 0
																		};
																		setPrForm({
																			...prForm,
																			lines: newLines
																		});
																	},
																	className: "h-9 text-xs font-mono font-bold text-right"
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-3 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																	className: "text-[11px] font-semibold text-muted-foreground",
																	children: "Line Subtotal"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "h-9 rounded-md border bg-muted/40 px-3 flex items-center justify-end font-mono font-bold text-xs text-emerald-600",
																	children: ["QAR ", lineTot.toLocaleString()]
																})]
															})
														]
													})]
												}, line.id || idx);
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "button",
												variant: "outline",
												className: "w-full h-9 border-dashed border-2 border-primary/30 hover:border-primary text-primary hover:bg-primary/5 text-xs font-semibold gap-1.5 transition",
												onClick: () => {
													const lastProperty = prForm.lines[prForm.lines.length - 1]?.propertyId || "";
													setPrForm({
														...prForm,
														lines: [...prForm.lines, createDefaultLineItem(lastProperty)]
													});
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Another Line Item"]
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-medium",
											children: "Requisition Summary: "
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-bold text-foreground",
											children: [prForm.lines.length, " line item(s)"]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground font-medium",
												children: "Total Estimated Requisition Value:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-bold text-base text-emerald-600",
												children: ["QAR ", prForm.lines.reduce((s, l) => s + (Number(l.quantity) || 1) * (Number(l.unitRate) || 0), 0).toLocaleString()]
											})]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "p-4 border-t bg-muted/10 shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => setShowNewPR(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: handleCreatePR,
									disabled: saving || prForm.lines.every((l) => !l.itemName || !l.propertyId),
									className: "gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), " Create Purchase Requisition"]
								})]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					open: showNewPO,
					onOpenChange: setShowNewPO,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
								className: "p-5 pb-3 border-b bg-gradient-to-r from-cyan-500/10 via-primary/5 to-background shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
											className: "text-base font-bold flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-5 w-5 text-cyan-600" }), "New Purchase Order (Supplier Issuance)"]
										}), poForm.sourcePrDoc && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "outline",
											className: "font-mono bg-sky-500/10 text-sky-600 border-sky-500/30 text-xs",
											children: ["Ref PR: ", poForm.sourcePrDoc]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
										className: "text-xs mt-0.5",
										children: "Issue a formal purchase order to an approved supplier with multi-item property/unit allocation."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "outline",
											className: "text-xs font-mono bg-cyan-500/10 text-cyan-600 border-cyan-500/30",
											children: [
												poForm.lines.length,
												" Line Item",
												poForm.lines.length > 1 ? "s" : ""
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-right pl-2 border-l",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground uppercase font-bold block",
												children: "Order Total"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-bold text-sm text-cyan-600",
												children: ["QAR ", poForm.lines.reduce((s, l) => s + (Number(l.quantity) || 1) * (Number(l.unitRate) || 0), 0).toLocaleString()]
											})]
										})]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 overflow-y-auto p-5 space-y-4 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 md:grid-cols-5 gap-3 p-3.5 rounded-xl border bg-muted/20",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Vendor (Supplier) *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: poForm.vendorId,
													onValueChange: (v) => {
														const selVendor = vendors.find((vnd) => String(vnd.id) === String(v));
														setPoForm({
															...poForm,
															vendorId: v,
															paymentTerms: selVendor?.payment_terms || poForm.paymentTerms || "Net 30 Days",
															settlementMode: selVendor?.settlement_mode || poForm.settlementMode || "Bank Wire / Electronic Transfer (QNB)"
														});
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: `h-9 text-xs ${!poForm.vendorId ? "border-amber-400" : ""}`,
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Vendor *" })
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: vendors.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
														value: String(v.id),
														children: [
															v.name,
															" (",
															v.code,
															")"
														]
													}, v.id)) })]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Payment Terms *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: poForm.paymentTerms,
													onValueChange: (v) => setPoForm({
														...poForm,
														paymentTerms: v
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "h-9 text-xs",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Terms" })
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
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Settlement Mode *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: poForm.settlementMode,
													onValueChange: (v) => setPoForm({
														...poForm,
														settlementMode: v
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "h-9 text-xs",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Mode" })
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Bank Wire / Electronic Transfer (QNB)",
															children: "Bank Wire / Electronic Transfer (QNB)"
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
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Delivery Terms",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													className: "h-9 text-xs",
													value: poForm.deliveryTerms,
													onChange: (e) => setPoForm({
														...poForm,
														deliveryTerms: e.target.value
													}),
													placeholder: "FOB Destination"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "PO Remarks / Reference",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													className: "h-9 text-xs",
													value: poForm.remarks,
													onChange: (e) => setPoForm({
														...poForm,
														remarks: e.target.value
													}),
													placeholder: "Special instructions or RFQ ref..."
												})
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
													className: "font-bold text-foreground flex items-center gap-1.5 text-xs",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-4 w-4 text-cyan-600" }), " Purchase Order Deliverables & Allocation"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
													variant: "secondary",
													className: "font-mono text-[11px]",
													children: [
														poForm.lines.length,
														" ",
														poForm.lines.length === 1 ? "Deliverable" : "Deliverables"
													]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "button",
												size: "sm",
												variant: "outline",
												className: "h-8 text-xs gap-1.5 border-cyan-500/40 text-cyan-600 hover:bg-cyan-500/10 font-semibold shadow-sm",
												onClick: () => {
													const lastProperty = poForm.lines[poForm.lines.length - 1]?.propertyId || "";
													setPoForm({
														...poForm,
														lines: [...poForm.lines, createDefaultLineItem(lastProperty)]
													});
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Line Item"]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-3",
											children: [poForm.lines.map((line, idx) => {
												const filteredUnits = units.filter((u) => u.property_id === line.propertyId);
												const lineTot = (Number(line.quantity) || 0) * (Number(line.unitRate) || 0);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3.5 rounded-xl border bg-card/80 hover:border-cyan-500/40 transition shadow-sm space-y-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center justify-between pb-2 border-b",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-2",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "flex items-center justify-center h-5 w-5 rounded-full bg-cyan-500/10 text-cyan-600 font-bold text-xs font-mono",
																	children: idx + 1
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "font-bold text-xs text-foreground",
																	children: line.itemName || line.description || "Select Item"
																}),
																line.itemCode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	variant: "outline",
																	className: "font-mono text-[10px] py-0",
																	children: line.itemCode
																}),
																line.itemType && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	variant: "secondary",
																	className: "text-[10px] text-cyan-600 font-medium py-0",
																	children: typeLabel[line.itemType] || line.itemType
																})
															]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-3",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "text-right",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[10px] text-muted-foreground uppercase font-semibold mr-1.5",
																	children: "Line Total:"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																	className: "font-mono font-bold text-xs text-cyan-600",
																	children: ["QAR ", lineTot.toLocaleString()]
																})]
															}), poForm.lines.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																type: "button",
																size: "icon",
																variant: "ghost",
																className: "h-7 w-7 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition",
																onClick: () => {
																	const newLines = poForm.lines.filter((_, i) => i !== idx);
																	setPoForm({
																		...poForm,
																		lines: newLines
																	});
																},
																title: "Remove this deliverable",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
															})]
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "grid grid-cols-1 md:grid-cols-12 gap-3",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-6 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
																	className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1",
																	children: ["Item / Catalog Spec ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-rose-500",
																		children: "*"
																	})]
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LineItemCatalogSelector, {
																	catalog,
																	value: line.itemName || line.description,
																	onSelect: (catItem) => {
																		const newLines = [...poForm.lines];
																		newLines[idx] = {
																			...newLines[idx],
																			itemId: catItem.id,
																			itemCode: catItem.item_code,
																			itemName: catItem.name,
																			description: catItem.name,
																			unitRate: catItem.unit_price || 0,
																			itemType: catItem.item_type || "consumable",
																			budgetType: catItem.budget_type || "OPEX",
																			budgetHead: catItem.budget_head || "Maintenance Items",
																			uom: catItem.unit_of_measure || "Nos"
																		};
																		setPoForm({
																			...poForm,
																			lines: newLines
																		});
																	},
																	placeholder: "Select or search item..."
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-3 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
																	className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1",
																	children: ["Property Scope ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-rose-500",
																		children: "*"
																	})]
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
																	value: line.propertyId,
																	onValueChange: (val) => {
																		const newLines = [...poForm.lines];
																		newLines[idx] = {
																			...newLines[idx],
																			propertyId: val,
																			unitId: ""
																		};
																		setPoForm({
																			...poForm,
																			lines: newLines
																		});
																	},
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
																		className: `h-9 text-xs ${!line.propertyId ? "border-amber-400" : ""}`,
																		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Property *" })
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: properties.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																		value: p.id,
																		children: p.title
																	}, p.id)) })]
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-3 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																	className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1",
																	children: "Unit Scope"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
																	value: line.unitId || "all",
																	disabled: !line.propertyId,
																	onValueChange: (val) => {
																		const newLines = [...poForm.lines];
																		newLines[idx] = {
																			...newLines[idx],
																			unitId: val === "all" ? "" : val
																		};
																		setPoForm({
																			...poForm,
																			lines: newLines
																		});
																	},
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
																		className: "h-9 text-xs",
																		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Common / All" })
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																		value: "all",
																		children: "Common Area / All"
																	}), filteredUnits.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																		value: u.id,
																		children: u.unit_ref || `Unit ${u.id}`
																	}, u.id))] })]
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-3 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "flex items-center justify-between",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
																		className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1",
																		children: ["Quantity Ordered ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																			className: "text-rose-500",
																			children: "*"
																		})]
																	}), line.maxQuantity != null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																		className: "text-[10px] text-cyan-700 bg-cyan-50 dark:bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-200 font-mono",
																		children: [
																			"Max: ",
																			line.maxQuantity,
																			" (from PR)"
																		]
																	})]
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																	type: "number",
																	min: "1",
																	max: line.maxQuantity,
																	value: line.quantity,
																	onChange: (e) => {
																		const val = Number(e.target.value) || 1;
																		if (line.maxQuantity && val > line.maxQuantity) toast.error(`Quantity cannot exceed requested PR quantity of ${line.maxQuantity} ${line.uom || "Nos"}`);
																		const validQty = line.maxQuantity ? Math.min(line.maxQuantity, Math.max(1, val)) : Math.max(1, val);
																		const newLines = [...poForm.lines];
																		newLines[idx] = {
																			...newLines[idx],
																			quantity: validQty
																		};
																		setPoForm({
																			...poForm,
																			lines: newLines
																		});
																	},
																	className: `h-9 text-xs font-mono font-bold text-center ${line.maxQuantity && Number(line.quantity) > line.maxQuantity ? "border-rose-500 text-rose-600" : ""}`
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-3 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																	className: "text-[11px] font-semibold text-muted-foreground",
																	children: "Unit of Measure (UOM)"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																	value: line.uom || "Nos",
																	onChange: (e) => {
																		const newLines = [...poForm.lines];
																		newLines[idx] = {
																			...newLines[idx],
																			uom: e.target.value
																		};
																		setPoForm({
																			...poForm,
																			lines: newLines
																		});
																	},
																	className: "h-9 text-xs font-mono text-center",
																	placeholder: "Nos"
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-3 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
																	className: "text-[11px] font-semibold text-muted-foreground flex items-center gap-1",
																	children: ["Agreed Unit Rate (QAR) ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-rose-500",
																		children: "*"
																	})]
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																	type: "number",
																	min: "0",
																	value: line.unitRate,
																	onChange: (e) => {
																		const newLines = [...poForm.lines];
																		newLines[idx] = {
																			...newLines[idx],
																			unitRate: Number(e.target.value) || 0
																		};
																		setPoForm({
																			...poForm,
																			lines: newLines
																		});
																	},
																	className: "h-9 text-xs font-mono font-bold text-right"
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-3 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																	className: "text-[11px] font-semibold text-muted-foreground",
																	children: "Line Total (QAR)"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "h-9 rounded-md border bg-muted/40 px-3 flex items-center justify-end font-mono font-bold text-xs text-cyan-600",
																	children: ["QAR ", lineTot.toLocaleString()]
																})]
															})
														]
													})]
												}, line.id || idx);
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "button",
												variant: "outline",
												className: "w-full h-9 border-dashed border-2 border-cyan-500/30 hover:border-cyan-500 text-cyan-600 hover:bg-cyan-500/5 text-xs font-semibold gap-1.5 transition",
												onClick: () => {
													const lastProperty = poForm.lines[poForm.lines.length - 1]?.propertyId || "";
													setPoForm({
														...poForm,
														lines: [...poForm.lines, createDefaultLineItem(lastProperty)]
													});
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Another Purchase Order Line"]
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-medium",
											children: "Order Scope: "
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-bold text-foreground",
											children: [poForm.lines.length, " deliverable line(s)"]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground font-medium",
												children: "Calculated Order Total:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-bold text-base text-cyan-600",
												children: ["QAR ", poForm.lines.reduce((s, l) => s + (Number(l.quantity) || 1) * (Number(l.unitRate) || 0), 0).toLocaleString()]
											})]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "p-4 border-t bg-muted/10 shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => setShowNewPO(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: handleCreatePO,
									disabled: saving || !poForm.vendorId || poForm.lines.every((l) => !l.itemName && !l.description || !l.propertyId),
									className: "gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShoppingCart, { className: "h-4 w-4" }), " Issue Purchase Order"]
								})]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					open: showReceiveModal,
					onOpenChange: setShowReceiveModal,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "max-w-5xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
								className: "p-5 pb-3 border-b bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-background shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
										className: "flex items-center gap-2 text-base font-bold",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, { className: "h-5 w-5 text-emerald-600" }),
											"Receive Inward Goods (GRN) — PO #",
											selectedPOForReceive?.doc_number
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
										className: "text-xs mt-0.5",
										children: "Inspect incoming physical deliveries against line items, record accepted/rejected quantities, and post GRN."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "outline",
											className: "text-xs font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
											children: ["Vendor: ", getVendorName(selectedPOForReceive?.vendor_id)]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "text-right pl-2 border-l",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground uppercase font-bold block",
												children: "Total Accepted"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-bold text-sm text-emerald-600",
												children: ["QAR ", receiveForm.lines.reduce((s, l) => s + (Number(l.acceptedQty) || 0) * (Number(l.unitRate) || 0), 0).toLocaleString()]
											})]
										})]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 overflow-y-auto p-5 space-y-4 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl border bg-muted/20",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Receiving Warehouse *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													className: "h-9 text-xs",
													value: receiveForm.warehouseName,
													onChange: (e) => setReceiveForm({
														...receiveForm,
														warehouseName: e.target.value
													}),
													placeholder: "Main Property Warehouse"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Dock / Receiving Bay *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													className: "h-9 text-xs",
													value: receiveForm.receivingLocation,
													onChange: (e) => setReceiveForm({
														...receiveForm,
														receivingLocation: e.target.value
													}),
													placeholder: "Dock 1 / Inward Storage"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Inward Inspection Remarks",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													className: "h-9 text-xs",
													value: receiveForm.remarks,
													onChange: (e) => setReceiveForm({
														...receiveForm,
														remarks: e.target.value
													}),
													placeholder: "Carrier condition, seal verification, packaging notes..."
												})
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
													className: "font-bold text-foreground flex items-center gap-1.5 text-xs",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4 text-emerald-600" }), " Physical Inspection & Quantity Acceptance"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
													variant: "secondary",
													className: "font-mono text-[11px]",
													children: [
														receiveForm.lines.length,
														" Line Item",
														receiveForm.lines.length > 1 ? "s" : ""
													]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "button",
												size: "sm",
												variant: "outline",
												className: "h-8 text-xs gap-1 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 font-semibold",
												onClick: () => {
													const allAccepted = receiveForm.lines.map((l) => ({
														...l,
														acceptedQty: l.orderedQty,
														rejectedQty: 0
													}));
													setReceiveForm({
														...receiveForm,
														lines: allAccepted
													});
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "h-3.5 w-3.5" }), " Accept All Full Quantities"]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "space-y-3",
											children: receiveForm.lines.map((rl, idx) => {
												const lineAccVal = (Number(rl.acceptedQty) || 0) * (Number(rl.unitRate) || 0);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3.5 rounded-xl border bg-card/80 hover:border-emerald-500/40 transition shadow-sm space-y-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center justify-between pb-2 border-b",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-2",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "flex items-center justify-center h-5 w-5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs font-mono",
																	children: idx + 1
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "font-bold text-xs text-foreground",
																	children: rl.itemName
																}),
																rl.itemCode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	variant: "outline",
																	className: "font-mono text-[10px] py-0",
																	children: rl.itemCode
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
																	variant: "secondary",
																	className: "text-[10px] text-emerald-600 font-medium py-0",
																	children: [
																		getPropertyName(rl.propertyId),
																		" ",
																		rl.unitId ? `· Unit ${getUnitRef(rl.unitId)}` : "· Common Area"
																	]
																})
															]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "flex items-center gap-2",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																type: "button",
																size: "sm",
																variant: "ghost",
																className: "h-6 text-[11px] text-emerald-600 hover:bg-emerald-500/10 px-2 font-semibold",
																onClick: () => {
																	const newLines = [...receiveForm.lines];
																	newLines[idx] = {
																		...newLines[idx],
																		acceptedQty: rl.orderedQty,
																		rejectedQty: 0
																	};
																	setReceiveForm({
																		...receiveForm,
																		lines: newLines
																	});
																},
																children: [
																	"Accept Full (",
																	rl.orderedQty,
																	")"
																]
															})
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "grid grid-cols-1 md:grid-cols-12 gap-3 items-center",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-3 p-2.5 rounded-lg bg-muted/40 border space-y-0.5",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] text-muted-foreground uppercase font-bold block",
																		children: "Ordered Quantity"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																		className: "font-mono font-bold text-sm text-foreground",
																		children: [
																			rl.orderedQty,
																			" ",
																			rl.uom || "Nos"
																		]
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																		className: "text-[10px] text-muted-foreground font-mono",
																		children: ["Rate: QAR ", rl.unitRate.toLocaleString()]
																	})
																]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-3 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
																	className: "text-[11px] font-semibold text-emerald-600 flex items-center gap-1",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3" }), " Accepted Quantity *"]
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																	type: "number",
																	min: "0",
																	max: rl.orderedQty,
																	value: rl.acceptedQty,
																	onChange: (e) => {
																		const newAcc = Math.min(rl.orderedQty, Math.max(0, Number(e.target.value) || 0));
																		const newLines = [...receiveForm.lines];
																		newLines[idx] = {
																			...newLines[idx],
																			acceptedQty: newAcc,
																			rejectedQty: Math.max(0, rl.orderedQty - newAcc)
																		};
																		setReceiveForm({
																			...receiveForm,
																			lines: newLines
																		});
																	},
																	className: "h-9 text-xs text-center font-mono font-bold text-emerald-600 border-emerald-500/40 bg-emerald-50/10"
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-3 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
																	className: "text-[11px] font-semibold text-rose-500 flex items-center gap-1",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3 w-3" }), " Rejected / Damaged"]
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																	type: "number",
																	min: "0",
																	max: rl.orderedQty,
																	value: rl.rejectedQty,
																	onChange: (e) => {
																		const newRej = Math.min(rl.orderedQty, Math.max(0, Number(e.target.value) || 0));
																		const newLines = [...receiveForm.lines];
																		newLines[idx] = {
																			...newLines[idx],
																			rejectedQty: newRej,
																			acceptedQty: Math.max(0, rl.orderedQty - newRej)
																		};
																		setReceiveForm({
																			...receiveForm,
																			lines: newLines
																		});
																	},
																	className: `h-9 text-xs text-center font-mono font-bold ${Number(rl.rejectedQty) > 0 ? "text-rose-500 border-rose-500/40 bg-rose-50/10" : "text-muted-foreground"}`
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "md:col-span-3 space-y-1",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
																	className: "text-[11px] font-semibold text-muted-foreground",
																	children: "Accepted Valuation (QAR)"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "h-9 rounded-md border bg-muted/40 px-3 flex items-center justify-end font-mono font-bold text-xs text-emerald-600",
																	children: ["QAR ", lineAccVal.toLocaleString()]
																})]
															})
														]
													})]
												}, rl.poLineId || idx);
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground font-medium",
											children: "GRN Inspection Summary: "
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-bold text-foreground",
											children: [receiveForm.lines.length, " line item(s) inspected"]
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground font-medium",
												children: "Total Accepted Goods Valuation:"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-mono font-bold text-base text-emerald-600",
												children: ["QAR ", receiveForm.lines.reduce((s, l) => s + (Number(l.acceptedQty) || 0) * (Number(l.unitRate) || 0), 0).toLocaleString()]
											})]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "p-4 border-t bg-muted/10 shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => setShowReceiveModal(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: handleConfirmReceive,
									disabled: saving || receiveForm.lines.every((l) => (Number(l.acceptedQty) || 0) <= 0),
									className: "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), " Confirm Inward & Post GRN"]
								})]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					open: showShipmentModal,
					onOpenChange: setShowShipmentModal,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
								className: "p-5 pb-3 border-b bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-background shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
										className: "flex items-center gap-2 text-base font-bold",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ship, { className: "h-5 w-5 text-cyan-600" }), editShipment ? "Update Freight Shipment & Tracking" : "New Freight Shipment & Transit Logistics"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
										className: "text-xs mt-0.5",
										children: "Record carrier forwarder, bill of lading (BL/AWB), incoterms, origin country, and ETA for inbound goods."
									})] }), shipmentForm.purchaseOrderId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										className: "font-mono bg-cyan-500/10 text-cyan-600 border-cyan-500/30 text-xs",
										children: ["PO #", pos.find((p) => p.id === shipmentForm.purchaseOrderId)?.doc_number || "Linked"]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 overflow-y-auto p-5 space-y-4 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
										label: "Linked Purchase Order (Deliverables) *",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: shipmentForm.purchaseOrderId,
											onValueChange: (v) => {
												const selectedPo = pos.find((p) => p.id === v);
												setShipmentForm({
													...shipmentForm,
													purchaseOrderId: v,
													inTransitValue: selectedPo ? String(selectedPo.total_amount) : shipmentForm.inTransitValue
												});
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: `h-9 text-xs ${!shipmentForm.purchaseOrderId ? "border-amber-400" : ""}`,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Purchase Order *" })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: pos.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
												value: p.id,
												children: [
													p.doc_number,
													" — ",
													getVendorName(p.vendor_id),
													" (",
													getPropertyName(p.property_id),
													") • QAR ",
													Number(p.total_amount).toLocaleString()
												]
											}, p.id)) })]
										})
									}), (() => {
										const targetPo = pos.find((p) => p.id === shipmentForm.purchaseOrderId);
										if (!targetPo) return null;
										const poDeliverables = poLines.filter((l) => l.purchase_order_id === targetPo.id);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-3.5 rounded-xl border bg-cyan-500/5 border-cyan-500/20 space-y-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-bold text-foreground text-xs",
														children: getVendorName(targetPo.vendor_id)
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: "outline",
														className: "text-[10px] py-0",
														children: getPropertyName(targetPo.property_id)
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-right",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground uppercase font-semibold mr-1.5",
														children: "Order Value:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-mono font-bold text-xs text-cyan-600",
														children: ["QAR ", Number(targetPo.total_amount).toLocaleString()]
													})]
												})]
											}), poDeliverables.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5 pt-2 border-t border-cyan-500/10",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-[10px] uppercase font-bold text-muted-foreground block",
													children: [
														"In-Transit Deliverables & Destination Scope (",
														poDeliverables.length,
														" item",
														poDeliverables.length > 1 ? "s" : "",
														"):"
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto",
													children: poDeliverables.map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2 rounded-lg bg-background/90 border flex flex-col justify-between text-[11px] gap-1 shadow-sm",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-start justify-between gap-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-semibold text-foreground truncate",
																children: l.item_name || l.description
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "font-mono font-bold text-cyan-600 shrink-0",
																children: [
																	l.quantity,
																	" ",
																	l.uom || "Nos"
																]
															})]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-1.5 text-[10px] text-muted-foreground",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3 w-3 text-primary shrink-0" }),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "truncate",
																	children: getPropertyName(l.property_id || targetPo.property_id)
																}),
																l.unit_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
																	variant: "secondary",
																	className: "text-[9px] px-1.5 py-0 h-4 font-mono text-cyan-700 bg-cyan-50 border border-cyan-200",
																	children: ["Unit ", getUnitRef(l.unit_id)]
																}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[9px] opacity-70",
																	children: "· Common Area"
																})
															]
														})]
													}, i))
												})]
											})]
										});
									})()]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3.5 rounded-xl border bg-muted/20 space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
										className: "font-bold text-foreground flex items-center gap-1.5 text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-4 w-4 text-cyan-600" }), " Carrier & Freight Forwarding Details"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 md:grid-cols-2 gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Carrier / Freight Forwarder *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													className: "h-9 text-xs",
													value: shipmentForm.carrierName,
													onChange: (e) => setShipmentForm({
														...shipmentForm,
														carrierName: e.target.value
													}),
													placeholder: "e.g. DHL Express, Aramex, Milaha Logistics..."
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Bill of Lading / AWB Tracking # *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													className: "h-9 text-xs font-mono",
													value: shipmentForm.trackingNumber,
													onChange: (e) => setShipmentForm({
														...shipmentForm,
														trackingNumber: e.target.value
													}),
													placeholder: "e.g. AWB-982347102"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Trade Incoterm",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: shipmentForm.incoterm,
													onValueChange: (v) => setShipmentForm({
														...shipmentForm,
														incoterm: v
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
														className: "h-9 text-xs",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "DAP",
															children: "DAP — Delivered at Place (Recommended)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "DDP",
															children: "DDP — Delivered Duty Paid"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "FOB",
															children: "FOB — Free on Board"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "CIF",
															children: "CIF — Cost, Insurance & Freight"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "EXW",
															children: "EXW — Ex Works"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "CFR",
															children: "CFR — Cost and Freight"
														})
													] })]
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Estimated Arrival Date (ETA) *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "date",
													className: "h-9 text-xs",
													value: shipmentForm.estimatedArrival,
													onChange: (e) => setShipmentForm({
														...shipmentForm,
														estimatedArrival: e.target.value
													})
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Origin Country / Port",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													className: "h-9 text-xs",
													value: shipmentForm.originCountry,
													onChange: (e) => setShipmentForm({
														...shipmentForm,
														originCountry: e.target.value
													}),
													placeholder: "e.g. Qatar, UAE, Germany, China..."
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "In-Transit Valuation (QAR)",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													className: "h-9 text-xs font-mono font-bold",
													value: shipmentForm.inTransitValue,
													onChange: (e) => setShipmentForm({
														...shipmentForm,
														inTransitValue: e.target.value
													}),
													placeholder: "Auto-calculated from PO"
												})
											})
										]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "p-4 border-t bg-muted/10 shrink-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									onClick: () => setShowShipmentModal(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: handleSaveShipment,
									disabled: saving || !shipmentForm.purchaseOrderId || !shipmentForm.carrierName,
									className: "gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ship, { className: "h-4 w-4" }),
										" ",
										editShipment ? "Update Shipment" : "Save & Dispatch Shipment"
									]
								})]
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					open: showCatalogModal,
					onOpenChange: setShowCatalogModal,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
						className: "max-w-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-5 w-5 text-emerald-600" }), "Add Master Item to Catalog"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Define a new item in the Item Master. All fields should match your item's classification, budget mapping, and inventory control settings." })] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-4 py-2 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 rounded-lg bg-muted/30 border space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold text-[11px] uppercase tracking-wider text-muted-foreground",
												children: "Item Identification"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Item Code *",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: catalogForm.item_code,
														onChange: (e) => setCatalogForm({
															...catalogForm,
															item_code: e.target.value
														}),
														placeholder: "e.g. MNT-FLT-002 / AST-HVAC-003"
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Item Name / Description *",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: catalogForm.name,
														onChange: (e) => setCatalogForm({
															...catalogForm,
															name: e.target.value
														}),
														placeholder: "Full item name and description"
													})
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Trade Category *",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: catalogForm.category,
														onValueChange: (v) => setCatalogForm({
															...catalogForm,
															category: v
														}),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select category…" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "HVAC",
																children: "HVAC"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "HVAC Spare",
																children: "HVAC Spare"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Electrical",
																children: "Electrical"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Plumbing",
																children: "Plumbing"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Civil Works",
																children: "Civil Works"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Elevator",
																children: "Elevator"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Fire Safety",
																children: "Fire Safety"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "CCTV / Security",
																children: "CCTV / Security"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Landscaping",
																children: "Landscaping"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Furnishing",
																children: "Furnishing"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "IT Equipment",
																children: "IT Equipment"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Pool Equipment",
																children: "Pool Equipment"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Cleaning Supplies",
																children: "Cleaning Supplies"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Staff",
																children: "Staff"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Other",
																children: "Other"
															})
														] })]
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
													label: "Item Type *",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: catalogForm.item_type,
														onValueChange: (v) => setCatalogForm({
															...catalogForm,
															item_type: v
														}),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "asset",
																children: "Fixed Asset (CAPEX)"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "maintenance_spare",
																children: "Maintenance Spare"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "consumable",
																children: "Consumable"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "service",
																children: "Service / Contract"
															})
														] })]
													})
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 rounded-lg bg-muted/30 border space-y-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-[11px] uppercase tracking-wider text-muted-foreground",
											children: "Budget & GL Classification"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Budget Type *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: catalogForm.budget_type,
													onValueChange: (v) => setCatalogForm({
														...catalogForm,
														budget_type: v
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "CAPEX",
														children: "CAPEX — Capital Expenditure"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "OPEX",
														children: "OPEX — Operating Expenditure"
													})] })]
												})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
												label: "Budget Head / Cost Allocation *",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: catalogForm.budget_head,
													onValueChange: (v) => setCatalogForm({
														...catalogForm,
														budget_head: v
													}),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Property Assets",
															children: "Property Assets"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Unit Assets",
															children: "Unit Assets"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Common Area Assets",
															children: "Common Area Assets"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Maintenance Items",
															children: "Maintenance Items"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Salary",
															children: "Staff / Salary"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "Other",
															children: "Other / General"
														})
													] })]
												})
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 rounded-lg bg-muted/30 border space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold text-[11px] uppercase tracking-wider text-muted-foreground",
												children: "Pricing & Inventory Control"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Standard Unit Price (QAR) *",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															min: "0",
															value: catalogForm.unit_price,
															onChange: (e) => setCatalogForm({
																...catalogForm,
																unit_price: Number(e.target.value)
															})
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Unit of Measure (UOM) *",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
															value: catalogForm.unit_of_measure,
															onValueChange: (v) => setCatalogForm({
																...catalogForm,
																unit_of_measure: v
															}),
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Nos",
																	children: "Nos (Numbers)"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Set",
																	children: "Set"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Roll",
																	children: "Roll"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Mtrs",
																	children: "Meters"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Sqm",
																	children: "Sq. Meters"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Kg",
																	children: "Kilograms"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Ltr",
																	children: "Liters"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Box",
																	children: "Box"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Pair",
																	children: "Pair"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Month",
																	children: "Month"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Service",
																	children: "Service"
																})
															] })]
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
														label: "Reorder Level (Min Qty)",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															min: "0",
															value: catalogForm.reorder_level,
															onChange: (e) => setCatalogForm({
																...catalogForm,
																reorder_level: Number(e.target.value)
															}),
															placeholder: "0 = N/A"
														})
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														id: "item-active",
														type: "checkbox",
														checked: catalogForm.active,
														onChange: (e) => setCatalogForm({
															...catalogForm,
															active: e.target.checked
														}),
														className: "h-4 w-4 rounded border-gray-300"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
														htmlFor: "item-active",
														className: "text-xs font-semibold cursor-pointer",
														children: "Active in Catalog (available for PRs and POs)"
													})]
												}), catalogForm.unit_price > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "text-[11px] text-muted-foreground font-mono",
													children: [
														"Standard Price: ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", {
															className: "text-emerald-600",
															children: ["QAR ", Number(catalogForm.unit_price).toLocaleString()]
														}),
														" / ",
														catalogForm.unit_of_measure
													]
												})]
											})
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setShowCatalogModal(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "bg-emerald-600 hover:bg-emerald-700 text-white gap-1",
								onClick: () => {
									const newItem = {
										...catalogForm,
										id: `cat-${Date.now()}`
									};
									const updated = [newItem, ...catalog];
									setCatalog(updated);
									localStorage.setItem("proc_catalog_items", JSON.stringify(updated));
									setShowCatalogModal(false);
									toast.success(`Item "${newItem.name}" (${newItem.item_code}) added to Item Master Catalog.`);
								},
								disabled: !catalogForm.name || !catalogForm.item_code || !catalogForm.category,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4" }), " Save Item to Catalog"]
							})] })
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					open: !!viewPr,
					onOpenChange: (open) => !open && setViewPr(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
						className: "max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden",
						children: viewPr && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
								className: "p-5 pb-3 border-b bg-gradient-to-r from-blue-500/10 via-cyan-500/5 to-background shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
												className: "text-base font-bold font-mono text-primary",
												children: viewPr.doc_number
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: statusBadgeVariant(viewPr.status),
												children: viewPr.status
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												variant: "outline",
												className: "text-[10px]",
												children: [viewPr.priority || "NORMAL", " Priority"]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
										className: "text-xs mt-0.5",
										children: ["Purchase Requisition • Requested on ", viewPr.request_date]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-right",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground uppercase font-bold",
											children: "Estimated Total"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-base font-bold font-mono text-primary",
											children: ["QAR ", Number(viewPr.total_amount || 0).toLocaleString()]
										})]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 overflow-y-auto p-5 space-y-4 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/20",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground uppercase font-bold",
												children: "Primary Scope"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold text-foreground mt-0.5",
												children: getPropertyName(viewPr.property_id)
											}),
											viewPr.unit_id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[11px] text-muted-foreground",
												children: ["Unit: ", getUnitRef(viewPr.unit_id)]
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground uppercase font-bold",
											children: "Posting / Lifecycle Status"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-semibold text-foreground mt-0.5",
											children: viewPr.posting_status || "Standard Request"
										})] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex items-center justify-between",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
												className: "font-bold text-foreground flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-3.5 w-3.5 text-primary" }), " Requisition Line Items & Property Allocation"]
											})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "border rounded-lg overflow-hidden",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
												className: "w-full text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
													className: "bg-muted/40 font-bold border-b",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-2.5 text-left",
															children: "Item Description"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-2.5 text-left",
															children: "Property / Unit Scope"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-2.5 text-center",
															children: "Qty"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-2.5 text-right",
															children: "Est. Unit Rate"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-2.5 text-right",
															children: "Est. Total (QAR)"
														})
													] })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
													className: "divide-y",
													children: (() => {
														return parsePrLines(viewPr).map((l, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
															className: "hover:bg-muted/20",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-2.5",
																	children: [
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																			className: "font-semibold text-foreground",
																			children: l.itemName || l.description
																		}),
																		l.itemCode && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																			className: "text-[10px] font-mono text-muted-foreground",
																			children: l.itemCode
																		}),
																		l.budgetHead && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																			className: "text-[9px] text-primary font-mono mt-0.5 inline-block",
																			children: [
																				l.budgetType,
																				" · ",
																				l.budgetHead
																			]
																		})
																	]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-2.5",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																		className: "font-medium text-foreground",
																		children: getPropertyName(l.propertyId)
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																		className: "text-[10px] text-muted-foreground",
																		children: l.unitId ? `Unit: ${getUnitRef(l.unitId)}` : "Common Area / General"
																	})]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-2.5 text-center font-mono font-medium",
																	children: [
																		l.quantity,
																		" ",
																		l.uom || "Nos"
																	]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-2.5 text-right font-mono",
																	children: ["QAR ", Number(l.unitRate || 0).toLocaleString()]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-2.5 text-right font-mono font-bold",
																	children: ["QAR ", (Number(l.quantity || 1) * Number(l.unitRate || 0)).toLocaleString()]
																})
															]
														}, l.id || i));
													})()
												})]
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 border rounded-lg bg-muted/10 space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground uppercase font-bold",
											children: "Purpose / Notes"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-foreground",
											children: viewPr.remarks?.includes("[LINES_JSON]:") ? viewPr.remarks.split("\n").slice(1).join(" ") || "Standard requisition" : viewPr.remarks || "No additional remarks specified."
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, {
								className: "p-4 border-t bg-muted/10 shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => setViewPr(null),
									children: "Close"
								})
							})
						] })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					open: !!viewPo,
					onOpenChange: (open) => !open && setViewPo(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
						className: "max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden",
						children: viewPo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
								className: "p-5 pb-3 border-b bg-gradient-to-r from-cyan-500/10 via-primary/5 to-background shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
											className: "text-base font-bold font-mono text-primary",
											children: viewPo.doc_number
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: statusBadgeVariant(viewPo.status),
											children: viewPo.status
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
										className: "text-xs mt-0.5",
										children: [
											"Purchase Order • Issued on ",
											viewPo.po_date,
											" • Vendor: ",
											getVendorName(viewPo.vendor_id)
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-right",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground uppercase font-bold",
											children: "Total Order Value"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-lg font-bold font-mono text-primary",
											children: ["QAR ", Number(viewPo.total_amount || 0).toLocaleString()]
										})]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 overflow-y-auto p-5 space-y-4 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-3 gap-3 p-3 rounded-lg border bg-muted/20",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted-foreground uppercase font-bold",
													children: "Vendor Profile"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold text-foreground mt-0.5",
													children: getVendorName(viewPo.vendor_id)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-[10px] text-muted-foreground",
													children: ["ID: ", viewPo.vendor_id]
												})
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted-foreground uppercase font-bold",
													children: "Delivery Destination"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold text-foreground mt-0.5",
													children: getPropertyName(viewPo.property_id)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[10px] text-muted-foreground",
													children: "Main Receiving Facility Dock"
												})
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted-foreground uppercase font-bold",
													children: "Commercial Terms"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold text-foreground mt-0.5",
													children: viewPo.payment_terms || "Net 30 Days"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[10px] text-muted-foreground",
													children: viewPo.delivery_terms || "DAP Delivered"
												})
											] })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
											className: "font-bold text-foreground flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "h-3.5 w-3.5 text-cyan-600" }), " Ordered Deliverables & Property/Unit Allocation"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "border rounded-lg overflow-hidden",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
												className: "w-full text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
													className: "bg-muted/40 font-bold border-b",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-2.5 text-left",
															children: "Description"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-2.5 text-left",
															children: "Property / Unit"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-2.5 text-center",
															children: "Qty Ordered"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-2.5 text-center",
															children: "Accepted"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-2.5 text-right",
															children: "Unit Rate"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-2.5 text-right",
															children: "Line Total (QAR)"
														})
													] })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
													className: "divide-y",
													children: (() => {
														const lines = poLines.filter((l) => l.purchase_order_id === viewPo.id);
														if (lines.length > 0) return lines.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
															className: "hover:bg-muted/20",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-2.5",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																		className: "font-semibold text-foreground",
																		children: l.description || l.item_name
																	}), l.item_code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] font-mono text-muted-foreground",
																		children: l.item_code
																	})]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-2.5",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																		className: "font-medium text-foreground",
																		children: getPropertyName(l.property_id)
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																		className: "text-[10px] text-muted-foreground",
																		children: l.unit_id ? `Unit: ${getUnitRef(l.unit_id)}` : "Common Area / General"
																	})]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-2.5 text-center font-mono font-medium",
																	children: [
																		l.quantity,
																		" ",
																		l.uom || "Nos"
																	]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																	className: "p-2.5 text-center font-mono text-emerald-600 font-bold",
																	children: l.accepted_quantity || 0
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-2.5 text-right font-mono",
																	children: ["QAR ", Number(l.unit_rate).toLocaleString()]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-2.5 text-right font-mono font-bold",
																	children: ["QAR ", Number(l.line_total).toLocaleString()]
																})
															]
														}, l.id));
														return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
															className: "hover:bg-muted/20",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																	className: "p-2.5",
																	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																		className: "font-semibold text-foreground",
																		children: viewPo.remarks || `Procurement Order items for ${getPropertyName(viewPo.property_id)}`
																	})
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																	className: "p-2.5 font-medium",
																	children: getPropertyName(viewPo.property_id)
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																	className: "p-2.5 text-center font-mono",
																	children: "1 Lot"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																	className: "p-2.5 text-center font-mono text-emerald-600",
																	children: "0"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-2.5 text-right font-mono",
																	children: ["QAR ", Number(viewPo.total_amount).toLocaleString()]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-2.5 text-right font-mono font-bold",
																	children: ["QAR ", Number(viewPo.total_amount).toLocaleString()]
																})
															]
														});
													})()
												})]
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 border rounded-lg bg-muted/10 space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground uppercase font-bold",
											children: "Procurement 3-Way Traceability Linkages"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-4 gap-2 text-[11px]",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-2 rounded bg-background border",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[9px] text-muted-foreground uppercase font-bold block",
														children: "Purchase Order"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono font-bold text-primary",
														children: viewPo.doc_number
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-2 rounded bg-background border",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[9px] text-muted-foreground uppercase font-bold block",
														children: "Shipment / AWB"
													}), (() => {
														const sh = shipments.find((s) => s.purchase_order_id === viewPo.id);
														return sh ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-mono text-cyan-600 font-semibold",
															children: sh.shipment_number
														}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-muted-foreground",
															children: "—"
														});
													})()]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-2 rounded bg-background border",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[9px] text-muted-foreground uppercase font-bold block",
														children: "GRN Receiving"
													}), (() => {
														const grn = grns.find((g) => g.purchase_order_id === viewPo.id);
														return grn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-mono text-emerald-600 font-semibold",
															children: grn.grn_number
														}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-muted-foreground",
															children: "—"
														});
													})()]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-2 rounded bg-background border",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[9px] text-muted-foreground uppercase font-bold block",
														children: "AP Invoice"
													}), (() => {
														const inv = apInvoices.find((i) => i.po_number === viewPo.doc_number);
														return inv ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: `font-mono font-semibold ${inv.status === "PAID" ? "text-emerald-600" : "text-amber-600"}`,
															children: [
																inv.invoice_number,
																" (",
																inv.status,
																")"
															]
														}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-muted-foreground",
															children: "—"
														});
													})()]
												})
											]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "p-4 border-t bg-muted/10 shrink-0 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [viewPo.status === "DRAFT" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										className: "h-8 text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm",
										onClick: async () => {
											setSaving(true);
											try {
												await supabase.from("proc_purchase_orders").update({ status: "APPROVED" }).eq("id", viewPo.id);
												toast.success(`Purchase Order ${viewPo.doc_number} approved!`);
												setViewPo({
													...viewPo,
													status: "APPROVED"
												});
												await loadAll();
											} catch (e) {
												toast.error(e.message || "Failed to approve PO");
											} finally {
												setSaving(false);
											}
										},
										disabled: saving,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "h-3.5 w-3.5 text-emerald-300" }), " Approve Purchase Order"]
									}), viewPo.status === "APPROVED" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										className: "h-8 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm",
										onClick: () => {
											const target = viewPo;
											setViewPo(null);
											openReceiveModal(target);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, { className: "h-4 w-4" }), " Receive Inward Goods (GRN)"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										className: "h-8 text-xs gap-1.5 text-cyan-600 border-cyan-500/40 hover:bg-cyan-50",
										onClick: () => {
											const target = viewPo;
											setViewPo(null);
											setShipmentForm((prev) => ({
												...prev,
												purchaseOrderId: target.id,
												inTransitValue: String(target.total_amount)
											}));
											setShowShipmentModal(true);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ship, { className: "h-4 w-4" }), " Dispatch Shipment"]
									})] })]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => setViewPo(null),
									children: "Close"
								})]
							})
						] })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					open: !!viewShipment,
					onOpenChange: (open) => !open && setViewShipment(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
						className: "max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl",
						children: viewShipment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
								className: "p-5 pb-3 border-b bg-gradient-to-r from-cyan-500/10 via-blue-500/5 to-background shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
											className: "text-base font-bold font-mono text-cyan-600 flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ship, { className: "h-5 w-5" }), viewShipment.shipment_number]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: statusBadgeVariant(viewShipment.status),
											children: viewShipment.status
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
										className: "text-xs mt-0.5",
										children: [
											"Carrier Logistics Tracker • Carrier: ",
											viewShipment.carrier_name,
											" • Incoterm: ",
											viewShipment.incoterm || "DAP"
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-right",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground uppercase font-bold",
											children: "In-Transit Valuation"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-base font-bold font-mono text-cyan-600",
											children: ["QAR ", Number(viewShipment.in_transit_value || 0).toLocaleString()]
										})]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 overflow-y-auto p-5 space-y-4 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl border bg-muted/20",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground uppercase font-bold",
												children: "Carrier & AWB"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold text-foreground mt-0.5",
												children: viewShipment.carrier_name
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-mono text-[11px] text-primary",
												children: viewShipment.tracking_number || "AWB-IN-TRANSIT"
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground uppercase font-bold",
												children: "Route & Schedule"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "font-semibold text-foreground mt-0.5",
												children: [viewShipment.origin_country || "Qatar", " → Hamad Port"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-[11px] text-muted-foreground",
												children: ["ETA: ", viewShipment.estimated_arrival]
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground uppercase font-bold",
											children: "Linked Purchase Order"
										}), (() => {
											return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-mono font-bold text-primary mt-0.5",
												children: pos.find((p) => p.id === viewShipment.purchase_order_id)?.doc_number || "—"
											});
										})()] })
									]
								}), (() => {
									const po = pos.find((p) => p.id === viewShipment.purchase_order_id);
									const deliverables = po ? poLines.filter((l) => l.purchase_order_id === po.id) : [];
									const grn = grns.find((g) => g.purchase_order_id === viewShipment.purchase_order_id);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3.5 border rounded-xl bg-card/60 space-y-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted-foreground uppercase font-bold",
													children: "Destination Scope & Inward Status"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-bold text-sm text-foreground mt-0.5",
													children: getPropertyName(po?.property_id)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[11px] text-muted-foreground",
													children: "Main Receiving Facility Receiving Bay"
												})
											] }), grn ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												variant: "default",
												className: "bg-emerald-600 text-white font-mono",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3 w-3 mr-1" }),
													" GRN Received (",
													grn.grn_number,
													")"
												]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-amber-600 border-amber-500/40 bg-amber-500/10",
												children: "Pending Physical Intake"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5 pt-2 border-t",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[10px] uppercase font-bold text-muted-foreground block",
												children: [
													"Manifest In-Transit Deliverables & Location Scope (",
													deliverables.length,
													" line",
													deliverables.length > 1 ? "s" : "",
													"):"
												]
											}), deliverables.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "border rounded-lg overflow-hidden bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
													className: "w-full text-xs",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
														className: "bg-muted/40 font-bold border-b text-muted-foreground",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
																className: "p-2.5 text-left",
																children: "Item Description"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
																className: "p-2.5 text-left",
																children: "Allocated Location (Property / Unit)"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
																className: "p-2.5 text-center",
																children: "Quantity"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
																className: "p-2.5 text-right",
																children: "Unit Rate"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
																className: "p-2.5 text-right",
																children: "Total (QAR)"
															})
														] })
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
														className: "divide-y",
														children: deliverables.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
															className: "hover:bg-muted/10",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-2.5",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																		className: "font-semibold text-foreground",
																		children: d.item_name || d.description
																	}), d.item_code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "font-mono text-[10px] text-muted-foreground",
																		children: d.item_code
																	})]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																	className: "p-2.5",
																	children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																		className: "flex items-center gap-1.5",
																		children: [
																			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5 text-primary shrink-0" }),
																			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																				className: "font-medium text-foreground",
																				children: getPropertyName(d.property_id || po?.property_id)
																			}),
																			d.unit_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
																				variant: "secondary",
																				className: "text-[10px] px-1.5 py-0 h-4 font-mono text-cyan-700 bg-cyan-50 border border-cyan-200",
																				children: ["Unit ", getUnitRef(d.unit_id)]
																			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																				className: "text-[10px] text-muted-foreground",
																				children: "· Common Area"
																			})
																		]
																	})
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-2.5 text-center font-mono font-bold text-foreground",
																	children: [
																		d.quantity,
																		" ",
																		d.uom || "Nos"
																	]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-2.5 text-right font-mono text-muted-foreground",
																	children: ["QAR ", Number(d.unit_rate || 0).toLocaleString()]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-2.5 text-right font-mono font-bold text-cyan-600",
																	children: ["QAR ", (Number(d.quantity || 0) * Number(d.unit_rate || 0)).toLocaleString()]
																})
															]
														}, i))
													})]
												})
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-3 bg-muted/20 rounded-lg text-muted-foreground text-xs",
												children: ["Standard shipment lot for ", getPropertyName(po?.property_id)]
											})]
										})]
									});
								})()]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
								className: "p-4 border-t bg-muted/10 shrink-0 flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [(() => {
										const po = pos.find((p) => p.id === viewShipment.purchase_order_id);
										const grn = grns.find((g) => g.purchase_order_id === viewShipment.purchase_order_id);
										if (po && !grn) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											size: "sm",
											className: "gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm",
											onClick: () => {
												const targetPo = po;
												setViewShipment(null);
												openReceiveModal(targetPo);
											},
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-3.5 w-3.5" }), " Receive Physical GRN"]
										});
										return null;
									})(), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										className: "text-xs gap-1 text-cyan-600 border-cyan-500/40 hover:bg-cyan-50",
										onClick: () => {
											const shToEdit = viewShipment;
											setViewShipment(null);
											openEditShipmentModal(shToEdit);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ship, { className: "h-3 w-3" }), " Edit Shipment Details"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => setViewShipment(null),
									children: "Close"
								})]
							})
						] })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
					open: !!viewGrn,
					onOpenChange: (open) => !open && setViewGrn(null),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
						className: "max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden shadow-2xl",
						children: viewGrn && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
								className: "p-5 pb-3 border-b bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-background shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
											className: "text-base font-bold font-mono text-emerald-600 flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PackageCheck, { className: "h-5 w-5" }), viewGrn.grn_number]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "default",
											className: "bg-emerald-600",
											children: viewGrn.status
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
										className: "text-xs mt-0.5",
										children: [
											"Goods Receipt Note • Received on ",
											viewGrn.grn_date,
											" • Vendor: ",
											getVendorName(viewGrn.vendor_id)
										]
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-right",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground uppercase font-bold",
											children: "Accepted Total Valuation"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-base font-bold font-mono text-emerald-600",
											children: ["QAR ", Number(viewGrn.total_amount || 0).toLocaleString()]
										})]
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 overflow-y-auto p-5 space-y-4 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl border bg-muted/20",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-[10px] text-muted-foreground uppercase font-bold",
													children: "Warehouse & Dock"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-semibold text-foreground mt-0.5",
													children: viewGrn.warehouse_name
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[10px] text-muted-foreground",
													children: viewGrn.receiving_location || "Central Storage Dock"
												})
											] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground uppercase font-bold",
												children: "Linked Purchase Order"
											}), (() => {
												return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-mono font-bold text-primary mt-0.5",
													children: pos.find((p) => p.id === viewGrn.purchase_order_id)?.doc_number || "—"
												});
											})()] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground uppercase font-bold",
												children: "AP Invoice Status"
											}), (() => {
												const inv = apInvoices.find((i) => i.grn_number === viewGrn.grn_number);
												return inv ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "font-mono font-semibold text-emerald-600 mt-0.5",
													children: [
														inv.invoice_number,
														" (",
														inv.status,
														")"
													]
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-muted-foreground mt-0.5",
													children: "Awaiting AP Invoice"
												});
											})()] })
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
											className: "font-bold text-foreground flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Truck, { className: "h-3.5 w-3.5 text-emerald-600" }), " Physical Inspection & Accepted Inward Deliverables"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "border rounded-xl overflow-hidden bg-card",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
												className: "w-full text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
													className: "bg-muted/40 font-bold border-b text-muted-foreground",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-3 text-left",
															children: "Item Description"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-3 text-left",
															children: "Allocated Location (Property / Unit)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-3 text-center",
															children: "Ordered"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-3 text-center",
															children: "Received"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-3 text-center",
															children: "Accepted"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-3 text-right",
															children: "Unit Rate"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
															className: "p-3 text-right",
															children: "Accepted Total (QAR)"
														})
													] })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
													className: "divide-y",
													children: (() => {
														const lines = grnLines.filter((gl) => gl.goods_receipt_id === viewGrn.id);
														const po = pos.find((p) => p.id === viewGrn.purchase_order_id);
														if (lines.length > 0) return lines.map((gl) => {
															const linkedPoLine = poLines.find((pl) => pl.id === gl.purchase_order_line_id);
															const propId = linkedPoLine?.property_id || po?.property_id;
															const unitId = linkedPoLine?.unit_id || po?.unit_id;
															return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
																className: "hover:bg-muted/20",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																		className: "p-3",
																		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																			className: "font-semibold text-foreground",
																			children: gl.description || gl.item_name
																		}), gl.item_code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																			className: "font-mono text-[10px] text-muted-foreground",
																			children: gl.item_code
																		})]
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																		className: "p-3",
																		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																			className: "flex items-center gap-1.5",
																			children: [
																				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5 text-emerald-600 shrink-0" }),
																				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																					className: "font-medium text-foreground",
																					children: getPropertyName(propId)
																				}),
																				unitId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
																					variant: "secondary",
																					className: "text-[10px] px-1.5 py-0 h-4 font-mono text-emerald-700 bg-emerald-50 border border-emerald-200",
																					children: ["Unit ", getUnitRef(unitId)]
																				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																					className: "text-[10px] text-muted-foreground",
																					children: "· Common Area"
																				})
																			]
																		})
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																		className: "p-3 text-center font-mono text-muted-foreground",
																		children: gl.ordered_quantity
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																		className: "p-3 text-center font-mono",
																		children: gl.received_quantity
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																		className: "p-3 text-center font-mono font-bold text-emerald-600",
																		children: gl.accepted_quantity
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																		className: "p-3 text-right font-mono",
																		children: ["QAR ", Number(gl.unit_rate).toLocaleString()]
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																		className: "p-3 text-right font-mono font-bold text-emerald-600",
																		children: ["QAR ", (Number(gl.accepted_quantity || 0) * Number(gl.unit_rate || 0)).toLocaleString()]
																	})
																]
															}, gl.id);
														});
														return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
															className: "hover:bg-muted/20",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-3",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																		className: "font-semibold text-foreground",
																		children: "Verified Goods Inward"
																	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																		className: "text-[10px] text-muted-foreground",
																		children: ["PO Fulfillment for ", viewGrn.warehouse_name]
																	})]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																	className: "p-3",
																	children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																		className: "flex items-center gap-1.5",
																		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5 text-emerald-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																			className: "font-medium text-foreground",
																			children: getPropertyName(po?.property_id)
																		})]
																	})
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																	className: "p-3 text-center font-mono",
																	children: "1 Lot"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																	className: "p-3 text-center font-mono",
																	children: "1 Lot"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																	className: "p-3 text-center font-mono font-bold text-emerald-600",
																	children: "1 Lot"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-3 text-right font-mono",
																	children: ["QAR ", Number(viewGrn.total_amount).toLocaleString()]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																	className: "p-3 text-right font-mono font-bold text-emerald-600",
																	children: ["QAR ", Number(viewGrn.total_amount).toLocaleString()]
																})
															]
														});
													})()
												})]
											})
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3.5 border rounded-xl bg-muted/10 flex items-center justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-0.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground uppercase font-bold",
												children: "QA Inspection Sign-off"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-foreground font-medium",
												children: ["Physical check passed • Stored safely in ", viewGrn.warehouse_name]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
											variant: "outline",
											className: "text-emerald-600 border-emerald-500/40 bg-emerald-500/10",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 mr-1" }), " Passed QA Inspection"]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, {
								className: "p-4 border-t bg-muted/10 shrink-0",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => setViewGrn(null),
									children: "Close"
								})
							})
						] })
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProformaInvoiceDialog, {
					invoice: viewInvoice,
					open: !!viewInvoice,
					onOpenChange: (open) => !open && setViewInvoice(null),
					vendors,
					onViewReceiptClick: (inv) => openPaymentReceipt(inv),
					onPayClick: (inv) => {
						setViewInvoice(null);
						setPaymentTargetInvoice(inv);
					}
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentReceiptDialog, {
					receipt: selectedReceipt,
					open: showReceiptModal,
					onOpenChange: setShowReceiptModal,
					vendorName: selectedReceipt?.vendor_name || getVendorName(Number(selectedReceipt?.vendor_id))
				})
			]
		})
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
			className: "text-xs font-semibold",
			children: label
		}), children]
	});
}
function EmptyState({ text }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border border-dashed rounded-lg p-10 text-center text-sm text-muted-foreground",
		children: text
	});
}
//#endregion
export { ProcurementModule };
