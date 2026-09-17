import { i as __toESM } from "../_runtime.mjs";
import { B as supabase, H as updateAsset, I as fetchUnits, k as fetchProperties, m as fetchAssets, r as createAsset, u as deleteAsset } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { A as ShieldCheck, An as ArrowDownLeft, B as RefreshCw, Dn as ArrowRightLeft, F as Search, Jt as CircleX, Nt as Eye, Qt as CircleCheck, S as Sparkles, U as Printer, W as Plus, Wt as Clock, X as Package, Y as Paperclip, _ as TrendingDown, c as User, g as TrendingUp, h as TriangleAlert, hn as Building2, in as ChevronLeft, jt as FileCheck, k as Shield, kt as FileSpreadsheet, on as Check, p as Upload, q as Pencil, r as Wrench, rn as ChevronRight, rt as MapPin, sn as CheckCheck, st as LoaderCircle, ut as Layers, v as Trash2, wn as ArrowUpRight, zt as DollarSign } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { l as useRouterState, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, r as CardDescription, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { t as ExcelImportEmbedded } from "./excel-import-embedded-BaJZdGzu.mjs";
import { d as FinVendorsApi } from "./supabase-finance-B6nDq-G1.mjs";
import { n as useFinanceStore } from "./finance-store-BEaAgb9S.mjs";
import { r as getTodayIST, t as formatDDMMMYYYY } from "./date-utils-BA7FZwNI.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/assets-module-DGZbx3r1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function fetchSimple(table) {
	const { data, error } = await supabase.from(table).select("*").order("name");
	if (error) throw error;
	return data || [];
}
var fetchAssetCategories = () => fetchSimple("mst_asset_categories");
async function fetchAssetSubcategories(categoryId) {
	let q = supabase.from("mst_asset_subcategories").select("*").order("name");
	if (categoryId) q = q.eq("category_id", categoryId);
	const { data, error } = await q;
	if (error) throw error;
	return data || [];
}
function TablePagination({ currentPage, totalItems, pageSize = 15, onPageChange, onPageSizeChange }) {
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
	const endItem = Math.min(totalItems, currentPage * pageSize);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-3 px-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-muted/10",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-muted-foreground",
			children: [
				"Showing ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-foreground font-mono",
					children: startItem
				}),
				" to",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-foreground font-mono",
					children: endItem
				}),
				" of",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold text-foreground font-mono",
					children: totalItems
				}),
				" entries"
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2",
			children: [
				onPageSizeChange && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 mr-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground text-[11px]",
							children: "Show"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: String(pageSize),
							onValueChange: (v) => onPageSizeChange(Number(v)),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								className: "h-7 w-16 text-xs bg-background",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "10",
									children: "10"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "15",
									children: "15"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "25",
									children: "25"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "50",
									children: "50"
								})
							] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground text-[11px]",
							children: "per page"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					className: "h-7 px-2.5 text-xs gap-1",
					disabled: currentPage <= 1,
					onClick: () => onPageChange(currentPage - 1),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-3.5 w-3.5" }), " Prev"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-mono font-medium text-foreground px-1",
					children: [
						currentPage,
						" / ",
						totalPages
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					className: "h-7 px-2.5 text-xs gap-1",
					disabled: currentPage >= totalPages,
					onClick: () => onPageChange(currentPage + 1),
					children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" })]
				})
			]
		})]
	});
}
function AssetManager({ role }) {
	const routerSearch = useRouterState({ select: (s) => s.location.search });
	useNavigate();
	const { addJournalEntry, addVoucher } = useFinanceStore();
	const [assets, setAssets] = (0, import_react.useState)([]);
	const [properties, setProperties] = (0, import_react.useState)([]);
	const [units, setUnits] = (0, import_react.useState)([]);
	const [vendors, setVendors] = (0, import_react.useState)([]);
	const [assetCategoriesList, setAssetCategoriesList] = (0, import_react.useState)([]);
	const [assetSubcategoriesList, setAssetSubcategoriesList] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [showNew, setShowNew] = (0, import_react.useState)(false);
	const [bulkAssetOpen, setBulkAssetOpen] = (0, import_react.useState)(false);
	const [bulkAssetData, setBulkAssetData] = (0, import_react.useState)("");
	const [bulkAssetLoading, setBulkAssetLoading] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [activeRegistryFilter, setActiveRegistryFilter] = (0, import_react.useState)("all");
	const [searchQuery, setSearchQuery] = (0, import_react.useState)("");
	const [printBarcode, setPrintBarcode] = (0, import_react.useState)(null);
	const [registryPage, setRegistryPage] = (0, import_react.useState)(1);
	const [registryPageSize, setRegistryPageSize] = (0, import_react.useState)(15);
	const [allocPage, setAllocPage] = (0, import_react.useState)(1);
	const [allocPageSize, setAllocPageSize] = (0, import_react.useState)(15);
	const [historyPage, setHistoryPage] = (0, import_react.useState)(1);
	const [historyPageSize, setHistoryPageSize] = (0, import_react.useState)(15);
	const [warrantyPage, setWarrantyPage] = (0, import_react.useState)(1);
	const [warrantyPageSize, setWarrantyPageSize] = (0, import_react.useState)(15);
	const [maintPage, setMaintPage] = (0, import_react.useState)(1);
	const [maintPageSize, setMaintPageSize] = (0, import_react.useState)(15);
	const [revalPage, setRevalPage] = (0, import_react.useState)(1);
	const [revalPageSize, setRevalPageSize] = (0, import_react.useState)(15);
	const [sellPage, setSellPage] = (0, import_react.useState)(1);
	const [sellPageSize, setSellPageSize] = (0, import_react.useState)(15);
	const [writeoffPage, setWriteoffPage] = (0, import_react.useState)(1);
	const [writeoffPageSize, setWriteoffPageSize] = (0, import_react.useState)(15);
	const [deprPage, setDeprPage] = (0, import_react.useState)(1);
	const [deprPageSize, setDeprPageSize] = (0, import_react.useState)(15);
	const [deprMethodFilter, setDeprMethodFilter] = (0, import_react.useState)("all");
	const [deprSearch, setDeprSearch] = (0, import_react.useState)("");
	const [selectedAssetForDetail, setSelectedAssetForDetail] = (0, import_react.useState)(null);
	const [editingAsset, setEditingAsset] = (0, import_react.useState)(null);
	const [editForm, setEditForm] = (0, import_react.useState)({
		asset_name: "",
		category: "Furniture",
		asset_code: "",
		serial_number: "",
		purchase_cost: "",
		purchase_date: getTodayIST(),
		life_of_asset: "60",
		brand: "Straight Line Method (SLM)",
		supplier: "",
		asset_condition: "Good",
		description: ""
	});
	const [moduleTab, setModuleTabState] = (0, import_react.useState)(typeof routerSearch?.tab === "string" ? routerSearch.tab : "registry");
	(0, import_react.useEffect)(() => {
		if (routerSearch?.tab && routerSearch.tab !== moduleTab) setModuleTabState(routerSearch.tab);
	}, [routerSearch?.tab]);
	const [revaluations, setRevaluations] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("asset_revaluation_records_v2");
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	});
	const [sells, setSells] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("asset_sale_records_v2");
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	});
	const [writeoffs, setWriteoffs] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("asset_writeoff_records_v2");
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	});
	const [allocations, setAllocations] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("asset_allocation_records_v2");
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	});
	const [maintenances, setMaintenances] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("asset_maintenance_records_v2");
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	});
	const [warranties, setWarranties] = (0, import_react.useState)(() => {
		try {
			const saved = localStorage.getItem("asset_warranty_records_v2");
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	});
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("asset_revaluation_records_v2", JSON.stringify(revaluations));
		} catch {}
	}, [revaluations]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("asset_sale_records_v2", JSON.stringify(sells));
		} catch {}
	}, [sells]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("asset_writeoff_records_v2", JSON.stringify(writeoffs));
		} catch {}
	}, [writeoffs]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("asset_allocation_records_v2", JSON.stringify(allocations));
		} catch {}
	}, [allocations]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("asset_maintenance_records_v2", JSON.stringify(maintenances));
		} catch {}
	}, [maintenances]);
	(0, import_react.useEffect)(() => {
		try {
			localStorage.setItem("asset_warranty_records_v2", JSON.stringify(warranties));
		} catch {}
	}, [warranties]);
	const [showDepreciationModal, setShowDepreciationModal] = (0, import_react.useState)(false);
	const [selectedAssetForDepr, setSelectedAssetForDepr] = (0, import_react.useState)(null);
	const [depreciationForm, setDepreciationForm] = (0, import_react.useState)({
		fiscal_year: "2025-2026",
		posting_date: getTodayIST(),
		depreciation_method: "Straight Line Method (SLM)",
		useful_life_years: "5",
		depreciation_rate_pct: "20",
		charge_amount: "",
		remarks: ""
	});
	const [showRevaluation, setShowRevaluation] = (0, import_react.useState)(false);
	const [revalForm, setRevalForm] = (0, import_react.useState)({
		asset_id: "",
		prev_value: "",
		new_value: "",
		reason: "",
		date: getTodayIST()
	});
	const [showSell, setShowSell] = (0, import_react.useState)(false);
	const [sellForm, setSellForm] = (0, import_react.useState)({
		asset_id: "",
		book_value: "",
		sale_value: "",
		buyer: "",
		date: getTodayIST(),
		remarks: ""
	});
	const [showWriteoff, setShowWriteoff] = (0, import_react.useState)(false);
	const [writeoffForm, setWriteoffForm] = (0, import_react.useState)({
		asset_id: "",
		book_value: "",
		writeoff_reason: "",
		date: getTodayIST(),
		approved_by: ""
	});
	const [showWarrantyModal, setShowWarrantyModal] = (0, import_react.useState)(false);
	const [warrantyModalMode, setWarrantyModalMode] = (0, import_react.useState)("NEW");
	const [selectedWarrantyToEdit, setSelectedWarrantyToEdit] = (0, import_react.useState)(null);
	const [warrantyForm, setWarrantyForm] = (0, import_react.useState)({
		asset_id: "",
		warranty_type: "Standard Manufacturer",
		provider_name: "",
		policy_number: "",
		support_email: "",
		support_phone: "",
		start_date: getTodayIST(),
		duration_months: "12",
		expiry_date: "",
		coverage_scope: "Comprehensive Parts & Labor Coverage",
		amc_cost: "0",
		new_doc_name: "Warranty Certificate",
		new_doc_filename: "",
		documents: []
	});
	const [showAllocationDialog, setShowAllocationDialog] = (0, import_react.useState)(false);
	const [allocationMode, setAllocationMode] = (0, import_react.useState)("ALLOCATE");
	const [allocationTargetAsset, setAllocationTargetAsset] = (0, import_react.useState)(null);
	const [allocationForm, setAllocationForm] = (0, import_react.useState)({
		asset_id: "",
		allocation_type: "PROPERTY_UNIT",
		to_property_id: "",
		to_unit_id: "",
		to_employee_name: "",
		department: "",
		condition: "Good / Operational",
		date: getTodayIST(),
		remarks: ""
	});
	const [allocSubTab, setAllocSubTab] = (0, import_react.useState)("active");
	const [allocSearch, setAllocSearch] = (0, import_react.useState)("");
	const [warrantyFilter, setWarrantyFilter] = (0, import_react.useState)("all");
	const [warrantySearch, setWarrantySearch] = (0, import_react.useState)("");
	const [showNewMaintenance, setShowNewMaintenance] = (0, import_react.useState)(false);
	const [maintForm, setMaintForm] = (0, import_react.useState)({
		asset_id: "",
		maintenance_type: "Preventive Maintenance",
		priority: "Medium",
		service_vendor: "",
		technician_name: "",
		scheduled_date: getTodayIST(),
		estimated_cost: "0",
		description: ""
	});
	const [completeMaintModal, setCompleteMaintModal] = (0, import_react.useState)(null);
	const [completeMaintForm, setCompleteMaintForm] = (0, import_react.useState)({
		actual_cost: "",
		completed_date: getTodayIST(),
		completion_notes: "",
		invoice_ref: ""
	});
	const [stepperStep, setStepperStep] = (0, import_react.useState)(1);
	const [form, setForm] = (0, import_react.useState)({
		asset_type: "Fixed Asset",
		category: "Furniture",
		subcategory: "",
		item_name: "",
		commission_date: getTodayIST(),
		put_to_use_date: getTodayIST(),
		asset_tag_id: "",
		serial_number: "",
		acquisition_amount: "",
		vendor_id: "",
		useful_life_years: "5",
		depreciation_rate: "20",
		depreciation_method: "Straight Line Method (SLM)",
		account_rows: [{
			id: "1",
			account_code: "12300001",
			account_name: "12300001 - Fixed Asset (Capital Cost / Asset A/C)",
			debit: "",
			credit: ""
		}, {
			id: "2",
			account_code: "22100001",
			account_name: "22100001 - Trade Payables (Vendors / Supplier A/C)",
			debit: "",
			credit: ""
		}],
		has_warranty: true,
		warranty_type: "Standard Manufacturer",
		warranty_provider: "",
		warranty_policy_no: "",
		warranty_start_date: getTodayIST(),
		warranty_duration_months: "12",
		warranty_expiry_date: "",
		warranty_support_email: "",
		warranty_support_phone: "",
		warranty_coverage: "Standard 1-Year Comprehensive Manufacturer Warranty (Parts & Labor)",
		amc_fee: "0",
		documents: [],
		doc_input_name: "Purchase Invoice",
		doc_input_file: "",
		specifications: [],
		spec_type_input: "",
		spec_details_input: ""
	});
	(0, import_react.useEffect)(() => {
		if (form.warranty_start_date && form.warranty_duration_months) try {
			const d = new Date(form.warranty_start_date);
			d.setMonth(d.getMonth() + Number(form.warranty_duration_months));
			setForm((f) => ({
				...f,
				warranty_expiry_date: d.toISOString().split("T")[0]
			}));
		} catch {}
	}, [form.warranty_start_date, form.warranty_duration_months]);
	(0, import_react.useEffect)(() => {
		if (warrantyForm.start_date && warrantyForm.duration_months) try {
			const d = new Date(warrantyForm.start_date);
			d.setMonth(d.getMonth() + Number(warrantyForm.duration_months));
			setWarrantyForm((f) => ({
				...f,
				expiry_date: d.toISOString().split("T")[0]
			}));
		} catch {}
	}, [warrantyForm.start_date, warrantyForm.duration_months]);
	const getAssetStatus = (0, import_react.useCallback)((asset) => {
		if (sells.some((s) => s.asset_id === asset.id) || asset.asset_status === "Sold / Discarded" || asset.asset_status === "Sold") return {
			key: "sold",
			label: "Sold",
			badgeClass: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300 border-zinc-500/30",
			isAllocated: false,
			canBeActioned: false,
			description: "Asset disposed through sale"
		};
		if (writeoffs.some((w) => w.asset_id === asset.id) || asset.asset_status === "Disposed" || asset.asset_status === "Written Off") return {
			key: "writeoff",
			label: "Written Off",
			badgeClass: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30",
			isAllocated: false,
			canBeActioned: false,
			description: "Asset decommissioned & written off"
		};
		if (maintenances.some((m) => m.asset_id === asset.id && ["SCHEDULED", "IN_PROGRESS"].includes(m.status)) || asset.asset_status === "Maintenance" || asset.asset_status === "In Maintenance") return {
			key: "maintenance",
			label: "Under Maintenance",
			badgeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
			isAllocated: false,
			canBeActioned: false,
			description: "Under active service or work order"
		};
		if (Boolean(asset.assigned_property_id || asset.assigned_property_code || asset.assigned_unit_id || asset.assigned_unit_code || asset.assigned_employee_name || asset.properties?.title || asset.units?.unit_code || asset.asset_status === "Assigned" || asset.asset_status === "In Use" || asset.asset_status === "Allocated")) return {
			key: "allocated",
			label: "Allocated",
			badgeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30",
			isAllocated: true,
			canBeActioned: true,
			description: "Assigned to a property, unit, or occupant"
		};
		return {
			key: "available",
			label: "Available",
			badgeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
			isAllocated: false,
			canBeActioned: true,
			description: "In central inventory, ready for allocation"
		};
	}, [
		sells,
		writeoffs,
		maintenances
	]);
	const load = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const [allAssets, allProps, allUnits, allVendors, allAssetCats, allAssetSubcats] = await Promise.all([
				fetchAssets(),
				fetchProperties(),
				fetchUnits(),
				FinVendorsApi.fetchAll().catch(() => []),
				fetchAssetCategories().catch(() => []),
				fetchAssetSubcategories().catch(() => [])
			]);
			setAssets(allAssets);
			setProperties(allProps);
			setUnits(allUnits);
			setVendors(allVendors);
			setAssetCategoriesList(allAssetCats);
			setAssetSubcategoriesList(allAssetSubcats);
			setWarranties((prev) => {
				if (prev.length > 0) return prev;
				const initialList = [];
				allAssets.slice(0, 30).forEach((a, idx) => {
					const startDate = a.purchase_date || "2025-01-15";
					const durMonths = idx % 3 === 0 ? 24 : idx % 2 === 0 ? 36 : 12;
					const expDate = new Date(startDate);
					expDate.setMonth(expDate.getMonth() + durMonths);
					const expIso = expDate.toISOString().split("T")[0];
					const todayStr = getTodayIST();
					const isExpired = expIso < todayStr;
					const daysLeft = Math.ceil((new Date(expIso).getTime() - new Date(todayStr).getTime()) / (1e3 * 3600 * 24));
					const isExpiringSoon = !isExpired && daysLeft <= 45;
					const wType = idx % 4 === 0 ? "Annual Maintenance Contract (AMC)" : idx % 3 === 0 ? "Extended Warranty" : "Standard Manufacturer";
					initialList.push({
						id: `WAR-${a.asset_code || `AST-${1e3 + idx}`}`,
						asset_id: a.id,
						asset_name: a.asset_name,
						asset_code: a.asset_code || `AST-${1e3 + idx}`,
						warranty_type: wType,
						provider_name: a.supplier || "Al-Futtaim Technologies / LG Electronics",
						policy_number: `POL-QA-2026-${5e3 + idx}`,
						support_email: "service@alfuttaim.qa",
						support_phone: "+974 4455 6677",
						start_date: startDate,
						expiry_date: expIso,
						duration_months: durMonths,
						coverage_scope: "Comprehensive Parts, Compressor & On-site Repair Labor",
						status: isExpired ? "EXPIRED" : isExpiringSoon ? "EXPIRING_SOON" : wType === "Extended Warranty" ? "EXTENDED" : "ACTIVE",
						documents: [{
							id: `doc-${idx}-1`,
							name: "Warranty Certificate",
							file_name: `Warranty_Cert_${a.asset_code || a.id.slice(0, 6)}.pdf`,
							upload_date: startDate
						}, {
							id: `doc-${idx}-2`,
							name: "Purchase Invoice",
							file_name: `Invoice_INV_${a.asset_code || a.id.slice(0, 6)}.pdf`,
							upload_date: startDate
						}],
						created_at: (/* @__PURE__ */ new Date()).toISOString()
					});
				});
				return initialList;
			});
		} catch (err) {
			toast.error(`Failed to load assets: ${err.message}`);
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	const availableUnallocatedAssets = (0, import_react.useMemo)(() => {
		return assets.filter((a) => {
			const st = getAssetStatus(a);
			return !st.isAllocated && st.key === "available";
		});
	}, [assets, getAssetStatus]);
	const allocatedAssetsList = (0, import_react.useMemo)(() => {
		return assets.filter((a) => getAssetStatus(a).isAllocated);
	}, [assets, getAssetStatus]);
	const filteredAllocatedAssets = (0, import_react.useMemo)(() => {
		if (!allocSearch.trim()) return allocatedAssetsList;
		const q = allocSearch.toLowerCase();
		return allocatedAssetsList.filter((a) => a.asset_name?.toLowerCase().includes(q) || a.asset_code?.toLowerCase().includes(q) || a.category?.toLowerCase().includes(q) || a.assigned_property_code?.toLowerCase().includes(q) || a.assigned_unit_code?.toLowerCase().includes(q) || a.assigned_employee_name?.toLowerCase().includes(q) || a.properties?.title?.toLowerCase().includes(q));
	}, [allocatedAssetsList, allocSearch]);
	const pagedAllocatedAssets = (0, import_react.useMemo)(() => {
		const start = (allocPage - 1) * allocPageSize;
		return filteredAllocatedAssets.slice(start, start + allocPageSize);
	}, [
		filteredAllocatedAssets,
		allocPage,
		allocPageSize
	]);
	const pagedAllocationHistory = (0, import_react.useMemo)(() => {
		const start = (historyPage - 1) * historyPageSize;
		return allocations.slice(start, start + historyPageSize);
	}, [
		allocations,
		historyPage,
		historyPageSize
	]);
	const filteredWarranties = (0, import_react.useMemo)(() => {
		return warranties.filter((w) => {
			if (warrantyFilter === "active" && w.status !== "ACTIVE" && w.status !== "EXTENDED") return false;
			if (warrantyFilter === "expiring" && w.status !== "EXPIRING_SOON") return false;
			if (warrantyFilter === "extended" && w.warranty_type !== "Extended Warranty" && w.warranty_type !== "Annual Maintenance Contract (AMC)") return false;
			if (warrantyFilter === "expired" && w.status !== "EXPIRED") return false;
			if (warrantySearch.trim()) {
				const q = warrantySearch.toLowerCase();
				return w.asset_name?.toLowerCase().includes(q) || w.asset_code?.toLowerCase().includes(q) || w.provider_name?.toLowerCase().includes(q) || w.policy_number?.toLowerCase().includes(q);
			}
			return true;
		});
	}, [
		warranties,
		warrantyFilter,
		warrantySearch
	]);
	const pagedWarranties = (0, import_react.useMemo)(() => {
		const start = (warrantyPage - 1) * warrantyPageSize;
		return filteredWarranties.slice(start, start + warrantyPageSize);
	}, [
		filteredWarranties,
		warrantyPage,
		warrantyPageSize
	]);
	const warrantyCounts = (0, import_react.useMemo)(() => {
		let active = 0;
		let expiringSoon = 0;
		let expired = 0;
		let extended = 0;
		warranties.forEach((w) => {
			if (w.status === "ACTIVE") active++;
			if (w.status === "EXPIRING_SOON") expiringSoon++;
			if (w.status === "EXPIRED") expired++;
			if (w.warranty_type === "Extended Warranty" || w.warranty_type === "Annual Maintenance Contract (AMC)") extended++;
		});
		return {
			total: warranties.length,
			active,
			expiringSoon,
			expired,
			extended
		};
	}, [warranties]);
	const assetCounts = (0, import_react.useMemo)(() => {
		let available = 0;
		let allocated = 0;
		let maintenance = 0;
		let disposed = 0;
		assets.forEach((a) => {
			const st = getAssetStatus(a);
			if (st.key === "available") available++;
			else if (st.key === "allocated") allocated++;
			else if (st.key === "maintenance") maintenance++;
			else if (st.key === "sold" || st.key === "writeoff") disposed++;
		});
		return {
			total: assets.length,
			available,
			allocated,
			maintenance,
			disposed
		};
	}, [assets, getAssetStatus]);
	const filteredAssets = (0, import_react.useMemo)(() => {
		return assets.filter((a) => {
			const st = getAssetStatus(a);
			if (activeRegistryFilter === "available" && st.key !== "available") return false;
			if (activeRegistryFilter === "allocated" && st.key !== "allocated") return false;
			if (activeRegistryFilter === "maintenance" && st.key !== "maintenance") return false;
			if (activeRegistryFilter === "disposed" && st.key !== "sold" && st.key !== "writeoff") return false;
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				const matchName = a.asset_name?.toLowerCase().includes(q);
				const matchCode = a.asset_code?.toLowerCase().includes(q);
				const matchCat = a.category?.toLowerCase().includes(q);
				const matchSerial = a.serial_number?.toLowerCase().includes(q);
				const matchProp = a.assigned_property_code?.toLowerCase().includes(q) || a.properties?.title?.toLowerCase().includes(q);
				if (!matchName && !matchCode && !matchCat && !matchSerial && !matchProp) return false;
			}
			return true;
		});
	}, [
		assets,
		activeRegistryFilter,
		searchQuery,
		getAssetStatus
	]);
	const pagedAssets = (0, import_react.useMemo)(() => {
		const start = (registryPage - 1) * registryPageSize;
		return filteredAssets.slice(start, start + registryPageSize);
	}, [
		filteredAssets,
		registryPage,
		registryPageSize
	]);
	const pagedMaintenances = (0, import_react.useMemo)(() => {
		const start = (maintPage - 1) * maintPageSize;
		return maintenances.slice(start, start + maintPageSize);
	}, [
		maintenances,
		maintPage,
		maintPageSize
	]);
	const pagedRevaluations = (0, import_react.useMemo)(() => {
		const start = (revalPage - 1) * revalPageSize;
		return revaluations.slice(start, start + revalPageSize);
	}, [
		revaluations,
		revalPage,
		revalPageSize
	]);
	const pagedSells = (0, import_react.useMemo)(() => {
		const start = (sellPage - 1) * sellPageSize;
		return sells.slice(start, start + sellPageSize);
	}, [
		sells,
		sellPage,
		sellPageSize
	]);
	const pagedWriteoffs = (0, import_react.useMemo)(() => {
		const start = (writeoffPage - 1) * writeoffPageSize;
		return writeoffs.slice(start, start + writeoffPageSize);
	}, [
		writeoffs,
		writeoffPage,
		writeoffPageSize
	]);
	const assetDepreciationList = (0, import_react.useMemo)(() => {
		return assets.map((a, idx) => {
			const cost = Number(a.purchase_cost) || 0;
			const purchaseYear = a.purchase_date ? new Date(a.purchase_date).getFullYear() : 2024;
			const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
			const yearsElapsed = Math.max(0, currentYear - purchaseYear);
			const usefulYears = a.life_of_asset ? Math.max(1, Math.round(Number(a.life_of_asset) / 12)) : 5;
			const deprMethod = a.brand?.includes("WDV") || idx % 3 === 0 ? "Written Down Value (WDV)" : "Straight Line Method (SLM)";
			const ratePct = deprMethod === "Straight Line Method (SLM)" ? +(100 / usefulYears).toFixed(1) : +(150 / usefulYears).toFixed(1);
			let accumulated = 0;
			if (deprMethod === "Straight Line Method (SLM)") {
				const annualDepr = cost / usefulYears;
				accumulated = Math.min(cost, annualDepr * Math.min(yearsElapsed, usefulYears));
			} else {
				let remaining = cost;
				for (let y = 0; y < Math.min(yearsElapsed, usefulYears); y++) {
					const yearDepr = remaining * (ratePct / 100);
					accumulated += yearDepr;
					remaining -= yearDepr;
				}
			}
			accumulated = Math.round(accumulated);
			const bookValue = Math.max(0, cost - accumulated);
			return {
				id: `DEPR-${a.id}`,
				asset_id: a.id,
				asset_name: a.asset_name,
				asset_code: a.asset_code || `AST-${1e3 + idx}`,
				category: a.category || "General Asset",
				purchase_date: a.purchase_date || "2024-01-01",
				acquisition_cost: cost,
				depreciation_method: deprMethod,
				useful_life_years: usefulYears,
				depreciation_rate_pct: ratePct,
				accumulated_depreciation: accumulated,
				current_book_value: bookValue,
				last_depreciation_date: `${currentYear}-01-01`,
				fiscal_year: "2025-2026"
			};
		});
	}, [assets]);
	const filteredDepreciationList = (0, import_react.useMemo)(() => {
		return assetDepreciationList.filter((item) => {
			if (deprMethodFilter === "slm" && item.depreciation_method !== "Straight Line Method (SLM)") return false;
			if (deprMethodFilter === "wdv" && item.depreciation_method !== "Written Down Value (WDV)") return false;
			if (deprSearch.trim()) {
				const q = deprSearch.toLowerCase();
				return item.asset_name?.toLowerCase().includes(q) || item.asset_code?.toLowerCase().includes(q) || item.category?.toLowerCase().includes(q);
			}
			return true;
		});
	}, [
		assetDepreciationList,
		deprMethodFilter,
		deprSearch
	]);
	const pagedDepreciationList = (0, import_react.useMemo)(() => {
		const start = (deprPage - 1) * deprPageSize;
		return filteredDepreciationList.slice(start, start + deprPageSize);
	}, [
		filteredDepreciationList,
		deprPage,
		deprPageSize
	]);
	const depreciationMetrics = (0, import_react.useMemo)(() => {
		let totalCost = 0;
		let totalAccum = 0;
		let totalNetBook = 0;
		assetDepreciationList.forEach((item) => {
			totalCost += item.acquisition_cost;
			totalAccum += item.accumulated_depreciation;
			totalNetBook += item.current_book_value;
		});
		return {
			totalAssets: assetDepreciationList.length,
			totalCost,
			totalAccum,
			totalNetBook
		};
	}, [assetDepreciationList]);
	function openDepreciationModal(targetAsset) {
		if (targetAsset) {
			setSelectedAssetForDepr(targetAsset);
			const cost = Number(targetAsset.purchase_cost) || 0;
			const usefulYears = targetAsset.life_of_asset ? Math.max(1, Math.round(Number(targetAsset.life_of_asset) / 12)) : 5;
			const isWdv = targetAsset.brand?.includes("WDV");
			const deprMethod = isWdv ? "Written Down Value (WDV)" : "Straight Line Method (SLM)";
			const ratePct = isWdv ? 150 / usefulYears : 100 / usefulYears;
			const annualCharge = Math.round(cost * (ratePct / 100));
			setDepreciationForm({
				fiscal_year: "2025-2026",
				posting_date: getTodayIST(),
				depreciation_method: deprMethod,
				useful_life_years: String(usefulYears),
				depreciation_rate_pct: String(ratePct),
				charge_amount: String(annualCharge),
				remarks: `Annual Depreciation Charge FY 2025-26 for ${targetAsset.asset_name} (${targetAsset.asset_code || ""})`
			});
		} else {
			setSelectedAssetForDepr(null);
			setDepreciationForm({
				fiscal_year: "2025-2026",
				posting_date: getTodayIST(),
				depreciation_method: "Straight Line Method (SLM)",
				useful_life_years: "5",
				depreciation_rate_pct: "20",
				charge_amount: String(Math.round(depreciationMetrics.totalCost * .15)),
				remarks: "Portfolio-wide Periodic Depreciation Run for FY 2025-2026"
			});
		}
		setShowDepreciationModal(true);
	}
	function handlePostDepreciation() {
		const charge = Number(depreciationForm.charge_amount) || 0;
		if (charge <= 0) {
			toast.error("Please enter a valid depreciation charge amount.");
			return;
		}
		setSaving(true);
		try {
			const jeNumber = `JE-DEPR-${Date.now().toString().slice(-6)}`;
			addJournalEntry({
				je_no: jeNumber,
				posting_date: depreciationForm.posting_date || getTodayIST(),
				reference: selectedAssetForDepr ? selectedAssetForDepr.asset_code || selectedAssetForDepr.id : "PORTFOLIO-BATCH",
				narration: depreciationForm.remarks || `Depreciation Expense: ${selectedAssetForDepr ? selectedAssetForDepr.asset_name : "Portfolio Batch"} (FY ${depreciationForm.fiscal_year})`,
				dr_account: "Depreciation Expense on Fixed Assets",
				dr_code: "54100001",
				cr_account: "Accumulated Depreciation - Fixed Assets",
				cr_code: "12400001",
				amount: charge
			});
			toast.success(selectedAssetForDepr ? `Depreciation of QAR ${charge.toLocaleString()} posted to GL for ${selectedAssetForDepr.asset_name} (${jeNumber}).` : `Batch depreciation of QAR ${charge.toLocaleString()} posted to GL (${jeNumber}).`);
			setShowDepreciationModal(false);
		} catch (err) {
			toast.error(`Depreciation posting failed: ${err.message}`);
		} finally {
			setSaving(false);
		}
	}
	function openEditAssetModal(a) {
		setEditingAsset(a);
		setEditForm({
			asset_name: a.asset_name || "",
			category: a.category || "Furniture",
			asset_code: a.asset_code || "",
			serial_number: a.serial_number || "",
			purchase_cost: a.purchase_cost ? String(a.purchase_cost) : "",
			purchase_date: a.purchase_date || getTodayIST(),
			life_of_asset: a.life_of_asset ? String(a.life_of_asset) : "60",
			brand: a.brand || "Straight Line Method (SLM)",
			supplier: a.supplier || "",
			asset_condition: a.asset_condition || "Good",
			description: a.description || ""
		});
	}
	async function handleEditAssetSubmit() {
		if (!editingAsset) return;
		if (!editForm.asset_name.trim()) {
			toast.error("Please enter an asset name.");
			return;
		}
		setSaving(true);
		try {
			const payload = {
				asset_name: editForm.asset_name.trim(),
				category: editForm.category,
				asset_code: editForm.asset_code.trim() || editingAsset.asset_code,
				serial_number: editForm.serial_number.trim() || void 0,
				purchase_cost: editForm.purchase_cost ? Number(editForm.purchase_cost) : 0,
				purchase_date: editForm.purchase_date || void 0,
				life_of_asset: editForm.life_of_asset ? Number(editForm.life_of_asset) : void 0,
				brand: editForm.brand || void 0,
				supplier: editForm.supplier || void 0,
				asset_condition: editForm.asset_condition || "Good",
				description: editForm.description || void 0
			};
			await updateAsset(editingAsset.id, payload);
			setAssets((prev) => prev.map((a) => a.id === editingAsset.id ? {
				...a,
				...payload
			} : a));
			if (selectedAssetForDetail?.id === editingAsset.id) setSelectedAssetForDetail((prev) => prev ? {
				...prev,
				...payload
			} : null);
			toast.success(`Asset "${editForm.asset_name}" updated successfully.`);
			setEditingAsset(null);
		} catch (err) {
			toast.error(err.message || "Failed to update asset.");
		} finally {
			setSaving(false);
		}
	}
	function openWarrantyModal(asset, existingWarranty) {
		if (existingWarranty) {
			setWarrantyModalMode("EXTEND");
			setSelectedWarrantyToEdit(existingWarranty);
			setWarrantyForm({
				asset_id: existingWarranty.asset_id,
				warranty_type: existingWarranty.warranty_type,
				provider_name: existingWarranty.provider_name,
				policy_number: existingWarranty.policy_number || "",
				support_email: existingWarranty.support_email || "",
				support_phone: existingWarranty.support_phone || "",
				start_date: existingWarranty.start_date,
				duration_months: String(existingWarranty.duration_months || 12),
				expiry_date: existingWarranty.expiry_date,
				coverage_scope: existingWarranty.coverage_scope || "",
				amc_cost: String(existingWarranty.amc_cost || 0),
				new_doc_name: "Extended Warranty Agreement",
				new_doc_filename: "",
				documents: existingWarranty.documents || []
			});
		} else {
			setWarrantyModalMode("NEW");
			setSelectedWarrantyToEdit(null);
			setWarrantyForm({
				asset_id: asset?.id || "",
				warranty_type: "Standard Manufacturer",
				provider_name: asset?.supplier || "",
				policy_number: `POL-${Date.now().toString().slice(-6)}`,
				support_email: "support@provider.qa",
				support_phone: "+974 4400 0000",
				start_date: asset?.purchase_date || getTodayIST(),
				duration_months: "12",
				expiry_date: "",
				coverage_scope: "Comprehensive Parts & On-site Repair SLA",
				amc_cost: "0",
				new_doc_name: "Warranty Certificate",
				new_doc_filename: "",
				documents: [{
					id: `doc-${Date.now()}`,
					name: "Warranty Certificate",
					file_name: `Warranty_Cert_${asset?.asset_code || "AST"}.pdf`,
					upload_date: getTodayIST()
				}]
			});
		}
		setShowWarrantyModal(true);
	}
	function handleSaveWarranty() {
		if (!warrantyForm.asset_id || !warrantyForm.provider_name) {
			toast.error("Please select an asset and specify the warranty provider.");
			return;
		}
		const asset = assets.find((a) => a.id === warrantyForm.asset_id);
		if (!asset) return;
		const todayStr = getTodayIST();
		const isExpired = warrantyForm.expiry_date < todayStr;
		const daysLeft = Math.ceil((new Date(warrantyForm.expiry_date).getTime() - new Date(todayStr).getTime()) / (1e3 * 3600 * 24));
		const status = isExpired ? "EXPIRED" : !isExpired && daysLeft <= 45 ? "EXPIRING_SOON" : warrantyForm.warranty_type === "Extended Warranty" ? "EXTENDED" : "ACTIVE";
		const record = {
			id: selectedWarrantyToEdit ? selectedWarrantyToEdit.id : `WAR-${asset.asset_code || Date.now().toString().slice(-6)}`,
			asset_id: asset.id,
			asset_name: asset.asset_name,
			asset_code: asset.asset_code || "",
			warranty_type: warrantyForm.warranty_type,
			provider_name: warrantyForm.provider_name,
			policy_number: warrantyForm.policy_number,
			support_email: warrantyForm.support_email,
			support_phone: warrantyForm.support_phone,
			start_date: warrantyForm.start_date,
			expiry_date: warrantyForm.expiry_date,
			duration_months: Number(warrantyForm.duration_months) || 12,
			coverage_scope: warrantyForm.coverage_scope,
			amc_cost: Number(warrantyForm.amc_cost) || 0,
			status,
			documents: warrantyForm.documents,
			created_at: selectedWarrantyToEdit ? selectedWarrantyToEdit.created_at : (/* @__PURE__ */ new Date()).toISOString()
		};
		setWarranties((prev) => {
			const idx = prev.findIndex((w) => w.asset_id === asset.id || selectedWarrantyToEdit && w.id === selectedWarrantyToEdit.id);
			if (idx >= 0) {
				const next = [...prev];
				next[idx] = record;
				return next;
			}
			return [record, ...prev];
		});
		toast.success(`Warranty terms updated for ${asset.asset_name}. Documents attached.`);
		setShowWarrantyModal(false);
	}
	function openAllocationModalForAsset(asset, mode) {
		setAllocationMode(mode);
		setAllocationTargetAsset(asset);
		const isCorpStaff = asset.assigned_property_code === "Corporate Office" || !asset.assigned_property_id && Boolean(asset.assigned_employee_name);
		setAllocationForm({
			asset_id: asset.id,
			allocation_type: isCorpStaff ? "OFFICIAL_STAFF" : "PROPERTY_UNIT",
			to_property_id: mode === "TRANSFER" ? asset.assigned_property_id || "" : "",
			to_unit_id: mode === "TRANSFER" ? asset.assigned_unit_code || asset.assigned_unit_id || "" : "",
			to_employee_name: asset.assigned_employee_name || "",
			department: isCorpStaff ? asset.assigned_unit_code || "Administration & Executive" : "",
			condition: "Good / Operational",
			date: getTodayIST(),
			remarks: mode === "DEALLOCATE" ? "Returned to central inventory" : ""
		});
		setShowAllocationDialog(true);
	}
	async function handleConfirmAllocation() {
		if (!allocationForm.asset_id) {
			toast.error("Please select an asset.");
			return;
		}
		const asset = assets.find((a) => a.id === allocationForm.asset_id);
		if (!asset) return;
		const currentStatus = getAssetStatus(asset);
		if (allocationMode === "ALLOCATE") {
			if (currentStatus.isAllocated) {
				toast.error("This asset is already allocated. Use Transfer to relocate or Deallocate first.");
				return;
			}
			if (allocationForm.allocation_type === "OFFICIAL_STAFF") {
				if (!allocationForm.to_employee_name.trim()) {
					toast.error("Please enter or select the official staff member name.");
					return;
				}
				const corpProp = properties.find((p) => p.title?.toLowerCase().includes("corporate") || p.title?.toLowerCase().includes("headquarter") || p.title?.toLowerCase().includes("hq"));
				const locationDetails = allocationForm.department ? `${allocationForm.department}${allocationForm.to_unit_id ? ` • ${allocationForm.to_unit_id}` : ""}` : allocationForm.to_unit_id || "HQ Office Space";
				setSaving(true);
				try {
					await updateAsset(asset.id, {
						assigned_property_id: corpProp?.id || void 0,
						assigned_property_code: "Corporate Office",
						assigned_unit_id: void 0,
						assigned_unit_code: locationDetails,
						assigned_employee_name: allocationForm.to_employee_name.trim(),
						asset_status: "Assigned"
					});
					const newRec = {
						id: String(Date.now()),
						asset_id: asset.id,
						asset_name: asset.asset_name,
						asset_code: asset.asset_code || "",
						action_type: "ALLOCATION",
						allocation_type: "OFFICIAL_STAFF",
						from_property: "Central Storage (Available)",
						to_property: "Corporate Office",
						to_unit: locationDetails,
						to_employee: allocationForm.to_employee_name.trim(),
						department: allocationForm.department || "Corporate Office",
						date: allocationForm.date,
						remarks: allocationForm.remarks || `Allocated to Official Staff: ${allocationForm.to_employee_name.trim()} (${allocationForm.department || "Corporate Office"})`,
						condition: allocationForm.condition
					};
					setAllocations((prev) => [newRec, ...prev]);
					toast.success(`Asset "${asset.asset_name}" allocated to ${allocationForm.to_employee_name.trim()} at Corporate Office.`);
					setShowAllocationDialog(false);
					setAllocationForm({
						asset_id: "",
						allocation_type: "PROPERTY_UNIT",
						to_property_id: "",
						to_unit_id: "",
						to_employee_name: "",
						department: "",
						condition: "Good / Operational",
						date: getTodayIST(),
						remarks: ""
					});
					await load();
				} catch (err) {
					toast.error(`Allocation failed: ${err.message}`);
				} finally {
					setSaving(false);
				}
			} else {
				if (!allocationForm.to_property_id) {
					toast.error("Please select a target Property for allocation.");
					return;
				}
				const targetProp = properties.find((p) => p.id === allocationForm.to_property_id);
				const targetUnit = units.find((u) => u.id === allocationForm.to_unit_id);
				setSaving(true);
				try {
					await updateAsset(asset.id, {
						assigned_property_id: targetProp?.id,
						assigned_property_code: targetProp?.title,
						assigned_unit_id: targetUnit?.id || void 0,
						assigned_unit_code: targetUnit?.unit_ref || void 0,
						assigned_employee_name: allocationForm.to_employee_name.trim() || void 0,
						asset_status: "Assigned"
					});
					const newRec = {
						id: String(Date.now()),
						asset_id: asset.id,
						asset_name: asset.asset_name,
						asset_code: asset.asset_code || "",
						action_type: "ALLOCATION",
						allocation_type: "PROPERTY_UNIT",
						from_property: "Central Storage (Available)",
						to_property: targetProp?.title || "Property",
						to_unit: targetUnit?.unit_ref,
						to_employee: allocationForm.to_employee_name.trim() || void 0,
						date: allocationForm.date,
						remarks: allocationForm.remarks || "Allocated to property/unit",
						condition: allocationForm.condition
					};
					setAllocations((prev) => [newRec, ...prev]);
					toast.success(`Asset "${asset.asset_name}" allocated to ${targetProp?.title}${targetUnit ? ` (Unit ${targetUnit.unit_ref})` : ""}.`);
					setShowAllocationDialog(false);
					setAllocationForm({
						asset_id: "",
						allocation_type: "PROPERTY_UNIT",
						to_property_id: "",
						to_unit_id: "",
						to_employee_name: "",
						department: "",
						condition: "Good / Operational",
						date: getTodayIST(),
						remarks: ""
					});
					await load();
				} catch (err) {
					toast.error(`Allocation failed: ${err.message}`);
				} finally {
					setSaving(false);
				}
			}
		} else if (allocationMode === "DEALLOCATE") {
			setSaving(true);
			try {
				const fromPropName = asset.assigned_property_code || asset.properties?.title || "Allocated Site";
				const fromUnitRef = asset.assigned_unit_code || asset.units?.unit_code;
				await updateAsset(asset.id, {
					assigned_property_id: void 0,
					assigned_property_code: void 0,
					assigned_unit_id: void 0,
					assigned_unit_code: void 0,
					assigned_employee_id: void 0,
					assigned_employee_name: void 0,
					asset_status: "Available"
				});
				const newRec = {
					id: String(Date.now()),
					asset_id: asset.id,
					asset_name: asset.asset_name,
					asset_code: asset.asset_code || "",
					action_type: "DEALLOCATION",
					from_property: fromPropName,
					from_unit: fromUnitRef,
					from_employee: asset.assigned_employee_name,
					to_property: "Central Storage (Available)",
					date: allocationForm.date,
					remarks: allocationForm.remarks || "Returned / Deallocated to inventory pool",
					condition: allocationForm.condition
				};
				setAllocations((prev) => [newRec, ...prev]);
				toast.success(`Asset "${asset.asset_name}" deallocated and returned to inventory pool.`);
				setShowAllocationDialog(false);
				setAllocationForm({
					asset_id: "",
					allocation_type: "PROPERTY_UNIT",
					to_property_id: "",
					to_unit_id: "",
					to_employee_name: "",
					department: "",
					condition: "Good / Operational",
					date: getTodayIST(),
					remarks: ""
				});
				await load();
			} catch (err) {
				toast.error(`Deallocation failed: ${err.message}`);
			} finally {
				setSaving(false);
			}
		} else if (allocationMode === "TRANSFER") {
			const fromPropName = asset.assigned_property_code || asset.properties?.title || "General Pool";
			const fromUnitRef = asset.assigned_unit_code || asset.units?.unit_code;
			if (allocationForm.allocation_type === "OFFICIAL_STAFF") {
				if (!allocationForm.to_employee_name.trim()) {
					toast.error("Please enter or select the official staff member.");
					return;
				}
				const corpProp = properties.find((p) => p.title?.toLowerCase().includes("corporate") || p.title?.toLowerCase().includes("headquarter") || p.title?.toLowerCase().includes("hq"));
				const locationDetails = allocationForm.department ? `${allocationForm.department}${allocationForm.to_unit_id ? ` • ${allocationForm.to_unit_id}` : ""}` : allocationForm.to_unit_id || "HQ Office Space";
				setSaving(true);
				try {
					await updateAsset(asset.id, {
						assigned_property_id: corpProp?.id || void 0,
						assigned_property_code: "Corporate Office",
						assigned_unit_id: void 0,
						assigned_unit_code: locationDetails,
						assigned_employee_name: allocationForm.to_employee_name.trim(),
						asset_status: "Assigned"
					});
					const newRec = {
						id: String(Date.now()),
						asset_id: asset.id,
						asset_name: asset.asset_name,
						asset_code: asset.asset_code || "",
						action_type: "TRANSFER",
						allocation_type: "OFFICIAL_STAFF",
						from_property: fromPropName,
						from_unit: fromUnitRef,
						from_employee: asset.assigned_employee_name,
						to_property: "Corporate Office",
						to_unit: locationDetails,
						to_employee: allocationForm.to_employee_name.trim(),
						department: allocationForm.department || "Corporate Office",
						date: allocationForm.date,
						remarks: allocationForm.remarks || `Transferred to Official Staff: ${allocationForm.to_employee_name.trim()} at Corporate Office`,
						condition: allocationForm.condition
					};
					setAllocations((prev) => [newRec, ...prev]);
					toast.success(`Asset "${asset.asset_name}" transferred to ${allocationForm.to_employee_name.trim()} (Corporate Office).`);
					setShowAllocationDialog(false);
					setAllocationForm({
						asset_id: "",
						allocation_type: "PROPERTY_UNIT",
						to_property_id: "",
						to_unit_id: "",
						to_employee_name: "",
						department: "",
						condition: "Good / Operational",
						date: getTodayIST(),
						remarks: ""
					});
					await load();
				} catch (err) {
					toast.error(`Transfer failed: ${err.message}`);
				} finally {
					setSaving(false);
				}
			} else {
				if (!allocationForm.to_property_id) {
					toast.error("Please select a target Property for transfer.");
					return;
				}
				const targetProp = properties.find((p) => p.id === allocationForm.to_property_id);
				const targetUnit = units.find((u) => u.id === allocationForm.to_unit_id);
				setSaving(true);
				try {
					await updateAsset(asset.id, {
						assigned_property_id: targetProp?.id,
						assigned_property_code: targetProp?.title,
						assigned_unit_id: targetUnit?.id || void 0,
						assigned_unit_code: targetUnit?.unit_ref || void 0,
						assigned_employee_name: allocationForm.to_employee_name.trim() || asset.assigned_employee_name,
						asset_status: "Assigned"
					});
					const newRec = {
						id: String(Date.now()),
						asset_id: asset.id,
						asset_name: asset.asset_name,
						asset_code: asset.asset_code || "",
						action_type: "TRANSFER",
						allocation_type: "PROPERTY_UNIT",
						from_property: fromPropName,
						from_unit: fromUnitRef,
						from_employee: asset.assigned_employee_name,
						to_property: targetProp?.title,
						to_unit: targetUnit?.unit_ref,
						to_employee: allocationForm.to_employee_name.trim() || asset.assigned_employee_name,
						date: allocationForm.date,
						remarks: allocationForm.remarks || `Transferred from ${fromPropName} to ${targetProp?.title}`,
						condition: allocationForm.condition
					};
					setAllocations((prev) => [newRec, ...prev]);
					toast.success(`Asset "${asset.asset_name}" transferred to ${targetProp?.title}.`);
					setShowAllocationDialog(false);
					setAllocationForm({
						asset_id: "",
						allocation_type: "PROPERTY_UNIT",
						to_property_id: "",
						to_unit_id: "",
						to_employee_name: "",
						department: "",
						condition: "Good / Operational",
						date: getTodayIST(),
						remarks: ""
					});
					await load();
				} catch (err) {
					toast.error(`Transfer failed: ${err.message}`);
				} finally {
					setSaving(false);
				}
			}
		}
	}
	async function handleCreateMaintenance() {
		if (!maintForm.asset_id) {
			toast.error("Please select an asset for maintenance.");
			return;
		}
		const asset = assets.find((a) => a.id === maintForm.asset_id);
		if (!asset) return;
		if (getAssetStatus(asset).isAllocated) {
			toast.error(`Cannot schedule maintenance. "${asset.asset_name}" is currently allocated. Please deallocate it first.`);
			return;
		}
		setSaving(true);
		try {
			const newMaint = {
				id: `WO-MAINT-${Date.now().toString().slice(-6)}`,
				asset_id: asset.id,
				asset_name: asset.asset_name,
				asset_code: asset.asset_code || "",
				maintenance_type: maintForm.maintenance_type,
				priority: maintForm.priority,
				service_vendor: maintForm.service_vendor || "In-House Facility Team",
				technician_name: maintForm.technician_name,
				scheduled_date: maintForm.scheduled_date,
				estimated_cost: Number(maintForm.estimated_cost) || 0,
				status: "SCHEDULED",
				description: maintForm.description || "Routine preventive / corrective service work order",
				created_at: (/* @__PURE__ */ new Date()).toISOString()
			};
			setMaintenances((prev) => [newMaint, ...prev]);
			await updateAsset(asset.id, { asset_status: "Maintenance" }).catch(() => {});
			toast.success(`Maintenance Order ${newMaint.id} created for ${asset.asset_name}.`);
			setShowNewMaintenance(false);
			setMaintForm({
				asset_id: "",
				maintenance_type: "Preventive Maintenance",
				priority: "Medium",
				service_vendor: "",
				technician_name: "",
				scheduled_date: getTodayIST(),
				estimated_cost: "0",
				description: ""
			});
			await load();
		} catch (err) {
			toast.error(`Failed to create maintenance: ${err.message}`);
		} finally {
			setSaving(false);
		}
	}
	async function handleStartMaintenance(maint) {
		setMaintenances((prev) => prev.map((m) => m.id === maint.id ? {
			...m,
			status: "IN_PROGRESS"
		} : m));
		toast.success(`Work order ${maint.id} marked In-Progress.`);
	}
	async function handleCompleteMaintenance() {
		if (!completeMaintModal) return;
		const actualCost = Number(completeMaintForm.actual_cost) || completeMaintModal.estimated_cost;
		setMaintenances((prev) => prev.map((m) => {
			if (m.id === completeMaintModal.id) return {
				...m,
				status: "COMPLETED",
				actual_cost: actualCost,
				completed_date: completeMaintForm.completed_date,
				completion_notes: completeMaintForm.completion_notes,
				invoice_ref: completeMaintForm.invoice_ref
			};
			return m;
		}));
		await updateAsset(completeMaintModal.asset_id, { asset_status: "Available" }).catch(() => {});
		toast.success(`Maintenance work order ${completeMaintModal.id} completed. Asset restored to Available inventory.`);
		setCompleteMaintModal(null);
		setCompleteMaintForm({
			actual_cost: "",
			completed_date: getTodayIST(),
			completion_notes: "",
			invoice_ref: ""
		});
		await load();
	}
	async function handleCancelMaintenance(maint) {
		if (!confirm(`Cancel maintenance work order ${maint.id}?`)) return;
		setMaintenances((prev) => prev.map((m) => m.id === maint.id ? {
			...m,
			status: "CANCELLED"
		} : m));
		await updateAsset(maint.asset_id, { asset_status: "Available" }).catch(() => {});
		toast.info(`Maintenance Order ${maint.id} cancelled.`);
		await load();
	}
	async function handleCreateAsset() {
		if (!form.item_name.trim()) {
			toast.error("Please enter an Asset / Item Name.");
			setStepperStep(1);
			return;
		}
		const acqAmount = Number(form.acquisition_amount) || 0;
		const usefulLifeMonths = (Number(form.useful_life_years) || 5) * 12;
		const tagCode = form.asset_tag_id.trim() || `AST-${Date.now().toString().slice(-4)}`;
		setSaving(true);
		try {
			const newAsset = await createAsset({
				asset_name: form.item_name.trim(),
				category: form.category,
				subcategory: form.subcategory.trim() || void 0,
				asset_code: tagCode,
				serial_number: form.serial_number.trim() || void 0,
				purchase_cost: acqAmount,
				purchase_date: form.commission_date,
				life_of_asset: usefulLifeMonths,
				depreciation_method: form.depreciation_method,
				depreciation_rate: form.depreciation_method === "None" ? 0 : Number(form.depreciation_rate) || 0,
				brand: form.depreciation_method,
				supplier: vendors.find((v) => v.id === form.vendor_id)?.name || form.warranty_provider || void 0,
				asset_condition: "New",
				asset_status: "Available",
				description: form.specifications.length > 0 ? form.specifications.map((s) => `${s.spec_type}: ${s.spec_details}`).join(" | ") : void 0
			});
			if (acqAmount > 0) addJournalEntry({
				je_no: `JE-AST-CAP-${Date.now().toString().slice(-6)}`,
				posting_date: form.commission_date,
				reference: tagCode,
				narration: `Asset Capitalization & Acquisition: ${form.item_name} (Tag: ${tagCode})`,
				dr_account: "Fixed Asset (Capital Cost / Asset A/C)",
				dr_code: "12300001",
				cr_account: "Trade Payables (Vendors / Supplier A/C)",
				cr_code: "22100001",
				amount: acqAmount
			});
			if (form.has_warranty && form.warranty_provider.trim()) {
				const todayStr = getTodayIST();
				const isExpired = form.warranty_expiry_date < todayStr;
				const daysLeft = Math.ceil((new Date(form.warranty_expiry_date).getTime() - new Date(todayStr).getTime()) / (1e3 * 3600 * 24));
				const isExpiringSoon = !isExpired && daysLeft <= 45;
				const newWar = {
					id: `WAR-${tagCode}`,
					asset_id: newAsset.id,
					asset_name: form.item_name.trim(),
					asset_code: tagCode,
					warranty_type: form.warranty_type,
					provider_name: form.warranty_provider.trim(),
					policy_number: form.warranty_policy_no.trim() || `POL-${tagCode}`,
					support_email: form.warranty_support_email.trim(),
					support_phone: form.warranty_support_phone.trim(),
					start_date: form.warranty_start_date,
					expiry_date: form.warranty_expiry_date || form.warranty_start_date,
					duration_months: Number(form.warranty_duration_months) || 12,
					coverage_scope: form.warranty_coverage,
					amc_cost: Number(form.amc_fee) || 0,
					status: isExpired ? "EXPIRED" : isExpiringSoon ? "EXPIRING_SOON" : form.warranty_type === "Extended Warranty" ? "EXTENDED" : "ACTIVE",
					documents: form.documents,
					created_at: (/* @__PURE__ */ new Date()).toISOString()
				};
				setWarranties((prev) => [newWar, ...prev]);
			}
			toast.success(`Asset "${form.item_name}" registered successfully with Tag ${tagCode}.`);
			setShowNew(false);
			setForm({
				asset_type: "Fixed Asset",
				category: "Furniture",
				item_name: "",
				commission_date: getTodayIST(),
				put_to_use_date: getTodayIST(),
				asset_tag_id: "",
				serial_number: "",
				acquisition_amount: "",
				vendor_id: "",
				useful_life_years: "5",
				depreciation_rate: "20",
				depreciation_method: "Straight Line Method (SLM)",
				account_rows: [{
					id: "1",
					account_code: "12300001",
					account_name: "12300001 - Fixed Asset (Capital Cost / Asset A/C)",
					debit: "",
					credit: ""
				}, {
					id: "2",
					account_code: "22100001",
					account_name: "22100001 - Trade Payables (Vendors / Supplier A/C)",
					debit: "",
					credit: ""
				}],
				has_warranty: true,
				warranty_type: "Standard Manufacturer",
				warranty_provider: "",
				warranty_policy_no: "",
				warranty_start_date: getTodayIST(),
				warranty_duration_months: "12",
				warranty_expiry_date: "",
				warranty_support_email: "",
				warranty_support_phone: "",
				warranty_coverage: "Standard 1-Year Comprehensive Manufacturer Warranty (Parts & Labor)",
				amc_fee: "0",
				documents: [],
				doc_input_name: "Purchase Invoice",
				doc_input_file: "",
				specifications: [],
				spec_type_input: "",
				spec_details_input: ""
			});
			setStepperStep(1);
			await load();
		} catch (err) {
			toast.error(`Failed to create asset: ${err.message}`);
		} finally {
			setSaving(false);
		}
	}
	async function handleCreateRevaluation() {
		if (!revalForm.asset_id || !revalForm.new_value) {
			toast.error("Please select an asset and enter the new fair value.");
			return;
		}
		const asset = assets.find((a) => a.id === revalForm.asset_id);
		if (!asset) return;
		if (getAssetStatus(asset).isAllocated) {
			toast.error(`Cannot revalue "${asset.asset_name}" while allocated. Please deallocate it first.`);
			return;
		}
		const prevVal = Number(revalForm.prev_value) || Number(asset.purchase_cost) || 0;
		const newVal = Number(revalForm.new_value) || 0;
		const diff = newVal - prevVal;
		setSaving(true);
		try {
			const rec = {
				id: `REV-${Date.now().toString().slice(-6)}`,
				asset_id: asset.id,
				asset_name: asset.asset_name,
				asset_code: asset.asset_code || "",
				prev_value: prevVal,
				new_value: newVal,
				reason: revalForm.reason || "Annual Fair Value Revaluation Assessment",
				date: revalForm.date || getTodayIST()
			};
			setRevaluations((prev) => [rec, ...prev]);
			await updateAsset(asset.id, { purchase_cost: newVal }).catch(() => {});
			if (diff > 0) addJournalEntry({
				je_no: `JE-REVAL-UP-${Date.now().toString().slice(-6)}`,
				posting_date: revalForm.date,
				reference: rec.id,
				narration: `Asset Revaluation Surplus: ${asset.asset_name} (Tag: ${asset.asset_code})`,
				dr_account: "Fixed Asset (Capital Cost / Asset A/C)",
				dr_code: "12300001",
				cr_account: "Revaluation Reserve / Surplus A/C",
				cr_code: "31000001",
				amount: diff
			});
			else if (diff < 0) addJournalEntry({
				je_no: `JE-REVAL-DOWN-${Date.now().toString().slice(-6)}`,
				posting_date: revalForm.date,
				reference: rec.id,
				narration: `Asset Impairment Loss: ${asset.asset_name} (Tag: ${asset.asset_code})`,
				dr_account: "Impairment Loss on Fixed Assets",
				dr_code: "54200001",
				cr_account: "Fixed Asset (Capital Cost / Asset A/C)",
				cr_code: "12300001",
				amount: Math.abs(diff)
			});
			toast.success(`Revaluation recorded for ${asset.asset_name}. Book value adjusted to QAR ${newVal.toLocaleString()}.`);
			setShowRevaluation(false);
			setRevalForm({
				asset_id: "",
				prev_value: "",
				new_value: "",
				reason: "",
				date: getTodayIST()
			});
			await load();
		} catch (err) {
			toast.error(`Revaluation failed: ${err.message}`);
		} finally {
			setSaving(false);
		}
	}
	async function handleCreateSell() {
		if (!sellForm.asset_id || !sellForm.sale_value || !sellForm.buyer.trim()) {
			toast.error("Please select an asset, specify sale price, and enter the buyer name.");
			return;
		}
		const asset = assets.find((a) => a.id === sellForm.asset_id);
		if (!asset) return;
		if (getAssetStatus(asset).isAllocated) {
			toast.error(`Cannot sell "${asset.asset_name}" while allocated. Please deallocate it first.`);
			return;
		}
		const bookVal = Number(sellForm.book_value) || Number(asset.purchase_cost) || 0;
		const saleVal = Number(sellForm.sale_value) || 0;
		const gainLoss = saleVal - bookVal;
		setSaving(true);
		try {
			const rec = {
				id: `SALE-${Date.now().toString().slice(-6)}`,
				asset_id: asset.id,
				asset_name: asset.asset_name,
				asset_code: asset.asset_code || "",
				book_value: bookVal,
				sale_value: saleVal,
				buyer: sellForm.buyer.trim(),
				date: sellForm.date || getTodayIST(),
				remarks: sellForm.remarks || `Disposed via sale to ${sellForm.buyer.trim()}`
			};
			setSells((prev) => [rec, ...prev]);
			await updateAsset(asset.id, { asset_status: "Sold / Discarded" }).catch(() => {});
			addVoucher({
				voucher_no: `RV-SALE-${Date.now().toString().slice(-6)}`,
				voucher_type: "Receipt Voucher",
				date: sellForm.date || getTodayIST(),
				name: `Asset Disposal Proceeds — ${asset.asset_name} (${rec.buyer})`,
				debit: "Bank Operating Account (QNB/CBQ)",
				debit_code: "12000001",
				credit: "Sundry Asset Disposal Clearing",
				credit_code: "12399999",
				amount: saleVal,
				method: "Bank Transfer"
			});
			addJournalEntry({
				je_no: `JE-AST-SALE-${Date.now().toString().slice(-6)}`,
				posting_date: sellForm.date || getTodayIST(),
				reference: rec.id,
				narration: `Asset Sale Derecognition: ${asset.asset_name} (Buyer: ${rec.buyer}, Tag: ${asset.asset_code})`,
				dr_account: "Sundry Asset Disposal Clearing",
				dr_code: "12399999",
				cr_account: "Fixed Asset (Capital Cost / Asset A/C)",
				cr_code: "12300001",
				amount: bookVal
			});
			if (gainLoss > 0) addJournalEntry({
				je_no: `JE-GAIN-DISP-${Date.now().toString().slice(-6)}`,
				posting_date: sellForm.date || getTodayIST(),
				reference: rec.id,
				narration: `Gain on Disposal of Fixed Asset: ${asset.asset_name}`,
				dr_account: "Sundry Asset Disposal Clearing",
				dr_code: "12399999",
				cr_account: "Gain on Sale of Fixed Assets",
				cr_code: "43200001",
				amount: gainLoss
			});
			else if (gainLoss < 0) addJournalEntry({
				je_no: `JE-LOSS-DISP-${Date.now().toString().slice(-6)}`,
				posting_date: sellForm.date || getTodayIST(),
				reference: rec.id,
				narration: `Loss on Disposal of Fixed Asset: ${asset.asset_name}`,
				dr_account: "Loss on Sale of Fixed Assets",
				dr_code: "54200001",
				cr_account: "Sundry Asset Disposal Clearing",
				cr_code: "12399999",
				amount: Math.abs(gainLoss)
			});
			toast.success(`Asset "${asset.asset_name}" marked as Sold. GL Derecognition & Receipt Voucher posted.`);
			setShowSell(false);
			setSellForm({
				asset_id: "",
				book_value: "",
				sale_value: "",
				buyer: "",
				date: getTodayIST(),
				remarks: ""
			});
			await load();
		} catch (err) {
			toast.error(`Sale recording failed: ${err.message}`);
		} finally {
			setSaving(false);
		}
	}
	async function handleCreateWriteoff() {
		if (!writeoffForm.asset_id || !writeoffForm.writeoff_reason.trim()) {
			toast.error("Please select an asset and state the write-off reason.");
			return;
		}
		const asset = assets.find((a) => a.id === writeoffForm.asset_id);
		if (!asset) return;
		if (getAssetStatus(asset).isAllocated) {
			toast.error(`Cannot write off "${asset.asset_name}" while allocated. Please deallocate it first.`);
			return;
		}
		const bookVal = Number(writeoffForm.book_value) || Number(asset.purchase_cost) || 0;
		setSaving(true);
		try {
			const rec = {
				id: `WROFF-${Date.now().toString().slice(-6)}`,
				asset_id: asset.id,
				asset_name: asset.asset_name,
				asset_code: asset.asset_code || "",
				book_value: bookVal,
				writeoff_reason: writeoffForm.writeoff_reason.trim(),
				date: writeoffForm.date || getTodayIST(),
				approved_by: writeoffForm.approved_by.trim() || "Management Committee"
			};
			setWriteoffs((prev) => [rec, ...prev]);
			await updateAsset(asset.id, { asset_status: "Written Off" }).catch(() => {});
			if (bookVal > 0) addJournalEntry({
				je_no: `JE-AST-WROFF-${Date.now().toString().slice(-6)}`,
				posting_date: writeoffForm.date || getTodayIST(),
				reference: rec.id,
				narration: `Asset Derecognition & Write-Off: ${asset.asset_name} (Reason: ${rec.writeoff_reason}, Tag: ${asset.asset_code})`,
				dr_account: "Loss on Asset Write-off & Scrapping",
				dr_code: "54200001",
				cr_account: "Fixed Asset (Capital Cost / Asset A/C)",
				cr_code: "12300001",
				amount: bookVal
			});
			toast.success(`Asset "${asset.asset_name}" written off. Loss recognized in General Ledger.`);
			setShowWriteoff(false);
			setWriteoffForm({
				asset_id: "",
				book_value: "",
				writeoff_reason: "",
				date: getTodayIST(),
				approved_by: ""
			});
			await load();
		} catch (err) {
			toast.error(`Write-off failed: ${err.message}`);
		} finally {
			setSaving(false);
		}
	}
	const assetDetailHistory = (0, import_react.useMemo)(() => {
		if (!selectedAssetForDetail) return null;
		const aid = selectedAssetForDetail.id;
		return {
			allocations: allocations.filter((a) => a.asset_id === aid),
			maintenances: maintenances.filter((m) => m.asset_id === aid),
			revaluations: revaluations.filter((r) => r.asset_id === aid),
			warranty: warranties.find((w) => w.asset_id === aid) || null,
			sale: sells.find((s) => s.asset_id === aid) || null,
			writeoff: writeoffs.find((w) => w.asset_id === aid) || null
		};
	}, [
		selectedAssetForDetail,
		allocations,
		maintenances,
		revaluations,
		warranties,
		sells,
		writeoffs
	]);
	const pageHeaderInfo = (0, import_react.useMemo)(() => {
		switch (moduleTab) {
			case "depreciation": return {
				title: "Asset Depreciation & Book Valuation",
				desc: "Calculate and monitor depreciation schedules (SLM & WDV), accumulated depreciation, and post journal entries to GL.",
				badge: `${depreciationMetrics.totalAssets} Active Assets`
			};
			case "allocation": return {
				title: "Asset Allocation & Movement",
				desc: "Manage asset deployments across properties, units, and custodians, with full audit trail.",
				badge: `${assetCounts.allocated} Active Deployments`
			};
			case "warranty": return {
				title: "Asset Warranty & AMC Contracts",
				desc: "Track manufacturer warranties, extended coverage, SLA agreements, and attached contract documents.",
				badge: `${warrantyCounts.total} Tracked Policies`
			};
			case "maintenance": return {
				title: "Asset Maintenance & Work Orders",
				desc: "Schedule and manage preventive servicing, repairs, and calibration for unallocated assets.",
				badge: `${assetCounts.maintenance} In Service`
			};
			case "revaluation": return {
				title: "Asset Revaluation",
				desc: "Record fair value adjustments, revaluation surpluses, and asset impairment logs.",
				badge: `${revaluations.length} Records`
			};
			case "sell": return {
				title: "Asset Sale & Derecognition",
				desc: "Record asset disposals to buyers with automatic General Ledger derecognition & receipt voucher posting.",
				badge: `${sells.length} Disposed`
			};
			case "writeoff": return {
				title: "Asset Write-off & Disposal",
				desc: "Retire damaged or obsolete assets with automated write-off loss postings to General Ledger.",
				badge: `${writeoffs.length} Written Off`
			};
			default: return {
				title: "Asset Registry",
				desc: "Master register of all fixed assets, serials, tag barcodes, valuations, and lifecycle states.",
				badge: `${assetCounts.total} Total Tracked`
			};
		}
	}, [
		moduleTab,
		assetCounts,
		warrantyCounts.total,
		revaluations.length,
		sells.length,
		writeoffs.length,
		depreciationMetrics.totalAssets
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-2xl font-bold tracking-tight",
						children: pageHeaderInfo.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						variant: "outline",
						className: "text-xs font-mono bg-amber-500/10 text-amber-600 border-amber-500/30",
						children: pageHeaderInfo.badge
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-1",
					children: pageHeaderInfo.desc
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2 flex-wrap items-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: load,
							disabled: loading,
							className: "gap-1.5 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `h-3.5 w-3.5 ${loading ? "animate-spin" : ""}` }), " Refresh"]
						}),
						moduleTab === "registry" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setBulkAssetOpen(true),
							className: "gap-1.5 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-3.5 w-3.5 text-primary" }), " Bulk Import"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => {
								setStepperStep(1);
								setShowNew(true);
							},
							className: "gap-1.5 text-xs bg-primary hover:bg-primary/90 text-white shadow-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add Asset"]
						})] }),
						moduleTab === "depreciation" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => openDepreciationModal(),
							className: "gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Run Depreciation Batch"]
						}),
						moduleTab === "warranty" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => openWarrantyModal(),
							className: "gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Register / Extend Warranty"]
						}),
						moduleTab === "maintenance" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => {
								setMaintForm({
									asset_id: "",
									maintenance_type: "Preventive Maintenance",
									priority: "Medium",
									service_vendor: "",
									technician_name: "",
									scheduled_date: getTodayIST(),
									estimated_cost: "0",
									description: ""
								});
								setShowNewMaintenance(true);
							},
							className: "gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white shadow-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " New Maintenance Order"]
						}),
						moduleTab === "revaluation" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => setShowRevaluation(true),
							className: "gap-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " New Revaluation"]
						}),
						moduleTab === "sell" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => setShowSell(true),
							className: "gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Record Asset Sale"]
						}),
						moduleTab === "writeoff" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => setShowWriteoff(true),
							className: "gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white shadow-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " New Write-off"]
						})
					]
				})]
			}),
			moduleTab === "registry" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 grid-cols-2 md:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Total Assets"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4 text-primary" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl font-bold text-foreground font-mono",
									children: assetCounts.total
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Total tracked in registry"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Available (In Stock)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-emerald-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl font-bold text-emerald-600 font-mono",
									children: assetCounts.available
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Ready for allocation / service"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Allocated"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 text-blue-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl font-bold text-blue-600 font-mono",
									children: assetCounts.allocated
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Deployed to properties & units"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "In Maintenance"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-4 w-4 text-amber-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl font-bold text-amber-600 font-mono",
									children: assetCounts.maintenance
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Under active repair or service"
								})]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						defaultValue: "all",
						value: activeRegistryFilter,
						onValueChange: (v) => {
							setActiveRegistryFilter(v);
							setRegistryPage(1);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "grid grid-cols-5 h-9 w-full md:w-auto",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "all",
										className: "text-xs",
										children: [
											"All Assets (",
											assetCounts.total,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "available",
										className: "text-xs",
										children: [
											"Available (",
											assetCounts.available,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "allocated",
										className: "text-xs",
										children: [
											"Allocated (",
											assetCounts.allocated,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "maintenance",
										className: "text-xs",
										children: [
											"Maintenance (",
											assetCounts.maintenance,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "disposed",
										className: "text-xs",
										children: [
											"Disposed / Written Off (",
											assetCounts.disposed,
											")"
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative w-full md:w-80",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Search by code, name, category, serial, property...",
									className: "pl-8 h-9 text-xs",
									value: searchQuery,
									onChange: (e) => {
										setSearchQuery(e.target.value);
										setRegistryPage(1);
									}
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-0",
							children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-center items-center py-20 text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin mr-2" }), " Loading asset register..."]
							}) : filteredAssets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center py-14 text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "mx-auto h-10 w-10 mb-2 opacity-30" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: "No assets found"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-1",
										children: "Try clearing filters or adding new assets."
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-x-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-xs text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b bg-muted/40 font-bold",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-3 text-left",
												children: "Asset Name & Code"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-2.5 text-left",
												children: "Category"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-2.5 text-left",
												children: "Allocation / Location"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-2 text-center whitespace-nowrap",
												children: "Commission"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-2.5 text-right whitespace-nowrap",
												children: "Value (QAR)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-2 text-center whitespace-nowrap",
												children: "Status"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-3 text-right whitespace-nowrap",
												children: "Actions"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pagedAssets.map((asset) => {
										const st = getAssetStatus(asset);
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-b hover:bg-muted/30 transition-colors",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "px-3 py-2.5 max-w-[220px]",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-semibold text-foreground leading-snug line-clamp-2",
														children: asset.asset_name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-[10px] font-mono text-muted-foreground flex items-center gap-1.5 mt-0.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: asset.asset_code || "No Code" }), asset.asset_code && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															onClick: () => setPrintBarcode(asset.asset_code || ""),
															className: "hover:text-primary transition-colors",
															title: "Print Tag Barcode",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-2.5 w-2.5" })
														})]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-2.5 py-2.5",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: "secondary",
														className: "text-[10px] font-normal truncate max-w-[110px]",
														children: asset.category || "Fixed Asset"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-2.5 py-2.5 max-w-[200px]",
													children: st.isAllocated ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-0.5",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "font-medium text-foreground flex items-center gap-1 truncate",
																title: asset.assigned_property_code || asset.properties?.title || "Assigned Property",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3 w-3 text-blue-500 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "truncate",
																	children: asset.assigned_property_code || asset.properties?.title || "Assigned Property"
																})]
															}),
															asset.assigned_unit_code && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "text-[10px] text-muted-foreground ml-4 truncate",
																children: ["Unit: ", asset.assigned_unit_code]
															}),
															asset.assigned_employee_name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "text-[10px] text-muted-foreground ml-4 flex items-center gap-0.5 truncate",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-2.5 w-2.5 shrink-0" }),
																	" ",
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "truncate",
																		children: asset.assigned_employee_name
																	})
																]
															})
														]
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "text-muted-foreground italic flex items-center gap-1 text-[11px]",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3 opacity-40 shrink-0" }), " Central Stock (Available)"]
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap",
													children: formatDDMMMYYYY(asset.purchase_date)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "px-2.5 py-2.5 text-right font-mono font-bold whitespace-nowrap",
													children: ["QAR ", asset.purchase_cost ? Number(asset.purchase_cost).toLocaleString() : "0"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-2 py-2.5 text-center whitespace-nowrap",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: "outline",
														className: `text-[10px] font-medium ${st.badgeClass}`,
														title: st.description,
														children: st.label
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-3 py-2.5 text-right whitespace-nowrap",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-end gap-1 items-center",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																size: "sm",
																variant: "outline",
																className: "h-7 px-2 text-[11px] gap-1 border-primary/40 text-primary hover:bg-primary/10 font-medium",
																onClick: () => setSelectedAssetForDetail(asset),
																title: "View Asset Details & Complete History",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" }), " Details"]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																size: "sm",
																variant: "outline",
																className: "h-7 px-2 text-[11px] gap-1 border-border text-foreground hover:bg-muted",
																onClick: () => openEditAssetModal(asset),
																title: "Edit Asset Details",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3 w-3" }), " Edit"]
															}),
															st.key === "available" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																size: "sm",
																variant: "secondary",
																className: "h-7 px-2 text-[11px] gap-1 text-blue-600 bg-blue-500/10 hover:bg-blue-500/20 font-medium",
																onClick: () => openAllocationModalForAsset(asset, "ALLOCATE"),
																title: "Allocate Asset to Property / Unit",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "h-3 w-3" }), " Allocate"]
															}),
															st.key === "allocated" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																size: "sm",
																variant: "secondary",
																className: "h-7 px-2 text-[11px] gap-1 text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 font-medium",
																onClick: () => openAllocationModalForAsset(asset, "DEALLOCATE"),
																title: "Deallocate / Return Asset to Stock",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "h-3 w-3" }), " Deallocate"]
															}),
															role === "admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																size: "icon",
																variant: "ghost",
																className: "h-7 w-7 text-destructive hover:bg-destructive/10",
																title: "Delete Asset",
																onClick: async () => {
																	if (!confirm(`Are you sure you want to delete asset "${asset.asset_name}"?`)) return;
																	await deleteAsset(asset.id);
																	toast.success("Asset deleted.");
																	load();
																},
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
															})
														]
													})
												})
											]
										}, asset.id);
									}) })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TablePagination, {
								currentPage: registryPage,
								totalItems: filteredAssets.length,
								pageSize: registryPageSize,
								onPageChange: setRegistryPage,
								onPageSizeChange: (sz) => {
									setRegistryPageSize(sz);
									setRegistryPage(1);
								}
							})] })
						})]
					})
				})]
			}),
			moduleTab === "depreciation" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 grid-cols-2 md:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Total Acquisition Cost"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4 text-primary" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xl font-bold text-foreground font-mono",
									children: ["QAR ", depreciationMetrics.totalCost.toLocaleString()]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Gross historical asset value"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Accumulated Depreciation"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "h-4 w-4 text-amber-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xl font-bold text-amber-600 font-mono",
									children: ["QAR ", depreciationMetrics.totalAccum.toLocaleString()]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Total depreciation charged to date"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Net Carrying (Book) Value"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-emerald-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xl font-bold text-emerald-600 font-mono",
									children: ["QAR ", depreciationMetrics.totalNetBook.toLocaleString()]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Current balance sheet asset value"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Depreciated Portfolio"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4 text-blue-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xl font-bold text-blue-600 font-mono",
									children: [depreciationMetrics.totalAssets, " Units"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "SLM & WDV amortization models"
								})]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						defaultValue: "all",
						value: deprMethodFilter,
						onValueChange: (v) => {
							setDeprMethodFilter(v);
							setDeprPage(1);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "grid grid-cols-3 h-9 w-full md:w-auto",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "all",
										className: "text-xs",
										children: [
											"All Methods (",
											assetDepreciationList.length,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "slm",
										className: "text-xs",
										children: "Straight Line (SLM)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "wdv",
										className: "text-xs",
										children: "Written Down Value (WDV)"
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative w-full md:w-80",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Search asset, tag, category...",
									className: "pl-8 h-9 text-xs",
									value: deprSearch,
									onChange: (e) => {
										setDeprSearch(e.target.value);
										setDeprPage(1);
									}
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-0",
							children: filteredDepreciationList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center py-14 text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingDown, { className: "mx-auto h-10 w-10 mb-2 opacity-30" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: "No depreciation records found"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-1",
										children: "Try clearing filters or checking asset acquisition dates."
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-x-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-xs text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b bg-muted/40 font-bold",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-3 text-left",
												children: "Asset Details"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-2.5 text-left",
												children: "Category"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-2 text-center whitespace-nowrap",
												children: "Acquisition"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-2.5 text-center",
												children: "Method & Rate"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-3 text-right",
												children: "Cost (QAR)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-3 text-right",
												children: "Accum. Depr (QAR)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-3 text-right",
												children: "Net Book Value (QAR)"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-3 text-center",
												children: "Actions"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
										className: "divide-y divide-border/60",
										children: pagedDepreciationList.map((item) => {
											const originalAsset = assets.find((a) => a.id === item.asset_id);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "hover:bg-muted/30 transition-colors",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
														className: "p-3",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "font-semibold text-foreground",
															children: item.asset_name
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "text-[11px] font-mono text-muted-foreground",
															children: item.asset_code
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "p-2.5",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "outline",
															className: "text-[10px] font-medium",
															children: item.category
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "p-2 text-center whitespace-nowrap font-mono text-muted-foreground",
														children: formatDDMMMYYYY(item.purchase_date)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "p-2.5 text-center",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
															variant: "outline",
															className: `text-[10px] font-mono ${item.depreciation_method.includes("SLM") ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "bg-purple-500/10 text-purple-600 border-purple-500/30"}`,
															children: [
																item.depreciation_method.includes("SLM") ? "SLM" : "WDV",
																" (",
																item.depreciation_rate_pct,
																"% / ",
																item.useful_life_years,
																"y)"
															]
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "p-3 text-right font-mono font-medium",
														children: item.acquisition_cost.toLocaleString()
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "p-3 text-right font-mono text-amber-600 font-semibold",
														children: item.accumulated_depreciation.toLocaleString()
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "p-3 text-right font-mono text-emerald-600 font-bold",
														children: item.current_book_value.toLocaleString()
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "p-3 text-center",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															size: "sm",
															variant: "outline",
															className: "h-7 text-xs gap-1 border-amber-500/40 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10",
															onClick: () => originalAsset && openDepreciationModal(originalAsset),
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-3 w-3" }), " Post GL Run"]
														})
													})
												]
											}, item.id);
										})
									})]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TablePagination, {
								currentPage: deprPage,
								totalItems: filteredDepreciationList.length,
								pageSize: deprPageSize,
								onPageChange: setDeprPage,
								onPageSizeChange: (sz) => {
									setDeprPageSize(sz);
									setDeprPage(1);
								}
							})] })
						})]
					})
				})]
			}),
			moduleTab === "allocation" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 grid-cols-2 md:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Currently Allocated"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-4 w-4 text-blue-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl font-bold text-blue-600 font-mono",
									children: assetCounts.allocated
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Active in properties & units"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Available for Allocation"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-emerald-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl font-bold text-emerald-600 font-mono",
									children: assetCounts.available
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "In stock ready to deploy"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Recorded Movement Logs"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "h-4 w-4 text-purple-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl font-bold text-foreground font-mono",
									children: allocations.length
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Historical transfers & returns"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Quick Actions"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-4 w-4 text-purple-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0 flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs flex-1 gap-1 border-blue-500/30 text-blue-600 hover:bg-blue-500/10",
									onClick: () => {
										setAllocationMode("ALLOCATE");
										setAllocationTargetAsset(null);
										setAllocationForm({
											asset_id: "",
											allocation_type: "PROPERTY_UNIT",
											to_property_id: "",
											to_unit_id: "",
											to_employee_name: "",
											department: "",
											condition: "Good / Operational",
											date: getTodayIST(),
											remarks: ""
										});
										setShowAllocationDialog(true);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3 w-3" }), " Allocate"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									variant: "outline",
									className: "h-7 text-xs flex-1 gap-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10",
									onClick: () => {
										setAllocationMode("DEALLOCATE");
										setAllocationTargetAsset(null);
										setAllocationForm({
											asset_id: "",
											allocation_type: "PROPERTY_UNIT",
											to_property_id: "",
											to_unit_id: "",
											to_employee_name: "",
											department: "",
											condition: "Good / Operational",
											date: getTodayIST(),
											remarks: ""
										});
										setShowAllocationDialog(true);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "h-3 w-3" }), " Return"]
								})]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						defaultValue: "active",
						value: allocSubTab,
						onValueChange: (v) => setAllocSubTab(v),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
									className: "grid grid-cols-2 h-9 w-full md:w-auto",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "active",
										className: "text-xs gap-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5 text-blue-500" }),
											" Active Allocations (",
											assetCounts.allocated,
											")"
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "history",
										className: "text-xs gap-1.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "h-3.5 w-3.5 text-purple-500" }),
											" Movement Audit Trail (",
											allocations.length,
											")"
										]
									})]
								}), allocSubTab === "active" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative w-full md:w-80",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "Search allocated asset, property, unit, staff...",
										className: "pl-8 h-9 text-xs",
										value: allocSearch,
										onChange: (e) => {
											setAllocSearch(e.target.value);
											setAllocPage(1);
										}
									})]
								})]
							}),
							allocSubTab === "active" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-0",
								children: filteredAllocatedAssets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center py-12 text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "mx-auto h-10 w-10 mb-2 opacity-30" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-medium",
											children: "No allocated assets found"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground mt-1",
											children: "Use Quick Actions > Allocate to deploy stock assets to properties, units, or corporate office staff."
										})
									]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "overflow-x-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										className: "w-full text-xs text-left",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-b bg-muted/40 font-bold",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "h-9 px-3 text-left",
													children: "Asset Name & Tag"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "h-9 px-2.5 text-left",
													children: "Category"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "h-9 px-2.5 text-left",
													children: "Assigned Property"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "h-9 px-2.5 text-left",
													children: "Unit / Staff Custodian"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "h-9 px-2 text-center whitespace-nowrap",
													children: "Commission"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "h-9 px-2.5 text-right whitespace-nowrap",
													children: "Value (QAR)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "h-9 px-2 text-center whitespace-nowrap",
													children: "Status"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "h-9 px-3 text-right whitespace-nowrap",
													children: "Allocation Actions"
												})
											]
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pagedAllocatedAssets.map((asset) => {
											const isCorpStaff = asset.assigned_property_code === "Corporate Office" || !asset.assigned_property_id && Boolean(asset.assigned_employee_name);
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "border-b hover:bg-muted/30",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
														className: "px-3 py-2.5 max-w-[220px]",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "font-semibold text-foreground leading-snug line-clamp-2",
															children: asset.asset_name
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "text-[10px] font-mono text-muted-foreground",
															children: asset.asset_code || "No Code"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2.5 py-2.5",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "secondary",
															className: "text-[10px] truncate max-w-[100px]",
															children: asset.category || "Fixed Asset"
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2.5 py-2.5 max-w-[190px]",
														children: isCorpStaff ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "flex items-center gap-1.5 truncate",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
																variant: "outline",
																className: "text-[10px] bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 gap-1 font-semibold truncate",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3 w-3 text-indigo-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "truncate",
																	children: "Corporate Office"
																})]
															})
														}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "font-medium text-foreground flex items-center gap-1 truncate",
															title: asset.assigned_property_code || asset.properties?.title || "Assigned Property",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3 w-3 text-blue-500 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "truncate",
																children: asset.assigned_property_code || asset.properties?.title || "Assigned Property"
															})]
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2.5 py-2.5 max-w-[160px]",
														children: isCorpStaff ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-0.5",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "font-semibold text-foreground text-xs flex items-center gap-1 truncate",
																title: asset.assigned_employee_name,
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-3 w-3 text-indigo-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "truncate",
																	children: asset.assigned_employee_name || "Official Staff"
																})]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "text-[10px] text-muted-foreground truncate",
																title: asset.assigned_unit_code || "HQ Space",
																children: asset.assigned_unit_code || "HQ Office Workspace"
															})]
														}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "truncate",
															children: asset.assigned_unit_code ? `Unit ${asset.assigned_unit_code}` : "—"
														}), asset.assigned_employee_name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "text-[10px] text-muted-foreground flex items-center gap-0.5 truncate",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "h-2.5 w-2.5 shrink-0" }),
																" ",
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "truncate",
																	children: asset.assigned_employee_name
																})
															]
														})] })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap",
														children: formatDDMMMYYYY(asset.purchase_date)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
														className: "px-2.5 py-2.5 text-right font-mono font-bold whitespace-nowrap",
														children: ["QAR ", Number(asset.purchase_cost || 0).toLocaleString()]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2.5 text-center whitespace-nowrap",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "outline",
															className: `text-[10px] ${isCorpStaff ? "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30" : "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30"}`,
															children: isCorpStaff ? "Staff Custody" : "Allocated"
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-3 py-2.5 text-right whitespace-nowrap",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex justify-end gap-1 items-center",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																	size: "sm",
																	variant: "outline",
																	className: "h-7 px-2 text-[11px] gap-1 border-purple-500/30 text-purple-600 hover:bg-purple-500/10",
																	onClick: () => openAllocationModalForAsset(asset, "TRANSFER"),
																	title: "Transfer Asset to another property/unit/staff",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "h-3 w-3" }), " Transfer"]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																	size: "sm",
																	variant: "outline",
																	className: "h-7 px-2 text-[11px] gap-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10",
																	onClick: () => openAllocationModalForAsset(asset, "DEALLOCATE"),
																	title: "Return / Deallocate Asset to Stock",
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDownLeft, { className: "h-3 w-3" }), " Return"]
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																	size: "sm",
																	variant: "ghost",
																	className: "h-7 px-1.5 text-xs text-primary hover:bg-primary/10",
																	onClick: () => setSelectedAssetForDetail(asset),
																	title: "View Details",
																	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" })
																})
															]
														})
													})
												]
											}, asset.id);
										}) })]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TablePagination, {
									currentPage: allocPage,
									totalItems: filteredAllocatedAssets.length,
									pageSize: allocPageSize,
									onPageChange: setAllocPage,
									onPageSizeChange: (sz) => {
										setAllocPageSize(sz);
										setAllocPage(1);
									}
								})] })
							}),
							allocSubTab === "history" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
								className: "p-0",
								children: allocations.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-center py-12 text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "mx-auto h-8 w-8 mb-2 opacity-30" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs",
										children: "No movement history logs recorded yet."
									})]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "overflow-x-auto",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
										className: "w-full text-xs text-left",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-b bg-muted/40 font-bold",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "h-9 px-3 text-left",
													children: "Asset"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "h-9 px-2.5 text-left whitespace-nowrap",
													children: "Action"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "h-9 px-2 text-center whitespace-nowrap",
													children: "Date"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "h-9 px-2.5 text-left",
													children: "From"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "h-9 px-2.5 text-left",
													children: "To Destination"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "h-9 px-2.5 text-left",
													children: "Condition"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "h-9 px-3 text-left",
													children: "Remarks"
												})
											]
										}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pagedAllocationHistory.map((al) => {
											const isStaffHist = al.allocation_type === "OFFICIAL_STAFF" || al.to_property === "Corporate Office" || al.from_property === "Corporate Office";
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "border-b hover:bg-muted/30",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
														className: "px-3 py-2.5 max-w-[200px]",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "font-semibold text-foreground truncate",
															children: al.asset_name
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "text-[10px] font-mono text-muted-foreground",
															children: al.asset_code
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2.5 py-2.5 whitespace-nowrap",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																variant: "outline",
																className: `text-[10px] font-mono ${al.action_type === "ALLOCATION" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : al.action_type === "DEALLOCATION" ? "bg-amber-500/10 text-amber-600 border-amber-500/30" : "bg-purple-500/10 text-purple-600 border-purple-500/30"}`,
																children: al.action_type
															}), isStaffHist && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																variant: "outline",
																className: "text-[9px] bg-indigo-500/10 text-indigo-600 border-indigo-500/30 font-mono",
																children: "Staff"
															})]
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap",
														children: formatDDMMMYYYY(al.date)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
														className: "px-2.5 py-2.5 text-muted-foreground max-w-[160px]",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "truncate",
																children: al.from_property || "Central Inventory"
															}),
															al.from_unit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "text-[10px] truncate",
																children: ["Space: ", al.from_unit]
															}),
															al.from_employee && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "text-[10px] text-muted-foreground truncate",
																children: ["From: ", al.from_employee]
															})
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
														className: "px-2.5 py-2.5 font-medium text-foreground max-w-[180px]",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "truncate",
																children: al.to_property || "Central Inventory"
															}),
															al.to_unit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "text-[10px] text-primary truncate",
																children: ["Space: ", al.to_unit]
															}),
															al.to_employee && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "text-[10px] text-muted-foreground truncate",
																children: ["Recipient: ", al.to_employee]
															})
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2.5 py-2.5 text-muted-foreground text-[11px] whitespace-nowrap",
														children: al.condition || "Operational"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-3 py-2.5 text-muted-foreground text-[11px] max-w-[200px] truncate",
														children: al.remarks || "—"
													})
												]
											}, al.id);
										}) })]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TablePagination, {
									currentPage: historyPage,
									totalItems: allocations.length,
									pageSize: historyPageSize,
									onPageChange: setHistoryPage,
									onPageSizeChange: (sz) => {
										setHistoryPageSize(sz);
										setHistoryPage(1);
									}
								})] })
							})
						]
					})
				})]
			}),
			moduleTab === "warranty" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 grid-cols-2 md:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Active Warranties"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-emerald-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl font-bold text-emerald-600 font-mono",
									children: warrantyCounts.active
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Fully covered under active terms"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Expiring Soon"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-4 w-4 text-amber-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl font-bold text-amber-600 font-mono",
									children: warrantyCounts.expiringSoon
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Expiring within 45 days"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Extended / AMC"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "h-4 w-4 text-indigo-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl font-bold text-indigo-600 font-mono",
									children: warrantyCounts.extended
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Annual AMC & extended policies"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Expired Warranties"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-4 w-4 text-red-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl font-bold text-red-600 font-mono",
									children: warrantyCounts.expired
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Eligible for renewal or AMC"
								})]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-border",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						defaultValue: "all",
						value: warrantyFilter,
						onValueChange: (v) => {
							setWarrantyFilter(v);
							setWarrantyPage(1);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "grid grid-cols-5 h-9 w-full md:w-auto",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "all",
										className: "text-xs",
										children: [
											"All (",
											warrantyCounts.total,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "active",
										className: "text-xs",
										children: [
											"Active (",
											warrantyCounts.active,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "expiring",
										className: "text-xs",
										children: [
											"Expiring Soon (",
											warrantyCounts.expiringSoon,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "extended",
										className: "text-xs",
										children: [
											"Extended / AMC (",
											warrantyCounts.extended,
											")"
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
										value: "expired",
										className: "text-xs",
										children: [
											"Expired (",
											warrantyCounts.expired,
											")"
										]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative w-full md:w-80",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Search asset, provider, policy #...",
									className: "pl-8 h-9 text-xs",
									value: warrantySearch,
									onChange: (e) => {
										setWarrantySearch(e.target.value);
										setWarrantyPage(1);
									}
								})]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "p-0",
							children: filteredWarranties.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center py-14 text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "mx-auto h-10 w-10 mb-2 opacity-30" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium",
										children: "No warranty records found"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-1",
										children: "Click \"Register / Extend Warranty\" to add coverage with documents."
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-x-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-xs text-left",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "border-b bg-muted/40 font-bold",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-3 text-left",
												children: "Asset Name & Tag"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-2.5 text-left",
												children: "Warranty & Policy #"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-2.5 text-left",
												children: "Provider & Support"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-2 text-center whitespace-nowrap",
												children: "Start"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-2 text-center whitespace-nowrap",
												children: "Expiry"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-2 text-center whitespace-nowrap",
												children: "Status"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-2.5 text-left",
												children: "Attached Documents"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "h-9 px-3 text-right whitespace-nowrap",
												children: "Actions"
											})
										]
									}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pagedWarranties.map((w) => {
										const todayStr = getTodayIST();
										const isExpired = w.expiry_date < todayStr;
										const daysLeft = Math.ceil((new Date(w.expiry_date).getTime() - new Date(todayStr).getTime()) / (1e3 * 3600 * 24));
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
											className: "border-b hover:bg-muted/30",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "px-3 py-2.5 max-w-[200px]",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-semibold text-foreground leading-snug truncate",
														children: w.asset_name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-[10px] font-mono text-muted-foreground",
														children: w.asset_code
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "px-2.5 py-2.5 max-w-[170px]",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: "outline",
														className: `text-[10px] truncate max-w-[160px] ${w.warranty_type === "Extended Warranty" ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/30" : w.warranty_type === "Annual Maintenance Contract (AMC)" ? "bg-purple-500/10 text-purple-600 border-purple-500/30" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"}`,
														children: w.warranty_type
													}), w.policy_number && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-[10px] font-mono text-muted-foreground mt-0.5 truncate",
														children: ["#", w.policy_number]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "px-2.5 py-2.5 max-w-[150px]",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-medium text-foreground truncate",
														children: w.provider_name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "text-[10px] text-muted-foreground truncate",
														children: w.support_phone || w.support_email || "Contact on file"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap",
													children: formatDDMMMYYYY(w.start_date)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
													className: "px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "font-bold text-foreground",
														children: formatDDMMMYYYY(w.expiry_date)
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: `text-[10px] font-semibold ${isExpired ? "text-red-500" : daysLeft <= 45 ? "text-amber-500" : "text-emerald-600"}`,
														children: isExpired ? "Expired" : `${daysLeft}d left`
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-2 py-2.5 text-center whitespace-nowrap",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: "outline",
														className: `text-[10px] font-mono ${w.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : w.status === "EXPIRING_SOON" ? "bg-amber-500/10 text-amber-600 border-amber-500/30 animate-pulse" : w.status === "EXTENDED" ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/30" : "bg-red-500/10 text-red-600 border-red-500/30"}`,
														children: w.status.replace("_", " ")
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-2.5 py-2.5 max-w-[160px]",
													children: w.documents && w.documents.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "flex flex-wrap gap-1",
														children: w.documents.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
															variant: "secondary",
															className: "text-[9px] gap-1 cursor-pointer hover:bg-muted/80 max-w-[130px] truncate",
															onClick: () => toast.info(`Viewing document: ${d.name} (${d.file_name})`),
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-2.5 w-2.5 shrink-0" }),
																" ",
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "truncate",
																	children: d.name
																})
															]
														}, d.id))
													}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-muted-foreground text-[10px] italic",
														children: "No files attached"
													})
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "px-3 py-2.5 text-right whitespace-nowrap",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-end gap-1 items-center",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															size: "sm",
															variant: "outline",
															className: "h-7 px-2 text-[11px] gap-1 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10 font-medium",
															onClick: () => openWarrantyModal(void 0, w),
															title: "Extend or Update Warranty Terms",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3 w-3" }), " Extend"]
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															size: "sm",
															variant: "ghost",
															className: "h-7 px-1.5 text-xs text-primary hover:bg-primary/10",
															onClick: () => {
																const matchingAsset = assets.find((a) => a.id === w.asset_id);
																if (matchingAsset) setSelectedAssetForDetail(matchingAsset);
															},
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3 w-3" })
														})]
													})
												})
											]
										}, w.id);
									}) })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TablePagination, {
								currentPage: warrantyPage,
								totalItems: filteredWarranties.length,
								pageSize: warrantyPageSize,
								onPageChange: setWarrantyPage,
								onPageSizeChange: (sz) => {
									setWarrantyPageSize(sz);
									setWarrantyPage(1);
								}
							})] })
						})]
					})
				})]
			}),
			moduleTab === "maintenance" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-3 grid-cols-2 md:grid-cols-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Active Work Orders"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-4 w-4 text-amber-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl font-bold text-amber-600 font-mono",
									children: maintenances.filter((m) => ["SCHEDULED", "IN_PROGRESS"].includes(m.status)).length
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Scheduled or In-Progress"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Completed Services"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "h-4 w-4 text-emerald-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl font-bold text-emerald-600 font-mono",
									children: maintenances.filter((m) => m.status === "COMPLETED").length
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Restored to available pool"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Total Maint. Spend"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4 text-primary" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xl font-bold text-foreground font-mono",
									children: ["QAR ", maintenances.reduce((acc, m) => acc + (m.actual_cost || m.estimated_cost || 0), 0).toLocaleString()]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Actual incurred service costs"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "bg-card/50",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
								className: "flex flex-row items-center justify-between pb-1 p-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-xs font-semibold text-muted-foreground",
									children: "Eligible Assets"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-4 w-4 text-emerald-500" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
								className: "p-4 pt-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-xl font-bold text-emerald-600 font-mono",
									children: availableUnallocatedAssets.length
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] text-muted-foreground",
									children: "Unallocated pool ready for service"
								})]
							})]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
						className: "border-b bg-muted/20 pb-3 flex flex-row items-center justify-between",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
							className: "text-sm font-bold flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block w-2 h-2 rounded-full bg-amber-500" }), " Asset Maintenance & Service Work Orders"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
							className: "text-xs",
							children: "Log and track maintenance requests, technician assignments, costs, and return assets to available inventory upon service completion."
						})] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-0",
						children: maintenances.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center py-12 text-muted-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "mx-auto h-8 w-8 mb-2 opacity-30" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs",
								children: "No maintenance work orders logged yet."
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full text-xs text-left",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b bg-muted/40 font-bold",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "h-9 px-3 text-left",
											children: "Order #"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "h-9 px-3 text-left",
											children: "Asset"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "h-9 px-2.5 text-left",
											children: "Type"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "h-9 px-2.5 text-left",
											children: "Vendor & Tech"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "h-9 px-2 text-center whitespace-nowrap",
											children: "Scheduled Date"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "h-9 px-2.5 text-right whitespace-nowrap",
											children: "Cost (QAR)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "h-9 px-2 text-center whitespace-nowrap",
											children: "Status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "h-9 px-3 text-right whitespace-nowrap",
											children: "Workflow Actions"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pagedMaintenances.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b hover:bg-muted/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2.5 font-mono font-semibold text-foreground whitespace-nowrap",
											children: m.id
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-3 py-2.5 max-w-[200px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-semibold text-foreground truncate",
												children: m.asset_name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] font-mono text-muted-foreground",
												children: m.asset_code
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2.5 py-2.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-[10px]",
												children: m.maintenance_type
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-2.5 py-2.5 text-muted-foreground max-w-[150px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-medium text-foreground truncate",
												children: m.service_vendor
											}), m.technician_name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[10px] truncate",
												children: ["Tech: ", m.technician_name]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap",
											children: formatDDMMMYYYY(m.scheduled_date)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2.5 py-2.5 text-right font-mono font-bold whitespace-nowrap",
											children: m.actual_cost ? `QAR ${m.actual_cost.toLocaleString()}` : `Est: QAR ${m.estimated_cost.toLocaleString()}`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 py-2.5 text-center whitespace-nowrap",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: `text-[10px] font-mono ${m.status === "SCHEDULED" ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : m.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-600 border-amber-500/30 animate-pulse" : m.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-zinc-500/10 text-zinc-600 border-zinc-500/30"}`,
												children: m.status
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2.5 text-right whitespace-nowrap",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex justify-end gap-1.5 items-center",
												children: [
													m.status === "SCHEDULED" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-6 px-2 text-[11px] gap-1 text-amber-600 border-amber-500/30 hover:bg-amber-500/10",
														onClick: () => handleStartMaintenance(m),
														children: "Start Work"
													}),
													m.status === "IN_PROGRESS" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														size: "sm",
														className: "h-6 px-2 text-[11px] gap-1 bg-emerald-600 hover:bg-emerald-700 text-white",
														onClick: () => {
															setCompleteMaintModal(m);
															setCompleteMaintForm({
																actual_cost: String(m.estimated_cost || ""),
																completed_date: getTodayIST(),
																completion_notes: "",
																invoice_ref: ""
															});
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3" }), " Complete"]
													}),
													["SCHEDULED", "IN_PROGRESS"].includes(m.status) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "icon",
														variant: "ghost",
														className: "h-6 w-6 text-destructive hover:bg-destructive/10",
														onClick: () => handleCancelMaintenance(m),
														title: "Cancel Work Order",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3.5 w-3.5" })
													})
												]
											})
										})
									]
								}, m.id)) })]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TablePagination, {
							currentPage: maintPage,
							totalItems: maintenances.length,
							pageSize: maintPageSize,
							onPageChange: setMaintPage,
							onPageSizeChange: (sz) => {
								setMaintPageSize(sz);
								setMaintPage(1);
							}
						})] })
					})]
				})]
			}),
			moduleTab === "revaluation" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "border-b bg-muted/20 pb-3 flex flex-row items-center justify-between",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-sm font-bold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block w-2 h-2 rounded-full bg-purple-500" }), " Asset Revaluation Register"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-xs",
						children: "Fair value adjustments and revaluation reserve logs."
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0",
					children: revaluations.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center py-10 text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "mx-auto h-8 w-8 mb-2 opacity-30" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs",
							children: "No revaluation entries recorded yet. Click \"New Revaluation\" to add."
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-xs text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b bg-muted/40 font-bold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-3 text-left",
										children: "Asset"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-2 text-center whitespace-nowrap",
										children: "Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-2.5 text-right whitespace-nowrap",
										children: "Previous Value (QAR)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-2.5 text-right whitespace-nowrap",
										children: "New Value (QAR)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-2.5 text-right whitespace-nowrap",
										children: "Gain / Loss (QAR)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-3 text-left",
										children: "Reason"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pagedRevaluations.map((r) => {
								const diff = r.new_value - r.prev_value;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b hover:bg-muted/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-3 py-2.5 font-medium text-foreground max-w-[200px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "truncate",
												children: r.asset_name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] font-mono text-muted-foreground",
												children: r.asset_code
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap",
											children: formatDDMMMYYYY(r.date)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-2.5 py-2.5 text-right font-mono text-muted-foreground whitespace-nowrap",
											children: ["QAR ", r.prev_value.toLocaleString()]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-2.5 py-2.5 text-right font-mono font-bold text-primary whitespace-nowrap",
											children: ["QAR ", r.new_value.toLocaleString()]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: `px-2.5 py-2.5 text-right font-mono font-bold whitespace-nowrap ${diff >= 0 ? "text-emerald-600" : "text-destructive"}`,
											children: diff >= 0 ? `+QAR ${diff.toLocaleString()}` : `-QAR ${Math.abs(diff).toLocaleString()}`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-3 py-2.5 text-muted-foreground max-w-[220px] truncate",
											children: r.reason
										})
									]
								}, r.id);
							}) })]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TablePagination, {
						currentPage: revalPage,
						totalItems: revaluations.length,
						pageSize: revalPageSize,
						onPageChange: setRevalPage,
						onPageSizeChange: (sz) => {
							setRevalPageSize(sz);
							setRevalPage(1);
						}
					})] })
				})]
			}),
			moduleTab === "sell" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "border-b bg-muted/20 pb-3 flex flex-row items-center justify-between",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-sm font-bold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block w-2 h-2 rounded-full bg-emerald-500" }), " Asset Sale Register & General Ledger Postings"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-xs",
						children: "Disposal of fixed assets to third parties with automated Receipt Voucher generation and General Ledger derecognition."
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0",
					children: sells.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center py-10 text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "mx-auto h-8 w-8 mb-2 opacity-30" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs",
							children: "No asset sales recorded yet. Click \"Record Asset Sale\" to begin."
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-xs text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b bg-muted/40 font-bold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-3 text-left",
										children: "Asset"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-2 text-center whitespace-nowrap",
										children: "Sale Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-2.5 text-left",
										children: "Buyer"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-2.5 text-right whitespace-nowrap",
										children: "Book Value (QAR)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-2.5 text-right whitespace-nowrap",
										children: "Sale Price (QAR)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-2.5 text-right whitespace-nowrap",
										children: "GL Gain / Loss"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-3 text-left",
										children: "Remarks & Posting"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pagedSells.map((s) => {
								const gainLoss = s.sale_value - s.book_value;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b hover:bg-muted/30",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-3 py-2.5 font-medium text-foreground max-w-[190px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "truncate",
												children: s.asset_name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] font-mono text-muted-foreground",
												children: s.asset_code
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap",
											children: formatDDMMMYYYY(s.date)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-2.5 py-2.5 font-medium max-w-[140px] truncate",
											children: s.buyer
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-2.5 py-2.5 text-right font-mono text-muted-foreground whitespace-nowrap",
											children: ["QAR ", s.book_value.toLocaleString()]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-2.5 py-2.5 text-right font-mono font-bold text-emerald-600 whitespace-nowrap",
											children: ["QAR ", s.sale_value.toLocaleString()]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: `px-2.5 py-2.5 text-right font-mono font-bold whitespace-nowrap ${gainLoss >= 0 ? "text-emerald-600" : "text-destructive"}`,
											children: gainLoss >= 0 ? `+QAR ${gainLoss.toLocaleString()}` : `-QAR ${Math.abs(gainLoss).toLocaleString()}`
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-3 py-2.5 text-muted-foreground max-w-[180px]",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "truncate",
												children: s.remarks || "Sold to buyer"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: "outline",
												className: "text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono mt-0.5 whitespace-nowrap",
												children: "GL Posted"
											})]
										})
									]
								}, s.id);
							}) })]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TablePagination, {
						currentPage: sellPage,
						totalItems: sells.length,
						pageSize: sellPageSize,
						onPageChange: setSellPage,
						onPageSizeChange: (sz) => {
							setSellPageSize(sz);
							setSellPage(1);
						}
					})] })
				})]
			}),
			moduleTab === "writeoff" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
					className: "border-b bg-muted/20 pb-3 flex flex-row items-center justify-between",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "text-sm font-bold flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block w-2 h-2 rounded-full bg-red-500" }), " Asset Write-off Register & GL Loss Logs"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, {
						className: "text-xs",
						children: "Scrapped or decommissioned unallocated assets with automated General Ledger write-off loss journal vouchers."
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0",
					children: writeoffs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center py-10 text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mx-auto h-8 w-8 mb-2 opacity-30" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs",
							children: "No write-offs recorded yet. Click \"New Write-off\" to add."
						})]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-xs text-left",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b bg-muted/40 font-bold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-3 text-left",
										children: "Asset"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-2 text-center whitespace-nowrap",
										children: "Write-off Date"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-2.5 text-right whitespace-nowrap",
										children: "Written-off Value (QAR)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-3 text-left",
										children: "Reason"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-2.5 text-left",
										children: "Approved By"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "h-9 px-2 text-center whitespace-nowrap",
										children: "GL Status"
									})
								]
							}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: pagedWriteoffs.map((w) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b hover:bg-muted/30",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-3 py-2.5 font-medium text-foreground max-w-[200px]",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "truncate",
											children: w.asset_name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10px] font-mono text-muted-foreground",
											children: w.asset_code
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-2 py-2.5 text-center font-mono text-[11px] whitespace-nowrap",
										children: formatDDMMMYYYY(w.date)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
										className: "px-2.5 py-2.5 text-right font-mono font-bold text-destructive whitespace-nowrap",
										children: ["QAR ", w.book_value.toLocaleString()]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-3 py-2.5 text-muted-foreground max-w-[200px] truncate",
										children: w.writeoff_reason
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-2.5 py-2.5 max-w-[140px] truncate",
										children: w.approved_by || "—"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "px-2 py-2.5 text-center whitespace-nowrap",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
											variant: "outline",
											className: "text-[9px] bg-red-500/10 text-red-600 border-red-500/20 font-mono",
											children: "Loss Posted"
										})
									})
								]
							}, w.id)) })]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TablePagination, {
						currentPage: writeoffPage,
						totalItems: writeoffs.length,
						pageSize: writeoffPageSize,
						onPageChange: setWriteoffPage,
						onPageSizeChange: (sz) => {
							setWriteoffPageSize(sz);
							setWriteoffPage(1);
						}
					})] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showAllocationDialog,
				onOpenChange: setShowAllocationDialog,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "h-4 w-4 text-blue-500" }), allocationMode === "ALLOCATE" ? "Allocate Asset to Property / Unit / Office Staff" : allocationMode === "DEALLOCATE" ? "Deallocate Asset (Return to Central Stock)" : "Transfer Asset between Properties / Units / Staff"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: allocationMode === "ALLOCATE" ? "Assign an available stock asset to a Property/Unit or directly to Corporate Office Staff." : allocationMode === "DEALLOCATE" ? "Return an allocated asset back to available central stock with condition verification." : "Relocate an allocated asset directly to another Property/Unit or Corporate Office Staff member."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5 py-2 text-xs",
							children: [
								allocationMode !== "ALLOCATE" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-1 p-1 rounded-lg bg-muted/40 border",
									children: ["DEALLOCATE", "TRANSFER"].map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => {
											setAllocationMode(m);
										},
										className: `py-1.5 text-xs font-semibold rounded transition-all ${allocationMode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`,
										children: m === "DEALLOCATE" ? "Deallocate / Return" : "Transfer / Relocate"
									}, m))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Selected Asset *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: allocationForm.asset_id,
										onValueChange: (v) => {
											setAllocationTargetAsset(assets.find((x) => x.id === v) || null);
											setAllocationForm((f) => ({
												...f,
												asset_id: v
											}));
										},
										disabled: Boolean(allocationTargetAsset),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs bg-background",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose asset..." })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: allocationMode === "ALLOCATE" ? availableUnallocatedAssets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p-3 text-center text-xs text-muted-foreground",
											children: "No available unallocated assets in stock."
										}) : availableUnallocatedAssets.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: a.id,
											children: [
												a.asset_name,
												" (",
												a.asset_code || "No Code",
												") — Available in Stock (QAR ",
												Number(a.purchase_cost || 0).toLocaleString(),
												")"
											]
										}, a.id)) : allocatedAssetsList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p-3 text-center text-xs text-muted-foreground",
											children: "No currently allocated assets found."
										}) : allocatedAssetsList.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: a.id,
											children: [
												a.asset_name,
												" (",
												a.asset_code || "No Code",
												") — At: ",
												a.assigned_property_code || a.properties?.title || "Property",
												" ",
												a.assigned_unit_code ? `(${a.assigned_unit_code})` : "",
												" ",
												a.assigned_employee_name ? `• ${a.assigned_employee_name}` : ""
											]
										}, a.id)) })]
									})]
								}),
								(allocationMode === "ALLOCATE" || allocationMode === "TRANSFER") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5 pt-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Allocation Target Type *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setAllocationForm((f) => ({
												...f,
												allocation_type: "PROPERTY_UNIT",
												to_employee_name: "",
												department: ""
											})),
											className: `p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all ${allocationForm.allocation_type === "PROPERTY_UNIT" ? "border-blue-500 bg-blue-500/10 text-foreground ring-1 ring-blue-500" : "border-border bg-card/60 text-muted-foreground hover:bg-muted/40"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: `h-4 w-4 mt-0.5 shrink-0 ${allocationForm.allocation_type === "PROPERTY_UNIT" ? "text-blue-500" : "text-muted-foreground"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-semibold text-xs text-foreground",
												children: "Property & Unit"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] text-muted-foreground",
												children: "Deploy to site, building, tenant or unit"
											})] })]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setAllocationForm((f) => ({
												...f,
												allocation_type: "OFFICIAL_STAFF",
												to_property_id: "",
												to_unit_id: "",
												department: f.department || "Administration & Executive"
											})),
											className: `p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all ${allocationForm.allocation_type === "OFFICIAL_STAFF" ? "border-indigo-500 bg-indigo-500/10 text-foreground ring-1 ring-indigo-500" : "border-border bg-card/60 text-muted-foreground hover:bg-muted/40"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: `h-4 w-4 mt-0.5 shrink-0 ${allocationForm.allocation_type === "OFFICIAL_STAFF" ? "text-indigo-600" : "text-muted-foreground"}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-semibold text-xs text-foreground",
												children: "Office Staff"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] text-muted-foreground",
												children: "Fixed to Corporate Office HQ & staff"
											})] })]
										})]
									})]
								}),
								(allocationMode === "ALLOCATE" || allocationMode === "TRANSFER") && allocationForm.allocation_type === "OFFICIAL_STAFF" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/5 space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
												className: "text-xs font-semibold flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Assigned Property" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
													variant: "outline",
													className: "text-[9px] bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 font-semibold",
													children: "Auto-Fixed for Staff"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "h-8 px-3 rounded-md border bg-muted/70 flex items-center gap-2 text-xs font-semibold text-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5 text-indigo-600 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Corporate Office (HQ)" })]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Department / Business Unit *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: allocationForm.department,
												onValueChange: (v) => setAllocationForm((f) => ({
													...f,
													department: v
												})),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs bg-background",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Department" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
													"Administration & Executive",
													"Finance & Accounting",
													"Leasing & Marketing",
													"Property & Facility Management",
													"Operations & Field Support",
													"IT & Systems Infrastructure",
													"Human Resources (HR)",
													"Procurement & Supply Chain",
													"Legal & Compliance"
												].map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: d,
													children: d
												}, d)) })]
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Official Staff / Employee Name *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												className: "h-8 text-xs bg-background",
												placeholder: "e.g. Tariq Mansoor / Fatima Al-Thani",
												value: allocationForm.to_employee_name,
												onChange: (e) => setAllocationForm((f) => ({
													...f,
													to_employee_name: e.target.value
												}))
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Workspace / Desk / Room (Optional)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												className: "h-8 text-xs bg-background",
												placeholder: "e.g. HQ 2nd Floor - Desk #12 / Office 204",
												value: allocationForm.to_unit_id,
												onChange: (e) => setAllocationForm((f) => ({
													...f,
													to_unit_id: e.target.value
												}))
											})]
										})]
									})]
								}),
								(allocationMode === "ALLOCATE" || allocationMode === "TRANSFER") && allocationForm.allocation_type === "PROPERTY_UNIT" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg border bg-muted/20 space-y-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Target Property *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: allocationForm.to_property_id,
												onValueChange: (v) => setAllocationForm((f) => ({
													...f,
													to_property_id: v,
													to_unit_id: ""
												})),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs bg-background",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Property" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: properties.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: p.id,
													children: p.title
												}, p.id)) })]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Target Unit (Optional)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: allocationForm.to_unit_id,
												onValueChange: (v) => setAllocationForm((f) => ({
													...f,
													to_unit_id: v
												})),
												disabled: !allocationForm.to_property_id,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs bg-background",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Unit" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "",
													children: "— Entire Property —"
												}), units.filter((u) => u.property_id === allocationForm.to_property_id).map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: u.id,
													children: u.unit_ref || `Unit ${u.id}`
												}, u.id))] })]
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Unit Tenant / Property Custodian Name (Optional)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs bg-background",
											placeholder: "e.g. Unit Tenant / Site Caretaker",
											value: allocationForm.to_employee_name,
											onChange: (e) => setAllocationForm((f) => ({
												...f,
												to_employee_name: e.target.value
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Effective Movement Date *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											className: "h-8 text-xs bg-background",
											value: allocationForm.date,
											onChange: (e) => setAllocationForm((f) => ({
												...f,
												date: e.target.value
											}))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Asset Condition Check"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: allocationForm.condition,
											onValueChange: (v) => setAllocationForm((f) => ({
												...f,
												condition: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
												"New",
												"Good / Operational",
												"Minor Wear",
												"Requires Maintenance"
											].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: c,
												children: c
											}, c)) })]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Movement Remarks & Handover Notes"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-8 text-xs bg-background",
										placeholder: "e.g. Issued for official staff workstation / Routine unit handover",
										value: allocationForm.remarks,
										onChange: (e) => setAllocationForm((f) => ({
											...f,
											remarks: e.target.value
										}))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setShowAllocationDialog(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: saving,
							className: "bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]",
							onClick: handleConfirmAllocation,
							children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1" }) : null, allocationMode === "ALLOCATE" ? "Confirm Allocation" : allocationMode === "DEALLOCATE" ? "Confirm Deallocation" : "Confirm Transfer"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showWarrantyModal,
				onOpenChange: setShowWarrantyModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-xl max-h-[90vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-4 w-4 text-indigo-600" }), warrantyModalMode === "EXTEND" ? "Extend / Update Asset Warranty Terms" : "Register New Asset Warranty Policy"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Configure manufacturer warranty, extended warranty, or comprehensive AMC SLA with attached contract documents."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Select Asset *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: warrantyForm.asset_id,
										onValueChange: (v) => setWarrantyForm((f) => ({
											...f,
											asset_id: v
										})),
										disabled: warrantyModalMode === "EXTEND",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs bg-background",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose asset..." })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: assets.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: a.id,
											children: [
												a.asset_name,
												" (",
												a.asset_code || "No Tag",
												")"
											]
										}, a.id)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Warranty / Coverage Type *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: warrantyForm.warranty_type,
											onValueChange: (v) => setWarrantyForm((f) => ({
												...f,
												warranty_type: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Standard Manufacturer",
													children: "Standard Manufacturer Warranty"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Extended Warranty",
													children: "Extended Warranty (Add-on)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Annual Maintenance Contract (AMC)",
													children: "Annual Maintenance Contract (AMC)"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Comprehensive SLA",
													children: "Comprehensive SLA / 24x7 Support"
												})
											] })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Warranty Provider / Vendor *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs",
											placeholder: "e.g. Al-Futtaim Engineering / Carrier Qatar",
											value: warrantyForm.provider_name,
											onChange: (e) => setWarrantyForm((f) => ({
												...f,
												provider_name: e.target.value
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-3 gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Policy / Certificate #"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												className: "h-8 text-xs font-mono",
												placeholder: "POL-2026-XXXX",
												value: warrantyForm.policy_number,
												onChange: (e) => setWarrantyForm((f) => ({
													...f,
													policy_number: e.target.value
												}))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Start Date *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "date",
												className: "h-8 text-xs",
												value: warrantyForm.start_date,
												onChange: (e) => setWarrantyForm((f) => ({
													...f,
													start_date: e.target.value
												}))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Duration (Months)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: warrantyForm.duration_months,
												onValueChange: (v) => setWarrantyForm((f) => ({
													...f,
													duration_months: v
												})),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "h-8 text-xs bg-background",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "6",
														children: "6 Months"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "12",
														children: "12 Months (1 Year)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "24",
														children: "24 Months (2 Years)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "36",
														children: "36 Months (3 Years)"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "60",
														children: "60 Months (5 Years)"
													})
												] })]
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Support Contact Email"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "email",
											className: "h-8 text-xs",
											placeholder: "service@vendor.qa",
											value: warrantyForm.support_email,
											onChange: (e) => setWarrantyForm((f) => ({
												...f,
												support_email: e.target.value
											}))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Support Helpline Phone"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs",
											placeholder: "+974 4400 0000",
											value: warrantyForm.support_phone,
											onChange: (e) => setWarrantyForm((f) => ({
												...f,
												support_phone: e.target.value
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Coverage Terms & Inclusions"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										className: "text-xs",
										rows: 2,
										placeholder: "Details of covered components (e.g. Compressor, motor, free labor, emergency response within 4 hours)...",
										value: warrantyForm.coverage_scope,
										onChange: (e) => setWarrantyForm((f) => ({
											...f,
											coverage_scope: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "p-3 rounded-lg border bg-muted/20 space-y-2.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
												className: "text-xs font-bold text-foreground flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-3.5 w-3.5 text-primary" }), " Upload Warranty Certificates & Invoices"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground",
												children: "PDF / Images"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-3 gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													className: "h-8 text-xs col-span-1",
													placeholder: "Doc Name (e.g. Warranty Certificate)",
													value: warrantyForm.new_doc_name,
													onChange: (e) => setWarrantyForm((f) => ({
														...f,
														new_doc_name: e.target.value
													}))
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "file",
													className: "h-8 text-xs col-span-1 bg-background",
													onChange: (e) => {
														const f = e.target.files?.[0];
														if (f) setWarrantyForm((prev) => ({
															...prev,
															new_doc_filename: f.name
														}));
													}
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													type: "button",
													size: "sm",
													variant: "outline",
													className: "h-8 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10",
													onClick: () => {
														if (!warrantyForm.new_doc_name.trim()) return toast.error("Please enter a document name.");
														const docName = warrantyForm.new_doc_name.trim();
														const fileName = warrantyForm.new_doc_filename || `${docName.replace(/\s+/g, "_")}.pdf`;
														setWarrantyForm((prev) => ({
															...prev,
															documents: [...prev.documents, {
																id: `doc-${Date.now()}`,
																name: docName,
																file_name: fileName,
																upload_date: getTodayIST()
															}],
															new_doc_filename: ""
														}));
														toast.success(`Document "${docName}" attached.`);
													},
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3 w-3" }), " Attach File"]
												})
											]
										}),
										warrantyForm.documents.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "space-y-1.5 mt-2",
											children: warrantyForm.documents.map((doc, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between p-2 rounded bg-card border text-xs",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5 text-emerald-600" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-semibold text-foreground",
															children: doc.name
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "text-[10px] font-mono text-muted-foreground",
															children: [
																"(",
																doc.file_name,
																")"
															]
														})
													]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													type: "button",
													size: "icon",
													variant: "ghost",
													className: "h-5 w-5 text-destructive hover:bg-destructive/10",
													onClick: () => setWarrantyForm((prev) => ({
														...prev,
														documents: prev.documents.filter((_, i) => i !== idx)
													})),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
												})]
											}, doc.id))
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setShowWarrantyModal(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							className: "bg-indigo-600 hover:bg-indigo-700 text-white",
							onClick: handleSaveWarranty,
							children: "Save Warranty Record"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!editingAsset,
				onOpenChange: (open) => !open && setEditingAsset(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-xl max-h-[90vh] overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-4 w-4 text-primary" }), " Edit Asset Details"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
							className: "text-xs",
							children: [
								"Update specification, category, valuation, serials, and condition for ",
								editingAsset?.asset_name,
								"."
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Asset Name *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs",
											value: editForm.asset_name,
											onChange: (e) => setEditForm((f) => ({
												...f,
												asset_name: e.target.value
											}))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Category *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: editForm.category,
											onValueChange: (v) => setEditForm((f) => ({
												...f,
												category: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
												"Furniture",
												"Appliances",
												"Electronics",
												"Plant & Machinery",
												"Vehicles",
												"Office Equipment",
												"Fixtures & Fittings",
												"Building Improvement",
												"Other"
											].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: c,
												children: c
											}, c)) })]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Asset Tag / Barcode"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs font-mono",
											value: editForm.asset_code,
											onChange: (e) => setEditForm((f) => ({
												...f,
												asset_code: e.target.value
											}))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Serial Number"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs font-mono",
											value: editForm.serial_number,
											onChange: (e) => setEditForm((f) => ({
												...f,
												serial_number: e.target.value
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-3 gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Purchase Value (QAR)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												className: "h-8 text-xs font-mono",
												value: editForm.purchase_cost,
												onChange: (e) => setEditForm((f) => ({
													...f,
													purchase_cost: e.target.value
												}))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Commission Date"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "date",
												className: "h-8 text-xs",
												value: editForm.purchase_date,
												onChange: (e) => setEditForm((f) => ({
													...f,
													purchase_date: e.target.value
												}))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs font-semibold",
												children: "Useful Life (Months)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												className: "h-8 text-xs",
												value: editForm.life_of_asset,
												onChange: (e) => setEditForm((f) => ({
													...f,
													life_of_asset: e.target.value
												}))
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Depreciation Method / Brand"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs",
											value: editForm.brand,
											onChange: (e) => setEditForm((f) => ({
												...f,
												brand: e.target.value
											}))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Supplier / Vendor"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs",
											value: editForm.supplier,
											onChange: (e) => setEditForm((f) => ({
												...f,
												supplier: e.target.value
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Asset Condition"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: editForm.asset_condition,
											onValueChange: (v) => setEditForm((f) => ({
												...f,
												asset_condition: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
												"New",
												"Good",
												"Minor Wear",
												"Needs Repair",
												"Fair"
											].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: c,
												children: c
											}, c)) })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Specifications / Description"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs",
											placeholder: "Dimensions, model details...",
											value: editForm.description,
											onChange: (e) => setEditForm((f) => ({
												...f,
												description: e.target.value
											}))
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setEditingAsset(null),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: saving,
							onClick: handleEditAssetSubmit,
							className: "bg-primary hover:bg-primary/90 text-white min-w-[100px]",
							children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1" }) : null, " Save Changes"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!selectedAssetForDetail,
				onOpenChange: (open) => !open && setSelectedAssetForDetail(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					className: "max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden rounded-xl",
					children: selectedAssetForDetail && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, {
							className: "p-5 pb-3 border-b bg-gradient-to-r from-muted/60 via-background to-muted/40 shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
										className: "text-lg font-bold",
										children: selectedAssetForDetail.asset_name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: `text-xs ${getAssetStatus(selectedAssetForDetail).badgeClass}`,
										children: getAssetStatus(selectedAssetForDetail).label
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
									className: "text-xs font-mono mt-0.5 flex items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Tag: ", selectedAssetForDetail.asset_code] }),
										selectedAssetForDetail.serial_number && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["• SN: ", selectedAssetForDetail.serial_number] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["• Category: ", selectedAssetForDetail.category || "Fixed Asset"] })
									]
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										className: "h-8 gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10",
										onClick: () => openEditAssetModal(selectedAssetForDetail),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" }), " Edit Details"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										className: "h-8 gap-1.5 text-xs font-mono",
										onClick: () => setPrintBarcode(selectedAssetForDetail.asset_code || ""),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Printer, { className: "h-3.5 w-3.5" }), " Print QR / Tag"]
									})]
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 overflow-y-auto p-5 space-y-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 sm:grid-cols-4 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 rounded-lg border bg-card/60",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground uppercase font-bold tracking-wider",
											children: "Purchase Cost"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm font-bold font-mono text-foreground mt-0.5",
											children: ["QAR ", Number(selectedAssetForDetail.purchase_cost || 0).toLocaleString()]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 rounded-lg border bg-card/60",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground uppercase font-bold tracking-wider",
											children: "Useful Life"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-bold text-foreground mt-0.5",
											children: selectedAssetForDetail.life_of_asset ? `${(selectedAssetForDetail.life_of_asset / 12).toFixed(1)} Years` : "5.0 Years"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 rounded-lg border bg-card/60",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground uppercase font-bold tracking-wider",
											children: "Current Location"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: `text-sm font-semibold mt-0.5 truncate ${selectedAssetForDetail.assigned_property_code === "Corporate Office" ? "text-indigo-600" : "text-blue-600"}`,
											children: selectedAssetForDetail.assigned_property_code === "Corporate Office" ? "Corporate Office (HQ)" : selectedAssetForDetail.assigned_property_code || selectedAssetForDetail.properties?.title || "Central Inventory Pool"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3 rounded-lg border bg-card/60",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-[10px] text-muted-foreground uppercase font-bold tracking-wider",
											children: selectedAssetForDetail.assigned_property_code === "Corporate Office" ? "Staff Custodian & Space" : "Assigned Unit / User"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm font-semibold text-foreground mt-0.5 truncate",
											children: selectedAssetForDetail.assigned_property_code === "Corporate Office" ? selectedAssetForDetail.assigned_employee_name ? `${selectedAssetForDetail.assigned_employee_name}${selectedAssetForDetail.assigned_unit_code ? ` (${selectedAssetForDetail.assigned_unit_code})` : ""}` : "Corporate Staff" : selectedAssetForDetail.assigned_unit_code ? `Unit ${selectedAssetForDetail.assigned_unit_code}` : selectedAssetForDetail.assigned_employee_name || "— Unassigned —"
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
								defaultValue: "history",
								className: "w-full",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
										className: "grid grid-cols-5 h-9",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
												value: "history",
												className: "text-xs gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "h-3 w-3" }), " Allocations"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
												value: "warranty",
												className: "text-xs gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3 w-3" }), " Warranty & AMC"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
												value: "maintenance",
												className: "text-xs gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3 w-3" }), " Maintenance"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
												value: "financials",
												className: "text-xs gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3 w-3" }), " Financials"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
												value: "specs",
												className: "text-xs gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-3 w-3" }), " Specs"]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
										value: "history",
										className: "space-y-3 pt-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border p-4 bg-muted/20",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
												className: "text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "h-3.5 w-3.5 text-primary" }), " Lifecycle Movement & Custody Trail"]
											}), assetDetailHistory?.allocations.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-center py-8 text-muted-foreground",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRightLeft, { className: "mx-auto h-6 w-6 mb-1 opacity-40" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs",
														children: "No movements recorded yet."
													}),
													getAssetStatus(selectedAssetForDetail).isAllocated && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-[11px] text-primary mt-1",
														children: [
															"Currently deployed to: ",
															selectedAssetForDetail.assigned_property_code || "Property",
															" ",
															selectedAssetForDetail.assigned_unit_code ? `(Unit ${selectedAssetForDetail.assigned_unit_code})` : ""
														]
													})
												]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "space-y-3",
												children: assetDetailHistory?.allocations.map((al) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-start gap-3 p-2.5 rounded border bg-card text-xs",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
														className: "p-1.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold shrink-0",
														children: al.action_type
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex-1 space-y-0.5",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex justify-between items-center",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "font-semibold text-foreground",
																	children: al.action_type === "ALLOCATION" ? `Allocated to ${al.to_property}` : al.action_type === "DEALLOCATION" ? `Deallocated back to inventory` : `Transferred: ${al.from_property} → ${al.to_property}`
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "text-[11px] font-mono text-muted-foreground",
																	children: formatDDMMMYYYY(al.date)
																})]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																className: "text-muted-foreground text-[11px]",
																children: [
																	al.to_unit && `Unit: ${al.to_unit} • `,
																	al.to_employee && `Recipient: ${al.to_employee} • `,
																	"Condition: ",
																	al.condition || "Good"
																]
															}),
															al.remarks && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																className: "text-xs italic text-muted-foreground mt-1",
																children: [
																	"\"",
																	al.remarks,
																	"\""
																]
															})
														]
													})]
												}, al.id))
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
										value: "warranty",
										className: "space-y-3 pt-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border p-4 bg-muted/20 space-y-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
													className: "text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-indigo-500" }), " Active Warranty Policy & Terms"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													size: "sm",
													variant: "outline",
													className: "h-7 text-xs gap-1 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10",
													onClick: () => openWarrantyModal(selectedAssetForDetail, assetDetailHistory?.warranty || void 0),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3 w-3" }), " Update Warranty"]
												})]
											}), assetDetailHistory?.warranty ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-3 text-xs",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "grid grid-cols-3 gap-3",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "p-2.5 rounded bg-card border",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] text-muted-foreground uppercase font-bold",
																		children: "Policy Type"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																		className: "font-semibold text-foreground mt-0.5",
																		children: assetDetailHistory.warranty.warranty_type
																	}),
																	assetDetailHistory.warranty.policy_number && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																		className: "text-[10px] font-mono text-muted-foreground",
																		children: ["#", assetDetailHistory.warranty.policy_number]
																	})
																]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "p-2.5 rounded bg-card border",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] text-muted-foreground uppercase font-bold",
																		children: "Provider / Vendor"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																		className: "font-semibold text-foreground mt-0.5",
																		children: assetDetailHistory.warranty.provider_name
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																		className: "text-[10px] text-muted-foreground",
																		children: assetDetailHistory.warranty.support_phone || "Support on record"
																	})
																]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "p-2.5 rounded bg-card border",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] text-muted-foreground uppercase font-bold",
																		children: "Valid Until"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																		className: "font-mono font-bold text-foreground mt-0.5",
																		children: formatDDMMMYYYY(assetDetailHistory.warranty.expiry_date)
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																		variant: "outline",
																		className: "text-[9px] mt-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/30 font-mono",
																		children: assetDetailHistory.warranty.status
																	})
																]
															})
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-3 rounded bg-card border",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground font-bold uppercase",
															children: "Coverage Scope & Terms:"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-foreground mt-1",
															children: assetDetailHistory.warranty.coverage_scope
														})]
													}),
													assetDetailHistory.warranty.documents && assetDetailHistory.warranty.documents.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-[10px] text-muted-foreground font-bold uppercase",
															children: "Attached Proof Documents:"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "flex flex-wrap gap-2",
															children: assetDetailHistory.warranty.documents.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center gap-1.5 p-1.5 px-2.5 rounded border bg-card text-xs",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5 text-emerald-600" }),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "font-medium text-foreground",
																		children: d.name
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																		className: "text-[10px] text-muted-foreground font-mono",
																		children: [
																			"(",
																			d.file_name,
																			")"
																		]
																	})
																]
															}, d.id))
														})]
													})
												]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-center py-8 text-muted-foreground",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "mx-auto h-6 w-6 mb-1 opacity-40" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs",
														children: "No warranty policy registered for this asset."
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														size: "sm",
														variant: "outline",
														className: "h-7 text-xs mt-2 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10",
														onClick: () => openWarrantyModal(selectedAssetForDetail),
														children: "Register Warranty Now"
													})
												]
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
										value: "maintenance",
										className: "space-y-3 pt-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border p-4 bg-muted/20",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
												className: "text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-3.5 w-3.5 text-amber-500" }), " Maintenance & Repair Work Orders"]
											}), assetDetailHistory?.maintenances.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-center py-8 text-muted-foreground",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "mx-auto h-6 w-6 mb-1 opacity-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs",
													children: "No maintenance work orders logged for this asset."
												})]
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "space-y-2.5",
												children: assetDetailHistory?.maintenances.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3 rounded border bg-card flex items-center justify-between gap-3 text-xs",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center gap-2",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: "font-mono font-bold text-foreground",
																	children: m.id
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	variant: "outline",
																	className: "text-[10px]",
																	children: m.maintenance_type
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	variant: "outline",
																	className: "text-[10px] font-mono text-amber-600 bg-amber-500/10 border-amber-500/30",
																	children: m.status
																})
															]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "text-[11px] text-muted-foreground mt-1",
															children: [
																"Vendor: ",
																m.service_vendor,
																" ",
																m.technician_name && `• Tech: ${m.technician_name}`,
																" • Scheduled: ",
																formatDDMMMYYYY(m.scheduled_date)
															]
														}),
														m.completion_notes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
															className: "text-[11px] text-emerald-600 mt-0.5",
															children: ["Notes: ", m.completion_notes]
														})
													] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "text-right font-mono font-bold",
														children: ["QAR ", (m.actual_cost || m.estimated_cost || 0).toLocaleString()]
													})]
												}, m.id))
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
										value: "financials",
										className: "space-y-3 pt-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border p-4 bg-muted/20 space-y-4",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
													className: "text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3.5 w-3.5 text-emerald-500" }), " Book Value & Depreciation Profile"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-3 gap-3 text-xs",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "p-2.5 rounded bg-card border",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-[10px] text-muted-foreground",
																children: "Original Cost"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
																className: "font-mono font-bold text-foreground",
																children: ["QAR ", Number(selectedAssetForDetail.purchase_cost || 0).toLocaleString()]
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "p-2.5 rounded bg-card border",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-[10px] text-muted-foreground",
																children: "Depreciation Method"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "font-medium text-foreground",
																children: selectedAssetForDetail.brand || "Straight Line Method (SLM)"
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "p-2.5 rounded bg-card border",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-[10px] text-muted-foreground",
																children: "Commission Date"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "font-mono text-foreground",
																children: formatDDMMMYYYY(selectedAssetForDetail.purchase_date)
															})]
														})
													]
												}),
												assetDetailHistory?.revaluations && assetDetailHistory.revaluations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "mt-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h5", {
														className: "text-[11px] font-bold text-foreground mb-1.5",
														children: "Revaluation Adjustments"
													}), assetDetailHistory.revaluations.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "p-2 rounded bg-card border flex justify-between text-xs font-mono",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
															formatDDMMMYYYY(r.date),
															": QAR ",
															r.prev_value.toLocaleString(),
															" → QAR ",
															r.new_value.toLocaleString()
														] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "text-muted-foreground",
															children: [
																"(",
																r.reason,
																")"
															]
														})]
													}, r.id))]
												}),
												assetDetailHistory?.sale && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-bold text-emerald-700 dark:text-emerald-300",
														children: "Disposal via Sale"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-[11px] mt-0.5",
														children: [
															"Sold to ",
															assetDetailHistory.sale.buyer,
															" on ",
															formatDDMMMYYYY(assetDetailHistory.sale.date),
															" for ",
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: ["QAR ", assetDetailHistory.sale.sale_value.toLocaleString()] }),
															"."
														]
													})]
												}),
												assetDetailHistory?.writeoff && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-xs",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-bold text-red-700 dark:text-red-300",
														children: "Written Off & Scrapped"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "text-[11px] mt-0.5",
														children: [
															"Decommissioned on ",
															formatDDMMMYYYY(assetDetailHistory.writeoff.date),
															". Reason: ",
															assetDetailHistory.writeoff.writeoff_reason,
															". Approved by: ",
															assetDetailHistory.writeoff.approved_by || "Management",
															"."
														]
													})]
												})
											]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
										value: "specs",
										className: "space-y-3 pt-3",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border p-4 bg-muted/20 space-y-3 text-xs",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
													className: "text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-3.5 w-3.5 text-blue-500" }), " Technical Data & Specifications"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-2 gap-2 text-xs",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Asset ID: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-mono text-foreground",
															children: selectedAssetForDetail.id
														})] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Category: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-foreground",
															children: selectedAssetForDetail.category || "Fixed Asset"
														})] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Serial Number: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-mono text-foreground",
															children: selectedAssetForDetail.serial_number || "N/A"
														})] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Condition: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-foreground",
															children: selectedAssetForDetail.asset_condition || "Good"
														})] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Supplier / Vendor: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-foreground",
															children: selectedAssetForDetail.supplier || "—"
														})] }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: ["Barcode: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-mono text-foreground",
															children: selectedAssetForDetail.asset_code
														})] })
													]
												}),
												selectedAssetForDetail.description && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-2.5 rounded bg-card border mt-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground font-semibold",
														children: "Notes / Description:"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "mt-1 text-foreground",
														children: selectedAssetForDetail.description
													})]
												})
											]
										})
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, {
							className: "p-3 border-t bg-muted/20 shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								variant: "outline",
								onClick: () => setSelectedAssetForDetail(null),
								children: "Close"
							})
						})
					] })
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showNew,
				onOpenChange: setShowNew,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-3xl max-h-[92vh] flex flex-col p-0 overflow-hidden",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "p-5 pb-3 border-b bg-gradient-to-r from-muted/60 via-background to-muted/40 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
									className: "text-lg font-bold flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Package, { className: "h-5 w-5 text-primary" }), " Register New Fixed Asset"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
									className: "text-xs mt-0.5",
									children: "Complete asset details, finance general ledger setup, warranty terms, and document attachments."
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: "outline",
									className: "text-xs font-mono bg-primary/10 text-primary border-primary/20",
									children: [
										"Step ",
										stepperStep,
										" of 4"
									]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-4 gap-2 pt-3",
								children: [
									{
										step: 1,
										label: "Asset & Finance GL",
										icon: DollarSign
									},
									{
										step: 2,
										label: "Warranty & SLA",
										icon: ShieldCheck
									},
									{
										step: 3,
										label: "Documents & Invoices",
										icon: Paperclip
									},
									{
										step: 4,
										label: "Specifications & Review",
										icon: Layers
									}
								].map((s) => {
									s.icon;
									const isActive = stepperStep === s.step;
									const isDone = stepperStep > s.step;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setStepperStep(s.step),
										className: `flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-all border ${isActive ? "bg-primary text-white border-primary shadow-sm font-semibold" : isDone ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted"}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: `h-5 w-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${isActive ? "bg-white text-primary" : isDone ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`,
											children: isDone ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3 w-3" }) : s.step
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate text-[11px]",
											children: s.label
										})]
									}, s.step);
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 overflow-y-auto p-5 space-y-4 text-xs",
							children: [
								stepperStep === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-3 gap-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Asset / Item Name *"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														className: "h-8 text-xs",
														placeholder: "e.g. Executive Wooden Conference Table",
														value: form.item_name,
														onChange: (e) => setForm((f) => ({
															...f,
															item_name: e.target.value
														}))
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Category *"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: form.category,
														onValueChange: (v) => {
															setForm((f) => ({
																...f,
																category: v,
																subcategory: ""
															}));
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "h-8 text-xs bg-background",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: Array.from(new Set([
															...assetCategoriesList.map((c) => c.name),
															"Furniture",
															"Appliances",
															"Electronics",
															"Plant & Machinery",
															"Vehicles",
															"Office Equipment",
															"Fixtures & Fittings",
															"Building Improvement",
															"Other"
														])).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: c,
															children: c
														}, c)) })]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "SubCategory"
													}), (() => {
														const matchedCat = assetCategoriesList.find((c) => c.name.toLowerCase() === form.category.toLowerCase());
														const filteredSubcategories = matchedCat ? assetSubcategoriesList.filter((sc) => sc.category_id === matchedCat.id) : assetSubcategoriesList;
														return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
															value: form.subcategory || void 0,
															onValueChange: (v) => setForm((f) => ({
																...f,
																subcategory: v
															})),
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
																className: "h-8 text-xs bg-background",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select subcategory..." })
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: filteredSubcategories.length > 0 ? filteredSubcategories.map((sc) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: sc.name,
																children: sc.name
															}, sc.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "General / Standard",
																	children: "General / Standard"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Split AC",
																	children: "Split AC"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Office Table",
																	children: "Office Table"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Executive Chair",
																	children: "Executive Chair"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Refrigerator",
																	children: "Refrigerator"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Water Heater",
																	children: "Water Heater"
																})
															] }) })]
														});
													})()]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-3 gap-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Asset Tag / Barcode Code"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														className: "h-8 text-xs font-mono",
														placeholder: "e.g. AST-0820 (Auto if blank)",
														value: form.asset_tag_id,
														onChange: (e) => setForm((f) => ({
															...f,
															asset_tag_id: e.target.value
														}))
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Serial Number"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														className: "h-8 text-xs font-mono",
														placeholder: "e.g. SN-98234-LG",
														value: form.serial_number,
														onChange: (e) => setForm((f) => ({
															...f,
															serial_number: e.target.value
														}))
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Supplier / Vendor"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: form.vendor_id,
														onValueChange: (v) => setForm((f) => ({
															...f,
															vendor_id: v
														})),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "h-8 text-xs bg-background",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select supplier..." })
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: vendors.map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: v.id,
															children: v.name
														}, v.id)) })]
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-4 gap-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Acquisition / Purchase Cost (QAR) *"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														className: "h-8 text-xs font-mono",
														placeholder: "0.00",
														value: form.acquisition_amount,
														onChange: (e) => setForm((f) => ({
															...f,
															acquisition_amount: e.target.value
														}))
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Depreciation Method"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: form.depreciation_method,
														onValueChange: (v) => {
															setForm((f) => ({
																...f,
																depreciation_method: v,
																depreciation_rate: v === "None" ? "0" : f.depreciation_rate === "0" ? "20" : f.depreciation_rate
															}));
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "h-8 text-xs bg-background",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Straight Line Method (SLM)",
																children: "Straight Line (SLM)"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Written Down Value (WDV)",
																children: "Written Down Value (WDV)"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "None",
																children: "None / No Depreciation"
															})
														] })]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Depreciation Rate (%)"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														className: `h-8 text-xs font-mono ${form.depreciation_method === "None" ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed" : ""}`,
														placeholder: "e.g. 20",
														disabled: form.depreciation_method === "None",
														value: form.depreciation_method === "None" ? "0" : form.depreciation_rate,
														onChange: (e) => setForm((f) => ({
															...f,
															depreciation_rate: e.target.value
														}))
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Useful Life (Years)"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														className: `h-8 text-xs font-mono ${form.depreciation_method === "None" ? "bg-muted text-muted-foreground opacity-60 cursor-not-allowed" : ""}`,
														disabled: form.depreciation_method === "None",
														value: form.useful_life_years,
														onChange: (e) => setForm((f) => ({
															...f,
															useful_life_years: e.target.value
														}))
													})]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Commission / Purchase Date"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "date",
													className: "h-8 text-xs",
													value: form.commission_date,
													onChange: (e) => setForm((f) => ({
														...f,
														commission_date: e.target.value
													}))
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Put To Use Date"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "date",
													className: "h-8 text-xs",
													value: form.put_to_use_date,
													onChange: (e) => setForm((f) => ({
														...f,
														put_to_use_date: e.target.value
													}))
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "p-3.5 rounded-lg border bg-muted/20 space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center justify-between",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
													className: "text-xs font-bold text-foreground flex items-center gap-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-3.5 w-3.5 text-emerald-600" }), " General Ledger Accounting Postings (Automated)"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
													variant: "outline",
													className: "text-[10px] font-mono text-emerald-600 border-emerald-500/30",
													children: ["Balance: QAR ", Number(form.acquisition_amount || 0).toLocaleString()]
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between p-2 rounded bg-card border text-xs",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono text-muted-foreground",
														children: "Dr: 12300001 - Fixed Asset (Capital Cost / Asset A/C)"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-mono font-bold text-emerald-600",
														children: ["QAR ", Number(form.acquisition_amount || 0).toLocaleString()]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between p-2 rounded bg-card border text-xs",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "font-mono text-muted-foreground",
														children: "Cr: 22100001 - Trade Payables (Vendors / Supplier A/C)"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "font-mono font-bold text-emerald-600",
														children: ["QAR ", Number(form.acquisition_amount || 0).toLocaleString()]
													})]
												})]
											})]
										})
									]
								}),
								stepperStep === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between p-3 rounded-lg border bg-muted/20",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-bold text-foreground text-xs",
											children: "Register Warranty & Maintenance Terms"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground",
											children: "Enable to track manufacturer warranty, SLA coverage, and renewal dates."
										})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											type: "checkbox",
											className: "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer",
											checked: form.has_warranty,
											onChange: (e) => setForm((f) => ({
												...f,
												has_warranty: e.target.checked
											}))
										})]
									}), form.has_warranty && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-3 p-3.5 rounded-lg border bg-card",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Warranty Policy Type *"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: form.warranty_type,
														onValueChange: (v) => setForm((f) => ({
															...f,
															warranty_type: v
														})),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "h-8 text-xs bg-background",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Standard Manufacturer",
																children: "Standard Manufacturer Warranty"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Extended Warranty",
																children: "Extended Warranty"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Annual Maintenance Contract (AMC)",
																children: "Annual Maintenance Contract (AMC)"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Comprehensive SLA",
																children: "Comprehensive SLA"
															})
														] })]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Warranty / Service Provider *"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: form.warranty_provider,
														onValueChange: (v) => {
															const selectedVendor = vendors.find((vnd) => vnd.name === v || vnd.id === v);
															setForm((f) => ({
																...f,
																warranty_provider: selectedVendor ? selectedVendor.name : v,
																warranty_support_email: selectedVendor?.email || f.warranty_support_email,
																warranty_support_phone: selectedVendor?.phone || f.warranty_support_phone
															}));
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "h-8 text-xs bg-background",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select warranty / service vendor..." })
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
															vendors.map((vnd) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
																value: vnd.name,
																children: [
																	vnd.name,
																	" ",
																	vnd.vendor_type ? `(${vnd.vendor_type})` : ""
																]
															}, vnd.id)),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Al-Futtaim Technologies",
																children: "Al-Futtaim Technologies"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "LG Electronics Gulf",
																children: "LG Electronics Gulf"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Daikin Air Conditioning",
																children: "Daikin Air Conditioning"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Otis Elevator Company",
																children: "Otis Elevator Company"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "Schneider Electric QA",
																children: "Schneider Electric QA"
															})
														] })]
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "Policy / Contract No."
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															className: "h-8 text-xs font-mono",
															placeholder: "e.g. POL-QA-2026-9021",
															value: form.warranty_policy_no,
															onChange: (e) => setForm((f) => ({
																...f,
																warranty_policy_no: e.target.value
															}))
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "Warranty Start Date"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "date",
															className: "h-8 text-xs",
															value: form.warranty_start_date,
															onChange: (e) => setForm((f) => ({
																...f,
																warranty_start_date: e.target.value
															}))
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "Duration (Months)"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															className: "h-8 text-xs font-mono",
															value: form.warranty_duration_months,
															onChange: (e) => setForm((f) => ({
																...f,
																warranty_duration_months: e.target.value
															}))
														})]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Support Contact Email"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "email",
														className: "h-8 text-xs",
														placeholder: "service@provider.qa",
														value: form.warranty_support_email,
														onChange: (e) => setForm((f) => ({
															...f,
															warranty_support_email: e.target.value
														}))
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Support Helpline Phone"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														className: "h-8 text-xs",
														placeholder: "+974 4400 0000",
														value: form.warranty_support_phone,
														onChange: (e) => setForm((f) => ({
															...f,
															warranty_support_phone: e.target.value
														}))
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs font-semibold",
													children: "Coverage Terms & Inclusions"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
													className: "text-xs",
													rows: 2,
													value: form.warranty_coverage,
													onChange: (e) => setForm((f) => ({
														...f,
														warranty_coverage: e.target.value
													}))
												})]
											})
										]
									})]
								}),
								stepperStep === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3.5 rounded-lg border bg-muted/20 space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center justify-between",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
													className: "font-bold text-foreground text-xs flex items-center gap-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "h-4 w-4 text-primary" }), " Attach Invoices, Warranty Cards & Manuals"]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[11px] text-muted-foreground mt-0.5",
													children: "Upload supporting documentation for compliance and warranty claims."
												})] })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														className: "h-8 text-xs col-span-1",
														placeholder: "Doc Name (e.g. Invoice / Warranty Card)",
														value: form.doc_input_name,
														onChange: (e) => setForm((f) => ({
															...f,
															doc_input_name: e.target.value
														}))
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "file",
														className: "h-8 text-xs col-span-1 bg-background",
														onChange: (e) => {
															const f = e.target.files?.[0];
															if (f) setForm((prev) => ({
																...prev,
																doc_input_file: f.name,
																doc_input_name: prev.doc_input_name || f.name.replace(/\.[^/.]+$/, "")
															}));
														}
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														type: "button",
														size: "sm",
														variant: "outline",
														disabled: !form.doc_input_file,
														className: `h-8 text-xs gap-1 border-primary/30 ${!form.doc_input_file ? "opacity-50 cursor-not-allowed" : "text-primary hover:bg-primary/10"}`,
														onClick: () => {
															if (!form.doc_input_file) return toast.error("Please select a file to attach.");
															if (!form.doc_input_name.trim()) return toast.error("Please enter a document title.");
															const docName = form.doc_input_name.trim();
															const fileName = form.doc_input_file;
															setForm((prev) => ({
																...prev,
																documents: [...prev.documents, {
																	id: `doc-${Date.now()}`,
																	name: docName,
																	file_name: fileName,
																	upload_date: getTodayIST()
																}],
																doc_input_name: "",
																doc_input_file: ""
															}));
															toast.success(`Document "${docName}" attached.`);
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "h-3 w-3" }), " Attach File"]
													})
												]
											}),
											form.documents.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "space-y-1.5 pt-2",
												children: form.documents.map((doc, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between p-2 rounded bg-card border text-xs",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-2",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileCheck, { className: "h-3.5 w-3.5 text-emerald-600" }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "font-semibold text-foreground",
																children: doc.name
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
																className: "text-[10px] font-mono text-muted-foreground",
																children: [
																	"(",
																	doc.file_name,
																	")"
																]
															})
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														type: "button",
														size: "icon",
														variant: "ghost",
														className: "h-5 w-5 text-destructive hover:bg-destructive/10",
														onClick: () => setForm((prev) => ({
															...prev,
															documents: prev.documents.filter((_, i) => i !== idx)
														})),
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
													})]
												}, doc.id))
											}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-center py-6 text-muted-foreground border border-dashed rounded-lg",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, { className: "mx-auto h-5 w-5 mb-1 opacity-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs",
													children: "No documents attached yet."
												})]
											})
										]
									})
								}),
								stepperStep === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3.5 rounded-lg border bg-muted/20 space-y-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
												className: "font-bold text-foreground text-xs flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "h-3.5 w-3.5 text-primary" }), " Technical Specifications"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														className: "h-8 text-xs",
														placeholder: "Property (e.g. Dimensions)",
														value: form.spec_type_input,
														onChange: (e) => setForm((f) => ({
															...f,
															spec_type_input: e.target.value
														}))
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														className: "h-8 text-xs",
														placeholder: "Value (e.g. 200cm x 100cm)",
														value: form.spec_details_input,
														onChange: (e) => setForm((f) => ({
															...f,
															spec_details_input: e.target.value
														}))
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
														type: "button",
														size: "sm",
														variant: "outline",
														className: "h-8 text-xs gap-1",
														onClick: () => {
															if (!form.spec_type_input.trim() || !form.spec_details_input.trim()) return toast.error("Enter specification key and value.");
															setForm((f) => ({
																...f,
																specifications: [...f.specifications, {
																	id: String(Date.now()),
																	spec_type: f.spec_type_input.trim(),
																	spec_details: f.spec_details_input.trim()
																}],
																spec_type_input: "",
																spec_details_input: ""
															}));
														},
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3 w-3" }), " Add Spec"]
													})
												]
											}),
											form.specifications.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "grid grid-cols-2 gap-2 pt-1",
												children: form.specifications.map((s, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between p-2 rounded bg-card border text-xs",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "font-semibold text-foreground",
															children: [s.spec_type, ":"]
														}),
														" ",
														s.spec_details
													] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														type: "button",
														onClick: () => setForm((f) => ({
															...f,
															specifications: f.specifications.filter((_, i) => i !== idx)
														})),
														className: "text-destructive hover:opacity-75",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
													})]
												}, s.id))
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "p-3.5 rounded-lg border bg-card space-y-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "font-bold text-foreground text-xs uppercase tracking-wider text-muted-foreground",
											children: "Registration Summary"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-2 rounded bg-muted/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground",
														children: "Asset Name"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "font-semibold truncate",
														children: form.item_name || "—"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-2 rounded bg-muted/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground",
														children: "Category"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "font-semibold",
														children: form.category
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-2 rounded bg-muted/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground",
														children: "Acquisition Cost"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "font-mono font-bold text-emerald-600",
														children: ["QAR ", Number(form.acquisition_amount || 0).toLocaleString()]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "p-2 rounded bg-muted/40",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "text-[10px] text-muted-foreground",
														children: "Warranty"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "font-semibold",
														children: form.has_warranty ? `${form.warranty_duration_months} Mos (${form.warranty_type})` : "None"
													})]
												})
											]
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "p-4 border-t bg-muted/20 shrink-0 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								disabled: stepperStep === 1,
								onClick: () => setStepperStep((s) => Math.max(1, s - 1)),
								children: "Previous"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => setShowNew(false),
									children: "Cancel"
								}), stepperStep < 4 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									className: "bg-primary text-white",
									onClick: () => {
										if (stepperStep === 1 && !form.item_name.trim()) return toast.error("Please enter Asset Name.");
										setStepperStep((s) => Math.min(4, s + 1));
									},
									children: "Next Step"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									disabled: saving,
									onClick: handleCreateAsset,
									className: "bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]",
									children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1" }) : null, " Complete & Capitalize"]
								})]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showNewMaintenance,
				onOpenChange: setShowNewMaintenance,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wrench, { className: "h-4 w-4 text-amber-500" }), " New Maintenance Work Order"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Log preventive maintenance, service ticket, or repair for unallocated available stock items."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Select Available Asset *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: maintForm.asset_id,
										onValueChange: (v) => setMaintForm((f) => ({
											...f,
											asset_id: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs bg-background",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select available unallocated asset..." })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: availableUnallocatedAssets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p-3 text-center text-xs text-muted-foreground",
											children: "No available unallocated assets found."
										}) : availableUnallocatedAssets.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: a.id,
											children: [
												a.asset_name,
												" (",
												a.asset_code || "No Code",
												") — Available in Stock"
											]
										}, a.id)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Maintenance Type *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: maintForm.maintenance_type,
											onValueChange: (v) => setMaintForm((f) => ({
												...f,
												maintenance_type: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
												"Preventive Maintenance",
												"Corrective Repair",
												"Calibration / Testing",
												"Inspection / Audit",
												"Major Overhaul"
											].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: t,
												children: t
											}, t)) })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Priority *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: maintForm.priority,
											onValueChange: (v) => setMaintForm((f) => ({
												...f,
												priority: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
												"Low",
												"Medium",
												"High",
												"Critical"
											].map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: p,
												children: p
											}, p)) })]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Service Vendor / Contractor"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs",
											placeholder: "e.g. In-House Facility Team / Al-Mana MEP",
											value: maintForm.service_vendor,
											onChange: (e) => setMaintForm((f) => ({
												...f,
												service_vendor: e.target.value
											}))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Technician Name"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs",
											placeholder: "e.g. Tariq Mahmoud",
											value: maintForm.technician_name,
											onChange: (e) => setMaintForm((f) => ({
												...f,
												technician_name: e.target.value
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Scheduled Date *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											className: "h-8 text-xs",
											value: maintForm.scheduled_date,
											onChange: (e) => setMaintForm((f) => ({
												...f,
												scheduled_date: e.target.value
											}))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Estimated Cost (QAR)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											className: "h-8 text-xs font-mono",
											value: maintForm.estimated_cost,
											onChange: (e) => setMaintForm((f) => ({
												...f,
												estimated_cost: e.target.value
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Work Order Description"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										className: "text-xs",
										rows: 2,
										placeholder: "Scope of service, fault reported, parts to inspect...",
										value: maintForm.description,
										onChange: (e) => setMaintForm((f) => ({
											...f,
											description: e.target.value
										}))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setShowNewMaintenance(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: saving,
							onClick: handleCreateMaintenance,
							className: "bg-amber-600 hover:bg-amber-700 text-white min-w-[120px]",
							children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1" }) : null, " Create Work Order"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!completeMaintModal,
				onOpenChange: (open) => !open && setCompleteMaintModal(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4 text-emerald-500" }),
								" Complete Work Order ",
								completeMaintModal?.id
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
							className: "text-xs",
							children: [
								"Record completion details and restore ",
								completeMaintModal?.asset_name,
								" to Available inventory."
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Actual Incurred Cost (QAR) *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											className: "h-8 text-xs font-mono",
											placeholder: String(completeMaintModal?.estimated_cost || 0),
											value: completeMaintForm.actual_cost,
											onChange: (e) => setCompleteMaintForm((f) => ({
												...f,
												actual_cost: e.target.value
											}))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Completion Date"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											className: "h-8 text-xs",
											value: completeMaintForm.completed_date,
											onChange: (e) => setCompleteMaintForm((f) => ({
												...f,
												completed_date: e.target.value
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Vendor Invoice / Reference No."
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-8 text-xs font-mono",
										placeholder: "e.g. INV-SVC-9921",
										value: completeMaintForm.invoice_ref,
										onChange: (e) => setCompleteMaintForm((f) => ({
											...f,
											invoice_ref: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Completion Notes / Work Carried Out"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										className: "text-xs",
										rows: 2,
										placeholder: "Summary of repair actions, filters replaced, oil changed...",
										value: completeMaintForm.completion_notes,
										onChange: (e) => setCompleteMaintForm((f) => ({
											...f,
											completion_notes: e.target.value
										}))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setCompleteMaintModal(null),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							onClick: handleCompleteMaintenance,
							className: "bg-emerald-600 hover:bg-emerald-700 text-white",
							children: "Complete & Restore Asset"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showRevaluation,
				onOpenChange: setShowRevaluation,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-4 w-4 text-purple-500" }), " Record Asset Revaluation"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Adjust carrying fair market value for unallocated assets. Surplus or impairment is posted to GL."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Select Available Asset *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: revalForm.asset_id,
										onValueChange: (v) => {
											const a = assets.find((x) => x.id === v);
											setRevalForm((f) => ({
												...f,
												asset_id: v,
												prev_value: a ? String(a.purchase_cost || 0) : ""
											}));
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs bg-background",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose unallocated asset..." })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: availableUnallocatedAssets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p-3 text-center text-xs text-muted-foreground",
											children: "No available unallocated assets."
										}) : availableUnallocatedAssets.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: a.id,
											children: [
												a.asset_name,
												" (",
												a.asset_code || "No Code",
												") — Book Val: QAR ",
												Number(a.purchase_cost || 0).toLocaleString()
											]
										}, a.id)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Previous Book Value (QAR)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs font-mono bg-muted",
											disabled: true,
											value: revalForm.prev_value
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "New Fair Value (QAR) *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											className: "h-8 text-xs font-mono font-bold text-purple-600",
											placeholder: "0.00",
											value: revalForm.new_value,
											onChange: (e) => setRevalForm((f) => ({
												...f,
												new_value: e.target.value
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Revaluation Date *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										className: "h-8 text-xs",
										value: revalForm.date,
										onChange: (e) => setRevalForm((f) => ({
											...f,
											date: e.target.value
										}))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Reason for Adjustment"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-8 text-xs",
										placeholder: "e.g. Annual market valuation, expert appraisal, tech obsolescence",
										value: revalForm.reason,
										onChange: (e) => setRevalForm((f) => ({
											...f,
											reason: e.target.value
										}))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setShowRevaluation(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: saving,
							onClick: handleCreateRevaluation,
							className: "bg-purple-600 hover:bg-purple-700 text-white min-w-[120px]",
							children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1" }) : null, " Post Revaluation"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showSell,
				onOpenChange: setShowSell,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DollarSign, { className: "h-4 w-4 text-emerald-500" }), " Record Asset Sale & Disposal"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Dispose of unallocated assets with automated Receipt Voucher generation and GL derecognition."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Select Available Asset *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: sellForm.asset_id,
										onValueChange: (v) => {
											const a = assets.find((x) => x.id === v);
											setSellForm((f) => ({
												...f,
												asset_id: v,
												book_value: a ? String(a.purchase_cost || 0) : ""
											}));
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs bg-background",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose unallocated asset..." })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: availableUnallocatedAssets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p-3 text-center text-xs text-muted-foreground",
											children: "No available unallocated assets."
										}) : availableUnallocatedAssets.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: a.id,
											children: [
												a.asset_name,
												" (",
												a.asset_code || "No Code",
												") — Book Val: QAR ",
												Number(a.purchase_cost || 0).toLocaleString()
											]
										}, a.id)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Book Value (QAR)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs font-mono bg-muted",
											disabled: true,
											value: sellForm.book_value
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Agreed Sale Price (QAR) *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											className: "h-8 text-xs font-mono font-bold text-emerald-600",
											placeholder: "0.00",
											value: sellForm.sale_value,
											onChange: (e) => setSellForm((f) => ({
												...f,
												sale_value: e.target.value
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Buyer Name / Entity *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs",
											placeholder: "e.g. Al-Diyar Trading LLC",
											value: sellForm.buyer,
											onChange: (e) => setSellForm((f) => ({
												...f,
												buyer: e.target.value
											}))
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Disposal Date *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											className: "h-8 text-xs",
											value: sellForm.date,
											onChange: (e) => setSellForm((f) => ({
												...f,
												date: e.target.value
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Remarks / Sales Invoice Ref"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-8 text-xs",
										placeholder: "e.g. Salvage disposal invoice #SINV-8021",
										value: sellForm.remarks,
										onChange: (e) => setSellForm((f) => ({
											...f,
											remarks: e.target.value
										}))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setShowSell(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: saving,
							onClick: handleCreateSell,
							className: "bg-emerald-600 hover:bg-emerald-700 text-white min-w-[120px]",
							children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1" }) : null, " Record Sale & Post GL"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showWriteoff,
				onOpenChange: setShowWriteoff,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4 text-red-500" }), " New Asset Write-Off & Scrapping"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "text-xs",
							children: "Decommission damaged or unserviceable assets. Derecognizes asset and posts write-off loss to GL."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 py-2 text-xs",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Select Available Asset *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: writeoffForm.asset_id,
										onValueChange: (v) => {
											const a = assets.find((x) => x.id === v);
											setWriteoffForm((f) => ({
												...f,
												asset_id: v,
												book_value: a ? String(a.purchase_cost || 0) : ""
											}));
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs bg-background",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose unallocated asset..." })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: availableUnallocatedAssets.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p-3 text-center text-xs text-muted-foreground",
											children: "No available unallocated assets."
										}) : availableUnallocatedAssets.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: a.id,
											children: [
												a.asset_name,
												" (",
												a.asset_code || "No Code",
												") — Book Val: QAR ",
												Number(a.purchase_cost || 0).toLocaleString()
											]
										}, a.id)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Carrying Value (QAR)"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											className: "h-8 text-xs font-mono bg-muted",
											disabled: true,
											value: writeoffForm.book_value
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Write-off Date *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											className: "h-8 text-xs",
											value: writeoffForm.date,
											onChange: (e) => setWriteoffForm((f) => ({
												...f,
												date: e.target.value
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Write-off Reason *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: writeoffForm.writeoff_reason,
										onValueChange: (v) => setWriteoffForm((f) => ({
											...f,
											writeoff_reason: v
										})),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											className: "h-8 text-xs bg-background",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select reason..." })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
											"Severe Water Damage",
											"Irreparable Hardware Failure",
											"Technical Obsolescence",
											"Lost / Stolen",
											"Scrapped after Lifespan Expiry",
											"Health & Safety Hazard"
										].map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: r,
											children: r
										}, r)) })]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Approved By (Authority)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										className: "h-8 text-xs",
										placeholder: "e.g. Asset Committee / GM",
										value: writeoffForm.approved_by,
										onChange: (e) => setWriteoffForm((f) => ({
											...f,
											approved_by: e.target.value
										}))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setShowWriteoff(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: saving,
							onClick: handleCreateWriteoff,
							className: "bg-red-600 hover:bg-red-700 text-white min-w-[120px]",
							children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1" }) : null, " Approve & Write Off"]
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: bulkAssetOpen,
				onOpenChange: setBulkAssetOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					className: "max-w-6xl max-h-[92vh] overflow-y-auto bg-card p-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExcelImportEmbedded, {
						module: "asset",
						title: "Fixed Assets: Excel Bulk Import & Management",
						description: "Production-grade Excel CREATE, UPDATE, and DELETE engine for HVAC, equipment, machinery, and fixtures.",
						onCompleted: () => {
							load();
						}
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: showDepreciationModal,
				onOpenChange: setShowDepreciationModal,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-lg",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendingUp, { className: "h-5 w-5 text-amber-500" }), selectedAssetForDepr ? `Post Depreciation: ${selectedAssetForDepr.asset_name}` : "Portfolio Periodic Depreciation Run"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Record periodic depreciation amortization charge and automatically post journal entry debiting Depreciation Expense (54100001) and crediting Accumulated Depreciation (12400001)." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5 py-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Fiscal Year *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: depreciationForm.fiscal_year,
											onValueChange: (v) => setDepreciationForm((f) => ({
												...f,
												fiscal_year: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "2024-2025",
													children: "FY 2024-2025"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "2025-2026",
													children: "FY 2025-2026"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "2026-2027",
													children: "FY 2026-2027"
												})
											] })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "GL Posting Date *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "date",
											className: "h-8 text-xs",
											value: depreciationForm.posting_date,
											onChange: (e) => setDepreciationForm((f) => ({
												...f,
												posting_date: e.target.value
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Depreciation Method"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: depreciationForm.depreciation_method,
											onValueChange: (v) => setDepreciationForm((f) => ({
												...f,
												depreciation_method: v
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												className: "h-8 text-xs bg-background",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Straight Line Method (SLM)",
												children: "Straight Line Method (SLM)"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "Written Down Value (WDV)",
												children: "Written Down Value (WDV)"
											})] })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs font-semibold",
											children: "Depreciation Charge (QAR) *"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											className: "h-8 text-xs font-mono font-bold text-amber-600",
											placeholder: "0.00",
											value: depreciationForm.charge_amount,
											onChange: (e) => setDepreciationForm((f) => ({
												...f,
												charge_amount: e.target.value
											}))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs font-semibold",
										children: "Journal Narration / Audit Memo"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										className: "text-xs h-18",
										placeholder: "Narration for General Ledger journal entry...",
										value: depreciationForm.remarks,
										onChange: (e) => setDepreciationForm((f) => ({
											...f,
											remarks: e.target.value
										}))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => setShowDepreciationModal(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: saving,
							onClick: handlePostDepreciation,
							className: "bg-amber-600 hover:bg-amber-700 text-white min-w-[130px]",
							children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin mr-1" }) : null, " Post GL Journal Entry"]
						})] })
					]
				})
			})
		]
	});
}
//#endregion
export { AssetManager };
