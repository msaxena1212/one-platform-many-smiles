import { supabase } from "@/lib/supabase";
import { HRMS_MASTER_DEFAULTS, LEGACY_HRMS_DEFAULT_NAMES } from "@/lib/hrms-master-defaults";
import { dbValueGet, dbValueSet, loadDbValues } from "@/lib/db-kv";

export interface MasterItem {
  id: string;
  name: string;
  code?: string;
  category?: string;
  description?: string;
  /** Roles attached to this department or designation (e.g. ["Finance", "Admin"]) */
  roles?: string[];
  extra?: Record<string, any>;
  is_active?: boolean;
}

export type MasterCategoryKey =
  | "companies"
  | "branches"
  | "entities"
  | "departments"
  | "sub_departments"
  | "designations"
  | "grades"
  | "employment_types"
  | "contract_types"
  | "recruitment_reasons"
  | "regions"
  | "countries"
  | "states"
  | "cities"
  | "currencies"
  | "financial_years"
  | "banks"
  | "device_user_ids"
  | "ticket_categories"
  | "complaint_types"
  | "course_categories"
  | "expense_types"
  | "travel_allowances"
  | "kpa_masters"
  | "shifts"
  | "holidays"
  | "week_offs"
  | "salary_components"
  | "statutory_components"
  | "salary_templates"
  | "tax_slabs"
  | "appraisal_intervals"
  | "kt_masters"
  | "notice_periods"
  | "genders"
  | "employee_statuses"
  | "business_units"
  | "leave_types"
  | "document_types"
  | "loan_types";

export const MASTER_CATEGORIES_CONFIG: {
  key: MasterCategoryKey;
  label: string;
  group: "Organization" | "Location" | "HR & Workforce" | "Payroll & Finance" | "System & Service";
  codePrefix: string;
  /** When true the UI renders a Roles editor column for this category */
  supportsRoles?: boolean;
  defaultItems: { name: string; code?: string; description?: string; roles?: string[] }[];
}[] = [
  // ── Organization ──
  {
    key: "companies",
    label: "Company Master",
    group: "Organization",
    codePrefix: "CMP",
    defaultItems: HRMS_MASTER_DEFAULTS["companies"] ?? [],
  },
  {
    key: "branches",
    label: "Branch Setup",
    group: "Organization",
    codePrefix: "BRN",
    defaultItems: HRMS_MASTER_DEFAULTS["branches"] ?? [],
  },
  {
    key: "entities",
    label: "Entity Master",
    group: "Organization",
    codePrefix: "ENT",
    defaultItems: HRMS_MASTER_DEFAULTS["entities"] ?? [],
  },
  {
    key: "business_units",
    label: "Business Unit (BU)",
    group: "Organization",
    codePrefix: "BU",
    defaultItems: HRMS_MASTER_DEFAULTS["business_units"] ?? [],
  },
  {
    key: "departments",
    label: "Department",
    group: "Organization",
    codePrefix: "DEP",
    supportsRoles: true,
    defaultItems: HRMS_MASTER_DEFAULTS["departments"] ?? [],
  },
  {
    key: "sub_departments",
    label: "Sub Department",
    group: "Organization",
    codePrefix: "SDEP",
    defaultItems: HRMS_MASTER_DEFAULTS["sub_departments"] ?? [],
  },
  {
    key: "designations",
    label: "Designation Master",
    group: "HR & Workforce",
    codePrefix: "DSG",
    supportsRoles: true,
    defaultItems: HRMS_MASTER_DEFAULTS["designations"] ?? [],
  },
  {
    key: "grades",
    label: "Grade Master",
    group: "HR & Workforce",
    codePrefix: "GRD",
    defaultItems: HRMS_MASTER_DEFAULTS["grades"] ?? [],
  },
  {
    key: "employment_types",
    label: "Employment Type",
    group: "HR & Workforce",
    codePrefix: "EMT",
    defaultItems: HRMS_MASTER_DEFAULTS["employment_types"] ?? [],
  },
  {
    key: "genders",
    label: "Gender Master",
    group: "HR & Workforce",
    codePrefix: "GND",
    defaultItems: HRMS_MASTER_DEFAULTS["genders"] ?? [],
  },
  {
    key: "employee_statuses",
    label: "Employee Status Master",
    group: "HR & Workforce",
    codePrefix: "EST",
    defaultItems: HRMS_MASTER_DEFAULTS["employee_statuses"] ?? [],
  },
  {
    key: "contract_types",
    label: "Contract Type",
    group: "HR & Workforce",
    codePrefix: "CNT",
    defaultItems: HRMS_MASTER_DEFAULTS["contract_types"] ?? [],
  },
  {
    key: "leave_types",
    label: "Leave Types & Quotas",
    group: "HR & Workforce",
    codePrefix: "LTYP",
    defaultItems: HRMS_MASTER_DEFAULTS["leave_types"] ?? [],
  },
  {
    key: "document_types",
    label: "Document Types & Verification",
    group: "HR & Workforce",
    codePrefix: "DOC-TYP",
    defaultItems: HRMS_MASTER_DEFAULTS["document_types"] ?? [],
  },
  {
    key: "recruitment_reasons",
    label: "Reason For Recruitment",
    group: "HR & Workforce",
    codePrefix: "REC",
    defaultItems: HRMS_MASTER_DEFAULTS["recruitment_reasons"] ?? [],
  },
  {
    key: "notice_periods",
    label: "Notice Period Master",
    group: "HR & Workforce",
    codePrefix: "NOT",
    defaultItems: HRMS_MASTER_DEFAULTS["notice_periods"] ?? [],
  },
  {
    key: "kt_masters",
    label: "Knowledge Transfer (KT) Master",
    group: "HR & Workforce",
    codePrefix: "KT",
    defaultItems: HRMS_MASTER_DEFAULTS["kt_masters"] ?? [],
  },

  // ── Locations ──
  {
    key: "countries",
    label: "Country Master",
    group: "Location",
    codePrefix: "CTY",
    defaultItems: HRMS_MASTER_DEFAULTS["countries"] ?? [],
  },
  {
    key: "states",
    label: "State / Governorate Master",
    group: "Location",
    codePrefix: "ST",
    defaultItems: HRMS_MASTER_DEFAULTS["states"] ?? [],
  },
  {
    key: "cities",
    label: "City Master",
    group: "Location",
    codePrefix: "CIT",
    defaultItems: HRMS_MASTER_DEFAULTS["cities"] ?? [],
  },
  {
    key: "regions",
    label: "Region Master",
    group: "Location",
    codePrefix: "REG",
    defaultItems: HRMS_MASTER_DEFAULTS["regions"] ?? [],
  },

  // ── Payroll & Finance ──
  {
    key: "financial_years",
    label: "Financial Year",
    group: "Payroll & Finance",
    codePrefix: "FY",
    defaultItems: HRMS_MASTER_DEFAULTS["financial_years"] ?? [],
  },
  {
    key: "currencies",
    label: "Currency Master",
    group: "Payroll & Finance",
    codePrefix: "CUR",
    defaultItems: HRMS_MASTER_DEFAULTS["currencies"] ?? [],
  },
  {
    key: "banks",
    label: "Bank Master",
    group: "Payroll & Finance",
    codePrefix: "BNK",
    defaultItems: HRMS_MASTER_DEFAULTS["banks"] ?? [],
  },
  {
    key: "salary_components",
    label: "Salary Components",
    group: "Payroll & Finance",
    codePrefix: "SAL-COMP",
    defaultItems: HRMS_MASTER_DEFAULTS["salary_components"] ?? [],
  },
  {
    key: "statutory_components",
    label: "Statutory & Deductions",
    group: "Payroll & Finance",
    codePrefix: "STAT",
    defaultItems: HRMS_MASTER_DEFAULTS["statutory_components"] ?? [],
  },
  {
    key: "salary_templates",
    label: "Salary Structure Templates",
    group: "Payroll & Finance",
    codePrefix: "SAL-TMP",
    defaultItems: HRMS_MASTER_DEFAULTS["salary_templates"] ?? [],
  },
  {
    key: "tax_slabs",
    label: "Tax Slabs & Exemption Rules",
    group: "Payroll & Finance",
    codePrefix: "TAX",
    defaultItems: HRMS_MASTER_DEFAULTS["tax_slabs"] ?? [],
  },
  {
    key: "loan_types",
    label: "Staff Loan & Advance Types",
    group: "Payroll & Finance",
    codePrefix: "LOAN-TYP",
    defaultItems: HRMS_MASTER_DEFAULTS["loan_types"] ?? [],
  },

  // ── System & Service ──
  {
    key: "shifts",
    label: "Work Shifts Master",
    group: "HR & Workforce",
    codePrefix: "SHF",
    defaultItems: HRMS_MASTER_DEFAULTS["shifts"] ?? [],
  },
  {
    key: "holidays",
    label: "Public Holidays Calendar",
    group: "HR & Workforce",
    codePrefix: "HOL",
    defaultItems: HRMS_MASTER_DEFAULTS["holidays"] ?? [],
  },
  {
    key: "week_offs",
    label: "Week Off Configuration",
    group: "HR & Workforce",
    codePrefix: "WO",
    defaultItems: HRMS_MASTER_DEFAULTS["week_offs"] ?? [],
  },
  {
    key: "kpa_masters",
    label: "KPA & Performance Goals",
    group: "HR & Workforce",
    codePrefix: "KPA",
    defaultItems: HRMS_MASTER_DEFAULTS["kpa_masters"] ?? [],
  },
  {
    key: "appraisal_intervals",
    label: "Appraisal Intervals",
    group: "HR & Workforce",
    codePrefix: "APP-INT",
    defaultItems: HRMS_MASTER_DEFAULTS["appraisal_intervals"] ?? [],
  },
  {
    key: "device_user_ids",
    label: "Device UserID / Biometric Link",
    group: "System & Service",
    codePrefix: "DEV-UID",
    defaultItems: HRMS_MASTER_DEFAULTS["device_user_ids"] ?? [],
  },
  {
    key: "ticket_categories",
    label: "Ticket Category",
    group: "System & Service",
    codePrefix: "TCAT",
    defaultItems: HRMS_MASTER_DEFAULTS["ticket_categories"] ?? [],
  },
  {
    key: "complaint_types",
    label: "Complaint Type",
    group: "System & Service",
    codePrefix: "CMPL",
    defaultItems: HRMS_MASTER_DEFAULTS["complaint_types"] ?? [],
  },
  {
    key: "course_categories",
    label: "Course & Learning Category",
    group: "System & Service",
    codePrefix: "CRS",
    defaultItems: HRMS_MASTER_DEFAULTS["course_categories"] ?? [],
  },
  {
    key: "expense_types",
    label: "Type Of Expense",
    group: "System & Service",
    codePrefix: "EXP",
    defaultItems: HRMS_MASTER_DEFAULTS["expense_types"] ?? [],
  },
  {
    key: "travel_allowances",
    label: "Travel Allowance & Per Diem",
    group: "System & Service",
    codePrefix: "TA",
    defaultItems: HRMS_MASTER_DEFAULTS["travel_allowances"] ?? [],
  },
];

const MASTER_CACHE_KEY_PREFIX = "zyno_hrms_master_v2_";
const LEGACY_MASTER_CACHE_PREFIX = "zyno_hrms_master_cache_";
// Start-up: load the database copy of every master category.
if (typeof window !== "undefined") {
  void loadDbValues(MASTER_CATEGORIES_CONFIG.map(c => `${MASTER_CACHE_KEY_PREFIX}${c.key}`));
}
const REPLACED_CATALOG_ITEMS: Partial<Record<MasterCategoryKey, string[]>> = {
  departments: [
    "Commercial & Leasing",
    "Facility Operations & Maintenance",
    "Human Resources & Talent",
    "Legal & Compliance",
    "Procurement & Supply Chain",
  ],
  designations: [
    "Managing Director / CEO",
    "Senior Property Manager",
    "Leasing Executive",
    "Chief Financial Officer",
    "Senior Accountant",
    "Chief MEP Engineer",
    "Facility Technician",
    "HR Manager",
  ],
};

export const HrmsMastersApi = {
  // Get all items for a category
  async getMasterItems(categoryKey: MasterCategoryKey): Promise<MasterItem[]> {
    const config = MASTER_CATEGORIES_CONFIG.find((c) => c.key === categoryKey);
    const localKey = `${MASTER_CACHE_KEY_PREFIX}${categoryKey}`;

    // Defaults: only the approved HRMS Master list (hrms-master-defaults.ts)
    const defaults: MasterItem[] = (config?.defaultItems || []).map((item, idx) => ({
      id: `${categoryKey}-${idx + 1}`,
      name: item.name,
      code: item.code || `${config?.codePrefix || "M"}-${idx + 1}`,
      description: item.description,
      is_active: true,
    }));

    // The list lives in the database (db-kv). On the first start-up after this change, an old browser copy is moved
    // across, leaving out the default names that earlier versions seeded.
    let stored: any[] | null = dbValueGet<any[] | null>(localKey, null);
    const legacyKey = `${LEGACY_MASTER_CACHE_PREFIX}${categoryKey}`;
    if (stored === null && typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(legacyKey);
        if (raw !== null) {
          const legacyList: any[] = JSON.parse(raw);
          const seeded = new Set((LEGACY_HRMS_DEFAULT_NAMES[categoryKey] || []).map(n => n.toLowerCase()));
          stored = (Array.isArray(legacyList) ? legacyList : []).filter(p => !seeded.has(String(p?.name || "").toLowerCase()));
          dbValueSet(localKey, stored);
          window.localStorage.removeItem(legacyKey);
        }
      } catch { /* unreadable browser copy: ignored */ }
    }

    if (stored && stored.length > 0) {
      // Filter out legacy dummy entries like "Mindz Developers"
      const clean = stored.filter(p => !p.name?.includes("Mindz Developers") && !p.name?.includes("Gurugram"));
      if (clean.length > 0) {
        if (categoryKey !== "departments" && categoryKey !== "designations") return clean;

        const replacedNames = new Set((REPLACED_CATALOG_ITEMS[categoryKey] || []).map((name) => name.toLowerCase()));
        const currentItems = defaults.map((item) => {
          const storedItem = clean.find((s) => s.name?.toLowerCase() === item.name.toLowerCase());
          return storedItem ? { ...item, ...storedItem, code: item.code } : item;
        });
        const currentNames = new Set(currentItems.map((item) => item.name.toLowerCase()));
        const customItems = clean.filter((item) =>
          !replacedNames.has(item.name?.toLowerCase()) &&
          !currentNames.has(item.name?.toLowerCase())
        );
        const migrated = [...currentItems, ...customItems];
        dbValueSet(localKey, migrated);
        return migrated;
      }
    }

    dbValueSet(localKey, defaults);
    return defaults;
  },

  async addMasterItem(
    categoryKey: MasterCategoryKey,
    item: { name: string; code?: string; description?: string; extra?: any }
  ): Promise<MasterItem> {
    const current = await this.getMasterItems(categoryKey);
    const config = MASTER_CATEGORIES_CONFIG.find((c) => c.key === categoryKey);
    const newItem: MasterItem = {
      id: `${categoryKey}-${Date.now()}`,
      name: item.name,
      code: item.code || `${config?.codePrefix || "M"}-${current.length + 1}`,
      description: item.description,
      extra: item.extra,
      is_active: true,
    };
    const updated = [newItem, ...current];
    dbValueSet(`${MASTER_CACHE_KEY_PREFIX}${categoryKey}`, updated);
    window.dispatchEvent(new CustomEvent("hrms_masters_updated", { detail: { categoryKey, items: updated } }));
    return newItem;
  },

  async createMasterItem(
    categoryKey: MasterCategoryKey,
    item: { name: string; code?: string; description?: string; extra?: Record<string, any> }
  ): Promise<MasterItem> {
    return this.addMasterItem(categoryKey, item);
  },

  async updateMasterItem(
    categoryKey: MasterCategoryKey,
    id: string,
    updates: Partial<MasterItem>
  ): Promise<MasterItem | null> {
    const current = await this.getMasterItems(categoryKey);
    const updated = current.map((i) => (i.id === id ? { ...i, ...updates } : i));
    dbValueSet(`${MASTER_CACHE_KEY_PREFIX}${categoryKey}`, updated);
    window.dispatchEvent(new CustomEvent("hrms_masters_updated", { detail: { categoryKey, items: updated } }));
    return updated.find((i) => i.id === id) || null;
  },

  async deleteMasterItem(categoryKey: MasterCategoryKey, id: string): Promise<boolean> {
    const current = await this.getMasterItems(categoryKey);
    const updated = current.filter((i) => i.id !== id);
    dbValueSet(`${MASTER_CACHE_KEY_PREFIX}${categoryKey}`, updated);
    window.dispatchEvent(new CustomEvent("hrms_masters_updated", { detail: { categoryKey, items: updated } }));
    return true;
  },

  // Batch getter for common dropdowns
  async getEmployeeCreationMasters() {
    const [
      companies,
      branches,
      entities,
      businessUnits,
      departments,
      subDepartments,
      designations,
      grades,
      employmentTypes,
      contractTypes,
      countries,
      states,
      cities,
      banks,
      genders,
      employeeStatuses,
      documentTypes,
      leaveTypes,
    ] = await Promise.all([
      this.getMasterItems("companies"),
      this.getMasterItems("branches"),
      this.getMasterItems("entities"),
      this.getMasterItems("business_units"),
      this.getMasterItems("departments"),
      this.getMasterItems("sub_departments"),
      this.getMasterItems("designations"),
      this.getMasterItems("grades"),
      this.getMasterItems("employment_types"),
      this.getMasterItems("contract_types"),
      this.getMasterItems("countries"),
      this.getMasterItems("states"),
      this.getMasterItems("cities"),
      this.getMasterItems("banks"),
      this.getMasterItems("genders"),
      this.getMasterItems("employee_statuses"),
      this.getMasterItems("document_types"),
      this.getMasterItems("leave_types"),
    ]);

    return {
      companies,
      branches,
      entities,
      businessUnits,
      departments,
      subDepartments,
      designations,
      grades,
      employmentTypes,
      contractTypes,
      countries,
      states,
      cities,
      banks,
      genders,
      employeeStatuses,
      documentTypes,
      leaveTypes,
    };
  },

  // Generate Next Employee ID based on organization master logic or sequential counter
  async generateNextEmployeeId(prefix: string = "EMP"): Promise<string> {
    try {
      const { data } = await supabase
        .from('employees')
        .select('employee_id_code');
      
      let maxNum = 0;
      if (data && data.length > 0) {
        for (const row of data) {
          const code = String(row.employee_id_code || '').trim();
          const match = code.match(/(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num > maxNum) {
              maxNum = num;
            }
          }
        }
      }
      const nextNum = maxNum + 1;
      const formatted = String(nextNum).padStart(nextNum > 999 ? 4 : 3, '0');
      return `${prefix}-${formatted}`;
    } catch {
      return `${prefix}-${String(Math.floor(100 + Math.random() * 900))}`;
    }
  },
};
