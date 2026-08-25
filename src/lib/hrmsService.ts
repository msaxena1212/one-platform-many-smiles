import { supabase } from "@/lib/supabase";

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
  employees?: any;
  hrms_leave_types?: HrmsLeaveType;
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
  incentives: number;
  gross_earnings: number;
  statutory_deductions: number;
  loan_deductions: number;
  fines_deductions: number;
  total_deductions: number;
  net_salary: number;
  status: string;
  employees?: any;
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
    return await supabase.from('hrms_companies').insert(company).select().single();
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
    return await supabase.from('departments').insert(dept).select().single();
  },

  async getDesignations(): Promise<HrmsDesignation[]> {
    const { data, error } = await supabase.from('designations').select('*').order('title');
    if (error) console.error("Error fetching designations:", error);
    return data || [];
  },

  async createDesignation(desig: { title: string; department_id?: string }) {
    return await supabase.from('designations').insert(desig).select().single();
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
    return data || [];
  },

  async createEmployee(employeeData: any) {
    return await supabase.from('employees').insert(employeeData).select().single();
  },

  async updateEmployee(id: string, employeeData: any) {
    return await supabase.from('employees').update(employeeData).eq('id', id).select().single();
  },

  // Workforce & Shifts
  async getShifts(): Promise<HrmsShift[]> {
    const { data, error } = await supabase.from('hrms_shifts').select('*').order('name');
    if (error) console.error("Error fetching shifts:", error);
    return data || [];
  },

  async createShift(shift: Partial<HrmsShift>) {
    return await supabase.from('hrms_shifts').insert(shift).select().single();
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
    return await supabase
      .from('hrms_attendance_daily')
      .upsert(attendance, { onConflict: 'employee_id,attendance_date' })
      .select()
      .single();
  },

  // Leaves
  async getLeaveTypes(): Promise<HrmsLeaveType[]> {
    const { data, error } = await supabase.from('hrms_leave_types').select('*').order('name');
    if (error) console.error("Error fetching leave types:", error);
    return data || [];
  },

  async createLeaveType(leaveType: Partial<HrmsLeaveType>) {
    return await supabase.from('hrms_leave_types').insert(leaveType).select().single();
  },

  async getLeaveApplications(): Promise<HrmsLeaveApplication[]> {
    const { data, error } = await supabase
      .from('hrms_leave_applications')
      .select(`
        *,
        employees(first_name, last_name, employee_id_code),
        hrms_leave_types(name, code, is_paid)
      `)
      .order('applied_at', { ascending: false });
    if (error) console.error("Error fetching leave applications:", error);
    return data || [];
  },

  // Comprehensive Leave Edge-Case Handlers
  async applyLeaveWithValidation(application: {
    employee_id: string;
    leave_type_id: string;
    start_date: string;
    end_date: string;
    days_count: number;
    reason: string;
  }) {
    // 1. Check Date Sequence
    if (new Date(application.start_date) > new Date(application.end_date)) {
      return { error: { message: "Start date cannot be after end date." } };
    }

    // 2. Check Overlapping Existing Leaves
    const { data: existingLeaves } = await supabase
      .from('hrms_leave_applications')
      .select('*')
      .eq('employee_id', application.employee_id)
      .in('status', ['Pending', 'Approved']);

    const isOverlap = existingLeaves?.some(l => {
      const existingStart = new Date(l.start_date);
      const existingEnd = new Date(l.end_date);
      const newStart = new Date(application.start_date);
      const newEnd = new Date(application.end_date);
      return (newStart <= existingEnd && newEnd >= existingStart);
    });

    if (isOverlap) {
      return { error: { message: "Dates overlap with an existing approved or pending leave application." } };
    }

    // 3. Check Leave Balance
    const currentYear = new Date(application.start_date).getFullYear();
    const { data: balanceData } = await supabase
      .from('hrms_leave_balances')
      .select('*')
      .eq('employee_id', application.employee_id)
      .eq('leave_type_id', application.leave_type_id)
      .eq('year', currentYear)
      .maybeSingle();

    if (balanceData && (Number(balanceData.balance) < application.days_count)) {
      return { error: { message: `Insufficient leave balance. Available: ${balanceData.balance} days, Requested: ${application.days_count} days.` } };
    }

    return await supabase.from('hrms_leave_applications').insert(application).select().single();
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

    const totalGross = unpaidSalary + leaveEncashmentAmount + gratuityAmount;
    const totalDeductions = totalLoanLiability;
    const netPayable = totalGross - totalDeductions;

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
      asset_recovery_deduction: 0,
      total_deductions: totalDeductions,
      net_payable: netPayable,
      status: 'Draft'
    };

    return await supabase.from('hrms_fnf_settlements').insert(fnfPayload).select().single();
  },

  async updateLeaveStatus(id: string, status: 'Approved' | 'Rejected' | 'Cancelled', review_notes?: string) {
    return await supabase
      .from('hrms_leave_applications')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        review_notes
      })
      .eq('id', id)
      .select()
      .single();
  },

  // Payroll
  async getPayrollCycles(): Promise<HrmsPayrollCycle[]> {
    const { data, error } = await supabase
      .from('hrms_payroll_cycles')
      .select('*')
      .order('cycle_year', { ascending: false })
      .order('cycle_month', { ascending: false });
    if (error) console.error("Error fetching payroll cycles:", error);
    return data || [];
  },

  async createPayrollCycle(cycle: Partial<HrmsPayrollCycle>) {
    return await supabase.from('hrms_payroll_cycles').insert(cycle).select().single();
  },

  async getPayslipsByCycle(cycleId: string): Promise<HrmsPayslip[]> {
    const { data, error } = await supabase
      .from('hrms_payroll_payslips')
      .select(`
        *,
        employees(first_name, last_name, employee_id_code, email)
      `)
      .eq('payroll_cycle_id', cycleId);
    if (error) console.error("Error fetching payslips:", error);
    return data || [];
  },

  async generatePayrollForCycle(cycleId: string) {
    const { data: emps } = await supabase.from('employees').select('*').eq('employee_status', 'Active');
    if (!emps || emps.length === 0) return { error: 'No active employees found' };

    const payslips = emps.map(emp => {
      const basic = Number(emp.basic_salary) || 3000;
      const hra = Number(emp.hra) || 1000;
      const tra = Number(emp.tra) || 500;
      const allowances = hra + tra + (Number(emp.other_allowances) || 0);
      const gross = basic + allowances;
      const statutory = gross > 5000 ? Math.round(gross * 0.05) : 0;
      const net = gross - statutory;

      return {
        payroll_cycle_id: cycleId,
        employee_id: emp.id,
        working_days: 30,
        present_days: 30,
        paid_leaves: 0,
        unpaid_leaves: 0,
        overtime_hours: 0,
        basic_pay: basic,
        allowances: allowances,
        overtime_pay: 0,
        incentives: 0,
        gross_earnings: gross,
        statutory_deductions: statutory,
        loan_deductions: 0,
        fines_deductions: 0,
        total_deductions: statutory,
        net_salary: net,
        status: 'Generated'
      };
    });

    const totalGross = payslips.reduce((acc, p) => acc + p.gross_earnings, 0);
    const totalDeductions = payslips.reduce((acc, p) => acc + p.total_deductions, 0);
    const totalNet = payslips.reduce((acc, p) => acc + p.net_salary, 0);

    await supabase.from('hrms_payroll_payslips').delete().eq('payroll_cycle_id', cycleId);
    const { error } = await supabase.from('hrms_payroll_payslips').insert(payslips);
    
    if (!error) {
      await supabase.from('hrms_payroll_cycles').update({
        total_gross: totalGross,
        total_deductions: totalDeductions,
        total_net: totalNet,
        total_employees: payslips.length,
        status: 'Processing'
      }).eq('id', cycleId);
    }

    return { error, count: payslips.length };
  },

  async approvePayrollCycle(cycleId: string) {
    return await supabase
      .from('hrms_payroll_cycles')
      .update({
        status: 'Approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', cycleId)
      .select()
      .single();
  },

  // Performance
  async getAppraisalCycles(): Promise<HrmsAppraisalCycle[]> {
    const { data, error } = await supabase.from('hrms_appraisal_cycles').select('*').order('start_date', { ascending: false });
    if (error) console.error("Error fetching appraisal cycles:", error);
    return data || [];
  },

  async createAppraisalCycle(cycle: Partial<HrmsAppraisalCycle>) {
    return await supabase.from('hrms_appraisal_cycles').insert(cycle).select().single();
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
    return await supabase.from('hrms_expense_claims').insert(claim).select().single();
  },

  async updateExpenseStatus(id: string, status: 'Approved' | 'Reimbursed' | 'Rejected') {
    const updateObj: any = { status };
    if (status === 'Reimbursed') updateObj.reimbursed_at = new Date().toISOString();
    return await supabase.from('hrms_expense_claims').update(updateObj).eq('id', id).select().single();
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
    return await supabase.from('hrms_resignations').insert(resignation).select().single();
  },

  async updateResignationStatus(id: string, status: string, approvedDate?: string) {
    return await supabase
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
    return await supabase.from('hrms_fnf_settlements').insert(fnf).select().single();
  },

  // Announcements & Help Desk
  async getAnnouncements(): Promise<HrmsAnnouncement[]> {
    const { data, error } = await supabase.from('hrms_announcements').select('*').order('created_at', { ascending: false });
    if (error) console.error("Error fetching announcements:", error);
    return data || [];
  },

  async createAnnouncement(announcement: Partial<HrmsAnnouncement>) {
    return await supabase.from('hrms_announcements').insert(announcement).select().single();
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
    return await supabase.from('hrms_helpdesk_tickets').insert(ticket).select().single();
  }
};
