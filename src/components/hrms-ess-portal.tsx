import React, { useState, useEffect } from "react";
import {
  User, Calendar, Clock, DollarSign, Award, Receipt, FileText, Send,
  Plus, CheckCircle2, XCircle, AlertTriangle, Download, Eye, Lock,
  BookOpen, HelpCircle, LogOut, MessageSquare, Briefcase, RefreshCw,
  Search, Shield, Layers, UploadCloud, ChevronRight, CreditCard, Key,
  MapPin, Fingerprint, Building2, Check, Sparkles, ShieldCheck, ArrowRight
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

  const [passwords, setPasswords] = useState({
    current: "",
    new_pass: "",
    confirm: "",
  });

  // Tax declaration state
  const [taxRegime, setTaxRegime] = useState("Standard Regime");
  const [taxDeclarations, setTaxDeclarations] = useState({
    hraRent: 30000,
    lifeInsurance: 15000,
    medicalInsurance: 5000,
    npsContribution: 50000,
    homeLoanInterest: 0,
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

      // Seeded mock user data
      setMyLeaves([
        { id: "l-1", type: "Annual Leave", start: "2026-08-10", end: "2026-08-15", days: 5, status: "Approved", reason: "Annual family holiday" },
        { id: "l-2", type: "Casual Leave", start: "2026-09-02", end: "2026-09-02", days: 1, status: "Pending", reason: "Personal bank documentation" },
        { id: "l-3", type: "Sick Leave", start: "2026-06-12", end: "2026-06-13", days: 2, status: "Approved", reason: "Viral fever & rest" },
      ]);

      setMyAttendance([
        { date: "2026-09-07", inTime: "07:55 AM", outTime: "05:05 PM", hours: 9.1, status: "PRESENT", punchSource: "Biometric Doha HQ" },
        { date: "2026-09-06", inTime: "08:02 AM", outTime: "05:00 PM", hours: 8.9, status: "PRESENT", punchSource: "Face Recognition" },
        { date: "2026-09-05", inTime: "07:50 AM", outTime: "05:15 PM", hours: 9.4, status: "PRESENT", punchSource: "Biometric Doha HQ" },
        { date: "2026-09-04", inTime: "—", outTime: "—", hours: 0, status: "WEEK_OFF", punchSource: "System Schedule" },
        { date: "2026-09-03", inTime: "08:00 AM", outTime: "05:10 PM", hours: 9.1, status: "PRESENT", punchSource: "Web Punch Portal" },
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
      type: leaveForm.leave_type,
      start: leaveForm.start_date,
      end: leaveForm.end_date,
      days: 2,
      status: "Pending",
      reason: leaveForm.reason,
    };
    setMyLeaves([newEntry, ...myLeaves]);
    toast.success("Leave application submitted to reporting manager!");
    setApplyLeaveModal(false);
  };

  const handleCancelLeave = (id: string) => {
    setMyLeaves(myLeaves.map(l => l.id === id ? { ...l, status: "Cancelled" } : l));
    toast.success("Leave application cancelled successfully");
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

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new_pass !== passwords.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.new_pass.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    toast.success("Password updated successfully!");
    setPasswords({ current: "", new_pass: "", confirm: "" });
  };

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
      {/* Employee Top Hero Profile Card */}
      <div className="bg-card border rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-teal-500/10 flex items-center justify-center font-bold text-teal-600 text-2xl border border-teal-500/20 shadow-xs shrink-0">
            {employee.first_name[0]}{employee.last_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight">{employee.first_name} {employee.last_name}</h2>
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white">Active Staff</Badge>
              <Badge variant="outline" className="border-teal-500/40 text-teal-600 bg-teal-50/50 dark:bg-teal-950/20 text-xs font-semibold gap-1.5">
                <CurrentTabIcon className="h-3 w-3" />
                {currentTabMeta.title}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {employee.designation} • {employee.department} • <span className="font-mono font-semibold text-primary">{employee.employee_id_code}</span>
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Live Punch Clock Card */}
            <Card className="md:col-span-1 bg-gradient-to-br from-card to-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-teal-600" /> Web & Biometric Punch Clock
                </CardTitle>
                <CardDescription>Real-time attendance punch</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl border bg-background/80 text-center space-y-1">
                  <span className="text-xs text-muted-foreground">Current Live Time</span>
                  <div className="text-2xl font-mono font-bold text-primary">{currentTime}</div>
                  <div className="text-[11px] text-muted-foreground flex items-center justify-center gap-1 mt-1">
                    <MapPin className="h-3 w-3 text-teal-500" /> Doha HQ • GPS Validated
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Current Punch Status:</span>
                    <Badge variant={isPunchedIn ? "default" : "secondary"}>
                      {isPunchedIn ? "Punched In" : "Punched Out"}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Last Timestamp:</span>
                    <span className="font-semibold">{lastPunchTime}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePunchToggle}
                  className={`w-full py-5 text-sm font-bold gap-2 shadow-xs ${
                    isPunchedIn ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                >
                  <Fingerprint className="h-4 w-4" />
                  {isPunchedIn ? "Punch Out Now" : "Punch In Now"}
                </Button>
              </CardContent>
            </Card>

            {/* Attendance Overview Card */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <CardTitle className="text-base font-semibold">Attendance Log & Timesheet</CardTitle>
                  <CardDescription>Daily punch timestamps, working hours, and overtime requests</CardDescription>
                </div>
                <Button onClick={() => setApplyOvertimeModal(true)} variant="outline" size="sm" className="gap-2 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Request Overtime
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>First In</TableHead>
                        <TableHead>Last Out</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myAttendance.map((a, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-semibold text-xs">{a.date}</TableCell>
                          <TableCell className="font-mono text-xs text-emerald-600">{a.inTime}</TableCell>
                          <TableCell className="font-mono text-xs text-blue-600">{a.outTime}</TableCell>
                          <TableCell className="text-xs font-bold">{a.hours}h</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{a.punchSource}</TableCell>
                          <TableCell>
                            <Badge variant={a.status === "PRESENT" ? "default" : "secondary"}>
                              {a.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── TAB 3: LEAVE APPLICATIONS ──────────────────────────────────────────── */}
      {activeTab === "leaves" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Leave Applications & Balance Quotas</CardTitle>
              <CardDescription>Apply for annual, sick, or casual leaves and track approval stage</CardDescription>
            </div>
            <Button onClick={() => setApplyLeaveModal(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Apply Leave
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Quota cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border bg-blue-50/50 dark:bg-blue-950/20">
                <span className="text-xs text-muted-foreground block">Annual Leave Quota</span>
                <span className="text-2xl font-bold text-blue-600 mt-1 block">18 / 30</span>
                <span className="text-[11px] text-muted-foreground">12 Days taken this cycle</span>
              </div>
              <div className="p-4 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/20">
                <span className="text-xs text-muted-foreground block">Casual & Emergency</span>
                <span className="text-2xl font-bold text-emerald-600 mt-1 block">5 / 7</span>
                <span className="text-[11px] text-muted-foreground">2 Days utilized</span>
              </div>
              <div className="p-4 rounded-xl border bg-purple-50/50 dark:bg-purple-950/20">
                <span className="text-xs text-muted-foreground block">Sick / Medical Leave</span>
                <span className="text-2xl font-bold text-purple-600 mt-1 block">14 / 14</span>
                <span className="text-[11px] text-muted-foreground">Fully available</span>
              </div>
            </div>

            {/* Applications Table */}
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Total Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myLeaves.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-semibold text-xs">{l.type}</TableCell>
                      <TableCell className="text-xs">{l.start} to {l.end}</TableCell>
                      <TableCell className="text-xs font-bold">{l.days} Days</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{l.reason}</TableCell>
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
                        {l.status === "Pending" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelLeave(l.id)}
                            className="h-7 text-xs text-rose-600 hover:text-rose-700"
                          >
                            Cancel Request
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 4: CANCEL LEAVE ─────────────────────────────────────────────────── */}
      {activeTab === "cancel_leave" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-500" /> Cancel Leave Applications
              </CardTitle>
              <CardDescription>Review and cancel pending or upcoming approved leave requests</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl border bg-amber-50/50 dark:bg-amber-950/20 text-xs space-y-1 text-amber-800 dark:text-amber-300">
                <div className="font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5" /> Leave Cancellation Policy
                </div>
                <p className="text-[11px] opacity-90">
                  Pending leaves can be cancelled directly by you. For already approved leaves that have commenced, an HR cancellation ticket must be filed.
                </p>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myLeaves.filter(l => l.status !== "Cancelled").map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="font-semibold text-xs">{l.type}</TableCell>
                        <TableCell className="text-xs">{l.start} to {l.end}</TableCell>
                        <TableCell className="text-xs font-bold">{l.days} Days</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{l.reason}</TableCell>
                        <TableCell>
                          <Badge variant={l.status === "Approved" ? "default" : "outline"}>{l.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelLeave(l.id)}
                            className="h-7 text-xs gap-1"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Cancel Leave
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {myLeaves.filter(l => l.status !== "Cancelled").length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Monthly Salary Pay Slips</CardTitle>
            <CardDescription>Disbursed payslips with breakdown and download receipt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Payroll Cycle</TableHead>
                    <TableHead>Basic Salary</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Gross Earnings</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Disbursed</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Payslip PDF</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myPayslips.map((p, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-semibold text-xs">{p.month}</TableCell>
                      <TableCell className="text-xs">{p.basic.toLocaleString()} QAR</TableCell>
                      <TableCell className="text-xs text-emerald-600">+{p.allowances.toLocaleString()} QAR</TableCell>
                      <TableCell className="text-xs font-semibold">{p.gross.toLocaleString()} QAR</TableCell>
                      <TableCell className="text-xs text-rose-600">-{p.deductions.toLocaleString()} QAR</TableCell>
                      <TableCell className="text-xs font-bold text-primary">{p.net.toLocaleString()} QAR</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">{p.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.success(`Downloaded payslip for ${p.month}`)}
                          className="h-7 text-xs gap-1"
                        >
                          <Download className="h-3 w-3" /> Download PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
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
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Travel & Out-of-Pocket Claims</CardTitle>
              <CardDescription>File travel expenses, tenant entertainment, and official purchases</CardDescription>
            </div>
            <Button onClick={() => setApplyExpenseModal(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Submit Claim
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Claim Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myExpenses.map((exp) => (
                    <TableRow key={exp.id}>
                      <TableCell className="font-semibold text-xs">{exp.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{exp.type}</TableCell>
                      <TableCell className="text-xs">{exp.date}</TableCell>
                      <TableCell className="text-xs font-bold text-primary">{exp.amount} QAR</TableCell>
                      <TableCell>
                        <Badge variant={exp.status === "Approved" || exp.status === "Reimbursed" ? "default" : "outline"}>
                          {exp.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 8: APPLY LOANS & ADVANCES ──────────────────────────────────────── */}
      {activeTab === "loans" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Staff Loans & Salary Advances</CardTitle>
              <CardDescription>Apply for emergency advances and track EMI deduction schedules</CardDescription>
            </div>
            <Button onClick={() => setApplyLoanModal(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Apply for Loan
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Principal Amount</TableHead>
                    <TableHead>Monthly EMI</TableHead>
                    <TableHead>Tenure</TableHead>
                    <TableHead>Remaining Balance</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myLoans.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="font-bold text-xs">{l.amount.toLocaleString()} QAR</TableCell>
                      <TableCell className="text-xs text-rose-600 font-semibold">{l.emi.toLocaleString()} QAR/Mo</TableCell>
                      <TableCell className="text-xs">{l.tenure}</TableCell>
                      <TableCell className="text-xs font-mono">{l.remaining.toLocaleString()} QAR</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{l.reason}</TableCell>
                      <TableCell>
                        <Badge>{l.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}



      {/* ── HELP DESK & TICKETS ────────────────────────────────────────── */}
      {activeTab === "helpdesk" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Service Tickets & Grievances</CardTitle>
              <CardDescription>Submit HR requests, letter issuances, IT queries, and workplace tickets</CardDescription>
            </div>
            <Button onClick={() => setSubmitTicketModal(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Log Service Ticket
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date Logged</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myTickets.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-mono font-semibold text-xs text-primary">{t.number}</TableCell>
                      <TableCell className="text-xs font-medium">{t.subject}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{t.category}</TableCell>
                      <TableCell className="text-xs">{t.date}</TableCell>
                      <TableCell>
                        <Badge variant={t.status === "Resolved" ? "default" : "outline"}>
                          {t.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── RESIGNATION & NOTICE ───────────────────────────────────────── */}
      {activeTab === "resignation" && (
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Resignation & Notice Period Portal</CardTitle>
              <CardDescription>Formal notice submission, handover timeline, and Full & Final gratuity tracking</CardDescription>
            </div>
            <Button onClick={() => setSubmitResignationModal(true)} variant="destructive" className="gap-2">
              <LogOut className="h-4 w-4" /> Log Notice / Resignation
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl border bg-muted/20 space-y-2 text-xs">
              <h4 className="font-bold text-sm">Policy Notice Period Guidelines</h4>
              <p className="text-muted-foreground leading-relaxed">
                As per your employment contract and Qatar Labor Law, your designated notice period is <strong>30 Days</strong>.
                Upon notice submission, the Knowledge Transfer (KT) schedule and Departmental Clearances (IT, Finance, Facility)
                will be initiated automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 14: CHANGE PASSWORD ────────────────────────────────────────────── */}
      {activeTab === "change_password" && (
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Key className="h-4 w-4 text-teal-600" /> Change Account Password & Security
            </CardTitle>
            <CardDescription>Update your portal access credentials and security settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Current Password *</Label>
                <Input
                  type="password"
                  required
                  placeholder="Enter current password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">New Password *</Label>
                <Input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={passwords.new_pass}
                  onChange={(e) => setPasswords({ ...passwords, new_pass: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Confirm New Password *</Label>
                <Input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                />
              </div>

              <div className="p-3 rounded-lg border bg-muted/30 text-xs space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Two-Factor Authentication
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Two-factor authentication is active on your official company email ({employee.email}).
                </p>
              </div>

              <Button type="submit" className="w-full">
                Update Account Password
              </Button>
            </form>
          </CardContent>
        </Card>
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
