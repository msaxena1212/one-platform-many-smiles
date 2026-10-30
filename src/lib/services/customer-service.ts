import { supabase, Customer } from "@/lib/supabase";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchField?: string;
  matchedCustomerId?: string;
  matchedCustomerName?: string;
}

/**
 * Perform server-side duplicate check using RPC if available, fallback to direct query
 */
export async function checkCustomerDuplicateServer(
  params: {
    qatarId?: string;
    passportNumber?: string;
    crNumber?: string;
    email?: string;
    excludeId?: string;
  }
): Promise<DuplicateCheckResult> {
  try {
    const { data, error } = await supabase.rpc("check_customer_duplicate", {
      p_qatar_id: params.qatarId?.trim() || null,
      p_passport_number: params.passportNumber?.trim() || null,
      p_cr_number: params.crNumber?.trim() || null,
      p_email: params.email?.trim() || null,
      p_exclude_id: params.excludeId || null,
    });

    if (!error && Array.isArray(data) && data.length > 0) {
      const res = data[0];
      if (res.is_duplicate) {
        return {
          isDuplicate: true,
          matchField: res.match_field,
          matchedCustomerId: res.matched_customer_id,
          matchedCustomerName: res.matched_customer_name,
        };
      }
      return { isDuplicate: false };
    }
  } catch (err) {
    console.warn("RPC check_customer_duplicate failed, falling back to query:", err);
  }

  // Fallback to direct client query against database table
  try {
    let query = supabase.from("customers").select("id, full_name, qatar_id, passport_number, commercial_registration, email_address");
    if (params.excludeId) {
      query = query.neq("id", params.excludeId);
    }
    const { data: customers } = await query;
    if (!customers) return { isDuplicate: false };

    for (const c of customers) {
      if (params.qatarId && c.qatar_id && c.qatar_id.trim().toLowerCase() === params.qatarId.trim().toLowerCase()) {
        return { isDuplicate: true, matchField: "Qatar ID", matchedCustomerId: c.id, matchedCustomerName: c.full_name };
      }
      if (params.passportNumber && c.passport_number && c.passport_number.trim().toLowerCase() === params.passportNumber.trim().toLowerCase()) {
        return { isDuplicate: true, matchField: "Passport Number", matchedCustomerId: c.id, matchedCustomerName: c.full_name };
      }
      if (params.crNumber && c.commercial_registration && c.commercial_registration.trim().toLowerCase() === params.crNumber.trim().toLowerCase()) {
        return { isDuplicate: true, matchField: "Commercial Registration (CR)", matchedCustomerId: c.id, matchedCustomerName: c.full_name };
      }
      if (params.email && c.email_address && c.email_address.trim().toLowerCase() === params.email.trim().toLowerCase()) {
        return { isDuplicate: true, matchField: "Email Address", matchedCustomerId: c.id, matchedCustomerName: c.full_name };
      }
    }
  } catch (err) {
    console.error("Direct fallback duplicate check failed:", err);
  }

  return { isDuplicate: false };
}

/**
 * Save or update customer DB-first with guaranteed persistence
 */
export async function persistCustomerToDb(customerData: Partial<Customer>): Promise<Customer> {
  if (customerData.id && !customerData.id.startsWith("TEMP_") && !customerData.id.startsWith("CUST-")) {
    const { data, error } = await supabase
      .from("customers")
      .update({
        ...customerData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", customerData.id)
      .select()
      .single();

    if (error) throw new Error(error.message || "Failed to update customer in database");
    return data as Customer;
  } else {
    // Insert new customer
    const payload = { ...customerData };
    delete payload.id; // Let DB generate UUID if it's a temp id
    const { data, error } = await supabase
      .from("customers")
      .insert([payload])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("A customer with this Qatar ID, Passport, CR, or Email already exists in the database.");
      }
      throw new Error(error.message || "Failed to create customer in database");
    }
    return data as Customer;
  }
}
