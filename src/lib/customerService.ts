import { supabase, type Customer } from "./supabase";

/**
 * Check if a customer with the given identifiers already exists.
 * Checks against qatar_id, passport_number, commercial_registration, mobile_number, email_address.
 * Uses the correct table name: customers
 */
export async function checkDuplicateCustomer(customerData: Partial<Customer>): Promise<boolean> {
  const identifierKeys = [
    "qatar_id",
    "passport_number",
    "commercial_registration",
    "mobile_number",
    "email_address",
  ];

  const duplicateClauses = Object.entries(customerData)
    .filter(
      ([key, value]) =>
        identifierKeys.includes(key) &&
        value !== undefined &&
        value !== null &&
        value !== ""
    )
    .map(([key, value]) => `${key}.eq.${String(value).replace(/,/g, "\\,")}`);

  if (duplicateClauses.length === 0) {
    return false;
  }

  const { data, error } = await supabase
    .from("customers")
    .select("id")
    .or(duplicateClauses.join(","))
    .limit(1);

  if (error) {
    console.error("Error checking for duplicate customer:", error);
    return false;
  }

  return Boolean(data && data.length > 0);
}

/**
 * Create or upsert a customer in customers table.
 */
export async function createCustomer(customer: Customer): Promise<Customer> {
  const { data, error } = await supabase
    .from("customers")
    .upsert(customer)
    .select()
    .single();

  if (error) {
    console.error("Error creating customer:", error);
    throw error;
  }

  return data as Customer;
}

