import { n as __exportAll } from "../_runtime.mjs";
import { t as __exportAll$1 } from "./rolldown-runtime-D7D4PA-g.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/supabase-DqnF3U5S.js
var supabase_DqnF3U5S_exports = /* @__PURE__ */ __exportAll({
	A: () => fetchProperties,
	B: () => fetchViewTypes,
	C: () => fetchLeaseStatuses,
	D: () => fetchMaterialUsage,
	E: () => fetchMaintenanceTickets,
	F: () => fetchPropertyTypes,
	G: () => updateAsset,
	H: () => processApproval,
	I: () => fetchRentFrequencies,
	J: () => updatePropertyImages,
	K: () => updateMaintenanceTicket,
	L: () => fetchSecurityDepositTypes,
	M: () => fetchPropertyCategories,
	N: () => fetchPropertyCoaMappings,
	O: () => fetchOwnershipTypes,
	P: () => fetchPropertyManagerEmployees,
	R: () => fetchUnitCOAs,
	S: () => fetchJournalEntries,
	T: () => fetchMaintenanceResponsibilities,
	U: () => supabase,
	V: () => logMaterialUsage,
	W: () => supabase_exports,
	Y: () => updateUnit,
	_: () => fetchERPChartOfAccounts,
	a: () => createProfile,
	b: () => fetchHostBookings,
	c: () => createUnitRooms,
	d: () => fetchAllProperties,
	f: () => fetchApprovalRequests,
	g: () => fetchCostCenters,
	h: () => fetchCoaSLByGL,
	i: () => createInventoryPart,
	j: () => fetchPropertyById,
	k: () => fetchProfiles,
	l: () => deleteAsset,
	m: () => fetchCoaHierarchyTree,
	n: () => createAsset,
	o: () => createProperty,
	p: () => fetchAssets,
	q: () => updateProperty,
	r: () => createGLAccount,
	s: () => createUnit,
	t: () => createApprovalRequest,
	u: () => fetchARLedgers,
	v: () => fetchFurnishingTypes,
	w: () => fetchLeases,
	x: () => fetchInventoryParts,
	y: () => fetchGuestBookings,
	z: () => fetchUnits
});
var supabase_exports = /* @__PURE__ */ __exportAll$1({
	createApprovalRequest: () => createApprovalRequest,
	createAsset: () => createAsset,
	createGLAccount: () => createGLAccount,
	createInventoryPart: () => createInventoryPart,
	createProfile: () => createProfile,
	createProperty: () => createProperty,
	createUnit: () => createUnit,
	createUnitRooms: () => createUnitRooms,
	deleteAsset: () => deleteAsset,
	fetchARLedgers: () => fetchARLedgers,
	fetchAllProperties: () => fetchAllProperties,
	fetchApprovalRequests: () => fetchApprovalRequests,
	fetchAssets: () => fetchAssets,
	fetchCoaHierarchyTree: () => fetchCoaHierarchyTree,
	fetchCoaSLByGL: () => fetchCoaSLByGL,
	fetchCostCenters: () => fetchCostCenters,
	fetchERPChartOfAccounts: () => fetchERPChartOfAccounts,
	fetchFurnishingTypes: () => fetchFurnishingTypes,
	fetchGuestBookings: () => fetchGuestBookings,
	fetchHostBookings: () => fetchHostBookings,
	fetchInventoryParts: () => fetchInventoryParts,
	fetchJournalEntries: () => fetchJournalEntries,
	fetchLeaseStatuses: () => fetchLeaseStatuses,
	fetchLeases: () => fetchLeases,
	fetchMaintenanceResponsibilities: () => fetchMaintenanceResponsibilities,
	fetchMaintenanceTickets: () => fetchMaintenanceTickets,
	fetchMaterialUsage: () => fetchMaterialUsage,
	fetchOwnershipTypes: () => fetchOwnershipTypes,
	fetchProfiles: () => fetchProfiles,
	fetchProperties: () => fetchProperties,
	fetchPropertyById: () => fetchPropertyById,
	fetchPropertyCategories: () => fetchPropertyCategories,
	fetchPropertyCoaMappings: () => fetchPropertyCoaMappings,
	fetchPropertyManagerEmployees: () => fetchPropertyManagerEmployees,
	fetchPropertyTypes: () => fetchPropertyTypes,
	fetchRentFrequencies: () => fetchRentFrequencies,
	fetchSecurityDepositTypes: () => fetchSecurityDepositTypes,
	fetchUnitCOAs: () => fetchUnitCOAs,
	fetchUnits: () => fetchUnits,
	fetchViewTypes: () => fetchViewTypes,
	logMaterialUsage: () => logMaterialUsage,
	processApproval: () => processApproval,
	sanitizeUnitWritePayload: () => sanitizeUnitWritePayload,
	supabase: () => supabase,
	updateAsset: () => updateAsset,
	updateMaintenanceTicket: () => updateMaintenanceTicket,
	updateProperty: () => updateProperty,
	updatePropertyImages: () => updatePropertyImages,
	updateUnit: () => updateUnit
});
var supabase = createClient("https://rnebpqnzignwjeukgztz.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg");
/** Fetch all active properties (for landing page / search) */
async function fetchProperties(options) {
	let query = supabase.from("properties").select("*, property_images(image_url, is_primary)").eq("is_active", true).order("created_at", { ascending: false });
	if (options?.city) query = query.ilike("city", `%${options.city}%`);
	const { data, error } = await query;
	if (error) throw error;
	return data;
}
/** Fetch a single property by ID */
async function fetchPropertyById(id) {
	const { data, error } = await supabase.from("properties").select("*, property_images(image_url, is_primary)").eq("id", id).single();
	if (error) throw error;
	return data;
}
/** Fetch all properties (Admin View) */
async function fetchAllProperties() {
	const { data, error } = await supabase.from("properties").select("*, property_images(image_url, is_primary)").order("created_at", { ascending: false });
	if (error) throw error;
	return data;
}
/** Columns present on public.properties (PostgREST schema). */
var PROPERTIES_WRITE_KEYS = new Set([
	"host_id",
	"title",
	"description",
	"property_type",
	"address",
	"city",
	"country",
	"location",
	"max_guests",
	"bedrooms",
	"beds",
	"bathrooms",
	"base_price_per_night",
	"cleaning_fee",
	"is_active",
	"property_code",
	"cost_center_code",
	"cost_center_name",
	"property_category",
	"ownership_type",
	"area_zone",
	"street_building_name",
	"plot_building_no",
	"title_deed_no",
	"municipality_ref_no",
	"property_manager",
	"no_of_floors",
	"no_of_units",
	"total_built_up_area_sqm",
	"common_area_sqm",
	"parking_count",
	"no_of_elevators",
	"completion_date",
	"handover_date",
	"documents_received",
	"remarks",
	"year_built",
	"total_floors",
	"total_units",
	"property_status",
	"contact_person",
	"mobile_number",
	"email",
	"alternate_contact",
	"postal_code",
	"landmark"
]);
function sanitizePropertyWritePayload(payload) {
	const sanitized = {};
	for (const [key, value] of Object.entries(payload)) {
		if (value === void 0) continue;
		if (key === "zip_code") {
			sanitized.postal_code = value;
			continue;
		}
		if (key === "amenities" || key === "room_details" || key === "municipality_details" || key === "kahramaa_number" || key === "state") continue;
		if (PROPERTIES_WRITE_KEYS.has(key)) sanitized[key] = value;
	}
	return sanitized;
}
/** Create a new property listing */
async function createProperty(payload) {
	const { data, error } = await supabase.from("properties").insert(sanitizePropertyWritePayload(payload)).select().single();
	if (error) throw error;
	return data;
}
/** Update an existing property */
async function updateProperty(id, payload) {
	const { data, error } = await supabase.from("properties").update({
		...sanitizePropertyWritePayload(payload),
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", id).select().single();
	if (error) throw error;
	return data;
}
/** Update property images */
async function updatePropertyImages(propertyId, images) {
	const { error: deleteError } = await supabase.from("property_images").delete().eq("property_id", propertyId);
	if (deleteError) throw deleteError;
	if (images.length > 0) {
		const payload = images.map((img) => ({
			...img,
			property_id: propertyId
		}));
		const { error: insertError } = await supabase.from("property_images").insert(payload);
		if (insertError) throw insertError;
	}
}
/** Fetch bookings for a guest */
async function fetchGuestBookings(guestId) {
	const { data, error } = await supabase.from("bookings").select("*, properties(title, city, country, property_images(image_url))").eq("guest_id", guestId).order("check_in", { ascending: false });
	if (error) throw error;
	return data;
}
/** Fetch bookings for all host's properties */
async function fetchHostBookings(hostId) {
	const { data, error } = await supabase.from("bookings").select("*, properties!inner(title, city, host_id)").eq("properties.host_id", hostId).order("check_in", { ascending: true });
	if (error) throw error;
	return data;
}
async function fetchJournalEntries() {
	const { data, error } = await supabase.from("journal_entries").select("*, journal_lines(*, gl_accounts(code, name_en, type))").order("posting_date", { ascending: false });
	if (error) throw error;
	return data;
}
async function fetchMaintenanceTickets(filters) {
	let query = supabase.from("maintenance_tickets").select("*").order("created_at", { ascending: false });
	if (filters?.property_id) query = query.eq("property_id", filters.property_id);
	if (filters?.host_id) query = query.eq("host_id", filters.host_id);
	const { data, error } = await query;
	if (error) throw error;
	return data;
}
async function updateMaintenanceTicket(id, payload) {
	const { data, error } = await supabase.from("maintenance_tickets").update({
		...payload,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", id).select().single();
	if (error) throw error;
	return data;
}
async function fetchAssets(filters) {
	let query = supabase.from("assets").select("*, departments(name), employees(first_name, last_name), properties(title, property_code), units(unit_code)").order("created_at", { ascending: false });
	if (filters?.property_id) query = query.eq("assigned_property_id", filters.property_id);
	if (filters?.employee_id) query = query.eq("assigned_employee_id", filters.employee_id);
	const { data, error } = await query;
	if (error) throw error;
	return data;
}
async function createAsset(payload) {
	const { data, error } = await supabase.from("assets").insert(payload).select().single();
	if (error) throw error;
	return data;
}
async function updateAsset(id, payload) {
	const { data, error } = await supabase.from("assets").update({
		...payload,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", id).select().single();
	if (error) throw error;
	return data;
}
async function deleteAsset(id) {
	const { error } = await supabase.from("assets").delete().eq("id", id);
	if (error) throw error;
	return true;
}
async function fetchLeases(filters) {
	let query = supabase.from("leases").select("*").order("created_at", { ascending: false });
	if (filters?.host_id) query = query.eq("host_id", filters.host_id);
	if (filters?.property_id) query = query.eq("property_id", filters.property_id);
	const { data, error } = await query;
	if (error) throw error;
	return data;
}
async function fetchARLedgers(filters) {
	let query = supabase.from("ar_ledgers").select("*").order("date", { ascending: false });
	if (filters?.lease_id) query = query.eq("lease_id", filters.lease_id);
	if (filters?.status) query = query.eq("status", filters.status);
	const { data, error } = await query;
	if (error) throw error;
	return data;
}
async function fetchApprovalRequests(status) {
	let query = supabase.from("approval_requests").select("*").order("created_at", { ascending: false });
	if (status) query = query.eq("status", status);
	const { data, error } = await query;
	if (error) throw error;
	return data;
}
async function createApprovalRequest(payload) {
	const { data, error } = await supabase.from("approval_requests").insert(payload).select().single();
	if (error) throw error;
	return data;
}
async function processApproval(id, decision, notes) {
	const { data, error } = await supabase.from("approval_requests").update({
		status: decision,
		notes,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", id).select().single();
	if (error) throw error;
	return data;
}
async function fetchMaterialUsage(ticketId) {
	const { data, error } = await supabase.from("material_usage").select("*, inventory_parts(name, sku)").eq("ticket_id", ticketId);
	if (error) throw error;
	return data;
}
async function logMaterialUsage(payload) {
	const { data, error } = await supabase.rpc("issue_maintenance_material", {
		p_ticket_id: payload.ticket_id,
		p_part_id: payload.part_id,
		p_quantity: payload.quantity
	});
	if (error) throw error;
	return data;
}
async function fetchInventoryParts() {
	const { data, error } = await supabase.from("inventory_parts").select("*").not("procurement_item_id", "is", null).order("name");
	if (error) throw error;
	return data;
}
async function fetchUnits(filters) {
	let q = supabase.from("units").select("*").order("created_at", { ascending: false });
	if (filters?.property_id) q = q.eq("property_id", filters.property_id);
	const { data, error } = await q;
	if (error) throw error;
	return data;
}
/** Columns present on public.units (PostgREST schema). */
var UNITS_WRITE_KEYS = new Set([
	"property_id",
	"unit_ref",
	"room_type",
	"bedrooms",
	"bathrooms",
	"area",
	"price",
	"status",
	"unit_code",
	"unit_cost_center_code",
	"unit_name",
	"parent_cost_center_code",
	"unit_usage",
	"block_tower",
	"floor",
	"balcony_sqm",
	"total_area_sqm",
	"view_type",
	"furnishing",
	"parking_slot_no",
	"electricity_meter_no",
	"water_meter_no",
	"cooling_meter_no",
	"lease_status",
	"rent_frequency",
	"current_tenant",
	"contract_no",
	"contract_start_date",
	"contract_end_date",
	"current_rent",
	"security_deposit_type",
	"security_deposit_amount",
	"service_charge",
	"maintenance_responsibility",
	"handover_date",
	"documents_received",
	"remarks",
	"max_adults",
	"max_children",
	"total_occupancy",
	"weekend_price",
	"holiday_price",
	"cleaning_fee"
]);
function sanitizeUnitWritePayload(payload) {
	const sanitized = {};
	for (const [key, value] of Object.entries(payload)) {
		if (value === void 0) continue;
		if (key === "host_id" || key === "id" || key === "created_at" || key === "updated_at") continue;
		if (UNITS_WRITE_KEYS.has(key)) sanitized[key] = value;
	}
	return sanitized;
}
async function createUnit(payload) {
	const sanitized = sanitizeUnitWritePayload(payload);
	const { data, error } = await supabase.from("units").insert(sanitized).select().single();
	if (error) throw error;
	return data;
}
async function updateUnit(id, payload) {
	const sanitized = sanitizeUnitWritePayload(payload);
	const { data, error } = await supabase.from("units").update({
		...sanitized,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", id).select().single();
	if (error) throw error;
	return data;
}
async function fetchProfiles() {
	const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
	if (error) throw error;
	return data;
}
async function createProfile(payload) {
	const { data, error } = await supabase.from("profiles").insert(payload).select().single();
	if (error) throw error;
	return data;
}
async function createGLAccount(payload) {
	const { data, error } = await supabase.from("gl_accounts").insert(payload).select().single();
	if (error) throw error;
	return data;
}
async function fetchMaster(table) {
	const { data, error } = await supabase.from(table).select("id, label").order("label");
	if (error) return [];
	return data;
}
var fetchPropertyTypes = () => fetchMaster("mst_property_types");
var fetchPropertyCategories = () => fetchMaster("mst_property_categories");
var fetchOwnershipTypes = () => fetchMaster("mst_ownership_types");
var fetchViewTypes = () => fetchMaster("mst_view_types");
var fetchFurnishingTypes = () => fetchMaster("mst_furnishing");
var fetchLeaseStatuses = () => fetchMaster("mst_lease_statuses");
var fetchRentFrequencies = () => fetchMaster("mst_rent_frequencies");
var fetchMaintenanceResponsibilities = () => fetchMaster("mst_maintenance_responsibilities");
var fetchSecurityDepositTypes = () => fetchMaster("mst_security_deposit_types");
async function fetchERPChartOfAccounts() {
	const PAGE_SIZE = 1e3;
	let allData = [];
	let from = 0;
	while (true) {
		const { data, error } = await supabase.from("erp_chart_of_accounts").select("*").order("code").range(from, from + PAGE_SIZE - 1);
		if (error) throw error;
		if (!data || data.length === 0) break;
		allData = [...allData, ...data];
		if (data.length < PAGE_SIZE) break;
		from += PAGE_SIZE;
	}
	return allData;
}
async function fetchCoaHierarchyTree() {
	const [typesRes, groupsRes, classesRes, glsRes] = await Promise.all([
		supabase.from("coa_types").select("*").order("code"),
		supabase.from("coa_groups").select("*").order("code"),
		supabase.from("coa_classes").select("*").order("code"),
		supabase.from("coa_gl").select("*").order("code")
	]);
	if (typesRes.error) throw typesRes.error;
	if (groupsRes.error) throw groupsRes.error;
	if (classesRes.error) throw classesRes.error;
	if (glsRes.error) throw glsRes.error;
	return {
		types: typesRes.data || [],
		groups: groupsRes.data || [],
		classes: classesRes.data || [],
		gls: glsRes.data || []
	};
}
async function fetchUnitCOAs() {
	const { data, error } = await supabase.from("unit_coas").select("*").order("unit_code");
	if (error) throw error;
	return data;
}
async function fetchPropertyCoaMappings() {
	const { data, error } = await supabase.from("property_coa_mapping").select("*").order("property_name");
	if (error) throw error;
	return data;
}
async function fetchCoaSLByGL(glIdOrCode) {
	const query = supabase.from("coa_sl").select("*");
	if (glIdOrCode.length === 36 && glIdOrCode.includes("-")) query.eq("gl_id", glIdOrCode);
	else query.eq("gl_code", glIdOrCode);
	const { data, error } = await query.order("code");
	if (error) throw error;
	return data;
}
async function createInventoryPart(payload) {
	const { data, error } = await supabase.from("inventory_parts").insert([payload]).select().single();
	if (error) throw error;
	return data;
}
async function fetchCostCenters() {
	const { data, error } = await supabase.from("fin_cost_centers").select("id, code, name").order("name", { ascending: true });
	if (error) return [];
	return data ?? [];
}
async function createUnitRooms(rooms) {
	if (!rooms || rooms.length === 0) return [];
	const { data, error } = await supabase.from("unit_rooms").insert(rooms).select();
	if (error) throw error;
	return data ?? [];
}
async function fetchPropertyManagerEmployees() {
	try {
		const results = [];
		const seenNames = /* @__PURE__ */ new Set();
		try {
			const { data: profiles, error: profileErr } = await supabase.from("profiles").select("id, full_name, email, role").eq("role", "PROP_MGR");
			if (!profileErr && profiles && profiles.length > 0) profiles.forEach((p) => {
				const name = (p.full_name || p.email || "").trim();
				if (name && !seenNames.has(name.toLowerCase())) {
					seenNames.add(name.toLowerCase());
					results.push({
						id: p.id,
						name,
						email: p.email,
						designation: "Property Manager"
					});
				}
			});
		} catch {}
		try {
			const { data: empData, error: empError } = await supabase.from("employees").select("id, first_name, last_name, email, employee_status, designations(title)").order("first_name");
			if (!empError && empData && empData.length > 0) empData.filter((e) => {
				if (e.employee_status && e.employee_status.toLowerCase() === "terminated") return false;
				const desig = (e.designations?.title || "").toLowerCase().trim();
				return desig.includes("property manager") || desig.includes("prop mgr") || desig.includes("estate manager") || desig.includes("facility manager");
			}).forEach((e) => {
				const name = `${e.first_name || ""} ${e.last_name || ""}`.trim();
				if (name && !seenNames.has(name.toLowerCase())) {
					seenNames.add(name.toLowerCase());
					results.push({
						id: e.id,
						name,
						email: e.email,
						designation: e.designations?.title || "Property Manager"
					});
				}
			});
		} catch {}
		if (results.length === 0) results.push({
			id: "default-pm-1",
			name: "Jithin Abdul Latheef",
			designation: "Property Manager"
		}, {
			id: "default-pm-2",
			name: "Shajid Varikkodath",
			designation: "Property Manager"
		}, {
			id: "default-pm-3",
			name: "Mohamed Farhan Abdul Salam",
			designation: "Property Manager"
		}, {
			id: "default-pm-4",
			name: "Mohamed Shafraz Hussain",
			designation: "Property Manager"
		});
		return results;
	} catch (err) {
		console.error("Error fetching property managers:", err);
		return [
			{
				id: "default-pm-1",
				name: "Jithin Abdul Latheef",
				designation: "Property Manager"
			},
			{
				id: "default-pm-2",
				name: "Shajid Varikkodath",
				designation: "Property Manager"
			},
			{
				id: "default-pm-3",
				name: "Mohamed Farhan Abdul Salam",
				designation: "Property Manager"
			},
			{
				id: "default-pm-4",
				name: "Mohamed Shafraz Hussain",
				designation: "Property Manager"
			}
		];
	}
}
//#endregion
export { fetchProperties as A, fetchViewTypes as B, fetchLeaseStatuses as C, fetchMaterialUsage as D, fetchMaintenanceTickets as E, fetchPropertyTypes as F, updateAsset as G, processApproval as H, fetchRentFrequencies as I, updatePropertyImages as J, updateMaintenanceTicket as K, fetchSecurityDepositTypes as L, fetchPropertyCategories as M, fetchPropertyCoaMappings as N, fetchOwnershipTypes as O, fetchPropertyManagerEmployees as P, fetchUnitCOAs as R, fetchJournalEntries as S, fetchMaintenanceResponsibilities as T, supabase as U, logMaterialUsage as V, supabase_DqnF3U5S_exports as W, updateUnit as Y, fetchERPChartOfAccounts as _, createProfile as a, fetchHostBookings as b, createUnitRooms as c, fetchAllProperties as d, fetchApprovalRequests as f, fetchCostCenters as g, fetchCoaSLByGL as h, createInventoryPart as i, fetchPropertyById as j, fetchProfiles as k, deleteAsset as l, fetchCoaHierarchyTree as m, createAsset as n, createProperty as o, fetchAssets as p, updateProperty as q, createGLAccount as r, createUnit as s, createApprovalRequest as t, fetchARLedgers as u, fetchFurnishingTypes as v, fetchLeases as w, fetchInventoryParts as x, fetchGuestBookings as y, fetchUnits as z };
