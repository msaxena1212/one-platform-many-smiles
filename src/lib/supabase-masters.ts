import { supabase } from './supabase';

// -- System Masters (Appended) --

export type TicketCategory = {
  id: number;
  name: string;
  sla_hours: number;
  priority: string;
  created_at?: string;
};

export type FacilityMaster = {
  id: number;
  name: string;
  capacity: number;
  paid: boolean;
  created_at?: string;
};

export type PaymentMode = {
  id: number;
  code: string;
  name: string;
  created_at?: string;
};

export async function fetchTicketCategories(): Promise<TicketCategory[]> {
  const { data, error } = await supabase.from('mst_ticket_categories').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function createTicketCategory(cat: Omit<TicketCategory, 'id' | 'created_at'>): Promise<TicketCategory> {
  const { data, error } = await supabase.from('mst_ticket_categories').insert(cat).select().single();
  if (error) throw error;
  return data;
}

export async function updateTicketCategory(id: number, cat: Partial<Omit<TicketCategory, 'id' | 'created_at'>>): Promise<void> {
  const { error } = await supabase.from('mst_ticket_categories').update(cat).eq('id', id);
  if (error) throw error;
}

export async function deleteTicketCategory(id: number): Promise<void> {
  const { error } = await supabase.from('mst_ticket_categories').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchFacilityMasters(): Promise<FacilityMaster[]> {
  const { data, error } = await supabase.from('mst_facilities').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function createFacilityMaster(fac: Omit<FacilityMaster, 'id' | 'created_at'>): Promise<FacilityMaster> {
  const { data, error } = await supabase.from('mst_facilities').insert(fac).select().single();
  if (error) throw error;
  return data;
}

export async function updateFacilityMaster(id: number, fac: Partial<Omit<FacilityMaster, 'id' | 'created_at'>>): Promise<void> {
  const { error } = await supabase.from('mst_facilities').update(fac).eq('id', id);
  if (error) throw error;
}

export async function deleteFacilityMaster(id: number): Promise<void> {
  const { error } = await supabase.from('mst_facilities').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchPaymentModes(): Promise<PaymentMode[]> {
  const { data, error } = await supabase.from('mst_payment_modes').select('*').order('name');
  if (error) throw error;
  return data || [];
}

export async function createPaymentMode(mode: Omit<PaymentMode, 'id' | 'created_at'>): Promise<PaymentMode> {
  const { data, error } = await supabase.from('mst_payment_modes').insert(mode).select().single();
  if (error) throw error;
  return data;
}

export async function updatePaymentMode(id: number, mode: Partial<Omit<PaymentMode, 'id' | 'created_at'>>): Promise<void> {
  const { error } = await supabase.from('mst_payment_modes').update(mode).eq('id', id);
  if (error) throw error;
}

export async function deletePaymentMode(id: number): Promise<void> {
  const { error } = await supabase.from('mst_payment_modes').delete().eq('id', id);
  if (error) throw error;
}

// ── HR Masters ────────────────────────────────────────────────────────────────

export type Simplemaster = { id: number; name: string };

async function fetchSimple(table: string): Promise<Simplemaster[]> {
  const { data, error } = await supabase.from(table).select('*').order('name');
  if (error) throw error;
  return data || [];
}

async function createSimple(table: string, name: string): Promise<Simplemaster> {
  const { data, error } = await supabase.from(table).insert({ name }).select().single();
  if (error) throw error;
  return data;
}

async function updateSimple(table: string, id: number, name: string): Promise<void> {
  const { error } = await supabase.from(table).update({ name }).eq('id', id);
  if (error) throw error;
}

async function deleteSimple(table: string, id: number): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

// Gender
export const fetchGenders = () => fetchSimple('mst_genders');
export const createGender = (name: string) => createSimple('mst_genders', name);
export const updateGender = (id: number, name: string) => updateSimple('mst_genders', id, name);
export const deleteGender = (id: number) => deleteSimple('mst_genders', id);

// Department
export const fetchDepartments = () => fetchSimple('mst_departments');
export const createDepartment = (name: string) => createSimple('mst_departments', name);
export const updateDepartment = (id: number, name: string) => updateSimple('mst_departments', id, name);
export const deleteDepartment = (id: number) => deleteSimple('mst_departments', id);

// Designation
export const fetchDesignations = () => fetchSimple('mst_designations');
export const createDesignation = (name: string) => createSimple('mst_designations', name);
export const updateDesignation = (id: number, name: string) => updateSimple('mst_designations', id, name);
export const deleteDesignation = (id: number) => deleteSimple('mst_designations', id);

// Employment Type
export const fetchEmploymentTypes = () => fetchSimple('mst_employment_types');
export const createEmploymentType = (name: string) => createSimple('mst_employment_types', name);
export const updateEmploymentType = (id: number, name: string) => updateSimple('mst_employment_types', id, name);
export const deleteEmploymentType = (id: number) => deleteSimple('mst_employment_types', id);

// Work Location
export const fetchWorkLocations = () => fetchSimple('mst_work_locations');
export const createWorkLocation = (name: string) => createSimple('mst_work_locations', name);
export const updateWorkLocation = (id: number, name: string) => updateSimple('mst_work_locations', id, name);
export const deleteWorkLocation = (id: number) => deleteSimple('mst_work_locations', id);

// Employee Status
export const fetchEmployeeStatuses = () => fetchSimple('mst_employee_statuses');
export const createEmployeeStatus = (name: string) => createSimple('mst_employee_statuses', name);
export const updateEmployeeStatus = (id: number, name: string) => updateSimple('mst_employee_statuses', id, name);
export const deleteEmployeeStatus = (id: number) => deleteSimple('mst_employee_statuses', id);

// ── Asset Masters ──────────────────────────────────────────────────────────────

export type AssetCategory = { id: number; name: string };
export type AssetSubcategory = { id: number; name: string; category_id: number | null };
export type AssetOwnershipType = { id: number; name: string };
export type AssetCondition = { id: number; name: string };
export type AssetStatus = { id: number; name: string };

export const fetchAssetCategories = () => fetchSimple('mst_asset_categories');
export const createAssetCategory = (name: string) => createSimple('mst_asset_categories', name);
export const updateAssetCategory = (id: number, name: string) => updateSimple('mst_asset_categories', id, name);
export const deleteAssetCategory = (id: number) => deleteSimple('mst_asset_categories', id);

export async function fetchAssetSubcategories(categoryId?: number): Promise<AssetSubcategory[]> {
  let q = supabase.from('mst_asset_subcategories').select('*').order('name');
  if (categoryId) q = q.eq('category_id', categoryId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function createAssetSubcategory(name: string, categoryId: number | null): Promise<AssetSubcategory> {
  const { data, error } = await supabase
    .from('mst_asset_subcategories')
    .insert({ name, category_id: categoryId })
    .select().single();
  if (error) throw error;
  return data;
}

export async function updateAssetSubcategory(id: number, name: string, categoryId: number | null): Promise<void> {
  const { error } = await supabase
    .from('mst_asset_subcategories')
    .update({ name, category_id: categoryId })
    .eq('id', id);
  if (error) throw error;
}

export const deleteAssetSubcategory = (id: number) => deleteSimple('mst_asset_subcategories', id);

export const fetchAssetOwnershipTypes = () => fetchSimple('mst_asset_ownership_types');
export const createAssetOwnershipType = (name: string) => createSimple('mst_asset_ownership_types', name);
export const updateAssetOwnershipType = (id: number, name: string) => updateSimple('mst_asset_ownership_types', id, name);
export const deleteAssetOwnershipType = (id: number) => deleteSimple('mst_asset_ownership_types', id);

export const fetchAssetConditions = () => fetchSimple('mst_asset_conditions');
export const createAssetCondition = (name: string) => createSimple('mst_asset_conditions', name);
export const updateAssetCondition = (id: number, name: string) => updateSimple('mst_asset_conditions', id, name);
export const deleteAssetCondition = (id: number) => deleteSimple('mst_asset_conditions', id);

export const fetchAssetStatuses = () => fetchSimple('mst_asset_statuses');
export const createAssetStatus = (name: string) => createSimple('mst_asset_statuses', name);
export const updateAssetStatus = (id: number, name: string) => updateSimple('mst_asset_statuses', id, name);
export const deleteAssetStatus = (id: number) => deleteSimple('mst_asset_statuses', id);

// ── Property Masters ───────────────────────────────────────────────────────────

export type PropertyCode = { id: number; code: string };
export type UnitCode = { id: number; code: string; property_code_id: number | null };

export async function fetchPropertyCodes(): Promise<PropertyCode[]> {
  const { data, error } = await supabase.from('mst_property_codes').select('*').order('code');
  if (error) throw error;
  return data || [];
}

export async function createPropertyCode(code: string): Promise<PropertyCode> {
  const { data, error } = await supabase.from('mst_property_codes').insert({ code }).select().single();
  if (error) throw error;
  return data;
}

export async function updatePropertyCode(id: number, code: string): Promise<void> {
  const { error } = await supabase.from('mst_property_codes').update({ code }).eq('id', id);
  if (error) throw error;
}

export async function deletePropertyCode(id: number): Promise<void> {
  const { error } = await supabase.from('mst_property_codes').delete().eq('id', id);
  if (error) throw error;
}

export async function fetchUnitCodes(propertyCodeId?: number): Promise<UnitCode[]> {
  let q = supabase.from('mst_unit_codes').select('*').order('code');
  if (propertyCodeId) q = q.eq('property_code_id', propertyCodeId);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function createUnitCode(code: string, propertyCodeId: number | null): Promise<UnitCode> {
  const { data, error } = await supabase
    .from('mst_unit_codes')
    .insert({ code, property_code_id: propertyCodeId })
    .select().single();
  if (error) throw error;
  return data;
}

export async function updateUnitCode(id: number, code: string, propertyCodeId: number | null): Promise<void> {
  const { error } = await supabase
    .from('mst_unit_codes')
    .update({ code, property_code_id: propertyCodeId })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteUnitCode(id: number): Promise<void> {
  const { error } = await supabase.from('mst_unit_codes').delete().eq('id', id);
  if (error) throw error;
}
