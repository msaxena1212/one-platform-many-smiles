import { i as __toESM } from "../_runtime.mjs";
import { B as supabase, D as fetchOwnershipTypes, G as updatePropertyImages, I as fetchUnits, M as fetchPropertyTypes, f as fetchAllProperties, h as fetchCostCenters, j as fetchPropertyCategories, s as createProperty } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { At as FileSpreadsheet, an as ChevronLeft, ct as LoaderCircle, gn as Building2, in as ChevronRight, sn as Check } from "../_libs/lucide-react.mjs";
import { r as getDemoSession } from "./demo-auth-Dw5zdnz8.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as CardContent, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { n as buildPropertyPayload, t as ImageUploader } from "./image-uploader-CUKD7wxm.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { t as ExcelImportEmbedded } from "./excel-import-embedded-DS3u1z7Y.mjs";
import { a as PaginationNext, i as PaginationLink, n as PaginationContent, o as PaginationPrevious, r as PaginationItem, t as Pagination } from "./pagination-Mm0k59kY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/properties-module-0OxZwdsk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY_FORM = {
	title: "",
	description: "",
	property_type: "apartment",
	address: "",
	city: "",
	state: "",
	zip_code: "",
	country: "Qatar",
	cost_center_code: "",
	cost_center_name: "",
	property_category: "",
	ownership_type: "",
	no_of_units: "",
	total_units: ""
};
var STEPS = [
	{
		id: 1,
		name: "Identity & Location"
	},
	{
		id: 2,
		name: "Configuration"
	},
	{
		id: 3,
		name: "Cost Center & Categories"
	},
	{
		id: 4,
		name: "Photos"
	}
];
function PropertiesModule({ role }) {
	const [properties, setProperties] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [creating, setCreating] = (0, import_react.useState)(false);
	const [createOpen, setCreateOpen] = (0, import_react.useState)(false);
	const [step, setStep] = (0, import_react.useState)(1);
	const [occupancyData, setOccupancyData] = (0, import_react.useState)({});
	const [form, setForm] = (0, import_react.useState)(EMPTY_FORM);
	const [customPropertyType, setCustomPropertyType] = (0, import_react.useState)("");
	const [images, setImages] = (0, import_react.useState)([]);
	const [currentPage, setCurrentPage] = (0, import_react.useState)(1);
	const ITEMS_PER_PAGE = 20;
	(0, import_react.useEffect)(() => {
		setCurrentPage(1);
	}, [properties]);
	const [propCategoryOptions, setPropCategoryOptions] = (0, import_react.useState)([]);
	const [propTypeOptions, setPropTypeOptions] = (0, import_react.useState)([]);
	const [ownershipOptions, setOwnershipOptions] = (0, import_react.useState)([]);
	const [costCenterOptions, setCostCenterOptions] = (0, import_react.useState)([]);
	const loadProperties = (0, import_react.useCallback)(async () => {
		setLoading(true);
		try {
			const { data: { session } } = await supabase.auth.getSession();
			const demoSession = getDemoSession();
			session?.user?.id || demoSession?.id;
			const [data, pc, pt, ow, cc] = await Promise.all([
				fetchAllProperties(),
				fetchPropertyCategories(),
				fetchPropertyTypes(),
				fetchOwnershipTypes(),
				fetchCostCenters()
			]);
			setProperties(data || []);
			setPropCategoryOptions(pc);
			setPropTypeOptions(pt);
			setOwnershipOptions(ow);
			setCostCenterOptions(cc);
		} catch (error) {
			console.error("Failed to load properties:", error?.message || error);
		} finally {
			setLoading(false);
		}
	}, [role]);
	(0, import_react.useEffect)(() => {
		loadProperties();
	}, [loadProperties]);
	(0, import_react.useEffect)(() => {
		if (properties.length === 0) {
			setOccupancyData({});
			return;
		}
		(async () => {
			let contextLeases = [];
			try {
				const raw = window.localStorage.getItem("zyno-pms-app-data");
				if (raw) {
					const parsed = JSON.parse(raw);
					if (parsed.leases) contextLeases = parsed.leases;
				}
			} catch (e) {}
			const entries = await Promise.all(properties.map(async (property) => {
				try {
					const units = await fetchUnits({ property_id: property.id });
					const totalUnits = units?.length ?? 0;
					const occupiedDbCount = (units || []).filter((u) => u.status?.toLowerCase() === "occupied" || u.lease_status?.toLowerCase() === "leased" || u.lease_status?.toLowerCase() === "active").length;
					const activeContextLeaseCount = contextLeases.filter((l) => (l.property?.toLowerCase() === property.title?.toLowerCase() || l.property?.toLowerCase().includes(property.title?.toLowerCase()) || property.title?.toLowerCase().includes(l.property?.toLowerCase())) && (l.status === "active" || l.status === "fully_signed" || l.status === "collection_completed")).length;
					const occupiedUnits = Math.max(occupiedDbCount, Math.min(totalUnits, activeContextLeaseCount));
					const calculatedTotal = totalUnits > 0 ? totalUnits : property.total_units || property.no_of_units || (activeContextLeaseCount > 0 ? activeContextLeaseCount : 1);
					return {
						id: property.id,
						units: calculatedTotal,
						occupancy: calculatedTotal > 0 ? occupiedUnits > 0 ? Math.round(occupiedUnits / calculatedTotal * 100) + "%" : occupiedDbCount > 0 ? Math.round(occupiedDbCount / calculatedTotal * 100) + "%" : "0%" : "0%"
					};
				} catch {
					return {
						id: property.id,
						units: 0,
						occupancy: "N/A"
					};
				}
			}));
			setOccupancyData(Object.fromEntries(entries.map((entry) => [entry.id, entry])));
		})();
	}, [properties]);
	const basePath = role === "admin" ? "/admin" : role === "owner" ? "/owner" : "/prop-mgr";
	async function handleCreateProperty() {
		setCreating(true);
		try {
			const { data: { session } } = await supabase.auth.getSession();
			const demoSession = getDemoSession();
			const hostId = session?.user?.id ?? void 0;
			if (!session?.user?.id && !demoSession) throw new Error("You must be logged in to create a property.");
			const generatedPropertyCode = `PROP-${Math.floor(Math.random() * 1e6).toString().padStart(6, "0")}`;
			const propCostCenterCode = form.cost_center_code || `CC-PROP-${Math.floor(1e3 + Math.random() * 9e3)}`;
			const propCostCenterName = form.cost_center_name || `${form.title} Cost Center`;
			const newProperty = await createProperty(buildPropertyPayload({
				hostId,
				title: form.title,
				description: form.description || null,
				propertyType: form.property_type === "Other" ? customPropertyType : form.property_type,
				address: form.address,
				city: form.city,
				state: form.state || void 0,
				zipCode: form.zip_code || void 0,
				country: form.country,
				basePricePerNight: 0,
				cleaningFee: 0,
				isActive: true,
				propertyCode: generatedPropertyCode,
				costCenterCode: propCostCenterCode,
				costCenterName: propCostCenterName,
				propertyCategory: form.property_category,
				ownershipType: form.ownership_type,
				noOfUnits: form.no_of_units || form.total_units,
				totalUnits: form.total_units || form.no_of_units
			}));
			if (newProperty) try {
				const finalCcCode = `CC-PROP-${newProperty.id.slice(0, 8).toUpperCase()}`;
				await supabase.from("fin_cost_centers").upsert({
					code: finalCcCode,
					name: `${form.title} Cost Center`,
					manager: "Property Manager"
				}, { onConflict: "code" });
				await supabase.from("properties").update({
					cost_center_code: finalCcCode,
					cost_center_name: `${form.title} Cost Center`
				}).eq("id", newProperty.id);
			} catch (ccErr) {
				console.warn("Auto-create property cost center skipped/failed:", ccErr);
			}
			if (images.length > 0 && newProperty) await updatePropertyImages(newProperty.id, images.map((img, idx) => ({
				image_url: img.url,
				is_primary: img.isCover,
				display_order: idx
			})));
			setCreateOpen(false);
			setForm(EMPTY_FORM);
			setCustomPropertyType("");
			setImages([]);
			setStep(1);
			await loadProperties();
		} catch (error) {
			alert("Failed to create property: " + (error?.message || "Unknown error"));
		} finally {
			setCreating(false);
		}
	}
	const handleNext = () => setStep((s) => Math.min(STEPS.length, s + 1));
	const handleBack = () => setStep((s) => Math.max(1, s - 1));
	const stepperButtonClass = (s) => {
		if (step === s.id) return "bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold";
		if (step > s.id) return "bg-primary/20 text-primary flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold";
		return "bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold";
	};
	const connectorClass = (idx) => {
		return "h-1 w-16 mx-2 rounded " + (step > idx + 1 ? "bg-primary/20" : "bg-muted");
	};
	const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
	const paginatedProperties = properties.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
	const [bulkPropOpen, setBulkPropOpen] = (0, import_react.useState)(false);
	const [bulkCsvText, setBulkCsvText] = (0, import_react.useState)("");
	const [bulkImporting, setBulkImporting] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-3xl font-bold tracking-tight",
					children: "Properties"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Manage your portfolio and track occupancy."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: role !== "owner" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: () => setBulkPropOpen(true),
						className: "gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-4 w-4 text-primary" }), " Excel Bulk Import / Manage"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "bg-primary text-primary-foreground hover:bg-primary/90",
						onClick: () => {
							setForm(EMPTY_FORM);
							setStep(1);
							setCreateOpen(true);
						},
						children: "+ New property"
					})] })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: bulkPropOpen,
				onOpenChange: setBulkPropOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					className: "max-w-4xl max-h-[90vh] overflow-y-auto bg-card",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExcelImportEmbedded, {
						module: "property",
						title: "Property Master: Excel Bulk Import & Management",
						description: "Production-grade Excel CREATE, UPDATE, and DELETE engine for master properties, buildings, and cost centers.",
						onCompleted: () => {
							load();
						}
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "p-0",
					children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-40 items-center justify-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-muted-foreground" })
					}) : properties.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-40 flex-col items-center justify-center gap-3 text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-10 w-10 opacity-30" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: "No properties yet."
							}),
							role !== "owner" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => {
									setForm(EMPTY_FORM);
									setStep(1);
									setCreateOpen(true);
								},
								children: "+ Create your first listing"
							})
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "overflow-x-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "border-b border-border bg-muted/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
										children: "Property"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
										children: "Type"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
										children: "Location"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
										children: "Units"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
										children: "Occupancy"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground",
										children: "Status"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground",
										children: "Action"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
								className: "divide-y divide-border",
								children: paginatedProperties.map((prop) => {
									const propertyUnits = occupancyData[prop.id]?.units ?? "-";
									const propertyOccupancy = occupancyData[prop.id]?.occupancy ?? "-";
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
										className: "transition-colors hover:bg-muted/10",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-6 py-4 font-semibold text-foreground",
												children: prop.title
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-6 py-4 capitalize text-muted-foreground",
												children: prop.property_type.replace(/_/g, " ")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "px-6 py-4 text-muted-foreground",
												children: [
													prop.city,
													", ",
													prop.country
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-6 py-4 text-muted-foreground",
												children: propertyUnits
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-6 py-4 font-medium",
												children: propertyOccupancy
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
												className: "px-6 py-4",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold " + (prop.is_active ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"),
													children: prop.is_active ? "Active" : "Inactive"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
												className: "px-6 py-4 text-right flex justify-end gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													asChild: true,
													variant: "ghost",
													size: "sm",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
														to: basePath + "/manage/$id",
														params: { id: prop.id },
														children: "View"
													})
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													asChild: true,
													variant: "outline",
													size: "sm",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
														to: basePath + "/manage/$id",
														params: { id: prop.id },
														children: "Edit"
													})
												})]
											})
										]
									}, prop.id);
								})
							})]
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
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: createOpen,
				onOpenChange: setCreateOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[90vh] max-w-2xl overflow-y-auto",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create Property" }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mb-4 mt-2 flex items-center justify-center",
							children: STEPS.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: stepperButtonClass(s),
									children: step > s.id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" }) : s.id
								}), i < STEPS.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: connectorClass(i) })]
							}, s.id))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mb-4 text-center text-sm font-medium text-muted-foreground",
							children: [
								"Step ",
								step,
								" of ",
								STEPS.length,
								": ",
								STEPS[step - 1].name
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "py-2",
							children: [
								step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "col-span-2 space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Property Name *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: form.title,
												onChange: (e) => setForm((prev) => ({
													...prev,
													title: e.target.value
												})),
												placeholder: "Residence / Building name"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "col-span-2 space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												value: form.description,
												onChange: (e) => setForm((prev) => ({
													...prev,
													description: e.target.value
												})),
												placeholder: "Short property description"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "col-span-2 space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Address *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: form.address,
												onChange: (e) => setForm((prev) => ({
													...prev,
													address: e.target.value
												}))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "City *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: form.city,
												onChange: (e) => setForm((prev) => ({
													...prev,
													city: e.target.value
												}))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "State / Zone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: form.state,
												onChange: (e) => setForm((prev) => ({
													...prev,
													state: e.target.value
												}))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Zip Code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: form.zip_code,
												onChange: (e) => setForm((prev) => ({
													...prev,
													zip_code: e.target.value
												}))
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Country" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: form.country,
												onChange: (e) => setForm((prev) => ({
													...prev,
													country: e.target.value
												}))
											})]
										})
									]
								}),
								step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Property Type" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: form.property_type,
												onValueChange: (val) => {
													setForm((prev) => ({
														...prev,
														property_type: val
													}));
													if (val !== "Other") setCustomPropertyType("");
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select type" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [propTypeOptions.length > 0 ? propTypeOptions.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: opt.id,
													children: opt.label
												}, opt.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "apartment",
														children: "Apartment"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "villa",
														children: "Villa"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "office",
														children: "Office"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "building",
														children: "Building"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "retail",
														children: "Retail"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "warehouse",
														children: "Warehouse"
													})
												] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Other",
													children: "Other (Add new)"
												})] })]
											}),
											form.property_type === "Other" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-1",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "Enter custom type...",
													value: customPropertyType,
													onChange: (e) => setCustomPropertyType(e.target.value),
													className: "h-8 text-xs"
												})
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Total Units" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											type: "number",
											min: "0",
											value: form.total_units || form.no_of_units,
											onChange: (e) => setForm((prev) => ({
												...prev,
												total_units: e.target.value,
												no_of_units: e.target.value
											})),
											placeholder: "e.g. 10"
										})]
									})]
								}),
								step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Property Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.property_category,
											onValueChange: (val) => setForm((prev) => ({
												...prev,
												property_category: val
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Category" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: propCategoryOptions.length > 0 ? propCategoryOptions.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: opt.id,
												children: opt.label
											}, opt.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Residential",
													children: "Residential"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Commercial",
													children: "Commercial"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Mixed Use",
													children: "Mixed Use"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Retail",
													children: "Retail"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Industrial",
													children: "Industrial"
												})
											] }) })]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ownership Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.ownership_type,
											onValueChange: (val) => setForm((prev) => ({
												...prev,
												ownership_type: val
											})),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Ownership" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ownershipOptions.length > 0 ? ownershipOptions.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: opt.id,
												children: opt.label
											}, opt.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Freehold",
													children: "Freehold"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Leasehold",
													children: "Leasehold"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Company Owned",
													children: "Company Owned"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Joint Ownership",
													children: "Joint Ownership"
												})
											] }) })]
										})]
									})]
								}),
								step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Property Images" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
										images,
										onChange: setImages,
										categories: [
											"Exterior",
											"Interior",
											"Floor Plan",
											"Other"
										]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "flex items-center justify-between gap-2 sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								onClick: () => setCreateOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									onClick: handleBack,
									disabled: step === 1 || creating,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "mr-2 h-4 w-4" }), " Back"]
								}), step < STEPS.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: handleNext,
									disabled: step === 1 && (!form.title || !form.address || !form.city),
									children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-2 h-4 w-4" })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: handleCreateProperty,
									disabled: creating || !form.title || !form.address || !form.city,
									children: [creating && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }), "Save Property"]
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
export { PropertiesModule };
