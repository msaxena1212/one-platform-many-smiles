import { i as __toESM } from "../_runtime.mjs";
import { B as supabase, D as fetchOwnershipTypes, G as updatePropertyImages, I as fetchUnits, M as fetchPropertyTypes, f as fetchAllProperties, h as fetchCostCenters, j as fetchPropertyCategories, s as createProperty } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { S as Sparkles, W as Plus, Xt as CirclePlus, hn as Building2, in as ChevronLeft, kt as FileSpreadsheet, on as Check, rn as ChevronRight, st as LoaderCircle, v as Trash2 } from "../_libs/lucide-react.mjs";
import { r as getDemoSession } from "./demo-auth-Dw5zdnz8.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as CardContent, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { n as buildPropertyPayload, t as ImageUploader } from "./image-uploader-CUKD7wxm.mjs";
import { n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./dialog-EOzTavlY.mjs";
import { t as ExcelImportEmbedded } from "./excel-import-embedded-BaJZdGzu.mjs";
import { a as PaginationNext, i as PaginationLink, n as PaginationContent, o as PaginationPrevious, r as PaginationItem, t as Pagination } from "./pagination-Mm0k59kY.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/properties-module-D72VaGQY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY_FORM = {
	property_code: "",
	title: "",
	description: "",
	property_type: "Residential",
	property_category: "Building",
	ownership_type: "Leased",
	country: "Qatar",
	city: "Doha",
	area_zone: "",
	street_building_name: "",
	plot_building_no: "",
	title_deed_no: "",
	municipality_ref_no: "",
	owner_landlord: "",
	property_manager: "",
	no_of_floors: "1",
	no_of_units: "1",
	total_units: "1",
	total_built_up_area_sqm: "",
	common_area_sqm: "",
	parking_count: "0",
	no_of_elevators: "0",
	completion_date: "",
	handover_date: "",
	property_status: "Active",
	documents_received: false,
	remarks: "",
	cost_center_code: "",
	cost_center_name: "",
	address: "",
	state: "",
	zip_code: ""
};
var STEPS = [
	{
		id: 1,
		name: "Identity & Location"
	},
	{
		id: 2,
		name: "Specifications & Structure"
	},
	{
		id: 3,
		name: "Amenities & Facilities"
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
	const [amenitiesList, setAmenitiesList] = (0, import_react.useState)([""]);
	const [otherAmenities, setOtherAmenities] = (0, import_react.useState)("");
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
			const finalPropertyCode = form.property_code.trim() || `PROP-${Math.floor(1e5 + Math.random() * 9e5)}`;
			const propCostCenterCode = form.cost_center_code.trim() || `CC-${finalPropertyCode.replace(/[^A-Za-z0-9]/g, "")}`;
			const propCostCenterName = form.cost_center_name.trim() || `${form.title.trim()} Cost Center`;
			const cleanAmenities = amenitiesList.map((a) => a.trim()).filter(Boolean);
			if (cleanAmenities.length === 0) {
				toast.error("At least one Amenity / Facility is mandatory.");
				setCreating(false);
				return;
			}
			const streetAddress = form.street_building_name || form.address || `${finalPropertyCode} Street`;
			const newProperty = await createProperty(buildPropertyPayload({
				hostId,
				title: form.title.trim(),
				description: form.description || null,
				propertyType: form.property_type === "Other" ? customPropertyType : form.property_type,
				address: streetAddress,
				city: form.city.trim(),
				state: form.state || form.area_zone || void 0,
				zipCode: form.zip_code || void 0,
				country: form.country.trim(),
				basePricePerNight: 0,
				cleaningFee: 0,
				isActive: form.property_status.toLowerCase() === "active",
				propertyCode: finalPropertyCode,
				costCenterCode: propCostCenterCode,
				costCenterName: propCostCenterName,
				propertyCategory: form.property_category,
				ownershipType: form.ownership_type,
				areaZone: form.area_zone.trim(),
				streetBuildingName: form.street_building_name.trim(),
				plotBuildingNo: form.plot_building_no.trim() || void 0,
				titleDeedNo: form.title_deed_no.trim() || void 0,
				municipalityRefNo: form.municipality_ref_no.trim() || void 0,
				ownerLandlord: form.owner_landlord.trim(),
				propertyManager: form.property_manager.trim(),
				noOfFloors: Number(form.no_of_floors) || 1,
				noOfUnits: Number(form.no_of_units) || 1,
				totalUnits: Number(form.total_units || form.no_of_units) || 1,
				totalBuiltUpAreaSqm: form.total_built_up_area_sqm ? Number(form.total_built_up_area_sqm) : void 0,
				commonAreaSqm: form.common_area_sqm ? Number(form.common_area_sqm) : void 0,
				parkingCount: Number(form.parking_count) || 0,
				noOfElevators: Number(form.no_of_elevators) || 0,
				completionDate: form.completion_date || void 0,
				handoverDate: form.handover_date || void 0,
				propertyStatus: form.property_status,
				documentsReceived: Boolean(form.documents_received),
				remarks: form.remarks || void 0,
				amenityFields: cleanAmenities,
				otherAmenitiesFacilities: otherAmenities.trim() || void 0
			}));
			if (newProperty) try {
				await supabase.from("fin_cost_centers").upsert({
					code: propCostCenterCode,
					name: propCostCenterName,
					manager: form.property_manager || "Property Manager"
				}, { onConflict: "code" });
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
			setAmenitiesList([""]);
			setOtherAmenities("");
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
					className: "max-w-6xl max-h-[92vh] overflow-y-auto bg-card p-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExcelImportEmbedded, {
						module: "property",
						title: "Property Master: Excel Bulk Import & Management",
						description: "Production-grade Excel CREATE, UPDATE, and DELETE engine for master properties, buildings, and cost centers.",
						onCompleted: () => {
							loadProperties();
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
					className: "max-w-2xl max-h-[88vh] overflow-hidden flex flex-col p-0 gap-0 border-border/80 shadow-2xl rounded-2xl bg-card",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-4 border-b flex items-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-5 w-5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
								className: "text-lg font-bold",
								children: "Register New Property"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs text-muted-foreground",
								children: "Set up building identity, location, configuration units, and media assets."
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-6 pt-3 pb-2 bg-muted/20 border-b",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex items-center justify-between",
								children: STEPS.map((s, i) => {
									const isActive = step === s.id;
									const isPassed = step > s.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center flex-1 last:flex-none",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all " + (isActive ? "bg-primary text-primary-foreground shadow-sm ring-4 ring-primary/15" : isPassed ? "bg-primary/20 text-primary font-semibold" : "bg-muted text-muted-foreground"),
												children: isPassed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5" }) : s.id
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs hidden sm:inline-block " + (isActive ? "font-bold text-foreground" : isPassed ? "font-medium text-foreground/80" : "text-muted-foreground"),
												children: s.name
											})]
										}), i < STEPS.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-0.5 flex-1 mx-3 rounded-full transition-all " + (step > i + 1 ? "bg-primary" : "bg-border") })]
									}, s.id);
								})
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "p-6 overflow-y-auto space-y-4 flex-1",
							children: [
								step === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border bg-muted/20 p-4 space-y-3.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5 text-primary" }), " Property Identity & Classification"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-3 gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "Property Code *"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															value: form.property_code,
															onChange: (e) => setForm((prev) => ({
																...prev,
																property_code: e.target.value
															})),
															placeholder: "e.g. PROP-001 (Auto if blank)",
															className: "bg-background font-mono"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5 col-span-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "Property / Building Name *"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															value: form.title,
															onChange: (e) => setForm((prev) => ({
																...prev,
																title: e.target.value
															})),
															placeholder: "e.g. Al Sadd Commercial Tower / Lusail Marina Residences",
															className: "bg-background font-medium"
														})]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-3 gap-3",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1.5",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-xs font-semibold",
																children: "Property Type *"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
																value: form.property_type,
																onValueChange: (val) => {
																	setForm((prev) => ({
																		...prev,
																		property_type: val
																	}));
																	if (val !== "Other") setCustomPropertyType("");
																},
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
																	className: "bg-background",
																	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select type" })
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [propTypeOptions.length > 0 ? propTypeOptions.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
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
																		value: "Building",
																		children: "Building"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																		value: "Apartment",
																		children: "Apartment"
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																		value: "Villa",
																		children: "Villa"
																	})
																] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Other",
																	children: "Other (Add new)"
																})] })]
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1.5",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-xs font-semibold",
																children: "Property Category *"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
																value: form.property_category,
																onValueChange: (val) => setForm((prev) => ({
																	...prev,
																	property_category: val
																})),
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
																	className: "bg-background",
																	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Category" })
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: propCategoryOptions.length > 0 ? propCategoryOptions.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: opt.id,
																	children: opt.label
																}, opt.id)) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																		value: "Building",
																		children: "Building"
																	}),
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
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1.5",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-xs font-semibold",
																children: "Ownership Type *"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
																value: form.ownership_type,
																onValueChange: (val) => setForm((prev) => ({
																	...prev,
																	ownership_type: val
																})),
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
																	className: "bg-background",
																	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select Ownership" })
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ownershipOptions.length > 0 ? ownershipOptions.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
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
																		value: "Leased",
																		children: "Leased"
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
														})
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-2 gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "Owner / Landlord Name *"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															value: form.owner_landlord,
															onChange: (e) => setForm((prev) => ({
																...prev,
																owner_landlord: e.target.value
															})),
															placeholder: "e.g. Sheikh Hassan Al-Thani",
															className: "bg-background"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "Property Manager *"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															value: form.property_manager,
															onChange: (e) => setForm((prev) => ({
																...prev,
																property_manager: e.target.value
															})),
															placeholder: "e.g. Jithin Abdul Latheef",
															className: "bg-background"
														})]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Description"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
														value: form.description,
														onChange: (e) => setForm((prev) => ({
															...prev,
															description: e.target.value
														})),
														placeholder: "Brief overview of the property, surrounding area, and building amenities...",
														className: "bg-background text-xs resize-none",
														rows: 2
													})]
												})
											]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border bg-muted/20 p-4 space-y-3.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-primary" }), " Location & Qatar Address"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-2 gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "Country *"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															value: form.country,
															onChange: (e) => setForm((prev) => ({
																...prev,
																country: e.target.value
															})),
															className: "bg-background"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "City / Municipality *"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															value: form.city,
															onChange: (e) => setForm((prev) => ({
																...prev,
																city: e.target.value
															})),
															placeholder: "e.g. Doha / Lusail / Al Wakrah",
															className: "bg-background"
														})]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-2 gap-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "Area / Zone *"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															value: form.area_zone,
															onChange: (e) => setForm((prev) => ({
																...prev,
																area_zone: e.target.value
															})),
															placeholder: "e.g. Zone 18 / Old Salata / West Bay",
															className: "bg-background"
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "Street / Building Name *"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															value: form.street_building_name,
															onChange: (e) => setForm((prev) => ({
																...prev,
																street_building_name: e.target.value,
																address: e.target.value
															})),
															placeholder: "e.g. Street 840 / Al Sadd Tower",
															className: "bg-background"
														})]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "grid grid-cols-3 gap-3",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1.5",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-xs font-semibold",
																children: "Plot / Building No."
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																value: form.plot_building_no,
																onChange: (e) => setForm((prev) => ({
																	...prev,
																	plot_building_no: e.target.value
																})),
																placeholder: "e.g. Bldg 23 / Plot 45",
																className: "bg-background"
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1.5",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-xs font-semibold",
																children: "Title Deed / Reg. No."
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																value: form.title_deed_no,
																onChange: (e) => setForm((prev) => ({
																	...prev,
																	title_deed_no: e.target.value
																})),
																placeholder: "e.g. TD-998822",
																className: "bg-background font-mono"
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "space-y-1.5",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
																className: "text-xs font-semibold",
																children: "Municipality / Bldg Ref No."
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
																value: form.municipality_ref_no,
																onChange: (e) => setForm((prev) => ({
																	...prev,
																	municipality_ref_no: e.target.value
																})),
																placeholder: "e.g. MUN-44012",
																className: "bg-background font-mono"
															})]
														})
													]
												})
											]
										})]
									})]
								}),
								step === 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border bg-muted/20 p-4 space-y-3.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5 text-primary" }), " Structure & Capacity"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-4 gap-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "No. of Floors *"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															min: "1",
															value: form.no_of_floors,
															onChange: (e) => setForm((prev) => ({
																...prev,
																no_of_floors: e.target.value
															})),
															placeholder: "e.g. 8",
															className: "bg-background font-mono"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "No. of Units *"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															min: "1",
															value: form.no_of_units,
															onChange: (e) => setForm((prev) => ({
																...prev,
																no_of_units: e.target.value,
																total_units: e.target.value
															})),
															placeholder: "e.g. 44",
															className: "bg-background font-mono"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "Parking Count *"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															min: "0",
															value: form.parking_count,
															onChange: (e) => setForm((prev) => ({
																...prev,
																parking_count: e.target.value
															})),
															placeholder: "e.g. 12",
															className: "bg-background font-mono"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "No of Elevator *"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															min: "0",
															value: form.no_of_elevators,
															onChange: (e) => setForm((prev) => ({
																...prev,
																no_of_elevators: e.target.value
															})),
															placeholder: "e.g. 2",
															className: "bg-background font-mono"
														})]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3 pt-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Total Built-up Area (Sqm)"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														min: "0",
														value: form.total_built_up_area_sqm,
														onChange: (e) => setForm((prev) => ({
															...prev,
															total_built_up_area_sqm: e.target.value
														})),
														placeholder: "e.g. 4500",
														className: "bg-background font-mono"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Common Area (Sqm)"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "number",
														min: "0",
														value: form.common_area_sqm,
														onChange: (e) => setForm((prev) => ({
															...prev,
															common_area_sqm: e.target.value
														})),
														placeholder: "e.g. 600",
														className: "bg-background font-mono"
													})]
												})]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border bg-muted/20 p-4 space-y-3.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-primary" }), " Key Dates, Compliance & Status"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "Completion Date"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "date",
															value: form.completion_date,
															onChange: (e) => setForm((prev) => ({
																...prev,
																completion_date: e.target.value
															})),
															className: "bg-background"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "Handover Date"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "date",
															value: form.handover_date,
															onChange: (e) => setForm((prev) => ({
																...prev,
																handover_date: e.target.value
															})),
															className: "bg-background"
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
															className: "text-xs font-semibold",
															children: "Property Status"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
															value: form.property_status,
															onValueChange: (val) => setForm((prev) => ({
																...prev,
																property_status: val
															})),
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
																className: "bg-background",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Active",
																	children: "Active"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Under Construction",
																	children: "Under Construction"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Under Maintenance",
																	children: "Under Maintenance"
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																	value: "Inactive",
																	children: "Inactive"
																})
															] })]
														})]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-3 items-center pt-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center space-x-2 pt-4",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "checkbox",
														id: "docs_received",
														checked: form.documents_received,
														onChange: (e) => setForm((prev) => ({
															...prev,
															documents_received: e.target.checked
														})),
														className: "h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														htmlFor: "docs_received",
														className: "text-xs font-semibold cursor-pointer",
														children: "Documents Received?"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5 col-span-2",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														className: "text-xs font-semibold",
														children: "Remarks"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: form.remarks,
														onChange: (e) => setForm((prev) => ({
															...prev,
															remarks: e.target.value
														})),
														placeholder: "e.g. Standard residential building under prime management",
														className: "bg-background text-xs"
													})]
												})]
											})
										]
									})]
								}),
								step === 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "space-y-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-xl border bg-muted/20 p-4 space-y-3.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "h-3.5 w-3.5 text-primary" }), " Amenities & Facilities"]
											}), amenitiesList.length < 5 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												type: "button",
												variant: "outline",
												size: "sm",
												className: "h-7 text-xs border-primary/40 text-primary hover:bg-primary/10",
												onClick: () => {
													if (amenitiesList.length < 5) setAmenitiesList([...amenitiesList, ""]);
												},
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "mr-1 h-3.5 w-3.5" }),
													" Add Amenity (",
													amenitiesList.length,
													"/5)"
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2.5",
											children: [amenitiesList.map((amenity, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex-1 space-y-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
														className: "text-[11px] font-medium text-muted-foreground",
														children: [
															"Amenity / Facility ",
															idx + 1,
															" ",
															idx === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-destructive font-bold",
																children: "*"
															})
														]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														value: amenity,
														onChange: (e) => {
															const updated = [...amenitiesList];
															updated[idx] = e.target.value;
															setAmenitiesList(updated);
														},
														placeholder: idx === 0 ? "e.g. Swimming Pool / Fitness Gym (Required)" : idx === 1 ? "e.g. 24/7 Security & Concierge" : idx === 2 ? "e.g. Underground Parking" : idx === 3 ? "e.g. High-Speed Elevators" : "e.g. Rooftop Garden",
														className: "bg-background text-xs h-9"
													})]
												}), amenitiesList.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													type: "button",
													variant: "ghost",
													size: "sm",
													className: "h-9 w-9 p-0 mt-5 text-muted-foreground hover:text-destructive",
													onClick: () => {
														const updated = amenitiesList.filter((_, i) => i !== idx);
														setAmenitiesList(updated.length > 0 ? updated : [""]);
													},
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-4 w-4" })
												})]
											}, idx)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1 pt-1 border-t border-border/40",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-[11px] font-medium text-muted-foreground",
													children: "Other Amenities / Facilities"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: otherAmenities,
													onChange: (e) => setOtherAmenities(e.target.value),
													placeholder: "e.g. Sauna, Jacuzzi, Squash Court, EV Charging Stations...",
													className: "bg-background text-xs h-9"
												})]
											})]
										})]
									})
								}),
								step === 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border bg-muted/20 p-4 space-y-3.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlus, { className: "h-3.5 w-3.5 text-primary" }), " Property Gallery & Floor Plans"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-6 py-3.5 bg-muted/40 border-t flex items-center justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "sm",
								onClick: () => setCreateOpen(false),
								children: "Cancel"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									onClick: handleBack,
									disabled: step === 1 || creating,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "mr-1.5 h-4 w-4" }), " Back"]
								}), step < STEPS.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									onClick: handleNext,
									disabled: step === 1 && (!form.title.trim() || !form.property_code.trim() || !form.property_type.trim() || !form.property_category.trim() || !form.ownership_type.trim() || !form.country.trim() || !form.city.trim() || !form.area_zone.trim() || !form.street_building_name.trim() || !form.owner_landlord.trim() || !form.property_manager.trim()) || step === 2 && (!form.no_of_floors.trim() || !form.no_of_units.trim() || !form.parking_count.trim() || !form.no_of_elevators.trim()) || step === 3 && !amenitiesList.some((a) => a.trim().length > 0),
									children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "ml-1.5 h-4 w-4" })]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									onClick: handleCreateProperty,
									disabled: creating || !form.title.trim() || !form.property_code.trim() || !form.property_type.trim() || !form.property_category.trim() || !form.ownership_type.trim() || !form.country.trim() || !form.city.trim() || !form.area_zone.trim() || !form.street_building_name.trim() || !form.owner_landlord.trim() || !form.property_manager.trim() || !form.no_of_floors.trim() || !form.no_of_units.trim() || !form.parking_count.trim() || !form.no_of_elevators.trim() || !amenitiesList.some((a) => a.trim().length > 0),
									className: "shadow-sm",
									children: [creating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "mr-2 h-4 w-4" }), "Save Property"]
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
