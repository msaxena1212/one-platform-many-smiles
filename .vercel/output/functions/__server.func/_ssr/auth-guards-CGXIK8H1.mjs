import { i as __toESM } from "../_runtime.mjs";
import { B as supabase } from "./supabase-DXZNSXc4.mjs";
import { c as require_jsx_runtime } from "../_libs/@radix-ui/react-arrow+[...].mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { sn as Check } from "../_libs/lucide-react.mjs";
import { n as getLandingRouteForRole } from "./console-config-CLs2PqkZ.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { r as getDemoSession } from "./demo-auth-Dw5zdnz8.mjs";
import { t as getImpersonationSession } from "./impersonation-BBADrwZA.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "../_libs/@radix-ui/react-checkbox+[...].mjs";
import { M as redirect } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as resolveTenantContextId } from "./tenant-context-xAvPY413.mjs";
import { a as canAccessConsole } from "./rbac-BdxjsjU4.mjs";
import { A as fetchAssetConditions, F as fetchDesignations, H as fetchWorkLocations, I as fetchEmployeeStatuses, L as fetchEmploymentTypes, M as fetchAssetStatuses, P as fetchDepartments, j as fetchAssetOwnershipTypes, k as fetchAssetCategories, z as fetchGenders } from "./supabase-masters-ssPWjMMY.mjs";
import { n as utils, r as writeSync, t as readSync } from "../_libs/xlsx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-guards-CGXIK8H1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
var referenceDropdowns = {
	propertyTypes: [
		{
			label: "Residential",
			value: "Residential"
		},
		{
			label: "Commercial",
			value: "Commercial"
		},
		{
			label: "Mixed Use",
			value: "Mixed Use"
		},
		{
			label: "Retail",
			value: "Retail"
		}
	],
	propertyCategories: [
		{
			label: "Building",
			value: "Building"
		},
		{
			label: "Villa Compound",
			value: "Villa Compound"
		},
		{
			label: "Tower",
			value: "Tower"
		},
		{
			label: "Mall",
			value: "Mall"
		}
	],
	ownershipTypes: [
		{
			label: "Owned",
			value: "Owned"
		},
		{
			label: "Leased",
			value: "Leased"
		},
		{
			label: "Managed for Owner",
			value: "Managed for Owner"
		},
		{
			label: "Joint Venture",
			value: "Joint Venture"
		}
	],
	propertyStatuses: [
		{
			label: "Active",
			value: "Active"
		},
		{
			label: "Inactive",
			value: "Inactive"
		},
		{
			label: "Under Development",
			value: "Under Development"
		},
		{
			label: "Under Renovation",
			value: "Under Renovation"
		}
	],
	unitStatuses: [
		{
			label: "Available",
			value: "Available"
		},
		{
			label: "Occupied",
			value: "Occupied"
		},
		{
			label: "Reserved",
			value: "Reserved"
		},
		{
			label: "Under Maintenance",
			value: "Under Maintenance"
		}
	],
	rentFrequencies: [
		{
			label: "Monthly",
			value: "Monthly"
		},
		{
			label: "Quarterly",
			value: "Quarterly"
		},
		{
			label: "Half Yearly",
			value: "Half Yearly"
		},
		{
			label: "Yearly",
			value: "Yearly"
		}
	],
	paymentModes: [
		{
			label: "Cash",
			value: "cash"
		},
		{
			label: "Bank Transfer",
			value: "bank_transfer"
		},
		{
			label: "Cheque / PDC",
			value: "cheque"
		},
		{
			label: "SADAD",
			value: "sadad"
		},
		{
			label: "Mada",
			value: "mada"
		}
	],
	customerTypes: [{
		label: "Individual",
		value: "individual"
	}, {
		label: "Corporate",
		value: "corporate"
	}],
	pendingUploadFields: [
		{
			label: "National ID / Passport Copy",
			value: "national_id"
		},
		{
			label: "Contract / Lease Copy",
			value: "contract_copy"
		},
		{
			label: "PDC Schedule",
			value: "pdc_schedule"
		},
		{
			label: "Security Deposit Receipt",
			value: "deposit_receipt"
		},
		{
			label: "Utility Transfer Form",
			value: "utility_transfer"
		}
	],
	accountTypes: [
		{
			label: "Asset",
			value: "asset"
		},
		{
			label: "Liability",
			value: "liability"
		},
		{
			label: "Income",
			value: "income"
		},
		{
			label: "Expense",
			value: "expense"
		}
	]
};
var PROPERTY_COLUMNS = [
	{
		key: "property_code",
		label: "Property Code",
		type: "string",
		required: true,
		unique: true,
		immutable: true,
		sampleValue: "AAA",
		description: "Unique property identification code"
	},
	{
		key: "title",
		label: "Property Name",
		type: "string",
		required: true,
		sampleValue: "OLD SALATA - BLDG23"
	},
	{
		key: "cost_center_code",
		label: "Cost Center Code",
		type: "string",
		required: false,
		sampleValue: "CC-DOH-01"
	},
	{
		key: "cost_center_name",
		label: "Cost Center Name",
		type: "string",
		required: false,
		sampleValue: "Old Salata Operations"
	},
	{
		key: "property_type",
		label: "Property Type",
		type: "enum",
		required: true,
		allowedValues: referenceDropdowns.propertyTypes.map((p) => p.value),
		sampleValue: "Residential"
	},
	{
		key: "property_category",
		label: "Property Category",
		type: "enum",
		required: false,
		allowedValues: referenceDropdowns.propertyCategories.map((p) => p.value),
		sampleValue: "Building"
	},
	{
		key: "ownership_type",
		label: "Ownership Type",
		type: "enum",
		required: false,
		allowedValues: referenceDropdowns.ownershipTypes.map((p) => p.value),
		sampleValue: "Leased"
	},
	{
		key: "country",
		label: "Country",
		type: "string",
		required: true,
		sampleValue: "Qatar"
	},
	{
		key: "city",
		label: "City",
		type: "string",
		required: true,
		sampleValue: "Doha"
	},
	{
		key: "area_zone",
		label: "Area / Zone",
		type: "string",
		required: false,
		sampleValue: "Area 18"
	},
	{
		key: "street_building_name",
		label: "Street / Building Name",
		type: "string",
		required: false,
		sampleValue: "Street 840"
	},
	{
		key: "plot_building_no",
		label: "Plot / Building No.",
		type: "string",
		required: false,
		sampleValue: "Bldg 23"
	},
	{
		key: "title_deed_no",
		label: "Title Deed / Registration No.",
		type: "string",
		required: false,
		sampleValue: "TD-998822"
	},
	{
		key: "municipality_ref_no",
		label: "Municipality / Building Ref No.",
		type: "string",
		required: false,
		sampleValue: "MUN-44012"
	},
	{
		key: "owner_landlord",
		label: "Owner / Landlord",
		type: "string",
		required: false,
		sampleValue: "Sheikh Hassan Al-Thani"
	},
	{
		key: "property_manager",
		label: "Property Manager",
		type: "string",
		required: false,
		sampleValue: "Jithin Abdul Latheef"
	},
	{
		key: "no_of_floors",
		label: "No. of Floors",
		type: "number",
		required: false,
		sampleValue: 8
	},
	{
		key: "no_of_units",
		label: "No. of Units",
		type: "number",
		required: false,
		sampleValue: 44
	},
	{
		key: "total_built_up_area_sqm",
		label: "Total Built-up Area Sqm",
		type: "number",
		required: false,
		sampleValue: 4500
	},
	{
		key: "common_area_sqm",
		label: "Common Area Sqm",
		type: "number",
		required: false,
		sampleValue: 600
	},
	{
		key: "parking_count",
		label: "Parking Count",
		type: "number",
		required: false,
		sampleValue: 12
	},
	{
		key: "no_of_elevators",
		label: "No of Elevator",
		type: "number",
		required: false,
		sampleValue: 2
	},
	{
		key: "amenity_1",
		label: "Amenity / Facility 1",
		type: "string",
		required: false,
		sampleValue: "Swimming Pool"
	},
	{
		key: "amenity_2",
		label: "Amenity / Facility 2",
		type: "string",
		required: false,
		sampleValue: "Fitness Center / Gym"
	},
	{
		key: "amenity_3",
		label: "Amenity / Facility 3",
		type: "string",
		required: false,
		sampleValue: "24/7 Security & CCTV"
	},
	{
		key: "amenity_4",
		label: "Amenity / Facility 4",
		type: "string",
		required: false,
		sampleValue: "Covered Basement Parking"
	},
	{
		key: "amenity_5",
		label: "Amenity / Facility 5",
		type: "string",
		required: false,
		sampleValue: "Kids Play Area"
	},
	{
		key: "other_amenities",
		label: "Other Amenities / Facilities",
		type: "string",
		required: false,
		sampleValue: "Sauna, Steam Room"
	},
	{
		key: "completion_date",
		label: "Completion Date",
		type: "date",
		required: false,
		sampleValue: "2022-01-15"
	},
	{
		key: "handover_date",
		label: "Handover Date",
		type: "date",
		required: false,
		sampleValue: "2022-03-01"
	},
	{
		key: "property_status",
		label: "Property Status",
		type: "enum",
		required: false,
		allowedValues: referenceDropdowns.propertyStatuses.map((p) => p.value),
		sampleValue: "Active"
	},
	{
		key: "documents_received",
		label: "Documents Received?",
		type: "boolean",
		required: false,
		sampleValue: "Yes",
		description: "Yes or No / True or False"
	},
	{
		key: "remarks",
		label: "Remarks",
		type: "string",
		required: false,
		sampleValue: "Standard residential property"
	}
];
var propertyAdapter = {
	module: "property",
	label: "Property",
	primaryKeyLabel: "Property Code",
	primaryKeyField: "property_code",
	columns: PROPERTY_COLUMNS,
	getTemplateColumns(operation) {
		if (operation === "DELETE") return [PROPERTY_COLUMNS.find((c) => c.key === "property_code"), PROPERTY_COLUMNS.find((c) => c.key === "title")];
		return PROPERTY_COLUMNS;
	},
	resolveRecordKey(row) {
		const raw = row["Property Code"] ?? row["property_code"] ?? row["Property code"] ?? "";
		return String(raw).trim();
	},
	async fetchExistingRecords(keys) {
		const map = /* @__PURE__ */ new Map();
		if (keys.length === 0) return map;
		try {
			const { data, error } = await supabase.from("properties").select("*").in("property_code", keys);
			if (!error && data) {
				for (const row of data) if (row.property_code) map.set(row.property_code.trim().toUpperCase(), row);
			}
		} catch (e) {
			console.error("Error fetching existing properties:", e);
		}
		return map;
	},
	async validateRow(row, operation, context) {
		const errors = [];
		const warnings = [];
		const changes = [];
		const dependencies = [];
		const normalized = {};
		const propCode = propertyAdapter.resolveRecordKey(row);
		if (!propCode) errors.push({
			row: context.rowNumber,
			field: "Property Code",
			code: "VAL_001",
			message: "Property Code is required.",
			severity: "ERROR",
			resolution: "Provide a unique Property Code."
		});
		if (propCode) {
			const upperCode = propCode.toUpperCase();
			if (context.inBatchKeys.has(upperCode)) errors.push({
				row: context.rowNumber,
				field: "Property Code",
				code: "DUP_001",
				message: `Duplicate Property Code "${propCode}" within the Excel file.`,
				severity: "ERROR",
				resolution: "Ensure each Property Code appears only once in the file."
			});
		}
		const existingRecord = context.existingRecord;
		if (operation === "CREATE") {
			if (existingRecord) errors.push({
				row: context.rowNumber,
				field: "Property Code",
				code: "DUP_002",
				message: `Property "${propCode}" already exists in the database.`,
				severity: "ERROR",
				resolution: "Use a unique Property Code or use UPDATE operation."
			});
		} else if (!existingRecord) errors.push({
			row: context.rowNumber,
			field: "Property Code",
			code: operation === "UPDATE" ? "UPD_001" : "DEL_001",
			message: `Property "${propCode}" was not found in the database.`,
			severity: "ERROR",
			resolution: "Verify the Property Code matches an active property."
		});
		for (const col of PROPERTY_COLUMNS) {
			const cellValue = row[col.label] ?? row[col.label + " *"] ?? row[col.key];
			if (operation === "DELETE") continue;
			if (operation === "CREATE" && col.required && (cellValue === void 0 || cellValue === null || String(cellValue).trim() === "")) errors.push({
				row: context.rowNumber,
				field: col.label,
				code: "VAL_001",
				message: `${col.label} is required.`,
				severity: "ERROR",
				resolution: `Fill in a valid ${col.label}.`
			});
			if (cellValue !== void 0 && cellValue !== null && String(cellValue).trim() !== "") {
				const strVal = String(cellValue).trim();
				if (strVal === "[NULL]") normalized[col.key] = null;
				else if (col.type === "number") {
					const num = Number(strVal.replace(/,/g, ""));
					if (isNaN(num)) errors.push({
						row: context.rowNumber,
						field: col.label,
						code: "VAL_005",
						message: `${col.label} must be a valid number.`,
						severity: "ERROR"
					});
					else normalized[col.key] = num;
				} else if (col.type === "enum" && col.allowedValues) {
					const matched = col.allowedValues.find((v) => v.toLowerCase() === strVal.toLowerCase());
					if (!matched) {
						warnings.push({
							row: context.rowNumber,
							field: col.label,
							code: "VAL_002",
							message: `Value "${strVal}" for ${col.label} is not in standard options.`,
							severity: "WARNING",
							resolution: `Allowed: ${col.allowedValues.join(", ")}`
						});
						normalized[col.key] = strVal;
					} else normalized[col.key] = matched;
				} else normalized[col.key] = strVal;
			}
		}
		if (operation === "UPDATE" && existingRecord) for (const col of PROPERTY_COLUMNS) {
			if (col.immutable) continue;
			const oldVal = existingRecord[col.key] ?? (col.key === "title" ? existingRecord.title : null);
			const cellValue = row[col.label] ?? row[col.label + " *"] ?? row[col.key];
			if (cellValue === void 0 || cellValue === null || String(cellValue).trim() === "") continue;
			const newVal = normalized[col.key];
			if (String(oldVal ?? "").trim() !== String(newVal ?? "").trim()) changes.push({
				field: col.key,
				label: col.label,
				oldValue: oldVal ?? "—",
				newValue: newVal === null ? "[CLEARED]" : newVal,
				status: newVal === null ? "CLEARED" : "CHANGED"
			});
		}
		if (operation === "DELETE" && existingRecord) try {
			const propId = existingRecord.id;
			const [unitsRes, assetsRes, leasesRes] = await Promise.allSettled([
				supabase.from("units").select("id, unit_code", { count: "exact" }).eq("property_id", propId),
				supabase.from("assets").select("id", { count: "exact" }).eq("assigned_property_id", propId),
				supabase.from("leases").select("id", { count: "exact" }).eq("property_id", propId).in("lease_status", [
					"ACTIVE",
					"RENEWAL_CONFIRMED",
					"KEY_HANDED_OVER"
				])
			]);
			const unitCount = unitsRes.status === "fulfilled" ? unitsRes.value.count ?? 0 : 0;
			const assetCount = assetsRes.status === "fulfilled" ? assetsRes.value.count ?? 0 : 0;
			const leaseCount = leasesRes.status === "fulfilled" ? leasesRes.value.count ?? 0 : 0;
			dependencies.push({
				dependency: "Linked Units",
				count: unitCount,
				result: unitCount > 0 ? "Blocked" : "Pass",
				details: unitCount > 0 ? `${unitCount} units exist under this property.` : "None"
			});
			dependencies.push({
				dependency: "Active Leases",
				count: leaseCount,
				result: leaseCount > 0 ? "Blocked" : "Pass",
				details: leaseCount > 0 ? `${leaseCount} active leases exist.` : "None"
			});
			dependencies.push({
				dependency: "Assigned Assets",
				count: assetCount,
				result: assetCount > 0 ? "Warning" : "Pass",
				details: assetCount > 0 ? `${assetCount} assets assigned.` : "None"
			});
			if (unitCount > 0 || leaseCount > 0) errors.push({
				row: context.rowNumber,
				field: "Property Code",
				code: "DEL_003",
				message: `Property deletion blocked: ${unitCount} units and ${leaseCount} active leases are attached.`,
				severity: "ERROR",
				resolution: "Remove/reassign all linked units and complete or terminate active leases before deleting."
			});
		} catch (e) {
			console.error("Dependency check failed:", e);
		}
		return {
			errors,
			warnings,
			normalized,
			changes,
			dependencies
		};
	},
	async executeRecord(record, operation, user) {
		try {
			const data = record.normalizedData;
			const propCode = record.recordKey;
			if (operation === "CREATE") {
				const facilityAmenities = [
					data.amenity_1,
					data.amenity_2,
					data.amenity_3,
					data.amenity_4,
					data.amenity_5
				].filter(Boolean);
				const payload = {
					property_code: propCode,
					title: data.title || `Property ${propCode}`,
					description: data.remarks || null,
					property_type: data.property_type || "apartment",
					address: data.street_building_name || data.address || `${propCode} Street`,
					city: data.city || "Doha",
					country: data.country || "Qatar",
					max_guests: 1,
					bedrooms: 1,
					beds: 1,
					bathrooms: 1,
					base_price_per_night: 0,
					cleaning_fee: 0,
					is_active: data.property_status ? data.property_status.toLowerCase() === "active" : true,
					property_status: data.property_status || "Active",
					cost_center_code: data.cost_center_code,
					cost_center_name: data.cost_center_name,
					property_category: data.property_category,
					ownership_type: data.ownership_type,
					area_zone: data.area_zone,
					street_building_name: data.street_building_name,
					plot_building_no: data.plot_building_no,
					title_deed_no: data.title_deed_no,
					municipality_ref_no: data.municipality_ref_no,
					property_manager: data.property_manager,
					no_of_floors: data.no_of_floors,
					no_of_units: data.no_of_units,
					total_units: data.no_of_units,
					total_built_up_area_sqm: data.total_built_up_area_sqm,
					common_area_sqm: data.common_area_sqm,
					parking_count: data.parking_count,
					no_of_elevators: data.no_of_elevators,
					completion_date: data.completion_date,
					handover_date: data.handover_date,
					documents_received: typeof data.documents_received === "boolean" ? data.documents_received : String(data.documents_received).toLowerCase() === "yes" || String(data.documents_received).toLowerCase() === "true",
					remarks: data.remarks,
					amenities: facilityAmenities,
					municipality_details: {
						owner_landlord: data.owner_landlord || void 0,
						facility_amenities: facilityAmenities,
						other_amenities_facilities: data.other_amenities || void 0
					}
				};
				const { data: created, error } = await supabase.from("properties").insert(payload).select().single();
				if (error) throw error;
				return {
					success: true,
					createdId: created.id,
					resultText: `Property "${propCode}" created successfully.`
				};
			}
			if (operation === "UPDATE") {
				const existing = record.originalDbData;
				if (!existing?.id) throw new Error("Target record ID not found");
				const updatePayload = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
				for (const change of record.changes) updatePayload[change.field] = change.newValue === "[CLEARED]" ? null : change.newValue;
				const { error } = await supabase.from("properties").update(updatePayload).eq("id", existing.id);
				if (error) throw error;
				return {
					success: true,
					resultText: `Property "${propCode}" updated (${record.changes.length} fields).`
				};
			}
			if (operation === "DELETE") {
				const existing = record.originalDbData;
				if (!existing?.id) throw new Error("Target record ID not found");
				const { error } = await supabase.from("properties").update({
					is_active: false,
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", existing.id);
				if (error) throw error;
				return {
					success: true,
					resultText: `Property "${propCode}" archived/deactivated.`
				};
			}
			return {
				success: false,
				resultText: "Unsupported operation"
			};
		} catch (err) {
			return {
				success: false,
				resultText: "Failed to process record",
				error: err?.message || "Database error occurred"
			};
		}
	}
};
var UNIT_COLUMNS = [
	{
		key: "unit_code",
		label: "Unit Code / No.",
		type: "string",
		required: true,
		sampleValue: "Flat12",
		description: "Unit identifier unique under Property"
	},
	{
		key: "property_code",
		label: "Property Code",
		type: "string",
		required: true,
		sampleValue: "AAA",
		description: "Must match an existing Property Code"
	},
	{
		key: "unit_name",
		label: "Unit Name",
		type: "string",
		required: false,
		sampleValue: "AAA - Flat12"
	},
	{
		key: "unit_cost_center_code",
		label: "Unit Cost Center Code",
		type: "string",
		required: false,
		sampleValue: "CC-AAA-FL12"
	},
	{
		key: "parent_cost_center_code",
		label: "Parent Cost Center Code",
		type: "string",
		required: false,
		sampleValue: "CC-DOH-01"
	},
	{
		key: "unit_usage",
		label: "Unit Usage",
		type: "enum",
		required: false,
		allowedValues: [
			"Residential",
			"Commercial",
			"Staff Accommodation",
			"Storage",
			"Retail"
		],
		sampleValue: "Residential"
	},
	{
		key: "block_tower",
		label: "Block / Tower",
		type: "string",
		required: false,
		sampleValue: "Tower A"
	},
	{
		key: "floor",
		label: "Floor",
		type: "string",
		required: false,
		sampleValue: "Floor 2"
	},
	{
		key: "bedrooms",
		label: "Bedrooms (1-7)",
		type: "number",
		required: false,
		sampleValue: 2
	},
	{
		key: "bathrooms",
		label: "Bathrooms (1-7)",
		type: "number",
		required: false,
		sampleValue: 2
	},
	{
		key: "total_area_sqm",
		label: "Total Area Sqm",
		type: "number",
		required: false,
		sampleValue: 120
	},
	{
		key: "balcony_sqm",
		label: "Balcony Sqm",
		type: "number",
		required: false,
		sampleValue: 10
	},
	{
		key: "view_type",
		label: "View Type",
		type: "enum",
		required: false,
		allowedValues: [
			"City View",
			"Sea View",
			"Garden View",
			"Street View",
			"Open View"
		],
		sampleValue: "City View"
	},
	{
		key: "furnishing",
		label: "Furnishing",
		type: "enum",
		required: false,
		allowedValues: [
			"Unfurnished",
			"Semi-Furnished",
			"Fully Furnished"
		],
		sampleValue: "Semi-Furnished"
	},
	{
		key: "parking_slot_no",
		label: "Parking Slot No.",
		type: "string",
		required: false,
		sampleValue: "P-104"
	},
	{
		key: "electricity_meter_no",
		label: "Electricity Meter No.",
		type: "string",
		required: false,
		sampleValue: "ELEC-99881"
	},
	{
		key: "water_meter_no",
		label: "Water Meter No.",
		type: "string",
		required: false,
		sampleValue: "WTR-77661"
	},
	{
		key: "cooling_meter_no",
		label: "Cooling / Chiller Meter No.",
		type: "string",
		required: false,
		sampleValue: "CHL-1122"
	},
	{
		key: "status",
		label: "Unit Status",
		type: "enum",
		required: false,
		allowedValues: referenceDropdowns.unitStatuses.map((u) => u.value),
		sampleValue: "Available"
	},
	{
		key: "lease_status",
		label: "Lease Status",
		type: "enum",
		required: false,
		allowedValues: [
			"DRAFT",
			"ACTIVE",
			"VACANT",
			"EXPIRED"
		],
		sampleValue: "VACANT"
	},
	{
		key: "current_rent",
		label: "Default Rent / Base Rate",
		type: "number",
		required: false,
		sampleValue: 5500
	},
	{
		key: "rent_frequency",
		label: "Rent Frequency",
		type: "enum",
		required: false,
		allowedValues: referenceDropdowns.rentFrequencies.map((f) => f.value),
		sampleValue: "Monthly"
	},
	{
		key: "security_deposit_amount",
		label: "Security Deposit Amount",
		type: "number",
		required: false,
		sampleValue: 5500
	},
	{
		key: "service_charge",
		label: "Service Charge",
		type: "number",
		required: false,
		sampleValue: 200
	},
	{
		key: "maintenance_responsibility",
		label: "Maintenance Responsibility",
		type: "enum",
		required: false,
		allowedValues: [
			"Landlord",
			"Tenant",
			"Shared"
		],
		sampleValue: "Landlord"
	},
	{
		key: "handover_date",
		label: "Handover Date",
		type: "date",
		required: false,
		sampleValue: "2023-01-01"
	},
	{
		key: "remarks",
		label: "Remarks",
		type: "string",
		required: false,
		sampleValue: "Standard 2BHK unit"
	}
];
var unitAdapter = {
	module: "unit",
	label: "Unit",
	primaryKeyLabel: "Unit Code + Property Code",
	primaryKeyField: "unit_code",
	columns: UNIT_COLUMNS,
	getTemplateColumns(operation) {
		if (operation === "DELETE") return [UNIT_COLUMNS.find((c) => c.key === "unit_code"), UNIT_COLUMNS.find((c) => c.key === "property_code")];
		return UNIT_COLUMNS;
	},
	resolveRecordKey(row) {
		const unitCode = String(row["Unit Code / No."] ?? row["Unit Code"] ?? row["unit_code"] ?? row["Unit code"] ?? "").trim();
		const propCode = String(row["Property Code"] ?? row["property_code"] ?? "").trim();
		if (!unitCode && !propCode) return "";
		return propCode ? `${propCode}::${unitCode}` : unitCode;
	},
	async fetchExistingRecords(keys) {
		const map = /* @__PURE__ */ new Map();
		if (keys.length === 0) return map;
		try {
			const { data, error } = await supabase.from("units").select("*, properties(id, property_code, title)");
			if (!error && data) for (const row of data) {
				const uCode = (row.unit_code || row.unit_ref || "").trim();
				const pCode = (row.properties?.property_code || "").trim();
				if (uCode && pCode) map.set(`${pCode.toUpperCase()}::${uCode.toUpperCase()}`, row);
			}
		} catch (e) {
			console.error("Error fetching existing units:", e);
		}
		return map;
	},
	async validateRow(row, operation, context) {
		const errors = [];
		const warnings = [];
		const changes = [];
		const dependencies = [];
		const normalized = {};
		const rawUnitCode = String(row["Unit Code / No."] ?? row["Unit Code"] ?? row["unit_code"] ?? "").trim();
		const rawPropCode = String(row["Property Code"] ?? row["property_code"] ?? "").trim();
		if (!rawUnitCode) errors.push({
			row: context.rowNumber,
			field: "Unit Code / No.",
			code: "VAL_001",
			message: "Unit Code / No. is required.",
			severity: "ERROR"
		});
		if (!rawPropCode) errors.push({
			row: context.rowNumber,
			field: "Property Code",
			code: "VAL_001",
			message: "Property Code is required.",
			severity: "ERROR"
		});
		if (rawPropCode) try {
			const { data: propData } = await supabase.from("properties").select("id, property_code, title").ilike("property_code", rawPropCode).limit(1).single();
			if (!propData) errors.push({
				row: context.rowNumber,
				field: "Property Code",
				code: "REF_001",
				message: `Property Code "${rawPropCode}" does not exist in master records.`,
				severity: "ERROR",
				resolution: "Provide a valid and existing Property Code."
			});
			else normalized.property_id = propData.id;
		} catch {
			errors.push({
				row: context.rowNumber,
				field: "Property Code",
				code: "REF_001",
				message: `Property Code "${rawPropCode}" does not exist in master records.`,
				severity: "ERROR"
			});
		}
		const recordKey = unitAdapter.resolveRecordKey(row);
		const upperKey = recordKey.toUpperCase();
		if (recordKey && context.inBatchKeys.has(upperKey)) errors.push({
			row: context.rowNumber,
			field: "Unit Code / No.",
			code: "DUP_001",
			message: `Duplicate Unit "${rawUnitCode}" under property "${rawPropCode}" in Excel file.`,
			severity: "ERROR"
		});
		const existingRecord = context.existingRecord;
		if (operation === "CREATE") {
			if (existingRecord) errors.push({
				row: context.rowNumber,
				field: "Unit Code / No.",
				code: "DUP_002",
				message: `Unit "${rawUnitCode}" already exists under Property "${rawPropCode}".`,
				severity: "ERROR",
				resolution: "Choose a different Unit Code or use UPDATE operation."
			});
		} else if (!existingRecord) errors.push({
			row: context.rowNumber,
			field: "Unit Code / No.",
			code: operation === "UPDATE" ? "UPD_001" : "DEL_001",
			message: `Unit "${rawUnitCode}" under Property "${rawPropCode}" not found in database.`,
			severity: "ERROR"
		});
		for (const col of UNIT_COLUMNS) {
			if (operation === "DELETE") continue;
			const cellValue = row[col.label] ?? row[col.label + " *"] ?? row[col.key];
			if (cellValue !== void 0 && cellValue !== null && String(cellValue).trim() !== "") {
				const strVal = String(cellValue).trim();
				if (strVal === "[NULL]") normalized[col.key] = null;
				else if (col.type === "number") {
					const num = Number(strVal.replace(/,/g, ""));
					if (isNaN(num)) errors.push({
						row: context.rowNumber,
						field: col.label,
						code: "VAL_005",
						message: `${col.label} must be a number.`,
						severity: "ERROR"
					});
					else normalized[col.key] = num;
				} else if (col.type === "enum" && col.allowedValues) {
					const matched = col.allowedValues.find((v) => v.toLowerCase() === strVal.toLowerCase());
					if (!matched) {
						warnings.push({
							row: context.rowNumber,
							field: col.label,
							code: "VAL_002",
							message: `Value "${strVal}" for ${col.label} is outside standard options.`,
							severity: "WARNING"
						});
						normalized[col.key] = strVal;
					} else normalized[col.key] = matched;
				} else normalized[col.key] = strVal;
			}
		}
		if (existingRecord) try {
			const { data: activeLeases } = await supabase.from("leases").select("id, lease_number, lease_status").eq("unit_id", existingRecord.id).in("lease_status", [
				"ACTIVE",
				"RENEWAL_CONFIRMED",
				"KEY_HANDED_OVER",
				"TENANT_SIGNED"
			]);
			const hasActiveLease = Boolean(activeLeases && activeLeases.length > 0);
			if (operation === "UPDATE") {
				const requestedStatus = normalized["status"];
				if (hasActiveLease && requestedStatus === "Available") errors.push({
					row: context.rowNumber,
					field: "Unit Status",
					code: "VAL_002",
					message: `Unit Status cannot be set to "Available" while an active lease (${activeLeases[0].lease_number}) is in effect.`,
					severity: "ERROR",
					resolution: "Execute formal Checkout and Closure workflow to free unit."
				});
			}
			if (operation === "DELETE") {
				dependencies.push({
					dependency: "Active Leases",
					count: activeLeases?.length ?? 0,
					result: hasActiveLease ? "Blocked" : "Pass",
					details: hasActiveLease ? `Active lease #${activeLeases[0].lease_number} attached.` : "None"
				});
				if (hasActiveLease) errors.push({
					row: context.rowNumber,
					field: "Unit Code / No.",
					code: "DEL_003",
					message: "Unit deletion blocked because an active lease is registered.",
					severity: "ERROR"
				});
			}
		} catch (e) {
			console.error("Unit lease dependency check error:", e);
		}
		if (operation === "UPDATE" && existingRecord) for (const col of UNIT_COLUMNS) {
			if (col.immutable || col.key === "property_code") continue;
			const oldVal = existingRecord[col.key];
			const cellValue = row[col.label] ?? row[col.label + " *"] ?? row[col.key];
			if (cellValue === void 0 || cellValue === null || String(cellValue).trim() === "") continue;
			const newVal = normalized[col.key];
			if (String(oldVal ?? "").trim() !== String(newVal ?? "").trim()) changes.push({
				field: col.key,
				label: col.label,
				oldValue: oldVal ?? "—",
				newValue: newVal === null ? "[CLEARED]" : newVal,
				status: newVal === null ? "CLEARED" : "CHANGED"
			});
		}
		return {
			errors,
			warnings,
			normalized,
			changes,
			dependencies
		};
	},
	async executeRecord(record, operation, user) {
		try {
			const data = record.normalizedData;
			const unitCode = String(data.unit_code || record.rawRowData["Unit Code / No."] || "").trim();
			if (operation === "CREATE") {
				const payload = {
					property_id: data.property_id,
					unit_code: unitCode,
					unit_ref: unitCode,
					unit_name: data.unit_name || `${data.property_code || ""} - ${unitCode}`,
					unit_cost_center_code: data.unit_cost_center_code,
					parent_cost_center_code: data.parent_cost_center_code,
					unit_usage: data.unit_usage || "Residential",
					block_tower: data.block_tower,
					floor: data.floor,
					bedrooms: data.bedrooms ?? 1,
					bathrooms: data.bathrooms ?? 1,
					total_area_sqm: data.total_area_sqm,
					balcony_sqm: data.balcony_sqm,
					view_type: data.view_type,
					furnishing: data.furnishing,
					parking_slot_no: data.parking_slot_no,
					electricity_meter_no: data.electricity_meter_no,
					water_meter_no: data.water_meter_no,
					cooling_meter_no: data.cooling_meter_no,
					status: data.status || "Available",
					lease_status: data.lease_status || "VACANT",
					current_rent: data.current_rent,
					rent_frequency: data.rent_frequency || "Monthly",
					security_deposit_amount: data.security_deposit_amount,
					service_charge: data.service_charge,
					maintenance_responsibility: data.maintenance_responsibility || "Landlord",
					handover_date: data.handover_date,
					remarks: data.remarks
				};
				const { data: created, error } = await supabase.from("units").insert(payload).select().single();
				if (error) throw error;
				return {
					success: true,
					createdId: created.id,
					resultText: `Unit "${unitCode}" created under property.`
				};
			}
			if (operation === "UPDATE") {
				const existing = record.originalDbData;
				if (!existing?.id) throw new Error("Target unit record ID not found");
				const updatePayload = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
				for (const change of record.changes) updatePayload[change.field] = change.newValue === "[CLEARED]" ? null : change.newValue;
				const { error } = await supabase.from("units").update(updatePayload).eq("id", existing.id);
				if (error) throw error;
				return {
					success: true,
					resultText: `Unit "${unitCode}" updated (${record.changes.length} fields).`
				};
			}
			if (operation === "DELETE") {
				const existing = record.originalDbData;
				if (!existing?.id) throw new Error("Target unit record ID not found");
				const { error } = await supabase.from("units").update({
					status: "Archived",
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", existing.id);
				if (error) throw error;
				return {
					success: true,
					resultText: `Unit "${unitCode}" archived.`
				};
			}
			return {
				success: false,
				resultText: "Unsupported operation"
			};
		} catch (err) {
			return {
				success: false,
				resultText: "Failed to process unit record",
				error: err?.message || "Database error occurred"
			};
		}
	}
};
var CUSTOMER_COLUMNS = [
	{
		key: "customer_identifier",
		label: "Customer Identifier (QID / Passport / CR)",
		type: "string",
		required: true,
		unique: true,
		immutable: true,
		sampleValue: "28463401923",
		description: "Qatar ID, Passport No, or Commercial Registration"
	},
	{
		key: "full_name",
		label: "Full Name / Company Name",
		type: "string",
		required: true,
		sampleValue: "ABC Trading & Contracting W.L.L."
	},
	{
		key: "customer_type",
		label: "Customer Type",
		type: "enum",
		required: true,
		allowedValues: ["Individual", "Company"],
		sampleValue: "Company"
	},
	{
		key: "mobile_number",
		label: "Mobile Number",
		type: "string",
		required: true,
		sampleValue: "97455123456"
	},
	{
		key: "email_address",
		label: "Email Address",
		type: "string",
		required: false,
		sampleValue: "contact@abctrading.qa"
	},
	{
		key: "qatar_id",
		label: "Qatar ID",
		type: "string",
		required: false,
		sampleValue: "28463401923"
	},
	{
		key: "passport_number",
		label: "Passport Number",
		type: "string",
		required: false,
		sampleValue: "N8829104"
	},
	{
		key: "commercial_registration",
		label: "Commercial Registration (CR)",
		type: "string",
		required: false,
		sampleValue: "CR-109283"
	},
	{
		key: "nationality",
		label: "Nationality",
		type: "string",
		required: false,
		sampleValue: "Qatari"
	},
	{
		key: "permanent_address",
		label: "Permanent Address",
		type: "string",
		required: false,
		sampleValue: "PO Box 1234, Doha, Qatar"
	},
	{
		key: "local_address",
		label: "Local Address",
		type: "string",
		required: false,
		sampleValue: "Al Sadd, Street 902"
	},
	{
		key: "employer_name",
		label: "Employer Name / Sponsor",
		type: "string",
		required: false,
		sampleValue: "Qatar Airways"
	},
	{
		key: "designation",
		label: "Designation / Occupation",
		type: "string",
		required: false,
		sampleValue: "Senior Manager"
	},
	{
		key: "monthly_income",
		label: "Monthly Income (QAR)",
		type: "number",
		required: false,
		sampleValue: 28e3
	},
	{
		key: "authorized_signatory_name",
		label: "Authorized Signatory Name",
		type: "string",
		required: false,
		sampleValue: "Hamad Al-Kuwari"
	},
	{
		key: "authorized_signatory_id",
		label: "Authorized Signatory QID",
		type: "string",
		required: false,
		sampleValue: "28012345678"
	},
	{
		key: "emergency_contact_name",
		label: "Emergency Contact Name",
		type: "string",
		required: false,
		sampleValue: "Ali Al-Kuwari"
	},
	{
		key: "emergency_contact_phone",
		label: "Emergency Contact Phone",
		type: "string",
		required: false,
		sampleValue: "97455001122"
	},
	{
		key: "verification_status",
		label: "Verification Status",
		type: "enum",
		required: false,
		allowedValues: [
			"Pending",
			"Verified",
			"Rejected",
			"Additional Info Required"
		],
		sampleValue: "Verified"
	}
];
var customerAdapter = {
	module: "customer",
	label: "Customer",
	primaryKeyLabel: "Customer Identifier (QID/Passport/CR)",
	primaryKeyField: "customer_identifier",
	columns: CUSTOMER_COLUMNS,
	getTemplateColumns(operation) {
		if (operation === "DELETE") return [CUSTOMER_COLUMNS.find((c) => c.key === "customer_identifier"), CUSTOMER_COLUMNS.find((c) => c.key === "full_name")];
		return CUSTOMER_COLUMNS;
	},
	resolveRecordKey(row) {
		const raw = row["Customer Identifier (QID / Passport / CR)"] ?? row["Customer Identifier"] ?? row["Qatar ID"] ?? row["qatar_id"] ?? row["Commercial Registration (CR)"] ?? row["commercial_registration"] ?? row["Passport Number"] ?? row["passport_number"] ?? row["customer_identifier"] ?? row["ID"] ?? "";
		return String(raw).trim();
	},
	async fetchExistingRecords(keys) {
		const map = /* @__PURE__ */ new Map();
		if (keys.length === 0) return map;
		try {
			const { data, error } = await supabase.from("customers").select("*");
			if (!error && data) for (const row of data) {
				const idCandidates = [
					row.qatar_id,
					row.passport_number,
					row.commercial_registration,
					row.id
				].filter(Boolean);
				for (const cand of idCandidates) map.set(String(cand).trim().toUpperCase(), row);
			}
		} catch (e) {
			console.error("Error fetching customers:", e);
		}
		return map;
	},
	async validateRow(row, operation, context) {
		const errors = [];
		const warnings = [];
		const changes = [];
		const dependencies = [];
		const normalized = {};
		const rawKey = customerAdapter.resolveRecordKey(row);
		if (!rawKey) errors.push({
			row: context.rowNumber,
			field: "Customer Identifier",
			code: "VAL_001",
			message: "Customer Identifier (QID, Passport, or CR) is required.",
			severity: "ERROR"
		});
		if (rawKey) {
			const upperKey = rawKey.toUpperCase();
			if (context.inBatchKeys.has(upperKey)) errors.push({
				row: context.rowNumber,
				field: "Customer Identifier",
				code: "DUP_001",
				message: `Duplicate Customer Identifier "${rawKey}" in Excel file.`,
				severity: "ERROR"
			});
		}
		const existingRecord = context.existingRecord;
		if (operation === "CREATE") {
			if (existingRecord) errors.push({
				row: context.rowNumber,
				field: "Customer Identifier",
				code: "DUP_002",
				message: `Customer with identifier "${rawKey}" already exists in database.`,
				severity: "ERROR",
				resolution: "Use a unique identifier or UPDATE operation."
			});
		} else if (!existingRecord) errors.push({
			row: context.rowNumber,
			field: "Customer Identifier",
			code: operation === "UPDATE" ? "UPD_001" : "DEL_001",
			message: `Customer with identifier "${rawKey}" not found in database.`,
			severity: "ERROR"
		});
		for (const col of CUSTOMER_COLUMNS) {
			if (operation === "DELETE") continue;
			const cellValue = row[col.label] ?? row[col.label + " *"] ?? row[col.key];
			if (operation === "CREATE" && col.required && (cellValue === void 0 || cellValue === null || String(cellValue).trim() === "")) errors.push({
				row: context.rowNumber,
				field: col.label,
				code: "VAL_001",
				message: `${col.label} is required.`,
				severity: "ERROR"
			});
			if (cellValue !== void 0 && cellValue !== null && String(cellValue).trim() !== "") {
				const strVal = String(cellValue).trim();
				if (strVal === "[NULL]") normalized[col.key] = null;
				else if (col.type === "number") {
					const num = Number(strVal.replace(/,/g, ""));
					if (isNaN(num)) errors.push({
						row: context.rowNumber,
						field: col.label,
						code: "VAL_005",
						message: `${col.label} must be a numeric value.`,
						severity: "ERROR"
					});
					else normalized[col.key] = num;
				} else if (col.key === "email_address" && strVal !== "[NULL]") {
					if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strVal)) errors.push({
						row: context.rowNumber,
						field: "Email Address",
						code: "VAL_002",
						message: `Invalid email format: "${strVal}"`,
						severity: "ERROR"
					});
					normalized[col.key] = strVal;
				} else normalized[col.key] = strVal;
			}
		}
		if (rawKey && !normalized.qatar_id && !normalized.commercial_registration && !normalized.passport_number) if (normalized.customer_type === "Company") normalized.commercial_registration = rawKey;
		else if (/^\d{11}$/.test(rawKey)) normalized.qatar_id = rawKey;
		else normalized.passport_number = rawKey;
		if (operation === "DELETE" && existingRecord) try {
			const { data: linkedLeases } = await supabase.from("leases").select("id, lease_number, lease_status").eq("customer_id", existingRecord.id).in("lease_status", [
				"ACTIVE",
				"RENEWAL_CONFIRMED",
				"KEY_HANDED_OVER",
				"TENANT_SIGNED"
			]);
			const leaseCount = linkedLeases?.length ?? 0;
			dependencies.push({
				dependency: "Active Leases",
				count: leaseCount,
				result: leaseCount > 0 ? "Blocked" : "Pass",
				details: leaseCount > 0 ? `${leaseCount} active leases attached to customer.` : "No active leases."
			});
			if (leaseCount > 0) errors.push({
				row: context.rowNumber,
				field: "Customer Identifier",
				code: "DEL_003",
				message: `Customer cannot be deleted while having active leases.`,
				severity: "ERROR"
			});
		} catch (e) {
			console.error("Customer lease check error:", e);
		}
		if (operation === "UPDATE" && existingRecord) for (const col of CUSTOMER_COLUMNS) {
			if (col.immutable || col.key === "customer_identifier") continue;
			const oldVal = existingRecord[col.key];
			const cellValue = row[col.label] ?? row[col.label + " *"] ?? row[col.key];
			if (cellValue === void 0 || cellValue === null || String(cellValue).trim() === "") continue;
			const newVal = normalized[col.key];
			if (String(oldVal ?? "").trim() !== String(newVal ?? "").trim()) changes.push({
				field: col.key,
				label: col.label,
				oldValue: oldVal ?? "—",
				newValue: newVal === null ? "[CLEARED]" : newVal,
				status: newVal === null ? "CLEARED" : "CHANGED"
			});
		}
		return {
			errors,
			warnings,
			normalized,
			changes,
			dependencies
		};
	},
	async executeRecord(record, operation, user) {
		try {
			const data = record.normalizedData;
			record.recordKey;
			if (operation === "CREATE") {
				const payload = {
					full_name: data.full_name,
					customer_type: data.customer_type || "Individual",
					mobile_number: data.mobile_number,
					email_address: data.email_address || null,
					qatar_id: data.qatar_id || null,
					passport_number: data.passport_number || null,
					commercial_registration: data.commercial_registration || null,
					nationality: data.nationality || null,
					permanent_address: data.permanent_address || null,
					local_address: data.local_address || null,
					employer_name: data.employer_name || null,
					designation: data.designation || null,
					monthly_income: data.monthly_income || null,
					authorized_signatory_name: data.authorized_signatory_name || null,
					authorized_signatory_id: data.authorized_signatory_id || null,
					emergency_contact_name: data.emergency_contact_name || null,
					emergency_contact_phone: data.emergency_contact_phone || null,
					verification_status: data.verification_status || "Pending"
				};
				const { data: created, error } = await supabase.from("customers").insert(payload).select().single();
				if (error) throw error;
				return {
					success: true,
					createdId: created.id,
					resultText: `Customer "${data.full_name}" created successfully.`
				};
			}
			if (operation === "UPDATE") {
				const existing = record.originalDbData;
				if (!existing?.id) throw new Error("Customer ID not found");
				const updatePayload = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
				for (const change of record.changes) updatePayload[change.field] = change.newValue === "[CLEARED]" ? null : change.newValue;
				const { error } = await supabase.from("customers").update(updatePayload).eq("id", existing.id);
				if (error) throw error;
				return {
					success: true,
					resultText: `Customer "${existing.full_name}" updated (${record.changes.length} fields).`
				};
			}
			if (operation === "DELETE") {
				const existing = record.originalDbData;
				if (!existing?.id) throw new Error("Customer ID not found");
				const { error } = await supabase.from("customers").delete().eq("id", existing.id);
				if (error) throw error;
				return {
					success: true,
					resultText: `Customer "${existing.full_name}" deleted.`
				};
			}
			return {
				success: false,
				resultText: "Unsupported operation"
			};
		} catch (err) {
			return {
				success: false,
				resultText: "Failed to process customer record",
				error: err?.message || "Database error occurred"
			};
		}
	}
};
var ASSET_COLUMNS = [
	{
		key: "asset_code",
		label: "Asset ID / Code",
		type: "string",
		required: true,
		unique: true,
		immutable: true,
		sampleValue: "AST-HVAC-001",
		description: "Unique asset identifier"
	},
	{
		key: "asset_name",
		label: "Asset Name",
		type: "string",
		required: true,
		sampleValue: "Split AC 2.0 Ton O General"
	},
	{
		key: "category",
		label: "Asset Category",
		type: "enum",
		required: false,
		allowedValues: [
			"HVAC",
			"Electrical",
			"Plumbing",
			"Furniture",
			"Appliances",
			"IT & Security",
			"Vehicles"
		],
		sampleValue: "HVAC"
	},
	{
		key: "subcategory",
		label: "Asset Subcategory",
		type: "string",
		required: false,
		sampleValue: "Split Unit"
	},
	{
		key: "brand",
		label: "Brand",
		type: "string",
		required: false,
		sampleValue: "O General"
	},
	{
		key: "model",
		label: "Model",
		type: "string",
		required: false,
		sampleValue: "ASGA24FETA"
	},
	{
		key: "serial_number",
		label: "Serial / IMEI No.",
		type: "string",
		required: false,
		sampleValue: "SN-9988221"
	},
	{
		key: "ownership_type",
		label: "Ownership Type",
		type: "enum",
		required: false,
		allowedValues: [
			"Owned",
			"Leased",
			"Customer Provided",
			"Landlord Provided"
		],
		sampleValue: "Owned"
	},
	{
		key: "purchase_date",
		label: "Purchase Date",
		type: "date",
		required: false,
		sampleValue: "2023-05-10"
	},
	{
		key: "supplier",
		label: "Supplier",
		type: "string",
		required: false,
		sampleValue: "Al Taadhod Trading"
	},
	{
		key: "purchase_cost",
		label: "Purchase Cost (QAR)",
		type: "number",
		required: false,
		sampleValue: 3400
	},
	{
		key: "warranty_expiry_date",
		label: "Warranty Expiry Date",
		type: "date",
		required: false,
		sampleValue: "2025-05-10"
	},
	{
		key: "assigned_property_code",
		label: "Assigned Property Code",
		type: "string",
		required: false,
		sampleValue: "AAA",
		description: "Must match an active Property Code"
	},
	{
		key: "assigned_unit_code",
		label: "Assigned Unit Code",
		type: "string",
		required: false,
		sampleValue: "Flat12",
		description: "Unit code under assigned property"
	},
	{
		key: "assigned_employee_id",
		label: "Assigned Employee Code",
		type: "string",
		required: false,
		sampleValue: "EMP-001",
		description: "Employee ID"
	},
	{
		key: "assignment_date",
		label: "Assignment Date",
		type: "date",
		required: false,
		sampleValue: "2023-06-01"
	},
	{
		key: "asset_condition",
		label: "Asset Condition",
		type: "enum",
		required: false,
		allowedValues: [
			"Brand New",
			"Good",
			"Fair",
			"Needs Repair",
			"Scrap / Disposed"
		],
		sampleValue: "Good"
	},
	{
		key: "asset_status",
		label: "Asset Status",
		type: "enum",
		required: false,
		allowedValues: [
			"Available",
			"In Use",
			"Under Maintenance",
			"Damaged",
			"Disposed"
		],
		sampleValue: "In Use"
	},
	{
		key: "life_of_asset",
		label: "Life Of Asset (Years)",
		type: "number",
		required: false,
		sampleValue: 5
	},
	{
		key: "opening_cost",
		label: "Opening Cost",
		type: "number",
		required: false,
		sampleValue: 3400
	},
	{
		key: "last_service_date",
		label: "Last Service Date",
		type: "date",
		required: false,
		sampleValue: "2024-01-10"
	},
	{
		key: "next_service_date",
		label: "Next Service Date",
		type: "date",
		required: false,
		sampleValue: "2024-07-10"
	},
	{
		key: "remarks",
		label: "Remarks",
		type: "string",
		required: false,
		sampleValue: "Master bedroom air conditioning"
	}
];
var assetAdapter = {
	module: "asset",
	label: "Asset",
	primaryKeyLabel: "Asset ID / Code",
	primaryKeyField: "asset_code",
	columns: ASSET_COLUMNS,
	getTemplateColumns(operation) {
		if (operation === "DELETE") return [ASSET_COLUMNS.find((c) => c.key === "asset_code"), ASSET_COLUMNS.find((c) => c.key === "asset_name")];
		return ASSET_COLUMNS;
	},
	resolveRecordKey(row) {
		const raw = row["Asset ID / Code"] ?? row["Asset ID"] ?? row["Asset Code"] ?? row["asset_code"] ?? row["asset_id"] ?? "";
		return String(raw).trim();
	},
	async fetchExistingRecords(keys) {
		const map = /* @__PURE__ */ new Map();
		if (keys.length === 0) return map;
		try {
			const { data, error } = await supabase.from("assets").select("*").in("asset_code", keys);
			if (!error && data) {
				for (const row of data) if (row.asset_code) map.set(row.asset_code.trim().toUpperCase(), row);
			}
		} catch (e) {
			console.error("Error fetching assets:", e);
		}
		return map;
	},
	async validateRow(row, operation, context) {
		const errors = [];
		const warnings = [];
		const changes = [];
		const dependencies = [];
		const normalized = {};
		const assetKey = assetAdapter.resolveRecordKey(row);
		if (!assetKey) errors.push({
			row: context.rowNumber,
			field: "Asset ID / Code",
			code: "VAL_001",
			message: "Asset ID / Code is required.",
			severity: "ERROR"
		});
		if (assetKey) {
			const upperKey = assetKey.toUpperCase();
			if (context.inBatchKeys.has(upperKey)) errors.push({
				row: context.rowNumber,
				field: "Asset ID / Code",
				code: "DUP_001",
				message: `Duplicate Asset ID "${assetKey}" in Excel file.`,
				severity: "ERROR"
			});
		}
		const existingRecord = context.existingRecord;
		if (operation === "CREATE") {
			if (existingRecord) errors.push({
				row: context.rowNumber,
				field: "Asset ID / Code",
				code: "DUP_002",
				message: `Asset "${assetKey}" already exists in the database.`,
				severity: "ERROR",
				resolution: "Choose a unique Asset Code or use UPDATE operation."
			});
		} else if (!existingRecord) errors.push({
			row: context.rowNumber,
			field: "Asset ID / Code",
			code: operation === "UPDATE" ? "UPD_001" : "DEL_001",
			message: `Asset "${assetKey}" was not found in the database.`,
			severity: "ERROR"
		});
		for (const col of ASSET_COLUMNS) {
			if (operation === "DELETE") continue;
			const cellValue = row[col.label] ?? row[col.label + " *"] ?? row[col.key];
			if (operation === "CREATE" && col.required && (cellValue === void 0 || cellValue === null || String(cellValue).trim() === "")) errors.push({
				row: context.rowNumber,
				field: col.label,
				code: "VAL_001",
				message: `${col.label} is required.`,
				severity: "ERROR"
			});
			if (cellValue !== void 0 && cellValue !== null && String(cellValue).trim() !== "") {
				const strVal = String(cellValue).trim();
				if (strVal === "[NULL]") normalized[col.key] = null;
				else if (col.type === "number") {
					const num = Number(strVal.replace(/,/g, ""));
					if (isNaN(num)) errors.push({
						row: context.rowNumber,
						field: col.label,
						code: "VAL_005",
						message: `${col.label} must be a numeric value.`,
						severity: "ERROR"
					});
					else normalized[col.key] = num;
				} else normalized[col.key] = strVal;
			}
		}
		const assignedPropCode = normalized["assigned_property_code"];
		if (assignedPropCode && assignedPropCode !== "[NULL]") try {
			const { data: propData } = await supabase.from("properties").select("id").ilike("property_code", assignedPropCode).limit(1).single();
			if (propData) normalized.assigned_property_id = propData.id;
			else errors.push({
				row: context.rowNumber,
				field: "Assigned Property Code",
				code: "REF_001",
				message: `Assigned Property Code "${assignedPropCode}" does not exist.`,
				severity: "ERROR"
			});
		} catch {
			errors.push({
				row: context.rowNumber,
				field: "Assigned Property Code",
				code: "REF_001",
				message: `Assigned Property Code "${assignedPropCode}" does not exist.`,
				severity: "ERROR"
			});
		}
		const assignedEmpId = normalized["assigned_employee_id"];
		if (assignedEmpId && assignedEmpId !== "[NULL]") try {
			const { data: empData } = await supabase.from("employees").select("id, first_name, last_name").ilike("employee_id_code", assignedEmpId).limit(1).single();
			if (empData) {
				normalized.assigned_employee_db_id = empData.id;
				normalized.assigned_employee_name = `${empData.first_name} ${empData.last_name}`;
			} else warnings.push({
				row: context.rowNumber,
				field: "Assigned Employee Code",
				code: "REF_001",
				message: `Assigned Employee Code "${assignedEmpId}" not found in HRMS master.`,
				severity: "WARNING"
			});
		} catch {}
		if (operation === "DELETE" && existingRecord) {
			const isInUse = existingRecord.asset_status === "In Use";
			dependencies.push({
				dependency: "Current Assignment Status",
				count: isInUse ? 1 : 0,
				result: isInUse ? "Blocked" : "Pass",
				details: isInUse ? `Asset is currently "In Use". Disposal or return required.` : "Asset available or stored."
			});
			if (isInUse) errors.push({
				row: context.rowNumber,
				field: "Asset ID / Code",
				code: "DEL_003",
				message: "Asset deletion blocked: Asset is currently marked as \"In Use\". Use Disposal workflow instead.",
				severity: "ERROR"
			});
		}
		if (operation === "UPDATE" && existingRecord) for (const col of ASSET_COLUMNS) {
			if (col.immutable || col.key === "asset_code") continue;
			const oldVal = existingRecord[col.key];
			const cellValue = row[col.label] ?? row[col.label + " *"] ?? row[col.key];
			if (cellValue === void 0 || cellValue === null || String(cellValue).trim() === "") continue;
			const newVal = normalized[col.key];
			if (String(oldVal ?? "").trim() !== String(newVal ?? "").trim()) changes.push({
				field: col.key,
				label: col.label,
				oldValue: oldVal ?? "—",
				newValue: newVal === null ? "[CLEARED]" : newVal,
				status: newVal === null ? "CLEARED" : "CHANGED"
			});
		}
		return {
			errors,
			warnings,
			normalized,
			changes,
			dependencies
		};
	},
	async executeRecord(record, operation, user) {
		try {
			const data = record.normalizedData;
			const assetCode = record.recordKey;
			if (operation === "CREATE") {
				const payload = {
					asset_code: assetCode,
					asset_name: data.asset_name,
					category: data.category,
					subcategory: data.subcategory,
					brand: data.brand,
					model: data.model,
					serial_number: data.serial_number,
					ownership_type: data.ownership_type || "Owned",
					purchase_date: data.purchase_date,
					supplier: data.supplier,
					purchase_cost: data.purchase_cost || 0,
					warranty_expiry_date: data.warranty_expiry_date,
					assigned_property_id: data.assigned_property_id,
					assigned_property_code: data.assigned_property_code,
					assigned_unit_code: data.assigned_unit_code,
					assigned_employee_id: data.assigned_employee_db_id,
					assigned_employee_name: data.assigned_employee_name,
					assignment_date: data.assignment_date,
					asset_condition: data.asset_condition || "Good",
					asset_status: data.asset_status || "Available",
					life_of_asset: data.life_of_asset,
					opening_cost: data.opening_cost,
					last_service_date: data.last_service_date,
					next_service_date: data.next_service_date,
					remarks: data.remarks
				};
				const { data: created, error } = await supabase.from("assets").insert(payload).select().single();
				if (error) throw error;
				return {
					success: true,
					createdId: created.id,
					resultText: `Asset "${assetCode}" created.`
				};
			}
			if (operation === "UPDATE") {
				const existing = record.originalDbData;
				if (!existing?.id) throw new Error("Asset record ID not found");
				const updatePayload = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
				for (const change of record.changes) updatePayload[change.field] = change.newValue === "[CLEARED]" ? null : change.newValue;
				const { error } = await supabase.from("assets").update(updatePayload).eq("id", existing.id);
				if (error) throw error;
				return {
					success: true,
					resultText: `Asset "${assetCode}" updated (${record.changes.length} fields).`
				};
			}
			if (operation === "DELETE") {
				const existing = record.originalDbData;
				if (!existing?.id) throw new Error("Asset record ID not found");
				const { error } = await supabase.from("assets").update({
					asset_status: "Disposed",
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", existing.id);
				if (error) throw error;
				return {
					success: true,
					resultText: `Asset "${assetCode}" marked as Disposed.`
				};
			}
			return {
				success: false,
				resultText: "Unsupported operation"
			};
		} catch (err) {
			return {
				success: false,
				resultText: "Failed to process asset record",
				error: err?.message || "Database error occurred"
			};
		}
	}
};
var LEASE_COLUMNS = [
	{
		key: "lease_number",
		label: "Lease Number / Ref",
		type: "string",
		required: true,
		unique: true,
		immutable: true,
		sampleValue: "LS-2026-001",
		description: "Unique lease contract identifier"
	},
	{
		key: "customer_identifier",
		label: "Customer Identifier (QID/Passport/CR)",
		type: "string",
		required: true,
		sampleValue: "28463401923",
		description: "Must exist in Customer Master"
	},
	{
		key: "property_code",
		label: "Property Code",
		type: "string",
		required: true,
		sampleValue: "AAA",
		description: "Must exist in Property Master"
	},
	{
		key: "unit_code",
		label: "Unit Code",
		type: "string",
		required: true,
		sampleValue: "Flat12",
		description: "Must exist under the referenced Property"
	},
	{
		key: "lease_status",
		label: "Lease Status",
		type: "enum",
		required: true,
		allowedValues: [
			"DRAFT",
			"DOCUMENTS_VERIFIED",
			"ACTIVE",
			"RENEWAL_CONFIRMED",
			"CLOSED",
			"TERMINATED"
		],
		sampleValue: "DRAFT"
	},
	{
		key: "commencement_date",
		label: "Commencement Date",
		type: "date",
		required: true,
		sampleValue: "2026-01-01"
	},
	{
		key: "expiry_date",
		label: "Expiry Date",
		type: "date",
		required: true,
		sampleValue: "2026-12-31"
	},
	{
		key: "lease_period_months",
		label: "Lease Period (Months)",
		type: "number",
		required: true,
		sampleValue: 12
	},
	{
		key: "rental_amount",
		label: "Annual Rental Amount (QAR)",
		type: "number",
		required: true,
		sampleValue: 66e3
	},
	{
		key: "payment_frequency",
		label: "Payment Frequency",
		type: "enum",
		required: true,
		allowedValues: [
			"Monthly",
			"Quarterly",
			"Semi-Annually",
			"Annually"
		],
		sampleValue: "Monthly"
	},
	{
		key: "security_deposit",
		label: "Security Deposit (QAR)",
		type: "number",
		required: false,
		sampleValue: 5500
	},
	{
		key: "security_deposit_status",
		label: "Deposit Status",
		type: "enum",
		required: false,
		allowedValues: [
			"Pending",
			"Received",
			"Refunded",
			"Adjusted"
		],
		sampleValue: "Received"
	},
	{
		key: "grace_period_days",
		label: "Grace Period (Days)",
		type: "number",
		required: false,
		sampleValue: 5
	},
	{
		key: "maintenance_responsibility",
		label: "Maintenance Responsibility",
		type: "enum",
		required: false,
		allowedValues: [
			"Landlord",
			"Tenant",
			"Shared"
		],
		sampleValue: "Landlord"
	},
	{
		key: "utility_responsibility",
		label: "Utility Responsibility",
		type: "enum",
		required: false,
		allowedValues: [
			"Landlord",
			"Tenant",
			"Shared"
		],
		sampleValue: "Tenant"
	},
	{
		key: "number_of_pdc",
		label: "Number of PDCs",
		type: "number",
		required: false,
		sampleValue: 12
	},
	{
		key: "remarks",
		label: "Special Conditions / Remarks",
		type: "string",
		required: false,
		sampleValue: "Standard 1 year residential lease agreement."
	}
];
var leaseAdapter = {
	module: "lease",
	label: "Lease",
	primaryKeyLabel: "Lease Number",
	primaryKeyField: "lease_number",
	columns: LEASE_COLUMNS,
	getTemplateColumns(operation) {
		if (operation === "DELETE") return [LEASE_COLUMNS.find((c) => c.key === "lease_number"), LEASE_COLUMNS.find((c) => c.key === "customer_identifier")];
		return LEASE_COLUMNS;
	},
	resolveRecordKey(row) {
		const raw = row["Lease Number / Ref"] ?? row["Lease Number"] ?? row["lease_number"] ?? row["Contract No."] ?? row["contract_no"] ?? "";
		return String(raw).trim();
	},
	async fetchExistingRecords(keys) {
		const map = /* @__PURE__ */ new Map();
		if (keys.length === 0) return map;
		try {
			const { data, error } = await supabase.from("leases").select("*, customers(id, full_name, qatar_id, passport_number, commercial_registration), properties(id, property_code, title), units(id, unit_code)").in("lease_number", keys);
			if (!error && data) {
				for (const row of data) if (row.lease_number) map.set(row.lease_number.trim().toUpperCase(), row);
			}
		} catch (e) {
			console.error("Error fetching leases:", e);
		}
		return map;
	},
	async validateRow(row, operation, context) {
		const errors = [];
		const warnings = [];
		const changes = [];
		const dependencies = [];
		const normalized = {};
		const leaseNum = leaseAdapter.resolveRecordKey(row);
		if (!leaseNum) errors.push({
			row: context.rowNumber,
			field: "Lease Number / Ref",
			code: "VAL_001",
			message: "Lease Number / Ref is required.",
			severity: "ERROR"
		});
		if (leaseNum) {
			const upperKey = leaseNum.toUpperCase();
			if (context.inBatchKeys.has(upperKey)) errors.push({
				row: context.rowNumber,
				field: "Lease Number / Ref",
				code: "DUP_001",
				message: `Duplicate Lease Number "${leaseNum}" in Excel file.`,
				severity: "ERROR"
			});
		}
		const existingRecord = context.existingRecord;
		if (operation === "CREATE") {
			if (existingRecord) errors.push({
				row: context.rowNumber,
				field: "Lease Number / Ref",
				code: "DUP_002",
				message: `Lease "${leaseNum}" already exists in database.`,
				severity: "ERROR"
			});
		} else if (!existingRecord) errors.push({
			row: context.rowNumber,
			field: "Lease Number / Ref",
			code: operation === "UPDATE" ? "UPD_001" : "DEL_001",
			message: `Lease "${leaseNum}" not found in database.`,
			severity: "ERROR"
		});
		for (const col of LEASE_COLUMNS) {
			if (operation === "DELETE") continue;
			const cellValue = row[col.label] ?? row[col.label + " *"] ?? row[col.key];
			if (operation === "CREATE" && col.required && (cellValue === void 0 || cellValue === null || String(cellValue).trim() === "")) errors.push({
				row: context.rowNumber,
				field: col.label,
				code: "VAL_001",
				message: `${col.label} is required.`,
				severity: "ERROR"
			});
			if (cellValue !== void 0 && cellValue !== null && String(cellValue).trim() !== "") {
				const strVal = String(cellValue).trim();
				if (strVal === "[NULL]") normalized[col.key] = null;
				else if (col.type === "number") {
					const num = Number(strVal.replace(/,/g, ""));
					if (isNaN(num)) errors.push({
						row: context.rowNumber,
						field: col.label,
						code: "VAL_005",
						message: `${col.label} must be a valid number.`,
						severity: "ERROR"
					});
					else normalized[col.key] = num;
				} else normalized[col.key] = strVal;
			}
		}
		if (operation === "CREATE") {
			const custId = normalized["customer_identifier"];
			if (custId) try {
				const { data: custData } = await supabase.from("customers").select("id, full_name, verification_status").or(`qatar_id.eq.${custId},passport_number.eq.${custId},commercial_registration.eq.${custId}`).limit(1).single();
				if (custData) {
					normalized.customer_id = custData.id;
					normalized.tenant_name = custData.full_name;
					if (custData.verification_status !== "Verified") warnings.push({
						row: context.rowNumber,
						field: "Customer Identifier",
						code: "VAL_002",
						message: `Customer document verification status is "${custData.verification_status}". Lease agreement should only proceed if approved.`,
						severity: "WARNING"
					});
				} else errors.push({
					row: context.rowNumber,
					field: "Customer Identifier",
					code: "REF_001",
					message: `Customer "${custId}" does not exist in master records.`,
					severity: "ERROR",
					resolution: "Create the Customer Master record before generating a Lease."
				});
			} catch {
				errors.push({
					row: context.rowNumber,
					field: "Customer Identifier",
					code: "REF_001",
					message: `Customer "${custId}" does not exist in master records.`,
					severity: "ERROR"
				});
			}
			const propCode = normalized["property_code"];
			const unitCode = normalized["unit_code"];
			if (propCode && unitCode) try {
				const { data: propData } = await supabase.from("properties").select("id").ilike("property_code", propCode).limit(1).single();
				if (propData) {
					normalized.property_id = propData.id;
					const { data: unitData } = await supabase.from("units").select("id, status, lease_status").eq("property_id", propData.id).or(`unit_code.eq.${unitCode},unit_ref.eq.${unitCode}`).limit(1).single();
					if (unitData) {
						normalized.unit_id = unitData.id;
						if (unitData.status === "Occupied" || unitData.lease_status === "ACTIVE") errors.push({
							row: context.rowNumber,
							field: "Unit Code",
							code: "VAL_002",
							message: `Unit "${unitCode}" is currently Occupied / has an active lease.`,
							severity: "ERROR",
							resolution: "Select an Available unit for new lease creation."
						});
					} else errors.push({
						row: context.rowNumber,
						field: "Unit Code",
						code: "REF_001",
						message: `Unit "${unitCode}" not found under Property "${propCode}".`,
						severity: "ERROR"
					});
				} else errors.push({
					row: context.rowNumber,
					field: "Property Code",
					code: "REF_001",
					message: `Property "${propCode}" not found.`,
					severity: "ERROR"
				});
			} catch (e) {
				console.error("Lease prop/unit check error:", e);
			}
		}
		if (operation === "DELETE" && existingRecord) try {
			const leaseId = existingRecord.id;
			const [pdcRes, receiptRes] = await Promise.allSettled([supabase.from("pdcs").select("id", { count: "exact" }).eq("lease_id", leaseId), supabase.from("receipts").select("id", { count: "exact" }).eq("lease_id", leaseId)]);
			const pdcCount = pdcRes.status === "fulfilled" ? pdcRes.value.count ?? 0 : 0;
			const receiptCount = receiptRes.status === "fulfilled" ? receiptRes.value.count ?? 0 : 0;
			const isLeaseActive = existingRecord.lease_status === "ACTIVE";
			dependencies.push({
				dependency: "Linked PDCs",
				count: pdcCount,
				result: pdcCount > 0 ? "Blocked" : "Pass",
				details: pdcCount > 0 ? `${pdcCount} cheques registered in finance.` : "None"
			});
			dependencies.push({
				dependency: "Financial Receipts",
				count: receiptCount,
				result: receiptCount > 0 ? "Blocked" : "Pass",
				details: receiptCount > 0 ? `${receiptCount} receipts posted.` : "None"
			});
			if (pdcCount > 0 || receiptCount > 0 || isLeaseActive) errors.push({
				row: context.rowNumber,
				field: "Lease Number / Ref",
				code: "DEL_003",
				message: `Lease deletion blocked: Lease has active financial transactions (${pdcCount} PDCs, ${receiptCount} receipts) or is in ACTIVE state. Use Lease Termination / Checkout workflow.`,
				severity: "ERROR"
			});
		} catch (e) {
			console.error("Lease delete validation error:", e);
		}
		if (operation === "UPDATE" && existingRecord) for (const col of LEASE_COLUMNS) {
			if (col.immutable || col.key === "lease_number") continue;
			const oldVal = existingRecord[col.key];
			const cellValue = row[col.label] ?? row[col.label + " *"] ?? row[col.key];
			if (cellValue === void 0 || cellValue === null || String(cellValue).trim() === "") continue;
			const newVal = normalized[col.key];
			if (String(oldVal ?? "").trim() !== String(newVal ?? "").trim()) changes.push({
				field: col.key,
				label: col.label,
				oldValue: oldVal ?? "—",
				newValue: newVal === null ? "[CLEARED]" : newVal,
				status: newVal === null ? "CLEARED" : "CHANGED"
			});
		}
		return {
			errors,
			warnings,
			normalized,
			changes,
			dependencies
		};
	},
	async executeRecord(record, operation, user) {
		try {
			const data = record.normalizedData;
			const leaseNum = record.recordKey;
			if (operation === "CREATE") {
				const payload = {
					lease_number: leaseNum,
					customer_id: data.customer_id,
					property_id: data.property_id,
					unit_id: data.unit_id,
					tenant_name: data.tenant_name,
					lease_status: data.lease_status || "DRAFT",
					commencement_date: data.commencement_date,
					expiry_date: data.expiry_date,
					lease_period_months: data.lease_period_months || 12,
					rental_amount: data.rental_amount,
					payment_frequency: data.payment_frequency || "Monthly",
					security_deposit: data.security_deposit || 0,
					security_deposit_status: data.security_deposit_status || "Pending",
					grace_period_days: data.grace_period_days || 5,
					maintenance_responsibility: data.maintenance_responsibility || "Landlord",
					utility_responsibility: data.utility_responsibility || "Tenant",
					number_of_pdc: data.number_of_pdc || 0,
					special_conditions: data.remarks
				};
				const { data: created, error } = await supabase.from("leases").insert(payload).select().single();
				if (error) throw error;
				if (data.unit_id && (data.lease_status === "ACTIVE" || data.lease_status === "RENEWAL_CONFIRMED")) await supabase.from("units").update({
					status: "Occupied",
					lease_status: "ACTIVE"
				}).eq("id", data.unit_id);
				return {
					success: true,
					createdId: created.id,
					resultText: `Lease "${leaseNum}" created successfully.`
				};
			}
			if (operation === "UPDATE") {
				const existing = record.originalDbData;
				if (!existing?.id) throw new Error("Lease record ID not found");
				const updatePayload = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
				for (const change of record.changes) updatePayload[change.field] = change.newValue === "[CLEARED]" ? null : change.newValue;
				const { error } = await supabase.from("leases").update(updatePayload).eq("id", existing.id);
				if (error) throw error;
				return {
					success: true,
					resultText: `Lease "${leaseNum}" updated (${record.changes.length} fields).`
				};
			}
			if (operation === "DELETE") {
				const existing = record.originalDbData;
				if (!existing?.id) throw new Error("Lease record ID not found");
				const { error } = await supabase.from("leases").update({
					lease_status: "TERMINATED",
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", existing.id);
				if (error) throw error;
				return {
					success: true,
					resultText: `Lease "${leaseNum}" terminated/archived.`
				};
			}
			return {
				success: false,
				resultText: "Unsupported operation"
			};
		} catch (err) {
			return {
				success: false,
				resultText: "Failed to process lease record",
				error: err?.message || "Database error occurred"
			};
		}
	}
};
var EMPLOYEE_COLUMNS = [
	{
		key: "employee_id_code",
		label: "Employee ID / Code",
		type: "string",
		required: true,
		unique: true,
		immutable: true,
		sampleValue: "EMP-001",
		description: "Unique employee identification"
	},
	{
		key: "first_name",
		label: "First Name",
		type: "string",
		required: true,
		sampleValue: "Ahmad"
	},
	{
		key: "last_name",
		label: "Last Name",
		type: "string",
		required: true,
		sampleValue: "Al-Rashid"
	},
	{
		key: "gender",
		label: "Gender",
		type: "enum",
		required: false,
		allowedValues: [
			"Male",
			"Female",
			"Other"
		],
		sampleValue: "Male"
	},
	{
		key: "nationality",
		label: "Nationality",
		type: "string",
		required: false,
		sampleValue: "Qatari"
	},
	{
		key: "date_of_birth",
		label: "Date of Birth",
		type: "date",
		required: false,
		sampleValue: "1988-04-12"
	},
	{
		key: "mobile_number",
		label: "Mobile Number",
		type: "string",
		required: true,
		sampleValue: "97455019283"
	},
	{
		key: "email",
		label: "Email Address",
		type: "string",
		required: true,
		sampleValue: "ahmad.rashid@company.qa"
	},
	{
		key: "department_name",
		label: "Department Name",
		type: "string",
		required: false,
		sampleValue: "Property Management"
	},
	{
		key: "designation_title",
		label: "Designation / Title",
		type: "string",
		required: false,
		sampleValue: "Property Manager"
	},
	{
		key: "reporting_manager_code",
		label: "Reporting Manager ID",
		type: "string",
		required: false,
		sampleValue: "EMP-000"
	},
	{
		key: "date_of_joining",
		label: "Date of Joining",
		type: "date",
		required: false,
		sampleValue: "2021-03-01"
	},
	{
		key: "employment_type",
		label: "Employment Type",
		type: "enum",
		required: false,
		allowedValues: [
			"Full-Time",
			"Part-Time",
			"Contract",
			"Probation"
		],
		sampleValue: "Full-Time"
	},
	{
		key: "qid_passport_no",
		label: "QID / Passport No.",
		type: "string",
		required: false,
		sampleValue: "28863401923"
	},
	{
		key: "id_expiry_date",
		label: "ID Expiry Date",
		type: "date",
		required: false,
		sampleValue: "2027-04-12"
	},
	{
		key: "basic_salary",
		label: "Basic Salary (QAR)",
		type: "number",
		required: false,
		sampleValue: 12e3
	},
	{
		key: "hra",
		label: "HRA (QAR)",
		type: "number",
		required: false,
		sampleValue: 4e3
	},
	{
		key: "tra",
		label: "TRA (QAR)",
		type: "number",
		required: false,
		sampleValue: 2e3
	},
	{
		key: "other_allowances",
		label: "Other Allowances (QAR)",
		type: "number",
		required: false,
		sampleValue: 1e3
	},
	{
		key: "bank_name",
		label: "Bank Name",
		type: "string",
		required: false,
		sampleValue: "Qatar National Bank (QNB)"
	},
	{
		key: "iban",
		label: "IBAN",
		type: "string",
		required: false,
		sampleValue: "QA55QNBA0000000012345678901"
	},
	{
		key: "air_ticket",
		label: "Air Ticket Allowance",
		type: "string",
		required: false,
		sampleValue: "Annual Economy Ticket"
	},
	{
		key: "employee_status",
		label: "Employee Status",
		type: "enum",
		required: false,
		allowedValues: [
			"Active",
			"On Leave",
			"Probation",
			"Terminated",
			"Resigned"
		],
		sampleValue: "Active"
	},
	{
		key: "emergency_contact_name",
		label: "Emergency Contact Name",
		type: "string",
		required: false,
		sampleValue: "Fatima Al-Rashid"
	},
	{
		key: "emergency_contact_relation",
		label: "Emergency Contact Relation",
		type: "string",
		required: false,
		sampleValue: "Spouse"
	},
	{
		key: "emergency_contact_number",
		label: "Emergency Contact Phone",
		type: "string",
		required: false,
		sampleValue: "97455019284"
	},
	{
		key: "remarks",
		label: "Remarks",
		type: "string",
		required: false,
		sampleValue: "Senior PMS staff member"
	}
];
var employeeAdapter = {
	module: "employee",
	label: "Employee",
	primaryKeyLabel: "Employee ID / Code",
	primaryKeyField: "employee_id_code",
	columns: EMPLOYEE_COLUMNS,
	getTemplateColumns(operation) {
		if (operation === "DELETE") return [
			EMPLOYEE_COLUMNS.find((c) => c.key === "employee_id_code"),
			EMPLOYEE_COLUMNS.find((c) => c.key === "first_name"),
			EMPLOYEE_COLUMNS.find((c) => c.key === "last_name")
		];
		return EMPLOYEE_COLUMNS;
	},
	resolveRecordKey(row) {
		const raw = row["Employee ID / Code"] ?? row["Employee ID"] ?? row["employee_id_code"] ?? row["Employee code"] ?? row["employee_id"] ?? "";
		return String(raw).trim();
	},
	async fetchExistingRecords(keys) {
		const map = /* @__PURE__ */ new Map();
		if (keys.length === 0) return map;
		try {
			const { data, error } = await supabase.from("employees").select("*, departments(id, name), designations(id, title)").in("employee_id_code", keys);
			if (!error && data) {
				for (const row of data) if (row.employee_id_code) map.set(row.employee_id_code.trim().toUpperCase(), row);
			}
		} catch (e) {
			console.error("Error fetching employees:", e);
		}
		return map;
	},
	async validateRow(row, operation, context) {
		const errors = [];
		const warnings = [];
		const changes = [];
		const dependencies = [];
		const normalized = {};
		const empCode = employeeAdapter.resolveRecordKey(row);
		if (!empCode) errors.push({
			row: context.rowNumber,
			field: "Employee ID / Code",
			code: "VAL_001",
			message: "Employee ID / Code is required.",
			severity: "ERROR"
		});
		if (empCode) {
			const upperKey = empCode.toUpperCase();
			if (context.inBatchKeys.has(upperKey)) errors.push({
				row: context.rowNumber,
				field: "Employee ID / Code",
				code: "DUP_001",
				message: `Duplicate Employee ID "${empCode}" in Excel file.`,
				severity: "ERROR"
			});
		}
		const existingRecord = context.existingRecord;
		if (operation === "CREATE") {
			if (existingRecord) errors.push({
				row: context.rowNumber,
				field: "Employee ID / Code",
				code: "DUP_002",
				message: `Employee "${empCode}" already exists in database.`,
				severity: "ERROR",
				resolution: "Use a unique Employee ID or use UPDATE operation."
			});
		} else if (!existingRecord) errors.push({
			row: context.rowNumber,
			field: "Employee ID / Code",
			code: operation === "UPDATE" ? "UPD_001" : "DEL_001",
			message: `Employee "${empCode}" was not found in database.`,
			severity: "ERROR"
		});
		for (const col of EMPLOYEE_COLUMNS) {
			if (operation === "DELETE") continue;
			const cellValue = row[col.label] ?? row[col.label + " *"] ?? row[col.key];
			if (operation === "CREATE" && col.required && (cellValue === void 0 || cellValue === null || String(cellValue).trim() === "")) errors.push({
				row: context.rowNumber,
				field: col.label,
				code: "VAL_001",
				message: `${col.label} is required.`,
				severity: "ERROR"
			});
			if (cellValue !== void 0 && cellValue !== null && String(cellValue).trim() !== "") {
				const strVal = String(cellValue).trim();
				if (strVal === "[NULL]") normalized[col.key] = null;
				else if (col.type === "number") {
					const num = Number(strVal.replace(/,/g, ""));
					if (isNaN(num)) errors.push({
						row: context.rowNumber,
						field: col.label,
						code: "VAL_005",
						message: `${col.label} must be a number.`,
						severity: "ERROR"
					});
					else normalized[col.key] = num;
				} else if (col.key === "email" && strVal !== "[NULL]") {
					if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(strVal)) errors.push({
						row: context.rowNumber,
						field: "Email Address",
						code: "VAL_002",
						message: `Invalid email format: "${strVal}"`,
						severity: "ERROR"
					});
					normalized[col.key] = strVal;
				} else normalized[col.key] = strVal;
			}
		}
		const deptName = normalized["department_name"];
		if (deptName && deptName !== "[NULL]") try {
			const { data: dept } = await supabase.from("departments").select("id, name").ilike("name", deptName).limit(1).single();
			if (dept) normalized.department_id = dept.id;
			else warnings.push({
				row: context.rowNumber,
				field: "Department Name",
				code: "REF_001",
				message: `Department "${deptName}" not found in HRMS master.`,
				severity: "WARNING"
			});
		} catch {}
		const desigTitle = normalized["designation_title"];
		if (desigTitle && desigTitle !== "[NULL]") try {
			const { data: desig } = await supabase.from("designations").select("id, title").ilike("title", desigTitle).limit(1).single();
			if (desig) normalized.designation_id = desig.id;
			else warnings.push({
				row: context.rowNumber,
				field: "Designation / Title",
				code: "REF_001",
				message: `Designation "${desigTitle}" not found in HRMS master.`,
				severity: "WARNING"
			});
		} catch {}
		if (operation === "DELETE" && existingRecord) try {
			const empId = existingRecord.id;
			const { data: assignedAssets } = await supabase.from("assets").select("id, asset_code").eq("assigned_employee_id", empId);
			const assetCount = assignedAssets?.length ?? 0;
			dependencies.push({
				dependency: "Assigned Assets",
				count: assetCount,
				result: assetCount > 0 ? "Blocked" : "Pass",
				details: assetCount > 0 ? `${assetCount} assets currently assigned to employee.` : "No assets assigned."
			});
			if (assetCount > 0) errors.push({
				row: context.rowNumber,
				field: "Employee ID / Code",
				code: "DEL_003",
				message: `Employee deletion blocked: ${assetCount} assets assigned. Reassign or return assets first.`,
				severity: "ERROR"
			});
		} catch (e) {
			console.error("Employee delete check error:", e);
		}
		if (operation === "UPDATE" && existingRecord) for (const col of EMPLOYEE_COLUMNS) {
			if (col.immutable || col.key === "employee_id_code") continue;
			const oldVal = existingRecord[col.key];
			const cellValue = row[col.label] ?? row[col.label + " *"] ?? row[col.key];
			if (cellValue === void 0 || cellValue === null || String(cellValue).trim() === "") continue;
			const newVal = normalized[col.key];
			if (String(oldVal ?? "").trim() !== String(newVal ?? "").trim()) changes.push({
				field: col.key,
				label: col.label,
				oldValue: oldVal ?? "—",
				newValue: newVal === null ? "[CLEARED]" : newVal,
				status: newVal === null ? "CLEARED" : "CHANGED"
			});
		}
		return {
			errors,
			warnings,
			normalized,
			changes,
			dependencies
		};
	},
	async executeRecord(record, operation, user) {
		try {
			const data = record.normalizedData;
			const empCode = record.recordKey;
			if (operation === "CREATE") {
				const payload = {
					employee_id_code: empCode,
					first_name: data.first_name,
					last_name: data.last_name,
					gender: data.gender,
					nationality: data.nationality,
					date_of_birth: data.date_of_birth,
					mobile_number: data.mobile_number,
					email: data.email,
					department_id: data.department_id,
					designation_id: data.designation_id,
					date_of_joining: data.date_of_joining,
					employment_type: data.employment_type || "Full-Time",
					qid_passport_no: data.qid_passport_no,
					id_expiry_date: data.id_expiry_date,
					basic_salary: data.basic_salary || 0,
					hra: data.hra || 0,
					tra: data.tra || 0,
					other_allowances: data.other_allowances || 0,
					bank_name: data.bank_name,
					iban: data.iban,
					air_ticket: data.air_ticket,
					employee_status: data.employee_status || "Active",
					emergency_contact_name: data.emergency_contact_name,
					emergency_contact_relation: data.emergency_contact_relation,
					emergency_contact_number: data.emergency_contact_number,
					remarks: data.remarks
				};
				const { data: created, error } = await supabase.from("employees").insert(payload).select().single();
				if (error) throw error;
				return {
					success: true,
					createdId: created.id,
					resultText: `Employee "${empCode}" created successfully.`
				};
			}
			if (operation === "UPDATE") {
				const existing = record.originalDbData;
				if (!existing?.id) throw new Error("Employee ID not found");
				const updatePayload = { updated_at: (/* @__PURE__ */ new Date()).toISOString() };
				for (const change of record.changes) updatePayload[change.field] = change.newValue === "[CLEARED]" ? null : change.newValue;
				const { error } = await supabase.from("employees").update(updatePayload).eq("id", existing.id);
				if (error) throw error;
				return {
					success: true,
					resultText: `Employee "${empCode}" updated (${record.changes.length} fields).`
				};
			}
			if (operation === "DELETE") {
				const existing = record.originalDbData;
				if (!existing?.id) throw new Error("Employee ID not found");
				const { error } = await supabase.from("employees").update({
					employee_status: "Terminated",
					updated_at: (/* @__PURE__ */ new Date()).toISOString()
				}).eq("id", existing.id);
				if (error) throw error;
				return {
					success: true,
					resultText: `Employee "${empCode}" status set to Terminated.`
				};
			}
			return {
				success: false,
				resultText: "Unsupported operation"
			};
		} catch (err) {
			return {
				success: false,
				resultText: "Failed to process employee record",
				error: err?.message || "Database error occurred"
			};
		}
	}
};
var cachedOptions = null;
var lastFetchTime = 0;
var CACHE_TTL_MS = 6e4;
async function getMasterOptions() {
	const now = Date.now();
	if (cachedOptions && now - lastFetchTime < CACHE_TTL_MS) return cachedOptions;
	const fallback = {
		propertyTypes: referenceDropdowns.propertyTypes.map((p) => p.value),
		propertyCategories: referenceDropdowns.propertyCategories.map((p) => p.value),
		ownershipTypes: referenceDropdowns.ownershipTypes.map((p) => p.value),
		propertyStatuses: referenceDropdowns.propertyStatuses.map((p) => p.value),
		unitUsages: [
			"Residential",
			"Commercial",
			"Staff Accommodation",
			"Storage",
			"Retail"
		],
		viewTypes: [
			"City View",
			"Sea View",
			"Garden View",
			"Street View",
			"Courtyard View",
			"Open View"
		],
		furnishingTypes: [
			"Unfurnished",
			"Semi-Furnished",
			"Fully Furnished"
		],
		unitStatuses: referenceDropdowns.unitStatuses.map((p) => p.value),
		leaseStatuses: [
			"DRAFT",
			"ACTIVE",
			"EXPIRED",
			"TERMINATED",
			"CLOSED"
		],
		rentFrequencies: referenceDropdowns.rentFrequencies.map((p) => p.value),
		maintenanceResponsibilities: [
			"Landlord",
			"Tenant",
			"Shared"
		],
		customerTypes: ["Individual", "Company"],
		verificationStatuses: [
			"Pending",
			"Verified",
			"Rejected",
			"Additional Info Required"
		],
		genders: [
			"Male",
			"Female",
			"Other"
		],
		departments: [
			"Administration",
			"Finance & Accounts",
			"Leasing & Sales",
			"Property Management",
			"Operations & Maintenance",
			"HR",
			"Legal"
		],
		designations: [
			"Property Manager",
			"Leasing Executive",
			"Finance Manager",
			"Accountant",
			"Cashier",
			"Maintenance Supervisor",
			"Technician",
			"HR Officer",
			"General Manager"
		],
		employmentTypes: [
			"Full-Time",
			"Part-Time",
			"Contract",
			"Probation",
			"Temporary"
		],
		workLocations: [
			"Doha HQ",
			"Old Salata Office",
			"Lusail Branch",
			"On-Site Property"
		],
		employeeStatuses: [
			"Active",
			"On Leave",
			"Probation",
			"Terminated",
			"Resigned"
		],
		assetCategories: [
			"HVAC",
			"Electrical",
			"Plumbing",
			"Furniture",
			"Appliances",
			"IT & Security",
			"Vehicles",
			"Elevator & Mechanical"
		],
		assetOwnershipTypes: [
			"Owned",
			"Leased",
			"Customer Provided",
			"Landlord Provided"
		],
		assetConditions: [
			"Brand New",
			"Good",
			"Fair",
			"Needs Repair",
			"Scrap / Disposed"
		],
		assetStatuses: [
			"Available",
			"In Use",
			"Under Maintenance",
			"Damaged",
			"Disposed"
		],
		countries: [
			"Qatar",
			"Saudi Arabia",
			"United Arab Emirates",
			"Kuwait",
			"Bahrain",
			"Oman"
		]
	};
	try {
		const [genders, depts, desigs, empTypes, workLocs, empStatuses, assetCats, assetOwnerTypes, assetConds, assetStats] = await Promise.allSettled([
			fetchGenders(),
			fetchDepartments(),
			fetchDesignations(),
			fetchEmploymentTypes(),
			fetchWorkLocations(),
			fetchEmployeeStatuses(),
			fetchAssetCategories(),
			fetchAssetOwnershipTypes(),
			fetchAssetConditions(),
			fetchAssetStatuses()
		]);
		const extractNames = (result, fallbackList) => {
			if (result.status === "fulfilled" && Array.isArray(result.value) && result.value.length > 0) return result.value.map((item) => item.name || item.label || item.code || String(item)).filter(Boolean);
			return fallbackList;
		};
		cachedOptions = {
			propertyTypes: fallback.propertyTypes,
			propertyCategories: fallback.propertyCategories,
			ownershipTypes: fallback.ownershipTypes,
			propertyStatuses: fallback.propertyStatuses,
			unitUsages: fallback.unitUsages,
			viewTypes: fallback.viewTypes,
			furnishingTypes: fallback.furnishingTypes,
			unitStatuses: fallback.unitStatuses,
			leaseStatuses: fallback.leaseStatuses,
			rentFrequencies: fallback.rentFrequencies,
			maintenanceResponsibilities: fallback.maintenanceResponsibilities,
			customerTypes: fallback.customerTypes,
			verificationStatuses: fallback.verificationStatuses,
			genders: extractNames(genders, fallback.genders),
			departments: extractNames(depts, fallback.departments),
			designations: extractNames(desigs, fallback.designations),
			employmentTypes: extractNames(empTypes, fallback.employmentTypes),
			workLocations: extractNames(workLocs, fallback.workLocations),
			employeeStatuses: extractNames(empStatuses, fallback.employeeStatuses),
			assetCategories: extractNames(assetCats, fallback.assetCategories),
			assetOwnershipTypes: extractNames(assetOwnerTypes, fallback.assetOwnershipTypes),
			assetConditions: extractNames(assetConds, fallback.assetConditions),
			assetStatuses: extractNames(assetStats, fallback.assetStatuses),
			countries: fallback.countries
		};
		lastFetchTime = now;
		return cachedOptions;
	} catch {
		cachedOptions = fallback;
		lastFetchTime = now;
		return cachedOptions;
	}
}
var STORAGE_KEY = "stayhub_import_batches_history_v1";
var AUDIT_STORAGE_KEY = "stayhub_import_audit_trail_v1";
/**
* In-memory / local storage provider for import history and audit logs
*/
function getImportBatchHistory() {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		return JSON.parse(raw);
	} catch {
		return [];
	}
}
function saveImportBatch(batch) {
	try {
		const existing = getImportBatchHistory();
		const idx = existing.findIndex((b) => b.id === batch.id);
		const leanBatch = { ...batch };
		if (idx >= 0) existing[idx] = leanBatch;
		else existing.unshift(leanBatch);
		const trimmed = existing.slice(0, 50);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
	} catch (e) {
		console.error("Failed to save import batch:", e);
	}
}
function recordAuditEvent(entry) {
	try {
		const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
		const logs = raw ? JSON.parse(raw) : [];
		logs.unshift({
			id: crypto.randomUUID(),
			...entry
		});
		localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs.slice(0, 200)));
	} catch (e) {
		console.error("Failed to record audit event:", e);
	}
}
var ADAPTER_REGISTRY$1 = {
	property: propertyAdapter,
	unit: unitAdapter,
	customer: customerAdapter,
	asset: assetAdapter,
	lease: leaseAdapter,
	employee: employeeAdapter
};
var ExcelImportEngine = class {
	/**
	* Parse uploaded Excel buffer and run pre-validation
	*/
	static async parseAndValidate(fileBuffer, fileName, module, operation, user) {
		const adapter = ADAPTER_REGISTRY$1[module];
		if (!adapter) throw new Error(`Module "${module}" is not supported.`);
		let wb;
		try {
			wb = readSync(fileBuffer, {
				type: "array",
				cellDates: true,
				raw: false
			});
		} catch (e) {
			throw new Error(`FILE_004: Failed to read Excel workbook. File may be corrupted or password protected.`);
		}
		if (!wb.SheetNames || wb.SheetNames.length === 0) throw new Error(`FILE_003: Excel file contains no worksheets.`);
		const targetSheetName = wb.SheetNames.find((s) => !s.toLowerCase().includes("instruction") && !s.toLowerCase().includes("master")) || wb.SheetNames[0];
		const ws = wb.Sheets[targetSheetName];
		if (!ws) throw new Error(`FILE_003: Could not find valid data sheet in workbook.`);
		const rawRows = utils.sheet_to_json(ws, { defval: "" });
		if (rawRows.length === 0) throw new Error(`FILE_003: The selected worksheet "${targetSheetName}" contains no data rows.`);
		if (rawRows.length > 5e3) throw new Error(`FILE_002: Maximum row limit exceeded (5,000 rows max per batch).`);
		const templateCols = adapter.getTemplateColumns(operation);
		const firstRowKeys = Object.keys(rawRows[0] || {});
		const cleanHeaderMap = /* @__PURE__ */ new Map();
		for (const k of firstRowKeys) {
			const clean = k.replace(/\s*\*$/, "").trim().toLowerCase();
			cleanHeaderMap.set(clean, k);
		}
		const pkCol = templateCols.find((c) => c.key === adapter.primaryKeyField);
		if (pkCol) {
			const cleanPk = pkCol.label.replace(/\s*\*$/, "").trim().toLowerCase();
			if (!cleanHeaderMap.has(cleanPk)) {
				if (!firstRowKeys.some((k) => k.toLowerCase().includes(adapter.primaryKeyField.toLowerCase()))) throw new Error(`COLUMN_001: Required column "${pkCol.label}" is missing from the uploaded file.`);
			}
		}
		const rowKeys = [];
		for (const row of rawRows) {
			const key = adapter.resolveRecordKey(row);
			if (key) rowKeys.push(key);
		}
		const existingDbMap = await adapter.fetchExistingRecords(rowKeys);
		const dropdownMasters = await getMasterOptions();
		const inBatchKeys = /* @__PURE__ */ new Set();
		const parsedRecords = [];
		let readyCount = 0;
		let errorCount = 0;
		let warningCount = 0;
		let noChangeCount = 0;
		let blockedCount = 0;
		for (let i = 0; i < rawRows.length; i++) {
			const row = rawRows[i];
			const rowNumber = i + 2;
			const recordKey = adapter.resolveRecordKey(row);
			const upperKey = recordKey.toUpperCase();
			const existingRecord = existingDbMap.get(upperKey);
			const validationRes = await adapter.validateRow(row, operation, {
				rowNumber,
				existingRecord,
				inBatchKeys,
				allExistingKeys: new Set(existingDbMap.keys()),
				dropdownMasters
			});
			if (recordKey) inBatchKeys.add(upperKey);
			let rowStatus = "READY";
			if (validationRes.errors.length > 0) {
				rowStatus = "ERROR";
				errorCount++;
			} else if (validationRes.dependencies.some((d) => d.result === "Blocked")) {
				rowStatus = "BLOCKED";
				blockedCount++;
			} else if (operation === "UPDATE" && validationRes.changes.length === 0) {
				rowStatus = "NO_CHANGE";
				noChangeCount++;
			} else if (validationRes.warnings.length > 0) {
				rowStatus = "WARNING";
				warningCount++;
				readyCount++;
			} else {
				rowStatus = "READY";
				readyCount++;
			}
			parsedRecords.push({
				excelRowNumber: rowNumber,
				recordKey: recordKey || `ROW-${rowNumber}`,
				recordId: existingRecord?.id,
				recordName: existingRecord?.title || existingRecord?.full_name || existingRecord?.asset_name || existingRecord?.first_name ? `${existingRecord?.first_name} ${existingRecord?.last_name || ""}` : void 0,
				rawRowData: row,
				normalizedData: validationRes.normalized,
				originalDbData: existingRecord,
				status: rowStatus,
				changes: validationRes.changes,
				dependencies: validationRes.dependencies,
				errors: validationRes.errors,
				warnings: validationRes.warnings,
				dbVersion: existingRecord?.updated_at || existingRecord?.created_at
			});
		}
		const batchIdentifier = `IMP-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}-${Math.floor(1e5 + Math.random() * 9e5)}`;
		const summary = {
			totalRows: rawRows.length,
			validRows: readyCount,
			errorRows: errorCount,
			warningRows: warningCount,
			recordsToCreate: operation === "CREATE" ? readyCount : 0,
			recordsToUpdate: operation === "UPDATE" ? readyCount : 0,
			recordsToDelete: operation === "DELETE" ? readyCount : 0,
			noChangeRows: noChangeCount,
			blockedRows: blockedCount,
			skippedRows: 0,
			successRows: 0,
			failedRows: 0
		};
		const batch = {
			id: crypto.randomUUID(),
			batchIdentifier,
			module,
			operation,
			fileName,
			fileSize: fileBuffer.byteLength,
			uploadedBy: user,
			uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
			status: errorCount > 0 && readyCount === 0 ? "FAILED" : "PREVIEW_READY",
			summary,
			records: parsedRecords
		};
		saveImportBatch(batch);
		return batch;
	}
	/**
	* Re-validate & Commit the Batch
	*/
	static async commitBatch(batch, user, onProgress) {
		const adapter = ADAPTER_REGISTRY$1[batch.module];
		if (!adapter) throw new Error(`Module ${batch.module} adapter not found`);
		batch.status = "PROCESSING";
		batch.startedAt = (/* @__PURE__ */ new Date()).toISOString();
		saveImportBatch(batch);
		const validRecords = batch.records.filter((r) => r.status === "READY" || r.status === "WARNING");
		const keysToProcess = validRecords.map((r) => r.recordKey);
		const freshDbMap = await adapter.fetchExistingRecords(keysToProcess);
		let processedCount = 0;
		let successCount = 0;
		let failedCount = 0;
		batch.summary.noChangeRows;
		for (const record of batch.records) {
			if (record.status === "NO_CHANGE") {
				record.processedResult = "Skipped";
				record.processedAt = (/* @__PURE__ */ new Date()).toISOString();
				continue;
			}
			if (record.status === "ERROR" || record.status === "BLOCKED") {
				record.processedResult = "Failed";
				record.processedAt = (/* @__PURE__ */ new Date()).toISOString();
				failedCount++;
				continue;
			}
			if (batch.operation === "UPDATE" && record.originalDbData) {
				const fresh = freshDbMap.get(record.recordKey.toUpperCase());
				const freshVersion = fresh?.updated_at || fresh?.created_at;
				if (record.dbVersion && freshVersion && String(record.dbVersion) !== String(freshVersion)) {
					record.status = "ERROR";
					record.errors.push({
						row: record.excelRowNumber,
						code: "CONC_001",
						message: "Concurrent modification detected. Record was changed in database after preview.",
						severity: "ERROR",
						resolution: "Re-run import to fetch latest record version."
					});
					record.processedResult = "Failed";
					record.processedAt = (/* @__PURE__ */ new Date()).toISOString();
					failedCount++;
					continue;
				}
			}
			try {
				const execRes = await adapter.executeRecord(record, batch.operation, user);
				if (execRes.success) {
					record.status = "SUCCESS";
					record.processedResult = batch.operation === "CREATE" ? "Created" : batch.operation === "UPDATE" ? "Updated" : "Deleted";
					record.processedAt = (/* @__PURE__ */ new Date()).toISOString();
					successCount++;
					recordAuditEvent({
						batchId: batch.id,
						batchIdentifier: batch.batchIdentifier,
						module: batch.module,
						operation: batch.operation,
						recordKey: record.recordKey,
						recordId: execRes.createdId || record.recordId || "",
						actor: user.name,
						timestamp: (/* @__PURE__ */ new Date()).toISOString(),
						changes: record.changes,
						result: "SUCCESS"
					});
				} else {
					record.status = "FAILED";
					record.processedResult = "Failed";
					record.errors.push({
						row: record.excelRowNumber,
						code: "SYS_001",
						message: execRes.error || "Failed to persist record to database",
						severity: "ERROR"
					});
					record.processedAt = (/* @__PURE__ */ new Date()).toISOString();
					failedCount++;
				}
			} catch (err) {
				record.status = "FAILED";
				record.processedResult = "Failed";
				record.errors.push({
					row: record.excelRowNumber,
					code: "SYS_001",
					message: err?.message || "Unexpected processing failure",
					severity: "ERROR"
				});
				record.processedAt = (/* @__PURE__ */ new Date()).toISOString();
				failedCount++;
			}
			processedCount++;
			if (onProgress) onProgress(processedCount, validRecords.length, successCount, failedCount);
		}
		batch.completedAt = (/* @__PURE__ */ new Date()).toISOString();
		batch.summary.successRows = successCount;
		batch.summary.failedRows = failedCount;
		if (successCount === batch.records.length) batch.status = "COMPLETED";
		else if (successCount > 0) batch.status = "PARTIAL_SUCCESS";
		else batch.status = "FAILED";
		saveImportBatch(batch);
		return batch;
	}
};
var adapters = {
	property: propertyAdapter,
	unit: unitAdapter,
	customer: customerAdapter,
	asset: assetAdapter,
	lease: leaseAdapter,
	employee: employeeAdapter
};
async function generateTemplateWorkbook(module, operation) {
	const adapter = adapters[module];
	if (!adapter) throw new Error(`Unknown module: ${module}`);
	const columns = adapter.getTemplateColumns(operation);
	await getMasterOptions();
	const wb = utils.book_new();
	const headerRow = columns.map((c) => c.label + (c.required ? " *" : ""));
	const sampleRow1 = columns.map((c) => {
		if (operation === "DELETE") return c.sampleValue ?? (c.key === adapter.primaryKeyField ? "SAMPLE-001" : "");
		return c.sampleValue ?? "";
	});
	const sampleRow2 = columns.map((c) => {
		if (operation === "DELETE") return "";
		if (operation === "UPDATE" && !c.required && !c.immutable) return "[NULL]";
		if (Array.isArray(c.allowedValues) && c.allowedValues.length > 1) return c.allowedValues[1];
		return "";
	});
	const wsData = [headerRow, sampleRow1];
	if (operation !== "DELETE") wsData.push(sampleRow2);
	const wsMain = utils.aoa_to_sheet(wsData);
	wsMain["!cols"] = columns.map((c) => ({ wch: Math.max(c.label.length + 5, 20) }));
	utils.book_append_sheet(wb, wsMain, `${module.toUpperCase()}_${operation}`);
	const instructionRows = [
		["INSTRUCTIONS & FIELD DEFINITIONS FOR EXCEL IMPORT"],
		["Module:", module.toUpperCase()],
		["Operation:", operation],
		["Generated At:", (/* @__PURE__ */ new Date()).toISOString()],
		[],
		["IMPORTANT GUIDELINES:"],
		["1. Primary Key:", `The column "${adapter.primaryKeyLabel}" is mandatory and uniquely identifies records.`],
		["2. Required Fields:", "Headers marked with asterisk (*) are mandatory."],
		["3. For CREATE:", "Duplicate keys in Excel or existing in the database will be rejected with error."],
		["4. For UPDATE:", "Leave cell BLANK to keep existing DB value. Type [NULL] to explicitly clear/empty a value."],
		["5. For DELETE:", "Only the identification key is required. System will verify dependencies before deleting."],
		["6. Data Integrity:", "Leading zeroes in codes, mobile numbers, and QIDs will be preserved."],
		[],
		["COLUMN SPECIFICATION TABLE:"],
		[
			"Column Name",
			"Field Key",
			"Data Type",
			"Required?",
			"Sample Value",
			"Allowed Values / Description"
		]
	];
	for (const col of columns) {
		let allowedDesc = "";
		if (Array.isArray(col.allowedValues) && col.allowedValues.length > 0) allowedDesc = col.allowedValues.join(", ");
		else if (col.description) allowedDesc = col.description;
		instructionRows.push([
			col.label + (col.required ? " *" : ""),
			col.key,
			col.type.toUpperCase(),
			col.required ? "YES" : "NO",
			col.sampleValue !== void 0 ? String(col.sampleValue) : "",
			allowedDesc
		]);
	}
	const wsInstructions = utils.aoa_to_sheet(instructionRows);
	wsInstructions["!cols"] = [
		{ wch: 30 },
		{ wch: 25 },
		{ wch: 15 },
		{ wch: 12 },
		{ wch: 25 },
		{ wch: 50 }
	];
	utils.book_append_sheet(wb, wsInstructions, "Instructions");
	const masterSheetData = [["Master Category", "Allowed Value"]];
	for (const col of columns) if (Array.isArray(col.allowedValues) && col.allowedValues.length > 0) for (const val of col.allowedValues) masterSheetData.push([col.label, val]);
	if (masterSheetData.length > 1) {
		const wsMasters = utils.aoa_to_sheet(masterSheetData);
		wsMasters["!cols"] = [{ wch: 30 }, { wch: 40 }];
		utils.book_append_sheet(wb, wsMasters, "Master_Values");
	}
	const output = writeSync(wb, {
		type: "array",
		bookType: "xlsx"
	});
	return new Uint8Array(output);
}
function downloadTemplateFile(module, operation, fileData) {
	const fileName = `${module.charAt(0).toUpperCase() + module.slice(1)}_${operation}_Template.xlsx`;
	const blob = new Blob([fileData], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = fileName;
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}
var ResultExcelGenerator = class {
	/**
	* Generates a 6-sheet comprehensive result workbook
	*/
	static generateResultWorkbook(batch) {
		const wb = utils.book_new();
		const durationSeconds = batch.startedAt && batch.completedAt ? ((new Date(batch.completedAt).getTime() - new Date(batch.startedAt).getTime()) / 1e3).toFixed(2) : "N/A";
		const summaryData = [
			["PROPERTY MANAGEMENT SYSTEM - EXCEL IMPORT RESULT REPORT"],
			[],
			["Metric / Property", "Value"],
			["Batch ID", batch.batchIdentifier],
			["Module", batch.module.toUpperCase()],
			["Operation", batch.operation],
			["Original File Name", batch.fileName],
			["Uploaded By", `${batch.uploadedBy.name} (${batch.uploadedBy.email || batch.uploadedBy.id})`],
			["Uploaded At", batch.uploadedAt],
			["Started At", batch.startedAt || "N/A"],
			["Completed At", batch.completedAt || "N/A"],
			["Processing Duration", `${durationSeconds} seconds`],
			["Final Batch Status", batch.status],
			[],
			["RECORD COUNTS BREAKDOWN:"],
			["Total Excel Rows", batch.summary.totalRows],
			["Ready / Valid Rows", batch.summary.validRows],
			["Successful Records", batch.summary.successRows],
			["Failed Records", batch.summary.failedRows],
			["No Change Detected", batch.summary.noChangeRows],
			["Blocked (Dependencies)", batch.summary.blockedRows],
			["Warning Rows", batch.summary.warningRows]
		];
		const wsSummary = utils.aoa_to_sheet(summaryData);
		wsSummary["!cols"] = [{ wch: 30 }, { wch: 45 }];
		utils.book_append_sheet(wb, wsSummary, "Import Summary");
		const allRecordsRows = [[
			"Excel Row",
			"Record ID",
			"Record Key",
			"Record Name",
			"Operation",
			"Validation Status",
			"Processing Result",
			"Processed At",
			"Error / Warning Message"
		]];
		for (const rec of batch.records) {
			const errMsg = rec.errors.map((e) => e.message).join(" | ") || rec.warnings.map((w) => w.message).join(" | ") || "—";
			allRecordsRows.push([
				rec.excelRowNumber,
				rec.recordId || "—",
				rec.recordKey,
				rec.recordName || "—",
				batch.operation,
				rec.status,
				rec.processedResult || rec.status,
				rec.processedAt || "—",
				errMsg
			]);
		}
		const wsAll = utils.aoa_to_sheet(allRecordsRows);
		wsAll["!cols"] = [
			{ wch: 10 },
			{ wch: 25 },
			{ wch: 22 },
			{ wch: 30 },
			{ wch: 12 },
			{ wch: 18 },
			{ wch: 18 },
			{ wch: 22 },
			{ wch: 45 }
		];
		utils.book_append_sheet(wb, wsAll, "All Records");
		const successRows = [[
			"Excel Row",
			"Record ID",
			"Record Key",
			"Operation",
			"Result",
			"Processed At"
		]];
		for (const rec of batch.records) if (rec.status === "SUCCESS" || rec.processedResult === "Created" || rec.processedResult === "Updated" || rec.processedResult === "Deleted") successRows.push([
			rec.excelRowNumber,
			rec.recordId || "—",
			rec.recordKey,
			batch.operation,
			rec.processedResult || "Success",
			rec.processedAt || "—"
		]);
		const wsSuccess = utils.aoa_to_sheet(successRows);
		wsSuccess["!cols"] = [
			{ wch: 10 },
			{ wch: 25 },
			{ wch: 22 },
			{ wch: 14 },
			{ wch: 18 },
			{ wch: 22 }
		];
		utils.book_append_sheet(wb, wsSuccess, "Successful Records");
		const failedRows = [[
			"Excel Row",
			"Record Key",
			"Error Code",
			"Severity",
			"Error Message",
			"Suggested Resolution",
			"Original Data Snapshot"
		]];
		for (const rec of batch.records) if (rec.status === "ERROR" || rec.status === "BLOCKED" || rec.status === "FAILED" || rec.errors.length > 0) {
			for (const err of rec.errors) failedRows.push([
				rec.excelRowNumber,
				rec.recordKey,
				err.code,
				err.severity,
				err.message,
				err.resolution || "Inspect row and correct according to template rules.",
				JSON.stringify(rec.rawRowData)
			]);
			if (rec.errors.length === 0 && rec.status === "BLOCKED") failedRows.push([
				rec.excelRowNumber,
				rec.recordKey,
				"DEL_003",
				"ERROR",
				"Deletion blocked due to active dependencies.",
				"Clear active leases/transactions before deleting.",
				JSON.stringify(rec.rawRowData)
			]);
		}
		const wsFailed = utils.aoa_to_sheet(failedRows);
		wsFailed["!cols"] = [
			{ wch: 10 },
			{ wch: 22 },
			{ wch: 14 },
			{ wch: 12 },
			{ wch: 45 },
			{ wch: 45 },
			{ wch: 40 }
		];
		utils.book_append_sheet(wb, wsFailed, "Failed Records");
		const diffRows = [[
			"Excel Row",
			"Record ID",
			"Record Key",
			"Field Key",
			"Field Label",
			"Existing Value (DB)",
			"Proposed Value (Excel)",
			"Change Type"
		]];
		for (const rec of batch.records) if (rec.changes && rec.changes.length > 0) for (const ch of rec.changes) diffRows.push([
			rec.excelRowNumber,
			rec.recordId || "—",
			rec.recordKey,
			ch.field,
			ch.label,
			ch.oldValue !== null && ch.oldValue !== void 0 ? String(ch.oldValue) : "—",
			ch.newValue !== null && ch.newValue !== void 0 ? String(ch.newValue) : "—",
			ch.status
		]);
		const wsDiff = utils.aoa_to_sheet(diffRows);
		wsDiff["!cols"] = [
			{ wch: 10 },
			{ wch: 25 },
			{ wch: 22 },
			{ wch: 22 },
			{ wch: 25 },
			{ wch: 25 },
			{ wch: 25 },
			{ wch: 15 }
		];
		utils.book_append_sheet(wb, wsDiff, "Comparison");
		const auditRows = [[
			"Timestamp",
			"Batch ID",
			"Module",
			"Operation",
			"Record Key",
			"Actor",
			"Changed Fields Summary",
			"Status"
		]];
		for (const rec of batch.records) if (rec.processedResult && rec.processedResult !== "Skipped") {
			const changesSummary = rec.changes.map((c) => `${c.label}: "${c.oldValue}" -> "${c.newValue}"`).join("; ");
			auditRows.push([
				rec.processedAt || batch.completedAt || "—",
				batch.batchIdentifier,
				batch.module.toUpperCase(),
				batch.operation,
				rec.recordKey,
				batch.uploadedBy.name,
				changesSummary || "N/A",
				rec.processedResult
			]);
		}
		const wsAudit = utils.aoa_to_sheet(auditRows);
		wsAudit["!cols"] = [
			{ wch: 22 },
			{ wch: 24 },
			{ wch: 12 },
			{ wch: 12 },
			{ wch: 20 },
			{ wch: 20 },
			{ wch: 45 },
			{ wch: 14 }
		];
		utils.book_append_sheet(wb, wsAudit, "Audit Log");
		const output = writeSync(wb, {
			type: "array",
			bookType: "xlsx"
		});
		return new Uint8Array(output);
	}
	/**
	* Generates a focused Failed Records workbook for fast re-upload
	*/
	static generateFailedRecordsWorkbook(batch) {
		const wb = utils.book_new();
		const adapter = ADAPTER_REGISTRY[batch.module];
		const columns = adapter ? adapter.getTemplateColumns(batch.operation) : [];
		const headers = columns.map((c) => c.label + (c.required ? " *" : ""));
		headers.push("Failure Reason", "Suggested Resolution");
		const rows = [headers];
		for (const rec of batch.records) if (rec.status === "ERROR" || rec.status === "BLOCKED" || rec.status === "FAILED") {
			const rowVals = columns.map((c) => rec.rawRowData[c.label] ?? rec.rawRowData[c.label + " *"] ?? rec.rawRowData[c.key] ?? "");
			const errDesc = rec.errors.map((e) => e.message).join("; ") || "Dependency blocked";
			const resolution = rec.errors.map((e) => e.resolution).filter(Boolean).join("; ") || "Fix data according to instructions.";
			rowVals.push(errDesc, resolution);
			rows.push(rowVals);
		}
		const ws = utils.aoa_to_sheet(rows);
		utils.book_append_sheet(wb, ws, "Failed_Records");
		const output = writeSync(wb, {
			type: "array",
			bookType: "xlsx"
		});
		return new Uint8Array(output);
	}
	/**
	* Helper to trigger direct browser download
	*/
	static triggerDownload(data, fileName) {
		const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
};
async function getCurrentProfile() {
	if (typeof window === "undefined") return null;
	const imp = getImpersonationSession();
	if (imp && imp.isImpersonating) return {
		id: "impersonated-admin-session",
		role: "PROP_MGR",
		full_name: `${imp.adminName} (Impersonated by Super Admin)`,
		tenant_id: imp.tenantId,
		tenant_key: imp.tenantKey,
		tenantContextId: imp.tenantId
	};
	const demoSession = getDemoSession();
	if (demoSession) return {
		...demoSession,
		full_name: demoSession.full_name,
		tenantContextId: demoSession.tenant_id ?? demoSession.tenant_key ?? null
	};
	try {
		const { data: authData } = await supabase.auth.getSession();
		const session = authData?.session;
		if (session?.user) {
			const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
			if (profile?.role) {
				const currentProfile = profile;
				currentProfile.tenantContextId = resolveTenantContextId(currentProfile, session.user);
				return currentProfile;
			}
			const userMeta = session.user.user_metadata || {};
			const userRole = userMeta.role || "GUEST";
			return {
				id: session.user.id,
				role: userRole,
				full_name: userMeta.full_name || session.user.email?.split("@")[0] || "User",
				tenantContextId: userMeta.tenant_id || null
			};
		}
	} catch (err) {
		if (err && (err instanceof Response || err.isRedirect || err.to || err.statusCode)) throw err;
	}
	throw redirect({ to: "/auth" });
}
/** Checks role access with static fast-path to prevent UI lag */
async function checkAccessWithTimeout(consoleKey, role, tenantId, timeoutMs = 800) {
	const ownLanding = String(getLandingRouteForRole(role));
	const consolePrefix = `/${consoleKey}`;
	if (ownLanding === consolePrefix || ownLanding.startsWith(`${consolePrefix}/`) || ownLanding.startsWith(consolePrefix)) return true;
	return new Promise((resolve) => {
		const timer = setTimeout(() => resolve(true), timeoutMs);
		canAccessConsole(consoleKey, role, tenantId).then((result) => {
			clearTimeout(timer);
			resolve(result);
		}).catch(() => {
			clearTimeout(timer);
			resolve(true);
		});
	});
}
async function requireConsoleAccess(consoleKey) {
	if (typeof window === "undefined") return null;
	const profile = await getCurrentProfile();
	if (!profile) throw redirect({ to: "/auth" });
	const tenantId = profile.tenantContextId ?? null;
	if (!await checkAccessWithTimeout(consoleKey, profile.role, tenantId)) throw redirect({ to: getLandingRouteForRole(profile.role) });
	return profile;
}
//#endregion
export { generateTemplateWorkbook as a, requireConsoleAccess as c, downloadTemplateFile as i, ExcelImportEngine as n, getCurrentProfile as o, ResultExcelGenerator as r, getImportBatchHistory as s, Checkbox as t };
