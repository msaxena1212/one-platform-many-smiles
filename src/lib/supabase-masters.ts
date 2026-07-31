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

export async function deletePaymentMode(id: number): Promise<void> {
  const { error } = await supabase.from('mst_payment_modes').delete().eq('id', id);
  if (error) throw error;
}
