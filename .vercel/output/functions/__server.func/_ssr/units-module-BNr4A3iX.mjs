import { i as __toESM } from "../_runtime.mjs";
import { B as supabase, I as fetchUnits, K as updateUnit, L as fetchViewTypes, N as fetchRentFrequencies, P as fetchSecurityDepositTypes, S as fetchLeaseStatuses, _ as fetchFurnishingTypes, c as createUnit, f as fetchAllProperties, l as createUnitRooms, w as fetchMaintenanceResponsibilities } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { At as FileSpreadsheet, C as Snowflake, G as Plus, Lt as Droplets, Zt as CirclePlus, an as ChevronLeft, bn as BedDouble, ct as LoaderCircle, gn as Building2, h as TriangleAlert, in as ChevronRight, kt as FileText, n as X, s as Users, sn as Check, t as Zap, v as Trash2, vt as House, xn as Bath } from "../_libs/lucide-react.mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-BgKcOzjx.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { t as ExcelImportEmbedded } from "./excel-import-embedded-DS3u1z7Y.mjs";
import { n as useAppData } from "./app-data-context-Lw7cnnXe.mjs";
import { a as PaginationNext, i as PaginationLink, n as PaginationContent, o as PaginationPrevious, r as PaginationItem, t as Pagination } from "./pagination-Mm0k59kY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/units-module-BNr4A3iX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ROOM_TYPES = [
	"Bedroom",
	"Drawing Room",
	"Dining Room",
	"Bathroom",
	"Kitchen",
	"Balcony",
	"Lobby",
	"Living Room",
	"Study Room",
	"Storage Room",
	"Laundry",
	"Other"
];
var makeRoomEntry = (type = "Bedroom") => ({
	id: Math.random().toString(36).slice(2),
	room_type: type,
	name: "",
	count: 1,
	length: "",
	width: "",
	uom: "sqm",
	area: "",
	capacity: "",
	details: ""
});
var EMPTY_FORM = {
	property_id: "",
	unit_ref: "",
	unit_code: "",
	unit_cost_center_code: "",
	unit_name: "",
	room_type: "Apartment",
	unit_usage: "Residential",
	block_tower: "",
	floor: "",
	bedrooms: 1,
	bathrooms: 1,
	area: "",
	balcony_sqm: void 0,
	total_area_sqm: void 0,
	view_type: "",
	furnishing: "Fully Furnished",
	parking_slot_no: "",
	electricity_meter_no: "",
	water_meter_no: "",
	cooling_meter_no: "",
	max_adults: 2,
	max_children: 0,
	total_occupancy: 2,
	price: 0,
	weekend_price: void 0,
	holiday_price: void 0,
	cleaning_fee: 0,
	status: "Available",
	lease_status: "Vacant",
	rent_frequency: "Monthly",
	current_tenant: "",
	contract_no: "",
	contract_start_date: "",
	contract_end_date: "",
	current_rent: void 0,
	security_deposit_type: "",
	security_deposit_amount: void 0,
	maintenance_responsibility: "Property Manager",
	handover_date: "",
	documents_received: false,
	remarks: ""
};
var leaseStatusColors = {
	Leased: "bg-blue-100 text-blue-700",
	Vacant: "bg-green-100 text-green-700",
	"Renewal Due": "bg-amber-100 text-amber-700",
	"Notice Given": "bg-orange-100 text-orange-700",
	Expired: "bg-red-100 text-red-700",
	"Legal Case": "bg-red-200 text-red-800"
};
var fallbackOptions = {
	furnishing: [
		{
			id: "Fully Furnished",
			label: "Fully Furnished"
		},
		{
			id: "Semi Furnished",
			label: "Semi Furnished"
		},
		{
			id: "Unfurnished",
			label: "Unfurnished"
		}
	],
	leaseStatuses: [
		{
			id: "Vacant",
			label: "Vacant"
		},
		{
			id: "Leased",
			label: "Leased"
		},
		{
			id: "Renewal Due",
			label: "Renewal Due"
		},
		{
			id: "Notice Given",
			label: "Notice Given"
		},
		{
			id: "Expired",
			label: "Expired"
		},
		{
			id: "Legal Case",
			label: "Legal Case"
		}
	],
	rentFrequencies: [
		{
			id: "Monthly",
			label: "Monthly"
		},
		{
			id: "Quarterly",
			label: "Quarterly"
		},
		{
			id: "Semi-Annual",
			label: "Semi-Annual"
		},
		{
			id: "Yearly",
			label: "Yearly"
		}
	],
	maintenance: [
		{
			id: "Property Manager",
			label: "Property Manager"
		},
		{
			id: "Owner",
			label: "Owner"
		},
		{
			id: "Tenant",
			label: "Tenant"
		},
		{
			id: "Shared",
			label: "Shared"
		}
	],
	deposits: [
		{
			id: "Cash",
			label: "Cash"
		},
		{
			id: "PDC",
			label: "PDC"
		},
		{
			id: "Guarantee Cheque",
			label: "Guarantee Cheque"
		},
		{
			id: "Bank Guarantee",
			label: "Bank Guarantee"
		}
	],
	views: [
		{
			id: "Road View",
			label: "Road View"
		},
		{
			id: "City View",
			label: "City View"
		},
		{
			id: "Garden View",
			label: "Garden View"
		},
		{
			id: "Sea View",
			label: "Sea View"
		},
		{
			id: "Pool View",
			label: "Pool View"
		}
	]
};
function toNumberOrUndefined(value) {
	if (!value.trim()) return void 0;
	const numeric = Number(value);
	return Number.isFinite(numeric) ? numeric : void 0;
}
var STEPS = [
	{
		id: 1,
		name: "Identity & Property"
	},
	{
		id: 2,
		name: "Configuration"
	},
	{
		id: 3,
		name: "Lease & Financials"
	},
	{
		id: 4,
		name: "Room Dimensions"
	}
];
function UnitsModule({ role }) {
	const { leases: contextLeases } = useAppData();
	const [units, setUnits] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [step, setStep] = (0, import_react.useState)(1);
	const [editingUnitId, setEditingUnitId] = (0, import_react.useState)(null);
	const [form, setForm] = (0, import_react.useState)(EMPTY_FORM);
	const [rooms, setRooms] = (0, import_react.useState)([makeRoomEntry("Bedroom")]);
	const [properties, setProperties] = (0, import_react.useState)([]);
	const [filterStatus, setFilterStatus] = (0, import_react.useState)("all");
	const [filterProperty, setFilterProperty] = (0, import_react.useState)(() => {
		if (typeof window !== "undefined") return new URLSearchParams(window.location.search).get("property_id") || "all";
		return "all";
	});
	const [currentTab, setCurrentTab] = (0, import_react.useState)(() => {
		if (typeof window !== "undefined") return new URLSearchParams(window.location.search).get("property_id") ? "unit" : "property";
		return "property";
	});
	const [search, setSearch] = (0, import_react.useState)("");
	const [selectedUnit, setSelectedUnit] = (0, import_react.useState)(null);
	const [furnishingTypes, setFurnishingTypes] = (0, import_react.useState)([]);
	const [leaseStatuses, setLeaseStatuses] = (0, import_react.useState)([]);
	const [rentFrequencies, setRentFrequencies] = (0, import_react.useState)([]);
	const [maintenanceResp, setMaintenanceResp] = (0, import_react.useState)([]);
	const [depositTypes, setDepositTypes] = (0, import_react.useState)([]);
	const [viewTypes, setViewTypes] = (0, import_react.useState)([]);
	const [currentPage, setCurrentPage] = (0, import_react.useState)(1);
	const ITEMS_PER_PAGE = 20;
	const load = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const { data: { session } } = await supabase.auth.getSession();
			session?.user?.id;
			const [fur, ls, rf, mr, dt, vt] = await Promise.all([
				fetchFurnishingTypes(),
				fetchLeaseStatuses(),
				fetchRentFrequencies(),
				fetchMaintenanceResponsibilities(),
				fetchSecurityDepositTypes(),
				fetchViewTypes()
			]);
			const loadedProperties = await fetchAllProperties();
			const propertyIds = (loadedProperties || []).map((p) => p.id);
			const loadedUnits = await fetchUnits();
			const propMap = new Map((loadedProperties || []).map((p) => [p.id, p.title]));
			setUnits((loadedUnits || []).filter((unit) => propertyIds.includes(unit.property_id)).map((unit) => {
				const propTitle = propMap.get(unit.property_id) || "";
				const activeLease = (contextLeases || []).find((l) => (l.property?.toLowerCase() === propTitle.toLowerCase() || l.property?.toLowerCase().includes(propTitle.toLowerCase()) || propTitle.toLowerCase().includes(l.property?.toLowerCase())) && (l.unit?.toLowerCase() === unit.unit_ref?.toLowerCase() || l.unit?.toLowerCase() === unit.unit_name?.toLowerCase() || l.unit?.toLowerCase() === unit.unit_code?.toLowerCase()) && (l.status === "active" || l.status === "fully_signed" || l.status === "collection_completed"));
				if (activeLease) return {
					...unit,
					lease_status: "Occupied",
					status: "Occupied",
					current_tenant: activeLease.tenantName || unit.current_tenant,
					contract_start_date: activeLease.startDate || unit.contract_start_date,
					contract_end_date: activeLease.endDate || unit.contract_end_date,
					current_rent: activeLease.monthlyRent || unit.current_rent || unit.price
				};
				return unit;
			}));
			setProperties((loadedProperties || []).map((p) => ({
				id: p.id,
				title: p.title,
				property_code: p.property_code,
				cost_center_code: p.cost_center_code,
				cost_center_name: p.cost_center_name
			})));
			setFurnishingTypes(fur);
			setLeaseStatuses(ls);
			setRentFrequencies(rf);
			setMaintenanceResp(mr);
			setDepositTypes(dt);
			setViewTypes(vt);
		} catch (error) {
			console.error("Failed to load unit master data:", error);
		} finally {
			setLoading(false);
		}
	}, [role, contextLeases]);
	(0, import_react.useEffect)(() => {
		load();
	}, [load]);
	const setF = (key, value) => setForm((current) => ({
		...current,
		[key]: value
	}));
	const handlePropertyChange = (propertyId) => {
		const propCode = properties.find((p) => p.id === propertyId)?.property_code?.trim() || "";
		const unitRef = form.unit_ref || "";
		setForm((current) => ({
			...current,
			property_id: propertyId,
			unit_code: propCode && unitRef ? `${propCode}-${unitRef}` : unitRef
		}));
	};
	const handleUnitRefChange = (unitRef) => {
		const propCode = properties.find((p) => p.id === form.property_id)?.property_code?.trim() || "";
		setForm((current) => ({
			...current,
			unit_ref: unitRef,
			unit_code: propCode && unitRef ? `${propCode}-${unitRef}` : unitRef
		}));
	};
	const addRoom = (type) => {
		setRooms((prev) => [...prev, makeRoomEntry(type)]);
	};
	const removeRoom = (id) => {
		setRooms((prev) => prev.filter((r) => r.id !== id));
	};
	const updateRoom = (id, field, value) => {
		setRooms((prev) => prev.map((r) => {
			if (r.id !== id) return r;
			const updated = {
				...r,
				[field]: value
			};
			if (field === "length" || field === "width") {
				const l = parseFloat(String(updated.length));
				const w = parseFloat(String(updated.width));
				if (!isNaN(l) && !isNaN(w) && l > 0 && w > 0) updated.area = (l * w).toFixed(2);
			}
			return updated;
		}));
	};
	const handleEditUnit = (unit) => {
		setEditingUnitId(unit.id || null);
		setForm({
			...EMPTY_FORM,
			...unit
		});
		setStep(1);
		setOpen(true);
	};
	async function handleCreate() {
		if (!form.property_id || !form.unit_ref) return alert("Property and Unit Reference are required.");
		setSaving(true);
		try {
			const autoArea = rooms.reduce((sum, r) => {
				const a = parseFloat(r.area);
				return sum + (isNaN(a) ? 0 : a * r.count);
			}, 0);
			const DATE_FIELDS = [
				"contract_start_date",
				"contract_end_date",
				"handover_date"
			];
			const sanitizedPayload = {
				...form,
				area: autoArea > 0 ? String(autoArea.toFixed(2)) : form.area || null,
				balcony_sqm: typeof form.balcony_sqm === "number" && Number.isNaN(form.balcony_sqm) ? null : form.balcony_sqm ?? null,
				total_area_sqm: typeof form.total_area_sqm === "number" && Number.isNaN(form.total_area_sqm) ? null : form.total_area_sqm ?? null
			};
			DATE_FIELDS.forEach((f) => {
				if (!sanitizedPayload[f]) sanitizedPayload[f] = null;
			});
			[
				"current_tenant",
				"contract_no",
				"security_deposit_type",
				"block_tower",
				"floor",
				"view_type",
				"parking_slot_no",
				"electricity_meter_no",
				"water_meter_no",
				"cooling_meter_no",
				"remarks"
			].forEach((f) => {
				if (sanitizedPayload[f] === "") sanitizedPayload[f] = null;
			});
			if (editingUnitId) await updateUnit(editingUnitId, sanitizedPayload);
			else {
				const created = await createUnit(sanitizedPayload);
				if (created?.id) try {
					const unitLabel = form.unit_name || form.unit_ref || created.id.slice(0, 6);
					const unitCcCode = `CC-UNIT-${created.id.slice(0, 8).toUpperCase()}`;
					const unitCcName = `Unit ${unitLabel} Cost Center`;
					await supabase.from("fin_cost_centers").upsert({
						code: unitCcCode,
						name: unitCcName,
						manager: ""
					}, { onConflict: "code" });
					await updateUnit(created.id, { unit_cost_center_code: unitCcCode });
				} catch (ccErr) {
					console.warn("Auto-create unit cost center skipped/failed:", ccErr);
				}
				const validRooms = rooms.filter((r) => r.room_type && r.count > 0);
				if (validRooms.length > 0 && created?.id) await createUnitRooms(validRooms.flatMap((r) => Array.from({ length: r.count }).map((_, i) => ({
					unit_id: created.id,
					room_type: r.room_type,
					name: r.name || `${r.room_type}${r.count > 1 ? ` ${i + 1}` : ""}`,
					length: r.length ? parseFloat(r.length) : null,
					width: r.width ? parseFloat(r.width) : null,
					area: r.area ? parseFloat(r.area) : r.length && r.width ? parseFloat(r.length) * parseFloat(r.width) : null,
					capacity: r.capacity ? parseInt(r.capacity) : null,
					details: r.details ? { notes: r.details } : null
				}))));
			}
			setOpen(false);
			setForm(EMPTY_FORM);
			setEditingUnitId(null);
			setRooms([makeRoomEntry("Bedroom")]);
			setStep(1);
			await load();
		} catch (error) {
			console.error(error);
			alert(`Failed to create unit: ${error.message}`);
		} finally {
			setSaving(false);
		}
	}
	const today = /* @__PURE__ */ new Date();
	today.setHours(0, 0, 0, 0);
	const in60Days = new Date(today);
	in60Days.setDate(in60Days.getDate() + 60);
	const filtered = units.filter((unit) => {
		let matchStatus;
		const isVacant = unit.status?.toLowerCase() === "available" || unit.lease_status?.toLowerCase() === "vacant";
		if (filterStatus === "all") matchStatus = true;
		else if (filterStatus === "renewal_due") if (isVacant || !unit.contract_end_date) matchStatus = false;
		else {
			const end = new Date(unit.contract_end_date);
			end.setHours(0, 0, 0, 0);
			matchStatus = end <= in60Days;
		}
		else matchStatus = unit.status?.toLowerCase() === filterStatus.toLowerCase();
		const matchProperty = filterProperty === "all" || unit.property_id === filterProperty;
		const term = search.trim().toLowerCase();
		const matchSearch = !term || unit.unit_ref?.toLowerCase().includes(term) || unit.unit_name?.toLowerCase().includes(term) || unit.current_tenant?.toLowerCase().includes(term);
		return matchStatus && matchProperty && matchSearch;
	});
	const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
	const paginatedUnits = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
	(0, import_react.useEffect)(() => {
		setCurrentPage(1);
	}, [
		filterStatus,
		filterProperty,
		search
	]);
	const total = units.length;
	const occupied = units.filter((u) => u.status?.toLowerCase() === "occupied" || u.lease_status?.toLowerCase() === "leased" && u.status?.toLowerCase() !== "available").length;
	const available = units.filter((u) => u.status?.toLowerCase() === "available" || u.lease_status?.toLowerCase() === "vacant" || !u.status && !u.lease_status).length;
	const renewalDue = units.filter((u) => {
		if (!(u.status?.toLowerCase() === "occupied" || u.lease_status?.toLowerCase() === "leased" && u.status?.toLowerCase() !== "available") || !u.contract_end_date) return false;
		const end = new Date(u.contract_end_date);
		end.setHours(0, 0, 0, 0);
		return end <= in60Days;
	}).length;
	const occupancyRate = total > 0 ? Math.round(occupied / total * 100) : 0;
	const computedUnitArea = rooms.reduce((sum, r) => {
		const a = parseFloat(r.area);
		return sum + (isNaN(a) ? 0 : a * r.count);
	}, 0);
	const masterOptions = {
		furnishing: furnishingTypes.length ? furnishingTypes : fallbackOptions.furnishing,
		leaseStatuses: leaseStatuses.length ? leaseStatuses : fallbackOptions.leaseStatuses,
		rentFrequencies: rentFrequencies.length ? rentFrequencies : fallbackOptions.rentFrequencies,
		maintenance: maintenanceResp.length ? maintenanceResp : fallbackOptions.maintenance,
		deposits: depositTypes.length ? depositTypes : fallbackOptions.deposits,
		views: viewTypes.length ? viewTypes : fallbackOptions.views
	};
	const unitsByProperty = properties.map((prop) => {
		const propUnits = units.filter((u) => u.property_id === prop.id);
		const propOccupied = propUnits.filter((u) => u.status?.toLowerCase() === "occupied" || u.lease_status?.toLowerCase() === "leased" && u.status?.toLowerCase() !== "available").length;
		return {
			...prop,
			total: propUnits.length,
			occupied: propOccupied
		};
	});
	const [bulkImportOpen, setBulkImportOpen] = (0, import_react.useState)(false);
	const [bulkSelectedProp, setBulkSelectedProp] = (0, import_react.useState)("");
	const [csvText, setCsvText] = (0, import_react.useState)("");
	const [importing, setImporting] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-3xl font-bold tracking-tight",
					children: "Units Directory"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-muted-foreground",
					children: "Manage all rental and sale units across your portfolio."
				})] }), role !== "owner" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: () => setBulkImportOpen(true),
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4 text-primary" }), " Excel Bulk Import / Manage"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => {
							setForm(EMPTY_FORM);
							setRooms([makeRoomEntry("Bedroom")]);
							setStep(1);
							setOpen(true);
						},
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), " Add Unit"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: bulkImportOpen,
				onOpenChange: setBulkImportOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					className: "max-w-4xl max-h-[90vh] overflow-y-auto bg-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExcelImportEmbedded, {
						module: "unit",
						title: "Unit Master: Excel Bulk Import & Management",
						description: "Production-grade Excel CREATE, UPDATE, and DELETE engine for apartments, commercial units, and villas.",
						onCompleted: () => {
							load();
						}
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-4 md:grid-cols-4",
				children: [
					{
						label: "Total Units",
						value: total,
						icon: Building2,
						color: "text-primary"
					},
					{
						label: "Occupied",
						value: `${occupied} (${occupancyRate}%)`,
						icon: Users,
						color: "text-blue-600"
					},
					{
						label: "Available",
						value: available,
						icon: House,
						color: "text-emerald-600"
					},
					{
						label: "Renewal Due",
						value: renewalDue,
						icon: FileText,
						color: "text-amber-600"
					}
				].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
					className: "flex flex-row items-center justify-between pb-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
						children: item.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: `h-4 w-4 ${item.color}` })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `text-2xl font-bold ${item.color}`,
					children: item.value
				}) })] }, item.label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: currentTab,
				onValueChange: setCurrentTab,
				className: "w-full space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "property",
						children: "Property-wise Occupancy"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "unit",
						children: "Unit-wise Occupancy"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "property",
						className: "m-0",
						children: unitsByProperty.some((p) => p.total > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: "border-border",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
								className: "pb-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
									className: "text-sm font-semibold",
									children: "Property-wise Occupancy"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4",
								children: unitsByProperty.filter((p) => p.total > 0).map((p) => {
									const rate = p.total > 0 ? Math.round(p.occupied / p.total * 100) : 0;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										onClick: () => {
											setFilterProperty(p.id);
											setFilterStatus("all");
											setCurrentTab("unit");
										},
										className: "rounded-lg border border-border bg-muted/10 p-3 text-sm cursor-pointer hover:bg-muted/30 transition-colors",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "truncate font-medium",
												title: p.title,
												children: p.property_code || p.title
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-1 text-xs text-muted-foreground",
												children: [
													p.occupied,
													"/",
													p.total,
													" occupied"
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-1.5 h-1.5 w-full rounded-full bg-muted",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "h-1.5 rounded-full bg-blue-500 transition-all",
													style: { width: `${rate}%` }
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-0.5 text-right text-xs font-semibold text-blue-600",
												children: [rate, "%"]
											})
										]
									}, p.id);
								})
							}) })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "unit",
						className: "space-y-4 m-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "Search unit, tenant...",
										value: search,
										onChange: (e) => setSearch(e.target.value),
										className: "h-9 max-w-xs"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
										value: filterStatus,
										onValueChange: setFilterStatus,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
											className: "h-9",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
													value: "all",
													className: "text-xs",
													children: [
														"All (",
														total,
														")"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
													value: "occupied",
													className: "text-xs",
													children: [
														"Occupied (",
														occupied,
														")"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
													value: "available",
													className: "text-xs",
													children: [
														"Available (",
														available,
														")"
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
													value: "maintenance",
													className: "text-xs",
													children: "Maintenance"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
													value: "renewal_due",
													className: "text-xs text-amber-600",
													children: [
														"Renewal Due (",
														renewalDue,
														")"
													]
												})
											]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										className: "h-9 rounded-md border border-input bg-background px-3 py-1 text-sm",
										value: filterProperty,
										onChange: (e) => setFilterProperty(e.target.value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "all",
											children: "All Properties"
										}), properties.map((property) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: property.id,
											children: [property.property_code ? `${property.property_code} - ` : "", property.title]
										}, property.id))]
									})
								]
							}),
							renewalDue > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("strong", { children: [
										renewalDue,
										" unit",
										renewalDue !== 1 ? "s" : ""
									] }),
									" ",
									renewalDue !== 1 ? "have contracts" : "has a contract",
									" that",
									" ",
									renewalDue !== 1 ? "are" : "is",
									" expired or expiring within the next 60 days. Units with expired contracts should be updated to",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Vacant" }),
									" once the tenant vacates.",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "font-semibold underline",
										onClick: () => setFilterStatus("renewal_due"),
										children: "View affected units →"
									})
								] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "border-border",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "p-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "overflow-x-auto",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
											className: "w-full text-sm",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
												className: "border-b border-border bg-muted/10",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
													"Unit Code",
													"Unit Name",
													"Property",
													"Floor",
													"BR/BA",
													"Furnishing",
													"Base Rate",
													"Lease Status",
													"Tenant",
													"Contract Period",
													"E-Meter",
													"W-Meter",
													"Cooling/Chiller",
													"Actions"
												].map((heading) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "whitespace-nowrap px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
													children: heading
												}, heading)) })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
												className: "divide-y divide-border",
												children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													colSpan: 13,
													className: "py-12 text-center",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto h-6 w-6 animate-spin text-muted-foreground" })
												}) }) : filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													colSpan: 13,
													className: "py-12 text-center text-muted-foreground",
													children: "No units found"
												}) }) : paginatedUnits.map((unit) => {
													const property = properties.find((item) => item.id === unit.property_id);
													const propertyLabel = property ? `${property.property_code ? `${property.property_code} - ` : ""}${property.title}` : "-";
													return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
														className: "cursor-pointer transition-colors hover:bg-muted/10",
														onClick: () => setSelectedUnit(unit),
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																className: "px-4 py-3 font-mono text-xs font-medium",
																children: unit.unit_code || unit.unit_ref
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																className: "max-w-[160px] truncate px-4 py-3 font-medium",
																children: unit.unit_name || unit.unit_ref
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																className: "max-w-[140px] truncate px-4 py-3 text-xs text-muted-foreground",
																children: propertyLabel
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																className: "px-4 py-3 text-xs",
																children: unit.floor || "-"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																className: "px-4 py-3 text-xs",
																children: [
																	unit.bedrooms,
																	"BR / ",
																	unit.bathrooms,
																	"BA"
																]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																className: "px-4 py-3 text-xs",
																children: unit.furnishing || "-"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																className: "px-4 py-3 text-xs font-medium",
																children: ["QR ", unit.price?.toLocaleString() || 0]
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																className: "px-4 py-3",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																	className: `inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${leaseStatusColors[unit.lease_status || ""] || "bg-slate-100 text-slate-600"}`,
																	children: unit.lease_status || unit.status || "-"
																})
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																className: "max-w-[150px] truncate px-4 py-3 text-xs",
																children: unit.lease_status === "Vacant" || unit.status === "Available" ? "-" : unit.current_tenant || "-"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																className: "px-4 py-3 text-xs whitespace-nowrap",
																children: unit.lease_status === "Vacant" || unit.status === "Available" ? "-" : unit.contract_start_date ? `${unit.contract_start_date.slice(0, 10)} → ${unit.contract_end_date?.slice(0, 10) || "-"}` : "-"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																className: "px-4 py-3 font-mono text-xs",
																children: unit.electricity_meter_no || "-"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																className: "px-4 py-3 font-mono text-xs",
																children: unit.water_meter_no || "-"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
																className: "px-4 py-3 font-mono text-xs",
																children: unit.cooling_meter_no || "-"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
																className: "px-4 py-3 flex items-center gap-2",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																	size: "sm",
																	variant: "ghost",
																	className: "h-7 text-xs",
																	onClick: (e) => {
																		e.stopPropagation();
																		setSelectedUnit(unit);
																	},
																	children: "View"
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																	size: "sm",
																	variant: "outline",
																	className: "h-7 text-xs",
																	onClick: (e) => {
																		e.stopPropagation();
																		handleEditUnit(unit);
																	},
																	children: "Edit"
																})]
															})
														]
													}, unit.id);
												})
											})]
										})
									}), totalPages > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "p-4 border-t border-border",
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
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!selectedUnit,
				onOpenChange: (next) => !next && setSelectedUnit(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[90vh] max-w-3xl overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5 text-primary" }), selectedUnit?.unit_name || selectedUnit?.unit_ref]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: selectedUnit?.unit_cost_center_code })] }),
						selectedUnit && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-5 pt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
									children: "Unit Identity"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3",
									children: [
										["Unit Code", selectedUnit.unit_code],
										["Unit Name", selectedUnit.unit_name],
										["Cost Center", selectedUnit.unit_cost_center_code],
										["Block/Tower", selectedUnit.block_tower],
										["Floor", selectedUnit.floor],
										["Type", selectedUnit.room_type],
										["Usage", selectedUnit.unit_usage],
										["Furnishing", selectedUnit.furnishing],
										["View Type", selectedUnit.view_type]
									].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase tracking-wider text-muted-foreground",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-0.5 text-sm font-medium",
										children: value || "-"
									})] }, label))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
									children: "Size & Configuration"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-4",
									children: [
										["Bedrooms", selectedUnit.bedrooms],
										["Bathrooms", selectedUnit.bathrooms],
										["Area (sqm)", selectedUnit.area],
										["Balcony (sqm)", selectedUnit.balcony_sqm],
										["Total Area (sqm)", selectedUnit.total_area_sqm],
										["Parking Slot", selectedUnit.parking_slot_no],
										["Max Adults", selectedUnit.max_adults],
										["Max Children", selectedUnit.max_children]
									].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase tracking-wider text-muted-foreground",
										children: label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-0.5 text-sm font-medium",
										children: value ?? "-"
									})] }, label))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
									children: "Utility Meters"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-3 gap-4",
									children: [
										{
											label: "Electricity",
											value: selectedUnit.electricity_meter_no,
											icon: Zap,
											color: "text-yellow-500"
										},
										{
											label: "Water",
											value: selectedUnit.water_meter_no,
											icon: Droplets,
											color: "text-blue-500"
										},
										{
											label: "Cooling/Chiller",
											value: selectedUnit.cooling_meter_no,
											icon: Snowflake,
											color: "text-cyan-500"
										}
									].map((meter) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(meter.icon, { className: `h-4 w-4 ${meter.color}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10px] uppercase tracking-wider text-muted-foreground",
											children: meter.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "font-mono text-sm font-medium",
											children: meter.value || "N/A"
										})] })]
									}, meter.label))
								})] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
									children: "Lease & Financial Details"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3",
									children: (() => {
										const isVacant = selectedUnit.lease_status === "Vacant" || selectedUnit.status === "Available";
										const leaseDetails = [
											["Lease Status", selectedUnit.lease_status],
											["Unit Status", selectedUnit.status],
											["Rent Frequency", selectedUnit.rent_frequency],
											["Base Rate", selectedUnit.price ? `QR ${selectedUnit.price.toLocaleString()}` : null],
											["Current Rent", selectedUnit.current_rent ? `QR ${selectedUnit.current_rent.toLocaleString()}` : null],
											["Security Deposit Type", selectedUnit.security_deposit_type],
											["Security Deposit", selectedUnit.security_deposit_amount ? `QR ${selectedUnit.security_deposit_amount.toLocaleString()}` : null],
											["Maintenance Resp.", selectedUnit.maintenance_responsibility]
										];
										if (!isVacant) leaseDetails.push(["Contract No.", selectedUnit.contract_no]);
										leaseDetails.push(["Documents Received", selectedUnit.documents_received ? "Yes" : "No"]);
										if (!isVacant) leaseDetails.push(["Handover Date", selectedUnit.handover_date]);
										return leaseDetails.map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-[10px] uppercase tracking-wider text-muted-foreground",
											children: label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-0.5 text-sm font-medium",
											children: value || "-"
										})] }, label));
									})()
								})] }),
								selectedUnit.current_tenant && (() => {
									const isVacant = selectedUnit.lease_status === "Vacant" || selectedUnit.status === "Available";
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
										children: isVacant ? "Past Tenant & Contract" : "Current Tenant"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] uppercase tracking-wider text-muted-foreground",
												children: isVacant ? "Past Tenant Name" : "Tenant Name"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-0.5 text-sm font-medium",
												children: selectedUnit.current_tenant
											})] }),
											isVacant && selectedUnit.contract_no && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] uppercase tracking-wider text-muted-foreground",
												children: "Past Contract No."
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-0.5 text-sm font-medium",
												children: selectedUnit.contract_no
											})] }),
											selectedUnit.contract_start_date && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-[10px] uppercase tracking-wider text-muted-foreground",
												children: isVacant ? "Past Contract Period" : "Contract Period"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-0.5 text-sm font-medium",
												children: [
													selectedUnit.contract_start_date.slice(0, 10),
													" →",
													" ",
													selectedUnit.contract_end_date?.slice(0, 10) || "-"
												]
											})] })
										]
									})] });
								})(),
								selectedUnit.remarks && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
									children: "Remarks"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: selectedUnit.remarks
								})] })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogFooter, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							onClick: () => setSelectedUnit(null),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "mr-1 h-4 w-4" }), " Close"]
						}) })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: (val) => {
					setOpen(val);
					if (!val) {
						setEditingUnitId(null);
						setForm(EMPTY_FORM);
						setRooms([makeRoomEntry("Bedroom")]);
					}
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[95vh] max-w-3xl overflow-y-auto",
					onInteractOutside: (e) => e.preventDefault(),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: editingUnitId ? "Edit Unit" : "Add New Unit" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
							editingUnitId ? "Update unit information" : "Register a new unit",
							" — Step ",
							step,
							" of ",
							STEPS.length,
							": ",
							STEPS[step - 1].name
						] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-4 flex items-center justify-center gap-0",
							children: STEPS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setStep(s.id),
									className: `flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${step === s.id ? "bg-primary text-primary-foreground" : step > s.id ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`,
									children: step > s.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) : s.id
								}), i < STEPS.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: `h-1 w-12 rounded ${step > s.id ? "bg-primary/30" : "bg-muted"}` })]
							}, s.id))
						}),
						step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "col-span-2 space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Property *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.property_id,
											onValueChange: handlePropertyChange,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select property" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: properties.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
												value: p.id,
												children: [p.property_code ? `${p.property_code} - ` : "", p.title]
											}, p.id)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Unit Reference *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.unit_ref || "",
											onChange: (e) => handleUnitRefChange(e.target.value),
											placeholder: "e.g. Flat11"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "flex items-center gap-1",
											children: ["Unit Code", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-normal text-muted-foreground",
												children: "(auto-generated)"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.unit_code || "",
											readOnly: true,
											className: "bg-muted/40 cursor-not-allowed font-mono",
											placeholder: "Select property & enter unit ref"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Unit Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.unit_name || "",
											onChange: (e) => setF("unit_name", e.target.value),
											placeholder: "Enter unit name manually"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Block / Tower" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.block_tower || "",
											onChange: (e) => setF("block_tower", e.target.value),
											placeholder: "Block A"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Floor" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.floor || "",
											onChange: (e) => setF("floor", e.target.value),
											placeholder: "e.g. Ground, 1st..."
										})]
									})
								]
							})
						}),
						step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Unit Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.room_type,
											onValueChange: (v) => setF("room_type", v),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
												"Apartment",
												"Studio",
												"Villa",
												"Townhouse",
												"Office",
												"Shop",
												"Showroom",
												"Warehouse",
												"Parking",
												"Other"
											].map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: o,
												children: o
											}, o)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Usage" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.unit_usage,
											onValueChange: (v) => setF("unit_usage", v),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
												"Residential",
												"Commercial",
												"Retail",
												"Office",
												"Storage",
												"Parking",
												"Common Area",
												"Other"
											].map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: o,
												children: o
											}, o)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BedDouble, { className: "h-3 w-3" }), " Bedrooms"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: 0,
											max: 10,
											value: form.bedrooms,
											onChange: (e) => setF("bedrooms", Number(e.target.value))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bath, { className: "h-3 w-3" }), " Bathrooms"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: 0,
											max: 10,
											value: form.bathrooms,
											onChange: (e) => setF("bathrooms", Number(e.target.value))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Max Adults" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: 1,
											value: form.max_adults,
											onChange: (e) => {
												const a = Number(e.target.value);
												setF("max_adults", a);
												setF("total_occupancy", a + (form.max_children || 0));
											}
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Max Children" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: 0,
											value: form.max_children,
											onChange: (e) => {
												const c = Number(e.target.value);
												setF("max_children", c);
												setF("total_occupancy", (form.max_adults || 0) + c);
											}
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Total Occupancy" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: form.total_occupancy,
											disabled: true,
											className: "bg-muted/40"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Furnishing" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.furnishing,
											onValueChange: (v) => setF("furnishing", v),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: masterOptions.furnishing.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: o.label,
												children: o.label
											}, o.id)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "View Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.view_type,
											onValueChange: (v) => setF("view_type", v),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select view" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: masterOptions.views.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: o.label,
												children: o.label
											}, o.id)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											className: "flex items-center gap-1",
											children: ["Area (sqm)", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-normal text-muted-foreground",
												children: "(auto-calculated from room dimensions in Step 4)"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: computedUnitArea > 0 ? computedUnitArea.toFixed(2) : form.area || "",
											readOnly: true,
											className: "bg-muted/40 cursor-not-allowed",
											placeholder: "Calculated from room dimensions (Step 4)"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Balcony (sqm)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: form.balcony_sqm || "",
											onChange: (e) => setF("balcony_sqm", toNumberOrUndefined(e.target.value)),
											placeholder: "e.g. 6"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Total Area (sqm)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: form.total_area_sqm || "",
											onChange: (e) => setF("total_area_sqm", toNumberOrUndefined(e.target.value)),
											placeholder: "e.g. 101"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Parking Slot No." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: form.parking_slot_no || "",
											onChange: (e) => setF("parking_slot_no", e.target.value),
											placeholder: "P-12"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "col-span-2 mt-2 border-t pt-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
											children: "Utility Meters"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-3 gap-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
														className: "flex items-center gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "h-3 w-3 text-yellow-500" }), " Electricity"]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: form.electricity_meter_no || "",
														onChange: (e) => setF("electricity_meter_no", e.target.value),
														placeholder: "Meter No."
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
														className: "flex items-center gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Droplets, { className: "h-3 w-3 text-blue-500" }), " Water"]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: form.water_meter_no || "",
														onChange: (e) => setF("water_meter_no", e.target.value),
														placeholder: "Meter No."
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
														className: "flex items-center gap-1",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Snowflake, { className: "h-3 w-3 text-cyan-500" }), " Cooling"]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: form.cooling_meter_no || "",
														onChange: (e) => setF("cooling_meter_no", e.target.value),
														placeholder: "Meter No."
													})]
												})
											]
										})]
									})
								]
							})
						}),
						step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-4 py-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Unit Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.status,
											onValueChange: (v) => setF("status", v),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: [
												"Available",
												"Occupied",
												"Reserved",
												"Maintenance",
												"Blocked",
												"Sold",
												"Inactive"
											].map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: o,
												children: o
											}, o)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Lease Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.lease_status,
											onValueChange: (v) => setF("lease_status", v),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: masterOptions.leaseStatuses.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: o.label,
												children: o.label
											}, o.id)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Base Rate (QR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: form.price || "",
											onChange: (e) => setF("price", Number(e.target.value))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Current Rent (QR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: form.current_rent || "",
											onChange: (e) => setF("current_rent", toNumberOrUndefined(e.target.value))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Weekend Rate (QR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: form.weekend_price || "",
											onChange: (e) => setF("weekend_price", toNumberOrUndefined(e.target.value))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Holiday Rate (QR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: form.holiday_price || "",
											onChange: (e) => setF("holiday_price", toNumberOrUndefined(e.target.value))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Cleaning Fee (QR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: form.cleaning_fee || "",
											onChange: (e) => setF("cleaning_fee", Number(e.target.value))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Rent Frequency" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.rent_frequency,
											onValueChange: (v) => setF("rent_frequency", v),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: masterOptions.rentFrequencies.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: o.label,
												children: o.label
											}, o.id)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Security Deposit Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.security_deposit_type,
											onValueChange: (v) => setF("security_deposit_type", v),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select type" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: masterOptions.deposits.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: o.label,
												children: o.label
											}, o.id)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Security Deposit (QR)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											value: form.security_deposit_amount || "",
											onChange: (e) => setF("security_deposit_amount", toNumberOrUndefined(e.target.value))
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Maintenance Responsibility" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.maintenance_responsibility,
											onValueChange: (v) => setF("maintenance_responsibility", v),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: masterOptions.maintenance.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: o.label,
												children: o.label
											}, o.id)) })]
										})]
									})
								]
							})
						}),
						step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "py-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-3 flex items-center justify-between gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "Area auto-calculates from length × width. Bedroom & Bathroom entries are capped by counts set in Step 2."
									}), computedUnitArea > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "shrink-0 rounded-md bg-primary/10 px-3 py-1 text-xs font-medium text-primary",
										children: [
											"Total: ",
											computedUnitArea.toFixed(2),
											" sqm"
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-3",
									children: rooms.map((room, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-border bg-muted/5 p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-3 flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
												children: ["Room ", idx + 1]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												type: "button",
												variant: "ghost",
												size: "sm",
												className: "h-6 text-xs text-destructive hover:text-destructive",
												onClick: () => removeRoom(room.id),
												disabled: rooms.length === 1,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3 w-3" })
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs",
														children: "Room Type"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: room.room_type,
														onValueChange: (v) => updateRoom(room.id, "room_type", v),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "h-8 text-xs",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ROOM_TYPES.map((rt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: rt,
															children: rt
														}, rt)) })]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs",
														children: "Name / Label"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														className: "h-8 text-xs",
														value: room.name,
														onChange: (e) => updateRoom(room.id, "name", e.target.value),
														placeholder: "e.g. Master Bedroom"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
														className: "text-xs",
														children: ["Count", (room.room_type === "Bedroom" || room.room_type === "Bathroom") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "ml-1 text-[10px] text-muted-foreground",
															children: [
																"(max: ",
																room.room_type === "Bedroom" ? form.bedrooms ?? 20 : form.bathrooms ?? 20,
																")"
															]
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														min: 1,
														max: room.room_type === "Bedroom" ? form.bedrooms ?? 20 : room.room_type === "Bathroom" ? form.bathrooms ?? 20 : 20,
														className: "h-8 text-xs",
														value: room.count,
														onChange: (e) => {
															const maxVal = room.room_type === "Bedroom" ? form.bedrooms ?? 20 : room.room_type === "Bathroom" ? form.bathrooms ?? 20 : 20;
															updateRoom(room.id, "count", Math.min(parseInt(e.target.value) || 1, maxVal));
														}
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs",
														children: "Unit of Measure"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: room.uom,
														onValueChange: (v) => updateRoom(room.id, "uom", v),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
															className: "h-8 text-xs",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "sqm",
															children: "sqm"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "sqft",
															children: "sqft"
														})] })]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs",
														children: "Length"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														step: "0.01",
														className: "h-8 text-xs",
														value: room.length,
														onChange: (e) => updateRoom(room.id, "length", e.target.value),
														placeholder: "e.g. 4.5"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs",
														children: "Width"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														step: "0.01",
														className: "h-8 text-xs",
														value: room.width,
														onChange: (e) => updateRoom(room.id, "width", e.target.value),
														placeholder: "e.g. 3.5"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
														className: "text-xs",
														children: [
															"Area (",
															room.uom,
															") ",
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-[10px] text-muted-foreground",
																children: "(auto)"
															})
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														step: "0.01",
														className: "h-8 text-xs bg-muted/40 cursor-not-allowed",
														value: room.area,
														readOnly: true,
														placeholder: "Auto-calculated"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs",
														children: "Capacity (persons)"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														min: 0,
														className: "h-8 text-xs",
														value: room.capacity,
														onChange: (e) => updateRoom(room.id, "capacity", e.target.value),
														placeholder: "optional"
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "col-span-2 space-y-1 sm:col-span-4",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs",
														children: "Details / Notes"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														className: "h-8 text-xs",
														value: room.details,
														onChange: (e) => updateRoom(room.id, "details", e.target.value),
														placeholder: "e.g. En-suite, wardrobe, etc."
													})]
												})
											]
										})]
									}, room.id))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex flex-wrap gap-2",
									children: [ROOM_TYPES.slice(0, 7).map((rt) => {
										const maxCount = rt === "Bedroom" ? form.bedrooms ?? 20 : rt === "Bathroom" ? form.bathrooms ?? 20 : 20;
										const currentTypeCount = rooms.filter((r) => r.room_type === rt).reduce((s, r) => s + r.count, 0);
										const atMax = (rt === "Bedroom" || rt === "Bathroom") && currentTypeCount >= maxCount;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "button",
											variant: "outline",
											size: "sm",
											className: "h-7 text-xs",
											onClick: () => !atMax && addRoom(rt),
											disabled: atMax,
											title: atMax ? `Max ${maxCount} ${rt}(s) based on Step 2 configuration` : "",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "mr-1 h-3 w-3" }),
												" ",
												rt,
												(rt === "Bedroom" || rt === "Bathroom") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "ml-1 text-[10px] opacity-60",
													children: [
														"(",
														currentTypeCount,
														"/",
														maxCount,
														")"
													]
												})
											]
										}, rt);
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "button",
										variant: "ghost",
										size: "sm",
										className: "h-7 text-xs",
										onClick: () => addRoom(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-3 w-3" }), " Other Room"]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "mt-4 flex items-center justify-between gap-2 sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									onClick: () => setStep((s) => Math.max(1, s - 1)),
									disabled: step === 1 || saving,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "mr-2 h-4 w-4" }), " Back"]
								}), step < STEPS.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: () => setStep((s) => Math.min(STEPS.length, s + 1)),
									disabled: step === 1 && (!form.property_id || !form.unit_ref),
									children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-2 h-4 w-4" })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: handleCreate,
									disabled: saving,
									children: [saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), editingUnitId ? "Update Unit" : "Create Unit"]
								})]
							})]
						})
					]
				})
			})
		]
	});
}
//#endregion
export { UnitsModule };
