/**
 * Utility to extract synthetic customer objects from unit tenant records.
 * Used when occupied units reference a tenant that does not yet have a row in public.customers.
 */

export type UnitTenantCustomer = {
  id: string;
  name: string;
  displayName: string;
  firstName: string;
  middleName: string;
  lastName: string;
  type: "individual" | "company";
  qatarId: string;
  passport: string;
  crNumber: string;
  mobile: string;
  email: string;
  nationality: string;
  customerStatus: string;
  status: "active" | "inactive";
  _source: string;
};

export function normalizeCustomerNameKey(name: string): string {
  if (!name) return "";
  let n = name.toLowerCase().trim();
  n = n.replace(/^m\s*\/\s*s\.?\s*/i, "");
  n = n.replace(/^(mr|mrs|ms|miss|dr|prof|eng|shk|sheikh|shaikh)\.?\s+/i, "");
  n = n.replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  return n;
}

export function buildUnitTenantCustomers(
  units: Array<{ id?: string; current_tenant?: string | null; status?: string | null; lease_status?: string | null }>,
  seenNames: Set<string>,
  guessType?: (name: string) => "individual" | "company"
): UnitTenantCustomer[] {
  if (!Array.isArray(units)) return [];
  const customers: UnitTenantCustomer[] = [];

  units.forEach((u) => {
    const raw = String(u.current_tenant || "").trim();
    if (!raw) return;
    const lower = raw.toLowerCase();
    if (lower === "vacant" || lower === "occupied" || lower === "available" || lower === "tenant" || lower === "-" || lower === "—") return;
    const norm = normalizeCustomerNameKey(raw);
    const legacyNorm = raw.toLowerCase().replace(/^m\s*\/\s*s\.?\s*/i, "m/s ").replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
    if (!norm || seenNames.has(norm) || seenNames.has(legacyNorm) || seenNames.has(lower)) return;
    seenNames.add(norm);
    seenNames.add(legacyNorm);
    seenNames.add(lower);

    const isCompany = guessType
      ? guessType(raw) === "company"
      : /(w\.?l\.?l|l\.?l\.?c|corp|co\.|trading|contracting|services|solutions|company|limited|group)/i.test(raw);

    customers.push({
      id: `unit-cust-${u.id || norm.replace(/\s+/g, "-")}`,
      name: raw,
      displayName: raw,
      firstName: raw,
      middleName: "",
      lastName: "",
      type: isCompany ? "company" : "individual",
      qatarId: "",
      passport: "",
      crNumber: "",
      mobile: "",
      email: "",
      nationality: "",
      customerStatus: "Active",
      status: "active",
      _source: "unit_tenant",
    });
  });

  return customers;
}

