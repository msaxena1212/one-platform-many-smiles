import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { n as X, p as Upload } from "../_libs/lucide-react.mjs";
import { t as Badge } from "./badge-D1Dupn2y.mjs";
import { t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as useDropzone } from "../_libs/react-dropzone.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/image-uploader-CUKD7wxm.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function buildPropertyPayload(input) {
	const amenityValues = input.amenities ?? (input.amenityFields ?? []).filter(Boolean);
	const municipalityPayload = buildMunicipalityPayload(input.municipalityDetails, input.ownerLandlord, amenityValues, input.otherAmenitiesFacilities, input.proposedFields);
	return {
		host_id: input.hostId,
		title: input.title,
		description: input.description ?? null,
		property_type: input.propertyType || "apartment",
		address: input.address,
		city: input.city,
		state: input.state || void 0,
		zip_code: input.zipCode || void 0,
		country: input.country,
		max_guests: Number(input.maxGuests) || 1,
		bedrooms: Number(input.bedrooms) || 1,
		beds: Number(input.beds) || 1,
		bathrooms: Number(input.bathrooms) || 1,
		base_price_per_night: Number(input.basePricePerNight) || 0,
		cleaning_fee: Number(input.cleaningFee) || 0,
		is_active: input.isActive ?? true,
		room_details: input.roomDetails ?? {},
		property_code: input.propertyCode || void 0,
		cost_center_code: input.costCenterCode || void 0,
		cost_center_name: input.costCenterName || void 0,
		property_category: input.propertyCategory || void 0,
		ownership_type: input.ownershipType || void 0,
		area_zone: input.areaZone || void 0,
		street_building_name: input.streetBuildingName || void 0,
		plot_building_no: input.plotBuildingNo || void 0,
		title_deed_no: input.titleDeedNo || void 0,
		municipality_ref_no: input.municipalityRefNo || void 0,
		property_manager: input.propertyManager || void 0,
		no_of_floors: input.noOfFloors ? Number(input.noOfFloors) : void 0,
		no_of_units: input.noOfUnits ? Number(input.noOfUnits) : input.totalUnits ? Number(input.totalUnits) : void 0,
		total_units: input.totalUnits ? Number(input.totalUnits) : input.noOfUnits ? Number(input.noOfUnits) : void 0,
		total_built_up_area_sqm: input.totalBuiltUpAreaSqm ? Number(input.totalBuiltUpAreaSqm) : void 0,
		common_area_sqm: input.commonAreaSqm ? Number(input.commonAreaSqm) : void 0,
		parking_count: input.parkingCount ? Number(input.parkingCount) : void 0,
		no_of_elevators: input.noOfElevators ? Number(input.noOfElevators) : void 0,
		completion_date: input.completionDate || void 0,
		handover_date: input.handoverDate || void 0,
		property_status: input.propertyStatus || void 0,
		documents_received: Boolean(input.documentsReceived),
		remarks: input.remarks || void 0,
		kahramaa_number: input.kahramaaNumber || void 0,
		municipality_details: municipalityPayload
	};
}
function buildMunicipalityPayload(municipalityDetails, ownerLandlord, amenitiesFields, otherAmenitiesFacilities, proposedFields) {
	let municipality = null;
	try {
		municipality = municipalityDetails ? JSON.parse(municipalityDetails) : null;
	} catch {
		municipality = municipalityDetails;
	}
	return {
		...typeof municipality === "object" && municipality !== null ? municipality : {},
		owner_landlord: ownerLandlord || void 0,
		facility_amenities: amenitiesFields.filter(Boolean),
		other_amenities_facilities: otherAmenitiesFacilities || void 0,
		change_request: {
			property_code_new: proposedFields?.propertyCode || void 0,
			property_name_new: proposedFields?.propertyName || void 0,
			cost_center_code_new: proposedFields?.costCenterCode || void 0,
			cost_center_name_new: proposedFields?.costCenterName || void 0
		}
	};
}
function ImageUploader({ images, onChange, categories }) {
	const [draggedId, setDraggedId] = (0, import_react.useState)(null);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop: (0, import_react.useCallback)((acceptedFiles) => {
			const newImages = acceptedFiles.map((file) => ({
				id: crypto.randomUUID(),
				url: URL.createObjectURL(file),
				file,
				category: categories[0] || "Uncategorized",
				isCover: images.length === 0
			}));
			onChange([...images, ...newImages]);
		}, [
			images,
			onChange,
			categories
		]),
		accept: { "image/*": [
			".jpeg",
			".jpg",
			".png",
			".webp"
		] }
	});
	const removeImage = (id) => {
		const filtered = images.filter((img) => img.id !== id);
		if (filtered.length > 0 && images.find((i) => i.id === id)?.isCover) filtered[0].isCover = true;
		onChange(filtered);
	};
	const setCover = (id) => {
		onChange(images.map((img) => ({
			...img,
			isCover: img.id === id
		})));
	};
	const updateCategory = (id, category) => {
		onChange(images.map((img) => img.id === id ? {
			...img,
			category
		} : img));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			...getRootProps(),
			className: `border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { ...getInputProps() }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "mx-auto h-10 w-10 text-muted-foreground mb-4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "text-lg font-medium",
					children: "Drag & drop photos here"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "PNG, JPG, WEBP up to 10MB"
				})
			]
		}), images.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 md:grid-cols-4 gap-4 mt-4",
			children: images.map((img, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: `overflow-hidden relative group ${img.isCover ? "ring-2 ring-primary" : ""}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "aspect-square relative",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: img.url,
						alt: "Uploaded preview",
						className: "object-cover w-full h-full"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-between items-start",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: "bg-background/80 hover:bg-background text-[10px] cursor-pointer",
								onClick: () => setCover(img.id),
								children: img.isCover ? "Cover Photo" : "Set as Cover"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "icon",
								variant: "destructive",
								className: "h-6 w-6 rounded-full",
								onClick: () => removeImage(img.id),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3 w-3" })
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "h-7 text-xs rounded bg-background/90 text-foreground border-0 px-2",
							value: img.category,
							onChange: (e) => updateCategory(img.id, e.target.value),
							children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: c,
								children: c
							}, c))
						})]
					})]
				})
			}, img.id))
		})]
	});
}
//#endregion
export { buildPropertyPayload as n, ImageUploader as t };
