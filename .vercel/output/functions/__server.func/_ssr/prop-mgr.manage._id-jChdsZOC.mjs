import { i as __toESM } from "../_runtime.mjs";
import { A as fetchPropertyById, D as fetchOwnershipTypes, G as updatePropertyImages, I as fetchUnits, M as fetchPropertyTypes, W as updateProperty, h as fetchCostCenters, j as fetchPropertyCategories, y as fetchHostBookings } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { L as Save, en as CircleAlert, in as ChevronLeft, s as Users, st as LoaderCircle, v as Trash2 } from "../_libs/lucide-react.mjs";
import { g as Link, m as createFileRoute, p as lazyRouteComponent, v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as CardHeader, n as CardContent, o as CardTitle, t as Card } from "./card-xVPC106M.mjs";
import { t as Button } from "./button-OuFjfcpS.mjs";
import { t as Input } from "./input-CITjGSX3.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { f as properties, l as leases, m as units } from "./mock-data-B9OWnoA7.mjs";
import { t as Label } from "./label-BPuF5-mq.mjs";
import { t as Textarea } from "./textarea-1llmCJsE.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-BHv1JhlL.mjs";
import { n as buildPropertyPayload, t as ImageUploader } from "./image-uploader-CUKD7wxm.mjs";
import { t as useJsApiLoader } from "../_libs/react-google-maps__api.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prop-mgr.manage._id-jChdsZOC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var $$splitComponentImporter = () => import("./prop-mgr.manage._id-Ba-V9XkJ.mjs");
var Route = createFileRoute("/prop-mgr/manage/$id")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var MOCK_HOST_ID = "00000000-0000-4000-8000-000000000001";
var UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function isUuid(value) {
	return UUID_PATTERN.test(value);
}
function inferPropertyType(type) {
	switch (type) {
		case "Villa Compound": return "villa";
		case "Commercial": return "commercial";
		case "Mixed Use": return "mixed_use";
		default: return "apartment";
	}
}
function mapMockPropertyToManagedProperty(mockProperty) {
	const propertyUnits = units.filter((unit) => unit.propertyId === mockProperty.id);
	const leasedUnits = propertyUnits.filter((unit) => unit.status === "leased");
	const sampleUnit = propertyUnits[0];
	const amenities = (mockProperty.amenities_text || "").split("/").map((amenity) => amenity.trim().toLowerCase().replace(/\s+/g, "_")).filter(Boolean);
	return {
		id: mockProperty.id,
		host_id: MOCK_HOST_ID,
		title: mockProperty.name,
		description: `${mockProperty.property_category || mockProperty.type} in ${mockProperty.city}, ${mockProperty.district}.`,
		property_type: inferPropertyType(mockProperty.type),
		address: mockProperty.street_building_name || "",
		city: mockProperty.city,
		state: "Doha Municipality",
		zip_code: "",
		country: "Qatar",
		max_guests: sampleUnit ? Math.max(sampleUnit.bedrooms * 2, 2) : 2,
		bedrooms: sampleUnit?.bedrooms ?? 0,
		beds: sampleUnit?.bedrooms ?? 0,
		bathrooms: sampleUnit?.bedrooms ?? 0,
		base_price_per_night: sampleUnit?.price ?? 0,
		cleaning_fee: 0,
		is_active: true,
		created_at: "2026-01-01T00:00:00.000Z",
		amenities,
		room_details: [],
		property_code: mockProperty.code,
		property_category: mockProperty.property_category ?? mockProperty.type,
		ownership_type: mockProperty.ownership_type,
		area_zone: mockProperty.area_zone,
		street_building_name: mockProperty.street_building_name,
		property_manager: mockProperty.property_manager,
		no_of_floors: Number.parseInt(String(mockProperty.no_of_floors || "0"), 10) || void 0,
		no_of_units: mockProperty.units,
		parking_count: mockProperty.parking_count,
		no_of_elevators: mockProperty.no_of_elevators,
		municipality_details: {
			owner_landlord: mockProperty.owner_landlord,
			district: mockProperty.district,
			occupancy_rate: Math.round(mockProperty.occupancy * 100),
			leased_units: leasedUnits.length
		}
	};
}
function ManagePropertyPage({ basePath, id }) {
	const navigate = useNavigate();
	const { isLoaded } = useJsApiLoader({
		id: "google-map-script",
		googleMapsApiKey: "AIzaSyCN4v-DS9QmFjoiyaiwN8yfrPeZPbSA_xU",
		libraries: ["places"]
	});
	const [property, setProperty] = (0, import_react.useState)(null);
	const [isMockProperty, setIsMockProperty] = (0, import_react.useState)(false);
	const [bookings, setBookings] = (0, import_react.useState)([]);
	const [unitsCount, setUnitsCount] = (0, import_react.useState)(null);
	const [occupancyPct, setOccupancyPct] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [propCategoryOptions, setPropCategoryOptions] = (0, import_react.useState)([]);
	const [propTypeOptions, setPropTypeOptions] = (0, import_react.useState)([]);
	const [ownershipOptions, setOwnershipOptions] = (0, import_react.useState)([]);
	const [costCenterOptions, setCostCenterOptions] = (0, import_react.useState)([]);
	const [images, setImages] = (0, import_react.useState)([]);
	const [title, setTitle] = (0, import_react.useState)("");
	const [description, setDescription] = (0, import_react.useState)("");
	const [price, setPrice] = (0, import_react.useState)(0);
	const [city, setCity] = (0, import_react.useState)("");
	const [state, setState] = (0, import_react.useState)("");
	const [zipCode, setZipCode] = (0, import_react.useState)("");
	const [country, setCountry] = (0, import_react.useState)("");
	const [address, setAddress] = (0, import_react.useState)("");
	const [isActive, setIsActive] = (0, import_react.useState)(true);
	const [propertyType, setPropertyType] = (0, import_react.useState)("");
	const [customPropertyType, setCustomPropertyType] = (0, import_react.useState)("");
	const [propertyCode, setPropertyCode] = (0, import_react.useState)("");
	const [propertyCategory, setPropertyCategory] = (0, import_react.useState)("");
	const [costCenterCode, setCostCenterCode] = (0, import_react.useState)("");
	const [costCenterName, setCostCenterName] = (0, import_react.useState)("");
	const [proposedPropertyCode, setProposedPropertyCode] = (0, import_react.useState)("");
	const [proposedPropertyName, setProposedPropertyName] = (0, import_react.useState)("");
	const [proposedCostCenterCode, setProposedCostCenterCode] = (0, import_react.useState)("");
	const [proposedCostCenterName, setProposedCostCenterName] = (0, import_react.useState)("");
	const [ownershipType, setOwnershipType] = (0, import_react.useState)("");
	const [areaZone, setAreaZone] = (0, import_react.useState)("");
	const [streetBuildingName, setStreetBuildingName] = (0, import_react.useState)("");
	const [plotBuildingNo, setPlotBuildingNo] = (0, import_react.useState)("");
	const [titleDeedNo, setTitleDeedNo] = (0, import_react.useState)("");
	const [municipalityRefNo, setMunicipalityRefNo] = (0, import_react.useState)("");
	const [ownerLandlord, setOwnerLandlord] = (0, import_react.useState)("");
	const [propertyManager, setPropertyManager] = (0, import_react.useState)("");
	const [noOfFloors, setNoOfFloors] = (0, import_react.useState)("");
	const [noOfUnits, setNoOfUnits] = (0, import_react.useState)("");
	const [totalBuiltUpAreaSqm, setTotalBuiltUpAreaSqm] = (0, import_react.useState)("");
	const [commonAreaSqm, setCommonAreaSqm] = (0, import_react.useState)("");
	const [parkingCount, setParkingCount] = (0, import_react.useState)("");
	const [noOfElevators, setNoOfElevators] = (0, import_react.useState)("");
	const [amenity1, setAmenity1] = (0, import_react.useState)("");
	const [amenity2, setAmenity2] = (0, import_react.useState)("");
	const [amenity3, setAmenity3] = (0, import_react.useState)("");
	const [amenity4, setAmenity4] = (0, import_react.useState)("");
	const [amenity5, setAmenity5] = (0, import_react.useState)("");
	const [otherAmenitiesFacilities, setOtherAmenitiesFacilities] = (0, import_react.useState)("");
	const [completionDate, setCompletionDate] = (0, import_react.useState)("");
	const [handoverDate, setHandoverDate] = (0, import_react.useState)("");
	const [propertyStatus, setPropertyStatus] = (0, import_react.useState)("");
	const [documentsReceived, setDocumentsReceived] = (0, import_react.useState)(false);
	const [remarks, setRemarks] = (0, import_react.useState)("");
	const [kahramaaNumber, setKahramaaNumber] = (0, import_react.useState)("");
	const [municipalityDetails, setMunicipalityDetails] = (0, import_react.useState)("");
	const [roomDetails, setRoomDetails] = (0, import_react.useState)([]);
	const [amenities, setAmenities] = (0, import_react.useState)([]);
	const [predictions, setPredictions] = (0, import_react.useState)([]);
	const [showPredictions, setShowPredictions] = (0, import_react.useState)(false);
	const [loadingPredictions, setLoadingPredictions] = (0, import_react.useState)(false);
	const autocompleteService = (0, import_react.useRef)(null);
	const placesService = (0, import_react.useRef)(null);
	const [currentMonth, setCurrentMonth] = (0, import_react.useState)(/* @__PURE__ */ new Date());
	const populateForm = (prop) => {
		const municipality = prop.municipality_details || {};
		const changeRequest = municipality.change_request || {};
		const facilityAmenities = Array.isArray(municipality.facility_amenities) ? municipality.facility_amenities : [];
		setProperty(prop);
		setTitle(prop.title);
		setDescription(prop.description || "");
		setPrice(prop.base_price_per_night);
		setCity(prop.city);
		setState(prop.state || "");
		setZipCode(prop.zip_code || "");
		setCountry(prop.country);
		setAddress(prop.address);
		setIsActive(prop.is_active);
		setAmenities(prop.amenities || []);
		setImages((prop.property_images || []).map((img) => ({
			id: crypto.randomUUID(),
			url: img.image_url,
			category: "Exterior",
			isCover: img.is_primary
		})));
		setPropertyType(prop.property_type || "");
		setCustomPropertyType("");
		setPropertyCode(prop.property_code || `PROP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
		setPropertyCategory(prop.property_category || "");
		setCostCenterCode(prop.cost_center_code || "");
		setCostCenterName(prop.cost_center_name || "");
		setProposedPropertyCode(changeRequest.property_code_new || "");
		setProposedPropertyName(changeRequest.property_name_new || "");
		setProposedCostCenterCode(changeRequest.cost_center_code_new || "");
		setProposedCostCenterName(changeRequest.cost_center_name_new || "");
		setOwnershipType(prop.ownership_type || "");
		setAreaZone(prop.area_zone || "");
		setStreetBuildingName(prop.street_building_name || "");
		setPlotBuildingNo(prop.plot_building_no || "");
		setTitleDeedNo(prop.title_deed_no || "");
		setMunicipalityRefNo(prop.municipality_ref_no || "");
		setOwnerLandlord(String(municipality.owner_landlord || ""));
		setPropertyManager(prop.property_manager || "");
		setNoOfFloors(String(prop.no_of_floors ?? ""));
		setNoOfUnits(String(prop.no_of_units ?? ""));
		setTotalBuiltUpAreaSqm(String(prop.total_built_up_area_sqm ?? ""));
		setCommonAreaSqm(String(prop.common_area_sqm ?? ""));
		setParkingCount(String(prop.parking_count ?? ""));
		setNoOfElevators(String(prop.no_of_elevators ?? ""));
		setAmenity1(facilityAmenities[0] || "");
		setAmenity2(facilityAmenities[1] || "");
		setAmenity3(facilityAmenities[2] || "");
		setAmenity4(facilityAmenities[3] || "");
		setAmenity5(facilityAmenities[4] || "");
		setOtherAmenitiesFacilities(String(municipality.other_amenities_facilities || ""));
		setCompletionDate(prop.completion_date || "");
		setHandoverDate(prop.handover_date || "");
		setPropertyStatus(prop.property_status || "");
		setDocumentsReceived(Boolean(prop.documents_received));
		setRemarks(prop.remarks || "");
		setKahramaaNumber(prop.kahramaa_number || "");
		setMunicipalityDetails(JSON.stringify(prop.municipality_details || {}, null, 2));
	};
	(0, import_react.useEffect)(() => {
		if (isLoaded && !autocompleteService.current) {
			autocompleteService.current = new window.google.maps.places.AutocompleteService();
			const map = new window.google.maps.Map(document.createElement("div"));
			placesService.current = new window.google.maps.places.PlacesService(map);
		}
	}, [isLoaded]);
	(0, import_react.useEffect)(() => {
		if (!isUuid(id)) {
			const mockProperty = properties.find((item) => item.id === id || item.code === id);
			if (!mockProperty) {
				setError(`No property matched reference "${id}".`);
				setLoading(false);
				return;
			}
			const mappedProperty = mapMockPropertyToManagedProperty(mockProperty);
			const propertyUnits = units.filter((unit) => unit.propertyId === mockProperty.id);
			const activeLeases = leases.filter((lease) => propertyUnits.some((unit) => unit.id === lease.unitId)).filter((lease) => lease.status === "active" || lease.status === "expiring").length;
			setIsMockProperty(true);
			setError(null);
			populateForm(mappedProperty);
			setRoomDetails(Array.isArray(mappedProperty.room_details) ? mappedProperty.room_details : []);
			setBookings([]);
			setUnitsCount(propertyUnits.length || mockProperty.units || 0);
			setOccupancyPct(propertyUnits.length ? Math.round(activeLeases / propertyUnits.length * 100) : Math.round(mockProperty.occupancy * 100));
			setLoading(false);
			return;
		}
		setIsMockProperty(false);
		Promise.all([
			fetchPropertyById(id),
			fetchHostBookings(MOCK_HOST_ID),
			fetchPropertyCategories(),
			fetchPropertyTypes(),
			fetchOwnershipTypes(),
			fetchCostCenters()
		]).then(([prop, bks, pc, pt, ow, cc]) => {
			setPropCategoryOptions(pc);
			setPropTypeOptions(pt);
			setOwnershipOptions(ow);
			setCostCenterOptions(cc);
			populateForm(prop);
			if (prop.room_details) if (!Array.isArray(prop.room_details)) {
				const arr = [];
				const old = prop.room_details;
				if (old.bedroom?.length) arr.push({
					id: crypto.randomUUID(),
					type: "bedroom",
					name: "Bedroom",
					length: old.bedroom.length,
					width: old.bedroom.width,
					unit: old.bedroom.unit
				});
				if (old.bathroom?.length) arr.push({
					id: crypto.randomUUID(),
					type: "bathroom",
					name: "Bathroom",
					length: old.bathroom.length,
					width: old.bathroom.width,
					unit: old.bathroom.unit
				});
				if (old.kitchen?.has) arr.push({
					id: crypto.randomUUID(),
					type: "kitchen",
					name: "Kitchen",
					length: old.kitchen.length,
					width: old.kitchen.width,
					unit: old.kitchen.unit
				});
				if (old.balcony?.has) arr.push({
					id: crypto.randomUUID(),
					type: "balcony",
					name: "Balcony",
					length: old.balcony.length,
					width: old.balcony.width,
					unit: old.balcony.unit
				});
				setRoomDetails(arr);
			} else setRoomDetails(prop.room_details);
			setBookings(bks.filter((b) => b.property_id === id));
			(async () => {
				try {
					const units = await fetchUnits({ property_id: id });
					setUnitsCount(units.length || 0);
					const occupiedUnits = (units || []).filter((u) => u.status?.toLowerCase() === "occupied" || u.lease_status?.toLowerCase() === "leased" || u.lease_status?.toLowerCase() === "active").length;
					setOccupancyPct(units.length ? Math.round(occupiedUnits / units.length * 100) : 0);
				} catch (e) {
					setUnitsCount(null);
					setOccupancyPct(null);
				}
			})();
		}).catch((err) => setError(err.message)).finally(() => setLoading(false));
	}, [id]);
	const handleAddressSearch = (val) => {
		setAddress(val);
		if (!val.trim()) {
			setPredictions([]);
			setShowPredictions(false);
			return;
		}
		if (autocompleteService.current) {
			setLoadingPredictions(true);
			autocompleteService.current.getPlacePredictions({
				input: val,
				types: ["address"]
			}, (results, status) => {
				setLoadingPredictions(false);
				if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
					setPredictions(results);
					setShowPredictions(true);
				} else setPredictions([]);
			});
		}
	};
	const handleSelectPrediction = (placeId, descriptionStr) => {
		setAddress(descriptionStr);
		setShowPredictions(false);
		if (placesService.current) placesService.current.getDetails({
			placeId,
			fields: ["address_components"]
		}, (place, status) => {
			if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.address_components) {
				let stNumber = "";
				let route = "";
				let c = "";
				let s = "";
				let cntry = "";
				let z = "";
				place.address_components.forEach((comp) => {
					const types = comp.types;
					if (types.includes("street_number")) stNumber = comp.long_name;
					if (types.includes("route")) route = comp.long_name;
					if (types.includes("locality") || types.includes("postal_town")) c = comp.long_name;
					if (types.includes("administrative_area_level_1")) s = comp.long_name;
					if (types.includes("country")) cntry = comp.long_name;
					if (types.includes("postal_code")) z = comp.long_name;
				});
				setAddress(`${stNumber} ${route}`.trim() || descriptionStr.split(",")[0]);
				if (c) setCity(c);
				if (s) setState(s);
				if (cntry) setCountry(cntry);
				if (z) setZipCode(z);
			}
		});
	};
	const handleSave = async () => {
		if (!property) return;
		const payload = buildPropertyPayload({
			title,
			description,
			propertyType: propertyType === "Other" ? customPropertyType : propertyType || property.property_type,
			address,
			city,
			state,
			zipCode,
			country,
			basePricePerNight: price,
			maxGuests: property.max_guests,
			bedrooms: property.bedrooms,
			beds: property.beds,
			bathrooms: property.bathrooms,
			cleaningFee: property.cleaning_fee,
			isActive,
			roomDetails,
			amenities,
			propertyCode,
			costCenterCode,
			costCenterName,
			propertyCategory,
			ownershipType,
			areaZone,
			streetBuildingName,
			plotBuildingNo,
			titleDeedNo,
			municipalityRefNo,
			propertyManager,
			noOfFloors,
			noOfUnits,
			totalUnits: noOfUnits,
			totalBuiltUpAreaSqm,
			commonAreaSqm,
			parkingCount,
			noOfElevators,
			amenityFields: [
				amenity1,
				amenity2,
				amenity3,
				amenity4,
				amenity5
			],
			otherAmenitiesFacilities,
			completionDate,
			handoverDate,
			propertyStatus,
			documentsReceived,
			remarks,
			kahramaaNumber,
			municipalityDetails,
			proposedFields: {
				propertyCode: proposedPropertyCode,
				propertyName: proposedPropertyName,
				costCenterCode: proposedCostCenterCode,
				costCenterName: proposedCostCenterName
			},
			ownerLandlord
		});
		if (isMockProperty) {
			setProperty({
				...property,
				...payload,
				title,
				description,
				property_type: propertyType || property.property_type,
				base_price_per_night: price,
				city,
				state,
				zip_code: zipCode,
				country,
				address,
				is_active: isActive,
				room_details: roomDetails,
				amenities,
				property_category: propertyCategory
			});
			toast.success("Demo property updated in the current session.");
			return;
		}
		setSaving(true);
		try {
			await updateProperty(property.id, payload);
			await updatePropertyImages(property.id, images.map((img, idx) => ({
				image_url: img.url,
				is_primary: img.isCover,
				display_order: idx
			})));
			toast.success("Property updated successfully!");
		} catch (err) {
			toast.error("Failed to save: " + err.message);
		} finally {
			setSaving(false);
		}
	};
	const handleDelete = async () => {
		if (!confirm("Are you sure you want to deactivate this listing?")) return;
		if (isMockProperty) {
			toast.success("Demo property marked inactive for this session.");
			navigate({ to: `${basePath}/properties` });
			return;
		}
		try {
			await updateProperty(id, { is_active: false });
			toast.success("Listing deactivated.");
			navigate({ to: "/prop-mgr" });
		} catch (err) {
			toast.error("Failed: " + err.message);
		}
	};
	const [maintenanceOpen, setMaintenanceOpen] = (0, import_react.useState)(false);
	const [ticketTitle, setTicketTitle] = (0, import_react.useState)("");
	const [ticketDesc, setTicketDesc] = (0, import_react.useState)("");
	const [ticketUnit, setTicketUnit] = (0, import_react.useState)("");
	const [ticketPriority, setTicketPriority] = (0, import_react.useState)("medium");
	const [ticketCategory, setTicketCategory] = (0, import_react.useState)("general");
	const [submittingTicket, setSubmittingTicket] = (0, import_react.useState)(false);
	(0, import_react.useMemo)(() => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const firstDay = new Date(year, month, 1).getDay();
		const days = [];
		for (let i = 0; i < firstDay; i++) days.push(null);
		for (let i = 1; i <= daysInMonth; i++) {
			const dateStr = new Date(year, month, i).toISOString().split("T")[0];
			const isBooked = bookings.some((b) => {
				const checkIn = new Date(b.check_in).toISOString().split("T")[0];
				const checkOut = new Date(b.check_out).toISOString().split("T")[0];
				return dateStr >= checkIn && dateStr < checkOut;
			});
			days.push({
				day: i,
				dateStr,
				isBooked
			});
		}
		return days;
	}, [currentMonth, bookings]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen flex-col items-center justify-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-10 w-10 animate-spin text-primary" })
	});
	if (error || !property) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen flex-col items-center justify-center p-8",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "mx-auto h-12 w-12 text-destructive mb-4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold",
					children: "Property not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground mt-2",
					children: error
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: `${basePath}/properties`,
						children: "Back to Properties"
					})
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					className: "mb-2 -ml-3",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: `${basePath}/properties`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "mr-1 h-4 w-4" }), " Back to Properties"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-bold tracking-tight text-foreground",
					children: "Edit Property"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: [
						property.title,
						" · ",
						property.city,
						", ",
						property.country
					]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					className: "text-destructive border-destructive hover:bg-destructive/10",
					onClick: handleDelete,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 h-4 w-4" }), " Deactivate"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "bg-primary hover:bg-primary/90 text-primary-foreground",
					onClick: handleSave,
					disabled: saving,
					children: [saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mr-2 h-4 w-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "mr-2 h-4 w-4" }), saving ? "Saving..." : "Save Changes"]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-8 md:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:col-span-2 space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Property Identity" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2 col-span-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Listing Title" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: title,
											onChange: (e) => setTitle(e.target.value)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Property Code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: propertyCode,
											onChange: (e) => setPropertyCode(e.target.value),
											disabled: true,
											className: "bg-muted"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
											className: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
											value: isActive ? "active" : "inactive",
											onChange: (e) => setIsActive(e.target.value === "active"),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "active",
												children: "Active"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: "inactive",
												children: "Inactive"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Cost Center Code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono",
												children: "🔒 Locked"
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											readOnly: true,
											value: costCenterCode || (property ? `CC-PROP-${property.id.slice(0, 8).toUpperCase()}` : "CC-PROP-DEFAULT"),
											className: "bg-muted font-mono font-semibold",
											placeholder: "Cost Center Code"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Cost Center Name" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											readOnly: true,
											value: costCenterName || title || property?.title || "Property Cost Center",
											className: "bg-muted font-medium",
											placeholder: "Auto-synced Cost Center"
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: description,
									onChange: (e) => setDescription(e.target.value),
									className: "h-20"
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Photos" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
							images,
							onChange: setImages,
							categories: [
								"Exterior",
								"Interior",
								"Floor Plan",
								"Other"
							]
						}) })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Classification" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
							className: "space-y-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Property Type" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: propertyType,
												onValueChange: (v) => {
													setPropertyType(v);
													if (v !== "Other") setCustomPropertyType("");
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select type" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
													propTypeOptions.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: u.id,
														children: u.label
													}, u.id)),
													propertyType && propertyType !== "Other" && !propTypeOptions.find((o) => o.id === propertyType) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: propertyType,
														className: "capitalize",
														children: propertyType
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "Other",
														children: "Other (Add new)"
													})
												] })]
											}),
											propertyType === "Other" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-1 flex gap-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													placeholder: "Enter custom type...",
													value: customPropertyType,
													onChange: (e) => setCustomPropertyType(e.target.value),
													className: "h-8 text-xs"
												})
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Property Category" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: propertyCategory,
											onValueChange: (v) => setPropertyCategory(v),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select category" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: propCategoryOptions.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: u.id,
												children: u.label
											}, u.id)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ownership Type" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: ownershipType,
											onValueChange: (v) => setOwnershipType(v),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Select ownership" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ownershipOptions.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: u.id,
												children: u.label
											}, u.id)) })]
										})]
									})
								]
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Location" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2 relative",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Street Address" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											value: address,
											onChange: (e) => handleAddressSearch(e.target.value),
											onFocus: () => {
												if (predictions.length > 0) setShowPredictions(true);
											}
										}),
										showPredictions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg overflow-hidden max-h-60 overflow-y-auto",
											children: [loadingPredictions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "p-3 text-sm text-muted-foreground flex items-center",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-4 w-4 mr-2 animate-spin" }), " Loading..."]
											}), !loadingPredictions && predictions.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "px-4 py-3 cursor-pointer hover:bg-muted text-sm border-b border-border last:border-0",
												onClick: () => handleSelectPrediction(p.place_id, p.description),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "font-medium",
													children: p.structured_formatting.main_text
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "text-muted-foreground text-xs",
													children: p.structured_formatting.secondary_text
												})]
											}, p.place_id))]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-2 gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Country" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: country,
												onChange: (e) => setCountry(e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "City" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: city,
												onChange: (e) => setCity(e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "State / Province" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: state,
												onChange: (e) => setState(e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Zip / Postal Code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: zipCode,
												onChange: (e) => setZipCode(e.target.value)
											})]
										})
									]
								}),
								(city || country) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 aspect-video rounded-xl border border-border overflow-hidden",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
										width: "100%",
										height: "100%",
										style: { border: 0 },
										loading: "lazy",
										allowFullScreen: true,
										referrerPolicy: "no-referrer-when-downgrade",
										src: `https://www.google.com/maps/embed/v1/place?key=AIzaSyCN4v-DS9QmFjoiyaiwN8yfrPeZPbSA_xU&q=${encodeURIComponent(`${address}, ${city}, ${country}`)}`
									})
								})
							]
						})]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Property Summary" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Units"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: unitsCount ?? "—"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Occupancy"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-semibold",
									children: occupancyPct != null ? `${occupancyPct}%` : "—"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${property.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`,
									children: property.is_active ? "Active" : "Inactive"
								})]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Quick Actions" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "space-y-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							className: "w-full justify-start",
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: `${basePath}/units`,
								search: { property_id: id },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "mr-2 h-4 w-4" }), " Manage Units"]
							})
						})
					})]
				})]
			})]
		})]
	});
}
//#endregion
export { Route as n, ManagePropertyPage as t };
