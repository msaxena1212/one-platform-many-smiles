import { B as supabase } from "./supabase-DXZNSXc4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/supabase-masters-ssPWjMMY.js
async function fetchTicketCategories() {
	const { data, error } = await supabase.from("mst_ticket_categories").select("*").order("name");
	if (error) throw error;
	return data || [];
}
async function createTicketCategory(cat) {
	const { data, error } = await supabase.from("mst_ticket_categories").insert(cat).select().single();
	if (error) throw error;
	return data;
}
async function updateTicketCategory(id, cat) {
	const { error } = await supabase.from("mst_ticket_categories").update(cat).eq("id", id);
	if (error) throw error;
}
async function deleteTicketCategory(id) {
	const { error } = await supabase.from("mst_ticket_categories").delete().eq("id", id);
	if (error) throw error;
}
async function fetchFacilityMasters() {
	const { data, error } = await supabase.from("mst_facilities").select("*").order("name");
	if (error) throw error;
	return data || [];
}
async function createFacilityMaster(fac) {
	const { data, error } = await supabase.from("mst_facilities").insert(fac).select().single();
	if (error) throw error;
	return data;
}
async function updateFacilityMaster(id, fac) {
	const { error } = await supabase.from("mst_facilities").update(fac).eq("id", id);
	if (error) throw error;
}
async function deleteFacilityMaster(id) {
	const { error } = await supabase.from("mst_facilities").delete().eq("id", id);
	if (error) throw error;
}
async function fetchPaymentModes() {
	const { data, error } = await supabase.from("mst_payment_modes").select("*").order("name");
	if (error) throw error;
	return data || [];
}
async function createPaymentMode(mode) {
	const { data, error } = await supabase.from("mst_payment_modes").insert(mode).select().single();
	if (error) throw error;
	return data;
}
async function updatePaymentMode(id, mode) {
	const { error } = await supabase.from("mst_payment_modes").update(mode).eq("id", id);
	if (error) throw error;
}
async function deletePaymentMode(id) {
	const { error } = await supabase.from("mst_payment_modes").delete().eq("id", id);
	if (error) throw error;
}
async function fetchSimple(table) {
	const { data, error } = await supabase.from(table).select("*").order("name");
	if (error) throw error;
	return data || [];
}
async function createSimple(table, name) {
	const { data, error } = await supabase.from(table).insert({ name }).select().single();
	if (error) throw error;
	return data;
}
async function updateSimple(table, id, name) {
	const { error } = await supabase.from(table).update({ name }).eq("id", id);
	if (error) throw error;
}
async function deleteSimple(table, id) {
	const { error } = await supabase.from(table).delete().eq("id", id);
	if (error) throw error;
}
var fetchGenders = () => fetchSimple("mst_genders");
var createGender = (name) => createSimple("mst_genders", name);
var updateGender = (id, name) => updateSimple("mst_genders", id, name);
var deleteGender = (id) => deleteSimple("mst_genders", id);
var fetchDepartments = () => fetchSimple("mst_departments");
var createDepartment = (name) => createSimple("mst_departments", name);
var updateDepartment = (id, name) => updateSimple("mst_departments", id, name);
var deleteDepartment = (id) => deleteSimple("mst_departments", id);
var fetchDesignations = () => fetchSimple("mst_designations");
var createDesignation = (name) => createSimple("mst_designations", name);
var updateDesignation = (id, name) => updateSimple("mst_designations", id, name);
var deleteDesignation = (id) => deleteSimple("mst_designations", id);
var fetchEmploymentTypes = () => fetchSimple("mst_employment_types");
var createEmploymentType = (name) => createSimple("mst_employment_types", name);
var updateEmploymentType = (id, name) => updateSimple("mst_employment_types", id, name);
var deleteEmploymentType = (id) => deleteSimple("mst_employment_types", id);
var fetchWorkLocations = () => fetchSimple("mst_work_locations");
var createWorkLocation = (name) => createSimple("mst_work_locations", name);
var updateWorkLocation = (id, name) => updateSimple("mst_work_locations", id, name);
var deleteWorkLocation = (id) => deleteSimple("mst_work_locations", id);
var fetchEmployeeStatuses = () => fetchSimple("mst_employee_statuses");
var createEmployeeStatus = (name) => createSimple("mst_employee_statuses", name);
var updateEmployeeStatus = (id, name) => updateSimple("mst_employee_statuses", id, name);
var deleteEmployeeStatus = (id) => deleteSimple("mst_employee_statuses", id);
var fetchAssetCategories = () => fetchSimple("mst_asset_categories");
var createAssetCategory = (name) => createSimple("mst_asset_categories", name);
var updateAssetCategory = (id, name) => updateSimple("mst_asset_categories", id, name);
var deleteAssetCategory = (id) => deleteSimple("mst_asset_categories", id);
async function fetchAssetSubcategories(categoryId) {
	let q = supabase.from("mst_asset_subcategories").select("*").order("name");
	if (categoryId) q = q.eq("category_id", categoryId);
	const { data, error } = await q;
	if (error) throw error;
	return data || [];
}
async function createAssetSubcategory(name, categoryId) {
	const { data, error } = await supabase.from("mst_asset_subcategories").insert({
		name,
		category_id: categoryId
	}).select().single();
	if (error) throw error;
	return data;
}
async function updateAssetSubcategory(id, name, categoryId) {
	const { error } = await supabase.from("mst_asset_subcategories").update({
		name,
		category_id: categoryId
	}).eq("id", id);
	if (error) throw error;
}
var deleteAssetSubcategory = (id) => deleteSimple("mst_asset_subcategories", id);
var fetchAssetOwnershipTypes = () => fetchSimple("mst_asset_ownership_types");
var createAssetOwnershipType = (name) => createSimple("mst_asset_ownership_types", name);
var updateAssetOwnershipType = (id, name) => updateSimple("mst_asset_ownership_types", id, name);
var deleteAssetOwnershipType = (id) => deleteSimple("mst_asset_ownership_types", id);
var fetchAssetConditions = () => fetchSimple("mst_asset_conditions");
var createAssetCondition = (name) => createSimple("mst_asset_conditions", name);
var updateAssetCondition = (id, name) => updateSimple("mst_asset_conditions", id, name);
var deleteAssetCondition = (id) => deleteSimple("mst_asset_conditions", id);
var fetchAssetStatuses = () => fetchSimple("mst_asset_statuses");
var createAssetStatus = (name) => createSimple("mst_asset_statuses", name);
var updateAssetStatus = (id, name) => updateSimple("mst_asset_statuses", id, name);
var deleteAssetStatus = (id) => deleteSimple("mst_asset_statuses", id);
//#endregion
export { updateGender as $, fetchAssetConditions as A, fetchPaymentModes as B, deleteEmploymentType as C, deleteTicketCategory as D, deletePaymentMode as E, fetchDesignations as F, updateAssetOwnershipType as G, fetchWorkLocations as H, fetchEmployeeStatuses as I, updateDepartment as J, updateAssetStatus as K, fetchEmploymentTypes as L, fetchAssetStatuses as M, fetchAssetSubcategories as N, deleteWorkLocation as O, fetchDepartments as P, updateFacilityMaster as Q, fetchFacilityMasters as R, deleteEmployeeStatus as S, deleteGender as T, updateAssetCategory as U, fetchTicketCategories as V, updateAssetCondition as W, updateEmployeeStatus as X, updateDesignation as Y, updateEmploymentType as Z, deleteAssetOwnershipType as _, createAssetSubcategory as a, deleteDepartment as b, createEmployeeStatus as c, createGender as d, updatePaymentMode as et, createPaymentMode as f, deleteAssetCondition as g, deleteAssetCategory as h, createAssetStatus as i, fetchAssetOwnershipTypes as j, fetchAssetCategories as k, createEmploymentType as l, createWorkLocation as m, createAssetCondition as n, updateWorkLocation as nt, createDepartment as o, createTicketCategory as p, updateAssetSubcategory as q, createAssetOwnershipType as r, createDesignation as s, createAssetCategory as t, updateTicketCategory as tt, createFacilityMaster as u, deleteAssetStatus as v, deleteFacilityMaster as w, deleteDesignation as x, deleteAssetSubcategory as y, fetchGenders as z };
