import { supabase, type Customer } from "./supabase";

/**
 * Check if a customer with the given identifiers already exists
 * Returns true if a duplicate is found
 */
export async function checkDuplicateCustomer(customerData: Partial<Customer>): Promise<boolean> {
  const duplicateClauses = Object.entries(customerData)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => `${key}.eq.${String(value).replace(/,/g, "\\,")}`);

  if (duplicateClauses.length === 0) {
    return false;
  }

  const { data, error } = await supabase
    .from("Customers")
    .select("id")
    .or(duplicateClauses.join(","))
    .limit(1);

  if (error) {
    console.error("Error checking for duplicate customer:", error);
    return false;
  }

  return Boolean(data && data.length > 0);
}

export async function createCustomer(customer: Customer): Promise<Customer> {
  const { data, error } = await supabase.from("Customers").upsert(customer).select().single();
  if (error) {
    console.error("Error creating customer:", error);
    throw error;
  }
  return data as Customer;
}
