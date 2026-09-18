import { B as supabase } from "./supabase-y7n1teoy.mjs";
import { n as createAccountingEvent } from "./accounting-event-engine-BNKlssam.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/hrmsService-CXxFPXaN.js
var HrmsApi = {
	async getCompanies() {
		const { data, error } = await supabase.from("hrms_companies").select("*").order("name");
		if (error) console.error("Error fetching companies:", error);
		return data || [];
	},
	async createCompany(company) {
		return await supabase.from("hrms_companies").insert(company).select().single();
	},
	async getBranches() {
		const { data, error } = await supabase.from("hrms_branches").select("*").order("name");
		if (error) console.error("Error fetching branches:", error);
		return data || [];
	},
	async getDepartments() {
		const { data, error } = await supabase.from("departments").select("*").order("name");
		if (error) console.error("Error fetching departments:", error);
		return data || [];
	},
	async createDepartment(dept) {
		return await supabase.from("departments").insert(dept).select().single();
	},
	async getDesignations() {
		const { data, error } = await supabase.from("designations").select("*").order("title");
		if (error) console.error("Error fetching designations:", error);
		return data || [];
	},
	async createDesignation(desig) {
		return await supabase.from("designations").insert(desig).select().single();
	},
	async getEmployees() {
		const { data, error } = await supabase.from("employees").select(`
        *,
        departments(name),
        designations(title),
        hrms_branches(name)
      `).order("first_name");
		if (error) console.error("Error fetching employees:", error);
		return data || [];
	},
	sanitizeEmployeePayload(payload) {
		const EMPLOYEES_WRITE_KEYS = new Set([
			"employee_id_code",
			"user_id",
			"first_name",
			"last_name",
			"gender",
			"nationality",
			"date_of_birth",
			"mobile_number",
			"email",
			"department_id",
			"designation_id",
			"reporting_manager_id",
			"date_of_joining",
			"employment_type",
			"qid_passport_no",
			"id_expiry_date",
			"basic_salary",
			"hra",
			"tra",
			"other_allowances",
			"bank_name",
			"iban",
			"air_ticket",
			"employee_status",
			"emergency_contact_name",
			"emergency_contact_relation",
			"emergency_contact_number",
			"remarks",
			"company_id",
			"branch_id",
			"business_unit_id",
			"sub_department_id",
			"grade_id",
			"official_email",
			"marital_status",
			"contract_type",
			"probation_status",
			"probation_end_date",
			"confirmation_date",
			"notice_period_days",
			"date_of_exit",
			"exit_reason",
			"rehire_eligible",
			"device_user_id",
			"bank_account_holder",
			"bank_account_type",
			"swift_code",
			"emergency_contacts",
			"qualifications",
			"previous_experience"
		]);
		const sanitized = {};
		for (const [key, value] of Object.entries(payload)) {
			if (value === void 0) continue;
			if (key === "id" || key === "created_at" || key === "updated_at" || key === "total_salary") continue;
			if (EMPLOYEES_WRITE_KEYS.has(key)) sanitized[key] = value;
		}
		return sanitized;
	},
	async createEmployee(employeeData) {
		const sanitized = this.sanitizeEmployeePayload(employeeData);
		return await supabase.from("employees").insert(sanitized).select().single();
	},
	async updateEmployee(id, employeeData) {
		const sanitized = this.sanitizeEmployeePayload(employeeData);
		return await supabase.from("employees").update({
			...sanitized,
			updated_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", id).select().single();
	},
	async getShifts() {
		const { data, error } = await supabase.from("hrms_shifts").select("*").order("name");
		if (error) console.error("Error fetching shifts:", error);
		return data || [];
	},
	async createShift(shift) {
		return await supabase.from("hrms_shifts").insert(shift).select().single();
	},
	async getDailyAttendance(date) {
		let query = supabase.from("hrms_attendance_daily").select(`
        *,
        employees(first_name, last_name, employee_id_code)
      `).order("attendance_date", { ascending: false });
		if (date) query = query.eq("attendance_date", date);
		const { data, error } = await query;
		if (error) console.error("Error fetching attendance:", error);
		return data || [];
	},
	async recordAttendance(attendance) {
		return await supabase.from("hrms_attendance_daily").upsert(attendance, { onConflict: "employee_id,attendance_date" }).select().single();
	},
	async getLeaveTypes() {
		const { data, error } = await supabase.from("hrms_leave_types").select("*").order("name");
		if (error) console.error("Error fetching leave types:", error);
		return data || [];
	},
	async createLeaveType(leaveType) {
		return await supabase.from("hrms_leave_types").insert(leaveType).select().single();
	},
	async getLeaveApplications() {
		const { data, error } = await supabase.from("hrms_leave_applications").select(`
        *,
        employees(first_name, last_name, employee_id_code),
        hrms_leave_types(name, code, is_paid)
      `).order("applied_at", { ascending: false });
		if (error) console.error("Error fetching leave applications:", error);
		return data || [];
	},
	async applyLeaveWithValidation(application) {
		if (new Date(application.start_date) > new Date(application.end_date)) return { error: { message: "Start date cannot be after end date." } };
		const { data: existingLeaves } = await supabase.from("hrms_leave_applications").select("*").eq("employee_id", application.employee_id).in("status", ["Pending", "Approved"]);
		if (existingLeaves?.some((l) => {
			const existingStart = new Date(l.start_date);
			const existingEnd = new Date(l.end_date);
			const newStart = new Date(application.start_date);
			const newEnd = new Date(application.end_date);
			return newStart <= existingEnd && newEnd >= existingStart;
		})) return { error: { message: "Dates overlap with an existing approved or pending leave application." } };
		const currentYear = new Date(application.start_date).getFullYear();
		const { data: balanceData } = await supabase.from("hrms_leave_balances").select("*").eq("employee_id", application.employee_id).eq("leave_type_id", application.leave_type_id).eq("year", currentYear).maybeSingle();
		if (balanceData && Number(balanceData.balance) < application.days_count) return { error: { message: `Insufficient leave balance. Available: ${balanceData.balance} days, Requested: ${application.days_count} days.` } };
		return await supabase.from("hrms_leave_applications").insert(application).select().single();
	},
	async calculateFnfBreakdown(employeeId, resignationId, lwd) {
		const { data: emp } = await supabase.from("employees").select("*").eq("id", employeeId).single();
		if (!emp) return { error: { message: "Employee record not found" } };
		const basicSalary = Number(emp.basic_salary) || 0;
		const grossSalary = basicSalary + Number(emp.hra || 0) + Number(emp.tra || 0) + Number(emp.other_allowances || 0);
		const exitDate = new Date(lwd);
		const dayOfMonth = exitDate.getDate();
		const daysInMonth = new Date(exitDate.getFullYear(), exitDate.getMonth() + 1, 0).getDate();
		const unpaidSalary = Math.round(grossSalary / daysInMonth * dayOfMonth);
		const { data: leaveBalances } = await supabase.from("hrms_leave_balances").select("*, hrms_leave_types(is_encashable)").eq("employee_id", employeeId);
		let totalEncashableDays = 0;
		leaveBalances?.forEach((b) => {
			if (b.hrms_leave_types?.is_encashable && Number(b.balance) > 0) totalEncashableDays += Number(b.balance);
		});
		const perDayBasic = basicSalary / 30;
		const leaveEncashmentAmount = Math.round(totalEncashableDays * perDayBasic);
		let gratuityAmount = 0;
		if (emp.date_of_joining) {
			const joinDate = new Date(emp.date_of_joining);
			const diffYears = (exitDate.getTime() - joinDate.getTime()) / (1e3 * 60 * 60 * 24 * 365.25);
			if (diffYears >= 1) gratuityAmount = Math.round(diffYears * (basicSalary * (21 / 30)));
		}
		const { data: loans } = await supabase.from("hrms_employee_loans").select("remaining_balance").eq("employee_id", employeeId).eq("status", "Active");
		const totalLoanLiability = loans?.reduce((acc, l) => acc + Number(l.remaining_balance), 0) || 0;
		let assetRecoveryDeduction = 0;
		try {
			const { data: assignedAssets } = await supabase.from("assets").select("*").eq("assigned_to", employeeId).eq("status", "In Use");
			if (assignedAssets && assignedAssets.length > 0) assetRecoveryDeduction = assignedAssets.reduce((sum, a) => sum + (Number(a.purchase_cost) || 0), 0);
		} catch {}
		const totalGross = unpaidSalary + leaveEncashmentAmount + gratuityAmount;
		const totalDeductions = totalLoanLiability + assetRecoveryDeduction;
		const netPayable = Math.max(0, totalGross - totalDeductions);
		const fnfPayload = {
			resignation_id: resignationId,
			employee_id: employeeId,
			settlement_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
			last_working_date: lwd,
			unpaid_salary: unpaidSalary,
			leave_encashment: leaveEncashmentAmount,
			gratuity_amount: gratuityAmount,
			total_gross_settlement: totalGross,
			loan_deduction: totalLoanLiability,
			asset_recovery_deduction: assetRecoveryDeduction,
			total_deductions: totalDeductions,
			net_payable: netPayable,
			status: "Draft"
		};
		return await supabase.from("hrms_fnf_settlements").insert(fnfPayload).select().single();
	},
	async deductLeaveBalance(employeeId, leaveTypeId, daysCount, year) {
		const leaveYear = year || (/* @__PURE__ */ new Date()).getFullYear();
		const { data: existing } = await supabase.from("hrms_leave_balances").select("*").eq("employee_id", employeeId).eq("leave_type_id", leaveTypeId).eq("year", leaveYear).maybeSingle();
		if (existing) {
			const newUsed = (Number(existing.used) || 0) + daysCount;
			const newBalance = Math.max(0, (Number(existing.allocated) || 0) - newUsed);
			return await supabase.from("hrms_leave_balances").update({
				used: newUsed,
				balance: newBalance
			}).eq("id", existing.id);
		} else {
			const { data: lt } = await supabase.from("hrms_leave_types").select("annual_allowance").eq("id", leaveTypeId).single();
			const annualAllowance = Number(lt?.annual_allowance) || 30;
			const balance = Math.max(0, annualAllowance - daysCount);
			return await supabase.from("hrms_leave_balances").insert({
				employee_id: employeeId,
				leave_type_id: leaveTypeId,
				year: leaveYear,
				allocated: annualAllowance,
				used: daysCount,
				balance
			});
		}
	},
	async updateLeaveStatus(id, status, review_notes) {
		const res = await supabase.from("hrms_leave_applications").update({
			status,
			reviewed_at: (/* @__PURE__ */ new Date()).toISOString(),
			review_notes
		}).eq("id", id).select("*, hrms_leave_types(name)").single();
		if (!res.error && res.data && status === "Approved") {
			const app = res.data;
			await this.deductLeaveBalance(app.employee_id, app.leave_type_id, Number(app.days_count) || 1);
		}
		return res;
	},
	async getPayrollCycles() {
		try {
			const { data, error } = await supabase.from("hrms_payroll_cycles").select("*").order("cycle_year", { ascending: false }).order("cycle_month", { ascending: false });
			if (!error && data) return data;
		} catch (e) {
			console.error("Error fetching payroll cycles:", e);
		}
		return [];
	},
	async createPayrollCycle(cycle) {
		return await supabase.from("hrms_payroll_cycles").insert(cycle).select().single();
	},
	async getPayslipsByCycle(cycleId) {
		try {
			const { data, error } = await supabase.from("hrms_payroll_payslips").select(`
          *,
          employees(first_name, last_name, employee_id_code, email)
        `).eq("payroll_cycle_id", cycleId);
			if (!error && data) return data;
		} catch (e) {
			console.error("Error fetching payslips:", e);
		}
		return [];
	},
	async generatePayrollForCycle(cycleId) {
		try {
			const { data: cycle } = await supabase.from("hrms_payroll_cycles").select("*").eq("id", cycleId).single();
			let emps = [];
			const isValidPersonnel = (e) => {
				const fName = (e.first_name || "").trim();
				const lName = (e.last_name || "").trim();
				const fullName = `${fName} ${lName}`.trim();
				const isPlaceholder = /^Employee\s*(\d+)?$/i.test(fName) || /^Employee\s*(\d+)?$/i.test(fullName) || fName.toLowerCase() === "employee" && !lName;
				const totalSalary = Number(e.basic_salary || 0) + Number(e.hra || 0) + Number(e.tra || 0);
				if (isPlaceholder) return false;
				if (/employee/i.test(fullName) && (totalSalary === 0 || Number(e.basic_salary || 0) === 0)) return false;
				return e.employee_status !== "Terminated";
			};
			try {
				const { data } = await supabase.from("employees").select("*, departments(name), designations(title)");
				if (data && data.length > 0) emps = data.filter(isValidPersonnel);
			} catch {}
			if (emps.length === 0) {
				emps = await this.getEmployees();
				emps = emps.filter(isValidPersonnel);
			}
			if (emps.length === 0) return {
				error: "No active employees found to process",
				count: 0
			};
			const startDate = cycle?.start_date || `${cycle?.cycle_year || (/* @__PURE__ */ new Date()).getFullYear()}-${String(cycle?.cycle_month || (/* @__PURE__ */ new Date()).getMonth() + 1).padStart(2, "0")}-01`;
			const endDate = cycle?.end_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
			const { data: attendanceRows } = await supabase.from("hrms_attendance_daily").select("*").gte("attendance_date", startDate).lte("attendance_date", endDate);
			const { data: activeLoans } = await supabase.from("hrms_employee_loans").select("*").eq("status", "Active");
			const payslips = emps.map((emp) => {
				const basic = Number(emp.basic_salary) || 3500;
				const allowances = (Number(emp.hra) || 1200) + (Number(emp.tra) || 500) + (Number(emp.other_allowances) || 0);
				const empAttendance = attendanceRows?.filter((a) => a.employee_id === emp.id) || [];
				const presentDays = empAttendance.filter((a) => a.status === "PRESENT" || a.status === "HALF_DAY").length || 30;
				const unpaidLeaves = empAttendance.filter((a) => a.status === "ABSENT" || a.status === "UNPAID_LEAVE").length || 0;
				const paidLeaves = empAttendance.filter((a) => a.status === "LEAVE" || a.status === "PAID_LEAVE").length || 0;
				const overtimeMinutes = empAttendance.reduce((sum, a) => sum + (Number(a.overtime_minutes) || 0), 0);
				const overtimeHours = Math.round(overtimeMinutes / 60 * 10) / 10;
				const hourlyRate = basic / 240;
				const overtimePay = Math.round(overtimeHours * hourlyRate * 1.25);
				const gross = basic + allowances + overtimePay;
				const statutory = gross > 5e3 ? Math.round(gross * .05) : 0;
				const empLoan = activeLoans?.find((l) => l.employee_id === emp.id);
				const loanDeduction = Number(empLoan?.monthly_deduction) || 0;
				const totalDeductions = statutory + loanDeduction;
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
					allowances,
					overtime_pay: overtimePay,
					incentives: 0,
					gross_earnings: gross,
					statutory_deductions: statutory,
					loan_deductions: loanDeduction,
					fines_deductions: 0,
					total_deductions: totalDeductions,
					net_salary: net,
					status: "Generated",
					employees: {
						first_name: emp.first_name,
						last_name: emp.last_name || "",
						employee_id_code: emp.employee_id_code || "EMP",
						email: emp.email || "",
						departments: emp.departments,
						designations: emp.designations
					}
				};
			});
			const totalGross = payslips.reduce((acc, p) => acc + p.gross_earnings, 0);
			const totalDeductions = payslips.reduce((acc, p) => acc + p.total_deductions, 0);
			const totalNet = payslips.reduce((acc, p) => acc + p.net_salary, 0);
			try {
				await supabase.from("hrms_payroll_payslips").delete().eq("payroll_cycle_id", cycleId);
				await supabase.from("hrms_payroll_payslips").insert(payslips.map(({ employees, ...p }) => p));
				await supabase.from("hrms_payroll_cycles").update({
					total_gross: totalGross,
					total_deductions: totalDeductions,
					total_net: totalNet,
					total_employees: payslips.length,
					status: "Processing"
				}).eq("id", cycleId);
			} catch (dbErr) {
				console.error("Database payroll update error:", dbErr);
			}
			return {
				error: null,
				count: payslips.length,
				totalGross,
				totalNet
			};
		} catch (err) {
			console.error("generatePayrollForCycle error:", err);
			return {
				error: err?.message || "Calculation failed",
				count: 0
			};
		}
	},
	async approvePayrollCycle(cycleId) {
		return await supabase.from("hrms_payroll_cycles").update({
			status: "Approved",
			approved_at: (/* @__PURE__ */ new Date()).toISOString()
		}).eq("id", cycleId).select().single();
	},
	async postFnfToGL(fnf) {
		const eventDate = fnf.settlement_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		const lines = [];
		if (fnf.gratuity_amount > 0) {
			lines.push({
				account_code: "54100",
				account_name: "Gratuity Expense",
				debit: Number(fnf.gratuity_amount),
				credit: 0,
				description: `FNF Gratuity for Employee ${fnf.employee_id}`
			});
			lines.push({
				account_code: "21900",
				account_name: "Payroll Payable",
				debit: 0,
				credit: Number(fnf.gratuity_amount),
				description: `FNF Gratuity Payable for Employee ${fnf.employee_id}`
			});
		}
		if (fnf.leave_encashment > 0) {
			lines.push({
				account_code: "54200",
				account_name: "Leave Encashment Expense",
				debit: Number(fnf.leave_encashment),
				credit: 0,
				description: `FNF Leave Encashment for Employee ${fnf.employee_id}`
			});
			lines.push({
				account_code: "21900",
				account_name: "Payroll Payable",
				debit: 0,
				credit: Number(fnf.leave_encashment),
				description: `FNF Leave Encashment Payable for Employee ${fnf.employee_id}`
			});
		}
		if (fnf.unpaid_salary > 0) {
			lines.push({
				account_code: "50100",
				account_name: "Salary Expense",
				debit: Number(fnf.unpaid_salary),
				credit: 0,
				description: `FNF Unpaid Salary for Employee ${fnf.employee_id}`
			});
			lines.push({
				account_code: "21900",
				account_name: "Payroll Payable",
				debit: 0,
				credit: Number(fnf.unpaid_salary),
				description: `FNF Unpaid Salary Payable for Employee ${fnf.employee_id}`
			});
		}
		if (fnf.loan_deduction > 0) {
			lines.push({
				account_code: "21900",
				account_name: "Payroll Payable",
				debit: Number(fnf.loan_deduction),
				credit: 0,
				description: `FNF Loan Recovery for Employee ${fnf.employee_id}`
			});
			lines.push({
				account_code: "13100",
				account_name: "Employee Loans Receivable",
				debit: 0,
				credit: Number(fnf.loan_deduction),
				description: `FNF Loan Recovery from Employee ${fnf.employee_id}`
			});
		}
		if (fnf.net_payable > 0) {
			lines.push({
				account_code: "21900",
				account_name: "Payroll Payable",
				debit: Number(fnf.net_payable),
				credit: 0,
				description: `FNF Net Settlement Settlement for Employee ${fnf.employee_id}`
			});
			lines.push({
				account_code: "12000",
				account_name: "Bank Account",
				debit: 0,
				credit: Number(fnf.net_payable),
				description: `FNF Bank Disbursement for Employee ${fnf.employee_id}`
			});
		}
		if (lines.length > 0) return await createAccountingEvent({
			event_type: "HRMS_FNF_SETTLEMENT",
			source_type: "HRMS_FNF",
			source_id: fnf.id,
			event_date: eventDate,
			posting_date: eventDate,
			description: `Full and Final Settlement GL Posting - FNF #${fnf.id.slice(0, 8)}`,
			idempotency_key: `fnf-gl-${fnf.id}`,
			lines
		});
	},
	async postExpenseReimbursementToGL(claim) {
		const eventDate = claim.expense_date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
		const amount = Number(claim.amount) || 0;
		if (amount <= 0) return;
		return await createAccountingEvent({
			event_type: "HRMS_EXPENSE_REIMBURSEMENT",
			source_type: "HRMS_EXPENSE",
			source_id: claim.id,
			event_date: eventDate,
			posting_date: eventDate,
			description: `Staff Expense Reimbursement: ${claim.title || claim.category} (${claim.claim_number || claim.id.slice(0, 8)})`,
			idempotency_key: `hrms-exp-${claim.id}`,
			lines: [{
				account_code: "55000",
				account_name: "Staff Expense Claims",
				debit: amount,
				credit: 0,
				description: `Expense claim reimbursement for ${claim.title || claim.category}`
			}, {
				account_code: "12000",
				account_name: "Bank Account",
				debit: 0,
				credit: amount,
				description: `Bank disbursement for expense claim ${claim.claim_number || claim.id.slice(0, 8)}`
			}]
		});
	},
	async getAppraisalCycles() {
		const { data, error } = await supabase.from("hrms_appraisal_cycles").select("*").order("start_date", { ascending: false });
		if (error) console.error("Error fetching appraisal cycles:", error);
		return data || [];
	},
	async createAppraisalCycle(cycle) {
		return await supabase.from("hrms_appraisal_cycles").insert(cycle).select().single();
	},
	async getEmployeeAppraisals(cycleId) {
		let query = supabase.from("hrms_employee_appraisals").select(`
        *,
        employees(first_name, last_name, employee_id_code)
      `);
		if (cycleId) query = query.eq("appraisal_cycle_id", cycleId);
		const { data, error } = await query;
		if (error) console.error("Error fetching appraisals:", error);
		return data || [];
	},
	async getExpenseClaims() {
		const { data, error } = await supabase.from("hrms_expense_claims").select(`
        *,
        employees(first_name, last_name, employee_id_code)
      `).order("expense_date", { ascending: false });
		if (error) console.error("Error fetching expense claims:", error);
		return data || [];
	},
	async submitExpenseClaim(claim) {
		return await supabase.from("hrms_expense_claims").insert(claim).select().single();
	},
	async updateExpenseStatus(id, status) {
		const updateObj = { status };
		if (status === "Reimbursed") updateObj.reimbursed_at = (/* @__PURE__ */ new Date()).toISOString();
		return await supabase.from("hrms_expense_claims").update(updateObj).eq("id", id).select().single();
	},
	async getResignations() {
		const { data, error } = await supabase.from("hrms_resignations").select(`
        *,
        employees(first_name, last_name, employee_id_code)
      `).order("resignation_date", { ascending: false });
		if (error) console.error("Error fetching resignations:", error);
		return data || [];
	},
	async submitResignation(resignation) {
		return await supabase.from("hrms_resignations").insert(resignation).select().single();
	},
	async updateResignationStatus(id, status, approvedDate) {
		return await supabase.from("hrms_resignations").update({
			status,
			approved_last_working_date: approvedDate
		}).eq("id", id).select().single();
	},
	async getFnfSettlements() {
		const { data, error } = await supabase.from("hrms_fnf_settlements").select(`
        *,
        employees(first_name, last_name, employee_id_code)
      `).order("settlement_date", { ascending: false });
		if (error) console.error("Error fetching FNF settlements:", error);
		return data || [];
	},
	async createFnfSettlement(fnf) {
		return await supabase.from("hrms_fnf_settlements").insert(fnf).select().single();
	},
	async getAnnouncements() {
		const { data, error } = await supabase.from("hrms_announcements").select("*").order("created_at", { ascending: false });
		if (error) console.error("Error fetching announcements:", error);
		return data || [];
	},
	async createAnnouncement(announcement) {
		return await supabase.from("hrms_announcements").insert(announcement).select().single();
	},
	async getHelpdeskTickets() {
		const { data, error } = await supabase.from("hrms_helpdesk_tickets").select(`
        *,
        employees(first_name, last_name, employee_id_code)
      `).order("created_at", { ascending: false });
		if (error) console.error("Error fetching tickets:", error);
		return data || [];
	},
	async createHelpdeskTicket(ticket) {
		return await supabase.from("hrms_helpdesk_tickets").insert(ticket).select().single();
	}
};
var hrmsService = HrmsApi;
//#endregion
export { hrmsService as n, HrmsApi as t };
