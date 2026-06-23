import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvlnwpsijbzcqxutsgwy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2bG53cHNpamJ6Y3F4dXRzZ3d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjEwNjMsImV4cCI6MjA5NzY5NzA2M30.gL_b8YOgRrM9DC5zm7-iert2O16AEQV8WFmyeG1Ek94';

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
  room_details?: any; // JSONB column holding room dimensions
  amenities?: string[]; // JSONB array of amenity IDs
  property_images?: { image_url: string; is_primary: boolean }[];
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
  role: 'GUEST' | 'HOST' | 'ADMIN';
  full_name: string;
  avatar_url: string | null;
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
