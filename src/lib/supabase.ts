import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rnebpqnzignwjeukgztz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuZWJwcW56aWdud2pldWtnenR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxNzU4ODIsImV4cCI6MjA5OTc1MTg4Mn0.maLd6Jgr8uggrfu5uZg9sjRmG0z0r7NlaMB4wIdSRTg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ---- Typed Helpers ----

export type Property = {
  id: string;
  host_id: string;
  title: string;
  description: string | null;
  property_type: string;
  address: string;
  city: string;
  state?: string;
  zip_code?: string;
  country: string;
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  base_price_per_night: number;
  cleaning_fee: number;
  is_active: boolean;
  created_at: string;
  room_details?: any;
  amenities?: string[];
  property_images?: { image_url: string; is_primary: boolean }[];
  kahramaa_number?: string;
  municipality_details?: any;
  // ERP Extended Fields
  property_code?: string;
  cost_center_code?: string;
  cost_center_name?: string;
  property_category?: string;
  ownership_type?: string;
  area_zone?: string;
  street_building_name?: string;
  plot_building_no?: string;
  title_deed_no?: string;
  municipality_ref_no?: string;
  property_manager?: string;
  no_of_floors?: number;
  no_of_units?: number;
  total_built_up_area_sqm?: number;
  common_area_sqm?: number;
  parking_count?: number;
  no_of_elevators?: number;
  completion_date?: string;
  handover_date?: string;
  documents_received?: boolean;
  remarks?: string;
  year_built?: number;
  total_floors?: number;
  total_units?: number;
  property_status?: string;
  contact_person?: string;
  mobile_number?: string;
  email?: string;
  alternate_contact?: string;
  landmark?: string;
};

export type Booking = {
  id: string;
  property_id: string;
  guest_id: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  total_price: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  created_at: string;
  properties?: Pick<Property, 'title' | 'city' | 'country'> & {
    property_images?: { image_url: string }[];
  };
};

export type Profile = {
  id: string;
  role: 'GUEST' | 'HOST' | 'ADMIN' | 'SUPER_ADMIN' | 'SALES' | 'OWNER' | 'PROP_MGR' | 'LEASING' | 'FINANCE' | 'CASHIER' | 'MAINTENANCE' | 'TENANT';
  full_name: string;
  avatar_url: string | null;
};

export type Customer = {
  id: string;
  customer_type: 'Individual' | 'Company';
  full_name: string;
  qatar_id?: string;
  passport_number?: string;
  commercial_registration?: string;
  nationality?: string;
  mobile_number: string;
  email_address?: string;
  permanent_address?: string;
  local_address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  employer_name?: string;
  employer_address?: string;
  designation?: string;
  monthly_income?: number;
  authorized_signatory_name?: string;
  authorized_signatory_id?: string;
  verification_status: 'Pending' | 'Verified' | 'Rejected' | 'Additional Info Required';
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
};

export type Lease = {
  id: string;
  unit_id?: string;
  property_id: string;
  customer_id: string;
  lease_number: string;
  lease_status: string;
  commencement_date: string;
  expiry_date: string;
  lease_period_months: number;
  rental_amount: number;
  payment_frequency: 'Monthly' | 'Quarterly' | 'Semi-Annually' | 'Annually';
  security_deposit: number;
  security_deposit_status: 'Pending' | 'Received' | 'Refunded' | 'Adjusted';
  grace_period_days: number;
  late_penalty_percentage: number;
  late_penalty_fixed: number;
  renewal_terms?: string;
  notice_period_days: number;
  maintenance_responsibility: 'Landlord' | 'Tenant' | 'Shared';
  utility_responsibility: 'Landlord' | 'Tenant' | 'Shared';
  parking_details?: string;
  special_conditions?: string;
  number_of_pdc: number;
  tenant_signed_doc_url?: string;
  landlord_signed_doc_url?: string;
  tenant_signature_date?: string;
  landlord_signature_date?: string;
  signed_by_receiver?: string;
  key_handover_date?: string;
  check_in_report_id?: string;
  check_out_report_id?: string;
  previous_lease_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  tenant_name?: string;
  unit_ref?: string;
};

export type Reservation = {
  id: string;
  unit_id?: string;
  prospect_name: string;
  prospect_contact: string;
  prospect_id_type?: string;
  prospect_id_number?: string;
  marketing_agent_id?: string;
  proposed_lease_period?: number;
  expected_start_date?: string;
  proposed_rental_amount?: number;
  reservation_validity?: string;
  special_conditions?: string;
  status: 'Active' | 'Extended' | 'Cancelled' | 'Expired' | 'Converted';
  created_at: string;
  updated_at: string;
};

export type KeyHandover = {
  id: string;
  lease_id: string;
  handover_date: string;
  keys_issued: any[];
  access_cards_issued: any[];
  parking_remotes: any[];
  meter_readings: any;
  staff_name: string;
  staff_id?: string;
  created_at: string;
};

export type InspectionReport = {
  id: string;
  lease_id: string;
  inspection_type: 'Check-In' | 'Check-Out';
  inspection_date: string;
  unit_condition: any;
  furniture: any;
  appliances: any;
  fixtures: any;
  meter_readings: any;
  keys_access: any;
  photos: any[];
  damages: any[];
  pending_work: any[];
  inspector_name: string;
  tenant_acknowledged: boolean;
  created_at: string;
  updated_at: string;
};

// ---- Data Fetchers ----

/** Fetch all active properties (for landing page / search) */
export async function fetchProperties(options?: { city?: string }) {
  let query = supabase
    .from('properties')
    .select('*, property_images(image_url, is_primary)')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (options?.city) {
    query = query.ilike('city', `%${options.city}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Property[];
}

/** Fetch a single property by ID */
export async function fetchPropertyById(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_images(image_url, is_primary)')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Property;
}

/** Fetch all properties owned by a host */
export async function fetchHostProperties(hostId: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*, property_images(image_url, is_primary)')
    .eq('host_id', hostId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Property[];
}

/** Create a new property listing */
export async function createProperty(payload: Omit<Property, 'id' | 'created_at' | 'property_images'>) {
  const { data, error } = await supabase
    .from('properties')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as Property;
}

/** Update an existing property */
export async function updateProperty(id: string, payload: Partial<Omit<Property, 'id' | 'created_at' | 'property_images'>>) {
  const { data, error } = await supabase
    .from('properties')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Property;
}

/** Fetch bookings for a guest */
export async function fetchGuestBookings(guestId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, properties(title, city, country, property_images(image_url))')
    .eq('guest_id', guestId)
    .order('check_in', { ascending: false });

  if (error) throw error;
  return data as Booking[];
}

/** Fetch bookings for all host's properties */
export async function fetchHostBookings(hostId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, properties!inner(title, city, host_id)')
    .eq('properties.host_id', hostId)
    .order('check_in', { ascending: true });

  if (error) throw error;
  return data;
}
// ---- Finance Types ----

export type GLAccount = {
  id: string;
  code: string;
  name_en: string;
  name_ar?: string;
  type: 'asset' | 'liability' | 'equity' | 'income' | 'expense';
  parent_id?: string;
  currency: string;
  is_postable: boolean;
  created_at: string;
};

export type JournalEntry = {
  id: string;
  je_no: string;
  posting_date: string;
  period: string;
  source_module: string;
  source_id?: string;
  narration?: string;
  status: 'draft' | 'posted' | 'reversed';
  created_at: string;
  journal_lines?: JournalLine[];
};

export type JournalLine = {
  id: string;
  je_id: string;
  line_no: number;
  account_id: string;
  debit: number;
  credit: number;
  cost_center_id?: string;
  property_id?: string;
  unit_id?: string;
  owner_id?: string;
  currency: string;
  fx_rate: number;
  gl_accounts?: Pick<GLAccount, 'code' | 'name_en' | 'type'>;
};

export type Invoice = {
  id: string;
  customer_id?: string;
  lease_id?: string;
  type: 'rent' | 'maintenance' | 'service' | 'deposit_deduction' | 'community';
  lines: any;
  total: number;
  status: string;
  created_at: string;
};

export type Receipt = {
  id: string;
  customer_id?: string;
  payment_mode: 'cash' | 'bank' | 'cheque' | 'sadad' | 'mada' | 'apple_pay' | 'stc_pay' | 'card' | 'bank_transfer';
  amount: number;
  currency: string;
  ref?: string;
  received_at: string;
  allocations: any;
  status: string;
  created_at: string;
};

export type CustomerDraft = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  type?: string;
  national_id?: string;
  notes?: string;
  pending_uploads?: string;
  created_at: string;
};

export type ARLedger = {
  id: string;
  customer_id?: string;
  lease_id?: string;
  reference: string;
  type: 'invoice' | 'receipt' | 'credit_note' | 'debit_note';
  date: string;
  amount: number;
  balance: number;
  status: 'open' | 'partial' | 'closed';
  created_at: string;
};

// ---- Finance Fetchers ----

export async function fetchGLAccounts() {
  const { data, error } = await supabase
    .from('gl_accounts')
    .select('*')
    .order('code', { ascending: true });

  if (error) throw error;
  return data as GLAccount[];
}

export async function fetchJournalEntries() {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*, journal_lines(*, gl_accounts(code, name_en, type))')
    .order('posting_date', { ascending: false });

  if (error) throw error;
  return data as JournalEntry[];
}

export async function fetchReceipts() {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .order('received_at', { ascending: false });

  if (error) throw error;
  return data as Receipt[];
}

// ---- Maintenance Types ----

export type MaintenanceTicket = {
  id: string;
  property_id: string | null;
  unit_ref: string | null;
  title: string;
  description: string | null;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  assignee: string | null;
  host_id: string | null;
  reported_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type InventoryPart = {
  id: string;
  name: string;
  sku?: string;
  quantity_on_hand: number;
  unit_cost: number;
  created_at: string;
};

export type MaterialUsage = {
  id: string;
  ticket_id: string;
  part_id?: string;
  quantity: number;
  cost: number;
  created_at: string;
};

export async function fetchMaintenanceTickets(filters?: { property_id?: string; host_id?: string }) {
  let query = supabase
    .from('maintenance_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.property_id) query = query.eq('property_id', filters.property_id);
  if (filters?.host_id) query = query.eq('host_id', filters.host_id);

  const { data, error } = await query;
  if (error) throw error;
  return data as MaintenanceTicket[];
}

export async function createMaintenanceTicket(payload: Omit<MaintenanceTicket, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('maintenance_tickets')
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as MaintenanceTicket;
}

export async function updateMaintenanceTicket(id: string, payload: Partial<Omit<MaintenanceTicket, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('maintenance_tickets')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as MaintenanceTicket;
}

// ---- ERP Types (Leasing, Assets, Approvals) ----

// Old Lease type removed to resolve duplicate identifier error

export type RentSchedule = {
  id: string;
  lease_id: string;
  due_date: string;
  amount: number;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'overdue';
  created_at: string;
};

export type PDC = {
  id: string;
  lease_id?: string;
  cheque_number: string;
  bank_name?: string;
  bank?: string;            // column in pdcs table
  amount: number;
  deposit_date?: string;
  status: 'held' | 'deposited' | 'cleared' | 'bounced' | 'returned' | 'ISSUED' | 'In Hand';
  // Extended fields from "PDC in Hand New" Excel sheet
  unit_name?: string;
  property_code?: string;
  tenant_name?: string;
  maturity_date?: string;
  rent_from_date?: string;
  rent_to_date?: string;
  sl_no?: number;
  status_pdc?: string;
  created_at?: string;
  updated_at?: string;
};

export type FixedAsset = {
  id: string;
  property_id: string;
  unit_ref?: string;
  name: string;
  category: string;
  purchase_date?: string;
  purchase_value?: number;
  current_value?: number;
  depreciation_rate?: number;
  status: 'active' | 'maintenance' | 'disposed';
  barcode?: string;
  created_at: string;
  updated_at: string;
};

export type ApprovalRequest = {
  id: string;
  target_record_id: string;
  target_table: string;
  requested_by: string;
  amount?: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
};

// ---- ERP Fetchers & Mutators ----

// Leases
export async function fetchLeases(filters?: { host_id?: string; property_id?: string }) {
  let query = supabase.from('leases').select('*').order('created_at', { ascending: false });
  if (filters?.host_id) query = query.eq('host_id', filters.host_id);
  if (filters?.property_id) query = query.eq('property_id', filters.property_id);
  const { data, error } = await query;
  if (error) throw error;
  return data as Lease[];
}

export async function createLease(payload: Omit<Lease, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('leases').insert(payload).select().single();
  if (error) throw error;
  return data as Lease;
}

export async function updateLease(id: string, payload: Partial<Omit<Lease, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('leases').update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  return data as Lease;
}

// Rent Schedules
export async function fetchRentSchedules(leaseId: string) {
  const { data, error } = await supabase
    .from('rent_schedules').select('*').eq('lease_id', leaseId).order('due_date', { ascending: true });
  if (error) throw error;
  return data as RentSchedule[];
}

export async function createRentSchedules(schedules: Omit<RentSchedule, 'id' | 'created_at'>[]) {
  const { data, error } = await supabase.from('rent_schedules').insert(schedules).select();
  if (error) throw error;
  return data as RentSchedule[];
}

export async function updateRentSchedule(id: string, status: RentSchedule['status']) {
  const { data, error } = await supabase.from('rent_schedules').update({ status }).eq('id', id).select().single();
  if (error) throw error;
  return data as RentSchedule;
}

// PDCs
export async function fetchPDCs(leaseId?: string) {
  let query = (supabase.from('pdcs').select('*, leases(tenant_name, unit_ref)') as any).order('deposit_date', { ascending: true });
  if (leaseId) query = query.eq('lease_id', leaseId);
  const { data, error } = await query;
  if (error) throw error;
  return data as (PDC & { leases?: Pick<Lease, 'tenant_name' | 'unit_ref'> })[];
}

export async function createPDC(payload: Omit<PDC, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('pdcs').insert(payload).select().single();
  if (error) throw error;
  return data as PDC;
}

export async function updatePDC(id: string, status: PDC['status']) {
  const { data, error } = await supabase
    .from('pdcs').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data as PDC;
}

// AR Ledger
export async function fetchARLedgers(filters?: { lease_id?: string; status?: ARLedger['status'] }) {
  let query = supabase.from('ar_ledgers').select('*').order('date', { ascending: false });
  if (filters?.lease_id) query = query.eq('lease_id', filters.lease_id);
  if (filters?.status) query = query.eq('status', filters.status);
  const { data, error } = await query;
  if (error) throw error;
  return data as ARLedger[];
}

export async function createAREntry(payload: Omit<ARLedger, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('ar_ledgers').insert(payload).select().single();
  if (error) throw error;
  return data as ARLedger;
}

export async function settleAREntry(id: string) {
  const { data, error } = await supabase
    .from('ar_ledgers').update({ status: 'closed', balance: 0 }).eq('id', id).select().single();
  if (error) throw error;
  return data as ARLedger;
}

// Journal Entries — Create & Update
export async function createJournalEntry(payload: Omit<JournalEntry, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('journal_entries').insert(payload).select().single();
  if (error) throw error;
  return data as JournalEntry;
}

export async function updateJournalEntry(id: string, payload: Partial<Pick<JournalEntry, 'narration' | 'status'>>) {
  const { data, error } = await supabase.from('journal_entries').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data as JournalEntry;
}

// Receipts — Create & Update
export async function createReceipt(payload: Omit<Receipt, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('receipts').insert(payload).select().single();
  if (error) throw error;
  return data as Receipt;
}

export async function updateReceipt(id: string, payload: Partial<Pick<Receipt, 'status' | 'amount' | 'payment_mode'>>) {
  const { data, error } = await supabase.from('receipts').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data as Receipt;
}

// Fixed Assets
export async function fetchFixedAssets(filters?: { property_id?: string }) {
  let query = supabase.from('fixed_assets').select('*').order('created_at', { ascending: false });
  if (filters?.property_id) query = query.eq('property_id', filters.property_id);
  const { data, error } = await query;
  if (error) throw error;
  return data as FixedAsset[];
}

export async function createFixedAsset(payload: Omit<FixedAsset, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('fixed_assets').insert(payload).select().single();
  if (error) throw error;
  return data as FixedAsset;
}

export async function updateFixedAsset(id: string, payload: Partial<Omit<FixedAsset, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('fixed_assets').update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  return data as FixedAsset;
}

export async function transferFixedAsset(id: string, newPropertyId: string, newUnitRef: string) {
  const { data, error } = await supabase
    .from('fixed_assets').update({ property_id: newPropertyId, unit_ref: newUnitRef, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  return data as FixedAsset;
}

// Approvals
export async function fetchApprovalRequests(status?: ApprovalRequest['status']) {
  let query = supabase.from('approval_requests').select('*').order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data as ApprovalRequest[];
}

export async function createApprovalRequest(payload: Omit<ApprovalRequest, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase.from('approval_requests').insert(payload).select().single();
  if (error) throw error;
  return data as ApprovalRequest;
}

export async function processApproval(id: string, decision: 'approved' | 'rejected', notes?: string) {
  const { data, error } = await supabase
    .from('approval_requests')
    .update({ status: decision, notes, updated_at: new Date().toISOString() })
    .eq('id', id).select().single();
  if (error) throw error;
  return data as ApprovalRequest;
}

// Material Usage
export async function fetchMaterialUsage(ticketId: string) {
  const { data, error } = await supabase
    .from('material_usage').select('*, inventory_parts(name, sku)').eq('ticket_id', ticketId);
  if (error) throw error;
  return data;
}

export async function logMaterialUsage(payload: { ticket_id: string; part_id?: string; quantity: number; cost: number }) {
  const { data, error } = await supabase.from('material_usage').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function fetchInventoryParts() {
  const { data, error } = await supabase.from('inventory_parts').select('*').order('name');
  if (error) throw error;
  return data as InventoryPart[];
}

// Units
export type Unit = {
  id: string;
  property_id: string;
  unit_ref: string;
  room_type?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: string;
  price?: number;
  status?: string;
  created_at: string;
  // ERP Extended Fields
  unit_code?: string;
  unit_cost_center_code?: string;
  unit_name?: string;
  parent_cost_center_code?: string;
  unit_usage?: string;
  block_tower?: string;
  floor?: string;
  balcony_sqm?: number;
  total_area_sqm?: number;
  view_type?: string;
  furnishing?: string;
  parking_slot_no?: string;
  electricity_meter_no?: string;
  water_meter_no?: string;
  cooling_meter_no?: string;
  lease_status?: string;
  rent_frequency?: string;
  current_tenant?: string;
  contract_no?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  current_rent?: number;
  security_deposit_type?: string;
  security_deposit_amount?: number;
  service_charge?: number;
  maintenance_responsibility?: string;
  handover_date?: string;
  documents_received?: boolean;
  remarks?: string;
  max_adults?: number;
  max_children?: number;
  total_occupancy?: number;
  weekend_price?: number;
  holiday_price?: number;
  cleaning_fee?: number;
};

export async function fetchUnits(filters?: { property_id?: string }) {
  let q: any = supabase.from('units').select('*').order('created_at', { ascending: false });
  if (filters?.property_id) q = q.eq('property_id', filters.property_id);
  const { data, error } = await q;
  if (error) throw error;
  return data as Unit[];
}

export async function createUnit(payload: Partial<Unit>) {
  const { data, error } = await supabase.from('units').insert(payload).select().single();
  if (error) throw error;
  return data as Unit;
}

export async function updateUnit(id: string, payload: Partial<Unit>) {
  const { data, error } = await supabase.from('units').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data as Unit;
}

// Profiles / Users (lightweight)
export type ProfileRow = {
  id: string;
  full_name: string;
  email?: string;
  role?: string;
  avatar_url?: string | null;
  created_at: string;
};

export async function fetchProfiles() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as ProfileRow[];
}

export async function createProfile(payload: Partial<ProfileRow>) {
  const { data, error } = await supabase.from('profiles').insert(payload).select().single();
  if (error) throw error;
  return data as ProfileRow;
}

// GL account create
export async function createGLAccount(payload: Partial<GLAccount>) {
  const { data, error } = await supabase.from('gl_accounts').insert(payload).select().single();
  if (error) throw error;
  return data as GLAccount;
}

// Provisions
export type Provision = {
  id: string;
  name: string;
  amount: number;
  period: string;
  gl_account_id?: string;
  created_at: string;
};

export async function fetchProvisions() {
  const { data, error } = await supabase.from('provisions').select('*').order('period', { ascending: false });
  if (error) throw error;
  return data as Provision[];
}

export async function createProvision(payload: Omit<Provision, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('provisions').insert(payload).select().single();
  if (error) throw error;
  return data as Provision;
}

// Additional helpers: single rent schedule creation, PDC processing, approval aliases
export async function createRentSchedule(payload: Omit<RentSchedule, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('rent_schedules').insert(payload).select().single();
  if (error) throw error;
  return data as RentSchedule;
}

export async function processPDC(id: string, status: PDC['status'], depositDate?: string) {
  const update: Partial<PDC> = { status };
  if (depositDate) update.deposit_date = depositDate;
  const { data, error } = await supabase.from('pdcs').update({ ...update, updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (error) throw error;
  return data as PDC;
}

export async function submitApproval(payload: Omit<ApprovalRequest, 'id' | 'created_at' | 'updated_at'>) {
  return createApprovalRequest(payload as any);
}

export async function approveRequest(id: string, approverId: string, comment?: string) {
  // find request and add an approval_step record, then update request status when final
  const { data: req, error: reqErr } = await supabase.from('approval_requests').select('*').eq('id', id).single();
  if (reqErr) throw reqErr;

  const { data: step, error: stepErr } = await supabase.from('approval_steps').insert({
    request_id: id,
    step_order: 1,
    approver_id: approverId,
    status: 'approved',
    decision_at: new Date().toISOString(),
    comment: comment || null
  }).select().single();
  if (stepErr) throw stepErr;

  // simplistic: mark request approved
  const { data: updatedReq, error: updErr } = await supabase.from('approval_requests').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('id', id).select().single();
  if (updErr) throw updErr;
  return { request: updatedReq as ApprovalRequest, step: step };
}

// ---- ERP Master Tables ----

export type MasterItem = { id: string; label: string; };

async function fetchMaster(table: string): Promise<MasterItem[]> {
  const { data, error } = await supabase.from(table).select('id, label').order('label');
  if (error) return [];
  return data as MasterItem[];
}

export const fetchPropertyTypes = () => fetchMaster('mst_property_types');
export const fetchPropertyCategories = () => fetchMaster('mst_property_categories');
export const fetchOwnershipTypes = () => fetchMaster('mst_ownership_types');
export const fetchVatTreatments = () => fetchMaster('mst_vat_treatments');
export const fetchUnitUsages = () => fetchMaster('mst_unit_usages');
export const fetchViewTypes = () => fetchMaster('mst_view_types');
export const fetchFurnishingTypes = () => fetchMaster('mst_furnishing');
export const fetchLeaseStatuses = () => fetchMaster('mst_lease_statuses');
export const fetchRentFrequencies = () => fetchMaster('mst_rent_frequencies');
export const fetchMaintenanceResponsibilities = () => fetchMaster('mst_maintenance_responsibilities');
export const fetchSecurityDepositTypes = () => fetchMaster('mst_security_deposit_types');

// ---- ERP Vouchers ----

export type ERPVoucher = {
  id: string;
  voucher_no: string;
  voucher_type: 'Receipt' | 'Deposit' | 'Cheque Return' | 'Rent Income' | 'Payment';
  voucher_date: string;
  total_amount: number;
  notes?: string;
  created_at: string;
  journal_entries?: ERPJournalEntry[];
  erp_journal_entries?: ERPJournalEntry[];
};

export type ERPJournalEntry = {
  id: string;
  voucher_id: string;
  account_name: string;
  debit: number;
  credit: number;
  created_at: string;
};

export type ERPChartOfAccount = {
  id: string;
  code: string;
  name: string;
  type: string;
  created_at: string;
};

export async function fetchERPVouchers(filters?: { voucher_type?: string }) {
  let q = supabase
    .from('erp_vouchers')
    .select('*, erp_journal_entries(*)')
    .order('voucher_date', { ascending: false });
  if (filters?.voucher_type) q = q.eq('voucher_type', filters.voucher_type);
  const { data, error } = await q;
  if (error) throw error;
  return data as ERPVoucher[];
}

export async function createERPVoucher(
  voucher: Omit<ERPVoucher, 'id' | 'created_at' | 'journal_entries'>,
  lines: Omit<ERPJournalEntry, 'id' | 'voucher_id' | 'created_at'>[]
) {
  const { data: v, error: ve } = await supabase.from('erp_vouchers').insert(voucher).select().single();
  if (ve) throw ve;
  const linePayloads = lines.map(l => ({ ...l, voucher_id: (v as any).id }));
  const { error: le } = await supabase.from('erp_journal_entries').insert(linePayloads);
  if (le) throw le;
  return v as ERPVoucher;
}

export async function fetchERPChartOfAccounts() {
  const { data, error } = await supabase.from('erp_chart_of_accounts').select('*').order('code');
  if (error) throw error;
  return data as ERPChartOfAccount[];
}

export async function createInventoryPart(payload: Omit<InventoryPart, 'id'>) {
  const { data, error } = await supabase.from('inventory_parts').insert([payload]).select().single();
  if (error) throw error;
  return data as InventoryPart;
}