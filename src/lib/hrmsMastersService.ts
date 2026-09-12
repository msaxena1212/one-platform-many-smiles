import { supabase } from "@/lib/supabase";

export interface MasterItem {
  id: string;
  name: string;
  code?: string;
  category?: string;
  description?: string;
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
  | "business_units";

export const MASTER_CATEGORIES_CONFIG: {
  key: MasterCategoryKey;
  label: string;
  group: "Organization" | "Location" | "HR & Workforce" | "Payroll & Finance" | "System & Service";
  codePrefix: string;
  defaultItems: { name: string; code?: string; description?: string }[];
}[] = [
  // ── Organization ──
  {
    key: "companies",
    label: "Company Master",
    group: "Organization",
    codePrefix: "CMP",
    defaultItems: [
      { name: "Mindz Developers Pvt Ltd", code: "MDPL", description: "Primary Real Estate Development Entity" },
      { name: "One Platform Hospitality W.L.L", code: "OPHW", description: "Hospitality & Facility Ops" },
      { name: "Gulf Property Holdings", code: "GPH", description: "Commercial Assets Division" },
    ],
  },
  {
    key: "branches",
    label: "Branch Setup",
    group: "Organization",
    codePrefix: "BRN",
    defaultItems: [
      { name: "Gurugram India Corporate", code: "GGN-IN", description: "Global Tech & Support Hub" },
      { name: "Doha Downtown Branch", code: "DOH-QA", description: "Property Operations & Leasing Hub" },
      { name: "West Bay Commercial Tower", code: "WB-01", description: "Executive Assets Branch" },
      { name: "Lusail Marina Office", code: "LSL-02", description: "Residential Community Hub" },
    ],
  },
  {
    key: "entities",
    label: "Entity Master",
    group: "Organization",
    codePrefix: "ENT",
    defaultItems: [
      { name: "MGT-IN-GUR (PRIMARY)", code: "MGT-IN-GUR", description: "Primary Management Entity" },
      { name: "MGT-QA-DOH (REGIONAL)", code: "MGT-QA-DOH", description: "Qatar Regional Entity" },
      { name: "ESTATE-HOLDINGS-LLC", code: "EST-HLD", description: "Holding SPV Entity" },
    ],
  },
  {
    key: "business_units",
    label: "Business Unit (BU)",
    group: "Organization",
    codePrefix: "BU",
    defaultItems: [
      { name: "BVR (Residential Tower)", code: "BVR", description: "Bay View Residences" },
      { name: "CPT (Commercial Park)", code: "CPT", description: "Capital Commercial Park" },
      { name: "MKT (Retail Mall & Promenade)", code: "MKT", description: "Market Promenade" },
      { name: "CORP (Shared Services)", code: "CORP", description: "Corporate Services" },
    ],
  },
  {
    key: "departments",
    label: "Department",
    group: "Organization",
    codePrefix: "DEP",
    defaultItems: [
      { name: "Commercial & Leasing", code: "LEAS", description: "Tenant acquisition & contracts" },
      { name: "Finance & Accounts", code: "FIN", description: "Treasury, GL, AP & AR" },
      { name: "Facility Operations & Maintenance", code: "MAINT", description: "Engineering, PPM & tickets" },
      { name: "Human Resources & Talent", code: "HR", description: "Personnel, payroll, & culture" },
      { name: "Legal & Compliance", code: "LEG", description: "Regulatory, permits, contracts" },
      { name: "Procurement & Supply Chain", code: "PROC", description: "Vendor sourcing & materials" },
    ],
  },
  {
    key: "sub_departments",
    label: "Sub Department",
    group: "Organization",
    codePrefix: "SDEP",
    defaultItems: [
      { name: "Residential Leasing", code: "LEAS-RES", description: "Apartment & Villa Leases" },
      { name: "Commercial Leasing", code: "LEAS-COM", description: "Retail & Office Leases" },
      { name: "MEP Engineering", code: "MAINT-MEP", description: "Mechanical, Electrical, Plumbing" },
      { name: "HVAC & Chiller Maintenance", code: "MAINT-HVAC", description: "Cooling & Ventilation" },
      { name: "Payroll & Compensation", code: "HR-PAY", description: "Salary disbursement & benefits" },
      { name: "Accounts Payable (AP)", code: "FIN-AP", description: "Vendor invoices & disbursements" },
    ],
  },
  {
    key: "designations",
    label: "Designation Master",
    group: "HR & Workforce",
    codePrefix: "DSG",
    defaultItems: [
      { name: "Managing Director / CEO", code: "CEO", description: "Executive Board" },
      { name: "Senior Property Manager", code: "SPM", description: "Asset & Site Supervision" },
      { name: "Leasing Executive", code: "LEX", description: "Tenant Onboarding" },
      { name: "Chief Financial Officer", code: "CFO", description: "Financial Oversight" },
      { name: "Senior Accountant", code: "SAC", description: "General Ledger & Audit" },
      { name: "Chief MEP Engineer", code: "MEP-ENG", description: "Technical Facility Lead" },
      { name: "Facility Technician", code: "TECH", description: "On-ground Maintenance" },
      { name: "HR Manager", code: "HRM", description: "Human Resource Head" },
    ],
  },
  {
    key: "grades",
    label: "Grade Master",
    group: "HR & Workforce",
    codePrefix: "GRD",
    defaultItems: [
      { name: "Grade E (Executive / C-Suite)", code: "GRD-E", description: "Top Leadership Level" },
      { name: "Grade M (Management / Heads)", code: "GRD-M", description: "Departmental Managers" },
      { name: "Grade S (Senior Specialists)", code: "GRD-S", description: "Senior Engineers & Analysts" },
      { name: "Grade A (Associates & Officers)", code: "GRD-A", description: "Operational Staff" },
      { name: "Grade T (Technicians & Field)", code: "GRD-T", description: "Field Technical Staff" },
    ],
  },
  {
    key: "employment_types",
    label: "Employment Type",
    group: "HR & Workforce",
    codePrefix: "EMT",
    defaultItems: [
      { name: "Permanent / Full-Time", code: "PERM", description: "Standard regular employment" },
      { name: "Probationary", code: "PROB", description: "Initial evaluation period" },
      { name: "Fixed-Term Contract", code: "CONT", description: "Time-bound contract" },
      { name: "Consultant / Advisor", code: "CONS", description: "Professional advisor" },
      { name: "Part-Time / Intern", code: "PART", description: "Flexible / internship" },
    ],
  },
  {
    key: "contract_types",
    label: "Contract Type",
    group: "HR & Workforce",
    codePrefix: "CNT",
    defaultItems: [
      { name: "Unlimited / Open-Ended (Standard)", code: "UNLTD", description: "Permanent Labor Contract" },
      { name: "Fixed 1-Year Renewable", code: "FX1", description: "Annual Renewable Contract" },
      { name: "Fixed 2-Year Term", code: "FX2", description: "Standard 24-Month Contract" },
      { name: "Secondment / Deputation", code: "SECD", description: "Inter-entity transfer contract" },
    ],
  },
  {
    key: "recruitment_reasons",
    label: "Reason For Recruitment",
    group: "HR & Workforce",
    codePrefix: "REC",
    defaultItems: [
      { name: "Business Expansion & New Property Handover", code: "EXPAND", description: "New property phase" },
      { name: "Backfill / Employee Resignation Replacement", code: "REPLACE", description: "Vacancy replacement" },
      { name: "Specialized Technical Competency Requirement", code: "SPEC", description: "Niche technical skill" },
      { name: "Workload Surge / Seasonal Operations", code: "SURGE", description: "Operational demand" },
    ],
  },
  {
    key: "notice_periods",
    label: "Notice Period Master",
    group: "HR & Workforce",
    codePrefix: "NOT",
    defaultItems: [
      { name: "30 Days (Standard Staff)", code: "NP-30", description: "1-Month standard notice" },
      { name: "60 Days (Management / Key Roles)", code: "NP-60", description: "2-Month management notice" },
      { name: "90 Days (C-Suite / Executive)", code: "NP-90", description: "3-Month executive notice" },
      { name: "15 Days (Probation Period Exit)", code: "NP-15", description: "Probation notice period" },
    ],
  },
  {
    key: "kt_masters",
    label: "Knowledge Transfer (KT) Master",
    group: "HR & Workforce",
    codePrefix: "KT",
    defaultItems: [
      { name: "Codebase & System Administration Handover", code: "KT-IT", description: "IT credentials and architecture" },
      { name: "Property Keys & Access Card Handover", code: "KT-KEYS", description: "Physical access clearance" },
      { name: "Active Tenant Lease Accounts & Collections", code: "KT-LEAS", description: "Leasing pipeline handover" },
      { name: "Vendor Contracts & In-Progress Work Orders", code: "KT-MAINT", description: "Maintenance projects status" },
    ],
  },

  // ── Locations ──
  {
    key: "countries",
    label: "Country Master",
    group: "Location",
    codePrefix: "CTY",
    defaultItems: [
      { name: "Qatar", code: "QA", description: "State of Qatar" },
      { name: "India", code: "IN", description: "Republic of India" },
      { name: "United Arab Emirates", code: "AE", description: "UAE" },
      { name: "Saudi Arabia", code: "SA", description: "KSA" },
      { name: "United Kingdom", code: "GB", description: "UK" },
      { name: "Philippines", code: "PH", description: "Republic of the Philippines" },
    ],
  },
  {
    key: "states",
    label: "State / Governorate Master",
    group: "Location",
    codePrefix: "ST",
    defaultItems: [
      { name: "Doha Municipality", code: "QA-DA", description: "Capital Governorate" },
      { name: "Al Rayyan", code: "QA-RA", description: "Western Municipality" },
      { name: "Al Daayen / Lusail", code: "QA-ZA", description: "Lusail & Waterfront" },
      { name: "Al Wakrah", code: "QA-WA", description: "Southern Hub" },
      { name: "Delhi NCR", code: "IN-DL", description: "National Capital Region" },
      { name: "Haryana (Gurugram)", code: "IN-HR", description: "Millennium City Tech Hub" },
    ],
  },
  {
    key: "cities",
    label: "City Master",
    group: "Location",
    codePrefix: "CIT",
    defaultItems: [
      { name: "Doha", code: "DOH", description: "Doha Metropolitan" },
      { name: "Lusail", code: "LSL", description: "Lusail Smart City" },
      { name: "The Pearl-Qatar", code: "PRL", description: "Island Community" },
      { name: "West Bay", code: "WBY", description: "Diplomatic & Financial District" },
      { name: "New Delhi", code: "DEL", description: "New Delhi Central" },
      { name: "Gurugram", code: "GUR", description: "Cyber City" },
    ],
  },
  {
    key: "regions",
    label: "Region Master",
    group: "Location",
    codePrefix: "REG",
    defaultItems: [
      { name: "Middle East & GCC", code: "GCC", description: "Gulf Region" },
      { name: "South Asia", code: "SA", description: "Indian Subcontinent" },
      { name: "Europe & Levant", code: "EUR", description: "International Operations" },
    ],
  },

  // ── Payroll & Finance ──
  {
    key: "financial_years",
    label: "Financial Year",
    group: "Payroll & Finance",
    codePrefix: "FY",
    defaultItems: [
      { name: "2026-2027 (Current Active)", code: "FY26-27", description: "01 Apr 2026 - 31 Mar 2027" },
      { name: "2025-2026 (Audited Past)", code: "FY25-26", description: "01 Apr 2025 - 31 Mar 2026" },
      { name: "2027-2028 (Projected)", code: "FY27-28", description: "01 Apr 2027 - 31 Mar 2028" },
    ],
  },
  {
    key: "currencies",
    label: "Currency Master",
    group: "Payroll & Finance",
    codePrefix: "CUR",
    defaultItems: [
      { name: "Qatari Riyal (QAR)", code: "QAR", description: "Base Operational Currency (1 USD = 3.64 QAR)" },
      { name: "Indian Rupee (INR)", code: "INR", description: "Regional Tech Entity Currency" },
      { name: "US Dollar (USD)", code: "USD", description: "International Contracts" },
      { name: "UAE Dirham (AED)", code: "AED", description: "GCC Regional Settlements" },
    ],
  },
  {
    key: "banks",
    label: "Bank Master",
    group: "Payroll & Finance",
    codePrefix: "BNK",
    defaultItems: [
      { name: "Qatar National Bank (QNB)", code: "QNBA", description: "Primary Operating Bank" },
      { name: "Commercial Bank of Qatar (CBQ)", code: "CBQA", description: "Collection & Escrow Bank" },
      { name: "Doha Bank", code: "DHBK", description: "Payroll Disbursement Partner" },
      { name: "Qatar Islamic Bank (QIB)", code: "QISB", description: "Islamic Banking Services" },
      { name: "HDFC Bank India", code: "HDFC", description: "India Corporate Bank" },
    ],
  },
  {
    key: "salary_components",
    label: "Salary Components",
    group: "Payroll & Finance",
    codePrefix: "SAL-COMP",
    defaultItems: [
      { name: "Basic Salary", code: "BASIC", description: "Fixed Base Pay (Earning)" },
      { name: "House Rent Allowance (HRA)", code: "HRA", description: "Monthly Housing Allowance" },
      { name: "Transport Allowance (TRA)", code: "TRA", description: "Conveyance & Travel" },
      { name: "Special Operational Allowance", code: "SPEC_ALW", description: "Performance Fixed Allowance" },
      { name: "Mobile & Utility Allowance", code: "MOB_ALW", description: "Communication reimbursement" },
      { name: "Overtime (OT) Pay", code: "OT_PAY", description: "Calculated Hourly Overtime" },
      { name: "Discretionary Bonus", code: "BONUS", description: "Quarterly / Annual KPI Incentive" },
    ],
  },
  {
    key: "statutory_components",
    label: "Statutory & Deductions",
    group: "Payroll & Finance",
    codePrefix: "STAT",
    defaultItems: [
      { name: "End-of-Service Gratuity Accrual", code: "GRAT", description: "21 Days basic pay per year of service" },
      { name: "Social Insurance / Pension Contribution", code: "SI", description: "Statutory national social insurance" },
      { name: "Disciplinary Penalty / Fine Deduction", code: "FINE", description: "Authorized HR disciplinary fine" },
      { name: "Staff Advance / Loan Deduction", code: "LOAN_DED", description: "Monthly EMI recovery" },
    ],
  },
  {
    key: "salary_templates",
    label: "Salary Structure Templates",
    group: "Payroll & Finance",
    codePrefix: "SAL-TMP",
    defaultItems: [
      { name: "Standard Executive Package (60% Basic + 30% HRA + 10% TRA)", code: "TMPL-EXEC", description: "Executive grade breakdown" },
      { name: "Management Structure (55% Basic + 35% HRA + 10% TRA)", code: "TMPL-MGT", description: "Department heads & managers" },
      { name: "Operational & Technical Package (50% Basic + 35% HRA + 15% TRA)", code: "TMPL-TECH", description: "Field engineers and technical staff" },
    ],
  },
  {
    key: "tax_slabs",
    label: "Tax Slabs & Exemption Rules",
    group: "Payroll & Finance",
    codePrefix: "TAX",
    defaultItems: [
      { name: "Qatar Exemption (0% Personal Income Tax)", code: "QA-TAX-FREE", description: "No personal income tax under Qatar Law" },
      { name: "Standard Foreign Remittance Reporting", code: "INT-REMIT", description: "Cross-border tax declaration compliance" },
    ],
  },

  // ── System & Service ──
  {
    key: "shifts",
    label: "Work Shifts Master",
    group: "HR & Workforce",
    codePrefix: "SHF",
    defaultItems: [
      { name: "General Day Shift (08:00 AM - 05:00 PM)", code: "SHF-DAY", description: "Standard Office Hours, 60m break" },
      { name: "Property Site Morning Shift (07:00 AM - 04:00 PM)", code: "SHF-MORN", description: "Site operations & maintenance" },
      { name: "Facility Night Shift (10:00 PM - 07:00 AM)", code: "SHF-NIGHT", description: "Overnight facility security & chiller monitor" },
    ],
  },
  {
    key: "holidays",
    label: "Public Holidays Calendar",
    group: "HR & Workforce",
    codePrefix: "HOL",
    defaultItems: [
      { name: "Qatar National Day (18 December)", code: "HOL-QND", description: "National official holiday" },
      { name: "Qatar National Sports Day (2nd Tuesday February)", code: "HOL-QSD", description: "Sports holiday" },
      { name: "Eid Al-Fitr (3 Days)", code: "HOL-EID-FITR", description: "Religious festival" },
      { name: "Eid Al-Adha (4 Days)", code: "HOL-EID-ADHA", description: "Religious feast" },
      { name: "New Year's Day (01 January)", code: "HOL-NY", description: "Public holiday" },
    ],
  },
  {
    key: "week_offs",
    label: "Week Off Configuration",
    group: "HR & Workforce",
    codePrefix: "WO",
    defaultItems: [
      { name: "Friday & Saturday (Standard Corporate)", code: "WO-FRI-SAT", description: "2 Days weekly off for corporate office" },
      { name: "Friday Only (Rotational Site Roster)", code: "WO-FRI", description: "1 Day off with compensatory off option" },
    ],
  },
  {
    key: "kpa_masters",
    label: "KPA & Performance Goals",
    group: "HR & Workforce",
    codePrefix: "KPA",
    defaultItems: [
      { name: "Property Occupancy & Lease Renewal Rate (>95%)", code: "KPA-OCCUP", description: "Leasing portfolio target" },
      { name: "Service Ticket Resolution SLA Compliance (>98%)", code: "KPA-SLA", description: "Maintenance ticket timeliness" },
      { name: "Rent Collection & Arrear Recovery (>99%)", code: "KPA-COLL", description: "Financial cash collection" },
      { name: "Tenant Satisfaction & Net Promoter Score (>4.5/5)", code: "KPA-CSAT", description: "Customer satisfaction score" },
    ],
  },
  {
    key: "appraisal_intervals",
    label: "Appraisal Intervals",
    group: "HR & Workforce",
    codePrefix: "APP-INT",
    defaultItems: [
      { name: "Annual Performance Appraisal (12 Months)", code: "INT-ANNUAL", description: "Full year comprehensive evaluation" },
      { name: "Mid-Year Milestone Review (6 Months)", code: "INT-MID", description: "Semi-annual progress check" },
      { name: "Quarterly Objective & Key Results (Q1-Q4)", code: "INT-QTR", description: "Quarterly milestone check" },
      { name: "Probation Clearance Review (90 Days)", code: "INT-PROB", description: "Confirmation appraisal" },
    ],
  },
  {
    key: "device_user_ids",
    label: "Device UserID / Biometric Link",
    group: "System & Service",
    codePrefix: "DEV-UID",
    defaultItems: [
      { name: "Biometric Face Recognition Machine - Doha HQ", code: "DEV-HQ-01", description: "IP: 192.168.1.120 - Terminal 1" },
      { name: "Fingerprint Scanner - West Bay Site Office", code: "DEV-WB-02", description: "IP: 192.168.2.145 - Terminal 2" },
      { name: "Mobile Geofence Attendance Punch App", code: "DEV-APP", description: "GPS verified mobile punch" },
    ],
  },
  {
    key: "ticket_categories",
    label: "Ticket Category",
    group: "System & Service",
    codePrefix: "TCAT",
    defaultItems: [
      { name: "HR & Salary Certificate Requests", code: "TCAT-HR", description: "Letters, embassy NOC, experience" },
      { name: "IT & System Access Support", code: "TCAT-IT", description: "Software credentials and hardware" },
      { name: "Payroll & Reimbursement Discrepancy", code: "TCAT-PAY", description: "Salary & expense inquiries" },
      { name: "Facility & Workplace Assets", code: "TCAT-FAC", description: "Desk, chair, locker allocation" },
    ],
  },
  {
    key: "complaint_types",
    label: "Complaint Type",
    group: "System & Service",
    codePrefix: "CMPL",
    defaultItems: [
      { name: "Workplace Harassment & Ethics Grievance", code: "CMPL-ETHICS", description: "Confidential HR review" },
      { name: "Shift & Overtime Dispute", code: "CMPL-SHIFT", description: "Roster discrepancy" },
      { name: "Managerial Feedback / Dispute", code: "CMPL-MGT", description: "Mediation process" },
    ],
  },
  {
    key: "course_categories",
    label: "Course & Learning Category",
    group: "System & Service",
    codePrefix: "CRS",
    defaultItems: [
      { name: "Property Management & Real Estate Law", code: "CRS-LAW", description: "Qatar Tenancy Law & Compliance" },
      { name: "Facility Health & Safety (OSHA / First Aid)", code: "CRS-HSE", description: "Building fire and occupational safety" },
      { name: "Customer Experience & Tenant Relations", code: "CRS-CSAT", description: "Hospitality & communication" },
      { name: "ERP & Financial Accounting Systems", code: "CRS-ERP", description: "Software workflow mastery" },
    ],
  },
  {
    key: "expense_types",
    label: "Type Of Expense",
    group: "System & Service",
    codePrefix: "EXP",
    defaultItems: [
      { name: "Local Travel & Inspection Fuel (Travel Expense)", code: "EXP-TRAV", description: "Property inspection & tenant visits" },
      { name: "Official Food & Refreshments (Reimbursement Expense)", code: "EXP-FOOD", description: "Client meetings & operational lunch" },
      { name: "Office Supplies & Urgent Spares (Other Expense)", code: "EXP-MISC", description: "Emergency on-site petty purchases" },
      { name: "Visa & Government Labor Attestation Fees", code: "EXP-GOV", description: "Official ministry fees" },
    ],
  },
  {
    key: "travel_allowances",
    label: "Travel Allowance & Per Diem",
    group: "System & Service",
    codePrefix: "TA",
    defaultItems: [
      { name: "Per Diem - Local Site Inspection (150 QAR/Day)", code: "TA-LOCAL", description: "Local daily allowance" },
      { name: "Per Diem - International GCC Travel (500 QAR/Day)", code: "TA-GCC", description: "GCC travel rate" },
      { name: "Mileage Allowance - Personal Vehicle (1.2 QAR/KM)", code: "TA-KM", description: "Fuel & vehicle wear rate" },
    ],
  },
];

const MASTER_CACHE_KEY_PREFIX = "zyno_hrms_master_cache_";

export const HrmsMastersApi = {
  // Get all items for a category
  async getMasterItems(categoryKey: MasterCategoryKey): Promise<MasterItem[]> {
    const config = MASTER_CATEGORIES_CONFIG.find((c) => c.key === categoryKey);
    const localKey = `${MASTER_CACHE_KEY_PREFIX}${categoryKey}`;

    try {
      const stored = localStorage.getItem(localKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not read local master cache:", e);
    }

    // Default seeded data
    const defaults: MasterItem[] = (config?.defaultItems || []).map((item, idx) => ({
      id: `${categoryKey}-${idx + 1}`,
      name: item.name,
      code: item.code || `${config?.codePrefix || "M"}-${idx + 1}`,
      description: item.description,
      is_active: true,
    }));

    try {
      localStorage.setItem(localKey, JSON.stringify(defaults));
    } catch (e) {
      console.warn("Could not seed local master cache:", e);
    }

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
    localStorage.setItem(`${MASTER_CACHE_KEY_PREFIX}${categoryKey}`, JSON.stringify(updated));
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
    localStorage.setItem(`${MASTER_CACHE_KEY_PREFIX}${categoryKey}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("hrms_masters_updated", { detail: { categoryKey, items: updated } }));
    return updated.find((i) => i.id === id) || null;
  },

  async deleteMasterItem(categoryKey: MasterCategoryKey, id: string): Promise<boolean> {
    const current = await this.getMasterItems(categoryKey);
    const updated = current.filter((i) => i.id !== id);
    localStorage.setItem(`${MASTER_CACHE_KEY_PREFIX}${categoryKey}`, JSON.stringify(updated));
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
    };
  },
};
