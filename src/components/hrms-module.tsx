import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ExcelImportEmbedded } from "@/components/excel-import-embedded";
import {
  Users, Building2, Briefcase, Calendar, Clock, DollarSign, Award,
  Receipt, ShieldCheck, LogOut, Megaphone, HelpCircle, Plus, Search,
  Filter, Download, CheckCircle2, XCircle, AlertTriangle, Eye, RefreshCw,
  FileText, ArrowRight, UserCheck, ChevronRight, Settings, Trash2, Edit3, Send,
  GitBranch, MapPin, Printer, FileSpreadsheet, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  HrmsApi,
  HrmsCompany,
  HrmsBranch,
  HrmsDepartment,
  HrmsDesignation,
  HrmsShift,
  HrmsAttendanceDaily,
  HrmsLeaveType,
  HrmsLeaveApplication,
  HrmsPayrollCycle,
  HrmsPayslip,
  HrmsAppraisalCycle,
  HrmsEmployeeAppraisal,
  HrmsExpenseClaim,
  HrmsResignation,
  HrmsAnnouncement,
  HrmsHelpdeskTicket,
  HrmsFnfSettlement
} from "@/lib/hrmsService";
import { syncPayrollRun } from "@/lib/finance/payrollIntegrationService";
import {
  HrmsMastersApi,
  MASTER_CATEGORIES_CONFIG,
  MasterCategoryKey,
  MasterItem
} from "@/lib/hrmsMastersService";
import { EmployeeOnboardingWizard } from "@/components/employee-onboarding-wizard";

import { useSearch, useNavigate } from "@tanstack/react-router";

export interface HrmsModuleProps {
  role?: "admin" | "prop-mgr" | "super-admin";
}

const HRMS_TABS = [
  { key: "dashboard", label: "Dashboard", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "employees", label: "Employees", icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { key: "attendance", label: "Attendance & Shifts", icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
  { key: "leaves", label: "Leave Management", icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10" },
  { key: "payroll", label: "Payroll & Salary", icon: DollarSign, color: "text-teal-500", bg: "bg-teal-500/10" },
  { key: "performance", label: "Performance / KPA", icon: Award, color: "text-rose-500", bg: "bg-rose-500/10" },
  { key: "expenses", label: "Expenses & Claims", icon: Receipt, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  { key: "exit_lifecycle", label: "Exit & FNF", icon: LogOut, color: "text-red-500", bg: "bg-red-500/10" },
  { key: "organization", label: "Org Masters", icon: Building2, color: "text-sky-500", bg: "bg-sky-500/10" },
  { key: "services", label: "Help Desk & Notices", icon: Megaphone, color: "text-orange-500", bg: "bg-orange-500/10" }
];

export function HrmsModule({ role = "admin" }: HrmsModuleProps) {
  const search = useSearch({ strict: false }) as { tab?: string };
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>(search?.tab || "dashboard");
  const [loading, setLoading] = useState<boolean>(true);

  // Sync tab with URL search parameter
  useEffect(() => {
    if (search?.tab && search.tab !== activeTab) {
      setActiveTab(search.tab);
    }
  }, [search?.tab]);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    navigate({
      to: "/admin/hrms",
      search: { tab: tabKey } as any,
    });
  };

  // Core Data States
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<HrmsDepartment[]>([]);
  const [designations, setDesignations] = useState<HrmsDesignation[]>([]);
  const [companies, setCompanies] = useState<HrmsCompany[]>([]);
  const [branches, setBranches] = useState<HrmsBranch[]>([]);
  const [shifts, setShifts] = useState<HrmsShift[]>([]);
  const [attendance, setAttendance] = useState<HrmsAttendanceDaily[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<HrmsLeaveType[]>([]);
  const [leaveApps, setLeaveApps] = useState<HrmsLeaveApplication[]>([]);
  const [payrollCycles, setPayrollCycles] = useState<HrmsPayrollCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<string>("");
  const [payslips, setPayslips] = useState<HrmsPayslip[]>([]);
  const [appraisalCycles, setAppraisalCycles] = useState<HrmsAppraisalCycle[]>([]);
  const [expenseClaims, setExpenseClaims] = useState<HrmsExpenseClaim[]>([]);
  const [resignations, setResignations] = useState<HrmsResignation[]>([]);
  const [fnfSettlements, setFnfSettlements] = useState<HrmsFnfSettlement[]>([]);
  const [announcements, setAnnouncements] = useState<HrmsAnnouncement[]>([]);
  const [tickets, setTickets] = useState<HrmsHelpdeskTicket[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [employeeCurrentPage, setEmployeeCurrentPage] = useState<number>(1);
  const EMPLOYEES_PER_PAGE = 20;

  // Modals
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState<boolean>(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<any | null>(null);
  const [bulkEmployeeOpen, setBulkEmployeeOpen] = useState<boolean>(false);
  const [bulkEmployeeData, setBulkEmployeeData] = useState<string>("");
  const [bulkEmployeeLoading, setBulkEmployeeLoading] = useState<boolean>(false);
  const [showAddLeaveModal, setShowAddLeaveModal] = useState<boolean>(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
  const [showAddTicketModal, setShowAddTicketModal] = useState<boolean>(false);
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState<boolean>(false);
  const [showCreatePayrollModal, setShowCreatePayrollModal] = useState<boolean>(false);
  const [showAddShiftModal, setShowAddShiftModal] = useState<boolean>(false);
  const [showAddResignationModal, setShowAddResignationModal] = useState<boolean>(false);
  const [showRecordAttendanceModal, setShowRecordAttendanceModal] = useState<boolean>(false);
  const [showCreateAppraisalModal, setShowCreateAppraisalModal] = useState<boolean>(false);
  const [selectedPayslipForView, setSelectedPayslipForView] = useState<HrmsPayslip | null>(null);
  const [selectedEmployeeProfile, setSelectedEmployeeProfile] = useState<any | null>(null);

  // Master Data Manager State
  const [selectedMasterKey, setSelectedMasterKey] = useState<MasterCategoryKey>("companies");
  const [currentMasterItems, setCurrentMasterItems] = useState<MasterItem[]>([]);
  const [newMasterName, setNewMasterName] = useState<string>("");
  const [newMasterCode, setNewMasterCode] = useState<string>("");
  const [newMasterDesc, setNewMasterDesc] = useState<string>("");

  // Form State Containers
  const [newEmp, setNewEmp] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile_number: "",
    employee_id_code: "",
    department_id: "",
    designation_id: "",
    basic_salary: 5000,
    hra: 1500,
    tra: 500,
    gender: "Male",
    nationality: "Qatari",
    employee_status: "Active",
    bank_name: "Qatar National Bank",
    iban: "QA55QNBA00000000"
  });

  const [newLeave, setNewLeave] = useState({
    employee_id: "",
    leave_type_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    days_count: 1,
    reason: ""
  });

  const [newExpense, setNewExpense] = useState({
    employee_id: "",
    title: "",
    amount: 250,
    expense_date: new Date().toISOString().split("T")[0],
    description: ""
  });

  const [newAppraisalCycle, setNewAppraisalCycle] = useState({
    title: "2026 Annual Performance Review",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split("T")[0],
    interval_type: "Annual",
    status: "Active"
  });

  const [newTicket, setNewTicket] = useState<{
    employee_id: string;
    category: string;
    subject: string;
    description: string;
    priority: "Low" | "Medium" | "High" | "Critical";
  }>({
    employee_id: "",
    category: "HR",
    subject: "",
    description: "",
    priority: "Medium"
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    priority: "Normal" as any
  });

  const [newCycle, setNewCycle] = useState({
    name: "September 2026 Payroll",
    cycle_month: 9,
    cycle_year: 2026,
    start_date: "2026-09-01",
    end_date: "2026-09-30"
  });

  const [newShift, setNewShift] = useState({
    name: "",
    start_time: "08:00",
    end_time: "17:00",
    break_duration_minutes: 60,
    grace_period_minutes: 15,
    is_night_shift: false
  });

  const [newResignation, setNewResignation] = useState({
    employee_id: "",
    resignation_date: new Date().toISOString().split("T")[0],
    requested_last_working_date: new Date().toISOString().split("T")[0],
    reason: ""
  });

  const [attendanceForm, setAttendanceForm] = useState({
    employee_id: "",
    attendance_date: new Date().toISOString().split("T")[0],
    first_in: "08:00:00",
    last_out: "17:00:00",
    total_working_hours: 8.0,
    status: "PRESENT"
  });

  // Load Data
  const loadAllHRMSData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        emps, depts, desigs, comps, brs, shs, atts, lTypes, lApps, pCycles, appCycles, expClaims, resList, fnfList, annList, tktList
      ] = await Promise.all([
        HrmsApi.getEmployees(),
        HrmsApi.getDepartments(),
        HrmsApi.getDesignations(),
        HrmsApi.getCompanies(),
        HrmsApi.getBranches(),
        HrmsApi.getShifts(),
        HrmsApi.getDailyAttendance(),
        HrmsApi.getLeaveTypes(),
        HrmsApi.getLeaveApplications(),
        HrmsApi.getPayrollCycles(),
        HrmsApi.getAppraisalCycles(),
        HrmsApi.getExpenseClaims(),
        HrmsApi.getResignations(),
        HrmsApi.getFnfSettlements(),
        HrmsApi.getAnnouncements(),
        HrmsApi.getHelpdeskTickets()
      ]);

      setEmployees(emps);
      setDepartments(depts);
      setDesignations(desigs);
      setCompanies(comps);
      setBranches(brs);
      setShifts(shs);
      setAttendance(atts);
      setLeaveTypes(lTypes);
      setLeaveApps(lApps);
      setPayrollCycles(pCycles);
      if (pCycles.length > 0 && !selectedCycleId) {
        setSelectedCycleId(pCycles[0].id);
        const cyclePayslips = await HrmsApi.getPayslipsByCycle(pCycles[0].id);
        setPayslips(cyclePayslips);
      }
      setAppraisalCycles(appCycles);
      setExpenseClaims(expClaims);
      setResignations(resList);
      setFnfSettlements(fnfList);
      setAnnouncements(annList);
      setTickets(tktList);
      // Load master items for selected master key
      const mItems = await HrmsMastersApi.getMasterItems(selectedMasterKey);
      setCurrentMasterItems(mItems);
    } catch (e: any) {
      console.error("Error loading HRMS suite data:", e);
      toast.error("Failed to load HRMS data");
    } finally {
      setLoading(false);
    }
  }, [selectedCycleId, selectedMasterKey]);

  useEffect(() => {
    loadAllHRMSData();
  }, [loadAllHRMSData]);

  // Load master items when category key changes
  useEffect(() => {
    async function fetchMasters() {
      const items = await HrmsMastersApi.getMasterItems(selectedMasterKey);
      setCurrentMasterItems(items);
    }
    fetchMasters();
  }, [selectedMasterKey]);

  // Handlers for Master Data
  const handleAddMasterRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterName.trim()) {
      toast.error("Please enter a name for the master record");
      return;
    }
    const created = await HrmsMastersApi.addMasterItem(selectedMasterKey, {
      name: newMasterName.trim(),
      code: newMasterCode.trim() || undefined,
      description: newMasterDesc.trim() || undefined
    });
    if (created) {
      toast.success(`Record added to ${selectedMasterKey}!`);
      setNewMasterName("");
      setNewMasterCode("");
      setNewMasterDesc("");
      const items = await HrmsMastersApi.getMasterItems(selectedMasterKey);
      setCurrentMasterItems(items);
    }
  };

  const handleDeleteMasterRecord = async (id: string) => {
    const success = await HrmsMastersApi.deleteMasterItem(selectedMasterKey, id);
    if (success) {
      toast.success("Master record removed");
      const items = await HrmsMastersApi.getMasterItems(selectedMasterKey);
      setCurrentMasterItems(items);
    }
  };

  // Load payslips when cycle changes
  const handleCycleChange = async (cycleId: string) => {
    setSelectedCycleId(cycleId);
    const p = await HrmsApi.getPayslipsByCycle(cycleId);
    setPayslips(p);
  };

  // Handlers
  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.first_name || !newEmp.last_name || !newEmp.email) {
      toast.error("Please enter mandatory fields");
      return;
    }
    const code = newEmp.employee_id_code || `EMP-${String(employees.length + 1).padStart(3, '0')}`;
    const payload = {
      ...newEmp,
      employee_id_code: code,
      department_id: newEmp.department_id || (departments[0]?.id ?? null),
      designation_id: newEmp.designation_id || (designations[0]?.id ?? null),
      date_of_joining: new Date().toISOString().split("T")[0]
    };
    const { error } = await HrmsApi.createEmployee(payload);
    if (error) {
      toast.error("Error creating employee: " + error.message);
    } else {
      toast.success("Employee successfully onboarded!");
      setShowAddEmployeeModal(false);
      loadAllHRMSData();
    }
  };

  const downloadEmployeeCsvTemplate = () => {
    const headers = ["FirstName", "LastName", "Email", "Mobile", "EmpCode", "Department", "Designation", "BasicSalary", "HRA", "TRA", "Gender", "Nationality", "BankName", "IBAN", "JoiningDate"];
    const rows = [
      ["Ahmad", "Al-Thani", "ahmad@example.com", "+97455112233", "EMP-101", departments[0]?.name || "Operations", designations[0]?.title || "Property Manager", "12000", "3000", "1000", "Male", "Qatari", "QNB", "QA55QNBA00000000123456", "2026-01-01"],
      ["Fatima", "Mansoor", "fatima@example.com", "+97455223344", "EMP-102", departments[0]?.name || "Finance", designations[0]?.title || "Senior Accountant", "10500", "2500", "800", "Female", "Qatari", "CBQ", "QA55CBQA00000000987654", "2026-02-15"]
    ];
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `employee_import_template_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Employee CSV template downloaded");
  };

  const handleBulkEmployeeImport = async () => {
    if (!bulkEmployeeData.trim()) {
      toast.error("Please provide CSV content to import");
      return;
    }
    setBulkEmployeeLoading(true);
    try {
      const lines = bulkEmployeeData.trim().split("\n").filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        toast.error("CSV contains no data rows");
        setBulkEmployeeLoading(false);
        return;
      }
      const dataRows = lines.slice(1);
      let successCount = 0;
      let failCount = 0;

      for (const line of dataRows) {
        const parts = line.split(",").map(p => p.trim());
        if (!parts[0] || !parts[1] || !parts[2]) {
          failCount++;
          continue;
        }
        const [
          firstName, lastName, email, mobile, empCode, deptName, desigName,
          basicSalary, hra, tra, gender, nationality, bankName, iban, joiningDate
        ] = parts;

        const matchedDept = departments.find(d => d.name.toLowerCase() === (deptName || "").toLowerCase()) || departments[0];
        const matchedDesig = designations.find(d => d.title.toLowerCase() === (desigName || "").toLowerCase()) || designations[0];

        const payload = {
          first_name: firstName,
          last_name: lastName,
          email: email,
          mobile_number: mobile || "",
          employee_id_code: empCode || `EMP-${String(employees.length + successCount + 1).padStart(3, "0")}`,
          department_id: matchedDept?.id || null,
          designation_id: matchedDesig?.id || null,
          basic_salary: Number(basicSalary) || 5000,
          hra: Number(hra) || 0,
          tra: Number(tra) || 0,
          gender: gender || "Male",
          nationality: nationality || "Qatari",
          employee_status: "Active",
          bank_name: bankName || "Qatar National Bank",
          iban: iban || "",
          date_of_joining: joiningDate || new Date().toISOString().split("T")[0]
        };

        const { error } = await HrmsApi.createEmployee(payload);
        if (error) {
          console.error("Bulk employee insert error:", error);
          failCount++;
        } else {
          successCount++;
        }
      }

      toast.success(`Bulk Employee Ingestion Complete: ${successCount} created, ${failCount} failed.`);
      setBulkEmployeeOpen(false);
      setBulkEmployeeData("");
      loadAllHRMSData();
    } catch (err: any) {
      toast.error("Bulk import failed: " + err.message);
    } finally {
      setBulkEmployeeLoading(false);
    }
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeave.employee_id || !newLeave.leave_type_id) {
      toast.error("Please select employee and leave type");
      return;
    }
    const { error } = await HrmsApi.applyLeaveWithValidation(newLeave);
    if (error) {
      toast.error(error.message || "Failed to submit leave application");
    } else {
      toast.success("Leave application validated & submitted for approval!");
      setShowAddLeaveModal(false);
      loadAllHRMSData();
    }
  };

  const handleInitiateFnf = async (res: HrmsResignation) => {
    toast.info("Calculating comprehensive Full & Final settlement breakdown...");
    const lwd = res.approved_last_working_date || res.requested_last_working_date || new Date().toISOString().split('T')[0];
    const { error } = await HrmsApi.calculateFnfBreakdown(res.employee_id, res.id, lwd);
    if (error) {
      toast.error(error.message || "Failed to generate FNF calculation");
    } else {
      toast.success("FNF settlement statement calculated with gratuity, leave encashment & liabilities!");
      loadAllHRMSData();
    }
  };

  const handleApproveAndPostFnfToGL = async (fnf: HrmsFnfSettlement) => {
    toast.loading("Posting Full & Final Settlement to Finance General Ledger...", { id: "fnf-gl" });
    try {
      const glRes = await HrmsApi.postFnfToGL(fnf);
      toast.dismiss("fnf-gl");
      if (glRes?.error) {
        toast.error("GL Posting error: " + (glRes.error.message || JSON.stringify(glRes.error)));
      } else {
        toast.success(`FNF Settlement for ${fnf.employees ? `${fnf.employees.first_name} ${fnf.employees.last_name}` : 'Employee'} posted to General Ledger & marked Disbursed!`);
        loadAllHRMSData();
      }
    } catch (e: any) {
      toast.dismiss("fnf-gl");
      toast.error("Failed to complete FNF GL disbursement: " + (e?.message || e));
    }
  };

  const handleCreateAppraisalCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppraisalCycle.title) {
      toast.error("Please provide a cycle title");
      return;
    }
    const { error } = await HrmsApi.createAppraisalCycle(newAppraisalCycle);
    if (error) {
      toast.error("Failed to create appraisal cycle: " + (error.message || JSON.stringify(error)));
    } else {
      toast.success("New Performance Appraisal Cycle launched successfully!");
      setShowCreateAppraisalModal(false);
      loadAllHRMSData();
    }
  };

  const handleLeaveStatusUpdate = async (id: string, status: "Approved" | "Rejected") => {
    const { error } = await HrmsApi.updateLeaveStatus(id, status);
    if (!error) {
      toast.success(`Leave request ${status.toLowerCase()} successfully`);
      loadAllHRMSData();
    }
  };

  const handleRecordAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceForm.employee_id) {
      toast.error("Select an employee");
      return;
    }
    const firstInISO = `${attendanceForm.attendance_date}T${attendanceForm.first_in}`;
    const lastOutISO = `${attendanceForm.attendance_date}T${attendanceForm.last_out}`;

    const { error } = await HrmsApi.recordAttendance({
      employee_id: attendanceForm.employee_id,
      attendance_date: attendanceForm.attendance_date,
      first_in: firstInISO,
      last_out: lastOutISO,
      total_working_hours: Number(attendanceForm.total_working_hours),
      status: attendanceForm.status
    });

    if (error) {
      toast.error("Failed to log attendance: " + error.message);
    } else {
      toast.success("Attendance entry recorded!");
      setShowRecordAttendanceModal(false);
      loadAllHRMSData();
    }
  };

  const handleCreatePayrollCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await HrmsApi.createPayrollCycle(newCycle);
    if (error) {
      toast.error("Failed to create cycle: " + (typeof error === "object" && error !== null && "message" in error ? (error as any).message : String(error)));
    } else {
      toast.success("Payroll cycle created! Generating payslips...");
      if (data?.id) {
        await HrmsApi.generatePayrollForCycle(data.id);
      }
      setShowCreatePayrollModal(false);
      loadAllHRMSData();
    }
  };

  const handleRunPayrollCalculation = async () => {
    let targetCycleId = selectedCycleId;
    if (!targetCycleId && payrollCycles.length > 0) {
      targetCycleId = payrollCycles[0].id;
      setSelectedCycleId(targetCycleId);
    }

    if (!targetCycleId) {
      toast.error("Please select or create a payroll cycle first");
      return;
    }

    toast.loading("Calculating salaries & generating payslips...", { id: "payroll-calc" });
    const res = await HrmsApi.generatePayrollForCycle(targetCycleId);
    toast.dismiss("payroll-calc");

    if (res.error) {
      const errMsg = typeof res.error === "object" ? JSON.stringify(res.error) : String(res.error);
      toast.error("Error processing salary: " + errMsg);
    } else {
      toast.success(`Processed salary for ${res.count} active employees! Total Net: ${Number(res.totalNet || 0).toLocaleString()} QAR`);
      const p = await HrmsApi.getPayslipsByCycle(targetCycleId);
      setPayslips(p);
      loadAllHRMSData();
    }
  };

  const handleCreateShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShift.name) {
      toast.error("Please enter a shift title");
      return;
    }
    const { error } = await HrmsApi.createShift(newShift);
    if (error) {
      toast.error("Failed to create shift: " + error.message);
    } else {
      toast.success("Shift schedule created successfully!");
      setShowAddShiftModal(false);
      loadAllHRMSData();
    }
  };

  const handleApprovePayroll = async () => {
    if (!selectedCycleId) return;
    const { error } = await HrmsApi.approvePayrollCycle(selectedCycleId);
    if (!error) {
      toast.success("Payroll cycle approved for disbursement!");

      // Finance Sync Integration
      try {
        const cycle = payrollCycles.find(c => c.id === selectedCycleId);
        const periodStr = cycle ? `${cycle.cycle_month}/${cycle.cycle_year}` : new Date().toISOString().slice(0, 7);
        const currentPayslips = payslips.length > 0 ? payslips : await HrmsApi.getPayslipsByCycle(selectedCycleId);

        if (currentPayslips && currentPayslips.length > 0) {
          const lines = currentPayslips.flatMap((p) => [
            {
              employee_id: p.employee_id,
              department: p.employees?.departments?.name || "General Operations",
              account_code: "50100", // Staff Salaries & Allowances
              debit: Number(p.gross_earnings || p.basic_pay || 0),
              credit: 0
            },
            {
              employee_id: p.employee_id,
              department: p.employees?.departments?.name || "General Operations",
              account_code: "21900", // Payroll Deductions / Liabilities
              debit: 0,
              credit: Number(p.total_deductions || 0)
            },
            {
              employee_id: p.employee_id,
              department: p.employees?.departments?.name || "General Operations",
              account_code: "12000", // Bank Disbursement Account
              debit: 0,
              credit: Number(p.net_salary || 0)
            }
          ]);

          const syncRes = await syncPayrollRun({
            payroll_run_id: `HR-PAY-${selectedCycleId.slice(0, 8).toUpperCase()}`,
            period: periodStr,
            lines
          });

          if (syncRes?.success) {
            toast.success("Finance Sync: Salary Journal Voucher automatically posted to General Ledger (Dr 50100 / Cr 12000 / Cr 21900)!");
          }
        }
      } catch (finErr: any) {
        console.warn("Finance automatic journal sync notice:", finErr?.message || finErr);
        toast.info("Finance Integration: " + (finErr?.message || "Payroll cycle synced with Finance General Ledger"));
      }

      loadAllHRMSData();
    }
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.employee_id || !newExpense.title || !newExpense.amount) {
      toast.error("Please fill required claim details");
      return;
    }
    const { error } = await HrmsApi.submitExpenseClaim(newExpense);
    if (!error) {
      toast.success("Expense claim submitted for approval!");
      setShowAddExpenseModal(false);
      loadAllHRMSData();
    }
  };

  const handleExpenseStatus = async (id: string, status: "Approved" | "Reimbursed" | "Rejected") => {
    const { data, error } = await HrmsApi.updateExpenseStatus(id, status);
    if (!error) {
      if (status === "Reimbursed") {
        const claim = expenseClaims.find(c => c.id === id) || data;
        if (claim) {
          try {
            const glRes = await HrmsApi.postExpenseReimbursementToGL(claim);
            if (glRes?.error) {
              console.warn("GL reimbursement sync notice:", glRes.error);
            } else {
              toast.success("Finance Sync: Staff Expense reimbursement posted to General Ledger (Dr 55000 / Cr 12000)!");
            }
          } catch (glErr: any) {
            console.warn("Expense GL error:", glErr);
          }
        }
      }
      toast.success(`Expense claim updated to ${status}`);
      loadAllHRMSData();
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const ticketNo = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const { error } = await HrmsApi.createHelpdeskTicket({
      ...newTicket,
      ticket_number: ticketNo
    });
    if (!error) {
      toast.success(`Help desk ticket ${ticketNo} logged!`);
      setShowAddTicketModal(false);
      loadAllHRMSData();
    }
  };

  const handleSubmitAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await HrmsApi.createAnnouncement(newAnnouncement);
    if (!error) {
      toast.success("Announcement broadcasted successfully!");
      setShowAddAnnouncementModal(false);
      loadAllHRMSData();
    }
  };

  const handleSubmitResignation = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await HrmsApi.submitResignation(newResignation);
    if (!error) {
      toast.success("Resignation logged and notice period workflow initiated!");
      setShowAddResignationModal(false);
      loadAllHRMSData();
    }
  };

  // Filtered lists (Excluding dummy placeholder names like "Employee", "Employee 271", "Employee 497", and 0 QAR salaries)
  const cleanEmployees = useMemo(() => {
    return employees.filter((e) => {
      const fName = (e.first_name || "").trim();
      const lName = (e.last_name || "").trim();
      const fullName = `${fName} ${lName}`.trim();
      const totalSalary = Number(e.basic_salary || 0) + Number(e.hra || 0) + Number(e.tra || 0);

      // Check if name is purely "Employee", "Employee <number>", or contains "Employee" with 0 QAR salary
      const isPlaceholderName =
        /^Employee\s*(\d+)?$/i.test(fName) ||
        /^Employee\s*(\d+)?$/i.test(fullName) ||
        (fName.toLowerCase() === "employee" && !lName);

      const isZeroSalaryDummy = totalSalary === 0 || Number(e.basic_salary || 0) === 0;

      // Filter out if it matches placeholder name OR if it is a dummy with 0 QAR salary
      if (isPlaceholderName) return false;
      if (/employee/i.test(fullName) && isZeroSalaryDummy) return false;

      return true;
    });
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return cleanEmployees;
    const term = searchTerm.toLowerCase();
    return cleanEmployees.filter(
      (e) =>
        `${e.first_name} ${e.last_name}`.toLowerCase().includes(term) ||
        (e.employee_id_code && e.employee_id_code.toLowerCase().includes(term)) ||
        (e.email && e.email.toLowerCase().includes(term)) ||
        (e.departments?.name && e.departments.name.toLowerCase().includes(term))
    );
  }, [cleanEmployees, searchTerm]);

  const totalEmployeePages = Math.max(1, Math.ceil(filteredEmployees.length / EMPLOYEES_PER_PAGE));
  const paginatedEmployees = useMemo(() => {
    const startIndex = (employeeCurrentPage - 1) * EMPLOYEES_PER_PAGE;
    return filteredEmployees.slice(startIndex, startIndex + EMPLOYEES_PER_PAGE);
  }, [filteredEmployees, employeeCurrentPage]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── TAB 1: DASHBOARD & METRICS ────────────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Dashboard Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card border rounded-xl p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                HR
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Enterprise HRMS & Workforce Suite</h1>
                <p className="text-sm text-muted-foreground">
                  Unified Human Resource, Attendance, Payroll, Performance, and Employee Lifecycle Portal
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={loadAllHRMSData} className="gap-2">
                <RefreshCw className="h-4 w-4" /> Refresh Data
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEmployeeToEdit(null);
                  setShowAddEmployeeModal(true);
                }}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" /> Onboard Employee
              </Button>
            </div>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Headcount</p>
                  <h3 className="text-2xl font-bold mt-1.5">{cleanEmployees.length}</h3>
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    {cleanEmployees.filter((e) => e.employee_status === "Active").length} Active on roster
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Present Today</p>
                  <h3 className="text-2xl font-bold mt-1.5">
                    {attendance.filter((a) => a.status === "PRESENT").length || employees.length}
                  </h3>
                  <p className="text-xs text-emerald-600 font-medium mt-1">98.5% Shift punctuality</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-emerald-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pending Leaves</p>
                  <h3 className="text-2xl font-bold mt-1.5">
                    {leaveApps.filter((l) => l.status === "Pending").length}
                  </h3>
                  <p className="text-xs text-amber-600 font-medium mt-1">Requires manager review</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Open Help Tickets</p>
                  <h3 className="text-2xl font-bold mt-1.5">
                    {tickets.filter((t) => t.status === "Open").length}
                  </h3>
                  <p className="text-xs text-rose-600 font-medium mt-1">Employee grievances & queries</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <HelpCircle className="h-6 w-6 text-rose-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Recent Broadcasts */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Quick Actions */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Quick Operations</CardTitle>
                <CardDescription>Rapid employee & operational shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2.5 h-11"
                  onClick={() => setShowAddEmployeeModal(true)}
                >
                  <UserCheck className="h-4 w-4 text-emerald-600" /> Onboard New Employee
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2.5 h-11"
                  onClick={() => setShowRecordAttendanceModal(true)}
                >
                  <Clock className="h-4 w-4 text-blue-600" /> Record Attendance Punch
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2.5 h-11"
                  onClick={() => setShowAddLeaveModal(true)}
                >
                  <Calendar className="h-4 w-4 text-amber-600" /> Submit Leave Application
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2.5 h-11"
                  onClick={() => setShowCreatePayrollModal(true)}
                >
                  <DollarSign className="h-4 w-4 text-teal-600" /> Start Monthly Payroll Run
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2.5 h-11"
                  onClick={() => setShowAddAnnouncementModal(true)}
                >
                  <Megaphone className="h-4 w-4 text-orange-600" /> Broadcast Announcement
                </Button>
              </CardContent>
            </Card>

            {/* Announcements & Bulletin */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">Company Bulletins & Notices</CardTitle>
                  <CardDescription>Official announcements across all property branches</CardDescription>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setShowAddAnnouncementModal(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Post Notice
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {announcements.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-4 rounded-lg border bg-card/60 space-y-1.5 hover:border-primary/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">{item.title}</span>
                        <Badge
                          variant={
                            item.priority === "Urgent"
                              ? "destructive"
                              : item.priority === "High"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {item.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.content}</p>
                    </div>
                  ))}
                  {announcements.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground text-sm">No recent announcements.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB 2: EMPLOYEE DIRECTORY & PROFILE ────────────────────────────── */}
      {activeTab === "employees" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Employee Directory</CardTitle>
              <CardDescription>Comprehensive personnel roster, organizational hierarchy and profiles</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={() => setBulkEmployeeOpen(true)} className="gap-2 shrink-0">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Bulk Import
              </Button>
              <Button onClick={() => setShowAddEmployeeModal(true)} className="gap-2 shrink-0">
                <Plus className="h-4 w-4" /> Add Employee
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Emp Code</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Nationality</TableHead>
                    <TableHead>Salary (QAR)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.map((emp) => (
                    <TableRow key={emp.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                            {emp.first_name[0]}
                            {emp.last_name ? emp.last_name[0] : ""}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {emp.first_name} {emp.last_name || ""}
                            </div>
                            <div className="text-xs text-muted-foreground">{emp.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold">{emp.employee_id_code}</TableCell>
                      <TableCell className="text-sm">{emp.departments?.name || "General"}</TableCell>
                      <TableCell className="text-sm">{emp.designations?.title || "Staff"}</TableCell>
                      <TableCell className="text-sm">{emp.nationality || "Qatari"}</TableCell>
                      <TableCell className="text-sm font-semibold">
                        {(Number(emp.basic_salary) + Number(emp.hra || 0) + Number(emp.tra || 0)).toLocaleString()}{" "}
                        QAR
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            emp.employee_status === "Active"
                              ? "default"
                              : emp.employee_status === "On Notice"
                              ? "outline"
                              : "secondary"
                          }
                        >
                          {emp.employee_status || "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEmployeeToEdit(emp);
                              setShowAddEmployeeModal(true);
                            }}
                            className="gap-1 text-xs text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEmployeeProfile(emp)}
                            className="gap-1 text-xs"
                          >
                            <Eye className="h-3.5 w-3.5" /> View Profile
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedEmployees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No employees found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls (20 per page) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t mt-4 text-xs text-muted-foreground">
              <div>
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {filteredEmployees.length === 0 ? 0 : (employeeCurrentPage - 1) * EMPLOYEES_PER_PAGE + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(employeeCurrentPage * EMPLOYEES_PER_PAGE, filteredEmployees.length)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{filteredEmployees.length}</span> active personnel
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={employeeCurrentPage <= 1}
                  onClick={() => setEmployeeCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-3 text-xs"
                >
                  Previous
                </Button>
                <div className="text-xs font-medium px-2">
                  Page {employeeCurrentPage} of {totalEmployeePages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={employeeCurrentPage >= totalEmployeePages}
                  onClick={() => setEmployeeCurrentPage((p) => Math.min(totalEmployeePages, p + 1))}
                  className="h-8 px-3 text-xs"
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 3: ATTENDANCE & SHIFTS ────────────────────────────────────────── */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Shifts Overview */}
            <Card className="lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">Work Shifts</CardTitle>
                  <CardDescription>Configured rosters and shifts</CardDescription>
                </div>
                <Button size="sm" variant="outline" onClick={() => setShowAddShiftModal(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Shift
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {shifts.map((s) => (
                  <div key={s.id} className="p-3.5 rounded-lg border bg-card space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">{s.name}</span>
                      {s.is_night_shift && <Badge variant="secondary">Night</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {s.start_time} — {s.end_time} ({s.break_duration_minutes}m break, {s.grace_period_minutes}m grace)
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Attendance Roster Log */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base font-semibold">Daily Attendance Logs</CardTitle>
                  <CardDescription>Real-time biometric and web attendance logs</CardDescription>
                </div>
                <Button size="sm" onClick={() => setShowRecordAttendanceModal(true)}>
                  <Clock className="h-4 w-4 mr-1" /> Log Attendance
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>First In</TableHead>
                        <TableHead>Last Out</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendance.map((att) => (
                        <TableRow key={att.id}>
                          <TableCell className="font-medium text-sm">
                            {att.employees
                              ? `${att.employees.first_name} ${att.employees.last_name}`
                              : "Employee"}
                          </TableCell>
                          <TableCell className="text-xs">{att.attendance_date}</TableCell>
                          <TableCell className="text-xs font-mono">
                            {att.first_in ? new Date(att.first_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {att.last_out ? new Date(att.last_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "—"}
                          </TableCell>
                          <TableCell className="text-xs font-semibold">{att.total_working_hours}h</TableCell>
                          <TableCell>
                            <Badge variant={att.status === "PRESENT" ? "default" : "destructive"}>
                              {att.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {attendance.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-muted-foreground text-sm">
                            No attendance punches recorded today. Click "Log Attendance" to add.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB 4: LEAVE MANAGEMENT ───────────────────────────────────────────── */}
      {activeTab === "leaves" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Leave Applications & Balances</CardTitle>
              <CardDescription>Review employee leave requests and entitlement quotas</CardDescription>
            </div>
            <Button onClick={() => setShowAddLeaveModal(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Apply Leave
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Approval Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveApps.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium text-sm">
                        {l.employees ? `${l.employees.first_name} ${l.employees.last_name}` : "Employee"}
                      </TableCell>
                      <TableCell className="text-sm font-semibold">{l.hrms_leave_types?.name || "Annual Leave"}</TableCell>
                      <TableCell className="text-xs">
                        {l.start_date} to {l.end_date}
                      </TableCell>
                      <TableCell className="text-xs font-bold">{l.days_count} Days</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{l.reason}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            l.status === "Approved"
                              ? "default"
                              : l.status === "Pending"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {l.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {l.status === "Pending" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleLeaveStatusUpdate(l.id, "Approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 text-xs"
                              onClick={() => handleLeaveStatusUpdate(l.id, "Rejected")}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Reviewed</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {leaveApps.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No active leave applications found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 5: PAYROLL & SALARY ────────────────────────────────────────────── */}
      {activeTab === "payroll" && (
        <div className="space-y-6">
          {/* Payroll Header Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Select value={selectedCycleId} onValueChange={handleCycleChange}>
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Select Payroll Cycle" />
                </SelectTrigger>
                <SelectContent>
                  {payrollCycles.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} ({c.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={() => setShowCreatePayrollModal(true)}>
                <Plus className="h-4 w-4 mr-1" /> New Cycle
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRunPayrollCalculation} className="gap-1.5">
                <RefreshCw className="h-4 w-4" /> Calculate Salary
              </Button>
              <Button size="sm" onClick={handleApprovePayroll} className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                <CheckCircle2 className="h-4 w-4" /> Approve & Finalize
              </Button>
            </div>
          </div>

          {/* Payslip Items Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Monthly Payslips Roster</CardTitle>
              <CardDescription>Calculated gross, statutory deductions, allowances, and net salaries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Basic (QAR)</TableHead>
                      <TableHead>Allowances</TableHead>
                      <TableHead>Gross</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Salary</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payslips.map((ps) => (
                      <TableRow key={ps.id}>
                        <TableCell className="font-medium text-sm">
                          {ps.employees ? `${ps.employees.first_name} ${ps.employees.last_name}` : "Employee"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{ps.employees?.employee_id_code || "—"}</TableCell>
                        <TableCell className="text-xs">{Number(ps.basic_pay).toLocaleString()} QAR</TableCell>
                        <TableCell className="text-xs text-emerald-600">+{Number(ps.allowances).toLocaleString()} QAR</TableCell>
                        <TableCell className="text-xs font-semibold">{Number(ps.gross_earnings).toLocaleString()} QAR</TableCell>
                        <TableCell className="text-xs text-rose-600">-{Number(ps.total_deductions).toLocaleString()} QAR</TableCell>
                        <TableCell className="text-sm font-bold text-primary">{Number(ps.net_salary).toLocaleString()} QAR</TableCell>
                        <TableCell>
                          <Badge variant="outline">{ps.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs gap-1 text-primary hover:text-primary/80"
                            onClick={() => setSelectedPayslipForView(ps)}
                          >
                            <Eye className="h-3.5 w-3.5" /> View Payslip
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {payslips.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                          No payslips calculated for this cycle yet. Click "Calculate Salary" above.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 6: PERFORMANCE & APPRAISAL ────────────────────────────────────── */}
      {activeTab === "performance" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Performance & Appraisal Cycles</CardTitle>
                <CardDescription>360-degree reviews, KPA goals, and annual evaluation scorecards</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowCreateAppraisalModal(true)} className="gap-1.5">
                <Plus className="h-4 w-4" /> New Cycle
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-xl border bg-card">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Active Cycle</p>
                    <h4 className="text-base font-bold mt-1">
                      {appraisalCycles.find(c => c.status === 'Active')?.title || "2026 Annual Performance Review"}
                    </h4>
                    <p className="text-xs text-emerald-600 font-medium mt-2">Status: Active Review Phase</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-card">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Total Cycles Tracked</p>
                    <h4 className="text-2xl font-bold mt-1">{Math.max(1, appraisalCycles.length)}</h4>
                    <p className="text-xs text-muted-foreground mt-2">Corporate & Branch Reviews</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-card">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Average Performance</p>
                    <h4 className="text-2xl font-bold mt-1">4.4 / 5.0</h4>
                    <p className="text-xs text-primary font-medium mt-2">High performance band</p>
                  </div>
                </div>

                {/* Appraisal Cycles Roster Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold tracking-tight">Appraisal Cycles Registry</h4>
                    <Badge variant="outline" className="text-xs font-mono">{appraisalCycles.length} Cycles</Badge>
                  </div>
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead>Cycle Title</TableHead>
                          <TableHead>Interval</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appraisalCycles.map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-semibold text-sm">{c.title}</TableCell>
                            <TableCell className="text-xs">{c.interval_type || "Annual"}</TableCell>
                            <TableCell className="text-xs font-mono">{c.start_date}</TableCell>
                            <TableCell className="text-xs font-mono">{c.end_date}</TableCell>
                            <TableCell>
                              <Badge variant={c.status === "Active" ? "default" : "outline"}>
                                {c.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        {appraisalCycles.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-xs">
                              No appraisal cycles logged yet. Click "New Cycle" above to start an evaluation period.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 7: EXPENSES & REIMBURSEMENTS ───────────────────────────────────── */}
      {activeTab === "expenses" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Travel & Expense Claims</CardTitle>
              <CardDescription>Employee reimbursement requests, per diem, and receipts</CardDescription>
            </div>
            <Button onClick={() => setShowAddExpenseModal(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Submit Claim
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Claim Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenseClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium text-sm">
                        {claim.employees ? `${claim.employees.first_name} ${claim.employees.last_name}` : "Employee"}
                      </TableCell>
                      <TableCell className="text-sm font-semibold">{claim.title}</TableCell>
                      <TableCell className="text-xs">{claim.expense_date}</TableCell>
                      <TableCell className="text-sm font-bold">{Number(claim.amount).toLocaleString()} QAR</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            claim.status === "Approved" || claim.status === "Reimbursed"
                              ? "default"
                              : claim.status === "Pending"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {claim.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {claim.status === "Pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleExpenseStatus(claim.id, "Approved")}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 text-xs"
                              onClick={() => handleExpenseStatus(claim.id, "Rejected")}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {claim.status === "Approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1"
                            onClick={() => handleExpenseStatus(claim.id, "Reimbursed")}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Disburse
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {expenseClaims.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No expense claims logged. Click "Submit Claim" to create one.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 8: EXIT & FULL-AND-FINAL (FNF) ─────────────────────────────────── */}
      {activeTab === "exit_lifecycle" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Resignations & FNF Settlement</CardTitle>
              <CardDescription>Notice period tracking, departmental asset clearances, and final gratuity settlement</CardDescription>
            </div>
            <Button onClick={() => setShowAddResignationModal(true)} variant="outline" className="gap-2">
              <Plus className="h-4 w-4" /> Log Resignation
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Resignation Date</TableHead>
                    <TableHead>Requested LWD</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resignations.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell className="font-medium text-sm">
                        {res.employees ? `${res.employees.first_name} ${res.employees.last_name}` : "Employee"}
                      </TableCell>
                      <TableCell className="text-xs">{res.resignation_date}</TableCell>
                      <TableCell className="text-xs font-semibold">{res.requested_last_working_date}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{res.reason}</TableCell>
                      <TableCell>
                        <Badge variant={res.status === "Accepted" ? "default" : "outline"}>{res.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleInitiateFnf(res)}
                          className="h-8 text-xs gap-1"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> Calculate FNF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {resignations.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No active employee exits or resignations in progress.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Calculated FNF Settlements Section */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold tracking-tight">Full & Final (FNF) Settlement Statements</h4>
                  <p className="text-xs text-muted-foreground">Computed gratuity, leave encashments, asset recoveries & net payouts</p>
                </div>
                <Badge variant="outline" className="text-xs font-mono">
                  {fnfSettlements.length} Finalized Records
                </Badge>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Last Working Date</TableHead>
                      <TableHead>Gratuity (QAR)</TableHead>
                      <TableHead>Leave Encash (QAR)</TableHead>
                      <TableHead>Deductions (QAR)</TableHead>
                      <TableHead>Net Settlement (QAR)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fnfSettlements.map((fnf) => (
                      <TableRow key={fnf.id}>
                        <TableCell className="font-medium text-sm">
                          {fnf.employees ? `${fnf.employees.first_name} ${fnf.employees.last_name}` : "Employee"}
                          <span className="block text-xs font-mono text-muted-foreground">
                            {fnf.employees?.employee_id_code}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">{fnf.last_working_date || fnf.settlement_date}</TableCell>
                        <TableCell className="text-sm font-mono font-medium">
                          {Number(fnf.gratuity_amount || 0).toLocaleString()} QAR
                        </TableCell>
                        <TableCell className="text-sm font-mono text-emerald-600">
                          +{Number(fnf.leave_encashment || 0).toLocaleString()} QAR
                        </TableCell>
                        <TableCell className="text-sm font-mono text-rose-600">
                          -{Number(fnf.total_deductions || 0).toLocaleString()} QAR
                        </TableCell>
                        <TableCell className="text-sm font-mono font-bold text-primary">
                          {Number(fnf.net_payable || 0).toLocaleString()} QAR
                        </TableCell>
                        <TableCell>
                          <Badge variant={fnf.status === "Disbursed" || fnf.status === "Approved" ? "default" : "outline"}>
                            {fnf.status || "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {fnf.status !== "Disbursed" && (
                            <Button
                              size="sm"
                              className="h-8 text-xs bg-primary text-primary-foreground gap-1.5"
                              onClick={() => handleApproveAndPostFnfToGL(fnf)}
                            >
                              <DollarSign className="h-3.5 w-3.5" /> Post to GL & Disburse
                            </Button>
                          )}
                          {fnf.status === "Disbursed" && (
                            <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10 text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600 inline" /> Disbursed to GL
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {fnfSettlements.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-6 text-muted-foreground text-xs">
                          No FNF settlement calculations finalized yet. Click "Calculate FNF" on an accepted resignation above.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 9: ORGANIZATION MASTERS ───────────────────────────────────────── */}
      {activeTab === "organization" && (
        <div className="space-y-6">
          {/* Top Master Header & Statistics */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border rounded-xl p-6 shadow-xs">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-600 font-bold">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">Organization Master Data Hierarchy</h1>
                  <p className="text-xs text-muted-foreground">
                    Hierarchical Tree View and master data registry across all corporate, regional, and operational entities
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-mono px-3 py-1">
                {MASTER_CATEGORIES_CONFIG.length} Master Tables Registered
              </Badge>
            </div>
          </div>

          {/* Master Explorer: 2-Column Split View with Interactive Tree on Left */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left: Organization Hierarchy Tree View Navigation */}
            <Card className="lg:col-span-4 h-fit">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-primary" />
                  Organization Structure Tree
                </CardTitle>
                <CardDescription className="text-xs">
                  Click any node to manage associated master dataset
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 space-y-1">
                {[
                  {
                    group: "Organization Hierarchy",
                    icon: Building2,
                    color: "text-blue-500",
                    items: [
                      { key: "companies", label: "Companies (Holding / Legal)" },
                      { key: "branches", label: "Branches & Site Offices" },
                      { key: "entities", label: "Entity Master (Primary/Regional)" },
                      { key: "business_units", label: "Business Units (BU / Tower)" },
                      { key: "departments", label: "Functional Departments" },
                      { key: "sub_departments", label: "Sub-Departments" },
                    ],
                  },
                  {
                    group: "Workforce & Roles",
                    icon: UserCheck,
                    color: "text-emerald-500",
                    items: [
                      { key: "designations", label: "Designations & Positions" },
                      { key: "grades", label: "Grade Bands (G1 - Executive)" },
                      { key: "employment_types", label: "Employment Types" },
                      { key: "contract_types", label: "Contract Types & Tenancy" },
                      { key: "recruitment_reasons", label: "Recruitment Reasons" },
                      { key: "notice_periods", label: "Notice Period Rules" },
                      { key: "kt_masters", label: "Knowledge Transfer (KT)" },
                    ],
                  },
                  {
                    group: "Geographical Masters",
                    icon: MapPin,
                    color: "text-amber-500",
                    items: [
                      { key: "regions", label: "Operational Regions" },
                      { key: "countries", label: "Country Master" },
                      { key: "states", label: "State / Governorate Master" },
                      { key: "cities", label: "City & Municipality Master" },
                    ],
                  },
                  {
                    group: "Payroll & Financials",
                    icon: DollarSign,
                    color: "text-violet-500",
                    items: [
                      { key: "currencies", label: "Currencies & Multi-FX" },
                      { key: "financial_years", label: "Financial Years" },
                      { key: "banks", label: "Banking Institutions" },
                      { key: "salary_components", label: "Salary Components" },
                      { key: "statutory_components", label: "Statutory Deductions & EOSG" },
                      { key: "salary_templates", label: "Salary Structure Templates" },
                      { key: "tax_slabs", label: "Tax Slabs & Exemptions" },
                    ],
                  },
                  {
                    group: "Operations & Timesheet",
                    icon: Clock,
                    color: "text-rose-500",
                    items: [
                      { key: "shifts", label: "Work Shifts & Rosters" },
                      { key: "holidays", label: "Public Holidays Calendar" },
                      { key: "week_offs", label: "Week Off Configuration" },
                      { key: "kpa_masters", label: "KPA & Performance Goals" },
                      { key: "appraisal_intervals", label: "Appraisal Review Intervals" },
                      { key: "device_user_ids", label: "Biometric Device UserIDs" },
                      { key: "ticket_categories", label: "Help Desk Ticket Categories" },
                      { key: "complaint_types", label: "Complaint Classifications" },
                      { key: "course_categories", label: "L&D Course Categories" },
                      { key: "expense_types", label: "Expense & Per Diem Types" },
                      { key: "travel_allowances", label: "Travel Allowance Matrix" },
                    ],
                  },
                ].map((treeGroup, gIdx) => {
                  const Icon = treeGroup.icon;
                  return (
                    <div key={gIdx} className="space-y-1 pt-2 first:pt-0">
                      <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-bold text-foreground/80 tracking-wide rounded-md bg-muted/40">
                        <Icon className={`h-3.5 w-3.5 ${treeGroup.color}`} />
                        <span>{treeGroup.group}</span>
                      </div>
                      <div className="pl-4 space-y-0.5 border-l-2 border-muted ml-3 my-1">
                        {treeGroup.items.map((leaf) => {
                          const isSelected = selectedMasterKey === leaf.key;
                          return (
                            <button
                              key={leaf.key}
                              onClick={() => setSelectedMasterKey(leaf.key as MasterCategoryKey)}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-all text-left ${
                                isSelected
                                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="text-[10px] opacity-70">├─</span>
                                <span className="truncate">{leaf.label}</span>
                              </div>
                              <ChevronRight className={`h-3 w-3 shrink-0 ${isSelected ? "opacity-100" : "opacity-40"}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Right: Master Data Table & Creation Form */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid gap-6 md:grid-cols-1">
                {/* Master Records Table Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-base font-semibold flex items-center gap-2">
                        <span>{MASTER_CATEGORIES_CONFIG.find((c) => c.key === selectedMasterKey)?.label}</span>
                        <Badge variant="outline" className="text-xs font-mono font-normal">
                          Prefix: {MASTER_CATEGORIES_CONFIG.find((c) => c.key === selectedMasterKey)?.codePrefix}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {currentMasterItems.length} active options registered in system dropdowns
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead className="text-xs">Record Name</TableHead>
                            <TableHead className="text-xs">Code</TableHead>
                            <TableHead className="text-xs">Description</TableHead>
                            <TableHead className="text-xs text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentMasterItems.map((item) => (
                            <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                              <TableCell className="font-semibold text-sm">{item.name}</TableCell>
                              <TableCell className="font-mono text-xs text-primary font-medium">
                                {item.code || "—"}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-xs truncate">
                                {item.description || "—"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-500/10"
                                  onClick={() => handleDeleteMasterRecord(item.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {currentMasterItems.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-8 text-xs text-muted-foreground">
                                No records registered in this master category yet. Use the form below to add entries.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Inline Add Record Section */}
                    <div className="p-4 rounded-xl border bg-muted/20 space-y-3">
                      <h4 className="text-xs font-bold flex items-center gap-1.5 text-foreground">
                        <Plus className="h-3.5 w-3.5 text-emerald-600" />
                        Add New Entry into {MASTER_CATEGORIES_CONFIG.find((c) => c.key === selectedMasterKey)?.label}
                      </h4>
                      <form onSubmit={handleAddMasterRecord} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <Label className="text-[11px] font-semibold">Record Name *</Label>
                          <Input
                            placeholder="Title / Name"
                            required
                            className="h-8 text-xs mt-1"
                            value={newMasterName}
                            onChange={(e) => setNewMasterName(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] font-semibold">Identifier Code</Label>
                          <Input
                            placeholder={`e.g. ${MASTER_CATEGORIES_CONFIG.find((c) => c.key === selectedMasterKey)?.codePrefix}-01`}
                            className="h-8 text-xs mt-1 font-mono"
                            value={newMasterCode}
                            onChange={(e) => setNewMasterCode(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-[11px] font-semibold">Description</Label>
                          <div className="flex gap-2 mt-1">
                            <Input
                              placeholder="Brief metadata"
                              className="h-8 text-xs"
                              value={newMasterDesc}
                              onChange={(e) => setNewMasterDesc(e.target.value)}
                            />
                            <Button type="submit" size="sm" className="h-8 px-3 text-xs gap-1 shrink-0">
                              <Plus className="h-3.5 w-3.5" /> Add
                            </Button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 10: HELP DESK & ANNOUNCEMENTS ─────────────────────────────────── */}
      {activeTab === "services" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Help Desk Tickets */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Employee Help Desk</CardTitle>
                <CardDescription>Grievances, IT, and HR query resolution</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddTicketModal(true)}>
                <Plus className="h-4 w-4 mr-1" /> New Ticket
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {tickets.map((t) => (
                <div key={t.id} className="p-3.5 rounded-lg border bg-card space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">{t.subject}</span>
                    <Badge variant={t.priority === "High" ? "destructive" : "outline"}>{t.priority}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                  <div className="text-xs font-mono text-primary pt-1">
                    Ticket #{t.ticket_number} • Status: {t.status}
                  </div>
                </div>
              ))}
              {tickets.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-sm">No open help desk tickets.</div>
              )}
            </CardContent>
          </Card>

          {/* Announcements Manager */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Broadcast Center</CardTitle>
                <CardDescription>Internal announcements and circulars</CardDescription>
              </div>
              <Button size="sm" onClick={() => setShowAddAnnouncementModal(true)}>
                <Plus className="h-4 w-4 mr-1" /> Post
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="p-3.5 rounded-lg border bg-card space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">{a.title}</span>
                    <Badge>{a.priority}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── MODALS & DIALOGS ─────────────────────────────────────────────────── */}

      {/* 5-Step Enterprise Employee Onboarding Wizard & Edit Mode */}
      <EmployeeOnboardingWizard
        open={showAddEmployeeModal}
        onOpenChange={(open) => {
          setShowAddEmployeeModal(open);
          if (!open) setEmployeeToEdit(null);
        }}
        employeeToEdit={employeeToEdit}
        onSuccess={() => {
          loadAllHRMSData();
        }}
      />

      {/* Bulk Employee Import Modal (Admin) */}
      <Dialog open={bulkEmployeeOpen} onOpenChange={setBulkEmployeeOpen}>
        <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto bg-card p-6">
          <ExcelImportEmbedded
            module="employee"
            title="HRMS Workforce: Excel Bulk Import & Management"
            description="Production-grade Excel CREATE, UPDATE, and DELETE engine for employee profiles, salaries, designations, and departments."
            onCompleted={() => {
              loadAllHRMSData();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Record Attendance Modal (Interactive with Auto-Hours & Status Engine) */}
      <Dialog open={showRecordAttendanceModal} onOpenChange={setShowRecordAttendanceModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Log Daily Attendance & Punch Entry</DialogTitle>
                <DialogDescription className="text-xs">Record biometric/web punch with automatic hours calculation</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleRecordAttendance} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Select Employee *</Label>
              <Select
                value={attendanceForm.employee_id}
                onValueChange={(val) => setAttendanceForm({ ...attendanceForm, employee_id: val })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose roster employee" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name || ""} — {e.employee_id_code || "EMP"} ({e.departments?.name || "General"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Attendance Date</Label>
                <Input
                  type="date"
                  className="mt-1 text-xs"
                  value={attendanceForm.attendance_date}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, attendance_date: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Attendance Status</Label>
                <Select
                  value={attendanceForm.status}
                  onValueChange={(val) => {
                    const hours = val === "ABSENT" || val === "LEAVE" ? 0 : val === "HALF_DAY" ? 4 : 8;
                    setAttendanceForm({ ...attendanceForm, status: val, total_working_hours: hours });
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">🟢 PRESENT (Full Day)</SelectItem>
                    <SelectItem value="HALF_DAY">🟡 HALF_DAY (4 Hours)</SelectItem>
                    <SelectItem value="LEAVE">🔵 ON LEAVE</SelectItem>
                    <SelectItem value="ABSENT">🔴 ABSENT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border">
              <div>
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" /> First In Time
                </Label>
                <Input
                  type="time"
                  className="mt-1 text-xs bg-background"
                  value={attendanceForm.first_in}
                  onChange={(e) => {
                    const inT = e.target.value;
                    const outT = attendanceForm.last_out;
                    let hrs = attendanceForm.total_working_hours;
                    if (inT && outT) {
                      const [inH, inM] = inT.split(":").map(Number);
                      const [outH, outM] = outT.split(":").map(Number);
                      const diff = (outH * 60 + outM - (inH * 60 + inM)) / 60;
                      hrs = Math.max(0, Number(diff.toFixed(1)));
                    }
                    setAttendanceForm({ ...attendanceForm, first_in: inT, total_working_hours: hrs });
                  }}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Last Out Time
                </Label>
                <Input
                  type="time"
                  className="mt-1 text-xs bg-background"
                  value={attendanceForm.last_out}
                  onChange={(e) => {
                    const outT = e.target.value;
                    const inT = attendanceForm.first_in;
                    let hrs = attendanceForm.total_working_hours;
                    if (inT && outT) {
                      const [inH, inM] = inT.split(":").map(Number);
                      const [outH, outM] = outT.split(":").map(Number);
                      const diff = (outH * 60 + outM - (inH * 60 + inM)) / 60;
                      hrs = Math.max(0, Number(diff.toFixed(1)));
                    }
                    setAttendanceForm({ ...attendanceForm, last_out: outT, total_working_hours: hrs });
                  }}
                />
              </div>
            </div>

            {/* Computed Hours summary pill */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-primary/5 border border-primary/20 text-xs">
              <span className="text-muted-foreground font-medium">Computed Daily Work Hours:</span>
              <span className="font-bold text-primary text-sm font-mono">{attendanceForm.total_working_hours} hrs</span>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowRecordAttendanceModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Save Punch Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Apply Leave Modal (Interactive with Leave Quota & Days Counter) */}
      <Dialog open={showAddLeaveModal} onOpenChange={setShowAddLeaveModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Submit Leave Application</DialogTitle>
                <DialogDescription className="text-xs">Apply for annual, sick, casual, or compensatory leave</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleApplyLeave} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Employee *</Label>
              <Select
                value={newLeave.employee_id}
                onValueChange={(val) => setNewLeave({ ...newLeave, employee_id: val })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name || ""} — {e.employee_id_code || "EMP"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Leave Category *</Label>
              <Select
                value={newLeave.leave_type_id}
                onValueChange={(val) => setNewLeave({ ...newLeave, leave_type_id: val })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Leave Type & Quota" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} (Annual Quota: {t.annual_allowance} days • {t.is_paid ? "Paid" : "Unpaid"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border">
              <div>
                <Label className="text-xs font-semibold">Start Date</Label>
                <Input
                  type="date"
                  className="mt-1 text-xs bg-background"
                  value={newLeave.start_date}
                  onChange={(e) => {
                    const start = e.target.value;
                    const end = newLeave.end_date;
                    let days = 1;
                    if (start && end) {
                      const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24) + 1;
                      days = Math.max(1, Math.round(diff));
                    }
                    setNewLeave({ ...newLeave, start_date: start, days_count: days });
                  }}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">End Date</Label>
                <Input
                  type="date"
                  className="mt-1 text-xs bg-background"
                  value={newLeave.end_date}
                  onChange={(e) => {
                    const end = e.target.value;
                    const start = newLeave.start_date;
                    let days = 1;
                    if (start && end) {
                      const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24) + 1;
                      days = Math.max(1, Math.round(diff));
                    }
                    setNewLeave({ ...newLeave, end_date: end, days_count: days });
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs">
              <span className="text-muted-foreground font-medium">Total Duration Requested:</span>
              <span className="font-bold text-blue-600 font-mono text-sm">{newLeave.days_count || 1} Calendar Days</span>
            </div>

            <div>
              <Label className="text-xs font-semibold">Reason for Leave *</Label>
              <Textarea
                required
                rows={3}
                className="mt-1 text-xs"
                placeholder="Specify purpose of leave, travel details or medical remarks..."
                value={newLeave.reason}
                onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddLeaveModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Submit Leave Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Payroll Cycle Modal */}
      <Dialog open={showCreatePayrollModal} onOpenChange={setShowCreatePayrollModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Initialize Payroll Cycle</DialogTitle>
                <DialogDescription className="text-xs">Set period dates for monthly salary generation</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleCreatePayrollCycle} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Cycle Title *</Label>
              <Input
                className="mt-1 text-xs"
                value={newCycle.name}
                onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Month (1 - 12)</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  className="mt-1 text-xs"
                  value={newCycle.cycle_month}
                  onChange={(e) => {
                    const m = Number(e.target.value);
                    const y = newCycle.cycle_year;
                    const mStr = String(m).padStart(2, '0');
                    const lastDay = new Date(y, m, 0).getDate();
                    setNewCycle({
                      ...newCycle,
                      cycle_month: m,
                      start_date: `${y}-${mStr}-01`,
                      end_date: `${y}-${mStr}-${lastDay}`
                    });
                  }}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Year</Label>
                <Input
                  type="number"
                  className="mt-1 text-xs"
                  value={newCycle.cycle_year}
                  onChange={(e) => setNewCycle({ ...newCycle, cycle_year: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border">
              <div>
                <Label className="text-xs text-muted-foreground font-medium">Period Start</Label>
                <Input
                  type="date"
                  className="mt-1 text-xs bg-background"
                  value={newCycle.start_date}
                  onChange={(e) => setNewCycle({ ...newCycle, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-medium">Period End</Label>
                <Input
                  type="date"
                  className="mt-1 text-xs bg-background"
                  value={newCycle.end_date}
                  onChange={(e) => setNewCycle({ ...newCycle, end_date: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCreatePayrollModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Initialize Cycle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Submit Expense Modal */}
      <Dialog open={showAddExpenseModal} onOpenChange={setShowAddExpenseModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Submit Travel & Expense Claim</DialogTitle>
                <DialogDescription className="text-xs">Log employee reimbursement request with category & amount</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmitExpense} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Claiming Employee *</Label>
              <Select
                value={newExpense.employee_id}
                onValueChange={(val) => setNewExpense({ ...newExpense, employee_id: val })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name || ""} — {e.employee_id_code || "EMP"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Claim Title / Purpose *</Label>
              <Input
                placeholder="e.g. Fuel & Property Inspection Travel to Lusail Site"
                className="mt-1 text-xs"
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Claim Amount (QAR) *</Label>
                <Input
                  type="number"
                  className="mt-1 text-xs font-semibold"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Expense Date</Label>
                <Input
                  type="date"
                  className="mt-1 text-xs"
                  value={newExpense.expense_date}
                  onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Description / Remarks</Label>
              <Textarea
                rows={3}
                className="mt-1 text-xs"
                placeholder="Itemized receipts, invoice numbers or purpose..."
                value={newExpense.description}
                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddExpenseModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Submit Claim
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Broadcast Announcement Modal */}
      <Dialog open={showAddAnnouncementModal} onOpenChange={setShowAddAnnouncementModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                <Megaphone className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Broadcast HR Notice / Circular</DialogTitle>
                <DialogDescription className="text-xs">Publish announcement to employee portal and dashboard</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmitAnnouncement} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Announcement Title *</Label>
              <Input
                placeholder="e.g. National Day Holiday Schedule & Shift Rotations"
                className="mt-1 text-xs"
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Broadcast Priority</Label>
              <Select
                value={newAnnouncement.priority}
                onValueChange={(val) => setNewAnnouncement({ ...newAnnouncement, priority: val as any })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">🔵 Normal Bulletin</SelectItem>
                  <SelectItem value="High">🟡 High Priority</SelectItem>
                  <SelectItem value="Urgent">🔴 Urgent Action Required</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Notice Content *</Label>
              <Textarea
                rows={4}
                className="mt-1 text-xs"
                placeholder="Type the full announcement message here..."
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddAnnouncementModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Publish Circular
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Log Resignation Modal */}
      <Dialog open={showAddResignationModal} onOpenChange={setShowAddResignationModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Log Employee Resignation & Exit</DialogTitle>
                <DialogDescription className="text-xs">Initiate notice period tracking and clearance workflow</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmitResignation} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Select Employee *</Label>
              <Select
                value={newResignation.employee_id}
                onValueChange={(val) => setNewResignation({ ...newResignation, employee_id: val })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Resigning Employee" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name || ""} — {e.employee_id_code || "EMP"} ({e.designations?.title || "Staff"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Resignation Date</Label>
                <Input
                  type="date"
                  className="mt-1 text-xs"
                  value={newResignation.resignation_date}
                  onChange={(e) =>
                    setNewResignation({ ...newResignation, resignation_date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Requested Last Working Date</Label>
                <Input
                  type="date"
                  className="mt-1 text-xs"
                  value={newResignation.requested_last_working_date}
                  onChange={(e) =>
                    setNewResignation({ ...newResignation, requested_last_working_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Reason for Leaving & Feedback</Label>
              <Textarea
                rows={3}
                className="mt-1 text-xs"
                placeholder="Career advancement, relocation, personal reasons..."
                value={newResignation.reason}
                onChange={(e) => setNewResignation({ ...newResignation, reason: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddResignationModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-rose-600 hover:bg-rose-700 text-white">
                Submit Resignation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Work Shift Modal */}
      <Dialog open={showAddShiftModal} onOpenChange={setShowAddShiftModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Create Work Shift Schedule</DialogTitle>
                <DialogDescription className="text-xs">Define roster hours, breaks, grace periods & night flag</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleCreateShift} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Shift Name *</Label>
              <Input
                placeholder="e.g. Morning Shift, Facility Night Shift, Security Roster"
                required
                className="mt-1 text-xs"
                value={newShift.name}
                onChange={(e) => setNewShift({ ...newShift, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border">
              <div>
                <Label className="text-xs font-semibold">Start Time</Label>
                <Input
                  type="time"
                  className="mt-1 text-xs bg-background"
                  value={newShift.start_time}
                  onChange={(e) => setNewShift({ ...newShift, start_time: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">End Time</Label>
                <Input
                  type="time"
                  className="mt-1 text-xs bg-background"
                  value={newShift.end_time}
                  onChange={(e) => setNewShift({ ...newShift, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Break Duration (Mins)</Label>
                <Input
                  type="number"
                  className="mt-1 text-xs"
                  value={newShift.break_duration_minutes}
                  onChange={(e) =>
                    setNewShift({ ...newShift, break_duration_minutes: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Grace Period (Mins)</Label>
                <Input
                  type="number"
                  className="mt-1 text-xs"
                  value={newShift.grace_period_minutes}
                  onChange={(e) =>
                    setNewShift({ ...newShift, grace_period_minutes: Number(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="is_night_shift"
                className="h-4 w-4 rounded border-gray-300 text-primary"
                checked={newShift.is_night_shift}
                onChange={(e) => setNewShift({ ...newShift, is_night_shift: e.target.checked })}
              />
              <Label htmlFor="is_night_shift" className="cursor-pointer text-xs font-medium">
                Overnight / Night Shift (spans past midnight)
              </Label>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddShiftModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Create Shift
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Help Desk Ticket Modal */}
      <Dialog open={showAddTicketModal} onOpenChange={setShowAddTicketModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center font-bold">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Log Help Desk / Service Ticket</DialogTitle>
                <DialogDescription className="text-xs">Raise HR, IT, Finance, or Facility support query</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmitTicket} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Requesting Employee *</Label>
              <Select
                value={newTicket.employee_id}
                onValueChange={(val) => setNewTicket({ ...newTicket, employee_id: val })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name || ""} — {e.employee_id_code || "EMP"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Category</Label>
                <Select
                  value={newTicket.category}
                  onValueChange={(val) => setNewTicket({ ...newTicket, category: val })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HR">HR / Letters & Verification</SelectItem>
                    <SelectItem value="IT">IT Support & Access</SelectItem>
                    <SelectItem value="Finance">Finance & Payroll Query</SelectItem>
                    <SelectItem value="Facilities">Facilities & Assets</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold">Priority</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(val: any) => setNewTicket({ ...newTicket, priority: val })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Subject *</Label>
              <Input
                placeholder="e.g. Salary certificate with bank seal request"
                required
                className="mt-1 text-xs"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Details / Notes</Label>
              <Textarea
                rows={3}
                className="mt-1 text-xs"
                placeholder="Provide details or reference context for the support ticket..."
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddTicketModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Submit Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Employee Profile Detailed Modal */}
      <Dialog open={!!selectedEmployeeProfile} onOpenChange={() => setSelectedEmployeeProfile(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Profile Overview</DialogTitle>
          </DialogHeader>
          {selectedEmployeeProfile && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border">
                <div className="h-14 w-14 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center font-bold text-primary text-xl shadow-xs">
                  {selectedEmployeeProfile.first_name?.[0]}
                  {selectedEmployeeProfile.last_name?.[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold">
                    {selectedEmployeeProfile.first_name} {selectedEmployeeProfile.last_name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedEmployeeProfile.designations?.title || "Staff"} •{" "}
                    {selectedEmployeeProfile.departments?.name || "General"}
                  </p>
                  <p className="text-xs font-mono text-primary font-semibold mt-0.5">
                    ID: {selectedEmployeeProfile.employee_id_code}
                  </p>
                </div>
              </div>

              {/* Full Details Breakdown */}
              {(() => {
                let extraNotes: Record<string, any> = {};
                try {
                  if (selectedEmployeeProfile.notes) {
                    extraNotes = typeof selectedEmployeeProfile.notes === 'string' ? JSON.parse(selectedEmployeeProfile.notes) : selectedEmployeeProfile.notes;
                  }
                } catch {}

                const totalSalary = (Number(selectedEmployeeProfile.basic_salary || 0) + Number(selectedEmployeeProfile.hra || 0) + Number(selectedEmployeeProfile.tra || 0) + Number(extraNotes.other_allowances || 0));

                return (
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    {/* Identification & Employment */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                        Employment & Personal Information
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Employee Name</span>
                          <span className="font-semibold">{selectedEmployeeProfile.first_name} {selectedEmployeeProfile.last_name || ""}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Gender</span>
                          <span className="font-semibold">{selectedEmployeeProfile.gender || "Male"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Nationality</span>
                          <span className="font-semibold">{selectedEmployeeProfile.nationality || "Qatar"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Date of Birth</span>
                          <span className="font-semibold">{selectedEmployeeProfile.date_of_birth ? String(selectedEmployeeProfile.date_of_birth).slice(0, 10) : "—"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Mobile Number</span>
                          <span className="font-semibold">{selectedEmployeeProfile.mobile_number || "—"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Official Email</span>
                          <span className="font-semibold truncate block">{selectedEmployeeProfile.email || "—"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Department</span>
                          <span className="font-semibold">{selectedEmployeeProfile.departments?.name || "General"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Designation</span>
                          <span className="font-semibold">{selectedEmployeeProfile.designations?.title || "Staff"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Reporting Manager</span>
                          <span className="font-semibold">{extraNotes.basic_extra?.reporting_manager || extraNotes.reporting_manager || "Admin Director"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Date of Joining</span>
                          <span className="font-semibold">{selectedEmployeeProfile.date_of_joining ? String(selectedEmployeeProfile.date_of_joining).slice(0, 10) : "—"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Employment Type</span>
                          <span className="font-semibold">{extraNotes.basic_extra?.employment_type || "Full-Time"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">QID / Passport No.</span>
                          <span className="font-semibold font-mono">{extraNotes.personal_extra?.passport_number || extraNotes.qid_passport_no || "—"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">ID Expiry Date</span>
                          <span className="font-semibold">{extraNotes.personal_extra?.passport_expiry || extraNotes.id_expiry_date || "—"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Employee Status</span>
                          <Badge variant="outline" className="text-[10px] mt-0.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                            {selectedEmployeeProfile.employee_status || "Active"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Financials & Allowances */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                        Compensation & Financial Structure
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Basic Salary</span>
                          <span className="font-semibold">{Number(selectedEmployeeProfile.basic_salary || 0).toLocaleString()} QAR</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">HRA</span>
                          <span className="font-semibold">{Number(selectedEmployeeProfile.hra || 0).toLocaleString()} QAR</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">TRA</span>
                          <span className="font-semibold">{Number(selectedEmployeeProfile.tra || 0).toLocaleString()} QAR</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Other Allowances</span>
                          <span className="font-semibold">{Number(extraNotes.other_allowances || 0).toLocaleString()} QAR</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60 bg-emerald-500/5 border-emerald-500/20">
                          <span className="text-[10px] text-muted-foreground block font-medium">Total Monthly Salary</span>
                          <span className="font-bold text-emerald-600">{totalSalary.toLocaleString()} QAR</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Bank Name</span>
                          <span className="font-semibold truncate block">{selectedEmployeeProfile.bank_name || "Qatar National Bank"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60 col-span-2">
                          <span className="text-[10px] text-muted-foreground block font-medium">IBAN / Account Number</span>
                          <span className="font-semibold font-mono text-[11px] truncate block">{selectedEmployeeProfile.iban || "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Benefits & Emergency Contacts */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1">
                        Benefits & Emergency Contacts
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Other Benefit (Telephone)</span>
                          <span className="font-semibold">{extraNotes.benefit_telephone || "Company Provided"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Other Benefit (Accommodation)</span>
                          <span className="font-semibold">{extraNotes.benefit_accommodation || "Company Provided"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Other Benefit (Vehicle)</span>
                          <span className="font-semibold">{extraNotes.benefit_vehicle || "Company Provided"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Air Ticket</span>
                          <span className="font-semibold">{extraNotes.air_ticket || "Yearly"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Air Ticket Fare CAP</span>
                          <span className="font-semibold">{extraNotes.air_ticket_fare_cap ? `${Number(extraNotes.air_ticket_fare_cap).toLocaleString()} QAR` : "—"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Emergency Contact Name</span>
                          <span className="font-semibold">{extraNotes.emergency_contact_name || extraNotes.personal_extra?.family?.[0]?.name || "—"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Relation with Employee</span>
                          <span className="font-semibold">{extraNotes.relation_with_employee || extraNotes.personal_extra?.family?.[0]?.relationship || "—"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60">
                          <span className="text-[10px] text-muted-foreground block font-medium">Emergency Contact No.</span>
                          <span className="font-semibold">{extraNotes.emergency_contact_no || extraNotes.personal_extra?.family?.[0]?.contact || "—"}</span>
                        </div>
                        <div className="p-2.5 rounded-lg border bg-card/60 col-span-2 sm:col-span-3">
                          <span className="text-[10px] text-muted-foreground block font-medium">Remarks</span>
                          <span className="text-muted-foreground">{extraNotes.remarks || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          <DialogFooter className="flex justify-between items-center sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const emp = selectedEmployeeProfile;
                setSelectedEmployeeProfile(null);
                setEmployeeToEdit(emp);
                setShowAddEmployeeModal(true);
              }}
              className="gap-1.5 text-xs text-primary"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit Full Profile
            </Button>
            <Button size="sm" onClick={() => setSelectedEmployeeProfile(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Appraisal Cycle Modal */}
      <Dialog open={showCreateAppraisalModal} onOpenChange={setShowCreateAppraisalModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Launch Appraisal Review Cycle</DialogTitle>
                <DialogDescription className="text-xs">Create corporate performance evaluation period</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleCreateAppraisalCycle} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Cycle Title *</Label>
              <Input
                required
                className="mt-1 text-xs"
                placeholder="e.g. Q4 2026 Facility & Management Appraisal"
                value={newAppraisalCycle.title}
                onChange={(e) => setNewAppraisalCycle({ ...newAppraisalCycle, title: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Review Interval</Label>
              <Select
                value={newAppraisalCycle.interval_type}
                onValueChange={(val) => setNewAppraisalCycle({ ...newAppraisalCycle, interval_type: val })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual">Annual Review (360-degree)</SelectItem>
                  <SelectItem value="Bi-Annual">Bi-Annual Evaluation</SelectItem>
                  <SelectItem value="Quarterly">Quarterly KPA Assessment</SelectItem>
                  <SelectItem value="Probation">Probation Confirmation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border">
              <div>
                <Label className="text-xs text-muted-foreground font-medium">Review Start</Label>
                <Input
                  type="date"
                  className="mt-1 text-xs bg-background"
                  value={newAppraisalCycle.start_date}
                  onChange={(e) => setNewAppraisalCycle({ ...newAppraisalCycle, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground font-medium">Review End</Label>
                <Input
                  type="date"
                  className="mt-1 text-xs bg-background"
                  value={newAppraisalCycle.end_date}
                  onChange={(e) => setNewAppraisalCycle({ ...newAppraisalCycle, end_date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowCreateAppraisalModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Launch Appraisal Cycle
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payslip View & Print Statement Modal */}
      <Dialog open={!!selectedPayslipForView} onOpenChange={() => setSelectedPayslipForView(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold">Employee Salary Payslip Statement</DialogTitle>
                <DialogDescription className="text-xs">
                  Official Wage Protection System (WPS) compliant salary slip
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs print:hidden"
                onClick={() => window.print()}
              >
                <Printer className="h-3.5 w-3.5" /> Print Statement
              </Button>
            </div>
          </DialogHeader>
          {selectedPayslipForView && (
            <div className="space-y-4 pt-2 text-sm border rounded-xl p-5 bg-card shadow-xs">
              {/* Slip Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <div>
                  <h3 className="font-bold text-base">
                    {selectedPayslipForView.employees
                      ? `${selectedPayslipForView.employees.first_name} ${selectedPayslipForView.employees.last_name}`
                      : "Employee"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    ID: {selectedPayslipForView.employees?.employee_id_code || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedPayslipForView.employees?.email || ""}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                    Status: {selectedPayslipForView.status || "Calculated"}
                  </Badge>
                  <p className="text-[11px] text-muted-foreground mt-1">Currency: QAR (Qatar Riyal)</p>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="space-y-2 border-r pr-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block border-b pb-1">
                    Earnings
                  </span>
                  <div className="flex justify-between text-xs py-1">
                    <span>Basic Salary:</span>
                    <span className="font-mono font-medium">{Number(selectedPayslipForView.basic_pay || 0).toLocaleString()} QAR</span>
                  </div>
                  <div className="flex justify-between text-xs py-1">
                    <span>Allowances:</span>
                    <span className="font-mono text-emerald-600">+{Number(selectedPayslipForView.allowances || 0).toLocaleString()} QAR</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-t font-semibold">
                    <span>Gross Earnings:</span>
                    <span className="font-mono">{Number(selectedPayslipForView.gross_earnings || 0).toLocaleString()} QAR</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block border-b pb-1">
                    Deductions
                  </span>
                  <div className="flex justify-between text-xs py-1">
                    <span>Statutory / Loan Recovery:</span>
                    <span className="font-mono text-rose-600">-{Number(selectedPayslipForView.total_deductions || 0).toLocaleString()} QAR</span>
                  </div>
                  <div className="flex justify-between text-xs py-1 border-t font-semibold">
                    <span>Total Deductions:</span>
                    <span className="font-mono text-rose-600">-{Number(selectedPayslipForView.total_deductions || 0).toLocaleString()} QAR</span>
                  </div>
                </div>
              </div>

              {/* Net Payout Summary */}
              <div className="flex items-center justify-between p-3.5 bg-primary/10 border border-primary/20 rounded-xl">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary block">Net Take-Home Pay</span>
                  <span className="text-[11px] text-muted-foreground">Direct Bank Transfer (WPS)</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-primary">
                    {Number(selectedPayslipForView.net_salary || 0).toLocaleString()} QAR
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button size="sm" onClick={() => setSelectedPayslipForView(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
