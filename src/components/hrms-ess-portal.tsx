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
    leave_type: "Annual Leave",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    reason: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    type: "Travel Expense",
    title: "",
    amount: 150,
    date: new Date().toISOString().split("T")[0],
    receipt_name: "",
    notes: "",
  });

  const [loanForm, setLoanForm] = useState({
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
    category: "HR Letters",
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
      const types = await HrmsApi.getLeaveTypes();
      setLeaveTypes(types);

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
    tax_declaration: { title: "Tax & Statutory Declaration", subtitle: "Annual tax regime declaration, HRA rent receipts, and investment proofs", icon: FileText },
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

      {/* ── TAB 6: TAX DECLARATION ─────────────────────────────────────────────── */}
      {activeTab === "tax_declaration" && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle className="text-base font-semibold">Income Tax & Statutory Declarations (FY 2026-27)</CardTitle>
                <CardDescription>Submit investment proof, housing rent receipts, and select your tax calculation regime</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Downloaded Annual Tax Computation Summary (Form 16 Preview)")}
                className="gap-1.5 text-xs"
              >
                <Download className="h-3.5 w-3.5" /> Download Tax Statement
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Regime Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setTaxRegime("Standard Regime")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    taxRegime === "Standard Regime"
                      ? "border-teal-500 bg-teal-50/30 dark:bg-teal-950/20 ring-1 ring-teal-500"
                      : "bg-card hover:bg-muted/30"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">Standard Deduction Regime</span>
                    {taxRegime === "Standard Regime" && <Check className="h-4 w-4 text-teal-600" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Automatic standard statutory deductions with simplified slab computations.
                  </p>
                </div>

                <div
                  onClick={() => setTaxRegime("Investment Proof Regime")}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    taxRegime === "Investment Proof Regime"
                      ? "border-teal-500 bg-teal-50/30 dark:bg-teal-950/20 ring-1 ring-teal-500"
                      : "bg-card hover:bg-muted/30"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm">Itemized Investment Proof Regime</span>
                    {taxRegime === "Investment Proof Regime" && <Check className="h-4 w-4 text-teal-600" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Claim deductions for HRA Rent, Life Insurance, Medical Health Policy, and Pension Fund.
                  </p>
                </div>
              </div>

              {/* Declaration Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <Label className="text-xs">Annual House Rent Paid (for HRA Exemption)</Label>
                  <Input
                    type="number"
                    value={taxDeclarations.hraRent}
                    onChange={(e) => setTaxDeclarations({ ...taxDeclarations, hraRent: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Life Insurance Premiums (80C / Statutory)</Label>
                  <Input
                    type="number"
                    value={taxDeclarations.lifeInsurance}
                    onChange={(e) => setTaxDeclarations({ ...taxDeclarations, lifeInsurance: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Medical & Family Health Insurance (80D)</Label>
                  <Input
                    type="number"
                    value={taxDeclarations.medicalInsurance}
                    onChange={(e) => setTaxDeclarations({ ...taxDeclarations, medicalInsurance: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Voluntary Pension / Retirement Fund Contribution</Label>
                  <Input
                    type="number"
                    value={taxDeclarations.npsContribution}
                    onChange={(e) => setTaxDeclarations({ ...taxDeclarations, npsContribution: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  Status: <strong className="text-emerald-600">Declaration Submitted & Verified for Payroll</strong>
                </span>
                <Button size="sm" onClick={() => toast.success("Tax declaration updated and submitted for Finance payroll audit!")}>
                  Save & Submit Declaration
                </Button>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleApplyLeave} className="space-y-4">
            <div>
              <Label>Leave Type</Label>
              <Select
                value={leaveForm.leave_type}
                onValueChange={(val) => setLeaveForm({ ...leaveForm, leave_type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                  <SelectItem value="Casual Leave">Casual & Emergency</SelectItem>
                  <SelectItem value="Sick Leave">Sick / Medical Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={leaveForm.start_date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={leaveForm.end_date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Reason for Leave *</Label>
              <Textarea
                required
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setApplyLeaveModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Apply Expense Modal */}
      <Dialog open={applyExpenseModal} onOpenChange={setApplyExpenseModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Expense Claim</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitExpense} className="space-y-4">
            <div>
              <Label>Expense Category</Label>
              <Select
                value={expenseForm.type}
                onValueChange={(val) => setExpenseForm({ ...expenseForm, type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Travel Expense">Travel & Fuel Expense</SelectItem>
                  <SelectItem value="Reimbursement Expense">Food & Client Hospitality</SelectItem>
                  <SelectItem value="Other Expense">Petty Purchases / Supplies</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Claim Title *</Label>
              <Input
                required
                placeholder="e.g. Fuel for 4 Property Inspections"
                value={expenseForm.title}
                onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount (QAR) *</Label>
                <Input
                  type="number"
                  required
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Expense Date</Label>
                <Input
                  type="date"
                  value={expenseForm.date}
                  onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Attach Receipt File</Label>
              <Input type="file" className="text-xs" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setApplyExpenseModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Claim</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Apply Loan Modal */}
      <Dialog open={applyLoanModal} onOpenChange={setApplyLoanModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Salary Advance / Loan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitLoan} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Loan Amount (QAR) *</Label>
                <Input
                  type="number"
                  required
                  value={loanForm.amount}
                  onChange={(e) => setLoanForm({ ...loanForm, amount: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Tenure (Months)</Label>
                <Input
                  type="number"
                  min={1}
                  max={24}
                  value={loanForm.tenure_months}
                  onChange={(e) => setLoanForm({ ...loanForm, tenure_months: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="p-3 rounded bg-muted/40 text-xs">
              <span className="text-muted-foreground">Calculated Monthly Recovery:</span>
              <span className="font-bold text-primary block mt-0.5">
                {Math.round(loanForm.amount / (loanForm.tenure_months || 1)).toLocaleString()} QAR / Month
              </span>
            </div>
            <div>
              <Label>Reason / Purpose *</Label>
              <Textarea
                required
                value={loanForm.reason}
                onChange={(e) => setLoanForm({ ...loanForm, reason: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setApplyLoanModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Loan Application</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Apply Overtime Modal */}
      <Dialog open={applyOvertimeModal} onOpenChange={setApplyOvertimeModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Overtime Work Request</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitOvertime} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date of Overtime</Label>
                <Input
                  type="date"
                  value={overtimeForm.date}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, date: e.target.value })}
                />
              </div>
              <div>
                <Label>Hours (e.g. 3.5)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={overtimeForm.hours}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, hours: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label>Work Scope / Justification *</Label>
              <Textarea
                required
                value={overtimeForm.reason}
                onChange={(e) => setOvertimeForm({ ...overtimeForm, reason: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setApplyOvertimeModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Overtime</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Submit Ticket Modal */}
      <Dialog open={submitTicketModal} onOpenChange={setSubmitTicketModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Help Desk / Grievance Ticket</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <Label>Category</Label>
              <Select
                value={ticketForm.category}
                onValueChange={(val) => setTicketForm({ ...ticketForm, category: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR Letters">HR & Letters</SelectItem>
                  <SelectItem value="IT Hardware">IT & Hardware</SelectItem>
                  <SelectItem value="Payroll Discrepancy">Payroll & Accounts</SelectItem>
                  <SelectItem value="Workplace Ethics">Workplace & Facility</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject *</Label>
              <Input
                required
                placeholder="e.g. Embassy NOC Letter Request"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
              />
            </div>
            <div>
              <Label>Details *</Label>
              <Textarea
                required
                rows={3}
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSubmitTicketModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Ticket</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Resignation Modal */}
      <Dialog open={submitResignationModal} onOpenChange={setSubmitResignationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Formal Notice & Resignation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitResignation} className="space-y-4">
            <div>
              <Label>Requested Last Working Day</Label>
              <Input
                type="date"
                value={resignationForm.requested_lwd}
                onChange={(e) => setResignationForm({ ...resignationForm, requested_lwd: e.target.value })}
              />
            </div>
            <div>
              <Label>Reason for Separation *</Label>
              <Textarea
                required
                rows={3}
                placeholder="State your reason for resigning..."
                value={resignationForm.reason}
                onChange={(e) => setResignationForm({ ...resignationForm, reason: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSubmitResignationModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">Submit Notice</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
