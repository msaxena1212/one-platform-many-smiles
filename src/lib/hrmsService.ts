import { supabase } from "@/lib/supabase";
import { apiDb } from "@/lib/api-db";
import { createAccountingEvent } from "@/lib/finance/accounting-event-engine";

// ── Types ─────────────────────────────────────────────────────────────
export interface HrmsCompany {
  id: string;
  code: string;
  name: string;
  legal_name?: string;
  currency: string;
  financial_year_start: string;
  city?: string;
  country?: string;
  is_active: boolean;
}

export interface HrmsBranch {
  id: string;
  company_id: string;
  code: string;
  name: string;
  region?: string;
  timezone: string;
  address?: string;
  contact_number?: string;
}

export interface HrmsDepartment {
  id: string;
  name: string;
  code?: string;
  description?: string;
  department_head_id?: string;
  is_active?: boolean;
}

export interface HrmsDesignation {
  id: string;
  title: string;
  code?: string;
  department_id?: string;
  level?: number;
}

export interface HrmsShift {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  break_duration_minutes: number;
  grace_period_minutes: number;
  is_night_shift: boolean;
  is_active: boolean;
}

export interface HrmsAttendanceDaily {
  id: string;
  employee_id: string;
  attendance_date: string;
  shift_id?: string;
  first_in?: string;
  last_out?: string;
  total_working_hours: number;
  late_minutes: number;
  early_minutes: number;
  overtime_minutes: number;
  overtime_premium_minutes?: number;
  status: string; // 'PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'HOLIDAY', etc.
  is_regularized: boolean;
  remarks?: string;
  employees?: any;
}

export interface HrmsLeaveType {
  id: string;
  code: string;
  name: string;
  annual_allowance: number;
  is_paid: boolean;
  is_encashable: boolean;
  carry_forward_limit: number;
}

export interface HrmsLeaveApplication {
  id: string;
  employee_id: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
  days_count: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  applied_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  eligible_leave_days?: number;
  leave_salary_amount?: number;
  expected_rejoining_date?: string;
  last_rejoining_reference_date?: string;
  employees?: any;
  hrms_leave_types?: HrmsLeaveType;
}

export interface EmployeeLeaveEntitlementCalculation {
  serviceReferenceDate: string;
  serviceReferenceType: 'Last Rejoining Date' | 'Date of Joining';
  asOfDate: string;
  serviceDaysSinceReference: number;
  serviceMonthsSinceReference: number;
  totalServiceYears: number;
  annualLeaveQuota: number;
  eligibleLeaveDays: number;
  requestedDays: number;
  dailyBasicPay: number;
  dailyGrossPay: number;
  eligibleLeaveSalary: number;
  requestedLeaveSalary: number;
  expectedRejoiningDate: string;
  excessUnpaidDays: number;
  airTicketAllowance: number;
  includeAirTicket?: boolean;
  totalLeavePayout: number;
}

export function calculateEmployeeLeaveEntitlement(
  emp: any,
  targetLeaveStartDate?: string,
  requestedDaysInput?: number,
  targetLeaveEndDate?: string,
  includeAirTicket: boolean = false
): EmployeeLeaveEntitlementCalculation {
  const todayIso = new Date().toISOString().split('T')[0];
  const asOfDate = targetLeaveStartDate || todayIso;
  const joinDateStr = emp?.date_of_joining || '2024-01-01';
  const rejoinDateStr = emp?.last_leave_rejoining_date || '';

  const serviceReferenceDate = rejoinDateStr || joinDateStr;
  const serviceReferenceType: 'Last Rejoining Date' | 'Date of Joining' = rejoinDateStr
    ? 'Last Rejoining Date'
    : 'Date of Joining';

  const refMs = new Date(serviceReferenceDate).getTime();
  const asOfMs = new Date(asOfDate).getTime();
  const joinMs = new Date(joinDateStr).getTime();

  const serviceDaysSinceReference = isNaN(refMs) || isNaN(asOfMs)
    ? 0
    : Math.max(0, Math.floor((asOfMs - refMs) / (1000 * 60 * 60 * 24)));
  const serviceMonthsSinceReference = Math.round((serviceDaysSinceReference / 30.4375) * 10) / 10;

  const totalServiceDays = isNaN(joinMs) || isNaN(asOfMs)
    ? serviceDaysSinceReference
    : Math.max(0, Math.floor((asOfMs - joinMs) / (1000 * 60 * 60 * 24)));
  const totalServiceYears = Math.round((totalServiceDays / 365.25) * 10) / 10;

  // Qatar Labor Law / Contract Quota: default 30 calendar days/year (or 21 if < 5 yrs when not specified as 30)
  const customQuota = Number(emp?.annual_leave_quota);
  const annualLeaveQuota = customQuota > 0 ? customQuota : (totalServiceYears >= 5 ? 30 : 30);

  // Accrued eligible leave days since last rejoining (or joining)
  const rawAccruedDays = (serviceDaysSinceReference / 365) * annualLeaveQuota;
  const eligibleLeaveDays = Math.round(rawAccruedDays * 10) / 10;

  const basicSalary = Number(emp?.basic_salary || 0);
  const grossSalary =
    basicSalary +
    Number(emp?.hra || 0) +
    Number(emp?.tra || 0) +
    Number(emp?.other_allowances || 0);

  const dailyBasicPay = Math.round((basicSalary / 30) * 100) / 100;
  const dailyGrossPay = Math.round((grossSalary / 30) * 100) / 100;

  const requestedDays = Math.max(0, Number(requestedDaysInput ?? eligibleLeaveDays) || 0);
  const paidEligibleDaysForRequest = Math.min(requestedDays, Math.max(eligibleLeaveDays, requestedDays));

  // Leave salary is calculated on Basic Salary (or Gross if Basic is 0)
  const dailyRateForLeaveSalary = dailyBasicPay > 0 ? dailyBasicPay : dailyGrossPay;
  const eligibleLeaveSalary = Math.round(eligibleLeaveDays * dailyRateForLeaveSalary);
  const requestedLeaveSalary = Math.round(paidEligibleDaysForRequest * dailyRateForLeaveSalary);
  const excessUnpaidDays = Math.max(0, Math.round((requestedDays - eligibleLeaveDays) * 10) / 10);

  let expectedRejoiningDate = '';
  if (targetLeaveEndDate) {
    const endDt = new Date(targetLeaveEndDate);
    if (!isNaN(endDt.getTime())) {
      endDt.setDate(endDt.getDate() + 1);
      expectedRejoiningDate = endDt.toISOString().split('T')[0];
    }
  } else if (targetLeaveStartDate && requestedDays > 0) {
    const startDt = new Date(targetLeaveStartDate);
    if (!isNaN(startDt.getTime())) {
      startDt.setDate(startDt.getDate() + Math.ceil(requestedDays));
      expectedRejoiningDate = startDt.toISOString().split('T')[0];
    }
  }

  return {
    serviceReferenceDate,
    serviceReferenceType,
    asOfDate,
    serviceDaysSinceReference,
    serviceMonthsSinceReference,
    totalServiceYears,
    annualLeaveQuota,
    eligibleLeaveDays,
    requestedDays,
    dailyBasicPay,
    dailyGrossPay,
    eligibleLeaveSalary,
    requestedLeaveSalary,
    expectedRejoiningDate,
    excessUnpaidDays,
    airTicketAllowance: Number(emp?.air_ticket_amount || emp?.air_ticket || emp?.airTicketAmount || 0),
    includeAirTicket,
    totalLeavePayout: requestedLeaveSalary + (includeAirTicket ? Number(emp?.air_ticket_amount || emp?.air_ticket || emp?.airTicketAmount || 0) : 0),
  };
}

const HRMS_EMP_LEAVE_META_KEY = 'hrms_employee_leave_meta_v1';
const HRMS_LEAVE_APPS_LOCAL_KEY = 'hrms_leave_applications_local_v1';
const HRMS_PAYROLL_CYCLES_LOCAL_KEY = 'hrms_payroll_cycles_local_v1';
const HRMS_PAYSLIPS_LOCAL_KEY = 'hrms_payslips_local_v1';
const HRMS_PAYROLL_OVERRIDES_LOCAL_KEY = 'hrms_payroll_overrides_local_v1';

/** Qatar Labour Law: daily wage = monthly wage / 30, regardless of the calendar month length. */
export const PAYROLL_DAY_DIVISOR = 30;
/** Overtime: 125% normal day hours; 150% for night (9pm-4am), weekly rest day and public holiday hours. */
export const OT_NORMAL_MULTIPLIER = 1.25;
export const OT_PREMIUM_MULTIPLIER = 1.5;
/** GRSA pension (Qatari nationals): 5% employee / 10% employer on basic + social allowance. */
export const GRSA_EMPLOYEE_RATE = 0.05;
export const GRSA_EMPLOYER_RATE = 0.1;
const PAYSLIP_EXTRA_COLUMNS = ['leave_salary', 'employer_contributions', 'overtime_premium_hours', 'manual_override', 'remarks', 'paid_at'];
const PAYROLL_LOCKED_STATUSES = ['Approved', 'Paid', 'Locked'];
export const isPayrollCycleLocked = (status?: string) => PAYROLL_LOCKED_STATUSES.includes(String(status || ''));

function readLocalJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeLocalJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function getEmployeeLeaveMetaMap(): Record<string, any> {
  return readLocalJson<Record<string, any>>(HRMS_EMP_LEAVE_META_KEY, {});
}

export function saveEmployeeLeaveMeta(empKeyOrId: string, meta: Record<string, any>, empCode?: string) {
  const map = getEmployeeLeaveMetaMap();
  const clean: Record<string, any> = {};
  if (meta.last_leave_start_date !== undefined) clean.last_leave_start_date = meta.last_leave_start_date;
  if (meta.last_leave_end_date !== undefined) clean.last_leave_end_date = meta.last_leave_end_date;
  if (meta.last_leave_rejoining_date !== undefined) clean.last_leave_rejoining_date = meta.last_leave_rejoining_date;
  if (meta.annual_leave_quota !== undefined) clean.annual_leave_quota = Number(meta.annual_leave_quota) || 30;
  if (meta.air_ticket_amount !== undefined) clean.air_ticket_amount = Number(meta.air_ticket_amount) || 0;
  if (meta.passport_expiry_date !== undefined) clean.passport_expiry_date = meta.passport_expiry_date;
  if (meta.visa_expiry_date !== undefined) clean.visa_expiry_date = meta.visa_expiry_date;
  if (meta.health_card_expiry_date !== undefined) clean.health_card_expiry_date = meta.health_card_expiry_date;
  if (Object.keys(clean).length === 0) return;

  if (empKeyOrId) {
    map[empKeyOrId] = { ...(map[empKeyOrId] || {}), ...clean };
  }
  if (empCode) {
    map[empCode] = { ...(map[empCode] || {}), ...clean };
  }
  writeLocalJson(HRMS_EMP_LEAVE_META_KEY, map);
}

export function enrichEmployeeWithLeaveMeta(emp: any): any {
  if (!emp) return emp;
  const map = getEmployeeLeaveMetaMap();
  const byId = emp.id ? map[emp.id] : undefined;
  const byCode = emp.employee_id_code ? map[emp.employee_id_code] : undefined;
  const merged = {
    ...emp,
    ...(byCode || {}),
    ...(byId || {}),
  };
  return merged;
}

export interface HrmsPayrollCycle {
  id: string;
  name: string;
  cycle_month: number;
  cycle_year: number;
  start_date: string;
  end_date: string;
  status: 'Draft' | 'Processing' | 'Approved' | 'Paid' | 'Locked';
  total_gross: number;
  total_deductions: number;
  total_net: number;
  total_employees: number;
  approved_at?: string;
}

export interface HrmsPayslip {
  id: string;
  payroll_cycle_id: string;
  employee_id: string;
  working_days: number;
  present_days: number;
  paid_leaves: number;
  unpaid_leaves: number;
  overtime_hours: number;
  basic_pay: number;
  allowances: number;
  overtime_pay: number;
  leave_salary?: number;
  incentives: number;
  gross_earnings: number;
  statutory_deductions: number;
  loan_deductions: number;
  fines_deductions: number;
  total_deductions: number;
  net_salary: number;
  status: string;
  employer_contributions?: number;
  overtime_premium_hours?: number;
  manual_override?: boolean;
  remarks?: string;
  paid_at?: string;
  employees?: any;
}

export interface HrmsPayrollOverride {
  payroll_cycle_id: string;
  employee_id: string;
  basic_pay?: number | null;
  allowances?: number | null;
  incentives?: number | null;
  other_deductions?: number | null;
  remarks?: string | null;
}

export interface HrmsAppraisalCycle {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  interval_type: string;
  status: string;
}

export interface HrmsEmployeeAppraisal {
  id: string;
  appraisal_cycle_id: string;
  employee_id: string;
  manager_id?: string;
  self_score: number;
  manager_score: number;
  peer_score: number;
  final_score: number;
  self_remarks?: string;
  manager_remarks?: string;
  status: string;
  employees?: any;
}

export interface HrmsExpenseClaim {
  id: string;
  employee_id: string;
  expense_type_id?: string;
  expense_date: string;
  amount: number;
  title: string;
  category?: string;
  claim_number?: string;
  description?: string;
  receipt_url?: string;
  status: 'Pending' | 'Approved' | 'Reimbursed' | 'Rejected';
  approved_by?: string;
  reimbursed_at?: string;
  employees?: any;
}

export interface HrmsResignation {
  id: string;
  employee_id: string;
  resignation_date: string;
  requested_last_working_date: string;
  approved_last_working_date?: string;
  notice_period_served_days?: number;
  reason: string;
  status: 'Submitted' | 'Under_Review' | 'Accepted' | 'Withdrawn' | 'Rejected';
  employees?: any;
}

export interface HrmsFnfSettlement {
  id: string;
  resignation_id: string;
  employee_id: string;
  settlement_date: string;
  last_working_date: string;
  unpaid_salary: number;
  leave_encashment: number;
  gratuity_amount: number;
  total_gross_settlement: number;
  loan_deduction: number;
  asset_recovery_deduction: number;
  total_deductions: number;
  net_payable: number;
  status: 'Draft' | 'Approved' | 'Disbursed';
  employees?: any;
}

export interface HrmsAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  target_department_id?: string;
  is_published: boolean;
  created_at: string;
}

export interface HrmsHelpdeskTicket {
  id: string;
  ticket_number: string;
  employee_id: string;
  category: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In_Progress' | 'Resolved' | 'Closed';
  resolution_notes?: string;
  created_at: string;
  employees?: any;
}

// ── API Methods ───────────────────────────────────────────────────────

export const HrmsApi = {
  // Organizations & Masters
  async getCompanies(): Promise<HrmsCompany[]> {
    const { data, error } = await supabase.from('hrms_companies').select('*').order('name');
    if (error) console.error("Error fetching companies:", error);
    return data || [];
  },

  async createCompany(company: Partial<HrmsCompany>) {
    return await apiDb.from('hrms_companies').insert(company).select().single();
  },

  async getBranches(): Promise<HrmsBranch[]> {
    const { data, error } = await supabase.from('hrms_branches').select('*').order('name');
    if (error) console.error("Error fetching branches:", error);
    return data || [];
  },

  async getDepartments(): Promise<HrmsDepartment[]> {
    const { data, error } = await supabase.from('departments').select('*').order('name');
    if (error) console.error("Error fetching departments:", error);
    return data || [];
  },

  async createDepartment(dept: { name: string; description?: string }) {
    return await apiDb.from('departments').insert(dept).select().single();
  },

  async getDesignations(): Promise<HrmsDesignation[]> {
    const { data, error } = await supabase.from('designations').select('*').order('title');
    if (error) console.error("Error fetching designations:", error);
    return data || [];
  },

  async createDesignation(desig: { title: string; department_id?: string }) {
    return await apiDb.from('designations').insert(desig).select().single();
  },

  // Employees
  async getEmployees() {
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        departments(name),
        designations(title),
        hrms_branches(name)
      `)
      .order('first_name');
    if (error) console.error("Error fetching employees:", error);
    return (data || []).map((emp: any) => enrichEmployeeWithLeaveMeta(emp));
  },

  sanitizeEmployeePayload(payload: Record<string, any>) {
    const EMPLOYEES_WRITE_KEYS = new Set([
      'employee_id_code',
      'user_id',
      'first_name',
      'last_name',
      'gender',
      'nationality',
      'date_of_birth',
      'mobile_number',
      'email',
      'department_id',
      'designation_id',
      'reporting_manager_id',
      'date_of_joining',
      'employment_type',
      'qid_passport_no',
      'id_expiry_date',
      'basic_salary',
      'hra',
      'tra',
      'other_allowances',
      'bank_name',
      'iban',
      'air_ticket',
      'employee_status',
      'emergency_contact_name',
      'emergency_contact_relation',
      'emergency_contact_number',
      'remarks',
      'company_id',
      'branch_id',
      'business_unit_id',
      'sub_department_id',
      'grade_id',
      'official_email',
      'marital_status',
      'contract_type',
      'probation_status',
      'probation_end_date',
      'confirmation_date',
      'notice_period_days',
      'date_of_exit',
      'exit_reason',
      'rehire_eligible',
      'device_user_id',
      'bank_account_holder',
      'bank_account_type',
      'swift_code',
      'emergency_contacts',
      'qualifications',
      'previous_experience'
    ]);

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined) continue;
      if (key === 'id' || key === 'created_at' || key === 'updated_at' || key === 'total_salary') continue;
      if (EMPLOYEES_WRITE_KEYS.has(key)) {
        sanitized[key] = value;
      }
    }
    return sanitized;
  },

  async createEmployee(employeeData: any) {
    const sanitized = this.sanitizeEmployeePayload(employeeData);
    const res = await apiDb.from('employees').insert(sanitized).select().single();
    if (!res.error && res.data) {
      saveEmployeeLeaveMeta(res.data.id, employeeData, res.data.employee_id_code || employeeData.employee_id_code);
      res.data = enrichEmployeeWithLeaveMeta(res.data);
    } else if (employeeData?.employee_id_code) {
      saveEmployeeLeaveMeta(employeeData.id || employeeData.employee_id_code, employeeData, employeeData.employee_id_code);
    }
    return res;
  },

  async updateEmployee(id: string, employeeData: any) {
    saveEmployeeLeaveMeta(id, employeeData, employeeData?.employee_id_code);
    const sanitized = this.sanitizeEmployeePayload(employeeData);
    if (Object.keys(sanitized).length === 0) {
      return { data: enrichEmployeeWithLeaveMeta({ id, ...employeeData }), error: null } as any;
    }
    const res = await apiDb.from('employees').update({ ...sanitized, updated_at: new Date().toISOString() }).eq('id', id).select().single();
    if (!res.error && res.data) {
      saveEmployeeLeaveMeta(res.data.id, employeeData, res.data.employee_id_code);
      res.data = enrichEmployeeWithLeaveMeta(res.data);
    }
    return res;
  },

  // Workforce & Shifts
  async getShifts(): Promise<HrmsShift[]> {
    const { data, error } = await supabase.from('hrms_shifts').select('*').order('name');
    if (error) console.error("Error fetching shifts:", error);
    return data || [];
  },

  async createShift(shift: Partial<HrmsShift>) {
    return await apiDb.from('hrms_shifts').insert(shift).select().single();
  },

  // Attendance
  async getDailyAttendance(date?: string): Promise<HrmsAttendanceDaily[]> {
    let query = supabase
      .from('hrms_attendance_daily')
      .select(`
        *,
        employees(first_name, last_name, employee_id_code)
      `)
      .order('attendance_date', { ascending: false });

    if (date) {
      query = query.eq('attendance_date', date);
    }

    const { data, error } = await query;
    if (error) console.error("Error fetching attendance:", error);
    return data || [];
  },

  async recordAttendance(attendance: Partial<HrmsAttendanceDaily>) {
    return await apiDb
      .from('hrms_attendance_daily')
      .upsert(attendance, { onConflict: 'employee_id,attendance_date' })
      .select()
      .single();
  },

  /**
   * Month-end attendance sheet: expands per-employee totals into daily rows (present first,
   * then paid leave, then unpaid absence) so payroll's day counting picks them up.
   */
  async saveMonthlyAttendance(
    startDate: string,
    endDate: string,
    rows: {
      employee_id: string;
      absent: number;
      paidLeave: number;
      overtimeHours: number;
      premiumOvertimeHours?: number;
      /** Exact unpaid dates (YYYY-MM-DD). When given they replace the "absent days at month end" default. */
      absentDates?: string[];
    }[]
  ) {
    const days: string[] = [];
    for (let d = new Date(`${startDate}T00:00:00Z`); d <= new Date(`${endDate}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1)) {
      days.push(d.toISOString().split('T')[0]);
    }
    const records: any[] = [];
    for (const r of rows) {
      const exact = r.absentDates && r.absentDates.length > 0 ? new Set(r.absentDates.filter(x => days.includes(x))) : null;
      const absent = exact ? exact.size : Math.min(Math.max(Math.round(r.absent) || 0, 0), days.length);
      const leave = Math.min(Math.max(Math.round(r.paidLeave) || 0, 0), days.length - absent);
      const presentCount = days.length - absent - leave;
      days.forEach((date, i) => {
        const status = exact
          ? exact.has(date) ? 'ABSENT' : 'PRESENT'
          : i < presentCount ? 'PRESENT' : i < presentCount + leave ? 'LEAVE' : 'ABSENT';
        records.push({
          employee_id: r.employee_id,
          attendance_date: date,
          status,
          total_working_hours: status === 'PRESENT' ? 8 : 0,
          overtime_minutes: i === 0 ? Math.round((Number(r.overtimeHours) || 0) * 60) : 0,
          overtime_premium_minutes: i === 0 ? Math.round((Number(r.premiumOvertimeHours) || 0) * 60) : 0,
          remarks: 'Monthly attendance sheet',
        });
      });
    }
    for (let i = 0; i < records.length; i += 500) {
      const chunk = records.slice(i, i + 500);
      let { error } = await apiDb.from('hrms_attendance_daily').upsert(chunk, { onConflict: 'employee_id,attendance_date' });
      if (error) {
        // Column overtime_premium_minutes not deployed yet: save without the premium split.
        ({ error } = await apiDb
          .from('hrms_attendance_daily')
          .upsert(chunk.map(({ overtime_premium_minutes, ...rest }) => rest), { onConflict: 'employee_id,attendance_date' }));
      }
      if (error) return { error };
    }
    return { error: null };
  },

  // Leaves
  async getLeaveTypes(): Promise<HrmsLeaveType[]> {
    const { data, error } = await supabase.from('hrms_leave_types').select('*').order('name');
    if (error) console.error("Error fetching leave types:", error);
    return data || [];
  },

  async createLeaveType(leaveType: Partial<HrmsLeaveType>) {
    return await apiDb.from('hrms_leave_types').insert(leaveType).select().single();
  },

  async getLeaveApplications(): Promise<HrmsLeaveApplication[]> {
    const localApps = readLocalJson<HrmsLeaveApplication[]>(HRMS_LEAVE_APPS_LOCAL_KEY, []);
    const { data, error } = await supabase
      .from('hrms_leave_applications')
      .select(`
        *,
        employees(first_name, last_name, employee_id_code, basic_salary, hra, tra, other_allowances, date_of_joining),
        hrms_leave_types(name, code, is_paid)
      `)
      .order('applied_at', { ascending: false });
    if (error) console.error("Error fetching leave applications:", error);
    const dbApps = (data || []).map((app: any) => {
      const localMatch = localApps.find(l => l.id === app.id);
      return localMatch ? { ...app, ...localMatch, status: app.status || localMatch.status } : app;
    });
    const dbIds = new Set(dbApps.map((a: any) => a.id));
    const onlyLocal = localApps.filter(l => !dbIds.has(l.id));
    return [...onlyLocal, ...dbApps];
  },

  // Comprehensive Leave Edge-Case Handlers
  async applyLeaveWithValidation(application: {
    employee_id: string;
    leave_type_id: string;
    start_date: string;
    end_date: string;
    days_count: number;
    reason: string;
    eligible_leave_days?: number;
    leave_salary_amount?: number;
    expected_rejoining_date?: string;
    last_rejoining_reference_date?: string;
    employees?: any;
    hrms_leave_types?: any;
  }) {
    // 1. Check Date Sequence
    if (new Date(application.start_date) > new Date(application.end_date)) {
      return { error: { message: "Start date cannot be after end date." } };
    }

    // 2. Check Overlapping Existing Leaves
    const existingLeaves = await this.getLeaveApplications();
    const empLeaves = existingLeaves.filter(
      l => l.employee_id === application.employee_id && (l.status === 'Pending' || l.status === 'Approved')
    );

    const isOverlap = empLeaves.some(l => {
      const existingStart = new Date(l.start_date);
      const existingEnd = new Date(l.end_date);
      const newStart = new Date(application.start_date);
      const newEnd = new Date(application.end_date);
      return (newStart <= existingEnd && newEnd >= existingStart);
    });

    if (isOverlap) {
      return { error: { message: "Dates overlap with an existing approved or pending leave application." } };
    }

    const dbPayload = {
      employee_id: application.employee_id,
      leave_type_id: application.leave_type_id,
      start_date: application.start_date,
      end_date: application.end_date,
      days_count: application.days_count,
      reason: application.reason,
      status: 'Pending' as const,
    };

    const res = await apiDb.from('hrms_leave_applications').insert(dbPayload).select().single();
    const recordId = res.data?.id || `lv-local-${Date.now()}`;
    const enrichedRecord: HrmsLeaveApplication = {
      ...(res.data || dbPayload),
      id: recordId,
      status: 'Pending',
      applied_at: res.data?.applied_at || new Date().toISOString(),
      eligible_leave_days: application.eligible_leave_days,
      leave_salary_amount: application.leave_salary_amount,
      expected_rejoining_date: application.expected_rejoining_date,
      last_rejoining_reference_date: application.last_rejoining_reference_date,
      employees: application.employees,
      hrms_leave_types: application.hrms_leave_types,
    };

    const localApps = readLocalJson<HrmsLeaveApplication[]>(HRMS_LEAVE_APPS_LOCAL_KEY, []);
    writeLocalJson(HRMS_LEAVE_APPS_LOCAL_KEY, [enrichedRecord, ...localApps.filter(a => a.id !== recordId)]);

    return { data: enrichedRecord, error: null };
  },

  // Full-and-Final (FNF) Settlement Edge-Case Engine
  async calculateFnfBreakdown(employeeId: string, resignationId: string, lwd: string) {
    const { data: emp } = await supabase.from('employees').select('*').eq('id', employeeId).single();
    if (!emp) return { error: { message: "Employee record not found" } };

    const basicSalary = Number(emp.basic_salary) || 0;
    const grossSalary = basicSalary + Number(emp.hra || 0) + Number(emp.tra || 0) + Number(emp.other_allowances || 0);

    // 1. Pro-rata Unpaid Salary for Current Month
    const exitDate = new Date(lwd);
    const dayOfMonth = exitDate.getDate();
    const daysInMonth = new Date(exitDate.getFullYear(), exitDate.getMonth() + 1, 0).getDate();
    const unpaidSalary = Math.round((grossSalary / daysInMonth) * dayOfMonth);

    // 2. Leave Encashment Balance
    const { data: leaveBalances } = await supabase
      .from('hrms_leave_balances')
      .select('*, hrms_leave_types(is_encashable)')
      .eq('employee_id', employeeId);

    let totalEncashableDays = 0;
    leaveBalances?.forEach(b => {
      if (b.hrms_leave_types?.is_encashable && Number(b.balance) > 0) {
        totalEncashableDays += Number(b.balance);
      }
    });
    const perDayBasic = basicSalary / 30;
    const leaveEncashmentAmount = Math.round(totalEncashableDays * perDayBasic);

    // 3. Statutory Gratuity / End of Service (Qatar Labor Law: 21 days basic pay per year of service after 1+ year)
    let gratuityAmount = 0;
    if (emp.date_of_joining) {
      const joinDate = new Date(emp.date_of_joining);
      const diffYears = (exitDate.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      if (diffYears >= 1) {
        gratuityAmount = Math.round(diffYears * (basicSalary * (21 / 30)));
      }
    }

    // 4. Pending Loans or Asset Liabilities
    const { data: loans } = await supabase
      .from('hrms_employee_loans')
      .select('remaining_balance')
      .eq('employee_id', employeeId)
      .eq('status', 'Active');

    const totalLoanLiability = loans?.reduce((acc, l) => acc + Number(l.remaining_balance), 0) || 0;

    // 5. Query assigned assets for asset recovery deduction if any unreturned
    let assetRecoveryDeduction = 0;
    try {
      const { data: assignedAssets } = await supabase
        .from('assets')
        .select('*')
        .eq('assigned_to', employeeId)
        .eq('status', 'In Use');
      if (assignedAssets && assignedAssets.length > 0) {
        // e.g. sum of purchase values or replacement deposits for unreturned items
        assetRecoveryDeduction = assignedAssets.reduce((sum, a) => sum + (Number(a.purchase_cost) || 0), 0);
      }
    } catch {}

    const totalGross = unpaidSalary + leaveEncashmentAmount + gratuityAmount;
    const totalDeductions = totalLoanLiability + assetRecoveryDeduction;
    const netPayable = Math.max(0, totalGross - totalDeductions);

    const fnfPayload: Partial<HrmsFnfSettlement> = {
      resignation_id: resignationId,
      employee_id: employeeId,
      settlement_date: new Date().toISOString().split('T')[0],
      last_working_date: lwd,
      unpaid_salary: unpaidSalary,
      leave_encashment: leaveEncashmentAmount,
      gratuity_amount: gratuityAmount,
      total_gross_settlement: totalGross,
      loan_deduction: totalLoanLiability,
      asset_recovery_deduction: assetRecoveryDeduction,
      total_deductions: totalDeductions,
      net_payable: netPayable,
      status: 'Draft'
    };

    return await apiDb.from('hrms_fnf_settlements').insert(fnfPayload).select().single();
  },

  async deductLeaveBalance(employeeId: string, leaveTypeId: string, daysCount: number, year?: number) {
    const leaveYear = year || new Date().getFullYear();
    const { data: existing } = await supabase
      .from('hrms_leave_balances')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('leave_type_id', leaveTypeId)
      .eq('year', leaveYear)
      .maybeSingle();

    if (existing) {
      const newUsed = (Number(existing.used) || 0) + daysCount;
      const newBalance = Math.max(0, (Number(existing.allocated) || 0) - newUsed);
      return await apiDb
        .from('hrms_leave_balances')
        .update({ used: newUsed, balance: newBalance })
        .eq('id', existing.id);
    } else {
      // Upsert default allocation from leave type
      const { data: lt } = await supabase.from('hrms_leave_types').select('annual_allowance').eq('id', leaveTypeId).single();
      const annualAllowance = Number(lt?.annual_allowance) || 30;
      const balance = Math.max(0, annualAllowance - daysCount);
      return await apiDb
        .from('hrms_leave_balances')
        .insert({
          employee_id: employeeId,
          leave_type_id: leaveTypeId,
          year: leaveYear,
          allocated: annualAllowance,
          used: daysCount,
          balance: balance
        });
    }
  },

  async updateLeaveStatus(
    id: string,
    status: 'Approved' | 'Rejected' | 'Cancelled',
    review_notes?: string,
    employeeObj?: any
  ) {
    const res = await apiDb
      .from('hrms_leave_applications')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        review_notes
      })
      .eq('id', id)
      .select('*, hrms_leave_types(name)')
      .single();

    const localApps = readLocalJson<HrmsLeaveApplication[]>(HRMS_LEAVE_APPS_LOCAL_KEY, []);
    const localIdx = localApps.findIndex(a => a.id === id);
    const app: any = res.data || (localIdx >= 0 ? localApps[localIdx] : null);

    let calculatedEntitlement: EmployeeLeaveEntitlementCalculation | null = null;
    if (app && status === 'Approved') {
      let emp = employeeObj || app.employees;
      if (!emp || !emp.basic_salary) {
        try {
          const allEmps = await this.getEmployees();
          emp = allEmps.find((e: any) => e.id === app.employee_id) || emp;
        } catch {}
      }
      emp = enrichEmployeeWithLeaveMeta(emp || { id: app.employee_id });
      calculatedEntitlement = calculateEmployeeLeaveEntitlement(
        emp,
        app.start_date,
        Number(app.days_count) || 1,
        app.end_date
      );

      // Automatically update Employee Master leave history upon leave approval
      if (calculatedEntitlement.expectedRejoiningDate) {
        saveEmployeeLeaveMeta(
          app.employee_id,
          {
            last_leave_start_date: app.start_date,
            last_leave_end_date: app.end_date,
            last_leave_rejoining_date: calculatedEntitlement.expectedRejoiningDate,
          },
          emp?.employee_id_code
        );
      }

      try {
        await this.deductLeaveBalance(app.employee_id, app.leave_type_id, Number(app.days_count) || 1);
      } catch {}
    }

    if (localIdx >= 0) {
      localApps[localIdx] = {
        ...localApps[localIdx],
        ...(res.data || {}),
        status,
        reviewed_at: new Date().toISOString(),
        review_notes,
        ...(calculatedEntitlement
          ? {
              eligible_leave_days: calculatedEntitlement.eligibleLeaveDays,
              leave_salary_amount: calculatedEntitlement.requestedLeaveSalary,
              expected_rejoining_date: calculatedEntitlement.expectedRejoiningDate,
              last_rejoining_reference_date: calculatedEntitlement.serviceReferenceDate,
            }
          : {}),
      };
      writeLocalJson(HRMS_LEAVE_APPS_LOCAL_KEY, localApps);
      return { data: localApps[localIdx], error: null };
    } else if (app) {
      const updatedApp: HrmsLeaveApplication = {
        ...app,
        status,
        reviewed_at: new Date().toISOString(),
        review_notes,
        ...(calculatedEntitlement
          ? {
              eligible_leave_days: calculatedEntitlement.eligibleLeaveDays,
              leave_salary_amount: calculatedEntitlement.requestedLeaveSalary,
              expected_rejoining_date: calculatedEntitlement.expectedRejoiningDate,
              last_rejoining_reference_date: calculatedEntitlement.serviceReferenceDate,
            }
          : {}),
      };
      writeLocalJson(HRMS_LEAVE_APPS_LOCAL_KEY, [updatedApp, ...localApps]);
      return { data: updatedApp, error: null };
    }

    return res;
  },

  // Payroll
  async getPayrollCycles(): Promise<HrmsPayrollCycle[]> {
    const localCycles = readLocalJson<HrmsPayrollCycle[]>(HRMS_PAYROLL_CYCLES_LOCAL_KEY, []);
    try {
      const { data, error } = await supabase
        .from('hrms_payroll_cycles')
        .select('*')
        .order('cycle_year', { ascending: false })
        .order('cycle_month', { ascending: false });
      if (!error && data) {
        const merged = data.map((c: any) => {
          const loc = localCycles.find(l => l.id === c.id);
          return loc ? { ...c, ...loc } : c;
        });
        const dbIds = new Set(merged.map((c: any) => c.id));
        const onlyLocal = localCycles.filter(l => !dbIds.has(l.id));
        return [...onlyLocal, ...merged];
      }
    } catch (e) {
      console.error("Error fetching payroll cycles:", e);
    }
    return localCycles;
  },

  async createPayrollCycle(cycle: Partial<HrmsPayrollCycle>) {
    const res = await apiDb.from('hrms_payroll_cycles').insert(cycle).select().single();
    const createdCycle: HrmsPayrollCycle = (res.data || {
      id: `pcycle-local-${Date.now()}`,
      name: cycle.name || 'Monthly Payroll',
      cycle_month: cycle.cycle_month || new Date().getMonth() + 1,
      cycle_year: cycle.cycle_year || new Date().getFullYear(),
      start_date: cycle.start_date || new Date().toISOString().split('T')[0],
      end_date: cycle.end_date || new Date().toISOString().split('T')[0],
      status: cycle.status || 'Draft',
      total_gross: cycle.total_gross || 0,
      total_deductions: cycle.total_deductions || 0,
      total_net: cycle.total_net || 0,
      total_employees: cycle.total_employees || 0,
    }) as HrmsPayrollCycle;

    const localCycles = readLocalJson<HrmsPayrollCycle[]>(HRMS_PAYROLL_CYCLES_LOCAL_KEY, []);
    writeLocalJson(
      HRMS_PAYROLL_CYCLES_LOCAL_KEY,
      [createdCycle, ...localCycles.filter(c => c.id !== createdCycle.id)]
    );
    return { data: createdCycle, error: null };
  },

  async getPayslipsByCycle(cycleId: string): Promise<HrmsPayslip[]> {
    const localSlipsMap = readLocalJson<Record<string, HrmsPayslip[]>>(HRMS_PAYSLIPS_LOCAL_KEY, {});
    const localSlips = localSlipsMap[cycleId] || [];
    try {
      const { data, error } = await supabase
        .from('hrms_payroll_payslips')
        .select(`
          *,
          employees(first_name, last_name, employee_id_code, email, iban, bank_name, qid_passport_no, nationality, date_of_joining, departments(name), designations(title))
        `)
        .eq('payroll_cycle_id', cycleId);
      if (!error && data && data.length > 0) {
        return data.map((s: any) => {
          const loc = localSlips.find(l => l.employee_id === s.employee_id || l.id === s.id);
          return loc ? { ...s, leave_salary: loc.leave_salary ?? s.leave_salary ?? 0 } : s;
        });
      }
    } catch (e) {
      console.error("Error fetching payslips:", e);
    }
    return localSlips;
  },

  async generatePayrollForCycle(cycleId: string, fallbackEmployees?: any[]) {
    try {
      // 1. Fetch cycle details for month/year and date boundaries
      const allCycles = await this.getPayrollCycles();
      let cycle = allCycles.find(c => c.id === cycleId) || null;
      if (!cycle) {
        const { data: dbCycle } = await supabase
          .from('hrms_payroll_cycles')
          .select('*')
          .eq('id', cycleId)
          .maybeSingle();
        cycle = dbCycle;
      }
      if (cycle && isPayrollCycleLocked(cycle.status)) {
        return { error: `Payroll cycle is ${cycle.status} and locked; it can no longer be recalculated.`, count: 0 };
      }
      const skippedNoSalary: string[] = [];

      let emps: any[] = [];
      const isValidPersonnel = (e: any) => {
        const fName = (e.first_name || "").trim();
        const lName = (e.last_name || "").trim();
        const fullName = `${fName} ${lName}`.trim();
        const isPlaceholder = /^Employee\s*(\d+)?$/i.test(fName) || /^Employee\s*(\d+)?$/i.test(fullName) || (fName.toLowerCase() === "employee" && !lName);
        const totalSalary = Number(e.basic_salary || 0) + Number(e.hra || 0) + Number(e.tra || 0);
        if (isPlaceholder) return false;
        if (/employee/i.test(fullName) && (totalSalary === 0 || Number(e.basic_salary || 0) === 0)) return false;
        return e.employee_status !== 'Terminated';
      };

      try {
        const { data } = await supabase.from('employees').select('*, departments(name), designations(title)');
        if (data && data.length > 0) {
          emps = data.filter(isValidPersonnel).map((e: any) => enrichEmployeeWithLeaveMeta(e));
        }
      } catch {}

      if (emps.length === 0) {
        emps = (await this.getEmployees()).filter(isValidPersonnel);
      }

      if (emps.length === 0 && fallbackEmployees && fallbackEmployees.length > 0) {
        emps = fallbackEmployees.filter(isValidPersonnel).map((e: any) => enrichEmployeeWithLeaveMeta(e));
      }

      if (emps.length === 0) {
        return { error: 'No active employees found to process', count: 0 };
      }

      // 2. Fetch attendance, approved leaves & active loans for all employees in this period
      const startDate = cycle?.start_date || `${cycle?.cycle_year || new Date().getFullYear()}-${String(cycle?.cycle_month || new Date().getMonth() + 1).padStart(2, '0')}-01`;
      const endDate = cycle?.end_date || new Date().toISOString().split('T')[0];

      const { data: attendanceRows } = await supabase
        .from('hrms_attendance_daily')
        .select('*')
        .gte('attendance_date', startDate)
        .lte('attendance_date', endDate);

      const overrideRows = await this.getPayrollOverrides(cycleId);
      const overrideByEmp = new Map(overrideRows.map(o => [o.employee_id, o]));

      const { data: activeLoans } = await supabase
        .from('hrms_employee_loans')
        .select('*')
        .eq('status', 'Active');

      const allLeaveApps = await this.getLeaveApplications();
      const approvedLeavesInCycle = allLeaveApps.filter(l => {
        if (l.status !== 'Approved') return false;
        return l.start_date <= endDate && l.end_date >= startDate;
      });

      const payslipsRaw = emps.map((emp): HrmsPayslip | null => {
        const ov = overrideByEmp.get(emp.id);
        const basic = Number(ov?.basic_pay ?? emp.basic_salary) || 0;
        if (basic <= 0) {
          skippedNoSalary.push(`${emp.first_name || ''} ${emp.last_name || ''}`.trim() || emp.employee_id_code || emp.id);
          return null;
        }
        const hra = Number(emp.hra) || 0;
        const tra = Number(emp.tra) || 0;
        const allowances = ov?.allowances != null
          ? Number(ov.allowances) || 0
          : hra + tra + (Number(emp.other_allowances) || 0);
        const incentives = Number(ov?.incentives) || 0;
        const otherDeductions = Number(ov?.other_deductions) || 0;
        
        // Real attendance calculation
        const empAttendance = attendanceRows?.filter(a => a.employee_id === emp.id) || [];
        const empApprovedLeaves = approvedLeavesInCycle.filter(l => l.employee_id === emp.id);
        const approvedLeaveDaysInCycle = empApprovedLeaves.reduce((sum, l) => sum + (Number(l.days_count) || 0), 0);

        // Calculate Approved Leave Salary for leaves starting or falling in this cycle
        const approvedLeaveSalary = empApprovedLeaves.reduce((sum, l) => {
          if (Number(l.leave_salary_amount) > 0) {
            return sum + Number(l.leave_salary_amount);
          }
          const calc = calculateEmployeeLeaveEntitlement(emp, l.start_date, Number(l.days_count) || 0, l.end_date);
          return sum + calc.requestedLeaveSalary;
        }, 0);

        const unpaidLeaves = empAttendance.filter(a => a.status === 'ABSENT' || a.status === 'UNPAID_LEAVE').length || 0;
        const paidLeaves = Math.max(
          empAttendance.filter(a => a.status === 'LEAVE' || a.status === 'PAID_LEAVE').length || 0,
          approvedLeaveDaysInCycle
        );
        const presentDays = empAttendance.length > 0
          ? empAttendance.filter(a => a.status === 'PRESENT' || a.status === 'HALF_DAY').length
          : Math.max(0, 30 - paidLeaves - unpaidLeaves);
        const overtimeMinutes = empAttendance.reduce((sum, a) => sum + (Number(a.overtime_minutes) || 0), 0);
        const premiumMinutes = empAttendance.reduce((sum, a) => sum + (Number(a.overtime_premium_minutes) || 0), 0);
        const normalOtHours = Math.round((overtimeMinutes / 60) * 10) / 10;
        const premiumOtHours = Math.round((premiumMinutes / 60) * 10) / 10;
        const overtimeHours = Math.round((normalOtHours + premiumOtHours) * 10) / 10;

        // OT hourly rate: Basic / 240 hours; 125% normal, 150% night / rest-day / holiday hours
        const hourlyRate = basic / 240;
        const overtimePay = Math.round(
          normalOtHours * hourlyRate * OT_NORMAL_MULTIPLIER + premiumOtHours * hourlyRate * OT_PREMIUM_MULTIPLIER
        );

        // Unpaid leave deduction: (Basic + Allowances) / 30 per unpaid day
        const unpaidLeaveDeduction = unpaidLeaves > 0 ? Math.round(((basic + allowances) / PAYROLL_DAY_DIVISOR) * unpaidLeaves) : 0;

        const gross = basic + allowances + overtimePay + approvedLeaveSalary + incentives;
        
        // Qatar Tax System: 0% Personal Income Tax / 0% TDS
        // Only Qatari Nationals have statutory GRSA Pension deduction (5% employee share on Basic+Social), expats have 0 statutory tax deductions
        const isQatari = String(emp.nationality || '').toLowerCase().includes('qatar');
        const statutory = isQatari ? Math.round((basic + hra) * GRSA_EMPLOYEE_RATE) : 0;
        const employerContribution = isQatari ? Math.round((basic + hra) * GRSA_EMPLOYER_RATE) : 0;
        
        // Loan / Advance deductions
        const empLoan = activeLoans?.find(l => l.employee_id === emp.id);
        const loanDeduction = Number(empLoan?.monthly_deduction) || 0;

        const totalDeductions = statutory + loanDeduction + unpaidLeaveDeduction + otherDeductions;
        const net = Math.max(0, gross - totalDeductions);

        return {
          id: `pslip-${cycleId}-${emp.id}`,
          payroll_cycle_id: cycleId,
          employee_id: emp.id,
          working_days: 30,
          present_days: presentDays,
          paid_leaves: paidLeaves,
          unpaid_leaves: unpaidLeaves,
          overtime_hours: overtimeHours,
          basic_pay: basic,
          allowances: allowances,
          overtime_pay: overtimePay,
          leave_salary: approvedLeaveSalary,
          incentives,
          gross_earnings: gross,
          statutory_deductions: statutory,
          loan_deductions: loanDeduction,
          fines_deductions: unpaidLeaveDeduction + otherDeductions,
          employer_contributions: employerContribution,
          overtime_premium_hours: premiumOtHours,
          manual_override: Boolean(ov),
          remarks: ov?.remarks || undefined,
          total_deductions: totalDeductions,
          net_salary: net,
          status: 'Generated',
          employees: {
            first_name: emp.first_name,
            last_name: emp.last_name || '',
            employee_id_code: emp.employee_id_code || 'EMP',
            email: emp.email || '',
            iban: emp.iban || '',
            bank_name: emp.bank_name || '',
            qid_passport_no: emp.qid_passport_no || '',
            departments: emp.departments,
            designations: emp.designations,
            nationality: emp.nationality || '',
            date_of_joining: emp.date_of_joining || ''
          }
        };
      });
      const payslips = payslipsRaw.filter((p): p is HrmsPayslip => p !== null);
      if (payslips.length === 0) {
        return { error: 'No employees with a basic salary to process. Set a salary on the employee record or enter it in the attendance sheet.', count: 0 };
      }

      const totalGross = payslips.reduce((acc, p) => acc + p.gross_earnings, 0);
      const totalDeductions = payslips.reduce((acc, p) => acc + p.total_deductions, 0);
      const totalNet = payslips.reduce((acc, p) => acc + p.net_salary, 0);

      // Always persist in localStorage overlay so payroll works reliably even if DB insert fails
      const localSlipsMap = readLocalJson<Record<string, HrmsPayslip[]>>(HRMS_PAYSLIPS_LOCAL_KEY, {});
      localSlipsMap[cycleId] = payslips;
      writeLocalJson(HRMS_PAYSLIPS_LOCAL_KEY, localSlipsMap);

      const localCycles = readLocalJson<HrmsPayrollCycle[]>(HRMS_PAYROLL_CYCLES_LOCAL_KEY, []);
      const updatedLocalCycles = localCycles.map(c =>
        c.id === cycleId
          ? {
              ...c,
              total_gross: totalGross,
              total_deductions: totalDeductions,
              total_net: totalNet,
              total_employees: payslips.length,
              status: 'Processing' as const,
            }
          : c
      );
      writeLocalJson(HRMS_PAYROLL_CYCLES_LOCAL_KEY, updatedLocalCycles);

      try {
        await apiDb.from('hrms_payroll_payslips').delete().eq('payroll_cycle_id', cycleId);
        let insertRes = await apiDb.from('hrms_payroll_payslips').insert(
          payslips.map(({ employees, ...p }) => p)
        );
        if (insertRes.error) {
          // Database predates the payroll extension migration: store the core columns only.
          console.warn('Payslip insert with extended columns failed, retrying core columns:', insertRes.error.message);
          insertRes = await apiDb.from('hrms_payroll_payslips').insert(
            payslips.map(({ employees, ...p }) => {
              const core: any = { ...p };
              PAYSLIP_EXTRA_COLUMNS.forEach(c => delete core[c]);
              return core;
            })
          );
        }
        if (insertRes.error) console.error('Payslip insert failed:', insertRes.error.message);
        await apiDb.from('hrms_payroll_cycles').update({
          total_gross: totalGross,
          total_deductions: totalDeductions,
          total_net: totalNet,
          total_employees: payslips.length,
          status: 'Processing'
        }).eq('id', cycleId);
      } catch (dbErr) {
        console.error('Database payroll update error:', dbErr);
      }

      const totalEmployerGrsa = payslips.reduce((acc, p) => acc + Number(p.employer_contributions || 0), 0);
      return { error: null, count: payslips.length, totalGross, totalNet, totalEmployerGrsa, skippedNoSalary, payslips };
    } catch (err: any) {
      console.error('generatePayrollForCycle error:', err);
      return { error: err?.message || 'Calculation failed', count: 0 };
    }
  },

  async getPayrollOverrides(cycleId: string): Promise<HrmsPayrollOverride[]> {
    const local = readLocalJson<Record<string, HrmsPayrollOverride[]>>(HRMS_PAYROLL_OVERRIDES_LOCAL_KEY, {})[cycleId] || [];
    const { data, error } = await supabase.from('hrms_payroll_overrides').select('*').eq('payroll_cycle_id', cycleId);
    if (error) return local;
    return (data || []) as HrmsPayrollOverride[];
  },

  async savePayrollOverrides(cycleId: string, rows: Omit<HrmsPayrollOverride, 'payroll_cycle_id'>[]) {
    if (rows.length === 0) return { error: null };
    const records = rows.map(r => ({ ...r, payroll_cycle_id: cycleId, updated_at: new Date().toISOString() }));
    const { error } = await apiDb
      .from('hrms_payroll_overrides')
      .upsert(records, { onConflict: 'payroll_cycle_id,employee_id' });
    if (error) {
      // Table not deployed yet: keep the inputs on this browser so payroll can still be run.
      const map = readLocalJson<Record<string, HrmsPayrollOverride[]>>(HRMS_PAYROLL_OVERRIDES_LOCAL_KEY, {});
      const merged = new Map((map[cycleId] || []).map(o => [o.employee_id, o]));
      records.forEach(r => merged.set(r.employee_id, r as any));
      map[cycleId] = Array.from(merged.values());
      writeLocalJson(HRMS_PAYROLL_OVERRIDES_LOCAL_KEY, map);
      return { error: null, localOnly: true, message: error.message };
    }
    return { error: null };
  },

  /** Marks an approved cycle as paid once the WPS / bank transfer is confirmed. */
  async markPayrollPaid(cycleId: string, paymentReference: string) {
    const paidAt = new Date().toISOString();
    let res: any = await apiDb
      .from('hrms_payroll_cycles')
      .update({ status: 'Paid', paid_at: paidAt, payment_reference: paymentReference })
      .eq('id', cycleId);
    if (res.error) {
      res = await apiDb.from('hrms_payroll_cycles').update({ status: 'Paid' }).eq('id', cycleId);
    }
    if (res.error) return { error: res.error };
    let slipRes: any = await apiDb
      .from('hrms_payroll_payslips')
      .update({ status: 'Paid', payment_reference: paymentReference, paid_at: paidAt })
      .eq('payroll_cycle_id', cycleId);
    if (slipRes.error) {
      await apiDb
        .from('hrms_payroll_payslips')
        .update({ status: 'Paid', payment_reference: paymentReference })
        .eq('payroll_cycle_id', cycleId);
    }
    const localCycles = readLocalJson<HrmsPayrollCycle[]>(HRMS_PAYROLL_CYCLES_LOCAL_KEY, []);
    writeLocalJson(HRMS_PAYROLL_CYCLES_LOCAL_KEY, localCycles.map(c => (c.id === cycleId ? { ...c, status: 'Paid' as const } : c)));
    return { error: null };
  },

  async approvePayrollCycle(cycleId: string) {
    const approvedAt = new Date().toISOString();
    const localCycles = readLocalJson<HrmsPayrollCycle[]>(HRMS_PAYROLL_CYCLES_LOCAL_KEY, []);
    const updatedLocal = localCycles.map(c =>
      c.id === cycleId ? { ...c, status: 'Approved' as const, approved_at: approvedAt } : c
    );
    writeLocalJson(HRMS_PAYROLL_CYCLES_LOCAL_KEY, updatedLocal);

    const res = await apiDb
      .from('hrms_payroll_cycles')
      .update({
        status: 'Approved',
        approved_at: approvedAt
      })
      .eq('id', cycleId)
      .select()
      .single();

    if (res.error) {
      const loc = updatedLocal.find(c => c.id === cycleId);
      return { data: loc || { id: cycleId, status: 'Approved', approved_at: approvedAt }, error: null } as any;
    }
    return res;
  },

  // GL Postings for HRMS Transactions
  async postFnfToGL(fnf: HrmsFnfSettlement) {
    const eventDate = fnf.settlement_date || new Date().toISOString().split('T')[0];
    const lines: any[] = [];

    // 1. Gratuity Expense: Dr 54100 Gratuity Expense / Cr 21900 Payroll Payable
    if (fnf.gratuity_amount > 0) {
      lines.push({
        account_code: '54100',
        account_name: 'Gratuity Expense',
        debit: Number(fnf.gratuity_amount),
        credit: 0,
        description: `FNF Gratuity for Employee ${fnf.employee_id}`
      });
      lines.push({
        account_code: '21900',
        account_name: 'Payroll Payable',
        debit: 0,
        credit: Number(fnf.gratuity_amount),
        description: `FNF Gratuity Payable for Employee ${fnf.employee_id}`
      });
    }

    // 2. Leave Encashment: Dr 54200 Leave Encashment / Cr 21900 Payroll Payable
    if (fnf.leave_encashment > 0) {
      lines.push({
        account_code: '54200',
        account_name: 'Leave Encashment Expense',
        debit: Number(fnf.leave_encashment),
        credit: 0,
        description: `FNF Leave Encashment for Employee ${fnf.employee_id}`
      });
      lines.push({
        account_code: '21900',
        account_name: 'Payroll Payable',
        debit: 0,
        credit: Number(fnf.leave_encashment),
        description: `FNF Leave Encashment Payable for Employee ${fnf.employee_id}`
      });
    }

    // 3. Unpaid Salary: Dr 50100 Salary Expense / Cr 21900 Payroll Payable
    if (fnf.unpaid_salary > 0) {
      lines.push({
        account_code: '50100',
        account_name: 'Salary Expense',
        debit: Number(fnf.unpaid_salary),
        credit: 0,
        description: `FNF Unpaid Salary for Employee ${fnf.employee_id}`
      });
      lines.push({
        account_code: '21900',
        account_name: 'Payroll Payable',
        debit: 0,
        credit: Number(fnf.unpaid_salary),
        description: `FNF Unpaid Salary Payable for Employee ${fnf.employee_id}`
      });
    }

    // 4. Loan Recovery deduction: Dr 21900 Payroll Payable / Cr 13100 Employee Loans Receivable
    if (fnf.loan_deduction > 0) {
      lines.push({
        account_code: '21900',
        account_name: 'Payroll Payable',
        debit: Number(fnf.loan_deduction),
        credit: 0,
        description: `FNF Loan Recovery for Employee ${fnf.employee_id}`
      });
      lines.push({
        account_code: '13100',
        account_name: 'Employee Loans Receivable',
        debit: 0,
        credit: Number(fnf.loan_deduction),
        description: `FNF Loan Recovery from Employee ${fnf.employee_id}`
      });
    }

    // 5. Net Disbursement: Dr 21900 Payroll Payable / Cr 12000 Bank
    if (fnf.net_payable > 0) {
      lines.push({
        account_code: '21900',
        account_name: 'Payroll Payable',
        debit: Number(fnf.net_payable),
        credit: 0,
        description: `FNF Net Settlement Settlement for Employee ${fnf.employee_id}`
      });
      lines.push({
        account_code: '12000',
        account_name: 'Bank Account',
        debit: 0,
        credit: Number(fnf.net_payable),
        description: `FNF Bank Disbursement for Employee ${fnf.employee_id}`
      });
    }

    if (lines.length > 0) {
      return await createAccountingEvent({
        event_type: 'HRMS_FNF_SETTLEMENT',
        source_type: 'HRMS_FNF',
        source_id: fnf.id,
        event_date: eventDate,
        posting_date: eventDate,
        description: `Full and Final Settlement GL Posting - FNF #${fnf.id.slice(0, 8)}`,
        idempotency_key: `fnf-gl-${fnf.id}`,
        lines
      });
    }
  },

  async postExpenseReimbursementToGL(claim: HrmsExpenseClaim) {
    const eventDate = claim.expense_date || new Date().toISOString().split('T')[0];
    const amount = Number(claim.amount) || 0;
    if (amount <= 0) return;

    return await createAccountingEvent({
      event_type: 'HRMS_EXPENSE_REIMBURSEMENT',
      source_type: 'HRMS_EXPENSE',
      source_id: claim.id,
      event_date: eventDate,
      posting_date: eventDate,
      description: `Staff Expense Reimbursement: ${claim.title || claim.category} (${claim.claim_number || claim.id.slice(0, 8)})`,
      idempotency_key: `hrms-exp-${claim.id}`,
      lines: [
        {
          account_code: '55000',
          account_name: 'Staff Expense Claims',
          debit: amount,
          credit: 0,
          description: `Expense claim reimbursement for ${claim.title || claim.category}`
        },
        {
          account_code: '12000',
          account_name: 'Bank Account',
          debit: 0,
          credit: amount,
          description: `Bank disbursement for expense claim ${claim.claim_number || claim.id.slice(0, 8)}`
        }
      ]
    });
  },

  // Performance
  async getAppraisalCycles(): Promise<HrmsAppraisalCycle[]> {
    const { data, error } = await supabase.from('hrms_appraisal_cycles').select('*').order('start_date', { ascending: false });
    if (error) console.error("Error fetching appraisal cycles:", error);
    return data || [];
  },

  async createAppraisalCycle(cycle: Partial<HrmsAppraisalCycle>) {
    return await apiDb.from('hrms_appraisal_cycles').insert(cycle).select().single();
  },

  async getEmployeeAppraisals(cycleId?: string): Promise<HrmsEmployeeAppraisal[]> {
    let query = supabase
      .from('hrms_employee_appraisals')
      .select(`
        *,
        employees(first_name, last_name, employee_id_code)
      `);
    if (cycleId) query = query.eq('appraisal_cycle_id', cycleId);
    const { data, error } = await query;
    if (error) console.error("Error fetching appraisals:", error);
    return data || [];
  },

  // Expenses
  async getExpenseClaims(): Promise<HrmsExpenseClaim[]> {
    const { data, error } = await supabase
      .from('hrms_expense_claims')
      .select(`
        *,
        employees(first_name, last_name, employee_id_code)
      `)
      .order('expense_date', { ascending: false });
    if (error) console.error("Error fetching expense claims:", error);
    return data || [];
  },

  async submitExpenseClaim(claim: Partial<HrmsExpenseClaim>) {
    return await apiDb.from('hrms_expense_claims').insert(claim).select().single();
  },

  async updateExpenseStatus(id: string, status: 'Approved' | 'Reimbursed' | 'Rejected') {
    const updateObj: any = { status };
    if (status === 'Reimbursed') updateObj.reimbursed_at = new Date().toISOString();
    return await apiDb.from('hrms_expense_claims').update(updateObj).eq('id', id).select().single();
  },

  // Resignations & FNF
  async getResignations(): Promise<HrmsResignation[]> {
    const { data, error } = await supabase
      .from('hrms_resignations')
      .select(`
        *,
        employees(first_name, last_name, employee_id_code)
      `)
      .order('resignation_date', { ascending: false });
    if (error) console.error("Error fetching resignations:", error);
    return data || [];
  },

  async submitResignation(resignation: Partial<HrmsResignation>) {
    return await apiDb.from('hrms_resignations').insert(resignation).select().single();
  },

  async updateResignationStatus(id: string, status: string, approvedDate?: string) {
    return await apiDb
      .from('hrms_resignations')
      .update({
        status,
        approved_last_working_date: approvedDate
      })
      .eq('id', id)
      .select()
      .single();
  },

  async getFnfSettlements(): Promise<HrmsFnfSettlement[]> {
    const { data, error } = await supabase
      .from('hrms_fnf_settlements')
      .select(`
        *,
        employees(first_name, last_name, employee_id_code)
      `)
      .order('settlement_date', { ascending: false });
    if (error) console.error("Error fetching FNF settlements:", error);
    return data || [];
  },

  async createFnfSettlement(fnf: Partial<HrmsFnfSettlement>) {
    return await apiDb.from('hrms_fnf_settlements').insert(fnf).select().single();
  },

  // Announcements & Help Desk
  async getAnnouncements(): Promise<HrmsAnnouncement[]> {
    const { data, error } = await supabase.from('hrms_announcements').select('*').order('created_at', { ascending: false });
    if (error) console.error("Error fetching announcements:", error);
    return data || [];
  },

  async createAnnouncement(announcement: Partial<HrmsAnnouncement>) {
    return await apiDb.from('hrms_announcements').insert(announcement).select().single();
  },

  async getHelpdeskTickets(): Promise<HrmsHelpdeskTicket[]> {
    const { data, error } = await supabase
      .from('hrms_helpdesk_tickets')
      .select(`
        *,
        employees(first_name, last_name, employee_id_code)
      `)
      .order('created_at', { ascending: false });
    if (error) console.error("Error fetching tickets:", error);
    return data || [];
  },

  async createHelpdeskTicket(ticket: Partial<HrmsHelpdeskTicket>) {
    return await apiDb.from('hrms_helpdesk_tickets').insert(ticket).select().single();
  }
};

export const hrmsService = HrmsApi;
export default HrmsApi;
