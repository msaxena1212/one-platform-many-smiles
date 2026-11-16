/**
 * HRMS master defaults. Source: the approved HRMS Master list (hrms_default_masters.xlsx).
 * These are the only default items; anything not listed here is not seeded.
 */
export type HrmsMasterDefault = { name: string; code?: string; description?: string; roles?: string[] };

export const HRMS_MASTER_DEFAULTS: Record<string, HrmsMasterDefault[]> = {
  companies: [
    { name: "Al Ameen Property Holdings W.L.L", code: "AAPH", description: "Commercial & Residential Assets Division" },
  ],
  branches: [
    { name: "Al Ameen Real Estate Head Office", code: "AMEEN-HQ", description: "Central Corporate Head Office & Employee Payroll / Overhead Expenses" },
    { name: "Doha Head Office (D-Ring Road)", code: "DOH-HQ", description: "Central Corporate & Leasing Management HQ" },
    { name: "Old Salata Site Operations Hub", code: "SLT-01", description: "Old Salata & Central Doha Properties" },
    { name: "Al Wakra Operations Center", code: "WKR-01", description: "Wakra Residential & Commercial Portfolio" },
    { name: "Mansoura Facility Office", code: "MNS-01", description: "Mansoura Community & Maintenance Desk" },
    { name: "Musheireb Support Center", code: "MSH-01", description: "Downtown Residential Asset Management" },
    { name: "Bin Omran Site Office", code: "BOM-01", description: "Bin Omran Portfolio Operations" },
  ],
  entities: [
    { name: "AL-AMEEN-ESTATES-WLL", code: "AMEEN-EST", description: "Real Estate Asset Holding SPV" },
  ],
  business_units: [
    { name: "Residential Leasing & Tenancy", code: "BU-RES", description: "Residential Apartment & Villa Operations" },
    { name: "Commercial & Retail Assets", code: "BU-COM", description: "Commercial Spaces, Offices & Retail Units" },
    { name: "Facility Maintenance & MEP", code: "BU-FM", description: "Planned Preventive & Reactive Maintenance" },
    { name: "Corporate & Shared Services", code: "BU-CORP", description: "Finance, HR, IT & Procurement" },
  ],
  departments: [
    { name: "Management", code: "MGMT", roles: ["Admin", "Executive"] },
    { name: "Finance & Accounts", code: "FIN", roles: ["Finance"] },
    { name: "HR & Administration", code: "HR", roles: ["HR"] },
    { name: "Sales & Marketing", code: "SALES", roles: ["Sales"] },
    { name: "Operations", code: "OPS", roles: ["Operations"] },
    { name: "Procurement", code: "PROC", roles: ["Procurement"] },
    { name: "Information Technology", code: "IT", roles: ["IT"] },
    { name: "Customer Service", code: "CS", roles: ["Customer Service"] },
    { name: "Maintenance / Technical", code: "TECH", roles: ["Maintenance"] },
    { name: "Warehouse", code: "WH", roles: ["Operations"] },
  ],
  sub_departments: [
    { name: "Residential Leasing", code: "LEAS-RES", description: "Apartment & Villa Leases" },
    { name: "Commercial Leasing", code: "LEAS-COM", description: "Retail & Office Leases" },
    { name: "MEP Engineering", code: "MAINT-MEP", description: "Mechanical, Electrical, Plumbing" },
    { name: "HVAC & Chiller Maintenance", code: "MAINT-HVAC", description: "Cooling & Ventilation" },
    { name: "Payroll & Compensation", code: "HR-PAY", description: "Salary disbursement & benefits" },
    { name: "Accounts Payable (AP)", code: "FIN-AP", description: "Vendor invoices & disbursements" },
  ],
  designations: [
    { name: "Director", code: "DIR", roles: ["Executive", "Admin"] },
    { name: "General Manager", code: "GM", roles: ["Executive", "Manager"] },
    { name: "Manager", code: "MGR", roles: ["Manager"] },
    { name: "Assistant Manager", code: "AM", roles: ["Manager"] },
    { name: "Accountant", code: "ACC", roles: ["Finance"] },
    { name: "HR Executive", code: "HR-EXEC", roles: ["HR"] },
    { name: "Admin Executive", code: "ADMIN-EXEC", roles: ["Admin"] },
    { name: "Sales Executive", code: "SALES-EXEC", roles: ["Sales"] },
    { name: "Operations Executive", code: "OPS-EXEC", roles: ["Operations"] },
    { name: "Procurement Executive", code: "PROC-EXEC", roles: ["Procurement"] },
    { name: "IT Support", code: "IT-SUPPORT", roles: ["IT"] },
    { name: "Customer Service Executive", code: "CS-EXEC", roles: ["Customer Service"] },
    { name: "Supervisor", code: "SUP", roles: ["Operations", "Manager"] },
    { name: "Technician", code: "TECH", roles: ["Maintenance"] },
    { name: "Driver", code: "DRIVER", roles: ["Operations"] },
    { name: "Office Assistant", code: "OFFICE-ASST", roles: ["Admin"] },
  ],
  grades: [
    { name: "Grade E (Executive / C-Suite)", code: "GRD-E", description: "Top Leadership Level" },
    { name: "Grade M (Management / Heads)", code: "GRD-M", description: "Departmental Managers" },
    { name: "Grade S (Senior Specialists)", code: "GRD-S", description: "Senior Engineers & Analysts" },
    { name: "Grade A (Associates & Officers)", code: "GRD-A", description: "Operational Staff" },
    { name: "Grade T (Technicians & Field)", code: "GRD-T", description: "Field Technical Staff" },
  ],
  employment_types: [
    { name: "Permanent / Full-Time", code: "PERM", description: "Standard regular employment" },
    { name: "Probationary", code: "PROB", description: "Initial evaluation period" },
    { name: "Fixed-Term Contract", code: "CONT", description: "Time-bound contract" },
    { name: "Consultant / Advisor", code: "CONS", description: "Professional advisor" },
    { name: "Part-Time / Intern", code: "PART", description: "Flexible / internship" },
  ],
  genders: [
    { name: "Male", code: "M", description: "Male" },
    { name: "Female", code: "F", description: "Female" },
    { name: "Other", code: "O", description: "Other" },
  ],
  employee_statuses: [
    { name: "Active", code: "ACT", description: "Active employee in service" },
    { name: "Probation", code: "PROB", description: "Under probationary assessment" },
    { name: "On Notice", code: "NOT", description: "Serving notice period" },
    { name: "On Leave", code: "LVE", description: "Extended approved leave" },
    { name: "Suspended", code: "SUSP", description: "Temporarily suspended" },
    { name: "Resigned", code: "RES", description: "Resigned from service" },
    { name: "Terminated", code: "TERM", description: "Service terminated" },
  ],
  contract_types: [
    { name: "Unlimited / Open-Ended (Standard)", code: "UNLTD", description: "Permanent Labor Contract" },
    { name: "Fixed 1-Year Renewable", code: "FX1", description: "Annual Renewable Contract" },
    { name: "Fixed 2-Year Term", code: "FX2", description: "Standard 24-Month Contract" },
    { name: "Secondment / Deputation", code: "SECD", description: "Inter-entity transfer contract" },
  ],
  leave_types: [
    { name: "Annual Leave (30 Calendar Days)", code: "AL", description: "Standard Paid Annual Vacation under Qatar Labor Law" },
    { name: "Sick Leave (Fully Paid 14 Days)", code: "SL", description: "Certified Medical Leave with Primary Health Centre slip" },
    { name: "Casual & Emergency Leave (7 Days)", code: "CL", description: "Short urgent leaves for family or personal needs" },
    { name: "Maternity Leave (50 Paid Days)", code: "ML", description: "Statutory maternity leave for female employees" },
    { name: "Hajj Pilgrimage Leave (20 Days Unpaid)", code: "HAJJ", description: "Once in service pilgrimage leave" },
    { name: "Compensatory Off / Duty Leave", code: "COMP-OFF", description: "Granted in lieu of weekend or holiday duty" },
  ],
  document_types: [
    { name: "Qatar ID (QID / Residence Card)", code: "DOC-QID", description: "Official Ministry of Interior Civil ID" },
    { name: "Passport & Bio Page", code: "DOC-PPT", description: "International travel passport copy" },
    { name: "Ministry Attested Labor Contract", code: "DOC-MOL", description: "ADLSA / Labor department authenticated contract" },
    { name: "Academic & Degree Certificate", code: "DOC-EDU", description: "Higher education qualification document" },
    { name: "Qatar Driving License", code: "DOC-DL", description: "Valid Qatar Traffic Department license" },
    { name: "Police Clearance Certificate (PCC)", code: "DOC-PCC", description: "Good conduct background clearance" },
    { name: "Health Card & Medical Commission Fit", code: "DOC-MED", description: "Hamad Medical / Public Health certification" },
  ],
  recruitment_reasons: [
    { name: "Business Expansion & New Property Handover", code: "EXPAND", description: "New property phase" },
    { name: "Backfill / Employee Resignation Replacement", code: "REPLACE", description: "Vacancy replacement" },
    { name: "Specialized Technical Competency Requirement", code: "SPEC", description: "Niche technical skill" },
    { name: "Workload Surge / Seasonal Operations", code: "SURGE", description: "Operational demand" },
  ],
  notice_periods: [
    { name: "30 Days (Standard Staff)", code: "NP-30", description: "1-Month standard notice" },
    { name: "60 Days (Management / Key Roles)", code: "NP-60", description: "2-Month management notice" },
    { name: "90 Days (C-Suite / Executive)", code: "NP-90", description: "3-Month executive notice" },
    { name: "15 Days (Probation Period Exit)", code: "NP-15", description: "Probation notice period" },
  ],
  kt_masters: [
    { name: "Codebase & System Administration Handover", code: "KT-IT", description: "IT credentials and architecture" },
    { name: "Property Keys & Access Card Handover", code: "KT-KEYS", description: "Physical access clearance" },
    { name: "Active Tenant Lease Accounts & Collections", code: "KT-LEAS", description: "Leasing pipeline handover" },
    { name: "Vendor Contracts & In-Progress Work Orders", code: "KT-MAINT", description: "Maintenance projects status" },
  ],
  countries: [
    { name: "Qatar", code: "QA", description: "State of Qatar" },
    { name: "India", code: "IN", description: "Republic of India" },
    { name: "United Arab Emirates", code: "AE", description: "UAE" },
    { name: "Saudi Arabia", code: "SA", description: "KSA" },
    { name: "United Kingdom", code: "GB", description: "UK" },
    { name: "Philippines", code: "PH", description: "Republic of the Philippines" },
  ],
  states: [
    { name: "Doha Municipality", code: "QA-DA", description: "Capital Governorate" },
    { name: "Al Rayyan", code: "QA-RA", description: "Western Municipality" },
    { name: "Al Daayen / Lusail", code: "QA-ZA", description: "Lusail & Waterfront" },
    { name: "Al Wakrah", code: "QA-WA", description: "Southern Hub" },
  ],
  cities: [
    { name: "Doha", code: "DOH", description: "Doha Metropolitan" },
    { name: "Lusail", code: "LSL", description: "Lusail Smart City" },
    { name: "The Pearl-Qatar", code: "PRL", description: "Island Community" },
    { name: "West Bay", code: "WBY", description: "Diplomatic & Financial District" },
  ],
  regions: [
    { name: "Middle East & GCC", code: "GCC", description: "Gulf Region" },
    { name: "South Asia", code: "SA", description: "Indian Subcontinent" },
    { name: "Europe & Levant", code: "EUR", description: "International Operations" },
  ],
  financial_years: [
    { name: "2026-2027 (Current Active)", code: "FY26-27", description: "01 Apr 2026 - 31 Mar 2027" },
    { name: "2025-2026 (Audited Past)", code: "FY25-26", description: "01 Apr 2025 - 31 Mar 2026" },
    { name: "2027-2028 (Projected)", code: "FY27-28", description: "01 Apr 2027 - 31 Mar 2028" },
  ],
  currencies: [
    { name: "Qatari Riyal (QAR)", code: "QAR", description: "Base Operational Currency (1 USD = 3.64 QAR)" },
    { name: "US Dollar (USD)", code: "USD", description: "International Contracts" },
    { name: "UAE Dirham (AED)", code: "AED", description: "GCC Regional Settlements" },
  ],
  banks: [
    { name: "Qatar National Bank (QNB)", code: "QNBA", description: "Primary Operating Bank" },
    { name: "Commercial Bank of Qatar (CBQ)", code: "CBQA", description: "Collection & Escrow Bank" },
    { name: "Doha Bank", code: "DHBK", description: "Payroll Disbursement Partner" },
    { name: "Qatar Islamic Bank (QIB)", code: "QISB", description: "Islamic Banking Services" },
  ],
  salary_components: [
    { name: "Basic Salary", code: "BASIC", description: "Fixed Base Pay (Earning)" },
    { name: "House Rent Allowance (HRA)", code: "HRA", description: "Monthly Housing Allowance" },
    { name: "Transport Allowance (TRA)", code: "TRA", description: "Conveyance & Travel" },
    { name: "Special Operational Allowance", code: "SPEC_ALW", description: "Performance Fixed Allowance" },
    { name: "Mobile & Utility Allowance", code: "MOB_ALW", description: "Communication reimbursement" },
    { name: "Overtime (OT) Pay", code: "OT_PAY", description: "Calculated Hourly Overtime" },
    { name: "Discretionary Bonus", code: "BONUS", description: "Quarterly / Annual KPI Incentive" },
  ],
  statutory_components: [
    { name: "End-of-Service Gratuity Accrual", code: "GRAT", description: "21 Days basic pay per year of service" },
    { name: "Social Insurance / Pension Contribution", code: "SI", description: "Statutory national social insurance" },
    { name: "Disciplinary Penalty / Fine Deduction", code: "FINE", description: "Authorized HR disciplinary fine" },
    { name: "Staff Advance / Loan Deduction", code: "LOAN_DED", description: "Monthly EMI recovery" },
  ],
  salary_templates: [
    { name: "Standard Executive Package (60% Basic + 30% HRA + 10% TRA)", code: "TMPL-EXEC", description: "Executive grade breakdown" },
    { name: "Management Structure (55% Basic + 35% HRA + 10% TRA)", code: "TMPL-MGT", description: "Department heads & managers" },
    { name: "Operational & Technical Package (50% Basic + 35% HRA + 15% TRA)", code: "TMPL-TECH", description: "Field engineers and technical staff" },
  ],
  tax_slabs: [
    { name: "Qatar Exemption (0% Personal Income Tax)", code: "QA-TAX-FREE", description: "100% Tax-Free Personal Income under State of Qatar Law" },
    { name: "Standard Foreign Remittance Reporting", code: "INT-REMIT", description: "Cross-border compliance documentation" },
  ],
  loan_types: [
    { name: "Annual Housing Advance Loan", code: "LN-HOUSE", description: "Advance for annual house rental cheques" },
    { name: "Emergency Medical & Family Loan", code: "LN-EMERG", description: "Zero-interest staff emergency assistance" },
    { name: "Annual Air Ticket Advance", code: "LN-TICKET", description: "Advance against annual leave flight entitlement" },
    { name: "Vehicle / Transportation Advance", code: "LN-VEH", description: "Transportation acquisition loan" },
  ],
  shifts: [
    { name: "General Day Shift (08:00 AM - 05:00 PM)", code: "SHF-DAY", description: "Standard Office Hours, 60m break" },
    { name: "Property Site Morning Shift (07:00 AM - 04:00 PM)", code: "SHF-MORN", description: "Site operations & maintenance" },
    { name: "Facility Night Shift (10:00 PM - 07:00 AM)", code: "SHF-NIGHT", description: "Overnight facility security & chiller monitor" },
  ],
  holidays: [
    { name: "Qatar National Day (18 December)", code: "HOL-QND", description: "National official holiday" },
    { name: "Qatar National Sports Day (2nd Tuesday February)", code: "HOL-QSD", description: "Sports holiday" },
    { name: "Eid Al-Fitr (3 Days)", code: "HOL-EID-FITR", description: "Religious festival" },
    { name: "Eid Al-Adha (4 Days)", code: "HOL-EID-ADHA", description: "Religious feast" },
    { name: "New Year's Day (01 January)", code: "HOL-NY", description: "Public holiday" },
  ],
  week_offs: [
    { name: "Friday & Saturday (Standard Corporate)", code: "WO-FRI-SAT", description: "2 Days weekly off for corporate office" },
    { name: "Friday Only (Rotational Site Roster)", code: "WO-FRI", description: "1 Day off with compensatory off option" },
  ],
  kpa_masters: [
    { name: "Property Occupancy & Lease Renewal Rate (>95%)", code: "KPA-OCCUP", description: "Leasing portfolio target" },
    { name: "Service Ticket Resolution SLA Compliance (>98%)", code: "KPA-SLA", description: "Maintenance ticket timeliness" },
    { name: "Rent Collection & Arrear Recovery (>99%)", code: "KPA-COLL", description: "Financial cash collection" },
    { name: "Tenant Satisfaction & Net Promoter Score (>4.5/5)", code: "KPA-CSAT", description: "Customer satisfaction score" },
  ],
  appraisal_intervals: [
    { name: "Annual Performance Appraisal (12 Months)", code: "INT-ANNUAL", description: "Full year comprehensive evaluation" },
    { name: "Mid-Year Milestone Review (6 Months)", code: "INT-MID", description: "Semi-annual progress check" },
    { name: "Quarterly Objective & Key Results (Q1-Q4)", code: "INT-QTR", description: "Quarterly milestone check" },
    { name: "Probation Clearance Review (90 Days)", code: "INT-PROB", description: "Confirmation appraisal" },
  ],
  device_user_ids: [
    { name: "Biometric Face Recognition Machine - Doha HQ", code: "DEV-HQ-01", description: "IP: 192.168.1.120 - Terminal 1" },
    { name: "Fingerprint Scanner - West Bay Site Office", code: "DEV-WB-02", description: "IP: 192.168.2.145 - Terminal 2" },
    { name: "Mobile Geofence Attendance Punch App", code: "DEV-APP", description: "GPS verified mobile punch" },
  ],
  ticket_categories: [
    { name: "HR & Salary Certificate Requests", code: "TCAT-HR", description: "Letters, embassy NOC, experience" },
    { name: "IT & System Access Support", code: "TCAT-IT", description: "Software credentials and hardware" },
    { name: "Payroll & Reimbursement Discrepancy", code: "TCAT-PAY", description: "Salary & expense inquiries" },
    { name: "Facility & Workplace Assets", code: "TCAT-FAC", description: "Desk, chair, locker allocation" },
  ],
  complaint_types: [
    { name: "Workplace Harassment & Ethics Grievance", code: "CMPL-ETHICS", description: "Confidential HR review" },
    { name: "Shift & Overtime Dispute", code: "CMPL-SHIFT", description: "Roster discrepancy" },
    { name: "Managerial Feedback / Dispute", code: "CMPL-MGT", description: "Mediation process" },
  ],
  course_categories: [
    { name: "Property Management & Real Estate Law", code: "CRS-LAW", description: "Qatar Tenancy Law & Compliance" },
    { name: "Facility Health & Safety (OSHA / First Aid)", code: "CRS-HSE", description: "Building fire and occupational safety" },
    { name: "Customer Experience & Tenant Relations", code: "CRS-CSAT", description: "Hospitality & communication" },
    { name: "ERP & Financial Accounting Systems", code: "CRS-ERP", description: "Software workflow mastery" },
  ],
  expense_types: [
    { name: "Local Travel & Inspection Fuel (Travel Expense)", code: "EXP-TRAV", description: "Property inspection & tenant visits" },
    { name: "Official Food & Refreshments (Reimbursement Expense)", code: "EXP-FOOD", description: "Client meetings & operational lunch" },
    { name: "Office Supplies & Urgent Spares (Other Expense)", code: "EXP-MISC", description: "Emergency on-site petty purchases" },
    { name: "Visa & Government Labor Attestation Fees", code: "EXP-GOV", description: "Official ministry fees" },
  ],
  travel_allowances: [
    { name: "Per Diem - Local Site Inspection (150 QAR/Day)", code: "TA-LOCAL", description: "Local daily allowance" },
    { name: "Per Diem - International GCC Travel (500 QAR/Day)", code: "TA-GCC", description: "GCC travel rate" },
    { name: "Mileage Allowance - Personal Vehicle (1.2 QAR/KM)", code: "TA-KM", description: "Fuel & vehicle wear rate" },
  ],
};

/** Names of the defaults that earlier versions seeded. Browser copies holding only these are not carried over. */
export const LEGACY_HRMS_DEFAULT_NAMES: Record<string, string[]> = {
  "companies": [
    "Zyno Property Management W.L.L",
    "Zyno Real Estate & Facilities Services",
    "Al Ameen Property Holdings W.L.L"
  ],
  "branches": [
    "Al Ameen Real Estate Head Office",
    "Doha Head Office (D-Ring Road)",
    "Old Salata Site Operations Hub",
    "Al Wakra Operations Center",
    "Mansoura Facility Office",
    "Musheireb Support Center",
    "Bin Omran Site Office"
  ],
  "entities": [
    "ZYNO-QA-DOH (PRIMARY)",
    "ZYNO-FACILITIES-LLC",
    "AL-AMEEN-ESTATES-WLL"
  ],
  "business_units": [
    "Residential Leasing & Tenancy",
    "Commercial & Retail Assets",
    "Facility Maintenance & MEP",
    "Corporate & Shared Services"
  ],
  "departments": [
    "Management",
    "Finance & Accounts",
    "HR & Administration",
    "Sales & Marketing",
    "Operations",
    "Procurement",
    "Information Technology",
    "Customer Service",
    "Maintenance / Technical",
    "Warehouse"
  ],
  "sub_departments": [
    "Residential Leasing",
    "Commercial Leasing",
    "MEP Engineering",
    "HVAC & Chiller Maintenance",
    "Payroll & Compensation",
    "Accounts Payable (AP)"
  ],
  "designations": [
    "Director",
    "General Manager",
    "Manager",
    "Assistant Manager",
    "Accountant",
    "HR Executive",
    "Admin Executive",
    "Sales Executive",
    "Operations Executive",
    "Procurement Executive",
    "IT Support",
    "Customer Service Executive",
    "Supervisor",
    "Technician",
    "Driver",
    "Office Assistant"
  ],
  "grades": [
    "Grade E (Executive / C-Suite)",
    "Grade M (Management / Heads)",
    "Grade S (Senior Specialists)",
    "Grade A (Associates & Officers)",
    "Grade T (Technicians & Field)"
  ],
  "employment_types": [
    "Permanent / Full-Time",
    "Probationary",
    "Fixed-Term Contract",
    "Consultant / Advisor",
    "Part-Time / Intern"
  ],
  "genders": [
    "Male",
    "Female",
    "Other"
  ],
  "employee_statuses": [
    "Active",
    "Probation",
    "On Notice",
    "On Leave",
    "Suspended",
    "Resigned",
    "Terminated"
  ],
  "contract_types": [
    "Unlimited / Open-Ended (Standard)",
    "Fixed 1-Year Renewable",
    "Fixed 2-Year Term",
    "Secondment / Deputation"
  ],
  "leave_types": [
    "Annual Leave (30 Calendar Days)",
    "Sick Leave (Fully Paid 14 Days)",
    "Casual & Emergency Leave (7 Days)",
    "Maternity Leave (50 Paid Days)",
    "Hajj Pilgrimage Leave (20 Days Unpaid)",
    "Compensatory Off / Duty Leave"
  ],
  "document_types": [
    "Qatar ID (QID / Residence Card)",
    "Passport & Bio Page",
    "Ministry Attested Labor Contract",
    "Academic & Degree Certificate",
    "Qatar Driving License",
    "Police Clearance Certificate (PCC)",
    "Health Card & Medical Commission Fit"
  ],
  "recruitment_reasons": [
    "Business Expansion & New Property Handover",
    "Backfill / Employee Resignation Replacement",
    "Specialized Technical Competency Requirement",
    "Workload Surge / Seasonal Operations"
  ],
  "notice_periods": [
    "30 Days (Standard Staff)",
    "60 Days (Management / Key Roles)",
    "90 Days (C-Suite / Executive)",
    "15 Days (Probation Period Exit)"
  ],
  "kt_masters": [
    "Codebase & System Administration Handover",
    "Property Keys & Access Card Handover",
    "Active Tenant Lease Accounts & Collections",
    "Vendor Contracts & In-Progress Work Orders"
  ],
  "countries": [
    "Qatar",
    "India",
    "United Arab Emirates",
    "Saudi Arabia",
    "United Kingdom",
    "Philippines"
  ],
  "states": [
    "Doha Municipality",
    "Al Rayyan",
    "Al Daayen / Lusail",
    "Al Wakrah",
    "Delhi NCR",
    "Haryana (Gurugram)"
  ],
  "cities": [
    "Doha",
    "Lusail",
    "The Pearl-Qatar",
    "West Bay",
    "New Delhi",
    "Gurugram"
  ],
  "regions": [
    "Middle East & GCC",
    "South Asia",
    "Europe & Levant"
  ],
  "financial_years": [
    "2026-2027 (Current Active)",
    "2025-2026 (Audited Past)",
    "2027-2028 (Projected)"
  ],
  "currencies": [
    "Qatari Riyal (QAR)",
    "Indian Rupee (INR)",
    "US Dollar (USD)",
    "UAE Dirham (AED)"
  ],
  "banks": [
    "Qatar National Bank (QNB)",
    "Commercial Bank of Qatar (CBQ)",
    "Doha Bank",
    "Qatar Islamic Bank (QIB)",
    "HDFC Bank India"
  ],
  "salary_components": [
    "Basic Salary",
    "House Rent Allowance (HRA)",
    "Transport Allowance (TRA)",
    "Special Operational Allowance",
    "Mobile & Utility Allowance",
    "Overtime (OT) Pay",
    "Discretionary Bonus"
  ],
  "statutory_components": [
    "End-of-Service Gratuity Accrual",
    "Social Insurance / Pension Contribution",
    "Disciplinary Penalty / Fine Deduction",
    "Staff Advance / Loan Deduction"
  ],
  "salary_templates": [
    "Standard Executive Package (60% Basic + 30% HRA + 10% TRA)",
    "Management Structure (55% Basic + 35% HRA + 10% TRA)",
    "Operational & Technical Package (50% Basic + 35% HRA + 15% TRA)"
  ],
  "tax_slabs": [
    "Qatar Exemption (0% Personal Income Tax)",
    "Standard Foreign Remittance Reporting"
  ],
  "loan_types": [
    "Annual Housing Advance Loan",
    "Emergency Medical & Family Loan",
    "Annual Air Ticket Advance",
    "Vehicle / Transportation Advance"
  ],
  "shifts": [
    "General Day Shift (08:00 AM - 05:00 PM)",
    "Property Site Morning Shift (07:00 AM - 04:00 PM)",
    "Facility Night Shift (10:00 PM - 07:00 AM)"
  ],
  "holidays": [
    "Qatar National Day (18 December)",
    "Qatar National Sports Day (2nd Tuesday February)",
    "Eid Al-Fitr (3 Days)",
    "Eid Al-Adha (4 Days)",
    "New Year's Day (01 January)"
  ],
  "week_offs": [
    "Friday & Saturday (Standard Corporate)",
    "Friday Only (Rotational Site Roster)"
  ],
  "kpa_masters": [
    "Property Occupancy & Lease Renewal Rate (>95%)",
    "Service Ticket Resolution SLA Compliance (>98%)",
    "Rent Collection & Arrear Recovery (>99%)",
    "Tenant Satisfaction & Net Promoter Score (>4.5/5)"
  ],
  "appraisal_intervals": [
    "Annual Performance Appraisal (12 Months)",
    "Mid-Year Milestone Review (6 Months)",
    "Quarterly Objective & Key Results (Q1-Q4)",
    "Probation Clearance Review (90 Days)"
  ],
  "device_user_ids": [
    "Biometric Face Recognition Machine - Doha HQ",
    "Fingerprint Scanner - West Bay Site Office",
    "Mobile Geofence Attendance Punch App"
  ],
  "ticket_categories": [
    "HR & Salary Certificate Requests",
    "IT & System Access Support",
    "Payroll & Reimbursement Discrepancy",
    "Facility & Workplace Assets"
  ],
  "complaint_types": [
    "Workplace Harassment & Ethics Grievance",
    "Shift & Overtime Dispute",
    "Managerial Feedback / Dispute"
  ],
  "course_categories": [
    "Property Management & Real Estate Law",
    "Facility Health & Safety (OSHA / First Aid)",
    "Customer Experience & Tenant Relations",
    "ERP & Financial Accounting Systems"
  ],
  "expense_types": [
    "Local Travel & Inspection Fuel (Travel Expense)",
    "Official Food & Refreshments (Reimbursement Expense)",
    "Office Supplies & Urgent Spares (Other Expense)",
    "Visa & Government Labor Attestation Fees"
  ],
  "travel_allowances": [
    "Per Diem - Local Site Inspection (150 QAR/Day)",
    "Per Diem - International GCC Travel (500 QAR/Day)",
    "Mileage Allowance - Personal Vehicle (1.2 QAR/KM)"
  ]
};
