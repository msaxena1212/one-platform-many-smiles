import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users, Building2, Briefcase, Calendar, Clock, DollarSign, Award,
  Receipt, ShieldCheck, LogOut, Megaphone, HelpCircle, Plus, Search,
  Filter, Download, CheckCircle2, XCircle, AlertTriangle, Eye, RefreshCw,
  FileText, ArrowRight, UserCheck, ChevronRight, Settings, Trash2, Edit3, Send
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
  HrmsExpenseClaim,
  HrmsResignation,
  HrmsAnnouncement,
  HrmsHelpdeskTicket
} from "@/lib/hrmsService";

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
  const [announcements, setAnnouncements] = useState<HrmsAnnouncement[]>([]);
  const [tickets, setTickets] = useState<HrmsHelpdeskTicket[]>([]);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Modals
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState<boolean>(false);
  const [showAddLeaveModal, setShowAddLeaveModal] = useState<boolean>(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false);
  const [showAddTicketModal, setShowAddTicketModal] = useState<boolean>(false);
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState<boolean>(false);
  const [showCreatePayrollModal, setShowCreatePayrollModal] = useState<boolean>(false);
  const [showAddShiftModal, setShowAddShiftModal] = useState<boolean>(false);
  const [showAddResignationModal, setShowAddResignationModal] = useState<boolean>(false);
  const [showRecordAttendanceModal, setShowRecordAttendanceModal] = useState<boolean>(false);
  const [selectedEmployeeProfile, setSelectedEmployeeProfile] = useState<any | null>(null);

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
        emps, depts, desigs, comps, brs, shs, atts, lTypes, lApps, pCycles, appCycles, expClaims, resList, annList, tktList
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
      setAnnouncements(annList);
      setTickets(tktList);
    } catch (e: any) {
      console.error("Error loading HRMS suite data:", e);
      toast.error("Failed to load HRMS data");
    } finally {
      setLoading(false);
    }
  }, [selectedCycleId]);

  useEffect(() => {
    loadAllHRMSData();
  }, [loadAllHRMSData]);

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
      toast.error("Failed to create cycle: " + error.message);
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
    if (!selectedCycleId) {
      toast.error("Select a payroll cycle first");
      return;
    }
    const res = await HrmsApi.generatePayrollForCycle(selectedCycleId);
    if (res.error) {
      toast.error("Error processing salary: " + res.error);
    } else {
      toast.success(`Processed salary for ${res.count} active employees!`);
      const p = await HrmsApi.getPayslipsByCycle(selectedCycleId);
      setPayslips(p);
      loadAllHRMSData();
    }
  };

  const handleApprovePayroll = async () => {
    if (!selectedCycleId) return;
    const { error } = await HrmsApi.approvePayrollCycle(selectedCycleId);
    if (!error) {
      toast.success("Payroll cycle approved for disbursement!");
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
    const { error } = await HrmsApi.updateExpenseStatus(id, status);
    if (!error) {
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

  // Filtered lists
  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    const term = searchTerm.toLowerCase();
    return employees.filter(
      (e) =>
        `${e.first_name} ${e.last_name}`.toLowerCase().includes(term) ||
        (e.employee_id_code && e.employee_id_code.toLowerCase().includes(term)) ||
        (e.email && e.email.toLowerCase().includes(term)) ||
        (e.departments?.name && e.departments.name.toLowerCase().includes(term))
    );
  }, [employees, searchTerm]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card border rounded-xl p-6 shadow-xs">
        <div>
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
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={loadAllHRMSData} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddEmployeeModal(true)}
            className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> Onboard Employee
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Menu Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
        {HRMS_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-card hover:bg-muted text-card-foreground border-border"
              }`}
            >
              <Icon className={`h-5 w-5 mb-1.5 ${isActive ? "text-primary-foreground" : tab.color}`} />
              <span className="text-center truncate w-full">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: DASHBOARD & METRICS ────────────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Headcount</p>
                  <h3 className="text-2xl font-bold mt-1.5">{employees.length}</h3>
                  <p className="text-xs text-emerald-600 font-medium mt-1">
                    {employees.filter((e) => e.employee_status === "Active").length} Active on roster
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
                  {filteredEmployees.map((emp) => (
                    <TableRow key={emp.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                            {emp.first_name[0]}
                            {emp.last_name[0]}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {emp.first_name} {emp.last_name}
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedEmployeeProfile(emp)}
                          className="gap-1 text-xs"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No employees found matching your criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
                      </TableRow>
                    ))}
                    {payslips.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
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
              <Button size="sm" onClick={() => toast.info("New appraisal cycle wizard opened")}>
                <Plus className="h-4 w-4 mr-1" /> New Cycle
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-xl border bg-card">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Active Cycle</p>
                    <h4 className="text-base font-bold mt-1">2026 Annual Property Operations Appraisal</h4>
                    <p className="text-xs text-emerald-600 font-medium mt-2">Status: Active Review Phase</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-card">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Completed Reviews</p>
                    <h4 className="text-2xl font-bold mt-1">84%</h4>
                    <p className="text-xs text-muted-foreground mt-2">16% Pending manager approval</p>
                  </div>
                  <div className="p-4 rounded-xl border bg-card">
                    <p className="text-xs text-muted-foreground uppercase font-medium">Average Performance</p>
                    <h4 className="text-2xl font-bold mt-1">4.2 / 5.0</h4>
                    <p className="text-xs text-primary font-medium mt-2">High performance band</p>
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
          </CardContent>
        </Card>
      )}

      {/* ── TAB 9: ORGANIZATION MASTERS ───────────────────────────────────────── */}
      {activeTab === "organization" && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Companies & Branches */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Corporate Companies & Branches</CardTitle>
              <CardDescription>Multi-entity and branch hierarchy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {branches.map((b) => (
                  <div key={b.id} className="p-3.5 rounded-lg border bg-card flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">{b.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Code: {b.code} • Region: {b.region} • Timezone: {b.timezone}
                      </p>
                    </div>
                    <Badge variant="outline">Branch</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Departments & Designations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Departments & Roles</CardTitle>
              <CardDescription>Functional operational departments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {departments.map((d) => (
                  <div key={d.id} className="p-3.5 rounded-lg border bg-card flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-sm">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.description || "Operational Unit"}</p>
                    </div>
                    <Badge variant="secondary">
                      {employees.filter((e) => e.department_id === d.id).length} Staff
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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

      {/* Onboard Employee Modal */}
      <Dialog open={showAddEmployeeModal} onOpenChange={setShowAddEmployeeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Onboard New Employee</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateEmployee} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  required
                  value={newEmp.first_name}
                  onChange={(e) => setNewEmp({ ...newEmp, first_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  required
                  value={newEmp.last_name}
                  onChange={(e) => setNewEmp({ ...newEmp, last_name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Official Email *</Label>
                <Input
                  type="email"
                  required
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Mobile Number</Label>
                <Input
                  value={newEmp.mobile_number}
                  onChange={(e) => setNewEmp({ ...newEmp, mobile_number: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Department</Label>
                <Select
                  value={newEmp.department_id}
                  onValueChange={(val) => setNewEmp({ ...newEmp, department_id: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Designation</Label>
                <Select
                  value={newEmp.designation_id}
                  onValueChange={(val) => setNewEmp({ ...newEmp, designation_id: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Designation" />
                  </SelectTrigger>
                  <SelectContent>
                    {designations.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Basic Salary (QAR)</Label>
                <Input
                  type="number"
                  value={newEmp.basic_salary}
                  onChange={(e) => setNewEmp({ ...newEmp, basic_salary: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>HRA (QAR)</Label>
                <Input
                  type="number"
                  value={newEmp.hra}
                  onChange={(e) => setNewEmp({ ...newEmp, hra: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Transport (QAR)</Label>
                <Input
                  type="number"
                  value={newEmp.tra}
                  onChange={(e) => setNewEmp({ ...newEmp, tra: Number(e.target.value) })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddEmployeeModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit & Create Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Record Attendance Modal */}
      <Dialog open={showRecordAttendanceModal} onOpenChange={setShowRecordAttendanceModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Daily Attendance Punch</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRecordAttendance} className="space-y-4">
            <div>
              <Label>Employee</Label>
              <Select
                value={attendanceForm.employee_id}
                onValueChange={(val) => setAttendanceForm({ ...attendanceForm, employee_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name} ({e.employee_id_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First In Time</Label>
                <Input
                  type="time"
                  value={attendanceForm.first_in}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, first_in: e.target.value })}
                />
              </div>
              <div>
                <Label>Last Out Time</Label>
                <Input
                  type="time"
                  value={attendanceForm.last_out}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, last_out: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Working Hours</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={attendanceForm.total_working_hours}
                  onChange={(e) => setAttendanceForm({ ...attendanceForm, total_working_hours: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={attendanceForm.status}
                  onValueChange={(val) => setAttendanceForm({ ...attendanceForm, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">PRESENT</SelectItem>
                    <SelectItem value="ABSENT">ABSENT</SelectItem>
                    <SelectItem value="HALF_DAY">HALF_DAY</SelectItem>
                    <SelectItem value="LEAVE">LEAVE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowRecordAttendanceModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Punch Entry</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Apply Leave Modal */}
      <Dialog open={showAddLeaveModal} onOpenChange={setShowAddLeaveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Leave Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApplyLeave} className="space-y-4">
            <div>
              <Label>Employee</Label>
              <Select
                value={newLeave.employee_id}
                onValueChange={(val) => setNewLeave({ ...newLeave, employee_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Leave Category</Label>
              <Select
                value={newLeave.leave_type_id}
                onValueChange={(val) => setNewLeave({ ...newLeave, leave_type_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Leave Type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.annual_allowance} days quota)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={newLeave.start_date}
                  onChange={(e) => setNewLeave({ ...newLeave, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={newLeave.end_date}
                  onChange={(e) => setNewLeave({ ...newLeave, end_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Reason for Leave</Label>
              <Textarea
                required
                value={newLeave.reason}
                onChange={(e) => setNewLeave({ ...newLeave, reason: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddLeaveModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Payroll Cycle Modal */}
      <Dialog open={showCreatePayrollModal} onOpenChange={setShowCreatePayrollModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Payroll Cycle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePayrollCycle} className="space-y-4">
            <div>
              <Label>Cycle Name</Label>
              <Input
                value={newCycle.name}
                onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Month (1-12)</Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={newCycle.cycle_month}
                  onChange={(e) => setNewCycle({ ...newCycle, cycle_month: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Year</Label>
                <Input
                  type="number"
                  value={newCycle.cycle_year}
                  onChange={(e) => setNewCycle({ ...newCycle, cycle_year: Number(e.target.value) })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreatePayrollModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Initialize Cycle</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Submit Expense Modal */}
      <Dialog open={showAddExpenseModal} onOpenChange={setShowAddExpenseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Expense Claim</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitExpense} className="space-y-4">
            <div>
              <Label>Employee</Label>
              <Select
                value={newExpense.employee_id}
                onValueChange={(val) => setNewExpense({ ...newExpense, employee_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Claim Title</Label>
              <Input
                placeholder="e.g. Fuel & Property Inspection Travel"
                value={newExpense.title}
                onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Amount (QAR)</Label>
              <Input
                type="number"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddExpenseModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Claim</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Broadcast Announcement Modal */}
      <Dialog open={showAddAnnouncementModal} onOpenChange={setShowAddAnnouncementModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Post Announcement</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitAnnouncement} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={newAnnouncement.title}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
              />
            </div>
            <div>
              <Label>Priority</Label>
              <Select
                value={newAnnouncement.priority}
                onValueChange={(val) => setNewAnnouncement({ ...newAnnouncement, priority: val as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                rows={4}
                value={newAnnouncement.content}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddAnnouncementModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Publish Circular</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Log Resignation Modal */}
      <Dialog open={showAddResignationModal} onOpenChange={setShowAddResignationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Employee Resignation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitResignation} className="space-y-4">
            <div>
              <Label>Employee</Label>
              <Select
                value={newResignation.employee_id}
                onValueChange={(val) => setNewResignation({ ...newResignation, employee_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.first_name} {e.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Requested Last Working Date</Label>
              <Input
                type="date"
                value={newResignation.requested_last_working_date}
                onChange={(e) =>
                  setNewResignation({ ...newResignation, requested_last_working_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Reason for Leaving</Label>
              <Textarea
                value={newResignation.reason}
                onChange={(e) => setNewResignation({ ...newResignation, reason: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddResignationModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Resignation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Employee Profile Detailed Modal */}
      <Dialog open={!!selectedEmployeeProfile} onOpenChange={() => setSelectedEmployeeProfile(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Employee Dossier Profile</DialogTitle>
          </DialogHeader>
          {selectedEmployeeProfile && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/40 border">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                  {selectedEmployeeProfile.first_name[0]}
                  {selectedEmployeeProfile.last_name[0]}
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
                    {selectedEmployeeProfile.employee_id_code}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded border">
                  <span className="text-xs text-muted-foreground block">Email</span>
                  <span className="font-medium">{selectedEmployeeProfile.email}</span>
                </div>
                <div className="p-3 rounded border">
                  <span className="text-xs text-muted-foreground block">Contact</span>
                  <span className="font-medium">{selectedEmployeeProfile.mobile_number || "—"}</span>
                </div>
                <div className="p-3 rounded border">
                  <span className="text-xs text-muted-foreground block">Nationality</span>
                  <span className="font-medium">{selectedEmployeeProfile.nationality || "Qatari"}</span>
                </div>
                <div className="p-3 rounded border">
                  <span className="text-xs text-muted-foreground block">Bank & Account</span>
                  <span className="font-medium">{selectedEmployeeProfile.bank_name || "Qatar National Bank"}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setSelectedEmployeeProfile(null)}>Close Dossier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
