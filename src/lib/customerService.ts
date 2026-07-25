import { supabase } from './supabase';
import { Customer } from '@/types/supabase';

/**
 * Check if a customer with the given identifiers already exists
 * Returns true if a duplicate is found
 */
export async function checkDuplicateCustomer(customerData: Partial<Customer>): Promise<boolean> {
  // Build query conditions for each identifier that has a value
  const conditions = [];
  const params: Record<string, any> = {};

  if (customerData.qatarId) {
    conditions.push('qatar_id = :qatarId');
    params.qatarId = customerData.qatarId;
  }
  if (customerData.passport) {
    conditions.push('passport_no = :passport');
    params.passport = customerData.passport;
  }
  if (customerData.crNumber) {
    conditions.push('commercial_registration_no = :crNumber');
    params.crNumber = customerData.crNumber;
  }
  if (customerData.mobile) {
    conditions.push('mobile = :mobile');
    params.mobile = customerData.mobile;
  }
  if (customerData.email) {
    conditions.push('email = :email');
    params.email = customerData.email;
  }

  // If no conditions, can't check for duplicates
  if (conditions.length === 0) return false;

  const whereClause = conditions.length > 1 ? `WHERE ${conditions.join(' OR ')}` : `WHERE ${conditions[0]}`;
  
  const { data, error } = await supabase
    .from('Customers')
    .select('id')
    ${whereClause}
    .limit(1);

  if (error) {
    console.error('Error checking for duplicate customer:', error);
    return false;
  }

  return !!data && data.length > 0;
}

export async function createCustomer(customer: Customer): Promise<Customer> {
  const { data, error } = await supabase.from('Customers').upsert(customer).select().single();
  if (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
  return data as Customer;
}