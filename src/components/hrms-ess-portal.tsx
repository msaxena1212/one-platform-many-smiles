import React, { useState, useEffect, useMemo } from "react";
import {
  User, Calendar, Clock, DollarSign, Award, Receipt, FileText, Send,
  Plus, CheckCircle2, XCircle, AlertTriangle, Download, Eye, EyeOff, Lock,
  BookOpen, HelpCircle, LogOut, MessageSquare, Briefcase, RefreshCw,
  Search, Shield, Layers, UploadCloud, ChevronRight, CreditCard, Key,
  MapPin, Fingerprint, Building2, Check, Sparkles, ShieldCheck, ArrowRight,
  Filter, Smartphone, Laptop, History, AlertCircle, FileSpreadsheet,
  CheckCircle, ArrowUpDown, Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { HrmsApi, type HrmsLeaveType } from "@/lib/hrmsService";
import { HrmsMastersApi, type MasterItem } from "@/lib/hrmsMastersService";

export interface HrmsEssPortalProps {
  currentEmployee?: any;
  activeTabProp?: string;
}

export function HrmsEssPortal({ currentEmployee, activeTabProp }: HrmsEssPortalProps) {
  // Mock current employee fallback if not provided
  const employee = currentEmployee || {
    id: "emp-demo-01",
    first_name: "Deepak",
    last_name: "Sharma",
    employee_id_code: "MGT-IN-GUR-01260002",
    email: "deepak.sharma@zyno.estate",
    personal_email: "deepak.personal@gmail.com",
    mobile_number: "+974 5512 3456",
    designation: "Senior Property Consultant",
    department: "Commercial & Leasing",
    branch: "Doha Downtown Branch",
    entity: "MGT-IN-GUR (PRIMARY)",
    date_of_joining: "2024-01-15",
    basic_salary: 8500,
    hra: 2500,
    tra: 1000,
    bank_name: "Qatar National Bank (QNB)",
    iban: "QA55QNBA00000000123456",
    status: "ACTIVE",
  };

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (activeTabProp) return activeTabProp;
    if (typeof window !== "undefined") {
      const search = new URLSearchParams(window.location.search);
      const tab = search.get("tab");
      if (tab) return tab;
    }
    return "my_details";
  });

  useEffect(() => {
    if (activeTabProp && activeTabProp !== activeTab) {
      setActiveTab(activeTabProp);
    }
  }, [activeTabProp]);

  const [leaveTypes, setLeaveTypes] = useState<HrmsLeaveType[]>([]);
  const [masterLeaveTypes, setMasterLeaveTypes] = useState<MasterItem[]>([]);
  const [masterExpenseTypes, setMasterExpenseTypes] = useState<MasterItem[]>([]);
  const [masterLoanTypes, setMasterLoanTypes] = useState<MasterItem[]>([]);
  const [masterTicketCategories, setMasterTicketCategories] = useState<MasterItem[]>([]);
  const [myLeaves, setMyLeaves] = useState<any[]>([]);
  const [myAttendance, setMyAttendance] = useState<any[]>([]);
  const [myPayslips, setMyPayslips] = useState<any[]>([]);
  const [myExpenses, setMyExpenses] = useState<any[]>([]);
  const [myLoans, setMyLoans] = useState<any[]>([]);
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);

  // Filter States for Leaves
  const [leaveSearch, setLeaveSearch] = useState("");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState("ALL");
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("ALL");
  const [leavePeriodFilter, setLeavePeriodFilter] = useState("ALL");

  // Filter States for Cancel Leaves
  const [cancelLeaveSearch, setCancelLeaveSearch] = useState("");
  const [cancelLeaveTypeFilter, setCancelLeaveTypeFilter] = useState("ALL");

  // Filter States for Attendance
  const [attendanceMonthFilter, setAttendanceMonthFilter] = useState("2026-09");
  const [attendanceStatusFilter, setAttendanceStatusFilter] = useState("ALL");
  const [attendanceSourceFilter, setAttendanceSourceFilter] = useState("ALL");

  // Filter States for Payslips
  const [payslipYearFilter, setPayslipYearFilter] = useState("ALL");

  // Filter States for Expenses
  const [expenseSearch, setExpenseSearch] = useState("");
  const [expenseStatusFilter, setExpenseStatusFilter] = useState("ALL");

  // Filter States for Loans
  const [loanStatusFilter, setLoanStatusFilter] = useState("ALL");

  // Filter States for Help Desk
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketStatusFilter, setTicketStatusFilter] = useState("ALL");

  // Password Security Form States
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new_pass: "",
    confirm: "",
  });

  // Punch attendance state
  const [isPunchedIn, setIsPunchedIn] = useState(true);
  const [lastPunchTime, setLastPunchTime] = useState("07:55 AM");
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Modals state
  const [applyLeaveModal, setApplyLeaveModal] = useState(false);
  const [applyExpenseModal, setApplyExpenseModal] = useState(false);
  const [applyLoanModal, setApplyLoanModal] = useState(false);
  const [applyOvertimeModal, setApplyOvertimeModal] = useState(false);
  const [submitTicketModal, setSubmitTicketModal] = useState(false);
  const [submitResignationModal, setSubmitResignationModal] = useState(false);
  const [cancelConfirmDialog, setCancelConfirmDialog] = useState<{ open: boolean; leave: any | null }>({
    open: false,
    leave: null,
  });

  // Forms
  const [leaveForm, setLeaveForm] = useState({
    leave_type: "Annual Leave (30 Calendar Days)",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    days_count: 1,
    reason: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    type: "Local Travel & Inspection Fuel (Travel Expense)",
    title: "",
    amount: 150,
    date: new Date().toISOString().split("T")[0],
    receipt_name: "",
    notes: "",
  });

  const [loanForm, setLoanForm] = useState({
    loan_type: "Annual Housing Advance Loan",
    amount: 5000,
    tenure_months: 6,
    reason: "Personal Emergency / Relocation",
  });

  const [overtimeForm, setOvertimeForm] = useState({
    date: new Date().toISOString().split("T")[0],
    hours: 3.5,
    reason: "Month-end tenant move-in rush & inventory inspection",
  });

  const [ticketForm, setTicketForm] = useState({
    category: "HR & Salary Certificate Requests",
    subject: "",
    description: "",
  });

  const [resignationForm, setResignationForm] = useState({
    requested_lwd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    reason: "",
  });

  useEffect(() => {
    loadEssData();
  }, []);

  const loadEssData = async () => {
    try {
      const [types, mLeaves, mExpenses, mLoans, mTickets] = await Promise.all([
        HrmsApi.getLeaveTypes(),
        HrmsMastersApi.getMasterItems("leave_types"),
        HrmsMastersApi.getMasterItems("expense_types"),
        HrmsMastersApi.getMasterItems("loan_types"),
        HrmsMastersApi.getMasterItems("ticket_categories")
      ]);

      setLeaveTypes(types);
      setMasterLeaveTypes(mLeaves);
      setMasterExpenseTypes(mExpenses);
      setMasterLoanTypes(mLoans);
      setMasterTicketCategories(mTickets);

      // Seeded comprehensive leave history for Qatar PMS
      setMyLeaves([
        { id: "l-1", type: "Annual Leave", start: "2026-08-10", end: "2026-08-15", days: 5, status: "Approved", appliedOn: "2026-07-28", reason: "Annual family holiday & overseas travel", approver: "Sarah Jenkins" },
        { id: "l-2", type: "Casual Leave", start: "2026-09-02", end: "2026-09-02", days: 1, status: "Pending", appliedOn: "2026-09-01", reason: "Personal bank documentation & embassy appointment", approver: "Sarah Jenkins" },
        { id: "l-3", type: "Sick Leave", start: "2026-06-12", end: "2026-06-13", days: 2, status: "Approved", appliedOn: "2026-06-12", reason: "Viral fever & doctor recommended bed rest (Med certificate submitted)", approver: "Sarah Jenkins" },
        { id: "l-4", type: "Annual Leave", start: "2026-11-20", end: "2026-11-27", days: 7, status: "Approved", appliedOn: "2026-09-15", reason: "Winter break family vacation", approver: "Sarah Jenkins" },
        { id: "l-5", type: "Emergency Leave", start: "2026-04-05", end: "2026-04-06", days: 2, status: "Approved", appliedOn: "2026-04-04", reason: "Urgent residential maintenance repair attendance", approver: "Sarah Jenkins" },
        { id: "l-6", type: "Casual Leave", start: "2026-02-18", end: "2026-02-18", days: 1, status: "Cancelled", appliedOn: "2026-02-14", reason: "Traffic department vehicle renewal registration", approver: "Sarah Jenkins" },
        { id: "l-7", type: "Hajj Pilgrimage Leave", start: "2026-05-10", end: "2026-05-25", days: 15, status: "Rejected", appliedOn: "2026-04-10", reason: "Annual pilgrimage quota conflict with project handover milestone", approver: "Sarah Jenkins" },
      ]);

      // Seeded attendance timesheet records
      setMyAttendance([
        { date: "2026-09-07", day: "Monday", inTime: "07:55 AM", outTime: "05:05 PM", hours: 9.1, otHours: 0, status: "PRESENT", punchSource: "Biometric Doha HQ", shift: "General (08:00 - 17:00)" },
        { date: "2026-09-06", day: "Sunday", inTime: "08:02 AM", outTime: "05:00 PM", hours: 8.9, otHours: 0, status: "PRESENT", punchSource: "Face Recognition", shift: "General (08:00 - 17:00)" },
        { date: "2026-09-05", day: "Saturday", inTime: "07:50 AM", outTime: "07:15 PM", hours: 11.4, otHours: 2.5, status: "PRESENT", punchSource: "Biometric Doha HQ", shift: "General (08:00 - 17:00)" },
        { date: "2026-09-04", day: "Friday", inTime: "—", outTime: "—", hours: 0, otHours: 0, status: "WEEK_OFF", punchSource: "System Schedule", shift: "Weekend Off" },
        { date: "2026-09-03", day: "Thursday", inTime: "08:00 AM", outTime: "05:10 PM", hours: 9.1, otHours: 0, status: "PRESENT", punchSource: "Web Punch Portal", shift: "General (08:00 - 17:00)" },
        { date: "2026-09-02", day: "Wednesday", inTime: "08:35 AM", outTime: "05:15 PM", hours: 8.6, otHours: 0, status: "LATE_IN", punchSource: "Biometric Doha HQ", shift: "General (08:00 - 17:00)" },
        { date: "2026-09-01", day: "Tuesday", inTime: "07:58 AM", outTime: "06:30 PM", hours: 10.5, otHours: 1.5, status: "PRESENT", punchSource: "Mobile GPS", shift: "General (08:00 - 17:00)" },
        { date: "2026-08-31", day: "Monday", inTime: "07:54 AM", outTime: "05:08 PM", hours: 9.2, otHours: 0, status: "PRESENT", punchSource: "Biometric Doha HQ", shift: "General (08:00 - 17:00)" },
        { date: "2026-08-30", day: "Sunday", inTime: "08:00 AM", outTime: "05:00 PM", hours: 9.0, otHours: 0, status: "PRESENT", punchSource: "Face Recognition", shift: "General (08:00 - 17:00)" },
        { date: "2026-08-29", day: "Saturday", inTime: "—", outTime: "—", hours: 0, otHours: 0, status: "WEEK_OFF", punchSource: "System Schedule", shift: "Weekend Off" },
        { date: "2026-08-28", day: "Friday", inTime: "—", outTime: "—", hours: 0, otHours: 0, status: "WEEK_OFF", punchSource: "System Schedule", shift: "Weekend Off" },
        { date: "2026-08-27", day: "Thursday", inTime: "08:05 AM", outTime: "01:30 PM", hours: 5.4, otHours: 0, status: "HALF_DAY", punchSource: "Biometric Doha HQ", shift: "General (08:00 - 17:00)" },
      ]);

      setMyPayslips([
        { month: "August 2026", basic: 8500, allowances: 3500, gross: 12000, deductions: 0, net: 12000, status: "Paid", paidAt: "2026-08-31" },
        { month: "July 2026", basic: 8500, allowances: 3500, gross: 12000, deductions: 0, net: 12000, status: "Paid", paidAt: "2026-07-31" },
        { month: "June 2026", basic: 8500, allowances: 3500, gross: 12000, deductions: 0, net: 12000, status: "Paid", paidAt: "2026-06-30" },
        { month: "May 2026", basic: 8500, allowances: 3500, gross: 12000, deductions: 0, net: 12000, status: "Paid", paidAt: "2026-05-31" },
      ]);

      setMyExpenses([
        { id: "exp-1", title: "Property Inspection Fuel & Parking", amount: 180, type: "Travel Expense", date: "2026-09-01", status: "Approved" },
        { id: "exp-2", title: "Tenant Welcome Hospitality Box", amount: 250, type: "Reimbursement Expense", date: "2026-08-25", status: "Reimbursed" },
        { id: "exp-3", title: "Site Key Duplication & Courier", amount: 95, type: "Other Expense", date: "2026-08-14", status: "Approved" },
      ]);

      setMyLoans([
        { id: "ln-1", amount: 10000, emi: 1666, tenure: "6 Months", remaining: 3334, status: "Active", reason: "Annual Housing Advance" }
      ]);

      setMyTickets([
        { id: "tkt-01", number: "TKT-892110", subject: "Salary Certificate for Embassy Visa", category: "HR Letters", status: "Resolved", date: "2026-08-20" },
        { id: "tkt-02", number: "TKT-901423", subject: "Dual Monitor Setup for Leasing Desk", category: "IT Hardware", status: "In_Progress", date: "2026-09-02" },
      ]);

      setMyCourses([
        { id: "c-1", title: "Qatar Real Estate Regulatory Law & Tenancy Standards", category: "Property Management", progress: "85%", status: "In Progress" },
        { id: "c-2", title: "Fire Safety & Facility Emergency Procedures", category: "Health & Safety", progress: "100%", status: "Completed" },
        { id: "c-3", title: "Advanced Financial Ledger Posting & AP Workflow", category: "ERP Training", progress: "40%", status: "In Progress" },
        { id: "c-4", title: "Anti-Money Laundering & Real Estate KYC Compliance", category: "Compliance", progress: "60%", status: "In Progress" },
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePunchToggle = () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isPunchedIn) {
      setIsPunchedIn(false);
      setLastPunchTime(timeNow);
      toast.success(`Successfully Punched OUT at ${timeNow}. Have a good evening!`);
    } else {
      setIsPunchedIn(true);
      setLastPunchTime(timeNow);
      toast.success(`Successfully Punched IN at ${timeNow}. Work hours are being recorded.`);
    }
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: `l-${Date.now()}`,
      type: leaveForm.leave_type.split(" (")[0],
      start: leaveForm.start_date,
      end: leaveForm.end_date,
      days: leaveForm.days_count || 1,
      status: "Pending",
      appliedOn: new Date().toISOString().split("T")[0],
      reason: leaveForm.reason,
      approver: "Sarah Jenkins",
    };
    setMyLeaves([newEntry, ...myLeaves]);
    toast.success("Leave application submitted to reporting manager!");
    setApplyLeaveModal(false);
    setLeaveForm({
      leave_type: "Annual Leave (30 Calendar Days)",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
      days_count: 1,
      reason: "",
    });
  };

  const executeCancelLeave = (leaveId: string) => {
    setMyLeaves(prev => prev.map(l => l.id === leaveId ? { ...l, status: "Cancelled" } : l));
    toast.success("Leave request cancelled successfully!");
    setCancelConfirmDialog({ open: false, leave: null });
  };

  const handleCancelLeave = (id: string) => {
    const target = myLeaves.find(l => l.id === id);
    if (target) {
      setCancelConfirmDialog({ open: true, leave: target });
    } else {
      executeCancelLeave(id);
    }
  };

  const handleSubmitExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp = {
      id: `exp-${Date.now()}`,
      title: expenseForm.title,
      amount: expenseForm.amount,
      type: expenseForm.type,
      date: expenseForm.date,
      status: "Pending",
    };
    setMyExpenses([newExp, ...myExpenses]);
    toast.success("Expense claim submitted for review!");
    setApplyExpenseModal(false);
  };

  const handleSubmitLoan = (e: React.FormEvent) => {
    e.preventDefault();
    const newLn = {
      id: `ln-${Date.now()}`,
      amount: loanForm.amount,
      emi: Math.round(loanForm.amount / loanForm.tenure_months),
      tenure: `${loanForm.tenure_months} Months`,
      remaining: loanForm.amount,
      status: "Under Review",
      reason: loanForm.reason,
    };
    setMyLoans([newLn, ...myLoans]);
    toast.success("Loan application registered for HR & Finance approval!");
    setApplyLoanModal(false);
  };

  const handleSubmitOvertime = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Overtime request of ${overtimeForm.hours} hours logged for ${overtimeForm.date}!`);
    setApplyOvertimeModal(false);
  };

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newTkt = {
      id: `tkt-${Date.now()}`,
      number: `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
      subject: ticketForm.subject,
      category: ticketForm.category,
      status: "Open",
      date: new Date().toISOString().split("T")[0],
    };
    setMyTickets([newTkt, ...myTickets]);
    toast.success(`Service ticket ${newTkt.number} submitted!`);
    setSubmitTicketModal(false);
  };

  const handleSubmitResignation = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Notice submitted. Resignation workflow and notice period initiated.");
    setSubmitResignationModal(false);
  };

  // Password Security Calculations & Live Strength
  const passwordChecks = useMemo(() => {
    const p = passwords.new_pass;
    const hasMinLen = p.length >= 8;
    const hasUpper = /[A-Z]/.test(p);
    const hasNumber = /[0-9]/.test(p);
    const hasSpecial = /[^A-Za-z0-9]/.test(p);
    const isMatched = p.length > 0 && p === passwords.confirm;

    const score = [hasMinLen, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    let strengthLabel = "Weak";
    let strengthColor = "bg-rose-500";
    let strengthPercent = 25;

    if (score === 2) {
      strengthLabel = "Fair";
      strengthColor = "bg-amber-500";
      strengthPercent = 50;
    } else if (score === 3) {
      strengthLabel = "Good";
      strengthColor = "bg-blue-500";
      strengthPercent = 75;
    } else if (score === 4) {
      strengthLabel = "Strong & Secure";
      strengthColor = "bg-emerald-500";
      strengthPercent = 100;
    }

    return {
      hasMinLen,
      hasUpper,
      hasNumber,
      hasSpecial,
      isMatched,
      score,
      strengthLabel,
      strengthColor,
      strengthPercent,
      isValid: hasMinLen && hasUpper && hasNumber && isMatched && passwords.current.length > 0
    };
  }, [passwords]);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.current) {
      toast.error("Please enter your current password");
      return;
    }
    if (passwords.new_pass !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.new_pass.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }
    toast.success("Portal password updated successfully. Your active sessions remain protected.");
    setPasswords({ current: "", new_pass: "", confirm: "" });
  };

  // Filtered Leaves List (Show all leaves wrt dates and type of leaves)
  const filteredLeaves = useMemo(() => {
    return myLeaves.filter((l) => {
      const matchesSearch =
        leaveSearch === "" ||
        l.type.toLowerCase().includes(leaveSearch.toLowerCase()) ||
        l.reason.toLowerCase().includes(leaveSearch.toLowerCase()) ||
        l.start.includes(leaveSearch) ||
        l.end.includes(leaveSearch);

      const matchesType =
        leaveTypeFilter === "ALL" ||
        l.type.toLowerCase().includes(leaveTypeFilter.toLowerCase());

      const matchesStatus =
        leaveStatusFilter === "ALL" || l.status.toUpperCase() === leaveStatusFilter.toUpperCase();

      const matchesPeriod =
        leavePeriodFilter === "ALL" ||
        (leavePeriodFilter === "UPCOMING" && new Date(l.start) >= new Date("2026-09-01")) ||
        (leavePeriodFilter === "PAST" && new Date(l.start) < new Date("2026-09-01"));

      return matchesSearch && matchesType && matchesStatus && matchesPeriod;
    }).sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  }, [myLeaves, leaveSearch, leaveTypeFilter, leaveStatusFilter, leavePeriodFilter]);

  // Filtered Cancellable Leaves
  const filteredCancelLeaves = useMemo(() => {
    return myLeaves
      .filter((l) => l.status !== "Cancelled")
      .filter((l) => {
        const matchesSearch =
          cancelLeaveSearch === "" ||
          l.type.toLowerCase().includes(cancelLeaveSearch.toLowerCase()) ||
          l.reason.toLowerCase().includes(cancelLeaveSearch.toLowerCase()) ||
          l.start.includes(cancelLeaveSearch);

        const matchesType =
          cancelLeaveTypeFilter === "ALL" ||
          l.type.toLowerCase().includes(cancelLeaveTypeFilter.toLowerCase());

        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  }, [myLeaves, cancelLeaveSearch, cancelLeaveTypeFilter]);

  // Filtered Attendance Records
  const filteredAttendance = useMemo(() => {
    return myAttendance.filter((a) => {
      const matchesMonth =
        attendanceMonthFilter === "ALL" || a.date.startsWith(attendanceMonthFilter);

      const matchesStatus =
        attendanceStatusFilter === "ALL" || a.status === attendanceStatusFilter;

      const matchesSource =
        attendanceSourceFilter === "ALL" || a.punchSource.toLowerCase().includes(attendanceSourceFilter.toLowerCase());

      return matchesMonth && matchesStatus && matchesSource;
    });
  }, [myAttendance, attendanceMonthFilter, attendanceStatusFilter, attendanceSourceFilter]);

  // Unique leave types extracted from records
  const uniqueLeaveTypes = useMemo(() => {
    const set = new Set<string>();
    myLeaves.forEach((l) => set.add(l.type));
    masterLeaveTypes.forEach((m) => set.add(m.name.split(" (")[0]));
    return Array.from(set);
  }, [myLeaves, masterLeaveTypes]);

  const TAB_LABELS: Record<string, { title: string; subtitle: string; icon: React.ElementType }> = {
    my_details: { title: "My Profile Details", subtitle: "Verified personal dossier, employment records, and compensation snapshot", icon: User },
    attendance: { title: "Punch Attendance & Timesheet", subtitle: "Live biometric / web punch clock, work hour calculations, and overtime tracking", icon: Clock },
    leaves: { title: "Apply Leave", subtitle: "Submit leave requests and track leave balance quotas across cycles", icon: Calendar },
    cancel_leave: { title: "Cancel Leave", subtitle: "Cancel pending or approved leave requests before commencement", icon: XCircle },
    payslips: { title: "My Payslips", subtitle: "Disbursed monthly payroll slips with component breakdown and PDF receipts", icon: DollarSign },
    statutory_gratuity: { title: "Statutory & Gratuity", subtitle: "Qatar Labor Law compliance, 0% Tax, WPS, and EOSB Gratuity accrual", icon: ShieldCheck },
    tax_declaration: { title: "Statutory & Gratuity", subtitle: "Qatar Labor Law compliance, 0% Tax, WPS, and EOSB Gratuity accrual", icon: ShieldCheck },
    expenses: { title: "Claim Expense", subtitle: "Submit travel reimbursements, client entertainment, and petty claims", icon: Receipt },
    loans: { title: "Apply Loan & Advances", subtitle: "Staff emergency advances, loan requests, and EMI recovery schedules", icon: CreditCard },
    helpdesk: { title: "Help Desk", subtitle: "HR service tickets, IT requests, and workplace grievance management", icon: HelpCircle },
    resignation: { title: "Notice & Exit", subtitle: "Formal resignation notice, handover checklist, and gratuity tracking", icon: LogOut },
    change_password: { title: "Change Password", subtitle: "Account credentials, login security, and two-factor authentication", icon: Key },
  };

  const currentTabMeta = TAB_LABELS[activeTab] || TAB_LABELS.my_details;
  const CurrentTabIcon = currentTabMeta.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── CLEAN TOP PROFILE HERO BANNER (No redundant CTA badges) ── */}
      <div className="bg-card border rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-teal-500/10 flex items-center justify-center font-bold text-teal-600 text-2xl border border-teal-500/20 shadow-xs shrink-0">
            {employee.first_name[0]}{employee.last_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight text-foreground">{employee.first_name} {employee.last_name}</h2>
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white">Active Staff</Badge>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-muted font-medium text-muted-foreground border">
                Qatar Ops
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {employee.designation} • {employee.department} • <span className="font-mono font-semibold text-primary">{employee.employee_id_code}</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {employee.branch} • {employee.entity}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden sm:flex flex-col text-right text-xs">
            <span className="text-muted-foreground text-[11px]">Shift & Schedule</span>
            <span className="font-semibold text-foreground">General (08:00 – 17:00)</span>
          </div>
          <div className="hidden md:flex flex-col text-right text-xs border-l pl-3">
            <span className="text-muted-foreground text-[11px]">Reporting Manager</span>
            <span className="font-semibold text-foreground">Sarah Jenkins (VP Ops)</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl border bg-muted/30 text-xs flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${isPunchedIn ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            <span className="text-muted-foreground text-[11px]">Today:</span>
            <span className="font-bold">{isPunchedIn ? `In at ${lastPunchTime}` : `Out at ${lastPunchTime}`}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePunchToggle}
            className={`gap-1.5 text-xs font-semibold ${isPunchedIn ? "border-amber-500/40 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20" : "border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"}`}
          >
            <Fingerprint className="h-3.5 w-3.5" />
            {isPunchedIn ? "Punch Out" : "Punch In"}
          </Button>
        </div>
      </div>

      {/* ── TAB 1: MY PROFILE / DOSSIER ────────────────────────────────────────── */}
      {activeTab === "my_details" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Personal & Organizational Dossier</CardTitle>
              <CardDescription>Verified personal details, official contacts, and employment records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg border bg-muted/20">
                  <span className="text-muted-foreground block">Full Name</span>
                  <span className="font-semibold text-sm">{employee.first_name} {employee.last_name}</span>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <span className="text-muted-foreground block">Official Email</span>
                  <span className="font-semibold text-sm">{employee.email}</span>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <span className="text-muted-foreground block">Official Contact</span>
                  <span className="font-semibold text-sm">{employee.mobile_number}</span>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <span className="text-muted-foreground block">Personal Email</span>
                  <span className="font-semibold text-sm">{employee.personal_email}</span>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <span className="text-muted-foreground block">Date of Joining</span>
                  <span className="font-semibold text-sm">{employee.date_of_joining}</span>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <span className="text-muted-foreground block">Work Location / Branch</span>
                  <span className="font-semibold text-sm">{employee.branch}</span>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <span className="text-muted-foreground block">Primary Entity</span>
                  <span className="font-semibold text-sm">{employee.entity}</span>
                </div>
                <div className="p-3 rounded-lg border bg-muted/20">
                  <span className="text-muted-foreground block">Bank Account & IBAN</span>
                  <span className="font-semibold text-sm">{employee.bank_name}</span>
                  <span className="block font-mono text-[10px] text-muted-foreground mt-0.5">{employee.iban}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Compensation Snapshot</CardTitle>
              <CardDescription>Monthly salary component breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Basic Pay:</span>
                <span className="font-semibold">{employee.basic_salary.toLocaleString()} QAR</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">House Rent Allowance (HRA):</span>
                <span className="font-semibold text-emerald-600">+{employee.hra.toLocaleString()} QAR</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Transport Allowance (TRA):</span>
                <span className="font-semibold text-emerald-600">+{employee.tra.toLocaleString()} QAR</span>
              </div>
              <div className="flex justify-between py-3 border-t-2 border-primary/20 text-sm font-bold">
                <span>Net Monthly Gross:</span>
                <span className="text-primary">{(employee.basic_salary + employee.hra + employee.tra).toLocaleString()} QAR</span>
              </div>
              <Button
                variant="outline"
                className="w-full text-xs gap-1.5 mt-2"
                onClick={() => setActiveTab("payslips")}
              >
                <DollarSign className="h-3.5 w-3.5" /> View Detailed Payslips
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 2: PUNCH ATTENDANCE & TIMESHEET ─────────────────────────────────── */}
      {activeTab === "attendance" && (
        <div className="space-y-6">
          {/* Quick Attendance Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-card/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Present Days</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-foreground">
                {myAttendance.filter(a => a.status === "PRESENT").length} <span className="text-xs text-muted-foreground font-normal">/ {myAttendance.length}</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">94.2% On-time punctuality</span>
            </Card>

            <Card className="p-4 bg-card/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Logged Hours</span>
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-foreground">
                {myAttendance.reduce((acc, a) => acc + (a.hours || 0), 0).toFixed(1)} <span className="text-xs text-muted-foreground font-normal">Hrs</span>
              </div>
              <span className="text-[11px] text-blue-600 font-medium">Avg ~9.1h / working day</span>
            </Card>

            <Card className="p-4 bg-card/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Overtime Hours</span>
                <Sparkles className="h-4 w-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-foreground">
                4.0 <span className="text-xs text-muted-foreground font-normal">Hrs</span>
              </div>
              <span className="text-[11px] text-purple-600 font-medium">~177 QAR extra payout</span>
            </Card>

            <Card className="p-4 bg-card/60">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Late Marks</span>
                <AlertCircle className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-foreground">1</div>
              <span className="text-[11px] text-muted-foreground">Grace period applied</span>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Punch Clock Card */}
            <Card className="lg:col-span-1 bg-gradient-to-br from-card to-muted/20 border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Fingerprint className="h-5 w-5 text-teal-600" /> Live Web Punch Clock
                </CardTitle>
                <CardDescription>GPS-verified attendance logging</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl border bg-background/80 text-center space-y-1 shadow-xs">
                  <span className="text-xs text-muted-foreground">Official System Clock</span>
                  <div className="text-3xl font-mono font-bold text-primary tracking-tight">{currentTime}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1.5 mt-1">
                    <MapPin className="h-3.5 w-3.5 text-teal-500" /> Doha HQ • GPS Geofence Validated
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border bg-muted/20 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Punch Status:</span>
                    <Badge variant={isPunchedIn ? "default" : "secondary"} className={isPunchedIn ? "bg-emerald-600 text-white" : ""}>
                      {isPunchedIn ? "Active (Punched In)" : "Punched Out"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Last Recorded:</span>
                    <span className="font-semibold font-mono text-foreground">{lastPunchTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Assigned Shift:</span>
                    <span className="font-medium text-foreground">08:00 AM – 05:00 PM</span>
                  </div>
                </div>

                <Button
                  onClick={handlePunchToggle}
                  className={`w-full py-5 text-sm font-bold gap-2 shadow-xs transition-all ${
                    isPunchedIn
                      ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
                  }`}
                >
                  <Fingerprint className="h-4 w-4" />
                  {isPunchedIn ? "Punch Out Now" : "Punch In Now"}
                </Button>

                <Button
                  onClick={() => setApplyOvertimeModal(true)}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5 text-purple-600" /> Log Overtime Hours
                </Button>
              </CardContent>
            </Card>

            {/* Attendance Log & Filterable Timesheet */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-teal-600" /> Attendance Log & Timesheet
                    </CardTitle>
                    <CardDescription>Daily punch records, source verification, and shift adherence</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.success("Exported monthly timesheet CSV")}
                    className="gap-1.5 text-xs self-start sm:self-auto"
                  >
                    <Download className="h-3.5 w-3.5" /> Export Timesheet
                  </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Month / Cycle</Label>
                    <Select value={attendanceMonthFilter} onValueChange={setAttendanceMonthFilter}>
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue placeholder="Select Month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Recorded Months</SelectItem>
                        <SelectItem value="2026-09">September 2026 (Current)</SelectItem>
                        <SelectItem value="2026-08">August 2026</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground">Punch Status</Label>
                    <Select value={attendanceStatusFilter} onValueChange={setAttendanceStatusFilter}>
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Statuses</SelectItem>
                        <SelectItem value="PRESENT">Present</SelectItem>
                        <SelectItem value="LATE_IN">Late In</SelectItem>
                        <SelectItem value="HALF_DAY">Half Day</SelectItem>
                        <SelectItem value="WEEK_OFF">Week Off</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[11px] text-muted-foreground">Punch Source / Device</Label>
                    <Select value={attendanceSourceFilter} onValueChange={setAttendanceSourceFilter}>
                      <SelectTrigger className="h-8 text-xs mt-1">
                        <SelectValue placeholder="All Sources" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Sources</SelectItem>
                        <SelectItem value="Biometric">Biometric HQ</SelectItem>
                        <SelectItem value="Face">Face Recognition</SelectItem>
                        <SelectItem value="Web">Web Punch Portal</SelectItem>
                        <SelectItem value="Mobile">Mobile GPS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="text-xs">Date & Day</TableHead>
                        <TableHead className="text-xs">Punch In</TableHead>
                        <TableHead className="text-xs">Punch Out</TableHead>
                        <TableHead className="text-xs">Hours</TableHead>
                        <TableHead className="text-xs">Source / Device</TableHead>
                        <TableHead className="text-xs text-right">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAttendance.map((a, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs">
                            <span className="font-semibold block">{a.date}</span>
                            <span className="text-[10px] text-muted-foreground">{a.day}</span>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-emerald-600 font-semibold">{a.inTime}</TableCell>
                          <TableCell className="font-mono text-xs text-blue-600 font-semibold">{a.outTime}</TableCell>
                          <TableCell className="text-xs">
                            <span className="font-bold">{a.hours}h</span>
                            {a.otHours > 0 && (
                              <span className="block text-[10px] text-purple-600 font-semibold">+{a.otHours}h OT</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              {a.punchSource.includes("Biometric") && <Fingerprint className="h-3 w-3 text-teal-600" />}
                              {a.punchSource.includes("Face") && <User className="h-3 w-3 text-blue-600" />}
                              {a.punchSource.includes("Web") && <Laptop className="h-3 w-3 text-amber-600" />}
                              {a.punchSource.includes("Mobile") && <Smartphone className="h-3 w-3 text-purple-600" />}
                              {a.punchSource}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold ${
                                a.status === "PRESENT"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300"
                                  : a.status === "LATE_IN"
                                  ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-300"
                                  : a.status === "HALF_DAY"
                                  ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-300"
                                  : "bg-slate-50 text-slate-600 border-slate-300 dark:bg-slate-900 dark:text-slate-400"
                              }`}
                            >
                              {a.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredAttendance.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                            No attendance records match the selected filters.
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

      {/* ── TAB 3: LEAVE APPLICATIONS (SHOW ALL LEAVES WRT DATES & TYPES + FILTERS) ────────────────── */}
      {activeTab === "leaves" && (
        <div className="space-y-6">
          {/* Leave Quota Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="p-4 border-l-4 border-l-blue-500 bg-card/60">
              <span className="text-xs text-muted-foreground block font-medium">Annual Leave Quota</span>
              <div className="text-2xl font-bold text-blue-600 mt-1">18 <span className="text-xs text-muted-foreground font-normal">/ 30 Days</span></div>
              <Progress value={60} className="h-1.5 mt-2 bg-blue-100" />
              <span className="text-[11px] text-muted-foreground mt-1.5 block">12 Days utilized this cycle</span>
            </Card>

            <Card className="p-4 border-l-4 border-l-emerald-500 bg-card/60">
              <span className="text-xs text-muted-foreground block font-medium">Casual & Emergency</span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">5 <span className="text-xs text-muted-foreground font-normal">/ 7 Days</span></div>
              <Progress value={71} className="h-1.5 mt-2 bg-emerald-100" />
              <span className="text-[11px] text-muted-foreground mt-1.5 block">2 Days utilized</span>
            </Card>

            <Card className="p-4 border-l-4 border-l-purple-500 bg-card/60">
              <span className="text-xs text-muted-foreground block font-medium">Sick / Medical Leave</span>
              <div className="text-2xl font-bold text-purple-600 mt-1">12 <span className="text-xs text-muted-foreground font-normal">/ 14 Days</span></div>
              <Progress value={85} className="h-1.5 mt-2 bg-purple-100" />
              <span className="text-[11px] text-muted-foreground mt-1.5 block">2 Days utilized (Paid)</span>
            </Card>

            <Card className="p-4 border-l-4 border-l-amber-500 bg-card/60 flex flex-col justify-between">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Pending Approvals</span>
                <div className="text-2xl font-bold text-amber-600 mt-1">
                  {myLeaves.filter(l => l.status === "Pending").length} <span className="text-xs text-muted-foreground font-normal">Request</span>
                </div>
              </div>
              <Button onClick={() => setApplyLeaveModal(true)} size="sm" className="w-full mt-2 gap-1.5 text-xs bg-primary text-primary-foreground">
                <Plus className="h-3.5 w-3.5" /> Apply New Leave
              </Button>
            </Card>
          </div>

          {/* All Leaves Table with Interactive Filters */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-600" /> All Leave Applications History
                  </CardTitle>
                  <CardDescription>
                    All leave records arranged by date and category with filter controls
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Total: {filteredLeaves.length} Records
                  </Badge>
                  <Button onClick={() => setApplyLeaveModal(true)} size="sm" className="gap-1.5 text-xs">
                    <Plus className="h-3.5 w-3.5" /> Apply Leave
                  </Button>
                </div>
              </div>

              {/* Comprehensive Filters Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t mt-3">
                {/* Search */}
                <div className="relative">
                  <Label className="text-[11px] text-muted-foreground">Search Records</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search by reason, type, date..."
                      className="h-8 pl-8 text-xs"
                      value={leaveSearch}
                      onChange={(e) => setLeaveSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Leave Type Filter */}
                <div>
                  <Label className="text-[11px] text-muted-foreground">Filter by Leave Type</Label>
                  <Select value={leaveTypeFilter} onValueChange={setLeaveTypeFilter}>
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue placeholder="All Leave Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Leave Types</SelectItem>
                      {uniqueLeaveTypes.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div>
                  <Label className="text-[11px] text-muted-foreground">Approval Status</Label>
                  <Select value={leaveStatusFilter} onValueChange={setLeaveStatusFilter}>
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="PENDING">Pending Approval</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Period Filter */}
                <div>
                  <Label className="text-[11px] text-muted-foreground">Timeline Period</Label>
                  <Select value={leavePeriodFilter} onValueChange={setLeavePeriodFilter}>
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue placeholder="All Cycles" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Cycles (2026)</SelectItem>
                      <SelectItem value="UPCOMING">Upcoming Leaves</SelectItem>
                      <SelectItem value="PAST">Past Leaves</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs">Leave Type</TableHead>
                      <TableHead className="text-xs">Leave Dates & Duration</TableHead>
                      <TableHead className="text-xs">Days Count</TableHead>
                      <TableHead className="text-xs">Justification & Scope</TableHead>
                      <TableHead className="text-xs">Applied On</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLeaves.map((l) => (
                      <TableRow key={l.id} className="hover:bg-muted/30">
                        <TableCell className="text-xs font-semibold">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-teal-600" />
                            {l.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="font-semibold text-foreground block">{l.start} <span className="text-muted-foreground font-normal">to</span> {l.end}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(l.start) >= new Date() ? "Upcoming Schedule" : "Completed Period"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs font-bold font-mono">
                          <span className="px-2 py-0.5 rounded-md bg-muted font-semibold">
                            {l.days} {l.days === 1 ? "Day" : "Days"}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate" title={l.reason}>
                          {l.reason}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{l.appliedOn || "2026-08-01"}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold ${
                              l.status === "Approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300"
                                : l.status === "Pending"
                                ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-300"
                                : l.status === "Cancelled"
                                ? "bg-slate-50 text-slate-600 border-slate-300 dark:bg-slate-900 dark:text-slate-400"
                                : "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/30 dark:text-rose-300"
                            }`}
                          >
                            {l.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {l.status === "Pending" ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancelLeave(l.id)}
                              className="h-7 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                            >
                              Cancel
                            </Button>
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {l.status === "Approved" ? "Locked" : "—"}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredLeaves.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">
                          No leave applications found matching the selected filter criteria.
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

      {/* ── TAB 4: CANCEL LEAVE (FILTERABLE & CLEAN) ─────────────────────────────── */}
      {activeTab === "cancel_leave" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-rose-500" /> Cancel Leave Applications
                  </CardTitle>
                  <CardDescription>Review and cancel pending or upcoming leave requests before commencement</CardDescription>
                </div>
                <Badge variant="outline" className="border-rose-500/30 text-rose-600 bg-rose-50/50 dark:bg-rose-950/20 text-xs self-start sm:self-auto">
                  {filteredCancelLeaves.length} Active Requests
                </Badge>
              </div>

              {/* Policy alert banner */}
              <div className="p-3.5 rounded-xl border bg-amber-50/40 dark:bg-amber-950/20 text-xs space-y-1 text-amber-800 dark:text-amber-300 mt-3 border-amber-300/40">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Qatar Labor Law Leave Cancellation Policy
                </div>
                <p className="text-[11px] opacity-90">
                  Pending leaves can be cancelled immediately with zero balance forfeiture. For approved leaves that have already commenced, an HR modification request is required.
                </p>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3">
                <div className="relative">
                  <Label className="text-[11px] text-muted-foreground">Search Active Leaves</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search by reason or dates..."
                      className="h-8 pl-8 text-xs"
                      value={cancelLeaveSearch}
                      onChange={(e) => setCancelLeaveSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] text-muted-foreground">Filter by Leave Type</Label>
                  <Select value={cancelLeaveTypeFilter} onValueChange={setCancelLeaveTypeFilter}>
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Leave Types</SelectItem>
                      {uniqueLeaveTypes.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs">Leave Type</TableHead>
                      <TableHead className="text-xs">Schedule / Duration</TableHead>
                      <TableHead className="text-xs">Days</TableHead>
                      <TableHead className="text-xs">Justification</TableHead>
                      <TableHead className="text-xs">Current Status</TableHead>
                      <TableHead className="text-xs text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCancelLeaves.map((l) => (
                      <TableRow key={l.id} className="hover:bg-muted/30">
                        <TableCell className="font-semibold text-xs">{l.type}</TableCell>
                        <TableCell className="text-xs">
                          <span className="font-medium text-foreground">{l.start} to {l.end}</span>
                        </TableCell>
                        <TableCell className="text-xs font-bold">{l.days} {l.days === 1 ? "Day" : "Days"}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-xs truncate" title={l.reason}>{l.reason}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              l.status === "Approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : "bg-amber-50 text-amber-700 border-amber-300"
                            }
                          >
                            {l.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelLeave(l.id)}
                            className="h-7 text-xs gap-1 shadow-xs"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Cancel Leave
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredCancelLeaves.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                          No active or pending leaves available to cancel.
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

      {/* ── TAB 5: SALARY PAYSLIPS ──────────────────────────────────────────────── */}
      {activeTab === "payslips" && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-card/60 border-l-4 border-l-primary">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Net Pay (Latest)</span>
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div className="text-2xl font-bold mt-2 text-foreground">
                {myPayslips[0]?.net?.toLocaleString() ?? "—"} <span className="text-xs text-muted-foreground font-normal">QAR</span>
              </div>
              <span className="text-[11px] text-primary font-medium">{myPayslips[0]?.month ?? ""}</span>
            </Card>

            <Card className="p-4 bg-card/60 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Disbursed (YTD)</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-foreground">
                {myPayslips.filter(p => p.status === "Paid").reduce((acc, p) => acc + p.net, 0).toLocaleString()} <span className="text-xs text-muted-foreground font-normal">QAR</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">{myPayslips.filter(p => p.status === "Paid").length} Payslips Paid</span>
            </Card>

            <Card className="p-4 bg-card/60 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Allowances (YTD)</span>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-foreground">
                {myPayslips.reduce((acc, p) => acc + p.allowances, 0).toLocaleString()} <span className="text-xs text-muted-foreground font-normal">QAR</span>
              </div>
              <span className="text-[11px] text-amber-600 font-medium">HRA + TRA + Benefits</span>
            </Card>

            <Card className="p-4 bg-card/60 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Tax Deductions</span>
                <ShieldCheck className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-foreground text-blue-600">0.00 <span className="text-xs text-muted-foreground font-normal">QAR</span></div>
              <span className="text-[11px] text-blue-600 font-medium">Qatar 0% Income Tax</span>
            </Card>
          </div>

          {/* Payslips Table with Filter */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" /> Payroll Disbursement History
                  </CardTitle>
                  <CardDescription>Monthly salary slips with full component breakdown and PDF downloads</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={payslipYearFilter} onValueChange={setPayslipYearFilter}>
                    <SelectTrigger className="h-8 text-xs w-40">
                      <SelectValue placeholder="Filter Year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Periods</SelectItem>
                      <SelectItem value="2026">Year 2026</SelectItem>
                      <SelectItem value="2025">Year 2025</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => toast.success("Exported payroll history as CSV")}>
                    <Download className="h-3.5 w-3.5" /> Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs">Payroll Cycle</TableHead>
                      <TableHead className="text-xs">Basic Pay</TableHead>
                      <TableHead className="text-xs">Allowances</TableHead>
                      <TableHead className="text-xs">Gross Earnings</TableHead>
                      <TableHead className="text-xs">Deductions</TableHead>
                      <TableHead className="text-xs font-bold">Net Disbursed</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs text-right">Payslip</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myPayslips
                      .filter(p => payslipYearFilter === "ALL" || p.month.includes(payslipYearFilter))
                      .map((p, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/30">
                        <TableCell className="font-semibold text-xs">{p.month}</TableCell>
                        <TableCell className="text-xs">{p.basic.toLocaleString()} QAR</TableCell>
                        <TableCell className="text-xs text-emerald-600 font-semibold">+{p.allowances.toLocaleString()} QAR</TableCell>
                        <TableCell className="text-xs font-semibold">{p.gross.toLocaleString()} QAR</TableCell>
                        <TableCell className="text-xs">
                          <span className="text-muted-foreground italic text-[11px]">NIL (0% Tax)</span>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-primary">
                          <span className="text-sm">{p.net.toLocaleString()}</span> QAR
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px]">{p.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast.success(`Downloading payslip for ${p.month}...`)}
                            className="h-7 text-xs gap-1"
                          >
                            <Download className="h-3 w-3" /> PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Footer Note */}
              <div className="mt-4 p-3 rounded-xl border bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/20 text-xs flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="text-muted-foreground">
                  <strong className="text-emerald-700 dark:text-emerald-400">Qatar WPS Compliant:</strong> All salary disbursements are made electronically via QNB under the Wage Protection System (WPS) mandate. No income tax (0%) is deducted as per Qatar tax law.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 6: QATAR STATUTORY & GRATUITY DETAILS ─────────────────────────────── */}
      {(activeTab === "statutory_gratuity" || activeTab === "tax_declaration") && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="text-base font-semibold">Qatar Statutory & End-of-Service Gratuity Entitlements</CardTitle>
                <CardDescription>
                  Qatar Labor Law compliance overview: 0% Personal Income Tax, WPS certification, and EOSB Gratuity accruals
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Downloaded Qatar WPS Statutory & Gratuity Statement")}
                className="gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" /> Download Statutory Statement
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Qatar Tax-Free & WPS Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <span className="font-bold text-sm text-emerald-900 dark:text-emerald-200">0% Personal Income Tax</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Under State of Qatar Tax Law, individual salaries and allowances are 100% tax-free with no income tax or TDS deductions.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-teal-50/40 dark:bg-teal-950/20 border-teal-500/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-teal-600" />
                    <span className="font-bold text-sm text-teal-900 dark:text-teal-200">WPS Wage Protection</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Direct electronic salary transfer compliant with Qatar Ministry of Labour Wage Protection System via Qatar National Bank.
                  </p>
                </div>

                <div className="p-4 rounded-xl border bg-blue-50/40 dark:bg-blue-950/20 border-blue-500/30">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span className="font-bold text-sm text-blue-900 dark:text-blue-200">End-of-Service Gratuity</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Accrual rate of 21 basic days per continuous year of service in accordance with Article 54 of Qatar Labor Law No. 14.
                  </p>
                </div>
              </div>

              {/* Statutory Computation Summary */}
              <div className="p-4 rounded-xl border bg-card/60 space-y-4">
                <h4 className="text-sm font-bold flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" /> End-of-Service Benefit (EOSB) Accrual Snapshot
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <span className="text-[11px] text-muted-foreground block font-medium">Basic Pay Base</span>
                    <span className="font-bold text-sm">8,500 QAR</span>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <span className="text-[11px] text-muted-foreground block font-medium">Completed Service</span>
                    <span className="font-bold text-sm">2 Years, 4 Months</span>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/20">
                    <span className="text-[11px] text-muted-foreground block font-medium">Annual Accrual Basis</span>
                    <span className="font-bold text-sm text-primary">21 Days / Year</span>
                  </div>
                  <div className="p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/30">
                    <span className="text-[11px] text-muted-foreground block font-medium">Accrued Gratuity</span>
                    <span className="font-bold text-sm text-emerald-600">13,883 QAR</span>
                  </div>
                </div>
              </div>

              {/* Statutory Registration & Social Insurance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border bg-card/60 space-y-2">
                  <h5 className="font-bold text-xs">QID & Work Permit Clearance</h5>
                  <div className="space-y-1 text-muted-foreground">
                    <p>• QID / Residence Permit: <strong className="text-foreground font-mono">QID-29463401928</strong></p>
                    <p>• Ministry of Labour Contract: <strong className="text-foreground">Unlimited Term Verified</strong></p>
                    <p>• Sponsor / Establishment: <strong className="text-foreground">Zyno Property Management W.L.L</strong></p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-card/60 space-y-2">
                  <h5 className="font-bold text-xs">Social Insurance / GRSA Pension</h5>
                  <div className="space-y-1 text-muted-foreground">
                    <p>• Expatriate Staff: <strong className="text-emerald-600">Exempt (0% deduction)</strong></p>
                    <p>• Qatari Nationals: <strong>GRSA Law (5% Employee / 15% Employer)</strong></p>
                    <p>• Current Deduction: <strong className="text-foreground font-mono">0.00 QAR</strong></p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 7: TRAVEL & REIMBURSEMENTS ─────────────────────────────────────── */}
      {activeTab === "expenses" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-card/60 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Claimed</span>
                <Receipt className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold mt-2">
                {myExpenses.reduce((acc, e) => acc + e.amount, 0).toLocaleString()} <span className="text-xs text-muted-foreground font-normal">QAR</span>
              </div>
              <span className="text-[11px] text-amber-600 font-medium">{myExpenses.length} Total Claims</span>
            </Card>

            <Card className="p-4 bg-card/60 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Reimbursed</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-emerald-600">
                {myExpenses.filter(e => e.status === "Reimbursed").reduce((acc, e) => acc + e.amount, 0).toLocaleString()} <span className="text-xs text-muted-foreground font-normal">QAR</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-medium">{myExpenses.filter(e => e.status === "Reimbursed").length} Settled</span>
            </Card>

            <Card className="p-4 bg-card/60 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Approved / Pending</span>
                <Clock className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold mt-2">
                {myExpenses.filter(e => e.status === "Approved" || e.status === "Pending").length} <span className="text-xs text-muted-foreground font-normal">Claims</span>
              </div>
              <span className="text-[11px] text-blue-600 font-medium">Awaiting reimbursement</span>
            </Card>

            <Card className="p-4 bg-card/60 border-l-4 border-l-primary flex flex-col justify-between">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Submit New Claim</span>
                <p className="text-[11px] text-muted-foreground mt-1">Travel, fuel, hospitality</p>
              </div>
              <Button onClick={() => setApplyExpenseModal(true)} size="sm" className="w-full mt-2 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> New Expense Claim
              </Button>
            </Card>
          </div>

          {/* Expenses Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-amber-600" /> Expense Claims History
                  </CardTitle>
                  <CardDescription>All filed reimbursement requests with approval tracking</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => toast.success("Exported expense report as CSV")}>
                  <Download className="h-3.5 w-3.5" /> Export Report
                </Button>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t mt-3">
                <div className="relative">
                  <Label className="text-[11px] text-muted-foreground">Search Claims</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search by title or category..."
                      className="h-8 pl-8 text-xs"
                      value={expenseSearch}
                      onChange={(e) => setExpenseSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Filter by Status</Label>
                  <Select value={expenseStatusFilter} onValueChange={setExpenseStatusFilter}>
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Reimbursed">Reimbursed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs">Claim Title</TableHead>
                      <TableHead className="text-xs">Category</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Amount</TableHead>
                      <TableHead className="text-xs text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myExpenses
                      .filter(e =>
                        (expenseStatusFilter === "ALL" || e.status === expenseStatusFilter) &&
                        (expenseSearch === "" || e.title.toLowerCase().includes(expenseSearch.toLowerCase()) || e.type.toLowerCase().includes(expenseSearch.toLowerCase()))
                      )
                      .map((exp) => (
                      <TableRow key={exp.id} className="hover:bg-muted/30">
                        <TableCell className="font-semibold text-xs">
                          <span className="flex items-center gap-1.5">
                            <Receipt className="h-3.5 w-3.5 text-amber-500" />
                            {exp.title}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{exp.type}</TableCell>
                        <TableCell className="text-xs">{exp.date}</TableCell>
                        <TableCell className="text-xs font-bold text-primary">{exp.amount.toLocaleString()} QAR</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold ${
                              exp.status === "Reimbursed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300"
                                : exp.status === "Approved"
                                ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-300"
                                : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-300"
                            }`}
                          >
                            {exp.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {myExpenses.filter(e =>
                      (expenseStatusFilter === "ALL" || e.status === expenseStatusFilter) &&
                      (expenseSearch === "" || e.title.toLowerCase().includes(expenseSearch.toLowerCase()) || e.type.toLowerCase().includes(expenseSearch.toLowerCase()))
                    ).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">No expense claims match your filters.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 8: APPLY LOANS & ADVANCES ──────────────────────────────────────── */}
      {activeTab === "loans" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-card/60 border-l-4 border-l-violet-500">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Borrowed</span>
                <CreditCard className="h-4 w-4 text-violet-500" />
              </div>
              <div className="text-2xl font-bold mt-2">
                {myLoans.reduce((acc, l) => acc + l.amount, 0).toLocaleString()} <span className="text-xs text-muted-foreground font-normal">QAR</span>
              </div>
              <span className="text-[11px] text-violet-600 font-medium">{myLoans.length} Active Loan(s)</span>
            </Card>

            <Card className="p-4 bg-card/60 border-l-4 border-l-rose-500">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Outstanding Balance</span>
                <AlertCircle className="h-4 w-4 text-rose-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-rose-600">
                {myLoans.filter(l => l.status === "Active").reduce((acc, l) => acc + l.remaining, 0).toLocaleString()} <span className="text-xs text-muted-foreground font-normal">QAR</span>
              </div>
              <span className="text-[11px] text-rose-600 font-medium">To be recovered via EMI</span>
            </Card>

            <Card className="p-4 bg-card/60 border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Monthly EMI</span>
                <ArrowUpDown className="h-4 w-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold mt-2">
                {myLoans.filter(l => l.status === "Active").reduce((acc, l) => acc + l.emi, 0).toLocaleString()} <span className="text-xs text-muted-foreground font-normal">QAR/Mo</span>
              </div>
              <span className="text-[11px] text-amber-600 font-medium">Auto-deducted from payroll</span>
            </Card>

            <Card className="p-4 bg-card/60 border-l-4 border-l-primary flex flex-col justify-between">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">New Loan / Advance</span>
                <p className="text-[11px] text-muted-foreground mt-1">Housing, medical, air ticket</p>
              </div>
              <Button onClick={() => setApplyLoanModal(true)} size="sm" className="w-full mt-2 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Apply for Loan
              </Button>
            </Card>
          </div>

          {/* Loan Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-violet-600" /> Active Loans & Advance Schedules
                  </CardTitle>
                  <CardDescription>Outstanding balance, EMI schedule, and repayment tracking</CardDescription>
                </div>
                <Select value={loanStatusFilter} onValueChange={setLoanStatusFilter}>
                  <SelectTrigger className="h-8 text-xs w-40">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs">Purpose / Type</TableHead>
                      <TableHead className="text-xs">Principal</TableHead>
                      <TableHead className="text-xs">Monthly EMI</TableHead>
                      <TableHead className="text-xs">Tenure</TableHead>
                      <TableHead className="text-xs">Remaining Balance</TableHead>
                      <TableHead className="text-xs">Recovery Progress</TableHead>
                      <TableHead className="text-xs text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myLoans
                      .filter(l => loanStatusFilter === "ALL" || l.status === loanStatusFilter)
                      .map((l) => {
                        const recovered = l.amount - l.remaining;
                        const pct = Math.round((recovered / l.amount) * 100);
                        return (
                          <TableRow key={l.id} className="hover:bg-muted/30">
                            <TableCell className="font-semibold text-xs">
                              <span className="flex items-center gap-1.5">
                                <CreditCard className="h-3.5 w-3.5 text-violet-500" />
                                {l.reason}
                              </span>
                            </TableCell>
                            <TableCell className="text-xs font-bold">{l.amount.toLocaleString()} QAR</TableCell>
                            <TableCell className="text-xs text-rose-600 font-semibold">{l.emi.toLocaleString()} QAR/Mo</TableCell>
                            <TableCell className="text-xs">{l.tenure}</TableCell>
                            <TableCell className="text-xs font-mono font-bold">{l.remaining.toLocaleString()} QAR</TableCell>
                            <TableCell className="text-xs w-32">
                              <div className="space-y-1">
                                <Progress value={pct} className="h-1.5" />
                                <span className="text-[10px] text-muted-foreground">{pct}% recovered</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant="outline"
                                className={`text-[10px] font-semibold ${
                                  l.status === "Active"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300"
                                    : l.status === "Under Review"
                                    ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-300"
                                    : "bg-slate-50 text-slate-600 border-slate-300 dark:bg-slate-900 dark:text-slate-400"
                                }`}
                              >
                                {l.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        );
                    })}
                    {myLoans.filter(l => loanStatusFilter === "ALL" || l.status === loanStatusFilter).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-xs text-muted-foreground">No loan records found for the selected status.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}



      {/* ── HELP DESK & TICKETS ────────────────────────────────────────── */}
      {activeTab === "helpdesk" && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 bg-card/60 border-l-4 border-l-orange-500">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Tickets</span>
                <HelpCircle className="h-4 w-4 text-orange-500" />
              </div>
              <div className="text-2xl font-bold mt-2">{myTickets.length}</div>
              <span className="text-[11px] text-orange-600 font-medium">All time raised</span>
            </Card>

            <Card className="p-4 bg-card/60 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Resolved</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-emerald-600">{myTickets.filter(t => t.status === "Resolved").length}</div>
              <span className="text-[11px] text-emerald-600 font-medium">Closed successfully</span>
            </Card>

            <Card className="p-4 bg-card/60 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">In Progress</span>
                <RefreshCw className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold mt-2">{myTickets.filter(t => t.status === "In_Progress" || t.status === "Open").length}</div>
              <span className="text-[11px] text-blue-600 font-medium">Being handled</span>
            </Card>

            <Card className="p-4 bg-card/60 border-l-4 border-l-primary flex flex-col justify-between">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Raise New Ticket</span>
                <p className="text-[11px] text-muted-foreground mt-1">HR, IT, Payroll, Facility</p>
              </div>
              <Button onClick={() => setSubmitTicketModal(true)} size="sm" className="w-full mt-2 gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Log Service Ticket
              </Button>
            </Card>
          </div>

          {/* Tickets Table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-orange-500" /> Service Tickets & Grievance Log
                  </CardTitle>
                  <CardDescription>Track all HR, IT, payroll, and facility support requests</CardDescription>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t mt-3">
                <div className="relative">
                  <Label className="text-[11px] text-muted-foreground">Search Tickets</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search by subject or category..."
                      className="h-8 pl-8 text-xs"
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground">Filter by Status</Label>
                  <Select value={ticketStatusFilter} onValueChange={setTicketStatusFilter}>
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In_Progress">In Progress</SelectItem>
                      <SelectItem value="Resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="text-xs">Ticket #</TableHead>
                      <TableHead className="text-xs">Subject</TableHead>
                      <TableHead className="text-xs">Category</TableHead>
                      <TableHead className="text-xs">Date Logged</TableHead>
                      <TableHead className="text-xs text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myTickets
                      .filter(t =>
                        (ticketStatusFilter === "ALL" || t.status === ticketStatusFilter) &&
                        (ticketSearch === "" || t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) || t.category.toLowerCase().includes(ticketSearch.toLowerCase()))
                      )
                      .map((t) => (
                      <TableRow key={t.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono font-bold text-xs text-primary">{t.number}</TableCell>
                        <TableCell className="text-xs font-medium">{t.subject}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{t.category}</TableCell>
                        <TableCell className="text-xs">{t.date}</TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-semibold ${
                              t.status === "Resolved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-300"
                                : t.status === "In_Progress"
                                ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/30 dark:text-blue-300"
                                : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/30 dark:text-amber-300"
                            }`}
                          >
                            {t.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {myTickets.filter(t =>
                      (ticketStatusFilter === "ALL" || t.status === ticketStatusFilter) &&
                      (ticketSearch === "" || t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) || t.category.toLowerCase().includes(ticketSearch.toLowerCase()))
                    ).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">No tickets match your filters.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── RESIGNATION & NOTICE ───────────────────────────────────────── */}
      {activeTab === "resignation" && (
        <div className="space-y-6">
          {/* Key Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-card/60 border-l-4 border-l-rose-500">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Notice Period</span>
                <Clock className="h-4 w-4 text-rose-500" />
              </div>
              <div className="text-2xl font-bold mt-2">30 <span className="text-xs text-muted-foreground font-normal">Days</span></div>
              <span className="text-[11px] text-rose-600 font-medium">As per Labor Law & Contract</span>
            </Card>

            <Card className="p-4 bg-card/60 border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">EOSB Entitlement</span>
                <Award className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-emerald-600">13,883 <span className="text-xs text-muted-foreground font-normal">QAR</span></div>
              <span className="text-[11px] text-emerald-600 font-medium">Accrued Gratuity (2y 4m)</span>
            </Card>

            <Card className="p-4 bg-card/60 border-l-4 border-l-blue-500">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Notice Status</span>
                <FileText className="h-4 w-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold mt-2 text-blue-600">Active</div>
              <span className="text-[11px] text-blue-600 font-medium">No pending notice filed</span>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Notice Period Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Notice Period & Offboarding Policy
                </CardTitle>
                <CardDescription>Qatar Labor Law Article 50 — notice period guidelines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="p-3 rounded-xl border bg-muted/20 space-y-2">
                  <p className="text-muted-foreground leading-relaxed">
                    Your designated notice period is <strong className="text-foreground">30 Days</strong> as per employment contract and Qatar Labor Law.
                    Upon notice submission, the following will be initiated automatically:
                  </p>
                  <ul className="space-y-1.5 text-muted-foreground">
                    {[
                      "Knowledge Transfer (KT) schedule assignment",
                      "IT access revocation timeline (Last Working Day)",
                      "Finance Full & Final settlement calculation",
                      "Facility asset return & clearance checklist",
                      "HR exit interview scheduling",
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl border bg-amber-50/40 dark:bg-amber-950/20 border-amber-300/40 text-amber-800 dark:text-amber-300">
                  <div className="font-semibold flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> Important Note
                  </div>
                  <p className="text-[11px] opacity-90">
                    Resignation is irreversible once HR formally accepts. Please discuss with your reporting manager before proceeding.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Notice */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <LogOut className="h-4 w-4 text-rose-500" /> Submit Formal Resignation Notice
                </CardTitle>
                <CardDescription>Initiates the offboarding workflow and notice period countdown</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="p-3 rounded-xl border bg-muted/20 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Employee:</span>
                    <span className="font-semibold">{employee.first_name} {employee.last_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-semibold">{employee.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date of Joining:</span>
                    <span className="font-semibold">{employee.date_of_joining}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Duration:</span>
                    <span className="font-semibold text-primary">2 Years, 4 Months</span>
                  </div>
                </div>

                <Button
                  onClick={() => setSubmitResignationModal(true)}
                  variant="destructive"
                  className="w-full gap-2"
                >
                  <LogOut className="h-4 w-4" /> Initiate Formal Resignation
                </Button>

                <p className="text-[10px] text-muted-foreground text-center">
                  By proceeding, you confirm your intention to resign from the organization.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB: CHANGE PASSWORD ────────────────────────────────────────────── */}
      {activeTab === "change_password" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
          {/* Password Update Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Key className="h-4 w-4 text-teal-600" /> Update Account Password
              </CardTitle>
              <CardDescription>Change your portal credentials. Use a strong unique password.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Current Password *</Label>
                  <div className="relative">
                    <Input
                      type={showCurrentPass ? "text" : "password"}
                      required
                      placeholder="Enter your current password"
                      value={passwords.current}
                      onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">New Password *</Label>
                  <div className="relative">
                    <Input
                      type={showNewPass ? "text" : "password"}
                      required
                      placeholder="Minimum 8 characters"
                      value={passwords.new_pass}
                      onChange={(e) => setPasswords({ ...passwords, new_pass: e.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {/* Strength Bar */}
                  {passwords.new_pass.length > 0 && (
                    <div className="space-y-1.5 mt-2">
                      <Progress value={passwordChecks.strengthPercent} className={`h-1.5 ${passwordChecks.strengthColor}`} />
                      <span className={`text-[11px] font-semibold ${
                        passwordChecks.score >= 4 ? "text-emerald-600" : passwordChecks.score >= 3 ? "text-blue-600" : passwordChecks.score >= 2 ? "text-amber-600" : "text-rose-600"
                      }`}>
                        Password Strength: {passwordChecks.strengthLabel}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Confirm New Password *</Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPass ? "text" : "password"}
                      required
                      placeholder="Re-enter new password to confirm"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                      className={`pr-10 ${
                        passwords.confirm.length > 0
                          ? passwordChecks.isMatched ? "border-emerald-500 focus-visible:ring-emerald-500" : "border-rose-500 focus-visible:ring-rose-500"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwords.confirm.length > 0 && (
                    <p className={`text-[11px] font-medium ${
                      passwordChecks.isMatched ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {passwordChecks.isMatched ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!passwordChecks.isValid}
                >
                  <Key className="h-4 w-4 mr-2" /> Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Security Requirements & Info */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Password Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                {[
                  { check: passwordChecks.hasMinLen, label: "At least 8 characters" },
                  { check: passwordChecks.hasUpper, label: "At least one uppercase letter (A–Z)" },
                  { check: passwordChecks.hasNumber, label: "At least one number (0–9)" },
                  { check: passwordChecks.hasSpecial, label: "At least one special character (!@#$...)" },
                  { check: passwordChecks.isMatched && passwords.confirm.length > 0, label: "New password confirmed and matched" },
                ].map((req, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {req.check
                      ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      : <XCircle className="h-4 w-4 text-muted-foreground/40" />
                    }
                    <span className={req.check ? "text-foreground" : "text-muted-foreground"}>{req.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <div className="flex items-start gap-3 p-3 rounded-xl border bg-muted/20">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-[11px]">Two-Factor Authentication — Active</p>
                    <p className="text-[11px] mt-0.5">Your official email <span className="font-mono text-primary">{employee.email}</span> is registered as a 2FA backup.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl border bg-muted/20">
                  <Lock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground text-[11px]">Session Management</p>
                    <p className="text-[11px] mt-0.5">All active sessions are encrypted. Changing your password does not invalidate current sessions unless flagged.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── DIALOGS ──────────────────────────────────────────────────────────── */}

      {/* Apply Leave Modal */}
      <Dialog open={applyLeaveModal} onOpenChange={setApplyLeaveModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold border border-blue-500/20 shadow-xs">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Apply for Leave</DialogTitle>
                <p className="text-xs text-muted-foreground">Select leave quota category and requested vacation period</p>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleApplyLeave} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Leave Quota Category *</Label>
              <Select
                value={leaveForm.leave_type}
                onValueChange={(val) => setLeaveForm({ ...leaveForm, leave_type: val })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {masterLeaveTypes.map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
                  {masterLeaveTypes.length === 0 && (
                    <>
                      <SelectItem value="Annual Leave (30 Calendar Days)">Annual Leave (30 Calendar Days)</SelectItem>
                      <SelectItem value="Casual & Emergency Leave (7 Days)">Casual & Emergency Leave (7 Days)</SelectItem>
                      <SelectItem value="Sick Leave (Fully Paid 14 Days)">Sick Leave (Fully Paid 14 Days)</SelectItem>
                      <SelectItem value="Maternity Leave (50 Paid Days)">Maternity Leave (50 Paid Days)</SelectItem>
                      <SelectItem value="Hajj Pilgrimage Leave (20 Days Unpaid)">Hajj Pilgrimage Leave (20 Days Unpaid)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border">
              <div>
                <Label className="text-xs font-semibold">Start Date</Label>
                <Input
                  type="date"
                  className="mt-1 text-xs bg-background"
                  value={leaveForm.start_date}
                  onChange={(e) => {
                    const start = e.target.value;
                    const end = leaveForm.end_date;
                    let days = 1;
                    if (start && end) {
                      const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24) + 1;
                      days = Math.max(1, Math.round(diff));
                    }
                    setLeaveForm({ ...leaveForm, start_date: start, days_count: days });
                  }}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">End Date</Label>
                <Input
                  type="date"
                  className="mt-1 text-xs bg-background"
                  value={leaveForm.end_date}
                  onChange={(e) => {
                    const end = e.target.value;
                    const start = leaveForm.start_date;
                    let days = 1;
                    if (start && end) {
                      const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 3600 * 24) + 1;
                      days = Math.max(1, Math.round(diff));
                    }
                    setLeaveForm({ ...leaveForm, end_date: end, days_count: days });
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs">
              <span className="text-muted-foreground font-medium">Requested Duration:</span>
              <span className="font-bold text-blue-600 font-mono text-sm">{leaveForm.days_count || 1} Calendar Days</span>
            </div>

            <div>
              <Label className="text-xs font-semibold">Reason for Leave & Travel Destination *</Label>
              <Textarea
                required
                rows={3}
                className="mt-1 text-xs"
                placeholder="Specify purpose of leave, travel details or medical remarks..."
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setApplyLeaveModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Submit Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Apply Expense Modal */}
      <Dialog open={applyExpenseModal} onOpenChange={setApplyExpenseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold border border-amber-500/20 shadow-xs">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Submit Out-of-Pocket Expense Claim</DialogTitle>
                <p className="text-xs text-muted-foreground">Log expense reimbursement request with invoice & receipt</p>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmitExpense} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Expense Classification</Label>
              <Select
                value={expenseForm.type}
                onValueChange={(val) => setExpenseForm({ ...expenseForm, type: val })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {masterExpenseTypes.map((exp) => (
                    <SelectItem key={exp.id} value={exp.name}>
                      {exp.name}
                    </SelectItem>
                  ))}
                  {masterExpenseTypes.length === 0 && (
                    <>
                      <SelectItem value="Local Travel & Inspection Fuel (Travel Expense)">Local Travel & Inspection Fuel</SelectItem>
                      <SelectItem value="Official Food & Refreshments (Reimbursement Expense)">Official Food & Client Hospitality</SelectItem>
                      <SelectItem value="Office Supplies & Urgent Spares (Other Expense)">Office Supplies & Urgent Spares</SelectItem>
                      <SelectItem value="Visa & Government Labor Attestation Fees">Visa & Government Labor Attestation Fees</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Claim Title / Purpose *</Label>
              <Input
                required
                className="mt-1 text-xs"
                placeholder="e.g. Property Inspection Fuel & Parking - West Bay"
                value={expenseForm.title}
                onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border">
              <div>
                <Label className="text-xs font-semibold">Amount (QAR) *</Label>
                <Input
                  type="number"
                  required
                  className="mt-1 text-xs bg-background"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Expense Date</Label>
                <Input
                  type="date"
                  className="mt-1 text-xs bg-background"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-semibold">Attach Receipt / Tax Invoice</Label>
              <Input type="file" className="mt-1 text-xs" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setApplyExpenseModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Submit Claim
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Apply Loan Modal */}
      <Dialog open={applyLoanModal} onOpenChange={setApplyLoanModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-violet-500/10 text-violet-600 flex items-center justify-center font-bold border border-violet-500/20 shadow-xs">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Apply for Salary Advance / Loan</DialogTitle>
                <p className="text-xs text-muted-foreground">Emergency advances, housing loans, and automated EMI recovery</p>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmitLoan} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Loan / Advance Category *</Label>
              <Select
                value={loanForm.loan_type}
                onValueChange={(val) => setLoanForm({ ...loanForm, loan_type: val })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {masterLoanTypes.map((lt) => (
                    <SelectItem key={lt.id} value={lt.name}>
                      {lt.name}
                    </SelectItem>
                  ))}
                  {masterLoanTypes.length === 0 && (
                    <>
                      <SelectItem value="Annual Housing Advance Loan">Annual Housing Advance Loan</SelectItem>
                      <SelectItem value="Emergency Medical & Family Loan">Emergency Medical & Family Loan</SelectItem>
                      <SelectItem value="Annual Air Ticket Advance">Annual Air Ticket Advance</SelectItem>
                      <SelectItem value="Vehicle / Transportation Advance">Vehicle / Transportation Advance</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border">
              <div>
                <Label className="text-xs font-semibold">Loan Principal (QAR) *</Label>
                <Input
                  type="number"
                  required
                  className="mt-1 text-xs bg-background"
                  value={loanForm.amount}
                  onChange={(e) => setLoanForm({ ...loanForm, amount: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Repayment Tenure</Label>
                <Select
                  value={String(loanForm.tenure_months)}
                  onValueChange={(val) => setLoanForm({ ...loanForm, tenure_months: Number(val) })}
                >
                  <SelectTrigger className="mt-1 bg-background text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 Months</SelectItem>
                    <SelectItem value="6">6 Months</SelectItem>
                    <SelectItem value="10">10 Months</SelectItem>
                    <SelectItem value="12">12 Months (1 Year)</SelectItem>
                    <SelectItem value="24">24 Months (2 Years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Monthly Payroll Deduction:</span>
              <span className="font-bold text-emerald-600 text-sm font-mono">
                {Math.round(loanForm.amount / (loanForm.tenure_months || 1)).toLocaleString()} QAR / Month
              </span>
            </div>
            <div>
              <Label className="text-xs font-semibold">Purpose / Justification *</Label>
              <Textarea
                required
                rows={2}
                className="mt-1 text-xs"
                placeholder="State your reason for advance..."
                value={loanForm.reason}
                onChange={(e) => setLoanForm({ ...loanForm, reason: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setApplyLoanModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Submit Loan Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Apply Overtime Modal */}
      <Dialog open={applyOvertimeModal} onOpenChange={setApplyOvertimeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold border border-purple-500/20 shadow-xs">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Log Overtime Work Request</DialogTitle>
                <p className="text-xs text-muted-foreground">Log extra operational hours for approval & payroll payout</p>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmitOvertime} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border">
              <div>
                <Label className="text-xs font-semibold">Date of Overtime</Label>
                <Input
                  type="date"
                  className="mt-1 text-xs bg-background"
                  value={overtimeForm.date}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, date: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold">Extra Hours (e.g. 3.5)</Label>
                <Input
                  type="number"
                  step="0.5"
                  className="mt-1 text-xs bg-background"
                  value={overtimeForm.hours}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, hours: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-xs flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Estimated OT Rate (Qatar Law 1.25x):</span>
              <span className="font-bold text-blue-600 font-mono text-sm">
                ~{Math.round((overtimeForm.hours || 0) * (8500 / 240) * 1.25).toLocaleString()} QAR
              </span>
            </div>
            <div>
              <Label className="text-xs font-semibold">Work Scope / Project Justification *</Label>
              <Textarea
                required
                rows={3}
                className="mt-1 text-xs"
                placeholder="Explain the urgent task (e.g. tenant move-in inspection, chiller maintenance)..."
                value={overtimeForm.reason}
                onChange={(e) => setOvertimeForm({ ...overtimeForm, reason: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setApplyOvertimeModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Submit Overtime
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Submit Ticket Modal */}
      <Dialog open={submitTicketModal} onOpenChange={setSubmitTicketModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold border border-orange-500/20 shadow-xs">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Log Help Desk / Grievance Ticket</DialogTitle>
                <p className="text-xs text-muted-foreground">Raise HR, IT, Payroll, or Facility support query</p>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmitTicket} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Ticket Category</Label>
              <Select
                value={ticketForm.category}
                onValueChange={(val) => setTicketForm({ ...ticketForm, category: val })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {masterTicketCategories.map((t) => (
                    <SelectItem key={t.id} value={t.name}>
                      {t.name}
                    </SelectItem>
                  ))}
                  {masterTicketCategories.length === 0 && (
                    <>
                      <SelectItem value="HR & Salary Certificate Requests">HR & Salary Certificate Requests</SelectItem>
                      <SelectItem value="IT & System Access Support">IT & System Access Support</SelectItem>
                      <SelectItem value="Payroll & Reimbursement Discrepancy">Payroll & Reimbursement Discrepancy</SelectItem>
                      <SelectItem value="Facility & Workplace Assets">Facility & Workplace Assets</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-semibold">Subject / Short Summary *</Label>
              <Input
                required
                className="mt-1 text-xs"
                placeholder="e.g. Salary Certificate with bank seal for visa renewal"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Detailed Description & Reference *</Label>
              <Textarea
                required
                rows={3}
                className="mt-1 text-xs"
                placeholder="Provide full details and any reference numbers..."
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSubmitTicketModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Submit Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resignation Modal */}
      <Dialog open={submitResignationModal} onOpenChange={setSubmitResignationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold border border-rose-500/20 shadow-xs">
                <LogOut className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Formal Notice & Resignation</DialogTitle>
                <p className="text-xs text-muted-foreground">Initiates 30-day notice period and departmental clearance</p>
              </div>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmitResignation} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold">Requested Last Working Day</Label>
              <Input
                type="date"
                className="mt-1 text-xs"
                value={resignationForm.requested_lwd}
                onChange={(e) => setResignationForm({ ...resignationForm, requested_lwd: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Reason for Separation & Exit Feedback *</Label>
              <Textarea
                required
                rows={3}
                className="mt-1 text-xs"
                placeholder="State your reason for separation..."
                value={resignationForm.reason}
                onChange={(e) => setResignationForm({ ...resignationForm, reason: e.target.value })}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSubmitResignationModal(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="destructive">
                Submit Formal Notice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
